const fs = require('fs'), vm = require('vm'), assert = require('assert');
const context = {window: {}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('plants/plant-library.js', 'utf8'), context);
const density = context.window.PlantLibrary.plantingDensity;
const lines = [{area: 'Front', qty: 126}, {area: 'Rear', qty: 30}];
const areas = [{area: 'Front', area_m2: 42}, {area: 'Rear', area_m2: 10}];
let d = density(lines, areas);
assert.equal(d.density, 3); assert.equal(d.area_m2, 52); assert.equal(d.plants, 156);
assert.equal(d.zones[0].density, 3);
d = density(lines.concat({area: 'Rear', qty: null}), areas);
assert.equal(d.missing, 1); assert.equal(d.density, null); assert.equal(d.zones[1].density, null);
d = density(lines, areas.slice(0, 1));
assert.equal(d.unmeasured, 1); assert.equal(d.density, null); assert.equal(d.zones[0].density, 3);
d = density([{area: '', qty: 0}], [{area: '', area_m2: 2.5}]);
assert.equal(d.density, 0); assert.equal(d.missing, 0);
for (const qty of ['', null, undefined, -1, 2.5, Infinity]) {
  assert.equal(density([{qty}], [{area: '', area_m2: 1}]).missing, 1);
}
assert.equal(density([], []).density, null);
assert.equal(density([], [{area: 'Empty bed', area_m2: 10}]).density, 0);
console.log('Planting density: totals, zone counts, missing values, zeros, decimals and empty selections passed.');
