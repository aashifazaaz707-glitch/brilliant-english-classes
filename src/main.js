import './style.css';
import { store } from './data/store.js';
import { renderAdminPanel } from './admin/admin.js';
import { SecureVideoPlayer, extractYouTubeId } from './player/securePlayer.js';

let currentView = 'admin'; // 'app', 'admin', or 'split'
let currentBannerIndex = 0;
let bannerTimer = null;

// Main App Router / Renderer
export function initApp() {
  const root = document.querySelector('#app');

  if (currentView === 'admin') {
    renderAdminPanel(
      root,
      () => { currentView = 'app'; initApp(); },
      () => { currentView = 'split'; initApp(); }
    );
  } else if (currentView === 'split') {
    renderSplitView(root);
  } else {
    renderMobileSimulator(root);
  }
}

// 1. Split Screen View: Admin on Left, Live Kotlin Android Phone on Right
function renderSplitView(root) {
  root.innerHTML = `
    <div class="split-view-container">
      <div class="split-left" id="split-admin-col"></div>
      <div class="split-right" id="split-app-col"></div>
    </div>
  `;

  const leftCol = document.getElementById('split-admin-col');
  const rightCol = document.getElementById('split-app-col');

  renderAdminPanel(
    leftCol,
    () => { currentView = 'app'; initApp(); },
    () => { currentView = 'split'; initApp(); }
  );

  renderMobileInside(rightCol, true);
}

// 2. Full Mobile Simulator View
function renderMobileSimulator(root) {
  root.innerHTML = `
    <div class="simulator-container">
      <!-- Top Simulator Controls Bar -->
      <div class="simulator-toolbar">
        <div class="simulator-badge">
          <span>●</span> Kotlin Android App Live Preview
        </div>
        <div style="display:flex; gap:8px;">
          <button id="btn-switch-admin" class="device-toggle-btn" style="background:#ffb800; color:#0f172a;">
            🛠️ Admin Panel
          </button>
          <button id="toggle-frame-btn" class="device-toggle-btn">
            Toggle Phone Frame
          </button>
        </div>
      </div>

      <div id="phone-container-slot"></div>
    </div>
  `;

  document.getElementById('btn-switch-admin').addEventListener('click', () => {
    currentView = 'admin';
    initApp();
  });

  const slot = document.getElementById('phone-container-slot');
  renderMobileInside(slot, false);

  const phoneDevice = document.getElementById('phone-device');
  const toggleBtn = document.getElementById('toggle-frame-btn');
  toggleBtn.addEventListener('click', () => {
    phoneDevice.classList.toggle('full-bleed');
    toggleBtn.textContent = phoneDevice.classList.contains('full-bleed') ? 'Switch to Phone Mockup' : 'Toggle Phone Frame';
  });
}

