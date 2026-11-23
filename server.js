// Ashfall game server: accounts, shared zombies, multiplayer.
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {WebSocketServer}=require('ws');
const WS=6400,TAU=Math.PI*2,PORT=process.env.PORT||3000;
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const zoneAt=(x,y)=>{const d=Math.hypot(x-WS/2,y-WS/2)/(WS/2);return d<.3?3:d<.65?2:1};
const ZN=['','Outskirts','Midlands','The Core'],RF=['#7a5c4a','#5f6b73','#6b5d78','#8a7a55','#4f6a5a'];
const WP=[{nm:'Fists',st:0,me:1,d:10,rate:.5,rg:44,arc:.9},{nm:'Pistol',st:1,d:22,rate:.4,pel:1,spr:.04,rg:480},{nm:'SMG',st:2,d:13,rate:.11,pel:1,spr:.14,rg:420},{nm:'Shotgun',st:3,d:12,rate:.75,pel:8,spr:.09,gs:1,fo:1,pi:50,rg:300},{nm:'Rifle',st:4,d:42,rate:.36,pel:1,spr:.02,rg:640,sp:1250},{nm:'Plasma gun',st:5,d:28,rate:.07,pel:1,spr:.06,rg:560},{nm:'Crowbar',st:1,me:1,d:22,rate:.55,rg:58,arc:1},{nm:'Sword',st:2,me:1,d:34,rate:.45,rg:80,arc:1.4},{nm:'SCAR',st:3,d:21,rate:.14,pel:1,spr:.05,rg:520,sp:900},{nm:'Handcannon',st:4,d:72,rate:.75,pel:1,spr:.015,rg:560,sp:900},{nm:'Minigun',st:5,d:20,rate:.24,ramp:[.24,.045,2.5],pel:1,spr:.13,rg:520,sp:800}];
const WBS=[null,[1,6],[2,7],[3,8],[4,9],[5,10]];
const sprd=w=>{if(w.gs){let u=0;while(!u)u=Math.random();return Math.max(-.3,Math.min(.3,Math.sqrt(-2*Math.log(u))*Math.cos(TAU*Math.random())*w.spr))}return(Math.random()-.5)*w.spr*2};
const HL=['','Bandage','Painkillers','Medkit','Trauma kit','Surgery kit'],WT=[0,[60,30,9,1,0],[22,38,26,12,2],[4,16,32,32,16]];
const bl=[],walls=[],trees=[],R0=rng(7);
function mkWalls(x,y,w,h,doors,inner){const t=10,G=48,ws=[];
 const line=(o,fx,from,to,gaps)=>{const gs=gaps.slice().sort((a,b)=>a-b);let cur=from;const add=(s,e)=>{if(e-s>1)ws.push(o==='h'?{x:s,y:fx,w:e-s,h:t}:{x:fx,y:s,w:t,h:e-s})};for(const g of gs){add(cur,g-G/2);cur=g+G/2}add(cur,to)};
 const dd=s=>doors.filter(d=>d.s===s).map(d=>s==='t'||s==='b'?x+w*d.f:y+h*d.f);
 line('h',y,x,x+w,dd('t'));line('h',y+h-t,x,x+w,dd('b'));line('v',x,y,y+h,dd('l'));line('v',x+w-t,y,y+h,dd('r'));
 for(const n of inner){if(n.o==='h')line('h',y+h*n.f-t/2,x+w*n.a,x+w*n.z,n.g.map(g=>x+w*g));else line('v',x+w*n.f-t/2,y+h*n.a,y+h*n.z,n.g.map(g=>y+h*g))}
 return ws}
