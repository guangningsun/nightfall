'use strict';
const assert=require('node:assert/strict');const {once}=require('node:events');
const {WebSocket}=require('../server/node_modules/ws');const {createServer}=require('../server/index.cjs');const {World}=require('../server/world.cjs');
function connect(url){return new Promise((resolve,reject)=>{const ws=new WebSocket(url),messages=[],waiters=[];ws.on('error',reject);ws.on('message',raw=>{const m=JSON.parse(raw);messages.push(m);for(const fn of [...waiters])fn();});ws.on('open',()=>{ws.send(JSON.stringify({type:'hello'}));resolve({ws,messages,send:m=>ws.send(JSON.stringify(m)),wait(test){return new Promise((res,rej)=>{const check=()=>{const i=messages.findIndex(test);if(i<0)return;clearTimeout(timer);waiters.splice(waiters.indexOf(check),1);res(messages.splice(i,1)[0]);};const timer=setTimeout(()=>{waiters.splice(waiters.indexOf(check),1);rej(Error('message timeout'));},8000);waiters.push(check);check();});}});});});}
(async()=>{const service=process.env.COOP_URL?null:createServer({port:0});const sockets=[];try{if(service)await once(service.server,'listening');const url=process.env.COOP_URL||`ws://127.0.0.1:${service.server.address().port}/coop`;
const a=await connect(url),b=await connect(url),c=await connect(url);sockets.push(a.ws,b.ws,c.ws);
a.send({type:'create',hero:'mage'});assert.match((await a.wait(m=>m.type==='error')).message,/尚未解锁/);a.send({type:'create',hero:'hunter'});const room=await a.wait(m=>m.type==='room');assert.match(room.code,/^\d{6}$/);a.send({type:'start'});assert.match((await a.wait(m=>m.type==='error')).message,/两人/);
b.send({type:'join',hero:'hunter',code:room.code});const joined=await b.wait(m=>m.type==='room');assert.equal(joined.players.length,2);assert.notEqual(joined.you,room.you);
c.send({type:'join',hero:'hunter',code:room.code});assert.match((await c.wait(m=>m.type==='error')).message,/已满/);
b.send({type:'start'});assert.match((await b.wait(m=>m.type==='error')).message,/房主/);
a.send({type:'start'});const sa=await a.wait(m=>m.type==='snapshot'),sb=await b.wait(m=>m.type==='snapshot');assert.equal(sa.world.id,sb.world.id);assert.deepEqual(sa.world.players,sb.world.players);
a.send({type:'input',x:1,y:0});b.send({type:'input',x:0,y:1});const next=await a.wait(m=>m.type==='snapshot'&&m.world.time>=.2);assert.ok(next.world.players[0].x>0);assert.ok(next.world.players[1].y>0);assert.ok(next.world.enemies.length>0);assert.ok(next.world.shots.length>0);
const other=await b.wait(m=>m.type==='snapshot'&&m.world.time===next.world.time);assert.deepEqual(next.world.enemies,other.world.enemies);assert.deepEqual(next.world.players,other.world.players);
a.ws.send('{');assert.match((await a.wait(m=>m.type==='error')).message,/格式/);
b.ws.close();assert.match((await a.wait(m=>m.type==='aborted')).message,/断线/);console.log('PASS two real sockets: room/join/capacity/host-start/movement/shared world/role attacks/invalid JSON/disconnect cleanup');
}finally{for(const ws of sockets)ws.terminate();if(service)await service.close();}
if(process.env.COOP_URL)return;
const w=new World([{id:'a',hero:'hunter'},{id:'b',hero:'mage'}]);w.spawnClock=999;w.nextElite=999;w.players[0].hp=0;w.players[1].x=30;for(let i=0;i<65;i++)w.step(.05);assert.ok(w.players[0].hp>0,'revive after 3s');
const p=w.players[0];p.xp=20;w.offer(p);const time=w.time;w.step(.05);assert.ok(w.time>time);assert.ok(p.choices.length);w.choose('a','fake');assert.ok(p.choices.length);const before=p.a;w.choose('a','a');assert.equal(p.a,before+1);p.xp=100;w.offer(p);for(let i=0;i<162;i++)w.step(.05);assert.ok(p.a>before+1,'auto choose');
p.a=8;p.accA=true;p.xp=0;p.choices=[];w.chests.push({x:p.x,y:p.y,time:600});w.step(.05);assert.ok(p.evoA);w.time=899.99;w.step(.05);assert.equal(w.time,900);assert.equal(w.status,'won');const frozen=w.time;w.step(.05);assert.equal(w.time,frozen);
const loss=new World([{id:'x',hero:'rogue'},{id:'y',hero:'mage'}]);loss.players.forEach(p=>p.hp=0);loss.step(.05);assert.equal(loss.status,'lost');
console.log('PASS server authority: revival, independent/timed upgrades, invalid selection, chest evolution, 15-minute cutoff, team death');
})().catch(e=>{console.error(e);process.exitCode=1;});
