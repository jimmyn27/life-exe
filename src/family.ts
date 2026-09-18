import {givenNamesForGender,namePool} from './catalogs/us/lifeContent.ts';
import { olderSiblingAges } from './siblingAges.ts';
import { pairedParentAges } from './parentAges.ts';
import type { Stats } from './data';
export type Parent = { id: string; name: string; relation: 'Mother' | 'Father'; gender: 'Female' | 'Male'; ageAtBirth: number; education: string; occupation: string; stats: Stats; career?: number; rank?: number; yearsInPosition?: number };
export type Sibling = { id: string; name: string; gender: 'Female' | 'Male'; birthAge: number; stats: Stats };
export type Family = { parents: Parent[]; birthStats: Stats; gender?: 'Female' | 'Male'; planned?: boolean; money?: number; siblings?: Sibling[]; origin?: { parents: Parent[]; money: number; siblings: Sibling[] } };
const jobs = [
 { education:'Secondary school', titles:['Sales associate','Shift supervisor','Store manager'], salary:30000 },
 { education:'Secondary school', titles:['Office assistant','Office coordinator','Office manager'], salary:35000 },
 { education:'University', titles:['Nurse','Senior nurse','Nurse manager'], salary:65000 },
 { education:'University', titles:['Teacher','Senior teacher','Head teacher'], salary:45000 },
 { education:'University', titles:['Software developer','Senior developer','Engineering manager'], salary:70000 }
];
const clamp = (n: number) => Math.max(0,Math.min(100,n));
const siblingName=(gender:'Male'|'Female',surname:string,random:()=>number,used:Set<string>)=>{const pool=givenNamesForGender(gender);let name='';do{name=`${pool[Math.floor(random()*pool.length)]} ${surname}`;}while(used.has(name));used.add(name);return name;};
export function promotionChance(years: number): number { return Math.min(.6,.025 + Math.max(0,years)*.035); }
export function siblingBirthChance(motherAge: number, children: number): number {
 return (motherAge < 30 ? .14 : motherAge < 35 ? .10 : motherAge < 40 ? .055 : motherAge < 45 ? .015 : 0) * Math.pow(.42,Math.max(0,children-2));
}
export function familyMoney(family?: Family): number { return family?.money ?? 40; }

