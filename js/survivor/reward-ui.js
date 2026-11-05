'use strict';
const {icon}=require('./codex');
function text(g,s,x,y,size=14,color='#fff3d8',align='left'){g.font='bold '+size+'px sans-serif';g.textAlign=align;g.textBaseline='top';g.fillStyle=color;g.fillText(s,x,y);}
function frame(g,x,y,w,h){g.fillStyle='#8c663a';g.fillRect(x,y,w,h);g.fillStyle='#f0d38c';g.fillRect(x+2,y+2,w-4,h-4);g.fillStyle='#4b4c70';g.fillRect(x+6,y+6,w-12,h-12);for(const [a,b] of [[x,y],[x+w-8,y],[x,y+h-8],[x+w-8,y+h-8]]){g.fillStyle='#ffe7a3';g.fillRect(a,b,8,8);}}
function rows(g,s,w,size){g.font=size+'px sans-serif';const out=[];let line='';for(const c of s){const m=g.measureText(line+c);if(c==='\n'||line&&(m&&m.width>w)){out.push(line);line=c==='\n'?'':c;}else line+=c;}if(line)out.push(line);return out;}
function kind(name){return /冰|寒/.test(name)?'snow':/刃|影/.test(name)?'blades':/毒|泉/.test(name)?'poison':/雷|速度|冷却/.test(name)?'bolt':/月|磁/.test(name)?'moon':/生命|补给/.test(name)?'cross':/徽|护/.test(name)?'shield':'staff';}
function choices(g,W,H,top,bottom,items,title,hint){
 const wide=W>H,w=Math.min(W-24,760),h=Math.min(H-top-bottom-12,wide?270:520),x=(W-w)/2,y=top+Math.max(0,(H-top-bottom-h)/2),gap=8;
 g.save();g.fillStyle='#09071399';g.fillRect(0,0,W,H);frame(g,x,y,w,h);text(g,title,W/2,y+20,23,'#fff1cc','center');
 const horizontal=wide,cw=horizontal?(w-32-gap*(items.length-1))/items.length:w-32,ch=horizontal?h-106:Math.min(122,(h-108-gap*(items.length-1))/items.length);
 const targets=items.map((item,i)=>{const bx=x+16+(horizontal?i*(cw+gap):0),by=y+64+(horizontal?0:i*(ch+gap));frame(g,bx,by,cw,ch);g.fillStyle='#777982';g.fillRect(bx+5,by+5,cw-10,ch-10);g.fillStyle='#181b28';g.fillRect(bx+10,by+10,34,34);icon(g,kind(item.text||item.name),bx+27,by+27,26,'#e9c78d');text(g,item.text||item.name,bx+52,by+13,Math.min(15,(cw-62)/8),'#fff5dc');
 rows(g,item.desc||'选择此项，立即获得强化。',cw-24,12).slice(0,Math.max(1,Math.floor((ch-53)/17))).forEach((r,j)=>text(g,r,bx+12,by+53+j*17,12));return {x:bx,y:by,w:cw,h:ch,fn:item.fn};});
 text(g,hint,W/2,y+h-28,11,'#e2d3bd','center');g.restore();return targets;
}
function chest(g,x,y,w,h,elapsed){
 g.save();frame(g,x,y,w,h);const cx=x+w/2,cy=y+h*.68,t=Math.min(1,elapsed/1.1);
 g.fillStyle='#3238a4';g.fillRect(cx-30,y+12,60,cy-y);g.globalAlpha=.2+.15*Math.sin(elapsed*5);g.fillStyle='#ffe89b';g.fillRect(cx-45,y+12,90,cy-y);g.globalAlpha=1;
 for(let i=0;i<18;i++){const a=i*2.399,rad=22+(i%5)*12,py=cy-((elapsed*85+i*23)%(h*.65));g.fillStyle=i%3?'#ebbd54':'#fff2ad';g.fillRect(cx+Math.cos(a)*rad,py,5,8);}
 const box=(a,b,c,d,col)=>{g.fillStyle=col;g.fillRect(a,b,c,d)};box(cx-45,cy-14,90,42,'#201e2c');box(cx-40,cy-10,80,34,'#bb813b');box(cx-35,cy-6,70,25,'#8c2639');box(cx-7,cy-8,14,23,'#ffe5a0');box(cx-44,cy-30-t*14,88,18,'#d7b36a');box(cx-37,cy-26-t*14,74,10,'#4b3344');
 if(t>=1)icon(g,'staff',cx,cy-75,36,'#fff0b5');g.restore();
}
module.exports={frame,text,rows,choices,chest};
