// Title screen and opening.
(() => {
const LQ = window.LQ, ui = LQ.ui, F = LQ.F;
function careerSelect() {
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
      draw(g) { const s = g.createLinearGradient(0, 0, 0, LQ.BH); s.addColorStop(0, '#141a3c'); s.addColorStop(1, '#2a1d4e'); g.fillStyle = s; g.fillRect(0, 0, LQ.BW, LQ.BH); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${.2 + .4 * Math.abs(Math.sin(LQ.time + i))})`; g.fillRect(LQ.hash(i, 1, 70) * LQ.BW, LQ.hash(i, 2, 70) * LQ.BH, 1, 1); } },
      drawUI(c) {
        ui.text(c, 'CHOOSE YOUR CAREER', LQ.VW / 2, 34, '#f3c531', F(24, true), 'center');
        ui.text(c, 'Your job decides your pay, your tax forms, and your path to Tax Tycoon', LQ.VW / 2, 74, '#c9cdea', F(26), 'center', 888);
        ids.forEach((id, i) => {
          const cr = LQ.CAREERS[id], on = i === sel, x = 52 + i * 292, y = on ? 112 + Math.sin(LQ.time * 4) * 4 : 124, w = 272, h = 348;
          c.globalAlpha = on ? 1 : .6; ui.panel(c, x, y, w, h, on ? '#232a5c' : '#161a36');
          if (on) { c.strokeStyle = '#f3c531'; c.lineWidth = 4; c.strokeRect(x - 5, y - 5, w + 10, h + 10); }
          c.fillStyle = '#39417a'; c.fillRect(x + 76, y + 16, 120, 132); c.imageSmoothingEnabled = false;
          c.drawImage(LQ.charSprite(Object.assign({ id: 'card-' + id }, cr.look), 'down', on ? Math.floor(LQ.time * 5) % 4 : 0), x + 91, y + 16, 90, 130);
          c.font = F(13, true); ui.wrap(c, cr.name.toUpperCase(), 250).forEach((ln, k, a) => ui.text(c, ln, x + w / 2, y + 160 + k * 20 - (a.length - 1) * 4, '#ffe98a', F(13, true), 'center'));
          ui.text(c, pay[id], x + w / 2, y + 200, '#fdf8e7', F(24), 'center', w - 24);
          ui.text(c, 'Difficulty: ' + cr.diff, x + w / 2, y + 226, '#7fd6a8', F(22), 'center');
          cr.lines.forEach((ln, k) => ui.text(c, ln, x + w / 2, y + 262 + k * 25, '#c9cdea', F(20), 'center', w - 24));
          c.globalAlpha = 1;
        });
        if (Math.floor(LQ.time * 2) % 2) ui.text(c, 'Left / Right to choose, Space to confirm', LQ.VW / 2, 496, '#fdf8e7', F(26), 'center');
      },
    });
  });
}
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
      if (a === 2 && await LQ.choose(null, `Delete the save in slot ${n} for good? This cannot be undone.`, ['No, keep it', 'Yes, delete it']) === 1) { LQ.deleteSlot(n); LQ.audio.sfx('wrong'); }
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
      await LQ.say(null, 'The Ledgerlands. A realm where every coin has a story, and where every spring, without fail, Tax Season arrives.');
      if (skip) await LQ.say(null, ['', 'You are skipping ahead. Your hero has already finished Chapter 1 in Paystub Village: the Mythmonger is beaten, the first return is filed, and there are 500 coins in the purse.',
        'You are skipping ahead. Your hero has already finished Chapters 1 and 2: two returns filed, a cottage by the sea, a marriage to Marlowe, a stepdaughter called Coral, and 900 coins in the purse.',
        'You are skipping ahead. Your hero has already finished Chapters 1 to 3: three returns filed, a family in Shelter Coast, a side gig in Hustle Canyon, and 1,400 coins in the purse.'][skip]);
      else await LQ.say(null, 'You have just come to Paystub Village with an empty coin purse and no idea how taxes work.');
      await LQ.say(null, skip ? 'First, though: what does your hero do for a living?' : 'Good news: that is about to change. First, though: what do you do for a living?');
      LQ.state.career = await careerSelect(); LQ.initMarket();
      if (skip) LQ.CH2.starter();
      if (skip >= 2) LQ.CH3.starter();
      if (skip >= 3) await LQ.CH4.starter();
      LQ.busy--; await LQ.fadeTo(1, 0.4);
    }
    LQ.world.start(); LQ.setScene(LQ.world); await LQ.fadeTo(0, 0.7);
    if (!saved) ui.showBanner(LQ.world.R.title, LQ.world.R.sub());
    LQ.save();
    const R = LQ.world.R; if (R.arrive) LQ.script(() => R.arrive());
  },
  draw(g) {
    const t = LQ.time, W = LQ.BW, H = LQ.BH;
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#1a1440'); sky.addColorStop(.55, '#6a3a78'); sky.addColorStop(.8, '#f08a5a'); sky.addColorStop(1, '#f6c56a');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 50; i++) { g.fillStyle = `rgba(255,255,255,${.3 + .5 * Math.abs(Math.sin(t * .8 + i))})`; g.fillRect(LQ.hash(i, 1, 60) * W, LQ.hash(i, 2, 60) * 80, 1, 1); }
    g.fillStyle = '#ffe9a8'; g.beginPath(); g.arc(238, 128, 22, 0, 7); g.fill();
    for (let i = 0; i < 5; i++) { const x = (LQ.hash(i, 3, 60) * 420 + t * (3 + i)) % 420 - 60, y = 22 + i * 13; g.fillStyle = 'rgba(255,220,220,.28)'; g.fillRect(x, y, 46, 5); g.fillRect(x + 8, y - 3, 28, 10); }
    const layer = (col, base, a1, f1, a2, f2, sp) => { g.fillStyle = col; for (let x = 0; x < W; x++) { const h = base + Math.sin((x + t * sp) / f1) * a1 + Math.sin((x + t * sp) / f2) * a2; g.fillRect(x, H - h, 1, h); } };
    layer('#4a2a6a', 78, 16, 37, 7, 11, 2); layer('#33205a', 58, 12, 23, 5, 7, 5);
    for (let x = 0; x < W; x++) { const pk = 96 - Math.abs(x - 96) * 1.15; if (pk > 40) { g.fillStyle = '#2a1a4e'; g.fillRect(x, H - pk, 1, pk); if (pk > 78) { g.fillStyle = '#f1f5fa'; g.fillRect(x, H - pk, 1, Math.min(8, pk - 78)); } } }
    g.fillStyle = '#1d1238'; g.fillRect(0, H - 34, W, 34);
    for (let i = 0; i < 9; i++) { const x = 150 + i * 19, hh = 12 + LQ.hash(i, 4, 60) * 10; g.fillStyle = '#150d2c'; g.fillRect(x, H - 34 - hh, 14, hh); g.beginPath(); g.moveTo(x - 2, H - 34 - hh); g.lineTo(x + 7, H - 42 - hh); g.lineTo(x + 16, H - 34 - hh); g.fill(); g.fillStyle = Math.sin(t * 2 + i) > -.6 ? '#ffd978' : '#8a6a3a'; g.fillRect(x + 5, H - 30 - hh / 2, 3, 3); }
    for (let i = 0; i < 12; i++) { const x = (LQ.hash(i, 5, 60) * W + t * 6) % W, y = H - 40 - ((t * 9 + i * 20) % 90); g.fillStyle = 'rgba(255,217,120,.6)'; g.fillRect(x, y, 1, 1); }
  },
  drawUI(c) {
    const t = LQ.time, cx = LQ.VW / 2;
    c.textAlign = 'center'; c.textBaseline = 'top';
    c.font = F(58, true); const y = 92 + Math.sin(t * 1.6) * 5;
    c.fillStyle = '#090b18'; c.fillText('LEDGER QUEST', cx + 6, y + 6);
    c.fillStyle = '#8a4a1c'; c.fillText('LEDGER QUEST', cx + 3, y + 3);
    const gr = c.createLinearGradient(0, y, 0, y + 60); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(.5, '#f3c531'); gr.addColorStop(1, '#e08a1c');
    c.fillStyle = gr; c.fillText('LEDGER QUEST', cx, y);
    ui.text(c, 'A TAX ADVENTURE IN THE LEDGERLANDS', cx, 182, '#fdf8e7', F(15, true), 'center');
    ui.text(c, 'Learn your paycheck, your taxes, and how to keep more of your money', cx, 216, '#f6d9c9', F(26), 'center', 888);
    this.info.forEach((o, i) => {
      const on = i === this.sel && !ui.choice && !ui.dlg, oy = 268 + i * 52;
      c.fillStyle = on ? 'rgba(9,11,24,.78)' : 'rgba(9,11,24,.45)'; c.fillRect(cx - 330, oy, 660, 44);
      if (on) { c.fillStyle = '#f3c531'; c.fillRect(cx - 330, oy, 5, 44); c.fillRect(cx + 325, oy, 5, 44); }
      ui.text(c, 'SLOT ' + (i + 1), cx - 308, oy + 15, on ? '#ffe98a' : '#c9cdea', F(12, true));
      ui.text(c, o ? `${o.career}    ${o.chapter}    ${o.coins} coins    ${o.rank}` : 'Empty. Start a new game here', cx + 308, oy + 8, o ? '#fdf8e7' : '#8f96c0', F(26), 'right', 526);
    });
    if (this.msg) ui.text(c, this.msg, cx, 436, '#ffe98a', F(26), 'center');
    else if (!ui.choice && !ui.dlg && Math.floor(t * 2) % 2) ui.text(c, 'Up / Down: choose a slot    Space: select', cx, 436, '#fdf8e7', F(26), 'center');
    ui.text(c, 'Educational game. US federal figures for tax year 2026. Not tax advice.', cx, 498, 'rgba(253,248,231,.75)', F(22), 'center');
  },
};
LQ.boot();
})();
