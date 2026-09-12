import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Adventure category taxonomy (from the WKND source "Current Adventures" tabs).
 * Keyed by the adventure's URL slug so it is locale-independent and matches on
 * the deployed site regardless of the /content or country/language prefix.
 * An adventure may belong to more than one category (e.g. Cycling + Travel).
 */
const ADVENTURE_CATEGORIES = ['All', 'Climbing', 'Cycling', 'Skiing', 'Surfing', 'Travel'];
const ADVENTURE_CATEGORY_MAP = {
  'climbing-new-zealand': ['Climbing'],
  'colorado-rock-climbing': ['Climbing'],
  'whistler-mountain-biking': ['Cycling'],
  'cycling-tuscany': ['Cycling', 'Travel'],
  'west-coast-cycling': ['Cycling'],
  'downhill-skiing-wyoming': ['Skiing'],
  'ski-touring-mont-blanc': ['Skiing'],
  'tahoe-skiing': ['Skiing'],
  'bali-surf-camp': ['Surfing'],
  'surf-camp-costa-rica': ['Surfing'],
  'beervana-portland': ['Travel'],
  'gastronomic-marais-tour': ['Travel'],
  'napa-wine-tasting': ['Travel'],
  'riverside-camping-australia': ['Travel'],
  'yosemite-backpacking': ['Travel'],
};

/**
 * Extract the adventure slug from a card's link,
 * e.g. ".../adventures/tahoe-skiing.html" -> "tahoe-skiing".
 */
function adventureSlug(li) {
  const link = li.querySelector('a[href*="/adventures/"]');
  if (!link) return null;
  const match = link.getAttribute('href').match(/\/adventures\/([^/.?#]+)/);
  return match ? match[1] : null;
}

/**
 * Builds the category filter tab bar for the adventure listing and wires up
 * show/hide filtering. Cards keep their DOM position; filtering toggles a class.
 * @param {Element} block the cards block
 * @param {Element} ul the card list
 */
function buildAdventureTabs(block, ul) {
  const tablist = document.createElement('div');
  tablist.className = 'cards-tabs';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Adventure categories');

  const applyFilter = (category) => {
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const cats = (li.dataset.categories || '').split(',');
      const show = category === 'All' || cats.includes(category);
      li.classList.toggle('cards-card-hidden', !show);
    });
  };

  ADVENTURE_CATEGORIES.forEach((category, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'cards-tab';
    tab.setAttribute('role', 'tab');
    tab.textContent = category;
    const selected = i === 0;
    tab.setAttribute('aria-selected', String(selected));
    if (selected) tab.classList.add('cards-tab-active');
    tab.addEventListener('click', () => {
      tablist.querySelectorAll('.cards-tab').forEach((t) => {
        t.classList.remove('cards-tab-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('cards-tab-active');
      tab.setAttribute('aria-selected', 'true');
      applyFilter(category);
    });
    tablist.append(tab);
  });

  block.prepend(tablist);
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);

  // Adventure listing page only: tag cards by category and add the
  // "All / Climbing / …" filter tabs (matching source). Scoped to the
  // /adventures listing itself so home-page adventure teasers stay a plain grid.
  const onAdventuresListing = /\/adventures(\.html)?$/.test(window.location.pathname);
  const slugs = [...ul.children].map((li) => adventureSlug(li));
  const isAdventureListing = onAdventuresListing && slugs.filter(Boolean).length >= slugs.length;
  if (isAdventureListing) {
    block.classList.add('cards-adventures');
    ul.querySelectorAll(':scope > li').forEach((li, i) => {
      const cats = ADVENTURE_CATEGORY_MAP[slugs[i]] || [];
      li.dataset.categories = cats.join(',');
    });
    buildAdventureTabs(block, ul);
  }
}
