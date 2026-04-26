/* ================================================
   FLX Energy Services — Large Bore Missile System
   GSAP Scroll-Driven Assembly Animation
   Enhanced with particles, HUD callouts, counters
   ================================================ */

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

  // ===== iOS Safari viewport fix (debounced) =====
  function setVH() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }
  setVH();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setVH, 150);
  }, { passive: true });

  // ===== CONFIG =====
  const isMobile = window.innerWidth < 768;
  const isSmallMobile = window.innerWidth < 400;
  const TOTAL_SCROLL = isMobile ? '250vh' : '1200vh';
  const SCRUB_SMOOTHING = isMobile ? 0.5 : 0.8;


  // ============================================================
  //  PARTICLE SYSTEM (Hero background)
  // ============================================================
  (function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    const PARTICLE_COUNT = isSmallMobile ? 20 : isMobile ? 40 : 80;

    function resize() {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: Math.random() * 2.2 + 0.2,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.18 - 0.12,
        opacity: Math.random() * 0.6 + 0.08,
        pulse: Math.random() * Math.PI * 2,
        // Futuristic: some particles are brighter "energy sparks"
        isSpark: Math.random() > 0.85,
      };
    }

    function init() {
      resize();
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.015;

        // Wrap around
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(57, 255, 20, ${alpha})`;
        ctx.fill();

        // Enhanced glow for all visible particles
        if (p.size > 0.8) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(57, 255, 20, ${alpha * 0.06})`;
          ctx.fill();
        }

        // Extra bright energy sparks with larger glow halo
        if (p.isSpark) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(57, 255, 20, ${alpha * 0.04})`;
          ctx.fill();
          // White-hot center
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 255, 200, ${alpha * 0.5})`;
          ctx.fill();
        }
      });

      // Draw connection lines between close particles (enhanced network effect)
      if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
              const lineAlpha = 0.05 * (1 - dist / 140);
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(57, 255, 20, ${lineAlpha})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    init();
    draw();

    let particleResizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(particleResizeTimer);
      particleResizeTimer = setTimeout(resize, 200);
    }, { passive: true });

    // Pause particles when hero is out of view
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      onLeave: () => { cancelAnimationFrame(animationId); },
      onEnterBack: () => { draw(); },
    });
  })();


  // ============================================================
  //  HERO ENTRANCE ANIMATIONS
  // ============================================================
  const heroTl = gsap.timeline({ delay: 0.3 });

  heroTl
    .from('.hero-brand', { y: -20, opacity: 0, duration: 0.8, ease: 'power2.out' })
    .from('.hero-eyebrow', { y: -15, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .from('.hero-section h1', { y: 30, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.3')
    .from('.hero-subtitle', { opacity: 0, duration: 0.6, ease: 'power1.out' }, '-=0.4')
    .from('.hero-stats', { y: 20, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.2')
    .from('.hero-stat', {
      y: 10, opacity: 0, duration: 0.5,
      stagger: 0.1, ease: 'power1.out'
    }, '-=0.4')
    .from('.scroll-indicator', { opacity: 0, y: 15, duration: 0.6, ease: 'power1.out' }, '-=0.2');


  // ============================================================
  //  REDUCED MOTION CHECK
  // ============================================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    gsap.set('#cta-section', { opacity: 1, y: 0 });
    gsap.set('#label-text-mask', { attr: { width: 340 } });
    gsap.set('#progress-fill', { height: '100%' });
    gsap.set('.advantage-item', { opacity: 1, x: 0 });
    return;
  }


  // ============================================================
  //  GPU ACCELERATION (limit on mobile to save VRAM)
  // ============================================================
  const gpuSelector = isMobile
    ? '#body-section-a, #body-section-b, #body-section-c, #coupler-front, #coupler-rear, #nozzle-endcap, #skid-frame'
    : '#missile-svg g[id]';
  gsap.set(gpuSelector, {
    willChange: 'transform, opacity',
    force3D: true,
  });


  // ============================================================
  //  HOSE PATH LENGTHS (for draw-on animation)
  // ============================================================
  const hosePaths = ['#hose-1', '#hose-2', '#hose-3', '#hose-4'];
  const hoseLengths = {};
  hosePaths.forEach(function(id) {
    var path = document.querySelector(id);
    if (path) {
      var len = path.getTotalLength();
      hoseLengths[id] = len;
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      var highlight = path.nextElementSibling;
      if (highlight && highlight.tagName === 'path') {
        gsap.set(highlight, { strokeDasharray: len, strokeDashoffset: len });
      }
    }
  });


  // ============================================================
  //  ELEMENT SELECTORS
  // ============================================================
  const el = {
    bodyA:         '#body-section-a',
    bodyB:         '#body-section-b',
    bodyC:         '#body-section-c',
    couplerFront:  '#coupler-front',
    couplerRear:   '#coupler-rear',
    clampFront:    '#clamp-front',
    clampRear:     '#clamp-rear',
    hoseRestraint: '#hose-restraint',
    nozzle:        '#nozzle-endcap',
    portFitting1:  '#port-fitting-1',
    portFitting2:  '#port-fitting-2',
    fasteners:     '#fasteners-bolts',
    labelPlate:    '#label-plate',
    skidFrame:     '#skid-frame',
    hoseGroup:     '#hose-connections',
    glowPoints:    '#glow-points',
  };


  // ============================================================
  //  INITIAL EXPLODED STATE
  // ============================================================
  gsap.set(el.bodyA, { x: -220, y: -80, opacity: 0.5 });
  gsap.set(el.bodyB, { x: 0,    y: 140, opacity: 0.5 });
  gsap.set(el.bodyC, { x: 220,  y: -80, opacity: 0.5 });

  gsap.set(el.couplerFront, { x: -320, y: 0, opacity: 0.4 });
  gsap.set(el.couplerRear,  { x: 320,  y: 0, opacity: 0.4 });

  gsap.set(el.clampFront, { x: -280, y: -60, scaleY: 1.4, opacity: 0.3, transformOrigin: 'center center' });
  gsap.set(el.clampRear,  { x: 280,  y: 60,  scaleY: 1.4, opacity: 0.3, transformOrigin: 'center center' });

  gsap.set(el.hoseRestraint, { x: 0, y: -180, opacity: 0.3, transformOrigin: 'center bottom' });

  gsap.set(el.nozzle, { x: 280, y: 100, rotation: -30, opacity: 0.3, transformOrigin: 'left center' });

  gsap.set(el.portFitting1, { x: -80, y: -160, rotation: 25, opacity: 0.3, transformOrigin: 'center bottom' });
  gsap.set(el.portFitting2, { x: 80,  y: -160, rotation: -25, opacity: 0.3, transformOrigin: 'center bottom' });

  gsap.set('.bolt-front', { y: -30, opacity: 0, scale: 0.3, transformOrigin: 'center center' });
  gsap.set('.bolt-rear',  { y: -30, opacity: 0, scale: 0.3, transformOrigin: 'center center' });

  gsap.set(el.skidFrame, { y: 120, opacity: 0, transformOrigin: 'center top' });

  gsap.set(el.hoseGroup, { opacity: 0 });
  gsap.set('.hose-node', { opacity: 0, scale: 0, transformOrigin: 'center center' });

  gsap.set('.glow-dot', { opacity: 0, scale: 0, transformOrigin: 'center center' });

  gsap.set(el.labelPlate, { y: 60, opacity: 0 });
  gsap.set('#label-text-mask', { attr: { width: 0 } });

  gsap.set('#cta-section', { opacity: 0, y: 50 });

  // HUD callouts start hidden
  gsap.set('#hud-callouts-svg > g', { opacity: 0, y: 15 });


  // ============================================================
  //  STAGE NAMES & PROGRESS TRACKING
  // ============================================================
  const stageNames = [
    'Exploded View',
    'Pipe Formation',
    'Pump Ports Install',
    'Valves Attach',
    'Skid Frame Lock',
    'Hoses Connect',
    'Final Lock',
    'Hero State'
  ];
  const stageIndicator = document.getElementById('stage-indicator');
  const progressFill = document.getElementById('progress-fill');
  const progressLabel = document.getElementById('progress-label');

  function updateProgress(progress) {
    var stageIndex;
    if (progress < 0.05)      stageIndex = 0;
    else if (progress < 0.15) stageIndex = 1;
    else if (progress < 0.22) stageIndex = 2;
    else if (progress < 0.30) stageIndex = 3;
    else if (progress < 0.38) stageIndex = 4;
    else if (progress < 0.80) stageIndex = 5;
    else if (progress < 0.95) stageIndex = 6;
    else                      stageIndex = 7;

    if (stageIndicator) {
      stageIndicator.textContent = 'Stage ' + stageIndex + ' \u2014 ' + stageNames[stageIndex];
    }
    if (progressFill) {
      progressFill.style.height = (progress * 100).toFixed(1) + '%';
    }
    if (progressLabel) {
      progressLabel.textContent = Math.round(progress * 100) + '%';
    }
  }


  // ============================================================
  //  MASTER TIMELINE
  // ============================================================
  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#assembly-viewport',
      pin: true,
      start: 'top top',
      end: '+=' + TOTAL_SCROLL,
      scrub: SCRUB_SMOOTHING,
      anticipatePin: 1,
      onUpdate: function(self) { updateProgress(self.progress); },
    }
  });


  // ============================================================
  //  EXPLODED HOLD (0–5 units)
  // ============================================================
  tl.addLabel('exploded');

  // Hold the exploded view for 5 timeline units (no animation, just dwell time)
  tl.to({}, { duration: 5 }, 'exploded');

  // Tech overlays fade in during exploded view (desktop only)
  if (!isMobile) {
    tl.to('#holo-wireframe', { opacity: 1, duration: 4, ease: 'power1.inOut' }, 'exploded+=1');
    tl.to('#dimension-lines', { opacity: 1, duration: 3, ease: 'power1.inOut' }, 'exploded+=2');
    tl.to('#data-readouts', { opacity: 1, duration: 3, ease: 'power1.inOut' }, 'exploded+=3');
  }


  // ============================================================
  //  STAGE 1 — PIPE FORMATION (5–15 units)
  // ============================================================
  tl.addLabel('stage1', 5);

  tl.to(el.bodyB, {
    x: 0, y: 0, opacity: 1,
    duration: 8, ease: 'power2.out',
  }, 'stage1');

  tl.to(el.bodyA, {
    x: 0, y: 0, opacity: 1,
    duration: 8, ease: 'power2.out',
  }, 'stage1+=1');

  tl.to(el.bodyC, {
    x: 0, y: 0, opacity: 1,
    duration: 8, ease: 'power2.out',
  }, 'stage1+=1');

  // Snap overshoot
  tl.to(el.bodyA, { x: 4, duration: 0.3, ease: 'power3.out' }, 'stage1+=8');
  tl.to(el.bodyA, { x: 0, duration: 1, ease: 'elastic.out(1, 0.5)' }, 'stage1+=8.3');
  tl.to(el.bodyC, { x: -4, duration: 0.3, ease: 'power3.out' }, 'stage1+=8');
  tl.to(el.bodyC, { x: 0, duration: 1, ease: 'elastic.out(1, 0.5)' }, 'stage1+=8.3');

  // HUD Callout — Stage 1
  tl.to('#callout-stage1-svg', { opacity: 1, y: 0, duration: 2, ease: 'power2.out' }, 'stage1+=6');
  tl.to('#callout-stage1-svg', { opacity: 0, y: -10, duration: 2, ease: 'power1.in' }, 'stage1+=12');


  // ============================================================
  //  STAGE 2 — PUMP PORTS INSTALL (15–22 units)
  // ============================================================
  tl.addLabel('stage2', 15);

  tl.to(el.portFitting1, {
    x: 0, y: 0, rotation: 0, opacity: 1,
    duration: 5, ease: 'back.out(2.0)',
  }, 'stage2');

  tl.to(el.portFitting2, {
    x: 0, y: 0, rotation: 0, opacity: 1,
    duration: 5, ease: 'back.out(2.0)',
  }, 'stage2+=1.5');

  tl.to(el.portFitting1, { rotation: 5, duration: 0.5, ease: 'power1.inOut' }, 'stage2+=5');
  tl.to(el.portFitting1, { rotation: 0, duration: 1, ease: 'elastic.out(1, 0.3)' }, 'stage2+=5.5');

  tl.to(el.portFitting2, { rotation: -5, duration: 0.5, ease: 'power1.inOut' }, 'stage2+=5.5');
  tl.to(el.portFitting2, { rotation: 0, duration: 1, ease: 'elastic.out(1, 0.3)' }, 'stage2+=6');

  // HUD Callout — Stage 2
  tl.to('#callout-stage2-svg', { opacity: 1, y: 0, duration: 2, ease: 'power2.out' }, 'stage2+=2');
  tl.to('#callout-stage2-svg', { opacity: 0, y: -10, duration: 1.5, ease: 'power1.in' }, 'stage2+=6');


  // ============================================================
  //  STAGE 3 — VALVES ATTACH (22–30 units)
  // ============================================================
  tl.addLabel('stage3', 22);

  tl.to(el.couplerFront, {
    x: 0, y: 0, opacity: 1,
    duration: 5, ease: 'power2.inOut',
  }, 'stage3');

  tl.to(el.couplerRear, {
    x: 0, y: 0, opacity: 1,
    duration: 5, ease: 'power2.inOut',
  }, 'stage3+=0.5');

  tl.to(el.nozzle, {
    x: 0, y: 0, rotation: 0, opacity: 1,
    duration: 6, ease: 'power2.inOut',
  }, 'stage3+=1');

  tl.to(el.hoseRestraint, {
    y: -15, opacity: 0.8,
    duration: 3, ease: 'power1.inOut',
  }, 'stage3+=3');
  tl.to(el.hoseRestraint, {
    y: 0, opacity: 1,
    duration: 2, ease: 'power3.out',
  }, 'stage3+=5.5');

  // HUD Callout — Stage 3
  tl.to('#callout-stage3-svg', { opacity: 1, y: 0, duration: 2, ease: 'power2.out' }, 'stage3+=2');
  tl.to('#callout-stage3-svg', { opacity: 0, y: -10, duration: 1.5, ease: 'power1.in' }, 'stage3+=7');


  // ============================================================
  //  STAGE 4 — SKID FRAME LOCK (30–38 units)
  // ============================================================
  tl.addLabel('stage4', 30);

  tl.to(el.skidFrame, {
    y: 0, opacity: 1,
    duration: 5, ease: 'power2.out',
  }, 'stage4');

  tl.to(el.skidFrame, { y: -3, duration: 0.3, ease: 'power3.out' }, 'stage4+=5');
  tl.to(el.skidFrame, { y: 0, duration: 1.5, ease: 'elastic.out(1, 0.5)' }, 'stage4+=5.3');

  // HUD Callout — Stage 4
  tl.to('#callout-stage4-svg', { opacity: 1, y: 0, duration: 2, ease: 'power2.out' }, 'stage4+=2');
  tl.to('#callout-stage4-svg', { opacity: 0, y: 10, duration: 1.5, ease: 'power1.in' }, 'stage4+=7');

  // Fade out tech overlays as assembly completes
  if (!isMobile) {
    tl.to('#holo-wireframe', { opacity: 0, duration: 6, ease: 'power1.inOut' }, 'stage4');
    tl.to('#dimension-lines', { opacity: 0, duration: 5, ease: 'power1.inOut' }, 'stage4+=2');
    tl.to('#data-readouts', { opacity: 0, duration: 5, ease: 'power1.inOut' }, 'stage4+=3');
  }


  // ============================================================
  //  STAGE 5 — HOSES CONNECT (38–80 units)
  // ============================================================
  tl.addLabel('stage5', 38);

  tl.to(el.hoseGroup, { opacity: 1, duration: 1 }, 'stage5');

  // Hose 1
  (function() {
    var h1 = document.querySelector('#hose-1');
    var h1h = h1 ? h1.nextElementSibling : null;
    if (h1 && hoseLengths['#hose-1']) {
      tl.to(h1, { strokeDashoffset: 0, duration: 8, ease: 'power1.inOut' }, 'stage5+=1');
      if (h1h && h1h.tagName === 'path') {
        tl.to(h1h, { strokeDashoffset: 0, duration: 8, ease: 'power1.inOut' }, 'stage5+=1');
      }
    }
  })();

  tl.to('#hose-connections .hose-node:nth-of-type(1)', {
    opacity: 1, scale: 1, duration: 1, ease: 'back.out(2)',
  }, 'stage5+=1');
  tl.to('#hose-connections .hose-node:nth-of-type(2)', {
    opacity: 1, scale: 1, duration: 1, ease: 'back.out(2)',
  }, 'stage5+=8');

  // Hose 2
  (function() {
    var h2 = document.querySelector('#hose-2');
    var h2h = h2 ? h2.nextElementSibling : null;
    if (h2 && hoseLengths['#hose-2']) {
      tl.to(h2, { strokeDashoffset: 0, duration: 10, ease: 'power1.inOut' }, 'stage5+=10');
      if (h2h && h2h.tagName === 'path') {
        tl.to(h2h, { strokeDashoffset: 0, duration: 10, ease: 'power1.inOut' }, 'stage5+=10');
      }
    }
  })();

  tl.to('#hose-connections .hose-node:nth-of-type(3)', {
    opacity: 1, scale: 1, duration: 1, ease: 'back.out(2)',
  }, 'stage5+=19');

  // Hose 3
  (function() {
    var h3 = document.querySelector('#hose-3');
    var h3h = h3 ? h3.nextElementSibling : null;
    if (h3 && hoseLengths['#hose-3']) {
      tl.to(h3, { strokeDashoffset: 0, duration: 10, ease: 'power1.inOut' }, 'stage5+=21');
      if (h3h && h3h.tagName === 'path') {
        tl.to(h3h, { strokeDashoffset: 0, duration: 10, ease: 'power1.inOut' }, 'stage5+=21');
      }
    }
  })();

  tl.to('#hose-connections .hose-node:nth-of-type(4)', {
    opacity: 1, scale: 1, duration: 1, ease: 'back.out(2)',
  }, 'stage5+=30');

  // Hose 4
  (function() {
    var h4 = document.querySelector('#hose-4');
    var h4h = h4 ? h4.nextElementSibling : null;
    if (h4 && hoseLengths['#hose-4']) {
      tl.to(h4, { strokeDashoffset: 0, duration: 8, ease: 'power1.inOut' }, 'stage5+=32');
      if (h4h && h4h.tagName === 'path') {
        tl.to(h4h, { strokeDashoffset: 0, duration: 8, ease: 'power1.inOut' }, 'stage5+=32');
      }
    }
  })();

  tl.to('#hose-connections .hose-node:nth-of-type(5)', {
    opacity: 1, scale: 1, duration: 1, ease: 'back.out(2)',
  }, 'stage5+=39');

  // HUD Callout — Stage 5 (stays longer since this is the big stage)
  tl.to('#callout-stage5-svg', { opacity: 1, y: 0, duration: 3, ease: 'power2.out' }, 'stage5+=5');
  tl.to('#callout-stage5-svg', { opacity: 0, y: -10, duration: 3, ease: 'power1.in' }, 'stage5+=35');


  // ============================================================
  //  STAGE 6 — FINAL LOCK (80–95 units)
  // ============================================================
  tl.addLabel('stage6', 80);

  tl.to(el.clampFront, {
    x: 0, y: 0, scaleY: 1, opacity: 1,
    duration: 4, ease: 'back.out(1.4)',
  }, 'stage6');

  tl.to(el.clampRear, {
    x: 0, y: 0, scaleY: 1, opacity: 1,
    duration: 4, ease: 'back.out(1.4)',
  }, 'stage6+=1');

  tl.to('.bolt-front', {
    opacity: 1, scale: 1, y: 0,
    duration: 2, ease: 'power1.out',
    stagger: 0.3,
  }, 'stage6+=4');

  tl.to('.bolt-rear', {
    opacity: 1, scale: 1, y: 0,
    duration: 2, ease: 'power1.out',
    stagger: 0.3,
  }, 'stage6+=5');

  // Coupler lock pulse
  tl.to([el.couplerFront, el.couplerRear], {
    scaleX: 1.03, duration: 0.4, transformOrigin: 'center center',
  }, 'stage6+=7');
  tl.to([el.couplerFront, el.couplerRear], {
    scaleX: 1, duration: 1.2, ease: 'elastic.out(1, 0.4)',
  }, 'stage6+=7.4');

  // Green glow dots
  tl.to('.glow-dot', {
    opacity: 1, scale: 1.5,
    duration: 3, stagger: 0.3,
    ease: 'power1.out',
  }, 'stage6+=8');

  // Nozzle glow
  if (!isMobile) {
    tl.to(el.nozzle, {
      filter: 'url(#greenGlow)',
      duration: 2, ease: 'power1.in',
    }, 'stage6+=10');
    tl.to(el.nozzle, {
      filter: 'none',
      duration: 3, ease: 'power1.out',
    }, 'stage6+=12');
  } else {
    tl.to('#nozzle-endcap polygon', {
      stroke: '#39FF14', strokeWidth: 3,
      duration: 2,
    }, 'stage6+=10');
    tl.to('#nozzle-endcap polygon', {
      stroke: '#2a2d35', strokeWidth: 1.5,
      duration: 3,
    }, 'stage6+=13');
  }

  tl.to('.glow-dot', {
    scale: 1,
    duration: 2, ease: 'power1.inOut',
  }, 'stage6+=12');

  // HUD Callout — Stage 6 (big highlight callout)
  tl.to('#callout-stage6-svg', { opacity: 1, y: 0, scale: 1, duration: 3, ease: 'power2.out' }, 'stage6+=9');
  tl.to('#callout-stage6-svg', { opacity: 0, duration: 2, ease: 'power1.in' }, 'stage6+=13');


  // ============================================================
  //  STAGE 7 — HERO STATE (95–100 units)
  // ============================================================
  tl.addLabel('stage7', 95);

  tl.to(el.labelPlate, {
    y: 0, opacity: 1,
    duration: 3, ease: 'power1.out',
  }, 'stage7');

  tl.to('#label-text-mask', {
    attr: { width: 340 },
    duration: 4, ease: 'power1.inOut',
  }, 'stage7+=0.5');

  tl.to('#missile-svg', {
    scale: 1.04,
    duration: 4, ease: 'power1.inOut',
    transformOrigin: 'center center',
  }, 'stage7+=1');

  tl.to('#cta-section', {
    opacity: 1, y: 0,
    duration: 3, ease: 'power1.out',
  }, 'stage7+=3');

  tl.to('#stage-indicator', {
    opacity: 0,
    duration: 2,
  }, 'stage7+=3');


  // ============================================================
  //  CLEANUP: Remove will-change
  // ============================================================
  ScrollTrigger.create({
    trigger: '#assembly-viewport',
    start: 'top top',
    end: '+=' + TOTAL_SCROLL,
    onLeave: function() {
      gsap.set(gpuSelector, { willChange: 'auto' });
    },
    onEnterBack: function() {
      gsap.set(gpuSelector, { willChange: 'transform, opacity' });
    }
  });


  // ============================================================
  //  SPEC COUNTER ANIMATION (scroll-triggered count-up)
  // ============================================================
  const specNumbers = document.querySelectorAll('.spec-number');

  if (specNumbers.length > 0) {
    // Set initial state explicitly so the entrance tween is deterministic
    // even if the section was offscreen when the script first ran.
    gsap.set('.spec-card', { y: 40, opacity: 0 });

    ScrollTrigger.create({
      trigger: '#specs-section',
      start: 'top 75%',
      once: true,
      onEnter: function() {
        specNumbers.forEach(function(el) {
          const target = parseInt(el.getAttribute('data-count'), 10);
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: target > 1000 ? 2.5 : 1.5,
            ease: 'power2.out',
            onUpdate: function() {
              el.textContent = Math.round(obj.val).toLocaleString();
            }
          });
        });

        // Animate spec cards in (fromTo with explicit values — guarantees
        // every card reaches opacity:1 regardless of computed-style state)
        gsap.to('.spec-card', {
          y: 0, opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
        });
      }
    });
  }


  // ============================================================
  //  ADVANTAGES SECTION ANIMATION
  // ============================================================
  const advantageItems = document.querySelectorAll('.advantage-item');

  if (advantageItems.length > 0) {
    ScrollTrigger.create({
      trigger: '#advantages-section',
      start: 'top 70%',
      once: true,
      onEnter: function() {
        // Animate negative items from left
        gsap.to('.advantage-negative', {
          opacity: 1, x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
        });

        // Animate positive items from right (staggered after negatives)
        gsap.to('.advantage-positive', {
          opacity: 1, x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.3,
        });

        // VS badge pulse
        gsap.from('.vs-badge', {
          scale: 0, opacity: 0,
          duration: 0.8,
          ease: 'back.out(2)',
          delay: 0.5,
        });
      }
    });
  }

  // Set initial states for advantage items
  gsap.set('.advantage-negative', { opacity: 0, x: -20 });
  gsap.set('.advantage-positive', { opacity: 0, x: 20 });


  // ============================================================
  //  AMBIENT GLOW PULSE (after assembly completes)
  // ============================================================
  ScrollTrigger.create({
    trigger: '#cta-section',
    start: 'top 80%',
    once: true,
    onEnter: function() {
      // Subtle pulsing on glow dots (enhanced multi-layer)
      gsap.to('.glow-dot', {
        scale: 1.4,
        opacity: 0.9,
        duration: 1.8,
        stagger: { each: 0.15, repeat: -1, yoyo: true },
        ease: 'sine.inOut',
      });

      // Ambient energy pulse on green LED status lights
      gsap.to('#skid-frame circle[fill="#39FF14"]', {
        opacity: 0.9,
        duration: 1.2,
        stagger: { each: 0.3, repeat: -1, yoyo: true },
        ease: 'sine.inOut',
      });
    }
  });


  // ============================================================
  //  AMBIENT LIGHT SWEEP ON MISSILE (subtle shimmer effect)
  // ============================================================
  if (!isMobile) {
    ScrollTrigger.create({
      trigger: '#assembly-viewport',
      start: 'top top',
      end: '+=' + TOTAL_SCROLL,
      onEnter: function() {
        // Subtle continuous ambient shimmer on body sections
        gsap.to('#energy-scanline', {
          y: -20,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        gsap.to('#energy-scanline', {
          opacity: 0.1,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      },
      onLeave: function() {
        gsap.killTweensOf('#energy-scanline');
      },
      onEnterBack: function() {
        gsap.to('#energy-scanline', {
          y: -20, duration: 4,
          repeat: -1, yoyo: true, ease: 'sine.inOut',
        });
      }
    });
  }

});
