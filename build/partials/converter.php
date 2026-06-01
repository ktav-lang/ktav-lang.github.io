<?php /* The playground: two highlighted editors, format selects, swap, status. */ ?>
    <section id="convert" class="max-w-6xl mx-auto px-5 py-12 sm:py-16">
        <svg class="ktav-mark mx-auto mb-7" width="112" height="112" viewBox="0 0 200 200" role="img" aria-label="ktav">
            <circle class="coin" cx="100" cy="100" r="88" stroke-width="5"/>
            <text x="100" y="100" text-anchor="middle" dominant-baseline="central"
                  font-family="'JetBrains Mono','DejaVu Sans Mono','Consolas',monospace" font-weight="700" letter-spacing="-0.5"><tspan class="brace" font-size="30">{</tspan><tspan class="word" font-size="19"> ktav</tspan><tspan class="colon" font-size="19">:</tspan><tspan class="lang" font-size="19"> lang </tspan><tspan class="brace" font-size="30">}</tspan></text>
        </svg>
        <div class="text-center mb-8">
            <span class="eyebrow" data-i18n="conv.badge">Playground</span>
            <h2 class="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight" data-i18n="conv.title">Convert, both ways</h2>
            <p class="mt-3 text-base" style="color:var(--ink-dim);max-width:40rem;margin-inline:auto" data-i18n="conv.lead"></p>
        </div>

        <div class="glass rounded-3xl p-4 sm:p-6">
            <div class="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
                <!-- source -->
                <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between gap-2">
                        <label class="text-xs font-semibold uppercase tracking-wider" style="color:var(--ink-faint)" data-i18n="conv.source">Source</label>
                        <div class="flex items-center gap-2">
                            <button id="sample" class="btn btn-ghost" style="padding:0.42rem 0.8rem;font-size:0.8rem" data-i18n="conv.sample">Load sample</button>
                            <select id="src-format" class="pill" aria-label="Source format"></select>
                        </div>
                    </div>
                    <div id="src-editor"></div>
                </div>

                <!-- direction indicator: always source → output (pick formats per side) -->
                <div class="flex items-center justify-center" aria-hidden="true">
                    <svg class="flow-arrow rotate-90 lg:rotate-0" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </div>

                <!-- target -->
                <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between gap-2">
                        <label class="text-xs font-semibold uppercase tracking-wider" style="color:var(--ink-faint)" data-i18n="conv.output">Output</label>
                        <div class="flex items-center gap-2">
                            <button id="copy" class="btn btn-ghost" style="padding:0.42rem 0.8rem;font-size:0.8rem" data-i18n="conv.copy">Copy</button>
                            <select id="dst-format" class="pill" aria-label="Target format"></select>
                        </div>
                    </div>
                    <div id="dst-editor"></div>
                </div>
            </div>

            <div id="status" class="status mt-4 px-1"></div>
        </div>

        <p class="mt-4 text-xs text-center" style="color:var(--ink-faint);max-width:46rem;margin-inline:auto" data-i18n-html="conv.note"></p>
    </section>
