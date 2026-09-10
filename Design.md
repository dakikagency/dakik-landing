# Dakik Design System

The authoritative design reference for every Dakik surface — the marketing
site (`dakik.co.uk`), the product subdomains (`icons.`, `bits.`, `flow.`), the
customer portal, the admin panel, the survey, and auth.

This document describes what is **actually implemented** in
`dakik-studio-hono`, with real file paths and class strings. If you're starting
a brand-new repo, the portable distillation lives in `DESIGN-SYSTEM.md`; this
file is the project-grounded source of truth.

---

## 1. First principles

1. **Black is the canvas, white is the ink.** Pure `#000` background, pure
   `#FFF` text. Every other tone is white at a fractional opacity. There is **no
   accent color** — no red, no blue, nothing. Hierarchy and state come from
   weight, opacity, edge treatment, and language, never hue.
2. **Typography is the product.** Heavy uppercase headlines with tight negative
   tracking carry all the personality. Chrome stays out of the way: no
   gradients, no shadows, no glows, no rounded corners.
3. **Sharp edges.** `border-radius: 0` everywhere. The only round things are
   the procedural-noise grain and an occasional avatar.
4. **Monospace is metadata.** Captions, labels, status, counts, timestamps,
   IDs → mono, uppercase, letter-spaced, prefixed with `//`. Body and headlines
   → Inter sans.
5. **Whitespace is structure.** Generous, fluid, scaled with `clamp()`. The
   layout breathes with the viewport instead of snapping at breakpoints.
6. **Marketing is light-on-dark AND dark-on-light.** The landing alternates:
   hero/footer are black; the "how we work" and FAQ sections invert to white
   bg / black text. The product apps (portal, subdomains, survey, auth) are
   uniformly black.

---

## 2. Color

The entire palette is white-at-opacity over black. Tailwind's `white/NN`
utilities _are_ the palette — there is no custom color scale to learn.

| Token | Value | Use |
|-------|-------|-----|
| canvas | `#000000` (`bg-black`) | every app background |
| surface | `bg-neutral-950` | cards/panels lifted off the canvas |
| surface-hover | `bg-neutral-900` | hovered interactive card |
| ink | `text-white` | headlines, active state, primary text |
| ink-body | `text-white/80` | body copy |
| ink-muted | `text-white/70` | secondary body, nav-inactive |
| ink-caption | `text-white/55` | `//` captions, labels |
| ink-dim | `text-white/45`–`/40` | metadata, footnotes |
| line | `border-white/10` | hairline dividers, card borders |
| line-strong | `border-white/20`–`/30` | inputs, hovered card borders |
| fill-ghost | `bg-white/5`–`/[0.02]` | hover fills, empty-state surfaces |

### The actual `@theme` (Tailwind v4, `src/frontend/index.css`)

```css
@import "tailwindcss";

@theme {
  --color-background: #000000;
}

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  color-scheme: dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #000;
}
```

That's deliberately tiny. There used to be a `--color-primary: #ef4444` (red);
it was removed when the system went strictly black-and-white. **Do not
reintroduce a primary color token.**

### Rules

- Never use a hue — not for error, success, warning, or branding. State is
  carried by **label text + border weight** (see Badges, §6).
- Never use white below ~5% opacity; it stops being visible.
- The white-on-black inversion under `mix-blend-difference` (§7) is the one
  place "color" behaves dynamically — that's a compositing trick, not a token.

---

## 3. Typography

### Families

```
sans : Inter, system-ui, Avenir, Helvetica, Arial, sans-serif   (font-family root)
mono : Tailwind default `font-mono` (ui-monospace, SFMono, Menlo, …)
```

Inter is referenced by name and falls back to `system-ui`; there is **no
web-font `<link>`** — keep it that way unless you add proper preloading. There
is no separate display face; `font-black` (weight 900) on Inter is the display
treatment.

Weights in use: **400** (body), **500** (`font-medium`, buttons/labels),
**700** (`font-bold`), **900** (`font-black`, all big headings). Don't add
intermediate weights — they muddy the hierarchy.

