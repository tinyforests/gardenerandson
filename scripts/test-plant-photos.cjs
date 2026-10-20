const fs = require('fs'), vm = require('vm'), assert = require('assert');
(async () => {
  const ctx = {window: {}, fetch: async () => ({ok: true, json: async () => ({species: [
    {slug: 'example', botanical_name: 'Example plant', image_url: 'https://example.com/original.jpg',
      image_credit: 'Photographer', image_license: 'cc-by', image_source_url: 'https://www.inaturalist.org/photos/1'}
  ]})})};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync('plants/plant-library.js', 'utf8'), ctx);
  const p = ctx.window.PlantLibrary;
  await p.load();
  assert(p.photoCredit(p.get('example')).includes('CC-BY'));
  assert(p.photoCredit(p.get('example')).includes('https://www.inaturalist.org/photos/1'));
  assert.equal(p.imageUrl('javascript:alert(1)'), '');
  assert.equal(p.imageUrl('data:text/html,test'), '');
  p.applyEdits({example: {image_url: 'https://example.com/replacement.jpg', image_credit: 'New photographer'}});
  assert(!p.get('example').image_source_url);
  assert(!p.get('example').image_license);
  assert(p.photoCredit(p.get('example')).includes('New photographer'));
  assert.equal(p.photoCredit({}), '');
  console.log('Plant photo URLs, attribution and replacement checks passed.');
})();
