'use strict';
module.exports=function createRewardedAd(wx,{adUnitId,grant,notify}){
 let busy=false,disposed=false,pending=false,clean=null;
 function award(){try{grant();pending=false;notify('领取成功，已获得 10,000 金币');}catch{pending=true;notify('金币保存失败，请清理存储空间后点击“重试领取”，无需重复观看');}}
 async function watch(){
 if(disposed||busy)return;
 if(pending){award();return;}
 if(!adUnitId){notify('广告暂未开放，请稍后再来');return;}
 if(!wx.createRewardedVideoAd){notify('当前环境不支持激励视频，请更新微信后重试');return;}
 busy=true;let ad,done=false;
 const cleanup=()=>{if(ad){if(ad.offClose)ad.offClose(close);if(ad.offError)ad.offError(error);}if(clean===cancel)clean=null;};
 const finish=()=>{if(done||disposed)return false;done=true;busy=false;cleanup();return true;};
 const close=result=>{if(!finish())return;if(result&&result.isEnded===true){pending=true;award();}else notify('完整观看广告后才能获得金币，本次未发放奖励');};
 const error=()=>{if(finish())notify('广告暂时无法播放，请稍后重试');};
 const cancel=()=>{done=true;cleanup();busy=false;};
 clean=cancel;
 try{ad=wx.createRewardedVideoAd({adUnitId});ad.onClose(close);ad.onError(error);await ad.load();if(done||disposed)return;await ad.show();}
 catch{error();}
 }
 return {watch,get busy(){return busy},get pending(){return pending},dispose(){disposed=true;if(clean)clean();}};
};
