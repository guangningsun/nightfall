'use strict';
const CLIENT_VERSION='0.10.3';
const ENDPOINT='wss://brilliantlife.com.cn/nightfall-coop/coop';
const roles=require('./roles');
const heroes=Object.fromEntries(Object.entries(roles).map(([key,value])=>[key,value.name]));
module.exports=function createCoop(wx,{sprite,getSprite,endpoint=ENDPOINT}={}){
 const motion=require('./motion')({buffered:true});const feedback=require('./combat-feedback')();const visuals=require('./coop-visuals')(wx),battleHUD=require('./coop-hud')(wx);const characterCards=require('./character-cards'),cards=characterCards.createCards(wx,getSprite);
 let token='';try{token=wx.getStorageSync?wx.getStorageSync('nightfall-coop-token')||'':''}catch{}
 let profile={wins:0,gold:0,weapons:[]},reward=null;try{const saved=wx.getStorageSync&&wx.getStorageSync('nightfall-coop-profile');if(saved&&Array.isArray(saved.weapons))profile=saved;}catch{}
 function cacheProfile(value){profile=value;try{wx.setStorageSync('nightfall-coop-profile',value)}catch{}}
 function armory(){if(wx.showModal)wx.showModal({title:'联机永久武器',content:'联机金币：'+profile.gold+'\n'+(profile.weapons.length?profile.weapons.map(w=>w.name+'：'+w.bonus).join('\n'):'攻破城门解锁本职业武器。')+'\n武器在下次选择对应职业时自动装备。金币保存在联机账户，暂不与单人钱包合并。',showCancel:false});}
 let treasureUntil=0;let viewport='',rtt=0,lastPing=0,lastInput=0;let diagnostic='',frameAt=0,frameCount=0,fps=0,snapshotGap=0,drawWorld=null;
 let menuScroll=0,menuMax=0;let active=false,phase='home',hero='hunter',socket=null,ready=false,generation=0,room=null,world=null,you='',message='',buttons=[],joy=null,press=null,sendDash=false,lastSnapshot=0,clock=null,pendingCode='',connectionTimer=null;
 function send(data){if(ready&&socket)socket.send({data:JSON.stringify(data),fail:()=>fail('连接中断，请重新组队')});}
 function flushInput(force=false){if(phase!=='playing')return;const now=Date.now();if(!force&&now-lastInput<35)return;lastInput=now;send({type:'input',x:joy?joy.dx/45:0,y:joy?joy.dy/45:0,dash:sendDash});sendDash=false;}
 function stop(){viewport='';generation++;ready=false;if(clock)clearInterval(clock);clock=null;if(connectionTimer)clearTimeout(connectionTimer);connectionTimer=null;if(socket){const old=socket;socket=null;try{old.close({code:1000,reason:'leave'})}catch{}}joy=null;sendDash=false;}
 function fail(text){stop();phase='error';message=text;}
 function connectionError(stage,error){
 const raw=String(error&&(error.errMsg||error.message||error.reason)||'微信未返回具体错误').slice(0,1200);
 let account={},device={};try{account=wx.getAccountInfoSync?wx.getAccountInfoSync().miniProgram||{}:{}}catch{}try{device=wx.getAppBaseInfo?wx.getAppBaseInfo():wx.getSystemInfoSync?wx.getSystemInfoSync():{}}catch{}
 diagnostic=[`客户端 ${CLIENT_VERSION}`,`地址 ${endpoint}`,`阶段 ${stage}`,`AppID ${account.appId||'wx28324f760acc47fa'}`,`环境 ${account.envVersion||'未知'}`,`微信 ${device.version||'未知'} / 基础库 ${device.SDKVersion||'未知'}`,`错误 ${raw}`,error&&error.code!==undefined?`关闭码 ${error.code}`:''].filter(Boolean).join('\n');
 const category=/domain|url not in|合法域名/i.test(raw)?'微信拒绝了域名校验，请查看连接详情':/ssl|tls|cert/i.test(raw)?'安全连接失败，请查看连接详情':/timeout|timed out|超时/i.test(raw)?'连接超时，请查看连接详情':'联机连接失败，请查看连接详情';
 console.warn('[nightfall-coop]',diagnostic);fail(category);
 }
 function details(){if(wx.showModal)wx.showModal({title:'联机诊断信息',content:diagnostic||message,confirmText:'复制详情',cancelText:'关闭',success:r=>{if(r.confirm&&wx.setClipboardData)wx.setClipboardData({data:diagnostic||message});}});}

 function close(){stop();motion.reset();frameAt=0;frameCount=0;fps=0;snapshotGap=0;active=false;room=null;world=null;}
 function open(chosen='hunter',code=''){close();active=true;hero=heroes[chosen]&&characterCards.unlocked(chosen,profile.wins)?chosen:'hunter';phase='home';menuScroll=0;message='';diagnostic='';pendingCode=/^\d{6}$/.test(String(code))?String(code):'';}
 function connect(code,refresh=false){try{token=wx.getStorageSync('nightfall-coop-token')||token;}catch{}stop();menuScroll=0;reward=null;phase='connecting';room=null;world=null;message='正在连接联机服务器…';const epoch=generation;
 if(!wx.connectSocket){fail('当前环境不支持联机，请使用微信开发者工具或真机');return;}
 try{socket=wx.connectSocket({url:endpoint,timeout:10000,success:()=>{},fail:error=>{if(epoch===generation)connectionError('connectSocket.fail',error);}});if(epoch!==generation){if(socket&&socket.close)socket.close({code:1000,reason:'connect failed'});socket=null;return;}if(!socket||typeof socket.onOpen!=='function')throw Error('connectSocket 未返回有效 SocketTask');
 connectionTimer=setTimeout(()=>{if(epoch===generation)connectionError('连接超时',{errMsg:'timeout: 12 秒内未建立连接'});},12000);
 socket.onOpen(()=>{if(epoch!==generation)return;clearTimeout(connectionTimer);connectionTimer=null;ready=true;lastSnapshot=Date.now();send({type:'hello',token,protocol:2});clock=setInterval(()=>{if(phase==='playing'){if(Date.now()-lastSnapshot>8000){fail('服务器响应超时，本局已中止');return;}flushInput(true);}},100);});
 socket.onMessage(event=>{if(epoch!==generation)return;let m;try{m=JSON.parse(event.data)}catch{return;}if(m.type==='profile'){try{if(!wx.setStorageSync)throw Error('存储不可用');wx.setStorageSync('nightfall-coop-token',m.token);}catch{fail('无法保存联机凭证，请清理微信存储空间后重试');return;}token=m.token;cacheProfile(m.profile);if(!characterCards.unlocked(hero,profile.wins))hero='hunter';if(refresh){stop();phase='home';message='解锁进度已同步';return;}send({type:code?'join':'create',hero,code});}else if(m.type==='pong'){rtt=Math.max(0,Date.now()-m.at);}else if(m.type==='reward'){cacheProfile(m.profile);reward=m;}else if(m.type==='room'){room=m;you=m.you;phase='lobby';message='';}else if(m.type==='snapshot'){const nextWorld=require('./wire').decode(m.world);if(world&&world.id===nextWorld.id&&nextWorld.chests.length<world.chests.length)treasureUntil=Date.now()+1500;world=nextWorld;visuals.observe(world,Date.now());feedback.observe(world,Date.now());you=m.you;const now=Date.now();snapshotGap=lastSnapshot?now-lastSnapshot:0;lastSnapshot=now;motion.push(world,now);phase=world.status==='playing'?'playing':'end';}else if(m.type==='error'){message=m.message;if(phase==='connecting')fail(m.message);}else if(m.type==='aborted'&&phase!=='end')fail(m.message);});
 socket.onError(error=>{if(epoch===generation)connectionError('SocketTask.onError',error);});socket.onClose(event=>{if(epoch===generation&&phase!=='end')connectionError('SocketTask.onClose',event);});
 }catch(error){if(epoch===generation)connectionError('客户端异常',error);}}
 function join(){if(wx.showModal)wx.showModal({title:'加入好友房间',editable:true,placeholderText:'输入六位房间号',success:r=>{if(!active||phase!=='home'||!r.confirm)return;const code=String(r.content||'').trim();if(/^\d{6}$/.test(code))connect(code);else message='请输入六位数字房间号';}});}
 function invite(){if(!room)return;if(wx.shareAppMessage)try{wx.shareAppMessage({title:'一起攻城！突破两道防线，攻破核心大门',imageUrl:'images/survivor/forest.png',query:'room='+room.code+'&source=coop&version=0.10.3'});}catch{message='分享暂不可用，可复制房间号邀请';}}
 function text(ctx,str,x,y,size=14,color='#eee3d4',align='left'){ctx.fillStyle=color;ctx.font=`${size}px sans-serif`;ctx.textAlign=align;ctx.fillText(str,x,y);}
 function castleArt(ctx,x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);box(ctx,-340,-250,680,500,'#363342');box(ctx,-310,-220,620,440,'#1c1c2b');for(const yy of [-250,230]){box(ctx,-340,yy,680,20,'#777180');for(let xx=-330;xx<340;xx+=48)box(ctx,xx,yy-12,26,20,'#8c8490');}box(ctx,-340,-250,24,500,'#6b6675');box(ctx,316,-250,24,500,'#6b6675');box(ctx,-70,218,140,42,'#795647');box(ctx,-52,220,104,38,'#201b28');for(const xx of [-270,270])for(const yy of [-220,220]){box(ctx,xx-32,yy-32,64,64,'#61586d');box(ctx,xx-24,yy-42,48,20,'#9e8ca0');}ctx.restore();}
 function box(ctx,x,y,w,h,color='#282031'){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
 function button(ctx,label,x,y,w,h,fn){require('./button-ui').draw(ctx,label,x,y,w,h,{pressed:!!(press&&press.b&&press.b.x===x&&press.b.y===y)});buttons.push({x,y,w,h,fn});}
 function draw(ctx,W,H,top=24,bottom=16){if(!active)return;const now=Date.now();if(!frameAt)frameAt=now;frameCount++;if(now-frameAt>=1000){fps=Math.round(frameCount*1000/(now-frameAt));frameCount=0;frameAt=now;}drawWorld=motion.sample(now);buttons=[];box(ctx,0,0,W,H,'#100d19');if(ready){const size=W+'x'+H;if(viewport!==size){viewport=size;send({type:'viewport',width:W,height:H});}if(now-lastPing>3000){lastPing=now;send({type:'ping',at:now});}}
 if((phase==='playing'||phase==='end')&&world){const me=drawWorld.players.find(p=>p.id===you);if(!me)return;const sx=W/2-me.x,sy=H/2-me.y;
 ctx.save();ctx.translate(sx,sy);ctx.strokeStyle='#292635';ctx.lineWidth=1;ctx.beginPath();for(let x=Math.floor((me.x-W/2)/80)*80;x<me.x+W/2;x+=80){ctx.moveTo(x,me.y-H/2);ctx.lineTo(x,me.y+H/2);}for(let y=Math.floor((me.y-H/2)/80)*80;y<me.y+H/2;y+=80){ctx.moveTo(me.x-W/2,y);ctx.lineTo(me.x+W/2,y);}ctx.stroke();
 if(drawWorld.defenses)require('./siege-scene').draw(ctx,drawWorld,me,W,H);else if(drawWorld.castle)castleArt(ctx,drawWorld.castle.x,drawWorld.castle.y);
 const visible=o=>Math.abs(o.x-me.x)<W/2+100&&Math.abs(o.y-me.y)<H/2+100;
 for(const d of drawWorld.drops)if(visible(d)){box(ctx,d.x-3,d.y-4,6,8,'#5dcbd9');}
 for(const d of drawWorld.chests)if(visible(d))box(ctx,d.x-10,d.y-8,20,16,'#efbd58');
 for(const tr of drawWorld.traps)if(visible(tr)){ctx.strokeStyle='#a7ea6f';ctx.beginPath();ctx.arc(tr.x,tr.y,tr.active?60:12,0,Math.PI*2);ctx.stroke();}
 for(const e of drawWorld.enemies)if(visible(e)){if(e.structure){if(e.structure==='tower'){visuals.tower(ctx,e,drawWorld.time,e.stage===(drawWorld.stage||0));}else{visuals.gate(ctx,e,drawWorld.time,e.stage===(drawWorld.stage||0));}box(ctx,e.x-36,e.y-50,72,5,'#32222a');box(ctx,e.x-36,e.y-50,72*Math.max(0,e.hp/e.max),5,'#e5b46e');continue;}if(sprite)sprite(e.elite?3:0,e.x,e.y,e.elite?2.6:1.25,drawWorld.time*8,e.x<me.x?1:-1,feedback.hit(e.id,now));else box(ctx,e.x-e.r,e.y-e.r,e.r*2,e.r*2,'#b84248');if(e.elite){box(ctx,e.x-30,e.y-45,60,4,'#291f27');box(ctx,e.x-30,e.y-45,60*Math.max(0,e.hp/e.max),4,'#db666b');}}
 for(const b of drawWorld.shots)if(visible(b))visuals.shot(ctx,b);
 const simple=fps>0&&fps<42,budget=simple?16:36,age=Math.min(.5,(now-lastSnapshot)/1000);let effectCount=0;
 for(let i=drawWorld.effects.length-1;i>=0&&effectCount<budget;i--){const fx=drawWorld.effects[i];if(visible(fx)){visuals.effect(ctx,fx,age,simple);effectCount++;}}
 feedback.draw(ctx,now,visible,simple);
 for(const p of drawWorld.players){if(!visible(p))continue;visuals.aura(ctx,p,drawWorld.time,p.id===you);if(p.hero==='tank'||p.hero==='medic'){box(ctx,p.x-12,p.y-20,24,34,roles[p.hero].color);box(ctx,p.x-8,p.y-30,16,14,'#ecd7b7');if(p.hero==='tank'){box(ctx,p.x-25,p.y-12,14,28,'#a39b83');box(ctx,p.x-23,p.y-9,10,20,'#ecd08b');}else{box(ctx,p.x+18,p.y-22,4,38,'#ddd4ac');box(ctx,p.x+12,p.y-24,16,4,'#fff4cc');}}else if(sprite)sprite(p.hero,p.x,p.y,1.5,drawWorld.time*8,p.dx<0?-1:1);box(ctx,p.x-22,p.y-42,44,5,'#362a30');box(ctx,p.x-22,p.y-42,44*Math.max(0,p.hp/p.maxHp),5,p.id===you?'#9ae6bc':'#b3a0ff');text(ctx,(p.id===you?'你 · ':'队友 · ')+heroes[p.hero],p.x,p.y-51,11,'#ffdc9c','center');if(p.hp<=0)text(ctx,`倒地 ${p.revive.toFixed(1)}/3s`,p.x,p.y+34,12,'#ffabab','center');}
 ctx.restore();battleHUD.draw(ctx,{width:W,top,player:me,coop:true,time:world.time,kills:drawWorld.kills,gold:drawWorld.gold,level:me.level,xp:me.xp,need:me.need});
 if(phase==='end'){box(ctx,15,H/2-100,W-30,200,'#241a30');text(ctx,drawWorld.status==='won'?'城门攻破 · 合作胜利':drawWorld.reason==='timeout'?'白昼到来 · 攻城未完成':'全员倒下 · 征战结束',W/2,H/2-60,20,'#ffe0a3','center');text(ctx,drawWorld.reward?(reward?'已到账 '+reward.gold+' 金币 · '+reward.weapon.name:'正在保存攻城奖励，请稍候…'):'本次未破门，没有永久奖励',W/2,H/2-25,12,'#e9d1a1','center');button(ctx,drawWorld.reward&&!reward?'查询奖励到账':'返回行宫',W/2-110,H/2+12,220,48,()=>{if(drawWorld.reward&&!reward)send({type:'claim'});else close();});return;}
 text(ctx,`${fps||'—'} 帧 · ${rtt||'—'}毫秒 · 版本${CLIENT_VERSION}${now-lastSnapshot>500?' · 网络等待':''}`,18,top+120,10,now-lastSnapshot>500?'#ffb08e':'#a899b8');
 const gate=drawWorld.enemies.find(e=>e.structure==='gate'&&e.stage===(drawWorld.stage||0));if(gate){const direction=gate.y<me.y?'↑':'↓';text(ctx,`${direction} 目标 ${Math.ceil(gate.hp)}/${gate.max} · 距离 ${Math.round(Math.hypot(gate.x-me.x,gate.y-me.y))}`,18,top+142,12,'#e4c18d');}
 require('./siege-scene').progress(ctx,drawWorld,W,top+154);visuals.banner(ctx,W,top+186,now);feedback.streak(ctx,W,top+251,now);if(now<treasureUntil){require('./reward-ui').chest(ctx,W-114,H-bottom-222,96,112,1.5-(treasureUntil-now)/1000);text(ctx,'宝箱已开启',W-66,H-bottom-99,12,'#ffe6a0','center');}
 button(ctx,'退出',W-72,top+106,64,38,()=>{if(wx.showModal)wx.showModal({title:'退出联机？',content:'退出会结束两人的本局战斗。',success:r=>{if(r.confirm)close();}});});
 if(me.choices.length){const ui=require('./reward-ui');buttons.push(...ui.choices(ctx,W,H,top,bottom,me.choices.map(c=>({...c,fn:()=>{send({type:'choose',key:c.key});joy=null;flushInput(true);}})),'升级了！','剩余 '+Math.ceil(me.choiceTime)+' 秒 · 选择时停步无敌，队友继续战斗'));return;}

 if(me.hp<=0)text(ctx,'等待队友靠近 3 秒救援',W/2,H-bottom-70,18,'#f0b8c7','center');else button(ctx,me.cool>0?Math.ceil(me.cool)+'s':require('./extra-heroes').is(me.hero)?require('./extra-heroes').defs[me.hero].active:me.hero==='tank'?'嘲讽':me.hero==='medic'?'急救':me.hero==='mage'?'闪现':me.hero==='rogue'?'影袭':'冲刺',W-100,H-bottom-86,84,68,()=>{sendDash=true;flushInput(true);});
 if(joy){ctx.strokeStyle='#aa96bd';ctx.beginPath();ctx.arc(joy.x,joy.y,45,0,Math.PI*2);ctx.stroke();}else text(ctx,'拖动移动 · 靠近倒地队友可救援',18,H-bottom-20,11,'#b5a8c7');return;}
 ctx.save();ctx.globalAlpha=.18;castleArt(ctx,W/2,H*.65,Math.min(W/780,H/700));ctx.restore();
 const wide=W>H,w=Math.min(W-32,520),x=(W-w)/2,y=top+38-menuScroll;text(ctx,'王城远征 · 三重防线',W/2,top+18,21,'#ffe0ac','center');
 if(phase==='home'){menuMax=0;
 text(ctx,'两道防线 · 核心大门 · 两人协作',W/2,y+8,13,'#d8c9de','center');
 const columns=wide?5:3,bw=(w-(columns-1)*10)/columns,ch=bw;
 Object.keys(heroes).forEach((key,i)=>{const bx=x+(i%columns)*(bw+10),by=y+26+Math.floor(i/columns)*(ch+10),locked=!characterCards.unlocked(key,profile.wins);cards.draw(ctx,key,bx,by,bw,ch,{locked,selected:hero===key});buttons.push({x:bx,y:by,w:bw,h:ch,fn:()=>{if(locked){message='每次攻城胜利解锁下一位角色';}else{hero=key;message='';}}});});
 const controls=y+36+Math.ceil(Object.keys(heroes).length/columns)*(ch+10),cx=x,cw=w;menuMax=Math.max(0,controls+menuScroll+250-(H-bottom));
 button(ctx,'创建房间',cx,controls,cw,44,()=>connect());button(ctx,pendingCode?'加入邀请队伍 '+pendingCode:'输入房间号加入',cx,controls+52,cw,44,()=>pendingCode?connect(pendingCode):join());
 button(ctx,'武器库 · 金币 '+profile.gold+' · 已解锁 '+profile.weapons.length,cx,controls+104,cw,36,armory);
 if(message)text(ctx,message,W/2,controls+145,12,'#f1a9b5','center');button(ctx,'同步解锁进度 · 已通关 '+(profile.wins||0)+' 次',cx,controls+156,cw,36,()=>connect(undefined,true));button(ctx,'返回单人行宫',cx,controls+202,cw,40,close);
 }
 else if(phase==='lobby'&&room){text(ctx,'城门集结 '+room.code+' · '+room.players.length+'/2',W/2,y+10,23,'#ffe0a3','center');text(ctx,room.players.map(p=>heroes[p.hero]+(p.id===you?'（你）':'')).join('  +  '),W/2,y+44,15,'#dfcee9','center');button(ctx,'邀请微信好友',x,y+66,w,44,invite);button(ctx,'复制房间号',x,y+118,w,40,()=>wx.setClipboardData&&wx.setClipboardData({data:room.code}));button(ctx,you===room.host?'开始攻城（需两人到齐）':'等待房主开局',x,y+166,w,44,()=>{if(you===room.host)send({type:'start'});});if(message)text(ctx,message,W/2,y+232,12,'#efb0bc','center');button(ctx,'退出房间',x,Math.min(H-bottom-46,y+248),w,40,close);}
 else {text(ctx,message,W/2,y+55,Math.min(14,(W-30)/26),'#dfcddd','center');button(ctx,'返回组队',x,y+110,w,44,()=>open(hero));button(ctx,'返回行宫',x,y+165,w,44,close);if(phase==='error')button(ctx,'查看连接详情',x,y+220,w,44,details);}}
 function point(t){return {id:t.identifier,x:t.clientX===undefined?t.x:t.clientX,y:t.clientY===undefined?t.y:t.clientY};}
 function touchStart(e){for(const t of e.changedTouches||[]){const q=point(t),b=buttons.find(b=>q.x>=b.x&&q.x<=b.x+b.w&&q.y>=b.y&&q.y<=b.y+b.h);if(b){press={...q,b};}else if(phase==='home')press={...q,b:null};else if(phase==='playing'&&!joy)joy={...q,dx:0,dy:0};}}
 function touchMove(e){for(const t of e.changedTouches||[]){const q=point(t);if(phase==='home'&&press&&press.id===q.id){const delta=press.y-q.y;if(Math.abs(delta)>5){menuScroll=Math.max(0,Math.min(menuMax,menuScroll+delta));press.y=q.y;press.b=null;}}if(joy&&q.id===joy.id){const x=q.x-joy.x,y=q.y-joy.y,n=Math.max(1,Math.hypot(x,y)/45);joy.dx=x/n;joy.dy=y/n;flushInput();}}}
 function touchEnd(e){for(const t of e.changedTouches||[]){const q=point(t);if(joy&&joy.id===q.id){joy=null;flushInput(true);}if(press&&press.id===q.id){const b=press.b;press=null;if(b&&q.x>=b.x&&q.x<=b.x+b.w&&q.y>=b.y&&q.y<=b.y+b.h)b.fn();}}}
 function hide(){joy=null;sendDash=false;send({type:'input',x:0,y:0});}
 function invitation(event){const code=event&&event.query&&event.query.room;if(/^\d{6}$/.test(String(code))&&!active)open(hero,code);}
 return {open,close,draw,touchStart,touchMove,touchEnd,touchCancel(){joy=null;press=null;flushInput(true);},hide,invitation,get active(){return active},get phase(){return phase},dispose:stop};
};
