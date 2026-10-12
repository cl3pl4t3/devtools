---
name: remotion-motion
description: Build and render professional motion graphics of ANY style in a Remotion (React→video) project — kinetic typography, logo stings & brand bumpers, data-driven reels, app-UI / product demos, cinematic product ads, explainers, social & notification reels, carousels, and lower-thirds. Covers the production workflow, the full animation toolkit (easing, reveals, a cinematic camera, device chrome, deterministic particles), the AI image pipeline (gpt-image generate / edit / chroma-key cut-outs), real-data visuals (charts, maps), embedding video & audio, render commands, formats, and the gotchas that break Remotion renders. Use whenever creating, editing, or rendering any video / reel / post / ad.
---

# Remotion Motion — build any motion graphic in code

Remotion turns **React components into video**: every frame is your component rendered at `frame = N`, so animation is just *“what does this look like at frame N?”* Output is deterministic, version-controlled, diff-able, and re-renders in seconds.

Run everything from the project root. Remotion bundles its own **ffmpeg + Chromium** — system ffmpeg is **not** required.

```bash
npm run dev                                   # Remotion Studio (live preview, http://localhost:3000)
npx remotion still  <Id> out/x.png --frame=N  # QA one frame cheaply BEFORE a full render
npx remotion render <Id> out/x.mp4            # render to MP4
npx remotion render <Id> out/x.mp4 --props=plan.json   # pass input props
```

---

## The process: idea → style → build → render

Lock each step before the next. **Never jump straight to building.**

1. **Idea** — concept, audience, single core message, format & length. One idea per scene.
2. **Style** — palette + reference + mood; apply the **`motion-design`** skill (color, type, elevation, depth). Confirm the look before scaffolding.
3. **Build** — write a composition in `src/compositions/`, register it in `src/Root.tsx`, compose from the toolkit in `src/lib/primitives.tsx`.
4. **Render** — `still` a few key frames to QA, then `render`. Layer music / extra polish in an editor if desired.

For anything matching a reference, analyze the reference first and describe the plan; build original motion *inspired by* it (matching a bespoke After-Effects piece 1:1 from a screen-recording is not feasible).

---

## Styles you can build (and how to approach each)

- **Kinetic typography** — big type, generous negative space, mask-up reveals, perfect easing. One word/line at a time, crossfading. See `KineticIntro`.
- **Logo sting / brand bumper** — 3–8s: build → reveal → settle → light-sweep + glow lockup. Reusable opener.
- **Data-driven reel / post** — hook → stat/chart/timeline/bullets → outro. Count-ups, bar grows, kinetic numbers. Drive copy from a JSON `plan` via input props. See `DataReel`.
- **App-UI / product demo** — a device (status bar, header, cards, segmented controls) that boots, scrolls, gets tapped, confirms. Realistic chrome + layered depth sell it. See `AppShowcase`.
- **Cinematic product ad** — dramatic light, HUD/gauges, kinetic type, letterbox bars, camera moves; AI/real product imagery animated with light sweeps + parallax.
- **Explainer** — sequential reveals of steps/diagrams; arrows, highlights, callouts; calm pacing.
- **Social / notification reel** — lock-screen or feed mockups, notifications rapid-fire (social proof) → CTA. Snappy springs.
- **Carousel / framed post** — multi-slide showcase: a framed device card per slide, small kicker + title, progress dots.
- **Transitions & lower-thirds** — reusable wipes, iris/point-origin reveals, name bars.

---

## The motion toolkit — `src/lib/primitives.tsx`

Compose from these; don't re-invent timing each time.

| Export | Use |
|---|---|
| `APPLE` / `SMOOTH` | the two easings: `APPLE` (easeOutExpo) for reveals/settles, `SMOOTH` for camera/scene zooms. Never animate linearly. |
| `Reveal` | Apple-style **blur-in** (starts slightly large + blurred → settles sharp). The default text/element entrance. |
| `MaskUp` | kinetic type — a line **rises from a clipped box** (overflow-hidden + translateY%). |
| `useCount` | decelerating **count-up** for stats. |
| `Scene` | **cinematic camera wrapper** — enters from a push, holds with a slow drift, then **zooms THROUGH** (scale + blur) into the next scene. Gives one continuous camera move instead of slideshow cuts. Big `exitTo` = a match-cut zoom *into* a screen. |
| `StatusBar` / `HomeBar` | realistic iOS chrome (9:41 · signal · wifi · battery). The #1 “this is a real app” tell. |
| `mulberry32` | seeded PRNG for **deterministic** particles/confetti/stars (see gotchas). |

### Animation fundamentals

- **`useCurrentFrame()`** is the clock. Everything derives from it.
- **`interpolate(frame, [inFrames], [outValues], {easing, extrapolateLeft/Right:'clamp'})`** for precise, timed motion (always clamp).
- **`spring({frame, fps, config:{damping, mass, stiffness}})`** for organic pops/bounces (low damping → snappy overshoot).
- **Stagger** lists by offsetting each item’s `at` by `i * gap`.
- **Scenes**: gate visibility by frame windows and crossfade opacity, or wrap in `Scene` for camera transitions.
- **Crossfade overlap** windows by ~15–25 frames so cuts breathe.

