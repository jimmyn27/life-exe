import {getOccupation} from './occupation.ts';
import {seededRandom} from './family.ts';
import type {Life} from './saves';
import {schoolActivities,schoolActivityName} from './schoolActivityCatalog.ts';
import {membershipInfo,newMembership,scheduleHours,scheduleLimit,type MembershipAction} from './schoolCommitments.ts';
export {schoolActivities,schoolActivityName} from './schoolActivityCatalog.ts';
export function applySchoolActivity(life:Life,id:string):Life{
 const occupation=getOccupation(life),school=occupation.school,activity=schoolActivities.find(item=>item.id===id);
 if(life.pendingEvent || !school || life.age<10 || life.age>=18 || !activity || school.memberships?.includes(id) || school.activityAttempts?.[id]?.age===life.age)return life;
 if(scheduleHours(life)+5>scheduleLimit)return life;
 const accepted=seededRandom(`${life.id}:activity:${school.startAge}:${life.age}:${id}`)()<(activity.group==='Clubs'?.7:.5);
 return {...life,stats:{...life.stats,Happiness:Math.max(0,Math.min(100,life.stats.Happiness+(accepted?4:-3)))},occupation:{...occupation,school:{...school,activityAttempts:{...school.activityAttempts,[id]:{age:life.age,accepted}},...(accepted?{activityDetails:{...school.activityDetails,[id]:newMembership(life.age)}}:{}),memberships:accepted?[...(school.memberships??[]),id]:school.memberships??[]}},log:[...life.log,{age:life.age,tag:'EDUCATION',text:accepted?`I ${activity.group==='Clubs'?'was accepted into':'made'} the ${schoolActivityName(activity,life.family?.gender)}.`:`I ${activity.group==='Clubs'?'applied to':'tried out for'} the ${schoolActivityName(activity,life.family?.gender)}, but did not get in.`}]};
}
export const hasGraduated=(life:Life)=>['Secondary school','University'].includes(getOccupation(life).highestEducation);
export const workCategories=(life:Life)=>life.age<14?[]:hasGraduated(life)?['Part-time','Full-time']:['Part-time'];

export function manageSchoolActivity(life:Life,id:string,action:MembershipAction,hours?:number):Life {
 const occupation=getOccupation(life),school=occupation.school,activity=schoolActivities.find(a=>a.id===id);
 if(life.pendingEvent || !school || !activity || !school.memberships?.includes(id))return life;
 const detail=membershipInfo(school,id,life.age);
 if(action==='Hours'){
  if(!Number.isInteger(hours) || hours!<1 || hours!>10)return life;
  return {...life,occupation:{...occupation,school:{...school,activityDetails:{...school.activityDetails,[id]:{...detail,hours:hours!}}}}};
 }
 if(action==='Quit')return {...life,occupation:{...occupation,school:{...school,memberships:school.memberships.filter(member=>member!==id),activityDetails:Object.fromEntries(Object.entries(school.activityDetails??{}).filter(([key])=>key!==id))}},log:[...life.log,{age:life.age,tag:'EDUCATION',text:`I quit the ${schoolActivityName(activity,life.family?.gender)}.`}]};
 if(detail.trainedAge===life.age)return life;
 return {...life,occupation:{...occupation,school:{...school,activityDetails:{...school.activityDetails,[id]:{...detail,performance:Math.min(100,detail.performance+5),trainedAge:life.age}}}},log:[...life.log,{age:life.age,tag:'EDUCATION',text:`I ${activity.group==='Sports'?'practiced':'worked'} harder in the ${schoolActivityName(activity,life.family?.gender)}.`}]};
}
