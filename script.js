/* ================================================================
   KENETT FERNANDEZ — PORTFOLIO SCRIPTS v2.1
   script.js

   1.  Noise Canvas
   2.  Custom Cursor
   3.  Scroll Progress Bar
   4.  Live Clock (Nav)
   5.  Text Scramble Effect
   6.  Work: cards, in-card preview, filter
   7.  Active Nav on Scroll
   8.  Scroll Reveal
   9.  Stat Counter Animation
   10. Smooth Scroll
================================================================ */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* 1. NOISE CANVAS */
(function () {
  const canvas = document.getElementById('noiseCanvas');
  if (!canvas || REDUCED_MOTION) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  function drawNoise() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i + 1] = data[i + 2] = Math.random() * 255 | 0;
      data[i + 3] = 18;
    }
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(drawNoise);
  }
  resize();
  window.addEventListener('resize', resize);
  drawNoise();
})();


/* 2. CUSTOM CURSOR */
(function () {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Delegated, so it also covers elements created later (work links, filter buttons)
  const hoverSel = 'a, button, .work-item, .tag, .stat-cell, .stack-cell';
  document.addEventListener('mouseover', (e) => {
    document.body.classList.toggle('cursor-hover', !!e.target.closest(hoverSel));
  });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
  document.documentElement.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.documentElement.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();


/* 3. SCROLL PROGRESS BAR */
(function () {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
  }, { passive: true });
})();


/* 4. LIVE CLOCK (NAV) */
(function () {
  const el = document.getElementById('navClock');
  if (!el) return;
  function tick() {
    const now = new Date();
    const p = (n) => String(n).padStart(2, '0');
    el.textContent = `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())} PHT`;
  }
  tick();
  setInterval(tick, 1000);
})();


/* 5. TEXT SCRAMBLE EFFECT */
(function () {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

  function scramble(el) {
    const target = el.dataset.text || el.textContent;
    const duration = 900;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const resolved = Math.floor(progress * target.length);
      let output = '';
      for (let i = 0; i < target.length; i++) {
        output += (i < resolved || target[i] === ' ')
          ? target[i]
          : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      el.textContent = output;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  if (REDUCED_MOTION) return;
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.querySelectorAll('.scramble-text').forEach((el, i) => {
        setTimeout(() => scramble(el), i * 120);
      });
    }, 200);
  });
})();


