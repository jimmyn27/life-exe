import test from 'node:test';
import assert from 'node:assert/strict';
import { getOccupation, advanceOccupation, occupationContacts, schoolYear } from '../src/occupation.ts';
import { advanceYear, answerLifeEvent, answerMail } from '../src/mail.ts';
import { parseStore, emptyStore, upsertLife, restartLife } from '../src/saves.ts';
const life = age => ({id:'occupation-test',name:'Alex',city:'Toronto',age,birthYear:2000,balance:100,stats:{Health:94,Happiness:82,Smarts:76,Looks:68},log:[]});
const save = current => parseStore(JSON.stringify(upsertLife(emptyStore(),current))).lives[0];
test('older saves get age-appropriate schooling without invented employment', () => {
  assert.equal(getOccupation(life(0)).school,null);
  const primary = getOccupation(life(6)); assert.equal(primary.school.level,'Primary school'); assert.equal(schoolYear(life(6),primary.school),1);
  assert.equal(schoolYear(life(11),primary.school),6);
  const secondary = getOccupation(life(12)); assert.equal(secondary.highestEducation,'Primary school'); assert.equal(secondary.school.level,'Middle school');
  assert.equal(getOccupation(life(18)).highestEducation,'Secondary school'); assert.equal(getOccupation(life(18)).school,null); assert.equal(getOccupation(life(30)).job,null);
});
test('school transitions update completed education and current year', () => {
  const secondary = advanceOccupation(life(11),12); assert.equal(secondary.highestEducation,'Primary school'); assert.equal(secondary.school.startAge,12);
  const graduate = advanceOccupation({...life(17),occupation:getOccupation(life(17))},18); assert.equal(graduate.highestEducation,'Secondary school'); assert.equal(graduate.school,null);
});
test('accepted offers create saved occupation records and relevant contacts, declined offers do not', () => {
  const year = answerLifeEvent(advanceYear(life(18), true),0); const mail = year.inbox[0];
  const declined = answerMail(year,mail.id,1); assert.equal(getOccupation(declined).school,null);
  const student = answerMail(year,mail.id,0); assert.equal(student.occupation.school.name,'Northbridge University'); assert.equal(schoolYear(student,student.occupation.school),1);
  assert.equal(occupationContacts(student).school.length,31); assert.equal(occupationContacts(student).work.length,0);
  const next = answerLifeEvent(advanceYear(student, true),0); const employed = answerMail(next,next.inbox.at(-1).id,0);
  assert.equal(employed.occupation.job.employer,'Riverside Library'); assert.equal(employed.occupation.job.salary,32000); assert.equal(occupationContacts(employed).work.length,3); assert.equal(occupationContacts(employed).school.length,31);
  assert.deepEqual(save(employed),JSON.parse(JSON.stringify(employed)));
  const qualified = advanceOccupation({...employed,age:22},23); assert.equal(qualified.highestEducation,'University'); assert.equal(qualified.school,null); assert.equal(qualified.job.startAge,20);
  assert.equal(occupationContacts({...employed,age:23,occupation:qualified}).school.length,0);
  assert.equal(restartLife(employed).occupation,undefined); assert.equal(getOccupation(restartLife(employed)).job,null);
});
test('occupation validation rejects corrupt salary, grades, dates and levels', () => {
  const pending = answerLifeEvent(advanceYear(life(18), true),0); const student = answerMail(pending,pending.inbox[0].id,0);
  for (const mutate of [l => l.occupation.school.grades = 101, l => l.occupation.school.startAge = 30, l => l.occupation.highestEducation = 'invalid', l => l.occupation.job = {position:'Assistant',employer:'Library',salary:-1,performance:50,startAge:19,hours:'Full time'}]) {
    const changed=structuredClone(student); mutate(changed); assert.throws(() => save(changed));
  }
});
