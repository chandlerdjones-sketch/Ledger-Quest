// The overworld: regions, map building, movement, collisions, drawing, HUD.
(() => {
const LQ = window.LQ, T = 16, ui = LQ.ui, F = LQ.F;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
LQ.REGIONS = {};

LQ.finderStatus = (region, w) => {
  const { finder } = region, st = LQ.state;
  if (!finder.ready(st)) return { hint: finder.unlock };
  const hunt = region.content().hunt;
  const left = hunt.filter(id => !st.rcpt[id]);
  const count = finder.label + ' ' + (hunt.length - left.length) + '/' + hunt.length;
  if (!left.length) return { count, hint: finder.complete };
  if (w.R !== region) return { count, hint: 'Return to ' + finder.place + ' for directions.' };

  let nearest;
  for (const e of w.ents) {
    const id = e.rid || (e.type === 'chest' && finder.chests?.[e.id]);
    if (!left.includes(id)) continue;
    const dx = (e.tx * T + 8 - w.p.x) / T, dy = (e.ty * T + 10 - w.p.y) / T;
    const distance = Math.hypot(dx, dy);
    if (!nearest || distance < nearest.distance) nearest = { id, dx, dy, distance };
  }
  if (!nearest) return { count, hint: 'No target nearby.' };
  const { id, dx, dy, distance } = nearest, axis = Math.max(Math.abs(dx), Math.abs(dy));
  const dir = (Math.abs(dy) >= axis * .4 ? (dy < 0 ? 'N' : 'S') : '') +
    (Math.abs(dx) >= axis * .4 ? (dx < 0 ? 'W' : 'E') : '');
  const tiles = Math.max(1, Math.round(distance));
  const where = axis < .5 ? 'underfoot' : tiles + (tiles === 1 ? ' tile ' : ' tiles ') + dir;
  return { count, hint: finder.records[id].name + ' · ' + where };
};

// A blank map plus the helpers every region uses to lay itself out.
LQ.newMap = (W, H) => {
  const m = { W, H, g: [], solid: [], keep: [], trees: [] };
  for (let y = 0; y < H; y++) { m.g.push(new Array(W).fill('g')); m.solid.push(new Array(W).fill(false)); m.keep.push(new Array(W).fill(false)); }
  m.rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m.g[y][x] = c; };
  m.block = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m.solid[y][x] = true; };
  m.mark = (x, y, r = 1) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const yy = y + j, xx = x + i; if (yy >= 0 && xx >= 0 && yy < H && xx < W) m.keep[yy][xx] = true; } };
  // keep clear anything near roads, buildings, and points of interest
  m.keepClear = (C, open) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!open[m.g[y][x]] || (m.solid[y][x] && m.g[y][x] !== 'w')) m.mark(x, y);
    C.npcs.forEach(n => m.mark(n.tx, n.ty)); C.coins.forEach(c => m.mark(c[0], c[1], 0)); C.signs.forEach(s => m.mark(s.tx, s.ty));
    Object.values(C.chests).forEach(c => m.mark(c.tx, c.ty));
  };
  return m;
};

// ---------- Paystub Village and Bracket Mountain
const MOUNTAIN = [
  '####################',
  '#######ssBsss#######',
  '#####sssssssssss####',
  '####sss######sssp###',
  '###...p#######...###',
  '###....########..###',
  '####....p#####..####',
  '#####.....##p...####',
  '######..........####',
  '#########GG#########'];
