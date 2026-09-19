import test from 'node:test';
import assert from 'node:assert/strict';
import {generateFamily} from '../src/family.ts';
import {characters} from '../src/relationships.ts';
import {restartLife,parseStore,upsertLife,emptyStore} from '../src/saves.ts';
import {advanceYear,answerLifeEvent} from '../src/mail.ts';
import {childhoodEvent,childhoodEventPools,childhoodEvents} from '../src/childhoodEvents.ts';
import {getOccupation,schoolAction,schoolStage} from '../src/occupation.ts';
const newborn = id => {const family=generateFamily(id,'River Smith'); return restartLife({id,name:'Sam River Smith',firstName:'Sam',lastName:'River Smith',city:'New York City',age:0,birthYear:2000,balance:0,stats:family.birthStats,family,log:[]});};
test('families share the child surname, usually both, with bounded inherited birth stats',()=>{
  let both=0;
  for(let seed=0;seed<200;seed++) {
    const family=generateFamily(String(seed),'River Smith');
    assert.deepEqual(generateFamily(String(seed),'River Smith'),family);
    assert.ok(family.parents.some(parent=>parent.name.endsWith(' River Smith')));
    if(family.parents.every(parent=>parent.name.endsWith(' River Smith'))) both++;
    for(const key of ['Smarts','Looks']) assert.ok(Math.abs(family.birthStats[key]-family.parents.reduce((sum,p)=>sum+p.stats[key],0)/family.parents.length)<=8.5);
  }
  assert.ok(both>150 && both<200);
});
test('family identity, parent ages, stats and inherited restart stats survive saving',()=>{
  const life=newborn('family-save');
  const loaded=parseStore(JSON.stringify(upsertLife(emptyStore(),life))).lives[0];
  assert.deepEqual(loaded.family,life.family);
  const parents=characters({...loaded,age:12}).personal.filter(person=>person.parent);
  assert.equal(parents[0].age,life.family.parents[0].ageAtBirth+12);
  assert.equal(parents[0].gender,'Female');assert.equal(parents[1].gender,'Male');
  assert.deepEqual(parents[0].stats,life.family.parents[0].stats);
  assert.deepEqual(restartLife({...loaded,age:18,stats:{...loaded.stats,Smarts:100}}).stats,life.family.birthStats);
  const corrupt=structuredClone(loaded);corrupt.family.parents[0].stats.Looks=101;
  assert.throws(()=>parseStore(JSON.stringify(upsertLife(emptyStore(),corrupt))));
});
test('a full childhood leads through elementary, middle, high school and a saved diploma',()=>{
  let life=newborn('education-life');
  assert.equal(childhoodEvents.length,13);
  for(let age=1;age<=18;age++) {
    life=advanceYear(life);assert.equal(life.age,age);
    assert.equal(advanceYear(life),life);
    if(age<=12) assert.equal(life.pendingEvent.event.title,childhoodEvent(age,life.id,Boolean(life.family?.siblings?.length)).title);
    if(age>=6 && age<18) {
      const school=getOccupation(life).school;
      assert.ok(school.grades>=0 && school.grades<=100);
      assert.equal(schoolStage(life,school),age<10?'Elementary school':age<14?'Middle school':'High school');
      assert.equal(schoolAction(life,'Study hard'),life);
    }
    life=answerLifeEvent(life,0);
    if(age>=6 && age<18) {
      const studied=schoolAction(life,'Study hard');
      assert.ok(studied.occupation.school.grades>=life.occupation.school.grades);
      assert.equal(schoolAction(studied,'Study hard').stats.Smarts,studied.stats.Smarts);
      life=schoolAction(studied,'Join an activity');
      assert.equal(schoolAction(life,'Join an activity'),life);
    }
    life=parseStore(JSON.stringify(upsertLife(emptyStore(),life))).lives[0];
  }
  assert.equal(life.occupation.school,null);
  assert.equal(life.occupation.highestEducation,'Secondary school');
  assert.match(life.log.at(-1).text,/graduated from high school/);
});

test('early childhood has varied deterministic events with broad effects and up to four choices',()=>{
 for(const age of [1,2,3,4,5]){
  const pool=childhoodEventPools[age];assert.equal(pool.length,6);
  assert.ok(pool.every(event=>event.icon && event.choices.length>=2 && event.choices.length<=4));
  assert.deepEqual(childhoodEvent(age,'stable-life'),childhoodEvent(age,'stable-life'));
  assert.ok(new Set(Array.from({length:40},(_,seed)=>childhoodEvent(age,`life-${seed}`).title)).size>1);
 }
 const effects=Object.values(childhoodEventPools).flat().flatMap(event=>event.choices);
 for(const stat of ['Health','Happiness','Smarts','Looks','Athleticism'])assert.ok(effects.some(choice=>choice.effect?.[stat]));
 assert.ok(effects.some(choice=>choice.familyEffect?.parents));
 assert.ok(effects.some(choice=>choice.familyEffect?.siblings));
});

test('childhood choices can change parent and sibling relationships',()=>{
 let life=newborn('family-event-effects');
 if(!life.family.siblings?.length)life.family.siblings=[{id:'sibling-test',name:'Avery Smith',gender:'Female',birthAge:-2,stats:{...life.stats}}];
 const parentEvent=childhoodEventPools[2].find(event=>event.title==='Bedtime rebellion');
 life={...life,age:2,relationships:Object.fromEntries([...life.family.parents,...life.family.siblings].map(person=>[person.id,{strength:70,status:'friend',friendship:true,stats:person.stats}])),pendingEvent:{age:2,event:parentEvent}};
 life=answerLifeEvent(life,parentEvent.choices.findIndex(choice=>choice.label==='Throw a tantrum'));
 for(const parent of life.family.parents)assert.equal(life.relationships[parent.id].strength,66);
 const siblingEvent=childhoodEventPools[3].find(event=>event.title==='A game with my sibling');
 life={...life,age:3,pendingEvent:{age:3,event:siblingEvent}};
 const before=life.family.siblings.map(sibling=>life.relationships[sibling.id].strength);
 life=answerLifeEvent(life,siblingEvent.choices.findIndex(choice=>choice.label==='Change the rules'));
 life.family.siblings.forEach((sibling,index)=>assert.equal(life.relationships[sibling.id].strength,before[index]-4));
});
test('only children do not receive sibling-only childhood scenarios or choices',()=>{
 for(const age of [1,2,3,4,5])for(let seed=0;seed<30;seed++){
  const selected=childhoodEvent(age,`only-${seed}`,false);
  assert.doesNotMatch(`${selected.title} ${selected.text}`,/sibling/i);
  assert.ok(selected.choices.length>=2);
  assert.ok(selected.choices.every(choice=>! /sibling/i.test(`${choice.label} ${choice.outcome}`)));
 }
});