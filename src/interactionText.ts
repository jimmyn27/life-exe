import type {RelationshipAction} from './relationships';
// Edit the text on the RIGHT to rename buttons. Keep the keys on the LEFT unchanged.
export const interactionLabels:Record<RelationshipAction,string>={
 'Break up':'Break up',Befriend:'Befriend','Ask for money':'Ask for money','Ask out':'Ask out',
 Compliment:'Compliment',Conversation:'Conversation',Flirt:'Flirt',Gift:'Gift',Insult:'Insult',
 'Hook up':'Hook up','Make love':'Make love','Spend time':'Spend time',
 Unfriend:'Unfriend','Act up':'Act up',Disrespect:'Disrespect','Suck up':'Suck up',
};
export const interactionEmojis:Record<RelationshipAction,string>={
 'Break up':'👋',Befriend:'🤝','Ask for money':'💵','Ask out':'💌',Compliment:'😘',Conversation:'💬',
 Flirt:'💋',Gift:'🎁',Insult:'🤬','Hook up':'💕','Make love':'❤️','Spend time':'🕰️',
 Unfriend:'👋','Act up':'😈',Disrespect:'🙄','Suck up':'🍎',
};
// PRONOUN is replaced with him/her when shown.
export const interactionHints:Record<RelationshipAction,string>={
 'Break up':'Break up with PRONOUN.',Befriend:'Befriend PRONOUN.','Ask for money':'Ask PRONOUN for money.',
 'Ask out':'Ask PRONOUN out.',Compliment:'Pay PRONOUN a compliment.',Conversation:'Have a conversation with PRONOUN.',
 Flirt:'Flirt with PRONOUN.',Gift:'Give PRONOUN a gift.',Insult:'Insult PRONOUN.',
 'Hook up':'Hook up with PRONOUN.','Make love':'Make love to PRONOUN.',
 'Spend time':'Spend time with PRONOUN.',Unfriend:'Unfriend PRONOUN.','Act up':'Misbehave around PRONOUN.',
 Disrespect:'Challenge PRONOUN authority.','Suck up':'Try to win PRONOUN approval.',
};