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

## Client layer summary

Below the headline totals, the client view shows the number of planting layers
represented and a distinct-species count for each. It uses canonical stratum
1–7: canopy, sub-canopy / tall shrubs, mid shrubs, grasses / strappy,
forbs / flowering, groundcovers, and mats / spreading woody. Repeated species
across areas count once, regardless of plant quantity. Missing classifications
are shown as Unclassified and do not increase the layer total.

## Flowering calendar

The client view lists selected species against January–December, followed by
monthly species totals. Duplicate species across areas count once. Recorded
flowering.peak and flowering.shoulder months take precedence; seedhead months
are not flowering. Where those are absent, bloom_time season/month ranges are
shown as seasonal estimates using Melbourne seasons, including ranges over
New Year. Evergreen and Inconspicuous do not imply a flowering period. Unknown
timings are named separately. Editing bloom_time supersedes older structured
timing in the client overlay. The calendar scrolls on small screens and prints.

## Planting area and density

Enter the planted bed area in m² beneath each zone heading in the studio, then
enter whole plant quantities on its plant rows. Areas autosave with the lines;
clearing an area removes its measurement. Renaming a zone keeps its measurement.
Paths, lawn and buildings are excluded. Each bed is measured once.

Studio and client views show per-zone and whole-project plants/m². The whole
project uses total entered plants divided by the sum of measured zones, and is
shown only when all zones are measured and all quantities are supplied. Missing
quantities are not treated as zero. Explicit zero quantities are valid. The
figures describe the selection and do not recommend spacing for any species.

The backend stores measurements separately in Plant Areas (project_id, area,
area_m2, updated_at). Existing rows and client tokens are unchanged. Older clients
that omit areas on save_lines preserve existing measurements.
