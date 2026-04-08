/* eslint-disable */
/* global WebImporter */

/**
 * Foleon brochure cleanup transformer
 * Pattern-based — works across all brochure pages (not tied to section IDs)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove Foleon navigation chrome
    WebImporter.DOMUtils.remove(element, [
      '#navigation-wrapper',
      '#expanded-menu',
      '#im-previous-next-navigation',
      '#modal-wrapper',
      'epaas-consent-drawer-shell',
      '.sc-fptaHq',
      '.erd_scroll_detection_container',
    ]);

    const article = element.querySelector('article');
    if (!article) return;

    const sections = [...article.querySelectorAll(':scope > section')];
    const seenContent = new Set();
    const seenImages = new Set();

    sections.forEach((section) => {
      const text = section.textContent.trim();
      const colCount = section.querySelectorAll('.im-column').length;
      const btnCount = section.querySelectorAll('.im-button').length;
      const headings = section.querySelectorAll('h2, h3, h4');
      const heading = headings[0];

      // ---- REMOVE: empty/spacer sections ----
      const hasContentIframe = [...section.querySelectorAll('iframe')].some((f) => {
        const src = f.getAttribute('src') || '';
        return src && !src.includes('itsjuice.com') && !src.includes('foleon-footer');
      });
      const hasIconLinks = [...section.querySelectorAll('a')].some((a) => a.querySelector('img'));
      const hasFigure = section.querySelector('figure img, .ripley__Image--image');
      const hasViewerBg = !!section.querySelector('.viewer-background');

      if (text.length < 5 && !hasFigure && !hasViewerBg && !hasContentIframe && !hasIconLinks) {
        section.remove();
        return;
      }

      // ---- REMOVE: "best results" notices (standalone or in hero sections) ----
      if (text.includes('For best results, please view this brochure')) {
        section.remove();
        return;
      }

      // ---- REMOVE: "PLEASE CHECK LINKS BELOW" admin notices ----
      if (text.includes('PLEASE CHECK LINKS BELOW')) {
        section.remove();
        return;
      }

      // ---- REMOVE: Foleon overlay link sections (just a "c" link) ----
      if (text.length < 5 && section.querySelector('a[href*="overlay"]')) {
        section.remove();
        return;
      }

      // ---- REMOVE: tablet/mobile feature-grid duplicates (5+ cols, 0 buttons, 4+ h4s) ----
      if (colCount >= 5 && btnCount === 0 && section.querySelectorAll('h4').length >= 4) {
        section.remove();
        return;
      }

      // ---- DEDUP: sections by heading text ----
      if (heading) {
        const headingText = heading.textContent.trim();
        if (headingText && seenContent.has(headingText)) {
          section.remove();
          return;
        }
        if (headingText) seenContent.add(headingText);
      }

      // ---- DEDUP: hero sections by viewer-background image (normalize desktop/tablet/mobile suffixes) ----
      const vb = section.querySelector('.viewer-background');
      if (vb) {
        const bgStyle = window.getComputedStyle(vb).backgroundImage || '';
        const urlMatch = bgStyle.match(/url\(["']?([^"')]+)["']?\)/);
        if (urlMatch) {
          // Normalize: strip query params, responsive suffixes, and file hash
          // e.g. "x7_iconised_header_desktop.42fef0a4b7d8.jpg?ext=webp" → "x7_iconised_header"
          const imgKey = urlMatch[1]
            .replace(/\?.*$/, '')
            .replace(/_desktop|_tablet|_mobile/g, '')
            .replace(/\.[a-f0-9]{10,14}\.\w+$/, '');
          if (seenImages.has(imgKey)) {
            section.remove();
            return;
          }
          seenImages.add(imgKey);
        }
      }

      // ---- DEDUP: figure-only sections by image URL ----
      if (hasFigure && !heading && !hasViewerBg) {
        const figImg = section.querySelector('figure img, .ripley__Image--image');
        if (figImg) {
          const src = (figImg.getAttribute('src') || figImg.src || '')
            .replace(/\?.*$/, '')
            .replace(/_desktop|_tablet|_mobile/g, '')
            .replace(/\.[a-f0-9]{10,14}\.\w+$/, '');
          if (seenImages.has(src)) {
            section.remove();
            return;
          }
          seenImages.add(src);
        }
      }

      // ---- REMOVE: mobile-only image sections (filename contains "mobile_") ----
      if (hasFigure && !heading) {
        const allImgs = section.querySelectorAll('figure img, .ripley__Image--image');
        const allMobile = [...allImgs].every((img) => {
          const src = img.getAttribute('src') || '';
          return src.includes('mobile_');
        });
        if (allMobile && allImgs.length > 0) {
          section.remove();
          return;
        }
      }
    });

    // Remove IMG-xxx placeholder links
    element.querySelectorAll('a').forEach((a) => {
      const aText = a.textContent.trim();
      if (/^IMG-\d/.test(aText)) {
        const parent = a.parentElement;
        a.remove();
        if (parent && parent.tagName === 'P' && parent.textContent.trim() === '') {
          parent.remove();
        }
      }
    });

    // Clean icon prefix characters from link text ("e ", "d " prefixes)
    element.querySelectorAll('a').forEach((a) => {
      const aText = a.textContent;
      if (/^[ed]\s/.test(aText) || /^[ed]\t/.test(aText)) {
        a.textContent = aText.replace(/^[ed]\s*\t?\s*/, '');
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove Foleon iframe footer (keep content iframes like BMW Range Comparator)
    element.querySelectorAll('section').forEach((s) => {
      s.querySelectorAll('iframe').forEach((iframe) => {
        const src = iframe.getAttribute('src') || '';
        if (src.includes('itsjuice.com') || src.includes('foleon-footer')) {
          s.remove();
        }
      });
    });

    WebImporter.DOMUtils.remove(element, ['noscript', 'link']);

    // Remove hotspot SVGs not consumed by hotspot-image parser
    element.querySelectorAll('img[src*="hotspot"]').forEach((img) => {
      const parent = img.parentElement;
      img.remove();
      if (parent && parent.tagName === 'P' && parent.textContent.trim() === '') {
        parent.remove();
      }
    });

    // Deduplicate identical adjacent h4 content blocks (BMW for Business desktop+mobile)
    const allH4s = [...element.querySelectorAll('h4')];
    const seenH4 = new Set();
    allH4s.forEach((h4) => {
      const h4Text = h4.textContent.trim();
      if (seenH4.has(h4Text)) {
        // Remove this h4 and all following siblings until we hit another heading or block boundary
        let el = h4;
        while (el) {
          const next = el.nextElementSibling;
          const isEnd = next && (next.tagName === 'H1' || next.tagName === 'H2' || next.tagName === 'H3' || next.tagName === 'H4' || next.classList?.contains('import-table'));
          el.remove();
          if (isEnd || !next) break;
          el = next;
        }
      } else {
        seenH4.add(h4Text);
      }
    });

    // Deduplicate standalone images by base filename
    const seenImgSrcs = new Set();
    element.querySelectorAll('p > img').forEach((img) => {
      const src = (img.src || img.getAttribute('src') || '')
        .replace(/\?.*$/, '')
        .replace(/\.[a-f0-9]{10,14}\.\w+$/, '');
      if (seenImgSrcs.has(src)) {
        img.parentElement.remove();
      } else {
        seenImgSrcs.add(src);
      }
    });

    // Remove duplicate standalone images that match a hero-brochure block image
    // (the import sometimes keeps both the hero bg and a raw <img> of the same photo)
    const heroImgs = new Set();
    element.querySelectorAll('table th').forEach((th) => {
      if (th.textContent.includes('hero-brochure')) {
        const table = th.closest('table');
        if (table) {
          table.querySelectorAll('img').forEach((img) => {
            const src = (img.src || '').replace(/[?&]width=\d+/, '');
            if (src) heroImgs.add(src);
          });
        }
      }
    });
    if (heroImgs.size > 0) {
      element.querySelectorAll('p > img').forEach((img) => {
        const src = (img.src || '').replace(/[?&]width=\d+/, '');
        if (heroImgs.has(src)) {
          const parent = img.parentElement;
          parent.remove();
        }
      });
    }
  }
}
