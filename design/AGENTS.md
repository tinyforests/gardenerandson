# Design Studio — the ghost loop

This is the operating contract for any agent (Claude, Claude Code, Codex) that works on
Gardener & Son garden projects through the Design Studio at
`www.gardenerandson.com/design/`.

## The loop

```
  studio fills a stage ──► "Mark done" ──► next stage's agent is asked ─┐
        ▲                                                              │
        │                                                              ▼
  Accept / edit / dismiss ◄── ghost draft appears in the app ◄── agent runs, drafts
        │
        └── "Ask the ghost" on any stage adds an ask at any time
```

1. Every garden is a project with nine stages: Enquiry, Site, Brief, Ecology, Palette,
   Presentation, Estimate, Install, Registry.
2. An **ask** is a request for one agent to draft one stage of one project. Asks are created
   when a stage is marked done (the next stage's agent is asked automatically) or when
   Tyson or Natasha press *Ask the ghost*.
3. An agent run takes open asks from the queue, does the work, and posts a **ghost draft**.
4. A ghost is a proposal. Nothing in it reaches the project until a person accepts it, field
   by field. Dismissed ghosts are kept for the record.

## Hard rules

- **Draft only.** Agents never send an email, publish a page, push to `main`, place an order or
  enrol a garden. Emails go to Gmail as drafts from **hello@gardenerandson.com**; pages go up as
  pull requests or unpublished artifacts, linked in the ghost.
- **Say what you don't know.** If a fact is unconfirmed (a tree species from a blurry photo, a
  street number), put it in `questions`, not in a field as if it were true.
- **One ghost per ask.** Post exactly one ghost per ask and pass its `request_id`; that closes it.
- **Field keys are fixed.** Write only the keys listed for the stage below. Anything else goes in
  `notes`.
- **Studio practice.** G&S doesn't produce planting or placement plans; planting is set out on
  site. Give species, plants per m² and approximate quantities. Use "steward", not "homeowner";
  "indigenous plants of place", not "native" alone. Australian spelling.
- **Privacy.** Client details stay in the Design Studio and Gmail. Never write a client name,
  address or phone into a public repo, commit message or published page.

## Running the ghosts

On the studio iMac, from this folder:

```bash
node agents/gs.mjs queue
```

For each ask, oldest first:

1. `node agents/gs.mjs claim <request_id>`
2. `node agents/gs.mjs show <project_id>`, and `photos <project_id> /tmp/gs-photos/<project_id>`
   if the stage needs them.
3. Read the brief for that agent in `agents/<agent>.md` and do the work.
4. Write the draft to a JSON file and `node agents/gs.mjs ghost draft.json`.

The draft file:

```json
{
  "request_id": "REQ-…",
  "project_id": "GD-…",
  "stage": "site",
  "agent": "site",
  "summary": "One line, shown as the ghost's heading",
  "fields": {"trees": "…", "constraints": "…"},
  "notes": "Anything useful that has no field",
  "questions": ["What the studio needs to confirm"]
}
```

`summary` is required. `fields` may be empty when the ask was for an email draft or a check.

To run unattended, a scheduled task on the iMac can say: *Run the Design Studio ghosts — follow
design/AGENTS.md in ~/Projects/gardenerandson.* It finishes when the queue is empty.

## Agents and their stages

| Agent | Drafts | Brief |
|---|---|---|
| Intake | Enquiry, Brief | `agents/intake.md` |
| Site | Site | `agents/site.md` |
| Ecology | Ecology | `agents/ecology.md` |
| Palette | Palette, Presentation | `agents/palette.md` |
| Estimate | Estimate | `agents/estimate.md` |
| Comms | Any stage — emails to stewards | `agents/comms.md` |
| Steward | Registry | `agents/steward.md` |

## Field keys by stage

| Stage | Keys |
|---|---|
| enquiry | `client_name`, `email`, `phone`, `address`, `lga`, `source`, `notes` |
| site | `areas` (list of `{name, length, width, m2?, notes?}` in metres), `aspect`, `trees`, `soil`, `existing`, `weeds`, `constraints` |
| brief | `purpose`, `feel`, `musts`, `avoid`, `care`, `budget`, `timing`, `wgb` |
| ecology | `evc_code`, `evc_name`, `bioregion`, `reference`, `habitat`, `observations` |
| palette | `plant_project_id`, `approach`, `density` |
| presentation | `deck_url`, `sheets_url`, `site_url`, `presented_on`, `feedback` |
| estimate | `days`, `total`, `estimate_url`, `sent_on`, `accepted_on`, `notes` |
| install | `start`, `finish`, `changes`, `notes` |
| registry | `garden_id`, `enrolled_on`, `notes` |

Dates are `YYYY-MM-DD`. Photos are added by people in the app; agents read them with `photos`.

## Where things connect

- **Plant Studio** (`/plants/studio.html`): the palette. A project's `palette.plant_project_id`
  is a Plant Studio project; the site areas become its zones. Plants come from the canonical
  library (tinyforests/plants, published at ecologicalregistry.org/data/plant-library.json).
- **Find My EVC**: the EVC for an address (Ecology agent).
- **gs-install-estimate skill**: person-days and pricing (Estimate agent).
- **Ecological Registry** (tinyforests/reg): enrolment after install (Steward agent).
- **Where Gardens Begin**: the client's own brief, when they have filled it in (Intake agent).
