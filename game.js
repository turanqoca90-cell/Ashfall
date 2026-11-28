/* spit, explosion and debris effects */
/* magazines and reloads: [magazine size, reload seconds]; melee weapons and fists have no ammo */
const MG={1:[12,1],2:[30,.8],3:[6,2],4:[12,1.8],5:[36,1.5],8:[30,1.9],9:[6,2],10:[150,3],14:[6,1.8],15:[20,1.4],16:[1,1.3],17:[5,2.5],18:[12,2.6],19:[32,1.8],20:[30,2],21:[80,2.2],23:[1,.8],24:[4,3.6]};
function reloadTick(dt){for(let i=0;i<p.inv.length;i++){const it=p.inv[i];if(!it||it.k!=='w')continue;const m=MG[it.i];if(!m)continue;if(it.am===undefined)it.am=m[0];const held=i===p.sel;
 if(it.rl>0){it.rl-=dt;if(it.rl<=0){it.rl=0;it.am=m[0];if(held){snd('triangle',300,520,.08,.12);snd('square',900,700,.04,.06)}}}
 else if(it.am<=0||(!held&&it.am<m[0])){it.rl=m[1];if(held)snd('square',200,120,.05,.1)}}}
function ammoTxt(){const cu=p.sel>=0?p.inv[p.sel]:null,m=cu&&cu.k==='w'&&MG[cu.i];if(!m)return'';return cu.rl>0?' · '+TX('reload'):' '+(cu.am===undefined?m[0]:cu.am)+'/'+m[0]}
function slotUI(){const el=$('inv').children;for(let i=0;i<p.inv.length;i++){const it=p.inv[i],b=el[i];if(!it||!b||it.k!=='w')continue;const m=MG[it.i];if(!m)continue;const rb=b.querySelector('.rb'),am=b.querySelector('.am');if(!rb||!am)continue;
 const hv=it.rl>0?Math.round(it.rl/m[1]*100):0;if(rb._v!==hv){rb._v=hv;rb.style.height=hv+'%'}const a=it.am===undefined?m[0]:it.am;if(am._v!==a){am._v=a;am.textContent=a}}}
/* potions */
const buff={spd:0,rg:0,slow:0,weak:0,inv:0},dmul=()=>(performance.now()<buff.rg?1.2:1)*(performance.now()<buff.weak?.8:1);
function drinkPotion(i){const it=p.inv[i],n=performance.now();if(it.i===0){buff.spd=n+30000;toast(TX('spdOn'))}else if(it.i===2){buff.inv=n+15000;sendWS({t:'buff',k:'inv'});toast(TX('invOn'))}else{buff.rg=n+30000;sendWS({t:'buff',k:'rage'});toast(TX('rageOn'))}
 useOne(i);snd('sine',300,700,.3,.15);setTimeout(()=>snd('triangle',700,1100,.2,.12),120)}
function buffTxt(){const n=performance.now();let s='';if(n<buff.inv)s+='<br><span style="color:#c9a8ff">'+TX('invt')+' '+Math.ceil((buff.inv-n)/1000)+'s</span>';if(n<buff.spd)s+='<br><span style="color:#6fd0ff">'+TX('spd')+' '+Math.ceil((buff.spd-n)/1000)+'s</span>';if(n<buff.rg)s+='<br><span style="color:#ff6a5a">'+TX('rage')+' '+Math.ceil((buff.rg-n)/1000)+'s</span>';if(n<buff.weak)s+='<br><span style="color:#e6c15a">'+TX('weak')+'</span>';if(n<buff.slow)s+='<br><span style="color:#9fd8ff">'+TX('slow')+'</span>';return s}
/* grenades */
const inm=it=>it.k==='w'?wn(it.i):it.k==='g'?(it.i===1?TX('mine'):it.i===2?TX('smoke'):it.i===3?TX('lure'):it.i===4?TX('molo'):it.i===5?TX('turret'):TX('grenade')):it.k==='p'?(it.i===1?TX('ragep'):it.i===2?TX('invp'):TX('spdp')):it.k==='y'?TX('mkey'):it.k==='a'?TX('vest')+(it.s-1):it.k==='f'?TX('shoes')+(it.s-1):hn(it.s);
const heldName=()=>{const c=p.sel>=0?p.inv[p.sel]:null;return c&&c.k==='g'?inm(c):wn(WP.indexOf(cw()))};
let locN=[],ng=[],nmap={},ncid=0;
function throwNade(it){const i=p.inv.indexOf(it);if(i<0)return;p.cd=.5;useOne(i);const a=p.a,cid=++ncid;
 const mn=it.i===1||it.i===5,sp=mn?260:300;sendWS({t:'nade',a:+a.toFixed(3),x:Math.round(p.x),y:Math.round(p.y),cid,ty:it.i|0});locN.push({cid,x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,tl:mn?.34:.49,age:0,mine:it.i===1,mk:it.i|0});snd('n',700,200,.18,.12);renderInv()}
