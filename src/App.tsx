import {manageSchoolActivity} from './schoolActivities';
import type {MembershipAction} from './schoolCommitments';
import SchoolDancePanel from './SchoolDancePanel';
import {schoolDance,type DanceOutcome,type DanceMode} from './schoolDance';
import { playSystemSound } from './sounds';
import { personAddress } from './personAddress';
import { interactionResult, type InteractionResult } from './interactionResults';
import { giftOptions } from './gifts';
import {applySchoolActivity} from './schoolActivities';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { initialStats, type Choice, type LifeEvent, type Stats } from './data';
import { Icon, TitleBar, type IconKind } from './ClassicUI';
import FloatingWindow from './FloatingWindow';
import DesktopIcons from './DesktopIcons';
import TaskbarPrograms from './TaskbarPrograms';
import { CommandPrompt, FileExplorer, MyLife, Messenger, WebSurfer, programs, type ExplorerPage } from './Programs';
import { activateWindow, createDesktopWindows, fitRect, minimumSize, taskbarWindow, windowIds, type Bounds, type DesktopWindows, type Rect, type WindowId } from './windowManager';
import { clearPrototypeSaves, emptyStore, lifeDate, loadStore, persistStore, restartLife, upsertLife, type Life, type SaveStore, type Sexuality } from './saves';
import { generateFamily } from './family';
import { schoolAction, type SchoolAction } from './occupation';
import { characters, interact, actionUnavailable, type RelationshipAction } from './relationships';
import { advanceYear, answerLifeEvent } from './mail';
import { cityById, cityOptions, DEFAULT_CITY_ID, displayCity, resolveCity, US_SNAPSHOT } from './catalogs/us/index';

type Mode = 'desktop' | 'login' | 'off';
type Modal = 'new' | 'power' | 'restart' | 'quit' | 'delete' | null;
const titles: Record<WindowId, string> = { Command: 'Command Prompt', Life: 'My Life', Explorer: 'File Explorer', Web: 'Enternet Explorer', Messenger: 'Messenger' };
const icons: Record<WindowId, IconKind> = { Command: 'command', Life: 'computer', Explorer: 'folder', Web: 'web', Messenger: 'messenger' };
function blankLife(): Life { return { id: 'new-life-placeholder', name: 'New Life', firstName: 'New', lastName: 'Life', city: 'New York City', locationId: DEFAULT_CITY_ID, catalogSnapshotId: US_SNAPSHOT.id, age: 0, birthYear: 2000, balance: 0, stats: { ...initialStats }, log: [] }; }
function bootstrap() {
  try {
    clearPrototypeSaves(window.localStorage);
    const store = loadStore(window.localStorage);
    return { store, life: structuredClone(store.lives.find(life => life.id === store.activeId) ?? blankLife()), error: '' };
  } catch { return { store: emptyStore(), life: blankLife(), error: 'Saved characters could not be loaded. Start a new life to begin. If you save again, any unreadable previous save will be kept as a backup.' }; }
}

