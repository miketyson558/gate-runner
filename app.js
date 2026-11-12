window.addEventListener('error',e=>console.error('ぬりえスマイル error',e.error||e.message));
window.addEventListener('unhandledrejection',e=>console.error('ぬりえスマイル rejection',e.reason));

const TOTAL_CATALOG=20*30;
const categories=NURIE_DATA.map(x=>[x.name,x.icon]);
const DES=NURIE_DATA.map(cat=>cat.items.map(item=>[item.name,()=>item.svg]));
const BG=n=>{let w="";const N=14+n%4*2,f=(t)=>(200+Math.cos(t)*192).toFixed(0)+" "+(200+Math.sin(t)*192).toFixed(0);for(let k=0;k<N;k++)w+=`<path d="M200 200L${f(k*6.2832/N)}L${f((k+1)*6.2832/N)}Z" fill="none" stroke="#9a9aae" stroke-width="2.5"/>`;return w+`<circle cx="200" cy="200" r="192" fill="none" stroke="#333" stroke-width="7"/><circle cx="200" cy="200" r="172" fill="none" stroke="#9a9aae" stroke-width="3" stroke-dasharray="1 9" stroke-linecap="round"/>`};
const shapeSVG=(c,n)=>DES[c][n%DES[c].length][1]();
$("catgrid").innerHTML=categories.map((c,i)=>`<button class="cat" onclick="selectCategory(${i})"><span class="icon" style="background:hsl(${i*47%360},90%,90%)"><svg viewBox="0 0 400 400">${colorize(shapeSVG(i,0),i)}</svg></span>${c[0]}<small>${DES[i].length}作品</small></button>`).join("");
$("total").textContent=DES.reduce((a,x)=>a+x.length,0);$("catn").textContent=DES.length;
$("reco1").innerHTML=`<span class="icon" style="background:#ffd6e0"><svg viewBox="0 0 400 400">${colorize(shapeSVG(14,0),14)}</svg></span>${DES[14][0][0]}<small>人気のキャラ</small>`;
$("reco2").innerHTML=`<span class="icon" style="background:#e8d6ff"><svg viewBox="0 0 400 400">${colorize(shapeSVG(20,0),20)}</svg></span>${DES[20][0][0]}<small>女の子に人気</small>`;

function colorize(svg,o=0){let k=0;return svg.replace(/fill="#fff"/g,()=>`fill="${PAL[(k++*3+o)%8]}"`)}
const find=nm=>{for(let c=0;c<DES.length;c++)for(let n=0;n<DES[c].length;n++)if(DES[c][n][0]===nm)return[c,n]};
const art=(nm,o)=>{const[c,n]=find(nm);return `<svg viewBox="0 0 400 400">${colorize(shapeSVG(c,n),o)}</svg>`};
$("cast").innerHTML=[[0,0],[2,4],[6,8],[10,3],[11,7],[14,5],[16,2],[19,8]].map(([c,n],i)=>`<div onclick="openPage(${c},${n})" style="background:hsl(${i*47+10},95%,88%)"><svg viewBox="0 0 400 400">${colorize(shapeSVG(c,n),i)}</svg></div>`).join("");
$("parade").innerHTML=DES.map((l,c)=>l.slice(0,2).map((d,n)=>`<button onclick="openPage(${c},${n})" style="background:hsl(${c*47%360},90%,90%)"><svg viewBox="0 0 400 400">${colorize(shapeSVG(c,n),c+n)}</svg></button>`).join("")).join("");
document.querySelectorAll("[data-ch]").forEach(e=>e.innerHTML=art(e.dataset.ch,1));
$("logo").innerHTML=`<svg viewBox="0 0 400 400">${colorize(shapeSVG(14,0),14)}</svg>`;

function initHomeFloaters(){
 const host=$("homeFloaters"); if(!host)return;
 host.innerHTML="";
 const picks=[[14,0],[15,0],[16,0],[18,0],[20,0],[21,0],[22,0],[23,0],[24,0],[25,0]];
 picks.forEach((p,i)=>{
   const el=document.createElement("div");el.className="home-floater";
   el.style.setProperty("--top",(8+i*8%82)+"%");
   el.style.setProperty("--dur",(13+i*1.7)+"s");
   el.style.setProperty("--delay",(-i*1.9)+"s");
   el.style.setProperty("--bob",((i%2?22:-22))+"px");
   el.innerHTML=`<svg viewBox="0 0 400 400">${colorize(shapeSVG(p[0],p[1]),i)}</svg>`;
   host.appendChild(el);
 });
}

