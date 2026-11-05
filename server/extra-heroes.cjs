'use strict';
const defs={
 marcus:{name:'马库斯',role:'重斧战士',color:'#d16e57',hp:150,speed:160,main:'裂地重斧',sub:'断层冲击',active:'处决',aEvo:'赤王裁决',bEvo:'山脉断裂',accA:'狮心徽章',accB:'裂岩符石',icon:'hammer',desc:'三连重劈 · 裂地震波 · 斩杀回血'},
 lira:{name:'莉拉',role:'精灵游侠',color:'#8fc873',hp:85,speed:210,main:'逐风连射',sub:'荆棘箭雨',active:'后跃齐射',aEvo:'穿云追星',bEvo:'翠雨天幕',accA:'风羽箭袋',accB:'森灵种子',icon:'staff',desc:'多目标连射 · 定点箭雨 · 后跃齐射'},
 kai:{name:'凯',role:'双刀剑士',color:'#e77c89',hp:100,speed:205,main:'交叉双斩',sub:'连锁剑气',active:'无双架势',aEvo:'十字修罗',bEvo:'万刃连星',accA:'赤刃护符',accB:'剑意卷轴',icon:'blades',desc:'交叉近斩 · 跳跃剑气 · 格挡反击'},
 elena:{name:'艾莲娜',role:'驭鞭舞者',color:'#55d1c0',hp:95,speed:195,main:'金蛇长鞭',sub:'束缚丝线',active:'牵引旋舞',aEvo:'九节金龙',bEvo:'命运织网',accA:'翡翠腕环',accB:'月丝结',icon:'moon',desc:'长距鞭击 · 丝线减速 · 聚怪旋舞'},
 borin:{name:'博林',role:'矮人锤卫',color:'#86addb',hp:180,speed:140,main:'蓄力战锤',sub:'反震壁垒',active:'大地震荡',aEvo:'雷铸重锤',bEvo:'不动堡垒',accA:'雷炉之芯',accB:'古王盾徽',icon:'shield',desc:'延迟重锤 · 近身反震 · 震退群敌'}
};
const order=Object.keys(defs),is=k=>!!defs[k];
function tick(p,dt,env){const k=p.hero||p.skin,d=defs[k];if(!d)return;
 p.extraShot=(p.extraShot||0)-dt;p.extraSub=(p.extraSub||0)-dt;if(p.extraShot>0&&p.extraSub>0&&!(p.hammerDelay>0))return;
 const live=env.enemies.filter(e=>!e.dead&&e.hp>0&&(!e.structure||e.stage<=env.stage)),distance=e=>Math.hypot(e.x-p.x,e.y-p.y);
 const hit=(e,n)=>env.hit(e,n),fx=(q,r)=>env.effect(q,r,d.color),power=p.damage*(1+p.a*.22)*(p.evoA?3:1),sub=p.damage*(.7+p.b*.22)*(p.evoB?3:1);
 const near=live.filter(e=>distance(e)<440).sort((a,b)=>distance(a)-distance(b));
 const line=(length,width,n)=>{for(const e of near){const dx=e.x-p.x,dy=e.y-p.y,along=dx*p.dx+dy*p.dy;if(along>=-e.r&&along<length+e.r&&Math.abs(dx*p.dy-dy*p.dx)<width+e.r)hit(e,n);}fx({x:p.x+p.dx*length/2,y:p.y+p.dy*length/2},width);};
 if(p.hammerDelay>0){p.hammerDelay-=dt;if(p.hammerDelay<=0){for(const e of live)if(Math.hypot(e.x-p.hammerX,e.y-p.hammerY)<110+e.r){hit(e,power*2.2);if(!e.structure){e.x+=p.dx*25;e.y+=p.dy*25;}}fx({x:p.hammerX,y:p.hammerY},110);}}
 if(p.extraShot<=0){
 if(k==='marcus'){p.axeCombo=((p.axeCombo||0)+1)%3;const heavy=p.axeCombo===0,radius=(heavy?180:140)+(p.evoA?35:0),target=near[0],angle=target&&distance(target)<radius+40?Math.atan2(target.y-p.y,target.x-p.x):Math.atan2(p.dy,p.dx),dx=Math.cos(angle),dy=Math.sin(angle);
 for(const e of near){const r=distance(e);if(r<radius+e.r&&((e.x-p.x)*dx+(e.y-p.y)*dy)>r*(heavy?-.35:.05)){hit(e,power*(heavy?2.4:1.3));if(!e.structure&&!e.boss){const push=heavy?32:10;e.x+=dx*push;e.y+=dy*push;if(heavy)e.slow=Math.max(e.slow||0,.5);}}}
 fx({x:p.x,y:p.y,kind:'axe',angle,heavy},radius);p.extraShot=heavy?1.2:.8;}
 if(k==='lira'){for(const e of near.slice(0,2+Math.floor(p.a/3))){hit(e,power*.8);fx({x:e.x,y:e.y,fromX:p.x,fromY:p.y},24);}p.extraShot=.5;}
 if(k==='kai'){for(const e of near)if(distance(e)<95+e.r&&Math.min(Math.abs((e.x-p.x)-(e.y-p.y)),Math.abs((e.x-p.x)+(e.y-p.y)))<38+e.r)hit(e,power);fx(p,85);p.extraShot=.42;}
 if(k==='elena'){line(270,24,power*1.2);p.extraShot=.85;}
 if(k==='borin'){p.hammerX=p.x+p.dx*55;p.hammerY=p.y+p.dy*55;p.hammerDelay=.4;fx({x:p.hammerX,y:p.hammerY},35);p.extraShot=1.8;}
 }
 if(p.b>0&&p.extraSub<=0){
 if(k==='marcus'){const length=p.evoB?420:330,width=p.evoB?62:40;for(const e of near){const dx=e.x-p.x,dy=e.y-p.y,along=dx*p.dx+dy*p.dy;if(along>=0&&along<length+e.r&&Math.abs(dx*p.dy-dy*p.dx)<width+e.r){hit(e,sub*1.2);if(!e.structure)e.slow=Math.max(e.slow||0,1);}}fx({x:p.x,y:p.y,kind:'fissure',angle:Math.atan2(p.dy,p.dx),length},width);p.extraSub=2.6;}
 if(k==='lira'){const target=near[0];if(target){for(const e of live)if(Math.hypot(e.x-target.x,e.y-target.y)<90+e.r)hit(e,sub);fx(target,90);}p.extraSub=2.8;}
 if(k==='kai'){for(const e of near.slice(0,3+Math.floor(p.b/2))){hit(e,sub);fx({x:e.x,y:e.y,fromX:p.x,fromY:p.y},32);}p.extraSub=2.2;}
 if(k==='elena'){for(const e of near.slice(0,4+p.b)){e.slow=2.5;hit(e,sub*.6);fx(e,30);}p.extraSub=3.2;}
 if(k==='borin'){for(const e of near)if(distance(e)<75+e.r)hit(e,sub);p.inv=Math.max(p.inv,.25);fx(p,75);p.extraSub=1.4;}
 }
}
function active(p,env){const k=p.hero||p.skin,d=defs[k];if(!d)return 0;const live=env.enemies.filter(e=>!e.dead&&e.hp>0&&(!e.structure||e.stage<=env.stage));
 if(k==='marcus'){let defeated=0;for(const e of live){if(Math.hypot(e.x-p.x,e.y-p.y)>195+e.r)continue;const low=e.hp/e.max<=.3,amount=low&&!e.elite&&!e.boss&&!e.structure?e.hp:p.damage*(low?8:3);env.hit(e,amount);if(e.dead||e.hp<=0)defeated++;}p.hp=Math.min(p.maxHp,p.hp+Math.min(24,defeated*8));p.inv=Math.max(p.inv||0,.35);env.effect({x:p.x,y:p.y,kind:'execute',angle:Math.atan2(p.dy,p.dx),heavy:true},195,'#ffe3a1');return defeated?4:7;}
 if(k==='lira'){p.x-=p.dx*110;p.y-=p.dy*110;for(const e of live)if(Math.hypot(e.x-p.x,e.y-p.y)<450)env.hit(e,p.damage*1.4);p.inv=.5;}
 else for(const e of live){const r=Math.hypot(e.x-p.x,e.y-p.y);if(r>(k==='elena'?300:k==='borin'?210:170)+e.r)continue;
 env.hit(e,p.damage*(k==='marcus'?(e.hp/e.max<.3?7:2):k==='kai'?3:1.5));
 if(!e.structure&&r>1){const pull=k==='elena'?-65:k==='borin'?80:0;e.x+=(e.x-p.x)/r*pull;e.y+=(e.y-p.y)/r*pull;if(k==='borin')e.slow=2;}
 }
 if(k==='kai')p.inv=1.4;
 env.effect(p,k==='elena'?300:210,d.color);return k==='marcus'?7:k==='lira'?6:k==='kai'?8:k==='elena'?7:9;
}
module.exports={defs,order,is,tick,active};
