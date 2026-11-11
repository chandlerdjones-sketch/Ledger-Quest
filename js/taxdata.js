// All tax figures live here so they can be updated once a year.
// US federal, tax year 2026 (returns filed in early 2027).
// Sources:
//   IRS Revenue Procedure 2025-32 (2026 rate schedules and standard deduction)
//     https://www.irs.gov/pub/irs-drop/rp-25-32.pdf
//   SSA 2026 contribution and benefit base
//     https://www.ssa.gov/oact/COLA/cbb.html
window.LQ = window.LQ || {};
LQ.TAX = {
  year: 2026,
  standardDeduction: { single: 16100, mfj: 32200, mfs: 16100, hoh: 24150, qss: 32200 },
  // [bracket starts at, rate]
  brackets: {
    single: [[0, .10], [12400, .12], [50400, .22], [105700, .24], [201775, .32], [256225, .35], [640600, .37]],
    mfj:    [[0, .10], [24800, .12], [100800, .22], [211400, .24], [403550, .32], [512450, .35], [768700, .37]],
    hoh:    [[0, .10], [17700, .12], [67450, .22], [105700, .24], [201750, .32], [256200, .35], [640600, .37]],
  },
  ssRate: 0.062,          // Social Security, employee share
  ssWageBase: 184500,     // wages above this are not taxed for Social Security
  medicareRate: 0.0145,   // Medicare, employee share
};
// Marginal tax calculation. Returns the total and the tax owed on each ledge.
LQ.taxOn = (taxable, status = 'single') => {
  const b = LQ.TAX.brackets[status];
  const tiers = [];
  let total = 0;
  for (let i = 0; i < b.length; i++) {
    const from = b[i][0], to = i + 1 < b.length ? b[i + 1][0] : Infinity, rate = b[i][1];
    const amount = Math.max(0, Math.min(taxable, to) - from);
    const tax = amount * rate;
    total += tax;
    tiers.push({ from, to, rate, amount, tax });
  }
  return { total: Math.round(total * 100) / 100, tiers };
};

// ---- Figures added for the Tax Tycoon update (tax year 2026) ----
// Sources:
//   Overtime, tips, and non-itemizer charity deductions:
//     https://www.irs.gov/newsroom/working-families-tax-cuts-individuals-and-workers
//   401(k), IRA, and Saver's Credit limits (IR-2025-111):
//     https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500
//   HSA limit (Publication 15-B, 2026): https://www.irs.gov/pub/irs-pdf/p15b.pdf
//   Capital gains thresholds and student loan interest: Rev. Proc. 2025-32 (link above)
//   Mileage rates (72.5 cents, 76 cents from July 1, 2026):
//     https://www.irs.gov/tax-professionals/standard-mileage-rates
Object.assign(LQ.TAX, {
  seRate: 0.153,            // self-employment tax: both halves of Social Security and Medicare
  seBase: 0.9235,           // share of net profit that self-employment tax applies to
  qbiRate: 0.20,            // qualified business income deduction
  overtimeCap: 12500,       // max overtime deduction, single filer
  k401Limit: 24500,
  iraLimit: 7500,
  hsaSelf: 4400,
  saverMaxAgi: 40250,       // Saver's Credit income cap, single filer
  ltcgZeroMax: 49450,       // long-term gains taxed at 0% up to this taxable income (single)
  ltcg15Max: 545500,
  capLossLimit: 3000,       // net capital loss allowed against other income each year
  charityNonItemizer: 1000,
  studentLoanMax: 2500,
  mileage: { h1: 0.725, h2: 0.76, demo: 2970 },   // demo: 2,000 miles in each half of 2026
  homeOfficeRate: 5, homeOfficeMaxSqft: 300,
});

// ---- Figures added for Chapter 2: Shelter Coast (tax year 2026) ----
// Sources:
//   Child Tax Credit ($2,200, up to $1,700 refundable), health FSA ($3,400, $680 carryover),
//   married filing separately brackets, joint capital gains thresholds: Rev. Proc. 2025-32 (link above)
//   Child and Dependent Care Credit rates from 2026: Internal Revenue Code section 21, as amended
//     https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section21
//   Overtime deduction for joint filers, non-itemizer charity, Trump Accounts, dependent care changes:
//     https://www.irs.gov/newsroom/one-big-beautiful-bill-provisions
//   Saver's Credit joint limit: IR-2025-111 (link above)
//   Home mortgage interest and points: IRS Publication 936. Charity rules: Publication 526.
//   Home sale exclusion: Publication 523. Education credits: Publication 970.
LQ.TAX.brackets.mfs = [[0, .10], [12400, .12], [50400, .22], [105700, .24], [201775, .32], [256225, .35], [384350, .37]];
Object.assign(LQ.TAX, {
  ctc: 2200, ctcRefundable: 1700,      // Child Tax Credit per qualifying child
  careMaxOne: 3000, careMaxTwo: 6000,  // care expenses that count toward the credit
  careRate: 0.35,                      // rate for joint income between $45,000 and $150,000
  saltCap: 40400,                      // state and local tax deduction cap for 2026
  charityJoint: 2000,                  // non-itemizer cash gifts, joint return
  charityFloor: 0.005,                 // itemizers deduct gifts only above 0.5% of income
  medicalFloor: 0.075,                 // medical costs count only above 7.5% of income
  overtimeCapJoint: 25000,
  saverMaxAgiJoint: 80500,
  ltcgZeroMaxJoint: 98900,
  fsaHealth: 3400, fsaCarry: 680, dcfsa: 7500, hsaFamily: 8750,
  mortgageDebtLimit: 750000,
  homeSaleSingle: 250000, homeSaleJoint: 500000,
  aotc: 2500, aotcRefundable: 1000,
});
