import { createContext, ReactNode, useContext } from "react";
import { useWhisper } from "./useWhisper";

type WhisperContextType = ReturnType<typeof useWhisper>;

const Ctx = createContext<WhisperContextType | null>(null);

export function WhisperProvider({ children }: { children: ReactNode }) {
  const whisper = useWhisper();

  return <Ctx.Provider value={whisper}>{children}</Ctx.Provider>;
}

export function useWhisperContext() {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error("useWhisperContext must be used inside WhisperProvider");
  }
  return context;
}
