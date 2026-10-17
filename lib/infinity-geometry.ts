import type {CSSProperties} from 'react';
type Vec=[number,number,number];
const add=(a:Vec,b:Vec):Vec=>a.map((v,i)=>v+b[i]) as Vec;
const sub=(a:Vec,b:Vec):Vec=>a.map((v,i)=>v-b[i]) as Vec;
const scale=(a:Vec,s:number):Vec=>a.map(v=>v*s) as Vec;
const dot=(a:Vec,b:Vec)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
const cross=(a:Vec,b:Vec):Vec=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=(a:Vec)=>scale(a,1/Math.hypot(...a));
const point=(t:number):Vec=>[180*Math.sin(t),82*Math.sin(2*t),40*Math.cos(t)];
/** Two crossed metallic strips per segment: 96 cached planes, no per-face clipping. */
export const infinitySurfaces:CSSProperties[]=Array.from({length:96},(_,index)=>{
 const segment=Math.floor(index/2),side=index%2,t=segment/48*Math.PI*2,next=(segment+1)/48*Math.PI*2;
 const p=point(t),q=point(next),u=unit(sub(q,p)),normal=unit([-u[1],u[0],0]),binormal=cross(u,normal);
 const angle=side/2*Math.PI,v=add(scale(normal,Math.cos(angle)),scale(binormal,Math.sin(angle))),n=cross(u,v),center=scale(add(p,q),.5);
 const width=Math.hypot(...sub(q,p))+10,height=44;
 const matrix=[...u,0,...v,0,...n,0,...center,1].map(value=>Number(value.toFixed(5))).join(',');
 return {width,height,left:-width/2,top:-height/2,transform:`matrix3d(${matrix})`,'--metal-hue':String(185+Math.sin(t)*45+side*18)} as CSSProperties;
});
