import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";
import type { CatalogItem } from "../lib/catalog";
import Glyph from "./Glyph";
import HapticBars from "./HapticBars";
import Toggle from "./Toggle";

interface Props {
  item: CatalogItem;
  on: boolean;
  onToggle(next: boolean): void;
  onOpen(): void;
}

export default function SoundRow({ item, on, onToggle, onOpen }: Props) {
  return (
    <View style={[styles.row, !on && styles.off]}>
      <Pressable
        onPress={onOpen}
        style={styles.tap}
        accessibilityRole="button"
        accessibilityLabel={`Configure ${item.name}`}
      >
        <Glyph emoji={item.emoji} tone={!on ? "mute" : item.safety ? "safety" : "accent"} />
        <View style={styles.body}>
          <Text style={[styles.name, !on && styles.nameOff]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={{ marginTop: 7, opacity: on ? 1 : 0.3 }}>
            <HapticBars pattern={item.pat} tone={!on ? "mute" : item.safety ? "safety" : "accent"} />
          </View>
        </View>
      </Pressable>
      <Toggle value={on} onChange={onToggle} tone={item.safety ? "safety" : "accent"} label={`Toggle ${item.name}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
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
  off: {},
  tap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 14, minWidth: 0 },
  body: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: "700", color: colors.ink, letterSpacing: -0.2 },
  nameOff: { color: colors.muted },
});
