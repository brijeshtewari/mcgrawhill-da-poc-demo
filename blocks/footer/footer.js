/*
 * Footer block — WKND
 * Content is authored in /content/footer.plain.html as three sections:
 *   1. brand + footer nav (logo links home; Magazine/Adventures/FAQs/About Us)
 *   2. "Follow Us" + social links (Facebook/Twitter/Instagram)
 *   3. legal block (localization note, copyright, AEM credits, Adobe Stock)
 * This JS reads that DOM and renders the footer. It never invents copy.
 */

/**
 * Fetch the footer fragment (metadata-independent dual-fetch):
 *   /content first (localhost / aem up), then root (DA/EDS production).
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const frag = await fetchFooter();
  block.textContent = '';
  if (!frag) return;

  const sections = [...frag.children].filter((c) => c.tagName === 'DIV');
  const [brandSection, socialSection, legalSection] = sections;

  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  // ---- Top row: brand + footer nav ---------------------------------------
  const top = document.createElement('div');
  top.className = 'footer-top';

  if (brandSection) {
    const brand = document.createElement('div');
    brand.className = 'footer-brand';
    const logoLink = brandSection.querySelector('p a');
    if (logoLink) {
      const clone = logoLink.cloneNode(true);
      // Resolve the fragment's relative image path to an absolute one.
      clone.querySelectorAll('img').forEach((img) => {
        const raw = img.getAttribute('src');
        if (raw && !raw.startsWith('/') && !raw.startsWith('http')) {
          img.src = `/${raw.replace(/^\.?\//, '')}`;
        }
      });
      brand.append(clone);
    }
    const navList = brandSection.querySelector('ul');
    if (navList) {
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', 'Footer navigation');
      nav.className = 'footer-nav';
      nav.append(navList.cloneNode(true));
      brand.append(nav);
    }
    top.append(brand);
  }

  // ---- Social: "Follow Us" + social links --------------------------------
  if (socialSection) {
    const social = document.createElement('div');
    social.className = 'footer-social';
    const heading = socialSection.querySelector('h4, h3, h2');
    if (heading) social.append(heading.cloneNode(true));
    const list = socialSection.querySelector('ul');
    if (list) {
      const clone = list.cloneNode(true);
      clone.className = 'footer-social-list';
      social.append(clone);
    }
    top.append(social);
  }

  footer.append(top);

  // ---- Separator ----------------------------------------------------------
  const hr = document.createElement('hr');
  hr.className = 'footer-separator';
  footer.append(hr);

  // ---- Legal block --------------------------------------------------------
  if (legalSection) {
    const legal = document.createElement('div');
    legal.className = 'footer-legal';
    [...legalSection.children].forEach((el) => legal.append(el.cloneNode(true)));
    footer.append(legal);
  }

  block.append(footer);
}
