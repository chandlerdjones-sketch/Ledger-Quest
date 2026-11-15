// Side jobs: the optional work in each region, listed in the Quest tab and marked in the world with a green gem.
// Also the three stops that put that work on the main path: a first shift before Paymaster Pim, a first gig run before
// Teller Mesa, and a look at "last moves" in the Driftwood Bazaar before the joint return is filed.
// No tax math lives here. Every figure comes from LQ.cur(). See the batch 3 notes in GAME_DESIGN_PLAN.md.
(() => {
const LQ = window.LQ, T = 16, ui = LQ.ui, F = LQ.F, D = LQ.docs;
const st = () => LQ.state, M = n => LQ.money(n), say = (...a) => LQ.say(...a);
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
const npc = (ch, id) => LQ[ch].npcs.find(n => n.id === id);
const wrapSpawn = (id, fn) => { const reg = LQ.REGIONS[id], spawn0 = reg.spawn; reg.spawn = (w, s) => { spawn0(w, s); fn(w, s); }; };

// ---------- the list
const CHAPTER = { village: ['CH1', ''], coast: ['CH2', ''], canyon: ['CH3', 'c3'], summit: ['CH4', 'c4'] };
const FOOLED = { rowan: 'fixRowan', basil: 'fixBasil', maple: 'fixMaple' };
const tipIds = region => Object.keys(LQ[CHAPTER[region][0]].tips);
const tipDone = (s, region, id) => !!s.tips[CHAPTER[region][1] + id];
const tipsLeft = (s, region) => tipIds(region).filter(id => !tipDone(s, region, id)).length;
const chestIds = region => Object.keys(LQ[CHAPTER[region][0]].chests);
const chestsLeft = (s, region) => chestIds(region).filter(id => !s.chests[id]).length;
const tally = (left, all) => (all - left) + ' of ' + all;
const tips = region => ({ name: 'Collect expert tips', done: s => !tipsLeft(s, region), note: s => tally(tipsLeft(s, region), tipIds(region).length),
  text: 'Townsfolk under a green gem have a tip to share. Answer their question and they pay 30 coins and write the tip in your Tax Journal.' });
const chests = region => ({ name: 'Open the chests', done: s => !chestsLeft(s, region), note: s => tally(chestsLeft(s, region), chestIds(region).length),
  text: 'Chests are tucked into the corners of the map. Each holds 40 coins and a scroll for your Tax Journal.' });
const fooledLeft = s => Object.values(FOOLED).filter(f => !s.flags[f]).length;
const JOBS = {
  village: [
    { name: 'Work a shift', show: s => s.quest >= 2 && s.w4 != null, done: s => !LQ.jobs.left(s), note: s => LQ.jobs.left(s) + ' paid left',
      text: 'The shift board beside the Work Hall, west of the plaza. Thirty seconds at your own job. A full shift pays about as much as a payday, and the pay stub shows what your own tax choice held back. Two paid shifts are posted after each quest step.' },
    { name: 'Light the Lantern Cave', done: s => !!s.flags.cave1, rumor: 'v1stones',
      text: 'A dark cave east of Bracket Mountain. It wants a light, and its fires lit in the right order. A torn page of the Great Ledger is inside.' },
    { name: 'Free three villagers', done: s => !fooledLeft(s), note: s => tally(fooledLeft(s), 3), rumor: 'v1fooled',
      text: 'The fog still has Rowan, Cook Basil and Granny Maple believing the Baron. Each one needs a different tool from your Field Kit. Granny Maple thanks you with a discount at the Saffron Bazaar.' },
    { name: 'Find the hidden cache', done: s => !!s.flags.cache1, rumor: 'v1cache',
      text: 'Something is hidden in the woods north-west of the village, across the river. The Bracket Compass points at what is hidden.' },
    tips('village'), chests('village'),
  ],
  coast: [
    { name: 'Open your cottage cupboard', done: s => !!s.flags.house2Chest,
      text: 'Your sea cottage has a door you can walk through. It glows green until the chest inside is yours. The puzzle inside is about paying yourself first.' },
    tips('coast'), chests('coast'),
  ],
  canyon: [
    { name: 'Work a gig run', show: s => !!s.gig, done: s => !LQ.money2.left(s), note: s => LQ.money2.left(s) + ' paid left',
      text: 'The gig board just south of the plaza. Thirty seconds of your own side gig. The slip shows what you earned, what the job cost, and what goes in the tax jar. Two paid runs are posted after each quest step.' },
    { name: 'Count the boxes in Slick\'s Stash', done: s => !!s.flags.stash3Chest, rumor: 'stash3',
      text: 'Slick keeps a stash somewhere near the creek. Every strongbox in it has a tag. Stamp the ones that hold taxable income and leave the one that does not.' },
    { name: 'Sort the depot back room', done: s => !!s.flags.house3Chest,
      text: 'The depot has a back room behind the door that glows green. Two bills hang on the wall. Stamp the one that has to be paid first.' },
    tips('canyon'), chests('canyon'),
  ],
  summit: [
    { name: 'Light your lodge hearth', done: s => !!s.flags.house4Chest,
      text: 'Your lodge has a door that glows green. Light the hearth to rest for free, and see what the warm air frees.' },
    tips('summit'), chests('summit'),
  ],
};
const rumorOf = (region, id) => (LQ.RUMORS[region] || []).find(r => r.id === id);
// Rows for the Quest tab. `title` and `text` are what the menu reader shows.
LQ.sideJobs = (s = st()) => (JOBS[s.region] || []).filter(j => s.quest >= 1 && (!j.show || j.show(s))).map(j => {
  const done = j.done(s), note = j.note ? j.note(s) : '', r = j.rumor && s.flags['rumor_' + j.rumor] ? rumorOf(s.region, j.rumor) : null;
  return { title: j.name, done, note, text: j.text + (done ? '\n\nDone' + (note ? ' for now.' : '.') : '') + (r && !done ? '\n\nThe rumor you bought: ' + r.text : j.rumor && !done ? '\n\nShops sell a rumor with better directions.' : '') };
});
LQ.SIDEJOBS = JOBS;

// ---------- green gems over side jobs that still have something to give
const gem = (w, tx, ty, lift, on) => w.ents.push({ type: 'sidegem', tx, base: ty * T + 15.5, draw(g, cx, cy, tm) {
  if (!on()) return;
  const x = tx * T + 8 - cx, y = ty * T - lift - cy + Math.round(Math.sin(tm * 4 + tx) * 1.5);
  R(g, x - 1, y - 4, 2, 8, '#2f9b6c'); R(g, x - 3, y - 2, 6, 4, '#2f9b6c'); R(g, x - 2, y - 3, 4, 6, '#7fd6a8'); R(g, x - 1, y - 2, 2, 2, '#eafff4');
} });
for (const region in JOBS) wrapSpawn(region, (w, s) => {
  const open = () => s.quest >= 1 && !LQ.intro?.active();
  for (const e of w.ents.slice()) {
    if (e.type === 'npc' && LQ[CHAPTER[region][0]].tips[e.npc.id]) { const id = e.npc.id;
      gem(w, e.tx, e.ty, 20, () => open() && !tipDone(s, region, id) && !(FOOLED[id] && !s.flags[FOOLED[id]]) && w.questTarget() !== id); }
    else if (e.type === 'board') gem(w, e.tx, e.ty, 18, () => open() && s.quest >= 2 && s.w4 != null && LQ.jobs.left(s) > 0 && w.questTarget() !== 'shiftboard');
    else if (e.type === 'gigboard') gem(w, e.tx, e.ty, 18, () => !!s.gig && !!s.flags.gR && LQ.money2.left(s) > 0);
    else if (e.type === 'cavedoor') gem(w, e.tx, e.ty, 10, () => open() && !s.flags.cave1);
    else if (e.type === 'housedoor') gem(w, e.tx, e.ty, 8, () => !s.flags[e.room + 'Chest']);
    else if (e.type === 'stashdoor') gem(w, e.tx, e.ty, 10, () => !s.flags.stash3Chest);
  }
  w.ents.push({ type: 'logic', tx: 0, base: -9999, step() {
    if (s.flags.sideTold || !open() || LQ.busy || ui.menu || !LQ.sideJobs(s).length) return;
    s.flags.sideTold = true; ui.toast('Green gems mark side jobs. Press J to see the list for this region.');
  } });
});

// ---------- last moves: what one more purchase would do to this year's return. Nothing is bought here.
LQ.lastMoves = async who => {
  const s = st(), now = LQ.cur(), owed = now.diff < 0;
  const rows = LQ.gearFor().filter(g => !LQ.has(g.id) && (!g.needs || LQ.has(g.needs))).map(g => {
    s.gear.push(g.id); const cut = now.total - LQ.cur().total; s.gear.pop();
    return { g, cut, price: LQ.shopPrice(g.price) };
  }).filter(r => r.cut > 0).sort((a, b) => b.cut - a.cut).slice(0, 6);
  const best = rows.filter(r => r.price <= s.coins).sort((a, b) => b.cut / b.price - a.cut / a.price)[0];
  ui.doc = { draw(c) {
    D.paper(c, 60, 20, 840, 350, 'LAST MOVES BEFORE YOU FILE', 'You have ' + s.coins + ' coins');
    D.line(c, 90, 70, 780, 'If you filed today', (owed ? 'You would owe ' : 'Refund of ') + M(Math.abs(now.diff)), { size: 25, vcolor: owed ? '#b0332e' : '#1f6f5c' });
    D.rule(c, 90, 102, 780);
    if (!rows.length) ui.text(c, 'Nothing left on these shelves would change this return.', 480, 180, '#4a4172', F(24), 'center', 760);
    rows.forEach((r, i) => D.line(c, 90, 112 + i * 29, 780, r.g.name + '   ' + r.price + ' coins', 'tax falls ' + M(r.cut), { size: 23, color: r.price <= s.coins ? '#1f6f5c' : '#6a6490' }));
    D.rule(c, 90, 292, 780);
    ui.text(c, 'Green: you can afford it today. What you own when you file is what counts.', 480, 300, '#4a4172', F(22), 'center', 780);
    ui.text(c, 'Anything not listed leaves this year\'s tax as it is.', 480, 324, '#4a4172', F(22), 'center', 780);
  } };
  await LQ.pressOk(); ui.doc = null;
  if (s.q2 != null && s.q3 == null) s.flags.lastMoves2 = true;
  LQ.save();
  await say(who, !rows.length ? 'You already hold everything on my shelves that moves your tax. File with a clear head.'
    : best ? `One example. The ${best.g.name} is ${best.price} coins and would take ${M(best.cut)} off your tax. Buy it or keep your coins. Both are fair choices, and now you know the price of each.`
    : 'None of those is in reach today. That is no failure. Shifts, gig runs and side jobs are how the coins get there, and next year\'s return will still be open.');
};
const extras0 = LQ.shopExtras;
LQ.shopExtras = () => [{ label: 'Compare  -  free  (what each item would do to my tax)', run: who => LQ.lastMoves(who) }].concat(extras0());

// ---------- the three required stops
const worked = s => s.flags.shiftQ != null;                    // a paid shift has been worked at some point
const STOPS = [
  { on: s => s.q2 == null && s.quest === 2 && s.w4 != null && !worked(s), short: 'Work your first shift', text: 'Work a shift at the board beside the Work Hall', target: 'shiftboard' },
  { on: s => s.q2 === 7 && s.q3 == null && !s.flags.lastMoves2, short: 'Check your last moves', text: 'See what a last purchase would do at the Driftwood Bazaar', target: 'trader' },
  { on: s => s.q3 === 1 && s.q4 == null && !s.flags.gR, short: 'Work your first gig run', text: 'Work a run at the gig board just south of the plaza', target: 'gigboard' },
];
const stop = (s = st()) => STOPS.find(x => x.on(s));
const curQuest0 = LQ.curQuest;
LQ.curQuest = () => { const q = curQuest0(), x = q && stop(); return x ? Object.assign({}, q, { short: x.short, text: x.text, target: x.target }) : q; };
LQ.sideStop = stop;

const talk1 = LQ.CH1.talk, talk2 = LQ.CH2.talk, talk3 = LQ.CH3.talk;
LQ.CH1.talk = async id => {
  if (id === 'pim' && stop() === STOPS[0]) return say(npc('CH1', 'pim'), LQ.career().kind === 'se'
    ? 'Nothing to read yet! Your shop has not sold a candle. Work a shift at the board beside the Work Hall, then bring me the numbers.'
    : 'Nothing to read yet! You have not worked a day. Work a shift at the board beside the Work Hall, then bring me your pay stub.');
  return talk1(id);
};
LQ.CH2.talk = async id => {
  if (stop() === STOPS[1]) {
    if (id === 'fathom') return say(npc('CH2', 'fathom'), 'Not yet. The year is still open, and whatever you own when you file goes on this return. Stop at the Driftwood Bazaar and see what one last purchase would do. Buying is up to you.');
    if (id === 'trader') await LQ.lastMoves(npc('CH2', 'trader'));
  }
  return talk2(id);
};
LQ.CH3.talk = async id => {
  if (id === 'mesa' && stop() === STOPS[2]) return say(npc('CH3', 'mesa'), 'Count what? You have not earned a coin out here yet. Work a run at the gig board just south of the plaza, then come and see what it looks like on paper.');
  return talk3(id);
};
// Finishing the stop says where to go next.
const after = (obj, key, i) => { const run0 = obj[key]; obj[key] = async (...a) => { const was = stop() === STOPS[i]; await run0.apply(obj, a); if (was && stop() !== STOPS[i]) ui.toast('Next: ' + LQ.curQuest().text); }; };
after(LQ.jobs, 'run', 0); after(LQ.money2, 'run', 2);
})();
