import {
  createContext,
  ReactNode,
  useContext,
} from "react";
import { useModel } from "./useModel";

type ModelContextType = ReturnType<typeof useModel>;

const ModelContext = createContext<ModelContextType | null>(null);

export function ModelProvider({
  children,
}: {
  children: ReactNode;
}) {
  const model = useModel();

  return (
    <ModelContext.Provider value={model}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModelContext() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error(
      "useModelContext must be used inside ModelProvider"
    );
  }  
  return context;
}