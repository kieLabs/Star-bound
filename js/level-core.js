/* Deterministic procedural puzzle generator. No network or external libraries. */
(function(root){
"use strict";
const TYPES=["ORB","SHARDS","SWITCH","SWING","DODGE","TWIN"];
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function makeLevel(number){
 const r=rng((number*2654435761)>>>0), pick=a=>a[Math.floor(r()*a.length)];
 const type=TYPES[(number-1)%TYPES.length], difficulty=Math.min(1+(number-1)*.075,8);
 const width=1900+Math.floor(r()*350), groundY=440;
 const platforms=[];
 let x=260;
 while(x<width-260){if(r()>.28)platforms.push({x,y:groundY-75-Math.floor(r()*100),w:100+Math.floor(r()*100),h:14});x+=190+Math.floor(r()*100)}
 const level={number,type,width,groundY,platforms,hero:{x:90,y:groundY-40},goal:{x:width-110,y:groundY-65,r:30},hazards:[],shards:[],objects:[],switches:[],anchors:[],description:""};
 if(type==="ORB"){level.description="Push the energy core onto the glowing plate.";level.objects=[{x:width*.48,y:groundY-32,r:25,vx:0,vy:0}];level.switches=[{x:width*.78,y:groundY-8,kind:"plate",active:false}];}
 if(type==="SHARDS"){level.description="Collect every star shard, then reach the portal.";for(let i=0;i<3+Math.floor(r()*3);i++)level.shards.push({x:350+i*(width-650)/4,y:groundY-85-Math.floor(r()*120),got:false});}
 if(type==="SWITCH"){level.description="Find the switch and activate it to unlock the exit.";level.switches=[{x:width*.55,y:groundY-10,kind:"switch",active:false}];level.objects=[{x:width*.36,y:groundY-25,r:20,vx:0,vy:0}];}
 if(type==="SWING"){level.description="Use the tether points to cross the broken ground.";level.anchors=[{x:width*.42,y:170},{x:width*.68,y:135}];level.hazards=[{x:width*.54,y:groundY-10,w:190,h:18,kind:"pit"}];}
 if(type==="DODGE"){level.description="Read the rhythm and pass the moving energy gates.";for(let i=0;i<3;i++)level.hazards.push({x:width*.38+i*width*.17,y:groundY-75,w:30,h:75,kind:"laser",phase:r()*6.28});}
 if(type==="TWIN"){level.description="Activate both floor nodes to open the portal.";level.switches=[{x:width*.4,y:groundY-8,kind:"plate",active:false},{x:width*.7,y:groundY-8,kind:"plate",active:false}];level.objects=[{x:width*.28,y:groundY-24,r:19,vx:0,vy:0},{x:width*.58,y:groundY-24,r:19,vx:0,vy:0}];}
 return level;
}
const api={makeLevel,TYPES};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.LevelCore=api;
})(typeof window!=="undefined"?window:globalThis);
