'use strict';
const items=[
{id:'vitality',name:'不灭之血',desc:'每级增加 15 点生命上限',base:150,max:10,icon:'cross',color:'#efa3a3'},
{id:'might',name:'始祖之力',desc:'每级增加 8% 武器伤害',base:200,max:10,icon:'fire',color:'#f1aa68'},
{id:'magnet',name:'灵魂牵引',desc:'每级增加 15% 拾取范围',base:120,max:5,icon:'moon',color:'#d9beff'},
{id:'regen',name:'永生之泉',desc:'每级每秒恢复 0.3 点生命',base:250,max:5,icon:'poison',color:'#9be1be'},
{id:'speed',name:'疾风步伐',desc:'每级增加 5% 移动速度',base:180,max:5,icon:'blades',color:'#9cdedb'},
{id:'armor',name:'磐石护甲',desc:'每级减少 1 点接触伤害，最低受到 1 点',base:300,max:5,icon:'shield',color:'#dcc38d'},
{id:'wisdom',name:'远古智慧',desc:'每级增加 5% 经验宝石收益',base:220,max:8,icon:'staff',color:'#aebaff'},
{id:'fortune',name:'黄金契约',desc:'每级增加 10% 地面金币收益，小数累积',base:280,max:6,icon:'moon',color:'#ffe29c'},
{id:'haste',name:'战斗狂热',desc:'每级缩短 4% 自动武器攻击间隔',base:350,max:5,icon:'bolt',color:'#d3a6f5'},
{id:'mobility',name:'影行秘术',desc:'每级缩短 10% 主动技能冷却',base:400,max:3,icon:'snow',color:'#a1d8ef'}
];
function cost(item,rank){return Math.ceil(item.base*100*Math.pow(1.5,rank));}
module.exports={items,cost};
