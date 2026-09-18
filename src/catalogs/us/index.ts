import { cities } from './cities.ts';
import { stateById } from './regions.ts';
import { unitedStates } from './federal.ts';
export { cities } from './cities.ts';
export { states, stateById } from './regions.ts';
export { unitedStates, benefits, retirementSystems } from './federal.ts';
export { US_SNAPSHOT, sources } from './sources.ts';
export const DEFAULT_CITY_ID = 'us-36-51000';
export const cityOptions = [...cities].sort((a,b) => a.name.localeCompare(b.name,'en-US'));
export function cityById(id: string) { return cities.find(city => city.id === id); }
export function resolveCity(value: string) {
  const [name,stateName,countryName] = value.trim().toLowerCase().split(',').map(part => part.trim());
  if (countryName && !['us','usa','united states','united states of america'].includes(countryName)) return undefined;
  return cities.find(city => {
    if (city.id === value) return true;
    const nameMatches = city.name.toLowerCase() === name || city.censusName.toLowerCase() === name || city.name === 'New York City' && name === 'new york';
    const state = stateById(city.stateId);
    return nameMatches && (!stateName || stateName === state.id.toLowerCase() || stateName === state.name.toLowerCase());
  });
}
export function regionalProfile(cityId: string) {
  const city = cityById(cityId);
  if (!city) throw new Error('Unknown US catalog city.');
  return { city, state: stateById(city.stateId), country: unitedStates };
}
export function displayCity(location: { city: string; locationId?: string }) {
  return (location.locationId ? cityById(location.locationId) : resolveCity(location.city))?.name ?? location.city;
}
