// Chapter 2 content: Shelter Coast. A home, a wedding, a child, and the joint return they add up to.
(() => {
const LQ = window.LQ, F = LQ.F, ui = LQ.ui, D = LQ.docs, M = n => LQ.money(n);
const say = LQ.say, ask = LQ.ask, choose = LQ.choose;
const TX = LQ.TAX, STD = TX.standardDeduction, H = LQ.HOME, RC = LQ.RECEIPTS;
const st = () => LQ.state, pct = r => Math.round(r * 100) + '%';
const isOwner = () => LQ.career().kind === 'se';
const HUNT = Object.keys(RC).filter(id => RC[id].hunt);
const got = id => !!st().rcpt[id];

// ---------- cast
const P = (id, name, tx, ty, look, dir = 'down', extra) => Object.assign({ id, name, tx, ty, dir, look: Object.assign({ id: 'c2' + id }, look) }, extra);
const NPC_LIST = [
  P('marlowe', 'Marlowe', 17, 9, { hair: '#7a4a2a', shirt: '#3b6fd4', pants: '#5a4630', trim: '#f3d24a', skin: '#c98d62' }),
  P('coral', 'Coral', 18, 13, { hair: '#7a4a2a', long: 1, shirt: '#e86a9a', pants: '#e86a9a', skin: '#c98d62' }, 'down', { small: true }),
  P('brine', 'Banker Brine', 9, 19, { hat: 'top', hair: '#8a8a96', shirt: '#22304f', pants: '#22304f', trim: '#f3d24a', beard: '#8a8a96' }),
  P('pearl', 'Officiant Pearl', 9, 9, { hair: '#e8c45a', long: 1, shirt: '#f3f0e6', robe: 1, trim: '#58a8c8' }),
  P('dory', 'Nanny Dory', 15, 19, { hair: '#c8742c', long: 1, shirt: '#e0a02c', pants: '#8a5a30', trim: '#f3f0e6' }),
  P('stone', 'Harbormaster Stone', 39, 9, { hat: 'cap', hatColor: '#22304f', hair: '#4a4a56', beard: '#4a4a56', shirt: '#22304f', trim: '#f3d24a' }),
  P('tallow', 'Assessor Tallow', 31, 9, { hair: '#231a36', shirt: '#5a4a7a', robe: 1, trim: '#f3d24a', skin: '#b87a52' }),
  P('fathom', 'Clerk Fathom', 35, 19, { hair: '#a8452c', long: 1, shirt: '#2a3a6e', robe: 1, trim: '#f3f0e6' }),
  P('trader', 'Trader Cove', 20, 14, { hat: 'cap', hatColor: '#3d9a5a', hair: '#231a36', shirt: '#e0564e', robe: 1, trim: '#f3d24a', skin: '#b87a52' }),
  P('quay', 'Broker Quay', 27, 14, { hat: 'top', hair: '#8a8a96', shirt: '#14575a', pants: '#14575a', trim: '#8fe6da' }),
  P('gull', 'Widow Gull', 12, 13, { hair: '#e8e8f0', long: 1, shirt: '#58a8c8', robe: 1, trim: '#f3f0e6' }),
  P('finch', 'Deckhand Finch', 41, 13, { hat: 'cap', hatColor: '#c9423a', hair: '#3a2a1c', shirt: '#f3f0e6', pants: '#22304f', skin: '#b87a52' }, 'left'),
  P('kelp', 'Father Kelp', 18, 23, { hair: '#2a5a3a', shirt: '#3d7a5a', pants: '#5a4630', beard: '#2a5a3a' }),
  P('reed', 'Scholar Reed', 27, 9, { hair: '#231a36', shirt: '#7b4bb8', pants: '#3a3550', trim: '#f3f0e6', skin: '#e2b184' }),
  P('barnacle', 'Old Barnacle', 10, 27, { hat: 'cap', hatColor: '#8a7a3a', hair: '#e8e8f0', beard: '#e8e8f0', shirt: '#6a8a4a' }),
  P('lark', 'Skipper Lark', 30, 27, { hair: '#c8742c', long: 1, shirt: '#2f6fd0', pants: '#f3f0e6', trim: '#f3d24a' }),
  P('ivy', 'Newlywed Ivy', 12, 9, { hair: '#3a2a1c', long: 1, shirt: '#d98ab8', robe: 1, trim: '#f3f0e6', skin: '#c98d62' }),
  P('otto', 'Fisher Otto', 23, 36, { hat: 'cap', hatColor: '#e0a02c', hair: '#4a4a56', beard: '#4a4a56', shirt: '#b0332e' }, 'down'),
];
const N = {}; NPC_LIST.forEach(n => { N[n.id] = n; });

LQ.QUESTS2 = [
  { short: 'Find Marlowe', text: 'Find Marlowe at your new cottage', target: 'marlowe' },
  { short: 'Collect the mortgage papers', text: 'See Banker Brine at the bank (south-west)', target: 'brine' },
  { short: 'Get married', text: 'Meet Officiant Pearl at the chapel', target: 'pearl' },
  { short: 'Claim Coral', text: 'Visit Nanny Dory at the nursery', target: 'dory' },
  { short: 'Redo your W-4s', text: 'See Harbormaster Stone at the shipyard', target: 'stone' },
  { short: 'Itemize or standard?', text: 'Take your receipts to Assessor Tallow', target: 'tallow' },
  { short: 'Defeat Captain Loophole', text: 'Cross the sandbar to the Old Lighthouse', target: 'boss2' },
  { short: 'File your joint return', text: 'File with Clerk Fathom at the Tax Office', target: 'fathom' },
  { short: 'Chapter complete', text: 'Chapter 2 complete! Chapter 3 is coming', target: null },
];

Object.assign(LQ.JOURNAL, {
  mortgage: { title: 'Home mortgage interest', text: "Each mortgage payment is part interest and part principal. Only the interest can be deducted, only if you itemize, and only on up to $750,000 of home loan debt. Your lender reports the interest on Form 1098 each January. Principal and homeowner's insurance are never deductible." },
  salt: { title: 'State and local taxes', text: 'If you itemize, you can deduct the state and local taxes you paid: income tax (or sales tax instead) plus property tax. For 2026 the total is capped at $40,400, and the cap shrinks for incomes above $505,000.' },
  points: { title: 'Loan points', text: 'Points are interest you pay up front at closing to get a lower rate. Points on a loan to buy your main home can usually be deducted in full in the year you pay them, if you itemize. Points on a refinance are spread over the life of the loan. Keep your closing papers.' },
  mfj: { title: 'Married filing jointly', text: "A married couple files one joint return or two separate ones. Jointly, the 2026 standard deduction is $32,200 and the brackets are twice as wide as a single filer's, up through the 35% bracket. If you are married on December 31, you are married for the whole tax year. Both spouses sign a joint return, and both are responsible for the whole bill." },
  marriage: { title: 'Marriage bonus and penalty', text: "When two people with uneven incomes marry and file jointly, the higher earner's income spills into the lower earner's unused room in the low brackets, so together they pay less than they did as two singles. That is the marriage bonus. When both earn about the same, the tax barely changes. A penalty mostly shows up at very high incomes." },
  dependent: { title: 'Who is a qualifying child', text: 'A qualifying child is your son, daughter, stepchild, foster child, sibling, or a child of one of them, who lives with you for more than half the year, is under 19 (or under 24 and a full-time student), and does not pay more than half of their own support. A baby born at any point in the year counts for the whole year. Pets never count.' },
  ctc: { title: 'Child Tax Credit', text: 'For 2026 the Child Tax Credit is up to $2,200 for each qualifying child under 17 who has a Social Security number. It is a credit, so it comes straight off your tax. Up to $1,700 of it can be refunded even if you owe no tax. It starts to shrink above $400,000 of income for joint filers and $200,000 for everyone else.' },
  carecredit: { title: 'Child care credit', text: "If you pay for care so that you and your spouse can work, the child and dependent care credit covers part of it. It counts up to $3,000 of costs for one child under 13, or $6,000 for two or more. From 2026 the rate runs from 50% at low incomes down to 20% at high ones. For joint incomes between about $45,000 and $150,000 it is 35%. You need the provider's name and tax ID, and married couples must file jointly." },
  w4two: { title: 'W-4 for two earners', text: "Each W-4 assumes its job is the household's only income. When both spouses work, both should tick the box in Step 2(c), or use the free IRS Tax Withholding Estimator. Claim the Child Tax Credit in Step 3 on one W-4 only, usually the higher earner's. Get it wrong and too little is withheld. Owe $1,000 or more at filing and an underpayment penalty can apply." },
  itemize2: { title: 'Itemizing as a homeowner', text: 'Buying a home does not mean you should itemize. Add up mortgage interest, points, state and local taxes, and gifts to charity. Itemize only if the total beats the standard deduction, which is $32,200 for a joint return in 2026. Many homeowners still come out ahead with the standard deduction. Check again every year.' },
  charity2: { title: 'Charity: two rulebooks', text: 'From 2026, people who take the standard deduction can still deduct cash gifts to charity, up to $1,000, or $2,000 on a joint return. People who itemize can deduct more, but only the part of their gifts above 0.5% of their income. Either way, you can only deduct what you gave beyond what you got back, so raffle tickets and bake sale cookies do not count.' },
  medical: { title: 'Medical bills', text: 'Medical and dental costs are deductible only if you itemize, and only the part above 7.5% of your adjusted gross income. On $100,000 of income, the first $7,500 of bills does not count. In most years most people get nothing from this one. An HSA or FSA is usually the better tool.' },
  writeoff: { title: 'What a write-off is worth', text: 'A write-off is not free money. A deduction saves you its amount times your tax rate. Spend $100 on something deductible in the 12% bracket and you save $12. You are still out $88. Never spend money just to get a deduction.' },
  tip2Keep: { title: 'Tip: keep home papers', text: 'Keep your closing statement and the receipts for home improvements for as long as you own the home, and for at least three years after you sell it. They prove what the home cost you.' },
  tip2Est: { title: 'Tip: the Withholding Estimator', text: 'The IRS Tax Withholding Estimator at IRS.gov is free. It handles two jobs, children, and credits, and tells each spouse exactly what to write on a W-4.' },
  tip2Sign: { title: 'Tip: two signatures', text: 'On a joint return both spouses sign, and each one is responsible for the whole tax bill, even after a divorce. Read the return before you sign it.' },
  pro2Hoh: { title: 'Pro: Head of Household', text: 'If you are unmarried, pay more than half the cost of keeping up your home, and a qualifying child lives with you for more than half the year, you can file as Head of Household. The 2026 standard deduction is $24,150 instead of $16,100, and the brackets are wider too.' },
  pro2Fsa: { title: 'Pro: the health FSA', text: 'A health Flexible Spending Account lets you set aside up to $3,400 of pay in 2026, tax-free, for medical costs. Unlike an HSA, it is use it or lose it. Your plan may let you carry over $680 at most, or give you a short grace period. Only put in what you know you will spend.' },
  pro2Dcfsa: { title: 'Pro: dependent care FSA', text: 'A dependent care FSA through an employer lets a household set aside up to $7,500 of pay in 2026, tax-free, for daycare. You cannot use the same dollars twice. Every dollar that goes through the FSA comes off the costs the child care credit can count, so work out which one saves you more.' },
  pro2Aotc: { title: 'Pro: the college credit', text: 'The American Opportunity Tax Credit is worth up to $2,500 per student per year for the first four years of college, and up to $1,000 of it is refundable. It starts to shrink above $160,000 of income for joint filers and $80,000 for everyone else.' },
  pro2Mfs: { title: 'Pro: filing separately', text: 'Married filing separately rarely saves money. You lose the child care credit, the student loan interest deduction, the education credits, and the overtime deduction, and if one spouse itemizes the other must too. It can help in special cases, such as when one spouse has very large medical bills. Always work it out both ways.' },
  pro2Home: { title: 'Pro: selling your home', text: 'When you sell your main home, up to $250,000 of profit is tax-free, or $500,000 on a joint return, if you owned it and lived in it for at least two of the last five years. Money spent on real improvements raises your cost and shrinks the taxable profit, so keep those receipts.' },
  pro2Name: { title: 'Pro: changed your name?', text: 'If you change your name when you marry, tell the Social Security Administration before you file. The name and number on your return must match their records, or your return can be rejected and your refund delayed.' },
  pro2Baby: { title: 'Pro: Trump Accounts', text: 'A Trump Account is a new savings account for children under 18. Babies born from 2025 through 2028 get a one-time $1,000 from the Treasury. Family can add up to $5,000 a year, the money is invested in stock index funds, and it generally cannot be taken out before the year the child turns 18.' },
});
Object.assign(LQ.ITEMS, {
  deed: { name: 'Cottage Deed', desc: 'Yours, and the bank\'s, for the next thirty years.' },
  rings: { name: 'Banner of Two', desc: 'Married Filing Jointly. Standard deduction: $32,200.' },
  toyboat: { name: "Coral's Toy Boat", desc: 'A $2,200 Child Tax Credit sails with it.' },
  w4pair: { name: 'Household Tax Plan', desc: 'Two incomes, one plan for paying tax through the year.' },
  folder: { name: 'Receipt Folder', desc: 'Every deduction you can prove, in one place.' },
  medal2: { name: 'Low Tide Medal', desc: 'Proof that you sank Captain Loophole.' },
  return2: { name: 'Stamped Joint Return', desc: 'Two names, one return, every line understood.' },
});

// ---------- documents
const mortDoc = { hl: null, draw(c) {
  const ins = 1500, L = (i, key, a, b) => D.line(c, 84, 66 + i * 38, 470, a, b, { hl: this.hl === key });
  D.paper(c, 60, 20, 840, 272, 'FORM 1098', 'Mortgage Interest Statement (simplified)  ' + TX.year);
  L(0, 'int', 'Box 1   Mortgage interest paid', M(H.interest)); L(1, 'bal', 'Box 2   Loan balance', M(H.loan));
  L(2, 'pts', 'Box 6   Points paid at purchase', '________'); L(3, 'tax', 'Box 10  Property tax (escrow)', M(H.propTax)); L(4, 'ins', "        Homeowner's insurance", M(ins));
  D.sideBox(c, 'YOUR LOAN PAYMENTS', [['Interest', M(H.interest), { hl: this.hl === 'int' }], ['Principal', M(H.principal)], 0, ['Total to the loan', M(H.interest + H.principal)], ['Interest share', Math.round(H.interest / (H.interest + H.principal) * 100) + '%']]);
} };
function card(c, x, title, col, rows, lit) {
  c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(x + 7, 31, 400, 262);
  c.fillStyle = '#f6efd9'; c.fillRect(x, 24, 400, 262); c.fillStyle = col; c.fillRect(x, 24, 400, 40);
  c.strokeStyle = lit ? '#f3c531' : '#8a7a55'; c.lineWidth = lit ? 5 : 2; c.strokeRect(x + 1, 25, 398, 260);
  c.font = F(12, true); c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#fff'; c.fillText(title, x + 200, 38);
  rows.forEach((r, i) => { const last = i === rows.length - 1; if (last) D.rule(c, x + 20, 76 + i * 30 - 3, 360); D.line(c, x + 20, 76 + i * 30 + (last ? 4 : 0), 360, r[0], r[1], Object.assign({ size: 24 }, r[2])); });
}
const splitDoc = { lit: -1, draw(c) {
  const x = LQ.finSplit(), j = x.joint, own = j.kind === 'se', no = { vcolor: '#b0332e' };
  const a = [['Standard deduction', M(STD.mfj)], ['Income tax', M(j.tax)]], b = [['Standard deduction', M(STD.mfs) + ' each'], ['Income tax', M(x.sepTax)]];
  if (j.ot) { a.push(['Overtime deduction', 'allowed', D.GREEN]); b.push(['Overtime deduction', 'not allowed', no]); }
  if (own) { a.push(['Self-employment tax', M(j.se)]); b.push(['Self-employment tax', M(j.se)]); }
  a.push(['Child Tax Credit', '-' + M(TX.ctc), D.GREEN], ['Child care credit', '-' + M(j.care), D.GREEN], ['Total tax', M(x.jointTotal)]);
  b.push(['Child Tax Credit', '-' + M(TX.ctc), D.GREEN], ['Child care credit', 'not allowed', no], ['Total tax', M(x.sepTotal)]);
  card(c, 70, 'MARRIED FILING JOINTLY', '#b0332e', a, this.lit === 0); card(c, 490, 'MARRIED FILING SEPARATELY', '#7b4bb8', b, this.lit === 1);
} };
const creditDoc = { show: 0, draw(c) {
  const f = LQ.fin2({ itemize: false, child: true, care: true, noGifts: true }), L = (i, a, b, o) => D.line(c, 240, 78 + i * 40, 480, a, b, o);
  D.paper(c, 210, 20, 540, 272, 'COUNTING CORAL', 'What a child changes');
  L(0, 'Joint income tax', M(f.tax));
  L(1, 'Child Tax Credit', this.show > 0 ? '-' + M(f.ctc) : '________', this.show > 0 ? D.GREEN : {});
  L(2, 'Child care credit', this.show > 1 ? '-' + M(f.care) : '________', this.show > 1 ? D.GREEN : {});
  D.rule(c, 240, 204, 480); L(3.4, 'Tax after credits', M(f.tax - (this.show > 0 ? f.ctc : 0) - (this.show > 1 ? f.care : 0)), D.GREEN);
} };
const w4bDoc = { pick: 0, draw(c) {
  const p = this.pick, own = isOwner(), f = LQ.fin2({ itemize: false, child: true, care: true, wh: LQ.withhold2(p) });
  const L = (i, a, b, hl) => D.line(c, 84, 66 + i * 38, 470, a, b, { hl });
  D.paper(c, 60, 20, 840, 272, own ? "MARLOWE'S W-4, YOUR 1040-ES" : 'TWO W-4s, ONE HOUSEHOLD', 'Simplified');
  L(0, 'Step 1(c)  Filing status', 'Married, joint');
  L(1, 'Step 2(c)  Both spouses earn', p === 1 ? 'left blank' : 'box ticked', true);
  L(2, 'Step 3     Child Tax Credit', own ? (p === 2 ? '$0' : M(TX.ctc)) : p === 0 ? M(TX.ctc) + ' on one form' : p === 1 ? M(TX.ctc) + ' on BOTH' : '$0', true);
  if (own) L(3, 'Your estimates, each quarter', p === 0 ? 'set by Estimator' : p === 1 ? '$0 (skipped)' : M(f.b.per), true);
  else L(3, 'Step 4     Other adjustments', p === 0 ? 'from the Estimator' : 'none');
  L(4, 'Signatures', 'both signed');
  D.sideBox(c, 'THE YEAR AHEAD', [['Tax for the year', M(f.total)], ['Paid in by April', M(f.withheld), { hl: true }], 0, [f.diff >= 0 ? 'Refund' : 'Owed in April', M(Math.abs(f.diff)), f.diff >= 0 ? D.GREEN : D.RED]]);
} };
const NOTE = { interest: 'if you itemize', salt: 'if you itemize', gift: 'either way', none: 'does not count', medical: 'under the 7.5% floor', care: 'a credit instead' };
const rcDoc = { lit: null, draw(c) {
  const f = LQ.fin2(), ids = Object.keys(RC).filter(got), n = HUNT.filter(got).length;
  D.paper(c, 50, 12, 610, 334, 'YOUR RECEIPTS', n + ' of ' + HUNT.length + ' lost receipts found');
  const rows = [['Province income tax (pay records)', f.prov, 'salt']].concat(ids.map(id => [RC[id].name, RC[id].amt, RC[id].kind]));
  if (LQ.has('charity')) rows.push(['Gift: Charity Lantern', 500, 'gift']);
  rows.forEach((r, i) => {
    const y = 52 + i * 23, dead = r[2] === 'none' || r[2] === 'medical' || r[2] === 'care';
    c.font = F(22); c.textBaseline = 'top'; c.textAlign = 'left'; c.fillStyle = dead ? '#9a8f76' : '#2c2416'; c.fillText(r[0], 70, y);
    c.textAlign = 'right'; c.fillText(M(r[1]), 470, y); c.fillStyle = dead ? '#b0332e' : r[2] === 'gift' ? '#1f6f5c' : '#7a6a48'; c.font = F(19); c.fillText(NOTE[r[2]], 646, y + 2);
  });
  D.shieldShape(c, 700, 10 + Math.sin(LQ.time * 2) * 3, '#3b6fd4', 'STANDARD', f.stdTotal, this.lit === 'std');
  D.shieldShape(c, 700, 182 + Math.sin(LQ.time * 2 + 2) * 3, '#b0332e', 'ITEMIZED', f.itemized, this.lit === 'item');
} };

// ---------- quest scripts
const advance2 = () => {
  const s = st(); s.q2++; LQ.audio.sfx('fanfare'); ui.toast('New quest: ' + LQ.QUESTS2[s.q2].short);
  const c = LQ.career(), base = c.kind === 'se' ? c.pay - 35 + Math.floor(LQ.hash(s.day, 9, s.seed) * 90) : c.pay;
  LQ.gain(0, base + 50 + (s.w4b === 1 ? 25 : s.w4b === 2 ? -25 : 0), 'Household payday'); LQ.tick();
};
const FOUND = {
  rPoints: () => `In the drawer: your closing papers. You paid ${M(H.points)} in points, interest paid up front to get your loan. Points on a loan to buy your main home usually count as mortgage interest in the year you pay them.`,
  rCart: () => `A receipt from the Harbor Road office: ${M(H.cartTax)} of cart tax. It is charged every year on the cart's value, so it counts as a state and local tax. A flat registration fee would not.`,
  rChapel: () => `A receipt from the chapel: you gave ${M(RC.rChapel.amt)} in cash to the roof fund. Cash gifts to a qualified charity count, as long as you have it in writing.`,
  rLight: () => `A thank-you letter from the Lighthouse Keepers' Fund for your ${M(RC.rLight.amt)} cash gift. It says you received nothing in return. That one sentence is what makes it a valid receipt.`,
  rSchool: () => `A receipt from the Harbor School: ${M(RC.rSchool.amt)} in cash for new books. Deductible.`,
  rRaffle: () => `A raffle ticket stub from the Harbor School fair: ${M(RC.rRaffle.amt)}. Bad luck twice. You did not win, and you bought a chance at a prize, so it is not a gift. Raffle tickets are never deductible.`,
  rMedical: () => `A bundle of healer's bills: ${M(RC.rMedical.amt)}. Keep them, but medical costs only count above 7.5% of your income, and yours is well past that.`,
};
async function found(id) {
  const s = st(); if (s.rcpt[id]) return;
  s.rcpt[id] = true; LQ.audio.sfx('coin');
  await say(null, FOUND[id]());
  LQ.gain(5, 10, 'Receipt found');
  if (id === 'rPoints') LQ.learn('points'); if (id === 'rMedical') LQ.learn('medical');
  const left = HUNT.filter(x => !got(x)).length;
  ui.toast(left ? left + ' lost receipt' + (left > 1 ? 's' : '') + ' still out there' : 'Every lost receipt found!');
}

async function begin() {
  const s = st(); s.q2 = 0; s.season = 'summer';
  const y = LQ.yearPass();
  await say(null, 'One year later. Your first return is filed, your coin purse is heavier, and life has moved fast.');
  await say(null, `At the Harvest Fair you met Marlowe, a shipwright from Shelter Coast. In January the two of you bought a cottage by the sea, and Marlowe's three-year-old daughter Coral moved in with her toy boat.`);
  await say(null, 'The wedding is set for midsummer. A home, a marriage, a child: each one changes your tax return. Find Marlowe at the cottage, just west of the road.');
  if (y && y.div) ui.toast('A year of dividends: +' + (y.div - y.tax) + ' coins');
}
async function qMarlowe() {
  const b = LQ.fin(0), mine = b.kind === 'w2' ? b.wages : b.profit;
  await say(N.marlowe, 'There you are! Coral has already buried one of your boots on the beach. Welcome home.');
  await say(N.marlowe, `I earn ${M(H.spWages)} a year building ships at the Tidewater yard. With your ${M(mine)}, this household brings in ${M(mine + H.spWages)}. And three things changed this year that the taxman cares about: we bought a home, we are getting married, and Coral lives with us.`);
  await say(N.marlowe, 'Every one of those can save us real money, if we keep the paperwork. And I am hopeless with paper. I have dropped half our receipts around town already.');
  await say(N.marlowe, 'Start at the Tidewater Bank, south-west of the plaza. Banker Brine has our mortgage papers. Here, a housewarming gift from my crew.');
  LQ.gain(0, 60, 'Housewarming gift'); advance2();
}
async function qBrine() {
  const s = st(), tot = H.interest + H.principal;
  await say(N.brine, `Ah, the new owners of the cottage on Harbor Road! Congratulations. I hold your mortgage: ${M(H.loan)} at ${(H.rate * 100).toFixed(1)}% for thirty years.`);
  mortDoc.hl = null; ui.doc = mortDoc;
  await say(N.brine, 'Each January I send you Form 1098. It shows the interest you paid me during the year. Look at the right side. Most of your loan payments went to interest and only a sliver to principal. Early in a mortgage, that is normal.');
  await ask(N.brine, `Your loan payments this year came to ${M(tot)}. If you itemize your deductions, how much of that can count?`,
    [`Only the interest: ${M(H.interest)}`, `All of it: ${M(tot)}`, `Only the principal: ${M(H.principal)}`],
    { wrong: ['Principal is you buying your own house. Nobody gets a deduction for that.', 'The other way around. Interest is the cost of borrowing, and that is the part that counts.'] });
  mortDoc.hl = 'int';
  await say(N.brine, `Right. ${M(H.interest)} of interest. The rule covers interest on up to ${M(TX.mortgageDebtLimit)} of home loan debt, so yours counts in full.`);
  mortDoc.hl = 'tax';
  await say(N.brine, `Now Box 10. I collect your property tax with each payment and pass it on to the province: ${M(H.propTax)} this year. Property tax and province income tax together are called state and local taxes. They are deductible too, up to a cap of ${M(TX.saltCap)} for 2026.`);
  mortDoc.hl = null;
  await ask(N.brine, 'One cost on this page is never deductible on your own home. Which one?', ["Homeowner's insurance", 'Mortgage interest', 'Property tax'],
    { wrong: ['Interest is the big one. It counts if you itemize.', 'Property tax counts as a state and local tax.'] });
  mortDoc.hl = 'pts';
  await say(N.brine, `Last thing. Box 6 is blank on my copy. At closing you paid points, which is interest paid up front to get a better rate: 1% of the loan, ${M(H.points)}. Points on a loan to buy your main home usually count in the year you pay them. But only with the closing papers to prove it, and Marlowe took those home.`);
  ui.doc = null; s.rcpt.r1098 = true; s.rcpt.rProp = true; LQ.learn('mortgage'); LQ.learn('salt'); LQ.give('deed');
  await say(N.brine, `Here are your Form 1098 and your property tax bill. Two receipts down. Marlowe tells me ${HUNT.length} more are scattered around Shelter Coast. Watch for a sparkle on the ground, and try the sea chest beside your cottage door.`);
  await say(N.brine, 'But hear this before you get excited. None of it matters unless you itemize, and whether you should is a question for later. For now: you have a wedding to get to! Officiant Pearl is waiting at the chapel.');
  LQ.REGIONS.coast.addReceipts(LQ.world, s);
  advance2();
}
async function qPearl() {
  const s = st();
  await say(N.pearl, 'There you are! Marlowe is inside, Coral has the petals, and half of Shelter Coast is in the pews. Ready?');
  await LQ.fadeTo(1, 0.5); LQ.audio.sfx('fanfare'); await LQ.wait(1.0); ui.showBanner('WEDDING DAY', 'Midsummer at the Chapel by the Sea'); await LQ.fadeTo(0, 0.6);
  await say(null, 'Vows are said. Rings are swapped. Coral throws every petal she has, mostly at the officiant.');
  s.flags.married = true;
  await say(N.pearl, 'By the power of the tide tables, you are married! Now, before the cake. The kingdom will want to know how the two of you mean to file.');
  await ask(N.pearl, 'You married in midsummer. For taxes, how much of this year were you married?', ['The whole year. Status is set on December 31', 'Only the months after the wedding', 'None of it. It starts next year'],
    { wrong: ['Taxes do not split the year. Your status on the last day covers all of it.', 'Married by December 31 means married for the whole tax year.'] });
  const x = LQ.finSplit(), j = x.joint; splitDoc.lit = -1; ui.doc = splitDoc;
  await say(N.pearl, `Married couples choose between two banners. Filing jointly: one return, a ${M(STD.mfj)} standard deduction, and brackets twice as wide as a single filer's. Filing separately: two returns, with ${M(STD.mfs)} each.`);
  await say(N.pearl, "I worked out both for your household. Do not worry about the credit lines yet. Nanny Dory will explain Coral's credits. Just compare the totals at the bottom.");
  await ask(N.pearl, `Jointly, your household's tax comes to ${M(x.jointTotal)}. Separately, ${M(x.sepTotal)}. How will you file?`,
    [`Jointly. It saves us ${M(x.sepTotal - x.jointTotal)}`, 'Separately, to keep our money apart', 'One of each: I file jointly, Marlowe separately'],
    { wrong: ['Filing separately does not keep your money apart. It only changes the tax math, and here it costs you more.', 'A couple has to choose together. Both joint, or both separate.'] });
  splitDoc.lit = 0;
  const lost = (x.lostOt ? `your overtime deduction (${M(x.lostOt)}) and ` : '') + `the child care credit (${M(x.lostCare)})`;
  await say(N.pearl, `Good. Filing separately would cost you ${lost}. Couples who file separately also lose the student loan interest deduction and the education credits, and if one of them itemizes, the other must too.`);
  if (x.bonus > 50) await say(N.pearl, `And here is a wedding gift from the tax code. As two single people, your income tax would have been ${M(x.singles)}. On a joint return it is ${M(j.tax)}. That ${M(x.bonus)} is a marriage bonus. ` + (isOwner()
    ? 'Yours comes from the business income deduction. Alone, it was held down by your own small taxable income. Joined with Marlowe\'s wages, your whole profit earns the full 20%.'
    : "It shows up when one spouse earns more than the other. The higher earner's income fills the lower earner's unused room in the low brackets."));
  else await say(N.pearl, `One more thing. As two single people, your income tax would have been ${M(x.singles)}. On a joint return it is ${M(j.tax)}. No change, because your two incomes sit in the same brackets and the joint brackets are exactly twice the single ones. Couples with uneven incomes get a marriage bonus. Your savings come from the credits instead.`);
  ui.doc = null; LQ.learn('mfj'); LQ.learn('marriage'); LQ.give('rings');
  await say(N.pearl, 'One warning with my blessing. On a joint return you both sign, and you are both responsible for every line. Now go and eat cake. Then see Nanny Dory at the nursery about Coral.');
  advance2();
}
async function qDory() {
  const s = st(), f = LQ.fin2({ itemize: false, child: false, noGifts: true }), top = f.top, care = Math.round(TX.careRate * TX.careMaxOne);
  await say(N.dory, "You must be Coral's new stepparent! She has told all of us. Twice. She spends her days here at Little Limpets while you two work.");
  await say(N.dory, 'Now that you and Marlowe are married, Coral is your stepchild, and for taxes a stepchild counts exactly like a son or daughter. She is under 17, she lives with you for more than half the year, and she has a Social Security number. That makes her a qualifying child.');
  await say(N.dory, 'Worth knowing for the next one: a baby born on December 31 counts for the whole year, just like a wedding on December 31.');
  creditDoc.show = 0; ui.doc = creditDoc;
  await ask(N.dory, `Coral brings a ${M(TX.ctc)} Child Tax Credit. Your top bracket is ${pct(top)}. Which would you rather have?`,
    [`A ${M(TX.ctc)} credit. It cuts my tax by ${M(TX.ctc)}`, `A ${M(TX.ctc)} deduction. That cuts my tax by ${M(TX.ctc)} too`, 'Either. They are worth the same'],
    { wrong: [`A ${M(TX.ctc)} deduction only saves ${M(TX.ctc * top)}: its amount times your ${pct(top)} rate.`, `Not the same. The deduction saves ${M(TX.ctc * top)}. The credit saves all ${M(TX.ctc)}.`] });
  creditDoc.show = 1; LQ.audio.sfx('coin');
  await say(N.dory, `Right. A credit comes straight off the tax. ${M(TX.ctc)} for each qualifying child under 17 in 2026, and up to ${M(TX.ctcRefundable)} of it can come back as a refund even to a family that owes no tax.`);
  await say(N.dory, `Now for my favorite part: my bill. Daycare for Coral runs ${M(H.daycare)} a year. Because you both work, and you pay for care so that you can, you may claim the child and dependent care credit.`);
  await ask(N.dory, `The care credit only counts costs up to a limit: ${M(TX.careMaxOne)} for one child, ${M(TX.careMaxTwo)} for two or more. You paid ${M(H.daycare)} for Coral. How much counts?`, [M(TX.careMaxOne), M(H.daycare), M(TX.careMaxTwo)],
    { wrong: ['If only. The credit stops counting at the limit.', 'That limit is for two or more children. Coral is one.'] });
  s.rcpt.rCare = true; s.child = true; creditDoc.show = 2; LQ.audio.sfx('coin');
  await say(N.dory, `At your household's income the rate is ${pct(TX.careRate)}, so the credit is ${pct(TX.careRate)} of ${M(TX.careMaxOne)}: ${M(care)}. Here is my statement, with the nursery's tax ID on it. No provider ID, no credit. And a married couple has to file jointly to claim it.`);
  await say(N.dory, `Together, Coral's two credits take ${M(TX.ctc + care)} off your tax. Not bad for someone who still eats sand.`);
  ui.doc = null; LQ.learn('dependent'); LQ.learn('ctc'); LQ.learn('carecredit'); LQ.give('toyboat');
  await say(N.dory, 'One job left before you celebrate. Your paychecks still think you are single with no children. Harbormaster Stone runs payroll at the shipyard, up in the north-east. Go and fix your W-4s.');
  advance2();
}
async function qStone() {
  const s = st(), own = isOwner();
  await say(N.stone, "So you are Marlowe's better half. I run payroll for the shipyard, and Marlowe's W-4 still says single, no children. " + (own ? 'You run your own shop, so you have no W-4 at all. You have quarterly estimates. We need to look at both together.' : 'I would bet yours does too.'));
  w4bDoc.pick = 0; ui.doc = w4bDoc;
  await say(N.stone, `Here is the trap for married couples. A W-4 only knows what you write on it. Tick "married filing jointly" and nothing else, and the employer assumes that paycheck is the only income in the house. That one job gets the whole ${M(STD.mfj)} deduction and the wide joint brackets.`);
  await say(N.stone, own ? "So Marlowe's pay would be taxed as if your shop did not exist. And if you then cut your estimates because \"Marlowe's job covers us\", the gap would be enormous."
    : 'When both of you do that, the deduction and the low brackets get counted twice. Too little comes out of both paychecks, and April brings a bill.');
  await say(N.stone, 'The fix is Step 2(c). When both spouses earn, both tick the box. Then Step 3 is where the Child Tax Credit goes, on one form only. Or let the IRS Tax Withholding Estimator do the work. It is free, it takes both incomes and your credits, and it tells you what to write.');
  const p = await choose(N.stone, 'How will your household pay its tax through the year?', own
    ? ['Run the Estimator together, and size my estimates to match', 'Marlowe ticks "married" and claims Coral. I skip my estimates', 'Marlowe ticks Step 2(c), claims nothing. I pay estimates as before']
    : ['Run the IRS Estimator together and write what it says', 'Each fill one in alone: married, claim Coral, nothing else', 'Both tick Step 2(c) and claim nothing extra'], i => { w4bDoc.pick = i; });
  s.w4b = p; s.wh2 = LQ.withhold2(p); LQ.audio.sfx('stamp');
  const f = LQ.fin2({ itemize: false }), gap = Math.abs(f.diff);
  await say(N.stone, [
    `On target. Between you, about ${M(f.withheld)} goes in during the year against a bill of about ${M(f.total)}. No loan to the kingdom and no surprise in April.`,
    `Bigger paychecks all year. But only ${M(f.withheld)} goes in against a bill of about ${M(f.total)}. ` + (own ? 'With no estimates paid, the' : 'You both claimed Coral and both took the full deduction, so the') + ` gap of ${M(gap)} comes due in April` + (gap >= 1000 ? ', with an underpayment penalty on top.' : '.'),
    `Safe. About ${M(f.withheld)} goes in against a bill of about ${M(f.total)}, because nothing on the forms mentions Coral's credits. Expect a refund near ${M(gap)}. It will feel like a prize. It is your own money coming home.`][p]);
  ui.doc = null; LQ.learn('w4two'); LQ.give('w4pair');
  await say(N.stone, 'New forms take effect on your next paychecks, and you can change them again whenever life changes. Now, I hear you have been collecting receipts. Assessor Tallow at the Records Hall can tell you what they are worth.');
  advance2();
}
async function qTallow() {
  const s = st(), n = HUNT.filter(got).length;
  await say(N.tallow, 'Receipts! Put them on the table. All of them. Let us see what you have.');
  rcDoc.lit = null; ui.doc = rcDoc;
  if (n < HUNT.length) {
    const a = await choose(N.tallow, `I count ${n} of the ${HUNT.length} lost receipts. More paper might change the answer.`, ['Decide with what I have', 'Keep hunting first']);
    if (a === 1) { ui.doc = null; return say(N.tallow, 'Sensible. Watch for the sparkle. I will be here.'); }
  }
  const f = LQ.fin2();
  await say(N.tallow, `Two shields, and you may carry only one. The standard deduction for a joint return is ${M(STD.mfj)}. Or you itemize: add up your mortgage interest, your state and local taxes, and your gifts to charity.`);
  await say(N.tallow, 'First, what does not belong in the pile. ' + (got('rMedical') ? `Your healer's bills: medical costs count only above 7.5% of your income, which for you is ${M(f.medFloor)}. So, nothing. ` : '')
    + (got('rRaffle') ? 'The raffle ticket: you bought a chance at a prize. Not a gift. ' : '') + (got('rMedical') || got('rRaffle') ? 'And the' : 'The') + ' nursery statement earns a credit, not a deduction, so it stays out.');
  await say(N.tallow, `Your state and local taxes come to ${M(f.saltRaw)}. That is under the ${M(TX.saltCap)} cap, so all of it counts.`);
  await say(N.tallow, f.gifts ? `Your cash gifts come to ${M(f.gifts)}, and here the law keeps two rulebooks. Carry the standard shield, and up to ${M(TX.charityJoint)} of cash gifts counts on top of it. Itemize, and only the part above 0.5% of your income counts: ${M(f.gifts)} minus ${M(f.giftFloor)} leaves ${M(f.giftItem)}.`
    : `You brought no gift receipts. For the record, the law keeps two rulebooks. With the standard shield, up to ${M(TX.charityJoint)} of cash gifts counts on top of it. Itemized, only the part above 0.5% of your income counts.`);
  const item = f.better === 'item';
  const ok = await LQ.quiz(N.tallow, `So. Itemized, your pile comes to ${M(f.itemized)}. The standard shield${f.giftStd ? ' plus your gifts' : ''} comes to ${M(f.stdTotal)}. Which do you carry?`,
    item ? [`Itemized: ${M(f.itemized)}`, `Standard: ${M(f.stdTotal)}`] : [`Standard: ${M(f.stdTotal)}`, `Itemized: ${M(f.itemized)}`], 'Always carry the larger one.');
  if (!ok) LQ.gain(0, -Math.min(s.coins, 40), 'Correction fee');
  rcDoc.lit = f.better;
  const gap = Math.abs(f.itemized - f.stdTotal), left = HUNT.length - HUNT.filter(got).length;
  await say(N.tallow, item ? `Itemizing wins by ${M(gap)}, worth about ${M(gap * f.top)} of tax at your ${pct(f.top)} rate. See how close it was. ` + (got('rPoints') ? 'Without the points from your closing papers, the standard shield would have won.' : 'Every receipt mattered.')
    : `The standard shield wins by ${M(gap)}. You own a home, you pay ${M(H.interest)} of interest a year, and you still should not itemize. That is true for a great many homeowners.` + (left ? ' A few more receipts might yet tip it. Whatever you find before you file still counts.' : ''));
  await say(N.tallow, `And remember what a deduction is worth: its amount times your tax rate. A ${M(1000)} deduction at ${pct(f.top)} saves ${M(1000 * f.top)}. Never spend a coin just to deduct it.`);
  ui.doc = null; LQ.learn('itemize2'); LQ.learn('charity2'); LQ.learn('writeoff'); LQ.give('folder');
  await say(N.tallow, 'Speaking of which. Have you heard the bell at the Old Lighthouse? Someone out there is selling "secret write-offs" to my neighbors, and they are buying. The tide is going out. Go and see.');
  await LQ.world.clear('tide', '#bfe6fa', 'Out past the beach, the tide draws back. A sandbar rises from the water, leading to the Old Lighthouse.');
  advance2();
}

function rows2(f) {
  const R = [], own = f.kind === 'se', b = f.b, J = TX.brackets.mfj, add = (label, val, o) => R.push(Object.assign({ label, val }, o));
  if (!own) add('Your wages  (W-2, Box 1)', b.box1, { ask: ['A joint return starts with both incomes. Yours first.', [`My W-2 Box 1: ${M(b.box1)}`, `My take-home pay: ${M(b.netYear)}`, `Our mortgage interest: ${M(H.interest)}`],
    ['The return starts from what you earned, before anything came out.', 'That is a deduction. Income comes first.']] });
  else {
    add('Your business net profit', b.profit, { ask: ['A joint return starts with both incomes. Yours first.', [`Net profit: ${M(b.profit)}`, `Total sales: ${M(b.sales)}`, `Our mortgage interest: ${M(H.interest)}`],
      ['Profit, not sales. Business expenses come off first.', 'That is a deduction. Income comes first.']] });
    add('Half of self-employment tax', b.half, { sign: '-' });
  }
  add("Marlowe's wages  (W-2, Box 1)", f.spBox1, { note: f.sp401 ? `Marlowe's Box 1 is ${M(f.sp401)} below the salary. That is the 401(k) Anchor at work.` : `Both incomes, one return. Together: ${M(f.income)}.` });
  const sav = f.adj - (own ? b.half : 0);
  if (sav) add(own ? 'Retirement and HSA savings' : 'HSA deduction', sav, { sign: '-', note: `Your savings gear comes off next: ${M(sav)}.` });
  add(f.itemize ? 'Itemized deductions' : f.giftStd ? 'Standard deduction + gifts' : 'Standard deduction', f.ded, { sign: '-',
    ask: [`The deduction line. Itemized, your receipts total ${M(f.itemized)}. The standard deduction${f.giftStd ? ' plus your cash gifts' : ''} comes to ${M(f.stdTotal)}. Which goes on the return?`,
      f.itemize ? [`Itemized: ${M(f.itemized)}`, `Standard: ${M(f.stdTotal)}`, 'Both of them'] : [`Standard: ${M(f.stdTotal)}`, `Itemized: ${M(f.itemized)}`, 'Both of them'], ['Carry the larger shield.', 'One or the other. Never both.']] });
  if (f.ot) add('Overtime deduction', f.ot, { sign: '-', note: `Your overtime deduction: ${M(f.ot)}. Married couples can only take it on a joint return.` });
  if (own) add('Business income deduction', f.qbi, { sign: '-', note: `The business income deduction takes off ${M(f.qbi)}.` });
  add('Taxable income', f.taxable, { ask: ['Taxable income. Both incomes, minus every deduction above. What is left?', [M(f.taxable), M(f.income), M(f.taxable + f.ded)],
    ['The deductions have to come off.', 'The big deduction line has to come off too.']] });
  add('Income tax  (joint brackets)', f.tax, { ask: [`The tax on ${M(f.taxable)}. The joint ledges: 10% up to ${M(J[1][0])}, then 12% up to ${M(J[2][0])}, then 22%.`, [M(f.tax), M(f.taxable * f.top), M(LQ.taxOn(f.taxable).total)],
    [`That is ${pct(f.top)} of everything. The first ${M(J[1][0])} is taxed at only 10%.`, 'That is what a single filer would pay. The joint ledges are twice as wide.']],
    note: 'Ledge by ledge, on the wider joint mountain.' });
  if (own) add('Self-employment tax', f.se, { sign: '+', note: `Self-employment tax still applies to your shop's profit: ${M(f.se)}. Marriage does not change it.` });
  if (f.ctc) add('Child Tax Credit', f.ctc, { sign: '-', ask: ["Coral's Child Tax Credit. Where does it go?", [`Straight off the tax: ${M(f.ctc)}`, 'Off our income, like a deduction', 'Nowhere. A stepchild does not count'],
    ['A credit comes off the tax itself.', 'A stepchild counts exactly like a son or daughter.']] });
  if (f.care) add('Child care credit', f.care, { sign: '-', note: `And the care credit: ${pct(TX.careRate)} of ${M(TX.careMaxOne)}, another ${M(f.care)} off the tax.` });
  if (f.saver) add("Saver's Credit", f.saver, { sign: '-', note: `Your Saver's Credit: ${M(f.saver)}. For a joint return the income limit is ${M(TX.saverMaxAgiJoint)}.` });
  add('Tax paid during the year', f.withheld, { note: own ? "Your estimated payments, plus the tax withheld from Marlowe's pay." : 'Box 2 from both W-2s, added together.' });
  const owed = f.diff < 0, amt = Math.abs(f.diff);
  add(owed ? 'Amount you owe' : 'Refund', amt, { owed, ask: [`Last line. Your total tax is ${M(f.total)} and you paid in ${M(f.withheld)}. So...`,
    owed ? [`We owe ${M(amt)}`, `We get a refund of ${M(amt)}`, 'It comes out exactly even'] : [`We get a refund of ${M(amt)}`, `We owe ${M(amt)}`, 'It comes out exactly even'],
    [owed ? 'You paid in less than your tax. The difference is still due.' : 'You paid in more than your tax. The extra comes back.', 'Check the subtraction once more.']] });
  return R;
}
async function qFathom() {
  const s = st(), f = LQ.fin2(), rows = rows2(f), owed = f.diff < 0, amt = Math.abs(f.diff), FD = D.formDoc;
  await say(N.fathom, 'The lighthouse is quiet, and the whole coast is talking about who quieted it. Welcome to the Coast Tax Office. Last year you filed alone. This year the form has two names on it.');
  Object.assign(FD, { rows, vals: [], cur: 0, stamp: 0 }); ui.doc = FD;
  await say(N.fathom, 'Same Form 1040, same heart. Income, minus deductions, is taxable income. Then the tax, minus credits, minus what you already paid. You fill it in. I only hold the stamp.');
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]; FD.cur = i;
    if (r.ask) await ask(N.fathom, r.ask[0], r.ask[1], { wrong: r.ask[2] });
    FD.vals[i] = r.val; LQ.audio.sfx('coin');
    if (r.note) await say(N.fathom, r.note); else if (!r.ask) await LQ.wait(0.35);
  }
  FD.cur = -1;
  await LQ.wait(0.4); LQ.audio.sfx('stamp'); LQ.shake(0.25); await LQ.tween(0.35, k => { FD.stamp = k; });
  LQ.audio.sfx('fanfare'); await LQ.wait(0.8);
  const w = s.w4b || 0;
  await say(N.fathom, [
    `${owed ? 'You owe' : 'A refund of'} ${M(amt)}. You set your payments with the Estimator, so the year landed close to even` + (f.diff > 400 ? ', and what you saved since then is coming back to you.' : '.'),
    owed ? `You owe ${M(amt)}, all at once. ` + (f.kind === 'se' ? "Marlowe's W-4 acted as if your shop did not exist, and you skipped your estimates, so almost nothing went in all year." : "Your W-4s counted the deduction and Coral's credit twice, so too little went in all year.") + (amt >= 1000 ? ' Because you owe more than $1,000, there is an underpayment penalty as well.' : '') : `A refund of ${M(amt)}. Your deductions and credits made up for the light withholding. That was luck, not planning.`,
    `${owed ? 'You owe' : 'A refund of'} ${M(amt)}. ` + (owed ? '' : "Nothing on your forms mentioned Coral's credits, so you overpaid all year. It is your own money, lent to the kingdom at no interest.")][w]);
  let coins = LQ.clamp(Math.round(f.diff / 15), -350, 350);
  if (w === 0 && Math.abs(f.diff) < 1500) coins += 80;
  if (f.diff <= -1000) coins -= 60;
  LQ.gain(60, coins, owed ? 'Tax settled' : 'Refund');
  await say(N.fathom, 'Filed, on time, with both signatures. A home, a marriage, and a child, and you understood what each one did to this page. That is rarer than you think.');
  ui.doc = null; LQ.give('return2'); s.q2 = 8; LQ.tick();
  await ending2();
}
async function ending2() {
  const f = LQ.fin2(), s = st(), owed = f.diff < 0;
  await LQ.fadeTo(1); ui.toasts = []; LQ.audio.play('title');
  ui.doc = { draw(c) {
    D.paper(c, 130, 20, 700, 458, 'CHAPTER 2 COMPLETE', f.c.name + ' and family');
    c.textAlign = 'center'; c.textBaseline = 'top'; c.font = F(20, true); c.fillStyle = '#1f6f5c'; c.fillText(LQ.rank().toUpperCase(), 480, 70);
    const L = (i, a, b, o) => D.line(c, 170, 106 + i * 29, 620, a, b, Object.assign({ size: 24 }, o));
    L(0, 'Household income', M(f.income)); L(1, f.itemize ? 'Itemized deductions' : 'Standard deduction' + (f.giftStd ? ' + gifts' : ''), M(f.ded));
    L(2, 'Credits claimed', M(f.credits), D.GREEN); L(3, 'Total federal tax', M(f.total)); L(4, owed ? 'Paid at filing' : 'Refund received', M(Math.abs(f.diff)), owed ? D.RED : D.GREEN);
    L(5, 'Lost receipts found', HUNT.filter(got).length + ' of ' + HUNT.length); L(6, 'Right on the first try', s.first + ' of ' + s.asked);
    L(7, 'Savvy', String(s.savvy)); L(8, 'Audits faced', String(s.audits || 0)); L(9, 'Net worth', String(LQ.netWorth()), D.GREEN);
    L(10, 'Journal entries', s.journal.length + ' of ' + Object.keys(LQ.JOURNAL).length);
    c.font = F(22); c.textAlign = 'center'; c.fillStyle = '#7a6a48';
    ui.wrap(c, 'Two chapters down. Shelter Coast and Paystub Village both stay open for trading, shopping, and audits.', 620).forEach((ln, i) => c.fillText(ln, 480, 430 + i * 22));
  } };
  await LQ.fadeTo(0.5); await LQ.pressOk();
  ui.doc = { draw(c) { LQ.drawWorldMap(c, 110, 40, 740, 420); } };
  await LQ.pressOk();
  await LQ.fadeTo(1, 0.3); ui.doc = null; LQ.world.music(); await LQ.fadeTo(0, 0.9);
  await say(N.marlowe, 'We did it. Coral is asleep, the return is filed, and I did not lose a single paper this week. Mostly because you carried them.');
  await say(null, 'Next: Chapter 3, Hustle Canyon, where a side gig turns into a second income. Until then, both towns are yours. Press J to reread your Tax Journal.');
}

