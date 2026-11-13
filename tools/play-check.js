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
const errors = [];
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
      k.right = at.x < d.sx - 3; k.left = at.x > d.sx + 3; k.down = at.y < d.sy - 3; k.up = at.y > d.sy + 3;
      await frame();
      if (!LQ.battle.dodge) k.right = k.left = k.down = k.up = false;
    } else if (end()) return;
    else if (LQ.scene !== LQ.world && LQ.scene !== LQ.title && !LQ.scene.cfg && LQ.scene.update) await press('Enter');
    else await frame();
  }
  throw Error(`Timed out in ${LQ.state.region} at ${LQ.curQuest()?.short}.`);
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
  console.log('Title, new game, tutorial, cottage, cellar, combat, quest 1, five menu tabs, three viewports, backup round-trip and Continue passed');
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
  const beforeShift = s().coins; await talk(e => e.type === 'board'); assert.equal(LQ.scene, w);
  assert.equal(s().flags.shiftN, 1); assert(s().coins >= beforeShift); assert.equal(LQ.jobs.left(), 1);
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
  const passAudit = s().coins; LQ.script(LQ.audit); await drain(() => 0, untilIdle); assert(s().coins > passAudit);
  let wrong = false;
  await talk(e => e.qid === 'boss', ch => {
    if (ch.prompt === 'Counter the myth:' && !wrong) { wrong = true; return 1; } return 0;
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
  await travel('coast'); assert.equal(s().q2, 0);
  assert(!w.R.exits.find(exit => exit.to === 'canyon').open(s()));
  for (const id of ['marlowe', 'brine', 'pearl', 'dory', 'stone', 'tallow']) await talk(e => e.npc?.id === id);
  assert.equal(s().q2, 6);
  await talk(e => e.qid === 'boss2'); await talk(e => e.npc?.id === 'fathom'); assert.equal(s().q2, 8);
  await travel('canyon'); assert.equal(s().q3, 0);
  assert(!w.R.exits.find(exit => exit.to === 'summit').open(s()));
  for (const id of ['juniper', 'mesa', 'lupe', 'flint', 'dune', 'brick']) {
    await talk(e => e.npc?.id === id, ch => ch.prompt === 'Which gig will you take?' ? ['nurse', 'owner', 'food'].indexOf(career) : 0);
  }
  assert.equal(s().q3, 6);
  await talk(e => e.qid === 'boss3'); await talk(e => e.npc?.id === 'sage'); assert.equal(s().q3, 8);
  await travel('summit'); assert.equal(s().q4, 0);
  const shareCost = LQ.price('GLCR'), investBefore = s().inv.st, taxBefore = s().capTax;
  await broker([/^GLCR/, 'Buy 1', 'Leave']);
  assert.equal(LQ.loadSlot(1).lots.GLCR[0].cost, shareCost);
  s().prices.GLCR = shareCost + 10;
  await broker([/^GLCR/, 'Sell 1', 'Leave']);
  assert.equal(s().inv.st, investBefore + 10 * LQ.COIN_USD);
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
  console.log('Coast, Canyon and Summit quest chains, three more boss fights and returns, finale and return travel passed');

  // Exercise the normal purchase prompts for each item, including both owner-only items.
  s().career = 'owner'; s().coins = 100_000;
  for (const region of ['village', 'coast', 'canyon', 'summit']) {
    if (s().region !== region) await travel(region);
    const available = LQ.gearFor().filter(item => !LQ.has(item.id));
    const before = s().coins;
    const names = available.flatMap(item => [`${item.name}  -  ${item.price}`, `Buy ${item.name}`]);
    await shop([...names, 'Leave']);
    for (const item of available) assert(LQ.has(item.id));
    // Granny Maple's tenth applies at the Saffron Bazaar only.
    assert.equal(LQ.bazaarOff(), region === 'village');
    assert.equal(before - s().coins, available.reduce((sum, item) => sum + item.price - (LQ.bazaarOff() ? Math.round(item.price * .1) : 0), 0));
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
    await frame(); await drain(() => 0, untilIdle);
    const region = ['coast', 'canyon', 'summit'][chapter - 2];
    assert.equal(s().region, region); assert.equal(s()['q' + chapter], 0);
    assert.equal(LQ.loadSlot(3)['q' + chapter], 0);
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
