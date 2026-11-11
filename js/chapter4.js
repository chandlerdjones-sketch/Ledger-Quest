// Chapter 4 content: the Summit of Gains. Basis, holding periods, dividends, loss harvesting, how gains stack, and account types.
(() => {
const LQ = window.LQ, F = LQ.F, ui = LQ.ui, D = LQ.docs, M = n => LQ.money(n);
const say = LQ.say, ask = LQ.ask, choose = LQ.choose;
const TX = LQ.TAX, GIGS = LQ.GIGS;
const st = () => LQ.state, pct = r => Math.round(r * 100) + '%';
const isOwner = () => LQ.career().kind === 'se';
const q4 = () => st().q4 == null ? -1 : st().q4;
const ZERO = TX.ltcgZeroMaxJoint;
// The family's scripted positions. Dollar figures, the same scale as the rest of the return.
const OPAL = { paid: 400, atDeath: 3600, sold: 4200, gain: 600 };
const GL = { cost: 6000, worth: 10000, gain: 4000 };
const AV = { cost: 7000, worth: 4500, loss: 2500 };
const DIV = 900, INT = 300, SAVE = 3000;

// ---------- cast
const P = (id, name, tx, ty, look, dir = 'down', extra) => Object.assign({ id, name, tx, ty, dir, look: Object.assign({ id: 'c4' + id }, look) }, extra);
const NPC_LIST = [
  P('marlowe', 'Marlowe', 9, 29, { hair: '#7a4a2a', shirt: '#3b6fd4', pants: '#5a4630', trim: '#f3f0e6', skin: '#c98d62', hat: 'cap', hatColor: '#c9423a' }),
  P('coral', 'Coral', 11, 29, { hair: '#7a4a2a', long: 1, shirt: '#e86a9a', pants: '#e86a9a', skin: '#c98d62', hat: 'cap', hatColor: '#f3d24a' }, 'down', { small: true }),
  P('garnet', 'Assayer Garnet', 9, 19, { hair: '#a8452c', long: 1, shirt: '#8a2a3a', robe: 1, trim: '#f3d24a' }),
  P('frost', 'Timekeeper Frost', 17, 19, { hat: 'top', hair: '#e8e8f0', beard: '#e8e8f0', shirt: '#3a5a8a', pants: '#22304f', trim: '#c9d2e3' }),
  P('birch', 'Bursar Birch', 31, 19, { hair: '#e8c45a', shirt: '#2f8a6a', pants: '#22304f', trim: '#f3d24a', skin: '#e2b184' }),
  P('larch', 'Ranger Larch', 39, 19, { hat: 'cap', hatColor: '#3d7a5a', hair: '#3a2a1c', beard: '#3a2a1c', shirt: '#3d7a5a', pants: '#5a4630', skin: '#b87a52' }),
  P('cirrus', 'Hermit Cirrus', 40, 22, { hair: '#e8e8f0', long: 1, beard: '#e8e8f0', shirt: '#8a8a96', robe: 1, trim: '#f3f0e6' }, 'left'),
  P('tamsin', 'Guide Tamsin', 15, 29, { hat: 'cap', hatColor: '#c9781c', hair: '#231a36', long: 1, shirt: '#c9781c', pants: '#3a3550', trim: '#f3f0e6', skin: '#b87a52' }),
  P('alpen', 'Clerk Alpenglow', 35, 29, { hair: '#d98ab8', long: 1, shirt: '#2a3a6e', robe: 1, trim: '#f3d24a' }),
  P('trader', 'Trader Piton', 20, 24, { hat: 'cap', hatColor: '#3b6fd4', hair: '#8a8a96', shirt: '#e0564e', robe: 1, trim: '#f3d24a' }),
  P('broker', 'Broker Crevasse', 27, 24, { hat: 'top', hair: '#231a36', shirt: '#4a2374', pants: '#231a36', trim: '#d8b4ff', skin: '#c98d62' }),
  P('nimbus', 'Lady Nimbus', 12, 23, { hair: '#e8e8f0', long: 1, shirt: '#7b4bb8', robe: 1, trim: '#f3d24a' }),
  P('ada', 'Index Ada', 36, 22, { hair: '#231a36', long: 1, shirt: '#2fa39a', pants: '#3a3550', trim: '#f3f0e6', skin: '#b87a52' }),
  P('gramps', 'Grandpa Scree', 18, 33, { hair: '#e8e8f0', beard: '#e8e8f0', shirt: '#6a8a4a', pants: '#5a4630', hat: 'cap', hatColor: '#5a4630' }),
  P('sorrel', 'Medic Sorrel', 27, 19, { hair: '#c8742c', shirt: '#f3f0e6', pants: '#c9423a', trim: '#c9423a' }),
  P('bell', 'Sister Bellwether', 10, 33, { hair: '#3a2a1c', long: 1, shirt: '#f3f0e6', robe: 1, trim: '#58a8c8', skin: '#c98d62' }),
  P('flake', 'Clerk Flake', 30, 33, { hair: '#8a7a3a', shirt: '#5d6478', pants: '#3a3550', trim: '#f3f0e6' }),
  P('bit', 'Tinker Bit', 12, 19, { hat: 'cap', hatColor: '#e0a02c', hair: '#a8452c', shirt: '#22304f', pants: '#3a3550', trim: '#7fd6a8' }),
  P('curio', 'Collector Curio', 22, 38, { hat: 'top', hair: '#4a4a56', beard: '#4a4a56', shirt: '#b5503c', pants: '#3a3550', trim: '#f3d24a' }, 'right'),
];
const N = {}; NPC_LIST.forEach(n => { N[n.id] = n; });

LQ.QUESTS4 = [
  { short: 'Find Marlowe', text: 'Find Marlowe at the Summit Lodge (south-west)', target: 'marlowe' },
  { short: 'Learn your basis', text: 'See Assayer Garnet at the Assay House (north-west)', target: 'garnet' },
  { short: 'Short-term or long-term?', text: 'See Timekeeper Frost at the Clock Tower', target: 'frost' },
  { short: 'Collect your dividends', text: 'See Bursar Birch at the Summit Bank (north-east)', target: 'birch' },
  { short: 'Harvest a loss', text: 'See Ranger Larch at the Avalanche Station', target: 'larch' },
  { short: 'See how gains stack', text: 'Find Hermit Cirrus by the east road', target: 'cirrus' },
  { short: 'Choose your accounts', text: 'See Guide Tamsin at Base Camp (south-west)', target: 'tamsin' },
  { short: 'Defeat Glint the Dragon', text: 'Climb to the peak and face the Hot-Tip Dragon', target: 'boss4' },
  { short: 'File with Schedule D', text: 'File with Clerk Alpenglow at the Summit Tax Office', target: 'alpen' },
  { short: 'The Ledgerlands are yours', text: 'Ledger Quest complete! Every region is open', target: null },
];

Object.assign(LQ.JOURNAL, {
  realize4: { title: 'Gains on the return', text: 'An investment that has gone up is not taxed while you hold it. You owe tax in the year you sell. Your broker reports each sale on Form 1099-B by mid-February, you list them on Form 8949, and the totals go on Schedule D of your return.' },
  basis4: { title: 'Cost basis', text: 'Your basis is what an investment cost you: the price you paid, plus fees, plus any dividends you reinvested. Your gain or loss is what you sold it for minus your basis. A higher basis means a smaller taxable gain, so keep the records.' },
  stepup4: { title: 'Inherited and gifted shares', text: 'When you inherit an investment, your basis steps up to its value on the day the owner died, so the growth during their lifetime is never taxed as a gain. Inherited property always counts as long-term. A gift made during life is different: you take over the giver\'s original basis.' },
  holding4: { title: 'Short-term and long-term', text: 'A gain is long-term if you held the investment for more than one year, counting from the day after you bought it. Long-term gains are taxed at 0%, 15%, or 20%. A short-term gain, held one year or less, is taxed like wages at your ordinary rate.' },
  dividends4: { title: 'Dividends', text: 'Dividends are taxable in the year they are paid, even if you reinvest them automatically and never see the cash. Reinvested dividends add to your basis. Most dividends from ordinary company shares held more than 60 days are qualified, and qualified dividends are taxed at the long-term gain rates. They arrive on Form 1099-DIV.' },
  interest4: { title: 'Interest', text: 'Interest from savings accounts, certificates of deposit, and most bonds is taxed like wages, at your ordinary rate. It arrives on Form 1099-INT. Interest from municipal bonds is generally free of federal income tax.' },
  harvest4: { title: 'Tax-loss harvesting', text: 'Selling an investment at a loss turns the loss into something useful. Losses cancel out gains first. If losses are larger than gains, up to $3,000 of the rest comes off your other income each year, and anything beyond that carries forward to later years with no time limit.' },
  washsale4: { title: 'The wash sale rule', text: 'If you sell at a loss and buy the same or a substantially identical investment within 30 days before or after the sale, the loss is disallowed for now. It is added to the basis of the new shares instead. To keep the loss, wait 31 days, or buy something similar but not identical.' },
  stack4: { title: 'How gains stack', text: 'On the return, your ordinary income fills the brackets first. Long-term gains and qualified dividends sit on top of it and are taxed at their own rates. A large long-term gain never raises the rate on your wages.' },
  zero4: { title: 'The 0% zone', text: 'For 2026, long-term gains and qualified dividends are taxed at 0% as long as your taxable income stays at or under $98,900 on a joint return, or $49,450 for a single filer. Above that the rate is 15%, and 20% only above $613,700 on a joint return.' },
  accounts4: { title: 'Four kinds of account', text: 'A taxable account is taxed every year on dividends, interest, and sales. A traditional 401(k) or IRA takes money before tax, grows untaxed, and is taxed as income when you take it out. A Roth takes money after tax, grows untaxed, and comes out tax-free in retirement. An HSA is untaxed going in, growing, and coming out for medical costs.' },
  location4: { title: 'What goes where', text: 'Hold investments that throw off a lot of taxable income every year, such as bonds and high-dividend funds, inside tax-sheltered accounts. Hold broad index funds you plan to keep for years in the taxable account, where they are taxed lightly. The same investments can cost less in tax just by sitting in the right account.' },
  tip4Reinvest: { title: 'Tip: reinvested dividends', text: 'Every reinvested dividend buys new shares and adds to your basis. If you forget them when you sell, you pay tax on the same money twice.' },
  tip4B: { title: 'Tip: check your 1099-B', text: 'Form 1099-B lists each sale and the basis your broker has on record. For shares that were inherited, gifted, or moved from another broker, that basis may be missing or wrong. Correct it on Form 8949.' },
  tip4Day: { title: 'Tip: a year and a day', text: 'The holding period starts the day after you buy. Sell exactly one year after the purchase date and the gain is still short-term. Wait one more day.' },
  pro4Niit: { title: 'Pro: the investment income surtax', text: 'High earners pay an extra 3.8% Net Investment Income Tax on interest, dividends, and gains. It applies once income passes $250,000 on a joint return or $200,000 for a single filer, and those thresholds do not rise with inflation.' },
  pro4Index: { title: 'Pro: index funds and taxes', text: 'A fund that trades often passes its gains to you every year as capital gain distributions, and you owe tax on them even if you never sold a share. Broad index funds trade very little, so most of your gain waits untaxed until you sell.' },
  pro4Early: { title: 'Pro: taking money out early', text: 'Money taken from a traditional 401(k) or IRA before age 59 and a half is taxed as income and usually hit with an extra 10% tax. A Roth IRA is more forgiving: what you put in can come out at any time with no tax and no penalty. Only the earnings have to wait.' },
  pro4Hsa: { title: 'Pro: invest your HSA', text: 'An HSA is the only account that is untaxed three times: going in, growing, and coming out for medical costs. If you can pay today\'s medical bills from your pocket and keep the receipts, the HSA can stay invested for decades.' },
  pro4Donate: { title: 'Pro: give shares, not cash', text: 'If you itemize, giving shares you have held more than a year straight to a charity lets you deduct their full value, and nobody pays tax on the gain. Selling first and giving the cash means paying the gains tax yourself.' },
  pro4Lots: { title: 'Pro: choosing which shares to sell', text: 'Shares bought at different times are separate lots, each with its own basis and holding period. Unless you say otherwise, your broker sells the oldest first. You can tell the broker to sell specific lots, such as the ones with the highest basis.' },
  pro4Crypto: { title: 'Pro: digital coins are property', text: 'For tax, cryptocurrency and other digital assets are property, like shares. Selling them, trading one for another, or spending them is a sale with a gain or a loss. Your return asks about digital assets by name, and brokers now report sales on Form 1099-DA.' },
  pro4Collect: { title: 'Pro: collectibles', text: 'Long-term gains on collectibles such as trading cards, coins, art, and precious metals can be taxed at up to 28%, not the 15% most people pay on shares. Keep proof of what each piece cost you.' },
});
Object.assign(LQ.ITEMS, {
  chestkey: { name: "Opal's Brokerage Key", desc: 'Forty shares, fifty years, and one good note.' },
  basisbook: { name: 'Basis Ledger', desc: 'What it cost you is half of every gain.' },
  hourglass: { name: 'Year-and-a-Day Hourglass', desc: 'More than one year makes a gain long-term.' },
  forms4: { name: 'Forms 1099-DIV and 1099-INT', desc: 'Dividends and interest, taxed whether or not you spent them.' },
  sickle: { name: 'Harvest Sickle', desc: 'Losses cancel gains. Wait 31 days to buy back.' },
  cairn: { name: 'Stacking Stone', desc: 'Wages on the bottom, gains on top.' },
  ropes: { name: 'Account Ropes', desc: 'Taxable, traditional, Roth, HSA. Each knot different.' },
  medal4: { name: "Dragon's Scale", desc: 'Proof that you outlasted the Hot-Tip Dragon.' },
  return4: { name: 'Stamped Return with Schedule D', desc: 'Wages, a gig, and gains, all on one honest page.' },
});

// ---------- documents
const basisDoc = { show: 0, draw(c) {
  const L = (i, a, b, o) => D.line(c, 84, 66 + i * 38, 470, a, b, o), sh = this.show;
  D.paper(c, 60, 20, 840, 272, 'COST BASIS', 'Summit Lift Co., 40 inherited shares');
  L(0, 'Great-Aunt Opal paid, long ago', M(OPAL.paid)); L(1, 'Value on the day she died', M(OPAL.atDeath), { hl: sh === 1 });
  L(2, 'You sell today for', M(OPAL.sold)); D.rule(c, 84, 66 + 3 * 38 - 4, 470);
  L(3, 'Your taxable gain', sh > 1 ? M(OPAL.gain) : '________', Object.assign({ hl: sh === 2 }, D.GREEN));
  D.sideBox(c, 'WHERE BASIS COMES FROM', [['You bought it', 'what you paid', { size: 22 }], ['You inherited it', 'value at death', { size: 22 }], ['It was a gift', "giver's basis", { size: 22 }], 0, ['Gain', 'sale - basis', { size: 22 }]]);
} };
const holdDoc = { now: 0, wait: 0, pick: -1, draw(c) {
  const L = (i, a, b, o) => D.line(c, 84, 66 + i * 38, 470, a, b, o);
  D.paper(c, 60, 20, 840, 272, 'GLACIER GOLDWORKS', 'Bought 11 months ago');
  L(0, 'You paid', M(GL.cost)); L(1, 'Worth today', M(GL.worth)); L(2, 'Gain if sold', M(GL.gain), D.GREEN);
  D.rule(c, 84, 66 + 3 * 38 - 4, 470);
  L(3, 'Extra tax if sold today', M(this.now), Object.assign({ hl: this.pick === 1 }, D.RED)); L(4, 'Extra tax if sold next month', M(this.wait), Object.assign({ hl: this.pick === 0 }, D.GREEN));
  D.sideBox(c, 'THE HOLDING PERIOD', [['One year or less', 'short-term', { size: 22 }], ['taxed like', 'wages', Object.assign({ size: 22 }, D.RED)], 0, ['More than a year', 'long-term', { size: 22 }], ['taxed at', '0% or 15%', Object.assign({ size: 22 }, D.GREEN)]]);
} };
const divDoc = { hl: -1, qd: DIV, draw(c) {
  const L = (i, a, b, o) => D.line(c, 84, 66 + i * 38, 470, a, b, o);
  D.paper(c, 60, 20, 840, 272, 'FORMS 1099-DIV AND 1099-INT', 'Simplified  ' + TX.year);
  L(0, '1099-DIV  1a  Total dividends', M(this.qd)); L(1, '1099-DIV  1b  Qualified dividends', M(this.qd), { hl: this.hl === 0 });
  L(2, '1099-INT  1   Interest income', M(INT), { hl: this.hl === 1 });
  D.sideBox(c, 'HOW EACH IS TAXED', [['Qualified div.', '0% or 15%', Object.assign({ size: 22 }, D.GREEN)], ['Long-term gain', '0% or 15%', Object.assign({ size: 22 }, D.GREEN)], 0, ['Interest', 'like wages', Object.assign({ size: 22 }, D.RED)], ['Short-term gain', 'like wages', Object.assign({ size: 22 }, D.RED)]]);
} };
const harvDoc = { saved: 0, pick: -1, draw(c) {
  const L = (i, a, b, o) => D.line(c, 84, 66 + i * 38, 470, a, b, o);
  D.paper(c, 60, 20, 840, 272, 'AVALANCHE AIRSHIPS', 'Bought 5 months ago');
  L(0, 'You paid', M(AV.cost)); L(1, 'Worth today', M(AV.worth)); L(2, 'Loss if sold', '-' + M(AV.loss), D.RED);
  D.rule(c, 84, 66 + 3 * 38 - 4, 470);
  L(3, 'Tax saved this year by selling', M(this.saved), Object.assign({ hl: this.pick === 0 }, D.GREEN));
  D.sideBox(c, 'THE WASH SALE RULE', [['Sell at a loss', '', { size: 22 }], ['and buy it back', '', { size: 22 }], ['within 30 days', '', { size: 22 }], 0, ['The loss is', 'not allowed', Object.assign({ size: 22, hl: this.pick === 2 }, D.RED)]]);
} };
const stackDoc = { draw(c) {
  const f = LQ.fin4(), x0 = 100, w = 760, max = Math.max(f.ord + f.pref, ZERO) * 1.12, X = v => x0 + w * v / max, y = 122, h = 50;
  D.paper(c, 60, 20, 840, 272, 'HOW GAINS STACK', 'Your joint return');
  c.fillStyle = '#3b6fd4'; c.fillRect(x0, y, X(f.ord) - x0, h);
  c.fillStyle = '#1f8a5c'; c.fillRect(X(f.ord), y, X(f.ord + f.at0) - X(f.ord), h);
  c.fillStyle = '#c9781c'; c.fillRect(X(f.ord + f.at0), y, X(f.ord + f.pref) - X(f.ord + f.at0), h);
  c.strokeStyle = '#3a2f1c'; c.lineWidth = 2; c.strokeRect(x0, y, X(f.ord + f.pref) - x0, h);
  const zx = X(ZERO); c.fillStyle = '#b0332e'; c.fillRect(zx - 1, y - 26, 3, h + 40);
  c.font = F(22); c.textBaseline = 'top'; c.textAlign = 'center'; c.fillText('0% zone ends at ' + M(ZERO) + ' of taxable income', LQ.clamp(zx, 330, 630), y - 52);
  c.textAlign = 'left'; c.fillStyle = '#3b6fd4'; c.fillText('Wages and business income, after deductions: ' + M(f.ord), x0, y + h + 24);
  c.fillStyle = '#1f8a5c'; c.fillText('Long-term gains and qualified dividends taxed at 0%: ' + M(f.at0), x0, y + h + 48);
  c.fillStyle = '#c9781c'; c.fillText('Long-term gains and qualified dividends taxed at 15%: ' + M(f.at15), x0, y + h + 72);
} };
const ACCTS = [['Taxable brokerage', 'after tax', 'taxed every year', 'gains are taxed'], ['Traditional 401(k), IRA', 'before tax', 'untaxed', 'taxed as income'], ['Roth IRA, Roth 401(k)', 'after tax', 'untaxed', 'tax-free'], ['HSA', 'before tax', 'untaxed', 'tax-free for medical']];
const acctDoc = { hl: -1, draw(c) {
  D.paper(c, 60, 20, 840, 272, 'FOUR KINDS OF ACCOUNT', 'Simplified');
  const X = [84, 372, 532, 700];
  c.textBaseline = 'top'; c.textAlign = 'left'; c.font = F(10, true); c.fillStyle = '#7a6a48';
  ['ACCOUNT', 'GOING IN', 'GROWING', 'COMING OUT'].forEach((t, i) => c.fillText(t, X[i], 68));
  ACCTS.forEach((r, j) => {
    const y = 96 + j * 44;
    if (j === this.hl) { c.fillStyle = `rgba(255,205,50,${.4 + .22 * Math.sin(LQ.time * 6)})`; c.fillRect(76, y - 3, 808, 32); }
    c.font = F(24); r.forEach((t, i) => { c.fillStyle = i === 0 ? '#2c2416' : /untaxed|tax-free|before/.test(t) ? '#1f6f5c' : '#b0332e'; c.fillText(t, X[i], y, (X[i + 1] ?? 884) - X[i] - 12); });
  });
} };

// ---------- quest scripts
const advance4 = () => {
  const s = st(); s.q4++; LQ.audio.sfx('fanfare'); ui.toast('New quest: ' + LQ.QUESTS4[s.q4].short);
  const c = LQ.career(), base = c.kind === 'se' ? c.pay - 35 + Math.floor(LQ.hash(s.day, 9, s.seed) * 90) : c.pay;
  LQ.gain(0, base + 90, 'Payday and gig money'); LQ.tick();
};

async function begin() {
  const s = st(); s.q4 = 0; s.inv = { st: 0, lt: 0, qd: 0, int: 0 };
  const div = LQ.yearPass4();
  await say(null, 'A year later. The gig is steady, the estimates go out every quarter, and for the first time there is money left over at the end of the month.');
  await say(null, "Then a letter arrives from the Summit of Gains. Marlowe's great-aunt Opal, who ran the lift company up there for fifty years, has died and left the family her brokerage chest.");
  await say(null, 'Investing has its own tax rules, and they reward patience. Marlowe and Coral have gone on ahead. Find them at the Summit Lodge, on the south-west side of town.');
  if (div) ui.toast('A year of dividends: +' + div + ' coins, recorded for your return');
}
async function qMarlowe() {
  await say(N.marlowe, 'You made it! Coral has ridden the lift four times and has asked to live here.');
  await say(N.marlowe, "Aunt Opal's chest is in the lodge. Inside are forty shares of the Summit Lift Co., bought when the lift was a rope and a mule. And a note: \"Sell them, enjoy them, and learn the rules first.\"");
  await say(N.marlowe, 'We also have the two positions we bought ourselves last year. Glacier Goldworks has done well. Avalanche Airships has not. On top of that, the family index fund pays dividends and the savings account pays interest.');
  await ask(N.marlowe, `Glacier Goldworks is up ${M(GL.gain)} and we have not sold a share. How much tax do we owe on that gain so far?`, ['None. A gain is taxed when we sell', `Tax on ${M(GL.gain)}, every year it stays up`, 'Half now and half when we sell'],
    { wrong: ['A price going up is not income yet. Nothing is owed until we sell.', 'There is no halfway. The tax arrives with the sale.'] });
  await say(N.marlowe, 'That is what the broker told me too. And here is the part I only learned this week. In real life nobody takes the tax at the counter. Every sale in the year is written down, and it is all settled on Schedule D when we file.');
  await say(N.marlowe, 'So that is how it works for us from now on. Until we file, the brokers in every town will record what you sell and take nothing. One more thing: on the form, each coin of gain or loss from an exchange counts as ' + M(LQ.COIN_USD) + '.');
  LQ.learn('realize4'); LQ.give('chestkey');
  await say(N.marlowe, "Start with Assayer Garnet at the Assay House, in the north-west corner. She can tell us what Opal's shares are really worth to us. Here, Opal left a little spending money too.");
  LQ.gain(0, 80, "From Opal's chest"); advance4();
}
async function qGarnet() {
  const s = st();
  await say(N.garnet, "So you are Opal's family. She was in here every spring with her ledgers. I am sorry. And I am glad the shares went to people who will ask questions.");
  basisDoc.show = 0; ui.doc = basisDoc;
  await say(N.garnet, 'Every gain starts with one number: your basis. Basis is what an investment cost you. The price paid, plus fees, plus any dividends that were reinvested along the way. Gain is the sale price minus the basis.');
  await say(N.garnet, `Opal paid ${M(OPAL.paid)} for these forty shares, a lifetime ago. On the day she died they were worth ${M(OPAL.atDeath)}. Today a buyer offers ${M(OPAL.sold)}.`);
  basisDoc.show = 1;
  await ask(N.garnet, `You sell for ${M(OPAL.sold)}. What is your taxable gain?`, [`${M(OPAL.gain)}. My basis is the value on the day she died`, `${M(OPAL.sold - OPAL.paid)}. The sale minus what Opal paid`, `${M(OPAL.sold)}. I paid nothing, so all of it`],
    { wrong: ["That would be right for a gift made while she was alive. An inheritance is treated differently.", 'An heir does not start from zero. Look at the highlighted line.'] });
  basisDoc.show = 2; LQ.audio.sfx('coin');
  await say(N.garnet, `${M(OPAL.gain)}. When you inherit, the basis steps up to the value on the day of death. All the growth during Opal's lifetime, ${M(OPAL.atDeath - OPAL.paid)} of it, is never taxed as a gain to anyone.`);
  await say(N.garnet, 'Two more things about inherited shares. They always count as long-term, even if you sell them the next morning. And a gift is not the same. Had Opal handed you these shares while she was alive, you would have taken over her ' + M(OPAL.paid) + ' basis along with them.');
  s.inv.lt += OPAL.gain; ui.doc = null; LQ.learn('basis4'); LQ.learn('stepup4'); LQ.give('basisbook');
  LQ.gain(0, 60, 'Inherited shares sold');
  await say(N.garnet, `Sold, and ${M(OPAL.gain)} of long-term gain is written in your record. Now, your Glacier Goldworks shares. Before you touch them, talk to Timekeeper Frost at the Clock Tower next door. With those, the calendar matters.`);
  advance4();
}
async function qFrost() {
  const s = st(), base = LQ.fin4();
  holdDoc.now = Math.max(0, LQ.trial4(i => { i.st += GL.gain; }).total - base.total);
  holdDoc.wait = Math.max(0, LQ.trial4(i => { i.lt += GL.gain; }).total - base.total);
  holdDoc.pick = -1;
  await say(N.frost, 'Tick, tick. Everyone who climbs up here wants to sell at once. I am the one who asks them what day it is.');
  ui.doc = holdDoc;
  await ask(N.frost, 'How long must you hold an investment for its gain to count as long-term?', ['More than one year', 'More than six months', 'Until the next January 1'],
    { wrong: ['Longer than that. Think of a full turn of the calendar, and then a day.', 'The calendar year has nothing to do with it. Count from the day after you bought.'] });
  await say(N.frost, 'More than one year, counted from the day after you bought. Hold a year or less and the gain is short-term, taxed exactly like wages. Hold a year and a day and it is long-term, taxed at 0%, 15%, or 20%.');
  await say(N.frost, `You bought Glacier Goldworks eleven months ago. Sell today and the ${M(GL.gain)} gain adds about ${M(holdDoc.now)} to your tax. Wait one more month and it adds about ${M(holdDoc.wait)}.` + (holdDoc.wait < 50 ? ' Yes, next to nothing. Hermit Cirrus will show you why later.' : ''));
  await say(N.frost, 'I will be honest about the other side of it. Waiting is a risk. The price can fall in a month. The tax rule tells you what a month is worth. It does not tell you what the price will do.');
  const p = await choose(N.frost, 'What will you do with the Glacier Goldworks shares?', ['Wait the month, then sell', 'Sell today'], i => { holdDoc.pick = i; });
  s.hold4 = p === 0 ? 1 : 0;
  if (p === 0) {
    ui.doc = null; await LQ.fadeTo(1, 0.4); LQ.tick(); LQ.tick(); await LQ.wait(0.6); ui.showBanner('ONE MONTH LATER', 'A year and a day'); await LQ.fadeTo(0, 0.5);
    s.inv.lt += GL.gain; LQ.audio.sfx('coin');
    await say(N.frost, `The price held. Sold, and ${M(GL.gain)} of long-term gain is in your record. Patience saved you about ${M(Math.max(0, holdDoc.now - holdDoc.wait))} of tax.`);
    LQ.gain(10, 80, 'Glacier shares sold');
  } else {
    s.inv.st += GL.gain; LQ.audio.sfx('coin'); ui.doc = null;
    await say(N.frost, `Sold. ${M(GL.gain)} of short-term gain is in your record, and it will be taxed like wages. Thirty more days would have saved you about ${M(Math.max(0, holdDoc.now - holdDoc.wait))}. Sometimes selling early is the right call. Just know the price of it.`);
    LQ.gain(0, 80, 'Glacier shares sold');
  }
  LQ.learn('holding4'); LQ.give('hourglass');
  await say(N.frost, 'Selling is not the only way investments make money. Some pay you just for holding them. Bursar Birch at the Summit Bank, across the main trail, has your year-end forms.');
  advance4();
}
async function qBirch() {
  const s = st();
  divDoc.qd = s.inv.qd + DIV; divDoc.hl = -1;
  await say(N.birch, 'Ah, yes. Your family index fund and your savings account are both with us. I have two forms for you.');
  ui.doc = divDoc;
  await say(N.birch, `The index fund paid dividends through the year. With the dividends from your own shares, the total is ${M(divDoc.qd)}. Every one of them was reinvested automatically. You never held the cash.`);
  await ask(N.birch, 'The dividends were reinvested and you never saw a coin. Are they taxable this year?', ['Yes. Dividends are taxed in the year they are paid', 'No. Not until I sell the fund', 'Only if I spend them'],
    { wrong: ['Reinvesting does not delay the tax. The dividend was paid to you, and then it bought more shares.', 'Spending has nothing to do with it. Paid is paid.'] });
  divDoc.hl = 0;
  await say(N.birch, 'Taxed this year. The good news is twofold. Each reinvested dividend adds to your basis, so you are not taxed on it again when you sell. And yours are qualified dividends, which are taxed at the long-term gain rates. Shares held more than about two months around the payment date generally qualify.');
  divDoc.hl = 1;
  await say(N.birch, `Then the savings account. It paid ${M(INT)} of interest, reported on Form 1099-INT. Interest gets no special rate. It is taxed like wages.`);
  await LQ.quiz(N.birch, 'Which of these is taxed at the lower long-term rates?', ['Qualified dividends', 'Bank interest', 'A gain on shares held for three months'], 'Interest and short-term gains are taxed like wages.');
  s.inv.qd += DIV; s.inv.int += INT; ui.doc = null; LQ.learn('dividends4'); LQ.learn('interest4'); LQ.give('forms4');
  await say(N.birch, 'Both forms are in your record. Now, I understand one of your positions is underwater. Do not just stare at it. Ranger Larch at the Avalanche Station, east of here, knows what a loss is good for.');
  advance4();
}
async function qLarch() {
  const s = st(), base = LQ.fin4();
  harvDoc.saved = Math.max(0, base.total - LQ.trial4(i => { i.st -= AV.loss; }).total); harvDoc.pick = -1;
  const small = harvDoc.saved < 60;
  await say(N.larch, 'Avalanche Airships. I watched that balloon come down myself. You are not the only one holding the shares.');
  ui.doc = harvDoc;
  await say(N.larch, `You paid ${M(AV.cost)} and they are worth ${M(AV.worth)}. On paper that ${M(AV.loss)} loss does nothing. Sell, and it becomes real, and a real loss is useful.`);
  await say(N.larch, `Losses cancel gains first. If your losses are bigger than your gains, up to ${M(TX.capLossLimit)} of what is left comes off your other income each year. Anything beyond that carries forward to later years, with no time limit.`);
  await ask(N.larch, 'There is a catch, called the wash sale rule. If you sell at a loss, how long must you wait before buying the same shares back?', ['More than 30 days', 'Until the next morning', 'One full year'],
    { wrong: ['Far too soon. Buy back that fast and the loss is disallowed.', 'Not that long. The window is 30 days before or after the sale.'] });
  await say(N.larch, 'Buy the same shares, or nearly identical ones, within 30 days before or after the sale and the loss is disallowed for now. It is added to the basis of the new shares instead. Wait 31 days, or buy something similar but not identical, and the loss is yours.');
  await say(N.larch, small ? `Now your own numbers. Selling would save you about ${M(harvDoc.saved)} this year. Almost nothing, because the gains it would cancel are already taxed at 0%. Harvesting a loss into the 0% zone wastes it. Holding is a fair choice for you.`
    : `Now your own numbers. Selling would cut this year's tax by about ${M(harvDoc.saved)}.`);
  const p = await choose(N.larch, 'What will you do with the Avalanche Airships shares?', ['Sell, and wait 31 days before buying back', 'Hold them', 'Sell today and buy them straight back'], i => { harvDoc.pick = i; });
  s.harv4 = p; ui.doc = null;
  if (p === 0) {
    s.inv.st -= AV.loss; LQ.audio.sfx('coin');
    await say(N.larch, `Sold. ${M(AV.loss)} of short-term loss is in your record.` + (small ? ' It saves little this year, but nothing is lost either. It nets against your gains on Schedule D.' : ` That is about ${M(harvDoc.saved)} of tax you will not pay.`) + ' Set a reminder for 31 days if you want back in.');
    LQ.gain(small ? 5 : 10, 40, 'Loss harvested');
  } else if (p === 1) {
    await say(N.larch, small ? 'Sensible. For you the loss is worth more saved for a year when it can cancel gains taxed at 15%.' : `Your call. The loss stays on paper, and so does the ${M(harvDoc.saved)} it could have saved this year. It will still be there next year if the price does not recover.`);
    LQ.gain(small ? 10 : 0, 0, small ? 'Good judgment' : '');
  } else {
    LQ.audio.sfx('wrong'); LQ.shake(0.2);
    await say(N.larch, `And that is a wash sale. You sold and bought back inside the window, so the ${M(AV.loss)} loss is disallowed this year. It is not gone for good. It is added to the basis of your new shares, so it comes back when you finally sell those. But it does nothing for this return.`);
    LQ.gain(-5, 0, 'Wash sale');
  }
  LQ.learn('harvest4'); LQ.learn('washsale4'); LQ.give('sickle');
  await say(N.larch, 'You have gains, losses, dividends, and interest in your record now. To see how they fit together on the return, find Hermit Cirrus. He sits just off the east end of the main trail, stacking stones.');
  advance4();
}
async function qCirrus() {
  const f = LQ.fin4();
  await say(N.cirrus, 'Sit. Watch. I have stacked these stones for forty years, and it is the same every time. The heavy ones go on the bottom.');
  ui.doc = stackDoc;
  await say(N.cirrus, `Your return is a stack. On the bottom goes ordinary income: wages, business profit, interest, short-term gains, after your deductions. Yours comes to ${M(f.ord)}. It climbs the bracket ledges first.`);
  await say(N.cirrus, `On top of it sit your long-term gains and qualified dividends: ${M(f.pref)}. They have their own rates. Whatever part of them lies below ${M(ZERO)} of taxable income is taxed at 0%. The part above is taxed at 15%.`);
  const opts = f.at0 === 0 ? [`None. My ordinary income already fills the zone`, `All ${M(f.pref)}`, `${M(ZERO)}`]
    : f.at15 === 0 ? [`All ${M(f.pref)}. It all sits under the line`, 'None of it', `${M(Math.round(f.pref / 2))}`]
    : [`${M(f.at0)}: the part under the line`, `All ${M(f.pref)}`, 'None of it'];
  await ask(N.cirrus, `The 0% zone ends at ${M(ZERO)}. Your ordinary income reaches ${M(f.ord)}. How much of your ${M(f.pref)} is taxed at 0%?`, opts,
    { wrong: ['Look at where the blue bar ends and where the red line stands.', 'Look at where the blue bar ends and where the red line stands.'] });
  await say(N.cirrus, f.at0 === 0 ? `None. Your wages and business income pass the line on their own, so every coin of long-term gain is taxed at 15%: ${M(f.prefTax)}. Still far gentler than your ${pct(f.top)} rate on wages.`
    : f.at15 === 0 ? `All of it. Your long-term gains and dividends are taxed at 0% this year. That is not a loophole. It is the law for a household at your income, and most people in the zone never know they are in it.`
    : `${M(f.at0)} at 0%, and the other ${M(f.at15)} at 15%: ${M(f.prefTax)} of tax. The line cuts straight through your gains.`);
  await ask(N.cirrus, 'One more. A large long-term gain lands on top of your wages. What happens to the tax rate on the wages?', ['Nothing. The gain sits on top and the wages are taxed as before', 'All my wages jump to a higher bracket', 'The wages are taxed at the gain rate'],
    { wrong: ['The stack only builds upward. What is underneath does not move.', 'Each layer keeps its own rates.'] });
  ui.doc = null; LQ.learn('stack4'); LQ.learn('zero4'); LQ.give('cairn');
  await say(N.cirrus, 'Now you can see the stack. The last question is where to keep the stones. Guide Tamsin at Base Camp, beside the lodge, outfits every climber with the right accounts.');
  advance4();
}
async function qTamsin() {
  const s = st(), own = isOwner(), pre = own ? 'a pre-tax Solo 401(k)' : 'the pre-tax 401(k) at work';
  await say(N.tamsin, 'Welcome to Base Camp. Before anyone climbs, I check their ropes. For an investor, the ropes are accounts. The same investment can cost you very different amounts of tax depending on which account holds it.');
  acctDoc.hl = 0; ui.doc = acctDoc;
  await say(N.tamsin, 'The taxable brokerage account is the one you have been using. Money goes in after tax. Dividends and interest are taxed every year, and gains are taxed when you sell.');
  acctDoc.hl = 1;
  await say(N.tamsin, `A traditional 401(k) or IRA takes money before tax, so it lowers your income today. Inside, nothing is taxed. When you take it out in retirement, every coin is taxed as ordinary income. The 2026 limits are ${M(TX.k401Limit)} for a 401(k) and ${M(TX.iraLimit)} for an IRA.`);
  acctDoc.hl = 2;
  await say(N.tamsin, 'A Roth is the mirror image. Money goes in after tax, with no deduction today. Inside, nothing is taxed. In retirement it comes out tax-free, growth and all.');
  acctDoc.hl = 3;
  await say(N.tamsin, 'And the HSA, if you have a high-deductible health plan. Untaxed going in, untaxed growing, and untaxed coming out for medical costs. Nothing else gets all three.');
  acctDoc.hl = -1;
  await ask(N.tamsin, 'Which account is taxed on the way in and never again?', ['A Roth', 'A traditional 401(k)', 'A taxable brokerage account'],
    { wrong: ['Traditional accounts are untaxed going in and taxed coming out.', 'A taxable account is taxed going in and then again every year.'] });
  await say(N.tamsin, 'A rule of thumb. If you expect a higher tax rate in retirement than you have today, lean Roth. If you expect a lower one, lean traditional. Nobody knows for certain, so many people hold some of each.');
  s.acct4 = 0; const f0 = LQ.fin4(); s.acct4 = 1; const f1 = LQ.fin4(); s.acct4 = null;
  const cut = Math.max(0, f0.total - f1.total);
  const p = await choose(N.tamsin, `Your household has ${M(SAVE)} of new savings this year. Where does it go?`, ['A Roth IRA: no deduction now, tax-free later', `Into ${pre}: a deduction now, taxed later`, 'The taxable brokerage account'], i => { acctDoc.hl = [2, 1, 0][i]; });
  s.acct4 = p; ui.doc = null; LQ.audio.sfx('stamp');
  await say(N.tamsin, [
    `A Roth IRA. Nothing changes on this year's return. But every coin that ${M(SAVE)} earns from now on is yours, tax-free, for life. And what you put in can come back out at any time without tax or penalty if you ever truly need it.`,
    `Pre-tax. That takes ${M(SAVE)} off this year's income and cuts your tax bill by about ${M(cut)} right now. The kingdom will collect when you take it out in retirement, at whatever your rate is then.`,
    `The taxable account. It works, and the money stays easy to reach. But its dividends will be taxed every year and its gains when you sell, where a Roth or a 401(k) would have sheltered them. Worth it only for money you will need before retirement.`][p]);
  if (p < 2) LQ.gain(10, 0, 'Sheltered savings');
  await say(N.tamsin, 'Last knot. What you hold where matters too. Things that throw off taxable income every year, like bonds and high-dividend funds, belong inside the sheltered accounts. Broad index funds you will hold for years do fine in the taxable account.');
  LQ.learn('accounts4'); LQ.learn('location4'); LQ.give('ropes');
  await say(N.tamsin, 'Your ropes are sound. Which is good, because something on the peak has been roaring out hot stock tips all week, and half the town has emptied its savings to chase them. The ice wall on the peak trail has just come down. Go carefully.');
  await LQ.world.clear('gate', '#dbe5ef', 'North of town, the ice wall across the peak trail cracks and falls away.');
  advance4();
}

const capNote = f => {
  const parts = [];
  if (f.stRaw) parts.push(`short-term ${f.stRaw > 0 ? 'gains' : 'losses'} of ${M(Math.abs(f.stRaw))}`);
  if (f.ltRaw) parts.push(`long-term ${f.ltRaw > 0 ? 'gains' : 'losses'} of ${M(Math.abs(f.ltRaw))}`);
  if (f.carry) parts.push(`${M(f.carry)} of losses carried in from earlier years`);
  let t = parts.length ? 'Schedule D nets the whole year together: ' + parts.join(', ') + '. ' : 'Nothing was sold this year. ';
  if (f.capNet >= 0) t += `Net gain: ${M(f.capNet)}.`;
  else t += `That is a net loss of ${M(-f.capNet)}. ${M(f.capLoss)} of it comes off your other income this year` + (f.carryNext ? `, and the remaining ${M(f.carryNext)} carries forward.` : '.');
  return t;
};
const prefOpts = f => [`${M(f.prefTax)}: ${M(f.at0)} at 0% and ${M(f.at15)} at 15%`, `${M(f.pref * f.top)}: all of it at my ${pct(f.top)} wage rate`, f.at15 ? 'Nothing. Long-term gains are never taxed' : `${M(f.pref * 0.15)}: all of it at 15%`];
function rows4(f) {
  const R = [], own = f.kind === 'se', add = (label, val, o) => R.push(Object.assign({ label, val }, o));
  add(own ? "Marlowe's wages  (W-2, Box 1)" : 'Wages  (both W-2s, Box 1)', f.wages);
  add(own ? 'Business profit  (shop + gig)' : 'Business profit  (Schedule C)', f.biz, { note: `Schedule C, the same as last year: ${M(f.biz)} of net profit.` });
  add('Interest and dividends', f.int + f.qd, f.int ? { ask: [`Your savings paid ${M(f.int)} of interest and your shares paid ${M(f.qd)} of qualified dividends. Both go on this line. Which one gets the lower long-term rates?`, ['The qualified dividends', 'The interest', 'Both of them'],
    ['Interest is taxed like wages.', 'Only the qualified dividends. Interest is taxed like wages.']] } : { note: `Your municipal bond interest is free of federal tax, so only the ${M(f.qd)} of qualified dividends goes here.` });
  add('Capital gain or loss  (Schedule D)', f.capLine, { note: capNote(f) });
  add('Adjustments  (half SE tax, savings)', f.adj, { sign: '-', note: `Half of your self-employment tax, plus your savings` + (f.acct ? `, including the ${M(f.acct)} you put away pre-tax this year` : '') + `: ${M(f.adj)}.` });
  add(f.itemize ? 'Itemized deductions' : f.giftStd ? 'Standard deduction + gifts' : 'Standard deduction', f.ded, { sign: '-' });
  const od = f.ot + f.qbi;
  add(f.ot ? 'Overtime + business income deductions' : 'Business income deduction', od, { sign: '-' });
  add('Taxable income', f.taxable, { ask: ['Taxable income. Everything above with no sign, minus every line with a minus sign. What is left?', [M(f.taxable), M(f.agi), M(f.taxable + od)],
    ['The deduction lines still have to come off.', 'The last deduction line comes off too.']] });
  add('Tax on wages and business income', f.ordTax, { note: `Of your taxable income, ${M(f.ord)} is ordinary income. It climbs the joint ledges first: ${M(f.ordTax)}.` });
  add('Tax on long-term gains, dividends', f.prefTax, { ask: [`Stacked on top: ${M(f.pref)} of long-term gains and qualified dividends. The 0% zone ends at ${M(ZERO)} of taxable income. What is the tax on them?`, prefOpts(f),
    ['Long-term gains and qualified dividends have their own rates. Use the stack.', f.at15 ? 'Above the 0% zone they are taxed at 15%.' : 'Check where your ordinary income ends. The gains sit under the line.']] });
  add('Self-employment tax  (Schedule SE)', f.se, { sign: '+' });
  add('Credits  (child, care' + (f.saver ? ', saver)' : ')'), f.credits, { sign: '-', note: `Coral's ${M(f.ctc)} Child Tax Credit and a ${M(f.care)} care credit.` + (f.careRate < TX.careRate ? ` Your income passed ${M(TX.careFullJoint)}, so the care credit rate slipped from ${pct(TX.careRate)} to ${pct(f.careRate)}. Extra income can shave a credit.` : '') });
  add('Paid in: withholding + estimates', f.withheld, { note: `Paycheck withholding of ${M(f.baseWh)}, plus ${M(f.est)} of estimated payments for the gig.` });
  const owed = f.diff < 0, amt = Math.abs(f.diff);
  add(owed ? 'Amount you owe' : 'Refund', amt, { owed, ask: [`Last line. Your total tax is ${M(f.total)} and you paid in ${M(f.withheld)}. So...`,
    owed ? [`We owe ${M(amt)}`, `We get a refund of ${M(amt)}`, 'It comes out exactly even'] : [`We get a refund of ${M(amt)}`, `We owe ${M(amt)}`, 'It comes out exactly even'],
    [owed ? 'You paid in less than your tax. The difference is still due.' : 'You paid in more than your tax. The extra comes back.', 'Check the subtraction once more.']] });
  return R;
}
async function qAlpen() {
  const s = st(), f = LQ.fin4(), rows = rows4(f), owed = f.diff < 0, amt = Math.abs(f.diff), FD = D.formDoc;
  await say(N.alpen, 'The roaring has stopped, and people are coming down off the peak looking sheepish. Welcome to the Summit Tax Office. You have the thickest folder I have seen this year.');
  Object.assign(FD, { rows, vals: [], cur: 0, stamp: 0 }); ui.doc = FD;
  await say(N.alpen, 'One Form 1040, as always. Wages on top. Schedule C for the gig. Then the new lines: interest, dividends, and Schedule D for everything you sold. You fill it in. I hold the stamp.');
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]; FD.cur = i;
    if (r.ask) await ask(N.alpen, r.ask[0], r.ask[1], { wrong: r.ask[2] });
    FD.vals[i] = r.val; LQ.audio.sfx('coin');
    if (r.note) await say(N.alpen, r.note); else if (!r.ask) await LQ.wait(0.35);
  }
  FD.cur = -1;
  await LQ.wait(0.4); LQ.audio.sfx('stamp'); LQ.shake(0.25); await LQ.tween(0.35, k => { FD.stamp = k; });
  LQ.audio.sfx('fanfare'); await LQ.wait(0.8);
  await say(N.alpen, owed ? `You owe ${M(amt)}. Your withholding and estimates covered the wages and the gig. What is left is the tax on this year's investment income.` + (amt < TX.estMinimum ? ` It is under ${M(TX.estMinimum)}, so no penalty applies.` : " As long as what you paid in during the year covers all of last year's tax, there is no penalty on the difference. That is the safe harbor at work.")
    : f.prefTax === 0 ? `A refund of ${M(amt)}. Your long-term gains and qualified dividends sat in the 0% zone, so they added next to nothing to the bill your withholding and estimates had already covered.`
    : `A refund of ${M(amt)}. Your losses and your savings brought the bill under what you had already paid in.`);
  if (f.carryNext) await say(N.alpen, `And ${M(f.carryNext)} of unused loss carries forward. I have banked it for you. It will cancel gains in a later year.`);
  LQ.gain(80, LQ.clamp(Math.round(f.diff / 15), -500, 500), owed ? 'Tax settled' : 'Refund');
  await say(N.alpen, 'Filed. Wages, a household, a business, and investments, and you understood every line. Most people go their whole lives without being able to say that.');
  ui.doc = null; LQ.give('return4');
  s.lossBank = Math.round(f.carryNext / LQ.COIN_USD); s.inv = { st: 0, lt: 0, qd: 0, int: 0 }; s.q4 = 9; LQ.tick();
  await ending4(f);
}
async function ending4(f) {
  const s = st(), owed = f.diff < 0;
  await LQ.fadeTo(1); ui.toasts = []; LQ.audio.play('title');
  ui.doc = { draw(c) {
    D.paper(c, 130, 20, 700, 458, 'CHAPTER 4 COMPLETE', f.c.name + ', ' + f.G.name + ', investor');
    c.textAlign = 'center'; c.textBaseline = 'top'; c.font = F(20, true); c.fillStyle = '#1f6f5c'; c.fillText(LQ.rank().toUpperCase(), 480, 70);
    const L = (i, a, b, o) => D.line(c, 170, 106 + i * 29, 620, a, b, Object.assign({ size: 24 }, o));
    L(0, 'Household income', M(f.income)); L(1, 'Net capital gain or loss', M(f.capNet), f.capNet >= 0 ? D.GREEN : D.RED);
    L(2, 'Gains and dividends taxed at 0%', M(f.at0), D.GREEN); L(3, 'Gains and dividends taxed at 15%', M(f.at15));
    L(4, 'Total federal tax', M(f.total)); L(5, owed ? 'Paid at filing' : 'Refund received', M(Math.abs(f.diff)), owed ? D.RED : D.GREEN);
    L(6, 'Right on the first try', s.first + ' of ' + s.asked); L(7, 'Savvy', String(s.savvy)); L(8, 'Audits faced', String(s.audits || 0));
    L(9, 'Net worth', String(LQ.netWorth()), D.GREEN); L(10, 'Journal entries', s.journal.length + ' of ' + Object.keys(LQ.JOURNAL).length);
    c.font = F(22); c.textAlign = 'center'; c.fillStyle = '#7a6a48';
    ui.wrap(c, 'Four chapters, four returns. The whole of the Ledgerlands is open to you.', 620).forEach((ln, i) => c.fillText(ln, 480, 430 + i * 22));
  } };
  await LQ.fadeTo(0.5); await LQ.pressOk();
  ui.doc = { draw(c) { LQ.drawWorldMap(c, 110, 40, 740, 420); } };
  await LQ.pressOk();
  ui.doc = { draw(c) {
    D.paper(c, 130, 40, 700, 420, 'LEDGER QUEST', 'The end, and the beginning');
    c.textAlign = 'center'; c.textBaseline = 'top'; c.font = F(26); c.fillStyle = '#2c2416';
    ['You came to Paystub Village with an empty coin purse', 'and no idea how taxes worked.', '', 'You leave the Summit able to read a paystub, file a return,',
      'claim a child, run a business, and invest with your eyes open.', '', 'Everything in this game follows real US federal rules', 'for tax year ' + TX.year + '. It is for learning, not tax advice.',
      'When your own return gets complicated, a professional', 'is worth the fee, and now you can check their work.'].forEach((ln, i) => c.fillText(ln, 480, 96 + i * 30, 650));
    c.font = F(14, true); c.fillStyle = '#1f6f5c'; c.fillText('FINAL RANK: ' + LQ.rank().toUpperCase(), 480, 412);
  } };
  await LQ.pressOk();
  await LQ.fadeTo(1, 0.3); ui.doc = null; LQ.world.music(); await LQ.fadeTo(0, 0.9);
  await say(N.marlowe, 'Four years ago you could not read your own paystub. Coral wants to know if you will do her taxes when she is grown.');
  await say(N.coral, 'I have forty-one rocks. Is that a gain?');
  await say(null, 'Ledger Quest is complete. Every town stays open for trading, shopping, and audits, and sales are taxed at the counter again from here on. Press J to reread your Tax Journal.');
}

