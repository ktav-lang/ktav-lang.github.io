import { convert, FORMATS, FORMAT_LABELS, ensureKtav } from "./converter.js";
import { createEditor } from "./cm-editor.js";

// ── Representative samples (one small service config, per format) ──────
// Code samples stay language-neutral across UI locales.

const SAMPLES = {
    json: `{
  "service": "socks5-rotator",
  "port": 20082,
  "log_level": "info",
  "debug": true,
  "upstreams": [
    { "host": "a.example", "port": 1080, "weight": 0.7 },
    { "host": "b.example", "port": 1080, "weight": 0.3 }
  ],
  "node": { "host": "a.example", "port": 1080 }
}
`,
    yaml: `service: socks5-rotator
port: 20082
log_level: info
debug: true
upstreams:
  - host: a.example
    port: 1080
    weight: 0.7
  - host: b.example
    port: 1080
    weight: 0.3
node:
  host: a.example
  port: 1080
`,
    toml: `service = "socks5-rotator"
port = 20082
log_level = "info"
debug = true

[[upstreams]]
host = "a.example"
port = 1080
weight = 0.7

[[upstreams]]
host = "b.example"
port = 1080
weight = 0.3

[node]
host = "a.example"
port = 1080
`,
    ini: `service = socks5-rotator
port = 20082
log_level = info
debug = true

[node]
host = a.example
port = 1080

[limits]
max_conns = 512
timeout = 30
`,
    ktav: `## A config for a SOCKS5 rotator.
service: socks5-rotator
port: 20082
log_level: info
debug: true

upstreams: [
    {
        host: a.example
        port: 1080
        weight: 0.7
    }
    {
        host: b.example
        port: 1080
        weight: 0.3
    }
]

## Dotted keys — a flat alternative to nesting.
node.host: a.example
node.port: 1080
## '::' forces a literal string — keeps "8080" from becoming a number.
node.auth:: p@ss:word
node.token:: 8080

motd: (
    Welcome to the node.
    Please behave.
)
`,
};

// ── Comparison matrix: marks (locale-independent) ──────────────────────

const CMP_MARKS = [
    { json: "no",  yaml: "part", toml: "no",   ini: "yes",  ktav: "yes" },
    { json: "no",  yaml: "yes",  toml: "yes",  ini: "part", ktav: "yes" },
    { json: "yes", yaml: "no",   toml: "yes",  ini: "yes",  ktav: "yes" },
    { json: "no",  yaml: "yes",  toml: "yes",  ini: "yes",  ktav: "yes" },
    { json: "no",  yaml: "part", toml: "yes",  ini: "no",   ktav: "yes" },
    { json: "no",  yaml: "no",   toml: "yes",  ini: "part", ktav: "yes" },
    { json: "yes", yaml: "yes",  toml: "yes",  ini: "no",   ktav: "yes" },
    { json: "yes", yaml: "no",   toml: "yes",  ini: "yes",  ktav: "yes" },
    { json: "yes", yaml: "part", toml: "yes",  ini: "no",   ktav: "yes" },
    { json: "yes", yaml: "no",   toml: "part", ini: "part", ktav: "yes" },
];

// ── Translations ───────────────────────────────────────────────────────