/* bikes */
let BKL=[],bmap={},RD=null,MB=null,LVT=0;
function bkSnap(m){const l=[],s={};for(const e of m.bk||[]){s[e[0]]=1;let g=bmap[e[0]];if(!g)g=bmap[e[0]]={id:e[0],x:e[1],y:e[2],a:e[3]/100};{const n=performance.now();if(g.lt){const q=(n-g.lt)/1000;if(q>.01&&q<.5){g.vx=(g.vx||0)*.5+(e[1]-g.tx)/q*.5;g.vy=(g.vy||0)*.5+(e[2]-g.ty)/q*.5}}g.lt=n}g.tx=e[1];g.ty=e[2];g.ta=e[3]/100;g.dr=e[4];g.pa=e[5];l.push(g)}
 for(const k in bmap)if(!s[k])delete bmap[k];BKL=l;let r=null;for(const g of l){if(g.dr===m.i)r={g,s:'d'};else if(g.pa===m.i)r={g,s:'p'}}
 if(r&&LVT&&performance.now()-LVT<1200)r=null;if(r){if(!RD||RD.g!==r.g||RD.s!==r.s){RD=r;MB=r.s==='d'?{x:r.g.x,y:r.g.y,a:r.g.a,v:0}:null}}else if(RD&&!(RD.opt&&performance.now()-RD.opt<1200)){RD=null;MB=null}}
function bkUpd(dt){const f=Math.min(1,dt*12);for(const g of BKL){if(RD&&RD.s==='d'&&RD.g===g&&MB){g.x=MB.x;g.y=MB.y;g.a=MB.a;continue}const L=g.dr?.12:0;g.x+=(g.tx+(g.vx||0)*L-g.x)*f;g.y+=(g.ty+(g.vy||0)*L-g.y)*f;g.a+=Math.atan2(Math.sin(g.ta-g.a),Math.cos(g.ta-g.a))*Math.min(1,dt*14)}}
function nearBike(){if(!p)return null;let best=null,bd=55;for(const g of BKL){if(g.dr&&g.pa)continue;const d=Math.hypot(g.x-p.x,g.y-p.y);if(d<bd){bd=d;best=g}}return best}
function bikeUI(){const b=$('bikeb'),show=!!p&&!paused&&!!(RD||nearBike());b.style.display=show?'block':'none';const t=TX(RD?'bkout':'bkin');if(b.textContent!==t)b.textContent=t}
function rideMove(dt,mx,my,m){p.kt=0;p.hid=false;p.sp=0;if(!RD)return;
 if(RD.s==='p'){const g=RD.g;p.x=g.x-Math.cos(g.a)*12;p.y=g.y-Math.sin(g.a)*12;return}
 const b=MB;if(!b)return;
 if(m>.15){const want=Math.atan2(my,mx),da=Math.atan2(Math.sin(want-b.a),Math.cos(want-b.a)),tr=(2.6+Math.max(0,1-b.v/380)*2.2)*dt;b.a+=Math.max(-tr,Math.min(tr,da));
  if(Math.abs(da)>1.7)b.v=Math.max(0,b.v-520*dt);else b.v=Math.min(380,b.v+280*m*dt)}else b.v=Math.max(0,b.v-320*dt);
 const ox=b.x,oy=b.y;p.x=b.x+Math.cos(b.a)*b.v*dt;p.y=b.y+Math.sin(b.a)*b.v*dt;push(p,15);shopBlock(p,15);
 const mv=Math.hypot(p.x-ox,p.y-oy),ex=b.v*dt;if(ex>.5&&mv<ex*.6)b.v*=Math.max(.2,1-dt*14);
 b.x=p.x;b.y=p.y;p.a=b.a;p.wk=(p.wk||0)}