// Render the Mobile Phone Mockup
function renderMobileInside(container, isSplit) {
  const courses = store.courses;
  const banners = store.banners;
  const notifications = store.notifications;
  const settings = store.settings;

  // Quick Actions List (Exact requested items)
  const quickActionsData = [
    { id: 'all-courses', label: 'All Courses', icon: '🎓', bg: '#EEF2FF', color: '#4338CA' },
    { id: 'my-courses', label: 'My Courses', icon: '📚', bg: '#EFF6FF', color: '#1D4ED8' },
    { id: 'free-content', label: 'Free Content', icon: '🎁', bg: '#FEF3C7', color: '#B45309', badge: 'FREE' },
    { id: 'live-classes', label: 'Live Classes', icon: '📡', bg: '#FFE4E6', color: '#E11D48', isLive: true },
    { id: 'test-series', label: 'Test Series', icon: '📝', bg: '#F3E8FF', color: '#7E22CE' },
    { id: 'paid-notes', label: 'Paid Notes', icon: '📑', bg: '#ECFDF5', color: '#047857' },
    { id: 'free-notes', label: 'Free Notes', icon: '📄', bg: '#F0FDF4', color: '#15803D' },
    { id: 'free-videos', label: 'Free Videos', icon: '🎬', bg: '#FFF1F2', color: '#BE123C' },
    { id: 'youtube', label: 'YouTube', icon: '▶️', bg: '#FFEEEE', color: '#FF0000', url: settings.youtubeUrl },
    { id: 'instagram', label: 'Instagram', icon: '📸', bg: '#FDF2F8', color: '#C13584', url: settings.instagramUrl },
    { id: 'facebook', label: 'Facebook', icon: '👥', bg: '#EFF6FF', color: '#1877F2', url: settings.facebookUrl },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬', bg: '#F0FDF4', color: '#25D366', url: `https://wa.me/${settings.whatsapp}` },
    { id: 'share-app', label: 'Share App', icon: '🚀', bg: '#F8FAFC', color: '#334155' }
  ];

  container.innerHTML = `
    <!-- Smartphone Device Mockup -->
    <div id="phone-device" class="phone-mockup" style="${isSplit ? 'height:92vh; max-width:400px;' : ''}">
      <!-- Status Bar -->
      <div class="phone-status-bar">
        <div class="status-left">
          <span>09:41</span>
        </div>
        <div class="status-notch"></div>
        <div class="status-right">
          <span>5G</span>
          <span>📶</span>
          <span>🔋 98%</span>
        </div>
      </div>

      <!-- Phone Scrollable Content -->
      <div class="phone-screen-content" id="screen-content">
        
        <!-- 1. UNIFIED HEADER BOX -->
        <!-- Wraps Logo, Coaching Name, Notification Bell, Hello User, and Search Bar -->
        <div class="unified-header-box">
          <!-- Top Row: Logo & Name on Left, Notification Bell on Right -->
          <div class="header-top-row">
            <div class="header-brand">
              <img src="/images/logo.jpg" alt="Brilliant English Classes" class="brand-logo-img" />
              <div class="brand-text-col">
                <span class="brand-title">${settings.coachingName}</span>
                <span class="brand-subtitle">${settings.tagline}</span>
              </div>
            </div>

            <button class="notification-bell-btn" id="bell-btn" aria-label="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              ${notifications.length > 0 ? `<div class="notification-badge">${notifications.length}</div>` : ''}
            </button>
          </div>

          <!-- Just Below Logo: Hello, User text -->
          <div class="header-greeting">
            <div class="greeting-title">Hello, User 👋</div>
            <div class="greeting-subtitle">What would you like to master today?</div>
          </div>

          <!-- Below Greeting: Wide Full Length Search Course Button -->
          <button class="search-course-btn" id="search-bar-btn">
            <div class="search-icon-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <span class="search-placeholder-text">Search for courses, notes, test series...</span>
            <div class="search-mic-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </div>
          </button>
        </div>

        <!-- 2. FEATURED COURSES / NEW BATCH LAUNCHES BANNER (16:9 YouTube Thumbnail Size) -->
        <div class="featured-section">
          <div class="section-header-row">
            <div class="section-heading">⚡ New Batch Launches</div>
            <span class="section-link" id="view-all-batches">View All (${banners.length})</span>
          </div>

          <div class="banner-carousel-wrapper" id="banner-wrapper">
            <div class="banner-slides-track" id="banner-track">
              ${banners.map((b) => `
                <div class="banner-slide" data-course-id="${b.courseId}">
                  <img src="${b.image}" alt="${b.title}" class="banner-img" />
                  <div class="banner-overlay-gradient">
                    <div class="banner-badge-tag">${b.badge}</div>
                    <div class="banner-info-bottom">
                      <div>
                        <div class="banner-title-text">${b.title}</div>
                        <div class="banner-sub-text">${b.subtitle}</div>
                      </div>
                      <div class="banner-cta-pill">Join Batch →</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Dots indicator -->
          <div class="carousel-dots" id="carousel-dots">
            ${banners.map((_, i) => `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>`).join('')}
          </div>
        </div>

        <!-- 3. QUICK ACTIONS GRID (3 boxes per line) -->
        <div class="quick-actions-section">
          <div class="section-header-row">
            <div class="section-heading">Explore Resources & Categories</div>
          </div>

          <div class="quick-actions-grid">
            ${quickActionsData.map((item) => `
              <div class="action-box-item" data-action-id="${item.id}" data-url="${item.url || ''}">
                ${item.isLive ? `
                  <div class="live-pill">
                    <span class="live-dot-pulse"></span>
                    <span>LIVE</span>
                  </div>
                ` : ''}
                ${item.badge ? `
                  <div class="free-pill">${item.badge}</div>
                ` : ''}
                
                <div class="action-icon-circle" style="background: ${item.bg}; color: ${item.color};">
                  ${item.icon}
                </div>
                <span class="action-label-text">${item.label}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 4. HORIZONTALLY SCROLLING BOXES (1 COMPLETE BOX + 30% NEXT BOX PEEK) -->
        <div class="horizontal-courses-section">
          <div class="section-header-row" style="padding: 0 16px;">
            <div>
              <div class="section-heading">🔥 Popular Courses & Batches</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Swipe horizontally to explore more →</div>
            </div>
            <span class="section-link" id="view-all-popular">See All (${courses.length})</span>
          </div>

          <div class="horizontal-scroll-container" id="courses-scroll-container">
            ${courses.map((c) => `
              <div class="course-card-box" data-course-id="${c.id}">
                <!-- 16:9 Thumbnail -->
                <div class="course-thumb-wrapper">
                  <img src="${c.image}" alt="${c.title}" class="course-thumb-img" />
                  <div class="course-category-tag">${c.category}</div>
                  <div class="course-discount-tag">${c.discountPercent}% OFF</div>
                </div>

                <!-- Course Content -->
                <div class="course-card-content">
                  <div class="course-meta-row">
                    <div class="course-rating">★ ${c.rating || '5.0'} <span style="color:#64748b;font-weight:normal">(${c.students || '1k+'})</span></div>
                    <div class="course-date-badge">${c.batchDate}</div>
                  </div>

                  <div class="course-card-title">${c.title}</div>
                  <div class="course-card-faculty">By ${c.faculty}</div>

                  <!-- Pricing inside box -->
                  <div class="course-card-pricing">
                    <span class="price-discounted">₹${c.discountPrice}</span>
                    <span class="price-original">₹${c.originalPrice}</span>
                    <span class="price-savings">Save ₹${c.originalPrice - c.discountPrice}</span>
                  </div>

                  <!-- Action buttons inside every single box -->
                  <div class="course-card-actions">
                    <button class="btn-view-more" data-action="view-details" data-course-id="${c.id}">
                      View Details
                    </button>
                    <button class="btn-buy-now" data-action="buy-now" data-course-id="${c.id}">
                      ⚡ Buy Now
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 5. WHY CHOOSE BRILLIANT ENGLISH CLASSES -->
        <div class="why-us-card">
          <div style="font-size: 14.5px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
            Why ${settings.coachingName}?
          </div>
          <div class="why-us-item">
            <span style="color:#10b981; font-weight:bold;">✓</span>
            <span>100% Practical Spoken English & Grammar Rules</span>
          </div>
          <div class="why-us-item">
            <span style="color:#10b981; font-weight:bold;">✓</span>
            <span>Top Faculty with 15+ Years Coaching Experience</span>
          </div>
          <div class="why-us-item">
            <span style="color:#10b981; font-weight:bold;">✓</span>
            <span>Unlimited Access to Downloadable PDF Notes</span>
          </div>
          <div class="why-us-item">
            <span style="color:#10b981; font-weight:bold;">✓</span>
            <span>Daily Live Doubt Sessions & Speaking Clubs</span>
          </div>
        </div>

      </div>

      <!-- Sticky Floating WhatsApp Helpdesk FAB -->
      <button class="whatsapp-fab" id="whatsapp-fab" title="Chat on WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      </button>

      <!-- Sticky App Bottom Navigation Bar -->
      <nav class="app-bottom-nav">
        <button class="nav-item-btn active" data-nav="home">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>Home</span>
        </button>
        <button class="nav-item-btn" data-nav="batches">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          <span>My Batches</span>
        </button>
        <button class="nav-item-btn" data-nav="live">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
            <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
            <circle cx="12" cy="12" r="2"></circle>
            <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
            <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"></path>
          </svg>
          <span>Live</span>
        </button>
        <button class="nav-item-btn" data-nav="notes">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Notes</span>
        </button>
        <button class="nav-item-btn" data-nav="profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Profile</span>
        </button>
      </nav>

      <!-- Course Details Bottom Sheet Modal -->
      <div class="modal-backdrop" id="course-modal">
        <div class="bottom-sheet" id="course-sheet-content"></div>
      </div>

      <!-- Notifications Drawer Modal -->
      <div class="modal-backdrop" id="notifications-modal">
        <div class="bottom-sheet">
          <div class="sheet-drag-handle"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div style="font-size:18px; font-weight:800; color:#0f172a;">🔔 Notifications</div>
            <button class="sheet-close-btn" id="close-notif-btn">✕</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${notifications.map(n => `
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:14px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span style="font-size:13px; font-weight:800; color:#0f172a;">${n.title}</span>
                  <span style="font-size:10px; color:#94a3b8; font-weight:600;">${n.time}</span>
                </div>
                <p style="font-size:12px; color:#475569; line-height:1.4;">${n.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Search Modal -->
      <div class="modal-backdrop" id="search-modal">
        <div class="bottom-sheet" style="max-height:92%;">
          <div class="sheet-drag-handle"></div>
          <div style="display:flex; gap:10px; align-items:center; margin-bottom:16px;">
            <input type="text" id="live-search-input" placeholder="Type course name (e.g. Spoken, SSC)..." 
              style="flex:1; height:46px; border:1.5px solid #1340b5; border-radius:12px; padding:0 14px; font-size:14px; outline:none; font-family:inherit;" />
            <button class="sheet-close-btn" id="close-search-btn">✕</button>
          </div>
          <div id="search-results-list" style="display:flex; flex-direction:column; gap:10px;"></div>
        </div>
      </div>

      <!-- Anti-Leak Video Player Modal (Secured YouTube Player) -->
      <div class="modal-backdrop" id="video-player-modal">
        <div class="bottom-sheet" style="max-height:95%; padding:14px 16px 20px; display:flex; flex-direction:column;">
          <div class="sheet-drag-handle"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="background:#fee2e2; color:#ef4444; font-size:11px; font-weight:800; padding:3px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:4px;">
                <span style="width:6px; height:6px; border-radius:50%; background:#ef4444;"></span>
                SECURE STREAM
              </span>
              <span style="font-size:11px; color:#64748b; font-weight:600;">Anti-Piracy Shield Active</span>
            </div>
            <button class="sheet-close-btn" id="close-video-modal-btn">✕</button>
          </div>
          
          <!-- Video Player Mount -->
          <div id="mobile-video-player-mount" style="width:100%; aspect-ratio:16/9; background:#000; border-radius:14px; overflow:hidden;"></div>

          <!-- Video Title & Details -->
          <div id="player-sheet-details" style="margin-top:14px; overflow-y:auto; flex:1;"></div>
        </div>
      </div>

    </div>
  `;

  attachMobileInteractions(container);
}

function attachMobileInteractions(container) {
  const courses = store.courses;
  const banners = store.banners;
  const settings = store.settings;

  // Carousel
  const bannerTrack = container.querySelector('#banner-track');
  const dots = container.querySelectorAll('.carousel-dot');

  function updateCarousel(idx) {
    if (!banners.length) return;
    currentBannerIndex = idx;
    if (bannerTrack) bannerTrack.style.transform = `translateX(-${currentBannerIndex * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === currentBannerIndex);
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-idx'));
      updateCarousel(idx);
    });
  });

  if (bannerTimer) clearInterval(bannerTimer);
  if (banners.length > 1) {
    bannerTimer = setInterval(() => {
      const nextIdx = (currentBannerIndex + 1) % banners.length;
      updateCarousel(nextIdx);
    }, 4500);
  }

  // Banner click
  container.querySelectorAll('.banner-slide').forEach(slide => {
    slide.addEventListener('click', () => {
      const courseId = slide.getAttribute('data-course-id');
      openCourseModal(container, courseId);
    });
  });

  // Course card action buttons
  container.querySelectorAll('[data-action="view-details"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const courseId = btn.getAttribute('data-course-id');
      openCourseModal(container, courseId);
    });
  });

  container.querySelectorAll('[data-action="buy-now"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const courseId = btn.getAttribute('data-course-id');
      initiateEnrollment(courseId);
    });
  });

  // Notifications modal
  const notifModal = container.querySelector('#notifications-modal');
  const bellBtn = container.querySelector('#bell-btn');
  if (bellBtn) {
    bellBtn.addEventListener('click', () => {
      notifModal.classList.add('open');
    });
  }
  const closeNotif = container.querySelector('#close-notif-btn');
  if (closeNotif) {
    closeNotif.addEventListener('click', () => {
      notifModal.classList.remove('open');
    });
  }

  // Search modal
  const searchModal = container.querySelector('#search-modal');
  const searchInput = container.querySelector('#live-search-input');
  const searchResults = container.querySelector('#search-results-list');
  const searchBtn = container.querySelector('#search-bar-btn');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchModal.classList.add('open');
      searchInput.focus();
      renderSearchResults('');
    });
  }

  const closeSearch = container.querySelector('#close-search-btn');
  if (closeSearch) {
    closeSearch.addEventListener('click', () => {
      searchModal.classList.remove('open');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });
  }

  function renderSearchResults(query) {
    const filtered = store.courses.filter(c => 
      c.title.toLowerCase().includes(query.toLowerCase()) || 
      c.category.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      searchResults.innerHTML = `<div style="text-align:center; padding:20px; color:#94a3b8; font-size:13px;">No courses found matching "${query}".</div>`;
      return;
    }

    searchResults.innerHTML = filtered.map(c => `
      <div style="display:flex; align-items:center; gap:12px; padding:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; cursor:pointer;" data-result-id="${c.id}">
        <img src="${c.image}" style="width:70px; aspect-ratio:16/9; object-fit:cover; border-radius:8px;" />
        <div style="flex:1;">
          <div style="font-size:13px; font-weight:700; color:#0f172a;">${c.title}</div>
          <div style="font-size:12px; font-weight:800; color:#1340b5;">₹${c.discountPrice} <span style="text-decoration:line-through; color:#94a3b8; font-size:11px;">₹${c.originalPrice}</span></div>
        </div>
        <button style="background:#1340b5; color:#fff; border:none; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:bold;">View</button>
      </div>
    `).join('');

    searchResults.querySelectorAll('[data-result-id]').forEach(item => {
      item.addEventListener('click', () => {
        searchModal.classList.remove('open');
        openCourseModal(container, item.getAttribute('data-result-id'));
      });
    });
  }

  // Quick action items
  container.querySelectorAll('.action-box-item').forEach(item => {
    item.addEventListener('click', () => {
      const actionId = item.getAttribute('data-action-id');
      const url = item.getAttribute('data-url');

      if (url) {
        window.open(url, '_blank');
        return;
      }

      switch (actionId) {
        case 'all-courses':
        case 'my-courses':
          container.querySelector('#courses-scroll-container').scrollIntoView({ behavior: 'smooth' });
          break;
        case 'live-classes':
        case 'free-videos':
          openStudentPlayerModal(container);
          break;
        case 'free-content':
        case 'free-notes':
        case 'paid-notes':
        case 'test-series':
          alert(`Opening ${item.querySelector('.action-label-text').innerText} section for Brilliant English Classes.`);
          break;
        case 'share-app':
          if (navigator.share) {
            navigator.share({
              title: `${settings.coachingName} App`,
              text: 'Master English fluency and crack competitive exams with Brilliant English Classes app!',
              url: window.location.href
            }).catch(() => {});
          } else {
            navigator.clipboard.writeText(window.location.href);
            alert('App link copied to clipboard! Share it with your friends.');
          }
          break;
      }
    });
  });

  // Close Video Player Modal
  const closeVideoBtn = container.querySelector('#close-video-modal-btn');
  if (closeVideoBtn) {
    closeVideoBtn.addEventListener('click', () => {
      const vModal = container.querySelector('#video-player-modal');
      if (vModal) vModal.classList.remove('open');
      if (activeMobilePlayer) {
        activeMobilePlayer.destroy();
        activeMobilePlayer = null;
      }
    });
  }

  // WhatsApp FAB
  const fab = container.querySelector('#whatsapp-fab');
  if (fab) {
    fab.addEventListener('click', () => {
      window.open(`https://wa.me/${settings.whatsapp}?text=Hello%20${encodeURIComponent(settings.coachingName)},%20I%20want%20to%20know%20more%20about%20your%20courses.`, '_blank');
    });
  }

  // Bottom Nav items
  container.querySelectorAll('.nav-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.nav-item-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Close modals on backdrop click
  container.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        if (modal.id === 'video-player-modal' && activeMobilePlayer) {
          activeMobilePlayer.destroy();
          activeMobilePlayer = null;
        }
      }
    });
  });
}

