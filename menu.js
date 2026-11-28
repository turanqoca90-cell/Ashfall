/* game state */
let p,zs=[],bs=[],gi=[],cm={},PK={},beams=[],pendSw=-1,srch=null,kills=0,life=0,spT=0,tt,muted=false,AC=null,gro=0,fullT=0,fullNow=false,fps=[],mapOpen=false,lt=0,li=-1;
const IC=['','#9aa08c','#6fb06a','#4d9de0','#a56bd6','#f2c14e','#ff4d2e'],AB=['','PST','SMG','SHT','RFL','PLS','CRB','SWD','SCR','HND','MNG'];
const cw=()=>{const s=p&&p.sel>=0?p.inv[p.sel]:null;return s&&s.k==='w'?WP[s.i]:WP[0]};
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
/* main menu song: synthesized loop, Am F C G */
const MUS={on:false,t:0,step:0,iv:null,g:null},MCH=[[220,261.63,329.63],[174.61,220,261.63],[261.63,329.63,392],[196,246.94,293.66]],MBS=[110,87.31,130.81,98],MSP=.46;
function mnote(a,f,t,d,ty,v,att){const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+att);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(MUS.g);o.start(t);o.stop(t+d+.05)}
function musTick(){const a=AC;if(!a||!MUS.on)return;if(a.state==='suspended')a.resume();MUS.g.gain.value=(muted||opts.vol<=0)?0:.55*opts.vol/100;
 while(MUS.t<a.currentTime+.6){const t=MUS.t,s=MUS.step%8,b=(MUS.step>>3)%4,ch=MCH[b];
  if(s===0){for(const f of ch){mnote(a,f,t,3.9,'triangle',.05,.9);mnote(a,f*1.003,t,3.9,'sine',.04,1.1)}mnote(a,MBS[b],t,3.5,'sine',.2,.05)}
  if(s===4)mnote(a,MBS[b],t,1.8,'sine',.12,.05);
  const pat=[0,2,1,2,0,2,1,-1][s];if(pat>=0)mnote(a,ch[pat]*2,t,1.1,'sine',.07,.03);
  if(s===6&&b%2===1)mnote(a,ch[2]*4,t,1.6,'triangle',.03,.05);
  MUS.t+=MSP;MUS.step++}}
function musStart(){if(MUS.on)return;const a=ac();if(!a)return;MUS.on=true;MUS.step=0;MUS.t=a.currentTime+.15;MUS.g=a.createGain();MUS.g.gain.value=0;MUS.g.connect(a.destination);MUS.iv=setInterval(musTick,150)}
function musStop(){if(!MUS.on)return;MUS.on=false;clearInterval(MUS.iv);const g=MUS.g,a=AC;if(g&&a){g.gain.setTargetAtTime(0,a.currentTime,.25);setTimeout(()=>{try{g.disconnect()}catch(e){}},1500)}}
setInterval(()=>{const o=$('ov'),m=o&&o.classList.contains('menu')&&!o.classList.contains('hide');if(m&&!MUS.on)musStart();else if(!m&&MUS.on)musStop()},400);
function bossRoar(){snd('sawtooth',620,180,.5,.10);snd('sawtooth',120,36,2.0,.30);snd('square',72,26,2.2,.14);snd('n',1100,0,1.4,.22);
 setTimeout(()=>{snd('sawtooth',170,50,1.6,.20);snd('n',500,0,1.6,.20)},380);setTimeout(()=>{snd('sawtooth',95,30,1.8,.26);snd('n',260,0,2.2,.26)},1100)}
function snd(ty,f0,f1,dur,vol){const a=(muted||opts.vol<=0)?null:ac();if(!a)return;const t=a.currentTime,g=a.createGain();g.gain.setValueAtTime(vol*opts.vol/100,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);g.connect(a.destination);
 if(ty==='n'){const n=a.sampleRate*dur|0,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=f0;s.connect(f);f.connect(g);s.start(t)}
 else{const o=a.createOscillator();o.type=ty;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);o.connect(g);o.start(t);o.stop(t+dur)}}
