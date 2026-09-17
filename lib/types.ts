export type Source = "catalogue" | "phrase" | "verb" | "style";

export type Example = {
  en: string;
  zh: string;
  scene?: string;
};

export type Slot = {
  name: string;
  examples: string[];
};

export type RelatedItem = {
  id: string;
  source: Source;
  titleEn: string;
  titleZh: string;
  role: string;
};

export type Item = {
  id: string;
  source: Source;
  titleEn: string;
  titleZh: string;
  usage: string;
  note?: string;
  category: string;
  categoryId: string;
  categoryNo?: number;
  block?: string;
  blockName?: string;
  tags: string[];
  slots?: Slot[];
  sceneHint?: string;
  synonyms?: string;
  examples: Example[];
  layerFamily?: string;
  layerRole?: string;
  togetherHint?: string;
  togetherExample?: string;
  togetherZh?: string;
  related?: RelatedItem[];
};

export type PlanDay = {
  day: number;
  week: number;
  title: string;
  titleEn: string;
  goal: string;
  newIds: string[];
  reviewIds: string[];
};
