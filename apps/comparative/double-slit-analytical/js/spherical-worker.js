import {createPacketCache} from './packet-cache.js?v=44';
import {build,detectorProfile,synthesize} from './spherical-field.js?v=44';
self.onmessage=({data})=>{
 try{
  const {p,options}=data,table=build(p,options),profile=detectorProfile(table);
  // The diagnostic is retained, not silently clipped into a probability law.
  if(profile.negativeFraction>.001)throw new Error('Appreciable detector backflow: this geometry needs a detector model beyond first outward crossings.');
  delete profile.timeFlux;
  self.postMessage({progress:"Caching packet playback…"});
  table.cache=createPacketCache(table,synthesize);
  table.components=null;
  const buffers=[...table.edge,...table.screen,...table.radial,table.xs,table.ys];
  for(const f of table.cache.frames)for(const key of ["values","radial","edge","screen"])buffers.push(...f[key]);
  const transfers=buffers.map(a=>a.buffer);
  self.postMessage({table,profile},transfers);
 }catch(error){self.postMessage({error:error.message});}
};
