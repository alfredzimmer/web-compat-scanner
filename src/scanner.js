import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import fetch from 'node-fetch';
import ora from 'ora';

class WebCompatibilityScanner {
  constructor(options = {}) {
    this.targetDir = options.targetDir || process.cwd();
    this.baselineData = null;
    this.featureSupport = new Map();
  }

  async initialize() {
    await this.loadBaselineData();
  }

  async loadBaselineData() {
    const spinner = ora('Loading baseline compatibility data...').start();
    try {
      // In a real implementation, this would fetch from MDN or similar
      // For now, we'll use a simplified version
      this.baselineData = {
        'css-grid': {
          name: 'CSS Grid Layout',
          status: 'baseline',
          since: '2017',
          browsers: {
            chrome: '57',
            firefox: '52',
            safari: '10.1',
            edge: '16'
          }
        },
        'flexbox': {
          name: 'CSS Flexible Box Layout',
          status: 'baseline',
          since: '2012',
          browsers: {
            chrome: '29',
            firefox: '28',
            safari: '9',
            edge: '12'
          }
        },
        // Additional detectors (placeholder metadata until MDN BCD integration)
        'css-container-queries': {
          name: 'CSS Container Queries',
          status: 'unknown',
          since: '—',
          browsers: {}
        },
        'css-has-pseudo': {
          name: 'CSS :has() Pseudo-class',
          status: 'unknown',
          since: '—',
          browsers: {}
        },
        'css-custom-properties': {
          name: 'CSS Custom Properties (Variables)',
          status: 'unknown',
          since: '—',
          browsers: {}
        },
        'css-position-sticky': {
          name: 'CSS position: sticky',
          status: 'unknown',
          since: '—',
          browsers: {}
        },
        'js-optional-chaining': {
          name: 'JS Optional Chaining (?.)',
          status: 'unknown',
          since: '—',
          browsers: {}
        },
        'js-nullish-coalescing': {
          name: 'JS Nullish Coalescing (??)',
          status: 'unknown',
          since: '—',
          browsers: {}
        },
        'js-import-maps': {
          name: 'JS Import Maps',
          status: 'unknown',
          since: '—',
          browsers: {}
        },
        'js-es-modules': {
          name: 'JS ES Modules',
          status: 'unknown',
          since: '—',
          browsers: {}
        }
      };
      spinner.succeed('Loaded baseline compatibility data');
    } catch (error) {
      spinner.fail('Failed to load baseline data');
      throw error;
    }
  }

