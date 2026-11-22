// Ashfall game server: accounts, shared zombies, multiplayer.
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {WebSocketServer}=require('ws');
const WS=6400,TAU=Math.PI*2,PORT=process.env.PORT||3000;
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const zoneAt=(x,y)=>{const d=Math.hypot(x-WS/2,y-WS/2)/(WS/2);return d<.3?3:d<.65?2:1};
const ZN=['','Outskirts','Midlands','The Core'],RF=['#7a5c4a','#5f6b73','#6b5d78','#8a7a55','#4f6a5a'];
const WP=[{nm:'Fists',d:10,rate:.5,pel:1,spr:0,rg:34},{nm:'Pistol',d:22,rate:.4,pel:1,spr:.04,rg:480},{nm:'SMG',d:13,rate:.11,pel:1,spr:.14,rg:420},{nm:'Shotgun',d:11,rate:.75,pel:6,spr:.4,rg:300},{nm:'Rifle',d:42,rate:.3,pel:1,spr:.02,rg:640},{nm:'Plasma gun',d:28,rate:.07,pel:1,spr:.06,rg:560}];
const HL=['','Bandage','Painkillers','Medkit','Trauma kit','Surgery kit'],WT=[0,[60,30,9,1,0],[22,38,26,12,2],[4,16,32,32,16]];
const bl=[],walls=[],trees=[],R0=rng(7);
for(let i=0;i<24;i++)for(let j=0;j<24;j++){if(R0()>.34)continue;
 const ty=R0(),tp=ty<.4?0:ty<.65?1:ty<.85?2:3,w=[125+R0()*30,190+R0()*10,160+R0()*25,105+R0()*15][tp]|0,h=[100+R0()*20,140+R0()*10,110+R0()*15,100+R0()*10][tp]|0,x=i*266+133-w/2+(R0()-.5)*40,y=j*266+133-h/2+(R0()-.5)*40,t=10,g=48,ws=[
 {x,y,w,h:t},{x,y,w:t,h},{x:x+w-t,y,w:t,h},{x,y:y+h-t,w:(w-g)/2,h:t},{x:x+(w+g)/2,y:y+h-t,w:(w-g)/2,h:t}];
 ws.forEach(q=>walls.push(q));
 bl.push({x,y,w,h,z:zoneAt(x+w/2,y+h/2),c:RF[Math.floor(R0()*5)],t:tp,cr:(tp===1?[.22,.5,.78]:[.3,.7]).map(f=>({x:x+w*f,y:y+h*.42,t:0}))})}
for(let i=0;i<700;i++){const x=R0()*WS,y=R0()*WS,r=22+R0()*10;if(bl.some(b=>x>b.x-r-12&&x<b.x+b.w+r+12&&y>b.y-r-12&&y<b.y+b.h+r+12))continue;trees.push([x,y,r])}
function push(o,r){for(const q of walls){if(o.x<q.x-r||o.x>q.x+q.w+r||o.y<q.y-r||o.y>q.y+q.h+r)continue;const nx=Math.max(q.x,Math.min(o.x,q.x+q.w)),ny=Math.max(q.y,Math.min(o.y,q.y+q.h)),dx=o.x-nx,dy=o.y-ny,d2=dx*dx+dy*dy;
 if(d2<r*r){if(d2>1e-4){const d=Math.sqrt(d2),f=(r-d)/d;o.x+=dx*f;o.y+=dy*f}else o.y-=r}}
 o.x=Math.max(r,Math.min(WS-r,o.x));o.y=Math.max(r,Math.min(WS-r,o.y))}
const inWall=(x,y,m=0)=>walls.some(q=>x>q.x-m&&x<q.x+q.w+m&&y>q.y-m&&y<q.y+q.h+m);
const inside=(o,b)=>o.x>b.x+10&&o.x<b.x+b.w-10&&o.y>b.y+10&&o.y<b.y+b.h-10;

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
 if(m.t==='pos'){o.x=cl(m.x);o.y=cl(m.y);o.a=+m.a||0;o.w=Math.max(0,Math.min(5,m.w|0));o.c=Math.max(0,Math.min(5,m.c|0))}
 else if(m.t==='heal'){o.hp=Math.min(100,o.hp+Math.max(0,Math.min(100,+m.a||0)))}
 else if(m.t==='fire'){const w=WP[m.w|0];if(!w||typeof m.a!=='number')return;const now=Date.now();if(now-o.lf<w.rate*700)return;
  o.lf=now;o.f++;o.fa=m.a;o.w=m.w|0;o.rev=1.5;
  if(!o.w){for(const z of zs){const a=Math.atan2(z.y-o.y,z.x-o.x),d=Math.hypot(z.x-o.x,z.y-o.y);if(d<34+12*z.rs&&Math.abs(Math.atan2(Math.sin(a-m.a),Math.cos(a-m.a)))<.9)hurt(z,w.d,o)}}
  else{noise(o.x,o.y);for(let i=0;i<w.pel;i++){const a=m.a+(Math.random()-.5)*w.spr*2;bullets.push({x:o.x,y:o.y,vx:Math.cos(a)*700,vy:Math.sin(a)*700,l:w.rg/700,d:w.d,o})}}}
}

