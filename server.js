// Ashfall game server: shared zombies, loot and multiplayer. No accounts: players just pick a name.
const http=require('http'),fs=require('fs'),path=require('path');
const {WebSocketServer}=require('ws');
const WS=6400,TAU=Math.PI*2,PORT=process.env.PORT||3000;
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* four regions: 1 grasslands (top left, spawn), 2 desert (top right), 3 dense forest (bottom left), 4 snow land (bottom right) */
const zoneAt=(x,y)=>x<WS/2?(y<WS/2?1:3):(y<WS/2?2:4);
const ZN=['','Outskirts','Midlands','The Core'],RF=['#7a5c4a','#5f6b73','#6b5d78','#8a7a55','#4f6a5a'];
const WP=[{nm:'Fists',st:0,me:1,d:10,rate:.5,rg:44,arc:.9},{nm:'Pistol',st:1,d:22,rate:.4,pel:1,spr:.04,rg:480},{nm:'SMG',st:2,d:13,rate:.11,pel:1,spr:.14,rg:420},{nm:'Shotgun',st:3,d:16,rate:.75,pel:8,spr:.09,gs:1,fo:1,pi:50,rg:300},{nm:'Rifle',st:4,d:42,rate:.36,pel:1,spr:.02,rg:640,sp:1250},{nm:'Plasma gun',st:5,d:28,rate:.07,pel:1,spr:.06,rg:560},{nm:'Crowbar',st:1,me:1,d:22,rate:.55,rg:58,arc:1},{nm:'Sword',st:2,me:1,d:34,rate:.45,rg:80,arc:1.4},{nm:'SCAR',st:3,d:21,rate:.14,pel:1,spr:.05,rg:520,sp:900},{nm:'Handcannon',st:4,d:90,rate:.75,pel:1,spr:.015,fo:1,pn:1,rg:600,sp:1500},{nm:'Minigun',st:5,d:20,rate:.24,ramp:[.24,.04,2.5],pel:1,spr:.13,rg:520,sp:800},{nm:'Fire Axe',st:3,me:1,d:55,rate:.7,rg:76,arc:1.3},{nm:'Katana',st:4,me:1,d:40,rate:.3,rg:94,arc:1.1},{nm:'Chainsaw',st:5,me:1,lo:1,d:14,rate:.07,rg:68,arc:1},{nm:'Revolver',st:1,d:34,rate:.5,pel:1,spr:.03,rg:500,sp:800},{nm:'Carbine',st:2,d:18,rate:.2,pel:1,spr:.04,rg:520,sp:850},{nm:'Crossbow',st:3,d:75,rate:.9,pel:1,spr:.01,pn:2,pf:.7,rg:650,sp:1100},{nm:'Sniper',st:4,d:115,rate:1.05,pel:1,spr:.004,pn:3,rg:1000,sp:3400},{nm:'Laser Cannon',st:5,beam:1,d:55,rate:.55,pel:1,rg:1000},{nm:'MP40',st:4,d:15,rate:.085,pel:1,spr:.06,rg:460,sp:950},{nm:'Wyrmfang',st:6,d:48,rate:.16,pel:3,spr:.07,pn:3,pf:.85,rg:720,sp:1300}];
const WBS=[null,[1,6,14],[2,7,15],[3,8,11,16],[4,9,12,17,19],[5,10,13,18],[20]];
const sprd=w=>{if(w.gs){let u=0;while(!u)u=Math.random();return Math.max(-.3,Math.min(.3,Math.sqrt(-2*Math.log(u))*Math.cos(TAU*Math.random())*w.spr))}return(Math.random()-.5)*w.spr*2};
const HL=['','Bandage','Painkillers','Medkit','Trauma kit','Surgery kit'],WT=[0,[60,30,9,1,0],[22,38,26,12,2],[4,16,32,32,16],[0,6,24,38,32]];
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
/* altar in the far top-right corner of the desert; buildings within 520 px are removed (shared code, keep identical in both files) */
const ALT={x:WS-210,y:210};
{const rb=new Set();for(let i=bl.length-1;i>=0;i--){const b=bl[i],nx=Math.max(b.x,Math.min(ALT.x,b.x+b.w)),ny=Math.max(b.y,Math.min(ALT.y,b.y+b.h));if(Math.hypot(nx-ALT.x,ny-ALT.y)<520){b.ws.forEach(q=>rb.add(q));bl.splice(i,1)}}for(let i=walls.length-1;i>=0;i--)if(rb.has(walls[i]))walls.splice(i,1)}
let _n=0;const CR=[];bl.forEach(b=>b.cr.forEach(q=>{q.id=_n++;q.b=b;CR.push(q)}));
for(let i=0;i<700;i++){const x=R0()*WS,y=R0()*WS,r=22+R0()*10;if(bl.some(b=>x>b.x-r-12&&x<b.x+b.w+r+12&&y>b.y-r-12&&y<b.y+b.h+r+12))continue;trees.push([x,y,r])}
for(let i=0;i<550;i++){const x=R0()*WS/2,y=WS/2+R0()*WS/2,r=22+R0()*10;if(bl.some(b=>x>b.x-r-12&&x<b.x+b.w+r+12&&y>b.y-r-12&&y<b.y+b.h+r+12))continue;trees.push([x,y,r])}
function push(o,r){for(const q of near(o.x,o.y)){if(o.x<q.x-r||o.x>q.x+q.w+r||o.y<q.y-r||o.y>q.y+q.h+r)continue;const nx=Math.max(q.x,Math.min(o.x,q.x+q.w)),ny=Math.max(q.y,Math.min(o.y,q.y+q.h)),dx=o.x-nx,dy=o.y-ny,d2=dx*dx+dy*dy;
 if(d2<r*r){if(d2>1e-4){const d=Math.sqrt(d2),f=(r-d)/d;o.x+=dx*f;o.y+=dy*f}else o.y-=r}}
 o.x=Math.max(r,Math.min(WS-r,o.x));o.y=Math.max(r,Math.min(WS-r,o.y))}
