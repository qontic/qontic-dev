import '../../../shared/qontic-controls.js?v=3.2';
import {mountQonticShell} from '../../../shared/qontic-shell.js?v=3.7';
import {mountQonticMedia} from '../../../shared/qontic-media.js?v=3.8';
import {visibility,portProbability,sampleEvent,momentumSpread,recoilRatio,eta,positionSpreadNm,positionPortProbability,thermalPosition,PAPER,PAPER_POINT,LAMBDA_NM} from './physics.mjs?v=1.2.0';
import {atomWave,outputWaves,branchWave,norm2,photonMode,stageOf,displayedPorts} from './waves.mjs?v=1.2.0';
import {APP_RELEASE} from './release.js?v=1.2.0';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
mountQonticShell({title:'Einstein’s Recoiling Slit',eyebrow:'Q-Ontic · Experiments',navigation:'breadcrumbs',badge:'Experiment · Zhang et al. 2025',purpose:'A single atom as Einstein’s movable slit: does its recoil erase the fringe?',version:`Recoiling slit · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,homeHref:'../../../index.html'});
$$('[data-view]').forEach(button=>button.setAttribute('aria-label',button.textContent.trim()));
const controls=$('qontic-controls'),mainCanvas=$('#main'),mctx=mainCanvas.getContext('2d');
let ctx=mctx;
controls.setAttribute('theme','dark');
const DEPTH_MIN=0.02,DEPTH_MAX=20,PHASES=12,PER_PHASE=400;
const state={depth:PAPER.depthMax,nbar:0,phase:0,view:'cpn',running:false,repeat:true,speed:1,read:false,theory:true,quantity:'density',measurements:[],event:null,pending:null,follow:null,progress:.04,hold:0,prediction:null};
const derived=()=>{const dp=momentumSpread(state.depth);return {dp,r:recoilRatio(dp),eta:eta(dp),dxNm:positionSpreadNm(dp)};};
const dark={text:'#e1eaf4',muted:'#a4b9cc',grid:'#294054',a:'#74d8ce',b:'#edbc77',purple:'#b7a6f5',minus:'#8fa3b8',bg:'#0c1928',panel:'#102032',bar:'#21364b',band:'#b7a6f533',fill:'#a4b9cc33'};
const light={text:'#182c3e',muted:'#4c6376',grid:'#c8d7e1',a:'#007c70',b:'#9f5d00',purple:'#6c47ad',minus:'#5d6f80',bg:'#eef4f7',panel:'#ffffff',bar:'#dae5eb',band:'#6c47ad2a',fill:'#4c637626'};
const C={...dark};
const viewNames={cpn:'Orthodox',pw:'Pilot Wave',mw:'Many Worlds'};
const stageDescriptions=[
  'Prepare: a light packet approaches the trapped atom. The atom is in its ground state: one momentum wave of width Δp.',
  'Scatter: the light goes up (A) and down (B), and the atom wave is kicked by −ħk and +ħk. Matching colors show the pairing.',
  'Recombine: the beam splitter adds (D₊) and subtracts (D₋) the paired amplitudes. Where the two atom waves overlap they can interfere.',
  'Detect: each detector is paired with its own atom wave. Switch views to compare the three accounts of this same event.'
];
const viewDescriptions={
  cpn:['The state evolves before measurement.','Photon and atom are entangled: the path is correlated with the atom’s kick.','Both outputs are present before measurement.','One outcome is recorded; the state collapses to its normalized atom wave. Bohr: the recoil record and the fringe exclude each other.'],
  pw:['The atom has a definite position X in the trap, distributed as |ψ|². The wave guides it.','The kicks multiply the atom wave by e^∓ikx: its phase changes, the atom’s position does not.','For an atom at X the wave gives D₊ with probability [1 + cos(2kX + φ)]/2 (lower right panel).','One definite record; its odds were set by where the atom actually was. The light’s and detectors’ configurations, not modeled, settle which one fires.'],
  mw:['The whole quantum state evolves without collapse.','Photon and atom are entangled; these components are not yet separate worlds.','Both output components remain; there is no collapse.','Both detector branches remain, with weights P(D₊) and P(D₋). The highlight follows one branch.']
};
const depthToSlider=d=>Math.round(1000*Math.log(d/DEPTH_MIN)/Math.log(DEPTH_MAX/DEPTH_MIN));
const sliderToDepth=v=>DEPTH_MIN*Math.pow(DEPTH_MAX/DEPTH_MIN,v/1000);
const fmtDepth=d=>d<0.1?d.toFixed(3):d.toFixed(2);
const pct=v=>`${(100*v).toFixed(1)}%`;
const same=(m)=>m&&Math.abs(m.depth-state.depth)<1e-9&&Math.abs(m.nbar-state.nbar)<1e-9;
const current=()=>state.measurements.find(same);
function stop(){state.running=false;controls.setAttribute('running','false');}
function samplePending(){const {r}=derived();state.pending={...sampleEvent(r,state.phase,state.nbar),phase:state.phase,depth:state.depth,nbar:state.nbar};}
function newPacket(){state.progress=.04;state.hold=0;state.event=null;state.follow=null;samplePending();}
function pendingValid(){const p=state.pending;return p&&p.phase===state.phase&&p.depth===state.depth&&p.nbar===state.nbar;}
function start(repeat=true){if(state.progress>=1||!pendingValid())newPacket();state.repeat=repeat;state.running=true;controls.setAttribute('running','true');update();}
function detect(){if(!pendingValid())samplePending();const e=state.pending;state.pending=null;e.readout=state.read;state.event=e;state.follow=e.port;}
function stepTo(index){stop();state.hold=0;if(index<3){if(state.progress>=1||!pendingValid())newPacket();state.progress=[.04,.4,.78][index];state.event=null;state.follow=null;}else{state.progress=1;if(!state.event)detect();}update();drawAll();}
// Part 1: measure the fringe at 12 phases and fit V from (1 + V cos φ)/2.
function measure(){
  const {r,dxNm}=derived(),phases=[],plus=[],xs=[],ports=[];
  for(let k=0;k<PHASES;k++){const ph=k*2*Math.PI/PHASES;let n=0;const x=new Float32Array(PER_PHASE),p=new Int8Array(PER_PHASE);
    for(let i=0;i<PER_PHASE;i++){const e=sampleEvent(r,ph,state.nbar);if(e.port===1)n++;x[i]=e.x*dxNm;p[i]=e.port;}
    phases.push(ph);plus.push(n);xs.push(x);ports.push(p);}
  let num=0,den=0,varsum=0;phases.forEach((ph,k)=>{const f=plus[k]/PER_PHASE,c=Math.cos(ph);num+=(f-.5)*c;den+=c*c;varsum+=c*c*Math.max(f*(1-f),1/PER_PHASE)/PER_PHASE;});
  const m={depth:state.depth,nbar:state.nbar,phases,plus,xs,ports,V:2*num/den,sV:2*Math.sqrt(varsum)/den};
  state.measurements=[m,...state.measurements.filter(x=>!same(x))].slice(0,2);
  state.anim={m,t0:performance.now()};stop();
}
function update(){
  const step=stageOf(state.progress),{dp,r,eta:et,dxNm}=derived(),V=visibility(r,state.nbar),P=portProbability(r,state.phase,state.nbar),m=current(),w=Math.sqrt(1+2*state.nbar);
  $('#depthOut').textContent=`${fmtDepth(state.depth)} mK`;$('#depth').setAttribute('aria-valuetext',`${fmtDepth(state.depth)} millikelvin`);
  $('#nbarOut').textContent=state.nbar.toFixed(2);$('#phaseOut').textContent=`${Math.round(state.phase*180/Math.PI)}°`;
  const inRange=state.depth>=PAPER.depthMin-1e-9&&state.depth<=PAPER.depthMax+1e-9;
  $('#rangeNote').textContent=inRange?'Inside the range measured in the experiment.':'Outside the measured range: an extrapolation of the same model.';$('#rangeNote').classList.toggle('warn',!inRange);
  $('#spread').textContent=`${(dp*w).toFixed(2)} ħk`;$('#dx').textContent=`${(dxNm*w).toFixed(0)} nm`;$('#eta').textContent=et.toFixed(2);
  $('#visibility').textContent=pct(V);const measuring=state.anim&&state.anim.m===m;$('#measure').textContent=measuring?'Skip to the result':'Measure the fringe';$('#measured').textContent=measuring?'measuring…':m?`${(100*m.V).toFixed(1)} ± ${(100*m.sV).toFixed(1)}%`:'not yet measured';
  const other=state.measurements.find(x=>!same(x));
  $('#takeaway').textContent=measuring?`Measuring at ${fmtDepth(state.depth)} mK: watch the clicks pile up at D₊ and D₋ as φ changes, and the fringe build below.`:m?`${fmtDepth(state.depth)} mK: measured visibility ${(100*m.V).toFixed(0)} ± ${(100*m.sV).toFixed(0)}% (predicted ${(100*V).toFixed(0)}%).${other?` At ${fmtDepth(other.depth)} mK it was ${(100*other.V).toFixed(0)}%.`:' Now change the trap and measure again.'} The fringe is strong when the atom’s two recoil waves overlap (shaded area below).`:`Press Measure the fringe. At ${fmtDepth(state.depth)} mK the prediction is ${(100*V).toFixed(0)}% visibility.`;
  $$('[data-depth]').forEach(b=>{const selected=Math.abs(+b.dataset.depth-state.depth)<1e-3*state.depth;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  $$('[data-step]').forEach(b=>{const selected=+b.dataset.step===step;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  $('#stageText').textContent=stageDescriptions[step];$('#viewName').textContent=viewNames[state.view];$('#viewText').textContent=viewDescriptions[state.view][step];
  $('#branchActions').hidden=state.view!=='mw'||step!==3;
  $$('[data-follow]').forEach(b=>{const port=+b.dataset.follow,p=port===1?P:1-P;b.disabled=p<1e-14;b.classList.toggle('selected',state.follow===port);b.setAttribute('aria-pressed',String(state.follow===port));});
  const summary=`${viewNames[state.view]}. ${stageDescriptions[step]}${state.event?` Recorded D ${state.event.port===1?'plus':'minus'}.`:''}`;
  if($('#summary').textContent!==summary)$('#summary').textContent=summary;
}
function settingsChanged(){stop();newPacket();update();drawAll();}
function setDepth(d){state.depth=Math.min(DEPTH_MAX,Math.max(DEPTH_MIN,d));$('#depth').value=depthToSlider(state.depth);settingsChanged();}
$('#depth').value=depthToSlider(state.depth);
$('#depth').oninput=e=>{const d=sliderToDepth(+e.target.value);const snap=[PAPER.depthMin,PAPER.depthMax].find(p=>Math.abs(Math.log(d/p))<0.01);state.depth=snap||d;settingsChanged();};
$$('[data-depth]').forEach(b=>b.onclick=()=>setDepth(+b.dataset.depth));
$('#nbar').oninput=e=>{state.nbar=+e.target.value;settingsChanged();};
$('#phase').oninput=e=>{state.phase=+e.target.value*Math.PI/180;settingsChanged();};
$('#readout').onchange=e=>{state.read=e.target.checked;drawAll();};
$('#waveQuantity').onchange=e=>{state.quantity=e.target.value;drawAll();};
$('#theory').onchange=e=>{state.theory=e.target.checked;drawAll();};
$('#measure').onclick=()=>{if(state.anim){state.anim=null;}else measure();update();drawAll();};
$('#one').onclick=()=>{state.anim=null;stop();newPacket();start(false);};
$$('[data-step]').forEach(b=>b.onclick=()=>stepTo(+b.dataset.step));
$$('[data-follow]').forEach(b=>b.onclick=()=>{state.follow=+b.dataset.follow;update();drawAll();});
controls.addEventListener('qontic:start',()=>start());controls.addEventListener('qontic:stop',stop);
controls.addEventListener('qontic:reset',()=>{state.measurements=[];settingsChanged();});
controls.addEventListener('qontic:interpretation',e=>{state.view=e.detail.interpretation;update();drawAll();});
controls.addEventListener('qontic:theme',e=>{const isLight=e.detail.theme==='light';document.body.dataset.theme=isLight?'light':'dark';Object.assign(C,isLight?light:dark);drawAll();});
controls.addEventListener('qontic:tab',e=>{$$('[data-control-pane]').forEach(p=>p.hidden=p.dataset.controlPane!==e.detail.tab);});
$$('[data-view]').forEach(b=>b.onclick=()=>{$$('[data-view]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',String(x===b));});$$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==b.dataset.view);if(b.dataset.view!=='sim')stop();else resize();});
$$('[data-answer]').forEach(b=>b.onclick=()=>{state.prediction=b.dataset.answer;$$('[data-answer]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#feedback').textContent=state.prediction==='down'?'Right. A shallower trap leaves the atom’s momentum less spread, so the ±ħk kicks are easier to tell apart: the atom records the path, and the fringe fades. Measure both presets to see it.':'Not quite. A shallower trap leaves the atom’s momentum less spread, so the ±ħk kicks are easier to tell apart: the atom records the path, and the fringe fades. Measure both presets to see it.';});
document.addEventListener('keydown',e=>{if(e.target.closest('input,button,select,textarea')||e.ctrlKey||e.metaKey||e.altKey||$('[data-panel="sim"]').hidden)return;if(e.code==='Space'){e.preventDefault();state.running?stop():start();}});
mountQonticMedia({stage:$('.visualization'),controls,getCanvases:()=>[mainCanvas],filename:'einstein-recoiling-slit',beginRecording:()=>{const token={running:state.running,repeat:state.repeat};if(!state.running)start(false);return token;},endRecording:token=>{stop();if(token.running)start(token.repeat);}});
let width=900,mainH=1100,previous=0;
const narrow=()=>width<620;
function size(cv,h){const dpr=Math.min(devicePixelRatio||1,2);cv.width=Math.round(width*dpr);cv.height=Math.round(h*dpr);cv.style.height=`${h}px`;cv.getContext('2d').setTransform(dpr,0,0,dpr,0,0);}
function resize(){const w=mainCanvas.parentElement.clientWidth;if(w<1)return;width=w;mainH=narrow()?1870:1124;size(mainCanvas,mainH);drawAll();}
new ResizeObserver(resize).observe(mainCanvas.parentElement);
const FONT='system-ui,"Segoe UI","DejaVu Sans",sans-serif';
function text(s,x,y,size=13,color=C.text,align='left'){ctx.font=`${size}px ${FONT}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);}
function fitText(s,x,y,maxWidth,size=12,color=C.muted){ctx.font=`${size}px ${FONT}`;if(ctx.measureText(s).width>maxWidth){while(s.length&&ctx.measureText(s+'…').width>maxWidth)s=s.slice(0,-1);s+='…';}text(s,x,y,size,color);}
function line(points,color=C.grid,w=1,dash=[]){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.setLineDash(dash);points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);}
function circle(x,y,r,color,stroke=false){ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);if(stroke){ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.stroke();}else{ctx.fillStyle=color;ctx.fill();}}
function panel(x,y,w,h,title,subtitle){ctx.fillStyle=C.panel;ctx.fillRect(x,y,w,h);fitText(title,x+14,y+24,w-28,14,C.text);if(subtitle)fitText(subtitle,x+14,y+42,w-28,11);}
function clip(x,y,w,h,fn){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();fn();ctx.restore();}
function axes(left,right,top,bottom,yticks,ylabel,fmt=v=>v.toFixed(1)){const py=v=>bottom-v*(bottom-top);for(const v of yticks){line([[left,py(v)],[right,py(v)]]);text(fmt(v),left-7,py(v)+4,10,C.muted,'right');}line([[left,top],[left,bottom],[right,bottom]],C.muted);if(ylabel)text(ylabel,left,top-6,10,C.muted);return py;}
// ---------- Part 1 ----------
function fringePlot(x,y,w,h){const {r}=derived(),m=current(),other=state.measurements.find(q=>!same(q));
  panel(x,y,w,h,'The fringe: D₊ fraction against path phase','Line: prediction · dots: measured (open: previous depth)');
  const left=x+46,right=x+w-16,top=y+66,bottom=y+h-38,pw=right-left,py=axes(left,right,top,bottom,[0,.5,1],'D₊ fraction'),px=ph=>left+ph/(2*Math.PI)*pw;
  for(const deg of [0,90,180,270,360])text(`${deg}°`,px(deg*Math.PI/180),bottom+15,10,C.muted,'center');text('Path phase φ',x+w/2,y+h-6,11,C.muted,'center');
  const curve=(rr,nb)=>{const pts=[];for(let i=0;i<=240;i++){const ph=i/240*2*Math.PI;pts.push([px(ph),py(portProbability(rr,ph,nb))]);}return pts;};
  if(state.theory){if(other)line(curve(recoilRatio(momentumSpread(other.depth)),other.nbar),C.minus,1.5,[5,4]);line(curve(r,state.nbar),C.purple,2.5);}
  const dots=(mm,filled)=>{const rev=revealed(mm);mm.phases.forEach((ph,k)=>{const c=columnCounts(mm,k,rev);if(c.n<20)return;const f=c.plus/c.n,s=Math.sqrt(Math.max(f*(1-f),1/c.n)/c.n);line([[px(ph),py(f-s)],[px(ph),py(f+s)]],filled?C.text:C.minus,1.2);circle(px(ph),py(f),4,filled?C.text:C.minus,!filled);});};
  if(other)dots(other,false);if(m)dots(m,true);
  line([[px(state.phase),top],[px(state.phase),bottom]],C.a,1,[3,4]);
  if(m)fitText(state.anim&&state.anim.m===m?`${fmtDepth(m.depth)} mK: measuring…`:`${fmtDepth(m.depth)} mK: V = ${(100*m.V).toFixed(0)} ± ${(100*m.sV).toFixed(0)}%`,left+8,top+14,pw-16,11,C.text);
  if(other)fitText(`${fmtDepth(other.depth)} mK: V = ${(100*other.V).toFixed(0)} ± ${(100*other.sV).toFixed(0)}%`,left+8,top+30,pw-16,11,C.minus);
  if(!m&&!other)fitText('Press “Measure the fringe”.',left+8,top+14,pw-16,12,C.muted);
}
function visibilityPlot(x,y,w,h){panel(x,y,w,h,'Visibility against trap depth','Band: measured heating · gray: the paper’s depths');
  const left=x+46,right=x+w-16,top=y+66,bottom=y+h-38,lx=d=>left+Math.log(d/DEPTH_MIN)/Math.log(DEPTH_MAX/DEPTH_MIN)*(right-left);
  ctx.fillStyle=C.bar;ctx.fillRect(lx(PAPER.depthMin),top,lx(PAPER.depthMax)-lx(PAPER.depthMin),bottom-top);
  const vy=axes(left,right,top,bottom,[0,.5,1],'V');
  const curve=nb=>{const pts=[];for(let i=0;i<=200;i++){const d=DEPTH_MIN*Math.pow(DEPTH_MAX/DEPTH_MIN,i/200);pts.push([lx(d),vy(visibility(recoilRatio(momentumSpread(d)),nb))]);}return pts;};
  if(state.theory){const hi=curve(PAPER.nbarMin),lo=curve(PAPER.nbarMax);ctx.beginPath();hi.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));lo.reverse().forEach(([a,b])=>ctx.lineTo(a,b));ctx.closePath();ctx.fillStyle=C.band;ctx.fill();line(curve(0),C.purple,2);if(state.nbar>0)line(curve(state.nbar),C.a,1.5,[5,4]);
    circle(lx(state.depth),vy(visibility(recoilRatio(momentumSpread(state.depth)),state.nbar)),5,C.a);}
  const pxp=lx(PAPER_POINT.depth);line([[pxp,vy(PAPER_POINT.visibility-PAPER_POINT.error)],[pxp,vy(PAPER_POINT.visibility+PAPER_POINT.error)]],C.b,1.5);ctx.fillStyle=C.b;ctx.fillRect(pxp-4,vy(PAPER_POINT.visibility)-4,8,8);
  text('paper: 84(4)%',pxp-8,vy(PAPER_POINT.visibility-PAPER_POINT.error)+14,10,C.b,'right');
  for(const mm of state.measurements){if(state.anim&&state.anim.m===mm)continue;const xx=lx(mm.depth);line([[xx,vy(mm.V-mm.sV)],[xx,vy(mm.V+mm.sV)]],C.text,1.2);circle(xx,vy(mm.V),4,C.text,!same(mm));}
  for(const d of [0.02,0.1,1,10])text(String(d),lx(d),bottom+15,10,C.muted,'center');text('Trap depth (mK, log scale)',x+w/2,y+h-6,11,C.muted,'center');
}
function overlapPlot(x,y,w,h){const {dp,r}=derived(),V=visibility(r);
  panel(x,y,w,h,'Why: the atom’s two recoil waves overlap',`Momentum after a kick of −ħk (teal, solid) or +ħk (gold, dashed). Shaded area = V = ${pct(V)}`);
  const left=x+46,right=x+w-16,top=y+66,bottom=y+h-38,Q=6,px=q=>left+(q+Q)/(2*Q)*(right-left),g=q=>Math.exp(-q*q/(2*dp*dp))/(dp*Math.sqrt(2*Math.PI)),peak=1/(Math.min(dp,0.42)*Math.sqrt(2*Math.PI))*1.08,py=v=>bottom-v/peak*(bottom-top);
  line([[left,top],[left,bottom],[right,bottom]],C.muted);for(const q of [-6,-4,-2,0,2,4,6])text(String(q),px(q),bottom+15,10,C.muted,'center');text('Atom momentum p / ħk',x+w/2,y+h-6,11,C.muted,'center');text('probability density',left,top-6,10,C.muted);
  const A=[],B=[],O=[];for(let i=0;i<=320;i++){const q=-Q+i/320*2*Q,a=g(q+1),b=g(q-1);A.push([px(q),py(a)]);B.push([px(q),py(b)]);O.push([px(q),py(Math.sqrt(a*b))]);}
  clip(left,top-4,right-left,bottom-top+4,()=>{ctx.beginPath();ctx.moveTo(px(-Q),bottom);O.forEach(([a,b])=>ctx.lineTo(a,b));ctx.lineTo(px(Q),bottom);ctx.closePath();ctx.fillStyle=C.band;ctx.fill();line(A,C.a,2);line(B,C.b,2,[6,4]);});
  text('−ħk',px(-1),Math.max(top+12,py(g(0))-6),11,C.a,'center');text('+ħk',px(1),Math.max(top+12,py(g(0))-6),11,C.b,'center');
  fitText(`Δp = ${dp.toFixed(2)} ħk`,right-90,top+12,88,11,C.muted);
  if(state.nbar>0)fitText('Pure ground-state waves; heating adds a mixture (see Physics).',left+6,bottom-8,right-left-12,10);
}
function stripePlot(x,y,w,h){const {r,dxNm}=derived(),sx=dxNm*Math.sqrt(1+2*state.nbar),R=Math.max(250,Math.ceil(4*sx/50)*50),view=state.view;
  const sub={cpn:'Orthodox: the curve gives the joint odds of a D₊ click and a later atom-position reading.',pw:'Pilot Wave: the atom is at a definite X; P(D₊ | X) sets the odds. Bars: actual positions behind D₊ (violet) and D₋ (gray).',mw:'Many Worlds: at each position both branches exist, with weights P(D₊ | x) and P(D₋ | x).'}[view];
  panel(x,y,w,h,`Why, in position: the atom’s spread (${sx.toFixed(0)} nm) against the ${(LAMBDA_NM/2).toFixed(0)} nm stripes`,sub);
  const left=x+46,right=x+w-16,top=y+66,bottom=y+h-38,ph=bottom-top,px=v=>left+(v+R)/(2*R)*(right-left);
  const dens=v=>thermalPosition(v/dxNm,state.nbar)/dxNm,S=.62*ph/dens(0);
  const py=axes(left,right,top,bottom,[0,.5,1],'P(D₊ | x)');
  const step=R>=500||narrow()?200:100;for(let v=-Math.floor(R/step)*step;v<=R;v+=step)text(String(v),px(v),bottom+15,10,C.muted,'center');fitText(`Atom position x (nm) · gray: |ψ(x)|², scaled · violet: P(D₊ | x) at φ = ${Math.round(state.phase*180/Math.PI)}°${view==='pw'&&!current()?' · measure to see positions':''}`,left,y+h-6,right-left,10.5);
  const m=current(),k=Math.round(state.phase/(2*Math.PI)*PHASES)%PHASES;
  clip(left,top,right-left,ph,()=>{
    const D=[];for(let i=0;i<=300;i++){const v=-R+i/300*2*R;D.push([px(v),bottom-dens(v)*S]);}
    ctx.beginPath();ctx.moveTo(px(-R),bottom);D.forEach(([a,b])=>ctx.lineTo(a,b));ctx.lineTo(px(R),bottom);ctx.closePath();ctx.fillStyle=C.fill;ctx.fill();
    if(view==='pw'&&m){const nb=48,bw=2*R/nb,hp=new Array(nb).fill(0),hm=new Array(nb).fill(0),xs=m.xs[k],ps=m.ports[k];for(let i=0;i<xs.length;i++){const j=Math.floor((xs[i]+R)/bw);if(j>=0&&j<nb)(ps[i]===1?hp:hm)[j]++;}
      const norm=S/(xs.length*bw),pxw=(right-left)/nb;for(let j=0;j<nb;j++){const xx=left+j*pxw,a=hp[j]*norm,b=hm[j]*norm;ctx.fillStyle=C.purple+'b0';ctx.fillRect(xx,bottom-a,pxw-1,a);ctx.fillStyle=C.minus+'90';ctx.fillRect(xx,bottom-a-b,pxw-1,b);}}
    const P=[];for(let i=0;i<=300;i++){const v=-R+i/300*2*R;P.push([px(v),py(positionPortProbability(v/dxNm,r,state.phase))]);}line(P,C.purple,2);
    const e=view==='pw'?(state.event||state.pending):null;if(e&&Math.abs(e.x*dxNm)<=R){const X=e.x*dxNm,xx=px(X);line([[xx,top],[xx,bottom]],C.a,1.5,[4,3]);circle(xx,bottom-dens(X)*S,5,C.a);fitText(`X = ${X.toFixed(0)} nm`,Math.min(xx+7,right-74),top+12,72,11,C.a);}
  });
}
function drawMain(){ctx=mctx;ctx.fillStyle=C.bg;ctx.fillRect(0,0,width,mainH);const half=(width-36)/2,W=width-24;
  if(narrow()){apparatus(12,12,W,330);fringePlot(12,354,W,250);visibilityPlot(12,616,W,250);wavePanel(12,878,W,230);recordsPanel(12,1120,W,200);overlapPlot(12,1332,W,240);stripePlot(12,1584,W,270);}
  else{apparatus(12,12,W,330);fringePlot(12,354,half,250);visibilityPlot(24+half,354,half,250);wavePanel(12,616,half,230);recordsPanel(24+half,616,half,230);overlapPlot(12,858,half,250);stripePlot(24+half,858,half,250);}}
