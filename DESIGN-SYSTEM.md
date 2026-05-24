# Design System

A strict black-and-white design language for any web application. No primary
color, no semantic palette, no decorative gradients. Hierarchy comes from
typography, weight, spacing, and edge treatment — not from hue.

This document is the source of truth. Copy it into any new repo and follow it.

---

## 1. Philosophy

Five principles, in order of priority. When in doubt, earlier wins.

1. **Black is the canvas, white is the ink.** Pure `#000` background, pure
   `#FFF` text. Everything else is a fractional opacity of white.
2. **Typography is the design.** Heavy uppercase headlines with tight tracking
   carry the personality. Avoid decorative chrome — no gradients, no glows, no
   drop shadows, no rounded chrome.
3. **Sharp edges.** Default `border-radius: 0`. Rectangles, hairlines, thick
   borders. The only rounded element allowed is a user avatar photo.
4. **Monospace for metadata, sans for content.** Captions, labels, status,
   timestamps, IDs → monospace uppercase. Headlines, paragraphs, body → sans.
5. **Whitespace is structural, not decorative.** Generous, asymmetric, scaled
   with `clamp()`. Resist the urge to center-align everything.

---

## 2. Color tokens

```css
/* Single source of truth. No other colors. */
:root {
  --bg:           #000000;   /* canvas */
  --ink:          #FFFFFF;   /* primary text */
  --ink-strong:   rgba(255, 255, 255, 1.00);   /* headlines, active */
  --ink-body:     rgba(255, 255, 255, 0.80);   /* body copy */
  --ink-muted:    rgba(255, 255, 255, 0.55);   /* captions, labels */
  --ink-dim:      rgba(255, 255, 255, 0.40);   /* secondary metadata */
  --ink-faint:    rgba(255, 255, 255, 0.20);   /* dividers, borders */
  --ink-ghost:    rgba(255, 255, 255, 0.10);   /* hairlines */
  --ink-vapor:    rgba(255, 255, 255, 0.05);   /* hover fill */
  --surface:      #0A0A0A;   /* one notch above canvas; for stacked cards */
}
```

**Rules:**

- Never use `#FFF` at less than 5% opacity — it stops being visible.
- Never introduce a hue. Not for errors, not for success, not for branding.
  Semantic meaning is carried by language, weight, and treatment (see §6).
- The single `--surface` token (`#0A0A0A`) is only used when you need a card
  to read as elevated from the canvas. Most surfaces should be pure `#000`
  with a hairline border instead.

### Tailwind equivalents

If using Tailwind v4 with `@theme`:

```css
@theme {
  --color-bg:         #000000;
  --color-ink:        #FFFFFF;
}
```

Then use existing Tailwind opacity utilities: `text-white/80`, `border-white/10`,
`bg-white/5`. That's the whole palette.

---

## 3. Typography

### Font families

Two families, both free, both Google Fonts.

```css
:root {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
}
```

Load both with `font-display: swap`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Only three sans weights ship: **400 (regular)**, **500 (medium)**, **900 (black)**.
Mono ships **400** and **500**. Anything else is forbidden — middle weights blur
the visual hierarchy.

### Type scale

Six roles. Memorize these; don't introduce new ones.

| Role          | Family | Weight | Size                              | Treatment                                                    |
|---------------|--------|--------|-----------------------------------|--------------------------------------------------------------|
| Hero          | sans   | 900    | `clamp(2.75rem, 11vw, 9rem)`      | `uppercase`, `tracking-[-0.04em]`, `leading-[0.85]`          |
| Page title    | sans   | 900    | `text-4xl` to `text-5xl`          | `uppercase`, `tracking-[-0.03em]`, `leading-[0.9]`           |
| Section title | sans   | 700    | `text-lg` to `text-xl`            | `uppercase`, tight tracking                                  |
| Body          | sans   | 400    | `text-base` to `text-lg`          | `leading-snug`, `text-white/80`                              |
| Caption       | mono   | 400    | `text-[10px]` to `text-[11px]`    | `uppercase`, `tracking-[0.35em]`, `text-white/55`, `//` prefix |
| Metadata      | mono   | 400    | `text-[9px]` to `text-[11px]`     | `uppercase`, `tracking-[0.25em]`, `text-white/40`            |

