import { useState } from 'react';
import { Icon } from './ClassicUI';

type Shortcut = 'recycle' | 'life';
const shortcuts = [{ id: 'recycle' as const, name: 'Recycle Bin', icon: 'recycle' as const }, { id: 'life' as const, name: 'My Life', icon: 'computer' as const }];
export default function DesktopIcons({ onOpenLife }: { onOpenLife: () => void }) {
  const [selected, setSelected] = useState<Shortcut | null>(null);
  return <nav className="desktop-shortcuts" aria-label="Desktop shortcuts">{shortcuts.map((shortcut, index) =>
    <button key={shortcut.id} className={selected === shortcut.id ? 'icon-selected' : ''} style={{ left: 8, top: 12 + index * 76 }} draggable={false} onDragStart={e => e.preventDefault()} title={shortcut.id === 'recycle' ? 'Reserved for a future feature' : 'Double-click to open My Life'} onClick={() => setSelected(shortcut.id)} onDoubleClick={() => { if (shortcut.id === 'life') onOpenLife(); }} onKeyDown={e => {
      if (e.key === 'Enter') { e.preventDefault(); if (shortcut.id === 'life') onOpenLife(); }
    }}><Icon kind={shortcut.icon}/><span>{shortcut.name}</span></button>
  )}</nav>;
}
