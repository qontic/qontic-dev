// Optional model-independent canvas tools. All geometry and units come from adapters.
function styles() {
  if (document.querySelector('link[data-qontic-overlays]')) return;
  const link=document.createElement('link');link.rel='stylesheet';
  link.href=new URL('./qontic-overlays.css?v=1',import.meta.url);
  link.dataset.qonticOverlays='';document.head.append(link);
}
export function mountDistanceScale({host,getUnitsPerPixel,format=v=>String(v),storageKey,onVisibilityChange=()=>{}}) {
  styles();
  const element=document.createElement('div');element.className='qontic-distance-scale';
  element.tabIndex=0;element.setAttribute('role','button');
  element.setAttribute('aria-label','Move distance scale');
  element.title='Drag to move scale · arrow keys to move · Home to reset';
  const canvas=document.createElement('canvas');canvas.style.zIndex='30';element.append(canvas);host.append(element);
  let position={x:8,y:8},visible=true,opacity=1,drag;
  if(storageKey)try{const saved=JSON.parse(localStorage.getItem(storageKey));if(Number.isFinite(saved?.x)&&Number.isFinite(saved?.y))position=saved;}catch(_){}
  const place=()=>{position.x=Math.max(0,Math.min(position.x,host.clientWidth-element.offsetWidth));position.y=Math.max(0,Math.min(position.y,host.clientHeight-element.offsetHeight));element.style.left=position.x+'px';element.style.top=position.y+'px';};
  const save=()=>{if(storageKey)try{localStorage.setItem(storageKey,JSON.stringify(position));}catch(_){}};
  const nice=v=>{const p=10**Math.floor(Math.log10(v));return ([5,2,1].find(n=>n*p<=v)||1)*p;};
  const update=()=>{
    element.hidden=!visible || opacity<=0;if(element.hidden)return;
    place();
    const dpr=devicePixelRatio||1,w=154,h=126;
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.globalAlpha=opacity;
    ctx.fillStyle='rgba(8,20,32,.8)';ctx.fillRect(0,0,w,h);
    const metrics=getUnitsPerPixel(),ux=metrics.x,uy=metrics.y;
    if(!(ux>0&&uy>0))return;
    const x=nice(90*ux),y=nice(72*uy),dx=x/ux,dy=y/uy;
    ctx.strokeStyle='#f1f8fc';ctx.fillStyle='#f1f8fc';ctx.lineWidth=1.5;ctx.font='12px Inter,Arial,sans-serif';
    ctx.beginPath();ctx.moveTo(12,14);ctx.lineTo(12+dx,14);ctx.moveTo(12,10);ctx.lineTo(12,18);ctx.moveTo(12+dx,10);ctx.lineTo(12+dx,18);
    ctx.moveTo(12,40);ctx.lineTo(12,40+dy);ctx.moveTo(8,40);ctx.lineTo(16,40);ctx.moveTo(8,40+dy);ctx.lineTo(16,40+dy);ctx.stroke();
    ctx.textAlign='center';ctx.fillText(format(x),12+dx/2,31);ctx.textAlign='left';ctx.fillText(format(y),21,44+dy/2);
    ctx.globalAlpha=1;
  };
  element.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();element.focus();drag={x:event.clientX,y:event.clientY,px:position.x,py:position.y};element.setPointerCapture(event.pointerId);});
  element.addEventListener('pointermove',event=>{if(!drag)return;position={x:drag.px+event.clientX-drag.x,y:drag.py+event.clientY-drag.y};place();});
  element.addEventListener('pointerup',()=>{drag=null;save();});
  element.addEventListener('pointercancel',()=>{drag=null;});
  element.addEventListener('keydown',event=>{const delta={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[event.key];if(!delta&&event.key!=='Home')return;event.preventDefault();event.stopPropagation();position=delta?{x:position.x+delta[0],y:position.y+delta[1]}:{x:8,y:8};place();save();});
  const observer=new ResizeObserver(update);observer.observe(host);update();
  return {canvas,update,getVisible:()=>visible&&opacity>0,setVisible(value){visible=!!value;update();onVisibilityChange(visible);},setOpacity(value){opacity=Math.max(0,Math.min(1,value));update();},destroy(){observer.disconnect();element.remove();}};
}

export function mountValueRange({host,label='Display range',onChange=()=>{},format=v=>Number(v).toPrecision(3)}) {
  styles();host.classList.add('qontic-value-range');host.replaceChildren();host.setAttribute('role','group');host.setAttribute('aria-label',label);
  let state={min:0,max:1,lower:0,upper:1};
  const low=document.createElement('input'),high=document.createElement('input');
  for(const [input,name] of [[low,'Lower'],[high,'Upper']]){input.type='range';input.min='0';input.max='1000';input.step='1';input.setAttribute('aria-label',name+' '+label);host.append(input);input.addEventListener('keydown',e=>e.stopPropagation());}
  const upper=document.createElement('output'),lower=document.createElement('output');upper.className='qontic-range-upper';lower.className='qontic-range-lower';host.append(upper,lower);
  const sync=()=>{const span=state.max-state.min;if(!(span>0))return;low.value=Math.round((state.lower-state.min)/span*1000);high.value=Math.round((state.upper-state.min)/span*1000);upper.textContent=format(state.upper);lower.textContent=format(state.lower);low.setAttribute('aria-valuetext',format(state.lower));high.setAttribute('aria-valuetext',format(state.upper));};
  const change=input=>{if(input===low)low.value=Math.min(+low.value,+high.value-1);else high.value=Math.max(+high.value,+low.value+1);const span=state.max-state.min;state.lower=state.min+(+low.value/1000)*span;state.upper=state.min+(+high.value/1000)*span;sync();onChange({lower:state.lower,upper:state.upper});};
  low.addEventListener('input',()=>change(low));high.addEventListener('input',()=>change(high));sync();
  return {setState(next){if(![next.min,next.max,next.lower,next.upper].every(Number.isFinite)||next.max<=next.min)return;state={...next,lower:Math.max(next.min,Math.min(next.lower,next.max)),upper:Math.max(next.min,Math.min(next.upper,next.max))};if(state.upper<=state.lower){state.lower=state.min;state.upper=state.max;}sync();},destroy(){host.replaceChildren();host.classList.remove('qontic-value-range');}};
}
