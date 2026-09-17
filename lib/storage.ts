import type { GreGrade } from "@/lib/types";

export const STORAGE = {
  completed: "cadence-completed-days",
  favorites: "cadence-favorites",
  startDate: "cadence-start-date",
  lastDay: "cadence-last-day",
  greProgress: "cadence-gre-progress",
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

export type GreCardState = {
  box: number;
  seen: number;
  last: string;
  wrong: number;
};

const GRE_BOX_DAYS = [0, 0, 1, 3, 7, 14];

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getGreProgress() {
  return readJson<Record<string, GreCardState>>(STORAGE.greProgress, {});
}

export function isGreDue(state: GreCardState | undefined) {
  if (!state) return true;
  const wait = GRE_BOX_DAYS[state.box] ?? 0;
  if (wait <= 0) return true;
  return addDays(state.last, wait) <= todayIso();
}

export function gradeGreWord(id: string, grade: GreGrade) {
  const all = getGreProgress();
  const prev = all[id];
  let box = prev?.box || 1;
  if (grade === "again") box = 1;
  else if (grade === "hard") box = Math.min(3, Math.max(2, box));
  else box = Math.min(5, box + 1);
  all[id] = {
    box,
    seen: (prev?.seen || 0) + 1,
    last: todayIso(),
    wrong: (prev?.wrong || 0) + (grade === "again" ? 1 : 0),
  };
  localStorage.setItem(STORAGE.greProgress, JSON.stringify(all));
  return all[id];
}
