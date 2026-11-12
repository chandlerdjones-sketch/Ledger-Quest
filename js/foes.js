// Foes. Myth Wisps are avoided, never fought. Scrap Imps are fought with the Truth Stamp.
(() => {
const LQ = window.LQ, T = 16, ui = LQ.ui;
const sfx = n => LQ.audio.sfx(n);
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
let toldWisp = false;

// Steps-to-the-hero for every walkable tile nearby, refreshed a few times a second and shared by all imps.
let fieldAt = -1, fieldMap = new Map(), fieldFor = null;
const field = w => {
  if (fieldFor === w.map && LQ.time - fieldAt < .2) return fieldMap;
  fieldAt = LQ.time; fieldFor = w.map;
  const p = w.p, sx = Math.floor(p.x / T), sy = Math.floor((p.y - 3) / T), m = fieldMap = new Map([[sx + ',' + sy, 0]]), q = [[sx, sy, 0]];
  for (let i = 0; i < q.length; i++) {
    const [x, y, d] = q[i]; if (d >= 14) continue;
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + ox) + ',' + (y + oy); if (m.has(k) || w.isSolid(x + ox, y + oy)) continue; m.set(k, d + 1); q.push([x + ox, y + oy, d + 1]); }
  }
  return m;
};

LQ.foes = {
  // Drifts back and forth between two points (in pixels). Touching it costs coins. Lantern light drives it off.
  wisp(w, ax, ay, bx, by, speed = 24) {
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const e = { type: 'wisp', foe: true, x: ax, y: ay, k: 0, dirn: 1, cd: 0, tx: Math.floor(ax / T), base: ay + 8, glowR: 16,
      hit() { if (!toldWisp) { toldWisp = true; ui.toast('The stamp passes right through. Myth Wisps cannot be struck, only avoided.'); } },
      step(dt) {
        const p = w.p, lit = LQ.kit.holding('lantern'), dP = Math.hypot(p.x - e.x, p.y - 8 - e.y);
        let sp = speed;
        if (lit && dP < 46) { e.dirn = Math.hypot(p.x - ax, p.y - 8 - ay) > Math.hypot(p.x - bx, p.y - 8 - by) ? -1 : 1; sp = speed * 2.2; }
        e.k += e.dirn * sp * dt / len;
        if (e.k >= 1) { e.k = 1; e.dirn = -1; } else if (e.k <= 0) { e.k = 0; e.dirn = 1; }
        e.x = ax + (bx - ax) * e.k; e.y = ay + (by - ay) * e.k + Math.sin(LQ.time * 3 + ax) * 2;
        e.tx = Math.floor(e.x / T); e.base = e.y + 8; e.cd -= dt; e.shy = lit && dP < 46;
        if (dP < 10 && e.cd <= 0 && !lit && LQ.kit.inv <= 0) {
          const s = LQ.state, cost = Math.min(12, s.coins);
          s.coins -= cost; e.cd = 1.5; LQ.kit.inv = 1; LQ.kit.knock(w, e.x, e.y, 14); sfx('wrong'); LQ.shake(.15); w.burst(e.x, e.y, '#ff4fb0', 12, 45);
          ui.toast(cost ? 'A Myth Wisp sold you a bad idea. -' + cost + ' coins' : 'A Myth Wisp whispers nonsense. Your purse is already empty.'); LQ.save();
        }
      },
      draw(g, cx, cy, tm) {
        const x = e.x - cx, y = e.y - cy, f = Math.floor(tm * 8 + ax) % 3;
        g.globalAlpha = e.shy ? .45 : 1;
        R(g, x - 3, y - 3, 6, 7, '#ff4fb0'); R(g, x - 2, y - 5 - f, 4, 3, '#ff4fb0'); R(g, x - 1, y - 7 - f, 2, 2, '#ff9bd0'); R(g, x - 1, y - 1, 2, 3, '#ffffff');
        R(g, x - 4, y + 1, 1, 2, '#9b6bff'); R(g, x + 3, y, 1, 2, '#9b6bff');
        g.globalAlpha = 1; LQ.fx.light(x, y, 18, '#ff4fb0', e.shy ? .25 : .55);
      } };
    w.ents.push(e); return e;
  },
  // A crumpled-paper pest that takes two Stamp hits. Named rewards are paid once per save.
  imp(w, tx, ty, rewardKey, onDown) {
    const e = { type: 'imp', foe: true, x: tx * T + 8, y: ty * T + 8, hp: 2, stun: 0, vx: 0, vy: 0, tx, base: ty * T + 14, glowR: 10,
      fits: (x, y) => ![[-4, -3], [4, -3], [-4, 4], [4, 4]].some(([ox, oy]) => w.isSolid(Math.floor((x + ox) / T), Math.floor((y + oy) / T))),
      move(mx, my) { if (e.fits(e.x + mx, e.y)) e.x += mx; if (e.fits(e.x, e.y + my)) e.y += my; e.tx = Math.floor(e.x / T); e.base = e.y + 6; },
      hit(w2, d) {
        e.hp--; e.stun = .28; e.vx = d[0] * 110; e.vy = d[1] * 110; sfx('hit'); w.burst(e.x, e.y, '#fdf8e7', 8, 40);
        if (e.hp > 0) return;
        w.remove(e); w.burst(e.x, e.y, '#ffcf4a', 16, 55);
        const s = LQ.state;
        if (rewardKey && !s.flags[rewardKey]) {
          s.flags[rewardKey] = true; s.coins += 5; sfx('coin'); LQ.save();
        }
        if (onDown) onDown(e);
      },
      step(dt) {
        const p = w.p, dx = p.x - e.x, dy = p.y - 6 - e.y, d = Math.hypot(dx, dy);
        if (e.stun > 0) { e.stun -= dt; e.move(e.vx * dt, e.vy * dt); return; }
        // follow the shortest walkable route to the hero, so walls and doorways do not trap it
        const F = field(w), ex = Math.floor(e.x / T), ey = Math.floor(e.y / T), here = F.get(ex + ',' + ey);
        let gx = p.x, gy = p.y - 6;
        if (here == null || here > 12) return;
        if (here > 1) { let best = here; for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const v = F.get((ex + ox) + ',' + (ey + oy)); if (v != null && v < best) { best = v; gx = (ex + ox) * T + 8; gy = (ey + oy) * T + 8; } } }
        const tx2 = gx - e.x, ty2 = gy - e.y, td = Math.hypot(tx2, ty2);
        if (td > 1) e.move(tx2 / td * 36 * dt, ty2 / td * 36 * dt);
        if (d < 10) LQ.kit.hurt(1, w, e.x, e.y);
      },
      draw(g, cx, cy, tm) {
        const x = e.x - cx, y = e.y - cy, f = Math.floor(tm * 7 + tx) % 2, white = e.stun > 0;
        w.shadow(g, x, y + 7, 9);
        R(g, x - 4, y - 4, 9, 8, white ? '#ffffff' : '#d8d2ee'); R(g, x - 5, y - 2, 1, 4, '#8a84b0'); R(g, x + 5, y - 3, 1, 4, '#8a84b0'); R(g, x - 3, y - 5, 3, 1, '#d8d2ee'); R(g, x + 2, y - 6, 2, 2, '#d8d2ee');
        R(g, x - 3, y - 2, 2, 2, '#ff4fb0'); R(g, x + 1, y - 2, 2, 2, '#ff4fb0'); R(g, x - 2, y + 2, 5, 1, '#8a84b0');
        R(g, x - 3, y + 4, 2, 2 + f, '#8a84b0'); R(g, x + 1, y + 4, 2, 3 - f, '#8a84b0');
        LQ.fx.light(x, y - 1, 9, '#ff4fb0', .35);
      } };
    w.ents.push(e); return e;
  },
};
})();
