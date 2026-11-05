'use strict';
// Cache scale, facing and hit tint once; the hot path is a single drawImage.
module.exports=function createSpriteCache(wx,makeSprite,limit=192){
 const cache=new Map();
 return {draw(ctx,type,x,y,scale,phase,face=1,flash=false){
 const wave=Math.sin(phase),frame=wave>.35?1:wave<-.35?-1:0,key=[type,frame,scale,face,!!flash].join(':');
 let img=cache.get(key);
 if(!img){img=wx.createCanvas();img.width=Math.ceil(32*scale);img.height=Math.ceil(40*scale);const g=img.getContext('2d');g.imageSmoothingEnabled=false;g.translate(face<0?32*scale:0,0);g.scale(face*scale,scale);g.drawImage(makeSprite(type,frame),0,0);if(flash){g.globalCompositeOperation='source-atop';g.fillStyle='#fff2bd';g.fillRect(0,0,32,40);}if(cache.size>=limit)cache.delete(cache.keys().next().value);cache.set(key,img);}
 ctx.drawImage(img,Math.round(x-16*scale),Math.round(y-24*scale));
 },get size(){return cache.size}};
};
