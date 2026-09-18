import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { fitRect, moveRect, resizeRect, minimumSize, type Bounds, type Rect, type ResizeEdge, type WindowId, type WindowState } from './windowManager';
import { TitleBar, type IconKind } from './ClassicUI';

const edges: ResizeEdge[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
const edgeNames = { n: 'top edge', ne: 'top right corner', e: 'right edge', se: 'bottom right corner', s: 'bottom edge', sw: 'bottom left corner', w: 'left edge', nw: 'top left corner' };
type Props = { id: WindowId; title: string; icon: IconKind; state: WindowState; bounds: Bounds; active: boolean; className?: string; children: ReactNode; onFocus: () => void; onChange: (rect: Rect) => void; onMinimize: () => void; onMaximize: () => void; onClose: () => void };

export default function FloatingWindow({ id, title, icon, state, bounds, active, className = '', children, onFocus, onChange, onMinimize, onMaximize, onClose }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const gesture = useRef<{ pointerId: number; originX: number; originY: number; rect: Rect; edge: ResizeEdge | 'move' } | null>(null);
  const rect = state.maximized ? { x: 0, y: 0, ...bounds } : fitRect(state, bounds, minimumSize[id]);
  const style: CSSProperties = { left: rect.x, top: rect.y, width: rect.width, height: rect.height, zIndex: state.z, display: state.status === 'minimized' ? 'none' : undefined };
  function begin(e: PointerEvent, edge: ResizeEdge | 'move') {
    if (e.button !== 0 || state.maximized || (e.target as Element).closest('.window-controls')) return;
    e.preventDefault();
    gesture.current = { pointerId: e.pointerId, originX: e.clientX, originY: e.clientY, rect, edge };
    rootRef.current?.setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent) {
    const current = gesture.current;
    if (!current || current.pointerId !== e.pointerId) return;
    const dx = e.clientX - current.originX;
    const dy = e.clientY - current.originY;
    onChange(current.edge === 'move' ? moveRect(current.rect, dx, dy, bounds) : resizeRect(current.rect, current.edge, dx, dy, bounds, minimumSize[id]));
  }
  function end(e: PointerEvent) {
    gesture.current = null;
    if (rootRef.current?.hasPointerCapture(e.pointerId)) rootRef.current.releasePointerCapture(e.pointerId);
  }
  function keyboardResize(e: KeyboardEvent, edge: ResizeEdge) {
    const step = e.shiftKey ? 1 : 10;
    const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (!delta[e.key]) return;
    e.preventDefault(); onFocus();
    onChange(resizeRect(rect, edge, ...delta[e.key], bounds, minimumSize[id]));
  }
  return <section ref={rootRef} className={`classic-window floating-window ${className} ${state.maximized ? 'is-maximized' : ''}`} style={style} aria-label={title} data-window={id} onPointerDownCapture={onFocus} onFocusCapture={onFocus} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={() => { gesture.current = null; }}>
    <TitleBar title={title} icon={icon} inactive={!active} onMinimize={onMinimize} onMaximize={onMaximize} onClose={onClose} maximized={state.maximized} onPointerDown={e => begin(e, 'move')} onDoubleClick={e => { if (!(e.target as Element).closest('.window-controls')) onMaximize(); }}/>
    <div className="floating-window-body">{children}</div>
    {!state.maximized && edges.map(edge => <button key={edge} className={`resize-handle resize-${edge}`} aria-label={`Resize ${title} ${edgeNames[edge]}`} onPointerDown={e => begin(e, edge)} onKeyDown={e => keyboardResize(e, edge)}/>)}
  </section>;
}
