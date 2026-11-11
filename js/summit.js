// Summit of Gains: the Chapter 4 region. A snowbound mountain town, with the Hot-Tip Dragon on the peak above it.
(() => {
const LQ = window.LQ, T = 16;
const PEAK = [
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
const BUILDINGS = [
  { id: 'c4assay', x: 7, y: 16, roof: '#8a2a3a', icon: 'coin', wall: '#e9dcc8' },
  { id: 'c4clock', x: 15, y: 16, roof: '#3a5a8a', icon: 'bell', wall: '#d9d2c2' },
  { id: 'c4bank', x: 29, y: 16, roof: '#2f8a6a', icon: 'coin' },
  { id: 'c4ranger', x: 37, y: 16, roof: '#3d7a5a', icon: 'shield', wall: '#e9dcc8' },
  { id: 'c4lodge', x: 7, y: 26, roof: '#c98a3c', icon: 'home' },
  { id: 'c4camp', x: 13, y: 26, roof: '#c9781c', icon: 'banner', wall: '#e9dcc8' },
  { id: 'c4taxoff', x: 33, y: 26, roof: '#2a3a6e', icon: 'quill' },
];
function build() {
  const W = 48, H = 44, m = LQ.newMap(W, H), g = m.g, solid = m.solid, rect = m.rect;
  // roads, plaza, and a frozen tarn
  rect(23, 12, 24, 43, 'p'); rect(5, 20, 42, 21, 'p'); rect(5, 30, 42, 31, 'p');
  for (const b of BUILDINGS) rect(b.x + 2, b.y + 3, b.x + 3, b.y + 3, 'p');
  rect(19, 23, 28, 29, 'q');
  rect(36, 35, 41, 38, 'w');
  // the peak
  PEAK.forEach((row, j) => { for (let i = 0; i < row.length; i++) {
    const ch = row[i], x = 14 + i, y = 2 + j;
    if (ch === '#') { g[y][x] = '#'; solid[y][x] = true; }
    else if (ch === 's' || ch === 'B') g[y][x] = 's';
    else if (ch === 'p') { g[y][x] = 'r'; m.trees.push({ x, y, kind: 'pine' }); solid[y][x] = true; }
    else g[y][x] = 'r';
  } });
  // solids
  for (const b of BUILDINGS) m.block(b.x, b.y, b.x + 4, b.y + 2);
  m.block(19, 23, 20, 23); m.block(23, 26, 24, 27);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === 'w') solid[y][x] = true;
  m.keepClear(LQ.CH4, { g: 1, f: 1, w: 1 }); m.mark(24, 41, 2);
  // pines: a thick border, a forest under the peak, and a scatter through town
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x] !== 'g' || solid[y][x] || m.keep[y][x]) continue;
    const border = x < 2 || y < 2 || x >= W - 2 || y >= H - 2, north = y < 14;
    if (LQ.hash(x, y, 81) < (border ? 1 : north ? .8 : .1)) { m.trees.push({ x, y, kind: north || LQ.hash(x, y, 82) < .7 ? 'pine' : 'oak' }); solid[y][x] = true; }
  }
  return m;
}
const say = t => () => LQ.script(() => LQ.say(null, t));
LQ.REGIONS.summit = {
  id: 'summit', title: 'SUMMIT OF GAINS', sub: () => 'Chapter 4', season: 'winter', build, buildings: BUILDINGS, content: () => LQ.CH4,
  zones: { town: ['SUMMIT OF GAINS', 'Where patience is paid'], peak: ['THE PEAK', 'Something up here is giving out stock tips'] },
  zone: p => p.y < 12 * T ? 'peak' : 'town',
  music: (w, st) => w.zone === 'peak' && !st.flags.boss4 ? 'mountain' : 'summit',
  auditOK: (st, zone) => st.q4 != null && st.q4 >= 1 && zone === 'town',
  exits: [{ x0: 23 * T, x1: 25 * T, y0: 43 * T + 8, y1: 45 * T, to: 'canyon', px: 24 * T, py: 2 * T + 8, dir: 'down' }],
  arrive: async () => { if (LQ.state.q4 == null) await LQ.CH4.begin(); },
  spawn(w, st) {
    const P = (name, tx, ty, ox, oy, frame) => w.ents.push({ type: 'prop', tx, base: (ty + 1) * T - 1, draw: (g, cx, cy, tm) => g.drawImage(LQ.prop(name, 'winter', frame ? frame(tm) : 0), tx * T + ox - cx, (ty + 1) * T + oy - cy) });
    P('stall', 19, 23, -1, -31); P('fountain', 23, 27, -1, -35, tm => Math.floor(tm * 4) % 2);
    if (!(st.q4 >= 7)) w.ents.push({ type: 'gate', tx: 23, ty: 11, tx2: 24, base: 12 * T - 1, solid: true,
      use: say('A wall of ice blocks the trail to the peak. Gold light flickers behind it, and a voice is shouting about a sure thing.'), draw: (g, cx, cy) => g.drawImage(LQ.prop('boulders', 'winter'), 23 * T - 2 - cx, 11 * T - 5 - cy) });
    if (!st.flags.boss4) w.ents.push({ type: 'boss', qid: 'boss4', tx: 23, ty: 3, tx2: 24, base: 4 * T - 1, solid: true, use: () => LQ.script(() => LQ.startBattle('glint')),
      draw: (g, cx, cy, tm) => { w.shadow(g, 24 * T - cx, 4 * T - cy, 30); g.drawImage(LQ.bossSprite(Math.floor(tm * 3) % 2, 'glint'), 24 * T - 24 - cx, 4 * T - 52 - cy + Math.round(Math.sin(tm * 2) * 2), 48, 48);
        if (w.questTarget() === 'boss4') g.drawImage(LQ.prop('mark'), 24 * T - 3 - cx, 4 * T - 66 - cy + Math.round(Math.sin(tm * 6) * 2)); } });
  },
  // the running Schedule D record, while Chapter 4 is in progress
  hud(w, st) {
    if (!st.inv || st.q4 == null || st.q4 >= 9) return '';
    return 'Schedule D   short ' + LQ.money(st.inv.st) + '   long ' + LQ.money(st.inv.lt);
  },
  // a gold glare near the peak until the dragon is gone
  overlay(g, w, st) {
    if (st.flags.boss4) return;
    const f = LQ.clamp((13.5 * T - w.p.y) / (8 * T), 0, 1), tm = LQ.time; if (f <= 0) return;
    g.fillStyle = `rgba(240,190,60,${f * .22})`; g.fillRect(0, 0, LQ.BW, LQ.BH);
    for (let i = 0; i < 7; i++) { g.fillStyle = `rgba(255,236,160,${f * .14})`; const fx = (LQ.hash(i, 5, 44) * 420 + tm * (6 + i * 2)) % 420 - 60, fy = LQ.hash(i, 6, 44) * LQ.BH; g.fillRect(fx, fy, 70, 9); g.fillRect(fx + 12, fy - 5, 44, 19); }
  },
};
})();
