import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "selected-yamnet-labels";

export function useSoundSelection(allLabels: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    load();
  }, [allLabels]);

  const load = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        setSelected(new Set(JSON.parse(saved)));
        return;
      }

      if (allLabels.length > 0) {
        const defaults = new Set([
          "Speech",
          "Shout",
          "Screaming",
          "Vehicle horn, car horn, honking",
          "Air horn, truck horn",
        ]);

        setSelected(defaults);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const save = async (set: Set<string>) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(set))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggle = useCallback((label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }

      save(next);

      return next;
    });
  }, []);

  return {
    selected,
    toggle,
    reload: load,
  };
}