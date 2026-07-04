import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { colors } from "../theme";

interface Props {
  value: boolean;
  onChange(next: boolean): void;
  tone?: "accent" | "safety";
  label?: string;
}

/** iOS-style switch matching the design's pill toggle. */
export default function Toggle({ value, onChange, tone = "accent", label }: Props) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [value, anim]);

  const onColor = tone === "safety" ? colors.safety : colors.accent;
  const trackColor = anim.interpolate({ inputRange: [0, 1], outputRange: [colors.surface2, onColor] });
  const knobX = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 23] });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => onChange(!value)}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackColor, borderColor: value ? onColor : colors.line }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX: knobX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 50, height: 30, borderRadius: 20, borderWidth: 1, justifyContent: "center" },
  knob: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
