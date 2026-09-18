import { familyMoney } from './family';
import { useState, type RefObject } from 'react';
import { Icon, type IconKind } from './ClassicUI';
import type { Life } from './saves';
import type { Stats } from './data';
import type { WindowId } from './windowManager';

import { getOccupation, schoolName, type SchoolAction } from './occupation';
import { characters, availableActions, actionUnavailable, type RelationshipAction } from './relationships';
import { JobDetails, EducationDetails } from './OccupationViews';
import { money } from './money';
import { displayCity } from './catalogs/us/index';
import { majors } from './catalogs/us/education';
import { careers, positions } from './catalogs/us/careers';

export type ExplorerPage = 'Assets' | 'Finances' | 'Occupation' | 'Job' | 'Education';
type Activity = (title: string, text: string, outcome: string, effect: Partial<Stats>) => void;
export const programs: { id: WindowId; name: string; icon: IconKind; description: string }[] = [
  { id: 'Web', name: 'Web Surfer', icon: 'web', description: 'Activities, jobs, and education' },
  { id: 'Explorer', name: 'File Explorer', icon: 'folder', description: 'Assets, work, and education' },
  { id: 'Messenger', name: 'Messenger', icon: 'messenger', description: 'The people in your life' },
  { id: 'Command', name: 'Command Prompt', icon: 'command', description: 'Your life history' },
  { id: 'Life', name: 'My Life', icon: 'computer', description: 'Character overview and statistics' }
];
export function lifeStage(age: number) { return age < 3 ? 'Infant' : age < 6 ? 'Young child' : age < 13 ? 'Child' : age < 18 ? 'Teenager' : age < 30 ? 'Young adult' : age < 65 ? 'Adult' : 'Senior'; }

export function CommandPrompt({ life, feedRef }: { life: Life; feedRef: RefObject<HTMLDivElement | null> }) {
  const ages = [...new Set([...life.log.map(entry => entry.age), life.age])].sort((a, b) => a - b);
  return <div className="command-screen" ref={feedRef} role="log" aria-label="Life history">{ages.map(age => <section className="command-entry" key={age}><h2 className="command-age">Age {age}</h2>{life.log.filter(entry => entry.age === age).map((entry, i) => <p key={i} style={{whiteSpace:"pre-line"}}>{entry.text}</p>)}</section>)}</div>;
}

const assetFolders: { page: ExplorerPage; icon: IconKind; description: string }[] = [
  { page: 'Finances', icon: 'save', description: 'Accounts, income, and expenses' }
];

