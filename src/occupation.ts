import {initialRelationship} from './relationshipModel.ts';
import {advanceClassmate} from './npcSchool.ts';
import {advanceSchoolRoster,initialSchoolRoster,type SchoolPerson} from './schoolCommunity.ts';
import { familyMoney, seededRandom } from './family.ts';
import type { Life } from './saves';

export type School = { name: string; level: 'Primary school' | 'Middle school' | 'Secondary school' | 'University'; startAge: number; duration: number; grades: number; popularity: number; transfers?:number; danceAskedIds?:string[]; yearActions?: SchoolAction[]; roster?: SchoolPerson[]; activityDetails?:Record<string,import('./schoolCommitments').Membership>; memberships?: string[]; activityAttempts?: Record<string,{age:number;accepted:boolean}> };
export type Job = { position: string; employer: string; salary: number; performance: number; startAge: number; hours: string };
export type Occupation = { highestEducation: 'None' | 'Primary school' | 'Middle school' | 'Secondary school' | 'University'; school: School | null; job: Job | null; droppedOut?:boolean };
export const university = (age: number): School => ({ name: 'Northbridge University', level: 'University', startAge: age, duration: 4, grades: 78, popularity: 64 });
export const libraryJob = (age: number): Job => ({ position: 'Library assistant', employer: 'Riverside Library', salary: 32000, performance: 72, startAge: age, hours: 'Full time · 35 hours / week' });
export function schoolPopularity(life:Life,school:School):number {
 const classmates=(school.roster??initialSchoolRoster(life.id,life.age,life.stats.Looks)).filter(p=>p.relation==='Classmate');
 return classmates.length?Math.round(classmates.reduce((total,p)=>total+(life.relationships?.[p.id]?.strength??p.strength),0)/classmates.length*10)/10:0;
}
function withPopularity(life:Life,occupation:Occupation):Occupation {return occupation.school?{...occupation,school:{...occupation.school,popularity:schoolPopularity(life,occupation.school)}}:occupation;}
export function getOccupation(life: Life): Occupation {
  if (life.occupation) {
    const saved=life.occupation;
    if(saved.school && saved.school.level!=='University' && life.age>=6 && life.age<18){
      const level=life.age<10?'Primary school':life.age<14?'Middle school':'Secondary school';
      const changed=saved.school.level!==level;
      return withPopularity(life,{...saved,highestEducation:life.age<10?'None':life.age<14?'Primary school':'Middle school',school:{...saved.school,level,startAge:life.age<10?6:life.age<14?10:14,duration:4,roster:changed?initialSchoolRoster(life.id,life.age,life.stats.Looks):saved.school.roster??initialSchoolRoster(life.id,life.age,life.stats.Looks),...(changed?{name:life.age<10?'Maplewood Elementary School':life.age<14?'Brookfield Middle School':'Brookfield High School',grades:initialGrades(life),memberships:[],activityDetails:{},activityAttempts:{}}:{})}});
    }
    return withPopularity(life,{...saved,school:saved.school?{...saved.school,roster:saved.school.roster??initialSchoolRoster(life.id,life.age,life.stats.Looks)}:null});
  }
  const school: School | null = life.age >= 6 && life.age < 10 ? { name: 'Maplewood Elementary School', level: 'Primary school', startAge: 6, duration: 4, grades: initialGrades(life), popularity: 50 } : life.age >= 10 && life.age < 18 ? { name: life.age<14?'Brookfield Middle School':'Brookfield High School', level: life.age<14?'Middle school':'Secondary school', startAge: life.age<14?10:14, duration: 4, grades: initialGrades(life), popularity: 50 } : null;
  const result: Occupation = { highestEducation: life.age >= 18 ? 'Secondary school' : life.age >= 14 ? 'Middle school' : life.age >= 10 ? 'Primary school' : 'None', school, job: null };
  const acceptance = life.inbox?.find(mail => mail.event.category === 'University acceptance' && mail.decision === 0);
  const employment = life.inbox?.find(mail => mail.event.category === 'Job offer' && mail.decision === 0);
  if (acceptance) { if (life.age < acceptance.age + 4) result.school = university(acceptance.age); else result.highestEducation = 'University'; }
  if (employment) result.job = libraryJob(employment.age);
  if(result.school) result.school.roster=initialSchoolRoster(life.id,life.age,life.stats.Looks);
  return withPopularity(life,result);
}
export function advanceOccupation(life: Life, age: number): Occupation {
  const current = getOccupation(life);
  const occupation: Occupation = { ...current, school: current.school ? { ...current.school, yearActions: [], activityAttempts:{}, danceAskedIds:[], roster:advanceSchoolRoster(life.id,age,current.school.roster,life.stats.Looks) } : null };
  if (occupation.school && age >= occupation.school.startAge + occupation.school.duration) {
    if(occupation.school.level!=='Secondary school' || age>=18) occupation.highestEducation = occupation.school.level;
    occupation.school = null;
  }
  if (!occupation.droppedOut && (age === 6 || age === 10 || age === 14)) {
    const next = getOccupation({ ...life, occupation: undefined, inbox: undefined, age }).school;
    if(next && current.school?.roster) next.roster=advanceSchoolRoster(life.id,age,current.school.roster,life.stats.Looks);
    occupation.school = next;
  }
  return withPopularity({...life,age},occupation);
}
export const schoolYear = (life: Life, school: School) => Math.max(1, Math.min(school.duration, life.age - school.startAge + 1));
export type Contact = { id?: string; gender?: string; ageOffset?: number; subject?: string; name: string; relation: string; strength: number; group: string };
export function occupationContacts(life: Life): { work: Contact[]; school: Contact[] } {
  const occupation = getOccupation(life);
  return {
    work: occupation.job ? [{ name: 'Grace Turner', relation: 'Manager', strength: initialRelationship(life.id,'grace-turner',life.stats.Looks), group: 'Management' }, { name: 'Noah Reed', relation: 'Coworker', strength: initialRelationship(life.id,'noah-reed',life.stats.Looks), group: 'Coworkers' }, { name: 'Priya Shah', relation: 'Coworker', strength: initialRelationship(life.id,'priya-shah',life.stats.Looks), group: 'Coworkers' }] : [],
    school: occupation.school ? occupation.school.roster??initialSchoolRoster(life.id,life.age,life.stats.Looks) : [],
  };
}

