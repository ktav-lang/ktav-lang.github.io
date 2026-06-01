/**
 * Tailwind scans the generated index.html (all final utility classes live
 * there) plus the partials, and emits a minified static stylesheet —
 * replacing the Play CDN runtime. Run via `php build/build.php --js`.
 * Paths are relative to the repo root (build.php chdirs there first).
 */
module.exports = {
    content: ["./index.html", "./build/partials/**/*.php"],
    theme: { extend: {} },
    plugins: [],
};