// ---------- the Old Lighthouse
const LOOPHOLE = { name: 'Captain Loophole' };
const MYTHS2 = [
  { myth: 'A write-off is FREE MONEY! Spend a coin, and the kingdom hands ye a coin back!',
    opts: ['A deduction only saves its amount times my tax rate.', 'True. Deductible spending costs nothing.', 'Only business write-offs are free.'],
    truth: 'Spend $100 on something deductible in the 12% bracket and you save $12. You are still out $88.' },
  { myth: 'Bought a house? Then ye MUST itemize! Every homeowner does!',
    opts: ['Only if my itemized total beats the standard deduction.', 'True. Owning a home means itemizing.', 'Homeowners get both deductions.'],
    truth: 'Add it up every year. Many homeowners still do better with the standard deduction.' },
  { myth: 'Married? File SEPARATELY and keep yer treasure apart! It always saves!',
    opts: ['It usually costs more, and it blocks credits like the child care credit.', 'True. Separate returns keep money separate.', 'Married couples have to file separately.'],
    truth: 'Filing separately changes the tax math, not who owns the money. It rarely wins.' },
  { myth: 'Claim the dog! Claim the parrot! Anything that eats at yer table is a dependent!',
    opts: ['Pets never count. A dependent is a qualifying child or relative.', 'True, if the pet lives with me all year.', 'Only parrots. They can talk.'],
    truth: 'A dependent is a person who passes the tests, and to earn the Child Tax Credit the child needs a Social Security number.' },
  { myth: 'A giant refund means ye BEAT the taxman!',
    opts: ['It means I overpaid all year. I aim for close to even.', 'True. The bigger the refund, the bigger the win.', 'Refunds are a bonus for married couples.'],
    truth: 'A refund is your own money coming back, with no interest.' },
  { myth: 'Pay yer daycare in cash, keep no papers, and claim the credit anyway!',
    opts: ["No. The credit needs the provider's name and tax ID on my return.", 'True. Nobody checks daycare.', 'Cash payments earn a double credit.'],
    truth: 'No provider ID, no credit. And no records means no defense if anyone asks.' },
  { myth: 'Raffle tickets! Bake sale cookies! Charity, all of it! Deduct every crumb!',
    opts: ['Only what I give beyond what I get back counts.', 'True. Anything bought from a charity counts.', 'Only the cookies count.'],
    truth: 'A gift is what you give without getting something back. A ticket or a cookie is a purchase.' },
];
LQ.BOSSES.loophole = {
  who: LOOPHOLE, label: 'CAPTAIN LOOPHOLE', kind: 'loophole', sky: ['#0b1e33', '#1f5a6e'], hill: '#0e2f3f', ground: ['#e8d498', '#d2bb7c'], fog: '120,220,210', bar: ['#1f8a86', '#8fe6da'], ink: '#14575a',
  approach: 'A bell clangs. From the lamp room drifts a shape in a tricorn hat, trailing treasure maps.',
  intro: ['ARRR! A customer! Captain Loophole, purveyor of secret write-offs. Every map I sell leads to buried deductions the taxman does not want ye to find!', 'Half this coast has bought one already. Let us see if YE can resist a bargain.'],
  taunt: 'Har har har! Sold! That will be one map, no refunds.', fogLine: 'The sea mist muddles your thinking.',
  myths: () => MYTHS2,
  final: () => {
    const f = LQ.fin2(), cr = f.ctc + f.care, after = f.tax - cr;
    return { bubble: `ENOUGH! Riddle me this. Yer joint income tax is ${M(f.tax)}. Ye hold a ${M(f.ctc)} Child Tax Credit and a ${M(f.care)} care credit. What is left of the tax? Ye will NEVER work it out!`, prompt: 'Sink him:',
      opts: [`${M(f.tax)} minus ${M(cr)} leaves ${M(after)}`, `Credits save their amount times my ${pct(f.top)} rate: ${M(f.tax - cr * f.top)}`, `Credits come off income, so the tax is still ${M(f.tax)}`],
      wrong: ['That is how a deduction works. A credit comes off the tax itself, dollar for dollar.', 'A deduction comes off income. A credit comes straight off the tax.'], strike: `${M(after)}. A credit is worth every coin on its face. No map required.` };
  },
  lastWords: 'No! Me maps! Me beautiful, worthless maps! Without a sucker to sell to, I am... only... sea mist...',
  after: 'Captain Loophole dissolves into spray. His treasure maps flutter down to the sand. Every one of them is blank.',
  win: async () => {
    const s = st();
    s.flags.boss2 = true; s.q2 = 7; LQ.give('medal2'); LQ.gain(50, 120, 'Captain Loophole sunk');
    LQ.tick(); if (s.prices && s.prices.LAMP != null) { s.prev.LAMP = s.prices.LAMP; s.prices.LAMP *= 1.45; s.gazette.unshift('The Old Lighthouse is safe again! Lantern Works relights the great lamp.'); }
  },
  done: async () => { ui.toast('New quest: ' + LQ.QUESTS2[7].short); await say(null, 'The lighthouse lamp turns, steady and bright. One task remains: take your receipts and your new family to the Coast Tax Office and file.'); },
};

