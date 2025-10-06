# Web Compatibility Scanner

A command-line tool that scans web projects and generates compatibility reports showing which features are Baseline-ready, helping developers make informed modernization decisions.

## Highlights

- Detects modern web features in HTML, CSS, and JavaScript/TypeScript
- Indicates whether features are Baseline-ready (bundled dataset; MDN BCD integration on roadmap)
- Generates timestamped reports in JSON (default), YAML, or Markdown (md)
- Verbose mode shows example file locations for each feature

## Installation

### Requirements

- Node.js 16+ (18+ recommended)
- npm or yarn

### Local install for development

```bash
npm install
npm test
npm link   # optional, to use the CLI globally as `web-compat-scan`
```

Or run directly without linking:

```bash
node src/cli.js <path-to-project>
```

## Usage

Scan the current directory:

```bash
web-compat-scan .
```

Scan a specific directory and output YAML:

```bash
web-compat-scan ./examples/sample-site --format yaml
```

Scan a website URL:

```bash
web-compat-scan --url https://example.com
```

Scan a website URL and output Markdown:

```bash
web-compat-scan --url https://example.com --format md --output ./reports/example.md
```

Save to a specific file and show locations:

```bash
web-compat-scan . --output ./reports/compat.json --verbose
```

### CLI options

```bash
web-compat-scan [directory] [options]

Options:
  --url <url>             scan a website URL instead of a local directory
  -f, --format <format>   json | yaml | md (default: json)
  -o, --output <file>     custom output path
  -V, --verbose           show detected file locations
  -v, --version           output the current version
  -h, --help              display help
```

## What the report contains

The report includes:

- Project name and scan timestamp
- A list of detected features with:
  - `id` and human‑readable `name`
  - `status` (e.g., `baseline`)
  - `since` (approximate year broad support landed)
  - `browsers` (minimum versions by engine)
  - `count` (number of detections encountered)
  - `locations` (example files where the feature appears)

Example JSON:

```json
{
  "timestamp": "2025-09-25T21:50:16.901Z",
  "project": "sample-site",
  "features": [
    {
      "id": "css-grid",
      "name": "CSS Grid Layout",
      "status": "baseline",
      "since": "2017",
      "browsers": { "chrome": "57", "firefox": "52", "safari": "10.1", "edge": "16" },
      "count": 1,
      "locations": ["styles.css"]
    }
  ]
}
```

## How it works (MVP)

- Walks your project tree using `glob`
- Uses lightweight pattern matching to detect features such as:
  - CSS Grid via `display: grid`
  - Flexbox via `display: flex`
  - Container Queries via `@container` or `container-type:`
  - `:has()` in CSS
  - CSS Custom Properties via `--var: value`
  - `position: sticky` in CSS
  - Optional chaining (`?.`) and nullish coalescing (`??`) in JS/TS
  - Import Maps (`<script type="importmap">`) and ES Modules (`<script type="module">`)
- Maps detections to a bundled Baseline dataset
- Tracks a per‑feature `count` and capped example `locations`
- Writes a machine‑readable report to disk

## Examples

Explore the sample projects demonstrating various detections in `examples/`:

- `examples/sample-site/` — CSS Grid and Flexbox
  - Run: `web-compat-scan ./examples/sample-site --verbose`
- `examples/container-has-site/` — Container Queries, `:has()`, CSS variables, `position: sticky`, optional chaining, nullish coalescing
  - Run: `web-compat-scan ./examples/container-has-site --verbose`
- `examples/import-maps-esm-site/` — Import Maps and ES Modules in HTML
  - Run: `web-compat-scan ./examples/import-maps-esm-site --verbose`

URL scanning examples:

- Scan a URL with default JSON output
  - Run: `web-compat-scan --url https://example.com`
- Scan a URL and output Markdown
  - Run: `web-compat-scan --url https://example.com --format md --output ./reports/example.md`

## Roadmap

- Integrate real MDN Browser Compatibility Data (BCD) and Baseline signals
- Respect Browserslist targets from your project configuration
- Improve detection with proper parsers (PostCSS, @babel/parser, HTML parser)
- Additional output formats (HTML) suitable for CI artifacts
- Expand feature coverage (container queries, :has(), View Transitions, Import Maps, Clipboard, Web Share, etc.)

## Programmatic usage

```js
import WebCompatibilityScanner from 'web-compat-scanner';

const scanner = new WebCompatibilityScanner({ targetDir: '/path/to/project' });
await scanner.initialize();
const report = await scanner.scanDirectory();
const filePath = await scanner.generateReportFile(report, 'json');
console.log('Report written to', filePath);
```

## Development

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
