import {seededRandom} from './family.ts';
import {schoolActivities} from './schoolActivityCatalog.ts';
import type {SchoolPerson} from './schoolCommunity';
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export function npcBaseStats(id:string){const seed=[...id].reduce((sum,c)=>sum+c.charCodeAt(0),0);return {Health:75+seed%21,Happiness:65+seed%30,Intelligence:60+seed%36,Charisma:55+seed%40};}
export function advanceClassmate(person:SchoolPerson,lifeId:string,age:number,transition=false):SchoolPerson {
 if(person.relation!=='Classmate')return person;
 const stats=npcBaseStats(person.id),random=seededRandom(`${lifeId}:${person.id}:school:${age}`);
 const newStage=transition || person.gradeAge===undefined;
 const grades=newStage?stats.Intelligence:person.gradeAge===age?person.grades??stats.Intelligence:clamp((person.grades??stats.Intelligence)+Math.floor(random()*9)-4);
 let clubs=transition?[]:[...(person.clubs??[])].slice(0,1),sports=transition?[]:[...(person.sports??[])].slice(0,1);
 if(age>=10 && person.gradeAge!==age){for(const [group,chance,list] of [['Clubs',Math.min(.9,.08+stats.Intelligence*.007),clubs],['Sports',Math.min(.9,.06+stats.Health*.0075),sports]] as const){if(list.length<1 && random()<chance){const options=schoolActivities.filter(a=>a.group===group && !list.includes(a.id));if(options.length)list.push(options[Math.floor(random()*options.length)].id);}}}
 return {...person,grades,gradeAge:age,clubs,sports};
}
export function classmatePopularity(person:SchoolPerson,charisma:number):number{return clamp(charisma+(person.clubs?.length??0)*4+(person.sports?.length??0)*10);}
