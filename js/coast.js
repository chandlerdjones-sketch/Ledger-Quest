// Shelter Coast: the Chapter 2 region. A seaside town, a beach, a pier, and the Old Lighthouse.
(() => {
const LQ = window.LQ, T = 16;
const BUILDINGS = [
  { id: 'chapel', x: 7, y: 6, roof: '#58a8c8', icon: 'bell', wall: '#f3f0e6' },
  { id: 'seacot', x: 15, y: 6, roof: '#c98a3c', icon: 'home' },
  { id: 'records', x: 29, y: 6, roof: '#5a4a7a', icon: 'scroll', wall: '#e9dcc8' },
  { id: 'yard', x: 37, y: 6, roof: '#22304f', icon: 'anchor', wall: '#d9d2c2' },
  { id: 'bank', x: 7, y: 16, roof: '#2f8a6a', icon: 'coin' },
  { id: 'nursery', x: 13, y: 16, roof: '#e0a02c', icon: 'star', wall: '#fff3d6' },
  { id: 'taxoff', x: 33, y: 16, roof: '#b5503c', icon: 'quill' },
];
function build() {
  const W = 48, H = 40, m = LQ.newMap(W, H), g = m.g, rect = m.rect;
  // beach and sea, with wavy edges
  for (let x = 0; x < W; x++) { const a = 25 + Math.round(Math.sin(x / 5)), s = 31 + Math.round(Math.sin(x / 6)); for (let y = a; y < H; y++) g[y][x] = y >= s ? 'w' : 'a'; }
  // the lighthouse spit: a rock wall with one gap, and sand beyond it
  rect(36, 30, 46, 30, 'a'); rect(36, 31, 46, 31, '#'); rect(40, 31, 41, 31, 'a'); rect(38, 32, 44, 36, 'a');
  // pier, roads, plaza
  rect(23, 30, 24, 36, 'b');
  rect(23, 0, 24, 26, 'p'); rect(5, 10, 47, 11, 'p'); rect(5, 20, 42, 21, 'p');
  for (const b of BUILDINGS) rect(b.x + 2, b.y + 3, b.x + 3, b.y + 3, 'p');
  rect(19, 13, 28, 19, 'q');
  for (let y = 12; y <= 19; y++) for (let x = 17; x <= 30; x++) if (g[y][x] === 'g') g[y][x] = 'f';
  // solids
  for (const b of BUILDINGS) m.block(b.x, b.y, b.x + 4, b.y + 2);
  m.block(19, 13, 20, 13); m.block(23, 16, 24, 17); m.block(42, 33, 43, 33); m.block(13, 29, 14, 29); m.block(32, 29, 33, 29); m.block(18, 28, 18, 28);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === 'w' || g[y][x] === '#') m.solid[y][x] = true;
  m.keepClear(LQ.CH2, { g: 1, f: 1, w: 1, a: 1 }); m.mark(24, 2, 2); m.mark(40, 34, 2); m.mark(41, 34, 2);
  Object.values(LQ.CH2.spots).forEach(p => m.mark(p[0], p[1]));
  // trees: a pine wood to the north, a few oaks in town, palms on the sand
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (m.solid[y][x] || m.keep[y][x]) continue;
    const t = g[y][x];
    if (t === 'g') {
      const border = x < 2 || x >= W - 2 || y < 2, north = y < 5;
      if (LQ.hash(x, y, 51) < (border ? 1 : north ? .55 : .07)) { m.trees.push({ x, y, kind: north || LQ.hash(x, y, 52) < .3 ? 'pine' : 'oak' }); m.solid[y][x] = true; }
      else if (LQ.hash(x, y, 53) < .06) g[y][x] = 'f';
    } else if (t === 'a' && LQ.hash(x, y, 54) < .035) { m.trees.push({ x, y, kind: 'palm' }); m.solid[y][x] = true; }
  }
  // hedge the East Road so the only way through is along it
  for (const y of [9, 12]) for (let x = 44; x < W; x++) if (!m.solid[y][x]) { m.trees.push({ x, y, kind: 'pine' }); m.solid[y][x] = true; }
  return m;
}
const say = t => () => LQ.script(() => LQ.say(null, t));
const R = LQ.REGIONS.coast = {
  id: 'coast', title: 'SHELTER COAST', sub: () => 'Chapter 2', season: 'summer', build, buildings: BUILDINGS, content: () => LQ.CH2,
  zones: { town: ['SHELTER COAST', 'Where the road meets the sea'], beach: ['THE STRAND', 'Sand, salt, and lost receipts'], light: ['THE OLD LIGHTHOUSE', 'Someone out here is selling secrets'] },
  zone: p => p.x > 37 * T && p.y > 31 * T + 8 ? 'light' : p.y > 25 * T ? 'beach' : 'town',
  music: (w, st) => w.zone === 'light' && !st.flags.boss2 ? 'tide' : 'coast',
  auditOK: (st, zone) => st.q2 != null && st.q2 >= 1 && zone !== 'light',
  fallbackTarget: st => st.q2 >= 8 && st.q3 == null ? 'eastroad' : null,
  exits: [{ x0: 23 * T, x1: 25 * T, y0: 0, y1: 13, to: 'village', px: 24 * T, py: 40 * T, dir: 'up' },
    { x0: 47 * T, x1: 49 * T, y0: 9 * T, y1: 13 * T, to: 'canyon', px: 2 * T + 8, py: 21 * T, dir: 'right', open: st => st.q2 >= 8 }],
  arrive: async () => { if (LQ.state.q2 == null) await LQ.CH2.begin(); },
  // lost receipts sparkle on the ground once Banker Brine has explained the hunt
  addReceipts(w, st) {
    if (st.q2 == null || st.q2 < 2) return;
    const S = LQ.CH2.spots;
    for (const id in S) {
      if (st.rcpt[id] || w.ents.some(e => e.rid === id)) continue;
      const tx = S[id][0], ty = S[id][1];
      w.ents.push({ type: 'receipt', rid: id, tx, ty, base: ty * T + 12, pick: () => LQ.CH2.found(id),
        draw: (g, cx, cy, tm) => { w.shadow(g, tx * T + 8 - cx, ty * T + 14 - cy, 6); g.drawImage(LQ.prop('receipt', 'summer', Math.floor(tm * 3 + tx) % 2), tx * T + 2 - cx, ty * T - 2 - cy + Math.round(Math.sin(tm * 3 + tx) * 1.5)); } });
    }
  },
  spawn(w, st) {
    const P = (name, tx, ty, ox, oy, frame) => w.ents.push({ type: 'prop', tx, base: (ty + 1) * T - 1, draw: (g, cx, cy, tm) => g.drawImage(LQ.prop(name, 'summer', frame ? frame(tm) : 0), tx * T + ox - cx, (ty + 1) * T + oy - cy) });
    P('stall', 19, 13, -1, -31); P('fountain', 23, 17, -1, -35, tm => Math.floor(tm * 4) % 2);
    P('boat', 13, 29, -2, -20); P('boat', 32, 29, -2, -20); P('umbrella', 18, 28, -3, -25);
    P('lighthouse', 42, 33, -1, -79, tm => Math.floor(tm * 1.5) % 2);
    if (st.q2 == null || st.q2 < 6) w.ents.push({ type: 'tide', tx: 40, ty: 31, tx2: 41, base: 32 * T - 1, solid: true,
      use: say('The tide is in. Waves crash over the sandbar to the Old Lighthouse, and somewhere out there a bell is clanging.'),
      draw: (g, cx, cy, tm) => g.drawImage(LQ.prop('tide', 'summer', Math.floor(tm * 2) % 2), 40 * T - 1 - cx, 31 * T - 2 - cy) });
    if (!st.flags.boss2) w.ents.push({ type: 'boss', qid: 'boss2', tx: 40, ty: 34, tx2: 41, base: 35 * T - 1, solid: true, use: () => LQ.script(() => LQ.startBattle('loophole')),
      draw: (g, cx, cy, tm) => { w.shadow(g, 41 * T - cx, 35 * T - cy, 30); g.drawImage(LQ.bossSprite(Math.floor(tm * 3) % 2, 'loophole'), 41 * T - 24 - cx, 35 * T - 52 - cy + Math.round(Math.sin(tm * 2) * 2), 48, 48);
        if (w.questTarget() === 'boss2') g.drawImage(LQ.prop('mark'), 41 * T - 3 - cx, 35 * T - 66 - cy + Math.round(Math.sin(tm * 6) * 2)); } });
    if (!(st.q2 >= 8)) {
      const closed = say('The East Road to Hustle Canyon is closed. The guards will open it once your joint return is filed.');
      w.ents.push({ type: 'roadblock', tx: 45, ty: 10, base: 12 * T - 1, solid: true, use: closed, draw: (g, cx, cy) => g.drawImage(LQ.prop('barricade'), 45 * T - 10 - cx, 10 * T + 6 - cy) });
      w.ents.push({ type: 'roadblock2', tx: 45, ty: 11, base: -999, solid: true, use: closed });
    }
    w.ents.push({ type: 'marker', qid: 'eastroad', tx: 47, ty: 10, base: -999 });
    R.addReceipts(w, st);
  },
  finder: {
    gear: 'spyglass', label: 'Receipts', place: 'Shelter Coast', records: LQ.RECEIPTS,
    ready: st => st.q2 >= 2, unlock: 'Talk to Banker Brine to start the receipt hunt.',
    complete: 'All lost receipts found', chests: { drawer: 'rPoints' },
  },
};
})();
