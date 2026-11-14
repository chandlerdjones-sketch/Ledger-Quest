// Chapter 3 content: Hustle Canyon. A side gig, Schedule C, self-employment tax, and quarterly estimates.
(() => {
const LQ = window.LQ, F = LQ.F, ui = LQ.ui, D = LQ.docs, M = n => LQ.money(n);
const say = LQ.say, ask = LQ.ask, choose = LQ.choose;
const TX = LQ.TAX, STD = TX.standardDeduction, SL = LQ.SLIPS, GIGS = LQ.GIGS;
const st = () => LQ.state, pct = r => Math.round(r * 100) + '%';
const isOwner = () => LQ.career().kind === 'se';
const IDS = ['driver', 'seller', 'scribe'];
const HUNT = Object.keys(SL), got = id => !!st().rcpt[id];
const gig = () => GIGS[st().gig] || GIGS.driver;
const q3 = () => st().q3 == null ? -1 : st().q3;
const FORM = { k: 'Form 1099-K', nec: 'Form 1099-NEC', none: 'no form sent' };

// ---------- cast
const P = (id, name, tx, ty, look, dir = 'down', extra) => Object.assign({ id, name, tx, ty, dir, look: Object.assign({ id: 'c3' + id }, look) }, extra);
const NPC_LIST = [
  P('juniper', 'Guildmistress Juniper', 9, 9, { hair: '#a8452c', long: 1, shirt: '#c9781c', robe: 1, trim: '#f3d24a' }),
  P('mesa', 'Teller Mesa', 17, 9, { hat: 'cap', hatColor: '#3f6fb8', hair: '#231a36', shirt: '#3f6fb8', pants: '#3a3550', trim: '#f3f0e6', skin: '#b87a52' }),
  P('lupe', 'Bookkeeper Lupe', 31, 9, { hair: '#3a2a1c', long: 1, shirt: '#3d7a5a', robe: 1, trim: '#f3f0e6', skin: '#c98d62' }),
  P('flint', 'Assayer Flint', 39, 9, { hat: 'top', hair: '#8a8a96', beard: '#8a8a96', shirt: '#5d6478', pants: '#3a3550', trim: '#f3d24a' }),
  P('dune', 'Quartermaster Dune', 9, 19, { hat: 'cap', hatColor: '#8a3f8f', hair: '#4a4a56', shirt: '#8a3f8f', pants: '#3a3550', trim: '#f3d24a', skin: '#e2b184' }),
  P('brick', 'Tallyman Brick', 15, 19, { hair: '#231a36', beard: '#231a36', shirt: '#b5503c', pants: '#5a4630', trim: '#f1e3bd', skin: '#b87a52' }),
  P('sage', 'Clerk Sagebrush', 35, 19, { hair: '#8a7a3a', long: 1, shirt: '#2a3a6e', robe: 1, trim: '#f3f0e6' }),
  P('trader', 'Trader Adobe', 20, 14, { hat: 'cap', hatColor: '#c9781c', hair: '#3a2a1c', shirt: '#e0564e', robe: 1, trim: '#f3d24a', skin: '#c98d62' }),
  P('broker', 'Broker Gulch', 27, 14, { hat: 'top', hair: '#231a36', shirt: '#6b4428', pants: '#4f321d', trim: '#f3c531' }),
  P('marlowe', 'Marlowe', 13, 13, { hair: '#7a4a2a', shirt: '#3b6fd4', pants: '#5a4630', trim: '#f3d24a', skin: '#c98d62' }),
  P('coral', 'Coral', 14, 13, { hair: '#7a4a2a', long: 1, shirt: '#e86a9a', pants: '#e86a9a', skin: '#c98d62' }, 'down', { small: true }),
  P('whittle', 'Whittler Wren', 41, 13, { hair: '#e8e8f0', beard: '#e8e8f0', shirt: '#6a8a4a', pants: '#5a4630' }, 'left'),
  P('silver', 'Old Silver', 18, 23, { hat: 'cap', hatColor: '#5d6478', hair: '#e8e8f0', beard: '#e8e8f0', shirt: '#928f9f', pants: '#3a3550' }),
  P('poppy', 'Healer Poppy', 27, 9, { hair: '#c8742c', long: 1, shirt: '#f3f0e6', robe: 1, trim: '#e0564e' }),
  P('loom', 'Weaver Loom', 10, 23, { hair: '#231a36', long: 1, shirt: '#7b4bb8', robe: 1, trim: '#f3d24a', skin: '#b87a52' }),
  P('axle', 'Wagoner Axle', 30, 23, { hat: 'cap', hatColor: '#b0332e', hair: '#3a2a1c', beard: '#3a2a1c', shirt: '#d9b877', pants: '#5a4630' }),
  P('penny', 'Banker Penny', 12, 9, { hair: '#e8c45a', long: 1, shirt: '#2f8a6a', pants: '#22304f', trim: '#f3d24a' }),
  P('tack', 'Foreman Tack', 27, 30, { hat: 'cap', hatColor: '#e0a02c', hair: '#4a4a56', shirt: '#22304f', pants: '#5a4630', skin: '#c98d62' }),
  P('cinder', 'Smith Cinder', 6, 19, { hair: '#a8452c', beard: '#a8452c', shirt: '#3a3550', pants: '#231a36', trim: '#e0564e' }),
];
const N = {}; NPC_LIST.forEach(n => { N[n.id] = n; });

LQ.QUESTS3 = [
  { short: 'Pick a side gig', text: 'Find Guildmistress Juniper at the Hustle Hall', target: 'juniper' },
  { short: 'Count what you were paid', text: 'See Teller Mesa at the 1099 Depot', target: 'mesa' },
  { short: 'Track your expenses', text: 'See Bookkeeper Lupe at the Ledger Shack (north-east)', target: 'lupe' },
  { short: 'Face self-employment tax', text: 'See Assayer Flint at the Assay Office', target: 'flint' },
  { short: 'Plan your quarterly payments', text: 'See Quartermaster Dune at the Quarter Station', target: 'dune' },
  { short: 'Tally Schedule C', text: 'Take your expense slips to Tallyman Brick', target: 'brick' },
  { short: 'Defeat Sidewinder Slick', text: 'Cross Rattle Creek to Off-the-Books Gulch', target: 'boss3' },
  { short: 'File with Schedule C', text: 'File with Clerk Sagebrush at the Canyon Tax Office', target: 'sage' },
  { short: 'Chapter complete', text: 'Chapter 3 complete! Take the North Trail to the Summit', target: null },
];

Object.assign(LQ.JOURNAL, {
  gig3: { title: 'Employee or contractor', text: 'An employee has tax withheld from each paycheck, and the employer pays half of Social Security and Medicare. An independent contractor gets paid in full and handles all of it alone. A side gig run to make a profit is a business. Something done only for fun is a hobby: its income is still taxed, and its expenses cannot be deducted.' },
  f1099: { title: 'Forms 1099-NEC and 1099-K', text: 'Businesses generally send Form 1099-NEC for $2,000 or more in qualifying contractor payments in 2026. For payment apps and marketplaces, Form 1099-K is required above $20,000 and 200 transactions. Direct card payments have no minimum. Form 1099-K shows gross payments before fees. Report the income once and track the fees separately.' },
  allincome: { title: 'All income counts', text: 'Income from a gig is taxable whether or not a form arrives. Cash, small jobs, and sales under a reporting threshold all go on your return. The thresholds only decide who has to send paperwork, not what is taxed.' },
  expenses3: { title: 'Business expenses', text: 'A business deducts costs that are ordinary and necessary: common in your trade and helpful to it. Supplies, fees, licenses, and the business share of a phone all count. When something is used for both work and home, only the business share counts. Keep the receipt and write down what it was for.' },
  mileage3: { title: 'Vehicle costs: two methods', text: 'For business driving you can use the standard mileage rate, 72.5 cents a mile in the first half of 2026 and 76 cents from July 1, which already covers fuel, repairs, insurance, and wear. Tolls and parking on a job are extra. Or you can track actual costs and deduct the business share. Either way you need a log written at the time, and commuting from home to a regular workplace never counts.' },
  setax3: { title: 'Self-employment tax', text: 'Employees pay 7.65% for Social Security and Medicare, and the employer pays another 7.65%. Work for yourself and you pay both halves: 15.3%, applied to 92.35% of your net profit. It is owed once your net self-employment earnings reach $400, and it is added on top of income tax. Half of it is deducted from your income.' },
  qbi3: { title: 'Business income deduction', text: 'Most people with business profit can deduct 20% of it from taxable income. It is called the qualified business income deduction. You get it whether you itemize or take the standard deduction, and it lowers income tax only, not self-employment tax.' },
  estimates3: { title: 'Quarterly estimated taxes', text: 'Tax is pay-as-you-go. With no employer withholding from gig income, you pay it yourself in four estimated payments using Form 1040-ES. They are due April 15, June 15, September 15, and January 15 of the next year. A balance of $1,000 or more is one part of the test. Check the safe harbor and use Form 1040-ES to see what to pay.' },
  safeharbor: { title: 'The safe harbor', text: 'You can generally avoid an underpayment penalty if your payments are on time and cover at least 90% of this year\'s tax, or 100% of last year\'s tax. If last year\'s income was over $150,000, that second figure is 110%. The penalty is worked out quarter by quarter, so one big payment at the end does not erase a penalty for the early quarters.' },
  schedC: { title: 'Schedule C', text: 'Schedule C is where a one-person business reports its year: everything that came in, minus the expenses, equals net profit. The net profit goes on your Form 1040 as income, and it is also the number self-employment tax is figured on.' },
  meals3: { title: 'Meals, and what never counts', text: 'A business meal with a client is 50% deductible. Your own lunch on a normal work day is personal. Clothing counts only if it is required for the work and not suitable for everyday wear. Fines and penalties paid to a government are never deductible.' },
  tip3Log: { title: 'Tip: write the log at the time', text: 'A mileage log needs the date, the distance, and the business reason for each trip, written down when it happens. A log rebuilt from memory months later is the first thing an auditor throws out.' },
  tip3Jan: { title: 'Tip: the January payment', text: 'The fourth estimated payment is due January 15 of the following year, not in December and not with your return in April. It is the one people forget.' },
  tip3K: { title: 'Tip: reading a 1099-K', text: 'Form 1099-K reports gross payments. Platform fees, refunds you gave, and shipping you paid are still inside that number. Report the gross and then deduct those costs, or you will pay tax on money you never kept.' },
  pro3Hobby: { title: 'Pro: hobby or business', text: 'The IRS looks at whether you act like a business: you keep records, put in regular time, and try to make a profit. A hobby reports its income and deducts nothing. A real business with a loss can use that loss against other income.' },
  pro3Sep: { title: 'Pro: retirement for the self-employed', text: 'Self-employed people can open a SEP IRA or a Solo 401(k). A SEP takes up to about 20% of net self-employment profit. A Solo 401(k) also lets you put in employee contributions, up to the $24,500 limit for 2026 across all your 401(k) plans. Both come off this year\'s income.' },
  pro3Health: { title: 'Pro: self-employed health insurance', text: 'If you are self-employed and cannot get coverage through your own or your spouse\'s employer, you can deduct the health insurance premiums you pay for yourself and your family. It comes off your income directly, with no need to itemize.' },
  pro3Office: { title: 'Pro: the home office', text: 'A home office counts only if the space is used regularly and only for the business. The simple method is $5 a square foot, up to 300 square feet, for a most of $1,500. An employee working from home for an employer cannot claim it.' },
  pro3Car: { title: 'Pro: choosing a vehicle method', text: 'To use the standard mileage rate on a vehicle you own, choose it in the first year you use the vehicle for business. After that you may switch between methods year by year. Start with actual costs and you are usually locked out of the mileage rate for that vehicle.' },
  pro3Bank: { title: 'Pro: a separate account', text: 'Run the gig through its own bank account. Match deposits to sales and payments to receipts. Label transfers and loan proceeds separately so they do not get counted as sales. Mixing it with grocery money is how deductions get lost.' },
  pro3W4: { title: 'Pro: withhold instead of estimating', text: 'If you also have a paycheck, you can cover gig tax by raising the withholding on your W-4 instead of sending estimates. Withholding is treated as if it were paid evenly through the year, even when it comes out late in the year.' },
  pro3Hire: { title: 'Pro: when you pay a helper', text: 'When your business pays an independent contractor $2,000 or more in 2026, you are the one who must send a Form 1099-NEC, by January 31. Get a Form W-9 with their name and tax ID before you pay them the first time.' },
});
Object.assign(LQ.ITEMS, {
  gigsign: { name: 'Gig Shingle', desc: 'Open for business. The tax office noticed.' },
  forms1099: { name: '1099 Bundle', desc: 'Some income arrives with a form. All of it counts.' },
  books3: { name: 'Expense Ledger', desc: 'Ordinary, necessary, and written down.',
    status: () => HUNT.filter(got).map(id => SL[id].name + ' · ' + M(SL[id].counts) + ' deductible').join('\n') || 'No expense slips found yet.' },
  seslip: { name: 'Schedule SE Slip', desc: 'Both halves of Social Security and Medicare: 15.3%.' },
  vouchers: { name: '1040-ES Vouchers', desc: 'April, June, September, January.' },
  schedc: { name: 'Schedule C', desc: 'What came in, minus what it cost.' },
  medal3: { name: "Sidewinder's Rattle", desc: 'Proof that you ran Slick out of the Gulch.' },
  return3: { name: 'Stamped Return with Schedule C', desc: 'A day job, a gig, and one honest return.' },
});

// ---------- documents
const gigDoc = { sel: 0, draw(c) {
  const G = GIGS[IDS[this.sel]], L = (i, a, b, o) => D.line(c, 84, 62 + i * 31, 470, a, b, Object.assign({ size: 23 }, o));
  D.paper(c, 60, 20, 840, 272, G.name.toUpperCase(), 'You ' + G.what);
  let i = 0;
  G.income.forEach(r => L(i++, r[0], M(r[1]), D.GREEN));
  G.costs.forEach(r => L(i++, r[0], '-' + M(r[1])));
  D.sideBox(c, 'A YEAR OF THIS GIG', [['Coming in', M(G.gross)], ['Costs', '-' + M(G.cost)], 0, ['Profit', M(G.gross - G.cost), D.GREEN], [G.lines[2], '', { size: 19, color: '#5a5490' }]]);
} };
const incDoc = { hl: null, draw(c) {
  const G = gig(), L = (i, a, b, o) => D.line(c, 84, 66 + i * 38, 470, a, b, o);
  D.paper(c, 60, 20, 840, 272, 'WHAT YOU WERE PAID', G.name + '  ' + TX.year);
  G.income.forEach((r, i) => { L(i, r[0], M(r[1]), { hl: this.hl === r[2] || this.hl === 'all' }); c.font = F(19); c.textAlign = 'left'; c.fillStyle = r[2] === 'none' ? '#b0332e' : '#1f6f5c'; c.fillText(FORM[r[2]], 100, 66 + i * 38 + 22); });
  D.sideBox(c, 'PAPERWORK', [['On a 1099', M(G.formed)], ['No form', M(G.unformed), G.unformed ? D.RED : {}], 0, ['Taxable', this.hl === 'all' ? M(G.gross) : '________', { hl: this.hl === 'all' }]]);
} };
const schedDoc = { hl: -1, draw(c) {
  const f = LQ.fin3({ est: 0 }), G = f.G, L = (i, a, b, o) => D.line(c, 84, 62 + i * 31, 470, a, b, Object.assign({ size: 23 }, o));
  D.paper(c, 60, 20, 840, 272, 'SCHEDULE C', 'Profit or Loss From Business (simplified)');
  let i = 0;
  L(i++, 'Gross receipts', M(G.gross), { hl: this.hl === 0 });
  G.costs.forEach(r => L(i++, r[0], '-' + M(r[1]), { hl: this.hl === 1 }));
  if (f.slips) L(i++, 'Expense slips found', '-' + M(f.slips), D.GREEN);
  if (f.tools) L(i++, 'Gig Tool Kit', '-' + M(f.tools), D.GREEN);
  D.sideBox(c, 'PROFIT OR LOSS', [['Gross receipts', M(f.gigGross)], ['Expenses', '-' + M(f.gigExp)], 0, ['Net profit', M(f.gigProfit), Object.assign({ hl: this.hl === 2 }, D.GREEN)]]);
} };
const seDoc = { show: 0, draw(c) {
  const f = LQ.fin3({ est: 0 }), L = (i, a, b, o) => D.line(c, 84, 66 + i * 38, 470, a, b, o), sh = this.show;
  D.paper(c, 60, 20, 840, 272, 'SCHEDULE SE', 'Self-Employment Tax (simplified)');
  L(0, f.shop ? 'Net profit, shop and gig' : 'Net profit from Schedule C', M(f.biz));
  L(1, 'Times 92.35%', M(f.biz * TX.seBase));
  L(2, 'Times 15.3%: the tax', sh > 0 ? M(f.se) : '________', { hl: sh === 1, vcolor: '#b0332e' });
  L(3, 'Half comes off your income', sh > 1 ? '-' + M(f.half) : '________', Object.assign({ hl: sh === 2 }, D.GREEN));
  D.sideBox(c, 'SOCIAL SECURITY + MEDICARE', [['Employee pays', '7.65%'], ['Employer pays', '7.65%'], 0, ['On your own', '15.3%', D.RED]]);
} };
const estDoc = { pick: 0, draw(c) {
  const p = this.pick, f = LQ.fin3({ est: p }), q = f.quarter, L = (i, a, b, hl) => D.line(c, 84, 66 + i * 38, 470, a, b, { hl });
  D.paper(c, 60, 20, 840, 272, 'FORM 1040-ES', 'Estimated Tax Payments (simplified)');
  const amt = i => M(p === 0 ? q : p === 1 ? 0 : i === 3 ? q * 4 : 0);
  L(0, '1st payment   due April 15', amt(0), p !== 0); L(1, '2nd payment   due June 15', amt(1), p !== 0);
  L(2, '3rd payment   due September 15', amt(2), p !== 0); L(3, '4th payment   due January 15', amt(3), p === 2);
  L(4, 'Paycheck withholding', M(f.baseWh));
  D.sideBox(c, 'THE YEAR AHEAD', [['Tax for the year', M(f.total)], ['Paid in', M(f.withheld), { hl: true }], 0, [f.diff >= 0 ? 'Refund' : 'Owed in April', M(Math.abs(f.diff)), f.diff >= 0 ? D.GREEN : D.RED], [p === 0 ? 'No penalty' : 'Plus a penalty', '', { size: 20, color: p === 0 ? '#1f6f5c' : '#b0332e' }]]);
} };
const slipDoc = { draw(c) {
  const f = LQ.fin3({ est: 0 }), ids = HUNT.filter(got);
  D.paper(c, 50, 12, 610, 334, 'YOUR EXPENSE SLIPS', ids.length + ' of ' + HUNT.length + ' found');
  ids.forEach((id, i) => {
    const r = SL[id], y = 56 + i * 38, dead = !r.counts;
    c.font = F(23); c.textBaseline = 'top'; c.textAlign = 'left'; c.fillStyle = dead ? '#9a8f76' : '#15122e'; c.fillText(r.name, 70, y);
    c.textAlign = 'right'; c.fillText(M(r.amt), 500, y); c.fillStyle = dead ? '#b0332e' : '#1f6f5c'; c.fillText(dead ? 'no' : M(r.counts), 580, y);
    c.font = F(18); c.fillStyle = '#5a5490'; c.textAlign = 'left'; c.fillText(r.note, 86, y + 20);
  });
  if (!ids.length) { c.font = F(24); c.fillStyle = '#5a5490'; c.textAlign = 'left'; c.fillText('No slips found yet.', 70, 60); }
  c.font = F(18); c.textAlign = 'right'; c.fillStyle = '#5a5490'; c.fillText('spent', 500, 38); c.fillText('counts', 580, 38);
  D.paper(c, 676, 12, 240, 334, 'SCHEDULE C');
  const L = (i, a, b, o) => D.line(c, 692, 62 + i * 36, 208, a, b, Object.assign({ size: 23 }, o));
  L(0, 'Gross', M(f.gigGross)); L(1, 'Costs', '-' + M(f.gigBase + f.tools)); L(2, 'Slips', '-' + M(f.slips), D.GREEN);
  D.rule(c, 692, 62 + 3 * 36 - 4, 208); L(3.2, 'Profit', M(f.gigProfit), D.GREEN);
  L(5, 'SE tax', M(f.se), D.RED);
} };

// ---------- quest scripts
const advance3 = () => {
  const s = st(); s.q3++; LQ.audio.sfx('fanfare'); ui.toast('New quest: ' + LQ.QUESTS3[s.q3].short);
  const c = LQ.career(), base = c.kind === 'se' ? c.pay - 35 + Math.floor(LQ.hash(s.day, 9, s.seed) * 90) : c.pay;
  LQ.gain(0, base + 50 + (s.gig ? 40 : 0), s.gig ? 'Payday and gig money' : 'Household payday'); LQ.tick();
};
const FOUND = {
  xSupply: () => `A receipt for ${M(SL.xSupply.amt)} of supplies for the gig. Ordinary, necessary, and all of it counts.`,
  xPhone: () => `Your phone bill for the year: ${M(SL.xPhone.amt)}. You use the phone about half for the gig and half for the family, so half of it counts: ${M(SL.xPhone.counts)}.`,
  xLicense: () => `Your Canyon vendor license: ${M(SL.xLicense.amt)}. A license the business needs in order to operate counts in full.`,
  xMeal: () => `A tavern bill: ${M(SL.xMeal.amt)} for lunch with a client, where you talked over a job. Business meals count at 50%, so ${M(SL.xMeal.counts)} of it goes on Schedule C. Write the client's name and the reason on the receipt.`,
  xLunch: () => `A receipt for ${M(SL.xLunch.amt)}: your own lunch on a work day. Everybody has to eat. That is a personal cost and does not count.`,
  xBoots: () => `A receipt for ${M(SL.xBoots.amt)} of boots. You wear them to work, and also everywhere else. Clothing you could wear on any ordinary day does not count.`,
  xFine: () => `A ${M(SL.xFine.amt)} fine for leaving your cart in front of the Assay Office. Fines and penalties paid to a government are never deductible, even when you got one while working.`,
};
async function found(id) {
  const s = st(); if (s.rcpt[id]) return;
  s.rcpt[id] = true; LQ.audio.sfx('coin');
  await say(null, FOUND[id]());
  LQ.gain(5, 10, 'Slip found');
  const left = HUNT.filter(x => !got(x)).length;
  ui.toast(left ? left + ' expense slip' + (left > 1 ? 's' : '') + ' still out there' : 'Every expense slip found!');
}

async function begin() {
  const s = st(); s.q3 = 0; s.season = 'summer';
  const y = LQ.yearPass();
  await say(null, 'Another year on. Coral is four, the cottage roof has stopped leaking, and the household budget has one stubborn gap in it.');
  await say(null, 'East of Shelter Coast lies Hustle Canyon, where half the Ledgerlands earns a little extra on the side. You have decided to join them.');
  await say(null, 'A side gig is a business, and a business has its own tax rules. Find Guildmistress Juniper at the Hustle Hall, in the north-west corner of town.');
  if (y && y.div) ui.toast('A year of dividends: +' + (y.div - y.tax) + ' coins');
}
async function qJuniper() {
  const s = st(), own = isOwner();
  await say(N.juniper, 'A new face! Welcome to the Hustle Hall. Everyone in this canyon works for themselves, at least for part of the week.');
  await say(N.juniper, own ? 'You already run a candle shop, so you know the life. A second line of work is a second business, and the kingdom adds the two together.'
    : 'At your day job you are an employee. Your employer withholds tax from every paycheck and pays half of your Social Security and Medicare. Out here nobody does either. You are an independent contractor.');
  await ask(N.juniper, 'So. When you work for yourself, who takes the tax out of what you are paid?', ['Nobody. Paying it is my job now', 'The customer, the same as an employer would', 'The Guild, once a year'],
    { wrong: ['Customers pay you in full and walk away. The tax is yours to set aside.', 'I wish we were that organized. No. It is on you.'] });
  await say(N.juniper, 'Right. Now pick your trade. Three are hiring. Each one earns differently and has different costs, so each one makes a different tax return.');
  let pick;
  for (;;) {
    ui.doc = gigDoc;
    pick = await choose(N.juniper, 'Which gig will you take?', IDS.map(id => GIGS[id].name + ': ' + GIGS[id].what), i => { gigDoc.sel = i; });
    const G = GIGS[IDS[pick]];
    if (await choose(N.juniper, `${G.name}. About ${M(G.gross)} a year coming in, before costs. Sure?`, ['Yes, sign me up', 'Let me look again']) === 0) break;
  }
  ui.doc = null; s.gig = IDS[pick]; LQ.audio.sfx('stamp');
  await say(N.juniper, gig().welcome);
  await say(N.juniper, 'One warning for your journal. If you mean to make a profit and you work at it regularly, it is a business. If it is only for fun, it is a hobby: the income is still taxed, and you cannot deduct a single expense. Treat this like a business and keep records from the first day.');
  LQ.learn('gig3'); LQ.give('gigsign');
  await say(N.juniper, 'A year of work goes by fast out here. When the payments have come in, take them next door to Teller Mesa at the 1099 Depot. Here is a little something to get you started.');
  LQ.gain(0, 60, 'Guild welcome'); advance3();
}
const PAID = {
  driver: () => `Trailhail paid you ${M(21000)} across 900 rides. A payment platform sends Form 1099-K when it pays you more than ${M(TX.kThreshold)} in more than ${TX.kCount} payments. You are over both lines, so a 1099-K is coming, and the kingdom gets a copy. Your ${M(1000)} of private bookings came in cash. Nobody sends a form for those.`,
  seller: () => `The Bazaar Board paid you ${M(16000)} across 340 orders. The Bazaar Board only has to send Form 1099-K above ${M(TX.kThreshold)} and ${TX.kCount} payments. It did not send one, so use your sales records.`,
  scribe: () => `Ironwood Mining paid you ${M(9000)} and Mesa Outfitters paid ${M(3600)}. A business that pays a contractor ${M(TX.necThreshold)} or more in 2026 must send Form 1099-NEC, so both of them will. Old Prospector Pete paid you ${M(1400)}. That is under ${M(TX.necThreshold)}, so he sends nothing.`,
};
async function qMesa() {
  const G = gig();
  await say(N.mesa, `The new ${G.name}! I sort every tax form that comes into this canyon. Let us see what a year of your gig looks like on paper.`);
  incDoc.hl = null; ui.doc = incDoc;
  await say(N.mesa, PAID[G.id]());
  incDoc.hl = 'none';
  await ask(N.mesa, `You were paid ${M(G.gross)} in all. Forms cover ${M(G.formed)} of it. How much is taxable income?`,
    [`All ${M(G.gross)}. Income counts with or without a form`, `Only what is on a form: ${M(G.formed)}`, `None of it until it passes ${M(TX.kThreshold)}`],
    { wrong: ['The form is paperwork. The income is taxable either way.', 'That line decides when a platform must send a form. It is not a tax-free allowance.'] });
  incDoc.hl = 'all'; LQ.audio.sfx('coin');
  await say(N.mesa, 'Every coin. The thresholds only decide who has to send paperwork. They never decide what is taxed. Cash, small jobs, sales under the line: all of it goes on your return.');
  await say(N.mesa, G.id === 'driver' ? `One trap with your form. A 1099-K shows the gross: ${M(21000)}, before Trailhail kept its ${M(4200)} commission. You report the gross and then deduct the commission as an expense. Skip that step and you pay tax on money you never held.`
    : G.id === 'seller' ? 'And if you ever do cross the line and a 1099-K arrives, remember that it shows the gross, before the Bazaar Board kept its fees. You report the gross and deduct the fees as an expense.'
    : 'When the forms arrive in January, check each one against your own records. If a client reports the wrong amount, ask them to correct it before you file. The kingdom matches what they sent against what you report.');
  await LQ.quiz(N.mesa, 'A customer pays you in cash and no form is ever sent. What do you do?', ['Report it as income anyway', 'Leave it off. No form, no tax', 'Report half, to be fair'], 'All business income goes on the return.');
  ui.doc = null; LQ.learn('f1099'); LQ.learn('allincome'); LQ.give('forms1099');
  await say(N.mesa, `Now the better half of the story. You are taxed on profit, not on what came in. Bookkeeper Lupe at the Ledger Shack, across the road to the north-east, will show you what comes off.`);
  advance3();
}
const COSTS = {
  driver: () => `For a cart you choose between two methods. The standard mileage rate is 72.5 cents a mile for the first half of 2026 and 76 cents from July. It already covers fuel, repairs, insurance, and wear, so you cannot deduct those again. On your 10,000 business miles it comes to ${M(GIGS.driver.costs[0][1])}. Tolls and parking on a job are extra. Or you track every actual cost and take the business share.`,
  seller: () => `For a maker, the biggest line is the cost of the goods you sold: the clay, glaze, and kiln fuel that went into the pots that left your shelf, ${M(GIGS.seller.costs[0][1])} this year. Selling fees and shipping come off as well.`,
  scribe: () => `Your biggest write-off is the desk. A home office counts only if the space is used regularly and only for the business. The simple method is ${M(TX.homeOfficeRate)} a square foot, up to ${TX.homeOfficeMaxSqft} square feet. Yours is 150 square feet, so ${M(GIGS.scribe.costs[0][1])}. The kitchen table where Coral eats breakfast would not qualify.`,
};
async function qLupe() {
  const s = st(), G = gig();
  await say(N.lupe, `So you are the new ${G.name}. Teller Mesa counted what came in. I count what went out, and what went out is where people leave money on the table.`);
  schedDoc.hl = 0; ui.doc = schedDoc;
  await say(N.lupe, `This is Schedule C. The top line is everything customers paid you: ${M(G.gross)}. Under it go your business expenses. What is left at the bottom is net profit, and net profit is the only number the kingdom taxes.`);
  await ask(N.lupe, 'Which costs can a business deduct?', ['Costs that are ordinary and necessary for the work', 'Anything I bought during a work week', 'Only costs a client agreed to in writing'],
    { wrong: ['Buying it on a Tuesday does not make it a business cost. It has to be for the business.', 'No permission needed. The test is whether the cost is ordinary and necessary in your trade.'] });
  schedDoc.hl = 1;
  await say(N.lupe, COSTS[G.id]());
  await say(N.lupe, G.id === 'driver' ? 'And hear this twice. The drive from your home to a regular workplace is commuting, and commuting never counts. Only the miles on a job do, and only with a log written at the time.'
    : 'If you ever drive for the business, the same care applies. Business miles count, with a log written at the time. Commuting never does.');
  await ask(N.lupe, `You use one phone for the gig and for the family, about half and half. The bill is ${M(SL.xPhone.amt)} a year. How much can the business deduct?`, [`The business half: ${M(SL.xPhone.counts)}`, `All ${M(SL.xPhone.amt)}. I need a phone to work`, 'Nothing. It is a personal phone'],
    { wrong: ['Only the share used for the business counts.', 'Mixed use is fine. You deduct the business share and keep a note of how you worked it out.'] });
  schedDoc.hl = 2;
  await say(N.lupe, `With the costs in your books so far, your profit is ${M(G.gross - G.cost)}. But I hear you dropped more slips than you filed. ${HUNT.length} of them are scattered around the canyon. Watch for a sparkle on the ground.`);
  await say(N.lupe, 'A word of warning. Not every slip you find will count. Some costs feel like business and are not. Tallyman Brick will go through them with you later.');
  ui.doc = null; LQ.learn('expenses3'); LQ.learn('mileage3'); LQ.give('books3');
  await say(N.lupe, 'Before that, there is a bill nobody warned you about. Assayer Flint, at the Assay Office just east of here, weighs it out for every newcomer.');
  advance3();
  LQ.REGIONS.canyon.addSlips(LQ.world, s);
}
async function qFlint() {
  const own = isOwner(), f = LQ.fin3({ est: 0 });
  await say(N.flint, own ? 'Ah, the candle maker with a second trade. You have met this tax before. I am here to tell you it follows you into the canyon.' : 'A newcomer with profit to weigh. Sit down. Most people take this one badly.');
  seDoc.show = 0; ui.doc = seDoc;
  await say(N.flint, own ? `Self-employment tax is figured on all of your business profit together. The shop made ${M(f.shop)} and the gig made ${M(f.gigProfit)}. One Schedule SE covers both: ${M(f.biz)}.`
    : 'At your day job, 7.65% of every paycheck goes to Social Security and Medicare, and your employer quietly pays another 7.65% on top. Out here you are the worker and the employer. You pay both halves.');
  await ask(N.flint, 'So what is the self-employment tax rate?', ['15.3%: both halves', '7.65%: the same as on a paycheck', '10%: the first bracket'],
    { wrong: ['That is only the worker half. Nobody is paying the other half for you now.', 'That is an income tax rate. This is a separate tax, on top of income tax.'] });
  seDoc.show = 1; LQ.audio.sfx('wrong');
  await say(N.flint, `15.3%, applied to 92.35% of your net profit. On ${M(f.biz)} that is ${M(f.se)}. It is owed on top of income tax, and it is owed once your net self-employment earnings reach ${M(TX.seMinimum)}, even if your income tax comes to nothing.`);
  if (!own) await say(N.flint, `Of that, ${M(f.seGig)} is brand new this year, and no paycheck withholding covers it. This is the number that surprises people in April.`);
  await ask(N.flint, 'There is one mercy. How much of the self-employment tax can you deduct from your income?', [`Half of it: ${M(f.half)}`, `All of it: ${M(f.se)}`, 'None of it'],
    { wrong: ['Only half. It mirrors the half an employer would have paid.', 'There is a deduction. Think of the half an employer normally covers.'] });
  seDoc.show = 2; LQ.audio.sfx('coin');
  await say(N.flint, `Half: ${M(f.half)}. It comes off your income before the brackets, whether or not you itemize.`);
  await say(N.flint, `And a second mercy. Most people with business profit can deduct 20% of it from taxable income. For you that is ${M(f.qbi)} this year. It lowers income tax only. Self-employment tax does not budge.`);
  ui.doc = null; LQ.learn('setax3'); LQ.learn('qbi3'); LQ.give('seslip');
  await say(N.flint, 'Now you know the size of the bill. The next question is when to pay it. Quartermaster Dune at the Quarter Station, south-west of the plaza, runs the calendar.');
  advance3();
}
async function qDune() {
  const s = st(), own = isOwner(), f0 = LQ.fin3({ est: 0 });
  await say(N.dune, own ? 'You have sent estimates for the shop before. The gig makes the bill bigger, so the estimates have to grow with it.' : 'Welcome to the Quarter Station. Your employer pays your tax in a little at a time, every paycheck. For the gig, that job is yours.');
  estDoc.pick = 0; ui.doc = estDoc;
  await say(N.dune, `Tax is pay-as-you-go. The gig adds about ${M(f0.gigBill)} to your household's bill: income tax plus self-employment tax. The kingdom wants it in four estimated payments, sent with Form 1040-ES.`);
  await ask(N.dune, 'The first three are due April 15, June 15, and September 15. When is the fourth?', ['January 15 of the next year', 'December 31', 'April 15, with the return'],
    { wrong: ['Close, but you get two more weeks. It is in January.', 'By April the year is long over. The fourth payment is due in January.'] });
  await say(N.dune, `January 15. If you expect to owe ${M(TX.estMinimum)} or more at filing, check whether withholding meets the safe harbor. Missing a required payment can cost you, quarter by quarter.`);
  await say(N.dune, 'There is a safe harbor. The usual targets are 90% of this year\'s tax or 100% of last year\'s. Pay enough on time and you can avoid a penalty even if you owe something in April.');
  const p = await choose(N.dune, 'How will you pay the tax on your gig?', [`Four payments of about ${M(f0.quarter)}, each on its due date`, 'Skip the estimates and settle up in April', 'One big payment in January for the whole year'], i => { estDoc.pick = i; });
  s.est3 = p; LQ.audio.sfx('stamp');
  const f = LQ.fin3({ est: p });
  await say(N.dune, [
    `On schedule. ${M(f.quarter)} a quarter, and with your paycheck withholding the household pays in about ${M(f.withheld)} against a bill near ${M(f.total)}. No surprise in April.`,
    `More coin in your purse all year. But only ${M(f.withheld)} goes in against a bill near ${M(f.total)}. The gap of ${M(Math.abs(f.diff))} comes due in April` + (f.diff <= -TX.estMinimum ? '. In the game, this shortfall also triggers an underpayment penalty.' : '.'),
    `The whole amount does get paid, so you will not owe much in April. But the penalty is worked out quarter by quarter. April, June, and September each came and went with nothing paid, and a penalty runs on all three.`][p]);
  ui.doc = null; LQ.learn('estimates3'); LQ.learn('safeharbor'); LQ.give('vouchers');
  await say(N.dune, 'Whatever you chose, the amounts follow your real profit. Find more expense slips and the bill shrinks. When you have hunted enough, Tallyman Brick next door will tally your Schedule C.');
  advance3();
}
async function qBrick() {
  const s = st(), n = HUNT.filter(got).length;
  await say(N.brick, 'Slips! Empty your pockets on the counter. All of them, even the ones you are embarrassed by.');
  ui.doc = slipDoc;
  if (n < HUNT.length) {
    const a = await choose(N.brick, `I count ${n} of your ${HUNT.length} lost slips. Each real expense you find lowers your tax.`, ['Tally what I have', 'Keep hunting first']);
    if (a === 1) { ui.doc = null; return say(N.brick, 'Good. Watch for the sparkle. I will keep the counter clear.'); }
  }
  await say(N.brick, 'Here is your year on one page: what came in, what the job cost, and what is left. Some of these slips are job costs, some are half, and some are not job costs at all. You sort them.');
  const f = await LQ.depth.budget(N.brick);
  const left = HUNT.length - HUNT.filter(got).length;
  await say(N.brick, `Net profit: ${M(f.gigProfit)}. A business expense can lower both your income tax and your self-employment tax. Your tax savings are only part of what you spent.` + (left ? ' Whatever else you find before you file still counts.' : ''));
  ui.doc = null; LQ.learn('schedC'); LQ.learn('meals3'); LQ.give('schedc');
  await LQ.depth.activityPage(7, N.brick);
  await say(N.brick, 'Now, a favor. Across Rattle Creek, in Off-the-Books Gulch, a fellow called Sidewinder Slick is telling gig workers that none of this applies to them. People are believing him. The rockfall on the Gulch trail has just been cleared.');
  await LQ.world.clear('gate', '#a8523a', 'South of the creek, the last boulders are hauled off the Gulch trail.');
  advance3();
}

function rows3(f) {
  const R = [], own = f.kind === 'se', G = f.G, b = f.b, add = (label, val, o) => R.push(Object.assign({ label, val }, o));
  add(own ? "Marlowe's wages  (W-2, Box 1)" : 'Wages  (both W-2s, Box 1)', f.wages, { note: own ? `Marlowe's Box 1: ${M(f.wages)}.` : `Your Box 1 plus Marlowe's: ${M(f.wages)}. The day jobs go on the return the same as last year.` });
  add(own ? 'Business profit  (shop + gig)' : 'Business profit  (Schedule C)', f.biz, { ask: [own ? 'Now the businesses. Which number moves from Schedule C to the return?' : 'Now the gig. Which number moves from Schedule C to the return?',
    [`Net profit: ${M(f.biz)}`, `Everything customers paid: ${M((own ? b.sales : 0) + f.gigGross)}`, `Only gig income that came with a form: ${M(G.formed)}`],
    ['That is before expenses. You are taxed on profit.', 'Every coin counts, form or no form, and then the expenses come off.']] });
  add('Half of self-employment tax', f.half, { sign: '-', note: `Half of your self-employment tax comes off your income: ${M(f.half)}.` });
  const other = f.adj - f.half;
  if (other) add('HSA and retirement savings', other, { sign: '-', note: `Your savings gear comes off next: ${M(other)}.` });
  add(f.itemize ? 'Itemized deductions' : f.giftStd ? 'Standard deduction + gifts' : 'Standard deduction', f.ded, { sign: '-',
    note: f.itemize ? `This year your itemized pile, ${M(f.itemized)}, beats the standard deduction.` : `No loan points this year, so your itemized pile is only ${M(f.itemized)}. The standard deduction wins. You check again every year.` });
  if (f.ot) add('Overtime deduction', f.ot, { sign: '-' });
  add('Business income deduction', f.qbi, { sign: '-', note: `The business income deduction: about 20% of your business profit, ${M(f.qbi)}.` });
  add('Taxable income', f.taxable, { ask: ['Taxable income. Everything you earned, minus every line with a minus sign. What is left?', [M(f.taxable), M(f.agi), M(f.taxable + f.qbi)],
    ['The big deduction lines still have to come off.', 'The business income deduction comes off too.']] });
  add('Income tax  (joint brackets)', f.tax, { note: 'Ledge by ledge on the joint mountain, exactly as before.' });
  add('Self-employment tax  (Schedule SE)', f.se, { sign: '+', ask: [`Schedule SE. Your business profit is ${M(f.biz)}. What goes on this line?`,
    [`${M(f.se)}: 15.3% of 92.35% of the profit`, `${M(f.half)}: only my own half`, 'Nothing. Paycheck withholding covers it'],
    ['Self-employed people pay both halves. The half you deducted earlier only lowered your income.', 'Paycheck withholding covers paychecks. Nobody withheld anything from your gig.']] });
  add('Credits  (child, care' + (f.saver ? ', saver)' : ')'), f.credits, { sign: '-', note: `Coral's ${M(f.ctc)} Child Tax Credit and the ${M(f.care)} care credit` + (f.saver ? `, plus a ${M(f.saver)} Saver's Credit` : '') + '. Credits come straight off the tax.'
    + (LQ.has('guide') && f.agi > TX.saverMaxAgiJoint ? ` Your Saver's Credit is gone this year. With the gig, the household's income is over the ${M(TX.saverMaxAgiJoint)} limit.` : '') });
  add('Paid in: withholding + estimates', f.withheld, { note: `Paycheck withholding of ${M(f.baseWh)}, plus ${M(f.est)} of estimated payments.` });
  R.push(D.settlementRow(f));
  return R;
}
async function qSage() {
  const s = st(), f = LQ.fin3(), rows = rows3(f), owed = f.diff < 0, amt = Math.abs(f.diff), FD = D.formDoc, e = s.est3 || 0;
  await say(N.sage, 'The Gulch has gone quiet, and my counter has a line out the door for the first time in months. Welcome to the Canyon Tax Office.');
  Object.assign(FD, { rows, vals: [], cur: 0, stamp: 0 }); ui.doc = FD;
  await say(N.sage, 'Same Form 1040 as ever. A gig adds two schedules to it. Schedule C carries your profit onto the income lines, and Schedule SE adds its own tax near the bottom. You fill it in. I hold the stamp.');
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]; FD.cur = i;
    if (r.ask) await ask(N.sage, r.ask[0], r.ask[1], { wrong: r.ask[2] });
    FD.vals[i] = r.val; LQ.audio.sfx('coin');
    if (r.note) await say(N.sage, r.note); else if (!r.ask) await LQ.wait(0.35);
  }
  FD.cur = -1;
  await LQ.wait(0.4); LQ.audio.sfx('stamp'); LQ.shake(0.25); await LQ.tween(0.35, k => { FD.stamp = k; });
  LQ.audio.sfx('fanfare'); await LQ.wait(0.8);
  await say(N.sage, amt === 0 ? 'Your payments match the tax exactly. There is no balance due or refund.' : [
    `${owed ? 'You owe' : 'A refund of'} ${M(amt)}. You paid your estimates on time, so the year landed close to even and there is no penalty.`,
    owed ? `You owe ${M(amt)}, all at once. Nothing was paid on the gig all year.` + (amt >= TX.estMinimum ? ` With ${M(TX.estMinimum)} or more due, an underpayment penalty can apply if you missed the safe harbor.` : '') : `A refund of ${M(amt)}, even with no estimates paid. Your withholding happened to cover it. That was luck, not a plan.`,
    `${owed ? 'You owe' : 'A refund of'} ${M(amt)}. The tax was paid, but in one lump in January. The penalty is figured quarter by quarter, so a small one applies for the three quarters you skipped.`][e]);
  let coins = LQ.clamp(Math.round(f.diff / 15), -350, 350);
  if (e === 0 && Math.abs(f.diff) < 1500) coins += 80;
  if (e === 1 && f.diff <= -TX.estMinimum) coins -= 60;
  if (e === 2) coins -= 25;
  LQ.gain(60, coins, owed ? 'Tax settled' : 'Refund');
  await say(N.sage, 'Filed, with every coin of the gig on it. Plenty of people out here cannot say the same.');
  ui.doc = null; LQ.give('return3'); s.q3 = 8; LQ.tick(); LQ.save();
  await ending3(f);
}
async function ending3(f) {
  const s = st(), owed = f.diff < 0, G = f.G;
  await LQ.fadeTo(1); ui.toasts = []; LQ.audio.play('title');
  ui.doc = { draw(c) {
    D.paper(c, 130, 20, 700, 458, 'CHAPTER 3 COMPLETE', f.c.name + ' and ' + G.name);
    c.textAlign = 'center'; c.textBaseline = 'top'; c.font = F(20, true); c.fillStyle = '#1f6f5c'; c.fillText(LQ.rank().toUpperCase(), 480, 70);
    const L = (i, a, b, o) => D.line(c, 170, 106 + i * 29, 620, a, b, Object.assign({ size: 24 }, o));
    L(0, 'Gig receipts', M(f.gigGross)); L(1, 'Gig expenses', M(f.gigExp)); L(2, 'Gig net profit', M(f.gigProfit), D.GREEN);
    L(3, 'Self-employment tax', M(f.se), D.RED); L(4, 'Total federal tax', M(f.total)); L(5, D.settlement(f), M(Math.abs(f.diff)), owed ? D.RED : D.GREEN);
    L(6, 'Expense slips found', HUNT.filter(got).length + ' of ' + HUNT.length); L(7, 'Right on the first try', s.first + ' of ' + s.asked);
    L(8, 'Savvy', String(s.savvy)); L(9, 'Net worth', String(LQ.netWorth()), D.GREEN);
    L(10, 'Journal entries', s.journal.length + ' of ' + Object.keys(LQ.JOURNAL).length);
    c.font = F(22); c.textAlign = 'center'; c.fillStyle = '#5a5490';
    ui.wrap(c, 'Three chapters down. Every town stays open for trading, shopping, and audits.', 620).forEach((ln, i) => c.fillText(ln, 480, 430 + i * 22));
  } };
  await LQ.fadeTo(0); await LQ.pressOk();
  ui.doc = { draw(c) { LQ.drawWorldMap(c, 110, 40, 740, 420); } };
  await LQ.pressOk();
  await LQ.fadeTo(1, 0.3); ui.doc = null; LQ.world.music(); await LQ.fadeTo(0, 0.9);
  await LQ.world.clear('roadblock', '#c98f55', 'At the top of town, the guards roll the barricade off the North Trail.');
  await say(null, 'Next: Chapter 4, the Summit of Gains, where your savings start to earn money of their own. The North Trail is open. Press J to reread your Tax Journal.');
}

