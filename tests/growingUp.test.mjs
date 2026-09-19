import test from 'node:test';
import assert from 'node:assert/strict';
import {generateFamily} from '../src/family.ts';
import {characters} from '../src/relationships.ts';
import {restartLife,parseStore,upsertLife,emptyStore} from '../src/saves.ts';
import {advanceYear,answerLifeEvent} from '../src/mail.ts';
import {childhoodEvents} from '../src/childhoodEvents.ts';
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
    if(age<=12) assert.equal(life.pendingEvent.event.title,childhoodEvents[age].title);
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
