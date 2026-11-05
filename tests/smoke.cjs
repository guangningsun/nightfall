const assert=require('node:assert/strict');
const create=require('../js/survivor/engine');
const calls={};const store={};let windowInfo={windowWidth:390,windowHeight:844,pixelRatio:3,safeArea:{top:44,bottom:810}};
const ctx=new Proxy({measureText(t){return {width:String(t).length*7}},createRadialGradient(){return {addColorStop(){}}}},{get(o,k){return k in o?o[k]:(...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),'finite canvas coordinate '+k)}}});
const wx={createCanvas(){return {getContext:()=>ctx}},createImage(){return {width:400,height:600,set src(v){this.onload&&this.onload()}}},getWindowInfo:()=>windowInfo,getStorageSync:k=>store[k],setStorageSync:(k,v)=>store[k]=JSON.parse(JSON.stringify(v))};
for(const name of ['TouchStart','TouchMove','TouchEnd','TouchCancel','Hide','Show','WindowResize']){wx['on'+name]=fn=>calls[name]=fn;wx['off'+name]=()=>delete calls[name];}
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=()=>{};
let g=create(wx,{manual:true,testing:true});const s=()=>g.getState();const tap=(x,y,id=1)=>{calls.TouchStart({changedTouches:[{identifier:id,clientX:x,clientY:y}]});calls.TouchEnd({changedTouches:[{identifier:id,clientX:x,clientY:y}]});};
assert.equal(s().state,'menu');g.test.setHero('mage');g.start();assert.equal(s().p.weaponLevel,1,'locked mage falls back to hunter');g.test.returnToMenu();assert.equal(s().profile.wins,0);assert.equal(g.version,'0.10.3');s().profile.wins=Math.max(1,s().profile.wins);g.test.setHero('mage');g.start();assert.equal(s().p.novaLevel,1);assert.equal(s().p.maxHp,80);g.draw();
calls.TouchStart({changedTouches:[{identifier:11,clientX:70,clientY:400}]});calls.TouchMove({changedTouches:[{identifier:11,clientX:120,clientY:400}]});const x=s().p.x;g.step(.016);assert.ok(s().p.x>x);const d=s().hitboxes.find(b=>b.w===80);tap(d.x+15,d.y+15,22);assert.ok(s().p.dash>0,'second finger activates dash');calls.TouchEnd({changedTouches:[{identifier:11,clientX:120,clientY:400}]});g.step(.3);assert.equal(s().p.moving,false);
calls.Hide();assert.equal(s().state,'paused');calls.Show();assert.equal(s().state,'paused','resume is explicit');g.pause();assert.equal(s().state,'playing');
g.test.setTime(300);g.test.spawn(false,true);const elite=s().enemies.at(-1);assert.equal(elite.r,48);g.test.hurt(elite,999999);assert.equal(s().chests.length,1);assert.equal(s().chests[0].dropTime,300);
s().p.novaLevel=8;s().p.crystal=true;g.test.openChest(s().chests[0],0);assert.equal(s().p.novaEvolved,true);g.draw();assert.equal(s().state,'chest');s().dialog.actions[0].fn();assert.equal(s().state,'playing');
g.test.setXP(500);g.step(.016);assert.equal(s().state,'upgrade');g.draw();s().dialog.actions[0].fn();while(s().state==='upgrade')s().dialog.actions[0].fn();assert.equal(s().state,'playing');
for(const [w,h] of [[320,568],[844,390],[720,720],[1024,768]]){windowInfo={windowWidth:w,windowHeight:h,pixelRatio:2,safeArea:{top:24,bottom:h-16}};calls.WindowResize();g.draw();assert.equal(s().W,w);assert.equal(s().H,h);}
s().p.hp=0;g.step(.016);assert.equal(s().state,'end');assert.equal(store['nightfall-profile'].runs,1);s().dialog.actions[1].fn();assert.equal(s().state,'menu');g.draw();
g.dispose();assert.equal(Object.keys(calls).length,0);g=create(wx,{manual:true,testing:true});assert.equal(s().profile.runs,1,'storage restored');
// All native screens render without DOM, including portrait/landscape and long cards.
windowInfo={windowWidth:390,windowHeight:1800,pixelRatio:1,safeArea:{top:24,bottom:1784}};calls.WindowResize();
for(const name of ['猎人战绩','超武图鉴','生存秘典']){g.test.returnToMenu();g.draw();const index={'超武图鉴':1,'猎人战绩':3,'生存秘典':5}[name];s().hitboxes[index].fn();g.draw();(name==='超武图鉴'?s().hitboxes.find(b=>b.w===102&&b.h===40):s().hitboxes[0]).fn();}
g.test.returnToMenu();g.draw();s().hitboxes[0].fn();g.draw();assert.equal(s().state,'menu');const cards=s().hitboxes.filter(b=>b.w===b.h);assert.ok(cards.length>=3);cards[0].fn();assert.equal(s().state,'menu');s().hitboxes.at(-1).fn();assert.equal(s().state,'playing');

