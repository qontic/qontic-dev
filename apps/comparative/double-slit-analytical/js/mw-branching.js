// A visual tour of detector records, not propagation of separate world wavefunctions.
export function mountMWBranching({host,controls,isMW,isRunning}) {
  const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./mw-branching.css?v=28.1',import.meta.url);document.head.append(style);
  const settings=document.createElement('div');settings.className='mw-branch-settings';
  settings.innerHTML=`<label><input type="checkbox" id="mw-branch-tour"> Slow-motion branching</label><label class="mw-follow" hidden>Follow branch <select aria-label="Follow branch"><option value="auto">Automatically (Born weights)</option><option value="manual">Choose myself</option></select></label><small class="mw-follow" hidden>One view per detector pixel. Try 10–20 pixels in Advanced for larger views.</small>`;
  controls.append(settings);
  const enabled=settings.querySelector('input'),mode=settings.querySelector('select');
  const overlay=document.createElement('div');overlay.className='mw-branch-overlay';overlay.hidden=true;
  overlay.innerHTML='<div class="mw-branch-status" role="status"></div><div class="mw-branch-scroll"><div class="mw-branch-grid"></div></div><canvas class="mw-branch-zoom"></canvas>';
  host.append(overlay);
  const status=overlay.querySelector('[role=status]'),scroll=overlay.querySelector('.mw-branch-scroll'),grid=overlay.querySelector('.mw-branch-grid'),zoom=overlay.querySelector('.mw-branch-zoom');
  let active=null;
  const cancel=()=>{if(!active)return;cancelAnimationFrame(active.frame);active=null;overlay.hidden=true;grid.replaceChildren();zoom.hidden=true;};
  const sync=()=>{settings.hidden=!isMW();settings.querySelectorAll('.mw-follow').forEach(el=>el.hidden=!enabled.checked);if(!isMW()||!enabled.checked)cancel();};
  enabled.addEventListener('change',sync);mode.addEventListener('change',cancel);
  // Cancel before existing input handlers can replace geometry or the record.
  for(const type of ['input','change']) document.addEventListener(type,event=>{
    if(active&&!settings.contains(event.target)&&!overlay.contains(event.target))cancel();
  },true);
  for(const id of ['resampleHitsButton','resetBranches']) document.getElementById(id)?.addEventListener('click',cancel,true);
  // Mode switches can originate in several existing controls.
  const observer=new MutationObserver(sync);observer.observe(document.getElementById('sharedControls'),{attributes:true,attributeFilter:['interpretation']});sync();
  const begin=({selected,weights,detectorFraction,onSelect})=>{
    if(active||!enabled.checked||!isMW())return false;
    const snapshot=document.createElement('canvas');snapshot.width=host.clientWidth;snapshot.height=host.clientHeight;
    const ctx=snapshot.getContext('2d');
    for(const id of ['setupCanvas','waveCanvas','partCanvas']){const layer=document.getElementById(id);ctx.drawImage(layer,0,0,snapshot.width,snapshot.height);}
    overlay.hidden=false;zoom.hidden=true;scroll.hidden=false;scroll.scrollTop=0;grid.replaceChildren();
    const count=weights.length,aspect=snapshot.width/snapshot.height;
    // Fit all views when legible; narrower screens can scroll through larger tiles.
    const ideal=Math.ceil(Math.sqrt(count*host.clientWidth/(Math.max(100,host.clientHeight-40)*aspect)));
    let columns=Math.max(1,Math.min(ideal,Math.floor(host.clientWidth/88)));
    if(host.clientWidth>=600){
      while(columns<count && Math.ceil(count/columns)*((host.clientWidth/columns-5)/aspect+23)>host.clientHeight-40) columns++;
    }
    grid.style.gridTemplateColumns=`repeat(${columns},minmax(0,1fr))`;
    active={frame:0,elapsed:0,last:performance.now(),selected:null,zoomTime:0,buttons:[],snapshot};
    const session=active;
    const choose=index=>{
      if(active!==session||session.selected!==null||!isRunning()||weights[index]<=0)return;
      session.selected=index;session.zoomTime=0;
      const tile=session.buttons[index];tile.scrollIntoView({block:'nearest',inline:'nearest'});
      const r=tile.querySelector('canvas').getBoundingClientRect(),h=host.getBoundingClientRect();
      session.from={x:r.left-h.left,y:r.top-h.top,w:r.width,h:r.height};
      zoom.width=snapshot.width;zoom.height=snapshot.height;zoom.hidden=false;
      status.textContent=`Following pixel ${index+1} · other branches continue`;
    };
    const paint=(target,index,w,h)=>{
      target.drawImage(snapshot,0,0,w,h);
      const x=detectorFraction*w,y=(index+.5)/count*h;
      target.fillStyle='#ffe476';target.fillRect(x-2,index/count*h,5,Math.max(2,h/count));
      target.beginPath();target.arc(x,y,Math.max(2,Math.min(6,w*.025)),0,Math.PI*2);target.fill();
    };
    weights.forEach((weight,index)=>{
      const button=document.createElement('button');button.type='button';button.className='mw-branch-tile';
      const percent=(100*weight).toPrecision(3)+'%';button.setAttribute('aria-label',`Follow pixel ${index+1}, weight ${percent}`);button.title=`Pixel ${index+1} · Born weight ${percent}`;
      button.disabled=mode.value!=='manual'||weight<=0;
      const miniature=document.createElement('canvas');miniature.width=192;miniature.height=Math.round(192/aspect);paint(miniature.getContext('2d'),index,miniature.width,miniature.height);
      const label=document.createElement('span');label.textContent=`${index+1} · ${percent}`;button.append(miniature,label);button.addEventListener('click',()=>choose(index));grid.append(button);session.buttons.push(button);
    });
    const tick=now=>{
      if(active!==session)return;
      if(!isMW()||!enabled.checked){cancel();return;}
      const dt=Math.min(100,now-session.last);session.last=now;
      if(isRunning()){
        session.elapsed+=dt;
        if(session.selected===null){
          status.textContent=mode.value==='manual'?`${count} outcome branches · choose a pixel to follow`:`${count} outcome branches · following one by Born weight…`;
          if(mode.value==='auto'&&session.elapsed>=1000)choose(selected);
        }else{
          session.zoomTime+=dt;const t=Math.min(1,session.zoomTime/650),ease=t*t*(3-2*t),r=session.from;
          const z=zoom.getContext('2d');z.clearRect(0,0,zoom.width,zoom.height);z.fillStyle='#0b1725';z.fillRect(0,0,zoom.width,zoom.height);
          z.save();z.translate(r.x*(1-ease),r.y*(1-ease));paint(z,session.selected,r.w+(zoom.width-r.w)*ease,r.h+(zoom.height-r.h)*ease);z.restore();
          if(session.zoomTime>=1250){const index=session.selected;cancel();onSelect(index);return;}
        }
      }else status.textContent='Paused · press Start to continue branching';
      session.frame=requestAnimationFrame(tick);
    };
    session.frame=requestAnimationFrame(tick);return true;
  };
  return {get enabled(){return enabled.checked&&isMW();},get busy(){return !!active;},begin,cancel};
}
