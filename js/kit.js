// Field Kit: the Use key, tools, hearts, and their HUD. See GAME_DESIGN_PLAN.md.
(() => {
const LQ = window.LQ, T = 16, ui = LQ.ui, F = LQ.F;
const st = () => LQ.state, sfx = n => LQ.audio.sfx(n);
const csv = k => (LQ.state.flags[k] || '').split(',').filter(Boolean);
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
    if (s.flags.tonics) items.push({ name: 'Tonic x' + s.flags.tonics, desc: 'Restores up to two hearts, anywhere. Equip it in the Field Kit (K), then press E to drink. A full heart meter leaves the tonic untouched.' });
    if (s.flags.lanternRent) items.push({ name: 'Rented Lantern', desc: 'Lights dark rooms and repels Myth Wisps while held. Equip it in the Field Kit (K). Your rental ends when you leave the Lantern Cave or faint inside it.' });
    return items;
  },
  // Up to three tools ride in hand. The rest wait in the Field Kit page (J, then the Kit tab, or K).
  // `kitEq` is the in-hand list and `kitSeen` is every tool already sorted once, both kept in flags so old saves load.
  sync() {
    const s = st(), own = K.owned().map(t => t.id), first = s.flags.kitEq == null;
    const eq = csv('kitEq').filter((id, i, all) => own.includes(id) && all.indexOf(id) === i).slice(0, 3), seen = csv('kitSeen').filter(id => own.includes(id));
    for (const id of own) if (!seen.includes(id)) {
      seen.push(id);
      if (eq.length < 3) eq.push(id);
      else if (!first) ui.toast(LQ.TOOLS.find(t => t.id === id).name + ' went into your Field Kit. Press K to put it in hand.');
    }
    const a = eq.join(','), b = seen.join(',');
    if (s.flags.kitEq !== a) s.flags.kitEq = a;
    if (s.flags.kitSeen !== b) s.flags.kitSeen = b;
    return eq;
  },
  equipped() { const eq = K.sync(); return eq.map(id => LQ.TOOLS.find(t => t.id === id)); },
  // Put a stored tool in hand. With three already in hand, the one not being held goes back in the kit.
  need(id, quiet) {
    const s = st(), eq = K.sync();
    if (!K.owned().some(t => t.id === id)) return false;
    if (!eq.includes(id)) {
      let out = null;
      if (eq.length >= 3) { const i = eq[eq.length - 1] !== s.tool ? eq.length - 1 : eq.length - 2; out = eq[i]; eq[i] = id; } else eq.push(id);
      s.flags.kitEq = eq.join(',');
      if (!quiet) ui.toast(LQ.TOOLS.find(t => t.id === id).name + ' is in hand.' + (out ? ' ' + LQ.TOOLS.find(t => t.id === out).name + ' went back in the kit.' : ''));
    }
    s.tool = id; return true;
  },
  cur() {
    const s = st(); let o = K.equipped();
    if (s.tool && !o.some(t => t.id === s.tool) && K.owned().some(t => t.id === s.tool)) { K.need(s.tool, true); o = K.equipped(); }
    return o.find(t => t.id === s.tool) || o[0] || null;
  },
  finderOn: id => !st().flags['off_' + id],
  holding: id => { const t = K.cur(); return !!t && t.id === id; },
  hasLantern: () => LQ.TOOLS[3].have(st()),
  cycle() { const o = K.equipped(); if (o.length < 2) return; st().tool = o[(o.indexOf(K.cur()) + 1) % o.length].id; sfx('move'); },
  speed: () => K.blocking ? .45 : 1,
  // One heart on the full-size canvas, filled from the left by `fill` (0 to 1), so quarter hearts show. `u` is the pixel unit.
  heart(c, x, y, fill, u = 3) {
    const shape = col => { c.fillStyle = col; c.fillRect(x, y + u, 7 * u, 3 * u); c.fillRect(x + u, y, 2 * u, u); c.fillRect(x + 4 * u, y, 2 * u, u); c.fillRect(x + u, y + 4 * u, 5 * u, u); c.fillRect(x + 2 * u, y + 5 * u, 3 * u, u); };
    shape('#2a2550');
    if (fill <= 0) return;
    if (fill >= 1) return shape('#ff4fb0');
    c.save(); c.beginPath(); c.rect(x, y, Math.round(7 * u * fill), 6 * u); c.clip(); shape('#ff4fb0'); c.restore();
  },
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
    const label = 'E: ' + (t.label ? t.label(s) : t.name) + (K.equipped().length > 1 ? '   Q: swap' : '') + '   K: kit';
    c.font = F(22); const w = max * 21 + 30 + c.measureText(label).width;
    hud(16, top, w, 28);
    for (let i = 0; i < max; i++) K.heart(c, 27 + i * 21, top + 8, LQ.clamp(hp - i, 0, 1), 2);
    ui.text(c, label, 30 + max * 21, top + 2, '#c9cdea', F(22), 'left');
  },
};

