import './style.css';
import { store } from './data/store.js';
import { authService } from './data/auth.js';
import { renderAdminPanel } from './admin/admin.js';
import { SecureVideoPlayer, extractYouTubeId } from './player/securePlayer.js';

let currentView = 'app'; // Default to student app
let currentStudentTab = 'home'; // 'home', 'batches', 'notes', 'profile'
let currentBannerIndex = 0;
let bannerTimer = null;
let activeMobilePlayer = null;

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
          <span>●</span> Student Mobile App • Live Production Simulator
        </div>
        <div style="display:flex; gap:8px;">
          <button id="btn-switch-admin" class="device-toggle-btn" style="background:#ffb800; color:#0f172a; font-weight:700;">
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

// Production Quick Actions (Exact clean 12 items with real-time enrollment badge)
function getQuickActionsData() {
  const enrolledCount = store.getUserEnrolledCourses().length;
  return [
    { id: 'all-courses', label: 'All Courses', icon: '🎓', bg: '#EEF2FF', color: '#4338CA' },
    { id: 'my-courses', label: 'My Batches', icon: '📚', bg: '#EFF6FF', color: '#1D4ED8', badge: enrolledCount > 0 ? `${enrolledCount} ENROLLED` : '' },
    { id: 'live-classes', label: 'Live Classes', icon: '📡', bg: '#FFE4E6', color: '#E11D48', isLive: true },
    { id: 'free-content', label: 'Free Content', icon: '🎁', bg: '#FEF3C7', color: '#B45309', badge: 'FREE' },
    { id: 'test-series', label: 'Test Series', icon: '📝', bg: '#F3E8FF', color: '#7E22CE' },
    { id: 'paid-notes', label: 'Paid Notes', icon: '📑', bg: '#ECFDF5', color: '#047857' },
    { id: 'free-notes', label: 'Free Notes', icon: '📄', bg: '#F0FDF4', color: '#15803D' },
    { id: 'free-videos', label: 'Free Videos', icon: '🎬', bg: '#FFF1F2', color: '#BE123C' },
    { id: 'youtube', label: 'YouTube', icon: '▶️', bg: '#FFEEEE', color: '#FF0000' },
    { id: 'instagram', label: 'Instagram', icon: '📸', bg: '#FDF2F8', color: '#C13584' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬', bg: '#F0FDF4', color: '#25D366' },
    { id: 'share-app', label: 'Share App', icon: '🚀', bg: '#F8FAFC', color: '#334155' }
  ];
}

// Notes list data
const studyNotesList = [
  { id: 'n1', title: 'Tenses & Active-Passive Mastery Formula', pages: '24 Pages', category: 'Grammar', size: '2.4 MB', tag: 'FREE PDF' },
  { id: 'n2', title: '1000 Most Common Spoken English Idioms & Phrases', pages: '48 Pages', category: 'Spoken', size: '4.8 MB', tag: 'CLASS NOTES' },
  { id: 'n3', title: 'SSC CGL & CHSL 10-Year Solved English PYQs', pages: '62 Pages', category: 'SSC PYQ', size: '6.1 MB', tag: 'EXCLUSIVE' },
  { id: 'n4', title: 'Daily Spoken English Conversation Scripts & Drills', pages: '36 Pages', category: 'Spoken', size: '3.9 MB', tag: 'CLASS NOTES' },
  { id: 'n5', title: 'Golden Rules of Subject-Verb Agreement with Examples', pages: '18 Pages', category: 'Grammar', size: '1.8 MB', tag: 'FREE PDF' },
  { id: 'n6', title: 'Bank PO & Clerk Cloze Test & Reading Comprehension', pages: '42 Pages', category: 'Banking', size: '4.2 MB', tag: 'EXCLUSIVE' }
];

// Render the Mobile Phone Mockup
function renderMobileInside(container, isSplit) {
  const settings = store.settings;
  const notifications = store.notifications;

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

      <!-- Phone Scrollable Content (Dynamic Tab Screen) -->
      <div class="phone-screen-content" id="screen-content"></div>

      <!-- Sticky Floating WhatsApp Helpdesk FAB -->
      <button class="whatsapp-fab" id="whatsapp-fab" title="Chat with Krishna Kumar Sir on WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      </button>

      <!-- Sticky App Bottom Navigation Bar -->
      <nav class="app-bottom-nav">
        <button class="nav-item-btn ${currentStudentTab === 'home' ? 'active' : ''}" data-nav="home">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>Home</span>
        </button>
        <button class="nav-item-btn ${currentStudentTab === 'batches' ? 'active' : ''}" data-nav="batches">
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
        <button class="nav-item-btn ${currentStudentTab === 'notes' ? 'active' : ''}" data-nav="notes">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Notes</span>
        </button>
        <button class="nav-item-btn ${currentStudentTab === 'profile' ? 'active' : ''}" data-nav="profile">
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
            <input type="text" id="live-search-input" placeholder="Search Spoken English, SSC, Notes..." 
              style="flex:1; height:46px; border:1.5px solid #1340b5; border-radius:12px; padding:0 14px; font-size:14px; outline:none; font-family:inherit;" />
            <button class="sheet-close-btn" id="close-search-btn">✕</button>
          </div>
          <div id="search-results-list" style="display:flex; flex-direction:column; gap:10px;"></div>
        </div>
      </div>

      <!-- Production Video Player Modal -->
      <div class="modal-backdrop" id="video-player-modal">
        <div class="bottom-sheet" style="max-height:95%; padding:14px 16px 20px; display:flex; flex-direction:column;">
          <div class="sheet-drag-handle"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="live-dot-pulse"></span>
              <span style="font-size:14px; font-weight:800; color:#0f172a;">Video Classroom Player</span>
            </div>
            <button class="sheet-close-btn" id="close-video-modal-btn">✕</button>
          </div>
          
          <div id="mobile-video-player-mount" style="width:100%; aspect-ratio:16/9; background:#000; border-radius:14px; overflow:hidden; position:relative;"></div>
          <div id="player-sheet-details" style="margin-top:14px; overflow-y:auto; flex:1; padding-right:4px;"></div>
        </div>
      </div>

      <!-- Supabase Auth / Google Sign-In Modal -->
      <!-- Supabase Auth / Google Sign-In Modal (Google Only) -->
      <div class="modal-backdrop" id="auth-modal">
        <div class="bottom-sheet" style="max-height:85%; padding:22px 18px 28px;">
          <div class="sheet-drag-handle"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #1340b5, #1d4ed8); display:flex; align-items:center; justify-content:center; color:#fff; font-size:17px;">🎓</div>
              <div>
                <div style="font-size:15px; font-weight:800; color:#0f172a;">${settings.coachingName}</div>
                <div style="font-size:11px; color:#64748b;">Official Student Portal</div>
              </div>
            </div>
            <button class="sheet-close-btn" id="close-auth-modal-btn">✕</button>
          </div>

          <div style="text-align:center; padding:10px 4px 18px;">
            <div style="width:52px; height:52px; border-radius:50%; background:#eff6ff; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; border:1px solid #bfdbfe;">
              <svg width="26" height="26" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div style="font-size:19px; font-weight:900; color:#0f172a; letter-spacing:-0.2px;">Sign In with Google</div>
            <div style="font-size:12.5px; color:#64748b; margin-top:6px; line-height:1.5;">
              Sign in with your Google account for instant verified access to your courses, video lectures, downloadable notes, and student roll ID.
            </div>
          </div>

          <div id="auth-status-message" style="display:none; padding:12px 14px; border-radius:12px; font-size:12.5px; margin-bottom:16px; text-align:center;"></div>

          <!-- PRIMARY SOLE ACTION: GOOGLE SIGN IN -->
          <button class="google-signin-btn" id="btn-google-signin" style="width:100%; height:52px; font-size:15px; font-weight:700; box-shadow:0 4px 14px rgba(0,0,0,0.08); border-radius:14px; display:flex; align-items:center; justify-content:center; gap:12px; border:1px solid #dadce0; background:#ffffff; color:#3c4043; cursor:pointer; transition:all 0.2s ease;">
            <svg class="google-logo-svg" style="width:22px; height:22px;" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <!-- Security Badges -->
          <div style="margin-top:18px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px; font-size:11.5px; color:#475569;">
              <span style="color:#10b981; font-weight:bold;">✓</span>
              <span>1-Tap Instant Sign-In — No passwords to remember</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; font-size:11.5px; color:#475569;">
              <span style="color:#10b981; font-weight:bold;">✓</span>
              <span>Automatic verified Student ID & Enrollment sync</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; font-size:11.5px; color:#475569;">
              <span style="color:#10b981; font-weight:bold;">✓</span>
              <span>Secured by Google OAuth & Supabase Database</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Verified Student Fee Receipt Modal -->
      <div class="modal-backdrop" id="fee-receipt-modal">
        <div class="bottom-sheet" style="max-height:92%;">
          <div class="sheet-drag-handle"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="font-size:16px; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:6px;">
              <span>🧾</span>
              <span>Official Student Fee Receipt</span>
            </div>
            <button class="sheet-close-btn" id="close-receipt-modal-btn">✕</button>
          </div>

          <div class="fee-receipt-card">
            <div class="receipt-stamp">PAID & VERIFIED</div>
            <div style="text-align:center; margin-bottom:14px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
              <div style="font-size:16px; font-weight:900; color:#1340b5;">${settings.coachingName}</div>
              <div style="font-size:11px; color:#475569; font-weight:600;">Reg. No: SSE/BIH/2026/0842</div>
              <div style="font-size:10.5px; color:#64748b; margin-top:2px;">Head Teacher: <strong>${settings.teacherName || 'Krishna Kumar'}</strong></div>
              <div style="font-size:10px; color:#64748b; margin-top:2px;">${settings.address}</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:5px;">
              <div class="receipt-row">
                <span class="receipt-label">Receipt Number:</span>
                <span class="receipt-value" style="font-family:monospace; color:#1340b5;" id="receipt-modal-num">SSE-REC-2026-0001</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Student Name:</span>
                <span class="receipt-value" id="receipt-modal-name">Verified Student</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Roll ID:</span>
                <span class="receipt-value" style="font-weight:800;" id="receipt-modal-roll">SSE-2026-ACTIVE</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Enrolled Batches:</span>
                <span class="receipt-value" id="receipt-modal-batches">All Active Batches</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Admission Mode:</span>
                <span class="receipt-value">Online App Access + Offline Support</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Admission Date:</span>
                <span class="receipt-value" id="receipt-modal-date">Academic Session 2026</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Validity Period:</span>
                <span class="receipt-value">Full Year 2026</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Payment Mode:</span>
                <span class="receipt-value">Online Direct Enrollment</span>
              </div>
              <div class="receipt-row" style="background:#f0fdf4; padding:8px 10px; border-radius:8px; margin-top:6px; border:1px solid #bbf7d0;">
                <span class="receipt-label" style="color:#166534; font-weight:800; font-size:13px;">Fee Status:</span>
                <span class="receipt-value" style="color:#166534; font-weight:900; font-size:15px;" id="receipt-modal-amount">VERIFIED & ENROLLED</span>
              </div>
            </div>

            <div style="margin-top:14px; padding-top:10px; border-top:1px dashed #cbd5e1; display:flex; justify-content:space-between; align-items:flex-end;">
              <div>
                <div style="font-size:9.5px; color:#94a3b8;">Issued by: Smart Study English Classes</div>
                <div style="font-size:9.5px; color:#94a3b8;">Center: Madhepur, Madhubani, Bihar</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:12px; font-weight:800; color:#0f172a; font-family:'Brush Script MT', cursive, sans-serif;">Krishna Kumar</div>
                <div style="font-size:9.5px; color:#64748b; font-weight:700;">Authorized Signatory</div>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:10px; margin-top:14px;">
            <button id="btn-download-pdf-receipt" style="flex:1; height:42px; background:#1340b5; color:#fff; border:none; border-radius:10px; font-size:12.5px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
              <span>📥 Download PDF</span>
            </button>
            <button id="btn-print-receipt" style="height:42px; padding:0 16px; background:#f8fafc; border:1px solid #e2e8f0; color:#334155; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer;">
              🖨️ Print
            </button>
          </div>
        </div>
      </div>

      <!-- Comprehensive Legal Policies, Terms & Developer Disclaimer Modal -->
      <div class="modal-backdrop" id="legal-docs-modal">
        <div class="bottom-sheet" style="max-height:94%;">
          <div class="sheet-drag-handle"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="font-size:16px; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:6px;">
              <span>⚖️</span>
              <span id="legal-modal-title">Terms & Legal Documents</span>
            </div>
            <button class="sheet-close-btn" id="close-legal-modal-btn">✕</button>
          </div>

          <!-- Document Selector Tabs -->
          <div class="legal-tabs-row" id="legal-tabs-row">
            <button class="legal-tab-btn active" data-tab="terms">Terms & Conditions</button>
            <button class="legal-tab-btn" data-tab="privacy">Privacy Policy</button>
            <button class="legal-tab-btn" data-tab="developer">Developer Disclaimer</button>
          </div>

          <!-- Dynamic Document Content Container -->
          <div class="legal-document-container" id="legal-document-content">
            <!-- Populated dynamically via JS -->
          </div>
        </div>
      </div>

      <!-- Interactive Practice Quiz Modal -->
      <div class="modal-backdrop" id="practice-quiz-modal">
        <div class="bottom-sheet" style="max-height:94%;">
          <div class="sheet-drag-handle"></div>
          <div id="practice-quiz-content"></div>
        </div>
      </div>

    </div>
  `;

  // Render initial tab content
  switchStudentTab(container, currentStudentTab);

  // Setup Global Modals & Navigation Event Listeners
  attachGlobalEventListeners(container);
}

// Tab Switcher
function switchStudentTab(container, tabName) {
  currentStudentTab = tabName;
  const screenContent = container.querySelector('#screen-content');
  if (!screenContent) return;

  // Update Bottom Nav active state
  container.querySelectorAll('.nav-item-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-nav') === tabName);
  });

  const settings = store.settings;
  const courses = store.courses;
  const banners = store.banners;
  const notifications = store.notifications;

  if (tabName === 'home') {
    screenContent.innerHTML = renderHomeScreenHtml(settings, courses, banners, notifications, getQuickActionsData());
    attachHomeInteractions(container);
  } else if (tabName === 'batches') {
    screenContent.innerHTML = renderMyBatchesScreenHtml(settings, courses);
    attachBatchesInteractions(container);
  } else if (tabName === 'profile') {
    screenContent.innerHTML = renderProfileScreenHtml(settings);
    attachProfileInteractions(container);
  } else if (tabName === 'notes') {
    screenContent.innerHTML = renderNotesScreenHtml(settings);
    attachNotesInteractions(container);
  } else if (tabName === 'live') {
    openStudentPlayerModal(container, null, null, true);
  }

  screenContent.scrollTop = 0;
}

// ========================================================
// 1. HOME SCREEN HTML
// ========================================================
function renderHomeScreenHtml(settings, courses, banners, notifications, quickActions) {
  const currentUser = authService.getCurrentUser();
  const firstName = currentUser ? currentUser.fullName.split(' ')[0] : 'Student';
  const greetingSubtitle = currentUser 
    ? `Roll ID: ${currentUser.rollId} • Guided by Krishna Kumar Sir`
    : `Join Krishna Kumar Sir • Learn • Practice • Master`;

  return `
    <!-- UNIFIED HEADER BOX -->
    <div class="unified-header-box">
      <div class="header-top-row">
        <div class="header-brand">
          <img src="/images/logo.jpg" alt="${settings.coachingName}" class="brand-logo-img" />
          <div class="brand-text-col">
            <span class="brand-title">${settings.coachingName}</span>
            <span class="brand-subtitle">${settings.tagline}</span>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          ${currentUser ? `
            <div class="header-user-avatar" id="header-avatar-btn" title="View Profile (${currentUser.fullName})">
              ${currentUser.avatarUrl ? `<img src="${currentUser.avatarUrl}" alt="${currentUser.fullName}" />` : currentUser.fullName.slice(0, 2).toUpperCase()}
            </div>
          ` : `
            <button class="header-signin-badge" id="header-signin-btn" title="Sign In with Google" style="cursor:pointer; display:flex; align-items:center; gap:6px; background:#ffffff; color:#1e293b; border:1px solid #cbd5e1; padding:6px 11px; border-radius:20px; font-weight:700; font-size:11.5px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
              <svg width="13" height="13" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign In</span>
            </button>
          `}

          <button class="notification-bell-btn" id="bell-btn" aria-label="Notifications">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            ${notifications.length > 0 ? `<div class="notification-badge">${notifications.length}</div>` : ''}
          </button>
        </div>
      </div>

      <div class="header-greeting">
        <div class="greeting-title">Hello, ${firstName} 👋</div>
        <div class="greeting-subtitle">${greetingSubtitle}</div>
      </div>

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

    <!-- FEATURED BANNERS CAROUSEL -->
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

      <div class="carousel-dots" id="carousel-dots">
        ${banners.map((_, i) => `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>`).join('')}
      </div>
    </div>

    <!-- QUICK ACTIONS GRID (Clean 12-item grid, Student Profile removed per request) -->
    <div class="quick-actions-section">
      <div class="section-header-row">
        <div class="section-heading">Explore Resources & Categories</div>
      </div>

      <div class="quick-actions-grid">
        ${quickActions.map((item) => `
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

    <!-- HORIZONTALLY SCROLLING POPULAR COURSES -->
    <div class="horizontal-courses-section">
      <div class="section-header-row" style="padding: 0 16px;">
        <div>
          <div class="section-heading">🔥 Popular Courses & Batches</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Swipe horizontally to explore more →</div>
        </div>
        <span class="section-link" id="view-all-popular">See All (${courses.length})</span>
      </div>

      <div class="horizontal-scroll-container" id="courses-scroll-container">
        ${courses.map((c) => {
          const isEnrolled = store.isCourseEnrolled(c.id);
          return `
            <div class="course-card-box" data-course-id="${c.id}">
              <div class="course-thumb-wrapper">
                <img src="${c.image}" alt="${c.title}" class="course-thumb-img" />
                <div class="course-category-tag">${c.category}</div>
                <div class="course-discount-tag">${c.discountPercent}% OFF</div>
              </div>

              <div class="course-card-content">
                <div class="course-meta-row">
                  <div class="course-rating">★ ${c.rating || '5.0'} <span style="color:#64748b;font-weight:normal">(${c.students || '1k+'})</span></div>
                  <div class="course-date-badge">${c.batchDate}</div>
                </div>

                <div class="course-card-title">${c.title}</div>
                <div class="course-card-faculty">By ${c.faculty}</div>

                <div class="course-card-pricing">
                  ${isEnrolled ? `
                    <span class="price-discounted" style="color:#10b981; font-weight:800; font-size:13px;">✓ ENROLLED</span>
                    <span style="font-size:11px; color:#166534; font-weight:600;">Full Access</span>
                  ` : c.isFree ? `
                    <span class="price-discounted" style="color:#10b981; font-weight:900;">FREE BATCH</span>
                    <span style="font-size:11px; color:#10b981; font-weight:700;">● 100% Free</span>
                  ` : `
                    <span class="price-discounted">₹${c.discountPrice}</span>
                    <span class="price-original">₹${c.originalPrice}</span>
                    <span class="price-save-badge">Save ₹${c.originalPrice - c.discountPrice}</span>
                  `}
                </div>

                <div class="course-card-actions">
                  ${isEnrolled ? `
                    <button class="btn-buy-now" data-action="view-details" data-course-id="${c.id}" style="width:100%; background:#10b981; border:none; height:38px; border-radius:10px; font-weight:800; color:#fff; cursor:pointer;">
                      ▶ Continue Learning
                    </button>
                  ` : `
                    <button class="btn-buy-now" data-action="view-details" data-course-id="${c.id}" style="width:100%; background:#1340b5; border:none; height:38px; border-radius:10px; font-weight:800; color:#fff; cursor:pointer;">
                      ⚡ View Batch & Enroll →
                    </button>
                  `}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- WHY CHOOSE SMART STUDY ENGLISH CLASSES -->
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
        <span>Led by Krishna Kumar with 15+ Years Coaching Mastery</span>
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

    <!-- INSTITUTE CENTER INFORMATION CARD -->
    <div class="institute-contact-card" style="background:#ffffff; border-radius:18px; padding:16px; margin: 12px 16px 24px 16px; box-shadow:0 2px 10px rgba(0,0,0,0.04); border:1px solid #e2e8f0;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
        <span style="font-size:20px;">🏛️</span>
        <div>
          <div style="font-size:14px; font-weight:800; color:#0f172a;">${settings.coachingName}</div>
          <div style="font-size:11px; color:#1340b5; font-weight:700;">Offline Classroom & Head Center</div>
        </div>
      </div>

      <div style="background:#f8fafc; border-radius:12px; padding:12px; border:1px solid #edf2f7; display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
        <div style="display:flex; gap:8px; align-items:flex-start;">
          <span style="font-size:14px; margin-top:1px;">👨‍🏫</span>
          <div style="font-size:12px; color:#334155; line-height:1.4;">
            <span style="font-weight:700; color:#0f172a;">Lead Instructor & Legal Head:</span>
            <div style="color:#0f172a; font-weight:600;">${settings.teacherName || settings.legalName || 'Krishna Kumar'}</div>
          </div>
        </div>

        <div style="display:flex; gap:8px; align-items:flex-start;">
          <span style="font-size:14px; margin-top:1px;">📍</span>
          <div style="font-size:12px; color:#334155; line-height:1.4;">
            <span style="font-weight:700; color:#0f172a;">Official Center Address:</span>
            <div style="color:#0f172a; font-weight:500;">${settings.address || 'NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR'}</div>
          </div>
        </div>

        <div style="display:flex; gap:8px; align-items:flex-start;">
          <span style="font-size:14px; margin-top:1px;">📞</span>
          <div style="font-size:12px; color:#334155;">
            <span style="font-weight:700; color:#0f172a;">Helpline:</span> ${settings.phone}
          </div>
        </div>
      </div>

      <div style="display:flex; gap:8px;">
        <button class="btn-open-legal-sheet" id="btn-open-terms-home" style="flex:1; height:38px; background:linear-gradient(135deg, #1340b5, #081d58); color:#ffffff; font-size:12px; font-weight:700; border:none; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
          <span>📜 Terms & Policies</span>
        </button>
        <button id="btn-call-counselor-home" style="flex:1; height:38px; background:#f8fafc; border:1px solid #cbd5e1; color:#0f172a; font-size:12px; font-weight:700; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
          <span>📞 Call Center</span>
        </button>
      </div>
    </div>
  `;
}

// ========================================================
// 2. MY BATCHES SCREEN HTML
// ========================================================
function renderMyBatchesScreenHtml(settings, courses) {
  const currentUser = authService.getCurrentUser();
  const activeBatches = store.getUserEnrolledCourses();

  if (!currentUser) {
    return `
      <div class="subpage-header">
        <div class="subpage-title-row">
          <div class="subpage-title">My Batches & Learning 📚</div>
        </div>
        <div class="subpage-subtitle">Sign in with Google to view your enrolled courses & video classes</div>
      </div>

      <div style="margin:24px 16px; padding:32px 18px; background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; text-align:center; box-shadow:0 4px 16px rgba(0,0,0,0.03);">
        <div style="width:60px; height:60px; border-radius:50%; background:#eff6ff; display:flex; align-items:center; justify-content:center; font-size:28px; margin:0 auto 12px;">🔐</div>
        <div style="font-size:17px; font-weight:900; color:#0f172a;">Student Login Required</div>
        <div style="font-size:12.5px; color:#64748b; margin:6px auto 18px; max-width:280px; line-height:1.45;">
          Please sign in with your Google account to access your active batches, video lectures, and study notes.
        </div>
        <button class="google-signin-btn" id="batches-google-login-btn">
          <svg class="google-logo-svg" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Sign In with Google</span>
        </button>
      </div>
    `;
  }

  return `
    <div class="subpage-header">
      <div class="subpage-title-row">
        <div class="subpage-title">My Batches & Learning 📚</div>
        <div style="background:rgba(255,255,255,0.2); padding:4px 10px; border-radius:20px; font-size:11px; font-weight:800; color:#fff;">
          ${activeBatches.length} ACTIVE
        </div>
      </div>
      <div class="subpage-subtitle">Enrolled Student: ${currentUser.fullName} (${currentUser.rollId})</div>
    </div>

    <!-- Batch Filter Pills -->
    <div class="batch-filter-pills" id="batch-filter-pills">
      <button class="batch-pill-btn active" data-filter="all">All Enrolled (${activeBatches.length})</button>
      <button class="batch-pill-btn" data-filter="Spoken English">Spoken English</button>
      <button class="batch-pill-btn" data-filter="Govt Exams">Govt Exams</button>
      <button class="batch-pill-btn" data-filter="Grammar & Writing">Grammar & Writing</button>
      <button class="batch-pill-btn" data-filter="timetable">Class Timetable</button>
      <button class="batch-pill-btn" data-filter="notes">Study Notes</button>
    </div>

    ${activeBatches.length === 0 ? `
      <!-- Empty Batches State -->
      <div style="margin:20px 16px; padding:32px 18px; background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; text-align:center; box-shadow:0 4px 16px rgba(0,0,0,0.03);">
        <div style="width:60px; height:60px; border-radius:50%; background:#f0fdf4; display:flex; align-items:center; justify-content:center; font-size:28px; margin:0 auto 12px;">🎓</div>
        <div style="font-size:17px; font-weight:900; color:#0f172a;">No Active Batches Enrolled</div>
        <div style="font-size:12.5px; color:#64748b; margin:6px auto 18px; max-width:280px; line-height:1.45;">
          You haven't enrolled in any course yet. Explore our featured Spoken English and Competitive Exam courses to begin learning!
        </div>
        <button id="btn-browse-courses-cta" style="background:#1340b5; color:#fff; border:none; padding:12px 24px; border-radius:12px; font-size:13.5px; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(19,64,181,0.25);">
          ⚡ Browse All Courses
        </button>
      </div>
    ` : `
      <!-- Dynamic Enrolled Batches List (Vertical) -->
      <div style="display:flex; flex-direction:column; gap:14px; padding:0 16px 14px;" id="enrolled-batches-list">
        ${activeBatches.map((c, idx) => {
          const subCount = (c.subjects || []).length;
          const totalLectures = (c.subjects || []).reduce((acc, s) => acc + (s.chapters || []).reduce((ca, ch) => ca + (ch.lectures || []).length, 0), 0);
          const totalPdfs = (c.subjects || []).reduce((acc, s) => acc + (s.chapters || []).reduce((ca, ch) => ca + (ch.pdfs || []).length, 0), 0);
          const totalPractices = (c.subjects || []).reduce((acc, s) => acc + (s.chapters || []).reduce((ca, ch) => ca + (ch.practices || []).length, 0), 0);
          const progressPct = idx === 0 ? 64 : idx === 1 ? 38 : 20;

          return `
            <div class="enrolled-batch-card" data-category="${c.category}" data-course-id="${c.id}" style="margin:0; cursor:pointer;" title="Tap to open batch in full screen">
              <div class="enrolled-batch-banner">
                <img src="${c.image}" alt="${c.title}" />
                <div style="position:absolute; top:10px; left:10px; background:rgba(19,64,181,0.92); color:#fff; font-size:10px; font-weight:800; padding:4px 8px; border-radius:6px; letter-spacing:0.4px;">
                  ${c.category.toUpperCase()}
                </div>
                <div style="position:absolute; bottom:10px; right:10px; background:#10b981; color:#fff; font-size:10.5px; font-weight:800; padding:3px 8px; border-radius:6px; display:flex; align-items:center; gap:4px; box-shadow:0 2px 6px rgba(0,0,0,0.2);">
                  <span>●</span> ENROLLED & ACTIVE
                </div>
              </div>

              <div class="enrolled-batch-content">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div>
                    <div style="font-size:15px; font-weight:800; color:#0f172a; line-height:1.3;">${c.title}</div>
                    <div style="font-size:11.5px; color:#64748b; margin-top:2px;">Mentor: <strong>${c.faculty}</strong></div>
                  </div>
                  <span style="font-size:12px; font-weight:800; color:#10b981;">Full Access</span>
                </div>

                <!-- Progress Bar -->
                <div class="batch-progress-wrapper" style="margin:8px 0 6px;">
                  <div class="batch-progress-fill" style="width: ${progressPct}%; background:#10b981;"></div>
                </div>

                <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; margin-bottom:10px;">
                  <span>📚 ${subCount} Subjects • 🎥 ${totalLectures} Lectures</span>
                  <span>📑 ${totalPdfs} Notes • 📝 ${totalPractices} Tests</span>
                </div>

                <!-- Action Buttons -->
                <div class="batch-actions-grid">
                  <button class="batch-action-btn primary btn-enter-fullscreen-batch" data-course-id="${c.id}" style="background:#10b981; grid-column: span 2;">
                    <span>⚡</span>
                    <span>Continue Learning (Full Screen) →</span>
                  </button>
                  <button class="batch-action-btn secondary btn-view-syllabus" data-course-id="${c.id}">
                    <span>📚</span>
                    <span>Chapters</span>
                  </button>
                  <button class="batch-action-btn secondary btn-play-first-lecture" data-course-id="${c.id}">
                    <span>▶</span>
                    <span>Watch Video</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}

    <!-- DAILY CLASS TIMETABLE / ROUTINE CARD -->
    <div class="profile-section-card" id="timetable-section">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div class="profile-section-title" style="margin-bottom:0;">Daily Class Timetable & Routine</div>
        <span style="font-size:10.5px; color:#1340b5; font-weight:700;">Classroom + App</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        <!-- Morning -->
        <div class="timeline-item">
          <div class="timeline-dot">1</div>
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between;">
              <span style="font-size:12.5px; font-weight:800; color:#0f172a;">Morning Spoken English & GD</span>
              <span style="font-size:11px; font-weight:700; color:#1340b5;">07:00 AM - 08:30 AM</span>
            </div>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">Hall 1, Madhepur Center • Speaking practice with Krishna Kumar Sir</div>
          </div>
        </div>

        <!-- Evening -->
        <div class="timeline-item">
          <div class="timeline-dot active">2</div>
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between;">
              <span style="font-size:12.5px; font-weight:800; color:#0f172a;">SSC CGL, CHSL & Bank PO Grammar</span>
              <span style="font-size:11px; font-weight:700; color:#e11d48;">05:00 PM - 06:30 PM (LIVE)</span>
            </div>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">Hall 2 + Live Video Stream in App • Comprehensive rules & practice</div>
          </div>
        </div>

        <!-- Sunday -->
        <div class="timeline-item" style="padding-bottom:0;">
          <div class="timeline-dot">3</div>
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between;">
              <span style="font-size:12.5px; font-weight:800; color:#0f172a;">Sunday Mega Mock & Debate Test</span>
              <span style="font-size:11px; font-weight:700; color:#047857;">10:00 AM - 01:00 PM</span>
            </div>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">Weekly Rank Test & Doubt Clearing session with Krishna Kumar</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Center Classroom Offline Verification Notice -->
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; margin:0 16px 24px; padding:14px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <span style="font-size:16px;">📍</span>
        <span style="font-size:12.5px; font-weight:800; color:#0f172a;">Offline Classroom Attendance Center:</span>
      </div>
      <div style="font-size:12px; color:#475569; line-height:1.45;">
        ${settings.address || 'NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR'}
      </div>
      <div style="font-size:11px; color:#10b981; font-weight:700; margin-top:6px;">
        ✓ Show your digital Student ID / Fee receipt at classroom reception desk.
      </div>
    </div>
  `;
}

// ========================================================
// 3. PROFILE SCREEN HTML
// ========================================================
function renderProfileScreenHtml(settings) {
  const currentUser = authService.getCurrentUser();
  const enrolledCourses = store.getUserEnrolledCourses();
  const enrolledCount = enrolledCourses.length;
  const activeProgramTitle = enrolledCourses[0] ? enrolledCourses[0].title : 'General English & Foundations';
  const receiptNo = enrolledCourses[0] ? (store.getUserEnrollment(enrolledCourses[0].id)?.receipt_no || 'SSE-REC-2026-0001') : 'SSE-REC-2026-0001';
  const totalPaid = enrolledCourses.reduce((acc, c) => acc + (c.isFree ? 0 : c.discountPrice), 0);

  if (!currentUser) {
    return `
      <!-- GUEST / SIGN IN HERO CARD -->
      <div class="profile-hero-card" style="text-align:center; padding:28px 18px;">
        <div style="width:64px; height:64px; border-radius:50%; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-size:32px; margin:0 auto 12px; border:2px solid rgba(255,255,255,0.3);">
          🎓
        </div>
        <div style="font-size:19px; font-weight:900; color:#ffffff;">Smart Study Student Portal</div>
        <div style="font-size:12.5px; color:#e0e7ff; margin:6px auto 18px; max-width:290px; line-height:1.45;">
          Sign in with your Google account to access your enrolled courses, video lectures, downloadable notes, and official student ID card.
        </div>

        <button class="google-signin-btn" id="btn-profile-google-login">
          <svg class="google-logo-svg" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      <!-- SECTION: ABOUT COACHING & HELPLINES -->
      <div class="profile-section-card">
        <div class="profile-section-title">Coaching & Help Center</div>
        <div class="profile-menu-row" id="profile-whatsapp-btn">
          <div class="profile-menu-left">
            <div class="profile-menu-icon" style="background:#f0fdf4; color:#15803d;">💬</div>
            <div>
              <div class="profile-menu-title">WhatsApp Admissions Counselor</div>
              <div class="profile-menu-desc">Direct chat with Krishna Kumar Sir</div>
            </div>
          </div>
          <div class="profile-menu-right"><span>→</span></div>
        </div>
        <div class="profile-menu-row" id="profile-call-btn">
          <div class="profile-menu-left">
            <div class="profile-menu-icon" style="background:#eff6ff; color:#1d4ed8;">📞</div>
            <div>
              <div class="profile-menu-title">Call Institute Helpline</div>
              <div class="profile-menu-desc">${settings.phone}</div>
            </div>
          </div>
          <div class="profile-menu-right"><span>→</span></div>
        </div>
      </div>

      <!-- SECTION: LEGAL POLICIES -->
      <div class="profile-section-card">
        <div class="profile-section-title">Legal Policies & Developer Info</div>
        <div class="profile-menu-row" id="menu-terms-policy">
          <div class="profile-menu-left">
            <div class="profile-menu-icon" style="background:#f8fafc; color:#334155;">📜</div>
            <div><div class="profile-menu-title">Terms & Conditions</div><div class="profile-menu-desc">Student code of conduct & usage rules</div></div>
          </div>
          <div class="profile-menu-right"><span>View →</span></div>
        </div>
        <div class="profile-menu-row" id="menu-privacy-policy">
          <div class="profile-menu-left">
            <div class="profile-menu-icon" style="background:#f8fafc; color:#334155;">🔒</div>
            <div><div class="profile-menu-title">Privacy Policy</div><div class="profile-menu-desc">Student data protection & cloud safety</div></div>
          </div>
          <div class="profile-menu-right"><span>View →</span></div>
        </div>
        <div class="profile-menu-row" id="menu-developer-disclaimer">
          <div class="profile-menu-left">
            <div class="profile-menu-icon" style="background:#f8fafc; color:#334155;">⚖️</div>
            <div><div class="profile-menu-title">Developer & Legal Disclaimer</div><div class="profile-menu-desc">Built by azazlab.com • Technical platform disclosure</div></div>
          </div>
          <div class="profile-menu-right"><span style="color:#dc2626; font-weight:700; font-size:11px;">LEGAL →</span></div>
        </div>
      </div>

      <!-- DEVELOPER ATTRIBUTION FOOTER -->
      <div class="developer-attribution-badge">
        <div class="developer-brand-tag">
          <span>⚡ Built with precision by</span>
          <a href="https://azazlab.com" target="_blank" rel="noopener">azazlab.com</a>
        </div>
        <div class="developer-disclaimer-note">
          All course content, video lectures & claims are owned exclusively by institute lead <strong>${settings.teacherName || 'Krishna Kumar'}</strong>.
        </div>
      </div>
    `;
  }

  // LOGGED IN VIEW
  const avatarInitials = currentUser.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  return `
    <!-- PROFILE HERO CARD -->
    <div class="profile-hero-card">
      <div class="profile-avatar-row">
        <div class="profile-avatar-circle" style="overflow:hidden;">
          ${currentUser.avatarUrl ? `<img src="${currentUser.avatarUrl}" alt="${currentUser.fullName}" style="width:100%; height:100%; object-fit:cover;" />` : avatarInitials}
        </div>
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:18px; font-weight:900;">${currentUser.fullName}</span>
            <span style="background:#10b981; color:#fff; font-size:10px; font-weight:800; padding:2px 7px; border-radius:10px;">
              ACTIVE
            </span>
          </div>
          <div style="font-size:12px; color:#e0e7ff; margin-top:2px;">
            Roll ID: <strong style="color:#ffb800;">${currentUser.rollId}</strong>
          </div>
          <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">
            Email: ${currentUser.email}
          </div>
        </div>
      </div>
    </div>

    <!-- 4-STAT METRIC GRID -->
    <div class="profile-stats-grid">
      <div class="stat-tile">
        <div class="stat-number">${enrolledCount}</div>
        <div class="stat-label">Active Batches</div>
      </div>
      <div class="stat-tile">
        <div class="stat-number">${enrolledCount > 0 ? '28' : '0'}</div>
        <div class="stat-label">Lectures Done</div>
      </div>
      <div class="stat-tile">
        <div class="stat-number">${store.notes.length}</div>
        <div class="stat-label">Saved Notes</div>
      </div>
      <div class="stat-tile">
        <div class="stat-number">${enrolledCount > 0 ? '92%' : '--'}</div>
        <div class="stat-label">Test Score</div>
      </div>
    </div>

    <!-- SECTION 1: ACADEMICS & DIGITAL CARDS -->
    <div class="profile-section-card">
      <div class="profile-section-title">Academic Records & ID</div>

      <!-- Digital Fee Receipt -->
      <div class="profile-menu-row" id="menu-fee-receipt">
        <div class="profile-menu-left">
          <div class="profile-menu-icon" style="background:#eff6ff; color:#1d4ed8;">🧾</div>
          <div>
            <div class="profile-menu-title">Digital Fee Receipt & Student ID</div>
            <div class="profile-menu-desc">${enrolledCount > 0 ? `Receipt #${receiptNo} • Verified Student` : 'Enroll in a course to view official receipt'}</div>
          </div>
        </div>
        <div class="profile-menu-right">
          <span style="color:#10b981; font-weight:700; font-size:11px;">${enrolledCount > 0 ? 'VERIFIED' : 'PENDING'}</span>
          <span>→</span>
        </div>
      </div>

      <!-- My Batches shortcut -->
      <div class="profile-menu-row" id="menu-my-batches">
        <div class="profile-menu-left">
          <div class="profile-menu-icon" style="background:#f0fdf4; color:#15803d;">🎓</div>
          <div>
            <div class="profile-menu-title">My Enrolled Batches</div>
            <div class="profile-menu-desc">${enrolledCount > 0 ? activeProgramTitle : 'Browse available batches'}</div>
          </div>
        </div>
        <div class="profile-menu-right">
          <span>${enrolledCount} Active</span>
          <span>→</span>
        </div>
      </div>

      <!-- Downloaded Study Materials -->
      <div class="profile-menu-row" id="menu-downloaded-notes">
        <div class="profile-menu-left">
          <div class="profile-menu-icon" style="background:#fef3c7; color:#b45309;">📥</div>
          <div>
            <div class="profile-menu-title">Offline Notes & Downloads</div>
            <div class="profile-menu-desc">${store.notes.length} PDF Handouts available for offline revision</div>
          </div>
        </div>
        <div class="profile-menu-right">
          <span>${store.notes.length} PDFs</span>
          <span>→</span>
        </div>
      </div>

      <!-- Test Performance & Mock Analysis -->
      <div class="profile-menu-row" id="menu-test-performance">
        <div class="profile-menu-left">
          <div class="profile-menu-icon" style="background:#f3e8ff; color:#7e22ce;">📊</div>
          <div>
            <div class="profile-menu-title">Test Scores & Performance</div>
            <div class="profile-menu-desc">${enrolledCount > 0 ? 'Top 5% in Weekly Sunday Mock Test' : 'Attempt practice tests inside your batch'}</div>
          </div>
        </div>
        <div class="profile-menu-right">
          <span style="color:#7e22ce; font-weight:700; font-size:11px;">Scorecard</span>
          <span>→</span>
        </div>
      </div>
    </div>

    <!-- SECTION 2: INSTITUTE & LEARNING CENTER -->
    <div class="profile-section-card">
      <div class="profile-section-title">About Institute & Center</div>

      <div style="background:#f8fafc; border-radius:12px; padding:12px; border:1px solid #e2e8f0; display:flex; flex-direction:column; gap:8px;">
        <div>
          <div style="font-size:14px; font-weight:800; color:#1340b5;">${settings.coachingName}</div>
          <div style="font-size:11px; color:#475569;">${settings.tagline}</div>
        </div>

        <div style="display:flex; gap:8px; font-size:12px; color:#334155;">
          <span>👨‍🏫</span>
          <div>
            <span style="font-weight:700; color:#0f172a;">Lead Faculty & Legal Head:</span>
            <div>${settings.teacherName || settings.legalName || 'Krishna Kumar'}</div>
          </div>
        </div>

        <div style="display:flex; gap:8px; font-size:12px; color:#334155;">
          <span>📍</span>
          <div>
            <span style="font-weight:700; color:#0f172a;">Learning Center:</span>
            <div>${settings.address || 'NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR'}</div>
          </div>
        </div>

        <div style="display:flex; gap:8px; font-size:12px; color:#334155;">
          <span>📞</span>
          <div>
            <span style="font-weight:700; color:#0f172a;">Helpline:</span> ${settings.phone}
          </div>
        </div>
      </div>

      <div style="display:flex; gap:8px; margin-top:12px;">
        <button id="profile-call-btn" style="flex:1; height:38px; background:#1340b5; color:#fff; border:none; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
          <span>📞 Call Center</span>
        </button>
        <button id="profile-whatsapp-btn" style="flex:1; height:38px; background:#25D366; color:#fff; border:none; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
          <span>💬 WhatsApp</span>
        </button>
      </div>
    </div>

    <!-- SECTION 3: APP SETTINGS & LEGAL POLICIES -->
    <div class="profile-section-card">
      <div class="profile-section-title">Legal Policies & App Settings</div>

      <div class="profile-menu-row" id="menu-video-quality">
        <div class="profile-menu-left">
          <div class="profile-menu-icon" style="background:#f1f5f9; color:#334155;">⚙️</div>
          <div>
            <div class="profile-menu-title">Video Playback Quality</div>
            <div class="profile-menu-desc">Auto 720p HD (Data Saver Mode)</div>
          </div>
        </div>
        <div class="profile-menu-right">
          <span>720p</span>
          <span>→</span>
        </div>
      </div>

      <div class="profile-menu-row" id="menu-terms-policy">
        <div class="profile-menu-left">
          <div class="profile-menu-icon" style="background:#eff6ff; color:#1d4ed8;">📜</div>
          <div>
            <div class="profile-menu-title">Terms & Conditions</div>
            <div class="profile-menu-desc">Admission rules, copyright & student agreement</div>
          </div>
        </div>
        <div class="profile-menu-right">
          <span>View</span>
          <span>→</span>
        </div>
      </div>

      <div class="profile-menu-row" id="menu-privacy-policy">
        <div class="profile-menu-left">
          <div class="profile-menu-icon" style="background:#f0fdf4; color:#15803d;">🔒</div>
          <div>
            <div class="profile-menu-title">Privacy Policy</div>
            <div class="profile-menu-desc">Student data protection & cloud security</div>
          </div>
        </div>
        <div class="profile-menu-right">
          <span>View</span>
          <span>→</span>
        </div>
      </div>

      <div class="profile-menu-row" id="menu-developer-disclaimer">
        <div class="profile-menu-left">
          <div class="profile-menu-icon" style="background:#fef2f2; color:#dc2626;">⚖️</div>
          <div>
            <div class="profile-menu-title">Developer & Non-Liability Notice</div>
            <div class="profile-menu-desc">Built by azazlab.com • Technical platform disclosure</div>
          </div>
        </div>
        <div class="profile-menu-right">
          <span style="color:#dc2626; font-weight:700; font-size:11px;">LEGAL</span>
          <span>→</span>
        </div>
      </div>
    </div>

    <!-- SECTION 4: LOGOUT / ACCOUNT SWITCH -->
    <div style="padding: 0 16px 12px;">
      <button id="btn-logout" style="width:100%; height:44px; background:#fff; border:1.5px solid #fee2e2; color:#ef4444; border-radius:12px; font-size:13px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 2px 8px rgba(239,68,68,0.06);">
        <span>🚪</span>
        <span>Sign Out (${currentUser.fullName})</span>
      </button>
    </div>

    <!-- SECTION 5: AZAZLAB.COM DEVELOPER FOOTER & NON-LIABILITY BADGE -->
    <div class="developer-attribution-badge">
      <div class="developer-brand-tag">
        <span>⚡ Built with precision by</span>
        <a href="https://azazlab.com" target="_blank" rel="noopener">azazlab.com</a>
      </div>
      <div class="developer-disclaimer-note">
        All course content, video lectures, educational claims & fee payments are owned and certified exclusively by the institute owner, <strong>Krishna Kumar</strong> (Smart Study English Classes). The technology developer (<strong>azazlab.com</strong>) provides cloud software infrastructure and bears no legal, financial, or pedagogical liability.
      </div>
      <div style="font-size:10px; color:#94a3b8; margin-top:8px; font-weight:600;">App Version 2.4.0 • Production Build</div>
    </div>
  `;
}

// ========================================================
// 4. NOTES SCREEN HTML
// ========================================================
function renderNotesScreenHtml(settings) {
  return `
    <div class="subpage-header">
      <div class="subpage-title-row">
        <div class="subpage-title">Study Materials & Notes 📄</div>
        <div style="background:rgba(255,255,255,0.2); padding:4px 10px; border-radius:20px; font-size:11px; font-weight:800; color:#fff;">
          14 FILES
        </div>
      </div>
      <div class="subpage-subtitle">Curated by Krishna Kumar Sir • Smart Study English Classes</div>
    </div>

    <!-- Filter Pills -->
    <div class="batch-filter-pills" id="notes-filter-pills">
      <button class="batch-pill-btn active" data-filter="all">All Handouts</button>
      <button class="batch-pill-btn" data-filter="grammar">Grammar Formulas</button>
      <button class="batch-pill-btn" data-filter="spoken">Daily Spoken</button>
      <button class="batch-pill-btn" data-filter="ssc">SSC PYQ</button>
      <button class="batch-pill-btn" data-filter="banking">Banking Cloze</button>
    </div>

    <!-- Notes List -->
    <div style="display:flex; flex-direction:column; gap:10px; padding:0 16px 24px;" id="notes-list-container">
      ${studyNotesList.map(item => `
        <div class="notes-card-item" data-category="${item.category.toLowerCase()}">
          <div style="display:flex; gap:12px; align-items:center; flex:1;">
            <div style="width:42px; height:42px; border-radius:10px; background:#eff6ff; color:#1d4ed8; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
              📑
            </div>
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                <span style="background:#e0e7ff; color:#1340b5; font-size:9.5px; font-weight:800; padding:2px 6px; border-radius:4px;">${item.category}</span>
                <span style="font-size:10px; color:#10b981; font-weight:700;">${item.tag}</span>
              </div>
              <div style="font-size:13px; font-weight:800; color:#0f172a; line-height:1.3;">${item.title}</div>
              <div style="font-size:11px; color:#64748b; margin-top:2px;">${item.pages} • ${item.size} • By Krishna Kumar</div>
            </div>
          </div>
          <button class="btn-download-note" data-title="${item.title}" style="background:#1340b5; color:#fff; border:none; padding:7px 12px; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px; flex-shrink:0;">
            <span>📥 PDF</span>
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

// ========================================================
// INTERACTION HANDLERS FOR SCREENS
// ========================================================

function attachHomeInteractions(container) {
  const banners = store.banners;

  // Banner carousel
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

  // Clicking anywhere on course card opens full screen batch
  container.querySelectorAll('.course-card-box').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const courseId = card.getAttribute('data-course-id');
      openCourseModal(container, courseId);
    });
  });

  // Course card action buttons
  container.querySelectorAll('[data-action="view-details"], [data-action="buy-now"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const courseId = btn.getAttribute('data-course-id');
      openCourseModal(container, courseId);
    });
  });

  // Section links switch to Batches tab
  container.querySelector('#view-all-batches')?.addEventListener('click', () => switchStudentTab(container, 'batches'));
  container.querySelector('#view-all-popular')?.addEventListener('click', () => switchStudentTab(container, 'batches'));

  // Quick Action Buttons
  container.querySelectorAll('.action-box-item').forEach(item => {
    item.addEventListener('click', () => {
      const actionId = item.getAttribute('data-action-id');
      const settings = store.settings;

      switch (actionId) {
        case 'my-courses':
          switchStudentTab(container, 'batches');
          break;
        case 'all-courses':
          container.querySelector('#courses-scroll-container')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'free-notes':
        case 'paid-notes':
        case 'free-content':
          switchStudentTab(container, 'notes');
          break;
        case 'live-classes':
        case 'free-videos':
          openStudentPlayerModal(container, null, null, true);
          break;
        case 'test-series':
          switchStudentTab(container, 'batches');
          break;
        case 'youtube':
          window.open(settings.youtubeUrl || 'https://youtube.com', '_blank');
          break;
        case 'instagram':
          window.open(settings.instagramUrl || 'https://instagram.com', '_blank');
          break;
        case 'facebook':
          window.open(settings.facebookUrl || 'https://facebook.com', '_blank');
          break;
        case 'whatsapp':
          window.open(`https://wa.me/${settings.whatsapp}?text=Hello%20Krishna%20Kumar%20Sir,%20I%20have%20an%20inquiry%20regarding%20Smart%20Study%20English%20Classes.`, '_blank');
          break;
        case 'share-app':
          if (navigator.share) {
            navigator.share({
              title: `${settings.coachingName} App`,
              text: `Master English fluency and crack competitive exams with Krishna Kumar Sir on ${settings.coachingName} app!`,
              url: window.location.href
            }).catch(() => {});
          } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Smart Study English Classes App link copied to clipboard!');
          }
          break;
      }
    });
  });

  // Terms button in Home
  container.querySelector('#btn-open-terms-home')?.addEventListener('click', () => {
    openLegalModal(container, 'terms');
  });

  // Call Center button in Home
  container.querySelector('#btn-call-counselor-home')?.addEventListener('click', () => {
    window.open(`tel:${store.settings.phone}`, '_self');
  });

  // Bell
  container.querySelector('#bell-btn')?.addEventListener('click', () => {
    container.querySelector('#notifications-modal')?.classList.add('open');
  });

  // Search
  container.querySelector('#search-bar-btn')?.addEventListener('click', () => {
    const searchModal = container.querySelector('#search-modal');
    const searchInput = container.querySelector('#live-search-input');
    searchModal?.classList.add('open');
    searchInput?.focus();
    renderSearchResults(container, '');
  });

  // Header Sign-In & Avatar profile navigation
  container.querySelector('#header-signin-btn')?.addEventListener('click', () => {
    openAuthModal(container, 'Sign in with Google to access your courses & learning progress.');
  });
  container.querySelector('#header-avatar-btn')?.addEventListener('click', () => {
    switchStudentTab(container, 'profile');
  });
}

