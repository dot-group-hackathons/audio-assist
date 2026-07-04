import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import type { Detection } from "../lib/types";
import { dayLabel } from "../lib/types";
import DetectionCard from "../components/DetectionCard";

interface Props {
  detections: Detection[];
  onOpenDetection(d: Detection): void;
}

export default function HistoryScreen({ detections, onOpenDetection }: Props) {
  // Group by day label, preserving newest-first order.
  const groups: { day: string; rows: Detection[] }[] = [];
  for (const d of detections) {
    const day = dayLabel(d.at);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.rows.push(d);
    else groups.push({ day, rows: [d] });
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toprow}>
        <Text style={styles.eyebrow}>Last 7 days</Text>
        <Text style={styles.title}>History</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.pad}
        showsVerticalScrollIndicator={false}
      >
        {groups.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🗂️</Text>
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptySub}>Sounds you're alerted to will be logged here.</Text>
          </View>
        ) : (
          groups.map((g, gi) => (
            <View key={`${g.day}-${gi}`}>
              <Text style={styles.daylbl}>{g.day}</Text>
              {g.rows.map((d) => (
                <DetectionCard
                  key={d.id}
                  detection={d}
                  onPress={() => onOpenDetection(d)}
                  showHaptic={false}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
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
  pad: { paddingHorizontal: 26, paddingBottom: 120 },
  daylbl: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.faint,
    marginTop: 22,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  empty: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 34, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: colors.ink },
  emptySub: { fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 6, lineHeight: 19 },
});
