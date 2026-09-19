import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceYear, answerMail, answerLifeEvent, hasRequiredDecisions, setMailRead, archiveMail } from '../src/mail.ts';
import { parseStore, emptyStore, upsertLife, restartLife } from '../src/saves.ts';
const life = (age = 17) => ({ id:'mail-test', name:'Alex', city:'Toronto', age, birthYear:2000, balance:0, stats:{Health:94,Happiness:99,Intelligence:76,Appearance:68}, log:[] });
const restore = current => parseStore(JSON.stringify(upsertLife(emptyStore(),current))).lives[0];

test('graduation is a required yearly popup, never an email', () => {
  const old = life(); const next = advanceYear(old, true);
  assert.equal(next.age,18); assert.equal(next.inbox.length,0);
  assert.match(next.pendingEvent.event.title,/graduate/);
  for(const key of ['Health','Happiness','Intelligence','Appearance'])assert.ok(Math.abs(next.stats[key]-old.stats[key])<=1); assert.deepEqual(next.log,[]);
  assert.equal(old.pendingEvent,undefined); assert.equal(advanceYear(next, true),next);
  const answered = answerLifeEvent(next,0);
  assert.equal(answered.age,18); assert.equal(answered.stats.Happiness,100);
  assert.equal(answered.log.length,1); assert.equal(hasRequiredDecisions(answered),false);
  assert.equal(answerLifeEvent(answered,0),answered);
});
test('yearly popup and genuine mail must both be answered to unlock age up', () => {
  const pending = advanceYear(life(18), true);
  assert.equal(pending.age,19); assert.equal(pending.inbox.length,1);
  assert.match(pending.inbox[0].event.title,/university acceptance/);
  assert.ok(pending.pendingEvent); assert.equal(hasRequiredDecisions(pending),true);
  const mailFirst = answerMail(pending,pending.inbox[0].id,0);
  assert.equal(advanceYear(mailFirst, true),mailFirst);
  const yearFirst = answerLifeEvent(pending,0);
  assert.equal(advanceYear(yearFirst, true),yearFirst);
  const completed = answerMail(yearFirst,pending.inbox[0].id,1);
  assert.equal(hasRequiredDecisions(completed),false);
  const next = advanceYear(completed, true);
  assert.equal(next.age,20); assert.equal(next.inbox.length,2);
  assert.match(next.inbox[1].event.title,/Job offer/);
});
test('email responses apply exactly once without incrementing age', () => {
  const pending = advanceYear(life(18), true); const id = pending.inbox[0].id;
  assert.equal(answerMail(pending,id,-1),pending);
  assert.equal(answerMail(pending,id,1.5),pending);
  const answered = answerMail(pending,id,0);
  assert.equal(answered.age,19); assert.equal(answered.stats.Happiness,100);
  assert.equal(answered.log.length,1); assert.equal(answered.log[0].age,19);
  assert.equal(answered.inbox[0].read,true); assert.equal(answered.inbox[0].decision,0);
  assert.equal(answerMail(answered,id,1),answered);
});
test('read state and archiving preserve decisions and cannot bypass required responses', () => {
  const pending = advanceYear(life(18), true); const id = pending.inbox[0].id;
  assert.equal(archiveMail(pending,id,true),pending);
  const read = setMailRead(pending,id,true);
  assert.equal(read.inbox[0].read,true); assert.equal(hasRequiredDecisions(read),true);
  const unread = setMailRead(read,id,false); assert.equal(unread.inbox[0].read,false);
  const answered = answerMail(answerLifeEvent(unread,0),id,1);
  const archived = archiveMail(setMailRead(answered,id,false),id,true);
  assert.equal(archived.inbox.filter(mail => !mail.archived && !mail.read).length,0);
  assert.equal(archived.inbox[0].decision,1); assert.equal(hasRequiredDecisions(archived),false);
  assert.deepEqual(restore(archived),JSON.parse(JSON.stringify(archived)));
  assert.equal(archiveMail(archived,id,false).inbox[0].archived,false);
});
test('saves preserve pending popups and emails; restart does not change saved snapshots', () => {
  const pending = advanceYear(life(18), true); const store = upsertLife(emptyStore(),pending);
  const restored = restore(pending); assert.deepEqual(restored,pending);
  assert.equal(advanceYear(restored, true),restored);
  assert.equal(restartLife(restored).inbox,undefined);
  assert.equal(restartLife(restored).pendingEvent,undefined);
  assert.equal(store.lives[0].inbox.length,1); assert.ok(store.lives[0].pendingEvent);
  assert.deepEqual(restore(life()),life());
  const legacy = { ...life(19), inbox:[{id:'legacy',age:19,sender:'Life community',read:false,event:pending.pendingEvent.event}] };
  assert.deepEqual(restore(legacy),legacy); assert.equal(advanceYear(legacy, true),legacy);
  assert.equal(hasRequiredDecisions(answerMail(legacy,'legacy',0)),false);
});
test('malformed popup and email saves reject duplicates, future ages, invalid effects and archived pending mail', () => {
  const initial = advanceYear(life(18), true);
  for (const mutate of [l => l.inbox.push(structuredClone(l.inbox[0])), l => l.inbox[0].age++, l => l.inbox[0].decision = 100, l => l.inbox[0].event.choices[0].effect = {Health:'bad'}, l => l.pendingEvent.age++, l => l.pendingEvent.event.choices = [], l => l.inbox[0].archived = true, l => l.inbox[0].archived = 'bad']) {
    const changed = structuredClone(initial); mutate(changed); assert.throws(() => restore(changed));
  }
});

 test('current age-up simulation updates school before decisions and creates no mail', () => {
   const current = life(9); const next = advanceYear(current);
   assert.equal(next.age,10); assert.equal(next.occupation.school.level,'Middle school');
   assert.equal(next.occupation.highestEducation,'Primary school'); assert.equal(next.inbox.length,0);
   assert.equal(next.pendingEvent.age,10); assert.equal(next.pendingEvent.event.title,'Starting middle school');
   const dormant = {...life(18), inbox:[{id:'old',age:18,sender:'old',read:false,event:next.pendingEvent.event}]};
   const advanced = advanceYear(dormant); assert.equal(advanced.age,19); assert.equal(advanced.inbox.length,1);
 });