initHomeFloaters();setupBgmUI();$("ttl").innerHTML=[..."ぬりえスマイル"].map((ch,i)=>`<span style="color:${PAL[i%8]}">${ch}</span>`).join("");
{const u="data:image/svg+xml,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" rx="90" fill="#ffd7ea"/>${colorize(shapeSVG(1,0),1)}</svg>`);const ic=document.createElement("link");ic.rel="icon";ic.href=u;document.head.appendChild(ic);const ai=document.createElement("link");ai.rel="apple-touch-icon";ai.href=u;document.head.appendChild(ai)}
let imp=false,size=22,erase=false,inside=true,undoS=[],mk=null,down=false,last=null,lastT=0,ni=0,bucket=false,lineCv=null,impState=null;
const pc=$("paint"),px=pc.getContext("2d",{willReadFrequently:true}),tmp=document.createElement("canvas");tmp.width=tmp.height=800;const tx=tmp.getContext("2d");

// Final build: 20 categories x 30 line-art works = 600. Keep only a small rendered-image LRU cache to control Android memory.
const SVG_CACHE_MAX=10; const SVG_CACHE=new Map();
function svgKey(svg,S){let h=2166136261;const s=svg+'|'+S;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36);}
function svgImgCached(svg,cb,S=800){const key=svgKey(svg,S);const hit=SVG_CACHE.get(key);if(hit){SVG_CACHE.delete(key);SVG_CACHE.set(key,hit);if(hit.complete) return cb(hit); hit._wait=(hit._wait||[]).concat(cb);return;}
 const im=new Image(); im.decoding='async'; im.onload=()=>{const wait=im._wait||[];im._wait=[];SVG_CACHE.set(key,im);while(SVG_CACHE.size>SVG_CACHE_MAX) SVG_CACHE.delete(SVG_CACHE.keys().next().value); cb(im);wait.forEach(fn=>fn(im));}; im.onerror=()=>cb(im); im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${S}" height="${S}">${svg}</svg>`); im._wait=[]; SVG_CACHE.set(key,im);}
function validateCatalog(){const ok=NURIE_DATA.length===20 && NURIE_DATA.every(x=>x.items.length===30 && x.items.every(it=>typeof it.svg==="string")); console.info('ぬりえスマイル catalog:',NURIE_DATA.length,'categories /',NURIE_DATA.reduce((a,x)=>a+x.items.length,0),'line arts',ok?'OK':'CHECK');}
validateCatalog();

