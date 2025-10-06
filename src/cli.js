#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import chalk from 'chalk';
import WebCompatibilityScanner from './scanner.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const program = new Command();

  program
    .name('web-compat-scan')
    .description('Scan web projects for feature compatibility')
    .version(version, '-v, --version', 'output the current version')
    .argument('[directory]', 'directory to scan (default: current directory)', process.cwd())
    .option('--url <url>', 'scan a website URL instead of a local directory')
    .option('-f, --format <format>', 'output format (json, yaml, md)', 'json')
    .option('-o, --output <file>', 'output file path')
    .option('-V, --verbose', 'show detailed output', false)
    .action(runScan);

  await program.parseAsync(process.argv);
}

async function runScan(directory, options) {
  try {
    const isUrlScan = Boolean(options.url);
    const targetLabel = isUrlScan ? options.url : directory;
    const scanner = new WebCompatibilityScanner({
      targetDir: isUrlScan ? process.cwd() : path.resolve(directory),
      verbose: options.verbose
    });

    console.log(chalk.blue(`\n🔍 Scanning ${chalk.bold(targetLabel)} for web feature compatibility...\n`));
    
    await scanner.initialize();
    const report = isUrlScan
      ? await scanner.scanUrl(options.url)
      : await scanner.scanDirectory();
    
    // Generate report file
    let outputFile;
    if (options.output) {
      // Write to the specified output path
      const fmt = options.format;
      let content;
      if (fmt === 'json') {
        content = JSON.stringify(report, null, 2);
      } else if (fmt === 'yaml') {
        const { stringify } = await import('yaml');
        content = stringify(report);
      } else if (fmt === 'md' || fmt === 'markdown') {
        content = scanner.toMarkdown(report);
      } else {
        throw new Error(`Unsupported format: ${fmt}. Use 'json', 'yaml', or 'md'.`);
      }
      await fs.writeFile(options.output, content, 'utf-8');
      outputFile = options.output;
    } else {
      outputFile = await scanner.generateReportFile(report, options.format);
    }
    
    // Display summary
    console.log('\n' + chalk.green.bold('✅ Scan Complete!') + '\n');
    
    // Display summary table
    console.log(chalk.underline('Feature Compatibility Summary'));
    console.log('='.repeat(50));
    
    if (report.features.length === 0) {
      console.log('\n' + chalk.yellow('No web features detected in the scanned files.'));
    } else {
      report.features.forEach(feature => {
        const status = feature.status === 'baseline' 
          ? chalk.green('✓ Baseline') 
          : chalk.yellow(`⚠️ ${feature.status}`);
        
        console.log(`\n${chalk.bold(feature.name)} (${feature.id})`);
        console.log(`Status: ${status}`);
        console.log(`Since: ${feature.since}`);
        console.log('Browser Support:');
        Object.entries(feature.browsers).forEach(([browser, version]) => {
          console.log(`  ${browser.padEnd(8)}: ${version}`);
        });
        
        if (options.verbose && feature.locations && feature.locations.length > 0) {
          console.log('Found in:');
          feature.locations.slice(0, 3).forEach(loc => {
            console.log(`  - ${loc}`);
          });
          if (feature.locations.length > 3) {
            console.log(`  ... and ${feature.locations.length - 3} more locations`);
          }
        }
      });
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 Report generated: ${chalk.cyan(outputFile)}`);
    console.log(`\n💡 Tip: Use ${chalk.cyan('--verbose')} flag to see detailed file locations\n`);
    
  } catch (error) {
    console.error('\n' + chalk.red('❌ Error:'), error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the CLI
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
