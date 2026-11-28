const WS=6400,TAU=Math.PI*2,$=id=>document.getElementById(id);
const cv=$('c'),mm=$('mm');let ctx=cv.getContext('2d');let W,H,dpr;
let QS=1;function rs(){dpr=Math.max(.6,Math.min(devicePixelRatio||1,1.5)*QS);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr}addEventListener('resize',rs);rs();
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* four regions: 1 grasslands (top left, spawn), 2 desert (top right), 3 dense forest (bottom left), 4 snow land (bottom right) */
const zoneAt=(x,y)=>x<WS/2?(y<WS/2?1:3):(y<WS/2?2:4);
const ZN=['','Grasslands','Desert','Dense Forest','Snow Land'],RF=['#7a5c4a','#5f6b73','#6b5d78','#8a7a55','#4f6a5a'];
const WP=[{nm:'Fists',st:0,me:1,d:10,rate:.5,rg:44,arc:.9},{nm:'Pistol',st:1,d:22,rate:.4,pel:1,spr:.04,rg:480},{nm:'SMG',st:2,d:13,rate:.11,pel:1,spr:.14,rg:420},{nm:'Shotgun',st:3,d:16,rate:.75,pel:8,spr:.09,gs:1,fo:1,pi:50,rg:300},{nm:'Rifle',st:4,d:42,rate:.36,pel:1,spr:.02,rg:640,sp:1250},{nm:'Plasma gun',st:5,d:28,rate:.07,pel:1,spr:.06,rg:560},{nm:'Crowbar',st:1,me:1,d:22,rate:.55,rg:58,arc:1},{nm:'Sword',st:2,me:1,d:34,rate:.45,rg:80,arc:1.4},{nm:'SCAR',st:3,d:21,rate:.14,pel:1,spr:.05,rg:520,sp:900},{nm:'Handcannon',st:4,d:90,rate:.75,pel:1,spr:.015,fo:1,pn:1,rg:600,sp:1500},{nm:'Minigun',st:5,d:20,rate:.24,ramp:[.24,.04,2.5],pel:1,spr:.13,rg:520,sp:800},{nm:'Fire Axe',st:3,me:1,d:55,rate:.7,rg:76,arc:1.3},{nm:'Katana',st:4,me:1,d:40,rate:.3,rg:94,arc:1.1},{nm:'Chainsaw',st:5,me:1,lo:1,d:14,rate:.07,rg:68,arc:1},{nm:'Revolver',st:1,d:34,rate:.5,pel:1,spr:.03,rg:500,sp:800},{nm:'Carbine',st:2,d:18,rate:.2,pel:1,spr:.04,rg:520,sp:850},{nm:'Crossbow',st:3,d:75,rate:.9,pel:1,spr:.01,pn:2,pf:.7,rg:650,sp:1100},{nm:'Sniper',st:4,d:115,rate:1.05,pel:1,spr:.004,pn:3,rg:1000,sp:3400},{nm:'Laser Cannon',st:5,beam:1,d:55,rate:.55,pel:1,rg:1000},{nm:'MP40',st:4,d:15,rate:.085,pel:1,spr:.06,rg:460,sp:950},{nm:'Wyrmfang',st:6,d:48,rate:.16,pel:3,spr:.07,pn:3,pf:.85,rg:720,sp:1300},{nm:'Flamethrower',st:5,d:10,rate:.05,pel:1,spr:.32,pn:9,pf:.92,rg:200,sp:520},{nm:'Baseball Bat',st:1,me:1,d:20,rate:.5,rg:62,arc:1.1},{nm:'Hunting Bow',st:2,d:32,rate:.55,pel:1,spr:.01,pn:1,pf:.8,rg:560,sp:1000},{nm:'Nurlan dur Tullan',st:6,d:34,rate:.9,pel:1,spr:.03,fo:1,rg:260,sp:850,nd:1,bm:1,bn:16,br:190,bp:1,fu:.2}];
const WBS=[null,[1,6,14,22],[2,7,15,23],[3,8,11,16],[4,9,12,17,19],[5,10,13,18,21],[20]];
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
/* desert buildings: every building in region 2 is rebuilt as an Arabian design (shared code, keep identical in both files). It has its own rng(21), so nothing else shifts.
   Cell letters: X room, D domed hall (4 pillars), T tower room, O open courtyard, F courtyard with a decorative fountain, P courtyard with a solid fountain, . empty */
