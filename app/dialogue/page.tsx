import Link from "next/link";
import { catalogueTypes } from "@/lib/data";

export default function DialoguePage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs tracking-[0.2em] text-copper">PLAYBOOK</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">對話公式</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          四種對話任務，各 36 條公式。卡片上的「公式大意」是對譯；「填入後的例句」才是場景裡的完整中文。先選任務，再把槽位填成你的句子，並點發音跟讀。
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {catalogueTypes.map((type) => (
          <Link
            key={type.id}
            href={`/dialogue/${type.id}`}
            className="rounded-[28px] border border-line bg-sand p-6 hover:border-copper"
          >
            <p className="text-xs text-muted">第 {type.no} 類</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">{type.title}</h2>
            <p className="mt-1 text-sm text-muted">{type.titleEn}</p>
            <p className="mt-3 text-sm leading-7">{type.intent}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