const fireSnd=w=>{const f=[()=>snd('n',500,0,.06,.2),()=>snd('n',2500,0,.09,.22),()=>snd('n',3200,0,.05,.18),()=>snd('n',1100,0,.22,.35),()=>snd('n',1800,0,.14,.3),()=>snd('sawtooth',900,200,.1,.1),()=>snd('n',700,0,.08,.16),()=>snd('n',1200,0,.09,.18),()=>snd('n',2800,0,.06,.2),()=>{snd('n',900,0,.28,.45);snd('sine',90,40,.2,.3)},()=>snd('n',3500,0,.04,.14),()=>snd('n',600,0,.1,.2),()=>snd('n',1800,0,.07,.15),()=>snd('sawtooth',90,70,.09,.15),()=>snd('n',2200,0,.1,.3),()=>snd('n',2600,0,.06,.18),()=>snd('triangle',300,150,.12,.15),()=>{snd('n',1200,0,.25,.4);snd('sine',70,35,.25,.3)},()=>snd('sawtooth',1500,300,.25,.2),()=>{snd('n',1900,0,.05,.2);snd('square',170,100,.04,.07)},()=>{snd('sawtooth',420,90,.18,.22);snd('n',2200,0,.08,.2);snd('sine',1300,300,.12,.1)},()=>snd('n',450,0,.05,.12),()=>snd('n',700,0,.08,.16),()=>snd('triangle',520,180,.1,.14),()=>{snd('n',800,0,.32,.5);snd('sine',100,35,.3,.35)}][WP.indexOf(w)];if(f)f()};
$('mm').onclick=()=>{if(paused||!p)return;mapOpen=true;$('bigmap').style.display='flex'};
$('bigmap').onclick=()=>{mapOpen=false;$('bigmap').style.display='none'};
function bigmap(){const c=$('bm'),g=c.getContext('2d'),S=c.width,s=S/WS;
 g.fillStyle='#6aa04b';g.fillRect(0,0,S/2,S/2);g.fillStyle='#d8bf7c';g.fillRect(S/2,0,S/2,S/2);g.fillStyle='#3f7a3b';g.fillRect(0,S/2,S/2,S/2);g.fillStyle='#e6eef3';g.fillRect(S/2,S/2,S/2,S/2);
 g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;
 for(let i=0;i<=8;i++){const v=i*S/8;g.beginPath();g.moveTo(v,0);g.lineTo(v,S);g.moveTo(0,v);g.lineTo(S,v);g.stroke()}
 bl.forEach(b=>{g.fillStyle=b.c;bm(g,b,s,5)});
 g.fillStyle='rgba(255,255,255,.85)';g.font='700 18px sans-serif';g.textAlign='center';
 for(let i=0;i<8;i++){g.fillText('ABCDEFGH'[i],(i+.5)*S/8,20);g.fillText(String(i+1),14,(i+.5)*S/8+6)}
 g.font='700 22px sans-serif';[[1,.25,.25],[2,.75,.25],[3,.25,.75],[4,.75,.75]].forEach(v=>{const nm=TX('z'+v[0]).toLocaleUpperCase(opts.lang),x=S*v[1],y=S*v[2]+8;g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.6)';g.strokeText(nm,x,y);g.fillStyle='#fff';g.fillText(nm,x,y)});
 HM.forEach(h=>{const x=h[0]*s,y=h[1]*s;g.fillStyle='#ff7a1a';g.strokeStyle='#000';g.lineWidth=2.5;g.beginPath();g.moveTo(x,y-9);g.lineTo(x+8,y+7);g.lineTo(x-8,y+7);g.closePath();g.fill();g.stroke();g.fillStyle='#fff';g.font='700 13px sans-serif';g.fillText('H',x,y+5)});
 RL.forEach(r=>{g.fillStyle=PC[r.c||0];g.strokeStyle='#26211c';g.lineWidth=3;g.beginPath();g.arc(r.x*s,r.y*s,9,0,TAU);g.fill();g.stroke();g.fillStyle='#fff';g.font='700 16px sans-serif';g.fillText(r.n,r.x*s,r.y*s-14)});
 MYG.forEach(t=>graveMark(g,t[0]*s,t[1]*s,1.4));
 if(p){const x=p.x*s,y=p.y*s;g.save();g.translate(x,y);g.rotate(p.a);g.fillStyle='#fff';g.strokeStyle='#26211c';g.lineWidth=3;g.beginPath();g.moveTo(14,0);g.lineTo(-9,-9);g.lineTo(-9,9);g.closePath();g.fill();g.stroke();g.restore();
  g.strokeStyle='#e0803a';g.lineWidth=3;g.beginPath();g.arc(x,y,20+Math.sin(performance.now()/300)*3,0,TAU);g.stroke()}}
function los(x1,y1,x2,y2){const d=Math.hypot(x2-x1,y2-y1),n=Math.ceil(d/8);for(let i=1;i<n;i++){const t=i/n;if(inWall(x1+(x2-x1)*t,y1+(y2-y1)*t))return false}return true}
function renderInv(){const el=$('inv');el.innerHTML='';p.inv.forEach((it,i)=>{const b=document.createElement('button');b.className='sl'+(i===p.sel?' eq':'');
 if(it){b.style.borderColor=IC[it.s];b.style.background=IC[it.s];b.innerHTML='<img src="'+iconUrl(it)+'" width="30" height="20" style="pointer-events:none"><small>'+(it.s>4?'★'+it.s:stars(it.s))+'</small>'+(MG[it.i]&&it.k==='w'?'<i class="rb"></i><i class="am"></i>':'')+((it.n||1)>1?'<i class="cn">×'+it.n+'</i>':'')}
 tapB(b,()=>slotTap(i));el.appendChild(b)});
 /* gear slot split by a diagonal: vest top-left, shoes bottom-right */
 const v=document.createElement('div');v.className='sl ar';
 for(const[kind,it,cl]of[['a',p.armor,'tl'],['f',p.shoes,'br']]){const h=document.createElement('button');h.className='gh2 '+cl;if(it)h.style.background=IC[it.s];
  h.innerHTML='<img'+(it?'':' class="gh"')+' src="'+iconUrl(it||{k:kind,s:0,i:0})+'" style="pointer-events:none">'+(it?'<small>'+(it.s-1)+'</small>':'');tapB(h,()=>gearTap(kind));v.appendChild(h)}
 const dg=document.createElement('i');dg.className='dg';v.appendChild(dg);el.appendChild(v)}
/* phones send no 'click' for a second finger, so in-game buttons act on pointerdown */
function tapB(el,fn){el.onpointerdown=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();fn()}}
/* double tap half of the gear slot to drop the vest or the shoes */
function gearTap(k){const key=k==='a'?'armor':'shoes',it=p&&p[key];if(!it||paused)return;const n=performance.now(),id=k==='a'?4:5;
 if(li===id&&n-lt<350){p[key]=null;li=-1;sendWS({t:'drop',k,s:it.s,i:0,n:1});snd('sine',320,130,.12,.16);renderInv();return}li=id;lt=n;toast(inm(it)+' · '+(k==='a'?'-'+(it.s-1)*12.5+'%':'+'+(it.s-1)*12.5+'% '+TX('spdw')))}
