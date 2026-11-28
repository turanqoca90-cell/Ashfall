/* desert buildings (t>=10): sandstone, rugs, mosaics, thrones, domes, turrets, awnings, palms, camels and fruit carts */
const DPAL=['#d9b97a','#cfa968','#e0c48c','#c89d5e'],RUG=[['#9b2d30','#e0b04a'],['#2d4f8f','#e8d9a0'],['#2f7a5f','#e8c860'],['#6a2f7f','#f0c0d0']],DOME=[['#6fe0d8','#1c7b84'],['#7aa2f5','#2a4ea8'],['#f08a56','#a63c1c'],['#f6dc78','#b58a1c']],AWN=[['#c8483a','#f6efe0'],['#2d6fb8','#f2c14e'],['#2f8a5f','#f6efe0']];
const cellCh=(b,r,c)=>b.kd.get(r*20+c),isOpen=ch=>ch==='O'||ch==='P'||ch==='F';
function dPoly(g,pts,f,s,lw){g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();if(f){g.fillStyle=f;g.fill()}if(s){g.strokeStyle=s;g.lineWidth=lw||2;g.stroke()}}
function dCirc(g,x,y,r,f,s,lw){g.beginPath();g.arc(x,y,r,0,TAU);if(f){g.fillStyle=f;g.fill()}if(s){g.strokeStyle=s;g.lineWidth=lw||2;g.stroke()}}
function dStar(g,x,y,R,r,n,f,s,lw){const q=[];for(let i=0;i<n*2;i++){const a=i/(n*2)*TAU-Math.PI/2,d=i%2?r:R;q.push([x+Math.cos(a)*d,y+Math.sin(a)*d])}dPoly(g,q,f,s,lw)}
function camel(g,x,y,a){g.save();g.translate(x,y);g.rotate(a);g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(2,4,17,9,0,0,TAU);g.fill();
 g.fillStyle='#8a6034';for(const[u,v]of[[-9,-7],[-9,7],[9,-7],[9,7]]){g.beginPath();g.arc(u,v,2.6,0,TAU);g.fill()}
 g.lineCap='round';g.strokeStyle=OL;g.lineWidth=8;g.beginPath();g.moveTo(12,0);g.lineTo(23,-2);g.stroke();g.strokeStyle='#b98a4f';g.lineWidth=5;g.stroke();dCirc(g,26,-2,4.2,'#b98a4f',OL,2);
 g.beginPath();g.ellipse(0,0,15,8.5,0,0,TAU);g.fillStyle='#b98a4f';g.fill();g.strokeStyle=OL;g.lineWidth=2.5;g.stroke();
 g.fillStyle='#c8483a';g.fillRect(-6,-8,9,16);g.strokeStyle='#e0b04a';g.lineWidth=1.5;g.strokeRect(-6,-8,9,16);dCirc(g,-9,0,4,'#a8743f',OL,1.8);dCirc(g,6,0,4,'#a8743f',OL,1.8);g.restore()}
function cart(g,x,y,k){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x-12,y-6,28,18);g.fillStyle='#7a5430';g.fillRect(x-14,y-9,28,18);g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(x-14,y-9,28,18);
 const cs=['#e0803a','#c8483a','#7ac05a','#e8c860'][k&3];for(let i=0;i<3;i++)for(let j=0;j<2;j++)dCirc(g,x-9+i*9,y-4.5+j*9,3.4,cs,OL,1);dCirc(g,x-14,y+9,3,'#3a2a1a');dCirc(g,x+14,y+9,3,'#3a2a1a')}
function palm(g,x,y,s,sd){g.save();g.translate(x,y);g.globalAlpha*=.93;g.lineCap='round';
 for(let i=0;i<8;i++){const a=i/8*TAU+sd,L=s*(.85+.25*((i*7)%3)/2);g.strokeStyle=OL;g.lineWidth=6;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(Math.cos(a+.35)*L*.55,Math.sin(a+.35)*L*.55,Math.cos(a)*L,Math.sin(a)*L);g.stroke();g.strokeStyle=i%2?'#3f9a46':'#2f7d3a';g.lineWidth=3.6;g.stroke()}
 dCirc(g,0,0,4,'#5b3d22',OL,1.5);g.restore()}
function dome(g,x,y,R,cl){dCirc(g,x+4,y+6,R,'rgba(0,0,0,.22)');const gr=g.createRadialGradient(x-R*.3,y-R*.3,R*.1,x,y,R);gr.addColorStop(0,cl[0]);gr.addColorStop(1,cl[1]);dCirc(g,x,y,R,gr,OL,3);
 g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=1.6;g.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU;g.moveTo(x+Math.cos(a)*R*.18,y+Math.sin(a)*R*.18);g.lineTo(x+Math.cos(a)*R*.97,y+Math.sin(a)*R*.97)}g.stroke();
 g.strokeStyle='rgba(255,226,140,.75)';g.lineWidth=2;g.beginPath();g.arc(x,y,R*.62,0,TAU);g.stroke();dCirc(g,x,y,R*.13,'#f2c14e',OL,2);dCirc(g,x-1,y-1,R*.05,'#fff6c8')}
function turret(g,x,y,R){dCirc(g,x+3,y+5,R+3,'rgba(0,0,0,.22)');dCirc(g,x,y,R+3,'#e8d4a0',OL,2.5);g.fillStyle='#cfae72';for(let i=0;i<10;i++){const a=i/10*TAU;g.fillRect(x+Math.cos(a)*(R+1)-2.6,y+Math.sin(a)*(R+1)-2.6,5.2,5.2)}
 const gr=g.createRadialGradient(x-R*.25,y-R*.25,R*.1,x,y,R*.8);gr.addColorStop(0,'#f08a56');gr.addColorStop(1,'#8a2f18');dCirc(g,x,y,R*.78,gr,OL,2.5);
 g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1.4;g.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU;g.moveTo(x+Math.cos(a)*R*.15,y+Math.sin(a)*R*.15);g.lineTo(x+Math.cos(a)*R*.76,y+Math.sin(a)*R*.76)}g.stroke();dCirc(g,x,y,3.2,'#f2c14e',OL,1.5)}
