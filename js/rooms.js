// Rooms: small interiors with puzzle parts (crates, plates, doors, braziers, seals, bolt traps).
// A room is defined in LQ.ROOMS as rows of characters. '#' wall, '.' floor, 'S' start, 'X' exit.
// Any other character is floor plus a part, built by the room's `on` table. A room resets every time you enter.
(() => {
const LQ = window.LQ, T = 16, ui = LQ.ui;
const sfx = n => LQ.audio.sfx(n);
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
const EMPTY = { npcs: [], signs: [], chests: {}, coins: [] };
LQ.ROOMS = {};

// Wraps a room definition in the same shape as a region, so the overworld code can run it unchanged.
LQ.roomRegion = id => {
  const def = LQ.ROOMS[id];
  const reg = {
    id: 'room:' + id, room: id, def, title: def.title, sub: () => def.sub, season: 'summer', dark: !!def.dark,
    buildings: [], content: () => EMPTY, exits: [], sx: 0, sy: 0,
    zones: def.zones || {}, zone: p => def.zone ? def.zone(p) : 'room', music: () => def.music || 'mountain', auditOK: () => false,
    hud: (w, st) => def.hud ? def.hud(w, st) : '',
    build() {
      const rows = def.rows(LQ.state), H = rows.length, W = rows[0].length, m = LQ.newMap(W, H);
      m.cells = []; reg.exits = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const ch = rows[y][x];
        if (ch === '#') { m.g[y][x] = '#'; m.solid[y][x] = true; continue; }
        m.g[y][x] = def.floor || 'r';
        if (ch === 'S') { reg.sx = x * T + 8; reg.sy = y * T + 12; }
        else if (ch === 'X') reg.exits.push({ x0: x * T, x1: (x + 1) * T, y0: y * T + 6, y1: (y + 2) * T, leave: true });
        else if (ch !== '.') m.cells.push({ ch, tx: x, ty: y });
      }
      return m;
    },
    spawn(w, st) {
      for (const c of w.map.cells) { const fn = def.on && def.on[c.ch]; if (fn) fn(w, c.tx, c.ty, st); }
      w.ents.push({ type: 'logic', tx: 0, base: -9999, step: dt => { if (def.tick) def.tick(w, LQ.state, dt); } });
    },
    arrive: def.arrive,
  };
  return reg;
};

// ---- parts. Each one adds itself to the world and returns its entity.
const P = LQ.parts = {
  // A crate you push by walking into it.
  block(w, tx, ty) {
    const e = { type: 'block', tx, ty, solid: true, push: true, ox: 0, oy: 0, base: ty * T + 14,
      step(dt) { const k = 150 * dt; e.ox = Math.abs(e.ox) <= k ? 0 : e.ox - Math.sign(e.ox) * k; e.oy = Math.abs(e.oy) <= k ? 0 : e.oy - Math.sign(e.oy) * k; },
      draw(g, cx, cy) {
        const x = e.tx * T + e.ox - cx, y = e.ty * T + e.oy - cy, edge = e.locked ? '#ffcf4a' : '#9b6bff';
        w.shadow(g, x + 8, y + 16, 14);
        R(g, x + 1, y + 1, 14, 14, '#1c1d44'); R(g, x + 2, y + 2, 12, 12, '#2c2e5c');
        R(g, x + 1, y + 1, 14, 1, edge); R(g, x + 1, y + 14, 14, 1, edge); R(g, x + 1, y + 1, 1, 14, edge); R(g, x + 14, y + 1, 1, 14, edge);
        R(g, x + 7, y + 4, 2, 8, '#ffcf4a'); R(g, x + 5, y + 5, 6, 1, '#ffcf4a'); R(g, x + 5, y + 8, 6, 1, '#ffcf4a'); R(g, x + 5, y + 10, 6, 1, '#ffcf4a');
        if (e.locked) LQ.fx.light(x + 8, y + 8, 14, '#ffcf4a', .45);
      } };
    w.ents.push(e); return e;
  },
  // A floor rune. `on` is set by the room's tick.
  plate(w, tx, ty, col) {
    const e = { type: 'plate', tx, ty, on: false, col, base: ty * T - 40,
      draw(g, cx, cy, tm) {
        const x = tx * T - cx, y = ty * T - cy, c = e.on ? col : '#3a3668';
        R(g, x + 2, y + 2, 12, 12, '#15163a'); R(g, x + 3, y + 3, 10, 1, c); R(g, x + 3, y + 12, 10, 1, c); R(g, x + 3, y + 3, 1, 10, c); R(g, x + 12, y + 3, 1, 10, c);
        R(g, x + 7, y + 6, 2, 4, c);
        if (e.on) LQ.fx.light(x + 8, y + 8, 12, col, .4 + .15 * Math.sin(tm * 4));
      } };
    w.ents.push(e); return e;
  },
  // A sealed gate. Talk to read why it is shut. open() removes it for this visit.
  door(w, tx, ty, why) {
    const e = { type: 'door', tx, ty, solid: true, base: ty * T + 15,
      use: () => LQ.script(() => LQ.say(null, why)),
      open() { if (e.gone) return; e.gone = true; sfx('rumble'); LQ.shake(.4); w.burst(tx * T + 8, ty * T + 8, '#9b6bff', 20, 55); w.remove(e); },
      draw(g, cx, cy, tm) {
        const x = tx * T - cx, y = ty * T - cy;
        R(g, x, y, 16, 16, '#15163a');
        for (let i = 0; i < 4; i++) R(g, x + 2 + i * 4, y + 1, 2, 14, '#42458a');
        R(g, x, y + 3, 16, 1, '#ff4fb0'); R(g, x, y + 12, 16, 1, '#ff4fb0');
        LQ.fx.light(x + 8, y + 8, 12, '#ff4fb0', .3 + .1 * Math.sin(tm * 3));
      } };
    w.ents.push(e); return e;
  },
  // A fire bowl. Talk to light it. `lit` also punches a hole in the dark.
  brazier(w, tx, ty, col, onLight) {
    const e = { type: 'brazier', tx, ty, solid: true, lit: false, col, base: ty * T + 14,
      get glowR() { return e.lit ? 44 : 0; },
      use: () => onLight(e),
      draw(g, cx, cy, tm) {
        const x = tx * T - cx, y = ty * T - cy;
        w.shadow(g, x + 8, y + 15, 12);
        R(g, x + 6, y + 9, 4, 6, '#42458a'); R(g, x + 3, y + 6, 10, 4, '#2c2e5c'); R(g, x + 3, y + 6, 10, 1, col);
        if (e.lit) { const f = Math.floor(tm * 9) % 3; R(g, x + 5, y + 2 - f, 6, 4 + f, col); R(g, x + 7, y + 1 - f, 2, 4 + f, '#ffffff'); LQ.fx.light(x + 8, y + 4, 30, col, .6); }
      } };
    w.ents.push(e); return e;
  },
  // A wall seal. Only the Truth Stamp sets it off.
  seal(w, tx, ty, onStamp, hint) {
    const e = { type: 'seal', tx, ty, solid: true, base: ty * T + 14,
      use: () => LQ.script(() => LQ.say(null, hint)), stamp: () => onStamp(e),
      draw(g, cx, cy, tm) {
        const x = tx * T - cx, y = ty * T - cy;
        R(g, x + 3, y + 2, 10, 13, '#2c2e5c'); R(g, x + 4, y + 3, 8, 8, '#15163a');
        R(g, x + 6, y + 4, 4, 6, '#ffcf4a'); R(g, x + 5, y + 6, 6, 2, '#ffcf4a');
        LQ.fx.light(x + 8, y + 7, 10, '#ffcf4a', .3 + .15 * Math.sin(tm * 2.5));
      } };
    w.ents.push(e); return e;
  },
  // A stone tablet or anything else you only read.
  plaque(w, tx, ty, text, col = '#35f0e6') {
    const e = { type: 'plaque', tx, ty, solid: true, base: ty * T + 14,
      use: () => LQ.script(() => LQ.say(null, typeof text === 'function' ? text() : text)),
      draw(g, cx, cy) {
        const x = tx * T - cx, y = ty * T - cy;
        w.shadow(g, x + 8, y + 15, 12);
        R(g, x + 2, y + 3, 12, 12, '#15163a'); R(g, x + 3, y + 3, 10, 11, '#2c2e5c'); R(g, x + 3, y + 3, 10, 1, '#42458a');
        R(g, x + 5, y + 6, 1, 5, col); R(g, x + 8, y + 6, 1, 5, col); R(g, x + 10, y + 6, 1, 3, col); R(g, x + 6, y + 8, 2, 1, col);
        LQ.fx.light(x + 8, y + 8, 9, col, .3);
      } };
    w.ents.push(e); return e;
  },
  // A checkpoint light that stands outside a room's door. Talk to it to refill your hearts.
  lamp(w, tx, ty) {
    const e = { type: 'lamp', tx, ty, solid: true, base: ty * T + 14,
      use: () => LQ.script(async () => { const K = LQ.kit, full = K.hp() >= K.maxHp(); LQ.state.hp = K.maxHp(); if (!full) sfx('learn'); await LQ.say(null, full ? 'A Notary Lamp. If you fall inside, you wake up here.' : 'The Notary Lamp steadies you. Your hearts are full again.'); }),
      draw(g, cx, cy, tm) {
        const x = tx * T - cx, y = ty * T - cy;
        w.shadow(g, x + 8, y + 15, 8);
        R(g, x + 7, y - 2, 2, 17, '#42458a'); R(g, x + 5, y + 13, 6, 2, '#2c2e5c'); R(g, x + 5, y - 7, 6, 6, '#15163a'); R(g, x + 6, y - 6, 4, 4, '#7fd6a8'); R(g, x + 7, y - 5, 2, 2, '#ffffff');
        LQ.fx.light(x + 8, y - 4, 22, '#7fd6a8', .5 + .1 * Math.sin(tm * 2));
      } };
    w.ents.push(e); return e;
  },
  // A glowing torn page on the floor. Walk over it to take it.
  page(w, tx, ty, onTake) {
    const e = { type: 'page', tx, ty, base: ty * T + 12, pick: onTake,
      draw(g, cx, cy, tm) {
        const x = tx * T + 4 - cx, y = ty * T + 1 - cy + Math.round(Math.sin(tm * 3) * 2);
        w.shadow(g, tx * T + 8 - cx, ty * T + 14 - cy, 8);
        R(g, x, y, 8, 10, '#fdf8e7'); R(g, x + 6, y, 2, 2, '#c9cdea'); R(g, x + 1, y + 3, 5, 1, '#35f0e6'); R(g, x + 1, y + 5, 6, 1, '#35f0e6'); R(g, x + 1, y + 7, 4, 1, '#35f0e6');
        LQ.fx.light(x + 4, y + 5, 20, '#35f0e6', .6);
      } };
    w.ents.push(e); return e;
  },
  // A wall trap that spits fog bolts in one direction. Dodge between shots, or face it and hold the Standard Shield.
  spitter(w, tx, ty, dx, dy, period = 1.15) {
    const e = { type: 'spitter', tx, ty, solid: true, base: ty * T + 14, t: period * .6,
      use: () => LQ.script(() => LQ.say(null, 'A carved mouth in the rock, breathing fog. It spits a bolt every moment or so.')),
      step(dt) { e.t -= dt; if (e.t <= 0) { e.t = period; P.bolt(w, tx * T + 8 + dx * 9, ty * T + 8 + dy * 9, dx * 74, dy * 74); } },
      draw(g, cx, cy, tm) {
        const x = tx * T - cx, y = ty * T - cy, k = e.t < .25;
        R(g, x + 1, y + 1, 14, 14, '#2c2e5c'); R(g, x + 3, y + 4, 3, 3, k ? '#ff4fb0' : '#7a3a6a'); R(g, x + 10, y + 4, 3, 3, k ? '#ff4fb0' : '#7a3a6a'); R(g, x + 4, y + 10, 8, 3, '#15163a');
        if (k) LQ.fx.light(x + 8, y + 8, 12, '#ff4fb0', .5);
      } };
    w.ents.push(e); return e;
  },
  bolt(w, x, y, vx, vy) {
    const e = { type: 'bolt', x, y, tx: Math.floor(x / T), base: y + 6,
      step(dt) {
        e.x += vx * dt; e.y += vy * dt; e.tx = Math.floor(e.x / T); e.base = e.y + 6;
        if (w.isSolid(e.tx, Math.floor(e.y / T))) { w.burst(e.x, e.y, '#ff4fb0', 6, 30); return w.remove(e); }
        const p = w.p;
        if (Math.abs(p.x - e.x) < 7 && Math.abs(p.y - 7 - e.y) < 9) {
          const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[p.dir];
          if (LQ.kit.blocking && d[0] === -Math.sign(vx) && d[1] === -Math.sign(vy)) { sfx('slash'); w.burst(e.x, e.y, '#c8fbff', 10, 45); }
          else if (!LQ.kit.hurt(1, w, e.x - vx, e.y - vy)) return;
          w.remove(e);
        }
      },
      draw(g, cx, cy) { const bx = e.x - cx, by = e.y - cy; R(g, bx - 3, by - 2, 6, 4, '#ff4fb0'); R(g, bx - 1, by - 1, 2, 2, '#ffffff'); LQ.fx.light(bx, by, 12, '#ff4fb0', .6); } };
    w.ents.push(e); return e;
  },
};

LQ.rooms = {
  // Walking into a crate for a moment pushes it one tile, if the tile beyond is free.
  tryPush(w, dx, dy, dt) {
    if (!w.room || (dx !== 0) === (dy !== 0)) { w.pushT = 0; return; }
    const p = w.p, e = w.occ[Math.floor((p.x + dx * 10) / T) + ',' + Math.floor((p.y - 3 + dy * 10) / T)];
    if (!e || !e.push) { w.pushT = 0; return; }
    w.pushT = (w.pushT || 0) + dt; if (w.pushT < .2) return;
    w.pushT = 0;
    const nx = e.tx + dx, ny = e.ty + dy;
    if (w.isSolid(nx, ny) || w.ents.some(f => f.foe && Math.floor(f.x / T) === nx && Math.floor(f.y / T) === ny)) return;
    e.ox = -dx * T; e.oy = -dy * T; e.tx = nx; e.ty = ny; e.base = ny * T + 14; w.refresh(); sfx('move');
  },
  // Dark rooms: everything is black except around the hero and anything with a glow radius.
  darkness(g, w, cx, cy) {
    const dk = this.dk || (this.dk = LQ.mk(LQ.BW, LQ.BH)), d = dk.getContext('2d'), p = w.p;
    d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, LQ.BW, LQ.BH); d.fillStyle = 'rgba(3,2,14,.95)'; d.fillRect(0, 0, LQ.BW, LQ.BH);
    d.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r) => { const s = LQ.glow('#ffffff', r); for (let i = 0; i < 4; i++) d.drawImage(s, Math.round(x - r), Math.round(y - r)); };
    hole(p.x - cx, p.y - 10 - cy, LQ.kit.holding('lantern') ? 60 : 30);
    for (const e of w.ents) if (e.glowR) hole((e.x != null ? e.x : e.tx * T + 8) - cx, (e.y != null ? e.y : e.ty * T + 6) - cy, e.glowR);
    g.drawImage(dk, 0, 0);
  },
};
})();
