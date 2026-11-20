import '../../../shared/qontic-controls.js?v=3.2';
import {mountQonticShell} from '../../../shared/qontic-shell.js?v=3.7';
import {mountQonticMedia} from '../../../shared/qontic-media.js?v=3.8';
import {visibility,portProbability,sampleEvent,momentumSpread,recoilRatio,eta,positionSpreadNm,positionPortProbability,thermalPosition,PAPER,PAPER_POINT,LAMBDA_NM} from './physics.mjs?v=1.0.0';
import {atomWave,outputWaves,branchWave,norm2,photonMode,stageOf,displayedPorts} from './waves.mjs?v=1.0.0';
import {APP_RELEASE} from './release.js?v=1.0.0';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
mountQonticShell({title:'Einstein’s Recoiling Slit',eyebrow:'Q-Ontic · Experiments',navigation:'breadcrumbs',badge:'Experiment · Zhang et al. 2025',purpose:'A single atom as Einstein’s movable slit: one photon, three views of measurement',version:`Recoiling slit · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,homeHref:'../../../index.html'});
$$('[data-view]').forEach(button=>button.setAttribute('aria-label',button.textContent.trim()));
const controls=$('qontic-controls'),canvas=$('#stage'),ctx=canvas.getContext('2d');
controls.setAttribute('theme','dark');
const DEPTH_MIN=0.02,DEPTH_MAX=20,MAX_STORED=50000;
const state={depth:PAPER.depthMin,nbar:0,phase:0,view:'cpn',running:false,repeat:true,speed:1,scan:false,read:false,theory:true,stats:false,quantity:'re',n:0,plus:0,atomN:0,bins:new Array(40).fill(0),xs:new Float32Array(MAX_STORED),ports:new Int8Array(MAX_STORED),stored:0,event:null,pending:null,follow:null,progress:.04,hold:0,prediction:null};
const derived=()=>{const dp=momentumSpread(state.depth);return {dp,r:recoilRatio(dp),eta:eta(dp),dxNm:positionSpreadNm(dp)};};
const dark={text:'#e1eaf4',muted:'#a4b9cc',grid:'#294054',a:'#74d8ce',b:'#edbc77',purple:'#b7a6f5',bg:'#0c1928',panel:'#102032',bar:'#21364b',band:'#b7a6f533'};
const C={...dark};
const viewNames={cpn:'Orthodox',pw:'Pilot Wave',mw:'Many Worlds'};
const stageDescriptions=[
  'Prepare: a light packet approaches the trapped atom. The atom starts in its ground state: one Gaussian momentum wave of width Δp.',
  'Scatter: the photon goes up (A) or down (B), and the atom recoils by −ħk or +ħk. Matching colors show the pairing.',
  'Recombine: the beam splitter adds and subtracts the paired amplitudes. The right plot keeps the atom momentum coordinate.',
  'Detect: the output amplitudes are correlated with separate detector records. Compare the three views using this same event.'
];
const viewDescriptions={
  cpn:['The joint wave evolves before measurement.','The joint wave evolves before measurement.','Both outputs are still present before measurement.','One outcome is recorded. Collapse leaves its normalized conditional atom wave.'],
  pw:['The atom has a definite position X in the trap (lower panel), distributed as |ψ|². The wave guides it.','The kicks multiply the atom wave by e^∓ikx: its phase changes, the atom’s position does not. Both components stay in the guiding wave.','For an atom at X the wave gives D₊ with probability [1 + cos(2kX + φ)]/2: the violet curve below.','One definite record. Its odds were set by where the atom actually was; the detector’s own configuration, not modeled here, settles which one fires.'],
  mw:['The whole quantum state evolves without collapse.','These correlated components are not yet separate classical detector records.','Both output components remain; there is no collapse.','Both nonzero-weight detector branches remain. The highlight follows one Born-weighted observer history.']
};
let width=900,height=702,previous=0;
const depthToSlider=d=>Math.round(1000*Math.log(d/DEPTH_MIN)/Math.log(DEPTH_MAX/DEPTH_MIN));
const sliderToDepth=v=>DEPTH_MIN*Math.pow(DEPTH_MAX/DEPTH_MIN,v/1000);
const fmtDepth=d=>d<0.1?d.toFixed(3):d<1?d.toFixed(2):d<10?d.toFixed(2):d.toFixed(1);
function stop(){state.running=false;controls.setAttribute('running','false');}
function setScan(scan){state.scan=scan;$('#scan').checked=scan;if(scan)stop();}
function newPacket(){const {r}=derived();state.progress=.04;state.hold=0;state.event=null;state.follow=null;state.pending=sampleEvent(r,state.phase,state.nbar);}
function clear(){stop();setScan(false);state.n=state.plus=state.atomN=state.stored=0;state.bins.fill(0);newPacket();update();}
function start(repeat=true){setScan(false);if(state.progress>=1)newPacket();state.repeat=repeat;state.running=true;controls.setAttribute('running','true');update();}
function record(e){
  const {dp,dxNm}=derived();state.n++;if(e.port===1)state.plus++;
  if(state.stored<MAX_STORED){state.xs[state.stored]=e.x*dxNm;state.ports[state.stored]=e.port;state.stored++;}
  if(state.read){state.atomN++;const q=e.u*dp,i=Math.floor((q+6)/12*40);if(i>=0&&i<40)state.bins[i]++;}
}
function detect(){const {r}=derived();const e=state.pending||sampleEvent(r,state.phase,state.nbar);state.pending=null;e.readout=state.read;record(e);state.event=e;state.follow=e.port;}
function stepTo(index){stop();setScan(false);state.hold=0;if(index<3){if(state.progress>=1||!state.pending)newPacket();state.progress=[.04,.4,.78][index];state.event=null;state.follow=null;}else{state.progress=1;if(!state.event)detect();}update();}
function update(){
  const step=stageOf(state.progress),{dp,r,eta:et,dxNm}=derived(),V=visibility(r,state.nbar),P=portProbability(r,state.phase,state.nbar);
  $('#depthOut').textContent=`${fmtDepth(state.depth)} mK`;$('#dpOut').textContent=`${dp.toFixed(2)} ħk`;
  $('#nbarOut').textContent=state.nbar.toFixed(2);$('#phaseOut').textContent=`${Math.round(state.phase*180/Math.PI)}°`;
  const inRange=state.depth>=PAPER.depthMin-1e-9&&state.depth<=PAPER.depthMax+1e-9;
  $('#rangeNote').textContent=inRange?'Inside the range measured in the experiment.':'Outside the measured range 0.60–10.49 mK: an extrapolation of the same model.';
  $('#rangeNote').classList.toggle('warn',!inRange);
  $('#spread').textContent=`${dp.toFixed(2)} ħk`;$('#dx').textContent=`${(dxNm*Math.sqrt(1+2*state.nbar)).toFixed(0)} nm`;$('#eta').textContent=et.toFixed(2);
  $('#visibility').textContent=`${(100*V).toFixed(1)}%`;$('#probability').textContent=`${(100*P).toFixed(1)}%`;
  $('#total').textContent=state.n.toLocaleString();$('#observed').textContent=state.n?`${(100*state.plus/state.n).toFixed(1)}%`:'—';
  $$('[data-depth]').forEach(b=>{const selected=Math.abs(+b.dataset.depth-state.depth)<1e-3*state.depth;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  $$('[data-step]').forEach(b=>{const selected=+b.dataset.step===step;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  $('#stageText').textContent=stageDescriptions[step];$('#viewName').textContent=viewNames[state.view];$('#viewText').textContent=viewDescriptions[state.view][step];
  $('#branchActions').hidden=state.view!=='mw'||step!==3;
  $$('[data-follow]').forEach(b=>{const port=+b.dataset.follow,p=port===1?P:1-P;b.disabled=p<1e-14;b.classList.toggle('selected',state.follow===port);b.setAttribute('aria-pressed',String(state.follow===port));});
  $('#summary').textContent=`${viewNames[state.view]}. ${stageDescriptions[step]} Trap depth ${fmtDepth(state.depth)} millikelvin, momentum spread ${dp.toFixed(2)} photon momenta, residual phonons ${state.nbar.toFixed(2)}. Visibility ${(100*V).toFixed(1)} percent. ${state.n} photon detections: ${state.plus} D plus, ${state.n-state.plus} D minus.${state.event?` Current sampled record D ${state.event.port===1?'plus':'minus'}.`:''} ${viewDescriptions[state.view][step]}`;
}
function setDepth(d){state.depth=Math.min(DEPTH_MAX,Math.max(DEPTH_MIN,d));$('#depth').value=depthToSlider(state.depth);clear();}
$('#depth').value=depthToSlider(state.depth);
$('#depth').oninput=e=>{const d=sliderToDepth(+e.target.value);const snap=[PAPER.depthMin,PAPER.depthMax].find(p=>Math.abs(Math.log(d/p))<0.01);state.depth=snap||d;clear();};
$$('[data-depth]').forEach(b=>b.onclick=()=>setDepth(+b.dataset.depth));
$('#nbar').oninput=e=>{state.nbar=+e.target.value;clear();};
$('#phase').oninput=e=>{setScan(false);state.phase=+e.target.value*Math.PI/180;clear();};
$('#scan').onchange=e=>{const checked=e.target.checked;if(checked){clear();state.progress=.78;}setScan(checked);update();};
$('#readout').onchange=e=>{state.read=e.target.checked;update();};
$('#waveQuantity').onchange=e=>{state.quantity=e.target.value;};
$('#stats').onchange=e=>{state.stats=e.target.checked;resize();};
$('#theory').onchange=e=>{state.theory=e.target.checked;};
$('#one').onclick=()=>{stop();newPacket();start(false);};
$('#thousand').onclick=()=>{stop();setScan(false);const {r}=derived();for(let i=0;i<1000;i++){const e=i===999&&state.pending?state.pending:sampleEvent(r,state.phase,state.nbar);e.readout=state.read;record(e);if(i===999){state.event=e;state.follow=e.port;}}state.pending=null;state.progress=1;update();};
$$('[data-step]').forEach(b=>b.onclick=()=>stepTo(+b.dataset.step));
$$('[data-follow]').forEach(b=>b.onclick=()=>{state.follow=+b.dataset.follow;update();});
controls.addEventListener('qontic:start',()=>start());controls.addEventListener('qontic:stop',stop);
controls.addEventListener('qontic:reset',()=>{setScan(false);clear();});
controls.addEventListener('qontic:speed',e=>{state.speed=e.detail.speed;});
controls.addEventListener('qontic:interpretation',e=>{state.view=e.detail.interpretation;update();});
controls.addEventListener('qontic:theme',e=>{const light=e.detail.theme==='light';document.body.dataset.theme=light?'light':'dark';Object.assign(C,light?{text:'#182c3e',muted:'#4c6376',grid:'#c8d7e1',a:'#007c70',b:'#9f5d00',purple:'#6c47ad',bg:'#eef4f7',panel:'#ffffff',bar:'#dae5eb',band:'#6c47ad2a'}:dark);});
controls.addEventListener('qontic:tab',e=>{$$('[data-control-pane]').forEach(p=>p.hidden=p.dataset.controlPane!==e.detail.tab);});
$$('[data-view]').forEach(b=>b.onclick=()=>{$$('[data-view]').forEach(x=>x.classList.toggle('active',x===b));$$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==b.dataset.view);if(b.dataset.view!=='sim'){stop();setScan(false);}else resize();});
$$('[data-answer]').forEach(b=>b.onclick=()=>{state.prediction=b.dataset.answer;$$('[data-answer]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#feedback').textContent=state.prediction==='down'?'Correct. A shallower trap gives the atom a smaller momentum spread, so the ±ħk kicks are easier to tell apart: the atom carries more path information. In position terms, the atom is spread over more of the 390 nm fringe period.':'Wrong. A shallower trap gives the atom a smaller momentum spread, so the ±ħk kicks are easier to tell apart and the fringes fade. Compare the two paper presets.';});
document.addEventListener('keydown',e=>{if(e.target.closest('input,button,select,textarea')||e.ctrlKey||e.metaKey||e.altKey||$('[data-panel="sim"]').hidden)return;if(e.code==='Space'){e.preventDefault();state.running?stop():start();}if(e.key.toLowerCase()==='r'){setScan(false);clear();}});
mountQonticMedia({stage:$('.visualization'),controls,getCanvases:()=>[canvas],filename:'einstein-recoiling-slit',beginRecording:()=>{const token={running:state.running,repeat:state.repeat,scan:state.scan};if(!state.running&&!state.scan)start(false);return token;},endRecording:token=>{stop();setScan(token.scan);if(token.running)start(token.repeat);}});
function layout(){const narrow=width<620;return {narrow,base:narrow?1004:702,stats:narrow?726:252};}
function resize(){const w=canvas.parentElement.clientWidth;if(w<1)return;width=w;const L=layout();height=L.base+(state.stats?L.stats:0);const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.height=`${height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
new ResizeObserver(resize).observe(canvas.parentElement);
function text(s,x,y,size=13,color=C.text,align='left'){ctx.font=`${size}px system-ui,sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);}
function fitText(s,x,y,maxWidth,size=12,color=C.muted){ctx.font=`${size}px system-ui,sans-serif`;if(ctx.measureText(s).width>maxWidth){while(s.length&&ctx.measureText(s+'…').width>maxWidth)s=s.slice(0,-1);s+='…';}text(s,x,y,size,color);}
function line(points,color=C.grid,w=1,dash=[]){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.setLineDash(dash);points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);}
function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();}
function panel(x,y,w,h,title,subtitle){ctx.fillStyle=C.panel;ctx.fillRect(x,y,w,h);fitText(title,x+14,y+25,w-28,14,C.text);if(subtitle)fitText(subtitle,x+14,y+44,w-28,11);}
function pathPoint(points,f){const segments=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));const total=segments.reduce((a,b)=>a+b,0);let d=f*total;for(let i=0;i<segments.length;i++){if(d<=segments[i]||i===segments.length-1){const a=points[i],b=points[i+1],q=d/segments[i];return {x:a[0]+(b[0]-a[0])*q,y:a[1]+(b[1]-a[1])*q,nx:-(b[1]-a[1])/segments[i],ny:(b[0]-a[0])/segments[i]};}d-=segments[i];}}
function opticalWave(points,s0,s1,color,phase=0,amplitude=1,envelope=false){
  if(stageOf(state.progress)===3)return;
  const pts=[],ptsOther=[],peak=1/Math.pow(2*Math.PI*.055**2,.25);
  for(let i=0;i<=150;i++){const f=i/150,s=s0+(s1-s0)*f,p=pathPoint(points,f),z=photonMode(s,state.progress,phase);const h=18*amplitude*(envelope?Math.sqrt(norm2(z)):z.re)/peak;pts.push([p.x+p.nx*h,p.y+p.ny*h]);ptsOther.push([p.x-p.nx*h,p.y-p.ny*h]);}
  line(pts,color,1.7);if(envelope)line(ptsOther,color,1.7);
}
function apparatus(){
  const w=width,{r}=derived();panel(12,12,w-24,224,'The light packet and its paired atom waves','Optical ripples: mode amplitudes, wavelength enlarged · outputs: probability envelopes');
  const source=[w*.07,130],atom=[w*.25,130],upper=[w*.45,87],lower=[w*.45,173],bs=[w*.7,130],plus=[w*.9,87],minus=[w*.9,173];
  const paths=[[source,atom],[atom,upper,bs],[atom,lower,bs],[bs,plus],[bs,minus]];
  paths.forEach(p=>line(p,C.grid,2));
  opticalWave(paths[0],0,.18,C.text);opticalWave(paths[1],.18,.65,C.a,0,1/Math.SQRT2);opticalWave(paths[2],.18,.65,C.b,state.phase,1/Math.SQRT2);
  const p=portProbability(r,state.phase,state.nbar);opticalWave(paths[3],.65,.91,C.purple,0,Math.sqrt(p),true);opticalWave(paths[4],.65,.91,C.muted,0,Math.sqrt(1-p),true);
  circle(...source,5,C.text);circle(...atom,10,C.a);ctx.fillStyle=C.purple;ctx.fillRect(bs[0]-5,bs[1]-12,10,24);
  text('Source',source[0],158,11,C.muted,'center');text('Atom in tweezer',atom[0],158,11,C.a,'center');text('A ↔ −ħk',upper[0],72,11,C.a,'center');text('B ↔ +ħk',lower[0],197,11,C.b,'center');text('φ',w*.56,186,13,C.b,'center');
  fitText('Beam splitter',bs[0]-40,158,100,10);text('D₊',plus[0]+12,91,12,C.purple);text('D₋',minus[0]+12,177,12,C.muted);
  for(const [port,pos] of [[1,plus],[-1,minus]]){const active=stageOf(state.progress)===3&&(state.view==='mw'?((port===1?p:1-p)>1e-14):state.event?.port===port);circle(...pos,active?9:6,active?C.a:(port===1?C.purple:C.muted));}
  text(state.read?'Later recoil readout: on':'Later recoil readout: off',w-26,220,11,state.read?C.a:C.muted,'right');
}
// Momentum axis q = p/ħk. In these units the recoil waves sit at q = ∓1 with width Δp/ħk.
const Q=6;
function amplitudeScale(){const {dp}=derived();const A=Math.pow(2*Math.PI,-.25)/Math.sqrt(dp);return state.quantity==='density'?1.2*A*A:1.15*A;}
function nice(v){const e=Math.pow(10,Math.floor(Math.log10(v))),f=v/e;return (f<1.5?1:f<3.5?2:f<7.5?5:10)*e/2;}
function graphFrame(x,y,w,h,title,subtitle){panel(x,y,w,h,title,subtitle);const left=x+43,right=x+w-17,top=y+66,bottom=y+h-35;const density=state.quantity==='density',S=amplitudeScale(),max=S,min=density?0:-S;const py=v=>bottom-(Math.max(min,Math.min(max,v))-min)/(max-min)*(bottom-top),px=q=>left+(q+Q)/(2*Q)*(right-left);const t=nice(S);for(const v of density?[0,t,2*t]:[-t,0,t]){if(v>max)continue;line([[left,py(v)],[right,py(v)]]);text(v.toFixed(t<.1?2:1),left-7,py(v)+4,10,C.muted,'right');}line([[left,top],[left,bottom],[right,bottom]],C.muted);for(const q of [-6,-4,-2,0,2,4,6])text(String(q),px(q),bottom+15,10,C.muted,'center');text('Atom momentum p / ħk',x+w/2,y+h-5,11,C.muted,'center');text(density?'|wave|²':state.quantity==='re'?'Re(wave)':'Im(wave)',left,top-8,10,C.muted);return {left,right,top,bottom,py,px};}
function inQ(fn){const {dp}=derived(),s=1/Math.sqrt(dp);return q=>{const z=fn(q/dp);return z?{re:z.re*s,im:z.im*s}:null;};}
function graphWave(fn,g,color,dash=[]){const pts=[];for(let i=0;i<=320;i++){const q=-Q+i/320*2*Q,z=fn(q);if(!z)continue;const v=state.quantity==='density'?norm2(z):z[state.quantity];pts.push([g.px(q),g.py(v)]);}line(pts,color,2,dash);}
function recoilPlot(x,y,w,h){const {r,dp}=derived(),scattered=stageOf(state.progress)>0;const g=graphFrame(x,y,w,h,stageOf(state.progress)===3?'Recoil waves: before detection':scattered?'Atom waves paired with A and B':'Initial atom wave',scattered?`kicked by −ħk (teal) and +ħk (gold) · width Δp = ${dp.toFixed(2)} ħk`:`Ground state in the tweezer · width Δp = ${dp.toFixed(2)} ħk`);
  if(scattered&&state.read&&state.atomN&&state.quantity==='density'){ctx.fillStyle='#95a6b566';const bw=(g.right-g.left)/40;state.bins.forEach((n,i)=>{const v=n/state.atomN/(2*Q/40),top=Math.max(g.top,g.py(v));ctx.fillRect(g.left+i*bw,top,bw-1,g.bottom-top);});}
  graphWave(inQ(u=>atomWave(u,scattered?r:0,-1)),g,scattered?C.a:C.muted);if(scattered)graphWave(inQ(u=>atomWave(u,r,1)),g,C.b);
  if(state.read&&state.event?.readout&&(state.view!=='mw'||state.follow===state.event.port)){const q=state.event.u*dp;if(Math.abs(q)<=Q){const xx=g.px(q);line([[xx,g.top],[xx,g.bottom]],C.muted,1,[3,4]);}}
  if(state.nbar>0)fitText('Pure ground-state waves shown; heating mixes displaced copies.',g.left+6,g.top+12,g.right-g.left-12,10);
}
function outputPlot(x,y,w,h){const {r}=derived(),stage=stageOf(state.progress),collapsed=stage===3&&state.view==='cpn'&&state.event;
  const subtitle=collapsed?`Recorded D${state.event.port===1?'₊':'₋'} · conditional atom wave, norm 1`:'χ₊: violet · χ₋: gray · squared norms = P(D±)';
  const g=graphFrame(x,y,w,h,stage===3?'Waves paired with detector records':'Joint output waves',stage<2?'Follow the packet to the beam splitter':subtitle);
  if(stage<2){fitText('Recombination comes next.',g.left+8,(g.top+g.bottom)/2,w-80,12);return;}
  for(const port of displayedPorts(state.view,stage===3?state.event?.port??null:null))graphWave(inQ(u=>collapsed?branchWave(u,r,state.phase,port):outputWaves(u,r,state.phase)[port===1?0:1]),g,port===1?C.purple:C.muted);
}
function recordBox(cx,cy,cw,ch,port,label,selected){ctx.fillStyle=C.bg;ctx.fillRect(cx,cy,cw,ch);ctx.strokeStyle=selected?C.a:C.grid;ctx.lineWidth=selected?2:1;ctx.strokeRect(cx,cy,cw,ch);text(`D${port===1?'₊':'₋'}`,cx+10,cy+19,13,port===1?C.purple:C.muted);fitText(label,cx+40,cy+19,cw-48,11,selected?C.a:C.muted);}
function records(x,y,w,h){if(state.view==='pw')return pilotRecords(x,y,w,h);
  const {r,dp}=derived(),stage=stageOf(state.progress),p=portProbability(r,state.phase,state.nbar),title=stage<3?'Detector records: not formed yet':state.view==='cpn'?'One recorded outcome · collapse':'Two detector-record branches · no collapse';
  panel(x,y,w,h,title,stage<3?'Click Detect or run One photon.':state.view==='mw'?'Curves: conditional atom momentum density · highlight follows one history.':'Curve: normalized conditional atom momentum density after collapse.');
  const gap=10,cw=(w-38)/2,cy=y+58,ch=h-69,dmax=1.6*Math.pow(2*Math.PI,-.5)/dp;
  for(const [i,port] of [[0,1],[1,-1]]){const weight=port===1?p:1-p,cx=x+14+i*(cw+gap),selected=state.follow===port&&stage===3,removed=stage===3&&state.view==='cpn'&&state.event?.port!==port;
    recordBox(cx,cy,cw,ch,port,stage<3?'Awaiting record':weight<1e-14?'Zero weight':removed?'Removed by collapse':state.view==='mw'?`Weight ${(weight*100).toFixed(1)}%`:selected?'Recorded':'Other wave component',selected);
    if(stage===3&&!removed&&weight>=1e-14){const pts=[],f=inQ(u=>branchWave(u,r,state.phase,port));for(let j=0;j<=140;j++){const q=-Q+j/140*2*Q,z=f(q);pts.push([cx+8+j/140*(cw-16),cy+ch-8-Math.min(1,(z?norm2(z):0)/dmax)*(ch-36)]);}line(pts,port===1?C.purple:C.muted,1.5);}
  }
}
// Pilot wave: the atom's actual position X, its thermal |ψ|² density, P(D₊|X), and collected positions by detector.
function pilotRecords(x,y,w,h){
  const {r,dxNm}=derived(),stage=stageOf(state.progress),sx=dxNm*Math.sqrt(1+2*state.nbar),R=Math.max(250,Math.ceil(4*sx/50)*50);
  panel(x,y,w,h,stage<3?'The atom’s actual position in the trap':'One definite record · guiding wave retained',`|ψ(x)|²: gray · P(D₊ | x): violet, period λ/2 = ${(LAMBDA_NM/2).toFixed(0)} nm · bars: collected atom positions, D₊ violet, D₋ gray`);
  const narrow=width<620,pw=narrow?w-28:w*.66,left=x+40,right=x+pw,top=y+66,bottom=y+h-(narrow?96:34),ph=bottom-top;
  const px=v=>left+(v+R)/(2*R)*(right-left);
  const dens=v=>thermalPosition(v/dxNm,state.nbar)/dxNm,dpeak=dens(0),S=.62*ph/dpeak;
  line([[left,top],[left,bottom],[right,bottom]],C.muted);
  for(const v of [0,.5,1]){const yy=bottom-v*ph;line([[left,yy],[right,yy]]);text(v.toFixed(1),left-6,yy+4,10,C.muted,'right');}
  const step=R>=500||narrow?200:100;for(let v=-Math.floor(R/step)*step;v<=R;v+=step)text(String(v),px(v),bottom+14,10,C.muted,'center');text('Atom position x (nm)',(left+right)/2,bottom+28,11,C.muted,'center');
  if(state.stored){const nb=48,bw=2*R/nb,hp=new Array(nb).fill(0),hm=new Array(nb).fill(0);for(let i=0;i<state.stored;i++){const k=Math.floor((state.xs[i]+R)/bw);if(k>=0&&k<nb)(state.ports[i]===1?hp:hm)[k]++;}
    const norm=S/(state.stored*bw),pxw=(right-left)/nb;for(let k=0;k<nb;k++){const xx=left+k*pxw,a=hp[k]*norm,b=hm[k]*norm;ctx.fillStyle=C.purple+'99';ctx.fillRect(xx,bottom-a,pxw-1,a);ctx.fillStyle=C.muted+'aa';ctx.fillRect(xx,bottom-a-b,pxw-1,b);}}
  const dpts=[],ppts=[];for(let i=0;i<=300;i++){const v=-R+i/300*2*R;dpts.push([px(v),bottom-dens(v)*S]);ppts.push([px(v),bottom-positionPortProbability(v/dxNm,r,state.phase)*ph]);}
  line(dpts,C.muted,2);if(stage>=2)line(ppts,C.purple,2);
  const e=state.event||state.pending;
  if(e){const X=e.x*dxNm;if(Math.abs(X)<=R){const xx=px(X);line([[xx,top],[xx,bottom]],C.a,1.5,[4,3]);circle(xx,bottom-dens(X)*S,6,C.a);fitText(`X = ${X.toFixed(0)} nm`,Math.min(xx+8,right-80),top+12,80,11,C.a);}}
  const P=e?positionPortProbability(e.x,r,state.phase):null;
  const bx=narrow?x+14:right+22,by=narrow?bottom+40:top-4,bw2=narrow?(w-38)/2:x+w-14-bx,bh=narrow?44:(bottom-top)/2-4;
  for(const [i,port] of [[0,1],[1,-1]]){const cx=narrow?bx+i*(bw2+10):bx,cy=narrow?by:by+i*(bh+8),selected=stage===3&&state.event?.port===port;
    recordBox(cx,cy,bw2,bh,port,stage<2?'Awaiting record':stage===2?`P(D${port===1?'₊':'₋'} | X) = ${(100*(port===1?P:1-P)).toFixed(0)}%`:selected?'Recorded':'Empty wave component',selected);}
}
function fringePlot(x,y,w,h){const {r}=derived();panel(x,y,w,h,'Photon interference','Change phase to reveal the fringe');const left=x+43,right=x+w-17,top=y+63,bottom=y+h-35,pw=right-left,ph=bottom-top;for(const p of [0,.5,1]){const yy=bottom-p*ph;line([[left,yy],[right,yy]]);text(p.toFixed(1),left-7,yy+4,10,C.muted,'right');}if(state.theory){const pts=[];for(let i=0;i<=240;i++)pts.push([left+i/240*pw,bottom-portProbability(r,i/240*2*Math.PI,state.nbar)*ph]);line(pts,C.purple,2.5);}const current=left+state.phase/(2*Math.PI)*pw;line([[current,top],[current,bottom]],C.a,1,[4,4]);if(state.theory)circle(current,bottom-portProbability(r,state.phase,state.nbar)*ph,4,C.a);if(state.n)circle(current,bottom-state.plus/state.n*ph,4,C.text);line([[left,top],[left,bottom],[right,bottom]],C.muted);for(const deg of [0,90,180,270,360])text(`${deg}°`,left+deg/360*pw,bottom+15,10,C.muted,'center');text('Path phase φ',x+w/2,y+h-5,11,C.muted,'center');text('P(D₊)',left,top-5,10,C.muted);}
function visibilityPlot(x,y,w,h){panel(x,y,w,h,'Visibility and trap depth','Line: ground state · band: measured n̄ · shaded: measured depths');
  const left=x+43,right=x+w-17,top=y+63,bottom=y+h-35,ph=bottom-top,lx=d=>left+Math.log(d/DEPTH_MIN)/Math.log(DEPTH_MAX/DEPTH_MIN)*(right-left),vy=v=>bottom-v*ph;
  ctx.fillStyle=C.bar;ctx.fillRect(lx(PAPER.depthMin),top,lx(PAPER.depthMax)-lx(PAPER.depthMin),ph);
  for(const v of [0,.5,1]){line([[left,vy(v)],[right,vy(v)]]);text(v.toFixed(1),left-7,vy(v)+4,10,C.muted,'right');}
  const curve=nb=>{const pts=[];for(let i=0;i<=200;i++){const d=DEPTH_MIN*Math.pow(DEPTH_MAX/DEPTH_MIN,i/200);pts.push([lx(d),vy(visibility(recoilRatio(momentumSpread(d)),nb))]);}return pts;};
  if(state.theory){const hi=curve(PAPER.nbarMin),lo=curve(PAPER.nbarMax);ctx.beginPath();hi.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));lo.reverse().forEach(([a,b])=>ctx.lineTo(a,b));ctx.closePath();ctx.fillStyle=C.band;ctx.fill();line(curve(0),C.purple,2);if(state.nbar>0)line(curve(state.nbar),C.a,1.5,[5,4]);}
  const pxp=lx(PAPER_POINT.depth);line([[pxp,vy(PAPER_POINT.visibility-PAPER_POINT.error)],[pxp,vy(PAPER_POINT.visibility+PAPER_POINT.error)]],C.text,1.5);ctx.fillStyle=C.text;ctx.fillRect(pxp-3.5,vy(PAPER_POINT.visibility)-3.5,7,7);fitText('84(4)% measured',pxp-92,vy(PAPER_POINT.visibility)-8,90,10,C.text);
  circle(lx(state.depth),vy(visibility(recoilRatio(momentumSpread(state.depth)),state.nbar)),5,C.a);
  line([[left,top],[left,bottom],[right,bottom]],C.muted);for(const d of [0.02,0.1,1,10])text(String(d),lx(d),bottom+15,10,C.muted,'center');text('Trap depth (mK, log scale)',x+w/2,y+h-5,11,C.muted,'center');text('V',left,top-5,10,C.muted);}
function counts(x,y,w,h){const {r}=derived();panel(x,y,w,h,'Photon detections',`${state.n.toLocaleString()} samples of an observer history`);const left=x+45,right=x+w-55,bw=right-left;for(let k=0;k<2;k++){const yy=y+75+k*45,p=k===0?portProbability(r,state.phase,state.nbar):1-portProbability(r,state.phase,state.nbar),n=k===0?state.plus:state.n-state.plus;ctx.fillStyle=C.bar;ctx.fillRect(left,yy,bw,20);if(state.n){ctx.fillStyle=k===0?C.purple:C.muted;ctx.fillRect(left,yy,bw*n/state.n,20);}if(state.theory){const xx=left+bw*p;line([[xx,yy-3],[xx,yy+23]],C.a,2);}text(k===0?'D₊':'D₋',left-29,yy+14,12);text(n.toLocaleString(),right+8,yy+14,12);}fitText('Bars: sample · green marks: prediction',x+14,y+h-15,w-28,11);}
function draw(){ctx.fillStyle=C.bg;ctx.fillRect(0,0,width,height);apparatus();const L=layout(),half=(width-36)/2;if(L.narrow){recoilPlot(12,248,width-24,230);outputPlot(12,490,width-24,230);records(12,732,width-24,260);}else{recoilPlot(12,248,half,230);outputPlot(24+half,248,half,230);records(12,490,width-24,200);}
  if(state.stats){const y=L.base;if(L.narrow){fringePlot(12,y,width-24,230);visibilityPlot(12,y+242,width-24,230);counts(12,y+484,width-24,230);}else{const third=(width-48)/3;fringePlot(12,y,third,240);visibilityPlot(24+third,y,third,240);counts(36+2*third,y,third,240);}}}
function frame(t){const dt=Math.min(.05,(t-(previous||t))/1000);previous=t;if(state.scan){state.phase=(state.phase+dt*.8)%(2*Math.PI);$('#phase').value=state.phase*180/Math.PI;update();}if(state.running){if(state.progress<1){state.progress=Math.min(1,state.progress+dt*state.speed/6);if(stageOf(state.progress)===3&&!state.event)detect();if(state.progress===1&&!state.repeat)stop();}else{state.hold+=dt;if(state.hold>=1.5)newPacket();}update();}draw();requestAnimationFrame(frame);}
newPacket();update();resize();requestAnimationFrame(frame);
