/* Plant library — shared by /plants/studio.html and /plants/view.html.
 *
 * Reads https://ecologicalregistry.org/data/plant-library.json, generated from tinyforests/plants by
 * `python3 -m canonical.publish --reg`. Never edit that file here: record
 * changes are made in the studio, stored as Plant Edits by the Apps Script
 * backend, overlaid here immediately, and folded into the library on the
 * next plants build.
 */
(function (root) {
  'use strict';

  var BANDS = {canopy: 'Canopy', shrub: 'Shrub', forb: 'Forb', grass: 'Grass & strappy', ground: 'Ground'};
  var by = {}, list = [], loaded = null;

  function fold(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[‘’'"`]/g, '').replace(/\s+/g, ' ').trim();
  }

  function slugify(name) {
    return fold(name).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function index(rec) {
    rec._k = fold(rec.botanical_name) + ' | ' + fold(rec.common_name);
    rec._g = fold(rec.botanical_name).split(' ')[0];
    return rec;
  }

  function load(url) {
    if (loaded) return loaded;
    loaded = fetch(url || 'https://ecologicalregistry.org/data/plant-library.json', {cache: 'no-cache'})
      .then(function (r) { if (!r.ok) throw new Error('library ' + r.status); return r.json(); })
      .then(function (d) {
        list = d.species.map(index);
        by = {};
        list.forEach(function (r) { by[r.slug] = r; });
        return {count: list.length, generated: d.metadata && d.metadata.generated};
      });
    return loaded;
  }

  /* edits: {slug: {field: value}} — latest value per field. */
  function applyEdits(edits) {
    Object.keys(edits || {}).forEach(function (slug) {
      var e = edits[slug], rec = by[slug];
      if (!rec) {
        if (!e.botanical_name) return;
        rec = by[slug] = {slug: slug, _new: true};
        list.push(rec);
      }
      Object.keys(e).forEach(function (f) {
        if (f === 'life_form') return;
        rec[f] = e[f];
      });
      if (Object.prototype.hasOwnProperty.call(e, 'bloom_time')) delete rec.flowering;
      rec._edited = true;
      index(rec);
    });
    list = list.filter(function (r) { return !r.archived; });
  }

  // Count distinct species, including species repeated across planting areas.
  function layers(lines) {
    var labels = ['Canopy', 'Sub-canopy / tall shrubs', 'Mid shrubs',
      'Grasses & strappy', 'Forbs & flowering', 'Groundcovers', 'Mats & spreading woody'];
    var counts = [0, 0, 0, 0, 0, 0, 0], seen = {}, unknown = 0;
    (lines || []).forEach(function (line) {
      if (seen[line.slug]) return;
      seen[line.slug] = true;
      var rec = get(line.slug), stratum = rec && rec.stratum;
      if (Number.isInteger(stratum) && stratum >= 1 && stratum <= 7) counts[stratum - 1]++;
      else unknown++;
    });
    return {count: counts.filter(Boolean).length, unknown: unknown,
      items: labels.map(function (label, i) { return {label: label, count: counts[i]}; })
        .filter(function (item) { return item.count > 0; })};
  }

  function get(slug) { return by[slug] || null; }

  /* Ranked search. Exact genus or word-start matches first, then contains. */
  function search(q, f) {
    f = f || {};
    var t = fold(q), words = t ? t.split(' ') : [];
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (f.native && !(r.australian_native || r.indigenous_vic || (r.evcs && r.evcs.length))) continue;
      if (f.band && r.display_band !== f.band) continue;
      if (f.evc && !(r.evcs || []).some(function (c) { return String(c) === String(f.evc); })) continue;
      var score = 0;
      if (words.length) {
        var ok = true;
        for (var w = 0; w < words.length; w++) {
          var at = r._k.indexOf(words[w]);
          if (at < 0) { ok = false; break; }
          score += at === 0 ? 30 : (r._k.charAt(at - 1) === ' ' ? 12 : 2);
        }
        if (!ok) continue;
        if (r._g === words[0]) score += 20;
      }
      if (r.description) score += 3;
      if (r.common_name) score += 1;
      out.push([score, r]);
    }
    out.sort(function (a, b) {
      return b[0] - a[0] || fold(a[1].botanical_name).localeCompare(fold(b[1].botanical_name));
    });
    return out.map(function (x) { return x[1]; });
  }

  function m(v) { return v >= 1 ? (+v.toFixed(1)) + ' m' : Math.round(v * 100) + ' cm'; }
  function range(o) {
    if (!o) return '';
    if (o.min != null && o.max != null && o.min !== o.max) return m(o.min) + '–' + m(o.max);
    return m(o.max != null ? o.max : o.min);
  }
  function size(r) {
    var h = range(r.mature_height_m), w = range(r.mature_width_m);
    if (h && w) return h + ' h × ' + w + ' w';
    if (h) return h + ' h';
    return r.height_raw || '';
  }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function flowering(r) {
    if (r.flowering && r.flowering.peak && r.flowering.peak.length) {
      return r.flowering.peak.map(function (n) { return MONTHS[n - 1]; }).join(', ');
    }
    return (r.bloom_time || []).filter(function (b) { return b !== 'Evergreen'; }).join(', ');
  }

  // Seasonal source timings use Melbourne seasons; shaded months are estimates.
  function floweringCalendar(lines) {
    var seasons = {summer: [12, 1, 2], autumn: [3, 4, 5], winter: [6, 7, 8], spring: [9, 10, 11]};
    var names = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    var seen = {}, rows = [], unknown = [], totals = Array(12).fill(0);
    function valid(values) { return (Array.isArray(values) ? values : []).filter(function (m) { return Number.isInteger(m) && m >= 1 && m <= 12; }); }
    function parse(text) {
      text = String(text).toLowerCase().trim();
      if (text === 'all year') return names.map(function (_, i) { return i + 1; });
      if (seasons[text]) return seasons[text];
      var partial = text.match(/^(early to mid|mid to late|early|mid|late) (summer|autumn|winter|spring)$/);
      if (partial) {
        var months = seasons[partial[2]], part = partial[1];
        return part === 'early to mid' ? months.slice(0, 2) : part === 'mid to late' ? months.slice(1) : [months[{early:0,mid:1,late:2}[part]]];
      }
      var range = text.match(/^([a-z]+) (?:to|-) ([a-z]+)$/);
      if (!range) return [];
      var start = seasons[range[1]] ? seasons[range[1]][0] : names.indexOf(range[1]) + 1;
      var end = seasons[range[2]] ? seasons[range[2]][2] : names.indexOf(range[2]) + 1;
      if (!start || !end) return [];
      var out = [start]; while (out[out.length - 1] !== end && out.length < 12) out.push(out[out.length - 1] % 12 + 1);
      return out;
    }
    (lines || []).forEach(function (line) {
      if (seen[line.slug]) return; seen[line.slug] = true;
      var rec = get(line.slug) || {botanical_name: line.slug.replace(/-/g, ' ')};
      var peak = valid(rec.flowering && rec.flowering.peak), shoulder = valid(rec.flowering && rec.flowering.shoulder);
      var estimated = !peak.length && !shoulder.length;
      if (estimated) {
        var timing = Array.isArray(rec.bloom_time) ? rec.bloom_time : [rec.bloom_time];
        peak = [].concat.apply([], timing.map(parse));
      }
      if (!peak.length && !shoulder.length) { unknown.push(rec.botanical_name); return; }
      var months = names.map(function (_, i) { var m = i + 1; return peak.indexOf(m) >= 0 ? (estimated ? 'estimated' : 'peak') : shoulder.indexOf(m) >= 0 ? 'shoulder' : ''; });
      months.forEach(function (value, i) { if (value) totals[i]++; });
      rows.push({name: rec.botanical_name, months: months});
    });
    rows.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return {months: MONTHS, rows: rows, totals: totals, unknown: unknown};
  }

  function plantingDensity(lines, areas) {
    var zones = new Map();
    function zone(name) {
      if (!zones.has(name)) zones.set(name, {area: name, area_m2: null, plants: 0, missing: 0, lines: 0});
      return zones.get(name);
    }
    (areas || []).forEach(function (a) {
      if (typeof a.area_m2 === 'number' && Number.isFinite(a.area_m2) && a.area_m2 > 0) zone(a.area || '').area_m2 = a.area_m2;
    });
    (lines || []).forEach(function (line) {
      var z = zone(line.area || ''); z.lines++;
      if (typeof line.qty === 'number' && Number.isInteger(line.qty) && line.qty >= 0) z.plants += line.qty;
      else z.missing++;
    });
    var result = {zones: Array.from(zones.values()), area_m2: 0, plants: 0, missing: 0, unmeasured: 0, density: null};
    result.zones.forEach(function (z) {
      z.density = z.area_m2 && !z.missing ? z.plants / z.area_m2 : null;
      result.area_m2 += z.area_m2 || 0; result.plants += z.plants; result.missing += z.missing;
      if (!z.area_m2) result.unmeasured++;
    });
    if (result.area_m2 && !result.missing && !result.unmeasured) result.density = result.plants / result.area_m2;
    return result;
  }

  function label(r) { return r.botanical_name + (r.common_name ? ' — ' + r.common_name : ''); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
    });
  }

  root.PlantLibrary = {
    load: load, applyEdits: applyEdits, get: get, search: search, slugify: slugify,
    plantingDensity: plantingDensity, floweringCalendar: floweringCalendar, layers: layers, size: size, flowering: flowering, label: label, esc: esc, BANDS: BANDS,
    all: function () { return list; }
  };
})(window);
