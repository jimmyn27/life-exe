// Authored national game routes. Durations are nominal full-time study lengths.
export const credentials = [
  { id:'high-school',name:'High school diploma',nominalYears:4 },
  { id:'ged',name:'High school equivalency',nominalYears:1 },
  { id:'certificate',name:'Career certificate',nominalYears:1 },
  { id:'associate',name:'Associate degree',nominalYears:2 },
  { id:'bachelor',name:'Bachelor’s degree',nominalYears:4 },
  { id:'master',name:'Master’s degree',nominalYears:2 },
  { id:'jd',name:'Juris Doctor',nominalYears:3 },
  { id:'md',name:'Medical degree',nominalYears:4 },
] as const;
export type CredentialId = typeof credentials[number]['id'];
export const institutionTypes = [
  { id:'public-community-college',name:'Public community college',funding:'One national tuition model per program; need-based aid separate',credentials:['certificate','associate'],role:'degree-awarding',notes:'Offers employment-focused associate degrees and career certificates. University transfer routes are not yet cataloged.' },
  { id:'public-university',name:'Public university',funding:'One national tuition model per program; need-based aid separate',credentials:['bachelor','master','jd','md'],role:'degree-awarding' },
  { id:'private-college',name:'Private college or university',funding:'Private; tuition and institutional aid vary',credentials:['bachelor','master','jd','md'],role:'degree-awarding' },
] as const;
// Flat selectable majors; Information Technology is intentionally listed once.
const majorSeeds = [
  ['accounting-finance','Accounting and Finance','business','Study accounting, financial reporting and financial decisions.'],
  ['computing','Computer Science','technology','Study algorithms, software development and computational systems.'],
  ['engineering','Engineering','engineering','Study engineering systems, design and infrastructure.'],
  ['nursing','Nursing','healthcare','Prepare for nursing practice through a single nursing major.'],
  ['biology','Biology','science','Study living organisms and biological systems.'],
  ['psychology','Psychology','social-science','Study behavior and mental processes.'],
  ['chemistry','Chemistry','science','Study substances, reactions and laboratory methods.'],
  ['economics','Economics','social-science','Study resources, incentives and economic behavior.'],
  ['political-science','Political Science','social-science','Study government and political institutions.'],
  ['communications','Communications','media','Study communication and public messaging.'],
  ['literature','Literature','humanities','Study literature, interpretation and writing.'],
  ['history','History','humanities','Study societies and historical evidence.'],
  ['art-history','Art History','humanities','Study art, visual culture and their historical contexts.'],
  ['graphic-design','Graphic Design','arts','Study visual communication and design.'],
  ['information-technology','Information Technology','technology','Study computer systems, networks and technical support.'],
  ['business','Business Administration','business','Study management and organizational operations.'],
  ['journalism','Journalism','media','Study reporting, research and public information.'],
  ['fine-arts','Fine Arts','arts','Develop visual art and creative practice.'],
  ['music','Music','arts','Study performance, composition and musical practice.'],
  ['mathematics','Mathematics','science','Study mathematical structures and methods.'],
  ['education','Education','education','Study teaching and learning.'],
  ['marketing','Marketing','business','Study customers, communications and brands.'],
  ['anthropology','Anthropology','social-science','Study human cultures and societies.'],
  ['sociology','Sociology','social-science','Study social groups and institutions.'],
  ['criminology','Criminology','social-science','Study crime, criminal behavior and justice systems.'],
  ['philosophy','Philosophy','humanities','Study reasoning, ethics and philosophical thought.'],
  ['theology','Theology','humanities','Study religious traditions and theological thought.'],
  ['kinesiology','Kinesiology','healthcare','Study movement, exercise and physical performance.'],
  ['architecture','Architecture','design','Study buildings, space and architectural design.'],
  ['physics','Physics','science','Study matter, energy, motion and the fundamental laws of nature.'],
  ['dance','Dance','arts','Study dance performance, choreography and movement.'],
  ['hospitality','Hospitality','hospitality','Study lodging, food service, tourism and guest services.'],
] as const;
export type MajorId = typeof majorSeeds[number][0];
export type Major = { id:MajorId; name:string; field:string; description:string };
export const majors: readonly Major[] = majorSeeds.map(([id,name,field,description]) => ({id,name,field,description}));
// Keep the existing computing ID so career references remain compatible.
export const associateMajorIds = [
  'accounting-finance','computing','information-technology','business',
  'marketing','graphic-design','hospitality','education',
  'engineering','criminology','communications','journalism','fine-arts',
  'music','dance','kinesiology',
] as const satisfies readonly MajorId[];
export const certificateMajorIds = [
  'accounting-finance','computing','information-technology','business',
  'marketing','graphic-design','hospitality','education',
] as const satisfies readonly MajorId[];
export type CommunityCollegeProgram = {
  id:string;
  institutionTypeId:'public-community-college';
  credentialId:'associate'|'certificate';
  majorId:MajorId;
  nominalYears:number;
  purpose:'employment';
};
// These awards do not replace bachelor’s or professional credential requirements.
export const communityCollegePrograms: readonly CommunityCollegeProgram[] = [
  ...associateMajorIds.map(majorId => ({id:`associate-${majorId}`,institutionTypeId:'public-community-college' as const,credentialId:'associate' as const,majorId,nominalYears:2,purpose:'employment' as const})),
  ...certificateMajorIds.map(majorId => ({id:`certificate-${majorId}`,institutionTypeId:'public-community-college' as const,credentialId:'certificate' as const,majorId,nominalYears:1,purpose:'employment' as const})),
];
// Nursing is represented only by its major. No additional nursing program needed.
export const educationFundingTypes = ['Household payment','Need-based grant','Merit scholarship','Federal student loan','Employer assistance'] as const;
export const publicSchoolModel = { tuition:'Public K–12 schooling does not charge ordinary tuition; household supplies, transport and activities can cost money.', admission:'One national game enrollment model.', runtimeNote:'The 6/10/14/18 primary, middle, high school and graduation transitions use one national prototype model.' } as const;

