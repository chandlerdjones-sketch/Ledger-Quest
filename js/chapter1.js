// Chapter 1 content: characters, quests, documents, and everything the player learns.
(() => {
const LQ = window.LQ, F = LQ.F, ui = LQ.ui, M = n => LQ.money(n);
const say = LQ.say, ask = LQ.ask, choose = LQ.choose;
const TX = LQ.TAX, STD = TX.standardDeduction;
const st = () => LQ.state, pct = r => Math.round(r * 100) + '%';
const isOwner = () => LQ.career().kind === 'se';

// ---------- cast
const P = (id, name, tx, ty, look, dir = 'down') => ({ id, name, tx, ty, dir, look: Object.assign({ id }, look) });
LQ.HERO = { name: 'You', get look() { return LQ.heroLook(); } };
const NPC_LIST = [
  P('mayor', 'Mayor Marigold', 25, 37, { hat: 'top', hair: '#d9d9e3', shirt: '#7b4bb8', beard: '#e8e8f0', trim: '#f3d24a' }, 'left'),
  P('brannock', 'Foreman Brannock', 8, 24, { hair: '#8a8a96', shirt: '#8a5a30', beard: '#8a8a96', pants: '#3d2f24' }),
  P('pim', 'Paymaster Pim', 14, 24, { hat: 'cap', hatColor: '#3d9a5a', hair: '#c8742c', shirt: '#3d9a5a' }),
  P('odette', 'Postmaster Odette', 39, 24, { hat: 'cap', hatColor: '#2f6fd0', hair: '#e8c45a', long: 1, shirt: '#2f6fd0', trim: '#f3f0e6' }),
  P('sable', 'Guildmaster Sable', 14, 21, { hair: '#231a36', long: 1, shirt: '#b0332e', robe: 1, trim: '#f3d24a', skin: '#c98d62' }),
  P('thorn', 'Armorer Thorn', 31, 21, { hat: 'helm', hair: '#5a3a22', shirt: '#6f7890', beard: '#5a3a22', pants: '#3a3550' }),
  P('altamira', 'Sage Altamira', 25, 12, { hat: 'hood', hair: '#e8e8f0', shirt: '#2f8a8a', robe: 1, beard: '#e8e8f0', skin: '#e2b184' }, 'left'),
  P('juno', 'Registrar Juno', 30, 34, { hair: '#a8452c', long: 1, shirt: '#2a3a6e', robe: 1, trim: '#f3f0e6' }),
  P('merchant', 'Merchant Saffron', 20, 24, { hair: '#231a36', shirt: '#e0a02c', robe: 1, trim: '#b0332e', skin: '#b87a52', hat: 'cap', hatColor: '#b0332e' }),
  P('broker', 'Broker Bex', 27, 24, { hair: '#e8e8f0', shirt: '#22304f', trim: '#7fd6a8', pants: '#22304f', hat: 'top' }),
  P('rowan', 'Rowan', 20, 29, { hair: '#3a2a1c', shirt: '#d98a2c', skin: '#b87a52' }),
  P('fen', 'Fen', 35, 25, { hair: '#c8742c', long: 1, shirt: '#58a8c8' }),
  P('wren', 'Wren the Fisher', 10, 18, { hat: 'cap', hatColor: '#8a7a3a', hair: '#4a4a56', shirt: '#6a8a4a', beard: '#4a4a56' }, 'up'),
  P('pip', 'Pip', 27, 32, { hair: '#e8c45a', shirt: '#e86a9a', pants: '#4a6ad0' }),
  P('maple', 'Granny Maple', 12, 34, { hair: '#e8e8f0', long: 1, shirt: '#8a5a8f', robe: 1, trim: '#f3f0e6' }),
  P('dex', 'Dex the Student', 18, 21, { hair: '#2a5a3a', shirt: '#4a6ad0', pants: '#5a4630' }),
  P('alms', 'Sister Alms', 21, 33, { hat: 'hood', hair: '#5a3a22', shirt: '#f3f0e6', robe: 1, skin: '#c98d62' }),
  P('gale', 'Old Trader Gale', 29, 25, { hair: '#8a8a96', shirt: '#5a4a7a', beard: '#8a8a96', trim: '#f3d24a' }, 'left'),
  P('flint', 'Miner Flint', 20, 12, { hat: 'helm', hair: '#3a2a1c', shirt: '#7a5a3a', beard: '#3a2a1c' }),
  P('juniper', 'Juniper the Carter', 41, 25, { hair: '#a8452c', long: 1, shirt: '#3d7a5a', pants: '#5a4630' }, 'left'),
  P('basil', 'Cook Basil', 6, 25, { hat: 'cap', hatColor: '#f3f0e6', hair: '#231a36', shirt: '#f3f0e6', pants: '#3a3550', skin: '#b87a52' }),
];
LQ.NPCS = {}; NPC_LIST.forEach(n => { LQ.NPCS[n.id] = n; });
const N = LQ.NPCS;

LQ.QUESTS = [
  { short: 'Meet the Mayor', text: 'Talk to Mayor Marigold', target: 'mayor' },
  { short: 'Set up your tax payments', text: 'See Foreman Brannock at the Work Hall (west)', target: 'brannock' },
  { short: 'Read your first statement', text: 'See Paymaster Pim at the green stall', target: 'pim' },
  { short: 'Collect your year-end forms', text: 'Pick up your mail at the Post Office (east)', target: 'odette' },
  { short: 'Choose a filing status', text: 'Visit Guildmaster Sable at the Guild Hall', target: 'sable' },
  { short: 'Pick your deduction', text: 'Visit Armorer Thorn at the Armory', target: 'thorn' },
  { short: 'Learn the brackets', text: 'Cross the bridge and find Sage Altamira', target: 'altamira' },
  { short: 'Defeat the Mythmonger', text: 'Climb Bracket Mountain and face the Mythmonger', target: 'boss' },
  { short: 'File your return', text: 'File your return with Registrar Juno at Town Hall', target: 'juno' },
  { short: 'Travel to Shelter Coast', text: 'Take the South Road to Shelter Coast', target: 'southroad' },
];

LQ.JOURNAL = {
  withholding: { title: 'Withholding (W-4)', text: 'Your employer holds back part of every paycheck and sends it to the IRS for you. Form W-4 tells them how much. Too little withheld means a bill at tax time. Too much means smaller paychecks and a refund later. You can hand in a new W-4 whenever your life changes.' },
  estimates: { title: 'Estimated taxes', text: 'If nobody withholds tax for you, you pay it yourself four times a year with Form 1040-ES. Skip the payments and the IRS adds an underpayment penalty. You are generally safe if you owe under $1,000 at filing, or paid at least 90% of this year\'s tax or 100% of last year\'s.' },
  paystub: { title: 'Reading a paystub', text: 'Gross pay is what you earned. Net pay is what you take home. The gap between them is mostly federal income tax, Social Security, and Medicare. Many states take income tax too.' },
  fica: { title: 'Social Security & Medicare', text: 'Two payroll taxes that are a flat share of your wages: 6.2% for Social Security (on wages up to $184,500 in 2026) and 1.45% for Medicare. Your employer pays a matching amount. Your W-4 does not change them.' },
  selfEmp: { title: 'Self-employment tax', text: 'When you work for yourself, you are the employee and the employer, so you pay both halves of Social Security and Medicare: 15.3% on 92.35% of your net profit. You may deduct half of it. You are taxed on profit (sales minus business expenses), so every legitimate expense you track lowers the bill.' },
  w2: { title: 'Form W-2', text: 'Each January your employer sends a W-2 that sums up the year. Box 1 is the wages you report on your return. Box 2 is the federal income tax already withheld. You need it to file.' },
  records: { title: 'Year-end records (1099)', text: 'Clients may send Form 1099-NEC showing what they paid you. But you must report all of your business income, whether or not a form arrives. Your own books are the real record.' },
  status: { title: 'Filing status', text: 'Your status sets your standard deduction and your brackets. It depends on your real situation on the last day of the year: Single, Married Filing Jointly, Married Filing Separately, Head of Household, or Qualifying Surviving Spouse.' },
  deduction: { title: 'Standard vs. itemized', text: 'A deduction lowers the income that gets taxed. You take the standard deduction (2026: $16,100 single, $32,200 married filing jointly, $24,150 head of household) or the total of your itemized deductions, whichever is larger. Most people take the standard deduction.' },
  overtime: { title: 'Overtime deduction', text: 'For 2025 through 2028 you can deduct qualified overtime pay: the extra "half" in time-and-a-half, up to $12,500 for a single filer. It works even if you take the standard deduction, and it starts shrinking above $150,000 of income. Social Security and Medicare still apply.' },
  qbi: { title: 'Business income deduction', text: 'Many small business owners can deduct up to 20% of their qualified business income. For most small shops it is 20% of the smaller of your business profit or your taxable income. You do not need to itemize to take it.' },
  brackets: { title: 'Marginal tax brackets', text: 'Income is taxed in layers. For a single filer in 2026, the first $12,400 of taxable income is taxed at 10%, the next slice up to $50,400 at 12%, then 22% up to $105,700, and so on up to 37%. Only the dollars inside a layer get that layer\'s rate.' },
  raise: { title: 'The raise myth', text: 'Crossing into a higher bracket never shrinks your whole paycheck. Only the dollars above the line are taxed at the higher rate, so a raise always leaves you with more than you had before.' },
  refund: { title: 'Refund or balance due', text: 'Tax owed minus tax already paid. If you paid in more than you owe, the difference comes back as a refund. It was your money all along. If you paid in less, you pay the difference.' },
  filing: { title: 'Filing a return', text: 'The heart of Form 1040: income, minus your deductions, equals taxable income. Work out the tax on that, subtract credits and what you already paid, and you have a refund or a balance due. Most returns are due April 15.' },
  latefile: { title: 'File even if you can\'t pay', text: 'The penalty for filing late is usually 5% of the unpaid tax per month. The penalty for paying late is usually 0.5% per month. So file on time, pay what you can, and ask the IRS about a payment plan.' },
  audit: { title: 'How audits really work', text: 'In the game, auditors leap out of bushes. In real life audits are rare, most are handled by mail, and they usually just ask you to back up a number on your return. Honest filers with good records have little to fear. Keep your receipts and answer on time.' },
  brokerage: { title: 'Taxable brokerage account', text: 'An ordinary investing account with no special tax shelter. You owe tax when you sell for a gain and on dividends. Gains on shares held a year or less are taxed like wages. Held longer, they get lower long-term rates. (The game settles the tax the moment you sell. In real life it goes on your return.)' },
  gearTiming: { title: 'When savings count', text: 'IRA and HSA contributions can count for a tax year right up to the filing deadline. 401(k) contributions have to come out of your paychecks during the year. The game keeps it simple: anything you buy before you file counts.' },
  tipDeadline: { title: 'Tip: the deadline', text: 'For most people the federal return is due April 15. If you need more time to file you can request an extension, but an extension to file is not an extension to pay.' },
  tipRecords: { title: 'Tip: keep records', text: 'Keep your returns and the papers behind them (W-2s, receipts) for at least three years. That is the usual window for the IRS to ask questions or for you to claim a missed refund.' },
  tipFreeFile: { title: 'Tip: file for free', text: 'The IRS Free File program offers free guided tax software to people under a yearly income limit. Check IRS.gov before paying for software.' },
  proW4: { title: 'Pro: update your W-4', text: 'Marriage, a baby, a second job, or a big raise all change how much should be withheld. Hand in a new W-4 after any big change. The free IRS Tax Withholding Estimator tells you what to enter.' },
  proMatch: { title: 'Pro: take the match', text: 'If your employer matches 401(k) contributions, put in at least enough to get the full match. It is an instant return on your money, and skipping it is turning down part of your pay.' },
  proRoth: { title: 'Pro: Roth or traditional', text: 'Traditional accounts give a tax break today and tax withdrawals later. Roth accounts tax the money today and let it come out tax-free. If you expect a higher bracket later in life, Roth tends to win. If you expect a lower one, traditional does.' },
  proCredit: { title: 'Pro: credits beat deductions', text: 'A credit comes straight off your tax, dollar for dollar. A deduction only lowers the income being taxed, so it saves its amount times your bracket rate. A $100 credit saves $100. A $100 deduction in the 12% bracket saves $12.' },
  proHSA: { title: 'Pro: the HSA', text: 'A Health Savings Account has three tax breaks: money goes in tax-free, grows tax-free, and comes out tax-free for medical costs. You need a high-deductible health plan. The 2026 limit is $4,400 for self-only coverage.' },
  proLoan: { title: 'Pro: student loan interest', text: 'You can deduct up to $2,500 of student loan interest a year without itemizing. For 2026 the deduction starts to shrink above $85,000 of income for a single filer and is gone at $100,000.' },
  proCharity: { title: 'Pro: giving without itemizing', text: 'Starting with tax year 2026, people who take the standard deduction can still deduct cash gifts to qualified charities: up to $1,000, or $2,000 for a married couple filing jointly. Keep the receipt.' },
  proGains: { title: 'Pro: hold for a year', text: 'Gains on investments held a year or less are taxed like wages. Hold more than a year and the long-term rates apply: 0%, 15%, or 20%. In 2026 a single filer with taxable income up to $49,450 pays 0% on long-term gains.' },
  proLoss: { title: 'Pro: harvest your losses', text: 'Selling at a loss cancels out gains. If losses are larger than gains, up to $3,000 a year can offset other income and the rest carries forward. If you buy the same investment back within 30 days, the wash sale rule disallows the loss.' },
  proBiz: { title: 'Pro: self-employed write-offs', text: 'Business miles are deductible: 72.5 cents a mile in early 2026 and 76 cents from July 1. A home office used only for work can be claimed the simple way at $5 per square foot, up to 300 square feet. Keep a log. No records, no deduction.' },
  proSaver: { title: "Pro: the Saver's Credit", text: "If your income is under $40,250 as a single filer in 2026, the Saver's Credit gives back 10% to 50% of up to $2,000 you put into a retirement account. It is a credit, so it comes straight off your tax. Many people who qualify never claim it." },
};
LQ.ITEMS = {
  w4: { name: 'Tax Payment Plan', desc: 'Your W-4 or estimated payment schedule.' },
  paystub: { name: 'First Statement', desc: 'What you earned, and what came out of it.' },
  w2: { name: 'Year-End Forms', desc: 'Your year in numbers, ready for filing.' },
  banner: { name: 'Banner of the Single Filer', desc: 'Your filing status, set by your situation on December 31.' },
  shield: { name: 'Standard Shield', desc: 'Blocks $16,100 of income from being taxed.' },
  compass: { name: 'Bracket Compass', desc: 'Always points to the truth: brackets are marginal.' },
  medal: { name: 'Clear Skies Medal', desc: 'Proof that you scattered the Mythmonger\'s fog.' },
  return: { name: 'Stamped Tax Return', desc: 'Filed, on time, and you understood every line.' },
};

// ---------- document drawing
function paper(c, x, y, w, h, title, sub) {
  c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(x + 7, y + 7, w, h);
  c.fillStyle = '#e6eaff'; c.fillRect(x, y, w, h);
  c.fillStyle = '#cdd4f8'; c.fillRect(x, y, w, 34);
  c.strokeStyle = '#7a74b8'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, w - 2, h - 2);
  c.font = F(13, true); c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = '#1a1640'; c.fillText(title, x + 16, y + 11);
  if (sub) { c.font = F(22); c.textAlign = 'right'; c.fillStyle = '#5a5490'; c.fillText(sub, x + w - 16, y + 6); }
}
function line(c, x, y, w, label, value, o = {}) {
  const fs = o.size || 26;
  if (o.hl) { c.fillStyle = `rgba(255,205,50,${.4 + .22 * Math.sin(LQ.time * 6)})`; c.fillRect(x - 8, y - 2, w + 16, fs + 3); }
  c.font = F(fs); c.textBaseline = 'top';
  const labelWidth = w - c.measureText(String(value)).width - 12;
  c.textAlign = 'left'; c.fillStyle = o.color || '#15122e'; c.fillText(label, x, y, Math.max(1, labelWidth));
  c.textAlign = 'right'; c.fillStyle = o.vcolor || o.color || '#15122e'; c.fillText(value, x + w, y);
}
const rule = (c, x, y, w) => { c.fillStyle = '#7a74b8'; c.fillRect(x, y, w, 2); };
const RED = { vcolor: '#b0332e' }, GREEN = { vcolor: '#1f6f5c' };
function sideBox(c, title, rows) {
  c.fillStyle = '#f4f6ff'; c.fillRect(592, 62, 286, 216); c.strokeStyle = '#7a74b8'; c.strokeRect(593, 63, 284, 214);
  c.font = F(11, true); c.textAlign = 'left'; c.fillStyle = '#5a5490'; c.fillText(title, 608, 76);
  rows.forEach((r, i) => { if (r === 0) return rule(c, 608, 100 + i * 32 - 4, 254); line(c, 608, 100 + i * 32, 254, r[0], r[1], r[2]); });
}

LQ.docs = { paper, line, rule, sideBox, RED, GREEN };

const w4Doc = { pick: 0, signed: false, draw(c) {
  const f = LQ.fin(this.pick), p = this.pick;
  paper(c, 60, 20, 840, 272, 'FORM W-4', "Employee's Withholding Certificate (simplified)");
  const L = (i, a, b, hl) => line(c, 84, 66 + i * 36, 470, a, b, { hl });
  L(0, 'Step 1   Filing status', 'Single'); L(1, 'Step 2   More than one job?', 'No'); L(2, 'Step 3   Dependents', '$0');
  L(3, 'Step 4(b) Extra deductions', p === 2 ? '$8,000' : '$0', p === 2);
  L(4, 'Step 4(c) Extra withholding', p === 1 ? '$40 per check' : '$0', p === 1);
  L(5, 'Step 5   Signature', this.signed ? '~ signed ~' : '____________');
  sideBox(c, 'EACH PAYCHECK', [['Gross pay', M(f.gross)], ['Federal tax', '-' + M(f.per), { vcolor: '#b0332e', hl: true }], ['Soc. Security', '-' + M(f.ss), RED], ['Medicare', '-' + M(f.med), RED], 0, ['Take-home', M(f.net), GREEN]]);
} };
const estDoc = { pick: 0, signed: false, draw(c) {
  const f = LQ.fin(this.pick);
  paper(c, 60, 20, 840, 272, 'FORM 1040-ES', 'Estimated Tax for Individuals (simplified)');
  const L = (i, a, b, o) => line(c, 84, 66 + i * 36, 470, a, b, o);
  L(0, 'Expected net profit', M(f.c.sales - f.c.expenses)); L(1, 'Self-employment tax', M(f.baseSe)); L(2, 'Income tax', M(f.baseTax));
  rule(c, 84, 172, 470); L(3.1, 'Expected bill for the year', M(f.baseBill));
  L(4.2, 'Your payment each quarter', M(f.per), { hl: true }); L(5.2, 'Signature', this.signed ? '~ signed ~' : '____________');
  sideBox(c, 'EACH QUARTER', [['Net profit', M(f.gross)], ['Estimated tax', '-' + M(f.per), { vcolor: '#b0332e', hl: true }], 0, ['You keep', M(f.net), GREEN], ['Paid by year end', M(f.per * 4)]]);
} };

const stubDoc = { hl: null, draw(c) {
  const f = LQ.fin(), L = (i, key, a, b, o = {}) => line(c, 240, 70 + i * 38, 480, a, b, Object.assign({ hl: this.hl === key }, o));
  if (f.kind === 'w2') {
    paper(c, 210, 20, 540, 272, f.c.work.toUpperCase(), 'Pay statement  1 of 26');
    L(0, 'gross', 'Gross pay', M(f.gross)); L(1, 'fed', 'Federal income tax', '-' + M(f.per), RED);
    L(2, 'ss', 'Social Security  6.2%', '-' + M(f.ss), RED); L(3, 'med', 'Medicare  1.45%', '-' + M(f.med), RED);
    rule(c, 240, 226, 480); L(4.4, 'net', 'Net pay (take-home)', M(f.net), GREEN);
  } else {
    paper(c, 210, 20, 540, 272, 'YOUR CANDLE SHOP', 'Profit statement  Quarter 1 of 4');
    L(0, 'sales', 'Sales', M(f.sales / 4)); L(1, 'exp', 'Business expenses', '-' + M(f.expenses / 4), RED);
    rule(c, 240, 150, 480); L(2.2, 'profit', 'Net profit', M(f.gross), GREEN);
    L(3.2, 'se', 'Self-employment tax  15.3%', M(f.se / 4), RED); L(4.2, 'est', 'Estimated tax you paid', M(f.per));
  }
} };

const yearDoc = { k: 0, draw(c) {
  const f = LQ.fin(), n = Math.max(1, Math.round(this.k * f.pays)), L = (i, a, b, o) => line(c, 222, 84 + i * 40, 516, a, b, o);
  if (f.kind === 'w2') {
    paper(c, 190, 30, 580, 300, 'A YEAR AT WORK', 'Payday ' + n + ' of 26');
    L(0, 'Gross pay so far', M(f.gross * n)); L(1, 'Federal income tax withheld', M(f.per * n), RED);
    L(2, 'Social Security', M(f.ss * n), RED); L(3, 'Medicare', M(f.med * n), RED);
    rule(c, 222, 246, 516); L(4.3, 'Take-home so far', M(f.net * n), GREEN);
  } else {
    paper(c, 190, 30, 580, 300, 'A YEAR IN BUSINESS', 'Quarter ' + n + ' of 4');
    L(0, 'Sales so far', M(f.sales / 4 * n)); L(1, 'Business expenses', M(f.expenses / 4 * n), RED);
    L(2, 'Net profit so far', M(f.gross * n), GREEN); L(3, 'Estimated tax paid', M(f.per * n));
    rule(c, 222, 246, 516); L(4.3, 'Left in the business', M(f.net * n), GREEN);
  }
  c.fillStyle = '#d9cfae'; c.fillRect(222, 300, 516, 12); c.fillStyle = '#f3c531'; c.fillRect(222, 300, 516 * this.k, 12);
} };

const boxDoc = { hl: 0, draw(c) {
  const f = LQ.fin(), w2 = f.kind === 'w2';
  paper(c, 100, 20, 760, 272, w2 ? 'FORM W-2' : 'YEAR-END RECORDS', (w2 ? 'Wage and Tax Statement  ' : 'Form 1099-NEC and your own books  ') + TX.year);
  const boxes = w2 ? [[1, 'Wages, tips, other compensation', f.box1], [2, 'Federal income tax withheld', f.withheld],
    [3, 'Social security wages', f.wages], [4, 'Social security tax withheld', f.ssYear], [5, 'Medicare wages and tips', f.wages], [6, 'Medicare tax withheld', f.medYear]]
    : [[1, '1099-NEC from the Guild Hall', 18000], [2, 'Books: total sales', f.sales], [3, 'Books: business expenses', f.expenses], [4, 'Books: net profit', f.profit],
      [5, 'Estimated tax payments made', f.withheld], [6, 'Self-employment tax for the year', f.se]];
  boxes.forEach(([n, label, v], i) => {
    const x = 122 + (i % 2) * 366, y = 66 + Math.floor(i / 2) * 74;
    c.fillStyle = this.hl === n ? `rgba(255,205,50,${.55 + .25 * Math.sin(LQ.time * 6)})` : '#f4f6ff'; c.fillRect(x, y, 350, 64);
    c.strokeStyle = '#7a74b8'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, 348, 62);
    c.font = F(21); c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = '#5a5490'; c.fillText(n + '  ' + label, x + 10, y + 5);
    c.font = F(32); c.fillStyle = '#15122e'; c.fillText(M(v), x + 34, y + 28);
  });
} };