const absDoors=(x,y,w,h,doors)=>doors.map(d=>d.s==='b'?{x:x+w*d.f,y:y+h,r:0}:d.s==='t'?{x:x+w*d.f,y,r:Math.PI}:d.s==='l'?{x,y:y+h*d.f,r:Math.PI/2}:{x:x+w,y:y+h*d.f,r:-Math.PI/2});
/* shaped buildings: every X is a square room, rooms are joined by doorways */
function mkCells(x0,y0,S,rows){const t=10,G=48,ws=[],dr=[],cells=[],cs=new Set(),bd=[];
 rows.forEach((s,r)=>[...s].forEach((ch,c)=>{if(ch==='X'){cells.push([r,c]);cs.add(r*20+c)}}));
 const has=(r,c)=>cs.has(r*20+c);
 const vseg=(X,Y,gap)=>{if(gap){ws.push({x:X,y:Y,w:t,h:(S-G)/2});ws.push({x:X,y:Y+(S+G)/2,w:t,h:(S-G)/2})}else ws.push({x:X,y:Y,w:t,h:S})};
 const hseg=(X,Y,gap)=>{if(gap){ws.push({x:X,y:Y,w:(S-G)/2,h:t});ws.push({x:X+(S+G)/2,y:Y,w:(S-G)/2,h:t})}else ws.push({x:X,y:Y,w:S,h:t})};
 for(const[r,c]of cells){
  if(has(r,c+1))vseg(x0+(c+1)*S-t/2,y0+r*S,true);
  if(has(r+1,c))hseg(x0+c*S,y0+(r+1)*S-t/2,true);
  if(!has(r,c-1))bd.push(['l',r,c]);if(!has(r,c+1))bd.push(['r',r,c]);if(!has(r-1,c))bd.push(['t',r,c]);if(!has(r+1,c))bd.push(['b',r,c])}
 const n=Math.max(3,Math.round(bd.length/5)),dset=new Set();for(let k=0;k<n;k++)dset.add(Math.floor((k+.5)*bd.length/n));
 bd.forEach(([s,r,c],i)=>{const g=dset.has(i),X=x0+c*S,Y=y0+r*S;
  if(s==='l'){vseg(X,Y,g);if(g)dr.push({x:X,y:Y+S/2,r:Math.PI/2})}
  else if(s==='r'){vseg(X+S-t,Y,g);if(g)dr.push({x:X+S,y:Y+S/2,r:-Math.PI/2})}
  else if(s==='t'){hseg(X,Y,g);if(g)dr.push({x:X+S/2,y:Y,r:Math.PI})}
  else{hseg(X,Y+S-t,g);if(g)dr.push({x:X+S/2,y:Y+S,r:0})}});
 return{ws,dr,cells,cs}}
const SHAPES=[{t:6,rows:['...XX','XXXX.','...XX']},{t:7,rows:['.XX..','XXXXX','...XX']},{t:8,rows:['X...','X...','X...','XXXX']},{t:9,rows:['X...X','X...X','XXXXX']}];
const BIG=[
 {t:4,w:[400,440],h:[330,370],lb:.3,doors:[{s:'b',f:.25},{s:'b',f:.75},{s:'t',f:.25},{s:'r',f:.5}],inner:[{o:'v',f:.5,a:0,z:1,g:[.3,.75]},{o:'h',f:.5,a:0,z:.5,g:[.25]}],cr:[[.25,.25],[.25,.75],[.75,.25],[.75,.75],[.88,.2],[.1,.88]]},
 {t:5,w:[440,480],h:[330,360],lb:.2,doors:[{s:'l',f:.5},{s:'r',f:.5},{s:'b',f:.5},{s:'t',f:.5}],inner:[{o:'h',f:.33,a:0,z:1,g:[.25,.75]},{o:'h',f:.67,a:0,z:1,g:[.25,.75]},{o:'v',f:.5,a:.33,z:.67,g:[.5]}],cr:[[.15,.16],[.38,.16],[.85,.16],[.25,.5],[.75,.5],[.2,.84],[.8,.84]]}];
