const assert=require('node:assert/strict'),{items}=require('../js/survivor/inventory');
assert.equal(items({skin:'hunter',weaponLevel:1}).weapons.length,1);
let a=items({skin:'mage',novaLevel:8,frostLevel:3,novaEvolved:true,crystal:true});
assert.equal(a.weapons[0].name,'苍穹雷域');assert.equal(a.weapons[1].rank,3);assert.equal(a.accessories.length,1);
a=items({skin:'rogue',bladeLevel:8,trapLevel:8,bladeEvolved:true,trapEvolved:true,ravenSeal:true,venomVial:true});
assert.equal(a.weapons.filter(x=>x.evolved).length,2);assert.equal(a.accessories.length,2);
for(const hero of ['hunter','mage','rogue','tank','medic']){a=items({hero,a:8,b:1,evoA:true,accB:true},true);assert.equal(a.weapons.length,2);assert.equal(a.accessories.length,1);assert.equal(a.weapons[0].evolved,true);}
assert.deepEqual(items({skin:'hunter',weaponLevel:1}).accessories,[]);
console.log('PASS inventory: five roles, ranks, accessories, evolution and fresh run');