const STATUSES = [['Single', STD.single, '#3b6fd4'], ['Married Filing|Jointly', STD.mfj, '#b0332e'], ['Married Filing|Separately', STD.mfs, '#7b4bb8'], ['Head of|Household', STD.hoh, '#1f8a5c'], ['Qualifying|Surviving Spouse', STD.qss, '#c98a1c']];
const statusDoc = { caseText: '', draw(c) {
  STATUSES.forEach(([name, amt, col], i) => {
    const x = 62 + i * 170, y = 26 + Math.sin(LQ.time * 2 + i) * 3;
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 5, y + 5, 156, 150);
    c.fillStyle = col; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 156, y); c.lineTo(x + 156, y + 150); c.lineTo(x + 78, y + 126); c.lineTo(x, y + 150); c.fill();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x, y, 156, 8); c.fillStyle = '#f3d24a'; c.fillRect(x, y + 8, 156, 4);
    c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#fff'; c.font = F(24);
    name.split('|').forEach((ln, j) => c.fillText(ln, x + 78, y + 22 + j * 22));
    c.font = F(30); c.fillStyle = '#fff3b0'; c.fillText(M(amt), x + 78, y + 74);
    c.font = F(18); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillText('standard deduction', x + 78, y + 104);
  });
  if (this.caseText) {
    c.fillStyle = '#e6eaff'; c.fillRect(62, 196, 836, 70); c.strokeStyle = '#7a74b8'; c.lineWidth = 2; c.strokeRect(63, 197, 834, 68);
    c.font = F(26); c.textAlign = 'left'; c.fillStyle = '#15122e';
    ui.wrap(c, this.caseText, 800).forEach((ln, i) => c.fillText(ln, 80, 204 + i * 27));
  }
} };

