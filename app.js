(()=>{
'use strict';

/* ============ SHOPIFY SETTINGS ============
   Fill in the two values below to switch on live prices, the Shopify cart and checkout.
   Payment (Razorpay) is handled inside Shopify checkout, so there are no payment keys here.
   Leave them blank and the page runs in preview mode: a local bag and no checkout. */
const SHOPIFY={
  domain:'vqzmbg-ef.myshopify.com',          // your store's .myshopify.com address
  token:'e8e79192b7ede7fcfe4dd33508dc2b11',  // Storefront API *public* access token (Headless channel). Safe to publish.
  version:'2026-07',    // Storefront API version
  country:'IN',         // prices and checkout in INR
  handlePrefix:'cenko-',// fallback: handle = this + id, for products not listed below
  handles:{             // site product id -> product URL handle in Shopify
    exotica:'exotica', nature:'nature', tranquility:'tranquility', rejuvenation:'rejuvenation',
    spice:'the-spice-rack', coffee:'the-coffee-rack', taj:'the-taj-mahal', ghats:'ghats-of-varanasi',
    jasmine:'jasmine-100', rose:'rose-100', lavender:'lavender-100', musk:'musk-100', lemongrass:'lemongrass-100', citronella:'citronella-100'
  },
  /* Customer accounts (Shopify Customer Account API, public client set up in Headless > Customer Account API) */
  account:{
    clientId:'a0cefbbf-0ff3-43cf-9f08-8534c91fadd5',
    shopId:'85572813021',
    apiVersion:'2026-07',
    redirect:'https://www.cenko.in/',
    memberCode:'CENKO-MEMBER' /* Shopify discount code (10% off) that the site applies to a signed-in member's cart */
  }
};

/* ============ SELLER DETAILS (shown in the footer, policies and product information) ============
   Keep these accurate: Indian consumer law requires them to be displayed. */
const SELLER={
  brand:'CENKO',
  legalName:'CENKO',
  address:'Mesa School of Business, Arekere Main Road, Venugopal Reddy Layout, Arekere, 3rd Floor, Bengaluru, Karnataka 560076, India',
  email:'vasugoelop@gmail.com',
  phone:'+91 92050 01808',
  grievance:{name:'CENKO Customer Care',designation:'',email:'vasugoelop@gmail.com',phone:'+91 92050 01808'},
  gstin:'',           /* add your GSTIN here once registered; it will appear in the footer and policies */
  manufacturer:'',    /* name and address of the manufacturer/packer, if different from the seller */
  origin:'India',
  delivery:'3–7 days after dispatch',
  updated:'29 September 2026'
};
const IMG = {"f_exotica": "/img/f_exotica.webp", "f_nature": "/img/f_nature.webp", "f_tranquility": "/img/f_tranquility.webp", "f_rejuvenation": "/img/f_rejuvenation.webp", "p_jasmine": "/img/p_jasmine.webp", "p_citronella": "/img/p_citronella.webp", "p_lemongrass": "/img/p_lemongrass.webp", "p_rose": "/img/p_rose.webp", "p_musk": "/img/p_musk.webp", "p_lavender": "/img/p_lavender.webp", "g_ghats": "/img/g_ghats.webp", "g_taj": "/img/g_taj.webp", "r_spice": "/img/r_spice.webp", "r_coffee": "/img/r_coffee.webp", "t_exotica": "/img/t_exotica.webp", "t_rejuvenation": "/img/t_rejuvenation.webp", "t_nature": "/img/t_nature.webp", "t_tranquility": "/img/t_tranquility.webp"};
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer: fine)').matches;
const LITE = document.documentElement.classList.contains('lite');
const MIN = document.documentElement.classList.contains('min');
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0));return t*t*(3-2*t);};
const body=document.body;
const G=null; /* GSAP removed: reveals use the Web Animations API */
const EASE_OUT='cubic-bezier(.215,.61,.355,1)';
function rise(els,y,dur,stagger,delay){ [...els].forEach((el,i)=>{ el.classList.remove('rv-wait'); el.animate([{opacity:0,transform:`translateY(${y}px)`},{opacity:1,transform:'none'}],{duration:dur,delay:(delay||0)+i*stagger,easing:EASE_OUT,fill:'backwards'}); }); }

/* ============ simplex noise 3D ============ */
const noise3=(()=>{
  const g=new Float32Array([1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1]);
  const p=new Uint8Array(256); for(let i=0;i<256;i++)p[i]=i;
  let s=1337; const rnd=()=>((s=(s*16807)%2147483647)/2147483647);
  for(let i=255;i>0;i--){const j=(rnd()*(i+1))|0;[p[i],p[j]]=[p[j],p[i]];}
  const perm=new Uint8Array(512),pm=new Uint8Array(512);
  for(let i=0;i<512;i++){perm[i]=p[i&255];pm[i]=perm[i]%12;}
  const F3=1/3,G3=1/6;
  return (x,y,z)=>{
    let n0=0,n1=0,n2=0,n3=0;
    const s=(x+y+z)*F3,i=Math.floor(x+s),j=Math.floor(y+s),k=Math.floor(z+s);
    const t=(i+j+k)*G3,x0=x-(i-t),y0=y-(j-t),z0=z-(k-t);
    let i1,j1,k1,i2,j2,k2;
    if(x0>=y0){ if(y0>=z0){i1=1;j1=0;k1=0;i2=1;j2=1;k2=0;} else if(x0>=z0){i1=1;j1=0;k1=0;i2=1;j2=0;k2=1;} else{i1=0;j1=0;k1=1;i2=1;j2=0;k2=1;} }
    else{ if(y0<z0){i1=0;j1=0;k1=1;i2=0;j2=1;k2=1;} else if(x0<z0){i1=0;j1=1;k1=0;i2=0;j2=1;k2=1;} else{i1=0;j1=1;k1=0;i2=1;j2=1;k2=0;} }
    const x1=x0-i1+G3,y1=y0-j1+G3,z1=z0-k1+G3,x2=x0-i2+2*G3,y2=y0-j2+2*G3,z2=z0-k2+2*G3,x3=x0-1+3*G3,y3=y0-1+3*G3,z3=z0-1+3*G3;
    const ii=i&255,jj=j&255,kk=k&255;
    let t0=.6-x0*x0-y0*y0-z0*z0; if(t0>0){const q=pm[ii+perm[jj+perm[kk]]]*3;t0*=t0;n0=t0*t0*(g[q]*x0+g[q+1]*y0+g[q+2]*z0);}
    let t1=.6-x1*x1-y1*y1-z1*z1; if(t1>0){const q=pm[ii+i1+perm[jj+j1+perm[kk+k1]]]*3;t1*=t1;n1=t1*t1*(g[q]*x1+g[q+1]*y1+g[q+2]*z1);}
    let t2=.6-x2*x2-y2*y2-z2*z2; if(t2>0){const q=pm[ii+i2+perm[jj+j2+perm[kk+k2]]]*3;t2*=t2;n2=t2*t2*(g[q]*x2+g[q+1]*y2+g[q+2]*z2);}
    let t3=.6-x3*x3-y3*y3-z3*z3; if(t3>0){const q=pm[ii+1+perm[jj+1+perm[kk+1]]]*3;t3*=t3;n3=t3*t3*(g[q]*x3+g[q+1]*y3+g[q+2]*z3);}
    return 32*(n0+n1+n2+n3);
  };
})();

