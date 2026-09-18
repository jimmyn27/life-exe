import type { Life } from './saves';
import type { Person } from './relationships';
import { familyMoney } from './family.ts';
export const gifts = [
 {id:'card',name:'Handmade card',price:1,kind:'thoughtful'},
 {id:'drawing',name:'Framed drawing',price:8,kind:'thoughtful'},
 {id:'flowers',name:'Flowers',price:25,kind:'thoughtful'},
 {id:'chocolate',name:'Chocolate box',price:15,kind:'ordinary'},
 {id:'book',name:'Book',price:20,kind:'thoughtful'},
 {id:'mug',name:'Coffee mug',price:12,kind:'ordinary'},
 {id:'candy',name:'Single candy',price:2,kind:'cheap'},
 {id:'socks',name:'Socks',price:5,kind:'cheap'},
 {id:'soap',name:'Deodorant gift set',price:10,kind:'offensive'},
 {id:'diet',name:'Diet advice book',price:18,kind:'offensive'},
 {id:'toy',name:'Toy car',price:15,kind:'child'},
 {id:'plush',name:'Stuffed animal',price:30,kind:'child'},
 {id:'puzzle',name:'Puzzle set',price:25,kind:'ordinary'},
 {id:'headphones',name:'Headphones',price:80,kind:'ordinary'},
 {id:'watch',name:'Watch',price:150,kind:'ordinary'},
 {id:'perfume',name:'Perfume',price:60,kind:'adult'},
 {id:'jewelry',name:'Jewelry',price:250,kind:'adult'},
 {id:'tablet',name:'Tablet',price:400,kind:'ordinary'},
] as const;
export type Gift = typeof gifts[number];
export function giftOptions(random:()=>number=Math.random): Gift[] {
 const pool:Gift[]=[...gifts];
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,5);
}
export function giftEffect(life:Life,person:Person,gift:Gift): number {
 if(gift.kind==='offensive')return -10;
 if(gift.kind==='child' && person.age>=18)return person.parent && life.age<13?2:-4;
 if(gift.kind==='adult' && /\b(teacher|principal|professor)\b/i.test(person.occupation))return -6;
 if(gift.kind==='adult' && person.age<13)return -4;
 if(gift.kind==='cheap')return life.age<13 && person.parent?2:-3;
 if(gift.kind==='thoughtful')return Math.min(10,4+Math.floor(gift.price/15)+(person.parent?2:0));
 const expectation=person.parent?5+familyMoney(life.family)*.3:person.age<13?5:20;
 return gift.price<expectation*.4?-2:Math.min(14,3+Math.floor(gift.price/25));
}
