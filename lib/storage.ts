export const STORAGE = {
  completed: "cadence-completed-days",
  favorites: "cadence-favorites",
  startDate: "cadence-start-date",
  lastDay: "cadence-last-day",
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getCompletedDays() {
  return readJson<number[]>(STORAGE.completed, []);
}

export function setCompletedDays(days: number[]) {
  localStorage.setItem(STORAGE.completed, JSON.stringify([...new Set(days)].sort((a, b) => a - b)));
}

export function toggleCompletedDay(day: number) {
  const current = getCompletedDays();
  const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
  setCompletedDays(next);
  return next;
}

export function getFavorites() {
  return readJson<string[]>(STORAGE.favorites, []);
}

export function toggleFavorite(id: string) {
  const current = getFavorites();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  localStorage.setItem(STORAGE.favorites, JSON.stringify(next));
  return next;
}

export function getStartDate() {
  return typeof window === "undefined" ? "" : localStorage.getItem(STORAGE.startDate) || "";
}

export function setStartDate(isoDate: string) {
  localStorage.setItem(STORAGE.startDate, isoDate);
}

export function todayPlanDay() {
  const start = getStartDate();
  if (!start) return 1;
  const startMs = new Date(`${start}T00:00:00`).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diff = Math.floor((today - startMs) / 86400000) + 1;
  return Math.min(30, Math.max(1, diff));
}

export function setLastDay(day: number) {
  localStorage.setItem(STORAGE.lastDay, String(day));
}

export function getLastDay() {
  const raw = typeof window === "undefined" ? "" : localStorage.getItem(STORAGE.lastDay);
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 && n <= 30 ? n : 0;
}
