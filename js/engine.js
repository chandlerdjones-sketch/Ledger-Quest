// Core loop, input, timers, saves.
(() => {
const LQ = window.LQ;
const VW = 960, VH = 540, BW = 320, BH = 180;
Object.assign(LQ, { VW, VH, BW, BH, T: 16, time: 0, busy: 0, fadeA: 1, shakeT: 0, scene: null });

const canvas = document.getElementById('game');
const ctx = LQ.ctx = canvas.getContext('2d');
const buf = document.createElement('canvas'); buf.width = BW; buf.height = BH;
const bctx = buf.getContext('2d');
let S = 1;
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const sc = Math.min(innerWidth / VW, innerHeight / VH);
  const cw = VW * sc, ch = VH * sc;
  canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
  canvas.width = Math.max(1, Math.round(cw * dpr)); canvas.height = Math.max(1, Math.round(ch * dpr));
  S = canvas.width / VW;
}
addEventListener('resize', resize); resize();

// ---- input
const KEYMAP = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right',
  ' ': 'ok', Enter: 'ok', z: 'ok', Z: 'ok', Escape: 'back', x: 'back', X: 'back',
  j: 'menu', J: 'menu', Tab: 'menu', m: 'mute', M: 'mute',
  e: 'use', E: 'use', c: 'use', C: 'use', q: 'cycle', Q: 'cycle', k: 'kit', K: 'kit', n: 'narr', N: 'narr' };
const input = LQ.input = { down: {}, pressed: {} };
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = KEYMAP[e.key]; if (!k) return;
  e.preventDefault();
  const modal = LQ.ui;
  const repeats = modal?.doc?.update && !modal.choice && !modal.dlg && ['left', 'right', 'up', 'down'].includes(k)
    || (modal?.menu || modal?.choice) && (k === 'up' || k === 'down');
  if (!e.repeat || repeats) input.pressed[k] = true;
  if (k === 'ok' && !e.repeat && LQ.gesture) { const g = LQ.gesture; LQ.gesture = null; g(); }
  input.down[k] = true;
  if (LQ.audio) LQ.audio.unlock();
});
addEventListener('keyup', e => { const k = KEYMAP[e.key]; if (k) input.down[k] = false; });
addEventListener('blur', () => { input.down = {}; input.pressed = {}; });
addEventListener('pointerdown', () => { if (LQ.audio) LQ.audio.unlock(); });
LQ.hit = k => { if (input.pressed[k]) { input.pressed[k] = false; return true; } return false; };

// ---- timers and tweens (run on game time)
const timers = [];
LQ.wait = s => new Promise(r => timers.push({ t: s, dur: s, r }));
LQ.tween = (dur, fn) => new Promise(r => { fn(0); timers.push({ t: dur, dur, fn, r }); });
LQ.fadeTo = (a, dur = 0.45) => { const from = LQ.fadeA; return LQ.tween(dur, k => { LQ.fadeA = from + (a - from) * k; }); };
LQ.shake = (t = 0.3) => { LQ.shakeT = Math.max(LQ.shakeT, t); };
LQ.setScene = s => { LQ.scene = s; if (s.enter) s.enter(); };
LQ.script = async fn => {
  LQ.busy++;
  try { await fn(); } catch (e) { console.error(e); }
  LQ.busy--; LQ.save();
};

