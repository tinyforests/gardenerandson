#!/usr/bin/env node
/* gs — the Design Studio command line for agents.
 *
 * Agents read everything and write drafts (ghosts). They cannot change a project record.
 *
 * Config: GS_DESIGN_ENDPOINT and GS_AGENT_TOKEN, or ~/.gs-design.json {"endpoint": "...", "agent_token": "..."}.
 *
 *   node gs.mjs queue [agent]                 open asks, oldest first
 *   node gs.mjs show <project_id>             the whole project as JSON
 *   node gs.mjs claim <request_id> [runner]   mark an ask as being worked on
 *   node gs.mjs photos <project_id> <dir>     download the project's photos
 *   node gs.mjs ghost <draft.json>            post a ghost draft (closes its ask)
 *   node gs.mjs note <project_id> <text>      add a line to the activity log
 */
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';

function config() {
  let file = {};
  const p = join(homedir(), '.gs-design.json');
  if (existsSync(p)) file = JSON.parse(readFileSync(p, 'utf8'));
  const endpoint = process.env.GS_DESIGN_ENDPOINT || file.endpoint;
  const token = process.env.GS_AGENT_TOKEN || file.agent_token;
  if (!endpoint || !token) {
    console.error('Set GS_DESIGN_ENDPOINT and GS_AGENT_TOKEN, or write ~/.gs-design.json');
    process.exit(2);
  }
  return {endpoint, token, runner: process.env.GS_RUNNER || file.runner || 'imac'};
}

async function call(op, data = {}) {
  const c = config();
  const res = await fetch(c.endpoint, {
    method: 'POST',
    body: JSON.stringify({op, agent_token: c.token, runner: data.runner || c.runner, ...data}),
    redirect: 'follow'
  });
  const d = await res.json();
  if (!d.ok) throw new Error(d.error || 'Request failed');
  return d;
}

const out = (o) => console.log(JSON.stringify(o, null, 2));
const [cmd, ...args] = process.argv.slice(2);

try {
  switch (cmd) {
    case 'queue': {
      const d = await call('queue', args[0] ? {agent: args[0]} : {});
      out(d.requests);
      break;
    }
    case 'show': {
      const d = await call('get_project', {project_id: args[0]});
      delete d.ok;
      out(d);
      break;
    }
    case 'claim':
      out((await call('claim', {request_id: args[0], runner: args[1]})).request);
      break;
    case 'photos': {
      const [id, dir] = args;
      const d = await call('get_project', {project_id: id});
      mkdirSync(dir, {recursive: true});
      for (const ph of d.photos) {
        const p = await call('get_photo', {photo_id: ph.photo_id});
        const m = /^data:[^;]+;base64,(.*)$/.exec(p.data || '');
        if (!m) continue;
        const name = `${ph.photo_id}-${(ph.name || 'photo.jpg').replace(/[^\w.-]+/g, '_')}`;
        writeFileSync(join(dir, name), Buffer.from(m[1], 'base64'));
        console.log(join(dir, name) + (ph.caption ? `  — ${ph.caption}` : ''));
      }
      break;
    }
    case 'ghost': {
      const draft = JSON.parse(readFileSync(args[0], 'utf8'));
      out((await call('post_ghost', draft)).ghost);
      break;
    }
    case 'note':
      await call('note', {project_id: args[0], what: args.slice(1).join(' ')});
      console.log('noted');
      break;
    default:
      console.log(readFileSync(new URL(import.meta.url)).toString().split('*/')[0]);
      process.exit(cmd ? 1 : 0);
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
