import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

/** Placeholder for a future paired-wearable screen. */
export default function WatchScreen() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toprow}>
        <Text style={styles.eyebrow}>Devices</Text>
        <Text style={styles.title}>Watch</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.emoji}>⌚</Text>
        <Text style={styles.h}>Wearable alerts coming soon</Text>
        <Text style={styles.p}>
          Pair a watch to feel alerts on your wrist even when your phone is out of reach.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toprow: { paddingHorizontal: 26, paddingTop: 6, paddingBottom: 2 },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.faint,
  },
  title: { fontSize: 30, fontWeight: "800", color: colors.ink, letterSpacing: -0.6, marginTop: 6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, paddingBottom: 80 },
  emoji: { fontSize: 44, marginBottom: 14 },
  h: { fontSize: 17, fontWeight: "800", color: colors.ink },
  p: { fontSize: 13.5, color: colors.muted, textAlign: "center", marginTop: 8, lineHeight: 20 },
});