// ---------- villagers who teach expert moves
const TIPS = {
  gull: { j: 'pro2Hoh', lines: ['I raised my grandson alone in the blue house, and for years I filed as Single. It cost me a fortune.', 'If you are unmarried, pay more than half the cost of keeping up your home, and a qualifying child lives with you for more than half the year, you file as Head of Household. For 2026 that is a $24,150 standard deduction instead of $16,100, and wider brackets too.'],
    q: ['Who can file as Head of Household?', ['An unmarried person who pays most of the cost of a home for a qualifying child', 'Whoever earns the most in a married couple', 'Anyone who owns a house']] },
  finch: { j: 'pro2Fsa', lines: ['The shipyard offers a health FSA. Pay goes in before tax and I spend it at the dentist. Up to $3,400 for 2026.', 'But it is use it or lose it. My plan lets me carry over $680 at most. One year I put in too much and bought four pairs of spectacles in December.'],
    q: ['What is the catch with a health FSA?', ['Money I do not spend is mostly lost at year end', 'It can only pay for surgery', 'The money is taxed twice']] },
  kelp: { j: 'pro2Dcfsa', lines: ['Two little ones in daycare. My employer has a dependent care FSA: up to $7,500 a household for 2026, straight out of my pay before tax.', 'But you cannot use the same coins twice. Every dollar I run through the FSA comes off the costs the child care credit can count. For many families the FSA saves more. Work it out both ways.'],
    q: ['Can the same daycare dollars go through the FSA and also earn the child care credit?', ['No. FSA dollars come off the costs the credit can count', 'Yes. Both, in full', 'Only in the first year']] },
  reed: { j: 'pro2Aotc', lines: ['Four years of college, and my family claimed the American Opportunity Credit in every one: up to $2,500 a year for tuition and books.', 'Up to $1,000 of it is refundable, so it helps even a family that owes no tax. It only covers the first four years, and it fades at higher incomes. Save the tuition statements. Coral will be eighteen before you blink.'],
    q: ['How many years of college can the American Opportunity Credit cover for one student?', ['The first four', 'Only the first', 'As many as it takes']] },
  barnacle: { j: 'pro2Mfs', lines: ['My late wife and I filed separately for thirty years because my brother said it kept our money apart. It did no such thing. It only raised our tax.', 'File separately and you lose the child care credit, the student loan interest deduction, the education credits, and the overtime deduction. And if one of you itemizes, the other must too. It helps only in rare cases. Work it out both ways first.'],
    q: ['One spouse files separately and itemizes. What must the other spouse do?', ['Itemize too, even if their deductions are tiny', 'Take the standard deduction', 'Nothing. They do not need to file']] },
  lark: { j: 'pro2Home', lines: ['I sold my house on the bluff last year for far more than I paid. Tax on the profit? Not a coin.', 'Own your main home and live in it for two of the five years before you sell, and up to $250,000 of profit is tax-free. $500,000 for a married couple filing jointly. And whatever you spend on real improvements raises your cost, so keep those receipts for as long as you own the place.'],
    q: ['A married couple sells the main home they lived in for six years. How much profit can be tax-free?', ['Up to $500,000', 'Up to $3,000', 'None. All home profit is taxed']] },
  ivy: { j: 'pro2Name', lines: ["I took my husband's name in spring and filed in a hurry. The kingdom bounced my return straight back.", "The name and Social Security number on your return have to match the Social Security Administration's records. Change your name with them first, then file. Otherwise your return can be rejected and your refund delayed."],
    q: ['You changed your name when you married. Who must know before you file?', ['The Social Security Administration', 'Nobody. The IRS works it out', 'Only my employer']] },
  otto: { j: 'pro2Baby', lines: ['My granddaughter was born this winter, and the Treasury put $1,000 into an account with her name on it. A Trump Account, they call it.', 'Babies born from 2025 through 2028 get the $1,000. Any child under 18 can have an account, and family can add up to $5,000 a year. It goes into stock index funds and generally stays locked until the year the child turns 18. Coral was born too early for the free $1,000, but you could still open one for her.'],
    q: ['When can money in a Trump Account generally first be taken out?', ['The year the child turns 18', 'Any time, tax-free', 'Only at retirement']] },
};
async function tip(id) {
  const t = TIPS[id], who = N[id], s = st();
  if (s.tips[id]) return say(who, LQ.JOURNAL[t.j].text);
  for (const ln of t.lines) await say(who, ln);
  if (await LQ.quiz(who, t.q[0], t.q[1], 'Talk to me again and we will go over it once more.')) {
    s.tips[id] = true; LQ.gain(15, 30, 'Expert tip'); LQ.learn(t.j); LQ.tick();
    await say(who, 'You have got it. I wrote it in your Tax Journal.');
  }
}

