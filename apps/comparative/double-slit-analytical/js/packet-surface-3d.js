import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const X_MIN=-2,X_MAX=2,Y_MIN=-1.5,Y_MAX=1.5,SURFACE_HEIGHT=.72;

function color(value,fallback='#ffffff'){
 try{return new THREE.Color(value||fallback);}catch{return new THREE.Color(fallback);}
}

function line(points,material){
 const geometry=new THREE.BufferGeometry().setFromPoints(points);
 return new THREE.Line(geometry,material);
}

function lines(positions,colors=null,opacity=1){
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 if(colors)geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 return new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:colors?0xffffff:0xb9dbe7,vertexColors:!!colors,transparent:opacity<1,opacity}));
}

function disposeObject(object){
 object.traverse(child=>{
  child.geometry?.dispose();
  if(Array.isArray(child.material))child.material.forEach(item=>item.dispose());
  else child.material?.dispose();
 });
 object.removeFromParent();
}

export function mountPacketSurface3D({host}){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 renderer.setClearColor(0x0a1723,1);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.domElement.className='packet-surface-webgl';
 renderer.domElement.setAttribute('aria-label','Interactive three-dimensional wave graph');
 host.append(renderer.domElement);

 const scene=new THREE.Scene();
 scene.fog=new THREE.Fog(0x0a1723,6.5,12);
 const camera=new THREE.PerspectiveCamera(38,4/3,.01,50);
 camera.up.set(0,0,1);
 const controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=3;controls.maxDistance=12;
 controls.target.set(.15,0,.18);
 let visible=false,lastState=null,frame=0,recordObjects=[];

 const resetCamera=()=>{camera.position.set(5.25,-4.9,3.65);controls.target.set(.15,0,.18);controls.update();render();};
 resetCamera();

 scene.add(new THREE.HemisphereLight(0xcceeff,0x102532,1.9));
 const key=new THREE.DirectionalLight(0xffffff,1.35);key.position.set(-3,-4,7);scene.add(key);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(4.45,3.35),new THREE.MeshPhongMaterial({color:0x173344,transparent:true,opacity:.76,side:THREE.DoubleSide}));
 floor.position.set(.12,0,-.025);scene.add(floor);
 const grid=new THREE.GridHelper(4.4,16,0x4a7c90,0x294e60);grid.rotation.x=Math.PI/2;grid.position.set(.1,0,-.018);grid.material.transparent=true;grid.material.opacity=.46;scene.add(grid);

 const dynamic=new THREE.Group();scene.add(dynamic);
 const overlay=document.createElement('div');overlay.className='packet-surface-help';overlay.innerHTML='<span>Drag: rotate · Wheel/pinch: zoom · Right-drag: pan</span><button type="button" title="Reset 3D camera">Reset view</button>';
 overlay.querySelector('button').addEventListener('click',resetCamera);host.append(overlay);
 renderer.domElement.addEventListener('dblclick',resetCamera);

 function render(){if(!visible)return;renderer.render(scene,camera);}
 controls.addEventListener('change',render);
 function animate(){frame=0;if(!visible)return;controls.update();render();if(controls.enableDamping)frame=requestAnimationFrame(animate);}
 function resize(){const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render();}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();

 function sampleHeight(state,u,v){
  if(!state.heights)return 0;
  const i=Math.max(0,Math.min(state.gridWidth-1,Math.round(u*state.fieldFraction*(state.gridWidth-1))));
  const j=Math.max(0,Math.min(state.gridHeight-1,Math.round(v*(state.gridHeight-1))));
  return state.heights[j*state.gridWidth+i]||0;
 }
 const world=(u,v,z=0)=>new THREE.Vector3(X_MIN+u*(X_MAX-X_MIN),Y_MAX-v*(Y_MAX-Y_MIN),z);

 function addWave(state){
  if(!state.showWave||!state.heights)return;
  const cols=96,rows=64,geometry=new THREE.PlaneGeometry(X_MAX-X_MIN,Y_MAX-Y_MIN,cols,rows);
  const positions=geometry.attributes.position,colors=new Float32Array(positions.count*3),rgba=state.rgba;
  for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
   const n=row*(cols+1)+col,u=col/cols,v=row/rows;
   const i=Math.min(state.gridWidth-1,Math.round(u*state.fieldFraction*(state.gridWidth-1))),j=Math.min(state.gridHeight-1,Math.round(v*(state.gridHeight-1))),source=j*state.gridWidth+i;
   positions.setZ(n,sampleHeight(state,u,v)*SURFACE_HEIGHT);
   const visibility=(rgba[4*source+3]||0)/255,base=[.055,.13,.18];
   colors[3*n]=base[0]+visibility*((rgba[4*source]||75)/255-base[0]);colors[3*n+1]=base[1]+visibility*((rgba[4*source+1]||150)/255-base[1]);colors[3*n+2]=base[2]+visibility*((rgba[4*source+2]||190)/255-base[2]);
  }
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,new THREE.MeshPhongMaterial({vertexColors:true,transparent:true,opacity:.88,side:THREE.DoubleSide,shininess:38}));
  mesh.userData.wave=true;
  dynamic.add(mesh);
  const wire=new THREE.Mesh(geometry.clone(),new THREE.MeshBasicMaterial({color:0xd8f5ff,wireframe:true,transparent:true,opacity:.075}));wire.userData.wave=true;dynamic.add(wire);
 }

 function addWall(state){
  if(!state.showScreen)return;
  const x=X_MIN+state.wallFraction*(X_MAX-X_MIN),openings=[...state.openings].sort((a,b)=>a[0]-b[0]);let cursor=0;
  const addSegment=(top,bottom,opacity=1)=>{
   if(bottom<=top)return;
   const yTop=Y_MAX-top*(Y_MAX-Y_MIN),yBottom=Y_MAX-bottom*(Y_MAX-Y_MIN),height=.18;
   const mesh=new THREE.Mesh(new THREE.BoxGeometry(.055,yTop-yBottom,height),new THREE.MeshPhongMaterial({color:0xd9edf4,transparent:opacity<1,opacity}));
   mesh.position.set(x,(yTop+yBottom)/2,height/2);dynamic.add(mesh);
  };
  openings.forEach(([top,bottom],index)=>{addSegment(cursor,top);const transmission=state.apertureWeights[index]??1;if(transmission<1)addSegment(top,bottom,1-transmission);cursor=Math.max(cursor,bottom);});addSegment(cursor,1);
  const edgePositions=[];for(const [top,bottom] of openings)for(const v of [top,bottom]){const y=Y_MAX-v*(Y_MAX-Y_MIN);edgePositions.push(x-.12,y,.185,x+.12,y,.185);}dynamic.add(lines(edgePositions,null,.9));
  if(state.whichPathFraction!==null){const marker=new THREE.Mesh(new THREE.BoxGeometry(.13,.13,.22),new THREE.MeshPhongMaterial({color:0xffd54a}));marker.position.set(x-.10,Y_MAX-state.whichPathFraction*(Y_MAX-Y_MIN),.18);dynamic.add(marker);}
 }

 function addDetector(state){
  if(!state.showDetector)return;
  const x=X_MAX+.04,base=.08;
  const wall=new THREE.Mesh(new THREE.BoxGeometry(.075,Y_MAX-Y_MIN,.16),new THREE.MeshPhongMaterial({color:color(state.detectorColor),transparent:true,opacity:.68}));wall.position.set(x,0,.08);dynamic.add(wall);
  if(state.showProbability&&state.probability.length){
   const step=Math.max(1,Math.ceil(state.probability.length/300)),points=[];
   for(let i=0;i<state.probability.length;i+=step){const v=i/(state.probability.length-1);points.push(world(1.015,v,base+.9*state.probability[i]));}
   const probability=line(points,new THREE.LineBasicMaterial({color:color(state.probabilityColor),linewidth:2}));dynamic.add(probability);recordObjects.push(probability);
  }
  if(!state.showHits)return;
  const pointPositions=[],pointColors=[],errorPositions=[],errorColors=[];
  for(let i=0;i<state.hits.length;i++){
   if(!state.hits[i])continue;
   const v=(i+.5)/state.hits.length,y=Y_MAX-v*(Y_MAX-Y_MIN),z=base+.9*state.hitHeights[i],e=.9*state.hitErrors[i],c=color(state.hitColors[i]);
   pointPositions.push(x+.055,y,z);pointColors.push(c.r,c.g,c.b);
   errorPositions.push(x+.055,y,Math.max(base,z-e),x+.055,y,z+e);errorColors.push(c.r,c.g,c.b,c.r,c.g,c.b);
  }
  if(pointPositions.length){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pointPositions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(pointColors,3));const points=new THREE.Points(geometry,new THREE.PointsMaterial({size:.065,sizeAttenuation:true,vertexColors:true}));dynamic.add(points);recordObjects.push(points);}
  if(errorPositions.length){const errors=lines(errorPositions,errorColors,.95);dynamic.add(errors);recordObjects.push(errors);}
 }

 function addParticles(state){
  const trailPositions=[],trailColors=[],pointPositions=[],pointColors=[];
  if(state.showTrajectories)for(const trail of state.trails){const c=color(trail.color);for(let i=1;i<trail.points.length;i++){
   const a=trail.points[i-1],b=trail.points[i],az=sampleHeight(state,a[0],a[1])*SURFACE_HEIGHT+.035,bz=sampleHeight(state,b[0],b[1])*SURFACE_HEIGHT+.035;
   trailPositions.push(...world(a[0],a[1],az).toArray(),...world(b[0],b[1],bz).toArray());trailColors.push(c.r,c.g,c.b,c.r,c.g,c.b);
  }}
  if(trailPositions.length)dynamic.add(lines(trailPositions,trailColors,.8));
  if(state.showParticles)for(const particle of state.particles){const c=color(particle.color),z=sampleHeight(state,particle.u,particle.v)*SURFACE_HEIGHT+.06;pointPositions.push(...world(particle.u,particle.v,z).toArray());pointColors.push(c.r,c.g,c.b);}
  if(pointPositions.length){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pointPositions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(pointColors,3));dynamic.add(new THREE.Points(geometry,new THREE.PointsMaterial({size:.075,sizeAttenuation:true,vertexColors:true})))}
 }

 function update(state){
  lastState=state;recordObjects=[];while(dynamic.children.length)disposeObject(dynamic.children[0]);
  addWave(state);addWall(state);addDetector(state);addParticles(state);render();
 }
 function setVisible(next){visible=!!next;renderer.domElement.hidden=!visible;overlay.hidden=!visible;if(visible){resize();if(lastState)update(lastState);cancelAnimationFrame(frame);frame=requestAnimationFrame(animate);}else cancelAnimationFrame(frame);}
 function capture(context,width,height,{includeWave=true,includeRecords=false}={}){
  const hidden=[];
  for(const object of dynamic.children){if(!includeWave&&object.userData.wave){hidden.push(object);object.visible=false;}}
  if(!includeRecords)for(const object of recordObjects){hidden.push(object);object.visible=false;}
  renderer.render(scene,camera);context.drawImage(renderer.domElement,0,0,width,height);
  for(const object of hidden)object.visible=true;renderer.render(scene,camera);
 }
 function projectDetector(v,z,width,height){
  const point=new THREE.Vector3(X_MAX+.095,Y_MAX-v*(Y_MAX-Y_MIN),z).project(camera);
  return {x:(point.x+1)*width/2,y:(1-point.y)*height/2};
 }
 function dispose(){cancelAnimationFrame(frame);observer.disconnect();controls.dispose();while(dynamic.children.length)disposeObject(dynamic.children[0]);renderer.dispose();renderer.domElement.remove();overlay.remove();}
 setVisible(false);
 return {update,setVisible,resetCamera,capture,projectDetector,dispose};
}
