/* The portfolio engine: a scale model of the Bauhaus Dessau that scroll completes,
   preceded by every earlier version of this page as live scale models.
   Lines marked "piece factory" through "targets.sort" are the unchanged model;
   the scroll model below drives panels, the version slider and the frame. */
'use strict';
const $=s=>document.querySelector(s);
const reduced=document.documentElement.dataset.engine!=='active';

/* ── piece factory ────────────────────────────────────────────
   world coords: x → right, y → up (negated for CSS), z → viewer.
   Permanent structure gets a ghost plan (3 dashed faces, square);
   finishes and temporary works do not — the drawing shows bones.
   `at` builds a piece; `off` dismantles it (temporary works).
   Opacity animates on leaf faces only — opacity on a preserve-3d
   parent would flatten the scene (the classic CSS-3D landmine).  */
const build=$('#build');
const pieces=[],targets=[];
let idx=0;

function face(w,h,tf,cls,r){
  const f=document.createElement('div');
  f.className='f '+cls;
  f.style.cssText=`width:${w}px;height:${h}px;left:${-w/2}px;top:${-h/2}px;`
                 +`transform:${tf};border-radius:${r}px`;
  return f;
}
function cuboid(w,h,d,cls,ghost,r){
  const c=document.createElement('div');c.className='cub '+cls;
  const faces=[
    ['ff',w,h,`translateZ(${d/2}px)`],
    ['fr',d,h,`rotateY(90deg) translateZ(${w/2}px)`],
    ['ft',w,d,`rotateX(90deg) translateZ(${h/2}px)`],
  ];
  if(!ghost)faces.push(
    ['fb',w,h,`rotateY(180deg) translateZ(${d/2}px)`],
    ['fl',d,h,`rotateY(-90deg) translateZ(${w/2}px)`],
    ['fu',w,d,`rotateX(-90deg) translateZ(${h/2}px)`]);
  for(const[k,fw,fh,tf]of faces)c.appendChild(face(fw,fh,tf,k,r));
  return c;
}
function box(o){ /* {x,y,z,w,h,d,mat,at,off?,rot?,parent?,ghost?,track?} */
  const p=document.createElement('div');p.className='piece m-'+o.mat;
  p.style.transform=`translate3d(${o.x}px,${-o.y}px,${o.z}px)`+(o.rot?' '+o.rot:'');
  p.style.setProperty('--td',(idx++%4)*45+'ms');
  const r=o.mat==='ink'?1:
          Math.max(4,Math.min(10,Math.round(Math.min(o.w,o.h,o.d)/2)));
  const drop=document.createElement('div');drop.className='drop';
  if(o.ghost!==false)p.appendChild(cuboid(o.w,o.h,o.d,'g',true,0));
  drop.appendChild(cuboid(o.w,o.h,o.d,'sd',false,r));
  p.appendChild(drop);
  (o.parent||build).appendChild(p);
  pieces.push({el:p,at:o.at,off:o.off});
  if(o.track!==false&&!o.parent&&o.off===undefined)
    targets.push({x:o.x,y:o.y+o.h/2,z:o.z,at:o.at});
}
function bill(o){ /* {x,y,z,emoji,label?,at,size?} */
  const b=document.createElement('div');b.className='bill';
  b.style.setProperty('--td',(idx++%4)*45+'ms');
  if(o.size)b.style.fontSize=o.size+'px';
  b.innerHTML=(o.emoji?`<span class="e">${o.emoji}</span>`:'')+
              (o.label?`<small>${o.label}</small>`:'');
  b.style.transform=
    `translate3d(${o.x}px,${-o.y}px,${o.z}px)`+
    ` rotateY(calc(var(--ry)*-1deg)) rotateX(calc(var(--rx)*-1deg))`;
  build.appendChild(b);
  pieces.push({el:b,at:o.at,off:o.off});
}
function plate(o){ /* facade paint: {x,y,z,ry,w,h,html,at,cls} */
  const el=document.createElement('div');
  el.className='plate '+(o.cls||'');
  el.style.cssText=`width:${o.w}px;height:${o.h}px;left:${-o.w/2}px;top:${-o.h/2}px;`
    +`transform:translate3d(${o.x}px,${-o.y}px,${o.z}px) rotateY(${o.ry||0}deg)`;
  el.innerHTML=o.html;
  el.querySelectorAll('span').forEach((s,i)=>s.style.transitionDelay=(i*90)+'ms');
  build.appendChild(el);
  pieces.push({el,at:o.at});
}

