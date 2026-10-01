/**
 * ==========================================================================
 * A STORY OF US — SPA SLIDE SYSTEM & ATMOSPHERE ENGINE
 * - Zero vertical scrolling between proposal pages (Fixed 100vw x 100vh slides)
 * - Large & Numerous Floating Hearts, Flowers, Petals, Leaves, Sparkles
 * - Dynamic Memory Gallery generation reading directly from memories.js
 * - Playful NO Button Evasion
 * ==========================================================================
 */

// ==========================================================================
// SCRAPBOOK PAGE — 6 PHOTOGRAPHS (2 PER FRAME)
// ==========================================================================
// To change the 6 photographs on the "Pages of Our Scrapbook" page (Page 3),
// simply update the image paths below:
// Frame 1: scrapbookPhoto1 & scrapbookPhoto2
// Frame 2: scrapbookPhoto3 & scrapbookPhoto4
// Frame 3: scrapbookPhoto5 & scrapbookPhoto6
// Keep photos in assets/images/ using relative paths.
// ==========================================================================
const scrapbookPhoto1 = "assets/images/photo1.jpeg";
const scrapbookPhoto2 = "assets/images/photo2.jpeg";

const scrapbookPhoto3 = "assets/images/photo3.jpeg";
const scrapbookPhoto4 = "assets/images/photo4.jpeg";

const scrapbookPhoto5 = "assets/images/photo5.jpeg";
const scrapbookPhoto6 = "assets/images/photo6.jpeg";

let supabasePhotoUrls = [];

const SUPABASE_PHOTO_FUNCTION =
  "https://jqotbraoxrxlqkgznfym.supabase.co/functions/v1/get-photo-urls";

