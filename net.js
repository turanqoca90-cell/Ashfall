/* server connection: accounts, shared zombies, multiplayer */
let KSO=-1e9,BT=[],ALTD=0,WSK=null,SID=0,PL=[],zmap={},spawnT=0,connP=null;
function sendWS(o){if(WSK&&WSK.readyState===1)WSK.send(JSON.stringify(o))}
function connect(){return new Promise(res=>{let ws,done=false;
 try{ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host)}catch(e){return res(false)}
 ws.onopen=()=>{WSK=ws;done=true;res(true)};
 ws.onerror=()=>{if(!done){done=true;res(false)}};
 ws.onclose=()=>{if(WSK===ws)WSK=null;if(!done){done=true;res(false)}if(p&&!paused){paused=true;showDisc()}};
 ws.onmessage=e=>{try{onMsg(JSON.parse(e.data))}catch(err){}}})}
function ensureConn(){if(WSK)return Promise.resolve(true);if(connP)return connP;
 connP=(async()=>{let ok=false;for(let i=0;i<14&&!ok;i++){ok=await connect();if(!ok)await sleep(5000)}connP=null;return ok})();return connP}
function onMsg(m){if(m.t==='s')snap(m);else if(m.t==='got')gotItem(m);else if(m.t==='sr')PRE={cid:m.cid,g:m.g,t:performance.now()};
 else if(m.t==='ks'){KSO=performance.now();snd('sine',500,1000,.4,.2)}
 else if(m.t==='gi'){for(const e of m.g||[])if(!gi.some(x=>x.id===e[0]))gi.push({id:e[0],x:e[1],y:e[2],k:e[3]===6?'f':e[3]===5?'y':e[3]===4?'a':e[3]===2?'g':e[3]===3?'p':e[3]?'h':'w',s:e[4],i:e[5],h:e[6],ttl:e[7],n:e[8]||1})}
 else if(m.t==='dm'){if(p){p.x=m.x;p.y=m.y}RD=null;MB=null}
 else if(m.t==='dead'){if(p&&p.inv){const items=[...p.inv,p.armor,p.shoes].filter(Boolean).map(q=>({k:q.k,s:q.s,i:q.i|0,n:q.n||1}));sendWS({t:'tomb',id:m.tb,items});p.inv=[null,null,null,null];p.armor=p.shoes=null;p.sel=-1;renderInv()}}
 else if(m.t==='bought')gotBought(m);else if(m.t==='nobuy')buyDone()
 else if(m.t==='tg'){toast('+'+m.g+' G ('+m.n+')');snd('triangle',900,1300,.12,.16)}
 else if(m.t==='kb'){if(p){p.kx=m.x;p.ky=m.y;p.kt=.2}}
 else if(m.t==='bm'){toast(TX(m.k[0]==='n'?m.k:m.k==='dead'?'bdead':m.k==='burrow'?'bburrow':'bspawn'));if(m.k==='spawn'||m.k==='nspawn')bossRoar()}
 else if(m.t==='deb'){const n=performance.now();if(m.k==='slow')buff.slow=n+2000;else buff.weak=n+2000}
 else if(m.t==='wl'){for(const id of m.d||[]){const q=walls[id];if(q&&!q.d){wallSet(q,false);broken.add(q)}}for(const id of m.r||[]){const q=walls[id];if(q&&q.d){wallSet(q,true);broken.delete(q)}}}}
function gotItem(m){const it=m.it;
 if(it.k==='f'){if(!p)return;const old=p.shoes;if(old&&old.s>=it.s){sendWS({t:'drop',k:'f',s:it.s,i:0,n:1});return}p.shoes={k:'f',s:it.s,i:0,n:1};if(old)sendWS({t:'drop',k:'f',s:old.s,i:0,n:1});renderInv();return}
 if(it.k==='a'){if(!p)return;const old=p.armor;if(old&&old.s>=it.s){sendWS({t:'drop',k:'a',s:it.s,i:0,n:1});return}p.armor={k:'a',s:it.s,i:0,n:1};if(old)sendWS({t:'drop',k:'a',s:old.s,i:0,n:1});renderInv()}
 else if(m.sw&&pendSw>=0&&p&&p.inv[pendSw]){p.inv[pendSw]={k:it.k,s:it.s,i:it.i,n:it.n||1};renderInv()}
 else{const n0=it.n||1,r=p?addItem(it):n0;if(r>0){if(p)sendWS({t:'drop',k:it.k,s:it.s,i:it.i,n:r});if(r>=n0)return}}
 pendSw=-1;snd('triangle',620,900,.07,.16);setTimeout(()=>snd('triangle',900,1300,.09,.14),70);toast(stars(it.s)+' '+inm(it))}
