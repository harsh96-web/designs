/* Hair by Gurbina · site script (shared by every page) */
(() => {
  'use strict';

  /* ===================== EDIT ME ===================== */
  // Paste the Google "Ask for reviews" link here once the Google Business Profile is live.
  // The "Leave a Google review" button appears on its own when this is filled in.
  const GOOGLE_REVIEW_URL = '';
  const CHAIR_DAYS = [2, 3];      // 0 = Sunday … 2 = Tuesday, 3 = Wednesday
  const LAST_CHAIR_HOUR = 17;     // the 5 pm chair
  const WA_NUMBER = '17789993179';
  const EMAIL = 'makeoversgurbina@gmail.com';
  // Holiday season dates live in boot.js (SEASON_START / SEASON_END).
  /* =================================================== */

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  /* ---------- Holiday season: show the offer and count down to Christmas ---------- */
  (() => {
    const now = new Date();
    if (!document.documentElement.classList.contains('season')) return; // set by boot.js
    $$('[data-season]').forEach((el) => { el.hidden = false; });
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((new Date(now.getFullYear(), 11, 25) - today) / 864e5);
    let text = '';
    if (days > 1) text = `${days} days to Christmas. Holiday spots are limited, so book early.`;
    else if (days === 1) text = 'Christmas is tomorrow! Message me to check last-minute spots.';
    else if (days === 0) text = 'Merry Christmas! Book your New Year look now.';
    else text = 'Ring in the New Year with fresh hair. Limited spots until Dec 31.';
    $$('[data-xmas-count]').forEach((el) => { el.textContent = text; });

    // Soft snowfall, only inside the hero photo and the holiday card (never over the text).
    if (reduceMotion || !window.HTMLCanvasElement) return;
    const sprite = document.createElement('canvas');
    sprite.width = 32; sprite.height = 32;
    const sctx = sprite.getContext('2d');
    const glow = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, 'rgba(255,255,255,1)');
    glow.addColorStop(0.45, 'rgba(255,255,255,.8)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    sctx.fillStyle = glow;
    sctx.fillRect(0, 0, 32, 32);

    const snowIn = (host, count) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'snowfall';
      canvas.setAttribute('aria-hidden', 'true');
      host.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      let w = 0;
      let h = 0;
      let raf = 0;
      let running = false;
      const size = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        w = host.clientWidth; h = host.clientHeight;
        canvas.width = Math.max(1, Math.round(w * dpr));
        canvas.height = Math.max(1, Math.round(h * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      size();
      // z = depth: near flakes are bigger, brighter and fall faster
      const make = (fromTop) => {
        const z = Math.random();
        return {
          x: Math.random() * w, y: fromTop ? -10 : Math.random() * h,
          r: 1.2 + z * 3.4, v: 0.25 + z * 0.7, a: 0.45 + z * 0.5,
          p: Math.random() * 6.28, sway: 0.15 + Math.random() * 0.45,
        };
      };
      const flakes = Array.from({ length: count }, () => make(false));
      const tick = () => {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i];
          f.y += f.v; f.p += 0.01; f.x += Math.sin(f.p) * f.sway;
          if (f.y > h + 8) flakes[i] = make(true);
          const d = f.r * 2.6;
          ctx.globalAlpha = f.a;
          ctx.drawImage(sprite, f.x - d / 2, f.y - d / 2, d, d);
        }
        raf = requestAnimationFrame(tick);
      };
      // Only animate while it's on screen (saves phone battery)
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(tick); }
        else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
      }).observe(host);
      if ('ResizeObserver' in window) new ResizeObserver(size).observe(host);
    };
    const small = window.innerWidth < 700;
    const arch = $('.hero-visual .arch');
    if (arch) snowIn(arch, small ? 32 : 48);
    const card = $('.holiday');
    if (card) snowIn(card, small ? 30 : 55);
  })();

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Header border on scroll ---------- */
  const header = $('.site-header');
  const onScroll = () => { if (header) header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menuBtn');
  const menu = $('#mobileMenu');
  if (menuBtn && menu) {
    const isOpen = () => document.body.classList.contains('menu-open');
    const setOpen = (open) => {
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
    };
    menu.setAttribute('inert', '');
    menuBtn.addEventListener('click', () => setOpen(!isOpen()));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) { setOpen(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 960px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Active section in the desktop nav ---------- */
  const navLinks = $$('.nav a[href^="#"]');
  if (navLinks.length && hasIO) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.removeAttribute('aria-current'));
        const link = byId.get(e.target.id);
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Next chair day ---------- */
  const chairEls = $$('[data-next-chair]');
  if (chairEls.length) {
    const now = new Date();
    let next = null;
    for (let i = 0; i < 8 && !next; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      if (!CHAIR_DAYS.includes(d.getDay())) continue;
      if (i === 0 && now.getHours() >= LAST_CHAIR_HOUR) continue;
      next = { d, i };
    }
    if (next) {
      const day = new Intl.DateTimeFormat('en-CA', { weekday: 'long', month: 'short', day: 'numeric' }).format(next.d);
      const label = next.i === 0 ? 'today' : next.i === 1 ? `tomorrow, ${day}` : day;
      chairEls.forEach((el) => { el.textContent = `Next chair day: ${label}`; });
    }
  }

  /* ---------- Before / after slider ---------- */
  const ba = $('#ba');
  if (ba) {
    const range = $('#baRange', ba);
    let dragging = false;
    let startX = 0;
    let moved = false;
    const set = (v) => {
      const clamped = Math.max(0, Math.min(100, v));
      ba.style.setProperty('--pos', `${clamped}%`);
      if (range) range.value = String(Math.round(clamped));
    };
    const fromX = (x) => {
      const r = ba.getBoundingClientRect();
      set(((x - r.left) / r.width) * 100);
    };
    ba.addEventListener('pointerdown', (e) => {
      dragging = true; moved = false; startX = e.clientX;
      ba.classList.add('dragging');
      try { ba.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      if (e.pointerType === 'mouse') fromX(e.clientX);
    });
    ba.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      if (Math.abs(e.clientX - startX) > 3) moved = true;
      if (moved || e.pointerType === 'mouse') fromX(e.clientX);
    });
    const end = (e) => {
      if (dragging && e.type === 'pointerup' && !moved && e.pointerType !== 'mouse') fromX(e.clientX);
      dragging = false;
      ba.classList.remove('dragging');
    };
    ba.addEventListener('pointerup', end);
    ba.addEventListener('pointercancel', end);
    if (range) range.addEventListener('input', () => set(Number(range.value)));

    // A gentle nudge the first time it scrolls into view, so people know it moves.
    if (!reduceMotion && hasIO) {
      const io = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1500;
        const tick = (t) => {
          if (dragging) return;
          const p = Math.min(1, (t - t0) / dur);
          set(50 - Math.sin(p * Math.PI * 2) * 16 * (1 - p * 0.4));
          if (p < 1) requestAnimationFrame(tick); else set(50);
        };
        setTimeout(() => requestAnimationFrame(tick), 350);
      }, { threshold: 0.5 });
      io.observe(ba);
    }
  }

  /* ---------- Gallery: filters, show more, lightbox ---------- */
  const gallery = $('#gallery');
  if (gallery) {
    const tiles = $$('.tile', gallery);
    const filters = $$('.filter');
    const moreBtn = $('#moreBtn');
    const LIMIT = 8;
    let filter = 'all';
    let expanded = false;

    const matches = (t) => filter === 'all' || t.dataset.cat === filter;
    const apply = () => {
      let shown = 0;
      tiles.forEach((t) => {
        const show = matches(t) && (filter !== 'all' || expanded || shown < LIMIT);
        t.hidden = !show;
        if (show) shown += 1;
      });
      if (moreBtn) moreBtn.hidden = !(filter === 'all' && !expanded && tiles.length > LIMIT);
    };
    filters.forEach((b) => b.addEventListener('click', () => {
      filter = b.dataset.filter;
      filters.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      apply();
    }));
    if (moreBtn) moreBtn.addEventListener('click', () => {
      expanded = true;
      apply();
      const first = tiles[LIMIT] && tiles[LIMIT].querySelector('a');
      if (first) first.focus({ preventScroll: true });
    });
    $$('[data-filter-link]').forEach((a) => a.addEventListener('click', () => {
      const b = $(`.filter[data-filter="${a.dataset.filterLink}"]`);
      if (b) b.click();
    }));
    apply();

    const lb = $('#lightbox');
    if (lb && typeof lb.showModal === 'function') {
      const img = $('#lbImg');
      const cap = $('#lbCap');
      const count = $('#lbCount');
      const stage = $('#lbStage');
      let list = [];
      let idx = 0;
      let swiped = false;

      const show = (i) => {
        idx = (i + list.length) % list.length;
        const t = list[idx];
        const link = t.querySelector('a');
        const thumb = t.querySelector('img');
        const fc = t.querySelector('figcaption');
        img.src = link.getAttribute('href');
        img.alt = thumb.alt;
        const tag = document.createElement('span');
        tag.textContent = fc.firstElementChild ? fc.firstElementChild.textContent : '';
        cap.replaceChildren(tag, document.createTextNode(fc.lastChild ? fc.lastChild.textContent : ''));
        count.textContent = `${idx + 1} / ${list.length}`;
        const nxt = list[(idx + 1) % list.length];
        if (nxt) { const pre = new Image(); pre.src = nxt.querySelector('a').getAttribute('href'); }
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
      let sx = null;
      stage.addEventListener('pointerdown', (e) => { sx = e.clientX; swiped = false; });
      stage.addEventListener('pointerup', (e) => {
        if (sx === null) return;
        const dx = e.clientX - sx;
        sx = null;
        if (Math.abs(dx) > 40) { swiped = true; show(idx + (dx < 0 ? 1 : -1)); }
      });
      lb.addEventListener('click', (e) => {
        if (swiped) { swiped = false; return; }
        if (e.target === lb || e.target === stage) lb.close();
      });
    }
  }

  /* ---------- Bridal quote builder → WhatsApp / email ---------- */
  const planner = $('#planner');
  if (planner) {
    const date = $('#pDate');
    const city = $('#pCity');
    const party = $('#pParty');
    const countdown = $('#pCountdown');
    const wa = $('#pWa');
    const mail = $('#pMail');
    let people = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    date.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const build = () => {
      const lines = ["Hi Gurbina! I'm planning my wedding and would love a bridal quote."];
      countdown.classList.remove('show');
      if (date.value) {
        const d = new Date(`${date.value}T12:00:00`);
        if (!Number.isNaN(d.getTime())) {
          lines.push(`• Date: ${new Intl.DateTimeFormat('en-CA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).format(d)}`);
          const days = Math.round((new Date(`${date.value}T00:00:00`) - today) / 864e5);
          if (days > 1) countdown.textContent = `${days} days to go. Wedding dates book up early, so it's worth asking now.`;
          else if (days >= 0) countdown.textContent = 'That is very soon! Message me right away and I will check what I can do.';
          if (days >= 0) countdown.classList.add('show');
        }
      }
      const events = $$('input[name="ev"]:checked', planner).map((i) => i.value);
      if (events.length) lines.push(`• Events: ${events.join(', ')}`);
      const svc = $('input[name="svc"]:checked', planner);
      lines.push(`• Services: ${svc ? svc.value : 'Hair & makeup'}`);
      lines.push(`• People besides me: ${people}`);
      const where = city.value.trim().slice(0, 60);
      if (where) lines.push(`• Getting ready in: ${where}`);
      const trial = $('input[name="trial"]:checked', planner);
      lines.push(`• Trial: ${trial ? trial.value : 'Not sure yet'}`);
      const text = lines.join('\n');
      wa.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
      mail.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Bridal quote')}&body=${encodeURIComponent(text)}`;
    };

    $$('.stepper button', planner).forEach((b) => b.addEventListener('click', () => {
      people = Math.max(0, Math.min(20, people + Number(b.dataset.step)));
      party.textContent = String(people);
      build();
    }));
    planner.addEventListener('input', build);
    planner.addEventListener('change', build);
    planner.addEventListener('submit', (e) => e.preventDefault());
    build();
  }

  /* ---------- Google review button ---------- */
  const gr = $('#googleReview');
  if (gr && GOOGLE_REVIEW_URL) { gr.href = GOOGLE_REVIEW_URL; gr.hidden = false; }

  /* ---------- Mobile action bar ---------- */
  const mbar = $('#mbar');
  if (mbar && hasIO) {
    document.body.classList.add('has-mbar');
    const trigger = $('#heroCtas');
    let pastHero = !trigger;
    const covering = new Set();
    const update = () => mbar.classList.toggle('show', pastHero && covering.size === 0);
    if (trigger) {
      new IntersectionObserver(([e]) => {
        pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
        update();
      }).observe(trigger);
    }
    // Hide the bar over sections that already have their own WhatsApp / Book buttons.
    const hideIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) covering.add(e.target); else covering.delete(e.target); });
      update();
    }, { threshold: 0.2 });
    $$('[data-hide-mbar]').forEach((el) => hideIO.observe(el));
    update();
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if (!reduceMotion && hasIO) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Click tracking hook ----------
     Does nothing until an analytics script (Plausible or GoatCounter) is added to the page. */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-track]');
    if (!t) return;
    const name = t.dataset.track;
    if (typeof window.plausible === 'function') window.plausible(name);
    else if (window.goatcounter && typeof window.goatcounter.count === 'function') {
      window.goatcounter.count({ path: `click-${name}`, title: name, event: true });
    }
  });
})();
