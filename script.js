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

// Achievements Page: Expand Button & Big Picture Modal Window
{
  const win = document.getElementById('preview-win');
  const backdrop = document.getElementById('preview-backdrop');
  const winTitle = document.getElementById('win-title');
  const winSub = document.getElementById('win-sub');
  const winGallery = document.getElementById('win-gallery');
  const winClose = document.getElementById('win-close');
  const cards = document.querySelectorAll('.tab-card');

  if (win && backdrop && cards.length) {
    const openPreview = (card, focusIndex = -1) => {
      cards.forEach(c => c.classList.toggle('active-tab', c === card));

      const title = card.querySelector('h2').textContent;
      const desc = card.querySelector('p').textContent;
      const slots = Array.from(card.querySelectorAll('.slot'));

      winTitle.textContent = title;
      winSub.textContent = '— ' + desc;

      winGallery.innerHTML = slots.map((slot, idx) => {
        const label = slot.textContent.trim();
        const imgEl = slot.querySelector('img');
        const imgSrc = (imgEl && imgEl.getAttribute('src')) || slot.dataset.img || '';
        const focusedClass = idx === focusIndex ? ' focused' : '';

        return `<div class="win-item${focusedClass}">
          <img src="${imgSrc}" alt="${label} - ${title}">
          <span class="win-label">${label}</span>
        </div>`;
      }).join('');

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
      slots.forEach((slot, idx) => {
        slot.addEventListener('click', () => openPreview(card, idx));
      });
    });

    if (winClose) winClose.addEventListener('click', closePreview);
    backdrop.addEventListener('click', closePreview);

    addEventListener('keydown', e => {
      if (e.key === 'Escape' && win.classList.contains('open')) closePreview();
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
