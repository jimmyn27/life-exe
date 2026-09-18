import test from 'node:test';
import assert from 'node:assert/strict';
import {namePool,givenNamesForGender} from '../src/catalogs/us/lifeContent.ts';
import {getOccupation} from '../src/occupation.ts';
import {classroomSize} from '../src/schoolCommunity.ts';
import {advanceYear,answerLifeEvent} from '../src/mail.ts';
import {characters,availableActions,interact} from '../src/relationships.ts';
import {schoolActivities,applySchoolActivity,workCategories} from '../src/schoolActivities.ts';
import {parseStore,upsertLife,emptyStore,restartLife,loadStore,SAVE_KEY} from '../src/saves.ts';
const life=age=>({id:'school-system',name:'Sam Smith',city:'New York City',age,birthYear:2000,balance:100,stats:{Health:90,Happiness:80,Smarts:70,Looks:60},log:[]});
const answer=next=>{while(next.pendingEvent)next=answerLifeEvent(next,0);return next;};
const peers=current=>getOccupation(current).school.roster.filter(p=>p.relation==='Classmate');
const staff=current=>getOccupation(current).school.roster.filter(p=>p.relation!=='Classmate');
const saved=current=>parseStore(JSON.stringify(upsertLife(emptyStore(),current))).lives[0];
test('expanded pools are unique and gender pools retain neutral names',()=>{
 assert.ok(namePool.givenNames.length>=175 && namePool.surnames.length>=140);
 assert.equal(new Set(namePool.givenNames).size,namePool.givenNames.length);assert.equal(new Set(namePool.surnames).size,namePool.surnames.length);
 assert.ok(givenNamesForGender('Male').includes('Adam'));assert.ok(givenNamesForGender('Female').includes('Alice'));assert.ok(givenNamesForGender('Male').includes('Alex') && givenNamesForGender('Female').includes('Alex'));
});
test('school classes are appropriately sized, have principals and multiple teachers, and save stable identities',()=>{
 for(const age of [6,12,15]){const current=life(age),occupation=getOccupation(current);assert.equal(peers(current).length+1,classroomSize(age));assert.equal(staff(current).filter(p=>p.relation==='Principal').length,1);assert.ok(staff(current).filter(p=>p.relation==='Teacher').length>=3);
 const schoolPeople=characters(current).school;assert.equal(new Set(schoolPeople.map(p=>p.id)).size,schoolPeople.length);assert.equal(new Set(schoolPeople.map(p=>p.name)).size,schoolPeople.length);
 for(const person of schoolPeople){assert.ok(person.age>=age);assert.equal(Object.keys(person.stats).length,4);}
 const loaded=saved({...current,occupation});assert.deepEqual(characters(loaded).school,schoolPeople);}
});
test('rosters mostly persist yearly, change more at stage transitions, and replace all stage staff',()=>{
 let current=life(5);
 for(let age=6;age<=18;age++){
 const previous=current,next=advanceYear(current);assert.equal(next.age,age);
 if(age>6 && age<18){const old=peers(previous),now=peers(next);const retained=now.filter(p=>old.some(o=>o.id===p.id));
 if(age===12 || age===15){assert.ok(retained.length>=old.length*.65 && retained.length<old.length);assert.ok(staff(next).every(p=>!staff(previous).some(o=>o.id===p.id)));}
 else{assert.ok(retained.length>=old.length-2);assert.deepEqual(staff(next),staff(previous));}
 for(const person of retained)assert.deepEqual(person,old.find(o=>o.id===person.id));
 }
 if(age===12)assert.equal(next.occupation.school.level,'Middle school');if(age===15){assert.equal(next.occupation.highestEducation,'Middle school');assert.equal(next.occupation.school.startAge,15);}
 current=saved(answer(next));
 }
 assert.equal(current.occupation.highestEducation,'Secondary school');assert.equal(current.occupation.school,null);
});
test('acquaintances must be befriended before unfriending; friends persist when classmates leave and after graduation',()=>{
 let current=life(12);const person=characters(current).school[0];assert.equal(person.status,'acquaintance');assert.equal(availableActions(person,current)[0],'Befriend');assert.ok(!availableActions(person,current).includes('Unfriend'));assert.strictEqual(interact(current,person.id,'Unfriend'),current);
 current=interact(current,person.id,'Befriend');assert.ok(characters(current).personal.some(p=>p.id===person.id));assert.ok(!availableActions(characters(current).school[0],current).includes('Befriend'));
 current=saved(current);const occupation=getOccupation(current);current={...current,occupation:{...occupation,school:{...occupation.school,roster:occupation.school.roster.filter(p=>p.id!==person.id)}}};assert.ok(characters(current).personal.some(p=>p.id===person.id));
 current={...current,age:18,occupation:{highestEducation:'Secondary school',school:null,job:null}};assert.ok(characters(current).personal.some(p=>p.id===person.id && p.age===18));
 current=interact(current,person.id,'Unfriend');assert.ok(!characters(current).personal.some(p=>p.id===person.id));assert.equal(restartLife(current).relationships,undefined);
 for(const parent of characters(life(12)).personal.filter(p=>p.family))assert.ok(!availableActions(parent,life(12)).includes('Befriend'));
});
test('clubs and sports have persisted random decisions with one attempt per year and memberships carry until school changes',()=>{
 assert.ok(schoolActivities.some(a=>a.group==='Clubs') && schoolActivities.some(a=>a.group==='Sports'));
 assert.strictEqual(applySchoolActivity(life(11),'chess').age,11);assert.strictEqual(applySchoolActivity(life(18),'chess').age,18);
 let current=life(12);for(const activity of schoolActivities){const next=applySchoolActivity(current,activity.id);assert.notStrictEqual(next,current);assert.deepEqual(applySchoolActivity(current,activity.id),next);assert.strictEqual(applySchoolActivity(next,activity.id),next);current=next;}
 const loaded=saved(current);assert.deepEqual(loaded.occupation.school.activityAttempts,current.occupation.school.activityAttempts);const enrolled=current.occupation.school.memberships;assert.ok(enrolled.length>0);
 const next=answer(advanceYear(loaded));assert.deepEqual(next.occupation.school.memberships,enrolled);assert.deepEqual(next.occupation.school.activityAttempts,{});
 current={...loaded,age:14};current=answer(advanceYear(current));assert.equal(current.occupation.school.memberships,undefined);assert.equal(current.occupation.school.activityAttempts,undefined);
});
test('work listings begin at fourteen with part-time; full-time requires the saved graduation credential',()=>{
 assert.deepEqual(workCategories(life(13)),[]);assert.deepEqual(workCategories(life(14)),['Part-time']);assert.deepEqual(workCategories(life(17)),['Part-time']);assert.deepEqual(workCategories(life(18)),['Part-time','Full-time']);assert.deepEqual(workCategories({...life(18),occupation:{highestEducation:'Middle school',school:null,job:null}}),['Part-time']);
});
test('malformed rosters, activity IDs, future attempts and friendship profiles are rejected',()=>{
 const current={...life(12),occupation:getOccupation(life(12))};
 for(const mutate of [v=>v.occupation.school.roster[0].ageOffset=-1,v=>v.occupation.school.roster.push(v.occupation.school.roster[0]),v=>v.occupation.school.memberships=['fake'],v=>v.occupation.school.activityAttempts={chess:{age:13,accepted:true}}]){const corrupt=structuredClone(current);mutate(corrupt);assert.throws(()=>saved(corrupt));}
 const friend=interact(current,characters(current).school[0].id,'Befriend');const corrupt=structuredClone(friend);corrupt.relationships[characters(current).school[0].id].profile.ageOffset=-1;assert.throws(()=>saved(corrupt));
});

test('legacy named school friends upgrade to persistent profiles on load',()=>{
 const current={...life(15),relationships:{'oliver-patel':{status:'friend',strength:80,stats:{Health:80,Happiness:70,Smarts:60,Looks:50}}}};
 const raw=JSON.stringify(upsertLife(emptyStore(),current));const loaded=loadStore({getItem:key=>key===SAVE_KEY?raw:null,setItem:()=>{}}).lives[0];
 assert.ok(characters(loaded).personal.some(person=>person.id==='oliver-patel' && person.name==='Oliver Patel'));assert.equal(loaded.relationships['oliver-patel'].friendship,true);saved(loaded);
});
