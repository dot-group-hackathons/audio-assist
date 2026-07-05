import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";

interface Props {
  text: string; // latest transcript line; empty hides the bar
  transcribing: boolean; // a transcription is in flight
}

// Live-caption strip on Home; hidden when idle.
export default function CaptionBar({ text, transcribing }: Props) {
  if (!text && !transcribing) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Captions</Text>
      <Text style={styles.text} numberOfLines={3}>
        {text || (transcribing ? "Listening…" : "")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    padding: 18,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  label: {
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.faint,
    marginBottom: 6,
  },
  text: { fontSize: 16, fontWeight: "600", color: colors.ink, lineHeight: 22 },
});
