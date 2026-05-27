# CLAUDE.md — Gardener & Son leadership site

This file is the operating contract for Claude Code and any developer working in
this repository. Read it fully before touching anything.

If anything in this file conflicts with a casual instruction in a chat prompt,
this file wins. If this file conflicts with the live brand book at
`www.gardenerandson.com/brand.html`, the brand book wins and this file should be
corrected.

---

## 1. What this repository is

The public leadership brand site for **Gardener & Son**, an ecological design
studio in Melbourne. It is a single, mostly static page plus supporting SEO
pages, served by GitHub Pages.

It is simple in structure and serious in purpose. It is the largest public
representation of the brand. Treat every change as brand-critical, not as a
casual static-page edit.

The site is not complex. Its importance is not technical — it is representational.

---

## 2. Required reading order

When Claude Code enters this repository it must, before editing anything:

1. Read this file (`CLAUDE.md`).
2. Read `README.md`.
3. Read every file in `/docs`:
   - `docs/BRAND.md`
   - `docs/CODE-STANDARDS.md`
   - `docs/CONTENT-GUIDE.md`
   - `docs/IMAGES.md`
   - `docs/DEPLOYMENT.md`
4. Inspect the actual repository structure (`ls`, read `index.html`).
5. Only then propose a small, branch-based plan.

Do not edit production files until you have stated the plan and it is acceptable.

---

## 3. Core identity

Gardener & Son is an **ecological design studio** based in Melbourne, operating
across two locations: Mont Albert and Hawthorn (Auburn Road).

The site expresses:

- ecological garden design — not generic landscaping;
- beauty under real conditions;
- private gardens as living ecological systems;
- gardens, objects, plants, stories, and systems as **one connected practice**;
- calm authority rather than marketing noise;
- craft, restraint, care, and long-term stewardship.

### Language to use

ecological design studio; ecological gardens; gardens as living systems;
connecting people to nature through gardens; private ecological infrastructure;
place, habitat, soil, water, canopy, stewardship; plants of place;
beauty under real conditions; stewards.

### Language to avoid

Generic landscaping language; hype, growth-hacking, or startup jargon; empty
sustainability claims; "landscape architect" for the studio or its founders;
"homeowner" or "landowner" (use **steward**); "native" used alone when the
correct phrase is "indigenous plants of place"; corporate over-explanation;
decorative features with no ecological or brand purpose.

---

## 4. The connected practice — context you must not "tidy away"

The site links out to several real, related Gardener & Son products. These are
**not placeholders.** Do not remove, "fix", or relabel these links without an
explicit instruction:

- **Ecological Registry** — `ecologicalregistry.org`
- **Find My EVC** — `findmyevc.com`
- **Find My Ecological Garden** — `findmyecologicalgarden.com`
- **YIELD** — economic layer (referenced in the System section)
- **Curbing** — aggregation layer (referenced in the System section)
- **Heirloom** — objects imprint — `tinyforests.github.io/heirloom/`
- **Where Gardens Begin** — intake tool —
  `tinyforests.github.io/gardenerandson/where-gardens-begin.html`

If a link looks unfinished, assume it is intentional and ask before changing it.

---

## 5. Non-negotiable brand tokens

Use the existing CSS custom properties (the `:root` token block in `index.html`).
Never hard-code a brand colour outside the token definitions.

### Colour

| Token            | Value     | Role                                  |
|------------------|-----------|---------------------------------------|
| `--green`        | `#3d4535` | Gardener Green — primary              |
| `--beige`        | `#fff0dc` | Nostalgic Beige — primary             |
| `--accent`       | `#B49A63` | Dry Grass Brass — emphasis, CTAs      |
| `--clay`         | `#9A6A4F` | Weathered Clay — italic emphasis      |
| `--green-subtle` | `#465040` | Subtle green tone                     |
| `--green-deep`   | `#2a2f25` | Deepest green                         |

`--green` and `--beige` are the brand anchors. The others support, never replace.
Do not introduce neon, corporate blue, or generic eco-green.

### Typography — four families, strict roles

| Family            | Token          | Role                                              |
|-------------------|----------------|---------------------------------------------------|
| Abril Fatface     | `--font-hero`  | **Hero `<h1>` ONLY.** Used sparingly. Never on h2+ |
| Fraunces          | `--font-serif` | All `h2`/`h3`/`h4`, pull-quotes, editorial moments |
| IBM Plex Sans     | `--font-sans`  | Body copy, navigation, general readability        |
| IBM Plex Mono     | `--font-mono`  | Labels, numerals, URLs, registry-style metadata   |

**The single most important typography rule:** Abril Fatface is hero-only. If
Abril appears on a section heading, that is a brand error. All section headings
are Fraunces. This mirrors the brand book exactly.

Italic Fraunces in `--clay` is the brand's emphasis device — it replaces bold.
Never bold a word for emphasis; use italic Fraunces inline instead.

Do not add a new font without a written reason and explicit approval.

---

## 6. Visual rules

- No rounded, bubbly SaaS aesthetic. `border-radius` is `0` across the site —
  keep it that way.
- Hairline borders only — 1px, square, low-opacity green or beige.
- Generous spacing. Let typography and rhythm carry the design.
- The page uses a deliberate "sandwich" rhythm: dark green sections with three
  beige (`.section.light`) sections at Pillars, Heirloom, and the Statement.
  Preserve that rhythm if editing section backgrounds.