/* ============ content ============ */
const COLL=[
  {id:'exotica',name:'Exotica',sub:'faraway lands',label:'#D6402A',tint:'#E8D5CC',on:'#fff',mrp:300,price:210,kind:'TIN',img:'t_exotica',
   alt:'The Exotica tube: a brushed metal cylinder with a black lid and a red hexagon-print label',
   desc:'Warm and resinous. Cedar and amber for long evenings, softened by lilac and lotus.',
   best:'Long evenings, and rooms that need warming up.',
   notes:[['Cedar','#9A6B47'],['Lilac','#8A5A7C'],['Lotus','#C8587A'],['Amber Oriental','#B0492F']]},
  {id:'nature',name:'Nature',sub:'green and open',label:'#56A23A',tint:'#D9E2CF',on:'#fff',mrp:300,price:210,kind:'TIN',img:'t_nature',
   alt:'The Nature tube: a brushed metal cylinder with a black lid and a green label edged in violet',
   desc:'Green and airy. Eucalyptus and patchouli, with violet and a little vanilla for sweetness.',
   best:'Afternoons with the windows open.',
   notes:[['Violet','#7F5A80'],['Vanilla','#D9A865'],['Eucalyptus','#6E8A48'],['White Patchouli','#8FA35E']]},
  {id:'tranquility',name:'Tranquility',sub:'the quiet one',label:'#DE356E',tint:'#EDD6DE',on:'#fff',mrp:300,price:210,kind:'TIN',img:'t_tranquility',
   alt:'The Tranquility tube: a brushed metal cylinder with a black lid and a pink label edged in teal',
   desc:'Sandalwood and myrrh, lifted by rose and jasmine. The one people buy again.',
   best:'Winding down at the end of the day.',
   notes:[['Rose','#C94C6D'],['Myrrh','#3C7176'],['Jasmine','#D3A23F'],['Sandalwood','#9A6C4E']]},
  {id:'rejuvenation',name:'Rejuvenation',sub:'for mornings',label:'#4A8ED1',tint:'#D3DEE9',on:'#fff',mrp:300,price:210,kind:'TIN',img:'t_rejuvenation',
   alt:'The Rejuvenation tube: a brushed metal cylinder with a black lid and a blue label edged in red',
   desc:'Bright and clean. Peppermint and sea air for mornings that need waking.',
   best:'Mornings, and a desk you need to think at.',
   notes:[['Energy','#C54B3B'],['Sea Shore','#3A7580'],['Blue Angel','#56687A'],['Peppermint','#8C9C4A']]}
];
COLL.forEach(c=>c.box=[['Sticks','40 \u2014 ten of each'],['Fragrances','4 in one tube'],['Holder','Wooden ash catcher'],['Tube','Metal, with a lid']]);
const SETS=[
  {id:'spice',name:'The Spice Rack',img:'r_spice',mrp:500,price:350,kind:'SET',
   alt:'The Spice Rack gift set: three corked glass vials of incense in a wooden rack, with a hand-painted soapstone holder',
   spec:'3 corked glass vials \u00b7 45 sticks \u00b7 wooden rack and soapstone holder',
   desc:'Three warm kitchen-cupboard scents, corked into glass vials that stand in their own wooden rack, with a hand-painted soapstone holder to burn them in.',
   best:'Winter evenings, and anyone who bakes.',
   box:[['Sticks','45, across three vials'],['Vials','Glass, cork-stoppered'],['Stand','Wooden rack'],['Holder','Hand-painted soapstone'],['Box','Windowed gift box']],
   notes:[['Vanilla','#C9A06A','Soft and sweet'],['Orange Spice','#B4532C','Bright peel, warmed with spice'],['Cinnamon Spice','#8E3A31','Warm, sweet bark']]},
  {id:'coffee',name:'The Coffee Rack',img:'r_coffee',mrp:500,price:350,kind:'SET',
   alt:'The Coffee Rack gift set: three corked glass vials of incense in a wooden rack, with a hand-painted ceramic burner',
   spec:'3 corked glass vials \u00b7 45 sticks \u00b7 wooden rack and ceramic burner',
   desc:'Three coffee-house blends in corked glass vials, with a hand-painted ceramic burner.',
   best:'Coffee people, and slow Sunday mornings.',
   box:[['Sticks','45, across three vials'],['Vials','Glass, cork-stoppered'],['Stand','Wooden rack'],['Burner','Hand-painted ceramic']],
   notes:[['Coffee Beans','#B89468','Freshly ground, dark roast'],['Cappuccino','#6E4234','Milky and rounded'],['Espresso','#5A2528','Deep and bittersweet']]},
  {id:'taj',name:'The Taj Mahal',img:'g_taj',mrp:450,price:315,kind:'SET',
   alt:'The Taj Mahal gift box: five fragrances of incense laid in a row beside a carved soapstone holder',
   spec:'5 fragrances \u00b7 50 sticks \u00b7 carved soapstone holder',
   desc:'Five fragrances named for the world of the Taj \u2014 its river, its gardens, its Mughal past \u2014 boxed with a carved soapstone holder.',
   best:'A house-warming, or a gift to carry abroad.',
   box:[['Sticks','50'],['Fragrances','5, ten sticks of each'],['Holder','Carved soapstone'],['Box','Printed gift box']],
   notes:[['Tamga','#8A6B4A'],['Yamuna','#2F5F57'],['Guldasta','#9B2F4E'],['Samarkand','#6E4232'],['Chahar Bagh','#3C5A34']]},
  {id:'ghats',name:'Ghats of Varanasi',img:'g_ghats',mrp:450,price:315,kind:'SET',
   alt:'The Ghats of Varanasi gift box: five fragrances of incense laid in a row beside a carved soapstone holder',
   spec:'5 fragrances \u00b7 50 sticks \u00b7 carved soapstone holder',
   desc:'Five fragrances named for India\u2019s old pilgrim cities, boxed with a carved soapstone holder.',
   best:'Festive gifting, and anyone who misses Banaras.',
   box:[['Sticks','50'],['Fragrances','5, ten sticks of each'],['Holder','Carved soapstone'],['Box','Printed gift box']],
   notes:[['Kasi','#8A5C3A'],['Gaya','#7A3A3E'],['Kanchi','#5E3A63'],['Avantika','#8C3F4A'],['Dvaravati','#2F4A33']]}
];
const PACK_BOX=[['Sticks','100'],['Fragrance','Just the one'],['Pack','Clear sealed sleeve']];
const PACKS=[
  {id:'jasmine',name:'Jasmine',img:'p_jasmine',mrp:300,price:210,kind:'100s',s:'#D3A23F',
   alt:'A sealed pack of one hundred golden jasmine incense sticks',
   spec:'100 sticks \u00b7 one fragrance',desc:'Full, sweet and floral. The one that fills a whole floor.',best:'Living rooms and prayer corners.'},
  {id:'rose',name:'Rose',img:'p_rose',mrp:300,price:210,kind:'100s',s:'#C0395F',
   alt:'A sealed pack of one hundred pink rose incense sticks',
   spec:'100 sticks \u00b7 one fragrance',desc:'Soft, velvety rose, like petals warmed in the sun.',best:'Bedrooms and puja corners.'},
  {id:'lavender',name:'Lavender',img:'p_lavender',mrp:300,price:210,kind:'100s',s:'#6B2F5C',
   alt:'A sealed pack of one hundred deep purple lavender incense sticks',
   spec:'100 sticks \u00b7 one fragrance',desc:'Clean, herbal and calming. The one for winding down.',best:'Bedrooms and reading nooks, before sleep.'},
  {id:'musk',name:'Musk',img:'p_musk',mrp:300,price:210,kind:'100s',s:'#C8662A',
   alt:'A sealed pack of one hundred orange musk incense sticks',
   spec:'100 sticks \u00b7 one fragrance',desc:'Warm, deep and a little sweet. Lingers long after the stick is out.',best:'Living rooms and evenings in.'},
  {id:'lemongrass',name:'Lemongrass',img:'p_lemongrass',mrp:300,price:210,kind:'100s',s:'#8C9C4A',
   alt:'A sealed pack of one hundred deep green lemongrass incense sticks',
   spec:'100 sticks \u00b7 one fragrance',desc:'Sharp and citric. Cuts through cooking smells.',best:'Kitchens and dining rooms.'},
  {id:'citronella',name:'Citronella',img:'p_citronella',mrp:300,price:210,kind:'100s',s:'#B08A33',
   alt:'A sealed pack of one hundred amber citronella incense sticks',
   spec:'100 sticks \u00b7 one fragrance',desc:'Bright and lemony, for lighting outdoors as the light goes.',best:'Verandahs and balconies at dusk.'}
];
PACKS.forEach(p=>p.box=PACK_BOX);
const CATALOG=[...COLL,...SETS,...PACKS];
const FRAG_N=new Set([...COLL,...SETS].flatMap(c=>c.notes.map(n=>n[0].toLowerCase())).concat(PACKS.map(p=>p.name.toLowerCase()))).size;
const WHY=[
  ['{N}','fragrances, from sandalwood and myrrh to sea shore and espresso.'],
  ['Every room','Citronella on the verandah, lemongrass in the kitchen, sandalwood to unwind.'],
  ['Every hour','Four moods in each tube, for dawn, dusk and everything between.'],
  ['On display','Metal tubes, glass vials and printed boxes, made to be left out.'],
  ['Swiss oils','Fragrance oils imported from Switzerland go into every blend.'],
  ['Ready to give','Sets arrive boxed and finished: a present, not a refill.']
];
const IMGW={"g_ghats": [820, 621], "g_taj": [820, 623], "p_citronella": [820, 578], "p_jasmine": [820, 572], "p_lemongrass": [820, 505], "r_coffee": [427, 1021], "r_spice": [411, 989], "t_exotica": [178, 964], "t_rejuvenation": [187, 1029], "t_nature": [187, 1010], "t_tranquility": [186, 1007], "p_musk": [660, 403], "p_rose": [660, 417], "p_lavender": [660, 466]};
const fmt=n=>'₹'+n.toLocaleString('en-IN',{maximumFractionDigits:2});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ============ sound ============ */
const Sound={
  on:true,ctx:null,hiss:null,
  ensure(){
    if(!this.ctx){
      const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null;
      const c=this.ctx=new AC();
      this.out=c.createGain(); this.out.gain.value=.85; this.out.connect(c.destination);
      const len=c.sampleRate*3.4, ir=c.createBuffer(2,len,c.sampleRate);
      for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.4);}
      const rev=c.createConvolver(); rev.buffer=ir;
      const wet=c.createGain(); wet.gain.value=.42; const dry=c.createGain(); dry.gain.value=.8;
      this.bus=c.createGain(); this.bus.connect(dry).connect(this.out); this.bus.connect(rev).connect(wet).connect(this.out);
    }
    if(this.ctx.state==='suspended') this.ctx.resume();
    return this.ctx;
  },
  noise(){ if(this._nb) return this._nb; const c=this.ctx,b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1; return this._nb=b; },
  bowl(f=174.6,vol=.3,dur=9){
    if(!this.on) return; const c=this.ensure(); if(!c) return;
    const t=c.currentTime+.02, ratios=[1,2.76,5.4,8.93], amps=[1,.55,.28,.14];
    ratios.forEach((r,i)=>{ for(const det of [-.55,.55]){
      const o=c.createOscillator(), gg=c.createGain(); o.type='sine'; o.frequency.value=f*r+det*(i+1);
      gg.gain.setValueAtTime(0,t); gg.gain.linearRampToValueAtTime(vol*amps[i]*.5,t+.006);
      gg.gain.exponentialRampToValueAtTime(.0001,t+dur/(1+i*.8));
      o.connect(gg).connect(this.bus); o.start(t); o.stop(t+dur+.2);
    }});
    const n=c.createBufferSource(); n.buffer=this.noise(); const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=2600; bp.Q.value=1.1;
    const ng=c.createGain(); ng.gain.setValueAtTime(vol*.3,t); ng.gain.exponentialRampToValueAtTime(.0001,t+.07);
    n.connect(bp).connect(ng).connect(this.bus); n.start(t); n.stop(t+.12);
  },
  hissStart(){ if(!this.on||this.hiss) return; const c=this.ensure(); if(!c) return;
    const s=c.createBufferSource(); s.buffer=this.noise(); s.loop=true;
    const hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=1900;
    const gg=c.createGain(); gg.gain.value=0; s.connect(hp).connect(gg).connect(this.out); s.start(); this.hiss={s,gg}; },
  hissLevel(v){ if(this.hiss) this.hiss.gg.gain.setTargetAtTime(v*.045,this.ctx.currentTime,.05); },
  hissStop(){ if(!this.hiss) return; const {s,gg}=this.hiss; gg.gain.setTargetAtTime(0,this.ctx.currentTime,.08); s.stop(this.ctx.currentTime+.6); this.hiss=null; }
};
/* Phones only allow audio after a real tap (touchend/click), and iOS silences Web Audio when the ringer
   switch is off unless the page is playing media. So on the first tap we: route audio as "playback",
   start a silent looping <audio> element, resume the AudioContext and play a silent buffer.
   Any sound that was due before audio was unlocked (e.g. the bowl when the stick lights) plays then. */
