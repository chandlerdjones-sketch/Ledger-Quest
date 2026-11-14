// Money players earn and see: a playable gig run in Hustle Canyon with a money trail (earned, spent, kept, reported),
// a nudge toward the brokers, and a short compare board after the Chapter 4 sale clock.
// Nothing here changes the tax return. Tax wording was checked against IRS Topic 409 and the IRS Roth IRA pages (Nov 2026).
(() => {
const LQ = window.LQ, T = 16, ui = LQ.ui, F = LQ.F, D = LQ.docs;
const st = () => LQ.state, sfx = n => LQ.audio.sfx(n), M = n => LQ.money(n);
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
const wrapSpawn = (id, fn) => { const reg = LQ.REGIONS[id], spawn0 = reg.spawn; reg.spawn = (w, s) => { spawn0(w, s); fn(w, s); }; };

// ---------- the gig run
const WORDS = {
  driver: { stock: 'Parcels', hint: 'You are on a delivery run. Press Space by a waiting customer to hand over a parcel. Press Space at the back crate to load three more.', cost: 'Cart feed and tolls' },
  seller: { stock: 'Pots', hint: 'You are selling at the market. Press Space by a waiting customer to sell a pot. Press Space at the back crate to bring out three more.', cost: 'Clay and stall fees' },
  scribe: { stock: 'Letters', hint: 'You are writing for hire. Press Space by a waiting client to hand over a letter. Press Space at the back desk to write three more.', cost: 'Ink and paper' },
};
const GIG = { cap: 40, target: 10, costRate: .25, BOARD: [26, 22] };
const stepKey = s => [s.quest, s.q2, s.q3, s.q4].join('|');
const Mny = LQ.money2 = {
  GIG,
  left(s = st()) { return s.flags.gigQ === stepKey(s) ? Math.max(0, 2 - (s.flags.gigN || 0)) : 2; },
  // Earned scales with the score. A quarter goes to job costs. The tax jar is self-employment tax on the profit.
  pay(score) {
    const TX = LQ.TAX || {}, base = TX.seBase || .9235, rate = TX.seRate || .153;
    const earned = Math.round(GIG.cap * Math.min(1, score / GIG.target)), spent = Math.round(earned * GIG.costRate), profit = earned - spent, jar = Math.round(profit * base * rate);
    return { earned, spent, profit, jar, kept: profit - jar };
  },
  totals(s = st()) { const f = s.flags; return { earned: f.gE || 0, spent: f.gC || 0, jar: f.gJ || 0, kept: f.gK || 0, runs: f.gR || 0 }; },
  async run() {
    const s = st(), J = LQ.jobs, gig = LQ.GIGS[s.gig], W = WORDS[gig.id], paid = Mny.left(s) > 0;
    const G = J.G = J.newGame('owner'); G.title = gig.name.toUpperCase(); G.stockName = W.stock;
    await LQ.fadeTo(1, 0.3); ui.banner = null; LQ.setScene(J); await LQ.fadeTo(0, 0.3);
    await LQ.say(null, W.hint + ' You have 30 seconds. They start when this message closes.');
    const score = await new Promise(done => { G.done = done; G.live = true; });
    sfx('fanfare'); await LQ.wait(0.4);
    const P = Mny.pay(score);
    if (paid && P.earned > 0) {
      const f = s.flags, key = stepKey(s); if (f.gigQ !== key) { f.gigQ = key; f.gigN = 0; } f.gigN++;
      f.gE = (f.gE || 0) + P.earned; f.gC = (f.gC || 0) + P.spent; f.gJ = (f.gJ || 0) + P.jar; f.gK = (f.gK || 0) + P.kept; f.gR = (f.gR || 0) + 1;
      if (P.kept) LQ.gain(0, P.kept, 'Gig run'); LQ.save();
      ui.doc = { draw(c) {
        D.paper(c, 190, 92, 580, 340, 'GIG RUN', gig.name);
        const L = (i, a, b, o) => D.line(c, 218, 146 + i * 38, 524, a, b, o);
        L(0, 'Earned', P.earned + ' coins'); L(1, 'Spent on the job: ' + W.cost, '-' + P.spent, D.RED);
        L(2, 'Profit', P.profit + ' coins'); L(3, 'Tax jar: self-employment tax', '-' + P.jar, D.RED);
        D.rule(c, 218, 304, 524); L(4.4, 'Kept', P.kept + ' coins', D.GREEN);
        ui.text(c, 'PRACTICE. Gig run coins never change your tax return.', 480, 374, '#4a4172', F(23), 'center', 520);
        ui.text(c, 'Nobody holds tax back from gig money. You fill the jar yourself.', 480, 398, '#4a4172', F(21), 'center', 520);
      } };
      await LQ.pressOk(); ui.doc = null;
    } else if (paid) await LQ.say(null, 'No sales this run, so no coins. Your paid run is still waiting.');
    else await LQ.say(null, `Practice score: ${score}. Paid runs return after your next quest step.`);
    await LQ.fadeTo(1, 0.3); J.G = null; LQ.setScene(LQ.world); await LQ.fadeTo(0, 0.4);
  },
  // Side by side: what the practice runs paid, and what the real return says about the gig.
  async trail() {
    const s = st(), t = Mny.totals(s), f = LQ.fin3(), filed = s.q3 >= 8;
    ui.doc = { draw(c) {
      D.paper(c, 60, 30, 840, 330, 'MONEY TRAIL', LQ.GIGS[s.gig].name);
      ui.text(c, 'GIG RUNS  (practice coins)', 90, 84, '#b0332e', F(11, true)); ui.text(c, 'YOUR RETURN  (the real figures)', 500, 84, '#1f6f5c', F(11, true));
      const A = (i, a, b, o) => D.line(c, 90, 108 + i * 34, 370, a, b, Object.assign({ size: 24 }, o)), B = (i, a, b, o) => D.line(c, 500, 108 + i * 34, 370, a, b, Object.assign({ size: 24 }, o));
      A(0, 'Earned', t.earned + ' coins'); A(1, 'Spent on the job', '-' + t.spent, D.RED); A(2, 'Tax jar', '-' + t.jar, D.RED); A(3, 'Kept', t.kept + ' coins', D.GREEN); A(4, 'Runs worked', String(t.runs));
      B(0, 'Earned', M(f.gigGross)); B(1, 'Job costs', '-' + M(f.gigExp), D.RED); B(2, 'Profit', M(f.gigProfit)); B(3, 'Self-employment tax', M(f.seGig), D.RED);
      B(4, 'Reported?', filed ? 'Yes, on Schedule C' : 'Not yet', filed ? D.GREEN : D.RED);
      D.rule(c, 90, 286, 780);
      ui.text(c, 'Gig runs are practice and pay pocket coins. They never touch the return.', 480, 296, '#4a4172', F(22), 'center', 780);
      ui.text(c, filed ? 'You reported the real figures when you filed at the Canyon Tax Office.' : 'The real figures change when you find expense slips or buy gig gear. You report them when you file.', 480, 322, '#4a4172', F(22), 'center', 780);
    } };
    await LQ.pressOk(); ui.doc = null;
  },
};
const canyon = LQ.REGIONS.canyon, build0 = canyon.build;
canyon.build = () => { const m = build0(), [x, y] = GIG.BOARD; m.solid[y][x] = false; m.trees = m.trees.filter(t => !(t.x === x && t.y === y)); return m; };
wrapSpawn('canyon', (w, s) => {
  const [tx, ty] = GIG.BOARD;
  w.ents.push({ type: 'gigboard', tx, ty, solid: true, base: ty * T + 15,
    use: () => LQ.script(async () => {
      if (!s.gig) return LQ.say(null, 'The gig board. Every notice says the same thing: "Pick a line of work at the Guild Hall first."');
      const n = Mny.left(s), gig = LQ.GIGS[s.gig];
      const i = await LQ.choose(LQ.HERO, `The gig board. A 30-second run as a ${gig.name}. ` + (n ? `Paid runs left before your next quest step: ${n}.` : 'No paid runs are left until your next quest step, so this one is practice.'), ['Start a gig run', 'See my money trail', 'Back']);
      if (i === 0) await Mny.run(); else if (i === 1) await Mny.trail();
    }),
    step() { if (s.gig && !s.flags.gigTold && !LQ.busy && !ui.menu) { s.flags.gigTold = true; ui.toast('Side income is live. Try a gig run at the board just south of the plaza.'); } },
    draw(g, cx, cy, tm) {
      const x = tx * T - cx, y = ty * T - cy, on = !!s.gig && Mny.left(s) > 0;
      R(g, x + 2, y + 4, 2, 11, '#2c2e5c'); R(g, x + 12, y + 4, 2, 11, '#2c2e5c'); R(g, x, y - 8, 16, 13, '#3a2a1c'); R(g, x + 1, y - 7, 14, 11, '#6a4526');
      R(g, x + 3, y - 5, 4, 5, '#e6eaff'); R(g, x + 9, y - 4, 4, 5, on ? '#ff8a3a' : '#8a8a96'); R(g, x + 4, y + 1, 6, 2, '#7fd6a8');
      if (on) LQ.fx.light(x + 8, y - 2, 14, '#ff8a3a', .3 + .1 * Math.sin(tm * 3));
      if (s.gig && !s.flags.gR) g.drawImage(LQ.prop('mark'), x + 5, y - 24 + Math.round(Math.sin(tm * 6) * 2));
    } });
});

// ---------- stocks: the first time the hero walks near a broker with coins to spend, say how trading works
const BROKERS = { broker: 1, quay: 1 };
for (const id of ['village', 'coast', 'canyon', 'summit']) wrapSpawn(id, (w, s) => {
  const b = LQ.REGIONS[id].content().npcs.find(n => BROKERS[n.id]); if (!b) return;
  w.ents.push({ type: 'logic', tx: 0, base: -9999, step() {
    if (s.flags.stockTold || LQ.busy || ui.menu || !s.prices) return;
    if (Math.hypot(b.tx * T + 8 - w.p.x, b.ty * T + 8 - w.p.y) > 4.5 * T) return;
    s.flags.stockTold = true;
    ui.toast('Stocks: talk to ' + b.name + ' under the ticker board to BUY.'); ui.toast('HOLD as long as you like. SELL at any broker. J, then Broker, shows what you own.');
  } });
});

// ---------- Chapter 4: three short cards after the sale clock. Enter turns the card.
const CARDS = [
  { title: 'HOLD OR SELL', a: ['HOLD', 'No tax yet. A gain you have not sold is only on paper.', 'The price can still rise or fall.'], b: ['SELL', 'The gain is real now. It goes on this year\'s return.', 'Held one year or less: taxed like wages. Held more than one year: lower long-term rates.'] },
  { title: 'SELLING AT A LOSS', a: ['KEEP THE LOSER', 'A loss you have not sold does nothing on your return.', 'The price may recover. It may not.'], b: ['SELL THE LOSER', 'The loss is real now. It cancels gains from other sales.', 'If losses are bigger than gains, up to $3,000 comes off other income this year. The rest carries forward.'] },
  { title: 'TWO KINDS OF ACCOUNT', a: ['TAXABLE BROKERAGE', 'Dividends are taxed every year. Gains are taxed in the year you sell.', 'Take money out any time.'], b: ['ROTH IRA', 'No deduction going in. No tax on dividends or sales while the money stays inside.', 'Qualified withdrawals are tax-free. Taking earnings out early can mean tax plus a 10% extra tax.'] },
];
Mny.CARDS = CARDS;
Mny.compare = async who => {
  for (let i = 0; i < CARDS.length; i++) {
    const K = CARDS[i];
    ui.doc = { draw(c) {
      D.paper(c, 60, 20, 840, 350, K.title, 'Card ' + (i + 1) + ' of ' + CARDS.length);
      [[K.a, 90, '#3b6fd4'], [K.b, 495, '#1f6f5c']].forEach(([col, x, tint]) => {
        c.fillStyle = '#f4f6ff'; c.fillRect(x, 78, 375, 196); c.fillStyle = tint; c.fillRect(x, 78, 375, 4);
        ui.text(c, col[0], x + 14, 92, tint, F(12, true));
        let y = 122; c.font = F(23); c.textAlign = 'left'; c.textBaseline = 'top';
        for (const para of col.slice(1)) { c.fillStyle = '#15122e'; for (const ln of ui.wrap(c, para, 347)) { c.fillText(ln, x + 14, y); y += 24; } y += 10; }
      });
      D.rule(c, 90, 286, 780);
      ui.text(c, 'PRACTICE: this card changes nothing.', 480, 296, '#b0332e', F(22), 'center', 780);
      ui.text(c, 'REAL: your choices with Marlowe, and every sale at a broker this chapter, go on your return.', 480, 322, '#1f6f5c', F(22), 'center', 780);
    } };
    await LQ.pressOk(); sfx('move');
  }
  ui.doc = null;
  const order = LQ.shuffle([0, 1, 2]), opts = ['Selling the shares', 'Watching the price go up', 'Checking the Broker tab'];
  const pick = order[await LQ.choose(who, 'Quick one, no score. Which of these puts a gain on this year\'s return?', order.map(i => opts[i]))];
  await LQ.say(who, pick === 0 ? 'Right. Selling makes it real. Until then it is only a number on a board.' : 'Not that one. Only selling does it. Until you sell, the gain is only a number on a board.');
};
})();