function mkDes(x0,y0,S,rows,gt){const t=10,G=48,ws=[],dr=[],cells=[],cs=new Set(),os=new Set(),kd=new Map(),bd=[];
 rows.forEach((s,r)=>[...s].forEach((ch,c)=>{if(ch!=='.'){cells.push([r,c]);kd.set(r*20+c,ch);(ch==='O'||ch==='P'||ch==='F'?os:cs).add(r*20+c)}}));
 const has=(r,c)=>kd.has(r*20+c),op=(r,c)=>os.has(r*20+c);
 const vseg=(X,Y,gap)=>{if(gap){ws.push({x:X,y:Y,w:t,h:(S-G)/2});ws.push({x:X,y:Y+(S+G)/2,w:t,h:(S-G)/2})}else ws.push({x:X,y:Y,w:t,h:S})};
 const hseg=(X,Y,gap)=>{if(gap){ws.push({x:X,y:Y,w:(S-G)/2,h:t});ws.push({x:X+(S+G)/2,y:Y,w:(S-G)/2,h:t})}else ws.push({x:X,y:Y,w:S,h:t})};
 for(const[r,c]of cells){const ch=kd.get(r*20+c),X=x0+c*S,Y=y0+r*S;
  if(has(r,c+1)&&!(op(r,c)&&op(r,c+1)))vseg(x0+(c+1)*S-t/2,Y,true);
  if(has(r+1,c)&&!(op(r,c)&&op(r+1,c)))hseg(X,y0+(r+1)*S-t/2,true);
  if(!has(r,c-1))bd.push(['l',r,c]);if(!has(r,c+1))bd.push(['r',r,c]);if(!has(r-1,c))bd.push(['t',r,c]);if(!has(r+1,c))bd.push(['b',r,c]);
  if(ch==='D')for(const[u,v]of[[.2,.2],[.8,.2],[.2,.8],[.8,.8]])ws.push({x:X+S*u-5,y:Y+S*v-5,w:10,h:10,pl:1});
  if(ch==='P')ws.push({x:X+S/2-12,y:Y+S/2-12,w:24,h:24,fx:1})}
 const n=Math.max(3,Math.round(bd.length/5)),dset=new Set();if(!gt)for(let k=0;k<n;k++)dset.add(Math.floor((k+.5)*bd.length/n));
 bd.forEach(([s,r,c],i)=>{const g=gt?gt.some(q=>q[0]===s&&q[1]===r&&q[2]===c):dset.has(i),X=x0+c*S,Y=y0+r*S;
  if(s==='l'){vseg(X,Y,g);if(g)dr.push({x:X,y:Y+S/2,r:Math.PI/2})}
  else if(s==='r'){vseg(X+S-t,Y,g);if(g)dr.push({x:X+S,y:Y+S/2,r:-Math.PI/2})}
  else if(s==='t'){hseg(X,Y,g);if(g)dr.push({x:X+S/2,y:Y,r:Math.PI})}
  else{hseg(X,Y+S-t,g);if(g)dr.push({x:X+S/2,y:Y+S,r:0})}});
 return{ws,dr,cells,cs,os,kd}}
