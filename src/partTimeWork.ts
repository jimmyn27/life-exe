import {scheduleHours,scheduleLimit,busyMessage} from './schoolCommitments.ts';
import {partTimeJobs} from './catalogs/us/careers.ts';
import {getOccupation,type Job} from './occupation.ts';
import {seededRandom} from './family.ts';
import {initializeWorkRelationships} from './relationships.ts';
import type {Life} from './saves';
export function partTimeOffers(life:Life){return partTimeJobs.filter(job=>life.age>=job.minimumAge).map(job=>{const random=seededRandom(`${life.id}:${job.id}:${life.age}:offer`);return {...job,hourlyWage:Math.round((job.hourlyWageRange[0]+random()*(job.hourlyWageRange[1]-job.hourlyWageRange[0]))*100)/100,weeklyHours:10+Math.floor(random()*11)};});}
export function takePartTimeJob(life:Life,id:string):Life{if(life.pendingEvent)return life;const offer=partTimeOffers(life).find(j=>j.id===id);if(!offer || projectedJobHours(life,offer.weeklyHours)>scheduleLimit)return life;const occupation=getOccupation(life);if(occupation.job?.id===id)return life;
 const job:Job={id,position:offer.title,employer:`${offer.title==='Babysitter'||offer.title==='Pet sitter'?'Neighborhood families':'Local '+offer.title.replace(/ worker| assistant| aide| attendant/i,'')}`,salary:Math.round(offer.hourlyWage*offer.weeklyHours*52*100)/100,performance:50,startAge:life.age,hours:`Part-time · ${offer.weeklyHours} hours / week`,hourlyWage:offer.hourlyWage,weeklyHours:offer.weeklyHours};
 return initializeWorkRelationships({...life,occupation:{...occupation,job},log:[...life.log,{age:life.age,tag:'WORK',text:`I started working as a ${offer.title.toLowerCase()} for $${offer.hourlyWage.toFixed(2)} an hour, ${offer.weeklyHours} hours a week.`}]});}
export const yearlyPartTimePay=(job:Job|null|undefined)=>job?.hourlyWage!==undefined && job.weeklyHours!==undefined?Math.round(job.hourlyWage*job.weeklyHours*52*100)/100:0;

export type WorkAction='Hours'|'Raise'|'Resign'|'Work harder';
export const jobEmoji=(id:string)=>({'babysitter':'🍼','pet-sitter':'🐾','grocery-bagger':'🛒','ice-cream-counter':'🍦','food-counter':'🍔','library-aide':'📚','retail-assistant':'🛍️',cashier:'💳',barista:'☕','office-aide':'📎','movie-theater':'🎬','hotel-reception':'🏨','warehouse-assistant':'📦'} as Record<string,string>)[id]??'💼';
export const projectedJobHours=(life:Life,newHours:number)=>{const job=getOccupation(life).job;const oldHours=job?job.weeklyHours??Number(job.hours.match(/(\d+)\s*hours/i)?.[1]??40):0;return scheduleHours(life)-oldHours+newHours;};
export const alphabeticalPartTimeOffers=(life:Life,query='')=>partTimeOffers(life).filter(j=>j.title.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.title.localeCompare(b.title));
export const workRequestChance=(years:number,performance:number)=>Math.min(.9,.15+Math.max(0,years)*.05+performance*.005);
export function workAction(life:Life,action:WorkAction):{life:Life;text:string}{
 const occupation=getOccupation(life),job=occupation.job;const reject=(text:string)=>({life,text});
 if(life.pendingEvent || !job || job.hourlyWage===undefined || job.weeklyHours===undefined)return reject('You do not have a part-time job.');
 if(action==='Resign')return {life:{...life,occupation:{...occupation,job:null},log:[...life.log,{age:life.age,tag:'WORK',text:`I resigned from my job as a ${job.position.toLowerCase()}.`}]},text:'You tendered your resignation.'};
 if(job.actionAge===life.age && job.usedActions?.includes(action))return reject(action==='Work harder'?'You put in extra effort, but already received the performance benefit this year.':'You already made this request this year.');
 const random=seededRandom(`${life.id}:${job.id}:${life.age}:${action}:request`);const success=random()<workRequestChance(life.age-job.startAge,job.performance);
 const updated={...job,actionAge:life.age,usedActions:[...(job.actionAge===life.age?job.usedActions??[]:[]),action]};let text='';
 if(action==='Hours'){const max=Math.min(20,job.weeklyHours+Math.max(0,scheduleLimit-scheduleHours(life)));if(max<=job.weeklyHours)return reject(job.weeklyHours>=20?'You already work the maximum 20 hours a week.':busyMessage);if(success){updated.weeklyHours=Math.min(max,job.weeklyHours+1+Math.floor(random()*3));updated.hours=`Part-time · ${updated.weeklyHours} hours / week`;text=`You were given more hours and now work ${updated.weeklyHours} hours a week.`;}else text='Your manager declined your request for more hours.';}
 if(action==='Raise'){if(success){updated.hourlyWage=Math.round(job.hourlyWage*(1.02+random()*.08)*100)/100;text=`Your manager approved a raise to $${updated.hourlyWage.toFixed(2)} an hour.`;}else text='Your manager declined your request for a raise.';}
 if(action==='Work harder'){updated.performance=Math.min(100,job.performance+5);text='You put in extra effort at work.';}
 updated.salary=Math.round(updated.hourlyWage!*updated.weeklyHours!*52*100)/100;
 return {life:{...life,occupation:{...occupation,job:updated},log:[...life.log,{age:life.age,tag:'WORK',text:text.replace(/^You were /,'I was ').replace(/^You /,'I ').replace(/Your /g,'My ').replace(/your /g,'my ')}]},text};
}
