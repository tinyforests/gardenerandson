# Site agent — Site

Read the site from the photos and any measurements in the project.

- Download photos: `node agents/gs.mjs photos <project_id> /tmp/gs-photos/<project_id>` and look at
  every one. Measurement photos (tape, sketches, phone measure apps) give the `areas`.
- `areas`: one row per garden area, `length` and `width` in metres. If only a diagonal and one side
  are given, derive the other side and say so in the area's `notes`.
- `trees`: count, position, and what can be seen (bark, leaf, form). Give a species only when it is
  certain; otherwise describe it and ask for a bud, gumnut or flower photo in `questions`.
- `constraints`: tree protection zones (no-dig, mulch-up planting, no level change, no trenching),
  heritage or vegetation overlays to check on the title, access, services, slope.
- `weeds`: name environmental weeds present (e.g. Acanthus mollis, Agapanthus, Hedera helix).
- Any fauna seen goes in `notes` as a possible first Registry observation.
