export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const mediaCol = row.children[0];
  const contentCol = row.children[1];

  // Create video from mp4 link + poster image
  if (mediaCol) {
    const link = [...mediaCol.querySelectorAll('a')].find((a) => a.href.endsWith('.mp4'));
    const img = mediaCol.querySelector('img');

    if (link) {
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      if (img) video.poster = img.src;

      const source = document.createElement('source');
      source.src = link.href;
      source.type = 'video/mp4';
      video.append(source);

      // Ensure autoplay works in all browsers including headless
      video.addEventListener('canplay', () => {
        video.play().catch(() => {});
      }, { once: true });

      mediaCol.replaceChildren(video);
    }
    mediaCol.classList.add('showcase-media');
  }

  // Structure content into card layout
  if (contentCol) {
    const h2 = contentCol.querySelector('h2');
    const allP = [...contentCol.querySelectorAll('p')];

    // Classify paragraphs
    const fuel = allP.find((p) => {
      const t = p.textContent.trim();
      return !p.querySelector('a') && t.length < 20 && !t.includes(':');
    });

    const desc = allP.find((p) => {
      const t = p.textContent.trim();
      return !p.querySelector('a') && t.length > 30;
    });

    const specs = allP.filter((p) => {
      const t = p.textContent.trim();
      return !p.querySelector('a') && t.includes(':') && t.length < 30;
    });

    const ctaP = allP.find((p) => p.querySelector('a'));

    // Build info section
    const info = document.createElement('div');
    info.className = 'showcase-info';
    if (h2) info.append(h2);
    if (fuel) {
      fuel.className = 'showcase-fuel';
      info.append(fuel);
    }
    if (desc) {
      desc.className = 'showcase-desc';
      info.append(desc);
    }

    // Build specs section
    const specsEl = document.createElement('ul');
    specsEl.className = 'showcase-specs';
    specs.forEach((p) => {
      const parts = p.textContent.split(':');
      const label = parts[0].trim();
      const rawValue = parts.slice(1).join(':').trim();
      const li = document.createElement('li');
      li.classList.add(`spec-${label.toLowerCase().replace(/[^a-z0-9]/g, '')}`);

      const labelSpan = document.createElement('span');
      labelSpan.className = 'spec-label';
      labelSpan.textContent = label;

      const valueSpan = document.createElement('span');
      valueSpan.className = 'spec-value';

      // Split number from unit (e.g. "4.9 Secs" -> "4.9" + "Secs")
      const match = rawValue.match(/^([\d.]+)\s*(.*)$/);
      if (match) {
        const numSpan = document.createElement('span');
        numSpan.className = 'spec-num';
        numSpan.textContent = match[1];
        valueSpan.append(numSpan);

        if (match[2]) {
          const unitSpan = document.createElement('span');
          unitSpan.className = 'spec-unit';
          unitSpan.textContent = match[2];
          valueSpan.append(unitSpan);
        }
      } else {
        valueSpan.textContent = rawValue;
      }

      li.append(labelSpan, valueSpan);
      specsEl.append(li);
    });

    // Build CTA
    const ctaDiv = document.createElement('div');
    ctaDiv.className = 'showcase-cta';
    if (ctaP) {
      const ctaLink = ctaP.querySelector('a');
      if (ctaLink) {
        ctaLink.className = 'showcase-link cta-chevron cta-chevron--blue';
        ctaDiv.append(ctaLink);
      }
    }

    contentCol.replaceChildren(info, specsEl, ctaDiv);
    contentCol.classList.add('showcase-content');
  }
}