function awning(g,x,y,w,h,vert,a,b2){const n=Math.max(4,Math.round((vert?h:w)/9));for(let i=0;i<n;i++){g.fillStyle=i%2?b2:a;if(vert)g.fillRect(x,y+i*h/n,w,h/n+.5);else g.fillRect(x+i*w/n,y,w/n+.5,h)}g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(x,y,w,h)}
function desFloor(b){const S=b.S,g=ctx,sd=((b.x/97)|0);
 for(const[r,c]of b.cells){const ch=cellCh(b,r,c),x=b.x+c*S,y=b.y+r*S,h=hs(r*7+b.t,c*13+sd),h2=hs(c*5+sd,r*11+b.t),cx=x+S/2,cy=y+S/2,op=isOpen(ch);
  g.fillStyle=op?'#e6cf9c':'#cfae72';g.fillRect(x,y,S,S);
  g.strokeStyle=op?'rgba(120,85,40,.13)':'rgba(90,60,25,.16)';g.lineWidth=1.2;g.beginPath();for(let k=1;k<4;k++){g.moveTo(x+k*S/4,y);g.lineTo(x+k*S/4,y+S);g.moveTo(x,y+k*S/4);g.lineTo(x+S,y+k*S/4)}g.stroke();
  if(op){
   dPoly(g,[[cx,y+S*.14],[x+S*.86,cy],[cx,y+S*.86],[x+S*.14,cy]],'#efdfb4','#2f6fa0',2);dPoly(g,[[cx,y+S*.3],[x+S*.7,cy],[cx,y+S*.7],[x+S*.3,cy]],'#c8483a','#e0b04a',1.6);
   for(const[u,v]of[[.08,.08],[.92,.08],[.08,.92],[.92,.92]])dCirc(g,x+S*u,y+S*v,3,'#2f6fa0');
   if(ch==='F'){dCirc(g,cx,cy,S*.3,'#d9c38f','#5a4326',2.5);dCirc(g,cx,cy,S*.24,'#4fb3cf');dCirc(g,cx,cy,S*.13,'rgba(255,255,255,.35)');dCirc(g,cx,cy,3,'#fff')}
   else if(ch==='P'){dCirc(g,cx,cy,S*.3,'#d9c38f','#5a4326',2.5);dCirc(g,cx,cy,S*.25,'#4fb3cf');dCirc(g,cx,cy,S*.18,'rgba(255,255,255,.25)')}
   else if(b.t===15&&(c===1||c===3))camel(g,cx,cy,(h-.5)*1.2+(c===1?0:Math.PI));
   else if(b.t===10&&h>.45){cart(g,cx+(h2-.5)*22,cy+(h-.5)*22,Math.floor(h2*4))}
  }else if(ch==='D'){
   if(b.t===11){g.fillStyle='#9b2d30';g.fillRect(cx-16,y,32,S);g.strokeStyle='#e0b04a';g.lineWidth=2.5;g.beginPath();g.moveTo(cx-12,y);g.lineTo(cx-12,y+S);g.moveTo(cx+12,y);g.lineTo(cx+12,y+S);g.stroke();dPoly(g,[[cx,cy-12],[cx+9,cy],[cx,cy+12],[cx-9,cy]],'#e0b04a');
    if(cellCh(b,r-1,c)!=='D'){g.fillStyle='#e0b04a';g.fillRect(cx-13,y+8,26,18);g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(cx-13,y+8,26,18);g.fillStyle='#b3261e';g.fillRect(cx-9,y+12,18,10);dCirc(g,cx,y+17,3,'#fff6c8')}}
   else{dCirc(g,cx,cy,S*.4,'#efdfb4','#2f6fa0',4);dStar(g,cx,cy,S*.3,S*.14,8,'#c8483a','#e0b04a',1.5);dCirc(g,cx,cy,4,'#e0b04a')}
  }else if(ch==='T'){dCirc(g,cx,cy,S*.36,'#e8d9a0','#2f6fa0',3);dCirc(g,cx,cy,S*.2,null,'#c8483a',3);dCirc(g,cx,cy,5,'#e0b04a')}
  else{const k=Math.floor(h2*4)&3,rg=RUG[k];
   if(h<.38){const rx=x+S*.14,ry=y+S*.26,rw=S*.72,rh=S*.48;g.fillStyle=rg[0];g.fillRect(rx,ry,rw,rh);g.strokeStyle=rg[1];g.lineWidth=2;g.strokeRect(rx+4,ry+4,rw-8,rh-8);dPoly(g,[[cx,ry+8],[cx+rw*.25,ry+rh/2],[cx,ry+rh-8],[cx-rw*.25,ry+rh/2]],rg[1]);
    g.lineWidth=1.4;g.beginPath();for(let i=0;i<7;i++){const yy=ry+4+i*(rh-8)/6;g.moveTo(rx-3,yy);g.lineTo(rx,yy);g.moveTo(rx+rw,yy);g.lineTo(rx+rw+3,yy)}g.stroke()}
   else if(h<.62){dCirc(g,cx,cy,S*.13,'#6b4a2a','#e0b04a',2.5);[[.25,.72],[.75,.72],[.5,.2]].forEach((u,i)=>dCirc(g,x+S*u[0],y+S*u[1],S*.085,RUG[(k+i)&3][0],OL,1.8))}
   else if(h<.82){for(const[u,v]of[[.82,.82],[.7,.9],[.9,.68]]){dCirc(g,x+S*u,y+S*v,5,'#a8552e',OL,2);dCirc(g,x+S*u,y+S*v,2.2,'#3a2214')}}
   else{g.fillStyle=rg[0];g.fillRect(x+S*.12,y+S*.6,S*.76,S*.22);g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(x+S*.12,y+S*.6,S*.76,S*.22);g.fillStyle=rg[1];for(let i=0;i<3;i++)g.fillRect(x+S*.18+i*S*.22,y+S*.64,S*.14,S*.1)}}}}
function desWalls(b){const g=ctx;for(const q of b.ws){if(q.d)continue;
 if(q.fx){dCirc(g,q.x+q.w/2,q.y+q.h/2,13,'#d9c38f',OL,2.5);dCirc(g,q.x+q.w/2,q.y+q.h/2,5,'#e0b04a',OL,1.5);continue}
 if(q.pl){const x=q.x+q.w/2,y=q.y+q.h/2;dCirc(g,x+1.5,y+2.5,7.5,'rgba(0,0,0,.25)');dCirc(g,x,y,7,'#e8d4a0',OL,2.2);dCirc(g,x,y,3,'#e0b04a');continue}
 g.fillStyle='#8f6638';g.fillRect(q.x,q.y,q.w,q.h);g.fillStyle='rgba(255,230,170,.28)';g.fillRect(q.x,q.y,q.w,Math.min(3,q.h));g.strokeStyle='#33220f';g.lineWidth=2;g.strokeRect(q.x,q.y,q.w,q.h)}}
