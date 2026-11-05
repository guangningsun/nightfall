'use strict';
module.exports=function createCloud(wx,{read,restore,notify,endpoint='wss://brilliantlife.com.cn/nightfall-coop/coop'}){
 let busy=false,disposed=false,socket=null,timer=null,revision=null,status='尚未同步',dirty=false,retryTimer=null;
 try{dirty=!!wx.getStorageSync('nightfall-cloud-dirty');const n=wx.getStorageSync('nightfall-cloud-revision');if(Number.isInteger(n)&&n>=0)revision=n;}catch{}
 function finish(message){busy=false;status=message;if(timer)clearTimeout(timer);timer=null;const old=socket;socket=null;if(old)try{old.close()}catch{}}
 function sync(mode='upload',manual=false,recoveryToken=''){
 if(disposed||busy||!wx.connectSocket)return;busy=true;status='正在同步…';
 let token='',sent,closing=false;
 try{token=recoveryToken||wx.getStorageSync('nightfall-coop-token')||'';}catch{}
 const fail=message=>{if(closing||disposed)return;closing=true;finish(message);if(manual)notify(message);};
 try{socket=wx.connectSocket({url:endpoint,timeout:10000,success(){},fail(){fail('同步失败，已保留本地存档');}});
 if(closing||disposed){try{socket.close()}catch{}socket=null;return;}
 timer=setTimeout(()=>fail('同步超时，请稍后重试'),12000);
 socket.onOpen(()=>{if(socket&&!closing)socket.send({data:JSON.stringify({type:'hello',token})});});
 socket.onError(()=>fail('网络不可用，已保留本地存档'));
 socket.onClose(()=>{if(!closing)fail('连接中断，已保留本地存档');});
 const send=m=>socket.send({data:JSON.stringify(m)});
 socket.onMessage(e=>{if(closing||disposed)return;try{const m=JSON.parse(e.data);
 if(m.type==='error'){fail(m.message);return;}
 if(m.type==='profile'){token=m.token;if(!recoveryToken)wx.setStorageSync('nightfall-coop-token',m.token);send({type:'soloGet'});return;}
 if(m.type!=='solo')return;
 if(mode==='restore'){
 if(!m.save.profile){fail('云端暂无存档');return;}
 restore(m.save.profile);wx.setStorageSync('nightfall-coop-token',token);revision=m.save.revision;wx.setStorageSync('nightfall-cloud-revision',revision);dirty=false;wx.setStorageSync('nightfall-cloud-dirty',false);closing=true;finish('已恢复云端存档');notify('已恢复云端存档，原本地存档已备份');return;
 }
 if(!sent){
 const canonical=v=>JSON.stringify(v,Object.keys(v||{}).sort());const local=read(),remote=m.save.profile;
 const same=remote&&['gold','runs','wins','total'].every(k=>local[k]===remote[k])&&canonical(local.talents)===canonical(remote.talents)&&JSON.stringify(local.history.map(r=>Object.keys(r).sort().map(k=>[k,r[k]])))===JSON.stringify(remote.history.map(r=>Object.keys(r).sort().map(k=>[k,r[k]])));
 if(same){revision=m.save.revision;wx.setStorageSync('nightfall-cloud-revision',revision);dirty=false;wx.setStorageSync('nightfall-cloud-dirty',false);closing=true;finish('云端与本地一致');if(manual)notify('云端与本地一致');return;}

 if(m.save.profile&&(revision===null||revision!==m.save.revision)){fail('云端存在不同版本，请先恢复或保留本地；本次未覆盖');return;}
 revision=m.save.revision;sent=JSON.parse(JSON.stringify(read()));send({type:'soloPut',revision,profile:sent});return;
 }
 revision=m.save.revision;wx.setStorageSync('nightfall-cloud-revision',revision);
 dirty=JSON.stringify(read())!==JSON.stringify(sent);wx.setStorageSync('nightfall-cloud-dirty',dirty);closing=true;finish('已保存到服务器');if(dirty)retryTimer=setTimeout(()=>sync(),2000);if(manual)notify('战绩、金币、解锁与永久技能已保存到服务器');
 }catch{fail('存档同步失败，未删除本地数据');}});
 }catch{fail('暂时无法同步');}
 }
 return {sync,changed(){dirty=true;try{wx.setStorageSync('nightfall-cloud-dirty',true)}catch{}sync();},retry(){if(dirty)sync();},get busy(){return busy},get status(){return status},dispose(){disposed=true;if(retryTimer)clearTimeout(retryTimer);finish(status)}};
};
