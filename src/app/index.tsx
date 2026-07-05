import { useCallback, useMemo, useState } from "react";
import { Platform, StatusBar, StyleSheet, Vibration, View } from "react-native";
import BackgroundService from 'react-native-background-actions';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CATALOG,
  existingLabels,
  isItemOn,
  itemForLabel,
  type CatalogItem,
} from "../lib/catalog";
import { useModelContext } from "../lib/ModelContext";
import type { Detection } from "../lib/types";
import { useClassifier } from "../lib/useClassifier";
import { useSoundSelection } from "../lib/useSoundSelection";
import { useUserName } from "../lib/useUserName";
import { colors } from "../theme";

import { useVibrationPatternsContext } from "@/lib/VibrationPatternsContext";
import AlertSheet from "../components/AlertSheet";
import BottomNav, { type Tab } from "../components/BottomNav";
import NameSetupSheet from "../components/NameSetupSheet";
import SoundDetailSheet from "../components/SoundDetailSheet";
import HomeScreen from "../screens/HomeScreen";
import SoundsScreen from "../screens/SoundsScreen";

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function App() {
  const insets = useSafeAreaInsets();
  const { ready, labels } = useModelContext();
  const { selected, setMany } = useSoundSelection(labels);
  const { name, ready: nameReady, saveName } = useUserName();

  const [tab, setTab] = useState<Tab>("home");
  const [running, setRunning] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [alert, setAlert] = useState<Detection | null>(null);
  const [sheetItem, setSheetItem] = useState<CatalogItem | null>(null);

  const backgroundOptions = {
    taskName: 'AudioAssist',
    taskTitle: 'Listening for sounds',
    taskDesc: 'Monitoring for alerts',
    taskIcon: { name: 'ic_launcher', type: 'mipmap' },
    color: '#ff00ff',
    linkingURI: 'audioassist://',
  };

  async function backgroundTask() {
    await new Promise(async (resolve) => {
      while (BackgroundService.isRunning()) {
        await new Promise((r) => setTimeout(r, 1000));
      }
      resolve(null);
    });
  }

  const { patternFor, setPattern, resetPattern } = useVibrationPatternsContext();

  const handleResult = useCallback((label: string, score: number) => {
    const item = itemForLabel(label);
    if (!item) return; // model fired a class outside our curated catalog
    
    const det: Detection = { id: makeId(), item, score, at: Date.now() };
    setDetections((prev) => [det, ...prev].slice(0, 100));
     
    let pat = patternFor(item);
    if (Platform.OS === "android") {
      pat = [0, ...pat];
    }

    Vibration.vibrate(pat);

    setAlert(det);

  }, [patternFor]);

  const { start, stop } = useClassifier(selected, handleResult);

  const toggleListening = useCallback(async () => {
    if (running) {
      stop();
      // await BackgroundService.stop();
      Vibration.cancel();
    } else {
      // await BackgroundService.start(backgroundTask, backgroundOptions);
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
      </View>

      <BottomNav
        active={tab}
        onSelect={setTab}
        running={running}
        onToggleListening={toggleListening}
        bottomInset={insets.bottom}
      />

      <NameSetupSheet visible={nameReady && !name} onSubmit={saveName} />

      <AlertSheet detection={alert} onClose={() => setAlert(null)} />
      <SoundDetailSheet
        item={sheetItem}
        on={sheetItem ? isItemOn(sheetItem, selected) : false}
        onToggle={(on) => sheetItem && toggleItem(sheetItem, on)}
        onClose={() => setSheetItem(null)}
        patternFor={patternFor}
        onSetPattern={setPattern}
        onResetPattern={resetPattern}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  screen: { flex: 1 },
});
