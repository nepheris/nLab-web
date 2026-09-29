const ICONS={
file:'<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/></svg>',
folder:'<svg viewBox="0 0 24 24"><path d="M3 6h7l2 2h9v10H3z"/></svg>',
save:'<svg viewBox="0 0 24 24"><path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8V3M8 16h8"/></svg>',
add:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
delete:'<svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V4h6v3M8 7l1 13h6l1-13"/></svg>',
rotateLeft:'<svg viewBox="0 0 24 24"><path d="M7 8H3V4"/><path d="M4 8a8 8 0 1 1-1 7"/></svg>',
rotateRight:'<svg viewBox="0 0 24 24"><path d="M17 8h4V4"/><path d="M20 8a8 8 0 1 0 1 7"/></svg>',
history:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2M4 4v5h5"/></svg>',
help:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.3 2.2c-.8.4-1.1.9-1.1 1.8M12 17h.01"/></svg>',
preview:'<svg viewBox="0 0 24 24"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/></svg>',
ocr:'<svg viewBox="0 0 24 24"><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><path d="M7 12h10M7 9h10M7 15h7"/></svg>',
qr:'<svg viewBox="0 0 24 24"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM15 15h2v2h-2zM19 14h2v3h-2zM14 19h3v2h-3zM19 19h2v2h-2z"/></svg>',
translate:'<svg viewBox="0 0 24 24"><path d="M4 5h9M8 3v2M6 8c1.5 3 3.5 5 6 6M12 8c-1 3-3 5-6 7M14 19l3-8 3 8M15 16h4"/></svg>',
settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.8-1L14.4 3h-4.8l-.3 3.1a8 8 0 0 0-1.8 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.8 1l.3 3.1h4.8l.3-3.1a8 8 0 0 0 1.8-1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z"/></svg>',
command:'<svg viewBox="0 0 24 24"><path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4"/></svg>',
workflow:'<svg viewBox="0 0 24 24"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10M6 8l5 8M18 8l-5 8"/></svg>'
};
export function icon(name,{className='studioIcon'}={}){const svg=ICONS[name]||ICONS.command;return svg.replace('<svg ','<svg class="'+className+'" aria-hidden="true" ')}
export function hasIcon(name){return !!ICONS[name]}
export const iconNames=()=>Object.keys(ICONS);