function attachBatchesInteractions(container) {
  // Google Sign-In for guest state
  container.querySelector('#batches-google-login-btn')?.addEventListener('click', () => {
    openAuthModal(container, 'Sign in with Google to access your courses & learning progress.');
  });

  // Browse Courses CTA for empty enrolled state
  container.querySelector('#btn-browse-courses-cta')?.addEventListener('click', () => {
    switchStudentTab(container, 'home');
  });

  // Filter pills
  container.querySelectorAll('#batch-filter-pills .batch-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#batch-filter-pills .batch-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const batchCards = container.querySelectorAll('.enrolled-batch-card');
      const timetable = container.querySelector('#timetable-section');

      if (filter === 'all') {
        batchCards.forEach(c => c.style.display = 'block');
        if (timetable) timetable.style.display = 'block';
      } else if (filter === 'timetable') {
        batchCards.forEach(c => c.style.display = 'none');
        if (timetable) {
          timetable.style.display = 'block';
          timetable.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (filter === 'notes') {
        switchStudentTab(container, 'notes');
      } else {
        batchCards.forEach(c => {
          c.style.display = (c.getAttribute('data-category') === filter) ? 'block' : 'none';
        });
        if (timetable) timetable.style.display = 'none';
      }
    });
  });

  // Enter batch in fullscreen
  container.querySelectorAll('.btn-enter-fullscreen-batch, .btn-view-syllabus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const courseId = btn.getAttribute('data-course-id');
      openCourseModal(container, courseId);
    });
  });

  // Watch video button on batch card
  container.querySelectorAll('.btn-play-first-lecture').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const courseId = btn.getAttribute('data-course-id');
      openStudentPlayerModal(container, courseId);
    });
  });

  // Tap anywhere on batch card opens fullscreen batch
  container.querySelectorAll('.enrolled-batch-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const courseId = card.getAttribute('data-course-id');
      if (courseId) openCourseModal(container, courseId);
    });
  });

  // Batch notes
  container.querySelectorAll('.btn-batch-notes').forEach(btn => {
    btn.addEventListener('click', () => {
      switchStudentTab(container, 'notes');
    });
  });
}

