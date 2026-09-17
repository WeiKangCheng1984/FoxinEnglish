import { notFound } from "next/navigation";
import { DaySwitcher } from "@/components/DaySwitcher";
import { CompleteDayButton } from "@/components/CompleteDayButton";
import { ItemCard } from "@/components/ItemCard";
import { getItems, getPlanDay, planDays } from "@/lib/data";

export function generateStaticParams() {
  return planDays.map((d) => ({ day: String(d.day) }));
}

export default async function PlanDayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day: raw } = await params;
  const day = Number(raw);
  const plan = getPlanDay(day);
  if (!plan) notFound();

  const fresh = getItems(plan.newIds);
  const review = getItems(plan.reviewIds);

  return (
    <div className="space-y-6">
      <DaySwitcher day={day} />
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-copper">DAY {String(day).padStart(2, "0")} · WEEK {plan.week}</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">{plan.title}</h1>
          <p className="mt-1 text-muted">{plan.titleEn}</p>
          <p className="mt-3 max-w-2xl text-sm leading-7">{plan.goal}</p>
        </div>
        <CompleteDayButton day={day} />
      </section>

      {fresh.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">今日新練</h2>
          {fresh.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </section>
      ) : null}

      {review.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">間隔複習</h2>
          <p className="text-sm text-muted">這些是較早學過的句子，快速唸過即可。</p>
          {review.map((item) => (
            <ItemCard key={item.id} item={item} compact />
          ))}
        </section>
      ) : null}
    </div>
  );
}