function drawBikes(){const t=performance.now()/1000,PAL=['#c8483a','#2f6fb5','#d49a2a','#3a8a4a'];for(const g of BKL){ctx.save();ctx.translate(g.x,g.y);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(2,5,34,11,g.a,0,TAU);ctx.fill();ctx.rotate(g.a);ctx.scale(1.35,1.35);ctx.lineJoin='round';ctx.lineWidth=2;ctx.strokeStyle=OL;
 for(const wx of[-18,19]){ctx.fillStyle='#202226';ctx.fillRect(wx-9,-4.5,18,9);ctx.strokeRect(wx-9,-4.5,18,9);ctx.fillStyle='#55585e';ctx.fillRect(wx-3,-1.5,6,3)}
 ctx.fillStyle=PAL[g.id%4];ctx.fillRect(-15,-6,32,12);ctx.strokeRect(-15,-6,32,12);ctx.fillStyle='#2b2b2b';ctx.fillRect(-11,-3.5,13,7);ctx.fillStyle='#d8d8d8';ctx.fillRect(5,-5,8,10);
 ctx.fillStyle='#3a3d44';ctx.fillRect(15,-12,4,24);ctx.strokeRect(15,-12,4,24);ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.arc(27,0,3,0,TAU);ctx.fill();ctx.restore()}}
