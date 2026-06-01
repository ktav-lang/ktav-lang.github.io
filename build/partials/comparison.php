<?php /* Feature comparison table. Header is static; rows are filled by app.js. */ ?>
    <section id="compare" class="max-w-6xl mx-auto px-5 py-12 sm:py-16">
        <div class="text-center mb-8">
            <span class="eyebrow" data-i18n="cmp.badge">How it stacks up</span>
            <h2 class="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight" data-i18n="cmp.title">Ktav vs JSON · YAML · TOML · INI</h2>
        </div>
        <div class="glass rounded-3xl p-2 sm:p-4 overflow-x-auto">
            <table class="cmp">
                <thead>
                    <tr>
                        <th data-i18n="cmp.feature">Feature</th>
                        <th>JSON</th>
                        <th>YAML</th>
                        <th>TOML</th>
                        <th>INI</th>
                        <th class="col-ktav">Ktav</th>
                    </tr>
                </thead>
                <tbody id="cmp-body"></tbody>
            </table>
        </div>
        <p class="mt-4 text-xs text-center" style="color:var(--ink-faint)" data-i18n="cmp.legend">✓ present · ~ partial · ✕ absent</p>
    </section>
