import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AudioEventType } from "../core/events";
import { Logger } from "../core/logger";
import { BackgroundService } from "../core/backgroundService";
import { createRNPlatform, RNPlatform } from "../platform-rn";

interface LogLine {
  id: string;
  kind: "alert" | "log";
  text: string;
}

const SIM_BUTTONS: { label: string; type: AudioEventType }[] = [
  { label: "🔔 Doorbell", type: AudioEventType.Doorbell },
  { label: "🚨 Smoke alarm", type: AudioEventType.SmokeAlarm },
  { label: "🗣️ Your name", type: AudioEventType.NameCalled },
  { label: "📞 Phone", type: AudioEventType.PhoneRinging },
];

export default function App() {
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<LogLine[]>([]);

  const append = useCallback((kind: LogLine["kind"], text: string) => {
    setLines((prev) =>
      [
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, kind, text },
        ...prev,
      ].slice(0, 60),
    );
  }, []);

  // Build the platform + service exactly once.
  const ref = useRef<{ platform: RNPlatform; service: BackgroundService } | null>(
    null,
  );
  if (ref.current === null) {
    const logger = new Logger("audio-assist", "debug", (level, scope, message) =>
      append("log", `${scope} — ${message}`),
    );
    const platform = createRNPlatform(logger, { randomIntervalMs: 0 });
    platform.notifier.onNotification((n) => append("alert", n.title));
    ref.current = { platform, service: new BackgroundService(platform, logger) };
  }

  useEffect(() => {
    return () => {
      void ref.current?.service.stop();
    };
  }, []);

  const toggle = useCallback(async () => {
    const { service } = ref.current!;
    if (service.isRunning()) {
      await service.stop();
      setRunning(false);
    } else {
      await service.start();
      setRunning(true);
    }
  }, []);

  const simulate = useCallback((type: AudioEventType) => {
    ref.current!.platform.audioSource.simulate(type);
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>audio-assist</Text>
      <Text style={styles.subtitle}>
        Background listener that alerts you with a vibration. Base build — every
        sound uses the same buzz.
      </Text>

      <Pressable
        onPress={toggle}
        style={[styles.toggle, running ? styles.toggleOn : styles.toggleOff]}
      >
        <Text style={styles.toggleText}>
          {running ? "● Listening — tap to stop" : "○ Stopped — tap to start"}
        </Text>
      </Pressable>

      <Text style={styles.sectionLabel}>Simulate a sound</Text>
      <View style={styles.simRow}>
        {SIM_BUTTONS.map((b) => (
          <Pressable
            key={b.type}
            onPress={() => simulate(b.type)}
            disabled={!running}
            style={[styles.simBtn, !running && styles.simBtnDisabled]}
          >
            <Text style={styles.simBtnText}>{b.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Activity</Text>
      <ScrollView style={styles.log} contentContainerStyle={styles.logContent}>
        {lines.length === 0 ? (
          <Text style={styles.empty}>No activity yet.</Text>
        ) : (
          lines.map((l) => (
            <Text
              key={l.id}
              style={[styles.logLine, l.kind === "alert" && styles.logAlert]}
            >
              {l.kind === "alert" ? "📳 " : "· "}
              {l.text}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0d1117", paddingTop: 64, paddingHorizontal: 20 },
  title: { color: "#f0f6fc", fontSize: 28, fontWeight: "700" },
  subtitle: { color: "#8b949e", fontSize: 14, marginTop: 6, marginBottom: 20 },
  toggle: { borderRadius: 12, paddingVertical: 18, alignItems: "center" },
  toggleOn: { backgroundColor: "#238636" },
  toggleOff: { backgroundColor: "#21262d", borderWidth: 1, borderColor: "#30363d" },
  toggleText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  sectionLabel: {
    color: "#8b949e",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 10,
  },
  simRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  simBtn: {
    backgroundColor: "#1f6feb",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  simBtnDisabled: { backgroundColor: "#21262d", opacity: 0.6 },
  simBtnText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  log: { flex: 1, marginTop: 4, marginBottom: 20 },
  logContent: { paddingBottom: 20 },
  empty: { color: "#484f58", fontStyle: "italic", marginTop: 8 },
  logLine: { color: "#8b949e", fontSize: 12, fontFamily: "monospace", marginVertical: 2 },
  logAlert: { color: "#58a6ff", fontWeight: "600" },
});
