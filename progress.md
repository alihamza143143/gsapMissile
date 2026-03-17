# Monobore Frac Missile System — Build Progress

## Project Overview

Scroll-driven GSAP assembly animation of an SLB Monobore Frac Missile System. A standalone HTML/CSS/JS page with 14 placeholder SVG components and an 8-stage ScrollTrigger animation sequence.

---

## Starting State

The project folder contained only reference material:
- `frac-missile-system.jfif` — General view of the frac missile system
- `quarter-view-missile.jfif` — Quarter/angled view
- `top-view-missile.jfif` — Top-down view
- `monobore-frac-missile-system-ps.pdf` — Product specification sheet

No code, no SVG, no dependencies, no build tools.

---

## Files Created

```
gsapMissile/
  index.html              (15.6 KB)  — HTML + inline SVG with 14 components
  css/styles.css          (5.1 KB)   — Dark industrial theme, responsive
  js/animation.js         (12.4 KB)  — GSAP timeline + ScrollTrigger, 8 stages
```

### Dependencies (CDN, no build tools)
- GSAP 3.12.5
- ScrollTrigger 3.12.5
- Google Fonts: Inter (400, 600, 700)

---

## What Was Built

### HTML Structure (`index.html`)

Three main sections:

1. **Hero Section** (100vh)
   - Eyebrow text: "Precision Engineered"
   - Title: "Monobore Frac Missile System"
   - Subtitle: "Scroll to assemble"
   - Animated scroll indicator (dot bouncing inside a pill shape)

2. **Assembly Viewport** (100vh, pinned during scroll)
   - Inline SVG with `viewBox="0 0 1200 500"` and `preserveAspectRatio="xMidYMid meet"`
   - 14 uniquely-identified component groups (see table below)
   - Stage progress indicator overlay at bottom

3. **CTA Section** (min 100vh)
   - Heading: "Engineered for Performance"
   - Description paragraph
   - Two buttons: "Request a Quote" (primary) and "Download Spec Sheet" (secondary)

### SVG Components (14 parts)

| # | ID | Shape | Details |
|---|---|---|---|
| 1 | `#bg-grid` | Pattern-filled rect | Faint 40px grid, fades during assembly |
| 2 | `#body-section-a` | Rounded rect 280x60 | Left body tube, steel gradient, machining marks |
| 3 | `#body-section-b` | Rect 300x60 | Center body tube, dashed bore line |
| 4 | `#body-section-c` | Rounded rect 280x60 | Right body tube |
| 5 | `#coupler-front` | Rect 44x76 | Front flange, threading notches, center bore circle |
| 6 | `#coupler-rear` | Rect 44x76 | Rear flange, same detail as front |
| 7 | `#clamp-front` | Two thin rects + 4 bolt hole circles | Split clamp with blue accent stroke |
| 8 | `#clamp-rear` | Two thin rects + 4 bolt hole circles | Mirrors front clamp |
| 9 | `#hose-restraint` | U-bracket path + base plate + tether ring | Ring uses blue accent color |
| 10 | `#nozzle-endcap` | Tapered polygon + bore circles + sealing ring | Truncated cone profile |
| 11 | `#port-fitting-1` | T-shaped rects + port opening circle | On body-A, blue accent flange |
| 12 | `#port-fitting-2` | T-shaped rects + port opening circle | On body-C, mirrors fitting 1 |
| 13 | `#fasteners-bolts` | 8 triangle bolt heads in 2 groups | `.bolt-front` (4) and `.bolt-rear` (4) |
| 14 | `#label-plate` | Rect + clipped text group | Clip-mask text reveal animation |

### SVG Defs
- `#steelGradientA` — Body tube gradient (dark to light steel)
- `#steelGradientB` — Slightly different angle variant
- `#darkSteelGradient` — Vertical gradient for couplers
- `#nozzleGradient` — Darker at tip
- `#blueAccentGradient` — #0028FF to #0014DC
- `#gridPattern` — 40x40px faint grid lines
- `#pressureGlow` — feGaussianBlur blue glow filter (Stage 6)
- `#shadowFilter` — feDropShadow for depth
- `#labelTextClip` — clipPath with animatable-width rect for text print-on effect

---

### CSS (`css/styles.css`)

**Theme:**
- Background: `#0d0f14` (near-black)
- Text: `#c0c4cc` (light gray)
- Accent: `#0014DC` (SLB blue)
- Headings: `#e8eaef`
- Muted text: `#6b7080`

**Layout:**
- Hero: centered flex column, gradient background, clamp-based font sizing
- Assembly: centered flex, radial gradient, SVG at 90vw / max 1200px
- CTA: centered flex column, gradient, two-button layout with gap