function desArch(){const g=ctx;g.fillStyle='rgba(60,36,14,.45)';g.fillRect(-24,-8,48,8);
 g.fillStyle='#e8d4a0';g.fillRect(-29,-10,7,14);g.fillRect(22,-10,7,14);g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(-29,-10,7,14);g.strokeRect(22,-10,7,14);dCirc(g,-25.5,4,3.6,'#e0b04a',OL,1.5);dCirc(g,25.5,4,3.6,'#e0b04a',OL,1.5);
 g.fillStyle='#e8d4a0';g.fillRect(-24,2,48,6);g.strokeStyle=OL;g.lineWidth=1.5;g.strokeRect(-24,2,48,6);g.fillStyle='#2f9fa0';g.fillRect(-18,4,36,2);dPoly(g,[[-5,8],[0,12],[5,8]],'#c8483a',OL,1.2)}
function desRoof(b){const S=b.S,g=ctx,pal=DPAL[b.pl|0],sd=((b.x/97)|0),aw=b.t===10||b.t===15;
 for(const[r,c]of b.cells){if(!b.cs.has(r*20+c))continue;const x=b.x+c*S,y=b.y+r*S,h=hs(r*7+b.t,c*13+sd);
  g.fillStyle=pal;g.fillRect(x,y,S,S);g.fillStyle='rgba(255,255,255,.13)';g.fillRect(x+5,y+5,S-10,S-10);g.strokeStyle='rgba(70,45,15,.22)';g.lineWidth=1.5;g.strokeRect(x+5,y+5,S-10,S-10);
  if(h>.72&&cellCh(b,r,c)==='X'){g.fillStyle='#4a3a2a';g.fillRect(x+S*.62,y+S*.2,S*.2,S*.2);g.strokeStyle='#e8d4a0';g.lineWidth=2;g.strokeRect(x+S*.62,y+S*.2,S*.2,S*.2)}}
 g.strokeStyle=OL;g.lineWidth=3;g.beginPath();
 for(const[r,c]of b.cells){if(!b.cs.has(r*20+c))continue;const x=b.x+c*S,y=b.y+r*S;
  if(!b.cs.has(r*20+c-1)){g.moveTo(x,y);g.lineTo(x,y+S)}if(!b.cs.has(r*20+c+1)){g.moveTo(x+S,y);g.lineTo(x+S,y+S)}
  if(!b.cs.has((r-1)*20+c)){g.moveTo(x,y);g.lineTo(x+S,y)}if(!b.cs.has((r+1)*20+c)){g.moveTo(x,y+S);g.lineTo(x+S,y+S)}}
 g.stroke();
 for(const[r,c]of b.cells){const ch=cellCh(b,r,c),x=b.x+c*S,y=b.y+r*S,cx=x+S/2,cy=y+S/2,h=hs(r*7+b.t,c*13+sd);
  if(ch==='D')dome(g,cx,cy,S*.44,b.t===11?DOME[0]:DOME[Math.floor(hs(c+sd,r+b.t)*4)&3]);
  else if(ch==='T')turret(g,cx,cy,S*.32);
  else if(ch==='X'&&aw){const A=AWN[(r+c+(b.pl|0))%3];
   if(isOpen(cellCh(b,r+1,c)||''))awning(g,x+3,y+S-16,S-6,14,false,A[0],A[1]);if(isOpen(cellCh(b,r-1,c)||''))awning(g,x+3,y+2,S-6,14,false,A[0],A[1]);
   if(isOpen(cellCh(b,r,c+1)||''))awning(g,x+S-16,y+3,14,S-6,true,A[0],A[1]);if(isOpen(cellCh(b,r,c-1)||''))awning(g,x+2,y+3,14,S-6,true,A[0],A[1])}}
 for(const[r,c]of b.cells){const ch=cellCh(b,r,c);if(!isOpen(ch))continue;const x=b.x+c*S,y=b.y+r*S,h=hs(r*7+b.t+3,c*13+sd);
  if((b.t===11||b.t===16||b.t===10)&&ch==='O'&&h>.5)palm(g,x+S*(h>.75?.22:.78),y+S*(((h*17)%1)>.5?.22:.78),S*.26,h*6);
  else if((b.t===12||b.t===13)&&ch==='F')palm(g,x+S*.2,y+S*.2,S*.3,h*6)}}
/* building art cache with a limit: above 60 canvases, free the ones not drawn for 3 s (saves phone memory) */
const BCU=new Map();let _bcT=0;
function desCache(b,key,fn){let c=b[key];if(!c){const P=34,cvs=document.createElement('canvas');cvs.width=Math.ceil(b.w)+P*2;cvs.height=Math.ceil(b.h)+P*2;const g=cvs.getContext('2d');g.lineJoin='round';g.translate(P-b.x,P-b.y);const main=ctx;ctx=g;try{fn(b)}finally{ctx=main}c=b[key]={cv:cvs,P}}
 ctx.drawImage(c.cv,b.x-c.P,b.y-c.P);const now=performance.now();c.u=now;BCU.set(c,[b,key]);
 if(BCU.size>60&&now-_bcT>1000){_bcT=now;for(const[k,[q,n]]of BCU)if(now-k.u>3000){if(q[n]===k){q[n]=null;k.cv.width=k.cv.height=0}BCU.delete(k)}}}