function attachProfileInteractions(container) {
  const settings = store.settings;

  // Google Sign-In for guest state
  container.querySelector('#btn-profile-google-login')?.addEventListener('click', () => {
    openAuthModal(container, 'Sign in with Google to access your student profile & enrolled batches.');
  });

  // View fee receipt
  container.querySelector('#menu-fee-receipt')?.addEventListener('click', () => {
    container.querySelector('#fee-receipt-modal')?.classList.add('open');
  });

  // My batches shortcut
  container.querySelector('#menu-my-batches')?.addEventListener('click', () => {
    switchStudentTab(container, 'batches');
  });

  const user = authService.getCurrentUser();
  const userName = user ? user.fullName : 'Guest Student';
  const rollText = user ? ` (${user.rollId})` : '';

  // Offline notes
  container.querySelector('#menu-downloaded-notes')?.addEventListener('click', () => {
    switchStudentTab(container, 'notes');
  });

  // Test performance
  container.querySelector('#menu-test-performance')?.addEventListener('click', () => {
    if (!user) {
      openAuthModal(container, 'Please sign in to view your verified performance scorecard.');
      return;
    }
    alert(`📊 ${userName} - Performance Scorecard:\n\n• Verified Student ID: ${user.rollId}\n• Weekly Sunday Mock: Completed (88% Accuracy)\n• Spoken Vocabulary Index: 92/100\n\nKeep learning with Krishna Kumar Sir!`);
  });

  // Call Counselor
  container.querySelector('#profile-call-btn')?.addEventListener('click', () => {
    window.open(`tel:${settings.phone}`, '_self');
  });

  // WhatsApp
  container.querySelector('#profile-whatsapp-btn')?.addEventListener('click', () => {
    const textMsg = encodeURIComponent(`Hello Krishna Kumar Sir, I am ${userName}${rollText}.`);
    window.open(`https://wa.me/${settings.whatsapp}?text=${textMsg}`, '_blank');
  });

  // Video quality selector
  container.querySelector('#menu-video-quality')?.addEventListener('click', () => {
    const q = prompt('Select Streaming Video Quality:\n1: 360p (Low Data)\n2: 720p HD (Recommended)\n3: 1080p Full HD\n\nEnter number (1-3):', '2');
    if (q) {
      alert('Playback quality preference saved: ' + (q === '1' ? '360p' : q === '3' ? '1080p' : '720p HD'));
    }
  });

  // Terms and Conditions modal
  container.querySelector('#menu-terms-policy')?.addEventListener('click', () => {
    openLegalModal(container, 'terms');
  });

  // Privacy Policy modal
  container.querySelector('#menu-privacy-policy')?.addEventListener('click', () => {
    openLegalModal(container, 'privacy');
  });

  // Developer & Legal Disclaimer modal
  container.querySelector('#menu-developer-disclaimer')?.addEventListener('click', () => {
    openLegalModal(container, 'developer');
  });

  // Logout
  container.querySelector('#btn-logout')?.addEventListener('click', async () => {
    if (confirm(`Are you sure you want to sign out from ${userName}?`)) {
      await authService.signOut();
      store.syncUserEnrollments(null);
      alert('You have logged out. Switched to guest mode.');
    }
  });
}