async function loadSupabasePhotos() {
  try {
    const response = await fetch(SUPABASE_PHOTO_FUNCTION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    const result = await response.json();

    if (!response.ok || !result.success || !Array.isArray(result.urls)) {
      throw new Error("Could not load Supabase photo URLs.");
    }

    supabasePhotoUrls = result.urls;
    console.log("Supabase photos loaded successfully.");
  } catch (error) {
    console.error("Supabase photo loading failed:", error);
  }
}

(function () {
  'use strict';

  // --- STATE ---
  let currentPage = 1;
  let noClickCount = 0;
  let isTransitioning = false;

  const playfulMessages = [
    'Are you sure? 🥺',
    'Think again ❤️',
    'One more chance?',
    "That doesn't sound right 😌",
    'My heart only knows one answer 🌹',
    'Try the other button ❤️',
    'You know you want to say yes ✨'
  ];

  // --- DOM ELEMENTS ---
  const pages = document.querySelectorAll('.story-page');
  const pageDots = document.querySelectorAll('.page-dot');
  const navChapterText = document.getElementById('nav-chapter-text');
  const canvas = document.getElementById('ambient-canvas');

  // Proposal Choice Elements
  const btnChoiceYes = document.getElementById('btn-choice-yes');
  const btnChoiceNo = document.getElementById('btn-choice-no');
  const btnNoWrapper = document.getElementById('btn-no-wrapper');
  const btnNoText = document.getElementById('btn-no-text');
  const choiceToast = document.getElementById('choice-toast');

  // Memory Gallery Elements
  const memoriesContainer = document.getElementById('memories-timeline-container');
  const memoryCounterText = document.getElementById('memory-counter-text');
  const storyPageEl = document.getElementById('page-5');

  /* ==========================================================================
     1. SPA SLIDE NAVIGATION SYSTEM (SESSIONSTORAGE STATE PERSISTENCE)
     ========================================================================== */
  function showPage(pageNumber, isInitial = false) {
    const targetIdx = parseInt(pageNumber, 10);
    if (isNaN(targetIdx) || targetIdx < 1 || targetIdx > pages.length) return;
    if (!isInitial && targetIdx === currentPage && pages[targetIdx - 1].classList.contains('active')) return;

    isTransitioning = true;
    currentPage = targetIdx;

    // Persist current active page into sessionStorage
    try {
      sessionStorage.setItem('currentPage', String(targetIdx));
    } catch (e) { }

    // Reset scroll if user is navigating afresh to Our Story from another page
    if (!isInitial && targetIdx === 5 && storyPageEl) {
      storyPageEl.scrollTop = 0;
      try {
        sessionStorage.setItem('storyScrollPosition', '0');
      } catch (e) { }
    }

    // Remove active class from all pages & activate target
    pages.forEach((page) => {
      const pIdx = parseInt(page.getAttribute('data-page'), 10);
      if (pIdx === targetIdx) {
        page.classList.add('active');

        // Update body background color
        const targetBg = page.getAttribute('data-bg') || '#fdf5f6';
        document.body.style.backgroundColor = targetBg;

        // Update nav chapter label
        const chapter = page.getAttribute('data-chapter');
        if (chapter && navChapterText) {
          navChapterText.textContent = chapter;
        }

        // If entering Page 3 (Moments / Scrapbook), ensure photos are initialized
        if (targetIdx === 3) {
          initScrapbookPhotos();
        }

        // If entering Our Story (Page 5), render memories
        if (targetIdx === 5) {
          renderMemoriesFromData();
        }

        // If entering Our Days Together (Page 8), immediately refresh counter
        if (targetIdx === 8) {
          updateDaysTogetherCounter();
        }
      } else {
        page.classList.remove('active');
      }
    });

    // Update side navigation dots
    pageDots.forEach((dot) => {
      const dotIdx = parseInt(dot.getAttribute('data-page-idx'), 10);
      dot.classList.toggle('active', dotIdx === targetIdx);
    });

    setTimeout(() => {
      isTransitioning = false;
    }, 600);
  }

  // Preserve scroll position within Our Story (Page 5)
  function saveStoryScroll() {
    if (storyPageEl && currentPage === 5) {
      try {
        sessionStorage.setItem('storyScrollPosition', String(storyPageEl.scrollTop));
      } catch (e) { }
    }
  }

  function restoreStoryScroll() {
    if (!storyPageEl) return;
    try {
      const savedScroll = sessionStorage.getItem('storyScrollPosition');
      if (savedScroll !== null) {
        const scrollY = parseInt(savedScroll, 10);
        if (!isNaN(scrollY) && scrollY > 0) {
          requestAnimationFrame(() => {
            storyPageEl.scrollTop = scrollY;
            setTimeout(() => {
              storyPageEl.scrollTop = scrollY;
            }, 80);
          });
        }
      }
    } catch (e) { }
  }

  if (storyPageEl) {
    storyPageEl.addEventListener('scroll', saveStoryScroll, { passive: true });
  }
  window.addEventListener('beforeunload', saveStoryScroll);

  // Global Button Navigation Listener for [data-next-page]
  document.querySelectorAll('[data-next-page]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const nextIdx = btn.getAttribute('data-next-page');
      showPage(nextIdx);
    });
  });

  // Side Page Navigation Dots
  pageDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetIdx = dot.getAttribute('data-page-idx');
      if (targetIdx) {
        showPage(targetIdx);
      }
    });
  });

  // Subtle Mobile Horizontal Swipe Gesture for Story Slides
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (isTransitioning || currentPage === 5) return; // Ignore swipe inside scrollable Our Story page
    if (e.changedTouches && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;

      // Check horizontal swipe with low vertical movement
      if (Math.abs(deltaX) > 65 && Math.abs(deltaY) < 50) {
        if (deltaX < 0 && currentPage < pages.length) {
          // Swipe Left -> Next Slide
          showPage(currentPage + 1);
        } else if (deltaX > 0 && currentPage > 1) {
          // Swipe Right -> Prev Slide
          showPage(currentPage - 1);
        }
      }
    }
  }, { passive: true });

  /* ==========================================================================
     2. PLAYFUL "NO" BUTTON INTERACTION
     ========================================================================== */
  function handleNoInteraction(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    noClickCount++;
    const msg = playfulMessages[(noClickCount - 1) % playfulMessages.length];

    // Show toast message
    if (choiceToast) {
      choiceToast.textContent = msg;
      choiceToast.classList.remove('show');
      void choiceToast.offsetWidth; // Reflow
      choiceToast.classList.add('show');
    }

    // Update button text after repeated attempts
    if (btnNoText) {
      btnNoText.textContent = noClickCount > 2 ? 'Reconsidering... 💭' : 'NO';
    }

    // Offset the NO button safely within container bounds
    if (btnNoWrapper) {
      const isMobile = window.innerWidth < 768;
      const rangeX = isMobile ? 35 : 75;
      const rangeY = isMobile ? 18 : 28;

      const randomX = Math.round((Math.random() * (rangeX * 2)) - rangeX);
      const randomY = Math.round((Math.random() * (rangeY * 2)) - rangeY);

      btnNoWrapper.style.transform = `translate(${randomX}px, ${randomY}px)`;
    }

    // Scale the YES button slightly
    if (btnChoiceYes) {
      const scale = Math.min(1 + noClickCount * 0.045, 1.25);
      btnChoiceYes.style.transform = `scale(${scale})`;
    }
  }

  if (btnChoiceNo) {
    btnChoiceNo.addEventListener('click', handleNoInteraction);
    btnChoiceNo.addEventListener('mouseenter', handleNoInteraction);
    btnChoiceNo.addEventListener('touchstart', handleNoInteraction, { passive: false });
  }

  // YES Button Click
  if (btnChoiceYes) {
    btnChoiceYes.addEventListener('click', async () => {

      // Send acceptance notification to Telegram through Supabase
      try {
        await fetch(
          'https://jqotbraoxrxlqkgznfym.supabase.co/functions/v1/she-accepted',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          }
        );
      } catch (error) {
        console.error('Acceptance notification error:', error);
      }

      // Keep the existing celebration page exactly as it is
      showPage(7);
    });
  }
  /* ==========================================================================
     3. LARGE & NUMEROUS ANIMATED ATMOSPHERE CANVAS
     Hearts (25-70px), Flowers (25-55px), Leaves (30-65px), Sparkles
     Spread across margins, clearly visible, flowing organically
     ========================================================================== */
  function initAmbientCanvas() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const isMobile = window.innerWidth < 768;
    const maxParticles = isMobile ? 16 : 24; // High visibility density

    const heartColors = [
      'rgba(244, 151, 170, ', // Soft Pink
      'rgba(196, 118, 135, ', // Dusty Rose
      'rgba(242, 142, 130, ', // Coral
      'rgba(200, 177, 228, ', // Lavender
      'rgba(217, 83, 111, ',  // Soft Red
      'rgba(247, 178, 151, ', // Peach
      'rgba(223, 184, 103, ', // Champagne Gold
      'rgba(232, 176, 189, '  // Muted Rose
    ];

    const flowerColors = [
      '#fcd3de', '#e8b0bd', '#fde2e4', '#e2d4f0', '#fae1dd', '#fff5eb', '#fce8ec'
    ];

    const leafColors = [
      '#9db89f', '#b5cca8', '#889c7c', '#a8c5a4'
    ];

    // Helper: generate particles primarily in margin zones to keep text clear
    function getMarginX() {
      const marginWidth = width * 0.35;
      if (Math.random() > 0.5) {
        // Left margin (0 to 35% width)
        return Math.random() * marginWidth;
      } else {
        // Right margin (65% to 100% width)
        return width - (Math.random() * marginWidth);
      }
    }

    function createParticle(initialY = null) {
      const typeRand = Math.random();
      let type = 'heart';
      if (typeRand < 0.45) type = 'heart';
      else if (typeRand < 0.72) type = 'flower';
      else if (typeRand < 0.90) type = 'leaf';
      else type = 'sparkle';

      const isMob = window.innerWidth < 768;

      // Prominent Larger Sizes
      let size = 30;
      if (type === 'heart') {
        const isAccentLarge = Math.random() < 0.15;
        size = isMob
          ? (isAccentLarge ? Math.random() * 15 + 38 : Math.random() * 16 + 22)
          : (isAccentLarge ? Math.random() * 20 + 52 : Math.random() * 24 + 28);
      } else if (type === 'flower') {
        size = isMob ? (Math.random() * 18 + 22) : (Math.random() * 26 + 28);
      } else if (type === 'leaf') {
        size = isMob ? (Math.random() * 18 + 26) : (Math.random() * 30 + 34);
      } else {
        size = isMob ? (Math.random() * 4 + 3) : (Math.random() * 6 + 4);
      }

      const x = getMarginX();
      const y = initialY !== null ? initialY : height + Math.random() * 80;

      const colorBase = type === 'heart' ? heartColors[Math.floor(Math.random() * heartColors.length)] :
        type === 'flower' ? flowerColors[Math.floor(Math.random() * flowerColors.length)] :
          type === 'leaf' ? leafColors[Math.floor(Math.random() * leafColors.length)] :
            '#dfb867';

      // Varied Flow Durations (8s to 18s equivalent speeds)
      const speedY = -(Math.random() * 0.65 + 0.35);
      const speedX = (Math.random() - 0.5) * 0.45;

      return {
        type,
        x,
        y,
        size,
        colorBase,
        speedY,
        speedX,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.012,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.018 + 0.008,
        opacity: Math.random() * 0.35 + 0.45,
        twinkle: Math.random() * Math.PI
      };
    }

    const particles = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(Math.random() * height));
    }

    // Draw Smooth SVG-Style Heart
    function drawHeart(c, x, y, size, color, opacity, rot) {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.globalAlpha = opacity;
      c.fillStyle = color.startsWith('rgba') ? color + opacity + ')' : color;

      const s = size / 20;
      c.beginPath();
      c.moveTo(0, s * -4);
      c.bezierCurveTo(s * -10, s * -14, s * -20, s * 2, 0, s * 16);
      c.bezierCurveTo(s * 20, s * 2, s * 10, s * -14, 0, s * -4);
      c.fill();
      c.restore();
    }

    // Draw 5-Petal Pastel Flower
    function drawFlower(c, x, y, size, color, opacity, rot) {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.globalAlpha = opacity;
      c.fillStyle = color;

      const petals = 5;
      const r = size / 2;
      for (let i = 0; i < petals; i++) {
        c.save();
        c.rotate((i * 2 * Math.PI) / petals);
        c.beginPath();
        c.ellipse(0, -r, r * 0.52, r * 0.88, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }

      // Flower Center
      c.beginPath();
      c.arc(0, 0, r * 0.38, 0, Math.PI * 2);
      c.fillStyle = '#fff4cc';
      c.fill();
      c.restore();
    }

    // Draw Soft Green Leaf
    function drawLeaf(c, x, y, size, color, opacity, rot) {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.globalAlpha = opacity * 0.9;
      c.fillStyle = color;

      const s = size * 0.7;
      c.beginPath();
      c.moveTo(0, -s);
      c.bezierCurveTo(s * 0.75, -s * 0.3, s * 0.75, s * 0.3, 0, s);
      c.bezierCurveTo(-s * 0.75, s * 0.3, -s * 0.75, -s * 0.3, 0, -s);
      c.fill();

      // Delicate Leaf Stem Line
      c.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, -s * 0.7);
      c.lineTo(0, s * 0.7);
      c.stroke();

      c.restore();
    }

    // Draw 4-Point Golden Sparkle
    function drawSparkle(c, x, y, size, opacity, twinkle) {
      c.save();
      c.translate(x, y);
      const a = opacity * (0.4 + 0.6 * Math.sin(twinkle));
      c.globalAlpha = Math.max(0, Math.min(1, a));
      c.fillStyle = '#dfb867';

      c.beginPath();
      c.arc(0, 0, size, 0, Math.PI * 2);
      c.fill();

      c.strokeStyle = 'rgba(255, 235, 180, ' + a * 0.85 + ')';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(-size * 2.8, 0);
      c.lineTo(size * 2.8, 0);
      c.moveTo(0, -size * 2.8);
      c.lineTo(0, size * 2.8);
      c.stroke();
      c.restore();
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.swing += p.swingSpeed;
        p.x += p.speedX + Math.sin(p.swing) * 0.55;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;
        p.twinkle += 0.04;

        if (p.y < -40) {
          particles[i] = createParticle(height + 20);
        }

        const currentOpacity = currentPage === 2 ? p.opacity * 0.65 : p.opacity;

        if (p.type === 'heart') {
          drawHeart(ctx, p.x, p.y, p.size, p.colorBase, currentOpacity, p.rotation);
        } else if (p.type === 'flower') {
          drawFlower(ctx, p.x, p.y, p.size, p.colorBase, currentOpacity, p.rotation);
        } else if (p.type === 'leaf') {
          drawLeaf(ctx, p.x, p.y, p.size, p.colorBase, currentOpacity, p.rotation);
        } else {
          drawSparkle(ctx, p.x, p.y, p.size, currentOpacity, p.twinkle);
        }
      }

      requestAnimationFrame(render);
    }

    render();
  }

  /* ==========================================================================
     4. DYNAMIC OUR STORY SCENERY GENERATION (READS DIRECTLY FROM memories.js)
     ==========================================================================
     4. REUSABLE 12-STRUCTURE SCRAPBOOK ENGINE (HANDMADE VARIETY)
     Supports 0, 1, 2, 3, and multi-photo compositions with distinct styling
     ========================================================================== */

  // Safe image element renderer
  function renderPhotoItem(src, alt = 'Memory photo', extraClass = '') {
    return `<img class="memory-photo-img ${extraClass}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" onerror="if(!this.src.endsWith('.jpeg')) this.src=this.src.replace(/\\.(jpg|png)$/, '.jpeg');">`;
  }

  // 1. CLASSIC HANGING PHOTOS
  function buildClassicHanging(photos, title) {
    const count = photos.length;
    let itemsHtml = '';
    photos.forEach((photo, i) => {
      const dropClass = `hanging-drop-${(i % 3) + 1}`;
      const swayClass = i % 2 === 0 ? 'hanging-sway-left' : 'hanging-sway-right';
      itemsHtml += `
        <div class="hanging-photo-item ${dropClass} ${swayClass}">
          <div class="attachment-wrap attachment-rope">
            <svg class="attachment-svg rope-svg" viewBox="0 0 16 55" preserveAspectRatio="none" aria-hidden="true">
              <path d="M8,0 Q${i % 2 === 0 ? '5' : '11'},26 8,55" fill="none" stroke="#be9e8c" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <div class="attachment-node wooden-peg" aria-hidden="true"></div>
          </div>
          <div class="hanging-polaroid">
            <div class="polaroid-img-box">
              ${renderPhotoItem(photo, `${title} photo ${i + 1}`)}
            </div>
          </div>
        </div>
      `;
    });
    return `
      <div class="struct-1-classic-hanging struct-display-box count-${count}">
        <div class="hanging-twine-bar" aria-hidden="true">
          <span class="twine-knot knot-left"></span>
          <span class="twine-knot knot-center"></span>
          <span class="twine-knot knot-right"></span>
        </div>
        <div class="hanging-photos-row count-${count}">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  // 2. TREE BRANCH HANGING
  function buildBranchHanging(photos, title) {
    const count = photos.length;
    let itemsHtml = '';
    photos.forEach((photo, i) => {
      const dropClass = `branch-drop-${(i % 3) + 1}`;
      itemsHtml += `
        <div class="branch-photo-item ${dropClass}">
          <div class="branch-twine-line" aria-hidden="true">
            <span class="branch-leaf-clip">🌿</span>
          </div>
          <div class="branch-polaroid">
            <div class="branch-img-box">
              ${renderPhotoItem(photo, `${title} photo ${i + 1}`)}
            </div>
          </div>
        </div>
      `;
    });
    return `
      <div class="struct-2-branch-hanging struct-display-box count-${count}">
        <div class="branch-canopy-svg-wrap" aria-hidden="true">
          <svg class="tree-branch-svg" viewBox="0 0 360 48" preserveAspectRatio="none">
            <path d="M4,24 Q90,6 180,26 T356,20" fill="none" stroke="#688265" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M60,18 Q90,2 115,14" fill="none" stroke="#688265" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M230,22 Q260,38 295,26" fill="none" stroke="#688265" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M85,8 Q100,0 106,12 Q94,22 85,8 Z" fill="#9db89f"/>
            <path d="M140,20 Q154,6 162,20 Q148,32 140,20 Z" fill="#b5cca8"/>
            <path d="M260,30 Q276,44 286,32 Q270,20 260,30 Z" fill="#9db89f"/>
            <circle cx="115" cy="14" r="3.5" fill="#fcd3de"/>
            <circle cx="295" cy="26" r="3.5" fill="#fde2e4"/>
          </svg>
        </div>
        <div class="branch-photos-row count-${count}">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  // 3. POLAROID OVERLAP
  function buildPolaroidOverlap(photos, title) {
    const count = photos.length;
    let itemsHtml = '';
    photos.forEach((photo, i) => {
      const cardClass = `overlap-card-${(i % 5) + 1}`;
      itemsHtml += `
        <div class="overlap-polaroid-card ${cardClass}">
          ${i === 0 ? '<div class="overlap-clip-accent" aria-hidden="true">📎</div>' : ''}
          ${i === count - 1 && count > 1 ? '<div class="overlap-seal-accent" aria-hidden="true">❦</div>' : ''}
          <div class="overlap-img-box">
            ${renderPhotoItem(photo, `${title} photo ${i + 1}`)}
          </div>
        </div>
      `;
    });
    return `
      <div class="struct-3-polaroid-overlap struct-display-box count-${count}">
        <div class="overlap-deck-container count-${count}">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  // 4. SCRAPBOOK COLLAGE
  function buildScrapbookCollage(photos, title) {
    const count = photos.length;
    let itemsHtml = '';
    photos.forEach((photo, i) => {
      const cardClass = `collage-card-${(i % 4) + 1}`;
      itemsHtml += `
        <div class="collage-item ${cardClass}">
          <div class="collage-washi-strip" aria-hidden="true"></div>
          <div class="collage-img-frame">
            ${renderPhotoItem(photo, `${title} photo ${i + 1}`)}
          </div>
        </div>
      `;
    });
    return `
      <div class="struct-4-scrapbook-collage struct-display-box count-${count}">
        <div class="collage-paper-mat">
          <div class="collage-postage-stamp" aria-hidden="true">
            <span class="stamp-heart">♥</span>
            <span class="stamp-text">LOVE</span>
          </div>
          <div class="collage-items-cluster count-${count}">
            ${itemsHtml}
          </div>
          <div class="collage-script-badge">treasured chapter</div>
        </div>
      </div>
    `;
  }

  // 5. WASHI TAPE PHOTOS
  function buildWashiTape(photos, title) {
    const count = photos.length;
    const tapeColors = ['tape-pink', 'tape-gold', 'tape-sage', 'tape-lavender'];
    const tapePositions = ['tape-top-left', 'tape-top-center', 'tape-top-right', 'tape-both-corners'];
    let itemsHtml = '';
    photos.forEach((photo, i) => {
      const colorClass = tapeColors[i % tapeColors.length];
      const posClass = tapePositions[i % tapePositions.length];
      const cardClass = `washi-card-${(i % 4) + 1}`;
      itemsHtml += `
        <div class="washi-photo-card ${cardClass}">
          <div class="washi-tape-accent ${colorClass} ${posClass}" aria-hidden="true"></div>
          <div class="washi-img-box">
            ${renderPhotoItem(photo, `${title} photo ${i + 1}`)}
          </div>
        </div>
      `;
    });
    return `
      <div class="struct-5-washi-tape struct-display-box count-${count}">
        <div class="washi-cards-gallery count-${count}">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  // 6. VERTICAL PHOTO STRIP
  function buildVerticalStrip(photos, title) {
    const count = photos.length;
    let itemsHtml = '';
    photos.forEach((photo, i) => {
      const sideClass = i % 2 === 0 ? 'node-left' : 'node-right';
      const cardClass = `vstrip-card-${(i % 4) + 1}`;
      itemsHtml += `
        <div class="vstrip-item ${sideClass} ${cardClass}">
          <span class="vstrip-eyelet" aria-hidden="true"></span>
          <div class="vstrip-polaroid">
            <div class="vstrip-img-box">
              ${renderPhotoItem(photo, `${title} photo ${i + 1}`)}
            </div>
          </div>
        </div>
      `;
    });
    return `
      <div class="struct-6-vertical-strip struct-display-box count-${count}">
        <div class="vstrip-seam-spine" aria-hidden="true"></div>
        <div class="vstrip-items-column count-${count}">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  // 7. FILM STRIP
  function buildFilmStrip(photos, title) {
    const count = photos.length;
    let framesHtml = '';
    photos.forEach((photo, i) => {
      const frameNum = String(i + 1).padStart(2, '0');
      framesHtml += `
        <div class="film-single-frame">
          <div class="film-frame-header">
            <span class="film-number">${frameNum}A</span>
            <span class="film-brand">MEMORIES · 400</span>
          </div>
          <div class="film-photo-window">
            ${renderPhotoItem(photo, `${title} frame ${i + 1}`)}
          </div>
        </div>
      `;
    });
    return `
      <div class="struct-7-film-strip struct-display-box count-${count}">
        <div class="film-strip-ribbon">
          <div class="film-sprockets-row sprockets-top" aria-hidden="true">
            ${'<span></span>'.repeat(Math.max(6, count * 3))}
          </div>
          <div class="film-frames-strip count-${count}">
            ${framesHtml}
          </div>
          <div class="film-sprockets-row sprockets-bottom" aria-hidden="true">
            ${'<span></span>'.repeat(Math.max(6, count * 3))}
          </div>
        </div>
      </div>
    `;
  }

  // 8. POLAROID PINBOARD
  function buildPinboard(photos, title) {
    const count = photos.length;
    const pinTypes = ['pin-gold', 'pin-rose', 'pin-pearl'];
    let itemsHtml = '';
    photos.forEach((photo, i) => {
      const pinClass = pinTypes[i % pinTypes.length];
      const cardClass = `pin-card-${(i % 4) + 1}`;
      itemsHtml += `
        <div class="pinboard-photo-wrap ${cardClass}">
          <div class="pushpin-3d ${pinClass}" aria-hidden="true"></div>
          <div class="pinboard-polaroid">
            <div class="pinboard-img-box">
              ${renderPhotoItem(photo, `${title} photo ${i + 1}`)}
            </div>
          </div>
        </div>
      `;
    });
    return `
      <div class="struct-8-pinboard struct-display-box count-${count}">
        <div class="pinboard-card-mat">
          <div class="pinboard-memo-note">forever &amp; always ❦</div>
          <div class="pinboard-cluster count-${count}">
            ${itemsHtml}
          </div>
        </div>
      </div>
    `;
  }

  // 9. FLOWER / VINE FRAME
  function buildVineFrame(photos, title) {
    const count = photos.length;
    let itemsHtml = '';
    photos.forEach((photo, i) => {
      const cardClass = `vine-card-${(i % 4) + 1}`;
      itemsHtml += `
        <div class="vine-photo-item ${cardClass}">
          <div class="vine-photo-frame">
            ${renderPhotoItem(photo, `${title} photo ${i + 1}`)}
          </div>
        </div>
      `;
    });
    return `
      <div class="struct-9-vine-frame struct-display-box count-${count}">
        <div class="vine-garland-wrap">
          <svg class="vine-garland-svg garland-tl" viewBox="0 0 160 160" aria-hidden="true">
            <path d="M-10,-10 Q80,20 120,90 Q140,130 160,160" fill="none" stroke="#7e947b" stroke-width="2" stroke-linecap="round"/>
            <path d="M40,20 Q60,5 75,20 Q60,35 40,20 Z" fill="#9db89f"/>
            <path d="M85,45 Q105,30 115,48 Q98,62 85,45 Z" fill="#b5cca8"/>
            <circle cx="110" cy="40" r="10" fill="#fcd3de" opacity="0.85"/>
            <circle cx="108" cy="38" r="6" fill="#f497aa" opacity="0.75"/>
            <circle cx="110" cy="40" r="2.5" fill="#dfb867"/>
          </svg>
          <svg class="vine-garland-svg garland-br" viewBox="0 0 160 160" aria-hidden="true">
            <path d="M170,170 Q80,140 40,70 Q20,30 0,0" fill="none" stroke="#7e947b" stroke-width="2" stroke-linecap="round"/>
            <path d="M120,140 Q100,155 85,140 Q100,125 120,140 Z" fill="#9db89f"/>
            <path d="M75,115 Q55,130 45,112 Q62,98 75,115 Z" fill="#b5cca8"/>
            <circle cx="50" cy="120" r="10" fill="#fde2e4" opacity="0.85"/>
            <circle cx="52" cy="122" r="6" fill="#f497aa" opacity="0.75"/>
            <circle cx="50" cy="120" r="2.5" fill="#dfb867"/>
          </svg>
          <div class="vine-photos-cluster count-${count}">
            ${itemsHtml}
          </div>
        </div>
      </div>
    `;
  }

  // 10. DIAGONAL CASCADE
  function buildDiagonalCascade(photos, title) {
    const count = photos.length;
    let itemsHtml = '';
    photos.forEach((photo, i) => {
      const stepClass = `cascade-step-${(i % 4) + 1}`;
      itemsHtml += `
        <div class="cascade-item ${stepClass}">
          <div class="cascade-card">
            <div class="cascade-img-box">
              ${renderPhotoItem(photo, `${title} photo ${i + 1}`)}
            </div>
          </div>
        </div>
      `;
    });
    return `
      <div class="struct-10-diagonal-cascade struct-display-box count-${count}">
        <div class="cascade-ribbon-bg" aria-hidden="true"></div>
        <div class="cascade-steps-container count-${count}">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  // 11. CENTER HERO PHOTO + SMALL PHOTOS
  function buildCenterHero(photos, title) {
    const count = photos.length;
    if (count === 1) {
      return `
        <div class="struct-11-center-hero struct-display-box count-1">
          <div class="hero-showcase-card">
            <span class="hero-filigree top-left" aria-hidden="true">✦</span>
            <span class="hero-filigree top-right" aria-hidden="true">✦</span>
            <span class="hero-filigree bottom-left" aria-hidden="true">✦</span>
            <span class="hero-filigree bottom-right" aria-hidden="true">✦</span>
            <div class="hero-img-box">
              ${renderPhotoItem(photos[0], title)}
            </div>
            <div class="hero-caption-pill">Our Beautiful Moment</div>
          </div>
        </div>
      `;
    }

    if (count <= 3) {
      const heroPhoto = photos[0];
      const flankPhotos = photos.slice(1);
      let flanksHtml = '';
      flankPhotos.forEach((photo, i) => {
        const flankClass = i % 2 === 0 ? 'flank-left' : 'flank-right';
        flanksHtml += `
          <div class="hero-flank-card ${flankClass}">
            <div class="flank-img-box">
              ${renderPhotoItem(photo, `${title} photo ${i + 2}`)}
            </div>
          </div>
        `;
      });
      return `
        <div class="struct-11-center-hero struct-display-box count-${count}">
          <div class="hero-trio-wrap count-${count}">
            ${flanksHtml}
            <div class="hero-main-card">
              <span class="hero-filigree top-left" aria-hidden="true">✦</span>
              <span class="hero-filigree top-right" aria-hidden="true">✦</span>
              <div class="hero-img-box">
                ${renderPhotoItem(heroPhoto, `${title} main photo`)}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // For count > 3 (e.g. 4 to 11+ photos)
    const heroPhoto = photos[0];
    const otherPhotos = photos.slice(1);
    let othersHtml = '';
    otherPhotos.forEach((photo, i) => {
      const rot = (i % 2 === 0 ? -2.5 : 2.5) * ((i % 3) * 0.6 + 0.4);
      othersHtml += `
        <div class="hero-mosaic-card" style="transform: rotate(${rot.toFixed(1)}deg);">
          <div class="flank-img-box">
            ${renderPhotoItem(photo, `${title} photo ${i + 2}`)}
          </div>
        </div>
      `;
    });

    return `
      <div class="struct-11-center-hero struct-display-box count-${count} hero-multi-layout">
        <div class="hero-main-card hero-main-prominent">
          <span class="hero-filigree top-left" aria-hidden="true">✦</span>
          <span class="hero-filigree top-right" aria-hidden="true">✦</span>
          <div class="hero-img-box">
            ${renderPhotoItem(heroPhoto, `${title} main photo`)}
          </div>
          <div class="hero-caption-pill">Treasured Memories</div>
        </div>
        <div class="hero-mosaic-grid">
          ${othersHtml}
        </div>
      </div>
    `;
  }

  // 12. HANGING MINI GALLERY
  function buildMiniGallery(photos, title) {
    const count = photos.length;
    let itemsHtml = '';
    photos.forEach((photo, i) => {
      const cordClass = `gallery-cord-${(i % 3) + 1}`;
      itemsHtml += `
        <div class="mini-gallery-drop ${cordClass}">
          <div class="gallery-ceiling-anchor" aria-hidden="true">
            <span class="ceiling-pin">✦</span>
            <span class="gallery-drop-cord"></span>
            <span class="gallery-binder-clip"></span>
          </div>
          <div class="gallery-hanging-polaroid">
            <div class="gallery-img-box">
              ${renderPhotoItem(photo, `${title} photo ${i + 1}`)}
            </div>
          </div>
        </div>
      `;
    });
    return `
      <div class="struct-12-mini-gallery struct-display-box count-${count}">
        <div class="mini-gallery-drops-row count-${count}">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  // Master Structure Dispatcher
  function buildPhotoInstallation(photoArray, memoryIndex, title, layoutId = 1) {
    if (!photoArray || photoArray.length === 0) return '';

    switch (layoutId) {
      case 1: return buildClassicHanging(photoArray, title);
      case 2: return buildBranchHanging(photoArray, title);
      case 3: return buildPolaroidOverlap(photoArray, title);
      case 4: return buildScrapbookCollage(photoArray, title);
      case 5: return buildWashiTape(photoArray, title);
      case 6: return buildVerticalStrip(photoArray, title);
      case 7: return buildFilmStrip(photoArray, title);
      case 8: return buildPinboard(photoArray, title);
      case 9: return buildVineFrame(photoArray, title);
      case 10: return buildDiagonalCascade(photoArray, title);
      case 11: return buildCenterHero(photoArray, title);
      case 12: return buildMiniGallery(photoArray, title);
      default: return buildClassicHanging(photoArray, title);
    }
  }

  // Deterministic Non-Repeating Layout Assigner (Avoids repetitions in previous 3 memories)
  function computeDeterministicLayouts(memoriesList) {
    const totalLayouts = 12;
    // Permutation array ensuring varied styles across consecutive scenes
    const layoutSequence = [4, 9, 2, 7, 11, 3, 8, 5, 12, 1, 10, 6];
    const assignments = [];
    const recent = [];

    memoriesList.forEach((mem, idx) => {
      const key = `${idx}_${mem.title || ''}_${mem.date || ''}`;
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
      }

      let candidate = null;
      const offset = Math.abs(hash) % totalLayouts;

      for (let i = 0; i < totalLayouts; i++) {
        const potential = layoutSequence[(offset + i + idx) % totalLayouts];
        if (!recent.includes(potential)) {
          candidate = potential;
          break;
        }
      }

      if (!candidate) {
        for (let l = 1; l <= totalLayouts; l++) {
          if (recent.length === 0 || l !== recent[recent.length - 1]) {
            candidate = l;
            break;
          }
        }
      }

      assignments.push(candidate);
      recent.push(candidate);
      if (recent.length > 3) {
        recent.shift();
      }
    });

    return assignments;
  }

  function renderMemoriesFromData() {
    const container = document.getElementById('memories-story-stream') ||
      document.getElementById('memories-cards-container');
    if (!container) return;

    // Read window.memories populated from memories.js
    const memoryList = (typeof window !== 'undefined' && window.memories) ? window.memories : [];

    if (memoryCounterText) {
      memoryCounterText.textContent = `${memoryList.length} Preserved Milestones & Memories`;
    }

    // Assign deterministic non-repeating layouts across memories
    const layoutAssignments = computeDeterministicLayouts(memoryList);

    let html = '';

    memoryList.forEach((mem, index) => {
      const photoArray = Array.isArray(mem.photos) ? mem.photos.filter(p => Boolean(p)) : (mem.photo ? [mem.photo] : []);
      const hasPhotos = photoArray.length > 0;
      const sceneNum = index + 1;
      const layoutId = layoutAssignments[index] || 1;

      if (!hasPhotos) {
        // Dedicated Romantic Letter / Scrapbook Entry for 0-photo memory with subtle handmade accents
        const letterStyles = ['letter-motif-botanical', 'letter-motif-waxseal', 'letter-motif-stamp', 'letter-motif-ribbon'];
        const letterMotif = letterStyles[index % letterStyles.length];

        let decorativeAccent = '';
        if (letterMotif === 'letter-motif-waxseal') {
          decorativeAccent = `<div class="scene-waxseal-accent" aria-hidden="true"><div class="stamp-inner"><span>DEVOTION</span><strong>❦</strong></div></div>`;
        } else if (letterMotif === 'letter-motif-stamp') {
          decorativeAccent = `<div class="scene-stamp-accent" aria-hidden="true"><span class="stamp-post">POST</span><span class="stamp-heart">♥</span><span class="stamp-year">'26</span></div>`;
        } else if (letterMotif === 'letter-motif-ribbon') {
          decorativeAccent = `<div class="scene-ribbon-accent" aria-hidden="true"><span class="ribbon-bow">❦</span></div>`;
        } else {
          decorativeAccent = `
            <div class="scene-botanical-accent" aria-hidden="true">
              <svg viewBox="0 0 60 60" class="botanical-mini-svg">
                <path d="M0,60 Q30,40 50,10" fill="none" stroke="#7e947b" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M25,40 Q40,25 35,45 Z" fill="#9db89f" opacity="0.85"/>
                <circle cx="50" cy="10" r="5" fill="#fcd3de"/>
                <circle cx="49" cy="9" r="2.5" fill="#f497aa"/>
              </svg>
            </div>
          `;
        }

        html += `
          <article class="memory-story-scene scene-letter-entry ${letterMotif}">
            <div class="scene-tape-accent" aria-hidden="true"></div>
            ${decorativeAccent}
            <div class="scene-text-block">
              <div class="scene-meta-row">
                <span class="memory-date-pill">${escapeHtml(mem.date || '')}</span>
                <span class="memory-chapter-script">Chapter ${sceneNum}</span>
              </div>
              <h3 class="memory-scene-title">${escapeHtml(mem.title || '')}</h3>
              <div class="scene-letter-rule" aria-hidden="true"></div>
              <p class="memory-scene-desc">${escapeHtml(mem.description || mem.desc || '')}</p>
            </div>
          </article>
        `;
      } else {
        // Alternating Text ↔ Image positions
        const isTextLeft = (index % 2 === 0);
        const layoutClass = isTextLeft ? 'layout-text-left' : 'layout-photos-left';
        const photoHtml = buildPhotoInstallation(photoArray, index, mem.title, layoutId);

        const textContentHtml = `
          <div class="scene-text-block">
            <div class="scene-meta-row">
              <span class="memory-date-pill">${escapeHtml(mem.date || '')}</span>
              <span class="memory-chapter-script">Chapter ${sceneNum}</span>
            </div>
            <h3 class="memory-scene-title">${escapeHtml(mem.title || '')}</h3>
            <div class="scene-letter-rule" aria-hidden="true"></div>
            <p class="memory-scene-desc">${escapeHtml(mem.description || mem.desc || '')}</p>
          </div>
        `;

        const photoContentHtml = `
          <div class="scene-visual-block struct-layout-${layoutId}">
            ${photoHtml}
          </div>
        `;

        html += `
          <article class="memory-story-scene ${layoutClass} scene-struct-${layoutId}">
            <div class="scene-tape-accent" aria-hidden="true"></div>
            ${isTextLeft ? (textContentHtml + photoContentHtml) : (photoContentHtml + textContentHtml)}
          </article>
        `;
      }
    });

    container.innerHTML = html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     5. ROMANTIC "OUR JOURNEY" QUICK NAVIGATION MENU
     ========================================================================== */
  function initJourneyMenu() {
    const triggerBtn = document.getElementById('journey-trigger-btn');
    const popoverMenu = document.getElementById('journey-popover-menu');
    const closeBtn = document.getElementById('journey-close-btn');
    const widget = document.getElementById('journey-nav-widget');
    const jumpButtons = document.querySelectorAll('[data-jump-page]');

    if (!triggerBtn || !popoverMenu) return;

    function openMenu() {
      popoverMenu.classList.add('open');
      popoverMenu.setAttribute('aria-hidden', 'false');
      triggerBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      popoverMenu.classList.remove('open');
      popoverMenu.setAttribute('aria-hidden', 'true');
      triggerBtn.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (popoverMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    triggerBtn.addEventListener('click', toggleMenu);

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
      });
    }

    // Direct Jump to specified page (no scrolling, immediate showPage)
    jumpButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pageIdx = btn.getAttribute('data-jump-page');
        if (pageIdx) {
          showPage(pageIdx);
          closeMenu();
        }
      });
    });

    // Close when clicking outside widget
    document.addEventListener('click', (e) => {
      if (popoverMenu.classList.contains('open') && widget && !widget.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popoverMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  /* ==========================================================================
     6. SCRAPBOOK 6 PHOTOS INITIALIZATION (2 PER FRAME)
     ========================================================================== */
  function initScrapbookPhotos() {
    const photoConfigs = [
      { id: 'scrapbook-photo-1', src: supabasePhotoUrls[0] || scrapbookPhoto1 },
      { id: 'scrapbook-photo-2', src: supabasePhotoUrls[1] || scrapbookPhoto2 },
      { id: 'scrapbook-photo-3', src: supabasePhotoUrls[2] || scrapbookPhoto3 },
      { id: 'scrapbook-photo-4', src: supabasePhotoUrls[3] || scrapbookPhoto4 },
      { id: 'scrapbook-photo-5', src: supabasePhotoUrls[4] || scrapbookPhoto5 },
      { id: 'scrapbook-photo-6', src: supabasePhotoUrls[5] || scrapbookPhoto6 }
    ];

    photoConfigs.forEach(item => {
      const img = document.getElementById(item.id);
      if (img && typeof item.src === 'string' && item.src.trim() !== '') {
        img.src = item.src;
      }
    });
  }

  // Disable automatic browser window scroll restoration so custom slide transitions work cleanly
  if (typeof window !== 'undefined') {
    if (window.history && window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }
    if (window.location.hash) {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (err) { }
    }
  }

  /* ==========================================================================
     7. DYNAMIC "OUR DAYS TOGETHER" LIVE TIME COUNTER
     Start Date: 04 April 2026 (04/04/2026 00:00:00 Local Browser Time)
     ========================================================================== */
  function updateDaysTogetherCounter() {
    const startDate = new Date(2026, 3, 4, 0, 0, 0); // April 4, 2026 00:00:00 Local Time (month index 3 = April)
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - startDate.getTime());

    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    const mainDaysNumber = document.getElementById('days-count-number');
    const unitDays = document.getElementById('counter-unit-days');
    const unitHours = document.getElementById('counter-unit-hours');
    const unitMinutes = document.getElementById('counter-unit-minutes');
    const unitSeconds = document.getElementById('counter-unit-seconds');

    if (mainDaysNumber) {
      mainDaysNumber.textContent = totalDays.toLocaleString();
    }
    if (unitDays) {
      unitDays.textContent = String(totalDays);
    }
    if (unitHours) {
      unitHours.textContent = String(hours).padStart(2, '0');
    }
    if (unitMinutes) {
      unitMinutes.textContent = String(minutes).padStart(2, '0');
    }
    if (unitSeconds) {
      unitSeconds.textContent = String(seconds).padStart(2, '0');
    }

    // --- Calendar-aware Year & Month side card calculations ---
    const startYear = 2026, startMonth = 3, startDay = 4; // April = month index 3

    // Completed calendar years
    let completedYears = now.getFullYear() - startYear;
    const lastYearlyAnniv = new Date(startYear + completedYears, startMonth, startDay);
    if (now < lastYearlyAnniv) {
      completedYears--;
    }
    const actualLastYearlyAnniv = new Date(startYear + completedYears, startMonth, startDay);
    const daysAfterYear = Math.max(0, Math.floor((now.getTime() - actualLastYearlyAnniv.getTime()) / (1000 * 60 * 60 * 24)));

    // Completed calendar months
    let completedMonths = (now.getFullYear() - startYear) * 12 + (now.getMonth() - startMonth);
    const lastMonthlyAnnivMonth = startMonth + completedMonths;
    const lastMonthlyAnnivYear = startYear + Math.floor(lastMonthlyAnnivMonth / 12);
    const lastMonthlyAnnivMo = lastMonthlyAnnivMonth % 12;
    let lastMonthlyAnniv = new Date(lastMonthlyAnnivYear, lastMonthlyAnnivMo, startDay);
    if (now < lastMonthlyAnniv) {
      completedMonths--;
      const prevMonth = startMonth + completedMonths;
      const prevYear = startYear + Math.floor(prevMonth / 12);
      const prevMo = prevMonth % 12;
      lastMonthlyAnniv = new Date(prevYear, prevMo, startDay);
    }
    const daysAfterMonth = Math.max(0, Math.floor((now.getTime() - lastMonthlyAnniv.getTime()) / (1000 * 60 * 60 * 24)));

    // Clamp to zero if before start date
    if (now < startDate) {
      completedYears = 0;
      completedMonths = 0;
    }

    // --- Next Anniversary Countdowns ---
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    // Next yearly anniversary (next occurrence of April 4)
    let nextYearlyAnniv;
    if (now < startDate) {
      nextYearlyAnniv = startDate;
    } else {
      const currentYearAnniv = new Date(now.getFullYear(), startMonth, startDay, 0, 0, 0);
      if (todayMidnight.getTime() < currentYearAnniv.getTime()) {
        nextYearlyAnniv = currentYearAnniv;
      } else {
        nextYearlyAnniv = new Date(now.getFullYear() + 1, startMonth, startDay, 0, 0, 0);
      }
    }
    const msUntilNextYear = nextYearlyAnniv.getTime() - todayMidnight.getTime();
    const daysUntilNextYear = Math.max(0, Math.round(msUntilNextYear / (1000 * 60 * 60 * 24)));

    // Next monthly anniversary (next occurrence of 4th of month)
    let nextMonthlyAnniv;
    if (now < startDate) {
      nextMonthlyAnniv = startDate;
    } else {
      const currentMonthAnniv = new Date(now.getFullYear(), now.getMonth(), startDay, 0, 0, 0);
      if (todayMidnight.getTime() < currentMonthAnniv.getTime()) {
        nextMonthlyAnniv = currentMonthAnniv;
      } else {
        nextMonthlyAnniv = new Date(now.getFullYear(), now.getMonth() + 1, startDay, 0, 0, 0);
      }
    }
    const msUntilNextMonth = nextMonthlyAnniv.getTime() - todayMidnight.getTime();
    const daysUntilNextMonth = Math.max(0, Math.round(msUntilNextMonth / (1000 * 60 * 60 * 24)));

    // Update side card DOM
    const yearsNumEl = document.getElementById('side-years-number');
    const yearsLblEl = document.getElementById('side-years-label');
    const yearsDaysEl = document.getElementById('side-years-days');
    const yearsDaysLblEl = document.getElementById('side-years-days-label');
    const yearsNextDaysEl = document.getElementById('side-years-next-days');
    const yearsNextLblEl = document.getElementById('side-years-next-lbl');

    const monthsNumEl = document.getElementById('side-months-number');
    const monthsLblEl = document.getElementById('side-months-label');
    const monthsDaysEl = document.getElementById('side-months-days');
    const monthsDaysLblEl = document.getElementById('side-months-days-label');
    const monthsNextDaysEl = document.getElementById('side-months-next-days');
    const monthsNextLblEl = document.getElementById('side-months-next-lbl');

    if (yearsNumEl) yearsNumEl.textContent = String(Math.max(0, completedYears));
    if (yearsLblEl) yearsLblEl.textContent = completedYears === 1 ? 'YEAR' : 'YEARS';
    if (yearsDaysEl) yearsDaysEl.textContent = String(now < startDate ? 0 : daysAfterYear);
    if (yearsDaysLblEl) yearsDaysLblEl.textContent = daysAfterYear === 1 ? 'DAY' : 'DAYS';
    if (yearsNextDaysEl) yearsNextDaysEl.textContent = String(daysUntilNextYear);
    if (yearsNextLblEl) yearsNextLblEl.textContent = daysUntilNextYear === 1 ? 'DAY' : 'DAYS';

    if (monthsNumEl) monthsNumEl.textContent = String(Math.max(0, completedMonths));
    if (monthsLblEl) monthsLblEl.textContent = completedMonths === 1 ? 'MONTH' : 'MONTHS';
    if (monthsDaysEl) monthsDaysEl.textContent = String(now < startDate ? 0 : daysAfterMonth);
    if (monthsDaysLblEl) monthsDaysLblEl.textContent = daysAfterMonth === 1 ? 'DAY' : 'DAYS';
    if (monthsNextDaysEl) monthsNextDaysEl.textContent = String(daysUntilNextMonth);
    if (monthsNextLblEl) monthsNextLblEl.textContent = daysUntilNextMonth === 1 ? 'DAY' : 'DAYS';
  }

  function initDaysTogetherCounter() {
    updateDaysTogetherCounter();
    setInterval(updateDaysTogetherCounter, 1000);
  }

  /* ==========================================================================
     INITIALIZATION ON DOM LOAD (PRESERVES ACTIVE PAGE & SCROLL VIA SESSIONSTORAGE)
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initAmbientCanvas();
    loadSupabasePhotos().then(() => {
      initScrapbookPhotos();
    });
    initJourneyMenu();
    renderMemoriesFromData();
    initDaysTogetherCounter();

    // Check saved page in sessionStorage
    let savedPage = null;
    try {
      savedPage = sessionStorage.getItem('currentPage');
    } catch (e) { }

    let initialPage = 1;
    if (savedPage) {
      const parsed = parseInt(savedPage, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= pages.length) {
        initialPage = parsed;
      }
    }

    showPage(initialPage, true);

    if (initialPage === 5) {
      restoreStoryScroll();
    }
  });

  // Support clean back/forward or bfcache restore without resetting page
  window.addEventListener('pageshow', () => {
    let savedPage = null;
    try {
      savedPage = sessionStorage.getItem('currentPage');
    } catch (err) { }

    if (savedPage) {
      const parsed = parseInt(savedPage, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= pages.length) {
        showPage(parsed, true);
        if (parsed === 5) {
          restoreStoryScroll();
        }
      }
    }
  });

})();
