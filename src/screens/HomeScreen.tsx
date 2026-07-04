import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import type { Detection } from "../lib/types";
import { dayLabel } from "../lib/types";
import ListeningHero from "../components/ListeningHero";
import DetectionCard from "../components/DetectionCard";

interface Props {
  running: boolean;
  ready: boolean;
  monitoredCount: number;
  detections: Detection[];
  onToggle(): void;
  onOpenDetection(d: Detection): void;
  onGoHistory(): void;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen({
  running,
  ready,
  monitoredCount,
  detections,
  onToggle,
  onOpenDetection,
  onGoHistory,
}: Props) {
  const today = detections.filter((d) => dayLabel(d.at) === "Today").slice(0, 4);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toprow}>
        <View>
          <Text style={styles.eyebrow}>{greeting()}</Text>
          <Text style={styles.name}>Dar</Text>
        </View>
        <View style={styles.iconbtn}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.pad}
        showsVerticalScrollIndicator={false}
      >
        <ListeningHero
          running={running}
          ready={ready}
          monitoredCount={monitoredCount}
          onToggle={onToggle}
        />

        <View style={styles.sec}>
          <Text style={styles.secTitle}>Earlier today</Text>
          <Pressable onPress={onGoHistory} hitSlop={8}>
            <Text style={styles.secLink}>History</Text>
          </Pressable>
        </View>

        {today.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyTitle}>Nothing yet today</Text>
            <Text style={styles.emptySub}>
              {running
                ? "You're all caught up. Detections will appear here."
                : "Start listening to catch sounds around you."}
            </Text>
          </View>
        ) : (
          today.map((d) => (
            <DetectionCard key={d.id} detection={d} onPress={() => onOpenDetection(d)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  toprow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 26,
    paddingTop: 6,
    paddingBottom: 2,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.faint,
  },
  name: { fontSize: 19, fontWeight: "800", color: colors.ink, letterSpacing: -0.3, marginTop: 2 },
  iconbtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pad: { paddingHorizontal: 26, paddingBottom: 120 },
  sec: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 26,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  secTitle: { fontSize: 17, fontWeight: "800", color: colors.ink, letterSpacing: -0.3 },
  secLink: { fontSize: 12.5, fontWeight: "700", color: colors.accent },
  empty: { alignItems: "center", paddingVertical: 34, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 34, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: colors.ink },
  emptySub: { fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 6, lineHeight: 19 },
});
