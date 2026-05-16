/* ================================================================
   KENETT FERNANDEZ — PORTFOLIO SCRIPTS
   script.js

   TABLE OF CONTENTS:
   1.  Tab Switching (Creative Projects + Dev Work)
   2.  Active Nav Link Highlight on Scroll
   3.  Scroll Reveal Animation
   4.  Optional: Typing Effect for Hero (disabled by default)
================================================================ */


/* ================================================================
   1. TAB SWITCHING
   - Handles both Creative and Dev tab groups independently
   - Looks for data-group and data-tab attributes on buttons
================================================================ */

// Map: tabId → panel element id
const TAB_PANELS = {
  photography: 'tab-photography',
  video:       'tab-video',
  webdev:      'tab-webdev',
  uiux:        'tab-uiux',
};

// Which panels belong to which group
const TAB_GROUPS = {
  creative: ['tab-photography', 'tab-video'],
  dev:      ['tab-webdev', 'tab-uiux'],
};

function switchTab(buttonEl) {
  const group = buttonEl.dataset.group; // 'creative' or 'dev'
  const tabId = buttonEl.dataset.tab;   // e.g. 'photography'

  // 1. Deactivate all buttons in this group
  const groupTabs = document.querySelectorAll(`[data-group="${group}"]`);
  groupTabs.forEach(btn => btn.classList.remove('active'));

  // 2. Activate clicked button
  buttonEl.classList.add('active');

  // 3. Hide all panels in this group
  TAB_GROUPS[group].forEach(panelId => {
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.remove('active');
  });

  // 4. Show the selected panel
  const targetPanel = document.getElementById(TAB_PANELS[tabId]);
  if (targetPanel) targetPanel.classList.add('active');
}

// Attach click listeners to all tab buttons on page load
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn));
});


/* ================================================================
   2. ACTIVE NAV LINK HIGHLIGHT ON SCROLL
   - Highlights the correct nav link as you scroll through sections
================================================================ */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

function onScroll() {
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100; // offset for sticky nav height
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === `#${current}`) {
      link.style.color = 'var(--text)';
    }
  });
}

window.addEventListener('scroll', onScroll, { passive: true });


/* ================================================================
   3. SCROLL REVEAL ANIMATION
   - Fades + slides up sections and cards as they enter the viewport
   - Uses IntersectionObserver (no library needed)

   HOW TO USE:
   - Add class="reveal" to any element you want to animate
   - Already applied to .section, .project-card, .stat-cell, .contact-row
================================================================ */
const revealEls = document.querySelectorAll(
  '.section, .project-card, .stat-cell, .contact-row, .work-group'
);

// Add the base class so CSS can target them
revealEls.forEach(el => el.classList.add('reveal'));

// Inject reveal CSS dynamically (keeps it alongside the JS logic)
const revealStyle = document.createElement('style');
revealStyle.textContent = `
  .reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(revealStyle);

// Observer: trigger when 10% of element is in viewport
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  },
  { threshold: 0.1 }
);

revealEls.forEach(el => observer.observe(el));


/* ================================================================
   4. OPTIONAL: TYPING EFFECT FOR HERO SUBTITLE
   - Disabled by default. To enable:
     1. Set TYPING_ENABLED = true
     2. Update TYPING_STRINGS with your own lines
     3. Make sure your hero-sub element has id="typing-target"
        and add id="typing-target" to the <p class="hero-sub"> in HTML

   EXAMPLE USAGE IN HTML:
   <p class="hero-sub" id="typing-target"></p>
================================================================ */
const TYPING_ENABLED = false; // ← set to true to enable

const TYPING_STRINGS = [
  '/ video editor — photographer — web developer /',
  '/ colour grader — visual storyteller /',
  '/ building things that look good /',
];

if (TYPING_ENABLED) {
  const target = document.getElementById('typing-target');

  if (target) {
    let stringIndex  = 0;
    let charIndex    = 0;
    let isDeleting   = false;
    const typeSpeed  = 60;   // ms per character typed
    const deleteSpeed = 30;  // ms per character deleted
    const pauseAfter  = 2000; // ms pause before deleting

    function type() {
      const current = TYPING_STRINGS[stringIndex];

      if (!isDeleting) {
        target.textContent = current.slice(0, charIndex + 1);
        charIndex++;

        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(type, pauseAfter);
          return;
        }
      } else {
        target.textContent = current.slice(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          stringIndex = (stringIndex + 1) % TYPING_STRINGS.length;
        }
      }

      setTimeout(type, isDeleting ? deleteSpeed : typeSpeed);
    }

    type();
  }
}


/* ================================================================
   UTILITY: Smooth scroll polyfill fallback for older browsers
================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
