import test from 'node:test';
import assert from 'node:assert/strict';
import { characters, availableActions, interact, relationshipActions } from '../src/relationships.ts';
import { parseStore, upsertLife, emptyStore, restartLife } from '../src/saves.ts';
const life = age => ({id:'social-test',name:'Alex',city:'Toronto',age,birthYear:2000,balance:100,stats:{Health:94,Happiness:82,Smarts:76,Looks:68},log:[]});
test('profiles have player stats, age with the player, and correct parent action restrictions', () => {
  const groups = characters(life(18)); const parent = groups.personal[0]; const maya = groups.personal.find(person => person.id === 'maya-chen');
  assert.deepEqual(Object.keys(parent.stats),Object.keys(life(18).stats)); assert.equal(parent.age,46);
  assert.equal(characters(life(19)).personal[0].age,47);
  assert.deepEqual(availableActions(parent),['Ask for money','Compliment','Conversation','Gift','Insult','Spend time']);
  assert.deepEqual(availableActions(maya),relationshipActions.filter(action=>!['Ask for money','Befriend','Act up','Disrespect','Suck up','Make love','Break up'].includes(action)));
  for (const action of ['Ask out','Have fun','Unfriend']) { const current=life(18); assert.equal(interact(current,parent.id,action),current); }
});
test('interactions change relationships, gifting charges money once per action, and failed gifting is a no-op', () => {
  const current = life(18); const compliment = interact(current,'maya-chen','Compliment');
  assert.ok(compliment.relationships['maya-chen'].strength!==93); assert.equal(current.relationships,undefined);
  const insult = interact(compliment,'maya-chen','Insult'); assert.equal(insult.relationships['maya-chen'].strength,Math.max(0,compliment.relationships['maya-chen'].strength-20));
  const gift = interact(insult,'maya-chen','Gift'); assert.equal(gift.balance,75); assert.equal(gift.log.length,3);
  const broke = {...current,balance:24}; assert.equal(interact(broke,'maya-chen','Gift'),broke);
});
test('dating starts at ten while intimacy requires adults and acceptance, and unfriending removes friends and ends dating', () => {
  const teenager = life(17); assert.equal(interact(teenager,'maya-chen','Ask out').relationships['maya-chen'].status,'dating'); assert.equal(interact(teenager,'maya-chen','Make love'),teenager);
  const dated = interact(life(18),'maya-chen','Ask out'); assert.equal(dated.relationships['maya-chen'].status,'dating');
  const declined = interact({...dated,relationships:{'maya-chen':{...dated.relationships['maya-chen'],status:'friend',strength:20}}},'maya-chen','Ask out');
  assert.equal(declined.relationships['maya-chen'].status,'friend'); assert.match(declined.log.at(-1).text,/declined/);
  const broken=interact(dated,'maya-chen','Break up');assert.equal(broken.relationships['maya-chen'].status,'friend');const removed = interact(broken,'maya-chen','Unfriend'); assert.equal(removed.relationships['maya-chen'].status,'unfriended'); assert.ok(!characters(removed).personal.some(person => person.id === 'maya-chen'));
});
test('relationship state saves per character and restart preserves the saved snapshot', () => {
  const current=interact(life(18),'maya-chen','Conversation'); const store=upsertLife(emptyStore(),current);
  assert.deepEqual(parseStore(JSON.stringify(store)).lives[0],current);
  assert.equal(restartLife(current).relationships,undefined); assert.equal(store.lives[0].relationships['maya-chen'].strength,current.relationships['maya-chen'].strength);
  const invalid=structuredClone(current); invalid.relationships['maya-chen'].stats.Health=101; assert.throws(() => parseStore(JSON.stringify(upsertLife(emptyStore(),invalid))));
});

test('asking out can be retried with full rejection and acceptance effects',()=>{
 const current=life(17),maya=characters(current).personal.find(p=>p.id==='maya-chen');
 const initial={...current,relationships:{'maya-chen':{strength:60,status:'friend',stats:maya.stats}}};
 const rejected=interact(initial,'maya-chen','Ask out');assert.equal(rejected.relationships['maya-chen'].strength,50);assert.equal(rejected.stats.Happiness,57);
 const retry=interact(rejected,'maya-chen','Ask out');assert.equal(retry.relationships['maya-chen'].strength,40);assert.equal(retry.stats.Happiness,32);
 retry.relationships['maya-chen'].strength=70;const accepted=interact(retry,'maya-chen','Ask out');assert.equal(accepted.relationships['maya-chen'].status,'dating');assert.equal(accepted.relationships['maya-chen'].strength,95);assert.equal(accepted.stats.Happiness,57);
 assert.deepEqual(parseStore(JSON.stringify(upsertLife(emptyStore(),accepted))).lives[0],accepted);
});
