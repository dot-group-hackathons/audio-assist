import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius } from "../theme";
import Toggle from "./Toggle";
import { STT_ENGINES, type SttEngineId } from "../lib/sttEngine";

interface Props {
  visible: boolean;
  name: string | null;
  onSaveName(name: string): void;
  optedIn: boolean | null;
  ready: boolean; // whisper context initialized
  downloading: boolean;
  progress: number; // 0..1
  onEnableTranscription(): void;
  onDisableTranscription(): void;
  engine: SttEngineId;
  onChooseEngine(id: SttEngineId): void;
  onClose(): void;
}

// Bottom settings sheet: change the user's name and toggle on-device transcription.
export default function SettingsSheet({
  visible,
  name,
  onSaveName,
  optedIn,
  ready,
  downloading,
  progress,
  onEnableTranscription,
  onDisableTranscription,
  engine,
  onChooseEngine,
  onClose,
}: Props) {
  const slide = useRef(new Animated.Value(0)).current;
  const [nameValue, setNameValue] = useState(name ?? "");

  useEffect(() => {
    Animated.timing(slide, { toValue: visible ? 1 : 0, duration: 280, useNativeDriver: true }).start();
  }, [visible, slide]);

  // Re-sync the field whenever the sheet opens with the latest stored name.
  useEffect(() => {
    if (visible) setNameValue(name ?? "");
  }, [visible, name]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const trimmed = nameValue.trim();
  const nameChanged = trimmed.length > 0 && trimmed !== (name ?? "");

  const transcriptionOn = optedIn === true;
  const onToggleTranscription = (next: boolean) => {
    if (downloading) return;
    if (next) onEnableTranscription();
    else onDisableTranscription();
  };

  // Status line under the toggle: download progress → preparing → ready.
  const statusReady = transcriptionOn && ready && !downloading;
  const statusText = downloading
    ? `Downloading model… ${Math.round(progress * 100)}%`
    : statusReady
      ? "Ready ✓"
      : transcriptionOn
        ? "Preparing…"
        : "On-device captions + name alerts. Audio never leaves your phone.";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          style={{ width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={{ width: "100%" }} onPress={() => {}}>
            <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
              <View style={styles.grab} />
              <Text style={styles.title}>Settings</Text>

              {/* Name */}
              <View style={styles.field}>
                <Text style={styles.lbl}>Your name</Text>
                <View style={styles.nameRow}>
                  <TextInput
                    style={styles.input}
                    value={nameValue}
                    onChangeText={setNameValue}
                    placeholder="Your name"
                    placeholderTextColor={colors.faint}
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={() => nameChanged && onSaveName(trimmed)}
                  />
                  <Pressable
                    style={[styles.saveBtn, !nameChanged && styles.saveBtnDisabled]}
                    disabled={!nameChanged}
                    onPress={() => onSaveName(trimmed)}
                  >
                    <Text style={styles.saveText}>Save</Text>
                  </Pressable>
                </View>
                <Text style={styles.hint}>Used to alert you when your name is called.</Text>
              </View>

              {/* Transcription */}
              <View style={styles.field}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>Voice transcription</Text>
                    <Text style={[styles.hint, statusReady && styles.hintReady]}>
                      {statusText}
                    </Text>
                  </View>
                  <Toggle
                    value={transcriptionOn}
                    onChange={onToggleTranscription}
                    label="Toggle voice transcription"
                  />
                </View>

                {/* Engine picker */}
                <Text style={[styles.lbl, { marginTop: 18 }]}>Model</Text>
                <View style={styles.chips}>
                  {STT_ENGINES.map((e) => {
                    const active = engine === e.id;
                    return (
                      <Pressable
                        key={e.id}
                        onPress={() => e.available && onChooseEngine(e.id)}
                        disabled={!e.available}
                        style={[styles.chip, active && styles.chipOn, !e.available && styles.chipDisabled]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextOn]}>{e.label}</Text>
                        <Text style={[styles.chipSub, active && styles.chipTextOn]}>{e.sub}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable style={styles.doneBtn} onPress={onClose}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </Animated.View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(23,22,26,0.32)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 26,
    paddingTop: 14,
    paddingBottom: 34,
  },
  grab: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line, alignSelf: "center", marginBottom: 18 },
  title: { fontSize: 26, fontWeight: "800", color: colors.ink, letterSpacing: -0.5, marginBottom: 20 },
  field: { marginBottom: 22 },
  lbl: { fontSize: 12.5, fontWeight: "700", color: colors.muted, marginBottom: 9 },
  nameRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
  },
  saveBtn: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  hint: { fontSize: 12.5, color: colors.muted, fontWeight: "500", marginTop: 8, lineHeight: 18 },
  hintReady: { color: colors.ok, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  rowTitle: { fontSize: 16, fontWeight: "800", color: colors.ink, letterSpacing: -0.2 },
  chips: { flexDirection: "row", gap: 10 },
  chip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipDisabled: { opacity: 0.45 },
  chipText: { fontSize: 14, fontWeight: "800", color: colors.ink },
  chipTextOn: { color: "#fff" },
  chipSub: { fontSize: 11, fontWeight: "600", color: colors.muted, marginTop: 2 },
  doneBtn: {
    marginTop: 6,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: { color: colors.ink, fontSize: 15, fontWeight: "700" },
});
