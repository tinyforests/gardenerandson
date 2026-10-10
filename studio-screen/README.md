# Studio window display

Open `/studio-screen/` on the studio iMac, move the browser to the Samsung display, and click Fullscreen (or press F). The 1920 × 1080 layout scales to the screen. Arrow keys move slides; Space pauses. Controls disappear after four seconds without input. Reduced-motion settings disable fades.

## Publishing content

Edit `playlist.json` on a branch and review before merging. Increment `version` for each change. The display checks the published JSON every five minutes and applies a complete, image-tested update at the end of the rotation. Each slide has a `type` (brand, statement, image) and `duration` in seconds (8–120). Keep titles short (maximum 110 characters), labels under 90 characters and provide meaningful `alt` for images. Image paths are relative to this folder and must be same-origin JPEG, PNG or WebP. Use `dark: true` for dark statement screens.

The first images are Maylands proposal visuals, explicitly labelled as proposals. Review crops and readability on the physical screen from the footpath. Avoid publishing private client material without clearance. This playlist is the selection point: working files do not automatically become public display content.

## Offline behaviour

Serve from HTTPS or localhost (not by double-clicking the HTML file). After a successful initial cache installation, the service worker saves the page, fonts and starter images. Subsequent successful requests are also cached. A validated playlist is saved locally. If an update has missing images or malformed data, the last usable rotation continues. Offline use requires the browser's stored data to remain intact; test it on the studio iMac before unattended use.

## Local preview

From the repository root, run `python3 -m http.server 8080`, then open `http://localhost:8080/studio-screen/`.

## iMac setup

Use an extended display and move the browser onto the Samsung. Configure the iMac to remain awake during display hours and open this page after login. Fullscreen and a wake-lock are not substitutes for the macOS power settings. No iMac settings are changed by this page.

## Further sources

The Gardener & Son journal and selected GitHub images are connected. Instagram and external photo libraries are not connected yet. Future importers should produce this same playlist plus studio-hosted images, with an explicit selection or approval step. Do not embed expiring social-media image URLs or expose account credentials. The website needs no framework or build step.

## Connected journal and GitHub photos

`photos.json` selects images already in GitHub. Add studio photographs to `studio-screen/photos/`, then add an image entry and increment the photo playlist version. Selected photographs join the rotation automatically after publication.

To remove all selected studio photographs, publish `photos.json` with a new version and `"slides": []`. The base garden images continue playing. Invalid photo entries still reject the update and retain the saved rotation.

Journal headlines are placed after photographs through the rotation. If there are no photographs, they are distributed after base slides; any remaining headlines are retained at the end. Each article with a `source` shows a QR code and readable article link. Sources must be HTTPS article URLs on `gardenerandson.substack.com/p/`. QR codes are generated locally using the bundled MIT-licensed `qrcode-generator` library (Kazuhiko Arase, `vendor/qrcode.js`); no external QR service or build step is required. Check scanning distance through the studio window on the physical screen.

Playback and refresh start independently of service-worker installation. If offline cache installation fails, online content can still load; offline reload requires a successfully installed cache. The cache includes the QR library.

`import-journal.py` reads the public Gardener & Son Substack RSS feed and stores the latest three suitable published headlines in `journal.json`. It imports titles only, not full articles or remote images. The scheduled GitHub Actions workflow runs hourly after this branch is merged into the default branch; GitHub schedules can be delayed. It commits only changes to this generated file. Repository policy must permit its contents-write token to push; if branch protection prevents that, configure an approved publishing identity before enabling the workflow. No live scheduler has been enabled by this draft PR.

The player checks the generated journal JSON on the main branch via GitHub's raw endpoint, so journal updates do not depend on triggering a GitHub Pages rebuild. If unavailable, it uses the local published snapshot. All three sources are combined and checked before replacing the saved rotation. Local source and photo updates still require normal GitHub Pages publication.

To refresh manually: `python3 studio-screen/import-journal.py` from the repository root. Never put Instagram or other account tokens into this public repository.