// ---- helpers
LQ.money = n => (n < 0 ? '-' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
LQ.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
LQ.hash = (x, y, s = 0) => {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ---- game state and saves (three slots, with backup files)
const OLD_KEY = 'ledgerquest.save.v2', MIGRATED_KEY = 'ledgerquest.save.v2.migrated', SLOT = n => 'ledgerquest.save.v3.slot' + n;
LQ.SAVE_VERSION = 3; LQ.slot = 1;
LQ.newState = () => ({ ver: LQ.SAVE_VERSION, quest: 0, w4: null, savvy: 0, coins: 0, asked: 0, first: 0, journal: [], items: [],
  season: 'summer', px: 24 * 16, py: 37 * 16 + 14, dir: 'up', chests: {}, coinsGot: {}, flags: {},
  career: null, streak: 0, gear: [], tips: {}, audits: 0, auditHistory: {}, auditDist: 0, auditNext: 2200, day: 0, prices: null, prev: null, lots: null, gazette: [], news: null, lossBank: 0, brokerRealized: 0, capTax: 0, divs: 0, seed: 1,
  region: 'village', q2: null, rcpt: {}, w4b: null, wh2: null, child: false,
  q3: null, gig: null, est3: null, q4: null, inv: null, hold4: null, harv4: null, acct4: null,
  hp: 4, tool: null });
LQ.state = LQ.newState();
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }, del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } } };
// Accept only data shaped like a save, and keep only the fields the game knows about.
LQ.cleanSave = raw => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (!Number.isInteger(raw.quest) || raw.quest < 0 || raw.quest > 9) return null;
  if (raw.career != null && !(typeof raw.career === 'string' && Object.hasOwn(LQ.CAREERS, raw.career))) return null;
  const record = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const base = LQ.newState(), out = {};
  for (const k in base) {
    const v = raw[k], d = base[k];
    if (v === undefined) { out[k] = d; continue; }
    const same = d === null ? (v === null || ['number', 'string', 'object'].includes(typeof v)) :
      Array.isArray(d) ? Array.isArray(v) : typeof d === 'object' ? record(v) :
        typeof v === typeof d && (typeof d !== 'number' || Number.isFinite(v));
    if (!same) return null;
    out[k] = v;
  }
  if (!['village', 'coast', 'canyon', 'summit'].includes(out.region)) return null;
  for (const [k, max] of [['q2', 8], ['q3', 8], ['q4', 9]]) {
    if (out[k] != null && (!Number.isInteger(out[k]) || out[k] < 0 || out[k] > max)) return null;
  }
  if (!['up', 'down', 'left', 'right'].includes(out.dir)) return null;
  if (!['summer', 'winter'].includes(out.season)) return null;
  for (const k of ['w4', 'w4b', 'est3', 'harv4', 'acct4']) {
    if (out[k] != null && ![0, 1, 2].includes(out[k])) return null;
  }
  if (out.hold4 != null && ![0, 1].includes(out.hold4)) return null;
  if (out.wh2 != null && (!Number.isFinite(out.wh2) || out.wh2 < 0)) return null;
  if (out.news != null && (!record(out.news) || !Number.isFinite(out.news.pct) || typeof out.news.text !== 'string')) return null;
  out.hp = LQ.clamp(Math.round(out.hp * 4) / 4 || 4, .25, 6);   // quarter hearts
  if (out.tool != null && typeof out.tool !== 'string') out.tool = null;
  if (out.gig != null && !(typeof out.gig === 'string' && Object.hasOwn(LQ.GIGS, out.gig))) return null;
  if (out.q4 != null && (!out.gig || !out.inv)) return null;
  if (out.inv != null && (!record(out.inv) || ['st', 'lt', 'qd', 'int'].some(k => !Number.isFinite(out.inv[k])))) return null;
  if (out.prices != null) {
    if (![out.prices, out.prev, out.lots].every(record)) return null;
    const price = n => Number.isFinite(n) && n > 0;
    for (const { id } of LQ.STOCKS) {
      if (out.prices[id] != null && (!price(out.prices[id]) || !price(out.prev[id]))) return null;
      const lots = out.lots[id];
      if (lots != null && (!Array.isArray(lots) || !lots.every(l => record(l) && Number.isInteger(l.n) && l.n > 0 && price(l.cost)))) return null;
    }
  }
  const strs = a => a.every(x => typeof x === 'string');
  if (![out.journal, out.items, out.gear, out.gazette].every(strs)) return null;
  if (LQ.JOURNAL) out.journal = out.journal.filter(id => Object.hasOwn(LQ.JOURNAL, id));
  if (LQ.ITEMS) out.items = out.items.filter(id => Object.hasOwn(LQ.ITEMS, id));
  if (LQ.GEAR) out.gear = out.gear.filter(id => LQ.GEAR.some(g => g.id === id));
  out.ver = LQ.SAVE_VERSION;
  return out;
};
LQ.parseSave = text => { try { return LQ.cleanSave(JSON.parse(text)); } catch (e) { return null; } };
let saveWarning = false;
LQ.save = () => {
  if (!LQ.started) return;
  const ok = store.set(SLOT(LQ.slot), JSON.stringify(LQ.state));
  if (!ok && !saveWarning) LQ.ui.toast('Progress could not be saved. Check your browser storage settings.');
  saveWarning = !ok;
};
addEventListener('pagehide', () => { if (LQ.scene === LQ.world && !LQ.busy) LQ.save(); });
LQ.loadSlot = n => { const t = store.get(SLOT(n)); return t ? LQ.parseSave(t) : null; };
LQ.deleteSlot = n => store.del(SLOT(n));
// Saves from before slots existed move into slot 1 the first time the game loads.
LQ.migrateSaves = () => {
  if (store.get(MIGRATED_KEY)) return false;
  const old = store.get(OLD_KEY), s = old && LQ.parseSave(old);
  if (!s) return false;
  const hasSlots = [1, 2, 3].some(n => store.get(SLOT(n)));
  if (!hasSlots && !store.set(SLOT(1), JSON.stringify(s))) return false;
  store.set(MIGRATED_KEY, '1');
  return !hasSlots;
};
LQ.exportText = n => { const s = LQ.loadSlot(n); return s ? JSON.stringify({ game: 'Ledger Quest', exported: new Date().toISOString().slice(0, 10), save: s }, null, 1) : null; };
LQ.exportSlot = n => {
  const text = LQ.exportText(n); if (!text) return false;
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = 'ledger-quest-slot' + n + '.json'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000); return true;
};
LQ.importText = (text, n) => {
  let raw; try { raw = JSON.parse(text); } catch (e) { return false; }
  const s = LQ.cleanSave(raw && raw.save ? raw.save : raw); if (!s) return false;
  return store.set(SLOT(n), JSON.stringify(s));
};
// Opens the browser's file picker. Must be called straight from a key press.
LQ.pickFile = () => new Promise(res => {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f || f.size > 400000) return res(null); const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => res(null); r.readAsText(f); };
  inp.oncancel = () => res(null); inp.click();
});

