import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const BARS = [30, 55, 80, 45, 70, 95, 60, 40, 75, 50, 85, 35, 65, 90, 48, 72];

interface Props {
  /** When false, bars rest low and still (paused state). */
  active?: boolean;
  height?: number;
}

/**
 * Animated equalizer for the listening hero. Uses the built-in Animated API
 * (no reanimated worklet setup needed) — cheap for ~16 bars. Each bar loops a
 * bounce between a low rest height and its target, staggered by index.
 */
export default function Waveform({ active = true, height = 64 }: Props) {
  const values = useRef(BARS.map(() => new Animated.Value(0.16))).current;

  useEffect(() => {
    if (!active) {
      values.forEach((v) => Animated.timing(v, { toValue: 0.16, duration: 300, useNativeDriver: false }).start());
      return;
    }

    const loops = values.map((v, i) => {
      const peak = BARS[i] / 100;
      const dur = 900 + (i % 4) * 180;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: peak, duration: dur / 2, delay: i * 70, useNativeDriver: false }),
          Animated.timing(v, { toValue: 0.16, duration: dur / 2, useNativeDriver: false }),
        ])
      );
    });
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, values]);

  return (
    <View style={[styles.row, { height }]}>
      {values.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              height: v.interpolate({ inputRange: [0, 1], outputRange: [0, height] }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 20 },
  bar: {
    flex: 1,
    minHeight: 6,
    backgroundColor: "#7E7BEF",
    borderRadius: 6,
  },
});
