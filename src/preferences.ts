import {seededRandom} from './family.ts';
import type {Sexuality} from './saves';
export function npcSexuality(lifeId:string,personId:string):Sexuality {const value=seededRandom(`${lifeId}:${personId}:sexuality`)();return value<.85?'Straight':value<.95?'Bisexual':'Gay';}
export function attractedTo(sexuality:Sexuality,gender:string,otherGender:string):boolean {return sexuality==='Bisexual' || (sexuality==='Gay'?gender===otherGender:gender!==otherGender);}
