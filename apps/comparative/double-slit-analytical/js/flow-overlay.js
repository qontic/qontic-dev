import {sourceTransverse, sourceCoefficients, sourceEnvelope} from './source-packet-model.js?v=2.108';

// Spatial streamlines of the reduced forward model: dy/dx = v_y/k.
// These are calculated field curves, not measured paths or particle histories.
export function flowSlope(x,y,p,coeff=sourceCoefficients(p)) {
 const g=sourceTransverse(y,x,p,coeff);
 return g.rho>1e-20 && Number.isFinite(g.v) ? g.v/p.k : NaN;
}
export function traceFlow(seed,p,coeff=sourceCoefficients(p),steps=360) {
 const points=[],dx=(p.screen-p.wall)/steps;
 let x=p.wall+1e-8,y=seed;
 for(let i=0;i<=steps;i++) {
  points.push([x,y]);
  const a=flowSlope(x,y,p,coeff),b=flowSlope(x+dx/2,y+dx*a/2,p,coeff),c=flowSlope(x+dx/2,y+dx*b/2,p,coeff),d=flowSlope(x+dx,y+dx*c,p,coeff);
  if(![a,b,c,d].every(Number.isFinite))break;
  y+=dx*(a+2*b+2*c+d)/6;x+=dx;
 }
 return points;
}
export function mountFlowOverlay({host,redraw}) {
 const panel=document.createElement('fieldset');panel.className='packet-settings flow-settings';
 panel.innerHTML='<legend>Flow visualization · 2D</legend><div class="flow-control-row"><label class="flow-toggle"><input id="flow-arrows" aria-label="Flow arrows" type="checkbox"> Arrows</label><label class="flow-toggle"><input id="flow-lines" type="checkbox"> Streamlines</label><div class="flow-spacing"><label for="flow-spacing">Spacing</label><input id="flow-spacing" aria-label="Arrow spacing" type="range" min="24" max="80" value="44"><output>44 px</output></div></div><div class="input-group packet-inline"><label for="flow-length">Arrow length</label><input id="flow-length" type="range" min="6" max="28" value="14"><output>14 px</output></div><p style="font-size:12px;line-height:1.45">Calculated current velocity in all three views. Orange streamlines are field curves; PW particle trails show individual histories. Arrow lengths are normalized for readability.</p><p id="flow-status" role="status" style="font-size:12px"></p>';
 host.append(panel);
 const arrows=panel.querySelector('#flow-arrows'),lines=panel.querySelector('#flow-lines'),spacing=panel.querySelector('#flow-spacing'),length=panel.querySelector('#flow-length'),status=panel.querySelector('#flow-status');
 for(const input of panel.querySelectorAll('input'))input.addEventListener('input',()=>{if(input.type==='range')input.nextElementSibling.textContent=input.value+' px';redraw();});
 let cachedKey='',paths=[];
 return {draw({ctx,p,coeff,pulses,t,X,Y,width,height,yOffset,surfaceView}) {
  status.textContent=surfaceView?'Switch to 2D to see the flow overlay.':p.whichPath?'Flow overlay paused during which-slit detection.':'';
  if(surfaceView||p.whichPath||(!arrows.checked&&!lines.checked))return;
  const density=(x,y)=>{
   let envelope=0;
   for(const c of pulses)envelope+=sourceEnvelope(x,t-c.born,p).rho*(c.branching?1:(c.active+c.pending)/Math.max(1,c.count-c.absorbed));
   return sourceTransverse(y,x,p,coeff).rho*envelope;
  };
  const spacingPx=+spacing.value,samples=[];let peak=0;
  const left=Math.max(0,X(p.initialCenter-6*p.sx)),right=Math.min(width,X(p.screen));
  for(let px=left+spacingPx/2;px<right;px+=spacingPx)for(let py=spacingPx/2;py<height;py+=spacingPx){
   const x=p.wall+(px-X(p.wall))/(X(p.wall+1)-X(p.wall)),y=(py-Y(0))/(Y(1)-Y(0)),rho=density(x,y);
   samples.push({px,py,x,y,rho});peak=Math.max(peak,rho);
  }
  if(peak<1e-20)return;
  ctx.save();ctx.beginPath();ctx.rect(0,0,right,height);ctx.clip();
  if(lines.checked){
   const key=JSON.stringify(p);
   if(key!==cachedKey){cachedKey=key;paths=[];for(const center of p.centers)for(const offset of [-1.5,-1,-.5,0,.5,1,1.5])paths.push(traceFlow(center+offset*p.sy,p,coeff));}
   ctx.strokeStyle='#ffad4a';ctx.lineWidth=1.25;
   for(const path of paths)for(let i=1;i<path.length;i++){
    const [x,y]=path[i],rho=density(x,y);if(rho<peak*.002)continue;
    ctx.globalAlpha=Math.min(.85,Math.sqrt(rho/peak));ctx.beginPath();ctx.moveTo(X(path[i-1][0]),Y(path[i-1][1]));ctx.lineTo(X(x),Y(y));ctx.stroke();
   }
  }
  if(arrows.checked){ctx.strokeStyle='#ffe14a';ctx.lineWidth=1.6;ctx.shadowColor='#17252f';ctx.shadowBlur=2;for(const s of samples){
   if(s.rho<peak*.002)continue;
   const slope=flowSlope(s.x,s.y,p,coeff);if(!Number.isFinite(slope))continue;
   const angle=Math.atan2(slope*(Y(1)-Y(0)),X(1)-X(0)),l=+length.value,dx=Math.cos(angle),dy=Math.sin(angle),ex=s.px+l*dx/2,ey=s.py+l*dy/2;
   ctx.globalAlpha=.3+.6*Math.min(1,Math.sqrt(s.rho/peak));ctx.beginPath();ctx.moveTo(s.px-l*dx/2,s.py-l*dy/2);ctx.lineTo(ex,ey);ctx.moveTo(ex-4*dx+3*dy,ey-4*dy-3*dx);ctx.lineTo(ex,ey);ctx.lineTo(ex-4*dx-3*dy,ey-4*dy+3*dx);ctx.stroke();
  }}ctx.restore();
 }};
}
