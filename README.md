# Life.exe

A Windows XP Luna inspired desktop for a text-based life simulator, with the Bliss wallpaper.

## Current preview

- Glossy Luna windows, a green Start button, and a two-column XP Start menu.
- Enternet Explorer: Home, Education, Work (always visible; part-time listings from age 14), and Activities. University listings are part of Education after high school graduation.
- My Life is a separate Task Manager-style program with character details and statistics together in one view. Its bank balance links directly to Finances.
- File Explorer contains Assets and Finances. Education and job details are in Enternet Explorer.
- Command Prompt groups life history under one Age header per year, with plain paragraphs and no category tags. Its launcher is in Start, and its open window appears on the taskbar. Command Prompt is the only program open by default.
- Messenger contact groups can collapse and expand, and its header shows the player’s age and life stage. School staff have distinct interactions that change after befriending. Gift is available for friends and acquaintances. Messenger person icons are pink for females and blue for males. Profiles show gender, age, education, occupation and the four character stats. Befriend is the first action for acquaintances. Only existing friends can be unfriended. Befriended school/work contacts appear in Contacts and remain there after leaving the roster. Parents and siblings cannot be befriended. School and work contacts appear in the Education and Work pages of Enternet Explorer, in a right column with collapsible groups and school teachers first. Messenger contains family and befriended contacts. Character details and statistics open separately when clicking the name inside a contact; family actions follow age gates. Gifts offer five randomized items with individual prices and contextual relationship effects; parents can receive gifts from age 6. Every Messenger interaction shows a result popup. Compliments, gifts, and Suck up show Appreciation; conversations show Agreement. Low reactions can hurt relationships. Other interactions use text-only results. Clicking your Messenger name opens My Life. Escape goes back in the active program; romance requires adults. Social media remains hidden.
- The desktop contains only Recycle Bin and My Life, using a PC icon. Recycle Bin remains a placeholder.
- Desktop icons stay fixed in place. A single click selects an icon; double-click opens My Life. Enter also opens a selected icon.
- Multiple programs can remain open at once.
- Drag title bars to move windows; drag any edge or corner to resize.
- Minimize, maximize, restore, and close each window independently. Double-click a title bar to maximize or restore.
- Taskbar shortcuts launch Enternet Explorer, File Explorer, and Messenger in that order. Buttons for open programs focus, minimize, and restore them, including Command Prompt. The Start menu left column lists Enternet Explorer, File Explorer, Messenger, and Command Prompt; My Life and My Assets are in the right column, above a group containing New Life, Save Life, and Help and Support. Finances remains inside Assets.
- Taskbar buttons appear in opening order. Focusing or restoring a program keeps its place; closing and reopening appends it. Drag open program buttons horizontally to reorder them. Ctrl + Left/Right also reorders a focused button. Reordering keeps the current window focus and minimized state. Button order lasts for the current desktop session.
- A prominent Age Up button at the bottom right of the desktop.
- Age Up opens yearly life events as XP popups instead of email. Age Up is greyed out while a popup is open or a yearly event is unresolved. Closing a yearly popup preserves it; use Review life event to resume. Required events persist in saves.
- Taskbar tray shows the life date and Year number. Each Age Up advances one year; January 1 of the birth year is Year 0.
- Local character saves, character switching, and a new character dialog.
- Layouts for desktop and smaller screens.

The game opens on the character selection screen with no demo character; new characters begin at age 0 with separate first and last name fields, saved separately. Older full names are split on load when possible. Age Up commits the new age, date, school progression, and job tenure before showing decisions for the beginning of that age. Lookout is removed from the current UI and no new mail is delivered; existing mail and occupation data remain in saves and old mail does not block progression. This remains a UI prototype with job-listing previews and job performance; school grades and popularity evolve yearly. Full-time job/university applications remain future work; part-time jobs pay on Age Up; parent promotions and school club/sport applications are implemented. School years and years in position advance with age; elementary starts at 6, middle at 10, high school at 14, and high school graduation is at 18. Occupation records save per character and reset on restart. Wallpaper source information is in `public/ASSETS.md`.

## Characters and saving

Start → **Log Off** saves the current character and opens the character picker. Start a new character there or return to a saved life.

Start → **Turn Off Computer** opens three options:

- **Save:** save the current life.
- **Turn off:** end the game session. Unsaved progress gets a save-or-discard prompt. The browser version displays a power-off screen rather than closing the browser or Codex.
- **Restart:** reset the current character to age 0, with the same name and starting location. The previous saved version remains intact until saving again.

