import * as base64js from 'base64-js';
import { useCallback, useRef, useEffect } from 'react';
import LiveAudioStream from 'react-native-live-audio-stream';
import { PermissionsAndroid, Platform } from "react-native";
import { isSpeechLabel, minPeakForLabel, minScoreForLabel } from './catalog';
import { useModelContext } from './ModelContext';

const WINDOW_SIZE = 15600;
const HOP_SIZE = WINDOW_SIZE >> 1; // 50% overlap so brief transients (knocks) aren't split across windows
const MIN_SCORE = 0.20; // default bar; per-item minScore can override (e.g. knock)

// On speech, hand Whisper the last SEGMENT_SAMPLES; cooldown avoids re-transcribing.
const SEGMENT_SAMPLES = 16000 * 6; // ~6 s at 16 kHz
const SPEECH_COOLDOWN_MS = 4000;

// Normalize each window toward TARGET_PEAK (lifts quiet/distant sounds, never
// clips). Skip windows below GAIN_FLOOR; MAX_GAIN caps the boost.
const TARGET_PEAK = 0.9;
const GAIN_FLOOR = 0.05;
const MAX_GAIN = 6;

async function requestMicPermission() {
  if (Platform.OS === "android") {
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );

    return res === PermissionsAndroid.RESULTS.GRANTED;
  }

  // iOS: lazy require so Android never loads the (absent) native module.
  const { check, PERMISSIONS, request, RESULTS } = require("react-native-permissions");
  const permission = PERMISSIONS.IOS.MICROPHONE;
  const status = await check(permission);

  if (status === RESULTS.GRANTED) return true;
  if (status === RESULTS.DENIED) {
    const result = await request(permission);
    return result === RESULTS.GRANTED;
  }

  return false;
}

export function useClassifier(
  selectedLabels: Set<string>,
  onResult: (label: string, score: number) => void,
  opts?: {
    transcriptionEnabled?: boolean;
    onSpeechSegment?: (pcm: Float32Array) => void;
  }
) {
  const { ready, classify } = useModelContext();
  const bufferRef = useRef<number[]>([]);
  const selectedLabelsRef = useRef(selectedLabels);

  // Transcription state via refs so the mic closure sees current values live.
  const speechBufferRef = useRef<number[]>([]);
  const lastSpeechAtRef = useRef(0);
  const transcriptionRef = useRef(opts?.transcriptionEnabled ?? false);
  const onSpeechRef = useRef(opts?.onSpeechSegment);

  useEffect(() => {
    selectedLabelsRef.current = selectedLabels;
  }, [selectedLabels]);

  useEffect(() => {
    transcriptionRef.current = opts?.transcriptionEnabled ?? false;
    onSpeechRef.current = opts?.onSpeechSegment;
  }, [opts?.transcriptionEnabled, opts?.onSpeechSegment]);

  const start = useCallback(async() => {
    if (!ready) return;

    const granted = await requestMicPermission();
    if (!granted) return;

    bufferRef.current = [];
    speechBufferRef.current = [];
    lastSpeechAtRef.current = 0;

    LiveAudioStream.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6, 
      bufferSize: 4096,
      wavFile: 'temp.wav',
    });

    LiveAudioStream.on('data', (base64Chunk: string) => {
      const bytes = base64js.toByteArray(base64Chunk);
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

      const transcribing = transcriptionRef.current;
      for (let i = 0; i + 1 < bytes.length; i += 2) {
        const sample = view.getInt16(i, true) / 32768;
        bufferRef.current.push(sample);
        if (transcribing) speechBufferRef.current.push(sample);
      }

      // Keep only the last ~6 s of raw audio for a possible transcription.
      if (transcribing && speechBufferRef.current.length > SEGMENT_SAMPLES) {
        speechBufferRef.current.splice(
          0,
          speechBufferRef.current.length - SEGMENT_SAMPLES
        );
      }

      // Overlapping windows: advance by HOP_SIZE, not WINDOW_SIZE.
      while (bufferRef.current.length >= WINDOW_SIZE) {
        const window = new Float32Array(bufferRef.current.slice(0, WINDOW_SIZE));
        bufferRef.current = bufferRef.current.slice(HOP_SIZE);

        // Raw peak (before gain) — true loudness for the speech gate below.
        let peak = 0;
        for (let k = 0; k < window.length; k++) {
          const a = Math.abs(window[k]);
          if (a > peak) peak = a;
        }

        if (peak >= GAIN_FLOOR) {
          const gain = Math.min(TARGET_PEAK / peak, MAX_GAIN);
          for (let k = 0; k < window.length; k++) window[k] *= gain;
        }

        const prediction = classify(window);
        if (!prediction) continue;
        let bestLabel = "";
        let bestScore = -Infinity;
        for (let i = 0; i < prediction.scores.length; i++) {
          const label = prediction.labels[i];
          if (!selectedLabelsRef.current.has(label)) continue;
          if (peak < minPeakForLabel(label)) continue; // loudness gate (speech)
          const score = prediction.scores[i];
          if (score < (minScoreForLabel(label) ?? MIN_SCORE)) continue; // per-label bar
          if (score > bestScore) {
            bestScore = score;
            bestLabel = label;
          }
        }
        if (bestLabel) {
          onResult(bestLabel, bestScore);

          // Speech + opted in: hand the rolling buffer to Whisper (rate-limited).
          if (transcribing && onSpeechRef.current && isSpeechLabel(bestLabel)) {
            const now = Date.now();
            if (
              now - lastSpeechAtRef.current >= SPEECH_COOLDOWN_MS &&
              speechBufferRef.current.length >= 16000
            ) {
              lastSpeechAtRef.current = now;
              onSpeechRef.current(new Float32Array(speechBufferRef.current));
            }
          }
        }
      }
    });

    LiveAudioStream.start();
  }, [ready, classify, onResult, selectedLabels]);

  const stop = useCallback(() => LiveAudioStream.stop(), []);

  return { start, stop, ready };
}