const trc=[];
function shootTr(g){trc.push({x:g.x,y:g.y,a:g.ta||0,b:performance.now()});if(p){const d=Math.hypot(g.x-p.x,g.y-p.y);if(d<900)snd('n',1300,300,.04,.07*(1-d/900))}}
function drawTr(){const n=performance.now();ctx.save();ctx.lineCap='round';for(let i=trc.length-1;i>=0;i--){const q=trc[i],a=(n-q.b)/1000;if(a>.3){trc.splice(i,1);continue}const d=a*1500,c=Math.cos(q.a),s=Math.sin(q.a);ctx.strokeStyle='rgba(255,220,120,.9)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(q.x+c*Math.max(0,d-16),q.y+s*Math.max(0,d-16));ctx.lineTo(q.x+c*d,q.y+s*d);ctx.stroke()}ctx.restore()}
function drawTurret(g,t){const a=g.ta||0,bl=g.fz<4&&Math.sin(t*14)>0;ctx.save();ctx.globalAlpha=bl?.45:1;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.arc(g.x+2,g.y+4,12,0,TAU);ctx.fill();circ(g.x,g.y,11,'#3a3f47',2.5);ctx.translate(g.x,g.y);ctx.rotate(a);ctx.fillStyle='#9aa0a6';ctx.fillRect(2,-2.8,19,5.6);ctx.strokeStyle=OL;ctx.lineWidth=1.8;ctx.strokeRect(2,-2.8,19,5.6);ctx.fillStyle='#6a717a';ctx.fillRect(17,-3.6,5,7.2);ctx.rotate(-a);circ(0,0,5,'#c9a227',2);ctx.fillStyle=Math.sin(t*6)>0?'#ff3a2a':'#7a2a24';ctx.beginPath();ctx.arc(0,0,1.8,0,TAU);ctx.fill();ctx.restore()}
function flyN(g){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.arc(g.x+1,g.y+3,6,0,TAU);ctx.fill();const k=g.mk;if(k===3||k===5){ctx.fillStyle=k===3?'#2a3a4a':'#3a3f47';ctx.fillRect(g.x-6,g.y-6,12,12);ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.strokeRect(g.x-6,g.y-6,12,12);ctx.fillStyle=k===3?'#4ac2ff':'#ffd24a';ctx.fillRect(g.x-2,g.y-2,4,4)}else{circ(g.x,g.y,6,k===2?'#9aa0a6':'#c8602a',2);ctx.fillStyle=k===4?'#ffd24a':'#fff';ctx.fillRect(g.x-3.5,g.y-1,7,2.5)}}
const SMR=135;function inSmoke(x,y){for(const g of ng)if(g.mk===2&&g.st===1&&g.fz>.2&&Math.hypot(g.x-x,g.y-y)<SMR)return true;return false}
function drawNades(){const t=performance.now()/1000;for(const g of locN.concat(ng)){const sit='st' in g?g.st===1:g.tl<=0,fz='fz' in g?g.fz:Math.max(0,1-(g.age-.5)),lc=!('st' in g);
 if(g.mk>=2&&sit&&!lc){const A=ctx.globalAlpha;
  if(g.mk===2){ctx.fillStyle='rgba(185,190,196,'+Math.min(.6,fz/1.5)+')';for(let k=0;k<6;k++){const a=k*1.05+t*.3;ctx.beginPath();ctx.arc(g.x+Math.cos(a)*68,g.y+Math.sin(a)*68,70,0,TAU);ctx.fill()}ctx.beginPath();ctx.arc(g.x,g.y,84,0,TAU);ctx.fill()}
  else if(g.mk===3){ctx.strokeStyle='rgba(74,194,255,'+(1-(t*1.5)%1)*.7+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(g.x,g.y,14+((t*1.5)%1)*70,0,TAU);ctx.stroke();ctx.fillStyle='#2a3a4a';ctx.fillRect(g.x-7,g.y-7,14,14);ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.strokeRect(g.x-7,g.y-7,14,14);ctx.fillStyle=Math.sin(t*8)>0?'#4ac2ff':'#1c5a80';ctx.fillRect(g.x-2.5,g.y-2.5,5,5)}
  else if(g.mk===5)drawTurret(g,t);
  else{const f=.8+.2*Math.sin(t*14+g.x);ctx.fillStyle='rgba(255,80,20,.35)';ctx.beginPath();ctx.arc(g.x,g.y,70,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,160,40,.5)';ctx.beginPath();ctx.arc(g.x,g.y,45*f,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,230,120,.7)';ctx.beginPath();ctx.arc(g.x,g.y,22*f,0,TAU);ctx.fill()}
  ctx.globalAlpha=A;continue}
 if(g.mk>=2){flyN(g);continue}
 if(g.mk===1||g.mine){ctx.globalAlpha=sit?.38:1;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.arc(g.x+1,g.y+3,7,0,TAU);ctx.fill();circ(g.x,g.y,7,'#4a4e57',2);circ(g.x,g.y,2.6,Math.sin(t*4+g.x)>.55?'#ff3a2a':'#7a2a24',1);ctx.globalAlpha=1;continue}
 ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.arc(g.x+1,g.y+3,6,0,TAU);ctx.fill();
 if(sit){ctx.strokeStyle='rgba(255,70,40,'+(.18+(1-fz)*.45)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(g.x,g.y,125,0,TAU);ctx.stroke()}
 circ(g.x,g.y,6,sit&&fz<.5&&Math.sin(t*30)>0?'#ff5a3a':'#4a6b34',2);ctx.fillStyle='#c9c9c9';ctx.fillRect(g.x-1.5,g.y-9,3,4)}}
function predictHit(z,d){const n=performance.now();if(!z.pt||n-z.pt>700)z.php=z.hp;z.pt=n;z.php-=d;z.hp=Math.max(1,Math.min(z.hp,z.php));z.hl=.1;
 if(z.php<=0&&!z.pkd&&(z.kd<7||z.kd===8||z.kd>=16)&&z.kd!==4){z.pkd=n;dying.push({t:0,q:Object.assign({},z,{hit:0,hl:0,fz:0,hp:z.mh})})}}
let sps=[],smap={},splashes=[],exps=[],debr=[],shake=0;const broken=new Set();
function boom(x,y,R){const d=p?Math.hypot(x-p.x,y-p.y):9999;exps.push({x,y,t:0,l:.6,r:(R||125)/125});
 for(let i=0;i<18;i++){const a=Math.random()*TAU,v=120+Math.random()*280;debr.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,l:.5+Math.random()*.6,s:2+Math.random()*4})}
 if(d<1100){const v=Math.max(.06,.55*(1-d/1100));snd('n',700,0,.7,v);snd('sine',95,28,.55,v*.9);snd('n',2600,0,.18,v*.4)}
 if(d<600)shake=Math.max(shake,.9*(1-d/600))}