const VILLAGE_BUILDINGS = [
  { id: 'quill', x: 7, y: 21, roof: '#b5503c', icon: 'quill' },
  { id: 'post', x: 36, y: 21, roof: '#3f6fb8', icon: 'mail' },
  { id: 'guild', x: 13, y: 18, roof: '#8a3f8f', icon: 'banner', wall: '#e9dcc8' },
  { id: 'armory', x: 30, y: 18, roof: '#5d6478', icon: 'shield', wall: '#d9d2c2' },
  { id: 'hall', x: 29, y: 31, roof: '#2f8a6a', icon: 'scroll' },
  { id: 'cottage', x: 14, y: 31, roof: '#c98a3c', icon: 'home' },
];
function buildVillage() {
  const W = 48, H = 42, m = LQ.newMap(W, H), g = m.g, solid = m.solid, rect = m.rect;
  // river and bridge
  for (let x = 0; x < W; x++) { const off = (x >= 19 && x <= 28) ? 0 : Math.round(Math.sin(x / 4)); g[14 + off][x] = 'w'; g[15 + off][x] = 'w'; }
  rect(23, 14, 24, 15, 'b');
  // roads and plaza
  rect(23, 12, 24, 13, 'p'); rect(23, 16, 24, 41, 'p'); rect(6, 26, 41, 27, 'p');
  rect(9, 24, 10, 25, 'p'); rect(15, 21, 16, 25, 'p'); rect(32, 21, 33, 25, 'p'); rect(37, 24, 38, 25, 'p');
  rect(25, 35, 32, 35, 'p'); g[34][31] = 'p'; rect(16, 35, 22, 35, 'p'); g[34][16] = 'p';
  rect(19, 23, 28, 30, 'q');
  for (let y = 22; y <= 31; y++) for (let x = 18; x <= 29; x++) if (g[y][x] === 'g') g[y][x] = 'f';
  // mountain
  MOUNTAIN.forEach((row, j) => { for (let i = 0; i < row.length; i++) {
    const ch = row[i], x = 14 + i, y = 2 + j;
    if (ch === '#') { g[y][x] = '#'; solid[y][x] = true; }
    else if (ch === 's' || ch === 'B') g[y][x] = 's';
    else if (ch === 'p') { g[y][x] = 'r'; m.trees.push({ x, y, kind: 'pine' }); solid[y][x] = true; }
    else g[y][x] = 'r';
  } });
  // buildings, stall, fountain
  for (const b of VILLAGE_BUILDINGS) m.block(b.x, b.y, b.x + 4, b.y + 2);
  solid[23][13] = solid[23][14] = true; m.block(23, 26, 24, 27);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === 'w') solid[y][x] = true;
  m.keepClear(LQ.CH1, { g: 1, f: 1, w: 1 }); m.mark(24, 37, 2);
  if (LQ.V1) LQ.V1.carve(m);
  // trees: border, northern forest, scattered
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x] !== 'g' || solid[y][x] || m.keep[y][x]) continue;
    const border = x < 2 || y < 2 || x >= W - 2 || y >= H - 2, north = y < 12;
    const p = border ? 1 : north ? .8 : y < 14 ? .22 : .1;
    if (LQ.hash(x, y, 11) < p) { m.trees.push({ x, y, kind: north || LQ.hash(x, y, 12) < .25 ? 'pine' : 'oak' }); solid[y][x] = true; }
    else if (LQ.hash(x, y, 13) < .05) g[y][x] = 'f';
  }
  return m;
}
LQ.REGIONS.village = {
  id: 'village', title: 'PAYSTUB VILLAGE', sub: () => 'Chapter 1', build: buildVillage, buildings: VILLAGE_BUILDINGS, content: () => LQ.CH1,
  zones: { village: ['PAYSTUB VILLAGE', 'Where every coin has a story'], mountain: ['BRACKET MOUNTAIN', 'Seven ledges, seven rates'] },
  zone: p => p.y < 12 * T ? 'mountain' : 'village',
  music: (w, st) => w.p.y < 12 * T && !st.flags.bossDown ? 'mountain' : w.season === 'winter' ? 'winter' : 'village',
  auditOK: (st, zone) => st.quest >= 2 && zone === 'village',
  fallbackTarget: st => st.quest >= 9 ? 'southroad' : null,
  exits: [{ x0: 23 * T, x1: 25 * T, y0: 41 * T + 8, y1: 43 * T, to: 'coast', px: 24 * T, py: 2 * T + 8, dir: 'down', open: st => st.quest >= 9 }],
  spawn(w, st) {
    const say = t => () => LQ.script(() => LQ.say(null, t));
    w.ents.push({ type: 'prop', tx: 13, base: 24 * T - 1, draw: (g, cx, cy) => g.drawImage(LQ.prop('stall', w.season), 13 * T - 1 - cx, 24 * T - 31 - cy) });
    w.ents.push({ type: 'prop', tx: 23, base: 28 * T - 1, draw: (g, cx, cy, tm) => g.drawImage(LQ.prop('fountain', w.season, Math.floor(tm * 4) % 2), 23 * T - 1 - cx, 28 * T - 35 - cy) });
    if (st.quest < 7) w.ents.push({ type: 'gate', tx: 23, ty: 11, tx2: 24, base: 12 * T - 1, solid: true,
      use: say('Heavy boulders block the mountain path. A purple fog seeps between them.'), draw: (g, cx, cy) => g.drawImage(LQ.prop('boulders'), 23 * T - 2 - cx, 11 * T - 5 - cy) });
    if (!st.flags.bossDown) w.ents.push({ type: 'boss', qid: 'boss', tx: 23, ty: 3, tx2: 24, base: 4 * T - 1, solid: true, use: () => LQ.script(() => LQ.startBattle('baron')),
      draw: (g, cx, cy, tm) => { w.shadow(g, 24 * T - cx, 4 * T - cy, 30); g.drawImage(LQ.bossSprite(Math.floor(tm * 3) % 2), 24 * T - 24 - cx, 4 * T - 52 - cy + Math.round(Math.sin(tm * 2) * 2), 48, 48);
        if (w.questTarget() === 'boss') g.drawImage(LQ.prop('mark'), 24 * T - 3 - cx, 4 * T - 66 - cy + Math.round(Math.sin(tm * 6) * 2)); } });
    if (st.quest < 9) w.ents.push({ type: 'roadblock', tx: 23, ty: 39, tx2: 24, base: 40 * T - 1, solid: true,
      use: say('The South Road to Shelter Coast is closed. The guards will open it once your return is filed.'), draw: (g, cx, cy) => g.drawImage(LQ.prop('barricade'), 23 * T - 2 - cx, 39 * T - 4 - cy) });
    w.ents.push({ type: 'marker', qid: 'southroad', tx: 23, ty: 41, base: -999 });
  },
  overlay(g, w, st) {
    if (st.flags.bossDown) return;
    const f = LQ.clamp((13.5 * T - w.p.y) / (8 * T), 0, 1) * (st.flags.page1 ? .55 : 1), tm = LQ.time; if (f <= 0) return;
    g.fillStyle = `rgba(110,60,160,${f * .3})`; g.fillRect(0, 0, LQ.BW, LQ.BH);
    for (let i = 0; i < 7; i++) { g.fillStyle = `rgba(190,150,235,${f * .13})`; const fx = (LQ.hash(i, 5, 40) * 420 + tm * (6 + i * 2)) % 420 - 60, fy = LQ.hash(i, 6, 40) * LQ.BH; g.fillRect(fx, fy, 70, 9); g.fillRect(fx + 12, fy - 5, 44, 19); }
  },
};