const DST={
 bazaar:{t:10,S:92,lb:.2,m:2,rows:['XXXXX','XOOOX','XOPOX','XXOXX'],gt:[['b',3,2],['l',1,0],['r',1,4]]},
 palace:{t:11,S:92,lb:.4,m:2,rows:['TXDXT','XXDXX','XOPOX','TXOXT'],gt:[['b',3,2],['l',2,0],['r',2,4]]},
 riadA:{t:12,S:72,lb:.1,m:2,rows:['XXX','XFX','XXX'],gt:[['b',2,1],['l',1,0]]},
 riadB:{t:13,S:72,lb:.1,m:2,rows:['XXX','XFX','X.X'],gt:[['b',1,1]]},
 tower:{t:14,S:72,lb:.3,m:2,rows:['TX','XT'],gt:[['b',1,0],['t',0,1]]},
 serai:{t:15,S:92,lb:.25,m:2,rows:['XXXXX','OOFOO','XXXXX'],gt:[['l',1,0],['r',1,4]]},
 mosque:{t:16,S:88,lb:.35,m:2,rows:['TDDT','XDDX','XPOX'],gt:[['b',2,2],['l',1,0],['r',1,3]]}};
{const RD=rng(21),rb=new Set(),nw=[],sw={l:'r',r:'l',t:'t',b:'b'};const bigs=bl.filter(q=>q.z===2&&q.t>=4).sort((a,q)=>Math.hypot(a.x+a.w/2-4800,a.y+a.h/2-1600)-Math.hypot(q.x+q.w/2-4800,q.y+q.h/2-1600));
 for(let i=0;i<bl.length;i++){const b=bl[i];if(b.z!==2)continue;
  const big=b.t>=4,r=RD(),fl=RD()<.5,pl=Math.floor(RD()*4),T=DST[big?(b===bigs[0]?'palace':b===bigs[1]?'bazaar':r<.25?'palace':r<.55?'bazaar':r<.8?'serai':'mosque'):(r<.35?'riadA':r<.7?'riadB':'tower')];
  let rows=T.rows,gt=T.gt;if(fl){const nc=rows[0].length;rows=rows.map(s=>[...s].reverse().join(''));gt=gt.map(q=>[sw[q[0]],q[1],nc-1-q[2]])}
  const S=T.S,BW=rows[0].length*S,BH=rows.length*S,x=Math.round(b.x+b.w/2-BW/2),y=Math.round(b.y+b.h/2-BH/2),m=mkDes(x,y,S,rows,gt),cr=[];let n=0;
  m.cells.forEach(([rr,c])=>{const ch=m.kd.get(rr*20+c),X=x+c*S,Y=y+rr*S;
   if(ch==='D'){cr.push({x:X+S*.34,y:Y+S*.5,t:0},{x:X+S*.66,y:Y+S*.5,t:0})}
   else if(ch==='T')cr.push({x:X+S*.5,y:Y+S*.5,t:0});
   else if(ch==='X'&&n++%T.m===0)cr.push({x:X+S*.3,y:Y+S*.3,t:0})});
  b.ws.forEach(q=>rb.add(q));m.ws.forEach(q=>nw.push(q));
  bl[i]={x,y,w:BW,h:BH,z:2,c:'#d6b57a',t:T.t,lb:T.lb,pl,dr:m.dr,ws:m.ws,cells:m.cells,cs:m.cs,os:m.os,kd:m.kd,S,cr}}
 for(let i=walls.length-1;i>=0;i--)if(rb.has(walls[i]))walls.splice(i,1);nw.forEach(q=>walls.push(q))}
/* forest designs (shared code, keep identical in both files): every building in region 3 is rebuilt as a log cabin design with mkDes. Own rng(31), nothing else shifts.
   t 20 cabin, 21 hunter hut, 22 lodge, 23 sawmill, 24 trapper camp, 25 watch fort. Cell letters as for the desert (O yard, F yard with campfire, P yard with log stack). */
const FST={
 cabin:{t:20,S:70,lb:.1,m:2,rows:['XXO','XX.'],gt:[['b',1,0],['r',0,2]]},
 hut:{t:21,S:80,lb:.3,m:1,rows:['XT'],gt:[['t',0,0]]},
 lodge:{t:22,S:92,lb:.35,m:2,rows:['XDDX','XXXX'],gt:[['b',1,1],['l',0,0],['t',0,3]]},
 mill:{t:23,S:92,lb:.2,m:2,rows:['XXOO','XXPO'],gt:[['b',1,0],['r',0,3],['t',0,3]]},
 camp:{t:24,S:84,lb:.25,m:1,rows:['XOX','OFO','XOX'],gt:[['b',2,1],['t',0,1],['l',1,0],['r',1,2]]},
 fort:{t:25,S:88,lb:.4,m:1,rows:['TOT','XFX','TOT'],gt:[['b',2,1],['t',0,1]]}};
{const RD=rng(31),rb=new Set(),nw=[],sw={l:'r',r:'l',t:'t',b:'b'};
 for(let i=0;i<bl.length;i++){const b=bl[i];if(b.z!==3)continue;
  const big=b.t>=4,r=RD(),fl=RD()<.5,pl=Math.floor(RD()*4),T=FST[big?(r<.3?'lodge':r<.55?'mill':r<.8?'camp':'fort'):(r<.6?'cabin':'hut')];
  let rows=T.rows,gt=T.gt;if(fl){const nc=rows[0].length;rows=rows.map(s=>[...s].reverse().join(''));gt=gt.map(q=>[sw[q[0]],q[1],nc-1-q[2]])}
  const S=T.S,BW=rows[0].length*S,BH=rows.length*S,x=Math.round(b.x+b.w/2-BW/2),y=Math.round(b.y+b.h/2-BH/2),m=mkDes(x,y,S,rows,gt),cr=[];let n=0;
  m.cells.forEach(([rr,c])=>{const ch=m.kd.get(rr*20+c),X=x+c*S,Y=y+rr*S;
   if(ch==='D'){cr.push({x:X+S*.34,y:Y+S*.5,t:0},{x:X+S*.66,y:Y+S*.5,t:0})}
   else if(ch==='T')cr.push({x:X+S*.5,y:Y+S*.5,t:0});
   else if(ch==='X'&&n++%T.m===0)cr.push({x:X+S*.3,y:Y+S*.3,t:0})});
  b.ws.forEach(q=>rb.add(q));m.ws.forEach(q=>nw.push(q));
  bl[i]={x,y,w:BW,h:BH,z:3,c:'#6b4a2b',t:T.t,lb:T.lb,pl,dr:m.dr,ws:m.ws,cells:m.cells,cs:m.cs,os:m.os,kd:m.kd,S,cr}}
 for(let i=walls.length-1;i>=0;i--)if(rb.has(walls[i]))walls.splice(i,1);nw.forEach(q=>walls.push(q))}