// ---------- the Field Kit page (the Kit tab of the menu). See, equip, swap, and store tools, and switch finders on or off.
const INFO = {
  stamp: { does: 'E swings the stamp. It strikes Scrap Imps and presses seals and strongboxes.' },
  shield: { does: 'Hold E to block. It stops fog bolts, and in boss fights it stops myth bolts and dragon fire. You walk slower while blocking.' },
  compass: { does: 'E sends out a pulse that reveals hidden paths and false walls nearby.' },
  lantern: { does: 'While in hand it lights dark rooms and Myth Wisps keep away.',
    up: () => 'Rented (one trip)  >  Old Lantern (yours to keep)  >  Charity Lantern (yours, and it counts as a gift on your return). You have: ' + (LQ.has('charity') ? 'Charity Lantern.' : st().flags.lanternFound ? 'Old Lantern.' : 'a rental.') },
  tonic: { does: 'E drinks one. It mends two hearts anywhere, even far from a shop.', up: () => 'Shops sell more. A Hot meal at a shop fills every heart for less.' },
};
const P = K.page = {
  rows() {
    const eq = K.sync(), out = K.owned().map(t => ({ kind: 'tool', id: t.id, name: t.label ? t.label(st()) : t.name, slot: eq.indexOf(t.id), t }));
    for (const g of LQ.GEAR) if (g.status && LQ.has(g.id)) out.push({ kind: 'finder', id: g.id, name: g.name, on: K.finderOn(g.id), g });
    out.push({ kind: 'info', id: 'hearts', name: 'Hearts  ' + K.hp() + ' / ' + K.maxHp() });
    return out;
  },
  press(m) {
    const s = st(), r = P.rows()[m.sel]; if (!r) return;
    if (r.kind === 'finder') { if (r.on) s.flags['off_' + r.id] = true; else delete s.flags['off_' + r.id]; sfx('ok'); LQ.save(); return; }
    if (r.kind !== 'tool') return;
    const eq = K.sync();
    if (m.swap) {   // choosing which in-hand tool makes room
      if (r.slot < 0) { m.swap = r.id === m.swap ? null : r.id; sfx('move'); return; }
      eq[r.slot] = m.swap; s.flags.kitEq = eq.join(','); s.tool = m.swap; m.swap = null; sfx('ok'); LQ.save(); return;
    }
    if (r.slot >= 0) {
      if (eq.length < 2) { sfx('wrong'); m.note = 'Keep at least one tool in hand.'; return; }
      eq.splice(r.slot, 1); s.flags.kitEq = eq.join(','); if (s.tool === r.id) s.tool = eq[0]; sfx('move'); m.note = r.t.name + ' is stored. It is safe here until you want it.';
    } else if (eq.length < 3) { eq.push(r.id); s.flags.kitEq = eq.join(','); s.tool = r.id; sfx('ok'); m.note = r.t.name + ' is in hand.'; }
    else { m.swap = r.id; sfx('move'); m.note = ''; }
    LQ.save();
  },
  draw(c, m, x, y, h) {
    const rows = P.rows(), eq = K.equipped(), cur = K.cur(), sel = rows[Math.min(m.sel, rows.length - 1)];
    ui.text(c, 'IN HAND   Q: switch   E: use', x, y, '#35f0e6', F(10, true));
    for (let i = 0; i < 3; i++) {
      const t = eq[i], bx = x + i * 126, by = y + 20, active = t && t === cur;
      c.fillStyle = '#12143a'; c.fillRect(bx, by, 118, 40); c.fillStyle = active ? '#ffcf4a' : t ? '#35f0e6' : '#3a3668'; c.fillRect(bx, by, 118, 2); c.fillRect(bx, by + 38, 118, 2);
      ui.text(c, t ? (t.label ? t.label(st()) : t.name) : 'empty', bx + 59, by + 9, t ? (active ? '#ffe98a' : '#eef4ff') : '#6d7299', F(20), 'center', 108);
    }
    ui.text(c, m.swap ? 'Three in hand. Pick the one to store (Enter), or Esc.' : 'ALL TOOLS', x, y + 72, m.swap ? '#ffcf4a' : '#35f0e6', m.swap ? F(20) : F(10, true), 'left', 372);
    rows.forEach((r, i) => {
      const yy = y + 96 + i * 26, on = i === m.sel;
      if (on) { c.fillStyle = 'rgba(53,240,230,.15)'; c.fillRect(x - 6, yy - 1, 380, 26); }
      const tag = r.kind === 'tool' ? (r.slot >= 0 ? 'hand ' + (r.slot + 1) : r.id === m.swap ? 'moving' : 'stored') : r.kind === 'finder' ? (r.on ? 'hints on' : 'hints off') : '';
      ui.text(c, r.name, x, yy, on ? '#a8fff6' : '#c9cdea', F(24), 'left', 250);
      ui.text(c, tag, x + 368, yy + 2, r.slot >= 0 || r.on ? '#7fd6a8' : '#9298bc', F(20), 'right', 110);
    });
    if (!sel) return;
    const px = x + 400, pw = 364; let py = y;
    const block = (head, text, col = '#eef4ff') => {
      if (!text) return;
      if (head) { ui.text(c, head, px, py, '#35f0e6', F(10, true)); py += 18; }
      c.font = F(21); c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = col;
      for (const l of ui.wrap(c, text, pw)) { c.fillText(l, px, py); py += 22; }
      py += 10;
    };
    ui.text(c, sel.name, px, py, '#ffe98a', F(26), 'left', pw); py += 36;
    if (sel.kind === 'tool') {
      const info = INFO[sel.id] || {};
      block('WHAT IT DOES', info.does);
      block('UPGRADES', info.up ? info.up() : 'None. This tool is already at full strength.');
      block('IF YOU EVER LACK IT', sel.t.free ? sel.t.free + '. Required tools always have a route that costs no coins.' : 'Shops sell it, and Cook Basil sells it cheaper once his stall reopens.');
      block('', sel.slot >= 0 ? 'Enter: store it' : 'Enter: put it in hand', '#a8fff6');
    } else if (sel.kind === 'finder') {
      block('WHAT IT DOES', sel.g.desc);
      block('RIGHT NOW', sel.on ? sel.g.status() : 'Stored. No hints will show until you switch it back on.');
      block('', sel.on ? 'Enter: turn hints off and store it' : 'Enter: take it out and turn hints on', '#a8fff6');
    } else {
      block('HOW HEARTS WORK', 'Boss hits cost a quarter heart and a wrong answer costs half. What is left follows you back into the world.');
      block('UPGRADES', st().flags.heartUp ? 'You hold the Notary\'s Seal: five hearts.' : 'The Notary\'s Seal in the Lantern Cave adds a fifth heart.');
      block('HEALING', 'Free: Notary Lamps, your bed, and a rest at any shop when you are below two hearts. Paid: a Hot meal (all hearts) or a Tonic (two hearts, carried with you).');
    }
    if (m.note) ui.text(c, m.note, x, y + h - 10, '#ffcf4a', F(20), 'left', 380);
  },
};

