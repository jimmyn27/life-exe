import { useEffect, useRef, useState, type RefObject } from 'react';
import { Icon } from './ClassicUI';
import type { Life } from './saves';

function PaneDivider({ orientation, value, onChange, container, label }: { orientation: 'horizontal' | 'vertical'; value: number; onChange: (value: number) => void; container: RefObject<HTMLDivElement | null>; label: string }) {
  const dragging = useRef(false);
  const clamp = (next: number) => Math.max(20, Math.min(70, next));
  return <div role="separator" tabIndex={0} aria-label={label} aria-orientation={orientation} aria-valuemin={20} aria-valuemax={70} aria-valuenow={Math.round(value)} className={`pane-divider divider-${orientation}`}
    onPointerDown={e => { if (e.button !== 0) return; e.preventDefault(); dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); }}
    onPointerMove={e => { if (!dragging.current || !container.current) return; const bounds = container.current.getBoundingClientRect(); onChange(clamp(orientation === 'horizontal' ? (e.clientY - bounds.top) / bounds.height * 100 : (e.clientX - bounds.left) / bounds.width * 100)); }}
    onPointerUp={e => { dragging.current = false; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }}
    onPointerCancel={() => { dragging.current = false; }} onLostPointerCapture={() => { dragging.current = false; }}
    onKeyDown={e => { const decrease = orientation === 'horizontal' ? 'ArrowUp' : 'ArrowLeft'; const increase = orientation === 'horizontal' ? 'ArrowDown' : 'ArrowRight'; if (e.key === decrease || e.key === increase) { e.preventDefault(); onChange(clamp(value + (e.key === decrease ? -5 : 5))); } }}/>
}

export function Lookout({ life, onRead, onAction, onArchive }: { life: Life; onRead: (id: string, read: boolean) => void; onAction: (id: string) => void; onArchive: (id: string, archived: boolean) => void }) {
  const inbox = life.inbox ?? [];
  const [folder, setFolder] = useState<'Inbox' | 'Archive'>('Inbox');
  const [selected, setSelected] = useState<string | null>(null);
  const [listHeight, setListHeight] = useState(45);
  const [folderWidth, setFolderWidth] = useState(23);
  const layoutRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const messages = inbox.filter(item => Boolean(item.archived) === (folder === 'Archive'));
  const mail = messages.find(item => item.id === selected);
  const unread = inbox.filter(item => !item.archived && !item.read).length;
  const pending = inbox.filter(item => item.decision === undefined).length;
  useEffect(() => { if (!messages.some(item => item.id === selected)) setSelected(null); }, [inbox, folder, selected]);
  function changeFolder(next: 'Inbox' | 'Archive') { setFolder(next); setSelected(null); }
  return <><div className="menu-bar"><span className="lookout-brand">Lookout Express</span></div>
    <div className="xp-toolbar mail-toolbar"><Icon kind="mail"/><strong>{folder}</strong><span className="toolbar-divider"/>
      <button disabled={!mail} onClick={() => mail && onRead(mail.id, !mail.read)}>{mail?.read ? 'Mark unread' : 'Mark read'}</button>
      <button disabled={!mail || mail.decision === undefined} title={mail?.decision === undefined ? 'Respond before archiving this message' : undefined} onClick={() => mail && onArchive(mail.id, !mail.archived)}>{folder === 'Archive' ? 'Move to Inbox' : 'Archive'}</button>
    </div>
    <div className="lookout-layout" ref={layoutRef}>
      <aside className="lookout-folders" style={{ flexBasis: `${folderWidth}%` }}><h3>Folders</h3><nav aria-label="Mail folders"><button className={folder === 'Inbox' ? 'selected-folder' : ''} aria-pressed={folder === 'Inbox'} onClick={() => changeFolder('Inbox')}><Icon kind="mail"/><strong>Inbox ({unread})</strong></button><button className={folder === 'Archive' ? 'selected-folder' : ''} aria-pressed={folder === 'Archive'} onClick={() => changeFolder('Archive')}><Icon kind="folder"/>Archive</button></nav></aside>
      <PaneDivider orientation="vertical" value={folderWidth} onChange={setFolderWidth} container={layoutRef} label="Resize mail folders"/>
      <div className="lookout-main" ref={mainRef} aria-label="Email inbox">
        <div className="mail-list" style={{ flexBasis: `${listHeight}%` }} aria-label="Messages"><div className="mail-list-heading"><span>From / Subject</span><span>Received</span></div>
          {[...messages].reverse().map(item => <button key={item.id} aria-label={`${item.read ? 'Read' : 'Unread'}: ${item.event.title}, Age ${item.age}${item.decision === undefined ? ', action required' : ''}`} className={`mail-row ${!item.read ? 'unread' : ''} ${item.id === selected ? 'selected' : ''}`} onClick={() => { setSelected(item.id); onRead(item.id, true); }}><Icon kind="mail"/><span><strong>{item.event.title}</strong><small>{item.sender}{item.decision === undefined ? ' · Action required' : ''}</small></span><time>Age {item.age}</time></button>)}
          {!messages.length && <p className="mail-empty-list">{folder === 'Archive' ? 'No archived messages.' : 'No messages yet.'}</p>}
        </div>
        <PaneDivider orientation="horizontal" value={listHeight} onChange={setListHeight} container={mainRef} label="Resize message list"/>
        <article className="mail-reading" aria-label="Email contents">{mail ? <><header><h2>{mail.event.title}</h2><dl><div><dt>From:</dt><dd>{mail.sender}</dd></div><div><dt>To:</dt><dd>{life.name}</dd></div><div><dt>Received:</dt><dd>01/01/{life.birthYear + mail.age} · Age {mail.age}</dd></div></dl></header><p className="mail-text">{mail.event.text}</p>
          {mail.decision === undefined ? <div className="mail-action"><button className="classic-button" onClick={() => onAction(mail.id)}>Respond to offer…</button><p>This message needs a response before you can age up.</p></div> : <div className="mail-resolved"><strong>Response sent: {mail.event.choices[mail.decision].label}</strong><p>{mail.event.choices[mail.decision].outcome}</p></div>}
        </> : <div className="lookout-empty"><Icon kind="mail"/><h2>{messages.length ? 'Select a message' : 'Welcome to Lookout'}</h2><p>Job offers, university acceptances, and other mail arrive here.</p><p>Drag the dividers to adjust your panes.</p></div>}</article>
      </div>
    </div><footer className="window-status"><span>{messages.length} messages · {unread} unread in Inbox</span><span>{pending} requiring action</span></footer></>;
}