/* snow designs (shared code, keep identical in both files): every building in region 4 is rebuilt. Own rng(41), nothing else shifts.
   t 30 igloo, 31 great igloo, 32 ski lodge, 33 ice fort, 34 research station, 35 snow cabin. 30/31 are round (b.rd): the wall is a ring of small blocks with tunnel doorways. */
const SST={
 lodge:{t:32,S:92,lb:.35,m:2,rows:['XXXX','XDDX','OXXO'],gt:[['b',2,1],['l',0,0],['r',0,3]]},
 fort:{t:33,S:88,lb:.4,m:1,rows:['TOOOT','XOFOX','TOOOT'],gt:[['b',2,2],['t',0,2]]},
 base:{t:34,S:84,lb:.3,m:2,rows:['XX.XX','XXDXX','.OPO.'],gt:[['b',2,2],['l',0,0],['r',0,4]]},
 chalet:{t:35,S:72,lb:.1,m:2,rows:['XX','XO'],gt:[['b',1,0],['r',0,1]]}};
function mkIgloo(cx,cy,R,sides){const ws=[],dr=[],rc=R-8,N=Math.ceil(TAU*rc/12),E=40,D={b:[0,1,0],t:[0,-1,Math.PI],l:[-1,0,Math.PI/2],r:[1,0,-Math.PI/2]},dv=sides.map(s=>D[s]);
 for(let i=0;i<N;i++){const a=i/N*TAU,dx=Math.cos(a)*rc,dy=Math.sin(a)*rc;if(dv.some(([u,v])=>dx*u+dy*v>0&&Math.abs(dx*v-dy*u)<36))continue;ws.push({x:Math.round(cx+dx)-8,y:Math.round(cy+dy)-8,w:16,h:16,ig:1})}
 const a0=Math.floor(Math.sqrt(rc*rc-34*34))-4,a1=R+E;
 for(const[u,v,rot]of dv){for(const s of[-34,34]){if(u)ws.push({x:u>0?cx+a0:cx-a1,y:cy+s-6,w:a1-a0,h:12,tn:1});else ws.push({x:cx+s-6,y:v>0?cy+a0:cy-a1,w:12,h:a1-a0,tn:1})}dr.push({x:cx+u*a1,y:cy+v*a1,r:rot})}
 return{ws,dr}}
{const RD=rng(41),rb=new Set(),nw=[],sw={l:'r',r:'l',t:'t',b:'b'},BG=['great','fort','lodge','base'];let nb=0,ns=0;
 for(let i=0;i<bl.length;i++){const b=bl[i];if(b.z!==4)continue;
  const big=b.t>=4,r=RD(),fl=RD()<.5,pl=Math.floor(RD()*4),kind=big?BG[nb++%4]:(ns++%3===2?'chalet':'igloo');
  b.ws.forEach(q=>rb.add(q));
  if(kind==='igloo'||kind==='great'){const gr=kind==='great',R=gr?150:Math.round(72+r*10),cx=Math.round(b.x+b.w/2),cy=Math.round(b.y+b.h/2),sides=gr?['b','l','r']:[['b','b','l','r'][pl]],m=mkIgloo(cx,cy,R,sides),E=R+40;
   if(gr)for(const[u,v]of[[-1,-1],[1,-1],[-1,1],[1,1]])m.ws.push({x:cx+u*46-7,y:cy+v*46-7,w:14,h:14,pl:1});
   const cr=(gr?[[-.62,-.28],[.62,-.28],[-.25,-.65],[.25,-.65],[-.4,.55],[.4,.55]]:[[-.38,-.3],[.38,-.3]]).map(f=>({x:cx+f[0]*R,y:cy+f[1]*R,t:0}));
   m.ws.forEach(q=>nw.push(q));
   bl[i]={x:cx-E,y:cy-E,w:E*2,h:E*2,z:4,c:'#bcd6e6',t:gr?31:30,lb:gr?.4:.15,pl,rd:{cx,cy,R,sides},dr:m.dr,ws:m.ws,cr};continue}
  const T=SST[kind];let rows=T.rows,gt=T.gt;if(fl){const nc=rows[0].length;rows=rows.map(s=>[...s].reverse().join(''));gt=gt.map(q=>[sw[q[0]],q[1],nc-1-q[2]])}
  const S=T.S,BW=rows[0].length*S,BH=rows.length*S,x=Math.round(b.x+b.w/2-BW/2),y=Math.round(b.y+b.h/2-BH/2),m=mkDes(x,y,S,rows,gt),cr=[];let n=0;
  m.cells.forEach(([rr,c])=>{const ch=m.kd.get(rr*20+c),X=x+c*S,Y=y+rr*S;
   if(ch==='D'){cr.push({x:X+S*.34,y:Y+S*.5,t:0},{x:X+S*.66,y:Y+S*.5,t:0})}
   else if(ch==='T')cr.push({x:X+S*.5,y:Y+S*.5,t:0});
   else if(ch==='X'&&n++%T.m===0)cr.push({x:X+S*.3,y:Y+S*.3,t:0})});
  m.ws.forEach(q=>nw.push(q));
  bl[i]={x,y,w:BW,h:BH,z:4,c:kind==='base'?'#c8603a':kind==='fort'?'#9cc4dc':'#7a4a34',t:T.t,lb:T.lb,pl,dr:m.dr,ws:m.ws,cells:m.cells,cs:m.cs,os:m.os,kd:m.kd,S,cr}}
 for(let i=walls.length-1;i>=0;i--)if(rb.has(walls[i]))walls.splice(i,1);nw.forEach(q=>walls.push(q))}
