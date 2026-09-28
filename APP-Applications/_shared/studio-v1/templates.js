export const STUDIO_TEMPLATE_PRESETS={
 naming:[
  {id:'original',label:'Nom original',template:'{FILENAME}'},
  {id:'date-name',label:'Date + nom',template:'{DATE:YYYY-MM-DD}_{FILENAME}'},
  {id:'client-ref',label:'Client + référence',template:'{CLIENT}_{REFERENCE}_{FILENAME}'},
  {id:'operation',label:'Nom + opération',template:'{FILENAME}_{OP}'}
 ],
 path:[
  {id:'root',label:'Racine',template:''},
  {id:'treatment',label:'Dossier traitement',template:'{TREATMENT}'},
  {id:'year-month',label:'Année / mois',template:'{YEAR}/{MONTH}'},
  {id:'year-month-week',label:'Année / mois / semaine',template:'{YEAR}/{MONTH}/S{WEEK}'},
  {id:'treatment-date',label:'Traitement / année / mois',template:'{TREATMENT}/{YEAR}/{MONTH}'}
 ],
 header:[
  {id:'file-date',label:'Fichier + date',left:'{FILENAME}',center:'',right:'{DATE:DD/MM/YYYY}'},
  {id:'client-ref',label:'Client / référence',left:'{CLIENT}',center:'{REFERENCE}',right:'{DATE:DD/MM/YYYY}'}
 ],
 footer:[
  {id:'page',label:'Pagination',left:'{INITIALS}',center:'Page {PAGE}/{PAGES}',right:'{DATETIME}'},
  {id:'validation',label:'Validation',left:'{SERVICE}',center:'{STAMP_LABEL}',right:'{STAMP_DATE:DD/MM/YYYY}'}
 ],
 stamp:[
  {id:'valid',label:'VALIDÉ',template:'VALIDÉ · {INITIALS} · {STAMP_DATE:DD/MM/YYYY}',filenamePrefix:'',filenameSuffix:'_VALIDE'},
  {id:'date',label:'DATE',template:'{STAMP_DATE:DD/MM/YYYY}',filenamePrefix:'',filenameSuffix:'_{STAMP_DATE:YYYY-MM-DD}'},
  {id:'received',label:'REÇU',template:'REÇU le {DATE_A:DD/MM/YYYY} · {INITIALS}',filenamePrefix:'RECU_',filenameSuffix:''},
  {id:'nc',label:'NON CONFORME',template:'NON CONFORME · {DATE_B:DD/MM/YYYY} · {INITIALS}',filenamePrefix:'NC_',filenameSuffix:''},
  {id:'display',label:'AFFICHÉ JUSQU’AU',template:'AFFICHÉ · jusqu’au {DATE_C:DD/MM/YYYY}',filenamePrefix:'',filenameSuffix:'_AFFICHE'}
 ]
};
export function presetBy(kind,id){return(STUDIO_TEMPLATE_PRESETS[kind]||[]).find(x=>x.id===id)||null}
