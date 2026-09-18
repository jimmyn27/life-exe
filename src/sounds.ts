let current:HTMLAudioElement|undefined;
export function playSystemSound(event:'startup'|'shutdown') {current?.pause();current=new Audio(`/audio/xp-${event}.wav`);current.volume=.5;void current.play().catch(()=>{});}
