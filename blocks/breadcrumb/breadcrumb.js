import { getMetadata } from '../../scripts/aem.js';

/**
 * turns a URL path segment into a readable label, e.g. "online-store" -> "Online Store"
 * @param {string} segment
 * @returns {string}
 */
function humanize(segment) {
  return decodeURIComponent(segment)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * loads and decorates the breadcrumb, building the trail from the current URL path
 * @param {Element} block The breadcrumb block element
 */
export default function decorate(block) {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const pageTitle = getMetadata('og:title') || document.title;

  const crumbs = [{ text: 'Home', path: '/' }];
  let path = '';
  segments.forEach((segment) => {
    path += `/${segment}`;
    crumbs.push({ text: humanize(segment), path });
  });
  if (crumbs.length > 1) crumbs[crumbs.length - 1].text = pageTitle;

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