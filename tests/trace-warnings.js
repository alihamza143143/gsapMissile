// Capture stack traces for GSAP "target not found" warnings
const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Inject a hook that wraps console.warn to capture stack at warn-time
  await page.addInitScript(() => {
    const orig = console.warn;
    console.warn = function (...args) {
      const msg = args.join(' ');
      if (msg.indexOf('GSAP target') !== -1) {
        // Print msg + a short stack so we can see the call site
        const stack = new Error().stack.split('\n').slice(1, 6).join('\n');
        orig.call(console, '[TRACE]', msg, '\n' + stack);
      } else {
        orig.apply(console, args);
      }
    };
  });

  page.on('console', msg => {
    if (msg.text().includes('GSAP target') || msg.text().includes('[TRACE]')) {
      console.log('CONSOLE>', msg.text());
    }
  });

  await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Trigger scroll so all stages of the timeline get queried
  await page.evaluate(() => {
    const total = document.documentElement.scrollHeight;
    window.scrollTo({ top: total, behavior: 'instant' });
  });
  await page.waitForTimeout(2000);

  await browser.close();
})();
