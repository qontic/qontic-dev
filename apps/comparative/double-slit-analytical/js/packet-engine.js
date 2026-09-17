import {gaussian,transverse,longitudinal,positionX,advanceY,sample,prediction} from './packet-model.js?v=39';
// Engine adapter: uses the application's existing controls, canvas layers and record.
export function mountPacketEngine({core,advanced}) {
 const chooser=document.createElement('label');chooser.className='packet-model-choice';chooser.innerHTML='Wave model <select aria-label="Wave model"><option value="continuous">Continuous</option><option value="packet">Packet</option></select>';core.prepend(chooser);
 const select=chooser.querySelector('select'),panel=document.createElement('div');panel.className='packet-settings';panel.hidden=true;
 panel.innerHTML='<label>Packet length σ <output>50 nm</output><input aria-label="Packet length" type="range" min="20" max="200" step="5" value="50"></label><label>Exit width σ <output>30 nm</output><input aria-label="Packet exit width" type="range" min="10" max="100" step="5" value="30"></label><label><input type="checkbox" checked> Repeat packets</label><p class="packet-note" role="status"></p>';advanced.prepend(panel);
 const [length,width,repeat]=panel.querySelectorAll('input'),note=panel.querySelector('p');
 const status=document.createElement('p');status.className='packet-note';status.hidden=true;core.append(status);
 const style=document.createElement('style');style.textContent='.packet-model-choice{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:10px 0}.packet-model-choice select{font:inherit;max-width:60%;background:var(--panel,#172b3b);color:inherit;border:1px solid #476477;border-radius:5px;padding:5px}.packet-settings{margin:10px 0}.packet-settings[hidden],.packet-note[hidden]{display:none!important}.packet-settings label{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px;margin:10px 0}.packet-settings input[type=range]{grid-column:1/-1;width:100%;min-width:0;accent-color:#55d8e6}.packet-settings label:has(input[type=checkbox]){display:flex;gap:8px}.packet-note{font:inherit;font-size:.85em;line-height:1.4;color:inherit;opacity:.8}';style.textContent+=' .packet-model-choice,.packet-model-choice select,.packet-settings,.packet-settings label,.packet-note{color:#dcecf4!important} [data-theme="light"] .packet-model-choice,[data-theme="light"] .packet-model-choice select,[data-theme="light"] .packet-settings,[data-theme="light"] .packet-settings label,[data-theme="light"] .packet-note{color:#183343!important}';document.head.append(style);
 const math=document.getElementById('math-container'),mathChildren=[...math.children],packetMath=document.createElement('section');packetMath.className='math-section';packetMath.hidden=true;
 packetMath.innerHTML='<h2>Analytical slit-exit packets</h2><p>A coherent pair of freely evolving Gaussians is prepared at the slit exits. This model does not solve scattering from a hard wall or emission from the source.</p><div class="packet-equation"></div><p>For two open slits the expression above applies; with one open slit only its Gaussian is present. The wave and its gradients are analytical. Transverse Pilot-Wave paths use RK4 integration; initial positions sample |Ψ(0)|². Screen probabilities integrate outward current over each detector pixel and the packet duration. The curve is the predicted record at the end of the current packet; dots and √n errors are detections accumulated so far.</p><p>Coordinates are shown in nm. Internally ℓ=100 nm and t₀=mℓ²/ℏ set dimensionless units. Packet length and exit width are density standard deviations.</p>';math.prepend(packetMath);
 const rationale=document.createElement('section');rationale.innerHTML='<h2>Packet engine</h2><p>Select Packet in Core to prepare Gaussian packets at the slit exits. The existing wavelength, slit separation, detector geometry and particle controls apply. Max. Particles becomes the number of independent particles per packet. Packets repeat after a fixed flight window chosen from their preparation and geometry; hits persist between packets. Changing engines or preparation resets the record, while changing interpretation preserves it.</p><p>The dashed exit plane replaces the hard-wall drawing: Gaussian tails extend on both sides and evolve freely. The source and which-path interaction are not part of this initial packet engine. Electrons and neutrons are supported; a nonrelativistic massive-particle Gaussian is not used for photons.</p><p>Pilot-Wave displays the sampled trajectories. Orthodox and Many-Worlds display the same unconditioned ensemble wave and detection record without assigning visible paths. A hit consumes one independently prepared member, not the whole displayed ensemble wave. The quantum-potential display, current MW split animation and alternative-history resampling remain available with the continuous engine; they are not yet connected to packet detections. Packet detector statistics use first screen crossings and analytical outward flux, not a microscopic detector calculation.</p>';document.getElementById('rationale').prepend(rationale);
 let enabled=false,p=null,fingerprint='',t=0,totalTime=0,pulse=0,particles=[],expected=[],missed=0,last=null,realElapsed=0,timeUnit=1,yOffset=0,finished=false;
 const field=document.createElement('canvas');field.width=320;field.height=240;const fc=field.getContext('2d');let data=fc.createImageData(320,240);
 const shown=id=>document.getElementById(id)?.checked;
 function config(){
  const slits=slit1Open&&slit2Open?2:1;
  const next={sx:Number(length.value)/100,sy:Number(width.value)/100,separation:slitSeparation/100,k:2*Math.PI*100/wavelength,screen:detectorDistance/100,bins:Math.max(1,Math.floor(nDetectorPixels)),particles:Math.max(1,Math.min(5000,Math.floor(Number(document.getElementById('MaxPart-input').value)||100))),slits};
  next.duration=Math.max(.2,2*next.screen/next.k+8*next.sx/next.k);
  return next;
 }
 function prepare(){t=0;pulse++;finished=false;particles=Array.from({length:p.particles},()=>sample(p));nParticles+=p.particles;}
 function resetEngine(){
  p=config();fingerprint=JSON.stringify([p,screenHeight,slit1Open,slit2Open,particleType]);yOffset=p.slits===2?screenHeight/200:(slit1Open?slit1YWorld:slit2YWorld)/100;
  timeUnit=(particleType==='neutron'?mNeutron:mElectron)*10000/hbar;
  hits=Array(p.bins).fill(0);nHits=0;hitMax=0;logNBranches=0;nParticles=0;trajectories.length=0;missed=0;t=0;totalTime=0;time=0;pulse=0;nSteps=0;last=null;realElapsed=0;prepare();
  expected=prediction(p,-yOffset,screenHeight/100-yOffset,p.duration/1200);
  updateBranchCountDisplay();setWaveRangeAuto(0,1);updateMath();stats();
 }
 function ensure(){const c=config();if(JSON.stringify([c,screenHeight,slit1Open,slit2Open,particleType])!==fingerprint)resetEngine();}
 function updateMath(){
  mathChildren.forEach(el=>el.hidden=enabled);packetMath.hidden=!enabled;
  if(enabled&&typeof katex!=='undefined')katex.render(String.raw`\Psi=g_x(x,t)\frac{g_y(y+d/2,t)+g_y(y-d/2,t)}{\sqrt{2[1+e^{-d^2/(8\sigma_y^2)}]}},\quad \sigma(t)=\sigma\sqrt{1+\left(\frac{\hbar t}{2m\sigma^2}\right)^2}`,packetMath.querySelector('.packet-equation'),{displayMode:true,throwOnError:false});
 }
 const disabledControls=['toggleWhichPath','sourceOption','particleRate','particleRate-input','mw-branch-tour','resampleHitsButton','resetBranches'];
 const savedDisabled=new Map();
 const maxLabel=document.querySelector('#MaxPart-group label');let maxLabelText=maxLabel?.textContent;
 function switchEngine(){
  if(isAnimating)document.getElementById('startButton').click();
  enabled=select.value==='packet';panel.hidden=status.hidden=!enabled;window.qonticMWBranches?.cancel();
  for(const id of disabledControls){const el=document.getElementById(id);if(!el)continue;if(enabled){savedDisabled.set(el,el.disabled);el.disabled=true;el.title='Available with the continuous engine';}else el.disabled=savedDisabled.get(el)||false;}
  const qOption=document.querySelector('#waveFunctionOption option[value="QPotential"]');if(qOption)qOption.disabled=enabled;
  if(enabled&&$('#waveFunctionOption').val()==='QPotential')$('#waveFunctionOption').val('Psi2');
  const photon=document.querySelector('#particleType option[value="photon"]');if(photon)photon.disabled=enabled;
  if(enabled){if(particleType==='photon')$('#particleType').val('electron');whichPathDetector='none';updateWhichPathButton();const tour=document.getElementById('mw-branch-tour');if(tour){tour.checked=false;tour.dispatchEvent(new Event('change'));}setupGeo(false);resetEngine();}
  else {reset=1;fingerprint='';}
  if(maxLabel)maxLabel.textContent=enabled?'Particles / packet:':maxLabelText;
  note.textContent='Slit-exit preparation. Use Particles / packet below. Source and which-path controls are inactive.';
  updateMath();if(!enabled)updateMathFormulas();renderSetupFlag=1;lastCycleIndex=-1;drawSystem(0);
 }
 select.addEventListener('change',switchEngine);
 for(const control of [length,width])control.addEventListener('input',()=>{control.parentElement.querySelector('output').textContent=control.value+' nm';if(enabled){resetEngine();draw();}});
 function stats(){
  const mass=particleType==='neutron'?mNeutron:mElectron,speed=hbar/mass*(p.k/100);
  $('#waveSpeed').text(speed>=1000?(speed/1000).toFixed(2)+' km/s':speed.toFixed(2)+' m/s');
  const overlap=p.slits===2?Math.exp(-(p.separation*p.separation)/(8*p.sy*p.sy)):0;
  const py2=1/(4*p.sy*p.sy)-(p.slits===2?p.separation*p.separation*overlap/(16*p.sy**4*(1+overlap)):0);
  const energy=.5*mass*(hbar/(mass*100))**2*(p.k*p.k+1/(4*p.sx*p.sx)+py2)/1.602176634e-19;
  $('#particleEnergy').text(energy.toExponential(2)+' eV');
  time=totalTime*timeUnit;$('#systemTime').text(time.toFixed(3)+' ns');$('#realTime').text(realElapsed.toFixed(1)+' s');$('#nhits').text(nHits);$('#shownParticles').text(particles.filter(a=>!a.done).length);$('#maxParticlesDisplay').text(p?.particles||0);$('#nSteps').text(nSteps);
  status.textContent=`Packet ${pulse} · ${finished?'complete': 'slit-exit preparation'} · ${missed} outside screen / late`;
 }
 function integrate(dt){
  for(const a of particles){if(a.done)continue;const x=a.x,y=a.y;a.y=advanceY(y,t,dt,p);a.x=positionX(a.x0,t+dt,p);
   if(x<p.screen&&a.x>=p.screen){const hitY=y+(a.y-y)*(p.screen-x)/(a.x-x)+yOffset,index=Math.floor(hitY/(screenHeight/100)*p.bins);if(index>=0&&index<p.bins){hits[index]++;nHits++;hitMax=Math.max(hitMax,hits[index]);logNBranches+=Math.log10(p.bins);}else missed++;a.done=true;}
   if(shown('plot_trajectories')){a.path.push([a.x,a.y]);if(a.path.length>600)a.path.shift();}
  }
  t+=dt;totalTime+=dt;nSteps++;
  if(t>=p.duration-1e-10){missed+=particles.filter(a=>!a.done).length;particles.forEach(a=>a.done=true);if(repeat.checked)prepare();else {finished=true;isAnimating=false;$('#startButton').text('Start');}}
 }
 function frame(){
  ensure();const now=performance.now(),elapsed=last===null?0:(now-last)/1000,wallDt=Math.min(.05,elapsed);last=now;realElapsed+=elapsed;
  if(finished){prepare();}
  const speed=Number($('#animationStep-group')[0].getValueInFirstUnit())||1;
  // Roughly six seconds of playback to reach the detector at 1x; physics
  // substeps remain small regardless of the animation-speed setting.
  let remaining=wallDt*speed*p.screen/p.k/6,limit=0;
  const stepSize=Math.min(.005,.02*p.sy*p.sy,p.screen/p.k/300,p.sx/p.k/30);
  while(remaining>1e-10&&isAnimating&&limit++<2000){const dt=Math.min(stepSize,remaining,p.duration-t);integrate(dt);remaining-=dt;}
  draw();$('#stepTime').text((performance.now()-now).toFixed(1));updateBranchCountDisplay();if(isAnimating)animationId=requestAnimationFrame(evolveSystem);
 }
 const X=x=>(wallXWorld+x*100)*toCanvasX,Y=y=>(y+yOffset)*100*toCanvasY;
 function drawWave(){
  if(!enabled)return;ensure();waveCtx.clearRect(0,0,canvas.width,canvas.height);if(!shown('plot_wave'))return;
  setWaveRangeAuto(0,1);const range=getWaveRangeEffective(),span=Math.max(1e-9,range.max-range.min),mode=$('#waveFunctionOption').val();
  const xs=Array.from({length:320},(_,i)=>longitudinal(((i+.5)/320*worldCanvasDx-wallXWorld)/100,t,p));
  const ys=Array.from({length:240},(_,j)=>transverse((j+.5)/240*screenHeight/100-yOffset,t,p));
  const peak=1/(2*Math.PI*p.sx*p.sy),pal=Array.from({length:256},(_,i)=>window.paletteModule.getColorForValue(i/255,graphPalette));
  for(let j=0;j<240;j++)for(let i=0;i<320;i++){const a=xs[i],b=ys[j],rho=a.rho*b.rho,weight=Math.min(1,Math.sqrt(rho/peak));let value;
   if(mode==='Phase')value=((Math.atan2(a.im,a.re)+Math.atan2(b.im,b.re))%(2*Math.PI)+2*Math.PI)%(2*Math.PI)/(2*Math.PI);
   else if(mode==='LogPsi2')value=Math.max(0,Math.min(1,(Math.log(Math.max(1e-15,rho/peak))+15)/15));
   else value=Math.min(1,rho/peak);
   const rgb=pal[Math.round(Math.max(0,Math.min(1,(value-range.min)/span))*255)],n=4*(j*320+i);data.data[n]=rgb[0];data.data[n+1]=rgb[1];data.data[n+2]=rgb[2];data.data[n+3]=255*elementOpacity('plot_wave')*(mode==='Phase'?weight:Math.min(1,weight*2));
  }
  fc.putImageData(data,0,0);waveCtx.save();waveCtx.beginPath();waveCtx.rect(0,0,detectorX,canvas.height);waveCtx.clip();waveCtx.drawImage(field,0,0,canvas.width,canvas.height);waveCtx.restore();
  drawPaletteScale(graphPalette,mode==='Phase'?range.min*2*Math.PI:range.min,mode==='Phase'?range.max*2*Math.PI:range.max);
 }
 function drawParticles(){
  partCtx.clearRect(0,0,canvas.width,canvas.height);if(interpretation!=='bohmian')return;
  partCtx.save();partCtx.beginPath();partCtx.rect(0,0,detectorX,canvas.height);partCtx.clip();
  for(const a of particles){if(shown('plot_trajectories')&&a.path.length){partCtx.globalAlpha=elementOpacity('plot_trajectories');partCtx.strokeStyle=colorTraj;partCtx.beginPath();a.path.forEach(([x,y],i)=>i?partCtx.lineTo(X(x),Y(y)):partCtx.moveTo(X(x),Y(y)));partCtx.stroke();}if(!a.done&&shown('plot_particles')){partCtx.globalAlpha=elementOpacity('plot_particles');partCtx.fillStyle=colorPart;partCtx.beginPath();partCtx.arc(X(a.x),Y(a.y),3,0,2*Math.PI);partCtx.fill();}}
  partCtx.restore();
 }
 function histogram(options={}){
  const context=options.context||setupCtx,record=options.hits||hits,maxRecord=Math.max(1,...record),histo=detectorX+sensorWidth,widthPx=canvas.width-histo;
  const predictionCounts=expected.map(v=>v*p.particles*pulse),maximum=Math.max(1,...record.map(v=>v+Math.sqrt(v)),...predictionCounts),scale=Math.max(0,widthPx-8)/maximum;
  context.save();context.globalAlpha=1;context.fillStyle='#fff';context.fillRect(histo,0,widthPx,canvas.height);context.fillStyle='#000';context.fillRect(detectorX,0,sensorWidth,canvas.height);
  if(shown('hit_prob')){context.globalAlpha=elementOpacity('hit_prob');context.strokeStyle=colorProb;context.beginPath();predictionCounts.forEach((q,i)=>{const x=histo+q*scale,y=(i+.5)*canvas.height/p.bins;i?context.lineTo(x,y):context.moveTo(x,y);});context.stroke();}
  const rgb=getRGBComponents(colorSensor);
  record.forEach((n,i)=>{if(!n)return;const y=(i+.5)*canvas.height/p.bins,x=histo+n*scale,error=Math.sqrt(n)*scale;
   if(shown('plot_sensor')){context.globalAlpha=elementOpacity('plot_sensor');const intensity=n/maxRecord;context.fillStyle=`rgb(${rgb.red*intensity},${rgb.green*intensity},${rgb.blue*intensity})`;context.fillRect(detectorX,i*canvas.height/p.bins,sensorWidth,canvas.height/p.bins);}
   if(shown('plot_hits')){context.globalAlpha=elementOpacity('plot_hits');context.strokeStyle=context.fillStyle=colorHit;context.beginPath();context.moveTo(x-error,y);context.lineTo(x+error,y);context.stroke();context.beginPath();context.arc(x,y,3,0,2*Math.PI);context.fill();}
  });context.restore();
 }
 function draw(){if(!enabled)return;ensure();setupCtx.clearRect(0,0,canvas.width,canvas.height);
  setupCtx.save();if(shown('plot_screen')){setupCtx.globalAlpha=elementOpacity('plot_screen');setupCtx.strokeStyle=colorScreen;setupCtx.setLineDash([5,5]);setupCtx.beginPath();setupCtx.moveTo(wallX,0);setupCtx.lineTo(wallX,canvas.height);setupCtx.stroke();}
  setupCtx.setLineDash([]);if(shown('plot_detector')){setupCtx.globalAlpha=elementOpacity('plot_detector');setupCtx.strokeStyle=colorDetector;setupCtx.beginPath();setupCtx.moveTo(detectorX,0);setupCtx.lineTo(detectorX,canvas.height);setupCtx.stroke();}setupCtx.restore();
  drawWave();drawParticles();histogram();window.qonticScaleOverlay?.update();stats();
 }
 function hash(){return enabled?'&engine=packet&packetLength='+length.value+'&packetWidth='+width.value+'&packetCount='+p.particles:'';}
 const params=new URLSearchParams(location.hash.slice(1));if(params.get('engine')==='packet'){
  for(const [key,el] of [['packetLength',length],['packetWidth',width]]){const n=Number(params.get(key));if(Number.isFinite(n)&&n>=Number(el.min)&&n<=Number(el.max)){el.value=n;el.parentElement.querySelector('output').textContent=n+' nm';}}
  const count=Number(params.get('packetCount'));if(count>=1&&count<=5000)$('#MaxPart-group')[0]?.setValueInFirstUnit(count);
  // Defer activation until the adapter has been assigned to the main engine.
  queueMicrotask(()=>{select.value='packet';switchEngine();});
 }
 return {get enabled(){return enabled;},reset:resetEngine,draw,drawWave,drawParticles,histogram,frame,updateMath,hash,pause(){last=null;}};
}
