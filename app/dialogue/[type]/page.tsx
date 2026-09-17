import { notFound } from "next/navigation";
import { ItemCard } from "@/components/ItemCard";
import { catalogueTypes, itemsBySource } from "@/lib/data";

export function generateStaticParams() {
  return catalogueTypes.map((type) => ({ type: type.id }));
}

export default async function DialogueTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const meta = catalogueTypes.find((t) => t.id === type);
  if (!meta) notFound();
  const items = itemsBySource("catalogue").filter((item) => item.categoryId === type);
  const blocks = [...new Set(items.map((item) => item.blockName || item.block || ""))];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs tracking-[0.2em] text-copper">第 {meta.no} 類</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">{meta.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{meta.intent}</p>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
          「公式大意」是這句英文的對譯，槽位用〔〕標出。「填入後的例句」才是場景裡的完整中文，不要把兩者當成同一件事。
        </p>
      </header>
      {blocks.map((block) => (
        <section key={block} className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">{block}</h2>
          {items
            .filter((item) => (item.blockName || item.block) === block)
            .map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
        </section>
      ))}
    </div>
  );
}
