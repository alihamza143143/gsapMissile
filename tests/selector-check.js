const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8765/index.html', { waitUntil: 'domcontentloaded' });
  const counts = await page.evaluate(() => {
    const sels = [
      '#bg-grid', '#nozzle-endcap polygon', '#nozzle-endcap',
      '#missile-svg g[id]', '.bolt-front', '.bolt-rear',
      '.hose-node', '.glow-dot', '.hud-callout',
      '#energy-scanline', '#skid-frame circle[fill="#39FF14"]',
      '#hose-1', '#hose-2', '#hose-3', '#hose-4',
      '#hose-connections', '#glow-points',
      '#holo-wireframe', '#dimension-lines', '#data-readouts',
      '#cta-section', '#label-text-mask', '#progress-fill',
      '.advantage-item', '.advantage-negative', '.advantage-positive',
      '.vs-badge', '#assembly-viewport', '#hero',
    ];
    return sels.map(s => ({ s, n: document.querySelectorAll(s).length }));
  });
  counts.forEach(({ s, n }) => console.log((n === 0 ? 'EMPTY ' : 'OK    ') + String(n).padStart(3) + '  ' + s));
  await browser.close();
})();
