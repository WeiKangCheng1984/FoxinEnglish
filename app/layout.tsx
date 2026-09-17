import type { ReactNode } from "react";
import { Fraunces, Noto_Sans_TC } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  preload: false,
});

export const metadata = {
  title: "口說節奏 Cadence",
  description: "融合個人風格、句型積木、對話公式與 GRE 高頻單字的英文練習網站",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased`}>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8 pb-16">{children}</main>
      </body>
    </html>
  );
}