// ---------- everyday chatter
const q2 = () => st().q2 == null ? -1 : st().q2;
const CORAL = ['I found a crab. His name is Deduction.', 'Boats go in the water. Boots go in the sand. I checked.', 'Marlowe says I am worth two thousand two hundred coins. I think more.', 'When I am big I am going to be an auditor. BOO!'];
const idle = {
  marlowe: async () => say(N.marlowe, q2() >= 8 ? 'A home, a wedding, and Coral. Best year of my life, and the return is already filed.' : q2() >= 3 ? 'Have you seen what daycare costs? Thank goodness for that credit. ' + LQ.curQuest().text + '.' : 'If you find any of my lost receipts, hold on to them. ' + LQ.curQuest().text + '.'),
  coral: async () => say(N.coral, CORAL[Math.floor(Math.random() * CORAL.length)]),
  brine: async () => say(N.brine, q2() < 1 ? 'New to the coast? Go and find Marlowe at your cottage first.' : 'Interest counts. Principal never does. And keep those closing papers for as long as you own the place.'),
  pearl: async () => say(N.pearl, q2() < 2 ? 'The chapel is being decorated. See Banker Brine about your mortgage papers first.' : 'Married on December 31, married all year. I tell every couple.'),
  dory: async () => say(N.dory, q2() < 3 ? 'Coral is napping. Come back after the wedding and we will talk about what she means for your taxes.' : 'A credit comes off the tax. A deduction comes off the income. Coral can nearly say it herself.'),
  stone: async () => say(N.stone, q2() < 4 ? 'Payroll is closed for now. Sort out the wedding and Coral first, then come and fix your forms.' : 'Life changes, the W-4 changes. Step 2(c) when you both earn. Do not forget.'),
  tallow: async () => say(N.tallow, q2() < 5 ? 'I weigh receipts, and yours are not ready. Come back once your tax payments are set with the Harbormaster.' : 'Whichever shield is larger on the day you file. Keep hunting if you like.'),
  fathom: async () => say(N.fathom, q2() < 7 ? 'The filing window is not open for you yet. Bring your receipts, your new status, and a clear head.' : 'Your joint return is filed and stamped. See you next April.'),
};
const QUEST_FN = { marlowe: [0, qMarlowe], brine: [1, qBrine], pearl: [2, qPearl], dory: [3, qDory], stone: [4, qStone], tallow: [5, qTallow], fathom: [7, qFathom] };
const CHESTS = {
  drawer: { tx: 14, ty: 9 },
  cc1: { tx: 44, ty: 21, tip: 'tip2Keep', line: 'A note inside reads: "Keep your closing statement and improvement receipts for as long as you own the home."' },
  cc2: { tx: 2, ty: 28, tip: 'tip2Est', line: 'A note inside reads: "The IRS Tax Withholding Estimator is free at IRS.gov. Use it after every big life change."' },
  cc3: { tx: 38, ty: 35, tip: 'tip2Sign', line: 'A note inside reads: "On a joint return, both spouses answer for every line. Read before you sign."' },
};

