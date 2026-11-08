import '../../../shared/qontic-controls.js?v=3.2';
import {mountQonticShell} from '../../../shared/qontic-shell.js?v=3.7';
import {mountQonticMedia} from '../../../shared/qontic-media.js?v=3.8';
import {visibility,portProbability,recoilDensities,sampleEvent} from './physics.mjs?v=0.1.0';
import {APP_RELEASE} from './release.js?v=0.1.0';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
mountQonticShell({title:'Einstein’s Recoiling Slit',eyebrow:'Q-Ontic · Advanced',navigation:'breadcrumbs',badge:'Research example · Prototype',purpose:'How a recoil record changes interference',version:`Recoiling slit · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,homeHref:'../../../index.html'});
const controls=$('qontic-controls'),canvas=$('#stage'),ctx=canvas.getContext('2d');
controls.setAttribute('theme','dark');
const state={r:1,phase:0,running:false,scan:false,read:false,theory:true,n:0,plus:0,atomN:0,bins:new Array(40).fill(0),last:null,target:Infinity,prediction:null,pulse:0};
const dark={text:'#e1eaf4',muted:'#a4b9cc',grid:'#294054',a:'#74d8ce',b:'#edbc77',purple:'#b7a6f5',bg:'#0c1928',panel:'#102032',bar:'#21364b'};
const C={...dark};
let width=900,height=630,prev=0,credit=0;
function stop(){state.running=false;controls.setAttribute('running','false');}
function clear(){stop();state.n=state.plus=state.atomN=0;state.bins.fill(0);state.last=null;state.target=Infinity;credit=0;update();}
function setScan(scan){state.scan=scan;$('#scan').checked=scan;if(scan)stop();}
function start(target=Infinity){setScan(false);state.target=target;state.running=true;controls.setAttribute('running','true');}
function detect(){const e=sampleEvent(state.r,state.phase);state.n++;if(e.port===1)state.plus++;state.last=e;state.pulse=1;if(state.read){state.atomN++;const bin=Math.floor((e.u+8)/16*state.bins.length);if(bin>=0&&bin<state.bins.length)state.bins[bin]++;}if(state.n>=state.target)stop();}
function update(){
  $('#recoilOut').textContent=`${state.r.toFixed(2)} σₚ`;$('#phaseOut').textContent=`${Math.round(state.phase*180/Math.PI)}°`;
  $('#visibility').textContent=`${(100*visibility(state.r)).toFixed(1)}%`;
  $('#probability').textContent=`${(100*portProbability(state.r,state.phase)).toFixed(1)}%`;
  $('#total').textContent=state.n.toLocaleString();$('#observed').textContent=state.n?`${(100*state.plus/state.n).toFixed(1)}%`:'—';
  $$('[data-r]').forEach(b=>{const active=Math.abs(+b.dataset.r-state.r)<0.001;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  $('#summary').textContent=`Recoil separation ${state.r.toFixed(2)} sigma p. Visibility ${(100*visibility(state.r)).toFixed(1)} percent. ${state.n} photons: ${state.plus} at D plus and ${state.n-state.plus} at D minus. Atom readout ${state.read?'on':'off'}.`;
}
$('#recoil').addEventListener('input',e=>{state.r=+e.target.value;clear();});
$$('[data-r]').forEach(b=>b.onclick=()=>{state.r=+b.dataset.r;$('#recoil').value=state.r;clear();});
$('#phase').addEventListener('input',e=>{setScan(false);state.phase=+e.target.value*Math.PI/180;clear();});
$('#scan').onchange=e=>{if(e.target.checked)clear();setScan(e.target.checked);};
$('#readout').onchange=e=>{state.read=e.target.checked;update();};
$('#theory').onchange=e=>{state.theory=e.target.checked;};
$('#one').onclick=()=>{stop();setScan(false);detect();update();};
$('#thousand').onclick=()=>{stop();setScan(false);state.target=Infinity;for(let i=0;i<1000;i++)detect();update();};
controls.addEventListener('qontic:start',()=>start());controls.addEventListener('qontic:stop',stop);
controls.addEventListener('qontic:reset',()=>{setScan(false);clear();});
controls.addEventListener('qontic:theme',e=>{const light=e.detail.theme==='light';document.body.dataset.theme=light?'light':'dark';Object.assign(C,light?{text:'#182c3e',muted:'#4c6376',grid:'#c8d7e1',a:'#007c70',b:'#9f5d00',purple:'#6c47ad',bg:'#eef4f7',panel:'#ffffff',bar:'#dae5eb'}:dark);});
controls.addEventListener('qontic:tab',e=>{$$('[data-control-pane]').forEach(p=>p.hidden=p.dataset.controlPane!==e.detail.tab);});
$$('[data-view]').forEach(b=>b.onclick=()=>{$$('[data-view]').forEach(x=>x.classList.toggle('active',x===b));$$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==b.dataset.view);if(b.dataset.view!=='sim'){stop();setScan(false);}else resize();});
$$('[data-answer]').forEach(b=>b.onclick=()=>{state.prediction=b.dataset.answer;$$('[data-answer]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#feedback').textContent=state.prediction==='down'?'Correct. More separated recoil states give lower fringe visibility. Try both presets.':'That prediction does not match this model. More separated recoil states give lower fringe visibility. Try both presets.';});
document.addEventListener('keydown',e=>{if(e.target.closest('input,button,select,textarea')||e.ctrlKey||e.metaKey||e.altKey||$('[data-panel="sim"]').hidden)return;if(e.code==='Space'){e.preventDefault();state.running?stop():start();}if(e.key.toLowerCase()==='r'){setScan(false);clear();}});
mountQonticMedia({stage:$('.visualization'),controls,getCanvases:()=>[canvas],filename:'einstein-recoiling-slit',beginRecording:()=>{const token={running:state.running,scan:state.scan};if(!state.running&&!state.scan)start();return token;},endRecording:token=>{stop();setScan(token.scan);if(token.running)start();}});
function resize(){const w=canvas.parentElement.clientWidth;if(w<1)return;width=w;height=w<620?850:630;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.height=`${height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
new ResizeObserver(resize).observe(canvas.parentElement);
function text(s,x,y,size=13,color=C.text,align='left'){ctx.font=`${size}px system-ui,sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);}
function line(points,color=C.grid,w=1,dash=[]){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.setLineDash(dash);points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);}
function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();}
function panel(x,y,w,h,title,subtitle){ctx.fillStyle=C.panel;ctx.fillRect(x,y,w,h);text(title,x+14,y+25,14);if(subtitle)text(subtitle,x+14,y+45,11,C.muted);}
function apparatus(){const w=width;panel(12,12,w-24,187,'A recoil record in a two-path interferometer','Balanced paths · ideal atom · schematic optics');const sx=w*.08,ax=w*.28,rx=w*.68,dx=w*.88,cy=118,dy=36;
  line([[sx,cy],[ax,cy]],C.muted,2);line([[ax,cy],[w*.48,cy-dy],[rx,cy]],C.a,2);line([[ax,cy],[w*.48,cy+dy],[rx,cy]],C.b,2);line([[rx,cy],[dx,cy-dy]],C.purple,2);line([[rx,cy],[dx,cy+dy]],C.muted,2);
  circle(sx,cy,6,C.text);circle(ax,cy,10,C.a);ctx.fillStyle='#b7a6f5';ctx.fillRect(rx-5,cy-12,10,24);
  text('Source',sx,cy+32,11,C.muted,'center');text('Atom',ax,cy+32,11,C.a,'center');text('A',w*.48,cy-dy-8,12,C.a,'center');text('B',w*.48,cy+dy+18,12,C.b,'center');text('φ',w*.55,cy-dy,14,C.text);
  text('D₊',dx+12,cy-dy+4,12,C.purple);text('D₋',dx+12,cy+dy+4,12,C.muted);
  circle(dx,cy-dy,7+(state.last?.port===1?state.pulse*5:0),state.last?.port===1&&state.pulse>0.1?C.text:C.purple);circle(dx,cy+dy,7+(state.last?.port===-1?state.pulse*5:0),state.last?.port===-1&&state.pulse>0.1?C.text:C.muted);
  text(state.read?'Recoil readout ON':'Recoil readout OFF',w-26,184,11,state.read?C.a:C.muted,'right');
}
function recoilPlot(x,y,w,h){panel(x,y,w,h,'Atom recoil states',state.read?`Readout on · ${state.atomN.toLocaleString()} atom readings`:'Readout off · atom states still become entangled');const left=x+43,right=x+w-17,top=y+63,bottom=y+h-38,pw=right-left,ph=bottom-top;
  for(const v of [0,.2,.4]){const yy=bottom-v/.48*ph;line([[left,yy],[right,yy]]);text(v.toFixed(1),left-7,yy+4,10,C.muted,'right');}
  const px=u=>left+(u+8)/16*pw,py=v=>bottom-v/.48*ph;
  if(state.read&&state.atomN){ctx.fillStyle='#95a6b566';const bw=pw/40;state.bins.forEach((n,i)=>{const bh=n/state.atomN/(16/40)/.48*ph;ctx.fillRect(left+i*bw,Math.max(top,bottom-bh),bw-1,Math.min(ph,bh));});}
  if(state.theory){for(let k=0;k<2;k++){const pts=[];for(let i=0;i<=240;i++){const u=-8+16*i/240;pts.push([px(u),py(recoilDensities(u,state.r)[k])]);}line(pts,k===0?C.a:C.b,2);}text('A',right-35,top+13,12,C.a);text('B',right-13,top+13,12,C.b);}
  if(state.read&&state.last){const u=state.last.u;if(Math.abs(u)<=8){line([[px(u),top],[px(u),bottom]],'#d9e6f077',1,[3,4]);}}
  line([[left,top],[left,bottom],[right,bottom]],C.muted);for(const u of [-8,-4,0,4,8]){text(String(u),px(u),bottom+16,10,C.muted,'center');}text('Momentum p / σₚ',x+w/2,y+h-5,11,C.muted,'center');text('density',left,top-5,10,C.muted);
}
function fringePlot(x,y,w,h){panel(x,y,w,h,'Photon interference','Vary the path phase to reveal the fringe');const left=x+43,right=x+w-17,top=y+63,bottom=y+h-38,pw=right-left,ph=bottom-top;
  for(const p of [0,.5,1]){const yy=bottom-p*ph;line([[left,yy],[right,yy]]);text(p.toFixed(1),left-7,yy+4,10,C.muted,'right');}
  if(state.theory){const pts=[];for(let i=0;i<=240;i++){pts.push([left+i/240*pw,bottom-portProbability(state.r,i/240*2*Math.PI)*ph]);}line(pts,C.purple,2.5);}
  const current=left+state.phase/(2*Math.PI)*pw;line([[current,top],[current,bottom]],'#7fdfd166',1,[4,4]);if(state.theory)circle(current,bottom-portProbability(state.r,state.phase)*ph,5,C.a);
  if(state.n){const p=state.plus/state.n,err=Math.sqrt(p*(1-p)/state.n),yy=bottom-p*ph;line([[current,bottom-Math.min(1,p+err)*ph],[current,bottom-Math.max(0,p-err)*ph]],C.text,2);circle(current,yy,4,C.text);}
  line([[left,top],[left,bottom],[right,bottom]],C.muted);for(const deg of [0,90,180,270,360])text(`${deg}°`,left+deg/360*pw,bottom+16,10,C.muted,'center');text('Path phase φ',x+w/2,y+h-5,11,C.muted,'center');text('P(D₊)',left,top-5,10,C.muted);
}
function counts(x,y,w,h){panel(x,y,w,h,'Photon detections',state.n?`${state.n.toLocaleString()} photons · D₊ sample: dot ±1 SE`:'Collect photons to compare data with the prediction');const left=x+65,right=x+w-55,bw=right-left;
  for(let k=0;k<2;k++){const yy=y+65+k*32,p=k===0?portProbability(state.r,state.phase):1-portProbability(state.r,state.phase),n=k===0?state.plus:state.n-state.plus;ctx.fillStyle=C.bar;ctx.fillRect(left,yy,bw,16);if(state.n){ctx.fillStyle=k===0?C.purple:C.muted;ctx.fillRect(left,yy,bw*n/state.n,16);}if(state.theory){const xx=left+bw*p;line([[xx,yy-3],[xx,yy+19]],C.a,2);}text(k===0?'D₊':'D₋',left-35,yy+13,12,C.text);text(n.toLocaleString(),right+8,yy+13,12,C.text);}
  text('Filled bars: observed fraction · green marks: prediction',x+14,y+h-10,11,C.muted);
}
function draw(){ctx.fillStyle=C.bg;ctx.fillRect(0,0,width,height);apparatus();if(width<620){recoilPlot(12,211,width-24,233);fringePlot(12,456,width-24,233);counts(12,701,width-24,140);}else{const half=(width-36)/2;recoilPlot(12,211,half,245);fringePlot(24+half,211,half,245);counts(12,468,width-24,147);}}
function frame(t){const dt=Math.min(.05,(t-(prev||t))/1000);prev=t;state.pulse=Math.max(0,state.pulse-dt*3);if(state.scan){state.phase=(state.phase+dt*.8)%(2*Math.PI);$('#phase').value=state.phase*180/Math.PI;update();}if(state.running){credit+=dt*180;const n=Math.floor(credit);credit-=n;for(let i=0;i<n&&state.running;i++)detect();if(n)update();}draw();requestAnimationFrame(frame);}
update();resize();requestAnimationFrame(frame);
