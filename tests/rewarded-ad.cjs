const assert=require('node:assert/strict'),create=require('../js/survivor/rewarded-ad');
(async()=>{
 let callbacks={},earned=0,failSave=false,shows=0;
 const ad={onClose:f=>callbacks.close=f,onError:f=>callbacks.error=f,offClose(){},offError(){},load:async()=>{},show:async()=>{shows++;}};
 const wx={createRewardedVideoAd:()=>ad};
 const r=create(wx,{adUnitId:'adunit-test',grant(){if(failSave)throw Error('storage');earned+=10000;},notify(){}});
 await r.watch();await r.watch();assert.equal(shows,1);
 const old=callbacks.close;old({isEnded:false});assert.equal(earned,0);
 await r.watch();callbacks.close({isEnded:true});callbacks.close({isEnded:true});assert.equal(earned,10000);
 await r.watch();old({isEnded:true});assert.equal(earned,10000,'stale close ignored');failSave=true;callbacks.close({isEnded:true});assert.equal(r.pending,true);
 failSave=false;await r.watch();assert.equal(earned,20000);assert.equal(shows,3,'retry without rewatch');
 await r.watch();callbacks.error();callbacks.close({isEnded:true});assert.equal(earned,20000);
 await r.watch();callbacks.close(undefined);assert.equal(earned,20000,'unknown completion not rewarded');
 await r.watch();r.dispose();callbacks.close({isEnded:true});assert.equal(earned,20000);
 const missing=create(wx,{adUnitId:'',grant(){throw Error('should not grant')},notify(){}});await missing.watch();
 console.log('PASS full-watch reward, early close, concurrency, duplicates, stale events, save retry, errors, disposal and missing configuration');
})().catch(e=>{console.error(e);process.exitCode=1});
