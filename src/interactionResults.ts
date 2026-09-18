import { personAddress } from './personAddress.ts';
import { seededRandom } from './family.ts';
import { giftEffect, gifts } from './gifts.ts';
import type { Life } from './saves';
import type { Person, RelationshipAction } from './relationships';
export type InteractionResult = {title:string;text:string;meter?:{label:string;value:number};change:number;note?:string};
const compliments=['You told NAME they have a wonderful sense of humor.','You called NAME thoughtful and kind.','You told NAME you admire their creativity.','You complimented NAME on their great sense of style.'];
export function reaction(life:Life,person:Person,action:RelationshipAction,giftId?:string) {
 const random=seededRandom(`${life.id}:${person.id}:${life.age}:${action}:response`);
 const sample=random();
 const value=Math.min(100,Math.round(sample*100));
 const delta=value<=15?-4:value<=35?-2:value<=55?2:value<=75?4:7;
 const topics=life.age<6?['your favorite toys','animals','a story you heard','what to play next']:['your favorite movies','music','school','your plans for the future','sports','a funny memory'];
 const text=action==='Compliment'?compliments[Math.floor(random()*compliments.length)].replace('NAME',personAddress(person)):action==='Conversation'?`You and ${personAddress(person)} talked about ${topics[Math.floor(random()*topics.length)]}.`:'';
 if(action==='Gift'){
  const gift=gifts.find(item=>item.id===giftId),effect=gift?giftEffect(life,person,gift):6;
  return {delta:effect,value:effect<0?Math.max(0,15+effect):Math.min(100,45+effect*4),text:gift?`You gave ${personAddress(person)} ${gift.name.toLowerCase()} ($${gift.price}).`:`You gave ${personAddress(person)} a gift.`};
 }
 return {delta,value:delta<0?Math.round(value/35*12):Math.min(100,45+delta*7),text};
}
export function interactionResult(before:Life,after:Life,person:Person,action:RelationshipAction,giftId?:string):InteractionResult {
 const response=reaction(before,person,action,giftId);
 const change=(after.relationships?.[person.id]?.strength??person.strength)-person.strength;
 const repeated=before.relationships?.[person.id]?.usedAge===before.age && before.relationships[person.id].usedActions?.includes(action);
 const hasBar=['Compliment','Conversation','Gift'].includes(action);
 const pronoun=person.gender==='Female'?'Her':'His';
 const log=after.log.at(-1)?.text??'';
 const text=hasBar?response.text:log.replace(/^I was /,'You were ').replace(/^I /,'You ').replace(/my /g,'your ').replace(/We /g,'You both ').replace(/our relationship/g,'your relationship').replace(/my friendship/g,'your friendship');
 return {title:`${action} · ${personAddress(person,'label')}`,text,change,...(hasBar?{meter:{label:`${pronoun} ${action==='Conversation'?'agreement':'appreciation'}`,value:repeated || change===0?50:response.value}}:{}),...(repeated?{note:'You already received the relationship effect of this interaction this year.'}:hasBar && change===0?{note:'Your relationship is already at its limit.'}:{})};
}
