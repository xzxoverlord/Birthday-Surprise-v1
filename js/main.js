
// Birthday Surprise V2 — visual effects and interactions
const universe = document.getElementById('universe');
const uctx = universe.getContext('2d');
const effects = document.getElementById('effects');
const ectx = effects.getContext('2d');
let w = innerWidth, h = innerHeight, stars = [], shooting = [], particles = [];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function sizeCanvases() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  w = innerWidth; h = innerHeight;
  [universe, effects].forEach(c => {
    c.width = w * dpr; c.height = h * dpr;
    c.style.width = `${w}px`; c.style.height = `${h}px`;
    c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
  });
  stars = Array.from({length: Math.min(240, Math.floor(w*h/4800))}, () => ({
    x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.35+.25,
    a: Math.random()*.55+.15, p: Math.random()*6.28, s: Math.random()*.012+.002
  }));
}
sizeCanvases();
addEventListener('resize', sizeCanvases);

function addConfetti(x = w/2, y = h*.45, amount = 150) {
  const colors = ['#f7b8df','#c9baff','#fff0c9','#a8d8ff','#f9e4f5'];
  for(let i=0;i<amount;i++){
    const angle = Math.random()*Math.PI*2, speed = Math.random()*7+2;
    particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-3,
      size:Math.random()*5+3,life:Math.random()*75+55,color:colors[i%colors.length],
      rot:Math.random()*6.28,vr:(Math.random()-.5)*.25,shape:Math.random()>.5?'rect':'circle'});
  }
}

function animate(time=0){
  uctx.clearRect(0,0,w,h);
  stars.forEach(s=>{
    const twinkle=.45+.55*(Math.sin(time*s.s+s.p)+1)/2;
    uctx.beginPath();uctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    uctx.fillStyle=`rgba(255,231,252,${s.a*twinkle})`;uctx.fill();
  });

  if(!reducedMotion && Math.random()<.003 && shooting.length<2){
    shooting.push({x:Math.random()*w*.9,y:Math.random()*h*.45,vx:7+Math.random()*4,vy:3+Math.random()*2,life:0});
  }

  shooting.forEach((s,i)=>{
    s.x+=s.vx;s.y+=s.vy;s.life++;
    const g=uctx.createLinearGradient(s.x-70,s.y-30,s.x,s.y);
    g.addColorStop(0,'rgba(255,190,235,0)');
    g.addColorStop(1,'rgba(255,224,250,.9)');
    uctx.strokeStyle=g;uctx.lineWidth=1.5;
    uctx.beginPath();uctx.moveTo(s.x-70,s.y-30);uctx.lineTo(s.x,s.y);uctx.stroke();
    if(s.life>28)shooting.splice(i,1);
  });

  ectx.clearRect(0,0,w,h);
  particles.forEach((p,i)=>{
    p.x+=p.vx;p.y+=p.vy;p.vy+=.11;p.vx*=.992;p.rot+=p.vr;p.life--;
    ectx.save();ectx.translate(p.x,p.y);ectx.rotate(p.rot);
    ectx.globalAlpha=Math.min(1,p.life/25);ectx.fillStyle=p.color;
    if(p.shape==='rect')ectx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.65);
    else{
      ectx.beginPath();ectx.arc(0,0,p.size/2,0,Math.PI*2);ectx.fill();
    }
    ectx.restore();
    if(p.life<=0||p.y>h+30)particles.splice(i,1);
  });
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// Reveal sections as they enter the viewport.
const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.12});

document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Soft cursor glow on devices with a pointer.
const cursorGlow=document.getElementById('cursorGlow');
if(matchMedia('(pointer:fine)').matches){
  addEventListener('pointermove',e=>{
    cursorGlow.style.left=e.clientX+'px';
    cursorGlow.style.top=e.clientY+'px';
    cursorGlow.style.opacity='1';
  });
  addEventListener('pointerleave',()=>cursorGlow.style.opacity='0');
}

// Navigation
const menuToggle=document.getElementById('menuToggle');
const quickNav=document.getElementById('quickNav');
menuToggle.addEventListener('click',()=>quickNav.classList.toggle('open'));
quickNav.querySelectorAll('a').forEach(a=>
  a.addEventListener('click',()=>quickNav.classList.remove('open'))
);

// Envelope open/close
const envelopeButton=document.getElementById('envelopeButton');
const letterMessage=document.getElementById('letterMessage');
const envelopeHint=document.getElementById('envelopeHint');

envelopeButton.addEventListener('click',()=>{
  envelopeButton.classList.add('opened');
  envelopeButton.setAttribute('aria-label','Phong thư đã mở');
  envelopeHint.textContent='LÁ THƯ ĐÃ ĐƯỢC MỞ';
  letterMessage.classList.add('show');
  letterMessage.setAttribute('aria-hidden','false');
  setTimeout(()=>letterMessage.scrollIntoView({
    behavior:'smooth',block:'center'
  }),450);
  addConfetti(innerWidth/2,innerHeight*.48,65);
});

document.getElementById('closeLetter').addEventListener('click',()=>{
  envelopeButton.classList.remove('opened');
  envelopeHint.textContent='NHẤN ĐỂ MỞ THƯ';
  letterMessage.classList.remove('show');
  letterMessage.setAttribute('aria-hidden','true');
});

// Candle interaction
const candles=[...document.querySelectorAll('.candle')];
const wishInstruction=document.getElementById('wishInstruction');
const wishComplete=document.getElementById('wishComplete');