/* ── the campus ───────────────────────────────────────────────
   A plush scale model of the Bauhaus Dessau. Storey = 36.

              N ▲                       plan (not to scale)
        ┌──────────┐
        │  North   │══bridge══┐            z
        │  Wing    │ (road ↓) │  ┌────┐    ↑
        └──────────┘      ┌───┴──┤Link│    │
                          │ Wksp │─┬──┘    └──→ x
                          │ glass│ │Studio (5 st.)
                          └──────┘ └────┘
   Workshop: full curtain wall  ·  Bridge: 2 st. on pilotis
   North: ribbon windows        ·  Studio: balconies, tallest  */

const P=o=>box(o);

/* foundation pads */
P({x:95, y:4,z:35,  w:182,h:8,d:142,mat:'conc',at:.06});   // workshop
P({x:-175,y:4,z:-40,w:122,h:8,d:152,mat:'conc',at:.066});  // north wing
P({x:150,y:4,z:-115,w:72, h:8,d:92, mat:'conc',at:.072});  // studio
P({x:130,y:4,z:-52, w:82, h:8,d:56, mat:'conc',at:.078});  // link

/* ── tower crane (temporary works; tracks the build in JS) ── */
P({x:-40,y:6,z:170,w:48,h:12,d:48,mat:'conc',at:.085,off:.85,track:false});
P({x:-40,y:158,z:170,w:14,h:304,d:14,mat:'peach',at:.10,off:.84,track:false});
const craneWrap=document.createElement('div');
craneWrap.className='grp';
craneWrap.style.transform='translate3d(-40px,-310px,170px)';
build.appendChild(craneWrap);
const craneYaw=document.createElement('div');craneYaw.id='craneYaw';
craneWrap.appendChild(craneYaw);
P({parent:craneYaw,x:100,y:6,z:0,w:200,h:9,d:9,mat:'peach',at:.115,off:.83});  // jib
P({parent:craneYaw,x:-45,y:6,z:0,w:82,h:9,d:11,mat:'peach',at:.115,off:.83});  // counter-jib
P({parent:craneYaw,x:0,y:26,z:0,w:9,h:40,d:9,mat:'peach',at:.118,off:.83});    // apex
P({parent:craneYaw,x:-80,y:-4,z:0,w:22,h:18,d:18,mat:'conc',at:.12,off:.83});  // counterweight
const trolley=document.createElement('div');trolley.id='trolley';
craneYaw.appendChild(trolley);
P({parent:trolley,x:0,y:-1,z:0,w:12,h:6,d:12,mat:'dark',at:.13,off:.82});      // trolley block
const cableWrap=document.createElement('div');cableWrap.id='cableWrap';
trolley.appendChild(cableWrap);
cableWrap.innerHTML='<div class="cline"></div><div class="cline x90"></div>';
pieces.push({el:cableWrap,at:.135,off:.82});
const hookHost=document.createElement('div');
hookHost.className='grp';cableWrap.appendChild(hookHost);
P({parent:hookHost,x:0,y:-3,z:0,w:9,h:7,d:9,mat:'steel',at:.14,off:.82});      // hook