// ---------- the peak
const GLINT = { name: 'Glint' };
const MYTHS4 = [
  { myth: 'Yer shares went UP! Ye owe tax on every coin of it, this very minute, sold or not!',
    opts: ['A gain is taxed when I sell, not while I hold.', 'True. Rising prices are taxed every year.', 'True, but only on Fridays.'],
    truth: 'Nothing is owed on a gain until the investment is sold.' },
  { myth: 'One big gain will SHOVE all yer wages into a higher bracket! Sell nothing, ever!',
    opts: ['Long-term gains stack on top. My wages are taxed as before.', 'True. A gain raises the rate on everything.', 'True, unless I sell at night.'],
    truth: 'Ordinary income fills the brackets first, and gains sit on top at their own rates.' },
  { myth: 'Sell at a loss, buy it back the same afternoon, and CLAIM the loss! Free deduction!',
    opts: ['That is a wash sale. The loss is disallowed for now.', 'True. Nobody checks the dates.', 'True, if I use a different broker.'],
    truth: 'Buy back within 30 days and the loss is added to the new basis instead.' },
  { myth: 'Reinvested dividends are INVISIBLE! No cash in yer claw, no tax!',
    opts: ['Dividends are taxed the year they are paid, reinvested or not.', 'True. Reinvested money is not income.', 'True, for the first ten years.'],
    truth: 'They are taxed when paid, and each one adds to my basis.' },
  { myth: 'Hold it a year? BAH! A gain is a gain! The taxman takes the same either way!',
    opts: ['Held more than a year, a gain gets the lower long-term rates.', 'True. Holding longer changes nothing.', 'True. Short-term gains are taxed less.'],
    truth: 'Short-term gains are taxed like wages. Long-term gains are taxed at 0%, 15%, or 20%.' },
  { myth: 'A loss is just a LOSS! Good for nothing but weeping over!',
    opts: ['Losses cancel gains, and up to $3,000 more comes off other income.', 'True. Losses never help.', 'True. Losses raise my tax.'],
    truth: 'Losses offset gains, then up to $3,000 of other income a year, and the rest carries forward.' },
  { myth: 'Roth, traditional, who cares? Every pot of gold is taxed the SAME!',
    opts: ['Traditional is taxed coming out. A Roth is taxed going in.', 'True. The names are for show.', 'True. Both are taxed twice.'],
    truth: 'Traditional: a deduction now, tax later. Roth: tax now, nothing later.' },
];
LQ.BOSSES.glint = {
  who: GLINT, label: 'GLINT, THE HOT-TIP DRAGON', kind: 'glint', sky: ['#14244a', '#6f9fd8'], hill: '#c8d5e2', ground: ['#e9eef6', '#cfd9e8'], fog: '240,200,90', bar: ['#d9a520', '#fff3b0'], ink: '#7a5a12',
  approach: 'Gold light pours over the ridge. Something enormous uncoils from a hoard of crumpled stock tips.',
  intro: ['PSSST. Hero. I am Glint. I have a tip for ye. A SURE thing. Everyone on this mountain is buying it. Ye would be a fool to miss out.', 'I know everything there is to know about gains. Ask anyone I have ruined.'],
  taunt: 'HAR! Now ye are thinking like an investor. Buy high! Sell in a panic!', fogLine: 'The gold glare dazzles you.',
  myths: () => MYTHS4,
  final: () => {
    const f = LQ.fin4();
    return { bubble: `ENOUGH! One last riddle. Yer ordinary taxable income is ${M(f.ord)}. Stacked on top sit ${M(f.pref)} of long-term gains and qualified dividends. The 0% zone ends at ${M(ZERO)}. What is the tax on them? Ye will NEVER stack it right!`, prompt: 'Finish it. Use the stack:',
      opts: prefOpts(f), wrong: ['Long-term gains and qualified dividends have their own rates, lower than wages.', f.at15 ? 'Above the 0% zone they are taxed at 15%.' : 'Your ordinary income stops short of the line, so the gains fit under it.'],
      strike: `${M(f.prefTax)}. Wages on the bottom, gains on top, each layer at its own rate. No tip required.` };
  },
  lastWords: 'No... NO! Patience! Records! Index funds! Ye cannot get rich SLOWLY, it is not FAIR... I am... melting...',
  after: 'The dragon gutters out like a candle. Its hoard of hot tips scatters across the snow. Every one of them is a year out of date.',
  win: async () => {
    const s = st();
    s.flags.boss4 = true; s.q4 = 8; LQ.give('medal4'); LQ.gain(60, 160, 'Hot-Tip Dragon defeated');
    LQ.tick(); if (s.prices && s.prices.GLCR != null) { s.prev.GLCR = s.prices.GLCR; s.prices.GLCR *= 1.45; s.gazette.unshift('The peak is safe again! Glacier Goldworks sends its crews back onto the ice.'); }
  },
  done: async () => { ui.toast('New quest: ' + LQ.QUESTS4[8].short); await say(null, 'The peak is quiet and the air is clear to the horizon. One task remains: take your whole record to the Summit Tax Office, in the south-east of town, and file.'); },
};

