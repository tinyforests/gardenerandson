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

Blogs, Instagram and photo libraries are not connected in this version. Future importers should produce this same playlist plus studio-hosted images, with an explicit selection or approval step. Do not embed expiring social-media image URLs or expose account credentials. The website needs no framework or build step.
