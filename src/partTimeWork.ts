import {partTimeJobs} from './catalogs/us/careers.ts';
import {getOccupation,type Job} from './occupation.ts';
import {seededRandom} from './family.ts';
import {initializeWorkRelationships} from './relationships.ts';
import type {Life} from './saves';
export function partTimeOffers(life:Life){return partTimeJobs.filter(job=>life.age>=job.minimumAge).map(job=>{const random=seededRandom(`${life.id}:${job.id}:${life.age}:offer`);return {...job,hourlyWage:Math.round((job.hourlyWageRange[0]+random()*(job.hourlyWageRange[1]-job.hourlyWageRange[0]))*100)/100,weeklyHours:10+Math.floor(random()*11)};});}
export function takePartTimeJob(life:Life,id:string):Life{if(life.pendingEvent)return life;const offer=partTimeOffers(life).find(j=>j.id===id);if(!offer)return life;const occupation=getOccupation(life);if(occupation.job?.id===id)return life;
 const job:Job={id,position:offer.title,employer:`${offer.title==='Babysitter'||offer.title==='Pet sitter'?'Neighborhood families':'Local '+offer.title.replace(/ worker| assistant| aide| attendant/i,'')}`,salary:Math.round(offer.hourlyWage*offer.weeklyHours*52*100)/100,performance:50,startAge:life.age,hours:`Part-time · ${offer.weeklyHours} hours / week`,hourlyWage:offer.hourlyWage,weeklyHours:offer.weeklyHours};
 return initializeWorkRelationships({...life,occupation:{...occupation,job},log:[...life.log,{age:life.age,tag:'WORK',text:`I started working as a ${offer.title.toLowerCase()} for $${offer.hourlyWage.toFixed(2)} an hour, ${offer.weeklyHours} hours a week.`}]});}
export const yearlyPartTimePay=(job:Job|null|undefined)=>job?.hourlyWage!==undefined && job.weeklyHours!==undefined?Math.round(job.hourlyWage*job.weeklyHours*52*100)/100:0;