function shieldShape(c, x, y, col, label, amt, lit) {
  c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.moveTo(x + 6, y + 6); c.lineTo(x + 186, y + 6); c.lineTo(x + 186, y + 96); c.lineTo(x + 96, y + 166); c.lineTo(x + 6, y + 96); c.fill();
  c.fillStyle = lit ? '#f3d24a' : '#8a8a96'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 180, y); c.lineTo(x + 180, y + 90); c.lineTo(x + 90, y + 160); c.lineTo(x, y + 90); c.fill();
  c.fillStyle = col; c.beginPath(); c.moveTo(x + 8, y + 8); c.lineTo(x + 172, y + 8); c.lineTo(x + 172, y + 86); c.lineTo(x + 90, y + 150); c.lineTo(x + 8, y + 86); c.fill();
  c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(x + 8, y + 8, 164, 10);
  c.textAlign = 'center'; c.textBaseline = 'top'; c.font = F(13, true); c.fillStyle = '#fff'; c.fillText(label, x + 90, y + 28);
  c.font = F(40); c.fillStyle = '#fff3b0'; c.fillText(M(amt), x + 90, y + 52);
}
const shieldDoc = { who: 'YOUR RECEIPTS', rows: [], total: 0, sel: -1, draw(c) {
  shieldShape(c, 80, 30 + Math.sin(LQ.time * 2) * 3, '#3b6fd4', 'STANDARD', STD.single, this.sel === 0);
  shieldShape(c, 300, 30 + Math.sin(LQ.time * 2 + 2) * 3, '#b0332e', 'ITEMIZED', this.total, this.sel === 1);
  paper(c, 530, 30, 370, 236, this.who);
  this.rows.forEach(([a, b], i) => line(c, 552, 78 + i * 36, 326, a, M(b)));
  rule(c, 552, 190, 326); line(c, 552, 204, 326, 'Itemized total', M(this.total), RED);
  c.font = F(24); c.textAlign = 'center'; c.fillStyle = '#c9cdea'; c.fillText('You may carry only one.', 280, 214);
} };