// ---- main loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; LQ.time += dt;
  for (let i = timers.length - 1; i >= 0; i--) {
    const tm = timers[i]; tm.t -= dt;
    if (tm.fn) tm.fn(1 - Math.max(tm.t, 0) / tm.dur);
    if (tm.t <= 0) { timers.splice(i, 1); tm.r(); }
  }
  if (LQ.hit('mute')) LQ.audio.toggleMute();
  if (LQ.hit('narr') && LQ.narr) LQ.narr.toggle();
  LQ.ui.update(dt);
  if (LQ.scene && LQ.scene.update) LQ.scene.update(dt);

  bctx.setTransform(1, 0, 0, 1, 0, 0);
  if (LQ.scene && LQ.scene.draw) LQ.scene.draw(bctx);

  let sx = 0, sy = 0;
  if (LQ.shakeT > 0) { LQ.shakeT -= dt; sx = (Math.random() - .5) * 14; sy = (Math.random() - .5) * 14; }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#07081a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buf, sx * S, sy * S, canvas.width, canvas.height);
  ctx.setTransform(S, 0, 0, S, sx * S, sy * S);
  if (LQ.scene && LQ.scene.drawUI) LQ.scene.drawUI(ctx);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  LQ.ui.draw(ctx);
  if (LQ.fadeA > 0.001) { ctx.fillStyle = `rgba(7,8,26,${LQ.fadeA})`; ctx.fillRect(0, 0, VW, VH); }
  for (const k in input.pressed) input.pressed[k] = false;
  requestAnimationFrame(frame);
}
LQ.boot = async () => {
  try {
    await Promise.race([
      Promise.all([document.fonts.load('16px "Press Start 2P"'), document.fonts.load('28px VT323')]),
      new Promise(r => setTimeout(r, 2500)),
    ]);
  } catch (e) { /* fall back to monospace */ }
  LQ.setScene(LQ.title);
  LQ.fadeTo(0, 0.8);
  requestAnimationFrame(t => { last = t; frame(t); });
};
})();
