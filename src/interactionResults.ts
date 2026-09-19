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
 const random=seededRandom(`${life.id}:${person.id}:${life.age}:${action}:${life.log.length}:response`);
 const sample=random();
 const relationship=person.strength;
 let value=Math.max(0,Math.min(100,Math.round(relationship*.65+sample*35)));
 let delta=0;
 if(action==='Conversation'){value=Math.max(0,Math.min(100,Math.round(relationship*.45+sample*55)));delta=-5+Math.round(value*.15);}
 else if(action==='Flirt'){value=Math.max(0,Math.min(100,Math.round(life.stats.Looks*.65+relationship*.25+sample*10)));delta=-10+Math.round(value*.35);}
 else if(action==='Suck up')delta=-10+Math.round(value*.3);
 else if(action==='Compliment')delta=Math.round(value*.25);
 const topics=life.age<6?['your favorite toys','animals','a story you heard','what to play next']:['your favorite movies','music','school','your plans for the future','sports','a funny memory'];
 const rawText=action==='Suck up'?`You told ${personAddress(person)} their class is your favorite.`:action==='Compliment'?compliments[Math.floor(random()*compliments.length)].replace('NAME',personAddress(person)):action==='Conversation'?`You and ${personAddress(person)} talked about ${topics[Math.floor(random()*topics.length)]}.`:action==='Flirt'?`You flirted with ${personAddress(person)}.`:'';
 const text=rawText.replace(/they have/g,person.gender==='Female'?'she has':'he has').replace(/their /g,person.gender==='Female'?'her ':'his ');
 if(action==='Gift'){
  const gift=gifts.find(item=>item.id===giftId),effect=gift?giftEffect(life,person,gift):6;
  value=Math.max(0,Math.min(100,Math.round(effect<0?25+effect*2+relationship*.1+(sample-.5)*18:50+effect*3+(relationship-50)*.3+(sample-.5)*18)));
  delta=-10+Math.round(value*.35);
  return {delta,value,text:gift?`You gave ${personAddress(person)} ${gift.name.toLowerCase()} ($${gift.price}).`:`You gave ${personAddress(person)} a gift.`};
 }
 return {delta,value,text};
}
export function interactionResult(before:Life,after:Life,person:Person,action:RelationshipAction,giftId?:string,invited=false):InteractionResult {
 const romance=romanceOutcome(before,person,action);
 const response=reaction(before,person,action,giftId);
 const change=(after.relationships?.[person.id]?.strength??person.strength)-person.strength;
 const repeated=['Compliment','Conversation','Flirt','Gift','Suck up','Spend time'].includes(action) && before.relationships?.[person.id]?.usedAge===before.age && before.relationships[person.id].usedActions?.includes(action);
 const hasBar=['Compliment','Conversation','Gift','Suck up','Flirt'].includes(action);
 const pronoun=person.gender==='Female'?'Her':'His';
 const log=after.log.at(-1)?.text??'';
 let followUp:LifeEvent|undefined;
 const sameAgeGroup=(before.age<18)===(person.age<18);
 const dating=Object.values(after.relationships??{}).some(r=>r.status==='dating');
 const followRandom=seededRandom(`${before.id}:${person.id}:${before.age}:${action}:${before.log.length}:follow-up`)();
 if(action==='Compliment' && response.value>75 && followRandom<(response.value-75)/100){
  const subject=person.gender==='Female'?'She':'He';followUp={category:'Compliment',title:`A compliment from ${person.name}`,text:`${subject} told you that you have a wonderful personality.`,choices:[{label:'Thanks!',hint:'Accept the compliment.',outcome:`${person.name} complimented me.`,effect:{Happiness:10}}]};
 }
 if(action==='Insult' && followRandom<.25){followUp={category:'Insult',title:`${person.name} insulted you`,text:`${person.name.split(' ')[0]} called you an annoying loser.`,choices:[{label:'Ouch',hint:'That hurt.',outcome:`${person.name} insulted me back.`,effect:{Happiness:-10}}]};}
 if(action==='Flirt' && response.value===100 && sameAgeGroup){const kind=followRandom<.25?(before.age>=18?'hook':before.age>=16?'fun':null):followRandom<.35?'date':null;if(kind && (kind!=='date'||!dating)){const label=kind==='date'?'Ask out':kind==='hook'?'Hook up':'Have fun';followUp={category:'Invitation',title:kind==='date'?'An invitation to date':'An invitation',text:kind==='date'?`${person.name} asks if you would like to be ${person.gender==='Female'?'her':'his'} ${before.family?.gender==='Female'?'girlfriend':'boyfriend'}.`:`${person.name} asks if you would like to ${kind==='hook'?'hook up':'go out and have fun'}.`,choices:[{label:'Accept',hint:'Accept the invitation.',outcome:'',relationship:{id:person.id,action:label,invited:true}},{label:'Decline politely',hint:'Turn down the invitation.',outcome:`I declined ${person.name}'s invitation.`,relationshipResponse:{id:person.id,accept:false}}]};}}

 const text=hasBar?response.text:log.replace(/^I was /,'You were ').replace(/^I /,'You ').replace(/my /g,'your ').replace(/We /g,'You both ').replace(/our relationship/g,'your relationship').replace(/my friendship/g,'your friendship');
 const target=personAddress(person,'label');const title=action==='Compliment'?`A compliment for ${target}`:action==='Conversation'?`A conversation with ${target}`:action==='Gift'?`A gift for ${target}`:action==='Flirt'?`Flirting with ${target}`:action==='Befriend'?`A new friendship with ${target}`:action==='Ask out'?`Asking ${target} out`:action==='Insult'?`An argument with ${target}`:action==='Spend time'?`Time with ${target}`:action==='Suck up'?`Trying to impress ${target}`:action==='Act up'?`Acting up around ${target}`:action==='Disrespect'?`Disrespecting ${target}`:action==='Break up'?`Breaking up with ${target}`:action==='Unfriend'?`Ending a friendship with ${target}`:action==='Ask for money'?`Asking ${target} for money`:`${interactionLabels[action]} with ${target}`;
 return {title,text,change,...(followUp?{followUp}:{}),...(['Have fun','Hook up','Make love'].includes(action)&&(romance.accepted||invited)?{bars:[{label:'Your Enjoyment',value:romance.yourEnjoyment},{label:`${pronoun} Enjoyment`,value:romance.theirEnjoyment}]}:{}),...(hasBar?{meter:{label:`${pronoun} ${action==='Conversation'?'agreement':action==='Flirt'?'receptiveness':'appreciation'}`,value:response.value}}:{}),...(repeated?{note:'You already received the relationship effect of this interaction this year.'}:{})};
}
