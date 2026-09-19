import {attendingSchool,educationLabel} from './profileDetails.ts';
import {romanceOutcome} from './romance.ts';
import {npcBaseStats,classmatePopularity} from './npcSchool.ts';
import {npcSexuality} from './preferences.ts';
import { personAddress } from './personAddress.ts';
import { reaction } from './interactionResults.ts';
import { gifts, giftEffect } from './gifts.ts';
import { familyMoney, seededRandom } from './family.ts';
import type { Life } from './saves';
import type { Stats } from './data';
import { getOccupation, occupationJobs, withOccupationJobs, schoolPopularity, occupationContacts, schoolName, type Contact } from './occupation.ts';

export const relationshipActions = ['Break up', 'Befriend', 'Ask for money', 'Ask out', 'Compliment', 'Conversation', 'Flirt', 'Gift', 'Hook up', 'Insult', 'Make love', 'Spend time', 'Unfriend', 'Act up', 'Disrespect', 'Suck up'] as const;
export type RelationshipAction = typeof relationshipActions[number];
export type RelationshipRecord = { strength: number; status: 'acquaintance' | 'friend' | 'dating' | 'unfriended'; stats: Stats; friendship?: boolean; profile?: {name:string;gender:string;ageOffset:number;education:string;occupation:string}; usedAge?: number; usedActions?: RelationshipAction[]; moneyAcceptedAge?:number; successfulAge?:number; successfulActions?:RelationshipAction[] };
export type Person = Contact & { grades?:number;popularity?:number;extracurriculars?:string[];sexuality:import('./saves').Sexuality; id: string; gender: string; age: number; education: string; occupation: string; stats: Stats; parent: boolean; friendship: boolean; family: boolean; status: RelationshipRecord['status'] };
export function relationshipRoleLabel(person:Person,contextual=false){
 return person.status==='dating'?(person.gender==='Female'?'Girlfriend':'Boyfriend'):contextual&&person.friendship?'Friend':person.relation;
}
export function characters(life: Life): { personal: Person[]; work: Person[]; school: Person[] } {
  const occupation = getOccupation(life);
  const contextual = occupationContacts(life);
  const surname = life.lastName ?? (life.name.trim().split(/\s+/).slice(1).join(' ') || 'Morgan');
  const personal: Contact[] = [...(life.family?.parents.map(parent => ({name:parent.name,relation:parent.relation,strength:100,group:'Family'})) ?? [{name:`Elena ${surname}`,relation:'Mother',strength:100,group:'Family'},{name:`Daniel ${surname}`,relation:'Father',strength:100,group:'Family'}]),...(life.family?.siblings??[]).map(sibling=>({name:sibling.name,relation:sibling.gender==='Male'?'Brother':'Sister',strength:100,group:'Family'})),...(life.age >= 10 && (!life.family || life.relationships?.['maya-chen']) ? [{name:'Maya Chen',relation:'Best friend',strength:93,group:'Friends'}] : [])];
  for(const [id,record] of Object.entries(life.relationships??{})) {
    if(!record.profile || !(record.friendship??record.status==='friend') && record.status!=='dating' || personal.some(contact=>(contact.id??contact.name.toLowerCase().replaceAll(' ','-'))===id))continue;
    const current=[...contextual.school,...contextual.work].find(contact=>contact.id===id);
    personal.push({...record.profile,...current,id,name:record.profile.name,relation:'Friend',group:'Friends',strength:record.strength});
  }
  function profile(contact: Contact, setting: 'personal' | 'work' | 'school'): Person {
    const familyParent = life.family?.parents.find(parent => parent.relation === contact.relation);
    const sibling=life.family?.siblings?.find(s=>s.name===contact.name);
    const id = contact.id ?? sibling?.id ?? familyParent?.id ?? contact.name.toLowerCase().replaceAll(' ', '-');
    const parent = contact.relation === 'Mother' || contact.relation === 'Father';
    const staff = ['Teacher','Professor','Principal','Manager'].includes(contact.relation);
    const age = sibling ? life.age-sibling.birthAge : life.age + (contact.ageOffset ?? familyParent?.ageAtBirth ?? (contact.relation === 'Mother' ? 28 : contact.relation === 'Father' ? 31 : staff ? 25 : setting === 'work' ? 3 : 0));
    const stats:Stats=npcBaseStats(id);
    const record = life.relationships?.[id];
    const education = parent ? contact.relation === 'Mother' ? 'University' : 'Secondary school' : staff ? 'University' : age >= 18 ? 'Secondary school' : age>=14?'Middle school':age >= 10 ? 'Primary school' : 'No completed schooling yet';
    const job = parent ? contact.relation === 'Mother' ? 'Nurse' : 'Electrician' : setting === 'work' ? `${contact.relation === 'Coworker' ? occupation.job?.position??'Coworker' : contact.relation} · ${occupation.job?.employer}` : setting === 'school' ? `${contact.relation === 'Classmate' ? 'Student' : contact.relation} · ${occupation.school ? schoolName(life,occupation.school) : ''}` : life.age < 18 ? 'Student' : 'Barista';
    const gender=contact.gender ?? sibling?.gender ?? familyParent?.gender ?? (contact.relation === 'Father' || ['Noah Reed','Oliver Patel'].includes(contact.name) ? 'Male' : 'Female');
    const student=contextual.school.find(p=>p.id===id && p.relation==='Classmate') as import('./schoolCommunity').SchoolPerson|undefined;
    return {...contact,id,...(student?{grades:student.grades??(record?.stats??stats).Intelligence,popularity:classmatePopularity(student,(record?.stats??stats).Charisma)}:{}),extracurriculars:student?[...(student.clubs??[]).slice(0,1),...(student.sports??[]).slice(0,1)]:undefined,sexuality:npcSexuality(life.id,id),parent,friendship:record?.friendship ?? (record?.status==='friend' || contact.group==='Friends'),family:parent || Boolean(sibling),age,education:age<18 && !staff && !parent?attendingSchool(age):educationLabel(familyParent?.education??(record?.profile && record.profile.ageOffset>10?record.profile.education:education),id,familyParent?.occupation??job),occupation:sibling ? age>=18?'Not employed':age>=6?'Student':'Not in school' : familyParent?.occupation ?? (setting==='personal' && record?.profile ? record.profile.ageOffset>0?record.profile.occupation:age<18?'Student':'Not employed' : contact.subject ? `${contact.subject} ${contact.relation.toLowerCase()} · ${occupation.school?schoolName(life,occupation.school):''}` : job),gender,stats:record?.stats ?? sibling?.stats ?? familyParent?.stats ?? stats,strength:record?.strength ?? contact.strength,status:record?.status ?? (contact.group==='Family' || contact.group==='Friends'?'friend':'acquaintance')};
  }
  return {personal:personal.map(contact => profile(contact,'personal')).filter(person => person.parent || person.status !== 'unfriended'),work:contextual.work.map(contact => profile(contact,'work')),school:contextual.school.map(contact => profile(contact,'school'))};
}
export function availableActions(person: Person, life?: Life): RelationshipAction[] {
 if(person.parent || person.family) {
  if(life && (life.age<2 || person.age<2)) return [];
  if(life && (life.age<6 || person.age<6)) return ['Conversation','Spend time'];
  return [...(person.parent?['Ask for money' as const]:[]),'Compliment','Conversation',...(person.parent?['Gift' as const]:[]),'Insult','Spend time'];
 }
 if(['Teacher','Principal','Professor'].includes(person.relation) || /\b(teacher|principal|professor)\b/i.test(person.occupation)) return person.friendship ? ['Act up','Compliment','Conversation','Gift','Insult','Spend time','Unfriend'] : ['Act up','Befriend','Compliment','Conversation','Gift','Disrespect','Insult','Suck up'];
 return relationshipActions.filter(action=>!['Act up','Disrespect','Suck up'].includes(action) && action!=='Ask for money' && (action!=='Break up'||person.status==='dating') && (action!=='Flirt'||person.status!=='dating') && (action!=='Spend time'||person.friendship||person.status==='dating') && (action!=='Make love' || person.status==='dating')  && (action!=='Befriend' || !person.friendship && person.status!=='dating') && (action!=='Unfriend' || person.friendship && person.status!=='dating'));
}
export function actionUnavailable(life: Life, person: Person, action: RelationshipAction): string | null {
  if (!availableActions(person,life).includes(action)) return 'This action is not available with this person.';
  if(action==='Ask out'&&(life.age<12||person.age<12||(life.age<18)!==(person.age<18)))return 'Dating is available from age 12, between peers or between adults.';
  if(action==='Flirt'&&(life.age<10||person.age<10||(life.age<18)!==(person.age<18)))return 'Flirting is available from age 10, between peers or between adults.';
  if (['Hook up','Make love'].includes(action) && (life.age < 18 || person.age < 18)) return 'Available when both characters are adults (18+).';
  if (action === 'Ask out' && person.status === 'dating') return 'You are already dating.';
  if (action === 'Ask out' && Object.entries(life.relationships ?? {}).some(([id, record]) => id !== person.id && record.status === 'dating')) return 'You are already in a relationship.';
  if (action === 'Unfriend' && person.status === 'unfriended') return 'You are not currently friends.';
  return null;
}
export function interact(life: Life, id: string, action: RelationshipAction, giftId?: string,invited=false): Life {
  const groups = characters(life);
  const person = [...groups.personal,...groups.work,...groups.school].find(item => item.id === id);
  if (!person || !relationshipActions.includes(action) || actionUnavailable(life,person,action)) return life;
  const gift=giftId ? gifts.find(item=>item.id===giftId) : undefined;
  const alreadyGifted=life.relationships?.[id]?.usedAge===life.age&&life.relationships[id].usedActions?.includes('Gift');
  if(action==='Gift' && !alreadyGifted && (giftId && !gift || life.balance<(gift?.price??25)))return life;
  life=initializeWorkRelationships(life);
  const giftDelta=gift ? giftEffect(life,person,gift) : 6;
  const previous=life.relationships?.[id];
  const used=previous?.usedAge===life.age ? previous.usedActions??[] : [];
  const first=!used.includes(action);
  const wealth=familyMoney(life.family);
  const random=seededRandom(`${life.id}:${id}:money:${life.age}`);
  const given=action==='Ask for money' && first && random() < (person.strength/100)*(.35+wealth/155);
  const amount=given ? Math.max(1,Math.round((2+wealth*1.8)*(.5+random()*.5))) : 0;
  const response=reaction(life,person,action,giftId);
  const romance=romanceOutcome(life,person,action);
  const accepted=invited && action==='Ask out'?true:action==='Befriend'?random()<person.strength/100:['Hook up','Make love'].includes(action)?romance.accepted:person.strength>=65 && (action!=='Ask out'||romance.compatible);
  const intimacyGain=Math.round(romance.theirEnjoyment/5);
  const deltas: Record<RelationshipAction,number> = {'Break up':-50,'Hook up':accepted?intimacyGain:-20,'Act up':-25,Disrespect:-50,'Suck up':response.delta,Befriend:accepted?25:-25,Flirt:response.delta,'Ask for money':given?0:-10,'Ask out':accepted?25:-10,Compliment:response.delta,Conversation:response.delta,Gift:response.delta,'Make love':accepted?intimacyGain:-20,Insult:-20,'Spend time':10,Unfriend:0};
  const subject=person.gender==='Female'?'she':'he',capital=person.gender==='Female'?'She':'He';
  const spendActivities=['watched a movie together','played a board game','walked through the park','shared a meal','visited a museum','went shopping','played video games','listened to music','cooked something together','went for ice cream','worked on a puzzle','visited a local festival','had a picnic','went bowling','explored a new neighborhood','looked through old photos','made crafts together','watched a sports game','went to a café','spent a quiet afternoon talking'];
  const spendActivity=spendActivities[Math.floor(seededRandom(`${life.id}:${id}:${life.age}:${life.log.length}:spend-time`)()*spendActivities.length)];
  const text: Record<RelationshipAction,string> = {
    'Break up':`I broke up with ${person.name}.`,
    'Hook up':accepted?`I hooked up with ${person.name}.`:`I asked ${person.name} to hook up, but ${subject} declined.`,
    'Act up':`I acted up around ${person.name}. It strained our relationship.`,
    Disrespect:`I disrespected ${person.name}. ${capital} was disappointed in me.`,
    'Suck up':`I tried to impress ${person.name}.`,
    Flirt:response.text.replace(/^You /,'I '),
    Befriend:accepted?`I befriended ${person.name}.`:`I tried to befriend ${person.name}, but ${subject} rejected me.`,
    'Ask for money':given ? `I asked my ${person.relation.toLowerCase()} for money. ${capital} gave me $${amount}.` : `I asked my ${person.relation.toLowerCase()} for money, but ${subject} declined.`,
    'Ask out':accepted ? `I asked ${person.name} out. ${capital} is now my ${person.gender==='Female'?'girlfriend':'boyfriend'}.` : `I asked ${person.name} out, but ${subject} politely declined.`,
    Compliment:response.text.replace(/^You /,'I ').replace(/your /g,'my '),Conversation:response.text.replace(/^You and (.*?) talked/, '$1 and I talked').replace(/your /g,'my '),Gift:!first?`I had already given ${person.name} a gift this year.`:gift ? `I gave ${person.name} ${gift.name.toLowerCase()} ($${gift.price}). ${response.delta<0?`${capital} did not appreciate the gift.`:`${capital} appreciated the gift.`}` : `I gave ${person.name} a gift. ${capital} appreciated the thought.`,
    'Make love':accepted?`I shared an intimate moment with ${person.name}.`:`${person.name} was not in the mood for intimacy.`,
    Insult:`I insulted ${person.name}. It hurt our relationship.`,
    'Spend time':`I spent time with ${person.name}. We ${spendActivity}.`,Unfriend:`I ended my friendship with ${person.name}.`
  };
  const status = action==='Break up'?(person.friendship?'friend':'acquaintance'):action==='Befriend' && accepted ? person.status==='dating'?'dating':'friend' : action === 'Unfriend' ? 'unfriended' : action === 'Ask out' && accepted ? 'dating' : person.status;
  const always=['Befriend','Ask for money','Ask out','Insult','Act up','Disrespect'].includes(action) || ['Hook up','Make love'].includes(action) && !accepted;
  const successfulIntimacy=['Hook up','Make love'].includes(action)&&accepted;
  const successfulUsed=previous?.successfulAge===life.age?previous.successfulActions??[]:[];
  const firstSuccessful=successfulIntimacy&&!successfulUsed.includes(action);
  const applyEffect=always || firstSuccessful || first;
  const playerHappiness=action==='Befriend'?(accepted?25:-25):action==='Ask for money'?(given?5:-10):action==='Ask out'?(accepted?25:-25):successfulIntimacy?(firstSuccessful?Math.round(romance.yourEnjoyment/5):0):['Hook up','Make love'].includes(action)?-20:action==='Break up'?-10:action==='Conversation'||action==='Flirt'?(first?response.delta:0):action==='Spend time'?(first?5:0):0;
  const recipientHappiness=action==='Befriend'?(accepted?25:0):action==='Ask for money'?(!given&&!first?-5:0):action==='Ask out'?(accepted?25:0):successfulIntimacy?(firstSuccessful?intimacyGain:0):action==='Conversation'||action==='Flirt'||action==='Compliment'?(first?response.delta:0):action==='Gift'?(first?response.delta:0):action==='Insult'?-10:action==='Spend time'?(first?5:0):action==='Break up'?-25:action==='Unfriend'?-15:action==='Act up'?-10:action==='Disrespect'?-20:action==='Suck up'?(first?Math.max(0,Math.round(response.value/10)):0):0;
  const highSocial=first&&['Compliment','Conversation','Flirt','Gift','Suck up'].includes(action)&&response.value>75;
  const lowSocial=first&&['Compliment','Conversation','Flirt','Gift','Suck up'].includes(action)&&response.value<=25;
  const successfulSocial=action==='Befriend'&&accepted||action==='Ask out'&&accepted||firstSuccessful;
  const rejectedSocial=action==='Befriend'&&!accepted||action==='Ask out'&&!accepted||action==='Hook up'&&!accepted;
  const antisocial=['Insult','Act up','Disrespect','Unfriend','Break up'].includes(action);
  const charismaDirection=highSocial||successfulSocial?1:lowSocial||rejectedSocial||antisocial?-1:0;
  const charismaRoll=seededRandom(`${life.id}:${id}:${life.age}:${action}:${life.log.length}:charisma`)();
  const charismaChange=charismaDirection!==0&&charismaRoll<.5?charismaDirection:0;
  const record: RelationshipRecord = {...(!person.family?{profile:{name:person.name,gender:person.gender,ageOffset:person.age-life.age,education:person.education,occupation:person.occupation}}:{}),friendship:action==='Befriend'&&accepted?true:action==='Unfriend'?false:person.friendship,usedAge:life.age,usedActions:[...new Set([...used,action])],...(given?{moneyAcceptedAge:life.age}:previous?.moneyAcceptedAge!==undefined?{moneyAcceptedAge:previous.moneyAcceptedAge}:{}),...(successfulIntimacy?{successfulAge:life.age,successfulActions:[...new Set([...successfulUsed,action])]}:previous?.successfulAge!==undefined?{successfulAge:previous.successfulAge,successfulActions:previous.successfulActions}:{}),strength:action === 'Unfriend' ? person.strength : Math.max(0,Math.min(100,person.strength+(applyEffect?deltas[action]:0))),status,stats:{...person.stats,Happiness:Math.max(0,Math.min(100,person.stats.Happiness+recipientHappiness))}};
  const occupation=getOccupation(life);
  const school=occupation.school;
  const staff=school?.roster?.some(p=>p.id===id && ['Teacher','Principal','Professor'].includes(p.relation));
  const staffGradeChange:Partial<Record<RelationshipAction,number>>={
   'Act up':-10,
   Befriend:accepted?5:0,
   Compliment:Math.round(response.value*2/100),
   Conversation:-2+Math.round(response.value*4/100),
   Gift:-5+Math.round(response.value*10/100),
   Disrespect:-20,
   Insult:-15,
   'Suck up':Math.min(10,Math.max(0,response.delta)),
   'Spend time':2,
   Unfriend:0
  };
  const gradeGain=staff && applyEffect?(staffGradeChange[action]??0):0;
  const manager=groups.work.some(p=>p.id===id && p.relation==='Manager');
  const performanceGain=manager && applyEffect?(action==='Suck up'?Math.max(0,response.delta):deltas[action]):0;
  const updatedOccupation=withOccupationJobs({...occupation,...(school?{school:{...school,grades:Math.max(0,Math.min(100,school.grades+gradeGain))}}:{})},occupationJobs(occupation).map(job=>({...job,performance:Math.max(0,Math.min(100,job.performance+performanceGain))})));
  const next:Life={...life,...(school||occupationJobs(occupation).length?{occupation:updatedOccupation}:{}),balance:life.balance+amount-(action === 'Gift' && first ? gift?.price??25 : 0),stats:{...life.stats,Happiness:Math.max(0,Math.min(100,life.stats.Happiness+playerHappiness)),Charisma:Math.max(0,Math.min(100,life.stats.Charisma+charismaChange))},relationships:{...life.relationships,[id]:record},log:[...life.log,{age:life.age,tag:'SOCIAL',text:text[action].split(person.name).join(personAddress(person,'first'))}]};
  if(first && action==='Suck up'){
    const peers=manager?groups.work.filter(p=>p.relation==='Coworker'):groups.school.filter(p=>p.relation==='Classmate');
    for(const classmate of peers){const existing=next.relationships?.[classmate.id];next.relationships![classmate.id]={...existing,strength:Math.max(0,classmate.strength-5),status:classmate.status,friendship:classmate.friendship,stats:{...classmate.stats}};}
  }
  if(next.occupation?.school)next.occupation.school.popularity=schoolPopularity(next,next.occupation.school);
  return next;
}

export function initializeWorkRelationships(life:Life):Life {
 const relationships={...life.relationships};for(const person of characters(life).work){if(!relationships[person.id])relationships[person.id]={strength:person.strength,status:person.status,stats:person.stats};}
 return Object.keys(relationships).length?{...life,relationships}:life;
}

export function declineInvitation(life:Life,id:string):Life{
 const person=[...characters(life).personal,...characters(life).work,...characters(life).school].find(p=>p.id===id);if(!person)return life;
 const old=life.relationships?.[id],record:RelationshipRecord={...(old??{status:person.status,stats:person.stats}),strength:Math.max(0,person.strength-10),status:person.status,friendship:person.friendship,stats:{...person.stats,Happiness:Math.max(0,person.stats.Happiness-25)}};
 return {...life,relationships:{...life.relationships,[id]:record},log:[...life.log,{age:life.age,tag:'SOCIAL',text:`I declined ${person.name}'s invitation to date.`}]};
}
