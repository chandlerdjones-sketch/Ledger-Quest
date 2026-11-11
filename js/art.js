// All pixel art is drawn in code and cached on small canvases.
(() => {
const LQ = window.LQ, T = 16;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
LQ.mk = mk;
LQ.shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, v + amt));
  return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1);
};
const sh = LQ.shade;
function outline(src, color = '#1b1626') {
  const o = mk(src.width + 2, src.height + 2), g = o.getContext('2d');
  const sil = mk(src.width, src.height), sg = sil.getContext('2d');
  sg.drawImage(src, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = color; sg.fillRect(0, 0, sil.width, sil.height);
  for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) g.drawImage(sil, dx, dy);
  g.drawImage(src, 1, 1);
  return o;
}
const cache = {};
const cached = (key, fn) => cache[key] || (cache[key] = fn());

// ---------- characters (16x24 art, feet at the bottom)
function paintChar(g, L, dir, f) {
  const skin = L.skin || '#f2c79a', hair = L.hair || '#5a3a22', shirt = L.shirt || '#3b6fd4', pants = L.pants || '#3a3550';
  const O = 4, bob = (f === 1 || f === 3) ? 1 : 0, step = f === 1 ? 1 : f === 3 ? 2 : 0, eye = '#22192e';
  const side = dir === 'left';
  // legs
  if (L.robe) {
    R(g, 4, O + 14, 8, 5, shirt); R(g, 3, O + 16, 10, 3, shirt); R(g, 3, O + 18, 10, 1, sh(shirt, -35));
    R(g, 5 + (step === 1 ? 1 : 0), O + 19, 2, 1, '#2a2233'); R(g, 9 - (step === 2 ? 1 : 0), O + 19, 2, 1, '#2a2233');
  } else if (side) {
    R(g, 5 - (step === 1 ? 1 : 0), O + 15, 3, step === 1 ? 3 : 4, pants); R(g, 8 + (step === 2 ? 1 : 0), O + 15, 3, step === 2 ? 3 : 4, sh(pants, -15));
    R(g, 4 - (step === 1 ? 1 : 0), O + (step === 1 ? 18 : 19), 4, 1, '#2a2233'); R(g, 8 + (step === 2 ? 1 : 0), O + (step === 2 ? 18 : 19), 3, 1, '#2a2233');
  } else {
    R(g, 5, O + 15, 2, step === 1 ? 3 : 4, pants); R(g, 9, O + 15, 2, step === 2 ? 3 : 4, pants);
    R(g, 4, O + (step === 1 ? 18 : 19), 3, 1, '#2a2233'); R(g, 9, O + (step === 2 ? 18 : 19), 3, 1, '#2a2233');
  }
  // body and arms
  const by = O + 9 + bob;
  R(g, 4, by, 8, 6, shirt); R(g, 4, by + 5, 8, 1, sh(shirt, -30));
  if (L.trim) R(g, 7, by, 2, 6, L.trim);
  if (side) { R(g, 6 + (step === 1 ? -1 : step === 2 ? 1 : 0), by + 1, 3, 4, sh(shirt, -20)); R(g, 6 + (step === 1 ? -1 : step === 2 ? 1 : 0), by + 5, 3, 1, skin); }
  else { R(g, 3, by + 1, 1, 4, sh(shirt, -20)); R(g, 12, by + 1, 1, 4, sh(shirt, -20)); R(g, 3, by + 4, 1, 1, skin); R(g, 12, by + 4, 1, 1, skin); }
  // head
  const hy = O + 2 + bob;
  R(g, 4, hy, 8, 7, skin);
  if (dir === 'down') {
    R(g, 4, hy - 1, 8, 3, hair); R(g, 3, hy, 1, L.long ? 8 : 4, hair); R(g, 12, hy, 1, L.long ? 8 : 4, hair);
    R(g, 6, hy + 4, 1, 2, eye); R(g, 9, hy + 4, 1, 2, eye);
    if (L.beard) { R(g, 4, hy + 6, 8, 2, L.beard); R(g, 5, hy + 8, 6, 1, L.beard); }
  } else if (dir === 'up') {
    R(g, 3, hy - 1, 10, 7, hair); if (L.long) R(g, 3, hy + 6, 10, 2, hair); else R(g, 5, hy + 6, 6, 1, skin);
  } else {
    R(g, 4, hy - 1, 8, 3, hair); R(g, 8, hy, 5, L.long ? 8 : 5, hair);
    R(g, 5, hy + 4, 1, 2, eye);
    if (L.beard) R(g, 4, hy + 6, 5, 2, L.beard);
  }
  // hats
  if (L.hat === 'top') { R(g, 5, hy - 5, 6, 4, '#2b2540'); R(g, 5, hy - 2, 6, 1, '#c9423a'); R(g, 3, hy - 1, 10, 1, '#2b2540'); }
  if (L.hat === 'cap') { R(g, 4, hy - 2, 8, 3, L.hatColor || '#2f6fd0'); if (dir === 'down') R(g, 4, hy + 1, 8, 1, sh(L.hatColor || '#2f6fd0', -40)); else if (dir !== 'up') R(g, 2, hy, 4, 1, sh(L.hatColor || '#2f6fd0', -40)); }
  if (L.hat === 'helm') { R(g, 3, hy - 2, 10, 4, '#aeb4c4'); R(g, 3, hy - 2, 10, 1, '#d7dbe6'); R(g, 7, hy - 4, 2, 2, '#c9423a'); if (dir === 'down') R(g, 7, hy + 2, 2, 3, '#aeb4c4'); }
  if (L.hat === 'fedora') { R(g, 4, hy - 3, 8, 3, '#22232e'); R(g, 4, hy - 1, 8, 1, '#c9423a'); R(g, 2, hy, 12, 1, '#22232e'); }
  if (L.hat === 'crown') { R(g, 4, hy - 2, 8, 2, '#f3c531'); R(g, 4, hy - 4, 2, 2, '#f3c531'); R(g, 7, hy - 4, 2, 2, '#f3c531'); R(g, 10, hy - 4, 2, 2, '#f3c531'); R(g, 7, hy - 1, 2, 1, '#c9423a'); }
  if (L.shades && dir === 'down') R(g, 5, hy + 4, 6, 2, '#0e0e16');
  if (L.shades && dir === 'left') R(g, 4, hy + 4, 3, 2, '#0e0e16');
  if (L.hat === 'hood') { R(g, 3, hy - 2, 10, 3, shirt); R(g, 3, hy, 1, 7, shirt); R(g, 12, hy, 1, 7, shirt); if (dir === 'up') R(g, 3, hy - 2, 10, 9, shirt); R(g, 3, hy - 2, 10, 1, sh(shirt, 30)); }
}
LQ.charSprite = (look, dir, frame) => cached('c|' + look.id + '|' + dir + '|' + frame, () => {
  const c = mk(16, 24), g = c.getContext('2d');
  if (dir === 'right') {
    const t = mk(16, 24); paintChar(t.getContext('2d'), look, 'left', frame);
    g.translate(16, 0); g.scale(-1, 1); g.drawImage(t, 0, 0);
  } else paintChar(g, look, dir, frame);
  return outline(c);
});

