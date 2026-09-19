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

export type WorkAction='Hours'|'Fewer hours'|'Raise'|'Resign'|'Work harder';
export const jobEmoji=(id:string)=>({'babysitter':'🍼','pet-sitter':'🐾','grocery-bagger':'🛒','ice-cream-counter':'🍦','food-counter':'🍔','library-aide':'📚','retail-assistant':'🛍️',cashier:'💳',barista:'☕','office-aide':'📎','movie-theater':'🎬','hotel-reception':'🏨','warehouse-assistant':'📦'} as Record<string,string>)[id]??'💼';
export const projectedJobHours=(life:Life,newHours:number)=>{const job=getOccupation(life).job;const oldHours=job?job.weeklyHours??Number(job.hours.match(/(\d+)\s*hours/i)?.[1]??40):0;return scheduleHours(life)-oldHours+newHours;};
export const alphabeticalPartTimeOffers=(life:Life,query='')=>partTimeOffers(life).filter(j=>j.title.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.title.localeCompare(b.title));
export const workRequestChance=(years:number,performance:number)=>Math.min(.9,.15+Math.max(0,years)*.05+performance*.005);
export function workAction(life:Life,action:WorkAction):{life:Life;text:string}{
 const occupation=getOccupation(life),job=occupation.job;const reject=(text:string)=>({life,text});
 if(life.pendingEvent || !job || job.hourlyWage===undefined || job.weeklyHours===undefined)return reject('You do not have a part-time job.');
 if(action==='Resign')return {life:{...life,occupation:{...occupation,job:null},log:[...life.log,{age:life.age,tag:'WORK',text:`I resigned from my job as a ${job.position.toLowerCase()}.`}]},text:'You tendered your resignation.'};
 const currentActions=job.actionAge===life.age?job.usedActions??[]:[];
 if(action==='Work harder' && currentActions.includes(action))return reject('You put in extra effort, but already received the performance benefit this year.');
 const hoursRequest=['Hours','Fewer hours'].includes(action),priorHours=currentActions.some(a=>a==='Hours'||a==='Fewer hours');
 if(hoursRequest && priorHours)return reject(job.hoursRequestRejectedAge===life.age?`Your manager declined your request for ${action==='Hours'?'more':'fewer'} hours again.`:`Your manager has already considered your hours request this year.`);
 const random=seededRandom(`${life.id}:${job.id}:${life.age}:${action}:${life.log.length}:request`);
 const success=!priorHours && random()<workRequestChance(life.age-job.startAge,job.performance);
 const updated={...job,actionAge:life.age,usedActions:[...currentActions,action]};let text='',happiness=0;
 if(hoursRequest){
  const maxIncrease=Math.min(20-job.weeklyHours,Math.max(0,scheduleLimit-scheduleHours(life))),maxDecrease=job.weeklyHours-10;
  const room=action==='Hours'?maxIncrease:maxDecrease;
  if(room<=0)return reject(action==='Hours'?(job.weeklyHours>=20?'You already work the maximum 20 hours a week.':busyMessage):'You already work the minimum 10 hours a week.');
  if(success){const change=1+Math.floor(random()*room);updated.weeklyHours=job.weeklyHours+(action==='Hours'?change:-change);updated.hours=`Part-time · ${updated.weeklyHours} hours / week`;text=`Your manager approved your request. You now work ${updated.weeklyHours} hours a week.`;}
  else {updated.hoursRequestRejectedAge=life.age;text=`Your manager declined your request for ${action==='Hours'?'more':'fewer'} hours.`;happiness=-10;}
 }
 if(action==='Raise'){if(currentActions.includes(action))return reject('You already made this request this year.');if(random()<workRequestChance(life.age-job.startAge,job.performance)){updated.hourlyWage=Math.round(job.hourlyWage*(1.02+random()*.08)*100)/100;text=`Your manager approved a raise to $${updated.hourlyWage.toFixed(2)} an hour.`;}else text='Your manager declined your request for a raise.';}
 if(action==='Work harder'){updated.performance=Math.min(100,job.performance+10);happiness=-5;text='You put in extra effort at work.';}
 updated.salary=Math.round(updated.hourlyWage!*updated.weeklyHours!*52*100)/100;
 return {life:{...life,stats:{...life.stats,Happiness:Math.max(0,Math.min(100,life.stats.Happiness+happiness))},occupation:{...occupation,job:updated},log:[...life.log,{age:life.age,tag:'WORK',text:text.replace(/^You were /,'I was ').replace(/^You /,'I ').replace(/Your /g,'My ').replace(/your /g,'my ')}]},text};
}