// ---------- Off-the-Books Gulch
const SLICK = { name: 'Sidewinder Slick' };
const MYTHS3 = [
  { myth: 'No form, no income! If nobody mailed ye a 1099, the kingdom never has to know!',
    opts: ['All income is taxable, with or without a form.', 'True. Only income on a form counts.', 'True, as long as it was paid in cash.'],
    truth: 'The thresholds decide who sends paperwork. They never decide what is taxed.' },
  { myth: "It is only SIDE money! Side money ain't real income!",
    opts: ['Side income is income, and it owes self-employment tax too.', 'True. Only my main job is taxed.', 'True, if it is under $10,000.'],
    truth: 'Gig profit goes on the same return as wages, and self-employment tax starts at $400 of net earnings.' },
  { myth: 'Write off EVERYTHING! Yer lunch, yer boots, yer dog! It is all business now!',
    opts: ['Only costs that are ordinary and necessary for the business count.', 'True. A business owner can deduct anything.', 'Only the dog, as a guard dog.'],
    truth: 'Personal costs stay personal. Mixed costs count only for their business share.' },
  { myth: 'Estimated taxes are for SUCKERS! Settle up in April like everybody else!',
    opts: ['Tax is pay-as-you-go. Skipping the quarters brings a penalty.', 'True. April is the only deadline.', 'Estimates are only for big companies.'],
    truth: 'Four payments: April, June, September, and January. Miss them and the penalty builds quarter by quarter.' },
  { myth: 'Call it a HOBBY and the tax just blows away!',
    opts: ['Hobby income is still taxed, and a hobby cannot deduct its costs.', 'True. Hobbies are tax-free.', 'True, for the first three years.'],
    truth: 'Calling a business a hobby keeps the tax and throws away the deductions.' },
  { myth: 'Deduct every mile ye drive! Home to work, work to home, all of it!',
    opts: ['Commuting never counts. Only business miles, with a log.', 'True. All driving is business driving.', 'Only the trip home counts.'],
    truth: 'Business miles need a log written at the time. The trip to a regular workplace is commuting.' },
  { myth: 'Form an LLC and ye never pay self-employment tax again!',
    opts: ['A one-person LLC is taxed just like any other sole owner.', 'True. LLCs are tax-free.', 'True, if the name ends in "and Sons".'],
    truth: 'By default a one-person LLC files the same Schedule C and pays the same self-employment tax.' },
];
LQ.BOSSES.slick = {
  who: SLICK, label: 'SIDEWINDER SLICK', kind: 'slick', move: 'devils', sky: ['#12061a', '#7a1f5a'], hill: '#3a1230', ground: ['#452443', '#6a3a62'], fog: '230,170,90', bar: ['#c9781c', '#f6d08a'], ink: '#7a3a12',
  approach: 'A hot wind spins the dust into a shape with a hat, a bandana, and a fistful of unreported cash.',
  intro: ['Well, well. A working stiff with a tax form. Name is Slick. I teach folks in this canyon how to keep what they earn. All of it. Off the books.', 'Every word I say, somebody down here believes. Let us see if ye are any smarter.'],
  taunt: 'Heh heh heh. That is the spirit. Cash only, friend.', fogLine: 'The dust gets in your eyes.',
  myths: () => MYTHS3,
  final: () => {
    const f = LQ.fin3(), own = f.kind === 'se';
    return { bubble: `FINE! Then tell me this, bookworm. Yer ${own ? 'businesses' : 'gig'} cleared ${M(f.biz)} in profit. What is the self-employment tax on it? Ye will NEVER get it right!`, prompt: 'Run him out of town:',
      opts: [`15.3% of 92.35% of the profit: ${M(f.se)}`, `7.65% of the profit: ${M(f.biz * 0.0765)}`, 'Nothing. It was not a paycheck'],
      wrong: ['That is the half an employee pays. You pay both halves.', 'No paycheck is exactly why it is owed. Nobody withheld it for you.'], strike: `${M(f.se)}. Both halves, on 92.35% of the profit. And half of it comes back off my income.` };
  },
  lastWords: 'No! Receipts! Records! Quarterly payments! Ye are ruining a perfectly good racket... I am... blowing... away...',
  after: 'Sidewinder Slick comes apart into dust. A wad of cash drops where he stood. Every note in it is a blank scrap of paper.',
  win: async () => {
    const s = st();
    s.flags.boss3 = true; s.q3 = 7; LQ.give('medal3'); LQ.gain(50, 140, 'Sidewinder Slick run off');
    LQ.tick(); if (s.prices && s.prices.DUST != null) { s.prev.DUST = s.prices.DUST; s.prices.DUST *= 1.45; s.gazette.unshift('The Gulch is safe again! Dust Devil Couriers reopens the south route.'); }
  },
  done: async () => { ui.toast('New quest: ' + LQ.QUESTS3[7].short); await say(null, 'The dust settles over the Gulch. One task remains: take your Schedule C to the Canyon Tax Office, south-east of the plaza, and file.'); },
};

