import {seededRandom} from './family.ts';
const clamp=(value:number,min=0,max=100)=>Math.max(min,Math.min(max,value));
export const initialRelationship=(lifeId:string,personId:string,charisma:number)=>{
 const exponent=2.25-clamp(charisma)*.02;
 return 25+Math.round(50*Math.pow(seededRandom(`${lifeId}:${personId}:initial-relationship`)(),exponent));
};
export const initialStaffRelationship=(lifeId:string,personId:string,intelligence:number,charisma:number)=>{
 const impression=clamp(intelligence)*.7+clamp(charisma)*.3;
 const noise=(seededRandom(`${lifeId}:${personId}:staff-relationship`)()-.5)*20;
 return clamp(Math.round(35+impression*.4+noise),25,85);
};