/* Guide Froid V2 · A06 — tests de non-perte (exécution dans la console de dossiers/)
 * Collez ce script dans la console de l'atelier de développement après avoir chargé app.js.
 * Aucun accès réseau, aucune modification du dossier courant.
 */
(function(){
 'use strict';
 const fixtures=[
  {label:'Legacy + champs inconnus',input:{id:'POS-ARM-001',title:'Frigo',site:'NANG',fabricant:'Marque historique',customVendorCode:'XYZ',visites:[{id:'VIS-1',note:'préservée'}]}},
  {label:'V2 imbriqué',input:{appareil:{id:'NEG-COF-001',designationLocale:'Congélateur',site:{code:'BRAY'},brand:'Marque V2',model:'V2-AB',serial:'SN42',configuration:{froid:'congelateur',forme:'horizontale',nombreAcces:2},usages:{fonctions:['stockage'],denrees:['Surgelés']},customExtension:{batch:99}},visites:[{id:'VIS-2',status:'legacy'}],meta:{source:'test'}}},
  {label:'Legacy avec valeurs déjà définies',input:{id:'POS-CHF-001',title:'Titre canonique',designationLocale:'Titre secondaire',fabricant:'Fabricant original',brand:'Autre marque',site:'SITE-X',volumeNet:484,capaciteNetteLitres:999,extra:{a:1}}}
 ];
 let failures=0;
 const assert=(x,m)=>{if(!x){failures++;console.error('FAIL',m)}};
 for(const f of fixtures){
  const d=normalizeImportedDevice(structuredClone(f.input));
  const re=JSON.parse(JSON.stringify(d));
  assert(d.id===(f.input.appareil||f.input).id,f.label+' ID');
  assert(Array.isArray(d.visites),f.label+' visites');
  if(f.input.customVendorCode)assert(re.customVendorCode==='XYZ',f.label+' champ inconnu');
  if(f.input.appareil){
   assert(re.fabricant==='Marque V2',f.label+' marque');
   assert(re.site==='BRAY',f.label+' site');
   assert(re.familleFroid==='congelateur',f.label+' froid');
   assert(re.configuration.nombreAcces===2,f.label+' configuration brute');
   assert(re.extensionsLegacy.importRoot.meta.source==='test',f.label+' enveloppe originale');
  }
  if(f.input.fabricant)assert(re.fabricant===f.input.fabricant,f.label+' fabricant canonique prioritaire');
  if(f.input.volumeNet)assert(re.volumeNet===484,f.label+' volume net canonique prioritaire');
 }
 console[failures?'error':'info']('GF2-A06 — '+(failures?'FAIL '+failures:'PASS '+fixtures.length+' fixtures'));
 return {fixtures:fixtures.length,failures};
})();
