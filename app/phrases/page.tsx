import Link from "next/link";
import { ItemCard } from "@/components/ItemCard";
import { itemsBySource, phraseCategories } from "@/lib/data";

export default function PhrasesPage() {
  const items = itemsBySource("phrase");

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-copper">BUILDING BLOCKS</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">句型積木</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            七大類高頻句型。每張卡片都有生活／工作例句，可直接點發音。
          </p>
        </div>
        <Link href="/verbs" className="rounded-full border border-line px-4 py-2 text-sm hover:border-copper">
          看片語動詞
        </Link>
      </header>
      {phraseCategories.map((cat) => (
        <section key={cat.id} id={cat.id} className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            {cat.no}. {cat.titleZh}
          </h2>
          <p className="text-sm text-muted">{cat.titleEn}</p>
          {items
            .filter((item) => item.categoryId === cat.id)
            .map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
        </section>
      ))}
    </div>
  );
}