### The `//` caption pattern

This is the visual signature. Every section, every form field, every meta
row gets one. The prefix is literally two slashes.

```html
<!-- before a section -->
<p class="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
  // Overview
</p>

<!-- before a form input -->
<label class="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
  // Email
</label>

<!-- as a footer/edge marker -->
<span class="font-mono text-[10px] text-white/45 uppercase tracking-[0.35em]">
  // Est 2024
</span>
```

The `//` is part of the language — drop it and the page loses its voice.

---

## 4. Spacing & layout

### Responsive padding via `clamp()`

```css
/* outer page padding */
padding-inline: clamp(1rem, 5vw, 4rem);
padding-block:  clamp(1.25rem, 4vh, 4rem);
```

Three breakpoints by feel, not by named device:

- **Cramped** (mobile, <640px): `clamp(min, vw, ...)` favors the floor.
- **Comfortable** (tablet/desktop, 640–1280px): scales with viewport.
- **Roomy** (large desktop, >1280px): hits the ceiling.

Avoid fixed `px` paddings on top-level layouts. Use `clamp()` so the design
breathes with the viewport.

### Grid rhythm

- Default to `grid-cols-1` on mobile.
- Two-column layouts at `lg:grid-cols-2` (1024px+).
- Three-column stat grids at `sm:grid-cols-2 lg:grid-cols-3`.
- Max content width: `max-w-7xl` (1280px). Wider is acceptable for hero
  layouts that want edge-to-edge.

### Section rhythm

A section is: **caption** → **content** → **hairline divider** → next section.

```html
<section class="space-y-10">
  <header>
    <p class="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
      // Section
    </p>
    <h1 class="mt-3 font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl">
      Title.
    </h1>
    <div class="mt-6 h-px bg-white/10" />
  </header>
  <!-- content -->
</section>
```

The `.` at the end of headlines is intentional — it gives titles a noun-like
finality. Use it.

---

## 5. Borders & corners

**Default `border-radius: 0`.** Override Tailwind's default if needed:

```css
@layer base {
  * { border-radius: 0; }
  img.avatar { border-radius: 9999px; }  /* the one exception */
}
```

### Border weights

| Use                              | Weight        | Color           |
|----------------------------------|---------------|-----------------|
| Hairline divider, section edge   | `1px`         | `white/10`      |
| Card border, table border        | `1px`         | `white/10`      |
| Card border (hovered/active)     | `1px`         | `white/30`      |
| Secondary button outline         | `2px`         | `white/20`      |
| Primary button (medium emphasis) | `2px`         | `white`         |
| Primary button (high emphasis)   | `4px` mobile, `8px` desktop | `white` |
| Form input                       | `1px`         | `white/20`      |
| Form input (focused)             | `1px`         | `white`         |
| Form input (error)               | `2px` solid OR `1px` dashed | `white` |

The 4/8px thick-bordered button is the design's primary CTA signature.
Use it sparingly — one per screen max.

---

## 6. Components

### Buttons

Three variants. No more.

**Primary (high emphasis) — used for the single most important action on a screen:**

```html
<button class="border-4 border-white bg-black px-6 py-4 font-medium uppercase tracking-wider text-white transition-colors duration-300 hover:bg-white hover:text-black lg:border-8">
  <span class="text-sm">Sign in</span>
</button>
```

The mobile/desktop border-width swap is deliberate — the thick desktop border
would dominate a mobile viewport.

**Primary (medium emphasis) — inverted, used for actions in dense lists/tables:**

```html
<button class="border-2 border-white bg-white px-4 py-2 font-medium uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white">
  <span class="text-xs">Pay now</span>
</button>
```

**Secondary — outlined, used for "back", "cancel", less-emphatic actions:**

```html
<button class="border-2 border-white/20 bg-transparent px-4 py-2 font-medium uppercase tracking-wider text-white/70 transition-colors hover:border-white hover:text-white">
  <span class="text-xs">Cancel</span>
</button>
```

**Hover behavior:** primary buttons *invert* (`bg → text`, `text → bg`). It's
fast (300ms) and unambiguous — no ambiguity about which is the action.

