# Kenett Fernandez — Portfolio

> Computer Science student at Asia Pacific College
> Web Designer & Frontend Developer

🔗 **Live site:** https://kenett-portfolio.vercel.app
🐙 **GitHub:** https://github.com/KentMiranda

---

## About

Built this portfolio from scratch — no templates, no UI kits, no frameworks.
Just vanilla HTML, CSS, and JavaScript. Every feature you see was written by hand.

---

## What's in here

- Custom cursor with lerp-based lag
- Text scramble effect on page load
- Scroll-triggered stat counter with ease-out cubic animation
- Scroll reveal via IntersectionObserver
- Live clock in the nav
- animated film grain
- Scroll progress bar
- Deployed via Vercel with a Git staging/production workflow

---

## Code Snippets

### 1. Text Scramble Effect
> Letters randomise through a character set before resolving to the real text on load.
> Uses `requestAnimationFrame` for smooth, frame-accurate animation.

```javascript
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

function scramble(el) {
  const target   = el.dataset.text || el.textContent;
  const duration = 900;
  const start    = performance.now();

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

    el.textContent = output;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }

  requestAnimationFrame(update);
}

window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.scramble-text').forEach((el, i) => {
      setTimeout(() => scramble(el), i * 120);
    });
  }, 200);
});
```

---

### 2. Data-Driven Tab Switcher
> Tabs are driven entirely by HTML data attributes.
> Adding a new tab group requires zero changes to the JS logic.

```javascript
const TAB_PANELS = {
  webdev:      'tab-webdev',
  uiux:        'tab-uiux',
  secprojects: 'tab-secprojects',
  secskills:   'tab-secskills',
};

const TAB_GROUPS = {
  dev: ['tab-webdev', 'tab-uiux'],
  sec: ['tab-secprojects', 'tab-secskills'],
};

function switchTab(btn) {
  const group = btn.dataset.group;
  const tabId = btn.dataset.tab;

  document.querySelectorAll(`[data-group="${group}"].tab-btn`)
    .forEach(b => b.classList.remove('active'));

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
```

---

### 3. Custom Cursor with Lerp
> A dot that snaps instantly and a ring that lerps toward the mouse each frame.

```javascript
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();
```

---

### 4. Scroll-Triggered Stat Counter
> Numbers count up from 0 using an ease-out cubic curve,
> triggered once when the section enters the viewport.

```javascript
function countUp(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1200;
  const start    = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + (progress >= 1 ? '+' : '');
    if (progress < 1) requestAnimationFrame(step);
  }