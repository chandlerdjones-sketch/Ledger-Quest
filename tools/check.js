// Headless check: loads the game's data and logic files with stubs (no browser), then checks tax math and map reachability.
const fs = require('fs'), vm = require('vm'), dir = process.argv[2];
const noop = () => {}, ctxStub = new Proxy({}, { get: () => noop });
global.window = global;
global.LQ = { ui: { toast: noop, wrap: () => [], text: noop, panel: noop, choiceTop: () => 300 }, F: () => '', T: 16, BW: 320, BH: 180, VW: 960, VH: 540,
  money: n => (n < 0 ? '-' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US'), clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  hash: (x, y, s = 0) => { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; },
  audio: { sfx: noop, play: noop }, script: noop, ctx: ctxStub };
const base = () => ({ quest: 9, w4: 0, savvy: 0, coins: 500, asked: 0, first: 0, journal: [], items: [], season: 'summer', chests: {}, coinsGot: {}, flags: { married: true }, career: 'nurse', streak: 0, gear: [], tips: {},
  lossBank: 0, region: 'canyon', q2: 8, rcpt: {}, w4b: 0, wh2: null, child: true, q3: 0, gig: null, est3: null, q4: null, inv: null, hold4: null, harv4: null, acct4: null });
LQ.state = base();
for (const f of ['taxdata', 'economy', 'household', 'chapter1', 'audit', 'battle', 'chapter2', 'chapter3', 'chapter4', 'world', 'coast', 'canyon', 'summit', 'kit', 'foes', 'rooms', 'vaults1', 'jobs', 'depth', 'adventure', 'money', 'intro', 'backoffice', 'flavor'])
  vm.runInThisContext(fs.readFileSync(dir + '/js/' + f + '.js', 'utf8'), { filename: f + '.js' });
let bad = 0; let fail = m => { bad++; console.log('  FAIL: ' + m); };
const M = LQ.money, TX = LQ.TAX;

// ---- 1. tax math, checked against an independent hand calculation
function hand(career, gigId, slips, inv) {
  const C = LQ.CAREERS[career], G = LQ.GIGS[gigId], w2 = C.kind === 'w2';
  const wages = (w2 ? C.wages : 0) + 52000, shop = w2 ? 0 : C.sales - C.expenses;
  const biz = shop + G.gross - G.cost - slips, se = Math.round(biz * 0.9235 * 0.153), half = Math.round(se / 2);
  const stN = inv.st, ltN = inv.lt, net = stN + ltN;
  const stT = net <= 0 || stN <= 0 ? 0 : ltN < 0 ? net : stN, ltT = net <= 0 || ltN <= 0 ? 0 : stN < 0 ? net : ltN;
  const capLine = net >= 0 ? net : -Math.min(3000, -net);
  const income = wages + biz + inv.int + inv.qd + capLine, agi = income - half;
  const itemized = 21750 + Math.round(0.04 * income) + 3600 + 180, ded = Math.max(32200, itemized);
  const pre = Math.max(0, agi - ded - (w2 ? C.ot : 0)), prefRaw = ltT + inv.qd;
  const qbi = Math.round(0.2 * Math.max(0, Math.min(biz - half, pre - Math.min(pre, prefRaw))));
  const taxable = pre - qbi, pref = Math.min(taxable, prefRaw), ord = taxable - pref;
  const B = [[0, .10], [24800, .12], [100800, .22], [211400, .24]]; let ot = 0;
  for (let i = 0; i < B.length; i++) { const to = i + 1 < B.length ? B[i + 1][0] : Infinity; ot += Math.max(0, Math.min(ord, to) - B[i][0]) * B[i][1]; }
  const at0 = Math.min(pref, Math.max(0, 98900 - ord)), prefTax = Math.round(0.15 * (pref - at0));
  const rate = agi <= 150000 ? 0.35 : Math.max(0.20, 0.35 - 0.01 * Math.ceil((agi - 150000) / 4000));
  const tax = Math.round(ot) + prefTax, credits = Math.min(tax, 2200 + Math.round(rate * 3000));
  return { biz, se, taxable, tax, total: tax - credits + se, at0, prefTax };
}
console.log('== Chapter 3 returns (career / gig / all four good slips found / estimates on time)');
for (const career of ['nurse', 'food', 'owner']) for (const gig of ['driver', 'seller', 'scribe']) {
  const s = LQ.state = base(); s.career = career; s.gig = gig; s.est3 = 0; s.q3 = 7;
  ['xSupply', 'xPhone', 'xLicense', 'xMeal', 'xLunch', 'xBoots', 'xFine'].forEach(id => { s.rcpt[id] = true; });
  const f = LQ.fin3(), h = hand(career, gig, 1030, { st: 0, lt: 0, qd: 0, int: 0 });
  for (const k of ['biz', 'se', 'taxable', 'tax', 'total']) if (f[k] !== h[k]) fail(`${career}/${gig} ${k}: game ${f[k]} vs hand ${h[k]}`);
  console.log(`  ${career.padEnd(6)} ${gig.padEnd(7)} gigProfit ${M(f.gigProfit).padStart(8)}  SE ${M(f.se).padStart(7)}  taxable ${M(f.taxable).padStart(9)}  tax ${M(f.tax).padStart(8)}  total ${M(f.total).padStart(8)}  paid ${M(f.withheld).padStart(8)}  diff ${M(f.diff).padStart(7)}  ${f.itemize ? 'ITEMIZE' : 'std'}`);
  const f1 = LQ.fin3({ est: 1 }), f2 = LQ.fin3({ est: 2 });
  if (!(f1.diff < -500)) fail(`${career}/${gig} skipping estimates should leave a bill, diff ${f1.diff}`);
  if (Math.abs(f.diff) > 120 || f.diff < 0) fail(`${career}/${gig} on-time estimates should land near even, diff ${f.diff}`);
  if (f2.withheld !== f.withheld) fail('lump plan should pay in the same total');
  if (s.gig === 'seller' && LQ.GIGS.seller.gross - LQ.GIGS.seller.cost - 1030 < 400) fail('seller profit too small');
}
console.log('== Chapter 4 returns (wait for long-term, harvest the loss, Roth)');
for (const career of ['nurse', 'food', 'owner']) for (const plan of [[1, 0], [0, 1], [1, 2]]) {
  const s = LQ.state = base(); s.career = career; s.gig = 'driver'; s.est3 = 0; s.q3 = 8; s.q4 = 7; s.region = 'summit'; s.acct4 = 0;
  ['xSupply', 'xPhone', 'xLicense', 'xMeal'].forEach(id => { s.rcpt[id] = true; });
  const inv = { st: 0, lt: 600, qd: 900, int: 300 }; if (plan[0]) inv.lt += 4000; else inv.st += 4000; if (plan[1] === 0) inv.st -= 2500;
  s.inv = inv; const f = LQ.fin4(), h = hand(career, 'driver', 1030, inv);
  for (const k of ['taxable', 'tax', 'total', 'at0', 'prefTax']) if (f[k] !== h[k]) fail(`ch4 ${career} ${plan} ${k}: game ${f[k]} vs hand ${h[k]}`);
  console.log(`  ${career.padEnd(6)} ${plan[0] ? 'waited ' : 'sold now'} ${['harvest', 'hold   ', 'wash   '][plan[1]]}  ord ${M(f.ord).padStart(9)}  pref ${M(f.pref).padStart(7)}  at0% ${M(f.at0).padStart(7)}  at15% ${M(f.at15).padStart(7)}  capLine ${M(f.capLine).padStart(7)}  total ${M(f.total).padStart(8)}  diff ${M(f.diff).padStart(7)}  care ${Math.round(f.careRate * 100)}%`);
}
{ // a big net loss: $3,000 limit and carryover
  const s = LQ.state = base(); s.gig = 'scribe'; s.q3 = 8; s.q4 = 7; s.inv = { st: -9000, lt: 600, qd: 900, int: 300 };
  const f = LQ.fin4(); if (f.capLine !== -3000 || f.carryNext !== 5400) fail(`loss limit: capLine ${f.capLine}, carry ${f.carryNext}`); else console.log('  loss limit ok: -$3,000 used, $5,400 carried');
}

// ---- 2. maps: everything the player must reach is reachable
const T = 16;
function reach(R, C, start, opened) {
  const quiet = !!opened, failOld = fail; if (quiet) fail = () => {};
  const m = R.build(), W = m.W, H = m.H, solid = m.solid.map(r => r.slice());
  const blockers = [];
  C.npcs.forEach(n => blockers.push([n.tx, n.ty])); C.signs.forEach(n => blockers.push([n.tx, n.ty])); Object.values(C.chests).forEach(n => blockers.push([n.tx, n.ty]));
  blockers.forEach(p => { if (m.solid[p[1]][p[0]]) fail(`${R.id}: (${p}) placed on a solid tile`); solid[p[1]][p[0]] = true; });
  (opened || []).forEach(p => { solid[p[1]][p[0]] = true; });
  const seen = Array.from({ length: H }, () => new Array(W).fill(false)), q = [start]; if (solid[start[1]][start[0]]) fail(`${R.id}: start ${start} is solid`); seen[start[1]][start[0]] = true;
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen[ny][nx] || solid[ny][nx]) continue; seen[ny][nx] = true; q.push([nx, ny]); } }
  const near = p => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const x = p[0] + dx, y = p[1] + dy; return x >= 0 && y >= 0 && x < W && y < H && seen[y][x]; });
  const names = new Set();
  blockers.forEach(p => { const k = p.join(','); if (names.has(k)) fail(`${R.id}: two things share tile (${k})`); names.add(k); if (!near(p)) fail(`${R.id}: cannot reach (${p})`); });
  C.coins.forEach(p => { if (!seen[p[1]][p[0]]) fail(`${R.id}: coin (${p}) unreachable`); });
  Object.values(C.spots || {}).forEach(p => { if (!seen[p[1]][p[0]]) fail(`${R.id}: slip or receipt (${p}) unreachable`); });
  fail = failOld;
  return { seen, m };
}
console.log('== Maps');
LQ.state = base();
{ const r = reach(LQ.REGIONS.canyon, LQ.CH3, [2, 20]);
  for (const p of [[0, 20], [23, 0], [40, 33], [41, 33], [24, 2]]) if (!r.seen[p[1]][p[0]]) fail('canyon: key tile unreachable ' + p);
  const g = reach(LQ.REGIONS.canyon, LQ.CH3, [2, 20], [[40, 31], [41, 31]]); if (g.seen[33][40]) fail('canyon: the Gulch can be entered around the rockfall');
  const b = reach(LQ.REGIONS.canyon, LQ.CH3, [2, 20], [[23, 1], [24, 1]]); if (b.seen[0][23]) fail('canyon: the North Trail barricade can be bypassed');
  // Adventure pass: with the Notary Lamps standing, the stash door and every boss are still reachable.
  const A = LQ.ADV, a = reach(LQ.REGIONS.canyon, LQ.CH3, [2, 20], A.lamps.canyon);
  if (!a.seen[A.stashDoor[1] + 1][A.stashDoor[0]]) fail("canyon: Slick's Stash door cannot be reached");
  for (const p of [[40, 33], [41, 33], [42, 32], [7, 34]]) if (!a.seen[p[1]][p[0]]) fail('canyon: a lamp blocks or cannot be reached at ' + p);
  const c2 = reach(LQ.REGIONS.coast, LQ.CH2, [24, 2], A.lamps.coast); for (const p of [[40, 33], [41, 33], [39, 32]]) if (!c2.seen[p[1]][p[0]]) fail('coast: the lighthouse lamp blocks the way at ' + p);
  const s4 = reach(LQ.REGIONS.summit, LQ.CH4, [24, 41], A.lamps.summit); for (const p of [[23, 4], [24, 4], [21, 4]]) if (!s4.seen[p[1]][p[0]]) fail('summit: the peak lamp blocks the way at ' + p);
  const rows = LQ.ROOMS.stash3.rows(); if (rows.some(r => r.length !== rows[0].length)) fail('stash3: uneven rows');
  if (A.boxes.filter(b => b.inc).length !== 3 || A.boxes.length !== 4) fail('stash3: expected three income boxes and one that is not');
    // every villager has a tip or a money problem, and every music cue names a real track
  for (const ch of ['CH1', 'CH2', 'CH3', 'CH4']) for (const n of LQ[ch].npcs) if (!LQ.QUIPS[ch][n.id]) fail(ch + ': no tip or money problem for ' + n.id);
  console.log('  canyon checked, trees ' + r.m.trees.length + ', stash door and boss lamps checked'); }
{ const r = reach(LQ.REGIONS.summit, LQ.CH4, [24, 41]);
  for (const p of [[23, 43], [23, 4], [24, 4], [29, 8]]) if (!r.seen[p[1]][p[0]]) fail('summit: key tile unreachable ' + p);
  const g = reach(LQ.REGIONS.summit, LQ.CH4, [24, 41], [[23, 11], [24, 11]]); if (g.seen[4][23]) fail('summit: the peak can be reached around the ice wall');
  console.log('  summit checked, trees ' + r.m.trees.length); }
{ const r = reach(LQ.REGIONS.coast, LQ.CH2, [24, 2]);
  if (!r.seen[10][47]) fail('coast: East Road exit unreachable');
  const g = reach(LQ.REGIONS.coast, LQ.CH2, [24, 2], [[45, 10], [45, 11]]); if (g.seen[10][47]) fail('coast: the East Road barricade can be bypassed');
  console.log('  coast checked'); }

