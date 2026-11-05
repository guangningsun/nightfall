'use strict';
const items=[
 {id:'ruby',name:'赤玉项链',icon:'cross',color:'#ee8d9f',desc:'生命上限 +10',apply:p=>{p.maxHp+=10;p.hp=Math.min(p.maxHp,p.hp+10)}},
 {id:'amber',name:'琥珀戒指',icon:'fire',color:'#f4c16f',desc:'武器伤害 +8%',apply:p=>p.damage*=1.08},
 {id:'wind',name:'风羽护符',icon:'blades',color:'#95e1b6',desc:'移动速度 +4%',apply:p=>p.speed*=1.04},
 {id:'star',name:'星辉吊坠',icon:'moon',color:'#b5b1f5',desc:'拾取范围 +10%',apply:p=>p.magnet*=1.1}
];
function take(p,id){const item=items.find(x=>x.id===id);if(!item)return null;p.loot=p.loot||{};const rank=p.loot[id]||0;if(rank>=3)return {item,duplicate:true};item.apply(p);p.loot[id]=rank+1;return {item,rank:rank+1,duplicate:false};}
module.exports={items,take};