function svgImg(svg,cb,S=800){svgImgCached(svg,cb,S)}
function setLineCanvas(im){lineCv=document.createElement("canvas");lineCv.width=lineCv.height=800;lineCv.getContext("2d").drawImage(im,0,0,800,800)}
function openPage(c,n){imp=false;impState=null;$("lines").style.mixBlendMode="";currentCat=c;currentPage=n;undoS=[];mk=null;lineCv=null;hideAll();$("editor").classList.remove("hidden");$("pageTitle").textContent=DES[c][n][0];const raw=shapeSVG(c,n);$("drawing").innerHTML=`<defs><mask id="bgm"><rect width="400" height="400" fill="#fff"/>${raw.replace(/fill="#fff"/gi,'fill="#000"').replace(/stroke="#(333|FFF|000)"/gi,'stroke="#000"')}</mask></defs><g mask="url(#bgm)">${BG(n)}</g>`+'<ellipse cx="200" cy="390" rx="140" ry="9" fill="#000" opacity=".1" style="pointer-events:none"/>'+raw.replace(/fill="#fff"/g,'fill="none"');px.clearRect(0,0,800,800);svgImg('<circle cx="200" cy="200" r="192"/>'+raw.replace(/fill="#fff"/g,'fill="#000"'),im=>{mk=im});svgImg('<circle cx="200" cy="200" r="192" fill="none" stroke="#333" stroke-width="7"/>'+raw,im=>{setLineCanvas(im)});ac();sfx("start")}
function updTools(){["10","22","46"].forEach(k=>$("sz"+k).classList.toggle("sel",!erase&&!bucket&&size==k));$("bkt").classList.toggle("sel",bucket);$("ers").classList.toggle("sel",erase);$("ins").classList.toggle("sel",inside);$("ins").textContent=inside?"🔒 はみ出し防止":"🔓 自由に"}
function setSize(n){size=n;erase=false;bucket=false;updTools()}function toggleErase(){erase=!erase;if(erase)bucket=false;updTools()}function toggleInside(){inside=!inside;updTools()}function toggleBucket(){bucket=!bucket;if(bucket)erase=false;updTools()}
function pos(e){
 const r=pc.getBoundingClientRect();
 const sx=pc.width/r.width, sy=pc.height/r.height;
 return [Math.max(0,Math.min(pc.width,(e.clientX-r.left)*sx)),
         Math.max(0,Math.min(pc.height,(e.clientY-r.top)*sy))];
}
let toastT;function toast(m){let t=$("toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.appendChild(t)}t.textContent=m;t.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("show"),1900)}
function fillAt(p){if(!lineCv)return;const ld=lineCv.getContext("2d",{willReadFrequently:true}).getImageData(0,0,800,800).data,N=640000,lum=i=>ld[i*4]*.3+ld[i*4+1]*.59+ld[i*4+2]*.11;const x=Math.max(0,Math.min(799,p[0]|0)),y=Math.max(0,Math.min(799,p[1]|0)),seed=y*800+x;if(lum(seed)<60)return;const fl=new Uint8Array(N),st=new Int32Array(N);let sp=0;const push=i=>{if(!fl[i]&&lum(i)>=170){fl[i]=1;st[sp++]=i}};push(seed);while(sp){const i=st[--sp],cx=i%800;if(cx>0)push(i-1);if(cx<799)push(i+1);if(i>=800)push(i-800);if(i<N-800)push(i+800)}for(let r=0;r<2;r++){const add=[];for(let i=0;i<N;i++){if(fl[i]||lum(i)<60)continue;const cx=i%800;if((cx>0&&fl[i-1])||(cx<799&&fl[i+1])||(i>=800&&fl[i-800])||(i<N-800&&fl[i+800]))add.push(i)}for(const i of add)fl[i]=1}const tc=document.createElement("canvas");tc.width=tc.height=1;const t2=tc.getContext("2d");t2.fillStyle=chosen;t2.fillRect(0,0,1,1);const cr=t2.getImageData(0,0,1,1).data,img=px.getImageData(0,0,800,800);for(let i=0;i<N;i++)if(fl[i]){img.data[i*4]=cr[0];img.data[i*4+1]=cr[1];img.data[i*4+2]=cr[2];img.data[i*4+3]=255}px.putImageData(img,0,0)}
function clearAll(){undoS.push(px.getImageData(0,0,800,800));if(undoS.length>30)undoS.shift();px.clearRect(0,0,800,800);sfx("erase");toast("ぜんぶ消したよ！もう一度ぬれるよ")}
function stroke(a,b){const t=!erase&&inside&&mk,c=t?tx:px;if(t)tx.clearRect(0,0,800,800);c.save();c.lineCap=c.lineJoin="round";c.lineWidth=size;if(erase)c.globalCompositeOperation="destination-out";else c.strokeStyle=chosen;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0]+.01,b[1]);c.stroke();c.restore();if(t){tx.globalCompositeOperation="destination-in";tx.drawImage(mk,0,0);tx.globalCompositeOperation="source-over";px.drawImage(tmp,0,0)}}
function undo(){const h=undoS.pop();if(h){px.putImageData(h,0,0);sfx("undo")}}
function spark(x,y){const e=document.createElement("div");e.className="spark";e.textContent=["✨","💖","⭐","🌸"][Math.random()*4|0];e.style.left=x+"px";e.style.top=y+"px";e.style.setProperty("--dx",(Math.random()*60-30)+"px");document.body.appendChild(e);setTimeout(()=>e.remove(),800)}
(function(){const d=$("stage");
d.addEventListener("pointerdown",e=>{if(e.isPrimary===false)return;e.preventDefault();ac();undoS.push(px.getImageData(0,0,800,800));if(undoS.length>30)undoS.shift();if(bucket){fillAt(pos(e));sfx("fill");spark(e.clientX,e.clientY);scratch(.12);down=false;return}down=true;try{d.setPointerCapture(e.pointerId)}catch(_){}last=pos(e);lastT=e.timeStamp;stroke(last,last);sfx(erase?"erase":"touch");if(!erase)spark(e.clientX,e.clientY);scratch(.04)});
d.addEventListener("pointermove",e=>{if(!down)return;const p=pos(e),dt=Math.max(8,e.timeStamp-lastT);stroke(last,p);scratch(Math.min(.3,Math.hypot(p[0]-last[0],p[1]-last[1])/dt*.05+.03));last=p;lastT=e.timeStamp});
["pointerup","pointercancel"].forEach(t=>d.addEventListener(t,()=>{down=false;scratch(0)}));
document.addEventListener("pointerdown",e=>{if(e.target.closest("button")){ac();sfx("tap")}},true)})();
let AC,master,mus,NB,nzG,nzF,musicOn=true,timer=null,step=0,nextT=0;
let material="crayon";
const BGM_PRESETS=[
 ["🎠 オルゴール","musicbox"],["🥁 楽しいマーチ","march"],["🎹 リラックスピアノ","piano"],
 ["🗺️ 冒険","adventure"],["🌲 森の環境音","forest"],["☁️ ふわふわドリーム","dream"],
 ["🌊 海のきらめき","ocean"],["🌸 さくらカフェ","cafe"],["⭐ 星の夜","stars"],["🎉 ハッピーポップ","happy"]
];
function setMaterial(m){
 material=m;
 document.querySelectorAll("[data-tool]").forEach(x=>x.classList.toggle("sel",x.dataset.tool===m));
 if(AC)sfx("material");
}
function setupBgmUI(){
 const s=$("bgmSelect"); if(!s)return;
 s.innerHTML=BGM_PRESETS.map((x,i)=>`<option value="${i}">${x[0]}</option>`).join("");
 s.value=localStorage.getItem("nurieBgm")||"0";
 s.onchange=()=>{localStorage.setItem("nurieBgm",s.value); step=0; if(AC&&musicOn){stopMusic();startMusic()}};
 $("volRange").oninput=e=>{master&&(master.gain.value=(+e.target.value/100)*.9)};
}

