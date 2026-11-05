'use strict';
const ranks={vitality:10,might:10,magnet:5,regen:5,speed:5,armor:5,wisdom:8,fortune:6,haste:5,mobility:3};
function validate(v){
 if(!v||typeof v!=='object'||!Array.isArray(v.history)||v.history.length>10)throw Error('存档格式错误');
 const out={};for(const k of ['runs','wins','total','gold']){if(!Number.isSafeInteger(v[k])||v[k]<0)throw Error('存档数值错误');out[k]=v[k];}
 if(out.wins>out.runs)throw Error('通关次数错误');
 out.history=v.history.map(r=>{if(!r||typeof r.hero!=='string'||r.hero.length>40||typeof r.date!=='string'||r.date.length>20)throw Error('战绩格式错误');const row={hero:r.hero,date:r.date,win:r.win===true,reason:String(r.reason||'').slice(0,30)};for(const k of ['kills','level','time','gold']){if(!Number.isFinite(r[k])||r[k]<0)throw Error('战绩数值错误');row[k]=r[k];}return row;});
 out.talents={};for(const [k,max] of Object.entries(ranks)){const n=v.talents?.[k]||0;if(!Number.isInteger(n)||n<0||n>max)throw Error('永久技能等级错误');out.talents[k]=n;}return out;
}
function get(profiles,token){const p=profiles.data[profiles.key(token)];if(!p)throw Error('请先登录');return p.solo||{revision:0,profile:null};}
function put(profiles,token,base,value){const current=get(profiles,token),profile=validate(value);
 if(base!==current.revision){if(base===current.revision-1&&JSON.stringify(profile)===JSON.stringify(current.profile))return current;throw Error('云端已有较新存档，请先查看云端并选择恢复，未覆盖任何数据');}
 const next={revision:current.revision+1,updatedAt:new Date().toISOString(),profile};const key=profiles.key(token);profiles.save({...profiles.data,[key]:{...profiles.data[key],solo:next}});return next;
}
module.exports={get,put,validate};
