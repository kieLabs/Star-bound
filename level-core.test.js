const assert=require("node:assert/strict");
const {makeLevel,TYPES}=require("../js/level-core.js");
for(let n=1;n<=120;n++){
 const a=makeLevel(n),b=makeLevel(n);
 assert.equal(a.number,n);assert.equal(a.type,b.type);assert.equal(a.width,b.width);
 assert.ok(TYPES.includes(a.type));assert.ok(a.width>1500);assert.ok(a.goal.x<a.width);
 assert.ok(Array.isArray(a.platforms)&&Array.isArray(a.objects)&&Array.isArray(a.switches));
}
assert.equal(new Set(Array.from({length:6},(_,i)=>makeLevel(i+1).type)).size,6);
console.log("PASS: 120 deterministic levels and all six puzzle families");
