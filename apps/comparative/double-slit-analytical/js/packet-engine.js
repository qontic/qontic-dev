import {cachedPacketFrame,LaunchClock} from './packet-cache.js?v=44.1';
import {sourceSchedule,stepParticles} from './spherical-field.js?v=44.1';
import {gaussian,transverse,longitudinal,positionX,advanceY,sample,screenProfile,histogramLayout} from './packet-model.js?v=41';
import {aperture,sourceCoefficients,sourceTransverse,sourceEnvelope,sampleSource,stepSource,sourceProfile} from './source-packet-model.js?v=42';
// Engine adapter: uses the application's existing controls, canvas layers and record.
export function mountPacketEngine({core,advanced}) {
 const chooser=document.createElement('label');chooser.className='packet-model-choice';chooser.innerHTML='Wave model <select aria-label="Wave model"><option value="continuous">Continuous</option><option value="spherical">Packet · spherical source (prototype)</option><option value="source">Packet · Gaussian source</option><option value="packet">Packet · slit exits</option></select>';core.prepend(chooser);
 const select=chooser.querySelector('select'),panel=document.createElement('div');panel.className='packet-settings';panel.hidden=true;
 panel.innerHTML='<label>Packet length σ <output>50 nm</output><input aria-label="Packet length" type="range" min="20" max="200" step="5" value="50"></label><label>Slit / exit width σ <output>30 nm</output><input aria-label="Packet exit width" type="range" min="10" max="200" step="5" value="30"></label><label><input type="checkbox" checked> Repeat packets</label><p class="packet-note" role="status"></p>';advanced.prepend(panel);
 const [length,width,repeat]=panel.querySelectorAll('input'),note=panel.querySelector('p');
 const sourceLabel=document.createElement('label');sourceLabel.hidden=true;sourceLabel.innerHTML='Source width σ <output>200 nm</output><input aria-label="Packet source width" type="range" min="50" max="400" step="5" value="200">';panel.insertBefore(sourceLabel,panel.firstChild);
 const sourceWidth=sourceLabel.querySelector('input');
 const launchLabel=document.createElement('label');launchLabel.hidden=true;launchLabel.innerHTML='Launch interval <output>3.0 s</output><input aria-label="Packet launch interval" type="range" min="0.5" max="10" step="0.5" value="3">';panel.insertBefore(launchLabel,note);
 const focusLabel=document.createElement('label');focusLabel.hidden=true;focusLabel.innerHTML='<input type="checkbox"> Aim particles at slits (biased sample)';panel.insertBefore(focusLabel,note);
 const launchInterval=launchLabel.querySelector('input'),focus=focusLabel.querySelector('input');
 launchInterval.addEventListener('input',()=>{launchLabel.querySelector('output').textContent=Number(launchInterval.value).toFixed(1)+' s';launchClock.reset();});
 focus.addEventListener('change',()=>{if(enabled){resetEngine();draw();}});

 const isSpherical=()=>select.value==='spherical';
 const isSource=()=>select.value==='source'||isSpherical();
 const status=document.createElement('p');status.className='packet-note';status.hidden=true;core.append(status);
 const style=document.createElement('style');style.textContent='.packet-model-choice{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:10px 0}.packet-model-choice select{font:inherit;max-width:60%;background:var(--panel,#172b3b);color:inherit;border:1px solid #476477;border-radius:5px;padding:5px}.packet-settings{margin:10px 0}.packet-settings[hidden],.packet-settings label[hidden],.packet-note[hidden]{display:none!important}.packet-settings label{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px;margin:10px 0}.packet-settings input[type=range]{grid-column:1/-1;width:100%;min-width:0;accent-color:#55d8e6}.packet-settings label:has(input[type=checkbox]){display:flex;gap:8px}.packet-note{font:inherit;font-size:.85em;line-height:1.4;color:inherit;opacity:.8}';style.textContent+=' .packet-model-choice,.packet-model-choice select,.packet-settings,.packet-settings label,.packet-note{color:#dcecf4!important} [data-theme="light"] .packet-model-choice,[data-theme="light"] .packet-model-choice select,[data-theme="light"] .packet-settings,[data-theme="light"] .packet-settings label,[data-theme="light"] .packet-note{color:#183343!important}';style.textContent+=' .packet-equation{overflow-x:auto;padding:8px 0}.packet-equation .katex{font-size:1.1em}';document.head.append(style);
 const math=document.getElementById('math-container'),mathChildren=[...math.children],packetMath=document.createElement('section');packetMath.className='math-section';packetMath.hidden=true;
 packetMath.innerHTML='<h2>Analytical slit-exit packets</h2><p>A coherent pair of freely evolving Gaussians is prepared at the slit exits. This model does not solve scattering from a hard wall or emission from the source.</p><div class="packet-equation"></div><p>For two open slits the expression above applies; with one open slit only its Gaussian is present. The wave and its gradients are analytical. Transverse Pilot-Wave paths use RK4 integration; initial positions sample |Ψ(0)|². Screen probabilities integrate outward current over each detector pixel and the packet duration. The smooth curve is the time-integrated screen-current density, normalized to the observed hit total and expressed as expected counts per detector-bin width. Dots and √n errors use the same horizontal count scale. At zero hits the curve uses a unit reference for visibility. Launching another packet does not alter this scale.</p><p>Coordinates are shown in nm. Internally ℓ=100 nm and t₀=mℓ²/ℏ set dimensionless units. Packet length and exit width are density standard deviations. Wave visibility uses a display-only envelope relative to the instantaneous peak; the Wave opacity control still applies, in all interpretations. This does not change probabilities or trajectories.</p>';math.prepend(packetMath);
 const slitMathHTML=packetMath.innerHTML;
 const sourceMathHTML='<h2>Analytical source-to-screen packets</h2><p>A Gaussian pulse travels from the source through a pair of soft Gaussian apertures. One travelling envelope and one carrier phase cover both sides of the slit plane. Transmission is evaluated from the incoming complex wave; the outgoing packet is not restarted or faded in.</p><div class="packet-equation"></div><p>Here x is measured from the source, L is the aperture position, k=2π/λ and v=ℏk/m. F is a Gaussian longitudinal envelope. Before the mask, φ is a freely propagated transverse Gaussian. At the mask, φ⁺(y)=T(y)φ⁻(y), with T a real sum of Gaussian aperture amplitudes scaled so 0≤T≤1. Each Gaussian product is propagated analytically downstream and their complex amplitudes are added. The incident phase curvature is retained. The soft mask absorbs intensity where transmission is weak; it does not model reflection from a hard wall.</p><p>This is a forward, paraxial approximation: longitudinal speed is v, longitudinal spreading is neglected, and transverse diffraction is analytical. It is most accurate for a narrow momentum spread and small diffraction angles; very short packets or narrow apertures relative to λ fall outside that regime. The source width and aperture width controls are Gaussian density standard deviations (the latter for an isolated aperture transmission profile). Energy shows the central longitudinal energy.</p><p>Pilot-Wave-style trajectories follow the transverse current with forward speed v. The incoming Gaussian paths are analytical; downstream paths use RK4. At the mask, particles are transmitted with probability T²(y) or marked absorbed. This stochastic absorption represents a reduced aperture model, not a microscopic Bohmian model of the wall. The initial forward tail beyond the mask is excluded from particle sampling; the four-σ distance limit bounds that tail below 0.0032%. The untruncated Gaussian wave remains analytical.</p><p>The screen curve is the transmitted transverse density, proportional to integrated forward flux. It is normalized to the observed screen-hit total; dots and √n errors share that count scale. The scale changes with hits, never with packet injection. At zero hits it uses a unit reference. Source-particle count includes absorbed and missed particles. Changing interpretation preserves the record.</p><p>Wave brightness uses a fixed display reference throughout each run, with a nonlinear visibility envelope and the existing opacity control. Display enhancement does not affect transmission, trajectories or probabilities. The earlier exact free slit-exit Gaussian model remains available under Wave model.</p><p>Analytical Gaussian-aperture propagation: <a href="https://arxiv.org/abs/1406.2408" target="_blank" rel="noopener">Neto, da Paz and Cabral, Eur. J. Phys. 36 (2015) 035002</a>. Our translating longitudinal envelope is an additional paraxial modelling choice.</p>';
 const sphericalMathHTML='<h2>Spherical-source packet: circular 2D model</h2><p>Playback reuses a cached spectral solution. Its complex envelope is interpolated in time after removing the analytically known carrier phase, which is then restored. Spatial and temporal interpolation are numerical approximations; the wave is not advanced by a PDE time-stepping solver.</p><p>The Speed slider controls packet motion. Launch interval sets the time between emissions in unpaused playback seconds, independently of Speed. Up to 12 independent packets may coexist; the launch queue waits at that limit. Their displayed densities add as an incoherent ensemble. Phase color represents the locally strongest packet, not the phase of a combined pure state. Each packet guides its own particles.</p><p>Aim particles at slits restricts initial directions to the union of angular windows that reach within two aperture-width standard deviations of an open slit. It leaves the wave unchanged and therefore intentionally breaks Born-equilibrium sampling. The normal prediction curve is hidden in that mode. Increasing Slit / exit width instead changes the physical aperture model and its predicted diffraction.</p><p>The picture uses the circular analogue of a spherical point source. Each outgoing frequency component is a Hankel function H₀⁽¹⁾(kr), so the incident wavefronts and packet envelope expand radially. This is a two-dimensional model, not a three-dimensional spherical probability density. A finite-bandwidth source emits a pulse; its start time and spectrum are shared by the incident and transmitted fields.</p><div class="packet-equation"></div><p>A(k)=exp[−σ²(k−k₀)²] for positive k. The Packet length control sets this spectral width; σ is approximately a spatial density standard deviation only in the narrow-band limit. The 3D outgoing Gaussian superposition can be evaluated in closed form, but its 1/r amplitude is not a solution of this 2D problem. Here the Hankel spectrum is integrated by quadrature to keep the wave and its probability current dimensionally consistent. At each frequency, the incoming complex field at the wall is multiplied by the same Gaussian aperture amplitude T(y). Its transverse Fourier components propagate with kₓ=√(k²−q²), choosing positive real kₓ and positive imaginary kₓ for evanescent components. Evanescent terms are retained near the aperture. Frequency phases use ω=ℏk²/(2m), including dispersion. There is no downstream time reset or visual fade between independent packets.</p><p>The free propagation kernels solve the Helmholtz and time-dependent Schrödinger equations in their respective open regions. Prescribing Tψ at the wall is a thin-mask approximation, not an exact hard-wall scattering solution. Reflection and a microscopic source, wall and detector are not included. The source region inside a small circle is not resolved.</p><p>Independent particles are emitted through that circle with emission times sampled from its outward probability current and uniform forward angles. Their incident motion is radial. Downstream paths follow j/|ψ|², using the numerical spectral field. At the mask, a reduced one-way transmission rule uses the ratio of outgoing to incoming normal current, clipped to [0,1]. It is not a microscopic Bohmian wall model. Local inward mask current and any current excess are not represented by this rule; its accuracy must be checked against screen flux for the selected geometry. Small current reversals near the mask are possible even with positive longitudinal momenta.</p><p>The predicted screen curve integrates signed normal current over the pulse. Configurations with appreciable detector backflow are rejected rather than interpreted as positive arrival probabilities. Particles outside the displayed vertical range or still travelling when the pulse window ends are counted as missed/late. Hits and the prediction share the existing hit-driven histogram scale. Changing interpretation preserves the ensemble record.</p><p>Wave density uses a fixed nonlinear display enhancement for visibility; phase is unchanged. It does not change trajectories or detection probabilities. Spectral and spatial resolutions are finite; geometry that exceeds the interactive resolution limit is rejected with a message. Packet preparation runs in a background worker.</p>';
 const rationale=document.createElement('section');rationale.innerHTML='<h2>Packet engines</h2><p>Packet · spherical source adds an expanding circular pulse in this 2D view, with radial incident paths. Its outgoing Hankel kernels and angular-spectrum propagation carry the same frequency phases through the Gaussian apertures. Numerical quadrature evaluates those analytical kernels; there is no grid-based time-stepping solver for the wave. This source is circular in two dimensions, the analogue of a spherical source, rather than a full 3D calculation. The previous Gaussian-source and slit-exit engines remain selectable.</p><p>The spherical mode uses a reduced one-way aperture model. It propagates the transmitted complex wave and uses its probability current for particle guidance and effective transmission. This is approximate at the mask and omits reflection; it should not be described as an exact hard-wall scattering solution. See Math for the emission, current, detector and resolution assumptions.</p><p>Choose Packet · Gaussian source in Core to follow a pulse from the source through Gaussian apertures to the screen. The source width controls illumination of the slits. The apertures filter the incoming amplitude while preserving its phase, and the transmitted components interfere downstream. The leading part of the same envelope can be beyond the apertures while its tail is still approaching. A fixed brightness reference prevents a visual jump at transmission.</p><p>The source mode uses analytical forward (paraxial) propagation, with constant longitudinal group speed and transverse spreading. It omits longitudinal dispersion and hard-wall reflection. Particles sample the incident ensemble; some are absorbed by the Gaussian mask and the surviving paths continue from their crossing positions. Absorption is sampled with T², an effective loss model, rather than a microscopic wall interaction. The Math tab gives the assumptions and equations.</p><p>Select Packet · slit exits in Core for the previous freely evolving Gaussian preparation at the slit exits. The existing wavelength, slit separation, detector geometry and particle controls apply. Max. Particles becomes the number of independent particles per packet. The Gaussian and slit-exit packets repeat after a fixed flight window; spherical packets use the independent Launch interval control; hits persist between packets. Changing engines or preparation resets the record, while changing interpretation preserves it.</p><p>In slit-exit mode, the dashed exit plane replaces the hard-wall drawing. Packet centers start three longitudinal standard deviations downstream: about 99.865% of the initial longitudinal probability is beyond the plane. Gaussian tails remain untruncated, preserving analytical free evolution. Packet length is limited to one eighth of the exit-to-screen distance, leaving at least five standard deviations between the initial center and detector. The actual shorter flight distance is used for trajectories and the probability curve. The source is not part of slit-exit mode. Which-path interactions are not implemented in either packet mode. Electrons and neutrons are supported; a nonrelativistic massive-particle Gaussian is not used for photons.</p><p>Pilot-Wave displays the sampled trajectories. Orthodox and Many-Worlds display the same unconditioned ensemble wave and detection record without assigning visible paths. A hit consumes one independently prepared member, not the whole displayed ensemble wave. The quantum-potential display, current MW split animation and alternative-history resampling remain available with the continuous engine; they are not yet connected to packet detections. Packet detector statistics use first screen crossings and analytical outward flux, not a microscopic detector calculation.</p>';document.getElementById('rationale').prepend(rationale);
 let packetAnimationId=null,cohorts=[],launchClock=new LaunchClock(),sphericalCacheKey='',sphericalProfile=null;
 function cacheKey(q){return JSON.stringify([q.sx,q.sy,q.k,q.wall,q.screen,q.centers,q.duration,screenHeight,worldCanvasDx,wallXWorld]);}
 let sphericalTable=null,sphericalFrame=null,sphericalWorker=null,sphericalError='',sphericalPreparing=false,sphericalJob=0;
 let sourceGrid=null,coeff=null,absorbed=0,enabled=false,p=null,fingerprint='',t=0,totalTime=0,pulse=0,particles=[],profile=null,missed=0,last=null,realElapsed=0,timeUnit=1,yOffset=0,finished=false;
 const field=document.createElement('canvas');field.width=320;field.height=240;const fc=field.getContext('2d');let data=fc.createImageData(320,240);
 const shown=id=>document.getElementById(id)?.checked;
 function config(){
  const slits=slit1Open&&slit2Open?2:1;
  length.max=Math.max(1,Math.min(200,Math.floor(isSource()?Math.min(sourcePos/4,detectorDistance/4):detectorDistance/8)));
  length.min=Math.min(5,Number(length.max));
  if(Number(length.value)>Number(length.max))length.value=length.max;
  length.parentElement.querySelector('output').textContent=length.value+' nm';
  const next={sx:Number(length.value)/100,sy:Number(width.value)/100,separation:slitSeparation/100,k:2*Math.PI*100/wavelength,screen:detectorDistance/100,bins:Math.max(1,Math.floor(nDetectorPixels)),particles:Math.max(1,Math.min(5000,Math.floor(Number(document.getElementById('MaxPart-input').value)||100))),slits};
  next.source=isSource();next.spherical=isSpherical();next.focused=isSpherical()&&focus.checked;
  if(next.source){next.launch=-sourcePos/100;next.wall=sourcePos/100;next.screen+=next.wall;next.sourceSigma=Number(sourceWidth.value)/100;next.centers=[...(slit1Open?[(slit1YWorld-screenHeight/2)/100]:[]),...(slit2Open?[(slit2YWorld-screenHeight/2)/100]:[])].sort((a,b)=>a-b);}
  else {next.launch=3*next.sx;next.screen-=next.launch;}
  next.duration=Math.max(.2,2*next.screen/next.k+8*next.sx/next.k);
  if(next.spherical){next.radius=.08;next.emission=4*next.sx/next.k;next.duration=next.emission+(Math.hypot(next.screen,screenHeight/200)+8*next.sx)/next.k;}
  return next;
 }
 function emitSpherical(){
  if(!sphericalTable)return;
  const record={age:0,frame:cachedPacketFrame(sphericalTable,0),particles:sourceSchedule(sphericalTable,Math.random,p.particles)};
  cohorts.push(record);pulse++;nParticles+=p.particles;finished=false;
  particles=cohorts.flatMap(c=>c.particles);sphericalFrame=record.frame;
 }
 function prepare(){
  t=0;finished=false;
  if(p.spherical){emitSpherical();return;}
  pulse++;particles=Array.from({length:p.particles},()=>p.source?sampleSource(p):sample(p));nParticles+=p.particles;
 }
 function resetEngine(){
  const previousTable=sphericalTable,previousProfile=sphericalProfile,previousKey=sphericalCacheKey;
  sphericalJob++;sphericalWorker?.terminate();sphericalWorker=null;sphericalTable=null;sphericalFrame=null;sphericalError='';sphericalPreparing=false;cohorts=[];particles=[];launchClock.reset();
  p=config();if(p.spherical&&previousTable&&previousKey===cacheKey(p)){sphericalTable=previousTable;sphericalTable.p=p;sphericalProfile=previousProfile;}fingerprint=JSON.stringify([p,screenHeight,slit1Open,slit2Open,particleType]);yOffset=p.source||p.slits===2?screenHeight/200:(slit1Open?slit1YWorld:slit2YWorld)/100;
  coeff=p.source&&!p.spherical?sourceCoefficients(p):null;sourceGrid=null;absorbed=0;
  timeUnit=(particleType==='neutron'?mNeutron:mElectron)*10000/hbar;
  hits=Array(p.bins).fill(0);nHits=0;hitMax=0;logNBranches=0;nParticles=0;trajectories.length=0;missed=0;t=0;totalTime=0;time=0;pulse=0;nSteps=0;last=null;realElapsed=0;prepare();
  profile=p.spherical?{values:Array(161).fill(0),integral:0}:p.source?sourceProfile(p,-yOffset,screenHeight/100-yOffset):screenProfile(p,-yOffset,screenHeight/100-yOffset);
  updateBranchCountDisplay();setWaveRangeAuto(0,1);updateMath();if(p.spherical){if(sphericalTable)profile=sphericalProfile;else prepareSpherical();}stats();
 }
 function prepareSpherical(){
  const job=sphericalJob,xmin=Math.min(-.15,(0-wallXWorld)/100-p.launch),ymin=-yOffset,ymax=screenHeight/100-yOffset;
  const nx=Math.max(128,Math.ceil((p.screen-xmin)*p.k/(2*Math.PI)*18)),ny=Math.max(161,Math.ceil((ymax-ymin)*p.k/(2*Math.PI)*18));
  const frequencies=Math.max(96,Math.ceil((8/p.sx)*p.k*p.duration/(2*Math.PI)));
  if(p.wall<.3||nx>320||ny>321||frequencies>256){sphericalError='Spherical packets: increase source distance, wavelength or packet length, or reduce the displayed area, to resolve this geometry.';return;}
  sphericalPreparing=true;sphericalWorker=new Worker(new URL('./spherical-worker.js?v=44.1',import.meta.url),{type:'module'});
  sphericalWorker.onmessage=({data:result})=>{
   if(job!==sphericalJob||!enabled||!p.spherical)return;
   if(result.progress){status.textContent=result.progress;return;}
   sphericalPreparing=false;sphericalWorker?.terminate();sphericalWorker=null;
   if(result.error){sphericalError=result.error;stats();return;}
   sphericalTable=result.table;sphericalProfile=profile=result.profile;sphericalCacheKey=cacheKey(p);
   prepare();last=null;draw();
  };
  sphericalWorker.onerror=()=>{if(job!==sphericalJob)return;sphericalPreparing=false;sphericalError='Spherical packet preparation failed. Change the geometry or select the previous Gaussian source.';sphericalWorker?.terminate();stats();};
  sphericalWorker.postMessage({p,options:{nx,ny,xmin,xmax:p.screen,ymin,ymax,frequencies,order:Math.max(96,Math.ceil((p.screen+Math.max(Math.abs(ymin),Math.abs(ymax)))*p.k))}});
 }
 function ensure(){const c=config();if(JSON.stringify([c,screenHeight,slit1Open,slit2Open,particleType])!==fingerprint)resetEngine();}
 function updateMath(){
  if(enabled){const q=document.querySelector('#waveFunctionOption option[value=QPotential]');if(q)q.disabled=true;if($('#waveFunctionOption').val()==='QPotential')$('#waveFunctionOption').val('Psi2');}
  mathChildren.forEach(el=>el.hidden=enabled);packetMath.hidden=!enabled;
  const origin=isSpherical()?'spherical':isSource()?'source':'slits';if(packetMath.dataset.origin!==origin){packetMath.innerHTML=isSpherical()?sphericalMathHTML:isSource()?sourceMathHTML:slitMathHTML;packetMath.dataset.origin=origin;}
  if(enabled&&isSpherical()&&typeof katex!=='undefined'){katex.render(String.raw`\Psi_\mathrm{in}=\int A(k)H_0^{(1)}(kr)e^{-i\hbar k^2(t-t_e)/(2m)}\,dk,\quad \widetilde\Psi_\mathrm{out}(q,x,k)=\widetilde{T\Psi_\mathrm{in}}(q,L,k)e^{i\sqrt{k^2-q^2}(x-L)}`,packetMath.querySelector('.packet-equation'),{displayMode:true,throwOnError:false});return;}
  if(enabled&&isSource()&&typeof katex!=='undefined'){katex.render(String.raw`\Psi=F(x-vt)e^{i(kx-\omega t)}\phi(y,x),\quad i\hbar v\,\partial_x\phi=-\frac{\hbar^2}{2m}\partial_y^2\phi,\quad \phi(y,L^+)=T(y)\phi(y,L^-)`,packetMath.querySelector('.packet-equation'),{displayMode:true,throwOnError:false});return;}
  if(enabled&&typeof katex!=='undefined')katex.render(String.raw`\Psi=g_x(x,t)\frac{g_y(y+d/2,t)+g_y(y-d/2,t)}{\sqrt{2[1+e^{-d^2/(8\sigma_y^2)}]}},\quad \sigma(t)=\sigma\sqrt{1+\left(\frac{\hbar t}{2m\sigma^2}\right)^2}`,packetMath.querySelector('.packet-equation'),{displayMode:true,throwOnError:false});
 }
 const disabledControls=['toggleWhichPath','sourceOption','particleRate','particleRate-input','mw-branch-tour','resampleHitsButton','resetBranches'];
 const savedDisabled=new Map();
 const originControl=document.getElementById('sourceOption'),isotropicOption=originControl.querySelector('option[value=isotropic]');const originalOrigin=originControl.value,originalOriginText=isotropicOption.textContent;
 const maxLabel=document.querySelector('#MaxPart-group label');let maxLabelText=maxLabel?.textContent;
 function switchEngine(){
  if(isAnimating)document.getElementById('startButton').click();
  enabled=select.value!=='continuous';panel.hidden=status.hidden=!enabled;sourceLabel.hidden=!isSource()||isSpherical();launchLabel.hidden=focusLabel.hidden=!isSpherical();window.qonticMWBranches?.cancel();
  for(const id of disabledControls){const el=document.getElementById(id);if(!el)continue;if(enabled){if(!savedDisabled.has(el))savedDisabled.set(el,el.disabled);el.disabled=true;el.title='Available with the continuous engine';}else el.disabled=savedDisabled.get(el)||false;}
  if(!enabled)savedDisabled.clear();
  const qOption=document.querySelector('#waveFunctionOption option[value="QPotential"]');if(qOption)qOption.disabled=enabled;
  if(enabled&&$('#waveFunctionOption').val()==='QPotential')$('#waveFunctionOption').val('Psi2');
  const photon=document.querySelector('#particleType option[value="photon"]');if(photon)photon.disabled=enabled;
  if(enabled){if(particleType==='photon')$('#particleType').val('electron');whichPathDetector='none';updateWhichPathButton();const tour=document.getElementById('mw-branch-tour');if(tour){tour.checked=false;tour.dispatchEvent(new Event('change'));}setupGeo(false);resetEngine();}
  else {sphericalJob++;sphericalWorker?.terminate();sphericalWorker=null;sphericalTable=null;sphericalFrame=null;reset=1;fingerprint='';}
  if(maxLabel)maxLabel.textContent=enabled?'Particles / packet:':maxLabelText;
  if(enabled){originControl.value=isSource()?'isotropic':'slits';isotropicOption.textContent=isSpherical()?'Spherical source':'Gaussian source';}else {originControl.value=originalOrigin;isotropicOption.textContent=originalOriginText;}
  note.textContent=isSpherical()?'Speed controls packet motion; Launch interval controls emission timing in playback seconds. Pulses may overlap. Slit width controls transmission. Aimed sampling biases particle statistics.':isSource()?'Source → Gaussian apertures → screen. Particles / packet counts incident particles; some are absorbed.':'Slit-exit preparation. Use Particles / packet below. Source and which-path controls are inactive.';
  updateMath();if(!enabled)updateMathFormulas();renderSetupFlag=1;lastCycleIndex=-1;drawSystem(0);
 }
 select.addEventListener('change',switchEngine);
 for(const control of [length,width,sourceWidth])control.addEventListener('input',()=>{control.parentElement.querySelector('output').textContent=control.value+' nm';if(enabled){resetEngine();draw();}});
 function stats(){
  const mass=particleType==='neutron'?mNeutron:mElectron,speed=hbar/mass*(p.k/100);
  $('#waveSpeed').text(speed>=1000?(speed/1000).toFixed(2)+' km/s':speed.toFixed(2)+' m/s');
  const overlap=p.slits===2?Math.exp(-(p.separation*p.separation)/(8*p.sy*p.sy)):0;
  const py2=1/(4*p.sy*p.sy)-(p.slits===2?p.separation*p.separation*overlap/(16*p.sy**4*(1+overlap)):0);
  const energy=.5*mass*(hbar/(mass*100))**2*(p.k*p.k+1/(4*p.sx*p.sx)+py2)/1.602176634e-19;
  $('#particleEnergy').text((p.source ? 0.5*mass*(hbar*p.k/(mass*100))**2/1.602176634e-19:energy).toExponential(2)+' eV');
  document.getElementById('particleEnergy').title=p.source?'Central carrier energy of the source packet':'Mean energy of the free Gaussian packet';
  time=totalTime*timeUnit;$('#systemTime').text(time.toFixed(3)+' ns');$('#realTime').text(realElapsed.toFixed(1)+' s');$('#nhits').text(nHits);$('#shownParticles').text(particles.filter(a=>!a.done&&(!p.spherical||a.visible)).length);$('#maxParticlesDisplay').text(p.spherical?p.particles*cohorts.length:p.particles);$('#nSteps').text(nSteps);
  if(p.spherical&&(sphericalPreparing||sphericalError)){status.textContent=sphericalError||'Preparing spherical packet…';return;}
  status.textContent=`${p.spherical?cohorts.length+' active · ':''}Packet ${pulse} · ${p.source?absorbed+' absorbed · ':''}${finished?'complete · ':''}${missed} outside screen / late${p.focused?' · biased sample; prediction hidden':''}${p.spherical&&cohorts.length>=12?' · launch limit reached':''}`;
 }
 function integrate(dt){
  if(p.spherical){
   if(!sphericalTable||dt<=0)return;
   for(const cohort of cohorts){
    const end=Math.min(p.duration,cohort.age+dt),next=cachedPacketFrame(sphericalTable,end);
    for(const event of stepParticles(sphericalTable,cohort.frame,next,cohort.particles)){
     const a=event.particle;
     if(event.type==='absorbed')absorbed++;
     else if(event.type==='missed')missed++;
     else if(event.type==='hit'){
      const index=Math.floor((a.y+yOffset)/(screenHeight/100)*p.bins);
      if(index>=0&&index<p.bins){hits[index]++;nHits++;hitMax=Math.max(hitMax,hits[index]);logNBranches+=Math.log10(p.bins);}else missed++;
     }
    }
    cohort.age=end;cohort.frame=next;
    for(const a of cohort.particles)a.visible=!a.done&&a.birth<=end;
    if(end>=p.duration-1e-10){missed+=cohort.particles.filter(a=>!a.done).length;cohort.particles.forEach(a=>a.done=true);}
   }
   cohorts=cohorts.filter(c=>c.age<p.duration-1e-10);particles=cohorts.flatMap(c=>c.particles);
   totalTime+=dt;t=totalTime;nSteps++;
   if(!cohorts.length&&!repeat.checked){finished=true;isAnimating=false;$('#startButton').text('Start');}
   return;
  }
  for(const a of particles){if(a.done)continue;
   if(p.source){
    const event=stepSource(a,dt,p,coeff);
    if(event==='absorbed')absorbed++;
    if(event==='hit'){
     const index=Math.floor((a.y+yOffset)/(screenHeight/100)*p.bins);
     if(index>=0&&index<p.bins){hits[index]++;nHits++;hitMax=Math.max(hitMax,hits[index]);logNBranches+=Math.log10(p.bins);}else missed++;
    }
    if(shown('plot_trajectories')){a.path.push([a.x,a.y]);if(a.path.length>600)a.path.shift();}continue;
   }
   const x=a.x,y=a.y;a.y=advanceY(y,t,dt,p);a.x=positionX(a.x0,t+dt,p);
   if(x<p.screen&&a.x>=p.screen){const hitY=y+(a.y-y)*(p.screen-x)/(a.x-x)+yOffset,index=Math.floor(hitY/(screenHeight/100)*p.bins);if(index>=0&&index<p.bins){hits[index]++;nHits++;hitMax=Math.max(hitMax,hits[index]);logNBranches+=Math.log10(p.bins);}else missed++;a.done=true;}
   if(shown('plot_trajectories')){a.path.push([a.x,a.y]);if(a.path.length>600)a.path.shift();}
  }
  t+=dt;totalTime+=dt;nSteps++;
  if(t>=p.duration-1e-10){missed+=particles.filter(a=>!a.done&&(!p.spherical||a.visible)).length;particles.forEach(a=>a.done=true);if(repeat.checked)prepare();else {finished=true;isAnimating=false;$('#startButton').text('Start');}}
 }
 function frame(){
  packetAnimationId=null;if(!enabled||!isAnimating)return;
  ensure();const now=performance.now(),elapsed=last===null?0:(now-last)/1000,wallDt=Math.min(p.spherical?2:.05,elapsed);last=now;realElapsed+=elapsed;
  if(p.spherical&&!sphericalTable){last=null;stats();if(isAnimating&&!sphericalError)packetAnimationId=requestAnimationFrame(evolveSystem);else if(sphericalError){isAnimating=false;$('#startButton').text('Start');}return;}
  if(finished){prepare();}
  const speed=Number($('#animationStep-group')[0].getValueInFirstUnit())||1;
  // Roughly six seconds of playback to reach the detector at 1x; physics
  // substeps remain small regardless of the animation-speed setting.
  let remaining=wallDt*speed*p.screen/p.k/6,limit=0;
  const stepSize=Math.min(.005,.02*p.sy*p.sy,p.screen/p.k/300,p.sx/p.k/30);
  if(p.spherical){
   const launchCount=launchClock.advance(wallDt,Number(launchInterval.value),repeat.checked,Math.max(0,12-cohorts.length));for(let i=0;i<launchCount;i++)emitSpherical();
   while(remaining>1e-10&&isAnimating&&limit++<120){const dt=Math.min(remaining,.012);integrate(dt);remaining-=dt;}
   for(const a of particles)if(shown('plot_trajectories')&&a.visible){a.path.push([a.x,a.y]);if(a.path.length>600)a.path.shift();}
   remaining=0;
  }
  while(remaining>1e-10&&isAnimating&&limit++<2000){const dt=Math.min(stepSize,remaining,p.duration-t);integrate(dt);remaining-=dt;}
  draw();$('#stepTime').text((performance.now()-now).toFixed(1));updateBranchCountDisplay();if(isAnimating)packetAnimationId=requestAnimationFrame(evolveSystem);
 }
 const X=x=>(wallXWorld+(p.launch+x)*100)*toCanvasX,Y=y=>(y+yOffset)*100*toCanvasY;
 function drawWave(){
  if(!enabled)return;ensure();if(!p.spherical&&(field.width!==320||field.height!==240)){field.width=320;field.height=240;data=fc.createImageData(320,240);}if(p.spherical){drawSphericalWave();return;}if(p.source){drawSourceWave();return;}waveCtx.clearRect(0,0,canvas.width,canvas.height);if(!shown('plot_wave'))return;
  setWaveRangeAuto(0,1);const range=getWaveRangeEffective(),span=Math.max(1e-9,range.max-range.min),mode=$('#waveFunctionOption').val();
  const xs=Array.from({length:320},(_,i)=>longitudinal(((i+.5)/320*worldCanvasDx-wallXWorld)/100-p.launch,t,p));
  const ys=Array.from({length:240},(_,j)=>transverse((j+.5)/240*screenHeight/100-yOffset,t,p));
  const peak=1/(2*Math.PI*p.sx*p.sy),framePeak=Math.max(...xs.map(v=>v.rho))*Math.max(...ys.map(v=>v.rho)),pal=Array.from({length:256},(_,i)=>window.paletteModule.getColorForValue(i/255,graphPalette));
  for(let j=0;j<240;j++)for(let i=0;i<320;i++){const a=xs[i],b=ys[j],rho=a.rho*b.rho,weight=Math.min(1,1.5*Math.pow(rho/Math.max(1e-30,framePeak),.35));let value;
   if(mode==='Phase')value=((Math.atan2(a.im,a.re)+Math.atan2(b.im,b.re))%(2*Math.PI)+2*Math.PI)%(2*Math.PI)/(2*Math.PI);
   else if(mode==='LogPsi2')value=Math.max(0,Math.min(1,(Math.log(Math.max(1e-15,rho/peak))+15)/15));
   else value=Math.min(1,rho/peak);
   const rgb=pal[Math.round(Math.max(0,Math.min(1,(value-range.min)/span))*255)],n=4*(j*320+i);data.data[n]=rgb[0];data.data[n+1]=rgb[1];data.data[n+2]=rgb[2];data.data[n+3]=255*elementOpacity('plot_wave')*weight;
  }
  fc.putImageData(data,0,0);waveCtx.save();waveCtx.imageSmoothingEnabled=true;waveCtx.imageSmoothingQuality="high";waveCtx.beginPath();waveCtx.rect(0,0,detectorX,canvas.height);waveCtx.clip();waveCtx.drawImage(field,0,0,canvas.width,canvas.height);waveCtx.restore();
  drawPaletteScale(graphPalette,mode==='Phase'?range.min*2*Math.PI:range.min,mode==='Phase'?range.max*2*Math.PI:range.max);
 }
 function drawSphericalWave(){
  waveCtx.clearRect(0,0,canvas.width,canvas.height);if(!shown('plot_wave')||!sphericalTable)return;
  const table=sphericalTable,{nx,ny}=table,frames=cohorts.map(c=>c.frame);if(!frames.length)return;
  if(field.width!==nx||field.height!==ny){field.width=nx;field.height=ny;data=fc.createImageData(nx,ny);}
  setWaveRangeAuto(0,1);const range=getWaveRangeEffective(),span=Math.max(1e-9,range.max-range.min),mode=$('#waveFunctionOption').val();
  const peak=2/(Math.max(.3,p.wall)*p.k*p.sx*p.sx),pal=Array.from({length:256},(_,i)=>window.paletteModule.getColorForValue(i/255,graphPalette));
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
   const z=j*nx+i;let rho=0,re=0,im=0,strongest=-1;
   for(const frame of frames){const r=frame.values[0][z],q=frame.values[1][z],density=r*r+q*q;rho+=density;if(density>strongest){strongest=density;re=r;im=q;}}
   const weight=Math.min(1,1.5*Math.pow(rho/peak,.3));let value;
   if(mode==='Phase')value=((Math.atan2(im,re)%(2*Math.PI))+2*Math.PI)%(2*Math.PI)/(2*Math.PI);
   else if(mode==='LogPsi2')value=Math.max(0,Math.min(1,(Math.log(Math.max(1e-15,rho/peak))+15)/15));
   else value=Math.min(1,Math.sqrt(rho/peak));
   const rgb=pal[Math.round(Math.max(0,Math.min(1,(value-range.min)/span))*255)];data.data[4*z]=rgb[0];data.data[4*z+1]=rgb[1];data.data[4*z+2]=rgb[2];data.data[4*z+3]=255*elementOpacity('plot_wave')*weight;
  }
  fc.putImageData(data,0,0);waveCtx.save();waveCtx.imageSmoothingEnabled=true;waveCtx.imageSmoothingQuality="high";waveCtx.beginPath();waveCtx.rect(0,0,detectorX,canvas.height);waveCtx.clip();waveCtx.drawImage(field,X(table.xmin),Y(table.ymin),X(table.xmax)-X(table.xmin),Y(table.ymax)-Y(table.ymin));waveCtx.restore();
  drawPaletteScale(graphPalette,mode==='Phase'?range.min*2*Math.PI:range.min,mode==='Phase'?range.max*2*Math.PI:range.max);
 }
 // The transverse field is stationary in x for the paraxial model. Cache
 // its exact complex values; only the common travelling envelope changes.
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
  const env=sourceGrid.xs.map(x=>sourceEnvelope(x,t,p));
  // Fixed density reference across the aperture and across pulses avoids
 // brightness pumping as the packet arrives or is absorbed.
  const peak=sourceGrid.maxRho/(Math.sqrt(2*Math.PI)*p.sx),pal=Array.from({length:256},(_,i)=>window.paletteModule.getColorForValue(i/255,graphPalette));
  for(let j=0;j<240;j++)for(let i=0;i<320;i++){
   const n=j*320+i,rho=sourceGrid.values[2*n]*env[i].rho;
   const weight=Math.min(1,1.5*Math.pow(rho/Math.max(1e-30,peak),.35));let value;
   if(mode==='Phase')value=((sourceGrid.values[2*n+1]+env[i].phase)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)/(2*Math.PI);
   else if(mode==='LogPsi2')value=Math.max(0,Math.min(1,(Math.log(Math.max(1e-15,rho/peak))+15)/15));
   else value=Math.min(1,rho/peak);
   const rgb=pal[Math.round(Math.max(0,Math.min(1,(value-range.min)/span))*255)];
   data.data[4*n]=rgb[0];data.data[4*n+1]=rgb[1];data.data[4*n+2]=rgb[2];data.data[4*n+3]=255*elementOpacity('plot_wave')*weight;
  }
  fc.putImageData(data,0,0);waveCtx.save();waveCtx.imageSmoothingEnabled=true;waveCtx.imageSmoothingQuality="high";waveCtx.beginPath();waveCtx.rect(0,0,detectorX,canvas.height);waveCtx.clip();waveCtx.drawImage(field,0,0,canvas.width,canvas.height);waveCtx.restore();
  drawPaletteScale(graphPalette,mode==='Phase'?range.min*2*Math.PI:range.min,mode==='Phase'?range.max*2*Math.PI:range.max);
 }
 function drawParticles(){
  partCtx.clearRect(0,0,canvas.width,canvas.height);if(interpretation!=='bohmian')return;
  partCtx.save();partCtx.beginPath();partCtx.rect(0,0,detectorX,canvas.height);partCtx.clip();
  for(const a of particles){if(shown('plot_trajectories')&&a.path.length){partCtx.globalAlpha=elementOpacity('plot_trajectories');partCtx.strokeStyle=colorTraj;partCtx.beginPath();a.path.forEach(([x,y],i)=>i?partCtx.lineTo(X(x),Y(y)):partCtx.moveTo(X(x),Y(y)));partCtx.stroke();}if(!a.done&&(!p.spherical||a.visible)&&shown('plot_particles')){partCtx.globalAlpha=elementOpacity('plot_particles');partCtx.fillStyle=colorPart;partCtx.beginPath();partCtx.arc(X(a.x),Y(a.y),3,0,2*Math.PI);partCtx.fill();}}
  partCtx.restore();
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
 function draw(){if(!enabled)return;ensure();setupCtx.clearRect(0,0,canvas.width,canvas.height);
  setupCtx.save();if(shown('plot_screen')){setupCtx.globalAlpha=elementOpacity('plot_screen');setupCtx.strokeStyle=colorScreen;if(p.source){
   // Show the actual soft transmission profile, not fictitious sharp edges.
   setupCtx.lineWidth=4;for(let j=0;j<canvas.height;j+=2){const mask=aperture((j+1)/toCanvasY/100-yOffset,p);setupCtx.globalAlpha=elementOpacity('plot_screen')*(1-mask*mask);setupCtx.beginPath();setupCtx.moveTo(wallX,j);setupCtx.lineTo(wallX,j+2);setupCtx.stroke();}
  }else{setupCtx.setLineDash([5,5]);setupCtx.beginPath();setupCtx.moveTo(wallX,0);setupCtx.lineTo(wallX,canvas.height);setupCtx.stroke();}}
  setupCtx.setLineDash([]);if(shown('plot_detector')){setupCtx.globalAlpha=elementOpacity('plot_detector');setupCtx.strokeStyle=colorDetector;setupCtx.beginPath();setupCtx.moveTo(detectorX,0);setupCtx.lineTo(detectorX,canvas.height);setupCtx.stroke();}setupCtx.restore();
  drawWave();drawParticles();histogram();window.qonticScaleOverlay?.update();stats();
 }
 function hash(){return enabled?'&engine=packet&packetOrigin='+(p.spherical?'spherical':p.source?'source':'slits')+'&launchInterval='+launchInterval.value+'&aimAtSlits='+(focus.checked?'1':'0')+'&sourceWidth='+sourceWidth.value+'&packetLength='+length.value+'&packetWidth='+width.value+'&packetCount='+p.particles:'';}
 const params=new URLSearchParams(location.hash.slice(1));if(params.get('engine')==='packet'){
  for(const [key,el] of [['packetLength',length],['packetWidth',width],['sourceWidth',sourceWidth]]){const n=Number(params.get(key));if(Number.isFinite(n)&&n>=Number(el.min)&&n<=Number(el.max)){el.value=n;el.parentElement.querySelector('output').textContent=n+' nm';}}
  const count=Number(params.get('packetCount'));if(count>=1&&count<=5000)$('#MaxPart-group')[0]?.setValueInFirstUnit(count);
  const interval=Number(params.get('launchInterval'));if(interval>=.5&&interval<=10){launchInterval.value=interval;launchLabel.querySelector('output').textContent=interval.toFixed(1)+' s';}focus.checked=params.get('aimAtSlits')==='1';
  // Defer activation until the adapter has been assigned to the main engine.
  queueMicrotask(()=>{select.value=params.get('packetOrigin')==='spherical'?'spherical':params.get('packetOrigin')==='source'?'source':'packet';switchEngine();});
 }
 return {get enabled(){return enabled;},reset:resetEngine,draw,drawWave,drawParticles,histogram,frame,updateMath,hash,pause(){last=null;if(packetAnimationId!==null)cancelAnimationFrame(packetAnimationId);packetAnimationId=null;}};
}