Sound.unlocked=false; Sound.pending=null;
Sound.unlock=function(){
  if(this.unlocked&&this.ctx&&this.ctx.state==='running') return;
  try{ if(navigator.audioSession) navigator.audioSession.type='playback'; }catch(_){}
  try{
    if(!this.keep){
      const a=this.keep=document.createElement('audio');
      a.setAttribute('playsinline',''); a.loop=true; a.volume=0.01;
      a.src='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    }
    const p=this.keep.play(); if(p&&p.catch) p.catch(()=>{});
  }catch(_){}
  const c=this.ensure(); if(!c) return;
  try{ const b=c.createBuffer(1,1,22050), s=c.createBufferSource(); s.buffer=b; s.connect(c.destination); s.start(0); }catch(_){}
  const done=()=>{ this.unlocked=c.state==='running'; if(this.unlocked&&this.pending&&performance.now()-this.pending.t<4000){ const f=this.pending.f; this.pending=null; f(); } };
  if(c.state==='running') done(); else c.resume().then(done,()=>{});
};
Sound.whenReady=function(f){ if(!this.on) return; if(this.ctx&&this.ctx.state==='running'){ f(); return; } this.pending={f,t:performance.now()}; };
['touchend','click','keydown','pointerup'].forEach(t=>addEventListener(t,()=>Sound.unlock(),{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&Sound.ctx&&Sound.ctx.state!=='running'&&Sound.unlocked) Sound.ctx.resume().catch(()=>{}); });

$$('[data-sound]').forEach(b=>b.addEventListener('click',e=>{
  e.stopPropagation();
  Sound.unlock();
  Sound.on=!Sound.on; if(!Sound.on) Sound.hissStop();
  $$('[data-sound]').forEach(x=>{ const tt=x.querySelector('.snd-t'); (tt||x).textContent=Sound.on?'Sound on':'Sound off'; x.setAttribute('aria-pressed',Sound.on); });
}));

/* ============ smoke engine ============ */
class Smoke{
  constructor(cv,o={}){
    this.cv=cv; this.g=cv.getContext('2d');
    this.o=Object.assign({ex:.5,ey:.62,rate:(RM||MIN)?(MIN?0:24):(LITE?36:70),life:7.5,rise:58,turb:46,hist:22,every:2,alpha:LITE?.26:.24,stick:true,max:LITE?320:700},o);
    this.ps=[]; this.pool=[]; this.puffs=[]; this.bk=Array.from({length:15},()=>[]);
    this.heat=0; this.fire=0; this.flash=0; this.t=Math.random()*50; this.acc=0; this.frame=0; this.visible=true;
    this.m={x:-1e4,y:-1e4,vx:0,vy:0,px:null,py:null};
    const sp=document.createElement('canvas'); sp.width=sp.height=128; const sg=sp.getContext('2d');
    const gr=sg.createRadialGradient(64,64,0,64,64,64); gr.addColorStop(0,'rgba(210,215,222,.55)'); gr.addColorStop(.5,'rgba(190,196,205,.16)'); gr.addColorStop(1,'rgba(180,186,194,0)');
    sg.fillStyle=gr; sg.fillRect(0,0,128,128); this.sprite=sp;
    this.resize();
  }
  resize(){ const r=this.cv.getBoundingClientRect(); this.dpr=Math.min(devicePixelRatio||1,document.documentElement.classList.contains('lite')?1:1.25); this.w=r.width; this.h=r.height; this.px=r.left; this.py=r.top+scrollY;
    this.cv.width=Math.round(r.width*this.dpr); this.cv.height=Math.round(r.height*this.dpr); this.g.setTransform(this.dpr,0,0,this.dpr,0,0); }
  leave(){ const m=this.m; m.x=m.y=-1e4; m.px=m.py=null; m.vx=m.vy=0; }
  pointer(x,y){ const m=this.m; if(m.px!==null){ m.vx=lerp(m.vx,clamp((x-m.px)*60,-900,900),.4); m.vy=lerp(m.vy,clamp((y-m.py)*60,-900,900),.4);} m.px=m.x=x; m.py=m.y=y; }
  spawn(){
    const H=this.o.hist, p=this.pool.pop()||{hx:new Float32Array(H),hy:new Float32Array(H)};
    p.x=this.w*this.o.ex+(Math.random()-.5)*2.2; p.y=this.h*this.o.ey-3; p.age=0; p.life=this.o.life*(.55+Math.random()*.75); p.n=0;
    p.hx.fill(p.x); p.hy.fill(p.y); this.ps.push(p);
  }
  update(dt){
    const o=this.o; this.t+=dt; this.frame++;
    if(this.fire>0){ this.acc+=o.rate*this.fire*dt; while(this.acc>=1){ if(this.ps.length<o.max) this.spawn(); this.acc-=1; } }
    const ex=this.w*o.ex, ey=this.h*o.ey, t=this.t, m=this.m, H=o.hist, rec=this.frame%o.every===0;
    m.vx*=.9; m.vy*=.9; const sp=Math.min(1,Math.hypot(m.vx,m.vy)/380);
    this.boost=lerp(this.boost||0,clamp(1-Math.hypot(m.x-ex,m.y-ey)/240),1-Math.exp(-dt*4));
    const S=.0034, E=.02, ts=t*.085, R=150, R2=R*R;
    const live=[];
    for(const p of this.ps){
      p.age+=dt;
      if(p.age>p.life||p.y<-80||p.x<-120||p.x>this.w+120){ this.pool.push(p); continue; }
      const hg=clamp((ey-p.y)/Math.max(ey,1),0,1.6), turb=smooth(.03,.42,hg);
      const X=p.x*S, Y=p.y*S;
      const cx=(noise3(X,Y+E,ts)-noise3(X,Y-E,ts))/(2*E);
      const cy=-(noise3(X+E,Y,ts)-noise3(X-E,Y,ts))/(2*E);
      const sway=noise3(t*.2,hg*2.1,3.7)*34*smooth(0,.35,hg);
      let vx=cx*o.turb*turb*.9+sway;
      let vy=-o.rise*(1-.45*turb)+cy*o.turb*turb*.5;
      const dx=p.x-m.x, dy=p.y-m.y, d2=dx*dx+dy*dy;
      if(d2<R2){ const d=Math.sqrt(d2)||1, f=1-d/R; vx+=m.vx*f*.6+(-dy/d)*f*52*sp; vy+=m.vy*f*.6+(dx/d)*f*52*sp; }
      p.x+=vx*dt; p.y+=vy*dt;
      if(rec){ p.hx.copyWithin(0,1); p.hy.copyWithin(0,1); if(p.n<H-1)p.n++; }
      p.hx[H-1]=p.x; p.hy[H-1]=p.y;
      live.push(p);
    }
    this.ps=live;
    if(this.fire>.3&&live.length&&Math.random()<dt*3.4){
      const s=live[(Math.random()*live.length)|0];
      if((ey-s.y)/ey>.25) this.puffs.push({x:s.x,y:s.y,r:18+Math.random()*30,age:0,life:4+Math.random()*3,vx:(Math.random()-.5)*10});
    }
    this.puffs=this.puffs.filter(f=>{ f.age+=dt; f.r+=dt*15; f.y-=dt*16; f.x+=f.vx*dt; return f.age<f.life; });
    this.flash*=Math.exp(-dt*2.2);
  }
  draw(){
    const g=this.g, o=this.o, w=this.w, h=this.h, ex=w*o.ex, ey=h*o.ey, H=o.hist;
    g.clearRect(0,0,w,h);
    const heat=Math.max(this.heat,this.fire);
    if(o.stick){
      g.globalCompositeOperation='source-over'; g.lineCap='butt';
      const len=h-ey, split=ey+len*.64;
      g.lineWidth=2.4; g.strokeStyle='#3a2419'; g.beginPath(); g.moveTo(ex,ey); g.lineTo(ex,split); g.stroke();
      g.strokeStyle='rgba(168,136,96,.85)'; g.lineWidth=1.6; g.beginPath(); g.moveTo(ex,split); g.lineTo(ex,h+4); g.stroke();
      const rim=g.createLinearGradient(0,ey,0,ey+110); rim.addColorStop(0,`rgba(255,130,70,${.6*heat+.08})`); rim.addColorStop(1,'rgba(255,130,70,0)');
      g.strokeStyle=rim; g.lineWidth=2.4; g.beginPath(); g.moveTo(ex,ey); g.lineTo(ex,ey+110); g.stroke();
    }
    g.globalCompositeOperation='lighter'; g.lineWidth=1; g.lineCap='round'; g.lineJoin='round';
    const NB=5, B=this.bk; for(const b of B) b.length=0;
    for(const p of this.ps){
      if(p.n<1) continue;
      const a=smooth(0,.4,p.age)*(1-smooth(p.life*.3,p.life,p.age)); if(a<.03) continue;
      const hg=(ey-p.y)/ey, band=hg<.16?0:hg<.44?1:2;
      B[band*NB+Math.min(NB-1,(a*NB)|0)].push(p);
    }
    const cols=['176,190,212','198,205,216','216,217,221'], ba=[.52,.66,.48];
    for(let b=0;b<3;b++) for(let l=0;l<NB;l++){
      const arr=B[b*NB+l]; if(!arr.length) continue;
      g.strokeStyle=`rgba(${cols[b]},${(o.alpha*ba[b]*(l+1)/NB).toFixed(3)})`;
      g.beginPath();
      for(const p of arr){ const st=H-1-p.n; g.moveTo(p.hx[st],p.hy[st]); for(let i=st+1;i<H;i++) g.lineTo(p.hx[i],p.hy[i]); }
      g.stroke();
    }
    for(const f of this.puffs){ g.globalAlpha=.07*Math.sin(Math.PI*f.age/f.life); g.drawImage(this.sprite,f.x-f.r,f.y-f.r,f.r*2,f.r*2); }
    g.globalAlpha=1;
    if(heat>.002||this.flash>.01){
      const fl=.86+.14*noise3(this.t*3.2,0,9), R=((8+30*heat)*fl)+this.flash*140+(this.boost||0)*16*Math.min(heat,1);
      const eg=g.createRadialGradient(ex,ey,0,ex,ey,R);
      const a=Math.min(1,heat+this.flash);
      eg.addColorStop(0,`rgba(255,240,210,${.95*a})`); eg.addColorStop(.1,`rgba(255,160,80,${.9*a})`);
      eg.addColorStop(.38,`rgba(255,96,36,${.32*a})`); eg.addColorStop(1,'rgba(255,60,20,0)');
      g.fillStyle=eg; g.beginPath(); g.arc(ex,ey,R,0,Math.PI*2); g.fill();
    }
    g.globalCompositeOperation='source-over';
    g.fillStyle='#4a2e22'; g.beginPath(); g.arc(ex,ey,1.4,0,Math.PI*2); g.fill();
  }
}

/* ============ hero + lighting ============ */
const hero=$('.hero'), gate=$('#gate'), prog=$('.g-prog');
const smoke=new Smoke($('#smoke'),{ey:innerWidth<860?.6:.63});
hero.style.setProperty('--ey',(smoke.o.ey*100)+'%');
const smoke2=new Smoke($('#smoke2'),{ey:.9,rate:MIN?0:RM?16:(LITE?22:48),alpha:.2,life:9,rise:52,max:LITE?220:480});
smoke2.fire=1; smoke2.heat=1;

let lit=false, holding=false, hold=0, fireT=0;
function startHold(){ if(lit) return; holding=true; Sound.hissStart(); }
function endHold(){ holding=false; }
hero.addEventListener('pointerdown',e=>{ if(lit||e.button>0||e.target.closest('.gate-sound,.gate-skip')) return; e.preventDefault(); startHold(); });
hero.addEventListener('contextmenu',e=>{ if(!lit) e.preventDefault(); });
addEventListener('pointerup',endHold); addEventListener('pointercancel',endHold); addEventListener('blur',endHold);
gate.addEventListener('keydown',e=>{ if((e.key===' '||e.key==='Enter')){ e.preventDefault(); if(!e.repeat) startHold(); } });
gate.addEventListener('keyup',e=>{ if(e.key===' '||e.key==='Enter') endHold(); });
function light(withSound){
  if(lit) return; lit=true; holding=false; hold=1; fireT=0;
  body.classList.add('is-lit'); smoke.flash=1;
  Sound.hissStop(); if(withSound) Sound.whenReady(()=>Sound.bowl(174.6,.32,10));
  gate.tabIndex=-1; gate.setAttribute('aria-hidden','true'); $('.gate-sound').tabIndex=-1;
}
addEventListener('scroll',()=>{ if(!lit&&scrollY>40) light(Sound.on&&Sound.unlocked); },{passive:true});
if(scrollY>40) light(false);

/* ============ cursor ============ */
const cur=$('.cursor'), curLabel=$('.cursor__label');
let mx=innerWidth/2, my=innerHeight/2, cxp=mx+1, cyp=my, moved=true;
if(FINE) body.classList.add('has-cursor');
else { const gh=$('#gateHelp'); if(gh) gh.textContent='Touch and hold to light'; }
addEventListener('pointermove',e=>{
  mx=e.clientX; my=e.clientY;
  moved=true;
  if(smoke.visible) smoke.pointer(mx-smoke.px,my-(smoke.py-scrollY));
  if(smoke2.visible) smoke2.pointer(mx-smoke2.px,my-(smoke2.py-scrollY));
},{passive:true});
addEventListener('pointerup',e=>{ if(e.pointerType!=='mouse'){ smoke.leave(); smoke2.leave(); } });
document.addEventListener('pointerleave',()=>{ smoke.leave(); smoke2.leave(); });
function cursorState(){
  const el=document.elementFromPoint(mx,my); if(!el) return;
  let st='', label='';
  if(!lit&&el.closest('.hero')&&!el.closest('.gate-sound,.gate-skip')){ st='hold'; label='Hold'; }
  else if(el.closest('[data-cursor="drag"]')){ st='drag'; label='Drag'; }
  else if(el.closest('[data-cursor="scrub"]')){ st='drag'; label='Scrub'; }
  else if(el.closest('a,button,[role="tab"],.v')){ st='link'; }
  cur.dataset.state=st; if(curLabel.textContent!==label) curLabel.textContent=label;
}

/* ============ listen glyph ============ */
const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} }),{threshold:.35});
io.observe($('.listen'));

/* ============ ritual ============ */
const rit=$('.ritual'), track=$('.ritual__track'), panels=$$('.rp:not(.rp--intro)'), ritLine=$('.ritual__line');
let ritMax=0, ritScroll=0, deskRit=true, ritTop=0, ritH=0;
const ticks=panels.map((el,i)=>{ const t=document.createElement('span'); t.className='ritual__tick'; t.textContent='0'+(i+1); ritLine.appendChild(t); return t; });
function layoutRit(){
  deskRit=innerWidth>860;
  if(deskRit){
    ritMax=Math.max(0,track.scrollWidth-innerWidth); ritScroll=Math.max(1,ritMax*.52); rit.style.height=(ritScroll+innerHeight)+'px';
    panels.forEach((el,i)=>{ const c=el.offsetLeft+el.offsetWidth/2-innerWidth/2; ticks[i]._p=clamp(c/Math.max(ritMax,1)); ticks[i].style.left=(ticks[i]._p*100).toFixed(2)+'%'; });
    const prevT=track.style.transform; track.style.transform='translate3d(0,0,0)';
    panels.forEach(el=>{ const b=el.getBoundingClientRect(); el._c0=b.left+b.width/2; el._v=-1; });
    track.style.transform=prevT;
  }
  else { rit.style.height=''; panels.forEach(el=>{ el.style.removeProperty('--v'); el._v=0; }); }
}
function updRit(sy){
  const top=ritTop-sy; if(top+ritH<-50||top>innerHeight+50) return;
  if(deskRit){
    const p=clamp(-top/ritScroll), x=p*ritMax;
    track.style.transform=`translate3d(${(-x).toFixed(1)}px,0,0)`;
    ritLine.style.setProperty('--p',p.toFixed(4));
    ticks.forEach(t=>t.classList.toggle('on',p>=t._p-.025));
    for(const el of panels){ const c=(el._c0-x)/innerWidth, v=+smooth(0,.72,1-Math.abs(c-.5)/.62).toFixed(3); if(v!==el._v){ el._v=v; el.style.setProperty('--v',v); } }
  }
}

/* ============ prices ============ */
const off=p=>p.mrp?Math.round((1-p.price/p.mrp)*100):0;
const priceHTML=p=>`<span class="pr" data-pid="${p.id}"><b>${fmt(p.price)}</b>${p.mrp?`<s><span class="sr">was </span>${fmt(p.mrp)}</s><em>${off(p)}% off</em>`:''}</span>`;
$$('[data-frag-n]').forEach(el=>el.textContent=FRAG_N);

