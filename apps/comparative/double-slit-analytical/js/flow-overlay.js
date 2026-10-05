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
 panel.innerHTML='<legend>Flow visualization · 2D <span class="flow-help" tabindex="0" aria-label="About the flow visualization" title="Calculated current velocity in all three views. Yellow arrows move along the calculated flow; they are sampling markers, not individual particles. Orange streamlines are field curves; PW particle trails show individual histories. Arrow lengths are normalized for readability. Separation sets the spacing between streamlines.">ⓘ</span></legend><div class="flow-control-row"><label class="flow-toggle"><input id="flow-arrows" aria-label="Flow arrows" type="checkbox"> Arrows</label></div><div class="input-group packet-inline"><label for="flow-length">Arrow length</label><input id="flow-length" type="range" min="6" max="28" value="14"><output>14 px</output></div><div class="flow-control-row"><label class="flow-toggle"><input id="flow-lines" type="checkbox"> Streamlines</label><div class="flow-spacing"><label for="flow-spacing">Separation</label><input id="flow-spacing" aria-label="Streamline separation" type="range" min="4" max="30" value="8"><output>8 px</output></div></div><p id="flow-status" role="status" style="font-size:12px" hidden></p>';
 host.append(panel);
 const arrows=panel.querySelector('#flow-arrows'),lines=panel.querySelector('#flow-lines'),spacing=panel.querySelector('#flow-spacing'),length=panel.querySelector('#flow-length'),status=panel.querySelector('#flow-status');
 for(const input of panel.querySelectorAll('input'))input.addEventListener('input',()=>{if(input.type==='range')input.nextElementSibling.textContent=input.value+' px';redraw();});
 let cachedKey='',paths=[],incidentSeeds=[];
 return {draw({ctx,p,coeff,pulses,t,X,Y,width,height,yOffset,surfaceView}) {
  const message=surfaceView?'Switch to 2D to see the flow overlay.':p.whichPath?'Flow overlay paused during which-slit detection.':'';
  if(status.textContent!==message)status.textContent=message;status.hidden=!message;
  if(surfaceView||p.whichPath||(!arrows.checked&&!lines.checked))return;
  const density=(x,y)=>{
   let envelope=0;
   for(const c of pulses)envelope+=sourceEnvelope(x,t-c.born,p).rho*(c.branching?1:(c.active+c.pending)/Math.max(1,c.count-c.absorbed));
   return sourceTransverse(y,x,p,coeff).rho*envelope;
  };
  const scaleY=Y(1)-Y(0),scaleX=X(1)-X(0),separation=+spacing.value/Math.abs(scaleY);
  const key=JSON.stringify([p,+spacing.value,scaleY]);
  if(key!==cachedKey){
   cachedKey=key;paths=[];incidentSeeds=[];
   for(const center of p.centers){
    const count=Math.max(2,Math.min(32,Math.ceil(3*p.sy/separation)));
    for(let i=0;i<=count;i++)paths.push(traceFlow(center+(i/count-.5)*3*p.sy,p,coeff));
   }
   for(let y=-yOffset;y<=height/scaleY-yOffset;y+=44/Math.abs(scaleY))incidentSeeds.push(y);
  }
  const left=Math.max(0,X(p.initialCenter-6*p.sx)),right=Math.min(width,X(p.screen)),wall=X(p.wall);
  const markerSpacing=44,offset=flowMarkerOffset(t,p.k,scaleX,markerSpacing),samples=[];
  // This spatial lattice advances with the model's constant forward velocity.
  // Transverse positions are evaluated on the same flow curves each frame.
  for(let px=left+offset;px<right;px+=markerSpacing){
   const x=p.wall+(px-wall)/scaleX;
   if(x<p.wall){
    const spread=u=>Math.sqrt(1+(u/(2*p.k*p.sourceSigma*p.sourceSigma))**2);
    for(const seed of incidentSeeds){const y=seed*spread(x)/spread(p.wall);samples.push({px,py:Y(y),x,y,rho:density(x,y)});}
   }else for(const path of paths){
    const y=flowPathY(path,x);if(y===null)continue;samples.push({px,py:Y(y),x,y,rho:density(x,y)});
   }
  }
  const peak=Math.max(1e-30,...samples.map(s=>s.rho));
  ctx.save();ctx.beginPath();ctx.rect(0,0,right,height);ctx.clip();
  if(lines.checked){
   ctx.strokeStyle='#ffad4a';ctx.lineWidth=1.25;
   for(const path of paths)for(let i=1;i<path.length;i++){
    const [x,y]=path[i],rho=density(x,y);ctx.globalAlpha=flowOpacity(rho/peak);
    if(ctx.globalAlpha<.001)continue;ctx.beginPath();ctx.moveTo(X(path[i-1][0]),Y(path[i-1][1]));ctx.lineTo(X(x),Y(y));ctx.stroke();
   }
  }
  if(arrows.checked){ctx.strokeStyle='#ffe14a';ctx.lineWidth=1.6;ctx.shadowColor='#17252f';ctx.shadowBlur=2;for(const s of samples){
   const opacity=flowOpacity(s.rho/peak);if(opacity<.001)continue;
   const slope=flowSlope(s.x,s.y,p,coeff);if(!Number.isFinite(slope))continue;
   const angle=Math.atan2(slope*scaleY,scaleX),l=+length.value,dx=Math.cos(angle),dy=Math.sin(angle),ex=s.px+l*dx/2,ey=s.py+l*dy/2;
   ctx.globalAlpha=opacity;ctx.beginPath();ctx.moveTo(s.px-l*dx/2,s.py-l*dy/2);ctx.lineTo(ex,ey);ctx.moveTo(ex-4*dx+3*dy,ey-4*dy-3*dx);ctx.lineTo(ex,ey);ctx.lineTo(ex-4*dx-3*dy,ey-4*dy+3*dx);ctx.stroke();
  }}ctx.restore();
 }};
}

export function flowMarkerOffset(t,k,scale,spacing){return ((k*t*scale)%spacing+spacing)%spacing;}
export function flowOpacity(ratio){
 // A soft density gate avoids visible pop-in at a hard threshold.
 const q=Math.max(0,ratio),fade=q/(q+.002);
 return .9*fade*Math.min(1,Math.sqrt(q));
}
export function flowPathY(path,x){
 if(path.length<2||x<path[0][0]||x>path.at(-1)[0])return null;
 const step=path[1][0]-path[0][0],i=Math.min(path.length-2,Math.max(0,Math.floor((x-path[0][0])/step)));
 const a=path[i],b=path[i+1],fraction=(x-a[0])/(b[0]-a[0]);return a[1]+fraction*(b[1]-a[1]);
}