function drawFX(){drawNades();drawTr();for(const s of sps){if(s.pl===2){circ(s.x,s.y,6.5,'#fff',2);dCirc(ctx,s.x+1.5,s.y+1.5,2.5,'#c3dcee');continue}if(s.pl){circ(s.x,s.y,3.5,'#ffd24a',1.5);continue}ctx.fillStyle='rgba(120,200,20,.25)';ctx.beginPath();ctx.arc(s.x,s.y,10,0,TAU);ctx.fill();circ(s.x,s.y,6,'#a6ff2a',2)}
 for(const q of splashes){const k=q.t/.4;ctx.globalAlpha=Math.max(0,1-k);ctx.fillStyle=q.sn?'#fff':'#a6ff2a';ctx.beginPath();ctx.arc(q.x,q.y,5+k*14,0,TAU);ctx.fill();if(q.sn){ctx.strokeStyle='#7fb0d0';ctx.lineWidth=1.5;ctx.stroke()}ctx.globalAlpha=1}}
function drawBoom(){
 if(p&&broken.size)for(const q of broken){if(Math.abs(q.x-p.x)>900||Math.abs(q.y-p.y)>700)continue;ctx.fillStyle='rgba(58,44,34,.92)';ctx.fillRect(q.x-3,q.y-3,q.w+6,q.h+6);ctx.fillStyle='rgba(150,120,90,.8)';const n=Math.max(1,Math.floor((q.w+q.h)/28));for(let i=0;i<n;i++){const u=((q.id*37+i*61)%100)/100,v=((q.id*53+i*29)%100)/100;ctx.fillRect(q.x+u*q.w-1.5,q.y+v*q.h-1.5,4,3)}}
for(const e of exps){const k=e.t/e.l,r=(30+k*100)*(e.r||1);ctx.globalAlpha=Math.max(0,1-k);ctx.fillStyle='#ffb43a';ctx.beginPath();ctx.arc(e.x,e.y,r*.8,0,TAU);ctx.fill();ctx.fillStyle='#ff5a1f';ctx.beginPath();ctx.arc(e.x,e.y,r*.55,0,TAU);ctx.fill();ctx.strokeStyle='#26211c';ctx.lineWidth=5;ctx.beginPath();ctx.arc(e.x,e.y,r,0,TAU);ctx.stroke()}
 ctx.fillStyle='#26211c';for(const d of debr){ctx.globalAlpha=Math.max(0,1-d.t/d.l);ctx.fillRect(d.x-d.s/2,d.y-d.s/2,d.s,d.s)}ctx.globalAlpha=1}
