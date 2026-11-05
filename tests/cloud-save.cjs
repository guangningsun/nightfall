const assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),{Profiles}=require('../server/profiles.cjs'),solo=require('../server/solo-save.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cloud-save-'));
try{let p=new Profiles(dir),a=p.login(),b=p.login();const data={runs:3,wins:2,gold:12000,total:45,history:[],talents:{might:2}};
assert.equal(solo.get(p,a).revision,0);const saved=solo.put(p,a,0,data);assert.equal(saved.revision,1);assert.equal(solo.put(p,a,0,data).revision,1);
assert.throws(()=>solo.put(p,a,0,{...data,gold:99}),/较新/);assert.equal(solo.get(p,a).profile.gold,12000);
assert.equal(solo.get(p,b).profile,null);assert.throws(()=>solo.put(p,a,1,{...data,gold:-1}));
p=new Profiles(dir);assert.equal(solo.get(p,a).profile.wins,2);assert.equal(solo.get(p,a).profile.talents.might,2);
const old=p.save;p.save=()=>{throw Error('disk')};assert.throws(()=>solo.put(p,a,1,{...data,gold:2}));assert.equal(solo.get(p,a).revision,1);p.save=old;
console.log('PASS cloud validation, account isolation, persistence, CAS conflicts, idempotent retry, disk rollback');
}finally{fs.rmSync(dir,{recursive:true,force:true})}
