/* ── HERO GRID CANVAS ──────────────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('grid-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.008;

    const COLS = 22, ROWS = 18;
    const cw = W / COLS, ch = H / ROWS;

    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        const nx = (c / COLS) * 2 - 1;
        const ny = (r / ROWS) * 2 - 1;
        const dist = Math.sqrt(nx * nx + ny * ny);
        const wave = Math.cos(dist * 5 - t * 3) * Math.exp(-dist * 1.2);
        const y = r * ch + wave * 22;
        const x = c * cw;

        const brightness = 0.15 + 0.85 * Math.max(0, wave);
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,${Math.floor(255 * brightness)},${Math.floor(136 * brightness)},${0.3 + 0.5 * Math.max(0, wave)})`;
        ctx.fill();
      }
    }

    // horizontal grid lines
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      for (let c = 0; c <= COLS; c++) {
        const nx = (c / COLS) * 2 - 1;
        const ny = (r / ROWS) * 2 - 1;
        const dist = Math.sqrt(nx * nx + ny * ny);
        const wave = Math.cos(dist * 5 - t * 3) * Math.exp(-dist * 1.2);
        const px = c * cw, py = r * ch + wave * 22;
        c === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(0,255,136,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── WAVE DEMO CANVAS ──────────────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('wave-canvas');
  const ctx = canvas.getContext('2d');
  const SIZE = 460;
  const N = 40;
  let t = 0;

  function gaussian_wave(x, z, t) {
    const r = Math.sqrt(x * x + z * z);
    const w = 2.0;
    const g = Math.exp(-(r * r) / (2 * w * w));
    return g * Math.cos(4 * r - t * 5);
  }

  // isometric projection
  const ISO_X = [1, -1];
  const ISO_Y = [0.5, 0.5];
  const SCALE = 5.5;
  const OX = SIZE / 2, OY = SIZE * 0.62;

  function project(x, y, z) {
    return [
      OX + (x * ISO_X[0] + z * ISO_X[1]) * SCALE,
      OY + (x * ISO_Y[0] + z * ISO_Y[1]) * SCALE - y * SCALE * 1.4
    ];
  }

  function hsl(val) {
    const t2 = (val + 1) / 2;
    const r = Math.floor(25 + t2 * 25);
    const g = Math.floor(120 + t2 * 135);
    const b = Math.floor(80 + t2 * 40);
    return `rgb(${r},${g},${b})`;
  }

  function draw() {
    t += 0.025;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#070c14';
    ctx.fillRect(0, 0, SIZE, SIZE);

    const range = [];
    for (let i = 0; i < N; i++) range.push(-5 + (i / (N - 1)) * 10);

    const pts = [];
    for (let ri = 0; ri < N; ri++) {
      pts[ri] = [];
      for (let ci = 0; ci < N; ci++) {
        const x = range[ci], z = range[ri];
        const y = gaussian_wave(x, z, t);
        pts[ri][ci] = { x, y, z, proj: project(x, y, z) };
      }
    }

    // draw back-to-front (painter's algorithm, rough)
    for (let ri = N - 1; ri >= 0; ri--) {
      for (let ci = N - 1; ci >= 0; ci--) {
        const p = pts[ri][ci];
        const alpha = 0.55;

        if (ci < N - 1) {
          const p2 = pts[ri][ci + 1];
          ctx.beginPath();
          ctx.moveTo(...p.proj);
          ctx.lineTo(...p2.proj);
          ctx.strokeStyle = hsl(p.y);
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        if (ri < N - 1) {
          const p2 = pts[ri + 1][ci];
          ctx.beginPath();
          ctx.moveTo(...p.proj);
          ctx.lineTo(...p2.proj);
          ctx.strokeStyle = hsl(p.y);
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── INTERSECTION OBSERVER ─────────────────────────────────────────────── */
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i * 0.08) + 's';
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

/* ── NAVBAR ────────────────────────────────────────────────────────────── */
(function () {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks  = document.getElementById('nav-links');

  // Scroll → frosted glass style
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on nav link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });
})();