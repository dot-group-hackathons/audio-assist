import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, StatusBar, StyleSheet, Vibration, View } from "react-native";
import BackgroundService from 'react-native-background-actions';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CATALOG,
  existingLabels,
  isItemOn,
  itemForLabel,
  NAME_CALLED_ITEM,
  type CatalogItem,
} from "../lib/catalog";
import { useModelContext } from "../lib/ModelContext";
import { useWhisperContext } from "../lib/WhisperContext";
import type { Detection } from "../lib/types";
import { useClassifier } from "../lib/useClassifier";
import { useSoundSelection } from "../lib/useSoundSelection";
import { useUserName } from "../lib/useUserName";
import { useTranscriptionOptIn } from "../lib/useTranscriptionOptIn";
import { useSttEngine } from "../lib/useSttEngine";
import { matchesName } from "../lib/nameMatch";
import { colors } from "../theme";

import { useVibrationPatternsContext } from "@/lib/VibrationPatternsContext";
import AlertSheet from "../components/AlertSheet";
import BottomNav, { type Tab } from "../components/BottomNav";
import NameSetupSheet from "../components/NameSetupSheet";
import SoundDetailSheet from "../components/SoundDetailSheet";
import TranscriptionSetupSheet from "../components/TranscriptionSetupSheet";
import SettingsSheet from "../components/SettingsSheet";
import HomeScreen from "../screens/HomeScreen";
import SoundsScreen from "../screens/SoundsScreen";
import HistoryScreen from "../screens/HistoryScreen";

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// tiny.en's stock outputs on near-silence — dropped so they don't flash as captions.
const HALLUCINATIONS = new Set([
  "you", "thank you.", "thank you", "thanks for watching!", "[blank_audio]",
  "(silence)", ".", "bye.", "you're welcome.",
]);

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
    startStream,
    feed,
    stopStream,
  } = useWhisperContext();
  const { optedIn, ready: optInReady, setOptIn } = useTranscriptionOptIn();
  const { engine, choose: chooseEngine } = useSttEngine();

  const [tab, setTab] = useState<Tab>("home");
  const [running, setRunning] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [alert, setAlert] = useState<Detection | null>(null);
  const [sheetItem, setSheetItem] = useState<CatalogItem | null>(null);
  const [caption, setCaption] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  // A realtime slice of text arrived: show it as a caption and, if it contains
  // the user's name, raise a name-called alert. Common silence hallucinations
  // from tiny.en are filtered out.
  const handleText = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || HALLUCINATIONS.has(clean.toLowerCase())) return;
      setCaption(clean);
      if (name && matchesName(clean, name)) {
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
    },
    [name]
  );

  // Keep the latest handler reachable from the long-lived stream callback.
  const handleTextRef = useRef(handleText);
  useEffect(() => {
    handleTextRef.current = handleText;
  }, [handleText]);

  const transcriptionActive = running && optedIn === true && whisperReady;

  const { start, stop } = useClassifier(selected, handleResult, {
    transcriptionEnabled: transcriptionActive,
    onAudioChunk: feed,
  });

  // Once opted in, load the Whisper context (download if first time).
  useEffect(() => {
    if (optedIn === true) prepare();
  }, [optedIn, prepare]);

  // Run a realtime STT session while listening with transcription enabled.
  useEffect(() => {
    if (transcriptionActive) startStream((t) => handleTextRef.current(t));
    return () => {
      stopStream();
    };
  }, [transcriptionActive, startStream, stopStream]);

  const toggleListening = useCallback(async () => {
    if (running) {
      stop();
      // await BackgroundService.stop();
      Vibration.cancel();
      setCaption("");
    } else {
      // await BackgroundService.start(backgroundTask, backgroundOptions);
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
            name={name}
            monitoredCount={monitoredCount}
            detections={detections}
            caption={caption}
            transcribing={transcriptionActive}
            onToggle={toggleListening}
            onOpenDetection={setAlert}
            onGoHistory={() => setTab("history")}
            onOpenSettings={() => setSettingsOpen(true)}
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

      {/* After the name is captured, offer on-device transcription (once). */}
      <TranscriptionSetupSheet
        visible={optInReady && optedIn === null && !!name}
        downloading={downloading}
        progress={progress}
        onEnable={enableTranscription}
        onDecline={() => setOptIn(false)}
      />

      <SettingsSheet
        visible={settingsOpen}
        name={name}
        onSaveName={saveName}
        optedIn={optedIn}
        ready={whisperReady}
        downloading={downloading}
        progress={progress}
        onEnableTranscription={enableTranscription}
        onDisableTranscription={() => setOptIn(false)}
        engine={engine}
        onChooseEngine={chooseEngine}
        onClose={() => setSettingsOpen(false)}
      />

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
