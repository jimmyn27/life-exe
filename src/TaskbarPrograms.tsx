import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Icon, type IconKind } from './ClassicUI';
import { reorderVisible } from './desktopLayout';
import { windowIds, type DesktopWindows, type WindowId } from './windowManager';

type Props = { windows: DesktopWindows | null; activeId?: WindowId; titles: Record<WindowId, string>; icons: Record<WindowId, IconKind>; onClick: (id: WindowId) => void };
export default function TaskbarPrograms({ windows, activeId, titles, icons, onClick }: Props) {
  const [order, setOrder] = useState<WindowId[]>([]);
  const opened = useRef<Partial<Record<WindowId, number>>>({});
  useEffect(() => {
    if (!windows) return;
    const live = windowIds.filter(id => windows[id].status !== 'closed');
    const added = live.filter(id => opened.current[id] !== windows[id].openedAt).sort((a, b) => windows[a].openedAt - windows[b].openedAt);
    setOrder(previous => {
      const next = [...previous.filter(id => live.includes(id) && !added.includes(id)), ...added];
      return next.length === previous.length && next.every((id, i) => id === previous[i]) ? previous : next;
    });
    opened.current = Object.fromEntries(live.map(id => [id, windows[id].openedAt]));
  }, [windows]);
  const [dragging, setDragging] = useState<WindowId | null>(null);
  const root = useRef<HTMLElement>(null);
  const gesture = useRef<{ id: WindowId; pointer: number; startX: number; startY: number; moved: boolean; original: WindowId[] } | null>(null);
  const suppressClick = useRef(false);
  const visible = order.filter(id => windows && windows[id].status !== 'closed');
  function begin(e: PointerEvent<HTMLButtonElement>, id: WindowId) {
    if (e.button !== 0) return;
    suppressClick.current = false;
    gesture.current = { id, pointer: e.pointerId, startX: e.clientX, startY: e.clientY, moved: false, original: order };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent<HTMLElement>) {
    const current = gesture.current;
    if (!current || current.pointer !== e.pointerId) return;
    if (!current.moved && Math.hypot(e.clientX - current.startX, e.clientY - current.startY) < 6) return;
    if (!current.moved) root.current?.setPointerCapture(e.pointerId);
    current.moved = true; suppressClick.current = true; setDragging(current.id);
    const others = [...(root.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])].filter(button => button.dataset.program !== current.id);
    const index = others.filter(button => { const rect = button.getBoundingClientRect(); return e.clientX > rect.left + rect.width / 2; }).length;
    setOrder(previous => reorderVisible(previous, visible, current.id, index));
  }
  function end(e: PointerEvent<HTMLElement>, cancel = false) {
    const current = gesture.current;
    if (!current || current.pointer !== e.pointerId) return;
    if (cancel) setOrder(current.original);
    // Pointer capture targets the nav; a drag must never trigger a window toggle.
    suppressClick.current = current.moved;
    gesture.current = null; setDragging(null);
    if (root.current?.hasPointerCapture(e.pointerId)) root.current.releasePointerCapture(e.pointerId);
  }
  return <nav ref={root} className="taskbar-apps" aria-label="Open programs" onPointerMove={move} onPointerUp={e => end(e)} onPointerCancel={e => end(e, true)} onLostPointerCapture={e => { if (!root.current?.hasPointerCapture(e.pointerId)) { gesture.current = null; setDragging(null); } }} onClickCapture={e => { if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); suppressClick.current = false; } }}>
    {visible.map(id => <button key={id} data-program={id} className={`task-button ${activeId === id ? 'pressed' : ''} ${dragging === id ? 'task-dragging' : ''}`} aria-pressed={activeId === id} aria-label={titles[id]} title={windows?.[id].status === 'minimized' ? `Restore ${titles[id]}` : titles[id]} onPointerDown={e => begin(e, id)} onClick={() => onClick(id)} onKeyDown={e => {
      suppressClick.current = false;
      if (e.ctrlKey && ['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); const target = visible.indexOf(id) + (e.key === 'ArrowLeft' ? -1 : 1); setOrder(previous => reorderVisible(previous, visible, id, target)); }
    }}><Icon kind={icons[id]}/><span>{titles[id]}</span></button>)}
  </nav>;
}
