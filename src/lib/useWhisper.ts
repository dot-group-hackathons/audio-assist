import { useCallback, useRef, useState } from "react";
import { initWhisper, type WhisperContext } from "whisper.rn";
import { downloadModel, modelExists, modelPath } from "./whisperModel";

// On-device speech-to-text (whisper.rn). Like useModel, but initialized lazily
// via prepare() only after the user opts in.
export function useWhisper() {
  const ctxRef = useRef<WhisperContext | null>(null);
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

  // Transcribe a mono 16 kHz Float32 window to text. "" if not ready / on error.
  const transcribe = useCallback(
    async (pcm: Float32Array): Promise<string> => {
      const ctx = ctxRef.current;
      if (!ctx) return "";

      // whisper.rn's transcribeData takes a raw 16-bit PCM ArrayBuffer.
      const int16 = new Int16Array(pcm.length);
      for (let i = 0; i < pcm.length; i++) {
        const s = Math.max(-1, Math.min(1, pcm[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      try {
        const { promise } = ctx.transcribeData(int16.buffer, {
          language: "en",
          maxThreads: 4,
        });
        const { result } = await promise;
        return (result ?? "").trim();
      } catch (e) {
        console.error("Transcribe failed:", e);
        return "";
      }
    },
    []
  );

  return { ready, downloading, progress, prepare, transcribe };
}
