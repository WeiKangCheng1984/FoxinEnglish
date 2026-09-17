"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCompletedDays, getLastDay, todayPlanDay } from "@/lib/storage";
import { getPlanDay } from "@/lib/data";

export function HomePlanCard() {
  const [day, setDay] = useState(1);
  const [done, setDone] = useState(0);

  useEffect(() => {
    const last = getLastDay();
    setDay(last || todayPlanDay());
    setDone(getCompletedDays().length);
  }, []);

  const plan = getPlanDay(day);

  return (
    <section className="overflow-hidden rounded-[32px] border border-line bg-ink text-sand">
      <div className="grid gap-6 p-7 md:grid-cols-[1.3fr_0.7fr] md:p-10">
        <div>
          <p className="text-xs tracking-[0.25em] text-sand/60">DAILY CADENCE</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight md:text-5xl">
            把三份資料練成你的說話節奏，GRE 單字另開一條複習線。
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-sand/75">
            對話公式決定這一刻要做什麼，句型把句子組出來，個人風格讓語氣聽起來像你。30 天計畫可自由切換，不必卡在某一天。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/plan/${day}`} className="rounded-full bg-copper px-5 py-2.5 text-sm text-white">
              進入第 {day} 天：{plan?.title}
            </Link>
            <Link href="/search" className="rounded-full border border-sand/20 px-5 py-2.5 text-sm">
              搜尋任何一句
            </Link>
            <Link href="/words" className="rounded-full border border-sand/20 px-5 py-2.5 text-sm">
              GRE 單字
            </Link>
          </div>
        </div>
        <div className="rounded-[24px] bg-sand/8 p-5">
          <p className="text-xs text-sand/50">進度</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl">{done} / 30</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-copper" style={{ width: `${(done / 30) * 100}%` }} />
          </div>
          <p className="mt-4 text-sm leading-6 text-sand/70">{plan?.goal}</p>
        </div>
      </div>
    </section>
  );
}
