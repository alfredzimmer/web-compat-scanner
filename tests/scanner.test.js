import { test, expect, beforeAll } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import WebCompatibilityScanner from '../src/scanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DIR = path.join(__dirname, 'test-project');

// Create test files before running tests
beforeAll(async () => {
  // Create test directory
  try {
    await fs.mkdir(TEST_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }

  // Create test files with simpler content
  const testFiles = {
    'index.html': [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '  <title>Test Page</title>',
      '  <link rel="stylesheet" href="styles.css">',
      '</head>',
      '<body>',
      '  <div class="grid-container">',
      '    <div class="grid-item">Item 1</div>',
      '    <div class="grid-item">Item 2</div>',
      '  </div>',
      '  <script src="app.js"></script>',
      '</body>',
      '</html>'
    ].join('\n'),
    'styles.css': [
      '.grid-container {',
      '  display: grid;',
      '  grid-template-columns: 1fr 1fr;',
      '  gap: 20px;',
      '}',
      '  ',
      '.flex-container {',
      '  display: flex;',
      '  justify-content: space-between;',
      '}'
    ].join('\n'),
    'app.js': [
      '// Simple JavaScript file',
      'console.log("Hello, world!");'
    ].join('\n')
  };

  // Write test files
  for (const [filename, content] of Object.entries(testFiles)) {
    await fs.writeFile(path.join(TEST_DIR, filename), content, 'utf-8');
  }
});

test('scanner detects CSS Grid usage', async () => {
  const scanner = new WebCompatibilityScanner({ targetDir: TEST_DIR });
  await scanner.initialize();
  const report = await scanner.scanDirectory();
  
  const gridFeature = report.features.find(f => f.id === 'css-grid');
  expect(gridFeature).toBeDefined();
  expect(gridFeature.status).toBe('baseline');
  expect(gridFeature.locations).toContain('styles.css');
});

test('scanner detects Flexbox usage', async () => {
  const scanner = new WebCompatibilityScanner({ targetDir: TEST_DIR });
  await scanner.initialize();
  const report = await scanner.scanDirectory();
  
  const flexboxFeature = report.features.find(f => f.id === 'flexbox');
  expect(flexboxFeature).toBeDefined();
  expect(flexboxFeature.status).toBe('baseline');
  expect(flexboxFeature.locations).toContain('styles.css');
});

test('generates valid report structure', async () => {
  const scanner = new WebCompatibilityScanner({ targetDir: TEST_DIR });
  await scanner.initialize();
  const report = await scanner.scanDirectory();
  
  expect(report).toHaveProperty('timestamp');
  expect(report).toHaveProperty('project');
  expect(Array.isArray(report.features)).toBe(true);
  
  if (report.features.length > 0) {
    const feature = report.features[0];
    expect(feature).toHaveProperty('id');
    expect(feature).toHaveProperty('name');
    expect(feature).toHaveProperty('status');
    expect(feature).toHaveProperty('browsers');
    expect(feature).toHaveProperty('locations');
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Clean up test files
  try {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  } catch (error) {
    console.error('Error cleaning up test files:', error);
  }
});
