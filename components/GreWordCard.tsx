"use client";

import type { GreWord } from "@/lib/types";
import { SpeakButton } from "@/components/SpeakButton";
import { FavoriteButton } from "@/components/FavoriteButton";

export function GreWordCard({ word, showWord = true }: { word: GreWord; showWord?: boolean }) {
  return (
    <article className="rounded-[28px] border border-line bg-sand/90 p-5 shadow-[0_16px_40px_rgba(28,24,20,0.04)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-forest px-2.5 py-1 text-[11px] tracking-wide text-white">GRE 單字</span>
        <span className="text-[11px] text-muted">
          {String(word.no).padStart(3, "0")} · 第 {word.pack} 組
        </span>
        <div className="ml-auto">
          <FavoriteButton id={word.id} />
        </div>
      </div>

      {showWord ? (
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-[family-name:var(--font-display)] text-3xl leading-snug">{word.word}</h3>
            <p className="mt-1 text-sm text-muted">{word.pos}</p>
          </div>
          <SpeakButton text={word.word} label="唸單字" rate={0.8} />
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl bg-paper-2/80 p-4">
        <p className="text-[11px] tracking-wide text-copper">英文定義 · GRE 考的是這一層</p>
        <div className="mt-2 flex items-start gap-3">
          <p className="min-w-0 flex-1 text-[15px] leading-7">{word.defEn}</p>
          <SpeakButton text={word.defEn} label="唸英文定義" />
        </div>
        <p className="mt-2 text-sm text-muted">中文確認：{word.defZh}</p>
      </div>

      <p className="mt-3 text-sm leading-7 text-ink/80">
        <span className="mr-2 text-[11px] tracking-wide text-copper">用法／陷阱</span>
        {word.usage}
      </p>

      <div className="mt-4 flex items-start gap-3 border-t border-line/80 pt-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] tracking-wide text-copper">放進句子裡</p>
          <p className="mt-1 text-[15px] leading-7">{word.exampleEn}</p>
          {word.exampleZh ? <p className="mt-1 text-sm text-muted">{word.exampleZh}</p> : null}
        </div>
        <SpeakButton text={word.exampleEn} label="唸例句" />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {word.synonyms ? (
          <span className="rounded-full bg-paper-2 px-3 py-1.5">同義 {word.synonyms}</span>
        ) : null}
        {word.antonyms ? (
          <span className="rounded-full bg-paper-2 px-3 py-1.5">反義 {word.antonyms}</span>
        ) : null}
      </div>
    </article>
  );
}