const used=new Set();
for(let i=0;i<24;i++)for(let j=0;j<24;j++){
 if(used.has(i*24+j))continue;
 if(i<23&&j<23&&R0()<.07&&!used.has((i+1)*24+j)&&!used.has(i*24+j+1)&&!used.has((i+1)*24+j+1)){
  const k=Math.floor(R0()*6),cx=(i+1)*266+(R0()-.5)*24,cy=(j+1)*266+(R0()-.5)*24;
  used.add(i*24+j);used.add((i+1)*24+j);used.add(i*24+j+1);used.add((i+1)*24+j+1);
  if(k<2){const B=BIG[k],w=B.w[0]+R0()*(B.w[1]-B.w[0])|0,h=B.h[0]+R0()*(B.h[1]-B.h[0])|0,x=cx-w/2,y=cy-h/2;
   const ws=mkWalls(x,y,w,h,B.doors,B.inner);ws.forEach(q=>walls.push(q));
   bl.push({x,y,w,h,z:zoneAt(cx,cy),c:RF[Math.floor(R0()*5)],t:B.t,lb:B.lb,dr:absDoors(x,y,w,h,B.doors),ws,cr:B.cr.map(f=>({x:x+w*f[0],y:y+h*f[1],t:0}))})}
  else{const SH=SHAPES[k-2],S=92,rows=SH.rows,W=rows[0].length*S,H=rows.length*S,x=cx-W/2,y=cy-H/2,m=mkCells(x,y,S,rows),cr=[];
   m.ws.forEach(q=>walls.push(q));m.cells.forEach(([r,c],n)=>{if(n%3!==2)cr.push({x:x+c*S+S*.3,y:y+r*S+S*.3,t:0})});
   bl.push({x,y,w:W,h:H,z:zoneAt(cx,cy),c:RF[Math.floor(R0()*5)],t:SH.t,lb:.25,dr:m.dr,ws:m.ws,cells:m.cells,cs:m.cs,S,cr})}
  continue}
 if(R0()>.34)continue;
 const ty=R0(),tp=ty<.4?0:ty<.65?1:ty<.85?2:3,w=[125+R0()*30,190+R0()*10,160+R0()*25,105+R0()*15][tp]|0,h=[100+R0()*20,140+R0()*10,110+R0()*15,100+R0()*10][tp]|0,x=i*266+133-w/2+(R0()-.5)*40,y=j*266+133-h/2+(R0()-.5)*40,dd=[{s:'b',f:.5}],ws=mkWalls(x,y,w,h,dd,[]);
 ws.forEach(q=>walls.push(q));
 bl.push({x,y,w,h,z:zoneAt(x+w/2,y+h/2),c:RF[Math.floor(R0()*5)],t:tp,lb:tp===3?.5:0,dr:absDoors(x,y,w,h,dd),ws,cr:(tp===1?[.22,.5,.78]:[.3,.7]).map(f=>({x:x+w*f,y:y+h*.42,t:0}))})}
let _n=0;const CR=[];bl.forEach(b=>b.cr.forEach(q=>{q.id=_n++;q.b=b;CR.push(q)}));
for(let i=0;i<700;i++){const x=R0()*WS,y=R0()*WS,r=22+R0()*10;if(bl.some(b=>x>b.x-r-12&&x<b.x+b.w+r+12&&y>b.y-r-12&&y<b.y+b.h+r+12))continue;trees.push([x,y,r])}
function push(o,r){for(const q of near(o.x,o.y)){if(o.x<q.x-r||o.x>q.x+q.w+r||o.y<q.y-r||o.y>q.y+q.h+r)continue;const nx=Math.max(q.x,Math.min(o.x,q.x+q.w)),ny=Math.max(q.y,Math.min(o.y,q.y+q.h)),dx=o.x-nx,dy=o.y-ny,d2=dx*dx+dy*dy;
 if(d2<r*r){if(d2>1e-4){const d=Math.sqrt(d2),f=(r-d)/d;o.x+=dx*f;o.y+=dy*f}else o.y-=r}}
 o.x=Math.max(r,Math.min(WS-r,o.x));o.y=Math.max(r,Math.min(WS-r,o.y))}
const inWall=(x,y,m=0)=>near(x,y).some(q=>x>q.x-m&&x<q.x+q.w+m&&y>q.y-m&&y<q.y+q.h+m);
const inside=(o,b)=>b.cells?b.cs.has(Math.floor((o.y-b.y)/b.S)*20+Math.floor((o.x-b.x)/b.S)):(o.x>b.x+10&&o.x<b.x+b.w-10&&o.y>b.y+10&&o.y<b.y+b.h-10);

