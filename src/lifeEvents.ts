import type { LifeEvent } from './data';
import { childhoodEvent } from './childhoodEvents.ts';
import { events } from './data.ts';

export function eventForAge(age: number, lifeId = 'default-life', hasSiblings = true): LifeEvent {
  const childhood = childhoodEvent(age,lifeId,hasSiblings);
  if (childhood) return childhood;
  if (age === 14) return {category:'Education',title:'Starting high school',text:'You have completed middle school and started high school. Graduation is four years away.',choices:[{label:'Focus on my future',hint:'Build good study habits.',outcome:'I started high school and focused on my future.',effect:{Intelligence:3},schoolEffect:{grades:4}},{label:'Meet new people',hint:'Find my place at school.',outcome:'I started high school and met new people.',effect:{Happiness:3},schoolEffect:{popularity:4}}]};
  if (age < 18) return { category: 'School event', title: 'The next chapter', text: 'A school project gives you a chance to try something different. How do you approach it?', choices: [
    { label: 'Try a creative approach', hint: 'Follow your curiosity.', outcome: 'I tried a creative approach to my school project.', effect: { Intelligence: 2 } },
    { label: 'Work with a friend', hint: 'Share ideas and learn together.', outcome: 'I worked on a school project with a friend.', effect: { Happiness: 2 } }
  ] };
  return events[((age - 19) % events.length + events.length) % events.length];
}
