import {schoolActivities,hasGraduated,workCategories} from './schoolActivities';
import { familyMoney } from './family';
import { useState, type RefObject } from 'react';
import { Icon, PersonIcon, type IconKind } from './ClassicUI';
import type { Life } from './saves';
import type { Stats } from './data';
import type { WindowId } from './windowManager';

import { getOccupation, schoolName, type SchoolAction } from './occupation';
import { characters, availableActions, actionUnavailable, type RelationshipAction } from './relationships';
import { JobDetails, EducationDetails } from './OccupationViews';
import { money } from './money';
import { displayCity } from './catalogs/us/index';
import { majors } from './catalogs/us/education';
import { careers, positions, partTimeJobs } from './catalogs/us/careers';

export type ExplorerPage = 'Assets' | 'Finances';
type Activity = (title: string, text: string, outcome: string, effect: Partial<Stats>) => void;
export const programs: { id: WindowId; name: string; icon: IconKind; description: string }[] = [
  { id: 'Web', name: 'Web Surfer', icon: 'web', description: 'Activities, jobs, and education' },
  { id: 'Explorer', name: 'File Explorer', icon: 'folder', description: 'Assets and finances' },
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

export function FileExplorer({ life, page, onPage, onSave, onNotice }: { life: Life; page: ExplorerPage; onPage: (page: ExplorerPage) => void; onSave: () => void; onNotice: (text: string) => void }) {
 const [history,setHistory]=useState<ExplorerPage[]>([]),[folders,setFolders]=useState(true),[expanded,setExpanded]=useState(true);
 function navigate(next:ExplorerPage){if(next!==page){setHistory(previous=>[...previous,page]);onPage(next);}}
 function back(){const previous=history.at(-1);if(previous){onPage(previous);setHistory(history.slice(0,-1));}}
 return <><div className="menu-bar"><button onClick={onSave}>Save Life</button><button onClick={()=>setFolders(!folders)}>View</button><button onClick={()=>onNotice('File Explorer holds your assets and finances. Education and work are in lifeconnect.')}>Help</button><Icon kind="start"/></div>
 <div className="xp-toolbar"><button disabled={!history.length} onClick={back}><span className="xp-back">←</span>Back</button><button disabled={page==='Assets'} onClick={()=>navigate('Assets')}><Icon kind="folder"/>Up</button><button onClick={()=>setFolders(!folders)}><Icon kind="folder"/>Folders</button></div>
 <div className="address-bar"><span>Address</span><div className="address-field"><Icon kind="folder"/><span>Assets{page==='Finances'?'\\Finances':''}</span></div><button className="xp-go" onClick={()=>navigate('Assets')}>➜ Go</button></div>
 <div className={`explorer-layout ${!folders?'hide-tree':''}`}>
 {folders && <nav className="explorer-tree" aria-label="Asset folders"><div className="tree-caption">Folders <button onClick={()=>setFolders(false)} aria-label="Hide folders">×</button></div><div className="asset-tree-root"><button className="tree-toggle" aria-label={expanded?'Collapse Assets':'Expand Assets'} aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'−':'+'}</button><button className={page==='Assets'?'tree-selected':''} onClick={()=>navigate('Assets')}><Icon kind="folder"/>Assets</button></div>{expanded && <button className={`tree-child ${page==='Finances'?'tree-selected':''}`} onClick={()=>navigate('Finances')}><Icon kind="save"/>Finances</button>}</nav>}
 <section className="explorer-content" aria-label={page}>{page==='Assets'?<><div className="directory-heading"><Icon kind="folder"/><div><h2>Assets</h2><p>{life.name}'s assets and finances.</p></div></div><div className="explorer-icon-grid">{assetFolders.map(item=><button key={item.page} onClick={()=>navigate(item.page)}><Icon kind={item.icon}/><span><strong>{item.page}</strong><small>{item.description}</small></span></button>)}</div></>:<><div className="directory-heading"><Icon kind="save"/><div><h2>Finances</h2><p>Your accounts and financial overview.</p></div></div><fieldset className="finance-account"><legend>Bank account</legend><span>Available balance</span><strong>{money(life.balance)} <small>USD</small></strong></fieldset><table className="finance-table"><thead><tr><th>Category</th><th>Status</th></tr></thead><tbody><tr><td>Income</td><td>Coming soon</td></tr><tr><td>Expenses</td><td>Coming soon</td></tr><tr><td>Loans and debt</td><td>Coming soon</td></tr></tbody></table></>}</section></div><footer className="window-status"><span>{page==='Assets'?'1 folder':page}</span><span>{life.name}</span></footer></>;
}
type WebPage='Home'|'Education'|'Work'|'Activities';
export function WebSurfer({life,onActivity,onNotice,onSave,onSchoolAction,onApplyActivity}:{life:Life;onActivity:Activity;onNotice:(text:string)=>void;onSave:()=>void;onSchoolAction:(action:SchoolAction)=>void;onApplyActivity:(id:string)=>void}) {
 const [page,setPage]=useState<WebPage>('Home'),[history,setHistory]=useState<WebPage[]>(['Home']),[position,setPosition]=useState(0),[query,setQuery]=useState('');
 const occupation=getOccupation(life),school=occupation.school,graduated=hasGraduated(life);
 function navigate(next:WebPage){if(next===page)return;setHistory(previous=>[...previous.slice(0,position+1),next]);setPosition(position+1);setPage(next);setQuery('');}
 function browse(offset:number){const next=position+offset;setPosition(next);setPage(history[next]);setQuery('');}
 const categories:WebPage[]=['Home','Education','Work','Activities'];
 const activities=life.age<6?[{title:'Play with toys',description:'Discover something new.',effect:{Happiness:2}},{title:'Story time',description:'Listen to a story.',effect:{Smarts:2}}]:[{title:'Take a walk',description:'Get outside and clear your head.',effect:{Health:2,Happiness:2}},{title:'Read a book',description:'A little curiosity goes a long way.',effect:{Smarts:2}},{title:'Try a creative hobby',description:'Make something just for yourself.',effect:{Happiness:3}}];
 const matches=(name:string)=>name.toLowerCase().includes(query.toLowerCase());
 return <><div className="menu-bar"><button onClick={onSave}>Save Life</button><button onClick={()=>navigate('Home')}>Home</button><button onClick={()=>onNotice('lifeconnect brings together your education, work and activities. School clubs and sports begin in middle school. Work listings begin at 14, with full-time jobs after high school graduation.')}>Help</button><Icon kind="start"/></div>
 <div className="xp-toolbar"><button disabled={position===0} onClick={()=>browse(-1)}><span className="xp-back">←</span>Back</button><button disabled={position===history.length-1} onClick={()=>browse(1)} aria-label="Forward">→</button><button onClick={()=>navigate('Home')}><Icon kind="assets"/>Home</button><button onClick={()=>setQuery('')}><Icon kind="web"/>Refresh</button></div>
 <div className="address-bar"><span>Address</span><div className="address-field"><Icon kind="web"/><span>life://{page.toLowerCase()}</span></div><button className="xp-go" onClick={()=>navigate('Home')}>➜ Go</button></div>
 <section className="web-page" aria-label="lifeconnect page"><header className="web-brand"><Icon kind="web"/><span>life<span>connect</span></span><small>Your world, a click away.</small></header><nav className="web-nav" aria-label="lifeconnect tabs">{categories.map(category=><button key={category} className={page===category?'web-nav-selected':''} onClick={()=>navigate(category)}>{category}</button>)}</nav>
 <div className="web-content"><div className="web-page-heading"><h2>{page==='Home'?`Welcome, ${life.name.split(' ')[0]}!`:page}</h2></div>
 {page==='Home'?<div className="web-home-grid">{categories.filter(item=>item!=='Home').map(item=><button key={item} onClick={()=>navigate(item)}><Icon kind={item==='Education'?'document':item==='Work'?'folder':'activity'}/><strong>{item}</strong><p>{item==='Education'?'Your school, grades, clubs and sports.':item==='Work'?'Your job and available opportunities.':'Hobbies and everyday adventures.'}</p><span>Browse now »</span></button>)}</div>:page==='Education'?<>
 <EducationDetails life={life} onAction={onSchoolAction}/>
 {school && life.age>=12 && life.age<18 && <>{(['Clubs','Sports'] as const).map(group=><section key={group} className="school-activity-group" aria-label={group}><h3>{group}</h3><div className="web-list">{schoolActivities.filter(item=>item.group===group).map(item=>{const joined=school.memberships?.includes(item.id),attempt=school.activityAttempts?.[item.id];return <article key={item.id}><Icon kind="activity"/><div><h3>{item.name}</h3><p>{item.description}</p>{attempt?.age===life.age && !attempt.accepted && <small>Not accepted this year. Try again next year.</small>}</div><button disabled={Boolean(life.pendingEvent || joined || attempt?.age===life.age)} onClick={()=>onApplyActivity(item.id)}>{joined?'Member':attempt?.age===life.age?'Attempted':group==='Clubs'?'Apply':'Try out'}</button></article>;})}</div></section>)}</>}
 {graduated && <section aria-label="Further education"><h3>Further education</h3><p>Explore university majors.</p><label className="web-search">Find a major <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search majors"/></label>{majors.filter(major=>matches(major.name)).map(major=><article className="web-listing" key={major.id}><Icon kind="document"/><div><h3>{major.name}</h3><p>{major.description}</p></div><button onClick={()=>onNotice('University applications will be available in a future update.')}>View details »</button></article>)}</section>}
 </>:page==='Work'?<><JobDetails life={life}/>{life.age>=14 && <><label className="web-search">Find a job <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search jobs"/></label>{workCategories(life).map(category=><section key={category} aria-label={`${category} jobs`}><h3>{category} jobs</h3>{(category==='Part-time'?partTimeJobs.map(job=>({id:job.id,title:job.title,text:`${money(job.hourlyWageRange[0])}–${money(job.hourlyWageRange[1])} per hour`})):careers.map(career=>({id:career.id,title:positions.find(job=>job.careerId===career.id)!.title,text:career.description}))).filter(job=>matches(job.title)).map(job=><article className="web-listing" key={job.id}><Icon kind="folder"/><div><h3>{job.title}</h3><p>{job.text}</p></div><button onClick={()=>onNotice('Job applications will be available in a future update.')}>View details »</button></article>)}</section>)}</>}</>:page==='Activities'?<><label className="web-search">Find an activity <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search activities"/></label><div className="web-list">{activities.filter(item=>matches(item.title)).map(item=><article key={item.title}><Icon kind="activity"/><div><h3>{item.title}</h3><p>{item.description}</p></div><button onClick={()=>onActivity(item.title,item.description,item.title==='Play with toys'?'I played with toys.':item.title==='Story time'?'I listened to a story.':item.title==='Take a walk'?'I took a walk.':item.title==='Read a book'?'I read a book.':'I tried a creative hobby.',item.effect as Partial<Stats>)}>Choose »</button></article>)}</div></>:null}
 </div><footer className="web-page-footer">lifeconnect · A world of possibilities.</footer></section><footer className="window-status"><span>Done</span><span>Life portal</span></footer></>;
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
  const descriptions: Record<RelationshipAction, string> = {Befriend:'Get to know them and become friends.','Ask for money':'Ask your parent for some money.', 'Ask out':'See if there is a spark.',Compliment:'Say something kind.',Conversation:'Talk and catch up.',Gift:'Give a thoughtful gift · $25.00','Hook up':'Find out if the feeling is mutual.',Insult:'Say something hurtful.','Spend time':'Make a memory together.',Unfriend:'End your friendship.'};
  return <><div className="messenger-banner"><Icon kind="messenger"/><div><strong>{life.name}</strong><small><span className="online-dot"/> Online</small></div><span className="messenger-wordmark">Messenger</span></div>
    <nav className="messenger-tabs" aria-label="Messenger tabs">{(['Contacts', ...(occupation.job ? ['Work'] : []), ...(occupation.school ? ['School'] : [])] as ('Contacts' | 'Work' | 'School')[]).map(item => <button key={item} className={activeTab === item ? 'messenger-tab-selected' : ''} aria-pressed={activeTab === item} onClick={() => { setTab(item); setSelected(null); }}>{item}</button>)}</nav>
    <div className="messenger-body">
      {person ? <><button className="messenger-back" onClick={() => setSelected(null)}>« Back to contacts</button><div className="contact-heading"><PersonIcon gender={person.gender}/><div><h2>{person.name}</h2><p>{person.relation}{person.status === 'dating' ? ' · Dating' : person.status === 'unfriended' ? ' · Not friends' : ''} · Relationship {person.strength}%</p></div></div><div className="relationship-meter" role="progressbar" aria-label="Relationship strength" aria-valuenow={person.strength} aria-valuemin={0} aria-valuemax={100}><div style={{width:`${person.strength}%`}}/></div>
        <fieldset className="contact-profile"><legend>Character details</legend><dl><div><dt>Gender</dt><dd>{person.gender}</dd></div><div><dt>Age</dt><dd>{person.age}</dd></div><div><dt>Education</dt><dd>{person.education}</dd></div><div><dt>Occupation</dt><dd>{person.occupation}</dd></div></dl></fieldset>
        <fieldset className="contact-statistics"><legend>Character statistics</legend>{Object.entries(person.stats).map(([name, value]) => <div className="stat" key={name}><div className="stat-label"><span>{name}</span><strong>{value}%</strong></div><div className={`stat-track stat-${name.toLowerCase()}`} role="progressbar" aria-label={`${person.name} ${name}`} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div style={{width:`${value}%`}}/></div></div>)}</fieldset>
        {person.parent && <fieldset className="contact-statistics"><legend>Family statistics</legend><div className="stat"><div className="stat-label"><span>Money</span><strong>{Math.round(familyMoney(life.family))}%</strong></div><div className="stat-track stat-money" role="progressbar" aria-label="Money" aria-valuenow={Math.round(familyMoney(life.family))} aria-valuemin={0} aria-valuemax={100}><div style={{width:`${familyMoney(life.family)}%`}}/></div></div></fieldset>}
        <h3 className="social-section-heading">Interactions</h3><div className="contact-action-list">{availableActions(person,life).filter(action => action==='Ask for money' || !actionUnavailable(life,person,action)).map(action => { const unavailable = actionUnavailable(life,person,action); return <button key={action} disabled={Boolean(unavailable)} title={unavailable ?? undefined} onClick={() => onAction(person.id,action)}><Icon kind={action === 'Conversation' ? 'messenger' : action === 'Gift' ? 'folder' : 'people'}/><span><strong>{action}</strong><small>{unavailable ?? descriptions[action]}</small></span><span>›</span></button>; })}</div><p className="messenger-tip">Each interaction affects stats once per person per year.</p>
      </> : <><div className="contacts-heading">{activeTab === 'Work' ? occupation.job?.employer : activeTab === 'School' ? occupation.school ? schoolName(life,occupation.school) : '' : 'Your contacts'}</div>{groups.map(group => <div className="contact-group" key={group}><h3>▾ {group} ({contacts.filter(contact => contact.group === group).length})</h3>{contacts.filter(contact => contact.group === group).map(contact => <button className="contact-row" key={contact.id} onClick={() => setSelected(contact.id)}><PersonIcon gender={contact.gender}/><span><strong>{contact.name}</strong><small>{contact.relation}{contact.status === 'dating' ? ' · Dating' : ''}</small></span><span className="contact-relationship" title={`Relationship: ${contact.strength}%`}><span className="contact-relationship-meter" role="progressbar" aria-label={`Relationship with ${contact.name}`} aria-valuenow={contact.strength} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${contact.strength}%`}}/></span><span className="contact-relationship-value">{contact.strength}%</span></span></button>)}</div>)}<div className="messenger-tip">A little conversation can go a long way.</div></>}
    </div><footer className="window-status"><span>{contacts.length} contacts</span><span>Connected</span></footer></>;
}
