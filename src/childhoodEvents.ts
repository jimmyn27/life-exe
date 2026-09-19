import type { LifeEvent, Choice } from './data';
import {seededRandom} from './family.ts';

const choice = (label:string,outcome:string,effect?:Choice['effect'],familyEffect?:Choice['familyEffect'],hint='Shape your childhood.',schoolEffect?:Choice['schoolEffect']):Choice => ({label,hint,outcome,...(effect?{effect}:{}),...(familyEffect?{familyEffect}:{}),...(schoolEffect?{schoolEffect}:{})});
const event = (title:string,text:string,icon:string,choices:Choice[],category='Childhood'):LifeEvent => ({category,title,text,icon,choices});

const ageOne:LifeEvent[] = [
 event('My first steps','You wobble upright while your family watches from across the room.','👣',[
  choice('Walk toward my parent','I took my first steps into my parent’s arms.',{Health:2,Happiness:2},{parents:3}),
  choice('Chase my sibling','I toddled after my sibling and made everyone laugh.',{Health:2,Athleticism:2,Happiness:2},{siblings:4}),
  choice('Sit back down','I decided crawling was still the safer option.',{Smarts:1})]),
 event('A messy mealtime','A bowl of mashed food and a spoon sit in front of you.','🥣',[
  choice('Eat every bite','I happily ate my whole meal.',{Health:3},{parents:2}),
  choice('Feed myself','I tried to feed myself and covered the table in food.',{Smarts:2,Happiness:2},{parents:1}),
  choice('Throw the spoon','I threw my spoon across the room.',{Happiness:2},{parents:-2})]),
 event('Tears after midnight','You wake in the night and begin to cry.','🌙',[
  choice('Reach for my parent','My parent comforted me until I fell asleep.',{Happiness:3},{parents:3}),
  choice('Hug my blanket','I hugged my blanket and settled myself.',{Smarts:2,Happiness:1}),
  choice('Stay awake','I refused to go back to sleep.',{Happiness:-2,Health:-2},{parents:-1})]),
 event('My favorite toy','A bright stuffed animal has become your favorite possession.','🧸',[
  choice('Carry it everywhere','I carried my favorite toy everywhere I went.',{Happiness:3}),
  choice('Share it with my sibling','I let my sibling play with my favorite toy.',{Happiness:2},{siblings:5}),
  choice('Show it to my parent','I proudly showed my favorite toy to my parent.',{Happiness:2},{parents:2})]),
 event('My first words','Your family leans closer as you try to say something recognizable.','🗣️',[
  choice('Say Mom or Dad','I said one of my first words to my parent.',{Smarts:3,Happiness:2},{parents:4}),
  choice('Say my sibling’s name','I tried to say my sibling’s name.',{Smarts:3,Happiness:2},{siblings:4}),
  choice('Babble excitedly','I babbled a long story that only I understood.',{Happiness:3})]),
 event('A tiny tumble','You lose your balance and tumble onto the carpet.','🩹',[
  choice('Get back up','I got back up after a small tumble.',{Health:2,Athleticism:2}),
  choice('Ask to be held','My parent picked me up and made everything better.',{Happiness:3},{parents:2}),
  choice('Cry loudly','I cried until the whole house heard me.',{Happiness:-1},{parents:1})])
];

