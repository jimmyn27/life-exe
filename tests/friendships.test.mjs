import test from 'node:test';
import assert from 'node:assert/strict';
import {generateFamily} from '../src/family.ts';
import {initialRelationship} from '../src/relationshipModel.ts';
import {getOccupation,libraryJob} from '../src/occupation.ts';
import {characters,interact,initializeWorkRelationships,actionUnavailable} from '../src/relationships.ts';
import {advanceYear,answerLifeEvent} from '../src/mail.ts';
import {advanceFriendships,resolveFriendship} from '../src/friendships.ts';
import {interactionResult} from '../src/interactionResults.ts';
import {emptyStore,upsertLife,parseStore} from '../src/saves.ts';
const life=(age=14,id='friendship')=>({id,name:'Sam Smith',firstName:'Sam',lastName:'Smith',city:'New York City',age,birthYear:2000,balance:100,sexuality:'Bisexual',family:generateFamily(id,'Smith'),stats:{Health:80,Happiness:70,Intelligence:70,Charisma:70},log:[]});
const saved=l=>parseStore(JSON.stringify(upsertLife(emptyStore(),l))).lives[0];
const friend=(name,strength)=>({profile:{name,gender:'Female',ageOffset:0,education:'Middle school',occupation:'Student'},strength,status:'friend',friendship:true,stats:{Health:80,Happiness:70,Intelligence:70,Charisma:70}});
test('family starts at one hundred; charisma bias is bounded and contact values persist after charisma change',()=>{
 const l=life();for(const p of characters(l).personal.filter(p=>p.family))assert.equal(p.strength,100);
 let high=0,low=0;for(let i=0;i<1000;i++){const a=initialRelationship('seed',String(i),0),b=initialRelationship('seed',String(i),100);assert.ok(a>=25 && b<=75 && b>=a);high+=b;low+=a;}assert.ok(high-low>10000);
 const enrolled={...l,occupation:getOccupation(l)};const peers=characters(enrolled).school.filter(p=>p.relation==='Classmate');assert.ok(peers.every(p=>p.strength>=25 && p.strength<=75));assert.deepEqual(characters({...enrolled,stats:{...l.stats,Charisma:0}}).school.map(p=>p.strength),characters(enrolled).school.map(p=>p.strength));
 const employed=initializeWorkRelationships({...l,occupation:{...getOccupation(l),job:libraryJob(14)}});assert.deepEqual(characters({...employed,stats:{...l.stats,Charisma:0}}).work.map(p=>p.strength),characters(employed).work.map(p=>p.strength));
});
test('befriending improves strength; friends and partners decay five per year while parents do not before nineteen',()=>{
 const l=life(),peer=characters(l).school.find(p=>p.relation==='Classmate');l.relationships={[peer.id]:{strength:100,status:'acquaintance',stats:peer.stats}};const befriended=interact(l,peer.id,'Befriend');assert.equal(befriended.relationships[peer.id].strength,100);assert.equal(befriended.stats.Happiness,95);
 befriended.relationships.partner={...friend('Partner',80),status:'dating'};const next=advanceFriendships({...befriended,age:15}).life;assert.equal(next.relationships[peer.id].strength,befriended.relationships[peer.id].strength-5);assert.equal(next.relationships.partner.strength,75);assert.equal(characters(next).personal.find(p=>p.parent).strength,100);
});
test('multiple friendship decisions queue before the yearly event, persist, and must be completed one by one',()=>{
 let next;for(let i=0;i<100;i++){const l={...life(14,`queue-${i}`),relationships:{a:friend('Anna',5),b:friend('Beth',5)}};const n=advanceYear(l);if(n.pendingEvent.event.choices[0].friendshipDecision && n.pendingEvent.queue?.[0].choices[0].friendshipDecision){next=n;break;}}
 assert.ok(next);next=saved(next);const startHappiness=next.stats.Happiness;assert.equal(advanceYear(next),next);const firstId=next.pendingEvent.event.choices[1].friendshipDecision.id;
 next=answerLifeEvent(next,1);assert.equal(next.relationships[firstId].friendship,false);assert.equal(next.stats.Happiness,startHappiness-10);assert.equal(next.pendingEvent.event.category,'Friendship');
 next=answerLifeEvent(saved(next),1);assert.equal(next.stats.Happiness,startHappiness-20);assert.ok(next.pendingEvent);next=answerLifeEvent(next,0);assert.equal(next.pendingEvent,undefined);
});
test('salvage successes restore friendship and happiness; failures cost more happiness than wishing well',()=>{
 let success=false,failure=false;for(let i=0;i<100;i++){const l={...life(15,`salvage-${i}`),relationships:{f:friend('Friend',30)}};const n=resolveFriendship(l,'f',true);if(n.relationships.f.friendship){success=true;assert.equal(n.relationships.f.strength,40);assert.equal(n.stats.Happiness,80);}else{failure=true;assert.equal(n.stats.Happiness,50);}assert.equal(resolveFriendship(l,'f',false).stats.Happiness,60);}assert.ok(success && failure);
});
test('dating begins at twelve, blocks minor/adult pairing, and intimacy is adult-only with partner action replacement',()=>{
 for(const age of [9,10,16,18]){const l=life(age),p=characters(l).school.find(p=>p.relation==='Classmate')??{...characters(l).personal[0],parent:false,family:false,relation:'Friend',occupation:'Student',friendship:true,age};assert.equal(Boolean(actionUnavailable(l,p,'Ask out')),age<12);if(age<18)assert.ok(actionUnavailable(l,p,'Make love'));assert.ok(actionUnavailable(l,{...p,age:age<18?18:17},'Ask out'));}
 let accepted;for(let i=0;i<100;i++){let l={...life(18,`adult-${i}`),relationships:{f:friend('Friend',90)}};let p=characters(l).personal.find(p=>p.id==='f');l.family.gender=p.gender==='Female'?'Male':'Female';p=characters(l).personal.find(p=>p.id==='f');const after=interact(l,'f','Hook up');if(after.log.at(-1)?.text.startsWith('I hooked up')){accepted={l,p,after};break;}}
 assert.ok(accepted);const result=interactionResult(accepted.l,accepted.after,accepted.p,'Hook up');assert.deepEqual(result.bars.map(b=>b.label),['Your Enjoyment','Her Enjoyment']);assert.deepEqual(saved(accepted.after),accepted.after);
 const dating={...accepted.l,relationships:{f:{...accepted.l.relationships.f,status:'dating'}}};const p=characters(dating).personal.find(p=>p.id==='f');assert.equal(p.status,'dating');assert.equal(actionUnavailable(dating,p,'Make love'),null);assert.deepEqual(saved(interact(dating,'f','Make love')),interact(dating,'f','Make love'));
});