// ---- 2b. Paystub Village adventure content: carved paths, rooms, and puzzles
console.log('== Adventure');
{ LQ.state = base(); Object.assign(LQ.state, { region: 'village', flags: {} });
  const V = LQ.V1, D = V.DOOR, extra = V.STONES.map(s => [s.tx, s.ty]).concat(V.LAMPS, [D.cache], V.FIX.stall, [V.FIX.board]);
  const r = reach(LQ.REGIONS.village, LQ.CH1, [24, 37], extra);
  const front = (p, name) => { if (!r.seen[p[1] + 1][p[0]]) fail('village: cannot stand in front of ' + name); };
  front(D.vault, 'the vault door'); front(D.cave, 'the cave mouth'); front(D.cache, 'the cache'); V.LAMPS.forEach(p => { if (![[1, 0], [-1, 0], [0, 1]].some(([dx, dy]) => r.seen[p[1] + dy][p[0] + dx])) fail('village: lamp unreachable ' + p); });
  V.STONES.forEach(s => { if (r.m.solid[s.ty][s.tx]) fail('village: rune stone on a solid tile ' + s.col); if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => r.seen[s.ty + dy][s.tx + dx])) fail('village: rune stone unreachable ' + s.col); });
  const shut = reach(LQ.REGIONS.village, LQ.CH1, [24, 37], extra.concat([D.falsetree]));
  if (shut.seen[D.cache[1] + 1][D.cache[0]]) fail('village: the cache can be reached without the Bracket Compass');
  for (const x of [7, 8]) { const off = Math.round(Math.sin(x / 4)); if (!r.seen[13 + off][x] || !r.seen[16 + off][x]) fail('village: west bridge landing unreachable at x=' + x); }
  console.log('  village paths checked, trees ' + r.m.trees.length); }
