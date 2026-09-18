import {seededRandom} from './family.ts';
import {getOccupation,type School,type Occupation} from './occupation.ts';
import {schoolActivities,schoolActivityName} from './schoolActivityCatalog.ts';
import type {Life} from './saves';
export type Membership={performance:number;joinAge:number;years:number;rank:0|1|2;hours:number;trainedAge?:number};
export type MembershipAction='Train'|'Quit'|'Hours';
export const newMembership=(age:number):Membership=>({performance:50,joinAge:age,years:0,rank:0,hours:5});
export const membershipInfo=(school:School,id:string,age:number):Membership=>school.activityDetails?.[id]??newMembership(age);
export const membershipRank=(group:string,rank:number)=>group==='Sports'?['Benchwarmer','Starter','Captain'][rank]:['Member','Vice President','President'][rank];
export function scheduleBreakdown(life:Life,occupation:Occupation=getOccupation(life)):{name:string;hours:number}[] {
 const school=occupation.school,job=occupation.job,items:{name:string;hours:number}[]=[];
 if(school)items.push({name:school.level==='Secondary school'?'High school student':school.level==='Primary school'?'Elementary school student':`${school.level} student`,hours:40});
 for(const id of school?.memberships??[]){const activity=schoolActivities.find(a=>a.id===id);if(activity)items.push({name:schoolActivityName(activity,life.family?.gender),hours:membershipInfo(school!,id,life.age).hours});}
 if(job)items.push({name:job.position,hours:Number(job.hours.match(/(\d+)\s*hours/i)?.[1]??(job.hours.toLowerCase().includes('part')?15:40))});
 return items;
}
export const scheduleLimit=60;
export const busyMessage="You're too busy and can't find time in your schedule to take on this position.";
export const scheduleHours=(life:Life,occupation:Occupation=getOccupation(life)):number=>scheduleBreakdown(life,occupation).reduce((sum,item)=>sum+item.hours,0);
const clamp=(value:number)=>Math.max(0,Math.min(100,value));
export const dismissalChance=(performance:number)=>performance>=50?0:Math.min(.9,(50-performance)/60);
export function advanceCommitments(before:Life,after:Life):Life {
 const hours=scheduleHours(before),overload=Math.max(0,hours-60),penalty=Math.ceil(overload/5);
 const occupation=after.occupation?{...after.occupation}:getOccupation(after),school=occupation.school?{...occupation.school}:null;
 if(occupation.job)occupation.job={...occupation.job,performance:clamp(occupation.job.performance+2-penalty)};
 const log=[...after.log];
 if(overload)log.push({age:after.age,tag:'LIFE',text:`My ${hours}-hour weekly schedule left me overwhelmed.`});
 if(school){school.grades=clamp(school.grades-penalty);const details:Record<string,Membership>={},retained:string[]=[];
 for(const id of school.memberships??[]){const activity=schoolActivities.find(a=>a.id===id);if(!activity)continue;const old=membershipInfo(before.occupation?.school??getOccupation(before).school??school,id,before.age);const performance=clamp(old.performance+2+(old.hours-5)*2-penalty),years=after.age-old.joinAge;
  if(seededRandom(`${before.id}:dismiss:${id}:${after.age}`)()<dismissalChance(performance)){log.push({age:after.age,tag:'EDUCATION',text:`I was removed from the ${schoolActivityName(activity,before.family?.gender)} because of my low performance.`});continue;}
  const rank=performance>=80 && years>=2?2:performance>=65 && years>=1?Math.max(1,old.rank):old.rank;
  if(rank>old.rank)log.push({age:after.age,tag:'EDUCATION',text:`I was promoted to ${membershipRank(activity.group,rank)} in the ${schoolActivityName(activity,before.family?.gender)}.`});
  retained.push(id);details[id]={...old,performance,years,rank:rank as 0|1|2};
 }
 school.memberships=retained;school.activityDetails=details;occupation.school=school;
 }
 return {...after,occupation,stats:{...after.stats,Happiness:clamp(after.stats.Happiness-penalty)},log};
}
