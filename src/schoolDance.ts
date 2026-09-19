import {characters,type Person} from './relationships.ts';
import {getOccupation,schoolPopularity} from './occupation.ts';
import {attractedTo} from './preferences.ts';
import {seededRandom} from './family.ts';
import type {Life} from './saves';
export type DanceMode='classmate'|'partner'|'friends'|'alone';
export type DanceOutcome={life:Life;accepted:boolean;text:string;bars:{label:string;value:number}[];retry:boolean};
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export function schoolDance(life:Life,mode:DanceMode,personId?:string):DanceOutcome {
 const occupation=getOccupation(life),school=occupation.school;
 const unavailable=(text:string):DanceOutcome=>({life,accepted:false,text,bars:[],retry:false});
 if(life.pendingEvent || !school || life.age<14 || life.age>=18)return unavailable('School dances are available in high school.');
 if(school.yearActions?.includes('School dance'))return unavailable('You already attended the school dance this year.');
 const people=characters(life),classmate=people.school.find(p=>p.id===personId && p.relation==='Classmate');
 const partner=people.personal.find(p=>p.status==='dating');
 if(mode==='partner' && !partner)return unavailable('You do not have a partner to attend with.');
 const friends=people.personal.filter(p=>!p.family && p.friendship);
 const friend=mode==='friends'?friends.find(p=>p.id===personId):undefined;
 if(mode==='friends' && !friend)return unavailable('Choose a friend first.');
 if(mode==='classmate' && !classmate)return unavailable('Choose a classmate first.');
 if(mode==='classmate' && school.danceAskedIds?.includes(personId!))return {life,accepted:false,text:'You already asked this classmate this year.',bars:[],retry:true};
 const companions:Person[]=mode==='partner'?[partner!]:mode==='classmate'?[classmate!]:mode==='friends'?[friend!]:[];
 const strength=companions.length?companions.reduce((sum,p)=>sum+p.strength,0)/companions.length:50;
 const random=seededRandom(`${life.id}:dance:${life.age}:${mode}:${personId??''}:${life.log.length}`);
 const compatible=!classmate || attractedTo(life.sexuality??'Straight',life.family?.gender??'Male',classmate.gender) && attractedTo(classmate.sexuality,classmate.gender,life.family?.gender??'Male');
 const accepted=mode==='partner' || mode==='alone' || mode==='classmate' && compatible && random()<Math.min(.95,.15+strength/120) || mode==='friends' && random()<strength/100;
 const yourEnjoyment=clamp(Math.round(random()*70+(mode==='alone'?15:strength*.3)));
 const theirEnjoyment=clamp(Math.round(random()*65+strength*.35));
 const happiness=accepted?Math.round(yourEnjoyment/5):-20;
 const gain=accepted?Math.round(theirEnjoyment/5):mode==='friends'?-10:-20;
 const relationships={...life.relationships};
 for(const person of companions){const record=relationships[person.id];relationships[person.id]={...record,profile:record?.profile??{name:person.name,gender:person.gender,ageOffset:person.age-life.age,education:person.education,occupation:person.occupation},strength:clamp(person.strength+gain),status:person.status,friendship:person.friendship,stats:{...person.stats}};}
 const text=!accepted?mode==='classmate'?`${classmate!.name} declined your invitation to the school dance.`:friend?'Your friend could not agree to go to the school dance with you.':'You do not have any befriended contacts to invite yet.':mode==='partner'?`You went to the school dance with your ${partner!.gender==='Female'?'girlfriend':'boyfriend'}, ${partner!.name}. You danced, talked, and made a memory together.`:mode==='classmate'?`You went to the school dance with ${classmate!.name}. You danced, talked, and made a memory together.`:mode==='friends'?'You went to the school dance with ${friend!.name}. You spent the evening together.':'You went to the school dance alone and enjoyed an evening of music and dancing.';
 const next={...life,stats:{...life.stats,Happiness:clamp(life.stats.Happiness+happiness)},relationships,occupation:{...occupation,school:{...school,...(mode==='classmate'?{danceAskedIds:[...(school.danceAskedIds??[]),personId!]}:{}),yearActions:accepted?[...(school.yearActions??[]),'School dance' as const]:school.yearActions}},log:[...life.log,{age:life.age,tag:'EDUCATION',text:text.replace(/^You /,'I ').replace(/your /g,'my ').replace(/You danced/,'I danced').replace(/You spent/,'I spent')}]};
 next.occupation.school.popularity=schoolPopularity(next,next.occupation.school);
 return {life:next,accepted,text,bars:accepted?[{label:'Your Enjoyment',value:yourEnjoyment},...(mode==='alone'?[]:[{label:mode==='friends'?"Your Friends’ Enjoyment":(mode==='partner'?partner!:classmate!).gender==='Female'?'Her Enjoyment':'His Enjoyment',value:theirEnjoyment}])]:[],retry:!accepted};
}
