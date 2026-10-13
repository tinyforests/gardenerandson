# Studio window display

Open `/studio-screen/` on the studio iMac, move the browser to the Samsung display, and click Fullscreen (or press F). The 1920 × 1080 layout scales to the screen. Arrow keys move slides; Space pauses. Controls disappear after four seconds without input. Reduced-motion settings disable fades.

## Current rotation

The base playlist mixes opening, place, gardens, after the build, studio and beginning a garden with the three wall posters. The ordered sequence repeats continuously, with projects and posters spaced between other content. Gardens has three slides, one for each project in the website's `DESIGNS` array. Three matching studio wall posters appear throughout the loop in Discover → Plant → Measure order. Each of the eleven base slides lasts 24 seconds; the selected Heirloom photograph brings the rotation to twelve slides over four minutes and 42 seconds. The posters preserve the wall artwork’s wording, green-and-beige palette, highlighted phrases and website addresses in a landscape layout.

Image-based slides use a portrait panel beside the text on a green background. `imageSide` selects `left` or `right`; the current image slides alternate sides. Panels sit 60 pixels inside the frame and clip their crops. The studio portrait keeps both founders centred within its panel, so its enlarged image cannot spill into the slide margins. Project facts and status labels, including “In design”, are retained. Review crops and footpath readability on the physical screen.

The player does not load journal headlines, features or images. It also removes journal entries from older saved playlists before restoring them, including when offline. QR scripts and QR rendering are no longer loaded; website actions remain readable, keyboard-accessible text links. Historic journal files remain in the repository but are independent of the display.

## Publishing content

Edit `playlist.json` and `photos.json` on a branch and review before merging. Increment `version` for each change. The display checks these two sources every five minutes and applies a complete, image-tested update at the end of the rotation. Each slide has a `type` (brand, statement, image, website) and `duration` in seconds (8–120). Keep titles under 110 characters, labels under 90 characters and provide meaningful `alt` for images. Image paths must be same-origin JPEG, PNG or WebP. Use `dark: true` for dark screens.

Website slides are an editorial snapshot of root `index.html`. Keep their text, facts and status labels in step with the website when editing. Each slide has a `section` and a `layout`: `hero`, `place`, `garden`, `care`, `studio`, `begin` or `poster`. `body` is limited to 240 characters, `facts` to six label/value pairs, and `emphasis` must occur in the title. Newlines create deliberate line breaks; emphasis uses italic Fraunces rendered as text.

Poster slides also specify `phase` (`discover`, `plant` or `measure`), `bodyEmphasis` (a phrase present in the body) and a footer `caption`.

The opening and place slides have no prompts or links. Their primary headlines use Abril Fatface with italic Fraunces emphasis; section headings retain Fraunces. Most other website slides have one `links` entry. The care slide contains only its headline and introductory text, with no cards or links. Destinations are restricted to the studio website, Find My EVC, Find My Ecological Garden and the Ecological Registry. The seasonal reading uses the homepage's southern-hemisphere month rules. `website-slides.js` and `website-slides.css` define these layouts.

`photos.json` selects additional studio photographs. Add local photographs, include an image entry and increment its version. Publish `"slides": []` with a new version to remove all selected photographs. Invalid entries or unavailable images retain the last working rotation.

This playlist is the selection point: working files do not automatically become public display content. Review client imagery before publication.

## Offline behaviour

Serve from HTTPS or localhost. After a successful initial installation, the service worker caches the player, layouts, fonts and images. Successful subsequent requests are also cached. A validated rotation is saved locally. Playback and refresh start independently of cache installation; offline reload requires a successful cache and retained browser data. Test this on the studio iMac before unattended use.

Include newly selected images in the service worker's `core` list and increment `CACHE` for first-install offline caching.

## Local preview and checks

From the repository root, run `python3 -m http.server 8080`, then open `http://localhost:8080/studio-screen/`. Run `node studio-screen/tests/player.cjs` for rotation, journal-removal, cache-restoration and validation checks. The site needs no build step or framework.

## iMac setup

Use an extended display and move the browser onto the Samsung. Configure the iMac to stay awake during display hours and open the page after login. Fullscreen is not a substitute for macOS power settings. The page does not change those settings.
