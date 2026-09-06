import { fetchPlaceholders } from '../../scripts/placeholders.js';

const PAGE_SIZE = 10;
const DEFAULT_SOURCE = '/enablement/data/employees.json';

const FIELDS = [
  { key: 'Department', label: 'Department' },
  { key: 'Experience', label: 'Experience' },
  { key: 'City', label: 'City' },
];

async function fetchLoadMoreLabel() {
  const [firstSegment] = window.location.pathname.split('/').filter(Boolean);
  if (firstSegment) {
    const scoped = await fetchPlaceholders(`/${firstSegment}`);
    if (scoped.loadMore) return scoped.loadMore;
  }
  const root = await fetchPlaceholders();
  return root.loadMore || 'Load more';
}

async function fetchEmployees(source, offset) {
  const url = new URL(source, window.location.href);
  url.searchParams.set('offset', offset);
  url.searchParams.set('limit', PAGE_SIZE);
  const resp = await fetch(url.pathname + url.search);
  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading employees', resp);
    return null;
  }
  return resp.json();
}

function renderEmployee(employee) {
  const li = document.createElement('li');
  li.className = 'employee-list-card';

  const name = document.createElement('p');
  name.className = 'employee-list-name';
  name.textContent = employee.Name || '';
  li.append(name);

  const meta = document.createElement('dl');
  meta.className = 'employee-list-meta';
  FIELDS.forEach(({ key, label }) => {
    if (!employee[key]) return;
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = employee[key];
    meta.append(dt, dd);
  });
  li.append(meta);

  return li;
}

/**
 * loads and decorates the block
 * @param {Element} block The employee-list block element
 */
export default async function decorate(block) {
  const link = block.querySelector('a[href]');
  const source = link ? link.getAttribute('href') : DEFAULT_SOURCE;
  block.textContent = '';

  const list = document.createElement('ul');
  list.className = 'employee-list-list';
  list.setAttribute('role', 'status');
  list.setAttribute('aria-live', 'polite');

  const loadMoreWrapper = document.createElement('div');
  loadMoreWrapper.className = 'employee-list-load-more-wrapper';
  const loadMoreButton = document.createElement('button');
  loadMoreButton.type = 'button';
  loadMoreButton.className = 'button employee-list-load-more';
  loadMoreWrapper.append(loadMoreButton);

  block.append(list, loadMoreWrapper);

  loadMoreButton.textContent = await fetchLoadMoreLabel();

  let offset = 0;

  async function loadNextPage() {
    loadMoreButton.disabled = true;
    const json = await fetchEmployees(source, offset);
    const data = json?.data || [];
    data.forEach((employee) => list.append(renderEmployee(employee)));
    offset += data.length;
    loadMoreButton.disabled = false;
    if (!json || offset >= json.total || data.length === 0) {
      loadMoreWrapper.remove();
    }
  }

  loadMoreButton.addEventListener('click', loadNextPage);
  await loadNextPage();
}