const ageTwo:LifeEvent[] = [
 event('A playground adventure','The playground looks enormous, with slides, swings, and climbing bars.','🛝',[
  choice('Try the slide','I raced down the playground slide.',{Happiness:3,Athleticism:2}),
  choice('Climb the steps','I carefully climbed the playground steps.',{Health:2,Athleticism:3}),
  choice('Watch the other children','I watched how the other children played.',{Smarts:2}),
  choice('Hold my parent’s hand','I explored the playground while holding my parent’s hand.',{Happiness:2},{parents:2})]),
 event('The block tower','You and your sibling are building a very tall tower together.','🧱',[
  choice('Add another block','I helped my sibling build a tall block tower.',{Smarts:2},{siblings:4}),
  choice('Knock it down','I knocked down the tower and laughed.',{Happiness:2},{siblings:-4}),
  choice('Build my own','I built a smaller tower by myself.',{Smarts:3})]),
 event('A rainy afternoon','Rain taps against the windows while you are stuck indoors.','🎨',[
  choice('Finger paint','I made a colorful finger painting.',{Smarts:2,Happiness:3,Looks:1}),
  choice('Dance around the room','I danced around the living room on a rainy day.',{Athleticism:2,Happiness:3}),
  choice('Look at picture books','I spent the afternoon looking through picture books.',{Smarts:3}),
  choice('Cuddle with my family','I cuddled with my family while the rain fell.',{Happiness:3},{parents:2,siblings:2})]),
 event('Bedtime rebellion','Your parent says it is time for bed, but you are not sleepy.','🛏️',[
  choice('Go to bed','I went to bed when my parent asked.',{Health:3},{parents:2}),
  choice('Ask for one more story','I persuaded my parent to read one more story.',{Smarts:2,Happiness:2},{parents:2}),
  choice('Throw a tantrum','I threw a tantrum because I did not want to sleep.',{Happiness:-2,Health:-1},{parents:-4})]),
 event('A little helper','Your parent is sorting laundry and lets you help.','🧺',[
  choice('Match the socks','I helped my parent match pairs of socks.',{Smarts:3},{parents:3}),
  choice('Carry the towels','I carried a pile of towels across the room.',{Health:2,Athleticism:1},{parents:3}),
  choice('Hide in the laundry','I hid in the clean laundry and made a mess.',{Happiness:3},{parents:-2})]),
 event('The family photograph','Everyone gathers together for a family picture.','📷',[
  choice('Give a big smile','I smiled brightly for our family photograph.',{Happiness:2,Looks:2},{parents:2,siblings:2}),
  choice('Make a silly face','I made a silly face just as the picture was taken.',{Happiness:3},{siblings:2}),
  choice('Refuse to pose','I refused to sit still for the family photograph.',{Happiness:-1},{parents:-3})])
];

const ageThree:LifeEvent[] = [
 event('Getting dressed','You insist that you can choose your own clothes today.','👕',[
  choice('Pick a matching outfit','I chose my own matching outfit.',{Smarts:2,Looks:2}),
  choice('Wear every color','I wore as many colors as I could find.',{Happiness:3,Looks:1}),
  choice('Ask my parent for help','My parent helped me get dressed.',{Happiness:2},{parents:2})]),
 event('Baking with family','Your family is making cookies in the kitchen.','🍪',[
  choice('Stir the batter','I helped my parent stir cookie batter.',{Smarts:2,Happiness:2},{parents:3}),
  choice('Decorate the cookies','I covered our cookies in colorful decorations.',{Happiness:3,Looks:1},{parents:2}),
  choice('Sneak some dough','I secretly ate some cookie dough.',{Happiness:2,Health:-1},{parents:-1}),
  choice('Share with my sibling','I shared the first cookie with my sibling.',{Happiness:2},{siblings:4})]),
 event('An imaginary companion','You invent an imaginary friend with a very elaborate personality.','🦄',[
  choice('Plan an adventure','I went on an imaginary adventure.',{Smarts:3,Happiness:3}),
  choice('Introduce them to my family','I introduced my imaginary friend to my family.',{Happiness:2},{parents:1,siblings:1}),
  choice('Blame them for a mess','I blamed my imaginary friend for making a mess.',{Happiness:1},{parents:-3})]),
 event('A game with my sibling','Your sibling invites you to play a game together.','🎲',[
  choice('Play fairly','I played a game fairly with my sibling.',{Smarts:2,Happiness:2},{siblings:4}),
  choice('Let them win','I let my sibling win our game.',{Happiness:1},{siblings:5}),
  choice('Change the rules','I changed the rules whenever I started losing.',{Happiness:2},{siblings:-4})]),
 event('Preschool nerves','You are nervous about spending time away from home.','🎒',[
  choice('Wave goodbye','I bravely waved goodbye on my way into preschool.',{Happiness:2,Smarts:2},{parents:2}),
  choice('Hold on tightly','I held tightly to my parent because I did not want them to leave.',{Happiness:-1},{parents:2}),
  choice('Find something to play with','I found some toys and forgot to be nervous.',{Happiness:3,Smarts:1})]),
 event('A giant puddle','A wide muddy puddle blocks the path ahead.','💦',[
  choice('Jump into it','I jumped into a giant muddy puddle.',{Happiness:4,Athleticism:2},{parents:-1}),
  choice('Walk around it','I carefully walked around the muddy puddle.',{Smarts:2}),
  choice('Help my sibling across','I helped my sibling get around the puddle.',{Health:1},{siblings:4})])
];