let TBS=[],MYG=[];const TBHIT={};
/* marker for your own graves, used by the minimap (small) and the big map */
function graveMark(g,x,y,k){g.save();g.translate(x,y);g.scale(k,k);g.lineJoin='round';g.strokeStyle='#ff3b30';g.lineWidth=2.5;g.beginPath();g.arc(0,0,14+Math.sin(performance.now()/250)*2,0,TAU);g.stroke();
 g.beginPath();g.moveTo(-7,9);g.lineTo(-7,-3);g.arc(0,-3,7,Math.PI,0);g.lineTo(7,9);g.closePath();g.fillStyle='#fff';g.fill();g.strokeStyle='#000';g.lineWidth=2;g.stroke();g.fillStyle='#000';g.fillRect(-1.2,-6,2.4,11);g.fillRect(-4,-3,8,2.4);g.restore()}
function drawTombs(){const now=performance.now();for(const[id,x,y,hp,name]of TBS){const o=TBHIT[id]||(TBHIT[id]={hp,t:0});if(hp<o.hp)o.t=now+100;o.hp=hp;const fl=now<o.t;
 ctx.save();ctx.translate(x,y);ctx.lineJoin='round';ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(3,13,18,7,0,0,TAU);ctx.fill();
 dPoly(ctx,[[-17,10],[17,10],[19,16],[-19,16]],'#6b5a45',OL,2);
 ctx.beginPath();ctx.moveTo(-13,12);ctx.lineTo(-13,-8);ctx.arc(0,-8,13,Math.PI,0);ctx.lineTo(13,12);ctx.closePath();ctx.fillStyle=fl?'#fff':'#9aa0a6';ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2.5;ctx.stroke();
 ctx.fillStyle='#565d64';ctx.fillRect(-2,-15,4,17);ctx.fillRect(-7,-10,14,4);
 ctx.font='700 12px sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';ctx.strokeText(name,0,-28);ctx.fillStyle='#fff';ctx.fillText(name,0,-28);
 if(hp<50){ctx.fillStyle='#000';ctx.fillRect(-18,20,36,5);ctx.fillStyle='#c8483a';ctx.fillRect(-17,21,34*hp/50,3)}ctx.restore()}}
function snap(m){SID=m.i;TBS=m.tb||[];MYG=m.mt||[];PL=m.p;gi=(m.gi||[]).map(e=>({id:e[0],x:e[1],y:e[2],k:e[3]===6?'f':e[3]===5?'y':e[3]===4?'a':e[3]===2?'g':e[3]===3?'p':e[3]?'h':'w',s:e[4],i:e[5],h:e[6],ttl:e[7],n:e[8]||1}));cm={};for(const e of m.c||[])cm[e[0]]=e[1];
 {const n=performance.now();for(const k in pcm)if(n-pcm[k]>1500)delete pcm[k];else if(!cm[k])cm[k]=1;PGI=PGI.filter(q=>n-q.t<900&&!gi.some(x=>x.id===q.e[0])&&!PK[q.e[0]]);for(const q of PGI)gi.push(gmap(q.e))}
 const nz=[],seen={};
 for(const e of m.z){seen[e[0]]=1;let z=zmap[e[0]];if(!z)z=zmap[e[0]]={x:e[1],y:e[2],ph:e[0]*1.7%6};
  if(z.pkd){if(performance.now()-z.pkd<1500)continue;z.pkd=0}z.id=e[0];z.tx=e[1];z.ty=e[2];z.a=e[3]/100;z.hp=(z.pt&&performance.now()-z.pt<700)?Math.max(1,Math.min(e[4],z.php)):e[4];z.mh=e[5];z.kd=e[6];z.rs=e[7]/10;z.ag=e[8];z.hit=e[9]?.1:0;z.fz=(e[10]||0)/10;if(z.fz>0&&e[6]!==13&&e[6]!==14&&e[6]!==17&&p&&Math.hypot(e[1]-p.x,e[2]-p.y)<500)snd('n',2600,0,.07,.05);z.zn=zoneAt(e[1],e[2]);nz.push(z)}
 const died=new Set(m.dd||[]);
 for(const k in zmap)if(!seen[k]){const z=zmap[k];if(died.has(+k)&&!z.pkd)dying.push({t:0,q:Object.assign({},z,{hit:0,hl:0,fz:0,hp:z.mh})});if(p){const d=Math.hypot(z.x-p.x,z.y-p.y);if(d<700&&z.kd!==12)snd('sawtooth',170,40,.3,.05+.18*(1-d/700))}delete zmap[k]}
 zs=nz;
 {const ns=[],ss={};for(const e of m.sp||[]){ss[e[0]]=1;let s=smap[e[0]];if(!s){s=smap[e[0]]={x:e[1],y:e[2],pl:e[3]};if(p){const d=Math.hypot(e[1]-p.x,e[2]-p.y);if(d<700){if(e[3]===1){const nw=performance.now();if(nw-(window._hs||0)>200){window._hs=nw;snd('n',900,0,.14,.05+.12*(1-d/700))}}else snd('sine',420,160,.16,.04+.12*(1-d/700))}}}s.tx=e[1];s.ty=e[2];ns.push(s)}
  for(const k in smap)if(!ss[k]){const s=smap[k];if(s.pl!==1)splashes.push({x:s.x,y:s.y,t:0,sn:s.pl===2});delete smap[k]}sps=ns;
  for(const e of m.ex||[])boom(e[0],e[1],e[2]);
  bkSnap(m);{const n2=[],s2={};for(const e of m.ng||[]){s2[e[0]]=1;let g=nmap[e[0]];if(!g)g=nmap[e[0]]={x:e[1],y:e[2]};g.tx=e[1];g.ty=e[2];g.st=e[3];g.fz=e[4]/10;g.mk=e[7]||0;if(e[9]!==undefined){g.ta=(e[8]||0)/100;if(g.sc!==undefined&&e[9]>g.sc)shootTr(g);g.sc=e[9]}n2.push(g);if(e[6])locN=locN.filter(l=>l.cid!==e[5])}for(const k in nmap)if(!s2[k])delete nmap[k];ng=n2}}
 MH=m.wh||[];{const s={};for(const h of MH){s[h[0]]=1;if(!mhSeen[h[0]]&&p){const d=Math.hypot(h[1]-p.x,h[2]-p.y);if(d<600)snd('n',280,0,.8,.06+.2*(1-d/600))}}mhSeen=s}
 BS=m.bs||0;DZC=m.dz||[];HM=m.hm||[];NBON=m.nb|0;ALTD=m.ad|0;BT=m.bt||[];if(p&&!paused&&performance.now()-spawnT>800){if(m.me.hp<p.hp-1){snd('sawtooth',200,80,.15,.18);p.hf=.2}p.hp=m.me.hp;kills=m.me.k;setGold(m.me.g||0);if(m.me.hp<=0)die()}}
