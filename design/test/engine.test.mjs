// node design/test/engine.test.mjs
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const Engine = createRequire(import.meta.url)('../engine.js');

let n = 0, blobs = {};
const ctx = (role = 'admin') => ({now: new Date(Date.now() + n * 1000).toISOString(), who: role, role,
  id: (p) => `${p}-${++n}`, putPhoto: (d) => { blobs['f' + n] = d; return {file_id: 'f' + n}; }, getPhoto: (id) => blobs[id]});
const db = Engine.emptyDb();
const run = (body, role) => Engine.handle(db, body, ctx(role)).res;

const p = run({op: 'create_project', name: 'Test garden'}).project;
assert.equal(p.stage, 'enquiry');
assert.equal(run({op: 'queue', agent: 'intake'}, 'agent').requests.length, 1, 'new project asks intake');

// agents can draft but not edit
assert.equal(run({op: 'save_stage', project_id: p.id, stage: 'site', fields: {x: 1}}, 'agent').ok, false);
const req = run({op: 'queue'}, 'agent').requests[0];
run({op: 'claim', request_id: req.request_id}, 'agent');
assert.equal(run({op: 'queue'}, 'agent').requests.length, 0, 'claimed asks are hidden');
const g = run({op: 'post_ghost', request_id: req.request_id, project_id: p.id, stage: 'enquiry', agent: 'intake',
  summary: 'From the email', fields: {client_name: 'A', email: 'a@b.c'}}, 'agent').ghost;
assert.equal(db.projects[0].data.enquiry, undefined, 'ghost does not touch the record');
assert.equal(run({op: 'queue', include_claimed: true}).requests.length, 0, 'ghost closes its ask');

// accept only ticked fields
run({op: 'resolve_ghost', ghost_id: g.ghost_id, action: 'accept', keys: ['client_name']});
assert.deepEqual(db.projects[0].data.enquiry, {client_name: 'A'});
assert.equal(run({op: 'resolve_ghost', ghost_id: g.ghost_id, action: 'dismiss'}).ok, false, 'resolved once');

// done advances and asks the next agent: the loop
const s = run({op: 'set_status', project_id: p.id, stage: 'enquiry', status: 'done'}).project;
assert.equal(s.stage, 'site');
assert.equal(s.status.site, 'active');
const q = run({op: 'queue'}).requests;
assert.equal(q.length, 1); assert.equal(q[0].agent, 'site'); assert.equal(q[0].project_name, 'Test garden');

// a second ask to the same agent joins the first
run({op: 'ask', project_id: p.id, stage: 'site', ask: 'Read the photos'});
assert.equal(run({op: 'queue'}).requests.length, 1);
assert.match(run({op: 'queue'}).requests[0].ask, /Read the photos/);

// photos
const ph = run({op: 'add_photo', project_id: p.id, data: 'data:image/jpeg;base64,AAAA', name: 'a.jpg'}).photo;
assert.equal(run({op: 'get_photo', photo_id: ph.photo_id}, 'agent').data, 'data:image/jpeg;base64,AAAA');
assert.equal(run({op: 'add_photo', project_id: p.id, data: 'x'}, 'agent').ok, false, 'agents cannot add photos');

// last stage done does not run off the end
['site', 'brief', 'ecology', 'palette', 'presentation', 'estimate', 'install', 'registry']
  .forEach((k) => run({op: 'set_status', project_id: p.id, stage: k, status: 'done'}));
assert.equal(db.projects[0].stage, 'registry');
assert.equal(run({op: 'nope'}).ok, false);
console.log('engine: all checks passed');
