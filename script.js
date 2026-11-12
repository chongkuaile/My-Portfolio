// Mobile Navigation Menu Toggle
const menu = document.querySelector('.menu'), nav = document.getElementById('nav');
if (menu && nav) {
  menu.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', nav.classList.toggle('open'));
  });
}

// Home: glow and photo follow the pointer (skipped on touch screens and with reduced motion)
{
  const hero = document.querySelector('.hero');
  if (hero && matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      hero.style.setProperty('--mx', x + 'px');
      hero.style.setProperty('--my', y + 'px');
      hero.style.setProperty('--px', (x / r.width - .5) * 2);
      hero.style.setProperty('--py', (y / r.height - .5) * 2);
    });
  }
}

// Achievements Page: Expand Button & 16:9 Image Holder with Left/Right Cycling Arrows
{
  const win = document.getElementById('preview-win');
  const backdrop = document.getElementById('preview-backdrop');
  const winTitle = document.getElementById('win-title');
  const winSub = document.getElementById('win-sub');
  const winGallery = document.getElementById('win-gallery');
  const winCount = document.getElementById('win-count');
  const winClose = document.getElementById('win-close');
  const cards = document.querySelectorAll('.tab-card');

  if (win && backdrop && cards.length) {
    let currentItems = [];
    let currentIndex = 0;
    let currentTitle = '';

    const leftArrowSVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`;
    const rightArrowSVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>`;

    const renderSlide = index => {
      if (!currentItems.length) return;
      currentIndex = (index + currentItems.length) % currentItems.length;
      const item = currentItems[currentIndex];
      const hasMultiple = currentItems.length > 1;

      if (winCount) {
        winCount.textContent = hasMultiple ? `${currentIndex + 1} / ${currentItems.length}` : '';
      }

      winGallery.innerHTML = `<div class="win-item">
        ${hasMultiple ? `<button type="button" class="win-nav prev" aria-label="Previous image">${leftArrowSVG}</button>` : ''}
        <img src="${item.src}" alt="${item.label} - ${currentTitle}">
        <span class="win-label">${item.label}</span>
        ${hasMultiple ? `<button type="button" class="win-nav next" aria-label="Next image">${rightArrowSVG}</button>` : ''}
      </div>`;

      if (hasMultiple) {
        winGallery.querySelector('.win-nav.prev').addEventListener('click', e => {
          e.stopPropagation();
          renderSlide(currentIndex - 1);
        });
        winGallery.querySelector('.win-nav.next').addEventListener('click', e => {
          e.stopPropagation();
          renderSlide(currentIndex + 1);
        });
      }
    };

    const openPreview = card => {
      cards.forEach(c => c.classList.toggle('active-tab', c === card));

      currentTitle = card.querySelector('h2').textContent;
      const desc = card.querySelector('p').textContent;
      const slots = Array.from(card.querySelectorAll('.slot'));

      currentItems = slots.map(slot => {
        const label = slot.textContent.trim();
        const imgEl = slot.querySelector('img');
        const src = (imgEl && imgEl.getAttribute('src')) || slot.dataset.img || '';
        return { src, label };
      });

      if (card.dataset.extra) {
        try {
          const extras = JSON.parse(card.dataset.extra);
          currentItems.push(...extras);
        } catch (e) {}
      }

      winTitle.textContent = currentTitle;
      winSub.textContent = '— ' + desc;

      renderSlide(0);

      backdrop.classList.add('open');
      win.classList.add('open');
      win.setAttribute('aria-hidden', 'false');
    };

    const closePreview = () => {
      backdrop.classList.remove('open');
      win.classList.remove('open');
      win.setAttribute('aria-hidden', 'true');
      cards.forEach(c => c.classList.remove('active-tab'));
    };

    cards.forEach(card => {
      const expandBtn = card.querySelector('.expand-btn');
      const slots = card.querySelectorAll('.slot');

      if (expandBtn) {
        expandBtn.addEventListener('click', () => openPreview(card));
      }
      slots.forEach(slot => {
        slot.addEventListener('click', () => openPreview(card));
      });
    });

    if (winClose) winClose.addEventListener('click', closePreview);
    backdrop.addEventListener('click', closePreview);

    addEventListener('keydown', e => {
      if (!win.classList.contains('open')) return;
      if (e.key === 'Escape') closePreview();
      if (e.key === 'ArrowLeft' && currentItems.length > 1) renderSlide(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentItems.length > 1) renderSlide(currentIndex + 1);
    });
  }
}

// Side decoration on wide screens: editor line numbers (left), circuit traces, scroll progress (right)
{
  const add = (cls, html, css) => {
    const d = document.createElement('div');
    d.className = 'deco ' + cls;
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = html;
    if (css) d.style.cssText = css;
    document.body.append(d);
    return d;
  };
  const gutter = add('gutter', '');
  let n = 0;
  const fill = () => {
    const c = Math.ceil(document.body.offsetHeight / 26);
    if (c === n) return;
    n = c;
    gutter.innerHTML = Array.from({ length: c }, (_, i) => '<span>' + String(i + 1).padStart(2, '0') + '</span>').join('');
  };
  new ResizeObserver(fill).observe(document.body);
  fill();
  addEventListener('pointermove', e => {
    const on = gutter.querySelector('.on'), el = gutter.children[Math.floor((e.clientY + scrollY) / 26)];
    if (on) on.classList.remove('on');
    if (el) el.classList.add('on');
  }, { passive: true });

  const P = ['M0 60H70L100 90V200L120 220H160', 'M0 260H40L70 290V380H130', 'M0 430H90L120 460H160'];
  const C = [[160, 220], [130, 380], [160, 460]];
  const svg = '<svg viewBox="0 0 160 520" preserveAspectRatio="xMinYMid meet">' +
    P.map(d => '<path d="' + d + '"/>').join('') +
    C.map(c => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.5"/>').join('') +
    P.map((d, i) => '<path class="pk" style="animation-delay:-' + i * 2.3 + 's" d="' + d + '"/>').join('') +
    '</svg>';
  add('trace tl', svg);
  add('trace tr', svg);

  [['{ }', 'left', 20, 2.2], ['</>', 'right', 30, 1.6], ['=>', 'left', 72, 1.6], ['01', 'right', 78, 2]]
    .forEach(([t, s, y, z]) => add('glyph', t, s + ':calc((100vw - 1080px)/4);top:' + y + 'vh;font-size:' + z + 'rem'));

  const prog = add('prog', '<b></b><i>0%</i>');
  const upd = () => {
    const m = document.documentElement.scrollHeight - innerHeight, p = m > 0 ? Math.min(1, scrollY / m) : 0;
    prog.style.setProperty('--p', p);
    prog.lastChild.textContent = Math.round(p * 100) + '%';
  };
  addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd);
  new ResizeObserver(upd).observe(document.body);
  upd();
}
