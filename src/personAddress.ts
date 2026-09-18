import type { Person } from './relationships';
export function personAddress(person:Person,perspective:'first'|'second'|'label'='second'):string {
 if(person.family){const relation=person.relation.toLowerCase();return perspective==='label'?person.relation:`${perspective==='first'?'my':'your'} ${relation}`;}
 if(['Teacher','Principal','Professor'].includes(person.relation) || /\b(teacher|principal|professor)\b/i.test(person.occupation))return `${person.gender==='Male'?'Mr.':'Ms.'} ${person.name.trim().split(/\s+/).slice(1).join(' ')||person.name}`;
 return person.name;
}
