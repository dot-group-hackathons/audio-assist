import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_ENGINE, engineMeta, type SttEngineId } from "./sttEngine";

const STORAGE_KEY = "stt-engine";

// Persisted choice of speech-to-text engine. Falls back to the default when
// unset or when a stored engine is no longer available.
export function useSttEngine() {
  const [engine, setEngine] = useState<SttEngineId>(DEFAULT_ENGINE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const v = (await AsyncStorage.getItem(STORAGE_KEY)) as SttEngineId | null;
        if (v && engineMeta(v).available) setEngine(v);
      } catch (err) {
        console.error(err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const choose = useCallback(async (id: SttEngineId) => {
    if (!engineMeta(id).available) return;
    setEngine(id);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, id);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return { engine, ready, choose };
}
