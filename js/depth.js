// Hands-on activities for Chapters 2 to 4, and Ledger Pages 4 to 12. See the Phase 3 notes in GAME_DESIGN_PLAN.md.
// Each activity follows the Bracket Vault: do something, watch a number change, read one or two sentences on why.
// No tax math lives here. Every figure comes from LQ.fin2, LQ.fin3, or LQ.trial4.
(() => {
const LQ = window.LQ, F = LQ.F, ui = LQ.ui, D = LQ.docs, M = n => LQ.money(n), TX = LQ.TAX;
const st = () => LQ.state, say = LQ.say, sfx = n => LQ.audio.sfx(n);
const CX = [444, 530, 616], COLC = ['#1f6f5c', '#3b6fd4', '#6a6490'];
const wait = d => new Promise(r => { d.wait = r; });
const npc = (ch, id) => LQ[ch].npcs.find(n => n.id === id);

// The three lines under an activity: what to do, what just happened, and the keys.
function helpBox(c, d) {
  if (ui.dlg || ui.choice) return;
  ui.panel(c, 30, 392, 900, 124);
  ui.text(c, d.goal || '', 52, 398, '#ffe98a', F(26), 'left', 856);
  c.font = F(24);
  ui.wrap(c, d.msg || d.note || '', 856).forEach((line, i) =>
    ui.text(c, line, 52, 429 + i * 24, d.msg ? '#ff9ad0' : '#c9cdea', F(24)));
  ui.text(c, d.keys || '', 52, 484, '#35f0e6', F(23), 'left', 856);
}
// A change in the headline number, shown for a moment beside it.
function delta(c, d, x, y) {
  const k = d.delta; if (!k || k.t <= 0 || !k.v) return;
  ui.text(c, (k.v > 0 ? '+' : '-') + M(Math.abs(k.v)), x, y - (1.4 - k.t) * 14, k.v > 0 ? '#7fd6a8' : '#ff4fb0', F(30), 'center');
}

// ---------- the sorting table. Up and Down pick a row, Left and Right move it between columns, Enter on CHECK hands it in.
function sortDoc(o) {
  const d = Object.assign({ cur: 0, bad: -1, wait: null, msg: '', phase: 'sort', pick: 0, jar: 0, delta: null, play: true }, o);
  d.rows.forEach(r => { r.col = -1; });
  d.update = dt => {
    if (d.delta) d.delta.t -= dt;
    const lr = Number(LQ.hit('right')) - Number(LQ.hit('left')), ud = Number(LQ.hit('down')) - Number(LQ.hit('up')), ok = LQ.hit('ok');
    const done = () => { if (d.wait) { const w = d.wait; d.wait = null; w(); } };
    if (!d.wait) return;
    if (d.phase === 'pick') { if (lr || ud) { d.pick = lr + ud > 0 ? 1 : 0; sfx('move'); } if (ok && d.pick >= 0) done(); return; }
    if (d.phase === 'dial') {
      if (lr || ud) { const was = d.jar; d.jar = LQ.clamp(d.jar + (lr - ud) * d.step, 0, d.jarMax); if (d.jar !== was) { sfx('move'); d.msg = ''; } }
      if (ok) done(); return;
    }
    const n = d.rows.length;
    if (ud) { d.cur = (d.cur + ud + n + 1) % (n + 1); sfx('move'); }
    const r = d.rows[d.cur];
    if (lr && r) {
      const was = r.col, before = d.value();
      r.col = was < 0 ? (lr > 0 ? 0 : d.cols.length - 1) : LQ.clamp(was + lr, 0, d.cols.length - 1);
      if (r.col !== was) { sfx('ok'); d.msg = ''; if (d.bad === d.cur) d.bad = -1; d.delta = { v: d.value() - before, t: 1.4 }; }
    }
    if (ok) { if (r) { d.cur++; sfx('move'); } else done(); }
  };
  d.draw = c => {
    const n = d.rows.length, rh = Math.min(23, Math.floor(244 / Math.max(n, 1))), sorting = d.phase === 'sort';
    D.paper(c, 30, 10, 640, 336, d.title, d.sub);
    c.textBaseline = 'top';
    d.cols.forEach((name, i) => { c.font = F(20); c.textAlign = 'center'; c.fillStyle = COLC[i]; c.fillText(name, CX[i], 44); });
    d.rows.forEach((r, i) => {
      const y = 66 + i * rh;
      if (sorting && d.cur === i) { c.fillStyle = `rgba(255,205,50,${.42 + .2 * Math.sin(LQ.time * 6)})`; c.fillRect(38, y - 1, 624, rh - 1); }
      if (d.bad === i) { c.fillStyle = 'rgba(176,51,46,.25)'; c.fillRect(38, y - 1, 624, rh - 1); }
      c.font = F(21); c.textAlign = 'left'; c.fillStyle = '#15122e'; c.fillText(r.name, 46, y, 272);
      c.textAlign = 'right'; c.fillText(M(r.amt), 394, y);
      d.cols.forEach((_, k) => {
        const x = CX[k] - 39, on = r.col === k;
        c.fillStyle = on ? (d.bad === i ? '#b0332e' : COLC[k]) : '#cfd5f5'; c.fillRect(x, y + 1, 78, rh - 5);
        if (on) { c.font = F(19); c.textAlign = 'center'; c.fillStyle = '#ffffff'; c.fillText(d.chip(r, k), CX[k], y); }
      });
      if (r.col < 0) { c.font = F(19); c.textAlign = 'center'; c.fillStyle = '#8a84b0'; c.fillText('?', CX[1], y); }
    });
    if (sorting) {
      const by = 69 + n * rh, on = d.cur === n;
      c.fillStyle = on ? '#1f6f5c' : '#8a84b0'; c.fillRect(250, by, 200, 22);
      if (on) { c.strokeStyle = '#ffcf4a'; c.lineWidth = 3; c.strokeRect(248.5, by - 1.5, 203, 25); }
      c.font = F(22); c.textAlign = 'center'; c.fillStyle = '#ffffff'; c.fillText('CHECK MY SORTING', 350, by - 1);
    }
    d.side(c, d); helpBox(c, d);
  };
  return d;
}
// Runs the sorting loop until every row sits in its column. Returns true if the first check was clean.
async function sortLoop(d, who, changed) {
  let clean = true;
  d.keys = 'Up / Down: row    Left / Right: sort    Enter: next row or check';
  for (;;) {
    await wait(d);
    const un = d.rows.findIndex(r => r.col < 0);
    if (un >= 0) { clean = false; d.cur = un; d.msg = 'This row is not sorted yet. Press Left or Right to place it.'; sfx('wrong'); continue; }
    const bad = d.rows.findIndex(r => r.col !== r.want);
    if (bad < 0) break;
    clean = false; d.bad = d.cur = bad; sfx('wrong'); LQ.shake(.15);
    await say(who, d.rows[bad].why[d.rows[bad].col] || d.rows[bad].why.any);
    d.msg = 'Move the red row to ' + d.cols[d.rows[bad].want] + ' and watch ' + changed + ' change. Then check again.';
  }
  d.bad = -1; d.msg = ''; sfx('right');
  return clean;
}
const scoreOnce = clean => { const s = st(); s.asked++; if (clean) s.first++; LQ.score(clean); };

// ---------- Chapter 2: sort the household's receipts and watch the two deductions
const RWHY = {
  interest: { 1: 'Interest on your home loan is a deduction. It lowers the income that gets taxed. A credit is a different thing: it comes straight off the tax.', 2: 'Interest on a loan for your main home counts when you itemize. Leaving it out would throw away your biggest receipt.' },
  salt: { 1: 'State and local taxes you paid are a deduction, not a credit. They belong in the itemized pile.', 2: 'State and local taxes you paid count when you itemize, up to the cap.' },
  gift: { 1: 'A gift to charity is a deduction, not a credit.', 2: 'A cash gift to a real charity counts, as long as you have it in writing.' },
  none: { any: 'A raffle ticket buys a chance at a prize, so it is not a gift. It does not count anywhere. Leave it out.' },
  care: { any: 'Daycare is not a deduction. It earns the child care credit, and a credit comes straight off your tax. It goes in the CREDIT column.' },
};
function receiptRows(f) {
  const s = st(), RC = LQ.RECEIPTS;
  const rows = [{ name: 'Province income tax (pay records)', amt: f.prov, kind: 'salt' }]
    .concat(Object.keys(RC).filter(id => s.rcpt[id]).map(id => ({ name: RC[id].name, amt: RC[id].amt, kind: RC[id].kind })));
  if (LQ.has('charity')) rows.push({ name: 'Gift: Charity Lantern', amt: 500, kind: 'gift' });
  rows.forEach(r => {
    r.want = r.kind === 'care' ? 1 : r.kind === 'none' || (r.kind === 'medical' && !f.medItem) ? 2 : 0;
    r.why = r.kind === 'medical' ? { any: f.medItem ? 'Medical bills count once they pass 7.5% of your income, and yours do. They belong in the itemized pile.'
      : `Medical bills only count above 7.5% of your income, which for you is ${M(f.medFloor)}. Yours are under that, so leave them out.` } : RWHY[r.kind];
  });
  return rows;
}
// What the itemized pile adds up to with the rows as the player has placed them.
const pileOf = (rows, f) => {
  let int = 0, salt = 0, gift = 0, other = 0;
  for (const r of rows) if (r.col === 0) {
    if (r.kind === 'interest') int += r.amt; else if (r.kind === 'salt') salt += r.amt; else if (r.kind === 'gift') gift += r.amt;
    else other += r.kind === 'medical' && f.medItem ? f.medItem : r.amt;
  }
  return int + Math.min(TX.saltCap, salt) + Math.max(0, gift - f.giftFloor) + other;
};
async function receipts(who) {
  const f = LQ.fin2(), rows = receiptRows(f), item = f.better === 'item', equal = f.itemized === f.stdTotal;
  const d = sortDoc({ title: 'SORT YOUR RECEIPTS', sub: rows.length + ' on the table', cols: ['ITEMIZE', 'CREDIT', 'LEAVE OUT'], rows,
    value: () => pileOf(rows, f), chip: (r, k) => k === 0 ? M(r.amt) : k === 1 ? 'credit' : 'out',
    goal: 'Put each receipt in the column where it belongs.',
    note: 'A deduction lowers the income that gets taxed. Itemizing means adding up your own deductions.',
    side(c) {
      const v = d.value(), bob = Math.sin(LQ.time * 2) * 3, pk = d.phase === 'pick';
      D.shieldShape(c, 716, 8 + bob, '#3b6fd4', 'STANDARD', f.stdTotal, pk ? d.pick === 0 : d.phase === 'end' && !item);
      D.shieldShape(c, 716, 180 - bob, '#b0332e', 'ITEMIZED', v, pk ? d.pick === 1 : d.phase === 'end' && item);
      delta(c, d, 806, 172);
    } });
  ui.doc = d;
  let clean = await sortLoop(d, who, 'the ITEMIZED shield');
  d.phase = 'pick'; d.pick = -1;
  await say(who, `Sorted. Your itemized pile comes to ${M(f.itemized)}. The standard deduction${f.giftStd ? ', plus your gifts,' : ''} comes to ${M(f.stdTotal)}. You may carry only one.`);
  if (!equal) for (;;) {
    d.goal = 'Pick the shield that takes more off your income.'; d.note = 'You carry one shield: the standard deduction or your itemized pile.'; d.keys = 'Up / Down: choose a shield    Enter: carry it';
    await wait(d);
    if ((d.pick === 1) === item) break;
    clean = false; sfx('wrong'); LQ.shake(.15);
    await say(who, `That shield takes ${M(Math.min(f.itemized, f.stdTotal))} off your income. The other takes off ${M(Math.max(f.itemized, f.stdTotal))}. Carry the larger one. Try again.`);
  }
  sfx('right'); d.phase = 'end'; d.goal = d.note = d.keys = ''; scoreOnce(clean);
  return f;
}

// ---------- Chapter 3: a gig budget. Sort the slips into job costs, then fill the tax jar.
const SWHY = {
  xSupply: 'Supplies bought only for the gig are a job cost in full.',
  xPhone: 'The phone is used half for the gig and half for the family, so only the business half counts.',
  xLicense: 'A license you need in order to sell is a job cost in full.',
  xMeal: 'A meal with a client, where you talk business, counts at half.',
  xLunch: 'Your own lunch is personal, working day or not. It still costs you cash, but it is not a job cost.',
  xBoots: 'Boots you can wear anywhere are personal clothing. They are not a job cost.',
  xFine: 'A fine paid to a government never counts as a job cost.',
};
const JAR_STEP = 500;
function slipRows() {
  const s = st(), SL = LQ.SLIPS;
  return Object.keys(SL).filter(id => s.rcpt[id]).map(id => ({ id, name: SL[id].name, amt: SL[id].amt, want: SL[id].counts === SL[id].amt ? 0 : SL[id].counts ? 1 : 2, why: { any: SWHY[id] } }));
}
const counted = r => r.col === 0 ? r.amt : r.col === 1 ? r.amt / 2 : 0;
async function budget(who) {
  const f = LQ.fin3(), G = f.G, rows = slipRows(), base = f.gigBase + f.tools, bill = f.gigBill;
  const costs = () => base + rows.reduce((a, r) => a + counted(r), 0);
  const personal = () => rows.reduce((a, r) => a + (r.col < 0 ? 0 : r.amt - counted(r)), 0);
  const d = sortDoc({ title: 'YOUR GIG BUDGET', sub: G.name, cols: ['IN FULL', 'HALF', 'LEAVE OUT'], rows, value: costs, step: JAR_STEP,
    chip: (r, k) => k === 2 ? 'out' : M(k ? r.amt / 2 : r.amt),
    goal: 'Decide how much of each slip is a cost of doing the job.',
    note: 'A job cost is money spent to do the work. Profit is what you earned minus your job costs.',
    side(c) {
      const cst = costs(), profit = f.gigGross - cst, per = personal(), dial = d.phase !== 'sort';
      c.fillStyle = '#f4f6ff'; c.fillRect(686, 10, 250, 336); c.strokeStyle = '#7a74b8'; c.lineWidth = 2; c.strokeRect(687, 11, 248, 334);
      c.font = F(11, true); c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = '#5a5490'; c.fillText('THE YEAR SO FAR', 700, 24);
      const L = (y, a, b, o) => D.line(c, 700, y, 222, a, b, Object.assign({ size: 24 }, o));
      L(46, 'Money earned', M(f.gigGross)); L(76, 'Job costs', '-' + M(cst), D.RED);
      D.rule(c, 700, 106, 222); L(112, 'Profit', M(profit), Object.assign({ hl: !dial }, D.GREEN));
      L(150, 'Costs you can’t deduct', '-' + M(per), D.RED);
      L(180, 'Tax jar', dial ? '-' + M(d.jar) : '?', Object.assign({ hl: dial && d.phase === 'dial' }, D.RED));
      D.rule(c, 700, 210, 222); L(216, 'Cash left', dial ? M(profit - per - d.jar) : '?', D.GREEN);
      c.font = F(19); c.fillStyle = '#5a5490'; c.textAlign = 'left';
      ui.wrap(c, dial ? `Tax on this profit: about ${M(bill)}. That is income tax plus self-employment tax.` : `Job costs start at ${M(base)} from your books.`, 222).forEach((ln, i) => c.fillText(ln, 700, 256 + i * 20));
      delta(c, d, 810, 134);
    } });
  ui.doc = d;
  let clean = true;
  if (rows.length) clean = await sortLoop(d, who, 'Job costs and Profit');
  else await say(who, 'No loose slips to sort, so your job costs are the ones already in your books.');
  d.phase = 'dial'; d.jarMax = Math.max(JAR_STEP, Math.floor((f.gigProfit - personal()) / JAR_STEP) * JAR_STEP);
  await say(who, `${M(f.gigGross)} came in and ${M(f.gigExp)} went out on the job, so your profit is ${M(f.gigProfit)}. Not all of it is yours to spend. Nobody holds tax back from gig money, so you set it aside yourself.`);
  for (;;) {
    d.goal = 'Fill the tax jar until it covers the tax on your profit.'; d.note = 'The jar is money you keep back for tax. Cash left is what you have after costs and the tax set-aside.'; d.keys = `Left / Right: move ${M(JAR_STEP)} in or out of the jar    Enter: done`;
    await wait(d);
    if (d.jar >= bill) break;
    clean = false; sfx('wrong'); LQ.shake(.15);
    await say(who, `The tax on this profit is about ${M(bill)}. Your jar holds ${M(d.jar)}. Set aside another ${M(bill - d.jar)} to cover the difference.`);
    d.msg = 'Add to the jar and watch Cash left shrink. That smaller number is the honest one.';
  }
  sfx('right'); d.msg = '';
  const over = d.jar - bill;
  await say(who, over >= 3 * JAR_STEP ? `Covered, with ${M(over)} to spare. You can keep the extra in savings or return it to your spending money.`
    : `Covered. The jar holds ${M(d.jar)} against a bill of about ${M(bill)}, leaving ${M(f.gigProfit - personal() - d.jar)} available in this example.`);
  d.phase = 'end'; d.goal = d.note = d.keys = ''; scoreOnce(clean);
  return f;
}

// ---------- Chapter 4: sell or wait. Move the sale day, then try an example price drop.
const DAYS = [['11 months', '(today)'], ['12 months', 'exactly'], ['1 year', '+ 1 day'], ['13 months', '']];
const DROP_STEP = 0.02, DROP_MAX = 10;
// Extra tax on the Glacier gain: sold today, sold after the year, and sold after the year at each example price.
function holdFigures() {
  const s = st(), GL = LQ.GLACIER;
  // Undo the recorded sale during a replay, unless filing already cleared the investment ledger.
  const undo = i => { if (s.q4 >= 9) return; if (s.hold4 === 1) i.lt -= GL.gain; else if (s.hold4 === 0) i.st -= GL.gain; };
  const base = LQ.trial4(undo).total, extra = fn => Math.max(0, LQ.trial4(i => { undo(i); fn(i); }).total - base);
  const H = { GL, now: extra(i => { i.st += GL.gain; }), wait: [] };
  for (let k = 0; k <= DROP_MAX; k++) H.wait.push(extra(i => { i.lt += GL.gain - Math.round(GL.worth * DROP_STEP * k); }));
  H.keepNow = GL.worth - H.now;
  H.keepWait = k => GL.worth - Math.round(GL.worth * DROP_STEP * k) - H.wait[k];
  H.flip = H.wait.findIndex((_, k) => H.keepWait(k) < H.keepNow);
  return H;
}
function holdDoc(H) {
  const GL = H.GL;
  const d = { phase: 'day', day: 0, k: 0, wait: null, msg: '', play: true, H };
  d.update = () => {
    const lr = Number(LQ.hit('right')) - Number(LQ.hit('left')), ok = LQ.hit('ok');
    if (!d.wait) return;
    if (lr && d.phase === 'day') { const was = d.day; d.day = LQ.clamp(d.day + lr, 0, 3); if (was !== d.day) { sfx('move'); d.msg = ''; } }
    if (lr && d.phase === 'drop') { const was = d.k; d.k = LQ.clamp(d.k - lr, 0, DROP_MAX); if (was !== d.k) { sfx('move'); d.msg = ''; } }
    if (ok) { const w = d.wait; d.wait = null; w(); }
  };
  d.draw = c => {
    const long = d.day >= 2, tax = long ? H.wait[0] : H.now, X = i => 110 + i * 150;
    D.paper(c, 30, 10, 900, 336, 'GLACIER GOLDWORKS', `Paid ${M(GL.cost)}, worth ${M(GL.worth)}, gain ${M(GL.gain)}`);
    c.textBaseline = 'top';
    // the clock: red while the gain is short-term, green once it is long-term
    c.fillStyle = '#b0332e'; c.fillRect(X(0), 92, X(1) - X(0) + 40, 10); c.fillStyle = '#1f6f5c'; c.fillRect(X(1) + 40, 92, X(3) - X(1) - 40 + 30, 10);
    c.font = F(19); c.textAlign = 'left'; c.fillStyle = '#b0332e'; c.fillText('SHORT-TERM', X(0), 50); c.fillStyle = '#1f6f5c'; c.fillText('LONG-TERM', X(1) + 44, 50);
    DAYS.forEach((t, i) => {
      const on = d.day === i;
      c.fillStyle = '#15122e'; c.fillRect(X(i) - 1, 88, 3, 18);
      if (on) { const b = Math.round(Math.sin(LQ.time * 6) * 2); c.fillStyle = '#ffb400'; c.beginPath(); c.moveTo(X(i), 88 + b); c.lineTo(X(i) - 11, 70 + b); c.lineTo(X(i) + 11, 70 + b); c.fill(); }
      c.font = F(on ? 22 : 20); c.textAlign = 'center'; c.fillStyle = on ? '#15122e' : '#5a5490'; c.fillText(t[0], X(i), 110); c.fillText(t[1], X(i), 130);
    });
    c.fillStyle = '#f4f6ff'; c.fillRect(650, 46, 264, 112); c.strokeStyle = '#7a74b8'; c.lineWidth = 2; c.strokeRect(651, 47, 262, 110);
    const L = (y, a, b, o) => D.line(c, 664, y, 236, a, b, Object.assign({ size: 23 }, o));
    L(54, 'Sold on this day', long ? 'long-term' : 'short-term', long ? D.GREEN : D.RED);
    L(80, 'Taxed', long ? 'capital gain rates' : 'like wages', long ? D.GREEN : D.RED);
    L(106, 'Tax on the gain', M(tax), long ? D.GREEN : D.RED); L(130, 'You keep', M(GL.worth - tax));
    D.rule(c, 50, 166, 860);
    if (d.phase === 'drop' || d.phase === 'end') {
      const k = d.k, price = GL.worth - Math.round(GL.worth * DROP_STEP * k), diff = H.keepWait(k) - H.keepNow;
      c.font = F(11, true); c.textAlign = 'left'; c.fillStyle = '#b0332e'; c.fillText('EXAMPLE ONLY: WHAT IF THE PRICE FALLS WHILE YOU WAIT?', 50, 178);
      c.font = F(22); c.fillStyle = '#5a5490'; c.textAlign = 'right'; c.fillText('Sell today', 520, 200); c.fillText('Wait, then sell', 720, 200);
      const row = (i, label, a, b, col) => { const y = 226 + i * 27; c.font = F(24); c.textAlign = 'left'; c.fillStyle = '#15122e'; c.fillText(label, 60, y); c.textAlign = 'right'; c.fillText(a, 520, y); c.fillStyle = col || '#15122e'; c.fillText(b, 720, y); };
      row(0, 'Price of the shares', M(GL.worth), M(price) + (k ? '  (-' + Math.round(k * DROP_STEP * 100) + '%)' : ''), k ? '#b0332e' : null);
      row(1, 'Gain', M(GL.gain), M(price - GL.cost)); row(2, 'Tax on the gain', '-' + M(H.now), '-' + M(H.wait[k]), '#1f6f5c');
      c.fillStyle = `rgba(255,205,50,${.4 + .2 * Math.sin(LQ.time * 6)})`; c.fillRect(52, 226 + 3 * 27 - 1, 680, 27);
      row(3, 'You keep', M(H.keepNow), M(H.keepWait(k)));
      c.font = F(24); c.textAlign = 'center'; c.fillStyle = diff >= 0 ? '#1f6f5c' : '#b0332e';
      ui.wrap(c, diff >= 0 ? `Waiting is ahead by ${M(diff)}` : `Waiting is behind by ${M(-diff)}`, 170).forEach((ln, i) => c.fillText(ln, 826, 240 + i * 26));
    } else { c.font = F(23); c.textAlign = 'left'; c.fillStyle = '#5a5490'; c.fillText('The holding period starts the day after you buy. Move the sale along the clock.', 50, 190, 860); }
    helpBox(c, d);
  };
  return d;
}
async function hold(who) {
  const H = holdFigures(), d = holdDoc(H), saved = Math.max(0, H.now - H.wait[0]);
  let clean = true;
  ui.doc = d;
  d.goal = 'Move the sale to the FIRST day the gain is long-term.'; d.note = 'A gain is what you sold for minus what you paid. How long you held it sets how it is taxed.'; d.keys = 'Left / Right: move the sale day    Enter: sell on that day';
  for (;;) {
    await wait(d);
    if (d.day === 2) break;
    clean = false; sfx('wrong'); LQ.shake(.15);
    await say(who, ['Today is eleven months. A year or less is short-term, and a short-term gain is taxed like wages. Move later.',
      'Exactly one year is still short-term. The gain turns long-term on the day after. One more day.', null,
      'Thirteen months is long-term, but it is not the first day. Come back one step.'][d.day]);
    d.msg = 'Watch "Tax on the gain" as you move the day.';
  }
  sfx('right'); d.msg = '';
  await say(who, `A year and a day. The same ${M(H.GL.gain)} gain now adds about ${M(H.wait[0])} of tax instead of ${M(H.now)}. Waiting is worth about ${M(saved)}, if the price holds.`);
  d.phase = 'drop'; d.day = 2;
  d.goal = 'EXAMPLE: lower the price until waiting leaves you with LESS than selling today.'; d.note = 'This price change is made up to show the risk. Nobody knows what a price will do in a month.'; d.keys = 'Left: lower the example price    Right: raise it    Enter: check';
  for (;;) {
    await wait(d);
    if (H.keepWait(d.k) < H.keepNow) break;
    clean = false; sfx('wrong');
    d.msg = `Waiting is still ahead by ${M(H.keepWait(d.k) - H.keepNow)}. Press Left to lower the price some more.`;
  }
  sfx('right'); d.msg = ''; d.phase = 'end';
  await say(who, `There. In this example a ${Math.round(d.k * DROP_STEP * 100)}% drop takes ${M(Math.round(H.GL.worth * DROP_STEP * d.k))} off the price, more than the tax you saved by waiting. A price drop can outweigh a tax saving.`);
  d.goal = d.note = d.keys = ''; scoreOnce(clean);
  return H;
}

// ---------- Ledger Pages 4 to 12
// Three per region: one from the new activity, one from the boss (with an invoice), one from the filed return.
Object.assign(LQ.ITEMS, {
  invoice2: { name: 'Fog Invoice, Coast', desc: '"60 crates of Fine Print Fog. Deliver to: Capt. Loophole, the Old Lighthouse." Shipped from "a cellar in Paystub Village". The supplier\'s name is scratched out.' },
  invoice3: { name: 'Fog Invoice, Canyon', desc: '"80 crates of Cash-Only Fog. Deliver to: S. Slick, the Gulch." The name is scratched out, but the wax seal shows a quill crossed over a torn page: the seal of the Great Ledger office.' },
  invoice4: { name: 'Fog Invoice, Summit', desc: '"100 crates of Sure-Thing Fog. Deliver to: Glint, the Peak." This one is signed: "Q. Murk, Head Clerk of the Great Ledger."' },
});
const PAGES = {
  4: { truth: 'Carry the larger deduction, and only one.', target: 'tallow', todo: 'Sort receipts with Tallow in Shelter Coast' },
  5: { truth: 'A write-off is a real cost you can prove. It is never a secret.', done: s => !!s.flags.boss2, from: 'Captain Loophole\'s charts', inv: 'invoice2', todo: 'Defeat Captain Loophole on Shelter Coast' },
  6: { truth: 'A credit comes straight off the tax. A deduction only lowers the income that is taxed.', done: s => s.q2 >= 8, from: 'your stamped joint return', todo: 'File your joint return on Shelter Coast' },
  7: { truth: 'Profit is what came in minus what the work cost, and part of it is owed as tax.', target: 'brick', todo: 'Work the gig budget with Brick in Hustle Canyon' },
  8: { truth: 'All income counts, with or without a form.', done: s => !!s.flags.boss3, from: 'Sidewinder Slick\'s saddlebag', inv: 'invoice3', todo: 'Defeat Sidewinder Slick in Hustle Canyon' },
  9: { truth: 'Pay as you earn, and April holds no surprise.', done: s => s.q3 >= 8, from: 'your stamped Schedule C', todo: 'File with Schedule C in Hustle Canyon' },
  10: { truth: 'Time changes the tax on a gain. It never promises the price.', target: 'frost', todo: 'Try Frost’s sale clock on the Summit' },
  11: { truth: 'Nobody can promise a gain. Whoever does is selling something.', done: s => !!s.flags.boss4, from: 'the Dragon\'s hoard', inv: 'invoice4', todo: 'Defeat Glint the Dragon on the Summit' },
  12: { truth: 'The plain truth about money belongs to everyone who has to pay.', done: s => s.q4 >= 9, from: 'your stamped Schedule D', todo: 'File with Schedule D on the Summit' },
};
const pageGot = n => { st().flags['page' + n] = true; LQ.give('pages'); sfx('fanfare'); ui.toast('Ledger Page recovered: ' + LQ.pages() + ' of 12'); };
async function allPagesHint() {
  const s = st();
  if (LQ.pages() !== 12 || s.flags.told12) return;
  s.flags.told12 = true;
  await say(null, 'That makes twelve. The tall door under your cottage in Paystub Village is ready to open.');
}
// The page an activity earns, handed over by the person who ran it.
async function activityPage(n, who) {
  if (st().flags['page' + n]) return;
  pageGot(n);
  await say(who, `Hm. This was pressed between my papers, and it is not mine. A torn page of the Great Ledger. It reads: "${PAGES[n].truth}"`);
  await allPagesHint();
}
// Pages owed for milestones already reached. Old saves and chapter starters collect theirs the first time they stand still.
const owed = s => Object.keys(PAGES).map(Number).filter(n => PAGES[n].done && !s.flags['page' + n] && PAGES[n].done(s))
  .concat(s.flags.starter && s.quest >= 9 ? [1, 2, 3].filter(n => !s.flags['page' + n]) : []).sort((a, b) => a - b);
async function collect() {
  const s = st(), list = owed(s); if (!list.length) return;
  if (list.length === 1 && list[0] > 3) {
    const n = list[0], p = PAGES[n];
    pageGot(n); if (p.inv) LQ.give(p.inv);
    await say(null, `Folded into ${p.from}: a torn page of the Great Ledger. It reads: "${p.truth}"`);
    if (p.inv) await say(null, 'With it is another fog invoice. ' + LQ.ITEMS[p.inv].desc);
  } else {
    list.forEach(n => { s.flags['page' + n] = true; if (PAGES[n] && PAGES[n].inv) LQ.give(PAGES[n].inv); });
    if (list.includes(3)) LQ.give('invoice1');
    LQ.give('pages'); sfx('fanfare');
    await say(null, `You go through everything you carried home from your travels. Tucked among the papers are ${list.length} torn pages of the Great Ledger, and the fog invoices that came with them.`);
    ui.toast('Ledger Pages recovered: ' + LQ.pages() + ' of 12');
  }
  await allPagesHint();
}
for (const id of ['village', 'coast', 'canyon', 'summit']) {
  const R = LQ.REGIONS[id], spawn0 = R.spawn;
  R.spawn = (w, s) => {
    spawn0(w, s);
    // Wait for a quiet moment, so a page never talks over an arrival scene.
    let quiet = 0;
    w.ents.push({ type: 'logic', tx: 0, base: -9999, step(dt) {
      const keys = LQ.input.down;
      quiet = !(keys.left || keys.right || keys.up || keys.down) && !LQ.input.pressed.ok && !LQ.busy && !ui.okWait && !ui.menu && !ui.dlg && !ui.choice && !ui.doc && LQ.scene === LQ.world && LQ.fadeA === 0 ? quiet + dt : 0;
      if (quiet > .4 && owed(st()).length) { quiet = 0; LQ.script(collect); }
    } });
  };
  if (id !== 'village') { const hud0 = R.hud; R.hud = (w, s) => [hud0 ? hud0(w, s) : '', LQ.pages() ? 'Ledger Pages ' + LQ.pages() + '/12' : ''].filter(Boolean).join('    '); }
}
// Chapter starters skip the village, so they are owed its three pages too.
for (const ch of ['CH2', 'CH3', 'CH4']) { const s0 = LQ[ch].starter; LQ[ch].starter = function () { st().flags.starter = true; return s0.apply(this, arguments); }; }

// Anyone who passed an activity's quest step before it existed can play it for its page by talking to the same person.
const REPLAY = {
  CH2: ['tallow', 4, s => s.q2 > 5, receipts, 'I have a new way to lay out receipts. Sort yours, and see what turns up.'],
  CH3: ['brick', 7, s => s.q3 > 5, budget, 'New counter, new method. Run your gig budget for me, and see what turns up.'],
  CH4: ['frost', 10, s => s.q4 > 2, hold, 'Tick, tick. I have built a clock for sales. Try it, and see what turns up.'],
};
for (const ch in REPLAY) {
  const [id, n, ready, play, line] = REPLAY[ch], talk0 = LQ[ch].talk;
  LQ[ch].talk = async who => {
    const s = st();
    if (who !== id || s.flags['page' + n] || !ready(s)) return talk0(who);
    const N = npc(ch, id);
    await say(N, line); await play(N); ui.doc = null; await activityPage(n, N);
  };
}

// ---------- the quest tracker, once a chapter's own quests are done: always an action and a place
const curQuest0 = LQ.curQuest;
LQ.pageQuest = () => {
  const s = st(), n = LQ.pages();
  if (s.flags.ledgerDone) return { short: 'The Great Ledger is whole', text: 'The Great Ledger is whole. Every region is open', target: null };
  if (n === 12) {
    if (LQ.world.room?.room === 'cellar1') return { short: 'Return the pages', text: 'Open the tall door at the far end of the cellar', target: 'ledgerdoor' };
    if (LQ.world.room?.room === 'cottage1') return { short: 'Return the pages', text: 'Go down the trapdoor to the cellar', target: 'ledgertrap' };
    return { short: 'Return the pages', text: 'Take all 12 pages to your cottage cellar in Paystub Village', target: 'ledgerhome' };
  }
  const next = Object.keys(PAGES).map(Number).find(k => !s.flags['page' + k]);
  if (next) return { short: 'Recover the Ledger Pages', text: `Page ${next} of 12: ${PAGES[next].todo}`, target: PAGES[next].target };
  const v = [1, 2, 3].find(k => !s.flags['page' + k]);
  return { short: 'Recover the Ledger Pages', text: `Page ${v} of 12: ` + ['Solve the Bracket Vault east of Sage Altamira, Paystub Village', 'Light the Lantern Cave east of Bracket Mountain, Paystub Village', 'Search the Mythmonger\'s ground on Bracket Mountain, Paystub Village'][v - 1], target: null };
};
LQ.curQuest = () => { const q = curQuest0(); return st().q4 === 9 && q === LQ.QUESTS4[9] ? LQ.pageQuest() : q; };

LQ.depth = { receipts, budget, hold, activityPage, collect, owed, PAGES, receiptRows, pileOf, slipRows, holdFigures, JAR_STEP };
})();
