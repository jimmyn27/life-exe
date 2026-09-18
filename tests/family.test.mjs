import test from 'node:test';
import assert from 'node:assert/strict';
import {generateFamily, promotionChance, siblingBirthChance} from '../src/family.ts';
import {characters,availableActions,interact,actionUnavailable} from '../src/relationships.ts';
import {restartLife,parseStore,upsertLife,emptyStore} from '../src/saves.ts';
import {advanceYear,answerLifeEvent} from '../src/mail.ts';
const create=id=>restartLife({id,name:'Sam Smith',firstName:'Sam',lastName:'Smith',city:'New York City',birthYear:2000,age:0,balance:0,stats:{Health:90,Happiness:80,Smarts:70,Looks:60},log:[],family:generateFamily(id,'Smith')});
test('birth has a complete introduction and no popup; single mothers and older siblings occur',()=>{
 let single=0,older=0;
 for(let i=0;i<100;i++) {const life=create('birth'+i);assert.equal(life.pendingEvent,undefined);assert.match(life.log[0].text,/I was born a (male|female) in New York City, United States/);assert.match(life.log[0].text,/My name is Sam Smith/);assert.match(life.log[0].text,/My mother is/);if(life.family.parents.length===1){single++;assert.ok(life.family.parents[0].name.endsWith(' Smith'));assert.doesNotMatch(life.log[0].text,/My father is/);}older+=life.family.siblings.length;for(const s of life.family.siblings)assert.ok(life.family.parents[0].ageAtBirth+s.birthAge>=18);}
 assert.ok(single>0);assert.ok(older>0);
});
test('family actions unlock at two and six and require sibling age too',()=>{
 const life=create('gates');const mother=characters(life).personal[0];
 for(const age of [0,1])assert.deepEqual(availableActions(mother,{...life,age}),[]);
 for(const age of [2,5])assert.deepEqual(availableActions(mother,{...life,age}),['Conversation','Spend time']);
 assert.deepEqual(availableActions(mother,{...life,age:6}),['Ask for money','Compliment','Conversation','Insult','Spend time']);
 assert.deepEqual(availableActions({...mother,parent:false,family:true,age:1},{...life,age:6}),[]);
 assert.deepEqual(availableActions({...mother,parent:false,family:true,age:2},{...life,age:6}),['Conversation','Spend time']);
});
test('stat effects apply once per action per person per year, persist, and reset next year',()=>{
 let life={...create('repeat'),age:6};const id=characters(life).personal[0].id;
 life=interact(life,id,'Compliment');const stats=structuredClone(life.stats),record=structuredClone(life.relationships[id]);
 life=interact(life,id,'Compliment');assert.deepEqual(life.stats,stats);assert.deepEqual(life.relationships[id],record);assert.equal(life.log.length,3);
 life=parseStore(JSON.stringify(upsertLife(emptyStore(),life))).lives[0];assert.deepEqual(interact(life,id,'Compliment').stats,stats);
 const next=interact({...life,age:7},id,'Compliment');assert.ok(next.relationships[id].strength>record.strength);
});
test('money requests are limited per parent per year even on refusal and survive saves',()=>{
 let life={...create('money'),age:6};
 for(const parent of characters(life).personal.filter(p=>p.parent)) {life=interact(life,parent.id,'Ask for money');const once=life;assert.strictEqual(interact(life,parent.id,'Ask for money'),once);assert.ok(actionUnavailable(life,characters(life).personal.find(p=>p.id===parent.id),'Ask for money'));}
 life=parseStore(JSON.stringify(upsertLife(emptyStore(),life))).lives[0];const mother=characters(life).personal[0];assert.ok(actionUnavailable(life,mother,'Ask for money'));assert.equal(actionUnavailable({...life,age:7},mother,'Ask for money'),null);
});
test('experience increases promotion odds and maternal age and family size reduce births',()=>{
 assert.ok(promotionChance(10)>promotionChance(1));assert.ok(siblingBirthChance(25,2)>siblingBirthChance(40,2));assert.ok(siblingBirthChance(25,2)>siblingBirthChance(25,4));assert.equal(siblingBirthChance(45,1),0);
});
test('annual family simulation is deterministic, births queue events and restart restores birth family',()=>{
 let births=0;
 for(let i=0;i<100;i++) {const life=create('annual'+i),next=advanceYear(life);assert.deepEqual(advanceYear(life),next);assert.ok(next.family.money>=life.family.money);assert.deepEqual(restartLife(next).family,life.family);
 if(next.pendingEvent.queue){births++;assert.equal(next.pendingEvent.event.category,'Family');const answered=answerLifeEvent(next,0);assert.ok(answered.pendingEvent);assert.equal(answerLifeEvent(answered,0).pendingEvent,undefined);assert.deepEqual(parseStore(JSON.stringify(upsertLife(emptyStore(),next))).lives[0],JSON.parse(JSON.stringify(next)));}}
 assert.ok(births>0);
});
