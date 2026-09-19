import {initialRelationship,initialStaffRelationship} from './relationshipModel.ts';
import {advanceClassmate} from './npcSchool.ts';
import {seededRandom} from './family.ts';
import {namePool,givenNamesForGender} from './catalogs/us/lifeContent.ts';
export type SchoolPerson={id:string;name:string;gender:'Male'|'Female';ageOffset:number;relation:'Classmate'|'Teacher'|'Principal'|'Professor';group:string;strength:number;subject?:string;grades?:number;gradeAge?:number;clubs?:string[];sports?:string[]};
export const schoolStageId=(age:number)=>age<10?'primary':age<14?'middle':age<18?'secondary':'university';
export const classroomSize=(age:number)=>age<10?22:age<14?24:25;
export function advanceSchoolRoster(id:string,age:number,previous:readonly SchoolPerson[]=[],charisma=50,intelligence=50):SchoolPerson[]{
 const stage=schoolStageId(age),transition=age===10 || age===14;
 const random=seededRandom(`${id}:roster:${age}`);
 const integer=(a:number,b:number)=>a+Math.floor(random()*(b-a+1));
 const used=new Set(previous.map(person=>person.name));
 const make=(index:number,relation:SchoolPerson['relation'],subject?:string):SchoolPerson=>{
  const gender=random()<.5?'Male':'Female';
  const givenNames=givenNamesForGender(gender);
  let name='';
  do {name=`${givenNames[integer(0,givenNames.length-1)]} ${namePool.surnames[integer(0,namePool.surnames.length-1)]}`;}while(used.has(name));
  used.add(name);
  return {id:`school-${stage}-${age}-${relation}-${index}`,name,gender,ageOffset:relation==='Classmate'?0:relation==='Principal'?integer(30,45):integer(20,38),relation,group:relation==='Classmate'?'Classmates':'Staff',strength:relation==='Classmate'?initialRelationship(id,`school-${stage}-${age}-${relation}-${index}`,charisma):initialStaffRelationship(id,`school-${stage}-${age}-${relation}-${index}`,intelligence,charisma),...(subject?{subject}:{})};
 };
 let peers=previous.filter(person=>person.relation==='Classmate');
 const staffChanged=transition || !previous.length;
 const replacements=previous.length ? transition?Math.ceil(peers.length*.25):integer(0,2):0;
 // Randomize departing classmates without changing identities of retained peers.
 const shuffled=[...peers];for(let i=shuffled.length-1;i>0;i--){const j=integer(0,i);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const departed=new Set(shuffled.slice(0,replacements).map(person=>person.id));
 peers=peers.filter(person=>!departed.has(person.id));
 const count=classroomSize(age)-1;
 for(let i=peers.length;i<count;i++)peers.push(make(i,'Classmate'));
 peers=peers.slice(0,count);
 const subjects=stage==='primary'?['Classroom','Art','Physical education']:['English','Mathematics','Science','History','Art','Physical education'];
 const staff=staffChanged?[make(0,'Principal'),...subjects.map((subject,index)=>make(index+1,stage==='university'?'Professor':'Teacher',subject))]:previous.filter(person=>person.relation!=='Classmate');
 return [...peers.map(person=>advanceClassmate(person,id,age,transition)),...staff];
}
export function initialSchoolRoster(id:string,age:number,charisma=50,intelligence=50):SchoolPerson[]{
 let roster:SchoolPerson[]=[];
 for(let year=6;year<=Math.min(age,17);year++)roster=advanceSchoolRoster(id,year,roster,charisma,intelligence);
 return age>=18?advanceSchoolRoster(id,age,[],charisma,intelligence):roster;
}
