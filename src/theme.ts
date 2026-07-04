// Design tokens for the "Sonar" UI. Kept in one place so screens/components
// stay visually consistent. Values mirror the reference design.

export const colors = {
  canvas: "#EAE8E2",
  canvasTop: "#F0EEE9",
  surface: "#FFFFFF",
  surface2: "#F5F4F1",
  ink: "#17161A",
  muted: "#6F6C65",
  faint: "#A6A29A",
  line: "#ECEAE5",
  accent: "#4B47E0",
  accentSoft: "#ECEBFC",
  safety: "#E1492C",
  safetySoft: "#FBE9E4",
  ok: "#1F9A6D",

  // dark hero card
  heroBg: "#17161A",
  heroLive: "#C9C8F5",
  heroPip: "#7C78F0",
  heroSub: "#A9A7C4",
  heroPrivacy: "#8C8AB0",
} as const;

export const radius = {
  lg: 30,
  md: 22,
  sm: 16,
} as const;

// A soft, layered card shadow approximated for RN (iOS shadow + Android elevation).
export const cardShadow = {
  shadowColor: "#17161A",
  shadowOpacity: 0.08,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 12 },
  elevation: 4,
} as const;

export const bigShadow = {
  shadowColor: "#17161A",
  shadowOpacity: 0.18,
  shadowRadius: 30,
  shadowOffset: { width: 0, height: 16 },
  elevation: 12,
} as const;