function desWallsC(b){let n=0;for(const q of b.ws)if(q.d)n++;if(b._wn!==n){b._wn=n;b._wc=null}desCache(b,'_wc',desWalls)}
/* forest designs (t 20-25): drawn once into a cache per building (like the desert), walls redrawn only when one is destroyed */
const FPAL=['#6b4a2b','#7a5230','#58422c','#51613a'];
function fstFloor(b){const S=b.S,g=ctx,sd=((b.x/97)|0);
 for(const[r,c]of b.cells){const ch=cellCh(b,r,c),x=b.x+c*S,y=b.y+r*S,h=hs(r*7+b.t,c*13+sd),h2=hs(c*5+sd,r*11+b.t),cx=x+S/2,cy=y+S/2;
  if(isOpen(ch)){g.fillStyle=ch==='P'?'#b59a68':'#6e5a38';g.fillRect(x,y,S,S);
   g.fillStyle=ch==='P'?'rgba(120,90,50,.35)':'rgba(70,125,45,.55)';for(let i=0;i<6;i++)g.fillRect(x+S*.9*hs(i+r,c+sd),y+S*.9*hs(c+i,r+sd+3),5,3);
   g.fillStyle='rgba(0,0,0,.14)';for(let i=0;i<4;i++)dCirc(g,x+S*.9*hs(i*3+c,r+sd),y+S*.9*hs(r+i,c*2+sd),2.2,'rgba(0,0,0,.16)');
   if(ch==='F'){const gr=g.createRadialGradient(cx,cy,2,cx,cy,S*.5);gr.addColorStop(0,'rgba(255,170,60,.38)');gr.addColorStop(1,'rgba(255,140,40,0)');dCirc(g,cx,cy,S*.5,gr);
    for(let i=0;i<9;i++){const a=i/9*TAU;dCirc(g,cx+Math.cos(a)*S*.19,cy+Math.sin(a)*S*.19,4,'#8a8d90',OL,1.3)}
    g.save();g.translate(cx,cy);for(const a of[.5,-.6]){g.rotate(a);g.fillStyle='#5a3a1e';g.fillRect(-S*.15,-3,S*.3,6);g.strokeStyle=OL;g.lineWidth=1.5;g.strokeRect(-S*.15,-3,S*.3,6)}g.restore();
    dCirc(g,cx,cy,S*.09,'#e8742a');dCirc(g,cx,cy-1,S*.055,'#ffd54a')}
   continue}
  g.fillStyle=ch==='D'?'#7d562f':'#8a6038';g.fillRect(x,y,S,S);
  g.strokeStyle='rgba(40,22,8,.35)';g.lineWidth=1.4;g.beginPath();for(let k=1;k*12<S;k++){g.moveTo(x,y+k*12);g.lineTo(x+S,y+k*12)}for(let k=0;k*12<S;k++){const u=((k*37+c*17+r*29)%53)+14;if(u<S){g.moveTo(x+u,y+k*12);g.lineTo(x+u,y+Math.min(S,k*12+12))}}g.stroke();
  if(ch==='D'){g.fillStyle='#6b4a2b';g.fillRect(x+S*.08,y+S*.4,S*.84,S*.2);g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(x+S*.08,y+S*.4,S*.84,S*.2);g.fillStyle='#b58a4e';for(let i=0;i<4;i++)g.fillRect(x+S*(.16+i*.2),y+S*.44,S*.08,S*.05)}
  else if(ch==='T'){dCirc(g,cx,cy,S*.3,'#4a3322',OL,2);dCirc(g,cx,cy-S*.3,S*.1,'#4a3322',OL,2);dCirc(g,cx,cy,S*.15,'#5c422d')}
  else if(h<.28){const rx=x+S*.16,ry=y+S*.28,rw=S*.68,rh=S*.44;g.fillStyle='#7a3b2e';g.fillRect(rx,ry,rw,rh);g.strokeStyle='#d9b36a';g.lineWidth=2;g.strokeRect(rx+4,ry+4,rw-8,rh-8);dPoly(g,[[cx,ry+8],[cx+rw*.22,cy],[cx,ry+rh-8],[cx-rw*.22,cy]],'#d9b36a')}
  else if(h<.5){g.fillStyle='#4a6a58';g.fillRect(x+S*.12,y+S*.14,S*.36,S*.62);g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(x+S*.12,y+S*.14,S*.36,S*.62);g.fillStyle='#e6dcc0';g.fillRect(x+S*.16,y+S*.18,S*.28,S*.14);g.strokeRect(x+S*.16,y+S*.18,S*.28,S*.14)}
  else if(h<.72){dCirc(g,cx,cy,S*.2,'#6b4a2b',OL,2);[[.25,.25],[.75,.3],[.5,.8]].forEach(u=>dCirc(g,x+S*u[0],y+S*u[1],S*.07,'#9a7040',OL,1.5))}
  else{for(const[u,v]of[[.7,.75],[.84,.62],[.6,.58]]){dCirc(g,x+S*u,y+S*v,S*.1,'#5a3a1e',OL,2);dCirc(g,x+S*u,y+S*v,S*.06,null,'#caa05a',1.6)}}}}
function fstWalls(b){const g=ctx;for(const q of b.ws){if(q.d)continue;
 if(q.fx){for(let i=0;i<3;i++)dCirc(g,q.x+4+i*8,q.y+7,4.2,'#8a5d34',OL,1.3);for(let i=0;i<2;i++)dCirc(g,q.x+8+i*8,q.y+17,4.2,'#9a6a3a',OL,1.3);continue}
 if(q.pl){const x=q.x+q.w/2,y=q.y+q.h/2;dCirc(g,x+1.5,y+2.5,7,'rgba(0,0,0,.25)');dCirc(g,x,y,6.5,'#7a4f28',OL,2);dCirc(g,x,y,2.5,'#9a6a3a');continue}
 g.fillStyle='#2a1a0c';g.fillRect(q.x-1,q.y-1,q.w+2,q.h+2);g.fillStyle='#7a4f28';g.fillRect(q.x+1,q.y+1,q.w-2,q.h-2);
 g.fillStyle='#9a6a3a';if(q.w>=q.h)g.fillRect(q.x+1,q.y+1,q.w-2,Math.min(3,q.h-2));else g.fillRect(q.x+1,q.y+1,Math.min(3,q.w-2),q.h-2);
 g.strokeStyle='rgba(30,16,6,.7)';g.lineWidth=1.5;g.beginPath();
 if(q.w>=q.h){for(let u=12;u<q.w;u+=12){g.moveTo(q.x+u,q.y);g.lineTo(q.x+u,q.y+q.h)}}else{for(let u=12;u<q.h;u+=12){g.moveTo(q.x,q.y+u);g.lineTo(q.x+q.w,q.y+u)}}g.stroke()}}
function fstWallsC(b){let n=0;for(const q of b.ws)if(q.d)n++;if(b._wn!==n){b._wn=n;b._wc=null}desCache(b,'_wc',fstWalls)}
function fstDoor(){const g=ctx;g.fillStyle='rgba(40,22,8,.4)';g.fillRect(-24,-8,48,8);
 g.fillStyle='#7a4f28';g.fillRect(-29,-10,7,14);g.fillRect(22,-10,7,14);g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(-29,-10,7,14);g.strokeRect(22,-10,7,14);
 g.fillStyle='#8a5d34';g.fillRect(-27,2,54,6);g.strokeRect(-27,2,54,6);dCirc(g,0,12,3,'#e0b04a',OL,1.2)}
