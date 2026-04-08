/**
 * Section Heading block
 * Renders an eyebrow subtitle + separator + large split heading + optional body text
 *
 * Content model — Default variant (4 rows):
 *   Row 1: Eyebrow text (e.g., "INTRODUCING THE X7")
 *   Row 2: Heading line 1 (e.g., "THIS IS")
 *   Row 3: Heading line 2 (e.g., "FORWARDISM.")
 *   Row 4 (optional): Body paragraph
 *
 * Content model — Compact variant (3 rows, no eyebrow):
 *   Row 1: Heading line 1 (e.g., "INTRODUCING THE X7.")
 *   Row 2: Heading line 2 (e.g., "LUXURY WITHOUT LIMITS.")
 *   Row 3 (optional): Body paragraph
 */
export default function decorate(block) {
  const rows = [...block.children];
  const isCompact = block.classList.contains('compact');

  let eyebrowText = '';
  let line1Text = '';
  let line2Text = '';
  let bodyText = '';

  if (isCompact) {
    // Compact: no eyebrow — row 0=line1, row 1=line2, row 2=body
    line1Text = rows[0]?.textContent.trim() || '';
    line2Text = rows[1]?.textContent.trim() || '';
    bodyText = rows[2]?.textContent.trim() || '';
  } else {
    // Default: row 0=eyebrow, row 1=line1, row 2=line2, row 3=body
    eyebrowText = rows[0]?.textContent.trim() || '';
    line1Text = rows[1]?.textContent.trim() || '';
    line2Text = rows[2]?.textContent.trim() || '';
    bodyText = rows[3]?.textContent.trim() || '';
  }

  block.textContent = '';

  // Eyebrow (default variant only)
  if (eyebrowText) {
    const p = document.createElement('p');
    p.className = 'section-heading-eyebrow';
    p.textContent = eyebrowText;
    block.append(p);
  }

  // Separator line
  if (line1Text || line2Text) {
    const hr = document.createElement('hr');
    hr.className = 'section-heading-separator';
    block.append(hr);
  }

  // Heading line 1
  if (line1Text) {
    const h2 = document.createElement('h2');
    h2.className = 'section-heading-line1';
    h2.textContent = line1Text;
    block.append(h2);
  }

  // Heading line 2
  if (line2Text) {
    const h2 = document.createElement('h2');
    h2.className = 'section-heading-line2';
    h2.textContent = line2Text;
    block.append(h2);
  }

  // Body paragraph
  if (bodyText && bodyText.length > 10) {
    const p = document.createElement('p');
    p.className = 'section-heading-body';
    p.textContent = bodyText;
    block.append(p);
  }

  // Info tooltip (compact variant — the "i" circle from the original)
  if (isCompact && bodyText) {
    const info = document.createElement('button');
    info.className = 'section-heading-info';
    info.setAttribute('aria-label', 'More information');
    info.textContent = 'i';
    info.addEventListener('click', () => {
      info.classList.toggle('active');
    });
    block.append(info);
  }

  // Scroll-triggered animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        block.classList.add('in-viewport');
        observer.unobserve(block);
      }
    });
  }, { threshold: 0.2 });
  observer.observe(block);
}
