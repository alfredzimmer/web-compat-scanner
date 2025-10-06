# Web Compatibility Scanner — Video Script

## Title Card (0:00–0:03)
- On-screen: “Web Compatibility Scanner”
- Sub: “Scan your code. Ship with confidence.”

## Hook (0:03–0:12)
Narration: “Modernizing your web app? Unsure which features are safe across browsers? Stop guessing—scan your codebase and get a clear, Baseline-style report in seconds.”

## Problem (0:12–0:25)
- On-screen B‑roll: Dev jumping between MDN, caniuse, browser matrices.
- Narration: “Teams waste hours cross‑checking MDN tables, caniuse charts, and internal targets. It’s slow, error‑prone, and blocks progress.”

## Solution (0:25–0:40)
- On-screen: Terminal showing `web-compat-scan ./examples/sample-site --verbose`.
- Narration: “Web Compatibility Scanner inspects your HTML, CSS, and JS/TS, detects modern platform features, and tells you if they’re Baseline‑ready—complete with a timestamped JSON or YAML report.”

## What it does (0:40–1:05)
- On-screen bullets pulled from `README.md` and `ABOUT.md`:
  - Scans project files
  - Detects features like CSS Grid, Flexbox, Container Queries, `:has()`, Custom Properties, optional chaining, nullish coalescing, Import Maps, ES Modules
  - Classifies against a bundled Baseline dataset
  - Counts occurrences and shows example locations
  - Generates human‑readable CLI summary + machine‑readable report
- Narration: “You’ll see which features appear, their Baseline status, minimum browser versions, where they show up, and a report you can use in CI.”

## Quick Demo (1:05–1:45)
- On-screen:
  - Show project tree `web-compat-scanner/examples/` with the three example sites.
  - Terminal run:
    - `web-compat-scan ./examples/sample-site --verbose`
    - `web-compat-scan ./examples/container-has-site --verbose --format json`
    - `web-compat-scan ./examples/import-maps-esm-site --verbose --format yaml`
  - Highlight CLI summary output: feature names, Baseline status, browser versions, “Found in” file paths.
  - Show report file saved path from CLI: “Report generated: …/reports/…json/yaml”.
- Narration: “Run the scanner on any folder. The CLI prints a clear summary and writes a timestamped report you can archive or feed into automation.”

## How it works (1:45–2:00)
- On-screen: `src/scanner.js`, `src/cli.js`.
- Narration: “Under the hood, it uses pragmatic pattern detection via `glob`, mapping results to a Baseline-style dataset. It’s designed for speed and clarity, with deeper parser-based detection on the roadmap.”

## Who it’s for (2:00–2:10)
- On-screen: “Modernization, CI/CD, Tech Leads, Frontend Infra”.
- Narration: “Perfect for modernization sprints, CI checks, and quick audits before adopting new features.”

## Roadmap (2:10–2:25)
- On-screen bullets from `ABOUT.md` and `README.md`:
  - MDN BCD + Baseline integration
  - Respect Browserslist targets
  - Parser-based detection (PostCSS, Babel, HTML parser)
  - Markdown/HTML reports for CI artifacts
  - Expanded features (View Transitions, Clipboard, Web Share, etc.)
- Narration: “Next up: authoritative MDN BCD signals, Browserslist support, deeper parsing, and CI‑friendly formats.”

## Call to Action (2:25–2:35)
- On-screen:
  - `npm install`
  - `node src/cli.js <path>` or `web-compat-scan <path>`
  - `npm run demo` to showcase examples
- Narration: “Install, scan, and ship with confidence. Try the included demo to see it in action.”

## End Card (2:35–2:40)
- On-screen: “Web Compatibility Scanner” + URL/repo and “MIT Licensed”.
- Narration: “Web Compatibility Scanner—clarity for your next upgrade.”

---

## Short Social Cut (≤30s)
- Hook: “Which features are safe to use today?”
- Show terminal: `web-compat-scan ./examples/sample-site --verbose`
- Flash results: “✓ Baseline”, browser versions, “Report generated: …”
- CTA: “Scan your codebase today. npm run demo.”

## Voiceover Script Only (copyable)
"""
Modernizing your web app but not sure what’s safe to use? Stop guessing.
Web Compatibility Scanner inspects your HTML, CSS, and JavaScript to detect modern features and tells you if they’re Baseline‑ready.
Run it on any folder and get a clear CLI summary plus a timestamped JSON or YAML report.
See where features like CSS Grid, Flexbox, Container Queries, :has(), optional chaining, and Import Maps are used, and which browser versions you’re targeting.
It’s fast, practical, and designed to integrate into CI.
Up next: MDN BCD integration, Browserslist targets, deeper parser‑based detection, and CI‑friendly report formats.
Install and run the demo to see it in action. Web Compatibility Scanner—scan your code and ship with confidence.
"""

## On-Screen Text/Assets Checklist
- Project references:
  - `web-compat-scanner/README.md` and `web-compat-scanner/ABOUT.md`
  - CLI: `web-compat-scanner/src/cli.js`
  - Scanner: `web-compat-scanner/src/scanner.js`
  - Examples: `web-compat-scanner/examples/`
- Commands:
  - `npm install`
  - `node src/cli.js ./examples/sample-site --verbose`
  - `web-compat-scan . --format yaml`
  - `npm run demo`
- Report location: `web-compat-scanner/reports/…`

## Optional B‑roll Suggestions
- Terminal running scans and generating reports.
- Opening `src/cli.js` and `src/scanner.js`.
- Browsing `examples/` and highlighting CSS/JS snippets that trigger detections.
- Side-by-side: code snippet ↔ detected feature in CLI.
