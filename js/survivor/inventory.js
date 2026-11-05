'use strict';
const {entries,icon}=require('./codex');
function items(p,coop=false){
 const hero=coop?p.hero:p.skin;coop=coop||require('./extra-heroes').is(hero);const defs=entries.filter(e=>e.hero===hero);
 const fields=hero==='mage'?['novaLevel','frostLevel','novaEvolved','frostEvolved','crystal','iceCharm']:hero==='rogue'?['bladeLevel','trapLevel','bladeEvolved','trapEvolved','ravenSeal','venomVial']:['weaponLevel','moonLevel','evolved','moonEvolved','seal','magnetCharm'];
 const ranks=coop?[p.a,p.b]:[p[fields[0]],p[fields[1]]],evos=coop?[p.evoA,p.evoB]:[p[fields[2]],p[fields[3]]],acc=coop?[p.accA,p.accB]:[p[fields[4]],p[fields[5]]];
 return {weapons:defs.map((e,i)=>ranks[i]>0?{icon:e.icon,color:e.color,rank:ranks[i],evolved:!!evos[i],name:evos[i]?e.name:e.base}:null).filter(Boolean),accessories:defs.map((e,i)=>acc[i]?{icon:i?'moon':'shield',color:e.color,rank:1,name:e.accessory}:null).filter(Boolean).concat(require('./loot').items.filter(i=>p.loot&&p.loot[i.id]).map(i=>({name:i.name,icon:i.icon,color:i.color,rank:p.loot[i.id]})))};
}
function draw(ctx,{width,top,player,coop=false,time,kills,gold,level,xp,need}){
 const x=12,w=width-24,size=Math.min(30,Math.floor((w-114)/6)-3),gap=3,loadout=items(player,coop);
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 const text=(s,x,y,n=11,c='#fff0cf',align='left')=>{ctx.font='bold '+n+'px sans-serif';ctx.fillStyle=c;ctx.textAlign=align;ctx.fillText(s,x,y)};
 ctx.save();ctx.textBaseline='alphabetic';
 rect(x,top,w,20,'#bba45f');rect(x+2,top+2,w-4,16,'#080b0c');rect(x+4,top+4,(w-70)*Math.max(0,Math.min(1,xp/(need||1))),12,'#286cdb');text('等级 '+level,x+w-7,top+14,12,'#fff','right');
 const sy=top+26;
 [loadout.weapons,loadout.accessories].forEach((row,r)=>{for(let i=0;i<6;i++){const bx=x+i*(size+gap),by=sy+r*(size+gap),it=row[i];rect(bx,by,size,size,it&&it.evolved?'#f6d47b':'#77745a');rect(bx+1,by+1,size-2,size-2,'#142019dd');if(it){icon(ctx,it.icon,bx+size/2,by+size/2-2,size-7,it.color);rect(bx+size-12,by+size-10,11,9,'#15121b');text(it.evolved?'★':String(it.rank),bx+size-2,by+size-2,9,it.evolved?'#ffe488':'#fff','right');}}});
 const rx=x+w,elapsed=Math.max(0,Math.floor(time));
 text(Math.floor(elapsed/60)+':'+String(elapsed%60).padStart(2,'0'),rx,sy+17,20,'#fff','right');
 text('击败 '+kills,rx,sy+34,11,'#ddd9cd','right');text('金币 '+gold,rx,sy+49,11,'#f4d174','right');
 const by=sy+2*(size+gap)+4;rect(x,by,w,5,'#35232c');rect(x,by,w*Math.max(0,Math.min(1,player.hp/player.maxHp)),5,'#c34b56');
 ctx.restore();return loadout;
}
module.exports={items,draw};
