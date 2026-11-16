/* Hair By Gurbina · site script: menu, sticky Book bar, gallery filters, photo viewer, year.
   Every page still works without it (links open the photos and booking page directly). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Mobile menu ---------- */
  const btn = $('#menuBtn');
  const menu = $('#menu');
  if (btn && menu) {
    const isOpen = () => document.body.classList.contains('menu-open');
    const set = (open) => {
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    btn.addEventListener('click', () => set(!isOpen()));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) { set(false); btn.focus(); } });
  }

  /* ---------- One sticky Book button on phones ----------
     Appears once the page's first section scrolls away; hides over the closing booking section. */
  const sticky = $('#sticky');
  const trigger = $('[data-sticky-trigger]');
  if (sticky && trigger && 'IntersectionObserver' in window) {
    document.body.classList.add('has-sticky');
    let past = false;
    const covering = new Set();
    const update = () => sticky.classList.toggle('show', past && covering.size === 0);
    new IntersectionObserver(([e]) => { past = !e.isIntersecting && e.boundingClientRect.top < 0; update(); }).observe(trigger);
    const hideIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) covering.add(e.target); else covering.delete(e.target); });
      update();
    }, { threshold: 0.1 });
    $$('[data-sticky-hide]').forEach((el) => hideIO.observe(el));
  }

  /* ---------- Gallery filters ---------- */
  const gallery = $('#gallery');
  if (!gallery) return;
  const tiles = $$('.tile', gallery);
  const filters = $$('.filter');
  filters.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    filters.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    tiles.forEach((t) => { t.hidden = !(f === 'all' || t.dataset.cat === f); });
  }));

  /* ---------- Photo viewer ---------- */
  const lb = $('#lightbox');
  if (!lb || typeof lb.showModal !== 'function') return;
  const img = $('#lbImg');
  const cap = $('#lbCap');
  const count = $('#lbCount');
  const stage = $('#lbStage');
  let list = [];
  let idx = 0;
  let startX = null;
  let swiped = false;

  const show = (i) => {
    idx = (i + list.length) % list.length;
    const t = list[idx];
    const thumb = $('img', t);
    img.src = $('a', t).getAttribute('href');
    img.alt = thumb.alt;
    cap.textContent = $('.cap', t).lastChild.textContent;
    count.textContent = `${idx + 1} / ${list.length}`;
    const next = list[(idx + 1) % list.length];
    if (next) { const pre = new Image(); pre.src = $('a', next).getAttribute('href'); }
  };
  gallery.addEventListener('click', (e) => {
    const a = e.target.closest('.tile-link');
    if (!a) return;
    e.preventDefault();
    list = tiles.filter((t) => !t.hidden);
    show(list.indexOf(a.closest('.tile')));
    document.documentElement.classList.add('lb-open');
    lb.showModal();
  });
  lb.addEventListener('close', () => document.documentElement.classList.remove('lb-open'));
  $('#lbClose').addEventListener('click', () => lb.close());
  $('#lbPrev').addEventListener('click', () => show(idx - 1));
  $('#lbNext').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  stage.addEventListener('pointerdown', (e) => { startX = e.clientX; swiped = false; });
  stage.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) { swiped = true; show(idx + (dx < 0 ? 1 : -1)); }
  });
  lb.addEventListener('click', (e) => {
    if (swiped) { swiped = false; return; }
    if (e.target === lb || e.target === stage) lb.close();
  });
})();
