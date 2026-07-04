import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { CATALOG, GROUP_ORDER, isItemOn, type CatalogItem } from "../lib/catalog";
import SoundRow from "../components/SoundRow";

interface Props {
  selected: Set<string>;
  onToggleItem(item: CatalogItem, on: boolean): void;
  onOpenItem(item: CatalogItem): void;
}

export default function SoundsScreen({ selected, onToggleItem, onOpenItem }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toprow}>
        <Text style={styles.eyebrow}>Configure</Text>
        <Text style={styles.title}>Sounds</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.pad}
        showsVerticalScrollIndicator={false}
      >
        {GROUP_ORDER.map((group) => (
          <View key={group}>
            <Text style={styles.grouplbl}>{group}</Text>
            {CATALOG.filter((c) => c.group === group).map((item) => {
              const on = isItemOn(item, selected);
              return (
                <SoundRow
                  key={item.id}
                  item={item}
                  on={on}
                  onToggle={(next) => onToggleItem(item, next)}
                  onOpen={() => onOpenItem(item)}
                />
              );
            })}
          </View>
        ))}
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
  grouplbl: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.faint,
    marginTop: 22,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
});