const mountDoc = { income: 0, show: 0, anim: 1, draw(c) {
  const tiers = LQ.taxOn(this.income).tiers;
  c.fillStyle = '#10142e'; c.fillRect(56, 16, 848, 282); c.strokeStyle = '#f3e7c3'; c.lineWidth = 3; c.strokeRect(57.5, 17.5, 845, 279);
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${.25 + .35 * LQ.hash(i, 3, 9)})`; c.fillRect(60 + LQ.hash(i, 1, 9) * 836, 20 + LQ.hash(i, 2, 9) * 150, 2, 2); }
  c.font = F(11, true); c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = '#f3c531'; c.fillText('BRACKET MOUNTAIN  ' + TX.year + '  SINGLE FILER', 76, 28);
  tiers.forEach((t, i) => {
    const x = 78 + i * 22, w = 478 - i * 44, y = 258 - i * 33, cap = isFinite(t.to) ? t.to - t.from : 1;
    c.fillStyle = ['#5d6a7e', '#66738a', '#707c96', '#7a86a2', '#8791ae', '#959fbc', '#dfe7f2'][i]; c.fillRect(x, y, w, 28);
    c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x, y, w, 3); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x, y + 25, w, 3);
    if (i < this.show && t.amount > 0) {
      const k = i === this.show - 1 ? this.anim : 1;
      c.fillStyle = '#f3c531'; c.fillRect(x, y, w * Math.min(1, t.amount / cap) * k, 28); c.fillStyle = '#fff3b0'; c.fillRect(x, y, w * Math.min(1, t.amount / cap) * k, 4);
    }
    c.font = F(24); c.textAlign = 'left'; c.fillStyle = i === 6 ? '#231a36' : '#fff'; c.fillText(pct(t.rate), x + 10, y + 1);
    c.textAlign = 'right'; c.font = F(21); c.fillText((i ? 'over ' : 'from ') + M(t.from), x + w - 10, y + 3);
  });
  const px = 604; c.font = F(22); c.textAlign = 'left'; c.fillStyle = '#c9cdea'; c.fillText('Taxable income', px, 60);
  c.font = F(36); c.fillStyle = '#fff3b0'; c.fillText(M(this.income), px, 80);
  let total = 0, row = 0;
  tiers.forEach((t, i) => { if (i < this.show && t.amount > 0) {
    total += t.tax; c.font = F(24); c.fillStyle = '#fdf8e7';
    c.fillText(pct(t.rate) + ' of ' + M(t.amount) + ' = ' + M(t.tax), px, 130 + row * 30); row++;
  } });
  if (this.show > 0) { c.fillStyle = '#f3e7c3'; c.fillRect(px, 134 + row * 30, 270, 2); c.font = F(30); c.fillStyle = '#f3c531'; c.fillText('Tax: ' + M(total), px, 142 + row * 30); }
} };

const formDoc = { rows: [], vals: [], cur: -1, stamp: 0, draw(c) {
  const n = this.rows.length, rh = Math.min(34, Math.floor(282 / n)), fs = Math.min(26, rh - 1);
  paper(c, 130, 12, 700, 330, 'FORM 1040', 'U.S. Individual Income Tax Return (simplified)  ' + TX.year);
  this.rows.forEach((r, i) => {
    const last = i === n - 1; if (last) rule(c, 158, 52 + i * rh - 2, 644);
    line(c, 158, 52 + i * rh + (last ? 3 : 0), 644, r.label, this.vals[i] == null ? '________' : (r.sign || '') + M(this.vals[i]),
      { hl: i === this.cur, size: fs, vcolor: last && this.vals[i] != null ? (r.owed ? '#b0332e' : '#1f6f5c') : r.sign === '-' ? '#1f6f5c' : '#15122e' });
  });
  if (this.stamp > 0) {
    c.save(); c.translate(660, 170); c.rotate(-0.22); const s = 1 + (1 - this.stamp) * 2; c.scale(s, s); c.globalAlpha = this.stamp;
    c.strokeStyle = '#c0392b'; c.lineWidth = 6; c.strokeRect(-104, -38, 208, 76);
    c.font = F(34, true); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#c0392b'; c.fillText('FILED', 0, 3);
    c.restore();
  }
} };

LQ.drawWorldMap = (c, x, y, w, h, currentRegion) => {
  c.fillStyle = '#090a22'; c.fillRect(x, y, w, h); c.strokeStyle = '#6a4fe0'; c.lineWidth = 3; c.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  for (let i = 0; i < 60; i++) { c.fillStyle = LQ.NEON[i % 3]; c.globalAlpha = .12 + .25 * Math.abs(Math.sin(LQ.time + i)); c.fillRect(x + 4 + LQ.hash(i, 1, 4) * (w - 12), y + 4 + LQ.hash(i, 2, 4) * (h - 10), 3, 3); c.globalAlpha = 1; }
  c.font = F(13, true); c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#35f0e6'; c.fillText('THE LEDGERLANDS', x + w / 2, y + 14);
  const done = st().quest >= 9, done2 = st().q2 != null && st().q2 >= 8, done3 = st().q3 != null && st().q3 >= 8, done4 = st().q4 != null && st().q4 >= 9;
  const R = [['Paystub Village', 'Ch.1  Paychecks & filing', .2, .62, '#35f0e6', true, done], ['Shelter Coast', 'Ch.2  Family & home', .42, .34, '#ff4fb0', done, done2],
    ['Hustle Canyon', 'Ch.3  Side gigs', .66, .66, '#ffcf4a', done2, done3], ['Summit of Gains', 'Ch.4  Investing', .84, .32, '#9b6bff', done3, done4]];
  c.strokeStyle = '#4a44a0'; c.lineWidth = 3; c.setLineDash([8, 8]); c.beginPath();
  R.forEach((r, i) => { const px = x + w * r[2], py = y + h * r[3]; if (i) c.lineTo(px, py); else c.moveTo(px, py); }); c.stroke(); c.setLineDash([]);
  R.forEach((r, i) => {
    const px = x + w * r[2], py = y + h * r[3], open = r[5];
    const here = ['village', 'coast', 'canyon', 'summit'][i] === currentRegion;
    const labelWidth = 2 * Math.min(r[2], 1 - r[2]) * w - 20;
    if (open) { c.fillStyle = r[4]; c.globalAlpha = .16; c.beginPath(); c.arc(px, py, 42, 0, 7); c.fill(); c.globalAlpha = 1; }
    c.fillStyle = open ? '#141a44' : '#15163a'; c.beginPath(); c.arc(px, py, 30, 0, 7); c.fill();
    c.strokeStyle = open ? r[4] : '#3a3a70'; c.lineWidth = 4; c.beginPath(); c.arc(px, py, 30, 0, 7); c.stroke();
    if (here) { c.strokeStyle = '#eef4ff'; c.beginPath(); c.arc(px, py, 35, 0, 7); c.stroke(); }
    c.font = F(18, true); c.textBaseline = 'middle'; c.fillStyle = open ? r[4] : '#6d7299'; c.fillText(open ? (r[6] ? 'OK' : '!') : '?', px, py + 2);
    c.textBaseline = 'top'; c.font = F(24); c.fillStyle = '#eef4ff'; c.fillText(r[0], px, py + 40, labelWidth);
    c.font = F(20); c.fillStyle = open ? '#7fd6a8' : '#6d7299'; c.fillText(open ? r[1] : r[1] + '  (locked)', px, py + 66, labelWidth);
    if (here) { c.fillStyle = '#ffcf4a'; c.fillText('You are here: ' + r[0], x + w / 2, y + h - 22, w - 32); }
  });
};

// ---------- quest scripts
const advance = () => {
  const s = st(); s.quest++; LQ.audio.sfx('fanfare'); ui.toast('New quest: ' + LQ.QUESTS[s.quest].short);
  const c = LQ.career(), pay = c.kind === 'se' ? c.pay - 35 + Math.floor(LQ.hash(s.day, 9, s.seed) * 90) : c.pay;
  LQ.gain(0, pay, c.kind === 'se' ? 'Shop profits' : 'Payday'); LQ.tick();
};

async function qMayor() {
  const c = LQ.career();
  await say(N.mayor, c.kind === 'se' ? "Welcome to Paystub Village, traveler! I'm Mayor Marigold. You must be the one opening the new candle shop. We love a small business here."
    : `Welcome to Paystub Village, traveler! I'm Mayor Marigold. You must be the new ${c.name.toLowerCase()} at ${c.work}.`);
  await say(N.mayor, "A word of warning. A strange fog has been rolling down from Bracket Mountain, and it fills people's heads with nonsense about taxes. Worse, auditors have started leaping out at folks to test what they know.");
  await say(N.mayor, 'Learn how taxes really work and neither can touch you. Start with Foreman Brannock at the Work Hall, west of the plaza. And talk to everyone. This village is full of people who know a trick or two.');
  await say(N.mayor, 'Oh, and take these 50 coins to get started. Merchant Saffron and Broker Bex in the plaza will happily help you spend them.');
  LQ.gain(0, 50, 'Welcome gift'); advance();
}

async function qBrannock() {
  if (isOwner()) return qBrannockOwner();
  const f = LQ.fin(0);
  await say(N.brannock, `There you are! I run payroll for half this village, ${f.c.work} included. Your job pays ${M(f.wages)} a year, in 26 paychecks of ${M(f.gross)}. Before anyone can pay you, the kingdom wants a form.`);
  w4Doc.pick = 0; w4Doc.signed = false; ui.doc = w4Doc;
  await say(N.brannock, 'This is Form W-4. It tells your employer how much federal income tax to hold back from each paycheck and send to the IRS on your behalf. That is called withholding.');
  await say(N.brannock, "Steps 1 to 3 are easy. You're single, this is your only job, and you have no dependents. Step 4 is where you can adjust things. Watch the paycheck on the right as you choose.");
  const notes = [
    'Simple and accurate. Your employer will hold back about what a plain return would owe for the year.',
    'Smaller paychecks now, a bigger refund later. Some people like the cushion.',
    'Careful. Step 4(b) is only for deductions you truly expect beyond the standard deduction. Guess too high and too little is held back. You could owe at tax time.'];
  for (;;) {
    const i = await choose(N.brannock, 'How do you want to fill in Step 4?', [
      'Leave it blank. Nothing to adjust.', 'Step 4(c): hold back an extra $40 from every paycheck.', 'Step 4(b): write in $8,000 of deductions, just in case.'],
      s => { w4Doc.pick = s; });
    w4Doc.pick = i;
    await say(N.brannock, notes[i]);
    if (await choose(N.brannock, `Take-home would be ${M(LQ.fin(i).net)} per paycheck. Sign the W-4 this way?`, ['Sign it.', 'Let me rethink that.']) === 0) { st().w4 = i; break; }
  }
  w4Doc.signed = true; LQ.audio.sfx('stamp'); await LQ.wait(0.5);
  await say(N.brannock, 'Done. And remember, a W-4 is not forever. You can hand in a new one any time your life changes.');
  ui.doc = null; LQ.learn('withholding'); LQ.give('w4');
  await say(N.brannock, 'As it happens, today is payday. Paymaster Pim has your first stub at the green stall next door.');
  advance();
}
async function qBrannockOwner() {
  const f = LQ.fin(0);
  await say(N.brannock, 'So you are the new shopkeeper! I register every business in the village. Here is the first thing nobody tells a new owner: you have no boss, so nobody withholds tax from your pay.');
  estDoc.pick = 0; estDoc.signed = false; ui.doc = estDoc;
  await say(N.brannock, `You expect about ${M(f.c.sales - f.c.expenses)} of profit this year. That means income tax, plus self-employment tax, which is Social Security and Medicare for people who work for themselves. Together, about ${M(f.baseBill)}.`);
  await say(N.brannock, 'The IRS wants that paid as you go, four times a year, with Form 1040-ES. These are called estimated tax payments. Watch the box on the right as you choose.');
  const notes = [
    'Sensible. Four payments that cover the bill almost exactly. No surprises in April.',
    'You will overpay and get the extra back at filing. Safe, but that cash could have been working in your shop all year.',
    'Risky. You keep every coin for now, but the whole bill lands at once, and the IRS charges an underpayment penalty for each quarter you skipped.'];
  for (;;) {
    const i = await choose(N.brannock, 'How will you handle estimated taxes?', [
      `Pay ${M(LQ.fin(0).per)} each quarter, sized to the bill.`, 'Play it safe: pay $3,000 each quarter.', 'Skip them. I will pay it all when I file.'],
      s => { estDoc.pick = s; });
    estDoc.pick = i;
    await say(N.brannock, notes[i]);
    if (await choose(N.brannock, `That leaves ${M(LQ.fin(i).net)} in the business each quarter. Lock it in?`, ['Lock it in.', 'Let me rethink that.']) === 0) { st().w4 = i; break; }
  }
  estDoc.signed = true; LQ.audio.sfx('stamp'); await LQ.wait(0.5);
  ui.doc = null; LQ.learn('estimates'); LQ.give('w4');
  await say(N.brannock, 'Your first quarter of business is in the books. Paymaster Pim keeps accounts for the shops. See him at the green stall next door.');
  advance();
}

