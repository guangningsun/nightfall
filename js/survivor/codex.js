'use strict';
const entries=[
 ['inferno','炼狱星陨','hunter','远程输出','圣银弹丸','猎魔徽章','伤害 ×3，追加弹丸，命中触发范围爆炸。','#f5a05f','fire'],
 ['eclipse','永夜月蚀','hunter','远程输出','月轮护卫','远古磁石','月轮伤害 ×3，扩大环绕范围。单人模式额外增加两枚月轮。','#e9cb85','moon'],
 ['storm','苍穹雷域','mage','输出法师','星雷新星','星辉水晶','星雷伤害 ×3，范围扩大 50%。单人模式额外缩短释放间隔。','#b6a1ff','bolt'],
 ['frost','绝对零度','mage','输出法师','冰霜结界','寒冬吊坠','冰霜伤害 ×3，范围扩大 50%。单人模式附加冻结，联机模式减速敌人。','#8bdeec','snow'],
 ['ravens','千鸦刃雨','rogue','刺客','回旋飞刃','鸦羽印记','飞刃伤害 ×3，追加飞刃，去程与回程均可穿透敌人。','#9fe2c5','blades'],
 ['venom','噬魂毒沼','rogue','刺客','毒刺陷阱','剧毒原液','陷阱伤害 ×3，扩大作用范围，触发后形成持续 4 秒的毒沼。','#bad57c','poison'],
 ['mountain','山岳崩击','tank','肉盾','震地盾击','磐石徽记','盾击伤害 ×3，以近身震荡同时打击敌群与城门。仅联机攻城可用。','#dfbd78','hammer'],
 ['bastion','不灭壁垒','tank','肉盾','守护战吼','钢铁核心','自动守护持续时间提升至 3 秒，守护期间受到伤害降低 65%。仅联机攻城可用。','#e3cba1','shield'],
 ['judgement','天罚圣光','medic','医疗','圣光弹','晨曦圣印','圣光弹伤害 ×3，追加弹体，命中触发范围爆发。仅联机攻城可用。','#ffe4a2','staff'],
 ['sanctuary','生命圣域','medic','医疗','复苏祷言','生命吊坠','治疗量 ×2，范围提升至 320，为范围内存活队友恢复生命。仅联机攻城可用。','#9be3b6','cross']
].map(([id,name,hero,role,base,accessory,effect,color,icon])=>({id,name,hero,role,base,accessory,effect,color,icon}));
function layout(width){const gap=12,pad=16,columns=width>=1100?5:width>=700?4:width>=500?3:2;const cardWidth=(width-pad*2-gap*(columns-1))/columns;return {columns,gap,pad,cardWidth,cardHeight:Math.round(cardWidth*.72)+112};}
function icon(ctx,type,x,y,size,color){const u=size/16;ctx.save();ctx.translate(Math.round(x-size/2),Math.round(y-size/2));const pixel=(a,b,w=1,h=1,c=color)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(a*u),Math.round(b*u),Math.ceil(w*u),Math.ceil(h*u));};
 const line=(x1,y1,x2,y2,c=color)=>{const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));for(let i=0;i<=n;i++)pixel(Math.round(x1+(x2-x1)*i/(n||1)),Math.round(y1+(y2-y1)*i/(n||1)),1,1,c);};
 if(type==='fire'){for(let row=2;row<15;row++){const half=Math.floor((row<10?row:20-row)/2);pixel(8-half,row,half*2+1,1,'#b64a44');}pixel(7,5,3,8);pixel(5,9,7,4);pixel(7,10,3,4,'#fff1b9');pixel(11,3,1,3);pixel(3,5,1,2);}
 else if(type==='moon'){for(let a=0;a<Math.PI*2;a+=.13){pixel(Math.round(7+6*Math.cos(a)),Math.round(7+6*Math.sin(a)),2,2);}pixel(7,0,2,16,'#fff1c2');pixel(0,7,16,2,'#e0bc76');pixel(6,6,4,4,'#fff6d7');}
 else if(type==='bolt'){for(let row=1;row<8;row++)pixel(10-Math.floor(row/2),row,3,1);pixel(4,7,8,2,'#eee6ff');for(let row=9;row<15;row++)pixel(10-Math.floor((row-8)/2),row,2,1);pixel(2,3,1,2);pixel(13,11,1,2);}
 else if(type==='snow'){line(7,1,7,15);line(1,7,15,7);line(2,2,12,12);line(2,12,12,2);for(const [a,b] of [[7,1],[1,7],[13,7],[7,13]])pixel(a-1,b-1,3,3,'#eefaff');pixel(6,6,3,3,'#ffffff');}
 else if(type==='blades'){for(let k=0;k<3;k++){const o=k*4;line(o+1,13,o+7,2,'#285f6b');line(o+2,12,o+7,3);pixel(o+1,12,3,2,'#ead39b');}pixel(1,1,2,2,'#d6ffe6');}
 else if(type==='poison'){pixel(5,1,6,3,'#d8d8a0');pixel(6,4,4,3);pixel(3,7,10,7,'#53724a');pixel(4,9,8,4);pixel(6,9,2,2,'#efffb3');pixel(2,14,12,1,'#d8efa1');pixel(13,4,2,2);}
 else if(type==='hammer'){line(4,14,10,4,'#a98865');line(5,14,11,4,'#e8d2a1');pixel(3,2,10,5,'#786575');pixel(4,2,8,3);pixel(2,3,2,3,'#fff0c1');pixel(12,3,2,3,'#fff0c1');}
 else if(type==='shield'){for(let row=1;row<14;row++){const half=row<9?6:14-row;pixel(8-half,row,half*2,1,'#99764d');pixel(9-half,row,half*2-2,1);}pixel(7,3,2,9,'#fdf1be');pixel(4,5,8,2,'#fdf1be');}
 else if(type==='staff'){pixel(7,3,2,12,'#b99e79');pixel(6,12,4,2);pixel(4,2,8,2);pixel(6,0,4,6,'#fff1c0');pixel(7,1,2,3,'#ffffff');pixel(2,6,1,2);pixel(12,6,1,2);}
 else {pixel(5,1,6,14,'#3d7461');pixel(1,5,14,6,'#3d7461');pixel(6,2,4,12);pixel(2,6,12,4);pixel(7,4,2,8,'#f0ffe1');pixel(4,7,8,2,'#f0ffe1');}
 ctx.restore();}
