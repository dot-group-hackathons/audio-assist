import { useVibrationPatternsContext } from "@/lib/VibrationPatternsContext";
import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { Detection } from "../lib/types";
import { fmtTime } from "../lib/types";
import { colors, radius } from "../theme";
import Glyph from "./Glyph";
import HapticBars from "./HapticBars";

interface Props {
  detection: Detection | null;
  onClose(): void;
}

/** Full-bleed alert that slides up when a monitored sound is detected. */
export default function AlertSheet({ detection, onClose }: Props) {
  const visible = detection !== null;
  const slide = useRef(new Animated.Value(0)).current;
  const { patternFor  } = useVibrationPatternsContext();

  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, slide]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  const safety = detection?.item.safety ?? false;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={{ width: "100%" }} onPress={() => {}}>
          <Animated.View style={[styles.sheet, safety && styles.sheetSafety, { transform: [{ translateY }] }]}>
            <View style={styles.grab} />

            {detection && (
              <>
                <Glyph emoji={detection.item.emoji} size={82} radius={26} tone={safety ? "safety" : "accent"} />

                <Text style={[styles.kicker, safety && styles.kickerSafety]}>
                  {safety ? "Safety alert" : "Sound detected"}
                </Text>
                <Text style={styles.name}>{detection.item.name}</Text>

                <View style={styles.line}>
                  <Text style={styles.lineMuted}>{fmtTime(detection.at)}</Text>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.lineMuted}>
                    Confidence <Text style={styles.lineStrong}>{(detection.score * 100).toFixed(0)}%</Text>
                  </Text>
                </View>

                <View style={styles.patternWrap}>
                  <Text style={styles.patternLbl}>Vibration</Text>
                  <HapticBars
                    pattern={patternFor(detection.item)}
                    tone={safety ? "safety" : "accent"}
                    height={26}
                    unit={0.045}
                  />
                </View>

                <View style={styles.actions}>
                  <Pressable style={[styles.btn, styles.primary]} onPress={onClose}>
                    <Text style={styles.primaryText}>Got it</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(23,22,26,0.32)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 26,
    paddingTop: 14,
    paddingBottom: 34,
  },
  sheetSafety: { backgroundColor: "#FCEDE9" },
  grab: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line, alignSelf: "center", marginBottom: 22 },
  kicker: {
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.accent,
    marginTop: 20,
  },
  kickerSafety: { color: colors.safety },
  name: { fontSize: 34, fontWeight: "800", color: colors.ink, letterSpacing: -0.6, marginTop: 6, marginBottom: 10 },
  line: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  lineMuted: { fontSize: 13.5, color: colors.muted, fontWeight: "600" },
  lineStrong: { color: colors.ink, fontWeight: "700" },
  dot: { color: colors.faint },
  patternWrap: {
    marginTop: 22,
    marginBottom: 24,
    padding: 18,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    gap: 12,
  },
  patternLbl: { fontSize: 12.5, fontWeight: "700", color: colors.muted },
  actions: { flexDirection: "row", gap: 12 },
  btn: { flex: 1, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: colors.ink },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
