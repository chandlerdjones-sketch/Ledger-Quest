// Dialogue, choices, toasts, documents, and the pause menu. Drawn at 960x540.
(() => {
const LQ = window.LQ, VW = 960, VH = 540;
const F = LQ.F = (px, head) => head ? `${px}px "Press Start 2P", monospace` : `${px}px VT323, monospace`;
const ui = LQ.ui = { dlg: null, choice: null, okWait: null, toasts: [], doc: null, menu: null, banner: null };
const sfx = n => LQ.audio.sfx(n);

ui.wrap = (c, text, maxW) => {
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (line && c.measureText(t).width > maxW) { out.push(line); line = word; } else line = t;
    }
    out.push(line);
  }
  return out;
};
ui.panel = (c, x, y, w, h, fill) => {
  // soft outer glow, dark rim, violet frame, cyan corner brackets
  c.fillStyle = 'rgba(155,107,255,.10)'; c.fillRect(x - 12, y - 12, w + 24, h + 24);
  c.fillStyle = 'rgba(53,240,230,.10)'; c.fillRect(x - 9, y - 9, w + 18, h + 18);
  c.fillStyle = '#05050f'; c.fillRect(x - 6, y - 6, w + 12, h + 12);
  c.fillStyle = '#6a4fe0'; c.fillRect(x - 3, y - 3, w + 6, h + 6);
  c.fillStyle = fill || '#0d0f2a'; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(140,160,255,.07)'; c.fillRect(x, y, w, 3);
  c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x, y + h - 3, w, 3);
  c.fillStyle = '#35f0e6';
  const k = Math.min(18, w / 4, h / 4);
  for (const [px, py, sx, sy] of [[x - 3, y - 3, 1, 1], [x + w + 3, y - 3, -1, 1], [x - 3, y + h + 3, 1, -1], [x + w + 3, y + h + 3, -1, -1]]) {
    c.fillRect(sx > 0 ? px : px - k, sy > 0 ? py : py - 3, k, 3); c.fillRect(sx > 0 ? px : px - 3, sy > 0 ? py : py - k, 3, k);
  }
};
ui.text = (c, s, x, y, color, font, align, maxWidth = VW) => {
  c.font = font || F(28); c.textAlign = align || 'left'; c.textBaseline = 'top';
  c.fillStyle = 'rgba(0,0,0,.6)'; c.fillText(s, x + 2, y + 2, maxWidth);
  c.fillStyle = color || '#fff'; c.fillText(s, x, y, maxWidth);
};
const toastLimit = 4;
const hasModal = () => ui.doc || ui.choice || ui.dlg || ui.okWait || ui.menu;
const canShowToasts = () => !hasModal() && LQ.scene !== LQ.battle;
ui.toast = text => {
  ui.toasts.push({ text, t: 0 });
  if (ui.toasts.length > toastLimit) ui.toasts.shift();
};
ui.showBanner = (title, sub) => { ui.banner = { title, sub, t: 0 }; };

