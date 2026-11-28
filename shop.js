/* shop menu: left top = shopkeeper picture (shopkeeper.webp, blank until the file exists), left bottom = selected item + buy,
   right = scrollable item list. Prices are SHOPL in map.js + server.js. Gold (G) is counted by the server, which also checks each purchase. */
let gold=0,shopSel=0,shopOpen=false,buying=0;
/* the server counts gold; it arrives with every snapshot */
function setGold(g){if(g===gold)return;gold=g;if(shopOpen)shopDraw()}
const shopItem=n=>{const e=SHOPL[n];return{k:e[0],s:e[1],i:e[2],n:1}};
const SHX={en:{shop:'Shop',safe:'Safe zone',full:'Hold the item you want to replace',drops:'Drops your {a}',have:'You have this or better',bought:'Bought',wait:'...',buy:'Buy',poor:'Not enough G',close:'Close'},
 tr:{shop:'Mağaza',safe:'Güvenli bölge',full:'Değiştireceğin eşyayı eline al',drops:'{a} yere düşecek',have:'Bu veya daha iyisi sende var',bought:'Satın alındı',wait:'...',buy:'Satın al',poor:'Yetersiz G',close:'Kapat'}};
for(const k in SHX){L[k].shop=SHX[k].shop}
const SX=k=>(SHX[opts.lang]||SHX.en)[k];
/* wooden-shop sounds (snd = tone helper from menu.js), music = shop.mp3 (silent if the file is missing), shopkeeper lines */
const SAY={hi:'ne lazimdi qaqa',buy:'buyur qaqa',poor:'pulun catmir qaqa'};
function say(k){const e=$('sh_say');if(!e)return;e.textContent=SAY[k];e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}
const SFX={tick:()=>snd('square',190,130,.045,.07),
 open:()=>{snd('sawtooth',95,55,.4,.05);setTimeout(()=>{snd('triangle',1568,1568,.35,.07);snd('sine',2350,2350,.3,.03)},180)},
 coins:()=>{[0,70,140].forEach((d,i)=>setTimeout(()=>snd('triangle',1300+i*260,1700+i*260,.09,.12),d))},
 poor:()=>{snd('square',160,90,.2,.09)},
 close:()=>snd('sine',130,60,.14,.14),
 creak:()=>snd('sawtooth',60+Math.random()*30,42,.45,.025)};
const shopMus=new Audio('shop.mp3');shopMus.loop=true;shopMus.preload='auto';shopMus.volume=.45;
let musFade=0,shopTimer=0;
function musicOn(){clearInterval(musFade);shopMus.volume=.45;shopMus.muted=muted;const r=shopMus.play();if(r&&r.catch)r.catch(()=>{})}
function musicOff(){clearInterval(musFade);musFade=setInterval(()=>{shopMus.volume=Math.max(0,shopMus.volume-.06);if(shopMus.volume<=0){clearInterval(musFade);shopMus.pause()}},60)}
const shopEl=document.createElement('div');shopEl.id='shop';
shopEl.innerHTML='<div class="shw"><div class="shh"><b id="sh_t"></b><span id="sh_g"></span><button id="sh_x"></button></div><div class="shg"><div class="shb" id="sh_view"><img id="sh_keep" alt="" hidden><div id="sh_say" hidden>ne lazimdi qaqa</div></div><div class="shb" id="sh_info"><img id="sh_ic" alt=""><div><b id="sh_n"></b><p id="sh_d"></p></div><button id="sh_buy"></button></div><div class="shb" id="sh_list"></div></div></div>';
document.body.appendChild(shopEl);
const nearShop=()=>!!p&&!paused&&inside(p,SHOP);
/* where a bought item goes. how: 'gear' vest/shoes slot, 'add' stack or free slot, 'swap' replaces the held slot. old = item that drops. */
function buyPlan(it){if(it.k==='a'||it.k==='f'){const old=p[it.k==='a'?'armor':'shoes'];return old&&old.s>=it.s?{no:'have'}:{how:'gear',old}}
 if(roomFor(it)>=1)return{how:'add'};
 return p.sel>=0&&p.inv[p.sel]?{how:'swap',at:p.sel,old:p.inv[p.sel]}:{no:'full'}}
