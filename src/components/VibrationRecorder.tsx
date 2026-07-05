import { useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, Vibration, View } from "react-native";
import { colors } from "../theme";

interface Props {
  initialPattern: number[];
  onSave: (pattern: number[]) => void;
  onReset: () => void;
}

export default function VibrationRecorder({ initialPattern, onSave, onReset }: Props) {
  const [pattern, setPattern] = useState<number[]>(initialPattern);
  const [recording, setRecording] = useState(false);
  const pressStart = useRef<number | null>(null);
  const lastRelease = useRef<number | null>(null);
  const draft = useRef<number[]>([]);

  const startRecording = () => {
    draft.current = [];
    lastRelease.current = null;
    setRecording(true);
  };

  const onPressIn = () => {
    if (!recording) return;
    const now = Date.now();
    if (lastRelease.current !== null) {
      draft.current.push(now - lastRelease.current);
    }
    pressStart.current = now;
  };

  const onPressOut = () => {
    if (!recording || pressStart.current === null) return;
    const now = Date.now();
    draft.current.push(now - pressStart.current);
    lastRelease.current = now;
    pressStart.current = null;
  };

  const finishRecording = () => {
    setRecording(false);
    if (draft.current.length > 0) {
      setPattern(draft.current);
      onSave(draft.current);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={() => {
                let pat = pattern;
                if (Platform.OS === "android") {
                  pat = [0, ...pat];
                }
            
                Vibration.vibrate(pat);
          }}>

          <Text style={styles.btnText}>▶ Test</Text>
        </Pressable>
      </View>

      {!recording ? (
        <Pressable style={({ pressed }) => [styles.recordBtn, pressed && styles.recordBtnPressed]} onPress={startRecording}>
          <Text style={styles.btnText}>● Record new pattern</Text>
        </Pressable>
      ) : (
        <>
          <Text style={styles.hint}>Tap and hold to buzz, release to pause. Repeat, then finish.</Text>
          <Pressable
            style={({ pressed }) => [styles.holdBtn, pressed && styles.holdBtnPressed]}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
          >
            <Text style={styles.btnText}>Tap or Hold</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.recordBtn, pressed && styles.recordBtnPressed]} onPress={finishRecording}>
            <Text style={styles.btnText}>✓ Finish</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 16, gap: 10 },
  label: { fontSize: 12, fontWeight: "700", color: colors.faint, textTransform: "uppercase" },
  patternText: { fontSize: 14, color: colors.ink, fontFamily: "monospace" },
  row: { flexDirection: "row", gap: 10 },
  btn: { backgroundColor: "#21262d", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  recordBtn: { backgroundColor: "#1f6feb", borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  holdBtn: { backgroundColor: "#238636", borderRadius: 10, paddingVertical: 24, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
  hint: { fontSize: 12, color: colors.faint },
  holdBtnPressed: { backgroundColor: "#1c6b2a" },
  recordBtnPressed: { backgroundColor: "#1a5fc9" },
  btnPressed: { backgroundColor: "#30363d" }
});