async function yearMontage() {
  await LQ.fadeTo(1); yearDoc.k = 0; ui.doc = yearDoc; LQ.audio.play('winter'); await LQ.fadeTo(0.55, 0.3);
  let lastN = 0; const pays = LQ.fin().pays;
  await LQ.tween(5, k => { yearDoc.k = k; const n = Math.round(k * pays); if (n !== lastN) { lastN = n; LQ.audio.sfx('coin'); } });
  await LQ.pressOk();
  await LQ.fadeTo(1, 0.3); ui.doc = null; st().season = 'winter'; LQ.world.setSeason('winter');
  const y = LQ.yearPass(); await LQ.fadeTo(0, 0.9);
  ui.showBanner('JANUARY', 'A year has passed');
  await say(null, 'Snow settles over Paystub Village. The year is done, and that means tax season is coming.');
  if (y && y.div > 0) await say(null, `Your stocks paid ${y.div} coins in dividends over the year` + (y.tax ? `, and ${y.tax} went to tax at the 15% dividend rate.` : '. At your income, qualified dividends are taxed at 0%.') + ' Every share you held through the year now counts as long-term.');
}
async function qPim() {
  if (isOwner()) return qPimOwner();
  const f = LQ.fin();
  await say(N.pim, `First paycheck! Congratulations. You earned ${M(f.gross)}... and here is what you actually get.`);
  stubDoc.hl = null; ui.doc = stubDoc;
  await say(N.pim, "Don't panic. Everyone squints at their first paystub. Let's read it together.");
  await ask(N.pim, 'Which number actually lands in your coin purse?', ['Net pay', 'Gross pay', 'Federal income tax'],
    { right: 'Right. Gross is what you earned. Net is what you take home.', wrong: ['Gross is what you earned before anything came out. Look lower.', 'That one is money leaving, not arriving!'] });
  stubDoc.hl = 'ss';
  await ask(N.pim, `Social Security took ${M(f.ss)}. How is that figured?`, ['6.2% of my gross pay', 'Whatever I wrote on my W-4', 'A flat fee on every paycheck'],
    { right: 'Yes. Social Security is 6.2% and Medicare is 1.45% of your wages. Your employer pays the same amounts on top.',
      wrong: ['The W-4 has no say over this one. Check the percentage on the stub.', `It is a percentage, not a fee. ${M(f.gross)} times 6.2% is ${M(f.ss)}.`] });
  stubDoc.hl = null;
  await ask(N.pim, 'So which line does your W-4 control?', ['Federal income tax', 'Social Security', 'Medicare'],
    { right: `Exactly. Your W-4 set that ${M(f.per)}. The other two are fixed percentages. Oh, and the Ledgerlands has no state income tax, but your home state might.`,
      wrong: ['That one is a fixed 6.2%. Try again.', 'That one is a fixed 1.45%. Try again.'] });
  ui.doc = null; LQ.learn('paystub'); LQ.learn('fica'); LQ.give('paystub');
  await say(N.pim, 'That is one payday. Now picture twenty-five more...');
  await yearMontage();
  await say(N.pim, 'Brr! Every January, employers send out a form that sums up your whole year. Yours should be waiting at the Post Office, east of the plaza.');
  advance();
}
async function qPimOwner() {
  const f = LQ.fin();
  await say(N.pim, 'Your first quarter as a shopkeeper! No paystub for you. Owners get something better: a profit statement.');
  stubDoc.hl = null; ui.doc = stubDoc;
  await ask(N.pim, 'Which number does the IRS tax you on?', ['Net profit', 'Total sales', 'Business expenses'],
    { right: 'Right. You are taxed on profit: sales minus the real costs of running the business. That is why owners guard their receipts.', wrong: ['Not sales. The wax, the wicks, and the rent come off first.', 'Expenses are what you subtract, not what gets taxed.'] });
  stubDoc.hl = 'se';
  await ask(N.pim, 'An employee pays 7.65% for Social Security and Medicare, and the boss pays the other 7.65%. You have no boss. So you pay...', ['Both halves: 15.3% self-employment tax', 'Just the 7.65% employee half', 'Nothing. Owners are exempt'],
    { right: `Both halves. It is charged on 92.35% of your profit, about ${M(f.se)} for the year. For many new owners it is bigger than their income tax. The good news: you may deduct half of it.`,
      wrong: ['If only. You are the employer too, so the second half is yours as well.', 'Nobody is exempt. Owners pay through self-employment tax.'] });
  stubDoc.hl = 'exp';
  await ask(N.pim, 'What is the honest way to shrink that tax bill?', ['Track every real business expense', 'Leave some cash sales off the books', 'Call personal shopping a business cost'],
    { right: 'Yes. Every legitimate expense you record lowers your profit, and with it both taxes. The other two are how shopkeepers meet auditors.',
      wrong: ['All income is taxable, even cash. That road leads to penalties.', 'Personal costs are not deductible. Auditors look for exactly that.'] });
  ui.doc = null; LQ.learn('paystub'); LQ.learn('selfEmp'); LQ.give('paystub');
  await say(N.pim, 'That is one quarter. Three more to go...');
  await yearMontage();
  await say(N.pim, 'Brr! January means year-end paperwork. Check the Post Office, east of the plaza. One of your customers has sent you something.');
  advance();
}

async function qOdette() {
  if (isOwner()) return qOdetteOwner();
  await say(N.odette, 'There you are! A letter from your employer. They have to send these out by the end of January.');
  boxDoc.hl = 0; ui.doc = boxDoc;
  await say(N.odette, 'This is your Form W-2. It is your whole working year on one page, and you cannot file your taxes without it. Two boxes matter most.');
  await ask(N.odette, 'Which box holds the wages you will report on your tax return?', ['Box 1', 'Box 2', 'Box 4'],
    { onMove: i => { boxDoc.hl = [1, 2, 4][i]; }, right: 'Box 1. That is the income the IRS will tax.', wrong: ['Box 2 is tax, not wages.', 'Box 4 is the Social Security tax you paid.'] });
  await ask(N.odette, 'And which box shows federal income tax you have ALREADY paid through your paychecks?', ['Box 2', 'Box 4', 'Box 6'],
    { onMove: i => { boxDoc.hl = [2, 4, 6][i]; }, right: `Box 2. That ${M(LQ.fin().withheld)} is 26 paychecks of withholding added up. It counts as tax you have already paid.`,
      wrong: ['That is Social Security tax. It does not count toward your income tax.', 'That is Medicare tax. It does not count toward your income tax.'] });
  boxDoc.hl = 0; ui.doc = null; LQ.learn('w2'); LQ.give('w2');
  await say(N.odette, 'Keep it safe. Next you need a filing status. Guildmaster Sable handles that at the Guild Hall, north-west of the plaza.');
  advance();
}
async function qOdetteOwner() {
  const f = LQ.fin();
  await say(N.odette, 'Mail for the candle shop! The Guild Hall bought candles all year, and they have sent you a Form 1099-NEC to report what they paid you.');
  boxDoc.hl = 0; ui.doc = boxDoc;
  await say(N.odette, 'Owners do not get a W-2. Your year-end records are that 1099 plus your own books. I have laid them side by side.');
  boxDoc.hl = 1;
  await ask(N.odette, `The 1099 shows $18,000, but your books show ${M(f.sales)} in sales. How much income do you report?`, [`All ${M(f.sales)} of it`, 'Only the $18,000 on the form', 'Whatever feels fair'],
    { onMove: i => { boxDoc.hl = [2, 1, 0][i]; }, right: 'All of it. Every coin of business income is taxable whether or not a form shows up. The 1099 is just one customer telling the IRS their part.',
      wrong: ['The IRS taxes all your income, not only what customers reported.', 'There is one right answer here, and it is in your books.'] });
  await ask(N.odette, 'And where do those quarterly estimated payments show up on your return?', ['As tax I already paid, like withholding', 'As a business expense', 'They do not count for anything'],
    { onMove: i => { boxDoc.hl = [5, 3, 0][i]; }, right: `Right. The ${M(f.withheld)} you sent in during the year counts against your bill, exactly like an employee's withholding.`,
      wrong: ['Income tax is never a business expense.', 'They count in full, as tax already paid.'] });
  boxDoc.hl = 0; ui.doc = null; LQ.learn('records'); LQ.give('w2');
  await say(N.odette, 'Keep those books safe. Next you need a filing status. Guildmaster Sable handles that at the Guild Hall, north-west of the plaza.');
  advance();
}

async function qSable() {
  await say(N.sable, 'Every filer marches under a banner. We call it your filing status, and it decides your standard deduction and your tax brackets.');
  statusDoc.caseText = ''; ui.doc = statusDoc;
  await say(N.sable, 'There are five. You do not pick the one you like best. Your status is set by your real situation on the last day of the year. Let us test you.');
  const S = ['Single', 'Married Filing Jointly', 'Head of Household'];
  statusDoc.caseText = 'YOU: unmarried on December 31, no children or other dependents.';
  await ask(N.sable, 'Which banner is yours?', [S[0], S[2], S[1]],
    { right: `Single. Your standard deduction is ${M(STD.single)}.`, wrong: ['Head of Household needs a qualifying person you support, such as a child.', 'You would need to be married on December 31.'] });
  statusDoc.caseText = 'ROWAN AND FEN: married on December 30. They share their finances and want the simplest return.';
  await ask(N.sable, 'Which banner fits them for the whole year?', [S[1], S[0], S[2]],
    { right: `Married Filing Jointly. Married on the last day of the year counts as married for the entire year. Their deduction doubles to ${M(STD.mfj)}.`,
      wrong: ['They were married on December 31, so Single is off the table.', 'Head of Household is for unmarried people supporting a qualifying person.'] });
  statusDoc.caseText = 'WREN: unmarried, pays more than half the cost of the home where her young son lives with her all year.';
  await ask(N.sable, 'And Wren?', [S[2], S[0], S[1]],
    { right: `Head of Household. Supporting a child at home earns a bigger deduction of ${M(STD.hoh)} and wider brackets than Single.`,
      wrong: ['She could do better. She supports a qualifying child and pays most of the household costs.', 'Wren is unmarried.'] });
  ui.doc = null; LQ.learn('status'); LQ.give('banner');
  await say(N.sable, 'Carry the Banner of the Single Filer with pride. Now cross the square to the Armory. Thorn will fit you with a deduction.');
  advance();
}