**Don't:** add icons inside the button text. If you need an icon, put it
*before* the button, not inside it. Buttons are uppercase mono letters only.

### Inputs

```html
<div>
  <label class="mb-2 block font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]" for="field">
    // Field
  </label>
  <input
    id="field"
    class="block w-full border border-white/20 bg-transparent px-4 py-3 text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none"
    placeholder="value"
  />
</div>
```

**No background fill** on inputs — they sit on the canvas. The border is
the only chrome. On focus, the border goes to solid white. No glow, no shadow,
no ring.

**Error state:**

```html
<input class="block w-full border-2 border-white bg-transparent ..." />
<p class="mt-2 font-mono text-[10px] text-white uppercase tracking-[0.2em]">
  // Error: enter a valid email
</p>
```

The thicker border + `// ERROR:` prefix is how error is signaled. No red.

### Cards

```html
<div class="border border-white/10 bg-[var(--surface)] p-6 transition-colors hover:border-white/30 hover:bg-neutral-900">
  <!-- content -->
</div>
```

Tailwind shortcut: `bg-neutral-950` is close to `--surface` and avoids
needing CSS variables.

**Interactive cards** add the `group` and `hover:` classes. **Static cards**
omit them.

### Status badges

Rectangular, mono, uppercase. Three visual weights — no color.

```html
<!-- Active / current -->
<span class="inline-flex border border-white px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white">
  Active
</span>

<!-- Neutral / pending -->
<span class="inline-flex border border-white/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/80">
  Pending
</span>

<!-- Muted / completed / inactive -->
<span class="inline-flex border border-white/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/50">
  Done
</span>
```

**Dashed border** for cancelled/destructive states:

```html
<span class="inline-flex border border-white/40 border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/60">
  Cancelled
</span>
```

The user reads the **label** to learn the state. The border weight provides
secondary visual emphasis.

### Tables

```html
<div class="border border-white/10 bg-neutral-950">
  <table class="w-full">
    <thead class="border-b border-white/10">
      <tr>
        <th class="px-6 py-4 text-left font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
          // Column
        </th>
        <!-- more columns -->
      </tr>
    </thead>
    <tbody class="divide-y divide-white/10">
      <tr class="transition-colors hover:bg-white/[0.03]">
        <td class="px-6 py-4 text-sm text-white/80">Value</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Mobile tables don't work.** Below `md:`, switch to a stacked card layout:

```html
<div class="hidden md:block">
  <table>...</table>
</div>
<div class="space-y-3 md:hidden">
  <!-- one card per row -->
</div>
```

### Navigation

Active state is conveyed by **weight + glyph prefix**, not color.

```html
<nav class="flex items-center gap-1">
  <a class="px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white">
    <span class="mr-2">▸</span>Active
  </a>
  <a class="px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/50 hover:text-white">
    Inactive
  </a>
</nav>
```

Active nav items get:
- Solid `text-white` (vs `text-white/50` for inactive)
- A `▸` chevron prefix (or `●` bullet — pick one and stick with it)
- Optionally a thin `border-b border-white` underline

### Empty states

```html
<div class="flex flex-col items-center justify-center border border-white/10 bg-white/[0.02] py-20">
  <Icon class="h-10 w-10 text-white/20" />
  <p class="mt-6 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">
    // Nothing here yet
  </p>
  <p class="mt-2 text-sm text-white/40">
    Helper sentence in body sans.
  </p>
</div>
```

Use lucide-react icons exclusively. No emoji, no custom illustrations.

### Loading skeletons

```html
<div class="space-y-3">
  <div class="h-24 animate-pulse border border-white/10 bg-white/5"></div>
  <div class="h-24 animate-pulse border border-white/10 bg-white/5"></div>
  <div class="h-24 animate-pulse border border-white/10 bg-white/5"></div>
</div>
```

Match the loaded card's height. Never use a generic spinner where a content-
shaped skeleton works.

### Spinners (only when content shape is unknown)

```html
<div class="h-6 w-6 animate-spin border-2 border-white/20 border-t-white"></div>
```

Square outline. The rotation makes it read as motion without resorting to
circles.

---

## 7. Visual signatures

These are the elements that make a page recognizably "this design system".
Omit any of them and the page reads as generic dark UI.

### Noise grain overlay

A canvas-rendered procedural noise covers any panel that wants the "shot on
film" feel. Component below (React + canvas):

```tsx
// noise.tsx
import { useEffect, useRef } from "react";

