// Shift work: a 30-second job at your own workplace. One engine, one twist per career.
// Pay arrives with tax held back by your own W-4 or estimate choice. Shift coins never touch the tax return.
(() => {
const LQ = window.LQ, ui = LQ.ui, F = LQ.F, T = 16;
const st = () => LQ.state, sfx = n => LQ.audio.sfx(n);
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
const COLS = ['#ffcf4a', '#35f0e6', '#ff4fb0'], NAMES = ['griddle cake', 'fizz', 'fries'], XS = [70, 160, 250];
const front = () => XS.map(x => ({ x, y: 150, task: null }));
const KINDS = {
  nurse: { hint: 'Answer the call lights: walk to the bed and press Space. Red lights are urgent. They fade fast and count double.', gap: 1.5, target: 12, floor: ['#0d1a36', '#16264e'],
    spots: () => [70, 142].flatMap(y => XS.map(x => ({ x, y, task: null }))), sources: () => [],
    task: () => { const u = Math.random() < .3; return { max: u ? 3.8 : 6.5, pts: u ? 2 : 1, urgent: u }; } },
  food: { hint: 'Each customer wants one thing. Press Space at the back counter to pick it up, then Space at the customer. The wrong item earns nothing.', gap: 2.1, target: 7, floor: ['#231226', '#35193a'],
    spots: front, sources: () => XS.map((x, i) => ({ x, y: 58, item: i })),
    task: () => ({ max: 10, pts: 1, want: Math.floor(Math.random() * 3) }) },
  owner: { hint: 'Serve customers with Space. Every sale takes a candle off the shelf. When the shelf is empty, restock at the crate in the back.', gap: 1.5, target: 11, floor: ['#1c1a12', '#2e2a1a'],
    spots: front, sources: () => [{ x: 160, y: 58, restock: true }],
    task: () => ({ max: 6.5, pts: 1 }) },
};
const stepKey = s => [s.quest, s.q2, s.q3, s.q4].join('|');
const J = LQ.jobs = {
  G: null, KINDS, BOARD: [6, 24],
  // paid shifts left before the next quest step
  left(s = st()) { return s.flags.shiftQ === stepKey(s) ? Math.max(0, 2 - (s.flags.shiftN || 0)) : 2; },
  // Gross scales with the score and is capped at half a payday. Tax comes out by the player's own choice.
  pay(score, s = st()) {
    const c = LQ.career(), f = LQ.fin(), cap = Math.round(c.pay / 2), gross = Math.round(cap * Math.min(1, score / KINDS[c.id].target));
    const fed = Math.round(gross * f.per / f.gross), fica = f.kind === 'w2' ? Math.round(gross * (f.ss + f.med) / f.gross) : 0;
    return { gross, fed, fica, net: Math.max(0, gross - fed - fica), cap, rate: f.per / f.gross };
  },
  newGame(id) {
    const K = KINDS[id];
    return { id, K, t: 30, score: 0, live: false, next: .6, carry: null, stock: 3, msg: '', msgT: 0, spots: K.spots(), sources: K.sources(), p: { x: 160, y: 104, dir: 'down', moving: false, anim: 0 }, done: null };
  },
  update(dt) {
    const G = this.G; if (!G || !G.live || ui.dlg || ui.choice) return;
    const inp = LQ.input.down, p = G.p, mx = (inp.right ? 1 : 0) - (inp.left ? 1 : 0), my = (inp.down ? 1 : 0) - (inp.up ? 1 : 0), k = mx && my ? .707 : 1;
    p.moving = !!(mx || my); if (p.moving) { p.dir = my > 0 ? 'down' : my < 0 ? 'up' : mx > 0 ? 'right' : 'left'; p.anim += dt * 9; }
    p.x = LQ.clamp(p.x + mx * 96 * k * dt, 20, 300); p.y = LQ.clamp(p.y + my * 96 * k * dt, 62, 162);
    G.t -= dt; G.next -= dt; G.msgT -= dt;
    for (const s of G.spots) if (s.task && (s.task.left -= dt) <= 0) { s.task = null; sfx('wrong'); }
    if (G.next <= 0) {
      G.next = G.K.gap * (.8 + Math.random() * .4);
      const free = G.spots.filter(s => !s.task);
      if (free.length && G.spots.length - free.length < 3) { const s = free[Math.floor(Math.random() * free.length)], t = G.K.task(); t.left = t.max; s.task = t; sfx('move'); }
    }
    if (LQ.hit('ok')) this.act(G);
    if (G.t <= 0) { G.t = 0; G.live = false; G.done(G.score); }
  },
  act(G) {
    const p = G.p, near = o => Math.hypot(o.x - p.x, o.y - p.y) < 24, say = m => { G.msg = m; G.msgT = 1.6; };
    const src = G.sources.find(near), spot = G.spots.find(s => s.task && near(s));
    if (src) {
      if (src.restock) { G.stock = 3; sfx('coin'); say('Shelf restocked'); } else { G.carry = src.item; sfx('ok'); }
      return;
    }
    if (!spot) return;
    const t = spot.task;
    if (G.id === 'food') {
      if (G.carry == null) return say('Pick up the order at the back counter first');
      const right = G.carry === t.want; G.carry = null; spot.task = null;
      if (right) { G.score += t.pts; sfx('coin'); } else { sfx('wrong'); say('Wrong order'); }
    } else if (G.id === 'owner') {
      if (G.stock <= 0) { sfx('wrong'); return say('The shelf is empty. Restock at the back'); }
      G.stock--; G.score += t.pts; spot.task = null; sfx('coin');
    } else { G.score += t.pts; spot.task = null; sfx(t.urgent ? 'learn' : 'coin'); }
  },
  draw(g) {
    const G = this.G, t = LQ.time, W = LQ.BW, H = LQ.BH; if (!G) return;
    R(g, 0, 0, W, H, G.K.floor[0]);
    for (let y = 44; y < H; y += 16) for (let x = (y / 16 % 2) * 16; x < W; x += 32) R(g, x, y, 16, 16, G.K.floor[1]);
    R(g, 0, 0, W, 44, '#0a0b1e'); R(g, 0, 42, W, 2, '#9b6bff');
    LQ.fx.begin(g);
    for (const s of G.sources) {
      if (s.restock) { R(g, s.x - 12, s.y - 22, 24, 18, '#6a4526'); R(g, s.x - 12, s.y - 22, 24, 2, '#a8703c'); for (let i = 0; i < 3; i++) { R(g, s.x - 8 + i * 6, s.y - 30, 3, 8, '#fff3b0'); R(g, s.x - 8 + i * 6, s.y - 32, 3, 2, '#ffcf4a'); } }
      else { R(g, s.x - 14, s.y - 20, 28, 14, '#2c2e5c'); R(g, s.x - 14, s.y - 20, 28, 2, '#6d7299'); R(g, s.x - 5, s.y - 30, 10, 10, COLS[s.item]); R(g, s.x - 3, s.y - 28, 4, 3, '#ffffff'); }
    }
    for (const s of G.spots) {
      const a = s.task;
      if (G.id === 'nurse') {
        R(g, s.x - 14, s.y - 8, 28, 14, '#2c3a6e'); R(g, s.x - 14, s.y - 8, 28, 2, '#6d7299'); R(g, s.x - 12, s.y - 6, 8, 6, '#e6eaff');
        R(g, s.x + 10, s.y - 18, 4, 10, '#15163a'); R(g, s.x + 9, s.y - 22, 6, 5, a ? (a.urgent ? '#ff4fb0' : '#35f0e6') : '#2a2550');
      } else {
        R(g, s.x - 18, s.y + 2, 36, 8, '#2c2e5c'); R(g, s.x - 18, s.y + 2, 36, 2, '#6d7299');
        if (a) { R(g, s.x - 5, s.y + 12, 10, 12, '#8a7ab8'); R(g, s.x - 4, s.y + 6, 8, 7, '#e2b184'); }
      }
      if (a) {
        const k = a.left / a.max, by = G.id === 'nurse' ? s.y - 30 : s.y - 14, col = G.id === 'food' ? COLS[a.want] : a.urgent ? '#ff4fb0' : '#ffcf4a';
        if (G.id === 'food') { R(g, s.x - 7, by - 12, 14, 12, '#e6eaff'); R(g, s.x - 4, by - 10, 8, 8, col); }
        R(g, s.x - 10, by, 20, 3, '#15163a'); R(g, s.x - 10, by, Math.ceil(20 * k), 3, k < .3 && Math.floor(t * 10) % 2 ? '#ffffff' : col);
      }
    }
    const p = G.p, hero = LQ.charSprite(LQ.HERO.look, p.dir, p.moving ? Math.floor(p.anim) % 4 : 0);
    R(g, p.x - 6, p.y - 1, 12, 3, 'rgba(4,3,16,.45)'); g.drawImage(hero, Math.round(p.x) - 9, Math.round(p.y) - 25);
    if (G.carry != null) { R(g, p.x - 4, p.y - 36, 8, 8, COLS[G.carry]); R(g, p.x - 2, p.y - 34, 3, 2, '#ffffff'); }
    LQ.fx.end(g);
    LQ.fx.light(p.x, p.y - 12, 34, '#35f0e6', .4);
    for (const s of G.spots) if (s.task) LQ.fx.light(s.x, s.y - 12, 22, G.id === 'food' ? COLS[s.task.want] : s.task.urgent ? '#ff4fb0' : '#ffcf4a', .45);
    for (const s of G.sources) LQ.fx.light(s.x, s.y - 20, 18, s.restock ? '#ffcf4a' : COLS[s.item], .3);
    LQ.fx.flush(g, t); LQ.fx.vignette(g);
  },
  drawUI(c) {
    const G = this.G; if (!G) return;
    ui.panel(c, 30, 14, 900, 96);
    ui.text(c, LQ.career().work.toUpperCase(), 48, 26, '#ffe98a', F(11, true));
    ui.text(c, 'Done: ' + G.score, 48, 56, '#eef4ff', F(28));
    if (G.id === 'owner') ui.text(c, 'Candles on the shelf: ' + G.stock, 250, 56, G.stock ? '#eef4ff' : '#ff4fb0', F(28));
    if (G.id === 'food') ui.text(c, 'Carrying: ' + (G.carry == null ? 'nothing' : NAMES[G.carry]), 250, 56, G.carry == null ? '#6d7299' : COLS[G.carry], F(28));
    ui.text(c, Math.ceil(G.t) + 's', 912, 26, '#35f0e6', F(11, true), 'right');
    c.fillStyle = '#231a36'; c.fillRect(620, 60, 292, 16); c.fillStyle = '#35f0e6'; c.fillRect(622, 62, 288 * G.t / 30, 12);
    if (G.msgT > 0) ui.text(c, G.msg, 480, 500, '#ffe98a', F(26), 'center');
  },
  async run() {
    const s = st(), c = LQ.career(), paid = J.left(s) > 0, G = J.G = J.newGame(c.id);
    await LQ.fadeTo(1, 0.3); ui.banner = null; LQ.setScene(J); await LQ.fadeTo(0, 0.3);
    await LQ.say(null, G.K.hint);
    const score = await new Promise(done => { G.done = done; G.live = true; });
    sfx('fanfare'); await LQ.wait(0.4);
    const P = J.pay(score, s), D = LQ.docs, se = c.kind === 'se';
    if (paid) {
      const key = stepKey(s); if (s.flags.shiftQ !== key) { s.flags.shiftQ = key; s.flags.shiftN = 0; } s.flags.shiftN++;
      ui.doc = { draw(cx) {
        D.paper(cx, 240, 40, 480, 262, c.work.toUpperCase(), 'Shift pay');
        const L = (i, a, b, o) => D.line(cx, 270, 92 + i * 38, 420, a, b, o);
        L(0, 'Tasks done', String(score)); L(1, se ? 'Shift profit' : 'Gross pay', P.gross + ' coins');
        L(2, se ? 'Set aside for estimated tax' : 'Federal income tax withheld', '-' + P.fed, D.RED);
        if (!se) L(3, 'Social Security and Medicare', '-' + P.fica, D.RED);
        D.rule(cx, 270, se ? 212 : 250, 420); L(se ? 3.3 : 4.3, se ? 'Kept in the business' : 'Take-home', P.net + ' coins', D.GREEN);
      } };
      await LQ.pressOk(); ui.doc = null;
      if (P.net) LQ.gain(0, P.net, 'Shift pay');
      await LQ.say(null, se
        ? (P.fed ? `You set aside ${P.fed} of ${P.gross} coins toward your next estimated payment, the way you chose with Foreman Brannock.` : 'Nothing was set aside. You chose to skip estimated payments, so the tax on this profit waits for April, along with a penalty.')
        : `Your W-4 holds back about ${Math.round(P.rate * 100)}% of every check for federal income tax, and a shift is no different. Social Security and Medicare come out on top of that.`);
    } else await LQ.say(null, `A practice shift. You finished ${score} task${score === 1 ? '' : 's'}. Paid shifts return after your next quest step.`);
    await LQ.fadeTo(1, 0.3); J.G = null; LQ.setScene(LQ.world); await LQ.fadeTo(0, 0.4);
  },
  // the shift board by the Work Hall
  addBoard(w, s) {
    const [tx, ty] = J.BOARD;
    w.ents.push({ type: 'board', tx, ty, solid: true, base: ty * T + 15,
      use: () => LQ.script(async () => {
        if (s.quest < 2 || s.w4 == null) return LQ.say(null, 'The shift board. A note is pinned to it: "Shifts are posted once your tax payments are set up. See Foreman Brannock."');
        const c = LQ.career(), n = J.left(s);
        const i = await LQ.choose(LQ.HERO, `The shift board. A 30-second shift at ${c.work}. ` + (n ? `Paid shifts left before your next quest step: ${n}.` : 'No paid shifts are left until your next quest step, so this one is practice.'), ['Start the shift', 'Not now']);
        if (i === 0) await J.run();
      }),
      draw(g, cx, cy, tm) {
        const x = tx * T - cx, y = ty * T - cy, on = s.quest >= 2 && J.left(s) > 0;
        R(g, x + 2, y + 4, 2, 11, '#2c2e5c'); R(g, x + 12, y + 4, 2, 11, '#2c2e5c'); R(g, x, y - 8, 16, 13, '#3a2a1c'); R(g, x + 1, y - 7, 14, 11, '#6a4526');
        R(g, x + 3, y - 5, 4, 5, '#e6eaff'); R(g, x + 9, y - 4, 4, 5, on ? '#ffcf4a' : '#8a8a96'); R(g, x + 4, y + 1, 6, 2, '#e6eaff');
        if (on) LQ.fx.light(x + 8, y - 2, 14, '#ffcf4a', .3 + .1 * Math.sin(tm * 3));
      } });
  },
};
})();
