import { seededRandom } from './family.ts';
import type { Life } from './saves';

export type School = { name: string; level: 'Primary school' | 'Secondary school' | 'University'; startAge: number; duration: number; grades: number; popularity: number; yearActions?: SchoolAction[] };
export type Job = { position: string; employer: string; salary: number; performance: number; startAge: number; hours: string };
export type Occupation = { highestEducation: 'None' | 'Primary school' | 'Secondary school' | 'University'; school: School | null; job: Job | null };
export const university = (age: number): School => ({ name: 'Northbridge University', level: 'University', startAge: age, duration: 4, grades: 78, popularity: 64 });
export const libraryJob = (age: number): Job => ({ position: 'Library assistant', employer: 'Riverside Library', salary: 32000, performance: 72, startAge: age, hours: 'Full time · 35 hours / week' });
export function getOccupation(life: Life): Occupation {
  if (life.occupation) return life.occupation;
  const school: School | null = life.age >= 6 && life.age < 12 ? { name: 'Maplewood Primary School', level: 'Primary school', startAge: 6, duration: 6, grades: initialGrades(life), popularity: 50 } : life.age >= 12 && life.age < 18 ? { name: 'Brookfield Secondary School', level: 'Secondary school', startAge: 12, duration: 6, grades: initialGrades(life), popularity: 50 } : null;
  const result: Occupation = { highestEducation: life.age >= 18 ? 'Secondary school' : life.age >= 12 ? 'Primary school' : 'None', school, job: null };
  const acceptance = life.inbox?.find(mail => mail.event.category === 'University acceptance' && mail.decision === 0);
  const employment = life.inbox?.find(mail => mail.event.category === 'Job offer' && mail.decision === 0);
  if (acceptance) { if (life.age < acceptance.age + 4) result.school = university(acceptance.age); else result.highestEducation = 'University'; }
  if (employment) result.job = libraryJob(employment.age);
  return result;
}
export function advanceOccupation(life: Life, age: number): Occupation {
  const current = getOccupation(life);
  const occupation: Occupation = { ...current, school: current.school ? { ...current.school, yearActions: [] } : null };
  if (occupation.school && age > life.age) {
    const random = seededRandom(`${life.id}:school:${age}`);
    const target = initialGrades(life);
    occupation.school.grades = clamp(Math.round(occupation.school.grades * .8 + target * .2 + (random() * 8 - 4)));
    occupation.school.popularity = clamp(occupation.school.popularity + Math.round(random() * 8 - 4));
  }
  if (occupation.school && age >= occupation.school.startAge + occupation.school.duration) {
    occupation.highestEducation = occupation.school.level;
    occupation.school = null;
  }
  if (age === 6 || age === 12) {
    const next = getOccupation({ ...life, occupation: undefined, inbox: undefined, age }).school;
    if (next && age === 12 && current.school) { next.grades = occupation.school?.grades ?? current.school.grades; next.popularity = occupation.school?.popularity ?? current.school.popularity; }
    occupation.school = next;
  }
  return occupation;
}
export const schoolYear = (life: Life, school: School) => Math.max(1, Math.min(school.duration, life.age - school.startAge + 1));
export type Contact = { name: string; relation: string; strength: number; group: string };
export function occupationContacts(life: Life): { work: Contact[]; school: Contact[] } {
  const occupation = getOccupation(life);
  return {
    work: occupation.job ? [{ name: 'Grace Turner', relation: 'Manager', strength: 62, group: 'Management' }, { name: 'Noah Reed', relation: 'Coworker', strength: 70, group: 'Coworkers' }, { name: 'Priya Shah', relation: 'Coworker', strength: 66, group: 'Coworkers' }] : [],
    school: occupation.school ? [{ name: 'Oliver Patel', relation: 'Classmate', strength: 74, group: 'Classmates' }, { name: 'Sofia Reyes', relation: 'Classmate', strength: 68, group: 'Classmates' }, { name: 'Amelia Brooks', relation: occupation.school.level === 'University' ? 'Professor' : 'Teacher', strength: 61, group: 'Staff' }] : []
  };
}

const clamp = (value: number) => Math.max(0,Math.min(100,value));
function initialGrades(life: Life) { return clamp(Math.round(35 + life.stats.Smarts * .55 + life.stats.Happiness * .1)); }
export type SchoolAction = 'Study hard' | 'Join an activity';
export function schoolStage(life: Life, school: School): string { return school.level === 'University' ? 'University' : life.age < 12 ? 'Elementary school' : life.age < 15 ? 'Middle school' : 'High school'; }
export function schoolName(life: Life, school: School): string { return school.level === 'University' ? school.name : life.age < 12 ? 'Maplewood Elementary School' : life.age < 15 ? 'Brookfield Middle School' : 'Brookfield High School'; }
export function schoolAction(life: Life, action: SchoolAction): Life {
  const occupation = getOccupation(life);
  const school = occupation.school;
  if (life.pendingEvent || !school || !['Study hard','Join an activity'].includes(action) || school.yearActions?.includes(action)) return life;
  const studying = action === 'Study hard';
  return {...life,stats:{...life.stats,Smarts:clamp(life.stats.Smarts+(studying ? 2 : 0)),Happiness:clamp(life.stats.Happiness+(studying ? -1 : 2))},occupation:{...occupation,school:{...school,grades:clamp(school.grades+(studying ? 5 : 0)),popularity:clamp(school.popularity+(studying ? 0 : 5)),yearActions:[...(school.yearActions ?? []),action]}},log:[...life.log,{age:life.age,tag:'EDUCATION',text:studying ? 'I studied hard and improved my grades.' : 'I joined a school activity and got to know my classmates.'}]};
}