g.start();for(const time of [120,180,300,420]){g.test.setTime(time);g.step(.016);}assert.equal(s().enemies.filter(e=>e.elite).length,4);
g.test.setTime(600);g.step(.016);assert.equal(s().t,600);assert.equal(s().dawn,true);assert.equal(s().state,'playing');
const final=s().enemies.find(e=>e.finalChest);assert.ok(final);const runs=s().profile.runs;
g.test.hurt(final,1e9);g.step(.016);assert.equal(s().state,'chest');s().dialog.actions[0].fn();assert.equal(s().state,'end');assert.equal(s().profile.wins,2);g.test.end(true);assert.equal(s().profile.runs,runs+1);
g.test.returnToMenu();s().profile.gold=2000000;const before=s().profile.gold;assert.equal(g.test.buyTalent('vitality').ok,true);assert.equal(s().profile.gold,before-15000);assert.equal(s().profile.talents.vitality,1);g.test.setHero('hunter');g.start();assert.equal(s().p.maxHp,115);assert.equal(g.test.buyTalent('might').ok,false);g.test.returnToMenu();
const save=wx.setStorageSync;wx.setStorageSync=()=>{throw Error('full')};const wallet=s().profile.gold;assert.equal(g.test.buyTalent('might').ok,false);assert.equal(s().profile.gold,wallet);assert.equal(s().profile.talents.might,0);wx.setStorageSync=save;
for(let i=0;i<9;i++)assert.equal(g.test.buyTalent('vitality').ok,true);assert.equal(g.test.buyTalent('vitality').ok,false);s().profile.gold=0;assert.equal(g.test.buyTalent('might').ok,false);
s().profile.wins=Math.max(1,s().profile.wins);g.test.setHero('mage');g.start();assert.equal(s().p.weaponLevel,0);assert.equal(s().p.orbs,0);assert.ok(g.test.activeUpgrades().every(u=>!g.test.upgrades.includes(u)));g.test.spawn();const e=s().enemies.at(-1);e.x=70;e.y=0;e.hp=1000;e.max=1000;g.step(.016);assert.equal(s().bullets.length,0);assert.ok(e.hp<1000);assert.ok(e.slow>0);const blinkX=s().p.x;g.test.dash();assert.equal(s().p.x-blinkX,145);assert.ok(s().p.dashing<=0);
s().p.novaLevel=8;s().p.crystal=true;g.test.openChest({dropTime:600},.99);assert.equal(s().p.novaEvolved,true);s().dialog.actions[0].fn();s().p.frostLevel=8;s().p.iceCharm=true;g.test.openChest({dropTime:600},.99);assert.equal(s().p.frostEvolved,true);g.draw();
g.dispose();g=create(wx,{manual:true,testing:true});assert.equal(s().profile.talents.vitality,10);g.dispose();
console.log('PASS dawn cutoff/boss alive/single credit, wallet purchase/insufficient/max/storage rollback/persistence, permanent stats, mage-exclusive upgrades/nova/frost/blink/two evolutions');
console.log('PASS native rendering, 4 sizes, touch movement/multitouch dash, lifecycle, elite chest/evolution, upgrade chain, death/victory, persistent records, screens, cleanup');

