<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ktav — a plain config format, with a converter</title>
    <meta name="description" content="Ktav is a minimalist configuration format without YAML's pitfalls — official parsers in 7 languages, a tree-sitter grammar, and LSP/editor plugins out of the box. Convert JSON, YAML, TOML and INI to and from Ktav right in your browser." />

    <link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />

    <!-- SEO / discovery -->
    <link rel="canonical" href="https://ktav-lang.github.io/" />
    <meta name="keywords" content="ktav, config format, configuration language, YAML alternative, TOML, JSON, INI, config converter, rust, webassembly, wasm, parser, tree-sitter, LSP" />
    <meta name="author" content="Marat K" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#07060d" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Ktav" />
    <meta property="og:title" content="Ktav — a plain config format, with a converter" />
    <meta property="og:description" content="A minimalist config format without YAML's pitfalls. Convert JSON, YAML, TOML and INI to and from Ktav in your browser — powered by the official Rust/WASM bindings." />
    <meta property="og:url" content="https://ktav-lang.github.io/" />
    <meta property="og:image" content="https://ktav-lang.github.io/assets/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Ktav — a plain config format, with a converter" />
    <meta name="twitter:description" content="Convert JSON, YAML, TOML and INI to and from Ktav in your browser. Official parsers in 7 languages over one Rust core." />
    <meta name="twitter:image" content="https://ktav-lang.github.io/assets/og.png" />

    <!-- Structured data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Ktav",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "description": "A minimalist configuration format with official parsers in 7 languages, a tree-sitter grammar, and LSP/editor plugins. Includes an in-browser JSON/YAML/TOML/INI ⇄ Ktav converter.",
        "url": "https://ktav-lang.github.io/",
        "softwareHelp": "https://github.com/ktav-lang/spec",
        "license": "https://spdx.org/licenses/MIT.html",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    }
    </script>

    <!-- Set theme + language before first paint to avoid a flash. -->
    <script>
        (function () {
            var d = document.documentElement;
            try {
                var t = localStorage.getItem("ktav-theme");
                if (t !== "light" && t !== "dark") {
                    t = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
                }
                d.setAttribute("data-theme", t);
                var l = localStorage.getItem("ktav-lang");
                d.setAttribute("data-lang", (l === "ru" || l === "zh" || l === "en") ? l : "en");
            } catch (e) {
                d.setAttribute("data-theme", "dark");
                d.setAttribute("data-lang", "en");
            }
        })();
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

    <link rel="stylesheet" href="assets/tailwind.css" />
    <link rel="stylesheet" href="assets/styles.css" />
</head>
