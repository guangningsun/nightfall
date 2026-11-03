'use strict';
// Native friend/group forwarding. Opening the picker does not prove delivery.
module.exports = function setupShare(wx, getRun, pauseRun) {
  function payload(source = 'menu') {
    const run = getRun();
    const result = run.state === 'end';
    return {
      title: result
        ? `我用${run.hero}存活了 ${run.time}，击败 ${run.kills} 个敌人！你能撑到白昼吗？`
        : '暗夜幸存者：三位英雄、六条超武，你能撑过 15 分钟吗？',
      imageUrl: 'images/survivor/forest.png',
      query: `source=${encodeURIComponent(source)}&version=${encodeURIComponent(run.version)}`
    };
  }
  function menuShare() { pauseRun(); return payload('menu'); }
  function share(source) {
    if (typeof wx.shareAppMessage !== 'function') {
      if (wx.showToast) wx.showToast({title:'请在微信真机中分享',icon:'none'});
      return;
    }
    pauseRun();
    try { wx.shareAppMessage(payload(source)); }
    catch (_) { if (wx.showToast) wx.showToast({title:'暂时无法分享，请稍后重试',icon:'none'}); }
  }
  if (wx.onShareAppMessage) wx.onShareAppMessage(menuShare);
  if (wx.showShareMenu) {
    try { wx.showShareMenu({withShareTicket:false}); } catch (_) { /* Older tools may omit this capability. */ }
  }
  return {share, dispose() { if (wx.offShareAppMessage) wx.offShareAppMessage(menuShare); }};
};
