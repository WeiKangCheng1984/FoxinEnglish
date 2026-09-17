import { ItemCard } from "@/components/ItemCard";
import { itemsBySource, styleStages } from "@/lib/data";

export default function StylePage() {
  const items = itemsBySource("style");

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs tracking-[0.2em] text-copper">YOUR VOICE</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">個人風格</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          這是你的語氣層：發語詞、邏輯連接、招牌句、壓力緩衝。練習時想像自己在導覽或會議裡開口。例句已附中文對譯；若卡片標了「跨層」，代表同一說法在對話公式或句型裡角色不同，先看「這兩層怎麼一起用」。
        </p>
      </header>
      {styleStages.map((stage) => (
        <section key={stage.id} className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            {stage.no}. {stage.title}
          </h2>
          <p className="text-sm text-muted">{stage.intent}</p>
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