// ---------- villagers who teach expert moves
const TIPS = {
  nimbus: { j: 'pro4Niit', lines: ['My late husband left me rather a lot of the lift company. More than is polite to mention.', 'At my income there is a surtax. An extra 3.8% on interest, dividends, and gains, once income passes $250,000 on a joint return or $200,000 for a single filer. The thresholds never rise with inflation. You are nowhere near it. I mention it so it does not surprise you one day.'],
    q: ['At what income does the 3.8% investment surtax begin for a joint return?', ['$250,000', '$98,900', '$1,000,000']] },
  ada: { j: 'pro4Index', lines: ['I used to own a fund run by a very busy man. He traded all year, and every December he sent me a tax bill for gains I never asked him to take.', 'A fund that trades often must pass its gains to you as capital gain distributions, taxed even if you never sold a share. A broad index fund hardly trades at all, so nearly all of your gain waits untaxed until the day you choose to sell.'],
    q: ['Why are broad index funds usually light on taxes?', ['They trade very little, so few gains are passed on each year', 'They are exempt from tax', 'They pay no dividends by law']] },
  gramps: { j: 'pro4Early', lines: ['I raided my retirement account at fifty to buy a boat. The boat sank. The tax bill floated.', 'Take money from a traditional 401(k) or IRA before age 59 and a half and it is taxed as income, usually with an extra 10% on top. A Roth IRA is kinder. What you put in can come out any time, with no tax and no penalty. Only the earnings have to wait.'],
    q: ['What can come out of a Roth IRA at any time with no tax or penalty?', ['The amount I contributed', 'The earnings', 'Nothing at all']] },
  sorrel: { j: 'pro4Hsa', lines: ['I patch up skiers all winter, and I pay my own small medical bills out of pocket. My HSA has not been touched in nine years.', 'It is invested. An HSA is untaxed going in, untaxed while it grows, and untaxed coming out for medical costs. Keep your receipts and you can repay yourself years later. Nothing else in the tax code gets all three.'],
    q: ['What makes an HSA unusual among accounts?', ['It is untaxed going in, growing, and coming out for medical costs', 'It has no contribution limit', 'It can only hold cash']] },
  bell: { j: 'pro4Donate', lines: ['The chapel roof was paid for with lift company shares. Not cash. Shares.', 'If you itemize, giving shares you have held more than a year straight to a charity lets you deduct their full value, and nobody pays tax on the gain. Sell first and give the cash, and you pay the gains tax yourself. The charity receives less and so do you.'],
    q: ['You itemize and want to give $1,000 to charity. You hold shares with a large long-term gain. What is the tax-smart way?', ['Give the shares directly', 'Sell the shares and give the cash', 'Give cash and keep the shares forever']] },
  flake: { j: 'pro4Lots', lines: ['I work the sales desk at the exchange. People say "sell ten shares" and never ask which ten.', 'Shares bought at different times are separate lots, each with its own basis and its own holding period. Unless you say otherwise, the oldest are sold first. You can tell your broker to sell specific lots instead, such as the ones with the highest basis, for the smallest gain.'],
    q: ['You sell part of a position without choosing lots. Which shares are usually sold first?', ['The oldest', 'The newest', 'The most profitable']] },
  bit: { j: 'pro4Crypto', lines: ['I traded one digital coin for another and thought nothing of it. No cash changed hands. Then the form arrived.', 'For tax, digital assets are property, like shares. Selling them, swapping one for another, or spending them on a sandwich is a sale, with a gain or a loss. The return asks about them by name, and brokers now report sales on Form 1099-DA.'],
    q: ['You trade one cryptocurrency for another. For tax, that is...', ['A sale, with a gain or loss', 'Nothing. No cash changed hands', 'A gift']] },
  curio: { j: 'pro4Collect', lines: ['Cards, coins, a signed lift ticket from the first season. I collect it all, and I sold a rare card this year for ten times what I paid.', 'Then I learned that collectibles have their own rate. Long-term gains on cards, coins, art, and precious metals can be taxed at up to 28%, not the 15% most people pay on shares. Keep proof of what each piece cost you. It is the only thing standing between you and tax on the full sale price.'],
    q: ['What is the top federal rate on a long-term gain from a collectible?', ['28%', '15%', '0%']] },
};
async function tip(id) {
  const t = TIPS[id], who = N[id], s = st();
  if (s.tips['c4' + id]) return say(who, LQ.JOURNAL[t.j].text);
  for (const ln of t.lines) await say(who, ln);
  if (await LQ.quiz(who, t.q[0], t.q[1], 'Talk to me again and we will go over it once more.')) {
    s.tips['c4' + id] = true; LQ.gain(15, 30, 'Expert tip'); LQ.learn(t.j); LQ.tick();
    await say(who, 'You have got it. I wrote it in your Tax Journal.');
  }
}

