import type { Stats } from './data';
export type Parent = { id: string; name: string; relation: 'Mother' | 'Father'; gender: 'Female' | 'Male'; ageAtBirth: number; education: string; occupation: string; stats: Stats };
export type Family = { parents: Parent[]; birthStats: Stats };
export function seededRandom(seed: string): () => number {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
}
export function generateFamily(id: string, surname: string): Family {
  const random = seededRandom(id + ':family');
  const integer = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const motherNames = ['Elena', 'Grace', 'Nadia', 'Claire'];
  const fatherNames = ['Daniel', 'Marcus', 'Ethan', 'David'];
  const otherSurnames = ['Chen', 'Reed', 'Patel', 'Turner'].filter(name => name !== surname);
  const stats = (): Stats => ({Health: integer(65,100), Happiness: integer(55,95), Smarts: integer(30,95), Looks: integer(30,95)});
  const parents: Parent[] = [
    {id:'parent-mother',name:`${motherNames[integer(0,3)]} ${random() < .85 ? surname : otherSurnames[integer(0,otherSurnames.length-1)]}`,relation:'Mother',gender:'Female',ageAtBirth:integer(22,38),education:'University',occupation:'Nurse',stats:stats()},
    {id:'parent-father',name:`${fatherNames[integer(0,3)]} ${surname}`,relation:'Father',gender:'Male',ageAtBirth:integer(22,42),education:'Secondary school',occupation:'Electrician',stats:stats()}
  ];
  const inherit = (key: 'Smarts' | 'Looks') => Math.max(0,Math.min(100,Math.round((parents[0].stats[key]+parents[1].stats[key])/2)+integer(-8,8)));
  return {parents,birthStats:{Health:integer(85,100),Happiness:integer(70,95),Smarts:inherit('Smarts'),Looks:inherit('Looks')}};
}
