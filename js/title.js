// Title screen and opening.
(() => {
const LQ = window.LQ, ui = LQ.ui, F = LQ.F;
const careerSelect = LQ.careerSelect = () => {
  return new Promise(res => {
    const ids = ['nurse', 'owner', 'food']; let sel = 0, done = false;
    const pay = { nurse: '$83,200 a year in wages', owner: '$52,000 a year in profit', food: '$31,200 a year in wages' };
    LQ.setScene({
      update() {
        if (done) return;
        if (LQ.hit('left')) { sel = (sel + 2) % 3; LQ.audio.sfx('move'); }
        if (LQ.hit('right')) { sel = (sel + 1) % 3; LQ.audio.sfx('move'); }
        if (LQ.hit('ok')) { done = true; LQ.audio.sfx('fanfare'); res(ids[sel]); }
      },
      draw(g) { const s = g.createLinearGradient(0, 0, 0, LQ.BH); s.addColorStop(0, '#06051a'); s.addColorStop(1, '#241452'); g.fillStyle = s; g.fillRect(0, 0, LQ.BW, LQ.BH); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${.2 + .4 * Math.abs(Math.sin(LQ.time + i))})`; g.fillRect(LQ.hash(i, 1, 70) * LQ.BW, LQ.hash(i, 2, 70) * LQ.BH, 1, 1); } },
      drawUI(c) {
        ui.text(c, 'CHOOSE YOUR CAREER', LQ.VW / 2, 34, '#35f0e6', F(24, true), 'center');
        ui.text(c, 'Your job decides your pay, your tax forms, and your path to Tax Tycoon', LQ.VW / 2, 74, '#c9cdea', F(26), 'center', 888);
        ids.forEach((id, i) => {
          const cr = LQ.CAREERS[id], on = i === sel, x = 52 + i * 292, y = on ? 112 + Math.sin(LQ.time * 4) * 4 : 124, w = 272, h = 348;
          c.globalAlpha = on ? 1 : .6; ui.panel(c, x, y, w, h, on ? '#161a4a' : '#0d0f2a');
          if (on) { c.strokeStyle = '#35f0e6'; c.lineWidth = 4; c.strokeRect(x - 5, y - 5, w + 10, h + 10); }
          c.fillStyle = '#1a1d4a'; c.fillRect(x + 76, y + 16, 120, 132); c.imageSmoothingEnabled = false;
          c.drawImage(LQ.charSprite(Object.assign({ id: 'card-' + id }, cr.look), 'down', on ? Math.floor(LQ.time * 5) % 4 : 0), x + 96, y + 22, 80, 120);
          c.font = F(13, true); ui.wrap(c, cr.name.toUpperCase(), 250).forEach((ln, k, a) => ui.text(c, ln, x + w / 2, y + 160 + k * 20 - (a.length - 1) * 4, '#a8fff6', F(13, true), 'center'));
          ui.text(c, pay[id], x + w / 2, y + 200, '#eef4ff', F(24), 'center', w - 24);
          ui.text(c, 'Difficulty: ' + cr.diff, x + w / 2, y + 226, '#7fd6a8', F(22), 'center');
          cr.lines.forEach((ln, k) => ui.text(c, ln, x + w / 2, y + 262 + k * 25, '#c9cdea', F(20), 'center', w - 24));
          c.globalAlpha = 1;
        });
        ui.text(c, 'Left / Right to choose, Space to confirm', LQ.VW / 2, 496, '#eef4ff', F(26), 'center');
      },
    });
  });
};
// What the title screen shows for a save slot.
function slotInfo(n) {
  const s = LQ.loadSlot(n); if (!s) return null;
  const keep = LQ.state; let rank = '';
  LQ.state = s; try { rank = LQ.rank(); } catch (e) { rank = ''; } LQ.state = keep;
  const c = LQ.CAREERS[s.career];
  return { career: c ? c.name : 'New hero', chapter: s.q4 != null ? (s.q4 >= 9 ? 'Game complete' : 'Chapter 4') : s.q3 != null ? (s.q3 >= 8 ? 'Ch.3 complete' : 'Chapter 3') : s.q2 != null ? (s.q2 >= 8 ? 'Ch.2 complete' : 'Chapter 2') : s.quest >= 9 ? 'Ch.1 complete' : 'Chapter 1', coins: s.coins, rank };
}
const T = LQ.title = {
  sel: 0, locked: false, info: [], file: null, backRes: null, msg: '',
  enter() { LQ.started = false; LQ.migrateSaves(); this.refresh(); this.sel = Math.max(0, this.info.findIndex(x => x)); this.locked = false; LQ.audio.play('title'); },
  refresh() { this.info = [1, 2, 3].map(slotInfo); },
  update() {
    if (this.backRes && LQ.hit('back')) { const r = this.backRes; this.backRes = null; r(null); }
    if (this.locked) return;
    if (LQ.hit('up')) { this.sel = (this.sel + 2) % 3; LQ.audio.sfx('move'); }
    if (LQ.hit('down')) { this.sel = (this.sel + 1) % 3; LQ.audio.sfx('move'); }
    if (LQ.hit('ok')) { this.locked = true; LQ.audio.sfx('ok'); this.pick(this.sel + 1).catch(e => { console.error(e); this.locked = false; }); }
  },
  async pick(n) {
    const s = LQ.loadSlot(n), i = this.info[n - 1], back = () => { LQ.gesture = null; this.refresh(); this.locked = false; };
    if (s) {
      let done = null;
      const a = await LQ.choose(null, `Slot ${n}: ${i.career}, ${i.chapter}, ${i.coins} coins.`, ['Continue', 'Save a backup file', 'Delete this save', 'Back'], k => { LQ.gesture = k === 1 ? () => { done = LQ.exportSlot(n); } : null; });
      LQ.gesture = null;
      if (a === 0) return this.launch(n, s);
      if (a === 1) {
        if (done == null) done = LQ.exportSlot(n);
        await LQ.say(null, done ? `Backup saved as ledger-quest-slot${n}.json in your downloads folder. Keep it somewhere safe. You can load it into any empty slot, on any computer.` : 'The backup could not be saved.');
      }
      if (a === 2 && await LQ.choose(null, `Delete the save in slot ${n} for good? This cannot be undone.`, ['Back', 'Yes, delete it']) === 1) { LQ.deleteSlot(n); LQ.audio.sfx('wrong'); }
      return back();
    }
    const a = await LQ.choose(null, `Slot ${n} is empty.`, ['New Game', 'Load a backup file', 'Back'], k => { LQ.gesture = k === 1 ? () => { this.file = LQ.pickFile(); } : null; });
    LQ.gesture = null;
    if (a === 0) {
      const c = await LQ.choose(null, 'Where do you want to start?', ['Chapter 1: Paystub Village (start here)', 'Chapter 2: Shelter Coast (skip ahead with a starter kit)', 'Chapter 3: Hustle Canyon (skip ahead with a starter kit)', 'Chapter 4: Summit of Gains (skip ahead with a starter kit)', 'Back']);
      if (c < 4) return this.launch(n, null, c);
    }
    if (a === 1) {
      const f = this.file; this.file = null;
      if (!f) await LQ.say(null, 'The file window did not open. Please try again.');
      else {
        this.msg = 'Choose your backup file in the window that opened.  Esc: cancel';
        const text = await Promise.race([f, new Promise(r => { this.backRes = r; })]);
        this.msg = ''; this.backRes = null;
        if (text != null) {
          const ok = LQ.importText(text, n); LQ.audio.sfx(ok ? 'fanfare' : 'wrong'); this.refresh();
          await LQ.say(null, ok ? `Backup loaded into slot ${n}.` : 'That file is not a Ledger Quest backup, or it is damaged. Nothing was changed.');
        }
      }
    }
    return back();
  },
  async launch(n, saved, skip) {
    LQ.slot = n;
    await LQ.fadeTo(1, 0.5);
    LQ.state = saved || LQ.newState();
    LQ.started = true;
    if (!saved) {
      LQ.setScene({ draw(g) { g.fillStyle = '#07081a'; g.fillRect(0, 0, LQ.BW, LQ.BH); } }); LQ.fadeA = 0; LQ.busy++;
      if (skip) await LQ.say(null, ['', 'You are skipping ahead. Your hero has already finished Chapter 1 in Paystub Village: the Mythmonger is beaten, the first return is filed, and there are 500 coins in the purse.',
        'You are skipping ahead. Your hero has already finished Chapters 1 and 2: two returns filed, a cottage by the sea, a marriage to Marlowe, a stepdaughter called Coral, and 900 coins in the purse.',
        'You are skipping ahead. Your hero has already finished Chapters 1 to 3: three returns filed, a family in Shelter Coast, a side gig in Hustle Canyon, and 1,400 coins in the purse.'][skip]);
      // The playable opening picks the career from a letter in the cottage. Skipping it picks the career here, as before.
      const play = !skip && await LQ.choose(null, 'How do you want to begin?', ['Play the tutorial', 'Skip the tutorial']) === 0;
      if (play) Object.assign(LQ.state, { px: 16 * 16 + 8, py: 34 * 16 + 14, dir: 'down' }).flags.intro = 1;
      else {
        LQ.state.flags.intro = 9;
        LQ.state.coins = 20;
        await LQ.say(null, skip ? 'First, though: what does your hero do for a living?' : 'Good news: that is about to change. First, though: what do you do for a living?');
        LQ.state.career = await careerSelect(); LQ.initMarket();
      }
      if (skip) LQ.CH2.starter();
      if (skip >= 2) LQ.CH3.starter();
      if (skip >= 3) await LQ.CH4.starter();
      LQ.busy--; await LQ.fadeTo(1, 0.4);
    }
    LQ.world.start(); if (LQ.intro.active()) LQ.intro.resume(LQ.world);
    LQ.setScene(LQ.world); await LQ.fadeTo(0, 0.7);
    if (!saved) ui.showBanner(LQ.world.R.title, LQ.world.R.sub());
    LQ.save();
    const R = LQ.world.R; if (R.arrive) LQ.script(() => R.arrive(LQ.world));
  },
  draw(g) {
    const t = LQ.time, W = LQ.BW, H = LQ.BH;
    const fx = LQ.fx, N = LQ.NEON, wrap = (v, n) => ((v % n) + n) % n;
    // stepped night sky, stars, and a cold moon
    ['#05051a', '#080722', '#0c0a2c', '#110d38', '#171044', '#1f1352', '#2a1660', '#38196c', '#481c76', '#5a1f7c'].forEach((col, i) => { g.fillStyle = col; g.fillRect(0, Math.floor(i * H * .074), W, H); });
    fx.stars(g, t, 70, 96);
    const mx = 294, my = 22, mr = 14;
    g.globalCompositeOperation = 'lighter'; g.drawImage(LQ.glow('#9b6bff', 80), mx - 80, my - 80); g.drawImage(LQ.glow('#35f0e6', 44), mx - 44, my - 44); g.globalCompositeOperation = 'source-over';
    for (let dy = -mr; dy <= mr; dy++) { const hw = Math.round(Math.sqrt(mr * mr - dy * dy)); g.fillStyle = dy < -5 ? '#f2fbff' : dy < 5 ? '#c8f4ff' : '#9fdcf2'; g.fillRect(mx - hw, my + dy, hw * 2, 1); }
    g.fillStyle = '#9fdcf2'; g.fillRect(mx - 8, my - 6, 5, 3); g.fillRect(mx + 3, my + 1, 6, 4); g.fillRect(mx - 4, my + 7, 3, 2);
    // aurora ribbons
    for (let i = 0; i < 6; i++) { const x = Math.floor(wrap(LQ.hash(i, 3, 60) * 420 + t * (3 + i), 420)) - 70, y = 18 + i * 12; g.fillStyle = i % 2 ? 'rgba(255,79,176,.10)' : 'rgba(53,240,230,.10)'; g.fillRect(x, y, 70, 4); g.fillRect(x + 12, y - 3, 40, 10); }
    const layer = (col, base, a1, f1, a2, f2, sp) => { g.fillStyle = col; for (let x = 0; x < W; x++) { const h = Math.round(base + Math.sin((x + t * sp) / f1) * a1 + Math.sin((x + t * sp) / f2) * a2); g.fillRect(x, H - h, 1, h); } };
    layer('#2a1560', 78, 16, 37, 7, 11, 2); layer('#1b0f46', 58, 12, 23, 5, 7, 5);
    // Bracket Mountain, with a lit crystal seam
    for (let x = 0; x < W; x++) { const pk = Math.round(96 - Math.abs(x - 96) * 1.15); if (pk > 40) { g.fillStyle = x < 96 ? '#150c36' : '#0f082a'; g.fillRect(x, H - pk, 1, pk); if (pk > 78) { g.fillStyle = '#a8c4f0'; g.fillRect(x, H - pk, 1, Math.min(8, pk - 78)); } } }
    for (let i = 0; i < 9; i++) { g.fillStyle = N[2]; g.globalAlpha = .5 + .5 * Math.sin(t * 2 + i); g.fillRect(92 + Math.round(Math.sin(i * 1.7) * 3) + i, H - 76 + i * 4, 1, 3); } g.globalAlpha = 1;
    g.fillStyle = '#0a0722'; g.fillRect(0, H - 34, W, 34); g.fillStyle = '#35f0e6'; g.globalAlpha = .55; g.fillRect(0, H - 34, W, 1); g.globalAlpha = 1;
    // the village, windows lit
    for (let i = 0; i < 9; i++) {
      const x = 150 + i * 19, hh = Math.round(12 + LQ.hash(i, 4, 60) * 10), y = H - 34 - hh, on = Math.sin(t * 2 + i) > -.6;
      g.fillStyle = '#060416'; g.fillRect(x, y, 14, hh); for (let r = 0; r < 8; r++) g.fillRect(x - 2 + r, y - 1 - r, 18 - r * 2, 1);
      g.fillStyle = on ? N[i % 3] : '#2a2550'; g.fillRect(x + 5, H - 30 - Math.round(hh / 2), 3, 3);
      if (on) fx.light(x + 6, H - 29 - Math.round(hh / 2), 8, N[i % 3], .55);
    }
    // ruined pillars with glowing glyphs
    for (const [px, ph, ci] of [[18, 26, 0], [40, 17, 1], [128, 21, 2]]) { g.fillStyle = '#0c0926'; g.fillRect(px, H - 34 - ph, 9, ph); g.fillStyle = '#1b1650'; g.fillRect(px, H - 34 - ph, 2, ph); g.fillRect(px - 1, H - 36 - ph, 11, 2); g.fillStyle = N[ci]; for (let k = 0; k < 3; k++) g.fillRect(px + 4, H - 30 - ph + k * 5, 2, 3); fx.light(px + 5, H - 26 - ph, 12, N[ci], .45); }
    for (let i = 0; i < 16; i++) { const x = Math.floor(wrap(LQ.hash(i, 5, 60) * W + t * 6, W)), y = H - 40 - Math.floor((t * 9 + i * 20) % 100); g.fillStyle = N[i % 3]; g.globalAlpha = .7; g.fillRect(x, y, 1, 1); } g.globalAlpha = 1;
    fx.flush(g, t); fx.vignette(g);
  },
  drawUI(c) {
    const t = LQ.time, cx = LQ.VW / 2;
    if (ui.choice || ui.dlg) return;
    c.textAlign = 'center'; c.textBaseline = 'top';
    c.font = F(58, true); const y = 92 + Math.sin(t * 1.6) * 5;
    c.fillStyle = 'rgba(53,240,230,.16)'; for (const [ox, oy] of [[-4, 0], [4, 0], [0, -4], [0, 4]]) c.fillText('LEDGER QUEST', cx + ox, y + oy);
    c.fillStyle = '#05050f'; c.fillText('LEDGER QUEST', cx + 6, y + 6);
    c.fillStyle = '#ff4fb0'; c.fillText('LEDGER QUEST', cx + 3, y + 3);
    const gr = c.createLinearGradient(0, y, 0, y + 60); gr.addColorStop(0, '#f2fbff'); gr.addColorStop(.45, '#35f0e6'); gr.addColorStop(1, '#9b6bff');
    c.fillStyle = gr; c.fillText('LEDGER QUEST', cx, y);
    ui.text(c, 'A TAX ADVENTURE IN THE LEDGERLANDS', cx, 182, '#eef4ff', F(15, true), 'center');
    ui.text(c, 'Learn your paycheck, your taxes, and how to keep more of your money', cx, 216, '#c9cdea', F(26), 'center', 888);
    this.info.forEach((o, i) => {
      const on = i === this.sel && !ui.choice && !ui.dlg, oy = 268 + i * 52;
      c.fillStyle = on ? 'rgba(9,11,24,.78)' : 'rgba(9,11,24,.45)'; c.fillRect(cx - 330, oy, 660, 44);
      if (on) { c.fillStyle = '#35f0e6'; c.fillRect(cx - 330, oy, 5, 44); c.fillRect(cx + 325, oy, 5, 44); }
      ui.text(c, 'SLOT ' + (i + 1), cx - 308, oy + 15, on ? '#a8fff6' : '#c9cdea', F(12, true));
      ui.text(c, o ? `${o.career}    ${o.chapter}    ${o.coins} coins    ${o.rank}` : 'Empty. Start a new game here', cx + 308, oy + 8, o ? '#eef4ff' : '#8f96c0', F(26), 'right', 526);
    });
    if (this.msg) ui.text(c, this.msg, cx, 436, '#a8fff6', F(26), 'center');
    else if (!ui.choice && !ui.dlg) ui.text(c, 'Up / Down: choose a slot    Space: select', cx, 436, '#eef4ff', F(26), 'center');
    ui.text(c, 'Educational game. US federal figures for tax year 2026. Not tax advice.', cx, 498, 'rgba(201,205,234,.8)', F(22), 'center');
  },
};
LQ.boot();
})();
