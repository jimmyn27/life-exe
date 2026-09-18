import test from 'node:test';
import assert from 'node:assert/strict';
import {parentAgeGapBands,sampleParentAgeGap,pairedParentAges} from '../src/parentAges.ts';
import {generateFamily,seededRandom} from '../src/family.ts';
import {parseStore,upsertLife,emptyStore,restartLife} from '../src/saves.ts';
test('age gap bands cover both older partners and same-age couples, sum to 100 and have a ~4.2-year signed mean',()=>{
 assert.equal(parentAgeGapBands.reduce((n,b)=>n+b.weight,0),100);
 const mean=parentAgeGapBands.reduce((n,b)=>n+(b.min+b.max)/2*b.weight/100,0);
 assert.ok(Math.abs(mean-4.175)<1e-10);
 let cumulative=0;
 for(const band of parentAgeGapBands){let values=[(cumulative+band.weight/2)/100,0];assert.equal(sampleParentAgeGap(()=>values.shift()),band.min);values=[(cumulative+band.weight/2)/100,.999999];assert.equal(sampleParentAgeGap(()=>values.shift()),band.max);cumulative+=band.weight;}
});
test('a large sample matches modeled direction probabilities and preserves gaps with all education age bounds',()=>{
 const random=seededRandom('global-parent-ages');let olderFather=0,same=0,olderMother=0,sum=0;
 for(let i=0;i<40000;i++){
 const minMother=i%2?23:18,minFather=i%3?23:18;
 const pair=pairedParentAges(random,minMother,minFather),gap=pair.father-pair.mother;
 assert.ok(pair.mother>=minMother && pair.mother<=40);assert.ok(pair.father>=minFather && pair.father<=60);
 if(gap>0)olderFather++;else if(gap<0)olderMother++;else same++;sum+=gap;
 }
 assert.ok(Math.abs(olderFather/40000-.78)<.012);assert.ok(Math.abs(same/40000-.10)<.012);assert.ok(Math.abs(olderMother/40000-.12)<.012);assert.ok(Math.abs(sum/40000-4.175)<.1);
});
test('family generation uses the distribution, retains single mothers, and saved/restarted ages do not reroll',()=>{
 let fatherOlder=0,motherOlder=0,same=0,single=0;
 for(let i=0;i<1000;i++){
 const family=generateFamily('pair'+i,'Smith');assert.deepEqual(generateFamily('pair'+i,'Smith'),family);
 if(family.parents.length===1){single++;continue;}
 const [mother,father]=family.parents,gap=father.ageAtBirth-mother.ageAtBirth;
 if(gap>0)fatherOlder++;else if(gap<0)motherOlder++;else same++;
 for(const parent of family.parents)assert.ok(parent.ageAtBirth >= (parent.education==='University'?23:18));
 const life={id:'pair'+i,name:'Sam Smith',city:'New York City',age:0,birthYear:2000,balance:0,stats:family.birthStats,family,log:[]};
 const loaded=parseStore(JSON.stringify(upsertLife(emptyStore(),life))).lives[0];
 assert.deepEqual(loaded.family.parents,family.parents);assert.deepEqual(restartLife(loaded).family.parents,family.parents);
 }
 assert.ok(fatherOlder>motherOlder);assert.ok(motherOlder>0 && same>0 && single>0);
});