/* ── workshop wing: the glass one (frame first, skin later) ── */
P({x:22, y:60,z:-16,w:12,h:104,d:12,mat:'steel',at:.15});
P({x:168,y:60,z:-16,w:12,h:104,d:12,mat:'steel',at:.165});
P({x:22, y:60,z:86, w:12,h:104,d:12,mat:'steel',at:.18});
P({x:168,y:60,z:86, w:12,h:104,d:12,mat:'steel',at:.195});
P({x:95,y:44, z:35,w:166,h:8,d:126,mat:'slab',at:.22});
P({x:95,y:80, z:35,w:166,h:8,d:126,mat:'slab',at:.25});
P({x:95,y:116,z:35,w:176,h:8,d:136,mat:'slab',at:.28});     // roof, slight overhang

/* ── bridge over the road, on dark pilotis ── */
P({x:-25,y:20,z:-18,w:8,h:40,d:8,mat:'dark',at:.30});
P({x:-25,y:20,z:8,  w:8,h:40,d:8,mat:'dark',at:.31});
P({x:-90,y:20,z:-18,w:8,h:40,d:8,mat:'dark',at:.32});
P({x:-90,y:20,z:8,  w:8,h:40,d:8,mat:'dark',at:.33});
P({x:-55,y:44, z:-5,w:130,h:8,d:50,mat:'slab',at:.35});
P({x:-55,y:76, z:-5,w:130,h:8,d:50,mat:'slab',at:.37});
P({x:-55,y:108,z:-5,w:134,h:8,d:54,mat:'slab',at:.39});     // bridge roof

/* ── north wing frame ── */
P({x:-212,y:60,z:-92,w:12,h:104,d:12,mat:'steel',at:.40});
P({x:-138,y:60,z:-92,w:12,h:104,d:12,mat:'steel',at:.415});
P({x:-212,y:60,z:12, w:12,h:104,d:12,mat:'steel',at:.43});
P({x:-138,y:60,z:12, w:12,h:104,d:12,mat:'steel',at:.445});
P({x:-175,y:44, z:-40,w:106,h:8,d:136,mat:'slab',at:.47});
P({x:-175,y:80, z:-40,w:106,h:8,d:136,mat:'slab',at:.49});
P({x:-175,y:116,z:-40,w:116,h:8,d:146,mat:'slab',at:.51});  // roof

/* ── link (canteen) + studio tower frame ── */
P({x:100,y:22,z:-50,w:8,h:28,d:8,mat:'steel',at:.52});
P({x:160,y:22,z:-50,w:8,h:28,d:8,mat:'steel',at:.525});
P({x:130,y:40,z:-52,w:76,h:8,d:50,mat:'slab',at:.535});
P({x:128,y:96,z:-147,w:10,h:176,d:10,mat:'steel',at:.55});
P({x:172,y:96,z:-147,w:10,h:176,d:10,mat:'steel',at:.56});
P({x:128,y:96,z:-83, w:10,h:176,d:10,mat:'steel',at:.57});
P({x:172,y:96,z:-83, w:10,h:176,d:10,mat:'steel',at:.58});
P({x:150,y:44, z:-115,w:56,h:8,d:76,mat:'slab',at:.60});
P({x:150,y:80, z:-115,w:56,h:8,d:76,mat:'slab',at:.615});
P({x:150,y:116,z:-115,w:56,h:8,d:76,mat:'slab',at:.63});
P({x:150,y:152,z:-115,w:56,h:8,d:76,mat:'slab',at:.645});
P({x:150,y:188,z:-115,w:62,h:8,d:82,mat:'slab',at:.66});    // studio roof

