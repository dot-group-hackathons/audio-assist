import { VibrationPatternsProvider } from "@/lib/VibrationPatternsContext";
import { Stack } from "expo-router";
import { ModelProvider } from "../lib/ModelContext";

export default function RootLayout() {
  return (
    <ModelProvider>
      <VibrationPatternsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </VibrationPatternsProvider>
    </ModelProvider>
  );
}
