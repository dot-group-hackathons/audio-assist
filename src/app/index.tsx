import { useState, useCallback } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useClassifier } from "../lib/useClassifier";
import { useModelContext } from "../lib/ModelContext";
import { useSoundSelection } from "../lib/useSoundSelection";
import { useFocusEffect } from "expo-router";
import { router } from "expo-router";

interface LogLine {
  id: string;
  kind: "alert" | "log";
  text: string;
}

export default function App() {
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<LogLine[]>([]);
  const { labels } = useModelContext();
  const { selected, reload } = useSoundSelection(labels);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [])
  );

  const { start, stop, ready } = useClassifier(selected, (label, score) => {
    setLines((prev) => [...prev, { id: Date.now().toString(), kind: 'log', text: `${label} (${score.toFixed(2)})` }]);
  });

  const toggle = () => {
    if (running) stop(); else start();
    setRunning(!running);
  };


  return (
    <View style={styles.screen}>
      <Text style={styles.title}>audio-assist</Text>
      <Text style={styles.subtitle}>
        Background listener that alerts you with a vibration. Base build — every
        sound uses the same buzz.
      </Text>

      <Pressable
          onPress={() => router.push("/settings")}
          style={{
              backgroundColor: "#1f6feb",
              padding: 12,
              borderRadius: 8,
          }}
      >
          <Text style={{ color: "white" }}>
              Select Sounds
          </Text>
      </Pressable>

      <Pressable
        onPress={toggle}
        style={[styles.toggle, running ? styles.toggleOn : styles.toggleOff]}
      >
        <Text style={styles.toggleText}>
          {running ? "● Listening — tap to stop" : "○ Stopped — tap to start"}
        </Text>
      </Pressable>

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