// ---------- trees
LQ.treeSprite = (kind, season) => cached('t|' + kind + '|' + season, () => {
  const c = mk(20, 30), g = c.getContext('2d'), w = season === 'winter';
  if (kind === 'pine') {
    R(g, 9, 24, 2, 6, '#5b3a22');
    for (let i = 0; i < 4; i++) for (let r = 0; r < 6; r++) {
      const wd = Math.max(2, Math.round((6 + i * 4) * (r + 1) / 6)), y = 1 + i * 5 + r;
      R(g, 10 - wd / 2, y, wd, 1, r < 2 && (w || i === 0) ? '#f3f7fb' : r === 5 ? '#17553a' : '#22704a');
    }
    return outline(c);
  }
  if (kind === 'palm') {
    for (let i = 0; i < 16; i++) { const x = 9 + Math.round(Math.sin(i / 5) * 2); R(g, x, 29 - i, 3, 1, i % 3 ? '#8a6238' : '#6b4a28'); }
    const fr = (x, y, dx, n, col) => { for (let i = 0; i < n; i++) R(g, x + dx * i, y + Math.round(i * i / 7), 2, 2, col); };
    fr(10, 9, 1, 8, '#2f8a3c'); fr(9, 9, -1, 8, '#2f8a3c'); fr(10, 7, 1, 7, '#52b14c'); fr(9, 7, -1, 7, '#52b14c');
    R(g, 8, 5, 5, 3, '#3da04a'); R(g, 9, 3, 3, 3, '#52b14c'); R(g, 6, 6, 2, 2, '#3da04a'); R(g, 13, 6, 2, 2, '#3da04a');
    R(g, 9, 12, 2, 2, '#7a4a22'); R(g, 11, 13, 2, 2, '#7a4a22');
    return outline(c);
  }
  const g1 = w ? '#dfe9f2' : '#2f8a3c', g2 = w ? '#ffffff' : '#52b14c', g3 = w ? '#b3c5d6' : '#1f6b33';
  R(g, 8, 21, 4, 9, '#6b4428'); R(g, 8, 21, 1, 9, '#523320');
  R(g, 4, 5, 12, 15, g1); R(g, 2, 8, 16, 10, g1); R(g, 6, 2, 8, 4, g1); R(g, 3, 6, 2, 2, g1); R(g, 15, 6, 2, 2, g1);
  R(g, 6, 4, 5, 3, g2); R(g, 4, 8, 4, 3, g2); R(g, 11, 7, 3, 2, g2); R(g, 8, 11, 2, 1, g2); R(g, 13, 11, 2, 1, g2);
  R(g, 3, 17, 14, 2, g3); R(g, 5, 19, 10, 1, g3); R(g, 14, 13, 2, 2, g3); R(g, 6, 14, 2, 1, g3);
  if (w) { R(g, 5, 15, 3, 1, '#2f6b45'); R(g, 12, 16, 2, 1, '#2f6b45'); }
  return outline(c);
});

