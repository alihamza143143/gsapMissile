// For each new SVG callout, force the missile into its assembled state
// and force just that callout visible — so we can verify it physically
// points at the correct part.
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const url = process.argv[2] || 'http://localhost:8765/index.html';
const tag = process.argv[3] || 'callout';
const outDir = path.join(__dirname, '..', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE.ERROR:', msg.text()); });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);

  // Scroll into assembly section, force fully-assembled state via gsap.set
  await page.evaluate(() => {
    const heroH = document.querySelector('#hero').offsetHeight;
    window.scrollTo({ top: heroH + 100, behavior: 'instant' });
  });
  await page.waitForTimeout(400);

  // Force the missile to its fully-assembled state
  await page.evaluate(() => {
    const set = (sel, props) => window.gsap && window.gsap.set(sel, props);
    set('#body-section-a', { x: 0, y: 0, opacity: 1 });
    set('#body-section-b', { x: 0, y: 0, opacity: 1 });
    set('#body-section-c', { x: 0, y: 0, opacity: 1 });
    set('#coupler-front', { x: 0, y: 0, opacity: 1 });
    set('#coupler-rear', { x: 0, y: 0, opacity: 1 });
    set('#clamp-front', { x: 0, y: 0, scaleY: 1, opacity: 1 });
    set('#clamp-rear', { x: 0, y: 0, scaleY: 1, opacity: 1 });
    set('#hose-restraint', { x: 0, y: 0, opacity: 1 });
    set('#nozzle-endcap', { x: 0, y: 0, rotation: 0, opacity: 1 });
    set('#port-fitting-1', { x: 0, y: 0, rotation: 0, opacity: 1 });
    set('#port-fitting-2', { x: 0, y: 0, rotation: 0, opacity: 1 });
    set('.bolt-front', { y: 0, opacity: 1, scale: 1 });
    set('.bolt-rear', { y: 0, opacity: 1, scale: 1 });
    set('#skid-frame', { y: 0, opacity: 1 });
    set('#hose-connections', { opacity: 1 });
    set('.hose-node', { opacity: 1, scale: 1 });
    set('.glow-dot', { opacity: 1, scale: 1 });
    document.querySelectorAll('#hose-connections path').forEach(p => p.setAttribute('stroke-dashoffset', '0'));
  });
  await page.waitForTimeout(300);

  const callouts = ['callout-stage1-svg', 'callout-stage2-svg', 'callout-stage3-svg', 'callout-stage4-svg', 'callout-stage5-svg', 'callout-stage6-svg'];

  for (const id of callouts) {
    await page.evaluate((cid) => {
      // Hide all callouts, show the target one
      document.querySelectorAll('#hud-callouts-svg > g').forEach(g => g.setAttribute('opacity', '0'));
      const el = document.getElementById(cid);
      if (el) {
        el.setAttribute('opacity', '1');
        // Reset transform if any
        el.removeAttribute('transform');
        if (el.style) el.style.transform = '';
      }
      // Also force gsap to clear inline opacity it might have set
      if (window.gsap) window.gsap.set('#' + cid, { opacity: 1, y: 0 });
    }, id);
    await page.waitForTimeout(300);
    const file = path.join(outDir, `${tag}-${id}.png`);
    await page.screenshot({ path: file });
    console.log('captured', id, '->', file);
  }

  // Also capture with all callouts hidden (clean missile)
  await page.evaluate(() => {
    document.querySelectorAll('#hud-callouts-svg > g').forEach(g => g.setAttribute('opacity', '0'));
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, `${tag}-clean.png`) });
  console.log('captured clean missile');

  await browser.close();
})().catch(e => { console.error('FAILED:', e); process.exit(1); });
