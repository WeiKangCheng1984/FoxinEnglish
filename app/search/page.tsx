"use client";

import { useMemo, useState } from "react";
import { ItemCard } from "@/components/ItemCard";
import { GreWordCard } from "@/components/GreWordCard";
import { matchingLayerFamilies, searchItems, sourceHint, sourceLabel } from "@/lib/data";
import { searchGreWords } from "@/lib/gre";
import { SpeakButton } from "@/components/SpeakButton";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const families = useMemo(() => matchingLayerFamilies(q), [q]);
  const allHits = useMemo(() => searchItems(q), [q]);
  const greAll = useMemo(() => searchGreWords(q), [q]);
  const greHits = greAll.slice(0, 12);
  const results = allHits.slice(0, 40);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs tracking-[0.2em] text-copper">SEARCH</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">搜尋</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          可搜句型、公式、風格，也可搜 GRE 單字。試 <span className="text-ink">bottom line</span> 或{" "}
          <span className="text-ink">aberrant</span>。
        </p>
      </header>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜英文、中文、公式、片語或 GRE 單字"
        className="w-full rounded-2xl border border-line bg-sand px-4 py-3 outline-none focus:border-copper"
      />
      {q ? (
        <p className="text-sm text-muted">
          句子 {allHits.length} 筆、單字 {greAll.length} 筆
          {families.length ? ` · ${families.length} 組跨層說法` : ""}
        </p>
      ) : null}

      {families.map((family) => (
        <section
          key={family.id}
          className="rounded-[28px] border border-copper/35 bg-paper-2 p-5 shadow-[0_16px_40px_rgba(28,24,20,0.04)]"
        >
          <p className="text-[11px] tracking-wide text-copper">這兩層怎麼一起用</p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl">{family.title}</h2>
          <p className="mt-3 text-sm leading-7">{family.how}</p>
          {family.together ? (
            <div className="mt-4 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] leading-7">{family.together}</p>
                {family.togetherZh ? <p className="mt-1 text-sm text-muted">{family.togetherZh}</p> : null}
              </div>
              <SpeakButton text={family.together} label="唸串連例句" />
            </div>
          ) : null}
          <ul className="mt-4 flex flex-wrap gap-2">
            {(Object.entries(family.roles) as [keyof typeof sourceLabel, string][]).map(([source, role]) => (
              <li key={source} className="rounded-2xl bg-sand px-3 py-2 text-xs leading-6">
                <span className="mr-2 text-copper">{sourceLabel[source]}</span>
                {role}
                <span className="mt-0.5 block text-muted">{sourceHint[source]}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {greHits.length ? (
        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">GRE 單字</h2>
          {greHits.map((word) => (
            <GreWordCard key={word.id} word={word} />
          ))}
        </section>
      ) : null}

      <div className="space-y-4">
        {results.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
