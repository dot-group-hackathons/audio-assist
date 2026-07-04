import * as base64js from 'base64-js';
import { useCallback, useRef, useEffect } from 'react';
import LiveAudioStream from 'react-native-live-audio-stream';
import { PermissionsAndroid, Platform } from "react-native";
import { useModelContext } from './ModelContext';

const WINDOW_SIZE = 15600;
const MIN_SCORE = 0.30;

async function requestMicPermission() {
  if (Platform.OS !== "android") return true;

  const res = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
  );

  return res === PermissionsAndroid.RESULTS.GRANTED;
}

export function useClassifier(
  selectedLabels: Set<string>,
  onResult: (label: string, score: number) => void
) {
  const { ready, classify } = useModelContext();
  const bufferRef = useRef<number[]>([]);
  const selectedLabelsRef = useRef(selectedLabels);

  useEffect(() => {
    selectedLabelsRef.current = selectedLabels;
  }, [selectedLabels]);

  const start = useCallback(async() => {
    if (!ready) return;

    const granted = await requestMicPermission();
    if (!granted) return;

    bufferRef.current = [];

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

      for (let i = 0; i + 1 < bytes.length; i += 2) {
        const sample = view.getInt16(i, true);
        bufferRef.current.push(sample / 32768);
      }

      if (bufferRef.current.length >= WINDOW_SIZE) {
        const window = new Float32Array(bufferRef.current.slice(0, WINDOW_SIZE));
        bufferRef.current = bufferRef.current.slice(WINDOW_SIZE);
        const prediction = classify(window);
        if (!prediction) return;
        let bestLabel = "";
        let bestScore = -Infinity;
        for (let i = 0; i < prediction.scores.length; i++) {
          const label = prediction.labels[i];
          if (!selectedLabelsRef.current.has(label)) continue;
          const score = prediction.scores[i];
          if (score > bestScore) {
            bestScore = score;
            bestLabel = label;
          }
        }
        if (bestScore >= MIN_SCORE) {
          onResult(bestLabel, bestScore);
        }
      }
    });

    LiveAudioStream.start();
  }, [ready, classify, onResult, selectedLabels]);

  const stop = useCallback(() => LiveAudioStream.stop(), []);

  return { start, stop, ready };
}