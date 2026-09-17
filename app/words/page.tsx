import Link from "next/link";
import { WordsHub } from "@/components/WordsHub";
import { grePackCount, grePackSize, greWords } from "@/lib/gre";

export default function WordsPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs tracking-[0.2em] text-copper">VOCABULARY</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">GRE 單字複習</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          {greWords.length} 個高頻詞，分成 {grePackCount} 組、每組 {grePackSize}{" "}
          個。GRE 考的是英文定義，所以練習順序是：聽單字 → 對英文意思 → 看中文確認 → 聽例句 → 用同義／反義把意思卡死。
        </p>
      </header>
      <WordsHub />
      <p className="text-sm text-muted">
        想從清單慢慢翻也可以先
        <Link href="/words/study?mode=recall&pack=1" className="mx-1 text-copper">
          從第 1 組開始
        </Link>
        。
      </p>
    </div>
  );
}
