// Selectable speech-to-text engines. Whisper is the accurate default; Vosk is a
// lighter streaming alternative (see notes in useWhisper — Vosk owns the mic, so
// wiring it needs the audio pipeline to hand off, hence `available: false` today).
export type SttEngineId = "whisper" | "vosk";

export interface SttEngineMeta {
  id: SttEngineId;
  label: string;
  sub: string;
  available: boolean;
}

export const STT_ENGINES: SttEngineMeta[] = [
  { id: "whisper", label: "Whisper", sub: "Most accurate · realtime", available: true },
  { id: "vosk", label: "Vosk", sub: "Lighter · coming soon", available: false },
];

export const DEFAULT_ENGINE: SttEngineId = "whisper";

export function engineMeta(id: SttEngineId): SttEngineMeta {
  return STT_ENGINES.find((e) => e.id === id) ?? STT_ENGINES[0];
}
