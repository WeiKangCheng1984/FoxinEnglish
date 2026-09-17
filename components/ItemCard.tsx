"use client";

import { useMemo, useState } from "react";
import type { Item } from "@/lib/types";
import { sourceLabel } from "@/lib/data";
import { SpeakButton } from "@/components/SpeakButton";
import { FavoriteButton } from "@/components/FavoriteButton";

function fillTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\[([^\]]+)\]/g, (_, name: string) => values[name] || `[${name}]`);
}

function slotSuggestions(item: Item, hole: string) {
  const exact = item.slots?.find((s) => s.name === hole);
  if (exact?.examples.length) return exact.examples;
  const loose = item.slots?.find((s) => s.name.includes(hole) || hole.includes(s.name));
  return loose?.examples || [];
}

export function ItemCard({ item, compact = false }: { item: Item; compact?: boolean }) {
  const holes = useMemo(
    () => [...item.titleEn.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]),
    [item.titleEn]
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const preview = holes.length ? fillTemplate(item.titleEn, values) : item.titleEn;

  return (
    <article className="rounded-[28px] border border-line bg-sand/90 p-5 shadow-[0_16px_40px_rgba(28,24,20,0.04)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-forest px-2.5 py-1 text-[11px] tracking-wide text-white">
          {sourceLabel[item.source]}
        </span>
        {item.layerFamily ? (
          <span className="rounded-full border border-copper/40 bg-paper-2 px-2.5 py-1 text-[11px] tracking-wide text-copper">
            跨層 · {item.layerFamily}
          </span>
        ) : null}
        <span className="text-[11px] text-muted">
          {item.category}
          {item.blockName ? ` · ${item.blockName}` : item.block ? ` · ${item.block}` : ""}
        </span>
        <div className="ml-auto">
          <FavoriteButton id={item.id} />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-[family-name:var(--font-display)] text-2xl leading-snug text-ink">{item.titleEn}</h3>
          {item.titleZh ? (
            <p className="mt-1 text-sm text-muted">
              {item.source === "catalogue" ? <span className="mr-2 text-[11px] tracking-wide text-copper">公式大意</span> : null}
              {item.titleZh}
            </p>
          ) : null}
        </div>
        <SpeakButton text={preview} />
      </div>

      {item.synonyms ? <p className="mt-2 text-xs text-muted">書面對應：{item.synonyms}</p> : null}
      {item.usage ? (
        <p className="mt-3 text-sm leading-7 text-ink/80">
          <span className="mr-2 text-[11px] tracking-wide text-copper">
            {item.source === "catalogue" ? "使用時機" : "用法"}
          </span>
          {item.usage}
        </p>
      ) : null}
      {item.note && item.note !== item.usage ? (
        <p className="mt-1 text-xs text-copper-2">注意：{item.note}</p>
      ) : null}

      {holes.length > 0 && !compact ? (
        <div className="mt-4 rounded-2xl bg-paper-2/80 p-4">
          <p className="mb-2 text-xs tracking-wide text-muted">組裝這句話</p>
          <p className="mb-3 font-[family-name:var(--font-display)] text-lg leading-snug">{preview}</p>
          <div className="flex items-center gap-2">
            <SpeakButton text={preview} label="唸組裝後的句子" />
            <span className="text-xs text-muted">點選下方詞彙，或自己輸入</span>
          </div>
          <div className="mt-3 space-y-3">
            {holes.map((hole) => (
              <div key={hole}>
                <label className="mb-1 block text-xs text-muted">[{hole}]</label>
                <input
                  value={values[hole] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [hole]: e.target.value }))}
                  placeholder={`填入 ${hole}`}
                  className="w-full rounded-xl border border-line bg-sand px-3 py-2 text-sm outline-none focus:border-copper"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {slotSuggestions(item, hole).map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setValues((prev) => ({ ...prev, [hole]: chip }))}
                      className={`rounded-full border px-2.5 py-1 text-xs ${
                        values[hole] === chip
                          ? "border-copper bg-copper text-white"
                          : "border-line bg-sand hover:border-copper"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!compact && item.togetherHint ? (
        <div className="mt-4 rounded-2xl border border-copper/30 bg-paper-2/90 p-4">
          <p className="text-[11px] tracking-wide text-copper">這兩層怎麼一起用 · {item.layerFamily}</p>
          {item.layerRole ? <p className="mt-1 text-xs text-forest">{item.layerRole}</p> : null}
          <p className="mt-2 text-sm leading-7">{item.togetherHint}</p>
          {item.togetherExample ? (
            <div className="mt-3 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] leading-7">{item.togetherExample}</p>
                {item.togetherZh ? <p className="mt-1 text-sm text-muted">{item.togetherZh}</p> : null}
              </div>
              <SpeakButton text={item.togetherExample} label="唸串連例句" />
            </div>
          ) : null}
          {item.related?.length ? (
            <ul className="mt-3 space-y-2">
              {item.related.map((rel) => (
                <li key={rel.id} className="text-sm">
                  <span className="mr-2 rounded-full bg-ink px-2 py-0.5 text-[10px] text-sand">
                    {sourceLabel[rel.source]}
                  </span>
                  <span className="font-[family-name:var(--font-display)]">{rel.titleEn}</span>
                  {rel.role ? <span className="mt-0.5 block text-xs text-muted">{rel.role}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {!compact && item.examples.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {item.examples.map((ex, i) => (
            <li key={`${item.id}-${i}`} className="flex items-start gap-3 border-t border-line/80 pt-3">
              <div className="min-w-0 flex-1">
                {ex.scene ? (
                  <span className="mb-1 inline-block text-[11px] tracking-wide text-copper">{ex.scene}</span>
                ) : null}
                <p className="text-[15px] leading-7">{ex.en}</p>
                {ex.zh ? <p className="mt-1 text-sm text-muted">{ex.zh}</p> : null}
              </div>
              <SpeakButton text={ex.en} />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