const I18N = {
    en: {
        htmlLang: "en",
        nav: { converter: "Converter", compare: "Compare", spec: "Spec", why: "Why ktav?" },
        hero: {
            badge: "Format + full ecosystem",
            title1: "Easy to read, type, and edit.",
            title2: "No extra symbols.",
            lead: `Ktav keeps JSON's shape — scalars, arrays, objects — but reads and writes like plain text:
                no mandatory quotes, no commas, no indentation traps, no
                <span class="font-mono" style="color:var(--ink)">no&nbsp;→&nbsp;false</span> surprises.
                <strong style="color:var(--ink)">Performance-first parsers in 7 languages</strong>, each a thin
                binding over one Rust core — <span style="color:var(--ink)">WebAssembly in the browser</span> —
                plus a tree-sitter grammar and LSP &amp; editor plugins, out of the box.`,
            try: "Try the converter ↓",
            spec: "Read the spec",
            libs: "Libraries",
            ides: "Editors",
        },
        conv: {
            badge: "Playground",
            title: "Convert, both ways",
            lead: "Paste JSON, YAML, TOML or INI and watch it become Ktav — or flip the arrow to go back. Everything runs locally: Ktav is powered by the official WASM bindings, no server, no upload.",
            source: "Source",
            output: "Output",
            sample: "Load sample",
            copy: "Copy",
            copied: "Copied",
            note: `Ktav is a <em>configuration</em> language, not a general data-interchange format: keys are dotted
                paths, the root must be an object or array, and some JSON/YAML shapes don't round-trip. When a
                conversion is lossy, the converter tells you exactly what changed.`,
        },
        cmp: {
            badge: "How it stacks up",
            title: "Ktav vs JSON · YAML · TOML · INI",
            feature: "Feature",
            legend: "✓ present · ~ partial · ✕ absent",
            rows: [
                { f: "Bare strings (no mandatory quoting)", n: { yaml: "context-sensitive" } },
                { f: "Comma-free lists", n: { ini: "no native lists" } },
                { f: "Whitespace-insensitive (no indent pitfalls)", n: { yaml: "indentation is structural" } },
                { f: "Native comments", n: {} },
                { f: "Human-writable multi-line strings", n: { yaml: "block scalars" } },
                { f: "Dotted keys for flat edits", n: { ini: "via sections" } },
                { f: "Nested objects & arrays", n: { ini: "flat sections only" } },
                { f: "No type-ambiguity (the YAML “Norway” trap)", n: { yaml: "no → false", ini: "all strings", ktav: "strict lexical typing" } },
                { f: "Force a literal string when needed", n: { json: "always quoted", yaml: "quote it", toml: "always quoted", ini: "no types anyway", ktav: "the :: escape" } },
                { f: "One parser, small spec", n: { yaml: "notoriously large", ini: "no single standard" } },
            ],
        },
        bind: {
            badge: "Install",
            title: "Seven languages, one Rust core",
            lead: "Every binding is a thin wrapper over the same reference parser written in Rust, exposed through a tiny C ABI — so you get identical behaviour and native speed everywhere, and WebAssembly in the browser.",
            reference: "reference",
            editors: "Editor plugins — direct download",
            allReleases: "All releases ↗",
        },
        why: {
            badge: "Why ktav?",
            title: "Why another config format?",
            q1: "Isn't JSON / YAML / TOML enough?",
            a1: `JSON is hostile to hand-edit — quotes, commas, no comments. YAML fixes the
                ergonomics but adds traps: significant indentation and silent type coercion
                (the infamous <span class="font-mono" style="color:var(--ink)">no → false</span>
                “Norway” bug). TOML is solid but splits tables vs inline. Ktav keeps JSON's
                shape and drops the punctuation tax — without inheriting YAML's surprises.`,
            q2: "What actually makes it different?",
            a2: `Types are inferred by <strong style="color:var(--ink)">strict lexical form</strong>:
                only <span class="font-mono" style="color:var(--ink)">true/false/null</span> and a
                strict number grammar are typed — everything else is a string, and
                <span class="font-mono" style="color:var(--ink)">::</span> forces a literal when you
                need it. No guessing. Plus dotted keys for flat edits, multi-line strings, and one
                small spec with one parser.`,
            q3: "Is it just another lonely format?",
            a3: `No — and that's the point. On day one Ktav ships official parsers for
                <strong style="color:var(--ink)">7 languages</strong> over a single Rust core, a
                tree-sitter grammar, an LSP, VS Code / JetBrains plugins, and a language-agnostic
                conformance suite. Identical behaviour everywhere, verified by tests.`,
            q4: "When should you NOT use it?",
            a4: `Ktav is a <em>configuration</em> language, not a data-interchange format — don't
                swap it for JSON in an API. If you need schemas, types and logic inside the config
                itself, tools like CUE or Dhall go further. Ktav deliberately stays small and readable.`,
        },
        footer: { license: "Dual-licensed under MIT OR Apache-2.0", spec: "Specification", js: "JS / WASM", repos: "All repos" },
        status: { ok: "Converted", notes: (n) => `Converted with ${n} note${n > 1 ? "s" : ""}` },
    },

    ru: {
        htmlLang: "ru",
        nav: { converter: "Конвертер", compare: "Сравнение", spec: "Спека", why: "Зачем ktav?" },
        hero: {
            badge: "Формат + готовая экосистема",
            title1: "Удобно читать, набирать и править,",
            title2: "без лишних символов.",
            lead: `Ktav сохраняет форму JSON — скаляры, массивы, объекты — но читается и пишется как обычный текст:
                никаких обязательных кавычек, запятых, ловушек с отступами и сюрпризов вида
                <span class="font-mono" style="color:var(--ink)">no&nbsp;→&nbsp;false</span>.
                <strong style="color:var(--ink)">Быстрые парсеры на 7 языках</strong> — каждый тонкая обёртка
                над единым ядром на Rust (<span style="color:var(--ink)">WebAssembly в браузере</span>) —
                плюс грамматика tree-sitter, LSP и плагины редакторов, из коробки.`,
            try: "Открыть конвертер ↓",
            spec: "Читать спецификацию",
            libs: "Библиотеки",
            ides: "Редакторы",
        },
        conv: {
            badge: "Песочница",
            title: "Конвертация в обе стороны",
            lead: "Вставьте JSON, YAML, TOML или INI — и смотрите, как это становится Ktav. Или поверните стрелку, чтобы обратно. Всё работает локально: Ktav крутится на официальных WASM-биндингах, без сервера и загрузок.",
            source: "Источник",
            output: "Результат",
            sample: "Загрузить пример",
            copy: "Копировать",
            copied: "Скопировано",
            note: `Ktav — это язык <em>конфигурации</em>, а не универсальный формат обмена данными: ключи — это
                точечные пути, корень должен быть объектом или массивом, а часть форм JSON/YAML не переживает
                обратное преобразование. Если конвертация с потерями — конвертер скажет, что именно изменилось.`,
        },
        cmp: {
            badge: "Как оно смотрится",
            title: "Ktav vs JSON · YAML · TOML · INI",
            feature: "Возможность",
            legend: "✓ есть · ~ частично · ✕ нет",
            rows: [
                { f: "Строки без обязательных кавычек", n: { yaml: "зависит от контекста" } },
                { f: "Списки без запятых", n: { ini: "нет нативных списков" } },
                { f: "Нечувствительность к пробелам (нет ловушек отступов)", n: { yaml: "отступы структурны" } },
                { f: "Нативные комментарии", n: {} },
                { f: "Удобные многострочные строки", n: { yaml: "блочные скаляры" } },
                { f: "Точечные ключи для плоских правок", n: { ini: "через секции" } },
                { f: "Вложенные объекты и массивы", n: { ini: "только плоские секции" } },
                { f: "Нет неоднозначности типов (ловушка «Norway» в YAML)", n: { yaml: "no → false", ini: "всё строки", ktav: "строгая типизация по форме" } },
                { f: "Принудительная строка, когда нужно", n: { json: "всегда в кавычках", yaml: "закавычить", toml: "всегда в кавычках", ini: "типов всё равно нет", ktav: "экран :: " } },
                { f: "Один парсер, маленькая спека", n: { yaml: "печально большая", ini: "нет единого стандарта" } },
            ],
        },
        bind: {
            badge: "Установка",
            title: "Семь языков, одно ядро на Rust",
            lead: "Каждый биндинг — тонкая обёртка над одним эталонным парсером на Rust (через крошечный C ABI): одинаковое поведение и нативная скорость везде, а в браузере — WebAssembly.",
            reference: "эталон",
            editors: "Плагины редакторов — прямое скачивание",
            allReleases: "Все релизы ↗",
        },
        why: {
            badge: "Зачем ktav?",
            title: "Зачем ещё один формат конфигов?",
            q1: "Разве JSON / YAML / TOML недостаточно?",
            a1: `JSON неудобно править руками — кавычки, запятые, нет комментариев. YAML чинит
                эргономику, но добавляет ловушки: значимые отступы и тихое приведение типов
                (печально известный баг «Norway»:
                <span class="font-mono" style="color:var(--ink)">no → false</span>). TOML хорош, но
                делит таблицы и inline. Ktav сохраняет форму JSON и убирает «пунктуационный налог» —
                не наследуя сюрпризов YAML.`,
            q2: "Чем он реально отличается?",
            a2: `Типы выводятся <strong style="color:var(--ink)">строго по лексической форме</strong>:
                типизируются только <span class="font-mono" style="color:var(--ink)">true/false/null</span>
                и строгая грамматика чисел — всё остальное строка, а
                <span class="font-mono" style="color:var(--ink)">::</span> форсит литерал, когда нужно.
                Никакого угадывания. Плюс точечные ключи для плоских правок, многострочные строки и
                одна маленькая спека с одним парсером.`,
            q3: "Это просто ещё один одинокий формат?",
            a3: `Нет — и в этом суть. С первого дня у Ktav официальные парсеры на
                <strong style="color:var(--ink)">7 языках</strong> над единым ядром на Rust,
                грамматика tree-sitter, LSP, плагины VS Code / JetBrains и язык-агностичный
                conformance-suite. Одинаковое поведение везде, подтверждённое тестами.`,
            q4: "Когда его НЕ стоит брать?",
            a4: `Ktav — язык <em>конфигурации</em>, а не формат обмена данными: не меняй им JSON в API.
                Если нужны схемы, типы и логика внутри самого конфига — CUE или Dhall дают больше.
                Ktav намеренно остаётся маленьким и читаемым.`,
        },
        footer: { license: "Двойная лицензия MIT OR Apache-2.0", spec: "Спецификация", js: "JS / WASM", repos: "Все репозитории" },
        status: { ok: "Готово", notes: (n) => `Готово, замечаний: ${n}` },
    },

    zh: {
        htmlLang: "zh",
        nav: { converter: "转换器", compare: "对比", spec: "规范", why: "为什么用 ktav？" },
        hero: {
            badge: "格式 + 完整生态",
            title1: "易读、易写、易改的配置，",
            title2: "没有多余符号。",
            lead: `Ktav 保留 JSON 的结构——标量、数组、对象——却像纯文本一样易读易写：
                无需强制引号、无逗号、没有缩进陷阱，也没有
                <span class="font-mono" style="color:var(--ink)">no&nbsp;→&nbsp;false</span> 这类意外。
                <strong style="color:var(--ink)">7 种语言的高性能解析器</strong>，每个都是对同一个 Rust 内核的轻量绑定
                （<span style="color:var(--ink)">浏览器中用 WebAssembly</span>），
                外加 tree-sitter 语法以及开箱即用的 LSP 与编辑器插件。`,
            try: "试用转换器 ↓",
            spec: "阅读规范",
            libs: "库",
            ides: "编辑器",
        },
        conv: {
            badge: "演练场",
            title: "双向转换",
            lead: "粘贴 JSON、YAML、TOML 或 INI，看它变成 Ktav——或点箭头反向转换。全部在本地运行：Ktav 由官方 WASM 绑定驱动，无服务器、不上传。",
            source: "源",
            output: "输出",
            sample: "载入示例",
            copy: "复制",
            copied: "已复制",
            note: `Ktav 是一种<em>配置</em>语言，而非通用数据交换格式：键是点路径，根必须是对象或数组，
                部分 JSON/YAML 结构无法无损往返。当转换有损时，转换器会准确告诉你改了什么。`,
        },
        cmp: {
            badge: "横向对比",
            title: "Ktav vs JSON · YAML · TOML · INI",
            feature: "特性",
            legend: "✓ 支持 · ~ 部分 · ✕ 不支持",
            rows: [
                { f: "裸字符串（无需强制引号）", n: { yaml: "依赖上下文" } },
                { f: "无逗号列表", n: { ini: "无原生列表" } },
                { f: "空白不敏感（无缩进陷阱）", n: { yaml: "缩进即结构" } },
                { f: "原生注释", n: {} },
                { f: "易写的多行字符串", n: { yaml: "块标量" } },
                { f: "点式键，便于扁平编辑", n: { ini: "通过节实现" } },
                { f: "嵌套对象与数组", n: { ini: "仅扁平的节" } },
                { f: "无类型歧义（YAML 的“Norway”陷阱）", n: { yaml: "no → false", ini: "全是字符串", ktav: "按词法严格定型" } },
                { f: "需要时强制为字面字符串", n: { json: "总是带引号", yaml: "加引号", toml: "总是带引号", ini: "本就无类型", ktav: ":: 转义" } },
                { f: "单一解析器，规范精简", n: { yaml: "出了名地庞大", ini: "无统一标准" } },
            ],
        },
        bind: {
            badge: "安装",
            title: "七种语言，同一个 Rust 内核",
            lead: "每个绑定都是对同一个用 Rust 编写的参考解析器的轻量封装（通过精简的 C ABI 暴露）——因此各处行为一致、速度原生，在浏览器中则使用 WebAssembly。",
            reference: "参考实现",
            editors: "编辑器插件 — 直接下载",
            allReleases: "全部发布 ↗",
        },
        why: {
            badge: "为什么用 ktav？",
            title: "为什么又一个配置格式？",
            q1: "JSON / YAML / TOML 还不够吗？",
            a1: `JSON 难以手写——引号、逗号、没有注释。YAML 改善了书写体验，却带来陷阱：缩进有意义、
                类型被悄悄转换（臭名昭著的
                <span class="font-mono" style="color:var(--ink)">no → false</span>「Norway」问题）。
                TOML 不错，但区分表与内联。Ktav 保留 JSON 的结构、去掉标点负担——又不继承 YAML 的意外。`,
            q2: "它到底有何不同？",
            a2: `类型按<strong style="color:var(--ink)">严格的词法形式</strong>推断：只有
                <span class="font-mono" style="color:var(--ink)">true/false/null</span> 和严格的数字语法
                会被定型——其余都是字符串，需要时用
                <span class="font-mono" style="color:var(--ink)">::</span> 强制为字面量。绝不靠猜。
                另有点式键便于扁平编辑、多行字符串，以及一份精简规范、一个解析器。`,
            q3: "它只是又一个孤零零的格式吗？",
            a3: `不是——这正是重点。Ktav 从第一天起就提供
                <strong style="color:var(--ink)">7 种语言</strong>的官方解析器（基于同一个 Rust 内核）、
                tree-sitter 语法、LSP、VS Code / JetBrains 插件，以及一套语言无关的一致性测试集。
                各处行为一致，并由测试保证。`,
            q4: "什么时候不该用它？",
            a4: `Ktav 是<em>配置</em>语言，而非数据交换格式——别在 API 里用它替代 JSON。
                若你需要在配置内置模式、类型与逻辑，CUE 或 Dhall 走得更远。Ktav 刻意保持小巧而易读。`,
        },
        footer: { license: "双重许可 MIT OR Apache-2.0", spec: "规范", js: "JS / WASM", repos: "全部仓库" },
        status: { ok: "已转换", notes: (n) => `已转换，有 ${n} 条提示` },
    },
};

