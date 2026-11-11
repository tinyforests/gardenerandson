/* Design Studio engine — the one copy of the project/ghost/queue rules.
 *
 * Runs in three places, unchanged:
 *   - design/index.html (demo mode, db kept in this browser)
 *   - the Apps Script backend (paste this file in as engine.gs; Code.gs stores the db in a Sheet)
 *   - node, for tests (design/test/engine.test.mjs)
 *
 * The db is plain data: {projects:[], ghosts:[], requests:[], events:[], photos:[]}.
 * handle() mutates it and says which tables changed, so the adapter only writes those.
 */
var Engine = (function () {
  'use strict';

  var AGENTS = {
    intake: 'Intake',
    site: 'Site',
    ecology: 'Ecology',
    palette: 'Palette',
    estimate: 'Estimate',
    comms: 'Comms',
    steward: 'Steward'
  };

  // Stage keys, order and the agent that drafts each one. Field definitions live in the app.
  var STAGES = [
    {key: 'enquiry', title: 'Enquiry', agent: 'intake'},
    {key: 'site', title: 'Site', agent: 'site'},
    {key: 'brief', title: 'Brief', agent: 'intake'},
    {key: 'ecology', title: 'Ecology', agent: 'ecology'},
    {key: 'palette', title: 'Palette', agent: 'palette'},
    {key: 'presentation', title: 'Presentation', agent: 'palette'},
    {key: 'estimate', title: 'Estimate', agent: 'estimate'},
    {key: 'install', title: 'Install', agent: 'comms'},
    {key: 'registry', title: 'Registry', agent: 'steward'}
  ];

  function stageIndex(key) {
    for (var i = 0; i < STAGES.length; i++) if (STAGES[i].key === key) return i;
    return -1;
  }

  function fail(msg) { var e = new Error(msg); e.userFacing = true; throw e; }
  function need(v, name) { if (v === undefined || v === null || v === '') fail('Missing ' + name); return v; }
  function find(rows, key, id) {
    for (var i = 0; i < rows.length; i++) if (rows[i][key] === id) return rows[i];
    return null;
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function blankProject(id, name, now) {
    var status = {};
    STAGES.forEach(function (s, i) { status[s.key] = i === 0 ? 'active' : 'todo'; });
    return {id: id, name: name, stage: STAGES[0].key, status: status, data: {},
      created_at: now, updated_at: now, archived: false};
  }

  function log(db, ctx, projectId, what) {
    db.events.push({at: ctx.now, project_id: projectId, who: ctx.who, what: what});
  }

  function summary(db, p) {
    var d = p.data || {}, enq = d.enquiry || {};
    return {
      id: p.id, name: p.name, stage: p.stage, archived: !!p.archived, updated_at: p.updated_at,
      client: enq.client_name || '', address: enq.address || '',
      ghosts: db.ghosts.filter(function (g) { return g.project_id === p.id && g.state === 'open'; }).length,
      asks: db.requests.filter(function (r) { return r.project_id === p.id && r.state !== 'done'; }).length
    };
  }

  function enqueue(db, ctx, projectId, stage, agent, ask) {
    if (!AGENTS[agent]) fail('Unknown agent ' + agent);
    if (stageIndex(stage) < 0) fail('Unknown stage ' + stage);
    // One open request per project/stage/agent: a second ask joins the first.
    var open = db.requests.filter(function (r) {
      return r.project_id === projectId && r.stage === stage && r.agent === agent && r.state !== 'done';
    })[0];
    if (open) {
      if (ask && open.ask.indexOf(ask) < 0) open.ask = open.ask ? open.ask + '\n\n' + ask : ask;
      return open;
    }
    var r = {request_id: ctx.id('REQ'), project_id: projectId, stage: stage, agent: agent,
      ask: ask || '', state: 'open', created_at: ctx.now, created_by: ctx.who, claimed_by: '', claimed_at: ''};
    db.requests.push(r);
    log(db, ctx, projectId, 'Asked the ' + AGENTS[agent] + ' ghost for ' + stage + (ask ? ': ' + ask : ''));
    return r;
  }

  var ops = {
    list_projects: function (db) {
      return {projects: db.projects.map(function (p) { return summary(db, p); })};
    },

    get_project: function (db, b) {
      var p = find(db.projects, 'id', need(b.project_id, 'project_id')) || fail('No such project');
      return {
        project: p,
        ghosts: db.ghosts.filter(function (g) { return g.project_id === p.id; }),
        requests: db.requests.filter(function (r) { return r.project_id === p.id && r.state !== 'done'; }),
        events: db.events.filter(function (e) { return e.project_id === p.id; }).slice(-60),
        photos: db.photos.filter(function (x) { return x.project_id === p.id; })
      };
    },

    create_project: function (db, b, ctx) {
      var p = blankProject(ctx.id('GD'), need(b.name, 'name'), ctx.now);
      if (b.data) p.data = b.data;
      db.projects.unshift(p);
      log(db, ctx, p.id, 'Project started');
      enqueue(db, ctx, p.id, 'enquiry', 'intake', b.ask || '');
      return {project: p, dirty: ['projects', 'requests', 'events']};
    },

    // Save one stage's fields. Only the keys sent are changed.
    save_stage: function (db, b, ctx) {
      var p = find(db.projects, 'id', need(b.project_id, 'project_id')) || fail('No such project');
      var stage = need(b.stage, 'stage');
      if (stageIndex(stage) < 0) fail('Unknown stage ' + stage);
      var cur = p.data[stage] = p.data[stage] || {};
      Object.keys(b.fields || {}).forEach(function (k) { cur[k] = b.fields[k]; });
      if (b.name) p.name = b.name;
      p.updated_at = ctx.now;
      log(db, ctx, p.id, 'Saved ' + stage);
      return {project: p, dirty: ['projects', 'events']};
    },

    // done → next stage becomes active and its agent is queued. This is the loop.
    set_status: function (db, b, ctx) {
      var p = find(db.projects, 'id', need(b.project_id, 'project_id')) || fail('No such project');
      var stage = need(b.stage, 'stage'), i = stageIndex(stage), status = need(b.status, 'status');
      if (i < 0) fail('Unknown stage ' + stage);
      if (['todo', 'active', 'done'].indexOf(status) < 0) fail('Unknown status ' + status);
      p.status[stage] = status;
      var dirty = ['projects', 'events'];
      if (status === 'done') {
        log(db, ctx, p.id, STAGES[i].title + ' marked done');
        var next = STAGES[i + 1];
        if (next && p.status[next.key] !== 'done') {
          p.status[next.key] = 'active';
          p.stage = next.key;
          enqueue(db, ctx, p.id, next.key, next.agent, '');
          dirty.push('requests');
        }
      } else if (status === 'active') {
        p.stage = stage;
        log(db, ctx, p.id, STAGES[i].title + ' reopened');
      }
      p.updated_at = ctx.now;
      return {project: p, dirty: dirty};
    },

    set_meta: function (db, b, ctx) {
      var p = find(db.projects, 'id', need(b.project_id, 'project_id')) || fail('No such project');
      if (b.name) p.name = b.name;
      if (b.archived !== undefined) p.archived = !!b.archived;
      if (b.stage && stageIndex(b.stage) >= 0) p.stage = b.stage;
      p.updated_at = ctx.now;
      return {project: p, dirty: ['projects']};
    },

    ask: function (db, b, ctx) {
      var p = find(db.projects, 'id', need(b.project_id, 'project_id')) || fail('No such project');
      var stage = need(b.stage, 'stage'), i = stageIndex(stage);
      if (i < 0) fail('Unknown stage ' + stage);
      var r = enqueue(db, ctx, p.id, stage, b.agent || STAGES[i].agent, b.ask || '');
      return {request: r, dirty: ['requests', 'events']};
    },

    cancel_request: function (db, b, ctx) {
      var r = find(db.requests, 'request_id', need(b.request_id, 'request_id')) || fail('No such request');
      r.state = 'done';
      log(db, ctx, r.project_id, 'Withdrew the ask to the ' + AGENTS[r.agent] + ' ghost');
      return {request: r, dirty: ['requests', 'events']};
    },

    /* ---- agents ---- */

    // Open requests, oldest first. Claims older than two hours are offered again.
    queue: function (db, b, ctx) {
      var stale = Date.parse(ctx.now) - 2 * 3600 * 1000;
      var rows = db.requests.filter(function (r) {
        if (r.state === 'done') return false;
        if (b.agent && r.agent !== b.agent) return false;
        if (r.state === 'claimed' && Date.parse(r.claimed_at) > stale && !b.include_claimed) return false;
        return true;
      }).sort(function (a, c) { return String(a.created_at).localeCompare(String(c.created_at)); });
      return {requests: rows.map(function (r) {
        var p = find(db.projects, 'id', r.project_id);
        return Object.assign({project_name: p ? p.name : ''}, r);
      })};
    },

    claim: function (db, b, ctx) {
      var r = find(db.requests, 'request_id', need(b.request_id, 'request_id')) || fail('No such request');
      if (r.state === 'done') fail('Request already done');
      r.state = 'claimed'; r.claimed_by = b.runner || ctx.who; r.claimed_at = ctx.now;
      return {request: r, dirty: ['requests']};
    },

    // A ghost is a draft, never a change: fields only reach the project when someone accepts it.
    post_ghost: function (db, b, ctx) {
      var p = find(db.projects, 'id', need(b.project_id, 'project_id')) || fail('No such project');
      var stage = need(b.stage, 'stage');
      if (stageIndex(stage) < 0) fail('Unknown stage ' + stage);
      var agent = need(b.agent, 'agent');
      if (!AGENTS[agent]) fail('Unknown agent ' + agent);
      var g = {ghost_id: ctx.id('GH'), project_id: p.id, stage: stage, agent: agent,
        request_id: b.request_id || '', summary: need(b.summary, 'summary'),
        fields: b.fields || {}, notes: b.notes || '', questions: b.questions || [],
        state: 'open', created_at: ctx.now, resolved_at: '', resolved_by: ''};
      db.ghosts.push(g);
      if (b.request_id) {
        var r = find(db.requests, 'request_id', b.request_id);
        if (r) r.state = 'done';
      }
      log(db, ctx, p.id, AGENTS[agent] + ' ghost drafted ' + stage + ': ' + g.summary);
      return {ghost: g, dirty: ['ghosts', 'requests', 'events']};
    },

    // accept: merge the chosen fields (all by default) into the stage. dismiss: keep for the record only.
    resolve_ghost: function (db, b, ctx) {
      var g = find(db.ghosts, 'ghost_id', need(b.ghost_id, 'ghost_id')) || fail('No such ghost');
      if (g.state !== 'open') fail('Ghost already ' + g.state);
      var action = need(b.action, 'action'), dirty = ['ghosts', 'events'];
      if (action === 'accept') {
        var p = find(db.projects, 'id', g.project_id) || fail('No such project');
        var keys = b.keys || Object.keys(g.fields);
        var cur = p.data[g.stage] = p.data[g.stage] || {};
        keys.forEach(function (k) { if (Object.prototype.hasOwnProperty.call(g.fields, k)) cur[k] = clone(g.fields[k]); });
        p.updated_at = ctx.now;
        g.state = 'accepted';
        dirty.push('projects');
        log(db, ctx, g.project_id, 'Accepted the ' + AGENTS[g.agent] + ' draft for ' + g.stage);
      } else if (action === 'dismiss') {
        g.state = 'dismissed';
        log(db, ctx, g.project_id, 'Dismissed the ' + AGENTS[g.agent] + ' draft for ' + g.stage);
      } else fail('Unknown action ' + action);
      g.resolved_at = ctx.now; g.resolved_by = ctx.who;
      return {ghost: g, dirty: dirty};
    },

    note: function (db, b, ctx) {
      need(b.project_id, 'project_id');
      log(db, ctx, b.project_id, need(b.what, 'what'));
      return {dirty: ['events']};
    },

    add_photo: function (db, b, ctx) {
      var p = find(db.projects, 'id', need(b.project_id, 'project_id')) || fail('No such project');
      var stored = ctx.putPhoto(need(b.data, 'data'), b.name || 'photo.jpg', p);
      var x = {photo_id: ctx.id('PH'), project_id: p.id, stage: b.stage || 'site', name: b.name || '',
        caption: b.caption || '', file_id: stored.file_id, width: b.width || null, height: b.height || null,
        created_at: ctx.now};
      db.photos.push(x);
      log(db, ctx, p.id, 'Added a photo to ' + x.stage);
      return {photo: x, dirty: ['photos', 'events']};
    },

    get_photo: function (db, b, ctx) {
      var x = find(db.photos, 'photo_id', need(b.photo_id, 'photo_id')) || fail('No such photo');
      return {photo: x, data: ctx.getPhoto(x.file_id)};
    }
  };

  // Agents may read everything and write drafts; only the studio changes the record itself.
  var AGENT_OPS = {list_projects: 1, get_project: 1, queue: 1, claim: 1, post_ghost: 1, note: 1, get_photo: 1};

  function handle(db, body, ctx) {
    var op = body && body.op;
    if (!ops[op]) return {res: {ok: false, error: 'Unknown op ' + op}, dirty: []};
    if (ctx.role === 'agent' && !AGENT_OPS[op]) return {res: {ok: false, error: 'Agents cannot ' + op}, dirty: []};
    try {
      var out = ops[op](db, body, ctx) || {};
      var dirty = out.dirty || [];
      delete out.dirty;
      out.ok = true;
      return {res: out, dirty: dirty};
    } catch (e) {
      if (!e.userFacing) throw e;
      return {res: {ok: false, error: e.message}, dirty: []};
    }
  }

  function emptyDb() { return {projects: [], ghosts: [], requests: [], events: [], photos: []}; }

  return {AGENTS: AGENTS, STAGES: STAGES, handle: handle, emptyDb: emptyDb, stageIndex: stageIndex};
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
