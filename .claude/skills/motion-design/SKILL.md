---
name: motion-design
description: A premium visual-design system for motion graphics — how to build a palette, type scale, spacing, elevation, glassmorphism, depth, lighting, iconography, and motion-aware design so any screen, card, scene, or composition reads high-end (Apple / Awwwards / top Behance) instead of flat or templated. Palette-agnostic and style-agnostic — it tells you HOW to make it premium, not which brand to use. Use ALONGSIDE remotion-motion whenever designing or redesigning any on-screen UI, card, text layout, or composition.
---

# Motion Design — the premium-look system

Goal: every frame should look like a polished product-design shot, not a flat wireframe. This is the *taste* layer; pair it with **`remotion-motion`** for the build/timing. Tokens belong in `src/lib/design.ts`.

## 1. Color — build a palette, don’t pick swatches at random
- Always **primary + accent + a neutral scale**. **Never pure black or pure white** — tint neutrals slightly warm or cool.
- Derive a palette from the brand/mood: one primary (hero), one accent (used sparingly for emphasis/CTAs), 5–6 neutrals (bg → surface → hairline → muted → ink), plus semantic (success/warn).
- **Depth comes from gradients, not flat fills**: backgrounds get a soft radial/linear gradient; brand buttons a 2-stop gradient; heroes get faint **colored glow blobs** behind them.
- Dark themes: lift surfaces with subtle lighter gradients + glows. Light themes: tint shadows with the brand hue.

## 2. Type — hierarchy is everything
- **One family, many weights.** Strong size contrast between a title and its meta — never all-one-size.
- Scale (px @1080w): display 96–120 / title 60–76 / heading 44–52 / body 34–40 / label 26–30.
- Headlines: weight 800–900, letter-spacing −2 to −4 (tight). Body: 500. Labels: 600–700, UPPERCASE, letter-spacing +2–4, muted.
- **Pairings by mood:** clean/tech → a grotesk (Inter, Geist, Space Grotesk, Manrope); editorial/premium → a serif display (Fraunces, Newsreader, Playfair) for headlines + a grotesk for UI; playful → rounded (Plus Jakarta Sans). Load via `@remotion/google-fonts`.

## 3. Spacing & radii — 8pt grid
- Pad/gap in multiples of 8 (16, 24, 32, 40…). **Generous negative space beats cramming.**
- Radii: cards 28–40, pills 999, thumbnails 24–28. Keep them consistent across a composition.

## 4. Elevation — layered soft shadows (the #1 premium tell)
- **Never one harsh shadow.** Stack a tight near shadow + a soft far shadow:
  `0 2px 8px rgba(15,18,25,.05), 0 30px 60px rgba(15,18,25,.13)`
- Add a **1px hairline border** (`1px solid rgba(…, .06)`) on light cards for crispness, and an **inner top highlight** (`inset 0 1px 0 rgba(255,255,255,.35)`) on raised/glass surfaces to read as “lit”.

## 5. Glassmorphism — cards over photos/maps/video
- `background: rgba(255,255,255,.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.5)`. Use for price pills, tracking cards, overlays.

## 6. Depth & light
- Subtle inner highlight on buttons; soft **vignette** and **glow blobs** behind heroes.
- Photos / cut-outs get a soft drop-shadow so they sit *in* the scene, not pasted on. Thumbnails get a faint gradient backing, never flat grey.

## 7. Motion-aware design (design for time, not just a still)
- Respect easing/timing from `remotion-motion` — eased entrances, consistent enter/exit directions, **one focal element at a time**.
- Don’t animate everything at once; stagger and let the eye land. Hold key frames long enough to read.
- Keep the layout stable under camera moves — design the composition to survive a push-in/parallax.

## 8. Iconography & micro-detail (reads as “designed”, not templated)
- Add small premium details: status dots, rating pills, badges (“Best”, “New”), dividers, a faint grid, a progress indicator. These tiny signals separate pro from generic.

## Style adaptations — the system flexes
- **Kinetic typography:** huge type, maximal negative space, one or two colors, the type *is* the design.
- **App-UI / product:** realistic chrome (status bar, segmented controls), layered depth, restrained accent on CTAs.
- **Data-viz / explainer:** clear hierarchy, restrained color (one accent for the “hero” number/series), lots of whitespace, labels uppercase + muted.
- **Cinematic / product ad:** dramatic low-key lighting, strong contrast, letterbox bars, a single saturated accent, glow + lens-style sweeps.
- **Playful / social:** bolder color, bouncy springs, rounded type, sticker-like badges — but still layered shadows + consistent spacing.

## “Make it premium” checklist (run before shipping a screen)
1. Gradient (not flat) background? 2. Layered shadow + hairline on cards? 3. Clear type hierarchy (big title vs muted meta)? 4. Consistent radii + 8pt spacing? 5. One accent, used purposefully? 6. Glow / glass / depth somewhere? 7. A small detail (badge/dot/divider) that says “designed”? 8. Generous negative space? 9. Eased, staggered motion with one focal point?

Pairs with **`remotion-motion`** (the build/render mechanics).