candles.forEach(candle=>candle.addEventListener('click',()=>{
  if(candle.classList.contains('off'))return;
  candle.classList.add('off');
  if(candles.every(c=>c.classList.contains('off'))){
    wishInstruction.textContent='Tất cả nến đã tắt rồi!';
    wishComplete.classList.add('show');
    addConfetti(innerWidth/2,innerHeight*.48,190);
  }
}));

document.getElementById('confettiButton').addEventListener('click',()=>
  addConfetti(innerWidth/2,innerHeight*.4,220)
);

// Gift box
const giftButton=document.getElementById('giftButton');
const giftReveal=document.getElementById('giftReveal');
const giftHint=document.getElementById('giftHint');

giftButton.addEventListener('click',()=>{
  if(giftButton.classList.contains('opened'))return;
  giftButton.classList.add('opened');
  giftHint.textContent='MÓN QUÀ ĐÃ ĐƯỢC MỞ';
  setTimeout(()=>{
    giftReveal.classList.add('show');
    giftReveal.setAttribute('aria-hidden','false');
    giftReveal.scrollIntoView({behavior:'smooth',block:'center'});
    addConfetti(innerWidth/2,innerHeight*.42,260);
  },650);
});

document.getElementById('celebrateAgain').addEventListener('click',()=>
  addConfetti(innerWidth/2,innerHeight*.35,230)
);

// Gallery cards: sample interaction until real photos are added.
document.querySelectorAll('.photo-card').forEach(card=>{
  card.addEventListener('click',()=>{
    card.animate(
      [{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],
      {duration:500,easing:'ease-out'}
    );
    addConfetti(innerWidth/2,innerHeight*.5,35);
  });
});

// Music: browsers require a user gesture before audio playback.
const music=document.getElementById('backgroundMusic');
const musicToggle=document.getElementById('musicToggle');
const soundNote=document.getElementById('soundNote');

musicToggle.addEventListener('click',async()=>{
  if(music.paused){
    try{
      await music.play();
      musicToggle.classList.add('playing');
      musicToggle.setAttribute('aria-label','Tắt nhạc');
      soundNote.textContent='Âm nhạc đang phát';
    }catch(e){
      soundNote.textContent='Thêm file piano.mp3 để phát nhạc';
    }
  }else{
    music.pause();
    musicToggle.classList.remove('playing');
    musicToggle.setAttribute('aria-label','Bật nhạc');
    soundNote.textContent='Âm nhạc đang tắt';
  }
});

// Tiny celebration when the page first loads.
if(!reducedMotion){
  setTimeout(()=>addConfetti(innerWidth/2,innerHeight*.27,35),1100);
}


/* ===== INFINITE MEMORIES CAROUSEL ===== */

document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("photoGallery");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");

    if (!gallery || !nextBtn || !prevBtn) return;

    // Lưu lại 9 ảnh gốc
    const originalItems = Array.from(gallery.children);

    if (originalItems.length === 0) return;

    // Tạo hai bản sao để tạo hiệu ứng vô hạn
    const beforeClones = originalItems.map(item => {
        const clone = item.cloneNode(true);
        clone.dataset.carouselClone = "true";
        return clone;
    });

    const afterClones = originalItems.map(item => {
        const clone = item.cloneNode(true);
        clone.dataset.carouselClone = "true";
        return clone;
    });

    // Thêm bản sao vào đầu và cuối
    beforeClones.reverse().forEach(item => {
        gallery.prepend(item);
    });

    afterClones.forEach(item => {
        gallery.append(item);
    });

    let cycleWidth = 0;
    let isResetting = false;

    function getCycleWidth() {
        return gallery.scrollWidth / 3;
    }

    function jumpTo(position) {
        isResetting = true;

        gallery.style.scrollBehavior = "auto";
        gallery.scrollLeft = position;

        requestAnimationFrame(() => {
            gallery.style.scrollBehavior = "smooth";
            isResetting = false;
        });
    }

    function initializeGallery() {
        cycleWidth = getCycleWidth();

        // Đặt vị trí ban đầu tại bộ 9 ảnh chính giữa
        jumpTo(cycleWidth);
    }

    // Tính khoảng cách chuyển một ảnh
    function getStep() {
        const firstCard = gallery.querySelector(".photo-card");

        if (!firstCard) return 238;

        const style = getComputedStyle(gallery);
        const gap = parseFloat(style.columnGap) || 0;

        return firstCard.getBoundingClientRect().width + gap;
    }

    nextBtn.addEventListener("click", function () {
        gallery.scrollBy({
            left: getStep(),
            behavior: "smooth"
        });
    });

    prevBtn.addEventListener("click", function () {
        gallery.scrollBy({
            left: -getStep(),
            behavior: "smooth"
        });
    });

    // Kiểm tra vị trí để tạo vòng lặp vô hạn
    gallery.addEventListener("scroll", function () {
        if (isResetting) return;

        const position = gallery.scrollLeft;

        if (position < cycleWidth * 0.5) {
            jumpTo(position + cycleWidth);
        }

        if (position > cycleWidth * 1.5) {
            jumpTo(position - cycleWidth);
        }
    });

    // Khởi tạo sau khi trình duyệt tính toán kích thước
    requestAnimationFrame(initializeGallery);

    // Cập nhật khi thay đổi kích thước màn hình
    window.addEventListener("resize", function () {
        cycleWidth = getCycleWidth();
        jumpTo(cycleWidth);
    });
});

