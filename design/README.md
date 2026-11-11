# Design Studio

Internal studio: https://www.gardenerandson.com/design/ (noindex, not in navigation or the sitemap).

Every garden from first enquiry to the Ecological Registry, in nine stages. People fill stages in;
agents on the studio iMac draft them as **ghosts** for people to accept. The palette stage hands
over to Plant Studio (`/plants/studio.html`), which shares the admin key.

- `index.html` — the app. No build step. `ENDPOINT` empty, or `?mock=1`, runs a demo kept in the browser.
- `engine.js` — the rules (stages, asks, ghosts, the loop). Shared by the app, the backend and the tests.
- `backend/` — Apps Script web app on a Google Sheet + Drive folder. Deploy steps in `backend/README.md`.
- `AGENTS.md` — the ghost loop contract for Claude, Claude Code and Codex. Briefs per agent in `agents/`.
- `agents/gs.mjs` — the command line agents use. `test/engine.test.mjs` — run before changing the rules.

Client data never lives in this repo: it is in the Sheet and Drive, behind the admin key.
