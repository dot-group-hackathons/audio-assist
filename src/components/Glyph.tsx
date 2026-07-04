import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface Props {
  emoji: string;
  size?: number;
  radius?: number;
  /** "safety" red tint, "accent" purple tint, or "mute" grey. */
  tone?: "accent" | "safety" | "mute";
}

/**
 * The design's icon-in-a-rounded-square. We render an emoji glyph on a tinted
 * surface (the underlying build has no react-native-svg, so line icons would
 * force a native rebuild). The tinted container carries the accent/safety color.
 */
export default function Glyph({ emoji, size = 46, radius = 14, tone = "accent" }: Props) {
  const bg =
    tone === "safety" ? colors.safetySoft : tone === "mute" ? colors.surface2 : colors.accentSoft;

  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: radius, backgroundColor: bg }]}>
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", justifyContent: "center" },
});
