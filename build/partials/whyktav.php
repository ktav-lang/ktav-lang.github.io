<?php /* "Why ktav?" — honest answer to "why another config format". i18n via data-i18n. */ ?>
    <section id="why" class="max-w-6xl mx-auto px-5 py-12 sm:py-16">
        <div class="text-center mb-8">
            <span class="eyebrow" data-i18n="why.badge">Why ktav?</span>
            <h2 class="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight" data-i18n="why.title">Why another config format?</h2>
        </div>
        <div class="grid md:grid-cols-2 gap-4">
            <div class="why-item glass-soft">
                <h3 class="why-q" data-i18n="why.q1">Isn't JSON / YAML / TOML enough?</h3>
                <p class="why-a" data-i18n-html="why.a1">JSON is hostile to hand-edit — quotes, commas, no comments. YAML fixes the ergonomics but adds traps: significant indentation and silent type coercion (the infamous <span class="font-mono" style="color:var(--ink)">no → false</span> “Norway” bug). TOML is solid but splits tables vs inline. Ktav keeps JSON's shape and drops the punctuation tax — without inheriting YAML's surprises.</p>
            </div>
            <div class="why-item glass-soft">
                <h3 class="why-q" data-i18n="why.q2">What actually makes it different?</h3>
                <p class="why-a" data-i18n-html="why.a2">Types are inferred by <strong style="color:var(--ink)">strict lexical form</strong>: only <span class="font-mono" style="color:var(--ink)">true/false/null</span> and a strict number grammar are typed — everything else is a string, and <span class="font-mono" style="color:var(--ink)">::</span> forces a literal when you need it. No guessing. Plus dotted keys for flat edits, multi-line strings, and one small spec with one parser.</p>
            </div>
            <div class="why-item glass-soft">
                <h3 class="why-q" data-i18n="why.q3">Is it just another lonely format?</h3>
                <p class="why-a" data-i18n-html="why.a3">No — and that's the point. On day one Ktav ships official parsers for <strong style="color:var(--ink)">7 languages</strong> over a single Rust core, a tree-sitter grammar, an LSP, VS Code / JetBrains plugins, and a language-agnostic conformance suite. Identical behaviour everywhere, verified by tests.</p>
            </div>
            <div class="why-item glass-soft">
                <h3 class="why-q" data-i18n="why.q4">When should you NOT use it?</h3>
                <p class="why-a" data-i18n-html="why.a4">Ktav is a <em>configuration</em> language, not a data-interchange format — don't swap it for JSON in an API. If you need schemas, types and logic inside the config itself, tools like CUE or Dhall go further. Ktav deliberately stays small and readable.</p>
            </div>
        </div>
    </section>
