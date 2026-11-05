'use strict';
const http=require('node:http'),crypto=require('node:crypto');
const {WebSocketServer,WebSocket}=require('ws');
const {World}=require('./world.cjs');
const {Profiles,weapons}=require('./profiles.cjs');
function createServer({port=Number(process.env.PORT)||10000,host=process.env.HOST||'127.0.0.1',dataDir=null}={}){
const rooms=new Map(),clients=new Set(),profiles=new Profiles(dataDir);
const server=http.createServer((req,res)=>{if(req.url!=='/health'){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({ok:true,version:'0.10.3',rooms:rooms.size}));});
const wss=new WebSocketServer({server,path:'/coop',maxPayload:16384,perMessageDeflate:false});
function send(c,msg){if(c.ws.readyState===WebSocket.OPEN){if(c.ws.bufferedAmount>1024*1024){c.ws.close(1013,'slow connection');return;}c.ws.send(JSON.stringify(msg));}}
function snapshot(c,r){if(c.ws.bufferedAmount>64*1024&&r.world.status==='playing')return;const world=r.world.snapshot(c.protocol===2?{id:c.id,width:c.width||900,height:c.height||900}:null);if(c.protocol===2){world.packed=true;world.enemies=world.enemies.map(e=>[e.id,e.x,e.y,e.hp,e.max,e.r,(e.elite?1:0)|(e.boss?2:0),e.structure||null,e.range||0,e.stage||0]);}send(c,{type:'snapshot',world,you:c.id});}
function lobby(r){for(const c of r.members)send(c,{type:'room',code:r.code,host:r.members[0].id,players:r.members.map(c=>({id:c.id,hero:c.hero})),you:c.id});}
function leave(c){const r=c.room;c.room=null;if(!r)return;r.members=r.members.filter(q=>q!==c);if(r.world){for(const q of r.members){send(q,{type:'aborted',message:'队友离开或断线，本局已结束，请重新组队。'});q.room=null;}rooms.delete(r.code);}else if(!r.members.length)rooms.delete(r.code);else lobby(r);}
wss.on('connection',ws=>{if(clients.size>=32){ws.close(1013,'server busy');return;}const c={ws,id:crypto.randomUUID(),hero:'hunter',room:null,window:Date.now(),count:0,alive:true};clients.add(c);ws.on('pong',()=>c.alive=true);ws.on('error',()=>{});ws.on('close',()=>{leave(c);clients.delete(c)});
ws.on('message',raw=>{try{const now=Date.now();if(now-c.window>1000){c.window=now;c.count=0;}if(++c.count>60){ws.close(1008,'rate limit');return;}const m=JSON.parse(raw);if(!m||typeof m!=='object')return;
if(m.type==='hello'){if(c.token)throw Error('已经登录');c.protocol=m.protocol===2?2:1;c.token=profiles.login(m.token);send(c,{type:'profile',token:c.token,profile:profiles.get(c.token)});}
else if(m.type==='soloGet'){send(c,{type:'solo',save:require('./solo-save.cjs').get(profiles,c.token)});}
else if(m.type==='soloPut'){send(c,{type:'solo',save:require('./solo-save.cjs').put(profiles,c.token,m.revision,m.profile)});}
else if(m.type==='create'||m.type==='join'){if(!c.token)throw Error('请更新至 v0.10.3 并重新连接');if(c.room)throw Error('请先退出当前房间');if(!['hunter','mage','rogue','tank','medic',...require('./extra-heroes.cjs').order].includes(m.hero))throw Error('角色无效');if(!profiles.get(c.token).unlocked.includes(m.hero))throw Error('该角色尚未解锁，请先通关攻城');c.hero=m.hero;if(m.type==='create'){if(rooms.size>=8)throw Error('房间已满，请稍后重试');let code;do{code=String(crypto.randomInt(100000,1000000));}while(rooms.has(code));const r={code,members:[c],created:now};rooms.set(code,r);c.room=r;}else{if(!/^\d{6}$/.test(String(m.code)))throw Error('请输入六位房间号');const r=rooms.get(String(m.code));if(!r)throw Error('房间不存在或已过期');if(r.world||r.members.length>=2)throw Error('房间已满或已开局');r.members.push(c);c.room=r;}lobby(c.room);}
else if(m.type==='ping')send(c,{type:'pong',at:m.at});
else if(m.type==='viewport'){c.width=Math.max(320,Math.min(2400,Number(m.width)||900));c.height=Math.max(320,Math.min(2400,Number(m.height)||900));}
else if(m.type==='leave')leave(c);
else if(m.type==='start'){const r=c.room;if(!r||r.members[0]!==c||r.members.length!==2||r.world)throw Error('需要房主且两人到齐才能开始');r.world=new World(r.members.map(q=>({id:q.id,hero:q.hero,permanent:profiles.get(q.token).weapons.some(w=>w.id===weapons[q.hero].id)})),{siege:true});for(const q of r.members)snapshot(q,r);}
else if(m.type==='claim'&&c.room?.world?.reward){award(c.room);}
else if(m.type==='input'&&c.room?.world)c.room.world.input(c.id,m);
else if(m.type==='choose'&&c.room?.world&&c.room.world.status==='playing')c.room.world.choose(c.id,m.key);
}catch(e){send(c,{type:'error',message:e instanceof SyntaxError?'消息格式错误':e.message});}});});
function award(r){if(r.awarded||Date.now()<(r.rewardRetry||0))return;r.rewardRetry=Date.now()+2000;try{profiles.reward(r.world,r.members);r.awarded=true;for(const c of r.members)send(c,{type:'reward',run:r.world.id,profile:profiles.get(c.token),gold:500+r.world.gold,weapon:weapons[c.hero]});}catch(error){if(!r.rewardError){r.rewardError=true;for(const c of r.members)send(c,{type:'error',message:'奖励保存暂时失败，请留在结算页等待重试'});console.error('Reward persistence failed:',error.message);}}}
let ticks=0;const timer=setInterval(()=>{ticks++;for(const r of rooms.values()){if(r.world?.reward&&!r.awarded)award(r);if(!r.world){if(Date.now()-r.created>15*60*1000){for(const c of [...r.members]){send(c,{type:'aborted',message:'房间已过期'});leave(c);}}continue;}if(r.world.status==='playing'){r.world.step(.05);if(r.world.reward)award(r);if(ticks%2===0||r.world.status!=='playing')for(const c of r.members)snapshot(c,r);}else if(!r.finished)r.finished=Date.now();else if(Date.now()-r.finished>60000)for(const c of [...r.members])leave(c);}},50);
const heartbeat=setInterval(()=>{for(const c of clients){if(!c.alive){c.ws.terminate();continue;}c.alive=false;c.ws.ping();}},15000);
server.listen(port,host);return {server,rooms,close:()=>{clearInterval(timer);clearInterval(heartbeat);for(const c of clients)c.ws.terminate();wss.close();return new Promise(resolve=>server.close(resolve));}};
}
module.exports={createServer};if(require.main===module)createServer({dataDir:process.env.STATE_DIRECTORY||require('node:path').join(__dirname,'data')});