test('acquaintances stay stable while befriended school and work contacts, siblings, and adult parents decay',()=>{
 let current=life(17,'decay-scope');
 const sibling={id:'sibling-test',name:'Taylor Smith',gender:'Female',birthAge:-2,stats:{Health:80,Happiness:70,Intelligence:60,Charisma:65}};
 current.family={...current.family,siblings:[sibling]};
 current.occupation={...getOccupation(current),job:libraryJob(14)};
 const contacts=characters(current),classmate=contacts.school.find(p=>p.relation==='Classmate'),manager=contacts.work.find(p=>p.relation==='Manager'),parent=current.family.parents[0];
 current.relationships={
  [classmate.id]:{strength:60,status:'acquaintance',stats:classmate.stats},
  [manager.id]:{strength:60,status:'acquaintance',stats:manager.stats},
  friend:{...friend('School Friend',60)},
  workFriend:{...friend('Work Friend',60),profile:{name:'Work Friend',gender:'Male',ageOffset:5,education:'University',occupation:'Manager'}},
  [sibling.id]:{strength:100,status:'friend',friendship:true,stats:sibling.stats},
  [parent.id]:{strength:100,status:'friend',friendship:true,stats:parent.stats}
 };
 const atEighteen=advanceFriendships({...current,age:18}).life;
 assert.equal(atEighteen.relationships[classmate.id].strength,60);assert.equal(atEighteen.relationships[manager.id].strength,60);
 assert.equal(atEighteen.relationships.friend.strength,55);assert.equal(atEighteen.relationships.workFriend.strength,55);assert.equal(atEighteen.relationships[sibling.id].strength,95);assert.equal(atEighteen.relationships[parent.id].strength,100);
 const atNineteen=advanceFriendships({...current,age:19}).life;assert.equal(atNineteen.relationships[parent.id].strength,95);
});