// Paystub Village adventure content: the Bracket Vault, the Lantern Cave, the hidden cache, and the first three Ledger Pages.
(() => {
const LQ = window.LQ, T = 16, ui = LQ.ui, P = LQ.parts, M = n => LQ.money(n);
const st = () => LQ.state, say = LQ.say, sfx = n => LQ.audio.sfx(n);
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
const pct = r => Math.round(r * 100) + '%';
const COL = { gold: '#ffcf4a', magenta: '#ff4fb0', cyan: '#35f0e6', violet: '#9b6bff' };

Object.assign(LQ.ITEMS, {
  stamp: { name: 'Truth Stamp', desc: 'An honest mark. Press E to swing it. It scatters Scrap Imps and sets off wall seals. Myth Wisps cannot be struck.' },
  pages: { name: 'Torn Ledger Pages', desc: 'Pages torn from the Great Ledger, which once held the plain truth about money. The fog retreats wherever a page is recovered. There are twelve.' },
  invoice1: { name: 'Fog Invoice', desc: '"40 crates of Premium Fog. Paid in full. Deliver to: B. Befuddle, Bracket Mountain." The supplier\'s name has been scratched out.' },
  stub1: { name: 'Ledger Stub', desc: 'The stub left where pages were torn out. "Pages 1 through 12 removed by order of..." The rest is missing.' },
  breturn: { name: "Basil's Unfiled Return", desc: 'Finished, signed, and never sent. Registrar Juno at Town Hall takes returns.' },
  oldlantern: { name: 'Old Lantern', desc: 'A dented miner\'s lantern that still burns. It lights dark places and keeps Myth Wisps away.' },
});
LQ.ITEMS.shield.desc += ' In the field: hold E while facing a fog bolt to block it.';
LQ.ITEMS.compass.desc += ' In the field: press E to reveal hidden things nearby.';

const pageGot = n => { st().flags['page' + n] = true; LQ.give('pages'); sfx('fanfare'); ui.toast('Ledger Page recovered: ' + LQ.pages() + ' of 12'); };

// ---------- the village map
const STONES = [
  { tx: 5, ty: 26, col: 'gold', text: 'A weathered rune stone by the Work Hall. A gold rune glows above ONE notch. Below it: "Earned."' },
  { tx: 17, ty: 24, col: 'magenta', text: 'A weathered rune stone by the Paymaster. A magenta rune glows above TWO notches. Below it: "Held back."' },
  { tx: 15, ty: 34, col: 'cyan', text: 'A weathered rune stone by your cottage. A cyan rune glows above THREE notches. Below it: "Kept."' },
  { tx: 32, ty: 34, col: 'violet', text: 'A weathered rune stone by Town Hall. A violet rune glows above FOUR notches. Below it: "Returned."' },
];
const POSTS = [[22, 18], [25, 18], [22, 34], [25, 33]];
const V = LQ.V1 = {
  STONES, DOOR: { vault: [27, 11], cave: [40, 8], cache: [6, 7], falsetree: [6, 11] }, LAMPS: [[28, 12], [42, 9]],
  FIX: { cart: [38, 15], stall: [[2, 25], [3, 25]], porch: [11, 33], board: [6, 24] },
  // Called while the village map is built, before trees are planted.
  carve(m) {
    const keep = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m.keep[y][x] = true; };
    keep(3, 12, 44, 13);                                    // a walkable north bank
    keep(6, 10, 6, 11); keep(4, 6, 9, 9);                   // the hidden corridor and clearing
    for (let y = 5; y <= 11; y++) for (let x = 3; x <= 10; x++) {                                             // walled in by pines on every side
      if (m.keep[y][x] || m.solid[y][x]) continue;
      m.trees.push({ x, y, kind: 'pine' }); m.solid[y][x] = true;
    }
    for (let y = 6; y <= 8; y++) for (let x = 39; x <= 41; x++) { m.g[y][x] = '#'; m.solid[y][x] = true; }   // rock outcrop for the cave mouth
    keep(38, 9, 42, 11);
    keep(7, 13, 8, 14); keep(7, 17, 8, 18);                 // landings for the west bridge
    for (const y of [14, 15]) { m.g[y][38] = 'b'; m.solid[y][38] = false; }                                  // the east footbridge, blocked by Rowan's cart
    keep(38, 13, 38, 13); keep(38, 16, 38, 16); keep(2, 25, 3, 26); keep(9, 33, 13, 33); keep(6, 24, 6, 24);
    STONES.forEach(s => keep(s.tx, s.ty, s.tx, s.ty)); POSTS.forEach(p => keep(p[0], p[1], p[0], p[1]));
  },
  // The west bridge rises when the third page is recovered. The map is shared between save slots, so keep it in step.
  syncBridge(w) {
    const m = w.map, want = !!st().flags.page3; if (!!m.bridge2 === want) return;
    for (const x of [7, 8]) { const off = Math.round(Math.sin(x / 4)); for (const y of [14 + off, 15 + off]) { m.g[y][x] = want ? 'b' : 'w'; m.solid[y][x] = !want; } }
    m.bridge2 = want; delete w.grounds['village|summer']; delete w.grounds['village|winter']; w.setSeason(st().season);
  },
  async altamiraIntro(who, f) {
    const s = st();
    if (!s.flags.vaultGo) {
      await say(who, 'So. You have come to learn the mountain. Most people fear it because they believe one lie: that climbing higher costs you everything below.');
      await say(who, 'I could draw you a chart. Better that you feel it in your hands. The Bracket Vault lies behind the sealed door in the rock, just east of me.');
      await say(who, `Inside are crates holding your taxable income of ${M(f.taxable)}. Fill the ledges from the bottom. Then stand where your next dollar would land.`);
      s.flags.vaultGo = true; sfx('rumble'); ui.toast('The vault door unseals');
    } else await say(who, 'The vault door is in the rock face just east of here. Fill the ledges from the bottom, then come back to me.');
  },
};

const mark = (g, x, y, tm) => g.drawImage(LQ.prop('mark'), x + 5, y - 14 + Math.round(Math.sin(tm * 6) * 2));
function addVillage(w, s) {
  V.syncBridge(w);
  if (s.quest >= 1 && !s.items.includes('stamp')) s.items.push('stamp');
  // your own front door. Home has a bed that mends hearts, and a cellar.
  w.ents.push({ type: 'homedoor', qid: 'ledgerhome', tx: 16, ty: 33, solid: true, base: -9999, use: () => LQ.script(() => w.enterRoom('cottage1')), draw() {} });
  // the Bracket Vault door, in the rock east of Sage Altamira
  w.ents.push({ type: 'vaultdoor', qid: 'vault1', tx: 27, ty: 11, solid: true, base: 12 * T - 1,
    use: () => LQ.script(async () => {
      if (s.quest < 6 || (s.quest === 6 && !s.flags.vaultGo)) return say(null, 'A sealed door in the rock, carved with seven steps. It does not open. Perhaps the sage on the bridge path knows why.');
      await w.enterRoom('vault1');
    }),
    draw(g, cx, cy, tm) {
      const x = 27 * T - cx, y = 11 * T - cy, open = s.quest > 6 || s.flags.vaultGo, c = open ? '#ffcf4a' : '#42458a';
      R(g, x + 1, y - 2, 14, 18, '#0b0c24'); R(g, x + 1, y - 2, 14, 1, c); R(g, x + 1, y - 2, 1, 18, c); R(g, x + 14, y - 2, 1, 18, c);
      for (let i = 0; i < 4; i++) R(g, x + 3 + i * 2, y + 11 - i * 3, 9 - i * 2, 1, c);
      if (open) LQ.fx.light(x + 8, y + 6, 18, '#ffcf4a', .4 + .1 * Math.sin(tm * 2));
      if (w.questTarget() === 'vault1') mark(g, x, y - 8, tm);
    } });
  P.lamp(w, 28, 12);
  // the Lantern Cave mouth, in the rocks east of the mountain
  w.ents.push({ type: 'cavedoor', tx: 40, ty: 8, solid: true, base: 9 * T - 1,
    use: () => LQ.script(async () => {
      if (!LQ.kit.hasLantern()) return say(null, 'A cave mouth, black as a closed ledger. You cannot see one step inside. You need a lantern. Merchant Saffron sells one and rents one, and they say an old one is hidden in the north-west woods.');
      await w.enterRoom('cave1');
    }),
    draw(g, cx, cy, tm) {
      const x = 40 * T - cx, y = 8 * T - cy;
      R(g, x + 1, y, 14, 16, '#05050f'); R(g, x + 3, y - 2, 10, 2, '#05050f'); R(g, x + 1, y, 1, 16, '#9b6bff'); R(g, x + 14, y, 1, 16, '#9b6bff'); R(g, x + 3, y - 2, 10, 1, '#9b6bff');
      LQ.fx.light(x + 8, y + 8, 16, '#9b6bff', .3 + .1 * Math.sin(tm * 1.5));
    } });
  P.lamp(w, 42, 9);
  // a pine that is not a pine. Only the Bracket Compass shows the truth.
  if (!s.flags.v1path) w.ents.push({ type: 'falsetree', hidden: true, tx: 6, ty: 11, solid: true, base: 12 * T - 2,
    use: () => LQ.script(() => say(null, 'A pine tree. Something about it is not quite right. Its needles never move.')),
    reveal() { s.flags.v1path = true; sfx('learn'); w.burst(6 * T + 8, 11 * T, '#35f0e6', 26, 60); w.remove(this); ui.toast('The compass cuts through the illusion. A hidden path!'); LQ.save(); },
    draw(g, cx, cy, tm) {
      g.drawImage(LQ.treeSprite('pine', w.season, 1), 6 * T - 3 - cx, 12 * T - 31 - cy);
      if (tm % 5 < .25) LQ.fx.light(6 * T + 8 - cx, 11 * T - cy, 14, '#35f0e6', .5);
    } });
  // the cache in the hidden clearing, with two wisps on patrol
  w.ents.push({ type: 'cache', tx: 6, ty: 7, solid: true, base: 7 * T + 14,
    use: () => LQ.script(async () => {
      if (s.flags.cache1) return say(null, 'Empty. You already took what was inside.');
      s.flags.cache1 = true; s.flags.lanternFound = true; sfx('coin'); w.burst(6 * T + 8, 7 * T + 6, '#f3c531', 14, 45);
      LQ.give('oldlantern'); LQ.give('stub1'); LQ.gain(10, 60, 'Hidden cache');
      await say(null, 'A miner\'s cache. Inside: 60 coins, an Old Lantern that still burns, and the stub of a ledger where pages were torn out.');
      await say(null, 'The stub reads: "Pages 1 through 12 removed by order of..." The name is gone. Someone took the truth out of the Great Ledger on purpose.');
    }),
    draw(g, cx, cy) { g.drawImage(LQ.prop('chest', 'summer', s.flags.cache1 ? 1 : 0), 6 * T - 1 - cx, 7 * T - cy); } });
  LQ.foes.wisp(w, 4 * T + 8, 8 * T + 8, 9 * T + 8, 8 * T + 8, 26);
  LQ.foes.wisp(w, 8 * T + 8, 6 * T + 8, 8 * T + 8, 9 * T + 8, 20);
  STONES.forEach(o => P.plaque(w, o.tx, o.ty, o.text, COL[o.col]));
  // street lamps, dark until the second page comes home
  POSTS.forEach(([tx, ty]) => w.ents.push({ type: 'post', tx, ty, base: ty * T + 15,
    draw(g, cx, cy, tm) {
      const x = tx * T - cx, y = ty * T - cy, on = s.flags.page2;
      R(g, x + 7, y - 8, 2, 23, '#2c2e5c'); R(g, x + 5, y + 13, 6, 2, '#1c1d44'); R(g, x + 4, y - 14, 8, 7, '#15163a'); R(g, x + 5, y - 13, 6, 5, on ? '#35f0e6' : '#2a2550');
      if (on) { R(g, x + 7, y - 12, 2, 3, '#ffffff'); LQ.fx.light(x + 8, y - 10, 30, '#35f0e6', .5 + .08 * Math.sin(tm * 2 + tx)); }
    } }));
  // the third page turns up where the Mythmonger fell
  w.ents.push({ type: 'logic', tx: 0, base: -9999, step() {
    if (!s.flags.bossDown || s.flags.page3 || LQ.busy) return;
    LQ.script(async () => {
      await say(null, 'Where the Baron stood, two scraps of paper drift down out of the clearing fog.');
      pageGot(3); LQ.give('invoice1');
      await say(null, 'One is a torn page of the Great Ledger. The other is an invoice: "40 crates of Premium Fog. Paid in full." The supplier\'s name has been scratched out.');
      await say(null, 'So the Baron did not make the fog. He bought it. Far below, old stones rise out of the river west of the village.');
      V.syncBridge(w);
    });
  } });
}
// ---------- three fooled villagers. Each one is put right by an action, not a quiz.
function addFooled(w, s) {
  const N = LQ.NPCS;
  // Rowan refused a raise. His cart blocks the east footbridge until the Bracket Compass shows him the truth.
  if (!s.flags.fixRowan) {
    const cart = { type: 'cart', tx: 38, ty: 15, solid: true, base: 15 * T + 14,
      use: () => LQ.script(() => say(null, 'A loaded handcart, wedged across the footbridge. A tag reads: "Rowan. Packed to leave if they make me take that raise."')),
      draw(g, cx, cy) {
        const x = 38 * T - cx, y = 15 * T - cy;
        R(g, x + 1, y + 4, 14, 8, '#6a4526'); R(g, x + 1, y + 4, 14, 1, '#a8703c'); R(g, x + 3, y - 2, 10, 6, '#4a3a6a'); R(g, x + 4, y - 3, 8, 1, '#9b6bff');
        R(g, x + 2, y + 11, 4, 4, '#15163a'); R(g, x + 10, y + 11, 4, 4, '#15163a'); R(g, x + 3, y + 12, 2, 2, '#6d7299'); R(g, x + 11, y + 12, 2, 2, '#6d7299');
      } };
    w.ents.push(cart);
    w.ents.push({ type: 'logic', hidden: true, tx: 20, ty: 29, revealRange: 2.6, base: -9999,
      reveal() {
        if (LQ.busy) return;
        if (Math.hypot(20 * T + 8 - w.p.x, 29 * T + 8 - w.p.y) > 2.6 * T) return;
        const me = this;
        LQ.script(async () => {
          await say(N.rowan, 'Is that a Bracket Compass? Hold it still. The needle only moves for the dollars above the line.');
          await say(N.rowan, 'So a raise is taxed at the higher rate only on the part over the line. I would have come out ahead. I turned down money for nothing!');
          s.flags.fixRowan = true; w.remove(me); w.remove(cart); sfx('fanfare'); LQ.gain(10, 0, 'Rowan set straight');
          await say(N.rowan, 'I am taking that raise. And I will haul my cart off the east footbridge. It is the quick way to the caves.');
          ui.toast('Shortcut open: the east footbridge');
        });
      } });
  }
  // Cook Basil sealed his finished return inside his stall. Break the seal with the Stamp and carry the return to Juno.
  w.ents.push({ type: 'bstall', tx: 2, tx2: 3, ty: 25, solid: true, base: 26 * T - 1,
    use: () => LQ.script(async () => {
      if (!s.flags.basilSeal) return say(null, 'Cook Basil\'s lunch stall, shuttered. A wax seal holds the shutter down: "Closed until the tax office forgets me." An honest mark would break it.');
      if (!s.flags.fixBasil) return say(null, 'Basil\'s stall stands open and cold. He will not light the griddle until his return is filed.');
      if (await LQ.choose(LQ.HERO, 'Basil\'s stall is open again. Tonic broth, 10 coins. You have ' + s.coins + ' coins.', ['Buy a tonic', 'Leave']) !== 0) return;
      if (s.coins < 10) return say(null, 'A tonic is 10 coins here. You are a little short.');
      s.coins -= 10; s.flags.tonics = (s.flags.tonics || 0) + 1; sfx('coin'); ui.toast('Got: Tonic'); LQ.save();
    }),
    stamp() {
      if (s.flags.basilSeal || LQ.busy) return;
      LQ.script(async () => {
        s.flags.basilSeal = true; sfx('rumble'); w.burst(3 * T, 25 * T + 6, '#ffcf4a', 18, 50); LQ.give('breturn');
        await say(null, 'The seal cracks and the shutter rattles up. On the cold griddle lies a finished tax return with Basil\'s name on it, never sent.');
        await say(null, 'Registrar Juno at Town Hall takes returns.');
      });
    },
    draw(g, cx, cy, tm) {
      const x = 2 * T - 1 - cx, y = 26 * T - 31 - cy;
      g.drawImage(LQ.prop('stall', w.season), x, y);
      if (!s.flags.basilSeal) {
        R(g, x + 3, y + 13, 28, 13, '#15163a'); for (let i = 0; i < 4; i++) R(g, x + 3, y + 15 + i * 3, 28, 1, '#2c2e5c');
        R(g, x + 15, y + 17, 5, 5, '#ffcf4a'); R(g, x + 16, y + 18, 3, 3, '#fff3b0'); LQ.fx.light(x + 17, y + 19, 10, '#ffcf4a', .35 + .1 * Math.sin(tm * 3));
      } else if (s.flags.fixBasil) LQ.fx.light(x + 17, y + 18, 26, '#ffcf4a', .5 + .06 * Math.sin(tm * 2));
    } });
  // A porch wisp keeps Granny Maple believing a refund is free money. It tolls nobody. Lantern light sends it off.
  if (!s.flags.fixMaple) {
    const wx = 11 * T + 8, wy = 33 * T + 4;
    w.ents.push({ type: 'porchwisp', tx: 11, base: wy + 8, t: 0, x: wx, y: wy,
      step(dt) {
        const p = w.p, me = this;
        me.x = wx + Math.cos(LQ.time * 1.3) * 14; me.y = wy + Math.sin(LQ.time * 2.6) * 4;
        if (s.flags.fixMaple || LQ.busy) return;
        me.t = LQ.kit.holding('lantern') && Math.hypot(p.x - me.x, p.y - 8 - me.y) < 44 ? me.t + dt : 0;
        if (me.t < 1.1) return;
        s.flags.fixMaple = true; w.remove(me); w.burst(me.x, me.y, '#ff4fb0', 24, 60); sfx('learn');
        LQ.script(async () => {
          await say(null, 'The wisp shrinks from the lantern light, thins to a thread, and is gone.');
          await say(N.maple, 'Oh! It has stopped whispering. A refund is only my own money coming home late, is it not? I will have less held back and buy lamp oil with the difference.');
          LQ.gain(10, 0, 'Granny Maple set straight');
          await say(N.maple, 'I will tell Saffron you are to have a tenth off at the Bazaar, dear. She listens to me.');
          ui.toast('Saffron Bazaar: 10% off');
        });
      },
      draw(g, cx, cy, tm) {
        const x = this.x - cx, y = this.y - cy, f = Math.floor(tm * 8) % 3, k = this.t > 0 ? .45 : 1;
        g.globalAlpha = k; R(g, x - 3, y - 3, 6, 7, '#ff4fb0'); R(g, x - 2, y - 5 - f, 4, 3, '#ff4fb0'); R(g, x - 1, y - 7 - f, 2, 2, '#ff9bd0'); R(g, x - 1, y - 1, 2, 3, '#ffffff');
        g.globalAlpha = 1; LQ.fx.light(x, y, 18, '#ff4fb0', .55 * k);
      } });
  }
}
// The fooled villagers say what is wrong before their usual talk. Juno takes Basil's return.
const talk0 = LQ.CH1.talk;
LQ.CH1.talk = async id => {
  const s = st(), N = LQ.NPCS;
  if (id === 'juno' && s.flags.basilSeal && !s.flags.fixBasil) {
    await say(N.juno, 'Cook Basil\'s return? Finished weeks ago and never sent. Let me guess. He could not pay, so he hid.');
    await say(N.juno, 'Not filing is the costly mistake. The penalty for filing late is about ten times the penalty for paying late. There. Filed, and I will set him up with a payment plan.');
    s.flags.fixBasil = true; s.items = s.items.filter(i => i !== 'breturn'); sfx('fanfare'); LQ.gain(10, 0, 'Cook Basil set straight');
    ui.toast('Basil\'s stall reopens: tonics for 10 coins'); return;
  }
  if (id === 'rowan' && !s.flags.fixRowan) return say(N.rowan, "I turned down a raise last spring. Didn't want a higher bracket eating my whole paycheck. Could you use the Bracket Compass beside me to show me?");
  if (id === 'basil' && !s.flags.fixBasil) return say(N.basil, s.flags.basilSeal ? 'You broke the seal? Then take it to Registrar Juno at Town Hall. I cannot look.'
    : 'I sealed my return inside my stall, west of the Work Hall. I was afraid to file because I owe money. Could your Truth Stamp open the shutter?');
  if (id === 'maple' && !s.flags.fixMaple) return say(N.maple, 'A pink wisp on my porch keeps calling my refund free money. Could you hold a Lantern near it?');
  return talk0(id);
};

const VR = LQ.REGIONS.village, spawn0 = VR.spawn;
VR.spawn = (w, s) => { spawn0(w, s); addVillage(w, s); addFooled(w, s); if (LQ.jobs) LQ.jobs.addBoard(w, s); };
VR.hud = () => LQ.pages() ? 'Ledger Pages ' + LQ.pages() + '/12' : '';

// While the vault is the job at hand, the quest tracker points at it.
const curQuest0 = LQ.curQuest;
LQ.curQuest = () => {
  const q = curQuest0(), s = st();
  if (q !== LQ.QUESTS[6] || !s.flags.vaultGo) return q;
  return s.flags.vaultDone ? Object.assign({}, q, { text: 'Return to Sage Altamira' }) : Object.assign({}, q, { text: 'Solve the Bracket Vault, just east of Sage Altamira', target: 'vault1' });
};

LQ.RUMORS.village = [
  { id: 'v1stones', done: s => !!s.flags.cave1, text: 'Four old rune stones stand in this village: by the Work Hall, by the Paymaster, by your cottage, and by Town Hall. Count the notches. They say a cave east of Bracket Mountain wants its fires lit in that order. Bring a light.' },
  { id: 'v1fooled', done: s => !!(s.flags.fixRowan && s.flags.fixBasil && s.flags.fixMaple), text: 'Three villagers still believe the Baron. Rowan will not take a raise, Cook Basil has sealed his stall west of the Work Hall, and a pink light haunts Granny Maple\'s porch by your cottage. A compass, a stamp, and a lantern would set them right.' },
  { id: 'v1cache', done: s => !!s.flags.cache1, text: 'Wren swears one pine in the north-west woods, across the river, is no tree at all. Its needles never move. A compass that points at the truth would know.' },
];

// ---------- the Bracket Vault: your own taxable income, in crates, on seven ledges
let L = null;
const wrap = r => '#####' + r + '######';
LQ.ROOMS.vault1 = {
  title: 'THE BRACKET VAULT', sub: 'Fill the ledges from the bottom', music: 'mountain',
  rows() {
    const f = LQ.fin(), tiers = f.tiers, n = tiers.length, b = LQ.TAX.brackets.single;
    const rows = ['####################', wrap('....P....'), wrap('####D####')], ch = {};
    for (let k = n + 1; k >= 1; k--) { ch[k] = rows.length; rows.push(wrap('.........'), wrap('..O....R.'), wrap('.........'), wrap(k > 1 ? '####G####' : '####.####')); }
    const cr = '.........'.split(''); [4, 2, 6].slice(0, n).forEach(i => { cr[i] = 'B'; });
    rows.push(wrap('I........'), wrap(cr.join('')), wrap('........Z'), wrap('....S....'), wrap('####X####'), '####################');
    let next = 1; for (let i = 0; i < b.length; i++) if (f.taxable >= b[i][0]) next = i + 1;
    L = V.L = { f, tiers, n, ch, next, rates: b.map(x => x[1]), sockets: {}, answers: {}, gates: {}, filled: {}, door: null, answered: false, onPlate: null };
    return rows;
  },
  kOf: ty => { for (const k in L.ch) if (ty >= L.ch[k] && ty <= L.ch[k] + 3) return +k; return 0; },
  zone: p => { const k = LQ.ROOMS.vault1.kOf(Math.floor((p.y - 3) / T)); return k ? 'ledge' + k : 'hall'; },
  get zones() {
    const z = {}, b = LQ.TAX.brackets.single;
    for (let k = 1; k <= 7; k++) z['ledge' + k] = ['LEDGE ' + k, pct(b[k - 1][1]) + (b[k] ? ' on taxable income from ' + M(b[k - 1][0]) + ' to ' + M(b[k][0]) : ' on everything above ' + M(b[k - 1][0]))];
    return z;
  },
  hud: () => L ? 'Ledges filled ' + Object.keys(L.filled).length + '/' + L.n : '',
  on: {
    P: (w, tx, ty, s) => { if (!s.flags.page1) P.page(w, tx, ty, vaultPage); },
    D: (w, tx, ty) => { L.door = P.door(w, tx, ty, 'The inner door. It opens for whoever stands on the rune where their next dollar would land.'); },
    G: (w, tx, ty) => { L.gates[LQ.ROOMS.vault1.kOf(ty)] = P.door(w, tx, ty, 'Sealed. Nothing climbs to a higher ledge until the ledge below is full.'); },
    O: (w, tx, ty) => { L.sockets[LQ.ROOMS.vault1.kOf(ty)] = P.plate(w, tx, ty, COL.gold); },
    R: (w, tx, ty) => { L.answers[LQ.ROOMS.vault1.kOf(ty)] = P.plate(w, tx, ty, COL.cyan); },
    B: (w, tx, ty) => P.block(w, tx, ty),
    I: (w, tx, ty) => P.plaque(w, tx, ty, () => `THE BRACKET VAULT. These crates hold your taxable income of ${M(L.f.taxable)}. Push the crates onto gold sockets, starting at the lowest ledge. Use one crate per ledge and leave any higher ledges empty. Then stand on the cyan rune of the ledge where your NEXT dollar would land.`),
    Z: (w, tx, ty) => P.seal(w, tx, ty, () => LQ.script(async () => { sfx('stamp'); ui.toast('The seal flashes. The crates slide home.'); await w.enterRoom('vault1'); }),
      'A reset seal. If a crate gets stuck, strike this with the Truth Stamp (E) and every crate returns to its place.'),
  },
  tick(w) {
    const p = w.p, ptx = Math.floor(p.x / T), pty = Math.floor((p.y - 3) / T);
    for (const k in L.sockets) {
      const so = L.sockets[k];
      if (!L.filled[k]) {
        const b = w.ents.find(e => e.push && e.tx === so.tx && e.ty === so.ty && !e.ox && !e.oy);
        if (b) {
          const t = L.tiers[k - 1];
          b.push = false; b.locked = true; L.filled[k] = true; sfx('right'); w.burst(so.tx * T + 8, so.ty * T + 8, COL.gold, 18, 50);
          ui.toast(`Ledge ${k}: ${M(t.amount)} at ${pct(t.rate)} = ${M(t.tax)} of tax`);
          if (L.gates[+k + 1]) L.gates[+k + 1].open();
        }
      }
      so.on = !!L.filled[k];
    }
    const all = Object.keys(L.filled).length === L.n;
    let on = null;
    for (const k in L.answers) { const a = L.answers[k]; a.on = all && !L.answered; if (a.tx === ptx && a.ty === pty) on = +k; }
    if (on === L.onPlate) return;
    L.onPlate = on; if (!on || L.answered) return;
    if (!all) return ui.toast('The rune is dark. First fill every ledge your income reaches.');
    LQ.script(async () => {
      const s = st(), first = !s.flags.vaultAttempted && !s.flags.vaultDone;
      s.flags.vaultAttempted = true;
      const rate = pct(L.rates[L.next - 1]);
      if (on === L.next) {
        L.answered = true; sfx('right'); if (first) LQ.score(true);
        await say(null, `The rune flares. Your next dollar lands on ledge ${L.next} and is taxed at ${rate}. Not one coin on the ledges below changes its rate.`);
        L.door.open();
      } else {
        if (first) LQ.score(false);
        sfx('wrong'); LQ.shake(.2);
        await say(null, on > L.next ? `The rune stays cold. Ledge ${on} is empty. Not one of your dollars has reached it.` : `The rune stays cold. Ledge ${on} is already full. Your next dollar spills higher.`);
      }
    });
  },
  arrive: async w => {
    LQ.foes.wisp(w, 6 * T, L.ch[L.n + 1] * T + 8, 13 * T, L.ch[L.n + 1] * T + 8, 30);
    if (!st().flags.vaultSeen) { st().flags.vaultSeen = true; await say(null, 'Cold air and the smell of old ink. Crates of income wait by the door. A tablet stands to your left.'); }
  },
};
async function vaultPage() {
  const s = st();
  s.flags.vaultDone = true; pageGot(1);
  await say(null, 'A torn page of the Great Ledger. Its ink still glows.');
  await say(null, `It reads: "Tax is counted ledge by ledge, never all at once." For you: ${L.tiers.map(t => M(t.tax)).join(' + ')} = ${M(L.f.tax)}.`);
  LQ.gain(15, 40, 'Bracket Vault');
  await say(null, s.quest === 6 ? 'Outside, the fog on the mountain thins. Sage Altamira will want to see this.' : 'Outside, the fog on the mountain thins.');
}

// ---------- the Lantern Cave: dark, with four fires to light in the order a paycheck travels
const ORDER = ['gold', 'magenta', 'cyan', 'violet'];
let C = null;
const fire = col => (w, tx, ty, s) => {
  const e = P.brazier(w, tx, ty, COL[col], b => {
    if (C.solved) return LQ.script(() => say(null, 'It burns steadily.'));
    if (b.lit) return;
    b.lit = true; C.seq.push(col); sfx('ok'); w.burst(tx * T + 8, ty * T + 2, COL[col], 12, 40);
    if (C.seq.some((c, i) => c !== ORDER[i])) return LQ.script(async () => {
      await LQ.wait(.5); sfx('wrong'); LQ.shake(.3); C.fires.forEach(f => { f.lit = false; }); C.seq = [];
      if (w.ents.filter(x => x.type === 'imp').length < 3) LQ.foes.imp(w, 10, 7);
      ui.toast('The fires gutter out. Wrong order. Something stirs in the dark.');
    });
    if (C.seq.length === 4) LQ.script(async () => {
      C.solved = true; s.flags.cave1 = true; sfx('fanfare'); LQ.gain(15, 0, 'Lantern Cave');
      await say(null, 'Earned, held back, kept, returned. The four fires burn together and the inner door grinds open.');
      if (C.door) C.door.open();
    });
  });
  e.lit = !!s.flags.cave1; C.fires.push(e);
};
LQ.ROOMS.cave1 = {
  title: 'THE LANTERN CAVE', sub: 'Four fires, one order', dark: true, music: 'mountain',
  leave: s => { delete s.flags.lanternRent; },
  rows() {
    C = V.C = { seq: [], fires: [], door: null, solved: !!st().flags.cave1 };
    return [
      '####################',
      '#######......#######',
      '#######..C...#######',
      '##########D#########',
      '#..................#',
      '#.1..............2.#',
      '#..................#',
      '#......m....m......#',
      '#..................#',
      '#.3..............4.#',
      '#...........I......#',
      '########...#########',
      '########...T########',
      '########...#########',
      '########.S.#########',
      '#########X##########',
      '####################'];
  },
  on: {
    1: fire('gold'), 2: fire('violet'), 3: fire('cyan'), 4: fire('magenta'),
    m: (w, tx, ty, s) => { if (!s.flags.cave1) LQ.foes.imp(w, tx, ty, 'caveImp_' + tx + '_' + ty); },
    D: (w, tx, ty, s) => { if (!s.flags.cave1) C.door = P.door(w, tx, ty, 'A door of black stone. Four cold fire bowls stand in the corners of the chamber.'); },
    T: (w, tx, ty) => P.spitter(w, tx, ty, -1, 0),
    I: (w, tx, ty) => P.plaque(w, tx, ty, 'FOUR FIRES. Light them the way a paycheck travels: earned, held back, kept, returned. The village remembers the colors.'),
    C: (w, tx, ty, s) => w.ents.push({ type: 'cache', tx, ty, solid: true, base: ty * T + 14,
      use: () => LQ.script(async () => {
        if (s.flags.page2) return say(null, 'Empty. You already took what was inside.');
        w.burst(tx * T + 8, ty * T + 6, '#f3c531', 14, 45); pageGot(2); s.flags.heartUp = true; s.hp = LQ.kit.maxHp();
        await say(null, 'Inside the chest: a torn page of the Great Ledger, and a Notary\'s Seal. The seal gives you one more heart.');
        await say(null, 'The page reads: "A refund is your own money coming home." Far off, down in the village, the street lamps flicker back to life.');
        LQ.gain(0, 40, 'Lantern Cave');
      }),
      draw(g, cx, cy) { g.drawImage(LQ.prop('chest', 'summer', s.flags.page2 ? 1 : 0), tx * T - 1 - cx, ty * T - cy); } }),
  },
  arrive: async () => { if (!st().flags.caveSeen) { st().flags.caveSeen = true; await say(null, 'The dark closes in. Your lantern lights only a few steps. Hold it in hand (Q) to see farther. Something skitters ahead.'); } },
};
})();
