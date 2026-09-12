import { getMetadata } from '../../scripts/aem.js';

/**
 * turns a URL path segment into a readable label, e.g. "bali-surf-camp" -> "Bali Surf Camp"
 * @param {string} segment
 * @returns {string}
 */
function humanize(segment) {
  return decodeURIComponent(segment)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * loads and decorates the breadcrumbs, building the trail from the current URL path
 * @param {Element} block The breadcrumbs block element
 */
export default function decorate(block) {
  const segments = window.location.pathname
    .replace(/\.html$/, '')
    .split('/')
    .filter(Boolean);
  const pageTitle = getMetadata('og:title') || document.title;

  // The trail should start at the top-level section (e.g. "Adventures"),
  // matching the source — so skip the local-preview "content" prefix and the
  // two locale segments (country + language, e.g. /us/en). Links keep the full
  // path so they resolve correctly in every environment.
  let start = 0;
  if (segments[start] === 'content') start += 1;
  start += 2; // locale: country + language

  const crumbs = [];
  let path = '';
  segments.forEach((segment, i) => {
    path += `/${segment}`;
    if (i >= start) crumbs.push({ text: humanize(segment), path });
  });
  if (crumbs.length) crumbs[crumbs.length - 1].text = pageTitle;
  if (!crumbs.length) return;

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ul = document.createElement('ul');
  crumbs.forEach((crumb, i) => {
    const li = document.createElement('li');
    if (i === crumbs.length - 1) {
      li.textContent = crumb.text;
      li.setAttribute('aria-current', 'page');
    } else {
      const a = document.createElement('a');
      a.href = crumb.path;
      a.textContent = crumb.text;
      li.append(a);
    }
    ul.append(li);
  });
  nav.append(ul);

  block.textContent = '';
  block.append(nav);
}
