// Field Kit: the Use key, tools, hearts, and their HUD. See GAME_DESIGN_PLAN.md.
(() => {
const LQ = window.LQ, T = 16, ui = LQ.ui, F = LQ.F;
const st = () => LQ.state, sfx = n => LQ.audio.sfx(n);
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };

// Every tool that can gate progress lists a route that costs no coins (`free`). tools/check.js enforces it.
LQ.TOOLS = [
  { id: 'stamp', name: 'Truth Stamp', free: 'Given by Mayor Marigold', have: s => s.quest >= 1 || s.items.includes('stamp') },
  { id: 'shield', name: 'Standard Shield', free: 'Story item from Armorer Thorn', have: s => s.items.includes('shield') },
  { id: 'compass', name: 'Bracket Compass', free: 'Story item from Sage Altamira', have: s => s.items.includes('compass') },
  { id: 'lantern', name: 'Lantern', free: 'Old Lantern in the hidden cache north-west of Paystub Village',
    have: s => LQ.has('charity') || !!s.flags.lanternFound || !!s.flags.lanternRent },
  { id: 'tonic', name: 'Tonic', consumable: true, have: s => (s.flags.tonics || 0) > 0, label: s => 'Tonic x' + s.flags.tonics },
];
LQ.pages = () => { let n = 0; for (let i = 1; i <= 12; i++) if (st().flags['page' + i]) n++; return n; };

const K = LQ.kit = {
  swing: 0, cool: 0, inv: 0, pulse: 0, blocking: false,
  maxHp: () => 4 + (st().flags.heartUp ? 1 : 0),
  hp: () => Math.min(K.maxHp(), st().hp ?? K.maxHp()),
  owned: () => LQ.TOOLS.filter(t => t.have(st())),
  supplies() {
    const s = st(), items = [];
    if (s.flags.tonics) items.push({ name: 'Tonic x' + s.flags.tonics, desc: 'Restores up to two hearts. Switch to it with Q, then press E to drink. A full heart meter leaves the tonic untouched.' });
    if (s.flags.lanternRent) items.push({ name: 'Rented Lantern', desc: 'Lights dark rooms and repels Myth Wisps while held. Switch to it with Q. Your rental ends when you leave the Lantern Cave or faint inside it.' });
    return items;
  },
  cur() { const o = K.owned(); return o.find(t => t.id === st().tool) || o[0] || null; },
  holding: id => { const t = K.cur(); return !!t && t.id === id; },
  hasLantern: () => LQ.TOOLS[3].have(st()),
  cycle() { const o = K.owned(); if (o.length < 2) return; st().tool = o[(o.indexOf(K.cur()) + 1) % o.length].id; sfx('move'); },
  speed: () => K.blocking ? .45 : 1,
  blink: () => K.inv > 0 && Math.floor(LQ.time * 14) % 2 === 0,

  update(dt, w) {
    K.swing = Math.max(0, K.swing - dt); K.pulse = Math.max(0, K.pulse - dt); K.cool -= dt; K.inv -= dt;
    if (LQ.hit('cycle')) K.cycle();
    const t = K.cur();
    K.blocking = !!t && t.id === 'shield' && !!LQ.input.down.use;
    if (LQ.hit('use') && t && K.cool <= 0) K.use(t.id, w);
  },
  use(id, w) {
    const p = w.p, d = DIRS[p.dir], s = st();
    if (id === 'stamp') {
      K.swing = .22; K.cool = .34; sfx('slash');
      const hx = p.x + d[0] * 13, hy = p.y - 6 + d[1] * 13;
      for (const e of w.ents.slice()) if (e.hit && Math.hypot(e.x - hx, e.y - hy) < 15) e.hit(w, d);
      const e = w.occ[Math.floor((p.x + d[0] * 11) / T) + ',' + Math.floor((p.y - 3 + d[1] * 11) / T)];
      if (e && e.stamp) e.stamp(w);
    } else if (id === 'compass') {
      K.cool = 1.2; K.pulse = 1; sfx('ok');
      let found = 0;
      for (const e of w.ents.slice()) if (e.hidden && Math.hypot(e.tx * T + 8 - p.x, e.ty * T + 8 - p.y) < (e.revealRange ?? 6) * T) { found++; e.reveal(w); }
      if (!found) ui.toast('The compass needle holds still. Nothing hidden nearby.');
    } else if (id === 'lantern') {
      K.cool = 1; ui.toast('Your lantern glows. It lights dark places, and Myth Wisps keep away from it.');
    } else if (id === 'tonic') {
      K.cool = .5;
      if (K.hp() >= K.maxHp()) return ui.toast('Your hearts are already full.');
      s.flags.tonics--; s.hp = Math.min(K.maxHp(), K.hp() + 2); sfx('learn'); w.burst(p.x, p.y - 10, '#7fd6a8', 14, 40); LQ.save();
    }
  },
  knock(w, fx, fy, dist) {
    const p = w.p, a = Math.atan2(p.y - 6 - fy, p.x - fx);
    for (let i = 0; i < dist; i++) { const nx = p.x + Math.cos(a), ny = p.y + Math.sin(a); if (w.canStand(nx, p.y)) p.x = nx; if (w.canStand(p.x, ny)) p.y = ny; }
  },
  // Lose hearts. At zero you wake outside, short a few coins. Progress is never lost.
  hurt(n, w, fx, fy) {
    if (K.inv > 0 || LQ.busy) return false;
    const s = st(), p = w.p; s.hp = Math.max(0, K.hp() - n); K.inv = 1.3; sfx('hit'); LQ.shake(.25);
    K.knock(w, fx, fy, 12); w.burst(p.x, p.y - 8, '#ff4fb0', 10, 40);
    if (s.hp <= 0) LQ.script(() => K.faint(w));
    return true;
  },
  async faint(w) {
    const s = st(), home = w.room && w.room.def.home, lost = home ? 0 : Math.min(20, s.coins);   // `home` rooms cost nothing and wake you inside
    await LQ.fadeTo(1, .5); s.coins -= lost; s.hp = K.maxHp(); K.inv = 0;
    if (home) w.loadRoom(w.room.room, 'faint');
    else if (w.room) { w.room.def.leave?.(s); w.start(); w.p.dir = s.dir = 'down'; w.music(); }
    LQ.save(); await LQ.fadeTo(0, .5);
    await LQ.say(null, 'You wake beside the Notary Lamp, patched up and steady.' + (lost ? ' The fog made off with ' + lost + ' coins.' : ''));
  },

  // Drawn on the pixel buffer, on top of the hero.
  drawHero(g, x, y, p, tm) {
    const d = DIRS[p.dir];
    if (K.swing > 0) {
      const k = 1 - K.swing / .22, hx = x + d[0] * (7 + k * 7), hy = y - 9 + d[1] * (7 + k * 7);
      R(g, hx - 3, hy - 3, 7, 7, '#ffcf4a'); R(g, hx - 2, hy - 2, 5, 5, '#fff3b0'); R(g, hx - 1, hy - 1, 3, 3, '#ff4fb0');
      R(g, hx - d[0] * 5 - 1, hy - d[1] * 5 - 1, 3, 3, '#35f0e6');
      LQ.fx.light(hx, hy, 14, '#ffcf4a', .6);
    }
    if (K.blocking) {
      const sx = x + d[0] * 9, sy = y - 9 + d[1] * 9;
      if (d[0]) { R(g, sx - 1, sy - 7, 3, 14, '#9b6bff'); R(g, sx, sy - 6, 1, 12, '#c8fbff'); } else { R(g, sx - 7, sy - 1, 14, 3, '#9b6bff'); R(g, sx - 6, sy, 12, 1, '#c8fbff'); }
      LQ.fx.light(sx, sy, 16, '#9b6bff', .5);
    }
    if (K.pulse > 0) {
      const r = (1 - K.pulse) * 96; g.fillStyle = '#35f0e6'; g.globalAlpha = K.pulse;
      for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283; g.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y - 8 + Math.sin(a) * r), 1, 1); }
      g.globalAlpha = 1;
    }
  },
  // Drawn on the full-size canvas: hearts and the tool in hand.
  drawHUD(c, hud, top) {
    const s = st(), t = K.cur(); if (!t) return;
    const max = K.maxHp(), hp = K.hp();
    const label = 'E: ' + (t.label ? t.label(s) : t.name) + (K.owned().length > 1 ? '    Q: switch' : '');
    c.font = F(24); const w = max * 30 + 34 + c.measureText(label).width;
    hud(16, top, w, 34);
    for (let i = 0; i < max; i++) {
      c.fillStyle = i < hp ? '#ff4fb0' : '#2a2550'; const x = 28 + i * 30, y = top + 7;
      c.fillRect(x, y + 3, 22, 9); c.fillRect(x + 2, y, 7, 3); c.fillRect(x + 13, y, 7, 3); c.fillRect(x + 3, y + 12, 16, 4); c.fillRect(x + 7, y + 16, 8, 3);
    }
    ui.text(c, label, 28 + max * 30 + 6, top + 4, '#c9cdea', F(24), 'left');
  },
};

