/* ══════════════════════════════════════════════
   UniConecta — App Logic & Animations
   ══════════════════════════════════════════════ */

// ── State ──
let currentSlide = 0;
const totalSlides = 7;
let isTransitioning = false;

// ── DOM Elements ──
const splash = document.getElementById('splash');
const app = document.getElementById('app');
const progressBar = document.getElementById('progressBar');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const navDots = document.getElementById('navDots');
const navCounter = document.getElementById('navCounter');

// ══════════════════════════════════════════════
// PARTICLES SYSTEM
// ══════════════════════════════════════════════

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.pulseSpeed = Math.random() * 0.02 + 0.005;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.hue = Math.random() > 0.5 ? 270 : 190; // purple or cyan
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.pulsePhase += this.pulseSpeed;
    this.currentOpacity = this.opacity * (0.5 + 0.5 * Math.sin(this.pulsePhase));

    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.currentOpacity})`;
    ctx.fill();
  }
}

function initParticles() {
  resizeCanvas();
  const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
  particles = Array.from({ length: count }, () => new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const opacity = (1 - dist / 150) * 0.12;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  drawConnections();
  animationId = requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => {
  resizeCanvas();
});

initParticles();
animateParticles();

// ══════════════════════════════════════════════
// SPLASH → APP TRANSITION
// ══════════════════════════════════════════════

function enterApp() {
  splash.classList.remove('splash--returned');
  splash.classList.add('splash--exit');

  setTimeout(() => {
    splash.style.display = 'none';
    app.classList.add('app--visible');
    showSlide(0);
    buildNavDots();
    updateProgress();
  }, 1000);
}

function backToSplash() {
  app.classList.remove('app--visible');
  splash.style.display = 'flex';
  splash.classList.add('splash--returned');
  requestAnimationFrame(() => {
    splash.classList.remove('splash--exit');
  });
}

// ══════════════════════════════════════════════
// SLIDE NAVIGATION
// ══════════════════════════════════════════════

function showSlide(index) {
  if (isTransitioning) return;
  isTransitioning = true;

  const slides = document.querySelectorAll('.slide');

  slides.forEach((slide, i) => {
    slide.classList.remove('slide--active', 'slide--past', 'slide--future');
    if (i === index) {
      slide.classList.add('slide--active');
      slide.scrollTop = 0; // Reset scroll position when showing slide
    } else if (i < index) {
      slide.classList.add('slide--past');
    } else {
      slide.classList.add('slide--future');
    }
  });

  currentSlide = index;
  updateNavState();
  updateProgress();

  setTimeout(() => {
    isTransitioning = false;
  }, 400);
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    showSlide(currentSlide + 1);
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    showSlide(currentSlide - 1);
  } else if (currentSlide === 0) {
    backToSplash();
  }
}

function goToSlide(index) {
  if (index !== currentSlide) {
    showSlide(index);
  }
}

// ── Navigation State ──
function updateNavState() {
  prevBtn.disabled = false;
  nextBtn.disabled = currentSlide === totalSlides - 1;
  navCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;

  document.querySelectorAll('.nav-dot').forEach((dot, i) => {
    dot.classList.toggle('nav-dot--active', i === currentSlide);
  });
}

function buildNavDots() {
  navDots.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = `nav-dot${i === 0 ? ' nav-dot--active' : ''}`;
    dot.setAttribute('aria-label', `Ir a sección ${i + 1}`);
    dot.onclick = () => goToSlide(i);
    navDots.appendChild(dot);
  }
}

function updateProgress() {
  const pct = ((currentSlide + 1) / totalSlides) * 100;
  progressBar.style.width = `${pct}%`;
}

// ══════════════════════════════════════════════
// KEYBOARD NAVIGATION
// ══════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
  // If splash is still visible, Enter triggers enterApp
  if (splash.style.display !== 'none' && !splash.classList.contains('splash--exit')) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      enterApp();
      return;
    }
  }

  // Only use Left/Right arrows for slide changes so Up/Down arrows can scroll vertically
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSlide();
  }
});

// ── Touch / Swipe Support ──
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  // Only horizontal swipes trigger slide changes, vertical swipes scroll naturally
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    if (dx < 0) nextSlide();
    else prevSlide();
  }
}, { passive: true });

// ══════════════════════════════════════════════
// PRELOADER — ensure fonts loaded
// ══════════════════════════════════════════════

document.fonts.ready.then(() => {
  document.body.style.opacity = '1';
});
