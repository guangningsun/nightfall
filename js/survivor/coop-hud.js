'use strict';
const inventory=require('./inventory');
module.exports=function createHUD(wx){
 let canvas=null,key='';
 return {draw(ctx,o){const p=o.player,k=JSON.stringify([o.width,p.hero,p.a,p.b,p.evoA,p.evoB,p.accA,p.accB,Math.ceil(p.hp),p.maxHp,o.level,o.xp,o.need,Math.floor(o.time),o.kills,o.gold]);
 if(k!==key){if(!canvas)canvas=wx.createCanvas();canvas.width=o.width;canvas.height=106;const g=canvas.getContext('2d');g.clearRect(0,0,canvas.width,canvas.height);inventory.draw(g,{...o,top:0});key=k;}
 ctx.drawImage(canvas,0,o.top);
 }};
};
