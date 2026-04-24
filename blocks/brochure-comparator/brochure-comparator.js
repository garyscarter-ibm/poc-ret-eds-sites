const ALLOWED_ORIGINS = ['https://range-comparator.bmwlaunchpad.co.uk'];

function isAllowedUrl(url) {
  try {
    const { origin } = new URL(url);
    return ALLOWED_ORIGINS.some((allowed) => origin === allowed);
  } catch {
    return false;
  }
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const url = link?.href || block.textContent.trim();

  if (!url || !isAllowedUrl(url)) {
    block.textContent = '';
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.title = 'BMW Range Comparator';
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('frameborder', '0');

  block.textContent = '';
  block.classList.add('brochure-comparator-embed');
  block.append(iframe);
}
