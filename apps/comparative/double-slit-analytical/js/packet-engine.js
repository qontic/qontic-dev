import {mountPacketGeometry,trimTail,tailOpacity} from './packet-interaction.js?v=48';
import {histogramLayout} from './packet-model.js?v=41';
import {aperture,sourceCoefficients,sourceTransverse,sourceEnvelope,sampleSource,stepSource,sourceProfile} from './source-packet-model.js?v=42';
import {detectorLaw,quantumSchedule,recordWithHit,samplePixel} from './packet-outcomes.js?v=49';
export function mountPacketEngine({core,advanced}){
 const panel=document.createElement('div');panel.className='packet-settings';
 panel.innerHTML="<div class=\"input-group packet-inline\"><label for=\"packet-source-width\">Source width σ</label><input id=\"packet-source-width\" aria-label=\"Packet source width\" type=\"range\" min=\"50\" max=\"400\" step=\"5\" value=\"200\"><input aria-label=\"Packet source width value\" type=\"number\" min=\"50\" max=\"400\" step=\"5\" value=\"200\"><output>nm</output></div><div class=\"input-group packet-inline\"><label for=\"packet-length\">Packet length σ</label><input id=\"packet-length\" aria-label=\"Packet length\" type=\"range\" min=\"5\" max=\"200\" step=\"5\" value=\"50\"><input aria-label=\"Packet length value\" type=\"number\" min=\"5\" max=\"200\" step=\"5\" value=\"50\"><output>nm</output></div><div class=\"input-group packet-inline\"><label for=\"packet-slit-width\">Slit width σ</label><input id=\"packet-slit-width\" aria-label=\"Packet slit width\" type=\"range\" min=\"10\" max=\"200\" step=\"5\" value=\"30\"><input aria-label=\"Packet slit width value\" type=\"number\" min=\"10\" max=\"200\" step=\"5\" value=\"30\"><output>nm</output></div>";advanced.prepend(panel);
 const [sourceWidth,length,width]=panel.querySelectorAll('input[type=range],input[type=checkbox]');
 const tailRow=document.createElement('div');tailRow.innerHTML="<div class=\"input-group packet-inline\"><label for=\"packet-tail-length\">Tail length</label><input id=\"packet-tail-length\" aria-label=\"Trajectory tail length\" type=\"range\" min=\"0\" max=\"2000\" step=\"25\" value=\"250\"><input aria-label=\"Trajectory tail length value\" type=\"number\" min=\"0\" max=\"2000\" step=\"25\" value=\"250\"><output>nm</output></div>";panel.append(tailRow);const tailLength=tailRow.querySelector('input[type=range]');
 function syncPacketInput(control){const number=control.parentElement.querySelector('input[type=number]');number.value=control.value;number.max=control.max;number.min=control.min;control.parentElement.querySelector('output').textContent='nm';}
 for(const number of panel.querySelectorAll('input[type=number]'))number.addEventListener('change',()=>{const range=number.parentElement.querySelector('input[type=range]'),value=Number(number.value);if(Number.isFinite(value))range.value=Math.max(+range.min,Math.min(+range.max,value));range.dispatchEvent(new Event('input',{bubbles:true}));});
 tailLength.addEventListener('input',()=>{syncPacketInput(tailLength);for(const a of particles)trimTail(a.path,+tailLength.value/100);draw();});
 const status=document.createElement('p');status.className='packet-note';status.setAttribute('role','status');core.append(status);
 const style=document.createElement('style');style.textContent='.packet-settings label{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px;margin:10px 0}.packet-settings input[type=range]{grid-column:1/-1;width:100%;min-width:0}.packet-settings label:has(input[type=checkbox]){display:flex;gap:8px}.packet-note{font-size:.85em;line-height:1.4;opacity:.85}.packet-equation{overflow-x:auto;padding:8px 0}.packet-equation .katex{font-size:1.1em} .packet-settings,.packet-settings label,.packet-note{color:#dcecf4!important}[data-theme=light] .packet-settings,[data-theme=light] .packet-settings label,[data-theme=light] .packet-note{color:#183343!important}#particleRate-group,#toggleWhichPath,#sourceOption,label[for=Source]{display:none!important}.packet-settings .packet-inline{display:grid;grid-template-columns:90px minmax(40px,1fr) 58px 24px;gap:6px;align-items:center;margin:8px 0}.packet-settings .packet-inline label{display:block;margin:0;font-size:12px}.packet-settings .packet-inline input[type=range]{grid-column:auto;width:100%}.packet-inline input[type=number]{width:100%;box-sizing:border-box;background:transparent;color:inherit;border:1px solid #476477;border-radius:3px;padding:3px}.packet-inline output{font-size:12px}#source-position-group,#detector-distance-group,#screen-height-group{display:none!important}.packet-geometry{position:absolute;inset:0;pointer-events:none;z-index:6}.packet-geometry[hidden]{display:none}.packet-geometry button{position:absolute;pointer-events:auto;touch-action:none;color:#d9f8ff;background:rgba(25,76,90,.2);border:1px solid rgba(110,222,239,.45)}.packet-detector-drag{bottom:3px;width:30px;height:28px;transform:translateX(-100%);cursor:ew-resize;border-radius:5px}.packet-wall-drag{bottom:3px;width:30px;height:28px;transform:translateX(-50%);cursor:ew-resize;border-radius:5px}.packet-detector-drag:hover,.packet-geometry button:focus-visible{background:rgba(50,170,195,.5);outline:2px solid #7ee9fb}.packet-height-drag{bottom:3px;transform:translateX(0);width:30px;height:28px;cursor:ns-resize;border-radius:5px}.packet-geometry-guide{position:absolute;top:0;bottom:0;border-left:2px dashed #8fecff}.packet-geometry-value{position:absolute;bottom:35px;right:10px;background:#122e40;color:white;padding:5px;border-radius:4px}.packet-unused-row{display:none!important}#waveCanvas,#partCanvas{background:transparent!important}#canvas-container,#setupCanvas{background:#344f63!important}';document.head.append(style);
 const math=document.getElementById('math-container'),packetMath=document.createElement('section');packetMath.className='math-section';math.replaceChildren(packetMath);
 const sourceMathHTML='<h2>Analytical source-to-screen packets</h2><p>A Gaussian pulse travels from the source through a pair of soft Gaussian apertures. One travelling envelope and one carrier phase cover both sides of the slit plane. Transmission is evaluated from the incoming complex wave; the outgoing packet is not restarted or faded in.</p><div class="packet-equation"></div><p>Here x is measured from the source, L is the aperture position, k=2π/λ and v=ℏk/m. F is a Gaussian longitudinal envelope. Before the mask, φ is a freely propagated transverse Gaussian. At the mask, φ⁺(y)=T(y)φ⁻(y), with T a real sum of Gaussian aperture amplitudes scaled so 0≤T≤1. Each Gaussian product is propagated analytically downstream and their complex amplitudes are added. The incident phase curvature is retained. The soft mask absorbs intensity where transmission is weak; it does not model reflection from a hard wall.</p><p>This is a forward, paraxial approximation: longitudinal speed is v, longitudinal spreading is neglected, and transverse diffraction is analytical. It is most accurate for a narrow momentum spread and small diffraction angles; very short packets or narrow apertures relative to λ fall outside that regime. The source width and aperture width controls are Gaussian density standard deviations (the latter for an isolated aperture transmission profile). Energy shows the central longitudinal energy.</p><p>Pilot-Wave-style trajectories follow the transverse current with forward speed v. The incoming Gaussian paths are analytical; downstream paths use RK4. At the mask, particles are transmitted with probability T²(y) or marked absorbed. This stochastic absorption represents a reduced aperture model, not a microscopic Bohmian model of the wall. The initial forward tail beyond the mask is excluded from particle sampling; the four-σ distance limit bounds that tail below 0.0032%. The untruncated Gaussian wave remains analytical.</p><p>The screen curve is the transmitted transverse density, proportional to integrated forward flux. It is normalized to the observed screen-hit total; dots and √n errors share that count scale. The scale changes with hits, never with packet injection. At zero hits it uses a unit reference. Pilot-Wave source-particle count includes absorbed and missed particles; the Orthodox and MW hit target instead conditions on screen acceptance. Changing interpretation preserves the record. Unresolved particles are resampled conditionally when changing between trajectory and outcome sampling.</p><p>Wave brightness uses a fixed display reference throughout each run, with a nonlinear visibility envelope and the existing opacity control. A smooth, fixed downstream brightness boost makes the transmitted packet visible; density colors are enhanced nonlinearly. Display enhancement does not affect transmission, trajectories or probabilities. </p><p>Analytical Gaussian-aperture propagation: <a href="https://arxiv.org/abs/1406.2408" target="_blank" rel="noopener">Neto, da Paz and Cabral, Eur. J. Phys. 36 (2015) 035002</a>. Our translating longitudinal envelope is an additional paraxial modelling choice.</p>';

 const modeExplanation='<h2>Preparation, detection and interpretation</h2><p>Every pulse represents independently prepared particles sharing the same one-particle Gaussian state, without interactions or exchange effects. In Pilot-Wave, Particles / packet counts incident preparations. In Orthodox and Many-Worlds, Hits / packet sets the number of screen registrations: these ensembles are conditioned on transmission and reaching the displayed screen. They do not include absorbed or missed trials. The normalized screen pattern is comparable across modes, but incident flux is not. A mode change partway through a packet preserves prior outcomes; the requested count applies fully from the next packet. The source wave passes through soft Gaussian apertures. Free transverse propagation is analytical; the translating longitudinal envelope is a paraxial approximation, and hard-wall reflection is omitted.</p><p><strong>Pilot-Wave:</strong> positions are sampled at the source and trajectories are integrated forward. Transmission is sampled with T² at the mask. Screen crossings generate hits; no screen endpoints are backtracked. This is an effective absorption model rather than a microscopic wall interaction.</p><p><strong>Orthodox:</strong> emission and arrival times come from the packet envelope. Detector pixels are sampled from the Gaussian-aperture probabilities conditioned on screen registration, without assigning paths. Registration removes that member from the unregistered ensemble and displays a localized detector response. With one registered particle the packet disappears upon detection; with many particles only the corresponding fraction is removed. The spot represents an absorbing detector record, not a newly propagating Gaussian state.</p><p><strong>Many-Worlds:</strong> the same outcome weights define detector-record branches. Slow-motion branching separates one system per detector pixel, with the hit present at the split, then follows a Born-weighted or manually chosen record. Selection does not erase the other records. This finite illustration conditions on a screen registration; absorption and outcomes outside the screen are excluded from this conditioned ensemble. A microscopic detector/environment wavefunction is not simulated. During branch inspection, packet transport and further detections wait while the carrier phase keeps evolving. Manual choices can bias the accumulated histogram.</p><p>The predicted curve and hits share a count scale. Switching interpretation preserves recorded counts and elapsed time; the still-unregistered ensemble is resampled conditional on survival when switching between trajectory and outcome sampling. Reset or a preparation change clears the experiment. The source-packet model is the only selectable engine; previous versions remain in repository history.</p>';
 document.getElementById('rationale').innerHTML='<article><h1>Gaussian source-packet double slit</h1>'+modeExplanation+'</article>';
 let enabled=true,p=null,coeff=null,profile=null,law=null,sourceGrid=null,fingerprint='',particles=[],pending=[],t=0,totalTime=0,pulse=0,absorbed=0,pulseAbsorbed=0,missed=0,last=null,realElapsed=0,timeUnit=1,yOffset=0,finished=false,packetAnimationId=null,visualPhase=0,flash=null,hold=0,lastMode=interpretation,viewWidth=905;
 const field=document.createElement('canvas');field.width=320;field.height=240;const fc=field.getContext('2d');let data=fc.createImageData(320,240);
 const shown=id=>document.getElementById(id)?.checked;
 const X=x=>(wallXWorld+(p.launch+x)*100)*toCanvasX,Y=y=>(y+yOffset)*100*toCanvasY;
 function config(){
  length.max=Math.max(5,Math.min(200,Math.floor(Math.min(sourcePos,detectorDistance)/4)));if(+length.value>+length.max)length.value=length.max;
  syncPacketInput(length);
  const next={source:true,spherical:false,focused:false,sx:+length.value/100,sy:+width.value/100,k:2*Math.PI*100/wavelength,launch:-sourcePos/100,wall:sourcePos/100,screen:(sourcePos+detectorDistance)/100,sourceSigma:+sourceWidth.value/100,bins:Math.max(1,Math.floor(nDetectorPixels)),particles:Math.max(1,Math.min(5000,Math.floor(+document.getElementById('MaxPart-input').value||100))),slits:slit1Open&&slit2Open?2:1};
  next.centers=[...(slit1Open?[(slit1YWorld-screenHeight/2)/100]:[]),...(slit2Open?[(slit2YWorld-screenHeight/2)/100]:[])].sort((a,b)=>a-b);next.duration=(next.screen+8*next.sx)/next.k;return next;
 }
 function prepare(){
  t=0;visualPhase=0;pulseAbsorbed=0;finished=false;pulse++;particles=Array.from({length:p.particles},()=>{const a=sampleSource(p);a.schedule=interpretation==='bohmian'?quantumSchedule(a,p,law):{at:(p.screen-a.x0)/p.k,type:'hit',index:samplePixel(law.weights)};return a;});nParticles+=p.particles;
 }
 function resetEngine(){
  window.qonticMWBranches?.cancel();pending=[];flash=null;hold=0;lastMode=interpretation;p=config();fingerprint=JSON.stringify([p,screenHeight,particleType]);yOffset=screenHeight/200;
  coeff=sourceCoefficients(p);sourceGrid=null;profile=sourceProfile(p,-yOffset,screenHeight/100-yOffset,2049);law=detectorLaw(p,profile,-yOffset,screenHeight/100-yOffset);
  timeUnit=(particleType==='neutron'?mNeutron:mElectron)*10000/hbar;
  hits=Array(p.bins).fill(0);nHits=0;hitMax=0;logNBranches=0;nParticles=0;trajectories.length=0;absorbed=0;missed=0;t=0;totalTime=0;pulse=0;nSteps=0;last=null;realElapsed=0;prepare();updateBranchCountDisplay();setWaveRangeAuto(0,1);updateMath();stats();
 }
 function ensure(){if(JSON.stringify([config(),screenHeight,particleType])!==fingerprint)resetEngine();}
 function updateMath(){
  packetMath.innerHTML=sourceMathHTML+modeExplanation;
  if(typeof katex!=='undefined')katex.render(String.raw`\Psi=F(x-vt)e^{i(kx-\omega t)}\phi(y,x),\quad \phi(y,L^+)=T(y)\phi(y,L^-)`,packetMath.querySelector('.packet-equation'),{displayMode:true,throwOnError:false});
 }
 function syncMode(){
  const countLabel=document.querySelector('#MaxPart-group label');if(countLabel)countLabel.textContent=interpretation==='bohmian'?'Particles / packet:':'Hits / packet:';
  const countInput=document.getElementById('MaxPart-input');countInput.title=interpretation==='bohmian'?'Incident particles per packet; some are absorbed.':'Screen registrations per new packet, conditioned on reaching the screen.';
  if(lastMode===interpretation)return;
  window.qonticMWBranches?.cancel();flash=null;hold=0;
  const wasPW=lastMode==='bohmian',isPW=interpretation==='bohmian';
  if(wasPW!==isPW)for(let i=0;i<particles.length;i++){
   const a=particles[i];if(a.done)continue;
   if(!isPW){a.schedule={at:(p.screen-a.x0)/p.k,type:'hit',index:samplePixel(law.weights)};a.path=[];}
   else{
    // Conditional source ensemble: reject preparations already absorbed at t.
    let accepted=null;
    for(let attempt=0;attempt<20000&&!accepted;attempt++){
     const b=sampleSource(p);b.x0=b.x=a.x0;
     // sampleSource transverse width depends weakly on x; correct it here.
     const sigma=p.sourceSigma*Math.sqrt(1+(a.x0/(2*p.k*p.sourceSigma**2))**2);
     b.y=sigma*Math.sqrt(-2*Math.log(Math.max(1e-15,Math.random())))*Math.cos(2*Math.PI*Math.random());
     let age=0;while(age<t&&!b.done){const dt=Math.min(.002,t-age);stepSource(b,dt,p,coeff);age+=dt;}
     if(!b.done)accepted=b;
    }
    if(accepted)particles[i]=accepted;else throw new Error('Unable to sample surviving preparation; reset with a wider aperture.');
   }
  }
  lastMode=interpretation;
 }
 function stats(){
  const mass=particleType==='neutron'?mNeutron:mElectron,speed=hbar/mass*p.k/100;
  $('#waveSpeed').text(speed>=1000?(speed/1000).toFixed(2)+' km/s':speed.toFixed(2)+' m/s');
  $('#particleEnergy').text((.5*mass*(hbar*p.k/(mass*100))**2/1.602176634e-19).toExponential(2)+' eV');
  time=totalTime*timeUnit;$('#systemTime').text(time.toFixed(3)+' ns');$('#realTime').text(realElapsed.toFixed(1)+' s');$('#nhits').text(nHits);$('#shownParticles').text(particles.filter(a=>!a.done).length);$('#maxParticlesDisplay').text(p.particles);$('#nSteps').text(nSteps);
  status.textContent='Gaussian source · Packet '+pulse+' · '+absorbed+' absorbed · '+missed+' outside screen'+(pending.length?' · '+pending.length+' registrations pending':'')+(flash&&interpretation==='copenhagen'?' · Registered at pixel '+(flash.index+1):'');
 }
 function addHit(index){hits[index]++;nHits++;hitMax=Math.max(hitMax,hits[index]);logNBranches+=Math.log10(p.bins);updateBranchCountDisplay();}
 function processPending(){
  if(!pending.length||window.qonticMWBranches?.busy)return;
  const index=pending.shift();
  if(interpretation==='manyworlds'&&window.qonticMWBranches?.enabled){
   const previous=hits.slice();
   const setRecord=i=>{hits=recordWithHit(previous,i);hitMax=Math.max(...hits);};
   const started=window.qonticMWBranches.begin({selected:index,weights:law.weights,detectorFraction:detectorX/canvas.width,
    createRecord(i){const strip=document.createElement('canvas'),scale=Math.min(1,256/canvas.height);strip.width=Math.ceil((canvas.width-detectorX)*scale);strip.height=Math.ceil(canvas.height*scale);const context=strip.getContext('2d');context.scale(scale,scale);context.translate(-detectorX,0);histogram({context,hits:recordWithHit(previous,i)});return strip;},
    onSplit(){nHits++;logNBranches+=Math.log10(p.bins);setRecord(index);updateBranchCountDisplay();stats();},
    onSelect(i){setRecord(i);flash=null;last=null;draw();}
   });if(started)return;
  }
  addHit(index);if(interpretation==='copenhagen'){flash={index,remaining:.65};hold=.25;}
 }
 function integrate(dt){
  const end=t+dt;
  for(const a of particles){
   if(a.done)continue;
   if(interpretation==='bohmian'){
    const event=stepSource(a,dt,p,coeff);
    if(event==='absorbed'){absorbed++;pulseAbsorbed++;}
    if(event==='hit'){const index=Math.floor((a.y+yOffset)/(screenHeight/100)*p.bins);if(index>=0&&index<p.bins)pending.push(index);else missed++;}
    if(a.done)a.finishedAt=realElapsed;if(shown('plot_trajectories')){a.path.push([a.x,a.y]);trimTail(a.path,+tailLength.value/100);}
   }else if(a.schedule.at<=end){
    a.done=true;if(a.schedule.type==='absorbed'){absorbed++;pulseAbsorbed++;}else if(a.schedule.type==='missed')missed++;else pending.push(a.schedule.index);
   }
  }
  t=end;totalTime+=dt;nSteps++;
 }
 function frame(){
  packetAnimationId=null;if(!isAnimating)return;ensure();syncMode();
  const now=performance.now(),wallDt=Math.min(2,last===null?0:(now-last)/1000);last=now;realElapsed+=wallDt;
  if(flash){flash.remaining-=wallDt;if(flash.remaining<=0)flash=null;}hold=Math.max(0,hold-wallDt);
  const speed=+$('#animationStep-group')[0].getValueInFirstUnit()||1;
  const branch=window.qonticMWBranches,busy=branch?.busy,waiting=branch?.enabled&&!branch.ready();
  if(busy||pending.length||hold>0){visualPhase+=wallDt*speed*p.k*p.screen/12;if(!busy&&!waiting&&hold===0)processPending();}
  else{
   if(finished)prepare();
   let remaining=wallDt*speed*p.screen/p.k/6,limit=0;
   const step=Math.min(.005,.02*p.sy*p.sy,p.screen/p.k/300,p.sx/p.k/30);
   while(remaining>1e-10&&isAnimating&&!pending.length&&t<p.duration&&limit++<4000){const dt=Math.min(step,remaining,p.duration-t);integrate(dt);remaining-=dt;}
   if(pending.length&&!waiting)processPending();
   if(t>=p.duration-1e-10&&!pending.length&&!branch?.busy){for(const a of particles)if(!a.done){a.done=true;missed++;}finished=true;}
  }
  draw();branch?.refreshFrame();$('#stepTime').text((performance.now()-now).toFixed(1));if(isAnimating)packetAnimationId=requestAnimationFrame(evolveSystem);
 }
 function ensembleOpacity(){return particles.length?Math.max(0,(particles.filter(a=>!a.done).length+pending.length)/Math.max(1,particles.length-pulseAbsorbed)):0;}
 function drawWave(){ensure();drawSourceWave();}
 function drawSourceWave(){
  waveCtx.clearRect(0,0,canvas.width,canvas.height);if(!shown('plot_wave'))return;
  const key=[worldCanvasDx,screenHeight,wallXWorld,p.launch].join(',');
  if(!sourceGrid||sourceGrid.key!==key){
   const values=new Float64Array(320*240*2),xs=Array.from({length:320},(_,i)=>((i+.5)/320*worldCanvasDx-wallXWorld)/100-p.launch);let maxRho=0;
   for(let j=0;j<240;j++)for(let i=0;i<320;i++){
    const g=sourceTransverse((j+.5)/240*screenHeight/100-yOffset,xs[i],p,coeff),n=2*(j*320+i);
    values[n]=g.rho;values[n+1]=Math.atan2(g.im,g.re);maxRho=Math.max(maxRho,g.rho);
   }
   sourceGrid={key,values,xs,maxRho};
  }
  setWaveRangeAuto(0,1);const range=getWaveRangeEffective(),span=Math.max(1e-9,range.max-range.min),mode=$('#waveFunctionOption').val();
  const env=sourceGrid.xs.map(x=>sourceEnvelope(x,t,p)),populationOpacity=ensembleOpacity();
  // Fixed density reference across the aperture and across pulses avoids
 // brightness pumping as the packet arrives or is absorbed.
  const peak=sourceGrid.maxRho/(Math.sqrt(2*Math.PI)*p.sx),pal=Array.from({length:256},(_,i)=>window.paletteModule.getColorForValue(i/255,graphPalette));
  for(let j=0;j<240;j++)for(let i=0;i<320;i++){
   const n=j*320+i,rho=sourceGrid.values[2*n]*env[i].rho;
   const gain=2+6*(1-Math.exp(-Math.max(0,sourceGrid.xs[i]-p.wall)/.35)),displayDensity=Math.min(1,rho*gain/Math.max(1e-30,peak));
   const weight=Math.min(1,3*Math.pow(displayDensity,.24))*populationOpacity;let value;
   if(mode==='Phase')value=((sourceGrid.values[2*n+1]+env[i].phase-visualPhase)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)/(2*Math.PI);
   else if(mode==='LogPsi2')value=Math.max(0,Math.min(1,(Math.log(Math.max(1e-15,rho/peak))+15)/15));
   else value=Math.pow(displayDensity,.45);
   const rgb=pal[Math.round(Math.max(0,Math.min(1,(value-range.min)/span))*255)];
   data.data[4*n]=rgb[0];data.data[4*n+1]=rgb[1];data.data[4*n+2]=rgb[2];data.data[4*n+3]=255*elementOpacity('plot_wave')*weight;
  }
  fc.putImageData(data,0,0);waveCtx.save();waveCtx.imageSmoothingEnabled=true;waveCtx.imageSmoothingQuality="high";waveCtx.beginPath();waveCtx.rect(0,0,detectorX,canvas.height);waveCtx.clip();waveCtx.drawImage(field,0,0,canvas.width,canvas.height);waveCtx.restore();
  drawPaletteScale(graphPalette,mode==='Phase'?range.min*2*Math.PI:range.min,mode==='Phase'?range.max*2*Math.PI:range.max);
 }

 function drawParticles(){
  partCtx.clearRect(0,0,canvas.width,canvas.height);if(interpretation!=='bohmian')return;
  partCtx.save();partCtx.beginPath();partCtx.rect(0,0,detectorX,canvas.height);partCtx.clip();
  for(const a of particles){if(a.done&&tailOpacity(true,a.finishedAt??realElapsed,realElapsed)===0)a.path=[];if(shown('plot_trajectories')&&a.path.length){partCtx.globalAlpha=elementOpacity('plot_trajectories')*tailOpacity(a.done,a.finishedAt??realElapsed,realElapsed);partCtx.strokeStyle=colorTraj;partCtx.beginPath();a.path.forEach(([x,y],i)=>i?partCtx.lineTo(X(x),Y(y)):partCtx.moveTo(X(x),Y(y)));partCtx.stroke();}if(!a.done&&shown('plot_particles')){partCtx.globalAlpha=elementOpacity('plot_particles');partCtx.fillStyle=colorPart;partCtx.beginPath();partCtx.arc(X(a.x),Y(a.y),3,0,2*Math.PI);partCtx.fill();}}partCtx.restore();
 }
 function drawDetection(){
  if(!flash||interpretation!=='copenhagen')return;
  const y=(flash.index+.5)*canvas.height/p.bins;partCtx.save();partCtx.globalAlpha=Math.min(1,flash.remaining/.2);partCtx.fillStyle='#ffe476';partCtx.fillRect(detectorX-2,flash.index*canvas.height/p.bins,Math.max(5,sensorWidth),canvas.height/p.bins);partCtx.beginPath();partCtx.arc(detectorX,y,5,0,Math.PI*2);partCtx.fill();partCtx.restore();
 }
 function histogram(options={}){
  const context=options.context||setupCtx,record=options.hits||hits,maxRecord=Math.max(1,...record),histo=detectorX+sensorWidth,widthPx=canvas.width-histo;
  const {curve:predictionCounts,scale}=histogramLayout(record,profile,screenHeight/100,widthPx);
  context.save();context.globalAlpha=1;context.fillStyle='#fff';context.fillRect(histo,0,widthPx,canvas.height);context.fillStyle='#000';context.fillRect(detectorX,0,sensorWidth,canvas.height);
  if(shown('hit_prob')&&!p.focused){context.globalAlpha=elementOpacity('hit_prob');context.strokeStyle=colorProb;context.beginPath();predictionCounts.forEach((q,i)=>{const x=histo+q*scale,y=i*canvas.height/(predictionCounts.length-1);i?context.lineTo(x,y):context.moveTo(x,y);});context.stroke();}
  const rgb=getRGBComponents(colorSensor);
  record.forEach((n,i)=>{if(!n)return;const y=(i+.5)*canvas.height/p.bins,x=histo+n*scale,error=Math.sqrt(n)*scale;
   if(shown('plot_sensor')){context.globalAlpha=elementOpacity('plot_sensor');const intensity=n/maxRecord;context.fillStyle=`rgb(${rgb.red*intensity},${rgb.green*intensity},${rgb.blue*intensity})`;context.fillRect(detectorX,i*canvas.height/p.bins,sensorWidth,canvas.height/p.bins);}
   if(shown('plot_hits')){context.globalAlpha=elementOpacity('plot_hits');context.strokeStyle=context.fillStyle=colorHit;context.beginPath();context.moveTo(x-error,y);context.lineTo(x+error,y);context.stroke();context.beginPath();context.arc(x,y,3,0,2*Math.PI);context.fill();}
  });context.restore();
 }
 function draw(){if(!enabled)return;ensure();syncMode();setupCtx.clearRect(0,0,canvas.width,canvas.height);setupCtx.fillStyle='#344f63';setupCtx.fillRect(0,0,canvas.width,canvas.height);
  setupCtx.save();if(shown('plot_screen')){setupCtx.globalAlpha=elementOpacity('plot_screen');setupCtx.strokeStyle=colorScreen;if(p.source){
   // Show the actual soft transmission profile, not fictitious sharp edges.
   setupCtx.lineWidth=4;for(let j=0;j<canvas.height;j+=2){const mask=aperture((j+1)/toCanvasY/100-yOffset,p);setupCtx.globalAlpha=elementOpacity('plot_screen')*(1-mask*mask);setupCtx.beginPath();setupCtx.moveTo(wallX,j);setupCtx.lineTo(wallX,j+2);setupCtx.stroke();}
  }else{setupCtx.setLineDash([5,5]);setupCtx.beginPath();setupCtx.moveTo(wallX,0);setupCtx.lineTo(wallX,canvas.height);setupCtx.stroke();}}
  setupCtx.setLineDash([]);if(shown('plot_detector')){setupCtx.globalAlpha=elementOpacity('plot_detector');setupCtx.strokeStyle=colorDetector;setupCtx.beginPath();setupCtx.moveTo(detectorX,0);setupCtx.lineTo(detectorX,canvas.height);setupCtx.stroke();}setupCtx.restore();
  drawWave();drawParticles();histogram();drawDetection();window.qonticScaleOverlay?.update();geometryControls?.update();stats();
 }

 function hash(){return '&engine=packet&packetOrigin=source&sourceWidth='+sourceWidth.value+'&packetLength='+length.value+'&packetWidth='+width.value+'&packetCount='+p.particles+'&tailLength='+tailLength.value;}
 const params=new URLSearchParams(location.hash.slice(1));
 for(const [key,el] of [['packetLength',length],['packetWidth',width],['sourceWidth',sourceWidth],['tailLength',tailLength]]){const n=Number(params.get(key));if(params.has(key)&&n>=+el.min&&n<=+el.max){el.value=n;syncPacketInput(el);}}
 const count=+params.get('packetCount');if(count>=1&&count<=5000)$('#MaxPart-group')[0]?.setValueInFirstUnit(count);
 for(const control of [length,width,sourceWidth])control.addEventListener('input',()=>{syncPacketInput(control);resetEngine();draw();});

 const geometryControls=mountPacketGeometry({
  host:document.getElementById('canvas-container'),
  getGeometry(){if(!p)return null;const host=document.getElementById('canvas-container');return {wall:sourcePos,wallFraction:wallX/canvas.width,distance:detectorDistance,height:screenHeight,detectorFraction:detectorX/canvas.width,scaleX:toCanvasX*host.clientWidth/canvas.width,scaleY:toCanvasY*host.clientHeight/canvas.height,busy:window.qonticMWBranches?.busy};},
  onCommit(next){if(next.distance===detectorDistance&&next.height===screenHeight&&next.wall===sourcePos)return;document.getElementById('source-position-group').setValueInFirstUnit(next.wall);document.getElementById('detector-distance-group').setValueInFirstUnit(next.distance);document.getElementById('screen-height-group').setValueInFirstUnit(next.height);setupGeo(false);reset=0;resetEngine();draw();},
  pause(){const running=isAnimating;if(running)document.getElementById('startButton').click();return running;},
  resume(running){if(running&&!isAnimating)document.getElementById('startButton').click();}
 });

 queueMicrotask(()=>{
  for(const id of ['toggleWhichPath','sourceOption','particleRate','particleRate-input','resampleHitsButton']){const el=document.getElementById(id);if(el){el.disabled=true;el.title='Not available for the Gaussian source-packet model';}}
  const origin=document.getElementById('sourceOption');origin.parentElement.classList.remove('bohmian-only');origin.parentElement.classList.add('packet-unused-row');origin.value='isotropic';origin.querySelector('option[value=isotropic]').textContent='Gaussian source';
  const label=document.querySelector('#MaxPart-group label');if(label)label.textContent='Particles / packet:';
  for(const value of ['photon']){const el=document.querySelector('#particleType option[value='+value+']');if(el)el.remove();}
  if(particleType==='photon'){particleType='electron';$('#particleType').val('electron');}
  document.querySelector('#waveFunctionOption option[value=QPotential]')?.remove();if($('#waveFunctionOption').val()==='QPotential'||!$('#waveFunctionOption').val())$('#waveFunctionOption').val('Psi2');
  const species=document.createElement('div');species.className='input-group packet-species';const speciesLabel=document.createElement('label');speciesLabel.htmlFor='particleType';speciesLabel.textContent='Particle:';species.append(speciesLabel,document.getElementById('particleType'));advanced.prepend(species);
  whichPathDetector='none';updateWhichPathButton();setupGeo(false);reset=0;resetEngine();draw();
 });
 return {get viewportWidth(){viewWidth=Math.max(viewWidth,(sourcePos+detectorDistance)/.7);return viewWidth;},get enabled(){return true;},reset:resetEngine,draw,drawWave,drawParticles,histogram,frame,updateMath,hash,pause(){last=null;if(packetAnimationId!==null)cancelAnimationFrame(packetAnimationId);packetAnimationId=null;}};
}