const dropped=q=>sendWS({t:'drop',k:q.k,s:q.s,i:q.i|0,n:q.n||1});
function gotBought(m){const it=m.it;buying=0;setGold(m.g);if(!p||paused){return}
 const pl=buyPlan(it);
 if(pl.no)dropped(it);/* inventory changed while waiting: the paid item goes on the ground */
 else if(pl.how==='gear'){p[it.k==='a'?'armor':'shoes']={k:it.k,s:it.s,i:0,n:1};if(pl.old)dropped(pl.old);renderInv()}
 else if(pl.how==='add')addItem(it);
 else{dropped(pl.old);p.inv[pl.at]={k:it.k,s:it.s,i:it.i,n:1};renderInv()}
 SFX.coins();say('buy');toast(SX('bought')+': '+inm(it));if(shopOpen)shopDraw()}
function buyDone(){buying=0;if(shopOpen)shopDraw()}
function buy(){const it=shopItem(shopSel);if(!nearShop()||performance.now()-buying<2000)return;if(gold<SHOPL[shopSel][3]){SFX.poor();say('poor');return}if(buyPlan(it).no){SFX.poor();return}
 buying=performance.now();sendWS({t:'buy',n:shopSel});shopDraw();setTimeout(()=>{if(shopOpen)shopDraw()},2100)}
const shopStars=it=>it.k==='a'||it.k==='f'?'':stars(it.s)+' ';
const shopInfo=it=>it.k==='a'?'-'+(it.s-1)*12.5+'%':it.k==='f'?'+'+(it.s-1)*12.5+'% '+TX('spdw'):'';
function shopPick(i){shopSel=i;SFX.tick();say(gold<SHOPL[i][3]?'poor':'hi');shopDraw()}
function shopDraw(){if(!p)return;const it=shopItem(shopSel),pr=SHOPL[shopSel][3],pl=buyPlan(it),wait=performance.now()-buying<2000;
 $('sh_t').textContent=SX('shop');$('sh_g').textContent=gold+' G';$('sh_x').textContent=SX('close');
 $('sh_ic').src=iconUrl(it);$('sh_n').textContent=shopStars(it)+inm(it);
 $('sh_d').textContent=[pr+' G',shopInfo(it),pl.old&&!pl.no?SX('drops').replace('{a}',inm(pl.old)):''].filter(Boolean).join(' · ');
 const b=$('sh_buy');b.textContent=wait?SX('wait'):pl.no?SX(pl.no):gold<pr?SX('poor'):SX('buy');b.disabled=wait||!!pl.no;b.classList.toggle('poor',gold<pr);
 [...$('sh_list').children].forEach((e,i)=>{const q=shopItem(i);e.classList.toggle('sel',i===shopSel);e.style.borderLeftColor=IC[q.s];
  setH(e,'<i><img src="'+iconUrl(q)+'" alt=""></i><span>'+esc(inm(q))+(q.k==='a'||q.k==='f'?'':'<small style="color:'+IC[q.s]+'">'+stars(q.s)+'</small>')+'</span><b>'+SHOPL[i][3]+' G</b>')})}
/* 'click' (not pointerdown) so that swiping the list scrolls it without selecting */
SHOPL.forEach((e,i)=>{const el=document.createElement('button');el.className='shi';el.onclick=()=>shopPick(i);$('sh_list').appendChild(el)});
/* Buy only counts if the press STARTED on it: the tap that opens the shop (on the Shop button) otherwise 'clicks' Buy underneath */
let buyArmed=false;$('sh_buy').onpointerdown=()=>{buyArmed=true};
$('sh_buy').onclick=()=>{if(buyArmed)buy();buyArmed=false};
/* shopkeeper picture: shown only if shopkeeper.webp loads */
{const k=$('sh_keep');k.onload=()=>{k.hidden=false;$('sh_say').hidden=false};k.src='shopkeeper.webp'}
function openShop(){if(!nearShop())return;shopOpen=true;buyArmed=false;
 /* let go of both sticks so the player stops moving and firing */
 for(const k of['l','r'])st[k].id=null;for(const k in K)K[k]=0;
 shopEl.classList.add('open');shopDraw();SFX.open();say('hi');musicOn();
 clearInterval(shopTimer);shopTimer=setInterval(()=>{shopMus.muted=muted;if(Math.random()<.25)SFX.creak()},3000)}
