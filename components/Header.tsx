"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/plan", label: "30 天計畫" },
  { href: "/words", label: "單字" },
  { href: "/dialogue", label: "對話公式" },
  { href: "/phrases", label: "句型" },
  { href: "/verbs", label: "片語" },
  { href: "/style", label: "風格" },
  { href: "/search", label: "搜尋" },
  { href: "/saved", label: "收藏" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="mr-2 font-[family-name:var(--font-display)] text-xl">
          口說節奏 <span className="text-copper">Cadence</span>
        </Link>
        <nav className="flex flex-1 flex-wrap gap-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  active ? "bg-ink text-sand" : "text-muted hover:bg-paper-2 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
