import {interactionEmojis,interactionLabels} from './interactionText.ts';
import {romanceOutcome} from './romance.ts';
import {personAddress} from './personAddress.ts';
import {seededRandom} from './family.ts';
import {giftEffect,gifts} from './gifts.ts';
import type {LifeEvent} from './data';
import type {Life} from './saves';
import type {Person,RelationshipAction} from './relationships';
export type InteractionResult={title:string;icon:string;text:string;meter?:{label:string;value:number};change:number;bars?:{label:string;value:number}[];followUp?:LifeEvent};
const compliments=[
 'You told NAME they have a wonderful sense of humor.','You called NAME thoughtful and kind.','You told NAME you admire their creativity.','You complimented NAME on their great sense of style.',
 'You told NAME they always know how to brighten a room.','You praised NAME for being such a good listener.','You told NAME their smile is contagious.','You admired NAME for working so hard.',
 'You told NAME they give excellent advice.','You complimented NAME on their confidence.','You said NAME has a remarkable imagination.','You told NAME they are easy to talk to.',
 'You praised NAME for being dependable.','You told NAME they have great taste in music.','You said NAME always makes people feel welcome.','You complimented NAME on handling a difficult situation well.'
];
const childTopics=['favorite toys','animals','a story you heard','what to play next','cartoons','a funny dream','dinosaurs','your favorite snack','a trip to the park','make-believe games'];
const olderTopics=['favorite movies','music','school','plans for the future','sports','a funny memory','a book you enjoyed','travel','food','a recent news story','hobbies','friendship','video games','a place you want to visit','something embarrassing','your hopes and worries'];
const repeatedLines:Partial<Record<RelationshipAction,string[]>>={
 Compliment:['You had already paid them a meaningful compliment this year. Another one felt forced.','You decided to wait before complimenting them again.','You had already said what you wanted to say, so you saved another compliment for later.'],
 Conversation:['You had already had a meaningful conversation with them this year. You decided to give it time.','You tried to start another deep conversation, but there was nothing new to say yet.','You decided to wait until you both had more to talk about.'],
 Flirt:['You had already tested the waters this year. Pushing again felt like too much.','You decided to give them some space before flirting again.','You held back and waited for a better moment.'],
 Gift:['You had already given them a meaningful gift this year. Another one would not have the same impact.','You decided to save your next gift for a more meaningful occasion.','You had already made your gesture this year, so you waited.'],
 'Suck up':['You had already tried hard enough to impress them this year.','You decided that more flattery would be too obvious.','You had reached the limit of how much approval you could win this year.'],
 'Spend time':['You had already made meaningful time for each other this year.','You spent more time together, but the relationship had already gained all it could this year.','You enjoyed another outing together, although it did not bring you any closer this year.']
};
const pick=<T,>(items:T[],random:()=>number)=>items[Math.floor(random()*items.length)];
const genderText=(text:string,person:Person)=>{const female=person.gender==='Female';return text.replace(/\bthem\b/gi,match=>match[0]===match[0].toUpperCase()?(female?'Her':'Him'):(female?'her':'him')).replace(/\btheir\b/gi,match=>match[0]===match[0].toUpperCase()?(female?'Her':'His'):(female?'her':'his')).replace(/\bthey\b/gi,match=>match[0]===match[0].toUpperCase()?(female?'She':'He'):(female?'she':'he'));};
export function reaction(life:Life,person:Person,action:RelationshipAction,giftId?:string){
 const random=seededRandom(`${life.id}:${person.id}:${life.age}:${action}:${life.log.length}:response`),sample=random(),relationship=person.strength;
 let value=Math.max(0,Math.min(100,Math.round(relationship*.65+sample*35))),delta=0;
 if(action==='Conversation'){value=Math.max(0,Math.min(100,Math.round(relationship*.45+sample*55)));delta=-5+Math.round(value*.15);}
 else if(action==='Flirt'){value=Math.max(0,Math.min(100,Math.round(life.stats.Charisma*.65+relationship*.25+sample*10)));delta=-10+Math.round(value*.35);}
 else if(action==='Suck up')delta=-10+Math.round(value*.3);else if(action==='Compliment')delta=Math.round(value*.25);
 const topics=life.age<6?childTopics:olderTopics;
 const rawText=action==='Suck up'?`You told ${personAddress(person)} their class is your favorite.`:action==='Compliment'?pick(compliments,random).replace('NAME',personAddress(person)):action==='Conversation'?`You and ${personAddress(person)} talked about ${pick(topics,random)}.`:action==='Flirt'?`You flirted with ${personAddress(person)}.`:'';
 const text=rawText.replace(/they have/g,person.gender==='Female'?'she has':'he has').replace(/their /g,person.gender==='Female'?'her ':'his ').replace(/\bthey\b/g,person.gender==='Female'?'she':'he');
 if(action==='Gift'){const gift=gifts.find(item=>item.id===giftId),effect=gift?giftEffect(life,person,gift):6;value=Math.max(0,Math.min(100,Math.round(effect<0?25+effect*2+relationship*.1+(sample-.5)*18:50+effect*3+(relationship-50)*.3+(sample-.5)*18)));delta=-10+Math.round(value*.35);return {delta,value,text:gift?`You gave ${personAddress(person)} ${gift.name.toLowerCase()} ($${gift.price}).`:`You gave ${personAddress(person)} a gift.`};}
 return {delta,value,text};
}
export function interactionResult(before:Life,after:Life,person:Person,action:RelationshipAction,giftId?:string,invited=false):InteractionResult{
 const romance=romanceOutcome(before,person,action),response=reaction(before,person,action,giftId),change=(after.relationships?.[person.id]?.strength??person.strength)-person.strength;
 const repeated=['Compliment','Conversation','Flirt','Gift','Suck up','Spend time'].includes(action)&&before.relationships?.[person.id]?.usedAge===before.age&&before.relationships[person.id].usedActions?.includes(action),hasBar=['Compliment','Conversation','Gift','Suck up','Flirt'].includes(action),pronoun=person.gender==='Female'?'Her':'His';
 const log=after.log.at(-1)?.text??'';let followUp:LifeEvent|undefined;const sameAgeGroup=(before.age<18)===(person.age<18),dating=Object.values(after.relationships??{}).some(r=>r.status==='dating'),followRandom=seededRandom(`${before.id}:${person.id}:${before.age}:${action}:${before.log.length}:follow-up`)();
 if(action==='Compliment'&&response.value>75&&followRandom<(response.value-75)/100){const subject=person.gender==='Female'?'She':'He';followUp={category:'Compliment',title:`A compliment from ${person.name}`,text:`${subject} told you that you have a wonderful personality.`,acknowledge:true,choices:[{label:'OK',hint:'',outcome:`${person.name} complimented me.`,effect:{Happiness:10}}]};}
 if(action==='Insult'&&followRandom<.25)followUp={category:'Insult',title:`${person.name} insulted you`,text:`${person.name.split(' ')[0]} called you an annoying loser.`,acknowledge:true,choices:[{label:'OK',hint:'',outcome:`${person.name} insulted me back.`,effect:{Happiness:-10}}]};
 if(action==='Flirt'&&response.value===100&&sameAgeGroup){const kind=followRandom<.25?(before.age>=18?'hook':before.age>=16?'fun':null):followRandom<.35?'date':null;if(kind&&(kind!=='date'||!dating)){const label=kind==='date'?'Ask out':kind==='hook'?'Hook up':'Have fun';followUp={category:'Invitation',title:kind==='date'?'An invitation to date':'An invitation',text:kind==='date'?`${person.name} asks if you would like to be ${person.gender==='Female'?'her':'his'} ${before.family?.gender==='Female'?'girlfriend':'boyfriend'}.`:`${person.name} asks if you would like to ${kind==='hook'?'hook up':'go out and have fun'}.`,choices:[{label:'Accept',hint:'',outcome:'',relationship:{id:person.id,action:label,invited:true}},{label:'Decline politely',hint:'',outcome:`I declined ${person.name}'s invitation.`,relationshipResponse:{id:person.id,accept:false}}]};}}
 const standardText=hasBar?response.text:log.replace(/^I was /,'You were ').replace(/^I /,'You ').replace(/my /g,'your ').replace(/We /g,'You both ').replace(/our relationship/g,'your relationship').replace(/my friendship/g,'your friendship');
 const repeatRandom=seededRandom(`${before.id}:${person.id}:${before.age}:${action}:${before.log.length}:repeat-text`),text=genderText(repeated&&repeatedLines[action]?.length?pick(repeatedLines[action]!,repeatRandom):standardText,person),target=personAddress(person,'label');
 const titles:Record<RelationshipAction,string[]>={
  'Break up':[`Breaking up with ${target}`,`Ending things with ${target}`,'A difficult goodbye','Going separate ways','The end of a relationship'],
  Befriend:[`A new friendship with ${target}`,`Reaching out to ${target}`,'Becoming friends','Making a new connection',`Getting to know ${target}`],
  'Ask for money':[`Asking ${target} for money`,'A request for help','Could you spare some money?','Needing a little help','Making a financial request'],
  'Ask out':[`Asking ${target} out`,`Taking a chance with ${target}`,'A romantic question','Putting my heart on the line','An invitation for two'],
  Compliment:[`A compliment for ${target}`,`A kind word for ${target}`,`Making ${target} smile`,'Something nice to say','Brightening their day','Giving credit where it is due','A thoughtful observation','Sharing some appreciation'],
  Conversation:[`A conversation with ${target}`,`Catching up with ${target}`,`Talking with ${target}`,'Finding something to talk about','A good chat','Exchanging thoughts','A moment to connect','Talking things through','Sharing stories','A lively discussion','Passing the time together','Seeing eye to eye'],
  Flirt:[`Flirting with ${target}`,'Turning on the charm',`A playful moment with ${target}`,'Testing the waters','A little chemistry'],
  Gift:[`A gift for ${target}`,`A little something for ${target}`,`Giving ${target} a present`,'A thoughtful gesture','Something wrapped with care'],
  'Have fun':[`Having fun with ${target}`,`An afternoon with ${target}`,`Going out with ${target}`,'An easygoing adventure','Making a memory together'],
  'Hook up':[`A private moment with ${target}`,`Getting closer to ${target}`,`A night with ${target}`,'Taking a chance together','A mutual attraction'],
  Insult:[`An argument with ${target}`,`Harsh words for ${target}`,'Losing my temper','Crossing a line','Words that sting'],
  'Make love':[`An intimate moment with ${target}`,`Getting closer to ${target}`,`Time alone with ${target}`,'A private evening together','Sharing intimacy'],
  'Spend time':[`Time with ${target}`,`A day with ${target}`,'Enjoying each other’s company','Making time for each other','A shared afternoon','Out and about together','A welcome break together','Catching up in person','A little quality time','Making another memory','A relaxed day together','An outing to remember'],
  Unfriend:[`Ending a friendship with ${target}`,'Going separate ways','No longer friends','Cutting ties','Leaving a friendship behind'],
  'Act up':[`Acting up around ${target}`,'Causing trouble',`Misbehaving around ${target}`,'Pushing the rules','Making a scene'],
  Disrespect:[`Disrespecting ${target}`,`Talking back to ${target}`,`Challenging ${target}`,'Showing no respect','A serious confrontation'],
  'Suck up':[`Trying to impress ${target}`,`Winning ${target} over`,'Looking for approval','Laying on the praise','Trying to become the favorite']
 };
 const titlePool=titles[action]??[`${interactionLabels[action]} with ${target}`],offset=Math.floor(seededRandom(`${before.id}:${person.id}:${action}:title-offset`)()*titlePool.length),title=genderText(titlePool[(offset+before.log.length)%titlePool.length],person);
 return {title,icon:interactionEmojis[action],text,change,...(followUp?{followUp}:{}),...(['Have fun','Hook up','Make love'].includes(action)&&(romance.accepted||invited)&&!repeated?{bars:[{label:'Your Enjoyment',value:romance.yourEnjoyment},{label:`${pronoun} Enjoyment`,value:romance.theirEnjoyment}]}:{}),...(hasBar&&!repeated?{meter:{label:`${pronoun} ${action==='Conversation'?'agreement':action==='Flirt'?'receptiveness':'appreciation'}`,value:response.value}}:{})};
}