const SC=it=>it.k==='g'?(it.i===1?1:it.i===5?2:3):it.k==='p'?2:it.k==='h'?(it.s===2?4:it.s===3?3:2):1;
const same=(x,it)=>x&&x.k===it.k&&x.s===it.s&&(x.i|0)===(it.i|0);
function roomFor(it){const c=SC(it);let r=0;for(const x of p.inv){if(!x)r+=c;else if(c>1&&same(x,it))r+=c-(x.n||1)}return r}
function canTake(g){if(!p)return false;if(g.k==='a')return !p.armor||g.s>p.armor.s;if(g.k==='f')return !p.shoes||g.s>p.shoes.s;return roomFor(g)>=1}
function addItem(it){let n=it.n||1;const c=SC(it);
 if(c>1)for(const x of p.inv)if(same(x,it)&&(x.n||1)<c){const a=Math.min(n,c-(x.n||1));x.n=(x.n||1)+a;n-=a;if(!n)break}
 while(n>0){const i=p.inv.indexOf(null);if(i<0)break;const a=Math.min(n,c);p.inv[i]={k:it.k,s:it.s,i:it.i,n:a};n-=a;
  if(it.k==='w'){const cur=p.sel>=0?p.inv[p.sel]:null;if(!cur||it.s>cur.s||cur===p.inv[i])p.sel=i}}
 renderInv();return n}
function useOne(i){const it=p.inv[i];it.n=(it.n||1)-1;if(it.n<=0){p.inv[i]=null;if(p.sel===i)p.sel=-1}}
function dropItem(i){const it=p.inv[i];p.inv[i]=null;if(p.sel===i)p.sel=-1;sendWS({t:'drop',k:it.k,s:it.s,i:it.i,n:it.n||1});snd('sine',320,130,.12,.16);snd('n',700,0,.05,.08);renderInv()}
function slotTap(i){const it=p.inv[i];if(!it||paused)return;const n=performance.now();
 if(li===i&&n-lt<350){dropItem(i);li=-1;return}li=i;lt=n;
 if(it.k==='w'||it.k==='g'){p.sel=p.sel===i?-1:i;snd('sine',500,500,.05,.08)}
 else if(it.k==='p')drinkPotion(i);
 else if(it.k==='y'){toast(inm(it));return}
 else{if(p.hp>=100){toast(TX('hfull'));return}p.hp=Math.min(100,p.hp+20*it.s);sendWS({t:'heal',a:20*it.s});useOne(i);snd('sine',400,800,.25,.15);toast('+'+20*it.s+' HP')}
 renderInv()}
