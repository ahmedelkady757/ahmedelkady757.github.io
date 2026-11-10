import { OWNER, BEATS, PROJECTS, ARCHIVE, STATS, JOURNEY, TOOLKIT } from './data.js';

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const ARROW = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 11 11 3M5 3h6v6" stroke="currentColor" stroke-width="1.6"/></svg>';
const PLAY = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.6v10.8L12 7z" fill="currentColor"/></svg>';

// Wrap text so each letter can rise out of its own mask. Screen readers get the
// aria-label on the parent instead of the split spans.
const split = (text) => text.split(' ').map((word) => (
  `<span class="w" aria-hidden="true">${[...word].map((c) => `<span class="ch"><span>${esc(c)}</span></span>`).join('')}</span>`
)).join(' ');

const secStyle = (x) => `--bg:${x.bg};--fg:${x.fg};--accent:${x.accent || x.fg}`;

function heroHTML() {
  return `
  <section class="sec hero" id="top" data-stage="hero" data-screen="lock" data-phone="#9a948b" data-label="Intro" style="--bg:#F3EEE3;--fg:#14110C">
    <div class="pin">
      <h1 class="hero__name" aria-label="${esc(OWNER.name)}">
        <span class="hero__row" data-fit="86" data-max="39" aria-hidden="true">${split('Ahmed')}</span>
        <span class="hero__row hero__row--2" data-fit="86" data-max="39" aria-hidden="true">${split('Elkady')}</span>
      </h1>
      <div class="hero__foot">
        <p class="fade">Ahmed Elkady, iOS developer and ITI graduate. Native apps for iPhone, and just as at home in Kotlin and Flutter.</p>
        <span class="hero__cue fade">Scroll to boot</span>
        <p class="fade"><span class="dot"></span>Open to work<br>${esc(OWNER.location)}</p>
      </div>
    </div>
  </section>`;
}

function beatHTML(b) {
  const tall = b.id === 'code' || b.id === 'tests' || b.id === 'layers';
  return `
  <section class="sec panel ${tall ? 'panel--tall' : ''}" id="b-${b.id}" data-stage="${b.id}" data-screen="${b.screen}" data-phone="${b.phone}" data-side="${b.side}" data-label="How it gets built" style="${secStyle(b)}">
    <div class="pin">
      <div class="copy">
        <p class="kicker rise">${esc(b.kicker)}</p>
        <h2 class="beat-title" aria-label="${esc(b.title.join(' '))}">${b.title.map((l) => `<span class="line">${split(l)}</span>`).join('')}</h2>
        <p class="body rise">${esc(b.body)}</p>
        ${b.note ? `<p class="note rise">${esc(b.note)}</p>` : ''}
      </div>
    </div>
  </section>`;
}

function introHTML() {
  return `
  <section class="sec intro" id="work" data-stage="intro" data-screen="home" data-phone="#b9b3a8" data-label="Selected work" style="--bg:#14110C;--fg:#F3EEE3">
    <div class="pin">
      <h2 class="intro__big" aria-label="Selected work">
        <span class="row-t" data-fit="74" data-max="40" aria-hidden="true">${split('Selected')}</span>
        <span class="row-t" data-fit="35" data-max="40" aria-hidden="true">${split('Work')}</span>
      </h2>
      <div class="intro__note"><span>2023 to 2026</span><span>Tap an app on the phone, or keep scrolling</span></div>
    </div>
  </section>`;
}

function projectHTML(p, i) {
  const side = i % 2 ? 'right' : 'left';
  const floats = p.floats.map((f, n) => `
    <figure class="float float--${n ? 'b' : 'a'} ${f.screen ? 'float--screen' : ''}" ${f.zoom ? `data-zoom="${f.src}"` : ''} data-speed="${n ? 150 : 230}">
      <img src="${f.src}" alt="${esc(f.alt)}" loading="lazy">
    </figure>`).join('');
  const first = p.media.type === 'video' ? p.media.poster : p.media.screens[0];
  const demo = p.media.type === 'video'
    ? `<button class="btn" type="button" data-video="${p.media.src}">${PLAY}Watch demo</button>`
    : `<button class="btn" type="button" data-gallery="${p.id}">See screens</button>`;
  return `
  <section class="sec panel ${p.media.landscape ? 'panel--land' : ''}" id="p-${p.id}" data-stage="project" data-screen="${p.id}" data-phone="${p.phone}" data-side="${side}" ${p.media.landscape ? 'data-landscape="1"' : ''} data-label="${String(i + 1).padStart(2, '0')} ${esc(p.name)}" style="${secStyle(p)}">
    <div class="pin">
      <span class="counter">${String(i + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')}</span>
      ${floats}
      <div class="copy">
        <p class="kicker rise">${esc(p.kicker)}</p>
        <h3 class="title" data-fit="44" data-fit-m="88" data-max="27" aria-label="${esc(p.name)}">${split(p.name)}</h3>
        <p class="tag rise">${esc(p.tag)}</p>
        <p class="body rise">${esc(p.body)}</p>
        <p class="role rise">${esc(p.role)}</p>
        <ul class="chips rise" aria-label="Tech stack">${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        <div class="cta rise">
          ${demo}
          <a class="btn btn--ghost" href="${p.repo}" target="_blank" rel="noopener">Source ${ARROW}</a>
        </div>
      </div>
      <div class="fallback"><img src="${first}" alt="${esc(p.name)} screen" loading="lazy"></div>
    </div>
  </section>`;
}