export default function App() {
  const [boot] = useState(bootstrap);
  const [life, setLife] = useState<Life>(boot.life);
  const [store, setStore] = useState<SaveStore>(boot.store);
  const [dirty, setDirty] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteTarget = store.lives.find(saved => saved.id === deleteId);
  const [modal, setModal] = useState<Modal>(null);
  const [event, setEvent] = useState<LifeEvent | null>(null);
  const [eventSource, setEventSource] = useState<{ kind: 'year' | 'activity' }>({ kind: boot.life.pendingEvent ? 'year' : 'activity' });
  const [result,setResult]=useState<InteractionResult|null>(null);
  const [notice, setNotice] = useState(boot.error);
  const [menu, setMenu] = useState(false);
  const [allPrograms, setAllPrograms] = useState(false);
  const [explorerPage, setExplorerPage] = useState<ExplorerPage>('Assets');
  const [danceOpen,setDanceOpen]=useState(false),[danceOutcome,setDanceOutcome]=useState<DanceOutcome|null>(null);
  const [draftSexuality,setDraftSexuality]=useState<Sexuality>('Straight');
  const [draftFirstName, setDraftFirstName] = useState('');
  const [draftLastName, setDraftLastName] = useState('');
  const [draftCity, setDraftCity] = useState(life.locationId ?? resolveCity(life.city)?.id ?? DEFAULT_CITY_ID);
  const [bounds, setBounds] = useState<Bounds>({ width: window.innerWidth, height: Math.max(1, window.innerHeight - 38) });
  const [windows, setWindows] = useState<DesktopWindows | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const hasModal = Boolean(modal || event || notice || result || danceOpen);
  const ageBlocked = hasModal || Boolean(life.pendingEvent) || life.age >= 1000;
  useEffect(() => {
    if (mode !== 'desktop' || !life.pendingEvent) return;
    // Present decisions after the advanced simulation state has committed and painted.
    const frame = requestAnimationFrame(() => { setEventSource({ kind: 'year' }); setEvent(life.pendingEvent!.event); });
    return () => cancelAnimationFrame(frame);
  }, [life.pendingEvent, mode]);
  const activeId = windows ? windowIds.filter(id => windows[id].status === 'open').sort((a, b) => windows[b].z - windows[a].z)[0] : undefined;
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace || mode !== 'desktop') return;
    const observer = new ResizeObserver(() => {
      const next = { width: Math.max(1, workspace.clientWidth), height: Math.max(1, workspace.clientHeight) };
      setBounds(next);
      setWindows(previous => previous ? Object.fromEntries(windowIds.map(id => [id, { ...previous[id], ...fitRect(previous[id], next, minimumSize[id]) }])) as DesktopWindows : createDesktopWindows(next));
    });
    observer.observe(workspace);
    return () => observer.disconnect();
  }, [mode]);
  useEffect(() => {
    const dialog = modalRef.current;
    if (hasModal && !dialog?.open) dialog?.showModal();
    if (!hasModal && dialog?.open) dialog?.close();
    if (modal === 'new') dialog?.querySelector<HTMLInputElement>('input')?.focus();
  }, [hasModal, modal]);
  useEffect(()=>{if(result)modalRef.current?.querySelector<HTMLButtonElement>('[data-result-ok]')?.focus();},[result]);
  const commandStatus = windows?.Command.status;
  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [life.log, commandStatus]);
  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent) => { if (!(e.target as Element).closest('[data-menu]')) { setMenu(false); setAllPrograms(false); } };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); setAllPrograms(false); } };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, [menu]);
  useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key!=='Escape' || hasModal || menu || mode!=='desktop' || !activeId)return;e.preventDefault();window.dispatchEvent(new CustomEvent('life-back',{detail:activeId}));};document.addEventListener('keydown',escape);return ()=>document.removeEventListener('keydown',escape);},[activeId,hasModal,menu,mode]);
  function focusWindow(id: WindowId) { setWindows(previous => previous ? activateWindow(previous, id) : previous); }
  function openWindow(id: WindowId) { focusWindow(id); setMenu(false); }
  function openMyLife() { openWindow('Life'); }
  function openExplorer() { setExplorerPage('Assets'); openWindow('Explorer'); }
  function minimize(id: WindowId) { setWindows(previous => previous ? { ...previous, [id]: { ...previous[id], status: 'minimized' } } : previous); }
  function closeWindow(id: WindowId) { setWindows(previous => previous ? { ...previous, [id]: { ...previous[id], status: 'closed' } } : previous); }
  function toggleMaximize(id: WindowId) { setWindows(previous => {
    if (!previous) return previous;
    const next = activateWindow(previous, id);
    return { ...next, [id]: { ...next[id], maximized: !previous[id].maximized } };
  }); }
  function setRect(id: WindowId, rect: Rect) { setWindows(previous => previous ? { ...previous, [id]: { ...previous[id], ...rect } } : previous); }
  function taskClick(id: WindowId) { setWindows(previous => previous ? taskbarWindow(previous, id) : previous); setMenu(false); }
  function closeModal() { setDanceOpen(false);setDanceOutcome(null); setResult(null); setDeleteId(null); setEvent(null); setModal(null); setNotice(''); }
  function saveCurrent(announce = false): boolean {
    setMenu(false);
    try {
      const next = upsertLife(store, life);
      persistStore(window.localStorage, next);
      setStore(next); setDirty(false);
      if (announce) { setModal(null); setNotice(`${life.name}'s life has been saved on this device. Age ${life.age} · Year ${life.age}.`); }
      return true;
    } catch { setModal(null); setNotice('Your life could not be saved. Browser storage may be unavailable or full. Your current progress is still open; please do not turn off or reload until saving works.'); return false; }
  }
  function logOff() { setMenu(false); if (!saveCurrent()) return; closeModal(); setMode('login'); }
  function deleteCharacter() {
    if (mode !== 'login' || !deleteTarget) return;
    const next = { ...store, lives: store.lives.filter(saved => saved.id !== deleteTarget.id), activeId: store.activeId === deleteTarget.id ? null : store.activeId };
    try {
      persistStore(window.localStorage, next);
      setStore(next);
      if (life.id === deleteTarget.id) { setLife(blankLife()); setDirty(false); }
      closeModal();
    } catch { setModal(null); setDeleteId(null); setNotice('This life could not be deleted because browser storage is unavailable. Your saved lives have not been changed.'); }
  }
  function switchCharacter(saved: Life) {
    try {
      const next = { ...store, activeId: saved.id };
      persistStore(window.localStorage, next);
      setStore(next); setLife(structuredClone(saved)); setDirty(false); setWindows(createDesktopWindows(bounds)); setExplorerPage('Assets'); setMode('desktop'); playSystemSound('startup'); setEvent(null); setEventSource({ kind: 'year' });
    } catch { setNotice('The character could not be opened because browser storage is unavailable. Your saved characters have not been changed.'); }
  }
  function showNewLife() { setDraftSexuality('Straight'); setDraftFirstName(''); setDraftLastName(''); setDraftCity(life.locationId ?? resolveCity(life.city)?.id ?? DEFAULT_CITY_ID); setModal('new'); setMenu(false); }
  function startLife(e: FormEvent) {
    e.preventDefault(); const firstName = draftFirstName.trim(); const lastName = draftLastName.trim(); if (!firstName || !lastName) return; const name = `${firstName} ${lastName}`;
    const city = cityById(draftCity); if (!city) return;
    if (mode === 'desktop' && !saveCurrent()) return;
    const id = crypto.randomUUID();
    const family = generateFamily(id, lastName);
    const next = restartLife({ ...blankLife(), id, family, name, firstName, lastName, sexuality:draftSexuality, city: city.name, locationId: city.id });
    setLife(next); setDirty(true); setWindows(createDesktopWindows(bounds)); setExplorerPage('Assets'); setMode('desktop'); playSystemSound('startup'); closeModal();
  }
  function ageUp() {
    if (ageBlocked) return;
    const next = advanceYear(life);
    if (next === life) return;
    setLife(next); setDirty(true); setMenu(false); openWindow('Command');
  }
  function resumeEvent() { if (life.pendingEvent) { setEventSource({ kind: 'year' }); setEvent(life.pendingEvent.event); } }
  function choose(choice: Choice, index: number) {
    if (eventSource.kind === 'year') {
      setLife(previous => answerLifeEvent(previous, index)); setDirty(true); setEvent(null);
      openWindow('Command');
      return;
    }
    if(choice.membershipAction){setEvent(null);finishMembershipAction(choice.membershipAction.id,choice.membershipAction.action);return;}
    if(choice.schoolAction){setEvent(null);finishSchoolAction(choice.schoolAction);return;}
    if (choice.relationship) {
      const { id, action, giftId } = choice.relationship;
      const groups=characters(life),person=[...groups.personal,...groups.work,...groups.school].find(item=>item.id===id);
      const next=interact(life,id,action,giftId);
      if(next!==life && person){setLife(next);setDirty(true);setResult(interactionResult(life,next,person,action,giftId));}
      setEvent(null); return;
    }
    if (!choice.outcome) { setEvent(null); return; }
    setLife(previous => {
      const age = previous.age;
      const stats = { ...previous.stats };
      for (const key of Object.keys(choice.effect ?? {}) as (keyof Stats)[]) stats[key] = Math.max(0, Math.min(100, stats[key] + (choice.effect?.[key] ?? 0)));
      return { ...previous, age, stats, log: [...previous.log, { age, tag: 'ACTIVITY', text: choice.outcome }] };
    });
    setDirty(true); setEvent(null); openWindow('Command');
  }
  function activity(title: string, text: string, outcome: string, effect: Partial<Stats>) {
    setEventSource({ kind: 'activity' }); setEvent({ category: 'Activity', title, text, choices: [{ label: 'Try this activity', hint: 'Make a little time for it.', outcome, effect }, { label: 'Maybe another time', hint: 'Return to your day.', outcome: 'I decided to take it easy today.' }] });
  }
  function performSchoolAction(action:SchoolAction) {
    if(action==='School dance'){setDanceOutcome(null);setDanceOpen(true);return;}
    if(action==='Drop out' && life.age<16){setNotice('You must be at least 16 years old to drop out of school.');return;}
    if(action==='Drop out' || action==='Change schools'){
      setEventSource({kind:'activity'});setEvent({category:'School',title:action,text:action==='Drop out'?'Leave high school without a diploma?':'Ask your parents to send you to a different school?',choices:[{label:action==='Drop out'?'Drop out':'Ask my parents',hint:'See what happens.',outcome:'',schoolAction:action},{label:'Cancel',hint:'Return to school.',outcome:''}]});return;
    }
    finishSchoolAction(action);
  }
  function finishSchoolAction(action:SchoolAction) {
    const next=schoolAction(life,action);if(next!==life){setLife(next);setDirty(true);}
    if(action==='Study harder'){const messages=['You studied until the library closed.','You reviewed your notes until late in the evening.','You spent the afternoon working through difficult questions.','You studied until your pencil needed sharpening again.','You made flashcards and reviewed them after dinner.'];setNotice(messages[Math.floor(Math.random()*messages.length)]);}
    else setNotice(next!==life?next.log.at(-1)?.text.replace(/^I /,'You ').replace(/My /g,'Your ')??'':'You already did this school action this year.');
  }
  function membershipAction(id:string,action:MembershipAction,hours?:number) {
    if(action==='Hours'){const next=manageSchoolActivity(life,id,action,hours);if(next!==life){setLife(next);setDirty(true);}return;}
    if(action==='Quit'){setEventSource({kind:'activity'});setEvent({category:'School activity',title:'Leave this activity?',text:'Leave your club or sports team? Your performance and membership will be removed.',choices:[{label:'Quit',hint:'Leave this activity.',outcome:'',membershipAction:{id,action}},{label:'Cancel',hint:'Keep your membership.',outcome:''}]});return;}
    finishMembershipAction(id,action);
  }
  function finishMembershipAction(id:string,action:MembershipAction) {const next=manageSchoolActivity(life,id,action);if(next!==life){setLife(next);setDirty(true);setNotice(next.log.at(-1)?.text.replace(/^I /,'You ')??'');}else setNotice('You put in more effort, but you already received the performance benefit this year.');}
  function resolveDance(mode:DanceMode,id?:string) {const outcome=schoolDance(life,mode,id);if(outcome.life!==life){setLife(outcome.life);setDirty(true);}setDanceOutcome(outcome);}
  function relationshipAction(id: string, action: RelationshipAction) {
    const groups = characters(life); const person = [...groups.personal, ...groups.work, ...groups.school].find(item => item.id === id);
    if (!person || actionUnavailable(life, person, action)) return;
    const target=personAddress(person);
    setEventSource({ kind: 'activity' });
    if(action==='Gift'){setEvent({category:'Gift',title:`Gift · ${target}`,text:'Choose a gift. Their response depends on its value and how appropriate it is.',choices:[...giftOptions().map(gift=>({label:`${gift.name} ($${gift.price})`,hint:life.balance<gift.price?'You cannot afford this gift.':'Give this gift.',disabled:life.balance<gift.price,outcome:'',relationship:{id,action,giftId:gift.id}})),{label:'Cancel',hint:'Return to their profile.',outcome:''}]});return;}
    setEvent({category:'Relationship',title:`${action} · ${target}`,text:action === 'Befriend' ? `Become friends with ${target}?` : action === 'Ask for money' ? `Ask ${target} for money? You can ask each parent once this year.` : action === 'Unfriend' ? `End your friendship with ${target}?` : action === 'Ask out' ? `Ask ${target} out on a date?` : action === 'Compliment' ? `Give ${target} a sincere compliment?` : action === 'Insult' ? `Insult ${target}? This may hurt your relationship.` : action === 'Conversation' ? `Have a conversation with ${target}?` : `Would you like to ${action.toLowerCase()} with ${target}?`,choices:[{label:action,hint:'See how they respond.',outcome:'',relationship:{id,action}},{label:'Cancel',hint:'Return to their profile.',outcome:''}]});
  }
  function turnOff() { playSystemSound('shutdown'); setMode('off'); closeModal(); setMenu(false); }
  function restart() { setLife(previous => restartLife(previous)); setDirty(true); closeModal(); openWindow('Command'); }
  function powerOn() { const saved = store.lives.find(saved => saved.id === store.activeId); setLife(structuredClone(saved ?? blankLife())); setDirty(!saved); setWindows(createDesktopWindows(bounds)); setMode('login'); }
  function about() { setMenu(false); setNotice('Life.exe — Luna edition. Enternet Explorer is for activities, jobs, and education. My Life is your character overview and statistics monitor. File Explorer holds your assets and finances. Messenger is for relationships. Yearly life events appear in pop-ups. Command Prompt records your story. Saves are stored locally in this browser. The date advances once per life year; the world rules remain fixed.'); }
  const dialogTitle = notice ? 'Life.exe' : danceOpen ? 'School dance' : result ? 'Interaction outcome' : modal === 'delete' ? 'Delete saved life' : modal === 'new' ? 'Create a character' : modal === 'power' ? 'Turn off computer' : modal === 'restart' ? 'Restart current life' : modal === 'quit' ? 'Turn off computer' : `${event?.category ?? 'Life event'} — Age ${life.age}`;

  return <div className={`classic-desktop managed-desktop luna-desktop ${mode !== 'desktop' ? 'session-screen' : ''}`}>
    {mode === 'desktop' ? <>
      <div className="desktop-workspace" ref={workspaceRef}>
        <DesktopIcons onOpenLife={openMyLife}/>
        {windows && windowIds.filter(id => windows[id].status !== 'closed').map(id => <FloatingWindow key={`${life.id}:${id}`} id={id} title={titles[id]} icon={icons[id]} state={windows[id]} bounds={bounds} active={activeId === id} className={`program-window program-${id.toLowerCase()}`} onFocus={() => focusWindow(id)} onChange={rect => setRect(id, rect)} onMinimize={() => minimize(id)} onMaximize={() => toggleMaximize(id)} onClose={() => closeWindow(id)}>
          {id === 'Command' ? <CommandPrompt life={life} feedRef={feedRef}/> : id === 'Explorer' ? <FileExplorer life={life} page={explorerPage} onPage={setExplorerPage} onSave={() => saveCurrent(true)} onNotice={setNotice}/> : id === 'Life' ? <MyLife life={life} dirty={dirty} onFinances={() => { setExplorerPage('Finances'); openWindow('Explorer'); }}/> : id === 'Web' ? <WebSurfer life={life} onMembership={membershipAction} onAction={relationshipAction} onActivity={activity} onNotice={setNotice} onSave={() => saveCurrent(true)} onSchoolAction={performSchoolAction} onApplyActivity={id=>{const next=applySchoolActivity(life,id);if(next===life)return;setLife(next);setDirty(true);setNotice(next.log.at(-1)?.text??'');}}/> : <Messenger life={life} onAction={relationshipAction} onOpenLife={openMyLife}/>}
        </FloatingWindow>)}
        <div className="age-up-dock"><span className="age-dock-label">YOUR NEXT CHAPTER</span><button className="classic-button desktop-age-up" disabled={ageBlocked} onClick={ageUp}><span className="age-dock-icon" aria-hidden="true">↑</span><span><strong>Age Up</strong><small>{life.pendingEvent ? "Life event needs a decision" : `Begin age ${life.age + 1}`}</small></span><span className="age-dock-arrow" aria-hidden="true">→</span></button>{life.pendingEvent && !event && <button className="classic-button resume-life-event" onClick={resumeEvent}>Review life event…</button>}</div>
      </div>
      <footer className="taskbar">
        <div className="start-anchor" data-menu>
          <button className={`start-button ${menu ? 'pressed' : ''}`} aria-haspopup="menu" aria-expanded={menu} onClick={() => { setMenu(!menu); setAllPrograms(false); }}><Icon kind="start"/><span>start</span></button>
          {menu && <div className="xp-start-menu" role="menu" aria-label="Start">
            <header className="xp-start-header"><span className="start-user-avatar"><Icon kind="computer"/></span><strong>{life.name}</strong></header>
            <div className="xp-start-columns">
              <div className="xp-start-left">
                {programs.filter(program => program.id !== 'Life').map(program => <button role="menuitem" key={program.id} onClick={() => program.id === 'Explorer' ? openExplorer() : openWindow(program.id)}><Icon kind={program.icon}/><span><strong>{program.name}</strong><small>{program.description}</small></span></button>)}
                <hr/>
                <button className="all-programs-button" role="menuitem" aria-expanded={allPrograms} onClick={() => setAllPrograms(!allPrograms)}>All Programs <span>▶</span></button>
                {allPrograms && <div className="all-programs-menu">{programs.filter(program => program.id !== 'Life').map(program => <button role="menuitem" key={program.id} onClick={() => program.id === 'Explorer' ? openExplorer() : openWindow(program.id)}><Icon kind={program.icon}/>{program.name}</button>)}</div>}
              </div>
              <div className="xp-start-right">
                <button role="menuitem" onClick={openMyLife}><Icon kind="computer"/><strong>My Life</strong></button>
                <button role="menuitem" onClick={() => { setExplorerPage('Assets'); openWindow('Explorer'); }}><Icon kind="folder"/>My Assets</button>
                <hr/><button role="menuitem" onClick={showNewLife}><Icon kind="new"/>New Life…</button>
                <button role="menuitem" onClick={() => saveCurrent(true)}><Icon kind="save"/>Save Life</button>
                <button role="menuitem" onClick={about}><Icon kind="document"/>Help and Support</button>
              </div>
            </div>
            <footer className="xp-start-footer"><button role="menuitem" onClick={logOff}><Icon kind="logoff"/>Log Off</button><button role="menuitem" onClick={() => { setMenu(false); setModal('power'); }}><Icon kind="power"/>Turn Off Computer</button></footer>
          </div>}
        </div>
        <nav className="quick-launch" aria-label="Taskbar shortcuts">{programs.filter(program => ['Web', 'Explorer', 'Messenger'].includes(program.id)).map(program => <button key={program.id} aria-label={`Open ${program.name}`} title={program.name} onClick={() => program.id === 'Explorer' ? openExplorer() : openWindow(program.id)}><Icon kind={program.icon}/></button>)}</nav><span className="taskbar-divider" aria-hidden="true"/>
        <TaskbarPrograms key={life.id} windows={windows} activeId={activeId} titles={titles} icons={icons} onClick={taskClick}/>
        <div className="system-tray" title="Life date · annual progression"><div><span>{lifeDate(life)}</span><span>Year {life.age}</span></div></div>
      </footer>
    </> : mode === 'login' ? <div className="xp-login">
      <div className="xp-login-brand"><Icon kind="start"/><h1>life<span>.exe</span></h1><p>{store.lives.length ? "Choose your character or start a new life." : "Start a new life to begin your story."}</p></div>
      <div className="xp-character-list"><h2>Choose your life</h2>{store.lives.map(saved => <div className="saved-character-row" key={saved.id}><button className="saved-character" onClick={() => switchCharacter(saved)}><span className="login-avatar"><Icon kind="computer"/></span><span><strong>{saved.name}</strong><small>Age {saved.age} · {displayCity(saved)}</small></span></button><button className="delete-character" aria-label={`Delete ${saved.name}\'s life`} title="Delete life" onClick={() => { setDeleteId(saved.id); setModal('delete'); }}>×</button></div>)}<button className="new-character-link" onClick={showNewLife}><Icon kind="new"/>Start a new life</button></div>
      <footer><button onClick={turnOff}><Icon kind="power"/>Turn Off Computer</button><span>Your characters are saved on this device.</span></footer>
    </div> : <div className="xp-off"><Icon kind="start"/><h1>life.exe</h1><p>It is now safe to turn off your computer.</p><small>Your game session has ended.</small><button onClick={powerOn}>Power on</button></div>}
    <dialog ref={modalRef} onCancel={closeModal} className={`classic-window event-dialog ${modal === 'power' ? 'power-dialog' : ''}`} aria-label={dialogTitle}>
      <TitleBar title={dialogTitle} icon={modal === 'power' || modal === 'quit' ? 'power' : modal === 'restart' ? 'restart' : modal === 'new' ? 'new' : 'document'} onClose={closeModal}/>
      {notice ? <>
        <div className="modal-content information-content"><span className="info-symbol" aria-hidden="true">i</span><p>{notice}</p></div><div className="dialog-actions"><button className="classic-button" onClick={closeModal}>OK</button></div>
      </> : danceOpen ? <SchoolDancePanel life={life} outcome={danceOutcome} onResolve={resolveDance} onRetry={()=>setDanceOutcome(null)} onClose={closeModal}/> : result ? <><div className="modal-content"><div className="dialog-intro"><Icon kind="people"/><div><span className="event-eyebrow">Interaction outcome</span><h2>{result.title}</h2></div></div><p className="event-description">{result.text}</p>{result.meter && <div className="result-reaction"><strong>{result.meter.label}</strong><div className={`result-reaction-track ${result.change<0?'reaction-negative':''}`} role="progressbar" aria-label={result.meter.label} aria-valuenow={result.meter.value} aria-valuemin={0} aria-valuemax={100}><div style={{width:`${result.meter.value}%`}}/></div></div>}{result.note && <p className="messenger-tip">{result.note}</p>}</div><div className="dialog-actions"><button className="classic-button" data-result-ok onClick={closeModal}>OK</button></div></> : modal === 'delete' ? <>
        <div className="modal-content"><h2>Delete {deleteTarget?.name}'s life?</h2><p>This permanently deletes this saved life from this device. This cannot be undone.</p></div><div className="dialog-actions"><button className="classic-button" onClick={deleteCharacter} disabled={!deleteTarget}>Delete life</button><button className="classic-button" autoFocus onClick={closeModal}>Cancel</button></div>
      </> : modal === 'power' ? <>
        <div className="power-content"><h2>Turn off computer</h2><div className="power-options"><button onClick={() => saveCurrent(true)}><Icon kind="save"/><span>Save</span></button><button onClick={() => dirty ? setModal('quit') : turnOff()}><Icon kind="power"/><span>Turn off</span></button><button onClick={() => setModal('restart')}><Icon kind="restart"/><span>Restart</span></button></div><p>{dirty ? 'You have unsaved changes.' : 'Your current life is saved.'}</p></div><div className="dialog-actions"><button className="classic-button" onClick={closeModal}>Cancel</button></div>
      </> : modal === 'quit' ? <>
        <div className="modal-content"><h2>Turn off without saving?</h2><p>Unsaved progress in this session will be lost. Your last saved life will stay available.</p></div><div className="dialog-actions"><button className="classic-button" onClick={() => { if (saveCurrent()) turnOff(); }}>Save and turn off</button><button className="classic-button" onClick={turnOff}>Turn off</button><button className="classic-button" onClick={closeModal}>Cancel</button></div>
      </> : modal === 'restart' ? <>
        <div className="modal-content"><h2>Restart {life.name}'s life?</h2><p>Return to age 0 with the same name and birthplace. Current stats and life history will reset.</p><p className="modal-note">The saved version stays unchanged until you save again.</p></div><div className="dialog-actions"><button className="classic-button" onClick={restart}>Restart life</button><button className="classic-button" onClick={closeModal}>Cancel</button></div>
      </> : modal === 'new' ? <form onSubmit={startLife}>
        <div className="modal-content"><div className="dialog-intro"><Icon kind="new"/><div><h2>A new life begins</h2><p>Every story starts at age 0.</p></div></div><label htmlFor="character-first-name">First name:</label><input id="character-first-name" value={draftFirstName} onChange={e => setDraftFirstName(e.target.value)} maxLength={48} autoComplete="given-name" required/><label htmlFor="character-last-name">Last name:</label><input id="character-last-name" value={draftLastName} onChange={e => setDraftLastName(e.target.value)} maxLength={48} autoComplete="family-name" required/><label htmlFor="character-city">Starting city:</label><select id="character-city" value={draftCity} onChange={e => setDraftCity(e.target.value)}>{cityOptions.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}</select><label htmlFor="character-sexuality">Sexuality:</label><select id="character-sexuality" value={draftSexuality} onChange={e=>setDraftSexuality(e.target.value as Sexuality)}>{(['Straight','Bisexual','Gay'] as const).map(value=><option key={value}>{value}</option>)}</select><p className="modal-note">{mode === 'desktop' ? "Your current character is saved before a new life starts." : "Create your character to begin."}</p></div><div className="dialog-actions"><button className="classic-button" type="submit">Start Life</button><button className="classic-button" type="button" onClick={closeModal}>Cancel</button></div>
      </form> : event && <div className="modal-content"><div className="dialog-intro"><Icon kind="people"/><div><span className="event-eyebrow">{eventSource.kind === 'year' ? `Beginning of age ${life.age} · ${event.category}` : event.category}</span><h2>{event.title}</h2></div></div><p className="event-description">{event.text}</p><fieldset className="event-choices"><legend>What will you do?</legend>{event.choices.map((choice, index) => <button className="classic-button choice-button" key={choice.label} disabled={choice.disabled} onClick={() => choose(choice, index)}><strong>{choice.label}</strong><small>{choice.hint}</small></button>)}</fieldset></div>}
    </dialog>
  </div>;
}

