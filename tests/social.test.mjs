import test from 'node:test';
import assert from 'node:assert/strict';
import { createSocialPage, postSocialUpdate } from '../src/social.ts';
import { emptyStore, upsertLife, parseStore, restartLife } from '../src/saves.ts';

const life = (id = 'alex') => ({ id, name: id, city: 'Toronto', age: 18, birthYear: 2000, balance: 2450, stats: { Health: 94, Happiness: 82, Intelligence: 76, Charisma: 68 }, log: [{ age: 0, tag: 'LIFE', text: 'Born.' }] });

test('old saves load without a social page and posting requires creating one', () => {
  const original = life();
  const loaded = parseStore(JSON.stringify(upsertLife(emptyStore(), original))).lives[0];
  assert.equal(loaded.social, undefined);
  assert.equal(postSocialUpdate(loaded, 'Photo'), loaded);
});

test('social pages and posts save independently for each character', () => {
  const original = life();
  const created = createSocialPage(original);
  assert.equal(createSocialPage(created), created);
  const posted = postSocialUpdate(postSocialUpdate(created, 'Hobby'), 'Photo');
  assert.equal(posted.social.followers, 13);
  assert.equal(posted.social.posts.length, 2);
  assert.equal(created.social.posts.length, 0);
  assert.equal(original.social, undefined);
  const saved = upsertLife(upsertLife(emptyStore(), posted), createSocialPage(life('casey')));
  const loaded = parseStore(JSON.stringify(saved));
  assert.deepEqual(loaded.lives[0].social, posted.social);
  assert.equal(loaded.lives[1].social.followers, 0);
  assert.equal(posted.log.at(-1).tag, 'SOCIAL');
});

test('restarting resets the social page while preserving the saved version', () => {
  const posted = postSocialUpdate(createSocialPage(life()), 'Life update');
  const saved = upsertLife(emptyStore(), posted);
  const restarted = restartLife(posted);
  assert.equal(restarted.social, undefined);
  assert.equal(saved.lives[0].social.followers, 3);
  assert.equal(saved.lives[0].social.posts.length, 1);
});

test('malformed social data cannot be saved as a valid character', () => {
  for (const social of [
    { created: true, followers: -1, posts: [] },
    { created: false, followers: 3, posts: [] },
    { created: true, followers: 3, posts: [{ age: 99, kind: 'Photo', text: 'Future', gained: 3 }] },
    { created: true, followers: 3, posts: [{ age: 18, kind: 'Bad', text: 'Bad', gained: 3 }] }
  ]) assert.throws(() => parseStore(JSON.stringify(upsertLife(emptyStore(), { ...life(), social }))));
});
