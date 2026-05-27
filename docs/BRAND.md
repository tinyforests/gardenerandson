# Brand guide — Gardener & Son leadership site

This guide governs the brand expression of the site. The live brand book at
`gardenerandson.com/brand.html` is the ultimate source of truth — if this file
and the brand book disagree, the brand book wins and this file should be fixed.

---

## Brand position

Gardener & Son is an **ecological design studio**. The site must feel like a
practice with depth, care, taste, and a long view of gardens.

It is not a generic landscaping business site. It is not a SaaS landing page.
It is not a loud sustainability campaign.

---

## Core expression

The brand carries these ideas:

- gardens connect people to nature;
- ecological gardens are beautiful, functional, and living;
- private gardens can become habitat, cooling, soil, water, and canopy
  infrastructure;
- objects, plants, gardens, and stories belong together as one practice;
- the studio works with place, material, memory, ecology, and time.

---

## Canonical colours

These are brand anchors, not styling preferences. Use them through the CSS
token system in `index.html` — never hard-code them outside the `:root` block.

```css
--green: #3d4535;   /* Gardener Green — primary anchor */
--beige: #fff0dc;   /* Nostalgic Beige — primary anchor */
```

Supporting colours, used only where they serve the design:

```css
--accent:       #B49A63;   /* Dry Grass Brass — emphasis, CTAs, accent rules */
--clay:         #9A6A4F;   /* Weathered Clay — italic editorial emphasis */
--green-subtle: #465040;   /* subtle green tone */
--green-deep:   #2a2f25;   /* deepest green */
```

Avoid bright, synthetic, neon, corporate blue, or generic eco-green palettes.

---

## Typography — four families, strict roles

The site runs a four-family system. Each family has one job. Mixing the roles
is a brand error.

| Family          | Role                                                          |
|-----------------|---------------------------------------------------------------|
| **Abril Fatface** | The hero `<h1>` only. Used sparingly. Never on `h2`/`h3`/`h4`. |
| **Fraunces**      | All section headings (`h2`–`h4`), pull-quotes, editorial moments, the wordmark, garden and story titles. |
| **IBM Plex Sans** | Body copy, navigation links, general interface text.          |
| **IBM Plex Mono** | Labels, eyebrows, numerals, URLs, registry-style metadata.     |

**The rule that matters most:** Abril is hero-only. The brand book is explicit
that Abril, used everywhere, stops being a hero treatment. Every section
heading on the site is Fraunces. If you see Abril on an `h2`, that is a bug.

### The emphasis device

Bold is never used for emphasis. The brand's emphasis device is **italic
Fraunces in `--clay`**, used inline on a single phrase. The hero does this with
"Heirloom objects." The wordmark ampersand does this in `--accent`. Follow that
pattern; do not introduce `<strong>`/bold for emphasis.

Do not add another font without a strong written reason and approval.

---

## Shape and material feeling

The site should feel editorial, calm, structured, slightly old-world but
contemporary, ecological rather than decorative, careful rather than flashy.

`border-radius` is `0` everywhere. Keep it that way.

Avoid:

- pill buttons and rounded cards;
- heavy drop shadows;
- generic icon grids;
- template-like sections;
- stock corporate photography;
- fake hand-drawn ornaments.

---

## Layout rhythm

- Large type, restrained body copy.
- Sections with real breathing room.
- Hairline dividers and quiet panels.
- A deliberate dark/light "sandwich": dark green sections punctuated by three
  beige (`.section.light`) sections — Pillars, Heirloom, Statement. This rhythm
  is intentional; preserve it.
- Quiet interactive states. Clear mobile stacking.

Do not crowd the page with too many messages at once.

---

## Voice

Warm, grounded, quietly intelligent.

Good:

> We design ecological gardens that connect people to nature, restore habitat,
> and give everyday life a deeper relationship with place.

Too generic:

> We provide professional landscaping solutions for residential and commercial
> clients.

Too abstract:

> We activate regenerative paradigms through nature-positive spatial
> experiences.

Too salesy:

> Transform your outdoor space today with Melbourne's best garden experts.

Full language guidance is in `docs/CONTENT-GUIDE.md`.

---

## Naming rules

Use: Gardener & Son; ecological design studio; ecological garden design;
garden designer; gardens; objects; plants; stories; systems; stewards.

Avoid unless specifically required: landscaping company; landscape architect;
yard makeover; outdoor solutions; sustainable lifestyle brand; homeowner;
landowner.

---

## Canonical domain — decided

The canonical domain is **`https://www.gardenerandson.com`** (with `www`).
Decided by Tyson, 2026-05-27. Recorded in `docs/DEPLOYMENT.md`.

All canonical tags, Open Graph URLs, internal links, and the sitemap use the
`www` form. The apex domain redirects to `www` via GitHub Pages.

---

## Brand test — before merging

1. Does this still feel unmistakably like Gardener & Son?
2. Would it sit comfortably beside the studios, the objects, and the Ecological
   Registry?
3. Is the copy calm and specific?
4. Does the design feel crafted rather than templated?
5. Is Abril confined to the hero, with Fraunces on every other heading?
