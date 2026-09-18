import type { Life } from './saves';
import type { Stats } from './data';
import { getOccupation, occupationContacts, type Contact } from './occupation.ts';

export const relationshipActions = ['Ask out', 'Compliment', 'Conversation', 'Gift', 'Hook up', 'Insult', 'Spend time', 'Unfriend'] as const;
export type RelationshipAction = typeof relationshipActions[number];
export type RelationshipRecord = { strength: number; status: 'friend' | 'dating' | 'unfriended'; stats: Stats };
export type Person = Contact & { id: string; gender: string; age: number; education: string; occupation: string; stats: Stats; parent: boolean; status: RelationshipRecord['status'] };
export function characters(life: Life): { personal: Person[]; work: Person[]; school: Person[] } {
  const occupation = getOccupation(life);
  const contextual = occupationContacts(life);
  const personal: Contact[] = [{name:'Elena Morgan',relation:'Mother',strength:86,group:'Family'},{name:'Daniel Morgan',relation:'Father',strength:79,group:'Family'},...(life.age >= 12 ? [{name:'Maya Chen',relation:'Best friend',strength:93,group:'Friends'}] : [])];
  function profile(contact: Contact, setting: 'personal' | 'work' | 'school'): Person {
    const id = contact.name.toLowerCase().replaceAll(' ', '-');
    const parent = contact.relation === 'Mother' || contact.relation === 'Father';
    const staff = ['Teacher','Professor','Manager'].includes(contact.relation);
    const age = life.age + (contact.relation === 'Mother' ? 28 : contact.relation === 'Father' ? 31 : staff ? 25 : setting === 'work' ? 3 : 0);
    const seed = [...id].reduce((total, char) => total + char.charCodeAt(0),0);
    const stats: Stats = {Health:75+seed%21,Happiness:65+seed%30,Smarts:60+seed%36,Looks:55+seed%40};
    const record = life.relationships?.[id];
    const education = parent ? contact.relation === 'Mother' ? 'University' : 'Secondary school' : staff ? 'University' : age >= 18 ? 'Secondary school' : age >= 12 ? 'Primary school' : 'No completed schooling yet';
    const job = parent ? contact.relation === 'Mother' ? 'Nurse' : 'Electrician' : setting === 'work' ? `${contact.relation === 'Coworker' ? 'Library assistant' : contact.relation} · ${occupation.job?.employer}` : setting === 'school' ? `${contact.relation === 'Classmate' ? 'Student' : contact.relation} · ${occupation.school?.name}` : life.age < 18 ? 'Student' : 'Barista';
    return {...contact,id,parent,age,education,occupation:job,gender:['Daniel Morgan','Noah Reed','Oliver Patel'].includes(contact.name) ? 'Male' : 'Female',stats:record?.stats ?? stats,strength:record?.strength ?? contact.strength,status:record?.status ?? 'friend'};
  }
  return {personal:personal.map(contact => profile(contact,'personal')).filter(person => person.parent || person.status !== 'unfriended'),work:contextual.work.map(contact => profile(contact,'work')),school:contextual.school.map(contact => profile(contact,'school'))};
}
export function availableActions(person: Person): RelationshipAction[] {
  return relationshipActions.filter(action => !person.parent || !['Ask out','Hook up','Unfriend'].includes(action));
}
export function actionUnavailable(life: Life, person: Person, action: RelationshipAction): string | null {
  if (!availableActions(person).includes(action)) return 'This action is not available with parents.';
  if (['Ask out','Hook up'].includes(action) && (life.age < 18 || person.age < 18)) return 'Available when both characters are adults (18+).';
  if (action === 'Gift' && life.balance < 25) return 'You need $25.00 for a gift.';
  if (action === 'Ask out' && person.status === 'dating') return 'You are already dating.';
  if (action === 'Ask out' && Object.entries(life.relationships ?? {}).some(([id, record]) => id !== person.id && record.status === 'dating')) return 'You are already in a relationship.';
  if (action === 'Unfriend' && person.status === 'unfriended') return 'You are not currently friends.';
  return null;
}
export function interact(life: Life, id: string, action: RelationshipAction): Life {
  const groups = characters(life);
  const person = [...groups.personal,...groups.work,...groups.school].find(item => item.id === id);
  if (!person || !relationshipActions.includes(action) || actionUnavailable(life,person,action)) return life;
  const accepted = person.strength >= 65;
  const deltas: Record<RelationshipAction,number> = {'Ask out':accepted ? 5 : -2,Compliment:4,Conversation:3,Gift:6,'Hook up':accepted ? 2 : -2,Insult:-12,'Spend time':5,Unfriend:0};
  const text: Record<RelationshipAction,string> = {
    'Ask out':accepted ? `I asked ${person.name} out. We are now dating.` : `I asked ${person.name} out, but they politely declined.`,
    Compliment:`I complimented ${person.name}. It brightened their day.`,Conversation:`I had a conversation with ${person.name}. We enjoyed catching up.`,Gift:`I gave ${person.name} a gift. They appreciated the thought.`,
    'Hook up':accepted ? `I hooked up with ${person.name}.` : `I asked ${person.name} to hook up, but they declined.`,Insult:`I insulted ${person.name}. It hurt our relationship.`,
    'Spend time':`I spent time with ${person.name}. We had a lovely conversation.`,Unfriend:`I ended my friendship with ${person.name}.`
  };
  const status = action === 'Unfriend' ? 'unfriended' : action === 'Ask out' && accepted ? 'dating' : person.status;
  const happiness = action === 'Insult' || action === 'Unfriend' ? -3 : ['Ask out','Hook up'].includes(action) && !accepted ? -1 : 2;
  const record: RelationshipRecord = {strength:action === 'Unfriend' ? 0 : Math.max(0,Math.min(100,person.strength+deltas[action])),status,stats:{...person.stats,Happiness:Math.max(0,Math.min(100,person.stats.Happiness+happiness))}};
  return {...life,balance:life.balance-(action === 'Gift' ? 25 : 0),stats:{...life.stats,Happiness:Math.max(0,Math.min(100,life.stats.Happiness+happiness))},relationships:{...life.relationships,[id]:record},log:[...life.log,{age:life.age,tag:'SOCIAL',text:text[action]}]};
}
