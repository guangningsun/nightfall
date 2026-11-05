'use strict';
function draw(ctx,world,me,W,H){
 const box=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 // Courtyard road guides the team north through three defensive rings.
 box(-95,me.y-H/2,190,H,'#3c3540');
 for(let y=Math.floor((me.y-H/2)/48)*48;y<me.y+H/2;y+=48){box(-92,y,184,2,'#56505a');box((y/48%2)*44-44,y,2,48,'#514852');}
 for(const [i,d] of (world.defenses||[]).entries()){
 if(Math.abs(d.y-me.y)>H/2+140)continue;
 const min=me.x-W/2-30,max=me.x+W/2+30;
 box(min,d.y-30,max-min,60,'#252330');box(min,d.y-28,max-min,9,'#89818b');box(min,d.y+20,max-min,10,'#514651');
 for(let x=Math.floor(min/48)*48;x<max;x+=48){box(x,d.y-44,26,20,'#77717c');box(x,d.y-10,2,28,'#48414d');}
 if(i<world.stage)box(-90,d.y-44,180,80,'#3c3540');
 else{box(-70,d.y-35,140,67,i===2?'#906942':'#6e5141');for(let x=-60;x<70;x+=20)box(x,d.y-30,4,58,'#b69a6c');}
 ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillStyle=i<world.stage?'#91d9b0':'#edd6a5';ctx.fillText(d.name+(i<world.stage?' · 已突破':i>world.stage?' · 封锁中':''),0,d.y-61);
 }
}
function progress(ctx,world,W,top){
 if(!world.defenses)return;const gap=5,w=(W-32-2*gap)/3;
 world.defenses.forEach((d,i)=>{ctx.fillStyle=i<world.stage?'#345d4d':i===world.stage?'#7b4939':'#292735';ctx.fillRect(16+i*(w+gap),top,w,23);ctx.fillStyle=i===world.stage?'#ffe1a0':'#c4bcc7';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText((i<world.stage?'✓ ':i===world.stage?'◆ ':'')+d.name,16+i*(w+gap)+w/2,top+16);});
}
module.exports={draw,progress};
