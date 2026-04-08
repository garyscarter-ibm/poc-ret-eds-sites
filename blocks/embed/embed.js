/**
 * Embed block
 * Renders external content via iframe (e.g., BMW Range Comparator, configurators)
 *
 * Content model (authored as a table):
 *   Row 1: URL of the embed (plain text or link)
 *   Row 2 (optional): Title/caption text
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  // Extract URL from first row
  const urlRow = rows[0];
  let embedUrl = '';
  if (urlRow) {
    const link = urlRow.querySelector('a');
    if (link) {
      embedUrl = link.href;
    } else {
      embedUrl = urlRow.textContent.trim();
    }
  }

  // Extract optional title from second row
  const titleRow = rows[1];
  const title = titleRow ? titleRow.textContent.trim() : '';

  if (!embedUrl) return;

  // Create responsive iframe container
  const wrapper = document.createElement('div');
  wrapper.className = 'embed-wrapper';

  const iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.title = title || 'Embedded content';
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');

  wrapper.append(iframe);
  block.append(wrapper);

  if (title) {
    const caption = document.createElement('p');
    caption.className = 'embed-caption';
    caption.textContent = title;
    block.append(caption);
  }
}