/* ================================================================
   6. WORK — links, preview inside each card, filter
================================================================ */
(function () {
  const list = document.getElementById('workList');
  if (!list) return;
  const items = Array.from(list.querySelectorAll('.work-item'));

  function externalLink(href, cls) {
    const a = document.createElement('a');
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    if (cls) a.className = cls;
    return a;
  }

  /* Preview frame: screenshot, video, or wireframe placeholder */
  function buildFrame(item) {
    const d     = item.dataset;
    const title = item.querySelector('.work-title').textContent.trim();
    const host  = d.live
      ? d.live.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
      : (d.status === 'soon' ? 'coming soon' : 'preview');

    const frame = document.createElement('div');
    frame.className = 'wp-frame';
    frame.innerHTML =
      '<div class="wp-bar"><i></i><i></i><i></i><span class="wp-url"></span></div>' +
      '<div class="wp-body"></div>';
    frame.querySelector('.wp-url').textContent = host;
    const body = frame.querySelector('.wp-body');

    if (d.video) {
      const v = document.createElement('video');
      v.className = 'wp-video'; v.src = d.video;
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
      body.appendChild(v);
      item.addEventListener('mouseenter', () => v.play().catch(() => {}));
      item.addEventListener('mouseleave', () => { v.pause(); v.currentTime = 0; });
    } else if (d.preview) {
      const img = document.createElement('img');
      img.className = 'wp-img'; img.src = d.preview;
      img.alt = `${title} preview`; img.loading = 'lazy';
      body.appendChild(img);

      // measure on hover (works even if the card was hidden by the filter earlier)
      if (!REDUCED_MOTION) {
        item.addEventListener('mouseenter', () => {
          const dist = img.offsetHeight - body.clientHeight;
          if (dist <= 0) return;
          body.style.setProperty('--dist', dist + 'px');
          body.style.setProperty('--dur', Math.min(Math.max(dist / 60, 3), 9) + 's');
        });
      }
    } else {
      // wireframe placeholder (also sits underneath a live embed until it loads)
      body.innerHTML =
        '<div class="sk">' +
          '<div class="sk-nav"><b></b><span></span><span></span><span></span></div>' +
          '<div class="sk-hero"><div class="sk-title"></div><span class="sk-line"></span><span class="sk-line"></span><span class="sk-btn"></span></div>' +
          '<div class="sk-grid"><span></span><span></span><span></span></div>' +
        '</div>';
      body.querySelector('.sk-title').textContent = title;

      if (d.embed) {
        const wrap = document.createElement('div');
        wrap.className = 'wp-embed';
        const f = document.createElement('iframe');
        f.src = d.embed; f.loading = 'lazy'; f.title = `${title} — live preview`;
        f.tabIndex = -1; f.referrerPolicy = 'no-referrer';
        f.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        f.setAttribute('aria-hidden', 'true');
        f.addEventListener('load', () => wrap.classList.add('ready'));
        wrap.appendChild(f);
        body.appendChild(wrap);

        // scale the 1280px-wide page down to the card width
        const fit = () => { if (body.clientWidth) f.style.transform = `scale(${body.clientWidth / 1280})`; };
        fit();
        new ResizeObserver(fit).observe(body);
      }
    }
    return frame;
  }

  items.forEach(item => {
    const { live, github, cat, status } = item.dataset;
    const links = item.querySelector('.work-links');
    const title = item.querySelector('.work-title');
    const isLive = live && status !== 'soon';

    // preview at the top of the card (clickable when there's a live link)
    const thumb = isLive ? externalLink(live, 'work-thumb') : document.createElement('div');
    if (!isLive) thumb.className = 'work-thumb';
    else { thumb.tabIndex = -1; thumb.setAttribute('aria-label', `Open ${title.textContent.trim()}`); }
    thumb.appendChild(buildFrame(item));
    if (isLive) {
      const pill = document.createElement('span');
      pill.className = 'wp-open';
      pill.textContent = cat === 'uiux' ? 'Open prototype ↗' : 'Open site ↗';
      thumb.appendChild(pill);
    }
    item.prepend(thumb);

    if (isLive) {
      const btn = externalLink(live, 'dev-btn');
      btn.textContent = cat === 'uiux' ? 'Prototype ↗' : 'Live ↗';
      links.appendChild(btn);

      const a = externalLink(live);
      a.textContent = title.textContent;
      title.textContent = '';
      title.appendChild(a);
    }
    if (github) {
      const gh = externalLink(github, 'dev-btn');
      gh.textContent = 'GitHub ↗';
      links.appendChild(gh);
    }
  });

  /* Filter */
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filterBtns.forEach(b => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on);
      });
      items.forEach(item => { item.hidden = f !== 'all' && item.dataset.cat !== f; });
    });
  });
})();


/* 7. ACTIVE NAV HIGHLIGHT ON SCROLL */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
    navLinks.forEach(l => { l.style.color = l.getAttribute('href') === `#${current}` ? 'var(--text)' : ''; });
  }, { passive: true });
})();


/* 8. SCROLL REVEAL (sections only — keeps hover previews snappy) */
(function () {
  const els = document.querySelectorAll('.section');
  if (REDUCED_MOTION) return;
  els.forEach(el => el.classList.add('reveal'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.07 });
  els.forEach(el => observer.observe(el));
})();


/* 9. STAT COUNTER ANIMATION */
(function () {
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  const about = document.getElementById('about');
  if (!statNums.length || !about || REDUCED_MOTION) return;

  function countUp(el) {
    const target = parseInt(el.dataset.target, 10);
    const start = performance.now();
    (function step(now) {
      const progress = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + (progress >= 1 ? '+' : '');
      if (progress < 1) requestAnimationFrame(step);
    })(start);
  }

  const obs = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      statNums.forEach((el, i) => setTimeout(() => countUp(el), i * 120));
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(about);
})();


/* 10. SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});