// Extra lines every shop offers after its gear: a tonic, a lantern for one trip, and a rumor about a secret.
LQ.RUMORS = {};
// Granny Maple's thanks applies only at the Saffron Bazaar.
LQ.bazaarOff = () => !!st().flags.fixMaple && st().region === 'village';
LQ.shopExtras = () => {
  const s = st(), out = [], tonic = LQ.shopPrice(15), rent = LQ.shopPrice(10), rumor = LQ.shopPrice(20);
  out.push({ label: 'Tonic  -  ' + tonic, run: async who => {
    if (s.coins < tonic) return LQ.say(who, 'A tonic is ' + tonic + ' coins. You are a little short.');
    s.coins -= tonic; s.flags.tonics = (s.flags.tonics || 0) + 1; sfx('coin'); LQ.save();
    await LQ.say(who, 'One tonic. Press Q until it is in hand, then E to drink. It mends two hearts.');
  } });
  if (!K.hasLantern()) out.push({ label: 'Rent a lantern  -  ' + rent, run: async who => {
    if (s.coins < rent) return LQ.say(who, 'Lantern rental is ' + rent + ' coins. You are a little short.');
    s.coins -= rent; s.flags.lanternRent = true; sfx('coin'); LQ.save();
    await LQ.say(who, 'One lantern for the Lantern Cave. Press Q until it is in hand. The rental ends when you leave the cave or wake at the Notary Lamp.');
  } });
  const r = (LQ.RUMORS[s.region] || []).find(x => !x.done(s));
  if (r) out.push({ label: s.flags['rumor_' + r.id] ? 'Hear the rumor again' : 'Buy a rumor  -  ' + rumor, run: async who => {
    if (!s.flags['rumor_' + r.id]) {
      if (s.coins < rumor) return LQ.say(who, 'Rumors are ' + rumor + ' coins. You are a little short.');
      s.coins -= rumor; s.flags['rumor_' + r.id] = true; sfx('coin'); LQ.save();
    }
    await LQ.say(who, r.text);
  } });
  return out;
};
})();
