const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function getSlideTitle(slide) {
  const p = slide.querySelector(':scope > p');
  if (!p) return slide.classList[1] || 'Untitled';
  const raw = p.innerHTML || '';
  const match = raw.match(/^(.*?)(?:<\/?br\s*\/?>\s*){2}/i);
  if (match) return match[1].replace(/<[^>]+>/g, '').trim() || slide.classList[1] || 'Untitled';
  return p.textContent.trim().split(/\n/)[0].trim() || slide.classList[1] || 'Untitled';
}

function parseBlocks(content) {
  const blocks = [];
  Array.from(content.children).forEach((el) => {
    if (el.tagName === 'P') {
      blocks.push({ type: 'text', html: el.outerHTML });
      return;
    }
    if (el.tagName === 'IMG') {
      blocks.push({
        type: 'image',
        src: el.getAttribute('src') || '',
        alt: el.getAttribute('alt') || '',
        className: el.getAttribute('class') || 'bw-image',
        sizes: el.getAttribute('sizes') || '',
        srcset: el.getAttribute('srcset') || ''
      });
      return;
    }
    const iframe = el.tagName === 'IFRAME' ? el : el.querySelector(':scope > iframe');
    if (iframe) {
      blocks.push({
        type: 'embed',
        src: iframe.getAttribute('src') || '',
        title: iframe.getAttribute('title') || '',
        height: iframe.getAttribute('height') || '800px',
        wrapperClass: el.tagName === 'IFRAME' ? 'bw-image' : (el.getAttribute('class') || 'video-container')
      });
      return;
    }
    blocks.push({ type: 'raw', html: el.outerHTML });
  });
  return blocks;
}

function fromTeachingHtml(text) {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const slides = Array.from(doc.querySelectorAll('#slider-track > .slide'));
  return {
    slides: slides.map((slide) => ({
      title: getSlideTitle(slide),
      className: Array.from(slide.classList).slice(1).join(' ') || 'slide',
      blocks: parseBlocks(slide.querySelector('.slide-content') || slide)
    }))
  };
}

function renderBlock(block) {
  if (!block) return '';
  if (block.type === 'text') return block.html || '<p></p>';
  if (block.type === 'image') {
    const attrs = [
      `src="${escapeHtml(block.src || '')}"`,
      'loading="lazy"',
      `alt="${escapeHtml(block.alt || '')}"`,
      `class="${escapeHtml(block.className || 'bw-image')}"`
    ];
    if (block.sizes) attrs.push(`sizes="${escapeHtml(block.sizes)}"`);
    if (block.srcset) attrs.push(`srcset="${escapeHtml(block.srcset)}"`);
    return `<img ${attrs.join(' ')}>`;
  }
  if (block.type === 'embed') {
    const wrapper = block.wrapperClass || 'video-container';
    return `<div class="${escapeHtml(wrapper)}"><iframe src="${escapeHtml(block.src || '')}" title="${escapeHtml(block.title || '')}" height="${escapeHtml(block.height || '800px')}" width="100%" style="border:none;width:100%;" loading="lazy" allowfullscreen></iframe></div>`;
  }
  return block.html || '';
}

function toTeachingHtml(data) {
  const slides = (data.slides || []).map((slide) => {
    const className = slide.className || 'slide';
    const blocks = (slide.blocks || []).map(renderBlock).join('\n');
    return `        <div class="slide ${escapeHtml(className)}">\n          <div class="slide-content">\n${blocks}\n          </div>\n        </div>`;
  }).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teaching</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <link href="images/favicon.png" rel="shortcut icon" type="image/x-icon">
  <style>
    .custom-popup-wrapper { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0); display:flex; justify-content:center; align-items:center; z-index:9999; cursor:zoom-out; opacity:0; transition:background .6s ease, backdrop-filter .6s ease, opacity .6s; backdrop-filter:blur(0); pointer-events:none; }
  </style>
