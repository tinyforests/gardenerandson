# Deployment guide

## Production model

The site is served through **GitHub Pages** from
`https://github.com/tinyforests/gardenerandson`, on the custom domain set in the
`CNAME` file.

> **[VERIFY] Confirm in GitHub → Settings → Pages:**
> - the exact production branch (commonly `main`);
> - that the custom domain there matches the `CNAME` file contents.

---

## Canonical domain — decided

```txt
CANONICAL DOMAIN: https://www.gardenerandson.com
DECIDED BY: Tyson   DATE: 2026-05-27
```

The canonical form is **`www.gardenerandson.com`**. All canonical tags, Open
Graph URLs, internal links, and `sitemap.xml` entries use this form. GitHub
Pages redirects the apex domain to `www` once the custom domain is configured
with the `www` form in Settings → Pages.

Previously there was a mismatch: `index.html` used `www` in its canonical tag
but the footer brand-book link pointed to the apex domain. That inconsistency
was resolved in the `seo/canonical-domain` branch (2026-05-27).

---

## Standard workflow

```bash
cd ~/Projects/gardenerandson

git checkout main
git pull origin main
git checkout -b content/your-change-name
```

Edit, then preview locally (static site, no build step):

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Check:

- homepage loads;
- mobile layout is acceptable;
- both themes work if global styles were touched, including the three beige
  (`.section.light`) sections;
- SEO recovery pages load (if touched);
- links work; images load;
- no console errors from edited scripts.

Then:

```bash
git status
git add .
git commit -m "Describe the change clearly"
git push -u origin content/your-change-name
```

Open a pull request into `main`.

---

## Pull request checklist

Every PR confirms:

- brand system preserved (tokens, four-font rules — Abril hero-only);
- no unapproved fonts or colours;
- SEO metadata preserved; canonical URL correct and consistent;
- sitemap and robots considered;
- local preview checked, mobile checked;
- both themes checked if global styles changed;
- images compressed, hosted in the studio-controlled location, alt text where
  applicable;
- the Acknowledgement of Country is unchanged;
- no placeholder copy or abandoned experiments remain.

---

## Emergency fixes

Direct commits to `main` should be rare. Acceptable only for:

- a broken production link;
- a wrong phone / email / contact detail;
- an urgent SEO path fix;
- a broken form endpoint.

Even then: make the smallest possible change, and document it immediately
afterward (a note in the next PR or an issue).

---

## Resolving the index2.html duplicate

The repository currently contains **both** `index.html` and `index2.html`.
`index2.html` is the brand-aligned rebuild (four-font system, brass accent,
beige sandwich, Acknowledgement of Country). Two near-identical homepages in
production is an SEO hazard — search engines may index both, splitting ranking
signals, and maintainers will not know which is canonical.

This must be resolved with one focused PR. The intended end state is a single
`index.html` and no `index2.html`.

Procedure:

1. Confirm which file is the intended live homepage. (It is `index2.html` — the
   brand-aligned rebuild.)
2. On a branch: replace the contents of `index.html` with the contents of
   `index2.html`, then delete `index2.html`.
3. Search the whole repo for any link to `index2.html` and repoint it to `/`
   or `index.html`. Check `sitemap.xml` does not list `index2.html`.
4. Confirm `sitemap.xml` lists the homepage once, as the canonical URL.
5. Preview locally, then PR.

Until this is done, treat `index.html` as the live page and `index2.html` as
pending promotion — do not edit both.

## SEO recovery paths (confirmed)

These four folders exist in the repo and are live recovery pages for URLs that
earlier site versions had indexed:

```txt
/ecological-garden-design-melbourne/
/garden-design/
/garden-installation/
/plant-donation-program/
```

Each is a protected production asset. Do not delete or rename one without a
proper redirect or replacement strategy, or you will create 404s on URLs Google
already knows.

## Standalone pages of unconfirmed status

`gardens.html`, `auburn.html`, and `montalbert.html` sit at the repo root.

> **[VERIFY]** For each, confirm: is it a live, linked, intended page — or a
> superseded draft? `gardens.html` was last touched four months ago, well
> before the current rebuild, which suggests it may be stale. Once confirmed,
> either document each as a real page (in `README.md`) or remove it on a
> cleanup branch. Do not leave undocumented pages in a brand-critical repo.

---

## DNS and domain caution

Do not change any of the following casually — each affects the public brand
site and its search visibility:

- the `CNAME` file;
- the GitHub Pages custom domain;
- DNS records;
- the canonical URL;
- `www` vs apex domain handling.

Any change here is a deliberate, reviewed decision — never a side effect of
another task.
