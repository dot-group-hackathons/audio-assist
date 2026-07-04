import { useCallback, useMemo, useState } from "react";
import { StatusBar, StyleSheet, Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useModelContext } from "../lib/ModelContext";
import { useSoundSelection } from "../lib/useSoundSelection";
import { useClassifier } from "../lib/useClassifier";
import {
  CATALOG,
  existingLabels,
  isItemOn,
  itemForLabel,
  type CatalogItem,
} from "../lib/catalog";
import type { Detection } from "../lib/types";
import { colors } from "../theme";

import HomeScreen from "../screens/HomeScreen";
import SoundsScreen from "../screens/SoundsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import WatchScreen from "../screens/WatchScreen";
import BottomNav, { type Tab } from "../components/BottomNav";
import AlertSheet from "../components/AlertSheet";
import SoundDetailSheet from "../components/SoundDetailSheet";

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function App() {
  const insets = useSafeAreaInsets();
  const { ready, labels } = useModelContext();
  const { selected, setMany } = useSoundSelection(labels);

  const [tab, setTab] = useState<Tab>("home");
  const [running, setRunning] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [alert, setAlert] = useState<Detection | null>(null);
  const [sheetItem, setSheetItem] = useState<CatalogItem | null>(null);

  // A monitored sound was heard: log it, buzz, and raise the alert sheet.
  const handleResult = useCallback((label: string, score: number) => {
    const item = itemForLabel(label);
    if (!item) return; // model fired a class outside our curated catalog
    const det: Detection = { id: makeId(), item, score, at: Date.now() };
    setDetections((prev) => [det, ...prev].slice(0, 100));
    Vibration.vibrate(item.pat);
    setAlert(det);
  }, []);

  const { start, stop } = useClassifier(selected, handleResult);

  const toggleListening = useCallback(() => {
    if (running) {
      stop();
      Vibration.cancel();
    } else {
      start();
    }
    setRunning((r) => !r);
  }, [running, start, stop]);

  const monitoredCount = useMemo(
    () => CATALOG.filter((c) => isItemOn(c, selected)).length,
    [selected]
  );

  const toggleItem = useCallback(
    (item: CatalogItem, on: boolean) => {
      setMany(existingLabels(item, labels), on);
    },
    [labels, setMany]
  );

  // Simulate button (center FAB): fire a random enabled sound for a live demo.
  const simulate = useCallback(() => {
    const enabled = CATALOG.filter((c) => isItemOn(c, selected));
    const pool = enabled.length ? enabled : CATALOG;
    const item = pool[Math.floor(Math.random() * pool.length)];
    const det: Detection = { id: makeId(), item, score: 0.9, at: Date.now() };
    setDetections((prev) => [det, ...prev].slice(0, 100));
    Vibration.vibrate(item.pat);
    setAlert(det);
  }, [selected]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.screen}>
        {tab === "home" && (
          <HomeScreen
            running={running}
            ready={ready}
            monitoredCount={monitoredCount}
            detections={detections}
            onToggle={toggleListening}
            onOpenDetection={setAlert}
            onGoHistory={() => setTab("history")}
          />
        )}
        {tab === "sounds" && (
          <SoundsScreen selected={selected} onToggleItem={toggleItem} onOpenItem={setSheetItem} />
        )}
        {tab === "history" && (
          <HistoryScreen detections={detections} onOpenDetection={setAlert} />
        )}
        {tab === "watch" && <WatchScreen />}
      </View>

      <BottomNav active={tab} onSelect={setTab} onSimulate={simulate} bottomInset={insets.bottom} />

      <AlertSheet detection={alert} onClose={() => setAlert(null)} />
      <SoundDetailSheet
        item={sheetItem}
        on={sheetItem ? isItemOn(sheetItem, selected) : false}
        onToggle={(on) => sheetItem && toggleItem(sheetItem, on)}
        onClose={() => setSheetItem(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  screen: { flex: 1 },
});
