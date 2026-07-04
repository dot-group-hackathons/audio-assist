import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

interface Props {
  /** Pattern in ms: buzz, gap, buzz, gap, ... (even = buzz, odd = gap). */
  pattern: number[];
  tone?: "accent" | "safety" | "mute";
  height?: number;
  /** ms -> px scale for the bar widths. */
  unit?: number;
  opacity?: number;
}

/** Little preview of a vibration pattern: filled bars = buzz, gaps = silence. */
export default function HapticBars({
  pattern,
  tone = "accent",
  height = 14,
  unit = 0.03,
  opacity = 0.85,
}: Props) {
  const color =
    tone === "safety" ? colors.safety : tone === "mute" ? colors.faint : colors.accent;

  return (
    <View style={[styles.row, { height }]}>
      {pattern.map((ms, i) => {
        const isGap = i % 2 === 1;
        return (
          <View
            key={i}
            style={{
              width: Math.max(4, ms * unit),
              height: "100%",
              borderRadius: 3,
              backgroundColor: isGap ? "transparent" : color,
              opacity: isGap ? 1 : opacity,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 3 },
});
