const assert=require('node:assert/strict'),fs=require('node:fs'),extra=require('../js/survivor/extra-heroes'),cards=require('../js/survivor/character-cards'),{World}=require('../server/world.cjs'),{Profiles}=require('../server/profiles.cjs');
assert.equal(fs.readFileSync(require.resolve('../server/extra-heroes.cjs'),'utf8'),fs.readFileSync(require.resolve('../js/survivor/extra-heroes'),'utf8'));
for(const [i,k] of extra.order.entries()){assert.equal(cards.unlocked(k,i+2,true),false);assert.equal(cards.unlocked(k,i+3,true),true);assert.equal(cards.unlocked(k,i+4),false);assert.equal(cards.unlocked(k,i+5),true);
 const w=new World([{id:'a',hero:k},{id:'b',hero:'hunter'}]);w.spawnClock=999;w.nextElite=999;
 const p=w.players[0];assert.equal(p.maxHp,extra.defs[k].hp);
 w.enemies=[{id:10,x:60,y:0,r:14,hp:10000,max:10000,speed:0}];for(let j=0;j<20;j++)w.step(.05);assert.ok(w.enemies[0].hp<10000,k+' attacks');p.cool=0;w.dash(p);assert.ok(p.cool>0,k+' active');
 p.a=p.b=8;p.accA=p.accB=true;w.chests=[{x:p.x,y:p.y,time:600}];w.step(.05);assert.equal(p.evoA,true,k+' main evolves');w.chests=[{x:p.x,y:p.y,time:600}];w.step(.05);assert.equal(p.evoB,true,k+' secondary evolves');
}
const ctx=new Proxy({measureText:s=>({width:String(s).length*7})},{get:(o,k)=>o[k]||(()=>{})});
const wx={createCanvas:()=>({getContext:()=>ctx}),createImage:()=>({}),getWindowInfo:()=>({windowWidth:390,windowHeight:844,pixelRatio:1}),getStorageSync:()=>null,setStorageSync(){}};
for(const k of ['TouchStart','TouchMove','TouchEnd','TouchCancel','Hide','Show','WindowResize'])wx['on'+k]=()=>{};global.cancelAnimationFrame=()=>{};
const game=require('../js/survivor/engine')(wx,{manual:true,testing:true});game.getState().profile.wins=10;
for(const k of extra.order){game.test.setHero(k);game.start();let s=game.getState();assert.equal(s.p.skin,k);assert.equal(s.p.weaponLevel,0);assert.equal(game.test.activeUpgrades()[0].name,extra.defs[k].main);game.test.spawn();const e=s.enemies[0];e.x=60;e.y=0;e.hp=e.max=10000;for(let i=0;i<20;i++)game.step(.05);assert.ok(e.hp<10000,k+' solo attacks');game.test.dash();assert.ok(s.p.dash>0);s.p.a=s.p.b=8;s.p.accA=s.p.accB=true;game.test.openChest({dropTime:600},0);assert.equal(s.p.evoA,true);game.getState().dialog.actions[0].fn();game.test.openChest({dropTime:600},0);assert.equal(s.p.evoB,true);}
game.dispose();
const profiles=new Profiles(),token=profiles.login();for(let i=0;i<9;i++)profiles.reward({id:'win'+i,gold:0},[{token,hero:'hunter'}]);assert.equal(profiles.get(token).unlocked.length,10);profiles.reward({id:'new',gold:0},[{token,hero:'borin'}]);assert.ok(profiles.get(token).weapons.some(w=>w.id==='siege-borin'));
console.log('PASS five distinct heroes: single/coop combat, active skills, upgrades, both evolutions, sequential unlock and permanent reward');