// ── State ───────────────────────────────────────────────────────────────

const $ = (sel) => document.querySelector(sel);
let lang = document.documentElement.getAttribute("data-lang") || "en";
if (!I18N[lang]) lang = "en";
let lastStatus = { ok: true, error: null, warnings: [] };

// Populate format dropdowns
const srcFmtSel = $("#src-format");
const dstFmtSel = $("#dst-format");
for (const sel of [srcFmtSel, dstFmtSel]) {
    for (const f of FORMATS) {
        const opt = document.createElement("option");
        opt.value = f;
        opt.textContent = FORMAT_LABELS[f];
        sel.appendChild(opt);
    }
}
srcFmtSel.value = "json";
dstFmtSel.value = "ktav";

const srcEd = createEditor($("#src-editor"), { format: "json", value: SAMPLES.json, onInput: scheduleConvert });
const dstEd = createEditor($("#dst-editor"), { format: "ktav", readOnly: true });

// ── i18n application ─────────────────────────────────────────────────────

function t(path) {
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), I18N[lang]);
}

function applyI18n() {
    document.documentElement.setAttribute("lang", I18N[lang].htmlLang);
    document.documentElement.setAttribute("data-lang", lang);
    for (const el of document.querySelectorAll("[data-i18n]")) {
        const v = t(el.getAttribute("data-i18n"));
        if (typeof v === "string") el.textContent = v;
    }
    for (const el of document.querySelectorAll("[data-i18n-html]")) {
        const v = t(el.getAttribute("data-i18n-html"));
        if (typeof v === "string") el.innerHTML = v;
    }
    for (const btn of document.querySelectorAll("[data-lang]")) {
        btn.classList.toggle("lang-active", btn.getAttribute("data-lang") === lang);
    }
    buildComparison();
    renderStatus(lastStatus);
}

