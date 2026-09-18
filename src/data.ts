export type Stats = { Health: number; Happiness: number; Smarts: number; Looks: number };
export type Entry = { age: number; tag: string; text: string };
export type Choice = { label: string; hint: string; disabled?: boolean; outcome: string; effect?: Partial<Stats>; jobDecision?:{id:string}; friendshipDecision?:{id:string;salvage:boolean}; membershipAction?:{id:string;action:import('./schoolCommitments').MembershipAction}; schoolAction?: import('./occupation').SchoolAction; schoolEffect?: { grades?: number; popularity?: number }; relationship?: { id: string; action: import('./relationships').RelationshipAction; giftId?: string;invited?:boolean } };
export type LifeEvent = { category: string; title: string; text: string; choices: Choice[] };
export const initialStats: Stats = { Health: 94, Happiness: 82, Smarts: 76, Looks: 68 };
export const events: LifeEvent[] = [
  { category: 'Social event', title: 'An unexpected invitation', text: 'Your friend Maya invites you on a weekend camping trip. You have been meaning to spend more time together. How will you respond?', choices: [
    { label: 'Pack a bag and go', hint: 'Make a little room for adventure.', outcome: 'I went camping with Maya. We stayed up talking under the stars.', effect: { Happiness: 5 } },
    { label: 'Suggest something closer to home', hint: 'A coffee and a good conversation.', outcome: 'Maya and I caught up over coffee instead.', effect: { Happiness: 2 } },
    { label: 'Enjoy a quiet weekend', hint: 'Sometimes you need time to yourself.', outcome: 'I spent a quiet weekend at home and recharged.' }
  ] },
  { category: 'Personal event', title: 'A new chapter?', text: 'You spot a beginner photography class at the community center. Something about it catches your attention.', choices: [
    { label: 'Give it a try', hint: 'You might discover a new interest.', outcome: 'I tried photography and started noticing the little things.', effect: { Smarts: 3, Happiness: 2 } },
    { label: 'Keep looking', hint: 'Find something that feels more like you.', outcome: 'I decided to explore other hobbies.' }
  ] },
  { category: 'Family event', title: 'Dinner at home', text: 'Your mother asks you to join the family for dinner. Your calendar is clear, but you had planned an evening to yourself.', choices: [
    { label: 'Join the family', hint: 'There is always room at the table.', outcome: 'I joined my family for dinner. It was good to be home.', effect: { Happiness: 4 } },
    { label: 'Call and arrange another day', hint: 'Stay in touch, on your own schedule.', outcome: 'I called my mother and made plans for another day.', effect: { Happiness: 1 } }
  ] }
];
export const startingLog = (name: string, city: string): Entry[] => [
  { age: 0, tag: 'LIFE', text: `My name is ${name}. I was born in ${city}.` },
  { age: 6, tag: 'SCHOOL', text: 'I started primary school. Everything felt a little bigger than me.' },
  { age: 12, tag: 'SOCIAL', text: 'I met Maya. We quickly became best friends.' },
  { age: 18, tag: 'MILESTONE', text: 'I graduated from secondary school. A whole new chapter is ahead.' }
];