/* ── skins: stucco, ribbons, balconies (no ghosts — finishes) ── */
/* north wing */
P({x:-175,y:60,z:31,  w:106,h:104,d:4,mat:'stucco',at:.585,ghost:false});
P({x:-119,y:60,z:-40, w:4,h:104,d:136,mat:'stucco',at:.60,ghost:false});
P({x:-175,y:28,z:33.5,w:94,h:12,d:3,mat:'ribbon',at:.62,ghost:false});
P({x:-175,y:64,z:33.5,w:94,h:12,d:3,mat:'ribbon',at:.63,ghost:false});
P({x:-175,y:100,z:33.5,w:94,h:12,d:3,mat:'ribbon',at:.64,ghost:false});
P({x:-116.5,y:28,z:-40,w:3,h:12,d:124,mat:'ribbon',at:.625,ghost:false});
P({x:-116.5,y:64,z:-40,w:3,h:12,d:124,mat:'ribbon',at:.635,ghost:false});
P({x:-116.5,y:100,z:-40,w:3,h:12,d:124,mat:'ribbon',at:.645,ghost:false});
plate({x:-215,y:14,z:33.6,w:56,h:8,at:.65,cls:'code',
       html:'<span>N-02 · Fachschule</span>'});
/* bridge */
P({x:-55,y:76,z:22,w:130,h:56,d:4,mat:'stucco',at:.655,ghost:false});
P({x:-55,y:60,z:24.5,w:118,h:12,d:3,mat:'ribbon',at:.67,ghost:false});
P({x:-55,y:92,z:24.5,w:118,h:12,d:3,mat:'ribbon',at:.68,ghost:false});
plate({x:-100,y:76,z:24.6,w:56,h:8,at:.685,cls:'code',
       html:'<span>Br-03 · Brücke</span>'});
/* studio tower */
P({x:150,y:96,z:-73,w:56,h:176,d:4,mat:'stucco',at:.69,ghost:false});
P({x:181,y:96,z:-115,w:4,h:176,d:76,mat:'stucco',at:.70,ghost:false});
P({x:150,y:26,z:-70.5,w:40,h:11,d:3,mat:'ribbon',at:.705,ghost:false});
P({x:150,y:62,z:-70.5,w:40,h:11,d:3,mat:'ribbon',at:.71,ghost:false});
P({x:150,y:98,z:-70.5,w:40,h:11,d:3,mat:'ribbon',at:.715,ghost:false});
P({x:150,y:134,z:-70.5,w:40,h:11,d:3,mat:'ribbon',at:.72,ghost:false});
P({x:150,y:170,z:-70.5,w:40,h:11,d:3,mat:'ribbon',at:.725,ghost:false});
P({x:189,y:62, z:-115,w:14,h:5,d:20,mat:'stucco',at:.715,ghost:false});
P({x:189,y:98, z:-115,w:14,h:5,d:20,mat:'stucco',at:.72,ghost:false});
P({x:189,y:134,z:-115,w:14,h:5,d:20,mat:'stucco',at:.725,ghost:false});
P({x:189,y:170,z:-115,w:14,h:5,d:20,mat:'stucco',at:.73,ghost:false});
plate({x:166,y:14,z:-70.4,w:56,h:8,at:.735,cls:'code',
       html:'<span>St-05 · Prellerhaus</span>'});
/* workshop curtain wall — the reveal, saved for last */
P({x:30,y:25,z:101.5,w:26,h:34,d:3,mat:'dark',at:.70,ghost:false});   // entrance
P({x:30,y:46,z:108,w:44,h:5,d:26,mat:'stucco',at:.705,ghost:false});  // canopy
P({x:95,y:65,z:101,w:174,h:106,d:4,mat:'glass',at:.74,ghost:false});
P({x:183,y:65,z:35,w:4,h:106,d:134,mat:'glass',at:.755,ghost:false});
plate({x:165,y:14,z:103.2,w:56,h:8,at:.76,cls:'code',
       html:'<span>W-01 · Werkstatt</span>'});
plate({x:185.6,y:62,z:74,ry:90,w:18,h:110,at:.77,cls:'sign',
       html:'<span>B</span><span>A</span><span>U</span><span>H</span><span>A</span><span>U</span><span>S</span>'});

