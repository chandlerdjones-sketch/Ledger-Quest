const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = process.argv[2] || path.resolve(__dirname, '..');
const career = process.argv[3] || 'nurse';
assert(['nurse', 'owner', 'food'].includes(career), 'Expected nurse, owner, or food');
const noop = () => {};
// Run the scripts from index.html with deterministic input, storage, and frame timing.
// The canvas stub exercises draw paths and sizing. It cannot verify browser pixels or audio.
const errors = [], spoken = [];
let voiceCancels = 0;
const saved = new Map();
const listeners = {};
let nextFrame, now = 0;
const context2d = () => new Proxy({
  font: '16px monospace',
  measureText(text) { return { width: String(text).length * parseFloat(this.font) * .60 }; },
  createImageData(w, h) { return { data: new Uint8ClampedArray(w * h * 4) }; },
  getImageData(x, y, w, h) { return this.createImageData(w, h); },
  createLinearGradient() { return { addColorStop: noop }; },
  createRadialGradient() { return { addColorStop: noop }; },
}, { get: (obj, name) => obj[name] ?? noop });
const canvas = () => ({ style: {}, getContext: () => context2d() });
const c = canvas();
const env = vm.createContext({
  console: { error: e => errors.push(e), log: console.log }, performance: { now: () => now },
  requestAnimationFrame: cb => { nextFrame = cb; }, setTimeout: noop,
  innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  addEventListener: (type, fn) => { (listeners[type] ??= []).push(fn); },
  localStorage: { getItem: k => saved.get(k) ?? null, setItem: (k, v) => saved.set(k, v), removeItem: k => saved.delete(k) },
  speechSynthesis: { speak: utterance => spoken.push(utterance.text), cancel: () => voiceCancels++ },
  SpeechSynthesisUtterance: function (text) { this.text = text; },
  document: { getElementById: () => c, createElement: canvas, fonts: { load: async () => {} } },
});
env.window = env;
for (const [, path] of fs.readFileSync(root + '/index.html', 'utf8').matchAll(/<script src="([^"]+)"/g)) {
  vm.runInContext(fs.readFileSync(root + '/' + path, 'utf8'), env, { filename: path });
}
const LQ = env.LQ;
const ui = LQ.ui;
const emit = (type, event = {}) => (listeners[type] || []).forEach(fn => fn(event));
async function frame(count = 1) {
  for (let i = 0; i < count; i++) {
    assert(nextFrame, 'animation frame scheduled');
    nextFrame(now += 50);
    for (let j = 0; j < 8; j++) await Promise.resolve();
    if (errors.length) throw errors[0];
  }
}
const dispatch = (type, key) => emit(type, { key, preventDefault: noop, repeat: false });
async function press(key) { dispatch('keydown', key); await frame(); dispatch('keyup', key); }
const shieldFallback = new WeakSet(), seenMoves = new Set();
let chapterOneHit = false;
// The hands-on activities. Each phase is first handed in wrong, to prove the explanation and the retry, then played right.
const tried = new Set(), recovered = [];
async function playDoc(d) {
  const first = !tried.has(d.phase + (d.title || 'hold')); tried.add(d.phase + (d.title || 'hold'));
  if (first) recovered.push(d.phase);
  if (d.phase === 'sort') {
    for (let i = 0; i < d.rows.length; i++) {
      const r = d.rows[i], want = first && i === 0 ? (r.want + 1) % 3 : r.want;
      while (d.cur !== i) await press('ArrowDown');
      while (r.col !== want) await press(r.col < want ? 'ArrowRight' : 'ArrowLeft');
    }
    while (d.cur !== d.rows.length) await press('ArrowDown');
    await press('Enter');
    if (first && d.rows.length) assert.equal(d.bad, 0, 'a wrong row is marked for another try');
  } else if (d.phase === 'pick') {
    const item = LQ.fin2().better === 'item';
    await press(first === item ? 'ArrowUp' : 'ArrowDown'); await press('Enter');
  } else if (d.phase === 'dial') {
    if (!first) while (d.jar < LQ.fin3().gigBill) await press('ArrowRight');
    await press('Enter');
  } else if (d.phase === 'day') {
    if (!first) while (d.day !== 2) await press('ArrowRight');
    await press('Enter');
  } else if (d.phase === 'drop') {
    if (!first) while (d.H.keepWait(d.k) >= d.H.keepNow) await press('ArrowLeft');
    await press('Enter');
  } else await frame();
}
async function drain(select, end = () => !LQ.busy && !LQ.title.locked, limit = 2500) {
  for (let i = 0; i < limit; i++) {
    if (ui.dlg || ui.okWait) await press('Enter');
    else if (ui.choice) {
      const index = select(ui.choice);
      if (index == null) throw new Error('Unanswered: ' + ui.choice.prompt + '\n' + ui.choice.options.join(' | '));
      while (ui.choice.sel !== index) await press('ArrowDown');
      await press('Enter');
    } else if (LQ.battle && LQ.battle.dodge) {
      // The boss movement phase: walk straight to the truth shard.
      const d = LQ.battle.dodge, at = LQ.battle.pos, k = LQ.input.down;
      seenMoves.add(d.kind); assert(LQ.kit.hp() > 0 || d.hits > 0, 'hearts never sit at zero outside a hit');
      if (LQ.battle.bossHP === LQ.battle.maxHP && d.kind === 'bolts') shieldFallback.add(d);
      const idle = shieldFallback.has(d);
      const takeHit = !idle && d.kind === 'bolts' && !chapterOneHit;
      const still = idle || takeHit;
      const hp = LQ.kit.hp(), hits = d.hits;
      k.right = !still && at.x < d.sx - 3; k.left = !still && at.x > d.sx + 3;
      k.down = !still && at.y < d.sy - 3; k.up = !still && at.y > d.sy + 3;
      k.use = !!idle;
      await frame();
      if (takeHit && d.hits > hits) {
        assert.equal(hp - LQ.kit.hp(), .25, 'a Chapter 1 bolt costs exactly one quarter heart');
        chapterOneHit = true;
      }
      if (!LQ.battle.dodge) {
        if (idle) { assert(d.elapsed >= 6); assert.equal(d.hits, 0); }
        k.right = k.left = k.down = k.up = k.use = false;
      }
    } else if (ui.doc && ui.doc.play && ui.doc.wait) await playDoc(ui.doc);
    else if (end()) return;
    else if (LQ.scene !== LQ.world && LQ.scene !== LQ.title && !LQ.scene.cfg && LQ.scene.update) await press('Enter');
    else await frame();
  }
  throw Error(`Timed out in ${LQ.state.region} at ${LQ.curQuest()?.short}. busy=${LQ.busy} dlg=${!!ui.dlg} choice=${ui.choice?.prompt} doc=${!!ui.doc} fade=${LQ.fadeA} scene=${LQ.scene === LQ.world ? "world" : LQ.scene === LQ.title ? "title" : "other"}`);
}
const untilIdle = () => !LQ.busy && !ui.dlg && !ui.choice && !ui.okWait && LQ.fadeA === 0;
async function boot() {
  for (let i = 0; i < 15; i++) await Promise.resolve();
  await frame(20);
  assert.equal(LQ.scene, LQ.title);
}
function near(entity) {
  const w = LQ.world;
  for (const [dx, dy, dir] of [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']]) {
    const x = (entity.tx + dx) * 16 + 8, y = (entity.ty + dy) * 16 + 13;
    if (w.canStand(x, y)) { Object.assign(w.p, { x, y, dir }); return; }
  }
  throw Error('No adjacent floor for ' + entity.type + ' ' + entity.tx + ',' + entity.ty);
}
async function talk(find, choose = () => 0) {
  const e = LQ.world.ents.find(find);
  assert(e, 'interaction exists'); near(e); await press('Enter');
  await drain(choose, untilIdle);
  await frame(12); await drain(choose, untilIdle);   // a Ledger Page found at a milestone speaks up once the hero stands still
}
(async () => {
  await boot();
  for (const [width, height, dpr] of [[1280, 720, 1], [1024, 768, 2], [390, 844, 3]]) {
    Object.assign(env, { innerWidth: width, innerHeight: height, devicePixelRatio: dpr }); emit('resize');
    await frame(); assert(parseFloat(c.style.width) <= width && parseFloat(c.style.height) <= height);
    assert(Math.abs(c.width / c.height - 16 / 9) < .01);
  }
  await press('Enter');
  await drain(ch => 0, () => LQ.scene === LQ.world && untilIdle());
  assert.equal(LQ.world.room.room, 'cottage1');
  await press('j'); assert(ui.menu); for (let i = 0; i < 5; i++) await press('ArrowRight');
  await press('Escape'); assert(!ui.menu);
  const letter = LQ.world.ents.find(e => e.type === 'table');
  near(letter); await press('Enter');
  for (let i = 0; i < 500 && LQ.intro.stage() < 2; i++) {
    if (ui.dlg) await press('Enter');
    else if (LQ.scene !== LQ.world && LQ.fadeA === 0) {
      for (let card = 0; card < ['nurse', 'owner', 'food'].indexOf(career); card++) await press('ArrowRight');
      await press('Enter');
    } else await frame();
  }
  assert.equal(LQ.state.career, career); assert.equal(LQ.intro.stage(), 2);
  const w = LQ.world;
  near(w.ents.find(e => e.type === 'block'));
  const key = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[w.p.dir];
  dispatch('keydown', key); await frame(11); dispatch('keyup', key);
  await drain(() => 0, untilIdle);
  assert.equal(w.room.room, 'cellar1');
  await talk(e => e.type === 'lamp'); await talk(e => e.type === 'pedestal');
  near(w.ents.find(e => e.type === 'seal')); await press('e');
  assert.equal(LQ.state.flags.cellarGate, true);
  for (let i = 0; i < 2; i++) {
    await frame(8);
    const imp = w.ents.find(e => e.type === 'imp'); assert(imp);
    Object.assign(w.p, { x: imp.x, y: imp.y + 19, dir: 'up' });
    await press('e');
  }
  const purse = w.ents.find(e => e.type === 'purse'); assert(purse);
  Object.assign(w.p, { x: purse.tx * 16 + 8, y: purse.ty * 16 + 12 });
  await frame(); await drain(() => 0, untilIdle); assert.equal(LQ.intro.stage(), 4);
  await talk(e => e.type === 'greatdoor');
  w.p.y = 12 * 16 + 12; w.p.x = 6 * 16 + 8;
  await frame(); await drain(() => 0, untilIdle); assert.equal(LQ.intro.stage(), 9);
  Object.assign(w.p, { x: 6 * 16 + 8, y: 13 * 16 + 12, dir: 'down' });
  dispatch('keydown', 'ArrowDown'); await frame(4); dispatch('keyup', 'ArrowDown'); await drain(() => 0, untilIdle);
  assert.equal(w.room.room, 'cottage1');
  Object.assign(w.p, { x: 9 * 16 + 8, y: 9 * 16 + 12, dir: 'down' });
  dispatch('keydown', 'ArrowDown'); await frame(4); dispatch('keyup', 'ArrowDown'); await drain(() => 0, untilIdle);
  assert.equal(w.room, null);
  await talk(e => e.npc?.id === 'mayor');
  assert.equal(LQ.state.quest, 1);
  assert.equal(LQ.loadSlot(1).quest, 1);
  assert(LQ.importText(LQ.exportText(1), 2));
  assert.equal(LQ.loadSlot(2).career, career);
  assert.equal(LQ.importText('{broken', 2), false);
  const damaged = { ...LQ.loadSlot(1), news: { pct: 'broken', text: 'Headline' } };
  assert.equal(LQ.importText(JSON.stringify(damaged), 2), false);
  assert.equal(LQ.loadSlot(2).career, career);
  LQ.setScene(LQ.title); await press('Enter'); await drain(() => 0, () => LQ.scene === w && untilIdle());
  assert.equal(LQ.state.quest, 1);
  console.log('Title, new game, tutorial, cottage, cellar, combat, quest 1, six menu tabs, three viewports, backup round-trip and Continue passed');
  const s = () => LQ.state;
  const gear = id => LQ.GEAR.find(g => g.id === id);
  const shop = actions => talk(e => e.npc?.id === (s().region === 'village' ? 'merchant' : 'trader'), ch => {
    const action = actions.shift();
    const index = ch.options.findIndex(o => action instanceof RegExp ? action.test(o) : action === o);
    assert(index >= 0, `Shop option ${action} missing from ${ch.options}`);
    return index;
  });
  s().coins = 0;
  await shop([/^Receipt Ledger/, 'Leave']);
  assert.equal(s().coins, 0); assert(!LQ.has('ledger'));
  s().coins = 100;
  await shop([/^Max-Out Mantle/, /^Receipt Ledger/, 'Back', /^Receipt Ledger/, 'Buy Receipt Ledger', /^\[owned\] Receipt Ledger/, 'Leave']);
  assert.equal(s().coins, 100 - gear('ledger').price);
  assert.equal(s().gear.filter(g => g === 'ledger').length, 1);
  assert(LQ.loadSlot(1).gear.includes('ledger'));
  s().coins = 50;
  await shop([/^Tonic/, /^Rent a lantern/, /^Buy a rumor/, /^Hear the rumor/, 'Leave']);
  assert.equal(s().coins, 5); assert.equal(s().flags.tonics, 1); assert(s().flags.lanternRent);
  s().tool = 'tonic'; await press('e'); assert.equal(s().flags.tonics, 1);
  s().hp = 1; await frame(12); await press('e'); assert.equal(s().flags.tonics, 0); assert.equal(s().hp, 3);
  const broker = actions => talk(e => ['broker', 'quay'].includes(e.npc?.id), ch => {
    const option = actions.shift();
    const index = ch.options.findIndex(o => option instanceof RegExp ? option.test(o) : o === option);
    assert(index >= 0, `Broker option ${option} missing from ${ch.options}`); return index;
  });
  s().coins = LQ.price('CRUM');
  const brokerActions = [/^CRUM/, 'Buy 5', /^CRUM/, 'Buy 1', /^CRUM/, 'Sell 1', 'Leave'];
  const brokerStart = s().coins; await broker(brokerActions);
  assert.equal(s().coins, brokerStart); assert.equal(LQ.shares('CRUM'), 0);
  assert.equal(LQ.loadSlot(1).lots.CRUM.length, 0);
  await talk(e => e.type === 'cavedoor');
  assert.equal(w.room.room, 'cave1'); assert(LQ.kit.hasLantern()); assert(LQ.loadSlot(1).flags.lanternRent);
  LQ.kit.inv = 1000;
  s().tool = 'lantern';
  await talk(e => e.type === 'brazier' && e.col === LQ.V1.C.fires[1].col);
  assert(!s().flags.cave1); assert(LQ.V1.C.fires.every(f => !f.lit));
  const coinBefore = s().coins;
  const imps = w.ents.filter(e => e.type === 'imp');
  for (const imp of imps) { imp.hit(w, [1, 0]); imp.hit(w, [1, 0]); }
  assert.equal(s().coins - coinBefore, 10, 'only the two fixed imps pay');
  for (const [tx, ty] of [[2,5], [17,9], [2,9], [17,5]]) await talk(e => e.type === 'brazier' && e.tx === tx && e.ty === ty);
  assert(s().flags.cave1); await talk(e => e.type === 'cache');
  assert(s().flags.page2); assert.equal(s().hp, 5);
  const rewarded = s().coins; await talk(e => e.type === 'cache'); assert.equal(s().coins, rewarded);
  LQ.script(() => w.exitRoom()); await drain(() => 0, untilIdle); assert(!s().flags.lanternRent);
  LQ.kit.inv = 0;
  console.log('Village shop, purchase cancel, insufficient funds, duplicates, prerequisites, consumables, rental, rumors, broker, and cave branches passed');

  vm.runInContext('Math.random = () => 0.99999', env);
  for (const id of ['brannock', 'pim', 'odette', 'sable', 'thorn', 'altamira']) await talk(e => e.npc?.id === id);
  assert.equal(s().quest, 6); assert(s().flags.vaultGo);
  await talk(e => e.type === 'vaultdoor');
  async function fillVault() {
    const L = LQ.V1.L;
    // The existing map check solves crate routes. Here the running game resolves socket and rune triggers.
    const crates = w.ents.filter(e => e.type === 'block');
    for (let k = 1; k <= L.n; k++) {
      Object.assign(crates[k - 1], { tx: L.sockets[k].tx, ty: L.sockets[k].ty });
      w.refresh(); await frame(); assert(L.filled[k]);
    }
    return L;
  }
  function stand(e) { Object.assign(w.p, { x: e.tx * 16 + 8, y: e.ty * 16 + 12 }); }
  const firstVault = await fillVault();
  stand(firstVault.answers[firstVault.next === 1 ? 2 : 1]);
  await frame(); await drain(() => 0, untilIdle); assert(s().flags.vaultAttempted && !firstVault.answered);
  s().tool = 'stamp'; near(w.ents.find(e => e.type === 'seal')); await press('e'); await drain(() => 0, untilIdle);
  assert.notEqual(LQ.V1.L, firstVault); assert.equal(Object.keys(LQ.V1.L.filled).length, 0);
  const afterReset = s().savvy;
  const vault = await fillVault(); stand(vault.answers[vault.next]);
  await frame(); await drain(() => 0, untilIdle); assert(vault.answered);
  assert.equal(s().savvy, afterReset, 'reset cannot restore a first-attempt reward');
  stand(w.ents.find(e => e.type === 'page'));
  await frame(); await drain(() => 0, untilIdle); assert(s().flags.vaultDone && s().flags.page1);
  LQ.script(() => w.exitRoom()); await drain(() => 0, untilIdle);
  await talk(e => e.npc?.id === 'altamira'); assert.equal(s().quest, 7);
  // Phase 2: the three fooled villagers and one paid shift.
  assert(w.ents.some(e => e.type === 'cart'), 'Rowan\'s cart blocks the footbridge');
  s().tool = 'compass'; near(w.ents.find(e => e.npc?.id === 'rowan')); await frame(30); await press('e'); await drain(() => 0, untilIdle);
  assert(s().flags.fixRowan && !w.ents.some(e => e.type === 'cart'), 'the compass sets Rowan straight');
  s().tool = 'stamp'; near(w.ents.find(e => e.type === 'bstall')); await frame(30); await press('e'); await drain(() => 0, untilIdle);
  assert(s().flags.basilSeal && s().items.includes('breturn'), 'the stamp opens Basil\'s stall');
  await talk(e => e.npc?.id === 'juno'); assert(s().flags.fixBasil && !s().items.includes('breturn') && s().quest === 7, 'Juno files Basil\'s return');
  const beforeBroth = s().coins, tonics = s().flags.tonics || 0; await talk(e => e.type === 'bstall');
  assert.equal(s().coins, beforeBroth - 10); assert.equal(s().flags.tonics, tonics + 1);
  s().flags.lanternRent = true; s().tool = 'lantern'; Object.assign(w.p, { x: 11 * 16 + 8, y: 34 * 16 + 13 }); await frame(40); await drain(() => 0, untilIdle);
  assert(s().flags.fixMaple && LQ.bazaarOff(), 'the lantern clears Granny Maple\'s porch');
  delete s().flags.lanternRent;
  const jobs = LQ.jobs;
  const beforeShift = s().coins;
  // The first shift offers an untimed practice: no clock, three tasks, no pay.
  near(w.ents.find(e => e.type === 'board')); await press('Enter');
  await drain(() => 0, () => jobs.G?.live);
  assert(jobs.G.practice, 'the first shift starts with practice');
  const clock = jobs.G.t; await frame(40); assert.equal(jobs.G.t, clock, 'practice has no timer');
  await press('Escape'); await drain(() => 1, untilIdle);
  assert.equal(LQ.scene, w); assert.equal(jobs.left(), 2, 'leaving practice keeps the paid attempts');
  near(w.ents.find(e => e.type === 'board')); await press('Enter');
  await drain(() => 0, () => jobs.G?.live);
  assert(jobs.G.practice, 'players who leave early can practice again');
  for (let i = 0; i < 3; i++) {
    const g = jobs.G, spot = g.spots[0];
    spot.task = { left: 1, max: 1, pts: 1, want: 0 }; await frame(30); assert(spot.task, 'practice tasks never expire');
    g.carry = career === 'food' ? 0 : null; Object.assign(g.p, { x: spot.x, y: spot.y }); await press('Enter');
  }
  await drain(() => 0, untilIdle); assert.equal(LQ.scene, w); assert(s().flags.shiftPractice);
  assert.equal(s().coins, beforeShift); assert.equal(jobs.left(), 2, 'zero-score shifts preserve paid attempts');
  for (const remaining of [1, 0, 0]) {
    const board = w.ents.find(e => e.type === 'board');
    near(board); await press('Enter');
    await drain(() => 0, () => jobs.G?.live);
    const game = jobs.G;
    const src = game.sources[0], spot = game.spots[0];
    if (src) { Object.assign(game.p, { x: src.x, y: 62 }); await press('Enter'); }
    spot.task = { left: 2, max: 2, pts: 1, want: 0 };
    Object.assign(game.p, { x: spot.x, y: spot.y });
    if (career === 'food') {
      game.carry = 1; await press('Enter');
      assert(spot.task && game.score === 0, 'wrong order can be corrected');
      game.carry = 0;
    }
    await press('Enter');
    assert.equal(game.score, 1);
    const coins = s().coins, pay = jobs.pay(1).net;
    game.t = .01;
    for (let i = 0; i < 20 && !ui.okWait && !ui.dlg; i++) await frame();
    assert.equal(jobs.left(), remaining);
    assert.equal(s().coins, coins + (ui.okWait ? pay : 0));
    assert.equal(LQ.loadSlot(1).coins, s().coins, 'pay is saved before closing the stub');
    await drain(() => 0, untilIdle);
  }
  const discounted = LQ.shopPrice(120);
  s().coins = discounted;
  await shop([`Saver's Credit Guidebook  -  ${discounted}`, "Buy Saver's Credit Guidebook", 'Leave']);
  assert(LQ.has('guide')); assert.equal(s().coins, 0, 'the shown discounted price is enough');
  assert(LQ.kit.owned().some(tool => tool.id === 'compass'));
  s().tool = 'compass'; near(w.ents.find(e => e.type === 'falsetree'));
  await frame(8); await press('e'); assert(s().flags.v1path);
  LQ.kit.inv = 5; // the two wisps on patrol must not knock the player off the cache tile mid-test
  await talk(e => e.type === 'cache');
  assert(LQ.kit.hasLantern() && s().items.includes('oldlantern'));
  const cacheCoins = s().coins; await talk(e => e.type === 'cache'); assert.equal(s().coins, cacheCoins);
  near(w.ents.find(e => e.type === 'lamp' && e.tx === 42));
  w.p.dir = 'right'; s().tool = 'shield';
  const hp = s().hp, bolt = LQ.parts.bolt(w, w.p.x + 8, w.p.y - 7, -74, 0);
  dispatch('keydown', 'e'); await frame(); dispatch('keyup', 'e');
  assert(!w.ents.includes(bolt) && s().hp === hp);
  const failAudit = s().coins; LQ.script(LQ.audit); await drain(() => 1, untilIdle); assert.equal(s().coins, Math.max(0, failAudit - 60));
  const firstAudit = Object.keys(s().auditHistory);
  assert.equal(firstAudit.length, 3); assert(firstAudit.every(k => !s().auditHistory[k].right));
  const passAudit = s().coins; LQ.script(LQ.audit); await drain(() => 0, untilIdle); assert(s().coins > passAudit);
  assert.equal(Object.keys(s().auditHistory).length, 6, 'a second audit chooses unseen questions');
  assert(firstAudit.every(k => s().auditHistory[k].round === 1), 'misses stay off the immediate next audit');
  assert.deepEqual(LQ.loadSlot(1).auditHistory, s().auditHistory);
  const oldAuditSave = { ...s() }; delete oldAuditSave.auditHistory;
  assert.equal(Object.keys(LQ.cleanSave(oldAuditSave).auditHistory).length, 0);
  // A single eligible question still teaches, but a missed answer waits a round.
  const history = s().auditHistory, journal = s().journal, rounds = s().audits;
  s().journal = ['withholding']; s().auditHistory = {};
  LQ.script(LQ.audit); await drain(() => 1, untilIdle);
  const [one] = Object.keys(s().auditHistory);
  assert(one && !s().auditHistory[one].right);
  LQ.script(LQ.audit); await drain(() => 0, untilIdle);
  assert.equal(s().auditHistory[one].round, rounds + 1);
  LQ.script(LQ.audit); await drain(() => 0, untilIdle);
  assert(s().auditHistory[one].right); assert.equal(s().auditHistory[one].round, rounds + 3);
  Object.assign(s(), { auditHistory: history, journal, audits: rounds });
  let wrong = false;
  await talk(e => e.qid === 'boss', ch => {
    if (ch.who?.name === 'Baron Befuddle' && !wrong) { wrong = true; return 1; } return 0;
  });
  await frame(); await drain(() => 0, untilIdle);
  assert.equal(s().quest, 8); assert(s().flags.page3);
  await talk(e => e.npc?.id === 'juno'); assert.equal(s().quest, 9);
  console.log('All Village quests, audits, vault reset, both puzzle outcomes, three Ledger pages and first filing passed');

  async function travel(region) {
    const exit = w.R.exits.find(x => x.to === region); assert(exit);
    assert(!exit.open || exit.open(s()));
    LQ.script(() => w.travel(exit)); await drain(() => 0, untilIdle);
    assert.equal(s().region, region); assert(w.canStand(w.p.x, w.p.y), 'arrival is walkable');
  }
  const coastExit = w.R.exits.find(exit => exit.to === 'coast');
  LQ.script(() => w.travel(coastExit));
  for (let i = 0; i < 100 && !LQ.cutscene.done; i++) await frame();
  assert.equal(LQ.scene, LQ.cutscene); assert(LQ.cutscene.done);
  assert.equal(LQ.audio.want, 'story');
  await press('n'); assert(LQ.narr.on); assert.equal(saved.get('ledgerquest.narration'), '1');
  assert.equal(spoken.at(-1), LQ.cutscene.def.panels[0].text);
  await press('Enter'); assert.equal(LQ.cutscene.i, 1);
  assert.equal(spoken.at(-1), LQ.cutscene.def.panels[1].text);
  const beforeSkip = voiceCancels;
  await press('Escape'); assert(voiceCancels > beforeSkip); await drain(() => 0, untilIdle);
  assert(s().flags.cut2); assert.equal(s().q2, 0); assert.equal(LQ.scene, w);
  assert.notEqual(LQ.audio.want, 'story'); await press('n');
  assert(!LQ.narr.on); assert.equal(saved.get('ledgerquest.narration'), '0');
  const leaveRoom = async () => { LQ.script(() => w.exitRoom()); await drain(() => 0, untilIdle); };
  const house = async id => {
    await talk(e => e.type === 'housedoor' && e.room === id);
    assert.equal(w.room.room, id); assert.equal(LQ.audio.want, 'home');
  };
  const claimHouse = async (id, amount, tonic) => {
    const cash = s().coins, count = s().flags.tonics || 0;
    await talk(e => e.type === 'cache');
    assert.equal(s().coins - cash, amount); assert.equal((s().flags.tonics || 0) - count, tonic);
    await leaveRoom(); await house(id);
    await talk(e => e.type === 'cache'); assert.equal(s().coins - cash, amount, 'house reward pays once');
    await leaveRoom();
  };
  assert(!w.R.exits.find(exit => exit.to === 'canyon').open(s()));
  for (const id of ['marlowe', 'brine', 'pearl', 'dory', 'stone']) await talk(e => e.npc?.id === id);

  // Follow the finder to all six loose receipts and the sea chest.
  s().coins += 120;
  await shop([/^Receipt Spyglass/, 'Buy Receipt Spyglass', 'Leave']);
  const status = () => LQ.finderStatus(LQ.REGIONS.coast, w);
  assert.equal(status().count, 'Receipts 0/7');
  async function useKitRow(id) {
    const i = LQ.kit.page.rows().findIndex(r => r.id === id);
    assert(i >= 0, id);
    while (ui.menu.sel !== i) await press('ArrowDown');
    await press('Enter');
  }
  await press('k'); assert.equal(ui.menu.tab, 5);
  await useKitRow('spyglass');
  assert(!LQ.kit.finderOn('spyglass')); assert(LQ.loadSlot(1).flags.off_spyglass);
  await useKitRow('spyglass'); assert(LQ.kit.finderOn('spyglass')); await press('Escape');
  const drawer = w.ents.find(e => e.type === 'chest' && e.id === 'drawer');
  near(drawer); assert.match(status().hint, new RegExp(LQ.RECEIPTS.rPoints.name));
  await talk(e => e === drawer);
  assert.equal(status().count, 'Receipts 1/7'); assert(!status().hint.includes(LQ.RECEIPTS.rPoints.name));
  const afterChest = s().coins; await talk(e => e === drawer); assert.equal(s().coins, afterChest);
  const collect = async e => {
    const x = e.tx * 16 + 8, y = e.ty * 16 + 10;
    assert(w.canStand(x, y), e.rid);
    Object.assign(w.p, { x, y });
    assert(status().hint.includes(LQ.RECEIPTS[e.rid].name), e.rid);
    await frame(); await drain(() => 0, untilIdle);
    assert(s().rcpt[e.rid]); assert(!w.ents.some(other => other.rid === e.rid));
    assert(!status().hint.includes(LQ.RECEIPTS[e.rid].name));
  };
  await collect(w.ents.find(e => e.rid));
  assert.equal(status().count, 'Receipts 2/7');
  LQ.state = LQ.loadSlot(1); w.start();
  assert.equal(status().count, 'Receipts 2/7'); assert.equal(w.ents.filter(e => e.rid).length, 5);
  await travel('village'); assert.match(status().hint, /Return to Shelter Coast/);
  await travel('coast');
  assert.equal(w.ents.filter(e => e.rid).length, 5);
  for (const e of w.ents.filter(e => e.rid)) await collect(e);
  assert.equal(status().count, 'Receipts 7/7'); assert.match(status().hint, /All lost receipts found/);
  assert(LQ.CH2.hunt.every(id => LQ.loadSlot(1).rcpt[id]));

  // Fill, swap, store and cycle the Field Kit through the actual menu.
  assert.equal(LQ.kit.equipped().length, 3);
  await press('k'); await useKitRow('lantern'); assert.equal(ui.menu.swap, 'lantern');
  await useKitRow('compass'); assert.equal(ui.menu.swap, null); assert.equal(s().tool, 'lantern');
  assert.equal(LQ.kit.equipped().length, 3);
  await useKitRow('lantern'); assert.equal(LQ.kit.equipped().length, 2);
  await useKitRow('compass'); await press('Escape');
  const cycled = new Set();
  for (let i = 0; i < 3; i++) { await press('q'); cycled.add(s().tool); }
  assert.equal(cycled.size, 3); assert(!cycled.has('lantern'));
  assert.equal(LQ.loadSlot(1).flags.kitEq, s().flags.kitEq);
  await house('house2');
  const savingsCrate = () => w.ents.find(e => e.type === 'block');
  const pushSavings = async target => {
    for (let i = 0; i < 100 && savingsCrate().tx < target; i++) {
      Object.assign(w.p, { x: savingsCrate().tx * 16 - 6, y: savingsCrate().ty * 16 + 13, dir: 'right' });
      dispatch('keydown', 'ArrowRight'); await frame(6); dispatch('keyup', 'ArrowRight');
    }
    assert.equal(savingsCrate().tx, target);
  };
  await pushSavings(4); await leaveRoom(); await house('house2');
  assert.equal(savingsCrate().tx, 3, 'unfinished savings puzzle resets on entry');
  await pushSavings(8); assert(s().flags.house2); await claimHouse('house2', 30, 1);
  await talk(e => e.npc?.id === 'tallow');
  console.log('Coast cutscene advance and skip, seven receipts, finder toggle, reload, return travel and Field Kit swap passed');
  assert.equal(s().q2, 6);
  await talk(e => e.qid === 'boss2'); await talk(e => e.npc?.id === 'fathom'); assert.equal(s().q2, 8);
  await travel('canyon'); assert.equal(s().q3, 0);
  assert(!w.R.exits.find(exit => exit.to === 'summit').open(s()));
  for (const id of ['juniper', 'mesa', 'lupe', 'flint', 'dune', 'brick']) {
    await talk(e => e.npc?.id === id, ch => ch.prompt === 'Which gig will you take?' ? ['nurse', 'owner', 'food'].indexOf(career) : 0);
  }
  assert.equal(s().q3, 6);
  await house('house3');
  for (const [x, solved] of [[3, false], [8, true]]) {
    near(w.ents.find(e => e.type === 'seal' && e.tx === x));
    LQ.kit.need('stamp'); LQ.kit.cool = 0; await press('e'); await frame(5);
    assert.equal(!!s().flags.house3, solved);
  }
  await claimHouse('house3', 30, 0);
  await talk(e => e.type === 'gigboard', () => 1);
  const gigGross = LQ.fin3().gigGross, runs = LQ.money2.totals().runs, gigCash = s().coins;
  near(w.ents.find(e => e.type === 'gigboard')); await press('Enter'); await press('Enter');
  await drain(() => 0, () => LQ.scene === LQ.jobs && LQ.jobs.G?.live, 250);
  const gigRun = LQ.jobs.G;
  for (let i = 0; i < 140 && !gigRun.score; i++) {
    const customer = gigRun.spots.find(spot => spot.task);
    if (customer) {
      if (!gigRun.stock) {
        const shelf = gigRun.sources.find(o => o.restock); Object.assign(gigRun.p, shelf); await press('Enter');
      }
      Object.assign(gigRun.p, { x: customer.x, y: customer.y }); await press('Enter');
    } else await frame();
  }
  assert(gigRun.score > 0, 'served a customer in the gig run');
  await drain(() => 0, untilIdle, 1400);
  assert.equal(LQ.money2.totals().runs, runs + 1);
  assert.equal(s().coins - gigCash, LQ.money2.pay(gigRun.score).kept);
  assert.equal(LQ.fin3().gigGross, gigGross, 'practice payout stays out of Schedule C');
  {
    // Slick's Stash: the gift box springs an imp and does not count; the three income boxes open the strongroom.
    const w = LQ.world, stamp = async i => { s().tool = 'stamp'; LQ.kit.inv = 5; LQ.kit.cool = 0; near(w.ents.find(e => e.box === i)); await frame(6); await press('e'); await frame(4); };
    await talk(e => e.type === 'stashdoor'); assert.equal(w.room?.room, 'stash3', 'the stash opens during Chapter 3');
    await stamp(1); assert(!s().flags.stash3 && w.ents.some(e => e.type === 'imp' && !e.rewardKey), 'a gift is not income');
    await stamp(0); await stamp(2); assert(!s().flags.stash3); await stamp(3); assert(s().flags.stash3, 'three income boxes open the door');
    assert(!w.ents.some(e => e.type === 'door'));
    const coins = s().coins, tonics = s().flags.tonics || 0;
    await talk(e => e.type === 'cache'); assert.equal(s().coins, coins + 40); assert.equal(s().flags.tonics, tonics + 1);
    await talk(e => e.type === 'cache'); assert.equal(s().coins, coins + 40, 'the chest pays once');
    LQ.script(() => w.exitRoom()); await drain(() => 0, untilIdle); assert.equal(s().region, 'canyon'); assert(!w.room);
    // hearts carry out of a boss fight, a lamp by the arena refills them, and a broke player can still rest
    s().hp = 1.5; s().coins = 0; LQ.kit.inv = 0;
    const ex = LQ.shopExtras().map(x => x.label);
    assert(ex.some(l => l.startsWith('Hot meal')) && ex.some(l => l.startsWith('Sit and rest')), 'meal and free rest are offered when hurt');
    LQ.script(() => LQ.shopExtras().find(x => x.label.startsWith('Hot meal')).run(null)); await drain(() => 0, untilIdle); assert.equal(s().hp, 1.5, 'no coins, no meal');
    LQ.script(() => LQ.shopExtras().find(x => x.label.startsWith('Sit and rest')).run(null)); await drain(() => 0, untilIdle); assert.equal(s().hp, 2);
    s().coins = 8; LQ.script(() => LQ.shopExtras().find(x => x.label.startsWith('Hot meal')).run(null)); await drain(() => 0, untilIdle);
    assert.equal(s().hp, LQ.kit.maxHp()); assert.equal(s().coins, 0);
    s().hp = 1.25; await talk(e => e.type === 'lamp' && e.tx === 42); assert.equal(s().hp, LQ.kit.maxHp(), 'the lamp by the Gulch is free');
    s().hp = 3;
  }
  { const before = s().hp; let miss = false;
    await talk(e => e.qid === 'boss3', ch => { if (ch.who?.name && !miss && LQ.scene === LQ.battle) { miss = true; return ch.options.findIndex((o, i) => i !== 0 && o) ; } return 0; });
    assert(s().hp < before && s().hp > 0 && s().hp * 4 % 1 === 0, 'boss damage is in quarter hearts and carries into the world: ' + s().hp);
    assert.equal(LQ.loadSlot(1).hp, s().hp, 'carried hearts are saved'); }
  await talk(e => e.npc?.id === 'sage'); assert.equal(s().q3, 8);
  await travel('summit'); assert.equal(s().q4, 0);
  await house('house4'); s().hp = 1.25;
  await talk(e => e.type === 'brazier'); assert.equal(s().hp, LQ.kit.maxHp());
  await claimHouse('house4', 20, 1);
  console.log('Three optional houses, puzzle reset, unique rewards, music cues, narration routing and paid gig passed');
  const shareCost = LQ.price('GLCR'), investBefore = s().inv.st, taxBefore = s().capTax;
  const wagesBefore = LQ.fin4().wages, realizedBefore = s().brokerRealized;
  s().coins = Math.max(s().coins, shareCost * 6 + 100);
  await broker([/^GLCR/, 'Buy 5', 'Leave']);
  assert.equal(LQ.loadSlot(1).lots.GLCR[0].cost, shareCost);
  assert.equal(s().inv.st, investBefore, 'buying does not report a sale');
  s().prices.GLCR = shareCost + 10;
  await broker([/^GLCR/, 'Buy 1', 'Leave']);
  assert.equal(s().inv.st, investBefore, 'holding an unrealized gain does not report it');
  const cashBefore = s().coins;
  await broker([/^GLCR/, 'Sell 1', 'Leave']);
  assert.equal(s().coins, cashBefore + shareCost + 10, 'partial sale credits gross proceeds');
  assert.equal(LQ.holding('GLCR').shares, 5);
  assert.equal(LQ.holding('GLCR').basis, shareCost * 5 + 10, 'oldest lot is sold first');
  assert.equal(LQ.holding('GLCR').unrealized, 40);
  assert.equal(s().inv.st, investBefore + 10 * LQ.COIN_USD);
  const beforeAll = s().coins;
  s().prices.GLCR = shareCost - 5;
  await broker([/^GLCR/, 'Sell all (5)', 'Leave']);
  assert.equal(s().coins, beforeAll + 5 * (shareCost - 5));
  assert.equal(LQ.holding('GLCR').basis, 0);
  assert.equal(s().inv.st, investBefore - 25 * LQ.COIN_USD, 'Schedule D records the gain and net loss once');
  assert.equal(LQ.fin4().stRaw, s().inv.st);
  assert.equal(LQ.fin4().wages, wagesBefore, 'stock sales are separate from W-2 wages');
  assert.equal(LQ.loadSlot(1).brokerRealized, realizedBefore - 25);
  assert.equal(s().capTax, taxBefore, 'the Summit broker defers tax to filing');
  for (const id of ['marlowe', 'garnet', 'frost', 'birch', 'larch', 'cirrus', 'tamsin']) {
    await talk(e => e.npc?.id === id, ch => {
      if (ch.prompt === 'What will you do with the Glacier Goldworks shares?') return career === 'nurse' ? 0 : 1;
      if (ch.prompt === 'What will you do with the Avalanche Airships shares?' || ch.prompt.includes('Where does it go?')) return ['nurse', 'owner', 'food'].indexOf(career);
      return 0;
    });
  }
  assert.equal(s().q4, 7);
  await talk(e => e.qid === 'boss4'); await talk(e => e.npc?.id === 'alpen'); assert.equal(s().q4, 9);
  await travel('canyon'); await travel('coast'); await travel('village');
  assert.equal(LQ.loadSlot(1).q4, 9);
  assert(chapterOneHit, 'Chapter 1 took a bolt hit');
  assert.deepEqual([...seenMoves].sort(), ['beam', 'bolts', 'devils', 'fire'], 'every boss ran its own movement pattern');
  console.log('Coast, Canyon and Summit quest chains, three more boss fights and returns, finale and return travel passed');

  // The Torn Ledger. Every activity was handed in wrong once and recovered, and all twelve pages are home.
  for (const phase of ['sort', 'pick', 'dial', 'day', 'drop']) assert(recovered.includes(phase), phase + ' was failed once and retried');
  assert.equal(LQ.pages(), 12);
  for (const id of ['invoice1', 'invoice2', 'invoice3', 'invoice4']) assert(s().items.includes(id), id);
  assert.match(LQ.curQuest().text, /cottage cellar/);
  // An older finished save has none of pages 4 to 12. Milestone pages return on their own; activity pages are replayed.
  for (let n = 4; n <= 12; n++) delete s().flags['page' + n];
  s().items = s().items.filter(id => !/^invoice[234]$/.test(id));
  const oldSave = LQ.cleanSave(JSON.parse(JSON.stringify(s()))); assert(oldSave, 'an older finished save still loads');
  await frame(12); await drain(() => 0, untilIdle);
  assert.equal(LQ.pages(), 9, 'milestone pages come back without a restart');
  assert.match(LQ.curQuest().text, /Page 4 of 12: Sort receipts with Tallow/);
  const record = JSON.stringify(s().inv);
  const replay = JSON.stringify(LQ.depth.holdFigures());
  const saleChoice = s().hold4; delete s().hold4;
  assert.equal(JSON.stringify(LQ.depth.holdFigures()), replay, 'a filed sale is no longer in the investment ledger');
  s().hold4 = saleChoice;
  for (const [region, id, n] of [['coast', 'tallow', 4], ['canyon', 'brick', 7], ['summit', 'frost', 10]]) {
    await travel(region); await talk(e => e.npc?.id === id); assert(s().flags['page' + n], 'page ' + n + ' replayed');
  }
  assert.equal(JSON.stringify(s().inv), record, 'replaying the sale clock leaves the real sale alone');
  await travel('canyon'); await travel('coast'); await travel('village');
  assert.equal(LQ.pages(), 12);
  // Down to the cellar, through the tall door, and into the Back Office.
  await talk(e => e.type === 'homedoor'); assert.equal(w.room.room, 'cottage1');
  Object.assign(w.p, { x: 8 * 16 + 8, y: 5 * 16 + 12 }); await frame(3); await drain(() => 0, untilIdle);
  assert.equal(w.room.room, 'cellar1');
  await talk(e => e.type === 'greatdoor'); assert.equal(w.room.room, 'backoffice'); assert(s().flags.doorOpen);
  const stampAt = async find => { s().tool = 'stamp'; near(w.ents.find(find)); await frame(12); await press('e'); await frame(4); await drain(() => 0, untilIdle); };
  assert(w.ents.some(e => e.type === 'door' && e.tx === 9), 'the inner gate is shut');
  s().hp = LQ.kit.maxHp(); await stampAt(e => e.type === 'seal' && e.tx === 16); assert(s().flags.bo3, 'valve 3');
  assert(!w.ents.some(e => e.type === 'spitter' || e.type === 'bolt'), 'valve 3 stops fog bolts immediately');
  // A fall inside the room: wake at the lamp with the valve still shut.
  LQ.script(() => LQ.kit.faint(w)); await drain(() => 0, untilIdle);
  assert.equal(w.room.room, 'backoffice'); assert(s().flags.bo3 && !w.ents.some(e => e.type === 'spitter'), 'a shut valve survives a faint');
  await stampAt(e => e.type === 'seal' && e.tx === 18);
  assert(!s().flags.bo2, 'the guarded valve stays open while the imp lives');
  const imp = w.ents.find(e => e.type === 'imp');
  for (let i = 0; i < 2; i++) {
    await frame(8);
    const fromLeft = w.canStand(imp.x - 12, imp.y + 6);
    Object.assign(w.p, { x: imp.x + (fromLeft ? -12 : 12), y: imp.y + 6, dir: fromLeft ? 'right' : 'left' });
    await press('e');
  }
  assert(!w.ents.includes(imp), 'the Truth Stamp defeats the imp');
  await stampAt(e => e.type === 'seal' && e.tx === 18); assert(s().flags.bo2, 'valve 2');
  assert(w.ents.some(e => e.type === 'door' && e.tx === 2), 'the grille guards valve 1');
  const crate = w.ents.find(e => e.type === 'block');
  Object.assign(w.p, { x: 7 * 16 + 8, y: 9 * 16 + 12 });
  dispatch('keydown', 'ArrowLeft'); await frame(28); dispatch('keyup', 'ArrowLeft');
  assert.equal(crate.tx, 4, 'walking into the crate pushes it onto the rune');
  assert(!w.ents.some(e => e.type === 'door' && e.tx === 2), 'the crate on the rune lifts the grille');
  await stampAt(e => e.type === 'seal' && e.tx === 1); assert(s().flags.bo1, 'valve 1');
  assert(!w.ents.some(e => e.type === 'door'), 'three valves open the inner gate');
  await stampAt(e => e.qid === 'fogpress'); assert(!s().flags.ledgerDone, 'the finale waits for Vell’s reveal');
  await talk(e => e.who?.name === 'Clerk Vell'); assert(s().flags.vellFree);
  LQ.script(() => w.exitRoom()); await drain(() => 0, untilIdle);
  assert.match(LQ.curQuest().text, /tall door/i, 'the cellar points back to the office after Vell’s reveal');
  await talk(e => e.type === 'greatdoor');
  assert.match(LQ.curQuest().text, /Standing Order/);
  await talk(e => e.who?.name === 'Head Clerk Murk', () => 1);
  await stampAt(e => e.type === 'seal' && e.tx === 9);
  assert(s().flags.ledgerDone && s().items.includes('greatledger')); assert(!w.ents.some(e => e.who?.name === 'Head Clerk Murk'));
  assert.match(LQ.curQuest().text, /whole/); assert.equal(LQ.loadSlot(1).flags.ledgerDone, true);
  LQ.script(() => w.exitRoom()); await drain(() => 0, untilIdle); assert.equal(w.room.room, 'cellar1');
  LQ.script(() => w.exitRoom()); await drain(() => 0, untilIdle); LQ.script(() => w.exitRoom()); await drain(() => 0, untilIdle);
  assert.equal(w.room, null);
  console.log('Wrong attempts and retries, an older save recovering its pages, the tall door, the Back Office and the final stamp passed');

  // Exercise the normal purchase prompts for each item, including both owner-only items.
  s().career = 'owner'; s().coins = 100_000;
  for (const region of ['village', 'coast', 'canyon', 'summit']) {
    if (s().region !== region) await travel(region);
    const available = LQ.gearFor().filter(item => !LQ.has(item.id));
    const before = s().coins;
    const names = available.flatMap(item => [`${item.name}  -  ${LQ.shopPrice(item.price)}`, `Buy ${item.name}`]);
    await shop([...names, 'Leave']);
    for (const item of available) assert(LQ.has(item.id));
    // Granny Maple's tenth applies at the Saffron Bazaar only.
    assert.equal(LQ.bazaarOff(), region === 'village');
    assert.equal(before - s().coins, available.reduce((sum, item) => sum + LQ.shopPrice(item.price), 0));
  }
  assert.equal(s().gear.length, LQ.GEAR.length);
  assert.equal(new Set(s().gear).size, LQ.GEAR.length);
  assert.equal(LQ.loadSlot(1).gear.length, LQ.GEAR.length);
  assert.equal(LQ.fin().retire + LQ.fin().roth, LQ.TAX.iraLimit);
  assert.equal(LQ.fin4().int, 0); assert.equal(LQ.fin4().sp401, 7000);
  assert.equal(LQ.saverCredit(24250, 3000), 1000);
  assert.equal(LQ.saverCredit(24251, 3000), 400);
  assert.equal(LQ.saverCredit(26251, 3000), 200);
  assert.equal(LQ.saverCredit(40251, 3000), 0);
  assert.equal(LQ.saverCredit(52500, 3000, 3000, true), 800);
  s().career = 'food';
  const pay = LQ.fin(); assert(Math.abs(pay.netYear - (pay.wages - pay.retire - pay.withheld - pay.ssYear - pay.medYear)) < 0.01);
  assert.equal(LQ.docs.settlementRow({ diff: 0, total: 100, withheld: 100 }).ask[1][0], 'It comes out exactly even');
  console.log('All 20 gear items, owner-only gear, save round-trip, retirement take-home and Saver’s Credit boundaries passed');

  for (const chapter of [2, 3, 4]) {
    LQ.deleteSlot(3); LQ.setScene(LQ.title);
    while (LQ.title.sel !== 2) await press('ArrowDown');
    await press('Enter');
    await drain(ch => ch.prompt === 'Where do you want to start?' ? chapter - 1 : 0,
      () => LQ.scene === w && untilIdle());
    for (let i = 0; i < 2; i++) { await frame(12); await drain(() => 0, untilIdle); }
    const region = ['coast', 'canyon', 'summit'][chapter - 2];
    assert.equal(s().region, region); assert.equal(s()['q' + chapter], 0);
    assert.equal(LQ.loadSlot(3)['q' + chapter], 0);
    assert.equal(Object.keys(s().flags).filter(k => /^page/.test(k)).sort().join(), ['page1,page2,page3', 'page1,page2,page3,page5,page6', 'page1,page2,page3,page5,page6,page8,page9'][chapter - 2], 'a chapter starter is handed the pages it skipped');
  }
  console.log(`Title starter kits for Chapters 2–4 passed (${career} run)`);

  saved.clear();
  saved.set('ledgerquest.save.v2', JSON.stringify({ quest: 1, career, coins: 75 }));
  LQ.setScene(LQ.title);
  assert.equal(LQ.loadSlot(1).hp, 4);
  await press('Enter'); await drain(() => 0, () => LQ.scene === w && untilIdle());
  assert.equal(s().coins, 75);
  assert.equal(w.room, null);
  assert.equal(LQ.intro.active(), false);
  console.log('Pre-slot save migrated and resumed without replaying the opening');
})().catch(e => { console.error(e); process.exitCode = 1; });
