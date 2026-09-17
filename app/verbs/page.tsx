import Link from "next/link";
import { ItemCard } from "@/components/ItemCard";
import { itemsBySource, verbStages } from "@/lib/data";

export default function VerbsPage() {
  const items = itemsBySource("verb");

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs tracking-[0.2em] text-copper">PHRASAL VERBS</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">片語動詞</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          工作、社交、系統操作、情緒應變四個階段。點喇叭聽工作與生活例句。
        </p>
        <Link href="/phrases" className="mt-4 inline-block text-sm text-copper">
          回到句型積木
        </Link>
      </header>
      {verbStages.map((stage) => (
        <section key={stage.id} className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            階段 {stage.no} · {stage.titleZh}
          </h2>
          <p className="text-sm text-muted">{stage.titleEn}</p>
          {items
            .filter((item) => item.categoryId === stage.id)
            .map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
        </section>
      ))}
    </div>
  );
}