// ---------- everyday chatter
const CORAL = ['Snow is just rain that is not in a hurry.', 'I rode the lift FIVE times. That is a long-term ride.', 'Aunt Opal had a lot of paper. I drew on some. Sorry.', 'When I am big I am going to buy the mountain. And hold it for a year and a day.'];
const idle = {
  marlowe: async () => say(N.marlowe, q4() >= 9 ? 'Opal would be pleased. She always said the money was the easy part and the paperwork was the inheritance.' : 'I am keeping Coral off the black runs. ' + LQ.curQuest().text + '.'),
  coral: async () => say(N.coral, CORAL[Math.floor(Math.random() * CORAL.length)]),
  garnet: async () => say(N.garnet, q4() < 1 ? 'Find your family at the lodge first. Then come and see me about the shares.' : 'Sale price minus basis. And an heir starts from the value at death.'),
  frost: async () => say(N.frost, q4() < 2 ? 'Not yet. Learn what your shares cost you first. Assayer Garnet is next door.' : 'More than one year. A year and a day. Tick, tick.'),
  birch: async () => say(N.birch, q4() < 3 ? 'Your forms are not printed yet. Timekeeper Frost will send you over.' : 'Dividends are taxed when paid. Interest is taxed like wages. Keep both forms.'),
  larch: async () => say(N.larch, q4() < 4 ? 'The station is closed while I check the slopes. Collect your forms from the Summit Bank first.' : 'Thirty days before, thirty days after. Mind the window.'),
  cirrus: async () => say(N.cirrus, q4() < 5 ? 'The stones are not ready to be read. Come back when you carry gains, losses, and dividends.' : 'Wages on the bottom. Gains on top. It never changes.'),
  tamsin: async () => say(N.tamsin, q4() < 6 ? 'I check ropes last. See Hermit Cirrus first, east along the main trail.' : 'Right investment, right account. Check your ropes every year.'),
  alpen: async () => say(N.alpen, q4() < 8 ? 'The filing window is not open for you yet. Bring your whole record, and a clear head.' : 'Filed and stamped, Schedule D and all. See you next April.'),
};
const QUEST_FN = { marlowe: [0, qMarlowe], garnet: [1, qGarnet], frost: [2, qFrost], birch: [3, qBirch], larch: [4, qLarch], cirrus: [5, qCirrus], tamsin: [6, qTamsin], alpen: [8, qAlpen] };
const CHESTS = {
  c4a: { tx: 44, ty: 20, tip: 'tip4Reinvest', line: 'A note inside reads: "Every reinvested dividend raises your basis. Forget them and you are taxed twice."' },
  c4b: { tx: 3, ty: 31, tip: 'tip4B', line: 'A note inside reads: "Check the basis on your Form 1099-B. For inherited or transferred shares it is often missing."' },
  c4c: { tx: 29, ty: 7, tip: 'tip4Day', line: 'A note inside reads: "The holding period starts the day after you buy. Long-term means a year and a day."' },
};

