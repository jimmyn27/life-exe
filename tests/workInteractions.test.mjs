import test from 'node:test';
import assert from 'node:assert/strict';
import {getOccupation,nextSchoolName} from '../src/occupation.ts';
import {partTimeOffers,takePartTimeJob,projectedJobHours,workAction,workRequestChance,alphabeticalPartTimeOffers} from '../src/partTimeWork.ts';
import {newMembership,scheduleHours} from '../src/schoolCommitments.ts';
import {applySchoolActivity} from '../src/schoolActivities.ts';
import {characters,interact,availableActions,actionUnavailable} from '../src/relationships.ts';
import {interactionConfirmation} from '../src/interactionConfirmations.ts';
import {schoolDance} from '../src/schoolDance.ts';
import {advanceYear} from '../src/mail.ts';
import {emptyStore,upsertLife,parseStore} from '../src/saves.ts';
const life=(age=16,id='work-action')=>({id,name:'Sam Smith',city:'New York City',age,birthYear:2000,balance:100,sexuality:'Bisexual',stats:{Health:80,Happiness:70,Smarts:70,Looks:70},log:[]});
const enrolled=(hours=20)=>{const l=life(),occupation=getOccupation(l);return {...l,occupation:{...occupation,school:{...occupation.school,memberships:['chess','basketball'],activityDetails:{chess:{...newMembership(16),hours:hours/2},basketball:{...newMembership(16),hours:hours/2}}}}};};
const saved=l=>parseStore(JSON.stringify(upsertLife(emptyStore(),l))).lives[0];
test('applying above sixty rejects jobs and activities without attempts, money or stat effects; replacing a job removes its old hours',()=>{
 const full=enrolled();assert.equal(scheduleHours(full),60);assert.equal(applySchoolActivity(full,'science'),full);assert.equal(takePartTimeJob(full,'library-aide'),full);
 const old=takePartTimeJob(life(),'library-aide'),offer=partTimeOffers(old).find(j=>j.id==='cashier');assert.equal(projectedJobHours(old,offer.weeklyHours),40+offer.weeklyHours);assert.ok(takePartTimeJob(old,'cashier')!==old);
});
test('more hours and raises depend on tenure and performance, save and never exceed twenty or sixty; requests and training apply once yearly',()=>{
 assert.ok(workRequestChance(5,90)>workRequestChance(0,50));let hoursWon=false,raiseWon=false;
 for(let i=0;i<100;i++){const hired=takePartTimeJob(life(16,`request-${i}`),'library-aide');hired.occupation.job.performance=90;hired.occupation.job.startAge=14;hired.occupation.job.weeklyHours=10;hired.occupation.job.hours='Part-time · 10 hours / week';
 const hours=workAction(hired,'Hours');assert.ok(hours.life.occupation.job.weeklyHours<=20);assert.ok(scheduleHours(hours.life)<=60);const retryHours=workAction(hours.life,'Hours').life;assert.equal(retryHours.stats.Happiness,hours.life.stats.Happiness);saved(hours.life);hoursWon ||=hours.life.occupation.job.weeklyHours>10;
 const raise=workAction(hired,'Raise');raiseWon ||=raise.life.occupation.job.hourlyWage>hired.occupation.job.hourlyWage;assert.equal(workAction(raise.life,'Raise').life,raise.life);saved(raise.life);
 const trained=workAction(hired,'Work harder');assert.equal(trained.life.occupation.job.performance,100);assert.equal(workAction(trained.life,'Work harder').life,trained.life);assert.equal(workAction(hired,'Resign').life.occupation.job,null);
 }
 assert.ok(hoursWon && raiseWon);
 const hired=takePartTimeJob(life(),'library-aide'),remaining=20-hired.occupation.job.weeklyHours;const l={...hired,occupation:{...hired.occupation,school:{...hired.occupation.school,memberships:remaining?['chess']:[],activityDetails:remaining?{chess:{...newMembership(16),hours:remaining}}:{}}}};saved(l);assert.equal(scheduleHours(l),60);assert.equal(workAction(l,'Hours').life,l);
});
test('natural yearly performance gains apply to work, clubs and sports, and positive manager interactions can improve performance once yearly',()=>{
 const hired=takePartTimeJob(life(),'library-aide'),next=advanceYear(hired);assert.equal(next.occupation.job.performance,hired.occupation.job.performance+10);
 const activities=enrolled(10),year=advanceYear(activities);assert.equal(year.occupation.school.activityDetails.chess.performance,55);assert.equal(year.occupation.school.activityDetails.basketball.performance,55);
 let improved=false;for(let i=0;i<50;i++){const l=takePartTimeJob(life(16,`manager-${i}`),'library-aide'),manager=characters(l).work.find(p=>p.relation==='Manager');const n=interact(l,manager.id,'Conversation');if(n.occupation.job.performance>l.occupation.job.performance){improved=true;assert.equal(interact(n,manager.id,'Conversation').occupation.job.performance,n.occupation.job.performance);break;}}assert.ok(improved);
});
test('partners get breakup first, no flirt/befriend/unfriend; acquaintances need friendship to spend time, and age-specific outings are enforced',()=>{
 const l=life(),p=characters(l).school.find(p=>p.relation==='Classmate');assert.ok(!availableActions(p,l).includes('Spend time'));const befriended=interact(l,p.id,'Befriend');assert.ok(availableActions(characters(befriended).school.find(q=>q.id===p.id),befriended).includes('Spend time'));
 const record=befriended.relationships[p.id],dating={...befriended,relationships:{...befriended.relationships,[p.id]:{...record,status:'dating'}}},partner=characters(dating).personal.find(q=>q.id===p.id);assert.equal(availableActions(partner,dating)[0],'Break up');for(const a of ['Flirt','Befriend','Unfriend'])assert.ok(actionUnavailable(dating,partner,a));assert.ok(actionUnavailable(dating,partner,'Hook up'));assert.equal(actionUnavailable(dating,partner,'Have fun'),null);
 const ended=interact(dating,p.id,'Break up');assert.equal(ended.relationships[p.id].status,'friend');saved(ended);
});
test('only specified social actions have confirmations; character previews and Nevermind are present on friend/dating/outings prompts',()=>{
 const l=life(),p=characters(l).school.find(p=>p.relation==='Classmate');for(const a of ['Conversation','Compliment'])assert.equal(interactionConfirmation(l,p,a),null);
 for(const a of ['Befriend','Ask out','Have fun']){const e=interactionConfirmation(l,p,a);assert.equal(e.profileId,p.id);assert.equal(e.choices.at(-1).label,'Nevermind');}assert.ok(interactionConfirmation(l,p,'Insult').text.includes(`classmate (${p.name.split(' ')[0]})`));assert.equal(interactionConfirmation(l,p,'Hook up'),null);
 assert.match(interactionConfirmation(l,p,'Have fun').choices[0].label,/Try to have fun with (him|her)/);assert.equal(nextSchoolName(l,getOccupation(l).school),'Pinecrest High school');
});
test('dancing with an existing partner always succeeds and has both enjoyment bars',()=>{
 for(let i=0;i<30;i++){const l=life(16,`partner-dance-${i}`),p=characters(l).school.find(p=>p.relation==='Classmate');const dating=interact(l,p.id,'Befriend');dating.relationships[p.id].status='dating';dating.relationships[p.id].strength=0;const outcome=schoolDance(dating,'partner');assert.equal(outcome.accepted,true);assert.equal(outcome.bars.length,2);assert.ok(outcome.text.includes(p.name));assert.ok(outcome.life.occupation.school.yearActions.includes('School dance'));}
});
test('job search always sorts alphabetically and keeps text search',()=>{
 const l=life(),rows=alphabeticalPartTimeOffers(l);for(let i=1;i<rows.length;i++)assert.ok(rows[i-1].title.localeCompare(rows[i].title)<=0);
 const found=alphabeticalPartTimeOffers(l,'library');assert.ok(found.length);assert.ok(found.every(j=>j.title.includes('Library')));
});
