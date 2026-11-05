'use strict';
module.exports={
 hunter:{name:'阿德里安',role:'远程输出',desc:'圣银射击 · 月轮护卫',color:'#d36763'},
 mage:{name:'瑟琳娜',role:'输出法师',desc:'星雷爆发 · 冰霜控场',color:'#b49aff'},
 rogue:{name:'夜鸦',role:'刺客',desc:'飞刃穿透 · 影袭收割',color:'#78d8c3'},
 tank:{name:'铁壁·洛恩',role:'肉盾',desc:'盾击震荡 · 嘲讽减伤',color:'#d8b66a'},
 medic:{name:'晨曦·艾琳',role:'医疗',desc:'圣光弹 · 群体治疗',color:'#a0e8bc'}
};

for(const [key,d] of Object.entries(require('./extra-heroes').defs))module.exports[key]={name:d.name,role:d.role,desc:d.desc,color:d.color};
