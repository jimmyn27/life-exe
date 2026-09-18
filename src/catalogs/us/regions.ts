import { US_SNAPSHOT } from './sources.ts';

export type StateCode = 'NY' | 'CA' | 'IL' | 'TX' | 'AZ' | 'PA' | 'FL' | 'NC' | 'OH' | 'IN' | 'WA' | 'CO' | 'TN' | 'OK' | 'DC' | 'NV' | 'MA' | 'MI' | 'KY' | 'OR' | 'MD' | 'WI' | 'NM' | 'GA' | 'MO' | 'NE' | 'VA' | 'MN';
export type StateProfile = { id: StateCode; name: string; countryId: 'US'; kind: 'state' | 'federal-district'; snapshotId: string };
const seeds: [StateCode,string][] = [
  ['NY','New York'],['CA','California'],['IL','Illinois'],['TX','Texas'],['AZ','Arizona'],['PA','Pennsylvania'],
  ['FL','Florida'],['NC','North Carolina'],['OH','Ohio'],['IN','Indiana'],['WA','Washington'],['CO','Colorado'],
  ['TN','Tennessee'],['OK','Oklahoma'],['DC','District of Columbia'],['NV','Nevada'],['MA','Massachusetts'],
  ['MI','Michigan'],['KY','Kentucky'],['OR','Oregon'],['MD','Maryland'],['WI','Wisconsin'],['NM','New Mexico'],
  ['GA','Georgia'],['MO','Missouri'],['NE','Nebraska'],['VA','Virginia'],['MN','Minnesota'],
];
// Hidden geography only. All gameplay policies are national; no state overrides.
export const states: readonly StateProfile[] = seeds.map(([id,name]) => ({
  id,name,countryId:'US',kind:id==='DC'?'federal-district':'state',snapshotId:US_SNAPSHOT.id,
}));
export function stateById(id: StateCode): StateProfile {
  const state = states.find(state => state.id === id);
  if (!state) throw new Error('Unknown US catalog state.');
  return state;
}