function ac(){if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.7;master.connect(AC.destination);mus=AC.createGain();mus.gain.value=.3;mus.connect(master);NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const nz=AC.createBufferSource();nz.buffer=NB;nz.loop=true;nzF=AC.createBiquadFilter();nzF.type="bandpass";nzF.frequency.value=2200;nzF.Q.value=.9;nzG=AC.createGain();nzG.gain.value=0;nz.connect(nzF);nzF.connect(nzG);nzG.connect(master);nz.start();if(musicOn)startMusic()}if(AC.state==="suspended")AC.resume()}
function scratch(v){
 if(!AC)return;
 const t=AC.currentTime;
 const gain=material==="spray"?v*1.25:material==="brush"?v*.7:material==="pencil"?v*.9:v;
 const freq=material==="spray"?4200:material==="brush"?900:material==="pencil"?2800:(erase?3800:1500+v*5000);
 nzG.gain.setTargetAtTime(gain,t,.025);nzF.frequency.setTargetAtTime(freq,t,.04);
}
const hz=s=>261.63*Math.pow(2,s/12),PENTA=[0,2,4,7,9];
function tone(f,t,d,type,v,dest,slide){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(f*slide,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(dest||master);o.start(t);o.stop(t+d+.05)}
function bell(s,t,d,v,dest){tone(hz(s),t,d,"sine",v,dest);tone(hz(s)*2.76,t,d*.3,"sine",v*.25,dest);tone(hz(s)*4.1,t,d*.15,"sine",v*.1,dest)}
function marimba(s,t,d,v,dest){tone(hz(s),t,d,"triangle",v,dest);tone(hz(s)*4,t,d*.2,"sine",v*.3,dest)}
function puff(t,d,f,v,dest,f2,q){const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;fl.type="bandpass";fl.Q.value=q||1;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+d*.2);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(g);g.connect(dest||master);s.start(t,Math.random());s.stop(t+d+.05)}
function sfx(k){if(!AC)return;const t=AC.currentTime;
if(k==="touch"){const s=PENTA[ni%5]+12*((ni/5|0)%2);ni++;tone(150,t,.12,"sine",.35,null,.5);puff(t,.06,3000,.25,null,1500);bell(s+12,t+.01,.45,.12)}
else if(k==="erase"){puff(t,.12,4500,.3,null,2500,1.5)}
else if(k==="tap"){tone(900,t,.05,"sine",.12,null,.6);puff(t,.03,5000,.1,null)}
else if(k==="pick"){marimba(PENTA[Math.random()*5|0]+12,t,.25,.25)}
else if(k==="fill"){puff(t,.18,900,.35,null,300,1.4);tone(520,t,.16,"sine",.25,null,.55)}
else if(k==="undo"){puff(t,.28,3000,.35,null,500,1.2)}
else if(k==="start"){puff(t,.22,800,.4,null,4000,.8);puff(t+.14,.18,4000,.2,null,900,1);[0,4,7,12].forEach((s,i)=>bell(s+12,t+.15+i*.07,.4,.12))}
else if(k==="material"){
   const f=material==="spray"?5200:material==="brush"?1100:material==="pencil"?3000:1800;
   puff(t,.09,f,.25,null,f*.65,1.2);
 }
else if(k==="ok"){puff(t,.05,6000,.5,null);puff(t+.05,.08,2500,.4,null);[0,4,7,12,16,19,24].forEach((s,i)=>bell(s+12,t+.2+i*.08,.6,.14))}}
const CH=[[0,4,7],[-3,0,4],[-7,-3,0],[-5,-1,2],[0,4,7],[-7,-3,0],[-5,-1,2],[0,4,7]],r="r";
const MEL=[16,r,14,12,14,r,16,r,12,r,9,12,14,r,r,r,17,r,16,14,16,r,19,r,21,r,19,17,16,r,r,r,19,r,17,16,14,r,16,r,17,r,16,14,12,r,14,16,19,r,r,r,r,r,16,r,21,r,19,17,16,14,12,r];
function startMusic(){if(timer||!AC)return;nextT=AC.currentTime+.1;timer=setInterval(()=>{while(nextT<AC.currentTime+.4){const i=step%64,b=i>>3,ch=CH[b],m=MEL[i],t=nextT;
if(typeof m==="number")bell(m,t,.7,.2,mus);
if(i%2===0)marimba(ch[(i>>1)%3]-12+(i%4?12:0),t,.3,.1,mus);
if(i%4===0){tone(hz(ch[0]-24),t,.3,"sine",.35,mus,.9)}
if(i%8===0)tone(130,t,.14,"sine",.3,mus,.4);
if(i%2===1)puff(t,.05,7000,.06,mus);
step++;nextT+=.24}},100)}
function stopMusic(){clearInterval(timer);timer=null}
function toggleMusic(){ac();musicOn=!musicOn;$("musicBtn").textContent=musicOn?"🎵 ON":"🔇 OFF";$("musicBtn").classList.toggle("off",!musicOn);musicOn?startMusic():stopMusic()}
function resetPage(){if(imp&&impState){openImport()}else openPage(currentCat,currentPage)}
function boxBlur(src,r){const W=800,N=640000,t=new Float32Array(N),h=new Float32Array(N);for(let y=0;y<W;y++){const row=y*W;let s=0;for(let i=-r;i<=r;i++)s+=src[row+Math.min(W-1,Math.max(0,i))];for(let i=0;i<W;i++){h[row+i]=s/(2*r+1);s+=src[row+Math.min(W-1,i+r+1)]-src[row+Math.max(0,i-r)]}}for(let i=0;i<W;i++){let s=0;for(let y=-r;y<=r;y++)s+=h[Math.min(W-1,Math.max(0,y))*W+i];for(let y=0;y<W;y++){t[y*W+i]=s/(2*r+1);s+=h[Math.min(W-1,y+r+1)*W+i]-h[Math.max(0,y-r)*W+i]}}return t}
function toLineArt(o,lv=2){const W=800,N=640000,x=o.getContext("2d",{willReadFrequently:true}),d=x.getImageData(0,0,W,W).data;let white=0;
for(let i=0;i<N;i++)if(d[i*4]+d[i*4+1]+d[i*4+2]>705)white++;
if(white/N>.55)return false; // すでに線画ならそのまま
const PP=[0,{k:5,min:5000,rk:7,th:3},{k:8,min:2000,rk:5,th:2},{k:12,min:700,rk:3,th:2}][lv]||{k:8,min:2000,rk:5,th:2},K=PP.k;
/* 1) 輪郭を残して絵の具のようにならす（桑原フィルタ） */
const S1=W+1,mk=()=>new Float64Array(S1*S1),Ir=mk(),Ig=mk(),Ib=mk(),Il=mk(),Iq=mk();
for(let y=0;y<W;y++){let a=0,b=0,c=0,l=0,q=0;for(let xx=0;xx<W;xx++){const i=(y*W+xx)*4,r=d[i],g=d[i+1],bb=d[i+2],ll=r*.3+g*.59+bb*.11;a+=r;b+=g;c+=bb;l+=ll;q+=ll*ll;const j=(y+1)*S1+xx+1,u=y*S1+xx+1;Ir[j]=Ir[u]+a;Ig[j]=Ig[u]+b;Ib[j]=Ib[u]+c;Il[j]=Il[u]+l;Iq[j]=Iq[u]+q}}
const bx=(I,x0,y0,x1,y1)=>I[(y1+1)*S1+x1+1]-I[y0*S1+x1+1]-I[(y1+1)*S1+x0]+I[y0*S1+x0],rk=PP.rk,sr=new Uint8Array(N),sg=new Uint8Array(N),sb=new Uint8Array(N);
for(let y=0;y<W;y++)for(let xx=0;xx<W;xx++){let best=1e18,br=0,bg=0,bb2=0;
 for(let q=0;q<4;q++){const x0=Math.max(0,q&1?xx:xx-rk),x1=Math.min(W-1,q&1?xx+rk:xx),y0=Math.max(0,q&2?y:y-rk),y1=Math.min(W-1,q&2?y+rk:y),n=(x1-x0+1)*(y1-y0+1),ml=bx(Il,x0,y0,x1,y1)/n,vr=bx(Iq,x0,y0,x1,y1)/n-ml*ml;
  if(vr<best){best=vr;br=bx(Ir,x0,y0,x1,y1)/n;bg=bx(Ig,x0,y0,x1,y1)/n;bb2=bx(Ib,x0,y0,x1,y1)/n}}
 const i=y*W+xx;sr[i]=br;sg[i]=bg;sb[i]=bb2}
/* 2) 色をK色にまとめる */
const smp=[];for(let i=0;i<N;i+=29)smp.push(i);smp.sort((a,b)=>(sr[a]*.3+sg[a]*.59+sb[a]*.11)-(sr[b]*.3+sg[b]*.59+sb[b]*.11));
let cr=[],cg=[],cb=[];for(let k=0;k<K;k++){const i=smp[Math.floor((k+.5)/K*smp.length)];cr.push(sr[i]);cg.push(sg[i]);cb.push(sb[i])}
for(let it=0;it<8;it++){const a=new Float64Array(K),b=new Float64Array(K),c=new Float64Array(K),n=new Int32Array(K);
 for(const i of smp){let bk=0,bd=1e18;for(let k=0;k<K;k++){const dr=sr[i]-cr[k],dg=sg[i]-cg[k],db=sb[i]-cb[k],dd=dr*dr+dg*dg+db*db;if(dd<bd){bd=dd;bk=k}}a[bk]+=sr[i];b[bk]+=sg[i];c[bk]+=sb[i];n[bk]++}
 for(let k=0;k<K;k++)if(n[k]){cr[k]=a[k]/n[k];cg[k]=b[k]/n[k];cb[k]=c[k]/n[k]}}
let lab=new Uint8Array(N);for(let i=0;i<N;i++){let bk=0,bd=1e18;for(let k=0;k<K;k++){const dr=sr[i]-cr[k],dg=sg[i]-cg[k],db=sb[i]-cb[k],dd=dr*dr+dg*dg+db*db;if(dd<bd){bd=dd;bk=k}}lab[i]=bk}
/* 3) 境目をなめらかに（多数決） */
for(let p=0;p<3;p++){const nl=new Uint8Array(N),cnt=new Int32Array(K);for(let y=0;y<W;y++)for(let xx=0;xx<W;xx++){cnt.fill(0);for(let dy=-2;dy<=2;dy++){const yy=y+dy;if(yy<0||yy>=W)continue;for(let dx=-2;dx<=2;dx++){const x2=xx+dx;if(x2>=0&&x2<W)cnt[lab[yy*W+x2]]++}}let bk=lab[y*W+xx],bc=cnt[bk];for(let k=0;k<K;k++)if(cnt[k]>bc){bc=cnt[k];bk=k}nl[y*W+xx]=bk}lab=nl}
/* 4) 小さな区画はとなりにまとめる */
const seen=new Uint8Array(N),stk=new Int32Array(N),lst=new Int32Array(N);
for(let pass=0;pass<3;pass++){seen.fill(0);let ch=0;for(let i=0;i<N;i++){if(seen[i])continue;const L=lab[i];let sp=0,n=0;stk[sp++]=i;seen[i]=1;
 while(sp){const p=stk[--sp];lst[n++]=p;const cx=p%W,cy=(p/W)|0;if(cx>0&&lab[p-1]===L&&!seen[p-1]){seen[p-1]=1;stk[sp++]=p-1}if(cx<W-1&&lab[p+1]===L&&!seen[p+1]){seen[p+1]=1;stk[sp++]=p+1}if(cy>0&&lab[p-W]===L&&!seen[p-W]){seen[p-W]=1;stk[sp++]=p-W}if(cy<W-1&&lab[p+W]===L&&!seen[p+W]){seen[p+W]=1;stk[sp++]=p+W}}
 if(n<PP.min){const c=new Int32Array(K);for(let k=0;k<n;k++){const p=lst[k],cx=p%W,cy=(p/W)|0;if(cx>0&&lab[p-1]!==L)c[lab[p-1]]++;if(cx<W-1&&lab[p+1]!==L)c[lab[p+1]]++;if(cy>0&&lab[p-W]!==L)c[lab[p-W]]++;if(cy<W-1&&lab[p+W]!==L)c[lab[p+W]]++}let bk=-1,bc=0;for(let k=0;k<K;k++)if(c[k]>bc){bc=c[k];bk=k}if(bk>=0){for(let k=0;k<n;k++)lab[lst[k]]=bk;ch++}}}
 if(!ch)break}
/* 5) 区画の境目を、太くなめらかな線にする */
let ln=new Uint8Array(N);for(let y=0;y<W-1;y++)for(let xx=0;xx<W-1;xx++){const i=y*W+xx;if(lab[i]!==lab[i+1]||lab[i]!==lab[i+W])ln[i]=1}
for(let p=0;p<PP.th;p++){const c=ln.slice();for(let i=0;i<N;i++){if(c[i])continue;const cx=i%W;if((cx>0&&c[i-1])||(cx<W-1&&c[i+1])||(i>=W&&c[i-W])||(i<N-W&&c[i+W]))ln[i]=1}}
const f=new Float32Array(N);for(let i=0;i<N;i++)f[i]=ln[i];const sm=boxBlur(boxBlur(f,1),1);
const out=x.createImageData(W,W);for(let i=0;i<N;i++){const v=sm[i]>.38?30:255;out.data[i*4]=out.data[i*4+1]=out.data[i*4+2]=v;out.data[i*4+3]=255}x.putImageData(out,0,0);return true}
function importArt(inp){const f=inp.files&&inp.files[0];if(!f)return;inp.value="";toast("読み込み中…📷");
 const go=src=>{const w=src.width||src.naturalWidth,h=src.height||src.naturalHeight;if(!w||!h){toast("この画像は読めなかったよ…別の画像を選んでね");return}
  const k=Math.min(800/w,800/h),S=document.createElement("canvas");S.width=S.height=800;const sx=S.getContext("2d",{willReadFrequently:true});sx.fillStyle="#fff";sx.fillRect(0,0,800,800);sx.imageSmoothingQuality="high";sx.drawImage(src,(800-w*k)/2,(800-h*k)/2,w*k,h*k);
  toast("イラストに変換中…🎨");setTimeout(()=>{try{buildImport(S,2,true)}catch(e){console.error(e);toast("変換に失敗したよ…別の画像で試してね")}},80)};
 const viaReader=()=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>go(im);im.onerror=()=>toast("この画像は読めなかったよ…（HEIC形式などは非対応のことがあります）");im.src=r.result};r.onerror=()=>toast("画像を読めなかったよ");r.readAsDataURL(f)};
 if(window.createImageBitmap){createImageBitmap(f,{imageOrientation:"from-image"}).then(go).catch(viaReader)}else viaReader()}