// ---------- audit questions for this chapter
LQ.AUDIT_POOL.push(
  { need: 'mortgage', q: 'Which part of a mortgage payment can be deducted if you itemize?', o: ['The interest', 'The principal', 'The whole payment'], why: 'Only the interest, on up to $750,000 of home loan debt.' },
  { need: 'salt', q: 'What is the 2026 cap on the state and local tax deduction?', o: ['$40,400', '$10,000', 'There is no cap'], why: '$40,400 for 2026, shrinking for incomes above $505,000.' },
  { need: 'mfj', q: 'What is the 2026 standard deduction for a married couple filing jointly?', o: ['$32,200', '$16,100', '$24,150'], why: '$16,100 is single. $24,150 is head of household.' },
  { need: 'ctc', q: 'How much is the 2026 Child Tax Credit for each qualifying child?', o: ['Up to $2,200', 'Up to $500', 'Up to $16,100'], why: 'Up to $2,200, with up to $1,700 refundable.' },
  { need: 'dependent', q: 'Does a stepchild who lives with you count as a qualifying child?', o: ['Yes, exactly like a son or daughter', 'No, only birth children count', 'Only after five years'], why: 'Stepchildren, foster children, and siblings can all qualify.' },
  { need: 'carecredit', q: 'How much daycare cost counts toward the care credit for one child?', o: ['Up to $3,000', 'Up to $9,000', 'All of it'], why: '$3,000 for one child, $6,000 for two or more.' },
  { need: 'w4two', q: 'Both spouses work. What should they do on their W-4s?', o: ['Both tick the box in Step 2(c)', 'Both leave everything blank', 'Both claim the same child'], why: 'Step 2(c) stops the deduction and low brackets being counted twice.' },
  { need: 'itemize2', q: 'You bought a home this year. Should you itemize?', o: ['Only if the itemized total beats the standard deduction', 'Yes. Homeowners always itemize', 'No. Homeowners cannot itemize'], why: 'Add it up each year and take the larger one.' },
  { need: 'charity2', q: 'You itemize. How much of your charity gifts can you deduct from 2026?', o: ['Only the part above 0.5% of my income', 'All of it', 'None of it'], why: 'Itemizers face a floor of 0.5% of income.' },
  { need: 'writeoff', q: 'You are in the 12% bracket. What does a $100 deduction save you?', o: ['$12', '$100', '$88'], why: 'A deduction saves its amount times your rate.' },
  { need: 'medical', q: 'Medical bills are deductible only above what share of your income?', o: ['7.5%', '0.5%', '2%'], why: 'Only the part above 7.5% of adjusted gross income, and only if you itemize.' },
  { need: 'pro2Hoh', q: 'What is the 2026 standard deduction for Head of Household?', o: ['$24,150', '$16,100', '$32,200'], why: 'More than single, less than a joint return.' },
  { need: 'pro2Home', q: 'How long must you own and live in a home to exclude the profit when you sell?', o: ['Two of the last five years', 'Ten years', 'Six months'], why: 'Two of the five years before the sale.' },
  { need: 'pro2Dcfsa', q: 'What is the 2026 household limit for a dependent care FSA?', o: ['$7,500', '$3,400', '$24,500'], why: '$3,400 is the health FSA. $24,500 is the 401(k).' },
);