### Signature cinematic patterns (what makes it look pro)

- **Blur-in reveals** — `Reveal`: scale 1.04→1 + blur 12→0 + small rise, `APPLE` easing.
- **Continuous camera** — wrap scenes in `Scene`; the outgoing one scales up + blurs as the next emerges → feels like a single dolly, not a slideshow.
- **Match-cut zoom into a screen** — give a scene a large `exitTo` (e.g. 2.6) with `origin` at the screen center; the next scene enters from `enterFrom: 0.7` → camera pushes *into* the UI.
- **Parallax depth** — background pushes slower than foreground (different scale ramps).
- **Realistic device chrome** — `StatusBar` + header + segmented controls + `HomeBar`.
- **Count-ups** ease out; **numbers/labels** get strong size contrast.
- **Light sweep** — a moving `linear-gradient` band over a hero/logo (`mixBlendMode:'overlay'`).
- **Layered shadows + glow** — see `motion-design`.
- **Deterministic particles** — seed `mulberry32` ONCE at module scope; never `Math.random()` in render.

---

## Asset pipeline (optional, for imagery)

```
real photo / idea
  → gpt-image (generate, or restyle a real photo on a flat chroma-green background)
  → chroma-key to a transparent cut-out (removebg.mjs)
  → animate it in a composition (parallax, light sweep, spring-in)
  → render
```

- **Image engine** — `node src/generate/generate.mjs --prompt "…" --size 1024x1536 --quality high --yes`
  - `--edit <photo> --prompt "restyle… on solid flat chroma-green background"` keeps a real product and changes its look.
  - Cost-gated (prints estimate, waits for `y`; `--yes` to skip). Results prompt-cached in `public/generated/manifest.json` (re-runs free).
  - Needs `OPENAI_API_KEY` in `.env`. Sizes: `1024x1024`, `1024x1536`, `1536x1024`. Quality `low|medium|high`.
- **Transparency** — image models output no alpha. Generate the subject on a **solid flat chroma-green** background, then `node src/generate/removebg.mjs --in a.png --out a-cut.png --threshold 120 --feather 55` (samples corner color, keys + feathers + despills).
- **Graceful fallback** — wire image components to render a placeholder/vector when the file is missing, so renders never break before generation.

### Real-data visuals

- **Charts** — derive SVG `path`/`rect` from a data array; draw-on with `stroke-dasharray`/`stroke-dashoffset`; grow bars with `interpolate`.
- **Maps** — fetch a small country-borders GeoJSON, project (equirectangular, ×cos(midLat) for lon) into an SVG, draw routes as quadratic-bezier arcs with a plane travelling along (`qbez(t)`). No API key needed.

### Embedding video & audio

- **External video** must live in `public/`; play with `<OffthreadVideo src={staticFile('clip.mp4')} style={{objectFit:'cover'}} />` (better for rendering than `<Video>`).
- **Sound** — `node src/generate/sfx.mjs` synthesizes UI ticks / swooshes / risers / chimes / pads from scratch (no library). Place intentionally: a soft tick on taps, a sub-whoomph on a big zoom, a swoosh per transition, a chime/success on payoffs, a low pad bed throughout. Or add music in an editor afterward.

---

## Formats & frame rate

| Use | Size |
|---|---|
| Reel / Story (9:16) | 1080×1920 |
| Feed post (4:5) | 1080×1350 |
| Square (1:1) | 1080×1080 |
| YouTube / landscape (16:9) | 1920×1080 |

**30fps** is the default; use **60fps** for fast / high-energy motion (doubles render time). 1s = `fps` frames.

---

## Gotchas (learned the hard way)

- **Remotion’s bundled ffmpeg wrapper splits on `:`** — `-c:a copy`, `-frames:v`, `scale=W:H`/`tile` filters and `%03d` sequence outputs all FAIL. Use single-frame `-ss T -i in -vframes 1 -update 1 out.png`; extract audio as WAV via `-vn -acodec pcm_s16le`.
- **`Math.random()` / `Date.now()` / `new Date()` in render → flicker** (re-run every frame). Precompute with a seeded PRNG (`mulberry32`) at module scope.
- **Flag emojis (🇩🇿) render as letters** in Chromium — avoid; other emojis are fine.
- **AI image edits re-draw and mangle small text** — fine for fast motion, not for legible labels; overlay real text in code.
- **`<Img>` throws on a 404** and fails the whole render — guarantee assets exist or use a fallback component.
- **`<OffthreadVideo>` source must be in `public/`** (referenced via `staticFile`), not an absolute path.
- **A composition’s `durationInFrames` should match its content** (and an embedded clip’s length × fps), or it cuts / freezes.

---

## Quality bar before shipping

1. Eased (not linear) motion everywhere. 2. One clear focal element per moment. 3. Layered shadows + depth (see `motion-design`). 4. Generous negative space, consistent 8pt spacing & radii. 5. Smooth scene transitions (no hard slideshow cuts unless intentional). 6. Sound that punctuates the key beats. 7. QA’d with `still` at the hero frames, then full render.
