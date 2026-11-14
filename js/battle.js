// The summit fight. Every attack is a tax myth; the right truth is your sword.
(() => {
const LQ = window.LQ, ui = LQ.ui, F = LQ.F, M = n => LQ.money(n);
const BARON = { name: 'Baron Befuddle' };
const pc = r => Math.round(r * 100) + '%';
const MYTHS = [
  { myth: 'A raise that pushes you into a higher bracket SHRINKS your whole paycheck!',
    opts: ['Only the dollars above the line get the higher rate.', 'True. Refuse any raise near a bracket line.', 'Brackets are random. Nobody understands them.'],
    truth: 'Only the dollars above the bracket line pay the higher rate.' },
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
  cfg: null, bossHP: 7, maxHP: 7, fly: null, flash: 0, hurt: 0, slash: 0, scraps: 0, dead: 0, bubble: '', dodge: null, pos: { x: 38, y: 115 },
  update(dt) { if (this.dodge) stepDodge(this, this.dodge, dt); },
  draw(g) {
    const t = LQ.time, W = LQ.BW, H = LQ.BH;
    const K = this.cfg, sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, K.sky[0]); sky.addColorStop(1, K.sky[1]); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    LQ.fx.stars(g, t, 50, 80);
    for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(${K.fog},${.10 * this.fog()})`; const x = (LQ.hash(i, 4, 50) * 460 + t * (5 + i * 3)) % 460 - 80, y = 10 + LQ.hash(i, 5, 50) * 110; g.fillRect(x, y, 90, 8); g.fillRect(x + 14, y - 5, 56, 18); }
    for (let x = 0; x < W; x++) { const h = 28 + Math.sin(x / 23) * 10 + Math.sin(x / 7) * 3; g.fillStyle = K.hill; g.fillRect(x, 108 - h, 1, h); }
    g.fillStyle = K.ground[0]; g.fillRect(0, 108, W, 72); g.fillStyle = K.ground[1]; g.fillRect(0, 108, W, 3); g.fillStyle = K.bar[1]; g.fillRect(0, 108, W, 1);
    for (let i = 0; i < 40; i++) { g.fillStyle = K.ground[1]; g.fillRect(LQ.hash(i, 6, 50) * W, 113 + LQ.hash(i, 7, 50) * 60, 3, 1); }
    // boss
    LQ.fx.begin(g);
    if (this.dead < 1) {
      // each boss carries itself differently: the ghost drifts, the dust devil shivers, the dragon flies to its lane
      const kd = K.kind, Dg = this.dodge;
      let bx = 212 + (this.flash > 0 ? Math.sin(t * 80) * 4 : 0), by = 28 + Math.sin(t * 2) * 4;
      if (kd === 'loophole') bx += Math.sin(t * 1.1) * 9;
      else if (kd === 'slick') { bx += Math.sin(t * 9) * 2; by += Math.sin(t * 3.3) * 3; }
      else if (kd === 'glint') {
        const want = Dg && Dg.kind === 'fire' ? lanes[Dg.lane] - 40 : 22 + Math.sin(t * 1.4) * 9;
        this.fly = this.fly == null ? want : this.fly + (want - this.fly) * Math.min(1, 6 / 60);
        by = this.fly; bx += Math.sin(t * .9) * 6 - (Dg ? 4 : 0);
      }
      g.fillStyle = 'rgba(4,3,16,.5)'; g.fillRect(bx + 10, Math.max(111, by + 72), 52, 5);
      g.globalAlpha = (1 - this.dead) * (this.flash > 0 && Math.floor(t * 30) % 2 ? .4 : 1);
      g.drawImage(LQ.bossSprite(Math.floor(t * (kd === 'glint' ? 5 : 3)) % 2, K.kind), bx, by, 72, 72);
      g.globalAlpha = 1 - this.dead;
      for (let i = 0; i < 6; i++) { const a = t * 1.6 + i * 1.05, px = bx + 36 + Math.cos(a) * 48, py = by + 38 + Math.sin(a) * 18; g.fillStyle = '#e6eaff'; g.fillRect(px, py, 6, 7); g.fillStyle = '#7a74b8'; g.fillRect(px + 1, py + 2, 4, 1); g.fillRect(px + 1, py + 4, 3, 1); }
      g.globalAlpha = 1;
    }
    // myth scraps flying at the hero
    if (this.scraps > 0) for (let i = 0; i < 5; i++) { const k = LQ.clamp(1 - this.scraps + i * .08, 0, 1); g.fillStyle = K.bar[1]; g.fillRect(226 - k * 185 + Math.sin(k * 9 + i) * 8, 62 + k * 28 + i * 3, 6, 6); }
    // hero
    const D = this.dodge, P = this.pos, hx = Math.round(P.x) - 16 + (this.hurt > 0 ? Math.sin(t * 70) * 3 : 0), hy = Math.round(P.y);
    if (D) drawDodge(g, this, D, t);
    g.fillStyle = 'rgba(4,3,16,.5)'; g.fillRect(hx, hy - 2, 32, 5);
    const walk = D && D.moving ? Math.floor(t * 8) % 4 : 0;
    if (!(D && D.inv > 0 && Math.floor(t * 14) % 2)) g.drawImage(LQ.charSprite(LQ.HERO.look, 'right', walk), hx, hy - 48, 32, 48);
    if (D && D.block) { g.fillStyle = '#35f0e6'; g.fillRect(hx + 29, hy - 34, 3, 24); g.fillStyle = '#eef4ff'; g.fillRect(hx + 30, hy - 30, 1, 16); }
    LQ.fx.end(g); LQ.fx.light(hx + 16, hy - 23, 36, '#35f0e6', .4);
    if (D) lightDodge(this, D);
    if (this.scraps > 0) LQ.fx.light(226 - LQ.clamp(1 - this.scraps, 0, 1) * 185, 76, 14, K.bar[1], .6);
    LQ.fx.flush(g, t); LQ.fx.vignette(g);
    if (this.slash > 0) { g.strokeStyle = '#fff3b0'; g.lineWidth = 3; g.globalAlpha = this.slash; g.beginPath(); g.moveTo(206, 100); g.lineTo(290, 30); g.moveTo(216, 108); g.lineTo(296, 44); g.stroke(); g.globalAlpha = 1; }
  },
  fog() { return this.bossHP / this.maxHP * (1 - this.dead); },
  drawUI(c) {
    const K = this.cfg; ui.panel(c, 560, 24, 370, 62); ui.text(c, K.label, 576, 34, K.bar[1], F(11, true), 'left', 338);
    c.fillStyle = '#231a36'; c.fillRect(576, 56, 338, 18); c.fillStyle = K.bar[0]; c.fillRect(578, 58, 334 * this.bossHP / this.maxHP, 14); c.fillStyle = K.bar[1]; c.fillRect(578, 58, 334 * this.bossHP / this.maxHP, 4);
    const max = LQ.kit.maxHp(), hp = LQ.kit.hp();
    ui.panel(c, 30, 24, 54 + max * 40, 62); ui.text(c, 'HEARTS', 46, 34, '#ffe98a', F(11, true));
    for (let i = 0; i < max; i++) LQ.kit.heart(c, 48 + i * 40, 54, LQ.clamp(hp - i, 0, 1), 4);
    if (this.dodge && !ui.dlg) {
      const D = this.dodge, shield = D.M.shield && LQ.state.items.includes('shield');
      c.fillStyle = 'rgba(9,11,24,.92)'; c.fillRect(80, 100, 800, 34);
      ui.text(c, D.M.tip + (D.need > 1 ? '  ' + D.got + '/' + D.need : '') + (shield ? '   Hold E: shield' : ''), 480, 104, '#ffe98a', F(24), 'center', 760);
      // the myth this round is about stays on screen, so the dodge and the question are one beat
      if (D.myth) { c.font = F(22); const lines = ui.wrap(c, 'MYTH: ' + D.myth, 440).slice(0, 3); c.fillStyle = 'rgba(9,11,24,.8)'; c.fillRect(80, 140, 470, lines.length * 24 + 12); c.textAlign = 'left'; c.textBaseline = 'top'; lines.forEach((l, i) => { c.fillStyle = '#c9cdea'; c.fillText(l, 92, 146 + i * 24); }); }
    }
    if (this.bubble && !this.dodge && !ui.dlg && !ui.choice) {
      c.font = F(28); const lines = ui.wrap(c, this.bubble, 312), h = lines.length * 29 + 26, y = 104;
      c.fillStyle = '#090b18'; c.fillRect(192, y - 4, 356, h + 8); c.fillStyle = '#e6eaff'; c.fillRect(196, y, 348, h);
      c.fillStyle = '#e6eaff'; c.beginPath(); c.moveTo(544, y + 20); c.lineTo(590, y + 8); c.lineTo(544, y + 46); c.fill();
      c.textAlign = 'left'; c.textBaseline = 'top'; lines.forEach((l, i) => { c.fillStyle = K.ink; c.fillText(l, 214, y + 12 + i * 29); });
    }
  },
};
// The movement phase: cross the field, dodge the boss's attack, and grab the pickup to earn your answer.
// Every boss has its own pattern (`move` on its config). Each one warns before it hurts, a hit costs a quarter heart,
// and after three hits or the time limit the pickup comes to you.
//   bolts  (Mythmonger): myth bolts fly along lanes. The Standard Shield blocks them.
//   beam   (Loophole):   the lighthouse lamp marks a strip of sand, then floods it with light. Step out of the strip.
//   devils (Slick):      dust devils bounce around the field while you collect three cash slips.
//   fire   (Glint):      the dragon flies to a lane and breathes fire along it, and drops hot tips from above.
const FIELD = { x0: 18, x1: 196, y0: 122, y1: 174 };
const HIT = 0.25, MISS = 0.5;
const MOVES = {
  bolts: { tip: 'Dodge the myth bolts. Reach the gold shard.', limit: 6, shield: true },
  beam: { tip: 'Step out of the marked sand before the lamp flashes. Reach the shard.', limit: 8 },
  devils: { tip: 'Grab all 3 cash slips. Keep clear of the dust devils.', limit: 10, need: 3 },
  fire: { tip: 'Leave the glowing lane before the fire. Watch for falling tips.', limit: 8, shield: true },
};
const lanes = [0, 1, 2].map(i => FIELD.y0 + 9 + i * 17);   // three rows for the dragon's breath
const laneOf = y => LQ.clamp(Math.round((y - lanes[0]) / 17), 0, 2);
const placePickup = D => { D.sx = D.need - D.got > 1 ? 60 + Math.random() * 120 : 176; D.sy = FIELD.y0 + 6 + Math.random() * (FIELD.y1 - FIELD.y0 - 12); };
function hitHero(B, D, block) {
  const st = LQ.state, P = B.pos;
  if (block && D.block) { LQ.audio.sfx('ok'); return; }
  if (D.inv > 0 || D.hits >= 3 || D.elapsed >= D.M.limit) return;
  st.hp = Math.max(0, LQ.kit.hp() - HIT); D.lost += HIT; D.hits++; D.inv = 1;
  P.x = Math.max(FIELD.x0, P.x - 10); LQ.audio.sfx('hit'); LQ.shake(0.2); B.hurt = 1; LQ.wait(0.3).then(() => { B.hurt = 0; });
}
function stepDodge(B, D, dt) {
  const inp = LQ.input.down, P = B.pos, st = LQ.state, M = D.M, live = D.hits < 3 && D.elapsed < M.limit;
  D.block = !!M.shield && !!inp.use && st.items.includes('shield');
  const sp = 74 * (D.block ? .45 : 1), mx = (inp.right ? 1 : 0) - (inp.left ? 1 : 0), my = (inp.down ? 1 : 0) - (inp.up ? 1 : 0), k = mx && my ? .707 : 1;
  D.moving = !!(mx || my);
  P.x = LQ.clamp(P.x + mx * sp * k * dt, FIELD.x0, FIELD.x1); P.y = LQ.clamp(P.y + my * sp * k * dt, FIELD.y0, FIELD.y1);
  D.inv -= dt; D.next -= dt; D.elapsed += dt;
  if (D.kind === 'bolts') {
    if (D.next <= 0 && live) {
      D.next = D.gap; D.n++;
      // every other bolt is aimed at where you stand; the rest sweep a random lane
      const y = D.n % 2 ? P.y : FIELD.y0 + Math.random() * (FIELD.y1 - FIELD.y0);
      D.bolts.push({ x: 222, y: LQ.clamp(y, FIELD.y0, FIELD.y1), v: D.speed }); LQ.audio.sfx('move');
    }
    for (const b of D.bolts) { b.x -= b.v * dt; if (Math.abs(b.x - P.x) < 9 && Math.abs(b.y - P.y) < 8) { b.x = -99; hitHero(B, D, true); } }
    D.bolts = D.bolts.filter(b => b.x > -8);
  } else if (D.kind === 'beam') {
    // a strip of sand is marked for `warn` seconds, then lit for a moment. Every other strip starts where you stand.
    if (D.next <= 0 && live) {
      D.next = D.gap; D.n++;
      const w = 30, x = D.n % 2 ? P.x - w / 2 : FIELD.x0 + Math.random() * (FIELD.x1 - FIELD.x0 - w);
      D.beams.push({ x: LQ.clamp(x, FIELD.x0 - 6, FIELD.x1 - w + 6), w, warn: D.warn, on: .4 }); LQ.audio.sfx('warn');
    }
    for (const b of D.beams) {
      if (b.warn > 0) { b.warn -= dt; if (b.warn <= 0) LQ.audio.sfx('beam'); }
      else { b.on -= dt; if (P.x > b.x && P.x < b.x + b.w) hitHero(B, D); }
    }
    D.beams = D.beams.filter(b => b.on > 0);
  } else if (D.kind === 'devils') {
    // dust devils form for a moment (harmless and faint), then bounce around the field
    for (const v of D.devils) {
      if (v.form > 0) { v.form -= dt; continue; }
      v.x += v.vx * dt; v.y += v.vy * dt;
      if (v.x < FIELD.x0 + 4 || v.x > FIELD.x1 + 14) { v.vx = -v.vx; v.x = LQ.clamp(v.x, FIELD.x0 + 4, FIELD.x1 + 14); }
      if (v.y < FIELD.y0 || v.y > FIELD.y1) { v.vy = -v.vy; v.y = LQ.clamp(v.y, FIELD.y0, FIELD.y1); }
      if (live && Math.abs(v.x - P.x) < 10 && Math.abs(v.y - P.y) < 9) hitHero(B, D);
    }
  } else if (D.kind === 'fire') {
    // the dragon flies to a lane, the lane glows as a warning, then fire runs along it. Hot tips drop on a marked spot.
    if (D.next <= 0 && live) {
      D.next = D.gap; D.n++;
      const mine = laneOf(P.y), lane = D.n % 3 === 2 ? (mine + 1 + Math.floor(Math.random() * 2)) % 3 : mine;
      D.fires.push({ lane, warn: D.warn, on: .5 }); D.lane = lane; LQ.audio.sfx('warn');
      if (D.round >= 2 && D.n % 2 === 0) D.fires.push({ lane: (lane + 1) % 3, warn: D.warn + .15, on: .5 });
      if (D.n % 2 === 0) D.drops.push({ x: P.x, y: P.y, warn: D.warn + .2 });
    }
    for (const f of D.fires) {
      if (f.warn > 0) { f.warn -= dt; if (f.warn <= 0) LQ.audio.sfx('fire'); }
      else { f.on -= dt; if (laneOf(P.y) === f.lane) hitHero(B, D, true); }
    }
    D.fires = D.fires.filter(f => f.on > 0);
    for (const c of D.drops) { c.warn -= dt; if (c.warn <= 0 && !c.done) { c.done = true; LQ.audio.sfx('stamp'); if (Math.abs(c.x - P.x) < 10 && Math.abs(c.y - P.y) < 8) hitHero(B, D); } }
    D.drops = D.drops.filter(c => c.warn > -.25);
  }
  // mercy: after three hits or the time limit, the pickup comes to you
  if (!live) { const dx = P.x - D.sx, dy = P.y - D.sy, d = Math.hypot(dx, dy) || 1; D.sx += dx / d * 60 * dt; D.sy += dy / d * 60 * dt; }
  if (Math.abs(P.x - D.sx) < 12 && Math.abs(P.y - D.sy) < 10) {
    D.got++;
    if (D.got < D.need) { LQ.audio.sfx('coin'); placePickup(D); }
    else { B.dodge = null; LQ.audio.sfx('learn'); D.done(D.lost); }
  }
}
// Drawn on the pixel buffer, behind the hero.
function drawDodge(g, B, D, t) {
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const top = FIELD.y0 - 12, hgt = FIELD.y1 - top + 4;
  if (D.kind === 'beam') for (const b of D.beams) {
    if (b.warn > 0) { // dashed outline that blinks faster as the flash gets close
      if (Math.floor(t * (b.warn < .3 ? 16 : 8)) % 2) { for (let y = top; y < top + hgt; y += 6) { R(b.x, y, 1, 3, '#8fe6da'); R(b.x + b.w - 1, y, 1, 3, '#8fe6da'); } }
      g.fillStyle = 'rgba(143,230,218,' + (b.warn < .3 ? .34 : .22) + ')'; g.fillRect(b.x, top, b.w, hgt); R(b.x, top, b.w, 1, '#8fe6da');
    } else { g.fillStyle = 'rgba(255,243,176,.75)'; g.fillRect(b.x, 0, b.w, top + hgt); R(b.x + 4, 0, b.w - 8, top + hgt, '#ffffff'); }
  }
  if (D.kind === 'fire') {
    for (const f of D.fires) {
      const y = lanes[f.lane] - 9;
      if (f.warn > 0) { g.fillStyle = 'rgba(255,138,58,.22)'; g.fillRect(FIELD.x0 - 8, y, 206, 17); if (Math.floor(t * (f.warn < .3 ? 16 : 8)) % 2) { R(FIELD.x0 - 8, y, 206, 1, '#ffcf4a'); R(FIELD.x0 - 8, y + 16, 206, 1, '#ffcf4a'); } }
      else for (let x = FIELD.x0 - 8; x < 214; x += 6) { const h = 9 + Math.floor(LQ.hash(x, Math.floor(t * 20), 9) * 8); R(x, y + 16 - h, 6, h, '#ff8a3a'); R(x + 1, y + 16 - h + 3, 4, Math.max(1, h - 5), '#ffcf4a'); R(x + 2, y + 13, 2, 3, '#ffffff'); }
    }
    for (const c of D.drops) {
      if (c.warn > 0) { const r = 4 + Math.round(c.warn * 5); R(c.x - r, c.y - 1, r * 2, 3, 'rgba(4,3,16,.55)'); if (Math.floor(t * 12) % 2) { R(c.x - 6, c.y, 12, 1, '#ff4fb0'); R(c.x, c.y - 3, 1, 7, '#ff4fb0'); } const fy = c.y - 14 - c.warn * 130; R(c.x - 3, fy, 7, 7, '#ffcf4a'); R(c.x - 1, fy + 2, 3, 3, '#fff3b0'); }
      else { R(c.x - 7, c.y - 3, 14, 5, '#ffcf4a'); R(c.x - 3, c.y - 6, 6, 3, '#fff3b0'); }
    }
  }
  // the pickup: a gold truth shard, or a cash slip in the Gulch
  const sy = D.sy - 16 + Math.round(Math.sin(t * 5) * 2);
  R(D.sx - 5, D.sy - 1, 10, 3, 'rgba(4,3,16,.5)');
  if (D.kind === 'devils') { R(D.sx - 4, sy - 5, 9, 11, '#fdf8e7'); R(D.sx - 2, sy - 2, 5, 1, '#1f6f5c'); R(D.sx - 2, sy, 5, 1, '#1f6f5c'); R(D.sx - 2, sy + 2, 3, 1, '#1f6f5c'); }
  else { R(D.sx - 2, sy - 6, 4, 12, '#ffcf4a'); R(D.sx - 4, sy - 3, 8, 6, '#ffcf4a'); R(D.sx - 1, sy - 4, 2, 5, '#fff3b0'); }
  if (D.kind === 'bolts') for (const b of D.bolts) { R(b.x - 3, b.y, 6, 2, 'rgba(4,3,16,.4)'); R(b.x - 4, b.y - 15, 8, 5, '#ff4fb0'); R(b.x - 2, b.y - 14, 3, 2, '#ffffff'); }
  if (D.kind === 'devils') for (const v of D.devils) {
    g.globalAlpha = v.form > 0 ? .35 : 1;
    R(v.x - 6, v.y - 1, 12, 3, 'rgba(4,3,16,.45)');
    for (let i = 0; i < 6; i++) { const w = 4 + i * 2, o = Math.round(Math.sin(t * 14 + i * 1.3 + v.x * .1) * 2); R(v.x - w / 2 + o, v.y - 3 - i * 4, w, 3, i % 2 ? '#e6a04a' : '#c9781c'); }
    R(v.x - 2, v.y - 22, 2, 2, '#fff3b0'); R(v.x + 2, v.y - 22, 2, 2, '#fff3b0');
    g.globalAlpha = 1;
  }
}
function lightDodge(B, D) {
  LQ.fx.light(D.sx, D.sy - 16, 20, '#ffcf4a', .7);
  if (D.kind === 'bolts') for (const b of D.bolts) LQ.fx.light(b.x, b.y - 12, 10, '#ff4fb0', .5);
  if (D.kind === 'beam') for (const b of D.beams) if (b.warn <= 0) LQ.fx.light(b.x + b.w / 2, 140, 46, '#fff3b0', .7);
  if (D.kind === 'devils') for (const v of D.devils) if (v.form <= 0) LQ.fx.light(v.x, v.y - 12, 12, '#ff8a3a', .4);
  if (D.kind === 'fire') for (const f of D.fires) if (f.warn <= 0) for (let x = 40; x < 200; x += 50) LQ.fx.light(x, lanes[f.lane], 26, '#ff8a3a', .6);
}
async function dodgePhase(round, myth) {
  const P = B.pos, fx = P.x, fy = P.y, K = B.cfg, kind = K.move === true ? 'bolts' : K.move, M = MOVES[kind];
  await LQ.tween(0.25, k => { P.x = fx + (38 - fx) * k; P.y = fy + (148 - fy) * k; });
  await new Promise(done => {
    const D = { kind, M, myth, round, sx: 176, sy: 0, need: M.need || 1, got: 0, bolts: [], beams: [], devils: [], fires: [], drops: [], lane: 1,
      next: kind === 'bolts' ? 0.5 : 0.9, n: 0, hits: 0, inv: 0, lost: 0, elapsed: 0, done,
      gap: kind === 'bolts' ? Math.max(0.36, 0.62 - round * 0.035) : kind === 'beam' ? Math.max(0.7, 1.05 - round * 0.05) : Math.max(0.95, 1.4 - round * 0.06),
      warn: Math.max(0.6, 0.9 - round * 0.04), speed: Math.min(150, 92 + round * 8) };
    placePickup(D);
    if (kind === 'devils') for (let i = 0; i < (round >= 3 ? 3 : 2); i++) { const a = (.5 + Math.random()) * (Math.random() < .5 ? 1 : -1), v = Math.min(78, 50 + round * 4); D.devils.push({ x: 150 + i * 22, y: FIELD.y0 + 8 + i * 18, vx: -Math.cos(a) * v, vy: Math.sin(a) * v, form: .9 }); }
    B.dodge = D;
  });
}
// Hearts are the same hearts you carry in the world. At zero you never lose the fight: you catch your breath at two hearts.
async function secondWind() {
  const st = LQ.state; if (LQ.kit.hp() > 0) return;
  await LQ.say(null, 'You steady your breathing and open your Tax Journal. Knowledge does not run out. Two hearts return.');
  st.hp = Math.min(LQ.kit.maxHp(), 2); LQ.audio.sfx('learn');
}
async function strike(text) {
  LQ.audio.sfx('slash'); B.slash = 1; LQ.tween(0.35, k => { B.slash = 1 - k; });
  await LQ.wait(0.15); LQ.audio.sfx('hit'); LQ.shake(0.25); B.flash = 1; B.bossHP--; await LQ.wait(0.45); B.flash = 0;
  B.bubble = ''; await LQ.say(LQ.HERO, text);
}
// Every boss is data: its look, its lines, its myths, a final question, and what winning does.
LQ.BOSSES = {
  baron: {
    who: BARON, label: 'BARON BEFUDDLE', kind: 'baron', move: 'bolts', sky: ['#06051a', '#2a1458'], hill: '#150f30', ground: ['#1d1b40', '#3d3c80'], fog: '170,120,220', bar: ['#b06be0', '#d8b4ff'], ink: '#5a2a86',
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
  await LQ.fadeTo(1, 0.35); Object.assign(B, { cfg: K, bossHP: 7, fly: null, flash: 0, hurt: 0, slash: 0, scraps: 0, dead: 0, bubble: '', dodge: null, pos: { x: 38, y: 115 } });
  const queue = K.myths().slice(), attempted = new Set(); let round = 0; B.maxHP = B.bossHP = queue.length + 1;
  ui.banner = null; LQ.setScene(B); LQ.audio.play(K.music || 'battle'); await LQ.fadeTo(0, 0.5);
  for (const ln of K.intro) await LQ.say(K.who, ln);
  while (queue.length) {
    const m = queue.shift();
    B.bubble = m.myth; LQ.audio.sfx('wrong'); B.scraps = 1; await LQ.tween(0.5, k => { B.scraps = 1 - k; }); B.scraps = 0;
    const first = !attempted.has(m);
    if (K.move && first) await dodgePhase(round++, m.myth);
    await secondWind();
    attempted.add(m);
    if (first) st.asked++;
    const order = LQ.shuffle([0, 1, 2]);
    const pick = order[await LQ.choose(K.who, m.myth, order.map(i => m.opts[i]))];
    if (pick === 0) {
      if (first) { st.first++; LQ.score(true); }
      await strike(m.truth);
    } else {
      if (first) LQ.score(false);
      LQ.audio.sfx('hit'); LQ.shake(0.3); B.hurt = 1; st.hp = Math.max(0, LQ.kit.hp() - MISS); await LQ.wait(0.5); B.hurt = 0; B.bubble = '';
      await LQ.say(K.who, K.taunt);
      await LQ.say(null, K.fogLine + ' The truth: ' + m.truth);
      queue.push(m);
      await secondWind();
    }
  }
  const fin = K.final();
  B.bubble = fin.bubble; LQ.audio.sfx('wrong'); await LQ.wait(0.4);
  await LQ.ask(K.who, fin.bubble, fin.opts, { onWrong: async () => { B.hurt = 1; await LQ.wait(0.4); B.hurt = 0; }, wrong: fin.wrong });
  await strike(fin.strike);
  await LQ.say(K.who, K.lastWords);
  LQ.audio.sfx('rumble'); LQ.shake(0.8); await LQ.tween(1.6, k => { B.dead = k; }); LQ.audio.stop(); LQ.audio.sfx('fanfare');
  await LQ.say(null, K.after);
  await K.win(); LQ.save();
  await LQ.fadeTo(1, 0.4); LQ.world.start(); LQ.setScene(LQ.world); await LQ.fadeTo(0, 0.6);
  await K.done();
};
})();
