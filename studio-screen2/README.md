# Studio window display — Field Guide edition

A second window rotation that reads the Field Guide (guide.gardenerandson.com) section by section. Same 1920 × 1080 stage, fonts, logo, label rule and headline scale as `/studio-screen/`.

Open `/studio-screen2/` on the studio iMac and press F for fullscreen. Arrow keys move slides; Space pauses. `?slide=N` starts at a given slide for checking.

## Content

Text is fetched live from `https://guide.gardenerandson.com/slides.json` (repo `tinyforests/booklet`) every five minutes; changes apply at the end of the rotation. If the guide is unreachable, the last good copy in the browser is kept, then the bundled `guide.json`. Refresh `guide.json` occasionally:

    cp ../booklet/slides.json studio-screen2/guide.json

`*word*` in a heading renders as italic Fraunces in Signal Green. The guide's "Enter" screen is replaced by a Field Guide opener; the Acknowledgement of Country is shown as written in the guide, full width.

## Type

- Opener: Abril 168px (hero only, per CLAUDE.md).
- Section headings: Fraunces at 168 / 140 / 120px by heading length.
- Body: Plex Sans 36px/1.35, shrinking to no smaller than 28px if a passage would overflow.
- Labels and footer: Plex Mono 24px.

Sections alternate green and beige. Each slide shows for 20–45 seconds depending on text length (about 15 minutes per full rotation).