### Roles

| Role | Recipe |
|------|--------|
| Hero | `font-black uppercase leading-[0.85] tracking-[-0.04em]` at `text-[clamp(2.75rem,11vw,9rem)]` |
| Page / section title | `font-black uppercase leading-[0.85]–[0.9] tracking-[-0.03em]–[-0.04em]` at `text-4xl`→`text-5xl` or a `clamp()` |
| Card / item title | `font-bold uppercase tracking-tight` at `text-base`→`text-lg` |
| Body | `text-base`→`text-lg text-white/80 leading-snug` (marketing uses `leading-relaxed`) |
| Caption (the signature) | `font-mono text-[10px]–[11px] uppercase tracking-[0.35em] text-white/55` prefixed `//` |
| Metadata | `font-mono text-[9px]–[11px] uppercase tracking-[0.25em] text-white/40` |

Headlines end with a period (`Log In.`, `Your Work.`, `Frequently asked.`) — it
gives them a noun-like finality. Keep it.

### The `//` caption pattern

The single most repeated element in the system. Every section header, form
label, meta row, and empty state opens with two slashes:

```html
<p class="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">// Overview</p>
<label class="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">// Email</label>
<span class="font-mono text-[10px] text-white/45 uppercase tracking-[0.35em]">// Est 2024</span>
```

Drop the `//` and the page loses its voice. Errors use `// Error: …`.

### Fluid sizing — two techniques

**1. `clamp()` for headings.** `clamp(min, vw-rate, max)`. Because a `vw` rate
scales with the viewport, one well-chosen rate fits a fixed-length word at every
width. Verify the longest word fits its column at the tightest breakpoint before
committing — don't eyeball it (see §11 gotchas).

