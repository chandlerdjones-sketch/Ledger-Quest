// Chapters 3 and 4: the household return once a side gig and investments join it.
// Built on top of LQ.fin (your own job) the same way LQ.fin2 is, so gear from every chapter still counts.
(() => {
const LQ = window.LQ, TX = LQ.TAX, STD = TX.standardDeduction, st = () => LQ.state;
const sum = rows => rows.reduce((t, r) => t + r[1], 0);

// On Schedule D, each coin of gain or loss from the exchanges counts as this many dollars.
LQ.COIN_USD = 10;
// Year two in the cottage: a little less interest than the first year, and no loan points.
LQ.HOME.interest2 = 21750;

// ---------- the three side gigs
// income rows: [label, amount, form], where form is 'k' (1099-K), 'nec' (1099-NEC), or 'none' (no form sent)
const MILES = 10000, MILE_COST = Math.round(MILES / 2 * TX.mileage.h1 + MILES / 2 * TX.mileage.h2);
LQ.GIGS = {
  driver: { id: 'driver', name: 'Dust Runner', what: 'drive a cart for hire',
    lines: ['Rides booked through the Trailhail board', 'Big mileage write-off', 'Most income shows on a Form 1099-K'],
    income: [['Trailhail ride payouts, 900 rides', 21000, 'k'], ['Private bookings, paid in cash', 1000, 'none']],
    costs: [['Mileage: 10,000 business miles', MILE_COST], ['Trailhail commission', 4200], ['Tolls and parking on jobs', 275]],
    welcome: 'A Dust Runner! You carry passengers and parcels up and down the canyon in your own cart. Start a mileage log today. Every business mile is worth money at tax time, and you cannot rebuild a log from memory in April.' },
  seller: { id: 'seller', name: 'Canyon Kiln', what: 'sell pottery on the Bazaar Board',
    lines: ['340 orders a year through the Bazaar Board', 'Costs: clay, fees, and shipping', 'No tax form arrives at all'],
    income: [['Bazaar Board sales, 340 orders', 16000, 'none']],
    costs: [['Clay, glaze, and kiln fuel', 4600], ['Bazaar Board selling fees', 1900], ['Shipping and boxes', 1300]],
    welcome: 'A potter! You fire cups and bowls at home and sell them through the Bazaar Board. Keep every receipt for clay and shipping. What your goods cost you to make comes off what they sold for.' },
  scribe: { id: 'scribe', name: 'Quill for Hire', what: 'freelance as a scribe',
    lines: ['Three clients, paid by the job', 'Low costs, so most of it is profit', 'Two clients send a Form 1099-NEC'],
    income: [['Ironwood Mining Co.', 9000, 'nec'], ['Mesa Outfitters', 3600, 'nec'], ['Old Prospector Pete', 1400, 'none']],
    costs: [['Home office: 150 sq ft at $5', 150 * TX.homeOfficeRate], ['Ink, paper, and scribing tools', 650]],
    welcome: 'A scribe! You write contracts and letters for canyon businesses from a desk at home. Low costs, which is good for your purse and means most of what you earn is taxable profit.' },
};
Object.values(LQ.GIGS).forEach(g => { g.gross = sum(g.income); g.cost = sum(g.costs); g.formed = sum(g.income.filter(r => r[2] !== 'none')); g.unformed = g.gross - g.formed; });

// Lost expense slips in Hustle Canyon. amt is what you spent, counts is what Schedule C allows.
LQ.SLIPS = {
  xSupply: { name: 'Supplies for the gig', amt: 420, counts: 420, note: 'counts in full' },
  xPhone: { name: 'Phone bill, used half for the gig', amt: 900, counts: 450, note: 'business share only' },
  xLicense: { name: 'Canyon vendor license', amt: 120, counts: 120, note: 'counts in full' },
  xMeal: { name: 'Lunch with a client', amt: 80, counts: 40, note: 'meals count at 50%' },
  xLunch: { name: 'Your own lunch on a work day', amt: 14, counts: 0, note: 'personal' },
  xBoots: { name: 'Everyday boots', amt: 130, counts: 0, note: 'personal clothing' },
  xFine: { name: 'Cart parking fine', amt: 60, counts: 0, note: 'fines never count' },
};

// The child care credit rate for a joint return: 35% up to $150,000 of income, then one point less for every $4,000, down to 20%.
LQ.careRate = agi => agi <= TX.careFullJoint ? TX.careRate : Math.max(TX.careMinRate, TX.careRate - 0.01 * Math.ceil((agi - TX.careFullJoint) / TX.careStepJoint));

// The joint return for Chapters 3 and 4.
// Options: noGig (leave the gig out), gig (use this gig id), inv (true or false: include investments),
//          est (estimated payment plan: 0 quarterly, 1 skipped, 2 one lump in January), wh (override tax paid in)
LQ.fin3 = (o = {}) => {
  const s = st(), b = LQ.fin(0), H = LQ.HOME, has = LQ.has, w2 = b.kind === 'w2';
  const got = id => !!(s.rcpt && s.rcpt[id]);
  const G = o.noGig ? null : LQ.GIGS[o.gig || s.gig] || null;
  const useInv = o.inv != null ? o.inv : s.q4 != null;
  const I = Object.assign({ st: 0, lt: 0, qd: 0, int: 0 }, useInv ? s.inv : null);
  const f = { b, c: b.c, kind: b.kind, G, ot: b.ot, inv: useInv };
  // wages
  f.sp401 = (has('anchor') ? 4000 : 0) + (has('stepup') ? 3000 : 0); f.spBox1 = H.spWages - f.sp401;
  f.wages = (w2 ? b.box1 : 0) + f.spBox1;
  // Schedule C: the gig, plus the candle shop for the Small Business Owner
  f.gigGross = G ? G.gross : 0; f.gigBase = G ? G.cost : 0;
  f.slips = G ? Object.keys(LQ.SLIPS).reduce((a, id) => a + (got(id) ? LQ.SLIPS[id].counts : 0), 0) : 0;
  f.tools = G && has('toolkit') ? 800 : 0;
  f.gigExp = f.gigBase + f.slips + f.tools; f.gigProfit = f.gigGross - f.gigExp;
  f.shop = w2 ? 0 : b.profit; f.biz = f.shop + f.gigProfit;
  // Schedule SE: one calculation on all self-employment profit
  f.se = Math.round(f.biz * TX.seBase * TX.seRate); f.half = Math.round(f.se / 2);
  f.seGig = f.se - (w2 ? 0 : b.se);
  // Schedule D: banked losses from earlier years come in first, then short-term and long-term net against each other
  const carry = useInv ? (s.lossBank || 0) * LQ.COIN_USD : 0;
  f.int = has('munis') ? 0 : I.int; f.qd = I.qd; f.stRaw = I.st; f.ltRaw = I.lt; f.carry = carry;
  const stN = I.st - carry, ltN = I.lt, net = stN + ltN;
  f.capNet = net;
  f.stTax = net <= 0 || stN <= 0 ? 0 : ltN < 0 ? net : stN;      // short-term gain taxed like wages
  f.ltTax = net <= 0 || ltN <= 0 ? 0 : stN < 0 ? net : ltN;      // long-term gain taxed at the lower rates
  f.capLoss = net < 0 ? Math.min(TX.capLossLimit, -net) : 0;     // a net loss offsets up to $3,000 of other income
  f.carryNext = net < 0 ? -net - f.capLoss : 0;
  f.capLine = net >= 0 ? net : -f.capLoss;
  f.income = f.wages + f.biz + f.int + f.qd + f.capLine;
  // adjustments
  f.sep = G && has('sep') ? 1200 : 0; f.acct = useInv && s.acct4 === 1 ? 3000 : 0;
  f.adj = f.half + (w2 ? b.hsa : b.retire + b.hsa) + (has('cask') ? 4000 : 0) + f.sep + f.acct;
  f.agi = f.income - f.adj;
  // standard or itemized, worked out fresh each year
  f.prov = Math.round(H.provRate * Math.max(0, f.income));
  f.saltRaw = f.prov + H.propTax + H.cartTax; f.salt = Math.min(TX.saltCap, f.saltRaw);
  f.gifts = has('charity') ? 500 : 0; f.giftItem = Math.max(0, f.gifts - Math.round(TX.charityFloor * f.agi));
  f.interest = H.interest2;
  f.itemized = f.interest + f.salt + f.giftItem; f.giftStd = Math.min(f.gifts, TX.charityJoint); f.stdTotal = STD.mfj + f.giftStd;
  f.itemize = f.itemized > f.stdTotal; f.ded = Math.max(f.itemized, f.stdTotal);
  const pre = Math.max(0, f.agi - f.ded - f.ot), prefRaw = f.ltTax + f.qd;
  // business income deduction: 20% of business profit, limited by taxable income apart from gains taxed at the lower rates
  f.qbi = Math.round(TX.qbiRate * Math.max(0, Math.min(f.biz - f.half - f.sep, pre - Math.min(pre, prefRaw))));
  f.taxable = pre - f.qbi;
  // the tax: ordinary income climbs the ledges first, long-term gains and qualified dividends stack on top
  f.pref = Math.min(f.taxable, prefRaw); f.ord = f.taxable - f.pref;
  const t = LQ.taxOn(f.ord, 'mfj');
  f.tiers = t.tiers.filter(x => x.amount > 0); if (!f.tiers.length) f.tiers = [LQ.taxOn(1, 'mfj').tiers[0]];
  f.top = f.tiers[f.tiers.length - 1].rate; f.ordTax = Math.round(t.total);
  f.zeroRoom = Math.max(0, TX.ltcgZeroMaxJoint - f.ord); f.at0 = Math.min(f.pref, f.zeroRoom); f.at15 = f.pref - f.at0;
  f.prefTax = Math.round(0.15 * f.at15); f.tax = f.ordTax + f.prefTax;
  // credits
  f.ctc = TX.ctc; f.careRate = LQ.careRate(f.agi); f.care = Math.round(f.careRate * TX.careMaxOne);
  const spouseRoth = (has('ring') ? 3000 : 0) + (useInv && s.acct4 === 0 ? 3000 : 0);
  f.saver = LQ.saverCredit(f.agi, b.retire + b.roth + f.acct, f.sp401 + spouseRoth, true);
  f.credits = Math.min(f.tax, f.ctc + f.care + f.saver);
  f.total = f.tax - f.credits + f.se;
  // paid in during the year: paycheck withholding that covers the day jobs, plus estimated payments for the gig
  if (o.wh != null) f.withheld = o.wh;
  else {
    const base = LQ.fin3({ noGig: true, inv: false, wh: 0 }), mid = LQ.fin3({ gig: o.gig, inv: false, wh: 0 });
    f.baseWh = Math.ceil(base.total / 26) * 26;
    f.gigBill = Math.max(0, mid.total - base.total);
    const e = o.est != null ? o.est : useInv ? 0 : s.est3 || 0;
    f.estPlan = e; f.quarter = Math.ceil(f.gigBill / 4 / 10) * 10; f.est = e === 1 ? 0 : f.quarter * 4;
    f.withheld = f.baseWh + f.est;
  }
  f.diff = f.withheld - f.total;
  return f;
};
LQ.fin4 = (o = {}) => LQ.fin3(Object.assign({ inv: true }, o));
// A what-if: the Chapter 4 return with the investment record changed, without touching the save.
LQ.trial4 = patch => { const s = st(), keep = s.inv; s.inv = Object.assign({ st: 0, lt: 0, qd: 0, int: 0 }, keep); patch(s.inv); const f = LQ.fin4(); s.inv = keep; return f; };

// Shops, brokers, and the old tax-at-sale rule all ask for "the current return".
const cur0 = LQ.cur;
LQ.cur = () => { const s = st(); return s.q4 != null || (s.q3 != null && s.gig) ? LQ.fin3() : cur0(); };

// Chapter 4, until the return is filed: every sale is recorded for Schedule D instead of taxed at the counter.
LQ.deferGains = () => { const s = st(); return s.q4 != null && s.q4 < 9 && !!s.inv; };
// A year passes on the way to the Summit. Dividends are paid in full and recorded for the return.
LQ.yearPass4 = () => {
  const s = st(); if (!s.prices || !s.inv) return 0; let div = 0;
  LQ.STOCKS.forEach((x, i) => {
    if (s.prices[x.id] == null) return;
    s.prev[x.id] = s.prices[x.id]; s.prices[x.id] *= 1 + x.drift * 8 + (LQ.hash(91, i, s.seed) - .4) * x.vol * 3;
    div += LQ.shares(x.id) * LQ.price(x.id) * x.div; s.lots[x.id].forEach(l => { l.lt = true; });
  });
  div = Math.round(div); s.coins += div; s.divs = (s.divs || 0) + div; s.inv.qd += div * LQ.COIN_USD;
  return div;
};
})();
