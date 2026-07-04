import { useEffect, useRef, useState } from 'react';
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';
import { Asset } from "expo-asset";

export interface ClassificationResult {
  scores: Float32Array;
  labels: string[];
}

export function useModel() {
  const modelRef = useRef<TensorflowModel | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
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

        setLabels(csvText
          .split("\n")
          .slice(1)
          .map((line: string) => {
            //strip the first two columns (index and mid) and return the rest as the label
            let name = line.split(",").slice(2).join(",").trim();
            if (name.startsWith('"') && name.endsWith('"')) {
              name = name.slice(1, -1).replace(/""/g, '"');
            }
            return name;
          })
          .filter(Boolean)
        )
        setReady(true);
      } catch (e) {
        console.error("Model load failed:", e);
      }
    })();
  }, []);

  function classify(waveform: Float32Array) {
    if (!modelRef.current) return null;
    const outputs = modelRef.current.runSync([waveform.buffer as ArrayBuffer]);
    return {
      scores: new Float32Array(outputs[0]),
      labels,
    };
  }

  return { ready, classify, labels: labels, };
}