/* wall lookup grid: only check the walls in the cell, much cheaper than all of them */
const GRID=new Map(),NONE=[],GK=(cx,cy)=>(cx+10)*4096+(cy+10);
for(const q of walls)for(let cx=Math.floor((q.x-24)/128);cx<=Math.floor((q.x+q.w+24)/128);cx++)for(let cy=Math.floor((q.y-24)/128);cy<=Math.floor((q.y+q.h+24)/128);cy++){const k=GK(cx,cy);if(!GRID.has(k))GRID.set(k,[]);GRID.get(k).push(q)}
function near(x,y){return GRID.get(GK(Math.floor(x/128),Math.floor(y/128)))||NONE}
/* loot: crates and ground items live on the server so everyone sees the same ones */
const GI=[],OPEN=new Set(),RARE=new Set();let gid=1;
function rollRare(c){c.open=false;OPEN.delete(c);const z=c.b.z;c.rare=Math.random()<(z===3?.10:z===2?.05:.01);if(c.rare)RARE.add(c);else RARE.delete(c)}
for(const c of CR)rollRare(c);
function rollItem(z,lb){let r=Math.random()*100,s=5;const wt=WT[z];for(let i=0;i<5;i++){if(r<wt[i]){s=i+1;break}r-=wt[i]}if(s<5&&Math.random()<lb)s++;
 let k=Math.random()<.75?'w':'h';if(k==='h'&&(s===1||s===4))k='w';return k==='w'?{k,s,i:WBS[s][Math.random()<.5?0:1]}:{k,s}}
function rareItem(){const s=Math.random()<.65?4:5;return{k:'w',s,i:WBS[s][Math.random()<.5?0:1]}}
const validItem=m=>m&&((m.k==='w'&&m.s>=1&&m.s<=5&&(m.i===WBS[m.s][0]||m.i===WBS[m.s][1]))||(m.k==='h'&&(m.s===2||m.s===3||m.s===5)));
/* zombie pathfinding: a blocked-cell grid plus a breadth-first distance field toward the target */
const CS=16,NC=400,FR=38,FW=77,DX=[1,-1,0,0,1,1,-1,-1],DY=[0,0,1,-1,1,-1,1,-1],BLK=new Uint8Array(NC*NC),FC=new Map();let fbud=0;
for(const q of walls){const x0=Math.max(0,Math.floor((q.x-9)/CS)),x1=Math.min(NC-1,Math.floor((q.x+q.w+9)/CS)),y0=Math.max(0,Math.floor((q.y-9)/CS)),y1=Math.min(NC-1,Math.floor((q.y+q.h+9)/CS));for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++)BLK[cy*NC+cx]=1}
function getField(tx,ty){const qx=Math.floor(tx/CS/3)*3,qy=Math.floor(ty/CS/3)*3,key=qx*1000+qy,now=Date.now();let f=FC.get(key);
 if(f&&now-f.t<400)return f;if(fbud<=0)return f||null;fbud--;
 const d=new Int16Array(FW*FW).fill(-1),ox=qx-FR,oy=qy-FR,q=new Int32Array(FW*FW);let h=0,tl=0;d[FR*FW+FR]=0;q[tl++]=FR*FW+FR;
 while(h<tl){const cur=q[h++],cx=cur%FW,cy=(cur/FW)|0,cd=d[cur];
  for(let k=0;k<8;k++){const nx=cx+DX[k],ny=cy+DY[k];if(nx<0||ny<0||nx>=FW||ny>=FW)continue;const gx=ox+nx,gy=oy+ny;if(gx<0||gy<0||gx>=NC||gy>=NC||BLK[gy*NC+gx])continue;const ni=ny*FW+nx;if(d[ni]>=0)continue;
   if(DX[k]&&DY[k]&&(BLK[(oy+cy)*NC+gx]||BLK[gy*NC+ox+cx]))continue;d[ni]=cd+1;q[tl++]=ni}}
 f={t:now,ox,oy,d};FC.set(key,f);return f}