// ---- script-facing API
LQ.say = (who, text) => new Promise(res => {
  const c = LQ.ctx; c.font = F(28);
  const lines = ui.wrap(c, text, who && who.look ? 716 : 848), pages = [];
  for (let i = 0; i < lines.length; i += 4) pages.push(lines.slice(i, i + 4));
  ui.dlg = { who, pages, page: 0, chars: 0, res };
});
LQ.choose = (who, prompt, options, onMove) => new Promise(res => {
  ui.choice = { who, prompt, options, sel: 0, res, onMove };
  if (onMove) onMove(0);
});
LQ.pressOk = () => new Promise(res => { ui.okWait = res; });
LQ.shuffle = values => {
  const shuffled = values.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
// Quiz helper. The first option is the correct one; options are shuffled on screen.
LQ.ask = async (who, prompt, options, o = {}) => {
  const order = LQ.shuffle(options.map((_, i) => i));
  let first = true; LQ.state.asked++;
  for (;;) {
    const pick = order[await LQ.choose(who, prompt, order.map(i => options[i]), o.onMove && (s => o.onMove(order[s])))];
    if (pick === 0) {
      sfx('right');
      if (first) { LQ.state.first++; LQ.score(true); }
      if (o.right) await LQ.say(who, o.right);
      return first;
    }
    if (first) LQ.score(false);
    first = false; sfx('wrong'); LQ.shake(0.2);
    if (o.onWrong) o.onWrong();
    await LQ.say(who, (o.wrong && o.wrong[pick - 1]) || 'Not quite. Take another look.');
  }
};
LQ.learn = id => {
  if (LQ.state.journal.includes(id)) return;
  LQ.state.journal.push(id); sfx('learn'); ui.toast('Journal: ' + LQ.JOURNAL[id].title);
};
LQ.give = id => { if (!LQ.state.items.includes(id)) { LQ.state.items.push(id); ui.toast('Got: ' + LQ.ITEMS[id].name); } };

// ---- update
const TABS = ['Quest', 'Journal', 'Items', 'Map', 'Broker'];
const menuStocks = () => {
  const known = LQ.stocksKnown(), here = LQ.exchange();
  return known.filter(s => LQ.shares(s.id)).concat(
    known.filter(s => !LQ.shares(s.id) && here.includes(s)),
    known.filter(s => !LQ.shares(s.id) && !here.includes(s)));
};
const menuGear = () => LQ.GEAR.filter(g => LQ.has(g.id));
const menuEntries = [
  menuGear,
  () => LQ.state.journal.map(id => LQ.JOURNAL[id]),
  () => LQ.state.items.map(id => LQ.ITEMS[id]).concat(menuGear(), LQ.kit?.supplies() || []),
  () => [],
  menuStocks,
];
const scrollStart = (sel, length, rows) => Math.max(0, Math.min(sel - Math.floor(rows / 2), length - rows));
ui.openMenu = () => { ui.menu = { tab: 0, sel: 0, selections: [0, 0, 0, 0, 0], reading: null }; sfx('ok'); };
ui.update = dt => {
  if (canShowToasts()) {
    for (const t of ui.toasts) t.t += dt;
    ui.toasts = ui.toasts.filter(t => t.t < 2.6);
  }
  if (ui.banner) { ui.banner.t += dt; if (ui.banner.t > 3.2) ui.banner = null; }
  if (ui.menu) {
    const m = ui.menu;
    if (LQ.hit('menu')) { ui.menu = null; sfx('move'); return; }
    if (LQ.hit('back')) {
      if (m.reading) m.reading = null;
      else ui.menu = null;
      sfx('move'); return;
    }
    const dir = Number(LQ.hit('down')) - Number(LQ.hit('up'));
    if (m.reading) {
      m.reading.offset = LQ.clamp(m.reading.offset + dir, 0, m.reading.maxOffset);
      return;
    }
    const tabDir = Number(LQ.hit('right')) - Number(LQ.hit('left'));
    if (tabDir) {
      m.selections[m.tab] = m.sel;
      m.tab = (m.tab + TABS.length + tabDir) % TABS.length;
      m.sel = m.selections[m.tab];
      sfx('move');
    }
    if (dir) {
      const n = menuEntries[m.tab]().length;
      if (n) { m.sel = (m.sel + n + dir) % n; sfx('move'); }
    }
    if (LQ.hit('ok') && m.tab < 3) {
      const entry = menuEntries[m.tab]()[m.sel];
      if (entry) { m.reading = { entry, offset: 0, maxOffset: 0 }; sfx('ok'); }
    }
    return;
  }
  if (ui.choice) {
    const ch = ui.choice, n = ch.options.length;
    if (LQ.hit('up')) { ch.sel = (ch.sel + n - 1) % n; sfx('move'); if (ch.onMove) ch.onMove(ch.sel); }
    if (LQ.hit('down')) { ch.sel = (ch.sel + 1) % n; sfx('move'); if (ch.onMove) ch.onMove(ch.sel); }
    if (LQ.hit('back')) {
      const back = ch.options.findIndex(option => option === 'Back' || option === 'Leave');
      if (back >= 0) { ui.choice = null; sfx('move'); ch.res(back); return; }
    }
    if (LQ.hit('ok')) { ui.choice = null; sfx('ok'); ch.res(ch.sel); }
    return;
  }
  if (ui.dlg) {
    const d = ui.dlg, len = d.pages[d.page].join('\n').length;
    if (d.chars < len) {
      const before = Math.floor(d.chars / 3);
      d.chars = Math.min(len, d.chars + dt * 70);
      if (Math.floor(d.chars / 3) !== before) sfx('blip');
      if (LQ.hit('ok')) d.chars = len;
    } else if (LQ.hit('ok')) {
      if (d.page < d.pages.length - 1) { d.page++; d.chars = 0; sfx('move'); }
      else { ui.dlg = null; d.res(); }
    }
    return;
  }
  if (ui.okWait && LQ.hit('ok')) { const r = ui.okWait; ui.okWait = null; sfx('ok'); r(); }
};

// ---- draw
function portrait(c, who, x, y) {
  c.fillStyle = '#05050f'; c.fillRect(x - 4, y - 4, 112, 112);
  c.fillStyle = '#141a44'; c.fillRect(x, y, 104, 104);
  c.fillStyle = '#231f5c'; c.fillRect(x, y + 70, 104, 34);
  c.fillStyle = 'rgba(53,240,230,.10)'; c.fillRect(x + 12, y + 14, 80, 56); c.fillRect(x + 24, y + 6, 56, 72);
  c.imageSmoothingEnabled = false;
  c.drawImage(LQ.charSprite(who.look, 'down', 0), x + 20, y + 4, 64, 96);
  c.strokeStyle = '#35f0e6'; c.lineWidth = 3; c.strokeRect(x - 1.5, y - 1.5, 107, 107);
}
function nameTab(c, who, x, y) {
  if (!who || !who.name) return;
  c.font = F(12, true); const w = c.measureText(who.name).width + 28;
  c.fillStyle = '#05050f'; c.fillRect(x - 3, y - 3, w + 6, 30);
  c.fillStyle = '#35f0e6'; c.fillRect(x, y, w, 24); c.fillStyle = '#a8fff6'; c.fillRect(x, y, w, 3);
  c.fillStyle = '#07081a'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(who.name, x + 14, y + 7);
}
function drawDialogue(c) {
  const d = ui.dlg, x = 30, y = 378, w = 900, h = 142;
  ui.panel(c, x, y, w, h); nameTab(c, d.who, x + 14, y - 30);
  let tx = x + 26;
  if (d.who && d.who.look) { portrait(c, d.who, x + 18, y + 19); tx = x + 150; }
  let left = Math.floor(d.chars);
  d.pages[d.page].forEach((ln, i) => {
    const s = ln.slice(0, Math.max(0, left)); left -= ln.length + 1;
    ui.text(c, s, tx, y + 16 + i * 29, '#eef4ff');
  });
  if (d.chars >= d.pages[d.page].join('\n').length && Math.floor(LQ.time * 3) % 2) {
    c.fillStyle = '#35f0e6'; c.beginPath(); c.moveTo(x + w - 34, y + h - 24); c.lineTo(x + w - 18, y + h - 24); c.lineTo(x + w - 26, y + h - 12); c.fill();
  }
}
function choiceTop(c, ch) {
  c.font = F(28);
  ch.lines = ui.wrap(c, ch.prompt || '', 848);
  ch.rh = ch.options.length > 8 ? 26 : 31;
  ch.rows = Math.min(ui.doc?.choiceRows ?? 10, ch.options.length);
  ch.h = 24 + (ch.prompt ? ch.lines.length * 29 + 10 : 0) + ch.rows * ch.rh + 10;
  ch.y = 520 - ch.h;
}
ui.choiceTop = () => ui.choice?.y ?? (ui.dlg ? 378 : 520);
function drawChoice(c) {
  const ch = ui.choice, y = ch.y, x = 30, w = 900;
  ui.panel(c, x, y, w, ch.h); nameTab(c, ch.who, x + 14, y - 30);
  let ty = y + 14;
  if (ch.prompt) { ch.lines.forEach((ln, i) => ui.text(c, ln, x + 26, ty + i * 29, '#eef4ff')); ty += ch.lines.length * 29 + 10; }
  const off = scrollStart(ch.sel, ch.options.length, ch.rows);
  ch.options.slice(off, off + ch.rows).forEach((o, i) => {
    const on = off + i === ch.sel;
    if (on) { c.fillStyle = 'rgba(53,240,230,.15)'; c.fillRect(x + 14, ty + i * ch.rh - 1, w - 28, ch.rh - 1); }
    if (on) ui.text(c, '>', x + 26 + Math.sin(LQ.time * 8) * 3, ty + i * ch.rh, '#35f0e6', F(ch.rh > 30 ? 28 : 24));
    ui.text(c, o, x + 52, ty + i * ch.rh, on ? '#a8fff6' : '#c9cdea', F(ch.rh > 30 ? 28 : 24), 'left', 810);
  });
  if (ch.rows < ch.options.length) {
    ui.text(c, (ch.sel + 1) + ' / ' + ch.options.length + '   Up / Down', x + w - 22, y - 26, '#c9cdea', F(20), 'right');
  }
}
function drawToasts(c) {
  ui.toasts.forEach((t, i) => {
    const a = Math.min(1, t.t * 6, (2.6 - t.t) * 3), slide = (1 - Math.min(1, t.t * 6)) * 40;
    c.globalAlpha = Math.max(0, a); c.font = F(26);
    const w = c.measureText(t.text).width + 36, x = VW - w - 24 + slide, y = (ui.banner ? 258 : 118) + i * 44;
    c.fillStyle = '#05050f'; c.fillRect(x - 3, y - 3, w + 6, 40);
    c.fillStyle = '#0f2a3c'; c.fillRect(x, y, w, 34); c.fillStyle = '#35f0e6'; c.fillRect(x, y, 6, 34); c.fillStyle = 'rgba(53,240,230,.35)'; c.fillRect(x + 6, y + 32, w - 6, 2);
    ui.text(c, t.text, x + 20, y + 3, '#eafff6', F(26));
    c.globalAlpha = 1;
  });
}
function drawBanner(c) {
  const b = ui.banner, a = Math.min(1, b.t * 2, (3.2 - b.t) * 2);
  c.globalAlpha = Math.max(0, a);
  c.fillStyle = 'rgba(6,5,22,.84)'; c.fillRect(0, 150, VW, 92);
  c.fillStyle = '#35f0e6'; c.fillRect(0, 150, VW, 3); c.fillStyle = '#ff4fb0'; c.fillRect(0, 239, VW, 3);
  c.fillStyle = 'rgba(53,240,230,.12)'; c.fillRect(0, 144, VW, 6); c.fillStyle = 'rgba(255,79,176,.12)'; c.fillRect(0, 242, VW, 6);
  ui.text(c, b.title, VW / 2, 168, '#eef4ff', F(26, true), 'center');
  if (b.sub) ui.text(c, b.sub, VW / 2, 205, '#c9cdea', F(26), 'center');
  c.globalAlpha = 1;
}
function drawEntry(c, entry, x, y, w, h, reading) {
  c.fillStyle = '#e6eaff';
  c.fillRect(x, y, w, h);
  c.textAlign = 'left'; c.textBaseline = 'top'; c.font = F(13, true); c.fillStyle = '#1a1640';
  const title = entry.title || entry.name;
  const heading = ui.wrap(c, title, w - 36);
  heading.forEach((line, i) => c.fillText(line, x + 18, y + 16 + i * 19, w - 36));

  c.font = F(26); c.fillStyle = '#15122e';
  const body = [entry.text || entry.desc, entry.status?.()].filter(Boolean).join('\n\n');
  const lines = ui.wrap(c, body, w - 36), top = 26 + heading.length * 19;
  const rows = Math.floor((h - top - 36) / 27);
  if (reading) reading.maxOffset = Math.max(0, lines.length - rows);
  const off = reading ? Math.min(reading.offset, reading.maxOffset) : 0;
  lines.slice(off, off + rows).forEach((line, i) => c.fillText(line, x + 18, y + top + i * 27, w - 36));
  if (!reading || reading.maxOffset) {
    c.font = F(21); c.fillStyle = '#5a5490';
    c.fillText(reading ? 'Up / Down: scroll' : 'Enter: open', x + 18, y + h - 29);
  }
}

function drawEntries(c, m, x, y, h) {
  const entries = menuEntries[m.tab](), rows = 11, rh = 27;
  if (!entries.length) {
    ui.text(c, m.tab === 1 ? 'Everything you learn is written down here.' : 'Your pack is empty.', x, y, '#c9cdea');
    return;
  }
  const off = scrollStart(m.sel, entries.length, rows);
  entries.slice(off, off + rows).forEach((entry, i) => {
    const yy = y + i * rh, selected = off + i === m.sel;
    if (selected) { c.fillStyle = 'rgba(53,240,230,.15)'; c.fillRect(x - 6, yy - 1, 292, rh); }
    ui.text(c, entry.title || entry.name, x, yy, selected ? '#a8fff6' : '#c9cdea', F(24), 'left', 280);
  });
  ui.text(c, (m.sel + 1) + ' / ' + entries.length, x, y + h - 24, '#c9cdea', F(20));
  drawEntry(c, entries[m.sel], x + 302, y, 462, h);
}

function drawMenu(c) {
  const m = ui.menu, st = LQ.state, x = 70, y = 44, w = 820, h = 452;
  c.fillStyle = 'rgba(7,8,26,.72)'; c.fillRect(0, 0, VW, VH);
  ui.panel(c, x, y, w, h);
  TABS.forEach((t, i) => {
    const on = i === m.tab, tx = x + 24 + i * 156;
    c.fillStyle = on ? '#35f0e6' : '#1a1d4a'; c.fillRect(tx, y + 18, 146, 34); if (on) { c.fillStyle = '#a8fff6'; c.fillRect(tx, y + 18, 146, 3); }
    c.font = F(12, true); c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = on ? '#07081a' : '#c9cdea'; c.fillText(t.toUpperCase(), tx + 73, y + 30);
  });
  const bx = x + 28, by = y + 76;
  const bodyH = 326;
  if (m.reading) drawEntry(c, m.reading.entry, bx, by, 764, bodyH, m.reading);
  else if (m.tab === 0) {
    const opening = LQ.intro?.active();
    const chap = st.q4 != null ? [LQ.QUESTS4, st.q4, 'Chapter 4: Summit of Gains'] : st.q3 != null ? [LQ.QUESTS3, st.q3, 'Chapter 3: Hustle Canyon'] : st.q2 != null ? [LQ.QUESTS2, st.q2, 'Chapter 2: Shelter Coast'] : [LQ.QUESTS, st.quest, 'Chapter 1: The Paystub Village'];
    const qs = chap[0].slice(0, chap[0].length - 1), at = chap[1];
    ui.text(c, chap[2], bx, by, '#35f0e6', F(26), 'left', 412);
    if (opening) ui.text(c, LQ.curQuest().text, bx, by + 40, '#eef4ff', F(26), 'left', 412);
    else qs.forEach((q, i) => {
      const done = at > i, cur = at === i;
      ui.text(c, (done ? '[x] ' : cur ? '[>] ' : '[ ] ') + q.short, bx, by + 40 + i * 30, done ? '#7fd6a8' : cur ? '#eef4ff' : '#9298bc', F(28), 'left', 412);
    });
    ui.text(c, `${st.career ? LQ.career().name : 'New hero'}   Savvy ${st.savvy}   Net worth ${LQ.netWorth()}   Rank: ${LQ.rank()}`, bx, by + 312, '#c9cdea', F(24), 'left', 760);
    ui.text(c, 'GEAR', bx + 430, by + 6, '#35f0e6', F(10, true));
    const gear = menuGear(), off = scrollStart(m.sel, gear.length, 9);
    if (!gear.length) ui.text(c, 'None yet. Visit the Bazaar.', bx + 430, by + 40, '#6d7299', F(24));
    if (gear.length > 9) ui.text(c, (m.sel + 1) + ' / ' + gear.length, bx + 760, by + 2, '#c9cdea', F(20), 'right');
    gear.slice(off, off + 9).forEach((g, i) => {
      ui.text(c, g.name, bx + 430, by + 40 + i * 29, off + i === m.sel ? '#a8fff6' : '#7fd6a8', F(24), 'left', 330);
    });
  } else if (m.tab === 1 || m.tab === 2) drawEntries(c, m, bx, by, bodyH);
  else if (m.tab === 3) LQ.drawWorldMap(c, bx, by, 764, bodyH, st.region);
  else {
    ui.text(c, `Cash ${st.coins}    Stocks ${LQ.portfolio()}    Net worth ${LQ.netWorth()}`, bx, by, '#ffcf4a', F(26), 'left', 664);
    const known = menuStocks(), off = scrollStart(m.sel, known.length, 9), list = known.slice(off, off + 9);
    const columns = [
      ['Price', 384, 68], ['Change', 475, 87], ['Shares', 561, 82],
      ['Gain/loss', 665, 100], ['Holding', 764, 95],
    ];
    const headingY = by + 31, rh = 23;
    ui.text(c, (m.sel + 1) + ' / ' + known.length, bx + 764, by + 3, '#c9cdea', F(20), 'right');
    ui.text(c, 'Company', bx, headingY, '#c9cdea', F(20));
    columns.forEach(([label, right, width]) => ui.text(c, label, bx + right, headingY, '#c9cdea', F(20), 'right', width));
    list.forEach((s, i) => {
      const yy = headingY + 23 + i * rh, n = LQ.shares(s.id), ch = (st.prices[s.id] / st.prev[s.id] - 1) * 100;
      const lots = st.lots[s.id], cost = lots.reduce((a, l) => a + l.n * l.cost, 0), gain = n * LQ.price(s.id) - cost;
      const term = lots.every(l => l.lt) ? 'Long' : lots.some(l => l.lt) ? 'Mixed' : 'Short';
      if (off + i === m.sel) { c.fillStyle = 'rgba(53,240,230,.15)'; c.fillRect(bx - 8, yy - 1, 776, rh); }
      ui.text(c, s.id, bx, yy, '#a8fff6', F(22), 'left', 61);
      ui.text(c, s.name, bx + 68, yy, '#eef4ff', F(22), 'left', 242);
      const cells = [
        [LQ.price(s.id), '#eef4ff'],
        [(ch >= 0 ? '+' : '') + ch.toFixed(1) + '%', ch >= 0 ? '#7fd6a8' : '#ff8a80'],
        [n || '-', '#c9cdea'],
        [n ? (gain >= 0 ? '+' : '') + gain : '-', gain >= 0 ? '#7fd6a8' : '#ff8a80'],
        [n ? term : '-', '#c9cdea'],
      ];
      cells.forEach(([value, color], k) => {
        const [, right, width] = columns[k];
        ui.text(c, String(value), bx + right, yy, color, F(22), 'right', width);
      });
    });
    const selected = known[m.sel], end = headingY + 23 + list.length * rh;
    ui.text(c, selected.id + ': Buy or sell at ' + LQ.stockVenue(selected), bx, end + 6, '#a8fff6', F(22), 'left', 764);
    ui.text(c, `Tax paid on gains and dividends: ${st.capTax || 0}    Banked losses: ${st.lossBank || 0}`, bx, end + 29, '#c9cdea', F(22), 'left', 764);
    if (st.gazette.length) ui.text(c, 'Gazette: ' + st.gazette[0], bx, end + 51, '#eef4ff', F(20), 'left', 764);
  }
  const hint = m.reading ? 'Esc: back to list    J: close' :
    ['Up / Down: gear    Enter: read', 'Up / Down: notes    Enter: read', 'Up / Down: items    Enter: read', '', 'Up / Down: stocks'][m.tab];
  const footer = m.reading ? hint : ['Left / Right: tabs', hint, 'J or Esc: close'].filter(Boolean).join('    ');
  ui.text(c, footer, x + w / 2, y + h - 32, '#c9cdea', F(21), 'center', 764);
}
ui.draw = c => {
  if (ui.choice) choiceTop(c, ui.choice);
  if (ui.doc) {
    c.fillStyle = 'rgba(7,8,26,.66)'; c.fillRect(0, 0, VW, VH);
    ui.doc.draw(c);
  }
  if (ui.choice) drawChoice(c); else if (ui.dlg) drawDialogue(c);
  else if (ui.okWait) ui.text(c, 'Space: continue', VW / 2, 500, '#35f0e6', F(26), 'center');
  if (ui.banner && !hasModal()) drawBanner(c);
  if (canShowToasts()) drawToasts(c);
  if (ui.menu) drawMenu(c);
};
})();
