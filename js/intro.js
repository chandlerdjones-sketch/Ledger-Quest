// The opening: your cottage and the old records cellar under it. See INTRO_TUTORIAL_PLAN.md.
// flags.intro is the stage: 1 just woke, 2 career chosen (purse stolen), 3 stamp taken, 4 purse back, 9 done.
// Saves from before the opening have no stage and count as done.
(() => {
const LQ = window.LQ, T = 16, ui = LQ.ui, P = LQ.parts;
const st = () => LQ.state, say = LQ.say, sfx = n => LQ.audio.sfx(n);
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
const stage = () => { const v = st().flags.intro; return v == null ? 9 : v; };
const setStage = n => { st().flags.intro = n; };
const TRAP = [8, 5], CRATE_ASIDE = [10, 5];

Object.assign(LQ.ITEMS, {
  letter: { name: 'Two Letters', desc: 'Your job offer, and a note from the landlord. The rent is low because the last tenant, Clerk Osric Vell of the Great Ledger, walked out one night and never came back.' },
  purse: { name: 'Coin Purse', desc: 'Yours again, and a little chewed. Every coin you earn goes in here.' },
});

// A solid thing you can talk to, drawn in code.
const prop = (w, type, tx, ty, use, draw, base) => { const e = { type, tx, ty, solid: true, base: base != null ? base : ty * T + 14, use: () => LQ.script(use), draw }; w.ents.push(e); return e; };

// ---------- the cottage
let H = null;
async function readLetter(w) {
  const s = st();
  if (stage() > 1) return say(null, 'Your job offer, and the landlord\'s note about Clerk Vell, who walked out of this cottage one night and never came back.');
  await say(null, 'Two letters. The first is your job offer. All it needs is a yes.');
  await LQ.fadeTo(1, .3);
  const picked = LQ.careerSelect();          // swaps in the career card screen
  await LQ.fadeTo(0, .3);
  s.career = await picked; LQ.initMarket();
  await LQ.fadeTo(1, .3); LQ.setScene(LQ.world); await LQ.fadeTo(0, .4);
  const c = LQ.career();
  await say(null, c.kind === 'se' ? 'It is settled. Your candle shop opens tomorrow.' : `It is settled. You start tomorrow as a ${c.name.toLowerCase()} at ${c.work}.`);
  await say(null, 'The second letter is from the landlord. "The rent is low because the last tenant, Clerk Osric Vell of the Great Ledger, walked out one night and never came back. His things are still there. Sorry."');
  LQ.give('letter');
  await LQ.wait(.5); sfx('rumble'); LQ.shake(.5); await LQ.wait(.4);
  await say(null, 'THUMP. Something moved under the floor. When you look up, the shelf by the door is bare. Your coin purse is gone.');
  await say(null, 'Fresh scratch marks cross the boards and stop at the crate.');
  if (H.crate) { H.crate.push = true; delete H.crate.use; }
  setStage(2);
}
LQ.ROOMS.cottage1 = {
  title: 'YOUR COTTAGE', sub: 'The rent is low. Nobody says why.', music: 'mountain', floor: 'q',
  from: { village: [9, 8, 'up'], cellar1: [8, 6, 'down'] },
  exitBanner: s => s.quest === 0,
  rows() {
    H = { crate: null, moved: 0, last: null, going: false };
    return [
      '####################',
      '####################',
      '####............####',
      '####.bS.....T...####',
      '####............####',
      '####....H.......####',
      '####............####',
      '####.c........h.####',
      '####............####',
      '#########N##########',
      '#########X##########',
      '####################'];
  },
  on: {
    b: (w, tx, ty) => prop(w, 'bed', tx, ty, async () => { const K = LQ.kit, full = K.hp() >= K.maxHp(); st().hp = K.maxHp(); await say(null, full ? 'Your bed. It came with the cottage. So did the blanket.' : 'You rest a while. Your hearts are full again.'); },
      (g, cx, cy) => { const x = tx * T - cx, y = ty * T - cy; R(g, x + 1, y - 8, 14, 23, '#2c2e5c'); R(g, x + 2, y - 7, 12, 6, '#c9cdea'); R(g, x + 2, y, 12, 14, '#7b4bb8'); R(g, x + 2, y, 12, 2, '#9b6bff'); }),
    T: (w, tx, ty) => prop(w, 'table', tx, ty, () => readLetter(w),
      (g, cx, cy, tm) => {
        const x = tx * T - cx, y = ty * T - cy;
        R(g, x, y + 3, 16, 9, '#5a4630'); R(g, x, y + 3, 16, 2, '#7a5a3a'); R(g, x + 1, y + 12, 2, 4, '#3d2f24'); R(g, x + 13, y + 12, 2, 4, '#3d2f24');
        R(g, x + 11, y - 3, 2, 6, '#fdf8e7'); R(g, x + 11, y - 5, 2, 2, '#ffcf4a'); LQ.fx.light(x + 12, y - 4, 26, '#ffcf4a', .5 + .08 * Math.sin(tm * 9));
        R(g, x + 3, y + 4, 6, 5, '#fdf8e7'); R(g, x + 4, y + 6, 4, 1, '#35f0e6');
        if (stage() === 1) { LQ.fx.light(x + 6, y + 6, 12, '#35f0e6', .45 + .25 * Math.sin(tm * 4)); g.drawImage(LQ.prop('mark'), x + 5, y - 20 + Math.round(Math.sin(tm * 6) * 2)); }
      }),
    c: (w, tx, ty) => prop(w, 'coat', tx, ty, () => say(null, 'A clerk\'s grey coat, still on its hook. Stitched inside the collar: O. VELL. One pocket holds a dry inkwell.'),
      (g, cx, cy) => { const x = tx * T - cx, y = ty * T - cy; R(g, x + 7, y - 6, 2, 3, '#42458a'); R(g, x + 3, y - 3, 10, 15, '#5d6478'); R(g, x + 3, y - 3, 10, 2, '#8f8c9c'); R(g, x + 7, y, 2, 12, '#3a3550'); R(g, x + 2, y + 1, 2, 9, '#4a4a56'); R(g, x + 12, y + 1, 2, 9, '#4a4a56'); }),
    h: (w, tx, ty) => prop(w, 'shelf', tx, ty, () => say(null, stage() === 1 ? 'A shelf by the door. Your coin purse sits on it: twenty coins, and everything you have.' : st().items.includes('purse') ? 'The shelf by the door. You keep your purse on you now.' : 'The shelf is bare. Your purse is gone. Scratch marks lead across the floor to the crate.'),
      (g, cx, cy) => { const x = tx * T - cx, y = ty * T - cy; R(g, x, y + 2, 16, 3, '#7a5a3a'); R(g, x + 1, y + 5, 2, 10, '#3d2f24'); R(g, x + 13, y + 5, 2, 10, '#3d2f24'); if (stage() === 1) { R(g, x + 5, y - 4, 6, 6, '#c98a3c'); R(g, x + 6, y - 5, 4, 1, '#3d2f24'); R(g, x + 7, y - 2, 2, 2, '#ffcf4a'); } }),
    N: (w, tx, ty) => { if (stage() < 9) P.door(w, tx, ty, 'It is the middle of the night. And something is moving under your floor.'); },
    H: (w, tx, ty) => {
      w.ents.push({ type: 'trapdoor', tx, ty, base: ty * T - 40, draw(g, cx, cy) {
        const x = tx * T - cx, y = ty * T - cy; R(g, x + 1, y + 1, 14, 14, '#0b0c24'); R(g, x + 1, y + 1, 14, 1, '#5a4630'); R(g, x + 1, y + 14, 14, 1, '#5a4630'); R(g, x + 1, y + 1, 1, 14, '#5a4630'); R(g, x + 14, y + 1, 1, 14, '#5a4630');
        for (let i = 0; i < 3; i++) R(g, x + 4, y + 4 + i * 4, 8, 1, '#42458a');
        LQ.fx.light(x + 8, y + 8, 12, '#35f0e6', .3);
      } });
      w.ents.push({ type: 'scratch', tx, ty: ty + 2, base: ty * T - 41, draw(g, cx, cy) { if (stage() > 1) for (let i = 0; i < 5; i++) R(g, (tx + 1 + i) * T + 3 - cx, (ty + 1) * T + 6 + (i % 2) * 3 - cy, 7, 1, '#1d1b3c'); } });
      const open = st().flags.trapOpen, at = open ? CRATE_ASIDE : [tx, ty];
      H.crate = P.block(w, at[0], at[1]);
      if (stage() === 1) { H.crate.push = false; H.crate.use = () => LQ.script(() => say(null, 'A heavy crate, left behind by the last tenant.')); }
    },
  },
  tick(w) {
    const p = w.p, s = st();
    if (H.last) H.moved += Math.hypot(p.x - H.last[0], p.y - H.last[1]);
    H.last = [p.x, p.y];
    if (stage() < 2 || H.going) return;
    if (w.ents.some(e => e.type === 'block' && e.tx === TRAP[0] && e.ty === TRAP[1])) return;
    s.flags.trapOpen = true;
    if (Math.floor(p.x / T) === TRAP[0] && Math.floor((p.y - 3) / T) === TRAP[1]) { H.going = true; LQ.script(() => w.enterRoom('cellar1')); }
  },
  arrive: async () => {
    const s = st(); if (stage() !== 1 || s.flags.introWoke) return;
    s.flags.introWoke = true;
    await say(null, 'Your first night in Paystub Village. Use the arrow keys or WASD to walk to the glowing letter. Face the table and press Space to read it.');
  },
};

// ---------- the old records cellar
let C = null;
const spawnImp = w => {
  C.imp = LQ.foes.imp(w, 9, 4, 'cellarImp', e => {
    C.imp = null;
    const tx = Math.floor(e.x / T), ty = Math.floor(e.y / T);
    C.purse = { type: 'purse', tx, ty, base: ty * T + 12,
      pick: async () => {
        C.purse = null; LQ.give('purse'); LQ.gain(0, 20, 'Your purse'); setStage(4);
        await say(null, 'Your purse, chewed but whole. The creature was made of crumpled paper, and it is already blowing away.');
      },
      draw(g, cx, cy, tm) { const x = tx * T - cx, y = ty * T - cy + Math.round(Math.sin(tm * 3)); R(g, x + 4, y + 5, 8, 8, '#c98a3c'); R(g, x + 5, y + 4, 6, 1, '#3d2f24'); R(g, x + 7, y + 8, 2, 2, '#ffcf4a'); LQ.fx.light(x + 8, y + 8, 14, '#ffcf4a', .5); } };
    w.ents.push(C.purse);
  });
};
LQ.ROOMS.cellar1 = {
  title: 'THE OLD RECORDS CELLAR', sub: 'Under your cottage', music: 'mountain', home: true, exitTo: 'cottage1',
  rows() {
    C = { gate: null, imp: null, purse: null };
    return [
      '####################',
      '#########QQ#########',
      '####..V.........#.o#',
      '####............#o.#',
      '####.....m......#~.#',
      '####...............#',
      '####............#..#',
      '####............#oo#',
      '########G###########',
      '####......Z.....####',
      '####....P.......####',
      '####............####',
      '####.L..........####',
      '######S#############',
      '######X#############',
      '####################'];
  },
  on: {
    Q: (w, tx, ty) => prop(w, 'greatdoor', tx, ty, async () => {
      const n = LQ.pages(); st().flags.sawDoor = true;
      await say(null, 'A door far too tall for this cellar. Set into it are twelve empty slots, each the shape of a page.' + (n ? ` ${n} of them ${n === 1 ? 'glows' : 'glow'}.` : ''));
      await say(null, 'Cut into the stone above: "Twelve pages. Twelve truths. Sealed until they come home."');
    }, (g, cx, cy, tm) => {
      if (tx !== 9) return;
      const x = tx * T - cx, y = ty * T - 14 - cy, n = LQ.pages();
      R(g, x - 2, y, 36, 30, '#0b0c24'); R(g, x - 2, y, 36, 1, '#9b6bff'); R(g, x - 2, y, 1, 30, '#9b6bff'); R(g, x + 33, y, 1, 30, '#9b6bff'); R(g, x + 15, y + 2, 2, 28, '#1c1d44');
      for (let i = 0; i < 12; i++) { const sx = x + 2 + (i % 6) * 5 + (i % 6 > 2 ? 3 : 0), sy = y + 5 + Math.floor(i / 6) * 11, on = i < n; R(g, sx, sy, 4, 7, on ? '#35f0e6' : '#1c1d44'); if (on) LQ.fx.light(sx + 2, sy + 3, 7, '#35f0e6', .5); }
      LQ.fx.light(x + 16, y + 14, 34, '#9b6bff', .25 + .08 * Math.sin(tm * 1.3));
    }, ty * T + 15),
    V: (w, tx, ty) => prop(w, 'desk', tx, ty, () => say(null, 'A clerk\'s desk under a sheet of dust. The last entry in the open book reads: "Pages 1 through 12 removed tonight, by order of the" and there the line stops, mid-word. The ink is smeared, as if the pen was pulled away.'),
      (g, cx, cy) => { const x = tx * T - cx, y = ty * T - cy; R(g, x, y + 3, 16, 9, '#3d2f24'); R(g, x, y + 3, 16, 2, '#5a4630'); R(g, x + 1, y + 12, 2, 4, '#231a36'); R(g, x + 13, y + 12, 2, 4, '#231a36'); R(g, x + 4, y + 4, 8, 5, '#c9cdea'); R(g, x + 8, y + 4, 1, 5, '#8a84b0'); R(g, x + 5, y + 6, 2, 1, '#35f0e6'); }),
    o: (w, tx, ty, s) => { const key = 'cellar' + tx + '_' + ty; if (!s.coinsGot[key]) w.ents.push({ type: 'coin', i: tx + ty, key, tx, ty, base: ty * T + 12 }); },
    G: (w, tx, ty, s) => { if (!s.flags.cellarGate) C.gate = P.door(w, tx, ty, 'An iron gate, shut fast. Beside it, a gold seal is set into the wall.'); },
    Z: (w, tx, ty, s) => P.seal(w, tx, ty, () => {
      if (s.flags.cellarGate) return;
      s.flags.cellarGate = true; sfx('stamp'); if (C.gate) C.gate.open();
      if (stage() < 4 && !C.imp) spawnImp(w);
      ui.toast('The seal takes the mark. The gate grinds open.'); LQ.save();
    }, 'A gold seal set into the wall. It looks as if it is waiting for a mark.'),
    P: (w, tx, ty) => prop(w, 'pedestal', tx, ty, async () => {
      if (st().items.includes('stamp')) return say(null, 'An empty pedestal. Cut into the stone: "For an honest mark. O.V."');
      LQ.give('stamp'); sfx('fanfare'); if (stage() < 3) setStage(3);
      await say(null, 'A brass stamp rests on the pedestal, without a speck of dust. Cut into the stone: "For an honest mark. O.V."');
      await say(null, 'You take the Truth Stamp. It is in your hand now. Press E to swing it.');
    }, (g, cx, cy, tm) => {
      const x = tx * T - cx, y = ty * T - cy, has = st().items.includes('stamp');
      w.shadow(g, x + 8, y + 15, 12); R(g, x + 3, y + 5, 10, 10, '#2c2e5c'); R(g, x + 2, y + 3, 12, 3, '#42458a'); R(g, x + 2, y + 3, 12, 1, '#9b6bff');
      if (!has) { const b = Math.round(Math.sin(tm * 3)); R(g, x + 5, y - 5 + b, 6, 6, '#ffcf4a'); R(g, x + 7, y - 8 + b, 2, 3, '#c98a3c'); LQ.fx.light(x + 8, y - 2, 22, '#ffcf4a', .6); }
    }),
    L: (w, tx, ty) => P.lamp(w, tx, ty),
    '~': w => LQ.foes.wisp(w, 18 * T, 2 * T + 8, 18 * T, 7 * T + 8, 22),
    m: (w, tx, ty, s) => { if (stage() < 4 && s.flags.cellarGate) spawnImp(w); },
  },
  tick(w) {
    const s = st();
    if (stage() === 4 && s.flags.sawDoor && !s.flags.knock && w.p.y > 9 * T) {   // the Mayor knocks once you have seen the door and turned back
      s.flags.knock = true;
      LQ.script(async () => {
        sfx('stamp'); await LQ.wait(.25); sfx('stamp'); await LQ.wait(.3);
        await say(null, 'Knock, knock. A voice calls down from above: "Hello? Mayor Marigold here! I heard a crash. Is the new tenant in one piece?"');
        setStage(9);
      });
    }
  },
  arrive: async () => {
    const s = st();
    if (s.flags.cellarSeen) return;
    s.flags.cellarSeen = true;
    await say(null, 'Stone steps, far older than the cottage above. The air smells of cold ink.');
  },
};

LQ.intro = {
  stage,
  active: () => stage() >= 1 && stage() <= 4,
  // A new game, or a save made part way through the opening, starts in the cottage.
  resume(w) { w.loadRoom('cottage1'); },
};

// While the opening is being played, the quest tracker follows it instead of pointing at the Mayor.
const curQuest0 = LQ.curQuest;
LQ.curQuest = () => {
  const q = curQuest0(), n = stage();
  if (st().quest !== 0 || n > 4) return q;
  return { short: 'Your first night', target: null, text: n === 1 ? 'Read the letter on the table' : n === 4 ? (st().flags.sawDoor ? 'Head back up the stairs' : 'Read the tall door beyond the gate') : 'Find whatever took your coin purse' };
};

// One line of help at the bottom of the screen, only while the opening is being played.
LQ.tip = w => {
  const s = st(), id = w.room && w.room.room, n = stage();
  if (id === 'cottage1') {
    if (n === 1) return H && H.moved < 40 ? 'Arrows or WASD: move' : 'Walk up to the letter on the table and press Space';
    if (n < 9 && !s.flags.knock) return s.flags.trapOpen ? 'Step onto the trapdoor' : 'Walk into the crate to push it';
    if (s.quest === 0) return 'The Mayor is outside. Leave by the door at the bottom of the room';
  } else if (id === 'cellar1' && s.quest === 0) {
    if (!s.items.includes('stamp')) return 'Space: use things. Try the green lamp, then the pedestal';
    if (!s.flags.cellarGate) return 'Face the gold seal by the gate and press E';
    if (C && C.imp) return 'Face the imp and press E twice to swing. Step back between hits.';
    if (C && C.purse) return 'Walk over your purse to take it';
    if (n === 4) return s.flags.sawDoor ? 'J: see your items. Wisps cannot be struck, so slip past or leave those coins' : 'A tall door glows beyond the gate. Go and read it';
    if (n === 9) return 'Go back up the stairs';
  }
  return null;
};
})();