function fstRoof(b){const S=b.S,g=ctx,pal=FPAL[b.pl|0],sd=((b.x/97)|0),cs=b.cs;
 for(const[r,c]of b.cells){if(!cs.has(r*20+c))continue;const ch=cellCh(b,r,c),x=b.x+c*S,y=b.y+r*S,cx=x+S/2,cy=y+S/2,h=hs(r*7+b.t,c*13+sd);
  g.fillStyle=ch==='D'?'#4f3820':pal;g.fillRect(x,y,S,S);
  g.strokeStyle='rgba(20,10,2,.35)';g.lineWidth=1.4;g.beginPath();for(let k=1;k*10<S;k++){g.moveTo(x,y+k*10);g.lineTo(x+S,y+k*10)}for(let k=0;k*10<S;k++)for(let u=(k%2)*9+9;u<S;u+=18){g.moveTo(x+u,y+k*10);g.lineTo(x+u,y+Math.min(S,k*10+10))}g.stroke();
  if(ch==='T'){dPoly(g,[[x,y],[x+S,y],[cx,cy]],'rgba(255,230,180,.14)');dPoly(g,[[x,y+S],[x+S,y+S],[cx,cy]],'rgba(0,0,0,.2)');dPoly(g,[[x+S,y],[x+S,y+S],[cx,cy]],'rgba(0,0,0,.1)');g.strokeStyle='rgba(20,10,2,.5)';g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x+S,y+S);g.moveTo(x+S,y);g.lineTo(x,y+S);g.stroke();dCirc(g,cx,cy,4,'#2a1a0c',OL,1.5)}
  else{g.fillStyle='rgba(0,0,0,.16)';g.fillRect(x,cy,S,S/2);g.fillStyle='rgba(255,230,180,.2)';g.fillRect(x,cy-3,S,5)}
  if(h<.4){g.fillStyle='rgba(70,130,50,.42)';g.beginPath();g.ellipse(x+S*(.2+.5*hs(r+sd,c+9)),y+S*(.2+.5*hs(c+sd,r+9)),9+6*h,6+3*h,0,0,TAU);g.fill()}
  if(h>.72&&ch==='X'){g.fillStyle='#7d7f82';g.fillRect(x+S*.62,y+S*.15,13,13);g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(x+S*.62,y+S*.15,13,13);g.fillStyle='#2a2a2a';g.fillRect(x+S*.62+3,y+S*.15+3,7,7)}}
 g.strokeStyle=OL;g.lineWidth=3;g.beginPath();
 for(const[r,c]of b.cells){if(!cs.has(r*20+c))continue;const x=b.x+c*S,y=b.y+r*S;
  if(!cs.has(r*20+c-1)){g.moveTo(x,y);g.lineTo(x,y+S)}if(!cs.has(r*20+c+1)){g.moveTo(x+S,y);g.lineTo(x+S,y+S)}
  if(!cs.has((r-1)*20+c)){g.moveTo(x,y);g.lineTo(x+S,y)}if(!cs.has((r+1)*20+c)){g.moveTo(x,y+S);g.lineTo(x+S,y+S)}}
 g.stroke();
 for(const[r,c]of b.cells){if(cellCh(b,r,c)!=='F')continue;const cx=b.x+c*S+S/2,cy=b.y+r*S+S/2;for(let i=0;i<4;i++)dCirc(g,cx+8+i*9,cy-10-i*10,7+i*3,'rgba(210,210,210,'+(.28-i*.05)+')')}}
/* snow designs art (t 30-35): drawn once into the per-building cache, no per-frame animation */
const SNW='#f4f9fc',SNS='#cfe0ec',ICE='#a9d0e6',ICD='#6f9fc0';
function snowman(g,x,y){dCirc(g,x+3,y+5,13,'rgba(40,70,100,.22)');dCirc(g,x,y,12,SNW,OL,2);dCirc(g,x,y-9,8,SNW,OL,2);dCirc(g,x-3,y-11,1.4,'#14160f');dCirc(g,x+3,y-11,1.4,'#14160f');dPoly(g,[[x-1.5,y-9],[x+1.5,y-9],[x,y-3]],'#e8742a')}
function sled(g,x,y){g.fillStyle='#8a5d34';g.strokeStyle=OL;g.lineWidth=1.8;for(const v of[-8,5]){g.fillRect(x-18,y+v,36,3);g.strokeRect(x-18,y+v,36,3)}g.fillStyle='#b8452f';g.fillRect(x-11,y-6,22,12);g.strokeRect(x-11,y-6,22,12)}
function snowPine(g,x,y,R){for(const[k,col]of[[1,'#2c5a48'],[.7,'#8fb5ae'],[.4,SNW]]){const q=[];for(let i=0;i<16;i++){const a=i/16*TAU,u=R*k*(i%2?.62:1);q.push([x+Math.cos(a)*u,y+Math.sin(a)*u])}dPoly(g,q,col,OL,k===1?2:1)}}
function fire(g,x,y,s){dCirc(g,x,y,s*2.4,'rgba(255,160,60,.2)');for(let i=0;i<8;i++){const a=i/8*TAU;dCirc(g,x+Math.cos(a)*s,y+Math.sin(a)*s,s*.28,'#8a8d90',OL,1.2)}dCirc(g,x,y,s*.55,'#e8742a');dCirc(g,x,y-1,s*.3,'#ffd54a')}
function igTunnels(b,fn){const{cx,cy,R,sides}=b.rd,g=ctx,A={r:0,b:Math.PI/2,l:Math.PI,t:-Math.PI/2};for(const s of sides){g.save();g.translate(cx,cy);g.rotate(A[s]);fn(g,R);g.restore()}}
function igFloor(b){const{cx,cy,R}=b.rd,g=ctx;dCirc(g,cx+5,cy+8,R+3,'rgba(40,70,100,.22)');
 igTunnels(b,g=>{g.fillStyle='#b4cfe0';g.fillRect(R-20,-34,60,68)});
 dCirc(g,cx,cy,R-2,'#c3dae8');for(let k=1;k<4;k++)dCirc(g,cx,cy,(R-14)*k/4,null,'rgba(80,130,170,.25)',1.5);
 const big=b.t===31;
 for(const[u,v,a]of big?[[-.5,.08,.2],[.5,.08,-.2],[0,-.45,0]]:[[0,-.5,0],[-.42,.32,.7]]){g.save();g.translate(cx+u*R,cy+v*R);g.rotate(a);g.beginPath();g.ellipse(0,0,23,14,0,0,TAU);g.fillStyle='#9a7450';g.fill();g.strokeStyle=OL;g.lineWidth=1.5;g.stroke();g.beginPath();g.ellipse(0,0,15,8,0,0,TAU);g.fillStyle='#c9a77a';g.fill();g.restore()}
 fire(g,cx,cy,big?20:11)}
