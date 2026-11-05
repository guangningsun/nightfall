'use strict';
const assert=require('node:assert/strict'),{World}=require('../server/world.cjs'),{decode}=require('../js/survivor/wire');
const w=new World([{id:'a',hero:'hunter'},{id:'b',hero:'mage'}],{siege:true});
for(let i=0;i<1991;i++)w.enemies.push({id:100+i,x:(i%50)*90-2200,y:Math.floor(i/50)*90-1800,hp:100,max:100,r:14,speed:50,slow:0,poison:0});
const view=w.snapshot({id:'a',width:390,height:844});
assert.equal(w.enemies.length,2000);assert.equal(view.enemies.filter(e=>e.structure).length,9);
assert.ok(view.enemies.some(e=>!e.structure));assert.ok(view.enemies.length<400);
const packed={...view,packed:true,enemies:view.enemies.map(e=>[e.id,e.x,e.y,e.hp,e.max,e.r,(e.elite?1:0)|(e.boss?2:0),e.structure||null,e.range||0,e.stage||0])};
const restored=decode(packed);assert.equal(restored.enemies.length,view.enemies.length);assert.equal(restored.enemies[0].structure,'gate');assert.equal(restored.enemies[6].stage,2);
assert.deepEqual(restored.players,view.players);
const fullBytes=Buffer.byteLength(JSON.stringify(w.snapshot())),wireBytes=Buffer.byteLength(JSON.stringify(packed));
const ticks=[],encode=[];for(let i=0;i<100;i++){const t=performance.now();w.step(.05);ticks.push(performance.now()-t);const s=performance.now();JSON.stringify(w.snapshot({id:'a',width:390,height:844}));encode.push(performance.now()-s);}
ticks.sort((a,b)=>a-b);encode.sort((a,b)=>a-b);
console.log(JSON.stringify({scenario:'2000 enemies spread over map; 390x844 viewport',fullBytes,wireBytes,reduction:1-wireBytes/fullBytes,stepP95ms:ticks[94],snapshotP95ms:encode[94]}));
const m=require('../js/survivor/motion')({extrapolate:true});const f=x=>({id:'run',status:'playing',time:0,players:[{id:'a',x,y:0}],enemies:[],shots:[]});
m.push(f(0),1000);m.push(f(10),1100);assert.equal(m.sample(1250).players[0].x,15);assert.equal(m.sample(4000).players[0].x,15,'prediction is bounded during stalls');
console.log('PASS view culling, global structures, tuple round-trip and bounded extrapolation');
