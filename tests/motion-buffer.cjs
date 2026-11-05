const assert=require('node:assert/strict'),create=require('../js/survivor/motion');
const m=create({buffered:true}),frame=(t,id='run',status='playing')=>({id,time:t,status,players:[{id:'p',x:t*180,y:0}],enemies:[],shots:[]});
const arrivals=[0,115,190,320,395,510,590,715,800,920,995,1110,1195,1310,1400,1510,1600,1710,1800,1910,2000];
let i=0,prev=null,speeds=[];const inputs=[];
for(let now=0;now<=2000;now+=10){
 while(i<arrivals.length&&arrivals[i]<=now){const f=frame(i*.1);inputs.push(f);m.push(f,now);i++;}
 const out=m.sample(now);
 if(prev!==null&&now>300)speeds.push((out.players[0].x-prev)/.01);
 prev=out.players[0].x;
}
assert.ok(Math.min(...speeds)>150,JSON.stringify(speeds));assert.ok(Math.max(...speeds)<210);
inputs.forEach((f,j)=>assert.equal(f.players[0].x,j*.1*180,'authority immutable'));
for(let t=2010;t<10000;t+=10)m.sample(t);
assert.ok(m.sample(10000).players[0].x<=369.001,'no unlimited extrapolation');
m.push(frame(0,'new'),10010);assert.equal(m.sample(10010).players[0].x,0);
m.push(frame(.1,'new','won'),10110);assert.equal(m.sample(10110).players[0].x,18);
m.reset();assert.equal(m.sample(10200),null);
console.log('PASS jittered 75–130ms packets: steady movement, bounded stall, authority isolation, reset and final position');
console.log(JSON.stringify({minSpeed:Math.min(...speeds),maxSpeed:Math.max(...speeds),expected:180}));