async function qThorn() {
  const c = LQ.career();
  await say(N.thorn, 'A deduction is a shield. Whatever it blocks, the tax collector cannot touch. I stock two kinds.');
  Object.assign(shieldDoc, { who: 'YOUR RECEIPTS', rows: [['State and local taxes', 1900], ['Mortgage interest (you rent)', 0]], total: 1900, sel: -1 }); ui.doc = shieldDoc;
  await say(N.thorn, `The Standard Shield blocks a flat ${M(STD.single)} for a single filer, no receipts needed. The Itemized Shield is forged from your own deductible expenses added together.`);
  await ask(N.thorn, 'Which shield should you carry this year?', [`Standard: ${M(STD.single)}`, 'Itemized: $1,900'],
    { onMove: i => { shieldDoc.sel = i; }, right: 'Good eye. Always carry the bigger one.',
      wrong: ['That would shield only $1,900 and leave far more of your income exposed. Bigger is better here.'] });
  Object.assign(shieldDoc, { who: "YOUR NEIGHBOR'S RECEIPTS", rows: [['Mortgage interest', 13500], ['State and local taxes', 7000]], total: 20500, sel: -1 });
  await ask(N.thorn, 'Your neighbor owns a home. Which shield for her?', ['Itemized: $20,500', `Standard: ${M(STD.single)}`],
    { onMove: i => { shieldDoc.sel = 1 - i; }, right: 'Right. Her receipts beat the standard amount, so itemizing wins. Most people never get there, which is why most carry the Standard Shield.',
      wrong: ['Her itemized total is larger than the standard amount. Take the bigger shield.'] });
  shieldDoc.sel = -1;
  await ask(N.thorn, 'What does a deduction actually do?', ['Shrinks the income that gets taxed', 'Comes straight off my tax bill, dollar for dollar', 'Raises my refund by the same amount'],
    { right: 'Yes. A deduction lowers taxable income. The thing that cuts your bill dollar for dollar is called a credit.',
      wrong: ['That describes a credit. A deduction works earlier, on your income.', 'Not by the same amount. It lowers the income being taxed, which lowers the tax by a fraction of it.'] });
  ui.doc = null; LQ.learn('deduction'); LQ.give('shield');
  if (c.id === 'nurse') {
    await say(N.thorn, `One more plate for you, nurse. Through 2028 there is a deduction for overtime pay, and it stacks on top of the Standard Shield. Yours is worth ${M(c.ot)} this year. The limit is ${M(TX.overtimeCap)}.`);
    await ask(N.thorn, 'Which part of your overtime pay does it cover?', ['Only the extra "half" in time-and-a-half', 'Every dollar earned during overtime hours', 'All of my wages for the year'],
      { right: 'Right. Only the premium counts, the extra half on top of your normal rate. And Social Security and Medicare still apply to it.', wrong: ['Close. Only the premium portion above your regular rate qualifies.', 'If only! It covers the overtime premium and nothing else.'] });
    LQ.learn('overtime');
  } else if (c.kind === 'se') {
    await say(N.thorn, 'And two more plates for a business owner. First, you may deduct half of your self-employment tax. Second, the business income deduction: up to 20% of your business profit, no receipts needed.');
    await ask(N.thorn, 'Why do you get to deduct half of your self-employment tax?', ["It is the employer's half, and an employer would deduct it too", 'It is a reward for filing on time', 'Because it is really a tax credit'],
      { right: 'Exactly. A regular employer deducts its share of payroll tax as a business cost. You get the same treatment for the half you pay as the boss.', wrong: ['No reward here. Think about what an employer does with its share.', 'It is a deduction, not a credit. It lowers income, not the bill itself.'] });
    LQ.learn('qbi');
  } else {
    await say(N.thorn, "For you the Standard Shield does most of the work, and that is a good thing: it blocks more than half your wages. To do even better, ask Cook Basil about the Saver's Credit. It was made for people in your boots.");
  }
  await say(N.thorn, `With everything strapped on, ${M(LQ.fin().taxable)} of your income is left exposed. That is your taxable income. Sage Altamira will teach you what it costs, across the bridge at the foot of Bracket Mountain.`);
  advance();
}

async function qAltamira() {
  const f = LQ.fin(), t = f.tiers, b = TX.brackets.single;
  await say(N.altamira, 'So. You have come to learn the mountain. Most people fear it because they believe one lie: that climbing higher costs you everything below.');
  Object.assign(mountDoc, { income: f.taxable, show: 0, anim: 1 }); ui.doc = mountDoc;
  await say(N.altamira, `Seven ledges, seven rates. Your taxable income of ${M(f.taxable)} does not land on one ledge. It fills them from the bottom, like water.`);
  for (let i = 0; i < t.length; i++) {
    const tr = t[i], next = b[i + 1] ? b[i + 1][1] : .37;
    if (i === 0) await ask(N.altamira, `Your first ${M(tr.amount)} sits on the lowest ledge. What is the tax on that part?`, [`${M(tr.tax)}  (10%)`, `${M(tr.amount * .12)}  (12%)`, '$0'],
      { wrong: ['The lowest ledge is taxed at 10%, not 12%.', 'Every taxable dollar pays something. The lowest ledge pays 10%.'] });
    else await ask(N.altamira, `The next ${M(tr.amount)} spills up to the ${pct(tr.rate)} ledge. What is the tax on that slice?`, [M(tr.tax), M(f.taxable * tr.rate), M(tr.amount * next)],
      { wrong: [`That is ${pct(tr.rate)} of all ${M(f.taxable)}. The lower ledges already paid their lower rates.`, `This slice sits on the ${pct(tr.rate)} ledge, not the one above it.`] });
    mountDoc.show = i + 1; await LQ.tween(0.9, k => { mountDoc.anim = k; });
  }
  await say(N.altamira, `Add the ledges and your federal income tax is ${M(f.tax)}. Your top rate is ${pct(f.top)}, yet the bill is only about ${(f.tax / f.income * 100).toFixed(1)}% of the ${M(f.income)} you earned.`);
  const std = STD.single, w1 = 62000, w2 = 72000, t1 = LQ.taxOn(w1 - std).total, t2 = LQ.taxOn(w2 - std).total, over = w2 - std - b[2][0];
  Object.assign(mountDoc, { income: w2 - std, show: 0 });
  await ask(N.altamira, `Now the test. Poor Rowan turned down a raise from ${M(w1)} to ${M(w2)}. His taxable income would have become ${M(w2 - std)}, crossing onto the 22% ledge. What would really have happened?`,
    [`Only the ${M(over)} above ${M(b[2][0])} is taxed at 22%`, `All ${M(w2 - std)} gets taxed at 22%`, 'He would take home less than before'],
    { wrong: ['That is the lie the fog whispers. The lower ledges keep their lower rates.', 'Never. Only the dollars above the line pay the higher rate.'] });
  mountDoc.show = 3; await LQ.tween(1.1, k => { mountDoc.anim = k; });
  const extra = t2 - t1, fica = (w2 - w1) * (TX.ssRate + TX.medicareRate);
  await say(N.altamira, `The raise adds ${M(w2 - w1)} of pay and only ${M(extra)} of income tax. Even after Social Security and Medicare he would keep about ${M(w2 - w1 - extra - fica)}. A raise never leaves you poorer.`);
  ui.doc = null; LQ.learn('brackets'); LQ.learn('raise'); LQ.give('compass');
  await say(N.altamira, 'Take this Bracket Compass. The one who spreads the fog waits at the summit: Baron Befuddle, the Mythmonger. He fights with lies. You now carry the truth.');
  await LQ.world.openGate();
  advance();
}

