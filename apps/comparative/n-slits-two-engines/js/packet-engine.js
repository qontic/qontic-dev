import {mountFlowOverlay} from './flow-overlay.js?cache=te13';
import {physicsHTML,viewsHTML,physicsEquations,whichPathPhysicsHTML,whichPathViewsHTML,whichPathEquations,nSlitPhysicsHTML,nSlitViewsHTML,enginesPhysicsHTML,basicPhysicsHTML,basicViewsHTML} from './physics-content.js?cache=te13';
import {drawBinPulse,DETECTOR_PULSE_SECONDS} from './detector-pulse.js?cache=te13';
import {mountPacketGeometry,mountSlitWidth,mountSlitSeparation,trimTail,tailOpacity} from './packet-interaction.js?cache=te13';
import {histogramLayout,surfaceHeightValue,surfaceDisplayDensity,surfacePhaseRate} from './packet-model.js?cache=te13';
import {aperture,sourceCoefficients,sourceComponents,sourceBranches,sourceTransverse,sourceColumn,branchOf,branchCount,detectorBranches,sourceEnvelope,slitBands,sampleSource,sampleTransmittedSource,stepSource,sourceProfile,maximumCoreSafeSeparation} from './source-packet-model.js?cache=te13';
import {detectorLaw,quantumSchedule,recordWithHit,samplePixel} from './packet-outcomes.js?cache=te13';
import {niceFringeGeometryAsync} from './nice-fringes.js?cache=te13';
import {createNumericalEngine} from './numerical-engine.js?cache=te13';
import {buildSlitGeometry,maskTransmission} from './slit-geometry.js?cache=te13';
import {paintPhaseLegend} from './phase-legend-classic.js?cache=te13';
import {classifySlitSide} from './source-packet-model.js?cache=te13';
export function mountPacketEngine({core,advanced,engine:enginePanel=null}){
 physicsEquations.mask='\\phi(y,L^+)=T(y)\\phi(y,L^-),\\qquad T(y)=\\frac1C\\sum_{j\\,\\mathrm{open}}a_j e^{-(y-y_j)^2/(4\\sigma_a^2)},\\quad 0\\le a_j\\le1';
 const panel=document.createElement('div');panel.className='packet-settings';
 panel.innerHTML="<div class=\"input-group packet-inline\"><label for=\"packet-source-width\">Source width σ</label><input id=\"packet-source-width\" aria-label=\"Packet source width\" type=\"range\" min=\"50\" max=\"800\" step=\"5\" value=\"400\"><input aria-label=\"Packet source width value\" type=\"number\" min=\"50\" max=\"800\" step=\"5\" value=\"400\"><output>nm</output></div><div class=\"input-group packet-inline\"><label for=\"packet-length\">Packet length σ</label><input id=\"packet-length\" aria-label=\"Packet length\" type=\"range\" min=\"50\" max=\"200\" step=\"5\" value=\"100\"><input aria-label=\"Packet length value\" type=\"number\" min=\"50\" max=\"200\" step=\"5\" value=\"100\"><output>nm</output></div><div class=\"input-group packet-inline\"><label for=\"packet-slit-width\">Slit width σ</label><input id=\"packet-slit-width\" aria-label=\"Packet slit width\" type=\"range\" min=\"30\" max=\"200\" step=\"5\" value=\"30\"><input aria-label=\"Packet slit width value\" type=\"number\" min=\"30\" max=\"200\" step=\"5\" value=\"30\"><output>nm</output></div><div class=\"input-group packet-inline packet-expert\"><label for=\"packet-slit-extent\" title=\"Expert control: half-width of each drawn slit core, measured in aperture standard deviations.\">Slit extent</label><input id=\"packet-slit-extent\" aria-label=\"Displayed slit core extent in sigma\" type=\"range\" min=\"1\" max=\"5\" step=\"0.5\" value=\"1.5\"><input aria-label=\"Displayed slit core extent value\" type=\"number\" min=\"1\" max=\"5\" step=\"0.5\" value=\"1.5\"><output>σ</output></div>";advanced.prepend(panel);
 const [sourceWidth,length,width]=panel.querySelectorAll('input[type=range],input[type=checkbox]');
 const extent=panel.querySelector('#packet-slit-extent');
 const extentRow=extent.closest('.packet-inline');
 const balanceRow=document.createElement('div');balanceRow.className='input-group packet-inline packet-balance';balanceRow.innerHTML='<label for="packet-slit-balance" title="Expert control, exactly two open slits: attenuate one of them while leaving the other at full field amplitude.">Slit balance</label><input id="packet-slit-balance" aria-label="Relative slit transmission" type="range" min="-100" max="100" step="5" value="0"><button type="button" class="packet-balance-equal" aria-label="Set equal slit transmission" title="Set equal slit transmission">=</button><output>Equal</output>';
 extentRow.after(balanceRow);
 const balance=balanceRow.querySelector('input'),balanceEqual=balanceRow.querySelector('button'),balanceOutput=balanceRow.querySelector('output');
 const syncBalance=()=>{const value=+balance.value;balanceOutput.textContent=value===0?'Equal':value===100?'Upper only':value===-100?'Lower only':`${value>0?'Upper':'Lower'} ${Math.round(100/(1+(1-Math.abs(value)/100)**2))}%`;};
 function slitWidthHelp(directActive=false){const selected=Number(extent.value),n=directActive?3:selected,span=2*n*Number(width.value);width.title='Gaussian transmission σ = '+width.value+' nm. The displayed opening and cyan ticks currently span ±'+n+'σ: '+span.toFixed(0)+' nm total.'+(directActive?' Direct PW displays its fixed ±3σ preparation window.':' The common wave model retains its Gaussian tails.');width.parentElement.querySelector('label').title=width.title;width.parentElement.querySelector('input[type=number]').title=width.title;extent.title=directActive?'Direct PW overrides the wall drawing with its fixed ±3σ preparation window. This selected ±'+selected+'σ extent is retained for ordinary PW, Orthodox and Many-Worlds.':'Expert display control: each drawn opening extends ±'+selected+' aperture σ from its center. The full opening is '+(2*selected*Number(width.value)).toFixed(0)+' nm.';extent.parentElement.querySelector('input[type=number]').title=extent.title;}
 length.title='Packet length is limited to at least 50 nm so kσₓ remains in the narrow-band working range for λ ≤ 50 nm.';length.parentElement.querySelector('input[type=number]').title=length.title;
 const tailRow=document.createElement('div');tailRow.innerHTML="<div class=\"input-group packet-inline\"><label for=\"packet-tail-length\">Tail length</label><input id=\"packet-tail-length\" aria-label=\"Trajectory tail length\" type=\"range\" min=\"0\" max=\"2000\" step=\"25\" value=\"250\"><input aria-label=\"Trajectory tail length value\" type=\"number\" min=\"0\" max=\"2000\" step=\"25\" value=\"250\"><output>nm</output></div>";panel.append(tailRow);const tailLength=tailRow.querySelector('input[type=range]');
 const intervalRow=document.createElement('div');intervalRow.innerHTML='<div class="input-group packet-inline"><label for="packet-interval">Packet interval</label><input id="packet-interval" aria-label="Packet interval" title="Time between source launches, in picoseconds of simulation time. Independent of packet speed and width." type="range" min="0" max="300" step="5" value="0"><input aria-label="Packet interval value" type="number" min="0" max="300" step="5" value="0"><output>ps</output></div>';panel.append(intervalRow);const interval=intervalRow.querySelector('input[type=range]');
 function maxTailSafeSeparation(limit,n){
  const base={sy:+width.value/100,k:2*Math.PI*100/Math.max(1,+document.getElementById('wavelength').value),wall:+document.getElementById('source-position').value/100,sourceSigma:+sourceWidth.value/100};
  const signs=openSlitIds().map(slitCenterSign);
  // config() runs every frame; the binary search costs O(N²) per step, so reuse
  // the answer until the geometry changes.
  const key=JSON.stringify([base,n,limit,signs]);
  if(separationLimitCache.has(key))return separationLimitCache.get(key);
  const value=Math.max(0,Math.floor(100*maximumCoreSafeSeparation(base,n,limit/100,signs)+1e-9));
  if(separationLimitCache.size>64)separationLimitCache.clear();
  separationLimitCache.set(key,value);return value;
 }
 const separationLimitCache=new Map();
 let dynamicWidthMax=200,dynamicSeparationMax=2000;
 let screenRaisePending=false,userSep=null,sepLimitNote='';
 function applyPacketLimits(){
  const screenRange=document.getElementById('screen-height'),screenNumber=document.getElementById('screen-height-input');
  const separationRange=document.getElementById('slit-separation'),separationNumber=document.getElementById('slit-separation-input');
  const height=Math.max(120,+screenRange.value||1200);

  const extentMax=Math.max(1,Math.min(5,Math.floor(height/(4*30)*2)/2));
  extent.max=extentMax;extent.parentElement.querySelector('input[type=number]').max=extentMax;
  if(+extent.value>extentMax)extent.value=extentMax;
  // Direct PW draws and samples a fixed ±3σ window, so its openings must also fit
  // on the wall and hold the transmitted probability (2.122).
  let directPW=false;try{directPW=directed.checked;}catch(_){}
  // Every displayed window (the Slit extent, plus ±3σ under Direct PW) must fit on
  // the wall and hold the transmitted probability; take the strictest limit.
  const n=+extent.value,windows=directPW&&n!==3?[n,3]:[n],widest=Math.max(...windows);
  dynamicWidthMax=Math.max(30,Math.floor(height/(4*widest)/5)*5);
  // With many open slits, the openings (±extent·σ each, 10 nm apart) must still fit side by
  // side on the longest allowed wall (5000 nm): cap the slit width accordingly (3.0-dev.22).
  {const outerSign=Math.max(1,...openSlitIds().map(k=>Math.abs(slitCenterSign(k))));
   if(openSlitIds().length>=2){const fit=Math.floor((5000-10*outerSign)/(2*widest*(outerSign+1))/5)*5;dynamicWidthMax=Math.max(30,Math.min(dynamicWidthMax,fit));}}
  width.max=width.parentElement.querySelector('input[type=number]').max=dynamicWidthMax;
  if(+width.value>dynamicWidthMax)width.value=dynamicWidthMax;
  // The outermost open slit sits at |sign|·d/2 from the axis (|sign| = 1 for two
  // slits), so the room left on the wall is divided by that offset.
  const outer=Math.max(1,...openSlitIds().map(k=>Math.abs(slitCenterSign(k))));
  const sepMaxFor=h=>Math.min(...windows.map(m=>maxTailSafeSeparation(Math.min(2000,Math.max(0,Math.floor((h-2*m*(+width.value))/outer))),m)));
  // Neighbouring slit cores must not overlap (separation ≥ 2·extent·σ). With many slits
  // that needs a longer screen (the wall is as long as the screen): raise the minimum
  // screen length, as the separation maximum already shrinks with N (3.0-dev.21).
  const core=2*widest*(+width.value)+10;let minHeight=120;
  if(openSlitIds().length>=2&&sepMaxFor(5000)>=core){
   let lo=120,hi=5000;
   if(sepMaxFor(lo)<core){while(hi-lo>10){const mid=Math.round((lo+hi)/2);if(sepMaxFor(mid)>=core)hi=mid;else lo=mid;}minHeight=Math.ceil(hi/10)*10;}
  }
  screenRange.min=screenNumber.min=String(minHeight);
  if(height<minHeight){
   screenRange.value=screenNumber.value=String(minHeight);
   const status=document.getElementById('nice-fringes-status');if(status)status.textContent=`Screen length raised to ${minHeight} nm so that the ${openSlitIds().length} slit openings fit on the wall without overlapping.`;
   if(!screenRaisePending){screenRaisePending=true;setTimeout(()=>{screenRaisePending=false;setupGeo(false);draw();},0);}
  }
  dynamicSeparationMax=sepMaxFor(Math.max(height,minHeight));
  const separationMin=openSlitIds().length>=2?Math.min(core,dynamicSeparationMax):0;
  separationRange.min=separationNumber.min=String(separationMin);
  if(+separationRange.value<separationMin)separationRange.value=separationNumber.value=String(separationMin);
  // Compare before lowering max: the browser silently clamps a range input when
  // its max drops, which used to leave the number box showing the old value.
  // The user's separation is remembered: a narrower source (or another limit) may lower the
  // maximum for a while, and the separation comes back when the limit allows it.
  if(userSep==null)userSep=+separationRange.value;
  if(document.activeElement===separationRange||document.activeElement===separationNumber)userSep=Math.max(+separationRange.value,+separationNumber.value||0);
  const requestedSeparation=Math.max(userSep,+separationRange.value,+separationNumber.value||0);
  separationRange.max=separationNumber.max=dynamicSeparationMax;
  separationRange.value=separationNumber.value=String(Math.max(separationMin,Math.min(dynamicSeparationMax,requestedSeparation)));
  {const st=document.getElementById('nice-fringes-status'),note=requestedSeparation>dynamicSeparationMax+.5?`Slit separation limited to ${dynamicSeparationMax} nm (you set ${Math.round(requestedSeparation)} nm): the source and the screen must cover every open slit. It comes back when the limit allows.`:'';
   if(st&&(note||st.textContent===sepLimitNote)){st.textContent=note;}sepLimitNote=note;}
  slitSeparation=+separationRange.value;
  screenHeight=+screenRange.value;
  syncPacketInput(width);syncPacketInput(extent);slitWidthHelp();
  directedRow.title='PW postselection uses a fixed ±3σ window around each Gaussian slit, independently of the displayed ±'+n+'σ Slit extent. It does not add a steering force.';
  separationRange.title='Maximum '+dynamicSeparationMax+' nm: slit cores stay on the wall and the analytical transmitted probability remains concentrated in the drawn openings.';
  separationNumber.title=separationRange.title;
 }
 const directedRow=document.createElement('label');directedRow.className='bohmian-only packet-directed-inline';directedRow.title='PW postselection uses a fixed ±3σ window around each Gaussian slit, independently of the displayed Slit extent. It does not add a steering force.';directedRow.innerHTML='Direct PW <input id="packet-directed-slits" type="checkbox">';const directed=directedRow.querySelector('input');directed.checked=localStorage.getItem('qontic-pw-directed-slits')==='true';
 const slitColorRow=document.createElement('label');slitColorRow.className='bohmian-only packet-slit-colors';slitColorRow.title='Pilot-Wave particle and hit color. Uniform uses the selected particle color. By slit colours each particle by the slit it went through (cyan/orange for two slits, one colour per slit for more) and marks on the screen the band reached by the particles of each slit. Spectrum maps each exact wall-crossing position continuously from blue (top) to yellow (bottom), with each histogram bin using the mean hue of its particles. This changes only the display.';slitColorRow.innerHTML='<span>Color</span><select id="packet-particle-color" aria-label="Pilot-Wave particle color"><option value="uniform">Uniform</option><option value="slit">By slit</option><option value="spectrum">Spectrum</option><option value="updown">Start up/down</option><option value="rightleft">Start ahead/behind</option><option value="quadrant">Start quadrant</option><option value="radial">Start radial</option></select>';const particleColorMode=slitColorRow.querySelector('select');let particleColorEngine='ana';particleColorMode.value=localStorage.getItem('qontic-pw-particle-color')||(localStorage.getItem('qontic-pw-color-by-slit')==='true'?'slit':'uniform');
 function syncPacketInput(control){const number=control.parentElement.querySelector('input[type=number]');number.value=control.value;number.max=control.max;number.min=control.min;control.parentElement.querySelector('output').textContent=control===interval?(+interval.value===0?'Auto':particleType==='neutron'?'ns':'ps'):control===extent?'σ':'nm';if(control===interval)interval.title='0 = wait until the previous packet has completed all outcomes. Positive values set time between source launches in '+(particleType==='neutron'?'nanoseconds':'picoseconds')+' of simulation time; independent of packet speed and width.';}
 for(const number of panel.querySelectorAll('input[type=number]')){const commitNumber=()=>{const range=number.parentElement.querySelector('input[type=range]'),value=Number(number.value);if(Number.isFinite(value))range.value=Math.max(+range.min,Math.min(+range.max,value));range.dispatchEvent(new Event('input',{bubbles:true}));};number.addEventListener('change',commitNumber);number.addEventListener('blur',commitNumber);number.addEventListener('keydown',event=>{if(event.key==='Enter'){commitNumber();number.blur();}});}
 tailLength.addEventListener('input',()=>{syncPacketInput(tailLength);for(const a of particles)trimTail(a.path,+tailLength.value/100);draw();});
 let geometryEditing=false,resumeAfterEditing=false;
 let slitPreviewWidth=null,slitPreviewSeparation=null;
 const displayCenters=()=>slitPreviewSeparation===null?p.centers:openSlitIds().map(k=>slitCenterSign(k)*slitPreviewSeparation/200);
 const displayExtentSigma=()=>interpretation==='bohmian'&&directed.checked?3:(p?.slitExtentSigma??Number(extent.value));
 const detectorFlashes=new Map();
 const style=document.createElement('style');style.textContent='.packet-settings label{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px;margin:6px 0}.packet-settings input[type=range]{grid-column:1/-1;width:100%;min-width:0}.packet-settings label:has(input[type=checkbox]){display:flex;gap:8px}.packet-settings .packet-directed-row{display:block!important;width:100%;grid-column:1/-1;margin:6px 0}.packet-settings .packet-directed-row[hidden]{display:none!important}.packet-settings .packet-directed-row>label{display:flex!important;align-items:center;gap:8px;width:100%;margin:0 0 5px;white-space:nowrap}.packet-settings .packet-directed-row input{flex:0 0 auto}.packet-settings .packet-directed-row .packet-note{display:block;width:100%}.packet-note{font-size:.85em;line-height:1.4;opacity:.85}.physics-notation{width:100%;border-collapse:collapse;margin:16px 0}.physics-notation th,.physics-notation td{padding:8px 12px;border-bottom:1px solid #476477;text-align:left;vertical-align:top}.physics-notation td:first-child{min-width:100px}.packet-equation{overflow-x:auto;padding:8px 0}.packet-equation .katex{font-size:1.1em} .packet-settings,.packet-settings label,.packet-note{color:#dcecf4!important}[data-theme=light] .packet-settings,[data-theme=light] .packet-settings label,[data-theme=light] .packet-note{color:#183343!important}#particleRate-group,#sourceOption,label[for=Source]{display:none!important}.packet-settings .packet-inline{display:grid;grid-template-columns:90px minmax(40px,1fr) 58px 24px;gap:6px;align-items:center;margin:5px 0}.packet-settings .packet-inline label{display:block;margin:0;font-size:12px}.packet-settings .packet-inline input[type=range]{grid-column:auto;width:100%}.packet-species{display:flex!important;align-items:center;gap:6px;margin:0 0 4px;padding-bottom:4px;border-bottom:1px solid var(--border-color,#476477)}.packet-species>label:first-child{width:90px;min-width:90px;margin:0;font-size:12px}.packet-species select{min-width:82px}.packet-species .packet-directed-inline{display:flex;align-items:center;gap:4px;width:auto;min-width:0;margin:0 0 0 auto;font-size:12px;white-space:nowrap;cursor:help}.packet-species .packet-directed-inline[hidden]{display:none!important}.packet-species .packet-directed-inline input{margin:0;flex:0 0 auto}.packet-slit-colors{display:flex!important;align-items:center;gap:6px!important;margin:2px 0 4px 96px!important;font-size:12px;white-space:nowrap;cursor:help}.packet-slit-colors[hidden]{display:none!important}.packet-slit-colors input{margin:0}.packet-slit-key{display:inline-flex;gap:3px}.packet-slit-key i{display:block;width:10px;height:10px;border-radius:50%;background:#22d3ee}.packet-slit-key i+ i{background:#ff9f43}.packet-inline input[type=number]{width:100%;box-sizing:border-box;background:transparent;color:inherit;border:1px solid #476477;border-radius:3px;padding:3px}.packet-inline output{font-size:12px}#source-position-group,#detector-distance-group,#screen-height-group{display:grid!important;grid-template-columns:90px minmax(40px,1fr) 58px 24px;gap:6px;align-items:center;margin:5px 0}#source-position-group label,#detector-distance-group label,#screen-height-group label{margin:0;font-size:12px}#source-position-group input[type=range],#detector-distance-group input[type=range],#screen-height-group input[type=range]{grid-column:auto;width:100%;min-width:0}#source-position-group input[type=number],#detector-distance-group input[type=number],#screen-height-group input[type=number]{width:100%;box-sizing:border-box}#analytical-advanced .input-group{margin-bottom:4px}#analytical-advanced h3{margin:6px 0}.packet-geometry{position:absolute;inset:0;pointer-events:none;z-index:6}.packet-geometry[hidden],#canvas-container:not(.editing-geometry) .packet-geometry{display:none}.qontic-media-toolbar button[aria-label="Edit geometry"][aria-pressed="true"]{background:#286078;outline:2px solid #7ee9fb}.packet-geometry button{position:absolute;pointer-events:auto;touch-action:none;color:#d9f8ff;background:rgba(25,76,90,.2);border:1px solid rgba(110,222,239,.45)}.packet-detector-drag{bottom:3px;width:30px;height:28px;transform:translateX(-100%);cursor:ew-resize;border-radius:5px}.packet-slit-separation-drag{width:56px;height:24px;transform:translate(-50%,-50%);cursor:ns-resize;border-radius:12px!important;font-size:10px!important;background:#24394d!important}.packet-slit-separation-drag[hidden]{display:none!important}.packet-slit-width-drag{font-size:10px!important;width:56px;height:24px;transform:translate(-50%,-50%);cursor:ns-resize;border-radius:5px}.packet-slit-width-drag[hidden]{display:none!important}.packet-wall-drag{bottom:3px;width:30px;height:28px;transform:translateX(-50%);cursor:ew-resize;border-radius:5px}.packet-detector-drag:hover,.packet-geometry button:focus-visible{background:rgba(50,170,195,.5);outline:2px solid #7ee9fb}.packet-height-drag{bottom:3px;transform:translateX(0);width:58px;height:28px;cursor:ns-resize;border-radius:5px;font-size:10px!important}.packet-geometry-guide{position:absolute;top:0;bottom:0;border-left:2px dashed #8fecff}.packet-geometry-value{position:absolute;bottom:35px;right:10px;background:#122e40;color:white;padding:5px;border-radius:4px}.packet-unused-row{display:none!important}#waveCanvas,#partCanvas,#setupCanvas{background:transparent!important}#canvas-container{background:#344f63!important}';document.head.append(style);
 let numLook=localStorage.getItem('qontic-te-num-look')==='analytical'?'analytical':'classic';
 // Numerical shutter (blade) and Show change settings.
 const storedNumOpt=JSON.parse(localStorage.getItem('qontic-te-num-opts')||'{}');
 // Replay used to default to on (each packet re-ran the clicks, so a slit seemed to cycle):
 // stored settings from before dev.12 (no rv) drop it.
 if(!storedNumOpt.rv)delete storedNumOpt.replay;
 const numOpt=Object.assign({dotSize:3,trails:'glow',halfLife:1.5,replay:false,guide:'schrodinger',blade:'reflecting',tau:0,bladeW:4.4,showChange:false,changeGain:5},storedNumOpt);
 // Level of detail (shared controls' level switch). Below Expert the expert-only numerical
 // options take their defaults (not saved), so a hidden control never changes the physics.
 const EXPERT_KEYS=['replay','guide','blade','tau','bladeW','showChange','changeGain','halfLife','dotSize','trails'];
 const EXPERT_DEFAULTS={replay:false,guide:'schrodinger',blade:'reflecting',tau:0,showChange:false};
 let level='expert',expertSaved=null,basicHitsSaved=null;const BASIC_HITS=30;
 const saveNumOpt=()=>{const out={...numOpt,rv:1};if(expertSaved)Object.assign(out,expertSaved);localStorage.setItem('qontic-te-num-opts',JSON.stringify(out));};
 // Repeat with replay (numerical engine): each packet starts from the slits as they were
 // at the start of the recorded packet and replays the slit and detector changes made
 // during it, at the same packet times and with the same blade settings.
 const replay={start:null,events:[],pending:[],applying:false};
 const slitSnapshot=()=>({open:slitOpen.slice(),det:slitDetector.slice()});
 function applySlitSnapshot(st){
  for(let k=0;k<st.open.length;k++){slitOpen[k]=st.open[k];slitDetector[k]=st.det[k];}
  try{syncLegacySlits();syncWhichPathDetector();updateWhichPathButton();updateSlitButton();updateSlitCountControls();}catch(_){}
  replay.applying=true;try{if(!switchMask()){/* geometry no longer fits: stop replaying */replay.events=[];replay.pending=[];}}finally{replay.applying=false;}
 }
 function replayDue(){
  while(replay.pending.length&&num.modelTime+1e-9>=replay.pending[0].t){
   const e=replay.pending.shift(),saved={blade:numOpt.blade,tau:numOpt.tau,bladeW:numOpt.bladeW};
   Object.assign(numOpt,e.opt);pushShutter();applySlitSnapshot(e.state);Object.assign(numOpt,saved);pushShutter();
  }
 }
 let syncShutterUI=()=>{};
 // One-particle preset: 1 particle per packet, Pilot Wave, large glowing dot, long glow trail.
 let onePreset=null;
 function toggleOneParticle(force){
  const group=document.getElementById('MaxPart-group'),on=force??!onePreset;
  if(on&&!onePreset){onePreset={count:+document.getElementById('MaxPart-input').value,dot:numOpt.dotSize,half:numOpt.halfLife,trails:numOpt.trails};group.setValueInFirstUnit(1);Object.assign(numOpt,{dotSize:6,halfLife:8,trails:'glow'});if(interpretation!=='bohmian')changeInterpretation('bohmian');}
  else if(!on&&onePreset){group.setValueInFirstUnit(onePreset.count);Object.assign(numOpt,{dotSize:onePreset.dot,halfLife:onePreset.half,trails:onePreset.trails});onePreset=null;}
  saveNumOpt();syncShutterUI();resetEngine();draw();
 }
 // Expert preset: two open slits, numerical engine, Show change on; slit 2 closes (instant
 // reflecting blade unless the user chose otherwise) when the packet centre reaches the wall.
 function closeSlitPreset(){
  if(typeof isAnimating!=='undefined'&&isAnimating)$('#startButton').trigger('click');
  if(engine!=='numerical')setEngine('numerical');
  numSlits=2;for(let k=0;k<slitOpen.length;k++){slitOpen[k]=true;slitDetector[k]=false;}
  try{slitConfigurationChanged();updateSlitCountControls();}catch(_){}
  Object.assign(numOpt,{showChange:true,replay:false});replay.events=[];replay.pending=[];replay.start=null;saveNumOpt();syncShutterUI();
  const atWall=document.getElementById('slit-at-wall');if(atWall&&!atWall.checked){atWall.checked=true;atWall.dispatchEvent(new Event('change',{bubbles:true}));}
  $('#resetButton').trigger('click');
  setTimeout(()=>{$('#startButton').trigger('click');setTimeout(()=>document.querySelector('#slit-open-buttons [data-slit="1"]')?.click(),150);},50);
 }
 function setLevel(next){
  if(next===level)return;level=next;
  if(level!=='expert'){
   if(!expertSaved){expertSaved={};for(const k of EXPERT_KEYS)expertSaved[k]=numOpt[k];}
   Object.assign(numOpt,EXPERT_DEFAULTS);replay.events=[];replay.pending=[];replay.start=null;
  }else if(expertSaved){Object.assign(numOpt,expertSaved);expertSaved=null;}
  if(level==='basic'){if(onePreset)toggleOneParticle(false);if(engine==='numerical')setEngine('analytical');}
  // Basic: 30 hits per packet (dots arrive one by one); the user's number comes back above Basic.
  {const g=document.getElementById('MaxPart-group'),inp=document.getElementById('MaxPart-input');
   const K='qontic-te-hits-before-basic';let saved=null;try{saved=localStorage.getItem(K);}catch(_){}
   if(g&&inp){if(level==='basic'){if(+inp.value!==BASIC_HITS){try{localStorage.setItem(K,String(+inp.value));}catch(_){}g.setValueInFirstUnit(BASIC_HITS);}}
   else if(saved!=null){if(+inp.value===BASIC_HITS)g.setValueInFirstUnit(+saved);try{localStorage.removeItem(K);}catch(_){}}}}
  syncShutterUI();pushShutter();if(!isAnimating)draw();
 }
 function pushShutter(){if(!num.available||!p)return;num.setShutter({tau:numOpt.tau*p.sx/p.k,mode:numOpt.blade,wOverE:numOpt.bladeW});num.setShowChange(numOpt.showChange);num.setSpin(numOpt.guide==='up'?.5:numOpt.guide==='down'?-.5:0);}
 const classicLook=()=>numericalActive()&&numLook==='classic';
 function mountEngineControls(){
  // Engine tab: engine switch, introduction and the numerical engine's options.
  // Engine tab: a short introduction, the switch, and (numerical engine only) its options.
  const host=enginePanel||document.getElementById('experiment-bar');
  const intro=document.createElement('p');intro.className='engine-intro';
  intro.innerHTML='The same slits, computed in two ways. <a href="#te-engines" class="te-engines-link">What is the difference?</a>';
  const numBox=document.createElement('div');numBox.className='engine-num-box';
  const numHead=document.createElement('h4');numHead.className='engine-num-head';numHead.textContent='Numerical engine';numBox.append(numHead);
  const row=document.createElement('div');row.className='engine-row';row.setAttribute('role','group');row.setAttribute('aria-labelledby','te-engine-label');
  row.innerHTML='<span class="engine-label" id="te-engine-label">Engine</span><button type="button" class="qontic-app-toggle" data-engine="analytical" title="Analytical engine: the paraxial model of this app (closed-form wave, stretched time).">Analytical</button><button type="button" class="qontic-app-toggle" data-engine="numerical" title="Numerical engine: the Schrödinger equation solved on a grid for the same geometry (WebGL2). Each engine keeps its own hits.">Numerical</button><p id="engine-note" class="engine-note"></p>';
  if(enginePanel){enginePanel.append(intro,row,numBox);}else host?.prepend(row);
  row.querySelectorAll('[data-engine]').forEach(b=>b.addEventListener('click',()=>setEngine(b.dataset.engine)));
  if(!num.available){const b=row.querySelector('[data-engine="numerical"]');b.disabled=true;b.title='Numerical engine unavailable: '+num.reason;}
  const slitsRow=document.createElement('div');slitsRow.className='input-group packet-inline engine-slits-row';
  slitsRow.innerHTML='<label title="How the numerical engine models the wall. Reflecting: a thin wall with sharp-edged openings as wide as the drawn slit cores; it reflects the wave that hits it. Absorbing: a thicker wall whose front absorbs most, not all, of the wave that hits it. Mask: the analytical Gaussian aperture (an absorbing layer that keeps the amplitude factor T(y)), for comparing the engines; it does not reflect.">Wall</label><span class="engine-slit-buttons"><button type="button" class="qontic-app-toggle" data-num-slits="reflecting">Reflecting</button><button type="button" class="qontic-app-toggle" data-num-slits="absorbing">Absorbing</button><button type="button" class="qontic-app-toggle" data-num-slits="mask">Mask</button></span>';
  const lookRow=document.createElement('div');lookRow.className='input-group packet-inline engine-slits-row';
  lookRow.innerHTML='<label title="Classic: the colours of the numerical N-slit app (black background, phase blue/red over a purple density, metal wall, particles coloured by slit). App colours: the palette and Show options of the analytical engine.">Colours</label><span class="engine-slit-buttons"><button type="button" class="qontic-app-toggle" data-num-look="classic">Classic</button><button type="button" class="qontic-app-toggle" data-num-look="analytical">App colours</button></span>';
  numBox.append(lookRow);
  // Shutter: a blade slides across a slit opened or closed during a run (numerical engine).
  const shutterBox=document.createElement('div');shutterBox.className='engine-shutter-box';
  shutterBox.innerHTML=`<div class="input-group packet-inline engine-slits-row"><label title="The probability current used in every view: for the flux through the screen (the green curve and the hits) and for the Pilot-Wave velocities v = j/ρ. Schrödinger: j = (ħ/m) Im(ψ*∇ψ). Pauli ↑ / ↓: the current of a spin-½ particle with spin up or down along z (out of the screen), which adds (ħ/2m) ∇×(ρ ẑ). The extra term has zero divergence, so |ψ|² is unchanged; the Pilot-Wave paths change, and the pattern on the screen shifts by a few nm.">Current</label><span class="engine-slit-buttons"><button type="button" class="qontic-app-toggle" data-num-guide="schrodinger">Schrödinger</button><button type="button" class="qontic-app-toggle" data-num-guide="up">Pauli ↑</button><button type="button" class="qontic-app-toggle" data-num-guide="down">Pauli ↓</button></span></div>
   <div class="input-group packet-inline engine-slits-row"><label title="Numerical engine: close an open slit during a run (click its button) and a blade slides across it from its upper edge over the closing time; opening retracts it. Reflecting blade: the wall potential V₀ in the covered part. Absorbing blade: an absorbing potential −iW there (particles removed with the absorbed probability). Clicks before a run apply at once; the Mask wall changes at once.">Blade</label><span class="engine-slit-buttons"><button type="button" class="qontic-app-toggle" data-num-blade="reflecting">Reflecting</button><button type="button" class="qontic-app-toggle" data-num-blade="absorbing">Absorbing</button></span></div>
   <div class="input-group packet-inline"><label for="num-tau" title="Time the blade takes to cross the slit, in units of σₓ/v (the time the packet takes to move one packet length σₓ). 0 = instant.">Closing time</label><input id="num-tau" type="range" min="0" max="10" step="0.5"><input id="num-tau-n" type="number" min="0" max="10" step="0.5"><output>σₓ/v</output></div>
   <div class="input-group packet-inline"><label for="num-bladew" title="Strength of the absorbing blade, W in units of the packet energy E.">Blade W/E</label><input id="num-bladew" type="range" min="0.5" max="20" step="0.5"><input id="num-bladew-n" type="number" min="0.5" max="20" step="0.5"><output></output></div>
   <div class="input-group packet-inline"><label title="Each new packet starts from the slits as they were when the first change was made, and replays the slit and detector changes at the same packet times (with the same blade settings), so the hits keep accumulating for the same experiment. Off: the next packet uses the slits as they are.">Replay clicks</label><input id="num-replay" type="checkbox" style="justify-self:start"><span></span><output></output></div>
   <div class="input-group packet-inline"><label title="Turn on before changing a slit during a run. At the first slit change of a packet a copy of the wave is started that keeps the old slits; the picture then shows the live wave minus that reference (times the gain), the dashed line marks the cut (the part of the wave that had left the wall when the change started), and the canvas gives |δψ|/|ψ| ahead of and behind it. Off with detectors.">Show change</label><input id="num-change" type="checkbox" style="justify-self:start"><input id="num-gain" type="range" min="1" max="50" step="1" title="Change gain"><output id="num-gain-o"></output></div>
   <div class="input-group packet-inline engine-slits-row"><label title="Classic look: Glow keeps a fading image of where the particles have been (half-life below), as in the numerical N-slit app; Lines draws each particle's recent path.">Trails</label><span class="engine-slit-buttons"><button type="button" class="qontic-app-toggle" data-num-trails="glow">Glow</button><button type="button" class="qontic-app-toggle" data-num-trails="lines">Lines</button></span></div>
   <div class="input-group packet-inline"><label for="num-half" title="Glow trails: time for a trail to fade to half its brightness (seconds of real time).">Trail half-life</label><input id="num-half" type="range" min="0.2" max="10" step="0.1"><input id="num-half-n" type="number" min="0.2" max="10" step="0.1"><output>s</output></div>
   <div class="input-group packet-inline"><label for="num-dot" title="Classic look: radius of the glowing particle dots, in pixels.">Particle size</label><input id="num-dot" type="range" min="1" max="8" step="0.5"><input id="num-dot-n" type="number" min="1" max="8" step="0.5"><output>px</output></div>
   <div class="input-group packet-inline engine-slits-row"><label title="One particle per packet in the Pilot-Wave view, with large dots and long trails: follow a single particle through the computed wave, packet after packet (as the numerical N-slit app's one-particle preset). Click again to go back.">Preset</label><span class="engine-slit-buttons"><button type="button" class="qontic-app-toggle" data-num-one="1">One particle</button></span></div>`;
  numBox.append(shutterBox);
  {
    // Pilot-Wave-only options in their own section (hidden in the other views); blade strength
    // only for the absorbing blade; accessible names for every control.
    const rowOf=sel=>numBox.querySelector(sel)?.closest('.input-group');
    const closeBox=document.createElement('div');closeBox.className='te-close-box';closeBox.dataset.levelMin='expert';
    const closeHead=document.createElement('h4');closeHead.className='engine-num-head';closeHead.textContent='Closing a slit during a run';
    const closeNote=document.createElement('p');closeNote.className='engine-note te-close-note';closeNote.textContent='Used only when you click a slit while a packet is in flight: a blade slides across the opening.';
    const closePreset=document.createElement('button');closePreset.type='button';closePreset.className='qontic-app-toggle te-close-preset';closePreset.textContent='Try it: close slit 2 as the packet reaches the wall';
    closePreset.title='Two open slits, numerical engine, Show change on; slit 2 closes when the packet centre reaches the wall.';
    closePreset.addEventListener('click',()=>closeSlitPreset());
    closeBox.append(closeHead,closeNote,closePreset);
    for(const sel of ['[data-num-blade]','#num-tau','#num-bladew','#num-replay','#num-change']){const r=rowOf(sel);if(r)closeBox.append(r);}
    {const g=rowOf('[data-num-guide]');if(g){g.dataset.levelMin='expert';closeBox.before(g);}}
    numBox.append(closeBox);
    const pwBox=document.createElement('div');pwBox.className='te-pw-only';
    const pwHead=document.createElement('h4');pwHead.className='engine-num-head';pwHead.textContent='Pilot Wave view';pwBox.append(pwHead);
    for(const sel of ['[data-num-one]','[data-num-trails]','#num-half','#num-dot']){const r=rowOf(sel);if(r){if(sel!=='[data-num-one]')r.dataset.levelMin='expert';pwBox.append(r);}}
    numBox.append(pwBox);
    const bw=rowOf('#num-bladew');if(bw){bw.classList.add('te-absorbing-blade');bw.querySelector('label').textContent='Absorber W/E';for(const i of bw.querySelectorAll('input'))i.step='0.1';}
    for(const g of numBox.querySelectorAll('.engine-slit-buttons')){const l=g.closest('.input-group')?.querySelector('label');g.setAttribute('role','group');if(l)g.setAttribute('aria-label',l.textContent.trim());}
    for(const [id,lab] of [['num-replay','Replay clicks'],['num-change','Show change']]){const el=numBox.querySelector('#'+id);const l=el?.closest('.input-group')?.querySelector('label');if(l){l.htmlFor=id;}if(el)el.setAttribute('aria-label',lab);}
    numBox.querySelector('#num-gain')?.setAttribute('aria-label','Show change gain');
    for(const n of numBox.querySelectorAll('input[type=number]')){const l=n.closest('.input-group')?.querySelector('label');if(l)n.setAttribute('aria-label',l.textContent.trim()+' (value)');}
  }
  const tauR=numBox.querySelector('#num-tau'),tauN=numBox.querySelector('#num-tau-n'),wR=numBox.querySelector('#num-bladew'),wN=numBox.querySelector('#num-bladew-n'),chg=numBox.querySelector('#num-change'),gain=numBox.querySelector('#num-gain'),gainO=numBox.querySelector('#num-gain-o');
  const halfR=numBox.querySelector('#num-half'),halfN=numBox.querySelector('#num-half-n'),dotR=numBox.querySelector('#num-dot'),dotN=numBox.querySelector('#num-dot-n'),oneB=numBox.querySelector('[data-num-one]');
  numBox.querySelectorAll('[data-num-trails]').forEach(b=>b.addEventListener('click',()=>{numOpt.trails=b.dataset.numTrails;commit();}));
  oneB.addEventListener('click',()=>toggleOneParticle());
  const rep=numBox.querySelector('#num-replay');rep.addEventListener('change',()=>{numOpt.replay=rep.checked;if(!rep.checked){replay.events=[];replay.pending=[];replay.start=null;}commit();});
  const syncOpt=()=>{const ab=numBox.querySelector('.te-absorbing-blade');if(ab)ab.hidden=numOpt.blade!=='absorbing';halfR.value=halfN.value=numOpt.halfLife;dotR.value=dotN.value=numOpt.dotSize;oneB.classList.toggle('active',!!onePreset);oneB.setAttribute('aria-pressed',String(!!onePreset));numBox.querySelectorAll('[data-num-trails]').forEach(b=>{const on=b.dataset.numTrails===numOpt.trails;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});rep.checked=numOpt.replay;tauR.value=tauN.value=numOpt.tau;wR.value=wN.value=numOpt.bladeW;chg.checked=numOpt.showChange;gain.value=numOpt.changeGain;gainO.textContent='×'+numOpt.changeGain;numBox.querySelectorAll('[data-num-blade]').forEach(b=>{const on=b.dataset.numBlade===numOpt.blade;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});numBox.querySelectorAll('[data-num-guide]').forEach(b=>{const on=b.dataset.numGuide===numOpt.guide;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});};
  syncOpt();syncShutterUI=syncOpt;
  const commit=()=>{saveNumOpt();syncOpt();pushShutter();draw();};
  numBox.querySelectorAll('[data-num-blade]').forEach(b=>b.addEventListener('click',()=>{numOpt.blade=b.dataset.numBlade;commit();}));
  numBox.querySelectorAll('[data-num-guide]').forEach(b=>b.addEventListener('click',()=>{numOpt.guide=b.dataset.numGuide;commit();}));
  for(const [r,n,key] of [[tauR,tauN,'tau'],[wR,wN,'bladeW'],[halfR,halfN,'halfLife'],[dotR,dotN,'dotSize']]){r.addEventListener('input',()=>{numOpt[key]=+r.value;commit();});n.addEventListener('change',()=>{const v=Math.max(+n.min,Math.min(+n.max,+n.value||0));numOpt[key]=v;commit();});}
  chg.addEventListener('change',()=>{numOpt.showChange=chg.checked;commit();});
  gain.addEventListener('input',()=>{numOpt.changeGain=+gain.value;commit();});
  lookRow.querySelectorAll('[data-num-look]').forEach(b=>b.addEventListener('click',()=>{numLook=b.dataset.numLook;localStorage.setItem('qontic-te-num-look',numLook);syncEngineControls();draw();}));
  numBox.insertBefore(slitsRow,numHead.nextSibling);
  slitsRow.querySelectorAll('[data-num-slits]').forEach(b=>b.addEventListener('click',()=>{numSlitModel=b.dataset.numSlits;localStorage.setItem('qontic-te-num-wall',numSlitModel);resetEngine();draw();}));
  const css=document.createElement('style');css.textContent='.engine-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px;width:100%;margin:0 0 6px}.engine-row .engine-label{font-size:12px;font-weight:600;margin-right:4px;min-width:52px}.engine-row button{flex:1 1 0;min-width:0}.engine-row button.active,.engine-slit-buttons button.active{background:#2d6e86;border-color:#7ee9fb;color:#fff}.engine-note{flex:1 1 100%;margin:2px 0 0;font-size:11px;line-height:1.35;opacity:.85}.engine-slit-buttons{grid-column:2/-1;display:flex;gap:4px}.engine-slit-buttons button{flex:1;padding:3px 4px;font-size:12px}.engine-panel,#engine-panel{padding:12px 0 0}.engine-num-box .engine-slit-buttons button{padding:3px 2px;font-size:11px}.engine-num-box [data-num-guide="schrodinger"]{flex:1.6 1 0!important;min-width:0}.engine-intro{font-size:12px;line-height:1.45;margin:2px 0 8px;opacity:.9}.engine-num-box{margin-top:8px;padding-top:6px;border-top:1px solid var(--border-color,#476477)}#engine-panel .te-engines-link{color:#7cecff!important;text-decoration:underline}.qontic-light #engine-panel .te-engines-link{color:#075c69!important}.te-close-preset{width:100%;margin:2px 0 6px;white-space:normal}.te-close-note{margin:0 0 4px;font-size:12px;opacity:.85}.engine-num-box[hidden],.te-pw-only[hidden],.te-absorbing-blade[hidden]{display:none!important}.te-pw-only{margin-top:6px;padding-top:4px;border-top:1px dashed var(--border-color,#476477)}.engine-num-head{margin:2px 0 4px;font-size:12px;font-weight:700;letter-spacing:.02em}.te-numerical #manyBranchesInfo{display:none!important}.te-classic #paletteScaleCanvas,.te-classic #paletteRangeSlider,.te-classic #waveRangeLabel,.te-classic .qontic-range-panel{visibility:hidden!important}';document.head.append(css);
 }
 const layoutStyle=document.createElement('style');layoutStyle.textContent='.packet-core-options{display:flex!important;align-items:center;gap:8px;margin:0 0 8px;padding:0 0 8px;border-bottom:1px solid var(--border-color,#476477)}.packet-core-options>select{flex:1 1 78px;min-width:68px}.packet-core-options .packet-directed-inline,.packet-core-options .packet-slit-colors{display:flex!important;align-items:center;gap:4px!important;width:auto;min-width:0;margin:0!important;font-size:12px;white-space:nowrap}.packet-core-options .packet-directed-inline[hidden],.packet-core-options .packet-slit-colors[hidden]{display:none!important}.packet-core-options input{margin:0;flex:0 0 auto}.packet-core-options .packet-slit-colors select{width:86px;min-width:86px;padding:3px 2px;font-size:11px}.packet-settings .packet-balance{grid-template-columns:90px minmax(40px,1fr) 28px 58px}.packet-settings .packet-balance button{width:26px;height:25px;padding:0;border:1px solid #476477;border-radius:4px;background:#153447;color:inherit;font-weight:700;cursor:pointer}.packet-settings .packet-balance button:hover,.packet-settings .packet-balance button:focus-visible{border-color:#62d8e7;background:#1d465c}.packet-settings .packet-balance output{grid-column:auto;text-align:right;min-width:58px}';document.head.append(layoutStyle);
 const math=document.getElementById('math-container'),packetMath=document.createElement('section');packetMath.className='math-section';math.replaceChildren(packetMath);
 let slowPacketMode=false,savedPacketCount=null;
 let atWallQueue=[],atWallPrev=null,transition=null,frameStats=null,frameDtAverage=0,enabled=true,p=null,coeff=null,profile=null,law=null,sourceGrid=null,epochs=[],fingerprint='',particles=[],pending=[],pulses=[],slitHits={},spectrumHitCounts=[],spectrumHitSums=[],nextEmission=0,t=0,totalTime=0,pulse=0,absorbed=0,pulseAbsorbed=0,missed=0,last=null,realElapsed=0,timeUnit=1,yOffset=0,finished=false,packetAnimationId=null,visualPhase=0,flash=null,hold=0,lastMode=interpretation;
 let surfaceView=localStorage.getItem('qontic-double-slit-surface-view')==='true',surfaceHeightMode=localStorage.getItem('qontic-double-slit-surface-height')||'psi2',surfaceHeights=null,surfaceLegend=null,surface3D=null,surface3DLoad=null,pwWaveVisible=localStorage.getItem('qontic-pw-wave-visible')!=='false',pwWaveButton=null;
 if(!['psi2','phase','real','imag'].includes(surfaceHeightMode))surfaceHeightMode='psi2';
 // Slit colours follow the slit, not its rank. Two slits keep the original cyan
 // and orange; more slits use a validated eight-colour categorical order.
 // Slit colours chosen for colour-vision deficiency (3.0-dev.21): worst pair over all 8 is ΔE 8.1 under
 // normal, deutan and protan vision (was 1.4), neighbouring slits ≥ 15.7. Slits 9–16 repeat the 8;
 // band numbers and the caption legend carry the slit number as well.
 const SLIT_PALETTE=['#e69f00','#33bbee','#009988','#f0e442','#9a6fe0','#ff9da7','#d55e00','#e78ac3'];
 const slitColorOf=group=>{const k=+String(group).slice(1);return numSlits===2&&!classicLook()?(k===0?'#22d3ee':'#ff9f43'):SLIT_PALETTE[k%SLIT_PALETTE.length];};
 const slitGroups=()=>Array.from({length:MAX_SLITS},(_,k)=>'k'+k);
 // Colours by starting position (as in the numerical N-slit app): g0 yellow, g1 cyan, g2 red, g3 violet.
 const START_COLORS=['#faf04a','#26f2ff','#ff4730','#bd52ff'];
 const START_MODES=['updown','rightleft','quadrant','radial'];
 // Per packet: start group bits (1 = upper half, 2 = ahead of the packet centre) and radial quartile (equal numbers).
 function assignStartGroups(list){
  if(!list.length)return;
  const cx=list.reduce((s,a)=>s+a.x0,0)/list.length,sx=Math.sqrt(list.reduce((s,a)=>s+(a.x0-cx)**2,0)/list.length)||1,sy=Math.sqrt(list.reduce((s,a)=>s+(a.y0??a.y)**2,0)/list.length)||1;
  const r=list.map((a,i)=>[((a.x0-cx)/sx)**2+(((a.y0??a.y))/sy)**2,i]).sort((u,v)=>u[0]-v[0]);
  r.forEach(([,i],rank)=>{const a=list[i];a.startBits=((a.y0??a.y)<0?1:0)|(a.x0>cx?2:0);a.startQuart=Math.floor(rank*4/list.length);});
 }
 const startGroupOf=(a,mode)=>a.startBits===undefined?null:'g'+(mode==='updown'?a.startBits&1:mode==='rightleft'?(a.startBits&2):mode==='quadrant'?a.startBits:a.startQuart);
 const emptySlitHits=bins=>Object.fromEntries(slitGroups().map(g=>[g,Array(bins).fill(0)]));
 let screenBands=null; // PW: screen band of each open slit (canvas-independent y), from the quantile map
 const spectrumSteps=48;
 const field=document.createElement('canvas'),gridW=640,gridH=480;field.width=gridW;field.height=gridH;const fc=field.getContext('2d');let data=fc.createImageData(gridW,gridH),paletteKey='',paletteColors=null;
 const shown=id=>document.getElementById(id)?.checked;
 const X=x=>(wallXWorld+(p.launch+x)*100)*toCanvasX,Y=y=>(y+yOffset)*100*toCanvasY;
 // ---- Two engines -------------------------------------------------------
 // The analytical engine is the paraxial model of this app. The numerical engine
 // (numerical-engine.js) solves the Schrödinger equation on a grid for the same
 // geometry; its particles are handed to the same drawing, hit and histogram code.
 // One engine runs at a time; each keeps its own hits.
 const num=createNumericalEngine();
 let engine=new URLSearchParams(location.hash.slice(1)).get('numeng')==='1'||new URLSearchParams(location.search).get('engine')==='numerical'?'numerical':'analytical';
 let numStatus=null,numProfile=null,numProfileAt=-Infinity,numSlitModel=['reflecting','absorbing','mask'].includes(localStorage.getItem('qontic-te-num-wall'))?localStorage.getItem('qontic-te-num-wall'):'reflecting';
 const savedHits={analytical:null,numerical:null};
 mountEngineControls();
 window.addEventListener('qontic-engine-tab',()=>{captionKey='';updateCaption();});
 // ?preset=one: the numerical engine's one-particle preset (as in the numerical N-slit app).
 if(new URLSearchParams(location.search).get('preset')==='one')setTimeout(()=>{try{setEngine('numerical');toggleOneParticle(true);}catch(e){console.warn(e);}},300);
 // Zoom (1×, 2×, 4×) of the canvas layers, with drag to pan when zoomed; both engines.
 const zoom={z:1,tx:0,ty:0,drag:null};
 function applyZoom(){
  const host=document.getElementById('canvas-container');if(!host)return;
  const W=host.clientWidth,H=host.clientHeight;zoom.tx=Math.min(0,Math.max(W-W*zoom.z,zoom.tx));zoom.ty=Math.min(0,Math.max(H-H*zoom.z,zoom.ty));
  const t=zoom.z===1?'':`translate(${zoom.tx}px,${zoom.ty}px) scale(${zoom.z})`;
  for(const id of ['setupCanvas','waveCanvas','numericalWaveCanvas','partCanvas']){const el=document.getElementById(id);if(el){el.style.transformOrigin='0 0';el.style.transform=t;}}
  host.style.cursor=zoom.z>1?'grab':'';
  zoomBar?.querySelectorAll('button').forEach(b=>b.classList.toggle('active',+b.dataset.zoom===zoom.z));
  window.qonticScaleOverlay?.zoomed?.();
 }
 let zoomBar=null;
 {
  const host=document.getElementById('canvas-container');
  if(host){
   zoomBar=document.createElement('div');zoomBar.className='te-zoom';zoomBar.setAttribute('role','group');zoomBar.setAttribute('aria-label','Zoom');
   zoomBar.innerHTML='<button type="button" data-zoom="1" title="Whole view">1×</button><button type="button" data-zoom="2" title="Zoom 2× (drag to pan)">2×</button><button type="button" data-zoom="4" title="Zoom 4× (drag to pan)">4×</button>';
   host.append(zoomBar);
   zoomBar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const nz=+b.dataset.zoom,W=host.clientWidth,H=host.clientHeight;
    // keep the centre of the view fixed
    const cx=(W/2-zoom.tx)/zoom.z,cy=(H/2-zoom.ty)/zoom.z;zoom.z=nz;zoom.tx=W/2-cx*nz;zoom.ty=H/2-cy*nz;applyZoom();});
   host.addEventListener('pointerdown',e=>{if(zoom.z===1||e.target.closest('button,input,.packet-geometry,.te-zoom'))return;zoom.drag={x:e.clientX,y:e.clientY,tx:zoom.tx,ty:zoom.ty};host.setPointerCapture(e.pointerId);host.style.cursor='grabbing';});
   host.addEventListener('pointermove',e=>{if(!zoom.drag)return;zoom.tx=zoom.drag.tx+e.clientX-zoom.drag.x;zoom.ty=zoom.drag.ty+e.clientY-zoom.drag.y;applyZoom();});
   const end=()=>{if(zoom.drag){zoom.drag=null;host.style.cursor=zoom.z>1?'grab':'';}};host.addEventListener('pointerup',end);host.addEventListener('pointercancel',end);
   const zcss=document.createElement('style');zcss.textContent='.te-zoom{position:absolute;left:8px;top:50%;transform:translateY(-50%);flex-direction:column;z-index:8;display:flex;gap:2px;opacity:.85}.te-zoom button{font:600 11px Inter,Arial,sans-serif;padding:3px 6px;min-width:30px;border:1px solid #476477;border-radius:4px;background:rgba(18,40,56,.85);color:#dcecf4;cursor:pointer}.te-zoom button.active{background:#2d6e86;border-color:#7ee9fb;color:#fff}#canvas-container{overflow:hidden}@media (pointer:coarse){.te-zoom button{min-width:44px;min-height:40px;font-size:13px}}';document.head.append(zcss);
  }
 }
 const engineWanted=()=>engine==='numerical';
 const numericalActive=()=>engineWanted()&&num.available&&numStatus?.ok;
 // Display only: where the canvas starts (model x), so the packet starts off screen.
 function numView(){return {canvasLeft:-wallXWorld/100-p.launch};}
 function numReset(){
  numProfile=null;numProfileAt=-Infinity;
  if(!engineWanted()||!num.available){numStatus=engineWanted()?{ok:false,reason:num.reason}:null;return;}
  numStatus=num.reset(p,numView(),numSlitModel);pushShutter();
  if(!replay.applying){replay.start=null;replay.events=[];replay.pending=[];replay.packetStart=slitSnapshot();}
  if(numStatus.ok){particles=num.particles;assignStartGroups(particles);pulses=[];nParticles=p.particles;}
 }
 function numProcess(events){
  for(const e of events){
   const a=e.a;
   if(e.type==='wall'){a.slitSide=classifySlitSide(a.wallY,p);continue;}
   a.finishedAt=realElapsed;
   if(e.type==='hit'){const index=Math.floor((e.y+yOffset)/(screenHeight/100)*p.bins);if(index>=0&&index<p.bins){addHit(index,a.slitSide,a.wallY);detectorFlashes.set(index,DETECTOR_PULSE_SECONDS);flash={index,remaining:DETECTOR_PULSE_SECONDS};a.path.length=0;}else missed++;}
   else if(e.type==='absorbed'){absorbed++;}
   else if(e.type==='missed'){missed++;}
  }
 }
 let lastRawDt=0,realSpeedRatio=1;
 function numFrame(motionDt,speed){
  const modelDt=motionDt*speed*p.screen/p.k/6,t0=performance.now(),before=num.modelTime;
  if(replay.pending.length)replayDue();
  numProcess(num.advance(modelDt,1000*(lastRawDt||frameDtAverage||1/60)));
  // The clock follows the time the engine actually advanced (slow frames run fewer steps).
  const advanced=Math.max(0,num.modelTime-before);t+=advanced;totalTime+=advanced;nSteps++;
  // Share of the requested speed actually reached, against real time (slow frames count).
  if(lastRawDt>0){const want=lastRawDt*speed*p.screen/p.k/6;realSpeedRatio=.95*realSpeedRatio+.05*Math.min(1,advanced/want);}
  particles=num.particles;
  if(performance.now()-numProfileAt>250||!numProfile){numProfile=num.profile(-yOffset,screenHeight/100-yOffset);numProfileAt=performance.now();}
  // Next packet once this one has passed the screen. Not when all particles are
  // finished: with narrow slits most are absorbed at the wall early, and the wave
  // would be cut off before it reached the screen. Waves diffracted to wide angles
  // travel farther, hence the factor.
  const passed=(p.screen-num.grid.x0+5*p.sx)/p.k;
  if(num.modelTime>1.6*passed||(num.modelTime>1.15*passed&&particles.every(a=>a.done))){num.newPacket();if(numOpt.replay&&replay.events.length){applySlitSnapshot(replay.start);replay.pending=replay.events.slice().sort((a,b)=>a.t-b.t);}else replay.packetStart=slitSnapshot();particles=num.particles;assignStartGroups(particles);nParticles+=p.particles;}
  if(atWallQueue.length){const centre=num.grid.x0+p.k*num.modelTime;if(centre>=p.wall&&(atWallPrev??-Infinity)<p.wall){const queue=atWallQueue;atWallQueue=[];atWallPrev=null;queue.forEach(f=>f());}else atWallPrev=centre;}
  if(num.changeActive&&performance.now()-(numFrame.changeAt||0)>300){num.updateChangeStats();numFrame.changeAt=performance.now();}
  frameStats={requested:modelDt,advanced,physicsMs:performance.now()-t0,steps:num.steps};
  // Say when the GPU cannot keep up with the requested speed (the run slows, evenly).
  if(nSteps%30===0){const note=document.getElementById('engine-note'),g=num.governor;if(note){const base=note.dataset.base||note.textContent;note.dataset.base=base;
   const per=g.msPerStep?(g.msPerStep>=1?`${g.msPerStep.toFixed(g.msPerStep<10?1:0)} ms`:`${Math.round(g.msPerStep*1000)} µs`)+' per step':'';
   const steps=num.grid?Math.round(1.6*(p.screen-num.grid.x0+5*p.sx)/p.k/(num.grid.h*num.grid.h*num.grid.dt)):0;
   const speed=+$('#animationStep-group')[0].getValueInFirstUnit()||1,tGpu=steps*(g.msPerStep||0)/1000/.7,tShow=1.6*(p.screen-num.grid.x0+5*p.sx)/p.k/(speed*p.screen/p.k/6);
   const est=g.msPerStep&&steps?` A packet is about ${steps.toLocaleString('en-US')} steps, ≈ ${Math.round(Math.max(tGpu,tShow))} s at this rate.`:'';
   note.textContent=realSpeedRatio<.9?`${base} GPU-limited: running at ${Math.round(100*realSpeedRatio)}% of the requested speed (${g.budget} steps per frame${per?', '+per:''}).${est}`:`${base}${per?' '+per+'.':''}${est}`;}}
 }
 function setEngine(next){
  if(next===engine)return;
  savedHits[engine]={hits:hits.slice(),slitHits:JSON.parse(JSON.stringify(slitHits)),spectrumHitCounts:spectrumHitCounts.slice(),spectrumHitSums:spectrumHitSums.slice(),nHits,hitMax,fingerprint};
  engine=next;resetEngine();
  const saved=savedHits[engine];
  if(saved&&saved.fingerprint===fingerprint&&saved.hits.length===hits.length){hits=saved.hits;slitHits=saved.slitHits;spectrumHitCounts=saved.spectrumHitCounts;spectrumHitSums=saved.spectrumHitSums;nHits=saved.nHits;hitMax=saved.hitMax;}
  syncEngineControls();draw();
  window.dispatchEvent(new Event('qontic-engine-change'));
 }
 function syncEngineControls(){
  document.querySelectorAll('[data-engine]').forEach(b=>{const on=b.dataset.engine===engine;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  const note=document.getElementById('engine-note');
  if(note){delete note.dataset.base;note.textContent=engineWanted()?(numericalActive()?`Schrödinger equation on a ${num.grid.nx} × ${num.grid.ny} grid, step λ/${Math.round(2*Math.PI/p.k/num.grid.h)} = ${(num.grid.h*100).toFixed(2)} nm.`:numStatus?.reason||''):'Paraxial model: closed-form wave (fast). The packet moves slower on screen than a real electron, so you can watch it.';}
  const sbox=document.querySelector('.engine-num-box');if(sbox)sbox.hidden=!engineWanted();
  const pwb=document.querySelector('.te-pw-only');if(pwb)pwb.hidden=interpretation!=='bohmian';
  document.querySelectorAll('[data-num-look]').forEach(b=>{const on=b.dataset.numLook===numLook;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  // Classic look: the Show menu does not apply; particles coloured by slit unless chosen otherwise.
  document.body.classList.toggle('te-classic',classicLook());document.body.classList.toggle('te-numerical',numericalActive());
  const show=document.getElementById('waveFunctionOption');if(show){show.disabled=classicLook();for(const id of ['waveFunctionOption','basicsWaveFunctionOption']){const el=document.getElementById(id),row=el?.closest('.input-group');if(row)row.style.display=classicLook()?'none':'';}show.title=classicLook()?'Classic numerical look: phase and density as in the numerical N-slit app (Engine tab → Numerical look).':'';}
  // Each engine keeps its own particle colour; the numerical default is By slit, as in the numerical N-slit app.
  const colorKey=numericalActive()?'num':'ana';
  if(colorKey!==particleColorEngine){particleColorEngine=colorKey;particleColorMode.value=colorKey==='num'?(localStorage.getItem('qontic-te-num-particle-color')||'slit'):(localStorage.getItem('qontic-pw-particle-color')||'uniform');}
  document.querySelectorAll('[data-num-slits]').forEach(b=>{const on=b.dataset.numSlits===numSlitModel;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  try{directed.disabled=engineWanted();}catch(_){}
  // In the numerical engine the hits come from the particles in every view.
  const countLabel=document.querySelector('#MaxPart-group label');if(countLabel&&numericalActive())countLabel.textContent='Part./packet:';
  // The 3D view draws the analytical field; it is off while the numerical engine runs.
  if(numericalActive()&&surfaceView){surfaceView=false;try{syncSurfaceView();}catch(_){}}
  const surfaceBtn=document.querySelector('.qontic-media-toolbar button[aria-label*="3D"]');if(surfaceBtn){surfaceBtn.disabled=numericalActive();surfaceBtn.title=numericalActive()?'3D view: analytical engine only in this preview':surfaceBtn.getAttribute('aria-label');}
 }

 function spectrumIndex(wallY){
  if(!Number.isFinite(wallY)||!p?.centers?.length)return -1;
  const half=displayExtentSigma()*p.sy,lo=Math.min(...p.centers)-half,hi=Math.max(...p.centers)+half;
  return Math.max(0,Math.min(spectrumSteps-1,Math.round((wallY-lo)/Math.max(1e-12,hi-lo)*(spectrumSteps-1))));
 }
 // Spectrum: viridis from 0.2 to 1 (perceptually ordered, readable with colour-vision
 // deficiency and on the dark canvas), instead of an HSL rainbow (3.0-dev.21).
 const VIRIDIS=[[65,68,135],[57,86,140],[47,106,141],[38,130,142],[31,150,139],[33,170,128],[53,183,121],[94,201,98],[144,215,67],[198,224,42],[253,231,37]];
 function spectrumColor(index){const t=index/Math.max(1,spectrumSteps-1)*(VIRIDIS.length-1),i=Math.min(VIRIDIS.length-2,Math.floor(t)),f=t-i,c=VIRIDIS[i].map((v,k)=>Math.round(v+f*(VIRIDIS[i+1][k]-v)));return `rgb(${c[0]},${c[1]},${c[2]})`;}
 function groupColor(group,trajectory=false){return group[0]==='g'?START_COLORS[+group.slice(1)]:group==='default'?(classicLook()&&particleColorMode.value!=='uniform'?'#8b939c':trajectory?colorTraj:colorPart):group[0]==='s'?spectrumColor(+group.slice(1)):slitColorOf(group);}
 function particleColorGroup(a){
  if(particleColorMode.value==='slit'&&a.slitSide)return a.slitSide;
  if(particleColorMode.value==='spectrum'){const index=spectrumIndex(a.wallY);if(index>=0)return `s${index}`;}
  return 'default';
 }
 function syncWhichPathButton(){
  const button=document.getElementById('toggleWhichPath');if(!button)return;
  button.disabled=(p?.centers.length??0)<2;
  // The current behaviour is described by data-tip (double-slit.js); no native title, so no second tooltip.
  button.removeAttribute('title');if(button.disabled)button.title='Open at least two slits to use a which-slit detector.';
 }
 // Pilot-wave screen bands. Coherent trajectories cannot cross, so each keeps the
 // fraction of the probability above it: slit k (weight p_k, cumulative P_k from
 // the top) lands where the screen distribution has between P_(k-1) and P_k above.
 // Not defined with the which-slit detector (a mixture, not one guiding wave).
 function computeSlitBands(){return p?slitBands(p,coeff,screenHeight/100):null;}
 // Display slit of histogram bin i: the slit with most PW hits in it; hits from
 // the other views are assigned by the pilot-wave band of the bin centre.
 function binSlitGroup(i,n){
  const counts={};let classified=0;
  for(const g of slitGroups()){const c=slitHits[g]?.[i]||0;if(c){counts[g]=c;classified+=c;}}
  const unclassified=Math.max(0,n-classified);
  if(unclassified&&screenBands){const y=(i+.5)/p.bins*screenHeight/100-yOffset,band=screenBands.find(b=>y>=b.top&&y<b.bottom);if(band)counts[band.group]=(counts[band.group]||0)+unclassified;}
  let best='k'+(p.slitIds?.[0]??0),max=-1;for(const [g,c] of Object.entries(counts))if(c>max){max=c;best=g;}
  return best;
 }
 function config(){
  applyPacketLimits();
  // Display cap (the transverse pattern does not depend on σx): half the shorter of
  // source–wall and wall–screen, at most 200 nm (was a quarter; 2.128 and earlier).
  length.max=Math.max(50,Math.min(200,Math.floor(Math.min(sourcePos,detectorDistance)/2)));if(+length.value>+length.max)length.value=length.max;
  syncPacketInput(length);syncPacketInput(interval);
  // The slit geometry: one plain object (slit-geometry.js), the single source for
  // both engines. The analytical model's slit fields below are read from it.
  const slitBalance=+balance.value/100,openCount=openSlitIds().length;
  const states=Array.from({length:numSlits},(_,k)=>!slitOpen[k]?'closed':(whichPathDetector!=='none'&&slitDetector[k]?'detector':'open'));
  const geometry=buildSlitGeometry({numSlits,states,separationNm:slitSeparation,slitSigmaNm:+width.value,extentSigma:+extent.value,
   sourceToWallNm:sourcePos,wallToScreenNm:detectorDistance,screenHeightNm:screenHeight,
   openWeights:openCount===2?(slitBalance>=0?[1,1-slitBalance]:[1+slitBalance,1]):null});
  const next={source:true,spherical:false,focused:false,geometry,sx:+length.value/100,sy:geometry.slitSigma,slitExtentSigma:geometry.extentSigma,k:2*Math.PI*100/wavelength,launch:-geometry.wall,wall:geometry.wall,screen:geometry.screen,sourceSigma:+sourceWidth.value/100,bins:Math.max(1,Math.floor(nDetectorPixels)),particles:Math.max(1,Math.min(5000,Math.floor(+document.getElementById('MaxPart-input').value||100))),slits:geometry.open.ids.length};
  next.slitIds=geometry.open.ids;next.separation=slitSeparation;next.numSlits=numSlits;
  next.centers=geometry.open.centers;next.apertureWeights=geometry.open.weights;
  balance.disabled=next.centers.length!==2;balanceRow.title=balance.disabled?'Open exactly two slits to adjust their relative transmission.':'Attenuates one slit at field-amplitude level; Equal leaves both fully open.';
  const detectorSlits=geometry.detectorIds;
  next.whichPath=detectorSlits.length>0&&next.centers.length>=2;
  if(next.whichPath){
   // One branch per slit with a detector (its record says "this slit"), plus one
   // branch for all open slits without a detector (no detector fired); those stay
   // coherent with each other. Branch ids are assigned in slit order, so for two
   // slits branch i is aperture i, exactly as in the double-slit app.
   next.detectorSlots=detectorSlits.map(k=>next.slitIds.indexOf(k));
   next.branchOf=detectorBranches(next.slitIds,detectorSlits);
  }next.initialRight=-worldCanvasDx/1000-.03;next.initialCenter=next.initialRight-6*next.sx;next.duration=(next.screen-next.initialCenter+8*next.sx)/next.k;return next;
 }
 function emissionPeriod(){return slowPacketMode||+interval.value===0?Infinity:(+interval.value)*(particleType==='neutron'?1:.001)/timeUnit;}
 function prepare(){
  pulse++;const cohort={born:t,count:p.particles,active:p.particles,pending:0,absorbed:0,surfacePhase:0};pulses.push(cohort);
  for(let i=0;i<p.particles;i++){const isDirected=interpretation==='bohmian'&&directed.checked,a=isDirected?sampleTransmittedSource(p,Math.random,null,3):sampleSource(p);if(slowPacketMode)a.x0=a.x=p.initialCenter;a.cohort=cohort;a.schedule=interpretation==='bohmian'?quantumSchedule(a,p,law):{at:(p.screen-a.x0)/p.k,type:'hit',index:samplePixel(law.weights)};particles.push(a);}
  assignStartGroups(particles.filter(a=>a.cohort===cohort));
  nParticles+=p.particles;nextEmission=t+emissionPeriod();
 }
 // Mask epochs. In this paraxial model each transverse slice of a packet moves at
 // v = ħk/m and receives the mask when it crosses the wall, so a slit opened or
 // closed at time t₀ changes only the slices that cross the wall after t₀. Slices
 // already beyond the wall keep the old field, and so do the particles in them.
 function liveEpochs(){
  // An epoch is still visible while some slice that crossed the wall in it lies
  // between the wall and the right edge of the canvas.
  const xMax=(worldCanvasDx-wallXWorld)/100-p.launch,span=(xMax-p.wall)/p.k;
  while(epochs.length>1&&t-span>epochs[1].start)epochs.shift();
  return epochs;
 }
 // Mask coefficients in force at x now (the epoch in which that slice crossed the wall).
 function coeffAt(x){if(x<p.wall||epochs.length===1)return coeff;const tw=t-(x-p.wall)/p.k;let c=epochs[0].coeff;for(const E of epochs)if(E.start<=tw)c=E.coeff;return c;}
 const crossingTime=a=>a.cohort.born+(p.wall-a.x0)/p.k; // when this particle's slice reaches the wall
 // Open or close slits without resetting: keep the particles, the record and the
 // clock; slices crossing the wall from now on carry the new mask. Anything else
 // (number of slits, geometry, detector, Many-Worlds slow motion) still resets.
 function switchMask(){
  if(!p||!particles.length)return false;
  if(numericalActive()){
   // Numerical engine: the slits change in the potential at once; the run goes on.
   // Detectors too: the engine keeps the fields of records that still exist, lets ended
   // records evolve freely and starts new ones at the wall's exit face (numerical-engine.js).
   const n2=config(),st=q=>{const {centers,slitIds,apertureWeights,slits,geometry,whichPath,detectorSlots,branchOf,...rest}=q;return JSON.stringify([rest,screenHeight,particleType]);};
   if(st(n2)!==st(p))return false;
   if(!replay.applying&&num.steps>0&&numOpt.replay){if(!replay.start)replay.start=replay.packetStart;replay.events.push({t:num.modelTime,state:slitSnapshot(),opt:{blade:numOpt.blade,tau:numOpt.tau,bladeW:numOpt.bladeW}});}
   if(!num.setGeometry(n2.geometry))return false;
   n2.particles=p.particles;p=n2;coeff=sourceCoefficients(p);fingerprint=configFingerprint(p);
   profile=sourceProfile(p,-yOffset,screenHeight/100-yOffset,2049);law=detectorLaw(p,profile,-yOffset,screenHeight/100-yOffset);screenBands=null;syncWhichPathButton();if(!isAnimating)draw();return true;
  }
  const next=config(),strip=q=>{const {centers,slitIds,apertureWeights,slits,geometry,...rest}=q;return JSON.stringify([rest,screenHeight,particleType]);};
  if(strip(next)!==strip(p)||next.whichPath||p.whichPath||window.qonticMWBranches?.enabled||window.qonticMWBranches?.busy)return false;
  const previous=p;
  // Keep the previous prediction until the slices that crossed the wall before this
  // click have reached the screen: (screen − wall)/v later.
  transition={profile,until:t+(previous.screen-previous.wall)/previous.k};
  p=next;p.particles=previous.particles;coeff=sourceCoefficients(p);fingerprint=configFingerprint(p);
  profile=sourceProfile(p,-yOffset,screenHeight/100-yOffset,2049);law=detectorLaw(p,profile,-yOffset,screenHeight/100-yOffset);
  // Bands are display only: compute them after this click, not inside it.
  screenBands=null;const bandsFor=p;setTimeout(()=>{if(p===bandsFor)screenBands=computeSlitBands();},0);
  epochs.push({p,coeff,start:t,grid:null});
  for(const a of particles){
   if(a.done)continue;
   if(interpretation==='bohmian'){
    // Direct PW conditioned the start on transmission through the old mask. A
    // particle that has not reached the wall yet now faces the new mask, so its
    // fate there is decided by the ordinary transmission rule.
    if(!a.passed&&a.conditionedTransmission)a.conditionedTransmission=false;
   }else if(crossingTime(a)>=t&&a.schedule.type==='hit'){
    // Orthodox and Many Worlds: outcomes not yet past the wall follow the new law.
    a.schedule={...a.schedule,index:samplePixel(law.weights)};
   }
  }
  syncWhichPathButton();if(!isAnimating)draw();return true;
 }
 function resetEngine(){transition=null;if(atWallQueue.length){atWallQueue=[];atWallPrev=null;window.dispatchEvent(new Event('qontic-atwall-cancel'));}
  window.qonticMWBranches?.cancel();detectorFlashes.clear();pending=[];particles=[];pulses=[];nextEmission=0;visualPhase=0;flash=null;hold=0;lastMode=interpretation;p=config();fingerprint=configFingerprint(p);yOffset=screenHeight/200;
  coeff=sourceCoefficients(p);sourceGrid=null;epochs=[{p,coeff,start:-Infinity,grid:null}];profile=sourceProfile(p,-yOffset,screenHeight/100-yOffset,2049);law=detectorLaw(p,profile,-yOffset,screenHeight/100-yOffset);
  timeUnit=(particleType==='neutron'?mNeutron:mElectron)*10000/hbar;syncWhichPathButton();
  hits=Array(p.bins).fill(0);slitHits=emptySlitHits(p.bins);screenBands=computeSlitBands();spectrumHitCounts=Array(p.bins).fill(0);spectrumHitSums=Array(p.bins).fill(0);nHits=0;hitMax=0;logNBranches=0;nParticles=0;trajectories.length=0;absorbed=0;missed=0;t=0;totalTime=0;pulse=0;nSteps=0;last=null;realElapsed=0;prepare();numReset();updateBranchCountDisplay();setWaveRangeAuto(0,1);updateMath();stats();if(typeof syncEngineControls==='function')syncEngineControls();
 }
 function configFingerprint(value){const {particles:count,...preparation}=value;return JSON.stringify([preparation,screenHeight,particleType]);}
 function syncSlowPacketMode(){
  const next=!!window.qonticMWBranches?.enabled;if(next===slowPacketMode)return;
  const group=document.getElementById('MaxPart-group');
  if(next){savedPacketCount=+document.getElementById('MaxPart-input').value;group.setValueInFirstUnit(1);}else if(savedPacketCount!==null){group.setValueInFirstUnit(savedPacketCount);savedPacketCount=null;}
  slowPacketMode=next;
  for(const id of ['MaxPart','MaxPart-input','MaxPart-units'])document.getElementById(id).disabled=next;
  interval.disabled=next;interval.parentElement.querySelector('input[type=number]').disabled=next;
  window.qonticMWBranches?.cancel();pending=[];particles=[];pulses=[];detectorFlashes.clear();flash=null;last=null;lastMode=interpretation;
  if(p){p.particles=next?1:+document.getElementById('MaxPart-input').value;prepare();}
 }
 function ensure(){syncSlowPacketMode();const next=config();if(configFingerprint(next)!==fingerprint)resetEngine();else p.particles=next.particles;}
 function updateMath(){
  packetMath.innerHTML=basicPhysicsHTML+'<div data-level-min="standard">'+physicsHTML+nSlitPhysicsHTML+'<h3>Direct-PW preparation</h3><p>Direct PW samples transmitted configurations within a fixed ±3σₐ window around each Gaussian aperture, independently of the displayed Slit extent. This window contains 99.73% of an isolated Gaussian profile. The green comparison curve remains the common analytical Gaussian-wave prediction rather than introducing a hard finite-core cut.</p><h3>Unequal slit transmission</h3><p>The expert “Slit balance” control works only when exactly two slits are open (it is disabled otherwise). It multiplies the amplitudes of the upper and lower open apertures by factors a₁ and a₂ between zero and one. One slit remains fully open while the other is attenuated; “Upper only” or “Lower only” sets the opposite factor to zero. The analytical Gaussian propagation is unchanged: only the corresponding closed-form component coefficients change. Unequal amplitudes reduce fringe visibility and break the reflection symmetry of the Pilot-Wave velocity field.</p>'+whichPathPhysicsHTML+'<div id="te-engines">'+enginesPhysicsHTML+'</div></div>';
  math.removeAttribute('aria-busy');
  const views=document.getElementById('rationale');views.innerHTML=basicViewsHTML+'<div data-level-min="standard">'+viewsHTML+nSlitViewsHTML+'<h3>3D wave surface</h3><p>The optional interactive 3D view graphs the same analytical field used by the 2D view. Dragging rotates the camera, the wheel or a pinch gesture zooms, and right-dragging pans. The Height selector can graph contrast-enhanced |Ψ|², cos θ, or Re Ψ and Im Ψ with the same enhanced amplitude envelope. The monotonic height boost preserves zeros and ordering but is not a linear amplitude scale; it keeps the weaker transmitted wave readable beside the incident packet. The cos θ choice is a continuous phase display that avoids an artificial moving cliff at the ±π wrap; unlike θ itself, it does not uniquely identify the phase angle. For cos θ, Re Ψ and Im Ψ, the middle of the height range is zero, and the reference grid and apparatus lie on that zero plane; the translucent floor lets negative lobes remain visible below it. To prevent temporal aliasing, the 3D carrier-phase animation is display-capped at 2 rad/s; this changes neither the wavefunction used for guidance nor any simulated timing. Surface color independently retains the wave quantity selected in the ordinary Show control and uses the same slowed display phase in 3D. With which-path tagging, phase and signed height use a density-weighted display of the noninterfering detector-record components rather than treating them as a coherent sum. Height and color are display coordinates and do not add a physical spatial dimension. The detector histogram is likewise graphed vertically above a low detector wall: it uses the same predicted curve, retained hits and square-root count error bars as the 2D histogram. Pilot-Wave particles and trajectories are drawn on a flat plane, not on the graph of the wave: by default the apparatus zero plane, the physical x–y plane. The 3D toolbar’s Particle height slider raises that plane for visibility only, and its Wave slider sets the surface opacity in Pilot-Wave. When Show is set to Phase, a wheel in the corner gives the surface color for each phase angle θ; because the display uses cos θ, +θ and −θ share a color. Their dynamics are always calculated entirely in the physical x–y plane. The Pilot-Wave toolbar eye hides or shows the wave in both the 2D and 3D displays; it does not alter the guidance field or interrupt the simulation.</p><h3>Direct-PW statistics</h3><p>The fixed ±3σₐ Direct-PW window omits only the 0.27% isolated-Gaussian tails. The green curve continues to show the common analytical probability distribution, without a hard central cut. Toggling Direct PW preserves earlier hits and affects new packets.</p>'+whichPathViewsHTML+'</div>';
  views.removeAttribute('aria-busy');
  for(const node of [...packetMath.querySelectorAll('[data-equation]'),...views.querySelectorAll('[data-equation]')]){
   const formula=physicsEquations[node.dataset.equation]??whichPathEquations[node.dataset.equation];
   if(typeof katex!=='undefined')katex.render(formula,node,{displayMode:true,throwOnError:false});
   else node.textContent=formula;
  }
 }
 function syncMode(){
  for(const id of ['waveFunctionOption','basicsWaveFunctionOption']){const select=document.getElementById(id);if(!select)continue;const phase=select.querySelector('option[value=Phase]');if(phase&&phase.textContent!=='Phase (cos θ)')phase.textContent='Phase (cos θ)';if(!select.value)select.value='Phase';}

  directedRow.hidden=slitColorRow.hidden=interpretation!=='bohmian';
  slitWidthHelp(interpretation==='bohmian'&&directed.checked);
  syncPwWaveButton();
  syncWhichPathButton();syncNiceButton();
  const countLabel=document.querySelector('#MaxPart-group label');if(countLabel)countLabel.textContent=interpretation==='bohmian'||numericalActive()?'Part./packet:':'Hits / packet:';
  const countInput=document.getElementById('MaxPart-input');countInput.title=interpretation==='bohmian'?(directed.checked?'Particles per packet, conditioned on transmission through an open slit.':'Incident particles per packet; some are absorbed.'):'Screen registrations per new packet, conditioned on reaching the screen.';
  if(lastMode===interpretation)return;
  // The Pauli term is a pilot-wave guidance law: it applies in the Pilot-Wave view only.
  if(numericalActive())pushShutter();
  {const pwb=document.querySelector('.te-pw-only');if(pwb)pwb.hidden=interpretation!=='bohmian';}
  window.qonticMWBranches?.cancel();detectorFlashes.clear();flash=null;hold=0;
  const wasPW=lastMode==='bohmian',isPW=interpretation==='bohmian';
  // Numerical engine: particles are tracked on the GPU in every view; nothing to rebuild.
  if(wasPW!==isPW&&!numericalActive())for(let i=0;i<particles.length;i++){
   const a=particles[i];if(a.done)continue;
   if(!isPW){a.schedule={at:(p.screen-a.x0)/p.k,type:'hit',index:samplePixel(law.weights)};a.path=[];}
   else{
    // Reconstruct the PW ensemble conditioned on still being unresolved at the
    // current packet age. Before the wall this is the incident Born ensemble.
    // After the wall, survival is exactly the transmitted ensemble, which the
    // analytical conditional sampler draws without rejection or an attempt cap.
    const packetAge=t-a.cohort.born;
    const crossedWall=packetAge>=(p.wall-a.x0)/p.k;
    const b=crossedWall||directed.checked
     ?sampleTransmittedSource(p,Math.random,a.x0,directed.checked?3:null)
     :sampleSource(p,Math.random,a.x0);
    b.y0=b.y;let age=0;while(age<packetAge&&!b.done){const dt=Math.min(.002,packetAge-age);stepSource(b,dt,p,coeff);age+=dt;}
    if(b.done)throw new Error('Active-packet reconstruction reached a completed outcome.');
    b.cohort=a.cohort;particles[i]=b;
   }
  }
  if(wasPW!==isPW&&isPW&&!numericalActive())for(const cohort of pulses)assignStartGroups(particles.filter(a=>a.cohort===cohort));
  lastMode=interpretation;
 }
 function waveShown(){return shown('plot_wave')&&(interpretation!=='bohmian'||pwWaveVisible);}
 function syncPwWaveButton(){
  if(!pwWaveButton)return;
  pwWaveButton.hidden=interpretation!=='bohmian';pwWaveButton.setAttribute('aria-pressed',String(pwWaveVisible));
  pwWaveButton.title=pwWaveVisible?'Hide the Pilot-Wave field without changing particle guidance':'Show the Pilot-Wave field';
 }
 function stats(){
  const mass=particleType==='neutron'?mNeutron:mElectron,speed=hbar/mass*p.k/100;
  $('#waveSpeed').text(speed>=1000?(speed/1000).toFixed(2)+' km/s':speed.toFixed(2)+' m/s');
  $('#particleEnergy').text((.5*mass*(hbar*p.k/(mass*100))**2/1.602176634e-19).toExponential(2)+' eV');
  time=totalTime*timeUnit;$('#systemTime').text(time.toFixed(3)+' ns');$('#realTime').text(realElapsed.toFixed(1)+' s');$('#nhits').text(nHits);$('#shownParticles').text(particles.filter(a=>!a.done).length);$('#maxParticlesDisplay').text(p.particles);$('#nSteps').text(nSteps);$('#noHitCount').text(absorbed+' absorbed · '+missed+(numericalActive()?' reflected or lost at the edges':' missed'));
  const sampleButton=document.getElementById('resampleHitsButton');
  sampleButton.disabled=nHits===0||!!window.qonticMWBranches?.busy||numericalActive();
  sampleButton.title=nHits===0?'Collect screen hits before sampling another branch.':window.qonticMWBranches?.busy?'Finish choosing the current branch first.':'Sample another detector history with the same number of hits, using the packet outcome probabilities.';
 }
 function addHit(index,slitSide=null,wallY=null){hits[index]++;if(slitSide&&slitHits[slitSide])slitHits[slitSide][index]++;const spectrum=spectrumIndex(wallY);if(spectrum>=0){spectrumHitCounts[index]++;spectrumHitSums[index]+=spectrum;}nHits++;hitMax=Math.max(hitMax,hits[index]);logNBranches+=Math.log10(p.bins);}
 function createSurfaceRecord(record){
  const overlay=document.createElement('canvas');overlay.width=canvas.width;overlay.height=canvas.height;const context=overlay.getContext('2d');
  const {probabilityHeights,hitHeights,hitErrors}=histogramLayout(record,profile,screenHeight/100,1);
  if(shown('hit_prob')&&!p.focused){context.strokeStyle=colorProb;context.lineWidth=1.5;context.beginPath();const step=Math.max(1,Math.ceil(probabilityHeights.length/300));for(let i=0;i<probabilityHeights.length;i+=step){const point=surface3D.projectDetector(i/(probabilityHeights.length-1),.08+.9*probabilityHeights[i],overlay.width,overlay.height);i?context.lineTo(point.x,point.y):context.moveTo(point.x,point.y);}context.stroke();}
  context.strokeStyle=context.fillStyle=colorHit;context.lineWidth=1.5;
  record.forEach((n,i)=>{if(!n)return;const v=(i+.5)/record.length,z=.08+.9*hitHeights[i],error=.9*hitErrors[i];
   const point=surface3D.projectDetector(v,z,overlay.width,overlay.height),low=surface3D.projectDetector(v,Math.max(.08,z-error),overlay.width,overlay.height),high=surface3D.projectDetector(v,z+error,overlay.width,overlay.height);
   context.beginPath();context.moveTo(low.x,low.y);context.lineTo(high.x,high.y);context.stroke();context.beginPath();context.arc(point.x,point.y,3,0,2*Math.PI);context.fill();
  });return overlay;
 }
 function processPending(){
  if(!pending.length||window.qonticMWBranches?.busy)return;
  const event=pending.shift(),index=event.index;event.cohort.pending--;
  if(interpretation==='manyworlds'&&window.qonticMWBranches?.enabled){
   event.cohort.branching=true;
   const previous=hits.slice();
   const setRecord=i=>{hits=recordWithHit(previous,i);hitMax=Math.max(...hits);};
   const surfaceBranches=surfaceView&&surface3D;
   const started=window.qonticMWBranches.begin({selected:index,weights:law.weights,detectorFraction:detectorX/canvas.width,sensorFraction:sensorWidth/canvas.width,sensorColor:colorSensor,recordFull:!!surfaceBranches,
    captureFrame:surfaceBranches?((context,w,h,includeWave)=>surface3D.capture(context,w,h,{includeWave,includeRecords:false})):null,
    projectOutcome:surfaceBranches?((pixel,count,w,h)=>surface3D.projectDetector((pixel+.5)/count,.1,w,h)):null,
    createRecord(i){const record=recordWithHit(previous,i);if(surfaceBranches)return createSurfaceRecord(record);const strip=document.createElement('canvas'),scale=Math.min(1,256/canvas.height);strip.width=Math.ceil((canvas.width-detectorX)*scale);strip.height=Math.ceil(canvas.height*scale);const context=strip.getContext('2d');context.scale(scale,scale);context.translate(-detectorX,0);histogram({context,hits:record});return strip;},
    onSplit(){detectorFlashes.clear();nHits++;logNBranches+=Math.log10(p.bins);setRecord(index);updateBranchCountDisplay();stats();},
    onSelect(i){event.cohort.branching=false;setRecord(i);detectorFlashes.clear();flash=null;last=null;draw();}
   });if(started)return;event.cohort.branching=false;
  }
  addHit(index,event.slitSide,event.wallY);detectorFlashes.set(index,DETECTOR_PULSE_SECONDS);flash={index,remaining:DETECTOR_PULSE_SECONDS};
 }
 function integrate(dt){
  const end=t+dt,recordTails=interpretation==='bohmian'&&shown('plot_trajectories')&&+tailLength.value>0;
  for(const a of particles){
   if(a.done)continue;
   if(interpretation==='bohmian'){
    const E=a.passed?(a.epoch||epochs[0]):epochs[epochs.length-1];
    const event=stepSource(a,dt,E.p,E.coeff);
    if(a.passed&&!a.epoch)a.epoch=E;
    if(event==='absorbed'){absorbed++;pulseAbsorbed++;a.cohort.absorbed++;}
    if(event==='hit'){const index=Math.floor((a.y+yOffset)/(screenHeight/100)*p.bins);if(index>=0&&index<p.bins){a.screenDetected=true;pending.push({index,cohort:a.cohort,slitSide:a.slitSide,wallY:a.wallY});a.cohort.pending++;}else missed++;}
    if(a.done){a.finishedAt=realElapsed;a.cohort.active--;}if(recordTails){const prev=a.path.at(-1);if(!prev||a.done||Math.hypot(a.x-prev[0],a.y-prev[1])>=.02)a.path.push([a.x,a.y]);}
    if(a.screenDetected)a.path.length=0;
   }else if(a.schedule.at<=end-a.cohort.born+1e-10){
    a.done=true;a.cohort.active--;if(a.schedule.type==='absorbed'){absorbed++;pulseAbsorbed++;a.cohort.absorbed++;}else if(a.schedule.type==='missed')missed++;else{pending.push({index:a.schedule.index,cohort:a.cohort});a.cohort.pending++;}
   }
  }
  t=end;totalTime+=dt;nSteps++;
 }
 function frame(){
  packetAnimationId=null;if(!isAnimating)return;ensure();syncMode();
  // Real Time counts real seconds (up to 5 s per frame, so a background tab does not jump);
  // the motion uses the frame time capped at 0.1 s.
  const now=performance.now(),rawDt=last===null?0:Math.min(5,(now-last)/1000),wallDt=Math.min(.1,rawDt);last=now;realElapsed+=rawDt;lastRawDt=rawDt;
  // Motion uses a smoothed frame time: one slow frame (hits processed, the wave
  // picture filling in, garbage collection) no longer makes the packet jump; the
  // clock catches up over the next frames instead.
  if(wallDt>0){frameDtAverage=frameDtAverage>0?.9*frameDtAverage+.1*wallDt:wallDt;}
  const motionDt=wallDt>0?Math.min(Math.max(wallDt,.8*frameDtAverage),1.2*frameDtAverage):0;
  if(flash){flash.remaining-=wallDt;if(flash.remaining<=0)flash=null;}
  for(const [index,remaining] of detectorFlashes){if(remaining<=wallDt)detectorFlashes.delete(index);else detectorFlashes.set(index,remaining-wallDt);}
  const speed=+$('#animationStep-group')[0].getValueInFirstUnit()||1;
  const phaseRate=surfacePhaseRate(speed*p.k*p.screen/12);
  for(const cohort of pulses)cohort.surfacePhase=((cohort.surfacePhase??0)+wallDt*phaseRate)%(2*Math.PI);
  const branch=window.qonticMWBranches,slow=branch?.enabled,busy=branch?.busy,waiting=false;
  // Only explicit MW branch inspection holds transport. Ordinary registrations
  // are batched within the frame and never stop an Orthodox/PW packet.
  if(busy||(slow&&pending.length)){
   visualPhase+=motionDt*speed*p.k*p.screen/12;if(!busy&&!waiting)processPending();
  }else if(numericalActive()){
   numFrame(motionDt,speed);
  }else{
   if((slowPacketMode||+interval.value===0)&&particles.every(a=>a.done)&&!pending.length)prepare();
   let remaining=motionDt*speed*p.screen/p.k/6,limit=0;const requested=remaining,tStart=t;
   const step=interpretation==='bohmian'?Math.min(.005,.02*p.sy*p.sy,p.screen/p.k/300,p.sx/p.k/30):Infinity;
   while(remaining>1e-10&&isAnimating&&!(slow&&pending.length)&&limit++<4000){
    if(t>=nextEmission-1e-10)prepare();
    const arrival=slowPacketMode?Math.min(...particles.filter(a=>!a.done).map(a=>a.cohort.born+a.schedule.at)):Infinity;
    const dt=Math.min(step,remaining,nextEmission-t,Math.max(0,arrival-t));integrate(dt);remaining-=dt;
    // Yield between complete physics steps: no particle or hit is dropped.
    // Under load, advance simulation time more slowly instead of blocking input.
    if(performance.now()-now>=12)break;
   }
   frameStats={requested,advanced:t-tStart,physicsMs:performance.now()-now,steps:limit};
   // "Apply at wall": run queued slit changes when the newest packet's centre crosses the wall.
   if(atWallQueue.length&&pulses.length){
    const latest=pulses[pulses.length-1],centre=(p.initialCenter??0)+p.k*(t-latest.born);
    const before=atWallPrev&&atWallPrev.born===latest.born?atWallPrev.centre:-Infinity;atWallPrev={born:latest.born,centre};
    if(before<p.wall&&centre>=p.wall){const queue=atWallQueue;atWallQueue=[];atWallPrev=null;queue.forEach(f=>f());}
   }
   if(!waiting){if(slow)processPending();else while(pending.length)processPending();}
  }
  if(!numericalActive())particles=particles.filter(a=>!a.done||(interpretation==='bohmian'&&!a.screenDetected&&realElapsed-(a.finishedAt??realElapsed)<.8));
  pulses=pulses.filter(c=>c.active||c.pending||t-c.born<p.duration);
  updateBranchCountDisplay();const drawStart=performance.now();draw();if(frameStats)frameStats.drawMs=performance.now()-drawStart;branch?.refreshFrame();$('#stepTime').text((performance.now()-now).toFixed(1));if(isAnimating)packetAnimationId=requestAnimationFrame(evolveSystem);
 }
 function drawWave(){ensure();drawSourceWave();}
 async function ensureSurface3D(){
  if(surface3D)return surface3D;
  if(!surface3DLoad)surface3DLoad=import('./packet-surface-3d.js?cache=te13').then(({mountPacketSurface3D})=>{
   surface3D=mountPacketSurface3D({host:document.getElementById('canvas-container')});configureSurfaceEditor();surface3D.configureHeight(surfaceHeightMode,mode=>{surfaceHeightMode=mode;localStorage.setItem('qontic-double-slit-surface-height',mode);draw();});surface3D.setVisible(surfaceView);surface3D.setEditing(geometryEditing);draw();return surface3D;
  }).catch(error=>{surface3DLoad=null;surfaceView=false;syncSurfaceView();console.error('Unable to start the 3D renderer',error);});
  return surface3DLoad;
 }
 function hitMarkerColor(i,n){
  if(interpretation!=='bohmian')return colorHit;
  if(particleColorMode.value==='uniform')return colorPart;
  if(particleColorMode.value==='spectrum'){const spectrum=spectrumHitCounts[i]?Math.round(spectrumHitSums[i]/spectrumHitCounts[i]):Math.round((i+.5)/p.bins*(spectrumSteps-1));return spectrumColor(spectrum);}
  return slitColorOf(binSlitGroup(i,n));
 }
 function updateSurface3D(){
  if(!surfaceView||!surface3D||!p)return;
  const half=displayExtentSigma()*(slitPreviewWidth??p.sy*100)*toCanvasY;
  const openings=displayCenters().map(center=>[Math.max(0,(Y(center)-half)/canvas.height),Math.min(1,(Y(center)+half)/canvas.height)]).filter(([a,b])=>b>a);
  const {probabilityHeights,hitHeights,hitErrors}=histogramLayout(hits,profile,screenHeight/100,1);
  const trails=[],points=[];
  if(interpretation==='bohmian')for(const a of particles){
   const group=particleColorGroup(a),opacity=tailOpacity(a.done,a.finishedAt??realElapsed,realElapsed);
   if(opacity&&a.path.length)trails.push({color:groupColor(group,true),points:a.path.map(([x,y])=>[Math.max(0,Math.min(1,X(x)/detectorX)),Math.max(0,Math.min(1,Y(y)/canvas.height))])});
   if(!a.done)points.push({color:groupColor(group),u:Math.max(0,Math.min(1,X(a.x)/detectorX)),v:Math.max(0,Math.min(1,Y(a.y)/canvas.height))});
  }
  surface3D.update({gridWidth:gridW,gridHeight:gridH,fieldFraction:detectorX/canvas.width,heightMode:surfaceHeightMode,heights:surfaceHeights,phaseLegend:surfaceLegend,rgba:data.data,
   showWave:waveShown(),showScreen:shown('plot_screen')&&p.source,showDetector:shown('plot_detector'),showProbability:shown('hit_prob')&&!p.focused,showHits:shown('plot_hits'),showParticles:shown('plot_particles'),showTrajectories:shown('plot_trajectories'),
   wallFraction:wallX/detectorX,openings,apertureWeights:p.apertureWeights||[],whichPathFractions:p.whichPath?p.detectorSlots.map(slot=>Y(p.centers[slot])/canvas.height):[],
   pilotWave:interpretation==='bohmian',detectorColor:colorDetector,screenColor:colorScreen,probabilityColor:colorProb,
   opacity:{wave:elementOpacity('plot_wave'),screen:elementOpacity('plot_screen'),detector:elementOpacity('plot_detector'),probability:elementOpacity('hit_prob'),hits:elementOpacity('plot_hits'),particles:elementOpacity('plot_particles'),trajectories:elementOpacity('plot_trajectories')},probability:probabilityHeights,hits,hitHeights,hitErrors,hitColors:hits.map((value,index)=>hitMarkerColor(index,value)),particles:points,trails});
 }
 // Field grid of one mask epoch. The first epoch of a run is built at once, as
 // before. After a slit is opened or closed the new grid is built column by
 // column from the wall outward: only the columns between the wall and the
 // boundary of the new pattern are needed immediately (fillGrid), the rest are
 // filled a few milliseconds per frame, so the animation does not pause.
 // Display colour of each which-slit branch: the colour of its first slit (for two
 // slits cyan and orange, as before).
 function branchColorsOf(p){
  if(!p.whichPath)return [];const map=branchOf(p),out=[];
  map.forEach((b,slot)=>{if(!out[b]){const hex=slitColorOf('k'+p.slitIds[slot]);out[b]=[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];}});
  return out;
 }
 function buildGrid(E,key,prev=null){
  const p=E.p,xs=Array.from({length:gridW},(_,i)=>((i+.5)/gridW*worldCanvasDx-wallXWorld)/100-p.launch);
  const nb=p.whichPath?branchCount(p):0,G={key,E,xs,nb,branchColors:branchColorsOf(p),values:new Float64Array(gridW*gridH*2),branches:new Float64Array(gridW*gridH*3*Math.max(1,nb)),mix:nb?new Float32Array(gridW*gridH*3):null,visibility:new Float32Array(gridW*gridH),phaseCos:new Float32Array(gridW*gridH),phaseSin:new Float32Array(gridW*gridH),maxRho:0,filled:0,whichPath:!!p.whichPath};
  if(!prev||prev.key!==key){
   // New geometry: estimate the density maximum on a coarse sub-grid (for the
   // display normalization), then fill columns as the packet reaches them.
   const coeff=E.coeff;
   for(let i=0;i<gridW;i+=8)for(let j=0;j<gridH;j+=4){const y=(j+.5)/gridH*screenHeight/100-yOffset,r=sourceTransverse(y,xs[i],p,coeff).rho;if(r>G.maxRho)G.maxRho=r;}
   return G;
  }
  // Before the wall the field does not depend on the mask: copy those columns.
  G.maxRho=prev.maxRho;
  while(G.filled<gridW&&xs[G.filled]<p.wall&&G.filled<prev.filled){
   const i=G.filled++;
   for(let j=0;j<gridH;j++){const c=j*gridW+i;G.values[2*c]=prev.values[2*c];G.values[2*c+1]=prev.values[2*c+1];G.visibility[c]=prev.visibility[c];G.phaseCos[c]=prev.phaseCos[c];G.phaseSin[c]=prev.phaseSin[c];}
  }
  return G;
 }
 const columnRho=new Float64Array(gridH),columnPhase=new Float64Array(gridH);let columnYs=null,columnYsKey='';
 function gridYs(){const key=screenHeight+','+yOffset;if(columnYsKey!==key){columnYsKey=key;columnYs=Float64Array.from({length:gridH},(_,j)=>(j+.5)/gridH*screenHeight/100-yOffset);}return columnYs;}
 function fillColumn(G,i,withVisibility=true){
  const p=G.E.p,coeff=G.E.coeff,x=G.xs[i];
  if(!(p.whichPath&&x>=p.wall)){
   // One call per column: the x-dependent factors are shared by its cells.
   sourceColumn(x,gridYs(),p,coeff,columnRho,columnPhase);
   for(let j=0;j<gridH;j++){const n=2*(j*gridW+i),rho=columnRho[j];G.values[n]=rho;G.values[n+1]=columnPhase[j];if(rho>G.maxRho)G.maxRho=rho;}
   if(withVisibility)columnVisibility(G,i);
   return;
  }
  for(let j=0;j<gridH;j++){
   const y=(j+.5)/gridH*screenHeight/100-yOffset,cell=j*gridW+i,n=2*cell;
   if(p.whichPath&&x>=p.wall){
    // Per branch: density and unit phase vector. The density-weighted colour and
    // phase do not depend on time, so they are stored here, not recomputed per frame.
    const components=sourceBranches(y,x,p,coeff),stride=3*G.nb,base=stride*cell,colors=G.branchColors;let rho=0,pc=0,ps=0,mr=0,mg=0,mb=0;
    for(let branch=0;branch<G.nb;branch++){const c=components[branch],r=c.rho,a=Math.hypot(c.re,c.im)||1,co=c.re/a,si=c.im/a;G.branches[base+3*branch]=r;G.branches[base+3*branch+1]=co;G.branches[base+3*branch+2]=si;rho+=r;pc+=r*co;ps+=r*si;mr+=r*colors[branch][0];mg+=r*colors[branch][1];mb+=r*colors[branch][2];}
    const inv=1/Math.max(1e-300,rho);G.mix[3*cell]=mr*inv;G.mix[3*cell+1]=mg*inv;G.mix[3*cell+2]=mb*inv;
    G.values[n]=rho;G.values[n+1]=Math.atan2(ps,pc);if(rho>G.maxRho)G.maxRho=rho;
   }else{
    const g=sourceTransverse(y,x,p,coeff);G.values[n]=g.rho;G.values[n+1]=Math.atan2(g.im,g.re);if(g.rho>G.maxRho)G.maxRho=g.rho;
   }
  }
  if(withVisibility)columnVisibility(G,i);
 }
 function columnVisibility(G,i){
  const p=G.E.p,gain=2+6*(1-Math.exp(-Math.max(0,G.xs[i]-p.wall)/.35));
  for(let j=0;j<gridH;j++){const c=j*gridW+i;G.phaseCos[c]=Math.cos(G.values[2*c+1]);G.phaseSin[c]=Math.sin(G.values[2*c+1]);G.visibility[c]=1-Math.exp(-4*Math.sqrt(G.values[2*c]*gain/Math.max(1e-30,G.maxRho)));}
 }
 // Fill columns up to `target` now; then keep filling for at most `budget` ms.
 function fillGrid(G,target,budget){
  const t0=performance.now();
  while(G.filled<gridW&&(G.filled<=target||performance.now()-t0<budget))fillColumn(G,G.filled++);
 }

 // Phase & |Ψ|: colour from the wave palette chosen in Display, indexed by cos θ
 // as in "Phase (cos θ)" (continuous, so no seam where θ crosses ±π);
 // brightness = |Ψ|.
 const cosIndex=c=>Math.max(0,Math.min(1023,Math.round((.5+.5*c)*1023)));
 const phaseIndex=theta=>cosIndex(Math.cos(theta));
 const hueCss=theta=>{const c=paletteColors?.[phaseIndex(theta)]||[128,128,128];return `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;};
 let wheelCache=null;
 function drawPhaseWheel(context,cx,cy,r){
  context.save();
  // Colour by cos θ around the wheel; opacity grows with |Ψ| from the centre out,
  // as in the wave (drawn offscreen so the fade shows the background).
  // Built once per palette and size, not every frame.
  const size=2*r+2,c0=size/2,wheelKey=paletteKey+','+r;
  if(wheelCache?.key!==wheelKey){
   const off=document.createElement('canvas');off.width=off.height=size;const o=off.getContext('2d');
   for(let k=0;k<72;k++){const a0=-k*Math.PI/36,a1=-(k+1)*Math.PI/36;o.beginPath();o.moveTo(c0,c0);o.arc(c0,c0,r,a1,a0);o.closePath();o.fillStyle=hueCss((k+.5)*Math.PI/36);o.fill();}
   const g=o.createRadialGradient(c0,c0,0,c0,c0,r);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');
   o.globalCompositeOperation='destination-out';o.fillStyle=g;o.fillRect(0,0,size,size);
   wheelCache={key:wheelKey,canvas:off};
  }
  context.drawImage(wheelCache.canvas,cx-c0,cy-c0);
  context.strokeStyle='rgba(255,255,255,.6)';context.lineWidth=1;context.beginPath();context.arc(cx,cy,r,0,2*Math.PI);context.stroke();
  context.fillStyle='#e8f4f8';context.font='10px Inter,Arial,sans-serif';context.textAlign='center';context.textBaseline='middle';
  context.fillText('0',cx+r+8,cy);context.fillText('π',cx-r-8,cy);context.fillText('±π/2',cx,cy-r-8);
  context.fillText('cos θ',cx,cy-r-20);context.font='9px Inter,Arial,sans-serif';context.fillText('|Ψ| → edge',cx,cy+r+20);
  context.restore();
 }
 // Phase key of the classic look (as in the numerical N-slit app), bottom right of the field.
 let classicLegend=null;
 // Classic look: glowing dots (sprites per colour) and fading glow trails (as in the numerical N-slit app).
 const glowSprites=new Map();
 function glowSprite(color,r){const key=color+r;let c=glowSprites.get(key);if(c)return c;c=document.createElement('canvas');const n=Math.ceil(r*2.6);c.width=c.height=2*n;const g=c.getContext('2d'),gr=g.createRadialGradient(n,n,0,n,n,n);const q=document.createElement('canvas').getContext('2d');q.fillStyle=color;const hex=q.fillStyle,rgb=hex[0]==='#'?[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(','):hex.replace(/rgba?\(|\)/g,'').split(',').slice(0,3).join(',');const lite=rgb.split(',').map(v=>Math.round(+v+(255-v)*.45)).join(',');gr.addColorStop(0,`rgba(${lite},1)`);gr.addColorStop(.14,`rgba(${lite},.95)`);gr.addColorStop(.26,`rgba(${rgb},1)`);gr.addColorStop(.38,`rgba(${rgb},.9)`);gr.addColorStop(.55,`rgba(${rgb},.35)`);gr.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=gr;g.fillRect(0,0,2*n,2*n);glowSprites.set(key,c);return c;}
 let trailCanvas=null,trailCtx=null,trailAt=null;
 function updateTrails(groupOf,show){
  if(!trailCanvas||trailCanvas.width!==canvas.width||trailCanvas.height!==canvas.height){trailCanvas=document.createElement('canvas');trailCanvas.width=canvas.width;trailCanvas.height=canvas.height;trailCtx=trailCanvas.getContext('2d');}
  const now=realElapsed,dt=trailAt===null?0:Math.max(0,now-trailAt);trailAt=now;
  if(dt>0){trailCtx.globalCompositeOperation='destination-out';trailCtx.fillStyle=`rgba(0,0,0,${(1-Math.pow(.5,dt/Math.max(.05,numOpt.halfLife))).toFixed(4)})`;trailCtx.fillRect(0,0,trailCanvas.width,trailCanvas.height);}
  trailCtx.globalCompositeOperation='lighter';
  if(show&&isAnimating)for(const a of particles){if(a.done)continue;trailCtx.fillStyle=groupColor(groupOf(a),true);trailCtx.globalAlpha=.35;trailCtx.beginPath();trailCtx.arc(X(a.x),Y(a.y),1.6,0,2*Math.PI);trailCtx.fill();}
  trailCtx.globalAlpha=1;trailCtx.globalCompositeOperation='source-over';
 }
 // Show change: dashed cut line and |δψ|/|ψ| ahead of and behind it.
 function drawChangeOverlay(){
  if(!(numOpt.showChange&&num.changeActive))return;
  const st=num.changeStats,ctx=setupCtx;ctx.save();ctx.globalAlpha=1;
  if(st){const x=X(st.cutX);if(x>X(p.wall)&&x<detectorX){ctx.strokeStyle='rgba(255,230,160,.85)';ctx.setLineDash([6,5]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();ctx.setLineDash([]);}}
  const pct=v=>v==null?'—':v<.001?'<0.1%':(100*v).toFixed(v<.1?1:0)+'%';
  const narrow=detectorX<620,at=st?.final?(narrow?' (screen)':' (when the cut reached the screen)'):'';
  const text=st?(narrow?`|δψ|/|ψ| ahead ${pct(st.ahead)} · behind ${pct(st.behind)}${at}`:`|δψ|/|ψ| behind the wall · ahead of the cut ${pct(st.ahead)} · behind it ${pct(st.behind)}${at} · picture: change × ${numOpt.changeGain}`):'Show change: reference run started';
  ctx.font='600 12px Inter,Arial,sans-serif';const w=ctx.measureText(text).width+16;ctx.fillStyle='rgba(20,30,45,.85)';const x0=narrow?8:110;ctx.fillRect(x0,canvas.height-32,w,22);ctx.fillStyle='#ffe6a0';ctx.textBaseline='middle';ctx.fillText(text,x0+8,canvas.height-21);
  ctx.restore();
 }
 function drawClassicLegend(){
  if(!classicLegend)classicLegend=paintPhaseLegend(document.createElement('canvas'),2);
  const s=Math.max(.65,Math.min(1,detectorX/900,canvas.height/600)),w=168*s,h=148*s,m=12*s;if(detectorX<w+60)return;
  setupCtx.save();setupCtx.globalAlpha=1;setupCtx.drawImage(classicLegend,detectorX-w-m,canvas.height-h-m,w,h);setupCtx.restore();
 }
 function numLayer(on){
  const el=num.canvas,waveCanvas=waveCtx?.canvas;if(!el||!waveCanvas)return;
  if(on&&!el.isConnected){el.id='numericalWaveCanvas';el.style.position='absolute';el.style.zIndex='0';el.style.pointerEvents='none';waveCanvas.after(el);try{applyZoom();}catch(_){}}
  if(!el.isConnected)return;
  if(!on){if(el.style.display!=='none')el.style.display='none';return;}
  el.style.display='';
  const st=el.style,L=waveCanvas.offsetLeft+'px',T=waveCanvas.offsetTop+'px',W=waveCanvas.clientWidth+'px',H=waveCanvas.clientHeight+'px';
  if(st.left!==L)st.left=L;if(st.top!==T)st.top=T;if(st.width!==W)st.width=W;if(st.height!==H)st.height=H;
 }
 function drawNumericalWave(){
  setWaveRangeAuto(0,1);const range=getWaveRangeEffective(),span=Math.max(1e-9,range.max-range.min),mode=$('#waveFunctionOption').val();
  if(paletteKey!==graphPalette||!paletteColors){paletteKey=graphPalette;paletteColors=Array.from({length:1024},(_,i)=>window.paletteModule.getColorForValue(i/1023,graphPalette));}
  const g=num.grid,x0=-wallXWorld/100-p.launch,y0=-yOffset;
  const img=num.render({width:canvas.width,height:canvas.height,map:[num.gridX(x0),worldCanvasDx/100/g.h,num.gridY(y0),screenHeight/100/g.h],fieldU:detectorX/canvas.width,
   show:classicLook()?4:mode==='Phase'?1:mode==='LogPsi2'?2:mode==='PhaseAmp'?3:0,palette:paletteColors,paletteName:graphPalette,lo:range.min,inv:1/span,alpha:elementOpacity('plot_wave'),change:numOpt.showChange&&num.changeActive,changeGain:numOpt.changeGain});
  if(classicLook())return;
  if(mode==='PhaseAmp')drawPhaseWheel(waveCtx,detectorX-48,canvas.height-58,20);
  drawPaletteScale(graphPalette,mode==='Phase'?2*range.min-1:range.min,mode==='Phase'?2*range.max-1:range.max);
 }
 // The wall the numerical engine uses, at its true thickness: reflecting (metal),
 // absorbing (absorbing front, metal back) or the analytical mask (band shaded by 1 - T(y)).
 function drawNumericalWall(){
  const g=p.geometry,mode=numSlitModel,ctx=setupCtx;
  const thick=(mode==='mask'?g.apertureLayer:mode==='absorbing'?g.absorbingWallThickness:g.wallThickness)*100*toCanvasX;
  const w=Math.max(3,thick),x0=X(g.wall)-w/2;
  ctx.save();ctx.globalAlpha=elementOpacity('plot_screen');
  if(mode==='mask'){
   const rgb=getRGBComponents(colorScreen);
   for(let yc=0;yc<canvas.height;yc+=2){const T=maskTransmission(yc/(100*toCanvasY)-yOffset,g);ctx.fillStyle=`rgba(${rgb.red},${rgb.green},${rgb.blue},${(0.9*(1-T)).toFixed(3)})`;ctx.fillRect(x0,yc,w,2);}
  }else{
   const half=g.openingHalf*100*toCanvasY;
   // Openings of all slits; a blade covers the upper part of a slit by its fill fraction.
   const fills=num.slitFills.length?num.slitFills:g.slits.map(sl=>({center:sl.center,v:sl.state==='closed'?1:0,w:0}));
   const blades=[];
   const openings=fills.map(f=>{const c=Y(f.center),ff=Math.min(1,f.v+f.w);if(ff>0)blades.push([c-half,c-half+2*half*ff,f.w>f.v]);return [c-half+2*half*ff,c+half];}).filter(([a,b])=>b>a+.5).sort((a,b)=>a[0]-b[0]);
   const solid=[];let cursor=0;for(const [top,bottom] of openings){if(top>cursor)solid.push([cursor,top]);cursor=Math.max(cursor,bottom);}if(cursor<canvas.height)solid.push([cursor,canvas.height]);
   for(const [top,bottom] of solid){
    const metal=classicLook()?ctx.createLinearGradient(x0,0,x0+w,0):colorScreen;
    if(classicLook()){metal.addColorStop(0,'#2e3a4a');metal.addColorStop(.32,'#708594');metal.addColorStop(1,'#34404e');}
    if(mode==='absorbing'){ctx.fillStyle=classicLook()?'#5a3420':'#7a4a22';ctx.fillRect(x0,top,0.9*w,bottom-top);ctx.fillStyle=metal;ctx.fillRect(x0+0.9*w,top,0.1*w+0.5,bottom-top);}
    else{ctx.fillStyle=metal;ctx.fillRect(x0,top,w,bottom-top);}
    if(classicLook()){ctx.fillStyle='rgba(214,232,245,.75)';if(top>0)ctx.fillRect(x0,top,w,1);if(bottom<canvas.height)ctx.fillRect(x0,bottom-1,w,1);}
   }
   // Blades in the slits (moving or closed during the run): metal, or amber when absorbing.
   for(const [top,bottom,absorbing] of blades){const partial=bottom<top+2*half-.5;if(!partial&&!absorbing)continue;ctx.fillStyle=absorbing?'#9e5c1a':'#8797a6';ctx.fillRect(x0-1,top,w+2,bottom-top);ctx.fillStyle='rgba(255,235,200,.9)';ctx.fillRect(x0-1,bottom-1,w+2,1.5);}
  }
  ctx.restore();
 }
 function drawEngineLabel(ctx=waveCtx){
  if(level==='basic')return; // one engine at Basic
  const wide=detectorX>560,text=numericalActive()?(wide?'Numerical engine · Schrödinger equation on a grid':'Numerical engine'):engineWanted()?(wide?'Analytical engine (numerical not available)':'Analytical engine'):(wide?'Analytical engine · paraxial model':'Analytical engine');
  ctx.save();ctx.globalAlpha=1;ctx.font='600 12px Inter,Arial,sans-serif';ctx.textAlign='right';ctx.textBaseline='top';
  const w=ctx.measureText(text).width+16,x=detectorX-10,y=10;
  ctx.fillStyle=numericalActive()?'rgba(120,60,10,.82)':'rgba(10,40,60,.78)';ctx.fillRect(x-w,y,w,22);
  ctx.fillStyle='#fff';ctx.fillText(text,x-8,y+5);ctx.restore();
 }
 function drawSourceWave(){
  waveCtx.clearRect(0,0,canvas.width,canvas.height);waveCtx.fillStyle='#344f63';waveCtx.fillRect(0,0,canvas.width,canvas.height);
  // Numerical engine: its WebGL canvas is shown directly as a layer above this one
  // (no copy into a 2D canvas, so the page never waits for the GPU); label on the setup layer.
  if(numericalActive()){numLayer(waveShown());if(waveShown())drawNumericalWave();drawEngineLabel(setupCtx);if(classicLook()&&waveShown()&&!(numOpt.showChange&&num.changeActive))drawClassicLegend();drawChangeOverlay();return;}
  numLayer(false);
  drawEngineLabel();if(!waveShown())return;
 const key=[worldCanvasDx,screenHeight,wallXWorld,p.launch].join(',');
 // One field grid per mask epoch (see switchMask). A column at x shows the mask
 // that was in force when its slice crossed the wall, at t_w = t − (x − L)/v.
 const live=liveEpochs();
 live.forEach((E,index)=>{if(!E.grid||E.grid.key!==key)E.grid=buildGrid(E,key,index?live[index-1].grid:null);});
 // Columns up to the front of the most advanced packet are needed now.
 const front=Math.max(-Infinity,...pulses.map(c=>(p.initialCenter??0)+p.k*(t-c.born)))+6*p.sx;
 const frontColumn=Math.min(gridW-1,Math.ceil(((front+p.launch)*100+wallXWorld)/worldCanvasDx*gridW)+2);
 fillGrid(live[0].grid,frontColumn,live.length===1?4:0);
 for(let index=1;index<live.length;index++){
  // Columns this epoch must show now: from the wall to x = L + v(t − start), plus a margin.
  const E=live[index],G=E.grid,edge=p.wall+p.k*Math.max(0,t-E.start);
  const column=Math.ceil(((edge+p.launch)*100+wallXWorld)/worldCanvasDx*gridW)+2;
  fillGrid(G,Math.min(gridW-1,column,frontColumn),index===live.length-1?4:0);
 }
 sourceGrid=live[live.length-1].grid;
 const colGrid=sourceGrid.xs.map((x,i)=>{if(x<p.wall||live.length===1)return sourceGrid;const tw=t-(x-p.wall)/p.k;let G=live[0].grid;for(const E of live)if(E.start<=tw&&E.grid.filled>i)G=E.grid;return G;});
  setWaveRangeAuto(0,1);const range=getWaveRangeEffective(),span=Math.max(1e-9,range.max-range.min),mode=$('#waveFunctionOption').val();
  // Pulses are independent preparations: add densities, not coherent amplitudes.
  // Blend phase colors by density where independent pulses overlap.
  const env=sourceGrid.xs.map(x=>{
   let density=0,cos=0,sin=0;
   for(const c of pulses){
    const e=sourceEnvelope(x,t-c.born,p),fraction=c.branching?1:(c.active+c.pending)/Math.max(1,c.count-c.absorbed),q=e.rho*fraction;
    const displayPhase=surfaceView?p.k*x-(c.surfacePhase??0):e.phase-visualPhase;
    density+=q;cos+=q*Math.cos(displayPhase);sin+=q*Math.sin(displayPhase);
   }return {rho:density,cos:cos/Math.max(1e-300,density),sin:sin/Math.max(1e-300,density),envelope:Math.min(1,density*Math.sqrt(2*Math.PI)*p.sx)};
  });
  const envPeak=1/(Math.sqrt(2*Math.PI)*p.sx);
  if(paletteKey!==graphPalette||!paletteColors){paletteKey=graphPalette;paletteColors=Array.from({length:1024},(_,i)=>window.paletteModule.getColorForValue(i/1023,graphPalette));}
  const alpha=255*elementOpacity('plot_wave');surfaceHeights=surfaceView?new Float32Array(gridW*gridH):null;
  // Columns where the packet envelope is so small that every pixel would round to
  // zero opacity are left transparent (identical image, far less work: the packet
  // covers a fraction of the field). The 3D view needs every height, so it skips none.
  const skip=surfaceView?null:env.map(e=>alpha*3.2*e.envelope<.5);
  if(skip)data.data.fill(0);
  const fast=skip&&!sourceGrid.whichPath&&!colGrid.some(G=>G.whichPath);
  if(fast){
   // Same arithmetic as the general loop below, for the common case (2D, no
   // which-path detector), with per-column quantities hoisted out of the pixel loop.
   const out=data.data,cols=[];
   for(let i=0;i<gridW;i++)if(!skip[i])cols.push(i);
   const nc=cols.length,cR=new Float64Array(nc),cC=new Float64Array(nc),cS=new Float64Array(nc),cE=new Float64Array(nc),cP=new Float64Array(nc),cG=new Array(nc);
   for(let k=0;k<nc;k++){const i=cols[k],G=colGrid[i];cR[k]=env[i].rho;cC[k]=env[i].cos;cS[k]=env[i].sin;cE[k]=env[i].envelope;cP[k]=Math.max(1e-30,G.maxRho/(Math.sqrt(2*Math.PI)*p.sx));cG[k]=G;}
   const modeId=mode==='Phase'?1:mode==='LogPsi2'?2:mode==='PhaseAmp'?3:0,norm=1/-Math.expm1(-3),lo=range.min,inv=1/span;
   for(let j=0;j<gridH;j++){const row=j*gridW;
    for(let k=0;k<nc;k++){
     const i=cols[k],n=row+i,G=cG[k],rawWeight=G.visibility[n]*cE[k];if(rawWeight<=0){continue;}
     const weight=-Math.expm1(-3*rawWeight)*norm,rel=G.values[2*n]*cR[k]/cP[k],pc=G.phaseCos[n],ps=G.phaseSin[n],o=4*n;
     if(modeId===3){
      const ct=pc*cC[k]-ps*cS[k],st=ps*cC[k]+pc*cS[k],value=Math.sqrt(Math.min(1,rel*8)),level=Math.max(0,Math.min(1,(value-lo)*inv));
      const r2=ct*ct+st*st,cn=r2>0?ct/Math.sqrt(r2):1,ci=Math.round((.5+.5*cn)*1023),c=paletteColors[ci<0?0:ci>1023?1023:ci];out[o]=c[0];out[o+1]=c[1];out[o+2]=c[2];out[o+3]=alpha*weight*level;
     }else{
      const value=modeId===1?.5+.5*(pc*cC[k]-ps*cS[k]):modeId===2?Math.max(0,Math.min(1,(Math.log(Math.max(1e-15,rel))+15)/15)):Math.sqrt(Math.min(1,rel*8));
      const rgb=paletteColors[Math.round(Math.max(0,Math.min(1,(value-lo)*inv))*1023)];
      out[o]=.88*rgb[0]+30.6;out[o+1]=.88*rgb[1]+30.6;out[o+2]=.88*rgb[2]+30.6;out[o+3]=alpha*weight;
     }
    }
   }
  }
  else for(let j=0;j<gridH;j++)for(let i=0;i<gridW;i++){
   if(skip&&skip[i])continue;
   const G=colGrid[i],peak=G.maxRho/(Math.sqrt(2*Math.PI)*p.sx),n=j*gridW+i,rho=G.values[2*n]*env[i].rho;
   // Preserve a localized Gaussian envelope; do not amplify its remote tails. The
   // envelope enters linearly: a square root let the stationary pattern show well
   // ahead of and behind the packet, cut by its nodal lines (streaks past the packet).
   const rawWeight=G.visibility[n]*env[i].envelope;
   // Display-only contrast boost; zero density stays transparent.
   const weight=-Math.expm1(-3*rawWeight)/-Math.expm1(-3);let phaseCos=G.phaseCos[n],phaseSin=G.phaseSin[n];
   const cosTheta=phaseCos*env[i].cos-phaseSin*env[i].sin,sinTheta=phaseSin*env[i].cos+phaseCos*env[i].sin,normalizedDensity=rho/Math.max(1e-30,peak);
   if(surfaceHeights)surfaceHeights[n]=surfaceHeightValue(surfaceHeightMode,surfaceDisplayDensity(normalizedDensity),cosTheta,sinTheta);
   let value;
   if(mode==='Phase'){
    // Display cos(theta), a smooth scalar representation of the local phase.
    value=.5+.5*(G.phaseCos[n]*env[i].cos-G.phaseSin[n]*env[i].sin);
   }else if(mode==='LogPsi2')value=Math.max(0,Math.min(1,(Math.log(Math.max(1e-15,rho/peak))+15)/15));
   else value=Math.sqrt(Math.min(1,rho/peak*8));
   if(G.whichPath&&G.xs[i]>=p.wall){
    let red,green,blue;
    if(mode==='Phase'){
     const colors=G.branchColors,stride=3*G.nb,base=stride*n,ec=env[i].cos,es=env[i].sin;let total=0;red=0;green=0;blue=0;
     for(let branch=0;branch<G.nb;branch++){
      const r=G.branches[base+3*branch],brightness=.25+.75*(.5+.5*(G.branches[base+3*branch+1]*ec-G.branches[base+3*branch+2]*es));
      total+=r;red+=r*colors[branch][0]*brightness;green+=r*colors[branch][1]*brightness;blue+=r*colors[branch][2]*brightness;
     }
     const inv=1/Math.max(1e-300,total);red*=inv;green*=inv;blue*=inv;
    }else{const brightness=.3+.7*value;red=G.mix[3*n]*brightness;green=G.mix[3*n+1]*brightness;blue=G.mix[3*n+2]*brightness;}
    data.data[4*n]=.9*red+.1*255;data.data[4*n+1]=.9*green+.1*255;data.data[4*n+2]=.9*blue+.1*255;data.data[4*n+3]=alpha*weight;
   }else if(mode==='PhaseAmp'){
    // Hue from the phase of Ψ (with the moving carrier), brightness from |Ψ|.
    // |Ψ| as opacity over the background (not as darkening, which drew a black rim).
    const level=Math.max(0,Math.min(1,(value-range.min)/span)),c=paletteColors[cosIndex(cosTheta/(Math.hypot(cosTheta,sinTheta)||1))];
    data.data[4*n]=c[0];data.data[4*n+1]=c[1];data.data[4*n+2]=c[2];data.data[4*n+3]=alpha*weight*level;
   }else{
    const rgb=paletteColors[Math.round(Math.max(0,Math.min(1,(value-range.min)/span))*1023)];
    data.data[4*n]=.88*rgb[0]+.12*255;data.data[4*n+1]=.88*rgb[1]+.12*255;data.data[4*n+2]=.88*rgb[2]+.12*255;data.data[4*n+3]=alpha*weight;
   }
  }
  fc.putImageData(data,0,0);
  if(!surfaceView){waveCtx.save();waveCtx.imageSmoothingEnabled=true;waveCtx.imageSmoothingQuality="high";waveCtx.beginPath();waveCtx.rect(0,0,detectorX,canvas.height);waveCtx.clip();waveCtx.drawImage(field,0,0,canvas.width,canvas.height);waveCtx.restore();
   if(mode==='PhaseAmp'&&!p.whichPath)drawPhaseWheel(waveCtx,detectorX-48,canvas.height-58,20);}
  // Phase legend for 3D: palette color of cos θ through the current display range.
  surfaceLegend=surfaceView&&mode==='PhaseAmp'&&!p.whichPath?Array.from({length:72},(_,k)=>hueCss(k*Math.PI/36)):surfaceView&&mode==='Phase'&&!p.whichPath?Array.from({length:72},(_,k)=>{const value=.5+.5*Math.cos(k*Math.PI/36),rgb=paletteColors[Math.round(Math.max(0,Math.min(1,(value-range.min)/span))*1023)];return `rgb(${Math.round(.88*rgb[0]+.12*255)},${Math.round(.88*rgb[1]+.12*255)},${Math.round(.88*rgb[2]+.12*255)})`;}):null;
  if(!p.whichPath)drawPaletteScale(graphPalette,mode==='Phase'?2*range.min-1:range.min,mode==='Phase'?2*range.max-1:range.max);
 }

 function drawParticles(){
  partCtx.clearRect(0,0,canvas.width,canvas.height);if(interpretation!=='bohmian')return;
  const tails=shown('plot_trajectories'),dots=shown('plot_particles'),maxTail=+tailLength.value/100;
  const groups=['default',...slitGroups(),...Array.from({length:spectrumSteps},(_,i)=>`s${i}`),'g0','g1','g2','g3'];
  const buckets=Object.fromEntries(groups.map(group=>[group,Array.from({length:9},()=>[])]));
  // Colour group once per particle per frame (it reads a DOM control); the dots
  // are bucketed too, instead of scanning every particle for each of the ~50 groups.
  const dotBuckets=Object.fromEntries(groups.map(group=>[group,[]])),mode=particleColorMode.value;
  const groupOf=a=>mode==='slit'&&a.slitSide?a.slitSide:mode==='spectrum'&&spectrumIndex(a.wallY)>=0?`s${spectrumIndex(a.wallY)}`:START_MODES.includes(mode)?(startGroupOf(a,mode)||'default'):'default';
  for(const a of particles){
   trimTail(a.path,a.screenDetected?0:maxTail);
   const opacity=tailOpacity(a.done,a.finishedAt??realElapsed,realElapsed);
   if(!opacity)a.path=[];
   const group=groupOf(a);
   if(tails&&a.path.length)(buckets[group]||buckets.default)[Math.min(8,Math.ceil(opacity*8))].push(a);
   if(dots&&!a.done)(dotBuckets[group]||dotBuckets.default).push(a);
  }
  partCtx.save();partCtx.beginPath();partCtx.rect(0,0,detectorX,canvas.height);partCtx.clip();
  const glow=classicLook()&&numOpt.trails==='glow';
  if(glow){updateTrails(groupOf,tails);if(tails){partCtx.globalAlpha=elementOpacity('plot_trajectories');partCtx.drawImage(trailCanvas,0,0);partCtx.globalAlpha=1;}}
  for(const group of (glow?[]:groups)){
   partCtx.strokeStyle=groupColor(group,true);
   for(let i=1;i<=8;i++){
    if(!buckets[group][i].length)continue;partCtx.globalAlpha=elementOpacity('plot_trajectories')*i/8;partCtx.beginPath();
    // Points closer than ~1.5 px to the last drawn one are skipped (the last
    // point is always drawn): same picture, far fewer segments to rasterize.
    for(const a of buckets[group][i]){const path=a.path,m=path.length;let lx=X(path[0][0]),ly=Y(path[0][1]);partCtx.moveTo(lx,ly);
     for(let k=1;k<m;k++){const qx=X(path[k][0]),qy=Y(path[k][1]),dx=qx-lx,dy=qy-ly;if(k<m-1&&dx*dx+dy*dy<2.25)continue;partCtx.lineTo(qx,qy);lx=qx;ly=qy;}}
    partCtx.stroke();
   }
  }
  if(dots&&classicLook()){partCtx.globalAlpha=elementOpacity('plot_particles');const r=numOpt.dotSize||3;for(const group of groups){if(!dotBuckets[group].length)continue;const sp=glowSprite(groupColor(group),r),h=sp.width/2;for(const a of dotBuckets[group])partCtx.drawImage(sp,X(a.x)-h,Y(a.y)-h);}}
  else if(dots){partCtx.globalAlpha=elementOpacity('plot_particles');for(const group of groups){if(!dotBuckets[group].length)continue;partCtx.fillStyle=groupColor(group);partCtx.beginPath();for(const a of dotBuckets[group]){const q={x:X(a.x),y:Y(a.y)};partCtx.moveTo(q.x+3,q.y);partCtx.arc(q.x,q.y,3,0,2*Math.PI);}partCtx.fill();}}
  partCtx.restore();
 }
 function drawDetection(){
  if(!detectorFlashes.size)return;
  setupCtx.save();setupCtx.beginPath();setupCtx.rect(0,0,canvas.width,canvas.height);setupCtx.clip();
  for(const [index,remaining] of detectorFlashes)drawBinPulse(setupCtx,{x:detectorX,y:index*canvas.height/p.bins,width:Math.max(1,sensorWidth),height:canvas.height/p.bins,color:colorSensor,strength:remaining/DETECTOR_PULSE_SECONDS});
  setupCtx.restore();
 }
 function histogram(options={}){
  const context=options.context||setupCtx,record=options.hits||hits,maxRecord=Math.max(1,...record),histo=detectorX+sensorWidth,widthPx=canvas.width-histo;
  const numPrediction=!options.profile&&context===setupCtx&&numericalActive()&&numProfile&&numProfile.fraction>0.002?numProfile:null;
  const prediction=options.profile||numPrediction||profile;
  const {curve:predictionDensity,predictionScale,hitScale}=histogramLayout(record,prediction,options.screenHeight??screenHeight/100,widthPx);
  context.save();context.globalAlpha=1;context.fillStyle='#fff';context.fillRect(histo,0,widthPx,canvas.height);context.fillStyle='#000';context.fillRect(detectorX,0,sensorWidth,canvas.height);
  if((geometryEditing||shown('hit_prob'))&&!p.focused){
   // After a live slit change, the previous prediction stays (dashed) while hits from
   // packets already past the wall are still arriving.
   if(transition&&t<transition.until&&!options.profile&&context===setupCtx){
    const old=histogramLayout(record,transition.profile,options.screenHeight??screenHeight/100,widthPx);
    context.save();context.globalAlpha=.75*(geometryEditing?1:elementOpacity('hit_prob'));context.strokeStyle=colorProb;context.setLineDash([5,4]);context.beginPath();
    old.curve.forEach((q,i)=>{const x=histo+q*old.predictionScale,y=i*canvas.height/(old.curve.length-1);i?context.lineTo(x,y):context.moveTo(x,y);});context.stroke();context.restore();
   }else if(transition&&t>=transition.until)transition=null;
   if(numericalActive()&&context===setupCtx&&!options.profile){
    // The analytical prediction, dashed, for comparison with the numerical one (solid).
    const ana=histogramLayout(record,profile,options.screenHeight??screenHeight/100,widthPx);
    context.save();context.globalAlpha=.8*(geometryEditing?1:elementOpacity('hit_prob'));context.strokeStyle='#8a5a2b';context.setLineDash([6,4]);context.lineWidth=1.5;context.beginPath();
    ana.curve.forEach((q,i)=>{const x=histo+q*(numPrediction?predictionScale:ana.predictionScale),y=i*canvas.height/(ana.curve.length-1);i?context.lineTo(x,y):context.moveTo(x,y);});context.stroke();context.restore();
   }
   context.globalAlpha=geometryEditing?1:elementOpacity('hit_prob');context.strokeStyle=colorProb;context.beginPath();predictionDensity.forEach((q,i)=>{const x=histo+q*predictionScale,y=i*canvas.height/(predictionDensity.length-1);i?context.lineTo(x,y):context.moveTo(x,y);});context.stroke();}
  const rgb=getRGBComponents(colorSensor);
  record.forEach((n,i)=>{if(!n)return;const y=(i+.5)*canvas.height/p.bins,x=histo+n*hitScale,error=level==='basic'?0:Math.sqrt(n)*hitScale;
   if(shown('plot_sensor')&&level!=='basic'){context.globalAlpha=elementOpacity('plot_sensor');const intensity=n/maxRecord;context.fillStyle=`rgb(${rgb.red*intensity},${rgb.green*intensity},${rgb.blue*intensity})`;context.fillRect(detectorX,i*canvas.height/p.bins,sensorWidth,canvas.height/p.bins);}
   if(shown('plot_hits')){
    context.globalAlpha=elementOpacity('plot_hits');
    const pwColors=interpretation==='bohmian'&&context===setupCtx;
    const slitResolved=pwColors&&particleColorMode.value==='slit';
    if(slitResolved){
     // Coherent PW trajectories do not cross. Hits accumulated in MW or
     // Orthodox views therefore inherit the PW display color of their screen
     // band when the user returns to the By-slit view. Draw one marker for the
     // complete retained count so mixed histories never produce black overlays.
     const markerColor=slitColorOf(binSlitGroup(i,n));
     context.strokeStyle=context.fillStyle=markerColor;context.beginPath();context.moveTo(x-error,y);context.lineTo(x+error,y);context.stroke();context.beginPath();context.arc(x,y,3,0,2*Math.PI);context.fill();
     // Dark edge so pale slit colours (yellow, pink) stay visible on the white histogram.
     context.save();context.lineWidth=.8;context.strokeStyle='rgba(20,30,40,.6)';context.stroke();context.restore();
    }else{let markerColor=colorHit;if(pwColors&&particleColorMode.value==='uniform')markerColor=colorPart;else if(pwColors&&particleColorMode.value==='spectrum'){const spectrum=spectrumHitCounts[i]?Math.round(spectrumHitSums[i]/spectrumHitCounts[i]):Math.round((i+.5)/p.bins*(spectrumSteps-1));markerColor=spectrumColor(spectrum);}context.strokeStyle=context.fillStyle=markerColor;context.beginPath();context.moveTo(x-error,y);context.lineTo(x+error,y);context.stroke();context.beginPath();context.arc(x,y,3,0,2*Math.PI);context.fill();}
   }
  });
  if(interpretation==='bohmian'&&context===setupCtx&&particleColorMode.value==='slit'&&screenBands&&!options.hits){
   // Pilot-wave band of each slit on the screen: dashed edges and slit numbers.
   context.globalAlpha=.85;context.setLineDash([5,4]);context.lineWidth=1;context.strokeStyle='#4b5d68';
   for(const band of screenBands.slice(1)){const y=Y(band.top);if(y>0&&y<canvas.height){context.beginPath();context.moveTo(histo,y);context.lineTo(canvas.width,y);context.stroke();}}
   context.setLineDash([]);context.font='600 11px Inter,Arial,sans-serif';context.textAlign='right';context.textBaseline='middle';
   for(const band of screenBands){const y0=Math.max(0,Y(band.top)),y1=Math.min(canvas.height,Y(band.bottom));if(y1-y0<14)continue;context.fillStyle=slitColorOf(band.group);context.lineWidth=2.5;context.strokeStyle='rgba(20,30,40,.55)';context.strokeText(String(+band.group.slice(1)+1),canvas.width-6,(y0+y1)/2);context.fillText(String(+band.group.slice(1)+1),canvas.width-6,(y0+y1)/2);}
  }
  context.restore();
 }
 const flowOverlay=mountFlowOverlay({host:document.getElementById('graphics-parameter-container'),redraw:()=>draw()});
 // Stats row "Fringes": λD/d for two slits; the near-field / far-field scale W²/λ for more.
 // Fringe spacing measured on the predicted screen profile (peaks deep enough to be fringes),
 // so the stat says "no fringes" when the slit beams do not overlap; the formula λ(D−L)/d is
 // added from Standard on for two slits.
 function measuredFringeSpacing(){
  const v=profile?.values;if(!v||v.length<5)return null;
  let max=0;for(const x of v)if(x>max)max=x;if(!(max>0))return null;
  const peaks=[];for(let i=1;i<v.length-1;i++)if(v[i]>v[i-1]&&v[i]>=v[i+1]&&v[i]>.3*max)peaks.push(i);
  const fringe=[];for(let j=0;j+1<peaks.length;j++){let lo=Infinity;for(let i=peaks[j];i<=peaks[j+1];i++)lo=Math.min(lo,v[i]);if(lo<.8*Math.min(v[peaks[j]],v[peaks[j+1]]))fringe.push(peaks[j+1]-peaks[j]);}
  if(!fringe.length)return null;
  fringe.sort((a,b)=>a-b);const med=fringe[fringe.length>>1];
  return med*screenHeight/(v.length-1);
 }
 function updateFringeScale(){
  const el=document.getElementById('fringeScale');if(!el||!p)return;
  // Only slits without a detector interfere (detected slits add single-slit patterns).
  const detected=new Set(p.whichPath?p.detectorSlots:[]),c=(p.centers||[]).filter((_,slot)=>!detected.has(slot)),lambda=2*Math.PI/p.k*100,D=(p.screen-p.wall)*100;let text;
  if((p.centers||[]).length<2)text='single slit: no fringes';
  else if(c.length<2)text='no fringes (detectors)';
  else{
   // A measured spacing far from λ(D−L)/d (neighbouring slits) is not a fringe pattern (e.g. two
   // separate slit images when the beams do not overlap).
   const cs=[...c].sort((a,b)=>a-b),dn=Math.min(...cs.slice(1).map((x,i)=>x-cs[i]))*100,formula=lambda*D/dn;
   let m=measuredFringeSpacing();if(m&&Math.abs(m/formula-1)>.5)m=null;
   const meas=m?`spacing ≈ ${Math.round(m)} nm`:'no fringes: the slit beams barely overlap';
   if(c.length===2){const d=Math.abs(c[1]-c[0])*100;text=level==='basic'||!m?meas:`${meas} (λ(D−L)/d = ${Math.round(lambda*D/d)} nm)`;}
   else{const W=(Math.max(...c)-Math.min(...c))*100,far=W*W/lambda,field=D>=10*far?'far field':`near field (far field ≫ ${far>=1000?(far/1000).toFixed(far>=10000?0:1)+' µm':Math.round(far)+' nm'})`;text=level==='basic'?meas:`${meas} · ${field}`;}
  }
  // After a live slit change the part already past the wall still has the earlier pattern.
  if(transition&&t<transition.until)text+=' (front: earlier)';
  if(el.textContent!==text)el.textContent=text;
 }
 // Caption under the canvas: one plain sentence for the view, a histogram legend,
 // and a colour legend for slits or detector records (colour plus text, never colour alone).
 let captionKey='',niceInfo=null; // niceInfo: Nice-fringes explanation, shown in the caption while that geometry is unchanged
 function updateCaption(){
  let host=document.getElementById('view-caption');
  if(!host){const container=document.getElementById('canvas-container');if(!container)return;host=document.createElement('div');host.id='view-caption';host.className='view-caption';host.setAttribute('aria-live','polite');container.after(host);}
  const view={copenhagen:'Orthodox: the wave gives the probability of each detection; each hit on the screen is one detection. No path is drawn between source and screen.',
   bohmian:'Pilot Wave: each dot is a particle with a position at all times, guided by the wave; its line is its recent path. '+(numericalActive()?(numSlitModel==='reflecting'?'The wave reflected by the wall carries some particles back; the guidance law keeps them out of the wall.':'Particles whose wave is absorbed in the wall are removed there (effective rule, probability from the local absorption).'):'Particles that hit the wall are absorbed.'),
   manyworlds:'Many Worlds: the wave never collapses. The hits shown are the record of one branch, chosen with weights |ψ|². “Branch records” counts possible screen records, not worlds.'}[interpretation]||'';
  const engineLine=numericalActive()?`Numerical engine (Schrödinger equation on a grid, ${numSlitModel==='mask'?'analytical Gaussian mask':numSlitModel+' wall'}): ${interpretation==='bohmian'?'particles are guided by the computed wave.':'the hits are the simulated particles that reach the screen, sampled from the computed flux.'} Green curve: numerical prediction; dashed: analytical. `:engineWanted()?'Numerical engine not available here; showing the analytical engine. ':'';
  const swatch=(color,label)=>`<span class="cap-swatch" style="background:${color}"></span>${label}`;
  const lines=[];
  if(p?.whichPath){
   const map=branchOf(p),groups=[];map.forEach((b,slot)=>{(groups[b]||=[]).push(p.slitIds[slot]+1);});
   if(!numericalActive())lines.push('Wave colours, one per detector record: '+groups.map((slits,b)=>swatch(slitColorOf('k'+(slits[0]-1)),(p.detectorSlots.some(s=>p.slitIds[s]+1===slits[0])?`slit ${slits[0]} (its detector fired)`:`slit${slits.length>1?'s':''} ${slits.join(', ')} (no detector fired)`))).join(' · ')+'.');
  }
  const pwMode=interpretation==='bohmian'?particleColorMode.value:'';
  const greyNote=numericalActive()&&classicLook()&&pwMode&&pwMode!=='uniform'&&!START_MODES.includes(pwMode)?' '+swatch('#8b939c','grey: not through a slit yet (or turned back by the wall)'):'';
  if(pwMode==='slit'){
   // Open slits, plus closed slits whose hits are still on the screen.
   const ids=new Set(p?.slitIds||[]);for(const [g,counts] of Object.entries(slitHits||{}))if(counts?.some?.(n=>n>0))ids.add(+String(g).slice(1));
   const list=[...ids].sort((a,b)=>a-b);
   if(list.length>1)lines.push('Particle and hit colours: '+list.map(k=>swatch(slitColorOf('k'+k),`slit ${k+1}`)).join(' · ')+(p?.whichPath?'.':'. Dashed lines on the screen mark each slit’s band (paraxial model).')+greyNote);
  }else if(pwMode==='spectrum')lines.push('Particle and hit colours: position where the particle crossed the wall, blue (top) to yellow (bottom).');
  else if(START_MODES.includes(pwMode)){const L={updown:[[1,'started in the upper half'],[0,'lower half']],rightleft:[[2,'started ahead of the packet centre'],[0,'behind it']],quadrant:[[1,'upper, behind'],[3,'upper, ahead'],[0,'lower, behind'],[2,'lower, ahead']],radial:[[0,'innermost quarter'],[1,'second'],[2,'third'],[3,'outermost quarter (from the packet centre)']]}[pwMode];
   lines.push('Particle colours by starting position: '+L.map(([g,t])=>swatch(START_COLORS[g],t)).join(' · ')+'.');}
  // After the first complete analytical packet, point once to the other engine (until the Engine tab is opened).
  let engineSeen=false;try{engineSeen=localStorage.getItem('qontic-te-engine-tab-seen')==='1';}catch(_){}
  if(level!=='basic'&&!engineSeen&&!engineWanted()&&(pulse>=2||nHits>=(p?.particles||1e9)))lines.push('Same experiment with the full Schrödinger equation: <b>Engine</b> tab.');
  if(niceInfo&&niceInfo.fp===fingerprint)lines.push('<b>Nice fringes:</b> '+niceInfo.text);
  else if(niceInfo){niceInfo=null;const el=document.getElementById('nice-fringes-status');if(el&&el.textContent.includes('details below'))el.textContent='';}
  const colours=lines.map(l=>`<p class="cap-legend">${l}</p>`).join('');
  const hitText=pwMode==='slit'?'dots = hits counted (coloured by slit), bars = ±√n':pwMode==='spectrum'?'dots = hits counted (coloured by wall position), bars = ±√n':swatch(pwMode==='uniform'?colorPart:colorHit,'dots = hits counted, bars = ±√n');
  const legend=level==='basic'?'Screen: '+swatch(colorProb,'curve = where hits are expected')+' · '+swatch(interpretation==='bohmian'&&pwMode==='uniform'?colorPart:colorHit,'dots = hits so far')+' · '+swatch(colorSensor,'flash on the screen = an electron arriving')+'.':'Screen: '+swatch(colorProb,'curve = predicted distribution')+(transition&&t<transition.until?' (dashed: the earlier slit setting, for the part of the wave already past the wall)':'')+' · '+hitText+' · black strip with green bars = hits per detector pixel. One packet = '+(p?.particles??'')+(interpretation!=='bohmian'&&!numericalActive()?((p?.particles===1?' hit':' hits')+(level==='basic'?'.':' (Hits / packet, Advanced).')):((p?.particles===1?' particle':' particles')+(level==='basic'?'.':' (Part./packet, Advanced).')));
  const key=engineLine+view+colours+legend;if(key===captionKey)return;captionKey=key;
  host.innerHTML=`<p>${engineLine?`<b>${engineLine}</b>`:''}${view}</p><p class="cap-legend">${legend}</p>${colours}`;
 }
 function draw(){if(!enabled)return;ensure();syncMode();updateFringeScale();updateCaption();setupCtx.clearRect(0,0,canvas.width,canvas.height);
  setupCtx.save();if(!surfaceView&&shown('plot_screen')){setupCtx.globalAlpha=elementOpacity('plot_screen');setupCtx.strokeStyle=colorScreen;if(p.source){
   // Draw the expert-selected slit cores, except that Direct PW displays its
   // fixed ±3σ preparation window. The analytical wave remains untruncated.
   const half=(slitPreviewWidth!==null&&slitPreviewWidth!==undefined?displayExtentSigma()*slitPreviewWidth:(interpretation==='bohmian'&&directed.checked?3*p.sy*100:p.geometry.openingHalf*100))*toCanvasY;
   if(numericalActive())drawNumericalWall();else{
   const openings=displayCenters().map(center=>[Math.max(0,Y(center)-half),Math.min(canvas.height,Y(center)+half)]).filter(([a,b])=>b>a).sort((a,b)=>a[0]-b[0]);
   setupCtx.strokeStyle=colorScreen;setupCtx.lineWidth=6;setupCtx.lineCap='butt';setupCtx.beginPath();let cursor=0;
   for(const [top,bottom] of openings){if(top>cursor){setupCtx.moveTo(wallX,cursor);setupCtx.lineTo(wallX,top);}cursor=Math.max(cursor,bottom);}
   if(cursor<canvas.height){setupCtx.moveTo(wallX,cursor);setupCtx.lineTo(wallX,canvas.height);}setupCtx.stroke();
   setupCtx.strokeStyle='#81e7f5';setupCtx.lineWidth=1.5;
   for(const [top,bottom] of openings){setupCtx.beginPath();setupCtx.moveTo(wallX-9,top);setupCtx.lineTo(wallX+9,top);setupCtx.moveTo(wallX-9,bottom);setupCtx.lineTo(wallX+9,bottom);setupCtx.stroke();}
   openings.forEach(([top,bottom],index)=>{const transmission=p.apertureWeights?.[index]??1;if(transmission>=1)return;setupCtx.save();setupCtx.globalAlpha*=1-transmission;setupCtx.strokeStyle=colorScreen;setupCtx.lineWidth=6;setupCtx.beginPath();setupCtx.moveTo(wallX,top);setupCtx.lineTo(wallX,bottom);setupCtx.stroke();setupCtx.restore();});
   }
   if(p.whichPath){
    for(const slot of p.detectorSlots){
     const detectorY=Y(p.centers[slot]);
     setupCtx.globalAlpha=1;setupCtx.fillStyle='#ffd54a';setupCtx.strokeStyle='#3b2d00';setupCtx.lineWidth=1.5;setupCtx.fillRect(wallX-13,detectorY-9,11,18);setupCtx.strokeRect(wallX-13,detectorY-9,11,18);
     setupCtx.fillStyle='#3b2d00';setupCtx.font='bold 9px Inter,Arial,sans-serif';setupCtx.textAlign='center';setupCtx.textBaseline='middle';setupCtx.fillText('D',wallX-7.5,detectorY);
    }
   }
  }}
  setupCtx.setLineDash([]);if(!surfaceView&&shown('plot_detector')){setupCtx.globalAlpha=elementOpacity('plot_detector');setupCtx.strokeStyle=colorDetector;setupCtx.beginPath();setupCtx.moveTo(detectorX,0);setupCtx.lineTo(detectorX,canvas.height);setupCtx.stroke();}setupCtx.restore();
  drawWave();flowOverlay.draw({ctx:setupCtx,p,coeff:epochs.length>1?coeffAt:coeff,pulses,t,X,Y,width:canvas.width,height:canvas.height,yOffset,surfaceView});drawParticles();histogram();drawDetection();updateSurface3D();window.qonticScaleOverlay?.update();geometryControls?.update();slitControls?.update();separationControls?.update();stats();
 }

 function hash(){return '&engine=packet&packetOrigin=source&sourceWidth='+sourceWidth.value+'&packetLength='+length.value+'&packetWidth='+width.value+'&slitExtent='+extent.value+'&slitBalance='+balance.value+'&packetCount='+p.particles+'&tailLength='+tailLength.value+'&packetInterval='+interval.value+(surfaceView?'&surface3d=1&surfaceHeight='+surfaceHeightMode:'')+(engine==='numerical'?'&numeng=1':'')+'&level='+level+viewHash();}
 // Settings that live outside the packet model but define what a shared link shows.
 function viewHash(){
  const v=id=>document.getElementById(id);
  const q=[['pixels',v('det-pixels-input')?.value],['particle',v('particleType')?.value],['directed',directed.checked?1:0],['pwColor',particleColorMode.value],
   ['show',v('basicsWaveFunctionOption')?.value],['speed',v('animationStep-input')?.value],
   ['flowArrows',v('flow-arrows')?.checked?1:0],['flowLines',v('flow-lines')?.checked?1:0],['flowLength',v('flow-length')?.value],['flowSpacing',v('flow-spacing')?.value]];
  return q.filter(([,x])=>x!==undefined&&x!==null&&x!=='').map(([k,x])=>'&'+k+'='+encodeURIComponent(x)).join('');
 }
 function applyViewHash(){
  const v=id=>document.getElementById(id);
  const fire=(el,type='change')=>el?.dispatchEvent(new Event(type,{bubbles:true}));
  const pick=(el,value)=>{if(el&&value!==null&&[...el.options].some(o=>o.value===value)){el.value=value;fire(el);}};
  const num=(key,lo,hi)=>{if(!params.has(key))return null;const n=Number(params.get(key));return Number.isFinite(n)&&n>=lo&&n<=hi?n:null;};
  const pixels=num('pixels',+(v('det-pixels')?.min??10),+(v('det-pixels')?.max??500));
  if(pixels!==null)$('#det-pixels-group')[0]?.setValueInFirstUnit(Math.round(pixels));
  pick(v('particleType'),params.get('particle'));
  if(params.has('directed')&&directed.checked!==(params.get('directed')==='1')){directed.checked=params.get('directed')==='1';fire(directed);}
  pick(particleColorMode,params.get('pwColor'));
  pick(v('basicsWaveFunctionOption'),params.get('show'));
  const speed=num('speed',+(v('animationStep')?.min??0),+(v('animationStep')?.max??100));
  if(speed!==null)$('#animationStep-group')[0]?.setValueInFirstUnit(speed);
  for(const [key,id] of [['flowLength','flow-length'],['flowSpacing','flow-spacing']]){const el=v(id),n=el&&num(key,+el.min,+el.max);if(n!==null&&n!==undefined){el.value=n;fire(el,'input');}}
  for(const [key,id] of [['flowArrows','flow-arrows'],['flowLines','flow-lines']]){const el=v(id);if(el&&params.has(key)){el.checked=params.get(key)==='1';fire(el);}}
 }
 const params=new URLSearchParams(location.hash.slice(1));
 if(params.has('surface3d'))surfaceView=params.get('surface3d')==='1';
 if(['psi2','phase','real','imag'].includes(params.get('surfaceHeight')))surfaceHeightMode=params.get('surfaceHeight');
 for(const [key,el] of [['packetLength',length],['packetWidth',width],['slitExtent',extent],['sourceWidth',sourceWidth],['tailLength',tailLength],['packetInterval',interval]]){const n=Number(params.get(key));if(params.has(key)&&n>=+el.min&&n<=+el.max){el.value=n;syncPacketInput(el);}}
 const savedBalance=Number(params.get('slitBalance'));if(params.has('slitBalance')&&savedBalance>=-100&&savedBalance<=100)balance.value=savedBalance;syncBalance();
 applyPacketLimits();
 const count=+params.get('packetCount');if(count>=+(document.getElementById('MaxPart')?.min??1)&&count<=+(document.getElementById('MaxPart')?.max??1000))$('#MaxPart-group')[0]?.setValueInFirstUnit(count);
 interval.addEventListener('input',()=>{syncPacketInput(interval);nextEmission=Math.max(t,(pulses.at(-1)?.born??t)+emissionPeriod());});
 directed.addEventListener('change',()=>{localStorage.setItem('qontic-pw-directed-slits',String(directed.checked));applyPacketLimits();syncMode();draw();});
 particleColorMode.addEventListener('change',()=>{localStorage.setItem(particleColorEngine==='num'?'qontic-te-num-particle-color':'qontic-pw-particle-color',particleColorMode.value);localStorage.removeItem('qontic-pw-color-by-slit');draw();});
 balance.addEventListener('input',()=>{syncBalance();resetEngine();draw();});
 balanceEqual.addEventListener('click',()=>{if(balance.disabled)return;balance.value='0';balance.dispatchEvent(new Event('input',{bubbles:true}));});
 for(const control of [length,width,sourceWidth,extent])control.addEventListener('input',()=>{applyPacketLimits();syncPacketInput(control);slitWidthHelp(interpretation==='bohmian'&&directed.checked);resetEngine();draw();});

 const constrainedInputs=new Set(['slit-separation','source-position','screen-height','wavelength']);
 document.addEventListener('input',event=>{if(constrainedInputs.has(event.target?.id))applyPacketLimits();},true);

 for(const id of ['MaxPart','MaxPart-input'])document.getElementById(id).addEventListener(id==='MaxPart'?'input':'change',()=>queueMicrotask(()=>{ensure();draw();}));
 const syncGeometryReadouts=next=>{
  document.getElementById('source-position-group')?.setValueInFirstUnit(next?.wall??sourcePos);
  document.getElementById('detector-distance-group')?.setValueInFirstUnit(next?.distance??detectorDistance);
  document.getElementById('screen-height-group')?.setValueInFirstUnit(next?.height??screenHeight);
 };
 const clearHitsForPreview=()=>{
  window.qonticMWBranches?.cancel();hits=Array(p.bins).fill(0);slitHits=emptySlitHits(p.bins);spectrumHitCounts=Array(p.bins).fill(0);spectrumHitSums=Array(p.bins).fill(0);nHits=0;hitMax=0;logNBranches=0;detectorFlashes.clear();flash=null;updateBranchCountDisplay();stats();
 };
 function pauseForGeometry(){const running=isAnimating;if(running)document.getElementById('startButton').click();return running;}
 function resumeAfterGeometry(running){if(running&&!isAnimating)document.getElementById('startButton').click();}
 function previewGeometry(next){syncGeometryReadouts(next);window.qonticScaleOverlay?.previewHeight(next?.height??null);if(!next){histogram();drawDetection();return;}if(next.wall!==sourcePos||next.distance!==detectorDistance||next.height!==screenHeight)clearHitsForPreview();const preview={...p,wall:next.wall/100,screen:(next.wall+next.distance)/100},ymin=-next.height/200,ymax=next.height/200;const predicted=sourceProfile(preview,ymin,ymax,2049);histogram({profile:predicted,screenHeight:next.height/100});}
 function commitGeometry(next){if(next.distance===detectorDistance&&next.height===screenHeight&&next.wall===sourcePos)return;document.getElementById('source-position-group').setValueInFirstUnit(next.wall);document.getElementById('detector-distance-group').setValueInFirstUnit(next.distance);document.getElementById('screen-height-group').setValueInFirstUnit(next.height);setupGeo(false);reset=0;resetEngine();draw();}
 function previewWidth(value){const committed=p?.sy*100??+width.value;slitPreviewWidth=value;const shownWidth=value===null?committed:value;width.value=shownWidth;syncPacketInput(width);if(value!==null&&value!==committed)clearHitsForPreview();draw();if(value!==null){const preview={...p,sy:value/100},predicted=sourceProfile(preview,-yOffset,screenHeight/100-yOffset,2049);histogram({profile:predicted});drawDetection();}}
 function commitWidth(value){width.value=value;width.dispatchEvent(new Event('input',{bubbles:true}));}
 function previewSeparation(value){slitPreviewSeparation=value;document.getElementById('slit-separation-group')?.setValueInFirstUnit(value===null?slitSeparation:value);if(value!==null&&value!==slitSeparation)clearHitsForPreview();draw();if(value!==null){const preview={...p,centers:displayCenters()},predicted=sourceProfile(preview,-yOffset,screenHeight/100-yOffset,2049);histogram({profile:predicted});drawDetection();}}
 function commitSeparation(value){userSep=+value;document.getElementById('slit-separation-group').setValueInFirstUnit(value);setupGeo(false);reset=0;resetEngine();draw();}
 function surfaceEditorState(){return {wall:sourcePos,distance:detectorDistance,height:screenHeight,wallMin:50,wallMax:1000,distanceMin:50,distanceMax:3000,heightMin:100,heightMax:5000,width:+width.value,minWidth:+width.min,maxWidth:dynamicWidthMax,extentSigma:+extent.value,separation:slitSeparation,maxSeparation:dynamicSeparationMax};}
 function configureSurfaceEditor(){surface3D?.configureEditor({getState:surfaceEditorState,pause:pauseForGeometry,resume:resumeAfterGeometry,preview(kind,value){if(['wall','distance','height'].includes(kind))previewGeometry(value);else if(kind==='width')previewWidth(value);else previewSeparation(value);},commit(kind,value){if(['wall','distance','height'].includes(kind))commitGeometry(value);else if(kind==='width')commitWidth(value);else commitSeparation(value);},cancel(kind){if(['wall','distance','height'].includes(kind))previewGeometry(null);else if(kind==='width')previewWidth(null);else previewSeparation(null);}});}
 const geometryControls=mountPacketGeometry({
  host:document.getElementById('canvas-container'),
  getGeometry(){if(!p)return null;const host=document.getElementById('canvas-container');return {wall:sourcePos,wallFraction:wallX/canvas.width,distance:detectorDistance,height:screenHeight,detectorFraction:detectorX/canvas.width,scaleX:toCanvasX*host.clientWidth/canvas.width,scaleY:toCanvasY*host.clientHeight/canvas.height,busy:window.qonticMWBranches?.busy};},
  onPreview:previewGeometry,onCommit:commitGeometry,pause:pauseForGeometry,resume:resumeAfterGeometry
 });

 const slitControls=mountSlitWidth({
  host:document.getElementById('canvas-container'),
  getState(){const host=document.getElementById('canvas-container');return {width:+width.value,minWidth:+width.min,maxWidth:dynamicWidthMax,extentSigma:displayExtentSigma(),centers:p?displayCenters().map(center=>Y(center)/canvas.height):[],wallFraction:wallX/canvas.width,scaleY:toCanvasY*host.clientHeight/canvas.height,busy:window.qonticMWBranches?.busy,visible:shown('plot_screen')};},
  onPreview:previewWidth,onCommit:commitWidth,pause:pauseForGeometry,resume:resumeAfterGeometry
 });
 const separationControls=mountSlitSeparation({
  host:document.getElementById('canvas-container'),
  getState(){const host=document.getElementById('canvas-container');return {separation:slitSeparation,maxSeparation:dynamicSeparationMax,signs:openSlitIds().map(slitCenterSign),wallFraction:wallX/canvas.width,scaleY:toCanvasY*host.clientHeight/canvas.height,busy:window.qonticMWBranches?.busy,visible:shown('plot_screen')};},
  onPreview:previewSeparation,onCommit:commitSeparation,pause:pauseForGeometry,resume:resumeAfterGeometry
 });
 const geometryHost=document.getElementById('canvas-container');
 const toolbar=document.querySelector('.qontic-media-toolbar');
 const editButton=document.createElement('button');editButton.type='button';editButton.className=toolbar.querySelector('button').className;
 editButton.setAttribute('aria-label','Edit geometry');editButton.setAttribute('aria-pressed','false');
 editButton.title='Edit geometry · right-click canvas. Drag handles to preview the predicted histogram; Escape exits.';
 editButton.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M15 5l4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z"/></svg>';
 toolbar.insertBefore(editButton,toolbar.querySelector('[role=status]'));
 const surfaceButton=document.createElement('button');surfaceButton.type='button';surfaceButton.className=editButton.className;surfaceButton.setAttribute('aria-label','3D wave surface');
 surfaceButton.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m3 15 6-5 5 3 7-6v9l-7 5-5-3-6 4z"/><path d="M3 15v7m6-12v8m5-5v8m7-14v9"/></svg>';
 toolbar.insertBefore(surfaceButton,editButton);
 pwWaveButton=document.createElement('button');pwWaveButton.type='button';pwWaveButton.className=editButton.className;pwWaveButton.setAttribute('aria-label','Pilot-Wave field');
 pwWaveButton.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5z"/><circle cx="12" cy="12" r="2.4"/><path d="M3 20c3-3 5-3 8 0s5 3 10 0"/></svg>';
 toolbar.insertBefore(pwWaveButton,surfaceButton);
 pwWaveButton.addEventListener('click',()=>{pwWaveVisible=!pwWaveVisible;localStorage.setItem('qontic-pw-wave-visible',String(pwWaveVisible));syncPwWaveButton();draw();});
 function syncSurfaceView(){
  localStorage.setItem('qontic-double-slit-surface-view',String(surfaceView));geometryHost.classList.toggle('packet-surface-3d',surfaceView);
  surfaceButton.setAttribute('aria-pressed',String(surfaceView));surfaceButton.title=surfaceView?'Return to the flat 2D wave map':'Open the interactive 3D wave graph. Drag to rotate and use the wheel or pinch gesture to zoom.';
  surface3D?.setVisible(surfaceView);if(surfaceView)ensureSurface3D();
  editButton.disabled=false;geometryHost.dispatchEvent(new CustomEvent('qontic:surface-view',{detail:{active:surfaceView}}));
 }
 surfaceButton.addEventListener('click',()=>{if(geometryEditing)setGeometryEditing(false);surfaceView=!surfaceView;syncSurfaceView();draw();});
 function setGeometryEditing(next,restorePlayback=true){
  if(next===geometryEditing)return;
  if(next){if(window.qonticMWBranches?.busy)return;resumeAfterEditing=isAnimating;if(isAnimating)document.getElementById('startButton').click();geometryEditing=true;}
  else{geometryControls.cancel();slitControls.cancel();separationControls.cancel();surface3D?.cancelEditor();geometryEditing=false;}
  geometryHost.classList.toggle('editing-geometry',geometryEditing);editButton.setAttribute('aria-pressed',String(geometryEditing));draw();
  surface3D?.setEditing(surfaceView&&geometryEditing);
  if(!next){const running=resumeAfterEditing;resumeAfterEditing=false;if(restorePlayback&&running&&!isAnimating)document.getElementById('startButton').click();}
 }
 editButton.addEventListener('click',()=>setGeometryEditing(!geometryEditing));
 geometryHost.addEventListener('contextmenu',event=>{if(window.qonticMWBranches?.busy)return;event.preventDefault();setGeometryEditing(!geometryEditing);});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&geometryEditing){event.preventDefault();setGeometryEditing(false);}},true);
 // An explicit Start action leaves editing before transport resumes.
 document.getElementById('startButton').addEventListener('click',()=>{if(geometryEditing&&!isAnimating)setGeometryEditing(false,false);},true);
 new MutationObserver(()=>{if(geometryEditing&&isAnimating)setGeometryEditing(false,false);}).observe(document.getElementById('startButton'),{childList:true,subtree:true,characterData:true});
 syncSurfaceView();syncPwWaveButton();
 queueMicrotask(()=>{
  for(const id of ['sourceOption','particleRate','particleRate-input']){const el=document.getElementById(id);if(el){el.disabled=true;el.title='Not available for the Gaussian source-packet model';}}
  const origin=document.getElementById('sourceOption');origin.parentElement.classList.remove('bohmian-only');origin.parentElement.classList.add('packet-unused-row');origin.value='isotropic';origin.querySelector('option[value=isotropic]').textContent='Gaussian source';
  const label=document.querySelector('#MaxPart-group label');if(label)label.textContent='Particles / packet:';
  for(const value of ['photon']){const el=document.querySelector('#particleType option[value='+value+']');if(el)el.remove();}
  syncSlowPacketMode();
  document.getElementById('particleType').title='At the same wavelength an electron and a neutron give the same pattern; the mass changes only the speed, energy and time scale.';
  if(particleType==='photon'){particleType='electron';$('#particleType').val('electron');}
  document.querySelector('#waveFunctionOption option[value=Phase]').textContent='Phase (cos θ)';if(!$('#waveFunctionOption').val())$('#waveFunctionOption').val('Psi2');
  const species=document.createElement('div');species.className='input-group packet-species packet-core-options';species.append(directedRow,slitColorRow);
  const particleRow=document.createElement('div');particleRow.className='input-group packet-inline packet-particle';const particleLabel=document.createElement('label');particleLabel.htmlFor='particleType';particleLabel.textContent='Particle';particleRow.append(particleLabel,document.getElementById('particleType'));panel.prepend(particleRow);document.getElementById('slit-count-bar').after(species);
  // A shared link may request the ideal which-slit detector; otherwise start without one.
  // Detectors come from the link: slits=1d1 (d = open with a detector) or, in older
  // links, wp=slitK. Otherwise the run starts without detectors.
  const linkedSlits=params.get('slits')||'',linkedDetector=params.get('wp');
  slitDetector.fill(false);
  if(/^[01d]{1,16}$/.test(linkedSlits))for(let k=0;k<linkedSlits.length;k++)if(linkedSlits[k]==='d')slitDetector[k]=true;
  if(/^slit\d+$/.test(linkedDetector||''))slitDetector[parseInt(linkedDetector.slice(4),10)-1]=true;
  syncWhichPathDetector();updateWhichPathButton();updateSlitCountControls();setupGeo(false);reset=0;resetEngine();
  // Accessible names (3.0-dev.21): number boxes named by their quantity; the stacked
  // canvases form one image described by the caption below it.
  for(const [id,name] of [['wavelength-input','Wavelength in nm'],['slit-separation-input','Slit separation in nm'],['detector-distance-input','Wall-to-screen distance in nm'],['screen-height-input','Screen length in nm']]){const el=document.getElementById(id);if(el)el.setAttribute('aria-label',name);}
  {const container=document.getElementById('canvas-container');if(container){
   // One canvas carries the description; the container keeps its controls (range sliders) accessible.
   container.querySelectorAll('canvas').forEach(c=>c.setAttribute('aria-hidden','true'));const main=document.getElementById('setupCanvas');if(main){main.removeAttribute('aria-hidden');main.setAttribute('role','img');main.setAttribute('aria-label','Simulation: source, wall with slits, the wave and particles, and the screen with its histogram. The caption below describes the current view.');}}}
  {const hitsRow=document.getElementById('nhits')?.closest('tr');if(hitsRow)hitsRow.dataset.tip='Hits recorded on the screen. Each packet sends many particles at once (Particles / packet, in Advanced); in Pilot Wave many are absorbed at the wall.';}
  applyViewHash();draw();
 });
 // "Nice fringes": search the geometry (nice-fringes.js), apply it, start a new run.
 const niceButton=document.getElementById('niceFringesButton'),niceStatus=document.getElementById('nice-fringes-status');
 function syncNiceButton(){if(!niceButton||niceButton.dataset.busy)return;const n=openSlitIds().length;niceButton.disabled=n<2;niceButton.title=n<2?'Open at least two slits.':niceButton.dataset.title||niceButton.title;}
 if(niceButton){niceButton.dataset.title=niceButton.title;niceButton.addEventListener('click',async()=>{
  if(openSlitIds().length<2)return;
  niceButton.dataset.busy='1';niceButton.disabled=true;const label=niceButton.textContent;niceButton.textContent='Finding…';niceStatus.textContent='';
  // The result starts a new run anyway: pause the animation so the search gets the whole CPU, then resume.
  const wasRunning=isAnimating;if(wasRunning)document.getElementById('startButton').click();
  try{
   // Numerical engine with a hard-edged wall: openings of ± 2.5 σ spread the wave like
   // the Gaussian slit (equal half widths of the diffraction envelopes need ± 2.36 σ;
   // 2.5 is the nearest step), so the fringes chosen here look alike in both engines.
   const hardOpenings=engineWanted()&&num.available&&numSlitModel!=='mask';
   if(hardOpenings&&+extent.value!==2.5&&+extent.max>=2.5){extent.value=2.5;syncPacketInput(extent);}
   const r=await niceFringeGeometryAsync({N:numSlits,openIds:openSlitIds(),wall:sourcePos,extentSigma:+extent.value});
   if(!r){niceInfo=null;niceStatus.title=openSlitIds().length>2?'No setting within the allowed ranges gives a series of bumps with a single tallest centre for these slits. With many slits the screen (≤ 3000 nm away) is in the near field of the grating, where it shows an image of the slits rather than separated fringes (see Physics, Near and far field). Close some slits, or try fewer.':'No setting within the allowed ranges gives clean fringes for these slits.';niceStatus.textContent='No clean fringes for these slits (hover for why).';return;}
   const set=(id,v)=>document.getElementById(id+'-group').setValueInFirstUnit(v);
   set('screen-height',r.screen);set('wavelength',r.wavelength);set('detector-distance',r.D);
   width.value=r.sigma;sourceWidth.value=r.sourceSigma;syncPacketInput(width);syncPacketInput(sourceWidth);
   // Recompute the separation limit for the new screen and slit width before
   // setting the separation (the slider clamps to its current maximum).
   setupGeo(false);applyPacketLimits();
   set('slit-separation',r.d);
   setupGeo(false);reset=0;resetEngine();draw();
   const clamped=slitSeparation!==r.d?` (separation limited to ${slitSeparation} nm)`:'';
   let niceText=`λ ${r.wavelength} nm · slit σ ${r.sigma} nm · separation ${r.d} nm${clamped} · screen ${r.D} nm away, ${r.screen} nm long · source σ ${r.sourceSigma} nm: ${r.count} bumps, central tallest, spacing ${Math.round(r.spacing)} nm (λD/d = ${Math.round(r.farField)} nm)`+(openSlitIds().length===2?': double-slit fringes.':`. Near field: the screen is ${(r.D/(2*r.d*r.d/r.wavelength)).toFixed(2)} Talbot lengths (2d²/λ = ${Math.round(2*r.d*r.d/r.wavelength)} nm) from the wall, so the bumps are an image of the slits, not the textbook N-slit pattern (see Physics, Near and far field).`);
   if(hardOpenings&&r&&+extent.value===2.5)niceText+=' Numerical engine: slit openings set to ± 2.5 σ, so the hard-edged slits spread the wave like the Gaussian ones.';
   // One line in the panel; the full explanation goes to the caption below the picture.
   niceStatus.textContent=`${r.count} bumps, spacing ${Math.round(r.spacing)} nm (details below the picture)`;niceStatus.title='';
   niceInfo={text:niceText,fp:fingerprint};captionKey='';updateCaption();
  }finally{delete niceButton.dataset.busy;niceButton.textContent=label;syncNiceButton();if(wasRunning&&!isAnimating)document.getElementById('startButton').click();}
 });}
 function sampleBranch(){
  ensure();if(nHits===0||window.qonticMWBranches?.busy)return;
  const cdf=[];let sum=0;for(const weight of law.weights){sum+=weight;cdf.push(sum);}
  if(!(sum>0))return;
  const record=Array(p.bins).fill(0);
  for(let hit=0;hit<nHits;hit++){
   const u=Math.random()*sum;let lo=0,hi=cdf.length-1;
   while(lo<hi){const mid=(lo+hi)>>1;if(u<cdf[mid])hi=mid;else lo=mid+1;}
   record[lo]++;
  }
  hits=record;slitHits=emptySlitHits(p.bins);spectrumHitCounts=Array(p.bins).fill(0);spectrumHitSums=Array(p.bins).fill(0);hitMax=Math.max(...hits);detectorFlashes.clear();flash=null;draw();
 }
 return {get particleList(){return particles;},
  // Quiz and presets: numerical options {wall, blade, tau, bladeW, showChange, changeGain, guide, replay}.
  setNumOptions(o={},{persist=true}={}){if(o.wall){numSlitModel=o.wall;if(persist)localStorage.setItem('qontic-te-num-wall',numSlitModel);}for(const k of ['blade','tau','bladeW','showChange','changeGain','guide','replay','trails','halfLife','dotSize'])if(o[k]!==undefined)numOpt[k]=o[k];if(persist)saveNumOpt();syncShutterUI();syncEngineControls();resetEngine();draw();},
  get numOptions(){return {...numOpt,wall:numSlitModel};},
  oneParticle:toggleOneParticle,get wallModel(){return p.geometry.wall;},get engine(){return engine;},get numericalActive(){return numericalActive();},get numProfile(){return numProfile;},get anaProfile(){return profile;},get numStatus(){return numStatus;},get hitsTotal(){return nHits;},setEngine,num,
  get zoom(){return {z:zoom.z,tx:zoom.tx,ty:zoom.ty};},  setLevel,get level(){return level;},closeSlitPreset,whenPacketAtWall(f){atWallQueue.push(f);},get atWallPending(){return atWallQueue.length>0;},sampleBranch,switchMask,get simTime(){return t;},get frameStats(){return frameStats;},syncBranching(){ensure();draw();},setWhichPath(){if(numericalActive()&&switchMask())return;resetEngine();draw();},get viewportWidth(){return (sourcePos+detectorDistance)/.7;},get enabled(){return true;},reset:resetEngine,draw,drawWave,drawParticles,histogram,frame,updateMath,hash,pause(){last=null;if(packetAnimationId!==null)cancelAnimationFrame(packetAnimationId);packetAnimationId=null;}};
}