// ── Conversion ───────────────────────────────────────────────────────────

let timer = null;
function scheduleConvert() {
    clearTimeout(timer);
    timer = setTimeout(runConvert, 130);
}

async function runConvert() {
    await ensureKtav();
    const r = convert(srcFmtSel.value, dstFmtSel.value, srcEd.value);
    dstEd.setValue(r.output);
    lastStatus = { ok: r.ok, error: r.error, warnings: r.warnings };
    renderStatus(lastStatus);
}

function renderStatus({ ok, error, warnings }) {
    const statusEl = $("#status");
    if (error) {
        statusEl.innerHTML = `<span class="status-err">✕ ${escapeHtml(error)}</span>`;
        return;
    }
    if (warnings && warnings.length) {
        statusEl.innerHTML =
            `<span class="status-warn">⚠ ${escapeHtml(t("status.notes")(warnings.length))}</span>` +
            `<ul class="warn-list">${warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}</ul>`;
    } else {
        statusEl.innerHTML = `<span class="status-ok">✓ ${escapeHtml(t("status.ok"))}</span>`;
    }
}

function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

// ── Comparison table ─────────────────────────────────────────────────────

function buildComparison() {
    const tbody = $("#cmp-body");
    tbody.innerHTML = "";
    const symbol = { yes: "✓", no: "✕", part: "~" };
    const cls = { yes: "mark-yes", no: "mark-no", part: "mark-part" };
    const rows = I18N[lang].cmp.rows;
    CMP_MARKS.forEach((marks, i) => {
        const meta = rows[i] || { f: "", n: {} };
        const tr = document.createElement("tr");
        const th = document.createElement("td");
        th.textContent = meta.f;
        tr.appendChild(th);
        for (const f of FORMATS) {
            const td = document.createElement("td");
            if (f === "ktav") td.className = "col-ktav";
            const m = marks[f];
            const note = meta.n && meta.n[f] ? `<span class="note">${escapeHtml(meta.n[f])}</span>` : "";
            td.innerHTML = `<span class="cell ${cls[m]}">${symbol[m]}</span>${note}`;
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

// ── Controls ─────────────────────────────────────────────────────────────

srcFmtSel.addEventListener("change", () => {
    srcEd.setFormat(srcFmtSel.value);
    if (SAMPLES[srcFmtSel.value]) srcEd.setValue(SAMPLES[srcFmtSel.value]);
    runConvert();
});
dstFmtSel.addEventListener("change", () => {
    dstEd.setFormat(dstFmtSel.value);
    runConvert();
});

$("#sample").addEventListener("click", () => {
    const f = srcFmtSel.value;
    if (SAMPLES[f]) srcEd.setValue(SAMPLES[f]);
    runConvert();
});

const copyBtn = $("#copy");
copyBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(dstEd.value);
        copyBtn.textContent = t("conv.copied");
        setTimeout(() => (copyBtn.textContent = t("conv.copy")), 1200);
    } catch { /* clipboard blocked */ }
});

// Theme toggle
$("#theme-toggle")?.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("ktav-theme", next); } catch { /* ignore */ }
});

