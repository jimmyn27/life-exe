import test from 'node:test';
import assert from 'node:assert/strict';
import {partTimeOffers,takePartTimeJob,yearlyPartTimePay} from '../src/partTimeWork.ts';
import {advanceYear,answerLifeEvent} from '../src/mail.ts';
import {getOccupation} from '../src/occupation.ts';
import {scheduleHours} from '../src/schoolCommitments.ts';
import {attendingSchool,educationLabel,playerEducation} from '../src/profileDetails.ts';
import {characters,interact,actionUnavailable} from '../src/relationships.ts';
import {reaction,interactionResult} from '../src/interactionResults.ts';
import {initialSchoolRoster,advanceSchoolRoster} from '../src/schoolCommunity.ts';
import {emptyStore,upsertLife,parseStore,restartLife} from '../src/saves.ts';
const life=(age=14,id='work-profile')=>({id,name:'Sam Smith',firstName:'Sam',lastName:'Smith',city:'New York City',age,birthYear:2000,balance:100,sexuality:'Bisexual',stats:{Health:80,Happiness:70,Intelligence:70,Appearance:70},log:[]});
const saved=l=>parseStore(JSON.stringify(upsertLife(emptyStore(),l))).lives[0];
const clearEvents=l=>{while(l.pendingEvent)l=answerLifeEvent(l,0);return l;};
test('yearly Intelligence and Appearance independently move by one, clamp at bounds, and do not reroll during decisions',()=>{
 const combos=new Set();let up=0;for(let i=0;i<200;i++){const old=life(5,`stats-${i}`),next=advanceYear(old);const a=next.stats.Appearance-old.stats.Appearance,b=next.stats.Intelligence-old.stats.Intelligence;assert.ok(Math.abs(a)<=1);assert.ok(Math.abs(b)<=1);for(const key of ['Health','Happiness'])assert.ok(Math.abs(next.stats[key]-old.stats[key])<=1);combos.add(`${a},${b}`);if(a===1)up++;assert.equal(next.occupation.school.grades,next.stats.Intelligence);assert.deepEqual(advanceYear(saved(next)).stats,next.stats);assert.equal(clearEvents(next).stats.Appearance,next.stats.Appearance);}
 assert.ok(combos.size>=7);assert.ok(up>40 && up<95);
 for(const value of [0,100]){const old=life(4,`bound-${value}`);old.stats.Appearance=value;old.stats.Intelligence=value;const n=advanceYear(old);assert.ok(n.stats.Appearance>=0 && n.stats.Appearance<=100);assert.ok(n.stats.Intelligence>=0 && n.stats.Intelligence<=100);}
});
test('part-time offers unlock by age, have stable wages and ten-to-twenty weekly hours, and reject unavailable jobs',()=>{
 assert.deepEqual(partTimeOffers(life(13)),[]);const young=partTimeOffers(life(14)),older=partTimeOffers(life(16));assert.ok(young.length>=5);assert.ok(older.length>young.length);assert.ok(!young.some(j=>j.id==='barista'));assert.ok(older.some(j=>j.id==='barista'));
 for(const age of [14,15,16,17,18])for(const offer of partTimeOffers(life(age))){assert.ok(offer.weeklyHours>=10 && offer.weeklyHours<=20);assert.ok(offer.hourlyWage>=offer.hourlyWageRange[0] && offer.hourlyWage<=offer.hourlyWageRange[1]);}
 assert.deepEqual(partTimeOffers(life(14)),partTimeOffers(life(14)));const old=life(14);assert.equal(takePartTimeJob(old,'barista'),old);assert.equal(takePartTimeJob(old,'unknown'),old);
});
test('jobs save, contribute schedule hours and pay once on the next age up before popups without tax',()=>{
 const old=life(14);const hired=takePartTimeJob(old,'library-aide');assert.equal(hired.balance,old.balance);const job=hired.occupation.job,pay=yearlyPartTimePay(job);assert.equal(scheduleHours(hired),40+job.weeklyHours);assert.deepEqual(saved(hired),hired);
 const n=advanceYear(saved(hired));assert.equal(n.balance,Math.round((old.balance+pay)*100)/100);assert.ok(n.pendingEvent);assert.match(n.log.find(e=>e.age===15 && e.tag==='WORK').text,/earned/);assert.equal(advanceYear(n),n);assert.equal(clearEvents(n).balance,n.balance);assert.equal(restartLife(n).occupation,undefined);
 const bad=structuredClone(hired);bad.occupation.job.weeklyHours=21;assert.throws(()=>saved(bad));
});
test('school and credential labels use current attendance and majors without an MBA label',()=>{
 assert.equal(attendingSchool(6),'Attending elementary school');assert.equal(attendingSchool(10),'Attending middle school');assert.equal(attendingSchool(14),'Attending high school');assert.equal(playerEducation(life(14)),'Attending high school');
 assert.match(educationLabel('University','teacher','Teacher'),/^(Bachelor's|Master's) \(Education\)$/);assert.equal(educationLabel('MBA','id'),"Master's (Business Administration)");assert.equal(educationLabel('Medical degree','id'),'Doctor of Medicine');assert.equal(educationLabel('Law school','id'),'Juris Doctor');
 const p=characters(life(12)).school.find(p=>p.relation==='Classmate');assert.equal(p.education,'Attending middle school');assert.ok(p.extracurriculars.length<=2);
});
test('classmates have at most one club and one sport and some initially empty memberships fill over years',()=>{
 let changed=false;for(let i=0;i<20;i++){const id=`npc-${i}`,roster=initialSchoolRoster(id,10),next=advanceSchoolRoster(id,11,roster);for(const p of next.filter(p=>p.relation==='Classmate')){assert.ok(p.clubs.length<=1 && p.sports.length<=1);const old=roster.find(o=>o.id===p.id);if(old && old.clubs.length+old.sports.length===0 && p.clubs.length+p.sports.length>0)changed=true;}}assert.ok(changed);
});
test('flirt receptiveness is appearance-weighted, changes relationship, and invitations obey age and yearly limits',()=>{
 let date=false,fun=false,negative=false;
 for(let i=0;i<500;i++){let l=life(16,`flirt-${i}`);l.relationships={f:{profile:{name:'Alex Smith',gender:'Female',ageOffset:0,education:'Middle school',occupation:'Student'},strength:99,status:'friend',friendship:true,stats:{Health:80,Happiness:70,Intelligence:70,Appearance:70}}};l.stats.Appearance=100;const p=characters(l).personal.find(p=>p.id==='f');const low=reaction({...l,stats:{...l.stats,Appearance:0}},p,'Flirt'),high=reaction(l,p,'Flirt');assert.ok(high.value-low.value>=59);
 const n=interact(l,'f','Flirt'),r=interactionResult(l,n,p,'Flirt');assert.equal(r.meter.label,'Her receptiveness');assert.ok(n.relationships.f.strength>p.strength);if(r.followUp){const choice=r.followUp.choices[0];assert.ok(['Ask out','Have fun'].includes(choice.relationship.action));const accepted=interact(n,'f',choice.relationship.action,undefined,true);if(choice.relationship.action==='Ask out'){date=true;assert.equal(accepted.relationships.f.status,'dating');}else{fun=true;assert.match(accepted.log.at(-1).text,/bowling/);}}
 const again=interact(n,'f','Flirt');assert.equal(again.relationships.f.strength,n.relationships.f.strength);interactionResult(n,again,characters(n).personal.find(p=>p.id==='f'),'Flirt');
 const cold={...l,stats:{...l.stats,Appearance:0},relationships:{f:{...l.relationships.f,strength:10}}};const rejected=interact(cold,'f','Flirt');negative ||=rejected.relationships.f.strength<10;
 }
 assert.ok((date || fun) && negative);
 const under=life(15),p={...characters(under).school.find(p=>p.relation==='Classmate'),age:15};assert.ok(actionUnavailable(under,p,'Have fun'));
});