const ageFour:LifeEvent[] = [
 event('The broken vase','A vase falls and breaks while you are playing nearby.','🏺',[
  choice('Tell the truth','I admitted that I broke a vase while playing.',{Smarts:2},{parents:3}),
  choice('Blame my sibling','I blamed my sibling for the broken vase.',{Happiness:-1},{parents:-2,siblings:-6}),
  choice('Help clean up','I told the truth and helped my parent clean up the broken vase.',{Smarts:2,Health:1},{parents:5}),
  choice('Hide the pieces','I hid the pieces of a vase I broke.',{Happiness:-2},{parents:-4})]),
 event('A family picnic','Your family spends a sunny afternoon together at the park.','🧺',[
  choice('Play catch','I played catch with my family at the park.',{Health:2,Athleticism:3,Happiness:2},{parents:2,siblings:2}),
  choice('Look for insects','I searched the park for interesting insects.',{Smarts:3,Happiness:1}),
  choice('Share my snack','I shared my picnic snack with my sibling.',{Happiness:2},{siblings:4})]),
 event('Drawing my family','You sit down with crayons and decide to draw everyone in your family.','🖍️',[
  choice('Draw everyone together','I drew a picture of my whole family together.',{Smarts:2,Looks:1,Happiness:2},{parents:2,siblings:2}),
  choice('Draw my parent as a superhero','I drew my parent as a superhero.',{Happiness:3},{parents:4}),
  choice('Draw my sibling with big ears','I drew my sibling with enormous ears.',{Happiness:2},{siblings:-2})]),
 event('A bad dream','A frightening dream wakes you in the middle of the night.','😴',[
  choice('Wake my parent','My parent comforted me after a bad dream.',{Happiness:3},{parents:3}),
  choice('Climb into my sibling’s bed','I hid beside my sibling after a bad dream.',{Happiness:2},{siblings:3}),
  choice('Be brave','I reminded myself that it was only a dream.',{Smarts:2,Happiness:1})]),
 event('A race in the yard','Your sibling challenges you to race across the yard.','🏃',[
  choice('Run as fast as I can','I raced my sibling across the yard.',{Athleticism:4,Health:2,Happiness:2},{siblings:2}),
  choice('Let them win','I let my sibling win our race.',{Happiness:1},{siblings:4}),
  choice('Refuse to race','I refused to race my sibling.',{Happiness:-1},{siblings:-2})]),
 event('So many questions','You have discovered that almost every sentence can begin with “why?”','❓',[
  choice('Ask my parent everything','I asked my parent question after question.',{Smarts:4},{parents:1}),
  choice('Look through a book','I searched a picture book for answers.',{Smarts:3}),
  choice('Invent my own answers','I invented funny answers to all of my questions.',{Smarts:2,Happiness:3})])
];

const ageFive:LifeEvent[] = [
 event('Getting ready for school','Your family helps you prepare for your first school year.','📚',[
  choice('Practice letters','I practiced my letters before starting school.',{Smarts:4},{parents:2}),
  choice('Practice sharing','I practiced sharing and taking turns.',{Happiness:3},{siblings:2}),
  choice('Practice tying my shoes','I practiced tying my own shoes.',{Smarts:2,Athleticism:1}),
  choice('Ask lots of questions','I asked my family what school would be like.',{Smarts:2,Happiness:1},{parents:2,siblings:1})]),
 event('My missing toy','Your favorite toy has disappeared somewhere in the house.','🔎',[
  choice('Search carefully','I searched every room until I found my missing toy.',{Smarts:3,Happiness:2}),
  choice('Ask my parent for help','My parent helped me find my missing toy.',{Happiness:3},{parents:2}),
  choice('Accuse my sibling','I accused my sibling of taking my toy.',{Happiness:-1},{siblings:-5}),
  choice('Choose another toy','I decided to play with something else.',{Happiness:2})]),
 event('A birthday party','You are invited to a child’s birthday party.','🎂',[
  choice('Join every game','I joined every game at a birthday party.',{Happiness:4,Athleticism:2}),
  choice('Make a new friend','I introduced myself to another child at the party.',{Happiness:3,Looks:1}),
  choice('Stay close to my parent','I stayed close to my parent during the birthday party.',{Happiness:1},{parents:2}),
  choice('Eat too much cake','I ate far too much birthday cake.',{Happiness:3,Health:-2})]),
 event('Helping my sibling','Your sibling is struggling with something that you understand.','🤲',[
  choice('Show them how','I patiently showed my sibling how to do it.',{Smarts:2,Happiness:2},{siblings:5}),
  choice('Do it for them','I did the task for my sibling.',{Happiness:1},{siblings:2}),
  choice('Tease them','I teased my sibling for not knowing how.',{Happiness:2},{siblings:-5})]),
 event('A neighborhood game','Some children nearby invite you to join their game.','⚽',[
  choice('Play enthusiastically','I joined a neighborhood game and played my hardest.',{Athleticism:4,Health:2,Happiness:3}),
  choice('Suggest a new game','I taught the other children a game I knew.',{Smarts:2,Happiness:3}),
  choice('Watch from the side','I watched the neighborhood children play.',{Smarts:1,Happiness:-1})]),
 event('A family outing','Your family has a free day and asks what everyone should do.','🚗',[
  choice('Visit the zoo','I visited the zoo with my family.',{Smarts:3,Happiness:3},{parents:2,siblings:2}),
  choice('Go swimming','I went swimming with my family.',{Health:3,Athleticism:3,Happiness:2},{parents:1,siblings:2}),
  choice('See a movie','I watched a movie with my family.',{Happiness:3},{parents:2,siblings:2}),
  choice('Stay home together','I spent a quiet day at home with my family.',{Health:1,Happiness:2},{parents:2,siblings:2})])
];

