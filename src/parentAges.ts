// Signed gap = father's age minus mother's age, in whole years.
// Gameplay approximation centered on Pew's ~4-year global signed mean.
// Individual weights are design assumptions, not measured global frequencies.
export const parentAgeGapBands = [
 { min: -10, max: -6, weight: 1 },
 { min: -5, max: -3, weight: 4 },
 { min: -2, max: -1, weight: 7 },
 { min: 0, max: 0, weight: 10 },
 { min: 1, max: 2, weight: 18 },
 { min: 3, max: 5, weight: 27 },
 { min: 6, max: 9, weight: 20 },
 { min: 10, max: 14, weight: 11 },
 { min: 15, max: 20, weight: 2 }
] as const;
export function sampleParentAgeGap(random: () => number): number {
 const roll = random() * 100;
 let cumulative = 0;
 for (const band of parentAgeGapBands) {
  cumulative += band.weight;
  if (roll < cumulative) return band.min + Math.floor(random() * (band.max - band.min + 1));
 }
 throw new Error('The random source must produce values from 0 up to, but not including, 1.');
}
export function pairedParentAges(random: () => number, motherMinimum: 18 | 23, fatherMinimum: 18 | 23): { mother: number; father: number } {
 const gap = sampleParentAgeGap(random);
 // Draw a valid age for the pair instead of clipping either partner's age,
 // which would otherwise distort the gap distribution near the boundaries.
 const minimum = Math.max(motherMinimum, fatherMinimum - gap);
 const maximum = Math.min(40, 60 - gap);
 const mother = minimum + Math.floor(random() * (maximum - minimum + 1));
 return { mother, father: mother + gap };
}
