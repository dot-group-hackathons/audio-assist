// Curated catalog of recognizable sounds shown in the UI.
//
// The real classifier (YAMNet) emits ~521 AudioSet class names. That flat list
// is too granular to show a user, so each catalog entry maps one friendly,
// icon-bearing sound to one or more underlying YAMNet label strings. Toggling a
// catalog item flips all of its labels in the persisted selection Set, and an
// incoming detection is matched back to its catalog item by label.

export type SoundGroup = "Safety" | "Home" | "People";

export interface CatalogItem {
  id: string;
  name: string;
  emoji: string;
  group: SoundGroup;
  safety: boolean;
  /** YAMNet/AudioSet display names this sound listens for. */
  labels: string[];
  /** Vibration pattern in ms: buzz, gap, buzz, gap... */
  pat: number[];
  /** Default-on when the user has never chosen. */
  defaultOn: boolean;
  /** Min window peak (0–1) */
  minPeak?: number;
  /** Per-item min score (0–1), overriding the global default. */
  minScore?: number;
}

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
    labels: [
      "Siren",
      "Civil defense siren",
      "Emergency vehicle",
      "Police car (siren)",
      "Ambulance (siren)",
      "Fire engine, fire truck (siren)",
    ],
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
  {
    id: "carAlarm",
    name: "Car alarm",
    emoji: "🚗",
    group: "Safety",
    safety: true,
    labels: ["Car alarm"],
    pat: [200, 100, 200, 100, 200, 100, 200],
    defaultOn: true,
  },
  {
    id: "alarm",
    name: "Alarm / buzzer",
    emoji: "⏰",
    group: "Safety",
    safety: true,
    labels: ["Alarm", "Alarm clock", "Buzzer"],
    pat: [250, 150, 250, 150, 250],
    defaultOn: true,
  },
  {
    id: "gunshot",
    name: "Gunshot",
    emoji: "🔫",
    group: "Safety",
    safety: true,
    labels: ["Gunshot, gunfire", "Machine gun", "Artillery fire"],
    pat: [500],
    defaultOn: true,
  },
  {
    id: "explosion",
    name: "Explosion",
    emoji: "💥",
    group: "Safety",
    safety: true,
    labels: ["Explosion", "Boom"],
    pat: [600],
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
    minScore: 0.15,
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
  {
    id: "microwave",
    name: "Microwave / timer beep",
    emoji: "⏲️",
    group: "Home",
    safety: false,
    labels: ["Microwave oven"],
    pat: [150, 100, 150, 100, 150],
    defaultOn: true,
  },
  {
    id: "vacuum",
    name: "Vacuum cleaner",
    emoji: "🧹",
    group: "Home",
    safety: false,
    labels: ["Vacuum cleaner"],
    pat: [500],
    defaultOn: false,
  },
  {
    id: "thunderstorm",
    name: "Thunder",
    emoji: "⛈️",
    group: "Home",
    safety: false,
    labels: ["Thunderstorm", "Thunder"],
    pat: [400, 200, 400],
    defaultOn: false,
  },

  // ---- People -----------------------------------------------------------------
  {
    id: "name",
    name: "Someone calling out",
    emoji: "📣",
    group: "People",
    safety: false,
    labels: ["Shout", "Screaming", "Yell", "Bellow", "Children shouting"],
    pat: [350, 150, 350],
    defaultOn: true,
  },
  {
    id: "voice",
    name: "Voice nearby",
    emoji: "🗣️",
    group: "People",
    safety: false,
    labels: ["Speech", "Conversation"],
    pat: [200, 120, 200],
    defaultOn: true,
    minPeak: 0.6,
    minScore: 0.5,
  },
  {
    id: "baby",
    name: "Baby crying",
    emoji: "👶",
    group: "People",
    safety: false,
    labels: ["Baby cry, infant cry", "Crying, sobbing", "Wail, moan"],
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
    labels: ["Dog", "Bark", "Bow-wow", "Growling", "Howl", "Yip"],
    pat: [180, 150, 180, 150, 180],
    defaultOn: true,
  },
  {
    id: "cat",
    name: "Cat meowing",
    emoji: "🐈",
    group: "People",
    safety: false,
    labels: ["Cat", "Meow", "Caterwaul"],
    pat: [220, 150, 220],
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
 * catalog labels that actually exist in the model for a single item.
 */
export function existingLabels(item: CatalogItem, allLabels: string[]): string[] {
  const set = new Set(allLabels);
  return item.labels.filter((l) => set.has(l));
}

// An item is "on" when at least one of its real labels is selected.
export function isItemOn(item: CatalogItem, selected: Set<string>): boolean {
  return item.labels.some((l) => selected.has(l));
}

// The selection to use when the user has never chosen (first launch).
export function defaultSelection(allLabels: string[]): Set<string> {
  const available = new Set(allLabels);
  const out = new Set<string>();
  for (const item of CATALOG) {
    if (!item.defaultOn) continue;
    for (const label of item.labels) if (available.has(label)) out.add(label);
  }
  return out;
}
