import { useEffect, useRef, useState } from 'react';
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';
import { Asset } from "expo-asset";

export function useModel() {
  const modelRef = useRef<TensorflowModel | null>(null);
  const labelsRef = useRef<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        modelRef.current = await loadTensorflowModel(
          require("../../assets/yamnet.tflite"),
          []
        );

        const asset = Asset.fromModule(
          require("../../assets/yamnet_class_map.csv")
        );

        await asset.downloadAsync();

        const response = await fetch(asset.uri);
        const csvText = await response.text();

        if (!csvText) {
          throw new Error("Failed to load YAMNet CSV");
        }

        labelsRef.current = csvText
          .split("\n")
          .slice(1)
          .map((line: string) => {
            const cols = line.split(",");
            return cols.slice(2).join(",").trim(); 
          })
          .filter(Boolean);

        setReady(true);
      } catch (e) {
        console.error("Model load failed:", e);
      }
    })();
  }, []);

  function classify(waveform: Float32Array) {
    if (!modelRef.current) return null;
    const outputs = modelRef.current.runSync([waveform.buffer as ArrayBuffer]);
    const scores = new Float32Array(outputs[0]);
    let best = 0;
    for (let i = 1; i < scores.length; i++) if (scores[i] > scores[best]) best = i;
    return { label: labelsRef.current[best], score: scores[best] };
  }

  return { ready, classify };
}