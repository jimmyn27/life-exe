# Life.exe

A Windows XP Luna inspired desktop for a text-based life simulator, with the Bliss wallpaper.

## Current preview

- Glossy Luna windows, a green Start button, and a two-column XP Start menu.
- Web Surfer for activities, jobs, and university previews.
- My Life is a separate Task Manager-style program with character details and statistics together in one view. Its bank balance links directly to Finances.
- File Explorer has two top-level folders: Assets and Occupation, each with a collapse/expand control. Finances sits under Assets; Job and Education sit under Occupation. Job shows position, employer, annual salary, schedule, performance, and tenure. Education shows the highest completed education and current school, level, year, grades, and popularity.
- Command Prompt groups life history under one Age header per year, with plain paragraphs and no category tags. Its launcher is in Start, and its open window appears on the taskbar. Command Prompt is the only program open by default.
- Messenger profiles show gender, age, education, occupation, and Health, Happiness, Smarts, and Looks. Actions appear in order: Ask out, Compliment, Conversation, Gift, Hook up, Insult, Spend time, and Unfriend. Parents omit Ask out, Hook up, and Unfriend. Interactions update saved relationships; gifts cost $25, and dating/hookup actions require both characters to be adults. Work and School tabs appear when the character is employed or enrolled, with a few managers, coworkers, classmates, and teachers/professors. Both tabs appear when studying and working together. Social media is hidden until that system is developed.
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

The initial preview character begins at age 18; new characters begin at age 0 with separate first and last name fields, saved separately. Older full names are split on load when possible. Age Up commits the new age, date, school progression, and job tenure before showing decisions for the beginning of that age. Lookout is removed from the current UI and no new mail is delivered; existing mail and occupation data remain in saves and old mail does not block progression. This remains a UI prototype with sample contacts and fixed starter grades, popularity, and job performance. Applications, salary payments, and promotions will come later. School years and years in position advance with age; primary starts at 6, secondary at 12, and secondary graduation is at 18. Occupation records save per character and reset on restart. Wallpaper source information is in `public/ASSETS.md`.

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
