import{loadPersonalProfile,getPersonalAsset}from'./personal-profile-service.js';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KINDS={
 signature:{list:'signatures',label:'Signatures'},initials:{list:'initialsImages',label:'Paraphes'},logo:{list:'logos',label:'Logos'},'stamp-image':{list:'stampImages',label:'Images de tampons'},'personal-image':{list:'personalImages',label:'Images personnelles'}
};
export class AssetPicker extends EventTarget{
 constructor({host,kinds=['logo','stamp-image','personal-image'],value='',allowNone=true,labelNone='Aucun'}={}){
  super();this.host=typeof host==='string'?document.querySelector(host):host;this.kinds=kinds;this.value=value;this.allowNone=allowNone;this.labelNone=labelNone;this.urls=[];this.render()
 }
 refs(){const p=loadPersonalProfile(),a=p.assets||{},out=[];for(const k of this.kinds){const cfg=KINDS[k];if(!cfg)continue;for(const r of a[cfg.list]||[])out.push({...r,kind:k,group:cfg.label})}return out}
 clearUrls(){for(const u of this.urls)URL.revokeObjectURL(u);this.urls=[]}
 async render(){if(!this.host)return;this.clearUrls();const refs=this.refs(),groups=new Map();for(const r of refs){if(!groups.has(r.group))groups.set(r.group,[]);groups.get(r.group).push(r)}
  this.host.classList.add('assetPicker');
  this.host.innerHTML=(this.allowNone?'<button type="button" class="assetPickerItem none '+(!this.value?'active':'')+'" data-asset-id=""><span class="assetPickerThumb">∅</span><span>'+esc(this.labelNone)+'</span></button>':'')+[...groups].map(([g,list])=>'<details class="assetPickerGroup" open><summary>'+esc(g)+' <small>'+list.length+'</small></summary><div class="assetPickerGrid">'+list.map(r=>'<button type="button" class="assetPickerItem '+(r.assetId===this.value?'active':'')+'" data-asset-id="'+esc(r.assetId)+'" data-asset-kind="'+esc(r.kind)+'"><span class="assetPickerThumb" data-asset-thumb="'+esc(r.assetId)+'">…</span><span>'+esc(r.label||r.name||r.assetId)+'</span></button>').join('')+'</div></details>').join('');
  this.host.querySelectorAll('[data-asset-id]').forEach(b=>b.onclick=()=>{this.value=b.dataset.assetId||'';this.host.querySelectorAll('.assetPickerItem').forEach(x=>x.classList.toggle('active',x===b));this.dispatchEvent(new CustomEvent('change',{detail:{assetId:this.value,kind:b.dataset.assetKind||null,ref:refs.find(x=>x.assetId===this.value)||null}}))});
  for(const r of refs){const n=this.host.querySelector('[data-asset-thumb="'+CSS.escape(r.assetId)+'"]');if(!n)continue;try{const a=await getPersonalAsset(r.assetId);if(a?.blob){const u=URL.createObjectURL(a.blob);this.urls.push(u);n.innerHTML='<img src="'+u+'" alt="">'}else n.textContent='?'}catch{n.textContent='!'}}
 }
 setValue(v){this.value=v||'';this.host?.querySelectorAll('.assetPickerItem').forEach(x=>x.classList.toggle('active',(x.dataset.assetId||'')===this.value))}
 destroy(){this.clearUrls();if(this.host)this.host.innerHTML=''}
}
export function mountAssetPicker(host,options={}){return new AssetPicker({host,...options})}
