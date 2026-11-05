'use strict';
// Tuple encoding cuts repeated JSON field names; authoritative state remains unchanged.
function decode(world){
 if(!world.packed)return world;
 return {...world,packed:undefined,enemies:world.enemies.map(e=>({id:e[0],x:e[1],y:e[2],hp:e[3],max:e[4],r:e[5],elite:!!(e[6]&1),boss:!!(e[6]&2),structure:e[7]||undefined,range:e[8],stage:e[9]}))};
}
module.exports={decode};
