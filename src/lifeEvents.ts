import type { LifeEvent } from './data';
import { events } from './data.ts';

export function eventForAge(age: number): LifeEvent {
  if (age < 6) return { category: 'Family event', title: 'Small steps', text: 'Your family is spending the afternoon together. There is a whole world of little things to discover.', choices: [
    { label: 'Explore with a parent', hint: 'Take a small step into a big world.', outcome: 'I explored the world around me with my family.', effect: { Happiness: 3 } },
    { label: 'Listen to a story', hint: 'A familiar voice and a new adventure.', outcome: 'My family read me a story. I loved looking at the pictures.', effect: { Smarts: 2 } }
  ] };
  if (age < 13) return { category: 'Childhood event', title: 'Something new to try', text: 'You have a free afternoon. What would you like to do?', choices: [
    { label: 'Play outside', hint: 'A little fresh air and adventure.', outcome: 'I played outside and had a wonderful afternoon.', effect: { Health: 2, Happiness: 2 } },
    { label: 'Read a book', hint: 'Discover a new favourite story.', outcome: 'I read a book and learned something new.', effect: { Smarts: 2 } }
  ] };
  if (age < 18) return { category: 'School event', title: 'The next chapter', text: 'A school project gives you a chance to try something different. How do you approach it?', choices: [
    { label: 'Try a creative approach', hint: 'Follow your curiosity.', outcome: 'I tried a creative approach to my school project.', effect: { Smarts: 2 } },
    { label: 'Work with a friend', hint: 'Share ideas and learn together.', outcome: 'I worked on a school project with a friend.', effect: { Happiness: 2 } }
  ] };
  return events[((age - 19) % events.length + events.length) % events.length];
}
