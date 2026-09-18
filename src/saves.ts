import {schoolActivities} from './schoolActivityCatalog.ts';
import { resetFamily, birthIntroduction, type Family } from './family.ts';
import type { Entry, Stats, LifeEvent } from './data';
import type { LifeMail, PendingLifeEvent } from './mail';
import type { RelationshipRecord } from './relationships';
import type { Occupation } from './occupation';
import type { SocialPage } from './social';
import { cityById, resolveCity, US_SNAPSHOT } from './catalogs/us/index.ts';

export type Sexuality = 'Straight' | 'Bisexual' | 'Gay';
export type Life = { sexuality?:Sexuality; id: string; name: string; firstName?: string; lastName?: string; city: string; locationId?: string; catalogSnapshotId?: string; age: number; birthYear: number; balance: number; stats: Stats; log: Entry[]; social?: SocialPage; inbox?: LifeMail[]; pendingEvent?: PendingLifeEvent; occupation?: Occupation; family?: Family; relationships?: Record<string, RelationshipRecord> };
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
  return value.choices.every(choice => object(choice) && ['label', 'hint', 'outcome'].every(key => typeof choice[key] === 'string') && (choice.jobDecision===undefined || object(choice.jobDecision) && typeof choice.jobDecision.id==='string') && (choice.friendshipDecision===undefined || object(choice.friendshipDecision) && typeof choice.friendshipDecision.id==='string' && choice.friendshipDecision.id.length>0 && typeof choice.friendshipDecision.salvage==='boolean') && (choice.schoolEffect === undefined || object(choice.schoolEffect) && Object.entries(choice.schoolEffect).every(([key, effect]) => ['grades','popularity'].includes(key) && typeof effect === 'number' && Number.isFinite(effect))) && (choice.effect === undefined || object(choice.effect) && Object.entries(choice.effect).every(([key, effect]) => statNames.includes(key as typeof statNames[number]) && typeof effect === 'number' && Number.isFinite(effect))));
}
function validLife(value: unknown): value is Life {
  if (!object(value) || typeof value.id !== 'string' || !value.id || typeof value.name !== 'string' || !value.name.trim() || typeof value.city !== 'string') return false;
  if (value.locationId !== undefined && (typeof value.locationId !== 'string' || cityById(value.locationId)?.name !== value.city)) return false;
  if (value.catalogSnapshotId !== undefined && value.catalogSnapshotId !== US_SNAPSHOT.id) return false;
  if ((value.firstName === undefined) !== (value.lastName === undefined)) return false;
  if (value.firstName !== undefined && (typeof value.firstName !== 'string' || !value.firstName.trim() || typeof value.lastName !== 'string' || !value.lastName.trim() || value.name !== `${value.firstName} ${value.lastName}`)) return false;
  if (!Number.isInteger(value.age) || (value.age as number) < 0 || (value.age as number) > 1000 || !Number.isInteger(value.birthYear) || (value.birthYear as number) < 1 || (value.birthYear as number) > 8000 || typeof value.balance !== 'number' || !Number.isFinite(value.balance)) return false;
  if(value.sexuality!==undefined && !['Straight','Bisexual','Gay'].includes(value.sexuality as string))return false;
  const stats = value.stats;
  if (value.family !== undefined) {
    const family = value.family;
    const validStats = (item: unknown) => object(item) && statNames.every(key => typeof item[key] === 'number' && Number.isFinite(item[key]) && (item[key] as number) >= 0 && (item[key] as number) <= 100);
    if (!object(family) || !validStats(family.birthStats) || !Array.isArray(family.parents) || (family.parents.length < 1 || family.parents.length > 2)) return false;
    if (family.money !== undefined && (typeof family.money !== 'number' || !Number.isFinite(family.money) || family.money < 0 || family.money > 100)) return false;
    const validSiblings = (items: unknown) => Array.isArray(items) && items.every(item => object(item) && typeof item.id === 'string' && typeof item.name === 'string' && ['Male','Female'].includes(item.gender as string) && Number.isInteger(item.birthAge) && (item.birthAge as number) >= -60 && (item.birthAge as number) <= (value.age as number) && validStats(item.stats));
    if (family.siblings !== undefined && !validSiblings(family.siblings)) return false;
    if (family.origin !== undefined && (!object(family.origin) || !Array.isArray(family.origin.parents) || typeof family.origin.money !== 'number' || !Number.isFinite(family.origin.money) || family.origin.money < 0 || family.origin.money > 100 || !validSiblings(family.origin.siblings))) return false;
    const validParents = (items: unknown): boolean => Array.isArray(items) && items.length >= 1 && items.length <= 2 && items.every((parent,index) => object(parent) && parent.id === (index === 0 ? 'parent-mother' : 'parent-father') && parent.relation === (index === 0 ? 'Mother' : 'Father') && parent.gender === (index === 0 ? 'Female' : 'Male') && ['name','education','occupation'].every(key => typeof parent[key] === 'string' && !!(parent[key] as string).trim()) && Number.isInteger(parent.ageAtBirth) && (parent.ageAtBirth as number) >= 18 && (parent.ageAtBirth as number) <= 60 && validStats(parent.stats));
    if (!validParents(family.parents) || family.origin !== undefined && !validParents((family.origin as Record<string,unknown>).parents)) return false;
    for (const parent of [...family.parents,...(object(family.origin) && Array.isArray(family.origin.parents) ? family.origin.parents : [])]) {
      if (parent.career !== undefined && (!Number.isInteger(parent.career) || parent.career < 0 || parent.career > 4)) return false;
      if (parent.rank !== undefined && (!Number.isInteger(parent.rank) || parent.rank < 0 || parent.rank > 2)) return false;
      if (parent.yearsInPosition !== undefined && (!Number.isInteger(parent.yearsInPosition) || parent.yearsInPosition < 0)) return false;
    }
    if (family.gender !== undefined && !['Male','Female'].includes(family.gender as string) || family.planned !== undefined && typeof family.planned !== 'boolean') return false;
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
      if (record.usedAge !== undefined && (!Number.isInteger(record.usedAge) || (record.usedAge as number) > (value.age as number) || (record.usedAge as number) < 0)) return false;
      if (record.usedActions !== undefined && (!Array.isArray(record.usedActions) || !record.usedActions.every(action => ['Act up','Disrespect','Suck up','Break up','Befriend','Ask for money','Ask out','Compliment','Conversation','Flirt','Gift','Hook up','Have fun','Make love','Insult','Spend time','Unfriend'].includes(action as string)))) return false;
      if(record.friendship!==undefined && typeof record.friendship!=='boolean')return false;
      const friendProfile=record.profile;
      if(friendProfile!==undefined && (!object(friendProfile) || !['name','gender','education','occupation'].every(key=>typeof friendProfile[key]==='string') || !Number.isInteger(friendProfile.ageOffset) || (friendProfile.ageOffset as number)<0 || (friendProfile.ageOffset as number)>100))return false;
      const npcStats = record.stats;
      if (!id || !object(record) || !['acquaintance','friend', 'dating', 'unfriended'].includes(record.status as string) || typeof record.strength !== 'number' || !Number.isFinite(record.strength) || record.strength < 0 || record.strength > 100 || !object(npcStats) || !statNames.every(key => typeof npcStats[key] === 'number' && Number.isFinite(npcStats[key]) && (npcStats[key] as number) >= 0 && (npcStats[key] as number) <= 100)) return false;
    }
  }
  if (value.occupation !== undefined) {
    const occupation = value.occupation;
    const percentage = (number: unknown) => typeof number === 'number' && Number.isFinite(number) && number >= 0 && number <= 100;
    const startAge = (age: unknown) => Number.isInteger(age) && (age as number) >= 0 && (age as number) <= (value.age as number);
    if (!object(occupation) || !['None', 'Primary school', 'Middle school', 'Secondary school', 'University'].includes(occupation.highestEducation as string)) return false;
    const job = occupation.job;
    if (job !== null && (!object(job) || !['position', 'employer', 'hours'].every(key => typeof job[key] === 'string') || typeof job.salary !== 'number' || !Number.isFinite(job.salary) || job.salary < 0 || !percentage(job.performance) || !startAge(job.startAge))) return false;
    if(object(job) && (job.id!==undefined && typeof job.id!=='string' || (job.hourlyWage===undefined)!==(job.weeklyHours===undefined) || job.hourlyWage!==undefined && (typeof job.hourlyWage!=='number' || !Number.isFinite(job.hourlyWage) || job.hourlyWage<=0 || !Number.isInteger(job.weeklyHours) || (job.weeklyHours as number)<10 || (job.weeklyHours as number)>20)))return false;
    if(object(job) && (job.actionAge!==undefined && (!Number.isInteger(job.actionAge)||(job.actionAge as number)<0||(job.actionAge as number)>(value.age as number)) || job.usedActions!==undefined && (!Array.isArray(job.usedActions)||!job.usedActions.every(a=>['Hours','Raise','Resign','Work harder'].includes(a as string)))))return false;
    const school = occupation.school;
    if(occupation.droppedOut!==undefined && typeof occupation.droppedOut!=='boolean')return false;
    if(object(occupation.school) && (occupation.school.transfers!==undefined && (!Number.isInteger(occupation.school.transfers) || (occupation.school.transfers as number)<0) || occupation.school.danceAskedIds!==undefined && (!Array.isArray(occupation.school.danceAskedIds) || !occupation.school.danceAskedIds.every(id=>typeof id==='string'))))return false;
    const activityIds:string[]=schoolActivities.map(activity=>activity.id);
    if(object(school)) {
      if(school.activityDetails!==undefined && (!object(school.activityDetails) || !Object.entries(school.activityDetails).every(([id,detail])=>activityIds.includes(id) && Array.isArray(school.memberships) && school.memberships.includes(id) && object(detail) && percentage(detail.performance) && startAge(detail.joinAge) && Number.isInteger(detail.years) && detail.years===(value.age as number)-(detail.joinAge as number) && [0,1,2].includes(detail.rank as number) && Number.isInteger(detail.hours) && (detail.hours as number)>=1 && (detail.hours as number)<=10 && (detail.trainedAge===undefined || startAge(detail.trainedAge)))))return false;
      if(Array.isArray(school.roster) && school.roster.some(person=>object(person) && (person.grades!==undefined && !percentage(person.grades) || person.gradeAge!==undefined && !startAge(person.gradeAge) || ['clubs','sports'].some(key=>person[key]!==undefined && (!Array.isArray(person[key]) || !(person[key] as unknown[]).every(id=>activityIds.includes(id as string)))))))return false;
      if(school.memberships!==undefined && (!Array.isArray(school.memberships) || new Set(school.memberships).size!==school.memberships.length || !school.memberships.every(id=>activityIds.includes(id as string))))return false;
      if(school.activityAttempts!==undefined && (!object(school.activityAttempts) || !Object.entries(school.activityAttempts).every(([id,attempt])=>activityIds.includes(id) && object(attempt) && startAge(attempt.age) && typeof attempt.accepted==='boolean')))return false;
      if(school.roster!==undefined && (!Array.isArray(school.roster) || school.roster.length>80 || !school.roster.every(person=>object(person) && typeof person.id==='string' && typeof person.name==='string' && ['Male','Female'].includes(person.gender as string) && ['Classmate','Teacher','Principal','Professor'].includes(person.relation as string) && typeof person.group==='string' && percentage(person.strength) && Number.isInteger(person.ageOffset) && (person.ageOffset as number)>=0 && (person.ageOffset as number)<=100 && (person.subject===undefined || typeof person.subject==='string')) || new Set(school.roster.map((person:Record<string,unknown>)=>person.id)).size!==school.roster.length))return false;
    }
    if (school !== null && (!object(school) || typeof school.name !== 'string' || !['Primary school', 'Middle school', 'Secondary school', 'University'].includes(school.level as string) || !startAge(school.startAge) || !Number.isInteger(school.duration) || (school.duration as number) < 1 || (school.duration as number) > 20 || !percentage(school.grades) || !percentage(school.popularity) || school.yearActions !== undefined && (!Array.isArray(school.yearActions) || new Set(school.yearActions).size !== school.yearActions.length || !school.yearActions.every(action => ['Study harder','Study hard','Join an activity','Change schools','Drop out','Nurse','Skip school','School dance'].includes(action as string))))) return false;
  }
  if (value.pendingEvent !== undefined && (!object(value.pendingEvent) || value.pendingEvent.age !== value.age || !validEvent(value.pendingEvent.event) || value.pendingEvent.queue !== undefined && (!Array.isArray(value.pendingEvent.queue) || !value.pendingEvent.queue.every(validEvent)))) return false;
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
  if(upgraded.occupation?.school?.roster)upgraded={...upgraded,occupation:{...upgraded.occupation,school:{...upgraded.occupation.school,roster:upgraded.occupation.school.roster.map(p=>({...p,...(p.clubs?{clubs:p.clubs.slice(0,1)}:{}),...(p.sports?{sports:p.sports.slice(0,1)}:{})}))}}};
  if (life.firstName === undefined) {
    const [firstName, ...rest] = life.name.trim().split(/\s+/);
    if (rest.length) upgraded = { ...upgraded, firstName, lastName: rest.join(' ') };
  }
  if(upgraded.relationships) {
    const legacyPeople:Record<string,{name:string;gender:string;ageOffset:number;staff?:boolean}>={
      'maya-chen':{name:'Maya Chen',gender:'Female',ageOffset:0},
      'oliver-patel':{name:'Oliver Patel',gender:'Male',ageOffset:0},
      'sofia-reyes':{name:'Sofia Reyes',gender:'Female',ageOffset:0},
      'amelia-brooks':{name:'Amelia Brooks',gender:'Female',ageOffset:25,staff:true},
      'grace-turner':{name:'Grace Turner',gender:'Female',ageOffset:25,staff:true},
      'noah-reed':{name:'Noah Reed',gender:'Male',ageOffset:3},
      'priya-shah':{name:'Priya Shah',gender:'Female',ageOffset:3}
    };
    upgraded={...upgraded,relationships:Object.fromEntries(Object.entries(upgraded.relationships).map(([id,record])=>{
      const person=legacyPeople[id];
      if(!person || record.profile || !['friend','dating'].includes(record.status))return [id,record];
      return [id,{...record,friendship:true,profile:{name:person.name,gender:person.gender,ageOffset:person.ageOffset,education:person.staff?'University':upgraded.age>=18?'Secondary school':upgraded.age>=15?'Middle school':upgraded.age>=12?'Primary school':'No completed schooling yet',occupation:person.staff?'Teacher or manager':upgraded.age<18?'Student':'Not employed'}}];
    }))};
  }
  if (upgraded.age === 0 && upgraded.pendingEvent?.age === 0) upgraded = {...upgraded,pendingEvent:undefined,log:[{age:0,tag:'LIFE',text:birthIntroduction(upgraded.name,upgraded.city,upgraded.family)}]};
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
  const family = life.family ? resetFamily(life.family) : undefined;
  return { ...life, family, age: 0, balance: 0, social: undefined, inbox: undefined, pendingEvent: undefined, occupation: undefined, relationships: undefined, stats: life.family ? { ...life.family.birthStats } : { Health: 94, Happiness: 82, Smarts: 76, Looks: 68 }, log: [{ age: 0, tag: 'LIFE', text: birthIntroduction(life.name, life.city, family) }] };
}
export function lifeDate(life: Life): string { return `01/01/${life.birthYear + life.age}`; }