// Authored postgraduate routes. Any one listed bachelor major qualifies;
// an empty requiredMajorIds list accepts any cataloged bachelor major.
export const masterBachelorMajorIds = {
 'accounting-finance':['accounting-finance','economics','business'],
 computing:['computing','information-technology','mathematics','engineering'],
 engineering:['engineering'],
 nursing:['nursing'],
 biology:['biology','chemistry'],
 psychology:['psychology','sociology'],
 chemistry:['chemistry','biology'],
 economics:['economics','accounting-finance','mathematics','business'],
 'political-science':['political-science','history','economics','sociology','philosophy'],
 communications:['communications','journalism','marketing','literature'],
 literature:['literature','communications','journalism'],
 history:['history','political-science','anthropology','art-history'],
 'art-history':['art-history','history','fine-arts'],
 'graphic-design':['graphic-design','fine-arts'],
 'information-technology':['information-technology','computing','engineering'],
 business:[],
 journalism:['journalism','communications','literature','political-science','history'],
 'fine-arts':['fine-arts','graphic-design','art-history'],
 music:['music'],
 mathematics:['mathematics','engineering','computing'],
 education:['education','psychology','sociology'],
 marketing:['marketing','business','communications','psychology'],
 anthropology:['anthropology','sociology','history'],
 sociology:['sociology','anthropology','psychology','criminology'],
 criminology:['criminology','sociology','psychology','political-science'],
 philosophy:['philosophy','literature','history','political-science','theology'],
 theology:['theology','philosophy','history'],
 kinesiology:['kinesiology','biology','nursing'],
 architecture:['architecture'],
 physics:['physics','mathematics','engineering'],
 dance:['dance'],
 hospitality:['hospitality','business','marketing']
} as const satisfies Record<MajorId,readonly MajorId[]>;
export type GraduateProgram = {
 id:string;
 name:string;
 credentialId:'master'|'jd'|'md';
 majorId:MajorId|null;
 nominalYears:number;
 institutionTypeIds:readonly ('public-university'|'private-college')[];
 requiredCredentialId:'bachelor';
 requiredMajorIds:readonly MajorId[];
 preferredMajorIds:readonly MajorId[];
 admissionNotes:string;
};
const graduateInstitutions = ['public-university','private-college'] as const;
export const masterPrograms:readonly GraduateProgram[] = majors.map(major=>({
 id:`master-${major.id}`,
 name:`Master’s degree in ${major.name}`,
 credentialId:'master',majorId:major.id,nominalYears:2,
 institutionTypeIds:graduateInstitutions,requiredCredentialId:'bachelor',
 requiredMajorIds:masterBachelorMajorIds[major.id],
 preferredMajorIds:major.id==='business'?['business','accounting-finance','economics','marketing']:[],
 admissionNotes:'Authored national game route. Academic results and program admission are separate future checks. This credential does not award a professional license.'
}));
export const medicalBachelorMajorIds = ['biology','chemistry','nursing','kinesiology','physics'] as const satisfies readonly MajorId[];
export const professionalDegreePrograms:readonly GraduateProgram[] = [
 {id:'law-school',name:'Juris Doctor',credentialId:'jd',majorId:null,nominalYears:3,institutionTypeIds:graduateInstitutions,requiredCredentialId:'bachelor',requiredMajorIds:[],preferredMajorIds:[],admissionNotes:'Any bachelor major. Academic results and law-school admission testing are separate future checks. A national bar examination is required for legal practice; the degree does not grant a license.'},
 {id:'medical-school',name:'Medical degree',credentialId:'md',majorId:null,nominalYears:4,institutionTypeIds:graduateInstitutions,requiredCredentialId:'bachelor',requiredMajorIds:medicalBachelorMajorIds,preferredMajorIds:[],admissionNotes:'Requires a bachelor degree in Biology, Chemistry, Nursing, Kinesiology or Physics. This is an authored game rule with no coursework system. Academic results and medical-school admission testing are separate future checks. Residency and a national medical license are separate from the degree.'}
];
export const graduatePrograms:readonly GraduateProgram[] = [...masterPrograms,...professionalDegreePrograms];
export type GraduateApplicantAward = {credentialId:string;majorId?:string};
export function graduateEducationFit(programId:string,awards:readonly GraduateApplicantAward[]) {
 const program=graduatePrograms.find(item=>item.id===programId);
 if(!program) throw new Error('Unknown graduate program.');
 const bachelors=awards.filter(award=>award.credentialId==='bachelor' && majors.some(major=>major.id===award.majorId));
 return {
  meetsEducationRequirement:bachelors.some(award=>!program.requiredMajorIds.length || program.requiredMajorIds.includes(award.majorId as MajorId)),
  hasPreferredMajor:bachelors.some(award=>program.preferredMajorIds.includes(award.majorId as MajorId))
 };
}
// This checks completed education only, not full admission or professional licensing.
export function meetsGraduateEducation(programId:string,awards:readonly GraduateApplicantAward[]):boolean {
 return graduateEducationFit(programId,awards).meetsEducationRequirement;
}

// Preserve existing program IDs/names while sharing authoritative admission data.
export const trainingPrograms = professionalDegreePrograms.map(program=>({
 ...program,
 name:program.credentialId==='md'?'Medical school':'Law school',
 notes:program.admissionNotes
}));
