export class StudioPluginRegistry{
  constructor(){this.plugins=new Map();this.enabled=new Set()}
  register(plugin){
    if(!plugin?.id)throw new Error('Plugin id requis');
    this.plugins.set(plugin.id,plugin);
    if(plugin.enabledByDefault!==false)this.enabled.add(plugin.id);
    return this;
  }
  enable(id,on=true){on?this.enabled.add(id):this.enabled.delete(id);return this}
  isEnabled(id){return this.enabled.has(id)}
  active(){return [...this.plugins.values()].filter(p=>this.enabled.has(p.id))}
  compose(base={}){
    const out={
      ...base,
      menus:[...(base.menus||[])],
      ribbon:[...(base.ribbon||[])],
      sections:[...(base.sections||[])],
      capabilities:[...(base.capabilities||[])]
    };
    for(const p of this.active()){
      if(p.menus)out.menus.push(...p.menus);
      if(p.ribbon)out.ribbon.push(...p.ribbon);
      if(p.sections)out.sections.push(...p.sections);
      if(p.capabilities)out.capabilities.push(...p.capabilities);
    }
    return out;
  }
}
export function createStudioPlugin(def={}){return{enabledByDefault:true,scope:'studio',...def}}