// Extra lines every shop offers after its gear: a tonic, a lantern for one trip, and a rumor about a secret.
LQ.RUMORS = {};
// Granny Maple's thanks applies only at the Saffron Bazaar.
LQ.bazaarOff = () => !!st().flags.fixMaple && st().region === 'village';
LQ.shopExtras = () => {
  const s = st(), out = [], tonic = LQ.shopPrice(15), rent = LQ.shopPrice(10), rumor = LQ.shopPrice(20);
  // Two ways to mend hearts on the spot: a paid meal fills them all, and a free rest brings you back to two.
  // The free rest is the fallback, so an empty purse never leaves anyone stuck.
  const meal = LQ.shopPrice(8);
  if (K.hp() < K.maxHp()) {
    out.push({ label: 'Hot meal  -  ' + meal + '  (fills every heart)', run: async who => {
      if (s.coins < meal) return LQ.say(who, 'A hot meal is ' + meal + ' coins. You are a little short. Sit and rest instead. That one is free.');
      s.coins -= meal; s.hp = K.maxHp(); sfx('learn'); LQ.save();
      await LQ.say(who, 'One hot meal. Every heart is full again. That is ' + meal + ' coins spent, and worth it.');
    } });
    if (K.hp() < 2) out.push({ label: 'Sit and rest  -  free  (back to two hearts)', run: async who => {
      s.hp = Math.min(K.maxHp(), 2); sfx('ok'); LQ.save();
      await LQ.say(who, 'Take the bench as long as you like. No charge. You are back to two hearts.');
    } });
  }
  out.push({ label: 'Tonic  -  ' + tonic + '  (restore up to two hearts)', run: async who => {
    if (s.coins < tonic) return LQ.say(who, 'A tonic is ' + tonic + ' coins. You are a little short.');
    s.coins -= tonic; s.flags.tonics = (s.flags.tonics || 0) + 1; sfx('coin'); LQ.save();
    await LQ.say(who, 'One tonic. Equip it in the Field Kit (K), then press E to drink. It mends two hearts.');
  } });
  if (!K.hasLantern()) out.push({ label: 'Rent a lantern  -  ' + rent + '  (light and wisp protection for one cave trip)', run: async who => {
    if (s.coins < rent) return LQ.say(who, 'Lantern rental is ' + rent + ' coins. You are a little short.');
    s.coins -= rent; s.flags.lanternRent = true; sfx('coin'); LQ.save();
    await LQ.say(who, 'One lantern for the Lantern Cave. Equip it in the Field Kit (K) and hold it for light. The rental ends when you leave the cave or wake at the Notary Lamp.');
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
