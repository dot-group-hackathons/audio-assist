import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { CatalogItem } from "../lib/catalog";
import { colors, radius } from "../theme";
import Glyph from "./Glyph";
import HapticBars from "./HapticBars";
import Toggle from "./Toggle";
import VibrationRecorder from "./VibrationRecorder";

interface Props {
  item: CatalogItem | null;
  on: boolean;
  onToggle(next: boolean): void;
  onClose(): void;
  patternFor(item: CatalogItem): number[];
  onSetPattern(itemId: string, pattern: number[]): void;
  onResetPattern(itemId: string): void;
}

// const CHANNELS = ["Phone", "Watch", "Flash"];
// const SENS = ["Low", "Balanced", "High"];

export default function SoundDetailSheet({ item, on, onToggle, onClose, patternFor, onSetPattern, onResetPattern }: Props) {
  const visible = item !== null;
  const slide = useRef(new Animated.Value(0)).current;

  // Per-sound preferences. Base build stores these locally as UI state; the
  // engine currently emits one generic buzz regardless (see README).
  // const [channels, setChannels] = useState<Set<string>>(new Set(["Phone", "Watch"]));
  const [sens, setSens] = useState("Balanced");

  useEffect(() => {
    Animated.timing(slide, { toValue: visible ? 1 : 0, duration: 280, useNativeDriver: true }).start();
  }, [visible, slide]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const safety = item?.safety ?? false;

  // const toggleChannel = (c: string) =>
  //   setChannels((prev) => {
  //     const next = new Set(prev);
  //     if (next.has(c)) next.delete(c);
  //     else next.add(c);
  //     return next;
  //   });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={{ width: "100%" }} onPress={() => {}}>
          <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
            <View style={styles.grab} />

            {item && (
              <>
                <View style={styles.head}>
                  <Glyph emoji={item.emoji} size={52} radius={16} tone={safety ? "safety" : "accent"} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.meta}>
                      {item.group} · {on ? "active" : "muted"}
                    </Text>
                  </View>
                  <Toggle value={on} onChange={onToggle} tone={safety ? "safety" : "accent"} label={`Toggle ${item.name}`} />
                </View>

                {/* <View style={styles.field}>
                  <Text style={styles.lbl}>Alert me on</Text>
                  <View style={styles.chips}>
                    {CHANNELS.map((c) => {
                      const active = channels.has(c);
                      return (
                        <Pressable key={c} onPress={() => toggleChannel(c)} style={[styles.chip, active && styles.chipOn]}>
                          <Text style={[styles.chipText, active && styles.chipTextOn]}>{c}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View> */}

                <View style={styles.field}>
                  <Text style={styles.lbl}>Vibration pattern</Text>
                  <View style={styles.patternBox}>
                    <HapticBars pattern={patternFor(item)} tone={safety ? "safety" : "accent"} height={30} unit={0.06} opacity={1} />
                  </View>
                </View>

                <VibrationRecorder
                  initialPattern={patternFor(item)}
                  onSave={(pattern) => onSetPattern(item.id, pattern)}
                  onReset={() => onResetPattern(item.id)}
                />

                {/* <View style={styles.field}>
                  <Text style={styles.lbl}>Sensitivity</Text>
                  <View style={styles.chips}>
                    {SENS.map((s) => {
                      const active = sens === s;
                      return (
                        <Pressable key={s} onPress={() => setSens(s)} style={[styles.chip, active && styles.chipOn]}>
                          <Text style={[styles.chipText, active && styles.chipTextOn]}>{s}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View> */}
              </>
            )}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(23,22,26,0.32)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 26,
    paddingTop: 14,
    paddingBottom: 34,
  },
  grab: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line, alignSelf: "center", marginBottom: 22 },
  head: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 22 },
  name: { fontSize: 22, fontWeight: "800", color: colors.ink, letterSpacing: -0.4 },
  meta: { fontSize: 12.5, color: colors.muted, fontWeight: "600", marginTop: 2 },
  field: { marginBottom: 18 },
  lbl: { fontSize: 12.5, fontWeight: "700", color: colors.muted, marginBottom: 9 },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.ink },
  chipTextOn: { color: "#fff" },
  patternBox: { padding: 14, backgroundColor: colors.surface2, borderRadius: radius.sm },
});
