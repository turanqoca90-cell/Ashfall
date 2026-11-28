/* soft, wavy biome borders (looks only: zoneAt, loot and zombies still use the straight lines) */
const BLEND=260;
function bioW(x,y){const H=WS/2,u=x+Math.sin(y/230)*70+Math.sin(y/89+x/310)*35+Math.sin(y/37+x/53)*14,v=y+Math.sin(x/260+2)*70+Math.sin(x/97+y/290)*35+Math.sin(x/41+y/47)*14,
 f=d=>{const t=Math.max(0,Math.min(1,d/(BLEND*2)+.5));return t*t*(3-2*t)},a=f(u-H),b=f(v-H);return[(1-a)*(1-b),a*(1-b),(1-a)*b,a*b]}
const GROUND=(()=>{const N=400,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),im=g.createImageData(N,N),C=[[106,160,75],[216,191,124],[63,122,59],[230,238,243]];
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const w=bioW((i+.5)*WS/N,(j+.5)*WS/N),o=(j*N+i)*4;for(let k=0;k<3;k++)im.data[o+k]=w[0]*C[0][k]+w[1]*C[1][k]+w[2]*C[2][k]+w[3]*C[3][k];im.data[o+3]=255}g.putImageData(im,0,0);return c})();
const _dt=new Map();
/* sand ripples are drawn once per 512 px tile and then just copied (still image, no drifting) */
function bakeDune(X,Y,T){const SC=.75,c=document.createElement('canvas');c.width=c.height=Math.ceil(T*SC);const g=c.getContext('2d');g.scale(SC,SC);g.translate(-X,-Y);g.lineCap='round';let any=false;
 const sx0=Math.floor((X-60)/60)*60;
 for(let pass=0;pass<2;pass++){g.strokeStyle=pass?'rgba(255,244,200,.5)':'rgba(150,108,44,.4)';g.lineWidth=pass?2:3;
  for(let y=Math.floor((Y-14)/38)*38;y<Y+T+14;y+=38){const yy=y+pass*5;for(let sx=sx0;sx<=X+T+60;sx+=60){const wt=bioW(sx+30,y)[1];if(wt<.04)continue;any=true;g.globalAlpha=wt;g.beginPath();
   for(let x=sx;x<=sx+60;x+=20){const wy=yy+Math.sin(x/60+y/17)*6+Math.sin(x/23+y)*1.5;x===sx?g.moveTo(x,wy):g.lineTo(x,wy)}g.stroke()}}}
 return any?c:null}