// ---------- villagers who teach expert moves
const TIPS = {
  whittle: { j: 'pro3Hobby', lines: ['I carve canyon wrens. Sold two last year, gave away forty. The tax office asked whether I was a business or a hobby.', 'They look at whether you act like a business: records, regular hours, and a real try at profit. A hobby reports its income and deducts nothing. A real business that loses money in a year can use the loss against its other income. I decided to carve for fun and stop pretending.'],
    q: ['A hobby sells something for $300. What happens at tax time?', ['The $300 is income, and no expenses can be deducted', 'Nothing. Hobbies are tax-free', 'The $300 is income, and all costs come off']] },
  silver: { j: 'pro3Sep', lines: ['Forty years a prospector and no employer ever offered me a retirement plan. So I made my own.', 'A SEP IRA takes up to about 20% of your net self-employment profit. A Solo 401(k) can take more, because you contribute as the worker and as the boss. Either one comes straight off this year\'s income.'],
    q: ['Who can open a SEP IRA or a Solo 401(k)?', ['People with self-employment income', 'Only people with no other job', 'Only companies with ten or more workers']] },
  poppy: { j: 'pro3Health', lines: ['I left the infirmary to open my own practice, and the first thing I lost was the health plan.', 'If you are self-employed and cannot get coverage through your own employer or your spouse\'s, the premiums you pay for yourself and your family are deductible. It comes off your income directly, no itemizing. You have Marlowe\'s shipyard plan, so it does not apply to you. Remember it if that ever changes.'],
    q: ['When can a self-employed person deduct health insurance premiums?', ["When no employer plan is available through them or their spouse", 'Always, on top of an employer plan', 'Only if they itemize']] },
  loom: { j: 'pro3Office', lines: ['My loom fills the back room. Nothing else happens in there. No guests, no laundry, no children.', 'That is what makes it a home office: regular use, and only for the business. The simple method is $5 a square foot, up to 300 square feet. And it is for the self-employed. An employee working from home for a boss gets nothing.'],
    q: ['What makes a room count as a home office?', ['It is used regularly and only for the business', 'It has a desk in it', 'I answer letters there on weekends']] },
  axle: { j: 'pro3Car', lines: ['I chose the standard mileage rate the first year I put my wagon to work. Smartest thing I did.', 'Pick the mileage rate in the first year a vehicle is used for business and you can switch methods later. Start with actual costs instead and you are usually locked out of the mileage rate for that vehicle. Either way, keep a log.'],
    q: ['When must you choose the standard mileage rate to keep it as an option for a vehicle you own?', ['In the first year the vehicle is used for business', 'Any year you like', 'Only after five years']] },
  penny: { j: 'pro3Bank', lines: ['Half the people who come to my window pay for clay and groceries from the same purse. Then April comes and they cannot tell which was which.', 'Open a separate account for the gig. Label sales, expenses, and transfers as you go. A bank statement helps you check your books, and receipts show what each expense was for.'],
    q: ['Why keep a separate bank account for a side gig?', ['It keeps business income and expenses easy to prove', 'The law gives it a lower tax rate', 'It hides the income']] },
  tack: { j: 'pro3W4', lines: ['I drive nails for the mining company by day and build fences on the side. I have never sent an estimated payment in my life.', 'I raised the withholding on my W-4 at the day job instead. Withholding is treated as if it were paid evenly through the year, even when it comes out late. For someone with a paycheck and a gig, it is the easy way to stay out of penalties.'],
    q: ['How can someone with a paycheck cover the tax on a side gig without sending estimates?', ['Raise the withholding on their W-4', 'Ask the gig customers to withhold', 'Wait for a refund']] },
  cinder: { j: 'pro3Hire', lines: ['I took on a striker for the busy season and paid him as a contractor. Then January came and I learned I had homework.', `Pay an independent contractor $2,000 or more in 2026 and you must send them Form 1099-NEC by January 31, with a copy to the kingdom. Get a Form W-9 with their name and tax ID before the first payment. Chasing it afterward is miserable.`],
    q: ['Your business pays a contractor $3,000 in 2026. What must you send them?', ['Form 1099-NEC, by January 31', 'Form W-2, by April 15', 'Nothing. That is their problem']] },
};
async function tip(id) {
  const t = TIPS[id], who = N[id], s = st();
  if (s.tips['c3' + id]) return say(who, LQ.JOURNAL[t.j].text);
  for (const ln of t.lines) await say(who, ln);
  if (await LQ.quiz(who, t.q[0], t.q[1], 'Talk to me again and we will go over it once more.')) {
    s.tips['c3' + id] = true; LQ.gain(15, 30, 'Expert tip'); LQ.learn(t.j); LQ.tick();
    await say(who, 'You have got it. I wrote it in your Tax Journal.');
  }
}

