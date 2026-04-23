const DEFAULT_URL = 'https://range-comparator.bmwlaunchpad.co.uk/?model1=297&model2=283';

export default async function decorate(block) {
  // Use authored URL from first cell, or fall back to default
  const authoredUrl = block.querySelector('a')?.href
    || block.textContent.trim();
  const src = authoredUrl.startsWith('http') ? authoredUrl : DEFAULT_URL;

  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-comparator-inner';

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = 'BMW Model Comparator';
  iframe.loading = 'lazy';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', '');

  wrapper.append(iframe);
  block.textContent = '';
  block.append(wrapper);
}
