export function dragGeometry(start,kind,dx,dy){
 const total=(start.wall??225)+start.distance;
 const wall=kind==='wall'?Math.max(Math.max(50,total-1000),Math.min(1000,total-50,Math.round((start.wall??225)+dx/start.scaleX))):(start.wall??225);
 const distance=kind==='distance'?Math.round(start.distance+dx/start.scaleX):start.distance;
 const height=kind==='height'?Math.round((start.height+2*dy/start.scaleY)/10)*10:start.height;
 return {wall,distance:kind==='wall'?total-wall:Math.max(50,Math.min(1000,distance)),height:Math.max(100,Math.min(5000,height))};
}
export function trimTail(path,length){
 if(length<=0){path.length=0;return;}
 let travelled=0;
 for(let i=path.length-1;i>0;i--){
  const a=path[i],b=path[i-1],d=Math.hypot(a[0]-b[0],a[1]-b[1]);
  if(travelled+d>length){const f=(length-travelled)/d;path.splice(0,i,[a[0]+f*(b[0]-a[0]),a[1]+f*(b[1]-a[1])]);return;}
  travelled+=d;
 }
}
export function tailOpacity(done,at,now){return done?Math.max(0,1-(now-at)/.8):1;}
export function mountPacketGeometry({host,getGeometry,onCommit,onPreview=()=>{},pause,resume}){
 const layer=document.createElement('div');layer.className='packet-geometry';
 layer.innerHTML='<button type="button" class="packet-detector-drag" aria-label="Move detector screen" title="Drag left or right to move the detector; arrow keys also work; changing geometry starts a new record">↔</button><button type="button" class="packet-height-drag" aria-label="Resize screen height" title="Drag up or down to change screen height; arrow keys also work">↕</button><button type="button" class="packet-wall-drag" aria-label="Move slit wall" title="Drag left or right to move the slit wall. The detector stays in place; changing geometry starts a new record. Arrow keys also work.">↔</button><div class="packet-geometry-guide" hidden></div><output class="packet-geometry-value" hidden></output>';
 host.append(layer);const [detector,height,wall]=layer.querySelectorAll('button'),guide=layer.querySelector('div'),value=layer.querySelector('output');let drag=null,previewFrame=null;
 function preview(){if(previewFrame===null)previewFrame=requestAnimationFrame(()=>{previewFrame=null;if(drag)onPreview(drag.next);});}
 function update(){
  const g=getGeometry();if(!g)return;
  layer.hidden=!!g.busy;wall.style.left=(100*g.wallFraction)+'%';
  detector.style.left=(100*g.detectorFraction)+'%';height.style.left=(100*g.detectorFraction)+'%';
  detector.setAttribute('aria-description','Detector distance '+g.distance+' nm. Moving the detector starts a new record.');
  height.setAttribute('aria-description','Screen height '+g.height+' nm. Resizing starts a new record.');
 }
 function finish(commit){
  if(!drag)return;const d=drag;drag=null;guide.hidden=value.hidden=true;
  if(previewFrame!==null){cancelAnimationFrame(previewFrame);previewFrame=null;}
  try{if(commit)onCommit(d.next);}finally{onPreview(null);resume(d.running);update();}
 }
 for(const [button,kind] of [[detector,'distance'],[height,'height'],[wall,'wall']]){
  button.addEventListener('pointerdown',e=>{
   if(e.button!==0||drag)return;e.preventDefault();e.stopPropagation();
   const g=getGeometry();drag={kind,start:g,x:e.clientX,y:e.clientY,next:{wall:g.wall,distance:g.distance,height:g.height},running:pause()};
   button.setPointerCapture(e.pointerId);value.hidden=false;value.textContent=(kind==='wall'?g.wall:kind==='distance'?g.distance:g.height)+' nm';guide.hidden=false;
   guide.style.left=kind==='wall'?wall.style.left:detector.style.left;
  });
  button.addEventListener('pointermove',e=>{
   if(!drag||drag.kind!==kind)return;
   const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.next=dragGeometry(drag.start,kind,dx,dy);preview();
   value.textContent=(kind==='wall'?'Slit wall: '+drag.next.wall:kind==='distance'?'Detector distance: '+drag.next.distance:'Screen height: '+drag.next.height)+' nm';
   if(kind!=='height')guide.style.left=Math.max(0,Math.min(host.clientWidth,(kind==='wall'?drag.start.wallFraction:drag.start.detectorFraction)*host.clientWidth+dx))+'px';
  });
  button.addEventListener('pointerup',()=>finish(true));
  button.addEventListener('pointercancel',()=>finish(false));
  button.addEventListener('lostpointercapture',()=>finish(false));
  button.addEventListener('keydown',e=>{
   if(e.key==='Escape'){e.preventDefault();finish(false);return;}
   if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
   e.preventDefault();const g=getGeometry(),step=e.shiftKey?50:10;
   const sign=['ArrowRight','ArrowUp'].includes(e.key)?1:-1;onCommit(dragGeometry(g,kind,sign*step*g.scaleX,(e.key==='ArrowDown'||e.key==='ArrowRight'?1:-1)*step*g.scaleY/2));update();
  });
 }
 return {update};
}