// Phase 2: the fooled villagers. Rowan's cart must close the east footbridge, and the bridge must work once it is gone.
{ LQ.state = base(); Object.assign(LQ.state, { region: 'village', flags: {} });
  const F = LQ.V1.FIX, mid = [[23, 14], [24, 14]];
  if (reach(LQ.REGIONS.village, LQ.CH1, [24, 37], mid.concat([F.cart])).seen[12][30]) fail('village: the east footbridge can be crossed around Rowan\'s cart');
  const open = reach(LQ.REGIONS.village, LQ.CH1, [24, 37], mid);
  if (!open.seen[12][30]) fail('village: the east footbridge does not reach the north bank');
  if (!open.seen[F.porch[1] + 1][F.porch[0]]) fail('village: cannot stand by Granny Maple\'s porch');
  // Shift pay: capped at half a payday, never more out than in, for every career and every tax choice.
  if (String(LQ.jobs.BOARD) !== String(F.board)) fail('jobs: the shift board is not where the village keeps a tile clear');
  for (const career of ['nurse', 'food', 'owner']) for (const w4 of [0, 1, 2]) for (const score of [0, 3, 8, 40]) {
    Object.assign(LQ.state, { career, w4, gear: [] }); const p = LQ.jobs.pay(score), cap = Math.round(LQ.CAREERS[career].pay / 2);
    if (p.gross > cap || p.gross < 0 || p.net > p.gross || p.net < 0 || p.fed < 0 || p.gross - p.fed - p.fica !== p.net && p.net !== 0) fail(`jobs: bad shift pay for ${career} w4 ${w4} score ${score}: ${JSON.stringify(p)}`);
    if (score === 40 && p.gross !== cap) fail(`jobs: a full shift should pay the cap for ${career}`);
  }
  LQ.state.flags = {}; if (LQ.jobs.left() !== 2) fail('jobs: a new quest step should offer two paid shifts');
  console.log('  fooled villagers and shift pay checked');
}
// Flood fill inside a room. `open` lists part characters to treat as walkable.
function roomFill(m, start, blocked) {
  const seen = new Set([start.join(',')]), q = [start];
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (ny < 0 || nx < 0 || ny >= m.H || nx >= m.W || m.solid[ny][nx] || seen.has(k) || blocked.has(k)) continue; seen.add(k); q.push([nx, ny]); } }
  return seen;
}
// Can one crate be pushed from `from` to `to`, with the player starting at `start`? Breadth-first over (player, crate).
function pushable(m, start, from, to, blocked) {
  const free = (x, y) => y >= 0 && x >= 0 && y < m.H && x < m.W && !m.solid[y][x] && !blocked.has(x + ',' + y);
  const key = (px, py, cx, cy) => px + ',' + py + ',' + cx + ',' + cy, seen = new Set([key(...start, ...from)]), q = [[...start, ...from]];
  for (let i = 0; i < q.length; i++) {
    const [px, py, cx, cy] = q[i]; if (cx === to[0] && cy === to[1]) return [px, py];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = px + dx, ny = py + dy; let ncx = cx, ncy = cy;
      if (!free(nx, ny)) continue;
      if (nx === cx && ny === cy) { ncx = cx + dx; ncy = cy + dy; if (!free(ncx, ncy)) continue; }
      const k = key(nx, ny, ncx, ncy); if (!seen.has(k)) { seen.add(k); q.push([nx, ny, ncx, ncy]); }
    }
  }
  return null;
}
for (const career of ['nurse', 'food', 'owner']) {
  LQ.state = base(); Object.assign(LQ.state, { region: 'village', career, flags: {}, quest: 6 });
  const reg = LQ.roomRegion('vault1'), m = reg.build(), L = LQ.V1.L, cells = m.cells, at = ch => cells.filter(c => c.ch === ch), kOf = LQ.ROOMS.vault1.kOf;
  if (m.W < 20 || m.H < 12) fail('vault: room smaller than the screen');
  if (!reg.exits.length || !reg.sx) fail('vault: no start or exit');
  if (at('B').length !== L.n || at('O').length !== L.n + 1 || at('R').length !== L.n + 1) fail('vault: crates, sockets, and runes do not match the ' + L.n + ' ledges for ' + career);
  if (L.next < 1 || L.next > L.n + 1) fail('vault: no rune for the right answer for ' + career);
  if (Math.abs(L.tiers.reduce((a, t) => a + t.tax, 0) - L.f.tax) > 1) fail('vault: ledge taxes do not add up to the tax for ' + career);
  const fixed = new Set(at('I').concat(at('Z'), at('D')).map(c => c.tx + ',' + c.ty)), crates = at('B').map(c => [c.tx, c.ty]).sort((a, b) => Math.abs(a[0] - 9) - Math.abs(b[0] - 9));   // the crate under the doorway goes first
  let me = [(reg.sx - 8) / 16, (reg.sy - 12) / 16], ok = true;
  for (let k = 1; k <= L.n && ok; k++) {
    const so = at('O').find(c => kOf(c.ty) === k), blocked = new Set(fixed);
    at('G').forEach(c => { if (kOf(c.ty) > k) blocked.add(c.tx + ',' + c.ty); });               // gates above this ledge are still shut
    crates.forEach((c, i) => { if (i !== k - 1) blocked.add(c.join(',')); });
    const end = pushable(m, me, crates[k - 1], [so.tx, so.ty], blocked);
    if (!end) { fail(`vault: crate ${k} cannot be pushed to ledge ${k} for ${career}`); ok = false; } else { crates[k - 1] = [so.tx, so.ty]; me = end; }
  }
  if (ok) {
    const blocked = new Set(at('I').concat(at('Z')).map(c => c.tx + ',' + c.ty)); crates.forEach(c => blocked.add(c.join(',')));
    const seen = roomFill(m, me, blocked), need = at('R').concat(at('P'));
    need.forEach(c => { if (!seen.has(c.tx + ',' + c.ty)) fail('vault: cannot reach ' + c.ch + ' at ' + c.tx + ',' + c.ty + ' for ' + career); });
    if (!seen.has(Math.floor(reg.exits[0].x0 / 16) + ',' + Math.floor(reg.exits[0].y0 / 16))) fail('vault: cannot walk back out for ' + career);
  }
  console.log('  vault solvable for ' + career + ': ' + L.n + ' ledges, next dollar on ledge ' + L.next);
}
{ LQ.state = base(); Object.assign(LQ.state, { region: 'village', flags: {} });
  const reg = LQ.roomRegion('cave1'), m = reg.build(), cells = m.cells, solid = new Set(cells.filter(c => '1234CIT'.includes(c.ch)).map(c => c.tx + ',' + c.ty));
  if (m.W < 20 || m.H < 12) fail('cave: room smaller than the screen');
  const start = [(reg.sx - 8) / 16, (reg.sy - 12) / 16], shut = new Set(solid); cells.filter(c => c.ch === 'D').forEach(c => shut.add(c.tx + ',' + c.ty));
  const a = roomFill(m, start, shut), b = roomFill(m, start, solid), near = (set, c) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => set.has((c.tx + dx) + ',' + (c.ty + dy)));
  '1234I'.split('').forEach(ch => { const c = cells.find(x => x.ch === ch); if (!c || !near(a, c)) fail('cave: cannot reach part ' + ch + ' before the door opens'); });
  const chest = cells.find(c => c.ch === 'C'); if (near(a, chest)) fail('cave: the chest can be reached without lighting the fires'); if (!near(b, chest)) fail('cave: the chest cannot be reached after the door opens');
  console.log('  cave checked'); }
{ LQ.state = base(); Object.assign(LQ.state, { region: 'village', flags: { intro: 1 }, quest: 0, items: [] });
  const near = (set, c) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => set.has((c.tx + dx) + ',' + (c.ty + dy)));
  // the cottage: every prop can be reached, and the crate can always be pushed off the trapdoor
  let reg = LQ.roomRegion('cottage1'), m = reg.build(), cells = m.cells, at = ch => cells.filter(c => c.ch === ch);
  if (m.W < 20 || m.H < 12) fail('cottage: room smaller than the screen');
  const trap = at('H')[0], cSolid = new Set(cells.filter(c => 'bTchN'.includes(c.ch)).map(c => c.tx + ',' + c.ty)), start = [(reg.sx - 8) / 16, (reg.sy - 12) / 16];
  const withCrate = new Set(cSolid); withCrate.add(trap.tx + ',' + trap.ty);
  const a = roomFill(m, start, withCrate);
  'bTch'.split('').forEach(ch => { if (!near(a, at(ch)[0])) fail('cottage: cannot reach ' + ch); });
  const free = (x, y) => !m.solid[y][x] && !cSolid.has(x + ',' + y);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!free(trap.tx - dx, trap.ty - dy) || !a.has((trap.tx - dx) + ',' + (trap.ty - dy)) || !free(trap.tx + dx, trap.ty + dy)) fail('cottage: the crate cannot be pushed off the trapdoor toward ' + [dx, dy]);
  if (roomFill(m, start, cSolid).has(Math.floor(reg.exits[0].x0 / 16) + ',' + Math.floor(reg.exits[0].y0 / 16))) fail('cottage: the night door can be walked through');
  for (const k in LQ.ROOMS.cottage1.from) { const p = LQ.ROOMS.cottage1.from[k]; if (!a.has(p[0] + ',' + p[1])) fail('cottage: arrival spot from ' + k + ' is blocked'); }
  // the cellar: the gate holds, the stamp and seal come before it, and the great door cannot be passed
  reg = LQ.roomRegion('cellar1'); m = reg.build(); cells = m.cells; at = ch => cells.filter(c => c.ch === ch);
  if (m.W < 20 || m.H < 12) fail('cellar: room smaller than the screen');
  const s0 = [(reg.sx - 8) / 16, (reg.sy - 12) / 16], solid = new Set(cells.filter(c => 'QVZPL'.includes(c.ch)).map(c => c.tx + ',' + c.ty)), shut = new Set(solid); at('G').forEach(c => shut.add(c.tx + ',' + c.ty));
  const before = roomFill(m, s0, shut), after = roomFill(m, s0, solid);
  'PZL'.split('').forEach(ch => { if (!near(before, at(ch)[0])) fail('cellar: cannot reach ' + ch + ' before the gate opens'); });
  if (near(before, at('V')[0]) || before.has(at('m')[0].tx + ',' + at('m')[0].ty)) fail('cellar: the gate can be bypassed');
  at('Q').concat(at('V')).forEach(c => { if (!near(after, c)) fail('cellar: cannot reach ' + c.ch); });
  at('o').concat(at('m')).forEach(c => { if (!after.has(c.tx + ',' + c.ty)) fail('cellar: cannot reach ' + c.ch + ' at ' + c.tx + ',' + c.ty); });
  if (!LQ.intro.active()) fail('intro: a new game at stage 1 is not treated as in the opening');
  LQ.state.flags = {}; if (LQ.intro.active()) fail('intro: an old save is treated as in the opening');
  console.log('  cottage and cellar checked'); }
