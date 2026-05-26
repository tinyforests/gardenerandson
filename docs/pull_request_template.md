# Pull request

## What this changes

<!-- One or two sentences. One concern per PR. -->

## Type

- [ ] Content
- [ ] Design refinement
- [ ] Fix
- [ ] SEO
- [ ] Documentation
- [ ] Feature

## Brand & code checklist

- [ ] I read `CLAUDE.md` and the relevant `/docs` files.
- [ ] The page still feels unmistakably like Gardener & Son.
- [ ] Brand tokens used — no stray hard-coded colours outside `:root`.
- [ ] Abril Fatface appears only in the hero; all other headings are Fraunces.
- [ ] No unapproved fonts.
- [ ] `border-radius` is still `0`; no SaaS-style rounding crept in.
- [ ] Headings are sentence case (section headings keep their full stop).
- [ ] Button labels begin with a capital letter.

## Technical checklist

- [ ] Site still loads with no build step.
- [ ] Semantic HTML and accessibility basics preserved (focus, contrast,
      labels, keyboard).
- [ ] Local preview checked (`python3 -m http.server 8080`).
- [ ] Mobile layout checked.
- [ ] Light and dark themes checked (if global styles were touched), including
      the three beige `.section.light` sections.
- [ ] No broken links; images load.
- [ ] SEO metadata intact; canonical URL correct and consistent.
- [ ] Sitemap / robots considered (if relevant).

## Protected content

- [ ] The Acknowledgement of Country is unchanged.
- [ ] No SEO recovery path was renamed or removed without a redirect plan.
- [ ] No DNS / `CNAME` / custom-domain change (or, if there is one, it is
      called out explicitly below and was a deliberate decision).

## Notes for the reviewer

<!-- Anything specific to check. Screenshots welcome for visual changes. -->