function igRoof(b){const{cx,cy,R}=b.rd,g=ctx;
 igTunnels(b,g=>{g.fillStyle='#d7e8f2';g.fillRect(R-14,-40,54,80);g.fillStyle='rgba(255,255,255,.6)';g.fillRect(R-14,-14,54,20);g.fillStyle='rgba(60,110,150,.2)';g.fillRect(R-14,22,54,18);g.strokeStyle=ICD;g.lineWidth=2;g.beginPath();for(let u=R+4;u<R+40;u+=14){g.moveTo(u,-40);g.lineTo(u,40)}g.stroke();g.strokeStyle=OL;g.lineWidth=3;g.strokeRect(R-14,-40,54,80)});
 dCirc(g,cx,cy,R+1,'#c2dbeb',OL,3);
 const n=R>100?7:4;
 for(let k=0;k<n;k++){const r1=R*(1-k/n),r0=R*(1-(k+1)/n),ox=-k*1.2,oy=-k*1.6,sh=k/(n-1);
  dCirc(g,cx+ox,cy+oy,r1-1,'rgb('+Math.round(198+48*sh)+','+Math.round(220+31*sh)+','+Math.round(236+18*sh)+')',ICD,1.6);
  const m=Math.max(5,Math.round(TAU*r1/34));g.beginPath();for(let i=0;i<m;i++){const a=(i+(k%2)*.5)/m*TAU;g.moveTo(cx+ox+Math.cos(a)*(r1-2),cy+oy+Math.sin(a)*(r1-2));g.lineTo(cx+ox+Math.cos(a)*r0,cy+oy+Math.sin(a)*r0)}g.strokeStyle=ICD;g.lineWidth=1.3;g.stroke()}
 dCirc(g,cx-n*1.1,cy-n*1.5,R>100?13:7,'#35505f',OL,2);
 if(b.t===31){g.strokeStyle=OL;g.lineWidth=4;g.beginPath();g.moveTo(cx+62,cy-62);g.lineTo(cx+62,cy-104);g.stroke();dPoly(g,[[cx+62,cy-104],[cx+98,cy-94],[cx+62,cy-83]],'#d6453a',OL,2)}}
function snFloor(b){if(b.rd){igFloor(b);return}const S=b.S,g=ctx,sd=((b.x/97)|0);
 for(const[r,c]of b.cells){const ch=cellCh(b,r,c),x=b.x+c*S,y=b.y+r*S,h=hs(r*7+b.t,c*13+sd),cx=x+S/2,cy=y+S/2;
  if(isOpen(ch)){g.fillStyle='#dbe8f0';g.fillRect(x,y,S,S);g.fillStyle='rgba(90,130,165,.2)';for(let i=0;i<6;i++)g.fillRect(x+S*.9*hs(i+r,c+sd),y+S*.9*hs(c+i,r+sd+3),6,3);
   if(ch==='F'){fire(g,cx,cy,15)}else if(ch==='O'){if(h<.3)snowman(g,x+S*.72,cy);else if(h<.55)sled(g,cx,y+S*.7);else if(h<.75)snowPine(g,x+S*.25,y+S*.28,S*.2)}continue}
  const ft=b.t===33,mt=b.t===34;g.fillStyle=ft?'#b5d3e5':mt?'#8b969e':'#8a6038';g.fillRect(x,y,S,S);
  g.strokeStyle=ft?'rgba(60,110,150,.3)':'rgba(20,20,25,.25)';g.lineWidth=1.4;g.beginPath();const st=ft?S/3:mt?S/2:13;for(let u=st;u<S-1;u+=st){g.moveTo(x,y+u);g.lineTo(x+S,y+u);if(ft||mt){g.moveTo(x+u,y);g.lineTo(x+u,y+S)}}g.stroke();
  if(ch==='D'){if(mt){g.fillStyle='#3a444c';g.fillRect(x+S*.12,y+S*.14,S*.76,S*.18);for(let i=0;i<4;i++){g.fillStyle=i%2?'#5fe0c8':'#7ac8ff';g.fillRect(x+S*(.18+i*.17),y+S*.18,S*.1,S*.09)}}
   else{g.fillStyle='#7a3b2e';g.fillRect(x+S*.14,y+S*.2,S*.72,S*.6);g.strokeStyle='#d9b36a';g.lineWidth=2;g.strokeRect(x+S*.2,y+S*.26,S*.6,S*.48)}}
  else if(ch==='T'){dCirc(g,cx,cy,S*.28,ft?'#8fb8d2':'#6f7880',OL,2)}
  else if(h<.3){g.fillStyle=mt?'#d9813a':'#b8452f';g.fillRect(x+S*.55,y+S*.14,S*.3,S*.56);g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(x+S*.55,y+S*.14,S*.3,S*.56);g.fillStyle=SNW;g.fillRect(x+S*.59,y+S*.18,S*.22,S*.13)}
  else if(h<.55){dCirc(g,x+S*.68,y+S*.68,S*.14,'#7a5230',OL,2);dCirc(g,x+S*.68,y+S*.68,S*.07,'#9a7040',OL,1.2)}}}
