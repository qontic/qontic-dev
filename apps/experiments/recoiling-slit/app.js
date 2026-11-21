import '../../../shared/qontic-controls.js?v=3.2';
import {mountQonticShell} from '../../../shared/qontic-shell.js?v=3.7';
import {mountQonticMedia} from '../../../shared/qontic-media.js?v=3.8';
import {visibility,portProbability,sampleEvent,momentumSpread,recoilRatio,eta,positionSpreadNm,positionPortProbability,thermalPosition,PAPER,PAPER_POINT,LAMBDA_NM} from './physics.mjs?v=1.1.0';
import {atomWave,outputWaves,branchWave,norm2,photonMode,stageOf,displayedPorts} from './waves.mjs?v=1.1.0';
import {APP_RELEASE} from './release.js?v=1.1.0';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
mountQonticShell({title:'Einstein’s Recoiling Slit',eyebrow:'Q-Ontic · Experiments',navigation:'breadcrumbs',badge:'Experiment · Zhang et al. 2025',purpose:'A single atom as Einstein’s movable slit: does its recoil erase the fringe?',version:`Recoiling slit · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,homeHref:'../../../index.html'});
$$('[data-view]').forEach(button=>button.setAttribute('aria-label',button.textContent.trim()));
const controls=$('qontic-controls'),mainCanvas=$('#main'),canvas=$('#stage'),mctx=mainCanvas.getContext('2d'),sctx=canvas.getContext('2d');
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
  pw:['The atom has a definite position X in the trap, distributed as |ψ|². The wave guides it.','The kicks multiply the atom wave by e^∓ikx: its phase changes, the atom’s position does not.','For an atom at X the wave gives D₊ with probability [1 + cos(2kX + φ)]/2 (Part 1, right panel).','One definite record; its odds were set by where the atom actually was. The light’s and detectors’ configurations, not modeled, settle which one fires.'],
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
}
function update(){
  const step=stageOf(state.progress),{dp,r,eta:et,dxNm}=derived(),V=visibility(r,state.nbar),P=portProbability(r,state.phase,state.nbar),m=current(),w=Math.sqrt(1+2*state.nbar);
  $('#depthOut').textContent=`${fmtDepth(state.depth)} mK`;$('#depth').setAttribute('aria-valuetext',`${fmtDepth(state.depth)} millikelvin`);
  $('#nbarOut').textContent=state.nbar.toFixed(2);$('#phaseOut').textContent=`${Math.round(state.phase*180/Math.PI)}°`;
  const inRange=state.depth>=PAPER.depthMin-1e-9&&state.depth<=PAPER.depthMax+1e-9;
  $('#rangeNote').textContent=inRange?'Inside the range measured in the experiment.':'Outside the measured range: an extrapolation of the same model.';$('#rangeNote').classList.toggle('warn',!inRange);
  $('#spread').textContent=`${(dp*w).toFixed(2)} ħk`;$('#dx').textContent=`${(dxNm*w).toFixed(0)} nm`;$('#eta').textContent=et.toFixed(2);
  $('#visibility').textContent=pct(V);$('#measured').textContent=m?`${(100*m.V).toFixed(1)} ± ${(100*m.sV).toFixed(1)}%`:'not yet measured';
  const other=state.measurements.find(x=>!same(x));
  $('#takeaway').textContent=m?`${fmtDepth(state.depth)} mK: measured visibility ${(100*m.V).toFixed(0)} ± ${(100*m.sV).toFixed(0)}% (predicted ${(100*V).toFixed(0)}%).${other?` At ${fmtDepth(other.depth)} mK it was ${(100*other.V).toFixed(0)}%.`:' Now change the trap and measure again.'} The fringe is strong when the atom’s two recoil waves overlap (shaded area, lower left).`:`Press Measure the fringe. At ${fmtDepth(state.depth)} mK the prediction is ${(100*V).toFixed(0)}% visibility.`;
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
$('#measure').onclick=()=>{measure();update();drawAll();};
$('#one').onclick=()=>{stop();newPacket();start(false);};
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
mountQonticMedia({stage:$('.visualization'),controls,getCanvases:()=>[mainCanvas,canvas],filename:'einstein-recoiling-slit',beginRecording:()=>{const token={running:state.running,repeat:state.repeat};if(!state.running)start(false);return token;},endRecording:token=>{stop();if(token.running)start(token.repeat);}});
let width=900,mainH=540,stageH=490,previous=0;
const narrow=()=>width<620;
function size(cv,h){const dpr=Math.min(devicePixelRatio||1,2);cv.width=Math.round(width*dpr);cv.height=Math.round(h*dpr);cv.style.height=`${h}px`;cv.getContext('2d').setTransform(dpr,0,0,dpr,0,0);}
function resize(){const w=mainCanvas.parentElement.clientWidth;if(w<1)return;width=w;mainH=narrow()?1048:536;stageH=narrow()?702:490;size(mainCanvas,mainH);size(canvas,stageH);drawAll();}
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
  const dots=(mm,filled)=>mm.phases.forEach((ph,k)=>{const f=mm.plus[k]/PER_PHASE,s=Math.sqrt(Math.max(f*(1-f),1/PER_PHASE)/PER_PHASE);line([[px(ph),py(f-s)],[px(ph),py(f+s)]],filled?C.text:C.minus,1.2);circle(px(ph),py(f),4,filled?C.text:C.minus,!filled);});
  if(other)dots(other,false);if(m)dots(m,true);
  line([[px(state.phase),top],[px(state.phase),bottom]],C.a,1,[3,4]);
  if(m)fitText(`${fmtDepth(m.depth)} mK: V = ${(100*m.V).toFixed(0)} ± ${(100*m.sV).toFixed(0)}%`,left+8,top+14,pw-16,11,C.text);
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
  for(const mm of state.measurements){const xx=lx(mm.depth);line([[xx,vy(mm.V-mm.sV)],[xx,vy(mm.V+mm.sV)]],C.text,1.2);circle(xx,vy(mm.V),4,C.text,!same(mm));}
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
function drawMain(){ctx=mctx;ctx.fillStyle=C.bg;ctx.fillRect(0,0,width,mainH);const half=(width-36)/2;
  if(narrow()){fringePlot(12,12,width-24,250);visibilityPlot(12,274,width-24,250);overlapPlot(12,536,width-24,240);stripePlot(12,788,width-24,248);}
  else{fringePlot(12,12,half,250);visibilityPlot(24+half,12,half,250);overlapPlot(12,274,half,250);stripePlot(24+half,274,half,250);}}
// ---------- Part 2 ----------
function pathPoint(points,f){const segments=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));const total=segments.reduce((a,b)=>a+b,0);let d=f*total;for(let i=0;i<segments.length;i++){if(d<=segments[i]||i===segments.length-1){const a=points[i],b=points[i+1],q=d/segments[i];return {x:a[0]+(b[0]-a[0])*q,y:a[1]+(b[1]-a[1])*q,nx:-(b[1]-a[1])/segments[i],ny:(b[0]-a[0])/segments[i]};}d-=segments[i];}}
function opticalWave(points,s0,s1,color,phase=0,amplitude=1,envelope=false){if(stageOf(state.progress)===3)return;const pts=[],ptsOther=[],peak=1/Math.pow(2*Math.PI*.055**2,.25);for(let i=0;i<=150;i++){const f=i/150,s=s0+(s1-s0)*f,p=pathPoint(points,f),z=photonMode(s,state.progress,phase);const hh=18*amplitude*(envelope?Math.sqrt(norm2(z)):z.re)/peak;pts.push([p.x+p.nx*hh,p.y+p.ny*hh]);ptsOther.push([p.x-p.nx*hh,p.y-p.ny*hh]);}line(pts,color,1.7);if(envelope)line(ptsOther,color,1.7);}
function apparatus(){const w=width,{r}=derived();panel(12,12,w-24,224,'The apparatus','Light ripples drawn with an enlarged wavelength · after the beam splitter: probability envelopes');
  const source=[w*.07,130],atom=[w*.25,130],upper=[w*.45,87],lower=[w*.45,173],bs=[w*.7,130],plus=[w*.9,87],minus=[w*.9,173],paths=[[source,atom],[atom,upper,bs],[atom,lower,bs],[bs,plus],[bs,minus]];
  paths.forEach(p=>line(p,C.grid,2));opticalWave(paths[0],0,.18,C.text);opticalWave(paths[1],.18,.65,C.a,0,1/Math.SQRT2);opticalWave(paths[2],.18,.65,C.b,state.phase,1/Math.SQRT2);
  const p=portProbability(r,state.phase,state.nbar);opticalWave(paths[3],.65,.91,C.purple,0,Math.sqrt(p),true);opticalWave(paths[4],.65,.91,C.minus,0,Math.sqrt(1-p),true);
  circle(...source,5,C.text);circle(...atom,10,C.a);ctx.fillStyle=C.purple;ctx.fillRect(bs[0]-5,bs[1]-12,10,24);
  text('Laser',source[0],158,11,C.muted,'center');text('Atom (the slit)',atom[0],158,11,C.a,'center');text('Path A · atom −ħk',upper[0],72,11,C.a,'center');text('Path B · atom +ħk',lower[0],197,11,C.b,'center');text('φ',w*.56,186,13,C.b,'center');
  fitText('Beam splitter',bs[0]-40,158,100,10);text('D₊',plus[0]+16,92,13,C.purple);text('D₋',minus[0]+16,178,13,C.minus);
  for(const [port,pos] of [[1,plus],[-1,minus]]){const col=port===1?C.purple:C.minus,active=stageOf(state.progress)===3&&(state.view==='mw'?((port===1?p:1-p)>1e-14):state.event?.port===port);circle(...pos,6,col);if(active)circle(...pos,11,C.text,true);}
}
const Q=6;
function waveScale(){const {dp}=derived();const A=Math.pow(2*Math.PI,-.25)/Math.sqrt(dp);return state.quantity==='density'?1.25*A*A:1.15*A;}
function inQ(fn){const {dp}=derived(),s=1/Math.sqrt(dp);return q=>{const z=fn(q/dp);return z?{re:z.re*s,im:z.im*s}:null;};}
function wavePanel(x,y,w,h){const {r,dp}=derived(),stage=stageOf(state.progress),density=state.quantity==='density',S=waveScale(),min=density?0:-S;
  let title,subtitle,curves=[];
  if(stage===0){title='The atom’s momentum wave';subtitle=`Ground state in the trap, width Δp = ${dp.toFixed(2)} ħk`;curves=[[inQ(u=>atomWave(u,0,-1)),C.muted,[]]];}
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
  const title=stage<3?'Detector records: not formed yet':{cpn:'One recorded outcome',pw:'One definite record, both wave components kept',mw:'Two branches, no collapse'}[state.view];
  panel(x,y,w,h,title,stage<3?'Press 4 · Detect or Send one photon.':{cpn:'The unrecorded component is removed (collapse).',pw:`Atom at X = ${(e.x*dxNm).toFixed(0)} nm: P(D₊ | X) = ${pct(PX)}`,mw:'Each branch has an observer who sees one click.'}[state.view]);
  const narrowBoxes=w<360,bw=narrowBoxes?w-28:(w-38)/2,bh=narrowBoxes?(h-78)/2:h-70;
  for(const [i,port] of [[0,1],[1,-1]]){const cx=narrowBoxes?x+14:x+14+i*(bw+10),cy=narrowBoxes?y+56+i*(bh+8):y+56,weight=port===1?p:1-p,selected=stage===3&&(state.view==='mw'?state.follow===port:state.event?.port===port);
    ctx.fillStyle=C.bg;ctx.fillRect(cx,cy,bw,bh);ctx.strokeStyle=selected?C.text:C.grid;ctx.lineWidth=selected?2:1;ctx.strokeRect(cx,cy,bw,bh);text(`D${port===1?'₊':'₋'}`,cx+12,cy+24,16,port===1?C.purple:C.minus);
    const label=stage<3?(stage===2?`P(D${port===1?'₊':'₋'}) = ${pct(weight)}`:'Awaiting record'):state.view==='cpn'?(selected?'Recorded':'Removed by collapse'):state.view==='pw'?(selected?'Recorded (the actual outcome)':'Empty wave component'):`Branch weight ${pct(weight)}${selected?' · followed':''}`;
    fitText(label,cx+44,cy+23,bw-52,12,selected?C.text:C.muted);
    if(state.view==='pw'&&stage>=2)fitText(`P(D${port===1?'₊':'₋'} | X) = ${pct(port===1?PX:1-PX)}`,cx+12,cy+46,bw-24,11,C.muted);}
}
function drawStage(){ctx=sctx;ctx.fillStyle=C.bg;ctx.fillRect(0,0,width,stageH);apparatus();const half=(width-36)/2;
  if(narrow()){wavePanel(12,248,width-24,230);recordsPanel(12,490,width-24,200);}else{wavePanel(12,248,half,230);recordsPanel(24+half,248,half,230);}}
function drawAll(){drawMain();drawStage();}
function frame(t){const dt=Math.min(.05,(t-(previous||t))/1000);previous=t;if(state.running){if(state.progress<1){state.progress=Math.min(1,state.progress+dt*state.speed/4);if(stageOf(state.progress)===3&&!state.event)detect();if(state.progress===1&&!state.repeat)stop();}else{state.hold+=dt;if(state.hold>=1.5)newPacket();}update();if(state.view==='pw')drawMain();}drawStage();requestAnimationFrame(frame);}
newPacket();update();resize();requestAnimationFrame(frame);
