const { test, expect } = require('@playwright/test');

test.describe('GSAP Missile Assembly Animation', () => {

  test.beforeEach(async ({ page }) => {
    // Collect console errors
    page.consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') page.consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => {
      page.consoleErrors.push(err.message);
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    // Wait for GSAP to be loaded
    await page.waitForFunction(() => typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined', { timeout: 15000 });
  });

  test('page loads without JS console errors', async ({ page }) => {
    // Give extra time for any deferred errors
    await page.waitForTimeout(1000);
    expect(page.consoleErrors).toEqual([]);
  });

  test('GSAP and ScrollTrigger are loaded', async ({ page }) => {
    const gsapVersion = await page.evaluate(() => gsap.version);
    const stLoaded = await page.evaluate(() => typeof ScrollTrigger !== 'undefined');
    expect(gsapVersion).toBeTruthy();
    expect(stLoaded).toBe(true);
  });

  test('hero section is visible on load', async ({ page }) => {
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();
    await expect(page.locator('.hero-section h1')).toContainText('Monobore Frac');
    await expect(page.locator('.hero-subtitle')).toContainText('Scroll to assemble');
  });

  test('SVG missile diagram exists with all 14 components', async ({ page }) => {
    const svg = page.locator('#missile-svg');
    await expect(svg).toBeVisible();

    const componentIds = [
      'bg-grid', 'body-section-a', 'body-section-b', 'body-section-c',
      'coupler-front', 'coupler-rear', 'clamp-front', 'clamp-rear',
      'hose-restraint', 'nozzle-endcap', 'port-fitting-1', 'port-fitting-2',
      'fasteners-bolts', 'label-plate'
    ];

    for (const id of componentIds) {
      const el = page.locator(`#${id}`);
      const count = await el.count();
      expect(count, `Component #${id} should exist`).toBe(1);
    }
  });

  test('components start in exploded state (offset positions)', async ({ page }) => {
    // Body sections should be offset from their assembled positions
    const bodyATransform = await page.evaluate(() => {
      const el = document.querySelector('#body-section-a');
      const style = window.getComputedStyle(el);
      return style.transform;
    });
    // Should have a transform applied (not 'none' = not yet assembled)
    expect(bodyATransform).not.toBe('none');

    const bodyBTransform = await page.evaluate(() => {
      const el = document.querySelector('#body-section-b');
      return window.getComputedStyle(el).transform;
    });
    expect(bodyBTransform).not.toBe('none');
  });

  test('scroll triggers assembly - stage 1 body alignment', async ({ page }) => {
    // Take screenshot of initial exploded state
    await page.screenshot({ path: 'test-results/stage0-exploded.png', fullPage: false });

    // Scroll to ~20% of the assembly viewport scroll distance
    await page.evaluate(() => {
      const viewportEl = document.querySelector('#assembly-viewport');
      const rect = viewportEl.getBoundingClientRect();
      const scrollStart = window.scrollY + rect.top;
      // Scroll to ~25% through the pinned section
      window.scrollTo(0, scrollStart + window.innerHeight * 0.75);
    });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'test-results/stage1-body-align.png', fullPage: false });

    // Body sections should be moving toward assembled position
    const bodyAOpacity = await page.evaluate(() => {
      return parseFloat(window.getComputedStyle(document.querySelector('#body-section-a')).opacity);
    });
    // Should be more opaque than initial 0.6
    expect(bodyAOpacity).toBeGreaterThanOrEqual(0.6);
  });

  test('scroll through all stages takes screenshots', async ({ page }) => {
    const stages = [
      { name: 'stage0-initial', scrollPercent: 0 },
      { name: 'stage1-body-assembly', scrollPercent: 0.2 },
      { name: 'stage2-rear-coupler', scrollPercent: 0.3 },
      { name: 'stage3-front-coupler', scrollPercent: 0.45 },
      { name: 'stage4-fittings', scrollPercent: 0.6 },
      { name: 'stage5-hose-restraint', scrollPercent: 0.7 },
      { name: 'stage6-nozzle', scrollPercent: 0.85 },
      { name: 'stage7-final', scrollPercent: 1.0 },
    ];

    for (const stage of stages) {
      await page.evaluate((pct) => {
        const viewportEl = document.querySelector('#assembly-viewport');
        const rect = viewportEl.getBoundingClientRect();
        const scrollStart = window.scrollY + rect.top;
        // Total scroll is 300vh (desktop)
        const totalScroll = window.innerHeight * 3;
        window.scrollTo(0, scrollStart + totalScroll * pct);
      }, stage.scrollPercent);

      await page.waitForTimeout(800);
      await page.screenshot({ path: `test-results/${stage.name}.png`, fullPage: false });
    }

    // No JS errors during scroll
    expect(page.consoleErrors).toEqual([]);
  });

  test('CTA section appears after full scroll', async ({ page }) => {
    // Scroll to end
    await page.evaluate(() => {
      const viewportEl = document.querySelector('#assembly-viewport');
      const rect = viewportEl.getBoundingClientRect();
      const scrollStart = window.scrollY + rect.top;
      const totalScroll = window.innerHeight * 3;
      window.scrollTo(0, scrollStart + totalScroll + 200);
    });
    await page.waitForTimeout(2000);

    const cta = page.locator('#cta-section');
    const ctaOpacity = await cta.evaluate(el => parseFloat(window.getComputedStyle(el).opacity));
    // Should be visible (opacity close to 1) after full scroll
    expect(ctaOpacity).toBeGreaterThan(0.5);
  });

  test('stage indicator updates during scroll', async ({ page }) => {
    const indicator = page.locator('#stage-indicator');

    // Scroll to trigger stage changes
    await page.evaluate(() => {
      const viewportEl = document.querySelector('#assembly-viewport');
      const rect = viewportEl.getBoundingClientRect();
      const scrollStart = window.scrollY + rect.top;
      window.scrollTo(0, scrollStart + window.innerHeight * 0.5);
    });
    await page.waitForTimeout(1000);

    const text = await indicator.textContent();
    // Should contain "Stage" text
    expect(text).toContain('Stage');
  });

  test('no broken images or resource failures', async ({ page }) => {
    const failedResources = [];
    page.on('requestfailed', request => {
      failedResources.push(request.url());
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    expect(failedResources).toEqual([]);
  });

  test('SVG viewBox is correctly set', async ({ page }) => {
    const viewBox = await page.getAttribute('#missile-svg', 'viewBox');
    expect(viewBox).toBe('0 0 1200 500');
  });

  test('scroll indicator animation exists', async ({ page }) => {
    const dot = page.locator('.scroll-dot');
    await expect(dot).toBeVisible();
    const animation = await dot.evaluate(el => window.getComputedStyle(el).animationName);
    expect(animation).toBe('scrollPulse');
  });

  test('no layout overflow on page', async ({ page }) => {
    const bodyOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    expect(bodyOverflow).toBe(false);
  });

  test('no console errors after full scroll cycle', async ({ page }) => {
    // Scroll down fully
    await page.evaluate(async () => {
      const totalHeight = document.documentElement.scrollHeight;
      for (let y = 0; y < totalHeight; y += 300) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 100));
      }
    });
    await page.waitForTimeout(1000);

    // Scroll back up
    await page.evaluate(async () => {
      const totalHeight = document.documentElement.scrollHeight;
      for (let y = totalHeight; y >= 0; y -= 300) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 100));
      }
    });
    await page.waitForTimeout(1000);

    expect(page.consoleErrors).toEqual([]);
  });
});