function archiveHTML() {
  return `
  <section class="sec archive" id="archive" data-stage="gone" data-label="Also built" style="--bg:#F3EEE3;--fg:#14110C">
    <div class="sec-head">
      <h2 class="sec-title" aria-label="Also built">${split('Also built')}</h2>
      <p class="kicker">Hover for a look</p>
    </div>
    <div class="rows">
      ${ARCHIVE.map((a, i) => `
      <a class="row" href="${a.href}" target="_blank" rel="noopener" data-peek="${i}">
        <img class="row__thumb" src="${a.poster}" alt="" loading="lazy">
        <span class="row__year">${a.year}</span>
        <span class="row__name">${esc(a.name)}</span>
        <span class="row__note">${esc(a.note)}</span>
        <span class="row__tech">${esc(a.tech)}</span>
      </a>`).join('')}
    </div>
  </section>`;
}

function statHTML(s) {
  if (typeof s.value === 'string') return `<div class="stat"><b>${s.value}</b><span>${esc(s.label)}</span></div>`;
  const shown = s.value.toFixed(s.decimals || 0);
  return `<div class="stat"><b><i style="font-style:normal" data-count="${s.value}" data-dec="${s.decimals || 0}">${shown}</i>${s.suffix ? `<small>${esc(s.suffix)}</small>` : ''}</b><span>${esc(s.label)}</span></div>`;
}

function cardHTML(c) {
  const media = c.image
    ? `<div class="card__media" ${c.zoom ? `data-zoom="${c.image}"` : ''}><img src="${c.image}" alt="${esc(c.title)}" loading="lazy"></div>`
    : `<div class="card__media"><span class="card__big">${esc(c.big)}</span></div>`;
  const body = `${media}<time>${esc(c.date)}</time><h3>${esc(c.title)}</h3><p>${esc(c.note)}</p>`;
  const cls = `card ${c.wide ? 'card--wide' : ''}`;
  return c.href
    ? `<a class="${cls}" href="${c.href}" target="_blank" rel="noopener">${body}</a>`
    : `<article class="${cls}">${body}</article>`;
}

function journeyHTML() {
  return `
  <section class="sec" id="journey" data-stage="gone" data-label="Journey" style="--bg:#14110C;--fg:#F3EEE3">
    <div class="about">
      <div class="about__photo"><img src="assets/photos/ahmed.webp" alt="Portrait of ${esc(OWNER.name)}" loading="lazy"></div>
      <div>
        <p class="kicker">About</p>
        <h2>From Flutter, to Objective-C, to SwiftUI.</h2>
        <p class="lede">I’m Ahmed Khaled, a computer science graduate from Minufiya University and a graduate of ITI’s nine-month Native Mobile program. I started with Flutter in 2023, then went native: Objective-C, Swift and SwiftUI on iOS, Java and Kotlin on Android. I’m looking for an iOS or mobile role now.</p>
        <div class="stats">${STATS.map(statHTML).join('')}</div>
      </div>
    </div>
    <div class="strip">
      <div class="strip__head"><h2>Milestones</h2><p class="kicker">2023 to 2026</p></div>
      <div class="track">${JOURNEY.map(cardHTML).join('')}</div>
    </div>
  </section>`;
}