/* ============ tins ============ */
const coll=$('#collection');
coll.style.setProperty('--label',COLL[0].label);
$('#tinrow').innerHTML=COLL.map((c,i)=>{ const d=IMGW[c.img]; return `<li class="tinsku" style="--label:${c.label};--on:${c.on}">
  <button class="tinsku__open" type="button" data-details="${c.id}" aria-haspopup="dialog">
    <span class="tinsku__img"><span class="card__off" data-off="${c.id}" aria-hidden="true"${c.mrp?'':' hidden'}>${off(c)}% off</span><img src="${IMG[c.img]}" alt="${c.alt}" width="${d[0]}" height="${d[1]}" loading="lazy" decoding="async"></span>
    <span class="tinsku__meta"><span class="tinsku__idx">0${i+1}</span><span class="tinsku__name">${c.name}</span><span class="tinsku__sub">${c.sub}</span></span>
  </button>
  <div class="tinsku__foot">${priceHTML(c)}<div class="tinsku__act">
    <button class="btn btn--sm" type="button" data-add="${c.id}"><span>Pre-order</span></button>
    <button class="linkbtn" type="button" data-details="${c.id}" aria-haspopup="dialog">Details<span class="sr"> about ${c.name}</span></button>
  </div></div>
</li>`; }).join('');

/* ============ gift sets + everyday packs ============ */
function noteList(notes){ return `<ul class="card__notes">${notes.map(([n,col])=>`<li style="--s:${col}">${n}</li>`).join('')}</ul>`; }
function cardHTML(p,body){
  const d=IMGW[p.img]||[600,400];
  return `<article class="card${p.photo?' card--photo':''}">
    <button class="card__shot" type="button" data-details="${p.id}" aria-haspopup="dialog" aria-label="Details about ${p.name}">
      <span class="card__off" data-off="${p.id}" aria-hidden="true"${p.mrp?'':' hidden'}>${off(p)}% off</span>
      <img src="${IMG[p.img]}" alt="${p.alt}" width="${d[0]}" height="${d[1]}" loading="lazy" decoding="async">
    </button>
    <div class="card__body"><h3>${p.name}</h3><p class="card__spec">${p.spec}</p>${body}</div>
    <div class="card__buy">${priceHTML(p)}<div class="card__act">
      <button class="btn btn--sm" type="button" data-add="${p.id}"><span>Pre-order</span></button>
      <button class="linkbtn" type="button" data-details="${p.id}" aria-haspopup="dialog">Details<span class="sr"> about ${p.name}</span></button>
    </div></div>
  </article>`;
}
$('#giftCards').innerHTML=SETS.map(p=>cardHTML(p,noteList(p.notes))).join('');
$('#packCards').innerHTML=PACKS.map(p=>cardHTML(p,`<p class="card__spec">${p.desc}</p>`)).join('');

/* ============ details sheet ============ */
const sheet=$('#sheet'), sheetPanel=$('#sheetPanel'), sheetScroll=$('#sheetScroll'), sheetBar=$('#sheetBar');
sheet.inert=true;
let sheetId=null, sheetOpener=null;
const KIND={TIN:'Tube','SET':'Gift set','100s':'Hundred-pack'};
function sheetHTML(p){
  const media=p.kind==='TIN'
    ? `<figure class="sh-media sh-media--pair" style="--mt:${p.tint}"><img src="${IMG[p.img]}" alt="${p.alt}"><img src="${IMG['f_'+p.id]}" alt="Everything inside the ${p.name} tube: four sleeves of sticks and a wooden holder"></figure>`
    : `<figure class="sh-media"><img src="${IMG[p.img]}" alt="${p.alt}"></figure>`;
  const notes=p.notes?`<section class="sh-block"><h3>${p.notes.length} fragrances</h3><ul class="sh-notes">${p.notes.map(([n,col,d])=>`<li style="--s:${col}"><i class="stick" aria-hidden="true"></i><div><b>${n}</b>${d?`<span>${d}</span>`:''}</div></li>`).join('')}</ul></section>`:'';
  return `${media}<div class="sh-body">
    <p class="sh-kind">${KIND[p.kind]}${p.sub?' \u00b7 '+p.sub:''}</p>
    <h2 id="sheetTitle">${p.name}</h2>
    <p class="sh-lede">${p.desc}</p>
    ${notes}
    <section class="sh-block"><h3>In the box</h3><dl class="sh-facts">${p.box.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></section>
    <section class="sh-block"><h3>Best for</h3><p class="sh-best">${p.best}</p></section>
    ${legalHTML(p)}
  </div>`;
}
/* declarations required for packaged goods sold online (Legal Metrology (Packaged Commodities) Rules, rule 6(10)) */
const STICKS={TIN:40,'100s':100,spice:45,coffee:45,taj:50,ghats:50};
function legalHTML(p){
  const n=STICKS[p.id]||STICKS[p.kind]||0, name=p.kind==='SET'?'Incense sticks (agarbatti), gift set':'Incense sticks (agarbatti)';
  const rows=[
    ['Common name',name],
    ['Net quantity',n?`${n} sticks`:'—'],
    ['MRP',`${fmt(p.mrp||p.price)} (inclusive of all taxes)`],
    ['You pay',fmt(p.price)],
    ['Country of origin',SELLER.origin],
    ['Marketed by',`${esc(SELLER.legalName)}, ${esc(SELLER.address)}`]
  ];
  if(SELLER.manufacturer) rows.push(['Manufactured / packed by',esc(SELLER.manufacturer)]);
  rows.push(['Customer care',`${esc(SELLER.email)} · ${esc(SELLER.phone)}`],['Dispatch','Pre-order']);
  return `<section class="sh-block"><h3>Product information</h3><dl class="sh-legal">${rows.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></section>`;
}
function openSheet(id,opener){
  const p=CATALOG.find(x=>x.id===id); if(!p) return;
  sheetId=id; sheetOpener=opener||document.activeElement;
  sheetScroll.innerHTML=sheetHTML(p); sheetScroll.scrollTop=0;
  sheetBar.hidden=false; sheetBar.innerHTML=`${priceHTML(p)}<button class="btn" type="button" data-add="${p.id}"><span>Pre-order</span></button>`;
  $$('[data-add]',sheetBar).forEach(setAddState);
  sheetPanel.style.setProperty('--label',p.label||'#1B1714'); sheetPanel.style.setProperty('--on',p.on||'#fff');
  sheet.inert=false; sheet.setAttribute('aria-hidden','false');
  behind.forEach(x=>x.inert=true);
  body.classList.add('sheet-open');
  if(!RM&&Element.prototype.animate) rise(sheetScroll.querySelectorAll('.sh-media,.sh-body > *'),22,620,50,160);
  Sound.bowl(523.3,.04,3);
  setTimeout(()=>$('.sheet__x',sheet).focus({preventScroll:true}),90);
}
function closeSheet(){
  if(!sheetId) return;
  sheetId=null;
  body.classList.remove('sheet-open');
  sheetPanel.style.transform=''; sheetPanel.style.transition='';
  sheet.inert=true; sheet.setAttribute('aria-hidden','true');
  if(!body.classList.contains('bag-open')) behind.forEach(x=>x.inert=false);
  if(sheetOpener&&sheetOpener.focus) sheetOpener.focus({preventScroll:true});
}
/* generic panel in the same slide-over: used for policies and the account */
function openPanel(key,html,bar,opener){
  sheetId=key; sheetOpener=opener||document.activeElement;
  sheetScroll.innerHTML=html; sheetScroll.scrollTop=0;
  sheetBar.innerHTML=bar||''; sheetBar.hidden=!bar;
  sheetPanel.style.setProperty('--label','#1B1714'); sheetPanel.style.setProperty('--on','#fff');
  if(!body.classList.contains('sheet-open')){
    sheet.inert=false; sheet.setAttribute('aria-hidden','false');
    behind.forEach(x=>x.inert=true);
    body.classList.add('sheet-open');
    Sound.bowl(523.3,.04,3);
  }
  setTimeout(()=>$('.sheet__x',sheet).focus({preventScroll:true}),90);
}

