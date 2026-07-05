import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import type { CatalogItem } from "./catalog";

const STORAGE_KEY = "custom-vibration-patterns";

export function useVibrationPatterns() {
  const [overrides, setOverrides] = useState<Record<string, number[]>>({});

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setOverrides(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const patternFor = useCallback(
    (item: CatalogItem) => overrides[item.id] ?? item.pat,
    [overrides]
  );

  const setPattern = useCallback(async (itemId: string, pattern: number[]) => {
    setOverrides((prev) => {
      const next = { ...prev, [itemId]: pattern };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(console.error);
      return next;
    });
  }, []);

  const resetPattern = useCallback(async (itemId: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[itemId];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(console.error);
      return next;
    });
  }, []);

  return { patternFor, setPattern, resetPattern };
}