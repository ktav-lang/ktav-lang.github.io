<?php /* Hero: pitch on the left, a static highlighted Ktav snippet on the right. */ ?>
    <section class="max-w-6xl mx-auto px-5 pt-16 pb-10 sm:pt-24 sm:pb-14">
        <div class="grid lg:grid-cols-2 gap-10 items-center">
            <div class="fade-in">
                <span class="eyebrow"><span class="dot"></span> <span data-i18n="hero.badge">Format + full ecosystem</span></span>
                <h1 class="mt-5 text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
                    <span data-i18n="hero.title1">Easy to read, type, and edit.</span><br />
                    <span class="gradient-text" data-i18n="hero.title2">No extra symbols.</span>
                </h1>
                <p class="mt-5 text-lg leading-relaxed" style="color:var(--ink-dim);max-width:34rem" data-i18n-html="hero.lead"></p>
                <div class="mt-8 flex flex-wrap gap-3">
                    <a href="#convert" class="btn btn-primary" data-i18n="hero.try">Try the converter ↓</a>
                    <a href="https://github.com/ktav-lang/spec" class="btn btn-ghost" data-i18n="hero.spec">Read the spec</a>
                </div>
<?php $langSlugs = ['rust', 'js', 'python', 'go', 'php', 'java', 'dotnet']; $ideSlugs = ['vscode', 'jetbrains']; ?>
                <div class="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <a href="#bindings" class="jump" title="Install for your language" aria-label="Jump to install commands">
                        <span class="jump-label" data-i18n="hero.libs">Libraries</span>
                        <span class="jump-icons"><?php foreach ($langSlugs as $s): ?><svg class="lang-icon" viewBox="<?= iconVB($s) ?>" fill="currentColor" aria-hidden="true"><path d="<?= icon($s) ?>"/></svg><?php endforeach; ?></span>
                    </a>
                    <a href="#editors" class="jump" title="Editor plugins" aria-label="Jump to editor plugins">
                        <span class="jump-label" data-i18n="hero.ides">Editors</span>
                        <span class="jump-icons"><?php foreach ($ideSlugs as $s): ?><svg class="lang-icon" viewBox="<?= iconVB($s) ?>" fill="currentColor" aria-hidden="true"><path d="<?= icon($s) ?>"/></svg><?php endforeach; ?></span>
                    </a>
                </div>
            </div>

            <!-- Hero snippet -->
            <div class="glass glow-violet rounded-3xl p-5 sm:p-6 fade-in">
                <div class="flex items-center gap-2 mb-4">
                    <span style="width:11px;height:11px;border-radius:99px;background:#ff5f57"></span>
                    <span style="width:11px;height:11px;border-radius:99px;background:#febc2e"></span>
                    <span style="width:11px;height:11px;border-radius:99px;background:#28c840"></span>
                    <span class="ml-2 font-mono text-xs" style="color:var(--ink-faint)">service.ktav</span>
                </div>
<pre class="font-mono text-[13px] leading-[1.7] overflow-x-auto" style="margin:0"><code><span class="tok-comment">## A SOCKS5 rotator config.</span>
<span class="tok-key">service</span><span class="tok-marker">:</span> <span class="tok-string">socks5-rotator</span>
<span class="tok-key">port</span><span class="tok-marker">:</span> <span class="tok-num">20082</span>
<span class="tok-key">debug</span><span class="tok-marker">:</span> <span class="tok-bool">true</span>

<span class="tok-key">upstreams</span><span class="tok-marker">:</span> <span class="tok-punct">[</span>
    <span class="tok-punct">{</span> <span class="tok-key">host</span><span class="tok-marker">:</span> <span class="tok-string">a.example</span><span class="tok-punct">,</span> <span class="tok-key">weight</span><span class="tok-marker">:</span> <span class="tok-num">0.7</span> <span class="tok-punct">}</span>
<span class="tok-punct">]</span>

<span class="tok-comment">## dotted keys = flat nesting</span>
<span class="tok-key">node</span><span class="tok-punct">.</span><span class="tok-key">host</span><span class="tok-marker">:</span> <span class="tok-string">a.example</span>
<span class="tok-comment">## '::' forces a literal string</span>
<span class="tok-key">node</span><span class="tok-punct">.</span><span class="tok-key">auth</span><span class="tok-marker">::</span> <span class="tok-string">p@ss:word</span></code></pre>
            </div>
        </div>
    </section>