// ---------- Part 2 ----------
function pathPoint(points,f){const segments=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));const total=segments.reduce((a,b)=>a+b,0);let d=f*total;for(let i=0;i<segments.length;i++){if(d<=segments[i]||i===segments.length-1){const a=points[i],b=points[i+1],q=d/segments[i];return {x:a[0]+(b[0]-a[0])*q,y:a[1]+(b[1]-a[1])*q,nx:-(b[1]-a[1])/segments[i],ny:(b[0]-a[0])/segments[i]};}d-=segments[i];}}
function opticalWave(points,s0,s1,color,phase=0,amplitude=1,envelope=false){if(stageOf(state.progress)===3)return;const pts=[],ptsOther=[],peak=1/Math.pow(2*Math.PI*.055**2,.25);for(let i=0;i<=150;i++){const f=i/150,s=s0+(s1-s0)*f,p=pathPoint(points,f),z=photonMode(s,state.progress,phase);const hh=18*amplitude*(envelope?Math.sqrt(norm2(z)):z.re)/peak;pts.push([p.x+p.nx*hh,p.y+p.ny*hh]);ptsOther.push([p.x-p.nx*hh,p.y-p.ny*hh]);}line(pts,color,1.7);if(envelope)line(ptsOther,color,1.7);}
const N_TOTAL=PHASES*PER_PHASE,ANIM_MS=7000;
function revealed(m){if(!state.anim||state.anim.m!==m)return N_TOTAL;return Math.min(N_TOTAL,Math.floor((performance.now()-state.anim.t0)/ANIM_MS*N_TOTAL));}
function columnCounts(m,k,rev){const done=Math.max(0,Math.min(PER_PHASE,rev-k*PER_PHASE));let plus=0;const p=m.ports[k];for(let i=0;i<done;i++)if(p[i]===1)plus++;return {n:done,plus};}
function apparatus(x0,y0,W,H){const {r,dxNm,dp}=derived(),m=current(),anim=state.anim&&state.anim.m===m?state.anim:null,rev=m?revealed(m):0,nw=narrow();
  panel(x0,y0,W,H,'The experiment: a single atom as Einstein’s movable slit',anim?'Measuring: the phase φ steps through 12 values; every photon ends in D₊ or D₋':'Light ripples drawn with an enlarged wavelength · after the beam splitter: probability envelopes');
  const X=f=>x0+f*W,cy=y0+H*.46,dy=H*.2;
  const source=[X(.06),cy],atom=[X(.25),cy],upper=[X(.46),cy-dy],lower=[X(.46),cy+dy],bs=[X(.70),cy],dX=nw?.74:.86,plus=[X(dX),cy-dy],minus=[X(dX),cy+dy];
  const paths=[[source,atom],[atom,upper,bs],[atom,lower,bs],[bs,plus],[bs,minus]];
  paths.forEach(p=>line(p,C.grid,2.5));
  // tweezer beam: a vertical focused beam through the atom; narrower waist for a deeper trap
  const waist=6+10*Math.min(1,dxNm/120),tb=H*.22;ctx.fillStyle=C.b+'22';ctx.beginPath();ctx.moveTo(atom[0]-26,atom[1]-tb);ctx.lineTo(atom[0]+26,atom[1]-tb);ctx.lineTo(atom[0]+waist,atom[1]);ctx.lineTo(atom[0]+26,atom[1]+tb);ctx.lineTo(atom[0]-26,atom[1]+tb);ctx.lineTo(atom[0]-waist,atom[1]);ctx.closePath();ctx.fill();
  if(nw)fitText(`trap ${fmtDepth(state.depth)} mK`,atom[0]-30,cy+tb+30,100,11,C.b);else fitText(`tweezer trap ${fmtDepth(state.depth)} mK`,atom[0]+30,atom[1]-tb+10,150,11,C.b);
  // phase shifter on path B
  const ps=[X(nw?.56:.58),cy+dy*.5];ctx.fillStyle=C.bar;ctx.fillRect(ps[0]-8,ps[1]-14,16,28);ctx.strokeStyle=C.b;ctx.strokeRect(ps[0]-8,ps[1]-14,16,28);
  const phShow=anim?m.phases[Math.min(PHASES-1,Math.floor(rev/PER_PHASE))]:state.phase;text(`φ = ${Math.round(phShow*180/Math.PI)}°`,ps[0]+14,ps[1]+24,12,C.b);
  if(!anim){opticalWave(paths[0],0,.18,C.text);opticalWave(paths[1],.18,.65,C.a,0,1/Math.SQRT2);opticalWave(paths[2],.18,.65,C.b,state.phase,1/Math.SQRT2);
    const p=portProbability(r,state.phase,state.nbar);opticalWave(paths[3],.65,.91,C.purple,0,Math.sqrt(p),true);opticalWave(paths[4],.65,.91,C.minus,0,Math.sqrt(1-p),true);}
  else{// photon stream: every 16th photon drawn; a pulse on both arms, then one click
    const now=performance.now(),age=1100,step=16;for(let i=Math.max(0,Math.floor(rev-age/ANIM_MS*N_TOTAL))-((Math.max(0,Math.floor(rev-age/ANIM_MS*N_TOTAL)))%step);i<rev;i+=step){
      const t=(now-(state.anim.t0+i/N_TOTAL*ANIM_MS))/age;if(t<0||t>1)continue;const k=Math.floor(i/PER_PHASE),port=m.ports[k][i%PER_PHASE];
      if(t<.3){const q=pathPoint(paths[0],t/.3);circle(q.x,q.y,3,C.text);}
      else if(t<.75){const f=(t-.3)/.45;ctx.globalAlpha=.6;const a=pathPoint(paths[1],f),b=pathPoint(paths[2],f);circle(a.x,a.y,3,C.a);circle(b.x,b.y,3,C.b);ctx.globalAlpha=1;}
      else{const f=(t-.75)/.25,q=pathPoint(paths[port===1?3:4],f);circle(q.x,q.y,3,port===1?C.purple:C.minus);if(f>.85){const d=port===1?plus:minus;circle(d[0],d[1],9+12*(f-.85)/.15,port===1?C.purple:C.minus,true);}}}}
  circle(...source,6,C.text);ctx.fillStyle=C.purple;ctx.fillRect(bs[0]-5,bs[1]-14,10,28);
  // the atom: a blob whose size follows its position spread
  const g=ctx.createRadialGradient(atom[0],atom[1],0,atom[0],atom[1],8+14*Math.min(1,dxNm*Math.sqrt(1+2*state.nbar)/150));g.addColorStop(0,C.a);g.addColorStop(1,C.a+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(atom[0],atom[1],8+14*Math.min(1,dxNm*Math.sqrt(1+2*state.nbar)/150),0,2*Math.PI);ctx.fill();circle(...atom,4,C.a);
  text('Laser',source[0],cy+26,12,C.muted,'center');text('Atom',atom[0]-34,cy+tb+16,12,C.a,'left');
  fitText(nw?'A · −ħk':'Path A (up) · atom kicked −ħk',upper[0]-(nw?24:100),upper[1]-12,240,12,C.a);fitText(nw?'B · +ħk':'Path B (down) · atom kicked +ħk',lower[0]-(nw?24:100),lower[1]+22,240,12,C.b);
  const E=(s,x,y,al='center')=>{ctx.font=`italic 11px ${FONT}`;ctx.fillStyle=C.muted;ctx.textAlign=al;ctx.fillText(s,x,y);};
  if(!nw){E('Einstein: the movable slit',atom[0]-34,cy+tb+32,'left');E('Einstein: the two slits',upper[0],cy+4);E('Einstein: position on the screen',ps[0]+14,ps[1]+40,'left');E('Einstein: the screen',X(.86),cy+dy+40);}
  fitText('Beam splitter',bs[0]-38,bs[1]+32,100,11);
  // detectors with counters
  for(const [port,pos] of [[1,plus],[-1,minus]]){const col=port===1?C.purple:C.minus;ctx.fillStyle=col;ctx.fillRect(pos[0]-6,pos[1]-12,12,24);text(port===1?'D₊':'D₋',pos[0]-22,pos[1]+5,14,col,'right');
    const active=!anim&&stageOf(state.progress)===3&&(state.view==='mw'?true:state.event?.port===port);if(active)circle(pos[0],pos[1],16,C.text,true);
    if(m){const k=anim?Math.min(PHASES-1,Math.floor(rev/PER_PHASE)):Math.round(state.phase/(2*Math.PI)*PHASES)%PHASES,c=columnCounts(m,k,rev),n=port===1?c.plus:c.n-c.plus,bx=pos[0]+(nw?22:38),bw=Math.max(24,x0+W-bx-(nw?10:14));
      ctx.fillStyle=C.bar;ctx.fillRect(bx,pos[1]-8,bw,16);ctx.fillStyle=col;ctx.fillRect(bx,pos[1]-8,bw*n/PER_PHASE,16);fitText(`${n}`,bx+3,pos[1]+20,bw,11,C.text);}}
  if(m&&!nw)fitText(`clicks at φ = ${Math.round(phShow*180/Math.PI)}°`,X(.86)+38,cy+5,x0+W-X(.86)-50,11);
  // tweezer inset: atom's position density against the 390 nm stripes
  if(!nw){const ix=x0+14,iw=Math.min(190,W*.15),iy=y0+H-92,ih=74,R=400,px=v=>ix+(v+R)/(2*R)*iw,sx=dxNm*Math.sqrt(1+2*state.nbar);
    ctx.fillStyle=C.bg;ctx.fillRect(ix,iy,iw,ih);clip(ix,iy,iw,ih,()=>{for(let v=-R;v<R;v+=4){const pD=positionPortProbability(v/dxNm,r,phShow);ctx.fillStyle=C.purple;ctx.globalAlpha=.28*pD;ctx.fillRect(px(v),iy,iw/(2*R)*4+.5,ih);}ctx.globalAlpha=1;
      const pts=[];for(let i=0;i<=120;i++){const v=-R+i/120*2*R;pts.push([px(v),iy+ih-6-(ih-22)*Math.exp(-v*v/(2*sx*sx))]);}line(pts,C.a,2);});
    ctx.strokeStyle=C.grid;ctx.strokeRect(ix,iy,iw,ih);fitText(`spread ${sx.toFixed(0)} nm · stripes 390 nm`,ix+4,iy+12,iw-8,10,C.text);}
}
const Q=6;
function waveScale(){const {dp}=derived();const A=Math.pow(2*Math.PI,-.25)/Math.sqrt(dp);return state.quantity==='density'?1.25*A*A:1.15*A;}
function inQ(fn){const {dp}=derived(),s=1/Math.sqrt(dp);return q=>{const z=fn(q/dp);return z?{re:z.re*s,im:z.im*s}:null;};}
function wavePanel(x,y,w,h){const {r,dp}=derived(),stage=stageOf(state.progress),density=state.quantity==='density',S=waveScale(),min=density?0:-S;
  let title,subtitle,curves=[];
  if(stage===0){title='One photon · the atom’s momentum wave';subtitle=`Ground state in the trap, width Δp = ${dp.toFixed(2)} ħk`;curves=[[inQ(u=>atomWave(u,0,-1)),C.muted,[]]];}
  else if(stage===1){title='Atom waves paired with the two paths';subtitle='Path A: kicked by −ħk (teal, solid) · path B: +ħk (gold, dashed)';curves=[[inQ(u=>atomWave(u,r,-1)),C.a,[]],[inQ(u=>atomWave(u,r,1)),C.b,[6,4]]];}
  else if(stage===2||state.view!=='cpn'){title=stage===2?'Atom waves paired with the two detectors':'Atom waves paired with the detector records';subtitle=`D₊: violet, solid · D₋: gray, dashed · area under each = P(D±)${state.view==='mw'&&stage===3?' = branch weight':''}`;curves=[[inQ(u=>outputWaves(u,r,state.phase)[0]),C.purple,[],state.view==='pw'&&stage===3&&state.event?.port!==1],[inQ(u=>outputWaves(u,r,state.phase)[1]),C.minus,[6,4],state.view==='pw'&&stage===3&&state.event?.port!==-1]];}
  else{const port=state.event.port;title=`After collapse: the atom wave for D${port===1?'₊':'₋'}`;subtitle='Normalized to 1; the other component is removed';curves=[[inQ(u=>branchWave(u,r,state.phase,port)),port===1?C.purple:C.minus,port===1?[]:[6,4]]];}
  panel(x,y,w,h,title,subtitle);
  const left=x+46,right=x+w-16,top=y+66,bottom=y+h-38,px=q=>left+(q+Q)/(2*Q)*(right-left),py=v=>bottom-(Math.max(min,Math.min(S,v))-min)/(S-min)*(bottom-top);
  line([[left,top],[left,bottom],[right,bottom]],C.muted);if(!density)line([[left,py(0)],[right,py(0)]]);for(const q of [-6,-4,-2,0,2,4,6])text(String(q),px(q),bottom+15,10,C.muted,'center');text('Atom momentum p / ħk',x+w/2,y+h-6,11,C.muted,'center');text(density?'|wave|²':state.quantity==='re'?'Re(wave)':'Im(wave)',left,top-6,10,C.muted);
  for(const [fn,col,dash,faint] of curves){const pts=[];for(let i=0;i<=320;i++){const q=-Q+i/320*2*Q,z=fn(q);if(!z)continue;pts.push([px(q),py(density?norm2(z):z[state.quantity])]);}ctx.globalAlpha=faint?.45:1;line(pts,col,2,dash);ctx.globalAlpha=1;}
  if(state.read&&state.event?.readout&&stage===3&&(state.view!=='mw'||state.follow===state.event.port)){const q=state.event.u*dp;if(Math.abs(q)<=Q){const xx=px(q);line([[xx,top],[xx,bottom]],C.text,1,[3,4]);fitText(`momentum reading ${q.toFixed(2)} ħk`,Math.min(xx+6,right-150),top+12,148,11,C.text);}}
  if(state.view==='mw'&&stage===3&&state.event)fitText('A two-humped D₋ wave: the two kicks cancel near p = 0.',left+6,top+12,right-left-12,10);
}
function recordsPanel(x,y,w,h){const {r,dxNm}=derived(),stage=stageOf(state.progress),p=portProbability(r,state.phase,state.nbar),e=state.event||state.pending,PX=e?positionPortProbability(e.x,r,state.phase):null;
  const title=stage<3?'One photon · detector records: not formed yet':{cpn:'One recorded outcome',pw:'One definite record, both wave components kept',mw:'Two branches, no collapse'}[state.view];
  panel(x,y,w,h,title,stage<3?'Press 4 · Detect or Send one photon.':{cpn:'The unrecorded component is removed (collapse).',pw:`Atom at X = ${(e.x*dxNm).toFixed(0)} nm: P(D₊ | X) = ${pct(PX)}`,mw:'Each branch has an observer who sees one click.'}[state.view]);
  const narrowBoxes=w<360,bw=narrowBoxes?w-28:(w-38)/2,bh=narrowBoxes?(h-78)/2:h-70;
  for(const [i,port] of [[0,1],[1,-1]]){const cx=narrowBoxes?x+14:x+14+i*(bw+10),cy=narrowBoxes?y+56+i*(bh+8):y+56,weight=port===1?p:1-p,selected=stage===3&&(state.view==='mw'?state.follow===port:state.event?.port===port);
    ctx.fillStyle=C.bg;ctx.fillRect(cx,cy,bw,bh);ctx.strokeStyle=selected?C.text:C.grid;ctx.lineWidth=selected?2:1;ctx.strokeRect(cx,cy,bw,bh);text(`D${port===1?'₊':'₋'}`,cx+12,cy+24,16,port===1?C.purple:C.minus);
    const label=stage<3?(stage===2?`P(D${port===1?'₊':'₋'}) = ${pct(weight)}`:'Awaiting record'):state.view==='cpn'?(selected?'Recorded':'Removed by collapse'):state.view==='pw'?(selected?'Recorded (the actual outcome)':'Empty wave component'):`Branch weight ${pct(weight)}${selected?' · followed':''}`;
    fitText(label,cx+44,cy+23,bw-52,12,selected?C.text:C.muted);
    if(state.view==='pw'&&stage>=2)fitText(`P(D${port===1?'₊':'₋'} | X) = ${pct(port===1?PX:1-PX)}`,cx+12,cy+46,bw-24,11,C.muted);}
}
function drawAll(){drawMain();}
function frame(t){const dt=Math.min(.05,(t-(previous||t))/1000);previous=t;if(state.running){if(state.progress<1){state.progress=Math.min(1,state.progress+dt*state.speed/4);if(stageOf(state.progress)===3&&!state.event)detect();if(state.progress===1&&!state.repeat)stop();}else{state.hold+=dt;if(state.hold>=1.5)newPacket();}update();}if(state.anim){const m=state.anim.m;if(revealed(m)>=N_TOTAL){state.anim=null;}update();}drawMain();requestAnimationFrame(frame);}
newPacket();update();resize();requestAnimationFrame(frame);
