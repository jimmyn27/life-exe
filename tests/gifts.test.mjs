import test from 'node:test';
import assert from 'node:assert/strict';
import {gifts,giftOptions,giftEffect} from '../src/gifts.ts';
import {characters,availableActions,interact} from '../src/relationships.ts';
import {emptyStore,upsertLife,parseStore} from '../src/saves.ts';
const life=age=>({id:'gifts-test',name:'Alex Smith',city:'New York City',age,birthYear:2000,balance:500,stats:{Health:94,Happiness:82,Smarts:76,Looks:68},log:[]});
const gift=id=>gifts.find(g=>g.id===id);
test('gift picker returns five distinct catalog items with varied prices',()=>{
 for(let i=0;i<20;i++){const options=giftOptions();assert.equal(options.length,5);assert.equal(new Set(options.map(g=>g.id)).size,5);assert.ok(options.every(g=>gifts.includes(g) && g.price>0));}
 assert.ok(new Set(gifts.map(g=>g.price)).size>5);
});
test('parents gain Gift at six between Conversation and Insult',()=>{
 for(const age of [2,5,6,18]){const current=life(age),parent=characters(current).personal[0],actions=availableActions(parent,current);assert.equal(actions.includes('Gift'),age>=6);if(age>=6)assert.deepEqual(actions.slice(actions.indexOf('Conversation'),actions.indexOf('Insult')+1),['Conversation','Gift','Insult']);}
});
test('gift response reflects recipient age, family context, cost and appropriateness',()=>{
 const current=life(18),parent=characters(current).personal[0],friend=characters(current).personal.find(p=>p.id==='maya-chen');
 assert.ok(giftEffect(current,friend,gift('tablet'))>giftEffect(current,friend,gift('mug')));
 assert.ok(giftEffect(current,friend,gift('soap'))<0);assert.ok(giftEffect(current,friend,gift('candy'))<0);
 assert.ok(giftEffect(life(6),parent,gift('card'))>0);assert.ok(giftEffect(life(6),parent,gift('candy'))>0);
 const teacher=characters(life(12)).school.find(p=>p.relation==='Teacher');assert.ok(giftEffect(life(12),teacher,gift('jewelry'))<0);
});
test('selected gifts charge their own price, can harm relationships, persist, and never overdraw',()=>{
 const current=life(18),parent=characters(current).personal[0];
 const positive=interact(current,parent.id,'Gift','card');assert.equal(positive.balance,499);assert.ok(positive.relationships[parent.id].strength>parent.strength);assert.match(positive.log.at(-1).text,/handmade card/);
 const negative=interact(current,parent.id,'Gift','diet');assert.equal(negative.balance,482);assert.ok(negative.relationships[parent.id].strength<parent.strength);
 assert.deepEqual(parseStore(JSON.stringify(upsertLife(emptyStore(),negative))).lives[0],negative);
 assert.equal(interact({...current,balance:0},parent.id,'Gift','card').balance,0);assert.equal(interact(current,parent.id,'Gift','unknown'),current);
 const repeated=interact(positive,parent.id,'Gift','tablet');assert.equal(repeated.balance,99);assert.equal(repeated.relationships[parent.id].strength,positive.relationships[parent.id].strength);
});
