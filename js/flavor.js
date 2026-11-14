// World and presentation: a tip or a money problem for every villager, music cues, optional narration, and one cutscene.
(() => {
const LQ = window.LQ, ui = LQ.ui, F = LQ.F;
const st = () => LQ.state;

// ---------- one short line per villager, said once after their usual business. A useful tip or a funny money problem.
const QUIPS = {
  CH1: {
    mayor: 'Tip from the mayor: know what comes in before you plan what goes out. That is the whole village budget.',
    brannock: 'I keep my pay stubs in my hard hat. Do not do that. Keep yours somewhere dry until tax season ends.',
    pim: 'Money problem: I count everyone\'s pay to the coin, and I still lose my own lunch money every week.',
    odette: 'Tip: open tax mail the day it arrives. An envelope does not get friendlier in a drawer.',
    sable: 'Tip: when someone offers you a raise, ask what it is after tax. That is the number you can spend.',
    thorn: 'Money problem: I bought a shield on sale to save coins. Then another. I have saved my way into nine shields.',
    altamira: 'Tip: a tax rate applies to a slice, never the whole pie. Remember that and half of all tax fear goes away.',
    juno: 'Tip: file even in a year you think you owe nothing. A refund only goes to people who ask for it.',
    merchant: 'Tip from a merchant: wait one night before a big buy. If you still want it at breakfast, come back.',
    broker: 'Tip: never invest coins you will need next month. The market does not care about your rent.',
    rowan: 'Money problem: Fen and I each thought the other one paid the miller. The miller thought neither. The miller was right.',
    fen: 'Tip: we write every shared bill on one slate by the door now. No more surprises from the miller.',
    wren: 'Tip: some weeks the nets are full and some are empty. I save from the full weeks so the empty ones do not scare me.',
    pip: 'Money problem: I had five coins. I lent three to my brother. Now I have two coins and a brother who hides.',
    maple: 'Tip: I have paid myself first for sixty years. One coin in ten goes in the jar before anything else.',
    dex: 'Money problem: my books cost more than my rent. I asked the books to chip in. They declined.',
    alms: 'Tip: keep the receipt when you give. A gift you can prove may lower your tax.',
    gale: 'Tip: I have seen ten market crashes. Every one felt like the end. None of them was.',
    flint: 'Money problem: I found a silver nugget and spent it at the tavern before I learned it was tin.',
    juniper: 'Tip: I write down every mile the day I drive it. Guessing in winter is how you lose a write-off.',
    basil: 'Money problem: I priced my stew below what the beef cost me. Busiest month I ever had. Also the poorest.',
  },
  CH2: {
    marlowe: 'Tip: let us look at the money together once a month. Ten minutes, with tea. No surprises that way.',
    coral: 'Money problem: I am saving for a boat. I have four coins. The boat costs nine hundred. I will be patient.',
    brine: 'Tip: a loan costs more than its price tag. Ask for the total you will pay back, interest and all.',
    pearl: 'Tip: talk about money before the wedding. It is less romantic than cake and a lot more useful.',
    dory: 'Tip: ask your sitter for a receipt and a tax ID. No paperwork, no child care credit.',
    stone: 'Tip: when your life changes, your W-4 should change the same week.',
    tallow: 'Money problem: I assess every house on the coast, and I still cannot find my own keys.',
    fathom: 'Tip: married couples can file together or apart. Check both ways once. Together usually wins.',
    trader: 'Tip: a sale only saves you money if you were going to buy the thing anyway.',
    quay: 'Tip: buy a little every month, high tide or low. Nobody times the tide right twice.',
    gull: 'Tip: know where the family papers are. Accounts, deeds, the will. I had to learn that the hard way.',
    finch: 'Money problem: I get paid on Friday and I am broke by Monday. The weekend keeps happening to me.',
    kelp: 'Tip: giving feels best when it is planned. Pick an amount first, then pick who.',
    reed: 'Tip: a scholarship form is the best paid hour of work a student will ever do.',
    barnacle: 'Money problem: I buried my savings on the beach to keep them safe. Then the beach moved.',
    lark: 'Tip: budget for the upkeep, not just the price. A boat costs you again every single season.',
    ivy: 'Money problem: we got six toasters as wedding gifts and no bread. Next time I will say what we need.',
    otto: 'Tip: I keep three months of costs in the bank. Fish do not bite on a schedule.',
  },
  CH3: {
    juniper: 'Tip: charge for your time, not just your materials. Your hours are the expensive part.',
    mesa: 'Tip: open a separate account for the gig. Mixed money is a mess at tax time.',
    lupe: 'Tip: ten minutes of bookkeeping a week beats ten hours of panic in April.',
    flint: 'Money problem: I weigh gold all day and my own purse weighs nothing. I should look into that.',
    dune: 'Tip: when a gig payment lands, move the tax share out the same day. You cannot spend what is not there.',
    brick: 'Money problem: I tally everything. Last night I tallied my tallies. I think I need a hobby.',
    sage: 'Tip: a deadline is cheaper than a penalty. Mark the four quarterly dates today.',
    trader: 'Tip: a tool that earns you money is an investment. A tool that gathers dust is a decoration.',
    broker: 'Tip: gig income goes up and down. Invest a set share of it, not a set amount.',
    marlowe: 'Tip: the gig is going well. Let us pick what share we save now, before the coins decide for us.',
    coral: 'Money problem: I sold lemonade for two coins a cup. The lemons cost three. Do I owe myself money?',
    whittle: 'Tip: I price a carving by adding the wood, the hours, and a little for the slow weeks.',
    silver: 'Money problem: I spent forty years looking for silver. I found it in my hair.',
    poppy: 'Tip: when you work for yourself, nobody hands you health coverage. Budget for it like rent.',
    loom: 'Tip: I ask for half the payment before I start a big order. A customer who pays up front shows up.',
    axle: 'Money problem: I bought a faster wagon to earn more. Now I earn more and it all goes to the wagon.',
    penny: 'Tip: interest works for you in savings and against you in debt. Pick which side you stand on.',
    tack: 'Tip: get the price in writing before the job starts. Friends stay friends that way.',
    cinder: 'Money problem: I traded a horseshoe for a pie. Good pie. Now how do I write that in my books?',
  },
  CH4: {
    marlowe: 'Tip: we invest for years from now, so we do not check the price every day. Once a season is plenty.',
    coral: 'Money problem: I planted a coin in the snow to see if it would grow. Marlowe says investing does not work like that.',
    garnet: 'Tip: write down what you paid for every share. Your gain is measured from that number.',
    frost: 'Tip: time does most of the work in investing. Starting early beats starting big.',
    birch: 'Tip: money you need within a year belongs in the bank. Money for ten years away can ride the market.',
    larch: 'Tip: do not put every coin in one company. One avalanche should not bury all your savings.',
    cirrus: 'Money problem: I moved up here to escape my bills. The bills learned to climb.',
    tamsin: 'Tip: fees are a slow leak. A fund that charges less leaves more for you at the top.',
    alpen: 'Tip: keep your sale records until the return is filed, and then a few years more.',
    trader: 'Tip: if someone promises a sure thing, ask why they are selling it and not keeping it.',
    broker: 'Tip: decide when you would sell before you buy. Plans made in a panic are bad plans.',
    nimbus: 'Money problem: I own half this mountain and I still argue over the price of tea. Old habits.',
    ada: 'Tip: an index fund buys a little of everything. Dull, cheap, and hard to beat.',
    gramps: 'Tip: I started saving at twenty with almost nothing. The almost nothing is what paid for this cabin.',
    sorrel: 'Tip: keep an emergency fund, so a twisted ankle never forces you to sell shares at a bad price.',
    bell: 'Tip: decide what you will give before the year gets busy. A plan gives more than a mood does.',
    flake: 'Money problem: I sell shares all day, and I still say "buy" when I mean "goodbye".',
    bit: 'Money problem: I bought a coin made of pure arithmetic. It went up, down, and sideways before lunch.',
    curio: 'Money problem: I collect rare coins. So I am rich, and I cannot spend any of it.',
  },
};
LQ.QUIPS = QUIPS;
for (const ch in QUIPS) {
  const C = LQ[ch], talk0 = C.talk;
  C.talk = async id => {
    const r = await talk0(id), line = QUIPS[ch][id], key = 'quip_' + ch + '_' + id, s = st();
    if (!line || s.flags[key] || LQ.scene !== LQ.world || LQ.intro?.active() || LQ.world.room) return r;
    const who = C.npcs.find(n => n.id === id); if (!who) return r;
    s.flags[key] = true; await LQ.say(who, line); LQ.save();
    return r;
  };
}

// ---------- music cues: each later boss has a theme, puzzle rooms share one, and homes share one
const cue = (obj, name) => { if (obj) obj.music = name; };
cue(LQ.BOSSES.loophole, 'boss2'); cue(LQ.BOSSES.slick, 'boss3'); cue(LQ.BOSSES.glint, 'boss4');
cue(LQ.ROOMS.vault1, 'puzzle'); cue(LQ.ROOMS.stash3, 'puzzle');
for (const id of ['cottage1', 'house2', 'house3', 'house4']) cue(LQ.ROOMS[id], 'home');

// ---------- optional spoken narration (N switches it). A prototype: it reads cutscene captions only. Villagers stay text.
const synth = () => (typeof window.speechSynthesis !== 'undefined' ? window.speechSynthesis : null);
const store = (() => { try { const l = window.localStorage; return l && typeof l.getItem === 'function' ? l : null; } catch (e) { return null; } })();
const N = LQ.narr = {
  on: !!store && store.getItem('ledgerquest.narration') === '1',
  ok: () => !!synth() && typeof window.SpeechSynthesisUtterance !== 'undefined',
  toggle() {
    if (!N.ok()) return ui.toast('Spoken narration is not available in this browser. Captions stay on.');
    N.on = !N.on; try { store && store.setItem('ledgerquest.narration', N.on ? '1' : '0'); } catch (e) { /* private window */ }
    if (!N.on) N.stop();
    ui.toast(N.on ? 'Narration on. Story scenes are read aloud.' : 'Narration off. Captions stay on.');
    if (N.on && LQ.scene === CUT && CUT.def) N.speak(CUT.def.panels[CUT.i].text);
  },
  speak(text) {
    if (!N.on || !N.ok() || LQ.audio.muted) return;
    try { N.stop(); const u = new window.SpeechSynthesisUtterance(text); u.rate = .95; u.pitch = 1; synth().speak(u); } catch (e) { /* captions carry the story */ }
  },
  stop() { try { synth()?.cancel(); } catch (e) { /* nothing to stop */ } },
  busy: () => { try { return !!synth()?.speaking; } catch (e) { return false; } },
};

// ---------- one cutscene: the Torn Ledger so far, shown the first time the hero reaches Shelter Coast.
// Captions are always on. Enter or Space turns the page, Esc or X skips, and a page turns by itself after a pause.
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
const book = (g, t, torn) => {
  const y = 74 + Math.round(Math.sin(t * 1.5) * 2);
  R(g, 96, y + 44, 128, 6, '#231a36'); R(g, 100, y, 58, 46, '#fdf8e7'); R(g, 162, y, 58, 46, '#fdf8e7'); R(g, 158, y - 2, 4, 50, '#9b6bff');
  for (let i = 0; i < 6; i++) { R(g, 106, y + 6 + i * 6, 46, 1, '#35f0e6'); if (!torn || i < 2) R(g, 168, y + 6 + i * 6, 46, 1, '#35f0e6'); }
  if (torn) { for (let x = 162; x < 220; x += 4) R(g, x, y + 18 + (x / 4 % 2) * 3, 4, 28, '#07081a'); }
  LQ.fx.light(160, y + 22, 70, '#35f0e6', .5);
};
const ART = {
  book(g, t) { book(g, t, false); },
  torn(g, t) {
    book(g, t, true);
    for (let i = 0; i < 12; i++) { const k = (t * .12 + i / 12) % 1, x = 190 + k * 150 * Math.cos(i * 1.7), y = 90 - k * 90 + Math.sin(t * 2 + i) * 6; R(g, x, y, 6, 8, '#fdf8e7'); R(g, x + 1, y + 2, 4, 1, '#35f0e6'); R(g, x + 1, y + 4, 3, 1, '#35f0e6'); }
  },
  fog(g, t) {
    R(g, 0, 120, 320, 60, '#12143a');
    for (const [x, w, h] of [[30, 34, 30], [80, 44, 42], [140, 30, 26], [186, 50, 38], [250, 36, 30]]) { R(g, x, 120 - h, w, h, '#1d1b40'); R(g, x + w / 2 - 4, 120 - h + 8, 8, 8, '#3d3c80'); for (let i = 0; i < w; i += 2) R(g, x + i, 120 - h - Math.min(i, w - i) / 2, 2, Math.min(i, w - i) / 2, '#2a1458'); }
    for (let i = 0; i < 9; i++) { const x = (LQ.hash(i, 2, 90) * 420 + t * (6 + i * 2)) % 420 - 90, y = 60 + LQ.hash(i, 3, 90) * 80; g.fillStyle = 'rgba(170,120,220,.22)'; g.fillRect(x, y, 100, 9); g.fillRect(x + 16, y - 5, 60, 19); }
  },
  coast(g, t) {
    R(g, 0, 128, 320, 52, '#0f3a5a'); for (let x = 0; x < 320; x += 8) R(g, x + Math.round(Math.sin(t * 2 + x) * 2), 132 + (x % 16 ? 6 : 0), 5, 1, '#8fe6da');
    R(g, 196, 122, 70, 10, '#2e2a58'); R(g, 222, 52, 16, 72, '#e6eaff'); R(g, 222, 70, 16, 8, '#b0332e'); R(g, 222, 96, 16, 8, '#b0332e'); R(g, 218, 44, 24, 9, '#231a36'); R(g, 224, 46, 12, 6, '#fff3b0');
    const a = Math.sin(t * .8); g.fillStyle = 'rgba(255,243,176,.25)'; g.beginPath(); g.moveTo(230, 49); g.lineTo(230 - 200, 49 + a * 60 - 14); g.lineTo(230 - 200, 49 + a * 60 + 14); g.fill();
    for (let i = 0; i < 9; i++) { const x = 30 + i * 18, y = 100 + Math.sin(t * 2 + i) * 4; R(g, x, y, 6, 8, '#fdf8e7'); R(g, x + 1, y + 2, 4, 1, '#35f0e6'); }
    LQ.fx.light(230, 49, 30, '#fff3b0', .7);
  },
};
const SCENES = {
  coast: { flag: 'cut2', music: 'story', panels: [
    { art: 'book', text: 'Long ago, the Great Ledger held the plain truth about money. Anyone could read it.' },
    { art: 'torn', text: 'Then twelve pages were torn out and scattered across the Ledgerlands.' },
    { art: 'fog', text: 'Where a page went missing, fog rolled in. People started believing strange things about taxes.' },
    { art: 'coast', text: 'You brought three pages home. Nine are still out there. The next ones are here, on Shelter Coast.' },
  ] },
};
const CUT = LQ.cutscene = {
  def: null, i: 0, t: 0, done: null, SCENES,
  show(i) { CUT.i = i; CUT.t = 0; N.speak(CUT.def.panels[i].text); },
  finish() { const d = CUT.done; CUT.done = null; N.stop(); if (d) d(); },
  update(dt) {
    if (!CUT.done) return;
    CUT.t += dt;
    const P = CUT.def.panels, last = CUT.i >= P.length - 1, hold = Math.max(4.5, P[CUT.i].text.length * .075);
    if (LQ.hit('back')) return CUT.finish();
    if (LQ.hit('ok') || (CUT.t > hold && !N.busy())) { if (last) CUT.finish(); else { LQ.audio.sfx('move'); CUT.show(CUT.i + 1); } }
  },
  draw(g) {
    const t = LQ.time, sky = g.createLinearGradient(0, 0, 0, LQ.BH); sky.addColorStop(0, '#06051a'); sky.addColorStop(1, '#1a1446'); g.fillStyle = sky; g.fillRect(0, 0, LQ.BW, LQ.BH);
    LQ.fx.stars(g, t, 50, 100);
    if (!CUT.def) return;
    LQ.fx.begin(g); ART[CUT.def.panels[CUT.i].art](g, t); LQ.fx.end(g); LQ.fx.flush(g, t); LQ.fx.vignette(g);
  },
  drawUI(c) {
    if (!CUT.def) return;
    const P = CUT.def.panels, k = Math.min(1, CUT.t / .4);
    c.font = F(28);
    const lines = ui.wrap(c, P[CUT.i].text, 796), top = 474 - Math.max(3, lines.length) * 29;
    ui.panel(c, 60, top - 12, 840, 522 - top);
    c.globalAlpha = k; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = '#eef4ff';
    lines.forEach((ln, i) => c.fillText(ln, 82, top + i * 29)); c.globalAlpha = 1;
    ui.text(c, (CUT.i + 1) + ' / ' + P.length, 878, 482, '#c9cdea', F(20), 'right');
    ui.text(c, 'Enter: next    Esc: skip    N: narration ' + (N.on ? 'on' : 'off'), 82, 482, '#35f0e6', F(21), 'left', 700);
  },
  async play(id) {
    const def = SCENES[id]; if (!def) return;
    await LQ.fadeTo(1, 0.4); ui.banner = null; CUT.def = def; LQ.setScene(CUT); LQ.audio.play(def.music); await LQ.fadeTo(0, 0.5);
    await new Promise(done => { CUT.done = done; CUT.show(0); });
    await LQ.fadeTo(1, 0.4); CUT.def = null; LQ.setScene(LQ.world); await LQ.fadeTo(0, 0.5);
  },
};
const coast = LQ.REGIONS.coast, arrive0 = coast.arrive;
coast.arrive = async w => {
  const s = st();
  if (s.q2 == null && !s.flags.cut2) { s.flags.cut2 = true; await CUT.play('coast'); }
  if (arrive0) return arrive0(w);
};
})();
