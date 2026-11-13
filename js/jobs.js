// Shift work: a 30-second job at your own workplace. One engine, one twist per career.
// Pay arrives with tax held back by your own W-4 or estimate choice. Shift coins never touch the tax return.
(() => {
const LQ = window.LQ, ui = LQ.ui, F = LQ.F, T = 16;
const st = () => LQ.state, sfx = n => LQ.audio.sfx(n);
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
const COLS = ['#ffcf4a', '#35f0e6', '#ff4fb0'], NAMES = ['griddle cake', 'fizz', 'fries'], XS = [70, 160, 250];
const SHIFT_SECONDS = 30, PRACTICE_GOAL = 3;
const front = () => XS.map(x => ({ x, y: 142, task: null }));
function foodIcon(g, x, y, item) {
  if (item === 0) R(g, x - 6, y - 2, 12, 5, COLS[item]);
  if (item === 1) R(g, x - 3, y - 5, 6, 10, COLS[item]);
  if (item === 2) for (let i = -4; i <= 4; i += 4) R(g, x + i - 1, y - 5 + Math.abs(i) / 2, 2, 9, COLS[item]);
}
const KINDS = {
  nurse: { hint: 'Walk to a lit bed and press Space. Pink lights count double and go out sooner.', gap: 1.5, target: 15, floor: ['#0d1a36', '#16264e'],
    spots: () => [70, 142].flatMap(y => XS.map(x => ({ x, y, task: null }))), sources: () => [],
    task: () => { const u = Math.random() < .3; return { max: u ? 3.8 : 6.5, pts: u ? 2 : 1, urgent: u }; } },
  food: { hint: 'Match the customer’s symbol to an item at the back counter. Press Space to pick it up, then Space by the customer to serve it.', gap: 2.1, target: 7, floor: ['#231226', '#35193a'],
    spots: front, sources: () => XS.map((x, i) => ({ x, y: 58, item: i })),
    task: () => ({ max: 10, pts: 1, want: Math.floor(Math.random() * 3) }) },
  owner: { hint: 'Press Space near a waiting customer to sell a candle. Press Space at the back crate to refill your stock.', gap: 1.5, target: 11, floor: ['#1c1a12', '#2e2a1a'],
    spots: front, sources: () => [{ x: 160, y: 58, restock: true }],
    task: () => ({ max: 6.5, pts: 1 }) },
};
const stepKey = s => [s.quest, s.q2, s.q3, s.q4].join('|');
const J = LQ.jobs = {
  G: null, KINDS, BOARD: [6, 24],
  // paid shifts left before the next quest step
  left(s = st()) { return s.flags.shiftQ === stepKey(s) ? Math.max(0, 2 - (s.flags.shiftN || 0)) : 2; },
  // Gross scales with the score and is capped at half a payday. Tax comes out by the player's own choice.
  pay(score) {
    const c = LQ.career(), f = LQ.fin(), cap = Math.round(c.pay / 2), gross = Math.round(cap * Math.min(1, score / KINDS[c.id].target));
    const fed = Math.round(gross * f.per / f.gross), fica = f.kind === 'w2' ? Math.round(gross * (f.ss + f.med) / f.gross) : 0;
    return { gross, fed, fica, net: Math.max(0, gross - fed - fica), cap };
  },
  newGame(id) {
    const K = KINDS[id];
    return { id, K, t: SHIFT_SECONDS, score: 0, live: false, next: .6, carry: null, stock: 3, msg: '', msgT: 0, spots: K.spots(), sources: K.sources(), p: { x: 160, y: 104, dir: 'down', moving: false, anim: 0 }, done: null };
  },
  update(dt) {
    const G = this.G; if (!G || !G.live || ui.dlg || ui.choice) return;
    const inp = LQ.input.down, p = G.p, mx = (inp.right ? 1 : 0) - (inp.left ? 1 : 0), my = (inp.down ? 1 : 0) - (inp.up ? 1 : 0), k = mx && my ? .707 : 1;
    p.moving = !!(mx || my); if (p.moving) { p.dir = my > 0 ? 'down' : my < 0 ? 'up' : mx > 0 ? 'right' : 'left'; p.anim += dt * 9; }
    p.x = LQ.clamp(p.x + mx * 96 * k * dt, 20, 300); p.y = LQ.clamp(p.y + my * 96 * k * dt, 62, 162);
    if (!G.practice) G.t = Math.max(0, G.t - dt);
    G.next -= dt; G.msgT -= dt;
    if (!G.practice) for (const s of G.spots) if (s.task && (s.task.left -= dt) <= 0) { s.task = null; sfx('wrong'); }
    if (G.next <= 0) {
      G.next = G.K.gap * (.8 + Math.random() * .4);
      const free = G.spots.filter(s => !s.task);
      if (free.length && G.spots.length - free.length < 3) { const s = free[Math.floor(Math.random() * free.length)], t = G.K.task(); t.left = t.max; s.task = t; sfx('move'); }
    }
    if (LQ.hit('ok') && G.t > 0) this.act(G);
    if (G.practice ? G.score >= PRACTICE_GOAL || LQ.hit('back') : G.t <= 0) { if (!G.practice) G.t = 0; G.live = false; G.done(G.score); }
  },
  act(G) {
    const p = G.p, near = o => Math.hypot(o.x - p.x, o.y - p.y) < 24, say = m => { G.msg = m; G.msgT = 1.6; };
    const src = G.sources.find(near), spot = G.spots.find(s => s.task && near(s));
    if (src) {
      if (src.restock) { G.stock = 3; sfx('coin'); say('Shelf restocked'); } else { G.carry = src.item; sfx('ok'); }
      return;
    }
    if (!spot) return say(G.id === 'nurse' ? 'Move closer to a lit bed' : 'Move closer to a waiting customer');
    const t = spot.task;
    if (G.id === 'food') {
      if (G.carry == null) return say('Pick up the order at the back counter first');
      if (G.carry !== t.want) { sfx('wrong'); return say('Match the symbol and try again'); }
      G.carry = null; spot.task = null; G.score += t.pts; sfx('coin');
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
      else { R(g, s.x - 14, s.y - 20, 28, 14, '#2c2e5c'); R(g, s.x - 14, s.y - 20, 28, 2, '#6d7299'); foodIcon(g, s.x, s.y - 12, s.item); }
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
        if (G.id === 'food') { R(g, s.x - 7, by - 12, 14, 12, '#e6eaff'); R(g, s.x - 6, by - 11, 12, 10, '#15163a'); foodIcon(g, s.x, by - 6, a.want); }
        R(g, s.x - 10, by, 20, 3, '#15163a'); R(g, s.x - 10, by, Math.ceil(20 * k), 3, k < .3 && Math.floor(t * 10) % 2 ? '#ffffff' : col);
      }
    }
    const p = G.p, hero = LQ.charSprite(LQ.HERO.look, p.dir, p.moving ? Math.floor(p.anim) % 4 : 0);
    R(g, p.x - 6, p.y - 1, 12, 3, 'rgba(4,3,16,.45)'); g.drawImage(hero, Math.round(p.x) - 9, Math.round(p.y) - 25);
    if (G.carry != null) { R(g, p.x + 9, p.y - 22, 16, 13, '#15163a'); foodIcon(g, p.x + 17, p.y - 16, G.carry); }
    LQ.fx.end(g);
    LQ.fx.light(p.x, p.y - 12, 34, '#35f0e6', .4);
    for (const s of G.spots) if (s.task) LQ.fx.light(s.x, s.y - 12, 22, G.id === 'food' ? COLS[s.task.want] : s.task.urgent ? '#ff4fb0' : '#ffcf4a', .45);
    for (const s of G.sources) LQ.fx.light(s.x, s.y - 20, 18, s.restock ? '#ffcf4a' : COLS[s.item], .3);
    LQ.fx.flush(g, t); LQ.fx.vignette(g);
  },
  drawUI(c) {
    const G = this.G; if (!G) return;
    if (ui.doc || !G.live) return;
    ui.panel(c, 30, 14, 900, 72);
    ui.text(c, LQ.career().work.toUpperCase(), 48, 26, '#ffe98a', F(11, true));
    ui.text(c, G.practice ? 'Practice: ' + G.score + ' / ' + PRACTICE_GOAL : 'Score: ' + G.score + ' / ' + G.K.target, 48, 56, '#eef4ff', F(28));
    if (G.id === 'owner') ui.text(c, 'Candles: ' + G.stock, 300, 56, G.stock ? '#eef4ff' : '#ff4fb0', F(28));
    if (G.id === 'food') ui.text(c, 'Carrying: ' + (G.carry == null ? 'nothing' : NAMES[G.carry]), 300, 56, G.carry == null ? '#c9cdea' : COLS[G.carry], F(28));
    if (G.practice) ui.text(c, 'NO TIMER. Esc: end practice', 912, 58, '#7fd6a8', F(24), 'right', 300);
    else { ui.text(c, Math.ceil(G.t) + 's', 912, 26, '#35f0e6', F(11, true), 'right');
      c.fillStyle = '#231a36'; c.fillRect(620, 60, 292, 16); c.fillStyle = '#35f0e6'; c.fillRect(622, 62, 288 * G.t / SHIFT_SECONDS, 12); }
    ui.panel(c, 180, 501, 600, 29);
    ui.text(c, G.msgT > 0 ? G.msg : 'Arrows or WASD: move    Space: interact', 480, 502, '#eef4ff', F(24), 'center', 570);
  },
  async run() {
    const s = st(), c = LQ.career(), paid = J.left(s) > 0;
    let G = J.G = J.newGame(c.id);
    await LQ.fadeTo(1, 0.3); ui.banner = null; LQ.setScene(J); await LQ.fadeTo(0, 0.3);
    // Before the first paid shift: the same floor with no clock, and lights that never go out.
    if (paid && !s.flags.shiftPractice && await LQ.choose(null, 'This is your first shift. Want a short practice first? It has no timer and no pay.', ['Practice first', 'Start the paid shift']) === 0) {
      G.practice = true;
      await LQ.say(null, G.K.hint + ` Finish ${PRACTICE_GOAL} tasks at your own pace. Nothing here is timed.`);
      await new Promise(done => { G.done = done; G.live = true; });
      sfx('learn'); await LQ.say(null, 'That is the whole job. In a paid shift you have 30 seconds, and a task that waits too long is lost.');
      G = J.G = J.newGame(c.id);
    }
    s.flags.shiftPractice = true;
    await LQ.say(null, G.K.hint + ' Use the arrow keys or WASD to move. Your 30 seconds start when this message closes.');
    const score = await new Promise(done => { G.done = done; G.live = true; });
    sfx('fanfare'); await LQ.wait(0.4);
    const P = J.pay(score), D = LQ.docs, se = c.kind === 'se';
    if (paid && P.gross > 0) {
      const key = stepKey(s); if (s.flags.shiftQ !== key) { s.flags.shiftQ = key; s.flags.shiftN = 0; } s.flags.shiftN++;
      if (P.net) LQ.gain(0, P.net, 'Shift pay');
      LQ.save();
      ui.doc = { draw(cx) {
        D.paper(cx, 190, 102, 580, 320, se ? 'SHIFT PROFIT' : 'SHIFT PAY STUB', c.name);
        const L = (i, a, b, o) => D.line(cx, 218, 154 + i * 39, 524, a, b, o);
        L(0, 'Shift score', score + ' points'); L(1, se ? 'Profit before estimated tax' : 'Gross pay', P.gross + ' coins');
        L(2, se ? 'Set aside for estimated tax' : 'Federal income tax withheld', '-' + P.fed, D.RED);
        if (!se) L(3, 'Social Security and Medicare', '-' + P.fica, D.RED);
        D.rule(cx, 218, 314, 524); L(4.4, se ? 'Kept in the business' : 'Take-home pay', P.net + ' coins', D.GREEN);
        ui.text(cx, 'Shift coins are separate from your story tax return.', 480, 381, '#4a4172', F(23), 'center', 520);
      } };
      await LQ.pressOk(); ui.doc = null;
      await LQ.say(null, se
        ? (s.w4 === 2 ? 'You skipped estimated payments. The tax may still be due when you file.' : 'Estimated payments set aside part of your profit for tax. Small shifts may round to zero coins.')
        : 'Gross pay is what you earned. Take-home pay is what is left after taxes come out. Your W-4 affects the federal income tax line.');
    } else if (paid) await LQ.say(null, 'No pay this time. You still have your paid shift. Try again when you’re ready.');
    else await LQ.say(null, `Practice score: ${score}. Paid shifts return after your next quest step.`);
    await LQ.fadeTo(1, 0.3); J.G = null; LQ.setScene(LQ.world); await LQ.fadeTo(0, 0.4);
  },
  // the shift board by the Work Hall
  addBoard(w, s) {
    const [tx, ty] = J.BOARD;
    w.ents.push({ type: 'board', tx, ty, solid: true, base: ty * T + 15,
      use: () => LQ.script(async () => {
        if (s.quest < 2 || s.w4 == null) return LQ.say(null, 'The shift board. A note is pinned to it: "Shifts are posted once your tax payments are set up. See Foreman Brannock."');
        const c = LQ.career(), n = J.left(s);
        const i = await LQ.choose(LQ.HERO, `The shift board. A 30-second shift at ${c.work}. ` + (n ? `Paid shifts left before your next quest step: ${n}.` : 'No paid shifts are left until your next quest step, so this one is practice.'), ['Start the shift', 'Back']);
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