// ---------- everyday chatter
const CORAL = ['I am four now. That is almost five.', 'I have a gig too. I sell rocks. Marlowe bought one.', 'The cactus is NOT for hugging. I checked.', 'Is a lizard a dependent?'];
const idle = {
  juniper: async () => say(N.juniper, q3() >= 8 ? `Best ${gig().name} this canyon has seen, and the only one with tidy books.` : 'Keep records from the first day. ' + LQ.curQuest().text + '.'),
  mesa: async () => say(N.mesa, q3() < 1 ? 'No forms for you yet. See Guildmistress Juniper at the Hustle Hall and pick a trade first.' : 'A form is paperwork. Income is income. I tell everyone twice.'),
  lupe: async () => say(N.lupe, q3() < 2 ? 'My ledgers are full today. Count what you were paid with Teller Mesa first.' : 'Ordinary and necessary. And write down what each one was for.'),
  flint: async () => say(N.flint, q3() < 3 ? 'Nothing to weigh yet. Bookkeeper Lupe will send you over when your expenses are sorted.' : '15.3%, both halves. Then half of it comes off your income. Do not forget the mercy.'),
  dune: async () => say(N.dune, q3() < 4 ? 'The calendar means nothing until you know the size of the bill. See Assayer Flint first.' : 'April, June, September, January. Mark all four.'),
  brick: async () => say(N.brick, q3() < 5 ? 'I tally slips, and yours are not ready. Come back once your payments are planned with the Quartermaster.' : 'A deduction gives part of the cost back. Never all of it.'),
  sage: async () => say(N.sage, q3() < 7 ? 'The filing window is not open for you yet. Bring a Schedule C and a clear head.' : 'Filed and stamped, gig and all. See you next April.'),
  marlowe: async () => say(N.marlowe, q3() >= 8 ? 'A day job, a gig, and you still found time to carry Coral around the plaza. I married well.' : q3() >= 1 ? 'Coral and I came out to watch you work. She has been telling people you are famous. ' + LQ.curQuest().text + '.' : 'A second income would help with the roof fund. Go and see what the Guild has. ' + LQ.curQuest().text + '.'),
  coral: async () => say(N.coral, CORAL[Math.floor(Math.random() * CORAL.length)]),
};
const QUEST_FN = { juniper: [0, qJuniper], mesa: [1, qMesa], lupe: [2, qLupe], flint: [3, qFlint], dune: [4, qDune], brick: [5, qBrick], sage: [7, qSage] };
const CHESTS = {
  c3a: { tx: 44, ty: 21, tip: 'tip3Log', line: 'A note inside reads: "Write the mileage log on the day of the trip. Date, distance, and reason."' },
  c3b: { tx: 3, ty: 35, tip: 'tip3Jan', line: 'A note inside reads: "The fourth estimated payment is due January 15. Not December. Not April."' },
  c3c: { tx: 44, ty: 36, tip: 'tip3K', line: 'A note inside reads: "A 1099-K shows the gross. Deduct the fees, or pay tax on money you never kept."' },
};

