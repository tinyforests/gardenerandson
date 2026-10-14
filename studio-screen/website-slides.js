'use strict';
const websiteLayouts = ['hero', 'place', 'garden', 'care', 'studio', 'begin', 'poster'];
const websiteOrigins = ['https://www.gardenerandson.com', 'https://findmyevc.com', 'https://findmyecologicalgarden.com', 'https://ecologicalregistry.org'];

function validateWebsiteLink(link) {
  if (!link || typeof link.label !== 'string' || !link.label.trim() || link.label.length > 40 || typeof link.url !== 'string' || link.url.length > 300) throw Error('Invalid website link');
  const url = new URL(link.url);
  if (!websiteOrigins.includes(url.origin) || url.username || url.password) throw Error('Unapproved website link');
}

function validateWebsiteSlide(s) {
  if (!websiteLayouts.includes(s.layout) || typeof s.section !== 'string' || !s.section || s.section.length > 30) throw Error('Invalid website section');
  if (s.body !== undefined && (typeof s.body !== 'string' || s.body.length > 240)) throw Error('Website body too long');
  if (s.emphasis !== undefined && (typeof s.emphasis !== 'string' || !s.emphasis || !s.title.includes(s.emphasis))) throw Error('Invalid website emphasis');
  if (s.facts !== undefined && (!Array.isArray(s.facts) || s.facts.length > 6 || s.facts.some(row => !Array.isArray(row) || row.length !== 2 || row.some(value => typeof value !== 'string' || !value || value.length > 60)))) throw Error('Invalid website facts');
  if (s.caption !== undefined && (typeof s.caption !== 'string' || s.caption.length > 110)) throw Error('Invalid website caption');
  if (['garden', 'studio'].includes(s.layout) && !s.image) throw Error('Website section needs an image');
  if (s.layout === 'poster' && (!['discover','plant','measure'].includes(s.phase) || typeof s.bodyEmphasis !== 'string' || !s.body?.includes(s.bodyEmphasis))) throw Error('Invalid wall poster');
  if (!['hero', 'place', 'care', 'begin', 'studio', 'garden'].includes(s.layout) || s.links !== undefined) {
    if (!Array.isArray(s.links) || s.links.length !== 1) throw Error('Website section needs a link');
    validateWebsiteLink(s.links[0]);
  }
}

function websiteHeading(tag, title, emphasis) {
  const heading = text(tag, '', 'website-title');
  for (const line of title.split('\n')) {
    const span = text('span', '');
    const index = emphasis ? line.indexOf(emphasis) : -1;
    if (index === -1) span.textContent = line;
    else span.append(document.createTextNode(line.slice(0, index)), text('em', emphasis), document.createTextNode(line.slice(index + emphasis.length)));
    heading.append(span);
  }
  return heading;
}

function websiteFacts(rows) {
  const list = text('dl', '', 'website-facts');
  for (const [label, raw] of rows) {
    const month = new Date().getMonth();
    const value = raw === '$season' ? ([2,3,4].includes(month) ? 'Autumn' : [5,6,7].includes(month) ? 'Winter' : [8,9,10].includes(month) ? 'Spring' : 'Summer') : raw;
    const row = text('div', '', 'website-fact');
    row.append(text('dt', label), text('dd', value)); list.append(row);
  }
  return list;
}

function websiteLink(link) {
  const el = text('a', '', 'website-link');
  el.href = link.url;
  const url = new URL(link.url);
  el.append(text('span', link.label, 'website-prompt'), text('span', url.hostname + url.pathname, 'website-url'));
  return el;
}

function renderWebsite(s, section) {
  section.classList.add('website', 'website-' + s.layout);
  if (s.label?.endsWith('Hawthorn East')) section.classList.add('garden-short-title');
  if (s.section === 'original') section.classList.add('website-original');
  if (s.layout === 'poster') {renderPoster(s, section);return;}
  if (s.image) section.classList.add('image-' + (s.imageSide || 'left'));

  if (s.image) {
    const figure = text('figure', '', 'website-figure');
    const img = document.createElement('img'); img.src = s.image; img.alt = s.alt;
    figure.append(img);
    if (s.caption) figure.append(text('figcaption', s.caption));
    section.append(figure);
  }
  const copy = text('div', '', 'website-copy');
  copy.append(text('p', s.label, 'label'), websiteHeading(['hero', 'place'].includes(s.layout) ? 'h1' : 'h2', s.title, s.emphasis));
  if (s.body) copy.append(text('p', s.body, 'website-body'));
  if (s.facts && ['garden', 'studio'].includes(s.layout)) copy.append(websiteFacts(s.facts));
  section.append(copy);
  if (s.facts && ['hero', 'place'].includes(s.layout)) section.append(websiteFacts(s.facts));
  if (s.links) section.append(websiteLink(s.links[0]));
}

function renderPoster(s, section) {
  const header = text('header', '', 'poster-header');
  const sequence = text('div', '', 'poster-sequence');
  ['discover','plant','measure'].forEach((phase,index)=>{
    if(index) sequence.append(document.createTextNode(' - '));
    sequence.append(text('span', phase, phase === s.phase ? 'current' : ''));
  });
  header.append(sequence, text('div', s.label, 'poster-product'));section.append(header);
  const content = text('div', '', 'poster-content');
  content.append(websiteHeading('h1', s.title));
  const body = text('p', '', 'poster-body');
  const index = s.body.indexOf(s.bodyEmphasis);
  body.append(document.createTextNode(s.body.slice(0,index)),text('em',s.bodyEmphasis),document.createTextNode(s.body.slice(index+s.bodyEmphasis.length)));
  content.append(body);
  const foot = text('div', '', 'poster-details');
  const url = new URL(s.links[0].url);
  const link = text('a', url.hostname, 'poster-url');link.href=url.href;
  foot.append(link,text('span',s.caption,'poster-caption'));content.append(foot);section.append(content);
  const signature = text('footer', '', 'poster-signature');
  signature.append(text('span','Gardener'),text('span','&Son.'));section.append(signature);
}
