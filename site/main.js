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

// The live thing: choose the specialty shown in "専門性 × インフルエンス".
(() => {
  const picker = document.querySelector('[data-picker]');
  if (!picker) return;
  const chips = [...picker.querySelectorAll('[data-who]')];
  const who = document.querySelector('[data-who-text]');
  const example = document.querySelector('[data-example-text]');
  const photo = document.querySelector('[data-dropcap]');
  picker.hidden = false;
  const choose = (chip) => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    who.textContent = chip.dataset.who;
    // The example text lives once, in the no-script list; copying its nodes keeps its <wbr> line-break hints.
    const source = document.getElementById(chip.dataset.exampleId);
    example.replaceChildren(...[...source.childNodes].map((node) => node.cloneNode(true)));
    const swap = () => {
      photo.src = chip.dataset.src;
      photo.alt = chip.dataset.alt;
      photo.width = Number(chip.dataset.w);
      photo.height = Number(chip.dataset.h);
      photo.style.objectPosition = chip.dataset.pos || '';
      photo.classList.remove('is-swapping');
    };
    if (reduceMotion) { swap(); return; }
    photo.classList.add('is-swapping');
    setTimeout(swap, 260);
  };
  chips.forEach((chip) => chip.addEventListener('click', () => choose(chip)));
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
