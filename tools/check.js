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
for (const f of ['taxdata', 'economy', 'household', 'chapter1', 'audit', 'battle', 'chapter2', 'chapter3', 'chapter4', 'world', 'coast', 'canyon', 'summit'])
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
  console.log('  canyon checked, trees ' + r.m.trees.length); }
{ const r = reach(LQ.REGIONS.summit, LQ.CH4, [24, 41]);
  for (const p of [[23, 43], [23, 4], [24, 4], [29, 8]]) if (!r.seen[p[1]][p[0]]) fail('summit: key tile unreachable ' + p);
  const g = reach(LQ.REGIONS.summit, LQ.CH4, [24, 41], [[23, 11], [24, 11]]); if (g.seen[4][23]) fail('summit: the peak can be reached around the ice wall');
  console.log('  summit checked, trees ' + r.m.trees.length); }
{ const r = reach(LQ.REGIONS.coast, LQ.CH2, [24, 2]);
  if (!r.seen[10][47]) fail('coast: East Road exit unreachable');
  const g = reach(LQ.REGIONS.coast, LQ.CH2, [24, 2], [[45, 10], [45, 11]]); if (g.seen[10][47]) fail('coast: the East Road barricade can be bypassed');
  console.log('  coast checked'); }

// ---- 3. content wiring
console.log('== Wiring');
for (const [name, Q, C] of [['ch3', LQ.QUESTS3, LQ.CH3], ['ch4', LQ.QUESTS4, LQ.CH4]]) {
  Q.forEach((q, i) => { if (q.target && !q.target.startsWith('boss') && !C.npcs.some(n => n.id === q.target)) fail(`${name} quest ${i} targets missing NPC ${q.target}`); });
  Object.values(C.chests).forEach(ch => { if (!LQ.JOURNAL[ch.tip]) fail(name + ' chest tip missing journal ' + ch.tip); });
}
LQ.AUDIT_POOL.forEach(p => { if (!LQ.JOURNAL[p.need]) fail('audit question needs unknown journal entry ' + p.need); if (p.o.length !== 3) fail('audit options ' + p.q); });
const src = ['chapter3', 'chapter4'].map(f => fs.readFileSync(dir + '/js/' + f + '.js', 'utf8')).join('\n');
for (const m of src.matchAll(/LQ\.learn\('([^']+)'\)/g)) if (!LQ.JOURNAL[m[1]]) fail('learn of unknown journal id ' + m[1]);
for (const m of src.matchAll(/LQ\.give\('([^']+)'\)/g)) if (!LQ.ITEMS[m[1]]) fail('give of unknown item id ' + m[1]);
for (const m of src.matchAll(/j: '([^']+)'/g)) if (!LQ.JOURNAL[m[1]]) fail('tip with unknown journal id ' + m[1]);
for (const id of ['slick', 'glint']) { const K = LQ.BOSSES[id]; LQ.state = base(); Object.assign(LQ.state, { gig: 'seller', q3: 6, q4: 7, inv: { st: 0, lt: 4600, qd: 900, int: 300 } }); const fin = K.final(); if (new Set(fin.opts).size !== 3) fail(id + ' final options not distinct'); K.myths().forEach(m => { if (m.opts.length !== 3) fail(id + ' myth options'); }); }
console.log('  journal entries ' + Object.keys(LQ.JOURNAL).length + ', items ' + Object.keys(LQ.ITEMS).length + ', audit questions ' + LQ.AUDIT_POOL.length + ', gear ' + LQ.GEAR.length + ', stocks ' + LQ.STOCKS.length);
console.log(bad ? '\n' + bad + ' PROBLEM(S)' : '\nALL CHECKS PASSED');
if (bad) process.exitCode = 1;
