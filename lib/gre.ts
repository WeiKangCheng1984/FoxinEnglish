import gre from "@/data/gre.json";
import type { GreWord } from "@/lib/types";
import { getGreProgress, isGreDue } from "@/lib/storage";

export const grePackSize = gre.packSize as number;
export const greWords = gre.items as GreWord[];
export const grePackCount = Math.ceil(greWords.length / grePackSize);

const greMap = new Map(greWords.map((word) => [word.id, word]));

export function getGreWord(id: string) {
  return greMap.get(id);
}

export function greByPack(pack: number) {
  return greWords.filter((word) => word.pack === pack);
}

export function searchGreWords(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return greWords.filter((word) => {
    const hay = [word.word, word.pos, word.defEn, word.defZh, word.usage, word.exampleEn, word.exampleZh, word.synonyms, word.antonyms]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function clozeExample(word: GreWord) {
  const pattern = new RegExp(`\\b${word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  if (!pattern.test(word.exampleEn)) {
    return word.exampleEn.replace(word.word, "______");
  }
  return word.exampleEn.replace(pattern, "______");
}

export function greChoices(correct: GreWord, count = 4) {
  const pool = greWords.filter((word) => word.id !== correct.id && word.pos === correct.pos);
  const extra = greWords.filter((word) => word.id !== correct.id && word.pos !== correct.pos);
  const mixed = shuffle([...pool, ...extra]).slice(0, count - 1);
  return shuffle([correct, ...mixed]);
}

export function reviewQueue(limit = 20) {
  const progress = typeof window === "undefined" ? {} : getGreProgress();
  const seenDue = greWords.filter((word) => progress[word.id] && isGreDue(progress[word.id]));
  seenDue.sort((a, b) => (progress[a.id]?.box || 1) - (progress[b.id]?.box || 1));
  return seenDue.slice(0, limit);
}

export function greHubStats() {
  const progress = getGreProgress();
  let seen = 0;
  let mastered = 0;
  let due = 0;
  let unseen = 0;
  for (const word of greWords) {
    const state = progress[word.id];
    if (!state) {
      unseen += 1;
      continue;
    }
    seen += 1;
    if (state.box >= 4) mastered += 1;
    if (isGreDue(state)) due += 1;
  }
  return { total: greWords.length, seen, mastered, due, unseen };
}

export function shuffle<T>(list: T[]) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
