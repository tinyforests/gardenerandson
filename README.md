# Gardener & Son — leadership site

The public leadership brand site for **Gardener & Son**, an ecological design
studio in Melbourne.

The site is intentionally simple. Its importance is not technical complexity —
it is brand representation. It is the largest public expression of the studio.

---

## What this site must do

- Present Gardener & Son as a serious ecological design studio.
- Communicate gardens, objects, plants, stories, and systems as one connected
  practice.
- Preserve the visual identity: Gardener Green, Nostalgic Beige, the four-font
  editorial typography system, calm ecological depth.
- Support SEO recovery from earlier site paths.
- Stay easy to maintain through GitHub Pages and Claude Code, with no build step.

---

## Repository

GitHub: `https://github.com/tinyforests/gardenerandson`
Served by GitHub Pages on the custom domain configured in `CNAME`.

## Repository structure (confirmed)

```txt
/
├── index.html          # main public homepage (production)
├── index2.html         # SEE "Known issues" — duplicate homepage, must be resolved
├── brand.html           # the brand book (protected — footer links to it)
├── gardens.html         # standalone page  [VERIFY status — live? old?]
├── auburn.html          # standalone page  [VERIFY status — live? old?]
├── montalbert.html      # standalone page  [VERIFY status — live? old?]
├── where-gardens-begin.html   # the intake tool
├── sitemap.xml
├── robots.txt
├── CNAME                # custom-domain config for GitHub Pages
├── README.md
├── CLAUDE.md            # operating contract — read first
├── PROJECT-SETUP.md
├── .gitignore
├── images/             # site images (referenced via the Pages URL — see below)
├── ecological-garden-design-melbourne/   # SEO recovery page
│   └── index.html
├── garden-design/                         # SEO recovery page
│   └── index.html
├── garden-installation/                   # SEO recovery page
│   └── index.html
├── plant-donation-program/                # SEO recovery page
│   └── index.html
├── docs/
│   ├── BRAND.md
│   ├── CODE-STANDARDS.md
│   ├── CONTENT-GUIDE.md
│   ├── IMAGES.md
│   └── DEPLOYMENT.md
└── .github/
    └── pull_request_template.md
```

Protected production assets: `index.html`, `brand.html`, `sitemap.xml`,
`robots.txt`, `CNAME`, and all four SEO recovery folders. See `CLAUDE.md` §11.

### Standalone pages (confirmed status)

- **`auburn.html`** — Internal kiosk/iPad form for the Auburn Road (Hawthorn)
  studio. Not a public page. Has `noindex, nofollow` meta. Not in sitemap.
- **`montalbert.html`** — Internal kiosk/iPad form for the Mont Albert studio.
  Not a public page. Has `noindex, nofollow` meta. Not in sitemap.
- **`gardens.html`** — Live SEO asset. Uses pre-rebuild brand styles (old
  palette, old fonts). Scheduled for brand migration to the current four-font
  system — see `docs/DEPLOYMENT.md`. Do not delete.

### Note on images

The `images/` folder is in this repo. However, `index.html` references images
by **absolute URL** (`https://tinyforests.github.io/gardenerandson/images/...`)
rather than relative path (`/images/...`). A few images still load from Notion
and Substack CDNs. See `docs/IMAGES.md` for the full picture and the
recommended move to relative paths.

---

## Local preview

Static site — no build step.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

---

## Working with Claude Code

Before asking Claude Code to edit anything, it must read:

1. `CLAUDE.md`
2. `docs/BRAND.md`
3. `docs/CODE-STANDARDS.md`
4. `docs/CONTENT-GUIDE.md`
5. `docs/IMAGES.md`
6. `docs/DEPLOYMENT.md`

Safe starting prompt:

```txt
Read CLAUDE.md, README.md, and every file in /docs before making any changes.
This is the Gardener & Son leadership brand site. Preserve the brand system,
the four-font typography rules, the static GitHub Pages architecture, SEO
recovery paths, and the calm ecological studio tone. Inspect the repo first,
then propose a small branch-based plan before editing anything.
```

---

## Branch workflow

Never work directly on `main` for meaningful changes.

```bash
git checkout main
git pull origin main
git checkout -b docs/claude-governance-pack
```

Make changes, preview locally, then:

```bash
git status
git add .
git commit -m "Add Claude Code governance documentation"
git push -u origin docs/claude-governance-pack
```

Open a pull request into `main`.

---

## Deployment

Served by GitHub Pages from the configured production branch. Merging to that
branch updates the live site. **Confirm the deployment branch, custom domain,
and CNAME in GitHub settings before changing anything related to hosting.**
See `docs/DEPLOYMENT.md`.

---

## Maintainer principle

Small, careful changes. This site should feel resolved — not endlessly
tinkered with.
