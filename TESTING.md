# Testing on a real Android device

Copy-paste each block into PowerShell. Blocks 0–5 test **sound detection** (the
classifier). The **Transcription** section at the bottom tests the newer
on-device speech-to-text / name-alert path.

## 0. One-time shell setup (PATH + project dir)

```powershell
$env:Path = "C:\Users\darie_3ep3zwn\AppData\Roaming\fnm\node-versions\v24.18.0\installation;" + $env:Path
Set-Location C:\Users\darie_3ep3zwn\Downloads\audio-assist
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
```

## 1. Is the device connected?

```powershell
& $adb devices
```

Expect one line ending in `device` (not `unauthorized`/`offline`). If empty,
replug USB and accept the debugging prompt on the phone.

## 2. Is Metro up on 8081?

```powershell
if (Get-NetTCPConnection -LocalPort 8081 -State Listen -EA SilentlyContinue) { "UP" } else { "DOWN" }
```

## 3. Start Metro (only if DOWN) — leave this window running

```powershell
npx expo start --dev-client
```

## 4. Typecheck + reload the app (second PowerShell window; needs block 0's `$adb`)

```powershell
node ".\node_modules\typescript\bin\tsc" --noEmit; if ($?) {
  & $adb reverse tcp:8081 tcp:8081 | Out-Null
  $url = "audioassist://expo-development-client/?url=" + [uri]::EscapeDataString("http://localhost:8081")
  & $adb shell am start -a android.intent.action.VIEW -d $url 2>&1 | Out-Null
  "TSC OK + reloaded"
}
```

## 5. Watch the JS console live (detections + Whisper errors)

```powershell
& $adb logcat -c; & $adb logcat "ReactNativeJS:V" "*:S"
```

Then make sounds (knock, doorbell, clap, alarm) and watch what fires. `Ctrl+C`
to stop.

**What shows up here:** detection results, plus Whisper *errors* only —
`Whisper init failed:`, `Whisper realtime:`, `Whisper stop failed:`. Successful
transcriptions do **not** log; they render in the on-screen **Captions** bar (see
below). To watch transcript text in logcat too, temporarily add
`console.log("caption:", clean)` in `handleText` at `src/app/index.tsx:113`.

### Classifier gates (what block 5 is testing)

Gates live in `src/lib/useClassifier.ts:10-16`: global `MIN_SCORE = 0.20`, with
per-item overrides in `src/lib/catalog.ts` (voice needs `minPeak` 0.6 / `minScore`
0.5; knock `minScore` 0.15). If a sound is stubborn, lower its `minScore` there
and re-run block 4.

---

## Testing transcription (new functionality)

On-device realtime STT (whisper.rn, `tiny.en`). While listening with
transcription on, mic audio is fed to Whisper, transcribed text appears in the
**Captions** bar, and hearing your **name** raises a name-called alert + vibration.
Everything runs on-device — audio never leaves the phone.

### T1. Opt in / download the model

First run: after setting your name, the **transcription sheet** appears — tap
**Enable**. Or any time: open **Settings** (gear on Home) → toggle **Voice
transcription** on.

Enabling downloads `tiny.en` (~75 MB, once). Watch the status line under the
toggle move: `Downloading model… NN%` → `Preparing…` → `Ready ✓`. Needs network
+ free space. If it fails, block 5 logs `Whisper init failed:`.

- Source of truth: opt-in persisted by `useTranscriptionOptIn`; model handling in
  `src/lib/whisperModel.ts`; download progress surfaced via `prepare()`.

### T2. Engine picker

In Settings, under **Model**, two chips: **Whisper** (active, selectable) and
**Vosk** (disabled, "coming soon" — tapping it should do nothing). Selecting
Whisper persists via `useSttEngine` (`STT_ENGINES` in `src/lib/sttEngine.ts`).

### T3. Live captions

1. Transcription must be **Ready ✓** (T1).
2. Tap **Start** to begin listening. The Captions bar shows `Listening…`.
3. Speak a sentence. Within ~3 s (`audioSliceSec`) the recognized text replaces
   it in the Captions bar.
4. Stay silent — captions should **not** flash filler. Common `tiny.en`
   silence hallucinations (`you`, `thank you`, `[blank_audio]`, …) are filtered
   in `HALLUCINATIONS` at `src/app/index.tsx:38`. If junk still appears, add it
   there.

Transcription only runs when **listening AND opted in AND Whisper ready**
(`transcriptionActive`, `src/app/index.tsx:135`). Stopping listening clears the
caption.

### T4. Name-called alert

1. Set **Your name** in Settings (e.g. `Darien`).
2. With transcription running, have someone say your name (or say it yourself).
3. Expect the **name-called alert sheet** + vibration, and a "Name called" entry
   in history.

Matching is fuzzy — `matchesName` / `src/lib/nameMatch.ts`. If your name isn't
triggering, check T3 first (does the caption even contain it?), then the matcher.

### Gotchas

- **Single mic owner.** YAMNet owns the mic; Whisper is fed the same PCM via
  `FedAudioStream` (`src/lib/useWhisper.ts`) rather than opening its own stream.
  If captions never appear but detections work, the feed (`onAudioChunk` →
  `feed`) is the thing to check.
- **No caption without listening.** Enabling transcription alone does nothing;
  you must also tap Start.
