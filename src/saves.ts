import type { Family } from './family';
import type { Entry, Stats, LifeEvent } from './data';
import type { LifeMail, PendingLifeEvent } from './mail';
import type { RelationshipRecord } from './relationships';
import type { Occupation } from './occupation';
import type { SocialPage } from './social';
import { cityById, resolveCity, US_SNAPSHOT } from './catalogs/us/index.ts';

export type Life = { id: string; name: string; firstName?: string; lastName?: string; city: string; locationId?: string; catalogSnapshotId?: string; age: number; birthYear: number; balance: number; stats: Stats; log: Entry[]; social?: SocialPage; inbox?: LifeMail[]; pendingEvent?: PendingLifeEvent; occupation?: Occupation; family?: Family; relationships?: Record<string, RelationshipRecord> };
export type SaveStore = { version: 1; activeId: string | null; lives: Life[] };
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
export const SAVE_KEY = 'life.exe.saves.v2';
export function clearPrototypeSaves(storage: Pick<Storage, 'removeItem'>): void {
  storage.removeItem('life.exe.saves.v1');
  storage.removeItem('life.exe.saves.v1.backup');
}
export const emptyStore = (): SaveStore => ({ version: 1, activeId: null, lives: [] });
const statNames = ['Health', 'Happiness', 'Smarts', 'Looks'] as const;
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
function validEvent(value: unknown): value is LifeEvent {
  if (!object(value) || typeof value.title !== 'string' || typeof value.text !== 'string' || typeof value.category !== 'string' || !Array.isArray(value.choices) || !value.choices.length) return false;
  return value.choices.every(choice => object(choice) && ['label', 'hint', 'outcome'].every(key => typeof choice[key] === 'string') && (choice.schoolEffect === undefined || object(choice.schoolEffect) && Object.entries(choice.schoolEffect).every(([key, effect]) => ['grades','popularity'].includes(key) && typeof effect === 'number' && Number.isFinite(effect))) && (choice.effect === undefined || object(choice.effect) && Object.entries(choice.effect).every(([key, effect]) => statNames.includes(key as typeof statNames[number]) && typeof effect === 'number' && Number.isFinite(effect))));
}
function validLife(value: unknown): value is Life {
  if (!object(value) || typeof value.id !== 'string' || !value.id || typeof value.name !== 'string' || !value.name.trim() || typeof value.city !== 'string') return false;
  if (value.locationId !== undefined && (typeof value.locationId !== 'string' || cityById(value.locationId)?.name !== value.city)) return false;
  if (value.catalogSnapshotId !== undefined && value.catalogSnapshotId !== US_SNAPSHOT.id) return false;
  if ((value.firstName === undefined) !== (value.lastName === undefined)) return false;
  if (value.firstName !== undefined && (typeof value.firstName !== 'string' || !value.firstName.trim() || typeof value.lastName !== 'string' || !value.lastName.trim() || value.name !== `${value.firstName} ${value.lastName}`)) return false;
  if (!Number.isInteger(value.age) || (value.age as number) < 0 || (value.age as number) > 1000 || !Number.isInteger(value.birthYear) || (value.birthYear as number) < 1 || (value.birthYear as number) > 8000 || typeof value.balance !== 'number' || !Number.isFinite(value.balance)) return false;
  const stats = value.stats;
  if (value.family !== undefined) {
    const family = value.family;
    const validStats = (item: unknown) => object(item) && statNames.every(key => typeof item[key] === 'number' && Number.isFinite(item[key]) && (item[key] as number) >= 0 && (item[key] as number) <= 100);
    if (!object(family) || !validStats(family.birthStats) || !Array.isArray(family.parents) || family.parents.length !== 2) return false;
    if (!family.parents.every((parent, index) => object(parent) && parent.id === (index === 0 ? 'parent-mother' : 'parent-father') && parent.relation === (index === 0 ? 'Mother' : 'Father') && parent.gender === (index === 0 ? 'Female' : 'Male') && ['name','education','occupation'].every(key => typeof parent[key] === 'string' && !!(parent[key] as string).trim()) && Number.isInteger(parent.ageAtBirth) && (parent.ageAtBirth as number) >= 18 && (parent.ageAtBirth as number) <= 60 && validStats(parent.stats))) return false;
  }
  if (value.social !== undefined) {
    const social = value.social;
    if (!object(social) || typeof social.created !== 'boolean' || !Number.isSafeInteger(social.followers) || (social.followers as number) < 0 || !Array.isArray(social.posts)) return false;
    if (!social.posts.every(post => object(post) && Number.isInteger(post.age) && (post.age as number) >= 0 && (post.age as number) <= (value.age as number) && ['Life update', 'Hobby', 'Photo'].includes(post.kind as string) && typeof post.text === 'string' && Number.isSafeInteger(post.gained) && (post.gained as number) >= 0)) return false;
    if (!social.created && ((social.followers as number) !== 0 || social.posts.length !== 0)) return false;
  }
  if (value.relationships !== undefined) {
    if (!object(value.relationships) || Array.isArray(value.relationships)) return false;
    for (const [id, record] of Object.entries(value.relationships)) {
      if (!object(record)) return false;
      const npcStats = record.stats;
      if (!id || !object(record) || !['friend', 'dating', 'unfriended'].includes(record.status as string) || typeof record.strength !== 'number' || !Number.isFinite(record.strength) || record.strength < 0 || record.strength > 100 || !object(npcStats) || !statNames.every(key => typeof npcStats[key] === 'number' && Number.isFinite(npcStats[key]) && (npcStats[key] as number) >= 0 && (npcStats[key] as number) <= 100)) return false;
    }
  }
  if (value.occupation !== undefined) {
    const occupation = value.occupation;
    const percentage = (number: unknown) => typeof number === 'number' && Number.isFinite(number) && number >= 0 && number <= 100;
    const startAge = (age: unknown) => Number.isInteger(age) && (age as number) >= 0 && (age as number) <= (value.age as number);
    if (!object(occupation) || !['None', 'Primary school', 'Secondary school', 'University'].includes(occupation.highestEducation as string)) return false;
    const job = occupation.job;
    if (job !== null && (!object(job) || !['position', 'employer', 'hours'].every(key => typeof job[key] === 'string') || typeof job.salary !== 'number' || !Number.isFinite(job.salary) || job.salary < 0 || !percentage(job.performance) || !startAge(job.startAge))) return false;
    const school = occupation.school;
    if (school !== null && (!object(school) || typeof school.name !== 'string' || !['Primary school', 'Secondary school', 'University'].includes(school.level as string) || !startAge(school.startAge) || !Number.isInteger(school.duration) || (school.duration as number) < 1 || (school.duration as number) > 20 || !percentage(school.grades) || !percentage(school.popularity) || school.yearActions !== undefined && (!Array.isArray(school.yearActions) || new Set(school.yearActions).size !== school.yearActions.length || !school.yearActions.every(action => ['Study hard','Join an activity'].includes(action as string))))) return false;
  }
  if (value.pendingEvent !== undefined && (!object(value.pendingEvent) || value.pendingEvent.age !== value.age || !validEvent(value.pendingEvent.event))) return false;
  if (value.inbox !== undefined) {
    if (!Array.isArray(value.inbox)) return false;
    const ids = new Set<string>();
    for (const mail of value.inbox) {
      if (!object(mail) || typeof mail.id !== 'string' || !mail.id || ids.has(mail.id) || !Number.isInteger(mail.age) || (mail.age as number) < 0 || (mail.age as number) > (value.age as number) || typeof mail.sender !== 'string' || typeof mail.read !== 'boolean' || !object(mail.event)) return false;
      ids.add(mail.id);
      const event = mail.event;
      if (!validEvent(event) || mail.archived !== undefined && typeof mail.archived !== 'boolean' || mail.archived === true && mail.decision === undefined) return false;
      if (mail.decision !== undefined && (!Number.isInteger(mail.decision) || (mail.decision as number) < 0 || (mail.decision as number) >= event.choices.length)) return false;
    }
  }
  return object(stats) && statNames.every(key => typeof stats[key] === 'number' && Number.isFinite(stats[key]) && (stats[key] as number) >= 0 && (stats[key] as number) <= 100)
    && Array.isArray(value.log) && value.log.every(entry => object(entry) && Number.isInteger(entry.age) && (entry.age as number) >= 0 && (entry.age as number) <= (value.age as number) && typeof entry.tag === 'string' && typeof entry.text === 'string');
}
export function parseStore(raw: string | null): SaveStore {
  if (raw === null) return emptyStore();
  const value: unknown = JSON.parse(raw);
  if (!object(value) || value.version !== 1 || !Array.isArray(value.lives) || !value.lives.every(validLife)) throw new Error('The saved character file could not be read.');
  const ids = value.lives.map(life => life.id);
  if (new Set(ids).size !== ids.length || !(value.activeId === null || typeof value.activeId === 'string' && ids.includes(value.activeId))) throw new Error('The saved character file is inconsistent.');
  return value as SaveStore;
}
export function loadStore(storage: StorageLike): SaveStore { const store = parseStore(storage.getItem(SAVE_KEY)); return { ...store, lives: store.lives.map(life => {
  let upgraded = life;
  if (life.firstName === undefined) {
    const [firstName, ...rest] = life.name.trim().split(/\s+/);
    if (rest.length) upgraded = { ...upgraded, firstName, lastName: rest.join(' ') };
  }
  const city = life.locationId ? cityById(life.locationId) : resolveCity(life.city);
  // Unknown legacy/non-US locations stay intact. Never silently move an existing
  // person to a different city or apply an unrelated state's policies.
  return city ? { ...upgraded, city: city.name, locationId: city.id, catalogSnapshotId: US_SNAPSHOT.id } : upgraded;
}) }; }
export function upsertLife(store: SaveStore, life: Life): SaveStore {
  const copy = structuredClone(life);
  return { version: 1, activeId: life.id, lives: store.lives.some(item => item.id === life.id) ? store.lives.map(item => item.id === life.id ? copy : item) : [...store.lives, copy] };
}
export function persistStore(storage: StorageLike, store: SaveStore): void {
  const raw = JSON.stringify(store);
  parseStore(raw);
  const previous = storage.getItem(SAVE_KEY);
  if (previous !== null) {
    try { parseStore(previous); } catch { storage.setItem(`${SAVE_KEY}.backup`, previous); }
  }
  storage.setItem(SAVE_KEY, raw);
}
export function restartLife(life: Life): Life {
  return { ...life, age: 0, balance: 0, social: undefined, inbox: undefined, pendingEvent: undefined, occupation: undefined, relationships: undefined, stats: life.family ? { ...life.family.birthStats } : { Health: 94, Happiness: 82, Smarts: 76, Looks: 68 }, log: [{ age: 0, tag: 'LIFE', text: `My name is ${life.name}. I was born in ${life.city}.` }] };
}
export function lifeDate(life: Life): string { return `01/01/${life.birthYear + life.age}`; }