/* shop (shared code, keep identical in both files): bottom middle of the map, flush with the bottom border, between forest and snow.
   Buildings in the way are removed. No crates. Safe zone. */
const SHOP=(()=>{const w=300,h=220,x=(WS-w)/2,y=WS-h,dd=[{s:'t',f:.5},{s:'l',f:.5},{s:'r',f:.5}],ws=mkWalls(x,y,w,h,dd,[]);
 for(let i=bl.length-1;i>=0;i--){const o=bl[i];if(o.x<x+w+70&&o.x+o.w>x-70&&o.y+o.h>y-70){for(const q of o.ws){const k=walls.indexOf(q);if(k>=0)walls.splice(k,1)}bl.splice(i,1)}}
 ws.forEach(q=>walls.push(q));const b={x,y,w,h,z:3,c:'#2f6b5a',t:0,lb:0,shop:1,dr:absDoors(x,y,w,h,dd),ws,cr:[]};bl.push(b);return b})();
/* shop price list [kind, stars, index, price in G] (shared code, keep identical in both files). Order = order in the shop. */
const SHOPL=(()=>{const L=[],add=(k,s,i,pr)=>L.push([k,s,i,pr]);
 add('h',2,0,5);add('h',3,0,12);add('h',5,0,30);
 add('g',3,2,8);add('g',3,3,8);add('g',3,0,10);add('g',4,4,20);add('g',5,1,25);add('g',5,5,50);
 for(const i of[0,1,2])add('p',4,i,25);
 for(const k of['a','f'])for(const[s,pr]of[[2,25],[3,60],[4,120],[5,220]])add(k,s,0,pr);
 add('y',3,0,100);return L})();
