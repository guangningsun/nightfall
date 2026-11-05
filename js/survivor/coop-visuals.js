'use strict';
module.exports=function createVisuals(wx){
 const assets=new Map();let stage=null,run=null,flashUntil=0;
 const rect=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
 function asset(key,paint){if(assets.has(key))return assets.get(key);const c=wx.createCanvas();c.width=96;c.height=112;paint(c.getContext('2d'));assets.set(key,c);return c;}
 function observe(world,now){if(run!==world.id){run=world.id;stage=world.stage;flashUntil=0;return;}if(world.stage>stage||world.status==='won'&&stage!==3){stage=world.status==='won'?3:world.stage;flashUntil=now+2200;}}
 function tower(ctx,e,time,active){
 const img=asset('tower'+active,g=>{rect(g,15,88,66,12,'#121321');rect(g,21,33,54,59,'#343344');rect(g,26,39,44,46,'#5c576c');rect(g,31,44,7,36,'#81778b');rect(g,22,27,52,14,'#aaa0ac');for(let i=0;i<3;i++)rect(g,22+i*20,17,12,18,'#7b7487');rect(g,41,53,15,24,'#1a1725');rect(g,44,56,8,17,active?'#ea8f4d':'#63667c');rect(g,16,88,64,5,'#94808b');});
 ctx.drawImage(img,e.x-48,e.y-70);
 if(active){const pulse=.6+.3*Math.sin(time*5+e.id);ctx.save();ctx.globalAlpha=pulse;ctx.strokeStyle='#ec965b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y-46,13+Math.sin(time*4)*2,0,Math.PI*2);ctx.stroke();rect(ctx,e.x-4,e.y-51,8,10,'#fff0a7');ctx.restore();}
 }
 function gate(ctx,e,time,active){
 const x=e.x,y=e.y;rect(ctx,x-78,y-41,156,82,'#1b1827');rect(ctx,x-74,y-39,148,6,'#d4b47a');rect(ctx,x-74,y+35,148,6,'#8b6e4d');
 for(const side of [-1,1]){rect(ctx,x+side*68-5,y-33,10,68,'#9b8790');rect(ctx,x+side*64-2,y-30,4,60,'#d1b27c');}
 rect(ctx,x-58,y-30,116,62,e.stage===2?'#4a2337':'#553c36');
 for(let i=-48;i<58;i+=24)rect(ctx,x+i,y-28,4,58,'#b1895b');
 rect(ctx,x-1,y-30,3,62,'#e1bb6c');
 const color=active?(e.stage===2?'#e88bba':'#ffc56c'):'#7d7a99';
 ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);rect(ctx,-12,-12,24,24,'#211b2f');rect(ctx,-8,-8,16,16,color);rect(ctx,-3,-3,6,6,'#fff0d1');ctx.restore();
 if(active){ctx.save();ctx.globalAlpha=.35+.2*Math.sin(time*3);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,23,0,Math.PI*2);ctx.stroke();ctx.restore();}
 }
 function shot(ctx,b){
 const color=b.enemy?'#ff7355':b.blade?'#7ff2cd':b.evolved?'#ffb64e':'#b5eaff';
 ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.blade?b.age*22:Math.atan2(b.vy,b.vx));
 ctx.globalAlpha=.22;rect(ctx,-28,-4,24,8,color);ctx.globalAlpha=.5;rect(ctx,-18,-3,18,6,color);ctx.globalAlpha=1;rect(ctx,-8,-2,16,4,color);rect(ctx,0,-1,8,2,'#fff7db');if(b.blade){rect(ctx,-2,-10,4,20,color);rect(ctx,-1,-6,2,12,'#e3fff5');}ctx.restore();
 }
 function effect(ctx,fx,age,simple){if(fx.kind){require('./axe-effects').draw(ctx,fx,age,simple);return;}
 const life=Math.max(0,fx.life-age);if(!life)return;if(fx.fromX!==undefined){ctx.save();ctx.globalAlpha=Math.min(1,life*3);ctx.strokeStyle=fx.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(fx.fromX,fx.fromY);ctx.lineTo(fx.x,fx.y);ctx.stroke();ctx.restore();return;}const k=1-life/.45,r=Math.max(1,fx.r*k);
 ctx.save();ctx.globalAlpha=Math.min(.9,life*3);
 if(fx.r===20||fx.r===65){const count=simple?4:8;for(let i=0;i<count;i++){const a=i*Math.PI*2/count,reach=(8+fx.r*.55)*k;rect(ctx,fx.x+Math.cos(a)*reach-2,fx.y+Math.sin(a)*reach-2,3,3,i%2?'#ff9b5d':'#ffe8a3');}if(k<.3){rect(ctx,fx.x-9,fx.y-1,18,2,'#fff8d8');rect(ctx,fx.x-1,fx.y-9,2,18,'#fff8d8');}ctx.restore();return;}
 ctx.strokeStyle=fx.color;ctx.lineWidth=simple?2:3;ctx.beginPath();ctx.arc(fx.x,fx.y,r,0,Math.PI*2);ctx.stroke();
 if(!simple){ctx.globalAlpha*=.5;ctx.beginPath();ctx.arc(fx.x,fx.y,r*.7,0,Math.PI*2);ctx.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3+k;rect(ctx,fx.x+Math.cos(a)*r-2,fx.y+Math.sin(a)*r-2,4,4,fx.color);}}
 ctx.restore();
 }
 function aura(ctx,p,time,own){ctx.save();ctx.globalAlpha=p.hp<=0?.25:.55;ctx.strokeStyle=own?'#91e9d0':'#c0a3ff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y+15,23,9,0,0,Math.PI*2);ctx.stroke();if(p.guard>0||p.inv>0){ctx.globalAlpha=.28+.1*Math.sin(time*9);ctx.beginPath();ctx.arc(p.x,p.y-5,30,0,Math.PI*2);ctx.stroke();}ctx.restore();}
 function banner(ctx,W,y,now){if(now>=flashUntil)return;ctx.save();ctx.globalAlpha=Math.min(1,(flashUntil-now)/500);rect(ctx,W/2-142,y,284,48,'#211b30ee');rect(ctx,W/2-142,y,284,2,'#e8bc70');ctx.textAlign='center';ctx.font='bold 18px sans-serif';ctx.fillStyle='#ffe2a0';ctx.fillText(stage===3?'核心攻破 · 远征胜利':'防线突破 · 补给已送达',W/2,y+30);ctx.restore();}
 return {tower,gate,shot,effect,aura,banner,observe};
};