const inWall=(x,y,m=0)=>near(x,y).some(q=>x>q.x-m&&x<q.x+q.w+m&&y>q.y-m&&y<q.y+q.h+m);
const inside=(o,b)=>b.cells?b.cs.has(Math.floor((o.y-b.y)/b.S)*20+Math.floor((o.x-b.x)/b.S)):(o.x>b.x+10&&o.x<b.x+b.w-10&&o.y>b.y+10&&o.y<b.y+b.h-10);

/* wall lookup grid: only check the walls in the cell, much cheaper than all of them */
const GRID=new Map(),NONE=[],GK=(cx,cy)=>(cx+10)*4096+(cy+10);
for(let i=trees.length-1;i>=0;i--)if(Math.hypot(trees[i][0]-ALT.x,trees[i][1]-ALT.y)<115)trees.splice(i,1);
const BG=new Map();for(const t of trees){const k=(t[0]>>7)*100+(t[1]>>7);let a=BG.get(k);if(!a){a=[];BG.set(k,a)}a.push(t)}
const bushBlock=(x1,y1,x2,y2)=>{const d=Math.hypot(x2-x1,y2-y1),n=Math.ceil(d/12);for(let i=1;i<n;i++){const x=x1+(x2-x1)*i/n,y=y1+(y2-y1)*i/n,gx=x>>7,gy=y>>7;for(let a=gx-1;a<=gx+1;a++)for(let b=gy-1;b<=gy+1;b++){const l=BG.get(a*100+b);if(!l)continue;for(const t of l){const dx=x-t[0],dy=y-t[1],r=t[2]*.85;if(dx*dx+dy*dy<r*r&&Math.hypot(x1-t[0],y1-t[1])>t[2]&&Math.hypot(x2-t[0],y2-t[1])>t[2])return true}}}return false};
const TK=[];{const RT=rng(13);for(let i=0;i<1400&&TK.length<260;i++){const x=70+RT()*(WS/2-140),y=WS/2+70+RT()*(WS/2-140);if(bl.some(b=>x>b.x-45&&x<b.x+b.w+45&&y>b.y-45&&y<b.y+b.h+45))continue;if(TK.some(t=>Math.hypot(t.cx-x,t.cy-y)<60))continue;TK.push({x:x-12,y:y-12,w:24,h:24,tk:1,cx:x,cy:y})}}
for(const q of walls.concat(TK))for(let cx=Math.floor((q.x-24)/128);cx<=Math.floor((q.x+q.w+24)/128);cx++)for(let cy=Math.floor((q.y-24)/128);cy<=Math.floor((q.y+q.h+24)/128);cy++){const k=GK(cx,cy);if(!GRID.has(k))GRID.set(k,[]);GRID.get(k).push(q)}
function near(x,y){return GRID.get(GK(Math.floor(x/128),Math.floor(y/128)))||NONE}
/* breakable walls: every wall has an id (same order on client and server) and can be switched off by explosions */
walls.forEach((q,i)=>{q.id=i});const DW=new Map();
function wallSet(q,on){for(let cx=Math.floor((q.x-24)/128);cx<=Math.floor((q.x+q.w+24)/128);cx++)for(let cy=Math.floor((q.y-24)/128);cy<=Math.floor((q.y+q.h+24)/128);cy++){const k=GK(cx,cy);let a=GRID.get(k);
 if(on){if(!a)GRID.set(k,a=[]);if(!a.includes(q))a.push(q)}else if(a){const i=a.indexOf(q);if(i>=0)a.splice(i,1)}}q.d=on?0:1}
/* loot: crates and ground items live on the server so everyone sees the same ones */
const GI=[],OPEN=new Set(),RARE=new Set();let gid=1;
function rollRare(c){c.open=false;OPEN.delete(c);const z=c.b.z;c.rare=Math.random()<(z===4?.15:z===3?.10:z===2?.05:.01);if(c.rare)RARE.add(c);else RARE.delete(c)}
for(const c of CR)rollRare(c);
function rollItem(z,lb){let r=Math.random()*100,s=5;const wt=WT[z];for(let i=0;i<5;i++){if(r<wt[i]){s=i+1;break}r-=wt[i]}if(s<5&&Math.random()<lb)s++;
 if(s===3&&Math.random()<.22)return{k:'g',s:3,i:0};
 if(s===4&&Math.random()<.25)return{k:'p',s:4,i:Math.random()<.5?0:1};
 if(s===5&&Math.random()<.2)return{k:'g',s:5,i:1};
 let k=Math.random()<.75?'w':'h';if(k==='h'&&(s===1||s===4))k='w';return k==='w'?{k,s,i:WBS[s][Math.random()*WBS[s].length|0]}:{k,s}}
