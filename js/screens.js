// Everything the phone can display. One 2D canvas feeds the 3D screen texture,
// so app recordings, screenshots and hand-drawn screens all share a pipeline.

const CW = 640;
const CH = 1380;
const SANS = '"Instrument Sans", system-ui, sans-serif';
const SERIF = '"Instrument Serif", Georgia, serif';
const MONO = '"JetBrains Mono", Consolas, monospace';

const SWIFT = `import Foundation
import Alamofire

protocol NetworkService {

  func fetchLeagues(
    sport: SportType,
    completion: @escaping
      ([League]?, Error?) -> Void
  )

  func fetchEvents(
    sport: SportType,
    leagueId: String,
    from: String,
    to: String,
    completion: @escaping
      ([SportEvent]?, Error?) -> Void
  )

  func fetchTeams(
    leagueId: String,
    sport: SportType,
    completion: @escaping
      ([Team]?, Error?) -> Void
  )

  func fetchPlayers(
    leagueId: String,
    sport: SportType,
    completion: @escaping
      ([Player]?, Error?) -> Void
  )
}

class AlamofireNetworkService:
    NetworkService {

  static let shared =
    AlamofireNetworkService()

  private init() {}

  private var apiKey: String {
    return APIKeyManager.shared.apiKey
  }
}`;

const TESTS = [
  'fetchLeagues_isCalled_withCorrectSport', 'fetchLeagues_returnsLeagues_onSuccess',
  'fetchLeagues_returnsError_onFailure', 'fetchLeagues_returnsNil_whenNoData',
  'fetchEvents_isCalled_withCorrectParameters', 'fetchEvents_returnsEvents_onSuccess',
  'fetchEvents_returnsError_onFailure', 'fetchTeams_isCalled_withCorrectLeagueId',
  'fetchTeams_returnsTeams_onSuccess', 'fetchTeams_returnsError_onFailure',
  'fetchEventDetail_isCalled_withCorrectParameters', 'fetchEventDetail_returnsEventDetail_onSuccess',
  'fetchEventDetail_returnsError_onFailure', 'fetchEventDetail_returnsNil_whenNoData',
  'fetchPlayerDetails_isCalled_withCorrectParameters', 'fetchPlayerDetails_returnsPlayer_onSuccess',
  'fetchPlayerDetails_returnsError_onFailure', 'fetchPlayerDetails_returnsNil_whenNoData',
  'fetchTeamDetails_isCalled_withCorrectParameters', 'fetchTeamDetails_returnsTeam_onSuccess',
  'fetchTeamDetails_returnsError_onFailure', 'fetchTeamDetails_returnsNil_whenNoData',
  'fetchPlayers_isCalled_withCorrectParameters', 'fetchPlayers_returnsPlayers_onSuccess',
  'fetchPlayers_returnsError_onFailure', 'fetchPlayers_returnsNil_whenNoData',
];

const KEYWORDS = /\b(import|protocol|func|class|static|let|var|private|init|return|self)\b/g;
const TYPES = /\b(Foundation|Alamofire|NetworkService|SportType|String|Void|Error|League|SportEvent|Team|Player|AlamofireNetworkService|APIKeyManager)\b/g;

function tokenize(line) {
  const marks = new Array(line.length).fill('#E8E6E3');
  const paint = (re, color) => {
    for (const m of line.matchAll(re)) for (let i = 0; i < m[0].length; i++) marks[m.index + i] = color;
  };
  paint(TYPES, '#7AD0E8');
  paint(KEYWORDS, '#FF7AB2');
  paint(/@escaping/g, '#FFA14F');
  return marks;
}

const CODE = SWIFT.split('\n').map((text) => ({ text, marks: tokenize(text) }));
const CODE_CHARS = CODE.reduce((n, l) => n + l.text.length + 1, 0);

function cover(x, media, iw, ih, dw, dh, focusY = 0.5) {
  const s = Math.max(dw / iw, dh / ih);
  const sw = dw / s;
  const sh = dh / s;
  x.drawImage(media, (iw - sw) / 2, (ih - sh) * focusY, sw, sh, 0, 0, dw, dh);
}