function snWalls(b){const g=ctx;
 for(const q of b.ws){if(q.d)continue;const x=q.x+q.w/2,y=q.y+q.h/2;
  if(q.ig){g.fillStyle=OL;g.fillRect(q.x-1.5,q.y-1.5,q.w+3,q.h+3);continue}
  if(q.pl){dCirc(g,x+2,y+3,9,'rgba(0,0,0,.2)');dCirc(g,x,y,8.5,ICE,OL,2);dCirc(g,x-2,y-2,3,SNW);continue}
  if(q.fx){g.fillStyle='#d9813a';g.fillRect(q.x,q.y,q.w,q.h);g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(q.x,q.y,q.w,q.h);g.fillStyle=SNW;g.fillRect(q.x+3,q.y+3,q.w-6,8);continue}
  const ice=q.tn||b.t===33,mt=b.t===34;g.fillStyle=OL;g.fillRect(q.x-1,q.y-1,q.w+2,q.h+2);g.fillStyle=ice?ICE:mt?'#c8603a':'#7a4f28';g.fillRect(q.x+1,q.y+1,q.w-2,q.h-2);
  g.fillStyle=SNW;if(q.w>=q.h)g.fillRect(q.x+1,q.y+1,q.w-2,Math.min(3.5,q.h-2));else g.fillRect(q.x+1,q.y+1,Math.min(3.5,q.w-2),q.h-2);
  g.strokeStyle=ice?ICD:'rgba(20,10,4,.65)';g.lineWidth=1.4;g.beginPath();if(q.w>=q.h){for(let u=14;u<q.w;u+=14){g.moveTo(q.x+u,q.y);g.lineTo(q.x+u,q.y+q.h)}}else{for(let u=14;u<q.h;u+=14){g.moveTo(q.x,q.y+u);g.lineTo(q.x+q.w,q.y+u)}}g.stroke()}
 /* ring blocks: all outlines first, then all fills, so they read as one curved wall */
 const ig=b.ws.filter(q=>q.ig&&!q.d);for(const q of ig){g.fillStyle=ICE;g.fillRect(q.x+1,q.y+1,14,14)}for(const q of ig){g.fillStyle=SNS;g.fillRect(q.x+4,q.y+4,8,8)}}
function snWallsC(b){let n=0;for(const q of b.ws)if(q.d)n++;if(b._wn!==n){b._wn=n;if(b._wc){BCU.delete(b._wc);b._wc=null}}desCache(b,'_wc',snWalls)}
function snDoor(){const g=ctx;g.fillStyle='rgba(60,100,135,.35)';g.fillRect(-28,-8,56,8);for(const u of[-34,34])dCirc(g,u,0,8,ICE,OL,2);dCirc(g,-34,-2,3,SNW);dCirc(g,34,-2,3,SNW)}
function snRoof(b){if(b.rd){igRoof(b);return}const S=b.S,g=ctx,cs=b.cs,sd=((b.x/97)|0),ft=b.t===33,mt=b.t===34;
 for(const[r,c]of b.cells){if(!cs.has(r*20+c))continue;const ch=cellCh(b,r,c),x=b.x+c*S,y=b.y+r*S,cx=x+S/2,cy=y+S/2,h=hs(r*7+b.t,c*13+sd);
  g.fillStyle=b.c;g.fillRect(x,y,S,S);
  if(ft){g.strokeStyle=ICD;g.lineWidth=1.4;g.beginPath();for(let k=1;k<4;k++){g.moveTo(x,y+k*S/4);g.lineTo(x+S,y+k*S/4);for(let u=(k%2)*11+11;u<S;u+=22){g.moveTo(x+u,y+(k-1)*S/4);g.lineTo(x+u,y+k*S/4)}}g.stroke()}
  if(ch==='T'){dPoly(g,[[x+6,y+6],[x+S-6,y+6],[cx,cy]],SNW);dPoly(g,[[x+6,y+6],[x+6,y+S-6],[cx,cy]],'#e3eef6');dPoly(g,[[x+S-6,y+6],[x+S-6,y+S-6],[cx,cy]],'#c4d8e7');dPoly(g,[[x+6,y+S-6],[x+S-6,y+S-6],[cx,cy]],'#b3cbdd');dCirc(g,cx,cy,5,'#d6453a',OL,1.8);continue}
  if(mt){g.fillStyle=SNW;g.fillRect(x+9,y+9,S-18,S-18);g.fillStyle=SNS;g.fillRect(x+9,y+S-22,S-18,13);
   if(ch==='D'){dCirc(g,cx,cy,S*.34,'#aab6bd',OL,2.5);dCirc(g,cx-3,cy-3,S*.24,'#dfe6ea',OL,1.5);g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+S*.28,cy-S*.28);g.stroke();dCirc(g,cx+S*.28,cy-S*.28,4,'#d6453a',OL,1.5)}
   else if(h<.35){g.fillStyle='#24456e';g.fillRect(x+18,y+22,S-36,S-44);g.strokeStyle='#9fc4ea';g.lineWidth=1.2;g.strokeRect(x+18,y+22,S-36,S-44);g.beginPath();g.moveTo(cx,y+22);g.lineTo(cx,y+S-22);g.moveTo(x+18,cy);g.lineTo(x+S-18,cy);g.stroke()}
   continue}
  if(!ft){g.fillStyle=SNW;g.fillRect(x,y+S*.14,S,S*.36);g.fillStyle=SNS;g.fillRect(x,cy,S,S*.36);g.fillStyle='#fff';g.fillRect(x,cy-3,S,6)}
  else{g.fillStyle='rgba(244,249,252,.85)';g.beginPath();g.ellipse(x+S*(.3+.4*h),cy,S*.3,S*.22,h*3,0,TAU);g.fill()}
  if(!ft&&h>.68){g.fillStyle='#6f7378';g.fillRect(x+S*.62,y+S*.18,15,15);g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(x+S*.62,y+S*.18,15,15);g.fillStyle='#2a2a2a';g.fillRect(x+S*.62+4,y+S*.18+4,7,7)}}
 g.strokeStyle=OL;g.lineWidth=3;g.beginPath();
 for(const[r,c]of b.cells){if(!cs.has(r*20+c))continue;const x=b.x+c*S,y=b.y+r*S;
  if(!cs.has(r*20+c-1)){g.moveTo(x,y);g.lineTo(x,y+S)}if(!cs.has(r*20+c+1)){g.moveTo(x+S,y);g.lineTo(x+S,y+S)}
  if(!cs.has((r-1)*20+c)){g.moveTo(x,y);g.lineTo(x+S,y)}if(!cs.has((r+1)*20+c)){g.moveTo(x,y+S);g.lineTo(x+S,y+S)}}
 g.stroke()}
