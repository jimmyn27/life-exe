# Life.exe

A Windows XP Luna inspired desktop for a text-based life simulator, with the Bliss wallpaper.

## Current preview

- Glossy Luna windows, a green Start button, and a two-column XP Start menu.
- Web Surfer hosts lifeconnect: Home, Education, Work (always visible; part-time listings from age 14), and Activities. University listings are part of Education after high school graduation.
- My Life is a separate Task Manager-style program with character details and statistics together in one view. Its bank balance links directly to Finances.
- File Explorer contains Assets and Finances. Education and job details are in lifeconnect.
- Command Prompt groups life history under one Age header per year, with plain paragraphs and no category tags. Its launcher is in Start, and its open window appears on the taskbar. Command Prompt is the only program open by default.
- Messenger contact groups can collapse and expand, and its header shows the player’s age and life stage. School staff have distinct interactions that change after befriending. Gift is available for friends and acquaintances. Messenger person icons are pink for females and blue for males. Profiles show gender, age, education, occupation and the four character stats. Befriend is the first action for acquaintances. Only existing friends can be unfriended. Befriended school/work contacts appear in Contacts and remain there after leaving the roster. Parents and siblings cannot be befriended. School and Work tabs show enrolled/employed contacts; family actions follow age gates. Gifts offer five randomized items with individual prices and contextual relationship effects; parents can receive gifts from age 6. Every Messenger interaction shows a result popup. Compliments and gifts show Appreciation; conversations show Agreement. Low reactions can hurt relationships. Other interactions use text-only results. Clicking your Messenger name opens My Life. Escape goes back in the active program; romance requires adults. Social media remains hidden.
- The desktop contains only Recycle Bin and My Life, using a PC icon. Recycle Bin remains a placeholder.
- Desktop icons stay fixed in place. A single click selects an icon; double-click opens My Life. Enter also opens a selected icon.
- Multiple programs can remain open at once.
- Drag title bars to move windows; drag any edge or corner to resize.
- Minimize, maximize, restore, and close each window independently. Double-click a title bar to maximize or restore.
- Taskbar shortcuts launch Web Surfer, File Explorer, and Messenger in that order. Buttons for open programs focus, minimize, and restore them, including Command Prompt. The Start menu left column lists Web Surfer, File Explorer, Messenger, and Command Prompt; My Life and My Assets are in the right column, above a group containing New Life, Save Life, and Help and Support. Finances remains inside Assets.
- Taskbar buttons appear in opening order. Focusing or restoring a program keeps its place; closing and reopening appends it. Drag open program buttons horizontally to reorder them. Ctrl + Left/Right also reorders a focused button. Reordering keeps the current window focus and minimized state. Button order lasts for the current desktop session.
- A prominent Age Up button at the bottom right of the desktop.
- Age Up opens yearly life events as XP popups instead of email. Age Up is greyed out while a popup is open or a yearly event is unresolved. Closing a yearly popup preserves it; use Review life event to resume. Required events persist in saves.
- Taskbar tray shows the life date and Year number. Each Age Up advances one year; January 1 of the birth year is Year 0.
- Local character saves, character switching, and a new character dialog.
- Layouts for desktop and smaller screens.

The game opens on the character selection screen with no demo character; new characters begin at age 0 with separate first and last name fields, saved separately. Older full names are split on load when possible. Age Up commits the new age, date, school progression, and job tenure before showing decisions for the beginning of that age. Lookout is removed from the current UI and no new mail is delivered; existing mail and occupation data remain in saves and old mail does not block progression. This remains a UI prototype with job-listing previews and job performance; school grades and popularity evolve yearly. Job/university applications and salary payments remain future work; parent promotions and school club/sport applications are implemented. School years and years in position advance with age; primary starts at 6, middle at 12, secondary/high school at 15, and high school graduation is at 18. Occupation records save per character and reset on restart. Wallpaper source information is in `public/ASSETS.md`.

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

Childhood age-up events for ages 1–12 live in `src/childhoodEvents.ts`. Birth uses a Command Prompt introduction without a popup; ages 6, 12 and 15 mark elementary, middle and high school enrollment. Grades 1–12 progress automatically, graduating at age 18 with a high school diploma. Enrollment and qualifications update before decisions appear.

lifeconnect → Education shows school, stage, grade, year, class size, principal, grades and popularity. Study hard is available once per year. School-event decisions and grade/popularity changes persist. Club applications and sport tryouts begin in middle school, in separate Education groups. School contacts appear in Messenger while enrolled. Graduation is automatic in this prototype; failure rules remain future work.


Family simulation: births begin with a Command Prompt introduction and no popup. Family conversations and time together unlock at age 2; additional actions unlock at 6. Each parent can receive one money request per year, including refusals. Other actions affect stats once per action/person/year. Parent relationships and shared Money determine cash gifts. Five small parent career paths progress using years in position. Single mothers, older siblings and younger sibling births are supported; restarting restores the original family. Birth probabilities and the two-child family-size threshold are simplified gameplay settings, rather than demographic or medical predictions. Existing saves retain their family identities; newly created lives receive all randomized birth details.


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

The name pool is expanded and is shared by families, classmates and school staff. School classes contain 22 students in primary, 24 in middle and 25 in secondary/high school, including the player. These are authored approximations informed by NCES public-school class-size tables, not exact national averages: https://nces.ed.gov/surveys/ntps/estable/table/ntps/ntps2021_fl07_t1n. A principal plus three teachers appear in primary; a principal plus six subject teachers appear in middle and high school. Staff remain through the school stage and are replaced at ages 12 and 15. Annual roster turnover replaces 0–2 classmates; transitions replace about 25% of the existing classmates and adjust class size. Retained classmates keep their identity, gender, stats and saved relationships. Rosters persist in saves.

Middle/high-school extracurriculars: Chess, Debate, Art and Science clubs; Basketball, Soccer, Track and Swimming teams. Club acceptance is randomly 70%, sports 50%, independent of stats for now. One application/tryout per activity/year, with results and memberships saved. Membership persists through ordinary years and ends when changing school or graduating. No new stat effects are assigned for membership yet.

Befriend is hidden for family and already-befriended contacts. Unfriend is hidden for acquaintances. Friend profiles persist even when classmates or staff leave school; legacy saved named relationships upgrade to persistent profiles. New lives do not gain a fabricated best friend automatically.

lifeconnect Work appears from age 14 with Part-time listings. Full-time listings require a high school diploma (or completed university education). Current job details appear in Work. Education contains current schooling and post-graduation university previews. File Explorer has no Occupation/Job/Education folders. Hiring and university applications remain previews, while school club/sport applications are playable. GitHub updates continue; Netlify remains paused.