let activeMobilePlayer = null;

function openStudentPlayerModal(container, courseId = null, specificVideoId = null) {
  const modal = container.querySelector('#video-player-modal');
  const mount = container.querySelector('#mobile-video-player-mount');
  const details = container.querySelector('#player-sheet-details');

  const course = store.courses.find(c => c.id === courseId) || store.courses[0];
  const courseLectures = store.lectures.filter(l => !courseId || l.courseId === course.id);
  const selectedLecture = specificVideoId 
    ? store.lectures.find(l => l.videoId === specificVideoId) 
    : (courseLectures[0] || store.lectures[0] || {
        title: 'Parts of Speech: English Grammar Masterclass',
        videoId: 'wdaBwIv7Jso',
        duration: 'Auto-sync',
        isLive: false
      });

  if (activeMobilePlayer) {
    activeMobilePlayer.destroy();
    activeMobilePlayer = null;
  }

  // Mount SecureVideoPlayer (YouTube pointer blocked + Custom Speed, Scrubber, Quality & Play/Pause controls)
  activeMobilePlayer = new SecureVideoPlayer(mount, {
    videoId: selectedLecture.videoId,
    title: selectedLecture.title,
    isLive: selectedLecture.isLive,
    studentPhone: '+91 98123 45678',
    studentId: 'BEC-9842'
  });

  details.innerHTML = `
    <div style="font-size:16px; font-weight:800; color:#0f172a; margin-bottom:4px;">
      ${selectedLecture.title}
    </div>
    <div style="font-size:12px; color:#64748b; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
      <span>Batch: <strong style="color:#1340b5;">${course.title}</strong></span>
      <span>•</span>
      <span>⏱ ${selectedLecture.duration}</span>
    </div>

    <div style="background:#f1f5f9; border-radius:10px; padding:10px 12px; font-size:11.5px; color:#334155; margin-bottom:16px; border-left:3px solid #1340b5;">
      🛡️ <strong>Anti-Leak Protection:</strong> Native YouTube player links and sharing are completely blocked. Watermark protects teacher lecture rights.
    </div>

    <!-- Course Lectures / Syllabus Playlist -->
    <div style="font-size:13.5px; font-weight:800; color:#0f172a; margin-bottom:10px;">
      Lectures in this Course (${store.lectures.length}):
    </div>
    <div style="display:flex; flex-direction:column; gap:8px;">
      ${store.lectures.map(l => `
        <div class="player-playlist-item" data-vid="${l.videoId}" style="display:flex; align-items:center; gap:10px; padding:8px 12px; background:${l.videoId === selectedLecture.videoId ? '#e0e7ff' : '#f8fafc'}; border:1px solid ${l.videoId === selectedLecture.videoId ? '#1340b5' : '#e2e8f0'}; border-radius:10px; cursor:pointer;">
          <div style="width:28px; height:28px; border-radius:50%; background:${l.videoId === selectedLecture.videoId ? '#1340b5' : '#cbd5e1'}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold;">
            ${l.isLive ? '🔴' : '▶'}
          </div>
          <div style="flex:1;">
            <div style="font-size:12.5px; font-weight:700; color:#0f172a;">${l.title}</div>
            <div style="font-size:11px; color:#64748b;">${l.duration} • ${l.isLive ? 'Live Class' : 'Recorded Video'}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  modal.classList.add('open');

  // Playlist item click
  details.querySelectorAll('.player-playlist-item').forEach(item => {
    item.addEventListener('click', () => {
      const vid = item.getAttribute('data-vid');
      openStudentPlayerModal(container, courseId, vid);
    });
  });
}

