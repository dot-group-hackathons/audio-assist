import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Props {
  labels: string[];
  selected: Set<string>;
  onToggle(label: string): void;
}

export default function SoundPicker({
  labels,
  selected,
  onToggle,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return labels.filter((label) =>
      label.toLowerCase().includes(q)
    );
  }, [labels, search]);

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.search}
        placeholder="Search sounds..."
        placeholderTextColor="#777"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const checked = selected.has(item);

          return (
            <Pressable
              onPress={() => onToggle(item)}
              style={styles.row}
            >
              <Text style={styles.check}>
                {checked ? "v" : ""}
              </Text>

              <Text style={styles.label}>
                {item}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: "#21262d",
    color: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },

  check: {
    color: "#58a6ff",
    fontSize: 20,
    width: 32,
  },

  label: {
    color: "black",
    fontSize: 15,
    flex: 1,
  },
});