/* ── scaffold on the north wing (temporary works) ── */
P({x:-205,y:65,z:42,w:5,h:130,d:5,mat:'steel',at:.42,off:.78,track:false,ghost:false});
P({x:-205,y:65,z:56,w:5,h:130,d:5,mat:'steel',at:.43,off:.785,track:false,ghost:false});
P({x:-145,y:65,z:42,w:5,h:130,d:5,mat:'steel',at:.44,off:.79,track:false,ghost:false});
P({x:-145,y:65,z:56,w:5,h:130,d:5,mat:'steel',at:.45,off:.795,track:false,ghost:false});
P({x:-175,y:46,z:49,w:70,h:5,d:24,mat:'plank',at:.47,off:.80,track:false,ghost:false});
P({x:-175,y:90,z:49,w:70,h:5,d:24,mat:'plank',at:.55,off:.805,track:false,ghost:false});
P({x:-175,y:65,z:56,w:5,h:120,d:5,mat:'steel',at:.57,off:.80,track:false,ghost:false,rot:'rotateZ(34deg)'});
/* stockpiles by the crane */
P({x:22,y:10,z:196,w:40,h:8,d:16,mat:'plank',at:.20,off:.79,track:false,ghost:false});
P({x:-98,y:9,z:202,w:24,h:12,d:18,mat:'conc',at:.24,off:.795,track:false,ghost:false});

targets.sort((a,b)=>a.at-b.at);

/* ── scroll model: time beats, then the build ─────────────────
   Each panel owns one beat of the runway, so it has real scroll
   distance. The first beats are earlier versions of this page: the
   slider mirrors scroll through them and is also a handle. From the
   "now" beat on, scroll builds the model exactly as before. */
const R=document.documentElement.style;
let p=.39,yaw=150,trol=50,cab=60;
const CRANE={bx:-40,bz:170,topY:308,restYaw:150,minR:34,maxR:192};
const column=$('.column');
const name=$('#name');
const panels=[...document.querySelectorAll('.column > .panel')];
const beats=[...document.querySelectorAll('.runway > .beat')];
const NOW=panels.findIndex(el=>el.id==='hero');
const labels=panels.slice(0,NOW+1).map(el=>el.dataset.stop);
const replay=$('#rebuild');
const progress=$('#progress');
const timeline=$('.timeline');
const slider=$('#time');
const frame=$('#frame');
replay.addEventListener('click',()=>scrollTo({top:0,behavior:reduced?'auto':'smooth'}));
function craneGoal(){
  if(p>.745)return null;
  let target=null;
  for(const next of targets){if(next.at<=p+.015)target=next;else break;}
  return target;
}

let starts=[],max=0,activeStop=null;
function measure(){
  const y=scrollY;
  starts=beats.map(b=>b.getBoundingClientRect().top+y);
  max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
}
const clamp01=v=>Math.min(1,Math.max(0,v));
function beatAt(y){let i=0;while(i+1<starts.length&&y>=starts[i+1])i++;return i;}
const endOf=i=>i+1<starts.length?starts[i+1]:max;
/* Slider value 0..NOW: on tick i when stop i begins, moving toward i+1 through its beat. */
function timeValue(y){
  if(y>=starts[NOW])return NOW;
  const i=beatAt(y);
  return i+clamp01((y-starts[i])/Math.max(1,endOf(i)-starts[i]));
}
/* Exact inverse of timeValue, so dragging never fights the scroll position. */
function scrollFor(v){
  const i=Math.min(NOW-1,Math.max(0,Math.floor(v)));
  return starts[i]+(v-i)*(endOf(i)-starts[i]);
}

