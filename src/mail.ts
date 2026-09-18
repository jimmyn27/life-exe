import type { Life } from './saves';
import type { LifeEvent } from './data';
import { advanceOccupation, getOccupation, university, libraryJob } from './occupation.ts';
import { eventForAge } from './lifeEvents.ts';

export type LifeMail = { id: string; age: number; sender: string; read: boolean; archived?: boolean; event: LifeEvent; decision?: number };
export type PendingLifeEvent = { age: number; event: LifeEvent };
export const hasRequiredDecisions = (life: Life) => Boolean(life.pendingEvent || life.inbox?.some(mail => mail.decision === undefined));
export function mailForAge(age: number): { sender: string; event: LifeEvent }[] {
  if (age === 19) return [{ sender: 'Northbridge University · Admissions', event: { category: 'University acceptance', title: 'Your university acceptance', text: 'Congratulations! Northbridge University has offered you a place on its undergraduate programme. Please respond to your offer.', choices: [
    { label: 'Accept the place', hint: 'Begin a new chapter in education.', outcome: 'I accepted my place at Northbridge University.', effect: { Smarts: 3, Happiness: 3 } },
    { label: 'Decline the place', hint: 'Choose a different path.', outcome: 'I declined my university offer.' }
  ] } }];
  if (age === 20) return [{ sender: 'Riverside Library · Recruitment', event: { category: 'Job offer', title: 'Job offer: Library assistant', text: 'We are pleased to offer you the position of Library assistant at Riverside Library. Please let us know whether you would like to accept.', choices: [
    { label: 'Accept the offer', hint: 'Take the opportunity.', outcome: 'I accepted a job offer as a library assistant.', effect: { Happiness: 3 } },
    { label: 'Decline the offer', hint: 'Keep looking for an opportunity.', outcome: 'I declined the library assistant job offer.' }
  ] } }];
  return [];
}
export function advanceYear(life: Life, deliverMail = false): Life {
  if (life.pendingEvent || deliverMail && hasRequiredDecisions(life) || life.age >= 1000) return life;
  const age = life.age + 1;
  const event: LifeEvent = age === 18 ? { category: 'Education', title: 'Congratulations, graduate!', text: 'You have graduated from high school. A whole new chapter is ahead. How would you like to celebrate?', choices: [
    { label: 'Celebrate with friends', hint: 'Share this moment.', outcome: 'I graduated from high school. I celebrated with my friends.', effect: { Happiness: 4 } },
    { label: 'Enjoy a family dinner', hint: 'Thank the people who supported you.', outcome: 'I graduated from high school. I celebrated with my family.', effect: { Happiness: 3 } }
  ] } : eventForAge(age);
  return { ...life, age, occupation: advanceOccupation(life, age), pendingEvent: { age, event }, inbox: [...(life.inbox ?? []), ...(deliverMail ? mailForAge(age) : []).map((mail, index) => ({ ...mail, id: `${life.id}:mail:${age}:${index}`, age, read: false }))] };
}
export function answerLifeEvent(life: Life, decision: number): Life {
  const pending = life.pendingEvent;
  if (!pending || !Number.isInteger(decision) || !pending.event.choices[decision]) return life;
  const choice = pending.event.choices[decision];
  const stats = { ...life.stats };
  for (const key of Object.keys(choice.effect ?? {}) as (keyof typeof stats)[]) stats[key] = Math.max(0, Math.min(100, stats[key] + (choice.effect?.[key] ?? 0)));
  const occupation = { ...getOccupation(life) };
  if (occupation.school && choice.schoolEffect) {
    const school = { ...occupation.school };
    for (const key of ['grades','popularity'] as const) school[key] = Math.max(0,Math.min(100,school[key] + (choice.schoolEffect[key] ?? 0)));
    occupation.school = school;
  }
  return { ...life, pendingEvent: undefined, stats, occupation, log: [...life.log, { age: pending.age, tag: 'LIFE', text: choice.outcome }] };
}
export function setMailRead(life: Life, id: string, read: boolean): Life {
  return { ...life, inbox: life.inbox?.map(mail => mail.id === id ? { ...mail, read } : mail) };
}
export function archiveMail(life: Life, id: string, archived: boolean): Life {
  const mail = life.inbox?.find(item => item.id === id);
  if (!mail || mail.decision === undefined) return life;
  return { ...life, inbox: life.inbox?.map(item => item.id === id ? { ...item, archived } : item) };
}
export function answerMail(life: Life, id: string, decision: number): Life {
  const mail = life.inbox?.find(item => item.id === id);
  if (!mail || mail.decision !== undefined || !Number.isInteger(decision) || !mail.event.choices[decision]) return life;
  const choice = mail.event.choices[decision];
  const stats = { ...life.stats };
  for (const key of Object.keys(choice.effect ?? {}) as (keyof typeof stats)[]) stats[key] = Math.max(0, Math.min(100, stats[key] + (choice.effect?.[key] ?? 0)));
  const occupation = { ...getOccupation(life) };
  if (decision === 0 && mail.event.category === 'University acceptance') occupation.school = university(life.age);
  if (decision === 0 && mail.event.category === 'Job offer') occupation.job = libraryJob(life.age);
  return { ...life, occupation, stats, inbox: life.inbox!.map(item => item.id === id ? { ...item, read: true, decision } : item), log: [...life.log, { age: mail.age, tag: 'LIFE', text: choice.outcome }] };
}
