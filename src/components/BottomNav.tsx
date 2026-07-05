import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export type Tab = "home" | "sounds" | "history" | "watch";

interface Props {
  active: Tab;
  onSelect(tab: Tab): void;
  /** Whether the classifier is currently listening. */
  running: boolean;
  /** Start/stop listening — the center button's primary action. */
  onToggleListening(): void;
  bottomInset: number;
}

const ITEMS: { key: Tab; label: string; icon: string }[] = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "sounds", label: "Sounds", icon: "≋" },
  { key: "history", label: "History", icon: "🕘" },
];

export default function BottomNav({ active, onSelect, running, onToggleListening, bottomInset }: Props) {
  return (
    <View style={[styles.nav, { paddingBottom: 10 + bottomInset }]}>
      <NavButton item={ITEMS[0]} active={active === "home"} onPress={() => onSelect("home")} />

      <Pressable
        style={[styles.fab, running && styles.fabOn]}
        onPress={onToggleListening}
        accessibilityRole="button"
        accessibilityState={{ selected: running }}
        accessibilityLabel={running ? "Stop listening" : "Start listening"}
      >
        <Text style={styles.fabIcon}>{running ? "■" : "▶"}</Text>
      </Pressable>

      <NavButton item={ITEMS[1]} active={active === "sounds"} onPress={() => onSelect("sounds")} />


      {/* <NavButton item={ITEMS[2]} active={active === "history"} onPress={() => onSelect("history")} /> */}
    </View>
  );
}

function NavButton({
  item,
  active,
  onPress,
}: {
  item: { label: string; icon: string };
  active: boolean;
  onPress(): void;
}) {
  return (
    <Pressable style={styles.btn} onPress={onPress} accessibilityRole="button" accessibilityLabel={item.label}>
      <Text style={[styles.icon, active && styles.iconActive]}>{item.icon}</Text>
      <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 18,
    paddingTop: 8,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  btn: { alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, width: 62 },
  icon: { fontSize: 20, color: colors.faint, lineHeight: 24 },
  iconActive: { color: colors.ink },
  label: { fontSize: 10.5, fontWeight: "700", color: colors.faint },
  labelActive: { color: colors.ink },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    shadowColor: colors.ink,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  // Listening: tint accent so the active state reads at a glance.
  fabOn: { backgroundColor: colors.accent, shadowColor: colors.accent },
  fabIcon: { color: "#fff", fontSize: 22, fontWeight: "700" },
});
