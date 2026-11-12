// Surprise audits: an agent leaps out and asks three questions about what you have learned.
(() => {
const LQ = window.LQ, ui = LQ.ui, st = () => LQ.state;
const AGENTS = ['Agent Stern', 'Agent Tally', 'Agent Ledger', 'Agent Docket'];
const LOOK = { id: 'agent', hat: 'fedora', shades: 1, hair: '#231a36', shirt: '#2b2d3a', pants: '#1e2029', trim: '#c9423a' };
const POOL = [
  { need: 'withholding', q: 'What does Form W-4 control?', o: ['How much federal income tax is withheld from each paycheck', 'My Social Security tax rate', 'My filing deadline'], why: 'The W-4 only sets federal income tax withholding.' },
  { need: 'paystub', q: 'Gross pay minus taxes and other deductions equals...', o: ['Net pay', 'Taxable wages', 'W-2 Box 2'], why: 'Net pay is what you take home.' },
  { need: 'fica', q: 'What is the employee Social Security tax rate?', o: ['6.2%', '1.45%', '10%'], why: 'Social Security is 6.2%. Medicare is 1.45%.' },
  { need: 'w2', q: 'Which W-2 box shows federal income tax already withheld?', o: ['Box 2', 'Box 1', 'Box 5'], why: 'Box 1 is wages. Box 2 is federal tax withheld.' },
  { need: 'status', q: 'A couple marries on December 31. For that tax year they are...', o: ['Married for the whole year', 'Single for the whole year', 'Whichever they prefer'], why: 'Status follows your situation on the last day of the year.' },
  { need: 'deduction', q: 'What is the 2026 standard deduction for a single filer?', o: ['$16,100', '$12,400', '$32,200'], why: '$32,200 is for married filing jointly. $12,400 is where the 10% bracket ends.' },
  { need: 'deduction', q: 'When does it make sense to itemize?', o: ['When itemized deductions total more than the standard deduction', 'Whenever you have any receipts', 'Whenever you want a bigger refund'], why: 'You take whichever is larger.' },
  { need: 'brackets', q: 'The first 2026 bracket for a single filer is...', o: ['10% on taxable income up to $12,400', '12% on taxable income up to $12,400', '10% on taxable income up to $50,400'], why: 'The 10% ledge runs from $0 to $12,400.' },
  { need: 'raise', q: 'A raise pushes you into a higher bracket. Which dollars pay the higher rate?', o: ['Only the dollars above the bracket line', 'Every dollar you earn', 'Only the dollars below the line'], why: 'Brackets are marginal.' },
  { need: 'refund', q: 'A tax refund is...', o: ['My own overpaid tax coming back', 'A bonus from the government', 'A reward for filing early'], why: 'A refund means you paid in more than you owed.' },
  { need: 'latefile', q: 'Which usually costs more per month?', o: ['Filing late (about 5% of the unpaid tax)', 'Paying late (about 0.5%)', 'They cost the same'], why: 'Filing late is roughly ten times worse. File on time even if you cannot pay.' },
  { need: 'tipRecords', q: 'How long should you keep your tax records?', o: ['At least three years', 'Three months', 'Only until the refund arrives'], why: 'Three years is the usual window for questions.' },
  { need: 'audit', q: 'How are most real IRS audits carried out?', o: ['By mail', 'By surprise visit', 'In a courtroom'], why: 'Most are letters asking you to back up a number.' },
  { need: 'proCredit', q: 'A $100 tax credit lowers your tax by...', o: ['$100', '$100 times your bracket rate', 'Nothing unless you itemize'], why: 'Credits come off the bill dollar for dollar.' },
  { need: 'proHSA', q: 'What is the 2026 HSA limit for self-only coverage?', o: ['$4,400', '$7,500', '$24,500'], why: '$7,500 is the IRA limit and $24,500 is the 401(k) limit.' },
  { need: 'proGains', q: 'A gain is long-term when you held the investment...', o: ['More than one year', 'More than 30 days', 'Past December 31'], why: 'More than one year earns the lower long-term rates.' },
  { need: 'proLoss', q: 'How much net capital loss can offset other income each year?', o: ['$3,000', '$10,000', 'None'], why: 'Up to $3,000, and the rest carries forward.' },
  { need: 'proRoth', q: 'Which account is taxed going in but tax-free coming out?', o: ['Roth', 'Traditional', 'Neither'], why: 'Roth: pay tax now, withdraw tax-free later.' },
  { need: 'proCharity', q: 'In 2026, how much cash charity can a single non-itemizer deduct?', o: ['Up to $1,000', 'Nothing', 'Up to $16,100'], why: 'Up to $1,000, or $2,000 for a joint return.' },
  { need: 'brokerage', q: 'In a taxable brokerage account, when do you owe tax on a stock gain?', o: ['When I sell it for a gain', 'Every day the price rises', 'Never'], why: 'Gains are taxed when realized, meaning when you sell.' },
  { need: 'overtime', career: 'nurse', q: 'Which part of overtime pay does the overtime deduction cover?', o: ['Only the extra half-time premium', 'All pay for overtime hours', 'All wages'], why: 'Only the premium above your regular rate.' },
  { need: 'selfEmp', career: 'owner', q: 'What is the self-employment tax rate?', o: ['15.3%', '7.65%', '6.2%'], why: 'You pay both halves: 15.3%.' },
  { need: 'estimates', career: 'owner', q: 'How often are estimated taxes paid?', o: ['Four times a year', 'Once, in April', 'Every week'], why: 'Quarterly, with Form 1040-ES.' },
  { need: 'records', career: 'owner', q: 'A customer paid you but sent no 1099. Is that income taxable?', o: ['Yes. All business income is taxable', 'No. No form, no tax', 'Only if it was paid by check'], why: 'All income counts, form or no form.' },
  { need: 'proSaver', career: 'food', q: "What is the 2026 income cap for the Saver's Credit, single filer?", o: ['$40,250', '$16,100', '$100,000'], why: 'Under $40,250 you may qualify.' },
];
LQ.AUDIT_POOL = POOL;
LQ.auditPool = () => POOL.filter(p => st().journal.includes(p.need) && (!p.career || p.career === st().career));
LQ.audit = async () => {
  const s = st(), w = LQ.world, p = w.p, pool = LQ.shuffle(LQ.auditPool()).slice(0, 3);
  if (pool.length < 3) return;
  s.audits = (s.audits || 0) + 1;
  const who = { name: AGENTS[s.audits % AGENTS.length], look: LOOK };
  const side = w.canStand(p.x + 18, p.y) ? 18 : w.canStand(p.x - 18, p.y) ? -18 : 0;
  w.agent = { x: p.x + side, y: side ? p.y : p.y - 14, look: LOOK }; if (side) p.dir = side < 0 ? 'left' : 'right';
  w.burst(w.agent.x, w.agent.y - 8, '#c9cdea', 22, 60); LQ.audio.sfx('rumble'); LQ.shake(0.35);
  ui.showBanner('AUDIT!', who.name + ' leaps out of nowhere'); await LQ.wait(1.1); ui.banner = null;
  await LQ.say(who, s.audits === 1 ? 'HALT. Internal Revenue Service. This is a surprise audit. Three questions. Answer two correctly and you walk away richer. Fail, and it will cost you.'
    : 'You again. Routine check. Three questions, two to pass. Let us see what you have learned since last time.');
  let right = 0;
  for (const q of pool) if (await LQ.quiz(who, q.q, q.o, q.why)) right++;
  let pass = right >= 2;
  if (!pass && right === 1 && LQ.has('ledger')) { pass = true; await LQ.say(who, 'Hm. One short... but your Receipt Ledger is in perfect order. Good records count. I will let it pass.'); }
  if (pass) {
    LQ.audio.sfx('fanfare'); LQ.gain(20, (40 + 10 * right) * (LQ.has('abacus') ? 2 : 1), 'Audit passed');
    await LQ.say(who, right === 3 ? 'Three for three. Flawless. Carry on, citizen.' : 'Good enough. You pass. Carry on, citizen.');
  } else {
    LQ.gain(-15, -Math.min(s.coins, 60), 'Audit failed');
    await LQ.say(who, 'Not good enough. That is a penalty. Study your Tax Journal. I will be back.');
  }
  if (!s.journal.includes('audit')) { LQ.learn('audit'); await LQ.say(null, 'A note for your journal: real audits look nothing like this. They are rare, they mostly arrive by mail, and good records settle them.'); }
  LQ.tick(); w.burst(w.agent.x, w.agent.y - 8, '#c9cdea', 16, 50); w.agent = null;
};
})();