interface NoiseProps {
  patternRefreshInterval?: number; // frames between regenerations; higher = slower
  patternAlpha?: number;           // 0–255, opacity of the grain
}

export function Noise({
  patternRefreshInterval = 2,
  patternAlpha = 20,
}: NoiseProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const size = 1024;
    let frame = 0;
    let raf: number;

    const resize = () => {
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };

    const draw = () => {
      const img = ctx.createImageData(size, size);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = patternAlpha;
      }
      ctx.putImageData(img, 0, 0);
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) draw();
      frame++;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    resize();
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [patternRefreshInterval, patternAlpha]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 z-50 h-full w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
```

Drop `<Noise />` inside any `relative` parent. Default `patternAlpha={20}` is
gentle; `patternAlpha={25}` is unmistakable. Above 30 is too much.

**Where to use:** hero sections, auth pages, full-bleed marketing panels,
error pages. **Where not to use:** dense data tables, forms with lots of
inputs (the grain competes with content).

### Sharp 90° corners

Already covered in §5. No `rounded-*` anywhere except `<img class="rounded-full">`
for avatar photos.

### Inverting hover on CTAs

The hover of a primary CTA swaps fg/bg. Covered in §6. This is the single
strongest interactive signal in the system, so use it only on primary
actions — never on links, cards, or secondary controls.

### Mono `//` captions everywhere

If a UI region needs a label, a marker, a heading-above-a-heading, or a
contextual note → it's a mono `//` caption. This is so frequent it becomes
the visual rhythm of the page.

---

## 8. Motion

Restrained, fast, purposeful.

| Action                        | Duration | Easing                  |
|-------------------------------|----------|-------------------------|
| Color/background transition   | 300ms    | `ease-out`              |
| Hover state changes           | 200ms    | `ease-out`              |
| Modal/drawer open             | 250ms    | `cubic-bezier(.25,.25,.25,.75)` |
| Loading skeleton pulse        | default Tailwind `animate-pulse` |
| Spinner rotation              | default Tailwind `animate-spin`  |

**No bounce easings.** No spring physics on UI chrome. Reserve motion for
state changes; never decorate.

**Respect `prefers-reduced-motion`:**

```tsx
const reduced = useReducedMotion();
const variants = {
  hidden: { opacity: 0, y: reduced ? 0 : 20 },
  visible: { opacity: 1, y: 0 },
};
```

---

## 9. Accessibility

The aesthetic is severe; the accessibility has to compensate.

- **Contrast.** Black bg + `text-white` (`#FFF`) is `21:1` — passes WCAG AAA
  for all text sizes. `text-white/55` is the floor for caption-sized text;
  drop below that only for purely decorative metadata.
- **Focus rings.** Don't suppress them. Add a white outline if Tailwind's
  default ring is invisible against the dark canvas:

  ```css
  :focus-visible { outline: 2px solid #FFF; outline-offset: 2px; }
  ```

- **Hit targets.** Minimum `40px × 40px` for any tappable control. Mobile
  primary CTAs should be `py-4` minimum.
- **State by language, not just style.** Since color isn't carrying semantic
  meaning, the label text itself must. `// ERROR:` prefix, `// Cancelled`
  badge, etc. Screen readers benefit from this naturally.
- **Semantic HTML.** `<nav>`, `<main>`, `<header>`, `<section>`. Don't
  reach for `<div>` first.
- **Heading order.** One `<h1>` per page (the page title). Sections use
  `<h2>`. Don't skip levels for visual weight — adjust with classes instead.

---

## 10. Anti-patterns

Things this system does not do, and what to do instead.

