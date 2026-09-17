"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { GreGrade, GreStudyMode, GreWord } from "@/lib/types";
import { clozeExample, greByPack, greChoices, grePackCount, reviewQueue, shuffle } from "@/lib/gre";
import { gradeGreWord } from "@/lib/storage";
import { SpeakButton } from "@/components/SpeakButton";
import { GreWordCard } from "@/components/GreWordCard";

const modes: { id: GreStudyMode; title: string; hint: string }[] = [
  { id: "recall", title: "聽詞想義", hint: "先聽單字，用英文定義對意思" },
  { id: "choose", title: "看義選詞", hint: "最接近 GRE：看到定義，選出單字" },
  { id: "cloze", title: "例句填空", hint: "在句子裡認出這個詞怎麼用" },
];

type StudyQuery = {
  mode: GreStudyMode;
  pack: number;
  review: boolean;
};

function parseStudyQuery(search: string): StudyQuery {
  const sp = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const raw = sp.get("mode");
  const mode: GreStudyMode = raw === "choose" || raw === "cloze" || raw === "recall" ? raw : "recall";
  const packRaw = Number(sp.get("pack") || 1);
  const pack = Math.min(Math.max(Number.isFinite(packRaw) ? packRaw : 1, 1), grePackCount);
  return { mode, pack, review: sp.get("review") === "1" };
}

function writeStudyUrl(query: StudyQuery) {
  const sp = new URLSearchParams();
  sp.set("mode", query.mode);
  if (query.review) sp.set("review", "1");
  else sp.set("pack", String(query.pack));
  window.history.replaceState(null, "", `/words/study?${sp.toString()}`);
}

function GradeBar({ onGrade }: { onGrade: (grade: GreGrade) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        onClick={() => onGrade("again")}
        className="rounded-2xl border border-line bg-sand px-3 py-3 text-sm hover:border-copper"
      >
        還不熟
        <span className="mt-1 block text-[11px] text-muted">明天再看到</span>
      </button>
      <button
        type="button"
        onClick={() => onGrade("hard")}
        className="rounded-2xl border border-line bg-sand px-3 py-3 text-sm hover:border-copper"
      >
        有印象
        <span className="mt-1 block text-[11px] text-muted">隔不久再看</span>
      </button>
      <button
        type="button"
        onClick={() => onGrade("good")}
        className="rounded-2xl bg-forest px-3 py-3 text-sm text-white"
      >
        記住了
        <span className="mt-1 block text-[11px] text-white/70">拉長間隔</span>
      </button>
    </div>
  );
}

