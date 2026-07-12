import { useCallback, useRef, useState } from "react";
import { initWhisper, type WhisperContext } from "whisper.rn";
import { RealtimeTranscriber } from "whisper.rn/realtime-transcription";
import type {
  AudioStreamConfig,
  AudioStreamData,
  AudioStreamInterface,
  RealtimeTranscribeEvent,
} from "whisper.rn/realtime-transcription";
import { downloadModel, modelExists, modelPath } from "./whisperModel";

// Audio adapter fed by our existing LiveAudioStream instead of opening its own
// mic — keeps a single mic owner (YAMNet) while the transcriber pulls PCM here.
class FedAudioStream implements AudioStreamInterface {
  private recording = false;
  private dataCb?: (d: AudioStreamData) => void;
  private statusCb?: (b: boolean) => void;

  async initialize(_config: AudioStreamConfig) {}
  async start() { this.recording = true; this.statusCb?.(true); }
  async stop() { this.recording = false; this.statusCb?.(false); }
  isRecording() { return this.recording; }
  onData(cb: (d: AudioStreamData) => void) { this.dataCb = cb; }
  onError(_cb: (e: string) => void) {}
  onStatusChange(cb: (b: boolean) => void) { this.statusCb = cb; }
  onEnd(_cb: () => void) {}
  async release() { this.recording = false; }

  // Relay one chunk of 16-bit PCM bytes captured elsewhere.
  push(bytes: Uint8Array) {
    if (this.recording && this.dataCb) {
      this.dataCb({ data: bytes, sampleRate: 16000, channels: 1, timestamp: Date.now() });
    }
  }
}

// On-device realtime STT (whisper.rn). Model init is lazy (prepare, post opt-in);
// a stream is started/stopped around listening and fed mic chunks via feed().
export function useWhisper() {
  const ctxRef = useRef<WhisperContext | null>(null);
  const transcriberRef = useRef<RealtimeTranscriber | null>(null);
  const adapterRef = useRef<FedAudioStream | null>(null);
  const [ready, setReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Download the model if missing, then init the context. Idempotent.
  const prepare = useCallback(async (): Promise<boolean> => {
    if (ctxRef.current) return true;
    try {
      if (!(await modelExists())) {
        setDownloading(true);
        await downloadModel(setProgress);
        setDownloading(false);
      }
      ctxRef.current = await initWhisper({ filePath: modelPath() });
      setReady(true);
      return true;
    } catch (e) {
      console.error("Whisper init failed:", e);
      setDownloading(false);
      return false;
    }
  }, []);

  // Begin a realtime session. onText fires per finished slice with its text.
  const startStream = useCallback(async (onText: (text: string) => void) => {
    const ctx = ctxRef.current;
    if (!ctx || transcriberRef.current) return;

    const adapter = new FedAudioStream();
    adapterRef.current = adapter;

    const transcriber = new RealtimeTranscriber(
      { whisperContext: ctx, audioStream: adapter },
      {
        audioSliceSec: 3,
        audioMinSec: 1,
        transcribeOptions: { language: "en" },
      },
      {
        onTranscribe: (e: RealtimeTranscribeEvent) => {
          const text = e.data?.result?.trim();
          if (text) onText(text);
        },
        onError: (err: string) => console.error("Whisper realtime:", err),
      }
    );
    transcriberRef.current = transcriber;
    await transcriber.start();
  }, []);

  // Relay a mono 16 kHz Float32 chunk to the active session (no-op if stopped).
  const feed = useCallback((pcm: Float32Array) => {
    const adapter = adapterRef.current;
    if (!adapter) return;
    const bytes = new Uint8Array(pcm.length * 2);
    const view = new DataView(bytes.buffer);
    for (let i = 0; i < pcm.length; i++) {
      const s = Math.max(-1, Math.min(1, pcm[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    adapter.push(bytes);
  }, []);

  const stopStream = useCallback(async () => {
    const t = transcriberRef.current;
    transcriberRef.current = null;
    adapterRef.current = null;
    if (t) {
      try {
        await t.stop();
        await t.release();
      } catch (e) {
        console.error("Whisper stop failed:", e);
      }
    }
  }, []);

  return { ready, downloading, progress, prepare, startStream, feed, stopStream };
}
