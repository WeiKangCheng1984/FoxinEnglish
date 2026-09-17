import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { styleExampleZh, styleTitleZh } from "./enrichment-style.mjs";
import { catalogueGloss, layerFamilies } from "./enrichment-layers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const contentDir = path.join(root, "content");
const dataDir = path.join(root, "data");

function readText(name) {
  return fs.readFileSync(path.join(contentDir, name), "utf8").replace(/\r\n/g, "\n");
}

function writeJson(name, data) {
  fs.writeFileSync(path.join(dataDir, name), JSON.stringify(data, null, 2), "utf8");
}

function splitEnZh(s) {
  const text = String(s || "").trim();
  if (!text) return { en: "", zh: "" };
  const m = text.match(/^(.*[A-Za-z].*?)\s*[（(]([^()（）]*[\u4e00-\u9fff][\s\S]*)[）)]\s*$/);
  if (m) return { en: m[1].trim(), zh: m[2].trim() };
  return { en: text, zh: "" };
}

function stripNote(s) {
  return s.replace(/※.*$/, "").trim();
}

function normKey(s) {
  return String(s || "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function splitTeachingNote(raw) {
  let text = String(raw || "").trim();
  text = text.replace(/^[「『"']+/, "").replace(/[」』"']+$/, "").trim();
  text = text.replace(/^[「『]|[」』]$/g, "").trim();
  let note = "";
  const m = text.match(/^(.*?)[」"']?（([^）]+)）\s*$/);
  if (m && /讚美|開場|引導|邀請|收尾|共情|體貼|啦啦|反問|畫面/.test(m[2])) {
    text = m[1].replace(/[」"']+$/, "").trim();
    note = m[2].trim();
  }
  text = text.replace(/[」"']+$/, "").replace(/^[「『"']+/, "").trim();
  return { text, note };
}

function fillEnglish(titleEn, slots) {
  const holes = [...String(titleEn).matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
  const used = new Map();
  return String(titleEn).replace(/\[([^\]]+)\]/g, (_, hole) => {
    const slot =
      slots.find((s) => s.name === hole) ||
      slots.find((s) => s.name.includes(hole) || hole.includes(s.name.split("/")[0]));
    if (!slot?.examples?.length) return `[${hole}]`;
    const count = used.get(slot.name) || 0;
    used.set(slot.name, count + 1);
    const raw = slot.examples[0];
    if (slot.name.includes("/") && /[AB12]/.test(hole) && slot.examples.length <= 2) {
      const parts = raw.split(/\s*\/\s*/);
      if (/A|1/.test(hole)) return parts[0] || raw;
      if (/B|2/.test(hole)) return parts[1] || slot.examples[1] || parts[0] || raw;
    }
    if (slot.examples.length > 1 && count < slot.examples.length && holes.filter((h) => h === hole).length === 1) {
      return slot.examples[Math.min(count, slot.examples.length - 1)] || raw;
    }
    const parts = raw.split(/\s*\/\s*/);
    if (parts.length > 1 && count < parts.length) return parts[count];
    return slot.examples[Math.min(count, slot.examples.length - 1)] || raw;
  });
}

function parseSlots(line) {
  if (!line) return [];
  const raw = line.replace(/^替換[：:]\s*/, "").trim();
  const slots = [];
  const chunks = raw.split(/\s*\/\s*(?=\[[^\]]+\]\s*(?:->|=))/);
  for (const chunk of chunks) {
    const m = chunk.match(/\[([^\]]+)\]\s*(?:->|=)\s*(.+)$/);
    if (!m) continue;
    const name = m[1].trim();
    const examples = m[2]
      .split(/,|、/)
      .map((x) => x.trim())
      .filter(Boolean);
    slots.push({ name, examples });
  }
  return slots;
}

function parseCatalogue(text) {
  const typeMeta = [
    { id: "ask", no: 1, title: "提問探詢", titleEn: "Ask & Explore", intent: "開啟話題、挖深觀點、讓對話延續" },
    { id: "opinion", no: 2, title: "表達觀點", titleEn: "Share a View", intent: "鋪陳想法、溫和不同意、果斷肯定" },
    { id: "story", no: 3, title: "說故事", titleEn: "Tell a Story", intent: "懸念開場、細節推進、高潮與收尾" },
    { id: "empathy", no: 4, title: "同理傾聽", titleEn: "Listen with Empathy", intent: "接住情緒、重述、賦能、引導說出來" },
  ];

  const parts = text.split(/\n(?=第[二三四五]類)/);
  const items = [];

  parts.forEach((part, idx) => {
    const meta = typeMeta[idx];
    if (!meta) return;
    const blocks = [];
    const blockRe = /區塊\s*([A-D])[：:]【([^】]+)】([^\n]*)/g;
    let match;
    const headers = [];
    while ((match = blockRe.exec(part))) {
      headers.push({
        letter: match[1],
        name: match[2].trim(),
        subtitle: match[3].replace(/（[^）]*）/g, "").trim(),
        index: match.index,
      });
    }
    headers.forEach((header, i) => {
      const end = i + 1 < headers.length ? headers[i + 1].index : part.length;
      const body = part.slice(header.index, end);
      const sceneMatch = body.match(/適用場景[：:]([^\n]+)/);
      const sceneHint = sceneMatch ? sceneMatch[1].trim() : "";
      blocks.push({ ...header, sceneHint });

      const formulaRe = /公式\s*(\d+)[：:]([^\n]+)([\s\S]*?)(?=\n公式\s*\d+[：:]|\n區塊\s*[A-D]|$)/g;
      let fm;
      while ((fm = formulaRe.exec(body))) {
        const num = fm[1].padStart(2, "0");
        const titleEn = fm[2].trim();
        const rest = fm[3];
        const subLine = (rest.match(/替換[：:][^\n]+/) || [""])[0];
        const sceneLine = (rest.match(/場景[：:][^\n]+/) || [""])[0];
        const rawScene = sceneLine.replace(/^場景[：:]\s*/, "").trim();
        const { text: exampleZh, note } = splitTeachingNote(rawScene);
        const slots = parseSlots(subLine);
        const id = `cat-${meta.no}-${header.letter.toLowerCase()}-${num}`;
        const filledEn = fillEnglish(titleEn, slots);
        items.push({
          id,
          source: "catalogue",
          titleEn,
          titleZh: catalogueGloss[id] || exampleZh,
          usage: sceneHint,
          note,
          category: meta.title,
          categoryId: meta.id,
          categoryNo: meta.no,
          block: header.letter,
          blockName: header.name,
          tags: [meta.title, header.name, "對話公式"],
          slots,
          sceneHint,
          examples: titleEn
            ? [
                {
                  en: filledEn,
                  zh: exampleZh,
                  scene: slots.length ? "填入後的例句" : "對譯",
                },
              ]
            : [],
        });
      }
    });
    meta.blocks = blocks.map((b) => ({
      letter: b.letter,
      name: b.name,
      subtitle: b.subtitle,
      sceneHint: b.sceneHint,
    }));
  });

  return { types: typeMeta, items };
}

function parsePhrases(text) {
  const catMeta = [];
  const catRe = /類別([一二三四五六七八])[：:]([^\n]+)/g;
  let cm;
  while ((cm = catRe.exec(text))) {
    catMeta.push({
      no: ["一", "二", "三", "四", "五", "六", "七", "八"].indexOf(cm[1]) + 1,
      raw: cm[0],
      titleLine: cm[2].trim(),
      index: cm.index,
    });
  }

  const patterns = [];
  catMeta.forEach((cat, i) => {
    const end = i + 1 < catMeta.length ? catMeta[i + 1].index : text.search(/\n階段一：/);
    const body = text.slice(cat.index, end > 0 ? end : text.length);
    const titleEnMatch = cat.titleLine.match(/\(([^)]+)\)\s*$/);
    const titleZh = cat.titleLine.replace(/\s*\([^)]+\)\s*$/, "").trim();
    cat.id = `phrase-cat-${cat.no}`;
    cat.titleZh = titleZh;
    cat.titleEn = titleEnMatch ? titleEnMatch[1] : "";

    const itemRe = /^(\d+)\.\s+(.+)$/gm;
    const found = [];
    let im;
    while ((im = itemRe.exec(body))) found.push({ num: Number(im[1]), title: im[2].trim(), index: im.index });
    found.forEach((item, idx) => {
      const chunk = body.slice(item.index, idx + 1 < found.length ? found[idx + 1].index : body.length);
      const firstLine = chunk.split("\n")[0].replace(/^\d+\.\s*/, "");
      const zhMatch = firstLine.match(/（([^）]+)）/);
      const titleEn = firstLine.replace(/（[^）]+）[\s\S]*$/, "").trim();
      const titleZh = zhMatch ? zhMatch[1].trim() : "";
      const noteMatch = firstLine.match(/※(.+)$/);
      const examples = [];
      const exRe = /例句\s*\d+\s*[（(]([^）)]+)[）)][：:]\s*(.+)/g;
      let ex;
      while ((ex = exRe.exec(chunk))) {
        const split = splitEnZh(ex[2]);
        examples.push({ en: split.en, zh: split.zh, scene: ex[1].trim() });
      }
      patterns.push({
        id: `phrase-${String(item.num).padStart(3, "0")}`,
        source: "phrase",
        number: item.num,
        titleEn,
        titleZh,
        usage: noteMatch ? noteMatch[1].trim() : (titleZh ? `用來表達「${titleZh}」。` : ""),
        note: noteMatch ? noteMatch[1].trim() : "",
        category: cat.titleZh,
        categoryId: cat.id,
        categoryNo: cat.no,
        tags: [cat.titleZh, "句型"],
        examples,
      });
    });
  });

  const verbStart = text.search(/\n階段一：/);
  const verbText = verbStart >= 0 ? text.slice(verbStart) : "";
  const verbStages = [];
  const stageRe = /階段([一二三四])[：:]([^\n]+)/g;
  let sm;
  while ((sm = stageRe.exec(verbText))) {
    verbStages.push({
      no: ["一", "二", "三", "四"].indexOf(sm[1]) + 1,
      titleLine: sm[2].trim(),
      index: sm.index,
    });
  }

  const verbs = [];
  verbStages.forEach((stage, i) => {
    const end = i + 1 < verbStages.length ? verbStages[i + 1].index : verbText.length;
    const body = verbText.slice(stage.index, end);
    const titleEnMatch = stage.titleLine.match(/\(([^)]+)\)\s*$/);
    stage.id = `verb-stage-${stage.no}`;
    stage.titleZh = stage.titleLine.replace(/\s*\([^)]+\)\s*$/, "").trim();
    stage.titleEn = titleEnMatch ? titleEnMatch[1] : "";

    const itemRe = /^(\d+)\.\s+(.+)$/gm;
    const found = [];
    let im;
    while ((im = itemRe.exec(body))) found.push({ num: Number(im[1]), title: im[2].trim(), index: im.index });
    found.forEach((item, idx) => {
      const chunk = body.slice(item.index, idx + 1 < found.length ? found[idx + 1].index : body.length);
      const syn = (chunk.match(/對應書面大字[：:]\s*(.+)/) || ["", ""])[1].replace(/^=\s*/, "").trim();
      const meaning = (chunk.match(/道地中文解釋[：:]\s*(.+)/) || ["", ""])[1].trim();
      const examples = [];
      const exRe = /((?:工作|生活)範例(?:\s*[（(][^）)]+[）)])?)[：:]\s*(.+)/g;
      let ex;
      while ((ex = exRe.exec(chunk))) {
        const split = splitEnZh(ex[2]);
        const scene = ex[1].includes("工作") ? "工作" : "生活";
        examples.push({ en: split.en, zh: split.zh, scene });
      }
      verbs.push({
        id: `verb-${String(item.num).padStart(3, "0")}`,
        source: "verb",
        number: item.num,
        titleEn: item.title,
        titleZh: meaning,
        usage: meaning,
        synonyms: syn,
        category: stage.titleZh,
        categoryId: stage.id,
        categoryNo: stage.no,
        tags: [stage.titleZh, "片語動詞"],
        examples,
      });
    });
  });

  return {
    categories: catMeta.map(({ id, no, titleZh, titleEn }) => ({ id, no, titleZh, titleEn })),
    patterns,
    verbStages: verbStages.map(({ id, no, titleZh, titleEn }) => ({ id, no, titleZh, titleEn })),
    verbs,
  };
}

function parseStyle(text) {
  const stageHints = [
    { id: "markers", no: 1, title: "發語詞", titleEn: "Openers", intent: "Actually、Basically、I mean 等，用來掌握發言節奏" },
    { id: "connectors", no: 2, title: "邏輯連接", titleEn: "Connectors", intent: "The bottom line is、That being said，用來推進與轉折" },
    { id: "signature", no: 3, title: "招牌句", titleEn: "Signature lines", intent: "屬於你的觀察者／西岸語氣" },
    { id: "pressure", no: 4, title: "壓力緩衝", titleEn: "Pressure relievers", intent: "爭取思考時間、轉向、不同意、優雅收尾" },
  ];

  const chunks = [];
  const second = text.search(/第二階段/);
  const third = text.search(/第三階段/);
  const fourth = text.search(/第四階段/);
  chunks.push(text.slice(0, second > 0 ? second : text.length));
  if (second >= 0) chunks.push(text.slice(second, third > 0 ? third : text.length));
  if (third >= 0) chunks.push(text.slice(third, fourth > 0 ? fourth : text.length));
  if (fourth >= 0) chunks.push(text.slice(fourth));

  const items = [];
  chunks.forEach((chunk, idx) => {
    const meta = stageHints[idx];
    if (!meta) return;
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    let group = "";

    for (const line of lines) {
      const groupMatch = line.match(/^\d+\.\s+(.+)/);
      if (groupMatch && !/的(?:變體與)?用法/.test(line) && idx < 2) {
        group = groupMatch[1].replace(/：.*$/, "").trim();
        continue;
      }
      if (idx >= 2) {
        const dim = line.match(/^(視野與角度|邏輯與系統|成長與過程|社交與氛圍|引導與澄清|爭取邏輯思考時間|優雅應對未知或刁鑽問題|轉向與節奏控管|化解分歧與表達不同見解|社交收尾與優雅撤退)[：:]?/);
        if (dim) {
          group = dim[1];
          continue;
        }
      }

      const usageMatch = line.match(/^(.{1,90}?)\s的(?:變體與)?用法(?:與變體)?[：:](.*)$/);
      if (usageMatch && idx < 2) {
        const rest = usageMatch[2];
        const [usagePart, ...exParts] = rest.split(/例句[：:]/);
        const titleEn = usageMatch[1]
          .replace(/[（(][^）)]+[）)]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        items.push({
          id: `style-s${meta.no}-${String(items.filter((x) => x.categoryId === meta.id).length + 1).padStart(2, "0")}`,
          source: "style",
          titleEn,
          titleZh: group,
          usage: usagePart.trim(),
          category: meta.title,
          categoryId: meta.id,
          categoryNo: meta.no,
          block: group,
          tags: [meta.title, group, "個人風格"],
          examples: exParts
            .map((p) => splitEnZh(p))
            .filter((x) => x.en)
            .map((x) => ({ ...x, scene: "風格" })),
        });
        continue;
      }

      if (idx >= 2 && /例句[：:]/.test(line)) {
        const [before, ...exParts] = line.split(/例句[：:]/);
        const titleMatch = before.match(/^([A-Za-z][\s\S]+?[.?!])\s+((?:「|『|“|"|[A-Za-z\u4e00-\u9fff])[\s\S]*[\u4e00-\u9fff][\s\S]*)$/);
        if (!titleMatch) continue;
        items.push({
          id: `style-s${meta.no}-${String(items.filter((x) => x.categoryId === meta.id).length + 1).padStart(2, "0")}`,
          source: "style",
          titleEn: titleMatch[1].trim(),
          titleZh: group,
          usage: titleMatch[2].trim(),
          category: meta.title,
          categoryId: meta.id,
          categoryNo: meta.no,
          block: group,
          tags: [meta.title, group, "個人風格"],
          examples: exParts
            .map((p) => splitEnZh(p))
            .filter((x) => x.en)
            .map((x) => ({ ...x, scene: "風格" })),
        });
      }
    }
  });

  return { stages: stageHints, items };
}

function sliceIds(arr, start, count) {
  return arr.slice(start, start + count).map((x) => x.id);
}

function buildPlan(catalogue, phrases, verbs, styles) {
  const days = [
    { day: 1, week: 1, title: "破冰開口", titleEn: "Break the ice", goal: "用無痛提問打開對話，並用 Actually / Basically 掌握發言節奏。", cat: [0, 9], phrase: [0, 5], style: [0, 2], verb: [] },
    { day: 2, week: 1, title: "日常意願", titleEn: "Say what you want", goal: "把計畫、期待、偏好講清楚，語氣用 I mean / You know 變自然。", cat: [9, 9], phrase: [5, 6], style: [2, 2], verb: [] },
    { day: 3, week: 1, title: "追問延續", titleEn: "Keep it going", goal: "對方講完後再挖一層，並用 Fair enough / Right 接住訊息。", cat: [18, 9], phrase: [11, 5], style: [4, 2], verb: [20, 4] },
    { day: 4, week: 1, title: "創意發問", titleEn: "Ask unexpectedly", goal: "用反向問題讓對話有記憶點，並練習 Honestly / Realistically。", cat: [27, 9], phrase: [16, 5], style: [6, 3], verb: [24, 4] },
    { day: 5, week: 1, title: "溫和表態", titleEn: "Ease into a view", goal: "先墊一句再拋觀點，配上 The bottom line is / The thing is。", cat: [36, 9], phrase: [20, 6], style: [9, 2], verb: [] },
    { day: 6, week: 1, title: "把觀點講立體", titleEn: "Give it dimension", goal: "正反面、漣漪效應、雙刃劍，並用 That being said 轉折。", cat: [45, 9], phrase: [26, 6], style: [11, 2], verb: [] },
    { day: 7, week: 1, title: "第一週複習", titleEn: "Week 1 recap", goal: "把本週破冰、追問、溫和表態串成一小段對話。", reviewOnly: true },

    { day: 8, week: 2, title: "溫和不同意", titleEn: "Disagree with grace", goal: "高 EQ 表達不同意見，配 Moving on / On that note 控節奏。", cat: [54, 9], phrase: [32, 6], style: [13, 2], verb: [] },
    { day: 9, week: 2, title: "果斷肯定", titleEn: "Stand behind it", goal: "該拍板時要乾脆，並用 To be fair / For what it's worth 平衡直率。", cat: [63, 9], phrase: [38, 6], style: [15, 2], verb: [] },
    { day: 10, week: 2, title: "委婉請求", titleEn: "Ask without pressure", goal: "會議與信件裡的請求、詢問、對齊進度。", cat: [], phrase: [40, 10], style: [17, 2], verb: [0, 6] },
    { day: 11, week: 2, title: "時間與效率", titleEn: "Talk about time", goal: "催進度、排行程、講先後順序，並加入招牌句的視野感。", cat: [], phrase: [60, 10], style: [19, 5], verb: [6, 6] },
    { day: 12, week: 2, title: "邏輯與系統", titleEn: "Sound precise", goal: "用理科底色的招牌句，把複雜事情拆小。", cat: [], phrase: [70, 10], style: [24, 5], verb: [12, 6] },
    { day: 13, week: 2, title: "假設與風險", titleEn: "Play out scenarios", goal: "What if、Even if、Provided that，預演對話中的變數。", cat: [], phrase: [80, 10], style: [29, 5], verb: [] },
    { day: 14, week: 2, title: "第二週複習", titleEn: "Week 2 recap", goal: "模擬一場短會議：請求、時間、轉折、拍板。", reviewOnly: true },

    { day: 15, week: 3, title: "故事開場", titleEn: "Open a story", goal: "用懸念開頭把聽眾拉進來，並練習成長／過程類招牌句。", cat: [72, 9], phrase: [90, 6], style: [29, 5], verb: [21, 5] },
    { day: 16, week: 3, title: "故事鋪陳", titleEn: "Set the scene", goal: "交代背景、內心 OS、混亂現場，讓故事有畫面。", cat: [81, 9], phrase: [96, 6], style: [34, 5], verb: [26, 5] },
    { day: 17, week: 3, title: "高潮轉折", titleEn: "Turn the plot", goal: "kicker、turning point、point of no return。", cat: [90, 9], phrase: [102, 6], style: [39, 5], verb: [] },
    { day: 18, week: 3, title: "故事收尾", titleEn: "Land the story", goal: "寓意、自嘲、把話拋回聽眾。", cat: [99, 9], phrase: [108, 6], style: [], verb: [32, 5] },
    { day: 19, week: 3, title: "困境與權衡", titleEn: "Name the problem", goal: "瓶頸、利弊、根因，搭配引導與澄清句。", cat: [], phrase: [100, 10], style: [39, 5], verb: [40, 6] },
    { day: 20, week: 3, title: "壓力思考時間", titleEn: "Buy thinking time", goal: "聽不懂或需要邏輯整理時，用緩衝句維持自信。", cat: [108, 9], phrase: [110, 6], style: [44, 5], verb: [] },
    { day: 21, week: 3, title: "第三週複習", titleEn: "Week 3 recap", goal: "講一個完整小故事：開場、鋪陳、轉折、收尾。", reviewOnly: true },

    { day: 22, week: 4, title: "接住情緒", titleEn: "Match the feeling", goal: "先同步感受，再決定要不要給建議。", cat: [108, 9], phrase: [116, 6], style: [49, 5], verb: [60, 5] },
    { day: 23, week: 4, title: "證明你有在聽", titleEn: "Reflect it back", goal: "重述對方的核心困境，建立信任。", cat: [117, 9], phrase: [122, 6], style: [54, 5], verb: [65, 5] },
    { day: 24, week: 4, title: "賦能與支持", titleEn: "Back them up", goal: "低潮時給肯定，而不是急著修正。", cat: [126, 9], phrase: [128, 6], style: [59, 5], verb: [70, 5] },
    { day: 25, week: 4, title: "引導說出來", titleEn: "Invite more", goal: "溫暖追問與收尾，讓對話停在高情商。", cat: [135, 9], phrase: [134, 6], style: [64, 5], verb: [75, 5] },
    { day: 26, week: 4, title: "道地慣用語", titleEn: "Sound native", goal: "At the end of the day、in a nutshell 等潤滑劑。", cat: [], phrase: [120, 15], style: [], verb: [] },
    { day: 27, week: 4, title: "工作片語動詞", titleEn: "Phrasal verbs at work", goal: "come up with、follow up、hand over 等專案節奏。", cat: [], phrase: [135, 15], style: [], verb: [0, 20] },
    { day: 28, week: 4, title: "生活與應變片語", titleEn: "Phrasal verbs in life", goal: "社交、系統操作、情緒應變類片語動詞。", cat: [], phrase: [], style: [], verb: [20, 40] },
    { day: 29, week: 5, title: "情境整合：會議與導覽", titleEn: "Meetings & tours", goal: "把請求、轉折、引導、緩衝串成真實情境。", mixed: true },
    { day: 30, week: 5, title: "三十日總複習", titleEn: "Final recap", goal: "自由抽樣複習；可跳回任何一天補強弱項。", reviewOnly: true },
  ];

  const byId = new Map();
  const all = [...catalogue.items, ...phrases.patterns, ...verbs, ...styles.items];
  all.forEach((item) => byId.set(item.id, item));

  const assigned = [];
  const result = days.map((d) => {
    let newIds = [];
    if (d.reviewOnly) {
      newIds = [];
    } else if (d.mixed) {
      newIds = [
        ...sliceIds(catalogue.items, 0, 3),
        ...sliceIds(catalogue.items, 54, 3),
        ...sliceIds(catalogue.items, 72, 3),
        ...sliceIds(phrases.patterns, 40, 3),
        ...sliceIds(phrases.patterns, 120, 3),
        ...sliceIds(styles.items, 9, 3),
        ...sliceIds(styles.items, 44, 3),
        ...sliceIds(verbs, 0, 4),
      ];
    } else {
      newIds = [
        ...(d.cat?.length ? sliceIds(catalogue.items, d.cat[0], d.cat[1]) : []),
        ...(d.phrase?.length ? sliceIds(phrases.patterns, d.phrase[0], d.phrase[1]) : []),
        ...(d.style?.length ? sliceIds(styles.items, d.style[0], d.style[1]) : []),
        ...(d.verb?.length ? sliceIds(verbs, d.verb[0], d.verb[1]) : []),
      ];
    }

    const reviewIds = [];
    if (d.reviewOnly) {
      const weekStart = Math.max(1, d.day - 6);
      const pool = assigned.filter((x) => x.day >= weekStart && x.day < d.day).flatMap((x) => x.newIds);
      reviewIds.push(...pool.filter((_, i) => i % 3 === 0).slice(0, 18));
      if (d.day === 30) {
        reviewIds.length = 0;
        reviewIds.push(
          ...sliceIds(catalogue.items, 0, 4),
          ...sliceIds(catalogue.items, 36, 4),
          ...sliceIds(catalogue.items, 72, 4),
          ...sliceIds(catalogue.items, 108, 4),
          ...sliceIds(phrases.patterns, 0, 4),
          ...sliceIds(phrases.patterns, 40, 4),
          ...sliceIds(phrases.patterns, 120, 4),
          ...sliceIds(styles.items, 0, 4),
          ...sliceIds(styles.items, 19, 4),
          ...sliceIds(styles.items, 44, 4),
          ...sliceIds(verbs, 0, 4),
          ...sliceIds(verbs, 40, 4)
        );
      }
    } else if (d.day > 1) {
      const prev = assigned.find((x) => x.day === d.day - 3) || assigned[assigned.length - 1];
      const older = assigned.find((x) => x.day === d.day - 7);
      if (prev) reviewIds.push(...prev.newIds.slice(0, 3));
      if (older) reviewIds.push(...older.newIds.slice(0, 3));
    }

    const uniqueNew = [...new Set(newIds)].filter((id) => byId.has(id));
    const uniqueReview = [...new Set(reviewIds)].filter((id) => byId.has(id) && !uniqueNew.includes(id));
    const entry = {
      day: d.day,
      week: d.week,
      title: d.title,
      titleEn: d.titleEn,
      goal: d.goal,
      newIds: uniqueNew,
      reviewIds: uniqueReview,
    };
    assigned.push(entry);
    return entry;
  });

  return result;
}

function enrichStyle(styles) {
  const zhMap = new Map(styleExampleZh.map(([en, zh]) => [normKey(en), zh]));
  for (const item of styles.items) {
    if (styleTitleZh[item.id]) item.titleZh = styleTitleZh[item.id];
    item.examples = item.examples.map((ex) => ({
      ...ex,
      zh: ex.zh || zhMap.get(normKey(ex.en)) || "",
      scene: "對譯",
    }));
  }
}

function familyScore(item, family) {
  const title = normKey(item.titleEn);
  if (
    family.titleStart?.some((start) => {
      const s = normKey(start);
      return title === s || title.startsWith(`${s} `) || title.startsWith(`${s},`) || title.startsWith(`${s}.`);
    })
  ) {
    return 3;
  }
  const keys = (family.keywords || []).map(normKey).filter((k) => k.length >= 4);
  if (keys.some((k) => title.includes(k))) return 2;
  const famTitle = normKey(family.title);
  if (famTitle.includes(" ") && title.includes(famTitle)) return 2;
  return 0;
}

function linkLayers(allItems) {
  const assigned = new Map();
  for (const family of layerFamilies) {
    const scored = allItems
      .map((item) => ({ item, score: familyScore(item, family) }))
      .filter((row) => row.score > 0);
    if (scored.length < 2) continue;
    const members = scored.map((row) => row.item);
    for (const { item, score } of scored) {
      const prev = assigned.get(item.id);
      if (prev && prev.score >= score) continue;
      assigned.set(item.id, { score, family, members });
    }
  }
  for (const item of allItems) {
    const hit = assigned.get(item.id);
    if (!hit) continue;
    const { family, members } = hit;
    item.layerFamily = family.title;
    item.layerRole = family.roles[item.source] || "";
    item.togetherHint = family.how;
    item.togetherExample = family.together || "";
    item.togetherZh = family.togetherZh || "";
    item.related = members
      .filter((other) => other.id !== item.id)
      .slice(0, 6)
      .map((other) => ({
        id: other.id,
        source: other.source,
        titleEn: other.titleEn,
        titleZh: other.titleZh,
        role: family.roles[other.source] || "",
      }));
  }
}

const catalogue = parseCatalogue(readText("catalogue.txt"));
const phrases = parsePhrases(readText("phrase.txt"));
const styles = parseStyle(readText("personal-style.txt"));
enrichStyle(styles);
const allForLink = [...catalogue.items, ...phrases.patterns, ...phrases.verbs, ...styles.items];
linkLayers(allForLink);
const plan = buildPlan(catalogue, phrases, phrases.verbs, styles);

const summary = {
  catalogue: catalogue.items.length,
  phrases: phrases.patterns.length,
  verbs: phrases.verbs.length,
  styles: styles.items.length,
  planDays: plan.length,
};

writeJson("catalogue.json", catalogue);
writeJson("phrases.json", { categories: phrases.categories, items: phrases.patterns });
writeJson("verbs.json", { stages: phrases.verbStages, items: phrases.verbs });
writeJson("style.json", styles);
writeJson("plan.json", plan);
writeJson("layers.json", layerFamilies);
writeJson("summary.json", {
  ...summary,
  styleExamplesMissingZh: styles.items.reduce(
    (n, item) => n + item.examples.filter((ex) => !ex.zh).length,
    0
  ),
  phraseExamplesMissingZh: phrases.patterns.reduce(
    (n, item) => n + item.examples.filter((ex) => !ex.zh).length,
    0
  ),
  catalogueMissingGloss: catalogue.items.filter((item) => !catalogueGloss[item.id]).length,
  layeredItems: allForLink.filter((item) => item.layerFamily).length,
});

console.log(summary);
console.log("style samples:", styles.items.slice(0, 3).map((x) => x.titleEn));
console.log("style last:", styles.items.slice(-3).map((x) => x.titleEn));
console.log("phrase first/last:", phrases.patterns[0]?.titleEn, phrases.patterns.at(-1)?.titleEn);
console.log("verb first/last:", phrases.verbs[0]?.titleEn, phrases.verbs.at(-1)?.titleEn);
console.log("cat first/last:", catalogue.items[0]?.titleEn, catalogue.items.at(-1)?.id);