- Preserve the green/beige identity and the light/dark theme toggle logic.
- No stock icons. No heavy drop shadows. No template-like sections.
- The hero background is a hand-built topographic SVG. Do not replace it with a
  stock pattern or image without approval.

---

## 7. Architecture

- Static site served by **GitHub Pages** from
  `github.com/tinyforests/gardenerandson`. **No build step.** No framework.
- Root `index.html` is the entire main page — HTML, CSS, and JS in one file.
- Four SEO recovery pages exist as clean-URL folders, each with its own
  `index.html`: `ecological-garden-design-melbourne/`, `garden-design/`,
  `garden-installation/`, `plant-donation-program/`.
- Default assumption: never add tooling. If a build step seems necessary, stop
  and ask whether the complexity is justified. This repo must stay immediately
  legible to the next developer or Claude Code session.

**Open issue — `index2.html`:** the repo currently contains both `index.html`
and `index2.html` (the brand-aligned rebuild). This duplicate must be resolved
into a single `index.html` — see `docs/DEPLOYMENT.md`. Until it is, do not edit
both files; treat `index.html` as live and `index2.html` as pending promotion.

**Unconfirmed pages:** `gardens.html`, `auburn.html`, `montalbert.html` sit at
the repo root with unclear status. Do not edit or rely on them until their
status is confirmed (see `README.md`).

---

## 8. Code rules

- Preserve semantic HTML (`header`, `main`, `section`, `nav`, `footer`, ordered
  headings, real `<button>` and `<a>` elements).
- Preserve accessibility basics: labels, visible focus states, readable
  contrast, keyboard access, meaningful `alt` text, reduced-motion respect.
- Keep CSS tokens centralised. Never hard-code a brand colour where a token
  exists.
- Never remove SEO metadata without replacing it with something better.
- Never break canonical URLs, sitemap entries, or SEO recovery paths.
- Never remove form, tracking, or submission logic without confirming the
  replacement path.
- Keep comments useful and restrained — explain *why*, not *what*.
- Do not commit experimental or throwaway files into production paths.

---

## 9. Content rules

Voice: warm, intelligent, calm, grounded. A design studio with ecological
depth — never an agency brochure.

- Sentence case for headings. Section headings carry a terminal full stop
  ("Things worth keeping.", "How we work.") — this is the brand-book pattern.
- Brand and product names keep their correct case (Gardener & Son, Plants of
  Place, Ecological Registry, Find My EVC, Find My Ecological Garden).
- Short paragraphs. Specific nouns. Restrained, believable claims.
- Buttons and navigation labels are clear, not clever.
- Button label text begins with a capital letter.

See `docs/CONTENT-GUIDE.md` for the full language list.

---

## 10. Image rules

- Images are currently hosted **outside this repository**, on a separate
  Gardener & Son GitHub Pages path (`tinyforests.github.io/gardenerandson/
  images/...`). See `docs/IMAGES.md` for the full hosting policy.
- A small number of images still load from Notion and Substack CDNs. These are
  flagged for migration — see `docs/IMAGES.md`. Do not add new external-CDN
  image dependencies.
- Name images in lowercase kebab-case. Compress before committing. Always give
  meaningful `alt` text. Never use unrelated stock imagery.

---

## 11. Protected paths and content

Take exceptional care with:

- `index.html`
- `brand.html` — the brand book; the site footer links to it
- `sitemap.xml`, `robots.txt`
- `CNAME` and any GitHub Pages / DNS / custom-domain configuration
- the four SEO recovery folders: `ecological-garden-design-melbourne/`,
  `garden-design/`, `garden-installation/`, `plant-donation-program/`
- canonical URLs and Open Graph metadata
- `where-gardens-begin.html` — the intake tool
- any form submission endpoint
- brand colour and typography tokens
- **The Acknowledgement of Country** section. This is culturally significant
  content. Do not edit, shorten, paraphrase, or restyle it without explicit
  instruction from Tyson or Natasha. Treat its wording as fixed.

---

## 12. Workflow

For any meaningful change:

1. Branch from `main`.
2. Make focused, single-purpose changes.
3. Preview locally (`python3 -m http.server 8080`).
4. Open a pull request using the PR template.
5. Merge only after review.

Do not push directly to `main` except for a tiny, urgent production fix
(broken link, wrong contact detail, broken endpoint). Document any direct-main
change immediately afterward.

Branch prefixes: `docs/`, `content/`, `fix/`, `feature/`, `seo/`.

---

## 13. Claude Code working process

When working in this repo, Claude Code should:

1. Read this file, `README.md`, and `/docs` first.
2. Inspect the real structure before editing.
3. State the intended change before making broad edits.
4. Keep changes small and reviewable — one concern per branch.
5. Preserve the brand and token systems.
6. Run a local preview where possible.
7. Summarise exactly what changed and what a reviewer should check.

---

## 14. Final check before every pull request

- The page still feels unmistakably like Gardener & Son.
- The site still loads with no build step.
- Abril appears only in the hero; all other headings are Fraunces.
- Brand tokens used — no stray hard-coded colours.
- Mobile layout considered.
- Light/dark theme still works if global styles were touched.
- No broken links; images load and have `alt` text.
- SEO metadata, canonical URL, sitemap, robots intact.
- The Acknowledgement of Country is unchanged.
- No placeholder text or abandoned experiments remain.