LQ.docs.formDoc = formDoc; LQ.docs.shieldShape = shieldShape; LQ.docs.mountDoc = mountDoc;
function buildRows(f) {
  const R = [], owner = f.kind === 'se', add = (label, val, o) => R.push(Object.assign({ label, val }, o));
  if (!owner) {
    add('Wages  (W-2, Box 1)', f.box1, { ask: ['First line, wages. Which number goes here?', [`W-2 Box 1: ${M(f.box1)}`, `W-2 Box 2: ${M(f.withheld)}`, `My total take-home pay: ${M(f.netYear)}`],
      ['Box 2 is tax already withheld. It comes later.', 'The return starts from what you earned, before anything was taken out.']] });
    if (f.retire) R[0].note = `Notice Box 1 is ${M(f.retire)} lower than your pay. That is your Retirement Chestplate at work. Money put in a 401(k) never shows up as taxable wages.`;
    if (f.hsa) add('HSA deduction', f.hsa, { sign: '-', note: `Your HSA Flask comes off next: ${M(f.hsa)}.` });
  } else {
    add('Business net profit', f.profit, { ask: ['First line, business income. Which number goes here?', [`Net profit: ${M(f.profit)}`, `Total sales: ${M(f.sales)}`, 'The $18,000 on the 1099'],
      ['You are taxed on profit. Subtract the business expenses first.', 'The 1099 is only one customer. Use your books.']] });
    if (f.writeoffs) R[0].note = `Your write-offs already trimmed ${M(f.writeoffs)} from that profit before it ever reached this form.`;
    add('Half of self-employment tax', f.half, { sign: '-', note: `Next you deduct half of your self-employment tax: ${M(f.half)}.` });
    if (f.retire + f.hsa) add('Retirement and HSA savings', f.retire + f.hsa, { sign: '-', note: `Then your savings gear: ${M(f.retire + f.hsa)} off the top.` });
  }
  add('Standard deduction', f.std, { sign: '-', note: `Your Standard Shield blocks ${M(f.std)}.` });
  if (f.ot) add('Overtime deduction', f.ot, { sign: '-', note: `And your overtime deduction blocks another ${M(f.ot)}.` });
  if (f.charity) add('Charitable gift', f.charity, { sign: '-', note: `Your Charity Lantern: ${M(f.charity)}, deductible even without itemizing.` });
  if (owner) add('Business income deduction', f.qbi, { sign: '-', note: `The business income deduction takes off ${M(f.qbi)}. Here that is 20% of your taxable income before it, because that is smaller than your profit.` });
  add('Taxable income', f.taxable, { ask: ['Taxable income. Start from the top line and subtract every deduction. What is left?', [M(f.taxable), M(f.income), M(f.taxable + f.std)],
    ['The shields have to block something. Subtract the deductions.', 'Not quite. The Standard Shield has to come off too.']] });
  add('Income tax', f.tax, { ask: [`The tax on ${M(f.taxable)}. Remember the mountain.`, [M(f.tax), M(f.taxable * f.top), M(f.taxable * (f.top === .12 ? .10 : .12))],
    [`That is ${pct(f.top)} of everything. The lower ledges are taxed at lower rates.`, 'Fill the ledges from the bottom, each at its own rate.']],
    note: 'Ledge by ledge. (The official tax table rounds a little, so a real return may differ by a few dollars.)' });
  if (owner) add('Self-employment tax', f.se, { sign: '+', note: `Now add self-employment tax, your Social Security and Medicare: ${M(f.se)}. Notice it is bigger than your income tax.` });
  if (f.credit) add("Saver's Credit", f.credit, { sign: '-', note: `Your Saver's Credit comes straight off the bill: ${M(f.credit)}. A credit is worth its full amount. (The game uses the 10% rate. Lower incomes can get 20% or 50%.)` });
  add(owner ? 'Estimated payments made' : 'Tax withheld  (W-2, Box 2)', f.withheld, { ask: owner
    ? ['Tax you already paid during the year. Where is it?', [`My four estimated payments: ${M(f.withheld)}`, `My business expenses: ${M(f.expenses)}`, 'I can leave this line blank and keep the difference'],
      ['Expenses lowered your profit earlier. This line is for tax payments.', 'Leaving off payments you made would only cheat yourself.']]
    : ['Tax you already paid during the year. Where do you find it?', [`W-2 Box 2: ${M(f.withheld)}`, `W-2 Box 4: ${M(f.ssYear)}`, 'Nowhere. I have not paid any yet.'],
      ['Box 4 is Social Security tax. It does not count toward income tax.', 'You have been paying all year, one paycheck at a time. That is what withholding is.']] });
  const owed = f.diff < 0, amt = Math.abs(f.diff);
  add(owed ? 'Amount you owe' : 'Refund', amt, { owed, ask: [`Last line. Your total tax is ${M(f.total)} and you already paid ${M(f.withheld)}. So...`,
    owed ? [`I owe ${M(amt)}`, `I get a refund of ${M(amt)}`, 'It comes out exactly even'] : [`I get a refund of ${M(amt)}`, `I owe ${M(amt)}`, 'It comes out exactly even'],
    [owed ? 'You paid in less than your tax. The difference is still due.' : 'You paid in more than your tax. The extra comes back to you.', 'Check the subtraction once more.']] });
  return R;
}
async function qJuno() {
  const f = LQ.fin(), owner = f.kind === 'se', owed = f.diff < 0, amt = Math.abs(f.diff), rows = buildRows(f);
  await say(N.juno, 'The hero of Bracket Mountain! Welcome to Town Hall. You have your year-end forms, a filing status, and your deductions. Time to put it all on one page.');
  Object.assign(formDoc, { rows, vals: [], cur: 0, stamp: 0 }); ui.doc = formDoc;
  await say(N.juno, 'This is Form 1040, the federal income tax return. The real one has more lines, but these are its heart. You fill it in. I only hold the stamp.');
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]; formDoc.cur = i;
    if (r.ask) await ask(N.juno, r.ask[0], r.ask[1], { wrong: r.ask[2] });
    formDoc.vals[i] = r.val; LQ.audio.sfx('coin');
    if (r.note) await say(N.juno, r.note); else if (!r.ask) await LQ.wait(0.35);
  }
  formDoc.cur = -1;
  await LQ.wait(0.4); LQ.audio.sfx('stamp'); LQ.shake(0.25); await LQ.tween(0.35, k => { formDoc.stamp = k; });
  LQ.audio.sfx('fanfare'); await LQ.wait(0.8);
  const w = st().w4 || 0;
  const why = owner ? [
    `${owed ? 'You owe' : 'A refund of'} ${M(amt)}. Your quarterly estimates were sized to the bill, so April holds no surprises.`,
    `A refund of ${M(amt)}. You overpaid your estimates all year, so the extra comes home now. Safe, though that cash sat idle.`,
    `You owe ${M(amt)}, all at once, because you skipped your estimated payments. The IRS also charges an underpayment penalty for each quarter missed. Pay as you go next year.`][w]
    : w === 1 ? `${owed ? 'You owe' : 'A refund of'} ${M(amt)}. That extra $40 per paycheck is coming home. It feels like a prize, but it was your own money, lent to the kingdom for a year at no interest.`
    : w === 2 ? (owed ? `You owe ${M(amt)}. You wrote $8,000 of deductions on your W-4, more than you really had, so too little was withheld. Your paychecks were bigger all year, and now the difference is due by April 15.`
      : `A refund of ${M(amt)}. Your W-4 guess turned out close to the deductions you really ended up with.`)
    : `${owed ? 'You owe' : 'A refund of'} ${M(amt)}.` + (f.diff > 300 ? ' Your plain W-4 did not know about your extra deductions, so more was withheld than you owed. A new W-4 could put that money in your paychecks instead.' : ' Your plain W-4 landed your withholding almost exactly on your real tax. That is a well-tuned W-4.');
  await say(N.juno, why);
  const coins = Math.max(-400, Math.round(f.diff / 5)) - (owner && w === 2 ? 60 : 0);
  LQ.gain(50, coins, owed ? 'Tax settled' : 'Refund');
  await say(N.juno, 'Either way: filed, on time, and you understood every line. One last thing. Even if you could not pay what you owe, you should still file on time. Filing late costs far more than paying late.');
  ui.doc = null; LQ.learn('refund'); LQ.learn('filing'); LQ.learn('latefile'); LQ.give('return');
  st().quest = 9; LQ.tick();
  await ending();
}

async function ending() {
  const f = LQ.fin(), s = st(), owed = f.diff < 0;
  await LQ.fadeTo(1); ui.toasts = []; s.season = 'summer'; LQ.world.setSeason('summer'); LQ.audio.play('title');
  ui.doc = { draw(c) {
    paper(c, 130, 20, 700, 458, 'CHAPTER 1 COMPLETE', f.c.name);
    c.textAlign = 'center'; c.textBaseline = 'top'; c.font = F(20, true); c.fillStyle = '#1f6f5c'; c.fillText(LQ.rank().toUpperCase(), 480, 70);
    const L = (i, a, b, o) => line(c, 170, 108 + i * 31, 620, a, b, Object.assign({ size: 25 }, o));
    L(0, 'Income', M(f.income)); L(1, 'Total federal tax', M(f.total)); L(2, owed ? 'Paid at filing' : 'Refund received', M(Math.abs(f.diff)), owed ? RED : GREEN);
    L(3, 'Right on the first try', s.first + ' of ' + s.asked); L(4, 'Savvy', String(s.savvy)); L(5, 'Audits faced', String(s.audits || 0));
    L(6, 'Coins', String(s.coins)); L(7, 'Stocks', String(LQ.portfolio())); L(8, 'Net worth', String(LQ.netWorth()), GREEN);
    L(9, 'Journal entries', s.journal.length + ' of ' + Object.keys(LQ.JOURNAL).length);
    c.font = F(23); c.textAlign = 'center'; c.fillStyle = '#5a5490';
    ui.wrap(c, 'Your return is filed and the South Road is open. Chapter 2 begins in Shelter Coast. The village stays open too.', 620).forEach((ln, i) => c.fillText(ln, 480, 424 + i * 24));
  } };
  await LQ.fadeTo(0.5); await LQ.pressOk();
  ui.doc = { draw(c) { LQ.drawWorldMap(c, 110, 40, 740, 420); } };
  await LQ.pressOk();
  await LQ.fadeTo(1, 0.3); ui.doc = null; LQ.audio.play('village'); await LQ.fadeTo(0, 0.9);
  ui.showBanner('SPRING', 'The fog is gone from Paystub Village');
  await LQ.world.clear('roadblock', '#c98f55', 'The guards lift the barricade on the South Road.');
  await say(null, 'Chapter 2 waits at the end of that road, in Shelter Coast, where a home, a wedding, and a child will change your tax return. Head south when you are ready. The market, the exchange, and the auditors stay open here.');
}

