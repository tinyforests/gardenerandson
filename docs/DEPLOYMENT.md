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

## index2.html — resolved

`index2.html` has been deleted. `index.html` is the single live homepage.
No further action needed.

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

## Standalone pages (confirmed status)

### auburn.html and montalbert.html — internal kiosk forms

Both pages are internal iPad/kiosk contact forms used in-studio at the
Hawthorn (Auburn Road) and Mont Albert locations respectively. They are not
public pages and should never appear in search results.

- `<meta name="robots" content="noindex, nofollow">` is present in both.
- Neither appears in `sitemap.xml`.
- Do not add either to the sitemap or public navigation.
- Brand migration is not required — these are internal tools, not public assets.

### gardens.html — live SEO asset, pre-rebuild styles

`gardens.html` is a live public page and an SEO asset. It uses the pre-rebuild
brand system (old palette, old fonts — not the current four-font token system).

**Scheduled for brand migration** to the current system (Abril Fatface hero
only, Fraunces for all h2/h3, IBM Plex Sans body, IBM Plex Mono labels;
`--green`, `--beige`, `--accent`, `--clay` tokens). Until that migration is
done:

- Do not delete or unpublish it.
- Do not edit its content without also noting the pending migration.
- Do not treat its styles as a reference for anything — use `index.html` as
  the style reference.

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
