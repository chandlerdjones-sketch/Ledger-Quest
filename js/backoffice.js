// The Back Office: the room behind the tall cellar door, and the end of the Torn Ledger story.
// Three fog valves to shut with the Truth Stamp, Clerk Vell behind the gate, and one last thing to stamp.
// Valve progress lives in flags (bo1 to bo3), so fainting or leaving never undoes a valve.
(() => {
const LQ = window.LQ, T = 16, ui = LQ.ui, P = LQ.parts;
const st = () => LQ.state, say = LQ.say, sfx = n => LQ.audio.sfx(n);
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
const VELL = { name: 'Clerk Vell', look: { id: 'boVell', hair: '#c9cdea', shirt: '#6d7299', pants: '#2c2e5c', trim: '#35f0e6', beard: '#c9cdea' } };
const MURK = { name: 'Head Clerk Murk', look: { id: 'boMurk', hat: 'top', hair: '#3d2f24', shirt: '#4a1f4f', pants: '#231a36', trim: '#ff4fb0' } };
const shut = () => [1, 2, 3].filter(n => st().flags['bo' + n]).length;

Object.assign(LQ.ITEMS, {
  greatledger: { name: 'The Great Ledger, Whole', desc: 'All twelve pages are home. Anyone may read it, and nobody may sell a fog over it again.' },
});

let B = null;
const person = (w, who, tx, ty, use) => { const e = { type: 'person', who, tx, ty, solid: true, base: ty * T + 14, use: () => LQ.script(use),
  draw(g, cx, cy) { w.shadow(g, tx * T + 8 - cx, ty * T + 15 - cy, 12); g.drawImage(LQ.charSprite(who.look, 'down', 0), tx * T - 1 - cx, ty * T - 13 - cy); } }; w.ents.push(e); return e; };
const valve = n => (w, tx, ty, s) => {
  if (s.flags['bo' + n]) return P.plaque(w, tx, ty, 'A brass valve, shut tight and stamped with an honest mark.', '#7fd6a8');
  const e = P.seal(w, tx, ty, () => {
    if (s.flags['bo' + n]) return;
    if (n === 2 && w.ents.some(e => e.type === 'imp')) {
      ui.toast('Defeat the Scrap Imp to shut this valve.');
      return;
    }
    s.flags['bo' + n] = true; sfx('stamp'); LQ.shake(.3); w.burst(tx * T + 8, ty * T + 8, '#7fd6a8', 18, 50);
    e.use = () => LQ.script(() => say(null, 'A brass valve, shut tight and stamped with an honest mark.'));
    if (n === 3 && B.spit) {
      w.remove(B.spit);
      B.spit = null;
      w.ents.filter(e => e.type === 'bolt').forEach(e => w.remove(e));
    }
    const k = shut();
    ui.toast(k < 3 ? `Valve ${k} of 3 shut. The fog thins.` : 'The last valve is shut. The inner gate grinds open.');
    if (k === 3 && B.gate) B.gate.open();
    LQ.save();
  }, 'A brass valve, hissing fog. It looks as if it is waiting for a mark. Face it and press E with the Truth Stamp.');
};
async function vellTalk() {
  const s = st();
  if (s.flags.ledgerDone) return say(VELL, 'Twelve pages, twelve truths, and a reader in the house. The cottage is yours. Keep the stamp close.');
  if (!s.flags.vellFree) {
    await say(VELL, 'My Truth Stamp. You must be the new tenant. I am Osric Vell.');
    await say(VELL, 'The Head Clerk found that confused people pay for answers. He ordered the twelve plainest pages torn out of the Great Ledger and fed to this press, and he sold the fog it made by the crate.');
    await say(VELL, 'I tore them out, as ordered. Then I threw them to the wind instead of the fire, and I shut that door from the inside. It stays sealed until all twelve come home. So did I.');
    s.flags.vellFree = true;
  }
  await say(VELL, 'One thing is left. His Standing Order is nailed to the press. While it stands, the fog is still for sale. Face it and press E. An honest mark will void it.');
}
async function murkTalk() {
  await say(MURK, 'Quillon Murk, Head Clerk. You have been costing me customers. Befuddle, Loophole, Slick, the Dragon: all paid up, and all out of business.');
  await say(MURK, 'I never told one lie. I only took the plain pages away and sold what grew in the gap. People pay well to stay confused, and better to be rescued.');
  const a = await LQ.choose(MURK, 'Put the stamp down, and a tenth of every crate is yours. Well?', ['Keep the stamp in hand', 'Ask what the tenth is worth']);
  if (a === 1) await say(MURK, 'Whatever I say it is worth. That is the beauty of fog. No? You were reaching for the stamp again. Pity.');
  else await say(MURK, 'Then strike nothing. Especially not that order on the press. It is perfectly in order.');
}
async function finale(w) {
  const s = st(); if (s.flags.ledgerDone) return;
  if (!s.flags.vellFree) return say(null, 'Talk to Clerk Vell before you stamp the Standing Order.');
  sfx('stamp'); LQ.shake(.5); w.burst(B.press.tx * T + 8, B.press.ty * T + 8, '#ffcf4a', 30, 70);
  await say(null, 'VOID. The Standing Order curls under the mark. The supplier’s name comes into focus on the invoices: "Q. MURK, HEAD CLERK."');
  sfx('rumble'); LQ.shake(.4);
  await say(null, 'The Fog Press shudders and stops. The twelve pages lift out of your pack and settle, one by one, into the Great Ledger.');
  s.flags.ledgerDone = true; s.flags.vellFree = true; if (B.murk) { w.burst(B.murk.tx * T + 8, B.murk.ty * T, '#9b6bff', 20, 50); }
  await say(MURK, 'It was only business.');
  await say(VELL, 'Then it can be audited like one. Registrar Juno has waited a long time to ask you about these invoices, Quillon.');
  if (B.murk) { w.remove(B.murk); B.murk = null; w.refresh(); }
  LQ.give('greatledger'); LQ.gain(100, 300, 'The Great Ledger restored'); sfx('fanfare');
  await say(VELL, 'The fog was never magic. It was missing pages. Now anyone can read what you learned the hard way: how pay is taxed, what counts, and what a promise of easy money is worth.');
  ui.showBanner('THE GREAT LEDGER IS WHOLE', 'Twelve pages. Twelve truths.');
  LQ.save();
}

LQ.ROOMS.backoffice = {
  title: 'THE BACK OFFICE', sub: 'Behind the tall door', music: 'mountain', home: true, exitTo: 'cellar1',
  from: { cellar1: [10, 12, 'up'], faint: [2, 12, 'up'] },
  rows() {
    B = { gate: null, murk: null };
    // Spare wall rows above and below let the camera scroll, so the HUD never sits on top of the press or the valves.
    return [
      '####################',
      '####################',
      '####################',
      '####################',
      '####################',
      '#########K##########',
      '######m.....v#######',
      '######.......#######',
      '#########G##########',
      '#1D.O.B.......i...2#',
      '###.......##########',
      '#>..............3###',
      '#L........S....R####',
      '##########X#########',
      '####################',
      '####################',
      '####################'];
  },
  on: {
    1: valve(1), 2: valve(2), 3: valve(3),
    D: (w, tx, ty, s) => { if (!s.flags.bo1) B.wing = P.door(w, tx, ty, 'A grille across the valve. A cord runs from it to the rune on the floor. Something heavy on the rune would lift it.'); },
    O: (w, tx, ty, s) => { if (!s.flags.bo1) B.plate = P.plate(w, tx, ty, '#ffcf4a'); },
    B: (w, tx, ty, s) => { if (!s.flags.bo1) P.block(w, tx, ty); },
    L: (w, tx, ty) => P.lamp(w, tx, ty),
    i: (w, tx, ty, s) => { if (!s.flags.bo2) LQ.foes.imp(w, tx, ty); },
    '>': (w, tx, ty, s) => { if (!s.flags.bo3) B.spit = P.spitter(w, tx, ty, 1, 0, 1.5); else P.plaque(w, tx, ty, 'A carved mouth in the wall. With its valve shut, it has nothing left to spit.', '#7fd6a8'); },
    R: (w, tx, ty) => P.seal(w, tx, ty, () => LQ.script(async () => { sfx('stamp'); ui.toast('The seal flashes. The room resets.'); await w.enterRoom('backoffice', 'faint'); }),
      'A reset seal. If the crate gets stuck, strike this with the Truth Stamp (E) and it returns to its place. Shut valves stay shut.'),
    G: (w, tx, ty) => { if (shut() < 3) B.gate = P.door(w, tx, ty, 'The inner gate. Three pipes run into it, one from each valve. It will not open while any of them is breathing fog.'); },
    K: (w, tx, ty, s) => {
      w.ents.push({ type: 'press', tx, ty, base: ty * T + 2, draw(g, cx, cy, tm) {
        const x = tx * T - cx, y = ty * T - cy, on = !s.flags.ledgerDone;
        R(g, x - 22, y - 12, 60, 26, '#15163a'); R(g, x - 22, y - 12, 60, 1, '#9b6bff'); R(g, x - 22, y - 12, 1, 26, '#9b6bff'); R(g, x + 37, y - 12, 1, 26, '#9b6bff');
        for (let i = 0; i < 3; i++) { R(g, x - 16 + i * 6, y - 8, 3, 18, '#42458a'); R(g, x + 22 + i * 5, y - 8, 3, 18, '#42458a'); }
        if (on) { const b = Math.floor(tm * 4) % 3; R(g, x - 14, y - 16 - b, 4, 4, '#ff4fb0'); R(g, x + 26, y - 17 + b, 4, 4, '#ff4fb0'); LQ.fx.light(x + 8, y, 40, '#ff4fb0', .3 + .1 * Math.sin(tm * 3)); }
        else LQ.fx.light(x + 8, y, 44, '#35f0e6', .45);
      } });
      const e = P.seal(w, tx, ty, () => LQ.script(() => finale(w)), 'The Standing Order: "Tear out what is plain. Sell what is left. By order of the Head Clerk." Face it and press E with the Truth Stamp.');
      e.qid = 'fogpress'; B.press = e; const use0 = e.use; e.use = () => s.flags.ledgerDone ? LQ.script(() => say(null, 'The Great Ledger, whole again, lies open on the silent press. The first line reads: "Tax is counted ledge by ledge, never all at once."')) : use0();
    },
    v: (w, tx, ty) => person(w, VELL, tx, ty, vellTalk),
    m: (w, tx, ty, s) => { if (!s.flags.ledgerDone) B.murk = person(w, MURK, tx, ty, murkTalk); },
  },
  tick(w) {
    if (!B.wing || !B.plate) return;
    const on = w.ents.some(e => e.type === 'block' && e.tx === B.plate.tx && e.ty === B.plate.ty && !e.ox && !e.oy);
    B.plate.on = on;
    if (on) { const b = w.ents.find(e => e.type === 'block'); b.push = false; b.locked = true; B.wing.open(); B.wing = null; ui.toast('The crate holds the rune down. The grille lifts.'); }
  },
  arrive: async () => {
    const s = st(); if (s.flags.boSeen) return;
    s.flags.boSeen = true;
    await say(null, 'The Back Office. Shelves of blank ledgers, and behind a gate, a machine the size of a house. It breathes fog through three brass valves.');
    await say(null, 'Each valve wants an honest mark. One is behind a grille, one is guarded, and one sits at the end of a lane of fog bolts. Step out of the lane between bolts, or face them and hold E with the Standard Shield.');
  },
};

// The tall door in the cellar opens once all twelve pages are home.
LQ.backoffice = {
  VELL, MURK, shut,
  async door(w) {
    const s = st();
    if (!s.flags.doorOpen) {
      sfx('fanfare');
      await say(null, 'The twelve pages lift out of your pack. One by one they slide into the slots, and each slot lights.');
      sfx('rumble'); LQ.shake(.5);
      await say(null, '"Twelve pages. Twelve truths." The tall door swings inward. Cold fog rolls out across the cellar floor.');
      s.flags.doorOpen = true;
    }
    await w.enterRoom('backoffice', 'cellar1');
  },
};

// The quest tracker and the help line follow the room.
const pageQuest0 = LQ.pageQuest;
LQ.pageQuest = () => {
  const s = st(), q = pageQuest0(), inside = LQ.world.room && LQ.world.room.room === 'backoffice';
  if (s.flags.ledgerDone || !inside) return q;
  if (shut() < 3) return { short: 'Shut the fog valves', text: `Stamp the fog valves (E): ${shut()} of 3 shut`, target: null };
  if (!s.flags.vellFree) return { short: 'Find Clerk Vell', text: 'Talk to Clerk Vell behind the inner gate', target: null };
  return { short: 'End the fog', text: 'Stamp the Standing Order on the Fog Press (E)', target: 'fogpress' };
};
const tip0 = LQ.tip;
LQ.tip = w => {
  const t = tip0 ? tip0(w) : null, s = st();
  if (t || !w.room || w.room.room !== 'backoffice' || s.flags.ledgerDone) return t;
  if (!s.flags.bo1 && B && B.wing) return 'West wing: push the crate onto the gold rune to lift the grille';
  if (shut() < 3) return 'Q: switch tools    E: stamp a valve    Hold E with the Shield to block bolts';
  return s.flags.vellFree ? 'Face the Standing Order on the press and press E' : 'Space: talk to Clerk Vell';
};
})();