// ---------- buildings (5 tiles wide, 3 tiles of footprint, roof above)
const ICONS = {
  quill: g => { for (let i = 0; i < 6; i++) R(g, 3 + i, 6 - i, 2, 1, '#3a2f1c'); R(g, 2, 7, 1, 1, '#3a2f1c'); },
  mail: g => { R(g, 1, 2, 10, 6, '#fff'); R(g, 1, 2, 10, 1, '#3a2f1c'); R(g, 1, 7, 10, 1, '#3a2f1c'); R(g, 1, 2, 1, 6, '#3a2f1c'); R(g, 10, 2, 1, 6, '#3a2f1c'); R(g, 3, 4, 2, 1, '#3a2f1c'); R(g, 5, 5, 2, 1, '#3a2f1c'); R(g, 7, 4, 2, 1, '#3a2f1c'); },
  banner: g => { R(g, 2, 1, 1, 8, '#3a2f1c'); R(g, 3, 1, 7, 4, '#c9423a'); R(g, 3, 5, 5, 1, '#c9423a'); },
  shield: g => { R(g, 2, 1, 8, 5, '#3b6fd4'); R(g, 3, 6, 6, 1, '#3b6fd4'); R(g, 4, 7, 4, 1, '#3b6fd4'); R(g, 5, 8, 2, 1, '#3b6fd4'); R(g, 5, 2, 2, 5, '#f3d24a'); },
  scroll: g => { R(g, 2, 1, 8, 8, '#fff'); R(g, 3, 3, 6, 1, '#3a2f1c'); R(g, 3, 5, 6, 1, '#3a2f1c'); R(g, 3, 7, 4, 1, '#3a2f1c'); },
  heart: g => { R(g, 2, 2, 3, 2, '#e0564e'); R(g, 7, 2, 3, 2, '#e0564e'); R(g, 1, 3, 10, 3, '#e0564e'); R(g, 2, 6, 8, 1, '#e0564e'); R(g, 3, 7, 6, 1, '#e0564e'); R(g, 5, 8, 2, 1, '#e0564e'); },
  bell: g => { R(g, 5, 0, 2, 1, '#8a6a1c'); R(g, 4, 1, 4, 4, '#e0b23a'); R(g, 3, 5, 6, 2, '#e0b23a'); R(g, 2, 7, 8, 1, '#8a6a1c'); R(g, 5, 8, 2, 1, '#8a6a1c'); R(g, 5, 2, 1, 3, '#fff3b0'); },
  anchor: g => { R(g, 5, 1, 2, 8, '#3a2f1c'); R(g, 3, 3, 6, 1, '#3a2f1c'); R(g, 4, 0, 4, 1, '#3a2f1c'); R(g, 1, 6, 1, 2, '#3a2f1c'); R(g, 10, 6, 1, 2, '#3a2f1c'); R(g, 2, 8, 8, 1, '#3a2f1c'); },
  coin: g => { R(g, 3, 1, 6, 8, '#e0b23a'); R(g, 2, 2, 8, 6, '#e0b23a'); R(g, 5, 2, 2, 6, '#8a6a1c'); R(g, 4, 3, 4, 1, '#8a6a1c'); R(g, 4, 6, 4, 1, '#8a6a1c'); },
  star: g => { R(g, 5, 0, 2, 9, '#e0a02c'); R(g, 1, 3, 10, 2, '#e0a02c'); R(g, 3, 2, 6, 5, '#e0a02c'); R(g, 2, 7, 2, 2, '#e0a02c'); R(g, 8, 7, 2, 2, '#e0a02c'); },
  home: g => { R(g, 3, 2, 2, 2, '#e0564e'); R(g, 7, 2, 2, 2, '#e0564e'); R(g, 2, 3, 8, 2, '#e0564e'); R(g, 3, 5, 6, 1, '#e0564e'); R(g, 4, 6, 4, 1, '#e0564e'); R(g, 5, 7, 2, 1, '#e0564e'); },
};
LQ.buildingSprite = (b, season) => cached('b|' + b.id + '|' + season, () => {
  const c = mk(80, 70), g = c.getContext('2d'), w = season === 'winter', roof = b.roof, wall = b.wall || '#efe2c2', beam = '#6b4a2e';
  // wall
  R(g, 4, 30, 72, 40, wall); R(g, 4, 30, 72, 6, sh(wall, -30));
  for (let i = 0; i < 40; i++) { const x = 6 + Math.floor(LQ.hash(i, 3, 7) * 68), y = 38 + Math.floor(LQ.hash(i, 9, 7) * 26); R(g, x, y, 2, 1, sh(wall, -14)); }
  R(g, 4, 30, 2, 40, beam); R(g, 74, 30, 2, 40, beam); R(g, 28, 36, 2, 34, beam); R(g, 50, 36, 2, 34, beam);
  R(g, 4, 64, 72, 6, '#807c8a'); for (let x = 6; x < 76; x += 8) R(g, x, 64, 1, 6, '#646070'); R(g, 4, 64, 72, 1, '#9d99a8');
  // windows
  for (const wx of [9, 57]) {
    R(g, wx, 42, 14, 15, beam); R(g, wx + 2, 44, 10, 11, '#ffd978'); R(g, wx + 2, 44, 10, 3, '#fff0b8');
    R(g, wx + 6, 44, 2, 11, beam); R(g, wx + 2, 49, 10, 1, beam); R(g, wx - 1, 57, 16, 2, sh(beam, -20));
    if (w) R(g, wx - 1, 56, 16, 2, '#f3f7fb');
  }
  // door
  R(g, 32, 44, 16, 26, beam); R(g, 34, 46, 12, 24, '#8a5630'); R(g, 34, 46, 12, 2, '#a66b3d');
  R(g, 39, 46, 1, 24, '#6f4526'); R(g, 43, 58, 2, 2, '#f3d24a');
  // roof
  for (let r = 0; r < 34; r++) {
    const inset = Math.max(0, Math.round(11 - r / 2.6)), band = Math.floor(r / 4);
    R(g, inset, r, 80 - inset * 2, 1, r % 4 === 3 ? sh(roof, -38) : band % 2 ? sh(roof, -10) : roof);
    if (r % 4 !== 3) for (let x = inset + (band % 2 ? 4 : 0); x < 80 - inset; x += 8) R(g, x, r, 1, 1, sh(roof, -30));
  }
  R(g, 0, 33, 80, 2, sh(roof, -60)); R(g, 11, 0, 58, 1, sh(roof, 40));
  R(g, 58, 2, 9, 12, '#8d5b4b'); R(g, 57, 1, 11, 3, '#6d4438'); R(g, 60, 6, 3, 1, '#a87565'); R(g, 62, 10, 3, 1, '#a87565');
  if (w) {
    for (let x = 0; x < 80; x++) { const inset = 11, d = 5 + Math.floor(LQ.hash(x >> 1, 2, 5) * 4); if (x >= inset && x < 80 - inset) R(g, x, 0, 1, d, '#f3f7fb'); }
    for (let x = 0; x < 80; x += 2) if (LQ.hash(x, 8, 5) > .45) R(g, x, 30, 2, 3 + Math.floor(LQ.hash(x, 4, 5) * 3), '#f3f7fb');
    R(g, 57, 0, 11, 2, '#f3f7fb');
  }
  // hanging sign
  R(g, 33, 33, 14, 12, '#3a2f1c'); R(g, 34, 34, 12, 10, '#f1e3bd');
  g.save(); g.translate(34, 34); (ICONS[b.icon] || ICONS.scroll)(g); g.restore();
  return outline(c);
});

