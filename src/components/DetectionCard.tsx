import { useVibrationPatternsContext } from "@/lib/VibrationPatternsContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Detection } from "../lib/types";
import { fmtTime } from "../lib/types";
import { cardShadow, colors, radius } from "../theme";
import Glyph from "./Glyph";
import HapticBars from "./HapticBars";

interface Props {
  detection: Detection;
  onPress(): void;
  showHaptic?: boolean;
}

export default function DetectionCard({ detection, onPress, showHaptic = true }: Props) {
  const { item, score, at } = detection;
  const { patternFor } = useVibrationPatternsContext();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${(score * 100).toFixed(0)} percent, ${fmtTime(at)}`}
    >
      <Glyph emoji={item.emoji} tone={item.safety ? "safety" : "accent"} />

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.tag, item.safety && styles.tagSafety]}>{item.group}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.conf}>{(score * 100).toFixed(0)}%</Text>
        </View>
        {showHaptic && (
          <View style={{ marginTop: 7 }}>
            <HapticBars pattern={patternFor(item)} tone={item.safety ? "safety" : "accent"} />
          </View>
        )}
      </View>

      <Text style={styles.time}>{fmtTime(at)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  pressed: { ...cardShadow, borderColor: "transparent", transform: [{ translateY: -1 }] },
  body: { flex: 1, minWidth: 0 },
  name: { fontSize: 15.5, fontWeight: "700", color: colors.ink, letterSpacing: -0.2 },
  meta: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 2 },
  tag: { fontSize: 12.5, fontWeight: "700", color: colors.accent },
  tagSafety: { color: colors.safety },
  dot: { color: colors.faint, fontSize: 12.5 },
  conf: { fontSize: 12.5, color: colors.muted, fontWeight: "500" },
  time: { fontSize: 12.5, color: colors.faint, fontWeight: "600" },
});
