# 口說節奏 Cadence

融合個人風格、句型積木與對話公式的英文口說練習網站。每句英文都可點選發音，並附 30 天複習計畫，可自由切換天數。

## 本機執行

```bash
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

若你改了 `content/` 裡的原始資料，再跑：

```bash
npm run parse
```

## 部署到 GitHub 與 Vercel

1. 在 GitHub 建立新 repo，把這個專案 push 上去。
2. 到 [Vercel](https://vercel.com) 登入並 Import 該 repo。
3. Framework 選 Next.js，其餘用預設即可。
4. Deploy 完成後會得到公開網址。

不需要資料庫或 API Key。發音使用瀏覽器內建的 Web Speech API。
