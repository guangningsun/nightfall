'use strict';
// Bounded geometry: one effect per attack; no per-enemy particle allocation.
function draw(g,f,age=0,simple=false){
 const life=Math.max(0,f.life-age);if(!life)return;const t=Math.max(0,Math.min(1,1-life/.45)),r=f.r||140;
 g.save();g.translate(f.x,f.y);g.rotate(f.angle||0);g.globalAlpha=Math.min(1,life*4);
 if(f.kind==='fissure'){
 const length=(f.length||330)*Math.min(1,t*3+.15),n=simple?5:9;
 g.strokeStyle='#4a1d24';g.lineWidth=f.heavy?16:10;g.beginPath();g.moveTo(0,0);for(let i=1;i<=n;i++)g.lineTo(length*i/n,(i%2?1:-1)*12);g.stroke();
 g.strokeStyle='#ffb862';g.lineWidth=3;g.stroke();if(!simple){g.strokeStyle='#f5dc99';g.lineWidth=2;for(let i=1;i<n;i++){g.beginPath();g.moveTo(length*i/n,0);g.lineTo(length*i/n-12,(i%2?1:-1)*r);g.stroke();}}
 }else{
 const execute=f.kind==='execute',sweep=execute?Math.PI*2:f.heavy?3.8:3,from=execute?0:-sweep/2,to=execute?sweep:from+sweep*Math.min(1,t*3+.2);
 g.strokeStyle=execute?'#8d3049':'#a94732';g.lineWidth=f.heavy?17:11;g.beginPath();g.arc(0,0,r*.82,from,to);g.stroke();
 g.strokeStyle='#ffd18a';g.lineWidth=f.heavy?7:4;g.stroke();g.strokeStyle='#fff4d3';g.lineWidth=2;g.beginPath();g.arc(0,0,r*.88,from,to);g.stroke();
 if(execute){g.rotate(Math.PI/4);g.fillStyle='#fff0bd';g.fillRect(-r*.55,-3,r*1.1,6);g.fillRect(-3,-r*.55,6,r*1.1);}
 if(!simple)for(let i=0;i<8;i++){const a=from+sweep*i/7,d=r*(.7+t*.45);g.fillStyle=i%2?'#fff0b0':'#f0a05c';g.fillRect(Math.cos(a)*d-2,Math.sin(a)*d-2,4,4);}
 }g.restore();
}
module.exports={draw};
