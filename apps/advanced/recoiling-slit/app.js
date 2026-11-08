import '../../../shared/qontic-controls.js?v=3.2';
import {mountQonticShell} from '../../../shared/qontic-shell.js?v=3.7';
import {mountQonticMedia} from '../../../shared/qontic-media.js?v=3.8';
import {visibility,portProbability,recoilDensities,sampleEvent} from './physics.mjs?v=0.2.0';
import {atomWave,outputWaves,branchWave,norm2,photonMode,stageOf,displayedPorts} from './waves.mjs?v=0.2.0';
import {APP_RELEASE} from './release.js?v=0.2.0';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
mountQonticShell({title:'Einstein’s Recoiling Slit',eyebrow:'Q-Ontic · Advanced',navigation:'breadcrumbs',badge:'Research example · Wave model',purpose:'A photon, an atom, and three views of measurement',version:`Recoiling slit · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,homeHref:'../../../index.html'});
$$('[data-view]').forEach(button=>button.setAttribute('aria-label',button.textContent.trim()));
const controls=$('qontic-controls'),canvas=$('#stage'),ctx=canvas.getContext('2d');
controls.setAttribute('theme','dark');
const state={r:1,phase:0,view:'cpn',running:false,repeat:true,speed:1,scan:false,read:false,theory:true,stats:false,quantity:'re',n:0,plus:0,atomN:0,bins:new Array(40).fill(0),event:null,follow:null,progress:.04,hold:0,prediction:null};
const dark={text:'#e1eaf4',muted:'#a4b9cc',grid:'#294054',a:'#74d8ce',b:'#edbc77',purple:'#b7a6f5',bg:'#0c1928',panel:'#102032',bar:'#21364b'};
const C={...dark};
const viewNames={cpn:'Orthodox',pw:'Pilot Wave',mw:'Many Worlds'};
const stageDescriptions=[
  'Prepare: a light packet approaches the trapped atom. The atom starts in one Gaussian momentum wave.',
  'Scatter: the two light paths become correlated with different recoil waves of the atom. Matching colors show the pairing.',
  'Recombine: the beam splitter adds and subtracts the paired wave amplitudes. The right plot keeps the atom momentum coordinate.',
  'Detect: the output amplitudes are correlated with separate detector records. Compare the three views using this same event.'
];
const viewDescriptions={
  cpn:['The joint wave evolves before measurement.','The joint wave evolves before measurement.','Both outputs are still present before measurement.','One outcome is recorded. Collapse leaves its normalized conditional atom wave.'],
  pw:['The quantum wave guides a definite physical configuration.','Both correlated wave components remain in the guiding state.','The joint wave determines the same output probabilities.','One definite detector record is highlighted; both wave components are retained. Guidance dynamics are not solved here.'],
  mw:['The whole quantum state evolves without collapse.','These correlated components are not yet separate classical detector records.','Both output components remain; there is no collapse.','Both nonzero-weight detector branches remain. The highlight follows one Born-weighted observer history.']
};
let width=900,height=646,previous=0;
function stop(){state.running=false;controls.setAttribute('running','false');}
function setScan(scan){state.scan=scan;$('#scan').checked=scan;if(scan)stop();}
function newPacket(){state.progress=.04;state.hold=0;state.event=null;state.follow=null;}
function clear(){stop();setScan(false);state.n=state.plus=state.atomN=0;state.bins.fill(0);newPacket();update();}
function start(repeat=true){setScan(false);if(state.progress>=1)newPacket();state.repeat=repeat;state.running=true;controls.setAttribute('running','true');update();}
function detect(){
  const e=sampleEvent(state.r,state.phase);state.n++;if(e.port===1)state.plus++;
  e.readout=state.read;state.event=e;state.follow=e.port;
  if(state.read){state.atomN++;const i=Math.floor((e.u+8)/16*40);if(i>=0&&i<40)state.bins[i]++;}
}
function stepTo(index){stop();setScan(false);state.progress=[.04,.4,.78,1][index];state.hold=0;if(index<3){state.event=null;state.follow=null;}else if(!state.event)detect();update();}
function update(){
  const step=stageOf(state.progress);
  $('#recoilOut').textContent=`${state.r.toFixed(2)} σₚ`;$('#phaseOut').textContent=`${Math.round(state.phase*180/Math.PI)}°`;
  $('#visibility').textContent=`${(100*visibility(state.r)).toFixed(1)}%`;$('#probability').textContent=`${(100*portProbability(state.r,state.phase)).toFixed(1)}%`;
  $('#total').textContent=state.n.toLocaleString();$('#observed').textContent=state.n?`${(100*state.plus/state.n).toFixed(1)}%`:'—';
  $$('[data-r]').forEach(b=>{const selected=Math.abs(+b.dataset.r-state.r)<.001;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  $$('[data-step]').forEach(b=>{const selected=+b.dataset.step===step;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  $('#stageText').textContent=stageDescriptions[step];$('#viewName').textContent=viewNames[state.view];$('#viewText').textContent=viewDescriptions[state.view][step];
  $('#branchActions').hidden=state.view!=='mw'||step!==3;
  $$('[data-follow]').forEach(b=>{const port=+b.dataset.follow,p=port===1?portProbability(state.r,state.phase):1-portProbability(state.r,state.phase);b.disabled=p<1e-14;b.classList.toggle('selected',state.follow===port);b.setAttribute('aria-pressed',String(state.follow===port));});
  $('#summary').textContent=`${viewNames[state.view]}. ${stageDescriptions[step]} Recoil separation ${state.r.toFixed(2)} sigma p. Visibility ${(100*visibility(state.r)).toFixed(1)} percent. ${state.n} photon detections: ${state.plus} D plus, ${state.n-state.plus} D minus.${state.event?` Current sampled record D ${state.event.port===1?'plus':'minus'}.`:''} ${viewDescriptions[state.view][step]}`;
}
$('#recoil').oninput=e=>{state.r=+e.target.value;clear();};
$$('[data-r]').forEach(b=>b.onclick=()=>{state.r=+b.dataset.r;$('#recoil').value=state.r;clear();});
$('#phase').oninput=e=>{setScan(false);state.phase=+e.target.value*Math.PI/180;clear();};
$('#scan').onchange=e=>{const checked=e.target.checked;if(checked){clear();state.progress=.78;}setScan(checked);update();};
$('#readout').onchange=e=>{state.read=e.target.checked;update();};
$('#waveQuantity').onchange=e=>{state.quantity=e.target.value;};
$('#stats').onchange=e=>{state.stats=e.target.checked;resize();};
$('#theory').onchange=e=>{state.theory=e.target.checked;};
$('#one').onclick=()=>{stop();newPacket();start(false);};
$('#thousand').onclick=()=>{stop();setScan(false);for(let i=0;i<1000;i++)detect();state.progress=1;update();};
$$('[data-step]').forEach(b=>b.onclick=()=>stepTo(+b.dataset.step));
$$('[data-follow]').forEach(b=>b.onclick=()=>{state.follow=+b.dataset.follow;update();});
controls.addEventListener('qontic:start',()=>start());controls.addEventListener('qontic:stop',stop);
controls.addEventListener('qontic:reset',()=>{setScan(false);clear();});
controls.addEventListener('qontic:speed',e=>{state.speed=e.detail.speed;});
controls.addEventListener('qontic:interpretation',e=>{state.view=e.detail.interpretation;update();});
controls.addEventListener('qontic:theme',e=>{const light=e.detail.theme==='light';document.body.dataset.theme=light?'light':'dark';Object.assign(C,light?{text:'#182c3e',muted:'#4c6376',grid:'#c8d7e1',a:'#007c70',b:'#9f5d00',purple:'#6c47ad',bg:'#eef4f7',panel:'#ffffff',bar:'#dae5eb'}:dark);});
controls.addEventListener('qontic:tab',e=>{$$('[data-control-pane]').forEach(p=>p.hidden=p.dataset.controlPane!==e.detail.tab);});
$$('[data-view]').forEach(b=>b.onclick=()=>{$$('[data-view]').forEach(x=>x.classList.toggle('active',x===b));$$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==b.dataset.view);if(b.dataset.view!=='sim'){stop();setScan(false);}else resize();});
$$('[data-answer]').forEach(b=>b.onclick=()=>{state.prediction=b.dataset.answer;$$('[data-answer]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#feedback').textContent=state.prediction==='down'?'Correct. Less overlap between the atom waves gives lower fringe visibility.':'Wrong for this model. Less overlap between the atom waves gives lower fringe visibility. Try the presets.';});
document.addEventListener('keydown',e=>{if(e.target.closest('input,button,select,textarea')||e.ctrlKey||e.metaKey||e.altKey||$('[data-panel="sim"]').hidden)return;if(e.code==='Space'){e.preventDefault();state.running?stop():start();}if(e.key.toLowerCase()==='r'){setScan(false);clear();}});
mountQonticMedia({stage:$('.visualization'),controls,getCanvases:()=>[canvas],filename:'einstein-recoiling-slit',beginRecording:()=>{const token={running:state.running,repeat:state.repeat,scan:state.scan};if(!state.running&&!state.scan)start(false);return token;},endRecording:token=>{stop();setScan(token.scan);if(token.running)start(token.repeat);}});
function resize(){const w=canvas.parentElement.clientWidth;if(w<1)return;width=w;height=(w<620?876:646)+(state.stats?(w<620?450:240):0);const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.height=`${height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
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
  const w=width;panel(12,12,w-24,224,'The light packet and its paired atom waves','Optical ripples: mode amplitudes · outputs: probability envelopes');
  const source=[w*.07,130],atom=[w*.25,130],upper=[w*.45,87],lower=[w*.45,173],bs=[w*.7,130],plus=[w*.9,87],minus=[w*.9,173];
  const paths=[[source,atom],[atom,upper,bs],[atom,lower,bs],[bs,plus],[bs,minus]];
  paths.forEach(p=>line(p,C.grid,2));
  opticalWave(paths[0],0,.18,C.text);opticalWave(paths[1],.18,.65,C.a,0,1/Math.SQRT2);opticalWave(paths[2],.18,.65,C.b,state.phase,1/Math.SQRT2);
  const p=portProbability(state.r,state.phase);opticalWave(paths[3],.65,.91,C.purple,0,Math.sqrt(p),true);opticalWave(paths[4],.65,.91,C.muted,0,Math.sqrt(1-p),true);
  circle(...source,5,C.text);circle(...atom,10,C.a);ctx.fillStyle=C.purple;ctx.fillRect(bs[0]-5,bs[1]-12,10,24);
  text('Source',source[0],158,11,C.muted,'center');text('Atom',atom[0],158,11,C.a,'center');text('A ↔ a',upper[0],72,11,C.a,'center');text('B ↔ b',lower[0],197,11,C.b,'center');text('φ',w*.56,186,13,C.b,'center');
  fitText('Beam splitter',bs[0]-40,158,100,10);text('D₊',plus[0]+12,91,12,C.purple);text('D₋',minus[0]+12,177,12,C.muted);
  for(const [port,pos] of [[1,plus],[-1,minus]]){const active=stageOf(state.progress)===3&&(state.view==='mw'?((port===1?p:1-p)>1e-14):state.event?.port===port);circle(...pos,active?9:6,active?C.a:(port===1?C.purple:C.muted));}
  text(state.read?'Later recoil readout: on':'Later recoil readout: off',w-26,220,11,state.read?C.a:C.muted,'right');
}
function graphFrame(x,y,w,h,title,subtitle){panel(x,y,w,h,title,subtitle);const left=x+43,right=x+w-17,top=y+66,bottom=y+h-35;const density=state.quantity==='density',max=density?.8:.9,min=density?0:-.9;const py=v=>bottom-(v-min)/(max-min)*(bottom-top),px=u=>left+(u+8)/16*(right-left);for(const v of density?[0,.4,.8]:[-.8,0,.8]){line([[left,py(v)],[right,py(v)]]);text(v.toFixed(1),left-7,py(v)+4,10,C.muted,'right');}line([[left,top],[left,bottom],[right,bottom]],C.muted);for(const u of [-8,-4,0,4,8])text(String(u),px(u),bottom+15,10,C.muted,'center');text('Atom momentum p / σₚ',x+w/2,y+h-5,11,C.muted,'center');text(density?'|wave|²':state.quantity==='re'?'Re(wave)':'Im(wave)',left,top-8,10,C.muted);return {left,right,top,bottom,py,px};}
function graphWave(fn,g,color,dash=[]){const pts=[];for(let i=0;i<=320;i++){const u=-8+i/320*16,z=fn(u);if(!z)continue;const v=state.quantity==='density'?norm2(z):z[state.quantity];pts.push([g.px(u),g.py(v)]);}line(pts,color,2,dash);}
function atomTime(){return Math.max(0,Math.min(.6,(state.progress-.18)/(.91-.18)*.6));}
function recoilPlot(x,y,w,h){const scattered=stageOf(state.progress)>0,tau=atomTime();const g=graphFrame(x,y,w,h,stageOf(state.progress)===3?'Recoil waves: before detection':scattered?'Atom waves paired with A and B':'Initial atom wave',scattered?'a: teal · b: gold · each has norm 1':'One Gaussian wave before scattering');
  if(scattered&&state.read&&state.atomN&&state.quantity==='density'){ctx.fillStyle='#95a6b566';const bw=(g.right-g.left)/40;state.bins.forEach((n,i)=>{const v=n/state.atomN/.4,top=Math.max(g.top,g.py(v));ctx.fillRect(g.left+i*bw,top,bw-1,g.bottom-top);});}
  graphWave(u=>atomWave(u,scattered?state.r:0,-1,tau),g,scattered?C.a:C.muted);if(scattered)graphWave(u=>atomWave(u,state.r,1,tau),g,C.b);
  if(state.read&&state.event?.readout&&(state.view!=='mw'||state.follow===state.event.port)&&Math.abs(state.event.u)<=8){const xx=g.px(state.event.u);line([[xx,g.top],[xx,g.bottom]],C.muted,1,[3,4]);}
}
function outputPlot(x,y,w,h){const stage=stageOf(state.progress),collapsed=stage===3&&state.view==='cpn'&&state.event;
  const subtitle=collapsed?`Recorded D${state.event.port===1?'₊':'₋'} · conditional atom wave, norm 1`:'χ₊: violet · χ₋: gray · squared norms = P(D±)';
  const g=graphFrame(x,y,w,h,stage===3?'Waves paired with detector records':'Joint output waves',stage<2?'Follow the packet to the beam splitter':subtitle);
  if(stage<2){fitText('Recombination comes next.',g.left+8,(g.top+g.bottom)/2,w-80,12);return;}
  for(const port of displayedPorts(state.view,stage===3?state.event?.port??null:null))graphWave(u=>collapsed?branchWave(u,state.r,state.phase,port,atomTime()):outputWaves(u,state.r,state.phase,atomTime())[port===1?0:1],g,port===1?C.purple:C.muted);
}
function records(x,y,w,h){const stage=stageOf(state.progress),p=portProbability(state.r,state.phase),title=stage<3?'Detector records: not formed yet':state.view==='cpn'?'One recorded outcome · collapse':state.view==='pw'?'One definite record · guiding wave retained':'Two detector-record branches · no collapse';panel(x,y,w,h,title,stage<3?'Click Detect or run One photon.':state.view==='pw'?'Curves: conditional atom density · record sampled, no guidance solver.':state.view==='mw'?'Curves: conditional atom density · highlight follows one history.':'Curve: normalized conditional atom density after collapse.');
  const gap=10,cw=(w-38)/2,cy=y+58,ch=h-69;
  for(const [i,port] of [[0,1],[1,-1]]){const weight=port===1?p:1-p,cx=x+14+i*(cw+gap),selected=state.follow===port,removed=stage===3&&state.view==='cpn'&&state.event?.port!==port;
    ctx.fillStyle=C.bg;ctx.fillRect(cx,cy,cw,ch);ctx.strokeStyle=selected&&stage===3?C.a:C.grid;ctx.lineWidth=selected&&stage===3?2:1;ctx.strokeRect(cx,cy,cw,ch);
    text(`D${port===1?'₊':'₋'}`,cx+10,cy+19,13,port===1?C.purple:C.muted);fitText(stage<3?'Awaiting record':weight<1e-14?'Zero weight':removed?'Removed by collapse':state.view==='mw'?`Weight ${(weight*100).toFixed(1)}%`:selected?'Recorded':'Other wave component',cx+40,cy+19,cw-48,11,selected?C.a:C.muted);
    if(stage===3&&!removed&&weight>=1e-14){const pts=[];for(let j=0;j<=140;j++){const u=-8+j/140*16,z=branchWave(u,state.r,state.phase,port,atomTime());pts.push([cx+8+j/140*(cw-16),cy+ch-8-(z?norm2(z):0)*(ch-36)]);}line(pts,port===1?C.purple:C.muted,1.5);}
  }
}
function fringePlot(x,y,w,h){panel(x,y,w,h,'Photon interference','Change phase to reveal the fringe');const left=x+43,right=x+w-17,top=y+63,bottom=y+h-35,pw=right-left,ph=bottom-top;for(const p of [0,.5,1]){const yy=bottom-p*ph;line([[left,yy],[right,yy]]);text(p.toFixed(1),left-7,yy+4,10,C.muted,'right');}if(state.theory){const pts=[];for(let i=0;i<=240;i++)pts.push([left+i/240*pw,bottom-portProbability(state.r,i/240*2*Math.PI)*ph]);line(pts,C.purple,2.5);}const current=left+state.phase/(2*Math.PI)*pw;line([[current,top],[current,bottom]],C.a,1,[4,4]);if(state.theory)circle(current,bottom-portProbability(state.r,state.phase)*ph,4,C.a);if(state.n)circle(current,bottom-state.plus/state.n*ph,4,C.text);line([[left,top],[left,bottom],[right,bottom]],C.muted);for(const deg of [0,90,180,270,360])text(`${deg}°`,left+deg/360*pw,bottom+15,10,C.muted,'center');text('Path phase φ',x+w/2,y+h-5,11,C.muted,'center');text('P(D₊)',left,top-5,10,C.muted);}
function counts(x,y,w,h){panel(x,y,w,h,'Photon detections',`${state.n.toLocaleString()} samples of an observer history`);const left=x+45,right=x+w-55,bw=right-left;for(let k=0;k<2;k++){const yy=y+75+k*45,p=k===0?portProbability(state.r,state.phase):1-portProbability(state.r,state.phase),n=k===0?state.plus:state.n-state.plus;ctx.fillStyle=C.bar;ctx.fillRect(left,yy,bw,20);if(state.n){ctx.fillStyle=k===0?C.purple:C.muted;ctx.fillRect(left,yy,bw*n/state.n,20);}if(state.theory){const xx=left+bw*p;line([[xx,yy-3],[xx,yy+23]],C.a,2);}text(k===0?'D₊':'D₋',left-29,yy+14,12);text(n.toLocaleString(),right+8,yy+14,12);}fitText('Bars: sample · green marks: prediction',x+14,y+h-15,w-28,11);}
function draw(){ctx.fillStyle=C.bg;ctx.fillRect(0,0,width,height);apparatus();const narrow=width<620,half=(width-36)/2;if(narrow){recoilPlot(12,248,width-24,230);outputPlot(12,490,width-24,230);records(12,732,width-24,132);}else{recoilPlot(12,248,half,230);outputPlot(24+half,248,half,230);records(12,490,width-24,144);}
  if(state.stats){const y=narrow?888:658;if(narrow){fringePlot(12,y,width-24,215);counts(12,y+227,width-24,211);}else{fringePlot(12,y,half,228);counts(24+half,y,half,228);}}}
function frame(t){const dt=Math.min(.05,(t-(previous||t))/1000);previous=t;if(state.scan){state.phase=(state.phase+dt*.8)%(2*Math.PI);$('#phase').value=state.phase*180/Math.PI;update();}if(state.running){if(state.progress<1){state.progress=Math.min(1,state.progress+dt*state.speed/6);if(stageOf(state.progress)===3&&!state.event)detect();if(state.progress===1&&!state.repeat)stop();}else{state.hold+=dt;if(state.hold>=1.5)newPacket();}update();}draw();requestAnimationFrame(frame);}
update();resize();requestAnimationFrame(frame);
