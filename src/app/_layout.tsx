import { Stack } from "expo-router";
import { ModelProvider } from "../lib/ModelContext";
import { WhisperProvider } from "../lib/WhisperContext";

export default function RootLayout() {
  return (
    <ModelProvider>
      <WhisperProvider>
        {/* The app renders its own header/nav ("Sonar" UI), so hide the native stack header. */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </WhisperProvider>
    </ModelProvider>
  );
}
