document.addEventListener('DOMContentLoaded', () => {

  // ══════════════════════════════════
  //  EXISTING FUNCTIONALITY (preserved)
  // ══════════════════════════════════

  // ── Scroll reveal ──
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

  // ── Nav scroll ──
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // ── Mobile menu ──
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  ham.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    ham.classList.toggle('active', open);
    ham.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      ham.classList.remove('active');
      ham.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ── Smooth scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
      }
    });
  });

  // ── Active nav highlight ──
  const sections = document.querySelectorAll('section[id], header[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.id; });
    links.querySelectorAll('a:not(.nav-cta)').forEach(a => {
      const active = a.getAttribute('href') === '#' + current;
      a.style.color = active ? 'var(--white)' : '';
    });
  }, { passive: true });

  // ── Contact form ──
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Submitted ✓';
      btn.style.background = '#1a6e3c';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    });
  }


  // ══════════════════════════════════
  //  1. TEXT SCRAMBLE EFFECT
  // ══════════════════════════════════

  const heroH1 = document.querySelector('.hero h1');
  if (heroH1) {
    const chars = '@#$%&*!<>[]{}=+~^|ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const textNodes = [];

    function walkText(node) {
      if (node.nodeType === 3 && node.textContent.trim().length > 0) {
        textNodes.push(node);
      } else {
        node.childNodes.forEach(walkText);
      }
    }
    walkText(heroH1);

    const totalChars = textNodes.reduce((sum, n) => sum + n.textContent.length, 0);
    const duration = 1800;
    const startTime = performance.now();
    const originalTexts = textNodes.map(n => n.textContent);

    // Lock exact bounding box so random wide characters during scramble don't force word-wraps that push content below it up/down
    heroH1.style.height = heroH1.offsetHeight + 'px';
    heroH1.style.width = heroH1.offsetWidth + 'px';

    function scrambleStep(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const resolvedCount = Math.floor(progress * totalChars);

      let charIndex = 0;
      textNodes.forEach((node, i) => {
        const original = originalTexts[i];
        let result = '';
        for (let j = 0; j < original.length; j++) {
          if (charIndex < resolvedCount) {
            result += original[j];
          } else if (original[j] === ' ') {
            result += ' ';
          } else {
            result += chars[Math.floor(Math.random() * chars.length)];
          }
          charIndex++;
        }
        node.textContent = result;
      });

      if (progress < 1) {
        requestAnimationFrame(scrambleStep);
      } else {
        // Unlock dimensions once original text is fully restored
        heroH1.style.height = '';
        heroH1.style.width = '';
      }
    }

    setTimeout(() => requestAnimationFrame(scrambleStep), 200);
  }


  // ══════════════════════════════════
  //  2. LERP CURSOR FOLLOWER
  //     Lerp 0.20, no CSS transitions
  // ══════════════════════════════════

  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (isFinePointer) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    // Ring dimensions for JS-based hover scaling (no CSS transitions)
    let ringW = 36, ringH = 36;
    let targetRingW = 36, targetRingH = 36;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseover', e => {
      if (e.target.closest('a, button, .btn, input, select, textarea, [role="button"]')) {
        dot.classList.add('hovering');
        ring.classList.add('hovering');
        targetRingW = 52;
        targetRingH = 52;
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('a, button, .btn, input, select, textarea, [role="button"]')) {
        dot.classList.remove('hovering');
        ring.classList.remove('hovering');
        targetRingW = 36;
        targetRingH = 36;
      }
    });

    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });

    function cursorLoop() {
      // Dot follows instantly
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';

      // Ring follows with lerp 0.20
      ringX += (mouseX - ringX) * 0.20;
      ringY += (mouseY - ringY) * 0.20;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';

      // Smoothly animate ring size via JS (since we removed CSS transitions)
      ringW += (targetRingW - ringW) * 0.15;
      ringH += (targetRingH - ringH) * 0.15;
      ring.style.width = ringW + 'px';
      ring.style.height = ringH + 'px';

      requestAnimationFrame(cursorLoop);
    }
    requestAnimationFrame(cursorLoop);
  }


  // ══════════════════════════════════
  //  3. HERO CANVAS: THREAT NETWORK GRAPH
  // ══════════════════════════════════
  //
  //  60 nodes, sparse KNN connections (2-4 neighbors),
  //  5-8 active pulsing nodes, cursor highlights nearest node.
  //  No repulsion, no explosion. Clean highlight.
  //

  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const canvas = document.createElement('canvas');
    canvas.id = 'heroCanvas';
    heroSection.insertBefore(canvas, heroSection.firstChild);

    const ctx = canvas.getContext('2d');
    let w, h;
    const isMobile = window.innerWidth <= 768;
    const NODE_COUNT = isMobile ? 30 : 60;
    const ACTIVE_COUNT = isMobile ? 4 : 7;        // Number of "active" (pulsing) nodes
    const K_NEIGHBORS = isMobile ? 2 : 3;         // Each node connects to K nearest

    const nodes = [];
    let heroMouseX = -9999, heroMouseY = -9999;
    let heroVisible = true;
    let targetedNode = -1;                         // Index of node nearest to cursor

    // ── Canvas sizing ──
    function resizeCanvas() {
      const rect = heroSection.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ── Initialize nodes ──
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * (w || window.innerWidth),
        y: Math.random() * (h || window.innerHeight),
        vx: (Math.random() - 0.5) * 0.15,         // Very slow drift
        vy: (Math.random() - 0.5) * 0.15,
        r: 3 + Math.random() * 5,                  // Radius 3–8px
        active: i < ACTIVE_COUNT,                   // First N are "active"
        phase: Math.random() * Math.PI * 2,         // Sine wave offset for pulsing
        neighbors: [],                              // Will be computed
      });
    }

    // ── Compute K-nearest neighbors for each node ──
    function computeNeighbors() {
      for (let i = 0; i < nodes.length; i++) {
        // Calculate distances to all other nodes
        const distances = [];
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          distances.push({ index: j, dist: Math.sqrt(dx * dx + dy * dy) });
        }
        // Sort by distance and pick K nearest
        distances.sort((a, b) => a.dist - b.dist);
        nodes[i].neighbors = distances.slice(0, K_NEIGHBORS).map(d => d.index);
      }
    }
    computeNeighbors();

    // Recompute neighbors periodically (nodes drift)
    let neighborTimer = 0;

    // ── Mouse tracking ──
    heroSection.addEventListener('mousemove', e => {
      const rect = heroSection.getBoundingClientRect();
      heroMouseX = e.clientX - rect.left;
      heroMouseY = e.clientY - rect.top;
    }, { passive: true });
    heroSection.addEventListener('mouseleave', () => {
      heroMouseX = -9999;
      heroMouseY = -9999;
      targetedNode = -1;
    });
    // Touch support
    heroSection.addEventListener('touchmove', e => {
      if (e.touches.length > 0) {
        const rect = heroSection.getBoundingClientRect();
        heroMouseX = e.touches[0].clientX - rect.left;
        heroMouseY = e.touches[0].clientY - rect.top;
      }
    }, { passive: true });
    heroSection.addEventListener('touchend', () => {
      heroMouseX = -9999;
      heroMouseY = -9999;
      targetedNode = -1;
    });

    // ── Pause when hero is off-screen ──
    const heroObserver = new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    heroObserver.observe(heroSection);

    let time = 0;

    // ── Animation loop ──
    function animate() {
      if (!heroVisible) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      time++;
      neighborTimer++;

      // Recompute KNN every 120 frames (~2 seconds) since nodes drift
      if (neighborTimer >= 120) {
        computeNeighbors();
        neighborTimer = 0;
      }

      const mouseActive = heroMouseX > -9000;

      // ── Find nearest node to cursor ──
      if (mouseActive) {
        let minDist = Infinity;
        targetedNode = -1;
        for (let i = 0; i < nodes.length; i++) {
          const dx = nodes[i].x - heroMouseX;
          const dy = nodes[i].y - heroMouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist && dist < 200) {
            minDist = dist;
            targetedNode = i;
          }
        }
      }

      // ── Update node positions (slow drift) ──
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        // Soft wrap at edges with padding
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      // ── Draw edges (KNN connections) ──
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        for (let k = 0; k < n.neighbors.length; k++) {
          const j = n.neighbors[k];
          if (j <= i) continue; // Avoid drawing same edge twice

          const m = nodes[j];

          // Skip if either node is off-canvas
          if (n.x < 0 || n.x > w || n.y < 0 || n.y > h) continue;
          if (m.x < 0 || m.x > w || m.y < 0 || m.y > h) continue;

          // Check if this edge connects to the targeted node
          const isTargeted = (i === targetedNode || j === targetedNode);

          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);

          if (isTargeted) {
            ctx.strokeStyle = 'rgba(244, 92, 0, 0.7)';
            ctx.lineWidth = 1;
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.lineWidth = 0.5;
          }
          ctx.stroke();
        }
      }

      // ── Draw nodes ──
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Skip off-canvas nodes
        if (n.x < 0 || n.x > w || n.y < 0 || n.y > h) continue;

        let radius = n.r;
        let fillColor;

        if (i === targetedNode) {
          // Targeted by cursor: bright orange, slightly enlarged
          fillColor = 'rgba(244, 92, 0, 1)';
          radius = n.r * 1.3;
        } else if (n.active) {
          // Active nodes: orange, pulsing with sine wave
          const pulse = 0.7 + 0.3 * Math.sin(time * 0.03 + n.phase);
          radius = n.r * (0.9 + 0.2 * Math.sin(time * 0.02 + n.phase));
          fillColor = `rgba(244, 92, 0, ${0.3 * pulse})`;
        } else {
          // Inactive nodes: dim white
          fillColor = 'rgba(255, 255, 255, 0.08)';
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Add subtle glow ring around targeted node
        if (i === targetedNode) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius + 8, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(244, 92, 0, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
// ══════════════════════════════════
//  4. STAT COUNTER ANIMATION
// ══════════════════════════════════
const stats = [
  { el: document.querySelectorAll('.stat-num')[0], target: 12, suffix: '-wk', duration: 1200 },
  { el: document.querySelectorAll('.stat-num')[1], target: 3,  suffix: '',    duration: 800  },
  { el: document.querySelectorAll('.stat-num')[2], target: 94, suffix: '%',   duration: 1500 },
];

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const stat = stats.find(s => s.el === entry.target);
    if (!stat) return;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / stat.duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      stat.el.textContent = Math.floor(ease * stat.target) + stat.suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

stats.forEach(s => { if (s.el) counterObserver.observe(s.el); });
});