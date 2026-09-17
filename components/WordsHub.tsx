"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { greByPack, greHubStats, grePackCount, grePackSize } from "@/lib/gre";
import { getGreProgress } from "@/lib/storage";

const modes = [
  {
    mode: "recall",
    kicker: "1",
    title: "聽詞想義",
    desc: "先聽發音，自己用英文定義對意思，再翻面看中文、用法和例句。",
  },
  {
    mode: "choose",
    kicker: "2",
    title: "看義選詞",
    desc: "只給英文定義，四選一。最接近 GRE 閱讀裡你要做的判斷。",
  },
  {
    mode: "cloze",
    kicker: "3",
    title: "例句填空",
    desc: "把詞放回句子，確認你認得它在語境裡怎麼用，而不只是背中文。",
  },
] as const;

export function WordsHub() {
  const [stats, setStats] = useState({ total: 800, seen: 0, mastered: 0, due: 0, unseen: 800 });
  const [packSeen, setPackSeen] = useState<number[]>([]);

  useEffect(() => {
    const progress = getGreProgress();
    setStats(greHubStats());
    setPackSeen(
      Array.from({ length: grePackCount }, (_, i) => {
        const pack = i + 1;
        return greByPack(pack).filter((word) => progress[word.id]).length;
      })
    );
  }, []);

  const nextPack = (packSeen.findIndex((n) => n < grePackSize) + 1) || 1;
  const reviewHref = `/words/study?mode=choose&review=1`;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-line bg-sand p-5">
          <p className="text-xs text-muted">已見過</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl">
            {stats.seen} / {stats.total}
          </p>
        </div>
        <div className="rounded-[28px] border border-line bg-sand p-5">
          <p className="text-xs text-muted">較熟（間隔已拉開）</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl">{stats.mastered}</p>
        </div>
        <div className="rounded-[28px] border border-line bg-sand p-5">
          <p className="text-xs text-muted">今天該複習</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl">{stats.due}</p>
          <p className="mt-1 text-xs text-muted">尚未開始 {stats.unseen}</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-line bg-ink p-6 text-sand md:p-8">
        <p className="text-xs tracking-[0.2em] text-sand/50">TODAY</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">先複習，再往下組</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-sand/75">
          系統用間隔重複：還不熟的明天會再出現，記住了的會隔越來越久。每次約 20 張，夠練、不會一次灌完。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={reviewHref} className="rounded-full bg-copper px-5 py-2.5 text-sm text-white">
            今日複習（看義選詞）
          </Link>
          <Link
            href={`/words/study?mode=recall&pack=${nextPack}`}
            className="rounded-full border border-sand/20 px-5 py-2.5 text-sm"
          >
            新詞：第 {nextPack} 組
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {modes.map((item) => (
          <Link
            key={item.mode}
            href={`/words/study?mode=${item.mode}&pack=${nextPack}`}
            className="rounded-[28px] border border-line bg-sand p-5 transition hover:border-copper"
          >
            <p className="text-xs tracking-[0.2em] text-copper">MODE {item.kicker}</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-muted">{item.desc}</p>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">40 組清單</h2>
        <p className="mt-2 text-sm text-muted">每組 20 詞。點進去會用「聽詞想義」開始，組內可再換模式。</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {Array.from({ length: grePackCount }, (_, i) => {
            const pack = i + 1;
            const seen = packSeen[i] || 0;
            return (
              <Link
                key={pack}
                href={`/words/study?mode=recall&pack=${pack}`}
                className="rounded-2xl border border-line bg-sand px-3 py-3 text-sm hover:border-copper"
              >
                <span className="block font-[family-name:var(--font-display)] text-lg">第 {pack} 組</span>
                <span className="text-xs text-muted">{seen} / {grePackSize}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
