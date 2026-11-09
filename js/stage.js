// The 3D phone and the scroll choreography that moves it.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ScreenPainter } from './screens.js';

const W = 1;
const H = 2.07;
const D = 0.105;
const R = 0.155;
const SW = 0.925;
const SH = 1.995;
const SR = 0.118;
const VIEW_H = 3;
const FOV = 30;
const TAU = Math.PI * 2;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

function rr(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function plane(w, h, r, segments = 28) {
  const g = new THREE.ShapeGeometry(rr(w, h, r), segments);
  const p = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
  return g;
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const SANS = '"Instrument Sans", system-ui, sans-serif';
const SERIF = '"Instrument Serif", Georgia, serif';
const MONO = '"JetBrains Mono", Consolas, monospace';

function plateTexture({ title, lines, bg, fg }) {
  return canvasTexture(512, 1060, (x, w, h) => {
    x.fillStyle = bg;
    x.fillRect(0, 0, w, h);
    // Everything sits on the right: that is the part of each plate left
    // uncovered when the stack fans out.
    x.strokeStyle = fg;
    x.globalAlpha = 0.55;
    x.lineWidth = 2;
    x.setLineDash([9, 9]);
    lines.forEach((_, i) => {
      x.beginPath();
      x.roundRect(w - 330, 220 + i * 150, 290, 122, 20);
      x.stroke();
    });
    x.setLineDash([]);
    x.globalAlpha = 1;
    x.fillStyle = fg;
    x.font = `400 92px ${SERIF}`;
    x.textAlign = 'right';
    x.fillText(title, w - 40, 142);
    x.font = `500 25px ${MONO}`;
    lines.forEach((l, i) => x.fillText(l, w - 62, 290 + i * 150));
  });
}

export class Stage {
  constructor(canvas, { projects, archive, owner, onAction }) {
    this.canvas = canvas;
    this.onAction = onAction;
    this.projects = projects;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 40);
    this.camera.position.z = (VIEW_H / 2) / Math.tan(THREE.MathUtils.degToRad(FOV / 2));

    const pm = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(-3, 4, 5);
    this.scene.add(key);

    this.painter = new ScreenPainter({ projects, archive, owner, portrait: 'assets/photos/ahmed.webp' });
    this.screenTex = new THREE.CanvasTexture(this.painter.canvas);
    this.screenTex.colorSpace = THREE.SRGBColorSpace;
    this.screenTex.anisotropy = 8;
    this.screenTex.generateMipmaps = false;
    this.screenTex.minFilter = THREE.LinearFilter;

    this.buildPhone();

    this.pose = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, e: 0 };
    this.intro = 0;
    this.keys = [];
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    this.tint = new THREE.Color('#9a948b');
    this.colorA = new THREE.Color();
    this.colorB = new THREE.Color();
    this.ray = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.screenId = 'lock';
    this.lastPrepared = '';
    this.dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 820 ? 1.5 : 2);
    this.frames = 0;
    this.frameClock = performance.now();

    window.addEventListener('pointermove', (e) => this.onMove(e), { passive: true });
    window.addEventListener('click', (e) => this.onClick(e));
    this.resize();
  }

  buildPhone() {
    const root = new THREE.Group();
    this.scene.add(root);
    this.root = root;

    const shadowTex = canvasTexture(256, 512, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      x.filter = 'blur(26px)';
      x.fillStyle = '#000';
      x.beginPath();
      x.roundRect(52, 52, w - 104, h - 104, 34);
      x.fill();
    });
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 3.4), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false }));
    root.add(this.shadow);

    const phone = new THREE.Group();
    root.add(phone);
    this.phone = phone;

    // Chassis
    const chassis = new THREE.Group();
    phone.add(chassis);
    this.chassis = chassis;
    const bevel = 0.016;
    const bodyGeo = new THREE.ExtrudeGeometry(rr(W - bevel * 2, H - bevel * 2, R - bevel), { depth: D - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 8, curveSegments: 32 });
    bodyGeo.center();
    this.bodyMat = new THREE.MeshPhysicalMaterial({ color: '#9a948b', metalness: 1, roughness: 0.3, clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: 1.25 });
    chassis.add(new THREE.Mesh(bodyGeo, this.bodyMat));

    const tray = new THREE.Mesh(plane(W * 0.96, H * 0.97, R * 0.9), new THREE.MeshBasicMaterial({
      map: plateTexture({ title: 'Platform', lines: ['iOS SDK', 'Android SDK', 'Flutter'], bg: '#16161A', fg: '#EFD28B' }), toneMapped: false,
    }));
    tray.position.z = D / 2 + 0.0015;
    chassis.add(tray);

    // Back glass, camera island and monogram
    this.backMat = new THREE.MeshPhysicalMaterial({ color: '#9a948b', metalness: 0.25, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.2 });
    const back = new THREE.Mesh(new THREE.ShapeGeometry(rr(W * 0.965, H * 0.975, R * 0.92), 32), this.backMat);
    back.rotation.y = Math.PI;
    back.position.z = -D / 2 - 0.0015;
    chassis.add(back);

    const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({
      map: canvasTexture(512, 512, (x, w, h) => {
        x.clearRect(0, 0, w, h);
        x.fillStyle = '#FFF4EA';
        x.font = `400 340px ${SERIF}`;
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.fillText('AE', w / 2, h / 2);
      }), transparent: true, toneMapped: false,
    }));
    mark.rotation.y = Math.PI;
    mark.position.set(0, -0.1, -D / 2 - 0.003);
    chassis.add(mark);

    const cam = new THREE.Group();
    cam.position.set(0.215, 0.745, -D / 2 - 0.002);
    chassis.add(cam);
    const islandGeo = new THREE.ExtrudeGeometry(rr(0.42, 0.45, 0.1), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 4, curveSegments: 20 });
    const island = new THREE.Mesh(islandGeo, this.backMat);
    island.rotation.y = Math.PI;
    cam.add(island);
    const ringMat = new THREE.MeshStandardMaterial({ color: '#2a2a2e', metalness: 1, roughness: 0.25 });
    const lensMat = new THREE.MeshPhysicalMaterial({ color: '#07070d', metalness: 0.4, roughness: 0.05, clearcoat: 1 });
    [[-0.095, 0.105], [-0.095, -0.105], [0.11, 0]].forEach(([lx, ly]) => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.083, 0.087, 0.03, 40), ringMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(lx, ly, -0.03);
      cam.add(barrel);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.064, 40), lensMat);
      lens.rotation.y = Math.PI;
      lens.position.set(lx, ly, -0.0455);
      cam.add(lens);
    });

    const btnMat = this.bodyMat;
    [[W / 2 + 0.002, 0.26, 0.26], [-W / 2 - 0.002, 0.42, 0.11], [-W / 2 - 0.002, 0.24, 0.16], [-W / 2 - 0.002, 0.03, 0.16]].forEach(([bx, by, bh]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.012, bh, 0.04), btnMat);
      b.position.set(bx, by, 0);
      chassis.add(b);
    });

    // Architecture plates, hidden until the phone comes apart
    this.plates = [
      { title: 'Domain', lines: ['Use cases', 'Entities', 'Contracts'], bg: '#EFD28B', fg: '#241A05', z: 0.42 },
      { title: 'Data', lines: ['Repositories', 'Remote', 'Local'], bg: '#C8553D', fg: '#FFF4EA', z: -0.32 },
    ].map((cfg) => {
      const m = new THREE.Mesh(plane(W * 0.965, H * 0.975, R * 0.92), new THREE.MeshBasicMaterial({ map: plateTexture(cfg), toneMapped: false, transparent: true, opacity: 0, side: THREE.DoubleSide }));
      m.visible = false;
      m.userData.z = cfg.z;
      phone.add(m);
      return m;
    });

    // Front assembly: glass, live screen, sensor island
    const front = new THREE.Group();
    phone.add(front);
    this.front = front;
    const glass = new THREE.Mesh(new THREE.ShapeGeometry(rr(W * 0.975, H * 0.985, R * 0.93), 32), new THREE.MeshStandardMaterial({ color: '#040405', metalness: 0.5, roughness: 0.14 }));
    glass.position.z = D / 2 + 0.003;
    front.add(glass);
    this.screen = new THREE.Mesh(plane(SW, SH, SR, 32), new THREE.MeshBasicMaterial({ map: this.screenTex, toneMapped: false }));
    this.screen.position.z = D / 2 + 0.0045;
    front.add(this.screen);
    const pill = new THREE.Mesh(new THREE.ShapeGeometry(rr(0.285, 0.083, 0.041), 20), new THREE.MeshBasicMaterial({ color: '#000' }));
    pill.position.set(0, SH / 2 - 0.082, D / 2 + 0.006);
    front.add(pill);

    const glareTex = canvasTexture(256, 512, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, h);
      g.addColorStop(0.34, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, 'rgba(255,255,255,.55)');
      g.addColorStop(0.66, 'rgba(255,255,255,0)');
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
    });
    glareTex.wrapS = THREE.RepeatWrapping;
    this.glareTex = glareTex;
    const glare = new THREE.Mesh(plane(SW, SH, SR, 32), new THREE.MeshBasicMaterial({ map: glareTex, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    glare.position.z = D / 2 + 0.0075;
    front.add(glare);
  }

  get isMobile() {
    return window.innerWidth < 820 || window.innerWidth / window.innerHeight < 0.95;
  }

  poseFor(el) {
    const name = el.dataset.stage;
    const mobile = this.isMobile;
    const halfW = (VIEW_H / 2) * (window.innerWidth / window.innerHeight);
    const color = el.dataset.phone || '#9a948b';
    const side = el.dataset.side === 'right' ? -1 : 1;
    if (mobile) {
      const m = Math.min(1, window.innerHeight / 780);
      const base = { x: 0, y: 0.62, z: 0, rx: 0, ry: -0.16 * side, rz: 0, s: 0.58 * m, e: 0, color };
      const table = {
        hero: { y: -0.02, ry: -0.14, rz: 0.05, s: 0.8 * m },
        intro: { y: -0.05, ry: 0, s: 0.8 * m },
        layers: { y: 0.5, rx: 0.38, ry: -0.8, rz: 0.16, s: 0.34 * m, e: 1 },
        contact: { y: 0.6, ry: -0.1, s: 0.56 * m },
      };
      if (name === 'gone' || name === 'gone-low') return { hidden: true, ...base, y: name === 'gone' ? 3.8 : -3.8, color };
      if (el.dataset.landscape) return { ...base, y: 0.92, rz: -Math.PI / 2, ry: -0.08, s: Math.min(0.62, halfW * 0.9), color };
      return { ...base, ...(table[name] || {}) };
    }
    const X = (f) => f * halfW;
    const table = {
      hero: { x: 0, y: -0.04, rx: 0.02, ry: -0.16, rz: 0.05, s: 0.94 },
      blank: { x: X(0.42), ry: -0.24, rz: 0.02, s: 1.02 },
      layers: { x: X(0.27), y: 0.02, rx: 0.34, ry: -0.86, rz: 0.14, s: 0.68, e: 1 },
      code: { x: X(0.42), ry: -0.22, rz: -0.02, s: 1.06 },
      tests: { x: X(-0.42), ry: 0.22, rz: 0.02, s: 1.06 },
      intro: { x: 0, ry: 0, s: 0.96 },
      contact: { x: X(0.4), y: -0.02, ry: -0.22, rz: -0.05, s: 1.02 },
    };
    const base = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, e: 0, color };
    if (name === 'gone' || name === 'gone-low') return { ...base, hidden: true, y: name === 'gone' ? 3.8 : -3.8 };
    if (el.dataset.landscape) return { ...base, x: X(0.44), y: 0.5, rz: -Math.PI / 2, ry: -0.08, rx: 0.05, s: Math.min(1.08, halfW * 0.425) };
    if (name === 'project') return { ...base, x: X(0.42 * side), ry: -0.22 * side, rz: 0.02 * side, s: 1.04 };
    return { ...base, ...(table[name] || {}) };
  }

  // Rebuild the scroll keyframes from where the sections actually sit.
  layout() {
    const sections = [...document.querySelectorAll('[data-stage]')];
    const vh = window.innerHeight;
    const keys = [];
    let turn = 0;
    sections.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const holdEnd = Math.max(top + 1, top + r.height - vh);
      const p = this.poseFor(el);
      const prev = keys[keys.length - 1];
      if (prev && !prev.pose.hidden && !p.hidden && el.dataset.spin !== 'none') turn += (i % 2 ? -1 : 1);
      const drift = 0.11;
      const screen = el.dataset.screen || (keys.length ? keys[keys.length - 1].screen : 'lock');
      keys.push({ y: top, seam: true, pose: { ...p, ry: p.ry + turn * TAU - drift }, screen, holdFrom: top, holdTo: holdEnd });
      keys.push({ y: holdEnd, seam: false, pose: { ...p, ry: p.ry + turn * TAU + drift }, screen, holdFrom: top, holdTo: holdEnd });
    });
    this.keys = keys;
  }

  resize() {
    // The canvas is sized to the large viewport so a phone's collapsing address
    // bar never stretches the picture.
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.layout();
  }

  sample(y) {
    const k = this.keys;
    if (!k.length) return null;
    if (y <= k[0].y) return { a: k[0], b: k[0], t: 0, hold: true };
    for (let i = 0; i < k.length - 1; i++) {
      if (y >= k[i].y && y < k[i + 1].y) {
        const raw = (y - k[i].y) / Math.max(1, k[i + 1].y - k[i].y);
        const hold = k[i].screen === k[i + 1].screen && k[i].holdTo === k[i + 1].holdTo;
        return { a: k[i], b: k[i + 1], t: hold ? raw : easeIO(raw), raw, hold };
      }
    }
    const last = k[k.length - 1];
    return { a: last, b: last, t: 0, hold: true };
  }

  update(scrollY, now) {
    const s = this.sample(scrollY);
    if (!s) return;
    const a = s.a.pose;
    const b = s.b.pose;
    const P = this.pose;
    if (a.hidden && b.hidden) Object.assign(P, b);
    else ['x', 'y', 'z', 'rx', 'ry', 'rz', 's', 'e'].forEach((k) => { P[k] = lerp(a[k], b[k], s.t); });
    this.hidden = a.hidden && b.hidden;
    this.colorA.set(a.color);
    this.colorB.set(b.color);
    this.tint.copy(this.colorA).lerp(this.colorB, s.t);
    this.canvas.style.visibility = this.hidden ? 'hidden' : 'visible';

    const screen = s.hold || s.raw < 0.5 ? s.a.screen : s.b.screen;
    this.screenId = screen;
    const key = s.a.screen + s.b.screen;
    if (key !== this.lastPrepared) {
      this.lastPrepared = key;
      this.painter.prepare(s.a.screen);
      this.painter.prepare(s.b.screen);
      const idx = this.keys.findIndex((x) => x.screen === s.b.screen);
      const after = this.keys.slice(idx).find((x) => x.screen !== s.b.screen);
      if (after) this.painter.prepare(after.screen);
    }
    if (this.hidden) {
      const v = this.painter.videos.get(this.painter.current);
      if (v && !v.paused) v.pause();
      this.painter.current = null;
      return;
    }

    const K = s.hold ? s.a : (screen === s.a.screen ? s.a : s.b);
    const span = Math.max(1, K.holdTo - K.holdFrom);
    const progress = clamp((scrollY - K.holdFrom + window.innerHeight * 0.35) / (span + window.innerHeight * 0.3));
    if (this.painter.paint(screen, progress, now)) this.screenTex.needsUpdate = true;

    const pt = this.pointer;
    pt.x += (pt.tx - pt.x) * 0.06;
    pt.y += (pt.ty - pt.y) * 0.06;
    const t = now * 0.001;
    const float = Math.sin(t * 0.9) * 0.018;
    const introT = 1 - this.intro;

    const ph = this.phone;
    let shake = 0;
    if (screen === 'call') {
      const phase = (t % 2.2) / 2.2;
      shake = phase < 0.42 ? Math.sin(t * 58) * 0.022 * Math.sin((phase / 0.42) * Math.PI) : 0;
    }
    ph.position.set(P.x, P.y + float + introT * 3.6, P.z);
    ph.rotation.set(P.rx + pt.y * 0.09, P.ry + pt.x * 0.13 - introT * 3.4, P.rz + shake + introT * 0.5);
    const scale = P.s;
    ph.scale.setScalar(scale);

    this.bodyMat.color.copy(this.tint);
    this.backMat.color.copy(this.tint);

    const e = P.e;
    this.front.position.z = e * 1.14;
    this.chassis.position.z = e * -1.05;
    const plateAlpha = smooth(0.05, 0.3, e);
    this.plates.forEach((m) => {
      m.visible = e > 0.04;
      m.position.z = m.userData.z * e;
      m.material.opacity = plateAlpha;
    });

    this.shadow.position.set(P.x + 0.12 * scale, P.y - 0.16 * scale + introT * 3.6, -0.9);
    this.shadow.rotation.z = P.rz;
    const facing = Math.abs(Math.cos(P.ry)) * 0.72 + 0.28;
    this.shadow.scale.set(scale * facing, scale, 1);
    this.shadow.material.opacity = 0.3 * (1 - e) * (1 - introT);

    this.glareTex.offset.x = (P.ry * 0.28 + pt.x * 0.1) % 1;

    this.renderer.render(this.scene, this.camera);
    this.watchFrames(now);
  }

  // Drop the resolution if a device can't keep up.
  watchFrames(now) {
    // A background tab is throttled by the browser, which says nothing about the device.
    if (document.hidden || now - this.lastFrame > 400) {
      this.frames = 0;
      this.frameClock = now;
      this.lastFrame = now;
      return;
    }
    this.lastFrame = now;
    this.frames++;
    if (now - this.frameClock < 2000) return;
    const fps = (this.frames * 1000) / (now - this.frameClock);
    this.frames = 0;
    this.frameClock = now;
    if (fps < 38 && this.dpr > 1) {
      this.dpr = Math.max(1, this.dpr - 0.25);
      this.renderer.setPixelRatio(this.dpr);
      this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);
    }
  }

  rayHit(e) {
    const id = this.screenId;
    if (this.hidden || (id !== 'home' && id !== 'call')) return null;
    this.ndc.set((e.clientX / this.canvas.clientWidth) * 2 - 1, -(e.clientY / this.canvas.clientHeight) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    const hits = this.ray.intersectObject(this.screen);
    if (!hits.length || !hits[0].uv) return null;
    return this.painter.hit(hits[0].uv.x, hits[0].uv.y);
  }

  onMove(e) {
    this.pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    const action = this.rayHit(e);
    this.painter.setHover(action);
    document.documentElement.classList.toggle('on-phone-action', !!action);
  }

  onClick(e) {
    if (e.target.closest && e.target.closest('a,button,dialog')) return;
    const action = this.rayHit(e);
    if (action && this.onAction) this.onAction(action);
  }
}
