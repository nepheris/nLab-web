/** Quote semicolon-delimited CSV for spreadsheet safety. Displayed values stay untrusted. */
export function csvCell(value){
 let s=String(value??'');
 // Excel, LibreOffice and other importers may execute cells beginning with formula
 // operators. Include leading whitespace/control characters in detection.
 if(/^[\s\u0000-\u001f]*[=+\-@]/u.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
}
