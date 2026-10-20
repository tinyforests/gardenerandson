# Plant Studio

Internal studio: https://www.gardenerandson.com/plants/studio.html
Client lists: https://www.gardenerandson.com/plants/view.html?p=TOKEN

Static pages, no build step. Both have noindex metadata and are omitted from
public navigation and the sitemap. The studio uses the existing Registry admin
key; enter it again on this domain because browser storage is origin-specific.
Client links are generated on the studio origin. Existing Registry client links
continue to work.

## Shared library and backend

The canonical source remains tinyforests/plants. Its published public library at
https://ecologicalregistry.org/data/plant-library.json is read by both sites;
Gardener & Son does not maintain a second snapshot. GitHub Pages permits
cross-origin reads. Plant Studio edits are overlaid immediately and reach the
published library through the existing plants sync pipeline.

The existing Registry Apps Script backend and deployment URL remain unchanged.
Projects, selections, private notes and edits stay in the existing spreadsheet;
no project migration or new deployment is needed. Backend sources and tests
remain in tinyforests/reg under scripts/appsscript and scripts/test_plant_studio.cjs.

## Photos

This move does not migrate Notion photos. image_url and image_credit fields are
supported; durable image migration from Notion remains separate work.

## Preview

Run python3 -m http.server 8080 at the repo root. Open
/plants/studio.html?mock=1 for a local-only project workflow. Mock data is stored
in this browser origin and never sent to Apps Script. Generated client mock links retain mock=1 automatically.

## Ownership

Gardener & Son owns these frontend pages. Registry keeps its current pages for
existing links, plus the shared backend and public library. This addition does
not change the homepage, DNS, CNAME, or Pages settings.
