# Image guide

## Principle

Images on this site should feel like Gardener & Son: garden-led, material,
ecological, restrained, and real. Avoid generic stock photography unless there
is genuinely no better option and the image has been chosen with care.

---

## Where images live — read this first

The `images/` folder **is in this repository.** It is committed and
version-controlled here.

However, there is a quirk worth understanding and fixing over time:

`index.html` references images by **absolute URL** —
`https://tinyforests.github.io/gardenerandson/images/...` — which is this
repo's own GitHub Pages URL. So the images are local to the repo, but the page
fetches them as if they were external. The more robust pattern is a
**relative path** (`/images/heirloom/heirloom-2.jpeg`), which keeps working if
the domain changes and works in local preview without hitting the live Pages
site.

**Recommended (not urgent):** migrate image references in `index.html` from the
absolute `tinyforests.github.io/...` URL to relative `/images/...` paths. Do it
as one focused PR, and check every image still loads in local preview.

A few images still load from **external CDNs** that are genuinely not in the
repo:

- **Notion** — the Ecological Garden photo (used in the Gardens section and the
  Objects pillar) loads from a `gardenerandson.notion.site` URL.
- **Substack CDN** — three garden-card images load from `substackcdn.com`.

These external URLs are **not stable long-term** — they can rotate or expire.
They should be downloaded, compressed, committed into `images/`, and the
references updated. Until then, do not add any new Notion, Substack, signed, or
social-CDN image URLs.

---

## Folder convention

The `images/` folder is at the repo root. Within it, use a clear structure —
the current site already uses `images/heirloom/` and `images/plants/`:

```txt
images/
├── brand/
├── gardens/
├── heirloom/    # Heirloom objects + studio photos
├── plants/      # Plants of Place
├── studios/
└── seo/
```

Use subfolders only where they make navigation easier.

---

## Naming convention

Lowercase kebab-case, descriptive:

```txt
auburn-studio-window.jpeg
mont-albert-studio-front.jpeg
victoria-crescent-small-ecological-garden.jpeg
heirloom-seed-head.png
```

Avoid:

```txt
IMG_9583.jpg
Screen Shot 2026-05-20 at 2.14.00 pm.png
final-logo-new-2.png
```

The current Heirloom and Plants images follow this pattern
(`heirloom-mont-albert-1.jpeg`, `plantsofplace-1.jpeg`, etc.). Match it.

---

## Format and compression

- Resize hero and feature images to sensible dimensions before publishing.
- Compress JPEG/PNG assets; prefer WebP where suitable.
- The site mixes `.jpeg`, `.png`, and CDN-transcoded `.webp`. Standardise on
  `.jpeg` or `.webp` for photographs going forward.
- Keep uncompressed originals outside the production path.

---

## How images are wired into the page

Image thumbnails on the site are set as CSS `background-image` on a `<div>`
with a fixed `aspect-ratio`, using `background-size: cover`. They are decorative
and sit beside text that already names the subject.

> **[VERIFY]** Because these are background images, they carry no `alt` text.
> For brand-critical or content-bearing imagery, prefer a real `<img>` element
> with meaningful `alt`. Discuss with the team whether the current thumbnails
> should be converted to `<img>` for accessibility before launch.

When a real `<img>` is used, alt text must be meaningful:

```html
<!-- Good -->
<img src="…/victoria-crescent-small-ecological-garden.jpeg"
     alt="Small ecological garden in Mont Albert with basalt rockwork and indigenous planting">

<!-- Bad -->
<img src="…/photo.jpg" alt="image">
```

---

## Brand image direction

Favour: real gardens; material texture; ecological detail; objects in garden
settings; plants in context; studio atmosphere; seasonal imperfection;
restrained warmth.

Avoid: sterile renders (unless clearly conceptual); overly polished luxury
landscaping imagery; greenwashing visuals; disconnected product cut-outs unless
a specific layout needs them.

---

## Image review checklist — before merging

- Is the image hosted in the studio-controlled location (not Notion/Substack)?
- Is the filename clear, lowercase, kebab-case?
- Is the file size reasonable and compressed?
- If it is an `<img>`, does it have meaningful `alt` text?
- Does the crop work at the container's `aspect-ratio`?
- Does the image support the brand rather than dilute it?
