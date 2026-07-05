// Fuzzy-match the user's name in transcribed speech via edit distance + Soundex.

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  const cur = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur.slice();
  }
  return prev[n];
}

// Soundex: first letter + up to 3 consonant-class digits.
function soundex(word: string): string {
  const s = word.toUpperCase().replace(/[^A-Z]/g, "");
  if (!s) return "";
  const code = (c: string) =>
    "BFPV".includes(c) ? "1"
    : "CGJKQSXZ".includes(c) ? "2"
    : "DT".includes(c) ? "3"
    : c === "L" ? "4"
    : "MN".includes(c) ? "5"
    : c === "R" ? "6"
    : "";
  let out = s[0];
  let prev = code(s[0]);
  for (let i = 1; i < s.length && out.length < 4; i++) {
    const d = code(s[i]);
    if (d && d !== prev) out += d;
    if (s[i] !== "H" && s[i] !== "W") prev = d;
  }
  return (out + "000").slice(0, 4);
}

// Longer names tolerate more edits.
function tolerance(len: number): number {
  if (len <= 4) return 1;
  if (len <= 7) return 2;
  return 3;
}

export function matchesName(transcript: string, name: string): boolean {
  const targets = normalize(name)
    .split(" ")
    .filter((t) => t.length >= 2);
  if (!targets.length) return false;

  const words = normalize(transcript).split(" ").filter(Boolean);

  return targets.some((target) => {
    const tol = tolerance(target.length);
    const sdx = soundex(target);
    return words.some(
      (w) =>
        levenshtein(w, target) <= tol ||
        (w.length >= 3 && soundex(w) === sdx)
    );
  });
}