Saves are local to this browser and this site address. Clearing site data removes them. Use the same preview address to access the same saves. Storage failures are reported without claiming the game was saved. Unreadable previous save data is backed up before replacement.

## Development

US-only new-character locations and USD displays now use shared catalogs. Pay, taxes, benefits, education, legal rules and retirement use one national game model; state records are hidden geography only. Full-time catalog positions use annual salaries and part-time jobs use hourly wages. See [CATALOGS.md](CATALOGS.md) for inventory, simplifications, research sources and integration status.

Install dependencies with `pnpm install`, start with `pnpm dev`, and verify a production build with `pnpm build`.

Run `pnpm test` using Node.js 24 or another runtime supporting TypeScript type stripping. Tests cover window geometry and focus, multiple character saves, failed storage writes, malformed data recovery, restart snapshots, life dates, events after age 0, separate event/mail delivery, required decision blocking, read and archive persistence, duplicate decision protection, and compatibility with older saves.

The project uses React, TypeScript, and Vite. Play using the desktop shortcuts and taskbar buttons.

The fresh-start playtest update clears old v1 prototype saves and backups on first load. New v2 saves persist across future updates.

## Family and growing up

New lives have one or two saved parents. At least one shares the child's full last name, and both usually do. Birth Smarts and Looks inherit the average of the parents' stats with small variation. Restarting preserves the family and restores birth stats. Existing characters retain their current player stats.

Childhood age-up events for ages 1–12 live in `src/childhoodEvents.ts`. Birth uses a Command Prompt introduction without a popup; ages 6, 10 and 14 mark elementary, middle and high school enrollment. Grades 1–12 progress automatically, graduating at age 18 with a high school diploma. Enrollment and qualifications update before decisions appear.

Enternet Explorer → Education shows school, stage, grade, year, class size, principal, grades and popularity. Study harder stays clickable and gives grades and Smarts gains only once per year. Grades start from Smarts at each school stage. Popularity is the average classmate relationship. Positive staff Compliment, Conversation, and Suck up responses can improve grades once per staff/action/year. Club applications and sport tryouts begin in middle school, in separate Education groups. School contacts appear in Enternet Explorer while enrolled. Enrolled students graduate at 18; dropouts retain their completed middle school education and receive no diploma.


Family simulation: births begin with a Command Prompt introduction and no popup. Family conversations and time together unlock at age 2; additional actions unlock at 6. Parent money requests can be repeated: an accepted request gives +5 Happiness, later requests that year are forced refusals, and refusals cost 10 relationship and 10 player Happiness; refusals after the first also cost the parent 5 Happiness. Parent relationships and shared Money determine cash gifts. Five small parent career paths progress using years in position. Single mothers, older siblings and younger sibling births are supported; restarting restores the original family.


Parent age gaps now use a global-inspired, signed distribution rather than independent ages: father older 78%, same whole-year age 10%, mother older 12%. The expected father-minus-mother gap is 4.175 years (about 4.2). Common small gaps and rare larger gaps are defined in `src/parentAges.ts`. These exact weights are a gameplay approximation, not measured global percentages. The research includes both spouses and cohabiting partners, and does not establish this exact global histogram. Pew's 2019 report, using 2010–2018 census/survey data across 130 countries and territories, reports a global gap of about four years with male partners older on average; the 2022 research by Kramer et al. further examines partner gaps across 130 countries. Sources: https://www.pewresearch.org/religion/2019/12/12/household-patterns-by-age-and-gender/ and https://pubmed.ncbi.nlm.nih.gov/36165033/.

| Parent age gap | Probability |
| --- | --- |
| Mother older by 6–10 years | 1% |
| Mother older by 3–5 years | 4% |
| Mother older by 1–2 years | 7% |
| Same whole-year age | 10% |
| Father older by 1–2 years | 18% |
| Father older by 3–5 years | 27% |
| Father older by 6–9 years | 20% |
| Father older by 10–14 years | 11% |
| Father older by 15–20 years | 2% |

Within each range, integer gaps are equally likely. New couples draw their gap first, then a compatible maternal age (18–40, or at least 23 for the current university careers); paternal ages remain 18–60, or at least 23 for university careers. Conditional age sampling preserves the selected gap without clipping or rerolling it. Single mothers retain independent maternal age generation. Existing parents and saved lives keep their original ages; this applies to newly created lives. Global calibration was explicitly requested despite the US-only game setting.