export function MyLife({ life, dirty, onFinances }: { life: Life; dirty: boolean; onFinances: () => void }) {
  const occupation = getOccupation(life);
  return <>

    <section className="manager-content" aria-label="My Life details and statistics">
      <div className="manager-identity"><Icon kind="computer"/><div><h2>{life.name}</h2><p>Age {life.age} · {lifeStage(life.age)}</p></div></div>
      <fieldset className="character-details"><legend>Character overview</legend><dl><div><dt>Location</dt><dd>{displayCity(life)}</dd></div><div><dt>Occupation</dt><dd>{occupation.job?.position ?? (occupation.school ? 'Student' : life.age < 6 ? 'At home' : 'Not employed')}</dd></div><div><dt>Bank balance</dt><dd><button className="balance-link" onClick={onFinances} aria-label={`Bank balance ${money(life.balance)}. Open Finances`}>{money(life.balance)}</button></dd></div><div><dt>Relationship</dt><dd>{Object.entries(life.relationships ?? {}).some(([, record]) => record.status === 'dating') ? 'In a relationship' : life.age < 13 ? 'Not dating' : 'Single'}</dd></div></dl></fieldset>
      <fieldset className="manager-performance"><legend>Character statistics</legend>{Object.entries(life.stats).map(([key, value]) => <div className="stat" key={key}><div className="stat-label"><span>{key}</span><strong>{value}%</strong></div><div className={`stat-track stat-${key.toLowerCase()}`} role="progressbar" aria-label={key} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${value}%` }}/></div></div>)}</fieldset>
    </section><footer className="window-status"><span>Age {life.age} · Year {life.age}</span><span>{dirty ? 'Unsaved changes' : 'Saved'}</span></footer>
  </>;
}

export function FileExplorer({ life, page, onPage, onSave, onNotice, onSchoolAction }: { life: Life; page: ExplorerPage; onPage: (page: ExplorerPage) => void; onSave: () => void; onNotice: (text: string) => void; onSchoolAction: (action: SchoolAction) => void }) {
  const [history, setHistory] = useState<ExplorerPage[]>([]);
  const [folders, setFolders] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [occupationExpanded, setOccupationExpanded] = useState(true);
  function navigate(next: ExplorerPage) { if (next !== page) setHistory(previous => [...previous, page]); onPage(next); }
  function back() { const previous = history.at(-1); if (previous) { onPage(previous); setHistory(history.slice(0, -1)); } }
  const folder = assetFolders.find(item => item.page === page);
  return <>
    <div className="menu-bar"><button onClick={onSave}>Save Life</button><button onClick={() => setFolders(!folders)}>View</button><button onClick={() => onNotice('File Explorer holds Assets and Occupation. View your finances, current job, and education here. My Life is a separate program for character details and statistics.')}>Help</button><Icon kind="start"/></div>
    <div className="xp-toolbar"><button disabled={!history.length} onClick={back}><span className="xp-back">←</span>Back</button><button disabled={page === 'Assets' || page === 'Occupation'} onClick={() => navigate(page === 'Finances' ? 'Assets' : 'Occupation')}><Icon kind="folder"/>Up</button><span className="toolbar-divider"/><button className={folders ? 'toolbar-selected' : ''} onClick={() => setFolders(!folders)}><Icon kind="folder"/>Folders</button></div>
    <div className="address-bar"><span>Address</span><div className="address-field"><Icon kind={folder?.icon ?? 'folder'}/><span>{page === 'Assets' || page === 'Finances' ? 'Assets' : 'Occupation'}{page === 'Finances' || page === 'Job' || page === 'Education' ? `\\${page}` : ''}</span><span className="address-down" aria-hidden="true">▾</span></div><button className="xp-go" onClick={() => navigate('Assets')}>➜ Go</button></div>
    <div className={`explorer-layout ${!folders ? 'hide-tree' : ''}`}>
      {folders && <nav className="explorer-tree" aria-label="Asset folders"><div className="tree-caption">Folders <button onClick={() => setFolders(false)} aria-label="Hide folders">×</button></div><div className="asset-tree-root"><button className="tree-toggle" aria-label={expanded ? "Collapse Assets" : "Expand Assets"} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "−" : "+"}</button><button className={page === 'Assets' ? 'tree-selected' : ''} onClick={() => navigate('Assets')}><Icon kind="folder"/>Assets</button></div>{expanded && assetFolders.map(item => <button className={`tree-child ${page === item.page ? 'tree-selected' : ''}`} key={item.page} onClick={() => navigate(item.page)}><Icon kind={item.icon}/>{item.page}</button>)}<div className="asset-tree-root"><button className="tree-toggle" aria-label={occupationExpanded ? 'Collapse Occupation' : 'Expand Occupation'} aria-expanded={occupationExpanded} onClick={() => setOccupationExpanded(!occupationExpanded)}>{occupationExpanded ? '−' : '+'}</button><button className={page === 'Occupation' ? 'tree-selected' : ''} onClick={() => navigate('Occupation')}><Icon kind="folder"/>Occupation</button></div>{occupationExpanded && (['Job', 'Education'] as const).map(item => <button className={`tree-child ${page === item ? 'tree-selected' : ''}`} key={item} onClick={() => navigate(item)}><Icon kind={item === 'Education' ? 'document' : 'folder'}/>{item}</button>)}</nav>}
      <section className="explorer-content" aria-label={page}>
        {page === 'Assets' ? <><div className="directory-heading"><Icon kind="folder"/><div><h2>Assets</h2><p>{life.name}'s assets and finances.</p></div></div><div className="explorer-icon-grid">{assetFolders.map(item => <button key={item.page} onClick={() => navigate(item.page)}><Icon kind={item.icon}/><span><strong>{item.page}</strong><small>{item.description}</small></span></button>)}</div></> : page === 'Finances' ? <><div className="directory-heading"><Icon kind="save"/><div><h2>Finances</h2><p>Your accounts and financial overview.</p></div></div><fieldset className="finance-account"><legend>Bank account</legend><span>Available balance</span><strong>{money(life.balance)} <small>USD</small></strong></fieldset><table className="finance-table"><thead><tr><th>Category</th><th>Status</th></tr></thead><tbody><tr><td>Income</td><td>Coming soon</td></tr><tr><td>Expenses</td><td>Coming soon</td></tr><tr><td>Loans and debt</td><td>Coming soon</td></tr></tbody></table><p className="explorer-subtitle">Income, expenses, and banking will expand as we add systems.</p></> : page === 'Occupation' ? <><div className="directory-heading"><Icon kind="folder"/><div><h2>Occupation</h2><p>Your work and education.</p></div></div><div className="explorer-icon-grid">{(['Job', 'Education'] as const).map(item => <button key={item} onClick={() => navigate(item)}><Icon kind={item === 'Job' ? 'folder' : 'document'}/><span><strong>{item}</strong><small>{item === 'Job' ? 'Position, salary, and performance' : 'Schools, qualifications, and grades'}</small></span></button>)}</div></> : page === 'Job' ? <JobDetails life={life}/> : <EducationDetails life={life} onAction={onSchoolAction}/>}
      </section>
    </div><footer className="window-status"><span>{page === 'Assets' ? '1 folder' : page === 'Occupation' ? '2 folders' : page}</span><span>{life.name}</span></footer>
  </>;
}
type WebPage = 'Home' | 'Activities' | 'Jobs' | 'University';
export function WebSurfer({ life, onActivity, onNotice, onSave }: { life: Life; onActivity: Activity; onNotice: (text: string) => void; onSave: () => void }) {
  const [page, setPage] = useState<WebPage>('Home');
  const [history, setHistory] = useState<WebPage[]>(['Home']);
  const [position, setPosition] = useState(0);
  const [query, setQuery] = useState('');
  function navigate(next: WebPage) { if (next === page) return; setHistory(previous => [...previous.slice(0, position + 1), next]); setPosition(position + 1); setPage(next); setQuery(''); }
  function browse(offset: number) { const next = position + offset; setPosition(next); setPage(history[next]); setQuery(''); }
  const categories: WebPage[] = ['Home', 'Activities', 'Jobs', 'University'];
  const activities = life.age < 6 ? [{ title: 'Play with toys', description: 'Discover something new with your family.', effect: { Happiness: 2 } }, { title: 'Story time', description: 'Listen to a story with a parent.', effect: { Smarts: 2 } }] : [{ title: 'Take a walk', description: 'Get outside and clear your head.', effect: { Health: 2, Happiness: 2 } }, { title: 'Read a book', description: 'A little curiosity goes a long way.', effect: { Smarts: 2 } }, { title: 'Try a creative hobby', description: 'Make something just for yourself.', effect: { Happiness: 3 } }];
  return <>
    <div className="menu-bar"><button onClick={onSave}>Save Life</button><button onClick={() => navigate('Home')}>Home</button><button onClick={() => onNotice('Web Surfer is your in-game portal. Browse activities, jobs, and university. Activities demonstrate choices; career and education mechanics will be added later.')}>Help</button><Icon kind="start"/></div>
    <div className="xp-toolbar"><button disabled={position === 0} onClick={() => browse(-1)}><span className="xp-back">←</span>Back</button><button disabled={position === history.length - 1} onClick={() => browse(1)} aria-label="Forward"><span className="xp-back">→</span></button><span className="toolbar-divider"/><button onClick={() => navigate('Home')}><Icon kind="assets"/>Home</button><button onClick={() => setQuery('')}><Icon kind="web"/>Refresh</button></div>
    <div className="address-bar"><span>Address</span><div className="address-field"><Icon kind="web"/><span>life://{page.toLowerCase()}</span><span className="address-down" aria-hidden="true">▾</span></div><button className="xp-go" onClick={() => navigate('Home')}>➜ Go</button></div>
    <section className="web-page" aria-label="Web Surfer page"><header className="web-brand"><Icon kind="web"/><span>life<span>connect</span></span><small>Your world, a click away.</small></header><nav className="web-nav" aria-label="Web categories">{categories.map(category => <button className={category === page ? 'web-nav-selected' : ''} key={category} onClick={() => navigate(category)}>{category}</button>)}</nav>
      <div className="web-content"><div className="web-page-heading"><h2>{page === 'Home' ? `Welcome, ${life.name.split(' ')[0]}!` : page}</h2><p>{page === 'Home' ? 'Where would you like to go today?' : page === 'Activities' ? 'Make a little time for yourself.' : page === 'Jobs' ? 'Your next opportunity starts here.' : 'Discover your next chapter in education.'}</p></div>
        {page === 'Home' ? <div className="web-home-grid">{[{ page: 'Activities' as const, icon: 'activity' as const, title: 'Things to do', text: 'Hobbies, outings, and everyday adventures.' }, { page: 'Jobs' as const, icon: 'folder' as const, title: 'Find a job', text: 'Explore opportunities and career paths.' }, { page: 'University' as const, icon: 'document' as const, title: 'Go to university', text: 'Majors, courses, and further education.' }].map(item => <button key={item.page} onClick={() => navigate(item.page)}><Icon kind={item.icon}/><strong>{item.title}</strong><p>{item.text}</p><span>Browse now »</span></button>)}</div> : page === 'Activities' ? <><label className="web-search">Find an activity <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search activities"/></label><div className="web-list">{activities.filter(item => item.title.toLowerCase().includes(query.toLowerCase())).map(item => <article key={item.title}><Icon kind="activity"/><div><h3>{item.title}</h3><p>{item.description}</p></div><button onClick={() => onActivity(item.title, item.description, `I spent time ${item.title.toLowerCase() === 'story time' ? 'listening to a story with my family' : item.title.toLowerCase() === 'play with toys' ? 'playing with toys' : item.title.toLowerCase() === 'take a walk' ? 'taking a walk' : item.title.toLowerCase() === 'read a book' ? 'reading a book' : 'trying a creative hobby'}.`, item.effect as Partial<Stats>)}>Choose »</button></article>)}{!activities.some(item => item.title.toLowerCase().includes(query.toLowerCase())) && <p>No activities match your search.</p>}</div></> : <><div className="web-availability">{life.age < 18 ? `Available from age 18. You are currently ${life.age}.` : 'Listings preview · These systems are coming next.'}</div>{(page === 'Jobs' ? careers.map(career => [positions.find(position => position.careerId === career.id)!.title, career.description]) : majors.map(major => [major.name, major.description])).map(([title, text]) => <article className="web-listing" key={title}><Icon kind={page === 'Jobs' ? 'folder' : 'document'}/><div><h3>{title}</h3><p>{text}</p></div><button disabled={life.age < 18} onClick={() => onNotice(`${page === 'Jobs' ? 'Job applications' : 'University applications'} will be added when we build the ${page === 'Jobs' ? 'career' : 'education'} system.`)}>View details »</button></article>)}</>}
      </div><footer className="web-page-footer">lifeconnect · A world of possibilities.</footer>
    </section><footer className="window-status"><span>Done</span><span>Life portal</span></footer>
  </>;
}

export function Messenger({ life, onAction }: { life: Life; onAction: (id: string, action: RelationshipAction) => void }) {
  const occupation = getOccupation(life);
  const people = characters(life);
  const [tab, setTab] = useState<'Contacts' | 'Work' | 'School'>('Contacts');
  const activeTab = tab === 'Work' && !occupation.job || tab === 'School' && !occupation.school ? 'Contacts' : tab;
  const contacts = activeTab === 'Work' ? people.work : activeTab === 'School' ? people.school : people.personal;
  const groups = [...new Set(contacts.map(contact => contact.group))];
  const [selected, setSelected] = useState<string | null>(null);
  const person = contacts.find(contact => contact.id === selected);
  const descriptions: Record<RelationshipAction, string> = {'Ask for money':'Ask your parent for some money.', 'Ask out':'See if there is a spark.',Compliment:'Say something kind.',Conversation:'Talk and catch up.',Gift:'Give a thoughtful gift · $25.00','Hook up':'Find out if the feeling is mutual.',Insult:'Say something hurtful.','Spend time':'Make a memory together.',Unfriend:'End your friendship.'};
  return <><div className="messenger-banner"><Icon kind="messenger"/><div><strong>{life.name}</strong><small><span className="online-dot"/> Online</small></div><span className="messenger-wordmark">Messenger</span></div>
    <nav className="messenger-tabs" aria-label="Messenger tabs">{(['Contacts', ...(occupation.job ? ['Work'] : []), ...(occupation.school ? ['School'] : [])] as ('Contacts' | 'Work' | 'School')[]).map(item => <button key={item} className={activeTab === item ? 'messenger-tab-selected' : ''} aria-pressed={activeTab === item} onClick={() => { setTab(item); setSelected(null); }}>{item}</button>)}</nav>
    <div className="messenger-body">
      {person ? <><button className="messenger-back" onClick={() => setSelected(null)}>« Back to contacts</button><div className="contact-heading"><Icon kind="people"/><div><h2>{person.name}</h2><p>{person.relation}{person.status === 'dating' ? ' · Dating' : person.status === 'unfriended' ? ' · Not friends' : ''} · Relationship {person.strength}%</p></div></div><div className="relationship-meter" role="progressbar" aria-label="Relationship strength" aria-valuenow={person.strength} aria-valuemin={0} aria-valuemax={100}><div style={{width:`${person.strength}%`}}/></div>
        <fieldset className="contact-profile"><legend>Character details</legend><dl><div><dt>Gender</dt><dd>{person.gender}</dd></div><div><dt>Age</dt><dd>{person.age}</dd></div><div><dt>Education</dt><dd>{person.education}</dd></div><div><dt>Occupation</dt><dd>{person.occupation}</dd></div>{person.parent && <div><dt>Family Money</dt><dd>{Math.round(familyMoney(life.family))}%</dd></div>}</dl></fieldset>
        <fieldset className="contact-statistics"><legend>Character statistics</legend>{Object.entries(person.stats).map(([name, value]) => <div className="stat" key={name}><div className="stat-label"><span>{name}</span><strong>{value}%</strong></div><div className={`stat-track stat-${name.toLowerCase()}`} role="progressbar" aria-label={`${person.name} ${name}`} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div style={{width:`${value}%`}}/></div></div>)}</fieldset>
        <h3 className="social-section-heading">Interactions</h3><div className="contact-action-list">{availableActions(person,life).filter(action => action==='Ask for money' || !actionUnavailable(life,person,action)).map(action => { const unavailable = actionUnavailable(life,person,action); return <button key={action} disabled={Boolean(unavailable)} title={unavailable ?? undefined} onClick={() => onAction(person.id,action)}><Icon kind={action === 'Conversation' ? 'messenger' : action === 'Gift' ? 'folder' : 'people'}/><span><strong>{action}</strong><small>{unavailable ?? descriptions[action]}</small></span><span>›</span></button>; })}</div><p className="messenger-tip">Each interaction affects stats once per person per year.</p>
      </> : <><div className="contacts-heading">{activeTab === 'Work' ? occupation.job?.employer : activeTab === 'School' ? occupation.school ? schoolName(life,occupation.school) : '' : 'Your contacts'}</div>{groups.map(group => <div className="contact-group" key={group}><h3>▾ {group} ({contacts.filter(contact => contact.group === group).length})</h3>{contacts.filter(contact => contact.group === group).map(contact => <button className="contact-row" key={contact.id} onClick={() => setSelected(contact.id)}><Icon kind="messenger"/><span><strong>{contact.name}</strong><small>{contact.relation}{contact.status === 'dating' ? ' · Dating' : ''}</small></span><span className="online-dot"/></button>)}</div>)}<div className="messenger-tip">A little conversation can go a long way.</div></>}
    </div><footer className="window-status"><span>{contacts.length} contacts</span><span>Connected</span></footer></>;
}