const _dc=new Map();
function decorBake(TX0,TY0,T){const SC=.75,c=document.createElement('canvas');c.width=c.height=Math.ceil(T*SC);const g=c.getContext('2d');g.scale(SC,SC);g.translate(-TX0,-TY0);let any=false;const x0=TX0-60,x1=TX0+T+60,y0=TY0-60,y1=TY0+T+60;
 if(x1>WS/2-BLEND*2&&y1>WS/2-BLEND*2){
  for(let cx=Math.floor(x0/90);cx<=x1/90;cx++)for(let cy=Math.floor(y0/90);cy<=y1/90;cy++){const h=hs(cx,cy),h2=hs(cy+99,cx),X=cx*90+h*70,Y=cy*90+h2*70,wt=bioW(X,Y)[3];if(wt<.04)continue;any=true;g.globalAlpha=wt;
   if(h<.42){g.fillStyle='rgba(150,185,212,.32)';g.beginPath();g.ellipse(X+4,Y+6,34+h*40,15+h2*10,0,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.ellipse(X,Y,32+h*40,13+h2*10,0,0,TAU);g.fill()}
   else if(h<.55){g.fillStyle='rgba(165,212,238,.6)';g.beginPath();g.ellipse(X,Y,26+h2*20,16,h,0,TAU);g.fill();g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=2;g.beginPath();g.moveTo(X-14,Y-4);g.lineTo(X-3,Y-7);g.stroke()}
   else if(h<.62){g.strokeStyle='rgba(120,175,215,.7)';g.lineWidth=2;g.beginPath();g.moveTo(X,Y);g.lineTo(X+18,Y+9);g.lineTo(X+30,Y+2);g.lineTo(X+46,Y+14);g.moveTo(X+18,Y+9);g.lineTo(X+14,Y+26);g.stroke()}}
 }
 if(x0<WS/2+BLEND*2&&y1>WS/2-BLEND*2){
  for(let cx=Math.floor(x0/70);cx<=x1/70;cx++)for(let cy=Math.floor(y0/70);cy<=y1/70;cy++){const h=hs(cx+7,cy),h2=hs(cy,cx+3),X=cx*70+h*55,Y=cy*70+h2*55,wt=bioW(X,Y)[2];if(wt<.04)continue;any=true;g.globalAlpha=wt;
   if(h<.4){g.fillStyle='rgba(8,42,18,.3)';g.beginPath();g.ellipse(X,Y,20+h2*22,13+h*10,h*3,0,TAU);g.fill()}
   else if(h<.7){g.fillStyle=h2<.5?'rgba(125,85,40,.5)':'rgba(170,120,40,.45)';g.beginPath();g.ellipse(X,Y,6,3.2,h*6,0,TAU);g.fill()}
   else if(h2<.18){g.fillStyle='#e8e0c8';g.fillRect(X-1.5,Y,3,6);g.fillStyle='#b8452f';g.beginPath();g.arc(X,Y,5,Math.PI,TAU);g.fill()}}
 }
 return any?c:null}
function drawRegionArt(px,py,vw,vh){const x0=px-vw/2-40,x1=px+vw/2+40,y0=py-vh/2-40,y1=py+vh/2+40,H=WS/2,t=performance.now()/1000;
 const OE=BLEND+130,A=ctx.globalAlpha;
 if(x1>H-OE&&y0<H+OE){const T=512;let baked=0;
  for(let ty=Math.max(0,Math.floor(y0/T));ty<=Math.min(WS/T-1,Math.floor(y1/T));ty++)for(let tx=Math.max(0,Math.floor(x0/T));tx<=Math.min(WS/T-1,Math.floor(x1/T));tx++){
   const k=tx*64+ty;let c=_dt.get(k);if(c===undefined){if(baked>=2)continue;baked++;c=bakeDune(tx*T,ty*T,T);_dt.set(k,c)}
   if(c)ctx.drawImage(c,tx*T,ty*T,T,T)}}
 if(y1>H-OE){const T=512;let baked=0;
  for(let ty=Math.max(0,Math.floor(y0/T));ty<=Math.min(WS/T-1,Math.floor(y1/T));ty++)for(let tx=Math.max(0,Math.floor(x0/T));tx<=Math.min(WS/T-1,Math.floor(x1/T));tx++){
   const k=tx*64+ty;let c=_dc.get(k);if(c===undefined){if(baked>=2)continue;baked++;c=decorBake(tx*T,ty*T,T)}else _dc.delete(k);
   _dc.set(k,c);if(_dc.size>16)_dc.delete(_dc.keys().next().value);
   if(c)ctx.drawImage(c,tx*T,ty*T,T,T)}}
 ctx.globalAlpha=A}
function drawSnowfall(px,py,vw,vh){if(zoneAt(px,py)!==4)return;const t=performance.now()/1000;ctx.fillStyle='rgba(255,255,255,.9)';ctx.strokeStyle='rgba(120,160,200,.55)';ctx.lineWidth=1;
 for(let i=0;i<70;i++){const fx=px-vw/2+(((i*137.5+Math.sin(t*.8+i)*28)%vw)+vw)%vw,fy=py-vh/2+((i*59.3+t*(32+(i%7)*9))%vh);ctx.beginPath();ctx.arc(fx,fy,1.6+(i%3)*.7,0,TAU);ctx.fill();ctx.stroke()}}

let BS=0,DZC=[],NBON=0,HM=[];
function drawAltar(px,py,vw,vh){const x=ALT.x,y=ALT.y;if(Math.abs(x-px)>vw/2+150||Math.abs(y-py)>vh/2+150)return;const t=performance.now()/1000,on=!!BS;
 if(ALTD){ctx.fillStyle='rgba(20,12,4,.55)';ctx.beginPath();ctx.arc(x,y,98,0,TAU);ctx.fill();for(let i=0;i<9;i++){const a=i*2.4+1,r=30+(i*37)%52;ctx.save();ctx.translate(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.rotate(a*2);ctx.fillStyle='#6b5a38';ctx.fillRect(-9,-5,18,10);ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.strokeRect(-9,-5,18,10);ctx.restore()}return}
 const C=(r,f,s)=>{ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(f){ctx.fillStyle=f;ctx.fill()}if(s){ctx.strokeStyle=s;ctx.lineWidth=4;ctx.stroke()}};
 ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.arc(x+4,y+6,92,0,TAU);ctx.fill();C(86,'#b99a5e',OL);C(68,'#d3b878','rgba(80,55,20,.6)');
 for(let i=0;i<8;i++){const a=i/8*TAU+Math.PI/8;ctx.save();ctx.translate(x+Math.cos(a)*77,y+Math.sin(a)*77);ctx.rotate(a);ctx.fillStyle=on?'#ffd44a':'#8a6d3a';ctx.fillRect(-6,-3,12,6);ctx.restore()}
 if(on){const g=ctx.createRadialGradient(x,y,10,x,y,150);const pu=.5+.25*Math.sin(t*4);g.addColorStop(0,'rgba(255,215,90,'+pu+')');g.addColorStop(1,'rgba(255,170,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,150,0,TAU);ctx.fill()}
 const cf=on?'#f6dc86':'#a58b56';rr(ctx,x-11,y-62,22,124,cf);rr(ctx,x-46,y-30,92,22,cf);
 ctx.fillStyle=on?'#fff6b8':'#6b5428';ctx.beginPath();ctx.arc(x,y-19,6.5,0,TAU);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke()}
let MH=[],mhSeen={};
function drawHole(){for(const h of MH)holeArt(h[1],h[2],h[3],h[4]);if(BS&&BS[6]>0)holeArt(BS[3],BS[4],BS[5],BS[6])}
function holeArt(x,y,r,a){const t=performance.now()/1000;
 const g=ctx.createRadialGradient(x,y,r*.1,x,y,r);g.addColorStop(0,'rgba(12,6,0,'+(.92*a)+')');g.addColorStop(.75,'rgba(40,24,6,'+(.8*a)+')');g.addColorStop(1,'rgba(90,62,24,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
 ctx.strokeStyle='rgba(120,80,30,'+(.55*a)+')';ctx.lineWidth=3;for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(x,y,r*(.7+.3*((t*1.2+i*.5)%1)),0,TAU);ctx.stroke()}
 ctx.strokeStyle='rgba(190,50,30,'+(.5*a)+')';ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.setLineDash([])}
function drawWorm(q){const r=14*q.rs,h=q.hit>0||q.hl>0;if(r<1)return;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.a);
 ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.arc(3,5,r,0,TAU);ctx.fill();
 const mini=q.kd>10;ctx.fillStyle=h?'#fff':mini?'#c98a52':'#e2bd45';ctx.strokeStyle=OL;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.stroke();
 if(!h){ctx.save();ctx.beginPath();ctx.arc(0,0,r-1,0,TAU);ctx.clip();ctx.strokeStyle=mini?'#8a5428':'#b78a1c';ctx.lineWidth=Math.max(2,r*.13);for(const o of[-.55,-.05,.45]){ctx.beginPath();ctx.moveTo(o*r,-r);ctx.quadraticCurveTo(o*r-r*.4,0,o*r,r);ctx.stroke()}ctx.restore()}
 if(q.kd===9||q.kd===11){const mx=r*.5,mr=r*.72;ctx.fillStyle='#b3261e';ctx.strokeStyle=OL;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(mx,0,mr,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#3b0b0a';ctx.beginPath();ctx.arc(mx,0,mr*.5,0,TAU);ctx.fill();
  ctx.fillStyle='#fff6e0';ctx.strokeStyle='rgba(40,10,5,.8)';ctx.lineWidth=1;for(let i=0;i<14;i++){const a=i/14*TAU,b=.2;ctx.beginPath();ctx.moveTo(mx+Math.cos(a-b)*mr*.98,Math.sin(a-b)*mr*.98);ctx.lineTo(mx+Math.cos(a+b)*mr*.98,Math.sin(a+b)*mr*.98);ctx.lineTo(mx+Math.cos(a)*mr*.5,Math.sin(a)*mr*.5);ctx.closePath();ctx.fill();ctx.stroke()}}
 ctx.restore();
 if(q.kd===11&&q.hp<q.mh){ctx.fillStyle='#000';ctx.fillRect(q.x-18,q.y-r-11,36,6);ctx.fillStyle='#e0a030';ctx.fillRect(q.x-17,q.y-r-10,34*Math.max(0,q.hp/q.mh),4)}}
let bbEl=null;function bossUI(){if(!bbEl){bbEl=document.createElement('div');bbEl.style.cssText='position:fixed;top:6px;left:calc(175px*var(--bs) + 48px);right:132px;z-index:30;pointer-events:none;display:none;text-align:center;font:800 12px sans-serif;color:#ffe9a0;text-shadow:0 0 3px #000,0 0 3px #000';bbEl.innerHTML='<div id="bbn"></div><div style="height:14px;background:rgba(0,0,0,.6);border:2px solid #000;border-radius:7px;overflow:hidden"><div id="bbf" style="height:100%;width:100%;background:linear-gradient(#ffd84a,#e0a516)"></div></div>';document.body.appendChild(bbEl)}
 const nq=zs.find(q=>q.kd===14);if(BS&&BS[0]===2){bbEl.style.display='block';document.getElementById('bbn').textContent=TX('bossn');document.getElementById('bbf').style.width=Math.max(0,BS[1]/BS[2]*100)+'%'}else if(nq){bbEl.style.display='block';document.getElementById('bbn').textContent=TX('nbn');document.getElementById('bbf').style.width=Math.max(0,nq.hp/nq.mh*100)+'%'}else bbEl.style.display='none'}
const nearAlt=()=>!!p&&Math.hypot(p.x-ALT.x,p.y-ALT.y)<100;
const nearKS=()=>!!p&&Math.hypot(p.x-KS.x,p.y-KS.y)<90,hasKey=()=>!!p&&p.inv.some(it=>it&&it.k==='y');
function drawKS(px,py,vw,vh){const x=KS.x,y=KS.y;if(Math.abs(x-px)>vw/2+80||Math.abs(y-py)>vh/2+110)return;const t=performance.now()/1000,o=Math.max(0,1-(performance.now()-KSO)/4000),cy=y-48;ctx.save();ctx.lineCap='round';
 ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x+5,y+3,15,7,0,0,TAU);ctx.fill();
 ctx.fillStyle='#6b6258';ctx.beginPath();ctx.arc(x,y,9,0,TAU);ctx.fill();ctx.fillStyle='#8a7f72';ctx.beginPath();ctx.arc(x,y,6,0,TAU);ctx.fill();
 ctx.strokeStyle='#8a5a12';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,cy+10);ctx.stroke();
 ctx.strokeStyle='#f2c744';ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(x-.8,y);ctx.lineTo(x-.8,cy+10);ctx.stroke();
 const gl=o>0?.35+.4*o:.1+.07*Math.sin(t*2);ctx.fillStyle=o>0?'rgba(150,245,255,'+gl+')':'rgba(255,224,120,'+gl+')';ctx.beginPath();ctx.arc(x,cy,o>0?18+16*o:22,0,TAU);ctx.fill();
 ctx.fillStyle='#8a5a12';ctx.beginPath();ctx.arc(x,cy,14,0,TAU);ctx.fill();ctx.fillStyle='#f2c744';ctx.beginPath();ctx.arc(x,cy,12.4,0,TAU);ctx.fill();
 ctx.fillStyle=o>0?'#b8fbff':'#3b2a0c';ctx.beginPath();ctx.arc(x,cy,8,0,TAU);ctx.fill();
 ctx.fillStyle=o>0?'#2a8fa0':'#f2c744';ctx.beginPath();ctx.arc(x,cy-1.5,2.8,0,TAU);ctx.fill();ctx.fillRect(x-1.3,cy-1,2.6,6);
 ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,cy,10,3.6,4.5);ctx.stroke();ctx.restore()}
/* all bush looks live in ONE atlas canvas (4 colour sets x 2 sizes x 6 rotations) so a frame draws from a single texture instead of ~1250 tiny canvases */
let _BA=null;const BCELL=80;
function bushAtlas(){if(_BA)return _BA;const cv=document.createElement('canvas');cv.width=BCELL*8;cv.height=BCELL*6;const g=cv.getContext('2d');
 const COL=[['#38873f','#2e7d3b'],['#9d9840','#8f8a3a'],['#2a7a36','#1f6a2c'],['#dcecf4','#cfe3ee']];
 for(let z=0;z<4;z++)for(let sz=0;sz<2;sz++)for(let v=0;v<6;v++){const idx=(z*2+sz)*6+v,P=BCELL/2,cx=(idx%8)*BCELL+P,cy=((idx/8)|0)*BCELL+P,r=sz?30:25,L=[];
  for(let i=0;i<7;i++){const a=i/7*TAU+v*1.1;L.push([cx+Math.cos(a)*r*.58,cy+Math.sin(a)*r*.58,r*.52])}L.push([cx,cy,r*.7]);
  g.fillStyle=OL;L.forEach(l=>{g.beginPath();g.arc(l[0],l[1],l[2]+3,0,TAU);g.fill()});
  g.fillStyle=COL[z][sz];L.forEach(l=>{g.beginPath();g.arc(l[0],l[1],l[2],0,TAU);g.fill()});
  g.fillStyle='rgba(255,255,255,.13)';L.slice(0,3).forEach(l=>{g.beginPath();g.arc(l[0]-3,l[1]-3,l[2]*.45,0,TAU);g.fill()})}
 return _BA=cv}
function bushSprite(t){if(t._i===undefined){const x=t[0],y=t[1],r=t[2],zr=zoneAt(x,y),z=zr===2?1:zr===3?2:zr===4?3:0,sz=r>27?1:0;t._i=(z*2+sz)*6+(Math.abs(Math.floor(x*7.3+y*3.1))%6);t._k=r/(sz?30:25)}return t}
function drawBushes(px,py,vw,vh){const oa=ctx.globalAlpha,A=bushAtlas();let al=1;
 for(const t of trees){if(Math.abs(t[0]-px)>vw/2+50||Math.abs(t[1]-py)>vh/2+50)continue;const x=t[0],y=t[1],r=t[2],me=p&&p.hid&&Math.hypot(p.x-x,p.y-y)<r-6;bushSprite(t);
  const a=me?.6:1;if(a!==al){ctx.globalAlpha=a;al=a}const k=t._k,i=t._i,d=BCELL*k;ctx.drawImage(A,(i%8)*BCELL,((i/8)|0)*BCELL,BCELL,BCELL,x-d/2,y-d/2,d,d)}
 ctx.globalAlpha=oa}
function rr(g,x,y,w,h,f){g.fillStyle=f;g.fillRect(x,y,w,h);g.lineWidth=2;g.strokeStyle=OL;g.strokeRect(x,y,w,h)}
function art(g,wi){
 if(wi===24){rr(g,8,-4.5,32,9,'#ffd21e');rr(g,14,-6,12,3,'#2a2c30');rr(g,36,-5,8,10,'#e0a800');rr(g,12,4,6,8,'#5a3d00');rr(g,24,-1.5,8,3,'#fff4a8')}
 if(wi===22){rr(g,8,-2.5,28,5,'#b98a4f');rr(g,30,-4.5,12,9,'#d9a35a');rr(g,6,-3.5,4,7,'#4a3a2a')}
 if(wi===23){rr(g,12,-11,3,22,'#8a5a32');rr(g,10,-12,7,3,'#8a5a32');rr(g,10,9,7,3,'#8a5a32');rr(g,14,-1,26,2,'#e6edf2');rr(g,34,-2.5,8,5,'#cfd8de')}
 if(wi===21){rr(g,6,-3,30,6,'#8a4a2a');rr(g,10,3,10,8,'#c8483a');rr(g,34,-4,10,8,'#3a3d44');rr(g,44,-2,3,4,'#ff9a2e');rr(g,12,-8,8,5,'#d9a93a')}
 if(wi===20){rr(g,10,-3.5,28,7,'#efe6cc');rr(g,14,-5,11,3,'#d9a93a');rr(g,16,-1.5,16,3,'#ff4d2e');rr(g,20,3,4,9,'#efe6cc');rr(g,36,-2,8,4,'#d9a93a')}
 if(wi===1)rr(g,10,-2.5,12,5,'#4a4f58');
 if(wi===19){rr(g,10,-2.5,24,5,'#3d4047');rr(g,12,-3.5,9,7,'#6b4a2a');rr(g,17,2,4,11,'#2a2c30');rr(g,32,-1.5,7,3,'#2a2c30')}
 if(wi===2){rr(g,10,-3,19,6,'#4a4f58');rr(g,15,2,5,7,'#2f3238')}
 if(wi===3){rr(g,10,-2.5,28,5,'#3b3f46');rr(g,16,-4,10,8,'#9b6a3c')}
 if(wi===4){rr(g,10,-2.5,31,5,'#4f5a44');rr(g,20,-5,7,4,'#2f3238')}
 if(wi===5){rr(g,10,-3.5,22,7,'#2b8f86');rr(g,14,-1.5,13,3,'#7ff5ea')}
 if(wi===6){rr(g,10,-2,30,4,'#b03a2e');rr(g,36,-6,4,8,'#b03a2e')}
 if(wi===7){rr(g,14,-2.5,34,5,'#cfd8de');rr(g,10,-8,4,16,'#7a5a2a');rr(g,4,-2,8,4,'#5a4a3a')}
 if(wi===8){rr(g,10,-2.5,26,5,'#46503a');rr(g,16,2,5,7,'#2f3238');rr(g,26,-5,6,3,'#2f3238')}
 if(wi===9){rr(g,10,-3.5,24,7,'#8a8f96');rr(g,10,-1.5,24,3,'#f2c14e');rr(g,10,3,6,7,'#5a4a3a')}
 if(wi===10){rr(g,10,-5,30,10,'#4a4a4e');rr(g,26,-7,14,3.5,'#2c2c30');rr(g,26,-1.75,14,3.5,'#2c2c30');rr(g,26,3.5,14,3.5,'#2c2c30')}
 if(wi===11){rr(g,8,-2,38,4,'#7a5a2a');rr(g,36,-10,11,20,'#9aa0a6');rr(g,40,-10,7,20,'#cfd8de')}
 if(wi===12){rr(g,14,-1.5,40,3,'#e6edf2');rr(g,11,-5,4,10,'#c9a02f');rr(g,4,-2,8,4,'#2b2b2b')}
 if(wi===13){rr(g,8,-5,18,10,'#e0803a');rr(g,26,-3,22,6,'#cfd8de');for(let k=0;k<5;k++)rr(g,28+k*4,-5,2,2,'#4a4a4e');rr(g,6,2,6,8,'#2b2b2b')}
 if(wi===14){rr(g,10,-3,16,6,'#8a8f96');rr(g,14,-5,6,10,'#6a6f76');rr(g,10,3,5,7,'#5a4a3a')}
 if(wi===15){rr(g,10,-2.5,24,5,'#6b5a45');rr(g,16,2,4,7,'#2f3238')}
 if(wi===16){rr(g,10,-2,24,4,'#6b4a2f');rr(g,28,-11,3,22,'#4a3a2a');rr(g,34,-1,10,2,'#cfd8de')}
 if(wi===17){rr(g,10,-2,40,4,'#3a4048');rr(g,20,-6,14,4,'#222')}
 if(wi===18){rr(g,10,-4,26,8,'#e8ecef');rr(g,28,-2.5,8,5,'#d93a8a');rr(g,14,-7,8,3,'#7ff5ea')}}
function healArt(g,s){
 if(s===2){rr(g,-9,-8,18,17,'#e0a030');rr(g,-6,-4,12,8,'#f3efe4');rr(g,-6,-12,12,4,'#c8483a')}
 else if(s===3){rr(g,-13,-9,26,18,'#f3efe4');g.fillStyle='#c8483a';g.fillRect(-2,-7,4,14);g.fillRect(-7,-2,14,4)}
 else{rr(g,-14,-10,28,20,'#2b4a7a');g.fillStyle='#f3efe4';g.fillRect(-2,-7,4,14);g.fillRect(-7,-2,14,4);rr(g,-3,-13,6,4,'#f2c14e')}}
function shoeArt(g,s){g.lineJoin='round';for(const[x,y]of[[-6,-6],[4,3]]){g.save();g.translate(x,y);
 dPoly(g,[[-9,-7],[-2,-7],[0,-1],[9,1],[11,5],[-9,5]],s?['#9aa0a6','#9aa0a6','#4cc25a','#3d8ee8','#a45ce0','#f0b628'][s]:'#c8d4dc','#14100c',1.8);
 g.fillStyle='#f4f1ea';g.fillRect(-9,5,20,3);g.strokeStyle='#14100c';g.lineWidth=1.2;g.strokeRect(-9,5,20,3);g.strokeStyle='#fff';g.beginPath();g.moveTo(-1,-1);g.lineTo(2,-3);g.moveTo(2,0);g.lineTo(5,-1.5);g.stroke();g.restore()}}
function vestArt(g,s){const path=()=>{g.beginPath();[[-12,-13],[-5,-13],[-3,-8],[0,-6],[3,-8],[5,-13],[12,-13],[11,-5],[14,-1],[13,14],[-13,14],[-14,-1],[-11,-5]].forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath()};
 path();g.fillStyle=s?['#7d8a52','#4a6d8c','#5b4a78','#3a3d44'][s-2]:'#bfe0ff';g.fill();g.lineWidth=2.5;g.strokeStyle=s?'#26211c':'#7fc4ff';g.stroke();if(!s)return;
 g.fillStyle='rgba(0,0,0,.4)';g.fillRect(-1,-6,2,20);g.fillStyle=['#b9c48a','#9cc3e0','#b7a0e0','#f2c14e'][s-2];for(let n=0;n<s-1;n++)g.fillRect(-10,9-n*4,7,2.5);g.fillRect(4,5,7,6)}
const ICN={};
function iconFor(k,s,i){const key=k+s+'_'+(i||0);if(ICN[key])return ICN[key];const cv2=document.createElement('canvas');cv2.width=52;cv2.height=34;const g=cv2.getContext('2d');g.lineJoin='round';
 if(k==='w'){const cx=ICX[i]||10+WL[i]/2;g.translate(26-cx,17-(i===24?3:0));art(g,i)}else if(k==='p'){g.translate(26,19);const c=i===0?'#4db4ff':i===2?'#c9a8ff':'#ff5a4a';g.fillStyle='#26211c';g.beginPath();g.arc(0,3,10.5,0,TAU);g.fill();rr(g,-4.5,-13,9,10,'#26211c');g.fillStyle=c;g.beginPath();g.arc(0,3,8.5,0,TAU);g.fill();rr(g,-3,-12,6,8,'rgba(210,225,235,.9)');rr(g,-4,-15,8,4,'#8a5a32');g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(-3,0,2.2,0,TAU);g.fill()}
 else if(k==='y'){g.translate(26,17);g.strokeStyle='#26211c';g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(-12,0);g.lineTo(12,0);g.moveTo(7,0);g.lineTo(7,7);g.moveTo(12,0);g.lineTo(12,6);g.stroke();g.beginPath();g.arc(-12,0,7,0,TAU);g.stroke();g.strokeStyle='#e8f1ff';g.lineWidth=3.5;g.beginPath();g.moveTo(-12,0);g.lineTo(12,0);g.moveTo(7,0);g.lineTo(7,7);g.moveTo(12,0);g.lineTo(12,6);g.stroke();g.beginPath();g.arc(-12,0,7,0,TAU);g.stroke();g.fillStyle='#4db4ff';g.beginPath();g.arc(-12,0,3,0,TAU);g.fill()}
 else if(k==='f'){g.translate(26,17);shoeArt(g,s)}
 else if(k==='a'){g.translate(26,17);vestArt(g,s)}
 else if(k==='g'&&i===5){g.translate(26,19);g.fillStyle='#26211c';g.beginPath();g.arc(0,0,10.5,0,TAU);g.fill();g.fillStyle='#3a3f47';g.beginPath();g.arc(0,0,8.5,0,TAU);g.fill();g.fillStyle='#9aa0a6';g.fillRect(0,-2.2,12,4.4);g.fillStyle='#c9a227';g.beginPath();g.arc(0,0,4,0,TAU);g.fill()}
 else if(k==='g'&&i>=2){g.translate(26,19);const cl=['','','#9aa0a6','#2f5a7a','#c8602a'][i];g.fillStyle='#26211c';g.beginPath();g.arc(0,0,10.5,0,TAU);g.fill();g.fillStyle=cl;g.beginPath();g.arc(0,0,8.5,0,TAU);g.fill();g.fillStyle='#26211c';g.fillRect(-1,-13,2,6);g.fillStyle=i===4?'#ffd24a':'#fff';g.fillRect(-5,-2,10,4)}
 else if(k==='g'){g.translate(26,19);if(i===1){g.fillStyle='#26211c';g.beginPath();g.arc(0,0,11,0,TAU);g.fill();g.fillStyle='#4a4e57';g.beginPath();g.arc(0,0,9,0,TAU);g.fill();g.fillStyle='#2f3238';for(let a=0;a<6;a++){g.save();g.rotate(a*TAU/6);g.fillRect(6,-1.5,5,3);g.restore()}g.fillStyle='#ff3a2a';g.beginPath();g.arc(0,0,3.2,0,TAU);g.fill();g.fillStyle='#ffd0c8';g.beginPath();g.arc(-1,-1,1,0,TAU);g.fill()}
  else{g.fillStyle='#26211c';g.beginPath();g.arc(0,0,10.5,0,TAU);g.fill();g.fillStyle='#4a6b34';g.beginPath();g.arc(0,0,8.5,0,TAU);g.fill();g.fillStyle='#2f4422';g.fillRect(-6,-1,12,2);g.fillRect(-1,-7,2,14);rr(g,-3,-14,6,5,'#9aa0a6');rr(g,2,-13,10,3,'#c9c9c9');g.strokeStyle='#c9a02f';g.lineWidth=2;g.beginPath();g.arc(-6,-12,3,0,TAU);g.stroke()}}else{g.translate(26,17);healArt(g,s)}
 return ICN[key]=cv2}
const iconUrl=it=>{const c2=iconFor(it.k,it.s,it.i);return c2._u||(c2._u=c2.toDataURL())};
function beamLen(x,y,a,rg){const cs=Math.cos(a),sn=Math.sin(a);let L=0;while(L<rg&&!inWall(x+cs*L,y+sn*L))L+=8;return L}
function flash(){if(p&&(p.hf||0)>0){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='rgba(255,255,255,'+(p.hf/.2*.3)+')';ctx.fillRect(0,0,W,H)}}
let zoomK=1;
function draw(){
 zoomK+=((p&&cw().nm==='Sniper'?.85:1)-zoomK)*.1;const z=Math.min(W,H)/520*zoomK,vw=W/z,vh=H/z;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#10120d';ctx.fillRect(0,0,W,H);
 const px=p?p.x:WS/2,py=p?p.y:WS/2;
 ctx.save();ctx.translate(W/2,H/2);ctx.scale(z,z);ctx.translate(-px+(Math.random()-.5)*shake*16,-py+(Math.random()-.5)*shake*16);
 {const gx0=Math.max(0,Math.floor((px-vw/2-16)/16)*16),gy0=Math.max(0,Math.floor((py-vh/2-16)/16)*16),gx1=Math.min(WS,Math.ceil((px+vw/2+16)/16)*16),gy1=Math.min(WS,Math.ceil((py+vh/2+16)/16)*16);if(gx1>gx0&&gy1>gy0)ctx.drawImage(GROUND,gx0/16,gy0/16,(gx1-gx0)/16,(gy1-gy0)/16,gx0,gy0,gx1-gx0,gy1-gy0)}
 ctx.save();ctx.beginPath();ctx.rect(0,0,WS,WS);ctx.clip();ctx.strokeStyle='rgba(30,70,30,.22)';ctx.lineWidth=1.5;ctx.beginPath();for(let gx=Math.floor((px-vw/2)/80)*80;gx<px+vw/2+80;gx+=80){ctx.moveTo(gx,py-vh/2-80);ctx.lineTo(gx,py+vh/2+80)}for(let gy=Math.floor((py-vh/2)/80)*80;gy<py+vh/2+80;gy+=80){ctx.moveTo(px-vw/2-80,gy);ctx.lineTo(px+vw/2+80,gy)}ctx.stroke();ctx.restore();
 drawRegionArt(px,py,vw,vh);drawAltar(px,py,vw,vh);drawKS(px,py,vw,vh);drawHole();const vis=bl.filter(b=>Math.abs(b.x+b.w/2-px)<vw/2+120&&Math.abs(b.y+b.h/2-py)<vh/2+120);
 for(const b of vis){floorB(b);
  for(const q of b.cr){const st=cm[q.id]||0;ctx.fillStyle=st===1?'#55514a':st===2?'#2f6fc2':'#b58a4e';ctx.fillRect(q.x-9,q.y-9,18,18);ctx.lineWidth=2;ctx.strokeStyle=OL;ctx.strokeRect(q.x-9,q.y-9,18,18);if(st!==1){ctx.fillStyle=st===2?'#bfe0ff':'#f2c14e';ctx.fillRect(q.x-3,q.y-3,6,6)}if(st===2){ctx.strokeStyle='rgba(120,190,255,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,15+Math.sin(performance.now()/250)*2,0,TAU);ctx.stroke()}}}
 ctx.fillStyle='#14160f';for(const b of vis)if(b.t<10)for(const q of b.ws)if(!q.d)ctx.fillRect(q.x,q.y,q.w,q.h);
 for(const b of vis)if(b.t>=10)(b.t>=30?snWallsC:b.t>=20?fstWallsC:desWallsC)(b);
 if(p&&!paused){const n=performance.now();if(n<buff.spd||n<buff.rg){ctx.lineWidth=2.5;ctx.globalAlpha=.55+.25*Math.sin(n/160);if(n<buff.spd){ctx.strokeStyle='#6fd0ff';ctx.beginPath();ctx.arc(p.x,p.y,19,0,TAU);ctx.stroke()}if(n<buff.rg){ctx.strokeStyle='#ff5a4a';ctx.beginPath();ctx.arc(p.x,p.y,23,0,TAU);ctx.stroke()}ctx.globalAlpha=1}}
 {const cu=p&&p.sel>=0?p.inv[p.sel]:null;if(cu&&cu.rl>0&&MG[cu.i]){ctx.strokeStyle='#4ac2ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,21,-1.57,-1.57+TAU*(1-cu.rl/MG[cu.i][1]));ctx.stroke()}}
 if(srch){ctx.strokeStyle='#e0803a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(srch.c.x,srch.c.y,16,-1.57,-1.57+TAU*srch.t/1.2);ctx.stroke()}
 for(const f of fps){ctx.fillStyle=(f.z?'rgba(45,75,30,':'rgba(30,24,18,')+(f.t/f.m*.4)+')';ctx.beginPath();ctx.ellipse(f.x,f.y,5,3,f.a,0,TAU);ctx.fill()}
 for(const g of gi){if(g.s>=6){const tt=performance.now()/1000,sn=Math.sin(tt*3.2),pu=.55+.35*sn,R=36+9*sn,gr=ctx.createRadialGradient(g.x,g.y,3,g.x,g.y,R);gr.addColorStop(0,'rgba(255,100,50,'+pu+')');gr.addColorStop(.5,'rgba(255,70,30,'+pu*.4+')');gr.addColorStop(1,'rgba(255,60,20,0)');ctx.globalAlpha=1;ctx.fillStyle=gr;ctx.beginPath();ctx.arc(g.x,g.y,R,0,TAU);ctx.fill()}ctx.globalAlpha=Math.min(1,g.ttl/4);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.arc(g.x,g.y+3,13,0,TAU);ctx.fill();ctx.strokeStyle=IC[g.s];ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(g.x,g.y,13,0,TAU);ctx.stroke();const ic=iconFor(g.k,g.s,g.i);ctx.drawImage(ic,g.x-ic.width*.31,g.y-ic.height*.31,ic.width*.62,ic.height*.62);if(g.n>1){ctx.font='bold 11px sans-serif';ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.strokeText('×'+g.n,g.x+6,g.y+17);ctx.fillText('×'+g.n,g.x+6,g.y+17)}ctx.globalAlpha=1}
 for(const d of DZC){const f=d[3]/100,r=d[2];ctx.fillStyle='rgba(120,200,40,'+(.12+.2*(1-f))+')';ctx.beginPath();ctx.arc(d[0],d[1],r,0,TAU);ctx.fill();ctx.fillStyle='rgba(150,230,50,.35)';ctx.beginPath();ctx.arc(d[0],d[1],r*(1-f),0,TAU);ctx.fill();ctx.strokeStyle='rgba(255,70,40,.9)';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.arc(d[0],d[1],r,0,TAU);ctx.stroke();ctx.setLineDash([])}
 for(const q of zs){drawZ(q);
  }
 drawDying();drawFX();
 ctx.lineWidth=2;ctx.strokeStyle='rgba(25,15,0,.9)';ctx.fillStyle='#fff4a8';for(const b of bs){if(b.nd){drawNP(b);continue}if(b.fi){const d=Math.hypot(b.x-b.x0,b.y-b.y0)/200;ctx.globalAlpha=Math.max(.15,.8-d*.55);ctx.fillStyle=d<.45?'#ffd84a':'#ff6a1e';ctx.beginPath();ctx.arc(b.x,b.y,5+d*12,0,TAU);ctx.fill();ctx.globalAlpha=1;continue}ctx.fillStyle='#fff4a8';ctx.beginPath();ctx.arc(b.x,b.y,3.6,0,TAU);ctx.stroke();ctx.fill()}
 for(const m of beams){ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.a);ctx.globalAlpha=Math.max(0,m.t/.2);ctx.fillStyle='#d93a8a';ctx.fillRect(10,-7,m.L,14);ctx.fillStyle='#bff9ff';ctx.fillRect(10,-4,m.L,8);ctx.fillStyle='#fff';ctx.fillRect(10,-1.5,m.L,3);ctx.restore()}ctx.globalAlpha=1;
 drawTombs();drawBikes();for(const r of RL){const sv=p;p={x:r.x,y:r.y,a:r.a,fl:r.fl,sp:r.sp,wk:r.wk,inv:[{k:'w',s:0,i:r.w||0}],sel:r.w?0:-1,col:(SK[r.c]||SK[0]).col,hair:(SK[r.c]||SK[0]).hair,acc:(SK[r.c]||SK[0]).acc,face:(SK[r.c]||SK[0]).face};{const bk=BKL.find(g=>g.dr===r.id);if(bk){p.x+=Math.cos(bk.a)*8;p.y+=Math.sin(bk.a)*8}}drawP();p=sv;ctx.font='700 12px sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';ctx.strokeText(r.n,r.x,r.y-24);ctx.fillStyle='#fff';ctx.fillText(r.n,r.x,r.y-24);const hp=Math.max(0,Math.min(100,r.hp==null?100:r.hp));ctx.fillStyle='#000';ctx.fillRect(r.x-16,r.y-21,32,5);ctx.fillStyle=hp>50?'#4caf50':hp>25?'#e0a030':'#c8483a';ctx.fillRect(r.x-15,r.y-20,30*hp/100,3)}
 if(p){if(performance.now()<buff.inv)ctx.globalAlpha=.35;const sx=p.x,sy=p.y;if(RD&&RD.s==='d'&&MB){p.x+=Math.cos(MB.a)*8;p.y+=Math.sin(MB.a)*8}if(!RD||RD.s!=='d')drawAim();drawP();p.x=sx;p.y=sy;ctx.globalAlpha=1}drawBushes(px,py,vw,vh);drawTrunks(px,py,vw,vh);
 for(const b of vis){const o=p&&inside(p,b);ctx.globalAlpha=o?.12:1;roofB(b)}ctx.globalAlpha=1;drawSnowfall(px,py,vw,vh);
 ctx.globalAlpha=1;drawShopSign();drawBoom();
 for(const b of vis)for(const d of b.dr){
  ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.r);if(b.t>=10){(b.t>=30?snDoor:b.t>=20?fstDoor:desArch)();ctx.restore();continue}
  ctx.fillStyle='#3a3630';ctx.fillRect(-24,-10,48,10);
  ctx.fillStyle='#e0803a';ctx.fillRect(-27,-11,3,13);ctx.fillRect(24,-11,3,13);
  ctx.fillStyle='#c9a96a';ctx.fillRect(-27,2,54,8);
  ctx.fillStyle='#7a5a2a';ctx.beginPath();ctx.moveTo(-8,8);ctx.lineTo(0,3);ctx.lineTo(8,8);ctx.lineTo(0,6.5);ctx.fill();ctx.restore()}
 ctx.restore();
 for(const k of['l','r']){const s=st[k],hx=k==='l'?W*.2:W*.8,hy=H*.72;ctx.strokeStyle='rgba(236,230,210,.3)';ctx.lineWidth=3;ctx.beginPath();
  if(s.id===null){ctx.arc(hx,hy,44,0,TAU);ctx.stroke()}else{ctx.arc(s.ox,s.oy,50/SENS,0,TAU);ctx.stroke();const d=Math.hypot(s.x-s.ox,s.y-s.oy),m=Math.min(d,50/SENS)/(d||1);ctx.fillStyle='rgba(236,230,210,.35)';ctx.beginPath();ctx.arc(s.ox+(s.x-s.ox)*m,s.oy+(s.y-s.oy)*m,22,0,TAU);ctx.fill()}}}
function bm(g,b,s,mn){if(b.rd){g.beginPath();g.arc(b.rd.cx*s,b.rd.cy*s,Math.max(mn/2,b.rd.R*s),0,TAU);g.fill()}else if(b.cells)for(const[r,k]of b.cells)g.fillRect((b.x+k*b.S)*s,(b.y+r*b.S)*s,Math.max(mn,b.S*s),Math.max(mn,b.S*s));else g.fillRect(b.x*s,b.y*s,Math.max(mn,b.w*s),Math.max(mn,b.h*s))}
function mini(){
 const g=mm.getContext('2d'),s=216/WS;g.clearRect(0,0,216,216);g.fillStyle='rgba(22,24,19,.9)';g.fillRect(0,0,216,216);
 g.fillStyle='#3d6b2f';g.fillRect(0,0,108,108);g.fillStyle='#8c7440';g.fillRect(108,0,108,108);g.fillStyle='#24472a';g.fillRect(0,108,108,108);g.fillStyle='#6e8896';g.fillRect(108,108,108,108);
 g.fillStyle='#b9b09a';bl.forEach(b=>bm(g,b,s,3));g.fillStyle='#ffcc33';bm(g,SHOP,s,8);
 if(p){g.fillStyle='#fff';g.beginPath();g.arc(p.x*s,p.y*s,5,0,TAU);g.fill()}
 HM.forEach(h=>{g.fillStyle='#ff7a1a';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.arc(h[0]*s,h[1]*s,3.5,0,TAU);g.fill();g.stroke()});
 RL.forEach(r=>{g.fillStyle=PC[r.c||0];g.beginPath();g.arc(r.x*s,r.y*s,5,0,TAU);g.fill()});
 MYG.forEach(t=>graveMark(g,t[0]*s,t[1]*s,.75))}
const setH=(el,h)=>{if(el._h!==h){el._h=h;el.innerHTML=h}};
function hud(){if(!p)return;slotUI();$('hp').style.width=Math.max(0,p.hp)+'%';
 setH($('inf'),'<span class="st">'+(cw()!==WP[0]?stars(cw().st)+' ':'')+'</span>'+heldName()+ammoTxt()+'<br>'+TX('kills')+' '+kills+' · <b style="color:#ffcc33">'+gold+' G</b>'+buffTxt());
 setH($('zone'),TX('z'+zoneAt(p.x,p.y))+(WSK?'<br>'+(RL.length+1)+' '+TX('online'):'')+(p.hid?'<br>'+TX('hidden'):''));
 const c=paused?null:nearCrate(),na=!c&&!paused&&!BS&&nearAlt(),nk=!c&&!na&&!paused&&nearKS();$('lootb').style.display=(c&&!srch)||na||nk||nearShop()?'block':'none';{const lb=$('lootb'),hk=nk&&hasKey(),tx=na?(ALTD?TX('acd').replace('{s}',ALTD):TX('awaken')):nk?(hk?TX('ukey'):TX('nokey')):nearShop()?TX('shop'):TX('search');if(lb.textContent!==tx)lb.textContent=tx;lb.style.opacity=(na&&ALTD)||(nk&&!hk)?.6:1}bikeUI();bossUI();shopUI();
 const gx=paused?-1:nearG();$('swapb').style.display=gx>=0?'block':'none';if(gx>=0){const nm=it=>stars(it.s)+' '+inm(it),t=swapTarget(gi[gx]);setH($('swapb'),TX('replace').replace('{a}',t>=0?nm(p.inv[t]):TX('item')).replace('{b}',nm(gi[gx])))}
 $('fullb').style.display=fullNow&&!paused?'block':'none';
 }
let _fr=0,last=0,_sl=0,_sn=0;function loop(t){{const r=t-last;if(r>0&&r<250&&p&&!paused){_sl+=r;if(++_sn>=90){if(_sl/_sn>36&&dpr>.65){QS*=.85;rs()}_sl=0;_sn=0}}}const dt=Math.min(.05,(t-last)/1000||0);last=t;RL=remotes(dt);net(dt);for(let i=beams.length-1;i>=0;i--){beams[i].t-=dt;if(beams[i].t<=0)beams.splice(i,1)}if(p&&!paused&&!mapOpen)update(dt);fxUpd(dt);draw();flash();if((_fr=(_fr+1)%4)===0)mini();if(mapOpen)bigmap();hud();requestAnimationFrame(loop)}
