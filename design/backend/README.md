# Design Studio backend

A Google Apps Script web app on the Gardener & Son Google Workspace. Free: no server, no
subscription. Data lives in one Google Sheet you can open and read; photos in one Drive folder.

## Deploy (about 10 minutes, once)

1. Sign in as hello@gardenerandson.com. Create a new Google Sheet named **G&S Design Studio**.
2. Extensions → Apps Script. Add two files:
   - `Code.gs` — paste `design/backend/Code.gs`
   - `engine.gs` — paste `design/engine.js` unchanged
3. Project Settings → Script properties → add `ADMIN_TOKEN` with the **same value as the Plant
   Studio admin key**, so one sign-in opens both studios.
4. Run `setup` once (Run ▸ setup) and approve the permissions. The log prints the
   `AGENT_TOKEN` for the iMac.
5. Deploy → New deployment → Web app. Execute as **Me**, access **Anyone**. Copy the `/exec` URL.
6. In `design/index.html`, set `var ENDPOINT = '<the /exec URL>';` and merge.
7. On the studio iMac, write `~/.gs-design.json`:
   ```json
   {"endpoint": "<the /exec URL>", "agent_token": "<AGENT_TOKEN>", "runner": "studio-imac"}
   ```
   Test with `node design/agents/gs.mjs queue`.

"Anyone" access is safe because every request must carry the admin or agent token. The agent
token can read and write drafts only; it cannot change a project.

## Updating the rules

The rules live in `design/engine.js`. After changing it, re-paste it into `engine.gs` and
Deploy → Manage deployments → edit → New version (the URL stays the same). Run
`node design/test/engine.test.mjs` first.
