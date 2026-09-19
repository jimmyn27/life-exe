import {scheduleHours,scheduleLimit,busyMessage} from './schoolCommitments.ts';
import {partTimeJobs} from './catalogs/us/careers.ts';
import {getOccupation,occupationJobs,withOccupationJobs,type Job} from './occupation.ts';
import {seededRandom} from './family.ts';
import {initializeWorkRelationships} from './relationships.ts';
import type {Life} from './saves';

export function partTimeOffers(life:Life){return partTimeJobs.filter(job=>life.age>=job.minimumAge).filter(job=>job.id==='library-aide'||seededRandom(`${life.id}:${job.id}:${life.age}:availability`)()<.68).map(job=>{const random=seededRandom(`${life.id}:${job.id}:${life.age}:offer`);return {...job,hourlyWage:Math.round(job.hourlyWageRange[0]+random()*(job.hourlyWageRange[1]-job.hourlyWageRange[0])),weeklyHours:10+Math.floor(random()*11)};});}
export function takePartTimeJob(life:Life,id:string):Life{
 if(life.pendingEvent)return life;const offer=partTimeOffers(life).find(j=>j.id===id),occupation=getOccupation(life),jobs=occupationJobs(occupation);
 if(!offer || jobs.some(job=>job.id===id) || projectedJobHours(life,offer.weeklyHours)>scheduleLimit)return life;
 const job:Job={id,position:offer.title,employer:`${offer.title==='Babysitter'||offer.title==='Pet sitter'?'Neighborhood families':'Local '+offer.title.replace(/ worker| assistant| aide| attendant/i,'')}`,salary:Math.round(offer.hourlyWage*offer.weeklyHours*52*100)/100,performance:50,startAge:life.age,hours:`Part-time · ${offer.weeklyHours} hours / week`,hourlyWage:offer.hourlyWage,weeklyHours:offer.weeklyHours};
 return initializeWorkRelationships({...life,occupation:withOccupationJobs(occupation,[...jobs,job]),log:[...life.log,{age:life.age,tag:'WORK',text:`I started working as a ${offer.title.toLowerCase()} for $${offer.hourlyWage.toFixed(0)} an hour, ${offer.weeklyHours} hours a week.`}]});
}
export const yearlyPartTimePay=(jobs:Job[]|Job|null|undefined)=>{const list=Array.isArray(jobs)?jobs:jobs?[jobs]:[];return Math.round(list.reduce((sum,job)=>sum+(job.hourlyWage!==undefined&&job.weeklyHours!==undefined?job.hourlyWage*job.weeklyHours*52:0),0)*100)/100;};

export type WorkAction='Hours'|'Raise'|'Resign'|'Work harder';
export type HoursDirection='more'|'fewer';
export const jobEmoji=(id:string)=>({'babysitter':'🍼','pet-sitter':'🐾','grocery-bagger':'🛒','ice-cream-counter':'🍦','food-counter':'🍔','library-aide':'📚','retail-assistant':'🛍️',cashier:'💳',barista:'☕','office-aide':'📎','movie-theater':'🎬','hotel-reception':'🏨','warehouse-assistant':'📦'} as Record<string,string>)[id]??'💼';
export const projectedJobHours=(life:Life,newHours:number)=>scheduleHours(life)+newHours;
export const alphabeticalPartTimeOffers=(life:Life,query='')=>partTimeOffers(life).filter(j=>j.title.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.title.localeCompare(b.title));
export const workRequestChance=(years:number,performance:number)=>Math.min(.9,.15+Math.max(0,years)*.05+performance*.005);
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const repeatWorkLines=['I had already pushed myself as hard as I could at work this year.','My muscles were sore, and I knew another hard shift would not help.','I tried to work even harder, but I had reached my limit for the year.'];
export function workAction(life:Life,jobId:string,action:WorkAction,direction:HoursDirection='more'):{life:Life;text:string}{
 const occupation=getOccupation(life),jobs=occupationJobs(occupation),index=jobs.findIndex(job=>job.id===jobId),job=jobs[index];const reject=(text:string)=>({life,text});
 if(life.pendingEvent || !job || job.hourlyWage===undefined || job.weeklyHours===undefined)return reject('You do not have that part-time job.');
 if(action==='Resign'){const remaining=jobs.filter((_,jobIndex)=>jobIndex!==index);return {life:{...life,occupation:withOccupationJobs(occupation,remaining),log:[...life.log,{age:life.age,tag:'WORK',text:`I resigned from my job as a ${job.position.toLowerCase()}.`}]},text:'You tendered your resignation.'};}
 const currentActions=job.actionAge===life.age?job.usedActions??[]:[];
 if(action==='Work harder'&&currentActions.includes(action))return reject(repeatWorkLines[Math.floor(seededRandom(`${life.id}:${jobId}:${life.age}:repeat-work`)()*repeatWorkLines.length)]);
 const priorHours=currentActions.includes('Hours');
 if(action==='Hours'&&priorHours)return reject(job.hoursRequestRejectedAge===life.age?'Your manager declined another change to your hours.':'Your manager has already considered an hours request this year.');
 const random=seededRandom(`${life.id}:${job.id}:${life.age}:${action}:${direction}:${life.log.length}:request`);
 const updated:Job={...job,actionAge:life.age,usedActions:[...currentActions,action]};let text='',happiness=0;
 if(action==='Hours'){
  const maxIncrease=Math.min(20-job.weeklyHours,Math.max(0,scheduleLimit-scheduleHours(life))),maxDecrease=job.weeklyHours-10,room=direction==='more'?maxIncrease:maxDecrease;
  if(room<=0)return reject(direction==='more'?(job.weeklyHours>=20?'You already work the maximum 20 hours a week.':busyMessage):'You already work the minimum 10 hours a week.');
  if(random()<workRequestChance(life.age-job.startAge,job.performance)){const change=1+Math.floor(random()*room);updated.weeklyHours=job.weeklyHours+(direction==='more'?change:-change);updated.hours=`Part-time · ${updated.weeklyHours} hours / week`;text=`Your manager approved your request. You now work ${updated.weeklyHours} hours a week.`;}
  else {updated.hoursRequestRejectedAge=life.age;text=`Your manager declined your request for ${direction} hours.`;happiness=-10;}
 }
 if(action==='Raise'){if(currentActions.includes(action))return reject('Your manager asked you to wait before requesting another raise.');if(random()<workRequestChance(life.age-job.startAge,job.performance)){updated.hourlyWage=Math.max(job.hourlyWage+1,Math.round(job.hourlyWage*(1.02+random()*.08)));text=`Your manager approved a raise to $${updated.hourlyWage.toFixed(0)} an hour.`;}else text='Your manager declined your request for a raise.';}
 if(action==='Work harder'){updated.performance=clamp(job.performance+10);happiness=-5;text='You put in extra effort at work.';}
 updated.salary=Math.round(updated.hourlyWage!*updated.weeklyHours!*52*100)/100;
 const nextJobs=jobs.map((item,jobIndex)=>jobIndex===index?updated:item);
 return {life:{...life,stats:{...life.stats,Happiness:clamp(life.stats.Happiness+happiness)},occupation:withOccupationJobs(occupation,nextJobs),log:[...life.log,{age:life.age,tag:'WORK',text:text.replace(/^You were /,'I was ').replace(/^You /,'I ').replace(/Your /g,'My ').replace(/your /g,'my ')}]},text};
}