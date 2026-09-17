import catalogue from "@/data/catalogue.json";
import phrases from "@/data/phrases.json";
import verbs from "@/data/verbs.json";
import style from "@/data/style.json";
import plan from "@/data/plan.json";
import layers from "@/data/layers.json";
import type { Item, PlanDay, Source } from "@/lib/types";

export const catalogueTypes = catalogue.types;
export const phraseCategories = phrases.categories;
export const verbStages = verbs.stages;
export const styleStages = style.stages;
export const planDays = plan as PlanDay[];
export type LayerFamily = {
  id: string;
  title: string;
  keywords: string[];
  how: string;
  together?: string;
  togetherZh?: string;
  roles: Partial<Record<Source, string>>;
};

export const layerFamilies = layers as LayerFamily[];

export const allItems: Item[] = [
  ...(catalogue.items as Item[]),
  ...(phrases.items as Item[]),
  ...(verbs.items as Item[]),
  ...(style.items as Item[]),
];

const itemMap = new Map(allItems.map((item) => [item.id, item]));

export function getItem(id: string) {
  return itemMap.get(id);
}

export function getItems(ids: string[]) {
  return ids.map((id) => itemMap.get(id)).filter((item): item is Item => Boolean(item));
}

export function getPlanDay(day: number) {
  return planDays.find((entry) => entry.day === day);
}

export function itemsBySource(source: Source) {
  return allItems.filter((item) => item.source === source);
}

export function matchingLayerFamilies(query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return [];
  return layerFamilies.filter((family) => {
    const keys = [family.title, family.id.replace(/-/g, " "), ...(family.keywords || [])].map((x) =>
      x.toLowerCase()
    );
    return keys.some((key) => key.includes(q) || (q.includes(key) && key.length >= 4));
  });
}

export function searchItems(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const families = matchingLayerFamilies(q);
  const familyTitles = new Set(families.map((family) => family.title.toLowerCase()));
  return allItems
    .filter((item) => {
      const hay = [
        item.titleEn,
        item.titleZh,
        item.usage,
        item.category,
        item.block,
        item.blockName,
        item.synonyms,
        item.layerFamily,
        ...item.tags,
        ...item.examples.flatMap((ex) => [ex.en, ex.zh]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => {
      const aLayer = a.layerFamily && familyTitles.has(a.layerFamily.toLowerCase()) ? 0 : 1;
      const bLayer = b.layerFamily && familyTitles.has(b.layerFamily.toLowerCase()) ? 0 : 1;
      if (aLayer !== bLayer) return aLayer - bLayer;
      const aTitle = a.titleEn.toLowerCase().includes(q) || a.titleZh.toLowerCase().includes(q) ? 0 : 1;
      const bTitle = b.titleEn.toLowerCase().includes(q) || b.titleZh.toLowerCase().includes(q) ? 0 : 1;
      return aTitle - bTitle;
    });
}

export const sourceLabel: Record<Source, string> = {
  catalogue: "對話公式",
  phrase: "句型積木",
  verb: "片語動詞",
  style: "個人風格",
};

export const sourceHint: Record<Source, string> = {
  catalogue: "對話裡這一刻要做的事",
  phrase: "把句子組出來的積木",
  verb: "讓動作聽起來自然的片語",
  style: "讓語氣聽起來像你",
};
