import {interactionLabels} from './interactionText.ts';
import {romanceOutcome} from './romance.ts';
import { personAddress } from './personAddress.ts';
import { seededRandom } from './family.ts';
import { giftEffect, gifts } from './gifts.ts';
import type {LifeEvent} from './data';
import type { Life } from './saves';
import type { Person, RelationshipAction } from './relationships';
export type InteractionResult = {title:string;text:string;meter?:{label:string;value:number};change:number;bars?:{label:string;value:number}[];note?:string;followUp?:LifeEvent};
const compliments=['You told NAME they have a wonderful sense of humor.','You called NAME thoughtful and kind.','You told NAME you admire their creativity.','You complimented NAME on their great sense of style.'];
export function reaction(life:Life,person:Person,action:RelationshipAction,giftId?:string) {
 const random=seededRandom(`${life.id}:${person.id}:${life.age}:${action}:response`);
 const sample=random();
 const value=Math.min(100,Math.round(sample*100));
 const delta=value<=15?-4:value<=35?-2:value<=55?2:value<=75?4:7;
 if(action==='Flirt'){const receptiveness=Math.round(life.stats.Looks*.6+person.strength*.25+sample*15);const delta=receptiveness<=25?-4:receptiveness<=45?-2:receptiveness<=65?2:receptiveness<=80?4:7;return {delta,value:receptiveness,text:`You flirted with ${personAddress(person)}.`};}
 const topics=life.age<6?['your favorite toys','animals','a story you heard','what to play next']:['your favorite movies','music','school','your plans for the future','sports','a funny memory'];
 const rawText=action==='Suck up'?`You told ${personAddress(person)} their class is your favorite.`:action==='Compliment'?compliments[Math.floor(random()*compliments.length)].replace('NAME',personAddress(person)):action==='Conversation'?`You and ${personAddress(person)} talked about ${topics[Math.floor(random()*topics.length)]}.`:'';
 const text=rawText.replace(/they have/g,person.gender==='Female'?'she has':'he has').replace(/their /g,person.gender==='Female'?'her ':'his ');
 if(action==='Gift'){
  const gift=gifts.find(item=>item.id===giftId),effect=gift?giftEffect(life,person,gift):6;
  return {delta:effect,value:effect<0?Math.max(0,15+effect):Math.min(100,45+effect*4),text:gift?`You gave ${personAddress(person)} ${gift.name.toLowerCase()} ($${gift.price}).`:`You gave ${personAddress(person)} a gift.`};
 }
 return {delta,value:delta<0?Math.round(value/35*12):Math.min(100,45+delta*7),text};
}
export function interactionResult(before:Life,after:Life,person:Person,action:RelationshipAction,giftId?:string,invited=false):InteractionResult {
 const romance=romanceOutcome(before,person,action);
 const response=reaction(before,person,action,giftId);
 const change=(after.relationships?.[person.id]?.strength??person.strength)-person.strength;
 const repeated=before.relationships?.[person.id]?.usedAge===before.age && before.relationships[person.id].usedActions?.includes(action);
 const hasBar=['Compliment','Conversation','Gift','Suck up','Flirt'].includes(action);
 const pronoun=person.gender==='Female'?'Her':'His';
 const log=after.log.at(-1)?.text??'';
 let followUp:LifeEvent|undefined;
 const sameAgeGroup=(before.age<18)===(person.age<18);
 const dating=Object.values(after.relationships??{}).some(r=>r.status==='dating');
 if(action==='Flirt' && !repeated && response.value>=80 && romance.compatible && sameAgeGroup && seededRandom(`${before.id}:${person.id}:${before.age}:flirt-followup`)()<.4){const kind=before.age>=16 && before.age<18 && person.age>=16 && person.age<18 && (dating||seededRandom(`${before.id}:${person.id}:invite-kind`)()<.5)?'fun':'date';if(kind==='fun'||!dating)followUp={category:'Invitation',title:kind==='date'?'An invitation to date':'An afternoon together',text:kind==='date'?`${person.name} asks if you would like to be ${person.gender==='Female'?'her':'his'} ${before.family?.gender==='Female'?'girlfriend':'boyfriend'}.`:`${person.name} asks if you would like to go bowling and play arcade games together.`,choices:[{label:'Accept',hint:kind==='date'?'Start dating.':'Enjoy a nonsexual outing.',outcome:'',relationship:{id:person.id,action:kind==='date'?'Ask out':'Have fun',invited:true}},{label:'Decline politely',hint:'Thank them for asking.',outcome:`I politely declined ${person.name}'s invitation.`}]};}
 const text=hasBar?response.text:log.replace(/^I was /,'You were ').replace(/^I /,'You ').replace(/my /g,'your ').replace(/We /g,'You both ').replace(/our relationship/g,'your relationship').replace(/my friendship/g,'your friendship');
 return {title:`${interactionLabels[action]} · ${personAddress(person,'label')}`,text,change,...(followUp?{followUp}:{}),...(['Have fun','Hook up','Make love'].includes(action)&&(romance.accepted||invited)?{bars:[{label:'Your Enjoyment',value:romance.yourEnjoyment},{label:`${pronoun} Enjoyment`,value:romance.theirEnjoyment}]}:{}),...(hasBar?{meter:{label:`${pronoun} ${action==='Conversation'?'agreement':action==='Flirt'?'receptiveness':'appreciation'}`,value:repeated?50:response.value}}:{}),...(repeated?{note:'You already received the relationship effect of this interaction this year.'}:{})};
}
