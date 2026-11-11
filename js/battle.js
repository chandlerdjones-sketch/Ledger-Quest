// The summit fight. Every attack is a tax myth; the right truth is your sword.
(() => {
const LQ = window.LQ, ui = LQ.ui, F = LQ.F, M = n => LQ.money(n);
const BARON = { name: 'Baron Befuddle' };
const pc = r => Math.round(r * 100) + '%';
const MYTHS = [
  { myth: 'A raise that pushes you into a higher bracket SHRINKS your whole paycheck!',
    opts: ['Only the dollars above the line get the higher rate.', 'True. Refuse any raise near a bracket line.', 'Brackets are random. Nobody understands them.'],
    truth: 'Brackets are marginal. A raise always leaves you with more than before.' },
  { myth: 'A big refund is FREE bonus money from the kingdom!',
    opts: ['A refund is my own money, over-withheld all year, coming back.', 'Yes! The bigger the refund, the more I won.', 'Refunds are a reward for filing early.'],
    truth: 'A refund means too much was withheld. It was yours the whole time.' },
  { myth: "Can't pay what you owe? Then just DON'T FILE!",
    opts: ['File on time anyway. Filing late costs far more than paying late.', 'Right. No return means no bill.', 'Wait a few years and it goes away.'],
    truth: 'The late-filing penalty is about ten times the late-payment penalty. File on time, then ask about a payment plan.' },
  { myth: 'Clever people ALWAYS itemize. The standard deduction is for fools!',
    opts: ['Take whichever is larger. For most people that is the standard.', 'True. Itemizing always saves more.', 'You can take both at the same time.'],
    truth: 'Carry the bigger shield. Most filers come out ahead with the standard deduction.' },
  { myth: 'Box 1 of your W-2 is the money that landed in your coin purse!',
    opts: ['Box 1 is taxable wages. Take-home is the net pay on my stubs.', 'Yes, Box 1 is my take-home pay.', 'Box 1 is the tax I owe.'],
    truth: 'Box 1 is what you earned. Net pay is what you kept after withholding.', skip: 'se' },
  { myth: "Cash sales don't count if nobody sends you a form!", only: 'se',
    opts: ['All business income is taxable, form or no form.', 'True. No 1099, no tax.', 'Only sales paid by check count.'],
    truth: 'Every coin of income is taxable, whether or not a 1099 ever arrives.' },
  { myth: 'Your filing status is whatever you FEEL like on tax day!',
    opts: ['It is set by my real situation on the last day of the year.', 'Sure, pick the one with the biggest deduction.', 'Everyone files Single unless they are rich.'],
    truth: 'Status follows the facts of your life on December 31.' },
];
const B = LQ.battle = {
  cfg: null, bossHP: 7, maxHP: 7, hearts: 4, flash: 0, hurt: 0, slash: 0, scraps: 0, dead: 0, bubble: '',
  draw(g) {
    const t = LQ.time, W = LQ.BW, H = LQ.BH;
    const K = this.cfg, sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, K.sky[0]); sky.addColorStop(1, K.sky[1]); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(255,255,255,${.2 + .5 * LQ.hash(i, 1, 50) * (1 - this.fog())})`; g.fillRect(LQ.hash(i, 2, 50) * W, LQ.hash(i, 3, 50) * 80, 1, 1); }
    for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(${K.fog},${.10 * this.fog()})`; const x = (LQ.hash(i, 4, 50) * 460 + t * (5 + i * 3)) % 460 - 80, y = 10 + LQ.hash(i, 5, 50) * 110; g.fillRect(x, y, 90, 8); g.fillRect(x + 14, y - 5, 56, 18); }
    for (let x = 0; x < W; x++) { const h = 28 + Math.sin(x / 23) * 10 + Math.sin(x / 7) * 3; g.fillStyle = K.hill; g.fillRect(x, 108 - h, 1, h); }
    g.fillStyle = K.ground[0]; g.fillRect(0, 108, W, 72); g.fillStyle = K.ground[1]; g.fillRect(0, 108, W, 3);
    for (let i = 0; i < 40; i++) { g.fillStyle = K.ground[1]; g.fillRect(LQ.hash(i, 6, 50) * W, 113 + LQ.hash(i, 7, 50) * 60, 3, 1); }
    // boss
    if (this.dead < 1) {
      const bx = 212 + (this.flash > 0 ? Math.sin(t * 80) * 4 : 0), by = 28 + Math.sin(t * 2) * 4;
      g.fillStyle = 'rgba(20,16,40,.3)'; g.fillRect(bx + 10, 111, 52, 5);
      g.globalAlpha = (1 - this.dead) * (this.flash > 0 && Math.floor(t * 30) % 2 ? .4 : 1);
      g.drawImage(LQ.bossSprite(Math.floor(t * 3) % 2, K.kind), bx, by, 72, 72);
      g.globalAlpha = 1 - this.dead;
      for (let i = 0; i < 6; i++) { const a = t * 1.6 + i * 1.05, px = bx + 36 + Math.cos(a) * 48, py = by + 38 + Math.sin(a) * 18; g.fillStyle = '#f6efd9'; g.fillRect(px, py, 6, 7); g.fillStyle = '#8a7a55'; g.fillRect(px + 1, py + 2, 4, 1); g.fillRect(px + 1, py + 4, 3, 1); }
      g.globalAlpha = 1;
    }
    // myth scraps flying at the hero
    if (this.scraps > 0) for (let i = 0; i < 5; i++) { const k = LQ.clamp(1 - this.scraps + i * .08, 0, 1); g.fillStyle = K.bar[1]; g.fillRect(226 - k * 185 + Math.sin(k * 9 + i) * 8, 62 + k * 28 + i * 3, 6, 6); }
    // hero
    const hx = 22 + (this.hurt > 0 ? Math.sin(t * 70) * 3 : 0);
    g.fillStyle = 'rgba(20,16,40,.3)'; g.fillRect(hx + 2, 113, 32, 5);
    g.drawImage(LQ.charSprite(LQ.HERO.look, 'right', 0), hx, 63, 36, 52);
    if (this.slash > 0) { g.strokeStyle = '#fff3b0'; g.lineWidth = 3; g.globalAlpha = this.slash; g.beginPath(); g.moveTo(206, 100); g.lineTo(290, 30); g.moveTo(216, 108); g.lineTo(296, 44); g.stroke(); g.globalAlpha = 1; }
  },
  fog() { return this.bossHP / this.maxHP * (1 - this.dead); },
  drawUI(c) {
    const K = this.cfg; ui.panel(c, 560, 24, 370, 62); ui.text(c, K.label, 576, 34, K.bar[1], F(11, true));
    c.fillStyle = '#231a36'; c.fillRect(576, 56, 338, 18); c.fillStyle = K.bar[0]; c.fillRect(578, 58, 334 * this.bossHP / this.maxHP, 14); c.fillStyle = K.bar[1]; c.fillRect(578, 58, 334 * this.bossHP / this.maxHP, 4);
    ui.panel(c, 30, 24, 250, 62); ui.text(c, 'CONFIDENCE', 46, 34, '#ffe98a', F(11, true));
    for (let i = 0; i < 4; i++) { c.fillStyle = i < this.hearts ? '#e0564e' : '#3a3550'; const x = 48 + i * 40, y = 54; c.fillRect(x, y + 4, 28, 12); c.fillRect(x + 4, y, 8, 4); c.fillRect(x + 16, y, 8, 4); c.fillRect(x + 4, y + 16, 20, 4); c.fillRect(x + 8, y + 20, 12, 4); }
    if (this.bubble && !ui.dlg) {
      c.font = F(28); const lines = ui.wrap(c, this.bubble, 312), h = lines.length * 29 + 26, y = 104;
      c.fillStyle = '#090b18'; c.fillRect(192, y - 4, 356, h + 8); c.fillStyle = '#f6efd9'; c.fillRect(196, y, 348, h);
      c.fillStyle = '#f6efd9'; c.beginPath(); c.moveTo(544, y + 20); c.lineTo(590, y + 8); c.lineTo(544, y + 46); c.fill();
      c.textAlign = 'left'; c.textBaseline = 'top'; lines.forEach((l, i) => { c.fillStyle = K.ink; c.fillText(l, 214, y + 12 + i * 29); });
    }
  },
};
async function strike(text) {
  LQ.audio.sfx('slash'); B.slash = 1; LQ.tween(0.35, k => { B.slash = 1 - k; });
  await LQ.wait(0.15); LQ.audio.sfx('hit'); LQ.shake(0.25); B.flash = 1; B.bossHP--; await LQ.wait(0.45); B.flash = 0;
  B.bubble = ''; await LQ.say(LQ.HERO, text);
}
// Every boss is data: its look, its lines, its myths, a final question, and what winning does.
LQ.BOSSES = {
  baron: {
    who: BARON, label: 'BARON BEFUDDLE', kind: 'baron', sky: ['#120a26', '#3a1d5c'], hill: '#241640', ground: ['#e9eef6', '#cfd9e8'], fog: '170,120,220', bar: ['#b06be0', '#d8b4ff'], ink: '#5a2a86',
    approach: 'The fog thickens. Something vast and smug turns to face you.',
    intro: ['Ahh, a fresh little taxpayer! I am Baron Befuddle, the Mythmonger. Everything this village believes about taxes, I whispered first.', 'Let us see how long YOUR head stays clear. Every myth you swallow will cost you.'],
    taunt: 'Ha ha ha! Delicious. Believe it harder!', fogLine: 'The fog clouds your thoughts.',
    myths: () => { const kind = LQ.career().kind; return MYTHS.filter(m => m.skip !== kind && (!m.only || m.only === kind)); },
    final: () => {
      const f = LQ.fin(), up = f.top === .12 ? .22 : .24;
      return { bubble: `ENOUGH! Then answer this, hero. What is the tax on ${M(f.taxable)}? You will NEVER work it out!`, prompt: 'Finish it. Use the mountain:',
        opts: [f.tiers.map(t => pc(t.rate) + ' of ' + M(t.amount)).join(' + ') + ' = ' + M(f.tax), `${pc(f.top)} of all of it: ${M(f.taxable * f.top)}`, `${pc(up)} of all of it: ${M(f.taxable * up)}`],
        wrong: ['Fill the ledges from the bottom. The first slice is only 10%.', 'Your income never reaches that ledge.'], strike: `${M(f.tax)}. Layer by layer. That is all there ever was to it.` };
    },
    lastWords: 'No... NO! You were supposed to stay confused! Without confusion I am... nothing but... hot air...',
    after: 'The Mythmonger unravels into mist. For the first time in weeks, stars shine over Bracket Mountain.',
    win: async () => {
      const st = LQ.state;
      st.flags.bossDown = true; st.quest = 8; LQ.give('medal'); LQ.gain(50, 100, 'Mythmonger defeated');
      LQ.tick(); if (st.prices) { st.prev.BRKT = st.prices.BRKT; st.prices.BRKT *= 1.45; st.gazette.unshift('The fog lifts! Bracket Mountain Mining reopens the old silver mine.'); }
    },
    done: async () => { ui.toast('New quest: ' + LQ.QUESTS[8].short); await LQ.say(null, 'The fog is gone. One task remains: take everything you have learned to Town Hall and file your return.'); },
  },
};
LQ.startBattle = async (id = 'baron') => {
  const st = LQ.state, K = LQ.BOSSES[id];
  await LQ.say(null, K.approach);
  await LQ.fadeTo(1, 0.35); Object.assign(B, { cfg: K, bossHP: 7, hearts: 4, flash: 0, hurt: 0, slash: 0, scraps: 0, dead: 0, bubble: '' });
  const queue = K.myths().slice(); B.maxHP = B.bossHP = queue.length + 1;
  ui.banner = null; LQ.setScene(B); LQ.audio.play('battle'); await LQ.fadeTo(0, 0.5);
  for (const ln of K.intro) await LQ.say(K.who, ln);
  while (queue.length) {
    const m = queue.shift();
    B.bubble = m.myth; LQ.audio.sfx('wrong'); B.scraps = 1; await LQ.tween(0.5, k => { B.scraps = 1 - k; }); B.scraps = 0;
    st.asked++;
    const order = [0, 1, 2].sort(() => Math.random() - .5);
    const pick = order[await LQ.choose(LQ.HERO, 'Counter the myth:', order.map(i => m.opts[i]))];
    if (pick === 0) { st.first++; LQ.score(true); await strike(m.truth); }
    else {
      LQ.score(false); LQ.audio.sfx('hit'); LQ.shake(0.3); B.hurt = 1; B.hearts = Math.max(0, B.hearts - 1); await LQ.wait(0.5); B.hurt = 0; B.bubble = '';
      await LQ.say(K.who, K.taunt);
      await LQ.say(null, K.fogLine + ' The truth: ' + m.truth);
      queue.push(m);
      if (B.hearts === 0) { await LQ.say(null, 'You steady your breathing and open your Tax Journal. Knowledge does not run out. Your confidence returns.'); B.hearts = 4; LQ.audio.sfx('learn'); }
    }
  }
  const fin = K.final();
  B.bubble = fin.bubble; LQ.audio.sfx('wrong'); await LQ.wait(0.4);
  await LQ.ask(LQ.HERO, fin.prompt, fin.opts, { onWrong: () => { B.hurt = 1; setTimeout(() => { B.hurt = 0; }, 400); }, wrong: fin.wrong });
  await strike(fin.strike);
  await LQ.say(K.who, K.lastWords);
  LQ.audio.sfx('rumble'); LQ.shake(0.8); await LQ.tween(1.6, k => { B.dead = k; }); LQ.audio.stop(); LQ.audio.sfx('fanfare');
  await LQ.say(null, K.after);
  await K.win();
  await LQ.fadeTo(1, 0.4); LQ.world.start(); LQ.setScene(LQ.world); await LQ.fadeTo(0, 0.6);
  await K.done();
};
})();
