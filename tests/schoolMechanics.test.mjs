import test from 'node:test';
import assert from 'node:assert/strict';
import {getOccupation,advanceOccupation,schoolAction,schoolActions,schoolPopularity} from '../src/occupation.ts';
import {characters,interact} from '../src/relationships.ts';
import {reaction,interactionResult} from '../src/interactionResults.ts';
import {applySchoolActivity,schoolActivities} from '../src/schoolActivities.ts';
import {schoolDance} from '../src/schoolDance.ts';
import {attractedTo,npcSexuality} from '../src/preferences.ts';
import {generateFamily} from '../src/family.ts';
import {parseStore,upsertLife,emptyStore,restartLife} from '../src/saves.ts';
import {advanceYear,answerLifeEvent} from '../src/mail.ts';
const life=(age=14,id='school-mechanics')=>({id,name:'Sam Smith',city:'New York City',age,birthYear:2000,balance:100,sexuality:'Straight',stats:{Health:70,Happiness:60,Intelligence:60,Charisma:60},log:[]});
const saved=current=>parseStore(JSON.stringify(upsertLife(emptyStore(),current))).lives[0];
test('school stages start with Intelligence-based grades; studying boosts grades and intelligence once yearly',()=>{
 for(const age of [6,10,14]){const before=life(age-1),occupation=advanceOccupation(before,age);assert.equal(occupation.school.grades,before.stats.Intelligence);}
 const before=life(),studied=schoolAction(before,'Study harder');assert.equal(studied.stats.Intelligence,61);assert.equal(studied.occupation.school.grades,70);assert.equal(schoolAction(studied,'Study harder').stats.Intelligence,61);assert.equal(schoolAction(studied,'Study hard').occupation.school.grades,70);
 assert.deepEqual(saved(studied),studied);const next={...studied,age:15,occupation:advanceOccupation(studied,15)};assert.equal(schoolAction(next,'Study harder').occupation.school.grades,80);
});
test('popularity is average classmate relationship strength, excluding staff, and updates after interactions',()=>{
 const current=life(),occupation=getOccupation(current),roster=occupation.school.roster,peers=roster.filter(p=>p.relation==='Classmate');
 current.occupation=occupation;current.relationships=Object.fromEntries(roster.map(p=>[p.id,{strength:p.relation==='Classmate'?40:100,status:'acquaintance',stats:current.stats}]));
 assert.equal(getOccupation(current).school.popularity,40);const next=interact(current,peers[0].id,'Insult');assert.equal(next.occupation.school.popularity,schoolPopularity(next,next.occupation.school));assert.ok(next.occupation.school.popularity<40);
});
test('positive staff appreciation/agreement improves grades; repeat and low reactions do not add grades',()=>{
 for(const action of ['Compliment','Conversation','Suck up']){let positive=0,negative=0;
 for(let i=0;i<30;i++){const before=life(14,`staff-${i}`),teacher=characters(before).school.find(p=>p.relation==='Teacher'),response=reaction(before,teacher,action),after=interact(before,teacher.id,action),gain=after.occupation.school.grades-getOccupation(before).school.grades;
 assert.equal(gain,response.delta>0?Math.min(action==='Suck up'?10:5,response.delta):response.delta);if(response.delta>0)positive++;else negative++;
 assert.equal(interact(after,teacher.id,action).occupation.school.grades,after.occupation.school.grades);if(action==='Suck up')assert.match(interactionResult(before,after,teacher,action).meter.label,/appreciation/);
 }assert.ok(positive>0);}
});
test('school actions have stage ordering, dropout age gates, nurse recovery and skip-school effects',()=>{
 assert.deepEqual(schoolActions(6),['Change schools','Drop out','Nurse','Study harder']);assert.ok(!schoolActions(6).includes('Skip school'));assert.ok(schoolActions(10).includes('Skip school'));assert.deepEqual(schoolActions(14).slice(1,4),['Nurse','School dance','Drop out']);
 const before=life(15);assert.equal(schoolAction(before,'Drop out'),before);const young=life(9);assert.equal(schoolAction(young,'Skip school'),young);
 const nursed=schoolAction(before,'Nurse');assert.equal(nursed.stats.Health,70);assert.match(schoolAction(nursed,'Nurse').log.at(-1).text,/reprimanded/);
 let lostIntelligence=false;for(let i=0;i<30;i++){const current=life(12,`skip-${i}`),skipped=schoolAction(current,'Skip school');assert.equal(skipped.stats.Happiness,65);assert.equal(skipped.occupation.school.grades,55);assert.equal(skipped.stats.Intelligence,59);}
 let dropout=saved(schoolAction(life(16),'Drop out'));assert.equal(dropout.occupation.school,null);assert.equal(dropout.occupation.droppedOut,true);
 dropout=answerLifeEvent(advanceYear(dropout),0);const adult=advanceYear(dropout);assert.equal(adult.age,18);assert.equal(adult.occupation.highestEducation,'Middle school');assert.equal(adult.occupation.school,null);assert.notEqual(adult.pendingEvent.event.title,'Congratulations, graduate!');assert.equal(restartLife(adult).occupation,undefined);
});
test('parent relationships and Money influence transfer decisions; transfers change roster and retain friends',()=>{
 let high=0,low=0;for(let i=0;i<60;i++){for(const generous of [true,false]){let current=life(12,`transfer-${i}`);current.family=generateFamily(current.id,'Smith');current.family.money=generous?100:0;current.relationships=Object.fromEntries(current.family.parents.map(p=>[p.id,{strength:generous?100:0,status:'friend',stats:p.stats}]));
 const next=schoolAction(current,'Change schools');if(next.occupation.school.transfers){if(generous)high++;else low++;assert.notEqual(next.occupation.school.name,getOccupation(current).school.name);const oldIds=new Set(getOccupation(current).school.roster.map(p=>p.id));assert.ok(next.occupation.school.roster.every(p=>!oldIds.has(p.id)));saved(next);}assert.equal(schoolAction(next,'Change schools'),next);
 }}assert.ok(high>low+25);
 let current=life(12,'friend-transfer');const peer=characters(current).school[0];current=interact(current,peer.id,'Befriend');current.family=generateFamily(current.id,'Smith');current.family.money=100;current.relationships={...current.relationships,...Object.fromEntries(current.family.parents.map(p=>[p.id,{strength:100,status:'friend',stats:p.stats}]))};const transferred=schoolAction(current,'Change schools');assert.ok(characters(transferred).personal.some(p=>p.id===peer.id));
});
test('club/sport acceptance raises happiness and rejection lowers it; new clubs save correctly',()=>{
 assert.ok(['drama','music','video-games','robotics'].every(id=>schoolActivities.some(a=>a.id===id)));let yes=0,no=0;
 for(let i=0;i<25;i++){const before=life(10,`club-${i}`),after=applySchoolActivity(before,'robotics'),accepted=after.occupation.school.activityAttempts.robotics.accepted;assert.equal(after.stats.Happiness,before.stats.Happiness+(accepted?20:-20));if(accepted)yes++;else no++;assert.deepEqual(saved(after),after);}assert.ok(yes>0 && no>0);
});
test('sexuality preferences require mutual compatibility and survive save/restart',()=>{
 for(const sexuality of ['Straight','Bisexual','Gay']){const current={...life(),sexuality};assert.equal(saved(current).sexuality,sexuality);assert.equal(restartLife(current).sexuality,sexuality);}
 assert.equal(attractedTo('Straight','Male','Male'),false);assert.equal(attractedTo('Gay','Female','Female'),true);assert.equal(attractedTo('Bisexual','Male','Male'),true);assert.equal(npcSexuality('stable','person'),npcSexuality('stable','person'));assert.throws(()=>saved({...life(),sexuality:'invalid'}));
});
test('dance rejection loses happiness/relationship, retries return to options, and completed dates show two bars',()=>{
 const before=life(),peer=characters(before).school.find(p=>p.gender==='Male');const rejected=schoolDance(before,'classmate',peer.id);assert.equal(rejected.accepted,false);assert.equal(rejected.retry,true);assert.equal(rejected.life.stats.Happiness,40);assert.equal(rejected.life.relationships[peer.id].strength,peer.strength-20);assert.equal(rejected.bars.length,0);assert.equal(schoolDance(rejected.life,'classmate',peer.id).life,rejected.life);saved(rejected.life);
 let successes=0;for(let i=0;i<30;i++){const current={...life(14,`date-${i}`),sexuality:'Bisexual'};const person=characters(current).school.find(p=>p.relation==='Classmate' && attractedTo(p.sexuality,p.gender,'Male'));current.relationships={[person.id]:{strength:90,status:'acquaintance',stats:person.stats}};const date=schoolDance(current,'classmate',person.id);if(date.accepted){successes++;assert.equal(date.bars.length,2);assert.ok(date.life.stats.Happiness>current.stats.Happiness);assert.ok(date.life.relationships[person.id].strength>90);assert.equal(schoolDance(date.life,'alone').life,date.life);assert.deepEqual(saved(date.life),date.life);}}
 assert.ok(successes>10);
});
test('friend dance invitations use average friend strength; solo enjoyment can help or hurt happiness',()=>{
 let high=0,low=0,soloGood=0,soloBad=0;for(let i=0;i<30;i++){for(const strength of [100,0]){const current=life(14,`friend-date-${i}`);current.family=generateFamily(current.id,'Smith');const person=characters(current).school[0];current.relationships={[person.id]:{profile:{name:person.name,gender:person.gender,ageOffset:0,education:person.education,occupation:person.occupation},friendship:true,status:'friend',strength,stats:person.stats}};const dance=schoolDance(current,'friends',person.id);if(dance.accepted){if(strength===100)high++;else low++;assert.equal(dance.bars.length,2);}else assert.equal(dance.retry,true);}
 const current=life(14,`solo-${i}`),dance=schoolDance(current,'alone');assert.equal(dance.bars.length,1);assert.equal(dance.bars[0].label,'Your Enjoyment');if(dance.life.stats.Happiness>60)soloGood++;saved(dance.life);}
 assert.equal(high,30);assert.equal(low,0);assert.ok(soloGood>0);
});

test('Health drives sports tryouts and shared activities build classmate relationships',()=>{
 let high=0,low=0,shared=false;for(let i=0;i<120;i++){for(const strong of [false,true]){const current={...life(14,`athlete-${i}`),stats:{...life().stats,Health:strong?100:0}};const next=applySchoolActivity(current,'basketball');if(next.occupation.school.activityAttempts.basketball.accepted){strong?high++:low++;const peer=next.occupation.school.roster.find(p=>p.relation==='Classmate'&&p.sports?.includes('basketball'));if(peer){assert.equal(next.relationships[peer.id].strength,Math.min(100,peer.strength+20));shared=true;}}}}
 assert.ok(high>low+50);assert.ok(shared);
});
