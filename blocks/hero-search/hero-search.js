/**
 * Hero Search block — full-width hero banner with gradient overlay.
 * Author provides a background image and headline text.
 *
 * Authored structure:
 * | hero-search |
 * | (image)     |
 * | Headline text |
 */
export default function decorate(block) {
  const rows = [...block.children];
  const picture = rows[0]?.querySelector('picture');
  const headingRow = rows[1] || rows[0];
  const headingText = headingRow?.textContent?.trim() || '';

  block.textContent = '';

  const overlay = document.createElement('div');
  overlay.className = 'hero-search-overlay';

  if (picture) {
    const bg = document.createElement('div');
    bg.className = 'hero-search-bg';
    bg.append(picture);
    block.append(bg);
  }

  const h1 = document.createElement('h1');
  h1.textContent = headingText;
  overlay.append(h1);
  block.append(overlay);
}
