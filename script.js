/* ================================================================
   KENETT FERNANDEZ — PORTFOLIO SCRIPTS v2.0
   script.js

   TABLE OF CONTENTS:
   1.  Noise Canvas
   2.  Custom Cursor
   3.  Scroll Progress Bar
   4.  Live Clock (Nav)
   5.  Text Scramble Effect
   6.  Tab Switching
   7.  Lightbox (Photography)
   8.  Video Hover Preview
   9.  Dev Card Links
   10. Active Nav on Scroll
   11. Scroll Reveal
   12. Stat Counter Animation
   13. Smooth Scroll
================================================================ */


/* ================================================================
   1. NOISE CANVAS
   Generates animated grain texture overlay
================================================================ */
(function () {
  const canvas = document.getElementById('noiseCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animId;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawNoise() {
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      data[i] = data[i+1] = data[i+2] = v;
      data[i+3] = 18; // very low alpha for subtlety
    }
    ctx.putImageData(imageData, 0, 0);
    animId = requestAnimationFrame(drawNoise);
  }

  resize();
  window.addEventListener('resize', resize);
  drawNoise();
})();


/* ================================================================
   2. CUSTOM CURSOR
================================================================ */
(function () {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Ring follows with slight lag
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state on interactive elements
  const hoverTargets = 'a, button, .project-card, .tab-btn, .tag, .stat-cell';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
})();


/* ================================================================
   3. SCROLL PROGRESS BAR
================================================================ */
(function () {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? (scrolled / total) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();


/* ================================================================
   4. LIVE CLOCK (NAV)
================================================================ */
(function () {
  const el = document.getElementById('navClock');
  if (!el) return;

  function tick() {
    const now = new Date();
    const hh  = String(now.getHours()).padStart(2, '0');
    const mm  = String(now.getMinutes()).padStart(2, '0');
    const ss  = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${hh}:${mm}:${ss} PHT`;
  }
  tick();
  setInterval(tick, 1000);
})();


/* ================================================================
   5. TEXT SCRAMBLE EFFECT
   Letters randomise then resolve to the real text on load
================================================================ */
(function () {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

  function scramble(el) {
    const target   = el.dataset.text || el.textContent;
    const duration = 900;
    const start    = performance.now();
    let   frame    = 0;

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const resolved = Math.floor(progress * target.length);

      let output = '';
      for (let i = 0; i < target.length; i++) {
        if (i < resolved || target[i] === ' ') {
          output += target[i];
        } else {
          output += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      // Keep original case for spaces/non-alpha
      el.textContent = output;
      frame++;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  // Fire after a short delay so the page has rendered
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.querySelectorAll('.scramble-text').forEach((el, i) => {
        setTimeout(() => scramble(el), i * 120);
      });
    }, 200);
  });
})();


/* ================================================================
   6. TAB SWITCHING
================================================================ */
const TAB_PANELS = {
  webdev: 'tab-webdev',
  uiux:   'tab-uiux',
};
const TAB_GROUPS = {
  dev: ['tab-webdev', 'tab-uiux'],
};

function switchTab(btn) {
  const group = btn.dataset.group;
  const tabId = btn.dataset.tab;

  document.querySelectorAll(`[data-group="${group}"].tab-btn`).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  TAB_GROUPS[group].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  const target = document.getElementById(TAB_PANELS[tabId]);
  if (target) target.classList.add('active');
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn));
});


/* ================================================================
   7. VIDEO MODAL
================================================================ */
(function () {
  const modal     = document.getElementById('videoModal');
  const vmClose   = document.getElementById('vmClose');
  const vmTitle   = document.getElementById('vmTitle');
  const vmIframe  = document.getElementById('vmIframe');
  const vmPH      = document.getElementById('vmPlaceholder');
  const vmPHText  = document.getElementById('vmPlaceholderText');
  if (!modal) return;

  function openModal(title, videoUrl) {
    vmTitle.textContent = title;
    if (videoUrl) {
      // Convert YouTube watch URL to embed
      let embedUrl = videoUrl;
      const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
      if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
      vmIframe.src = embedUrl;
      vmIframe.classList.add('active');
      vmPH.style.display = 'none';
    } else {
      vmIframe.src = '';
      vmIframe.classList.remove('active');
      vmPHText.textContent = 'Video demo coming soon';
      vmPH.style.display = 'flex';
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    vmIframe.src = '';
    vmIframe.classList.remove('active');
    document.body.style.overflow = '';
  }

  vmClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  window.__openVideoModal = openModal;
})();


/* ================================================================
   8. DEV CARD LINKS — Live App + Video Demo buttons
================================================================ */
document.querySelectorAll('.project-card').forEach(card => {
  const liveUrl  = card.dataset.live;
  const videoUrl = card.dataset.video; // can be empty string = "coming soon"
  const title    = card.dataset.title || 'Project';
  const container = card.querySelector('.card-dev-links');
  if (!container) return;

  // Live App button — only show if URL is set
  if (liveUrl) {
    const a = document.createElement('a');
    a.href = liveUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.className = 'dev-btn dev-btn--live';
    a.innerHTML = '↗ Live App';
    container.appendChild(a);
  }

  // Video Demo button — always show for dev/sec cards that have data-video attr
  if (card.hasAttribute('data-video')) {
    const btn = document.createElement('button');
    btn.className = 'dev-btn dev-btn--video';
    btn.innerHTML = '▶ Video Demo';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (window.__openVideoModal) window.__openVideoModal(title, videoUrl);
    });
    container.appendChild(btn);
  }

  container.querySelectorAll('.dev-btn').forEach(btn => {
    btn.addEventListener('click', e => e.stopPropagation());
  });
});


/* ================================================================
   10. ACTIVE NAV HIGHLIGHT ON SCROLL
================================================================ */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--text)' : '';
  });
}, { passive: true });


/* ================================================================
   11. SCROLL REVEAL
================================================================ */
document.querySelectorAll('.section, .project-card, .stat-cell, .contact-row, .work-group').forEach(el => {
  el.classList.add('reveal');
});

const observer = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.07 }
);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


/* ================================================================
   12. STAT COUNTER ANIMATION
   Numbers count up from 0 when the about section enters view
================================================================ */
(function () {
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  if (!statNums.length) return;

  let counted = false;

  function countUp(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1200;
    const start    = performance.now();
    const suffix   = el.dataset.target.includes('+') ? '+' : '';

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target) + (progress >= 1 ? '+' : '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        statNums.forEach((el, i) => {
          setTimeout(() => countUp(el), i * 120);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const aboutSection = document.getElementById('about');
  if (aboutSection) statsObserver.observe(aboutSection);
})();


/* ================================================================
   13. SMOOTH SCROLL
================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      // Close mobile nav if open
      document.getElementById('navLinks')?.classList.remove('open');
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ================================================================
   15. WIP OVERLAY INJECTION
   Injects a hover overlay on all project cards with data-wip attr
================================================================ */
(function () {
  document.querySelectorAll('.project-card[data-wip]').forEach(card => {
    const overlay = document.createElement('div');
    overlay.className = 'wip-overlay';
    overlay.innerHTML = `
      <span class="wip-overlay-icon">[ ! ]</span>
      <span class="wip-overlay-text">In Development</span>
      <span class="wip-overlay-sub">// not yet live</span>
    `;
    card.appendChild(overlay);
  });
})();
(function () {
  const btn   = document.getElementById('navHamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
  });
})();
/* ================================================================
   14. MOBILE NAV HAMBURGER
================================================================ */
(function () {
  const btn   = document.getElementById('navHamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
  });
})();