/* ============ policies ============ */
const DOC_TITLES={shipping:'Shipping & delivery',returns:'Returns, refunds & cancellations',privacy:'Privacy policy',terms:'Terms of service',contact:'Contact & grievances'};
function sellerBlock(){
  return `<p><b>${esc(SELLER.legalName)}</b><br>${esc(SELLER.address)}<br>Email: <a href="mailto:${esc(SELLER.email)}">${esc(SELLER.email)}</a> · Phone: <a href="tel:${esc(SELLER.phone.replace(/\s/g,''))}">${esc(SELLER.phone)}</a>${SELLER.gstin?`<br>GSTIN: ${esc(SELLER.gstin)}`:''}</p>`;
}
function grievanceBlock(){
  const g=SELLER.grievance;
  return `<p><b>Grievance Officer:</b> ${esc(g.name)}${g.designation?`, ${esc(g.designation)}`:''}<br>Email: <a href="mailto:${esc(g.email)}">${esc(g.email)}</a> · Phone: ${esc(g.phone)}<br>We acknowledge every complaint within 48 hours and resolve it within one month of receiving it.</p>`;
}
const DOCS={
  shipping:()=>`
    <h3>Pre-orders</h3>
    <p>Everything on CENKO is currently sold as a pre-order. Once dispatched, orders usually arrive ${SELLER.delivery}, depending on your pincode. We send tracking details by email and SMS as soon as your parcel is picked up.</p>
    <h3>Where we deliver</h3>
    <p>We currently deliver within India only.</p>
    <h3>Shipping charges</h3>
    <p>Shipping is ₹69 per order, and free on orders of ₹1,000 or more. The exact charge is always shown at checkout before you pay. There are no other fees.</p>
    <h3>Couriers</h3>
    <p>Orders are shipped through our logistics partner, Delhivery.</p>
    <h3>Damaged in transit</h3>
    <p>If your parcel arrives damaged or tampered with, please photograph it and write to us within 48 hours of delivery. We will replace the item or refund it in full, at no cost to you. See our returns policy for details.</p>`,
  returns:()=>`
    <h3>Cancelling a pre-order</h3>
    <p>You can cancel any order at any time before it is dispatched, for a full refund. Email or call us with your order number. Refunds go back to your original payment method within 5–7 working days of cancellation.</p>
    <h3>Returns within 7 days</h3>
    <p>You can return any item within <b>7 days of delivery</b> if it is unopened and unused, with its seals and original packaging intact. Write to us with your order number before sending it back; we will share the return address. For these returns you arrange and pay for the return shipping. We refund the item price (and the original shipping charge if you return the whole order) within 7 days of receiving it.</p>
    <p>Incense that has been opened or lit cannot be returned for reasons of hygiene and fragrance, unless it is damaged, defective or not what you ordered.</p>
    <h3>Damaged, defective or wrong items</h3>
    <p>If anything arrives damaged, defective, incomplete or different from what you ordered, tell us within 48 hours of delivery with photos (an unboxing video helps). We will arrange a free pickup where needed and send a replacement or give you a full refund, as you prefer. This does not affect any of your rights under the Consumer Protection Act, 2019.</p>
    <h3>Refunds</h3>
    <p>Approved refunds are made to the original payment method. Once we process a refund, banks and UPI apps usually take 5–7 working days to show it.</p>
    <h3>Questions or complaints</h3>
    ${grievanceBlock()}`,
  privacy:()=>`
    <p>This policy explains how ${esc(SELLER.brand)} handles your personal data under the Digital Personal Data Protection Act, 2023 and the rules made under it.</p>
    <h3>Who we are</h3>${sellerBlock()}
    <h3>What we collect</h3>
    <ul><li>Your name, email address, phone number and delivery and billing addresses, when you place an order or create an account.</li>
    <li>Your order history and messages you send us.</li>
    <li>Your email address for our monthly letter, only if you choose to subscribe.</li>
    <li>A small amount of data stored in your own browser to keep your bag and sign-in working. We do not use advertising trackers on this website.</li></ul>
    <p>Payments are handled by Shopify and Razorpay. We never see or store your card, UPI or bank details.</p>
    <h3>Why we use it</h3>
    <ul><li>To take, deliver and support your orders, including pre-order updates, returns and refunds.</li>
    <li>To run your account, show your past orders and apply member pricing.</li>
    <li>To keep the records that tax and consumer laws require.</li>
    <li>To send our letter and offers, only with your consent. You can withdraw consent at any time using the link in every email or by writing to us.</li></ul>
    <h3>Who we share it with</h3>
    <p>We share only what each service needs: Shopify (store, checkout and customer accounts), Razorpay (payments), Delhivery (delivery), Vercel (website hosting), and government authorities when the law requires it. Some of these providers may process data outside India, with appropriate safeguards. We do not sell your data.</p>
    <h3>How long we keep it</h3>
    <p>We keep order and invoice records for as long as tax law requires. We keep account data until you ask us to delete your account, and marketing data until you unsubscribe.</p>
    <h3>Your rights</h3>
    <p>You can ask us for a summary of your data, and ask us to correct, complete, update or erase it. You can also withdraw consent or nominate someone to act for you. Write to the Grievance Officer below. We will respond within 30 days. If you are not satisfied, you can complain to the Data Protection Board of India.</p>
    ${grievanceBlock()}
    <h3>Children</h3>
    <p>Our store is meant for adults. We do not knowingly collect data from anyone under 18 without verifiable consent from a parent or guardian.</p>
    <h3>Changes</h3>
    <p>If we change this policy we will update the date below and, for significant changes, tell you by email.</p>`,
  terms:()=>`
    <h3>Who you are buying from</h3>${sellerBlock()}
    <h3>Products</h3>
    <p>Our incense is made by hand, so colour, length and fragrance strength can vary slightly between batches. Product photos are as accurate as we can make them.</p>
    <h3>Prices</h3>
    <p>All prices are in Indian rupees and are the maximum retail price, inclusive of all taxes. Shipping charges are shown separately at checkout before you pay. If a price on the site is clearly wrong, we will contact you before dispatch and you may cancel for a full refund.</p>
    <h3>Pre-orders</h3>
    <p>Every order is currently a pre-order. You pay at checkout and can cancel for a full refund at any time before dispatch.</p>
    <h3>Orders</h3>
    <p>An order is accepted when we send your order confirmation. We may decline or cancel an order, for example if stock runs out or we suspect fraud. If we do, we refund you in full.</p>
    <h3>Members</h3>
    <p>Customers who create a free CENKO account and are signed in at checkout get 10% off their order. We may change or end this offer, but changes never affect orders already placed.</p>
    <h3>Burn safely</h3>
    <ul><li>Never leave burning incense unattended.</li><li>Burn it in a heat-proof holder, away from curtains, paper and anything flammable.</li><li>Keep it out of reach of children and pets.</li><li>Use it in a well-ventilated room.</li><li>It is not for eating or for use on skin.</li></ul>
    <h3>Liability</h3>
    <p>Nothing in these terms limits your rights under the Consumer Protection Act, 2019 or any other law. Apart from those rights, our liability for any order is limited to the amount you paid for it.</p>
    <h3>Law and disputes</h3>
    <p>These terms are governed by the laws of India. Please contact our Grievance Officer first; we aim to resolve every complaint within one month. You can also approach the National Consumer Helpline (1915, consumerhelpline.gov.in) or the consumer commission for your area.</p>
    ${grievanceBlock()}`,
  contact:()=>`
    <h3>Seller</h3>${sellerBlock()}
    <h3>Customer care</h3>
    <p>Write or call us about orders, pre-order dates, returns or anything else. We reply within one working day.</p>
    <h3>Grievances</h3>${grievanceBlock()}
    <p>If your complaint is not resolved, you can contact the National Consumer Helpline on 1915 or at consumerhelpline.gov.in, or file online at e-daakhil.nic.in.</p>`
};
function openDoc(key,opener){
  if(!DOCS[key]) key='contact';
  const tabs=Object.keys(DOCS).map(k=>`<button type="button" data-doc="${k}" aria-current="${k===key}">${DOC_TITLES[k]}</button>`).join('');
  openPanel('doc:'+key,`<article class="doc"><nav class="doc__tabs" aria-label="Policies">${tabs}</nav><h2 id="sheetTitle">${DOC_TITLES[key]}</h2><p class="doc__meta">Last updated ${SELLER.updated}</p>${DOCS[key]()}</article>`,'',opener);
}
function renderSellerLine(){
  const el=$('#sellerLine'); if(!el) return;
  el.innerHTML=`Sold by ${esc(SELLER.legalName)} · ${esc(SELLER.address)} · <a href="mailto:${esc(SELLER.email)}">${esc(SELLER.email)}</a> · ${esc(SELLER.phone)}${SELLER.gstin?` · GSTIN ${esc(SELLER.gstin)}`:''} · Grievance Officer: ${esc(SELLER.grievance.name)}`;
}
renderSellerLine();

document.addEventListener('click',e=>{
  const d=e.target.closest('[data-details]'); if(d){ openSheet(d.dataset.details,d); return; }
  const doc=e.target.closest('[data-doc]'); if(doc){ e.preventDefault(); closeNav(); openDoc(doc.dataset.doc, sheetId&&String(sheetId).startsWith('doc:')?sheetOpener:doc); return; }
  if(e.target.closest('[data-sheet-close]')) closeSheet();
});
/* open a policy straight from a link like cenko.in/#privacy */
function docFromHash(){ const k=location.hash.slice(1); if(DOCS[k]) openDoc(k); }
addEventListener('hashchange',docFromHash);

/* ============ mobile menu ============ */
const navMenuBtn=$('.nav__menu');
function closeNav(){ if(body.classList.contains('nav-open')){ body.classList.remove('nav-open'); navMenuBtn.setAttribute('aria-expanded','false'); } }
navMenuBtn.addEventListener('click',()=>{ const o=body.classList.toggle('nav-open'); navMenuBtn.setAttribute('aria-expanded',o); });
$$('#navLinks a[href^="#"]:not([data-doc])').forEach(a=>a.addEventListener('click',closeNav));
addEventListener('scroll',()=>{ if(body.classList.contains('nav-open')&&!body.classList.contains('sheet-open')) closeNav(); },{passive:true});
sheet.addEventListener('keydown',e=>{
  if(e.key!=='Tab') return;
  const f=[...sheet.querySelectorAll('button,a[href],[tabindex]:not([tabindex="-1"])')].filter(x=>x.getClientRects().length);
  if(!f.length) return;
  const a=f[0], z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){ e.preventDefault(); z.focus(); }
  else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus(); }
});
(()=>{ /* swipe the bottom sheet down to dismiss */
  const g=$('.sheet__grab'); let y0=null, dy=0;
  g.addEventListener('pointerdown',e=>{ y0=e.clientY; dy=0; g.setPointerCapture(e.pointerId); sheetPanel.style.transition='none'; });
  g.addEventListener('pointermove',e=>{ if(y0===null) return; dy=Math.max(0,e.clientY-y0); sheetPanel.style.transform=`translateY(${dy}px)`; });
  const end=()=>{ if(y0===null) return; y0=null; sheetPanel.style.transition=''; if(dy>90) closeSheet(); else sheetPanel.style.transform=''; };
  g.addEventListener('pointerup',end); g.addEventListener('pointercancel',end);
})();

/* dawn: generated ink-wash mountains */
const dawn=$('.dawn'), sun=$('.dawn__sun'), layers=$$('.dawn canvas');
let dawnFlat=false;
function drawRidges(){
  const w=dawn.clientWidth, h=Math.round(dawn.clientHeight*1.32), dpr=Math.min(devicePixelRatio||1,document.documentElement.classList.contains('lite')?1:1.25);
  const spec=[{base:.47,amp:.17,alpha:.15,freq:1.2,seed:11,wash:.24},{base:.58,amp:.2,alpha:.3,freq:1.8,seed:23,wash:.28},{base:.71,amp:.22,alpha:.58,freq:2.5,seed:37,wash:.32}];
  const flat=dawnFlat=document.documentElement.classList.contains('lite');
  layers.forEach((cv,k)=>{
    const s=spec[k], tgt=flat?layers[0]:cv, extra=flat&&k>0;
    if(extra){ cv.style.display='none'; cv.width=cv.height=1; } else { cv.style.display=''; cv.style.transform=''; tgt.width=w*dpr; tgt.height=h*dpr; tgt.style.height=h+'px'; }
    const g=tgt.getContext('2d'); if(!extra){ g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,w,h); }
    const N=Math.ceil(w/3), ridge=[];
    for(let i=0;i<=N;i++){
      const x=i/N; let y=0,amp=1,fr=s.freq;
      for(let q=0;q<5;q++){ y+=amp*noise3(x*fr,s.seed,q*7.1); amp*=.5; fr*=2.15; }
      const peak=Math.pow(Math.abs(noise3(x*s.freq*.55,s.seed+4,1)),1.4);
      ridge.push(h*s.base-(y*.5+peak*.9)*h*s.amp);
    }
    const top=Math.min(...ridge), bottom=Math.min(h*(s.base+s.wash),h*.94);
    g.beginPath(); g.moveTo(0,h); ridge.forEach((y,i)=>g.lineTo(i/N*w,y)); g.lineTo(w,h); g.closePath();
    const gr=g.createLinearGradient(0,top,0,bottom);
    gr.addColorStop(0,`rgba(0,0,0,${s.alpha})`); gr.addColorStop(.5,`rgba(0,0,0,${s.alpha*.42})`); gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr; g.fill();
    for(let j=0;j<3;j++){
      g.beginPath();
      ridge.forEach((y,i)=>{ const xx=i/N*w, yy=y+noise3(i*.09,j*3.3,s.seed)*2.4+j*1.3; i?g.lineTo(xx,yy):g.moveTo(xx,yy); });
      g.strokeStyle=`rgba(0,0,0,${s.alpha*(.55-j*.15)})`; g.lineWidth=1.5-j*.4; g.stroke();
    }
    for(let d=0;d<w*.6;d++){ const i=(Math.random()*N)|0; g.fillStyle=`rgba(0,0,0,${s.alpha*.14*Math.random()})`; g.fillRect(i/N*w,ridge[i]+Math.random()*h*s.wash*.45,1.1,1+Math.random()*3.5); }
  });
}
let dawnTop=0, dawnH=0;
function updDawn(sy){
  const top=dawnTop-sy; if(top+dawnH<0||top>innerHeight) return;
  const p=top/innerHeight;
  if(!dawnFlat) layers.forEach((cv,k)=>cv.style.transform=`translate3d(0,${(p*[30,80,140][k]).toFixed(1)}px,0)`);
  sun.style.transform=`translate3d(0,${(p*220).toFixed(1)}px,0)`;
}

/* ============ virtues + notes ============ */
$('#vgrid').innerHTML=WHY.map(([k,en],i)=>`<li class="v" tabindex="0"><span class="v__n">0${i+1}</span><span class="v__k">${k.replace('{N}',FRAG_N)}</span><span class="v__en">${en}</span></li>`).join('');
const allNotes=[...COLL,...SETS].flatMap(c=>(c.notes||[]).map(n=>({n:n[0],s:n[1],c:c.name})))
  .concat(PACKS.map(p=>({n:p.name,s:p.s,c:'100 sticks'})));
const noteHTML=list=>list.map(x=>`<span class="note" style="--s:${x.s}">${x.n}<small>${x.c}</small><em aria-hidden="true">—</em></span>`).join('');
const rows=$$('.row');
const half=Math.ceil(allNotes.length/2);
rows[0].innerHTML=noteHTML(allNotes.slice(0,half)).repeat(2);
rows[1].innerHTML=noteHTML(allNotes.slice(half)).repeat(2);
rows.forEach(r=>r.setAttribute('aria-hidden','true'));
rows[0].insertAdjacentHTML('beforebegin',`<p class="sr">${allNotes.map(x=>x.n).join(', ')}</p>`);
const mq=rows.map(el=>({el,dir:+el.dataset.dir,x:0,w:0}));
function measureMq(){ mq.forEach(m=>{ m.w=m.el.scrollWidth/2; if(m.dir>0&&m.x===0) m.x=-m.w; }); }

/* ============ burn indicator ============ */
const burnEl=$('.burn'), bStick=$('.burn__stick'), bAsh=$('.burn__ash'), bEmber=$('.burn__ember');
let ashStart=0, lastP=-1, burnH=0, pageMax=1;
function updBurn(sy){
  const max=pageMax, p=clamp(sy/Math.max(max,1));
  if(Math.abs(p-lastP)<.00005) return;
  const H=burnH, base=H*.16, full=(H-base)*.94, len=full*(1-p), top=H-base-len, burned=full*p;
  if(p<lastP) ashStart=Math.min(ashStart,burned);
  let ash=burned-ashStart;
  if(ash>24){ const f=document.createElement('i'); f.className='burn__flake'; f.style.top=(top-ash)+'px'; f.style.height=ash+'px'; burnEl.appendChild(f); setTimeout(()=>f.remove(),1800); ashStart=burned; ash=0; }
  bStick.style.height=len+'px'; bEmber.style.top=top+'px'; bAsh.style.top=(top-ash)+'px'; bAsh.style.height=ash+'px';
  lastP=p;
}