const clamp = (value: number) => Math.max(0,Math.min(100,value));
function initialGrades(life: Life) { return clamp(life.stats.Smarts); }
export type SchoolAction = 'Study harder' | 'Study hard' | 'Join an activity' | 'Change schools' | 'Drop out' | 'Nurse' | 'Skip school' | 'School dance';
export const schoolActions=(age:number):SchoolAction[]=>age<10?['Change schools','Drop out','Nurse','Study harder']:age<14?['Change schools','Drop out','Nurse','Skip school','Study harder']:['Change schools','Nurse','School dance','Drop out','Skip school','Study harder'];
export function schoolStage(life: Life, school: School): string { return school.level === 'University' ? 'University' : life.age < 10 ? 'Elementary school' : life.age < 14 ? 'Middle school' : 'High school'; }
export function schoolName(_life: Life, school: School): string { return school.name; }
export function schoolAction(life: Life, requested: SchoolAction): Life {
 const action=requested==='Study hard'?'Study harder':requested,occupation=getOccupation(life),school=occupation.school;
 if(life.pendingEvent || !school || ![...schoolActions(life.age),'Join an activity'].includes(action) || action==='Join an activity' && life.age<10 || action==='Drop out' && life.age<16 || action==='School dance')return life;
 if(school.yearActions?.includes(action) || action==='Study harder' && school.yearActions?.includes('Study hard'))return life;
 const stats={...life.stats},nextSchool={...school,yearActions:[...(school.yearActions??[]),action]},nextOccupation:Occupation={...occupation,school:nextSchool};
 const random=seededRandom(`${life.id}:school-action:${life.age}:${action}`);
 let text='';
 if(action==='Study harder'){stats.Smarts=clamp(stats.Smarts+2);nextSchool.grades=clamp(school.grades+5);text='I studied harder and improved my grades and smarts.';}
 if(action==='Join an activity'){stats.Happiness=clamp(stats.Happiness+2);text='I joined a school activity.';}
 if(action==='Nurse'){stats.Health=clamp(stats.Health+5);text='I visited the school nurse and felt healthier.';}
 if(action==='Skip school'){stats.Happiness=clamp(stats.Happiness+4);if(random()<.4)stats.Smarts=clamp(stats.Smarts-2);nextSchool.grades=clamp(school.grades-5);text='I skipped school. It was fun, but my grades suffered.';}
 if(action==='Drop out'){nextOccupation.school=null;nextOccupation.droppedOut=true;text='I dropped out of high school without a diploma.';}
 if(action==='Change schools'){
  const parents=life.family?.parents??[];const relationship=parents.length?parents.reduce((sum,p)=>sum+(life.relationships?.[p.id]?.strength??(p.relation==='Mother'?86:79)),0)/parents.length:70;
  const allowed=random()<Math.min(.95,.1+relationship/150+familyMoney(life.family)/400);
  if(allowed){const serial=(school.transfers??0)+1;nextSchool.transfers=serial;const names=['Pinecrest','Riverside','Oakridge','Cedar Grove'];nextSchool.name=`${names[(serial-1)%names.length]} ${schoolStage(life,school)}`;nextSchool.roster=initialSchoolRoster(`${life.id}:transfer:${serial}`,life.age,life.stats.Looks).map(p=>advanceClassmate({...p,id:`transfer-${serial}-${p.id}`,gradeAge:undefined},life.id,life.age,true));nextSchool.memberships=[];nextSchool.activityDetails={};nextSchool.activityAttempts={};text=`My parents agreed to change schools. I enrolled at ${nextSchool.name}.`;}
  else text='My parents declined my request to change schools.';
 }
 if(nextOccupation.school)nextOccupation.school.popularity=schoolPopularity(life,nextOccupation.school);
 return {...life,stats,occupation:nextOccupation,log:[...life.log,{age:life.age,tag:'EDUCATION',text}]};
}