for (const t of LQ.TOOLS) if (!t.consumable && !t.free) fail('tool ' + t.id + ' has no route that costs no coins');
for (const id in LQ.ROOMS) { LQ.state = base(); LQ.state.flags = {}; const rows = LQ.ROOMS[id].rows(LQ.state); if (rows.some(r => r.length !== rows[0].length)) fail('room ' + id + ' has rows of different lengths'); }

// ---- 2b. hands-on activities and the Back Office
console.log('== Activities');
{ const DP = LQ.depth, allOf = o => Object.fromEntries(Object.keys(o).map(k => [k, true]));
  for (const career of Object.keys(LQ.CAREERS)) {
    // Chapter 2: a correctly sorted table must show exactly the itemized figure the return uses.
    LQ.state = base(); Object.assign(LQ.state, { career, rcpt: allOf(LQ.RECEIPTS) });
    const f2 = LQ.fin2(), rows = DP.receiptRows(f2);
    rows.forEach(r => { r.col = r.want; });
    if (DP.pileOf(rows, f2) !== f2.itemized) fail(`${career}: sorted receipts show ${DP.pileOf(rows, f2)}, the return uses ${f2.itemized}`);
    const raffle = rows.find(r => r.kind === 'none'); raffle.col = 0;
    if (DP.pileOf(rows, f2) !== f2.itemized + raffle.amt) fail(career + ': a misplaced receipt does not change the itemized total');
    if (rows.some(r => !r.why || !(r.why.any || (r.why[1] && r.why[2])))) fail(career + ': a receipt has no explanation for a wrong column');
    for (const gig of Object.keys(LQ.GIGS)) {
      // Chapter 3: sorted slips must rebuild Schedule C, and the tax jar must be able to cover the bill.
      LQ.state = base(); Object.assign(LQ.state, { career, gig, q3: 5, est3: 0, rcpt: allOf(LQ.SLIPS) });
      const f3 = LQ.fin3(), slips = DP.slipRows(), cnt = slips.reduce((a, r) => a + (r.want === 0 ? r.amt : r.want === 1 ? r.amt / 2 : 0), 0);
      if (f3.gigBase + f3.tools + cnt !== f3.gigExp) fail(`${career}/${gig}: sorted slips give ${f3.gigBase + f3.tools + cnt}, Schedule C uses ${f3.gigExp}`);
      const personal = slips.reduce((a, r) => a + r.amt, 0) - cnt, need = Math.ceil(f3.gigBill / DP.JAR_STEP) * DP.JAR_STEP;
      if (need > Math.floor((f3.gigProfit - personal) / DP.JAR_STEP) * DP.JAR_STEP) fail(`${career}/${gig}: the tax jar cannot reach the bill of ${f3.gigBill}`);
      if (slips.some(r => !r.why.any)) fail(gig + ': a slip has no explanation');
      // Chapter 4: waiting must start ahead, and the example price drop must be able to put it behind.
      Object.assign(LQ.state, { q3: 8, q4: 2, inv: { st: 0, lt: 0, qd: 900, int: 300 } });
      const H = DP.holdFigures();
      if (!(H.now > H.wait[0])) fail(`${career}/${gig}: selling early costs no extra tax (${H.now} vs ${H.wait[0]})`);
      if (!(H.flip > 0)) fail(`${career}/${gig}: no example price drop outweighs the tax saving (flip ${H.flip})`);
      const before = JSON.stringify(H); Object.assign(LQ.state, { hold4: 1 }); LQ.state.inv.lt += LQ.GLACIER.gain;
      if (JSON.stringify(DP.holdFigures()) !== before) fail(`${career}/${gig}: the sale clock shows different figures on a replay`);
    }
  }
  // Pages 4 to 12: an old finished save is owed the six milestone pages, and a chapter starter the village's three as well.
  LQ.state = base(); Object.assign(LQ.state, { q3: 8, q4: 9, flags: { boss2: true, boss3: true, boss4: true } });
  if (DP.owed(LQ.state).join() !== '5,6,8,9,11,12') fail('old save is owed pages ' + DP.owed(LQ.state).join());
  LQ.state.flags.starter = true; if (DP.owed(LQ.state).join() !== '1,2,3,5,6,8,9,11,12') fail('starter is owed pages ' + DP.owed(LQ.state).join());
  for (const n of [4, 7, 10]) if (DP.PAGES[n].done) fail('activity page ' + n + ' should only come from its activity');
  // The Back Office: what can be reached before and after each lock opens.
  LQ.state = base(); LQ.state.flags = {};
  const rows = LQ.ROOMS.backoffice.rows(LQ.state), find = ch => { for (let y = 0; y < rows.length; y++) { const x = rows[y].indexOf(ch); if (x >= 0) return [x, y]; } };
  const reach = solid => { const [sx, sy] = find('S'), seen = new Set([sx + ',' + sy]), q = [[sx, sy]];
    while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, ch = rows[ny] && rows[ny][nx], k = nx + ',' + ny;
      if (!ch || ch === '#' || solid.includes(ch) || seen.has(k)) continue; seen.add(k); q.push([nx, ny]); } } return seen; };
  const by = (seen, ch) => { const [x, y] = find(ch); return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy))); };
  const start = reach('123DGKRL>mvB');
  for (const ch of '23RLGB') if (!by(start, ch)) fail('back office: cannot reach ' + ch + ' from the door');
  for (const ch of '1Kmv') if (by(start, ch)) fail('back office: ' + ch + ' can be reached before its lock opens');
  if (!by(reach('123GKRL>mvO'), '1')) fail('back office: valve 1 cannot be reached with the crate on the rune');
  const open = reach('123KRL>mvB'); for (const ch of 'Kmv') if (!by(open, ch)) fail('back office: cannot reach ' + ch + ' once the gate opens');
  const [bx, by0] = find('B'), [ox] = find('O'); if (rows[by0][bx + 1] !== '.' || ox >= bx || rows[by0].slice(ox, bx).includes('#')) fail('back office: the crate cannot be pushed onto the rune');
  console.log('  receipt sort, gig budget, sale clock, page recovery and the Back Office checked'); }

