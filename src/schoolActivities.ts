import {getOccupation} from './occupation.ts';
import {seededRandom} from './family.ts';
import type {Life} from './saves';
export const schoolActivities=[
{"id": "cooking", "name": "Cooking club", "group": "Clubs", "emoji": "📚", "description": "Explore cooking with other students."},
{"id": "film", "name": "Film club", "group": "Clubs", "emoji": "📚", "description": "Explore film with other students."},
{"id": "foreign-language", "name": "Foreign Language club", "group": "Clubs", "emoji": "📚", "description": "Explore foreign language with other students."},
{"id": "photography", "name": "Photography club", "group": "Clubs", "emoji": "📚", "description": "Explore photography with other students."},
{"id": "robotics", "name": "Robotics club", "group": "Clubs", "emoji": "📚", "description": "Explore robotics with other students."},
{"id": "chess", "name": "Chess club", "group": "Clubs", "emoji": "📚", "description": "Explore chess with other students."},
{"id": "book", "name": "Book club", "group": "Clubs", "emoji": "📚", "description": "Explore book with other students."},
{"id": "history", "name": "History club", "group": "Clubs", "emoji": "📚", "description": "Explore history with other students."},
{"id": "student-council", "name": "Student Council", "group": "Clubs", "emoji": "📚", "description": "Explore student council with other students."},
{"id": "debate", "name": "Speech and Debate club", "group": "Clubs", "emoji": "📚", "description": "Explore speech and debate with other students."},
{"id": "math", "name": "Math club", "group": "Clubs", "emoji": "📚", "description": "Explore math with other students."},
{"id": "science", "name": "Science club", "group": "Clubs", "emoji": "📚", "description": "Explore science with other students."},
{"id": "business", "name": "Business club", "group": "Clubs", "emoji": "📚", "description": "Explore business with other students."},
{"id": "honor-society", "name": "Honor Society", "group": "Clubs", "emoji": "📚", "description": "Explore honor society with other students."},
{"id": "politics", "name": "Politics club", "group": "Clubs", "emoji": "📚", "description": "Explore politics with other students."},
{"id": "video-games", "name": "Video Games club", "group": "Clubs", "emoji": "📚", "description": "Explore video games with other students."},
{"id": "art", "name": "Art club", "group": "Clubs", "emoji": "📚", "description": "Explore art with other students."},
{"id": "badminton", "name": "Badminton team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school badminton team."},
{"id": "baseball", "name": "Baseball team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school baseball team."},
{"id": "basketball", "name": "Basketball team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school basketball team."},
{"id": "cheerleading", "name": "Cheerleading team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school cheerleading team."},
{"id": "diving", "name": "Diving team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school diving team."},
{"id": "football", "name": "Football team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school football team."},
{"id": "golf", "name": "Golf team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school golf team."},
{"id": "gymnastics", "name": "Gymnastics team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school gymnastics team."},
{"id": "hockey", "name": "Hockey team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school hockey team."},
{"id": "lacrosse", "name": "Lacrosse team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school lacrosse team."},
{"id": "rugby", "name": "Rugby team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school rugby team."},
{"id": "soccer", "name": "Soccer team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school soccer team."},
{"id": "swimming", "name": "Swim team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school swim team."},
{"id": "tennis", "name": "Tennis team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school tennis team."},
{"id": "track", "name": "Track team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school track team."},
{"id": "volleyball", "name": "Volleyball team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school volleyball team."},
{"id": "wrestling", "name": "Wrestling team", "group": "Sports", "emoji": "🏅", "description": "Try out for the school wrestling team."}
] as const;
export function schoolActivityName(activity:typeof schoolActivities[number],gender?:string){return activity.id==='baseball' && gender==='Female'?'Softball team':activity.name;}
export function applySchoolActivity(life:Life,id:string):Life{
 const occupation=getOccupation(life),school=occupation.school,activity=schoolActivities.find(item=>item.id===id);
 if(life.pendingEvent || !school || life.age<10 || life.age>=18 || !activity || school.memberships?.includes(id) || school.activityAttempts?.[id]?.age===life.age)return life;
 const accepted=seededRandom(`${life.id}:activity:${school.startAge}:${life.age}:${id}`)()<(activity.group==='Clubs'?.7:.5);
 return {...life,occupation:{...occupation,school:{...school,activityAttempts:{...school.activityAttempts,[id]:{age:life.age,accepted}},memberships:accepted?[...(school.memberships??[]),id]:school.memberships??[]}},log:[...life.log,{age:life.age,tag:'EDUCATION',text:accepted?`I ${activity.group==='Clubs'?'was accepted into':'made'} the ${schoolActivityName(activity,life.family?.gender)}.`:`I ${activity.group==='Clubs'?'applied to':'tried out for'} the ${schoolActivityName(activity,life.family?.gender)}, but did not get in.`}]};
}
export const hasGraduated=(life:Life)=>['Secondary school','University'].includes(getOccupation(life).highestEducation);
export const workCategories=(life:Life)=>life.age<14?[]:hasGraduated(life)?['Part-time','Full-time']:['Part-time'];