function toolkitHTML() {
  const row = (r) => {
    const items = r.items.map((t) => `<span>${esc(t)}</span>`).join('');
    return `<div class="mq"><span class="mq__label">${esc(r.label)}</span><div class="mq__in">${items}${items}${items}</div></div>`;
  };
  return `
  <section class="sec toolkit" id="toolkit" data-stage="gone-low" data-label="Toolkit" style="--bg:#EFD28B;--fg:#241A05">
    <div class="sec-head"><h2 class="sec-title" aria-label="Toolkit">${split('Toolkit')}</h2><p class="kicker">What I reach for</p></div>
    ${TOOLKIT.map(row).join('')}
  </section>`;
}

function contactHTML() {
  return `
  <section class="sec contact" id="contact" data-stage="contact" data-screen="call" data-phone="#231a17" data-label="Contact" style="--bg:#C8553D;--fg:#FFF4EA;--accent:#EFD28B">
    <div class="pin">
      <div class="copy">
        <p class="kicker rise">It’s for you</p>
        <h2 aria-label="Pick up">${split('Pick up.')}</h2>
        <p class="lede rise">Hiring for iOS or mobile? Accept the call on the phone, or use any of these.</p>
        <a class="mail rise" href="mailto:${OWNER.email}">${OWNER.email}</a>
        <div class="cta rise">
          <a class="btn" href="${OWNER.linkedin}" target="_blank" rel="noopener">LinkedIn ${ARROW}</a>
          <a class="btn btn--ghost" href="${OWNER.github}" target="_blank" rel="noopener">GitHub ${ARROW}</a>
          <a class="btn btn--ghost" href="${OWNER.cv}" target="_blank" rel="noopener">CV ${ARROW}</a>
        </div>
      </div>
      <div class="foot"><span>© 2026 ${esc(OWNER.name)}</span><span>${esc(OWNER.location)}</span></div>
    </div>
  </section>`;
}

function render() {
  $('#main').innerHTML = [
    heroHTML(), ...BEATS.map(beatHTML), introHTML(), ...PROJECTS.map(projectHTML),
    archiveHTML(), journeyHTML(), toolkitHTML(), contactHTML(),
  ].join('');
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

// Size display type to a share of the viewport width, capped by viewport height.
function fitType() {
  const mobile = window.innerWidth < 820 || window.innerWidth / window.innerHeight < 0.95;
  $$('[data-fit]').forEach((el) => {
    el.style.fontSize = '100px';
    const width = el.getBoundingClientRect().width;
    const target = (parseFloat(mobile && el.dataset.fitM ? el.dataset.fitM : el.dataset.fit) / 100) * window.innerWidth;
    const max = (parseFloat(el.dataset.max || 100) / 100) * window.innerHeight;
    el.style.fontSize = `${Math.min(max, (100 * target) / width)}px`;
  });
}

// ---- Lightbox ---------------------------------------------------------------
const box = $('#lightbox');
let lenis;
function openBox(html) {
  $('.lb__body', box).innerHTML = html;
  box.showModal();
  if (lenis) lenis.stop();
}
function closeBox() {
  if (box.open) box.close();
}
// Runs for the Close button and for the Escape key alike. It fires a moment
// after close(), so it must not wipe a viewer that has already been reopened.
box.addEventListener('close', () => {
  if (box.open) return;
  $('.lb__body', box).innerHTML = '';
  if (lenis) lenis.start();
});
$('.lb__close', box).addEventListener('click', closeBox);
box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('lb__body')) closeBox(); });

document.addEventListener('click', (e) => {
  const v = e.target.closest('[data-video]');
  if (v) { openBox(`<video src="${v.dataset.video}" controls autoplay muted playsinline></video>`); return; }
  const g = e.target.closest('[data-gallery]');
  if (g) {
    const p = PROJECTS.find((x) => x.id === g.dataset.gallery);
    openBox(`<div class="lb__gallery">${p.media.screens.map((s, i) => `<img src="${s}" alt="${esc(p.name)} screen ${i + 1}">`).join('')}</div>`);
    return;
  }
  const z = e.target.closest('[data-zoom]');
  if (z) openBox(`<img src="${z.dataset.zoom}" alt="">`);
});