// ---------- villagers who teach expert moves
const TIPS = {
  rowan: { j: 'proW4', lines: ['Here is one I learned the hard way. When Fen and I married, I forgot to give my boss a new W-4, and my withholding was wrong all year.', 'Marriage, a baby, a second job: any big change means a new W-4. The IRS has a free Tax Withholding Estimator that tells you what to write.'],
    q: ['When should you hand in a new W-4?', ['After a big life change, like marriage, a child, or a second job', 'Only on the day you are hired', 'Never. It is set for life']] },
  fen: { j: 'proMatch', lines: ['My employer matches what I put in my 401(k), up to 4% of my pay. That is an instant 100% return before the market does a thing.', 'Not taking the full match is turning down part of your salary. I tell everyone.'],
    q: ['Your employer matches 401(k) contributions up to 4% of pay. What is the smart minimum to put in?', ['At least 4%, to capture the full match', 'Nothing until the market looks good', 'Exactly 1%, to keep it simple']] },
  wren: { j: 'proRoth', lines: ['Fishing gives a man time to think about retirement accounts. Traditional ones give you the tax break today and tax the money when you take it out.', 'Roth accounts tax it today and let it come out tax-free later. If you expect a higher bracket later in life, Roth tends to win. Lower bracket later, traditional.'],
    q: ['You are early in your career and expect to earn much more later. Which usually fits better?', ['Roth: pay the tax now, at my low rate', 'Traditional: put off the tax until my rate is higher', 'Neither. Keep it all in cash']] },
  pip: { j: 'proCredit', lines: ['My mom says a credit beats a deduction! A $100 credit takes $100 right off your tax.', "But a $100 deduction only takes off $100 times your bracket rate. In the 12% bracket that's just twelve dollars!"],
    q: ['You are in the 12% bracket. Which saves you more tax?', ['A $100 credit', 'A $100 deduction', 'They save exactly the same']] },
  maple: { j: 'proHSA', lines: ['At my age you learn about medical bills, dear. A Health Savings Account is the only account with three tax breaks: tax-free going in, tax-free while it grows, and tax-free coming out for medical costs.', 'You need a high-deductible health plan to open one. For 2026 you can put in up to $4,400 if the plan covers just you.'],
    q: ['What makes an HSA so unusual?', ['It is tax-free going in, growing, and coming out for medical costs', 'It has no contribution limit', 'Anyone can open one with any health plan']] },
  dex: { j: 'proLoan', lines: ['Student loans are no fun, but the interest has one upside. You can deduct up to $2,500 of it a year, and you do not have to itemize.', 'It fades as your income climbs. For 2026 it starts shrinking above $85,000 for a single filer and is gone at $100,000.'],
    q: ['Do you have to itemize to deduct student loan interest?', ['No. It works with the standard deduction too', 'Yes, always', 'Only while you are still in school']] },
  alms: { j: 'proCharity', lines: ['Bless you for stopping. Here is news most people have not heard. Starting with 2026 returns, people who take the standard deduction can still deduct cash gifts to charity.', 'Up to $1,000, or $2,000 for a married couple filing jointly. Keep the receipt.'],
    q: ['In 2026 you take the standard deduction and give $300 cash to a qualified charity. Can you deduct it?', ['Yes. Non-itemizers can deduct up to $1,000', 'No. Only itemizers can deduct gifts', 'Only if the gift is over $1,000']] },
  gale: { j: 'proGains', lines: ['Forty years on the Exchange taught me patience. Sell a stock you held a year or less and the gain is taxed like wages.', 'Hold it more than a year and you get the long-term rates: 0%, 15%, or 20%. In 2026 a single filer with taxable income up to $49,450 pays nothing at all on long-term gains.'],
    q: ['How long must you hold a stock for the gain to count as long-term?', ['More than one year', 'At least 30 days', 'Until the next tax season starts']] },
  flint: { j: 'proLoss', lines: ['Even a bad stock is worth something. Sell at a loss and the loss cancels out your gains. If your losses are bigger than your gains, up to $3,000 a year can offset your other income. The rest carries forward.', 'One trap: buy the same stock back within 30 days and the loss is disallowed. They call it the wash sale rule.'],
    q: ['Your losses are bigger than your gains this year. How much of the extra can offset your other income?', ['Up to $3,000 a year, and the rest carries forward', 'All of it, right away', 'None. Losses are simply gone']] },
  juniper: { j: 'proBiz', lines: ['I drive this cart for my own business, so every business mile is a write-off: 72.5 cents a mile in early 2026, and 76 cents from July on.', 'A home office used only for work counts too. The simple method is $5 a square foot, up to 300 square feet. But keep a log. No records, no deduction.'],
    q: ['What do you need to back up a mileage deduction?', ['A log of the business miles I drove', 'Nothing. A rough guess is fine', 'A letter from my customers']] },
  basil: { j: 'proSaver', lines: ["Cooks do not get rich, but we have a secret. If your income is under $40,250 as a single filer in 2026, the Saver's Credit pays back 10% to 50% of up to $2,000 you put into a retirement account.", 'It is a credit, so it comes straight off your tax. Most people who qualify never claim it.'],
    q: ["Who is the Saver's Credit meant for?", ['Lower and middle income workers who save for retirement', 'Anyone with a savings account', 'Only business owners']] },
};
async function tip(id) {
  const t = TIPS[id], who = N[id], s = st();
  if (s.tips[id]) return say(who, LQ.JOURNAL[t.j].text);
  if (id === 'rowan' && !s.flags.bossDown) await say(who, "I turned down a raise last spring. Didn't want a higher bracket eating my whole paycheck. That's how it works... right?");
  for (const ln of t.lines) await say(who, ln);
  if (await LQ.quiz(who, t.q[0], t.q[1], 'Talk to me again and we will go over it once more.')) {
    s.tips[id] = true; LQ.gain(15, 30, 'Expert tip'); LQ.learn(t.j); LQ.tick();
    await say(who, 'You have got it. I wrote it in your Tax Journal.');
  }
}

// ---------- everyday chatter
const HINT = () => LQ.curQuest().text + '.';
const idle = {
  mayor: async () => say(N.mayor, st().quest >= 9 ? 'The fog is gone and you filed your own return. Paystub Village is proud of you!' : 'On your way, then! ' + HINT()),
  brannock: async () => say(N.brannock, st().quest < 1 ? 'New in town? Go and greet the Mayor first, then come see me.' : isOwner() ? 'Pay your estimates on time, every quarter. The penalty for skipping them adds up.' : 'Remember: if your life changes, hand in a new W-4.'),
  pim: async () => say(N.pim, st().quest < 2 ? 'Nothing for you yet. See Foreman Brannock first.' : isOwner() ? 'Sales minus expenses is profit, and profit is what gets taxed. Keep your books tidy!' : 'Gross is what you earn. Net is what you keep. Never mix them up!'),
  odette: async () => say(N.odette, st().quest < 3 ? 'Nothing for you yet, dear. Year-end forms go out in January.' : 'Keep those year-end forms safe. You will want them for at least three years.'),
  sable: async () => say(N.sable, st().quest < 4 ? 'The Guild will see you when you hold your year-end forms. Not before.' : 'Your status follows your life on December 31. Marry, or welcome a child, and your banner may change.'),
  thorn: async () => say(N.thorn, st().quest < 5 ? 'No shield without a banner. See Guildmaster Sable first.' : 'Standard or itemized, carry the bigger shield. Simple as that.'),
  altamira: async () => say(N.altamira, st().quest < 6 ? 'The mountain will wait. Bring me a filing status and a deduction, and I will teach you the ledges.' : st().flags.bossDown ? 'The air is clear. Remember: only the dollars above a line pay the higher rate.' : 'The Mythmonger waits at the summit. Trust the compass.'),
  juno: async () => say(N.juno, st().quest < 8 ? 'The filing window is not open for you yet. Come back with your year-end forms, a filing status, a deduction, and a clear head.' : 'Your return is filed and stamped. See you next April!'),
};
const QUEST_FN = { mayor: [0, qMayor], brannock: [1, qBrannock], pim: [2, qPim], odette: [3, qOdette], sable: [4, qSable], thorn: [5, qThorn], altamira: [6, qAltamira], juno: [8, qJuno] };

const CHESTS = {
  a: { tx: 12, ty: 37, tip: 'tipDeadline', line: 'A scroll inside reads: "Most federal returns are due April 15. Mark it now."' },
  b: { tx: 42, ty: 18, tip: 'tipRecords', line: 'A scroll inside reads: "Keep your tax records for at least three years."' },
  c: { tx: 29, ty: 7, tip: 'tipFreeFile', line: 'A scroll inside reads: "Under a yearly income limit, IRS Free File gives you tax software at no cost."' },
};
LQ.curQuest = () => { const s = st(); return s.q4 != null && LQ.QUESTS4 ? LQ.QUESTS4[s.q4] : s.q3 != null && LQ.QUESTS3 ? LQ.QUESTS3[s.q3] : s.q2 != null && LQ.QUESTS2 ? LQ.QUESTS2[s.q2] : LQ.QUESTS[s.quest]; };
LQ.CH1 = {
  npcs: NPC_LIST, chests: CHESTS, ending,
  coins: [[20, 33], [27, 34], [12, 27], [6, 27], [41, 27], [35, 30], [18, 23], [29, 22], [10, 30], [40, 31], [21, 19], [27, 19], [5, 20], [43, 22], [19, 9], [30, 6], [21, 4], [26, 4], [8, 36], [38, 37]],
  signs: [
    { tx: 21, ty: 31, text: 'PAYSTUB VILLAGE. West: the Work Hall. East: Post Office. North: Guild Hall, Armory, and the bridge to Bracket Mountain. South-east: Town Hall. In the plaza: the Saffron Bazaar and the Village Exchange.' },
    { tx: 22, ty: 13, text: 'BRACKET MOUNTAIN. Seven ledges. Mind the fog.' },
    { tx: 22, ty: 38, fn: () => st().quest >= 9 ? 'SOUTH ROAD to Shelter Coast. The road is open. Chapter 2 begins there.' : 'SOUTH ROAD to Shelter Coast. Closed until your return is filed.' },
    { tx: 17, ty: 34, text: 'Your cottage. Small, snug, and the rent is due on the first.' },
    { tx: 26, ty: 22, fn: () => 'THE VILLAGE GAZETTE. Today: ' + (st().news ? st().news.text : 'No news.') + ' (Prices react tomorrow.)' + (st().flags.bossDown ? '' : ' Standing notice: miners say that if the fog ever lifts, the old silver mine reopens.') },
  ],
  talk: async id => {
    const q = QUEST_FN[id];
    if (q && st().quest === q[0]) return q[1]();
    if (id === 'merchant') return LQ.shop(N.merchant);
    if (id === 'broker') return LQ.broker(N.broker);
    if (TIPS[id]) return tip(id);
    return idle[id]();
  },
  openChest: async id => {
    const ch = CHESTS[id]; st().chests[id] = true; LQ.audio.sfx('coin'); LQ.gain(0, 40);
    await say(null, 'You found 40 coins! ' + ch.line); LQ.learn(ch.tip);
  },
};
})();
