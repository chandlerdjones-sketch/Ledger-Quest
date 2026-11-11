// Lighting, glow, and ambient effects for the neon night look.
// Everything here draws on the 320x180 pixel buffer, so it stays crisp when scaled up.
(() => {
const LQ = window.LQ, mk = LQ.mk;
const rgb = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const BAYER = [0, .5, .75, .25];

// A round, stepped, dithered glow. Drawn additively, so overlapping lights build up.
const glows = {};
LQ.glow = (col, r) => {
  const k = col + '|' + r; if (glows[k]) return glows[k];
  const c = mk(r * 2, r * 2), g = c.getContext('2d'), d = g.createImageData(r * 2, r * 2), p = d.data, [cr, cg, cb] = rgb(col);
  for (let y = 0; y < r * 2; y++) for (let x = 0; x < r * 2; x++) {
    const dist = Math.hypot(x - r + .5, y - r + .5) / r + (BAYER[(x & 1) + (y & 1) * 2] - .375) * .14;
    const a = dist < .2 ? .4 : dist < .42 ? .25 : dist < .68 ? .13 : dist < 1 ? .055 : 0;
    const i = (y * r * 2 + x) * 4; p[i] = cr; p[i + 1] = cg; p[i + 2] = cb; p[i + 3] = a * 255;
  }
  g.putImageData(d, 0, 0); return glows[k] = c;
};

// Dark, dithered corners.
let vig = null;
function vignette() {
  if (vig) return vig;
  const W = LQ.BW, H = LQ.BH; vig = mk(W, H);
  const g = vig.getContext('2d'), d = g.createImageData(W, H), p = d.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - W / 2) / (W / 2), dy = (y - H / 2) / (H / 2), dist = Math.sqrt(dx * dx + dy * dy * .9);
    const raw = (dist - .7) * 1.25 + (BAYER[(x & 1) + (y & 1) * 2] - .375) * .1;
    const a = Math.max(0, Math.min(.6, Math.floor(raw / .1) * .1));
    const i = (y * W + x) * 4; p[i] = 5; p[i + 1] = 4; p[i + 2] = 20; p[i + 3] = a * 255;
  }
  g.putImageData(d, 0, 0); return vig;
}

// Each region keeps the same dark base and gets its own accent colors.
const THEMES = {
  village: { motes: ['#35f0e6', '#9b6bff', '#ffcf4a'], fog: '110,90,230' },
  coast: { motes: ['#35f0e6', '#ff4fb0', '#8ff4ff'], fog: '50,140,220' },
  canyon: { motes: ['#ff4fb0', '#ffcf4a', '#ff8a3a'], fog: '220,70,150' },
  summit: { motes: ['#c9a8ff', '#8ff4ff', '#ffffff'], fog: '150,130,255' },
};
const wrap = (v, n) => ((v % n) + n) % n;
const lights = [];

LQ.fx = {
  // While open, any sprite drawn that carries a .lights list adds its lights to this frame.
  begin(g) {
    lights.length = 0;
    const di = g.drawImage;
    g.drawImage = function (img, x, y, w) {
      di.apply(g, arguments);
      const L = img.lights; if (!L) return;
      const s = w ? w / img.width : 1;
      for (const l of L) lights.push(x + l.x * s, y + l.y * s, l.r, l.col, l.a);
    };
  },
  end(g) { delete g.drawImage; },
  vignette(g) { g.drawImage(vignette(), 0, 0); },
  light(x, y, r, col, a = .5) { lights.push(x, y, r, col, a); },
  flush(g, tm) {
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < lights.length; i += 5) {
      const r = lights[i + 2];
      g.globalAlpha = lights[i + 4] * (.9 + .1 * Math.sin(tm * 2.2 + i));
      g.drawImage(LQ.glow(lights[i + 3], r), Math.round(lights[i] - r), Math.round(lights[i + 1] - r));
    }
    lights.length = 0; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  },
  // Drifting fog, floating motes, and the vignette. cx and cy are the camera, for parallax.
  ambient(g, id, cx, cy, tm) {
    const th = THEMES[id] || THEMES.village;
    g.fillStyle = `rgba(${th.fog},.05)`;
    for (let i = 0; i < 5; i++) {
      const fx = Math.floor(wrap(LQ.hash(i, 3, 50) * 460 + tm * (3 + i) - cx * .3, 460)) - 100, fy = Math.floor(wrap(LQ.hash(i, 4, 50) * 240 - cy * .3, 240)) - 30;
      g.fillRect(fx, fy, 96, 10); g.fillRect(fx + 14, fy - 4, 60, 18);
    }
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 30; i++) {
      const sp = 3 + (i % 5) * 1.5;
      const x = Math.floor(wrap(LQ.hash(i, 1, 60) * 360 + Math.sin(tm * .5 + i) * 10 + tm * sp * (i % 2 ? 1 : -1) - cx * .6, 360)) - 20;
      const y = Math.floor(wrap(LQ.hash(i, 2, 60) * 220 - tm * (2 + i % 4) - cy * .6, 220)) - 20;
      const a = .3 + .7 * Math.abs(Math.sin(tm * (.6 + (i % 7) * .13) + i * 2.1));
      g.fillStyle = th.motes[i % th.motes.length];
      g.globalAlpha = a; g.fillRect(x, y, 1, 1);
      g.globalAlpha = a * .22; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.drawImage(vignette(), 0, 0);
  },
  // A dark sky with stars and a low neon haze, shared by the title and battle backdrops.
  stars(g, tm, n = 60, maxY = 90) {
    for (let i = 0; i < n; i++) {
      g.fillStyle = LQ.NEON[i % 7 === 0 ? 1 : i % 5 === 0 ? 0 : 2]; g.globalAlpha = .25 + .6 * Math.abs(Math.sin(tm * .7 + i * 1.7));
      g.fillRect(Math.floor(LQ.hash(i, 1, 70) * LQ.BW), Math.floor(LQ.hash(i, 2, 70) * maxY), 1, 1);
    }
    g.globalAlpha = 1;
  },
};
})();