function drawCard(ctx,item,x,y,w,h){const rect=(a,b,c,d,col)=>{ctx.fillStyle=col;ctx.fillRect(a,b,c,d);};const label=(s,a,b,size,col)=>{ctx.font=`bold ${size}px sans-serif`;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillStyle=col;ctx.fillText(s,a,b);};
 rect(x+3,y+5,w,h,'#090812');rect(x,y,w,h,'#5d412f');rect(x+2,y+2,w-4,h-4,'#dfbf80');rect(x+5,y+5,w-10,h-10,'#77665b');rect(x+7,y+7,w-14,h-14,'#39374d');rect(x+8,y+8,w-16,3,'#f5dfa7');
 label(item.name,x+13,y+17,Math.min(17,(w-26)/5),'#fff2d2');label(item.role+(item.hero==='tank'||item.hero==='medic'?' · 联机':''),x+13,y+42,10,'#c8bbce');
 const artTop=y+61,artH=h-111;rect(x+12,artTop,w-24,artH,'#56546b');rect(x+17,artTop+5,w-34,artH-10,'#4b4a60');
 const s=Math.min(w-52,artH-12);rect(x+w/2-s*.38,artTop+artH*.78,s*.76,5,'#242435');icon(ctx,item.icon,x+w/2,artTop+artH*.48,s,item.color);
 label(item.footer||'VIII + 专属饰品',x+13,y+h-39,10,'#d8c5a3');label(item.cta||'查看进化配方  ›',x+13,y+h-22,10,item.color);ctx.textBaseline='alphabetic';
}
module.exports={entries,layout,drawCard,icon};

for(const [hero,d] of Object.entries(require('./extra-heroes').defs))for(const [n,base,accessory,name] of [['a',d.main,d.accA,d.aEvo],['b',d.sub,d.accB,d.bEvo]])entries.push({id:hero+n,name,hero,role:d.role,base,accessory,effect:'专属武器伤害提升至 3 倍。',color:d.color,icon:d.icon});
