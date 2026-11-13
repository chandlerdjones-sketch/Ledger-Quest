// Careers, the money model, points, the market, and the brokerage.
(() => {
const LQ = window.LQ, TX = LQ.TAX, ui = LQ.ui, F = LQ.F, M = n => LQ.money(n);
const st = () => LQ.state;

// ---------- careers
LQ.CAREERS = {
  nurse: { id: 'nurse', name: 'Nurse', kind: 'w2', wages: 83200, ot: 6000, pays: 26, pay: 80, work: 'Willowbrook Infirmary', diff: 'Normal',
    look: { hair: '#3a2a1c', long: 1, shirt: '#2fa39a', pants: '#2a7d76', trim: '#e8fbf8' },
    lines: ['Steady paycheck plus overtime', 'Income reaches the 22% ledge', 'Perk: the overtime deduction'] },
  food: { id: 'food', name: 'Fast Food Worker', kind: 'w2', wages: 31200, ot: 0, pays: 26, pay: 40, work: 'the Griddle Goblin', diff: 'Tight budget',
    look: { hair: '#7a4a2a', shirt: '#d9463e', pants: '#3a3550', trim: '#f3d24a', hat: 'cap', hatColor: '#d9463e' },
    lines: ['Hourly pay, every coin counts', 'Low brackets, small tax bill', "Perk: the Saver's Credit"] },
  owner: { id: 'owner', name: 'Small Business Owner', kind: 'se', sales: 96000, expenses: 44000, pays: 4, pay: 95, work: 'your candle shop', diff: 'Hard',
    look: { hair: '#231a36', shirt: '#3d9a5a', pants: '#5a4630', trim: '#f1e3bd' },
    lines: ['No paycheck. You are the boss', 'Pay both halves of payroll tax', 'Perk: write-offs, 20% deduction'] },
};
LQ.career = () => LQ.CAREERS[st().career] || LQ.CAREERS.food;
LQ.has = id => st().gear.includes(id);
LQ.heroLook = () => {
  const c = LQ.career(), g = st().gear;
  const look = Object.assign({}, c.look, { id: 'hero-' + c.id + (g.includes('chest') ? 'c' : '') + (g.includes('abacus') ? 'a' : '') });
  if (g.includes('chest')) look.trim = '#c9d2e3';
  if (g.includes('abacus')) look.hat = 'crown';
  return look;
};

// ---------- the player's tax picture, from the real 2026 figures, their career, W-4 choice, and gear
// The two spouses each have a $2,000 contribution limit for this credit.
LQ.saverCredit = (agi, own, spouse = 0, joint = false) => {
  if (!LQ.has('guide')) return 0;
  const m = joint ? 2 : 1;
  const rate = agi <= m * TX.saverHalfAgi ? .5 : agi <= m * TX.saverFifthAgi ? .2 : agi <= m * TX.saverMaxAgi ? .1 : 0;
  return Math.round(rate * (Math.min(2000, own) + Math.min(2000, spouse)));
};
function ownerCalc(profit, adj, charity) {
  const std = TX.standardDeduction.single;
  const se = Math.round(profit * TX.seBase * TX.seRate), half = Math.round(se / 2);
  const agi = profit - half - adj, pre = Math.max(0, agi - std - charity);
  const qbi = Math.round(TX.qbiRate * Math.min(profit - half, pre)), taxable = pre - qbi;
  return { se, half, agi, qbi, taxable, tax: Math.round(LQ.taxOn(taxable).total) };
}
LQ.fin = (w4 = st().w4 || 0) => {
  const c = LQ.career(), std = TX.standardDeduction.single, has = LQ.has;
  const roth = has('roth') ? 3000 : 0, hsa = has('hsa') ? 2000 : 0, charity = has('charity') ? 500 : 0;
  const boosted = c.kind === 'se' ? TX.iraLimit - roth : TX.iraLimit;
  const retire = has('chest') ? (has('mantle') ? boosted : 3000) : 0;
  const f = { c, kind: c.kind, std, retire, roth, hsa, charity, pays: c.pays, w4, ot: 0, se: 0, half: 0, qbi: 0 };
  if (c.kind === 'w2') {
    f.wages = c.wages; f.gross = c.wages / c.pays; f.ot = c.ot;
    f.box1 = c.wages - retire; f.income = f.box1; f.agi = f.box1 - hsa;
    f.taxable = Math.max(0, f.agi - std - c.ot - charity);
    f.per = Math.ceil(LQ.taxOn(Math.max(0, c.wages - std - (w4 === 2 ? 8000 : 0))).total / c.pays) + (w4 === 1 ? 40 : 0);
    f.ss = f.gross * TX.ssRate; f.med = f.gross * TX.medicareRate; f.retirePerCheck = retire / c.pays; f.net = f.gross - f.retirePerCheck - f.per - f.ss - f.med;
    f.ssYear = f.ss * c.pays; f.medYear = f.med * c.pays; f.netYear = f.net * c.pays;
  } else {
    f.sales = c.sales; f.baseExpenses = c.expenses;
    f.writeoffs = (has('miles') ? TX.mileage.demo : 0) + (has('hearth') ? 1000 : 0);
    f.expenses = c.expenses + f.writeoffs; f.profit = f.sales - f.expenses; f.income = f.profit; f.gross = f.profit / 4;
    const o = ownerCalc(f.profit, retire + hsa, charity);
    Object.assign(f, { se: o.se, half: o.half, agi: o.agi, qbi: o.qbi, taxable: o.taxable });
    const b = ownerCalc(c.sales - c.expenses, 0, 0); f.baseBill = b.tax + b.se; f.baseSe = b.se; f.baseTax = b.tax;
    f.per = w4 === 2 ? 0 : w4 === 1 ? 3000 : Math.ceil(f.baseBill / 4 / 50) * 50;
    f.net = f.gross - f.per; f.netYear = f.net * 4;
  }
  f.tiers = LQ.taxOn(f.taxable).tiers.filter(t => t.amount > 0);
  if (!f.tiers.length) f.tiers = [LQ.taxOn(1).tiers[0]];
  f.tax = Math.round(LQ.taxOn(f.taxable).total);
  f.top = f.tiers[f.tiers.length - 1].rate;
  f.credit = Math.min(f.tax, LQ.saverCredit(f.agi, retire + roth));
  f.total = f.tax - f.credit + f.se; f.withheld = f.per * c.pays; f.diff = f.withheld - f.total;
  return f;
};

// ---------- Chapter 2: the household. You, your spouse Marlowe, Coral, and the cottage.
const STD = TX.standardDeduction;
LQ.HOME = { spouse: 'Marlowe', child: 'Coral', spWages: 52000, loan: 340000, rate: 0.065, interest: 22000, principal: 3788, points: 3400, propTax: 3600, cartTax: 180, provRate: 0.04, daycare: 9000 };
// kind: interest and salt count when you itemize, gift counts either way, the rest are traps or credits
LQ.RECEIPTS = {
  r1098: { name: 'Mortgage interest (Form 1098)', amt: 22000, kind: 'interest' },
  rProp: { name: 'Property tax bill', amt: 3600, kind: 'salt' },
  rPoints: { name: 'Closing papers: loan points', amt: 3400, kind: 'interest', hunt: 1 },
  rCart: { name: 'Cart tax, charged by value', amt: 180, kind: 'salt', hunt: 1 },
  rChapel: { name: 'Gift: chapel roof fund', amt: 400, kind: 'gift', hunt: 1 },
  rLight: { name: "Gift: lighthouse keepers' fund", amt: 350, kind: 'gift', hunt: 1 },
  rSchool: { name: 'Gift: Harbor School', amt: 250, kind: 'gift', hunt: 1 },
  rRaffle: { name: 'School raffle ticket', amt: 50, kind: 'none', hunt: 1 },
  rMedical: { name: "Healer's bills", amt: 1900, kind: 'medical', hunt: 1 },
  rCare: { name: 'Nursery statement (daycare)', amt: 9000, kind: 'care' },
};
const whTwoJobs = x => Math.ceil(LQ.taxOn(Math.max(0, x - STD.single)).total / 26) * 26;
const whBlank = x => Math.ceil(LQ.taxOn(Math.max(0, x - STD.mfj), 'mfj').total / 26) * 26;
// Tax paid in during the year under each W-4 plan: 0 estimator, 1 each fills one in alone, 2 two-jobs box and nothing else
LQ.withhold2 = opt => {
  const b = LQ.fin(0), sp = LQ.HOME.spWages - (LQ.has('anchor') ? 4000 : 0), w2 = b.kind === 'w2';
  if (opt === 0) return Math.ceil(LQ.fin2({ itemize: false, wh: 0, child: true, care: true }).total / 26) * 26;
  if (opt === 1) return (w2 ? Math.max(0, whBlank(b.box1) - TX.ctc) : 0) + Math.max(0, whBlank(sp) - TX.ctc);
  return (w2 ? whTwoJobs(b.box1) : b.per * 4) + whTwoJobs(sp);
};
// The joint return. Built on top of your own figures from LQ.fin, so gear from Chapter 1 still counts.
LQ.fin2 = (o = {}) => {
  const s = st(), b = LQ.fin(0), H = LQ.HOME, has = LQ.has, got = id => !!(s.rcpt && s.rcpt[id]), w2 = b.kind === 'w2', RC = LQ.RECEIPTS;
  const sp401 = has('anchor') ? 4000 : 0, hsaX = has('cask') ? 4000 : 0, spBox1 = H.spWages - sp401, own = w2 ? b.box1 : b.profit;
  const f = { b, c: b.c, kind: b.kind, own, spWages: H.spWages, spBox1, sp401, hsaX, se: b.se, half: b.half, ot: b.ot, pays: 26 };
  f.income = own + spBox1;
  f.adj = (w2 ? b.hsa : b.half + b.retire + b.hsa) + hsaX;
  f.agi = f.income - f.adj;
  f.prov = Math.round(H.provRate * f.income);
  f.interest = (got('r1098') ? H.interest : 0) + (got('rPoints') ? H.points : 0);
  f.saltRaw = f.prov + (got('rProp') ? H.propTax : 0) + (got('rCart') ? H.cartTax : 0);
  f.salt = Math.min(TX.saltCap, f.saltRaw);
  f.gifts = o.noGifts ? 0 : (has('charity') ? 500 : 0) + Object.keys(RC).reduce((a, id) => a + (RC[id].kind === 'gift' && got(id) ? RC[id].amt : 0), 0);
  f.giftFloor = Math.round(TX.charityFloor * f.agi); f.giftItem = Math.max(0, f.gifts - f.giftFloor);
  f.medical = got('rMedical') ? RC.rMedical.amt : 0; f.medFloor = Math.round(TX.medicalFloor * f.agi); f.medItem = Math.max(0, f.medical - f.medFloor);
  f.itemized = f.interest + f.salt + f.giftItem + f.medItem;
  f.std = STD.mfj; f.giftStd = Math.min(f.gifts, TX.charityJoint); f.stdTotal = f.std + f.giftStd;
  f.better = f.itemized > f.stdTotal ? 'item' : 'std';
  f.itemize = o.itemize != null ? o.itemize : f.better === 'item';
  f.ded = f.itemize ? f.itemized : f.stdTotal;
  const pre = Math.max(0, f.agi - f.ded - f.ot);
  f.qbi = w2 ? 0 : Math.round(TX.qbiRate * Math.min(b.profit - b.half, pre));
  f.taxable = pre - f.qbi;
  const t = LQ.taxOn(f.taxable, 'mfj');
  f.tiers = t.tiers.filter(x => x.amount > 0); if (!f.tiers.length) f.tiers = [LQ.taxOn(1, 'mfj').tiers[0]];
  f.tax = Math.round(t.total); f.top = f.tiers[f.tiers.length - 1].rate;
  const kid = o.child != null ? o.child : s.child;
  f.ctc = kid ? TX.ctc : 0; f.care = kid && (o.care || got('rCare')) ? Math.round(TX.careRate * TX.careMaxOne) : 0;
  f.saver = LQ.saverCredit(f.agi, b.retire + b.roth, sp401, true);
  f.credits = Math.min(f.tax, f.ctc + f.care + f.saver);
  f.total = f.tax - f.credits + f.se;
  f.withheld = o.wh != null ? o.wh : s.wh2 != null ? s.wh2 : LQ.withhold2(0);
  f.diff = f.withheld - f.total;
  return f;
};
// The same household filing two separate returns, and what it would have paid as two single people.
LQ.finSplit = () => {
  const j = LQ.fin2({ itemize: false, noGifts: true, child: true, care: true }), b = j.b, w2 = b.kind === 'w2';
  const preP = Math.max(0, j.own - (j.adj) - STD.mfs), qbiP = w2 ? 0 : Math.round(TX.qbiRate * Math.min(b.profit - b.half, preP));
  const taxP = Math.round(LQ.taxOn(preP - qbiP, 'mfs').total), taxS = Math.round(LQ.taxOn(Math.max(0, j.spBox1 - STD.mfs), 'mfs').total);
  const preSingle = Math.max(0, j.own - j.adj - STD.single - j.ot), qbiSingle = w2 ? 0 : Math.round(TX.qbiRate * Math.min(b.profit - b.half, preSingle));
  const singles = Math.round(LQ.taxOn(preSingle - qbiSingle).total) + Math.round(LQ.taxOn(Math.max(0, j.spBox1 - STD.single)).total);
  return { joint: j, sepTax: taxP + taxS, sepTotal: taxP + taxS - TX.ctc + j.se, jointTotal: j.total, lostCare: j.care, lostOt: j.ot, singles, bonus: singles - j.tax };
};
LQ.cur = () => st().flags.married ? LQ.fin2() : LQ.fin();

// ---------- points
LQ.gain = (savvy, coins, why) => {
  const s = st(); s.savvy = Math.max(0, s.savvy + savvy); s.coins = Math.max(0, Math.round(s.coins + coins));
  const parts = []; if (savvy) parts.push((savvy > 0 ? '+' : '') + savvy + ' Savvy'); if (coins) parts.push((coins > 0 ? '+' : '') + Math.round(coins) + ' coins');
  if (parts.length) ui.toast((why ? why + ': ' : '') + parts.join(', '));
};
LQ.score = (right) => {
  const s = st();
  if (right) { s.streak = (s.streak || 0) + 1; const bonus = s.streak >= 3 ? 5 : 0; LQ.gain(10 + bonus, 5, s.streak >= 3 ? 'Streak x' + s.streak : ''); }
  else { s.streak = 0; LQ.gain(-5, 0); }
};
// One-shot question (no retries). The first option is the correct one.
LQ.quiz = async (who, prompt, options, why) => {
  const order = LQ.shuffle(options.map((_, i) => i));
  const s = st(); s.asked++;
  const pick = order[await LQ.choose(who, prompt, order.map(i => options[i]))];
  if (pick === 0) { s.first++; LQ.audio.sfx('right'); LQ.score(true); return true; }
  LQ.audio.sfx('wrong'); LQ.shake(0.2); LQ.score(false);
  await LQ.say(who, 'The answer was: ' + options[0] + '. ' + (why || ''));
  return false;
};

// ---------- market gear
const finderNote = region => {
  const { count, hint } = LQ.finderStatus(LQ.REGIONS[region], LQ.world);
  return [count, hint].filter(Boolean).join('\n');
};
LQ.GEAR = [
  { id: 'ledger', name: 'Receipt Ledger', price: 40, desc: 'Good records win audits. With this ledger, one correct answer out of three is enough to pass.' },
  { id: 'guide', name: "Saver's Credit Guidebook", price: 120, desc: "Unlocks the Saver's Credit for qualifying retirement contributions. The 2026 income limit is $40,250 for single filers and $80,500 for joint filers." },
  { id: 'charity', name: 'Charity Lantern', price: 200, desc: 'Give $500 to charity. Starting in 2026, people who take the standard deduction can still deduct up to $1,000 of cash gifts. In the field it is a working lantern: it lights dark places and keeps Myth Wisps away.' },
  { id: 'miles', only: 'se', name: 'Mileage Logbook', price: 250, desc: 'Log 4,000 business miles. At the 2026 rates (72.5 cents, then 76 cents from July) that is a $2,970 write-off.' },
  { id: 'hsa', save: 1, name: 'HSA Flask', price: 300, desc: 'Put $2,000 in a Health Savings Account (2026 limit: $4,400 with a high-deductible health plan). Deductible going in, tax-free for qualified medical costs.' },
  { id: 'hearth', only: 'se', name: 'Home Office Hearth', price: 350, desc: 'Claim a 200 square foot home office the simple way: $5 per square foot, a $1,000 write-off.' },
  { id: 'chest', save: 1, name: 'Retirement Chestplate', price: 500, desc: 'Put $3,000 in a pre-tax retirement account: a 401(k) at work, or a traditional IRA if you are self-employed. It lowers your taxable income today.' },
  { id: 'roth', save: 1, name: 'Roth Amulet', price: 500, desc: 'Put $3,000 in a Roth IRA. No deduction today. Qualified withdrawals are tax-free. For shop owners with the Max-Out Mantle, this uses $3,000 of the same IRA limit.' },
  { id: 'mantle', save: 1, needs: 'chest', name: 'Max-Out Mantle', price: 1200, desc: 'Raises your Retirement Chestplate contribution to $7,500. For shop owners who own a Roth Amulet, the two IRAs share a cap, leaving $4,500 here.' },
  { id: 'abacus', name: 'Golden Abacus', price: 3000, desc: 'The mark of a true Tax Tycoon. Doubles your audit rewards and crowns your hero.' },
  { id: 'spyglass', coast: 1, name: 'Receipt Spyglass', price: 120, desc: 'Automatically names the nearest missing receipt and shows its direction in Shelter Coast.', status: () => finderNote('coast') },
  { id: 'plan529', coast: 1, save: 1, name: "Coral's 529 Plan", price: 400, desc: 'Open a 529 education savings plan for Coral. Adds 400 coins to your in-game savings. No federal deduction. In a real 529, withdrawals for qualified education expenses are generally tax-free.' },
  { id: 'cask', coast: 1, save: 1, needs: 'hsa', name: 'Family HSA Cask', price: 700, desc: 'Move to a family health plan and add $4,000 more to your HSA. The 2026 family limit is $8,750. Every dollar comes off your joint income.' },
  { id: 'anchor', coast: 1, save: 1, name: "Marlowe's 401(k) Anchor", price: 800, desc: 'Marlowe puts $4,000 of pay into the shipyard 401(k). Those wages never reach the joint return, and the savings are still yours.' },
  { id: 'rod', at: 'canyon', name: 'Dowsing Rod', price: 120, desc: 'Automatically names the nearest missing expense slip and shows its direction in Hustle Canyon.', status: () => finderNote('canyon') },
  { id: 'toolkit', at: 'canyon', name: 'Gig Tool Kit', price: 350, desc: 'Deduct $800 of gig tools under the small-purchase safe harbor. Eligible businesses can elect to expense up to $2,500 per invoice or item without an applicable financial statement.' },
  { id: 'sep', at: 'canyon', save: 1, name: 'SEP IRA Saddlebag', price: 600, desc: 'Put $1,200 of gig profit into a SEP IRA, a retirement account for the self-employed. It comes off your income now and grows untaxed until you retire.' },
  { id: 'munis', at: 'summit', save: 1, name: 'Muni Bond Lantern', price: 500, desc: 'Move your savings into municipal bonds. Their interest is generally free of federal income tax, so the $300 of bank interest is exempt from income tax. Tax-exempt interest can still be reported on a real return.' },
  { id: 'ring', at: 'summit', save: 1, name: "Marlowe's Roth Ring", price: 500, desc: 'Open a Roth IRA for Marlowe with $3,000. No deduction today. Adds 500 coins to savings and counts toward the Saver\'s Credit if your household qualifies. Qualified Roth withdrawals are tax-free.' },
  { id: 'stepup', at: 'summit', save: 1, needs: 'anchor', name: '401(k) Step-Up Crampons', price: 900, desc: "Raise Marlowe's 401(k) contribution by another $3,000. Those wages never reach the joint return." },
];
LQ.gearFor = () => LQ.GEAR.filter(g => (!g.only || g.only === LQ.career().kind) && (!g.coast || st().region === 'coast') && (!g.at || g.at === st().region));
const shopDoc = { item: null, choiceRows: 8, draw(c) {
  const g = this.item; if (!g) return;
  ui.panel(c, 30, 16, 900, 148, '#1b2044');
  ui.text(c, g.name, 52, 26, '#ffe98a', F(14, true), 'left', 682);
  ui.text(c, LQ.has(g.id) ? 'OWNED' : g.price + ' coins', 908, 24, LQ.has(g.id) ? '#7fd6a8' : '#fdf8e7', F(28), 'right');
  c.font = F(24); ui.wrap(c, g.desc, 850).forEach((ln, i) => ui.text(c, ln, 52, 54 + i * 25, '#c9cdea', F(24)));
} };
const SHOP_HELLO = {
  coast: ['shop2Seen', 'Welcome to the Driftwood Bazaar! I stock everything Saffron sells up north, plus a few things for a growing household. Read the item descriptions before you spend.'],
  canyon: ['shop3Seen', 'Welcome to the Trading Post! The usual tax advantages, plus a few things for people who work for themselves. Read the item descriptions before you spend.'],
  summit: ['shop4Seen', 'Welcome to the Summit Outfitter! The usual tax advantages, plus a few things for investors. Read the item descriptions before you spend.'],
};
LQ.shop = async who => {
  const hello = SHOP_HELLO[st().region] || ['shopSeen', 'Welcome to the Saffron Bazaar! I have savings gear and supplies for the field. Check what each item does before you spend.'], seen = hello[0];
  await LQ.say(who, st().flags[seen] ? 'Back for more? Pick an item to see what it does.' : hello[1]);
  st().flags[seen] = true;
  for (;;) {
    const items = LQ.gearFor(), extras = LQ.shopExtras ? LQ.shopExtras() : []; shopDoc.item = items[0]; ui.doc = shopDoc;
    const i = await LQ.choose(who, 'You have ' + st().coins + ' coins.', items.map(g => (LQ.has(g.id) ? '[owned] ' : '') + g.name + '  -  ' + g.price).concat(extras.map(x => x.label), 'Leave'), s => { shopDoc.item = items[s] || null; });
    ui.doc = null;
    if (i >= items.length && i < items.length + extras.length) { await extras[i - items.length].run(who); continue; }
    const g = items[i]; if (!g) break;
    if (LQ.has(g.id)) { await LQ.say(who, 'You already own that one.'); continue; }
    if (g.needs && !LQ.has(g.needs)) { await LQ.say(who, 'That one only works with the ' + LQ.GEAR.find(x => x.id === g.needs).name + '. Buy that first.'); continue; }
    if (st().coins < g.price) { await LQ.say(who, 'You are ' + (g.price - st().coins) + ' coins short. Answer well, pass audits, and invest wisely. Come back richer.'); continue; }
    ui.doc = shopDoc;
    const confirm = await LQ.choose(who, `${g.name} costs ${g.price} coins. You will have ${st().coins - g.price} left.`, ['Back', 'Buy ' + g.name]);
    ui.doc = null;
    if (confirm === 0) continue;
    const before = LQ.cur().total;
    const back = LQ.bazaarOff && LQ.bazaarOff() ? Math.round(g.price * .1) : 0;
    st().coins -= g.price - back; st().gear.push(g.id); LQ.audio.sfx('fanfare');
    const saved = before - LQ.cur().total;
    if (!st().journal.includes('gearTiming')) LQ.learn('gearTiming');
    LQ.save();
    const effect = saved === 0 ? '' : ` Your ${st().q4 === 9 ? 'modeled' : 'projected'} federal tax ${saved > 0 ? 'fell' : 'rose'} by ${M(Math.abs(saved))}.`;
    await LQ.say(who, 'Sold! ' + g.name + ' is yours.' + effect + (g.save ? ' The price you paid now counts toward your in-game savings.' : '') + (back ? ` Granny Maple's tenth: ${back} coins back.` : ''));
  }
  await LQ.say(who, 'Safe travels.');
};

// ---------- brokerage
LQ.STOCKS = [
  { id: 'CRUM', name: 'Crumb & Crust Bakery', p: 48, vol: .05, drift: .012, div: 0,
    up: 'Festival season! Crumb & Crust wins the big pie order.', down: 'Flour prices spike. Crumb & Crust margins are squeezed.' },
  { id: 'THRN', name: "Thorn's Armory", p: 72, vol: .05, drift: .010, div: .02,
    up: "The Guild orders 200 new shields from Thorn's Armory.", down: 'Peace treaty signed. Fewer swords needed, says Thorn.' },
  { id: 'PGN', name: 'Pigeon Post', p: 36, vol: .06, drift: .008, div: .03,
    up: 'Tax season nears. Pigeon Post braces for record mail.', down: 'Pigeon flu grounds half the Pigeon Post flock.' },
  { id: 'QUIL', name: 'Quill & Coin Co.', p: 110, vol: .025, drift: .008, div: .04,
    up: 'Quill & Coin signs payroll deals with three new villages.', down: 'Ink shortage slows Quill & Coin deliveries.' },
  { id: 'BRKT', name: 'Bracket Mtn Mining', p: 24, vol: .15, drift: 0, div: 0,
    up: 'Prospectors report a silver vein on Bracket Mountain.', down: 'Fog thickens. Bracket Mountain Mining halts digging.' },
  { id: 'LDGR', name: 'Ledgerlands Index Fund', p: 90, vol: .012, drift: .014, div: .02 },
  { id: 'TIDE', coast: 1, name: 'Tidewater Shipyard', p: 64, vol: .05, drift: .011, div: .02,
    up: 'Tidewater Shipyard wins the contract for three new ferries.', down: 'A storm tears up the Tidewater slipway. Launches are delayed.' },
  { id: 'SALT', coast: 1, name: 'Salty Pearl Cannery', p: 40, vol: .04, drift: .007, div: .05,
    up: 'Record sardine run! The Salty Pearl Cannery adds a night shift.', down: 'Tin prices jump. The Salty Pearl Cannery raises prices and loses orders.' },
  { id: 'LAMP', coast: 1, name: 'Lantern Works', p: 20, vol: .14, drift: 0, div: 0,
    up: 'Lantern Works unveils a lamp that burns twice as long.', down: 'Something haunts the Old Lighthouse. Lantern Works loses its biggest customer.' },
  { id: 'IRON', at: 'canyon', name: 'Ironwood Mining Co.', p: 56, vol: .05, drift: .010, div: .02,
    up: 'Ironwood Mining strikes copper in the east wall.', down: 'A rockslide closes the Ironwood main shaft for repairs.' },
  { id: 'MESA', at: 'canyon', name: 'Mesa Outfitters', p: 44, vol: .04, drift: .008, div: .04,
    up: 'Gig season! Mesa Outfitters sells out of saddlebags.', down: 'A dry summer keeps travelers away from Mesa Outfitters.' },
  { id: 'DUST', at: 'canyon', name: 'Dust Devil Couriers', p: 18, vol: .14, drift: 0, div: 0,
    up: 'Dust Devil Couriers wins the canyon mail route.', down: 'Bandits in the Gulch keep robbing Dust Devil Couriers.' },
  { id: 'LIFT', at: 'summit', name: 'Summit Lift Co.', p: 105, vol: .03, drift: .009, div: .03,
    up: 'Record snowfall. Summit Lift Co. runs every chair.', down: 'High winds shut the Summit Lift for a week.' },
  { id: 'PEAK', at: 'summit', name: 'Peak Provisions', p: 38, vol: .04, drift: .007, div: .05,
    up: 'Peak Provisions signs a deal to supply every lodge on the mountain.', down: 'A late thaw spoils the Peak Provisions cold store.' },
  { id: 'GLCR', at: 'summit', name: 'Glacier Goldworks', p: 26, vol: .15, drift: 0, div: 0,
    up: 'Glacier Goldworks reports flecks of gold in the meltwater.', down: 'A dragon on the peak scares the Glacier Goldworks crews off the ice.' },
];
const S = id => LQ.STOCKS.find(x => x.id === id);
LQ.price = id => Math.max(1, Math.round(st().prices[id]));
LQ.initMarket = () => {
  const s = st(); s.prices = {}; s.prev = {}; s.lots = {}; s.gazette = [];
  LQ.STOCKS.forEach(x => { s.prices[x.id] = x.p; s.prev[x.id] = x.p; s.lots[x.id] = []; });
  s.seed = Math.floor(Math.random() * 1e6); s.day = 0; makeNews();
};
// Older saves know nothing about newer stocks. Give them a price and an empty holding.
LQ.ensureMarket = () => {
  const s = st(); if (!s.prices) return LQ.initMarket();
  LQ.STOCKS.forEach(x => { if (s.prices[x.id] == null) { s.prices[x.id] = x.p; s.prev[x.id] = x.p; } if (!s.lots[x.id]) s.lots[x.id] = []; });
};
// Each exchange trades its own region's companies, plus the index fund.
const home = x => x.at || (x.coast ? 'coast' : 'village');
LQ.exchange = () => LQ.STOCKS.filter(x => x.id === 'LDGR' || home(x) === st().region);
LQ.stocksKnown = () => LQ.STOCKS.filter(x => { const h = home(x), s = st(); return h === 'village' || (h === 'coast' && s.q2 != null) || (h === 'canyon' && s.q3 != null) || (h === 'summit' && s.q4 != null); });
LQ.EXCHANGE_NAME = { village: 'VILLAGE EXCHANGE', coast: 'HARBOR EXCHANGE', canyon: 'CANYON EXCHANGE', summit: 'SUMMIT EXCHANGE' };
LQ.stockVenue = stock => stock.id === 'LDGR' ? 'any exchange' : LQ.EXCHANGE_NAME[home(stock)];
function makeNews() {
  const s = st(), pool = LQ.stocksKnown().filter(x => x.up), pick = pool[Math.floor(LQ.hash(s.day, 3, s.seed) * pool.length)], up = LQ.hash(s.day, 4, s.seed) > .42;
  s.news = { id: pick.id, pct: (up ? 1 : -1) * (.12 + LQ.hash(s.day, 5, s.seed) * .12), text: up ? pick.up : pick.down };
  s.gazette.unshift(s.news.text); s.gazette = s.gazette.slice(0, 4);
}
// One market day. News printed yesterday moves its stock today.
LQ.tick = () => {
  const s = st(); if (!s.prices) return; s.day++;
  LQ.STOCKS.forEach((x, i) => {
    if (s.prices[x.id] == null) return;
    let r = x.drift + (LQ.hash(s.day, i, s.seed) - .5) * 2 * x.vol;
    if (s.news && s.news.id === x.id) r += s.news.pct;
    s.prev[x.id] = s.prices[x.id]; s.prices[x.id] = Math.max(2, s.prices[x.id] * (1 + r));
  });
  makeNews();
};
LQ.shares = id => (st().lots && st().lots[id] || []).reduce((a, l) => a + l.n, 0);
LQ.portfolio = () => st().prices ? LQ.STOCKS.reduce((a, x) => a + (st().prices[x.id] == null ? 0 : LQ.shares(x.id) * LQ.price(x.id)), 0) : 0;
LQ.netWorth = () => st().coins + LQ.portfolio() + LQ.GEAR.filter(g => g.save && LQ.has(g.id)).reduce((a, g) => a + g.price, 0);
LQ.rank = () => { const n = LQ.netWorth() + st().savvy; return LQ.has('abacus') || n >= 4000 ? 'Tax Tycoon' : n >= 2200 ? 'Master Filer' : n >= 1200 ? 'Journeyman Filer' : 'Apprentice Filer'; };
// A year passes: steady growth, dividends, and every lot you hold becomes long-term.
LQ.yearPass = () => {
  const s = st(); if (!s.prices) return 0; let div = 0;
  LQ.STOCKS.forEach((x, i) => {
    if (s.prices[x.id] == null) return;
    s.prev[x.id] = s.prices[x.id]; s.prices[x.id] *= 1 + x.drift * 8 + (LQ.hash(77, i, s.seed) - .4) * x.vol * 3;
    div += LQ.shares(x.id) * LQ.price(x.id) * x.div; s.lots[x.id].forEach(l => { l.lt = true; });
  });
  div = Math.round(div); const tax = Math.round(div * LQ.ltRate());
  s.coins += div - tax; s.divs = (s.divs || 0) + div; s.capTax = (s.capTax || 0) + tax;
  return { div, tax };
};
LQ.ltZeroMax = () => st().flags.married ? TX.ltcgZeroMaxJoint : TX.ltcgZeroMax;
LQ.ltRate = () => LQ.cur().taxable <= LQ.ltZeroMax() ? 0 : 0.15;
LQ.buy = (id, n) => { const s = st(), p = LQ.price(id); n = Math.min(n, Math.floor(s.coins / p)); if (n <= 0) return 0; s.coins -= n * p; s.lots[id].push({ n, cost: p, lt: false }); return n; };
// Sell oldest shares first. Capital gains tax is settled on the spot so you feel it.
LQ.sell = (id, n) => {
  const s = st(), p = LQ.price(id), lots = s.lots[id]; let left = Math.min(n, LQ.shares(id)), sold = 0, stG = 0, ltG = 0;
  while (left > 0 && lots.length) { const l = lots[0], k = Math.min(left, l.n), g = k * (p - l.cost); if (l.lt) ltG += g; else stG += g; l.n -= k; left -= k; sold += k; if (!l.n) lots.shift(); }
  let net = stG + ltG, used = 0, tax = 0;
  // Chapter 4: sales are recorded and settled on the return, the way it really works.
  if (LQ.deferGains && LQ.deferGains()) { s.inv.st += stG * LQ.COIN_USD; s.inv.lt += ltG * LQ.COIN_USD; s.coins += sold * p; return { sold, proceeds: sold * p, stG, ltG, net, used: 0, tax: 0, deferred: true }; }
  if (net < 0) s.lossBank = (s.lossBank || 0) - net;
  else {
    used = Math.min(s.lossBank || 0, net); s.lossBank = (s.lossBank || 0) - used;
    let stT = Math.max(0, stG), ltT = Math.max(0, ltG), off = used + Math.max(0, -stG) + Math.max(0, -ltG);
    const a = Math.min(stT, off); stT -= a; off -= a; ltT = Math.max(0, ltT - off);
    tax = Math.round(stT * LQ.cur().top + ltT * LQ.ltRate());
  }
  s.coins += sold * p - tax; s.capTax = (s.capTax || 0) + tax;
  return { sold, proceeds: sold * p, stG, ltG, net, used, tax };
};
const brokerDoc = { sel: 0, draw(c) {
  const s = st(), stocks = LQ.exchange(), rowHeight = 22;
  ui.panel(c, 30, 16, 900, 40 + stocks.length * rowHeight, '#101a2e');
  ui.text(c, LQ.EXCHANGE_NAME[s.region], 50, 26, '#7fd6a8', F(11, true)); ui.text(c, 'Day ' + s.day + '    Cash ' + s.coins + '    Holdings ' + LQ.portfolio(), 910, 20, '#fdf8e7', F(24), 'right', 590);
  stocks.forEach((x, i) => {
    const y = 48 + i * rowHeight, p = LQ.price(x.id), ch = (s.prices[x.id] / s.prev[x.id] - 1) * 100, n = LQ.shares(x.id);
    if (i === this.sel) { c.fillStyle = 'rgba(53,240,230,.15)'; c.fillRect(42, y - 1, 876, rowHeight); }
    ui.text(c, x.id, 52, y, '#ffe98a', F(24), 'left', 62); ui.text(c, x.name, 122, y, '#fdf8e7', F(24), 'left', 330);
    ui.text(c, String(p), 560, y, '#fdf8e7', F(24), 'right', 98);
    ui.text(c, (ch >= 0 ? '+' : '') + ch.toFixed(1) + '%', 660, y, ch >= 0 ? '#7fd6a8' : '#ff8a80', F(24), 'right', 92);
    ui.text(c, n ? n + ' sh' : '-', 760, y, '#c9cdea', F(24), 'right', 92);
    ui.text(c, x.div ? Math.round(x.div * 100) + '% div' : '', 908, y, '#8fa3c8', F(22), 'right');
  });
} };
LQ.broker = async who => {
  const s = st();
  const list = LQ.exchange();
  if ((s.region === 'canyon' || s.region === 'summit') && !s.flags['brokerSeen_' + s.region]) { s.flags['brokerSeen_' + s.region] = true; await LQ.say(who, 'Welcome. I trade the local companies and the index fund. Shares you bought in other towns are safe in your account, and the brokers there will still buy and sell them.'); }
  if (s.region === 'coast' && !s.flags.broker2Seen) { s.flags.broker2Seen = true; await LQ.say(who, 'Welcome to the Harbor Exchange. I trade the coast companies and the index fund. Your village shares are safe in your account, and Bex up north will still buy and sell them.'); }
  if (!s.flags.brokerSeen) {
    s.flags.brokerSeen = true;
    await LQ.say(who, (s.region === 'coast' ? 'A word on how this works.' : 'Welcome to the Village Exchange.') + ' This is a taxable brokerage account. Buy a share, and you own a slice of a real local business.');
    await LQ.say(who, 'Two rules of the road. One: the Gazette on the notice board prints news a day before prices react, so read it. Two: when you sell for a gain, the taxman takes a cut. Hold for more than a year and you may get a lower rate.');
    LQ.learn('brokerage');
  }
  await LQ.say(who, "Today's Gazette: " + (s.news ? s.news.text : 'No news.') + ' Prices react tomorrow.');
  for (;;) {
    brokerDoc.sel = 0; ui.doc = brokerDoc;
    const i = await LQ.choose(who, 'Which one?', list.map(x => x.id + '  ' + x.name).concat('Leave'), k => { brokerDoc.sel = k; });
    const x = list[i]; if (!x) break;
    brokerDoc.sel = i;
    const p = LQ.price(x.id), have = LQ.shares(x.id), can = Math.floor(s.coins / p);
    const acts = [['Buy 1', () => LQ.buy(x.id, 1)], ['Buy 5', () => can >= 5 ? LQ.buy(x.id, 5) : 0], ['Buy as many as I can (' + can + ')', () => LQ.buy(x.id, can)]];
    const a = await LQ.choose(who, x.name + ' at ' + p + ' coins. You hold ' + have + '.', acts.map(q => q[0]).concat(have ? ['Sell 1', 'Sell all (' + have + ')'] : [], 'Back'));
    if (a < 3) { const n = acts[a][1](); if (n) LQ.save(); LQ.audio.sfx(n ? 'coin' : 'wrong'); await LQ.say(who, n ? 'Bought ' + n + ' share' + (n > 1 ? 's' : '') + ' of ' + x.id + ' for ' + n * p + ' coins.' : 'Not enough coins for that.'); }
    else if (have && a < 5) {
      const r = LQ.sell(x.id, a === 3 ? 1 : have); LQ.save(); LQ.audio.sfx('coin');
      const f = LQ.cur(); let msg = 'Sold ' + r.sold + ' for ' + r.proceeds + ' coins. ';
      if (r.deferred) msg += (r.net === 0 ? 'No gain and no loss.' : (r.net > 0 ? 'A gain of ' + r.net : 'A loss of ' + (-r.net)) + ' coins, ' + (r.ltG !== 0 && r.stG === 0 ? 'long-term' : r.stG !== 0 && r.ltG === 0 ? 'short-term' : 'part short-term and part long-term') + '.') + ' No tax today. I have recorded it for Schedule D, and it is settled when you file. Each coin counts as ' + M(LQ.COIN_USD) + ' on the form.';
      else if (r.net < 0) msg += 'That is a loss of ' + (-r.net) + '. I have banked it. Losses cancel out future gains, so it is not wasted.';
      else if (r.net === 0) msg += 'No gain, no tax.';
      else {
        const terms = [r.stG > 0 ? 'short-term gains at ' + Math.round(f.top * 100) + '%' : '', r.ltG > 0 ? 'long-term gains at ' + Math.round(LQ.ltRate() * 100) + '%' : ''].filter(Boolean).join(' and ');
        msg += 'Gain: ' + r.net + (r.used ? ', minus ' + r.used + ' of banked losses' : '') + '. The exchange uses a simplified rate: ' + terms + '. Tax: ' + r.tax + ' coins.';
      }
      await LQ.say(who, msg);
    }
  }
  ui.doc = null;
};
})();