| Don't                                  | Do                                          |
|----------------------------------------|---------------------------------------------|
| Use color to signal state              | Use border weight + label language          |
| Add gradients, glows, or shadows       | Use solid borders and opacity stops         |
| Round card corners (`rounded-xl`)      | `border-radius: 0`                          |
| Stack three font weights mid-sentence  | One weight per text role                    |
| Center-align body paragraphs           | Left-align unless it's a hero statement     |
| Decorate with emoji or illustrations   | Use lucide icons sparingly                  |
| Mix sans and mono in the same word     | Mono is metadata only                       |
| Use lowercase for buttons or captions  | Uppercase, tracked                          |
| Apply `transition-all`                 | Transition only the property you're animating |
| Reach for shadcn defaults              | Build minimal inline-styled components      |
| Add a "light mode"                     | The design is dark-only                     |

---

## 11. Implementation cheat sheet

### Tailwind v4 setup

```css
/* index.css */
@import "tailwindcss";

@theme {
  --color-bg:   #000000;
  --color-ink:  #FFFFFF;
  --font-sans:  "Inter", system-ui, sans-serif;
  --font-mono:  "JetBrains Mono", ui-monospace, monospace;
}

:root {
  color-scheme: dark;
  color: var(--color-ink);
  background: var(--color-bg);
  font-family: var(--font-sans);
}

/* Kill default border-radius globally */
@layer base {
  *, ::before, ::after { border-radius: 0; }
}
```

### Class catalogue (the most-used utilities)

Copy these into a snippets file so you stop retyping them:

```
caption       : font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]
caption-tight : font-mono text-[10px] text-white/45 uppercase tracking-[0.25em]
hero-title    : font-black text-[clamp(2.75rem,11vw,9rem)] uppercase leading-[0.85] tracking-[-0.04em]
page-title    : font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl
section-title : font-bold text-base uppercase tracking-tight sm:text-lg
body          : text-base text-white/80 leading-snug
hairline      : h-px bg-white/10
divider-y     : border-t border-white/10
card          : border border-white/10 bg-neutral-950
card-hover    : border border-white/10 bg-neutral-950 transition-colors hover:border-white/30 hover:bg-neutral-900
input         : block w-full border border-white/20 bg-transparent px-4 py-3 text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none
btn-primary   : border-4 border-white bg-black px-6 py-4 font-medium uppercase tracking-wider text-white transition-colors duration-300 hover:bg-white hover:text-black lg:border-8
btn-inline    : border-2 border-white bg-white px-4 py-2 font-medium uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white
btn-secondary : border-2 border-white/20 bg-transparent px-4 py-2 font-medium uppercase tracking-wider text-white/70 transition-colors hover:border-white hover:text-white
badge-active  : inline-flex border border-white px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white
badge-neutral : inline-flex border border-white/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/80
badge-muted   : inline-flex border border-white/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/50
```

### Page skeleton

```tsx
export function Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-7xl px-[clamp(1rem,4vw,2rem)] py-[clamp(1.5rem,4vh,3rem)]">
        <header className="space-y-3">
          <p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">
            // Section
          </p>
          <h1 className="font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl">
            Page Title.
          </h1>
          <div className="h-px bg-white/10" />
        </header>
        {/* sections */}
      </main>
    </div>
  );
}
```

---

## 12. Migration checklist

Adopting this in an existing dark app:

- [ ] Replace any brand color usage with `text-white` (`/80`, `/55`, `/40`).
- [ ] Strip `rounded-*` from all UI chrome. Audit with `grep -rn rounded src/`.
- [ ] Replace icon emoji and custom SVGs with lucide-react.
- [ ] Convert all section/field labels to mono `// caption` format.
- [ ] Add `<Noise />` to hero/auth/error pages.
- [ ] Replace any `text-blue-*`, `text-green-*`, `text-red-*` etc. with the
      `text-white/N` opacity scale plus a language-based label.
- [ ] Audit form error states — should use thick white border + `// ERROR:`
      caption, not a red border.
- [ ] Audit hover states — primary CTAs invert; everything else changes
      opacity/border, not color.
- [ ] Audit status badges — should be rectangular with mono uppercase text,
      not pill-shaped with colored backgrounds.
- [ ] Audit headings — uppercase, `font-black`, negative tracking.
- [ ] Set `color-scheme: dark` and remove any light-mode CSS.

---

That's the whole system. When in doubt, look at how the existing pages do
it and replicate the pattern verbatim. Consistency across screens is the
asset; deviation is the cost.