function openCourseModal(container, courseId) {
  const course = store.courses.find(c => c.id === courseId) || store.courses[0];
  const modal = container.querySelector('#course-modal');
  const sheetContent = container.querySelector('#course-sheet-content');

  sheetContent.innerHTML = `
    <div class="sheet-drag-handle"></div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <span style="background:#e0e7ff; color:#1340b5; font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px;">
        ${course.category}
      </span>
      <button class="sheet-close-btn" id="close-course-modal">✕</button>
    </div>

    <!-- 16:9 Thumbnail Preview (Clickable to Watch Demo) -->
    <div id="course-modal-thumbnail" style="position:relative; width:100%; aspect-ratio:16/9; border-radius:14px; overflow:hidden; margin-bottom:12px; cursor:pointer;" title="Tap to watch demo lecture">
      <img src="${course.image}" style="width:100%; height:100%; object-fit:cover;" />
      <div style="position:absolute; inset:0; background:rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;">
        <div style="width:50px; height:50px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; color:#1340b5; box-shadow:0 4px 14px rgba(0,0,0,0.3); font-size:18px;">
          ▶
        </div>
      </div>
      <div style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.7); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px;">
        Preview Class
      </div>
    </div>

    <!-- Watch Demo Lecture CTA -->
    <button id="btn-watch-demo" style="width:100%; height:40px; background:#eff6ff; border:1px solid #93c5fd; border-radius:10px; color:#1d4ed8; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:14px; cursor:pointer;">
      <span>▶</span>
      <span>Watch Free Demo Lecture (Anti-Leak Player)</span>
    </button>

    <div style="font-size:18px; font-weight:800; color:#0f172a; line-height:1.25; margin-bottom:4px;">
      ${course.title}
    </div>
    <div style="font-size:12px; color:#64748b; margin-bottom:12px;">
      Mentor: <strong style="color:#0f172a;">${course.faculty}</strong> • 📅 ${course.batchDate}
    </div>

    <p style="font-size:13px; color:#475569; line-height:1.5; margin-bottom:16px;">
      ${course.description}
    </p>

    <!-- Features -->
    <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:8px;">
      What You Will Learn:
    </div>
    <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:20px;">
      ${(course.features || []).map(f => `
        <div style="display:flex; align-items:flex-start; gap:8px; font-size:12.5px; color:#334155;">
          <span style="color:#10b981; font-weight:bold;">✓</span>
          <span>${f}</span>
        </div>
      `).join('')}
    </div>

    <!-- Sticky Bottom Buy Now -->
    <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid #e2e8f0; padding-top:14px; margin-top:auto;">
      <div>
        <div style="font-size:22px; font-weight:900; color:#0f172a;">₹${course.discountPrice}</div>
        <div style="font-size:12px; color:#94a3b8; text-decoration:line-through;">₹${course.originalPrice} (${course.discountPercent}% OFF)</div>
      </div>
      <button id="modal-enroll-btn" style="background:#1340b5; color:#fff; border:none; height:46px; padding:0 24px; border-radius:12px; font-size:14px; font-weight:800; cursor:pointer; box-shadow:0 4px 14px rgba(19,64,181,0.3);">
        ⚡ Enroll in Batch
      </button>
    </div>
  `;

  modal.classList.add('open');

  container.querySelector('#close-course-modal').addEventListener('click', () => {
    modal.classList.remove('open');
  });

  const thumb = container.querySelector('#course-modal-thumbnail');
  if (thumb) {
    thumb.addEventListener('click', () => {
      openStudentPlayerModal(container, course.id);
    });
  }

  const watchDemoBtn = container.querySelector('#btn-watch-demo');
  if (watchDemoBtn) {
    watchDemoBtn.addEventListener('click', () => {
      openStudentPlayerModal(container, course.id);
    });
  }

  container.querySelector('#modal-enroll-btn').addEventListener('click', () => {
    modal.classList.remove('open');
    initiateEnrollment(course.id);
  });
}

function initiateEnrollment(courseId) {
  const course = store.courses.find(c => c.id === courseId) || store.courses[0];
  alert(`🎓 Congratulations! Proceeding to Payment & Enrollment for:\n\n${course.title}\nDiscount Price: ₹${course.discountPrice}\n\n(In production, this opens Razorpay / PhonePe SDK)`);
}

// Subscribe to store updates for live sync
store.subscribe(() => {
  if (currentView === 'split') {
    const rightCol = document.getElementById('split-app-col');
    if (rightCol) renderMobileInside(rightCol, true);
  } else if (currentView === 'app') {
    const slot = document.getElementById('phone-container-slot');
    if (slot) renderMobileInside(slot, false);
  }
});

// Start App
initApp();
