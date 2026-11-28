/* draw */
function oldP(){const w=cw(),wi=WP.indexOf(w),sw=Math.sin(p.wk||0)*Math.min(1,p.sp||0),fl=(p.fl||0)>0;
 ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(1,3,13,9,0,0,TAU);ctx.fill();ctx.rotate(p.a);
 
 
 ctx.fillStyle='#d9692b';ctx.beginPath();ctx.arc(0,0,12.5,0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=2;ctx.stroke();
 const L=[0,12,16,26,28,20][wi],hc=['#000','#2f3238','#2f3238','#6b4a2f','#3f4636','#2b8f86'][wi];
 ctx.strokeStyle='#e8c39a';ctx.lineWidth=4.5;ctx.lineCap='round';
 if(wi){ctx.fillStyle=hc;ctx.fillRect(7,-2.2,L,4.4);if(wi===2)ctx.fillRect(14,2,4,6);if(wi===4){ctx.fillStyle='#222';ctx.fillRect(16,-4,7,2.5)}if(wi===5){ctx.fillStyle='#7ff5ea';ctx.fillRect(9,-1,L-4,2)}
  ctx.beginPath();ctx.moveTo(3,-9);ctx.lineTo(Math.min(L-4,16),-1);ctx.moveTo(3,9);ctx.lineTo(10,1.5);ctx.stroke();ctx.fillStyle='#e8c39a';[[Math.min(L-4,16),-1],[10,1.5]].forEach(h=>{ctx.beginPath();ctx.arc(h[0],h[1],4.2,0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.2;ctx.stroke()})}
 else{ctx.beginPath();ctx.moveTo(3,-9);ctx.lineTo(fl?24:17,-5);ctx.moveTo(3,9);ctx.lineTo(17,5);ctx.stroke();ctx.fillStyle='#e8c39a';[[fl?24:17,-5],[17,5]].forEach(h=>{ctx.beginPath();ctx.arc(h[0],h[1],5,0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.2;ctx.stroke()})}
 ctx.fillStyle='#3b2a20';ctx.beginPath();ctx.arc(0,0,7,0,TAU);ctx.fill();ctx.fillStyle='#e8c39a';ctx.beginPath();ctx.arc(2.5,0,4.5,0,TAU);ctx.fill();
 if(fl&&wi){ctx.fillStyle=wi===5?'#7ff5ea':'#ffd36b';ctx.beginPath();ctx.arc(7+L+3,0,6,0,TAU);ctx.fill()}
 ctx.restore()}
function oldZ(q){const t=performance.now()/1000,sw=Math.sin(t*(q.ag?8:3)+q.ph),zn=q.zn||1,sk=['','#a3bd8a','#8fa57c','#7e8f6f'][zn],cl=['','#6b5f4c','#5e4b4b','#4b3a3d'][zn],h=q.hit>0;
 ctx.save();ctx.translate(q.x,q.y);ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(1,3,12,8,0,0,TAU);ctx.fill();ctx.rotate(q.a);
 
 ctx.fillStyle=h?'#fff':cl;ctx.beginPath();ctx.arc(0,0,12.5,0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=2;ctx.stroke();
 ctx.fillStyle='rgba(120,20,20,.65)';ctx.fillRect(-5,-4,4,3);
 ctx.strokeStyle=h?'#fff':sk;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(2,-9);ctx.lineTo(20+sw*2,-6);ctx.moveTo(2,9);ctx.lineTo(20-sw*2,6);ctx.stroke();
 ctx.fillStyle=h?'#fff':sk;[[20+sw*2,-6],[20-sw*2,6]].forEach(hd=>{ctx.beginPath();ctx.arc(hd[0],hd[1],4.5,0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.2;ctx.stroke()});
 ctx.fillStyle=h?'#fff':sk;ctx.beginPath();ctx.arc(2,sw*1.5,7,0,TAU);ctx.fill();
 ctx.fillStyle=q.ag?'#e23a2e':'#6a5a2a';ctx.fillRect(5,sw*1.5-4,2.5,2.2);ctx.fillRect(5,sw*1.5+1.8,2.5,2.2);
 ctx.restore();
 if(q.hp<q.mh){ctx.fillStyle='#000';ctx.fillRect(q.x-12,q.y-22,24,3);ctx.fillStyle='#c8483a';ctx.fillRect(q.x-12,q.y-22,24*q.hp/q.mh,3)}}
const OL='#26211c';
function circ(x,y,r,f,lw){ctx.fillStyle=f;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.lineWidth=lw||2.5;ctx.strokeStyle=OL;ctx.stroke()}
function rct(x,y,w,h,f){ctx.fillStyle=f;ctx.fillRect(x,y,w,h);ctx.lineWidth=2;ctx.strokeStyle=OL;ctx.strokeRect(x,y,w,h)}
const WL=[0,12,19,28,31,22,0,0,26,24,30,0,0,0,16,24,34,40,36,28,38,30,0,30,34],ICX={22:26,6:25,7:26,11:27,12:29,13:27};
const PSC=document.createElement('canvas');PSC.width=PSC.height=480;const PSG=PSC.getContext('2d');
/* aim guide whenever you hold a gun (only drawn for yourself): stops at walls or at the weapon's range. Dark edge keeps it visible on snow. */
function drawAim(){const w=cw();if(paused||p.hp<=0||w.me)return;const cx=Math.cos(p.a),cy=Math.sin(p.a),R=w.rg||400;let d=8;while(d<R&&!inWall(p.x+cx*d,p.y+cy*d,1))d+=6;d=Math.min(d,R);if(d<=34)return;
 ctx.save();ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x+cx*32,p.y+cy*32);ctx.lineTo(p.x+cx*d,p.y+cy*d);ctx.strokeStyle='rgba(20,30,40,.2)';ctx.lineWidth=4.5;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=2;ctx.stroke();ctx.restore()}
function drawP(){if(!p||!inSmoke(p.x,p.y)){drawP0();return}const main=ctx;PSG.setTransform(1,0,0,1,0,0);PSG.globalCompositeOperation='source-over';PSG.globalAlpha=1;PSG.clearRect(0,0,480,480);PSG.setTransform(2,0,0,2,240-p.x*2,240-p.y*2);ctx=PSG;try{drawP0()}finally{ctx=main}PSG.setTransform(1,0,0,1,0,0);PSG.globalCompositeOperation='source-atop';PSG.fillStyle='#14161a';PSG.fillRect(0,0,480,480);const a=ctx.globalAlpha;ctx.globalAlpha=a*.9;ctx.drawImage(PSC,p.x-120,p.y-120,240,240);ctx.globalAlpha=a}
function drawP0(){const w=cw(),wi=WP.indexOf(w),fl=(p.fl||0)>0,L=WL[wi],me=!!(w.me&&wi>0);
 ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.arc(2,4,14,0,TAU);ctx.fill();ctx.rotate(p.a);ctx.lineJoin='round';
 if(wi&&!me){art(ctx,wi);if(wi===10&&(p.spin||0)>.3){ctx.fillStyle='rgba(255,170,60,'+(p.spin*.6)+')';ctx.fillRect(38,-7,6,14)}}
 circ(0,0,14,(p.hf||0)>0?'#fff':(p.col||'#d9692b'));const IM=p.face?FIMG[p.face-1]:null;if(IM&&IM.complete&&IM.naturalWidth){if((p.hf||0)<=0){ctx.save();ctx.rotate(-Math.PI/2);ctx.drawImage(IM,-14,-14,28,28);ctx.restore()}ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.lineWidth=2;ctx.strokeStyle='#26211c';ctx.stroke()}else if(!p.face){circ(-1,0,8.5,p.hair||'#3b2a20',2);circ(3,0,3.8,'#e8c39a',1.5)}drawAcc(ctx,p.acc);
 if(me){const t=Math.max(0,(p.fl||0)/.18),ang=fl?(1-t)*2-1:-.4;ctx.save();ctx.rotate(ang);art(ctx,wi);circ(11,-3,4.6,'#e8c39a',2.2);circ(8,3,4.6,'#e8c39a',2.2);ctx.restore()}
 else if(wi){circ(13,-3,4.6,'#e8c39a',2.2);circ(Math.min(10+L-5,26),3,4.6,'#e8c39a',2.2)}
 else{circ(fl?27:17,-8,5,'#e8c39a',2.2);circ(17,8,5,'#e8c39a',2.2)}
 {const hc=p.sel>=0?p.inv[p.sel]:null;if(hc&&hc.k==='g')circ(21,-8,6.5,['#4a6b34','#4a4e57','#9aa0a6','#2f5a7a','#c8602a','#3a3f47'][hc.i]||'#4a6b34',2)}
 if(fl&&wi&&wi!==18&&!me){const x=10+L;ctx.fillStyle=wi===5||wi===18?'#7ff5ea':wi===9?'#ff7a30':wi===20||wi===24?'#ffe08a':'#ffb43a';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+7,-5);ctx.lineTo(x+(wi===9?22:16),0);ctx.lineTo(x+7,5);ctx.closePath();ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle=OL;ctx.stroke()}
 ctx.restore()}
/* death fade: a killed enemy turns red and fades out over 0.3 s */
let dying=[];const DT=.3,DC=document.createElement('canvas');DC.width=DC.height=240;const DG=DC.getContext('2d');
function drawDying(){for(const d of dying){const main=ctx;DG.setTransform(1,0,0,1,0,0);DG.globalCompositeOperation='source-over';DG.clearRect(0,0,240,240);DG.setTransform(2,0,0,2,120-d.q.x*2,120-d.q.y*2);
 ctx=DG;try{drawZ(d.q)}finally{ctx=main}
 DG.setTransform(1,0,0,1,0,0);DG.globalCompositeOperation='source-atop';DG.fillStyle='rgba(235,20,10,.75)';DG.fillRect(0,0,240,240);
 const a=ctx.globalAlpha;ctx.globalAlpha=Math.max(0,1-d.t/DT);ctx.drawImage(DC,d.q.x-60,d.q.y-60,120,120);ctx.globalAlpha=a}}
function bmBurst(b,sx,sy){const w=b.bm,x=b.x-sx,y=b.y-sy;snd('square',300,70,.12,.12);for(let k=0;k<w.bn;k++){const a=b.a0+k/w.bn*Math.PI*2,sp=w.sp||700,q={x,y,x0:x,y0:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:w.br/sp,rg:w.br,fo:w.fo,pn:w.bp||0,hz:[],d:b.d,nd:1};if(b.mine)q.mine=1;else q.rm=1;bs.push(q)}}
function drawNP(b){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.big?b.a0:Math.atan2(b.vy,b.vx));const sc=b.big?2:.8;ctx.scale(sc,sc);ctx.fillStyle='#ffd21e';ctx.strokeStyle='#5a3d00';ctx.lineWidth=2/sc*(b.big?1.4:1.2);ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.fill();if(BFACE.complete&&BFACE.naturalWidth){ctx.save();ctx.beginPath();ctx.arc(0,0,7,0,TAU);ctx.clip();ctx.rotate(-Math.PI/2);ctx.globalAlpha=.9;ctx.drawImage(BFACE,-8,-8,16,16);ctx.globalAlpha=.5;ctx.fillStyle='#ffd21e';ctx.fillRect(-8,-8,16,16);ctx.restore()}ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.stroke();ctx.restore()}
function drawNurlan(q){const t=performance.now()/1000,po=Math.round(q.fz||0),h=q.hit>0||q.hl>0,R=q.rs||3.8,pr=q.fz>=6&&q.fz<7?q.fz-6:-1,mx=(c,k)=>{const n=parseInt(c.slice(1),16),f=v=>Math.round(v+(255-v)*k);return'rgb('+f(n>>16)+','+f(n>>8&255)+','+f(n&255)+')'},SK2=pr>=0?mx('#e8c39a',pr):'#e8c39a',DK=pr>=0?mx('#26211c',pr):'#26211c';
 const sh=pr>=0?(2+pr*9)*R/3.8:0;ctx.save();ctx.translate(q.x+(Math.random()-.5)*sh*2,q.y+(Math.random()-.5)*sh*2);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(8,14,15*R,12*R,0,0,TAU);ctx.fill();
 if(po===3||po===4){ctx.strokeStyle=po===4?'rgba(255,225,150,.55)':'rgba(255,225,150,'+(.2+.25*Math.abs(Math.sin(t*10)))+')';ctx.lineWidth=po===4?6:3;ctx.beginPath();ctx.arc(0,0,190,0,TAU);ctx.stroke()}
 ctx.scale(R,R);ctx.rotate(po===4?t*15:q.a);ctx.lineJoin='round';ctx.lineCap='round';
 const sw=q.ag?Math.sin(t*6):0;let A1,A2;
 if(po===1){A1=[3,-17];A2=[3,17]}else if(po===2){A1=[27,-6];A2=[27,6]}else if(po===3||po===4){A1=[0,-30];A2=[0,30]}else if(po===5){A1=[19,-13];A2=[19,13]}else if(po===8){A1=[12,-22];A2=[12,22]}else{A1=[16+sw*4,-12];A2=[16-sw*4,12]}
 for(const[hx,hy]of[A1,A2]){const sy=hy<0?-9:9;ctx.strokeStyle=DK;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(hx,hy);ctx.stroke();ctx.strokeStyle=h?'#fff':SK2;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(hx,hy);ctx.stroke();ctx.fillStyle=h?'#fff':SK2;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(hx,hy,5,0,TAU);ctx.fill();ctx.stroke()}
 if(po===1){ctx.fillStyle='rgba(255,60,40,'+(.25+.2*Math.sin(t*30))+')';ctx.beginPath();ctx.arc(0,0,19,0,TAU);ctx.fill()}
 ctx.fillStyle=SK2;ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.fill();
 if(BFACE.complete&&BFACE.naturalWidth){ctx.save();ctx.rotate(-Math.PI/2);ctx.drawImage(BFACE,-14,-14,28,28);ctx.restore()}
 ctx.lineWidth=2;ctx.strokeStyle=DK;ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.stroke();
 if(h){ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.fill()}
 if(pr>0){ctx.fillStyle='rgba(255,255,255,'+Math.min(1,pr*1.05)+')';ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.fill()}
 if(po===5){ctx.fillStyle='rgba(140,220,60,.85)';ctx.beginPath();ctx.arc(15,0,4+Math.random()*3,0,TAU);ctx.fill()}
 ctx.restore()}
function drawHunter(q){const t=performance.now()/1000,h=q.hit>0||q.hl>0,sw=Math.sin(t*(q.ag?9:2)+(q.ph||0))*1.5;
 ctx.save();ctx.translate(q.x,q.y);ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.arc(2,4,14,0,TAU);ctx.fill();ctx.rotate(q.a);ctx.lineJoin='round';ctx.lineCap='round';
 rr(ctx,8,-2.5,30,5,h?'#fff':'#2a2a2e');rr(ctx,4,-4,13,8,h?'#fff':'#7a4a24');
 ctx.strokeStyle=OL;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(4,-9);ctx.lineTo(24+sw,-3);ctx.moveTo(4,9);ctx.lineTo(15-sw,3);ctx.stroke();
 ctx.strokeStyle=h?'#fff':'#a8561e';ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(4,-9);ctx.lineTo(24+sw,-3);ctx.moveTo(4,9);ctx.lineTo(15-sw,3);ctx.stroke();
 circ(0,0,14,h?'#fff':'#6e4a26');
 if(!h){ctx.fillStyle='#e8661c';ctx.fillRect(-9,-12,4,24);ctx.fillRect(-1,-13,4,26)}
 circ(0,0,8,h?'#fff':'#3f5b2b',2);if(!h){ctx.fillStyle='#2e4420';ctx.fillRect(3,-6,6,12);ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.strokeRect(3,-6,6,12)}
 if(q.fz>0){ctx.fillStyle='#ffd24a';ctx.beginPath();ctx.arc(42,0,6+Math.random()*3,0,TAU);ctx.fill();ctx.fillStyle='#fff6c8';ctx.beginPath();ctx.arc(41,0,3,0,TAU);ctx.fill()}
 ctx.restore();
 if(q.hp<q.mh){ctx.fillStyle='#000';ctx.fillRect(q.x-20,q.y-26,40,6);ctx.fillStyle='#e8661c';ctx.fillRect(q.x-19,q.y-25,38*Math.max(0,q.hp/q.mh),4)}}
/* yeti (kd 17): big fluffy white ape. fz 1 = dash wind-up (shows the path), 2 = dashing.
   Each fur layer is ONE path of many tufts (one stroke + one fill), so it stays cheap with several on screen. */
function fluff(L,fill,lw){ctx.beginPath();for(const[x,y,r]of L){ctx.moveTo(x+r,y);ctx.arc(x,y,r,0,TAU)}if(lw){ctx.strokeStyle=OL;ctx.lineWidth=lw;ctx.stroke()}ctx.fillStyle=fill;ctx.fill()}
function ringF(L,cx,cy,rx,ry,n,r){for(let i=0;i<n;i++){const a=i/n*TAU;L.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry,r])}L.push([cx,cy,Math.min(rx,ry)+1]);return L}
const YB=ringF([],-3,0,10,15,18,4.2),YS=ringF([],-5,0,6,10,11,3.2),YH=ringF([],6,0,7,7.5,12,3);
function drawYeti(q){const t=performance.now()/1000,po=Math.round(q.fz||0),h=q.hit>0||q.hl>0,R=q.rs||1.6,sw=Math.sin(t*(q.ag?8:3)+q.ph),fur=h?'#fff':'#f7f4ea',sh=po===1?1.6:0;
 ctx.save();ctx.translate(q.x,q.y);ctx.lineJoin='round';ctx.lineCap='round';
 if(po===1){ctx.save();ctx.rotate(q.a);ctx.fillStyle='rgba(230,60,40,'+(.16+.1*Math.abs(Math.sin(t*14)))+')';ctx.fillRect(14,-20,280,40);ctx.strokeStyle='rgba(210,40,30,.8)';ctx.lineWidth=2;ctx.strokeRect(14,-20,280,40);ctx.restore()}
 if(sh)ctx.translate((Math.random()-.5)*sh*2,(Math.random()-.5)*sh*2);
 ctx.fillStyle='rgba(20,40,60,.28)';ctx.beginPath();ctx.ellipse(3,7,15*R,16*R,0,0,TAU);ctx.fill();ctx.rotate(q.a);ctx.scale(R,R);
 if(po===2){ctx.strokeStyle='rgba(120,170,210,.7)';ctx.lineWidth=2;ctx.beginPath();for(const y of[-12,0,12]){ctx.moveTo(-21,y);ctx.lineTo(-37,y)}ctx.stroke()}
 const A=po===1?[[3,-21],[3,21]]:po===2?[[23,-10],[23,10]]:[[14+sw*3,-16],[14-sw*3,16]],AF=[];
 for(const[x,y]of A){const s=y<0?-13:13;for(let k=1;k<=4;k++){const u=k/4;AF.push([x*u*.85,s+(y-s)*u,5.8-k*.35],[x*u*.85-2.5,s+(y-s)*u+(y<0?-2.5:2.5),3])}}
 fluff(AF,fur,2.8);
 for(const[x,y]of A){const o=y<0?-1:1;fluff([[x,y,4.8],[x+3.5,y-3,2.2],[x+4.5,y,2.2],[x+3.5,y+3,2.2]],h?'#fff':'#b98e73',2.2);fluff([[x-4,y+o*2.5,3],[x-4,y-o*2.5,3]],fur,0)}
 fluff(YB,fur,2.8);fluff(YS,h?'#fff':'#e6e1d3',0);
 ctx.strokeStyle='rgba(150,138,115,.55)';ctx.lineWidth=1.1;ctx.beginPath();for(const[x,y]of[[-10,-9],[-12,0],[-10,9],[-5,-13],[-5,13],[-6,-4],[-6,5]]){ctx.moveTo(x+2,y-2);ctx.lineTo(x-1.5,y);ctx.lineTo(x+2,y+2)}ctx.stroke();
 fluff(YH,fur,2.4);
 ctx.save();ctx.translate(12,0);ctx.scale(1.35,1.3);ctx.translate(-10.5,0);
 ctx.fillStyle=h?'#fff':'#b9876a';ctx.beginPath();ctx.ellipse(10.5,0,6,7.6,0,0,TAU);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1.4;ctx.stroke();
 fluff([[5.4,-5,2.2],[4.8,-1.7,2.1],[4.8,1.7,2.1],[5.4,5,2.2]],fur,0);
 ctx.strokeStyle='#4a2c1c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(8.2,-5.2);ctx.lineTo(10,-.9);ctx.moveTo(8.2,5.2);ctx.lineTo(10,.9);ctx.stroke();
 const ey=q.ag?'#d62f22':'#26180f';dCirc(ctx,10.8,-3,1.25,ey);dCirc(ctx,10.8,3,1.25,ey);
 ctx.fillStyle='#5a382a';ctx.beginPath();ctx.ellipse(12.8,0,1.4,2.2,0,0,TAU);ctx.fill();
 ctx.fillStyle='#3a160f';ctx.beginPath();ctx.ellipse(15,0,po?1.7:.8,po?3.4:2.8,0,0,TAU);ctx.fill();
 ctx.restore();
 ctx.restore();
 if(q.hp<q.mh){ctx.fillStyle='#000';ctx.fillRect(q.x-18,q.y-37,36,5);ctx.fillStyle='#c8483a';ctx.fillRect(q.x-17,q.y-36,34*Math.max(0,q.hp/q.mh),3)}}