export function seededRandom(seed: string): () => number {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
}
export function generateFamily(id: string, surname: string): Family {
 const random=seededRandom(id+':family');
 const integer=(a:number,b:number)=>a+Math.floor(random()*(b-a+1));
 const stats=():Stats=>({Health:integer(65,100),Happiness:integer(55,95),Smarts:integer(30,95),Looks:integer(30,95)});
 const single=random()<.18;
 const motherCareer=integer(0,jobs.length-1);
 const fatherCareer=single?undefined:integer(0,jobs.length-1);
 const motherMinimum=jobs[motherCareer].education==='University'?23:18;
 const ages=fatherCareer===undefined ? {mother:integer(motherMinimum,40),father:0} : pairedParentAges(random,motherMinimum,jobs[fatherCareer].education==='University'?23:18);
 const makeParent=(mother:boolean):Parent=>{
  const career=mother?motherCareer:fatherCareer!, job=jobs[career];
  const ageAtBirth=mother?ages.mother:ages.father;
  const rank=Math.min(2,Math.floor((ageAtBirth-18)/10));
  return {id:mother?'parent-mother':'parent-father',name:`${givenNamesForGender(mother?'Female':'Male')[integer(0,givenNamesForGender(mother?'Female':'Male').length-1)]} ${mother && !single && random()>.85?namePool.surnames[integer(0,namePool.surnames.length-1)]:surname}`,relation:mother?'Mother':'Father',gender:mother?'Female':'Male',ageAtBirth,education:career===2?"Bachelor's (Nursing)":career===3?"Bachelor's (Education)":career===4?"Bachelor's (Computer Science)":'High school diploma',occupation:job.titles[rank],career,rank,yearsInPosition:integer(0,4),stats:stats()};
 };
 const parents=[makeParent(true),...(!single?[makeParent(false)]:[])];
 const inherit=(key:'Smarts'|'Looks')=>clamp(Math.round(parents.reduce((sum,p)=>sum+p.stats[key],0)/parents.length)+integer(-8,8));
 const siblings:Sibling[]=[];
 const olderAges=olderSiblingAges(random,parents[0].ageAtBirth,parents[1]?.ageAtBirth);
 const usedNames=new Set(parents.map(parent=>parent.name));
 for(let i=0;i<olderAges.length;i++){const gender=random()<.5?'Female':'Male';siblings.push({id:`sibling-older-${i}`,name:siblingName(gender,surname,random,usedNames),gender,birthAge:-olderAges[i],stats:stats()});}
 const income=parents.reduce((sum,p)=>sum+jobs[p.career!].salary*(1+p.rank!*.4),0);
 const money=clamp(Math.round(10+income/5000+parents.reduce((sum,p)=>sum+p.ageAtBirth-18,0)/3+integer(-8,12)+(random()<.12?25:0)));
 return {parents,siblings,money,gender:random()<.5?'Female':'Male',planned:random()<.65,birthStats:{Health:integer(85,100),Happiness:integer(70,95),Smarts:inherit('Smarts'),Looks:inherit('Looks')},origin:structuredClone({parents,money,siblings})};
}
export function resetFamily(family: Family): Family {
 return family.origin?{...family,...structuredClone(family.origin)}:family;
}
export function birthIntroduction(name:string, city:string, family?:Family):string {
 if(!family) return `My name is ${name}. I was born in ${city}.`;
 return [`I was born a ${(family.gender??'Female').toLowerCase()} in ${city}, United States. ${family.planned===false?'My arrival was an unexpected pregnancy.':family.parents.length===1?'My mother had planned for my arrival.':'My parents had planned for my arrival.'}`,
 `My name is ${name}.`,...([...family.parents].reverse().map(p=>`My ${p.relation.toLowerCase()} is ${p.name}, a ${p.occupation.toLowerCase()} (age ${p.ageAtBirth}).`)),...(family.parents.length===1?['I was born to a single mother.']:[]),...(family.siblings??[]).filter(sibling=>sibling.birthAge<0).map(sibling=>`I have an older ${sibling.gender==='Male'?'brother':'sister'} named ${sibling.name.split(' ')[0]} (age ${-sibling.birthAge}).`)].join('\n');
}
export function advanceFamily(family: Family | undefined,id:string,age:number,surname:string): {family:Family|undefined; newborn?:Sibling; promotions:Parent[]} {
 if(!family) return {family,promotions:[]};
 const random=seededRandom(`${id}:family-year:${age}`);
 const origin=family.origin??structuredClone({parents:family.parents,money:familyMoney(family),siblings:family.siblings??[]});
 const promotions:Parent[]=[];
 const parents=family.parents.map(p=>{
  const years=(p.yearsInPosition??0)+1;
  const job=p.career===undefined?undefined:jobs[p.career];
  const rank=p.rank??0;
  if(job && rank<2 && random()<promotionChance(years)){const parent={...p,rank:rank+1,occupation:job.titles[rank+1],yearsInPosition:0};promotions.push(parent);return parent;}
  return {...p,yearsInPosition:years};
 });
 const siblings=[...(family.siblings??[])];
 const mother=parents.find(p=>p.relation==='Mother');
 let newborn:Sibling|undefined;
 if(mother && random()<siblingBirthChance(mother.ageAtBirth+age,siblings.length+1)) {
  const gender=random()<.5?'Female':'Male';
  newborn={id:`sibling-born-${age}`,name:siblingName(gender,surname,random,new Set([...parents,...siblings].map(person=>person.name))),gender,birthAge:age,stats:{Health:90,Happiness:80,Smarts:family.birthStats.Smarts,Looks:family.birthStats.Looks}};
  siblings.push(newborn);
 }
 const growth=.2+parents.reduce((sum,p)=>sum+(p.rank??0)*.15,0)+promotions.length*.8;
 return {family:{...family,parents,siblings,origin,money:clamp(familyMoney(family)+growth)},newborn,promotions};
}
