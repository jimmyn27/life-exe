import {seededRandom} from './family.ts';
import {attractedTo} from './preferences.ts';
import type {Person,RelationshipAction} from './relationships';
import type {Life} from './saves';
export function romanceOutcome(life:Life,person:Person,action:RelationshipAction){
 const random=seededRandom(`${life.id}:${person.id}:${life.age}:${action}:${life.log.length}:romance`);
 const compatible=attractedTo(life.sexuality??'Straight',life.family?.gender??'Male',person.gender)&&attractedTo(person.sexuality,person.gender,life.family?.gender??'Male');
 const alreadyDating=Object.entries(life.relationships??{}).some(([id,r])=>id!==person.id && r.status==='dating');
 const chance=action==='Make love'?person.strength/100:Math.min(.95,.1+life.stats.Charisma/250+person.strength/200)*(alreadyDating?.4:1);
 const accepted=(action==='Have fun'||compatible) && random()<(action==='Have fun'?Math.min(.95,.2+person.strength/150):chance);
 return {accepted,compatible,yourEnjoyment:Math.round(random()*70+person.strength*.3),theirEnjoyment:Math.round(random()*70+person.strength*.3)};
}
