import {seededRandom} from './family.ts';
export const initialRelationship=(lifeId:string,personId:string,looks:number)=>25+Math.round(50*Math.pow(seededRandom(`${lifeId}:${personId}:initial-relationship`)(),1.5-Math.max(0,Math.min(100,looks))/100));