/* ── frame: a live scale model of the selected earlier version ─ */
function createFrameController(){
  const img=frame.querySelector('img');
  let iframe=frame.querySelector('iframe');
  const stops=panels.slice(0,NOW).map(el=>({kind:el.dataset.kind||'iframe',src:el.dataset.src,narrow:el.dataset.srcNarrow,label:el.dataset.stop}));
  let pending,shown=null,loaded=null,timer=0,idle=0,gen=0,native=false;
  const pick=stop=>native&&stop.narrow?stop.narrow:stop.src;
  function fit(){
    const w=frame.clientWidth,h=frame.clientHeight;
    frame.toggleAttribute('data-cramped',h<120);
    native=w<600;
    const k=native?1:w/1280;
    frame.style.setProperty('--k',k);
    frame.style.setProperty('--iw',(native?w:1280)+'px');
    frame.style.setProperty('--ih',Math.ceil(h/k)+'px');
    if(shown!==null&&stops[shown].kind==='image')img.src=pick(stops[shown]);
  }
  new ResizeObserver(fit).observe(frame);fit();
  /* Archived pages run their own animation loops; park the iframe while nothing shows it. */
  function park(){
    if(loaded===null)return;
    iframe.removeAttribute('data-on');iframe.src='about:blank';loaded=null;
    if(shown!==null&&stops[shown].kind!=='image')shown=null;
  }
  function show(want){
    clearTimeout(idle);
    if(want===null){frame.dataset.state='hidden';frame.classList.remove('openable');idle=setTimeout(park,3000);return;}
    frame.dataset.state='shown';
    const stop=stops[want];
    frame.classList.toggle('openable',stop.kind!=='image');
    if(want===shown)return;
    const id=++gen;
    for(const f of frame.querySelectorAll('iframe'))if(f!==iframe)f.remove();
    if(stop.kind==='image'){
      img.src=pick(stop);
      img.decode().catch(()=>{}).then(()=>{
        if(id!==gen)return;
        img.toggleAttribute('data-on',true);shown=want;park();
      });
      return;
    }
    const next=document.createElement('iframe');
    next.tabIndex=-1;next.title=`Scale model of the ${stop.label} version of this page`;
    next.src=stop.src;
    next.addEventListener('load',function onLoad(){
      if(next.contentDocument&&next.contentDocument.URL==='about:blank')return;
      next.removeEventListener('load',onLoad);
      if(id!==gen){next.remove();return;}
      const old=iframe;iframe=next;
      next.toggleAttribute('data-on',true);img.removeAttribute('data-on');old.removeAttribute('data-on');
      setTimeout(()=>old.remove(),480);
      shown=want;loaded=want;
    });
    frame.append(next);
  }
  /* Only act once the active stop has been stable for a moment. */
  function request(want){
    if(want===pending)return;
    pending=want;clearTimeout(timer);
    timer=setTimeout(()=>show(want),200);
  }
  return {request};
}
const frameController=reduced?{request(){}}:createFrameController();

/* ── viewer: the selected version at full size, in place ─────── */
const viewer=$('#viewer');
const viewerTitle=$('#viewer-title');
let opener=null;
function openViewer(index,source){
  const stop=panels[index];
  if(!stop||!stop.dataset.src||stop.dataset.kind==='image'||viewer.open)return;
  opener=source;
  viewerTitle.textContent=`The ${stop.dataset.stop} version`;
  const page=document.createElement('iframe');
  page.title=`The ${stop.dataset.stop} version of this page`;
  page.src=stop.dataset.src;
  viewer.append(page);
  document.documentElement.style.overflow='hidden';
  viewer.showModal();
}
viewer.addEventListener('close',()=>{
  document.documentElement.style.overflow='';
  viewer.querySelector('iframe')?.remove();
  const fallback=activeStop===null?null:panels[activeStop].querySelector('a[data-open]');
  (opener&&opener.tabIndex>=0?opener:fallback)?.focus({preventScroll:true});
  opener=null;
});
$('#viewer-close').addEventListener('click',()=>viewer.close());

