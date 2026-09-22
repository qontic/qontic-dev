import { mountDistanceScale, mountValueRange } from '../../shared/qontic-overlays.js?v=4';
let demoRange={lower:0,upper:1};
import { mountQonticMedia } from '../../shared/qontic-media.js?v=3.0';
import { mountExpandedResize } from '../../shared/qontic-expanded-resize.js?v=1';
import { mountQonticShortcuts } from '../../shared/qontic-shortcuts.js?v=1';
import { mountQonticShell } from '../../shared/qontic-shell.js?v=resources-20260916';
import { mountQonticControls } from './qontic-controls.js?v=3.0';
mountQonticShell({compactHeader:true,navigation:'breadcrumbs',title:'Functional Simulation Template',eyebrow:'Q-Ontic template library',purpose:'Define a common functional interface for Q-Ontic simulations while allowing each app to connect its own scientific model.',badge:'Canonical starter',version:'Template 3.0 · Shared layout and interactions',homeHref:'../../index.html',labHref:'https://qonticlab.rice.edu/'});
const tabs=document.querySelector('.tabs');tabs.addEventListener('click',event=>{const button=event.target.closest('[data-view]');if(!button)return;tabs.querySelectorAll('button').forEach(item=>item.classList.toggle('active',item===button));document.querySelectorAll('[data-panel]').forEach(panel=>panel.classList.toggle('hidden',panel.dataset.panel!==button.dataset.view));});
const canvas=document.querySelector('.demo-canvas'),ctx=canvas.getContext('2d');let running=true,autoRerun=true,time=0,speed=1,seed=.22,interpretation='orthodox';
const ui=mountQonticControls({onStart:()=>running=true,onStop:()=>running=false,onReset:()=>{time=0;seed=.22;running=false;},onAutorun:event=>autoRerun=event.autoRerun,onInterpretation:event=>interpretation=event.interpretation,onControlchange:event=>{if(event.name==='speed')speed=event.value;}});
function frame(){const ratio=devicePixelRatio||1,width=canvas.clientWidth,height=canvas.clientHeight;if(canvas.width!==width*ratio||canvas.height!==height*ratio){canvas.width=width*ratio;canvas.height=height*ratio;}ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);for(let i=0;i<64;i++){const level=Math.max(0,Math.min(1,(i/63-demoRange.lower)/(demoRange.upper-demoRange.lower)));ctx.fillStyle='rgb('+Math.round(30+level*70)+','+Math.round(55+level*165)+','+Math.round(80+level*165)+')';ctx.fillRect(width*.25+i*width*.7/64,height-42,width*.7/64+1,22);}ctx.strokeStyle='#1d4358';ctx.beginPath();ctx.moveTo(30,height*.55);ctx.lineTo(width-30,height*.55);ctx.stroke();if(running){time+=.008*speed;if(time>=1){if(autoRerun){time=0;seed=.12+Math.random()*.7}else{time=1;running=false;ui.setRunning(false)}}}const x=40+(width-80)*Math.min(1,time),y=height*.55+Math.sin(time*12+seed*4)*45;ctx.fillStyle=interpretation==='pilot-wave'?'#fff':interpretation==='many-worlds'?'#e2b52e':'#62dce8';ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();ui.setResult('time',time.toFixed(1));ui.setResult('outcome',interpretation==='pilot-wave'?'trajectory':interpretation==='many-worlds'?'both branches':'pending');requestAnimationFrame(frame);}requestAnimationFrame(frame);

const canvasHost=document.createElement('div');canvasHost.style.position='relative';canvas.before(canvasHost);canvasHost.append(canvas);
const demoScale=mountDistanceScale({host:canvasHost,getUnitsPerPixel:()=>({x:10/canvas.clientWidth,y:6/canvas.clientHeight}),format:value=>Number(value.toPrecision(2))+' units'});
const rangePanel=document.createElement('div');rangePanel.className='qontic-range-panel';rangePanel.style.cssText='left:12px;bottom:12px;height:152px';canvasHost.append(rangePanel);
const rangeHost=document.createElement('div');rangeHost.style.cssText='position:absolute;left:0;bottom:0;height:120px';rangePanel.append(rangeHost);
const demoRangeControl=mountValueRange({host:rangeHost,label:'demo intensity range',movableContainer:rangePanel,onChange:value=>demoRange=value});
demoRangeControl.setState({min:0,max:1,lower:0,upper:1});
mountQonticMedia({
  stage:document.querySelector('.visualization'), controls:document.querySelector('qontic-controls'),
  getCanvases:()=>[canvas,demoScale.canvas], scaleControl:demoScale, rangeControl:demoRangeControl, filename:'qontic-template', headerTools:false,
  beginRecording:()=>{const previous=running;running=true;ui.setRunning(true);return previous;},
  endRecording:previous=>{running=previous;ui.setRunning(previous);}
});
mountExpandedResize({container:document.querySelector('.visualization'),storageKey:'qontic-template-expanded-size'});
mountQonticShortcuts({
  togglePlayback:()=>{running=!running;ui.setRunning(running);},
  reset:()=>{time=0;seed=.22;running=false;ui.setRunning(false);},
  screenshot:()=>document.querySelector('.visualization .qontic-media-toolbar button[aria-label="Screenshot"]')?.click(),
});
