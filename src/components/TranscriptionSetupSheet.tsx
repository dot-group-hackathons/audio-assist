import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius } from "../theme";

interface Props {
  visible: boolean;
  downloading: boolean;
  progress: number; // 0..1
  onEnable(): void;
  onDecline(): void;
}

// First-launch opt-in for on-device transcription; enabling downloads the model.
export default function TranscriptionSetupSheet({
  visible,
  downloading,
  progress,
  onEnable,
  onDecline,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.kicker}>New</Text>
          <Text style={styles.title}>Understand speech</Text>
          <Text style={styles.sub}>
            Turn nearby speech into live captions and get a buzz when your name is
            called. It runs entirely on your phone — audio never leaves the device.
          </Text>

          {downloading ? (
            <View style={styles.progressWrap}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.progressText}>
                Downloading model… {Math.round(progress * 100)}%
              </Text>
            </View>
          ) : (
            <>
              <Pressable style={[styles.btn, styles.primary]} onPress={onEnable}>
                <Text style={styles.primaryText}>Enable transcription</Text>
              </Pressable>
              <Pressable style={styles.btn} onPress={onDecline}>
                <Text style={styles.secondaryText}>Not now</Text>
              </Pressable>
              <Text style={styles.note}>A one-time ~75 MB download.</Text>
            </>
          )}
        </View>
      </View>
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
  btn: {
    marginTop: 12,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.ink, marginTop: 22 },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryText: { color: colors.muted, fontSize: 15, fontWeight: "700" },
  note: { fontSize: 12, color: colors.faint, fontWeight: "600", textAlign: "center", marginTop: 8 },
  progressWrap: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24, paddingVertical: 16 },
  progressText: { fontSize: 14.5, color: colors.ink, fontWeight: "700" },
});
