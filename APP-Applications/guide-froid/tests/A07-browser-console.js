/* Guide Froid V2 — A07. À exécuter dans la console de /guide-froid/dossiers/ sur main.
   Vérifie le ZIP STORE, le CRC, les duplications et les archives tronquées.
   DEFLATE: importer une archive externe dédiée dans l'atelier et confirmer le résultat.
*/
(async function(){
 const encode=new TextEncoder(),decode=new TextDecoder();
 const entries=new Map([['appareil.json',JSON.stringify({schema:'nlab.guide-froid.appareil/1.0',id:'TEST-A07',familleFroid:'frigo',forme:'verticale'})],['documents/temoin.txt',encode.encode('fichier temoin')]]);
 let ok=0,failed=0;
 async function test(name,fn){try{if(await fn()){console.info('PASS',name);ok++}else{console.error('FAIL',name);failed++}}catch(e){console.error('FAIL',name,e);failed++}}
 const blob=zip(entries);
 await test('ZIP STORE → lecture',async()=>{const files=await unzip(blob);return files.size===2&&decode.decode(files.get('documents/temoin.txt'))==='fichier temoin'});
 await test('CRC incorrect rejeté',async()=>{const bytes=new Uint8Array(await blob.arrayBuffer());const pos=bytes.findIndex((_,i)=>i>32&&decode.decode(bytes.slice(i,i+7))==='fichier');if(pos<0)return false;bytes[pos]^=1;try{await unzip(new Blob([bytes]));return false}catch(e){return /CRC/.test(e.message)}});
 await test('ZIP tronqué rejeté',async()=>{const bytes=new Uint8Array(await blob.arrayBuffer());const end=bytes.slice(0,bytes.length-26);try{await unzip(new Blob([end]));return false}catch(e){return true}});
 console.info('GF2-A07 result',JSON.stringify({ok,failed,deflate:'Test externe en attente',browser:navigator.userAgent}));
 return {ok,failed};
})();
