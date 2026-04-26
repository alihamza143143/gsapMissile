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

  // Compute total scroll: hero (1vh) + assembly pin extent (TOTAL_SCROLL=2880vh) + cta(1vh)
  // Timeline 240 units across 2880vh: 1 unit = 12vh.
  // Stage labels:  exploded 0, S1 8, S2 43, S3 78, S4 113, S5 148, S6 190, S7 225, end 240
  // Park progress = (label + content_offset) / 240
  // Pick a moment in each stage where the callout is fully visible.
  // Park the timeline at points where each stage's callout is fully visible.
  // Layout: exploded 0, S1 8, S2 43, S3 78, S4 113, S5 148, S6 190, S7 225.
  // Each stage's callout has a fadein and a long readable hold; we aim mid-hold.
  const stages = [
    { id: 's1', label: 'Stage 1 (Pipe)',       tlPos:   8 + 20 }, //  28 — stage1 + 20 (hold 8–30)
    { id: 's2', label: 'Stage 2 (Ports)',      tlPos:  43 + 16 }, //  59 — stage2 + 16
    { id: 's3', label: 'Stage 3 (Flanges)',    tlPos:  78 + 16 }, //  94 — stage3 + 16
    { id: 's4', label: 'Stage 4 (Skid)',       tlPos: 113 + 16 }, // 129 — stage4 + 16
    { id: 's5', label: 'Stage 5 (Hoses)',      tlPos: 148 + 22 }, // 170 — stage5 + 22 (hold 8–35)
    { id: 's6', label: 'Stage 6 (Locked)',     tlPos: 190 + 21 }, // 211 — stage6 + 21 (hold 12–30)
    { id: 's7', label: 'Stage 7 (Hero/Label)', tlPos: 225 + 5  }, // 230 — stage7 + 5
  ];

  // Drive the master timeline directly by progress so we don't have to
  // reverse-engineer pin start positions. We pass a target timeline
  // position (in timeline-seconds) and convert to scroll based on the
  // actual timeline.totalDuration() — robust to label-layout changes.
  for (const s of stages) {
    const diag = await page.evaluate((tlPos) => {
      const triggers = (window.ScrollTrigger && window.ScrollTrigger.getAll && window.ScrollTrigger.getAll()) || [];
      const pinTrigger = triggers.find(t => t.pin && t.animation && t.animation.totalDuration);
      if (!pinTrigger) return { error: 'no pin trigger' };
      const startScroll = pinTrigger.start;
      const endScroll = pinTrigger.end;
      const totalDur = pinTrigger.animation.totalDuration();
      const p = Math.min(1, Math.max(0, tlPos / totalDur));
      const target = startScroll + p * (endScroll - startScroll);
      window.scrollTo({ top: target, behavior: 'instant' });
      pinTrigger.scroll(target);
      return { startScroll, endScroll, target, progress: pinTrigger.progress, totalDur, tlPos };
    }, s.tlPos);
    await page.waitForTimeout(900);
    // Get the rendered stage indicator + actual progress
    const observed = await page.evaluate(() => {
      const triggers = window.ScrollTrigger.getAll();
      const pinTrigger = triggers.find(t => t.pin && t.animation);
      const stageEl = document.getElementById('stage-indicator');
      return {
        progress: pinTrigger ? pinTrigger.progress : null,
        stageText: stageEl ? stageEl.textContent : null,
      };
    });
    const file = path.join(outDir, `${tag}-${s.id}.png`);
    await page.screenshot({ path: file });
    console.log('captured', s.label, '-> prog=' + (observed.progress || 0).toFixed(3),
                'stage="' + observed.stageText + '"',
                '(diag start=' + diag.startScroll + ' end=' + diag.endScroll + ' target=' + diag.target + ')');
  }

  console.log('\nERRORS (' + errors.length + '):');
  errors.forEach(e => console.log('  ' + e));

  await browser.close();
})().catch(e => { console.error('FAILED:', e); process.exit(1); });