/* ============ shopify: storefront api ============ */
const SHOP_ON=!!(SHOPIFY.domain&&SHOPIFY.token);
async function sf(query,variables={}){
  let r;
  try{
    r=await fetch(`https://${SHOPIFY.domain.replace(/^https?:\/\//,'').replace(/\/.*$/,'')}/api/${SHOPIFY.version}/graphql.json`,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json','X-Shopify-Storefront-Access-Token':SHOPIFY.token},
      body:JSON.stringify({query,variables})
    });
  }catch(e){ throw new Error('Could not reach the shop. Check your connection and try again.'); }
  if(!r.ok) throw new Error(r.status===401||r.status===403?'The shop rejected the Storefront token. Check the SHOPIFY settings.':`The shop is not responding right now (${r.status}). Please try again.`);
  const j=await r.json();
  if(j.errors&&j.errors.length){ console.error('[CENKO] Shopify errors',j.errors); throw new Error('Something went wrong talking to the shop. Please try again.'); }
  return j.data;
}
const handleOf=p=>p.handle||(SHOPIFY.handles&&SHOPIFY.handles[p.id])||SHOPIFY.handlePrefix+p.id;
const byVariant=new Map();

/* live prices, compare-at prices and stock from Shopify */
async function syncProducts(){
  const fields=CATALOG.map((p,i)=>`p${i}:product(handle:${JSON.stringify(handleOf(p))}){...P}`).join(' ');
  const d=await sf(`query Catalog($country:CountryCode) @inContext(country:$country){${fields}}
    fragment P on Product{handle availableForSale variants(first:1){nodes{id availableForSale price{amount} compareAtPrice{amount}}}}`,{country:SHOPIFY.country});
  const missing=[];
  CATALOG.forEach((p,i)=>{
    const n=d['p'+i], v=n&&n.variants.nodes[0];
    if(!v){ p.variantId=null; p.available=false; missing.push(handleOf(p)); return; }
    p.variantId=v.id; p.available=!!(n.availableForSale&&v.availableForSale);
    p.price=parseFloat(v.price.amount);
    const cmp=v.compareAtPrice?parseFloat(v.compareAtPrice.amount):0;
    p.mrp=cmp>p.price?cmp:0;
    byVariant.set(v.id,p);
  });
  if(missing.length) console.warn('[CENKO] These products were not found in Shopify. Check the handle and that the product is published to the Headless channel:',missing.join(', '));
  refreshPrices();
}
function refreshPrices(){
  $$('[data-pid]').forEach(el=>{ const p=CATALOG.find(x=>x.id===el.dataset.pid); if(p) el.outerHTML=priceHTML(p); });
  $$('[data-off]').forEach(el=>{ const p=CATALOG.find(x=>x.id===el.dataset.off); if(!p) return; el.hidden=!p.mrp; if(p.mrp) el.textContent=off(p)+'% off'; });
  $$('[data-add]').forEach(setAddState);
}
function setAddState(b){
  const p=CATALOG.find(x=>x.id===b.dataset.add), out=SHOP_ON&&!!p&&p.available===false;
  b.disabled=out; b.classList.toggle('is-out',out);
  const s=b.querySelector('span'); if(s) s.textContent=out?'Sold out':'Pre-order';
}

/* the cart lives in Shopify; its id is remembered in this browser so the bag survives a reload */
const CART_KEY='cenko.cartId';
const cartStore={
  get(){ try{ return localStorage.getItem(CART_KEY); }catch(e){ return null; } },
  set(v){ try{ v?localStorage.setItem(CART_KEY,v):localStorage.removeItem(CART_KEY); }catch(e){} }
};
const CART_F=` fragment C on Cart{id totalQuantity cost{subtotalAmount{amount}}
  lines(first:100){nodes{id quantity cost{amountPerQuantity{amount}} merchandise{... on ProductVariant{id product{title}}}}}}`;
const Q_CART=`query Cart($id:ID!,$country:CountryCode) @inContext(country:$country){cart(id:$id){...C}}`+CART_F;
const M_CREATE=`mutation Create($input:CartInput!,$country:CountryCode) @inContext(country:$country){cartCreate(input:$input){cart{...C} userErrors{message}}}`+CART_F;
const M_ADD=`mutation Add($id:ID!,$lines:[CartLineInput!]!,$country:CountryCode) @inContext(country:$country){cartLinesAdd(cartId:$id,lines:$lines){cart{...C} userErrors{message}}}`+CART_F;
const M_UPDATE=`mutation Update($id:ID!,$lines:[CartLineUpdateInput!]!,$country:CountryCode) @inContext(country:$country){cartLinesUpdate(cartId:$id,lines:$lines){cart{...C} userErrors{message}}}`+CART_F;
const M_REMOVE=`mutation Remove($id:ID!,$ids:[ID!]!,$country:CountryCode) @inContext(country:$country){cartLinesRemove(cartId:$id,lineIds:$ids){cart{...C} userErrors{message}}}`+CART_F;
let cart=null;
function setCart(c){ cart=c||null; cartStore.set(cart?cart.id:null); renderBag(); }
async function cartCall(q,vars,key){
  const d=await sf(q,Object.assign({country:SHOPIFY.country},vars)), r=d[key];
  if(r.userErrors&&r.userErrors.length) throw new Error(r.userErrors[0].message);
  setCart(r.cart); return r.cart;
}
async function loadCart(){
  const id=cartStore.get(); if(!id) return;
  const d=await sf(Q_CART,{id,country:SHOPIFY.country});
  setCart(d.cart&&d.cart.totalQuantity>0?d.cart:null); /* a finished or expired cart comes back empty */
}

/* one cart request at a time, in click order */
let queue=Promise.resolve(), busy=0;
function run(fn){
  busy++; setBusy();
  const p=queue.then(fn).catch(e=>{ console.error('[CENKO]',e); toast(e.message||'Something went wrong. Please try again.'); })
    .finally(()=>{ busy--; setBusy(); });
  queue=p; return p;
}
function setBusy(){ bagEl.classList.toggle('is-busy',busy>0); $('#checkout').disabled=busy>0; }

/* ============ bag ============ */
const bag=new Map(); let lastFocus=null; /* used only in preview mode */
const bagEl=$('#bag'), behind=[$('main'),$('.nav'),$('.foot')];
const toastEl=$('#toast'); let toastTO=0;
function toast(msg){ toastEl.textContent=msg; toastEl.classList.add('show'); clearTimeout(toastTO); toastTO=setTimeout(()=>toastEl.classList.remove('show'),3200); }
function bagLines(){
  if(SHOP_ON) return cart?cart.lines.nodes.map(l=>{ const p=byVariant.get(l.merchandise.id);
    return {key:l.id,kind:p?p.kind:'ITEM',name:p?p.name:l.merchandise.product.title,qty:l.quantity,price:parseFloat(l.cost.amountPerQuantity.amount)}; }):[];
  return [...bag].map(([id,q])=>{ const p=CATALOG.find(x=>x.id===id); return {key:id,kind:p.kind,name:p.name,qty:q,price:p.price}; });
}
function renderBag(){
  const lines=bagLines(); let count=0,sum=0;
  $('#bagItems').innerHTML=lines.map(l=>{ count+=l.qty; sum+=l.qty*l.price; const k=esc(l.key), n=esc(l.name);
    return `<li class="bag__item"><b>${esc(l.kind)}</b><span>${n}</span><button class="bag__rm" type="button" data-rm="${k}">Remove<i class="sr"> ${n}</i></button><small class="bag__line"><i class="qty"><button type="button" data-qty="${k}" data-d="-1" aria-label="One fewer ${n}">&minus;</button><output aria-live="polite">${l.qty}</output><button type="button" data-qty="${k}" data-d="1" aria-label="One more ${n}">+</button></i>&times; ${fmt(l.price)}</small></li>`; }).join('');
  if(SHOP_ON&&cart) sum=parseFloat(cart.cost.subtotalAmount.amount);
  $('#bagEmpty').hidden=count>0; $('#bagSum').textContent=fmt(sum);
  $$('[data-bag-count]').forEach(e=>e.textContent=count);
}
function addToBag(id){
  const p=CATALOG.find(x=>x.id===id); if(!p) return;
  if(!SHOP_ON){ bag.set(id,(bag.get(id)||0)+1); renderBag(); toast(`${p.name} added as a pre-order`); Sound.bowl(659.3,.04,3); return; }
  Sound.bowl(659.3,.04,3);
  run(async()=>{
    await productsReady;
    if(!p.variantId) throw new Error(`${p.name} isn't available online yet.`);
    if(p.available===false) throw new Error(`${p.name} is sold out.`);
    const lines=[{merchandiseId:p.variantId,quantity:1}], create=()=>cartCall(M_CREATE,{input:{lines,buyerIdentity:{countryCode:SHOPIFY.country}}},'cartCreate');
    if(!cart){ await create(); if(signedIn()){ const t=await accessToken(); if(t) await setCartIdentity(t); } }
    else{
      try{ await cartCall(M_ADD,{id:cart.id,lines},'cartLinesAdd'); }
      catch(e){ if(/exist|not found|invalid|expired/i.test(e.message)){ setCart(null); await create(); } else throw e; }
    }
    toast(`${p.name} added as a pre-order`);
  });
}
function changeQty(key,delta){
  if(!SHOP_ON){ const q=(bag.get(key)||0)+delta; q>0?bag.set(key,q):bag.delete(key); renderBag(); return; }
  run(async()=>{
    const l=cart&&cart.lines.nodes.find(x=>x.id===key); if(!l) return;
    const q=l.quantity+delta;
    if(q>0) await cartCall(M_UPDATE,{id:cart.id,lines:[{id:key,quantity:q}]},'cartLinesUpdate');
    else await cartCall(M_REMOVE,{id:cart.id,ids:[key]},'cartLinesRemove');
  });
}
function removeLine(key){
  if(!SHOP_ON){ bag.delete(key); renderBag(); return; }
  run(async()=>{ if(cart) await cartCall(M_REMOVE,{id:cart.id,ids:[key]},'cartLinesRemove'); });
}
document.addEventListener('click',e=>{ const b=e.target.closest('[data-add]'); if(b&&!b.disabled) addToBag(b.dataset.add); });
$('#bagItems').addEventListener('click',e=>{
  const r=e.target.closest('[data-rm]'); if(r){ removeLine(r.dataset.rm); return; }
  const q=e.target.closest('[data-qty]'); if(q) changeQty(q.dataset.qty,+q.dataset.d);
});
bagEl.inert=true;
function openBag(){ lastFocus=document.activeElement; body.classList.add('bag-open'); bagEl.inert=false; bagEl.setAttribute('aria-hidden','false'); behind.forEach(x=>x.inert=true); setTimeout(()=>$('#bag [data-bag-close]').focus(),60); }
function closeBag(){ body.classList.remove('bag-open'); bagEl.inert=true; bagEl.setAttribute('aria-hidden','true'); behind.forEach(x=>x.inert=false); if(lastFocus&&lastFocus.focus) lastFocus.focus(); }
$$('[data-bag-open]').forEach(b=>b.addEventListener('click',openBag));
$$('[data-bag-close]').forEach(b=>b.addEventListener('click',closeBag));
addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  if(sheetId){ closeSheet(); return; }
  if(body.classList.contains('bag-open')){ closeBag(); return; }
  if(sheetId) closeSheet();
});
/* checkout: hand the Shopify cart to Shopify's hosted checkout, where Razorpay takes the payment */
const checkoutLabel=$('#checkout span'), CHECKOUT_TXT=checkoutLabel.textContent;
$('#checkout').addEventListener('click',()=>{
  if(!SHOP_ON){ toast(bag.size?'Checkout opens once the Shopify store is connected':'Add something to your bag first'); return; }
  run(async()=>{
    if(!cart||!cart.totalQuantity){ toast('Add something to your bag first'); return; }
    /* ask for a fresh checkout link at the moment of leaving, as Shopify recommends */
    const d=await sf(`query Go($id:ID!,$country:CountryCode) @inContext(country:$country){cart(id:$id){checkoutUrl totalQuantity}}`,{id:cart.id,country:SHOPIFY.country});
    if(!d.cart||!d.cart.totalQuantity){ setCart(null); throw new Error('Your bag has expired. Please add your items again.'); }
    if(signedIn()){ const t=await accessToken(); if(t) await setCartIdentity(t); }
    checkoutLabel.textContent='Opening secure checkout…';
    location.href=d.cart.checkoutUrl;
  });
});
/* coming back from checkout (back button or "continue shopping"): refresh the bag, it empties once an order is placed */
addEventListener('pageshow',e=>{ if(!e.persisted) return; checkoutLabel.textContent=CHECKOUT_TXT; if(SHOP_ON) run(loadCart); });