// ---------- audit questions for this chapter
LQ.AUDIT_POOL.push(
  { need: 'realize4', q: 'Your shares rise in value and you do not sell. What tax do you owe on the gain?', o: ['None until I sell', 'Tax on the rise each year', 'Half the gain'], why: 'Gains are taxed in the year of the sale.' },
  { need: 'basis4', q: 'How is a capital gain worked out?', o: ['Sale price minus basis', 'Sale price minus dividends', 'Basis minus sale price'], why: 'Basis is what the investment cost you.' },
  { need: 'stepup4', q: 'You inherit shares. What is your basis?', o: ['Their value on the day the owner died', 'What the owner first paid', 'Zero'], why: 'Inherited property gets a step-up in basis.' },
  { need: 'stepup4', q: 'You sell inherited shares one week after receiving them. The gain is...', o: ['Long-term', 'Short-term', 'Not taxable'], why: 'Inherited property always counts as long-term.' },
  { need: 'holding4', q: 'A gain on shares held for exactly eleven months is taxed...', o: ['Like wages, as a short-term gain', 'At the long-term rates', 'Not at all'], why: 'Long-term means held for more than one year.' },
  { need: 'dividends4', q: 'You reinvest every dividend automatically. When are they taxed?', o: ['In the year they are paid', 'When I sell the shares', 'Never'], why: 'Reinvested dividends are taxed when paid and add to your basis.' },
  { need: 'interest4', q: 'How is interest from a savings account taxed?', o: ['Like wages, at my ordinary rate', 'At the long-term gain rates', 'It is tax-free'], why: 'Interest gets no special rate.' },
  { need: 'harvest4', q: 'Your losses are larger than your gains. How much of the extra can offset other income each year?', o: ['Up to $3,000', 'Up to $30,000', 'None'], why: 'Up to $3,000, and the rest carries forward.' },
  { need: 'washsale4', q: 'You sell at a loss and buy the same shares back 10 days later. What happens to the loss?', o: ['It is disallowed for now and added to the new basis', 'It is deducted in full', 'It is lost forever'], why: 'That is a wash sale. The window is 30 days before or after.' },
  { need: 'zero4', q: 'For 2026, long-term gains are taxed at 0% while taxable income on a joint return stays at or under...', o: ['$98,900', '$32,200', '$250,000'], why: '$98,900 joint, $49,450 single.' },
  { need: 'stack4', q: 'A long-term gain lands on top of your wages. What rate applies to the wages?', o: ['The same as before', 'A higher bracket for all of it', 'The gain rate'], why: 'Ordinary income fills the brackets first. Gains stack on top.' },
  { need: 'accounts4', q: 'Which account gives a deduction today and is taxed when money comes out?', o: ['A traditional 401(k) or IRA', 'A Roth IRA', 'A taxable brokerage account'], why: 'Traditional: untaxed going in, taxed coming out.' },
  { need: 'location4', q: 'Where is the tax-smart place for a bond fund that pays a lot of interest?', o: ['Inside a tax-sheltered account', 'In the taxable account', 'It makes no difference'], why: 'Shelter the holdings that produce the most taxable income each year.' },
  { need: 'pro4Collect', q: 'What is the top federal rate on long-term gains from collectibles?', o: ['28%', '15%', '37%'], why: 'Collectibles can be taxed at up to 28%.' },
);