function stepDir(z,tx,ty){const f=getField(tx,ty);if(!f)return null;const cx=Math.floor(z.x/CS)-f.ox,cy=Math.floor(z.y/CS)-f.oy;if(cx<0||cy<0||cx>=FW||cy>=FW)return null;
 let best=1e9,bx=0,by=0;for(let k=0;k<8;k++){const nx=cx+DX[k],ny=cy+DY[k];if(nx<0||ny<0||nx>=FW||ny>=FW)continue;const d=f.d[ny*FW+nx];if(d<0)continue;
  if(DX[k]&&DY[k]&&(f.d[cy*FW+nx]<0||f.d[ny*FW+cx]<0))continue;if(d<best){best=d;bx=nx;by=ny}}
 if(best===1e9)return null;return[(f.ox+bx+.5)*CS-z.x,(f.oy+by+.5)*CS-z.y]}
function mkZ(z){const r=Math.random(),bg=.06+z*.06,k=r<bg?2:r<bg+.22?1:0,hv=.8+Math.random()*.45,b=28+z*24,s=(46+z*12+Math.random()*14)*1.15,d=6+z*3;
 if(k===1)return{kd:1,rs:1,hp:b*.7*hv,sp:s*1.5,dm:d};
 if(k===2)return{kd:2,rs:1.3,hp:b*2*hv,sp:s,dm:d*1.3};
 return{kd:0,rs:1,hp:b*hv,sp:s,dm:d}}
const los=(x1,y1,x2,y2)=>{const d=Math.hypot(x2-x1,y2-y1),n=Math.ceil(d/8);for(let i=1;i<n;i++){const t=i/n;if(inWall(x1+(x2-x1)*t,y1+(y2-y1)*t))return false}return true};

/* storage: Postgres if DATABASE_URL is set, otherwise a local file (lost on redeploy) */
let pool=null,mem={};
async function initDB(){
 if(process.env.DATABASE_URL){const{Pool}=require('pg');pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.PGSSL==='off'?false:{rejectUnauthorized:false}});
  await pool.query('create table if not exists users(k text primary key,d jsonb)');console.log('Using Postgres')}
 else{console.log('WARNING: no DATABASE_URL set. Accounts are saved to users.json and are lost on redeploy.');try{mem=JSON.parse(fs.readFileSync('users.json','utf8'))}catch(e){}}}
async function getU(k){if(pool){const r=await pool.query('select d from users where k=$1',[k]);return r.rows[0]?r.rows[0].d:null}return mem[k]||null}
async function putU(k,d){if(pool)await pool.query('insert into users(k,d) values($1,$2) on conflict(k) do update set d=$2',[k,JSON.stringify(d)]);else{mem[k]=d;try{fs.writeFileSync('users.json',JSON.stringify(mem))}catch(e){}}}