</head>
<div id="loader-wrapper"><div class="custom-loader"><div class="white-dot"></div></div><div id="loading-text">0%</div></div>
<body>
  <div class="app-container">
    <nav class="sidebar">
      <div class="menu"><a href="index.html">Clive.Ng</a></div>
      <ul class="menu">
        <li><a href="research.html">Research</a></li>
        <li><a href="design.html">Design</a></li>
        <li><a href="teaching.html">Teaching</a></li>
        <li><a href="playground.html">Playground</a></li>
      </ul>
    </nav>
    <main class="content-area">
      <div class="pagination-dots" id="dots-container"></div>
      <button class="nav-btn prev" id="prev-btn" onclick="moveSlide(-1)"></button>
      <button class="nav-btn next" id="next-btn" onclick="moveSlide(1)"></button>
      <div class="slider-track" id="slider-track">
${slides}
        <div class="left-arrow w-slider-arrow-left"><img src="images/btn.svg" loading="lazy" width="18" height="18" alt=""></div>
        <div class="right-arrow w-slider-arrow-right"><img src="images/btn.svg" loading="lazy" width="18" height="18" alt=""></div>
      </div>
    </main>
  </div>
  <script src="js/script.js"></script>
</body>
</html>
`;
}

CMS.registerCustomFormat('teaching-html', 'html', {
  fromFile: fromTeachingHtml,
  toFile: toTeachingHtml
});

CMS.init({
  config: {
    backend: {
      name: 'github',
      repo: 'clive-ng/web',
      branch: 'cms-teaching-v1d'
    },
    media_folder: 'images',
    public_folder: 'images',
    collections: [
      {
        name: 'teaching',
        label: 'Teaching',
        files: [
          {
            name: 'teaching',
            label: 'Teaching Page',
            file: 'teaching.html',
            format: 'teaching-html',
            fields: [
              {
                name: 'slides',
                label: 'Teaching Sections',
                widget: 'list',
                label_singular: 'Section',
                summary: '{{title}}',
                collapsed: 'auto',
                types: [
                  {
                    name: 'section',
                    label: 'Teaching Section',
                    fields: [
                      { name: 'title', label: 'Title', widget: 'string' },
                      { name: 'className', label: 'CSS Class', widget: 'string', required: false, hint: 'Normally leave this as it is. It controls the existing visual styling.' },
                      {
                        name: 'blocks',
                        label: 'Content',
                        widget: 'list',
                        label_singular: 'Content Block',
                        collapsed: 'auto',
                        types: [
                          {
                            name: 'text',
                            label: 'Text / HTML',
                            fields: [
                              { name: 'html', label: 'Content', widget: 'code', output_code_only: true, allow_language_selection: false, default_language: 'html' }
                            ]
                          },
                          {
                            name: 'image',
                            label: 'Image',
                            fields: [
                              { name: 'src', label: 'Image', widget: 'image' },
                              { name: 'alt', label: 'Alt text', widget: 'string', required: false },
                              { name: 'className', label: 'CSS Class', widget: 'string', default: 'bw-image', required: false },
                              { name: 'sizes', label: 'Responsive sizes', widget: 'string', required: false },
                              { name: 'srcset', label: 'Responsive srcset', widget: 'string', required: false, hint: 'Optional. Leave blank for newly uploaded images.' }
                            ]
                          },
                          {
                            name: 'embed',
                            label: 'Embed / Video / Website',
                            fields: [
                              { name: 'src', label: 'URL', widget: 'string', type: 'url' },
                              { name: 'title', label: 'Title', widget: 'string', required: false },
                              { name: 'height', label: 'Height', widget: 'string', default: '800px', required: false },
                              { name: 'wrapperClass', label: 'Wrapper CSS Class', widget: 'string', default: 'video-container', required: false }
                            ]
                          },
                          {
                            name: 'raw',
                            label: 'Advanced HTML',
                            fields: [
                              { name: 'html', label: 'HTML', widget: 'code', output_code_only: true, allow_language_selection: false, default_language: 'html' }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
});
