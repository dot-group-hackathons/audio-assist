import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StatusBar, StyleSheet, Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useModelContext } from "../lib/ModelContext";
import { useWhisperContext } from "../lib/WhisperContext";
import { useSoundSelection } from "../lib/useSoundSelection";
import { useUserName } from "../lib/useUserName";
import { useTranscriptionOptIn } from "../lib/useTranscriptionOptIn";
import { useClassifier } from "../lib/useClassifier";
import { matchesName } from "../lib/nameMatch";
import {
  CATALOG,
  existingLabels,
  isItemOn,
  itemForLabel,
  NAME_CALLED_ITEM,
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
import NameSetupSheet from "../components/NameSetupSheet";
import TranscriptionSetupSheet from "../components/TranscriptionSetupSheet";

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function App() {
  const insets = useSafeAreaInsets();
  const { ready, labels } = useModelContext();
  const { selected, setMany } = useSoundSelection(labels);
  const { name, ready: nameReady, saveName } = useUserName();
  const {
    ready: whisperReady,
    downloading,
    progress,
    prepare,
    transcribe,
  } = useWhisperContext();
  const { optedIn, ready: optInReady, setOptIn } = useTranscriptionOptIn();

  const [tab, setTab] = useState<Tab>("home");
  const [running, setRunning] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [alert, setAlert] = useState<Detection | null>(null);
  const [sheetItem, setSheetItem] = useState<CatalogItem | null>(null);
  const [caption, setCaption] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const busyRef = useRef(false);

  // A monitored sound was heard: log it, buzz, and raise the alert sheet.
  const handleResult = useCallback((label: string, score: number) => {
    const item = itemForLabel(label);
    if (!item) return; // model fired a class outside our curated catalog
    const det: Detection = { id: makeId(), item, score, at: Date.now() };
    setDetections((prev) => [det, ...prev].slice(0, 100));
    Vibration.vibrate(item.pat);
    setAlert(det);
  }, []);

  // Transcribe buffered speech, show captions, and alert if the name was called.
  const handleSpeech = useCallback(
    async (pcm: Float32Array) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setTranscribing(true);
      try {
        const text = await transcribe(pcm);
        if (text) {
          setCaption(text);
          if (name && matchesName(text, name)) {
            const det: Detection = {
              id: makeId(),
              item: NAME_CALLED_ITEM,
              score: 1,
              at: Date.now(),
            };
            setDetections((prev) => [det, ...prev].slice(0, 100));
            Vibration.vibrate(NAME_CALLED_ITEM.pat);
            setAlert(det);
          }
        }
      } finally {
        busyRef.current = false;
        setTranscribing(false);
      }
    },
    [transcribe, name]
  );

  const { start, stop } = useClassifier(selected, handleResult, {
    transcriptionEnabled: optedIn === true && whisperReady,
    onSpeechSegment: handleSpeech,
  });

  // Once opted in, load the Whisper context (download if first time).
  useEffect(() => {
    if (optedIn === true) prepare();
  }, [optedIn, prepare]);

  const toggleListening = useCallback(() => {
    if (running) {
      stop();
      Vibration.cancel();
      setCaption("");
    } else {
      start();
    }
    setRunning((r) => !r);
  }, [running, start, stop]);

  // Enable from the first-run sheet: download + init, then persist the choice.
  const enableTranscription = useCallback(async () => {
    const ok = await prepare();
    setOptIn(ok);
  }, [prepare, setOptIn]);

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
            caption={caption}
            transcribing={transcribing}
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

      <BottomNav
        active={tab}
        onSelect={setTab}
        running={running}
        onToggleListening={toggleListening}
        bottomInset={insets.bottom}
      />

      <NameSetupSheet visible={nameReady && !name} onSubmit={saveName} />

      {/* After the name is captured, offer on-device transcription (once). */}
      <TranscriptionSetupSheet
        visible={optInReady && optedIn === null && !!name}
        downloading={downloading}
        progress={progress}
        onEnable={enableTranscription}
        onDecline={() => setOptIn(false)}
      />

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
