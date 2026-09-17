"use client";

import { useEffect, useState } from "react";
import { getFavorites, toggleFavorite } from "@/lib/storage";

export function FavoriteButton({ id }: { id: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(getFavorites().includes(id));
  }, [id]);

  return (
    <button
      type="button"
      onClick={() => setOn(toggleFavorite(id).includes(id))}
      className={`rounded-full border px-3 py-1 text-xs tracking-wide ${
        on ? "border-copper bg-copper text-white" : "border-line bg-sand text-muted hover:border-copper hover:text-copper"
      }`}
    >
      {on ? "已收藏" : "收藏"}
    </button>
  );
}
