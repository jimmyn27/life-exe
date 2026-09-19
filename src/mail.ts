import {seededRandom} from './family.ts';
import {yearlyPartTimePay} from './partTimeWork.ts';
import {initializeWorkRelationships} from './relationships.ts';
import {advanceFriendships,resolveFriendship} from './friendships.ts';
import {advanceCommitments} from './schoolCommitments.ts';
import { advanceFamily } from './family.ts';
import type { Life } from './saves';
import type { LifeEvent } from './data';
import { advanceOccupation, schoolPopularity, getOccupation, university, libraryJob } from './occupation.ts';
import { eventForAge } from './lifeEvents.ts';

export type LifeMail = { id: string; age: number; sender: string; read: boolean; archived?: boolean; event: LifeEvent; decision?: number };
export type PendingLifeEvent = { age: number; event: LifeEvent; queue?: LifeEvent[] };
export const hasRequiredDecisions = (life: Life) => Boolean(life.pendingEvent || life.inbox?.some(mail => mail.decision === undefined));
export function mailForAge(age: number): { sender: string; event: LifeEvent }[] {
  if (age === 19) return [{ sender: 'Northbridge University · Admissions', event: { category: 'University acceptance', title: 'Your university acceptance', text: 'Congratulations! Northbridge University has offered you a place on its undergraduate program. Please respond to your offer.', choices: [
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
  life=initializeWorkRelationships(life);
  const age = life.age + 1;
  const random=seededRandom(`${life.id}:${age}:yearly-stats`);
  const yearlyStats={...life.stats,Looks:Math.max(0,Math.min(100,life.stats.Looks+(random()<.5?-1:1))),Smarts:Math.max(0,Math.min(100,life.stats.Smarts+(random()<.5?-1:1)))};
  const pay=yearlyPartTimePay(getOccupation(life).job);
  const event: LifeEvent = age === 18 && !getOccupation(life).droppedOut ? { category: 'Education', title: 'Congratulations, graduate!', text: 'You have graduated from high school. A whole new chapter is ahead. How would you like to celebrate?', choices: [
    { label: 'Celebrate with friends', hint: 'Share this moment.', outcome: 'I graduated from high school. I celebrated with my friends.', effect: { Happiness: 4 } },
    { label: 'Enjoy a family dinner', hint: 'Thank the people who supported you.', outcome: 'I graduated from high school. I celebrated with my family.', effect: { Happiness: 3 } }
  ] } : eventForAge(getOccupation(life).droppedOut?Math.max(age,18):age,life.id,Boolean(life.family?.siblings?.length));
  const growth=advanceFamily(life.family,life.id,age,life.lastName??life.name.split(' ').slice(1).join(' '));
  const birth:LifeEvent|undefined=growth.newborn?{category:'Family',title:'A new sibling!',text:`Your mother gave birth to ${growth.newborn.name}, your new ${growth.newborn.gender==='Male'?'brother':'sister'}.`,choices:[{label:'Welcome to the family',hint:'Meet your new sibling.',outcome:`My ${growth.newborn.gender==='Male'?'brother':'sister'} ${growth.newborn.name} was born.`}]}:undefined;
  const next:Life={ ...life, ...(growth.family?{family:growth.family}:{}), age,stats:yearlyStats,balance:Math.round((life.balance+pay)*100)/100, log:[...life.log,...(pay?[{age,tag:'WORK',text:`I earned $${pay.toFixed(2)} from my part-time job this year.`}]:[]),...growth.promotions.map(parent=>({age,tag:'LIFE',text:`My ${parent.relation.toLowerCase()} has been promoted to ${parent.occupation}.`}))], occupation: advanceOccupation({...life,stats:yearlyStats}, age), pendingEvent: birth ? {age,event:birth,queue:[event]} : { age, event }, inbox: [...(life.inbox ?? []), ...(deliverMail ? mailForAge(age) : []).map((mail, index) => ({ ...mail, id: `${life.id}:mail:${age}:${index}`, age, read: false }))] };
  const friendships=advanceFriendships(advanceCommitments(life,next));if(friendships.life.occupation?.school)friendships.life.occupation.school={...friendships.life.occupation.school,popularity:schoolPopularity(friendships.life,friendships.life.occupation.school)};const events=[...friendships.events,...(birth?[birth]:[]),event];return {...friendships.life,pendingEvent:{age,event:events[0],...(events.length>1?{queue:events.slice(1)}:{})}};
}
export function answerLifeEvent(life: Life, decision: number): Life {
  const pending = life.pendingEvent;
  if (!pending || !Number.isInteger(decision) || !pending.event.choices[decision]) return life;
  const choice = pending.event.choices[decision];
  if(choice.friendshipDecision){const resolved=resolveFriendship(life,choice.friendshipDecision.id,choice.friendshipDecision.salvage);if(resolved.occupation?.school)resolved.occupation={...resolved.occupation,school:{...resolved.occupation.school,popularity:schoolPopularity(resolved,resolved.occupation.school)}};const next=resolved.pendingEvent?.queue;return {...resolved,pendingEvent:next?.length?{age:pending.age,event:next[0],...(next.length>1?{queue:next.slice(1)}:{})}:undefined};}
  const stats = { ...life.stats };
  for (const key of Object.keys(choice.effect ?? {}) as (keyof typeof stats)[]) stats[key] = Math.max(0, Math.min(100, (stats[key] ?? (key==='Athleticism'?50:0)) + (choice.effect?.[key] ?? 0)));
  const relationships={...life.relationships};
  if(choice.familyEffect && life.family){
    const apply=(member:{id:string;stats:import('./data').Stats},delta:number|undefined)=>{if(!delta)return;const old=relationships[member.id];relationships[member.id]={...old,strength:Math.max(0,Math.min(100,(old?.strength??100)+delta)),status:old?.status??'friend',friendship:old?.friendship??true,stats:old?.stats??member.stats};};
    for(const parent of life.family.parents)apply(parent,choice.familyEffect.parents);
    for(const sibling of life.family.siblings??[])apply(sibling,choice.familyEffect.siblings);
  }
  const occupation = { ...getOccupation(life) };
  if (occupation.school && choice.schoolEffect) {
    const school = { ...occupation.school };
    for (const key of ['grades'] as const) school[key] = Math.max(0,Math.min(100,school[key] + (choice.schoolEffect[key] ?? 0)));
    occupation.school = school;
  }
  return { ...life, pendingEvent: pending.queue?.length ? {age:pending.age,event:pending.queue[0],...(pending.queue.length>1?{queue:pending.queue.slice(1)}:{})} : undefined, stats, relationships, occupation, log: [...life.log, { age: pending.age, tag: 'LIFE', text: choice.outcome }] };
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
  for (const key of Object.keys(choice.effect ?? {}) as (keyof typeof stats)[]) stats[key] = Math.max(0, Math.min(100, (stats[key] ?? (key==='Athleticism'?50:0)) + (choice.effect?.[key] ?? 0)));
  const occupation = { ...getOccupation(life) };
  if (decision === 0 && mail.event.category === 'University acceptance') occupation.school = university(life.age);
  if (decision === 0 && mail.event.category === 'Job offer') occupation.job = libraryJob(life.age);
  return { ...life, occupation, stats, inbox: life.inbox!.map(item => item.id === id ? { ...item, read: true, decision } : item), log: [...life.log, { age: mail.age, tag: 'LIFE', text: choice.outcome }] };
}
