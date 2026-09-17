import {build,detectorProfile} from './spherical-field.js?v=43.1';
self.onmessage=({data})=>{
 try{
  const {p,options}=data,table=build(p,options),profile=detectorProfile(table);
  // The diagnostic is retained, not silently clipped into a probability law.
  if(profile.negativeFraction>.001)throw new Error('Appreciable detector backflow: this geometry needs a detector model beyond first outward crossings.');
  delete profile.timeFlux;
  const transfers=[...table.components,...table.edge,...table.screen,...table.radial,table.xs,table.ys].map(a=>a.buffer);
  self.postMessage({table,profile},transfers);
 }catch(error){self.postMessage({error:error.message});}
};