// ---------- audit questions for this chapter
LQ.AUDIT_POOL.push(
  { need: 'f1099', q: 'In 2026, how much must a business pay a contractor before it has to send Form 1099-NEC?', o: ['$2,000 or more', '$600 or more', '$20,000 or more'], why: 'The threshold rose to $2,000 for payments made in 2026.' },
  { need: 'f1099', q: 'When does a payment platform have to send Form 1099-K?', o: ['Over $20,000 and over 200 payments', 'Over $600', 'For every sale'], why: 'Both lines must be crossed: more than $20,000 and more than 200 payments.' },
  { need: 'allincome', q: 'A client pays you $900 and sends no form. Is it taxable?', o: ['Yes. All income counts', 'No. It is under the threshold', 'Only if paid by check'], why: 'Thresholds decide who sends forms, not what is taxed.' },
  { need: 'expenses3', q: 'What is the test for a deductible business expense?', o: ['Ordinary and necessary for the business', 'Paid during working hours', 'Approved by a client'], why: 'Ordinary and necessary in your trade.' },
  { need: 'mileage3', q: 'What does the standard mileage rate already include?', o: ['Fuel, repairs, insurance, and wear', 'Tolls and parking', 'Commuting miles'], why: 'Tolls and parking on a job are deducted separately. Commuting never counts.' },
  { need: 'setax3', q: 'What is the self-employment tax rate?', o: ['15.3%', '7.65%', '22%'], why: 'Both halves of Social Security and Medicare.' },
  { need: 'setax3', q: 'How much of your self-employment tax can you deduct from income?', o: ['Half', 'All', 'None'], why: 'Half, the share an employer would have paid.' },
  { need: 'qbi3', q: 'What share of business profit can most owners deduct as the business income deduction?', o: ['20%', '50%', '7.5%'], why: 'The qualified business income deduction is 20%.' },
  { need: 'estimates3', q: 'When is the fourth estimated tax payment due?', o: ['January 15 of the next year', 'December 31', 'April 15'], why: 'April 15, June 15, September 15, and January 15.' },
  { need: 'safeharbor', q: 'Which of these avoids an underpayment penalty?', o: ["Paying in 100% of last year's tax", 'Filing early', 'Owing less than $5,000'], why: "The safe harbor is 90% of this year's tax or 100% of last year's." },
  { need: 'schedC', q: 'What does Schedule C end with?', o: ['Net profit or loss', 'Gross receipts', 'Total tax'], why: 'What came in, minus expenses.' },
  { need: 'meals3', q: 'How much of a business meal with a client can be deducted?', o: ['50%', '100%', 'None'], why: 'Business meals are limited to 50%.' },
  { need: 'meals3', q: 'You get a parking fine while on a job. Can the business deduct it?', o: ['No. Fines are never deductible', 'Yes, in full', 'Yes, at 50%'], why: 'Fines and penalties paid to a government never count.' },
  { need: 'pro3Office', q: 'What is the simplified home office rate?', o: ['$5 a square foot, up to 300 square feet', '$50 a square foot', '10% of the rent'], why: '$5 a square foot, for at most $1,500.' },
);

