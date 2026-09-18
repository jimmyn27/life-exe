import {getOccupation} from './occupation.ts';
import {seededRandom} from './family.ts';
import type {Life} from './saves';
export const schoolActivities=[
 {id:'chess',name:'Chess club',group:'Clubs',description:'Play chess and meet other students.'},
 {id:'debate',name:'Debate club',group:'Clubs',description:'Practice speaking and discussing ideas.'},
 {id:'art',name:'Art club',group:'Clubs',description:'Create art with your classmates.'},
 {id:'science',name:'Science club',group:'Clubs',description:'Explore experiments and new discoveries.'},
 {id:'basketball',name:'Basketball team',group:'Sports',description:'Try out for the school basketball team.'},
 {id:'soccer',name:'Soccer team',group:'Sports',description:'Try out for the school soccer team.'},
 {id:'track',name:'Track team',group:'Sports',description:'Try out for running and athletics.'},
 {id:'swimming',name:'Swimming team',group:'Sports',description:'Try out for the school swimming team.'}
] as const;
export function applySchoolActivity(life:Life,id:string):Life{
 const occupation=getOccupation(life),school=occupation.school,activity=schoolActivities.find(item=>item.id===id);
 if(life.pendingEvent || !school || life.age<12 || life.age>=18 || !activity || school.memberships?.includes(id) || school.activityAttempts?.[id]?.age===life.age)return life;
 const accepted=seededRandom(`${life.id}:activity:${school.startAge}:${life.age}:${id}`)()<(activity.group==='Clubs'?.7:.5);
 return {...life,occupation:{...occupation,school:{...school,activityAttempts:{...school.activityAttempts,[id]:{age:life.age,accepted}},memberships:accepted?[...(school.memberships??[]),id]:school.memberships??[]}},log:[...life.log,{age:life.age,tag:'EDUCATION',text:accepted?`I ${activity.group==='Clubs'?'was accepted into':'made'} the ${activity.name}.`:`I ${activity.group==='Clubs'?'applied to':'tried out for'} the ${activity.name}, but did not get in.`}]};
}
export const hasGraduated=(life:Life)=>['Secondary school','University'].includes(getOccupation(life).highestEducation);
export const workCategories=(life:Life)=>life.age<14?[]:hasGraduated(life)?['Part-time','Full-time']:['Part-time'];
