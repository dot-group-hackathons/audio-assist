import type { CatalogItem } from "./catalog";

/** A logged sound detection, shown on Home and History. */
export interface Detection {
  id: string;
  item: CatalogItem;
  /** Model confidence 0..1. */
  score: number;
  /** Wall-clock time of detection. */
  at: number;
}

export const fmtTime = (ms: number): string => {
  const d = new Date(ms);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

export const dayLabel = (ms: number): string => {
  const d = new Date(ms);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long" });
};