function buildImport(S,lv,first){const o=document.createElement("canvas");o.width=o.height=800;const x=o.getContext("2d",{willReadFrequently:true});x.drawImage(S,0,0);
 const wasPhoto=toLineArt(o,lv),url=o.toDataURL("image/png"),d=x.getImageData(0,0,800,800).data,N=640000,out=new Uint8Array(N),st=new Int32Array(N);let sp=0;
 const push=i=>{if(!out[i]&&d[i*4]+d[i*4+1]+d[i*4+2]>600){out[i]=1;st[sp++]=i}};
 for(let i=0;i<800;i++){push(i);push(N-1-i);push(i*800);push(i*800+799)}
 while(sp){const i=st[--sp],cx=i%800;if(cx>0)push(i-1);if(cx<799)push(i+1);if(i>=800)push(i-800);if(i<N-800)push(i+800)}
 const m=document.createElement("canvas");m.width=m.height=800;const mx=m.getContext("2d"),id=mx.createImageData(800,800);for(let i=0;i<N;i++)id.data[i*4+3]=out[i]?0:255;mx.putImageData(id,0,0);
 impState={o,url,mk:m,src:S,lv,photo:wasPhoto};openImport();if(first&&wasPhoto)toast("イラストにしたよ！下の「かんたん／ふつう／こまかい」で変えられるよ🎨")}