function net(dt){pt-=dt;if(pt>0||!WSK)return;pt=.05;
 if(p&&!paused&&prof)sendWS({t:'pos',x:Math.round(p.x),y:Math.round(p.y),a:+p.a.toFixed(2),w:WP.indexOf(cw()),c:opts.skin,ar:p.armor?p.armor.s-1:0,ba:RD&&RD.s==='d'&&MB?+MB.a.toFixed(2):0,bv:RD&&RD.s==='d'&&MB?Math.round(MB.v):0})}
function remotes(dt){bkUpd(dt);const out=[],seen={};
 for(const q of PL){if(q[0]===SID)continue;seen[q[0]]=1;const pr={n:q[1],x:q[2],y:q[3],a:q[4],w:q[5],c:q[6],f:q[7],fa:q[8],hp:q[9]};
  let r=rp[q[0]];if(!r)r=rp[q[0]]={id:q[0],x:pr.x,y:pr.y,a:pr.a,f:pr.f,wk:0,fl:0,sp:0};
  const dx=pr.x-r.x,dy=pr.y-r.y;r.x+=dx*Math.min(1,dt*12);r.y+=dy*Math.min(1,dt*12);r.sp=Math.min(1,Math.hypot(dx,dy)/12);r.wk+=r.sp*dt*11;
  r.a+=Math.atan2(Math.sin(pr.a-r.a),Math.cos(pr.a-r.a))*Math.min(1,dt*14);r.w=pr.w;r.n=pr.n;r.c=pr.c;r.hp=pr.hp;
  if(pr.f<r.f)r.f=pr.f;
  if(pr.f>r.f){const n=Math.min(3,pr.f-r.f),w=WP[pr.w]||WP[0];r.f=pr.f;r.fl=.07;
   if(w.beam)beams.push({x:r.x,y:r.y,a:pr.fa,L:beamLen(r.x,r.y,pr.fa,w.rg),t:.2});else if(!w.me)for(let k=0;k<n*w.pel;k++){const a=pr.fa+sprd(w),sp=w.sp||700;bs.push({rm:1,x:r.x,y:r.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:w.rg/sp,d:w.d,nd:w.nd,bm:w.bm?w:null,a0:a,big:w.bm?1:0})}}
  r.fl-=dt;out.push(r)}
 for(const k in rp)if(!seen[k])delete rp[k];
 const f=Math.min(1,dt*12);for(const z of zs){z.x+=(z.tx-z.x)*f;z.y+=(z.ty-z.y)*f;if(z.hl>0)z.hl-=dt}{const g=Math.min(1,dt*25);for(const s of sps){s.x+=(s.tx-s.x)*g;s.y+=(s.ty-s.y)*g}for(const s of ng){s.x+=(s.tx-s.x)*g;s.y+=(s.ty-s.y)*g}}
 return out}
const _drop=drop;
drop=function(){_drop();spawnT=performance.now();p.hp=100;sendWS({t:'spawn',x:p.x,y:p.y})};
ensureConn();applyOpts();applyLang();nav(showMenu);requestAnimationFrame(loop);
