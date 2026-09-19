import test from 'node:test';
import assert from 'node:assert/strict';
import { SAVE_KEY, clearPrototypeSaves, emptyStore, parseStore, persistStore, loadStore, upsertLife, restartLife, lifeDate } from '../src/saves.ts';
import { eventForAge } from '../src/lifeEvents.ts';
import {childhoodEventPools} from '../src/childhoodEvents.ts';

const life = (id = 'alex') => ({ id, name: id, city: 'Toronto', age: 18, birthYear: 2000, balance: 2450, stats: { Health: 94, Happiness: 82, Intelligence: 76, Appearance: 68 }, log: [{ age: 0, tag: 'LIFE', text: 'Born in Toronto.' }] });
function storage() { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; }

test('saving and reloading multiple characters preserves each life and active character', () => {
  const disk = storage();
  let store = upsertLife(emptyStore(), life());
  store = upsertLife(store, life('casey'));
  store = upsertLife(store, { ...life(), age: 19, balance: 3000 });
  persistStore(disk, store);
  const loaded = loadStore(disk);
  assert.equal(loaded.activeId, 'alex');
  assert.equal(loaded.lives.length, 2);
  assert.equal(loaded.lives.find(item => item.id === 'alex').age, 19);
  assert.equal(loaded.lives.find(item => item.id === 'casey').age, 18);
});

test('live changes and restarting cannot change the previous saved snapshot', () => {
  const current = life();
  const store = upsertLife(emptyStore(), current);
  current.stats.Health = 10;
  current.log.push({ age: 18, tag: 'ACTIVITY', text: 'Changed.' });
  const restarted = restartLife(current);
  assert.equal(store.lives[0].stats.Health, 94);
  assert.equal(store.lives[0].log.length, 1);
  assert.equal(store.lives[0].age, 18);
  assert.equal(restarted.age, 0);
  assert.equal(restarted.balance, 0);
  for (const key of ['id', 'name', 'city', 'birthYear']) assert.equal(restarted[key], current[key]);
  assert.ok(restarted.log.every(entry => entry.age === 0));
  assert.equal(lifeDate(restarted), '01/01/2000');
});

test('storage write failures propagate and leave the previous save intact', () => {
  const disk = storage();
  const original = upsertLife(emptyStore(), life());
  persistStore(disk, original);
  const full = { getItem: disk.getItem, setItem: () => { throw new Error('Storage full'); } };
  assert.throws(() => persistStore(full, upsertLife(original, { ...life(), age: 20 })), /Storage full/);
  assert.deepEqual(loadStore(disk),original);
});

test('unreadable previous saves are backed up before replacement', () => {
  const disk = storage();
  disk.setItem(SAVE_KEY, '{broken');
  assert.throws(() => loadStore(disk));
  persistStore(disk, upsertLife(emptyStore(), life()));
  assert.equal(disk.getItem(`${SAVE_KEY}.backup`), '{broken');
  assert.equal(loadStore(disk).lives[0].id, 'alex');
});

test('inconsistent and out-of-range save data is rejected', () => {
  for (const invalid of [
    { version: 2, activeId: null, lives: [] },
    { version: 1, activeId: 'missing', lives: [life()] },
    { version: 1, activeId: 'alex', lives: [life(), life()] },
    upsertLife(emptyStore(), { ...life(), age: -1 }),
    upsertLife(emptyStore(), { ...life(), stats: { ...life().stats, Health: 101 } }),
    upsertLife(emptyStore(), { ...life(), log: [{ age: 99, tag: 'LIFE', text: 'Future' }] })
  ]) assert.throws(() => parseStore(JSON.stringify(invalid)));
});

test('life dates follow age and every year after restart has a valid event', () => {
  assert.equal(lifeDate({ ...life(), age: 19 }), '01/01/2019');
  for (let age = 0; age <= 150; age++) {
    const event = eventForAge(age);
    assert.ok(event.title && event.choices.length);
    assert.ok(event.choices.every(choice => choice.label && choice.outcome));
  }
  assert.ok(childhoodEventPools[1].some(event=>event.title===eventForAge(1).title));
  assert.equal(eventForAge(8).title, 'Choosing a hobby');
  assert.equal(eventForAge(14).title, 'Starting high school');
});

 test('first and last names persist separately and survive restart', () => {
   const disk = storage();
   const current = { ...life(), name: 'Jamie van Dijk', firstName: 'Jamie', lastName: 'van Dijk' };
   persistStore(disk, upsertLife(emptyStore(), current));
   const loaded = loadStore(disk).lives[0];
   assert.equal(loaded.firstName, 'Jamie'); assert.equal(loaded.lastName, 'van Dijk');
   assert.equal(restartLife(loaded).lastName, 'van Dijk');
   assert.throws(() => parseStore(JSON.stringify(upsertLife(emptyStore(), {...current, lastName:undefined}))));
 });
 test('legacy names split on load without losing multiword surnames', () => {
   const disk = storage(); const current = { ...life(), name: 'Jamie van Dijk' };
   persistStore(disk, upsertLife(emptyStore(), current));
   assert.equal(loadStore(disk).lives[0].firstName, 'Jamie');
   assert.equal(loadStore(disk).lives[0].lastName, 'van Dijk');
 });

test('prototype reset removes old saves and backups while retaining new playtest saves', () => {
  const values = new Map([['life.exe.saves.v1', 'old'], ['life.exe.saves.v1.backup', 'old backup'], [SAVE_KEY, 'new'], ['other-site-data', 'keep']]);
  clearPrototypeSaves({removeItem: key => values.delete(key)});
  assert.equal(values.has('life.exe.saves.v1'), false);
  assert.equal(values.has('life.exe.saves.v1.backup'), false);
  assert.equal(values.get(SAVE_KEY), 'new');
  assert.equal(values.get('other-site-data'), 'keep');
});