function drop(){buff.spd=buff.rg=buff.slow=buff.weak=buff.inv=0;
 let x,y,n=0;do{x=150+Math.random()*1350;y=150+Math.random()*1350;n++}while((inWall(x,y,40)||trees.some(t=>Math.hypot(x-t[0],y-t[1])<t[2]+20))&&n<80);
 p={x,y,a:0,hp:100,inv:[null,null,null,null],armor:null,shoes:null,sel:-1,cd:0,col:SK[opts.skin].col,hair:SK[opts.skin].hair,acc:SK[opts.skin].acc,face:SK[opts.skin].face};zs=[];bs=[];gi=[];fps=[];srch=null;dying=[];kills=0;life=0;paused=false;ac();renderInv();$('ov').classList.add('hide')}
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),1600)}
const stars=n=>'★'.repeat(n);
function die(){paused=true;snd('sawtooth',220,30,.9,.25);showDeath()}
/* settings, languages, skins and the main menu */
const FACE=new Image();FACE.src='face.webp';const BFACE=new Image();BFACE.src='boss_face.webp';
/* face skins: skin.face is 1 + the index in FIMG */
const FIMG=[FACE,BFACE,...['mecid', 'vusal', 'zehra', 'timu', 'peri'].map(n=>{const im=new Image();im.src=n+'.webp';return im})];
const SK=[{n:'ember',col:'#d9692b',hair:'#3b2a20'},{n:'frost',col:'#3b8fd9',hair:'#dfeaf2'},{n:'rose',col:'#c94a7a',hair:'#2a1a22'},{n:'violet',col:'#7a52c9',hair:'#e8d34a'},{n:'moss',col:'#2fa37a',hair:'#5a3a22'},{n:'gold',col:'#c9a02f',hair:'#1f1f1f'},{n:'shadow',col:'#2b2d33',hair:'#9aa0aa'},{n:'bone',col:'#d8d2c0',hair:'#6b2a2a'},{n:'cowboy',col:'#8a6a3a',hair:'#4a3220',acc:'cowboy'},{n:'knight',col:'#7d8791',hair:'#9aa3ad',acc:'knight'},{n:'bunny',col:'#e9e3ee',hair:'#f4b6c8',acc:'bunny'},{n:'devil',col:'#a8231c',hair:'#2a0f0f',acc:'devil'},{n:'king',col:'#6a2a8c',hair:'#e8d34a',acc:'king'},{n:'punk',col:'#2b2d33',hair:'#ff4fa0',acc:'punk'},{n:'angel',col:'#f2f2f2',hair:'#f0d878',acc:'angel'},{n:'robot',col:'#7b8590',hair:'#4de0ff',acc:'robot'},{n:'cat',col:'#e0a050',hair:'#3a2a1a',acc:'cat'},{n:'viking',col:'#5a3a22',hair:'#d9a73a',acc:'viking'},{n:'wizard',col:'#4a38b0',hair:'#e8e8f0',acc:'wizard'},{n:'pirate',col:'#3a3a44',hair:'#8a5a2b',acc:'pirate'},{n:'ninja',col:'#22242a',hair:'#22242a',acc:'ninja'},{n:'astronaut',col:'#e8ecef',hair:'#c8ccd2',acc:'astronaut'},{n:'chef',col:'#f4f4f4',hair:'#5a3a22',acc:'chef'},{n:'alien',col:'#5ad07a',hair:'#3a8a52',acc:'alien'},{n:'me',col:'#e8c39a',hair:'#3b2a20',face:1},{n:'nurlan',col:'#e8c39a',hair:'#3b2a20',face:2},{n:'mecid',col:'#e8c39a',hair:'#3b2a20',face:3},{n:'vusal',col:'#e8c39a',hair:'#3b2a20',face:4},{n:'zehra',col:'#e8c39a',hair:'#3b2a20',face:5},{n:'timu',col:'#e8c39a',hair:'#3b2a20',face:6},{n:'peri',col:'#e8c39a',hair:'#3b2a20',face:7}],PC=SK.map(s=>s.col);
let opts={name:'',skin:0,vol:100,bs:100,sens:100,lang:'en'},SENS=1;
try{Object.assign(opts,JSON.parse(localStorage.getItem('ashfall_opts')||'{}'))}catch(e){}
const clampN=(v,a,b,d)=>{v=+v;return isFinite(v)?Math.max(a,Math.min(b,v)):d};
opts.skin=clampN(opts.skin,0,SK.length-1,0)|0;opts.vol=clampN(opts.vol,0,100,100);opts.bs=clampN(opts.bs,70,140,100);opts.sens=clampN(opts.sens,50,200,100);opts.name=String(opts.name||'').slice(0,14);
const saveOpts=()=>{try{localStorage.setItem('ashfall_opts',JSON.stringify(opts))}catch(e){}};
const L={en:{shoes:'Shoes Lv.',spdw:'speed',vest:'Vest Lv.',mkey:'Mystery key',ukey:'Use key',nokey:'Needs Mystery key',kopen:'Shrine opened!',acd:'Altar ready in {s}s',awaken:'Awaken',bspawn:'Wormy awakens!',bdead:'Wormy defeated!',nspawn:'NURLAN has been summoned!',ndead:'NURLAN has been defeated!',nleave:'NURLAN lost interest and left.',nwait:'The shrine is not ready. Key returned.',nbn:'NURLAN',bossn:'WORMY',weak:'Weakened',slow:'Slowed',play:'Play',skins:'Skins',options:'Options',back:'Back',name:'Your name',drop:'Drop in',again:'Drop in again',menu:'Main menu',died:'You died',diedsub:'{k} zombies down · survived {t}<br>Your gear is gone. Drop back in with nothing.',sound:'Sound',bsize:'Button size',sens:'Sensitivity',lang:'Language',conn:'Connecting to the server. If it was asleep, this can take about a minute.',connfail:'Could not reach the server. Check your connection and try again.',search:'Search',grenade:'Grenade',mine:'Proximity Mine',spdp:'Speed Potion',ragep:'Rage Potion',spd:'Speed',rage:'Rage',smoke:'Smoke grenade',turret:'Auto Turret',bkin:'Ride',bkout:'Get off',lure:'Lure box',molo:'Molotov',invp:'Invisibility potion',invOn:'Invisible for 15s!',invt:'Invisible',spdOn:'Speed boost for 30s!',rageOn:'Rage: +20% damage for 30s!',reload:'Reloading',replace:'Replace {a} with {b}',item:'item',kills:'Kills',online:'online',hidden:'Hidden',hfull:'Health is full',full:'Inventory full',fs:'Fullscreen',fsx:'Exit fullscreen',son:'Sound on',soff:'Sound off',close:'Tap anywhere to close',disc:'Disconnected',discsub:'Lost the connection to the server.',recon:'Reconnect',z1:'Grasslands',z2:'Desert',z3:'Dense Forest',z4:'Snow Land',sk_ember:'Ember',sk_frost:'Frost',sk_rose:'Rose',sk_violet:'Violet',sk_moss:'Moss',sk_gold:'Gold',sk_shadow:'Shadow',sk_bone:'Bone',sk_cowboy:'Cowboy',sk_knight:'Knight',sk_bunny:'Bunny',sk_devil:'Devil',sk_king:'King',sk_punk:'Punk',sk_angel:'Angel',sk_robot:'Robot',sk_cat:'Cat',sk_viking:'Viking',sk_wizard:'Wizard',sk_pirate:'Pirate',sk_ninja:'Ninja',sk_astronaut:'Astronaut',sk_chef:'Chef',sk_alien:'Alien',sk_me:'Turan',sk_nurlan:'Nurlan',sk_mecid:'Mecid',sk_vusal:'Vusal',sk_zehra:'Zehra',sk_timu:'Timu',sk_peri:'Peri',bburrow:'Wormy burrowed deep underground!'},
 tr:{shoes:'Ayakkabı Sv.',spdw:'hız',vest:'Yelek Sv.',mkey:'Gizemli anahtar',ukey:'Anahtarı kullan',nokey:'Gizemli anahtar gerek',kopen:'Tapınak açıldı!',acd:'Sunak {s} sn sonra hazır',awaken:'Uyandır',bspawn:'Wormy uyandı!',bdead:'Wormy yenildi!',nspawn:'NURLAN çağrıldı!',ndead:'NURLAN yenildi!',nleave:'NURLAN sıkılıp gitti.',nwait:'Tapınak hazır değil. Anahtar iade edildi.',nbn:'NURLAN',bossn:'WORMY',weak:'Zayıf',slow:'Yavaş',play:'Oyna',skins:'Görünümler',options:'Ayarlar',back:'Geri',name:'Adın',drop:'Oyuna gir',again:'Tekrar gir',menu:'Ana menü',died:'Öldün',diedsub:'{k} zombi indirdin · {t} hayatta kaldın<br>Eşyaların gitti. Eli boş geri dön.',sound:'Ses',bsize:'Düğme boyutu',sens:'Hassasiyet',lang:'Dil',conn:'Sunucuya bağlanılıyor. Sunucu uyuyorsa bir dakika kadar sürebilir.',connfail:'Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.',search:'Ara',grenade:'El Bombası',mine:'Yakınlık Mayını',spdp:'Hız İksiri',ragep:'Öfke İksiri',spd:'Hız',rage:'Öfke',smoke:'Sis bombası',turret:'Otomatik Taret',bkin:'Bin',bkout:'In',lure:'Yem kutusu',molo:'Molotof',invp:'Görünmezlik iksiri',invOn:'15sn görünmezsin!',invt:'Görünmez',spdOn:'30sn hız artışı!',rageOn:'Öfke: 30sn boyunca %20 hasar!',reload:'Dolduruluyor',replace:'{a} yerine {b} al',item:'eşya',kills:'Öldürme',online:'çevrimiçi',hidden:'Gizli',hfull:'Can dolu',full:'Envanter dolu',fs:'Tam ekran',fsx:'Tam ekrandan çık',son:'Ses açık',soff:'Ses kapalı',close:'Kapatmak için dokun',disc:'Bağlantı koptu',discsub:'Sunucuyla bağlantı kesildi.',recon:'Yeniden bağlan',z1:'Çayırlar',z2:'Çöl',z3:'Yoğun Orman',z4:'Karlı Diyar',sk_ember:'Kor',sk_frost:'Buz',sk_rose:'Gül',sk_violet:'Mor',sk_moss:'Yosun',sk_gold:'Altın',sk_shadow:'Gölge',sk_bone:'Kemik',sk_cowboy:'Kovboy',sk_knight:'Şövalye',sk_bunny:'Tavşan',sk_devil:'Şeytan',sk_king:'Kral',sk_punk:'Punk',sk_angel:'Melek',sk_robot:'Robot',sk_cat:'Kedi',sk_viking:'Viking',sk_wizard:'Büyücü',sk_pirate:'Korsan',sk_ninja:'Ninja',sk_astronaut:'Astronot',sk_chef:'Aşçı',sk_alien:'Uzaylı',sk_me:'Turan',sk_nurlan:'Nurlan',sk_mecid:'Mecid',sk_vusal:'Vusal',sk_zehra:'Zehra',sk_timu:'Timu',sk_peri:'Peri',bburrow:'Wormy yerin derinlerine gömüldü!'}};