function rareItem(){const s=Math.random()<.65?4:5;return{k:'w',s,i:WBS[s][Math.random()*WBS[s].length|0]}}
const kc=k=>k==='w'?0:k==='g'?2:k==='p'?3:1;
const scap=m=>m.k==='g'?(m.i===1?1:3):m.k==='p'?2:m.k==='h'?(m.s===2?4:m.s===3?3:2):1;
const snn=m=>Math.max(1,Math.min(scap(m),(m.n|0)||1));
const validItem=m=>m&&((m.k==='g'&&((m.i===0&&m.s===3)||(m.i===1&&m.s===5)))||(m.k==='p'&&m.s===4&&(m.i===0||m.i===1))||(m.k==='w'&&m.s>=1&&m.s<=6&&WBS[m.s].includes(m.i))||(m.k==='h'&&(m.s===2||m.s===3||m.s===5)));
/* zombie pathfinding: a blocked-cell grid plus a breadth-first distance field toward the target */
const CS=16,NC=400,FR=38,FW=77,DX=[1,-1,0,0,1,1,-1,-1],DY=[0,0,1,-1,1,-1,1,-1],BLK=new Uint8Array(NC*NC),FC=new Map();let fbud=0;
for(const q of walls.concat(TK)){const x0=Math.max(0,Math.floor((q.x-9)/CS)),x1=Math.min(NC-1,Math.floor((q.x+q.w+9)/CS)),y0=Math.max(0,Math.floor((q.y-9)/CS)),y1=Math.min(NC-1,Math.floor((q.y+q.h+9)/CS));for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++)BLK[cy*NC+cx]=1}
function reblk(q){const x0=Math.max(0,Math.floor((q.x-9)/CS)),x1=Math.min(NC-1,Math.floor((q.x+q.w+9)/CS)),y0=Math.max(0,Math.floor((q.y-9)/CS)),y1=Math.min(NC-1,Math.floor((q.y+q.h+9)/CS));
 for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++)BLK[cy*NC+cx]=0;const seen=new Set();
 for(let gx=Math.floor((q.x-33)/128);gx<=Math.floor((q.x+q.w+33)/128);gx++)for(let gy=Math.floor((q.y-33)/128);gy<=Math.floor((q.y+q.h+33)/128);gy++)for(const w of GRID.get(GK(gx,gy))||NONE){if(seen.has(w))continue;seen.add(w);
  const a0=Math.max(x0,Math.floor((w.x-9)/CS)),a1=Math.min(x1,Math.floor((w.x+w.w+9)/CS)),b0=Math.max(y0,Math.floor((w.y-9)/CS)),b1=Math.min(y1,Math.floor((w.y+w.h+9)/CS));
  for(let cy=b0;cy<=b1;cy++)for(let cx=a0;cx<=a1;cx++)BLK[cy*NC+cx]=1}}
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
function mkZ(z){const r=Math.random(),bg=.06+z*.06,ex=.03+z*.025,sc=.03+z*.02,k=r<bg?2:r<bg+ex?4:r<bg+ex+sc?3:r<bg+ex+sc+.22?1:0,hv=.8+Math.random()*.45,b=28+z*24,s=(46+z*12+Math.random()*14)*1.15,d=6+z*3;
 if(k===1)return{kd:1,rs:1,hp:b*.7*hv,sp:s*1.5,dm:d};
 if(k===2)return{kd:2,rs:1.3,hp:b*2*hv,sp:s,dm:d*1.3};
 if(k===3)return{kd:3,rs:1,hp:b*.65*hv,sp:s*.85,dm:d*.6,sd:7+z*4};
 if(k===4)return{kd:4,rs:1.1,hp:b*.8*hv,sp:s*1.15,dm:0};
 if(z===3&&Math.random()<.13)return{kd:7,rs:.9,hp:b*hv,sp:s,dm:d};
 if(z===2)return{kd:5,rs:1,hp:b*hv,sp:s,dm:d};
 if(z===4)return{kd:6,rs:1,hp:b*hv,sp:s*1.15,dm:d};
 return{kd:0,rs:1,hp:b*hv,sp:s,dm:d}}
const los=(x1,y1,x2,y2)=>{const d=Math.hypot(x2-x1,y2-y1),n=Math.ceil(d/8);for(let i=1;i<n;i++){const t=i/n;if(inWall(x1+(x2-x1)*t,y1+(y2-y1)*t))return false}return true};

const cl=v=>Math.max(12,Math.min(WS-12,+v||0));
const P=new Map();let nid=1,zid=1,zs=[],bullets=[],spT=0,spits=[],sid=1,evs=[],rst=1,nades=[],nid2=1;
const send=(o,m)=>{if(o.ws.readyState===1)o.ws.send(JSON.stringify(m))};
function endLife(o){o.life=false}
function die(o){o.alive=false;o.hp=0;endLife(o);send(o,{t:'dead'})}
function hurt(z,d,o){if(z.bs){wormHurt(z,d,o);return}z.hp-=d;z.hit=.1;z.ag=1;if(z.kd===7)z.wk=1;z.lost=0;z.lx=o.x;z.ly=o.y;if(z.hp<=0&&!z.dead){z.dead=1;o.k++}}
const bcast=m=>{for(const o of P.values())if(o.u)send(o,m)};
const EXR=125,EXW=100;
function explode(z){const x=z.x,y=z.y;
 for(const o of P.values()){if(!o.alive)continue;const d=Math.hypot(o.x-x,o.y-y);if(d<EXR&&(d<45||los(x,y,o.x,o.y))){o.hp-=Math.round(65*(1-.75*d/EXR));if(o.hp<=0)die(o)}}
 for(const q of zs){if(q===z||q.dead)continue;const d=Math.hypot(q.x-x,q.y-y);if(d<EXR){q.hp-=Math.round(70*(1-.6*d/EXR));q.hit=.1;if(q.hp<=0)q.dead=1;else if(q.kd===4&&q.fz<=0)q.fz=.4}}
 const seen=new Set(),gone=[];
 for(let gx=Math.floor((x-EXW-24)/128);gx<=Math.floor((x+EXW+24)/128);gx++)for(let gy=Math.floor((y-EXW-24)/128);gy<=Math.floor((y+EXW+24)/128);gy++)for(const q of GRID.get(GK(gx,gy))||NONE){if(seen.has(q))continue;seen.add(q);if(q.tk)continue;
  const nx=Math.max(q.x,Math.min(x,q.x+q.w)),ny=Math.max(q.y,Math.min(y,q.y+q.h));if(Math.hypot(nx-x,ny-y)<EXW)gone.push(q)}
 const now=Date.now();for(const q of gone){wallSet(q,false);DW.set(q.id,now)}for(const q of gone)reblk(q);
 if(gone.length){FC.clear();bcast({t:'wl',d:gone.map(q=>q.id)})}
 evs.push([Math.round(x),Math.round(y)]);noise(x,y)}
