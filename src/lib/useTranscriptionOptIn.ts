import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "transcription-opt-in";

// On-device transcription opt-in: `null` until the first-run prompt is answered.
export function useTranscriptionOptIn() {
  const [optedIn, setOptedIn] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY);
        if (v !== null) setOptedIn(v === "1");
      } catch (err) {
        console.error(err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setOptIn = useCallback(async (value: boolean) => {
    setOptedIn(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch (err) {
      console.error(err);
    }
  }, []);

  return { optedIn, ready, setOptIn };
}
