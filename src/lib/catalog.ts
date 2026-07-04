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
  },
  {
    id: "water",
    name: "Running water",
    emoji: "💧",
    group: "Home",
    safety: false,
    labels: ["Water", "Water tap, faucet", "Sink (filling or washing)"],
    pat: [700],
    defaultOn: false,
  },
  // ---- People ---------------------------------------------------------------
  {
    id: "name",
    name: "Someone calling out",
    emoji: "📣",
    group: "People",
    safety: false,
    labels: ["Shout", "Screaming", "Yell", "Speech"],
    pat: [350, 150, 350],
    defaultOn: true,
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
    defaultOn: false,
  },
];

export const GROUP_ORDER: SoundGroup[] = ["Safety", "Home", "People"];

const BY_ID = new Map(CATALOG.map((c) => [c.id, c]));
export const itemById = (id: string): CatalogItem | undefined => BY_ID.get(id);

/** Find the catalog item that owns a given YAMNet label, if any. */
export function itemForLabel(label: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.labels.includes(label));
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
