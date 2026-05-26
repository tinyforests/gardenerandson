# Project setup for Claude Code

A one-time guide to get this repository onto a machine and into Claude Code.
This file documents the setup process; it is not part of the site.

---

## 1. The repository

The repository is `https://github.com/tinyforests/gardenerandson`, served by
GitHub Pages on the custom domain in its `CNAME` file.

---

## 2. Clone the repo

```bash
mkdir -p ~/Projects
cd ~/Projects

git clone https://github.com/tinyforests/gardenerandson.git
cd gardenerandson
```

---

## 3. Add the governance pack

Place the governance files so the repository looks like this:

```txt
CLAUDE.md
README.md
PROJECT-SETUP.md
.gitignore
docs/
├── BRAND.md
├── CODE-STANDARDS.md
├── CONTENT-GUIDE.md
├── IMAGES.md
└── DEPLOYMENT.md
.github/
└── pull_request_template.md
```

`CLAUDE.md`, `README.md`, `PROJECT-SETUP.md`, and `.gitignore` go at the repo
root. The five guides go in `docs/`. The PR template goes in `.github/`.

---

## 4. Create a branch

```bash
git checkout main
git pull origin main
git checkout -b docs/claude-governance-pack
```

---

## 5. Preview the site locally

Static site, no build step:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

---

## 6. Open in Claude Code

From the repo root:

```bash
claude
```

First prompt to give Claude Code:

```txt
Read CLAUDE.md, README.md, and every file in /docs before making any changes.
This is the Gardener & Son leadership brand site and must be governed
carefully. Inspect the current repository structure, then summarise: the site
architecture, the protected files, any [VERIFY] items still unresolved, and
your proposed next actions. Do not edit any production file until you have a
small, branch-based plan and I have accepted it.
```

---

## 7. Commit the documentation pack

```bash
git status
git add CLAUDE.md README.md PROJECT-SETUP.md .gitignore docs .github
git commit -m "Add Claude Code governance documentation"
git push -u origin docs/claude-governance-pack
```

Then open a pull request into `main` on GitHub.

---

## 8. Resolve the open items

The repository contents are now confirmed, which clears most earlier unknowns.
These items remain and should be worked through early:

**Blocking / high priority:**

- **Resolve the `index2.html` duplicate.** Promote the brand-aligned rebuild to
  `index.html` and delete `index2.html`. Procedure in `docs/DEPLOYMENT.md`.
- **Decide the canonical domain** — `www` vs apex. `index.html` uses `www`; the
  footer brand-book link uses the apex. Pick one, apply it everywhere
  (canonical tag, OG URLs, internal links, `sitemap.xml`, `CNAME`), record it
  in `docs/DEPLOYMENT.md`.

**Should confirm:**

- **Status of `gardens.html`, `auburn.html`, `montalbert.html`** — live pages,
  or stale drafts to remove? `gardens.html` is four months old. Document or
  delete each.
- The exact GitHub Pages production branch (Settings → Pages).

**Improvement, not urgent:**

- Migrate `index.html` image references from the absolute
  `tinyforests.github.io/...` URL to relative `/images/...` paths.
- Pull the remaining Notion and Substack CDN images into the repo's `images/`
  folder and update the references.

As each is resolved, edit the relevant doc to remove the `[VERIFY]` flag and
record the decision. After that, the documentation is fully trustworthy.
