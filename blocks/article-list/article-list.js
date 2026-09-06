import { createOptimizedPicture } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';

const DEFAULT_SOURCE = '/query-index.json';
const DEFAULT_PAGE_SIZE = 9;

async function fetchLoadMoreLabel() {
  const [firstSegment] = window.location.pathname.split('/').filter(Boolean);
  if (firstSegment) {
    const scoped = await fetchPlaceholders(`/${firstSegment}`);
    if (scoped.loadMore) return scoped.loadMore;
  }
  const root = await fetchPlaceholders();
  return root.loadMore || 'Load more';
}

async function fetchIndex(source) {
  const resp = await fetch(source);
  if (!resp.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading index', source, resp);
    return [];
  }
  const json = await resp.json();
  return json.data || [];
}

function renderArticle(article) {
  const li = document.createElement('li');
  li.className = 'article-list-card';

  const link = document.createElement('a');
  link.href = article.path;
  link.className = 'article-list-link';

  if (article.image) {
    const wrapper = document.createElement('div');
    wrapper.className = 'article-list-image';
    wrapper.append(createOptimizedPicture(article.image, '', false, [{ width: '375' }]));
    link.append(wrapper);
  }

  const body = document.createElement('div');
  body.className = 'article-list-body';

  if (article.title) {
    const title = document.createElement('p');
    title.className = 'article-list-title';
    title.textContent = article.title;
    body.append(title);
  }

  if (article.description) {
    const description = document.createElement('p');
    description.className = 'article-list-description';
    description.textContent = article.description;
    body.append(description);
  }

  link.append(body);
  li.append(link);
  return li;
}

/**
 * loads and decorates the block
 * @param {Element} block The article-list block element
 */
export default async function decorate(block) {
  // optional authored rows: 1) link to index source, 2) path filter prefix, 3) page size
  const [sourceRow, filterRow, pageSizeRow] = [...block.children];

  const sourceLink = sourceRow?.querySelector('a[href]');
  const source = sourceLink ? sourceLink.getAttribute('href') : DEFAULT_SOURCE;
  const pathFilter = filterRow?.textContent.trim();
  const pageSize = parseInt(pageSizeRow?.textContent.trim(), 10) || DEFAULT_PAGE_SIZE;

  block.textContent = '';

  const list = document.createElement('ul');
  list.className = 'article-list-list';
  list.setAttribute('role', 'status');
  list.setAttribute('aria-live', 'polite');

  const loadMoreWrapper = document.createElement('div');
  loadMoreWrapper.className = 'article-list-load-more-wrapper';
  const loadMoreButton = document.createElement('button');
  loadMoreButton.type = 'button';
  loadMoreButton.className = 'button article-list-load-more';
  loadMoreWrapper.append(loadMoreButton);

  block.append(list, loadMoreWrapper);

  loadMoreButton.textContent = await fetchLoadMoreLabel();

  const { pathname } = window.location;
  const articles = (await fetchIndex(source))
    .filter((article) => article.path !== pathname
      && (!pathFilter || article.path.startsWith(pathFilter)));

  if (!articles.length) {
    loadMoreWrapper.remove();
    const empty = document.createElement('p');
    empty.className = 'article-list-empty';
    empty.textContent = 'No articles found.';
    block.append(empty);
    return;
  }

  let offset = 0;

  function loadNextPage() {
    const page = articles.slice(offset, offset + pageSize);
    page.forEach((article) => list.append(renderArticle(article)));
    offset += page.length;
    if (offset >= articles.length) {
      loadMoreWrapper.remove();
    }
  }

  loadMoreButton.addEventListener('click', loadNextPage);
  loadNextPage();
}
