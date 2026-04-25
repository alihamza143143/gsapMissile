---
name: Desktop Tweaks Before Monday Meeting
date: 2026-04-26
status: approved
scope: desktop only (mobile fixes follow if regressions surface)
---

# FLX Missile — Desktop Tweaks Before Monday

Five focused changes to the GSAP scroll-driven assembly page so the client demo on Monday is easier to read, slower to scroll, and visually closer to its callouts. Mobile is intentionally out of scope for this round.

## 1. Slow the scroll

In `js/animation.js`, change `TOTAL_SCROLL` desktop branch from `'400vh'` to `'750vh'`. Mobile stays at `'250vh'`. Scrub smoothing stays at `0.8` desktop / `0.5` mobile. The pin behavior, stages, and easings are unchanged — only the scroll distance grows so each stage is roughly twice as wide in scroll terms.

## 2. Brighter, more readable greys

Update `:root` custom properties in `css/styles.css`:

| Token             | Old        | New        | Notes                                      |
|-------------------|------------|------------|--------------------------------------------|
| `--text-primary`  | `#e8eaef`  | unchanged  | Headings stay brightest                    |
| `--text-secondary`| `#c0c4cc`  | `#909EAE`  | Pewter blue-grey — new default body color  |
| `--text-muted`    | `#6b7080`  | `#909EAE`  | Collapsed to pewter (was too dim on black) |
| `--text-dim`      | `#3a3f4a`  | `#6b7080`  | Promote old muted into dim slot            |

This single token swap propagates to body text, HUD callouts, eyebrows, section labels, footer, and most secondary copy without per-element overrides.

## 3. Comparison container (temporary)

Insert a new section between the assembly viewport (`#assembly-viewport`) and `#cta-section`. Purpose: side-by-side preview so the client can pick between Pewter and Concrete on Monday.

Layout (desktop): two equal-width cards in a flex row, `gap: 2rem`, `max-width: 1100px`. Each card contains:

- A short heading
- A two-paragraph sample of body copy (representative of CTA / spec text)
- A hex value label and color name in mono font

Left card text color: `#909EAE` (Pewter). Right card text color: `#F2F2F2` (Concrete). Both cards on the page's standard dark background.

This section is **temporary**. Once the client picks a color Monday, delete the section and lock in the choice (likely already done since the chosen value is the default body color).

## 4. Bigger desktop text

Bump the **max** end of `clamp()` values in `css/styles.css`. Mobile mins untouched, so phone layout is unaffected. Targeted bumps (~20–25% on desktop):

| Selector              | Old max      | New max     |
|-----------------------|--------------|-------------|
| `.hero-section h1`    | `4.5rem`     | `5.25rem`   |
| `.hero-subtitle`      | `0.9rem`     | `1.05rem`   |
| `.hero-eyebrow`       | `0.8rem`     | `0.95rem`   |
| `.section-title`      | `2.8rem`     | `3.4rem`    |
| `.cta-section h2`     | `3rem`       | `3.5rem`    |
| `.cta-section p`      | `1rem`       | `1.2rem`    |
| `.spec-label`         | `0.75rem`    | `0.9rem`    |
| `.advantage-item`     | `0.9rem`     | `1.05rem`   |
| `.hud-label`          | `0.65rem`    | `0.85rem`   |
| `.hud-detail`         | `0.6rem`     | `0.8rem`    |
| `.stage-indicator`    | `0.65rem`    | `0.8rem`    |
| `.progress-label`     | `0.6rem`     | `0.75rem`   |
| `.footer-tagline`     | `0.72rem`    | `0.85rem`   |
| `.footer-contact-value` | `0.78rem`  | `0.9rem`    |
| `.footer-links a`     | `0.7rem`     | `0.85rem`   |

Where the value is a fixed `rem` (not clamped), bump the value directly. Where it is clamped, raise only the third argument.

## 5. Reposition HUD callouts (Option A — quick)

Currently each callout is pinned to a viewport edge (`left: 3%`, `right: 2%`, `top: 8%`...) which sits well outside the missile SVG, with a generic 40px line that does not visually connect to a part. For Monday: bring them in toward the missile silhouette and lengthen connector lines so they angle toward the named region.

Desktop-only adjustments in `css/styles.css` (mobile rules untouched):

- Increase callout inset percentages so each callout sits at the visual edge of the missile (roughly within the inner 70–80% of the viewport, not the outer 2–5%).
- Lengthen `.hud-line` from `40px` to `~80–110px` and use diagonal angles (CSS `transform: rotate(...)`) where needed to aim the line toward the corresponding SVG region.
- Raise `.hud-callouts` z-index above the SVG (already at `8` — confirm it sits above `#missile-svg` at `5`).

Approximate target positions (will fine-tune visually):

| Callout         | Old position             | New position (approx)         |
|-----------------|--------------------------|-------------------------------|
| `stage1` left   | `left: 3% top: 30%`      | `left: 12% top: 35%`          |
| `stage2` top    | `left: 25% top: 8%`      | `left: 32% top: 18%`          |
| `stage3` right  | `right: 2% top: 28%`     | `right: 14% top: 35%`         |
| `stage4` bottom | `left: 30% bottom: 12%`  | `left: 42% bottom: 22%`       |
| `stage5` top-rt | `right: 5% top: 10%`     | `right: 15% top: 20%`         |
| `stage6` center | `left: 50% top: 50%`     | unchanged (already centered)  |

Option B (true SVG-anchored leader lines that *touch* each part) is deferred — flag as a follow-up after Monday if the quick reposition isn't enough.

## Out of scope (this round)

- Mobile callout repositioning beyond what already exists
- Any changes to the SVG itself or animation sequence
- Switching callouts to SVG-anchored leader lines (deferred Option B)
- Removing the comparison container (happens after the Monday decision)
- Particle, glitch, scanline, or other ambient FX

## Verification

- Open `index.html` in browser
- Scroll through full animation; confirm:
  - Each stage gives enough scroll to read its callout
  - Callouts visually sit near their corresponding part of the missile
  - Body text is noticeably larger and the pewter grey is comfortably readable on black
  - Comparison container renders below the animation with two cards
  - No layout breaks at desktop widths (≥1024px)
- Mobile (<768px) is not regressed at a glance, but full mobile audit happens after Monday