let productsReady=Promise.resolve();
if(SHOP_ON){
  productsReady=syncProducts().catch(e=>{ console.error('[CENKO]',e); toast('Live prices could not be loaded. Showing saved prices.'); });
  run(async()=>{ await productsReady; await loadCart(); });
}else{
  console.info('[CENKO] Preview mode: fill in SHOPIFY.domain and SHOPIFY.token to switch on the live shop.');
}
renderBag();

/* ============ customer accounts (Shopify Customer Account API, passwordless one-time code) ============ */
const ACC=SHOPIFY.account||{}, ACC_ON=!!(ACC.clientId&&ACC.shopId);
const ACC_AUTH=`https://shopify.com/authentication/${ACC.shopId}`;
const ACC_HOME=`https://shopify.com/${ACC.shopId}/account`;
const ACC_KEY='cenko.account', ACC_PKCE='cenko.pkce';
const store={
  get(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } },
  set(k,v){ try{ v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};
const Account={session:store.get(ACC_KEY), me:null, orders:null, state:'idle', error:''};
const b64url=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const randStr=n=>b64url(crypto.getRandomValues(new Uint8Array(n)));
function signedIn(){ return !!(Account.session&&Account.session.refresh); }

async function accLogin(email,opts={}){
  if(!ACC_ON){ toast('Accounts open once the shop is connected'); return; }
  const verifier=randStr(48), state=randStr(16), nonce=randStr(16);
  const challenge=b64url(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));
  store.set(ACC_PKCE,{verifier,state,nonce,subscribe:!!opts.subscribe,t:Date.now()});
  const q=new URLSearchParams({client_id:ACC.clientId,scope:'openid email customer-account-api:full',response_type:'code',
    redirect_uri:ACC.redirect,state,nonce,code_challenge:challenge,code_challenge_method:'S256',locale:'en'});
  if(email) q.set('login_hint',email);
  location.href=`${ACC_AUTH}/oauth/authorize?${q}`;
}
async function tokenCall(params){
  const r=await fetch(`${ACC_AUTH}/oauth/token`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(Object.assign({client_id:ACC.clientId},params))});
  const j=await r.json().catch(()=>({}));
  if(!r.ok||!j.access_token) throw new Error(j.error_description||j.error||'Sign-in could not be completed. Please try again.');
  return j;
}
function keep(j){
  Account.session={access:j.access_token,refresh:j.refresh_token||(Account.session&&Account.session.refresh),idToken:j.id_token||(Account.session&&Account.session.idToken),exp:Date.now()+((j.expires_in||3600)-120)*1000};
  store.set(ACC_KEY,Account.session);
}
async function accessToken(){
  const s=Account.session; if(!s) return null;
  if(s.access&&s.exp>Date.now()) return s.access;
  try{ keep(await tokenCall({grant_type:'refresh_token',refresh_token:s.refresh})); return Account.session.access; }
  catch(e){ accForget(); return null; }
}
function accForget(){ Account.session=null; Account.me=null; Account.orders=null; store.set(ACC_KEY,null); renderAccountBits(); }
async function ca(query,variables={}){
  const t=await accessToken(); if(!t) throw new Error('signed-out');
  const r=await fetch(`${ACC_HOME}/customer/api/${ACC.apiVersion||'2026-07'}/graphql`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json','Authorization':t},body:JSON.stringify({query,variables})});
  if(r.status===401){ accForget(); throw new Error('signed-out'); }
  const j=await r.json();
  if(j.errors&&j.errors.length) throw Object.assign(new Error(j.errors[0].message),{gql:true});
  return j.data;
}
const Q_ME_FULL=`query Me{customer{firstName lastName emailAddress{emailAddress}
  orders(first:20,sortKey:PROCESSED_AT,reverse:true){nodes{id name processedAt cancelledAt financialStatus statusPageUrl totalPrice{amount}
  lineItems(first:12){nodes{title quantity}}}}}}`;
const Q_ME_MIN=`query Me{customer{firstName emailAddress{emailAddress} orders(first:20,reverse:true){nodes{id name processedAt totalPrice{amount}}}}}`;
async function loadMe(){
  let d;
  try{ d=await ca(Q_ME_FULL); }
  catch(e){ if(!e.gql) throw e; d=await ca(Q_ME_MIN); }
  const c=d.customer||{};
  Account.me={first:c.firstName||'',last:c.lastName||'',email:c.emailAddress&&c.emailAddress.emailAddress||''};
  Account.orders=(c.orders&&c.orders.nodes)||[];
}
/* coming back from Shopify's sign-in page with ?code=…&state=… */
async function accCallback(){
  const u=new URL(location.href), code=u.searchParams.get('code'), st=u.searchParams.get('state'), err=u.searchParams.get('error');
  if(!code&&!err) return false;
  const pk=store.get(ACC_PKCE); store.set(ACC_PKCE,null);
  ['code','state','error','error_description'].forEach(k=>u.searchParams.delete(k));
  history.replaceState(null,'',u.pathname+(u.search.length>1?u.search:'')+u.hash);
  if(err||!pk||pk.state!==st){ if(err!=='access_denied') toast('Sign-in was not completed. Please try again.'); return false; }
  Account.state='loading'; openAccount();
  try{
    keep(await tokenCall({grant_type:'authorization_code',redirect_uri:ACC.redirect,code,code_verifier:pk.verifier}));
    await loadMe();
    Account.state='idle';
    if(pk.subscribe) await subscribeMember();
    linkCartToMember();
    toast(Account.me&&Account.me.first?`Welcome, ${Account.me.first}. Member pricing is on.`:'You are signed in. Member pricing is on.');
  }catch(e){ console.error('[CENKO] account',e); Account.state='error'; Account.error=e.message==='signed-out'?'Sign-in expired. Please try again.':e.message; }
  renderAccountBits(); if(sheetId==='account') openAccount();
  return true;
}
async function accLogout(){
  const s=Account.session; accForget();
  await Promise.race([setCartIdentity(null).catch(()=>{}), new Promise(r=>setTimeout(r,2500))]); /* take member pricing off the cart first */
  const q=new URLSearchParams({post_logout_redirect_uri:ACC.redirect}); if(s&&s.idToken) q.set('id_token_hint',s.idToken);
  location.href=`${ACC_AUTH}/logout?${q}`;
}
/* attach the signed-in member to the Shopify cart so the 10% member discount applies at checkout */
async function setCartIdentity(token){
  if(!SHOP_ON||!cart) return;
  const bi={countryCode:SHOPIFY.country}; if(token) bi.customerAccessToken=token;
  try{ await cartCall(`mutation B($id:ID!,$bi:CartBuyerIdentityInput!,$country:CountryCode) @inContext(country:$country){cartBuyerIdentityUpdate(cartId:$id,buyerIdentity:$bi){cart{...C} userErrors{message}}}`+CART_F,{id:cart.id,bi},'cartBuyerIdentityUpdate'); }
  catch(e){ console.warn('[CENKO] could not link cart to member',e);
    if(token&&Account.me&&Account.me.email){ try{ await cartCall(`mutation B($id:ID!,$bi:CartBuyerIdentityInput!,$country:CountryCode) @inContext(country:$country){cartBuyerIdentityUpdate(cartId:$id,buyerIdentity:$bi){cart{...C} userErrors{message}}}`+CART_F,{id:cart.id,bi:{countryCode:SHOPIFY.country,email:Account.me.email}},'cartBuyerIdentityUpdate'); }catch(_){} } }
  /* member pricing: apply the member code while signed in, remove it on sign-out */
  if(ACC.memberCode){
    try{ await cartCall(`mutation D($id:ID!,$codes:[String!]!,$country:CountryCode) @inContext(country:$country){cartDiscountCodesUpdate(cartId:$id,discountCodes:$codes){cart{...C} userErrors{message}}}`+CART_F,{id:cart.id,codes:token?[ACC.memberCode]:[]},'cartDiscountCodesUpdate'); }
    catch(e){ console.warn('[CENKO] member code',e); }
  }
}
function linkCartToMember(){ if(signedIn()&&SHOP_ON) run(async()=>{ const t=await accessToken(); if(t) await setCartIdentity(t); }); }
async function subscribeMember(){
  try{ await ca(`mutation{customerEmailMarketingSubscribe{emailAddress{marketingState} userErrors{message}}}`); toast('Subscribed. Your first letter arrives with the next new moon.'); }
  catch(e){ console.warn('[CENKO] newsletter',e); }
}

/* ---------- account panel ---------- */
const fmtDate=s=>{ try{ return new Date(s).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }catch(e){ return s; } };
const statusText=o=>o.cancelledAt?'Cancelled':({PAID:'Paid',PENDING:'Payment pending',REFUNDED:'Refunded',PARTIALLY_REFUNDED:'Partly refunded',AUTHORIZED:'Payment authorised',VOIDED:'Cancelled'}[o.financialStatus]||'Placed');
function orderHTML(o){
  const items=o.lineItems?o.lineItems.nodes.map(l=>`${esc(l.title)}${l.quantity>1?` × ${l.quantity}`:''}`).join(', '):'';
  return `<li class="acct__order"><header><b>Order ${esc(o.name||'')}</b><span>${fmt(parseFloat(o.totalPrice&&o.totalPrice.amount||0))}</span></header>
    <p>${fmtDate(o.processedAt)} · ${statusText(o)}${items?`<br>${items}`:''}</p>
    ${o.statusPageUrl?`<a href="${esc(o.statusPageUrl)}" target="_blank" rel="noopener">Track and see details</a>`:''}</li>`;
}
function accountHTML(){
  const head=`<article class="doc acct"><h2 id="sheetTitle">Your CENKO account</h2>`;
  if(Account.state==='loading') return head+`<p class="doc__meta">Signing you in…</p></article>`;
  if(signedIn()){
    const me=Account.me, o=Account.orders;
    return head+`<p class="doc__meta">${me?esc(me.email):'Signed in'}</p>
      <span class="acct__badge">Member · 10% off every order</span>
      <p style="margin-top:16px">${me&&me.first?`Hello ${esc(me.first)}. `:''}Your member discount is applied automatically at checkout while you are signed in.</p>
      <h3>Your orders</h3>
      ${o==null?`<p>Loading your orders…</p>`:o.length?`<ul class="acct__orders">${o.map(orderHTML).join('')}</ul>`:`<p>No orders yet. Your pre-orders will appear here as soon as you place them.</p>`}
      <div class="acct__row"><a href="${ACC_HOME}/orders" target="_blank" rel="noopener">All orders</a><a href="${ACC_HOME}/profile" target="_blank" rel="noopener">Addresses and profile</a><button type="button" class="linkish" data-acc-logout>Sign out</button></div>
    </article>`;
  }
  return head+`<p class="doc__meta">Free to join. No password.</p>
    ${Account.state==='error'?`<p class="letter__msg err" style="color:#b3401a">${esc(Account.error)}</p>`:''}
    <ul class="acct__perks"><li>10% off every order while you are signed in</li><li>See your previous orders and track deliveries</li><li>Faster checkout with saved addresses</li></ul>
    <form class="acct__form" data-acc-form novalidate>
      <label class="sr" for="accEmail">Email address</label>
      <input id="accEmail" type="email" inputmode="email" autocomplete="email" placeholder="Your email address" value="${esc(($('#email')&&$('#email').value)||'')}">
      <label class="chk"><input type="checkbox" id="accNews"> Send me the monthly CENKO letter (optional)</label>
      <button class="btn" type="submit"><span>Sign in or create account</span></button>
      <p class="acct__fine">Shopify, our store platform, emails you a 6-digit code to confirm it's you. New here? The same step creates your account. By continuing you agree to our <a href="#help" data-doc="terms">Terms</a> and <a href="#help" data-doc="privacy">Privacy Policy</a>.</p>
    </form></article>`;
}
function openAccount(opener){
  if(opener||sheetId!=='account') openPanel('account',accountHTML(),'',opener);
  else sheetScroll.innerHTML=accountHTML();
  if(signedIn()&&Account.orders==null&&Account.state!=='loading'){
    loadMe().then(()=>{ renderAccountBits(); if(sheetId==='account') sheetScroll.innerHTML=accountHTML(); })
      .catch(e=>{ if(e.message==='signed-out'&&sheetId==='account') sheetScroll.innerHTML=accountHTML(); else console.error('[CENKO] account',e); });
  }
}
function renderAccountBits(){
  const on=signedIn(), name=Account.me&&Account.me.first;
  $$('.acct-t').forEach(e=>e.textContent=on?(name||'Member'):'Account');
  const bm=$('#bagMember');
  if(bm) bm.innerHTML=on?'<b>Member pricing on:</b> 10% off is applied at checkout.':'Members save 10% at checkout. <button type="button" class="linkish" data-account-open>Sign in or join</button>';
}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-account-open]');
  if(a){ e.preventDefault(); closeNav(); if(body.classList.contains('bag-open')) closeBag(); Account.state=Account.state==='loading'?'loading':'idle'; openAccount(a); return; }
  if(e.target.closest('[data-acc-logout]')) accLogout();
});
document.addEventListener('submit',e=>{
  const f=e.target.closest('[data-acc-form]'); if(!f) return;
  e.preventDefault();
  const v=$('#accEmail').value.trim();
  if(v&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ $('#accEmail').focus(); toast('Enter an email address like name@example.com'); return; }
  const b=f.querySelector('.btn span'); if(b) b.textContent='Opening secure sign-in…';
  accLogin(v,{subscribe:$('#accNews').checked});
});