// ---------- props
LQ.prop = (name, season = 'summer', frame = 0) => cached('p|' + name + '|' + season + '|' + frame, () => {
  let c, g; const w = season === 'winter';
  if (name === 'fountain') {
    c = mk(32, 34); g = c.getContext('2d');
    R(g, 2, 16, 28, 16, '#8f8c9c'); R(g, 0, 19, 32, 10, '#8f8c9c'); R(g, 2, 16, 28, 2, '#bab7c6'); R(g, 0, 19, 2, 2, '#bab7c6'); R(g, 30, 19, 2, 2, '#bab7c6');
    R(g, 4, 19, 24, 8, w ? '#cfe9f6' : '#4fa3e8'); R(g, 6, 20 + frame, 6, 1, '#bfe4fb'); R(g, 18, 23 - frame, 6, 1, '#bfe4fb');
    R(g, 0, 28, 32, 3, '#6f6c7c'); R(g, 14, 6, 4, 16, '#a9a6b6'); R(g, 10, 4, 12, 3, '#bab7c6'); R(g, 11, 7, 10, 1, '#6f6c7c');
    if (!w) { R(g, 15, 0 + frame, 2, 4, '#bfe4fb'); R(g, 9, 7, 1, 10 + frame, '#9fd4f8'); R(g, 22, 7, 1, 11 - frame, '#9fd4f8'); } else R(g, 10, 2, 12, 2, '#f3f7fb');
  } else if (name === 'sign') {
    c = mk(16, 18); g = c.getContext('2d');
    R(g, 7, 9, 2, 9, '#6b4428'); R(g, 1, 1, 14, 9, '#8a5a30'); R(g, 2, 2, 12, 7, '#d6aa66'); R(g, 4, 4, 8, 1, '#6b4428'); R(g, 4, 6, 6, 1, '#6b4428');
    if (w) R(g, 1, 0, 14, 2, '#f3f7fb');
  } else if (name === 'chest') {
    c = mk(16, 14); g = c.getContext('2d');
    if (frame) { R(g, 1, 0, 14, 5, '#6d4424'); R(g, 2, 1, 12, 3, '#2a1c12'); R(g, 5, 2, 6, 2, '#f3d24a'); }
    else { R(g, 1, 1, 14, 6, '#a86a32'); R(g, 1, 1, 14, 1, '#c98848'); }
    R(g, 1, 6, 14, 8, '#8a5528'); R(g, 1, 6, 14, 1, '#f3d24a'); R(g, 1, 6, 1, 8, '#f3d24a'); R(g, 14, 6, 1, 8, '#f3d24a'); R(g, 7, 7, 2, 3, '#f3d24a');
  } else if (name === 'coin') {
    c = mk(8, 8); g = c.getContext('2d'); const wd = [6, 4, 2, 4][frame], x = 4 - wd / 2;
    R(g, x, 1, wd, 6, '#f3c531'); R(g, x + (wd > 2 ? 1 : 0), 0, Math.max(1, wd - 2), 8, '#f3c531'); R(g, x, 1, 1, 3, '#fff3b0'); if (wd > 3) R(g, x + wd - 2, 3, 1, 3, '#c9961c');
  } else if (name === 'stall') {
    c = mk(32, 30); g = c.getContext('2d');
    R(g, 2, 8, 2, 22, '#6b4428'); R(g, 28, 8, 2, 22, '#6b4428'); R(g, 1, 18, 30, 12, '#a8713d'); R(g, 1, 18, 30, 2, '#c98f55');
    for (let i = 0; i < 8; i++) R(g, i * 4, 0, 4, 9, i % 2 ? '#f3f0e6' : '#3d9a5a'); R(g, 0, 9, 32, 1, '#2c6e42');
    R(g, 6, 14, 4, 4, '#f3c531'); R(g, 12, 15, 6, 3, '#f6efd9'); R(g, 21, 14, 4, 4, '#f3c531');
    if (w) R(g, 0, 0, 32, 2, '#f3f7fb');
  } else if (name === 'boulders') {
    c = mk(34, 22); g = c.getContext('2d');
    R(g, 1, 6, 15, 15, '#7b7788'); R(g, 3, 4, 11, 3, '#7b7788'); R(g, 3, 5, 6, 3, '#a3a0b0'); R(g, 1, 17, 15, 4, '#575365');
    R(g, 17, 3, 16, 18, '#868294'); R(g, 19, 1, 12, 3, '#868294'); R(g, 20, 3, 7, 4, '#b0adbd'); R(g, 17, 17, 16, 4, '#5f5b6d'); R(g, 9, 11, 2, 5, '#575365'); R(g, 25, 9, 2, 6, '#5f5b6d');
  } else if (name === 'barricade') {
    c = mk(34, 18); g = c.getContext('2d');
    R(g, 2, 2, 3, 16, '#6b4428'); R(g, 29, 2, 3, 16, '#6b4428'); R(g, 15, 3, 3, 15, '#6b4428');
    R(g, 0, 4, 34, 4, '#c98f55'); R(g, 0, 11, 34, 4, '#c98f55'); R(g, 0, 4, 34, 1, '#e3b47c'); R(g, 0, 11, 34, 1, '#e3b47c');
    for (let i = 0; i < 6; i++) { R(g, 2 + i * 6, 4, 3, 4, '#c9423a'); R(g, 5 + i * 6, 11, 3, 4, '#c9423a'); }
  } else if (name === 'lighthouse') {
    c = mk(32, 78); g = c.getContext('2d');
    for (let y = 22; y < 74; y++) { const inset = Math.round((74 - y) / 9), band = Math.floor((y - 22) / 9) % 2; R(g, 4 + inset, y, 24 - inset * 2, 1, band ? '#c9423a' : '#f3f0e6'); R(g, 4 + inset, y, 2, 1, band ? '#a8332c' : '#d6d2c4'); }
    R(g, 2, 72, 28, 6, '#7b7788'); R(g, 2, 72, 28, 1, '#a3a0b0');
    R(g, 8, 20, 16, 3, '#3a3550'); R(g, 10, 10, 12, 10, '#2b2540'); R(g, 12, 12, 8, 7, frame ? '#fff3b0' : '#ffd84a'); R(g, 15, 12, 2, 7, '#2b2540');
    R(g, 9, 7, 14, 3, '#c9423a'); R(g, 12, 4, 8, 3, '#c9423a'); R(g, 15, 0, 2, 4, '#3a3550');
    R(g, 13, 60, 6, 12, '#5b3a22'); R(g, 14, 40, 4, 5, '#2b2540'); R(g, 14, 30, 4, 4, '#2b2540');
  } else if (name === 'boat') {
    c = mk(34, 20); g = c.getContext('2d');
    R(g, 2, 9, 30, 6, '#8a5630'); R(g, 4, 15, 26, 3, '#6f4526'); R(g, 0, 8, 34, 2, '#c98f55'); R(g, 6, 18, 22, 1, '#4f321d');
    R(g, 16, 0, 2, 9, '#6b4428'); R(g, 18, 1, 9, 6, '#f3f0e6'); R(g, 18, 1, 9, 1, '#c9423a'); R(g, 8, 11, 4, 2, '#3b6fd4');
  } else if (name === 'umbrella') {
    c = mk(22, 24); g = c.getContext('2d');
    R(g, 10, 8, 2, 16, '#f3f0e6'); for (let i = 0; i < 5; i++) { R(g, 1 + i * 4, 4 - (i === 2 ? 3 : i === 1 || i === 3 ? 2 : 0), 4, 5 + (i === 2 ? 3 : i === 1 || i === 3 ? 2 : 0), i % 2 ? '#f3f0e6' : '#e0564e'); }
    R(g, 3, 20, 16, 3, '#58a8c8'); R(g, 3, 20, 16, 1, '#8fd0e8');
  } else if (name === 'tide') {
    c = mk(34, 18); g = c.getContext('2d');
    R(g, 0, 2, 34, 16, '#3d8fd6'); R(g, 0, 2, 34, 2, '#bfe6fa');
    for (let i = 0; i < 6; i++) { R(g, (i * 6 + frame * 3) % 30, 7 + (i % 2) * 5, 5, 1, '#bfe6fa'); R(g, (i * 7 + 2 + frame * 2) % 31, 10 + (i % 3) * 2, 3, 1, '#2a6fb8'); }
    R(g, 0, 16, 34, 2, '#bfe6fa');
  } else if (name === 'receipt') {
    c = mk(10, 14); g = c.getContext('2d');
    R(g, 1, 2 + frame, 8, 10, '#fffaf0'); R(g, 1, 11 + frame, 2, 2, '#fffaf0'); R(g, 5, 11 + frame, 2, 2, '#fffaf0');
    R(g, 2, 4 + frame, 6, 1, '#8a7a55'); R(g, 2, 6 + frame, 5, 1, '#8a7a55'); R(g, 2, 8 + frame, 6, 1, '#1f6f5c');
    R(g, frame ? 8 : 0, frame ? 0 : 1, 2, 2, '#ffd84a');
  } else if (name === 'mark') {
    c = mk(4, 9); g = c.getContext('2d'); R(g, 0, 0, 4, 6, '#ffd84a'); R(g, 1, 6, 2, 0, '#ffd84a'); R(g, 0, 7, 4, 2, '#ffd84a'); R(g, 0, 0, 4, 1, '#fff6c2');
  }
  return outline(c);
});

