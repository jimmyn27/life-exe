import { familyMoney, seededRandom } from './family.ts';
import type { Life } from './saves';
import type { Stats } from './data';
import { getOccupation, occupationContacts, schoolName, type Contact } from './occupation.ts';

export const relationshipActions = ['Ask for money', 'Ask out', 'Compliment', 'Conversation', 'Gift', 'Hook up', 'Insult', 'Spend time', 'Unfriend'] as const;
export type RelationshipAction = typeof relationshipActions[number];
export type RelationshipRecord = { strength: number; status: 'friend' | 'dating' | 'unfriended'; stats: Stats; usedAge?: number; usedActions?: RelationshipAction[] };
export type Person = Contact & { id: string; gender: string; age: number; education: string; occupation: string; stats: Stats; parent: boolean; family: boolean; status: RelationshipRecord['status'] };
export function characters(life: Life): { personal: Person[]; work: Person[]; school: Person[] } {
  const occupation = getOccupation(life);
  const contextual = occupationContacts(life);
  const surname = life.lastName ?? (life.name.trim().split(/\s+/).slice(1).join(' ') || 'Morgan');
  const personal: Contact[] = [...(life.family?.parents.map(parent => ({name:parent.name,relation:parent.relation,strength:parent.relation === 'Mother' ? 86 : 79,group:'Family'})) ?? [{name:`Elena ${surname}`,relation:'Mother',strength:86,group:'Family'},{name:`Daniel ${surname}`,relation:'Father',strength:79,group:'Family'}]),...(life.family?.siblings??[]).map(sibling=>({name:sibling.name,relation:sibling.gender==='Male'?'Brother':'Sister',strength:75,group:'Family'})),...(life.age >= 12 ? [{name:'Maya Chen',relation:'Best friend',strength:93,group:'Friends'}] : [])];
  function profile(contact: Contact, setting: 'personal' | 'work' | 'school'): Person {
    const familyParent = life.family?.parents.find(parent => parent.relation === contact.relation);
    const sibling=life.family?.siblings?.find(s=>s.name===contact.name);
    const id = sibling?.id ?? familyParent?.id ?? contact.name.toLowerCase().replaceAll(' ', '-');
    const parent = contact.relation === 'Mother' || contact.relation === 'Father';
    const staff = ['Teacher','Professor','Manager'].includes(contact.relation);
    const age = sibling ? life.age-sibling.birthAge : life.age + (familyParent?.ageAtBirth ?? (contact.relation === 'Mother' ? 28 : contact.relation === 'Father' ? 31 : staff ? 25 : setting === 'work' ? 3 : 0));
    const seed = [...id].reduce((total, char) => total + char.charCodeAt(0),0);
    const stats: Stats = {Health:75+seed%21,Happiness:65+seed%30,Smarts:60+seed%36,Looks:55+seed%40};
    const record = life.relationships?.[id];
    const education = parent ? contact.relation === 'Mother' ? 'University' : 'Secondary school' : staff ? 'University' : age >= 18 ? 'Secondary school' : age >= 12 ? 'Primary school' : 'No completed schooling yet';
    const job = parent ? contact.relation === 'Mother' ? 'Nurse' : 'Electrician' : setting === 'work' ? `${contact.relation === 'Coworker' ? 'Library assistant' : contact.relation} · ${occupation.job?.employer}` : setting === 'school' ? `${contact.relation === 'Classmate' ? 'Student' : contact.relation} · ${occupation.school ? schoolName(life,occupation.school) : ''}` : life.age < 18 ? 'Student' : 'Barista';
    return {...contact,id,parent,family:parent || Boolean(sibling),age,education:sibling ? age>=18?'Secondary school':age>=12?'Primary school':'No completed schooling yet' : familyParent?.education ?? education,occupation:sibling ? age>=18?'Not employed':age>=6?'Student':'Not in school' : familyParent?.occupation ?? job,gender:sibling?.gender ?? familyParent?.gender ?? (contact.relation === 'Father' || ['Noah Reed','Oliver Patel'].includes(contact.name) ? 'Male' : 'Female'),stats:record?.stats ?? sibling?.stats ?? familyParent?.stats ?? stats,strength:record?.strength ?? contact.strength,status:record?.status ?? 'friend'};
  }
  return {personal:personal.map(contact => profile(contact,'personal')).filter(person => person.parent || person.status !== 'unfriended'),work:contextual.work.map(contact => profile(contact,'work')),school:contextual.school.map(contact => profile(contact,'school'))};
}
export function availableActions(person: Person, life?: Life): RelationshipAction[] {
 if(person.parent || person.family) {
  if(life && (life.age<2 || person.age<2)) return [];
  if(life && (life.age<6 || person.age<6)) return ['Conversation','Spend time'];
  return [...(person.parent?['Ask for money' as const]:[]),'Compliment','Conversation','Insult','Spend time'];
 }
 return relationshipActions.filter(action=>action!=='Ask for money');
}
export function actionUnavailable(life: Life, person: Person, action: RelationshipAction): string | null {
  if (!availableActions(person,life).includes(action)) return 'This action is not available with parents.';
  if (['Ask out','Hook up'].includes(action) && (life.age < 18 || person.age < 18)) return 'Available when both characters are adults (18+).';
  if (action === 'Ask for money' && life.relationships?.[person.id]?.usedAge === life.age && life.relationships[person.id].usedActions?.includes(action)) return 'You already asked this parent for money this year.';
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
  const previous=life.relationships?.[id];
  const used=previous?.usedAge===life.age ? previous.usedActions??[] : [];
  const first=!used.includes(action);
  const wealth=familyMoney(life.family);
  const random=seededRandom(`${life.id}:${id}:money:${life.age}`);
  const given=action==='Ask for money' && random() < (person.strength/100)*(.35+wealth/155);
  const amount=given ? Math.max(1,Math.round((2+wealth*1.8)*(.5+random()*.5))) : 0;
  const accepted = person.strength >= 65;
  const deltas: Record<RelationshipAction,number> = {'Ask for money':0,'Ask out':accepted ? 5 : -2,Compliment:4,Conversation:3,Gift:6,'Hook up':accepted ? 2 : -2,Insult:-12,'Spend time':5,Unfriend:0};
  const text: Record<RelationshipAction,string> = {
    'Ask for money':given ? `I asked my ${person.relation.toLowerCase()} for money. They gave me $${amount}.` : `I asked my ${person.relation.toLowerCase()} for money, but they declined.`,
    'Ask out':accepted ? `I asked ${person.name} out. We are now dating.` : `I asked ${person.name} out, but they politely declined.`,
    Compliment:`I complimented ${person.name}. It brightened their day.`,Conversation:`I had a conversation with ${person.name}. We enjoyed catching up.`,Gift:`I gave ${person.name} a gift. They appreciated the thought.`,
    'Hook up':accepted ? `I hooked up with ${person.name}.` : `I asked ${person.name} to hook up, but they declined.`,Insult:`I insulted ${person.name}. It hurt our relationship.`,
    'Spend time':`I spent time with ${person.name}. We had a lovely conversation.`,Unfriend:`I ended my friendship with ${person.name}.`
  };
  const status = action === 'Unfriend' ? 'unfriended' : action === 'Ask out' && accepted ? 'dating' : person.status;
  const happiness = !first || action==='Ask for money' ? 0 : action === 'Insult' || action === 'Unfriend' ? -3 : ['Ask out','Hook up'].includes(action) && !accepted ? -1 : 2;
  const record: RelationshipRecord = {usedAge:life.age,usedActions:[...new Set([...used,action])],strength:action === 'Unfriend' ? 0 : Math.max(0,Math.min(100,person.strength+(first?deltas[action]:0))),status,stats:{...person.stats,Happiness:Math.max(0,Math.min(100,person.stats.Happiness+happiness))}};
  return {...life,balance:life.balance+amount-(action === 'Gift' ? 25 : 0),stats:{...life.stats,Happiness:Math.max(0,Math.min(100,life.stats.Happiness+happiness))},relationships:{...life.relationships,[id]:record},log:[...life.log,{age:life.age,tag:'SOCIAL',text:text[action]}]};
}
