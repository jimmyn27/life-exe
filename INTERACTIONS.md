# Editing interaction text

Open these files in Codex. Change wording inside quotes or backticks, save, then refresh the local game. The hosted Netlify copy remains unchanged while deployment is paused.

| What to change | File | Where |
| --- | --- | --- |
| Button names, emojis, and small descriptions | `src/interactionText.ts` | `interactionLabels`, `interactionEmojis`, and `interactionHints` |
| Confirmation wording and choices | `src/interactionConfirmations.ts` | `interactionConfirmation` |
| Compliment variations, conversation topics, flirt popup text, gift popup text | `src/interactionResults.ts` | `compliments`, `topics`, and `reaction` |
| Relationship actions printed in Command Prompt | `src/relationships.ts` | The `text` object inside `interact` |
| School action outcomes printed in Command Prompt | `src/occupation.ts` | `schoolAction` |
| Job request/training/resignation outcomes | `src/partTimeWork.ts` | `workAction` and `takePartTimeJob` |
| Everyday activities and their Command Prompt text | `src/Programs.tsx` | `activities` in `WebSurfer` and its `onActivity` calls |
| Age-up childhood events | `src/childhoodEvents.ts` | Event titles, text, choices, and outcomes |
| Club and sport names | `src/schoolActivityCatalog.ts` | `schoolActivities` |

For button names, edit only the value on the right. For example, change `Conversation:'Conversation'` to `Conversation:'Talk'`. The key on the left is used by the game rules and must stay unchanged. Renaming the displayed label also updates confirmation and outcome titles, but does not rewrite the story sentences.

Keep placeholders such as `NAME`, `PRONOUN`, and `${person.name}` intact. The game replaces these with names and pronouns. Popup text generally uses “You,” while Command Prompt text generally uses “I.” Some popup outcomes are automatically converted from the Command Prompt sentence.

After editing, ask Codex to check and upload the changes. Saving a file alone does not upload it to GitHub.