function fxUpd(dt){for(let i=dying.length-1;i>=0;i--){dying[i].t+=dt;if(dying[i].t>=DT)dying.splice(i,1)}for(let i=locN.length-1;i>=0;i--){const g=locN[i];g.age+=dt;if(g.tl>0){const nx=g.x+g.vx*dt,ny=g.y+g.vy*dt;if(inWall(nx,ny,4))g.tl=0;else{g.x=nx;g.y=ny;g.tl-=dt}}if(g.age>.9)locN.splice(i,1)}shake=Math.max(0,shake-dt*1.6);for(const a of[exps,splashes,debr]){for(let i=a.length-1;i>=0;i--){const e=a[i];e.t+=dt;if(e.vx!==undefined){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=.94;e.vy*=.94}if(e.t>(e.l||.4))a.splice(i,1)}}}
/* input */
const st={l:{id:null,ox:0,oy:0,x:0,y:0},r:{id:null,ox:0,oy:0,x:0,y:0}},K={};
addEventListener('keydown',e=>K[e.code]=1);addEventListener('keyup',e=>K[e.code]=0);
['l','r'].forEach(k=>{const el=$('z'+k);
 el.addEventListener('pointerdown',e=>{if(st[k].id!==null)return;el.setPointerCapture(e.pointerId);Object.assign(st[k],{id:e.pointerId,ox:e.clientX,oy:e.clientY,x:e.clientX,y:e.clientY})});
 el.addEventListener('pointermove',e=>{if(e.pointerId===st[k].id){st[k].x=e.clientX;st[k].y=e.clientY}});
 const up=e=>{if(e.pointerId===st[k].id)st[k].id=null};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)});
const vec=k=>{const s=st[k];if(s.id===null)return[0,0,0];const dx=s.x-s.ox,dy=s.y-s.oy,d=Math.hypot(dx,dy);return d?[dx/d,dy/d,Math.min(1,d*SENS/50)]:[0,0,0]};
tapB($('bikeb'),()=>{const n=performance.now();if(RD){RD=null;MB=null;LVT=n}else{const g=nearBike();if(g){const s=g.dr?'p':'d';RD={g,s,opt:n};MB=s==='d'?{x:g.x,y:g.y,a:g.a,v:0}:null;LVT=0}}sendWS({t:'bike'})});
tapB($('lootb'),()=>{if(nearShop()){openShop();return}const c=nearCrate();if(c){srch={c,t:0};sendWS({t:'srch',id:c.id})}else if(nearAlt()&&!BS)sendWS({t:'altar'});else if(nearKS()){if(NBON){toast(TX('nwait'));return}const i=p.inv.findIndex(it=>it&&it.k==='y');if(i<0)toast(TX('nokey'));else{useOne(i);sendWS({t:'key'});renderInv()}}});
$('mute').onclick=()=>{muted=!muted;setMuteTxt()};
{const de=document.documentElement,rq=de.requestFullscreen||de.webkitRequestFullscreen,ex=document.exitFullscreen||document.webkitExitFullscreen,isF=()=>document.fullscreenElement||document.webkitFullscreenElement;
 if(!rq)$('fs').style.display='none';
 $('fs').onclick=()=>{try{if(isF())ex.call(document);else{const r=rq.call(de);if(r&&r.catch)r.catch(()=>{})}}catch(e){}};
 const upd=window.updFs=()=>{$('fs').textContent=isF()?TX('fsx'):TX('fs')};document.addEventListener('fullscreenchange',upd);document.addEventListener('webkitfullscreenchange',upd)}