// ---- Motion ------------------------------------------------------------------
function setupMotion(stage) {
  lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 0.9, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => {
    lenis.raf(t * 1000);
    stage.update(lenis.animatedScroll, performance.now());
  });
  gsap.ticker.lagSmoothing(0);

  const go = (target, opts = {}) => lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
  $$('.nav a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    go(a.getAttribute('href') === '#top' ? 0 : a.getAttribute('href'));
  }));

  stage.onAction = (action) => {
    const [kind, value] = action.split(':');
    if (kind === 'open') {
      go(PROJECTS.some((p) => p.id === value) ? `#p-${value}` : '#archive');
    } else if (value === 'github') window.open(OWNER.github, '_blank', 'noopener');
    else if (value === 'linkedin') window.open(OWNER.linkedin, '_blank', 'noopener');
    else if (value === 'mail') window.location.href = `mailto:${OWNER.email}`;
    else if (value === 'top') go(0, { duration: 2.4 });
  };

  // The pinned strip goes first so everything after it measures the extra height
  const mm = gsap.matchMedia();
  mm.add('(min-width: 820px) and (min-aspect-ratio: 95/100)', () => {
    const track = $('.track');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    gsap.to(track, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: '.strip', start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.7, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 10 } });
  });

  gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  const label = $('.nav__label');
  const nav = $('.nav');
  const bar = $('.progress');
  $$('[data-label]').forEach((el) => {
    const fg = el.style.getPropertyValue('--fg');
    ScrollTrigger.create({
      trigger: el, start: 'top 50%', end: 'bottom 50%',
      onToggle: (s) => { if (s.isActive) label.textContent = el.dataset.label; },
    });
    ScrollTrigger.create({
      trigger: el, start: 'top 34px', end: 'bottom 34px',
      onToggle: (s) => {
        if (!s.isActive) return;
        nav.style.color = fg;
        bar.style.color = fg;
      },
    });
  });

  // Copy that rises in as each color panel arrives
  $$('.panel, .contact').forEach((panel) => {
    const chars = $$('.ch > span', panel);
    const rise = $$('.rise', panel);
    const tl = gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 58%', toggleActions: 'play none none reverse' } });
    tl.from(chars, { yPercent: 112, duration: 0.95, stagger: 0.022, ease: 'power4.out' })
      .from(rise, { y: 26, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' }, 0.18);
  });

  // Screens drifting past the phone at their own speed
  $$('.float').forEach((f) => {
    const d = Number(f.dataset.speed);
    gsap.fromTo(f, { y: d }, { y: -d, ease: 'none', scrollTrigger: { trigger: f.closest('.panel'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  $$('.intro .ch > span').length && gsap.from('.intro .ch > span', { yPercent: 112, duration: 1, stagger: 0.03, ease: 'power4.out', scrollTrigger: { trigger: '.intro', start: 'top 45%', toggleActions: 'play none none reverse' } });

  $$('.sec-title').forEach((t) => gsap.from($$('.ch > span', t), { yPercent: 112, duration: 1, stagger: 0.03, ease: 'power4.out', scrollTrigger: { trigger: t, start: 'top 85%', toggleActions: 'play none none reverse' } }));

  gsap.from('.row', { y: 40, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.rows', start: 'top 80%', toggleActions: 'play none none reverse' } });
  gsap.from('.about > *', { y: 50, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.about', start: 'top 72%', toggleActions: 'play none none reverse' } });

  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const dec = Number(el.dataset.dec);
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.7, ease: 'power2.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); }, scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reset' } });
  });

  // Tool names slide sideways, and speed up with the scroll
  const rows = $$('.mq__in').map((el, i) => ({ el, dir: i % 2 ? 1 : -1, x: 0 }));
  let running = false;
  ScrollTrigger.create({ trigger: '.toolkit', start: 'top bottom', end: 'bottom top', onToggle: (s) => { running = s.isActive; } });
  gsap.ticker.add(() => {
    if (!running) return;
    const boost = 0.9 + Math.min(9, Math.abs(lenis.velocity) * 0.28);
    rows.forEach((r) => {
      const third = r.el.scrollWidth / 3;
      r.x += r.dir * boost;
      if (r.x <= -third) r.x += third;
      if (r.x >= 0) r.x -= third;
      r.el.style.transform = `translate3d(${r.x}px,0,0)`;
    });
  });

  // Floating preview that follows the cursor over the archive list
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const peek = $('.peek');
    const px = gsap.quickTo(peek, 'x', { duration: 0.45, ease: 'power3' });
    const py = gsap.quickTo(peek, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { px(e.clientX + 26); py(e.clientY - 150); }, { passive: true });
    $$('.row').forEach((row) => {
      const a = ARCHIVE[Number(row.dataset.peek)];
      if (a.noPeek) return;
      row.addEventListener('mouseenter', () => {
        peek.innerHTML = a.video ? `<video src="${a.video}" poster="${a.poster}" muted autoplay loop playsinline></video>` : `<img src="${a.poster}" alt="">`;
        peek.classList.toggle('wide', !!a.wide);
        peek.classList.add('on');
      });
      row.addEventListener('mouseleave', () => { peek.classList.remove('on'); });
    });
  }

  ScrollTrigger.sort();
  ScrollTrigger.addEventListener('refresh', () => stage.layout());
  let t;
  let lastWidth = window.innerWidth;
  const touch = matchMedia('(hover: none)').matches;
  window.addEventListener('resize', () => {
    // On phones the address bar sliding away fires resize mid-scroll. Only a real
    // width change (rotation) should re-measure the page.
    if (touch && window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(t);
    t = setTimeout(() => {
      fitType();
      stage.resize();
      ScrollTrigger.refresh();
    }, 180);
  });
}

// ---- Boot ----------------------------------------------------------------------
async function runLoader(tasks) {
  const log = $('.loader__log');
  const pct = $('.loader__pct span');
  const lines = [
    '$ xcodebuild -scheme Portfolio',
    'Compiling Swift sources',
    `Linking ${PROJECTS.slice(0, 3).map((p) => p.name).join(', ')} and ${PROJECTS.length - 3 + ARCHIVE.length} more`,
    'Signing with identity "Ahmed Elkady"',
  ];
  const state = { v: 0, target: 0 };
  let done = 0;
  tasks.forEach((p) => p.catch(() => {}).finally(() => {
    done++;
    state.target = (done / tasks.length) * 100;
  }));
  const tween = gsap.ticker.add(() => {
    state.v += (state.target - state.v) * 0.14;
    pct.textContent = Math.round(state.v);
    const n = Math.min(lines.length, 1 + Math.floor((state.v / 100) * lines.length));
    if (log.dataset.n !== String(n)) {
      log.dataset.n = n;
      log.textContent = lines.slice(0, n).join('\n');
    }
  });
  await Promise.all([Promise.allSettled(tasks), new Promise((r) => setTimeout(r, 1300))]);
  await new Promise((r) => setTimeout(r, 380));
  gsap.ticker.remove(tween);
  pct.textContent = '100';
  log.innerHTML = `${lines.join('\n')}\n<b>** BUILD SUCCEEDED **</b>`;
  await new Promise((r) => setTimeout(r, 420));
}

function preload(urls) {
  return urls.map((u) => new Promise((res) => {
    const i = new Image();
    i.onload = res;
    i.onerror = res;
    i.src = u;
  }));
}

async function boot() {
  render();
  // Adding ?static to the URL shows the same fallback, handy for checking it.
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || location.search.includes('static');
  const fonts = Promise.all([
    document.fonts.load('400 100px "Instrument Serif"'),
    document.fonts.load('italic 400 40px "Instrument Serif"'),
    document.fonts.load('500 20px "Instrument Sans"'),
    document.fonts.load('600 20px "Instrument Sans"'),
    document.fonts.load('400 20px "JetBrains Mono"'),
    document.fonts.load('500 20px "JetBrains Mono"'),
  ]);

  if (reduce || !hasWebGL()) {
    document.documentElement.classList.add('no-stage');
    await fonts.catch(() => {});
    fitType();
    window.addEventListener('resize', fitType);
    return;
  }

  gsap.set('.hero__row .ch > span', { yPercent: 112 });
  gsap.set('.hero__foot .fade', { autoAlpha: 0, y: 16 });
  window.scrollTo(0, 0);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const images = preload([
    'assets/photos/ahmed.webp',
    'assets/screens/topleague/01.webp',
    ...PROJECTS.map((p) => p.icon),
    'assets/icons/todoist.webp', 'assets/icons/toku.webp',
  ]);
  const loader = runLoader([fonts, ...images]);
  await fonts.catch(() => {});

  const { Stage } = await import('./stage.js');
  const stage = new Stage($('#stage'), { projects: PROJECTS, archive: ARCHIVE, owner: OWNER });
  window.__stage = stage;
  fitType();
  setupMotion(stage);
  ScrollTrigger.refresh();
  stage.layout();
  await loader;

  const tl = gsap.timeline();
  // The name lands first so it can be read in full, then the phone drops over it.
  tl.to('#loader', { yPercent: -100, duration: 1.05, ease: 'expo.inOut' })
    .set('#loader', { display: 'none' })
    .to('.hero__row .ch > span', { yPercent: 0, duration: 1.15, stagger: 0.035, ease: 'power4.out' }, 0.45)
    .to(stage, { intro: 1, duration: 1.7, ease: 'expo.out' }, 1.75)
    .to('.hero__foot .fade', { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 1.9);
}

boot();