function tick(){const dt=.05,al=[...P.values()].filter(o=>o.alive);
 for(const o of al){o.rev-=dt;o.hid=o.rev<=0&&trees.some(t=>Math.hypot(o.x-t[0],o.y-t[1])<t[2]-6)}
 for(let s=0;s<3;s++)for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];b.x+=b.vx*dt/3;b.y+=b.vy*dt/3;b.l-=dt/3;let dead=b.l<=0||inWall(b.x,b.y);
  if(!dead)for(const z of zs)if(Math.hypot(z.x-b.x,z.y-b.y)<14*z.rs){hurt(z,b.d,b.o);dead=true;break}
  if(dead)bullets.splice(i,1)}
 spT+=dt;
 if(spT>.5){spT=0;for(const o of al){if(zs.length>=160)break;let n=0;for(const z of zs)if(Math.hypot(z.x-o.x,z.y-o.y)<700)n++;
  if(n<10+3*zoneAt(o.x,o.y)){const a=Math.random()*TAU,d=380+Math.random()*180,x=o.x+Math.cos(a)*d,y=o.y+Math.sin(a)*d;
   if(x>20&&y>20&&x<WS-20&&y<WS-20&&!inWall(x,y,16)){const k=mkZ(zoneAt(x,y));zs.push({id:zid++,x,y,hp:k.hp,mh:k.hp,sp:k.sp,dm:k.dm,kd:k.kd,rs:k.rs,cd:0,a:0,ag:0,wt:0,wa:0,lost:0,lx:0,ly:0,lt:0,los:null,hit:0})}}}}
 for(let i=zs.length-1;i>=0;i--){const z=zs[i];
  if(z.dead){zs.splice(i,1);continue}
  let tp=null,td=1e9;for(const o of al){const d=Math.hypot(o.x-z.x,o.y-z.y);if(d<td){td=d;tp=o}}
  if(!tp||td>900){zs.splice(i,1);continue}
  z.lt-=dt;z.hit-=dt;
  if(z.lt<=0){z.lt=.2;z.los=null;for(const o of al){if(Math.hypot(o.x-z.x,o.y-z.y)<(o.hid?45:140)&&los(z.x,z.y,o.x,o.y)){z.los=o;break}}}
  if(z.los&&!z.los.alive)z.los=null;
  if(z.los){z.ag=1;z.lost=0;z.lx=z.los.x;z.ly=z.los.y}else if(z.ag){z.lost+=dt;if(z.lost>4||td>520)z.ag=0}
  if(z.ag){const tx=z.los?z.los.x:z.lx,ty=z.los?z.los.y:z.ly;z.a=Math.atan2(ty-z.y,tx-z.x);z.x+=Math.cos(z.a)*z.sp*dt;z.y+=Math.sin(z.a)*z.sp*dt}
  else{z.wt-=dt;if(z.wt<=0){z.wt=2+Math.random()*3;z.wa=Math.random()*TAU}z.a=z.wa;z.x+=Math.cos(z.wa)*14*dt;z.y+=Math.sin(z.wa)*14*dt}
  push(z,12*z.rs);
  z.cd-=dt;if(td<26*z.rs&&z.cd<=0){z.cd=.8;tp.hp-=z.dm;if(tp.hp<=0)die(tp)}}
 const pl=al.map(o=>[o.id,o.name,Math.round(o.x),Math.round(o.y),+o.a.toFixed(2),o.w,o.c,o.f,+(o.fa||0).toFixed(2)]);
 for(const o of P.values()){if(!o.u)continue;const z=[];
  if(o.alive)for(const q of zs)if(Math.abs(q.x-o.x)<650&&Math.abs(q.y-o.y)<650)z.push([q.id,Math.round(q.x),Math.round(q.y),Math.round(q.a*100),Math.round(q.hp),Math.round(q.mh),q.kd,Math.round(q.rs*10),q.ag?1:0,q.hit>0?1:0]);
  send(o,{t:'s',i:o.id,me:{hp:Math.round(o.hp),k:o.k},p:pl,z})}}

const server=http.createServer((req,res)=>{
 if(req.url==='/'||req.url.startsWith('/?')||req.url==='/index.html'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(path.join(__dirname,'index.html')))}
 else{res.writeHead(404);res.end('Not found')}});
const wss=new WebSocketServer({server});
wss.on('connection',ws=>{const o={ws,id:nid++,u:null,alive:false,life:false,x:0,y:0,a:0,w:0,c:0,f:0,fa:0,hp:100,k:0,hid:false,rev:0,lf:0,t0:0};P.set(o.id,o);
 ws.on('message',async raw=>{let m;try{m=JSON.parse(raw)}catch(e){return}try{await handle(o,m)}catch(e){console.error(e)}});
 ws.on('close',()=>{endLife(o);P.delete(o.id)});ws.on('error',()=>{})});
setInterval(tick,50);
initDB().then(()=>server.listen(PORT,()=>console.log('Ashfall server on port '+PORT))).catch(e=>{console.error(e);process.exit(1)});
