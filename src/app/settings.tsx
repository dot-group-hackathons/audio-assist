import { View } from "react-native";
import SoundPicker from "../components/SoundPicker";
import { useModelContext } from "../lib/ModelContext";
import { useSoundSelection } from "../lib/useSoundSelection";

export default function SettingsScreen() {
  const { labels } = useModelContext();

  const {
    selected,
    toggle,
  } = useSoundSelection(labels);

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
      }}
    >
      <SoundPicker
        labels={labels}
        selected={selected}
        onToggle={toggle}
      />
    </View>
  );
}