// Mobile nav dropdown (logo + theme toggle stay; the rest collapses here).
const navToggle = $("#nav-toggle");
const navMenu = $("#nav-menu");
function setMenu(open) {
    if (!navMenu || !navToggle) return;
    navMenu.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
}
navToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenu(!navMenu.classList.contains("open"));
});
navMenu?.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
});
document.addEventListener("click", (e) => {
    if (navMenu?.classList.contains("open") &&
        !e.target.closest("#nav-menu") && !e.target.closest("#nav-toggle")) {
        setMenu(false);
    }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// Click-to-copy install commands (binding cards).
document.addEventListener("click", (e) => {
    const el = e.target.closest(".cmd");
    if (!el) return;
    const text = el.getAttribute("data-cmd") || el.textContent.replace(/^\s*\$\s*/, "");
    navigator.clipboard?.writeText(text).then(() => {
        el.classList.add("copied");
        setTimeout(() => el.classList.remove("copied"), 1200);
    }).catch(() => { /* clipboard blocked */ });
});

// Language switcher
for (const btn of document.querySelectorAll("[data-lang]")) {
    btn.addEventListener("click", () => {
        lang = btn.getAttribute("data-lang");
        if (!I18N[lang]) lang = "en";
        try { localStorage.setItem("ktav-lang", lang); } catch { /* ignore */ }
        applyI18n();
        setMenu(false);
    });
}

// ── First paint ──────────────────────────────────────────────────────────

applyI18n();
runConvert();