LQ.CH3 = {
  npcs: NPC_LIST, chests: CHESTS, begin, found, hunt: HUNT,
  spots: { xSupply: [42, 9], xPhone: [6, 9], xLicense: [15, 23], xMeal: [25, 18], xLunch: [36, 29], xBoots: [4, 22], xFine: [44, 23] },
  coins: [[10, 10], [20, 11], [28, 10], [36, 11], [42, 10], [6, 20], [12, 21], [30, 20], [40, 21], [23, 5], [24, 23], [12, 30], [20, 31], [28, 33], [24, 29], [34, 29], [36, 34], [43, 33]],
  signs: [
    { tx: 22, ty: 5, fn: () => st().q3 >= 8 ? 'NORTH TRAIL to the Summit of Gains. The trail is open. Chapter 4 begins there.' : 'NORTH TRAIL to the Summit of Gains. Closed until your return is filed.' },
    { tx: 21, ty: 22, text: 'HUSTLE CANYON. North-west: the Hustle Hall and the 1099 Depot. North-east: the Ledger Shack and the Assay Office. South-west: the Quarter Station and the Tally House. South-east: the Canyon Tax Office. In the plaza: the Trading Post and the Canyon Exchange. West: the road home to Shelter Coast.' },
    { tx: 25, ty: 24, text: 'RATTLE CREEK. The bridge is sound. The Gulch beyond it is another matter.' },
    { tx: 38, ty: 28, fn: () => st().flags.boss3 ? 'OFF-THE-BOOKS GULCH. Quiet now. Receipts welcome.' : 'OFF-THE-BOOKS GULCH. Cash only. No questions. No forms.' },
    { tx: 26, ty: 13, fn: () => 'THE CANYON GAZETTE. Today: ' + (st().news ? st().news.text : 'No news.') + ' (Prices react tomorrow.)' + (st().flags.boss3 ? '' : ' Standing notice: Dust Devil Couriers will reopen the south route if the Gulch is ever made safe.') },
  ],
  talk: async id => {
    const q = QUEST_FN[id];
    if (q && st().q3 === q[0]) return q[1]();
    if (id === 'trader') return LQ.shop(N.trader);
    if (id === 'broker') return LQ.broker(N.broker);
    if (TIPS[id]) return tip(id);
    return idle[id]();
  },
  openChest: async id => {
    const ch = CHESTS[id]; st().chests[id] = true; LQ.audio.sfx('coin'); LQ.gain(0, 40);
    await say(null, 'You found 40 coins! ' + ch.line); LQ.learn(ch.tip);
  },
  // Skip ahead: finish Chapter 2 on top of the Chapter 2 starter kit, and stand at the canyon mouth.
  starter() {
    const s = st();
    s.q2 = 8; s.flags.married = true; s.flags.boss2 = true; s.child = true; s.w4b = 0;
    Object.keys(LQ.RECEIPTS).forEach(id => { s.rcpt[id] = true; });
    s.wh2 = LQ.withhold2(0);
    s.journal = s.journal.concat(['mortgage', 'salt', 'points', 'mfj', 'marriage', 'dependent', 'ctc', 'carecredit', 'w4two', 'itemize2', 'charity2', 'medical', 'writeoff']);
    s.items = s.items.concat(['deed', 'rings', 'toyboat', 'w4pair', 'folder', 'medal2', 'return2']);
    s.coins = 900; s.savvy = 300;
    s.region = 'canyon'; s.px = 2 * 16 + 8; s.py = 21 * 16; s.dir = 'right';
  },
};
})();
