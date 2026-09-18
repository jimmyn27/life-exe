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
  ['human-resources','Human Resources','business','Study staffing, employee relations and organizational development.'],
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
export const trainingPrograms = [
  { id:'medical-school',name:'Medical school',credentialId:'md',nominalYears:4,notes:'Undergraduate prerequisites, admission, residency and one national game license are separate.' },
  { id:'law-school',name:'Law school',credentialId:'jd',nominalYears:3,notes:'Game route follows a bachelor’s degree and requires one national bar examination.' },
] as const;
export const educationFundingTypes = ['Household payment','Need-based grant','Merit scholarship','Federal student loan','Employer assistance'] as const;
export const publicSchoolModel = { tuition:'Public K–12 schooling does not charge ordinary tuition; household supplies, transport and activities can cost money.', admission:'One national game enrollment model.', runtimeNote:'The existing 6/12/18 school transitions remain the national prototype model.' } as const;
