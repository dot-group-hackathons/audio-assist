import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";
import Waveform from "./Waveform";

interface Props {
  running: boolean;
  monitoredCount: number;
  ready: boolean;
  onToggle(): void;
}

/** The dark listening hero card. Tapping it starts/stops the classifier. */
export default function ListeningHero({ running, monitoredCount, ready, onToggle }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!running) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 2200, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [running, pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.6] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  const title = running ? "All quiet" : ready ? "Tap to start listening" : "Warming up…";
  const sub = running
    ? `Monitoring ${monitoredCount} sound${monitoredCount === 1 ? "" : "s"} on-device. You'll feel a buzz the moment something matters.`
    : ready
      ? "Sonar isn't listening yet. Start it to be alerted by vibration."
      : "Loading the on-device sound model.";

  return (
    <Pressable
      onPress={onToggle}
      disabled={!ready}
      style={styles.hero}
      accessibilityRole="button"
      accessibilityLabel={running ? "Stop listening" : "Start listening"}
    >
      <View style={styles.liveRow}>
        <View style={styles.pipWrap}>
          {running && (
            <Animated.View
              style={[styles.pipRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
            />
          )}
          <View style={[styles.pip, !running && styles.pipOff]} />
        </View>
        <Text style={styles.liveText}>{running ? "Listening" : "Paused"}</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{sub}</Text>

      <Waveform active={running} />

      <View style={styles.privacy}>
        <Text style={styles.shield}>🛡️</Text>
        <Text style={styles.privacyText}>Audio never leaves your phone</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: 14,
    marginBottom: 6,
    backgroundColor: colors.heroBg,
    borderRadius: radius.lg,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 24,
    overflow: "hidden",
  },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pipWrap: { width: 9, height: 9, alignItems: "center", justifyContent: "center" },
  pip: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.heroPip },
  pipOff: { backgroundColor: "#54525E" },
  pipRing: { position: "absolute", width: 9, height: 9, borderRadius: 6, borderWidth: 2, borderColor: colors.heroPip },
  liveText: {
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.heroLive,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#fff", letterSpacing: -0.4, marginTop: 14, marginBottom: 2 },
  sub: { fontSize: 13.5, color: colors.heroSub, fontWeight: "500", lineHeight: 20 },
  privacy: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 },
  shield: { fontSize: 13 },
  privacyText: { fontSize: 12, color: colors.heroPrivacy, fontWeight: "600" },
});
