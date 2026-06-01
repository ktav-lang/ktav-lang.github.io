<?php
/*
 * "Get it in your language" — the seven official bindings + the editor
 * plugins. Logos come from build/data/icons.php via icon($slug); install
 * commands are click-to-copy (see the .cmd handler in app.js).
 */
$bindings = [
    ['name' => 'Rust',            'slug' => 'rust',   'ref' => true,  'cmd' => 'cargo add ktav',                                'repo' => 'https://github.com/ktav-lang/rust'],
    ['name' => 'JavaScript / TS', 'slug' => 'js',     'ref' => false, 'cmd' => 'npm i @ktav-lang/ktav',                          'repo' => 'https://github.com/ktav-lang/js',     'note' => 'native + WASM', 'noteTitle' => 'Native N-API on Node & Bun; WebAssembly in browsers and Deno — one package, picks the right backend'],
    ['name' => 'Python',          'slug' => 'python', 'ref' => false, 'cmd' => 'pip install ktav',                              'repo' => 'https://github.com/ktav-lang/python'],
    ['name' => 'Go',              'slug' => 'go',     'ref' => false, 'cmd' => 'go get github.com/ktav-lang/golang',            'repo' => 'https://github.com/ktav-lang/golang'],
    ['name' => 'PHP',             'slug' => 'php',    'ref' => false, 'cmd' => 'composer require ktav-lang/ktav',               'repo' => 'https://github.com/ktav-lang/php',    'note' => 'needs ext-ffi', 'noteTitle' => 'Requires the PHP FFI extension (ext-ffi); no extension compilation on the consumer side'],
    ['name' => 'Java / JVM',      'slug' => 'java',   'ref' => false, 'cmd' => 'implementation("io.github.ktav-lang:ktav:0.6.0")', 'repo' => 'https://github.com/ktav-lang/java', 'note' => 'JDK 17 · JNA', 'noteTitle' => 'Gradle/Maven coordinate io.github.ktav-lang:ktav (Maven Central publication planned); needs JDK 17 and the JNA runtime'],
    ['name' => 'C# / .NET',       'slug' => 'dotnet', 'ref' => false, 'cmd' => 'dotnet add package Ktav',                       'repo' => 'https://github.com/ktav-lang/csharp'],
];

$VSIX = 'https://github.com/ktav-lang/editor/releases/download/v0.6.0/ktav-0.6.0.vsix';
$JB   = 'https://github.com/ktav-lang/editor/releases/download/v0.6.0/ktav-intellij-0.6.0%2B20260601-2129.zip';
?>
    <section id="bindings" class="max-w-6xl mx-auto px-5 py-12 sm:py-16">
        <div class="text-center mb-8">
            <span class="eyebrow" data-i18n="bind.badge">Install</span>
            <h2 class="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight" data-i18n="bind.title">Seven languages, one Rust core</h2>
            <p class="mt-3 text-base" style="color:var(--ink-dim);max-width:44rem;margin-inline:auto" data-i18n="bind.lead"></p>
        </div>

        <ul class="binding-list glass rounded-3xl">
            <?php foreach ($bindings as $b): ?>
            <li class="binding-row<?= $b['ref'] ? ' is-ref' : '' ?>">
                <div class="binding-head">
                    <svg class="lang-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="<?= icon($b['slug']) ?>"/></svg>
                    <a class="binding-name" href="<?= $b['repo'] ?>"><?= $b['name'] ?></a>
                    <?php if (!empty($b['note'])): ?><span class="binding-note" title="<?= htmlspecialchars($b['noteTitle'] ?? '', ENT_QUOTES) ?>"><?= $b['note'] ?></span><?php endif; ?>
                    <?php if ($b['ref']): ?><span class="binding-ref" data-i18n="bind.reference">reference</span><?php endif; ?>
                </div>
                <code class="cmd" data-cmd="<?= htmlspecialchars($b['cmd'], ENT_QUOTES) ?>" title="Click to copy"><span class="prompt">$</span> <?= htmlspecialchars($b['cmd'], ENT_QUOTES) ?></code>
            </li>
            <?php endforeach; ?>
        </ul>

        <div id="editors" class="mt-10 text-center">
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider" style="color:var(--ink-faint)" data-i18n="bind.editors">Editor plugins — direct download</h3>
            <div class="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
                <a class="btn btn-ghost" href="<?= $VSIX ?>">
                    <svg width="18" height="18" viewBox="0 0 128 128" fill="currentColor" aria-hidden="true"><path d="<?= icon('vscode') ?>"/></svg>
                    VS&nbsp;Code / VSCodium <span style="color:var(--ink-faint);font-weight:500">.vsix</span>
                </a>
                <a class="btn btn-ghost" href="<?= $JB ?>">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="<?= icon('jetbrains') ?>"/></svg>
                    JetBrains IDEs <span style="color:var(--ink-faint);font-weight:500">.zip</span>
                </a>
                <a class="btn btn-ghost" href="https://github.com/ktav-lang/editor/releases" data-i18n="bind.allReleases">All releases ↗</a>
            </div>
        </div>
    </section>
