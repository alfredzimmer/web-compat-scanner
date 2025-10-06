# About the project

## Inspiration

Modernizing a web codebase often stalls on a simple question: which features are safe to use today? The answer usually requires jumping between MDN tables, caniuse, and internal target browser matrices. We wanted a single command that scans a project and clearly shows Baseline‑readiness so teams can move faster with confidence.

## What it does

- Scans your project’s HTML, CSS, and JS/TS files.
- Detects usage of modern platform features:
  - CSS: Grid, Flexbox, Container Queries (`@container`, `container-type:`), `:has()`, Custom Properties (`--var`), `position: sticky`
  - JS/TS: Optional chaining (`?.`), Nullish coalescing (`??`), ES Modules (imports/exports)
  - HTML: Import Maps (`<script type="importmap">`), ES Modules (`<script type="module">`)
- Classifies features against a Baseline‑style dataset and shows browser version thresholds.
- Tracks per‑feature counts and capped example locations.
- Generates a timestamped report (JSON/YAML) summarizing what’s ready and where it’s used.
- Provides a human‑readable CLI summary and optional verbose locations.

## How we built it

- Language/runtime: Node.js (ES Modules)
- CLI: `commander`, `chalk`, `ora`
- File discovery: `glob`
- Report formats: JSON and YAML
- Tests: Jest (configured for ESM)
- Example content: `examples/sample-site/`

Under the hood the MVP uses lightweight pattern detection (e.g., `display: grid` or `display: flex`) mapped to a bundled feature dataset. The CLI (`src/cli.js`) orchestrates scanning via the core `WebCompatibilityScanner` (`src/scanner.js`) and writes reports with timestamps.

## Challenges we ran into

- ESM + Jest integration. Getting Jest to play well with native ES modules required some configuration tweaks.
- Node fetch/import gotchas. The `node-fetch` default vs named import tripped us up initially.
- Choosing detection depth. A full parser‑based approach (PostCSS, Babel, HTML parser) is powerful but heavier; we started with pragmatic patterns to validate the workflow end‑to‑end.
- Balancing signal vs noise. Feature locations are useful, but we capped them to keep reports readable.

## Accomplishments that we're proud of

- End‑to‑end CLI flow that scans real projects and produces actionable reports.
- Clear, friendly terminal output with a machine‑readable artifact for CI.
- Solid test coverage for the MVP and a clean, documented code structure.
- An example site for quick demos and onboarding.

## What we learned

- Practical patterns for introducing ESM to tooling (Jest, CLI entrypoints).
- The value of starting with a thin detection layer to prove utility before deep parsing.
- How Baseline status frames modernization conversations across teams and PRs.

## What's next for web-compat-scanner

- MDN BCD + Baseline integration for authoritative data.
- Respect Browserslist targets from `.browserslistrc` or `package.json`.
- Parser‑based detection for richer signals:
  - CSS via PostCSS (container queries, `:has()`, logical properties, etc.)
  - JS via `@babel/parser` (import maps, TLA, syntax features)
  - HTML parsing (import maps, `<script type="module">`, etc.)
- Additional output formats (Markdown/HTML) optimized for CI artifacts and PR comments.
- Expanded feature coverage (View Transitions, Clipboard API, Web Share, File System Access, etc.).
- CI pipeline and pre‑commit hooks.
- Publish an npm package and maintain versioned releases.
