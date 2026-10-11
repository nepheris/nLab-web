(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NLabUniversalInput=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const SCHEMA='nlab.input-result/v1';
  let seq=0;

  function uid(){seq+=1;return 'NLI-'+Date.now().toString(36)+'-'+seq.toString(36)}
  function text(v){return String(v==null?'':v).trim()}
  function digits(v){return text(v).replace(/[^0-9]/g,'')}
  function classifyText(value){
    const raw=text(value),d=digits(raw);
    if(!raw)return {input_type:'empty',normalized:'',confidence:1,metadata:{}};
    if(/^https?:\/\/\S+$/i.test(raw))return {input_type:'url',normalized:raw,confidence:1,metadata:{url:raw}};
    if(/^mailto:\S+$/i.test(raw))return {input_type:'url',normalized:raw,confidence:1,metadata:{url:raw}};
    if(/^[0-9]+$/.test(raw)&&[8,12,13,14].includes(raw.length))return {input_type:'barcode',normalized:raw,confidence:.95,metadata:{symbology_hint:'GTIN/EAN',digits:d}};
    if(/^\(01\)\d{14}/.test(raw)||/^01\d{14}/.test(raw))return {input_type:'structured_code',normalized:raw,confidence:.9,metadata:{symbology_hint:'GS1'}};
    return {input_type:'text',normalized:raw,confidence:.6,metadata:{}};
  }
  function result(base){
    return Object.assign({
      schema:SCHEMA,id:uid(),input_type:'unknown',capture_method:'unknown',raw:null,normalized:null,
      mime_type:null,files:[],relative_paths:[],decoded_payload:null,confidence:null,target:null,metadata:{}
    },base||{});
  }
  function fileRecord(file,relativePath){
    return {name:file&&file.name||'',size:Number(file&&file.size||0),type:file&&file.type||'',last_modified:Number(file&&file.lastModified||0),relative_path:relativePath||file&&file.webkitRelativePath||file&&file.name||'',file};
  }
  function fromText(value,method,target,extra){
    const c=classifyText(value);
    return result({input_type:c.input_type,capture_method:method||'keyboard',raw:text(value),normalized:c.normalized,decoded_payload:c.normalized,confidence:c.confidence,target:target||null,metadata:Object.assign({},c.metadata,extra||{})});
  }
  function fromFiles(files,method,target,paths){
    const list=Array.from(files||[]),records=list.map((f,i)=>fileRecord(f,paths&&paths[i]));
    const kinds=[...new Set(records.map(x=>x.type||'application/octet-stream'))];
    return result({
      input_type:records.length===1&&String(records[0].type).startsWith('image/')?'image':records.length===1?'file':'files',
      capture_method:method||'file_picker',
      mime_type:records.length===1?records[0].type:null,
      files:records,
      relative_paths:records.map(x=>x.relative_path),
      confidence:1,target:target||null,
      metadata:{count:records.length,mime_types:kinds}
    });
  }
  function emit(host,payload){
    if(host&&typeof host.dispatchEvent==='function'&&typeof CustomEvent!=='undefined')host.dispatchEvent(new CustomEvent('nlab:input',{detail:payload,bubbles:true}));
    return payload;
  }
  async function readDirectoryHandle(handle,options,prefix,out){
    options=options||{};prefix=prefix||'';out=out||[];
    for await(const [name,entry] of handle.entries()){
      const rel=prefix?prefix+'/'+name:name;
      if(entry.kind==='file'){const f=await entry.getFile();out.push(fileRecord(f,rel))}
      else if(entry.kind==='directory'&&options.recursive!==false)await readDirectoryHandle(entry,options,rel,out);
    }
    return out.sort((a,b)=>a.relative_path.localeCompare(b.relative_path));
  }
  async function pickDirectory(options){
    options=options||{};
    if(typeof showDirectoryPicker!=='function')throw new Error('DIRECTORY_PICKER_UNAVAILABLE');
    const handle=await showDirectoryPicker({id:options.id||'nlab-input',mode:options.mode||'read'});
    const records=await readDirectoryHandle(handle,options,'',[]);
    return result({input_type:'folder',capture_method:'folder_picker',files:records,relative_paths:records.map(x=>x.relative_path),confidence:1,target:options.target||null,metadata:{directory_name:handle.name,count:records.length,directory_handle:handle}});
  }
  function entryFiles(entry,prefix,out){
    return new Promise((resolve,reject)=>{
      if(!entry)return resolve();
      const rel=prefix?prefix+'/'+entry.name:entry.name;
      if(entry.isFile)return entry.file(f=>{out.push(fileRecord(f,rel));resolve()},reject);
      if(!entry.isDirectory)return resolve();
      const reader=entry.createReader(),all=[];
      const pump=()=>reader.readEntries(entries=>{if(!entries.length){Promise.all(all.map(e=>entryFiles(e,rel,out))).then(()=>resolve(),reject);return}all.push(...entries);pump()},reject);
      pump();
    });
  }
  async function filesFromDrop(dataTransfer){
    const out=[];
    const items=Array.from(dataTransfer&&dataTransfer.items||[]);
    const entries=items.map(i=>typeof i.webkitGetAsEntry==='function'?i.webkitGetAsEntry():null).filter(Boolean);
    if(entries.length){
      for(const e of entries)await entryFiles(e,'',out);
      return out;
    }
    return Array.from(dataTransfer&&dataTransfer.files||[]).map(f=>fileRecord(f,f.webkitRelativePath||f.name));
  }
  function create(options){
    options=Object.assign({accept:'*/*',multiple:true,folder:true,camera:true,codeScan:true,hid:true,dragdrop:true,target:null},options||{});
    if(typeof document==='undefined')throw new Error('DOM_REQUIRED');
    const host=options.host||document.createElement('div');
    host.classList.add('nlab-input');
    host.innerHTML='<div class="nlab-input-drop" data-nli-drop tabindex="0"><strong>Déposer un fichier, une image ou un dossier</strong><span>ou choisir une méthode de saisie</span></div><div class="nlab-input-actions"><button type="button" data-nli-file>Fichier</button><button type="button" data-nli-folder>Dossier</button><button type="button" data-nli-camera>📷 Photo</button><button type="button" data-nli-scan>▣ Scanner code</button></div><div class="nlab-input-scanner" data-nli-scanner hidden><video data-nli-video playsinline muted></video><div class="nlab-input-actions"><button type="button" data-nli-scan-stop>Arrêter la caméra</button></div></div><div class="nlab-input-text"><input data-nli-text type="text" autocomplete="off" placeholder="Code-barres, QR, URL ou texte"><button type="button" data-nli-submit>Valider</button></div><div class="nlab-input-status" data-nli-status></div><input data-nli-file-input type="file" hidden><input data-nli-folder-input type="file" webkitdirectory multiple hidden><input data-nli-camera-input type="file" accept="image/*" capture="environment" hidden>';
    const q=s=>host.querySelector(s),fileInput=q('[data-nli-file-input]'),folderInput=q('[data-nli-folder-input]'),cameraInput=q('[data-nli-camera-input]'),status=q('[data-nli-status]'),folderBtn=q('[data-nli-folder]'),cameraBtn=q('[data-nli-camera]'),scanBtn=q('[data-nli-scan]'),scannerPanel=q('[data-nli-scanner]'),scannerVideo=q('[data-nli-video]'),scannerStop=q('[data-nli-scan-stop]');
    fileInput.accept=options.accept||'*/*';fileInput.multiple=!!options.multiple;if(folderBtn)folderBtn.hidden=options.folder===false;if(cameraBtn)cameraBtn.hidden=options.camera===false;if(scanBtn)scanBtn.hidden=options.codeScan===false;
    const publish=p=>{if(status)status.textContent=p.input_type+' · '+p.capture_method;emit(host,p);if(typeof options.onInput==='function')options.onInput(p);return p};
    q('[data-nli-file]').onclick=()=>fileInput.click();
    q('[data-nli-folder]').onclick=async()=>{try{if(typeof showDirectoryPicker==='function')publish(await pickDirectory({recursive:true,target:options.target,id:options.pickerId}));else folderInput.click()}catch(e){if(e&&e.name!=='AbortError')folderInput.click()}};
    q('[data-nli-camera]').onclick=()=>cameraInput.click();
    let cameraScan=null;
    const stopCameraScan=()=>{if(cameraScan&&cameraScan.stop)try{cameraScan.stop()}catch(e){}cameraScan=null;if(scannerVideo)scannerVideo.srcObject=null;if(scannerPanel)scannerPanel.hidden=true};
    if(scannerStop)scannerStop.onclick=stopCameraScan;
    if(scanBtn)scanBtn.onclick=async()=>{try{stopCameraScan();if(scannerPanel)scannerPanel.hidden=false;if(status)status.textContent='Initialisation caméra…';cameraScan=await startCameraScanner({video:scannerVideo,target:options.target,formats:options.scanFormats||['qr_code','ean_13','ean_8','upc_a','upc_e','code_128','itf','data_matrix'],onScan:p=>{publish(p);stopCameraScan()}});if(status)status.textContent='Caméra active · QR / code-barres / Data Matrix';}catch(e){stopCameraScan();if(status)status.textContent=e&&e.message==='BARCODE_DETECTOR_UNAVAILABLE'?'Décodage caméra natif indisponible · utiliser Photo puis Code Studio.':'Caméra indisponible';if(typeof options.onScanUnavailable==='function')options.onScanUnavailable(e)}};
    q('[data-nli-submit]').onclick=()=>publish(fromText(q('[data-nli-text]').value,'keyboard',options.target));
    q('[data-nli-text]').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();publish(fromText(e.currentTarget.value,'keyboard',options.target))}});
    fileInput.onchange=()=>fileInput.files&&fileInput.files.length&&publish(fromFiles(fileInput.files,'file_picker',options.target));
    folderInput.onchange=()=>folderInput.files&&folderInput.files.length&&publish(fromFiles(folderInput.files,'folder_picker_fallback',options.target));
    cameraInput.onchange=()=>cameraInput.files&&cameraInput.files.length&&publish(fromFiles(cameraInput.files,'mobile_photo',options.target));
    if(options.dragdrop){
      const drop=q('[data-nli-drop]');
      ['dragenter','dragover'].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.add('drag')}));
      ['dragleave','drop'].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.remove('drag')}));
      drop.addEventListener('drop',async e=>{const records=await filesFromDrop(e.dataTransfer);const payload=result({input_type:records.some(x=>x.relative_path.includes('/'))?'folder_drop':records.length===1?'file':'files',capture_method:'drag_drop',files:records,relative_paths:records.map(x=>x.relative_path),confidence:1,target:options.target,metadata:{count:records.length}});publish(payload)});
    }
    let hid=null;
    if(options.hid)hid=enableHidScanner({target:host,targetContext:options.target,onScan:p=>publish(p),minLength:options.hidMinLength||4,maxGapMs:options.hidMaxGapMs||80});
    host.nlabInput={publish,stopCamera:stopCameraScan,destroy(){stopCameraScan();hid&&hid.destroy&&hid.destroy()}};
    return host;
  }
  function enableHidScanner(options){
    options=options||{};const target=options.target||((typeof document!=='undefined')?document:null);if(!target||!target.addEventListener)return {destroy(){}};
    let buf='',last=0,start=0;const maxGap=Number(options.maxGapMs||80),min=Number(options.minLength||4);
    const reset=()=>{buf='';last=0;start=0};
    const keydown=e=>{
      const now=Date.now();
      if(e.key==='Enter'){
        if(buf.length>=min){
          const elapsed=Math.max(1,last-start),avg=elapsed/Math.max(1,buf.length-1);
          if(avg<=maxGap){
            const p=fromText(buf,'hid_scanner',options.targetContext,{average_gap_ms:avg});
            if(typeof options.onScan==='function')options.onScan(p);else emit(target,p);
          }
        }
        reset();return;
      }
      if(e.ctrlKey||e.metaKey||e.altKey||String(e.key||'').length!==1)return;
      if(last&&now-last>maxGap*3)reset();
      if(!start)start=now;buf+=e.key;last=now;
    };
    target.addEventListener('keydown',keydown,true);
    return {destroy(){target.removeEventListener('keydown',keydown,true)},reset};
  }
  async function startCameraScanner(options){
    options=options||{};
    if(typeof navigator==='undefined'||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('CAMERA_UNAVAILABLE');
    if(typeof BarcodeDetector==='undefined')throw new Error('BARCODE_DETECTOR_UNAVAILABLE');
    const formats=options.formats||['qr_code','ean_13','ean_8','code_128','data_matrix'];
    const detector=new BarcodeDetector({formats});
    const video=options.video||document.createElement('video');
    video.setAttribute('playsinline','');video.muted=true;
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
    video.srcObject=stream;await video.play();
    let active=true;
    const stop=()=>{active=false;stream.getTracks().forEach(t=>t.stop())};
    const tick=async()=>{
      if(!active)return;
      try{
        const codes=await detector.detect(video);
        if(codes&&codes.length){
          const c=codes[0],p=fromText(c.rawValue||'','camera_code',options.target,{format:c.format||null,bounding_box:c.boundingBox||null});
          p.input_type=c.format==='qr_code'?'qr':c.format==='data_matrix'?'datamatrix':'barcode';
          if(typeof options.onScan==='function')options.onScan(p);else emit(video,p);
          if(options.continuous!==true){stop();return}
        }
      }catch(e){}
      if(active)(typeof requestAnimationFrame==='function'?requestAnimationFrame:setTimeout)(tick,options.interval||120);
    };
    tick();
    return {video,stream,stop};
  }
  return {SCHEMA,classifyText,result,fromText,fromFiles,pickDirectory,filesFromDrop,create,enableHidScanner,startCameraScanner};
});
