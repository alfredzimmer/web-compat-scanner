import WebCompatibilityScanner from './src/scanner.js';

(async () => {
    const scanner = new WebCompatibilityScanner({ targetDir: process.cwd() });
    await scanner.initialize();
    try {
        const report = await scanner.scanUrl('https://devpost.com/');
        console.log(JSON.stringify(report, null, 2));
    } catch (e) {
        console.error('Scan failed:', e.message);
        process.exit(1);
    }
})();