LQ.CH2 = {
  npcs: NPC_LIST, chests: CHESTS, begin, found, hunt: HUNT,
  spots: { rCart: [42, 9], rChapel: [6, 9], rSchool: [15, 23], rRaffle: [25, 18], rLight: [36, 28], rMedical: [4, 22] },
  coins: [[10, 10], [20, 11], [28, 10], [36, 11], [42, 10], [6, 20], [12, 21], [30, 20], [40, 21], [23, 5], [24, 23], [8, 28], [16, 28], [33, 28], [24, 33], [41, 28], [39, 33], [43, 35]],
  signs: [
    { tx: 22, ty: 3, text: 'SHELTER COAST. North-west: the chapel and your cottage. North-east: the Records Hall and the shipyard. South-west: the bank and the nursery. South-east: the Coast Tax Office. In the plaza: the Driftwood Bazaar and the Harbor Exchange.' },
    { tx: 20, ty: 9, text: 'Your cottage. Thirty years of payments. The sea view is free.' },
    { tx: 25, ty: 26, text: 'THE PIER. Mind the gulls.' },
    { tx: 39, ty: 29, fn: () => st().flags.boss2 ? 'THE OLD LIGHTHOUSE. Lit again, and quiet.' : 'THE OLD LIGHTHOUSE. Cut off at high tide. Do not buy maps from strangers.' },
    { tx: 26, ty: 13, fn: () => 'THE HARBOR GAZETTE. Today: ' + (st().news ? st().news.text : 'No news.') + ' (Prices react tomorrow.)' + (st().flags.boss2 ? '' : ' Standing notice: Lantern Works will relight the great lamp if the lighthouse is ever made safe.') },
  ],
  talk: async id => {
    const q = QUEST_FN[id];
    if (q && st().q2 === q[0]) return q[1]();
    if (id === 'trader') return LQ.shop(N.trader);
    if (id === 'quay') return LQ.broker(N.quay);
    if (TIPS[id]) return tip(id);
    return idle[id]();
  },
  openChest: async id => {
    const s = st(), ch = CHESTS[id];
    if (id === 'drawer') {
      if (q2() < 2) return say(null, 'A sea chest stuffed with household papers. You are not sure yet what you are looking for.');
      s.chests[id] = true; return found('rPoints');
    }
    s.chests[id] = true; LQ.audio.sfx('coin'); LQ.gain(0, 40);
    await say(null, 'You found 40 coins! ' + ch.line); LQ.learn(ch.tip);
  },
  // Skip ahead: a ready-made hero who has finished Chapter 1.
  starter() {
    const s = st(), se = isOwner();
    s.quest = 9; s.w4 = 0; s.coins = 500; s.savvy = 150; s.flags.bossDown = true; s.season = 'summer';
    s.journal = (se ? ['estimates', 'selfEmp', 'records', 'qbi'] : ['withholding', 'paystub', 'fica', 'w2']).concat(['status', 'deduction'], s.career === 'nurse' ? ['overtime'] : [], ['brackets', 'raise', 'refund', 'filing', 'latefile']);
    s.items = ['w4', 'paystub', 'w2', 'banner', 'shield', 'compass', 'medal', 'return'];
    s.region = 'coast'; s.px = 24 * 16; s.py = 2 * 16 + 8; s.dir = 'down';
  },
};
})();