**2. Container-derived sizing for full-bleed wordmarks.** When a fixed string
must span an exact width (the footer's giant `dakik`), don't guess a `vw` —
derive font-size from the container:

```
font-size = (100vw − 2 × gutter) / advance-ratio
```

where `advance-ratio` is the measured per-character width of the string at this
weight/tracking (≈2.5 for "dakik" at `font-black`/`-0.025em`). Implemented as:

```html
<h1 class="whitespace-nowrap font-black uppercase tracking-tight leading-[0.8]
           text-[calc((100vw_-_2*clamp(1rem,5vw,4rem))/2.5)]">dakik</h1>
```

`whitespace-nowrap` is mandatory — inline letters will wrap if the line lands a
sub-pixel over the edge.

---

## 4. Spacing & layout

### Fluid gutters

```
page padding-inline : clamp(1rem, 5vw, 4rem)     (apps, portal, subdomains)
                      clamp(1.5rem, 6vw, 6rem)    (marketing landing sections)
page padding-block  : clamp(1.25rem, 4vh, 4rem)  (apps)
                      clamp(6rem, 12vh, 10rem)    (marketing sections)
```

Pick **one** gutter scale per surface and use it everywhere on that surface so
section left-edges align vertically. The landing's `services` and `faq`
sections both use `clamp(1.5rem,6vw,6rem)` so their headings line up; the FAQ is
full-width (no `max-w` cap) specifically so its left edge matches the
full-width services section above it.

### Grid & width

- Mobile-first: default `grid-cols-1`, stat grids `sm:grid-cols-2 lg:grid-cols-3`.
- Split layouts (auth, FAQ): a 12-col grid, `lg:col-span-5` heading /
  `lg:col-span-7` content — with `min-w-0` on **both** tracks so an oversized
  heading can't overflow into the neighbor.
- App content caps at `max-w-7xl` and centers; marketing hero/section content
  goes full-bleed within the gutter.

### Section rhythm

`// caption` → big `Title.` → `h-px bg-white/10` hairline → content.

```html
<header>
  <p class="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">// Section</p>
  <h1 class="mt-3 font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl">Title.</h1>
  <div class="mt-6 h-px bg-white/10"></div>
</header>
```

---

## 5. Borders & corners

`border-radius: 0` is the default. Override Tailwind globally if a component
library tries to round things.

| Use | Weight | Color |
|-----|--------|-------|
| Hairline divider / card / table border | `1px` | `white/10` |
| Card border, hovered | `1px` | `white/30` |
| Input | `1px` | `white/20` → `white` on focus |
| Input, error | `2px` solid | `white` |
| Secondary button | `2px` | `white/20` → `white` on hover |
| Primary button (dense) | `2px` | `white` |
| Primary CTA (hero) | `4px` mobile / `8px` desktop | `white` |
| Cancelled / destructive badge | `1px` **dashed** | `white/40` |

The 4px→8px thick-bordered inverting CTA is the system's loudest element — one
per screen, max.

---

## 6. Components

### Buttons — three variants only

**Primary CTA (hero / highest emphasis):**
```html
<a class="group flex w-full items-center justify-center border-4 border-white bg-black
          px-6 py-4 font-medium uppercase tracking-wider text-white transition-colors
          duration-300 hover:bg-white hover:text-black lg:border-8 lg:py-7 lg:text-lg">
  Start a Project
</a>
```
Cap its width on desktop (`lg:max-w-[40rem]`) so it doesn't run under floating
elements like the hero video tile.

**Inline / inverted (dense lists, tables):**
```html
<button class="border-2 border-white bg-white px-4 py-2 font-medium uppercase tracking-wider
               text-black transition-colors hover:bg-black hover:text-white">Pay now</button>
```

**Secondary (back / cancel):**
```html
<button class="border-2 border-white/20 bg-transparent px-4 py-2 font-medium uppercase
               tracking-wider text-white/70 transition-colors hover:border-white hover:text-white">Cancel</button>
```

Hover **inverts** fg/bg (300ms). That inversion is reserved for buttons — links
and cards change opacity/border, never swap colors. Buttons are uppercase text
only; if you need an icon, place it _beside_ the button, not inside.

### Inputs

```html
<label class="mb-2 block font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">// Email</label>
<input class="block w-full border border-white/20 bg-transparent px-4 py-3 text-white
              placeholder-white/30 transition-colors focus:border-white focus:outline-none" />
```

No fill — the input sits on the canvas, border is the only chrome, focus takes
the border to solid white (no ring, no glow). **Error state** = thick white
border + `// Error: …` mono caption, never a red border:

```html
<input class="border-2 border-white bg-transparent …" />
<p class="mt-2 font-mono text-[10px] text-white uppercase tracking-[0.2em]">// Error: enter a valid email</p>
```

### Cards

```html
<div class="border border-white/10 bg-neutral-950 p-6 transition-colors
            hover:border-white/30 hover:bg-neutral-900">…</div>
```
Interactive cards add `group` + the `hover:` classes; static cards omit them.

### Status badges — grayscale, language-carried

Rectangular, mono, uppercase. Three weights + a dashed variant. The **label**
tells the user the state; border weight is secondary emphasis.

```html
<!-- active / current -->     <span class="inline-flex border border-white px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white">Active</span>
<!-- neutral / pending -->    <span class="inline-flex border border-white/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/80">Pending</span>
<!-- muted / done -->         <span class="inline-flex border border-white/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/50">Done</span>
<!-- cancelled / destructive--><span class="inline-flex border border-white/40 border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/60">Cancelled</span>
```

This replaced the old color-coded (amber/emerald/red/blue) badges across the
portal. Status meaning lives in the word, which screen readers get for free.

### Tables → mobile cards

Desktop table with `// HEADER` mono column labels, `divide-y divide-white/10`
rows, `hover:bg-white/[0.03]`. **Below `md:`, tables don't work** — swap to a
stacked card layout:

```html
<div class="hidden md:block"><table>…</table></div>
<div class="space-y-3 md:hidden"><!-- one card per row --></div>
```

### Navigation

Active state = solid `text-white` + a glyph marker, never color. Portal/app nav:
mono uppercase, `●` bullet prefix on the active item, inactive `text-white/50`.

```html
<a class="px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white">
  <span class="mr-2 text-white">●</span>Dashboard
</a>
```

### Empty & loading

```html
<!-- empty -->
<div class="flex flex-col items-center justify-center border border-white/10 bg-white/[0.02] py-20">
  <Icon class="h-10 w-10 text-white/20" />
  <p class="mt-6 font-mono text-[11px] text-white/55 uppercase tracking-[0.35em]">// Nothing here yet</p>
  <p class="mt-2 text-sm text-white/40">Helper sentence in body sans.</p>
</div>

<!-- skeletons match the loaded element's height -->
<div class="h-24 animate-pulse border border-white/10 bg-white/5"></div>

<!-- spinner: a square outline, never a circle -->
<div class="h-6 w-6 animate-spin border-2 border-white/20 border-t-white"></div>
```

Icons are **lucide-react**, used sparingly. No emoji, no custom illustrations.

---

## 7. Visual signatures

These are what make a page recognizably Dakik. Strip them and it reads as
generic dark UI.

### Noise grain

`src/frontend/components/noise.tsx` — a canvas that redraws per-pixel random
grayscale noise on a loop. Drop `<Noise patternAlpha={15–25} patternRefreshInterval={3} />`
into any `relative` parent. Use on hero, auth, error, and subdomain pages; avoid
on dense forms/tables where it fights the content. `patternAlpha` 15 is subtle,
25 is unmistakable, >30 is too much.

### `mix-blend-difference` navbar

The landing navbar's top bar carries `text-white mix-blend-difference` so the
logo + links stay legible over _any_ section scrolling behind them (white text
→ visible as white-on-dark or black-on-light, computed `|backdrop − source|`).

**The trap:** anything inside a `mix-blend-difference` layer can't have an
opaque background — a white fill renders as inverted page content. The mobile
menu therefore lives **outside** the blended bar as a separate sibling with a
solid `bg-black` panel. Rule: keep the blend on the persistent bar only; any
panel that needs a real background goes outside it.

### Inlined logo SVG

The logo uses `fill: currentColor`. Loaded via `<img>` it's sandboxed and
defaults to black (invisible under the blend); **inline the SVG** in the JSX so
`currentColor` resolves to the parent's `text-white`. (`navbar.tsx`.)

### Inverting hover, sharp corners, `//` captions

Covered above — they recur often enough to count as signatures in their own
right.

---

## 8. Motion

Framer Motion, restrained and fast.

| Action | Duration | Easing |
|--------|----------|--------|
| Color/bg transition | 300ms | `ease-out` |
| Hover | 200ms | `ease-out` |
| Reveal on mount / in-view | 400–500ms | `[0.25,0.25,0.25,0.75]` |
| Drawer / accordion height | 250–300ms | `[0.4,0,0.2,1]` |
| Scroll-linked services type | — | `useTransform`, writes straight to DOM, no re-render |
| Services step counter | 700ms | CSS transform, `cubic-bezier(0.22,1,0.36,1)` |

No bounce/spring on chrome. Always honor reduced motion:

```tsx
const reduced = useReducedMotion(); // src/frontend/hooks/use-reduced-motion.ts
// variants: { hidden: { opacity: 0, y: reduced ? 0 : 20 }, visible: { opacity: 1, y: 0 } }
```

The `services` section uses natural vertical scrolling, with a sticky step
counter and direct links to Discover, Design, Build, and Improve. The counter
updates as each row crosses the viewport's reading line. Reduced motion disables
the counter transition and renders service titles at full opacity with no movement.
Mobile uses a single column with inline step numbers and no sticky counter.

Services uses sentence-case, regular/medium display type as a deliberate contrast
to the heavy uppercase hero and FAQ. It contains no decorative images. Its styles
are scoped in `src/frontend/components/landing/services.css`.

**Caveat learned:** for single-screen pages, prefer `animate="visible"` /
`initial+animate` over `whileInView`; under React StrictMode + Vite HMR, a
`whileInView` reveal occasionally stuck at `opacity: 0`. When an intro animation
is load-bearing for legibility, don't gate it behind the viewport observer.

---

## 9. Accessibility

The aesthetic is severe; a11y compensates.

- **Contrast:** `#FFF` on `#000` is 21:1 (AAA). `text-white/55` is the floor for
  caption-size text; below that is decorative only.
- **Focus:** never suppress. Add an explicit white ring if the default is
  invisible: `:focus-visible { outline: 2px solid #FFF; outline-offset: 2px; }`
- **Hit targets:** ≥40×40px; mobile primary CTAs at least `py-4`.
- **State by language:** since color carries no meaning, the label must
  (`// Error:`, `Cancelled`, etc.). This is an a11y win, not just stylistic.
- **Semantic HTML + heading order:** one `<h1>` per page; sections use `<h2>`;
  adjust size with classes, never by skipping levels. Inline SVGs get
  `aria-hidden` with the accessible name on the wrapping link/button.

---

## 10. Multi-surface architecture

One Cloudflare Worker serves four experiences, chosen by hostname at boot in
`src/frontend/router.tsx` (`detectSubdomain()` reads `window.location.hostname`):

| Host | Experience | Public `/` | Admin |
|------|-----------|-----------|-------|
| `dakik.co.uk` | Marketing + customer portal | landing | `/admin` full suite |
| `icons.dakik.co.uk` | Dakik Icons (SVG library) | catalog | `/admin` icons CRUD |
| `bits.dakik.co.uk` | Dakik Bits (React components) | catalog | `/admin` components CRUD |
| `flow.dakik.co.uk` | Dakik Flow (automation playbooks) | catalog + `/:slug` | `/admin` automations CRUD |

All four share the same Hono API, the same Cloudflare **D1** database, and the
same better-auth session. `/login` + `/auth/callback` exist on every host.
`dakik.co.uk/daicons|dacomps|automations` 301-redirect to the matching
subdomain (`src/routes/seo.ts`, and the paths must be in `run_worker_first` in
`wrangler.jsonc` or the SPA fallback swallows them before the worker can
redirect).

Each subdomain catalog page is self-contained: its own header
(`D` logo box + `// Icons|Bits|Flow` caption + "← Dakik.co.uk" link), the noise
overlay, an oversized `Icons.`/`Bits.`/`Flow.` headline, and its own footer — no
shared marketing navbar/footer.

---

## 11. Page archetypes

- **Auth (`/login`, `/auth/callback`)** — split screen: left = oversized
  typographic statement over black + noise; right = form. Mobile stacks and
  hides the eyebrow/tagline to fit one viewport without scroll. Login-only;
  registration happens through the survey.
- **Survey (`/survey`)** — full-screen one-question-at-a-time flow, mono
  `NN / NN` progress, chip selections that auto-advance, then a Cal.com-style
  meeting picker (date strip + time grid) backed by Google Calendar freebusy,
  then a confirmation screen.
- **Portal (`/portal/*`)** — sticky top nav with `●` active marker; pages are
  `// caption` → big `Title.` → hairline → monochrome stat grid / sharp-edged
  list / responsive table.
- **Subdomain catalog** — see §10.
- **Marketing landing** — black hero (noise, oversized headline, capped
  full-width CTA) → white `services` section (typographic rows, sticky rolling
  step counter, reduced-motion support) → white `faq` (split heading/accordion) → black
  footer with the container-sized `dakik` wordmark.

---

## 12. Anti-patterns

| Don't | Do |
|-------|----|
| Reintroduce a primary/accent color | `text-white/NN` + a worded label |
| Signal state with color | border weight + label language |
| Round corners (`rounded-*`) | `border-radius: 0` |
| Gradients / shadows / glows | solid borders + opacity stops |
| Opaque background inside the blended navbar | put the panel outside the blend |
| `<img src>` for a `currentColor` SVG | inline the SVG |
| Hand-tuned `vw` for a fixed-width wordmark | container-width ÷ measured ratio |
| Trust a preview screenshot for exact geometry | `getBoundingClientRect()` |
| `whileInView` for load-bearing single-screen reveals | `initial` + `animate` |
| Mid-weight fonts mixed mid-sentence | one weight per role |
| Lowercase buttons/captions | uppercase, tracked |
| `transition-all` | transition only the animated property |
| A light mode | the system is dark-only |

---

## 13. Implementation cheat sheet

### Class catalogue (copy these; stop retyping)

```
caption        : font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]
caption-dim    : font-mono text-[10px] text-white/45 uppercase tracking-[0.25em]
hero-title     : font-black text-[clamp(2.75rem,11vw,9rem)] uppercase leading-[0.85] tracking-[-0.04em]
page-title     : font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl
section-title  : font-bold text-base uppercase tracking-tight sm:text-lg
body           : text-base text-white/80 leading-snug
hairline       : h-px bg-white/10
card           : border border-white/10 bg-neutral-950
card-hover     : border border-white/10 bg-neutral-950 transition-colors hover:border-white/30 hover:bg-neutral-900
input          : block w-full border border-white/20 bg-transparent px-4 py-3 text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none
btn-cta        : group flex w-full items-center justify-center border-4 border-white bg-black px-6 py-4 font-medium uppercase tracking-wider text-white transition-colors duration-300 hover:bg-white hover:text-black lg:border-8
btn-inline     : border-2 border-white bg-white px-4 py-2 font-medium uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white
btn-secondary  : border-2 border-white/20 bg-transparent px-4 py-2 font-medium uppercase tracking-wider text-white/70 transition-colors hover:border-white hover:text-white
badge-active   : inline-flex border border-white px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white
badge-neutral  : inline-flex border border-white/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/80
badge-muted    : inline-flex border border-white/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/50
gutter         : px-[clamp(1rem,5vw,4rem)]        (apps)
gutter-wide    : px-[clamp(1.5rem,6vw,6rem)]      (marketing)
```

### App page skeleton

```tsx
export function Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-7xl px-[clamp(1rem,4vw,2rem)] py-[clamp(1.5rem,4vh,3rem)]">
        <header className="space-y-3">
          <p className="font-mono text-[10px] text-white/55 uppercase tracking-[0.35em]">// Section</p>
          <h1 className="font-black text-4xl uppercase leading-[0.9] tracking-[-0.03em] sm:text-5xl">Title.</h1>
          <div className="h-px bg-white/10"></div>
        </header>
        {/* sections */}
      </main>
    </div>
  );
}
```

### Reference files

| What | Where |
|------|-------|
| Theme tokens | `src/frontend/index.css` |
| Noise component | `src/frontend/components/noise.tsx` |
| Reveal / motion | `src/frontend/components/motion/` |
| Reduced-motion hook | `src/frontend/hooks/use-reduced-motion.ts` |
| Navbar (mix-blend, mobile menu, inline logo) | `src/frontend/components/landing/navbar.tsx` |
| Hero (CTA, clamp headline) | `src/frontend/components/landing/hero.tsx` |
| Services (typographic rows + step counter) | `src/frontend/components/landing/services.tsx`, `services.css` |
| FAQ (split heading/accordion) | `src/frontend/components/landing/faq.tsx` |
| Footer (container-sized wordmark) | `src/frontend/components/landing/footer.tsx` |
| Auth split-screen | `src/frontend/pages/login.tsx` |
| Survey + meeting picker | `src/frontend/pages/survey.tsx` |
| Portal shell + pages | `src/frontend/components/portal/`, `src/frontend/pages/portal/` |
| Hostname routing | `src/frontend/router.tsx` |
| Subdomain catalogs | `pages/daicons.tsx`, `pages/dacomps.tsx`, `pages/automations/` |

---

When in doubt, open the nearest reference file and replicate its pattern
verbatim. Consistency across surfaces is the asset; deviation is the cost.
