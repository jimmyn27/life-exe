import {seededRandom} from './family.ts';
import type {Life} from './saves';
import type {LifeEvent} from './data';
export const friendshipDecay=5;
export const friendshipLossChance=(strength:number)=>strength>=50?0:Math.min(.9,(50-strength)/60);
export function advanceFriendships(life:Life):{life:Life;events:LifeEvent[]}{
 const relationships={...life.relationships},events:LifeEvent[]=[];
 for(const [id,record] of Object.entries(relationships)){
  if(!record.profile || !(record.status==='dating'||record.friendship||record.status==='friend'))continue;
  const strength=Math.max(0,record.strength-friendshipDecay);relationships[id]={...record,strength};
  if(record.status!=='dating' && seededRandom(`${life.id}:${id}:friendship-loss:${life.age}`)()<friendshipLossChance(strength))events.push({category:'Friendship',title:'A friendship is drifting apart',text:`${record.profile.name} no longer feels close to you and is considering ending your friendship.`,choices:[{label:'Try to salvage the friendship',hint:'Try to reconnect.',outcome:'',friendshipDecision:{id,salvage:true}},{label:'Wish them well',hint:'Let the friendship end kindly.',outcome:'',friendshipDecision:{id,salvage:false}}]});
 }
 return {life:{...life,relationships},events};
}
export function resolveFriendship(life:Life,id:string,salvage:boolean):Life{
 const record=life.relationships?.[id];if(!record?.profile || !(record.friendship??record.status==='friend') || record.status==='dating')return life;
 const success=salvage && seededRandom(`${life.id}:${id}:salvage:${life.age}`)()<Math.min(.9,.2+record.strength/100);
 const happiness=success?10:salvage?-20:-10;
 const text=success?`I salvaged my friendship with ${record.profile.name}. We agreed to stay in touch.`:salvage?`I tried to salvage my friendship with ${record.profile.name}, but we drifted apart.`:`I wished ${record.profile.name} well as our friendship ended.`;
 return {...life,relationships:{...life.relationships,[id]:{...record,strength:success?Math.min(100,record.strength+10):record.strength,friendship:success,status:success?'friend':'acquaintance'}},stats:{...life.stats,Happiness:Math.max(0,Math.min(100,life.stats.Happiness+happiness))},log:[...life.log,{age:life.age,tag:'SOCIAL',text}]};
}
