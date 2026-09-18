import test from 'node:test';
import assert from 'node:assert/strict';
import {olderSiblingAges,firstChildAgeWeight} from '../src/siblingAges.ts';
import {generateFamily,seededRandom} from '../src/family.ts';
import {advanceYear,answerLifeEvent} from '../src/mail.ts';
import {restartLife,parseStore,upsertLife,emptyStore} from '../src/saves.ts';
test('first-child weighting favors late 20s and accounts for both parents ages',()=>{
 assert.ok(firstChildAgeWeight(28,30)>firstChildAgeWeight(18,20)*50);
 assert.ok(firstChildAgeWeight(24,28)>firstChildAgeWeight(24,18));
 assert.equal(firstChildAgeWeight(17,30),0);assert.equal(firstChildAgeWeight(30,17),0);
});
test('young couples rarely receive siblings implying teenage first births and usually have fewer older children',()=>{
 const young=seededRandom('young-family-history'),older=seededRandom('older-family-history');let youngCount=0,olderCount=0,teenCases=0;
 for(let i=0;i<20000;i++) {
 const ages=olderSiblingAges(young,23,24);youngCount+=ages.length;
 if(ages.some(age=>23-age<20 || 24-age<20))teenCases++;
 olderCount+=olderSiblingAges(older,33,34).length;
 }
 assert.ok(teenCases/20000<.02);assert.ok(youngCount<olderCount/3);
});
test('older sibling timelines retain viable parental ages, distinct births and plausible spacing',()=>{
 for(let i=0;i<1000;i++) {
 const family=generateFamily('history'+i,'Smith');const siblings=family.siblings;
 assert.ok(siblings.length<=3);
 for(const sibling of siblings)for(const parent of family.parents)assert.ok(parent.ageAtBirth+sibling.birthAge>=18);
 for(let j=1;j<siblings.length;j++){const difference=siblings[j].birthAge-siblings[j-1].birthAge;assert.ok(difference>=2 && difference<=4);}
 assert.deepEqual(restartLife({id:'history'+i,name:'Sam Smith',city:'New York City',age:0,birthYear:2000,balance:0,stats:family.birthStats,log:[],family}).family.siblings,siblings);
 }
});
test('promotions are logged immediately under the new age once, persist, and match parent occupations',()=>{
 let promoted=0;
 for(let i=0;i<100;i++) {
 const family=generateFamily('promotion'+i,'Smith');
 for(const parent of family.parents){parent.rank=0;parent.career=0;parent.occupation='Sales associate';parent.yearsInPosition=20;}
 const life=restartLife({id:'promotion'+i,name:'Sam Smith',city:'New York City',age:0,birthYear:2000,balance:0,stats:family.birthStats,log:[],family});
 // Restart correctly restores original careers, so set the test careers afterward.
 for(const parent of life.family.parents){parent.rank=0;parent.career=0;parent.occupation='Sales associate';parent.yearsInPosition=20;}
 const next=advanceYear(life),lines=next.log.filter(entry=>entry.text.includes('has been promoted'));
 const changed=next.family.parents.filter(parent=>parent.rank===1);
 assert.equal(lines.length,changed.length);promoted+=lines.length;
 for(const parent of changed)assert.ok(lines.some(entry=>entry.age===1 && entry.text===`My ${parent.relation.toLowerCase()} has been promoted to ${parent.occupation}.`));
 assert.strictEqual(advanceYear(next),next);
 let answered=next;while(answered.pendingEvent)answered=answerLifeEvent(answered,0);
 assert.equal(answered.log.filter(entry=>entry.text.includes('has been promoted')).length,lines.length);
 const loaded=parseStore(JSON.stringify(upsertLife(emptyStore(),next))).lives[0];assert.deepEqual(loaded.log,next.log);
 }
 assert.ok(promoted>0);
});