export function GreStudySession() {
  const [query, setQuery] = useState<StudyQuery | null>(null);
  const [deck, setDeck] = useState<GreWord[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; grade: GreGrade }[]>([]);

  useEffect(() => {
    const next = parseStudyQuery(window.location.search);
    setQuery(next);
    writeStudyUrl(next);
  }, []);

  useEffect(() => {
    if (!query) return;
    const source = query.review ? reviewQueue(20) : greByPack(query.pack);
    setDeck(shuffle(source));
    setIndex(0);
    setFlipped(false);
    setPicked(null);
    setDone([]);
  }, [query?.review, query?.pack]);

  useEffect(() => {
    setFlipped(false);
    setPicked(null);
  }, [query?.mode]);

  const current = deck?.[index];
  const choices = useMemo(
    () => (current && query ? greChoices(current) : []),
    [current?.id, query?.mode]
  );

  function applyQuery(next: StudyQuery) {
    if (query && next.mode !== query.mode) {
      setFlipped(false);
      setPicked(null);
    }
    setQuery(next);
    writeStudyUrl(next);
  }

  if (!query || !deck) {
    return <p className="text-muted">載入練習…</p>;
  }

  const { mode, pack, review } = query;

  if (!deck.length) {
    return (
      <p className="rounded-[28px] border border-dashed border-line p-8 text-muted">
        {review ? "今天沒有到期的複習卡，先去練一組新詞。" : "這一組暫時沒有單字。"}
        <Link href="/words" className="ml-2 text-copper">
          回單字首頁
        </Link>
      </p>
    );
  }

  if (index >= deck.length) {
    const again = done.filter((row) => row.grade === "again").length;
    const good = done.filter((row) => row.grade === "good").length;
    return (
      <section className="rounded-[28px] border border-line bg-sand p-8">
        <p className="text-xs tracking-[0.2em] text-copper">SESSION DONE</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl">這輪練完了</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          {done.length} 張裡，記住 {good} 張，還不熟 {again} 張。不熟的會較快再出現。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/words" className="rounded-full bg-ink px-5 py-2.5 text-sm text-sand">
            回單字首頁
          </Link>
          {!review && pack < grePackCount ? (
            <button
              type="button"
              onClick={() => applyQuery({ mode, pack: pack + 1, review: false })}
              className="rounded-full border border-line px-5 py-2.5 text-sm hover:border-copper"
            >
              下一組
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  function grade(next: GreGrade) {
    if (!current) return;
    gradeGreWord(current.id, next);
    setDone((prev) => [...prev, { id: current.id, grade: next }]);
    setIndex((n) => n + 1);
    setFlipped(false);
    setPicked(null);
  }

  function pick(word: GreWord) {
    setPicked(word.id);
    setFlipped(true);
  }

  const title = review ? "今日複習" : `第 ${pack} 組`;
  const modeMeta = modes.find((item) => item.id === mode);
  const cloze = current ? clozeExample(current) : "";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.2em] text-copper">
            {title} · {index + 1} / {deck.length}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">{modeMeta?.title}</h1>
          <p className="mt-1 text-sm text-muted">{modeMeta?.hint}</p>
        </div>
        <Link href="/words" className="text-sm text-muted hover:text-copper">
          離開
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => applyQuery({ mode: item.id, pack, review })}
            className={`rounded-full px-3 py-1.5 text-sm ${
              item.id === mode ? "bg-ink text-sand" : "border border-line bg-sand hover:border-copper"
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-paper-2">
        <div className="h-full bg-copper" style={{ width: `${(index / deck.length) * 100}%` }} />
      </div>

      {mode === "recall" && !flipped ? (
        <article className="rounded-[28px] border border-line bg-sand p-8 text-center">
          <p className="text-[11px] tracking-wide text-muted">{current.pos}</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-5xl">{current.word}</h2>
          <div className="mt-5 flex justify-center">
            <SpeakButton text={current.word} label="再唸一次" rate={0.8} />
          </div>
          <p className="mt-6 text-sm text-muted">點喇叭聽發音，先用英文定義對意思，再翻面核對。</p>
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="mt-6 rounded-full bg-ink px-6 py-3 text-sm text-sand"
          >
            看定義與例句
          </button>
        </article>
      ) : null}

      {mode === "choose" && !flipped ? (
        <article className="rounded-[28px] border border-line bg-sand p-6">
          <p className="text-[11px] tracking-wide text-copper">英文定義</p>
          <div className="mt-2 flex items-start gap-3">
            <p className="min-w-0 flex-1 font-[family-name:var(--font-display)] text-2xl leading-snug">{current.defEn}</p>
            <SpeakButton text={current.defEn} label="唸定義" />
          </div>
          <p className="mt-4 text-sm text-muted">選出對應的單字。這最接近 GRE 填空時你要做的事。</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {choices.map((choice) => (
              <div key={choice.id} className="flex items-center gap-2 rounded-2xl border border-line bg-paper-2 px-3 py-2">
                <button type="button" onClick={() => pick(choice)} className="min-w-0 flex-1 text-left">
                  <span className="font-[family-name:var(--font-display)] text-xl">{choice.word}</span>
                  <span className="ml-2 text-xs text-muted">{choice.pos}</span>
                </button>
                <SpeakButton text={choice.word} label={`唸 ${choice.word}`} rate={0.8} />
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {mode === "cloze" && !flipped ? (
        <article className="rounded-[28px] border border-line bg-sand p-6">
          <p className="text-[11px] tracking-wide text-copper">把缺的詞補回去</p>
          <div className="mt-3 flex items-start gap-3">
            <p className="min-w-0 flex-1 font-[family-name:var(--font-display)] text-2xl leading-snug">{cloze}</p>
            <SpeakButton text={cloze} label="唸挖空例句" />
          </div>
          <p className="mt-3 text-sm text-muted">詞性提示：{current.pos}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {choices.map((choice) => (
              <div key={choice.id} className="flex items-center gap-2 rounded-2xl border border-line bg-paper-2 px-3 py-2">
                <button type="button" onClick={() => pick(choice)} className="min-w-0 flex-1 text-left">
                  <span className="font-[family-name:var(--font-display)] text-xl">{choice.word}</span>
                </button>
                <SpeakButton text={choice.word} label={`唸 ${choice.word}`} rate={0.8} />
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {flipped && current ? (
        <div className="space-y-4">
          {picked ? (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                picked === current.id ? "bg-forest text-white" : "bg-copper/15 text-copper-2"
              }`}
            >
              {picked === current.id ? "選對了。把例句跟陷阱再聽一遍，記憶會比較穩。" : `正確是 ${current.word}。對照定義和例句，看差在哪。`}
            </p>
          ) : null}
          <GreWordCard word={current} />
          <GradeBar onGrade={grade} />
        </div>
      ) : null}
    </div>
  );
}
