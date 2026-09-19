import {getOccupation,schoolPopularity} from './occupation.ts';
import {seededRandom} from './family.ts';
import {npcBaseStats} from './npcSchool.ts';
import type {Life} from './saves';
import {schoolActivities,schoolActivityName} from './schoolActivityCatalog.ts';
import {membershipInfo,newMembership,scheduleHours,scheduleLimit,type MembershipAction} from './schoolCommitments.ts';
export {schoolActivities,schoolActivityName} from './schoolActivityCatalog.ts';
export function applySchoolActivity(life:Life,id:string):Life{
 const occupation=getOccupation(life),school=occupation.school,activity=schoolActivities.find(item=>item.id===id);
 if(life.pendingEvent || !school || life.age<10 || life.age>=18 || !activity || school.memberships?.includes(id) || (school.activityAttempts?.[id]?.age===life.age && (school.activityAttempts[id].count??1)>=2))return life;
 if(scheduleHours(life)+5>scheduleLimit)return life;
 const prior=school.activityAttempts?.[id],count=prior?.age===life.age?(prior.count??1)+1:1;
 const aptitude=activity.group==='Clubs'?(life.stats.Intelligence+life.stats.Charisma)/2:life.stats.Health;
 const chance=Math.min(.95,.1+aptitude*.0085);
 const accepted=count===1 && seededRandom(`${life.id}:activity:${school.startAge}:${life.age}:${id}`)()<chance;
 const relationships={...life.relationships};
 if(accepted)for(const peer of school.roster?.filter(person=>person.relation==='Classmate' && (activity.group==='Sports'?person.sports:person.clubs)?.includes(id))??[]){const old=relationships[peer.id];relationships[peer.id]={...old,strength:Math.min(100,(old?.strength??peer.strength)+20),status:old?.status??'acquaintance',...(old?.friendship!==undefined?{friendship:old.friendship}:{}),stats:old?.stats??npcBaseStats(peer.id)};}
 const nextSchool={...school,activityAttempts:{...school.activityAttempts,[id]:{age:life.age,accepted,count}},...(accepted?{activityDetails:{...school.activityDetails,[id]:newMembership(life.age)}}:{}),memberships:accepted?[...(school.memberships??[]),id]:school.memberships??[]};
 const next:Life={...life,stats:{...life.stats,Happiness:Math.max(0,Math.min(100,life.stats.Happiness+(accepted?20:-20)))},relationships,occupation:{...occupation,school:nextSchool},log:[...life.log,{age:life.age,tag:'EDUCATION',text:accepted?`I ${activity.group==='Clubs'?'was accepted into':'made'} the ${schoolActivityName(activity,life.family?.gender)}.`:count>1?`The ${activity.group==='Clubs'?'club':'coach'} asked me to stop applying to the ${schoolActivityName(activity,life.family?.gender)} for the rest of the year.`:`I ${activity.group==='Clubs'?'applied to':'tried out for'} the ${schoolActivityName(activity,life.family?.gender)}, but did not get in.`}]};
 next.occupation!.school!.popularity=schoolPopularity(next,nextSchool);return next;
}
export const hasGraduated=(life:Life)=>['Secondary school','University'].includes(getOccupation(life).highestEducation);
export const workCategories=(life:Life)=>life.age<14?[]:hasGraduated(life)?['Part-time','Full-time']:['Part-time'];
const pick=(items:string[],seed:string)=>items[Math.floor(seededRandom(seed)()*items.length)];
export function manageSchoolActivity(life:Life,id:string,action:MembershipAction,hours?:number):Life {
 const occupation=getOccupation(life),school=occupation.school,activity=schoolActivities.find(a=>a.id===id);
 if(life.pendingEvent || !school || !activity || !school.memberships?.includes(id))return life;
 const detail=membershipInfo(school,id,life.age),name=schoolActivityName(activity,life.family?.gender);
 if(action==='Hours'){
  if(!Number.isInteger(hours) || hours!<1 || hours!>10)return life;
  return {...life,occupation:{...occupation,school:{...school,activityDetails:{...school.activityDetails,[id]:{...detail,hours:hours!}}}}};
 }
 if(action==='Quit')return {...life,occupation:{...occupation,school:{...school,memberships:school.memberships.filter(member=>member!==id),activityDetails:Object.fromEntries(Object.entries(school.activityDetails??{}).filter(([key])=>key!==id))}},log:[...life.log,{age:life.age,tag:'EDUCATION',text:`I quit the ${name}.`}]};
 const seed=`${life.id}:${id}:${life.age}:training`;
 if(detail.trainedAge===life.age){const lines=activity.group==='Sports'?[`I was too sore to gain anything from another intense ${name} practice.`,`My coach told me to recover instead of overtraining for the ${name}.`,`I practiced again, but my performance in the ${name} had reached its limit for the year.`,`My body needed rest before I could improve further with the ${name}.`]:[`I had already contributed everything I could to the ${name} this year.`,`The ${name} had no more projects that could improve my performance this year.`,`I worked again, but I had reached my limit in the ${name} for the year.`,`I needed fresh ideas before I could improve any further in the ${name}.`];return {...life,log:[...life.log,{age:life.age,tag:'EDUCATION',text:pick(lines,seed)}]};}
 const lines=activity.group==='Sports'?[`I stayed after practice to sharpen my technique for the ${name}.`,`I completed an extra conditioning session for the ${name}.`,`I worked closely with my coach and improved my performance in the ${name}.`,`I drilled the fundamentals until I felt more confident in the ${name}.`]:[`I volunteered for extra responsibilities in the ${name}.`,`I brought new ideas to the ${name} and worked hard to make them happen.`,`I stayed late to help finish a project for the ${name}.`,`I took on a challenging task and improved my performance in the ${name}.`];
 return {...life,occupation:{...occupation,school:{...school,activityDetails:{...school.activityDetails,[id]:{...detail,performance:Math.min(100,detail.performance+10),trainedAge:life.age}}}},log:[...life.log,{age:life.age,tag:'EDUCATION',text:pick(lines,seed)}]};
}