// Curated catalog of recognizable sounds shown in the UI.
//
// The real classifier (YAMNet) emits ~521 AudioSet class names. That flat list
// is too granular to show a user, so each catalog entry maps one friendly,
// icon-bearing sound to one or more underlying YAMNet label strings. Toggling a
// catalog item flips all of its labels in the persisted selection Set, and an
// incoming detection is matched back to its catalog item by label.
//
// `pat` is the vibration pattern in milliseconds as [buzz, gap, buzz, gap, ...],
// used both to drive real Vibration and to render the little pattern preview.

export type SoundGroup = "Safety" | "Home" | "People";

export interface CatalogItem {
  id: string;
  name: string;
  emoji: string;
  group: SoundGroup;
  safety: boolean;
  /** YAMNet/AudioSet display names this sound listens for. */
  labels: string[];
  /** Vibration pattern in ms: buzz, gap, buzz, gap, ... */
  pat: number[];
  /** Default-on when the user has never chosen. */
  defaultOn: boolean;
  /** Min window peak (0–1) to fire — gates loud-nearby-only sounds like speech. */
  minPeak?: number;
  /** Per-item min score (0–1), overriding the global default. */
  minScore?: number;
}

// Underlying labels use exact AudioSet display names. Any that don't exist in
// the loaded model are filtered out at runtime, so listing extras is harmless.
export const CATALOG: CatalogItem[] = [
  // ---- Safety ---------------------------------------------------------------
  {
    id: "smoke",
    name: "Smoke alarm",
    emoji: "🔥",
    group: "Safety",
    safety: true,
    labels: ["Smoke detector, smoke alarm", "Fire alarm"],
    pat: [300, 150, 300, 150, 300],
    defaultOn: true,
  },
  {
    id: "siren",
    name: "Siren",
    emoji: "🚨",
    group: "Safety",
    safety: true,
    labels: ["Siren", "Civil defense siren", "Emergency vehicle", "Ambulance (siren)"],
    pat: [150, 120, 150, 120, 600],
    defaultOn: true,
  },
  {
    id: "glass",
    name: "Glass breaking",
    emoji: "🥂",
    group: "Safety",
    safety: true,
    labels: ["Glass", "Shatter", "Breaking"],
    pat: [700],
    defaultOn: true,
  },
  // ---- Home -----------------------------------------------------------------
  {
    id: "doorbell",
    name: "Doorbell",
    emoji: "🔔",
    group: "Home",
    safety: false,
    labels: ["Doorbell", "Ding-dong"],
    pat: [250, 150, 550],
    defaultOn: true,
  },
  {
    id: "knock",
    name: "Knocking",
    emoji: "✊",
    group: "Home",
    safety: false,
    labels: ["Knock"],
    pat: [200, 150, 200, 150, 200],
    defaultOn: true,
    minScore: 0.15, // knocks score low and variable per window
  },
  {
    id: "water",
    name: "Running water",
    emoji: "💧",
    group: "Home",
    safety: false,
    labels: ["Water", "Water tap, faucet", "Sink (filling or washing)"],
    pat: [700],
    defaultOn: true,
  },
  // ---- People ---------------------------------------------------------------
  {
    id: "name",
    name: "Someone calling out",
    emoji: "📣",
    group: "People",
    safety: false,
    // Wordless yelling only; shouted words read as "Speech" (see "voice").
    labels: ["Shout", "Screaming", "Yell"],
    pat: [350, 150, 350],
    defaultOn: true,
  },
  {
    id: "voice",
    name: "Voice nearby",
    emoji: "🗣️",
    group: "People",
    safety: false,
    labels: ["Speech"],
    pat: [200, 120, 200],
    defaultOn: true,
    minPeak: 0.6, // loud/near only — skip background chatter
    minScore: 0.5, // real calling ~0.8+; keeps knocks from misfiring as voice
  },
  {
    id: "baby",
    name: "Baby crying",
    emoji: "👶",
    group: "People",
    safety: false,
    labels: ["Baby cry, infant cry", "Crying, sobbing"],
    pat: [400, 150, 400],
    defaultOn: true,
  },
  {
    id: "phone",
    name: "Phone ringing",
    emoji: "📞",
    group: "People",
    safety: false,
    labels: ["Telephone bell ringing", "Ringtone", "Telephone"],
    pat: [280, 150, 280, 150, 280],
    defaultOn: true,
  },
  {
    id: "dog",
    name: "Dog barking",
    emoji: "🐕",
    group: "People",
    safety: false,
    labels: ["Dog", "Bark", "Bow-wow"],
    pat: [180, 150, 180, 150, 180],
    defaultOn: true,
  },
];

export const GROUP_ORDER: SoundGroup[] = ["Safety", "Home", "People"];

const BY_ID = new Map(CATALOG.map((c) => [c.id, c]));
export const itemById = (id: string): CatalogItem | undefined => BY_ID.get(id);

/** Find the catalog item that owns a given YAMNet label, if any. */
export function itemForLabel(label: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.labels.includes(label));
}

/** Loudness gate (0 = none) for a label, from its item's minPeak. */
export function minPeakForLabel(label: string): number {
  return itemForLabel(label)?.minPeak ?? 0;
}

/** Per-label min score, or undefined to use the global default. */
export function minScoreForLabel(label: string): number | undefined {
  return itemForLabel(label)?.minScore;
}

/**
 * Given the full set of model labels and the persisted selection, return the
 * catalog labels that actually exist in the model for a single item. Used both
 * to toggle selection and to decide whether an item reads as "on".
 */
export function existingLabels(item: CatalogItem, allLabels: string[]): string[] {
  const set = new Set(allLabels);
  return item.labels.filter((l) => set.has(l));
}

/** An item is "on" when at least one of its real labels is selected. */
export function isItemOn(item: CatalogItem, selected: Set<string>): boolean {
  return item.labels.some((l) => selected.has(l));
}

/**
 * The selection to use when the user has never chosen (first launch). Every
 * `defaultOn` sound is enabled, restricted to labels the model actually has.
 * This is the source of truth for defaults — the picker mirrors it via isItemOn.
 */
export function defaultSelection(allLabels: string[]): Set<string> {
  const available = new Set(allLabels);
  const out = new Set<string>();
  for (const item of CATALOG) {
    if (!item.defaultOn) continue;
    for (const label of item.labels) if (available.has(label)) out.add(label);
  }
  return out;
}