Parent promotions now appear immediately in Command Prompt under the new age: “My father has been promoted to Shift supervisor.” The notice is written by the annual simulation once, before yearly decisions, and survives saves.

Older siblings now come from a family timeline rather than a random count with uniform ages. A modeled first-birth distribution favors maternal ages around 28 and strongly reduces cases in which either parent would have been 18–19. First births before either parent is 18 remain excluded. A sampled first birth at or after the player's birth means no older siblings; otherwise subsequent older births are spaced 2–4 years apart, with declining continuation chances and at most three older siblings. This also permits older siblings over age 10 when parental ages support it. Exact weights/spacing are gameplay assumptions, not measured probabilities. Research context: CDC reports an all-marital-status mean maternal age at first birth of 27.5 in 2023 (https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-09.pdf). NCFMR reports a mean first-birth age of 28.3 among fathers aged 40–44 in 2016 who were married at first birth (https://www.bgsu.edu/ncfmr/resources/data/family-profiles/schweizer-years-change-mens-entry-fatherhood-fp-19-28). These are different populations; neither is an exact mean for current married couples. Existing saved family histories are preserved.

Publishing preference: continue GitHub updates, but pause Netlify deployments until requested again.


## Expanded school life

The name pool is expanded and is shared by families, classmates and school staff. School classes contain 22 students in primary, 24 in middle and 25 in secondary/high school, including the player. These are authored approximations informed by NCES public-school class-size tables, not exact national averages: https://nces.ed.gov/surveys/ntps/estable/table/ntps/ntps2021_fl07_t1n. A principal plus three teachers appear in primary; a principal plus six subject teachers appear in middle and high school. Staff remain through the school stage and are replaced at ages 10 and 14. Annual roster turnover replaces 0–2 classmates; transitions replace about 25% of the existing classmates and adjust class size. Retained classmates keep their identity, gender, stats and saved relationships. Rosters persist in saves.

Middle/high-school extracurriculars are defined in `src/schoolActivityCatalog.ts`, with alphabetical club and sport lists. Club acceptance is randomly 70%. Sports acceptance uses the player's Health and Athleticism, capped at a 95% chance. Acceptance changes Happiness by +20. A rejection changes Happiness by -20; a second application that year is automatically rejected for another -20 and blocks further applications until the next year. Membership persists through ordinary years and ends when changing school or graduating.

Befriend is hidden for family and already-befriended contacts. Unfriend is hidden for acquaintances. Friend profiles persist even when classmates or staff leave school; legacy saved named relationships upgrade to persistent profiles. New lives do not gain a fabricated best friend automatically.

Enternet Explorer Work remains visible; Part-time listings begin at age 14. Full-time listings require a high school diploma (or completed university education). Current job details appear in Work. Education contains current schooling and post-graduation university previews. File Explorer has no Occupation/Job/Education folders. Full-time hiring and university applications remain previews, while part-time jobs are playable, while school club/sport applications are playable. GitHub updates continue; Netlify remains paused.

XP startup audio plays when entering a life, and shutdown audio plays when turning off the computer. School stages are ages 6–9 (elementary), 10–13 (middle), and 14–17 (high school), with graduation at 18. Clubs and teams begin at 10; female characters see Softball instead of Baseball. Stats and activities include emoji accents.

School activities are alphabetical collapsible Clubs/Sports lists with individual emojis. Study harder gives +10 Grades, +1 Smarts and -5 Happiness once yearly. Skip school gives +5 Happiness, -5 Grades and -1 Smarts once yearly. Nurse visits report a clean examination; another visit that year triggers a reprimand. Transfers replace the school roster while retaining saved friendships.

High school dances support partner, selected classmate, selected friend, and solo attendance. Your Enjoyment gives 0–20 Happiness; the companion’s enjoyment gives 0–20 relationship. Rejection costs 20 Happiness and 20 relationship for a classmate, or 10 relationship for a friend. A completed dance can occur once yearly.

School memberships show Performance, rank, years, and a 1–10 hours/week slider. Practice harder/Work harder adds 10 Performance once per activity/year. Each weekly hour dedicated adds one Performance per Age Up. Sports advance from Benchwarmer to Starter to Captain; clubs use Member, Vice President, and President.

The Home Schedule bar totals school (40 hours), extracurriculars, and job hours, reaching full at 60 hours. Any schedule above 60 costs 10 Happiness, 5 Health, 20 Grades, and 20 Performance across every club, sport and job during Age Up. Suck up changes the target relationship from -10 to +20, can add 0–20 Grades/Performance, and lowers every classmate or coworker relationship by 5 on its first use that year.

