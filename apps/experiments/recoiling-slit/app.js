import '../../../shared/qontic-controls.js?v=3.2';
import {mountQonticShell} from '../../../shared/qontic-shell.js?v=3.7';
import {mountQonticMedia} from '../../../shared/qontic-media.js?v=3.8';
import {visibility,portProbability,sampleEvent,momentumSpread,recoilRatio,positionSpreadNm,PAPER} from './physics.mjs?v=2.0.0';
import {mountRecoilQuiz} from './quiz.js?v=2.0.0';
import {APP_RELEASE} from './release.js?v=2.0.0';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
mountQonticShell({title:'Einstein’s Recoiling Slit',eyebrow:'Q-Ontic · Experiments',navigation:'breadcrumbs',badge:'Experiment · Zhang et al. 2025',purpose:'A single atom as Einstein’s movable slit: does its recoil erase the fringe?',version:`Recoiling slit · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,homeHref:'../../../index.html'});
$$('[data-view]').forEach(button=>button.setAttribute('aria-label',button.textContent.trim()));
const controls=$('qontic-controls'),canvas=$('#main'),ctx=canvas.getContext('2d');
controls.setAttribute('theme','dark');
const DEPTH_MIN=0.02,DEPTH_MAX=20,PHASES=12,DWELL=1.0,RATE=300,TRAVEL=1.1;
const state={depth:PAPER.depthMax,nbar:0,view:'cpn',running:false,theory:true,k:0,dwell:0,acc:0,plus:new Array(PHASES).fill(0),n:new Array(PHASES).fill(0),ghost:null,photons:[],last:null};
const derived=()=>{const dp=momentumSpread(state.depth);return {dp,r:recoilRatio(dp),dxNm:positionSpreadNm(dp)};};
const dark={text:'#e1eaf4',muted:'#a4b9cc',grid:'#294054',a:'#74d8ce',b:'#edbc77',purple:'#b7a6f5',minus:'#8fa3b8',bg:'#0c1928',panel:'#102032',bar:'#21364b',band:'#b7a6f533'};
const light={text:'#182c3e',muted:'#4c6376',grid:'#c8d7e1',a:'#007c70',b:'#9f5d00',purple:'#6c47ad',minus:'#5d6f80',bg:'#eef4f7',panel:'#ffffff',bar:'#dae5eb',band:'#6c47ad2a'};
const C={...dark};
const viewLines={
  cpn:'Orthodox: each photon gives one click. No path is assigned between laser and click; the fringe fades because photon and atom are entangled.',
  pw:'Pilot Wave: the atom always has a definite position X (white dot). For each photon, X sets the odds of D₊ and D₋; X varies from photon to photon.',
  mw:'Many Worlds: every photon leaves both outcomes, in two branches weighted by P(D₊) and P(D₋). The counts are those seen in one branch.'
};
const phaseOf=k=>k*2*Math.PI/PHASES;
const depthToSlider=d=>Math.round(1000*Math.log(d/DEPTH_MIN)/Math.log(DEPTH_MAX/DEPTH_MIN));
const sliderToDepth=v=>DEPTH_MIN*Math.pow(DEPTH_MAX/DEPTH_MIN,v/1000);
const fmtDepth=d=>d<0.1?d.toFixed(3):d.toFixed(2);
function fit(plus,n){let num=0,den=0,vs=0,tot=0;for(let k=0;k<PHASES;k++){if(n[k]<1)return null;const f=plus[k]/n[k],c=Math.cos(phaseOf(k));num+=(f-.5)*c;den+=c*c;vs+=c*c*Math.max(f*(1-f),1/n[k])/n[k];tot+=n[k];}return {V:2*num/den,sV:2*Math.sqrt(vs)/den,N:tot};}
function stop(){state.running=false;controls.setAttribute('running','false');update();}
function start(){state.running=true;controls.setAttribute('running','true');update();}
function clearCounts(keepGhost){const f=fit(state.plus,state.n);if(keepGhost&&f&&f.N>=PHASES*50)state.ghost={depth:state.depth,nbar:state.nbar,plus:[...state.plus],n:[...state.n],fit:f};state.plus.fill(0);state.n.fill(0);state.photons=[];state.k=0;state.dwell=0;state.acc=0;state.last=null;}
function setSettings(fn){clearCounts(true);fn();update();}
function setDepth(d){setSettings(()=>{state.depth=Math.min(DEPTH_MAX,Math.max(DEPTH_MIN,d));$('#depth').value=depthToSlider(state.depth);});}
function emit(){const {r}=derived(),e=sampleEvent(r,phaseOf(state.k),state.nbar);state.n[state.k]++;if(e.port===1)state.plus[state.k]++;state.last=e;state.photons.push({t:performance.now(),port:e.port,x:e.x});}
function update(){
  const {dp,r,dxNm}=derived(),V=visibility(r,state.nbar),f=fit(state.plus,state.n),w=Math.sqrt(1+2*state.nbar),tot=state.n.reduce((a,b)=>a+b,0);
  $('#depthOut').textContent=`${fmtDepth(state.depth)} mK`;$('#depth').setAttribute('aria-valuetext',`${fmtDepth(state.depth)} millikelvin`);$('#nbarOut').textContent=state.nbar.toFixed(2);
  const inRange=state.depth>=PAPER.depthMin-1e-9&&state.depth<=PAPER.depthMax+1e-9;$('#rangeNote').textContent=inRange?'Inside the range used in the experiment (0.60–10.49 mK).':'Outside the experiment’s range: the same model, extrapolated.';$('#rangeNote').classList.toggle('warn',!inRange);
  $('#visibility').textContent=`${(100*V).toFixed(1)}%`;$('#measured').textContent=f?`${(100*f.V).toFixed(1)} ± ${(100*f.sV).toFixed(1)}%`:'collecting…';$('#total').textContent=tot.toLocaleString();
  $('#spread').textContent=`${(dp*w).toFixed(2)} ħk`;$('#dx').textContent=`${(dxNm*w).toFixed(0)} nm`;
  $$('[data-depth]').forEach(b=>{const s=Math.abs(+b.dataset.depth-state.depth)<1e-3*state.depth;b.classList.toggle('selected',s);b.setAttribute('aria-pressed',String(s));});
  $('#viewLine').textContent=viewLines[state.view];const g=state.ghost;$('#takeaway').textContent=`${fmtDepth(state.depth)} mK: fringe visibility ${f?`${(100*f.V).toFixed(0)} ± ${(100*f.sV).toFixed(0)}% measured, `:''}${(100*V).toFixed(0)}% predicted.${g?` Before, at ${fmtDepth(g.depth)} mK: ${(100*g.fit.V).toFixed(0)}%.`:' Change the trap depth and compare.'}`;
}
$('#depth').value=depthToSlider(state.depth);
$('#depth').oninput=e=>{const d=sliderToDepth(+e.target.value);const snap=[PAPER.depthMin,PAPER.depthMax].find(p=>Math.abs(Math.log(d/p))<0.01);setDepth(snap||d);};
$$('[data-depth]').forEach(b=>b.onclick=()=>setDepth(+b.dataset.depth));
$('#nbar').oninput=e=>setSettings(()=>{state.nbar=+e.target.value;});
$('#theory').onchange=e=>{state.theory=e.target.checked;};
controls.addEventListener('qontic:start',start);controls.addEventListener('qontic:stop',stop);
controls.addEventListener('qontic:reset',()=>{state.ghost=null;clearCounts(false);update();});
controls.addEventListener('qontic:interpretation',e=>{state.view=e.detail.interpretation;update();});
controls.addEventListener('qontic:theme',e=>{const isLight=e.detail.theme==='light';document.body.dataset.theme=isLight?'light':'dark';Object.assign(C,isLight?light:dark);});
controls.addEventListener('qontic:tab',e=>{$$('[data-control-pane]').forEach(p=>p.hidden=p.dataset.controlPane!==e.detail.tab);});
const simTab=$('[data-view="sim"]');
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{$$('[data-view]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',String(x===b));});$$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==b.dataset.view);if(b.dataset.view!=='sim')stop();else resize();}));
document.addEventListener('keydown',e=>{if(e.target.closest('input,button,select,textarea')||e.ctrlKey||e.metaKey||e.altKey||$('[data-panel="sim"]').hidden)return;if(e.code==='Space'){e.preventDefault();state.running?stop():start();}});
mountQonticMedia({stage:$('.visualization'),controls,getCanvases:()=>[canvas],filename:'einstein-recoiling-slit',beginRecording:()=>{const t={running:state.running};if(!state.running)start();return t;},endRecording:t=>{if(!t.running)stop();}});
// Quiz: each question sets the app (paused); "Watch it in the simulation" runs it.
function setView(v){state.view=v;controls.setAttribute('interpretation',v);update();}
mountRecoilQuiz({panel:$('#quiz-panel'),tab:$('[data-view="quiz"]'),simulationTab:simTab,
  setTo:({depth,nbar=0,view='cpn'})=>{stop();state.ghost=null;clearCounts(false);state.nbar=nbar;$('#nbar').value=nbar;state.depth=depth;$('#depth').value=depthToSlider(depth);setView(view);},
  run:()=>start()});
// ---------- drawing ----------
let width=900,height=672,previous=0;
const narrow=()=>width<620;
function resize(){const w=canvas.parentElement.clientWidth;if(w<1)return;width=w;height=narrow()?900:672;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.height=`${height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);}
new ResizeObserver(resize).observe(canvas.parentElement);
const FONT='system-ui,"Segoe UI","DejaVu Sans",sans-serif';
function text(s,x,y,size=13,color=C.text,align='left',style=''){ctx.font=`${style}${size}px ${FONT}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);}
function fitText(s,x,y,maxWidth,size=12,color=C.muted,style=''){ctx.font=`${style}${size}px ${FONT}`;if(ctx.measureText(s).width>maxWidth){while(s.length&&ctx.measureText(s+'…').width>maxWidth)s=s.slice(0,-1);s+='…';}text(s,x,y,size,color,'left',style);}
function line(points,color=C.grid,w=1,dash=[]){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.setLineDash(dash);points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);}
function circle(x,y,r,color,stroke=false,lw=1.6){ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);if(stroke){ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.stroke();}else{ctx.fillStyle=color;ctx.fill();}}
function panel(x,y,w,h,title,subtitle){ctx.fillStyle=C.panel;ctx.fillRect(x,y,w,h);fitText(title,x+14,y+24,w-28,15,C.text);if(subtitle)fitText(subtitle,x+14,y+43,w-28,12);}
function pathPoint(points,f){const seg=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));const tot=seg.reduce((a,b)=>a+b,0);let d=f*tot;for(let i=0;i<seg.length;i++){if(d<=seg[i]||i===seg.length-1){const a=points[i],b=points[i+1],q=d/seg[i];return [a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q];}d-=seg[i];}}
function apparatus(x0,y0,W,H){const {dxNm}=derived(),nw=narrow(),now=performance.now(),ph=phaseOf(state.k);
  panel(x0,y0,W,H,'The experiment',state.running?`Running: φ steps through 12 settings, ${RATE} photons per second`:'Paused. Press Start (or Space) to send photons.');
  const X=f=>x0+f*W,cy=y0+H*.5,dy=H*.21,dX=nw?.74:.84;
  const source=[X(.06),cy],atom=[X(.25),cy],upper=[X(.46),cy-dy],lower=[X(.46),cy+dy],bs=[X(.68),cy],plus=[X(dX),cy-dy],minus=[X(dX),cy+dy];
  const paths=[[source,atom],[atom,upper,bs],[atom,lower,bs],[bs,plus],[bs,minus]];paths.forEach(p=>line(p,C.grid,3));
  // tweezer beam and the atom's spread (glow), which grows as the trap gets shallower
  const sx=dxNm*Math.sqrt(1+2*state.nbar),blob=8+16*Math.min(1,sx/150),tb=H*.24,waist=4+blob*.6;
  ctx.fillStyle=C.b+'1f';ctx.beginPath();ctx.moveTo(atom[0]-28,atom[1]-tb);ctx.lineTo(atom[0]+28,atom[1]-tb);ctx.lineTo(atom[0]+waist,atom[1]);ctx.lineTo(atom[0]+28,atom[1]+tb);ctx.lineTo(atom[0]-28,atom[1]+tb);ctx.lineTo(atom[0]-waist,atom[1]);ctx.closePath();ctx.fill();
  const g=ctx.createRadialGradient(atom[0],atom[1],0,atom[0],atom[1],blob);g.addColorStop(0,C.a+'cc');g.addColorStop(1,C.a+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(atom[0],atom[1],blob,0,2*Math.PI);ctx.fill();
  if(state.view==='pw'&&state.last){const xx=atom[0]+Math.max(-1.6,Math.min(1.6,state.last.x/Math.sqrt(1+2*state.nbar)))*blob*.5;circle(xx,atom[1],4.5,C.text);}else circle(...atom,4,C.a);
  // phase shifter on path B
  const ps=[X(nw?.56:.57),cy+dy*.52];ctx.fillStyle=C.bar;ctx.fillRect(ps[0]-9,ps[1]-15,18,30);ctx.strokeStyle=C.b;ctx.lineWidth=1.5;ctx.strokeRect(ps[0]-9,ps[1]-15,18,30);text(`φ = ${Math.round(ph*180/Math.PI)}°`,ps[0]+16,ps[1]+26,13,C.b);
  // photons in flight (every 4th drawn): one pulse in, a pulse on both arms, then the click
  const recent=state.photons;for(let i=recent.length-1;i>=0;i-=4){const p=recent[i],t=(now-p.t)/1000/TRAVEL;if(t<0||t>1)continue;
    if(t<.3){const [a,b]=pathPoint(paths[0],t/.3);circle(a,b,3,C.text);}
    else if(t<.72){const f=(t-.3)/.42;ctx.globalAlpha=.65;const A=pathPoint(paths[1],f),B=pathPoint(paths[2],f);circle(A[0],A[1],3,C.a);circle(B[0],B[1],3,C.b);ctx.globalAlpha=1;}
    else{const f=(t-.72)/.28;if(state.view==='mw'){ctx.globalAlpha=.75;const P=pathPoint(paths[3],f),M=pathPoint(paths[4],f);circle(P[0],P[1],3,C.purple);circle(M[0],M[1],3,C.minus);ctx.globalAlpha=1;}else{const q=pathPoint(paths[p.port===1?3:4],f);circle(q[0],q[1],3,p.port===1?C.purple:C.minus);}}}
  circle(...source,7,C.text);ctx.fillStyle=C.purple;ctx.fillRect(bs[0]-5,bs[1]-15,10,30);
  // detectors with counters at the current φ
  const k=state.k,np=state.plus[k],nm=state.n[k]-state.plus[k];
  for(const [port,pos,cnt] of [[1,plus,np],[-1,minus,nm]]){const col=port===1?C.purple:C.minus;ctx.fillStyle=col;ctx.fillRect(pos[0]-7,pos[1]-14,14,28);text(port===1?'D₊':'D₋',pos[0]-16,pos[1]+5,15,col,'right');
    if(state.running)circle(pos[0],pos[1],15+3*Math.sin(now/90+port),col,true,1.4);
    const bx=pos[0]+(nw?20:30),bw=Math.max(24,x0+W-bx-14),frac=state.n[k]?cnt/state.n[k]:0;ctx.fillStyle=C.bar;ctx.fillRect(bx,pos[1]-9,bw,18);ctx.fillStyle=col;ctx.fillRect(bx,pos[1]-9,bw*frac,18);fitText(cnt.toLocaleString(),bx+4,pos[1]+25,bw,12,C.text);}
  if(!nw)fitText(`clicks at φ = ${Math.round(ph*180/Math.PI)}°`,X(dX)+30,cy+5,x0+W-X(dX)-44,12);
  // labels: the apparatus, and Einstein's picture in italics
  text('Laser',source[0],cy+28,13,C.muted,'center');if(nw){text('Atom',atom[0]-24,cy+tb+18,13,C.a,'center');}else{text('Atom in a tweezer trap',atom[0],cy+tb+18,13,C.a,'center');text(`trap depth ${fmtDepth(state.depth)} mK`,atom[0],cy-tb-8,12,C.b,'center');}
  fitText(nw?'A · kick −ħk':'Path A: photon up, atom kicked −ħk',upper[0]-(nw?30:110),upper[1]-14,260,13,C.a);fitText(nw?'B · kick +ħk':'Path B: photon down, atom kicked +ħk',lower[0]-(nw?30:110),lower[1]+26,260,13,C.b);
  if(!nw)text('Beam splitter',bs[0],bs[1]+34,12,C.muted,'center');
  if(!nw){const E=(s,x,y,al='center')=>text(s,x,y,12,C.muted,al,'italic ');E('Einstein’s movable slit',atom[0],cy+tb+36);E('Einstein’s two slits',X(.40),cy+5);E('position on Einstein’s screen',ps[0]+16,ps[1]+44,'left');E('Einstein’s screen',X(dX),cy+dy+44);}
}
function fringePlot(x,y,w,h){const {r}=derived(),f=fit(state.plus,state.n),gh=state.ghost;
  panel(x,y,w,h,'The fringe: how often D₊ clicks at each φ','Line: prediction · filled dots: now · open dots: the previous trap depth');
  const left=x+46,right=x+w-16,top=y+66,bottom=y+h-38,pw=right-left,py=v=>bottom-v*(bottom-top),px=p=>left+p/(2*Math.PI)*pw;
  for(const v of [0,.5,1]){line([[left,py(v)],[right,py(v)]]);text(v.toFixed(1),left-7,py(v)+4,11,C.muted,'right');}line([[left,top],[left,bottom],[right,bottom]],C.muted);text('fraction of clicks in D₊',left,top-7,11,C.muted);
  for(const d of [0,90,180,270,360])text(`${d}°`,px(d*Math.PI/180),bottom+16,11,C.muted,'center');text('Path phase φ',x+w/2,y+h-6,12,C.muted,'center');
  const curve=(rr,nb)=>{const pts=[];for(let i=0;i<=240;i++){const p=i/240*2*Math.PI;pts.push([px(p),py(portProbability(rr,p,nb))]);}return pts;};
  if(state.theory){if(gh)line(curve(recoilRatio(momentumSpread(gh.depth)),gh.nbar),C.minus,1.5,[5,4]);line(curve(r,state.nbar),C.purple,2.5);}
  const dots=(P,N,filled)=>{for(let k=0;k<PHASES;k++){if(N[k]<10)continue;const fr=P[k]/N[k],s=Math.sqrt(Math.max(fr*(1-fr),1/N[k])/N[k]);line([[px(phaseOf(k)),py(fr-s)],[px(phaseOf(k)),py(fr+s)]],filled?C.text:C.minus,1.2);circle(px(phaseOf(k)),py(fr),4.5,filled?C.text:C.minus,!filled);}};
  if(gh)dots(gh.plus,gh.n,false);dots(state.plus,state.n,true);
  if(state.running)line([[px(phaseOf(state.k)),top],[px(phaseOf(state.k)),bottom]],C.b,1,[3,4]);
  fitText(`${fmtDepth(state.depth)} mK: V = ${f?`${(100*f.V).toFixed(0)} ± ${(100*f.sV).toFixed(0)}%`:'collecting…'}`,left+8,top+15,pw-16,12,C.text);
  if(gh)fitText(`${fmtDepth(gh.depth)} mK: V = ${(100*gh.fit.V).toFixed(0)} ± ${(100*gh.fit.sV).toFixed(0)}%`,left+8,top+32,pw-16,12,C.minus);
}
function whyPlot(x,y,w,h){const {dp,r}=derived(),V=visibility(r,state.nbar),V0=visibility(r);
  panel(x,y,w,h,'Why: can the atom tell the two paths apart?','The atom’s momentum after a kick of −ħk (path A) or +ħk (path B)');
  const left=x+46,right=x+w-16,top=y+66,bottom=y+h-38,Q=5,px=q=>left+(q+Q)/(2*Q)*(right-left),gs=q=>Math.exp(-q*q/(2*dp*dp))/(dp*Math.sqrt(2*Math.PI)),peak=1.12/(Math.min(dp,.5)*Math.sqrt(2*Math.PI)),py=v=>bottom-Math.min(1,v/peak)*(bottom-top);
  line([[left,top],[left,bottom],[right,bottom]],C.muted);for(const q of [-4,-2,0,2,4])text(String(q),px(q),bottom+16,11,C.muted,'center');text('Atom momentum p (units of ħk)',x+w/2,y+h-6,12,C.muted,'center');
  const A=[],B=[],O=[];for(let i=0;i<=300;i++){const q=-Q+i/300*2*Q,a=gs(q+1),b=gs(q-1);A.push([px(q),py(a)]);B.push([px(q),py(b)]);O.push([px(q),py(Math.sqrt(a*b))]);}
  ctx.beginPath();ctx.moveTo(px(-Q),bottom);O.forEach(([a,b])=>ctx.lineTo(a,b));ctx.lineTo(px(Q),bottom);ctx.closePath();ctx.fillStyle=C.band;ctx.fill();line(A,C.a,2.2);line(B,C.b,2.2,[6,4]);
  text('A',px(-1),Math.max(top+14,py(gs(0))-8),13,C.a,'center');text('B',px(1),Math.max(top+14,py(gs(0))-8),13,C.b,'center');
  fitText(`Overlap (shaded area) = ${(100*V0).toFixed(0)}% = the fringe visibility.`,left+8,top+15,right-left-16,12,C.text);
  fitText(V0>.7?'Large overlap: the atom keeps little record of the path, so the fringe survives.':V0>.3?'Partial overlap: the atom keeps a partial record, and the fringe weakens.':'Little overlap: the atom records the path, and the fringe is gone.',left+8,top+32,right-left-16,12,C.muted);
  if(state.nbar>0)fitText(`With heating n̄ = ${state.nbar.toFixed(2)} the visibility drops to ${(100*V).toFixed(0)}% (see Physics).`,left+8,top+49,right-left-16,11.5,C.b);
}
function draw(){ctx.fillStyle=C.bg;ctx.fillRect(0,0,width,height);const half=(width-36)/2,W=width-24;
  if(narrow()){apparatus(12,12,W,330);fringePlot(12,354,W,262);whyPlot(12,628,W,260);}else{apparatus(12,12,W,380);fringePlot(12,404,half,256);whyPlot(24+half,404,half,256);}}
function frame(t){const dt=Math.min(.05,(t-(previous||t))/1000);previous=t;
  if(state.running){state.acc+=dt*RATE;while(state.acc>=1){emit();state.acc-=1;}state.dwell+=dt;if(state.dwell>=DWELL){state.dwell=0;state.k=(state.k+1)%PHASES;}const cut=performance.now()-TRAVEL*1000-200;while(state.photons.length&&state.photons[0].t<cut)state.photons.shift();update();}
  draw();requestAnimationFrame(frame);}
update();resize();if(!new URLSearchParams(location.search).get('quiz'))start();requestAnimationFrame(frame);
