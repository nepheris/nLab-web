import{qs,qsa}from'./core.js';

export class StudioShell{
  constructor(manifest={}){
    this.manifest=manifest;
    this.handlers=new Map();
  }
  on(action,fn){this.handlers.set(action,fn);return this}
  emit(action,payload){
    const fn=this.handlers.get(action);
    if(fn)return fn(payload);
    document.dispatchEvent(new CustomEvent('studio:action',{detail:{action,payload,studio:this.manifest.id}}));
  }
  mount(){
    document.body.dataset.studioId=this.manifest.id||'studio';
    this.applyIdentity();
    this.renderMenus();
    this.renderRibbon();
    this.renderSidebar();
    this.applyDevelopmentStates();
    return this;
  }
  applyIdentity(){
    qs('[data-studio-name]')&&(qs('[data-studio-name]').textContent=this.manifest.name||'Studio');
    qs('[data-studio-subtitle]')&&(qs('[data-studio-subtitle]').textContent=this.manifest.subtitle||'nLab Studio');
  }
  renderMenus(){
    const root=qs('[data-studio-slot="menu"]');if(!root||!Array.isArray(this.manifest.menus))return;
    root.innerHTML=this.manifest.menus.map((m,i)=>'<button data-studio-menu="'+m.id+'" class="'+(i===0?'active':'')+'">'+m.label+'</button>').join('');
    root.addEventListener('click',e=>{
      const b=e.target.closest('[data-studio-menu]');if(!b)return;
      qsa('[data-studio-menu]',root).forEach(x=>x.classList.toggle('active',x===b));
      this.emit('menu:'+b.dataset.studioMenu,{id:b.dataset.studioMenu});
    });
  }
  renderRibbon(){
    const root=qs('[data-studio-slot="ribbon"]');if(!root||!Array.isArray(this.manifest.ribbon))return;
    root.innerHTML=this.manifest.ribbon.map(g=>{
      const items=(g.items||[]).map(it=>{
        const dev=it.status==='development'?'<small class="devBadge">DEV</small>':'';
        return '<button class="ribbonBtn '+(it.primary?'primary ':'')+(it.status==='development'?'devFeatureBtn':'')+'" data-studio-action="'+it.action+'" title="'+(it.title||it.label||'')+'">'+(it.icon||'')+'<span>'+it.label+'</span>'+dev+'</button>';
      }).join('');
      return '<div class="ribbonGroup" data-ribbon-group="'+g.id+'">'+items+'<span class="ribbonLabel">'+(g.label||g.id)+'</span></div>';
    }).join('');
    root.addEventListener('click',e=>{
      const b=e.target.closest('[data-studio-action]');if(b)this.emit(b.dataset.studioAction,{element:b});
    });
  }
  renderSidebar(){
    const root=qs('[data-studio-slot="sidebar"]');if(!root||!Array.isArray(this.manifest.sections))return;
    root.innerHTML=this.manifest.sections.map((s,i)=>{
      const dev=s.status==='development'?'<span class="devBadge">DÉVELOPPEMENT</span>':'';
      return '<details class="sidebarSection" id="'+s.id+'" '+(s.open||i===0?'open':'')+'><summary><span class="fullLabel">'+s.label+' '+dev+'</span><span class="shortLabel">'+(s.short||s.label.slice(0,3))+'</span></summary><div class="studioSidebarBody" data-studio-section="'+s.id+'"></div></details>';
    }).join('');
  }
  setSectionContent(id,content){
    const el=qs('[data-studio-section="'+id+'"]');if(!el)return;
    if(typeof content==='string')el.innerHTML=content;
    else if(content instanceof Node){el.innerHTML='';el.appendChild(content)}
  }
  openSection(id){
    const el=qs('#'+CSS.escape(id));if(el){el.open=true;el.scrollIntoView({behavior:'smooth',block:'nearest'})}
  }
  applyDevelopmentStates(){
    qsa('[data-feature-status="development"]').forEach(el=>el.classList.add('devFeature'));
  }
}

export function createStudioManifest(overrides={}){
  return {
    schema:'nlab-studio-manifest/v1',
    id:'studio',
    name:'nLab Studio',
    subtitle:'Studio Core V1',
    menus:[],
    ribbon:[],
    sections:[],
    capabilities:[],
    ...overrides
  };
}
