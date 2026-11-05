'use strict';
// Presentation-only interpolation. Never changes authoritative combat state.
module.exports=function createMotion({extrapolate=false}={}){
 let scene=null,tracks=[],at=0,duration=100;
 function sample(now){if(!scene)return null;const elapsed=Math.max(0,now-at),a=Math.min(1,elapsed/duration);for(const t of tracks){t.item.x=t.x+(t.tx-t.x)*a;t.item.y=t.y+(t.ty-t.y)*a;if(extrapolate&&t.mobile&&elapsed>duration){const extra=Math.min(50,elapsed-duration)/duration;t.item.x+=(t.tx-t.x)*extra;t.item.y+=(t.ty-t.y)*extra;}}scene.time=scene.serverTime+Math.min(elapsed,150)/1000;return scene;}
 function push(world,now){const previous=scene&&scene.id===world.id?sample(now):null;duration=previous?Math.max(50,Math.min(150,now-at)):100;at=now;tracks=[];scene={...world,serverTime:world.time};
 for(const key of ['players','enemies','shots']){const old=new Map(previous?previous[key].map(p=>[p.id,p]):[]);scene[key]=world[key].map(p=>{const item={...p},from=old.get(p.id);if(from&&world.status==='playing'&&Math.hypot(from.x-p.x,from.y-p.y)<100){tracks.push({item,mobile:key!=='enemies',x:from.x,y:from.y,tx:p.x,ty:p.y});item.x=from.x;item.y=from.y;}return item;});}
 return scene;
 }
 return {push,sample,reset(){scene=null;tracks=[];at=0;}};
};
