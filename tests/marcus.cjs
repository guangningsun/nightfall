const assert=require('node:assert/strict'),kit=require('../js/survivor/extra-heroes'),{World}=require('../server/world.cjs');
const p={hero:'marcus',x:0,y:0,dx:1,dy:0,a:1,b:0,damage:20,hp:50,maxHp:150,extraSub:999,inv:0};
const e={id:1,x:100,y:0,r:14,hp:10000,max:10000},effects=[],env={stage:0,enemies:[e],hit:(e,n)=>e.hp=Math.max(0,e.hp-n),effect:(q,r,color)=>effects.push({...q,r,color})};
let losses=[];for(let i=0;i<3;i++){e.x=100;p.extraShot=0;const hp=e.hp;kit.tick(p,.01,env);losses.push(hp-e.hp);}
assert.ok(losses[2]>losses[0]);assert.equal(e.x,132);assert.equal(effects.filter(f=>f.kind==='axe').length,3);assert.equal(effects.at(-1).heavy,true);
p.b=8;p.evoB=true;p.extraShot=999;p.extraSub=0;kit.tick(p,.01,env);assert.equal(effects.at(-1).kind,'fissure');assert.equal(effects.at(-1).length,420);assert.ok(e.slow>=1);
const ordinary={x:50,y:0,r:14,hp:20,max:100},boss={x:50,y:0,r:40,hp:1000,max:4000,boss:true},tower={x:50,y:0,r:28,hp:1000,max:4000,structure:'tower',stage:0};
env.enemies=[ordinary,boss,tower];assert.equal(kit.active(p,env),4);assert.equal(ordinary.hp,0);assert.equal(boss.hp,840);assert.equal(tower.hp,840);assert.equal(p.hp,58);
const w=new World([{id:'m',hero:'marcus'},{id:'h',hero:'hunter'}]);w.spawnClock=999;w.step(.05);assert.ok(w.snapshot().effects.some(f=>f.kind==='axe'&&Number.isFinite(f.angle)));
console.log('PASS third-hit finisher, knockback, fissure evolution, execute/elite protection, healing, cooldown and snapshot metadata');