function statusBar(x, color) {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  x.fillStyle = color;
  x.font = `600 27px ${SANS}`;
  x.textAlign = 'left';
  x.fillText(`${h}:${m}`, 62, 62);
  [0, 1, 2, 3].forEach((i) => x.fillRect(486 + i * 10, 62 - 8 - i * 4, 7, 8 + i * 4));
  x.lineWidth = 2;
  x.strokeStyle = color;
  x.beginPath();
  x.roundRect(536, 42, 46, 22, 6);
  x.stroke();
  x.fillRect(540, 46, 34, 14);
}

export class ScreenPainter {
  constructor({ projects, archive, owner, portrait }) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = CW;
    this.canvas.height = CH;
    this.x = this.canvas.getContext('2d', { alpha: false });
    this.owner = owner;
    this.projects = Object.fromEntries(projects.map((p) => [p.id, p]));
    this.projectList = projects;
    this.archive = archive;
    this.images = new Map();
    this.videos = new Map();
    this.portrait = this.image(portrait);
    this.ui = this.image('assets/screens/topleague/01.webp');
    this.icons = {};
    [...projects, { id: 'todoist', icon: 'assets/icons/todoist.webp' }, { id: 'toku', icon: 'assets/icons/toku.webp' }]
      .forEach((p) => { this.icons[p.id] = this.image(p.icon); });
    this.current = null;
    this.state = {};
    this.minute = -1;
    this.hover = null;
    this.hits = [];
    this.videoHost = document.createElement('div');
    this.videoHost.style.cssText = 'position:fixed;width:2px;height:2px;opacity:0;pointer-events:none;left:0;top:0;overflow:hidden';
    document.body.appendChild(this.videoHost);
  }

  image(url) {
    if (this.images.has(url)) return this.images.get(url);
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    this.images.set(url, img);
    return img;
  }

  // Load what a screen needs before the phone gets there.
  prepare(id) {
    const p = this.projects[id];
    if (!p) return;
    if (p.media.type === 'images') {
      p.media.screens.forEach((u) => this.image(u));
      return;
    }
    this.image(p.media.poster);
    if (this.videos.has(id)) return;
    const v = document.createElement('video');
    v.muted = true;
    v.defaultMuted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.src = p.media.src;
    this.videoHost.appendChild(v);
    this.videos.set(id, v);
  }

  setHover(action) {
    if (this.hover === action) return;
    this.hover = action;
    this.state.dirty = true;
  }

  // u, v come from the 3D raycast; v runs bottom-to-top.
  hit(u, v) {
    const px = u * CW;
    const py = (1 - v) * CH;
    const h = this.hits.find((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
    return h ? h.action : null;
  }

  paint(id, progress, now) {
    if (id !== this.current) {
      const old = this.videos.get(this.current);
      if (old) old.pause();
      this.current = id;
      this.state = { dirty: true, started: now, index: 0, lastSwap: now, lastP: -1, lastT: -1 };
      this.hits = [];
      const v = this.videos.get(id);
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
    }
    switch (id) {
      case 'lock': return this.lock();
      case 'blank': return this.blank(now);
      case 'ui': return this.static(this.ui, 'ui');
      case 'code': return this.code(progress, now);
      case 'tests': return this.tests(progress);
      case 'home': return this.home();
      case 'call': return this.call(now);
      default: return this.app(id, now);
    }
  }

  lock() {
    const minute = new Date().getMinutes();
    const ready = this.portrait.complete && this.portrait.naturalWidth > 0;
    if (!this.state.dirty && minute === this.minute && ready === this.state.ready) return false;
    this.minute = minute;
    this.state.dirty = false;
    this.state.ready = ready;
    const x = this.x;
    const g = x.createLinearGradient(0, 0, 0, CH);
    g.addColorStop(0, '#A3ACBC');
    g.addColorStop(1, '#5E6778');
    x.fillStyle = g;
    x.fillRect(0, 0, CW, CH);
    if (ready) {
      const s = 1.34 * CH / this.portrait.naturalHeight;
      const w = this.portrait.naturalWidth * s;
      x.drawImage(this.portrait, (CW - w) / 2, 150, w, w);
    }
    const fade = x.createLinearGradient(0, CH - 520, 0, CH);
    fade.addColorStop(0, 'rgba(10,10,14,0)');
    fade.addColorStop(1, 'rgba(10,10,14,.82)');
    x.fillStyle = fade;
    x.fillRect(0, CH - 520, CW, 520);
    statusBar(x, '#fff');
    const d = new Date();
    x.textAlign = 'center';
    x.fillStyle = '#fff';
    x.font = `500 30px ${SANS}`;
    x.fillText(d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }), CW / 2, 168);
    x.font = `400 170px ${SERIF}`;
    x.fillText(`${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`, CW / 2, 318);
    x.fillStyle = 'rgba(255,255,255,.22)';
    x.beginPath();
    x.roundRect(34, CH - 300, CW - 68, 148, 38);
    x.fill();
    x.fillStyle = '#35C76B';
    x.beginPath();
    x.roundRect(58, CH - 276, 96, 96, 24);
    x.fill();
    x.fillStyle = '#fff';
    x.font = `400 66px ${SERIF}`;
    x.fillText('AE', 106, CH - 205);
    x.textAlign = 'left';
    x.font = `600 31px ${SANS}`;
    x.fillText('Open to work', 176, CH - 240);
    x.font = `400 27px ${SANS}`;
    x.fillText('iOS and mobile developer roles', 176, CH - 200);
    x.fillStyle = 'rgba(255,255,255,.9)';
    x.beginPath();
    x.roundRect(CW / 2 - 110, CH - 34, 220, 9, 5);
    x.fill();
    return true;
  }

  blank(now) {
    const on = Math.floor(now / 530) % 2 === 0;
    if (!this.state.dirty && on === this.state.on) return false;
    this.state.on = on;
    this.state.dirty = false;
    const x = this.x;
    x.fillStyle = '#FFFFFF';
    x.fillRect(0, 0, CW, CH);
    statusBar(x, '#14110C');
    if (on) {
      x.fillStyle = '#C8553D';
      x.fillRect(CW / 2 - 3, CH / 2 - 44, 6, 88);
    }
    return true;
  }

  static(img, key) {
    const ready = img.complete && img.naturalWidth > 0;
    if (!this.state.dirty && ready === this.state.ready) return false;
    this.state.dirty = false;
    this.state.ready = ready;
    const x = this.x;
    if (ready) cover(x, img, img.naturalWidth, img.naturalHeight, CW, CH);
    else { x.fillStyle = '#fff'; x.fillRect(0, 0, CW, CH); }
    x.fillStyle = '#14110C';
    x.beginPath();
    x.roundRect(CW / 2 - 186, CH - 150, 372, 94, 47);
    x.fill();
    x.fillStyle = '#FFF4EA';
    x.textAlign = 'center';
    x.font = `400 60px ${SERIF}`;
    x.fillText('Presentation', CW / 2, CH - 84);
    return key !== undefined;
  }

  code(p, now) {
    const blink = Math.floor(now / 480) % 2 === 0;
    const q = Math.round(p * 400);
    if (!this.state.dirty && q === this.state.lastP && blink === this.state.on) return false;
    this.state.lastP = q;
    this.state.on = blink;
    this.state.dirty = false;
    const x = this.x;
    x.fillStyle = '#1F1F24';
    x.fillRect(0, 0, CW, CH);
    const budget = Math.floor(p * CODE_CHARS);
    const lh = 33;
    let used = 0;
    let caretLine = 0;
    let caretCol = 0;
    CODE.forEach((l, i) => {
      if (used <= budget) {
        caretLine = i;
        caretCol = Math.min(l.text.length, budget - used);
      }
      used += l.text.length + 1;
    });
    const top = 174;
    const room = CH - top - 70;
    const scroll = Math.max(0, caretLine * lh - room * 0.62);
    x.save();
    x.beginPath();
    x.rect(0, top - 4, CW, CH - top);
    x.clip();
    x.font = `400 21px ${MONO}`;
    x.textAlign = 'left';
    const cw = x.measureText('M').width;
    used = 0;
    CODE.forEach((l, i) => {
      const y = top + 22 + i * lh - scroll;
      const visible = Math.max(0, Math.min(l.text.length, budget - used));
      used += l.text.length + 1;
      if (y < top - 40 || y > CH + 30) return;
      x.fillStyle = i === caretLine ? '#8A8A93' : '#55555E';
      x.textAlign = 'right';
      x.fillText(String(i + 1), 44, y);
      x.textAlign = 'left';
      for (let c = 0; c < visible; c++) {
        if (l.text[c] === ' ') continue;
        x.fillStyle = l.marks[c];
        x.fillText(l.text[c], 58 + c * cw, y);
      }
    });
    if (blink) {
      x.fillStyle = '#fff';
      x.fillRect(58 + caretCol * cw, top + 3 + caretLine * lh - scroll, 3, 26);
    }
    x.restore();
    x.fillStyle = '#2A2A30';
    x.fillRect(0, 0, CW, 158);
    statusBar(x, '#fff');
    x.fillStyle = '#8A8A93';
    x.font = `500 21px ${MONO}`;
    x.textAlign = 'left';
    x.fillText('Top-League / Models / Services', 36, 104);
    x.fillStyle = '#fff';
    x.font = `500 25px ${MONO}`;
    x.fillText('NetworkService.swift', 36, 140);
    return true;
  }

  tests(p) {
    const q = Math.round(p * 300);
    if (!this.state.dirty && q === this.state.lastP) return false;
    this.state.lastP = q;
    this.state.dirty = false;
    const x = this.x;
    x.fillStyle = '#F7F6F3';
    x.fillRect(0, 0, CW, CH);
    x.fillStyle = '#FFFFFF';
    x.fillRect(0, 0, CW, 196);
    statusBar(x, '#14110C');
    x.fillStyle = '#14110C';
    x.textAlign = 'left';
    x.font = `400 46px ${SERIF}`;
    x.fillText('Top_LeagueMockTest', 34, 136);
    const done = Math.min(TESTS.length, Math.floor(p * 1.12 * (TESTS.length + 1)));
    x.font = `500 21px ${MONO}`;
    x.fillStyle = '#7B766C';
    x.fillText(`${done} / ${TESTS.length} passed`, 34, 176);
    x.fillStyle = '#E3DFD5';
    x.fillRect(0, 194, CW, 3);
    x.fillStyle = '#23A455';
    x.fillRect(0, 194, CW * (done / TESTS.length), 3);
    const rowH = 44;
    TESTS.forEach((t, i) => {
      const y = 214 + i * rowH;
      const passed = i < done;
      const running = i === done && done < TESTS.length;
      x.fillStyle = passed ? '#23A455' : running ? '#E6A100' : '#CFC9BC';
      x.save();
      x.translate(40, y + 14);
      x.rotate(Math.PI / 4);
      x.beginPath();
      x.roundRect(-11, -11, 22, 22, 4);
      x.fill();
      x.restore();
      if (passed) {
        x.strokeStyle = '#fff';
        x.lineWidth = 3.4;
        x.lineCap = 'round';
        x.lineJoin = 'round';
        x.beginPath();
        x.moveTo(33, y + 14);
        x.lineTo(38.5, y + 20);
        x.lineTo(47.5, y + 8);
        x.stroke();
      }
      x.fillStyle = passed ? '#14110C' : '#9B958A';
      x.font = `400 16.5px ${MONO}`;
      x.fillText(t, 68, y + 20);
    });
    if (done >= TESTS.length) {
      x.fillStyle = '#14110C';
      x.beginPath();
      x.roundRect(CW / 2 - 170, CH - 76, 340, 58, 29);
      x.fill();
      x.fillStyle = '#7BE3A3';
      x.textAlign = 'center';
      x.font = `600 25px ${SANS}`;
      x.fillText('Test Succeeded', CW / 2, CH - 38);
    }
    return true;
  }

  home() {
    const allReady = Object.values(this.icons).every((i) => i.complete);
    const key = `${this.hover}|${allReady}|${new Date().getMinutes()}`;
    if (!this.state.dirty && key === this.state.key) return false;
    this.state.key = key;
    this.state.dirty = false;
    const x = this.x;
    const g = x.createLinearGradient(0, 0, CW * 0.4, CH);
    g.addColorStop(0, '#191635');
    g.addColorStop(0.55, '#5A3C86');
    g.addColorStop(1, '#E88F5F');
    x.fillStyle = g;
    x.fillRect(0, 0, CW, CH);
    statusBar(x, '#fff');

    x.fillStyle = 'rgba(255,255,255,.14)';
    x.beginPath();
    x.roundRect(36, 118, CW - 72, 176, 42);
    x.fill();
    x.fillStyle = '#fff';
    x.textAlign = 'left';
    x.font = `400 82px ${SERIF}`;
    x.fillText('13 projects', 66, 204);
    x.font = `400 24px ${MONO}`;
    x.fillStyle = 'rgba(255,255,255,.78)';
    x.fillText('iOS  Android  Flutter  KMP', 68, 254);

    const names = { pocketshop: 'PocketShop', topleague: 'Top League', climaswift: 'ClimaSwift', todoist: 'Todoist', toku: 'Toku' };
    const ids = [...this.projectList.map((p) => p.id), 'todoist', 'toku'];
    const size = 122;
    const gap = (CW - size * 4) / 5;
    this.hits = [];
    ids.forEach((id, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const px = gap + col * (size + gap);
      const py = 352 + row * 232;
      const isHover = this.hover === `open:${id}`;
      const grow = isHover ? 8 : 0;
      x.save();
      x.beginPath();
      x.roundRect(px - grow, py - grow, size + grow * 2, size + grow * 2, 30);
      x.fillStyle = '#fff';
      x.fill();
      x.clip();
      const img = this.icons[id];
      if (img && img.complete && img.naturalWidth) x.drawImage(img, px - grow, py - grow, size + grow * 2, size + grow * 2);
      x.restore();
      x.fillStyle = '#fff';
      x.textAlign = 'center';
      x.font = `500 21px ${SANS}`;
      const proj = this.projects[id];
      x.fillText(names[id] || (proj ? proj.name : id), px + size / 2, py + size + 36);
      this.hits.push({ x: px - 10, y: py - 10, w: size + 20, h: size + 50, action: `open:${id}` });
    });

    x.fillStyle = 'rgba(255,255,255,.22)';
    x.beginPath();
    x.roundRect(30, CH - 188, CW - 60, 158, 54);
    x.fill();
    const dock = [
      { label: 'GH', bg: '#14110C', fg: '#fff', action: 'link:github' },
      { label: 'in', bg: '#0A66C2', fg: '#fff', action: 'link:linkedin' },
      { label: '@', bg: '#FFF4EA', fg: '#C8553D', action: 'link:mail' },
    ];
    const dockGap = (CW - 60 - size * 3) / 4;
    dock.forEach((d, i) => {
      const px = 30 + dockGap + i * (size + dockGap);
      const py = CH - 188 + 18;
      x.fillStyle = d.bg;
      x.beginPath();
      x.roundRect(px, py, size, size, 30);
      x.fill();
      x.fillStyle = d.fg;
      x.textAlign = 'center';
      x.font = `400 64px ${SERIF}`;
      x.fillText(d.label, px + size / 2, py + 82);
      this.hits.push({ x: px, y: py, w: size, h: size, action: d.action });
    });
    return true;
  }

  call(now) {
    const x = this.x;
    const g = x.createLinearGradient(0, 0, 0, CH);
    g.addColorStop(0, '#2B1A14');
    g.addColorStop(0.6, '#15100D');
    g.addColorStop(1, '#0B0807');
    x.fillStyle = g;
    x.fillRect(0, 0, CW, CH);
    statusBar(x, '#fff');
    x.textAlign = 'center';
    x.fillStyle = 'rgba(255,255,255,.66)';
    x.font = `500 28px ${SANS}`;
    x.fillText('incoming call', CW / 2, 190);
    x.fillStyle = '#fff';
    x.font = `400 92px ${SERIF}`;
    x.fillText('Ahmed Elkady', CW / 2, 288);
    x.font = `400 28px ${SANS}`;
    x.fillStyle = 'rgba(255,255,255,.66)';
    x.fillText('iOS Developer, Cairo', CW / 2, 336);

    const cy = 660;
    for (let i = 0; i < 3; i++) {
      const t = ((now / 2100 + i / 3) % 1);
      x.strokeStyle = `rgba(239,210,139,${(1 - t) * 0.5})`;
      x.lineWidth = 3;
      x.beginPath();
      x.arc(CW / 2, cy, 170 + t * 150, 0, Math.PI * 2);
      x.stroke();
    }
    x.save();
    x.beginPath();
    x.arc(CW / 2, cy, 170, 0, Math.PI * 2);
    x.fillStyle = '#8F9AAE';
    x.fill();
    x.clip();
    if (this.portrait.complete && this.portrait.naturalWidth) x.drawImage(this.portrait, CW / 2 - 190, cy - 170, 380, 380);
    x.restore();

    const by = CH - 240;
    const pulse = 1 + Math.sin(now / 240) * 0.05;
    const button = (cx, color, label, action, scale, hang) => {
      x.save();
      x.translate(cx, by);
      x.scale(scale, scale);
      x.fillStyle = color;
      x.beginPath();
      x.arc(0, 0, 78, 0, Math.PI * 2);
      x.fill();
      x.strokeStyle = '#fff';
      x.lineWidth = 11;
      x.lineCap = 'round';
      x.rotate(hang ? Math.PI * 0.75 : 0);
      x.beginPath();
      x.moveTo(-26, 20);
      x.quadraticCurveTo(-26, -24, 22, -26);
      x.stroke();
      x.fillStyle = '#fff';
      x.beginPath();
      x.roundRect(-38, 10, 26, 22, 7);
      x.fill();
      x.beginPath();
      x.roundRect(12, -38, 22, 26, 7);
      x.fill();
      x.restore();
      x.fillStyle = '#fff';
      x.textAlign = 'center';
      x.font = `500 27px ${SANS}`;
      x.fillText(label, cx, by + 122);
      this.hits.push({ x: cx - 90, y: by - 90, w: 180, h: 180, action });
    };
    this.hits = [];
    button(166, '#EB4B3F', 'Decline', 'link:top', 1, true);
    button(CW - 166, '#35C76B', 'Accept', 'link:mail', pulse, false);
    x.fillStyle = 'rgba(255,255,255,.9)';
    x.beginPath();
    x.roundRect(CW / 2 - 110, CH - 34, 220, 9, 5);
    x.fill();
    return true;
  }

  app(id, now) {
    const p = this.projects[id];
    if (!p) return false;
    return p.media.type === 'video' ? this.appVideo(id, p) : this.appImages(p, now);
  }

  appVideo(id, p) {
    const v = this.videos.get(id);
    const x = this.x;
    const land = !!p.media.landscape;
    const live = v && v.readyState >= 2;
    if (v && v.paused) v.play().catch(() => {});
    if (live && v.currentTime === this.state.lastT && !this.state.dirty) return false;
    if (!live && !this.state.dirty && this.state.posterDone) return false;
    const media = live ? v : this.image(p.media.poster);
    const iw = live ? v.videoWidth : media.naturalWidth;
    const ih = live ? v.videoHeight : media.naturalHeight;
    if (!iw) return false;
    if (live) this.state.lastT = v.currentTime;
    else this.state.posterDone = true;
    this.state.dirty = false;
    if (land) {
      x.save();
      x.fillStyle = '#F2FAF5';
      x.fillRect(0, 0, CW, CH);
      x.translate(CW / 2, CH / 2);
      x.rotate(-Math.PI / 2);
      const s = Math.min(CH / iw, CW / ih);
      x.drawImage(media, -iw * s / 2, -ih * s / 2, iw * s, ih * s);
      x.restore();
    } else {
      cover(x, media, iw, ih, CW, CH);
    }
    return true;
  }

  appImages(p, now) {
    const list = p.media.screens.map((u) => this.image(u));
    const s = this.state;
    const x = this.x;
    const hold = 2300;
    const dur = 520;
    const since = now - s.lastSwap;
    let moving = false;
    if (since > hold) {
      if (since < hold + dur) moving = true;
      else {
        s.index = (s.index + 1) % list.length;
        s.lastSwap = now;
        s.dirty = true;
      }
    }
    const curr = list[s.index];
    const next = list[(s.index + 1) % list.length];
    const ready = (i) => i.complete && i.naturalWidth > 0;
    if (!ready(curr)) {
      x.fillStyle = p.bg;
      x.fillRect(0, 0, CW, CH);
      return !!s.dirty && !(s.dirty = false);
    }
    if (!moving && !s.dirty && s.shown === s.index) return false;
    s.dirty = false;
    s.shown = s.index;
    if (moving && ready(next)) {
      const t = (since - hold) / dur;
      const e = 1 - Math.pow(1 - t, 3);
      x.save();
      x.translate(-CW * 0.3 * e, 0);
      cover(x, curr, curr.naturalWidth, curr.naturalHeight, CW, CH);
      x.fillStyle = `rgba(0,0,0,${0.35 * e})`;
      x.fillRect(0, 0, CW, CH);
      x.restore();
      x.save();
      x.translate(CW * (1 - e), 0);
      cover(x, next, next.naturalWidth, next.naturalHeight, CW, CH);
      x.restore();
    } else {
      cover(x, curr, curr.naturalWidth, curr.naturalHeight, CW, CH);
    }
    return true;
  }
}
