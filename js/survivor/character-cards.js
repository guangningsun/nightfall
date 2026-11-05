'use strict';
const roles=require('./roles');
const order=['hunter','mage','rogue','tank','medic',...require('./extra-heroes').order];
const soloOrder=order.filter(k=>k!=='tank'&&k!=='medic');
function unlocked(key,wins,solo=false){const list=solo?soloOrder:order;return list.indexOf(key)>=0&&list.indexOf(key)<=Math.max(0,Math.floor(Number(wins)||0));}
function createCards(wx,getSprite){const cache=new Map(),art={};
if(wx.createImage)for(const key of ['hunter','mage','rogue',...require('./extra-heroes').order]){const img=wx.createImage();img.onload=()=>{art[key]=img;};img.onerror=()=>{};img.src='images/survivor/portraits/'+key+'.jpg';}
function portrait(key,locked){const id=key+locked;if(cache.has(id))return cache.get(id);const c=wx.createCanvas();c.width=32;c.height=40;const g=c.getContext('2d');if(getSprite&&['hunter','mage','rogue',...require('./extra-heroes').order].includes(key))g.drawImage(getSprite(key),0,0);else{const r=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h)};r(10,2,12,10,'#ead0ad');r(8,12,16,20,roles[key].color);r(8,32,6,7,'#3a3344');r(19,32,6,7,'#3a3344');if(key==='tank'){r(1,12,10,20,'#d1ad62');r(3,14,6,14,'#686777');r(25,10,4,23,'#c3c5cb');}else{r(27,4,2,32,'#eee5b9');r(23,7,9,3,'#e8fff3');r(12,14,8,3,'#f6ffee');r(15,11,2,11,'#f6ffee');}}if(locked){g.globalCompositeOperation='source-in';g.fillStyle='#090b11';g.fillRect(0,0,32,40);}cache.set(id,c);return c;}
function draw(ctx,key,x,y,w,h,{locked=false,selected=false,wins=0,solo=false}={}){const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};const t=(s,x,y,size,c)=>{ctx.font=`bold ${size}px sans-serif`;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillStyle=c;ctx.fillText(s,x,y);};r(x+3,y+4,w,h,'#17131d');r(x,y,w,h,selected?'#ffe196':'#9e773d');r(x+3,y+3,w-6,h-6,'#e3c58c');r(x+6,y+6,w-12,h-12,locked?'#77777a':'#63637a');t(roles[key].name,x+11,y+12,Math.min(15,(w-22)/6),locked?'#30313a':'#fff0d2');if(h>w+1)t(roles[key].role,x+11,y+34,10,locked?'#36343b':'#e4d6c4');const compact=h<=w+1,artTop=compact?26:49,artHeight=h-(compact?44:79);const img=art[key];
if(img&&!locked){ctx.save();ctx.beginPath();ctx.rect(x+7,y+artTop,w-14,artHeight);ctx.clip();ctx.imageSmoothingEnabled=true;
// Frame and English titles remain in the source; the UI focuses on the portrait.
const crop=key==='hunter'?[78,220,630,820]:key==='mage'?[64,210,656,880]:[60,290,670,730];
const [sx,sy,sw,sh]=crop,scale=Math.min((w-14)/sw,(artHeight)/sh),dw=sw*scale,dh=sh*scale;
ctx.fillStyle=key==='hunter'?'#5a5a58':'#77787a';ctx.fillRect(x+7,y+artTop,w-14,artHeight);ctx.drawImage(img,sx,sy,sw,sh,x+(w-dw)/2,y+artTop+(artHeight-dh)/2,dw,dh);ctx.restore();
}else{const size=Math.min(w-26,(h-(compact?46:84))*.8),ph=size/32*40;ctx.imageSmoothingEnabled=false;ctx.drawImage(portrait(key,locked),Math.round(x+(w-size)/2),Math.round(y+(compact?27:53)),size,ph);}
t(locked?'通关 '+(solo?soloOrder:order).indexOf(key)+' 次解锁':selected?'已选择':'已解锁',x+11,y+h-23,10,locked?'#20212a':'#fff0bf');if(selected)for(const [cx,cy] of [[x-3,y-3],[x+w-6,y-3],[x-3,y+h-6],[x+w-6,y+h-6]])r(cx,cy,9,9,'#fff0b3');ctx.textBaseline='alphabetic';}
return {draw};}
module.exports={order,soloOrder,unlocked,createCards};
