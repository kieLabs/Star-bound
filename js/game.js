(()=>{"use strict";
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d"),$=id=>document.getElementById(id);
let W=900,H=500,level,hero,objects=[],shards=[],switches=[],keys={},camera=0,frame=0,paused=false,started=false,won=false,rope=null,toastTimer=0;
let levelNo=Number(localStorage.getItem("sb_level")||1),best=Number(localStorage.getItem("sb_best")||1),totalShards=Number(localStorage.getItem("sb_shards")||0);
$("best").textContent=best;$("shards").textContent=totalShards;
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0)}
new ResizeObserver(resize).observe(canvas);resize();
function say(s){$("toast").textContent=s;$("toast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("show"),1700)}
function load(n){level=LevelCore.makeLevel(n);hero={x:level.hero.x,y:level.hero.y,vx:0,vy:0,w:22,h:42,ground:false,face:1};objects=level.objects.map(o=>({...o}));shards=level.shards.map(o=>({...o}));switches=level.switches.map(o=>({...o}));camera=0;won=false;rope=null;$("levelNo").textContent=String(n).padStart(2,"0");$("mission").textContent=level.description}
function start(){started=true;$("overlay").classList.add("hidden");load(levelNo);say("New puzzle generated — good luck!")}
$("startBtn").onclick=start;
$("pauseBtn").onclick=()=>{if(!started)return;paused=!paused;say(paused?"Paused":"Back to the mission")};
function key(e,down){let k=e.key.toLowerCase();if(["arrowleft","arrowright","arrowup"," ","arrowdown"].includes(k))e.preventDefault();keys[k]=down;if(down&&k==="e")interact()}
addEventListener("keydown",e=>key(e,true));addEventListener("keyup",e=>key(e,false));
document.querySelectorAll("[data-key]").forEach(b=>{let k=b.dataset.key;const map={left:"arrowleft",right:"arrowright",jump:" ",interact:"e"};b.addEventListener("pointerdown",e=>{e.preventDefault();keys[map[k]]=true;if(k==="interact")interact()});["pointerup","pointercancel","pointerleave"].forEach(ev=>b.addEventListener(ev,()=>keys[map[k]]=false))});
function interact(){if(!started||paused||won)return;if(level.type==="SWING"){if(rope){rope=null;say("Tether released")}else{let a=level.anchors.find(a=>Math.hypot(a.x-hero.x,a.y-hero.y)<210);if(a){rope={x:a.x,y:a.y,len:Math.max(65,Math.hypot(a.x-hero.x,a.y-hero.y))};say("Tether attached! Swing across.")}else say("Move closer to an anchor")}}else{let s=switches.find(s=>Math.abs(s.x-hero.x)<85);if(s){s.active=true;say("Node activated!")}else say("No control in reach")}}
function collideGround(){let gy=level.groundY;
 const overPit=level.hazards.some(h=>h.kind==="pit"&&hero.x>h.x-h.w/2&&hero.x<h.x+h.w/2);
 if(!overPit&&hero.y+hero.h/2>=gy&&hero.x<level.width){hero.y=gy-hero.h/2;hero.vy=0;hero.ground=true}else hero.ground=false;
for(const p of level.platforms){if(hero.x+10>p.x&&hero.x-10<p.x+p.w&&hero.y+hero.h/2>=p.y&&hero.y+hero.h/2<=p.y+18&&hero.vy>=0){hero.y=p.y-hero.h/2;hero.vy=0;hero.ground=true}}
}
function update(){if(!started||paused||won)return;frame++;let left=keys.arrowleft||keys.a,right=keys.arrowright||keys.d,jump=keys[" "]||keys.arrowup||keys.w;
if(left){hero.vx-=.65;hero.face=-1}if(right){hero.vx+=.65;hero.face=1}hero.vx*=.84;hero.vx=Math.max(-5,Math.min(5,hero.vx));if(jump&&hero.ground){hero.vy=-11.5;hero.ground=false}
hero.vy=Math.min(13,hero.vy+.48);hero.x+=hero.vx;hero.y+=hero.vy;
if(rope){let dx=hero.x-rope.x,dy=hero.y-rope.y,d=Math.hypot(dx,dy)||1;if(d>rope.len){hero.x=rope.x+dx/d*rope.len;hero.y=rope.y+dy/d*rope.len;hero.vy*=.98}}
collideGround();
for(let o of objects){o.vy=Math.min(12,(o.vy||0)+.45);o.x+=o.vx||0;o.y+=o.vy;if(o.y+o.r>level.groundY){o.y=level.groundY-o.r;o.vy=0}if(Math.abs(hero.x-o.x)<o.r+19&&Math.abs(hero.y-o.y)<o.r+23){o.x+=hero.vx*.8+(hero.face*.7);o.vx=(o.vx||0)*.92+hero.vx*.08}}
for(let s of switches)if(s.kind==="plate"){for(let o of objects)if(Math.abs(o.x-s.x)<40&&Math.abs(o.y-(s.y-20))<45)s.active=true}
for(let s of shards)if(!s.got&&Math.hypot(hero.x-s.x,hero.y-s.y)<35){s.got=true;totalShards++;$("shards").textContent=totalShards;localStorage.setItem("sb_shards",totalShards)}
if(level.type==="DODGE"){for(let h of level.hazards){let active=Math.sin(frame*.045+h.phase)>-.12;if(active&&Math.abs(hero.x-h.x)<h.w/2+10&&hero.y>h.y-15){hero.x=Math.max(30,hero.x-65);hero.vx=-3;say("Energy gate! Watch its rhythm.")}}}
if(level.type==="SWING"&&hero.x>level.width*.45&&hero.x<level.width*.65&&hero.y>level.groundY-30&&!rope){hero.x-=2;hero.vx=-2}
if(hero.y>H+180){hero.x=80;hero.y=level.groundY-50;hero.vx=hero.vy=0;rope=null;say("Try another approach")}
hero.x=Math.max(20,Math.min(level.width-20,hero.x));camera=Math.max(0,Math.min(level.width-W,hero.x-W*.36));
let unlocked=switches.length===0||switches.every(s=>s.active);if(level.type==="SHARDS")unlocked=shards.every(s=>s.got);
if(Math.hypot(hero.x-level.goal.x,hero.y-level.goal.y)<58&&unlocked){won=true;levelNo++;best=Math.max(best,levelNo);localStorage.setItem("sb_level",levelNo);localStorage.setItem("sb_best",best);$("best").textContent=best;say("Puzzle solved! Sector complete.");setTimeout(()=>{load(levelNo);say("Sector "+levelNo+" — a brand-new puzzle!")},1000)}
}
function line(x1,y1,x2,y2,color="#fff",w=2){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function circle(x,y,r,color,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function draw(){ctx.clearRect(0,0,W,H);let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#02040b");g.addColorStop(1,"#111b29");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
for(let i=0;i<95;i++){let x=((i*137.5)%Math.max(level?.width||1900,1900))-camera*.25,y=(i*71)%Math.max(150,H*.62);circle(x,y,(i%4===0?1.4:.7),"#b8d8ef")}
if(!level){requestAnimationFrame(draw);return}ctx.save();ctx.translate(-camera,0);
let gy=level.groundY;ctx.fillStyle="#c4c7cb";ctx.fillRect(camera-20,gy,level.width+W, H-gy+100);ctx.fillStyle="#eef0f2";ctx.fillRect(camera-20,gy,level.width+W,3);
for(let p of level.platforms){ctx.fillStyle="#969da8";ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle="#e1e5e9";ctx.fillRect(p.x,p.y,p.w,3)}
for(let h of level.hazards){if(h.kind==="pit"){ctx.fillStyle="#03050a";ctx.fillRect(h.x-h.w/2,gy-2,h.w,H-gy+30)}else{let on=Math.sin(frame*.045+h.phase)>-.12;ctx.fillStyle=on?"#ff365d":"#344253";ctx.fillRect(h.x-h.w/2,h.y,h.w,h.h);if(on){ctx.shadowColor="#ff174f";ctx.shadowBlur=18;ctx.fillRect(h.x-h.w/2,h.y,h.w,h.h);ctx.shadowBlur=0}}}
for(let a of level.anchors){circle(a.x,a.y,6,"#f4f7ff","#ff8b32");line(a.x,a.y,a.x,a.y+12,"#fff")}
for(let s of switches){ctx.fillStyle=s.active?"#00f0c8":"#ff9a36";ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;ctx.fillRect(s.x-17,gy-8,34,8);ctx.shadowBlur=0;circle(s.x,gy-15,5,s.active?"#00f0c8":"#ff9a36")}
for(let o of objects){circle(o.x,o.y,o.r,"#e8edf2","#9caaba");circle(o.x-7,o.y-7,5,"#fff")}
for(let s of shards)if(!s.got){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(frame*.025);ctx.fillStyle="#fff";ctx.shadowColor="#00ddff";ctx.shadowBlur=15;ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(8,0);ctx.lineTo(0,10);ctx.lineTo(-8,0);ctx.closePath();ctx.fill();ctx.restore()}
let unlock=switches.length===0||switches.every(s=>s.active);if(level.type==="SHARDS")unlock=shards.every(s=>s.got);
circle(level.goal.x,level.goal.y,level.goal.r,unlock?"#0c2e36":"#202b37",unlock?"#00eaff":"#65758a");ctx.strokeStyle=unlock?"#00eaff":"#8996a8";ctx.lineWidth=4;ctx.beginPath();ctx.arc(level.goal.x,level.goal.y,level.goal.r-8,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#fff";ctx.font="10px Arial";ctx.textAlign="center";ctx.fillText(unlock?"EXIT":"LOCKED",level.goal.x,level.goal.y+4);
if(rope)line(hero.x,hero.y-10,rope.x,rope.y,"#f5f7ff",2);
drawHero();ctx.restore();
ctx.fillStyle="#9aaec5";ctx.font="11px system-ui";ctx.textAlign="left";ctx.fillText("PUZZLE TYPE: "+level.type,14,18);
if(paused){ctx.fillStyle="#0009";ctx.fillRect(0,0,W,H);ctx.fillStyle="#fff";ctx.font="bold 30px system-ui";ctx.textAlign="center";ctx.fillText("PAUSED",W/2,H/2)}
requestAnimationFrame(draw)}
function drawHero(){let x=hero.x,y=hero.y,orange="#ff852d";circle(x,y-14,8,"#03050a",orange);line(x,y-6,x,y+14,orange,3);line(x,y,x-10,y+8,orange,3);line(x,y,x+10,y+8,orange,3);let step=Math.sin(frame*.22)*5*(Math.abs(hero.vx)>.5?1:0);line(x,y+14,x-7+step,y+27,orange,3);line(x,y+14,x+7-step,y+27,orange,3)}
load(levelNo);requestAnimationFrame(draw);setInterval(update,1000/60);
})();