const inShop=(x,y,m=0)=>x>SHOP.x-m&&x<SHOP.x+SHOP.w+m&&y>SHOP.y-m&&y<SHOP.y+SHOP.h+m;
let _n=0;const CR=[];bl.forEach(b=>b.cr.forEach(q=>{q.id=_n++;q.b=b;CR.push(q)}));
for(let i=0;i<700;i++){const x=R0()*WS,y=R0()*WS,r=22+R0()*10;if(bl.some(b=>x>b.x-r-12&&x<b.x+b.w+r+12&&y>b.y-r-12&&y<b.y+b.h+r+12))continue;trees.push([x,y,r])}
for(let i=0;i<550;i++){const x=R0()*WS/2,y=WS/2+R0()*WS/2,r=22+R0()*10;if(bl.some(b=>x>b.x-r-12&&x<b.x+b.w+r+12&&y>b.y-r-12&&y<b.y+b.h+r+12))continue;trees.push([x,y,r])}
function push(o,r){for(const q of near(o.x,o.y)){if(o.x<q.x-r||o.x>q.x+q.w+r||o.y<q.y-r||o.y>q.y+q.h+r)continue;const nx=Math.max(q.x,Math.min(o.x,q.x+q.w)),ny=Math.max(q.y,Math.min(o.y,q.y+q.h)),dx=o.x-nx,dy=o.y-ny,d2=dx*dx+dy*dy;
 if(d2<r*r){if(d2>1e-4){const d=Math.sqrt(d2),f=(r-d)/d;o.x+=dx*f;o.y+=dy*f}else o.y-=r}}
 o.x=Math.max(r,Math.min(WS-r,o.x));o.y=Math.max(r,Math.min(WS-r,o.y))}
const GRID=new Map(),NONE=[],GK=(cx,cy)=>(cx+10)*4096+(cy+10);
for(let i=trees.length-1;i>=0;i--)if(Math.hypot(trees[i][0]-ALT.x,trees[i][1]-ALT.y)<115)trees.splice(i,1);
/* mystery key shrine: a gold pole with a disc in the bottom-left corner of region 1 (shared code, keep identical in both files) */
const KS=(()=>{for(let y=3000;y>=2500;y-=50)for(let x=240;x<=900;x+=50)if(!bl.some(b=>x>b.x-170&&x<b.x+b.w+170&&y>b.y-170&&y<b.y+b.h+170))return{x,y};return{x:240,y:3000}})();
for(let i=trees.length-1;i>=0;i--)if(Math.hypot(trees[i][0]-KS.x,trees[i][1]-KS.y)<110)trees.splice(i,1);
const TK=[];{const RT=rng(13);for(let i=0;i<1400&&TK.length<260;i++){const x=70+RT()*(WS/2-140),y=WS/2+70+RT()*(WS/2-140);if(bl.some(b=>x>b.x-45&&x<b.x+b.w+45&&y>b.y-45&&y<b.y+b.h+45))continue;if(TK.some(t=>Math.hypot(t.cx-x,t.cy-y)<60))continue;TK.push({x:x-12,y:y-12,w:24,h:24,tk:1,cx:x,cy:y})}}
for(const q of walls.concat(TK))for(let cx=Math.floor((q.x-24)/128);cx<=Math.floor((q.x+q.w+24)/128);cx++)for(let cy=Math.floor((q.y-24)/128);cy<=Math.floor((q.y+q.h+24)/128);cy++){const k=GK(cx,cy);if(!GRID.has(k))GRID.set(k,[]);GRID.get(k).push(q)}
function near(x,y){return GRID.get(GK(Math.floor(x/128),Math.floor(y/128)))||NONE}
const inWall=(x,y,m=0)=>near(x,y).some(q=>x>q.x-m&&x<q.x+q.w+m&&y>q.y-m&&y<q.y+q.h+m);
walls.forEach((q,i)=>{q.id=i});
function wallSet(q,on){for(let cx=Math.floor((q.x-24)/128);cx<=Math.floor((q.x+q.w+24)/128);cx++)for(let cy=Math.floor((q.y-24)/128);cy<=Math.floor((q.y+q.h+24)/128);cy++){const k=GK(cx,cy);let a=GRID.get(k);
 if(on){if(!a)GRID.set(k,a=[]);if(!a.includes(q))a.push(q)}else if(a){const i=a.indexOf(q);if(i>=0)a.splice(i,1)}}q.d=on?0:1}
const inside=(o,b)=>b.rd?Math.hypot(o.x-b.rd.cx,o.y-b.rd.cy)<b.rd.R-6:b.cells?b.cs.has(Math.floor((o.y-b.y)/b.S)*20+Math.floor((o.x-b.x)/b.S)):(o.x>b.x+10&&o.x<b.x+b.w-10&&o.y>b.y+10&&o.y<b.y+b.h-10);
let prof={name:''},paused=true;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
