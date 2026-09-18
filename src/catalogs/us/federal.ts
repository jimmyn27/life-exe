import { US_SNAPSHOT, type SourceId } from './sources.ts';

export type FilingStatus = 'single' | 'marriedJoint' | 'marriedSeparate' | 'headOfHousehold';
export type TaxBracket = { over: number; rate: number };
const brackets = (thresholds: number[]): readonly TaxBracket[] => thresholds.map((over,index) => ({ over, rate: [0.10,0.12,0.22,0.24,0.32,0.35,0.37][index] }));

export const unitedStates = {
  id: 'US', name: 'United States', currency: 'USD', locale: 'en-US', snapshotId: US_SNAPSHOT.id,
  simulationPolicy: {
    payScope: 'national', incomeTaxScope: 'national', benefitsScope: 'national', educationScope: 'national',
    healthcareScope: 'national', licensingScope: 'national', legalRulesScope: 'national', retirementScope: 'national',
    stateAndLocalTaxEnabled: false, salesTaxEnabled: false, propertyTaxEnabled: false,
    medicaidEnabled: false, paidLeaveEnabled: false, mandatoryLeaveSimulationEnabled: false,
    notes: 'Deliberate game simplification. Real state/local rules are not simulated. City themes can vary; pay, eligibility and policies do not.',
  },
  employment: {
    nationalHourlyMinimum: 7.25, fullTimePayBasis: 'annual-salary', partTimePayBasis: 'hourly-wage',
    defaultWeeksWorked: 52, sourceIds: ['minimumWage'] satisfies SourceId[],
    notes: 'Federal wage floor used nationally as a game rule. Actual state/local floors, tipped wages and sector exceptions are omitted. Job schedules and annual hours belong to the employment engine.',
  },
  federalIncomeTax: {
    taxYear: 2026,
    standardDeduction: { single: 16100, marriedJoint: 32200, marriedSeparate: 16100, headOfHousehold: 24150 } satisfies Record<FilingStatus,number>,
    brackets: {
      single: brackets([0,12400,50400,105700,201775,256225,640600]),
      marriedJoint: brackets([0,24800,100800,211400,403550,512450,768700]),
      marriedSeparate: brackets([0,12400,50400,105700,201775,256225,384350]),
      headOfHousehold: brackets([0,17700,67450,105700,201750,256200,640600]),
    } satisfies Record<FilingStatus,readonly TaxBracket[]>,
    sourceIds: ['federalTax'] satisfies SourceId[],
    notes: 'Ordinary-income marginal brackets only. Dependent, senior/blind and itemized deductions, credits, capital gains, special deductions and alternative minimum tax are separate. Not yet applied during Age Up.',
  },
  employeePayroll: {
    socialSecurityRate: 0.062, socialSecurityWageCap: 184500, medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: { single: 200000, marriedJoint: 250000, marriedSeparate: 125000, headOfHousehold: 200000 },
    sourceIds: ['socialSecurityTax','fica'] satisfies SourceId[],
    notes: 'Employee share; same national rules for salary and hourly earnings. Self-employment and employer contributions differ. Withholding threshold and final joint tax liability are not identical.',
  },
  laws: {
    votingAge: 18, alcoholPurchaseAge: 21, tobaccoPurchaseAge: 21,
    gameAdulthoodAge: 18, gameDrivingLicenseAge: 16, gameMarriageAge: 18,
    standardNonfarmEmploymentAge: 14, unrestrictedNonhazardousEmploymentAge: 16, hazardousEmploymentAge: 18,
    ordinaryOvertime: { weeklyHours: 40, multiplier: 1.5, scope: 'National reference for covered nonexempt work; overtime eligibility is separate from salary/hourly pay basis.' },
    sourceIds: ['voting','alcohol','tobacco','youthEmployment','overtime'] satisfies SourceId[],
    notes: 'Fields prefixed game are authored national simplifications, not claims of uniform US law. Licensing uses a single national game requirement per profession. Complex courts, custody, reproductive-care and criminal-law rules are deferred.',
  },
} as const;

export const retirementSystems = [{
  id: 'us-social-security', countryId: 'US', earliestClaimAge: 62, fullRetirementAge: 67, latestDelayedCreditAge: 70,
  mandatoryRetirementAge: null, standardRequiredCredits: 40, earningsYearsUsed: 35,
  fullRetirementAgeScope: 'Born in 1960 or later; this is the fixed modern cohort model.',
  monthlyBenefitFormula: { bendPoints: [1286,7749], marginalFactors: [0.9,0.32,0.15], eligibilityYear: 2026 },
  employerPlans: ['401k','403b','defined-benefit-pension','public-employee-pension'],
  employee401kContributionLimit: 24500, iraContributionLimit: 7500, medicareOrdinaryEligibilityAge: 65,
  sourceIds: ['retirement','retirementAge','pensionFormula','retirementSavings','medicare'] satisfies SourceId[],
  notes: 'One national retirement model: benefits depend on covered work and an earnings record, not city or final salary. Claiming reductions, delayed credits and employer-plan eligibility need implementation. Regional pension taxation and public-employee plan differences are omitted; freeze all parameters.',
}] as const;

export type Benefit = { id: string; name: string; scope: 'national-game-model'; eligibility: string; sourceIds: readonly SourceId[]; paymentReady: false };
export const benefits: readonly Benefit[] = [
  { id:'snap',name:'Food assistance',scope:'national-game-model',eligibility:'One national household-income test; assistance scales with household size.',sourceIds:['snap'],paymentReady:false },
  { id:'tanf',name:'Family assistance',scope:'national-game-model',eligibility:'One national income test for households with dependent children.',sourceIds:['tanf'],paymentReady:false },
  { id:'unemployment-insurance',name:'Unemployment support',scope:'national-game-model',eligibility:'One national covered-work-history and qualifying-job-loss test; shared duration and payment rules.',sourceIds:['unemployment'],paymentReady:false },
  { id:'ssi',name:'Age/disability income support',scope:'national-game-model',eligibility:'Age 65+ or qualifying disability, plus one national income/resources test.',sourceIds:['ssi'],paymentReady:false },
  { id:'housing-voucher',name:'Housing assistance',scope:'national-game-model',eligibility:'One national household-income and housing-need test.',sourceIds:['housing'],paymentReady:false },
  { id:'pell-grant',name:'Need-based student grant',scope:'national-game-model',eligibility:'Qualifying undergraduate enrollment and one national financial-need test.',sourceIds:['studentAid'],paymentReady:false },
  { id:'medicare',name:'Medicare',scope:'national-game-model',eligibility:'Ordinarily age 65; use one national coverage and cost-sharing model.',sourceIds:['medicare'],paymentReady:false },
] as const;
export const benefitModelNotes = 'Real programs are references for names and purpose. Game eligibility is simplified and national; amounts, income thresholds and durations are not yet authored or paid during Age Up.';