function attachNotesInteractions(container) {
  // Filter pills
  container.querySelectorAll('#notes-filter-pills .batch-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#notes-filter-pills .batch-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      container.querySelectorAll('#notes-list-container .notes-card-item').forEach(card => {
        if (filter === 'all') {
          card.style.display = 'flex';
        } else {
          card.style.display = card.getAttribute('data-category').includes(filter) ? 'flex' : 'none';
        }
      });
    });
  });

  // Download buttons
  container.querySelectorAll('.btn-download-note').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title');
      btn.innerHTML = '<span>⏳ Downloading...</span>';
      setTimeout(() => {
        btn.innerHTML = '<span>✓ Saved</span>';
        btn.style.background = '#10b981';
        alert(`📄 "${title}" downloaded successfully!\nAvailable in Offline Notes.`);
      }, 600);
    });
  });
}

// Helper to show Auth Modal
function openAuthModal(container, customMessage = '') {
  const modal = container.querySelector('#auth-modal');
  if (!modal) return;
  const statusEl = modal.querySelector('#auth-status-message');
  if (statusEl) {
    if (customMessage) {
      statusEl.style.display = 'block';
      statusEl.style.background = '#eff6ff';
      statusEl.style.color = '#1d4ed8';
      statusEl.style.border = '1px solid #bfdbfe';
      statusEl.textContent = customMessage;
    } else {
      statusEl.style.display = 'none';
    }
  }
  modal.classList.add('open');
}

