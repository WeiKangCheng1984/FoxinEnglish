"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCompletedDays, getStartDate, setLastDay, setStartDate, todayPlanDay } from "@/lib/storage";

export function DaySwitcher({ day }: { day: number }) {
  const router = useRouter();
  const [completed, setCompleted] = useState<number[]>([]);
  const [start, setStart] = useState("");
  const suggested = useMemo(() => todayPlanDay(), [start, day]);

  useEffect(() => {
    setCompleted(getCompletedDays());
    setStart(getStartDate());
    setLastDay(day);
  }, [day]);

  function go(next: number) {
    const clamped = Math.min(30, Math.max(1, next));
    router.push(`/plan/${clamped}`);
  }

  return (
    <section className="rounded-[28px] border border-line bg-sand p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted">THIRTY-DAY PLAN</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(day - 1)}
              className="rounded-full border border-line px-3 py-1 text-sm hover:border-copper"
            >
              上一天
            </button>
            <label className="flex items-center gap-2 text-sm">
              第
              <input
                type="number"
                min={1}
                max={30}
                value={day}
                onChange={(e) => go(Number(e.target.value) || 1)}
                className="w-16 rounded-xl border border-line bg-paper px-2 py-1 text-center outline-none focus:border-copper"
              />
              天
            </label>
            <button
              type="button"
              onClick={() => go(day + 1)}
              className="rounded-full border border-line px-3 py-1 text-sm hover:border-copper"
            >
              下一天
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => {
              const iso = new Date().toISOString().slice(0, 10);
              setStartDate(iso);
              setStart(iso);
              go(1);
            }}
            className="rounded-full bg-forest px-3 py-1.5 text-white"
          >
            從今天當第 1 天
          </button>
          <button
            type="button"
            onClick={() => go(suggested)}
            className="rounded-full border border-line px-3 py-1.5"
          >
            跳到計畫中的今天（D{suggested}）
          </button>
        </div>
      </div>
      {start ? (
        <p className="mt-3 text-xs text-muted">
          開始日 {start} · 可隨時點下方格子自由切換，不一定要照日期走。
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted">還沒設定開始日也沒關係，30 天都能直接點選練習。</p>
      )}

      <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-10">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => {
          const done = completed.includes(n);
          const current = n === day;
          return (
            <Link
              key={n}
              href={`/plan/${n}`}
              className={`flex h-10 items-center justify-center rounded-2xl text-sm ${
                current
                  ? "bg-copper text-white"
                  : done
                    ? "bg-forest/15 text-forest"
                    : "bg-paper-2 text-muted hover:bg-paper"
              }`}
            >
              {n}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
