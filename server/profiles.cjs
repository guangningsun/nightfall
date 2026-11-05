'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const weapons={hunter:{id:'siege-rifle',name:'破城圣铳',bonus:'武器伤害 +15%'},mage:{id:'siege-staff',name:'黎明法杖',bonus:'法术伤害 +15%'},rogue:{id:'siege-blades',name:'裂城双刃',bonus:'飞刃与影袭伤害 +15%'},tank:{id:'siege-shield',name:'不朽塔盾',bonus:'生命上限 +20%'},medic:{id:'siege-censer',name:'复苏圣器',bonus:'治疗量 +20%'}};
for(const [key,d] of Object.entries(require('./extra-heroes.cjs').defs))weapons[key]={id:'siege-'+key,name:d.aEvo+'遗物',bonus:'专属武器伤害 +15%'};
class Profiles{
 constructor(dir){this.dir=dir;this.data={};if(dir){fs.mkdirSync(dir,{recursive:true,mode:0o700});const file=path.join(dir,'profiles.json');if(fs.existsSync(file))this.data=JSON.parse(fs.readFileSync(file,'utf8'));}}
 save(next){if(this.dir){const tmp=path.join(this.dir,'profiles.tmp');fs.writeFileSync(tmp,JSON.stringify(next),{mode:0o600});fs.renameSync(tmp,path.join(this.dir,'profiles.json'));}this.data=next;}
 key(token){return crypto.createHash('sha256').update(token).digest('hex');}
 login(token){if(token!==undefined&&token!==null&&token!==''){if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token)||!this.data[this.key(token)])throw Error('联机凭证无效，请联系开发者恢复存档');return token;}if(Object.keys(this.data).length>=10000)throw Error('试玩档案容量已满，请联系开发者');token=crypto.randomBytes(32).toString('hex');this.save({...this.data,[this.key(token)]:{gold:0,weapons:[],claims:[]}});return token;}
 get(token){const p=this.data[this.key(token)];return {wins:p.claims.length,unlocked:['hunter','mage','rogue','tank','medic',...require('./extra-heroes.cjs').order].slice(0,p.claims.length+1),gold:p.gold,weapons:p.weapons.map(id=>Object.values(weapons).find(w=>w.id===id)).filter(Boolean)};}
 reward(world,members){const next=structuredClone(this.data);for(const m of members){const p=next[this.key(m.token)];if(!p||p.claims.includes(world.id))continue;p.gold+=500+world.gold;const weapon=weapons[m.hero];if(!p.weapons.includes(weapon.id))p.weapons.push(weapon.id);p.claims.push(world.id);}this.save(next);}
}
module.exports={Profiles,weapons};
