import { Stack } from "expo-router";
import { ModelProvider } from "../lib/ModelContext";

export default function RootLayout() {
  return (
    <ModelProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Audio Assist",
          }}
        />

        <Stack.Screen
          name="settings"
          options={{
            title: "Select Sounds",
          }}
        />
      </Stack>
    </ModelProvider>
  );
}