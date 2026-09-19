import {interactionLabels} from './interactionText.ts';
import {actionUnavailable,type Person,type RelationshipAction} from './relationships.ts';
import {personAddress} from './personAddress.ts';
import type {Life} from './saves';
import type {LifeEvent} from './data';
export function interactionConfirmation(life:Life,person:Person,action:RelationshipAction):LifeEvent|null{
 if(actionUnavailable(life,person,action) || !['Insult','Flirt','Befriend','Ask out','Hook up','Have fun','Break up','Suck up'].includes(action))return null;
 const target=personAddress(person),pronoun=person.gender==='Female'?'her':'him';
 const label=`${person.status==='dating'?(person.gender==='Female'?'girlfriend':'boyfriend'):person.relation.toLowerCase()} (${person.name.split(' ')[0]})`;
 const text=action==='Insult'||action==='Flirt'?`Are you sure you want to ${action.toLowerCase()} ${action==='Flirt'?'with ':''}your ${label}?`:action==='Break up'?`Are you sure you want to break up with your ${label}?`:action==='Suck up'?`Are you sure you want to suck up to ${target}? Your classmates or coworkers may resent it.`:action==='Befriend'?`Befriend ${target}?`:action==='Ask out'?`Ask ${target} out?`:action==='Have fun'?`Try to have fun with ${pronoun}? This is a nonsexual outing to go bowling and play arcade games.`:`Try to hook up with ${pronoun}?`;
 return {category:'Relationship',title:`${interactionLabels[action]} · ${target}`,text,...(['Befriend','Ask out','Hook up','Have fun'].includes(action)?{profileId:person.id}:{}),choices:[{label:action==='Have fun'?`Try to have fun with ${pronoun}`:interactionLabels[action],hint:'See how they respond.',outcome:'',relationship:{id:person.id,action}},{label:'Nevermind',hint:'Return to their profile.',outcome:''}]};
}
