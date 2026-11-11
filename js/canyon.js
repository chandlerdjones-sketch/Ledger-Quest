// Hustle Canyon: the Chapter 3 region. A red-rock town, Rattle Creek, and Off-the-Books Gulch.
(() => {
const LQ = window.LQ, T = 16;
const BUILDINGS = [
  { id: 'c3hall', x: 7, y: 6, roof: '#c9781c', icon: 'banner', wall: '#f1dcb4' },
  { id: 'c3depot', x: 15, y: 6, roof: '#3f6fb8', icon: 'mail', wall: '#f1dcb4' },
  { id: 'c3ledger', x: 29, y: 6, roof: '#3d7a5a', icon: 'scroll', wall: '#e9d2a8' },
  { id: 'c3assay', x: 37, y: 6, roof: '#5d6478', icon: 'coin', wall: '#e9d2a8' },
  { id: 'c3station', x: 7, y: 16, roof: '#8a3f8f', icon: 'bell', wall: '#f1dcb4' },
  { id: 'c3tally', x: 13, y: 16, roof: '#b5503c', icon: 'shield', wall: '#f1dcb4' },
  { id: 'c3taxoff', x: 33, y: 16, roof: '#2a3a6e', icon: 'quill', wall: '#e9d2a8' },
];
function build() {
  const W = 48, H = 40, m = LQ.newMap(W, H), g = m.g, rect = m.rect;
  rect(0, 0, W - 1, H - 1, 'a');
  // canyon walls and mesas
  rect(0, 0, W - 1, 1, 'c'); rect(0, H - 2, W - 1, H - 1, 'c'); rect(0, 0, 1, H - 1, 'c'); rect(W - 2, 0, W - 1, H - 1, 'c');
  rect(2, 2, 5, 4, 'c'); rect(40, 2, 45, 3, 'c'); rect(2, 13, 4, 17, 'c'); rect(43, 14, 45, 18, 'c'); rect(2, 30, 9, 33, 'c'); rect(14, 34, 20, 37, 'c');
  // Rattle Creek and its bridge
  for (let x = 2; x < W - 2; x++) { const off = (x >= 19 && x <= 28) ? 0 : Math.round(Math.sin(x / 4)); g[26 + off][x] = 'w'; g[27 + off][x] = 'w'; }
  rect(23, 26, 24, 27, 'b');
  // the Gulch: walled off, with one gap in the north wall
  rect(30, 31, 45, 31, 'c'); rect(30, 31, 30, 37, 'c'); rect(40, 31, 41, 31, 'a');
  // roads and plaza
  rect(0, 20, 42, 21, 'p'); rect(23, 0, 24, 25, 'p'); rect(5, 10, 42, 11, 'p'); rect(23, 28, 24, 30, 'p'); rect(23, 29, 41, 30, 'p');
  for (const b of BUILDINGS) rect(b.x + 2, b.y + 3, b.x + 3, b.y + 3, 'p');
  rect(19, 13, 28, 19, 'q');
  // solids
  for (const b of BUILDINGS) m.block(b.x, b.y, b.x + 4, b.y + 2);
  m.block(19, 13, 20, 13); m.block(23, 16, 24, 17);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === 'w' || g[y][x] === 'c') m.solid[y][x] = true;
  m.keepClear(LQ.CH3, { a: 1, w: 1 }); m.mark(2, 20, 2); m.mark(24, 2, 2); m.mark(40, 34, 2); m.mark(41, 34, 2);
  Object.values(LQ.CH3.spots).forEach(p => m.mark(p[0], p[1]));
  // a few palms on the open sand
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (m.solid[y][x] || m.keep[y][x] || g[y][x] !== 'a') continue;
    if (LQ.hash(x, y, 71) < .03) { m.trees.push({ x, y, kind: 'palm' }); m.solid[y][x] = true; }
  }
  return m;
}
const say = t => () => LQ.script(() => LQ.say(null, t));
const R = LQ.REGIONS.canyon = {
  id: 'canyon', title: 'HUSTLE CANYON', sub: () => 'Chapter 3', season: 'summer', build, buildings: BUILDINGS, content: () => LQ.CH3,
  zones: { town: ['HUSTLE CANYON', 'Everybody here has something on the side'], creek: ['RATTLE CREEK', 'Mind the bridge'], gulch: ['OFF-THE-BOOKS GULCH', 'Cash only. No questions.'] },
  zone: p => p.x > 30 * T && p.y > 31 * T + 8 ? 'gulch' : p.y > 25 * T ? 'creek' : 'town',
  music: (w, st) => w.zone === 'gulch' && !st.flags.boss3 ? 'tide' : 'canyon',
  auditOK: (st, zone) => st.q3 != null && st.q3 >= 1 && zone !== 'gulch',
  fallbackTarget: st => st.q3 >= 8 && st.q4 == null ? 'northtrail' : null,
  exits: [
    { x0: 0, x1: 12, y0: 19 * T, y1: 23 * T, to: 'coast', px: 45 * T, py: 11 * T, dir: 'left' },
    { x0: 23 * T, x1: 25 * T, y0: 0, y1: 13, to: 'summit', px: 24 * T, py: 42 * T, dir: 'up' },
  ],
  arrive: async () => { if (LQ.state.q3 == null) await LQ.CH3.begin(); },
  // lost expense slips sparkle on the ground once Bookkeeper Lupe has explained the hunt
  addSlips(w, st) {
    if (st.q3 == null || st.q3 < 3) return;
    const S = LQ.CH3.spots;
    for (const id in S) {
      if (st.rcpt[id] || w.ents.some(e => e.rid === id)) continue;
      const tx = S[id][0], ty = S[id][1];
      w.ents.push({ type: 'receipt', rid: id, tx, ty, base: ty * T + 12, pick: () => LQ.CH3.found(id),
        draw: (g, cx, cy, tm) => { w.shadow(g, tx * T + 8 - cx, ty * T + 14 - cy, 6); g.drawImage(LQ.prop('receipt', 'summer', Math.floor(tm * 3 + tx) % 2), tx * T + 2 - cx, ty * T - 2 - cy + Math.round(Math.sin(tm * 3 + tx) * 1.5)); } });
    }
  },
  spawn(w, st) {
    const P = (name, tx, ty, ox, oy, frame) => w.ents.push({ type: 'prop', tx, base: (ty + 1) * T - 1, draw: (g, cx, cy, tm) => g.drawImage(LQ.prop(name, 'summer', frame ? frame(tm) : 0), tx * T + ox - cx, (ty + 1) * T + oy - cy) });
    P('stall', 19, 13, -1, -31); P('fountain', 23, 17, -1, -35, tm => Math.floor(tm * 4) % 2);
    if (!(st.q3 >= 6)) w.ents.push({ type: 'gate', tx: 40, ty: 31, tx2: 41, base: 32 * T - 1, solid: true,
      use: say('A rockfall blocks the trail into the Gulch. From the other side comes the sound of someone counting cash.'), draw: (g, cx, cy) => g.drawImage(LQ.prop('boulders'), 40 * T - 2 - cx, 31 * T - 5 - cy) });
    if (!st.flags.boss3) w.ents.push({ type: 'boss', qid: 'boss3', tx: 40, ty: 34, tx2: 41, base: 35 * T - 1, solid: true, use: () => LQ.script(() => LQ.startBattle('slick')),
      draw: (g, cx, cy, tm) => { w.shadow(g, 41 * T - cx, 35 * T - cy, 30); g.drawImage(LQ.bossSprite(Math.floor(tm * 3) % 2, 'slick'), 41 * T - 24 - cx, 35 * T - 52 - cy + Math.round(Math.sin(tm * 2) * 2), 48, 48);
        if (w.questTarget() === 'boss3') g.drawImage(LQ.prop('mark'), 41 * T - 3 - cx, 35 * T - 66 - cy + Math.round(Math.sin(tm * 6) * 2)); } });
    if (!(st.q3 >= 8)) w.ents.push({ type: 'roadblock', tx: 23, ty: 1, tx2: 24, base: 2 * T - 1, solid: true,
      use: say('The North Trail to the Summit of Gains is closed. The guards will open it once your return is filed.'), draw: (g, cx, cy) => g.drawImage(LQ.prop('barricade'), 23 * T - 2 - cx, 1 * T - 4 - cy) });
    w.ents.push({ type: 'marker', qid: 'northtrail', tx: 23, ty: 0, base: -999 });
    R.addSlips(w, st);
  },
  // slip counter, and the Dowsing Rod reading
  hud(w, st) {
    if (st.q3 == null || st.q3 < 3) return '';
    const C = LQ.CH3, left = C.hunt.filter(id => !st.rcpt[id]);
    let s = 'Slips ' + (C.hunt.length - left.length) + '/' + C.hunt.length;
    if (left.length && LQ.has('rod')) {
      let best = null;
      for (const id of left) { const p = C.spots[id], dx = p[0] - w.p.x / T, dy = p[1] - w.p.y / T, d = Math.hypot(dx, dy); if (!best || d < best.d) best = { d, dx, dy }; }
      const dir = (Math.abs(best.dy) > 2 ? (best.dy < 0 ? 'N' : 'S') : '') + (Math.abs(best.dx) > 2 ? (best.dx < 0 ? 'W' : 'E') : '');
      s += '    Rod: ' + (best.d < 3 ? 'right here!' : Math.round(best.d) + ' steps ' + dir);
    }
    return s;
  },
};
})();
