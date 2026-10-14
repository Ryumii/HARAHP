// Advocates — design prototype. Built on tasteskill base.js; every feature leaves content visible without JS.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal once when an element enters the viewport. Never replays, never leaves content hidden.
(() => {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
  targets.forEach((el) => io.observe(el));
  window.addEventListener('load', () => setTimeout(() => {
    targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  }, 2500));
})();

// Colour by chapter: the fixed header takes the ground and ink of the chapter under it,
// and the back-to-top button inverts against the chapter under the bottom-right corner.
(() => {
  const chapters = document.querySelectorAll('[data-ink]');
  if (!chapters.length || !('IntersectionObserver' in window)) return;
  const root = document.documentElement.style;
  const watch = (rootMargin, ink, ground) => {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        root.setProperty(ink, entry.target.dataset.ink);
        root.setProperty(ground, entry.target.dataset.ground);
      }
    }, { rootMargin, threshold: 0 });
    chapters.forEach((el) => io.observe(el));
  };
  watch('0px 0px -92% 0px', '--header-ink', '--header-ground');
  watch('-92% 0px 0px 0px', '--corner-ink', '--corner-ground');
})();

// Back to the top: shown once the page has started to scroll.
(() => {
  const button = document.querySelector('.to-top');
  if (!button) return;
  const update = () => button.classList.toggle('is-shown', window.scrollY > 8);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// The "who" in the headline: the frame inside the sentence shows one specialty after another.
// The next photo fades in on top of the current one, which stays visible underneath until it is covered.
(() => {
  const frames = [...document.querySelectorAll('.slot img')];
  if (frames.length < 2 || reduceMotion) return;
  const HOLD = 3000; // ms a photo stays fully visible
  const FADE = 1000; // ms; matches the .slot img.is-on opacity transition in styles.css
  let current = Math.max(0, frames.findIndex((img) => img.classList.contains('is-on')));
  const advance = () => {
    if (document.hidden) return;
    const leaving = frames[current];
    current = (current + 1) % frames.length;
    leaving.classList.replace('is-on', 'is-leaving');
    frames[current].classList.add('is-on');
    setTimeout(() => leaving.classList.remove('is-leaving'), FADE + 100);
  };
  // Decode every photo before the first change, so none is decoded on screen in the middle of a fade.
  Promise.all(frames.map((img) => img.decode().catch(() => {}))).then(() => setInterval(advance, HOLD + FADE));
})();

// The live thing: choose the specialty in "専門性 × インフルエンス". The blank in its sentence then takes one
// example after another, so the reader sees the examples as examples, not as the whole range.
(() => {
  const head = document.querySelector('[data-picker]');
  if (!head) return;
  const section = head.closest('section');
  const tabs = [...head.querySelectorAll('[aria-controls]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  const marks = tabs.map((tab) => section.querySelector(`[data-for="${tab.getAttribute('aria-controls')}"]`));
  const live = section.querySelector('[data-specialty-live]');
  head.hidden = false;

  const HOLD = 2400; // ms each example stays in the blank
  const MOVE = 450; // ms; matches the .word-slot animations in styles.css
  let current = Math.max(0, panels.findIndex((panel) => panel.classList.contains('is-on')));
  let inView = !('IntersectionObserver' in window);
  let paused = false;
  let timer = null;

  // What a screen reader hears for a panel: its text without the moving blank (the hidden list stands in for it).
  const spoken = (panel) => {
    const copy = panel.cloneNode(true);
    copy.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.remove());
    return copy.textContent.replace(/\s+/g, ' ').trim();
  };
  const resetWords = (panel) => panel.querySelectorAll('.word-slot > span').forEach((word, i) => {
    word.classList.remove('is-leaving');
    word.classList.toggle('is-on', i === 0);
  });
  const step = () => {
    if (document.hidden || !inView || paused) return;
    const words = [...panels[current].querySelectorAll('.word-slot > span')];
    if (words.length < 2) return;
    const at = Math.max(0, words.findIndex((word) => word.classList.contains('is-on')));
    const leaving = words[at];
    leaving.classList.replace('is-on', 'is-leaving');
    words[(at + 1) % words.length].classList.add('is-on');
    setTimeout(() => leaving.classList.remove('is-leaving'), MOVE + 50);
  };
  const restart = () => {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(step, HOLD);
  };
  const show = (index) => {
    if (index === current) return;
    const previous = current;
    current = index;
    tabs.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === index)));
    resetWords(panels[index]);
    panels.forEach((panel, i) => panel.classList.toggle('is-on', i === index));
    marks[previous].classList.replace('is-on', 'is-leaving');
    marks[index].classList.remove('is-leaving');
    marks[index].classList.add('is-on');
    setTimeout(() => marks[previous].classList.remove('is-leaving'), 450);
    live.textContent = spoken(panels[index]);
    restart();
  };

  tabs.forEach((tab, i) => tab.addEventListener('click', () => show(i)));
  // The blank holds still while the pointer rests on the sentence, and only moves while the section is on screen.
  const sentence = section.querySelector('.specialty-panels');
  sentence.addEventListener('pointerenter', () => { paused = true; });
  sentence.addEventListener('pointerleave', () => { paused = false; });
  if (!inView) new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0.3 }).observe(section);
  restart();
})();

// The policy sentence: one commitment at a time is set in the full ink.
(() => {
  const items = [...document.querySelectorAll('.policy-item')];
  if (!items.length) return;
  if (reduceMotion) { items.forEach((item) => item.classList.add('is-lit')); return; }
  let current = 0;
  items[current].classList.add('is-lit');
  setInterval(() => {
    if (document.hidden) return;
    items[current].classList.remove('is-lit');
    current = (current + 1) % items.length;
    items[current].classList.add('is-lit');
  }, 2000);
})();

// The phone menu closes after a link is chosen.
(() => {
  const menu = document.querySelector('.menu');
  if (!menu) return;
  menu.addEventListener('click', (event) => { if (event.target.closest('a')) menu.open = false; });
})();
