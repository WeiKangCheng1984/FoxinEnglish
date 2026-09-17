import Link from "next/link";
import { HomePlanCard } from "@/components/HomePlanCard";

const modules = [
  {
    href: "/words",
    kicker: "單字",
    title: "GRE 800",
    desc: "聽發音、對英文定義、在句子裡填空。20 詞一組，用間隔重複複習。",
  },
  {
    href: "/dialogue",
    kicker: "劇本",
    title: "對話公式",
    desc: "提問、表態、說故事、同理。先決定這一刻在對話裡要做什麼。",
  },
  {
    href: "/phrases",
    kicker: "積木",
    title: "句型與片語",
    desc: "150 個高頻句型加上 80 個片語動詞，把意思講完整。",
  },
  {
    href: "/style",
    kicker: "語氣",
    title: "個人風格",
    desc: "西岸直率、觀察者節奏：發語詞、連接、招牌句、壓力緩衝。",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <HomePlanCard />
      <section className="grid gap-4 md:grid-cols-2">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="rounded-[28px] border border-line bg-sand p-6 transition hover:-translate-y-0.5 hover:border-copper"
          >
            <p className="text-xs tracking-[0.2em] text-copper">{mod.kicker}</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl">{mod.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{mod.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
