const assert=require('node:assert/strict'),create=require('../js/survivor/motion');
const m=create();const frame=(x,status='playing',id='run')=>({id,status,time:2,players:[{id:'p',x,y:0,hp:100}],enemies:[{id:1,x,y:0}],shots:[{id:2,x,y:0}]});
const first=frame(0);m.push(first,1000);const next=frame(20);m.push(next,1100);
assert.equal(m.sample(1100).players[0].x,0);assert.equal(m.sample(1150).players[0].x,10);assert.equal(m.sample(1200).players[0].x,20);assert.equal(m.sample(2000).players[0].x,20);assert.equal(next.players[0].x,20);assert.equal(first.players[0].x,0);
m.push(frame(170),2100);assert.equal(m.sample(2100).players[0].x,170,'teleport immediately');m.push(frame(180,'won'),2200);assert.equal(m.sample(2200).players[0].x,180);m.push(frame(0,'playing','new'),2300);assert.equal(m.sample(2300).players[0].x,0);m.reset();assert.equal(m.sample(2400),null);
console.log('PASS interpolation midpoint/end, immutable authority, bounded stall, teleport, result and new-run reset');
