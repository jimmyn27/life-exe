import {seededRandom} from './family.ts';
import {majors} from './catalogs/us/education.ts';
import {getOccupation} from './occupation.ts';
import type {Life} from './saves';
export const attendingSchool=(age:number)=>age<6?'Not in school':age<10?'Attending elementary school':age<14?'Attending middle school':age<18?'Attending high school':'High school diploma';
export function educationLabel(value:string,id:string,occupation=''):string {
 if(/juris|law school/i.test(value))return 'Juris Doctor';if(/medical|medicine/i.test(value))return 'Doctor of Medicine';
 if(/MBA/i.test(value))return "Master's (Business Administration)";
 if(value==='Secondary school')return 'High school diploma';if(value==='Primary school')return 'Elementary school';
 if(value!=='University')return value;
 const random=seededRandom(`${id}:education`);const major=/nurse/i.test(occupation)?'Nursing':/teacher|principal|professor/i.test(occupation)?'Education':/developer|engineering manager/i.test(occupation)?'Computer Science':majors[Math.floor(random()*majors.length)].name;
 return `${random()<.25?"Master's":"Bachelor's"} (${major})`;
}
export function playerEducation(life:Life):string{const occupation=getOccupation(life);return occupation.school?occupation.school.level==='University'?'Attending university':attendingSchool(life.age):occupation.highestEducation==='None'?'Not in school':occupation.highestEducation==='University'?"Bachelor's degree":educationLabel(occupation.highestEducation,life.id);}