function reconv(lv){toast("変換中…🎨");setTimeout(()=>{try{buildImport(impState.src,lv,false)}catch(e){toast("変換に失敗したよ")}},60)}

function importAdjustUI(){
 let p=document.getElementById("importAdjust");
 if(!p){
   p=document.createElement("div");p.id="importAdjust";
   p.style.cssText="display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;margin:8px 0";
   p.innerHTML='<label class="pill">線の太さ <input id="lineWeight" type="range" min="1" max="8" value="3"></label><label class="pill">線の濃さ <input id="lineContrast" type="range" min="1" max="10" value="6"></label><button class="pill" onclick="applyLineAdjust()">線画を更新</button>';
   $("pageTitle").parentNode.insertAdjacentElement("afterend",p);
 }
 p.style.display=impState&&impState.photo?"flex":"none";
}
function applyLineAdjust(){
 if(!impState||!impState.photo)return;
 toast("線画を調整中…🎨");
 const w=+($("lineWeight")?.value||3), c=+($("lineContrast")?.value||6);
 setTimeout(()=>{try{buildImport(impState.src,Math.min(3,Math.max(1,Math.round(w/3)+1)),false); toast("線画を更新したよ！")}catch(e){toast("調整できなかったよ")}},40);
}
function impLvUI(){let l=document.getElementById("impLv");if(!l){l=document.createElement("div");l.id="impLv";l.style.cssText="display:flex;gap:6px;justify-content:center;align-items:center;margin:6px 0;flex-wrap:wrap";
 l.innerHTML='<span style="font-size:12px;font-weight:700">イラストの細かさ</span>'+[["かんたん",1],["ふつう",2],["こまかい",3]].map(([t,v])=>`<button class="pill" data-lv="${v}" onclick="reconv(${v})" style="padding:6px 12px">${t}</button>`).join("");
 $("pageTitle").parentNode.insertAdjacentElement("afterend",l)}
 l.style.display=impState&&impState.photo?"flex":"none";l.querySelectorAll("button").forEach(b=>b.style.outline=impState&&+b.dataset.lv===impState.lv?"3px solid #ff6b6b":"none")}