const NR=125;
function blast(x,y,own){WD=++wdc;
 for(const o of P.values()){if(!o.alive)continue;const d=Math.hypot(o.x-x,o.y-y);if(d<NR&&(d<45||los(x,y,o.x,o.y))){o.hp-=Math.round(90*(1-.7*d/NR));if(o.hp<=0)die(o)}}
 for(const q of zs){if(q.dead)continue;const d=Math.hypot(q.x-x,q.y-y);if(d<NR&&(d<45||los(x,y,q.x,q.y))){hurt(q,Math.round(170*(1-.5*d/NR)),own);if(q.hp>0&&q.kd===4&&q.fz<=0)q.fz=.4}}WD=0;
 evs.push([Math.round(x),Math.round(y)]);noise(x,y)}
const MR=150;
function mineBlast(x,y,own){WD=++wdc;for(const q of zs){if(q.dead)continue;const d=Math.hypot(q.x-x,q.y-y);if(d<MR&&(d<45||los(x,y,q.x,q.y))){hurt(q,Math.round(200*(1-.5*d/MR)),own);if(q.hp>0&&q.kd===4&&q.fz<=0)q.fz=.4}}WD=0;
 evs.push([Math.round(x),Math.round(y),MR]);noise(x,y)}
function noise(x,y){for(const z of zs)if(Math.hypot(z.x-x,z.y-y)<340&&!z.los&&!(z.kd===7&&!z.wk)){z.ag=1;z.lost=-2;z.lx=x;z.ly=y}}

