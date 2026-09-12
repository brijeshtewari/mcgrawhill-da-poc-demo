/*
 * Header / Navigation block — WKND
 * Content is authored in /content/nav.plain.html as three sections:
 *   1. utility bar   — Sign In link + locale list (language selector)
 *   2. brand         — WKND logo (links home)
 *   3. main nav      — Magazine / Adventures / FAQs / About Us
 * This JS reads that DOM and builds the header layout, the locale dropdown,
 * the search form, and the mobile hamburger. It never invents copy.
 */

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment (metadata-independent dual-fetch):
 *   /content first (localhost / aem up), then root (DA/EDS production).
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp;
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const frag = await fetchNav();
  block.textContent = '';
  if (!frag) return;

  const sections = [...frag.children].filter((c) => c.tagName === 'DIV');
  const [utilitySection, brandSection, navSection] = sections;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  // ---- Utility bar (Sign In + locale selector) ----
  const utilBar = document.createElement('div');
  utilBar.className = 'nav-utility';
  if (utilitySection) {
    const signIn = utilitySection.querySelector('p a');
    const localeList = utilitySection.querySelector('ul');

    const utilInner = document.createElement('div');
    utilInner.className = 'nav-utility-inner';

    // Source order (left → right): Sign In, then the language selector.
    if (signIn) {
      const sign = signIn.cloneNode(true);
      sign.className = 'nav-signin';
      utilInner.append(sign);
    }

    // Locale selector (click-to-toggle dropdown)
    if (localeList) {
      const locale = document.createElement('div');
      locale.className = 'nav-locale';
      // Match the locale whose href appears in the current path (works for both
      // production "/us/en" and local "/content/us/en"); fall back to the first.
      const path = window.location.pathname;
      const current = [...localeList.querySelectorAll('a')]
        .find((a) => {
          const href = a.getAttribute('href');
          return href && (path === href || path.endsWith(href) || path.includes(`${href}/`));
        }) || localeList.querySelector('a');
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'nav-locale-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = current ? current.textContent.trim() : '';
      const list = localeList.cloneNode(true);
      list.className = 'nav-locale-list';
      list.hidden = true;
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        list.hidden = open;
      });
      locale.append(toggle, list);
      utilInner.append(locale);
    }

    utilBar.append(utilInner);
  }

  // ---- Main bar (hamburger + logo + nav + search) ----
  const mainBar = document.createElement('div');
  mainBar.className = 'nav-main';
  const mainInner = document.createElement('div');
  mainInner.className = 'nav-main-inner';

  // Hamburger (mobile)
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';

  // Brand / logo
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSection) {
    const logoLink = brandSection.querySelector('a');
    if (logoLink) {
      const clone = logoLink.cloneNode(true);
      // Resolve the fragment's relative image path to an absolute one so the
      // logo works on deep pages (the fragment uses relative paths for portability).
      clone.querySelectorAll('img').forEach((img) => {
        const raw = img.getAttribute('src');
        if (raw && !raw.startsWith('/') && !raw.startsWith('http')) {
          img.src = `/${raw.replace(/^\.?\//, '')}`;
        }
      });
      brand.append(clone);
    }
  }

  // Main nav links
  const navLinks = document.createElement('div');
  navLinks.className = 'nav-sections';
  if (navSection) {
    const list = navSection.querySelector('ul');
    if (list) navLinks.append(list.cloneNode(true));
  }

  // Search form (built in JS — not authored in the fragment)
  const search = document.createElement('form');
  search.className = 'nav-search';
  search.setAttribute('role', 'search');
  search.action = '/search';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.name = 'q';
  searchInput.setAttribute('aria-label', 'Search');
  searchInput.placeholder = 'Search';
  search.append(searchInput);

  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!open));
    hamburger.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('nav-open', !open);
  });

  mainInner.append(hamburger, brand, navLinks, search);
  mainBar.append(mainInner);

  nav.append(utilBar, mainBar);

  // Reset mobile state when resizing up to desktop
  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches) {
      nav.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation');
    }
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.append(wrapper);
}
