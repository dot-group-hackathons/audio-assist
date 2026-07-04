import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultSelection } from "./catalog";

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

      // First launch: enable every default-on catalog sound (all of them),
      // restricted to labels the loaded model actually provides.
      if (allLabels.length > 0) {
        setSelected(defaultSelection(allLabels));
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

  // Add or remove a batch of labels in one persisted write. Used when a single
  // curated sound in the UI maps to several underlying YAMNet labels.
  const setMany = useCallback((labels: string[], on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);

      for (const label of labels) {
        if (on) next.add(label);
        else next.delete(label);
      }

      save(next);

      return next;
    });
  }, []);

  return {
    selected,
    toggle,
    setMany,
    reload: load,
  };
}