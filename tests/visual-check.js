// Standalone visual check — takes screenshots and reports console errors.
// Usage: node tests/visual-check.js [url]   (default: http://localhost:8765/index.html)

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const url = process.argv[2] || 'http://localhost:8765/index.html';
const tag = process.argv[3] || 'after';
const outDir = path.join(__dirname, '..', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  const errors = [];
  const warnings = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE.ERROR: ' + msg.text());
    if (msg.type() === 'warning') warnings.push('WARN: ' + msg.text());
  });

  console.log('Loading', url);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);

  // Hero
  await page.screenshot({ path: path.join(outDir, `${tag}-1-hero.png`) });

  // Mid-animation
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'instant' }));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, `${tag}-2-assembly-mid.png`) });

  // Past assembly — into CTA
  await page.evaluate(() => {
    const total = document.documentElement.scrollHeight;
    window.scrollTo({ top: total * 0.6, behavior: 'instant' });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, `${tag}-3-cta.png`) });

  // Specs section
  await page.evaluate(() => {
    const el = document.querySelector('#specs-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(1500);
  const specsRect = await page.evaluate(() => {
    const grid = document.querySelector('.specs-grid');
    if (!grid) return null;
    const cards = grid.querySelectorAll('.spec-card');
    return {
      gridRect: grid.getBoundingClientRect(),
      cards: Array.from(cards).map((c, i) => {
        const r = c.getBoundingClientRect();
        const cs = window.getComputedStyle(c);
        return {
          i, x: r.x, y: r.y, w: r.width, h: r.height,
          opacity: cs.opacity, display: cs.display, visibility: cs.visibility,
          transform: cs.transform,
        };
      }),
      gridStyle: {
        display: window.getComputedStyle(grid).display,
        cols: window.getComputedStyle(grid).gridTemplateColumns,
      },
    };
  });
  console.log('SPECS GRID DIAGNOSTIC:');
  console.log(JSON.stringify(specsRect, null, 2));
  await page.screenshot({ path: path.join(outDir, `${tag}-4-specs.png`), fullPage: false });

  // Advantages section
  await page.evaluate(() => {
    const el = document.querySelector('#advantages-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, `${tag}-5-advantages.png`) });

  // Footer
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, `${tag}-6-footer.png`) });

  console.log('\nERRORS (' + errors.length + '):');
  errors.forEach(e => console.log('  ' + e));
  console.log('WARNINGS (' + warnings.length + '):');
  warnings.slice(0, 8).forEach(w => console.log('  ' + w));

  await browser.close();
  console.log('\nScreenshots saved to:', outDir);
})().catch(e => { console.error('FAILED:', e); process.exit(1); });
