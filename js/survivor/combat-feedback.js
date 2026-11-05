'use strict';
module.exports=function createFeedback(){
 let run=null,previous=new Map(),hits=new Map(),numbers=[],kills=0,chain=0,chainUntil=0;
 function observe(world,now){
 if(run!==world.id){run=world.id;previous=new Map();hits.clear();numbers=[];kills=world.kills;chain=0;chainUntil=0;}
 const next=new Map();
 for(const e of world.enemies){next.set(e.id,e.hp);const hp=previous.get(e.id);if(hp!==undefined&&e.hp<hp){if(hits.size<64||hits.has(e.id))hits.set(e.id,now+140);if(numbers.length<20)numbers.push({x:e.x,y:e.y-e.r-10,value:Math.ceil(hp-e.hp),until:now+500,elite:e.elite||!!e.structure});}}
 previous=next;for(const [id,until] of hits)if(until<=now||!next.has(id))hits.delete(id);
 numbers=numbers.filter(n=>n.until>now);
 const delta=Math.max(0,world.kills-kills);if(delta){chain=(now<chainUntil?chain:0)+delta;chainUntil=now+1800;}kills=world.kills;
 }
 function draw(ctx,now,visible,simple){
 ctx.save();ctx.textAlign='center';let count=0;
 for(const n of numbers){if(n.until<=now||!visible(n)||++count>(simple?8:20))continue;
 const age=(500-(n.until-now))/500;ctx.globalAlpha=Math.min(1,(1-age)*2);ctx.font=(n.elite?'bold 15':'bold 12')+'px sans-serif';const y=n.y-age*24;ctx.fillStyle='#1a101b';ctx.fillText(n.value,n.x+1,y+1);ctx.fillStyle=n.elite?'#ffe296':'#fff4d8';ctx.fillText(n.value,n.x,y);}
 ctx.restore();
 }
 function streak(ctx,W,y,now){if(chain<3||now>=chainUntil)return;ctx.save();ctx.globalAlpha=Math.min(1,(chainUntil-now)/350);ctx.font='bold 17px sans-serif';ctx.textAlign='right';ctx.fillStyle='#ffd084';ctx.fillText(chain+' 连斩',W-18,y);ctx.restore();}
 return {observe,draw,streak,hit:(id,now)=>(hits.get(id)||0)>now,get counts(){return {hits:hits.size,numbers:numbers.length}}};
};