function floorB(b){if(b.t>=30)return desCache(b,'_fc',snFloor);if(b.t>=20)return desCache(b,'_fc',fstFloor);if(b.t>=10)return desCache(b,'_fc',desFloor);const t=b.t||0;
 if(b.cells){ctx.fillStyle=FCC[t-6];for(const[r,c]of b.cells)ctx.fillRect(b.x+c*b.S,b.y+r*b.S,b.S,b.S);ctx.strokeStyle='rgba(0,0,0,.12)';ctx.lineWidth=1.5;ctx.beginPath();for(const[r,c]of b.cells){const x=b.x+c*b.S,y=b.y+r*b.S;for(let k=1;k<4;k++){ctx.moveTo(x,y+k*b.S/4);ctx.lineTo(x+b.S,y+k*b.S/4)}}ctx.stroke();return}
ctx.fillStyle=['#8a6a45','#6f7378','#d6cfba','#4d5053','#9a7a52','#7d8186'][t];ctx.fillRect(b.x,b.y,b.w,b.h);ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=1.5;ctx.beginPath();
 if(t===0||t===4){for(let y=b.y+14;y<b.y+b.h;y+=14){ctx.moveTo(b.x,y);ctx.lineTo(b.x+b.w,y)}}
 else if(t===2||t===5){for(let x=b.x+20;x<b.x+b.w;x+=20){ctx.moveTo(x,b.y);ctx.lineTo(x,b.y+b.h)}for(let y=b.y+20;y<b.y+b.h;y+=20){ctx.moveTo(b.x,y);ctx.lineTo(b.x+b.w,y)}}
 else if(t===1){for(let x=b.x+40;x<b.x+b.w;x+=40){ctx.moveTo(x,b.y);ctx.lineTo(x,b.y+b.h)}}
 ctx.stroke()}
function roofB(b){if(b.t>=30)return desCache(b,'_rc',snRoof);if(b.t>=20)return desCache(b,'_rc',fstRoof);if(b.t>=10)return desCache(b,'_rc',desRoof);if(b.cells)return roofCells(b);const t=b.t||0,x=b.x,y=b.y,w=b.w,h=b.h;
 ctx.fillStyle=t===1?'#8b9299':t===3?'#5d5f61':t===4?'#8a3b32':t===5?'#7a7f85':b.c;ctx.fillRect(x,y,w,h);
 if(t===0||t===2){ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(x+w/2,y,w/2,h)}
 if(t===0){ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(x+w/2-3,y,6,h);ctx.fillStyle='#4a3a32';ctx.fillRect(x+w*.7,y+10,14,14)}
 if(t===1){ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=2;ctx.beginPath();for(let i=18;i<w;i+=18){ctx.moveTo(x+i,y);ctx.lineTo(x+i,y+h)}ctx.stroke();ctx.fillStyle='#555a60';[[.3,.5],[.7,.5]].forEach(v=>{ctx.beginPath();ctx.arc(x+w*v[0],y+h*v[1],10,0,TAU);ctx.fill()})}
 if(t===2){for(let i=0;i<w;i+=16){ctx.fillStyle=(i/16)%2?'#f3efe4':'#c8483a';ctx.fillRect(x+i,y+h-14,Math.min(16,w-i),14)}ctx.fillStyle='#2b2b2b';ctx.fillRect(x+w/2-22,y+8,44,12)}
 if(t===3){ctx.fillStyle='#3d3f41';ctx.fillRect(x+w/2-14,y+h/2-14,28,28);ctx.fillStyle='#8a8d90';[[6,6],[w-6,6],[6,h-6],[w-6,h-6]].forEach(v=>{ctx.beginPath();ctx.arc(x+v[0],y+v[1],3,0,TAU);ctx.fill()})}
 if(t===4){ctx.fillStyle='rgba(0,0,0,.14)';ctx.fillRect(x+w/2,y,w/2,h);ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(x+w/2-4,y,8,h);ctx.fillRect(x,y+h/2-4,w,8);ctx.fillStyle='#4a3a32';ctx.fillRect(x+w*.2,y+h*.2,18,18);ctx.fillRect(x+w*.8-18,y+h*.7,18,18)}
 if(t===5){ctx.fillStyle='#9fb8c4';[[.15,.2],[.5,.2],[.85,.2]].forEach(v=>ctx.fillRect(x+w*v[0]-14,y+h*v[1]-14,28,28));ctx.fillStyle='#5a5f66';[[.25,.8],[.75,.8]].forEach(v=>ctx.fillRect(x+w*v[0]-20,y+h*v[1]-14,40,28))}
 ctx.strokeStyle=OL;ctx.lineWidth=3;ctx.strokeRect(x,y,w,h)}

const hs=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
function drawBushShape(x,y,r,al){const L=[];for(let i=0;i<7;i++){const a=i/7*TAU+x;L.push([x+Math.cos(a)*r*.58,y+Math.sin(a)*r*.58,r*.52])}L.push([x,y,r*.7]);
 ctx.globalAlpha=al;ctx.fillStyle=OL;L.forEach(l=>{ctx.beginPath();ctx.arc(l[0],l[1],l[2]+3,0,TAU);ctx.fill()});
 {const zr=zoneAt(x,y);ctx.fillStyle=zr===2?(r>27?'#8f8a3a':'#9d9840'):zr===3?(r>27?'#1f6a2c':'#2a7a36'):zr===4?(r>27?'#cfe3ee':'#dcecf4'):(r>27?'#2e7d3b':'#38873f')}L.forEach(l=>{ctx.beginPath();ctx.arc(l[0],l[1],l[2],0,TAU);ctx.fill()});
 ctx.fillStyle='rgba(255,255,255,.13)';L.slice(0,3).forEach(l=>{ctx.beginPath();ctx.arc(l[0]-3,l[1]-3,l[2]*.45,0,TAU);ctx.fill()});ctx.globalAlpha=1}
let _tkS=null;function tkSprite(){if(_tkS)return _tkS;const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d');g.scale(2,2);g.translate(40,40);
 g.fillStyle='rgba(8,40,16,.55)';g.beginPath();g.arc(0,0,38,0,TAU);g.fill();g.fillStyle='rgba(22,92,38,.5)';g.beginPath();g.arc(-3,-3,29,0,TAU);g.fill();
 g.fillStyle='#5b3d22';g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.arc(0,0,13,0,TAU);g.fill();g.stroke();g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1.5;g.beginPath();g.arc(0,0,7,0,TAU);g.stroke();return _tkS=c}
function drawTrunks(px,py,vw,vh){const S=tkSprite();for(const t of TK){if(Math.abs(t.cx-px)>vw/2+60||Math.abs(t.cy-py)>vh/2+60)continue;ctx.drawImage(S,t.cx-40,t.cy-40,80,80)}}
