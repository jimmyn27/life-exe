// The world uses a fixed modern-US snapshot, irrespective of the life date.
export const US_SNAPSHOT = { id: 'us-2026-v1', rulesAsOf: '2026-09-17', populationAsOf: '2025-07-01', currency: 'USD', dynamicPolicies: false } as const;
export const sources = {
  census: { title: 'Census Vintage 2025 incorporated-place population estimates', url: 'https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/cities/totals/sub-est2025.csv' },
  federalTax: { title: 'IRS 2026 inflation adjustments', url: 'https://www.irs.gov/irb/2025-45_IRB' },
  minimumWage: { title: 'DOL federal minimum wage', url: 'https://www.dol.gov/general/topic/wages/minimumwage' },
  youthEmployment: { title: 'DOL nonagricultural child labor rules', url: 'https://webapps.dol.gov/elaws/whd/flsa/cl/t14.asp' },
  overtime: { title: 'DOL overtime pay', url: 'https://www.dol.gov/agencies/whd/overtime' },
  tobacco: { title: 'FDA Tobacco 21', url: 'https://www.fda.gov/tobacco-products/retail-sales-tobacco-products/tobacco-21' },
  alcohol: { title: 'NIAAA minimum legal drinking age', url: 'https://www.niaaa.nih.gov/alcohols-effects-health/alcohol-policy' },
  voting: { title: 'USA.gov voter eligibility', url: 'https://www.usa.gov/who-can-vote' },
  retirement: { title: 'SSA retirement planning', url: 'https://www.ssa.gov/retirement/plan-for-retirement' },
  retirementAge: { title: 'SSA full retirement age', url: 'https://www.ssa.gov/faqs/en/questions/KA-01885.html' },
  socialSecurityTax: { title: 'SSA 2026 contribution and benefit base', url: 'https://www.ssa.gov/oact/COLA/cbb.html' },
  pensionFormula: { title: 'SSA primary insurance amount formula', url: 'https://www.ssa.gov/OACT/COLA/piaformula.html' },
  retirementSavings: { title: 'IRS 2026 retirement savings limits', url: 'https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500' },
  medicare: { title: 'Medicare eligibility', url: 'https://www.medicare.gov/basics/get-started-with-medicare' },
  fica: { title: 'IRS Social Security and Medicare withholding', url: 'https://www.irs.gov/taxtopics/tc751' },
  snap: { title: 'USDA SNAP eligibility', url: 'https://www.fns.usda.gov/snap/recipient/eligibility' },
  tanf: { title: 'ACF Temporary Assistance for Needy Families', url: 'https://www.acf.hhs.gov/ofa/programs/tanf/about' },
  ssi: { title: 'SSA Supplemental Security Income', url: 'https://www.ssa.gov/ssi' },
  unemployment: { title: 'DOL unemployment insurance', url: 'https://www.dol.gov/general/topic/unemployment-insurance' },
  housing: { title: 'HUD Housing Choice Vouchers', url: 'https://www.hud.gov/topics/housing_choice_voucher_program_section_8' },
  studentAid: { title: 'Federal Student Aid grants', url: 'https://studentaid.gov/understand-aid/types/grants' },
  marketplace: { title: 'Healthcare.gov coverage and savings', url: 'https://www.healthcare.gov/lower-costs/' },
} as const;
export type SourceId = keyof typeof sources;
