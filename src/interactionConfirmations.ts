import {interactionEmojis,interactionLabels} from './interactionText.ts';
import {actionUnavailable,type Person,type RelationshipAction} from './relationships.ts';
import {personAddress} from './personAddress.ts';
import type {LifeEvent} from './data';
import type {Life} from './saves';
export function interactionConfirmation(life:Life,person:Person,action:RelationshipAction):LifeEvent|null{
 if(actionUnavailable(life,person,action) || !['Insult','Flirt','Befriend','Ask out','Hook up','Break up','Suck up'].includes(action))return null;
 const target=personAddress(person),pronoun=person.gender==='Female'?'her':'him',label=person.parent||person.family||['Teacher','Principal','Professor','Classmate','Coworker','Manager'].includes(person.relation)?`${person.relation.toLowerCase()} (${person.name.split(' ')[0]})`:person.name;
 const text=action==='Insult'||action==='Flirt'?`Are you sure you want to ${action.toLowerCase()} ${action==='Flirt'?'with ':''}your ${label}?`:action==='Break up'?`Are you sure you want to break up with your ${label}?`:action==='Suck up'?`Are you sure you want to suck up to ${target}? Your classmates or coworkers may resent it.`:action==='Befriend'?`Befriend ${target}?`:action==='Ask out'?`Ask ${target} out?`:`Try to hook up with ${pronoun}?`;
 const title=action==='Befriend'?`Become friends with ${target}?`:action==='Ask out'?`A date with ${target}?`:action==='Insult'?`Insult ${target}?`:action==='Flirt'?`Flirt with ${target}?`:action==='Break up'?`End your relationship with ${target}?`:action==='Suck up'?`Try to impress ${target}?`:`An intimate invitation for ${target}?`;
 return {category:'Relationship',title,text,icon:interactionEmojis[action],...(['Befriend','Ask out','Hook up'].includes(action)?{profileId:person.id}:{}),choices:[{label:interactionLabels[action],hint:'See how they respond.',outcome:'',relationship:{id:person.id,action}},{label:'Nevermind',hint:'Return to their profile.',outcome:''}]};
}