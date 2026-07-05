import { createContext, useContext, type ReactNode } from "react";
import { useVibrationPatterns } from "./useVibrationPatterns";

type VibrationPatternsValue = ReturnType<typeof useVibrationPatterns>;

const VibrationPatternsContext = createContext<VibrationPatternsValue | null>(null);

export function VibrationPatternsProvider({ children }: { children: ReactNode }) {
  const value = useVibrationPatterns();
  return (
    <VibrationPatternsContext.Provider value={value}>
      {children}
    </VibrationPatternsContext.Provider>
  );
}

export function useVibrationPatternsContext() {
  const ctx = useContext(VibrationPatternsContext);
  if (!ctx) {
    throw new Error("useVibrationPatternsContext must be used within VibrationPatternsProvider");
  }

  return ctx;
}