/* accounts */
const hashPw=(pw,salt)=>crypto.scryptSync(pw,salt,32).toString('hex'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const ukey=n=>n.toLowerCase().replace(/[^a-z0-9_-]/g,''),cl=v=>Math.max(12,Math.min(WS-12,+v||0));
const P=new Map();let nid=1,zid=1,zs=[],bullets=[],spT=0;
const send=(o,m)=>{if(o.ws.readyState===1)o.ws.send(JSON.stringify(m))};
function login(o,k,d,tok,r){for(const q of P.values())if(q!==o&&q.u===k)try{q.ws.close()}catch(e){}
 o.u=k;o.d=d;o.name=d.name;send(o,{t:'authok',prof:{name:d.name,kills:d.kills,deaths:d.deaths,best:d.best},tok,r})}
function endLife(o){if(!o.d||!o.life)return;o.life=false;o.d.kills+=o.k;o.d.deaths+=o.hp<=0?1:0;o.d.best=Math.max(o.d.best,Math.round((Date.now()-o.t0)/1000));putU(o.u,o.d).catch(()=>{})}
function die(o){o.alive=false;o.hp=0;endLife(o);send(o,{t:'dead'})}
function hurt(z,d,o){z.hp-=d;z.hit=.1;z.ag=1;z.lost=0;z.lx=o.x;z.ly=o.y;if(z.hp<=0&&!z.dead){z.dead=1;o.k++}}
function noise(x,y){for(const z of zs)if(Math.hypot(z.x-x,z.y-y)<280&&!z.los){z.ag=1;z.lost=-2;z.lx=x;z.ly=y}}

async function handle(o,m){
 if(m.t==='auth'){const name=String(m.u||'').trim().slice(0,14),k=ukey(name),pw=String(m.pw||'');
  if(k.length<3)return send(o,{t:'autherr',m:'Username needs 3 or more letters or numbers.'});
  if(pw.length<4)return send(o,{t:'autherr',m:'Password needs 4 or more characters.'});
  let d=await getU(k);
  if(m.m==='signup'){if(d)return send(o,{t:'autherr',m:'That username is taken.'});const salt=crypto.randomBytes(16).toString('hex');d={name,salt,hash:hashPw(pw,salt),kills:0,deaths:0,best:0}}
  else{if(!d)return send(o,{t:'autherr',m:'No such user. Try Sign up.'});if(hashPw(pw,d.salt)!==d.hash)return send(o,{t:'autherr',m:'Wrong password.'})}
  const tok=crypto.randomBytes(16).toString('hex');d.tok=sha(tok);await putU(k,d);return login(o,k,d,tok,false)}
 if(m.t==='resume'){const k=ukey(String(m.u||'')),d=await getU(k);
  if(!d||!d.tok||sha(String(m.tok||''))!==d.tok)return send(o,{t:'autherr',m:'',r:1});return login(o,k,d,null,true)}
 if(!o.u)return;
 if(m.t==='spawn'){endLife(o);o.alive=true;o.life=true;o.hp=100;o.k=0;o.x=cl(m.x);o.y=cl(m.y);o.rev=0;o.t0=Date.now();return}
 if(!o.alive)return;
 if(m.t==='pos'){o.x=cl(m.x);o.y=cl(m.y);o.a=+m.a||0;o.w=Math.max(0,Math.min(10,m.w|0));o.c=Math.max(0,Math.min(5,m.c|0))}
 else if(m.t==='heal'){o.hp=Math.min(100,o.hp+Math.max(0,Math.min(100,+m.a||0)))}
 else if(m.t==='search'){const c=CR[m.id|0];if(!c||c.open||Math.hypot(o.x-c.x,o.y-c.y)>90)return;c.open=true;c.rt=180;OPEN.add(c);RARE.delete(c);
  const lb=c.b.lb||0,items=c.rare?[rareItem(),rollItem(c.b.z,lb)]:Math.random()<.35?[rollItem(c.b.z,lb),rollItem(c.b.z,lb)]:[rollItem(c.b.z,lb)];
  for(const it of items)GI.push({id:gid++,x:c.x+(Math.random()-.5)*36,y:c.y+10+Math.random()*20,ttl:30,hold:0,k:it.k,s:it.s,i:it.i})}
 else if(m.t==='pick'){const i=GI.findIndex(g=>g.id===m.id);if(i<0)return;const g=GI[i];if(g.hold===o.id||Math.hypot(o.x-g.x,o.y-g.y)>45)return;GI.splice(i,1);send(o,{t:'got',it:{k:g.k,s:g.s,i:g.i}})}
 else if(m.t==='swap'){const i=GI.findIndex(g=>g.id===m.id);if(i<0||!validItem(m.give))return;const g=GI[i];if(g.hold===o.id||Math.hypot(o.x-g.x,o.y-g.y)>45)return;GI.splice(i,1);GI.push({id:gid++,x:g.x,y:g.y,k:m.give.k,s:m.give.s,i:m.give.i,ttl:30,hold:o.id});send(o,{t:'got',it:{k:g.k,s:g.s,i:g.i},sw:1})}
 else if(m.t==='drop'){if(!validItem(m)||GI.length>400)return;GI.push({id:gid++,x:o.x+Math.cos(o.a)*26,y:o.y+Math.sin(o.a)*26,k:m.k,s:m.s,i:m.i,ttl:30,hold:o.id})}
 else if(m.t==='fire'){const w=WP[m.w|0];if(!w||typeof m.a!=='number')return;const now=Date.now();if(now-o.lf<(w.ramp?w.ramp[1]:w.rate)*700)return;
  o.lf=now;o.f++;o.fa=m.a;o.w=m.w|0;o.rev=1.5;
  if(w.me){for(const z of zs){const a=Math.atan2(z.y-o.y,z.x-o.x),d=Math.hypot(z.x-o.x,z.y-o.y);if(d<w.rg+12*z.rs&&Math.abs(Math.atan2(Math.sin(a-m.a),Math.cos(a-m.a)))<w.arc)hurt(z,w.d,o)}}
  else{noise(o.x,o.y);for(let i=0;i<w.pel;i++){const a=m.a+sprd(w),sp=w.sp||700;bullets.push({x:o.x,y:o.y,x0:o.x,y0:o.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:w.rg/sp,rg:w.rg,fo:w.fo,pi:w.pi,hz:w.pi?[]:null,d:w.d,o})}}}
}

function tick(){const dt=.05,al=[...P.values()].filter(o=>o.alive);
 fbud=2;if(FC.size>50){const n=Date.now();for(const[k,f]of FC)if(n-f.t>1500)FC.delete(k)}
 for(const c of OPEN){c.rt-=dt;if(c.rt<=0)rollRare(c)}
 for(let i=GI.length-1;i>=0;i--){const g=GI[i];g.ttl-=dt;if(g.hold){const h=P.get(g.hold);if(!h||Math.hypot(h.x-g.x,h.y-g.y)>40)g.hold=0}if(g.ttl<=0)GI.splice(i,1)}
 for(const o of al){o.rev-=dt;o.hid=o.rev<=0&&trees.some(t=>Math.hypot(o.x-t[0],o.y-t[1])<t[2]-6)}
 for(let s=0;s<3;s++)for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];b.x+=b.vx*dt/3;b.y+=b.vy*dt/3;b.l-=dt/3;let dead=b.l<=0||inWall(b.x,b.y);
  if(!dead)for(const z of zs)if(Math.hypot(z.x-b.x,z.y-b.y)<14*z.rs&&!(b.hz&&b.hz.includes(z))){hurt(z,b.fo?b.d*(1.7-1.15*Math.min(1,Math.hypot(b.x-b.x0,b.y-b.y0)/b.rg)):b.d,b.o);if(b.pi&&Math.hypot(b.x-b.x0,b.y-b.y0)<b.pi)b.hz.push(z);else dead=true;break}
  if(dead)bullets.splice(i,1)}
 spT+=dt;
 if(spT>.5){spT=0;for(const o of al){if(zs.length>=160)break;let n=0;for(const z of zs)if(Math.hypot(z.x-o.x,z.y-o.y)<850)n++;
  if(n<10+3*zoneAt(o.x,o.y)){const a=Math.random()*TAU,d=620+Math.random()*180,x=o.x+Math.cos(a)*d,y=o.y+Math.sin(a)*d;
   if(x>20&&y>20&&x<WS-20&&y<WS-20&&!inWall(x,y,16)){const k=mkZ(zoneAt(x,y));zs.push({id:zid++,x,y,hp:k.hp,mh:k.hp,sp:k.sp,dm:k.dm,kd:k.kd,rs:k.rs,cd:0,a:0,ag:0,wt:0,wa:0,lost:0,lx:0,ly:0,lt:0,los:null,hit:0,pt:0,dir:true})}}}}
 for(let i=zs.length-1;i>=0;i--){const z=zs[i];
  if(z.dead){zs.splice(i,1);continue}
  let tp=null,td=1e9;for(const o of al){const d=Math.hypot(o.x-z.x,o.y-z.y);if(d<td){td=d;tp=o}}
  if(!tp||td>1100){zs.splice(i,1);continue}
  z.lt-=dt;z.hit-=dt;
  if(z.lt<=0){z.lt=.2;z.los=null;for(const o of al){if(Math.hypot(o.x-z.x,o.y-z.y)<(o.hid?45:140)&&los(z.x,z.y,o.x,o.y)){z.los=o;break}}}
  if(z.los&&!z.los.alive)z.los=null;
  if(z.los){z.ag=1;z.lost=0;z.lx=z.los.x;z.ly=z.los.y}else if(z.ag){z.lost+=dt;if(z.lost>4||td>520)z.ag=0}
  if(z.ag){const tx=z.los?z.los.x:z.lx,ty=z.los?z.los.y:z.ly,dd=Math.hypot(tx-z.x,ty-z.y);z.pt-=dt;if(z.pt<=0){z.pt=.25;z.dir=dd<70||los(z.x,z.y,tx,ty)}
   let ax=tx-z.x,ay=ty-z.y;if(!z.dir&&dd<700){const s=stepDir(z,tx,ty);if(s){ax=s[0];ay=s[1]}}
   z.a=Math.atan2(ay,ax);z.x+=Math.cos(z.a)*z.sp*dt;z.y+=Math.sin(z.a)*z.sp*dt}
  else{z.wt-=dt;if(z.wt<=0){z.wt=2+Math.random()*3;z.wa=Math.random()*TAU}z.a=z.wa;z.x+=Math.cos(z.wa)*14*dt;z.y+=Math.sin(z.wa)*14*dt}
  push(z,12*z.rs);
  z.cd-=dt;if(td<26*z.rs&&z.cd<=0){z.cd=.8;tp.hp-=z.dm;if(tp.hp<=0)die(tp)}}
 const pl=al.map(o=>[o.id,o.name,Math.round(o.x),Math.round(o.y),+o.a.toFixed(2),o.w,o.c,o.f,+(o.fa||0).toFixed(2),Math.round(o.hp)]);
 for(const o of P.values()){if(!o.u)continue;const z=[],gi=[],cs=[];
  if(o.alive){for(const g of GI)if(Math.abs(g.x-o.x)<750&&Math.abs(g.y-o.y)<750)gi.push([g.id,Math.round(g.x),Math.round(g.y),g.k==='w'?0:1,g.s,g.i||0,g.hold===o.id?1:0,Math.ceil(g.ttl)]);
   for(const c of OPEN)if(Math.abs(c.x-o.x)<850&&Math.abs(c.y-o.y)<850)cs.push([c.id,1]);for(const c of RARE)if(Math.abs(c.x-o.x)<850&&Math.abs(c.y-o.y)<850)cs.push([c.id,2])}
  if(o.alive)for(const q of zs)if(Math.abs(q.x-o.x)<850&&Math.abs(q.y-o.y)<850)z.push([q.id,Math.round(q.x),Math.round(q.y),Math.round(q.a*100),Math.round(q.hp),Math.round(q.mh),q.kd,Math.round(q.rs*10),q.ag?1:0,q.hit>0?1:0]);
  send(o,{t:'s',i:o.id,me:{hp:Math.round(o.hp),k:o.k},p:pl,z,gi,c:cs})}}

const server=http.createServer((req,res)=>{
 if(req.url==='/'||req.url.startsWith('/?')||req.url==='/index.html'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(path.join(__dirname,'index.html')))}
 else{res.writeHead(404);res.end('Not found')}});
const wss=new WebSocketServer({server});
wss.on('connection',ws=>{const o={ws,id:nid++,u:null,alive:false,life:false,x:0,y:0,a:0,w:0,c:0,f:0,fa:0,hp:100,k:0,hid:false,rev:0,lf:0,t0:0};P.set(o.id,o);
 ws.on('message',async raw=>{let m;try{m=JSON.parse(raw)}catch(e){return}try{await handle(o,m)}catch(e){console.error(e)}});
 ws.on('close',()=>{endLife(o);P.delete(o.id)});ws.on('error',()=>{})});
setInterval(tick,50);
initDB().then(()=>server.listen(PORT,()=>console.log('Ashfall server on port '+PORT))).catch(e=>{console.error(e);process.exit(1)});