  async scanDirectory() {
    const spinner = ora('Scanning project for web features...').start();

    try {
      // Scan HTML files
      const htmlFiles = await glob('**/*.{html,htm}', { cwd: this.targetDir, nodir: true });

      // Scan CSS files
      const cssFiles = await glob('**/*.css', { cwd: this.targetDir, nodir: true });

      // Scan JavaScript files
      const jsFiles = await glob('**/*.{js,jsx,ts,tsx}', { cwd: this.targetDir, nodir: true });

      let totalFiles = htmlFiles.length + cssFiles.length + jsFiles.length;
      spinner.text = `Scanning ${totalFiles} files...`;

      // Process files in parallel with a concurrency limit
      const processFile = async (file) => {
        try {
          const content = await fs.readFile(path.join(this.targetDir, file), 'utf-8');
          this.analyzeContent(content, file);
        } catch (error) {
          console.error(`Error processing ${file}:`, error.message);
        }
      };

      // Process all files with a concurrency limit
      const BATCH_SIZE = 10;
      for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
        const batch = [
          ...htmlFiles.slice(i, i + BATCH_SIZE),
          ...cssFiles.slice(i, i + BATCH_SIZE),
          ...jsFiles.slice(i, i + BATCH_SIZE)
        ];

        await Promise.all(batch.map(processFile));
        spinner.text = `Scanned ${Math.min(i + BATCH_SIZE, totalFiles)}/${totalFiles} files...`;
      }

      spinner.succeed(`Scanned ${totalFiles} files`);
      return this.generateReport();
    } catch (error) {
      spinner.fail('Failed to scan directory');
      throw error;
    }
  }

  async scanUrl(url) {
    const spinner = ora(`Fetching ${url}...`).start();
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const content = await res.text();
      spinner.text = 'Analyzing fetched content...';
      // Use the URL as a pseudo filePath for context in locations
      this.analyzeContent(content, url);

      // Attempt to fetch linked CSS and JS assets (simple, non-exhaustive crawler)
      // This helps detect features that are present in external styles/scripts
      try {
        const assetUrls = new Set();

        // Find linked stylesheets: <link rel="stylesheet" href="...">
        for (const match of content.matchAll(/<link[^>]+rel\s*=\s*["']stylesheet["'][^>]*href\s*=\s*["']([^"']+)["']/ig)) {
          if (match[1]) assetUrls.add(new URL(match[1], url).toString());
        }

        // Find script src attributes: <script src="...">
        for (const match of content.matchAll(/<script[^>]+src\s*=\s*["']([^"']+)["']/ig)) {
          if (match[1]) assetUrls.add(new URL(match[1], url).toString());
        }

        // Also find <style>...</style> blocks already covered by analyzeContent

        if (assetUrls.size > 0) {
          spinner.text = `Fetching ${assetUrls.size} linked assets...`;
          const MAX_CONCURRENT = 6;
          const urls = Array.from(assetUrls);
          for (let i = 0; i < urls.length; i += MAX_CONCURRENT) {
            const batch = urls.slice(i, i + MAX_CONCURRENT);
            await Promise.all(batch.map(async (asset) => {
              try {
                const r = await fetch(asset);
                if (!r.ok) return;
                const text = await r.text();
                // Analyze the asset content and pass the asset URL as the filePath
                this.analyzeContent(text, asset);
              } catch (e) {
                // Non-fatal: continue with other assets
                // eslint-disable-next-line no-console
                console.error(`Failed to fetch asset ${asset}: ${e.message}`);
              }
            }));
          }
        }
      } catch (e) {
        // Non-fatal: asset fetching should not break the main scan
        // eslint-disable-next-line no-console
        console.error('Asset fetching failed:', e.message);
      }
      spinner.succeed('URL scanned');
      return this.generateReport();
    } catch (error) {
      spinner.fail(`Failed to scan URL: ${error.message}`);
      throw error;
    }
  }

  analyzeContent(content, filePath) {
    // Simple pattern matching for demonstration
    // In a real implementation, this would use proper parsing
    // Normalize extension detection for URLs by using the pathname when possible
    let ext = '';
    try {
      if (typeof filePath === 'string' && /^https?:\/\//i.test(filePath)) {
        const u = new URL(filePath);
        ext = path.extname(u.pathname).toLowerCase();
      } else {
        ext = path.extname(filePath).toLowerCase();
      }
    } catch (e) {
      ext = path.extname(filePath).toLowerCase();
    }

    // Check for CSS Grid
    if (content.includes('display: grid') || content.includes('display:grid')) {
      this.recordFeature('css-grid', filePath);
    }

    // Check for Flexbox
    if (content.includes('display: flex') || content.includes('display:flex')) {
      this.recordFeature('flexbox', filePath);
    }

    // Additional CSS detections
    if (ext === '.css' || ext === '.scss' || ext === '.less') {
      // Container queries
      if (/\@container\b/.test(content) || /container-type\s*:/.test(content)) {
        this.recordFeature('css-container-queries', filePath);
      }
      // :has() pseudo-class
      if (/:has\s*\(/.test(content)) {
        this.recordFeature('css-has-pseudo', filePath);
      }
      // Custom properties (variables)
      if (/--[a-zA-Z0-9_-]+\s*:/.test(content)) {
        this.recordFeature('css-custom-properties', filePath);
      }
      // position: sticky
      if (/position\s*:\s*sticky\b/.test(content)) {
        this.recordFeature('css-position-sticky', filePath);
      }
    }

    // HTML detections
    if (ext === '.html' || ext === '.htm') {
      // Import maps
      if (/<script[^>]+type\s*=\s*["']importmap["']/i.test(content)) {
        this.recordFeature('js-import-maps', filePath);
      }
      // ESM modules in HTML
      if (/<script[^>]+type\s*=\s*["']module["']/i.test(content)) {
        this.recordFeature('js-es-modules', filePath);
      }
    }

    // JavaScript/TypeScript detections
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      // Optional chaining
      if (/\?\./.test(content)) {
        this.recordFeature('js-optional-chaining', filePath);
      }
      // Nullish coalescing
      if (/\?\?/.test(content)) {
        this.recordFeature('js-nullish-coalescing', filePath);
      }
      // ESM import (naive, may match comments)
      if (/\bimport\s+[^'"].*from\s+['"][^'"]+['"]/m.test(content) || /\bexport\s+(default|\{)/.test(content)) {
        this.recordFeature('js-es-modules', filePath);
      }
    }

    // Add more feature detections as needed
  }

  recordFeature(featureId, filePath) {
    if (!this.featureSupport.has(featureId)) {
      this.featureSupport.set(featureId, {
        ...this.baselineData[featureId],
        locations: [],
        count: 0
      });
    }

    const feature = this.featureSupport.get(featureId);
    feature.count += 1;
    if (feature.locations.length < 10) { // Limit the number of locations to keep the report manageable
      feature.locations.push(filePath);
    } else if (feature.locations.length === 10) {
      feature.locations.push('... and more');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      project: path.basename(this.targetDir),
      features: []
    };

    for (const [id, data] of this.featureSupport.entries()) {
      report.features.push({
        id,
        name: data.name,
        status: data.status,
        since: data.since,
        browsers: data.browsers,
        locations: data.locations,
        count: data.count
      });
    }

    // Sort features by status and then by name
    report.features.sort((a, b) => {
      if (a.status === b.status) {
        return a.name.localeCompare(b.name);
      }
      return a.status === 'baseline' ? -1 : 1;
    });

    return report;
  }

  async generateReportFile(report, format = 'json') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = (format === 'markdown' || format === 'md') ? 'md' : format;
    const filename = `compatibility-report-${timestamp}.${ext}`;
    const filepath = path.join(this.targetDir, filename);

    let content;
    if (format === 'json') {
      content = JSON.stringify(report, null, 2);
    } else if (format === 'yaml') {
      const { stringify } = await import('yaml');
      content = stringify(report);
    } else if (format === 'md' || format === 'markdown') {
      content = this.toMarkdown(report);
    } else {
      throw new Error(`Unsupported format: ${format}. Use 'json', 'yaml', or 'md'.`);
    }

    await fs.writeFile(filepath, content, 'utf-8');
    return filepath;
  }

  toMarkdown(report) {
    const lines = [];
    lines.push(`# Web Compatibility Report`);
    lines.push('');
    lines.push(`- **Timestamp**: ${report.timestamp}`);
    lines.push(`- **Project**: ${report.project}`);
    lines.push('');
    lines.push(`## Summary`);
    lines.push('');
    if (!report.features || report.features.length === 0) {
      lines.push('No web features detected.');
    } else {
      for (const feature of report.features) {
        const statusLabel = feature.status === 'baseline' ? 'Baseline' : feature.status;
        lines.push(`### ${feature.name} (${feature.id})`);
        lines.push('');
        lines.push(`- **Status**: ${statusLabel}`);
        lines.push(`- **Since**: ${feature.since}`);
        if (feature.browsers && Object.keys(feature.browsers).length > 0) {
          lines.push('- **Browser Support**:');
          for (const [browser, version] of Object.entries(feature.browsers)) {
            lines.push(`  - ${browser}: ${version}`);
          }
        }
        if (feature.locations && feature.locations.length > 0) {
          lines.push('- **Found in**:');
          for (const loc of feature.locations.slice(0, 10)) {
            lines.push(`  - ${loc}`);
          }
        }
        lines.push('');
      }
    }
    return lines.join('\n');
  }
}

export default WebCompatibilityScanner;
