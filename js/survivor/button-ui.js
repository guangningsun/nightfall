'use strict';
const {icon}=require('./codex');
function symbol(label){
 if(/超武|图鉴/.test(label))return 'blades';
 if(/永久|技能/.test(label))return 'staff';
 if(/战绩/.test(label))return 'shield';
 if(/双人|邀请/.test(label))return 'party';
 if(/秘典/.test(label))return 'book';
 if(/分享/.test(label))return 'share';
 return null;
}
function draw(ctx,label,x,y,w,h,{active=false,description=false,pressed=false}={}){
 ctx.save();const main=/^(开始游戏|确认出战|创建房间|开始攻城)/.test(label),party=/双人远征/.test(label),accent=main||active,kind=description?null:symbol(label);
 const r=(a,b,c,d,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(a),Math.round(b),Math.round(c),Math.round(d))};
 const cut=(a,b,c,d,n,color)=>{r(a+n,b,c-2*n,d,color);r(a,b+n,c,d-2*n,color);r(a+n/2,b+n/2,c-n,d-n,color);};
 const offset=pressed?2:0;y+=offset;
 cut(x+1,y+4,w,h,8,'#090811');
 cut(x,y,w,h,8,accent?'#6e4929':party?'#374455':'#4a3d3b');
 cut(x+2,y+2,w-4,h-4,7,accent?'#e3bd72':party?'#778491':'#8c7654');
 cut(x+4,y+4,w-8,h-8,5,accent?'#70462f':'#302936');
 cut(x+6,y+6,w-12,h-12,4,accent?(pressed?'#6b111c':'#8b1825'):(pressed?'#181723':'#262231'));
 r(x+10,y+7,w-20,2,accent?'#b64a42':'#403542');
 r(x+10,y+h-9,w-20,2,accent?'#5d101b':'#191722');
 if(main&&h>=50){for(const flip of [false,true]){const bx=flip?x+w-15:x+9,sign=flip?-1:1;r(bx,y+11,4,4,'#e5bc72');r(bx+sign*5,y+13,2,6,'#bb864e');r(bx+sign*8,y+11,4,2,'#bb864e');r(bx,y+h-15,4,4,'#bb864e');}}
 const isize=Math.min(26,h-18),showIcon=kind&&w>=95;
 const pad=main?20:12,available=w-pad*2-(showIcon?isize+6:0);
 let size=description?16:main?Math.min(24,h*.39):16;
 const measure=s=>{ctx.font='bold '+s+'px sans-serif';const m=ctx.measureText(label);return m&&Number.isFinite(m.width)?m.width:Array.from(label).reduce((n,c)=>n+(/[\u0000-\u007f]/.test(c)?.55:1),0)*s;};
 while(size>10&&measure(size)>available)size--;
 ctx.font='bold '+size+'px sans-serif';ctx.textBaseline='alphabetic';ctx.textAlign=description||showIcon?'left':'center';
 const tx=description||showIcon?x+pad:x+w/2,ty=description?y+27:y+(h+size*.72)/2;
 ctx.fillStyle='#100d16';ctx.fillText(label,tx+1,ty+2);ctx.fillStyle=accent?'#ffe3ae':'#f0d079';ctx.fillText(label,tx,ty);
 if(showIcon){const ix=x+w-pad-isize/2,iy=y+h/2;
 if(kind==='party'){for(const dx of [-7,6]){r(ix+dx-2,iy-9,5,5,'#f6ce6c');r(ix+dx-3,iy-3,7,10,'#f6ce6c');r(ix+dx-3,iy+7,2,4,'#f6ce6c');r(ix+dx+2,iy+7,2,4,'#f6ce6c');}r(ix-3,iy,8,3,'#f6ce6c');}
 else if(kind==='book'){r(ix-9,iy-11,18,23,'#171621');r(ix-7,iy-9,14,19,'#7f9190');r(ix-5,iy-7,2,15,'#b9c5ae');r(ix-1,iy-5,6,2,'#435451');r(ix-1,iy,6,2,'#435451');}
 else if(kind==='share'){for(let i=0;i<12;i++){r(ix-7+i,iy-i*.6,2,2,'#f3c566');r(ix-7+i,iy+i*.6,2,2,'#f3c566');}for(const [dx,dy] of [[-9,0],[6,-9],[6,9]])r(ix+dx-3,iy+dy-3,6,6,'#f3c566');}
 else icon(ctx,kind,ix,iy,isize,kind==='staff'?'#c6a5ef':'#e6c993');
 }ctx.restore();
}
module.exports={draw};