function openImport(){const s=impState;imp=true;undoS=[];hideAll();$("editor").classList.remove("hidden");$("pageTitle").textContent="マイぬりえ";$("lines").style.mixBlendMode="multiply";$("drawing").innerHTML=`<image href="${s.url}" width="400" height="400"/>`;px.clearRect(0,0,800,800);mk=s.mk;lineCv=s.o;ac();sfx("start");impLvUI();importAdjustUI()}
function compose(cb,S=800){const o=document.createElement("canvas");o.width=o.height=S;const x=o.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,S,S);x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";x.drawImage(pc,0,0,S,S);svgImg($("drawing").innerHTML,im=>{if(imp)x.globalCompositeOperation="multiply";x.drawImage(im,0,0,S,S);x.globalCompositeOperation="source-over";cb(o)},S)}
function downloadArtwork(){compose(o=>o.toBlob(b=>{const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=`nurie-${imp?"myart":(currentCat+1)+"-"+(currentPage+1)}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);sfx("ok");toast("画像を保存したよ📥")}))}
let memSaved=null;
function loadSaved(){try{const s=window["local"+"Storage"],v=s?s.getItem("nurieSmileSaved"):null;return v?JSON.parse(v):(memSaved||[])}catch(e){return memSaved||[]}}
function persistSaved(a){memSaved=a;try{window["local"+"Storage"].setItem("nurieSmileSaved",JSON.stringify(a))}catch(e){}}
function saveArtwork(){compose(o=>{const t=document.createElement("canvas");t.width=t.height=260;t.getContext("2d").drawImage(o,0,0,260,260);try{let arr=loadSaved();arr.unshift({title:$("pageTitle").textContent,img:t.toDataURL("image/jpeg",.8),date:new Date().toLocaleDateString("ja-JP")});persistSaved(arr.slice(0,30));sfx("ok");toast("作品アルバムに保存したよ！💖")}catch(e){toast("保存できなかったよ…📥画像ダウンロードを使ってね")}})}
function renderSaved(){const arr=loadSaved();$("savedList").innerHTML=arr.length?arr.map(x=>`<div class="saved-item">${x.img?`<img src="${x.img}" style="width:100%;border-radius:8px">`:""}${x.title}<br><small>${x.date}</small></div>`).join(""):"まだ作品がないよ。ぬりえを完成させて保存してね！"}
window.addEventListener("error",e=>{console.error(e);});
window.addEventListener("unhandledrejection",e=>{console.error(e.reason||e);});
