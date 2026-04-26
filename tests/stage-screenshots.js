// Captures one screenshot per stage of the missile assembly so we can
// verify each callout actually points at its part.
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const url = process.argv[2] || 'http://localhost:8765/index.html';
const tag = process.argv[3] || 'stage';
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
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE.ERROR: ' + msg.text());
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);

  // Compute total scroll: hero (1vh) + assembly pin extent (TOTAL_SCROLL=1200vh) + cta(1vh)
  // Assembly pin starts at viewport 1, ends at +1200vh. Stages at proportions of progress.
  // Stage 0 ~5%, S1 5-15%, S2 15-22%, S3 22-30%, S4 30-38%, S5 38-80%, S6 80-95%, S7 95-100%.
  // To park exactly at a stage, scroll to (1 + progress * 12) viewport heights.
  const stages = [
    { id: 's1', label: 'Stage 1 (Pipe)',     prog: 0.10 },
    { id: 's2', label: 'Stage 2 (Ports)',    prog: 0.18 },
    { id: 's3', label: 'Stage 3 (Flanges)',  prog: 0.26 },
    { id: 's4', label: 'Stage 4 (Skid)',     prog: 0.34 },
    { id: 's5', label: 'Stage 5 (Hoses)',    prog: 0.55 },
    { id: 's6', label: 'Stage 6 (Locked)',   prog: 0.87 },
    { id: 's7', label: 'Stage 7 (Hero/Label)',prog: 0.97 },
  ];

  for (const s of stages) {
    await page.evaluate((p) => {
      // assembly pin: start at top top, end +1200vh => total scroll height needed
      const vh = window.innerHeight;
      const heroHeight = document.querySelector('#hero').offsetHeight;
      const target = heroHeight + p * vh * 12;
      window.scrollTo({ top: target, behavior: 'instant' });
    }, s.prog);
    await page.waitForTimeout(700);
    const file = path.join(outDir, `${tag}-${s.id}.png`);
    await page.screenshot({ path: file });
    console.log('captured', s.label, '->', file);
  }

  console.log('\nERRORS (' + errors.length + '):');
  errors.forEach(e => console.log('  ' + e));

  await browser.close();
})().catch(e => { console.error('FAILED:', e); process.exit(1); });