const world = LQ.world = {
  maps: {}, grounds: {}, map: null, ground: null, R: null, C: null, ents: [], occ: {}, parts: [], cam: { x: 0, y: 0 }, zone: '',
  p: { x: 0, y: 0, dir: 'up', frame: 0, anim: 0, moving: false, dust: 0 }, hintT: 0, agent: null,

  setSeason(s) {
    const R = this.R || LQ.REGIONS[LQ.state.region] || LQ.REGIONS.village, se = R.season || s, k = R.id + '|' + se;
    if (!this.map) return;
    if (!this.grounds[k]) this.grounds[k] = LQ.bakeGround(this.map, se, R.id);
    this.ground = this.grounds[k]; this.season = se;
  },
  // With no argument this loads the saved region. A room (see rooms.js) is a temporary interior on top of it.
  start(room) {
    const st = LQ.state, R = this.R = room || LQ.REGIONS[st.region] || LQ.REGIONS.village, C = this.C = R.content();
    this.room = room || null;
    if (!this.maps[R.id]) this.maps[R.id] = R.build();
    const m = this.map = this.maps[R.id];
    if (LQ.ensureMarket) LQ.ensureMarket();
    this.setSeason(st.season);
    Object.assign(this.p, room ? { x: room.sx, y: room.sy, dir: 'up' } : { x: st.px, y: st.py, dir: st.dir || 'up' });
    this.ents = [];
    m.trees.forEach(t => this.ents.push({ type: 'tree', tx: t.x, ty: t.y, kind: t.kind, base: (t.y + 1) * T - 2 }));
    R.buildings.forEach(b => this.ents.push({ type: 'building', b, base: (b.y + 3) * T - 1 }));
    C.npcs.forEach(n => this.ents.push({ type: 'npc', npc: n, tx: n.tx, ty: n.ty, dir: n.dir, base: n.ty * T + 14, solid: true }));
    C.signs.forEach(s => this.ents.push({ type: 'sign', sign: s, tx: s.tx, ty: s.ty, base: s.ty * T + 15, solid: true }));
    Object.keys(C.chests).forEach(id => this.ents.push({ type: 'chest', id, tx: C.chests[id].tx, ty: C.chests[id].ty, base: C.chests[id].ty * T + 14, solid: true }));
    C.coins.forEach((c, i) => { const key = R.id === 'village' ? i : R.id + i; if (!st.coinsGot[key]) this.ents.push({ type: 'coin', i, key, tx: c[0], ty: c[1], base: c[1] * T + 12 }); });
    R.spawn(this, st);
    this.refresh();
    this.cam.x = LQ.clamp(this.p.x - LQ.BW / 2, 0, m.W * T - LQ.BW); this.cam.y = LQ.clamp(this.p.y - LQ.BH / 2 - 8, 0, m.H * T - LQ.BH);
    this.zone = ''; this.hintT = 0; this.agent = null;
  },
  enter() { this.music(); },
  music() { LQ.audio.play(this.R.music(this, LQ.state)); },
  refresh() { this.occ = {}; for (const e of this.ents) if (e.solid) { this.occ[e.tx + ',' + e.ty] = e; if (e.tx2 != null) this.occ[e.tx2 + ',' + e.ty] = e; } },
  remove(e) { this.ents = this.ents.filter(x => x !== e); this.refresh(); },
  isSolid(tx, ty) { return tx < 0 || ty < 0 || tx >= this.map.W || ty >= this.map.H || this.map.solid[ty][tx] || !!this.occ[tx + ',' + ty]; },
  canStand(x, y) {
    for (const [ox, oy] of [[-4, -6], [4, -6], [-4, -1], [4, -1]]) if (this.isSolid(Math.floor((x + ox) / T), Math.floor((y + oy) / T))) return false;
    return true;
  },
  burst(x, y, col, n = 10, sp = 40) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = sp * (.4 + Math.random()); this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, t: .5 + Math.random() * .4, col }); } },
  shadow(g, x, y, w) { g.fillStyle = 'rgba(4,3,16,.45)'; g.fillRect(x - w / 2, y - 2, w, 3); g.fillRect(x - w / 2 + 1, y - 3, w - 2, 5); },
  // Clear away a barrier entity (boulders, roadblock, tide) with a rumble.
  async clear(type, col, line) {
    const e = this.ents.find(x => x.type === type); if (!e) return;
    LQ.audio.sfx('rumble'); LQ.shake(0.7); this.burst((e.tx + 1) * T, e.ty * T + 8, col, 26, 60);
    await LQ.wait(0.7); this.remove(e);
    if (line) await LQ.say(null, line);
  },
  openGate() { return this.clear('gate', '#a3a0b0', 'The Bracket Compass hums. The boulders blocking the mountain path crumble away.'); },
  questTarget() { const q = LQ.curQuest(); return q ? q.target : null; },
  async travel(x) {
    const st = LQ.state;
    await LQ.fadeTo(1, 0.4);
    st.region = x.to; st.px = x.px; st.py = x.py; st.dir = x.dir;
    this.start(); this.music();
    await LQ.fadeTo(0, 0.5);
    ui.showBanner(this.R.title, this.R.sub());
    if (this.R.arrive) await this.R.arrive();
  },
  // The save keeps the spot outside the door, so quitting inside a room is always safe.
  async enterRoom(id) {
    const room = LQ.roomRegion(id);
    delete this.maps[room.id]; delete this.grounds[room.id + '|summer'];
    await LQ.fadeTo(1, 0.3);
    this.start(room); this.music();
    await LQ.fadeTo(0, 0.4);
    ui.showBanner(room.title, room.sub());
    if (room.arrive) await room.arrive(this);
  },
  async exitRoom() {
    await LQ.fadeTo(1, 0.3);
    this.start(); this.p.dir = LQ.state.dir = 'down'; this.music();
    await LQ.fadeTo(0, 0.4);
  },

  update(dt) {
    const p = this.p, st = LQ.state, inp = LQ.input.down, R = this.R;
    for (const pt of this.parts) { pt.t -= dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 90 * dt; }
    this.parts = this.parts.filter(pt => pt.t > 0);
    if (LQ.busy || ui.menu) { p.moving = false; p.frame = 0; return this.follow(dt); }
    if (LQ.hit('menu')) { ui.openMenu(); return; }
    if (LQ.kit) LQ.kit.update(dt, this);
    for (const e of this.ents.slice()) if (e.step) e.step(dt, this);
    if (LQ.busy) { p.moving = false; p.frame = 0; return this.follow(dt); }
    let dx = (inp.right ? 1 : 0) - (inp.left ? 1 : 0), dy = (inp.down ? 1 : 0) - (inp.up ? 1 : 0);
    p.moving = !!(dx || dy);
    if (p.moving) {
      this.hintT += dt;
      if (dx) p.dir = dx < 0 ? 'left' : 'right'; else p.dir = dy < 0 ? 'up' : 'down';
      const sp = 78 * dt * (dx && dy ? .7071 : 1) * (LQ.kit ? LQ.kit.speed() : 1);
      const oldX = p.x, oldY = p.y;
      if (dx && this.canStand(p.x + dx * sp, p.y)) p.x += dx * sp;
      if (dy && this.canStand(p.x, p.y + dy * sp)) p.y += dy * sp;
      p.anim += dt * 9; p.frame = Math.floor(p.anim) % 4;
      p.dust -= dt; if (p.dust <= 0) { p.dust = .22; this.parts.push({ x: p.x, y: p.y, vx: 0, vy: -8, t: .3, col: this.season === 'winter' ? '#eaf4ff' : '#8ff4ff' }); }
      if (LQ.rooms) LQ.rooms.tryPush(this, dx, dy, dt);
      if (!this.room) { st.px = p.x; st.py = p.y; st.dir = p.dir; }
      for (const x of R.exits || []) if (p.x >= x.x0 && p.x < x.x1 && p.y >= x.y0 && p.y < x.y1 && (!x.open || x.open(st))) { p.moving = false; p.frame = 0; LQ.script(() => x.leave ? this.exitRoom() : this.travel(x)); return; }
      if (R.auditOK(st, this.zone)) {
        st.auditDist = (st.auditDist || 0) + Math.hypot(p.x - oldX, p.y - oldY);
        if (st.auditDist > (st.auditNext || 2200)) { st.auditDist = 0; st.auditNext = 2200 + Math.random() * 2000; if (LQ.auditPool().length >= 3) { p.moving = false; p.frame = 0; LQ.script(LQ.audit); return; } }
      }
    } else { p.frame = 0; p.anim = 0; }
    // things you pick up by walking over them
    for (const e of this.ents) if ((e.type === 'coin' || e.pick) && Math.abs(e.tx * T + 8 - p.x) < 9 && Math.abs(e.ty * T + 10 - p.y) < 10) {
      if (e.type === 'coin') { st.coinsGot[e.key] = true; st.coins++; LQ.audio.sfx('coin'); this.burst(e.tx * T + 8, e.ty * T + 6, '#f3c531', 8, 30); this.remove(e); LQ.save(); }
      else {
        this.burst(e.tx * T + 8, e.ty * T + 6, '#fff3b0', 14, 40);
        this.remove(e); p.moving = false; p.frame = 0;
        LQ.hit('ok'); // This frame belongs to the pickup, even if Talk was also pressed.
        LQ.script(() => e.pick(e));
        return this.follow(dt);
      }
      break;
    }
    // zones
    const zone = R.zone(p);
    if (zone !== this.zone) {
      if (this.zone && R.zones[zone]) ui.showBanner(R.zones[zone][0], R.zones[zone][1]);
      this.zone = zone; this.music();
    }
    if (LQ.hit('ok')) this.interact();
    this.follow(dt);
  },
  follow(dt) {
    const m = this.map, tx = LQ.clamp(this.p.x - LQ.BW / 2, 0, m.W * T - LQ.BW), ty = LQ.clamp(this.p.y - LQ.BH / 2 - 8, 0, m.H * T - LQ.BH), k = 1 - Math.exp(-9 * dt);
    this.cam.x += (tx - this.cam.x) * k; this.cam.y += (ty - this.cam.y) * k;
  },
  interact() {
    const p = this.p, d = DIRS[p.dir];
    const e = this.occ[Math.floor((p.x + d[0] * 11) / T) + ',' + Math.floor((p.y - 3 + d[1] * 11) / T)];
    if (!e) return;
    const C = this.C, st = LQ.state;
    if (e.type === 'npc') { e.dir = { up: 'down', down: 'up', left: 'right', right: 'left' }[p.dir]; LQ.script(() => C.talk(e.npc.id)); }
    else if (e.type === 'sign') LQ.script(() => LQ.say(null, e.sign.fn ? e.sign.fn() : e.sign.text));
    else if (e.type === 'chest') { if (!st.chests[e.id]) { this.burst(e.tx * T + 8, e.ty * T + 6, '#f3c531', 14, 45); LQ.script(() => C.openChest(e.id)); } else LQ.script(() => LQ.say(null, 'Empty. You already took what was inside.')); }
    else if (e.use) e.use();
  },

  draw(g) {
    const cx = Math.round(this.cam.x), cy = Math.round(this.cam.y), p = this.p, st = LQ.state, win = this.season === 'winter', tm = LQ.time, m = this.map;
    const fx = LQ.fx;
    g.drawImage(this.ground, -cx, -cy);
    // glowing plants, runes, and shorelines breathe slowly
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = .62 + .2 * Math.sin(tm * 1.3);
    g.drawImage(this.ground.glow, -cx, -cy);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    if (!win) for (let ty = Math.floor(cy / T); ty <= Math.floor((cy + LQ.BH) / T); ty++) for (let tx = Math.floor(cx / T); tx <= Math.floor((cx + LQ.BW) / T); tx++) {
      if (ty < 0 || tx < 0 || ty >= m.H || tx >= m.W || m.g[ty][tx] !== 'w') continue;
      const ox = Math.floor((tm * 7 + LQ.hash(tx, ty, 21) * 16) % 16);
      g.fillStyle = 'rgba(95,232,255,.5)'; g.fillRect(tx * T - cx + ox, ty * T - cy + 5, Math.min(4, 16 - ox), 1); g.fillRect(tx * T - cx + ((ox + 8) % 13), ty * T - cy + 11, 3, 1);
    }
    const target = this.questTarget(), list = [];
    for (const e of this.ents) { const ex = (e.b ? e.b.x : e.tx != null ? e.tx : 20) * T; if (e.base > cy - 8 && e.base < cy + LQ.BH + 96 && ex > cx - 96 && ex < cx + LQ.BW + 48) list.push(e); }
    list.push({ type: 'player', base: p.y });
    if (this.agent) list.push({ type: 'agent', base: this.agent.y });
    list.sort((a, b) => a.base - b.base);
    const shadow = (x, y, w) => this.shadow(g, x, y, w);
    // idle frames: 4 is a breath, 5 is a blink
    const idle = seed => { const ph = tm * 1.5 + seed; return ph % 4.3 > 4.15 ? 5 : Math.floor(ph) % 2 ? 4 : 0; };
    fx.begin(g);
    for (const e of list) {
      if (e.draw) e.draw(g, cx, cy, tm);
      else if (e.type === 'tree') g.drawImage(LQ.treeSprite(e.kind, this.season, (e.tx * 7 + e.ty * 3) % 3), e.tx * T - 3 - cx, (e.ty + 1) * T - 31 - cy);
      else if (e.type === 'building') g.drawImage(LQ.buildingSprite(e.b, this.season), e.b.x * T - 1 - cx, (e.b.y + 3) * T - 71 - cy);
      else if (e.type === 'sign') g.drawImage(LQ.prop('sign', this.season), e.tx * T - 1 - cx, e.ty * T - 3 - cy);
      else if (e.type === 'chest') g.drawImage(LQ.prop('chest', 'summer', st.chests[e.id] ? 1 : 0), e.tx * T - 1 - cx, e.ty * T - cy);
      else if (e.type === 'coin') { shadow(e.tx * T + 8 - cx, e.ty * T + 14 - cy, 6); g.drawImage(LQ.prop('coin', 'summer', Math.floor(tm * 7 + e.i) % 4), e.tx * T + 3 - cx, e.ty * T + 1 - cy + Math.round(Math.sin(tm * 4 + e.i) * 1.5)); }
      else if (e.type === 'npc') {
        const x = e.tx * T + 8 - cx, y = e.ty * T + 14 - cy, sp = LQ.charSprite(e.npc.look, e.dir, idle(e.tx * 1.7 + e.ty * .9));
        if (e.npc.small) { shadow(x, y, 8); g.drawImage(sp, x - 7, y - 19, 14, 20); }
        else { shadow(x, y, 10); g.drawImage(sp, x - 9, y - 25); }
        if (target === e.npc.id) g.drawImage(LQ.prop('mark'), x - 3, y - 39 + Math.round(Math.sin(tm * 6) * 2));
      } else if (e.type === 'agent') {
        const a = this.agent, x = Math.round(a.x) - cx, y = Math.round(a.y) - cy; shadow(x, y, 10);
        g.drawImage(LQ.charSprite(a.look, p.x < a.x ? 'left' : 'down', 0), x - 9, y - 25); fx.light(x, y - 12, 20, '#ff4fb0', .45);
        g.drawImage(LQ.prop('mark'), x - 3, y - 39 + Math.round(Math.sin(tm * 10) * 2));
      } else if (e.type === 'player') {
        const x = Math.round(p.x) - cx, y = Math.round(p.y) - cy; shadow(x, y, 10);
        if (!LQ.kit || !LQ.kit.blink()) g.drawImage(LQ.charSprite(LQ.HERO.look, p.dir, p.moving ? p.frame : idle(0)), x - 9, y - 25);
        fx.light(x, y - 10, 30, '#35f0e6', .26); fx.light(x, y - 12, 12, '#c8fbff', .3);
        if (LQ.kit) LQ.kit.drawHero(g, x, y, p, tm);
      }
    }
    fx.end(g);
    for (const pt of this.parts) { const a = Math.min(1, pt.t * 3), x = Math.round(pt.x) - cx, y = Math.round(pt.y) - cy; g.fillStyle = pt.col; g.globalAlpha = a; g.fillRect(x, y, 2, 2); fx.light(x + 1, y + 1, 5, pt.col, a * .5); }
    g.globalAlpha = 1;
    fx.flush(g, tm);
    fx.ambient(g, this.R.id, cx, cy, tm);
    if (this.R.dark && LQ.rooms) LQ.rooms.darkness(g, this, cx, cy);
    if (win) { g.fillStyle = '#eaf4ff'; for (let i = 0; i < 46; i++) { const sx = (LQ.hash(i, 1, 30) * LQ.BW + tm * (8 + i % 5 * 4) + Math.sin(tm + i) * 6) % LQ.BW, sy = (LQ.hash(i, 2, 30) * LQ.BH + tm * (18 + i % 4 * 7)) % LQ.BH; g.fillRect(sx, sy, i % 3 ? 1 : 2, i % 3 ? 1 : 2); } g.fillStyle = 'rgba(120,130,255,.07)'; g.fillRect(0, 0, LQ.BW, LQ.BH); }
    if (this.R.overlay) this.R.overlay(g, this, st);
  },

  drawUI(c) {
    const st = LQ.state, q = LQ.curQuest(), R = this.R;
    if (ui.doc) return;
    // HUD plates: dark glass with a thin neon edge
    const hud = (x, y, w, h) => { c.fillStyle = 'rgba(6,5,22,.84)'; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(155,107,255,.55)'; c.fillRect(x, y + h - 2, w, 2); c.fillStyle = 'rgba(53,240,230,.5)'; c.fillRect(x, y, w, 1); };
    // quest tracker
    const s = `Coins ${st.coins}    Savvy ${st.savvy}`;
    const finder = R.finder && LQ.finderStatus(R, this);
    const extra = [st.streak >= 3 ? 'Streak x' + st.streak : '', finder ? finder.count : R.hud?.(this, st)].filter(Boolean).join('    ');
    const lines = [extra, finder?.count && LQ.has(R.finder.gear) ? finder.hint : ''].filter(Boolean);
    c.font = F(24);
    const ew = lines.length ? Math.min(470, Math.max(...lines.map(line => c.measureText(line).width)) + 28) : 0;
    c.font = F(26); const sw = Math.min(470, c.measureText(s).width + 32);
    const tw = Math.min(LQ.VW - 44 - Math.max(sw, ew), Math.max(250, c.measureText(q.text).width + 44));
    hud(16, 14, tw, 62); c.fillStyle = '#ffcf4a'; c.fillRect(16, 14, 5, 62);
    c.font = F(10, true); c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = '#ffcf4a'; c.fillText('QUEST', 32, 23);
    ui.text(c, q.text, 32, 40, '#eef4ff', F(26), 'left', tw - 36);
    // coins and savvy
    hud(LQ.VW - sw - 16, 14, sw, 38); ui.text(c, s, LQ.VW - 32, 18, '#ffe98a', F(26), 'right', sw - 32);
    if (lines.length) {
      hud(LQ.VW - ew - 16, 56, ew, 8 + lines.length * 24);
      lines.forEach((line, i) => ui.text(c, line, LQ.VW - 30, 58 + i * 24, i ? '#ffe98a' : '#c9cdea', F(24), 'right', ew - 28));
    }
    if (LQ.kit) LQ.kit.drawHUD(c, hud);
    // pointer toward an off-screen quest target
    const tgt = this.questTarget(), fb = R.fallbackTarget ? R.fallbackTarget(st) : null;
    const e = this.ents.find(x => (x.type === 'npc' && x.npc.id === tgt) || (tgt && x.qid === tgt)) || (fb && this.ents.find(x => x.qid === fb));
    if (e && !LQ.busy && !ui.menu) {
      const sx = (e.tx * T + 8 - this.cam.x) * 3, sy = (e.ty * T - this.cam.y) * 3;
      if (sx < 0 || sx > LQ.VW || sy < 0 || sy > LQ.VH) {
        const ang = Math.atan2(sy - LQ.VH / 2, sx - LQ.VW / 2), px = LQ.clamp(LQ.VW / 2 + Math.cos(ang) * 600, 40, LQ.VW - 40), py = LQ.clamp(LQ.VH / 2 + Math.sin(ang) * 600, lines.length > 1 ? 138 : 100, LQ.VH - 40), b = Math.sin(LQ.time * 6) * 4;
        c.save(); c.translate(px + Math.cos(ang) * b, py + Math.sin(ang) * b); c.rotate(ang);
        c.fillStyle = '#05050f'; c.beginPath(); c.moveTo(20, 0); c.lineTo(-14, -17); c.lineTo(-14, 17); c.fill();
        c.fillStyle = '#ffcf4a'; c.beginPath(); c.moveTo(14, 0); c.lineTo(-10, -11); c.lineTo(-10, 11); c.fill(); c.restore();
      }
    }
    if (this.hintT < 6 && !LQ.busy && !ui.menu) {
      hud(130, 486, 700, 38);
      ui.text(c, 'Arrows or WASD: move    Space: talk    E: use tool    J: journal    M: sound', LQ.VW / 2, 491, '#c9cdea', F(24), 'center');
    }
    // soft vignette
    const v = c.createRadialGradient(LQ.VW / 2, LQ.VH / 2, 260, LQ.VW / 2, LQ.VH / 2, 620); v.addColorStop(0, 'rgba(7,8,26,0)'); v.addColorStop(1, 'rgba(10,4,34,.3)');
    c.fillStyle = v; c.fillRect(0, 0, LQ.VW, LQ.VH);
  },
};
})();