function closeShop(){if(shopOpen)SFX.close();shopOpen=false;shopEl.classList.remove('open');clearInterval(shopTimer);musicOff()}
$('sh_x').onclick=closeShop;
function shopUI(){if(shopOpen&&!nearShop())closeShop()}
function drawShopSign(){const S=SHOP,cx=S.x+S.w/2,cy=S.y+S.h/2,o=p&&inside(p,S);
 ctx.save();
 if(o)drawShopNpc();ctx.textAlign='center';ctx.textBaseline='middle';
 if(o){ctx.fillStyle='#7a5a2a';ctx.fillRect(cx-70,S.y+28,140,26);ctx.strokeStyle='#14160f';ctx.lineWidth=3;ctx.strokeRect(cx-70,S.y+28,140,26);
  ctx.fillStyle='#ffe08a';ctx.font='700 13px "Chakra Petch",sans-serif';ctx.fillText(SX('safe'),cx,S.y+41)}
 else{ctx.fillStyle='#14160f';ctx.fillRect(cx-74,cy-24,148,48);ctx.strokeStyle='#ffcc33';ctx.lineWidth=4;ctx.strokeRect(cx-74,cy-24,148,48);
  ctx.fillStyle='#ffcc33';ctx.font='700 24px "Chakra Petch",sans-serif';ctx.fillText(SX('shop').toUpperCase(),cx,cy+1)}
 ctx.restore()}

/* shopkeeper NPC (timu.webp, circular) behind a counter nobody can walk through */
const NPCI=new Image();NPCI.src='timu.webp';
const shopBox=()=>({x:SHOP.x+SHOP.w/2-70,y:SHOP.y+SHOP.h-92,w:140,h:28});
function shopBlock(o,r){const b=shopBox();if(!o||o.x<b.x-r-2||o.x>b.x+b.w+r+2||o.y<b.y-r-2||o.y>b.y+b.h+r+2)return;
 const cx=Math.max(b.x,Math.min(o.x,b.x+b.w)),cy=Math.max(b.y,Math.min(o.y,b.y+b.h));let dx=o.x-cx,dy=o.y-cy,d=Math.hypot(dx,dy);
 if(d>=r)return;
 if(d<.001){const l=o.x-b.x,rr=b.x+b.w-o.x,t=o.y-b.y,bo=b.y+b.h-o.y,m=Math.min(l,rr,t,bo);
  if(m===t)o.y=b.y-r;else if(m===bo)o.y=b.y+b.h+r;else if(m===l)o.x=b.x-r;else o.x=b.x+b.w+r;return}
 o.x=cx+dx/d*r;o.y=cy+dy/d*r}
function drawShopNpc(){const b=shopBox(),nx=b.x+b.w/2,t=performance.now()/1000,bob=Math.sin(t*2)*1.5,ny=b.y+b.h+16+bob;
 ctx.save();
 ctx.fillStyle='#8a6a1e';ctx.strokeStyle='#14160f';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(nx,ny+6,26,15,0,0,TAU);ctx.fill();ctx.stroke();
 ctx.save();ctx.beginPath();ctx.arc(nx,ny-2,19,0,TAU);ctx.clip();ctx.fillStyle='#d9b38c';ctx.fillRect(nx-20,ny-22,40,40);
 if(NPCI.complete&&NPCI.naturalWidth)ctx.drawImage(NPCI,nx-19,ny-21,38,38);ctx.restore();
 ctx.strokeStyle='#14160f';ctx.lineWidth=3;ctx.beginPath();ctx.arc(nx,ny-2,19,0,TAU);ctx.stroke();
 ctx.fillStyle='#d9b38c';for(const s of[-1,1]){ctx.beginPath();ctx.arc(nx+s*(22+Math.sin(t*2+s)*2),b.y+b.h-3,6,0,TAU);ctx.fill();ctx.stroke()}
 ctx.fillStyle='#7a5a2a';ctx.fillRect(b.x,b.y,b.w,b.h);ctx.strokeRect(b.x,b.y,b.w,b.h);
 ctx.fillStyle='#9a7436';ctx.fillRect(b.x+4,b.y+4,b.w-8,8);
 ctx.restore()}
