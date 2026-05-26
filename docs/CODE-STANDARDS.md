# Code standards

## Principle

Keep the site simple, durable, inspectable, and easy for Claude Code or a human
developer to maintain. Do not introduce build complexity.

---

## Current architecture

A static site served by GitHub Pages, with **no build step and no framework**.

The main page is a **single file**: `index.html` contains all of its HTML, its
CSS (in one `<style>` block in the `<head>`), and its JavaScript (in one
`<script>` block before `</body>`). This is deliberate — it keeps the leadership
site trivially portable and legible. Do not split it into separate assets
without explicit approval.

Primary files:

- `index.html` — the entire main public page.
- SEO recovery folders — four clean-URL pages, each with its own `index.html`
  (`ecological-garden-design-melbourne/`, `garden-design/`,
  `garden-installation/`, `plant-donation-program/`).
- `sitemap.xml` — search discovery.
- `robots.txt` — crawl guidance.
- `CNAME` — custom-domain config.
- `CLAUDE.md` and `/docs` — governance.

---

## HTML

Use semantic HTML: `header`, `main`, `section`, `nav`, `footer`, headings in
order, real `<button>` for actions, real `<a>` for navigation. Avoid div soup
where a semantic element is clearer.

The page is built as a sequence of `<section>` elements, each with an `id`.
Current section ids, in order:

```txt
top · browse · begin · how-we-work · gardens · objects ·
plants · stories · system · ecology-statement · contact
```

Plus an Acknowledgement of Country section before the footer. Navigation links
and in-page anchors depend on these ids — do not rename an `id` without
updating every link that targets it (nav, mobile nav, footer, in-page CTAs).

---

## CSS

All styling is token-driven. The `:root` block defines the system; `body.light`
and `.section.light` re-scope it for light surfaces.

Good:

```css
color: var(--fg);
background: var(--bg);
border-color: var(--line);
```

Avoid:

```css
color: #fff0dc;
background: #3d4535;
```

Hard-coded brand colours are acceptable **only** inside the `:root` token
definitions themselves.

### Font tokens

```css
--font-hero:  'Abril Fatface', serif;          /* hero <h1> only */
--font-serif: 'Fraunces', 'Abril Fatface', serif;  /* all other headings */
--font-sans:  'IBM Plex Sans', sans-serif;     /* body */
--font-mono:  'IBM Plex Mono', ui-monospace, monospace;  /* labels, numerals */
```

Never set `font-family: var(--font-hero)` on anything but the hero `h1`.

### Theme system

- `:root` defines the dark (green) theme.
- `body.light` is the global light-theme toggle.
- `.section.light` inverts an individual section to beige within the dark page
  (used at Pillars, Heirloom, Statement). It re-scopes `--bg`, `--fg`,
  `--line`, `--panel`, etc.

If you edit global styles, test both themes and all three beige sections.

---

## JavaScript

Keep JavaScript restrained and readable.

- No framework unless approved.
- No new dependency unless it solves a real problem.
- No hand-minified code committed.
- Keep form endpoints and business-critical logic clearly labelled.
- Preserve reduced-motion and accessibility considerations.

The existing script handles: the theme toggle, the scrolled-state nav, the
mobile menu, scroll-reveal animations, active-section tracking, and smooth
anchor scrolling. Understand a handler before changing it.

---

## Accessibility floor

Every change must preserve:

- readable contrast;
- keyboard-accessible controls;
- visible focus state (`:focus-visible` is styled — keep it);
- labelled form fields;
- meaningful image `alt` text;
- no motion-only navigation;
- mobile usability.

---

## SEO floor

Do not remove, without replacing with something better:

- `<title>`;
- meta description;
- canonical URL;
- Open Graph title / description / url / type;
- sitemap entries;
- `robots.txt`;
- SEO recovery pages.

For every new public page: a unique title, unique meta description, canonical
URL, a clear single `<h1>`, and an internal link path from the main site where
appropriate.

> **[VERIFY]** Resolve the `www` vs apex canonical-domain inconsistency (see
> `docs/BRAND.md`). All SEO metadata must use the one chosen form.

---

## Performance

- Compress images.
- Avoid large third-party scripts.
- Prefer light, system-native interactions.
- No autoplay video unless strategically necessary.
- Avoid layout shift — set dimensions/aspect-ratios on media.

---

## Comments

Good comments explain *why* something exists. Avoid comments that just restate
the code. The existing CSS uses section-banner comments — match that style.

---

## File naming

Lowercase kebab-case:

```txt
garden-design/index.html
auburn-studio-window.jpg
```

Avoid:

```txt
IMG_1234 final FINAL.jpg
New Page Copy.html
```

---

## Pull request scope

Prefer small, single-purpose PRs — one content update, one SEO fix, one design
refinement, one documentation change. Avoid large PRs that mix content, design,
scripts, and SEO unless genuinely unavoidable.