**Responsive breakpoints:**
- Tablet (<=1024px): SVG at 95vw
- Mobile landscape (<=768px): SVG at 98vw, max 60vh
- Mobile portrait (<=480px): SVG at 100vw, max 45vh
- Small portrait (<=480px + portrait): SVG at 130vw with negative margin for larger display

**Accessibility:**
- `prefers-reduced-motion`: disables all animations and transitions

---

### Animation (`js/animation.js`)

**Architecture:** Single master GSAP timeline bound to one ScrollTrigger instance. All stages are proportional durations within a scrub-linked timeline — scrolling forward plays, scrolling backward reverses.

**ScrollTrigger config:**
- Trigger: `#assembly-viewport`
- Pin: `true`
- Scrub: `0.8` (desktop), `0.5` (mobile)
- Total scroll: `300vh` (desktop), `200vh` (mobile)
- `anticipatePin: 1` for smooth pin start

**Initial exploded state** — `gsap.set()` calls position all parts in spread-out formation:
- Body sections offset diagonally (A: upper-left, B: below, C: upper-right)
- Couplers pushed far left/right
- Clamps spread vertically with scaleY overshoot
- Hose restraint high above
- Nozzle far right and rotated -25deg
- Port fittings above and rotated
- Fasteners hidden, scaled to 0.3
- Label plate below, invisible

### 8 Animation Stages

| Stage | Scroll % | Duration | What Happens |
|-------|----------|----------|--------------|
| **0** | 0–10% | 10 units | Exploded view hold. Grid fades to 0.15 opacity. User sees spread parts. |
| **1** | 10–25% | 15 units | Body B rises from below, A slides from upper-left, C from upper-right. All converge. Elastic snap overshoot on A and C after seating. |
| **2** | 25–35% | 10 units | Rear coupler slides in from right (`power2.inOut`). Rear clamp follows with `back.out(1.4)` lock feel. Rear bolts stagger in. |
| **3** | 35–50% | 15 units | Front coupler slides in from left. Front clamp locks. Front bolts appear. Both couplers get a subtle scaleX pulse to confirm lock. |
| **4** | 50–65% | 15 units | Port fitting 1 drops in with `back.out(2.0)` overshoot. Fitting 2 follows staggered. Each gets a micro rotation wobble (tighten motion) settling with elastic ease. |
| **5** | 65–75% | 10 units | Hose restraint descends in two phases: hover at -15px, then snap to 0. Scale pulse lock effect. Background grid starts fading. |
| **6** | 75–90% | 15 units | Nozzle rotates in from far right over 10 units. Pressure-ready glow filter applied then removed (desktop). Stroke-based highlight on mobile. Grid fully disappears. |
| **7** | 90–100% | 10 units | Label plate rises into position. Text prints on via clip-mask width animation. SVG scales to 1.04x for hero presentation. CTA section fades in. Stage indicator fades out. |

### Additional Features
- **GPU acceleration**: `will-change: transform, opacity` + `force3D: true` on all animated SVG groups, cleaned up on scroll leave
- **Reduced motion**: Full `prefers-reduced-motion` support — shows assembled state immediately, no ScrollTrigger created
- **iOS Safari**: Dynamic `--vh` custom property set via JS to handle address bar collapse
- **Mobile detection**: Reduced scroll distance (200vh), simpler glow effect (stroke instead of filter)
- **Stage indicator**: Real-time text label at bottom showing current stage name and number
- **Dev markers**: Uncommenting line 116 enables GSAP visual markers for debugging

---

## Consistency Verification

All three files were cross-checked:
- All 14 SVG element IDs match their animation.js selectors
- All CSS classes in HTML exist in styles.css
- clipPath chain is correctly wired: `#labelTextClip` → `#label-text-mask` rect → animated via `gsap.to('#label-text-mask', { attr: { width: 160 } })`
- `.bolt-front` and `.bolt-rear` class selectors match between SVG and JS
- No missing closing tags or structural HTML issues

---

## How to Test

1. Open `index.html` in a browser
2. Scroll down — the hero section scrolls away, then the assembly viewport pins
3. Continue scrolling — parts assemble in sequence across 8 stages
4. At the end, the CTA section appears below the completed assembly
5. Scroll back up — the entire animation reverses cleanly

### Debug Mode
Uncomment `markers: true` on line 116 of `js/animation.js` to see ScrollTrigger start/end markers.

### What to Swap Later
Replace the SVG placeholder `<g>` groups with real Illustrator-exported artwork. Keep the same IDs on each group. The animation code targets IDs only — no shape-specific selectors except for the nozzle mobile glow fallback (`#nozzle-endcap polygon`).
