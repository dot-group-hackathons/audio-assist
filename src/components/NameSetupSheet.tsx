import { useState } from "react";
import {
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

interface Props {
  visible: boolean;
  onSubmit(name: string): void;
}

// First-launch prompt: capture the user's name for later name recognition.
export default function NameSetupSheet({ visible, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const canSubmit = value.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.kicker}>Welcome</Text>
          <Text style={styles.title}>What's your name?</Text>
          <Text style={styles.sub}>
            We'll use it to alert you when someone calls out to you.
          </Text>

          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder="Your name"
            placeholderTextColor={colors.faint}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={() => canSubmit && onSubmit(value)}
          />

          <Pressable
            style={[styles.btn, !canSubmit && styles.btnDisabled]}
            disabled={!canSubmit}
            onPress={() => onSubmit(value)}
          >
            <Text style={styles.btnText}>Continue</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(23,22,26,0.32)",
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 26,
  },
  kicker: {
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.accent,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.6,
    marginTop: 6,
  },
  sub: { fontSize: 14.5, color: colors.muted, fontWeight: "600", marginTop: 8, lineHeight: 20 },
  input: {
    marginTop: 22,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 18,
    fontSize: 17,
    fontWeight: "600",
    color: colors.ink,
  },
  btn: {
    marginTop: 16,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
