import test from 'node:test';
import assert from 'node:assert/strict';
import {getOccupation} from '../src/occupation.ts';
import {schoolActivities,schoolActivityName,applySchoolActivity} from '../src/schoolActivities.ts';
import {parseStore,upsertLife,emptyStore} from '../src/saves.ts';
const life=age=>({id:'us-school',name:'Sam Smith',city:'New York City',age,birthYear:2000,balance:100,stats:{Health:90,Happiness:80,Smarts:70,Looks:60},log:[]});
test('US schooling follows four-year stages and normalizes existing school saves',()=>{
 for(let age=6;age<18;age++){const current=life(age),school=getOccupation(current).school;assert.equal(school.level,age<10?'Primary school':age<14?'Middle school':'Secondary school');assert.equal(school.duration,4);assert.equal(school.startAge,age<10?6:age<14?10:14);}
 const legacy={...life(14),occupation:{highestEducation:'Primary school',job:null,school:{name:'Old school',level:'Middle school',startAge:12,duration:3,grades:80,popularity:60,memberships:['chess']}}};
 const upgraded=getOccupation(legacy);assert.equal(upgraded.school.level,'Secondary school');assert.equal(upgraded.school.grades,legacy.stats.Smarts);assert.equal(upgraded.school.startAge,14);assert.deepEqual(upgraded.school.memberships,[]);
});
test('expanded clubs and teams are eligible at ten, save correctly, and support gendered baseball labels',()=>{
 assert.equal(schoolActivities.filter(a=>a.group==='Sports').length,17);assert.equal(new Set(schoolActivities.map(a=>a.id)).size,schoolActivities.length);
 for(const activity of schoolActivities){if(activity.group==='Clubs' && !['Student Council','Honor Society'].includes(activity.name))assert.ok(activity.name.endsWith(' club'));if(activity.group==='Sports')assert.ok(activity.name.endsWith(' team'));}
 const baseball=schoolActivities.find(a=>a.id==='baseball');assert.equal(schoolActivityName(baseball,'Female'),'Softball team');assert.equal(schoolActivityName(baseball,'Male'),'Baseball team');
 assert.equal(applySchoolActivity(life(9),'robotics').age,9);assert.equal(applySchoolActivity(life(9),'robotics').occupation,undefined);
 const next=applySchoolActivity(life(10),'robotics');assert.ok(next.occupation.school.activityAttempts.robotics);assert.deepEqual(parseStore(JSON.stringify(upsertLife(emptyStore(),next))).lives[0],next);
});