// ---- 3. content wiring
console.log('== Wiring');
for (const [name, Q, C] of [['ch3', LQ.QUESTS3, LQ.CH3], ['ch4', LQ.QUESTS4, LQ.CH4]]) {
  Q.forEach((q, i) => { if (q.target && !q.target.startsWith('boss') && !C.npcs.some(n => n.id === q.target)) fail(`${name} quest ${i} targets missing NPC ${q.target}`); });
  Object.values(C.chests).forEach(ch => { if (!LQ.JOURNAL[ch.tip]) fail(name + ' chest tip missing journal ' + ch.tip); });
}
LQ.AUDIT_POOL.forEach(p => { if (!LQ.JOURNAL[p.need]) fail('audit question needs unknown journal entry ' + p.need); if (p.o.length !== 3) fail('audit options ' + p.q); });
const src = ['chapter3', 'chapter4', 'vaults1', 'intro', 'depth', 'backoffice'].map(f => fs.readFileSync(dir + '/js/' + f + '.js', 'utf8')).join('\n');
for (const m of src.matchAll(/LQ\.learn\('([^']+)'\)/g)) if (!LQ.JOURNAL[m[1]]) fail('learn of unknown journal id ' + m[1]);
for (const m of src.matchAll(/LQ\.give\('([^']+)'\)/g)) if (!LQ.ITEMS[m[1]]) fail('give of unknown item id ' + m[1]);
for (const m of src.matchAll(/j: '([^']+)'/g)) if (!LQ.JOURNAL[m[1]]) fail('tip with unknown journal id ' + m[1]);
for (const id of ['slick', 'glint']) { const K = LQ.BOSSES[id]; LQ.state = base(); Object.assign(LQ.state, { gig: 'seller', q3: 6, q4: 7, inv: { st: 0, lt: 4600, qd: 900, int: 300 } }); const fin = K.final(); if (new Set(fin.opts).size !== 3) fail(id + ' final options not distinct'); K.myths().forEach(m => { if (m.opts.length !== 3) fail(id + ' myth options'); }); }
console.log('  journal entries ' + Object.keys(LQ.JOURNAL).length + ', items ' + Object.keys(LQ.ITEMS).length + ', audit questions ' + LQ.AUDIT_POOL.length + ', gear ' + LQ.GEAR.length + ', stocks ' + LQ.STOCKS.length);
console.log(bad ? '\n' + bad + ' PROBLEM(S)' : '\nALL CHECKS PASSED');
if (bad) process.exitCode = 1;