// ---------- the Mythmonger
LQ.bossSprite = (frame, kind = 'baron') => cached('boss|' + kind + frame, () => {
  const c = mk(64, 64), g = c.getContext('2d');
  const blob = (x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
  const f = frame ? 1 : 0;
  if (kind === 'loophole') {
    // Captain Loophole: a sea-green ghost in a tricorn hat, with a hook made of red tape
    blob(20, 52 - f, 9, '#14575a'); blob(44, 53 + f, 9, '#14575a'); blob(32, 55, 11, '#14575a');
    blob(32, 37, 19, '#1f8a86'); blob(19, 40 + f, 11, '#1f8a86'); blob(45, 40 - f, 11, '#1f8a86');
    blob(27, 31, 11, '#3fbdb2'); blob(38, 30, 9, '#3fbdb2'); blob(24, 27, 4, '#8fe6da');
    R(g, 12, 14, 40, 5, '#1b1626'); R(g, 18, 6, 28, 9, '#1b1626'); R(g, 8, 17, 6, 3, '#1b1626'); R(g, 50, 17, 6, 3, '#1b1626');
    R(g, 12, 18, 40, 1, '#e0b23a'); R(g, 29, 8, 6, 5, '#f6efd9'); R(g, 30, 9, 1, 1, '#1b1626'); R(g, 33, 9, 1, 1, '#1b1626'); R(g, 30, 11, 4, 1, '#1b1626');
    R(g, 19, 27, 10, 5, '#fff3b0'); R(g, 35, 26, 10, 6, '#1b1626'); R(g, 33, 24, 14, 1, '#1b1626');
    R(g, 23 + f, 28, 3, 4, '#1b1626');
    R(g, 21, 40, 22, 5, '#1b1626'); for (let i = 0; i < 5; i++) R(g, 22 + i * 4, i % 2 ? 42 : 40, 3, 3, '#f6efd9');
    R(g, 52, 34 - f, 3, 12, '#c9423a'); R(g, 55, 43 - f, 5, 3, '#c9423a'); R(g, 59, 38 - f, 2, 6, '#c9423a');
    return c;
  }
  if (kind === 'slick') {
    // Sidewinder Slick: a dust devil in a wide hat and a red bandana, clutching unreported cash
    blob(20, 52 - f, 9, '#8a4a1c'); blob(44, 53 + f, 9, '#8a4a1c'); blob(32, 55, 11, '#8a4a1c');
    blob(32, 37, 19, '#c9781c'); blob(19, 40 + f, 11, '#c9781c'); blob(45, 40 - f, 11, '#c9781c');
    blob(27, 31, 11, '#e6a04a'); blob(38, 30, 9, '#e6a04a'); blob(24, 27, 4, '#f6d08a');
    R(g, 8, 16, 48, 4, '#4a2f1c'); R(g, 20, 5, 24, 12, '#4a2f1c'); R(g, 20, 13, 24, 2, '#c9423a');
    R(g, 19, 25, 10, 5, '#fff3b0'); R(g, 35, 25, 10, 5, '#fff3b0'); R(g, 23 + f, 26, 3, 4, '#1b1626'); R(g, 39 + f, 26, 3, 4, '#1b1626');
    R(g, 16, 34, 32, 9, '#c9423a'); R(g, 16, 34, 32, 1, '#8a2a26'); R(g, 28, 43, 8, 5, '#c9423a'); R(g, 22, 38, 2, 2, '#f6efd9'); R(g, 38, 38, 2, 2, '#f6efd9');
    R(g, 52, 36 - f, 9, 11, '#7fd6a8'); R(g, 52, 36 - f, 9, 1, '#1f6f5c'); R(g, 54, 40 - f, 5, 1, '#1f6f5c'); R(g, 54, 43 - f, 5, 1, '#1f6f5c');
    return c;
  }
  if (kind === 'glint') {
    // Glint, the Hot-Tip Dragon: gold scales, ivory horns, red wings, green eyes
    blob(18, 50 - f, 10, '#8a6a1c'); blob(46, 51 + f, 10, '#8a6a1c'); blob(32, 54, 12, '#8a6a1c');
    R(g, 1, 22 - f * 2, 12, 4, '#b0332e'); R(g, 0, 26 - f * 2, 9, 9, '#b0332e'); R(g, 51, 22 - f * 2, 12, 4, '#b0332e'); R(g, 55, 26 - f * 2, 9, 9, '#b0332e');
    blob(32, 36, 20, '#d9a520'); blob(18, 38 + f, 12, '#d9a520'); blob(46, 38 - f, 12, '#d9a520');
    blob(26, 30, 12, '#f3c531'); blob(38, 28, 10, '#f3c531'); blob(24, 26, 5, '#fff3b0');
    R(g, 16, 6, 4, 12, '#f6efd9'); R(g, 44, 6, 4, 12, '#f6efd9'); R(g, 18, 3, 3, 4, '#f6efd9'); R(g, 43, 3, 3, 4, '#f6efd9');
    R(g, 19, 26, 10, 5, '#7fd6a8'); R(g, 35, 26, 10, 5, '#7fd6a8'); R(g, 23 + f, 26, 2, 5, '#1b1626'); R(g, 39 + f, 26, 2, 5, '#1b1626');
    R(g, 28, 35, 2, 2, '#1b1626'); R(g, 34, 35, 2, 2, '#1b1626');
    R(g, 21, 40, 22, 5, '#1b1626'); for (let i = 0; i < 5; i++) R(g, 22 + i * 4, i % 2 ? 42 : 40, 3, 3, '#f6efd9');
    return c;
  }
  blob(18, 50 - f, 10, '#4a2374'); blob(46, 51 + f, 10, '#4a2374'); blob(32, 54, 12, '#4a2374');
  blob(32, 36, 20, '#6a35a6'); blob(18, 38 + f, 12, '#6a35a6'); blob(46, 38 - f, 12, '#6a35a6');
  blob(26, 30, 12, '#8650c8'); blob(38, 28, 10, '#8650c8'); blob(24, 26, 5, '#a476e0');
  R(g, 20, 4, 24, 14, '#231a36'); R(g, 14, 17, 36, 3, '#231a36'); R(g, 20, 13, 24, 3, '#e0b23a'); R(g, 30, 7, 4, 2, '#e0b23a'); R(g, 32, 9, 2, 2, '#e0b23a'); R(g, 31, 12, 2, 1, '#e0b23a');
  R(g, 19, 27, 10, 5, '#ffe45c'); R(g, 35, 27, 10, 5, '#ffe45c'); R(g, 19, 27, 10, 1, '#231a36'); R(g, 35, 27, 10, 1, '#231a36');
  R(g, 23 + f, 28, 3, 4, '#231a36'); R(g, 39 + f, 28, 3, 4, '#231a36');
  R(g, 20, 38, 24, 6, '#231a36'); for (let i = 0; i < 6; i++) R(g, 21 + i * 4, i % 2 ? 41 : 38, 3, 3, '#f6efd9');
  return c;
});

// ---------- ground bake
const PATHLIKE = { p: 1, q: 1, b: 1, a: 1, c: 1 };
LQ.bakeGround = (map, season) => {
  const W = map.W, H = map.H, c = mk(W * T, H * T), g = c.getContext('2d'), w = season === 'winter';
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 'g' : map.g[y][x];
  const grassBase = (x, y) => w ? (LQ.hash(x >> 1, y >> 1, 1) > .5 ? '#eef3f8' : '#e6edf5') : (LQ.hash(x >> 1, y >> 1, 1) > .5 ? '#5aaa4c' : '#55a348');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = at(x, y), X = x * T, Y = y * T, h = (i, s) => LQ.hash(x * 31 + i, y * 17 + i, s);
    if (t === 'g' || t === 'f') {
      R(g, X, Y, T, T, grassBase(x, y));
      for (let i = 0; i < 5; i++) R(g, X + Math.floor(h(i, 2) * 15), Y + Math.floor(h(i, 3) * 14), 1, 2, w ? '#cfdcea' : '#3f8f3e');
      for (let i = 0; i < 3; i++) R(g, X + Math.floor(h(i, 4) * 15), Y + Math.floor(h(i, 5) * 15), 1, 1, w ? '#ffffff' : '#7fca64');
      if (t === 'f' && !w) for (let i = 0; i < 3; i++) {
        const fx = X + 1 + Math.floor(h(i, 6) * 12), fy = Y + 1 + Math.floor(h(i, 7) * 12), col = ['#ff6b6b', '#ffd93d', '#ffffff', '#c98bff'][Math.floor(h(i, 8) * 4)];
        R(g, fx, fy, 3, 3, col); R(g, fx + 1, fy + 1, 1, 1, '#f08a24'); R(g, fx + 1, fy + 3, 1, 2, '#2f7d36');
      }
    } else if (t === 'p') {
      R(g, X, Y, T, T, w ? '#cdbb94' : '#d8b877');
      for (let i = 0; i < 6; i++) R(g, X + Math.floor(h(i, 2) * 14), Y + Math.floor(h(i, 3) * 14), 2, 1, w ? '#b9a67e' : '#c4a364');
      for (let i = 0; i < 3; i++) R(g, X + Math.floor(h(i, 4) * 14), Y + Math.floor(h(i, 5) * 14), 2, 2, w ? '#e3d6b5' : '#e8cf96');
      const edge = w ? '#f3f7fb' : '#4c9a42', dark = w ? '#b3a27c' : '#b8975a';
      if (!PATHLIKE[at(x, y - 1)]) { R(g, X, Y, T, 2, dark); for (let i = 0; i < T; i++) if (h(i, 9) > .45) R(g, X + i, Y, 1, 1 + (h(i, 10) > .7 ? 1 : 0), edge); }
      if (!PATHLIKE[at(x, y + 1)]) { R(g, X, Y + 14, T, 2, dark); for (let i = 0; i < T; i++) if (h(i, 11) > .45) R(g, X + i, Y + 15 - (h(i, 12) > .7 ? 1 : 0), 1, 2, edge); }
      if (!PATHLIKE[at(x - 1, y)]) { R(g, X, Y, 2, T, dark); for (let i = 0; i < T; i++) if (h(i, 13) > .45) R(g, X, Y + i, 1 + (h(i, 14) > .7 ? 1 : 0), 1, edge); }
      if (!PATHLIKE[at(x + 1, y)]) { R(g, X + 14, Y, 2, T, dark); for (let i = 0; i < T; i++) if (h(i, 15) > .45) R(g, X + 15 - (h(i, 16) > .7 ? 1 : 0), Y + i, 2, 1, edge); }
    } else if (t === 'a') {
      R(g, X, Y, T, T, LQ.hash(x >> 1, y >> 1, 1) > .5 ? '#ecd9a0' : '#e8d498');
      for (let i = 0; i < 6; i++) R(g, X + Math.floor(h(i, 2) * 15), Y + Math.floor(h(i, 3) * 15), 1, 1, '#d2bb7c');
      for (let i = 0; i < 3; i++) R(g, X + Math.floor(h(i, 4) * 14), Y + Math.floor(h(i, 5) * 15), 2, 1, '#f6e9bd');
      if (h(0, 6) > .9) { const sx = X + 3 + Math.floor(h(1, 6) * 9), sy = Y + 3 + Math.floor(h(2, 6) * 9); R(g, sx, sy, 3, 2, '#f3f0e6'); R(g, sx + 1, sy - 1, 1, 1, '#e8a0a0'); }
      const grass = c2 => c2 === 'g' || c2 === 'f';
      if (grass(at(x, y - 1))) for (let i = 0; i < T; i++) R(g, X + i, Y, 1, 1 + Math.floor(h(i, 7) * 3), '#55a348');
      if (grass(at(x - 1, y))) for (let i = 0; i < T; i++) R(g, X, Y + i, 1 + Math.floor(h(i, 8) * 2), 1, '#55a348');
      if (grass(at(x + 1, y))) for (let i = 0; i < T; i++) R(g, X + 15 - Math.floor(h(i, 9) * 2), Y + i, 2, 1, '#55a348');
      if (at(x, y + 1) === 'w') R(g, X, Y + 12, T, 4, '#d9c388');
    } else if (t === 'q') {
      R(g, X, Y, T, T, '#b9b4a8');
      for (let by = 0; by < 2; by++) for (let bx = 0; bx < 2; bx++) {
        const ox = X + bx * 8 + (by ? 4 : 0), oy = Y + by * 8;
        if (h(bx + by * 2, 2) > .6) R(g, ox, oy, 8, 8, '#c6c1b5'); else if (h(bx + by * 2, 3) > .75) R(g, ox, oy, 8, 8, '#aca79b');
      }
      R(g, X, Y, T, 1, '#98938a'); R(g, X, Y + 8, T, 1, '#98938a'); R(g, X, Y, 1, 8, '#98938a'); R(g, X + 8, Y, 1, 8, '#98938a'); R(g, X + 4, Y + 8, 1, 8, '#98938a'); R(g, X + 12, Y + 8, 1, 8, '#98938a');
      if (w) for (let i = 0; i < 4; i++) R(g, X + Math.floor(h(i, 5) * 13), Y + Math.floor(h(i, 6) * 14), 3, 2, '#f3f7fb');
    } else if (t === 'w') {
      R(g, X, Y, T, T, w ? '#b5dcef' : '#3d8fd6');
      for (let i = 0; i < 4; i++) R(g, X + Math.floor(h(i, 2) * 11), Y + Math.floor(h(i, 3) * 15), 5, 1, w ? '#e4f3fb' : '#3583ca');
      const land = c2 => c2 !== 'w' && c2 !== 'b';
      if (land(at(x, y - 1))) { R(g, X, Y, T, 3, w ? '#8fbfd8' : '#2a5f9e'); R(g, X, Y + 3, T, 1, w ? '#e4f3fb' : '#8ecbf2'); }
      if (land(at(x, y + 1))) { R(g, X, Y + 14, T, 2, w ? '#f3f7fb' : '#bfe6fa'); }
      if (land(at(x - 1, y))) R(g, X, Y, 2, T, w ? '#f3f7fb' : '#bfe6fa');
      if (land(at(x + 1, y))) R(g, X + 14, Y, 2, T, w ? '#f3f7fb' : '#bfe6fa');
    } else if (t === 'b') {
      R(g, X, Y, T, T, '#b07a45');
      for (let i = 3; i < T; i += 4) R(g, X, Y + i, T, 1, '#8a5c31');
      for (let i = 0; i < 3; i++) R(g, X + 3 + Math.floor(h(i, 2) * 10), Y + Math.floor(h(i, 3) * 14), 1, 2, '#c99560');
      if (at(x - 1, y) === 'w') { R(g, X, Y, 3, T, '#6b4428'); R(g, X, Y, 1, T, '#8a5c31'); }
      if (at(x + 1, y) === 'w') { R(g, X + 13, Y, 3, T, '#6b4428'); R(g, X + 15, Y, 1, T, '#4f321d'); }
      if (w) for (let i = 0; i < 3; i++) R(g, X + 4 + Math.floor(h(i, 5) * 8), Y + Math.floor(h(i, 6) * 14), 3, 1, '#f3f7fb');
    } else if (t === 'r' || t === 's') {
      const snow = t === 's';
      R(g, X, Y, T, T, snow ? '#f1f5fa' : '#928f9f');
      for (let i = 0; i < 3; i++) R(g, X + Math.floor(h(i, 2) * 12), Y + Math.floor(h(i, 3) * 13), 3, 2, snow ? '#dbe5ef' : '#a5a2b2');
      for (let i = 0; i < 2; i++) R(g, X + Math.floor(h(i, 4) * 14), Y + Math.floor(h(i, 5) * 12), 1, 3, snow ? '#c8d5e2' : '#757281');
    } else if (t === 'c') {
      // red canyon wall, with bands of lighter and darker rock
      R(g, X, Y, T, T, '#a8523a');
      R(g, X, Y + 4, T, 2, '#bd6a48'); R(g, X, Y + 10, T, 1, '#8a3f2c');
      for (let i = 0; i < 4; i++) R(g, X + Math.floor(h(i, 2) * 13), Y + Math.floor(h(i, 3) * 14), 3, 1, '#c97e58');
      for (let i = 0; i < 3; i++) R(g, X + Math.floor(h(i, 4) * 15), Y + Math.floor(h(i, 5) * 12), 1, 3, '#7a3626');
      if (at(x, y - 1) !== 'c') { R(g, X, Y, T, 3, '#d99a6c'); R(g, X, Y + 3, T, 1, '#7a3626'); }
      if (at(x, y + 1) !== 'c') R(g, X, Y + 11, T, 5, '#6b2e20');
    } else if (t === '#') {
      R(g, X, Y, T, T, '#625e73');
      for (let i = 0; i < 5; i++) R(g, X + Math.floor(h(i, 2) * 15), Y, 1, T, '#555166');
      for (let i = 0; i < 3; i++) R(g, X + Math.floor(h(i, 3) * 13), Y + Math.floor(h(i, 4) * 12), 3, 2, '#716d83');
      if (at(x, y - 1) !== '#') { R(g, X, Y, T, 3, y < 7 ? '#f1f5fa' : '#8f8ba1'); R(g, X, Y + 3, T, 1, '#4a465a'); }
      if (at(x, y + 1) !== '#') R(g, X, Y + 11, T, 5, '#454156');
      if (y < 6) for (let i = 0; i < 4; i++) R(g, X + Math.floor(h(i, 6) * 13), Y + Math.floor(h(i, 7) * 6), 3, 2, '#f1f5fa');
    }
  }
  return c;
};
})();