const later:Record<number,LifeEvent> = {
 6:event('My first day of school','You have started elementary school. Your classroom is full of new faces.','🏫',[choice('Introduce myself','I introduced myself on my first day of elementary school.',{Happiness:2},undefined,'Meet some classmates.',{popularity:4}),choice('Listen carefully','I listened carefully on my first day of elementary school.',{Smarts:2},undefined,'Focus on the lesson.',{grades:4})],'Education'),
 7:event('A tricky homework question','One of your homework questions is proving difficult.','✏️',[choice('Ask a parent for help','My parent helped me understand my homework.',{Smarts:3},{parents:2},'Shape your childhood.',{grades:3}),choice('Try it myself','I worked through a difficult homework question.',{Smarts:2},undefined,'Shape your childhood.',{grades:2})],'Education'),
 8:event('Choosing a hobby','You have a chance to try something after school.','🎨',[choice('Play a sport','I tried a sport after school.',{Health:3,Happiness:2,Athleticism:2},undefined,'Shape your childhood.',{popularity:2}),choice('Make something creative','I made something creative after school.',{Smarts:3,Happiness:2})]),
 9:event('Someone sitting alone','A classmate is sitting alone at lunchtime.','🤝',[choice('Invite them to join me','I invited a lonely classmate to sit with me.',{Happiness:3},undefined,'Shape your childhood.',{popularity:4}),choice('Have a quiet lunch','I enjoyed a quiet lunch at school.',{Happiness:1})],'Education'),
 10:event('Starting middle school','Elementary school is complete. You have started middle school with new classes and classmates.','🏫',[choice('Focus on my classes','I started middle school and focused on my classes.',{Smarts:3},undefined,'Shape your childhood.',{grades:4}),choice('Get to know my classmates','I started middle school and got to know my classmates.',{Happiness:3},undefined,'Shape your childhood.',{popularity:4})],'Education'),
 11:event('Growing more independent','Your parents offer you a little more responsibility at home.','🏠',[choice('Help around the house','I helped my family around the house.',{Happiness:3},{parents:3}),choice('Learn to make a meal','My parent taught me how to make a simple meal.',{Smarts:3},{parents:2})],'Family'),
 12:event('The class presentation','It is your turn to present a project to the class.','🗣️',[choice('Prepare carefully','I prepared carefully for my class presentation.',{Smarts:3},undefined,'Shape your childhood.',{grades:4}),choice('Present with confidence','I confidently presented my project to the class.',{Happiness:2},undefined,'Shape your childhood.',{popularity:3})],'Education')
};

export const childhoodEventPools:Record<number,readonly LifeEvent[]> = {1:ageOne,2:ageTwo,3:ageThree,4:ageFour,5:ageFive,...Object.fromEntries(Object.entries(later).map(([age,item])=>[Number(age),[item]]))};
const ageZero=event('Welcome to the world','Your family welcomes you home. Your story is just beginning.','👶',[choice('Snuggle with my family','My family welcomed me into the world with love.',{Happiness:3},{parents:2,siblings:2})],'Family');
export const childhoodEvents:LifeEvent[]=[ageZero,...Array.from({length:12},(_,index)=>childhoodEventPools[index+1][0])];
export function childhoodEvent(age:number,lifeId='default-life',hasSiblings=true):LifeEvent|undefined {
 const pool=childhoodEventPools[age];if(!pool?.length)return undefined;
 const eligible=hasSiblings?pool:pool.filter(item=>! /sibling/i.test(`${item.title} ${item.text}`));
 const selected=eligible[Math.floor(seededRandom(`${lifeId}:childhood-event:${age}`)()*eligible.length)];
 if(hasSiblings)return selected;
 return {...selected,choices:selected.choices.filter(item=>! /sibling/i.test(`${item.label} ${item.outcome}`))};
}
