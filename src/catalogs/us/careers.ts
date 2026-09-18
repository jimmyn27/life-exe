import { majors, type CredentialId, type MajorId } from './education.ts';
import { unitedStates } from './federal.ts';

export const industries = [
  'retail','food-service','hospitality','administration','information-technology','software','finance','accounting',
  'healthcare','education','construction','automotive','manufacturing','logistics','media','design','public-service','legal','energy','entertainment',
] as const;
export type IndustryId = typeof industries[number];
export type EducationRoute = { credentialId:CredentialId | null; requiredMajorIds:readonly MajorId[] };
export type Career = { id:string; name:string; industryId:IndustryId; description:string; usualCredentialId:CredentialId | null; requiredMajorIds:readonly MajorId[]; preferredMajorIds:readonly MajorId[]; workplaceTrainingRequired:boolean; licenseRequired:boolean; notes:string };
export type Position = { id:string; careerId:string; title:string; rank:number; nominalMinimumExperience:number; nextPositionId:string | null; educationRoutes:readonly EducationRoute[]; employmentType:'full-time'; payBasis:'annual-salary'; annualSalaryRange:readonly [number,number]; salaryBasis:'gameplay-seed'; weeklyHours:number };
type CareerSeed = [string,string,IndustryId,CredentialId | null,MajorId[],boolean,[string,string,string],[number,number,number]];
const seeds: CareerSeed[] = [
  ['retail','Retail','retail',null,['business','marketing','human-resources'],false,['Sales associate','Shift supervisor','Store manager'],[30000,42000,62000]],
  ['food-service','Food service','food-service',null,['business','human-resources'],false,['Food service worker','Shift lead','Restaurant manager'],[29000,39000,58000]],
  ['hospitality','Hospitality','hospitality',null,['hospitality','business','communications','marketing'],false,['Front desk agent','Front desk supervisor','Hotel manager'],[33000,47000,76000]],
  ['office','Office administration','administration','high-school',['business','human-resources','communications'],false,['Office assistant','Administrative coordinator','Office manager'],[35000,47000,62000]],
  ['library','Library support','public-service','high-school',['literature','history','art-history','information-technology'],false,['Library assistant','Senior library assistant','Library support supervisor'],[33000,43000,55000]],
  ['it-support','IT support','information-technology','high-school',['information-technology','computing'],false,['Help desk technician','IT support specialist','IT support manager'],[42000,62000,90000]],
  ['software','Software development','software','bachelor',['computing'],false,['Junior software developer','Software developer','Senior software developer'],[70000,105000,145000]],
  ['cybersecurity','Cybersecurity','information-technology','bachelor',['computing','information-technology'],false,['Junior security analyst','Security analyst','Senior security analyst'],[65000,95000,130000]],
  ['accounting','Accounting','accounting','bachelor',['accounting-finance'],false,['Staff accountant','Senior accountant','Accounting manager'],[55000,78000,110000]],
  ['finance','Financial analysis','finance','bachelor',['accounting-finance','economics'],false,['Junior financial analyst','Financial analyst','Senior financial analyst'],[60000,85000,120000]],
  ['marketing','Marketing','media','bachelor',['marketing','communications','business','psychology'],false,['Marketing assistant','Marketing specialist','Marketing manager'],[42000,62000,95000]],
  ['nursing','Registered nursing','healthcare','bachelor',['nursing'],true,['Registered nurse','Senior registered nurse','Nurse manager'],[65000,85000,110000]],
  ['medicine','Medicine','healthcare','md',['biology','chemistry','kinesiology'],true,['Resident physician','Attending physician','Senior attending physician'],[65000,200000,280000]],
  ['teaching','School teaching','education','bachelor',['education'],true,['Teacher','Experienced teacher','Lead teacher'],[45000,60000,75000]],
  ['social-work','Social services','public-service','bachelor',['psychology','sociology','anthropology'],false,['Case worker','Senior case worker','Social services supervisor'],[45000,60000,80000]],
  ['electrician','Electrical trades','construction','high-school',[],true,['Trainee electrician','Journey-level electrician','Electrical foreperson'],[35000,65000,85000]],
  ['plumber','Plumbing','construction','high-school',[],true,['Trainee plumber','Journey-level plumber','Plumbing foreperson'],[35000,65000,85000]],
  ['mechanic','Automotive service','automotive','high-school',[],false,['Junior automotive technician','Automotive technician','Lead automotive technician'],[35000,52000,70000]],
  ['manufacturing','Manufacturing','manufacturing','high-school',[],false,['Production worker','Production lead','Production supervisor'],[35000,47000,65000]],
  ['logistics','Warehouse logistics','logistics',null,[],false,['Warehouse associate','Warehouse lead','Warehouse supervisor'],[33000,44000,60000]],
  ['journalism','Journalism','media','bachelor',['journalism','communications','literature','political-science','history'],false,['Junior reporter','Reporter','Senior reporter'],[38000,55000,75000]],
  ['design','Graphic design','design','bachelor',['graphic-design'],false,['Junior graphic designer','Graphic designer','Senior graphic designer'],[42000,62000,85000]],
  ['legal','Legal practice','legal','jd',['criminology','political-science','philosophy','history','literature'],true,['Associate attorney','Senior associate attorney','Partner'],[80000,140000,220000]],
  ['civil-engineering','Civil engineering','construction','bachelor',['engineering'],true,['Junior civil engineer','Civil engineer','Senior civil engineer'],[65000,90000,120000]],
  ['human-resources','Human resources','administration','bachelor',['human-resources','business','psychology','sociology'],false,['HR coordinator','HR specialist','HR manager'],[45000,65000,95000]],
  ['architecture','Architecture','design','bachelor',['architecture'],true,['Architectural assistant','Architect','Senior architect'],[55000,85000,120000]],
  ['music','Music performance','entertainment',null,['music','fine-arts'],false,['Session musician','Professional musician','Music director'],[35000,55000,80000]],
  ['dance','Dance performance','entertainment',null,['dance','kinesiology','fine-arts'],false,['Company dancer','Principal dancer','Dance director'],[32000,48000,70000]],
];
// Multiple entries are alternatives (OR), not a requirement to earn all majors.
// Preferences can improve hiring later, but must never block an application.
const requiredMajors: Readonly<Record<string,readonly MajorId[]>> = {
  software:['computing','information-technology','mathematics','engineering'],
  cybersecurity:['computing','information-technology','engineering'],
  accounting:['accounting-finance'],
  finance:['accounting-finance','economics','mathematics','business'],
  nursing:['nursing'], teaching:['education'], design:['graphic-design','fine-arts'],
  'civil-engineering':['engineering'], architecture:['architecture'],
};
export const careers: readonly Career[] = seeds.map(([id,name,industryId,usualCredentialId,preferredMajorIds,licenseRequired]) => ({
  id,name,industryId,usualCredentialId,preferredMajorIds,licenseRequired,description:`Explore a career in ${name.toLowerCase()}.`,
  requiredMajorIds:requiredMajors[id] ?? [],
  workplaceTrainingRequired:['electrician','plumber','mechanic'].includes(id),
  notes:'National starter game route and pay range. Qualifications, training, exams and licensing use shared national rules. Licensing may apply only to later ranks or particular duties.',
}));
// Subject matching only. Degree level, licenses, portfolio/audition, professional
// school and work experience are separate future hiring checks.
export function careerMajorFit(careerId:string,completedMajorIds:readonly string[]) {
  const career=careers.find(career=>career.id===careerId);
  if(!career) throw new Error('Unknown career.');
  const validIds=completedMajorIds.filter((id):id is MajorId=>majors.some(major=>major.id===id));
  return {
    meetsRequirement:!career.requiredMajorIds.length || validIds.some(id=>career.requiredMajorIds.includes(id)),
    hasPreferredMajor:validIds.some(id=>career.preferredMajorIds.includes(id)),
  };
}
export function matchesCareerMajor(careerId:string,completedMajorIds:readonly string[]):boolean {
  return careerMajorFit(careerId,completedMajorIds).meetsRequirement;
}
// Lower credentials open selected ranks; promotion can require further study.
const communityEntryRoutes: Readonly<Record<string,readonly (EducationRoute & { maximumRank:number })[]>> = {
  software:[{credentialId:'associate',requiredMajorIds:['computing','information-technology'],maximumRank:1}],
  cybersecurity:[{credentialId:'associate',requiredMajorIds:['computing','information-technology'],maximumRank:1}],
  marketing:[
    {credentialId:'certificate',requiredMajorIds:['marketing','business'],maximumRank:1},
    {credentialId:'associate',requiredMajorIds:['marketing','business','communications'],maximumRank:2},
  ],
  journalism:[{credentialId:'associate',requiredMajorIds:['journalism','communications'],maximumRank:1}],
  design:[
    {credentialId:'certificate',requiredMajorIds:['graphic-design'],maximumRank:1},
    {credentialId:'associate',requiredMajorIds:['graphic-design','fine-arts'],maximumRank:2},
  ],
  'human-resources':[{credentialId:'associate',requiredMajorIds:['business'],maximumRank:1}],
};
function educationRoutesForPosition(careerId:string,rank:number): readonly EducationRoute[] {
  const career=careers.find(row=>row.id===careerId)!;
  return [
    {credentialId:career.usualCredentialId,requiredMajorIds:career.requiredMajorIds},
    ...(communityEntryRoutes[careerId] ?? []).filter(route=>rank<=route.maximumRank)
      .map(({credentialId,requiredMajorIds})=>({credentialId,requiredMajorIds})),
  ];
}
export const positions: readonly Position[] = seeds.flatMap(([careerId,,,,,,titles,salaries]) => titles.map((title,index) => ({
  id:`${careerId}-${index+1}`,careerId,title,rank:index+1,nominalMinimumExperience:[0,3,8][index],nextPositionId:index<2?`${careerId}-${index+2}`:null,
  educationRoutes:educationRoutesForPosition(careerId,index+1),
  employmentType:'full-time',payBasis:'annual-salary',annualSalaryRange:[salaries[index],Math.round(salaries[index]*1.3)] as const,salaryBasis:'gameplay-seed',weeklyHours:40,
})));
export type CompletedEducation = { credentialId:CredentialId; majorId?:MajorId };
// Match the subject on the same award, never a degree plus an unrelated certificate.
// GED substitutes for high school. Licenses and experience are separate checks.
export function meetsPositionEducation(positionId:string,awards:readonly CompletedEducation[]):boolean {
  const position=positions.find(row=>row.id===positionId);
  if(!position) throw new Error('Unknown career position.');
  return position.educationRoutes.some(route=>route.credentialId===null || awards.some(award=>
    (award.credentialId===route.credentialId || (route.credentialId==='high-school' && award.credentialId==='ged')) &&
    (!route.requiredMajorIds.length || (award.majorId!==undefined && route.requiredMajorIds.includes(award.majorId)))
  ));
}
// Pay is shared nationwide. These are authored game ranges, not real wage data.
export function salaryRangeForPosition(positionId:string): readonly [number,number] {
  const position = positions.find(position => position.id === positionId);
  if (!position) throw new Error('Unknown career position.');
  return position.annualSalaryRange;
}
export type PartTimeJob = { id:string; title:string; industryId:IndustryId; employmentType:'part-time'; payBasis:'hourly-wage'; hourlyWageRange:readonly [number,number]; weeklyHoursRange:readonly [number,number]; wageBasis:'gameplay-seed' };
const partTimeSeeds: [string,string,IndustryId,number,number][] = [
  ['retail-assistant','Retail assistant','retail',12,18],['cashier','Cashier','retail',11,16],
  ['barista','Barista','food-service',12,18],['food-counter','Food counter worker','food-service',11,16],
  ['library-aide','Library aide','public-service',12,18],['office-aide','Office aide','administration',14,20],
  ['warehouse-assistant','Warehouse assistant','logistics',14,21],['hotel-reception','Hotel receptionist','hospitality',13,19],
];
export const partTimeJobs: readonly PartTimeJob[] = partTimeSeeds.map(([id,title,industryId,low,high]) => ({
  id,title,industryId,employmentType:'part-time',payBasis:'hourly-wage',
  hourlyWageRange:[Math.max(unitedStates.employment.nationalHourlyMinimum,low),high],weeklyHoursRange:[8,24],wageBasis:'gameplay-seed',
}));