Desktop shortcuts open on a single click: Recycle Bin and My Life on the first row, Enternet Explorer and Messenger below the bin. The Home widgets show bank balance and a clickable Schedule box, which opens itemized weekly hours and Stress. Stress reverses low-stat colors: high stress is orange/red. All other stat bars turn orange at 25 or lower and red at 10 or lower; only the player Health, Happiness, Smarts and Looks in My Life show percentages. Current extracurriculars and All extracurriculars are separate sections. Contacts show age beside their relationship type; refusal of a yearly parent money request costs two relationship points. Command Prompt updates in the background and is not brought forward by actions or Age Up.

Relationships start at 100 for parents and siblings. New classmates and work contacts start at 25–75. Befriend succeeds using the current relationship as its percentage chance: success gives +25 relationship and +25 Happiness to both characters; rejection costs the player 25 relationship and 25 Happiness. Friends and partners lose 5 relationship per year. Salvaging gives +10 relationship and +10 Happiness; failure costs 20 Happiness, while wishing them well costs 10.

Interaction effects use continuous reaction values. Compliment gives 0–25 relationship; Conversation gives -5 to +10 relationship and matching Happiness to both; Flirt gives -10 to +25 relationship and matching Happiness to both; gifts give -10 to +25 relationship and recipient Happiness. Repeated first-limited actions still show new reactions but do not reapply stats. Insult, Befriend, Ask out and rejected outings apply their penalties on every attempt.

Each Age Up independently changes player Smarts and Looks by +1 or -1 with equal chances, clamped to 0–100, before school-stage enrollment and yearly decisions. Messenger stays expanded, with partners first, family oldest-to-youngest, and other contacts alphabetically. Player icons use gender colors. Profiles show relationship type, gender, age, sexuality, known relationship status (10+), education and occupation; known partner names open their profile. Married parent links open the other parent; dating-player links open My Life. Credential labels include majors where known, Juris Doctor and Doctor of Medicine; Business Administration uses an ordinary master’s label. Classmates can hold at most one club and one sport, with annual chances to join if empty.

Flirt Receptiveness uses 65% player Looks, 25% relationship and up to 10 random points. At 100 Receptiveness there is a 25% chance of a Have fun/Hook up invitation and a 10% chance of a dating invitation. Compliments above 75 Appreciation can trigger a returned compliment, and insults have a 25% chance of being returned.

Interaction confirmations cover Insult, Flirt, Befriend, Ask out, Hook up, Have fun, Break up, and Suck up. Gifts go directly to the picker. Adult Hook up and Make love remain adult-only; Have fun is available to peers aged 16–17. Spend time requires family, a partner, or friendship.

Part-time jobs gain 10 Performance per Age Up. Work harder adds 10 Performance and costs 5 Happiness once yearly. Players can request more or fewer hours, between 10 and 20 and within the 60-hour schedule cap; a declined first request costs 10 Happiness and later requests that year cannot change hours. Raises still depend on performance and tenure. Job listings remain alphabetical with text search.

To edit displayed interaction names, emojis and hints safely, use `src/interactionText.ts`. See `INTERACTIONS.md` for popup, confirmation, Command Prompt, school and job text locations.

Ask out can be attempted repeatedly. Acceptance gives both characters +25 relationship/Happiness; rejection costs 10 relationship and 25 player Happiness. Accepted Have fun/Hook up/Make love gives 0–20 relationship and matching Happiness to each participant on the first successful attempt; every rejection costs 20 relationship and 20 player Happiness. Break up costs 50 relationship, 10 player Happiness and 25 partner Happiness. Unfriend keeps the relationship value but costs the other person 15 Happiness.

Athleticism is a fifth character stat, displayed below Looks for players and NPCs. New characters inherit it from their parents; legacy saves receive 50 Athleticism. Club, sport and part-time job applications open confirmation windows before acting. Sport tryouts show Health and Athleticism and use both for acceptance. Joining the same club or team as a classmate adds 20 relationship. Quitting extracurriculars and resigning require confirmation, and action popups use descriptive titles.

Event and outcome popups use a compact Windows XP layout: the window title appears only in the title bar, while a context-specific emoji and the outcome text appear in the body. Interaction outcome titles have several deterministic variations. Ages 1–5 each draw from six deterministic childhood events, with two to four choices affecting player stats and, where relevant, parent or sibling relationships.