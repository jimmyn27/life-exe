// A simplified family-history model, not an observed demographic distribution.
// CDC's 2023 mean maternal age at first birth is 27.5 (all marital statuses).
// A late-20s center also reflects later first births among married parents.
// Keep early births possible, but penalize either parent being a teenager.
export function firstChildAgeWeight(motherAge: number, fatherAge?: number): number {
 if(motherAge<18 || motherAge>40 || fatherAge!==undefined && fatherAge<18) return 0;
 const maternalWeight=Math.exp(-.5*Math.pow((motherAge-28)/4.5,2));
 const youngParentFactor=(age:number)=>age<20?.15:age<23?.5:1;
 return maternalWeight*youngParentFactor(motherAge)*(fatherAge===undefined?1:youngParentFactor(fatherAge));
}
export function olderSiblingAges(random:()=>number,motherAge:number,fatherAge?:number):number[] {
 const gap=fatherAge===undefined?undefined:fatherAge-motherAge;
 const candidates=Array.from({length:23},(_,index)=>{
  const age=index+18;
  return {age,weight:firstChildAgeWeight(age,gap===undefined?undefined:age+gap)};
 });
 const total=candidates.reduce((sum,item)=>sum+item.weight,0);
 let roll=random()*total;
 let firstAge=40;
 for(const candidate of candidates){roll-=candidate.weight;if(roll<0){firstAge=candidate.age;break;}}
 // Do not condition on already having older children: when the sampled first
 // birth is at or after the player's birth, the player is the first child.
 const ages:number[]=[];
 let birthAge=firstAge;
 while(birthAge<motherAge && ages.length<3){
  ages.push(motherAge-birthAge);
  if(random() >= .55*Math.pow(.6,ages.length-1)) break;
  birthAge += 2+Math.floor(random()*3);
 }
 return ages;
}
