// Adventure pass for Chapters 2 to 4: Notary Lamps beside each boss, and Slick's Stash, a small dungeon in Hustle Canyon.
// The boss movement patterns themselves live in battle.js. See the Nov 13 adventure notes in GAME_DESIGN_PLAN.md.
(() => {
const LQ = window.LQ, T = 16, ui = LQ.ui, P = LQ.parts;
const st = () => LQ.state, say = (w, t) => LQ.say(w, t), sfx = n => LQ.audio.sfx(n);
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
const wrapSpawn = (id, fn) => { const reg = LQ.REGIONS[id], spawn0 = reg.spawn; reg.spawn = (w, s) => { spawn0(w, s); fn(w, s); }; };

// A free, full refill stands beside every boss, so nobody starts a fight hurt and nobody is stuck without coins.
LQ.ADV = { lamps: { coast: [[39, 33]], canyon: [[42, 33], [8, 34]], summit: [[21, 3]] }, stashDoor: [6, 33] };
wrapSpawn('coast', w => LQ.ADV.lamps.coast.forEach(([x, y]) => P.lamp(w, x, y)));
wrapSpawn('summit', w => LQ.ADV.lamps.summit.forEach(([x, y]) => P.lamp(w, x, y)));

// ---------- Slick's Stash: stamp every strongbox that holds taxable income, and leave the one that does not.
const BOXES = [
  { label: 'Cart fares, paid in cash. Nobody sent a form.', inc: true, why: 'Counted. Cash with no form is still income.' },
  { label: 'A birthday gift from Grandma.', inc: false, why: 'A gift is not income to the person who gets it. Leave it out.' },
  { label: 'Pots sold online. Too few sales for a Form 1099-K.', inc: true, why: 'Counted. Sales are income whether or not a form arrives.' },
  { label: 'Tips from a weekend job.', inc: true, why: 'Counted. Tips are income, even small ones.' },
];
LQ.ADV.boxes = BOXES;
let L = null;
const box = i => (w, tx, ty, s) => {
  const b = BOXES[i], e = { type: 'strongbox', box: i, tx, ty, solid: true, base: ty * T + 14, state: s.flags.stash3 && b.inc ? 'in' : '',
    use: () => LQ.script(() => say(null, 'A strongbox. The tag reads: "' + b.label + '"' + (e.state === 'in' ? ' It is counted.' : e.state === 'out' ? ' It is not income.' : ' Strike it with the Truth Stamp (E) if it is income.'))),
    stamp() {
      if (e.state || s.flags.stash3) return;
      if (b.inc) {
        e.state = 'in'; L.count++; sfx('right'); w.burst(tx * T + 8, ty * T + 6, '#ffcf4a', 12, 45); ui.toast(b.why);
        if (L.count >= BOXES.filter(x => x.inc).length) { s.flags.stash3 = true; LQ.save(); if (L.door) L.door.open(); ui.toast('All the income is counted. The back door grinds open.'); }
      } else {
        e.state = 'out'; sfx('wrong'); LQ.shake(.2); ui.toast(b.why + ' A Scrap Imp jumps out!');
        LQ.foes.imp(w, tx, ty + 1);
      }
    },
    draw(g, cx, cy, tm) {
      const x = tx * T - cx, y = ty * T - cy, col = e.state === 'in' ? '#ffcf4a' : e.state === 'out' ? '#5d6478' : '#ff8a3a';
      w.shadow(g, x + 8, y + 15, 13);
      R(g, x + 1, y + 4, 14, 11, '#2c2e5c'); R(g, x + 1, y + 4, 14, 1, col); R(g, x + 1, y + 8, 14, 1, col); R(g, x + 7, y + 7, 2, 4, col);
      R(g, x + 3, y + 1, 10, 3, '#1c1d44'); R(g, x + 3, y + 1, 10, 1, col);
      if (e.state !== 'out') LQ.fx.light(x + 8, y + 8, e.state ? 14 : 10, col, .35 + .1 * Math.sin(tm * 3 + tx));
    } };
  w.ents.push(e); if (L) L.boxes.push(e); return e;
};
LQ.ROOMS.stash3 = {
  title: 'SLICK\'S STASH', sub: 'Which of these is income?', music: 'tide',
  rows() {
    L = LQ.ADV.L = { count: 0, door: null, boxes: [] };
    return [
      '####################',
      '##########C#########',
      '##########D#########',
      '#..................#',
      '#..1...2....3...4..#',
      '#..................#',
      '#.........I........#',
      '####.###############',
      '#T.................#',
      '#..................#',
      '#......m...........#',
      '########.S.#########',
      '#########X##########',
      '####################'];
  },
  on: {
    1: box(0), 2: box(1), 3: box(2), 4: box(3),
    m: (w, tx, ty, s) => { if (!s.flags.stash3) LQ.foes.imp(w, tx, ty, 'stashImp'); },
    T: (w, tx, ty) => P.spitter(w, tx, ty, 1, 0, 1.3),
    D: (w, tx, ty, s) => { if (!s.flags.stash3) L.door = P.door(w, tx, ty, 'A strongroom door. It will open when every box of real income is counted.'); },
    I: (w, tx, ty) => P.plaque(w, tx, ty, 'SLICK\'S RULE: "If nobody sent a form, it never happened." Prove him wrong. Stamp each strongbox that holds income. Leave anything that is not income.', '#ff8a3a'),
    C: (w, tx, ty, s) => w.ents.push({ type: 'cache', tx, ty, solid: true, base: ty * T + 14,
      use: () => LQ.script(async () => {
        if (s.flags.stash3Chest) return say(null, 'Empty. You already took what was inside.');
        s.flags.stash3Chest = true; s.flags.tonics = (s.flags.tonics || 0) + 1; w.burst(tx * T + 8, ty * T + 6, '#f3c531', 14, 45);
        await say(null, 'Inside: a pouch of coins, a tonic, and a note in Slick\'s hand. "Three boxes. Zero forms. Zero tax." He was wrong about the last part.');
        LQ.gain(0, 40, 'Slick\'s Stash'); LQ.save();
      }),
      draw(g, cx, cy) { g.drawImage(LQ.prop('chest', 'summer', s.flags.stash3Chest ? 1 : 0), tx * T - 1 - cx, ty * T - cy); } }),
  },
  arrive: async () => { if (!st().flags.stashSeen) { st().flags.stashSeen = true; await say(null, 'Slick\'s hideout. Strongboxes line the back room, each with a tag. A carved mouth spits fog across the passage. Time your crossing.'); } },
};
// keep the ground in front of the door and its lamp free of palms
const canyon = LQ.REGIONS.canyon, build0 = canyon.build;
canyon.build = () => {
  const m = build0();
  for (const [x, y] of [[5, 34], [6, 34], [7, 34], [8, 34], [6, 35], [7, 35], [9, 34], [10, 34]]) { m.solid[y][x] = false; m.trees = m.trees.filter(t => !(t.x === x && t.y === y)); }
  return m;
};
wrapSpawn('canyon', (w, s) => {
  LQ.ADV.lamps.canyon.forEach(([x, y]) => P.lamp(w, x, y));
  const [dx, dy] = LQ.ADV.stashDoor;
  w.ents.push({ type: 'stashdoor', tx: dx, ty: dy, solid: true, base: (dy + 1) * T - 1,
    use: () => LQ.script(async () => {
      if (s.q3 == null || s.q3 < 1) return say(null, 'A plank door set in the red rock. It is barred from inside. Someone in there is counting.');
      await w.enterRoom('stash3');
    }),
    draw(g, cx, cy, tm) {
      const x = dx * T - cx, y = dy * T - cy, c = s.flags.stash3Chest ? '#5d6478' : '#ff8a3a';
      R(g, x + 1, y - 2, 14, 18, '#05050f'); R(g, x + 1, y - 2, 14, 1, c); R(g, x + 1, y - 2, 1, 18, c); R(g, x + 14, y - 2, 1, 18, c);
      R(g, x + 5, y + 3, 6, 1, c); R(g, x + 7, y + 5, 2, 5, c);
      if (!s.flags.stash3Chest) LQ.fx.light(x + 8, y + 6, 16, '#ff8a3a', .3 + .1 * Math.sin(tm * 2));
    } });
  P.plaque(w, 4, 34, () => s.flags.stash3Chest ? 'SLICK\'S STASH. Emptied, counted, and reported.' : 'SLICK\'S STASH. Keep out. Nothing in here was ever reported.', '#ff8a3a');
});
// ---------- storefronts: every shopkeeper gets a coin banner, every broker a ticker board, so both read at a glance
const SHOPS = { merchant: 1, trader: 1 }, BROKERS = { broker: 1, quay: 1 };
const banner = (w, tx, ty) => w.ents.push({ type: 'shopsign', tx, base: ty * T + 2,
  draw(g, cx, cy, tm) {
    const x = tx * T - cx, y = ty * T - cy, sway = Math.round(Math.sin(tm * 2 + tx) * 1);
    R(g, x + 7, y - 30, 2, 32, '#42458a'); R(g, x + 3, y - 31, 12, 2, '#ffcf4a');
    for (let i = 0; i < 4; i++) R(g, x + 3 + i * 3 + sway, y - 29, 3, 16 - (i % 2) * 2, i % 2 ? '#fdf8e7' : '#ff4fb0');
    R(g, x + 6 + sway, y - 25, 6, 6, '#ffcf4a'); R(g, x + 7 + sway, y - 24, 4, 4, '#fff3b0'); R(g, x + 8 + sway, y - 24, 2, 4, '#c98a3c');
    LQ.fx.light(x + 9, y - 22, 16, '#ffcf4a', .4);
  } });
const ticker = (w, tx, ty) => w.ents.push({ type: 'ticker', tx, base: ty * T + 2,
  draw(g, cx, cy, tm) {
    const x = tx * T - cx, y = ty * T - cy;
    R(g, x + 2, y - 26, 2, 28, '#42458a'); R(g, x + 28, y - 26, 2, 28, '#42458a');
    R(g, x, y - 30, 32, 20, '#0b0c24'); R(g, x, y - 30, 32, 1, '#35f0e6'); R(g, x, y - 11, 32, 1, '#35f0e6');
    const pts = [14, 12, 15, 9, 11, 6, 8, 3];   // a price line that climbs, with one dip
    pts.forEach((h, i) => R(g, x + 3 + i * 3, y - 28 + h, 3, 1, i === 2 || i === 4 ? '#ff4fb0' : '#7fd6a8'));
    const k = Math.floor(tm * 3) % 8; R(g, x + 3 + k * 3, y - 29 + pts[k], 3, 3, '#ffffff');
    R(g, x + 3, y - 14, 5, 2, '#7fd6a8'); R(g, x + 10, y - 14, 5, 2, '#ff4fb0'); R(g, x + 17, y - 14, 5, 2, '#7fd6a8'); R(g, x + 24, y - 14, 5, 2, '#ffcf4a');
    LQ.fx.light(x + 16, y - 20, 20, '#35f0e6', .4);
  } });
for (const id of ['village', 'coast', 'canyon', 'summit']) wrapSpawn(id, w => {
  for (const n of LQ.REGIONS[id].content().npcs) {
    if (SHOPS[n.id]) banner(w, n.tx + 1, n.ty);
    else if (BROKERS[n.id]) ticker(w, n.tx, n.ty - 1);
  }
});

// ---------- enterable houses: one per later region, each with a small optional puzzle and a chest
// The door is the right-hand door tile of a building, so the villager standing at the left one is never in the way.
const chest = (flag, coins, tonic, text) => (w, tx, ty, s) => w.ents.push({ type: 'cache', tx, ty, solid: true, base: ty * T + 14,
  use: () => LQ.script(async () => {
    if (s.flags[flag]) return say(null, 'Empty. You already took what was inside.');
    s.flags[flag] = true; if (tonic) s.flags.tonics = (s.flags.tonics || 0) + 1; w.burst(tx * T + 8, ty * T + 6, '#f3c531', 14, 45);
    await say(null, text); LQ.gain(0, coins, 'House chest'); LQ.save();
  }),
  draw(g, cx, cy) { g.drawImage(LQ.prop('chest', 'summer', s.flags[flag] ? 1 : 0), tx * T - 1 - cx, ty * T - cy); } });
let H = null;
const HOUSE_ROWS = mid => ['############', '#####C######', '#####D######', '#..........#', mid, '#..........#', '#....I.....#', '#####S######', '#####X######', '############'];
// Shelter Coast, your sea cottage: push the savings crate onto the rune. "Pay yourself first."
LQ.ROOMS.house2 = {
  title: 'YOUR SEA COTTAGE', sub: 'Pay yourself first', music: 'coast', floor: 'p',
  rows() { H = { door: null, plate: null, crate: null }; return HOUSE_ROWS('#..b....O..#'); },
  on: {
    b: (w, tx, ty) => { H.crate = P.block(w, tx, ty); },
    O: (w, tx, ty) => { H.plate = P.plate(w, tx, ty, '#ffcf4a'); },
    D: (w, tx, ty, s) => { if (!s.flags.house2) H.door = P.door(w, tx, ty, 'The cupboard is latched. A rune on the floor is shaped like a coin crate.'); },
    I: (w, tx, ty) => P.plaque(w, tx, ty, 'Marlowe\'s note: "Payday rule. Before we spend a coin, the savings crate goes on its spot. Push it over, would you?"'),
    C: chest('house2Chest', 30, true, 'Inside the cupboard: 30 coins of rainy-day money and a tonic. Saving first means it is there when you need it.'),
  },
  tick(w, s) {
    if (!H.plate || !H.crate) return;
    H.plate.on = H.crate.tx === H.plate.tx && H.crate.ty === H.plate.ty;
    if (H.plate.on && !s.flags.house2) { s.flags.house2 = true; H.crate.locked = true; if (H.door) H.door.open(); ui.toast('Savings first. The cupboard unlatches.'); LQ.save(); }
  },
};
// Hustle Canyon, the depot back room: two bills on the wall. Stamp the one that has to be paid first.
const bill = (need, label, why) => (w, tx, ty, s) => P.seal(w, tx, ty, () => {
  if (s.flags.house3) return;
  if (need) { s.flags.house3 = true; sfx('right'); if (H.door) H.door.open(); ui.toast(why); LQ.save(); }
  else { sfx('wrong'); ui.toast(why); }
}, 'A bill pinned to the wall: "' + label + '" Strike it with the Truth Stamp (E) if it must be paid first.');
LQ.ROOMS.house3 = {
  title: 'THE DEPOT BACK ROOM', sub: 'Needs before wants', music: 'canyon', floor: 'p',
  rows() { H = { door: null }; return HOUSE_ROWS('#..1....2..#'); },
  on: {
    1: bill(false, 'New riding boots. On sale today only!', 'Boots on sale are a want. They can wait until the needs are paid.'),
    2: bill(true, 'Rent for the month. Due Friday.', 'Rent is a need. Needs get paid first. The strongbox clicks open.'),
    D: (w, tx, ty, s) => { if (!s.flags.house3) H.door = P.door(w, tx, ty, 'The lost-and-found locker. It opens for whoever sorts the bills on the wall.'); },
    I: (w, tx, ty) => P.plaque(w, tx, ty, 'DEPOT RULE: "One pay packet, two bills. Stamp the one that has to be paid first."'),
    C: chest('house3Chest', 30, false, 'Inside the locker: 30 coins nobody claimed. Paying needs first keeps the lights on. Wants come out of what is left.'),
  },
};
// Summit of Gains, your lodge: light the hearth to rest for free, and the warm air frees the frozen trunk.
LQ.ROOMS.house4 = {
  title: 'YOUR LODGE', sub: 'A warm fire costs nothing here', music: 'summit', floor: 'p',
  rows() { H = { door: null }; return HOUSE_ROWS('#....F.....#'); },
  on: {
    F: (w, tx, ty, s) => { const e = P.brazier(w, tx, ty, '#ff8a3a', async b => LQ.script(async () => {
      const K = LQ.kit, full = K.hp() >= K.maxHp(); b.lit = true; s.hp = K.maxHp(); sfx('learn');
      if (!s.flags.house4) { s.flags.house4 = true; if (H.door) H.door.open(); }
      await say(null, full ? 'The hearth crackles. The ice on the trunk in the alcove melts away.' : 'You rest by the hearth. Every heart is full again, and it cost nothing. The ice on the trunk melts away.');
      LQ.save();
    })); e.lit = !!s.flags.house4; },
    D: (w, tx, ty, s) => { if (!s.flags.house4) H.door = P.door(w, tx, ty, 'The alcove is frozen shut. The room is cold. The hearth is unlit.'); },
    I: (w, tx, ty) => P.plaque(w, tx, ty, 'Coral\'s drawing of the family by a fire. Underneath: "Home is the one place rest is free."'),
    C: chest('house4Chest', 20, true, 'Inside the trunk: 20 coins and a tonic, packed by Marlowe "for the climb".'),
  },
};
LQ.ADV.houses = { coast: ['seacot', 'house2'], canyon: ['c3depot', 'house3'], summit: ['c4lodge', 'house4'] };
for (const id in LQ.ADV.houses) wrapSpawn(id, (w, s) => {
  const [bid, room] = LQ.ADV.houses[id], b = LQ.REGIONS[id].buildings.find(x => x.id === bid), tx = b.x + 3, ty = b.y + 2;
  w.ents.push({ type: 'housedoor', room, tx, ty, solid: true, base: (ty + 1) * T,
    use: () => LQ.script(() => w.enterRoom(room)),
    draw(g, cx, cy, tm) {
      const x = tx * T - cx, y = ty * T - cy, done = s.flags[room + 'Chest'], c = done ? '#5d6478' : '#7fd6a8';
      R(g, x + 2, y + 1, 12, 15, '#0b0c24'); R(g, x + 2, y + 1, 12, 1, c); R(g, x + 2, y + 1, 1, 15, c); R(g, x + 13, y + 1, 1, 15, c); R(g, x + 10, y + 9, 2, 2, '#ffcf4a');
      if (!done) LQ.fx.light(x + 8, y + 8, 14, '#7fd6a8', .35 + .1 * Math.sin(tm * 2));
    } });
});

(LQ.RUMORS.canyon = LQ.RUMORS.canyon || []).push({ id: 'stash3', done: s => !!s.flags.stash3Chest,
  text: 'Slick keeps a stash south-west of the creek bridge, in the red rock below the water. Bring your Truth Stamp. They say every box in there is cash nobody reported.' });
})();
