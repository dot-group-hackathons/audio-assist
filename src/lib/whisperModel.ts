import * as FileSystem from "expo-file-system/legacy";

// tiny.en downloaded once on opt-in (not bundled — it'd add ~75 MB to every install).
const MODEL_URL =
  "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin";
const MODEL_FILE = "ggml-tiny.en.bin";

export function modelPath(): string {
  return FileSystem.documentDirectory + MODEL_FILE;
}

// True only for a fully-downloaded model (guards against an interrupted partial).
export async function modelExists(): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(modelPath());
  return info.exists && (info.size ?? 0) > 1_000_000;
}

// Download the model (no-op if already present). `onProgress` gets 0..1.
export async function downloadModel(
  onProgress?: (frac: number) => void
): Promise<string> {
  const dest = modelPath();
  if (await modelExists()) return dest;

  const dl = FileSystem.createDownloadResumable(MODEL_URL, dest, {}, (p) => {
    if (onProgress && p.totalBytesExpectedToWrite > 0) {
      onProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite);
    }
  });

  const res = await dl.downloadAsync();
  if (!res?.uri) throw new Error("Whisper model download failed");
  return res.uri;
}