/* ============ newsletter: confirmed through the same one-time code, so only real, consenting addresses are added ============ */
function subscribe(){
  const v=$('#email').value.trim(), m=$('#subMsg');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ m.textContent='Enter an email address like name@example.com.'; m.classList.add('err'); $('#email').focus(); return; }
  m.classList.remove('err');
  if(signedIn()){ m.textContent='Subscribing…'; subscribeMember().then(()=>{ m.textContent='You are on the list. Thank you.'; }); return; }
  if(!ACC_ON){ m.textContent='Sign-up opens soon. Thank you for your patience.'; return; }
  m.textContent='Taking you to confirm your email…';
  accLogin(v,{subscribe:true});
}
$('#subBtn').addEventListener('click',subscribe);
$('#email').addEventListener('keydown',e=>{ if(e.key==='Enter') subscribe(); });

renderAccountBits();
if(ACC_ON){
  accCallback().then(done=>{
    if(!done&&signedIn()){ loadMe().then(renderAccountBits).catch(()=>{}); linkCartToMember(); }
  });
}
function hashRoute(){ if(location.hash==='#account') openAccount(); else docFromHash(); }
addEventListener('hashchange',()=>{ if(location.hash==='#account') openAccount(); });
hashRoute();

/* ============ visibility ============ */
const vis={coll:false,notes:false};
const vo=new IntersectionObserver(es=>es.forEach(en=>{
  const t=en.target, on=en.isIntersecting;
  if(t===hero) smoke.visible=on;
  else if(t.classList.contains('foot')) smoke2.visible=on;
  else if(t===coll) vis.coll=on;
  else if(t.id==='notes') vis.notes=on;
}),{rootMargin:'80px'});
[hero,$('.foot'),coll,$('#notes')].forEach(el=>vo.observe(el));

/* ============ smooth scroll ============ */
const Smooth={on:false,cur:scrollY,tgt:scrollY,active:false,rate:8.5}; /* native scrolling: smooth JS scroll tied scrolling to the animation thread */
const maxScroll=()=>document.documentElement.scrollHeight-innerHeight;
function goTo(y,rate){
  y=clamp(y,0,maxScroll());
  if(Smooth.on){ if(!Smooth.active) Smooth.cur=scrollY; Smooth.tgt=y; Smooth.rate=rate; Smooth.active=true; }
  else scrollTo({top:y,behavior:RM?'auto':'smooth'});
}
if(Smooth.on){
  document.documentElement.style.scrollBehavior='auto';
  addEventListener('wheel',e=>{
    if(e.ctrlKey) return;
    if(body.classList.contains('sheet-open')){ if(!e.target.closest('.sheet__scroll')) e.preventDefault(); return; }
    if(body.classList.contains('bag-open')){ if(!e.target.closest('.bag__items')) e.preventDefault(); return; }
    if(Math.abs(e.deltaX)>Math.abs(e.deltaY)) return;
    e.preventDefault();
    let d=e.deltaY; if(e.deltaMode===1) d*=40; else if(e.deltaMode===2) d*=innerHeight;
    if(!Smooth.active){ Smooth.cur=scrollY; Smooth.tgt=scrollY; }
    Smooth.rate=8.5; Smooth.tgt=clamp(Smooth.tgt+d,0,maxScroll()); Smooth.active=true;
  },{passive:false});
  addEventListener('keydown',e=>{ if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key)) Smooth.active=false; });
}
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href'); if(id.length<2) return;
  const el=document.getElementById(id.slice(1)); if(!el) return;
  e.preventDefault();
  if(!lit) light(false);
  goTo(id==='#top'?0:el.getBoundingClientRect().top+scrollY,4.2);
  el.setAttribute('tabindex','-1'); el.focus({preventScroll:true});
}));
if(FINE){
  burnEl.dataset.cursor='scrub';
  let scrubbing=false;
  const scrubTo=e=>{ const r=burnEl.getBoundingClientRect(); const de=document.documentElement; de.style.scrollBehavior='auto'; scrollTo(0,clamp((e.clientY-r.top-r.height*.06)/(r.height*.78))*maxScroll()); de.style.scrollBehavior=''; };
  burnEl.addEventListener('pointerdown',e=>{ if(!lit) return; e.preventDefault(); scrubbing=true; burnEl.classList.add('scrub'); burnEl.setPointerCapture(e.pointerId); scrubTo(e); });
  burnEl.addEventListener('pointermove',e=>{ if(scrubbing) scrubTo(e); });
  const endScrub=()=>{ scrubbing=false; burnEl.classList.remove('scrub'); };
  burnEl.addEventListener('pointerup',endScrub); burnEl.addEventListener('pointercancel',endScrub);
}

/* ============ headline reveals ============ */
const heads=$$('[data-reveal]');
if(!RM&&'IntersectionObserver' in window){
  heads.forEach(h=>{ const txt=h.textContent.trim(); h.setAttribute('aria-label',txt); h.innerHTML=txt.split(/\s+/).map((w,i)=>`<span class="w" aria-hidden="true" style="--i:${i}">${w}</span>`).join(' '); });
  const ro=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('revealed'); ro.unobserve(en.target); } }),{threshold:.5});
  heads.forEach(h=>ro.observe(h));
}

/* ============ small delights ============ */
const baseTitle=document.title;
document.addEventListener('visibilitychange',()=>{ document.title=(document.hidden&&lit)?'Your incense is still burning':baseTitle; });
try{ console.log('%cCENKO%c\nRolled thin. Burned slow.','font:20px serif;color:#FFC98A;letter-spacing:.34em','color:#8E9399'); }catch(_){}

/* ============ loop ============ */
let last=performance.now(), lastSY=scrollY, sVel=0, frameN=0, lastDone=-1, geoDirty=true;
const Q={tier:MIN?2:(LITE?1:0), ema:16.7, n:0, t0:performance.now()+3500};
function degrade(){
  Q.tier++; Q.n=0; Q.ema=16.7; const html=document.documentElement;
  if(Q.tier===1){ html.classList.add('lite'); for(const k of [smoke,smoke2]){ k.o.rate*=.5; k.o.max=Math.round(k.o.max*.5); k.resize(); } drawRidges(); geoDirty=true; }
  if(Q.tier>=2){ html.classList.add('lite','min'); for(const k of [smoke,smoke2]){ k.o.rate=0; } }
}
function frame(now){
  const raw=now-last, dt=Math.min(raw/1000,1/24); last=now; frameN++;
  if(Q.tier<2&&now>Q.t0&&!document.hidden&&raw<250&&(smoke.visible||smoke2.visible)){ Q.ema+=(raw-Q.ema)*.05; if(++Q.n>90&&Q.ema>24) degrade(); }
  if(!lit){
    hold=clamp(hold+(holding?dt/1.5:-dt/.9));
    smoke.heat=hold*.85; prog.style.strokeDashoffset=(408.4*(1-hold)).toFixed(1); Sound.hissLevel(hold);
    if(hold>=1) light(Sound.on);
  } else {
    fireT+=dt; smoke.fire=RM?1:smooth(0,2.6,fireT); smoke.heat=1;
  }
  if(Smooth.active){ Smooth.cur=lerp(Smooth.cur,Smooth.tgt,1-Math.exp(-dt*Smooth.rate)); if(Math.abs(Smooth.tgt-Smooth.cur)<.4){ Smooth.cur=Smooth.tgt; Smooth.active=false; } scrollTo(0,Smooth.cur); }
  const sy=scrollY; sVel=lerp(sVel,(sy-lastSY)/Math.max(dt,.001),.12); lastSY=sy;
  if(smoke.visible){ smoke.update(dt); smoke.draw(); }
  if(smoke2.visible){ smoke2.update(dt); smoke2.draw(); }
  if(FINE){ if(Math.abs(mx-cxp)+Math.abs(my-cyp)>.2){ cxp=lerp(cxp,mx,1-Math.exp(-dt*18)); cyp=lerp(cyp,my,1-Math.exp(-dt*18)); cur.style.transform=`translate3d(${cxp.toFixed(1)}px,${cyp.toFixed(1)}px,0)`; }
    if(sy!==lastDone) moved=true; if(frameN%6===0&&moved){ moved=false; cursorState(); } }
  if(sy!==lastDone||geoDirty){ geoDirty=false; lastDone=sy; updRit(sy); updDawn(sy); updBurn(sy); }
  if(vis.notes&&!RM){ const boost=Math.min(Math.abs(sVel)/60,14); mq.forEach(m=>{ m.x+=m.dir*(36+boost*28)*dt; if(m.x<=-m.w)m.x+=m.w; if(m.x>0)m.x-=m.w; m.el.style.transform=`translate3d(${m.x.toFixed(1)}px,0,0)`; }); }
  requestAnimationFrame(frame);
}

/* ============ scroll choreography (IntersectionObserver + Web Animations, no library) ============ */
if(!RM&&'IntersectionObserver' in window&&Element.prototype.animate){
  const groups=[['#tinrow','.tinsku',54,1000,100],['#giftCards','.card',42,900,90],['#packCards','.card',42,900,90],['#vgrid','.v',30,800,70]];
  const rvo=new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting) return; rvo.unobserve(en.target); const g=en.target._rv; rise(en.target.querySelectorAll(g[1]),g[2],g[3],g[4]); }),{rootMargin:'0px 0px -12% 0px'});
  groups.forEach(g=>{ const t=$(g[0]); if(!t) return; const r=t.getBoundingClientRect(); if(r.top<innerHeight*.88) return; t._rv=g; t.querySelectorAll(g[1]).forEach(el=>el.classList.add('rv-wait')); rvo.observe(t); });
}

/* ============ init ============ */
function measure(){ const sy=scrollY;
  const rr=rit.getBoundingClientRect(); ritTop=rr.top+sy; ritH=rr.height;
  const dr=dawn.getBoundingClientRect(); dawnTop=dr.top+sy; dawnH=dr.height;
  burnH=burnEl.clientHeight; pageMax=document.documentElement.scrollHeight-innerHeight;
  for(const k of [smoke,smoke2]){ const r=k.cv.getBoundingClientRect(); k.px=r.left; k.py=r.top+sy; }
  lastP=-1; geoDirty=true; }
function layout(){ smoke.resize(); smoke2.resize(); layoutRit(); drawRidges(); measureMq(); measure(); }
let mT=0; if('ResizeObserver' in window) new ResizeObserver(()=>{ cancelAnimationFrame(mT); mT=requestAnimationFrame(()=>{ if(deskRit) layoutRit(); measure(); }); }).observe(body);
let rT=0; addEventListener('resize',()=>{ clearTimeout(rT); rT=setTimeout(layout,150); });
layout();
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>{ layoutRit(); measureMq(); measure(); });
addEventListener('load',measure);
requestAnimationFrame(frame);
})();