// Global modal and nav interactions
function attachGlobalEventListeners(container) {
  const settings = store.settings;

  // Bottom Navigation tabs click
  container.querySelectorAll('.app-bottom-nav .nav-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const navTarget = btn.getAttribute('data-nav');
      switchStudentTab(container, navTarget);
    });
  });

  // Header / Profile / Batches Sign-In Triggers
  container.querySelector('#btn-header-signin')?.addEventListener('click', () => {
    openAuthModal(container, 'Sign in with Google to access your courses & learning progress.');
  });
  container.querySelector('#btn-profile-signin')?.addEventListener('click', () => {
    openAuthModal(container, 'Sign in to access your student profile & enrolled batches.');
  });
  container.querySelector('#btn-empty-batches-signin')?.addEventListener('click', () => {
    openAuthModal(container, 'Sign in to view your enrolled courses.');
  });

  // Auth Modal Elements & Handlers
  const authModal = container.querySelector('#auth-modal');
  container.querySelector('#close-auth-modal-btn')?.addEventListener('click', () => {
    authModal?.classList.remove('open');
  });

  // Google OAuth Sign In
  const googleBtn = container.querySelector('#btn-google-signin');
  googleBtn?.addEventListener('click', async () => {
    const statusMsg = authModal?.querySelector('#auth-status-message');
    if (statusMsg) {
      statusMsg.style.display = 'block';
      statusMsg.style.background = '#eff6ff';
      statusMsg.style.color = '#1d4ed8';
      statusMsg.style.border = '1px solid #bfdbfe';
      statusMsg.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; gap:8px;"><span>🔄</span><span>Verifying Google OAuth with Supabase...</span></div>';
    }
    const res = await authService.signInWithGoogle();
    if (!res.success && statusMsg) {
      if (res.providerNotEnabled) {
        statusMsg.style.background = '#fffbeb';
        statusMsg.style.color = '#92400e';
        statusMsg.style.border = '1px solid #fde68a';
        statusMsg.innerHTML = `
          <div style="font-weight:800; font-size:13px; margin-bottom:6px; color:#b45309; display:flex; align-items:center; gap:6px;">
            <span>⚠️</span><span>Google Provider Setup Required in Supabase</span>
          </div>
          <div style="font-size:11.5px; line-height:1.45; color:#78350f; text-align:left; margin-bottom:10px;">
            To use live Google OAuth, enable the Google Provider in your Supabase Project:
            <ol style="margin:6px 0 6px 18px; padding:0;">
              <li>Open <strong>Supabase Dashboard -> Auth -> Providers -> Google</strong></li>
              <li>Paste your Google Cloud <strong>Client ID</strong> & <strong>Client Secret</strong></li>
              <li>Set Authorized Redirect URL in Google Console to:<br/><code style="background:#fef3c7; padding:2px 4px; border-radius:4px; font-size:10px; word-break:break-all;">https://sybtavlkdhhqxnkvdbcq.supabase.co/auth/v1/callback</code></li>
            </ol>
          </div>
          <div style="display:flex; gap:8px; flex-direction:column;">
            <a href="https://supabase.com/dashboard/project/sybtavlkdhhqxnkvdbcq/auth/providers" target="_blank" style="display:block; text-align:center; background:#1340b5; color:#fff; text-decoration:none; padding:8px 12px; border-radius:8px; font-weight:700; font-size:12px;">
              🔗 Open Supabase Dashboard to Enable Google
            </a>
            <button id="btn-dev-instant-login" style="background:#10b981; color:#fff; border:none; padding:8px 12px; border-radius:8px; font-weight:700; font-size:12px; cursor:pointer;">
              ⚡ Continue as Verified Student (Instant Dev Mode)
            </button>
          </div>
        `;
        statusMsg.querySelector('#btn-dev-instant-login')?.addEventListener('click', async () => {
          await authService.startDevGoogleSession();
          store.syncUserEnrollments(authService.getCurrentUser());
          authModal?.classList.remove('open');
        });
      } else {
        statusMsg.style.background = '#fef2f2';
        statusMsg.style.color = '#b91c1c';
        statusMsg.style.border = '1px solid #fecaca';
        statusMsg.textContent = `Google Sign-In: ${res.error || 'Authentication error'}`;
      }
    }
  });


  // WhatsApp FAB
  container.querySelector('#whatsapp-fab')?.addEventListener('click', () => {
    window.open(`https://wa.me/${settings.whatsapp}?text=Hello%20Krishna%20Kumar%20Sir,%20I%20want%20to%20know%20more%20about%20Smart%20Study%20English%20Classes.`, '_blank');
  });

  // Notifications modal close
  container.querySelector('#close-notif-btn')?.addEventListener('click', () => {
    container.querySelector('#notifications-modal')?.classList.remove('open');
  });

  // Search modal close
  const searchModal = container.querySelector('#search-modal');
  const searchInput = container.querySelector('#live-search-input');
  container.querySelector('#close-search-btn')?.addEventListener('click', () => {
    searchModal?.classList.remove('open');
  });

  searchInput?.addEventListener('input', (e) => {
    renderSearchResults(container, e.target.value);
  });

  // Video modal close
  container.querySelector('#close-video-modal-btn')?.addEventListener('click', () => {
    container.querySelector('#video-player-modal')?.classList.remove('open');
    if (activeMobilePlayer) {
      activeMobilePlayer.destroy();
      activeMobilePlayer = null;
    }
  });

  // Fee Receipt modal close
  container.querySelector('#close-receipt-modal-btn')?.addEventListener('click', () => {
    container.querySelector('#fee-receipt-modal')?.classList.remove('open');
  });

  // Legal modal close
  container.querySelector('#close-legal-modal-btn')?.addEventListener('click', () => {
    container.querySelector('#legal-docs-modal')?.classList.remove('open');
  });

  // Legal modal tab switching
  container.querySelectorAll('#legal-tabs-row .legal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#legal-tabs-row .legal-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const docType = btn.getAttribute('data-tab');
      renderLegalDocContent(container, docType);
    });
  });

  // Fee receipt download & print
  container.querySelector('#btn-download-pdf-receipt')?.addEventListener('click', () => {
    const user = authService.getCurrentUser();
    const sName = user ? user.fullName : 'Student';
    alert(`📥 Official Fee Receipt (PDF) for ${sName} downloaded successfully!`);
  });
  container.querySelector('#btn-print-receipt')?.addEventListener('click', () => {
    window.print();
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

// Open Legal Documents Modal
function openLegalModal(container, initialTab = 'terms') {
  const modal = container.querySelector('#legal-docs-modal');
  if (!modal) return;

  container.querySelectorAll('#legal-tabs-row .legal-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === initialTab);
  });

  renderLegalDocContent(container, initialTab);
  modal.classList.add('open');
}

// Render Legal Document Content
function renderLegalDocContent(container, docType) {
  const contentBox = container.querySelector('#legal-document-content');
  const titleBox = container.querySelector('#legal-modal-title');
  if (!contentBox) return;

  const settings = store.settings;

  if (docType === 'terms') {
    if (titleBox) titleBox.textContent = 'Terms & Conditions of Admission';
    contentBox.innerHTML = `
      <div class="legal-clause-box">
        <div class="legal-clause-title">1. Institute Ownership & Admissions</div>
        <p class="legal-clause-text">
          Smart Study English Classes is an offline and digital coaching institute founded, operated, and legally owned by <strong>Krishna Kumar</strong>, located at Near Bus Stand infront of Bank of Baroda, 1st Floor, Madhepur, Madhubani, Bihar. Student admission is provisional and subject to institute verification.
        </p>
      </div>

      <div class="legal-clause-box">
        <div class="legal-clause-title">2. Curriculum & Intellectual Property</div>
        <p class="legal-clause-text">
          All video lectures, spoken English formulas, vocabulary sheets, grammar modules, and test papers are the exclusive intellectual property of <strong>Krishna Kumar</strong>. Screen recording, unauthorized sharing, copying, re-broadcasting, or commercial selling of course material is strictly prohibited under the Indian Copyright Act, 1957.
        </p>
      </div>

      <div class="legal-clause-box">
        <div class="legal-clause-title">3. Fees & Refund Policy</div>
        <p class="legal-clause-text">
          All course fees paid for online access or classroom batches are non-refundable once batch registration is completed, except under exceptional circumstances approved in writing directly by Krishna Kumar.
        </p>
      </div>

      <div class="developer-liability-highlight">
        <div class="legal-clause-title">4. Technical Platform & Developer Non-Liability</div>
        <p class="legal-clause-text">
          This software application and its cloud architecture are engineered by <strong>azazlab.com</strong> purely as a technical contractor. azazlab.com is not an educational partner, promoter, or legal entity of Smart Study English Classes. All academic promises, exam outcomes, teaching quality, and financial fee collections are solely governed by Krishna Kumar. azazlab.com is completely indemnified and holds zero legal or pedagogical liability.
        </p>
      </div>
    `;
  } else if (docType === 'privacy') {
    if (titleBox) titleBox.textContent = 'Student Privacy Policy';
    contentBox.innerHTML = `
      <div class="legal-clause-box">
        <div class="legal-clause-title">1. Information We Collect</div>
        <p class="legal-clause-text">
          We collect student name, mobile number, roll ID, enrolled batch history, lecture completion percentages, and test scores to provide access to educational courses and generate student fee receipts.
        </p>
      </div>

      <div class="legal-clause-box">
        <div class="legal-clause-title">2. Purpose of Processing</div>
        <p class="legal-clause-text">
          Data is used solely to authenticate student access, deliver live class notifications, track batch progress, and facilitate direct WhatsApp academic assistance with faculty.
        </p>
      </div>

      <div class="legal-clause-box">
        <div class="legal-clause-title">3. Cloud Infrastructure & Subdomains</div>
        <p class="legal-clause-text">
          Student databases and backend cloud services are hosted securely on cloud infrastructure provisioned through <strong>azazlab.com</strong> subdomains. Data is encrypted and access-controlled through modern Row-Level Security (RLS).
        </p>
      </div>

      <div class="legal-clause-box">
        <div class="legal-clause-title">4. No Third-Party Data Sale</div>
        <p class="legal-clause-text">
          We do not sell, rent, or trade student personal records to external commercial advertisers. All data remains confidential between the student and Smart Study English Classes.
        </p>
      </div>
    `;
  } else if (docType === 'developer') {
    if (titleBox) titleBox.textContent = 'Developer & Liability Disclaimer';
    contentBox.innerHTML = `
      <div class="developer-liability-highlight" style="background:#fef2f2; border:1.5px solid #f87171;">
        <div class="legal-clause-title" style="color:#991b1b; font-size:13.5px;">⚡ Formal Developer Disclaimer: azazlab.com</div>
        <p class="legal-clause-text" style="color:#7f1d1d; line-height:1.6; margin-top:6px;">
          This mobile application is engineered, designed, and technically delivered by <strong>azazlab.com</strong>.
          <br><br>
          <strong>Content Ownership & Verification:</strong> Every single item of content—including course descriptions, video lectures, test questions, grammar rules, fee rates, student admissions, address verification, and legal representations—is provided, uploaded, verified, and owned exclusively by the coaching institute owner, <strong>Krishna Kumar</strong> (Smart Study English Classes).
          <br><br>
          <strong>Non-Liability Clause:</strong> The technology developer (<strong>azazlab.com</strong>) functions strictly as an external software development service provider. azazlab.com bears <strong>NO legal, financial, pedagogical, regulatory, or copyright liability</strong> of any kind for the operations, teaching, promises, fee disputes, or transactions of Smart Study English Classes.
          <br><br>
          <strong>Subdomain & Cloud Infrastructure Disclosure:</strong> Smart Study English Classes currently operates without an independent corporate domain. All backend databases and API endpoints are hosted on azazlab.com cloud developer subdomains as a technical service arrangement. This technical deployment does NOT constitute a joint venture, partnership, or legal agency. azazlab.com is completely indemnified from all civil, regulatory, and criminal liabilities whatsoever.
        </p>
      </div>
    `;
  }
}

function renderSearchResults(container, query) {
  const searchResults = container.querySelector('#search-results-list');
  if (!searchResults) return;

  const filtered = store.courses.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase())
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
        <div style="font-size:12px; font-weight:800; color:#10b981;">● 100% FREE ACCESS</div>
      </div>
      <button style="background:#10b981; color:#fff; border:none; padding:6px 12px; border-radius:8px; font-size:11.5px; font-weight:800;">⚡ Enter</button>
    </div>
  `).join('');

  searchResults.querySelectorAll('[data-result-id]').forEach(item => {
    item.addEventListener('click', () => {
      container.querySelector('#search-modal')?.classList.remove('open');
      openCourseModal(container, item.getAttribute('data-result-id'));
    });
  });
}

function openStudentPlayerModal(container, courseId = null, specificVideoId = null, isLive = false) {
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
        isLive: isLive
      });

  if (activeMobilePlayer) {
    activeMobilePlayer.destroy();
    activeMobilePlayer = null;
  }

  const currentUser = authService.getCurrentUser();
  // Mount SecureVideoPlayer
  activeMobilePlayer = new SecureVideoPlayer(mount, {
    videoId: selectedLecture.videoId,
    title: selectedLecture.title,
    isLive: isLive || selectedLecture.isLive,
    studentPhone: currentUser ? (currentUser.phone || currentUser.email) : 'Guest Student',
    studentId: currentUser ? currentUser.rollId : 'SSE-GUEST'
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

    <!-- Production stream info pill -->
    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:8px 12px; font-size:11.5px; color:#475569; margin-bottom:14px;">
      <span>📺 <strong>HD Stream:</strong> 1080p Crystal Clear Audio</span>
      <span style="color:#10b981; font-weight:700; display:flex; align-items:center; gap:4px;">
        <span class="live-dot-pulse" style="width:6px; height:6px;"></span> Interactive Mode
      </span>
    </div>

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

  modal?.classList.add('open');

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
  if (!sheetContent) return;

  const visibleSubjects = (course.subjects || []).filter(s => s.visible !== false);

  function renderContent() {
    sheetContent.innerHTML = `
      <!-- 1. FULLSCREEN TOP APP BAR HEADER -->
      <div class="batch-fullscreen-header">
        <button class="batch-fullscreen-back-btn" id="close-course-modal" title="Go Back">
          ←
        </button>
        <div class="batch-fullscreen-title">
          ${course.title}
        </div>
        <span style="background:#10b981; color:#fff; font-size:10.5px; font-weight:800; padding:4px 8px; border-radius:6px; letter-spacing:0.3px;">
          FREE
        </span>
      </div>

      <!-- 2. FULLSCREEN SCROLLABLE BODY (100% VERTICAL) -->
      <div class="batch-fullscreen-scroll-body">
        
        <!-- 16:9 Thumbnail Preview with Instant Play -->
        <div id="course-modal-thumbnail" style="position:relative; width:100%; aspect-ratio:16/9; border-radius:16px; overflow:hidden; cursor:pointer; box-shadow:0 4px 14px rgba(0,0,0,0.08);" title="Tap to watch demo lecture">
          <img src="${course.image}" style="width:100%; height:100%; object-fit:cover;" />
          <div style="position:absolute; inset:0; background:rgba(0,0,0,0.32); display:flex; align-items:center; justify-content:center;">
            <div style="width:52px; height:52px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; color:#1340b5; box-shadow:0 4px 14px rgba(0,0,0,0.35); font-size:20px;">
              ▶
            </div>
          </div>
          <div style="position:absolute; top:10px; left:10px; background:rgba(15,23,42,0.85); color:#fff; font-size:10.5px; font-weight:800; padding:4px 10px; border-radius:6px;">
            ${course.category}
          </div>
          <div style="position:absolute; bottom:10px; right:10px; background:#10b981; color:#fff; font-size:10.5px; font-weight:800; padding:3px 8px; border-radius:6px;">
            ● 100% FREE ACCESS
          </div>
        </div>

        <!-- FREE ACCESS UNLOCKED BANNER -->
        <div style="background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border:1px solid #a7f3d0; border-radius:14px; padding:12px 14px; display:flex; align-items:center; justify-content:space-between;">
          <div>
            <div style="font-size:14px; font-weight:900; color:#065f46;">🎉 Batch Unlocked & Free</div>
            <div style="font-size:11.5px; color:#047857; margin-top:2px;">Mentor: <strong>Krishna Kumar</strong> • Full Access</div>
          </div>
          <button id="btn-enter-batch-now" style="background:#10b981; color:#fff; border:none; padding:8px 14px; border-radius:10px; font-size:12.5px; font-weight:800; cursor:pointer; box-shadow:0 2px 8px rgba(16,185,129,0.3);">
            ▶ Start Learning
          </button>
        </div>

        <!-- Course Title & Overview -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:14px;">
          <div style="font-size:17px; font-weight:800; color:#0f172a; line-height:1.3; margin-bottom:4px;">
            ${course.title}
          </div>
          <div style="font-size:12px; color:#64748b; margin-bottom:10px;">
            Instructor: <strong style="color:#0f172a;">${course.faculty}</strong> • 📅 ${course.batchDate}
          </div>
          <p style="font-size:12.5px; color:#475569; line-height:1.5; margin:0;">
            ${course.description}
          </p>
        </div>

        <!-- 3. ALL SUBJECTS & CHAPTERS IN 100% VERTICAL MODE (NO HORIZONTAL SCROLL) -->
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:15px; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:6px;">
              <span>📚</span>
              <span>Complete Batch Curriculum</span>
            </div>
            <button id="btn-toggle-all-chapters" style="background:#eff6ff; color:#1340b5; border:1px solid #bfdbfe; padding:4px 10px; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer;">
              Expand All ▾
            </button>
          </div>
          <div style="font-size:11.5px; color:#64748b; margin-bottom:4px;">
            All subjects, chapters, video lectures, PDF handouts, and practice tests listed vertically below:
          </div>
        </div>

        ${visibleSubjects.length === 0 ? `
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:24px; text-align:center; color:#64748b; font-size:12.5px;">
            Subjects and chapters are currently being updated for this batch by Krishna Kumar Sir. Check back soon!
          </div>
        ` : `
          <!-- Vertical Subjects Container -->
          <div class="vertical-subjects-container">
            ${visibleSubjects.map((sub, sIdx) => {
              const visibleChapters = (sub.chapters || []).filter(c => c.visible !== false);
              return `
                <div class="vertical-subject-section">
                  <div class="vertical-subject-header">
                    <div class="vertical-subject-icon">${sub.icon || '📖'}</div>
                    <div class="vertical-subject-info">
                      <div style="font-size:10.5px; font-weight:800; color:#1340b5; text-transform:uppercase; letter-spacing:0.5px;">Subject 0${sIdx + 1}</div>
                      <div class="vertical-subject-name">${sub.name}</div>
                      <div class="vertical-subject-subtitle">${visibleChapters.length} Chapters • All Content Free</div>
                    </div>
                  </div>

                  <!-- Chapters in this Subject Stacked Vertically -->
                  <div class="vertical-chapters-wrapper">
                    ${visibleChapters.length === 0 ? `
                      <div style="padding:10px; text-align:center; color:#94a3b8; font-size:11.5px;">No chapters currently visible in this subject.</div>
                    ` : visibleChapters.map((ch, cIdx) => {
                      const visibleLectures = (ch.lectures || []).filter(l => l.visible !== false);
                      const visiblePdfs = (ch.pdfs || []).filter(p => p.visible !== false);
                      const visiblePractices = (ch.practices || []).filter(pr => pr.visible !== false);
                      const isOpen = (sIdx === 0 && cIdx === 0);

                      return `
                        <div class="vertical-chapter-card ${isOpen ? 'open' : ''}" data-chapter-id="${ch.id}">
                          <div class="vertical-chapter-header">
                            <div style="flex:1;">
                              <div class="vertical-chapter-title">${ch.title}</div>
                              <div style="display:flex; gap:6px; margin-top:4px; flex-wrap:wrap;">
                                <span class="chapter-counter-badge lectures">🎥 ${visibleLectures.length} Lectures</span>
                                <span class="chapter-counter-badge pdfs">📄 ${visiblePdfs.length} Notes</span>
                                <span class="chapter-counter-badge practices">📝 ${visiblePractices.length} Practice</span>
                              </div>
                            </div>
                            <div class="chapter-chevron">${isOpen ? '▲' : '▼'}</div>
                          </div>

                          <div class="vertical-chapter-body" style="display: ${isOpen ? 'flex' : 'none'};">
                            <!-- 1. Lectures Vertical List -->
                            <div>
                              <div class="vertical-resource-section-title" style="color:#1d4ed8;">
                                <span>🎥</span>
                                <span>Video Lectures (${visibleLectures.length})</span>
                              </div>
                              <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
                                ${visibleLectures.length === 0 ? `
                                  <div style="font-size:11px; color:#94a3b8;">No lectures in this chapter.</div>
                                ` : visibleLectures.map(lec => `
                                  <div class="curriculum-item-row">
                                    <div class="curriculum-item-left">
                                      <div class="curriculum-item-icon" style="background:#eff6ff; color:#1d4ed8;">▶</div>
                                      <div>
                                        <div class="curriculum-item-title">${lec.title}</div>
                                        <div class="curriculum-item-meta">⏱️ ${lec.duration || '25:00'} • Free HD Video</div>
                                      </div>
                                    </div>
                                    <button class="curriculum-action-btn play btn-play-lecture" data-course-id="${course.id}" data-video-id="${lec.videoId || 'wdaBwIv7Jso'}">
                                      ▶ Watch
                                    </button>
                                  </div>
                                `).join('')}
                              </div>
                            </div>

                            <!-- 2. PDF Notes Vertical List -->
                            <div>
                              <div class="vertical-resource-section-title" style="color:#b45309;">
                                <span>📄</span>
                                <span>PDF Study Notes (${visiblePdfs.length})</span>
                              </div>
                              <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
                                ${visiblePdfs.length === 0 ? `
                                  <div style="font-size:11px; color:#94a3b8;">No notes in this chapter.</div>
                                ` : visiblePdfs.map(pdf => `
                                  <div class="curriculum-item-row">
                                    <div class="curriculum-item-left">
                                      <div class="curriculum-item-icon" style="background:#fef3c7; color:#b45309;">📄</div>
                                      <div>
                                        <div class="curriculum-item-title">${pdf.title}</div>
                                        <div class="curriculum-item-meta">📑 ${pdf.pages || '14 Pages'} • 💾 ${pdf.size || '2.5 MB'}</div>
                                      </div>
                                    </div>
                                    <button class="curriculum-action-btn download btn-download-pdf" data-title="${pdf.title}">
                                      📥 Download
                                    </button>
                                  </div>
                                `).join('')}
                              </div>
                            </div>

                            <!-- 3. Practice Tests Vertical List -->
                            <div>
                              <div class="vertical-resource-section-title" style="color:#047857;">
                                <span>📝</span>
                                <span>Practice Tests & DPPs (${visiblePractices.length})</span>
                              </div>
                              <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
                                ${visiblePractices.length === 0 ? `
                                  <div style="font-size:11px; color:#94a3b8;">No practice tests in this chapter.</div>
                                ` : visiblePractices.map(pr => `
                                  <div class="curriculum-item-row">
                                    <div class="curriculum-item-left">
                                      <div class="curriculum-item-icon" style="background:#ecfdf5; color:#047857;">✍️</div>
                                      <div>
                                        <div class="curriculum-item-title">${pr.title}</div>
                                        <div class="curriculum-item-meta">❓ ${pr.questionsCount || 20} Qs • ⏱️ ${pr.timeMinutes || 15} Mins • 🏆 ${pr.marks || 40} Marks</div>
                                      </div>
                                    </div>
                                    <button class="curriculum-action-btn practice btn-start-practice" data-pr-id="${pr.id}" data-pr-title="${pr.title}" data-pr-time="${pr.timeMinutes || 15}" data-pr-marks="${pr.marks || 40}">
                                      📝 Attempt
                                    </button>
                                  </div>
                                `).join('')}
                              </div>
                            </div>

                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}

        <!-- Course Features -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:14px;">
          <div style="font-size:13.5px; font-weight:800; color:#0f172a; margin-bottom:8px;">
            Features Included Free:
          </div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${(course.features || []).map(f => `
              <div style="display:flex; align-items:flex-start; gap:8px; font-size:12px; color:#334155;">
                <span style="color:#10b981; font-weight:bold;">✓</span>
                <span>${f}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- 4. BOTTOM FIXED LEARNING BAR -->
      <div style="background:#ffffff; border-top:1px solid #e2e8f0; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; box-shadow:0 -4px 12px rgba(0,0,0,0.04);">
        ${store.isCourseEnrolled(course.id) ? `
          <div>
            <div style="font-size:15px; font-weight:900; color:#10b981;">✓ ENROLLED & ACTIVE</div>
            <div style="font-size:11px; color:#64748b;">Full curriculum & video player unlocked</div>
          </div>
          <button id="modal-enroll-btn" style="background:#10b981; color:#fff; border:none; height:44px; padding:0 22px; border-radius:12px; font-size:13.5px; font-weight:800; cursor:pointer; box-shadow:0 4px 14px rgba(16,185,129,0.3);">
            ⚡ Start Learning Now
          </button>
        ` : course.isFree ? `
          <div>
            <div style="font-size:15px; font-weight:900; color:#10b981;">100% FREE BATCH</div>
            <div style="font-size:11px; color:#64748b;">No fees required • Instant access</div>
          </div>
          <button id="modal-enroll-btn" style="background:#10b981; color:#fff; border:none; height:44px; padding:0 22px; border-radius:12px; font-size:13.5px; font-weight:800; cursor:pointer; box-shadow:0 4px 14px rgba(16,185,129,0.3);">
            ⚡ Enroll for Free
          </button>
        ` : `
          <div>
            <div style="display:flex; align-items:baseline; gap:6px;">
              <span style="font-size:18px; font-weight:900; color:#0f172a;">₹${course.discountPrice}</span>
              <span style="font-size:12px; color:#94a3b8; text-decoration:line-through;">₹${course.originalPrice}</span>
              <span style="font-size:10px; color:#10b981; font-weight:800; background:#ecfdf5; padding:2px 6px; border-radius:6px;">${course.discountPercent}% OFF</span>
            </div>
            <div style="font-size:11px; color:#64748b;">One-time fee • Complete batch access</div>
          </div>
          <button id="modal-enroll-btn" style="background:#1340b5; color:#fff; border:none; height:44px; padding:0 22px; border-radius:12px; font-size:13.5px; font-weight:800; cursor:pointer; box-shadow:0 4px 14px rgba(19,64,181,0.3);">
            ⚡ Enroll Now →
          </button>
        `}
      </div>
    `;

    // Toggle All Chapters Expand / Collapse
    const toggleAllBtn = sheetContent.querySelector('#btn-toggle-all-chapters');
    let allChaptersExpanded = false;
    toggleAllBtn?.addEventListener('click', () => {
      allChaptersExpanded = !allChaptersExpanded;
      toggleAllBtn.textContent = allChaptersExpanded ? 'Collapse All ▴' : 'Expand All ▾';
      sheetContent.querySelectorAll('.vertical-chapter-card').forEach(card => {
        const body = card.querySelector('.vertical-chapter-body');
        const chevron = card.querySelector('.chapter-chevron');
        if (allChaptersExpanded) {
          body.style.display = 'flex';
          chevron.textContent = '▲';
          card.classList.add('open');
        } else {
          body.style.display = 'none';
          chevron.textContent = '▼';
          card.classList.remove('open');
        }
      });
    });

    // Bind chapter accordion header toggle (Vertical)
    sheetContent.querySelectorAll('.vertical-chapter-header').forEach(header => {
      header.addEventListener('click', () => {
        const card = header.closest('.vertical-chapter-card');
        const body = card.querySelector('.vertical-chapter-body');
        const chevron = card.querySelector('.chapter-chevron');
        if (body.style.display === 'none') {
          body.style.display = 'flex';
          chevron.textContent = '▲';
          card.classList.add('open');
        } else {
          body.style.display = 'none';
          chevron.textContent = '▼';
          card.classList.remove('open');
        }
      });
    });

    // Bind Watch Lecture
    sheetContent.querySelectorAll('.btn-play-lecture').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const vId = btn.getAttribute('data-video-id');
        openStudentPlayerModal(container, course.id, vId);
      });
    });

    // Bind Download PDF
    sheetContent.querySelectorAll('.btn-download-pdf').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = btn.getAttribute('data-title');
        btn.innerHTML = '⏳ Downloading...';
        setTimeout(() => {
          btn.innerHTML = '✅ Saved Offline';
          alert(`📥 Download Complete!\n\n"${title}" has been saved to your Offline Study Material folder in the app.`);
        }, 600);
      });
    });

    // Bind Start Practice
    sheetContent.querySelectorAll('.btn-start-practice').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prItem = {
          id: btn.getAttribute('data-pr-id'),
          title: btn.getAttribute('data-pr-title'),
          timeMinutes: parseInt(btn.getAttribute('data-pr-time')) || 15,
          marks: parseInt(btn.getAttribute('data-pr-marks')) || 40
        };
        openPracticeQuizModal(container, prItem);
      });
    });

    // Close button (Fullscreen Back Arrow)
    sheetContent.querySelector('#close-course-modal')?.addEventListener('click', () => {
      modal?.classList.remove('open');
    });

    const escHandler = (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('open')) {
        modal.classList.remove('open');
        window.removeEventListener('keydown', escHandler);
      }
    };
    window.addEventListener('keydown', escHandler);

    // Thumbnail click opens video player
    sheetContent.querySelector('#course-modal-thumbnail')?.addEventListener('click', () => {
      openStudentPlayerModal(container, course.id);
    });

    // Enter Batch CTA buttons
    const enterBatchHandler = async () => {
      const isEnrolled = store.isCourseEnrolled(course.id);
      if (!isEnrolled) {
        if (!authService.isAuthenticated()) {
          modal?.classList.remove('open');
          openAuthModal(container, `Please sign in with Google to enroll in "${course.title}".`);
          return;
        }

        const enrollBtn = sheetContent.querySelector('#modal-enroll-btn');
        if (enrollBtn) enrollBtn.textContent = 'Enrolling...';

        const res = await store.enrollInCourse(course.id);
        if (res.success) {
          alert(`🎉 Enrollment Successful!\n\nYou have officially enrolled in "${course.title}".\nReceipt Number: ${res.receiptNo}\n\nAll video lectures and PDF study materials are now unlocked!`);
          renderContent();
          return;
        } else {
          alert(res.error || 'Enrollment could not be completed.');
          if (enrollBtn) enrollBtn.textContent = '⚡ Enroll Now →';
          return;
        }
      }

      // Enrolled: Launch classroom video player
      const firstSub = visibleSubjects[0];
      const firstCh = firstSub?.chapters?.[0];
      const firstLec = firstCh?.lectures?.[0];
      if (firstLec) {
        openStudentPlayerModal(container, course.id, firstLec.videoId || 'wdaBwIv7Jso');
      } else {
        openStudentPlayerModal(container, course.id);
      }
    };

    sheetContent.querySelector('#btn-enter-batch-now')?.addEventListener('click', enterBatchHandler);
    sheetContent.querySelector('#modal-enroll-btn')?.addEventListener('click', enterBatchHandler);
  }

  renderContent();
  modal?.classList.add('open');
}

// Interactive Practice Quiz Modal
function openPracticeQuizModal(container, testItem) {
  const modal = container.querySelector('#practice-quiz-modal');
  const content = container.querySelector('#practice-quiz-content');
  if (!modal || !content) return;

  const questions = [
    {
      q: '1. Select the correct sentence according to English Subject-Verb Agreement:',
      options: [
        'Each of the students have completed their assignment.',
        'Each of the students has completed their assignment.',
        'Each of the students were completing the task.',
        'Each of the students are ready for the lecture.'
      ],
      correct: 1,
      explanation: '"Each of" takes a singular verb ("has completed").'
    },
    {
      q: '2. What is the meaning of the spoken idiom "A piece of cake"?',
      options: [
        'A very difficult or impossible challenge',
        'Something very easy to achieve or complete',
        'Sharing sweet food during a celebration',
        'An argument between two close friends'
      ],
      correct: 1,
      explanation: '"A piece of cake" means a task that is simple and easy to accomplish.'
    },
    {
      q: '3. Fill in the blank with the correct preposition: "Krishna Sir is proficient _______ teaching spoken fluency."',
      options: [
        'at',
        'in',
        'with',
        'on'
      ],
      correct: 1,
      explanation: 'We say proficient IN an activity or language.'
    },
    {
      q: '4. Change into Passive: "The students solved all the grammar problems."',
      options: [
        'All the grammar problems were solved by the students.',
        'All the grammar problems are solved by the students.',
        'All the grammar problems had been solved by the students.',
        'All the grammar problems was solved by the students.'
      ],
      correct: 0,
      explanation: 'Past simple ("solved") changes to "were solved" for plural subject "problems".'
    }
  ];

  let userAnswers = {};
  let isSubmitted = false;

  function renderQuiz() {
    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div>
          <div style="font-size:16px; font-weight:800; color:#0f172a;">${testItem.title}</div>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">
            ⏱️ ${testItem.timeMinutes || 15} Mins • ❓ ${questions.length} Questions • 🏆 ${testItem.marks || 40} Marks
          </div>
        </div>
        <button class="sheet-close-btn" id="close-quiz-btn">✕</button>
      </div>

      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:8px 12px; margin-bottom:14px; font-size:11.5px; color:#1e40af; display:flex; align-items:center; justify-content:space-between;">
        <span>🎯 <strong>Live Interactive Test</strong></span>
        <span style="font-weight:700;">Smart Study English Classes</span>
      </div>

      <div style="max-height:60vh; overflow-y:auto; padding-right:4px;">
        ${questions.map((qObj, qIdx) => `
          <div class="quiz-question-card">
            <div style="font-size:13px; font-weight:700; color:#0f172a; margin-bottom:10px; line-height:1.4;">
              ${qObj.q}
            </div>

            <div style="display:flex; flex-direction:column; gap:6px;">
              ${qObj.options.map((opt, oIdx) => {
                const isSelected = userAnswers[qIdx] === oIdx;
                let optStyle = '';
                let badge = '';

                if (isSubmitted) {
                  if (oIdx === qObj.correct) {
                    optStyle = 'border-color:#10b981; background:#ecfdf5; color:#047857; font-weight:700;';
                    badge = ' <span style="color:#10b981; font-weight:bold;">✓ Correct</span>';
                  } else if (isSelected && oIdx !== qObj.correct) {
                    optStyle = 'border-color:#ef4444; background:#fef2f2; color:#b91c1c; font-weight:700;';
                    badge = ' <span style="color:#ef4444; font-weight:bold;">✗ Your choice</span>';
                  }
                } else if (isSelected) {
                  optStyle = 'border-color:#1340b5; background:#eff6ff; color:#1340b5; font-weight:700;';
                }

                return `
                  <div class="quiz-option-label" data-q-idx="${qIdx}" data-opt-idx="${oIdx}" style="${optStyle}">
                    <span style="width:20px; height:20px; border-radius:50%; border:1.5px solid currentColor; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0;">
                      ${String.fromCharCode(65 + oIdx)}
                    </span>
                    <span style="flex:1;">${opt}</span>
                    ${badge}
                  </div>
                `;
              }).join('')}
            </div>

            ${isSubmitted ? `
              <div style="margin-top:10px; padding:8px 10px; background:#f1f5f9; border-radius:8px; font-size:11.5px; color:#334155;">
                <strong style="color:#1340b5;">Explanation:</strong> ${qObj.explanation}
              </div>
            ` : ''}
          </div>
        `).join('')}

        ${isSubmitted ? `
          <div class="quiz-result-card" style="margin-top:14px; margin-bottom:10px;">
            <div style="font-size:32px; margin-bottom:4px;">🎉</div>
            <div style="font-size:17px; font-weight:900; color:#065f46;">Practice Test Completed!</div>
            <div style="font-size:13px; color:#047857; margin-top:4px;">
              Your Score: <strong>${Object.entries(userAnswers).filter(([idx, ans]) => ans === questions[idx].correct).length} / ${questions.length}</strong> Correct
            </div>
            <div style="font-size:11.5px; color:#475569; margin-top:8px;">
              Keep practicing daily with Krishna Kumar Sir's video lectures & formula notes!
            </div>
          </div>
        ` : ''}
      </div>

      <div style="margin-top:14px; border-top:1px solid #e2e8f0; padding-top:12px; display:flex; gap:10px;">
        ${!isSubmitted ? `
          <button id="btn-submit-quiz" style="flex:1; height:44px; background:#10b981; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:800; cursor:pointer;">
            Submit Test & View Answers
          </button>
        ` : `
          <button id="btn-retake-quiz" style="flex:1; height:44px; background:#1340b5; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:800; cursor:pointer;">
            🔄 Retake Test
          </button>
        `}
      </div>
    `;

    // Bind Option clicks
    if (!isSubmitted) {
      content.querySelectorAll('.quiz-option-label').forEach(opt => {
        opt.addEventListener('click', () => {
          const qIdx = parseInt(opt.getAttribute('data-q-idx'));
          const optIdx = parseInt(opt.getAttribute('data-opt-idx'));
          userAnswers[qIdx] = optIdx;
          renderQuiz();
        });
      });

      content.querySelector('#btn-submit-quiz')?.addEventListener('click', () => {
        isSubmitted = true;
        renderQuiz();
      });
    } else {
      content.querySelector('#btn-retake-quiz')?.addEventListener('click', () => {
        userAnswers = {};
        isSubmitted = false;
        renderQuiz();
      });
    }

    content.querySelector('#close-quiz-btn')?.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  renderQuiz();
  modal.classList.add('open');
}

function initiateEnrollment(courseId) {
  const container = document.getElementById('phone-screen-container') || document.body;
  openCourseModal(container, courseId);
}

// Live store & auth subscription
function triggerUIRender() {
  if (currentView === 'split') {
    const rightCol = document.getElementById('split-app-col');
    if (rightCol) renderMobileInside(rightCol, true);
  } else if (currentView === 'app') {
    const slot = document.getElementById('phone-container-slot');
    if (slot) renderMobileInside(slot, false);
  }
}

store.subscribe(() => {
  triggerUIRender();
});

authService.subscribe((user) => {
  store.syncUserEnrollments(user);
  triggerUIRender();
});

// Start App
initApp();