LQ.CH4 = {
  npcs: NPC_LIST, chests: CHESTS, begin,
  coins: [[10, 20], [20, 21], [28, 20], [36, 21], [42, 20], [6, 30], [12, 31], [30, 30], [40, 31], [23, 14], [24, 35], [24, 40], [19, 9], [30, 6], [21, 4], [26, 4]],
  signs: [
    { tx: 22, ty: 13, fn: () => st().flags.boss4 ? 'THE PEAK. Quiet again. The view is free.' : 'THE PEAK. Beware of hot tips. If it sounds too good to be true, it is roaring.' },
    { tx: 21, ty: 22, text: 'SUMMIT OF GAINS. North-west: the Assay House and the Clock Tower. North-east: the Summit Bank and the Avalanche Station. South-west: the Summit Lodge and Base Camp. South-east: the Summit Tax Office. In the plaza: the Summit Outfitter and the Summit Exchange. South: the trail down to Hustle Canyon.' },
    { tx: 26, ty: 23, fn: () => 'THE SUMMIT GAZETTE. Today: ' + (st().news ? st().news.text : 'No news.') + ' (Prices react tomorrow.)' + (st().flags.boss4 ? '' : ' Standing notice: Glacier Goldworks will send its crews back up if the peak is ever made safe.') },
    { tx: 22, ty: 41, text: 'SOUTH TRAIL to Hustle Canyon.' },
  ],
  talk: async id => {
    const q = QUEST_FN[id];
    if (q && st().q4 === q[0]) return q[1]();
    if (id === 'trader') return LQ.shop(N.trader);
    if (id === 'broker') return LQ.broker(N.broker);
    if (TIPS[id]) return tip(id);
    return idle[id]();
  },
  openChest: async id => {
    const ch = CHESTS[id]; st().chests[id] = true; LQ.audio.sfx('coin'); LQ.gain(0, 40);
    await say(null, 'You found 40 coins! ' + ch.line); LQ.learn(ch.tip);
  },
  // Skip ahead: finish Chapter 3 on top of the earlier starter kits, pick the gig, and stand at the foot of the Summit.
  async starter() {
    const s = st(), ids = Object.keys(GIGS);
    s.q3 = 8; s.flags.boss3 = true; s.est3 = 0;
    s.gig = ids[await choose(null, 'Your hero also ran a side gig in Hustle Canyon. Which one?', ids.map(id => GIGS[id].name + ': ' + GIGS[id].what))];
    ['xSupply', 'xPhone', 'xLicense', 'xMeal'].forEach(id => { s.rcpt[id] = true; });
    s.journal = s.journal.concat(['gig3', 'f1099', 'allincome', 'expenses3', 'mileage3', 'setax3', 'qbi3', 'estimates3', 'safeharbor', 'schedC', 'meals3']);
    s.items = s.items.concat(['gigsign', 'forms1099', 'books3', 'seslip', 'vouchers', 'schedc', 'medal3', 'return3']);
    s.coins = 1400; s.savvy = 450;
    s.region = 'summit'; s.px = 24 * 16; s.py = 42 * 16; s.dir = 'up';
  },
};
})();
