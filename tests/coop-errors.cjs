'use strict';
const assert=require('node:assert/strict'),create=require('../js/survivor/coop');
function scenario(error,expected,synchronous=false){let events={},args,content='',copied='',labels=[];const original=console.warn;console.warn=()=>{};const task={onOpen:f=>events.open=f,onMessage:f=>events.message=f,onError:f=>events.error=f,onClose:f=>events.close=f,close(){if(events.close)events.close({code:1000,reason:'leave'})}};
const wx={createCanvas:()=>({getContext:()=>ctx}),connectSocket(v){args=v;if(synchronous)v.fail(error);return task;},getAccountInfoSync:()=>({miniProgram:{appId:'wx28324f760acc47fa',envVersion:'trial'}}),getAppBaseInfo:()=>({version:'8.0',SDKVersion:'3.17.5'}),showModal(v){content=v.content;v.success({confirm:true})},setClipboardData(v){copied=v.data}};
const g=create(wx);const ctx=new Proxy({fillText:(str,x,y)=>labels.push({str,x,y})},{get:(o,k)=>o[k]||(()=>{})});function click(label){labels=[];g.draw(ctx,390,844,44,20);const b=labels.find(a=>a.str===label);assert.ok(b,label);const e={changedTouches:[{identifier:1,clientX:b.x,clientY:b.y-5}]};g.touchStart(e);g.touchEnd(e);}
try{g.open();click('创建房间');if(!synchronous)events.error(error);assert.equal(g.phase,'error');click('查看连接详情');assert.match(content,expected);assert.match(content,/AppID wx28324f760acc47fa/);assert.match(content,/环境 trial/);assert.equal(copied,content);assert.equal(typeof args.success,'function');}finally{g.dispose();console.warn=original;}}
scenario({errMsg:'connectSocket:fail url not in domain list'},/url not in domain list/,true);
scenario({errMsg:'SSL certificate verify failed'},/SSL certificate verify failed/);
scenario({errMsg:'network timeout'},/network timeout/);
console.log('PASS native error detail preservation, synchronous domain rejection, TLS and timeout diagnostics, copy and stale-close suppression');
