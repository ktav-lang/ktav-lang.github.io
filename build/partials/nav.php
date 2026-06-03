<?php /* Top navigation: logo · big theme toggle (centre) · language flags + links. */ ?>
    <header class="sticky top-0 z-50">
        <div class="glass-soft">
            <nav class="max-w-6xl mx-auto px-5 py-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <!-- left: logo -->
                <a href="#" class="flex items-center gap-2.5 no-underline justify-self-start">
                    <span style="font-size:1.5rem" lang="he">כְּתָב</span>
                    <span class="font-extrabold tracking-tight text-lg" style="color:var(--ink)">ktav</span>
                </a>

                <!-- center: big theme toggle (sun ⇄ moon) -->
                <button id="theme-toggle" class="theme-toggle justify-self-center" title="Toggle light / dark" aria-label="Toggle light / dark theme">
                    <svg class="i-moon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    <svg class="i-sun" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M4.22 4.22l1.77 1.77M18.01 18.01l1.77 1.77M2 12h2.5M19.5 12H22M4.22 19.78l1.77-1.77M18.01 5.99l1.77-1.77"/></svg>
                </button>

                <!-- right: language switcher + links (inline on desktop, dropdown on mobile) -->
                <div class="justify-self-end relative flex items-center gap-2 sm:gap-3">
                    <div id="nav-menu" class="nav-menu">
                        <div class="lang-switch" role="group" aria-label="Language">
                            <button class="lang-btn" data-lang="en" title="English" aria-label="English">
                                <svg viewBox="0 0 22 15" class="flag"><rect width="22" height="15" fill="#B22234"/><g fill="#fff"><rect y="1.15" width="22" height="1.15"/><rect y="3.46" width="22" height="1.15"/><rect y="5.77" width="22" height="1.15"/><rect y="8.08" width="22" height="1.15"/><rect y="10.38" width="22" height="1.15"/><rect y="12.69" width="22" height="1.15"/></g><rect width="9.5" height="8.08" fill="#3C3B6E"/><g fill="#fff"><circle cx="1.8" cy="1.6" r="0.5"/><circle cx="4.5" cy="1.6" r="0.5"/><circle cx="7.2" cy="1.6" r="0.5"/><circle cx="3.1" cy="3.2" r="0.5"/><circle cx="5.8" cy="3.2" r="0.5"/><circle cx="1.8" cy="4.8" r="0.5"/><circle cx="4.5" cy="4.8" r="0.5"/><circle cx="7.2" cy="4.8" r="0.5"/><circle cx="3.1" cy="6.4" r="0.5"/><circle cx="5.8" cy="6.4" r="0.5"/></g></svg>
                            </button>
                            <button class="lang-btn" data-lang="ru" title="Русский" aria-label="Русский">
                                <svg viewBox="0 0 22 15" class="flag"><rect width="22" height="5" fill="#fff"/><rect y="5" width="22" height="5" fill="#0039A6"/><rect y="10" width="22" height="5" fill="#D52B1E"/></svg>
                            </button>
                            <button class="lang-btn" data-lang="zh" title="中文" aria-label="中文">
                                <svg viewBox="0 0 22 15" class="flag"><rect width="22" height="15" fill="#DE2910"/><text x="2.2" y="6.6" fill="#FFDE00" font-size="6" font-family="serif">★</text><text x="7.2" y="2.4" fill="#FFDE00" font-size="2.3" font-family="serif">★</text><text x="9" y="4.2" fill="#FFDE00" font-size="2.3" font-family="serif">★</text><text x="9" y="6.7" fill="#FFDE00" font-size="2.3" font-family="serif">★</text><text x="7.2" y="8.6" fill="#FFDE00" font-size="2.3" font-family="serif">★</text></svg>
                            </button>
                        </div>
                        <a class="btn btn-ghost" href="#why" data-i18n="nav.why">Why ktav?</a>
                        <a class="btn btn-ghost" href="https://github.com/ktav-lang/spec" data-i18n="nav.spec">Spec</a>
                        <a class="btn btn-primary" href="https://github.com/ktav-lang">GitHub</a>
                    </div>

                    <!-- mobile-only hamburger -->
                    <button id="nav-toggle" class="nav-toggle sm:hidden" aria-label="Menu" aria-expanded="false" aria-controls="nav-menu">
                        <svg class="i-bars" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
                        <svg class="i-x" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                    </button>
                </div>
            </nav>
        </div>
    </header>