async function handle(o,m){
 if(m.t==='join'){o.name=String(m.name||'').replace(/[<>&"]/g,'').trim().slice(0,14)||'Survivor';o.skin=Math.max(0,Math.min(24,m.skin|0));o.u=true;if(DW.size)send(o,{t:'wl',d:[...DW.keys()]});return}
 if(!o.u)return;
 if(m.t==='spawn'){endLife(o);o.alive=true;o.life=true;o.hp=100;o.k=0;o.x=cl(m.x);o.y=cl(m.y);o.rev=0;o.rage=0;o.weak=0;o.t0=Date.now();return}
 if(!o.alive)return;
 if(m.t==='pos'){o.x=cl(m.x);o.y=cl(m.y);o.a=+m.a||0;o.w=Math.max(0,Math.min(20,m.w|0));o.c=o.skin|0}
 else if(m.t==='buff'){if(m.k==='rage')o.rage=Date.now()+30000}
 else if(m.t==='nade'){if(!o.alive||typeof m.a!=='number'||Date.now()-(o.ln||0)<300)return;o.ln=Date.now();let x=o.x,y=o.y;if(typeof m.x==='number'&&typeof m.y==='number'&&Math.hypot(m.x-o.x,m.y-o.y)<120){x=cl(m.x);y=cl(m.y);o.x=x;o.y=y}
  const ty=m.ty===1?1:0;if(ty){const mn=nades.filter(g=>g.ty===1&&g.oid===o.id);if(mn.length>=4)nades.splice(nades.indexOf(mn[0]),1)}
  nades.push({id:nid2++,cid:m.cid|0,oid:o.id,ty,x,y,vx:Math.cos(m.a)*(ty?260:300),vy:Math.sin(m.a)*(ty?260:300),tl:ty?.34:.49,fz:1,ttl:180})}
 else if(m.t==='heal'){o.hp=Math.min(100,o.hp+Math.max(0,Math.min(100,+m.a||0)))}
 else if(m.t==='search'){const c=CR[m.id|0];if(!c||c.open||Math.hypot(o.x-c.x,o.y-c.y)>90)return;c.open=true;c.rt=180;OPEN.add(c);RARE.delete(c);
  const lb=c.b.lb||0,items=c.rare?[rareItem(),rollItem(c.b.z,lb)]:Math.random()<.35?[rollItem(c.b.z,lb),rollItem(c.b.z,lb)]:[rollItem(c.b.z,lb)];
  const ng=[];for(const it of items){const g={id:gid++,x:c.x+(Math.random()-.5)*36,y:c.y+10+Math.random()*20,ttl:30,hold:0,k:it.k,s:it.s,i:it.i};GI.push(g);ng.push([g.id,Math.round(g.x),Math.round(g.y),kc(g.k),g.s,g.i||0,0,30])}
  send(o,{t:'gi',g:ng})}
 else if(m.t==='pick'){const i=GI.findIndex(g=>g.id===m.id);if(i<0)return;const g=GI[i];if(g.hold===o.id||Math.hypot(o.x-g.x,o.y-g.y)>45)return;GI.splice(i,1);send(o,{t:'got',it:{k:g.k,s:g.s,i:g.i,n:g.n||1}})}
 else if(m.t==='altar'){if(o.alive&&W.st==='idle'&&!W.dead&&Date.now()>=W.cdUntil&&Math.hypot(o.x-ALT.x,o.y-ALT.y)<130)wormStart()}
 else if(m.t==='swap'){const i=GI.findIndex(g=>g.id===m.id);if(i<0||!validItem(m.give))return;const g=GI[i];if(g.hold===o.id||Math.hypot(o.x-g.x,o.y-g.y)>45)return;GI.splice(i,1);GI.push({id:gid++,x:g.x,y:g.y,k:m.give.k,s:m.give.s,i:m.give.i,n:snn(m.give),ttl:30,hold:o.id});send(o,{t:'got',it:{k:g.k,s:g.s,i:g.i,n:g.n||1},sw:1})}
 else if(m.t==='drop'){if(!validItem(m)||GI.length>400)return;GI.push({id:gid++,x:o.x+Math.cos(o.a)*26,y:o.y+Math.sin(o.a)*26,k:m.k,s:m.s,i:m.i,n:snn(m),ttl:30,hold:o.id})}
 else if(m.t==='fire'){const w=WP[m.w|0];if(!w||typeof m.a!=='number')return;const now=Date.now();if(now-o.lf<(w.ramp?w.ramp[1]:w.rate)*700)return;
  o.lf=now;if(typeof m.x==='number'&&typeof m.y==='number'&&Math.hypot(m.x-o.x,m.y-o.y)<120){o.x=cl(m.x);o.y=cl(m.y)}o.f++;o.fa=m.a;o.w=m.w|0;o.rev=1.5;
  if(w.me){WD=++wdc;for(const z of zs){const a=Math.atan2(z.y-o.y,z.x-o.x),d=Math.hypot(z.x-o.x,z.y-o.y);if(d<w.rg+12*z.rs&&Math.abs(Math.atan2(Math.sin(a-m.a),Math.cos(a-m.a)))<w.arc)hurt(z,w.d*dmx(o),o)}WD=0;if(w.lo)noise(o.x,o.y)}
  else if(w.beam){noise(o.x,o.y);const ca=Math.cos(m.a),sa=Math.sin(m.a);let L=0;while(L<w.rg&&!inWall(o.x+ca*L,o.y+sa*L))L+=8;
   WD=++wdc;for(const z of zs){const dx=z.x-o.x,dy=z.y-o.y,t=dx*ca+dy*sa;if(t<0||t>L+12)continue;if(Math.abs(-dx*sa+dy*ca)<14*z.rs+8)hurt(z,w.d*dmx(o),o)}WD=0}
  else{noise(o.x,o.y);for(let i=0;i<w.pel;i++){const a=m.a+sprd(w),sp=w.sp||700;bullets.push({x:o.x,y:o.y,x0:o.x,y0:o.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:w.rg/sp,rg:w.rg,fo:w.fo,pi:w.pi,pn:w.pn||0,pf:w.pf,hz:(w.pi||w.pn)?[]:null,d:w.d*dmx(o),o})}}}
}

function tick(){const dt=.05,al=[...P.values()].filter(o=>o.alive);
 fbud=2;if(FC.size>50){const n=Date.now();for(const[k,f]of FC)if(n-f.t>1500)FC.delete(k)}
 if(DW.size&&(rst-=dt)<=0){rst=1;const now=Date.now(),r=[];for(const[id,t]of DW)if(now-t>240000){r.push(id);DW.delete(id);const q=walls[id];wallSet(q,true);reblk(q)}if(r.length){FC.clear();bcast({t:'wl',r})}}
 for(const c of OPEN){c.rt-=dt;if(c.rt<=0)rollRare(c)}
 for(let i=GI.length-1;i>=0;i--){const g=GI[i];g.ttl-=dt;if(g.hold){const h=P.get(g.hold);if(!h||Math.hypot(h.x-g.x,h.y-g.y)>40)g.hold=0}if(g.ttl<=0)GI.splice(i,1)}
 for(const o of al){o.rev-=dt;o.hid=o.rev<=0&&trees.some(t=>Math.hypot(o.x-t[0],o.y-t[1])<t[2]-6)}
 for(let s=0;s<8;s++)for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];b.x+=b.vx*dt/8;b.y+=b.vy*dt/8;b.l-=dt/8;let dead=b.l<=0||inWall(b.x,b.y);
  if(!dead)for(const z of zs)if(Math.hypot(z.x-b.x,z.y-b.y)<14*z.rs&&!(b.hz&&b.hz.includes(z))&&!(z.bs&&b.wh)){const dd=Math.hypot(b.x-b.x0,b.y-b.y0);WBK=b;hurt(z,b.fo?b.d*(1.7-1.15*Math.min(1,dd/b.rg)):b.d,b.o);WBK=null;if(b.hz)b.hz.push(z);if(!(b.pi&&dd<b.pi)&&!(b.pn>0&&b.pn--))dead=true;else if(b.pf)b.d*=b.pf;break}
  if(dead)bullets.splice(i,1)}
 for(let i=spits.length-1;i>=0;i--){const q=spits[i];let dead=false;for(let k=0;k<4&&!dead;k++){q.x+=q.vx*dt/4;q.y+=q.vy*dt/4;if(inWall(q.x,q.y)){dead=true;break}for(const o of al){if(o.alive&&Math.hypot(o.x-q.x,o.y-q.y)<16){o.hp-=q.d;if(o.hp<=0)die(o);dead=true;break}}}q.l-=dt;if(dead||q.l<=0)spits.splice(i,1)}
 for(let i=nades.length-1;i>=0;i--){const g=nades[i];if(g.tl>0){g.tl-=dt;const nx=g.x+g.vx*dt,ny=g.y+g.vy*dt;if(inWall(nx,ny,4))g.tl=0;else{g.x=nx;g.y=ny}}else if(g.ty===1){g.ttl-=dt;let hit=false;for(const q of zs)if(!q.dead&&Math.hypot(q.x-g.x,q.y-g.y)<22){hit=true;break}if(hit){mineBlast(g.x,g.y,P.get(g.oid)||{x:g.x,y:g.y,k:0});nades.splice(i,1)}else if(g.ttl<=0)nades.splice(i,1)}else{g.fz-=dt;if(g.fz<=0){blast(g.x,g.y,P.get(g.oid)||{x:g.x,y:g.y,k:0});nades.splice(i,1)}}}
 wormTick(dt);spT+=dt;
 if(spT>.5){spT=0;if(W.st==='idle')for(const o of al){if(zs.length>=160)break;let n=0;for(const z of zs)if(!z.bs&&Math.hypot(z.x-o.x,z.y-o.y)<850)n++;
  if(n<10+3*zoneAt(o.x,o.y)){const a=Math.random()*TAU,d=620+Math.random()*180,x=o.x+Math.cos(a)*d,y=o.y+Math.sin(a)*d;
   if(x>20&&y>20&&x<WS-20&&y<WS-20&&!inWall(x,y,16)){const k=mkZ(zoneAt(x,y));zs.push({id:zid++,x,y,hp:k.hp,mh:k.hp,sp:k.sp,dm:k.dm,sd:k.sd||0,kd:k.kd,rs:k.rs,fz:0,sc:1+Math.random()*1.5,cd:0,a:0,ag:0,wt:0,wa:0,lost:0,lx:0,ly:0,lt:0,los:null,hit:0,pt:0,dir:true})}}}}
 for(let i=zs.length-1;i>=0;i--){const z=zs[i];
  if(z.bs)continue;
  if(z.dead){zs.splice(i,1);continue}
  let tp=null,td=1e9;for(const o of al){const d=Math.hypot(o.x-z.x,o.y-z.y);if(d<td){td=d;tp=o}}
  if(!tp||td>1100){zs.splice(i,1);continue}
  z.lt-=dt;z.hit-=dt;
  if(z.lt<=0){z.lt=.2;z.los=null;for(const o of al){if(Math.hypot(o.x-z.x,o.y-z.y)<(o.hid?55:240)&&los(z.x,z.y,o.x,o.y)&&!bushBlock(z.x,z.y,o.x,o.y)){z.los=o;break}}}
  if(z.los&&!z.los.alive)z.los=null;
  if(z.kd===7&&!z.wk){if(td<100){z.wk=1;z.ag=1}else{z.ag=0;continue}}
  if(z.kd===4){if(z.fz>0){z.fz-=dt;if(td>150)z.fz=0;else if(z.fz<=0){explode(z);zs.splice(i,1);continue}}else if(td<70&&z.los)z.fz=1.2}
  if(z.los){z.ag=1;z.lost=0;z.lx=z.los.x;z.ly=z.los.y}else if(z.ag){z.lost+=dt;if(z.lost>3||td>520)z.ag=0}
  if(z.ag){const tx=z.los?z.los.x:z.lx,ty=z.los?z.los.y:z.ly,dd=Math.hypot(tx-z.x,ty-z.y);z.pt-=dt;if(z.pt<=0){z.pt=.25;z.dir=dd<70||los(z.x,z.y,tx,ty)}
   let ax=tx-z.x,ay=ty-z.y;if(!z.dir&&dd<700){const s=stepDir(z,tx,ty);if(s){ax=s[0];ay=s[1]}}
   z.a=Math.atan2(ay,ax);let mv=1;if(z.kd===4&&z.fz>0)mv=0;else if(z.kd===3&&z.los&&dd<340)mv=dd<190?-.8:0;z.x+=Math.cos(z.a)*z.sp*dt*mv;z.y+=Math.sin(z.a)*z.sp*dt*mv}
  else{z.wt-=dt;if(z.wt<=0){z.wt=2+Math.random()*3;z.wa=Math.random()*TAU}z.a=z.wa;z.x+=Math.cos(z.wa)*14*dt;z.y+=Math.sin(z.wa)*14*dt}
  push(z,12*z.rs);
  if(z.kd===3){z.sc-=dt;if(z.los&&z.sc<=0&&td<420){z.sc=1.6+Math.random()*.6;const a=Math.atan2(z.los.y-z.y,z.los.x-z.x);spits.push({id:sid++,x:z.x+Math.cos(a)*16,y:z.y+Math.sin(a)*16,vx:Math.cos(a)*300,vy:Math.sin(a)*300,l:1.5,d:z.sd})}}
  z.cd-=dt;if(z.dm>0&&td<26*z.rs&&z.cd<=0){z.cd=.8;tp.hp-=z.dm;if(z.kd===5){tp.weak=Date.now()+2000;send(tp,{t:'deb',k:'weak'})}else if(z.kd===6)send(tp,{t:'deb',k:'slow'});if(tp.hp<=0)die(tp)}}
 const pl=al.map(o=>[o.id,o.name,Math.round(o.x),Math.round(o.y),+o.a.toFixed(2),o.w,o.c,o.f,+(o.fa||0).toFixed(2),Math.round(o.hp)]);
 for(const o of P.values()){if(!o.u)continue;const z=[],gi=[],cs=[];
  if(o.alive){for(const g of GI)if(Math.abs(g.x-o.x)<750&&Math.abs(g.y-o.y)<750)gi.push([g.id,Math.round(g.x),Math.round(g.y),kc(g.k),g.s,g.i||0,g.hold===o.id?1:0,Math.ceil(g.ttl),g.n||1]);
   for(const c of OPEN)if(Math.abs(c.x-o.x)<850&&Math.abs(c.y-o.y)<850)cs.push([c.id,1]);for(const c of RARE)if(Math.abs(c.x-o.x)<850&&Math.abs(c.y-o.y)<850)cs.push([c.id,2])}
  if(o.alive)for(const q of zs)if(Math.abs(q.x-o.x)<850&&Math.abs(q.y-o.y)<850)z.push([q.id,Math.round(q.x),Math.round(q.y),Math.round(q.a*100),Math.round(q.hp),Math.round(q.mh),(q.kd===7&&q.wk?8:q.kd),Math.round(q.rs*10),q.ag?1:0,q.hit>0?1:0,Math.round(Math.max(0,q.fz||0)*10)]);
  const sp=[];for(const q of spits)if(Math.abs(q.x-o.x)<850&&Math.abs(q.y-o.y)<850)sp.push([q.id,Math.round(q.x),Math.round(q.y)]);
  const ex=evs.filter(e=>Math.abs(e[0]-o.x)<1300&&Math.abs(e[1]-o.y)<1300);
  const ng=[];for(const g of nades)if(Math.abs(g.x-o.x)<850&&Math.abs(g.y-o.y)<850)ng.push([g.id,Math.round(g.x),Math.round(g.y),g.tl>0?0:1,Math.max(0,Math.round(g.fz*10)),g.cid,g.oid===o.id?1:0,g.ty||0]);
  send(o,{t:'s',i:o.id,me:{hp:Math.round(o.hp),k:o.k},p:pl,z,gi,c:cs,sp,ex,ng,ad:W.dead?1:0,bs:W.st==='idle'?0:[W.st==='sum'?1:2,Math.round(W.hp),W.mh,Math.round(W.hole.x),Math.round(W.hole.y),W.hole.r,+W.hole.a.toFixed(2)]})}evs.length=0}


let WD=0,wdc=0,WBK=null;
const W={st:'idle',hp:0,mh:3000,t:0,el:0,wt:0,hole:{x:0,y:0,r:80,a:0},path:[],hx:0,hy:0,a:0,seg:[],ld:0,vis:0,idle:0,cdUntil:0,dead:0};
const WNB=14,WSP=34,WBR=k=>1.25*(k===0?2:1.8-.7*(k-1)/(WNB-1));
function wormReset(){zs=zs.filter(z=>!z.bs);W.st='idle';W.vis=0;W.seg=[];W.hole.a=0}
function wormStart(){wormReset();W.hp=W.mh=Math.round(3000*(1+.5*(Math.max(1,[...P.values()].filter(o=>o.alive).length)-1)));W.st='sum';W.t=3;
 for(let k=WNB;k>=0;k--){const z={id:zid++,x:-9999,y:-9999,hp:500,mh:500,sp:0,dm:0,sd:0,kd:k?10:9,rs:WBR(k),fz:0,sc:1,cd:0,a:0,ag:0,wt:0,wa:0,lost:0,lx:0,ly:0,lt:0,los:null,hit:0,pt:0,dir:true,bs:1};zs.push(z);W.seg[k]=z}
 bcast({t:'bm',k:'spawn'})}
function wormHole(first){const al=[...P.values()].filter(o=>o.alive);let x=ALT.x,y=ALT.y;
 for(let n=0;n<50;n++){let bx=ALT.x,by=ALT.y,d=230+Math.random()*80;if(!first){const t=al[Math.random()*al.length|0];if(t){bx=t.x;by=t.y}d=230+Math.random()*190}
  const a=Math.random()*TAU;x=Math.max(130,Math.min(WS-130,bx+Math.cos(a)*d));y=Math.max(130,Math.min(WS-130,by+Math.sin(a)*d));if(!inWall(x,y,100))break}
 W.hole.x=x;W.hole.y=y;W.hole.r=80;W.hole.a=0;W.st='tele';W.t=1.6}
function wormEmerge(){let t=null,td=1e9;for(const o of P.values())if(o.alive){const d=Math.hypot(o.x-W.hole.x,o.y-W.hole.y);if(d<td){td=d;t=o}}
 W.hx=W.hole.x;W.hy=W.hole.y;W.a=t?Math.atan2(t.y-W.hy,t.x-W.hx):0;W.path=[{x:W.hx,y:W.hy}];W.st='out';W.mode='aim';W.mt=.5;W.t=7+Math.random()*2;W.el=0;W.wt=0;W.vis=1;wormPlace(.3)}
function wormPlace(sc){for(let k=0;k<=WNB;k++){const want=k*WSP;let x=W.hx,y=W.hy;
  if(k>0){let d=0,px=W.hx,py=W.hy,found=false;for(const q of W.path){const sd=Math.hypot(q.x-px,q.y-py);if(d+sd>=want){const f=(want-d)/(sd||1);x=px+(q.x-px)*f;y=py+(q.y-py)*f;found=true;break}d+=sd;px=q.x;py=q.y}if(!found){x=px;y=py}}
  const z=W.seg[k],pv=k?W.seg[k-1]:null;z.a=k?(Math.hypot(pv.x-x,pv.y-y)>1?Math.atan2(pv.y-y,pv.x-x):z.a):W.a;z.x=x;z.y=y;z.rs=WBR(k)*sc;z.hp=W.hp;z.mh=W.mh;z.dead=0}}
function wormHurt(z,d,o){if(!W.vis||W.hp<=0)return;if(WBK){if(WBK.wh)return;WBK.wh=1}z.hit=.1;if(WD){if(W.ld===WD){if(d<=W.ldm)return;W.hp-=d-W.ldm;W.ldm=d}else{W.ld=WD;W.ldm=d;W.hp-=d}}else W.hp-=d;if(W.hp<=0)wormDie(o)}
function wormDie(o){const x=W.hx,y=W.hy;if(o&&o.k!==undefined)o.k++;for(let k=0;k<=WNB;k+=3)evs.push([Math.round(W.seg[k].x),Math.round(W.seg[k].y)]);
 evs.push([Math.round(ALT.x),Math.round(ALT.y),220],[Math.round(ALT.x+60),Math.round(ALT.y-40),120],[Math.round(ALT.x-50),Math.round(ALT.y+50),120]);
 GI.push({id:gid++,x:ALT.x,y:ALT.y,k:'w',s:6,i:20,n:1,ttl:600,hold:0},{id:gid++,x:ALT.x+34,y:ALT.y,k:'h',s:5,i:0,n:1,ttl:600,hold:0});
 wormReset();W.dead=1;bcast({t:'bm',k:'dead'})}
function wormTick(dt){
 for(const z of W.seg)if(z&&z.hit>0)z.hit-=dt;
 if(W.st==='idle')return;
 const al=[...P.values()].filter(o=>o.alive);
 if(!al.length){W.idle+=dt;if(W.idle>15)wormReset();return}W.idle=0;
 for(const o of al)o.wcd=(o.wcd||0)-dt;
 if(W.st==='sum'){W.t-=dt;if(W.t<=0)wormHole(true);return}
 if(W.st==='tele'){W.t-=dt;W.hole.a=Math.min(1,1-W.t/1.6);if(W.t<=0)wormEmerge();return}
 if(W.st==='under'){W.t-=dt;W.hole.a=Math.max(0,W.hole.a-dt*1.2);if(W.t<=0)wormHole(false);return}
 if(W.st==='out'){
  W.t-=dt;W.el+=dt;W.wt+=dt;
  let t=al[0],td=1e9;for(const o of al){const d=Math.hypot(o.x-W.hx,o.y-W.hy);if(d<td){td=d;t=o}}
  const want=Math.atan2(t.y-W.hy,t.x-W.hx),da=Math.atan2(Math.sin(want-W.a),Math.cos(want-W.a));W.mt-=dt;if(W.mt<=0){W.mode=W.mode==='aim'?'chg':'aim';W.mt=W.mode==='aim'?.5:1+Math.random()*.35}const aim=W.mode==='aim';W.a+=aim?Math.max(-4.6*dt,Math.min(4.6*dt,da)):Math.sin(W.wt*7)*.2*dt;
  const sp=(aim?300:470)*Math.min(1,.4+W.el*1.2);let nx=W.hx+Math.cos(W.a)*sp*dt,ny=W.hy+Math.sin(W.a)*sp*dt;
  const bad=(x,y)=>inWall(x,y,28)||x<60||y<60||x>WS-60||y>WS-60;
  if(bad(nx,ny)){let ok=false;for(const k of[.6,-.6,1.2,-1.2,1.9,-1.9,2.6]){const a2=W.a+k,x2=W.hx+Math.cos(a2)*sp*dt,y2=W.hy+Math.sin(a2)*sp*dt;if(!bad(x2,y2)){W.a=a2;nx=x2;ny=y2;ok=true;break}}if(!ok){nx=W.hx;ny=W.hy;W.a+=3*dt}}
  W.hx=nx;W.hy=ny;const q0=W.path[0];if(!q0||Math.hypot(q0.x-nx,q0.y-ny)>=6){W.path.unshift({x:nx,y:ny});if(W.path.length>130)W.path.pop()}
  wormPlace(Math.min(1,.3+W.el*1.6));
  if(W.el>.4)W.hole.a=Math.max(0,W.hole.a-dt*.9);
  for(const o of al){if(o.wcd>0)continue;for(const z of W.seg){if(Math.hypot(o.x-z.x,o.y-z.y)<14*z.rs+10){o.wcd=.3;o.hp-=35;const dx=o.x-z.x,dy=o.y-z.y,L=Math.hypot(dx,dy)||1;send(o,{t:'kb',x:Math.round(dx/L*520),y:Math.round(dy/L*520)});if(o.hp<=0)die(o);break}}}
  for(const z of zs){if(z.bs||z.dead)continue;if(z.wz>0){z.wz-=dt;continue}for(const s of W.seg){if(Math.hypot(z.x-s.x,z.y-s.y)<14*s.rs+8){z.wz=.35;z.hp-=70;z.hit=.1;if(z.hp<=0)z.dead=1;break}}}
  if(W.t<=0){W.st='dive';W.t=.9;W.hole.x=W.hx;W.hole.y=W.hy;W.hole.r=70;W.hole.a=1}
  return}
 if(W.st==='dive'){W.t-=dt;wormPlace(Math.max(0,W.t/.9));if(W.t<=0){for(const z of W.seg)z.x=z.y=-9999;W.vis=0;W.st='under';W.t=1+Math.random()*.8}}
}
const dmx=o=>(o.rage>Date.now()?1.2:1)*(o.weak>Date.now()?.8:1);
const BOOT=Date.now().toString(36);
process.on('uncaughtException',e=>console.error('uncaught',e));process.on('unhandledRejection',e=>console.error('unhandled',e));
const server=http.createServer((req,res)=>{
 if(req.url==='/status'){let a=0;for(const o of P.values())if(o.alive)a++;res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({server:BOOT,uptimeSec:Math.round(process.uptime()),connected:P.size,alive:a,zombies:zs.length,memMB:Math.round(process.memoryUsage().rss/1048576)}));return}
 if(req.url==='/'||req.url.startsWith('/?')||req.url==='/index.html'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(path.join(__dirname,'index.html')))}
 else{res.writeHead(404);res.end('Not found')}});
const wss=new WebSocketServer({server});
wss.on('connection',ws=>{const o={ws,id:nid++,u:null,alive:false,life:false,x:0,y:0,a:0,w:0,c:0,f:0,fa:0,hp:100,k:0,hid:false,rev:0,lf:0,t0:0};P.set(o.id,o);
 ws.on('message',async raw=>{let m;try{m=JSON.parse(raw)}catch(e){return}try{await handle(o,m)}catch(e){console.error(e)}});
 ws.on('close',()=>{endLife(o);P.delete(o.id)});ws.on('error',()=>{})});
setInterval(()=>{try{tick()}catch(e){console.error('tick error',e)}},50);
server.listen(PORT,()=>console.log('Ashfall server on port '+PORT));