function drawZ(q){if(q.kd===14){drawNurlan(q);return}if(q.kd===15){drawNurlan(q);if(q.hp<q.mh){ctx.fillStyle='#000';ctx.fillRect(q.x-14,q.y-26,28,5);ctx.fillStyle='#e8c84a';ctx.fillRect(q.x-13,q.y-25,26*Math.max(0,q.hp/q.mh),3)}return}if(q.kd===13){drawHunter(q);return}if(q.kd===17){drawYeti(q);return}if(q.kd>=9&&q.kd<16){drawWorm(q);return}if(q.kd===7){drawBushShape(q.x,q.y,20,1);return}const t=performance.now()/1000,sw=Math.sin(t*(q.ag?8:3)+q.ph),zn=q.zn||1,h=q.hit>0||q.hl>0,bc=q.kd===18?'#b8453a':q.kd===16?'#4fb8e8':q.kd===5?'#c9a24e':q.kd===6?'#d7ecf7':q.kd===8?'#4f8a2e':q.kd===1?'#4a8fc9':q.kd===2?'#2d5a33':q.kd===3?'#8f9e3a':q.kd===4?'#c0502a':['','#7fa56b','#6f8f5c','#5f7a52','#8fb0bc'][zn],sk=q.kd===18?'#b9d6e2':q.kd===16?'#a6e6fa':q.kd===5?'#e0c27a':q.kd===6?'#f2fbff':q.kd===8?'#7fb85a':q.kd===1?'#86bde6':q.kd===2?'#3d6e44':q.kd===3?'#c2d268':q.kd===4?'#e08a5a':['','#9fc48a','#8cb078','#7ba068','#b9d3dd'][zn],hx=20+sw*2,hy=20-sw*2;
 ctx.save();ctx.translate(q.x,q.y);{const k=(q.rs||1)*(q.kd===4&&q.fz>0?1+.12*Math.sin(t*30):1);ctx.scale(k,k)}ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.arc(2,4,14,0,TAU);ctx.fill();ctx.rotate(q.a);ctx.lineJoin='round';ctx.lineCap='round';
 ctx.strokeStyle=OL;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(6,-9);ctx.lineTo(hx,-9);ctx.moveTo(6,9);ctx.lineTo(hy,9);ctx.stroke();
 ctx.strokeStyle=h?'#fff':sk;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(6,-9);ctx.lineTo(hx,-9);ctx.moveTo(6,9);ctx.lineTo(hy,9);ctx.stroke();
 circ(0,0,14,(h||(q.kd===4&&q.fz>0&&Math.sin(t*28)>0))?'#fff':bc);
 if(q.kd===18){dCirc(ctx,2,0,10.5,h?'#fff':'#f4efe4',OL,1.6);dCirc(ctx,3.5,0,7.5,h?'#fff':'#8fb4c4')}
 if(q.kd===16){for(const[x,y,a]of[[-9,-9,-2.4],[-13,0,Math.PI],[-9,9,2.4]])dPoly(ctx,[[x+Math.cos(a+1.57)*4.5,y+Math.sin(a+1.57)*4.5],[x+Math.cos(a)*12,y+Math.sin(a)*12],[x-Math.cos(a+1.57)*4.5,y-Math.sin(a+1.57)*4.5]],h?'#fff':'#e4fbff','#1f6f9a',1.6);dPoly(ctx,[[-2,-6],[3,0],[-2,6],[-6,0]],'#d6f6ff','#1f6f9a',1.2)}
 if(q.kd===3){circ(11,0,5.5+Math.sin(t*7+q.ph),'#b8ff3a',2);ctx.fillStyle='rgba(30,60,0,.6)';ctx.beginPath();ctx.arc(11,0,2.2,0,TAU);ctx.fill()}
 if(q.kd===4){const lit=q.fz>0&&Math.sin(t*30)>0;for(const yy of[-8,-2.5,3]){ctx.fillStyle=lit?'#fff':'#d8332a';ctx.fillRect(-7,yy,14,4.5);ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.strokeRect(-7,yy,14,4.5)}ctx.fillStyle='#ffd24a';ctx.beginPath();ctx.arc(-9,0,2.5+Math.sin(t*25),0,TAU);ctx.fill()}
 ctx.fillStyle=h?'#ddd':'rgba(40,20,20,.35)';ctx.beginPath();ctx.arc(-4,3,5,0,TAU);ctx.fill();
 ctx.fillStyle=q.ag?'#e23a2e':'#d8cf8a';ctx.beginPath();ctx.arc(8,-4.5,2.6,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(8,4.5,2.6,0,TAU);ctx.fill();
 circ(hx,-9,5,h?'#fff':sk,2.2);circ(hy,9,5,h?'#fff':sk,2.2);
 if(q.kd===18){dCirc(ctx,hy+5,9,5.5,'#fff',OL,1.6);dCirc(ctx,hy+6.5,10.5,2,'#c3dcee')}
 ctx.restore();
 if(q.hp<q.mh){const o=24*(q.rs||1);ctx.fillStyle='#000';ctx.fillRect(q.x-12,q.y-o,24,3);ctx.fillStyle='#c8483a';ctx.fillRect(q.x-12,q.y-o,24*q.hp/q.mh,3)}}
function mkZ(z){const r=Math.random(),bg=.06+z*.06,k=r<bg?2:r<bg+.22?1:0,hv=.8+Math.random()*.45,b=28+z*24,s=(46+z*12+Math.random()*14)*1.15,d=6+z*3;
 if(k===1)return{kd:1,rs:1,hp:b*.7*hv,sp:s*1.5,dm:d};
 if(k===2)return{kd:2,rs:1.3,hp:b*2*hv,sp:s,dm:d*1.3};
 return{kd:0,rs:1,hp:b*hv,sp:s,dm:d}}
function noise(x,y){for(const z of zs){if(Math.hypot(z.x-x,z.y-y)<280&&!z.los){z.ag=1;z.lost=-2;z.lx=x;z.ly=y}}}
const FCC=['#8f7048','#777b80','#cdbf9f','#a08358'],RCC=['#9b5a3c','#4f6a7a','#6a8a4f','#a86a4a'];
function roofCells(b){const S=b.S,cs=b.cs;
 for(const[r,c]of b.cells){const x=b.x+c*S,y=b.y+r*S;ctx.fillStyle=RCC[b.t-6];ctx.fillRect(x,y,S,S);ctx.fillStyle=(r+c)%2?'rgba(255,255,255,.08)':'rgba(0,0,0,.1)';ctx.fillRect(x,y,S,S);ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1.5;ctx.strokeRect(x,y,S,S)}
 const f=b.cells[0];ctx.fillStyle='#4a3a32';ctx.fillRect(b.x+f[1]*S+S*.6,b.y+f[0]*S+S*.2,16,16);
 ctx.strokeStyle=OL;ctx.lineWidth=3;ctx.beginPath();
 for(const[r,c]of b.cells){const x=b.x+c*S,y=b.y+r*S;
  if(!cs.has(r*20+c-1)){ctx.moveTo(x,y);ctx.lineTo(x,y+S)}if(!cs.has(r*20+c+1)){ctx.moveTo(x+S,y);ctx.lineTo(x+S,y+S)}
  if(!cs.has((r-1)*20+c)){ctx.moveTo(x,y);ctx.lineTo(x+S,y)}if(!cs.has((r+1)*20+c)){ctx.moveTo(x,y+S);ctx.lineTo(x+S,y+S)}}
 ctx.stroke()}