function tick(){
  if(!reduced&&document.readyState!=='complete')measure();
  const y=Math.min(max,Math.max(0,scrollY));
  const buildProgress=reduced?1:clamp01((y-starts[NOW])/Math.max(1,max-starts[NOW]));
  p=reduced?1:.39+.61*buildProgress;
  R.setProperty('--shadow',p.toFixed(3));
  for(const pc of pieces){
    pc.el.classList.toggle('built',p>=pc.at&&(pc.off===undefined||p<pc.off));
    if(pc.off!==undefined)pc.el.classList.toggle('gone',p>=pc.off);
  }
  const target=craneGoal();
  let yawT=CRANE.restYaw,trolT=50,cabT=60;
  if(target){
    const dx=target.x-CRANE.bx,dz=target.z-CRANE.bz;
    yawT=Math.atan2(-dz,dx)*180/Math.PI;
    trolT=Math.min(CRANE.maxR,Math.max(CRANE.minR,Math.hypot(dx,dz)));
    cabT=Math.min(260,Math.max(26,CRANE.topY-(target.y+30)));
  }
  const k=reduced?1:.05;
  yaw+=(((yawT-yaw+540)%360)-180)*k;trol+=(trolT-trol)*k;cab+=(cabT-cab)*k;
  craneYaw.style.transform=`rotateY(${yaw}deg)`;
  trolley.style.transform=`translate3d(${trol}px,2px,0)`;
  cableWrap.style.transform=`scaleY(${(cab/260).toFixed(4)})`;
  hookHost.style.transform=`scaleY(${(260/cab).toFixed(4)}) translateY(${cab.toFixed(1)}px)`;
  const active=reduced?NOW:beatAt(y);
  panels.forEach((panel,index)=>{panel.hidden=!reduced&&index!==active;panel.inert=panel.hidden;});
  if(!reduced){
    const inTime=active<=NOW;
    if(timeline.hidden===inTime){
      if(!inTime&&document.activeElement===slider)$('#content').focus({preventScroll:true});
      timeline.hidden=!inTime;name.hidden=!inTime;
    }
    if(inTime){
      slider.value=timeValue(y);
      const text=labels[active];
      if(slider.getAttribute('aria-valuetext')!==text)slider.setAttribute('aria-valuetext',text);
    }
    activeStop=active<NOW?active:null;
    frameController.request(activeStop);
  }
  replay.hidden=reduced||buildProgress<.9;
  progress.style.width=buildProgress*100+'%';
  document.body.classList.toggle('done',p>=.925);
  if(!reduced)requestAnimationFrame(tick);
}

if(!reduced){
  document.documentElement.style.scrollBehavior='auto';
  addEventListener('resize',measure,{passive:true});
  addEventListener('load',measure);
  new ResizeObserver(([entry])=>R.setProperty('--column-h',Math.ceil(entry.contentRect.height)+'px')).observe(column);
  measure();
  const hashStop=panels.findIndex(el=>'#'+el.id===location.hash);
  if(hashStop>=0&&hashStop<=NOW)scrollTo({top:starts[hashStop]});
  slider.addEventListener('input',()=>scrollTo({top:scrollFor(+slider.value)}));
  slider.addEventListener('keydown',e=>{
    const v=timeValue(Math.min(max,Math.max(0,scrollY)));
    const next={ArrowRight:Math.floor(v)+1,ArrowUp:Math.floor(v)+1,PageUp:Math.floor(v)+1,
      ArrowLeft:Math.ceil(v)-1,ArrowDown:Math.ceil(v)-1,PageDown:Math.ceil(v)-1,Home:0,End:NOW}[e.key];
    if(next===undefined)return;
    e.preventDefault();
    scrollTo({top:starts[Math.min(NOW,Math.max(0,next))]});
  });
  frame.addEventListener('click',()=>{if(frame.classList.contains('openable')&&activeStop!==null)openViewer(activeStop,frame);});
  panels.forEach((panel,index)=>{
    const link=panel.querySelector('a[data-open]');
    if(!link)return;
    link.addEventListener('click',e=>{
      if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      e.preventDefault();openViewer(index,link);
    });
  });
}
tick();
document.documentElement.dataset.ready='';
