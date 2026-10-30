/* 🖼 GALERÍA: 3 filas que se mueven. Pon aquí los nombres de tus archivos
   (fotos de eventos, programas, proyectos, satélites, Tierra). Guárdalos en images/gallery/ */
const GALLERY=[
 ['1.webp','22.jpeg','23.webp','25.webp','4.webp','2.webp','24.jpg'],
 ['6.webp','8.jpeg','9.jpeg','12.webp','7.jpeg','10.jpg','11.jpeg'],
 ['16.jpeg','17.jpeg','18.jpg','19.jpeg','5.jpg','20.jpg','21.jpeg']
];
const rows=document.getElementById('rows');
GALLERY.forEach(function(r,i){
  var d=document.createElement('div');d.className='rowm'+(i%2?' rev':'');
  var html=r.map(function(f){return '<div class="ph" data-label="'+f+'"><img src="images/gallery/'+f+'" alt="" loading="lazy" onerror="this.remove()"></div>'}).join('');
  d.innerHTML=html+html; rows.appendChild(d);
});

// starfield
(function(){var c=document.getElementById('stars'),x=c.getContext('2d'),W,H,S=[];
function z(){W=c.width=innerWidth;H=c.height=innerHeight;S=[];for(var i=0;i<Math.min(140,W*H/9000);i++)S.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.2+.3,p:Math.random()*6.3,v:Math.random()*.02+.005})}
z();addEventListener('resize',z);
(function d(){x.clearRect(0,0,W,H);S.forEach(function(s){s.p+=s.v;x.fillStyle='rgba(240,236,250,'+(.25+Math.sin(s.p)*.25)+')';x.beginPath();x.arc(s.x,s.y,s.r,0,6.3);x.fill()});requestAnimationFrame(d)})()})();
// menu
var m=document.getElementById('menu');
document.getElementById('burger').onclick=function(){m.classList.toggle('open')};
m.querySelectorAll('a').forEach(function(a){a.onclick=function(){m.classList.remove('open')}});
document.querySelectorAll('.g').forEach(function(c){c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--x',e.clientX-r.left+'px');c.style.setProperty('--y',e.clientY-r.top+'px')})});
// GSAP
window.addEventListener('load',function(){
  if(!window.gsap)return; gsap.registerPlugin(ScrollTrigger);
  var t=gsap.timeline({defaults:{ease:'power4.out'}});
  t.from('nav',{y:-70,opacity:0,duration:.9})
   .from('.title .pill',{opacity:0,y:20,duration:.7},'-=.4')
   .from('.title .row1 span',{yPercent:120,opacity:0,duration:1,stagger:.12},'-=.4')
   .from('.title .big',{yPercent:60,opacity:0,duration:1.2},'-=.8')
   .from('.portrait',{y:140,opacity:0,duration:1.4},'-=1')
   .from('.hero-foot>*,.chip',{opacity:0,y:30,duration:.8,stagger:.1},'-=.6');
  gsap.to('.chip.c1',{y:-14,x:8,duration:2.6,yoyo:true,repeat:-1,ease:'sine.inOut'});
  gsap.to('.chip.c2',{y:12,x:-8,duration:3.1,yoyo:true,repeat:-1,ease:'sine.inOut'});
  gsap.to('.spark',{rotate:180,scale:1.4,duration:3,yoyo:true,repeat:-1,stagger:.5,ease:'sine.inOut'});
  gsap.to('.portrait',{yPercent:8,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.title',{yPercent:-12,opacity:.3,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('#bar',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.3}});
  gsap.utils.toArray('.rv').forEach(function(e){gsap.from(e,{opacity:0,y:60,duration:1,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:e,start:'top 90%'}})});
  gsap.set('#cloud span',{rotate:function(i){return [-8,5,-4,9,-6,4,-10,6,-3,8][i%10]}});
  gsap.from('#cloud span',{y:-260,opacity:0,duration:1.1,stagger:.08,ease:'bounce.out',scrollTrigger:{trigger:'#cloud',start:'top 80%'}});
  gsap.from('.proj',{y:120,opacity:0,duration:1,stagger:.12,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:'#fan',start:'top 85%'}});
  gsap.from('#rows .rowm',{opacity:0,scale:.9,duration:1,stagger:.2,scrollTrigger:{trigger:'#rows',start:'top 85%'}});

  /* ===== VOICES: coverflow carousel ===== */
  var cards=gsap.utils.toArray('#tcar .tcard'),n=cards.length,idx=0,tw=null,
      bar=document.querySelector('#tbar span'),dotsBox=document.getElementById('tdots'),
      stage=document.getElementById('tcar'),started=false,
      still=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!n)return;
  gsap.set(cards,{transformPerspective:1200});
  var dots=cards.map(function(_,i){var d=document.createElement('i');d.onclick=function(){go(i-idx)};dotsBox.appendChild(d);return d});
  function place(anim){
    var h=Math.floor(n/2),small=innerWidth<700;
    cards.forEach(function(c,i){
      var o=((i-idx+n+h)%n)-h,a=Math.abs(o);
      gsap.to(c,{xPercent:o*(small?106:64),scale:1-a*.15,rotationY:-o*20,opacity:a===0?1:(small?0:.4),filter:'blur('+(a*3)+'px)',zIndex:10-a,duration:anim?.95:0,ease:'power3.out',overwrite:true});
      c.classList.toggle('act',a===0);
    });
    dots.forEach(function(d,i){d.classList.toggle('on',i===idx)});
  }
  function reveal(){
    gsap.fromTo(cards[idx].querySelectorAll('.qm,.tq,.who'),{y:26,opacity:0},{y:0,opacity:1,duration:.8,stagger:.12,delay:.25,ease:'power3.out',overwrite:'auto'});
  }
  function run(){
    if(tw)tw.kill();
    gsap.set(bar,{scaleX:0});
    if(still||!started)return;
    tw=gsap.to(bar,{scaleX:1,duration:7,ease:'none',onComplete:function(){go(1)}});
  }
  function go(d){idx=(idx+d+n)%n;place(true);reveal();run()}
  place(false);
  document.getElementById('tprev').onclick=function(){go(-1)};
  document.getElementById('tnext').onclick=function(){go(1)};
  cards.forEach(function(c,i){c.addEventListener('click',function(){if(i!==idx&&!dragged)go(i-idx)})});
  stage.addEventListener('mouseenter',function(){if(tw)tw.pause()});
  stage.addEventListener('mouseleave',function(){if(tw)tw.resume()});
  var sx=null,dragged=false;
  stage.addEventListener('pointerdown',function(e){sx=e.clientX;dragged=false});
  window.addEventListener('pointerup',function(e){
    if(sx===null)return;var dx=e.clientX-sx;sx=null;
    if(Math.abs(dx)>50){dragged=true;go(dx<0?1:-1);setTimeout(function(){dragged=false},50)}
  });
  addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)});
  addEventListener('resize',function(){place(false)});
  gsap.from('#voices .tstage,#voices .tctrl',{y:80,opacity:0,duration:1.1,stagger:.15,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:'#voices',start:'top 75%',once:true,onEnter:function(){started=true;reveal();run()}}});
});