// Rogue has a separate arsenal, returning blades, poison traps and contact ambush.
g=create(wx,{manual:true,testing:true});g.test.setHero('rogue');g.start();
assert.equal(s().p.weaponLevel,0);assert.equal(s().p.novaLevel,0);assert.equal(s().p.orbs,0);
assert.ok(g.test.activeUpgrades().every(u=>!g.test.upgrades.includes(u)));
g.test.spawn();const victim=s().enemies.at(-1);Object.assign(victim,{x:35,y:0,hp:10000,max:10000,speed:0});
g.step(.016);assert.ok(s().bullets.length>0&&s().bullets.every(b=>b.blade));assert.ok(victim.poison>0);assert.ok(victim.hp<10000);assert.ok(s().traps.some(t=>t.active));
const blade=s().bullets[0];for(let i=0;i<42;i++)g.step(.016);assert.ok(blade.returning);const hp=victim.hp;victim.x=s().p.x+15;g.test.dash();g.step(.016);assert.ok(victim.hp<hp);assert.ok(s().p.x>0);assert.equal(victim.frozen||0,0);
s().p.bladeLevel=8;s().p.ravenSeal=true;assert.deepEqual(g.test.evolutionCandidates(),['blade']);g.test.openChest({dropTime:600},.99);assert.ok(s().p.bladeEvolved);s().dialog.actions[0].fn();
s().p.trapLevel=8;s().p.venomVial=true;g.test.openChest({dropTime:600},.99);assert.ok(s().p.trapEvolved);s().dialog.actions[0].fn();
s().p.bladeHaste=4;s().p.trapRange=3;s().p.ambushRank=3;s().p.critRank=5;s().p.hp=50;g.test.setXP(8);g.step(.016);assert.equal(s().state,'upgrade');assert.equal(s().choices[0].name,'战地补给');s().dialog.actions[0].fn();assert.equal(s().state,'playing');
for(const [w,h] of [[320,568],[844,390],[720,720]]){windowInfo={windowWidth:w,windowHeight:h,pixelRatio:2};calls.WindowResize();g.draw();}
g.start();assert.equal(s().traps.length,0);g.dispose();
console.log('PASS rogue exclusive arsenal, returning blades, poison trap, damaging ambush, both evolutions, max-upgrade fallback and reset');
// Expanded permanent talents, exponential pricing and forced default trials.
g=create(wx,{manual:true,testing:true});assert.equal(g.test.talents.length,10);assert.ok(g.test.talents.every(t=>t.max>=3&&t.max<=10));const vitality=g.test.talents.find(t=>t.id==='vitality');assert.deepEqual([0,1,2].map(rank=>g.test.talentCost(vitality,rank)),[15000,22500,33750]);
for(const item of g.test.talents)s().profile.talents[item.id]=item.max;
g.test.setHero('hunter');g.start();assert.equal(s().p.maxHp,250);assert.equal(s().p.speed,180*1.25*1.25);assert.equal(s().p.armor,5);assert.equal(s().p.xpBonus,1.4);assert.ok(Math.abs(s().p.coinBonus-.6)<1e-8);assert.equal(s().p.attackInterval,.8);assert.equal(s().p.skillInterval,.7);
g.test.spawn();const armored=s().enemies.at(-1);assert.ok(Math.abs(armored.max-20*1.15*1.4)<1e-8);Object.assign(armored,{x:0,y:0,hp:10000,max:10000,speed:0});s().p.inv=0;const health=s().p.hp;g.step(.016);assert.equal(s().p.hp,health-5);g.test.dash();const cool=s().p.dash;g.step(.07);assert.ok(Math.abs(s().p.dash-(cool-.1))<1e-8);g.dispose();
console.log('PASS 10 permanent talents, 3–10 rank caps, exponential costs, max stats, armor, cooldown and default fast/blood moon');