function nearG(){if(!p)return -1;let bi=-1,bd=30;gi.forEach((g,i)=>{const d=Math.hypot(p.x-g.x,p.y-g.y);if(!g.h&&g.k!=='a'&&g.k!=='f'&&!canTake(g)&&d<bd){bd=d;bi=i}});return bi}
function swapTarget(g){if(p.sel>=0&&p.inv[p.sel])return p.sel;let best=-1,bs=9;p.inv.forEach((it,i)=>{if(it&&it.k===g.k&&it.s<bs){bs=it.s;best=i}});if(best<0)p.inv.forEach((it,i)=>{if(it&&it.s<bs){bs=it.s;best=i}});return best}
tapB($('swapb'),()=>{const i=nearG();if(i<0)return;const g=gi[i],t=swapTarget(g);if(t<0)return;const old=p.inv[t];pendSw=t;sendWS({t:'swap',id:g.id,give:{k:old.k,s:old.s,i:old.i,n:old.n||1}})});
function nearCrate(){if(RD)return null;let best=null,bd=44;for(const b of bl){if(Math.abs(b.x+b.w/2-p.x)>b.w/2+60||Math.abs(b.y+b.h/2-p.y)>b.h/2+60)continue;for(const q of b.cr){if(cm[q.id]===1)continue;const d=Math.hypot(p.x-q.x,p.y-q.y);if(d<bd){bd=d;best=q}}}return best}
let PRE=null,PGI=[],pcm={};function gmap(e){return{id:e[0],x:e[1],y:e[2],k:e[3]===6?'f':e[3]===5?'y':e[3]===4?'a':e[3]===2?'g':e[3]===3?'p':e[3]?'h':'w',s:e[4],i:e[5],h:e[6],ttl:e[7],n:e[8]||1}}
function openCrate(c){snd('square',180,110,.14,.07);setTimeout(()=>{snd('triangle',500,900,.15,.14);snd('triangle',760,1250,.18,.1)},90);cm[c.id]=1;pcm[c.id]=performance.now();if(PRE&&PRE.cid===c.id&&performance.now()-PRE.t<25000){for(const e of PRE.g){if(!gi.some(x=>x.id===e[0]))gi.push(gmap(e));PGI.push({e,t:performance.now()})}PRE=null}sendWS({t:'search',id:c.id})}
/* update */
function update(dt){
 life+=dt;gro-=dt;p.rev=(p.rev||0)-dt;p.hid=p.rev<=0&&trees.some(t=>Math.hypot(p.x-t[0],p.y-t[1])<t[2]-6);let[mx,my,mm_]=vec('l');
 const kx=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),ky=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0);
 if(kx||ky){const l=Math.hypot(kx,ky);mx=kx/l;my=ky/l;mm_=1}
 const sm=(performance.now()<buff.spd?1.3:1)*(performance.now()<buff.slow?.9:1)*(1+.125*(p.shoes?p.shoes.s-1:0));if(RD){rideMove(dt,mx,my,mm_);mm_=0}else{p.x+=mx*150*mm_*dt*sm;p.y+=my*150*mm_*dt*sm;if(p.kt>0){p.kt-=dt;p.x+=p.kx*dt;p.y+=p.ky*dt}push(p,12);shopBlock(p,12)}p.sp=mm_;p.wk=(p.wk||0)+mm_*dt*11;
 if(mm_>.15){p.sd=(p.sd||0)+mm_*150*dt;if(p.sd>22){p.sd=0;p.fs=-(p.fs||1);snd('n',450+Math.random()*250,0,.035,p.hid?.03:.07);const fa=Math.atan2(my,mx);fps.push({x:p.x-Math.sin(fa)*6*p.fs,y:p.y+Math.cos(fa)*6*p.fs,a:fa,t:6,m:6,z:0})}}
 const[ax,ay,am]=vec('r');let fire=false;
 if(am>.25){p.a=Math.atan2(ay,ax);fire=true}else if(mm_>.1)p.a=Math.atan2(my,mx);
 if(K.Space)fire=true;
 if(RD&&RD.s==='d'&&MB){fire=false;p.a=MB.a}
 if(zs.some(z=>z.pkd))zs=zs.filter(z=>!z.pkd);p.cd-=dt;p.fl=(p.fl||0)-dt;p.hf=(p.hf||0)-dt;const w=cw();reloadTick(dt);
 if(fire&&!srch&&w.ramp)p.spin=Math.min(1,(p.spin||0)+dt/w.ramp[2]);else p.spin=Math.max(0,(p.spin||0)-dt/1.2);
 const cur=p.sel>=0?p.inv[p.sel]:null,mg=cur&&cur.k==='w'?MG[cur.i]:null,empty=!!mg&&(cur.am<=0||cur.rl>0),gren=!!cur&&cur.k==='g';
 if(fire&&p.cd<=0&&!srch&&gren)throwNade(cur);
 if(fire&&p.cd<=0&&!srch&&empty){p.cd=.3;snd('square',140,110,.03,.05)}
 if(fire&&p.cd<=0&&!srch&&!empty&&!gren){if(mg)cur.am--;p.cd=w.ramp?w.ramp[0]+(w.ramp[1]-w.ramp[0])*p.spin:w.rate;p.fl=w.me?.18:.07;p.fc=(p.fc||0)+1;p.fa=p.a;fireSnd(w);p.rev=1.5;sendWS({t:'fire',a:p.a,w:WP.indexOf(w),x:Math.round(p.x),y:Math.round(p.y)});
  if(w.me){for(const z of zs){const a=Math.atan2(z.y-p.y,z.x-p.x),d=Math.hypot(z.x-p.x,z.y-p.y);if(d<w.rg+12*z.rs&&Math.abs(Math.atan2(Math.sin(a-p.a),Math.cos(a-p.a)))<w.arc)predictHit(z,w.d*dmul())}}
  else if(w.beam){beams.push({x:p.x,y:p.y,a:p.a,L:beamLen(p.x,p.y,p.a,w.rg),t:.2})}else for(let i=0;i<w.pel;i++){const a=p.a+sprd(w),sp=w.sp||700;bs.push({x:p.x,y:p.y,x0:p.x,y0:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:w.rg/sp,rg:w.rg,fo:w.fo,pi:w.pi,pn:w.pn||0,pf:w.pf,hz:(w.pi||w.pn)?[]:null,d:w.d*dmul(),mine:1,fi:w.pf===.92?1:0,nd:w.nd,bm:w.bm?w:null,a0:a,big:w.bm?1:0})}}
 fullT-=dt;fullNow=false;
 for(let i=fps.length-1;i>=0;i--){fps[i].t-=dt;if(fps[i].t<=0)fps.splice(i,1)}
 {const now=performance.now();for(const g of gi){if(g.h)continue;if(Math.hypot(p.x-g.x,p.y-g.y)<24){if(canTake(g)){if(!PK[g.id]||now-PK[g.id]>500){PK[g.id]=now;sendWS({t:'pick',id:g.id})}}else if(g.k!=='a'&&g.k!=='f')fullNow=true}}}
 if(srch){if(mm_>.3||Math.hypot(p.x-srch.c.x,p.y-srch.c.y)>60)srch=null;else{srch.t+=dt;if(srch.t>=1.2){openCrate(srch.c);srch=null}}}
 for(let i=bs.length-1;i>=0;i--){const b=bs[i];let dead=false;const n=Math.max(1,Math.ceil(Math.hypot(b.vx,b.vy)*dt/10));
  for(let s=0;s<n&&!dead;s++){const d=dt/n;if(b.bm){if(!b.T){const sp0=Math.hypot(b.vx,b.vy);b.T=b.bm.rg*2/sp0;b.v0x=b.vx;b.v0y=b.vy;b.l=b.T+b.bm.fu;b.L0=b.l}const f0=Math.max(0,1-(b.L0-b.l)/b.T);b.vx=b.v0x*f0;b.vy=b.v0y*f0}b.x+=b.vx*d;b.y+=b.vy*d;b.l-=d;dead=b.l<=0||inWall(b.x,b.y);
  if(!dead&&TBS.some(t=>Math.hypot(t[1]-b.x,t[2]-b.y)<16))dead=true;
  if(!dead&&!b.bm)for(const z of zs)if(Math.hypot(z.x-b.x,z.y-b.y)<14*z.rs&&!(b.hz&&b.hz.includes(z))){snd('square',180,60,.08,.1);if(b.bm){dead=true;break}
   if(b.mine){const dd=Math.hypot(b.x-b.x0,b.y-b.y0);predictHit(z,b.fo?b.d*(1.7-1.15*Math.min(1,dd/b.rg)):b.d);if(b.hz)b.hz.push(z);if(!(b.pi&&dd<b.pi)&&!(b.pn>0&&b.pn--))dead=true;else if(b.pf)b.d*=b.pf}else dead=true;break}}
  if(dead&&b.bm)bmBurst(b,b.vx*dt/n,b.vy*dt/n);
  if(dead)bs.splice(i,1)}
}
