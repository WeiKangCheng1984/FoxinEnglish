"use client";

import { useEffect, useState } from "react";
import { ItemCard } from "@/components/ItemCard";
import { getItem } from "@/lib/data";
import { getFavorites } from "@/lib/storage";
import type { Item } from "@/lib/types";

export default function SavedPage() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    setItems(getFavorites().map(getItem).filter((item): item is Item => Boolean(item)));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs tracking-[0.2em] text-copper">SAVED</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">收藏</h1>
        <p className="mt-3 text-sm text-muted">收藏存在這個瀏覽器裡，清資料或換裝置後不會跟著走。</p>
      </header>
      {items.length === 0 ? (
        <p className="rounded-[28px] border border-dashed border-line p-8 text-muted">還沒有收藏。看到想反覆跟讀的句子，點卡片上的「收藏」即可。</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
