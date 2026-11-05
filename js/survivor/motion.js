'use strict';
module.exports=function createMotion(options={}){
 if(!options.buffered)return require('./motion-legacy')(options);
 let frames=[],scene=null,tracks=[],pair='',clock=null,lastNow=0;
 function reset(){frames=[];scene=null;tracks=[];pair='';clock=null;lastNow=0;}
 function push(world,now){
 if(!frames.length||frames[0].world.id!==world.id)reset();
 if(frames.length&&world.time<=frames.at(-1).world.time){if(world.status==='playing')return;frames=[];pair='';}
 frames.push({world,at:now});if(frames.length>8)frames.shift();
 if(clock===null){clock=world.time-.12;lastNow=now;}
 }
 function sample(now){
 if(!frames.length)return null;
 const latest=frames.at(-1),dt=Math.max(0,Math.min(.1,(now-lastNow)/1000));lastNow=now;
 const target=latest.world.time+Math.min(.2,Math.max(0,now-latest.at)/1000)-.12;
 // A continuous playback clock avoids restarting a lerp on every packet.
 clock+=dt*Math.max(.9,Math.min(1.1,1+(target-clock)*.5));
 clock=Math.min(clock,latest.world.time+.05);
 let a=frames[0],b=a;
 for(let i=1;i<frames.length;i++){b=frames[i];if(b.world.time>=clock)break;a=b;}
 if(clock>=latest.world.time){b=latest;a=frames.length>1?frames[frames.length-2]:latest;}
 const key=a.world.time+':'+b.world.time+':'+latest.world.time+':'+latest.world.status;
 if(key!==pair){pair=key;tracks=[];scene={...latest.world};
 for(const kind of ['players','enemies','shots']){
 const older=new Map(a.world[kind].map(p=>[p.id,p]));
 scene[kind]=b.world[kind].map(p=>{const item={...p},from=older.get(p.id);
 if(from&&latest.world.status==='playing'&&Math.hypot(from.x-p.x,from.y-p.y)<100)tracks.push({item,from,to:p});
 return item;});
 }}
 const span=b.world.time-a.world.time,alpha=span>0?Math.max(0,Math.min(1+.05/span,(clock-a.world.time)/span)):1;
 for(const t of tracks){t.item.x=t.from.x+(t.to.x-t.from.x)*alpha;t.item.y=t.from.y+(t.to.y-t.from.y)*alpha;}
 scene.time=Math.max(0,Math.min(clock,latest.world.time+.05));
 return scene;
 }
 return {push,sample,reset};
};
