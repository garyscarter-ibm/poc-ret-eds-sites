const LOCK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
</svg>`;

const UNLOCK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
  <path d="M7 11V7a5 5 0 0 1 5-5 5 5 0 0 1 5 5"/>
</svg>`;

export default async function decorate(block) {
  // Read authored content from the first cell — if it contains "unlocked", reveal content
  const firstCell = block.querySelector(':scope > div > div');
  const cellText = (firstCell || block).textContent.trim().toLowerCase();
  const isUnlocked = cellText.includes('unlocked');

  const inner = document.createElement('div');
  inner.className = 'brochure-locked-inner';

  // Heading
  const heading = document.createElement('h3');
  heading.className = 'brochure-locked-heading';
  heading.innerHTML = '<span class="redacted">A NEW DIMENSION OF INNOVATION AWAITS.</span>';

  // Body text with frost overlay
  const body = document.createElement('div');
  body.className = 'brochure-locked-body';

  const frost = document.createElement('div');
  frost.className = 'brochure-locked-frost';

  const p = document.createElement('p');
  p.textContent = 'Redefining what is possible in automotive design and engineering. '
    + 'An entirely new approach that pushes beyond every expectation. '
    + 'Precision meets vision in a bold leap forward for the driving experience.';

  body.append(frost, p);

  // Badge
  const badge = document.createElement('div');
  badge.className = 'brochure-locked-badge';

  const icon = document.createElement('div');
  icon.className = 'brochure-locked-icon';
  icon.innerHTML = isUnlocked ? UNLOCK_ICON : LOCK_ICON;

  const label = document.createElement('span');
  label.className = 'brochure-locked-label';
  label.textContent = isUnlocked ? 'Unlocked' : 'Coming Soon';

  badge.append(icon, label);

  inner.append(heading, body, badge);
  block.textContent = '';
  block.append(inner);

  if (isUnlocked) {
    block.classList.add('unlocked');
  }
}
