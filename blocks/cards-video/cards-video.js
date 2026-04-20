export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const cols = [...row.children];

    // First col: video or placeholder image
    const mediaCol = cols[0];
    const textCol = cols[1];

    // Media wrapper (portrait video container)
    const mediaWrapper = document.createElement('div');
    mediaWrapper.className = 'cards-video-media';

    const video = mediaCol?.querySelector('a[href*=".mp4"], a[href*=".webm"], a[href*=".mov"], video');
    const img = mediaCol?.querySelector('picture, img');

    if (video) {
      // Build video element from link
      const videoEl = document.createElement('video');
      videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('controls', '');
      videoEl.setAttribute('preload', 'metadata');
      const href = video.href || video.getAttribute('href') || video.src;
      if (href) {
        const source = document.createElement('source');
        source.src = href;
        source.type = href.includes('.webm') ? 'video/webm' : 'video/mp4';
        videoEl.append(source);
      }
      // Use image as poster if available
      const poster = mediaCol.querySelector('img');
      if (poster) videoEl.setAttribute('poster', poster.src);
      mediaWrapper.append(videoEl);
    } else if (img) {
      // Placeholder image
      const placeholder = document.createElement('div');
      placeholder.className = 'cards-video-placeholder';
      placeholder.append(img);
      // Add play icon overlay
      const playIcon = document.createElement('div');
      playIcon.className = 'cards-video-play-icon';
      playIcon.innerHTML = '<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="23" stroke="white" stroke-width="2"/><path d="M19 15l14 9-14 9V15z" fill="white"/></svg>';
      placeholder.append(playIcon);
      mediaWrapper.append(placeholder);
    }

    li.append(mediaWrapper);

    // Text content (name + role)
    if (textCol) {
      const body = document.createElement('div');
      body.className = 'cards-video-body';
      while (textCol.firstElementChild) body.append(textCol.firstElementChild);
      li.append(body);
    }

    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