if(!L[opts.lang])opts.lang='en';
WP.forEach((w,i)=>{L.en['w'+i]=w.nm});HL.forEach((x,s)=>{if(x)L.en['h'+s]=x});
['Yumruk','Tabanca','SMG','Pompalı','Tüfek','Plazma Tüfeği','Levye','Kılıç','SCAR','El Topu','Minigun','Yangın Baltası','Katana','Motorlu Testere','Revolver','Karabina','Tatar Yayı','Keskin Nişancı','Lazer Topu','MP40','Solucan Dişi','Alev Silahı','Beyzbol Sopası','Av Yayı'].forEach((n,i)=>{L.tr['w'+i]=n});
['','Sargı','Ağrı Kesici','İlk Yardım Çantası','Travma Seti','Ameliyat Seti'].forEach((n,s)=>{if(n)L.tr['h'+s]=n});
const TX=k=>(L[opts.lang]||L.en)[k]||L.en[k]||k,wn=i=>TX('w'+i),hn=s=>TX('h'+s);
const FLAG={en:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#012169"/><path d="M0 0L60 40M60 0L0 40" stroke="#fff" stroke-width="7"/><path d="M0 0L60 40M60 0L0 40" stroke="#c8102e" stroke-width="3"/><path d="M30 0V40M0 20H60" stroke="#fff" stroke-width="12"/><path d="M30 0V40M0 20H60" stroke="#c8102e" stroke-width="7"/></svg>',
 tr:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#e30a17"/><circle cx="22" cy="20" r="10" fill="#fff"/><circle cx="25" cy="20" r="8" fill="#e30a17"/><polygon points="30.00,20.00 33.30,18.77 33.45,15.24 35.65,18.00 39.05,17.06 37.10,20.00 39.05,22.94 35.65,22.00 33.45,24.76 33.30,21.23" fill="#fff"/></svg>'};
const ovEl=$('ov'),card=$('card');let scr=null,fxRun=false;
const ovShow=m=>{ovEl.className=m?'menu':''};
const LOGO=sm=>'<h1 class="logo'+(sm?' sm':'')+'"><span>ASH</span>FALL</h1>';
function nav(fn){scr=fn;fn()}
function setMuteTxt(){$('mute').textContent=muted?TX('soff'):TX('son')}
function applyOpts(){document.documentElement.style.setProperty('--bs',opts.bs/100);SENS=opts.sens/100}
function applyLang(){document.documentElement.lang=opts.lang;$('lootb').textContent=TX('search');$('fullb').textContent=TX('full');const bp=$('bigmap').querySelector('p');if(bp)bp.textContent=TX('close');setMuteTxt();if(window.updFs)window.updFs();if(scr&&!ovEl.classList.contains('hide'))scr()}
/* falling ash behind the menu */
const fxc=$('fx'),fxg=fxc.getContext('2d');let ashf=[];
function fxStart(){if(fxRun)return;fxRun=true;fxc.width=innerWidth;fxc.height=innerHeight;
 ashf=Array.from({length:55},()=>({x:Math.random()*fxc.width,y:Math.random()*fxc.height,r:1+Math.random()*2.6,v:14+Math.random()*30,w:Math.random()*6.28}));let l=performance.now();
 const f=n=>{if(!ovEl.classList.contains('menu')||ovEl.classList.contains('hide')){fxRun=false;return}
  const dt=Math.min(.05,(n-l)/1000);l=n;fxg.clearRect(0,0,fxc.width,fxc.height);fxg.fillStyle='rgba(30,28,25,.28)';
  for(const a of ashf){a.y+=a.v*dt;a.w+=dt;a.x+=Math.sin(a.w)*12*dt;if(a.y>fxc.height){a.y=-5;a.x=Math.random()*fxc.width}fxg.beginPath();fxg.arc(a.x,a.y,a.r,0,TAU);fxg.fill()}
  requestAnimationFrame(f)};requestAnimationFrame(f)}
addEventListener('resize',()=>{if(fxRun){fxc.width=innerWidth;fxc.height=innerHeight}});
/* screens */
function showMenu(){ovShow(1);
 card.innerHTML=LOGO()+'<div class="mcol"><button class="mc" id="m_play">'+TX('play')+'</button><button class="mc" id="m_skins">'+TX('skins')+'</button><button class="mc" id="m_opts">'+TX('options')+'</button></div>';
 $('m_play').onclick=()=>nav(showPlay);$('m_skins').onclick=()=>nav(showSkins);$('m_opts').onclick=()=>nav(showOpts);fxStart()}
function showPlay(){ovShow(1);
 card.innerHTML=LOGO(1)+'<input type="text" id="m_nm" maxlength="14" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="'+esc(TX('name'))+'" value="'+esc(opts.name)+'"><p class="stt" id="m_st"></p><div class="mcol"><button class="mc" id="m_go">'+TX('drop')+'</button><button class="mc" id="m_bk">'+TX('back')+'</button></div>';
 $('m_go').onclick=startGame;$('m_bk').onclick=()=>nav(showMenu);$('m_nm').onkeydown=e=>{if(e.key==='Enter')startGame()};fxStart()}
async function startGame(){const inp=$('m_nm'),n=(inp.value||'').replace(/[<>&"]/g,'').trim().slice(0,14);
 if(!n){inp.focus();return}
 opts.name=n;saveOpts();const btn=$('m_go'),say=s=>{const e=$('m_st');if(e)e.textContent=s};
 btn.disabled=true;ac();
 if(!WSK){say(TX('conn'));await ensureConn()}
 if(!WSK){say(TX('connfail'));const b=$('m_go');if(b)b.disabled=false;return}
 prof.name=n;sendWS({t:'join',name:n,skin:opts.skin});drop()}
function drawAcc(g,a){if(!a)return;const O='#14160f',C=(x,y,r,f)=>{g.beginPath();g.arc(x,y,r,0,TAU);g.fillStyle=f;g.fill();g.strokeStyle=O;g.lineWidth=2;g.stroke()},T=(q,f)=>{g.beginPath();g.moveTo(q[0],q[1]);for(let i=2;i<q.length;i+=2)g.lineTo(q[i],q[i+1]);g.closePath();g.fillStyle=f;g.fill();g.strokeStyle=O;g.lineWidth=1.6;g.stroke()},E=(x,y,rx,ry,rt,f)=>{g.beginPath();g.ellipse(x,y,rx,ry,rt,0,TAU);g.fillStyle=f;g.fill();g.strokeStyle=O;g.lineWidth=1.6;g.stroke()};
 if(a==='cowboy'){C(-1,0,13,'#9a6a35');C(-1,0,6.5,'#6f4a22');g.strokeStyle='#d9b45a';g.lineWidth=2;g.beginPath();g.arc(-1,0,5.2,0,TAU);g.stroke()}
 else if(a==='knight'){C(-1,0,9.8,'#a9b3bd');g.fillStyle='#d23a3a';g.fillRect(-9,-1.6,12,3.2);g.fillStyle='#14160f';g.fillRect(3,-5,3,10)}
 else if(a==='bunny'){E(-5,-9.5,8,3.3,-.35,'#f4f0f6');E(-5,-9.5,5.5,1.5,-.35,'#f4a8c0');E(-5,9.5,8,3.3,.35,'#f4f0f6');E(-5,9.5,5.5,1.5,.35,'#f4a8c0')}
 else if(a==='devil'){T([0,-6,7,-14,5,-5],'#c4201a');T([0,6,7,14,5,5],'#c4201a')}
 else if(a==='king'){g.strokeStyle=O;g.lineWidth=5;g.beginPath();g.arc(-1,0,8.2,0,TAU);g.stroke();g.strokeStyle='#f2c14e';g.lineWidth=3;g.beginPath();g.arc(-1,0,8.2,0,TAU);g.stroke();for(let i=0;i<6;i++){const q=i/6*TAU;T([-1+Math.cos(q-.2)*8.4,Math.sin(q-.2)*8.4,-1+Math.cos(q)*12.8,Math.sin(q)*12.8,-1+Math.cos(q+.2)*8.4,Math.sin(q+.2)*8.4],'#f2c14e')}C(-1,0,2.4,'#d63a3a')}
 else if(a==='punk'){g.fillStyle='#ff4fa0';g.strokeStyle=O;g.lineWidth=1.8;g.beginPath();g.rect(-9,-2.4,18,4.8);g.fill();g.stroke();for(let i=0;i<5;i++){T([-8+i*4,-2.4,-6+i*4,-5.6,-4+i*4,-2.4],'#ff7ac0');T([-8+i*4,2.4,-6+i*4,5.6,-4+i*4,2.4],'#ff7ac0')}}
 else if(a==='angel'){E(-9,-13,10,4,.7,'#f4f4f4');E(-9,13,10,4,-.7,'#f4f4f4');g.strokeStyle='rgba(255,236,140,.95)';g.lineWidth=3;g.beginPath();g.arc(-1,0,11.5,0,TAU);g.stroke();g.strokeStyle=O;g.lineWidth=1;g.beginPath();g.arc(-1,0,13.1,0,TAU);g.stroke()}
 else if(a==='robot'){g.strokeStyle='#555';g.lineWidth=2;g.beginPath();g.moveTo(-1,0);g.lineTo(-10,0);g.stroke();C(-11,0,2.6,'#ff4040');g.fillStyle='#4de0ff';g.fillRect(2,-5.2,4,10.4);g.strokeStyle=O;g.lineWidth=1.4;g.strokeRect(2,-5.2,4,10.4);C(0,-12.6,2.3,'#9aa0a8');C(0,12.6,2.3,'#9aa0a8')}
 else if(a==='cat'){g.lineCap='round';g.strokeStyle=O;g.lineWidth=7;g.beginPath();g.moveTo(-13,0);g.quadraticCurveTo(-23,-3,-26,7);g.stroke();g.strokeStyle='#e0a050';g.lineWidth=4;g.stroke();T([0,-6,5,-13,6,-5],'#e0a050');T([0,6,5,13,6,5],'#e0a050');T([1.5,-6,5,-10.5,5.2,-5.4],'#f4a8c0');T([1.5,6,5,10.5,5.2,5.4],'#f4a8c0')}
 else if(a==='viking'){C(-1,0,9.4,'#8a929a');g.fillStyle='#5a3a22';g.fillRect(-4,-9.4,3,18.8);T([0,-8,9,-15,6,-7],'#efe6cc');T([0,8,9,15,6,7],'#efe6cc')}
 else if(a==='wizard'){C(-1,0,12,'#3b2a8c');C(-1,0,6,'#5a48d0');g.strokeStyle='#f2c14e';g.lineWidth=2;g.beginPath();g.arc(-1,0,4.2,0,TAU);g.stroke();C(1,-1.5,1.6,'#f2c14e')}
 else if(a==='pirate'){T([-10,-11,10,0,-10,11],'#1f1f24');C(-2,0,2.4,'#eee');g.fillStyle='#14160f';g.fillRect(4,-4,2.4,3)}
 else if(a==='ninja'){g.strokeStyle='#c0302a';g.lineWidth=3.2;g.beginPath();g.arc(-1,0,8.6,0,TAU);g.stroke();T([-9,0,-18,-4,-16,1],'#c0302a');T([-9,0,-19,4,-15,-1],'#c0302a')}
 else if(a==='astronaut'){g.fillStyle='#c8ccd2';g.fillRect(-19,-7,8,14);g.strokeStyle=O;g.lineWidth=1.6;g.strokeRect(-19,-7,8,14);C(-1,0,10.6,'rgba(225,238,248,.92)');g.fillStyle='#2a5d9a';g.fillRect(2,-6.5,6,13);g.strokeStyle=O;g.lineWidth=1.4;g.strokeRect(2,-6.5,6,13)}
 else if(a==='chef'){C(-1,-4.5,6.4,'#fff');C(-1,4.5,6.4,'#fff');C(-5,0,6.4,'#fff');C(1,0,6.4,'#fff');g.strokeStyle='#cfcfcf';g.lineWidth=1.2;g.beginPath();g.arc(-1,0,3.4,0,TAU);g.stroke()}
 else if(a==='alien'){g.strokeStyle='#3a8a52';g.lineWidth=2;g.beginPath();g.moveTo(1,-5);g.lineTo(8,-13);g.moveTo(1,5);g.lineTo(8,13);g.stroke();C(9,-14,2.6,'#7dff7d');C(9,14,2.6,'#7dff7d');C(5,-3.4,2.8,'#111');C(5,3.4,2.8,'#111')}}
function drawSkin(c,s){const g=c.getContext('2d');g.clearRect(0,0,64,64);g.save();g.translate(30,32);g.scale(1.2,1.2);
 const ci=(x,y,r,f)=>{g.fillStyle=f;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.lineWidth=2;g.strokeStyle='#26211c';g.stroke()};
 g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.arc(2,4,14,0,TAU);g.fill();
 ci(17,-8,5,'#e8c39a');ci(17,8,5,'#e8c39a');ci(0,0,14,s.col);if(s.face){const IM=FIMG[s.face-1],dr=()=>{g.save();g.rotate(-Math.PI/2);g.drawImage(IM,-14,-14,28,28);g.restore();g.beginPath();g.arc(0,0,14,0,TAU);g.lineWidth=2;g.strokeStyle='#26211c';g.stroke()};if(IM.complete&&IM.naturalWidth)dr();else IM.addEventListener('load',()=>{g.save();g.translate(30,32);g.scale(1.2,1.2);dr();g.restore()},{once:true})}else{ci(-1,0,8.5,s.hair);ci(3,0,3.8,'#e8c39a');drawAcc(g,s.acc)}g.restore()}
function showSkins(){ovShow(1);
 card.innerHTML=LOGO(1)+'<div class="skg">'+SK.map((s,i)=>'<button class="sk'+(i===opts.skin?' sel':'')+'" data-i="'+i+'"><canvas width="64" height="64"></canvas><span>'+TX('sk_'+s.n)+'</span></button>').join('')+'</div><div class="mcol"><button class="mc" id="m_bk">'+TX('back')+'</button></div>';
 card.querySelectorAll('.sk').forEach(b=>{const i=+b.dataset.i;drawSkin(b.querySelector('canvas'),SK[i]);b.onclick=()=>{opts.skin=i;saveOpts();card.querySelectorAll('.sk').forEach(x=>x.classList.toggle('sel',x===b));snd('sine',500,700,.06,.12)}});
 $('m_bk').onclick=()=>nav(showMenu);fxStart()}
function showOpts(){ovShow(1);
 const row=(id,lab,min,max,v)=>'<div class="orow"><label><span>'+lab+'</span><b id="v_'+id+'">'+v+'%</b></label><input type="range" id="r_'+id+'" min="'+min+'" max="'+max+'" value="'+v+'"></div>';
 card.innerHTML=LOGO(1)+row('vol',TX('sound'),0,100,opts.vol)+row('bs',TX('bsize'),70,140,opts.bs)+row('sens',TX('sens'),50,200,opts.sens)
  +'<div class="orow"><label><span>'+TX('lang')+'</span></label><div class="flags"><button class="flag'+(opts.lang==='en'?' sel':'')+'" data-l="en" aria-label="English">'+FLAG.en+'</button><button class="flag'+(opts.lang==='tr'?' sel':'')+'" data-l="tr" aria-label="Türkçe">'+FLAG.tr+'</button></div></div>'
  +'<div class="mcol"><button class="mc" id="m_bk">'+TX('back')+'</button></div>';
 [['vol'],['bs'],['sens']].forEach(([k])=>{const r=$('r_'+k);r.oninput=()=>{opts[k]=+r.value;$('v_'+k).textContent=r.value+'%';applyOpts();saveOpts()};if(k==='vol')r.onchange=()=>snd('triangle',600,900,.12,.2)});
 card.querySelectorAll('.flag').forEach(b=>{b.onclick=()=>{opts.lang=b.dataset.l;saveOpts();applyLang()}});
 $('m_bk').onclick=()=>nav(showMenu);fxStart()}
function showDeath(){ovShow(0);const m=Math.floor(life/60),s=String(Math.floor(life%60)).padStart(2,'0');
 card.innerHTML='<h1>'+TX('died')+'</h1><p class="sub">'+TX('diedsub').replace('{k}',kills).replace('{t}',m+':'+s)+'</p><div class="mcol"><button class="mc" id="m_again">'+TX('again')+'</button><button class="mc" id="m_menu">'+TX('menu')+'</button></div>';
 $('m_again').onclick=drop;$('m_menu').onclick=()=>nav(showMenu)}
function showDisc(){ovShow(0);card.innerHTML='<h1>'+TX('disc')+'</h1><p class="sub">'+TX('discsub')+'</p><div class="mcol"><button class="mc" onclick="location.reload()">'+TX('recon')+'</button></div>'}
let RL=[],pt=0;const rp={};
