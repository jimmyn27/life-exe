import test from 'node:test';
import assert from 'node:assert/strict';
import {getOccupation,schoolAction} from '../src/occupation.ts';
import {characters,interact} from '../src/relationships.ts';
import {applySchoolActivity,manageSchoolActivity} from '../src/schoolActivities.ts';
import {newMembership,membershipInfo,scheduleHours,scheduleBreakdown,advanceCommitments,dismissalChance} from '../src/schoolCommitments.ts';
import {advanceClassmate,npcBaseStats,classmatePopularity} from '../src/npcSchool.ts';
import {advanceYear} from '../src/mail.ts';
import {parseStore,upsertLife,emptyStore} from '../src/saves.ts';
const life=(age=14,id='commitments')=>({id,name:'Sam Smith',city:'New York City',age,birthYear:2000,balance:100,stats:{Health:70,Happiness:60,Smarts:60,Looks:60},log:[]});
const enrolled=(ids=['basketball'],age=14,id='commitments')=>{const current=life(age,id),occupation=getOccupation(current);return {...current,occupation:{...occupation,school:{...occupation.school,memberships:ids,activityDetails:Object.fromEntries(ids.map(id=>[id,newMembership(age)]))}}};};
const saved=current=>parseStore(JSON.stringify(upsertLife(emptyStore(),current))).lives[0];
test('accepted memberships start at fifty performance, first rank, zero years and five hours',()=>{
 let accepted;for(let i=0;i<20;i++){const next=applySchoolActivity(life(14,`join-${i}`),'chess');if(next.occupation.school.memberships.includes('chess')){accepted=next;break;}}
 assert.ok(accepted);assert.deepEqual(accepted.occupation.school.activityDetails.chess,newMembership(14));assert.deepEqual(saved(accepted),accepted);
 const legacy=enrolled();delete legacy.occupation.school.activityDetails;assert.equal(membershipInfo(legacy.occupation.school,'basketball',14).performance,50);
});
test('practice/work increase performance once a year, hours stay within bounds, and quit removes membership and schedule hours',()=>{
 const current=enrolled(['chess','basketball']);assert.equal(scheduleHours(current),50);
 const trained=manageSchoolActivity(current,'basketball','Train');assert.equal(trained.occupation.school.activityDetails.basketball.performance,55);assert.equal(manageSchoolActivity(trained,'basketball','Train'),trained);
 const club=manageSchoolActivity(trained,'chess','Train');assert.equal(club.occupation.school.activityDetails.chess.performance,55);
 const busy=manageSchoolActivity(club,'chess','Hours',10);assert.equal(scheduleHours(busy),55);assert.equal(manageSchoolActivity(busy,'chess','Hours',0),busy);assert.equal(manageSchoolActivity(busy,'chess','Hours',11),busy);
 const quit=manageSchoolActivity(busy,'chess','Quit');assert.ok(!quit.occupation.school.memberships.includes('chess'));assert.ok(!quit.occupation.school.activityDetails.chess);assert.equal(scheduleHours(quit),45);assert.deepEqual(saved(quit),quit);
});
test('weekly hours each add one yearly performance point and promotions factor in tenure',()=>{
 for(const hours of [1,5,10]){const current=enrolled(['basketball']);current.occupation.school.activityDetails.basketball={...newMembership(14),hours,performance:70};const next=advanceYear(current);assert.equal(next.occupation.school.activityDetails.basketball.performance,70+hours);assert.equal(next.occupation.school.activityDetails.basketball.years,1);saved(next);}
 for(const id of ['basketball','chess']){const current=enrolled([id]);current.occupation.school.activityDetails[id].performance=70;let next=advanceYear(current);assert.equal(next.occupation.school.activityDetails[id].rank,1);assert.ok(next.log.some(l=>l.text.includes(id==='chess'?'Vice President':'Starter')));next.pendingEvent=undefined;next.occupation.school.activityDetails[id].performance=85;next=advanceYear(next);assert.equal(next.occupation.school.activityDetails[id].rank,2);assert.equal(next.occupation.school.activityDetails[id].years,2);assert.ok(next.log.some(l=>l.text.includes(id==='chess'?'President':'Captain')));saved(next);}
});
test('schedule includes school, every membership and employment; sixty is safe and excess hurts happiness, grades and performance',()=>{
 const current=enrolled(['basketball','chess','science','soccer']);assert.equal(scheduleHours(current),60);const normal=advanceYear(current);assert.equal(normal.stats.Happiness,60);assert.equal(normal.occupation.school.grades,60);assert.equal(normal.occupation.school.activityDetails.chess.performance,55);
 const busy=enrolled(['basketball','chess','science','soccer','art']);for(const detail of Object.values(busy.occupation.school.activityDetails))detail.performance=70;assert.equal(scheduleHours(busy),65);const stressed=advanceYear(busy);assert.equal(stressed.stats.Happiness,59);assert.equal(stressed.occupation.school.grades,59);assert.equal(stressed.occupation.school.activityDetails.chess.performance,74);assert.ok(stressed.log.some(l=>l.text.includes('overwhelmed')));saved(stressed);
 busy.occupation.job={position:'Assistant',employer:'Store',salary:10000,performance:50,startAge:14,hours:'Part time · 15 hours / week'};assert.equal(scheduleHours(busy),80);
});
test('low performance has increasing yearly dismissal risk while fifty and above remain safe',()=>{
 assert.equal(dismissalChance(50),0);assert.ok(dismissalChance(5)>dismissalChance(40));let removed=0;
 for(let i=0;i<50;i++){const current=enrolled(['chess'],14,`dismiss-${i}`);current.occupation.school.activityDetails.chess.performance=0;const next=advanceYear(current);if(!next.occupation.school.memberships.includes('chess')){removed++;assert.ok(!next.occupation.school.activityDetails.chess);assert.ok(next.log.some(l=>l.text.includes('removed')));}saved(next);}assert.ok(removed>20 && removed<50);
});
test('sucking up slightly reduces every classmate relationship and popularity only on the first interaction',()=>{
 const current=life(),people=characters(current),staff=people.school.find(p=>p.relation==='Teacher'),peers=people.school.filter(p=>p.relation==='Classmate');const before=getOccupation(current).school.popularity,after=interact(current,staff.id,'Suck up');
 for(const peer of peers)assert.equal(after.relationships[peer.id].strength,peer.strength-1);assert.ok(after.occupation.school.popularity<before);const repeated=interact(after,staff.id,'Suck up');for(const peer of peers)assert.equal(repeated.relationships[peer.id].strength,after.relationships[peer.id].strength);saved(after);
});
test('classmate grades start at smarts, fluctuate annually and reset at stage transition; sports add more popularity than clubs',()=>{
 const peer={id:'npc-student',name:'Alex Smith',gender:'Male',ageOffset:0,relation:'Classmate',group:'Classmates',strength:50};const initial=advanceClassmate(peer,'npc-life',6);assert.equal(initial.grades,npcBaseStats(peer.id).Smarts);
 let up=0,down=0;for(let i=0;i<30;i++){const old={...initial,grades:70,gradeAge:6},next=advanceClassmate(old,`npc-${i}`,7);if(next.grades>70)up++;if(next.grades<70)down++;assert.deepEqual(advanceClassmate(next,`npc-${i}`,7),next);}assert.ok(up>0 && down>0);
 const transition=advanceClassmate({...initial,grades:10,gradeAge:9},'npc-life',10,true);assert.equal(transition.grades,npcBaseStats(peer.id).Smarts);assert.ok(classmatePopularity({...peer,sports:['soccer']},60)>classmatePopularity({...peer,clubs:['chess']},60));
 const classmates=characters(life(14)).school.filter(p=>p.relation==='Classmate');assert.ok(classmates.every(p=>typeof p.grades==='number' && typeof p.popularity==='number'));
});
test('save validation rejects malformed membership hours, performance and years',()=>{
 for(const mutate of [s=>s.activityDetails.chess.hours=11,s=>s.activityDetails.chess.performance=-1,s=>s.activityDetails.chess.years=10,s=>s.roster[0].grades=150]){const current=enrolled(['chess']);mutate(current.occupation.school);assert.throws(()=>saved(current));}
});

test('schedule breakdown itemizes school, extracurriculars and work and sums to the displayed total',()=>{
 let current=enrolled(['basketball','chess']);current=manageSchoolActivity(current,'basketball','Hours',10);
 current.occupation.job={position:'Library assistant',employer:'Library',salary:1000,performance:50,startAge:14,hours:'Part-time · 12 hours / week'};
 const rows=scheduleBreakdown(current);assert.equal(rows[0].name,'High school student');assert.equal(rows[0].hours,40);
 assert.ok(rows.some(row=>row.name==='Basketball team' && row.hours===10));assert.ok(rows.some(row=>row.name==='Chess club' && row.hours===5));
 assert.equal(rows.at(-1).hours,12);assert.equal(rows.reduce((sum,row)=>sum+row.hours,0),scheduleHours(current));assert.equal(scheduleHours(current),67);
});
