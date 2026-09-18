import {personAddress} from '../src/personAddress.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,interact,availableActions,actionUnavailable} from '../src/relationships.ts';
import {interactionResult} from '../src/interactionResults.ts';
const life=id=>({id,name:'Sam Smith',city:'New York City',age:18,birthYear:2000,balance:1000,stats:{Health:90,Happiness:80,Smarts:70,Looks:60},log:[]});
test('only compliments, conversations and gifts have reaction meters; all valid actions have outcome text',()=>{
 const current=life('response-bars'),people=characters(current),friend=people.personal.find(p=>p.id==='maya-chen');
 for(const person of [friend,people.personal[0],characters({...current,age:12}).school.find(p=>p.relation==='Teacher')]){
  const before=person.relation==='Teacher'?{...current,age:12}:current;
  for(const action of availableActions(person,before).filter(action=>!actionUnavailable(before,person,action))){
   const after=interact(before,person.id,action,action==='Gift'?'flowers':undefined);assert.notEqual(after,before);
   const result=interactionResult(before,after,person,action,action==='Gift'?'flowers':undefined);
   assert.equal(Boolean(result.meter),['Compliment','Conversation','Gift','Suck up','Flirt'].includes(action));assert.match(result.text,/^You/);assert.ok(result.text.includes(personAddress(person)) || action==='Ask for money');
   if(action==='Conversation')assert.match(result.meter.label,/agreement/);if(action==='Gift' || action==='Compliment')assert.match(result.meter.label,/appreciation/);
  }
 }
});
test('low reaction bars mean lost relationship and higher bars mean larger gains',()=>{
 for(const action of ['Compliment','Conversation']){
  const results=[];
  for(let i=0;i<100;i++){const before=life(`reaction-${i}`),person={...characters(before).personal.find(p=>p.id==='maya-chen'),strength:50};
   before.relationships={[person.id]:{strength:50,status:'friend',friendship:true,stats:person.stats}};
   const after=interact(before,person.id,action);results.push(interactionResult(before,after,person,action));}
  assert.ok(results.some(r=>r.change<0));assert.ok(results.some(r=>r.change>0));
  for(const result of results){if(result.change<0)assert.ok(result.meter.value<=12);else assert.ok(result.meter.value>=59);}
  const positives=results.filter(r=>r.change>0).sort((a,b)=>a.change-b.change);assert.ok(positives.at(-1).meter.value>positives[0].meter.value);
 }
});
test('gift result reflects its actual effect; repeat outcomes clearly report no additional gain',()=>{
 const before=life('gift-results'),person=characters(before).personal[0];
 const after=interact(before,person.id,'Gift','soap'),result=interactionResult(before,after,person,'Gift','soap');assert.ok(result.change<0);assert.ok(result.meter.value<=15);assert.match(result.text,/deodorant/);
 const currentPerson=characters(after).personal.find(p=>p.id===person.id),repeat=interact(after,person.id,'Gift','flowers');
 const repeated=interactionResult(after,repeat,currentPerson,'Gift','flowers');assert.equal(repeated.change,0);assert.equal(repeated.meter.value,50);assert.match(repeated.note,/this year/);
});

test('family and teacher actions use familiar forms of address while preserving full profile names',()=>{
 const before=life('names-test'),parent=characters(before).personal[0];assert.equal(personAddress(parent),'your mother');
 const compliment=interact(before,parent.id,'Compliment');assert.match(compliment.log.at(-1).text,/my mother/);assert.ok(!compliment.log.at(-1).text.includes(parent.name));
 assert.match(interactionResult(before,compliment,parent,'Compliment').text,/your mother/);
 const sibling={...parent,parent:false,relation:'Sister',name:'Sofia Smith'};assert.equal(personAddress(sibling),'your sister');
 for(const gender of ['Male','Female']){const teacher={...parent,parent:false,family:false,relation:'Teacher',name:'Alex Smith',gender,occupation:'Math teacher'};assert.equal(personAddress(teacher),`${gender==='Male'?'Mr.':'Ms.'} Smith`);assert.equal(personAddress({...teacher,relation:'Friend'}),personAddress(teacher));}
});
