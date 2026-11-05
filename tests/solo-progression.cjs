const assert=require('node:assert/strict'),create=require('../js/survivor/engine'),loot=require('../js/survivor/loot');
const ctx=new Proxy({measureText:s=>({width:s.length*7})},{get:(o,k)=>o[k]||(()=>{})}),wx={createCanvas:()=>({getContext:()=>ctx}),createImage:()=>({}),getWindowInfo:()=>({windowWidth:390,windowHeight:844,pixelRatio:1}),getStorageSync:()=>null,setStorageSync(){}};
for(const k of ['TouchStart','TouchMove','TouchEnd','TouchCancel','Hide','Show','WindowResize'])wx['on'+k]=()=>{};global.cancelAnimationFrame=()=>{};
const g=create(wx,{manual:true,testing:true});g.getState().profile.wins=10;
for(const hero of ['hunter','mage','rogue','marcus']){g.test.setHero(hero);g.start();const p=g.getState().p;
for(const u of g.test.activeUpgrades())if(u.available){let n=0;while(u.available()&&n++<20)u.apply();}
p.hp=p.maxHp;const level=g.getState().level;g.test.setXP(100);g.step(.001);assert.equal(g.getState().state,'playing',hero+' full HP skips recovery');assert.ok(g.getState().level>level);
p.hp=p.maxHp-20;g.test.setXP(100);g.step(.001);assert.equal(g.getState().state,'upgrade',hero+' injured still offered recovery');}
g.start();g.test.spawn(false,true);const e=g.getState().enemies.at(-1);e.x=100;e.y=0;g.test.hurt(e,1e9);assert.equal(g.getState().lootDrops.length,1);
const p=g.getState().p;const d=g.getState().lootDrops[0];d.x=p.x;d.y=p.y;g.step(.001);assert.equal(g.getState().lootDrops.length,0);assert.equal(p.loot[d.id],1);
const q={maxHp:100,hp:100,damage:20,speed:180,magnet:85};for(const item of loot.items){for(let i=0;i<3;i++)assert.equal(loot.take(q,item.id).duplicate,false);assert.equal(loot.take(q,item.id).duplicate,true);}
assert.equal(require('../js/survivor/inventory').items({...q,skin:'hunter',weaponLevel:1}).accessories.length,4);
g.start();assert.equal(g.getState().p.loot,undefined);assert.equal(g.getState().lootDrops.length,0);g.dispose();
console.log('PASS full-health auto-level, injured recovery, guaranteed elite loot/pickup, rank cap and run reset');
