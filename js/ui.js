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
  c.fillStyle = '#090b18'; c.fillRect(x - 6, y - 6, w + 12, h + 12);
  c.fillStyle = '#f3e7c3'; c.fillRect(x - 3, y - 3, w + 6, h + 6);
  c.fillStyle = fill || '#161a36'; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(x, y, w, 3);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x, y + h - 3, w, 3);
};
ui.text = (c, s, x, y, color, font, align) => {
  c.font = font || F(28); c.textAlign = align || 'left'; c.textBaseline = 'top';
  c.fillStyle = 'rgba(0,0,0,.6)'; c.fillText(s, x + 2, y + 2);
  c.fillStyle = color || '#fff'; c.fillText(s, x, y);
};
ui.toast = text => { ui.toasts.push({ text, t: 0 }); };
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
// Quiz helper. The first option is the correct one; options are shuffled on screen.
LQ.ask = async (who, prompt, options, o = {}) => {
  const order = options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
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
ui.openMenu = () => { ui.menu = { tab: 0, sel: 0 }; sfx('ok'); };
ui.update = dt => {
  for (const t of ui.toasts) t.t += dt;
  ui.toasts = ui.toasts.filter(t => t.t < 2.6);
  if (ui.banner) { ui.banner.t += dt; if (ui.banner.t > 3.2) ui.banner = null; }
  if (ui.menu) {
    const m = ui.menu;
    if (LQ.hit('left')) { m.tab = (m.tab + TABS.length - 1) % TABS.length; m.sel = 0; sfx('move'); }
    if (LQ.hit('right')) { m.tab = (m.tab + 1) % TABS.length; m.sel = 0; sfx('move'); }
    const n = m.tab === 1 ? LQ.state.journal.length : 0;
    if (n && LQ.hit('up')) { m.sel = (m.sel + n - 1) % n; sfx('move'); }
    if (n && LQ.hit('down')) { m.sel = (m.sel + 1) % n; sfx('move'); }
    if (LQ.hit('menu') || LQ.hit('back') || LQ.hit('ok')) { ui.menu = null; sfx('move'); }
    return;
  }
  if (ui.choice) {
    const ch = ui.choice, n = ch.options.length;
    if (LQ.hit('up')) { ch.sel = (ch.sel + n - 1) % n; sfx('move'); if (ch.onMove) ch.onMove(ch.sel); }
    if (LQ.hit('down')) { ch.sel = (ch.sel + 1) % n; sfx('move'); if (ch.onMove) ch.onMove(ch.sel); }
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
  c.fillStyle = '#090b18'; c.fillRect(x - 4, y - 4, 112, 112);
  c.fillStyle = '#2a3160'; c.fillRect(x, y, 104, 104);
  c.fillStyle = '#39417a'; c.fillRect(x, y + 70, 104, 34);
  c.imageSmoothingEnabled = false;
  c.drawImage(LQ.charSprite(who.look, 'down', 0), 0, 0, 18, 20, x + 16, y + 8, 72, 80);
  c.strokeStyle = '#f3e7c3'; c.lineWidth = 3; c.strokeRect(x - 1.5, y - 1.5, 107, 107);
}
function nameTab(c, who, x, y) {
  if (!who || !who.name) return;
  c.font = F(12, true); const w = c.measureText(who.name).width + 28;
  c.fillStyle = '#090b18'; c.fillRect(x - 3, y - 3, w + 6, 30);
  c.fillStyle = '#f3c531'; c.fillRect(x, y, w, 24);
  c.fillStyle = '#231a36'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(who.name, x + 14, y + 7);
}
function drawDialogue(c) {
  const d = ui.dlg, x = 30, y = 378, w = 900, h = 142;
  ui.panel(c, x, y, w, h); nameTab(c, d.who, x + 14, y - 30);
  let tx = x + 26;
  if (d.who && d.who.look) { portrait(c, d.who, x + 18, y + 19); tx = x + 150; }
  let left = Math.floor(d.chars);
  d.pages[d.page].forEach((ln, i) => {
    const s = ln.slice(0, Math.max(0, left)); left -= ln.length + 1;
    ui.text(c, s, tx, y + 16 + i * 29, '#fdf8e7');
  });
  if (d.chars >= d.pages[d.page].join('\n').length && Math.floor(LQ.time * 3) % 2) {
    c.fillStyle = '#f3c531'; c.beginPath(); c.moveTo(x + w - 34, y + h - 24); c.lineTo(x + w - 18, y + h - 24); c.lineTo(x + w - 26, y + h - 12); c.fill();
  }
}
ui.choiceTop = () => {
  const ch = ui.choice; if (!ch) return ui.dlg ? 372 : VH;
  const c = LQ.ctx; c.font = F(28);
  ch.lines = ui.wrap(c, ch.prompt || '', 848);
  ch.rh = ch.options.length > 8 ? 26 : 31;
  ch.h = 24 + (ch.prompt ? ch.lines.length * 29 + 10 : 0) + ch.options.length * ch.rh + 10;
  return 520 - ch.h;
};
function drawChoice(c) {
  const ch = ui.choice, y = ui.choiceTop(), x = 30, w = 900;
  ui.panel(c, x, y, w, ch.h); nameTab(c, ch.who, x + 14, y - 30);
  let ty = y + 14;
  if (ch.prompt) { ch.lines.forEach((ln, i) => ui.text(c, ln, x + 26, ty + i * 29, '#fdf8e7')); ty += ch.lines.length * 29 + 10; }
  ch.options.forEach((o, i) => {
    const on = i === ch.sel;
    if (on) { c.fillStyle = 'rgba(243,197,49,.16)'; c.fillRect(x + 14, ty + i * ch.rh - 1, w - 28, ch.rh - 1); }
    if (on) ui.text(c, '>', x + 26 + Math.sin(LQ.time * 8) * 3, ty + i * ch.rh, '#f3c531', F(ch.rh > 30 ? 28 : 24));
    ui.text(c, o, x + 52, ty + i * ch.rh, on ? '#ffe98a' : '#c9cdea', F(ch.rh > 30 ? 28 : 24));
  });
}
function drawToasts(c) {
  ui.toasts.slice(-4).forEach((t, i) => {
    const a = Math.min(1, t.t * 6, (2.6 - t.t) * 3), slide = (1 - Math.min(1, t.t * 6)) * 40;
    c.globalAlpha = Math.max(0, a); c.font = F(26);
    const w = c.measureText(t.text).width + 36, x = VW - w - 24 + slide, y = (ui.doc ? 300 : 70) + i * 44;
    c.fillStyle = '#090b18'; c.fillRect(x - 3, y - 3, w + 6, 40);
    c.fillStyle = '#1f6f5c'; c.fillRect(x, y, w, 34); c.fillStyle = '#39b08f'; c.fillRect(x, y, 6, 34);
    ui.text(c, t.text, x + 20, y + 3, '#eafff6', F(26));
    c.globalAlpha = 1;
  });
}
function drawBanner(c) {
  const b = ui.banner, a = Math.min(1, b.t * 2, (3.2 - b.t) * 2);
  c.globalAlpha = Math.max(0, a);
  c.fillStyle = 'rgba(9,11,24,.78)'; c.fillRect(0, 150, VW, 92);
  c.fillStyle = '#f3c531'; c.fillRect(0, 150, VW, 3); c.fillRect(0, 239, VW, 3);
  ui.text(c, b.title, VW / 2, 168, '#fdf8e7', F(26, true), 'center');
  if (b.sub) ui.text(c, b.sub, VW / 2, 205, '#c9cdea', F(26), 'center');
  c.globalAlpha = 1;
}
function drawMenu(c) {
  const m = ui.menu, st = LQ.state, x = 70, y = 44, w = 820, h = 452;
  c.fillStyle = 'rgba(7,8,26,.72)'; c.fillRect(0, 0, VW, VH);
  ui.panel(c, x, y, w, h);
  TABS.forEach((t, i) => {
    const on = i === m.tab, tx = x + 24 + i * 156;
    c.fillStyle = on ? '#f3c531' : '#2a3160'; c.fillRect(tx, y + 18, 146, 34);
    c.font = F(12, true); c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = on ? '#231a36' : '#c9cdea'; c.fillText(t.toUpperCase(), tx + 73, y + 30);
  });
  const bx = x + 28, by = y + 76;
  if (m.tab === 0) {
    const ch2 = st.q2 != null, qs = ch2 ? LQ.QUESTS2.slice(0, 8) : LQ.QUESTS.slice(0, 9), at = ch2 ? st.q2 : st.quest;
    ui.text(c, ch2 ? 'Chapter 2: Shelter Coast' : 'Chapter 1: The Paystub Village', bx, by, '#f3c531');
    qs.forEach((q, i) => {
      const done = at > i, cur = at === i;
      ui.text(c, (done ? '[x] ' : cur ? '[>] ' : '[ ] ') + q.short, bx, by + 40 + i * 30, done ? '#7fd6a8' : cur ? '#fdf8e7' : '#6d7299');
    });
    ui.text(c, `${LQ.career().name}   Savvy ${st.savvy}   Net worth ${LQ.netWorth()}   Rank: ${LQ.rank()}`, bx, by + 316, '#c9cdea');
    ui.text(c, 'GEAR', bx + 430, by + 6, '#f3c531', F(10, true));
    const gear = LQ.GEAR.filter(g => LQ.has(g.id));
    if (!gear.length) ui.text(c, 'None yet. Visit the Bazaar.', bx + 430, by + 40, '#6d7299', F(24));
    gear.forEach((g, i) => ui.text(c, g.name, bx + 430, by + 40 + i * 27, '#7fd6a8', F(24)));
  } else if (m.tab === 1) {
    if (!st.journal.length) ui.text(c, 'Nothing yet. Everything you learn is written down here.', bx, by, '#c9cdea');
    const off = Math.max(0, Math.min(m.sel - 5, st.journal.length - 13));
    st.journal.slice(off, off + 13).forEach((id, k) => {
      const on = k + off === m.sel;
      if (on) { c.fillStyle = 'rgba(243,197,49,.16)'; c.fillRect(bx - 8, by + k * 27 - 1, 296, 27); }
      ui.text(c, LQ.JOURNAL[id].title, bx, by + k * 27, on ? '#ffe98a' : '#c9cdea', F(24));
    });
    const e = LQ.JOURNAL[st.journal[m.sel]];
    if (e) {
      c.fillStyle = '#f6efd9'; c.fillRect(bx + 304, by - 6, 462, 360);
      c.font = F(13, true); c.fillStyle = '#3a2f1c'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(e.title, bx + 320, by + 12);
      c.font = F(25); ui.wrap(c, e.text, 428).forEach((ln, i) => { c.fillStyle = '#2c2416'; c.fillText(ln, bx + 320, by + 44 + i * 26); });
    }
  } else if (m.tab === 2) {
    if (!st.items.length) ui.text(c, 'Your pack is empty.', bx, by, '#c9cdea');
    const rh = st.items.length > 8 ? 26 : 44, two = rh > 30;
    st.items.forEach((id, i) => {
      ui.text(c, LQ.ITEMS[id].name, bx, by + i * rh, '#ffe98a', F(two ? 28 : 24));
      if (two) ui.text(c, LQ.ITEMS[id].desc, bx + 24, by + i * rh + 22, '#c9cdea', F(22));
      else ui.text(c, LQ.ITEMS[id].desc, bx + 290, by + i * rh + 2, '#c9cdea', F(20));
    });
  } else if (m.tab === 3) LQ.drawWorldMap(c, x + 40, by - 4, w - 80, 360);
  else {
    ui.text(c, `Cash ${st.coins}    Stocks ${LQ.portfolio()}    Net worth ${LQ.netWorth()}`, bx, by, '#f3c531');
    const list = LQ.stocksKnown(), rh = list.length > 6 ? 23 : 28, fs = list.length > 6 ? 22 : 24, end = by + 40 + list.length * rh;
    list.forEach((s, i) => {
      const yy = by + 40 + i * rh, n = LQ.shares(s.id), ch = (st.prices[s.id] / st.prev[s.id] - 1) * 100;
      const cost = st.lots[s.id].reduce((a, l) => a + l.n * l.cost, 0), gain = n * LQ.price(s.id) - cost;
      ui.text(c, s.id, bx, yy, '#ffe98a', F(fs)); ui.text(c, s.name, bx + 70, yy, '#fdf8e7', F(fs));
      ui.text(c, String(LQ.price(s.id)), bx + 400, yy, '#fdf8e7', F(fs), 'right');
      ui.text(c, (ch >= 0 ? '+' : '') + ch.toFixed(1) + '%', bx + 490, yy, ch >= 0 ? '#7fd6a8' : '#ff8a80', F(fs), 'right');
      ui.text(c, n ? n + ' sh' : '-', bx + 580, yy, '#c9cdea', F(fs), 'right');
      ui.text(c, n ? (gain >= 0 ? '+' : '') + gain : '', bx + 680, yy, gain >= 0 ? '#7fd6a8' : '#ff8a80', F(fs), 'right');
      ui.text(c, n ? (st.lots[s.id].every(l => l.lt) ? 'long' : 'short') : '', bx + 760, yy, '#8fa3c8', F(20), 'right');
    });
    ui.text(c, `Tax paid on gains and dividends: ${st.capTax || 0}    Banked losses: ${st.lossBank || 0}`, bx, end + 12, '#c9cdea', F(24));
    ui.text(c, 'GAZETTE', bx, end + 50, '#f3c531', F(10, true));
    (st.gazette || []).slice(0, list.length > 6 ? 1 : 2).forEach((g, i) => ui.text(c, (i ? '  ' : '> ') + g, bx, end + 68 + i * 25, i ? '#6d7299' : '#fdf8e7', F(22)));
    ui.text(c, 'Trade at an exchange.', bx + 764, by + 2, '#6d7299', F(22), 'right');
  }
  ui.text(c, 'Left / Right: tabs    Up / Down: scroll    J or Esc: close', x + w / 2, y + h - 34, '#6d7299', F(22), 'center');
}
ui.draw = c => {
  if (ui.doc) {
    c.fillStyle = 'rgba(7,8,26,.66)'; c.fillRect(0, 0, VW, VH);
    ui.doc.draw(c);
  }
  if (ui.choice) drawChoice(c); else if (ui.dlg) drawDialogue(c);
  else if (ui.okWait && Math.floor(LQ.time * 2) % 2) ui.text(c, 'Press Space', VW / 2, 500, '#f3c531', F(26), 'center');
  if (ui.banner) drawBanner(c);
  drawToasts(c);
  if (ui.menu) drawMenu(c);
};
})();
