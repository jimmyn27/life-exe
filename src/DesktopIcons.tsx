import {useState} from 'react';
import {Icon} from './ClassicUI';
import type {WindowId} from './windowManager';
const shortcuts=[{id:'recycle',name:'Recycle Bin',icon:'recycle',left:8,top:12},{id:'Life',name:'My Life',icon:'computer',left:104,top:12},{id:'Web',name:'Enternet Explorer',icon:'web',left:8,top:96},{id:'Messenger',name:'Messenger',icon:'messenger',left:8,top:180}] as const;
export default function DesktopIcons({onOpen}:{onOpen:(id:WindowId)=>void}) {
 const [selected,setSelected]=useState<string|null>(null);
 return <nav className="desktop-shortcuts" aria-label="Desktop shortcuts">{shortcuts.map(shortcut=><button key={shortcut.id} className={selected===shortcut.id?'icon-selected':''} style={{left:shortcut.left,top:shortcut.top}} draggable={false} onDragStart={e=>e.preventDefault()} title={shortcut.id==='recycle'?'Reserved for a future feature':`Open ${shortcut.name}`} onClick={()=>{setSelected(shortcut.id);if(shortcut.id!=='recycle')onOpen(shortcut.id);}}><Icon kind={shortcut.icon}/><span>{shortcut.name}</span></button>)}</nav>;
}
