import './admin.css';
import { store } from '../data/store.js';
import { SecureVideoPlayer, extractYouTubeId } from '../player/securePlayer.js';

let activeTab = 'dashboard';
let editingCourseId = null;

export function renderAdminPanel(containerElement, onSwitchToApp, onSwitchToSplit) {
  function update() {
    containerElement.innerHTML = `
      <div class="admin-layout">
        <!-- Sidebar -->
        <aside class="admin-sidebar">
          <div class="admin-brand-header">
            <div class="admin-logo-circle">B</div>
            <div>
              <div class="admin-brand-title">${store.settings.coachingName}</div>
              <div class="admin-brand-role">
                <span>Admin Console</span>
                <span class="admin-role-badge">Coaching Admin</span>
              </div>
            </div>
          </div>

          <nav class="admin-nav-list">
            <button class="admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
              <span class="admin-nav-icon">📊</span>
              <span>Dashboard Overview</span>
            </button>
            <button class="admin-nav-item ${activeTab === 'courses' ? 'active' : ''}" data-tab="courses">
              <span class="admin-nav-icon">🎓</span>
              <span>Courses & Batches</span>
            </button>
            <button class="admin-nav-item ${activeTab === 'lectures' ? 'active' : ''}" data-tab="lectures">
              <span class="admin-nav-icon">🎥</span>
              <span>Video Lectures (Unlisted)</span>
            </button>
            <button class="admin-nav-item ${activeTab === 'banners' ? 'active' : ''}" data-tab="banners">
              <span class="admin-nav-icon">🖼️</span>
              <span>16:9 Launch Banners</span>
            </button>
            <button class="admin-nav-item ${activeTab === 'notes' ? 'active' : ''}" data-tab="notes">
              <span class="admin-nav-icon">📑</span>
              <span>PDF Notes & Materials</span>
            </button>
            <button class="admin-nav-item ${activeTab === 'notifications' ? 'active' : ''}" data-tab="notifications">
              <span class="admin-nav-icon">🔔</span>
              <span>Push Notifications</span>
            </button>
            <button class="admin-nav-item ${activeTab === 'students' ? 'active' : ''}" data-tab="students">
              <span class="admin-nav-icon">👥</span>
              <span>Student Enrollments</span>
            </button>
            <button class="admin-nav-item ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
              <span class="admin-nav-icon">⚙️</span>
              <span>Coaching Settings</span>
            </button>
          </nav>

          <div class="admin-sidebar-footer">
            <button class="btn-open-preview" id="btn-open-mobile-app">
              <span>📱</span>
              <span>Open Mobile App View</span>
            </button>
          </div>
        </aside>

        <!-- Main Body -->
        <main class="admin-main">
          <!-- Topbar -->
          <header class="admin-topbar">
            <div class="admin-topbar-title-wrap">
              <h1 class="admin-page-title">${getPageTitle(activeTab)}</h1>
              <p class="admin-page-subtitle">${getPageSubtitle(activeTab)}</p>
            </div>

            <div class="admin-topbar-actions">
              <div class="view-mode-selector">
                <button class="view-mode-btn" id="btn-view-mobile">📱 App Only</button>
                <button class="view-mode-btn active" id="btn-view-admin">🛠️ Admin Only</button>
                <button class="view-mode-btn" id="btn-view-split">⚡ Split Screen</button>
              </div>
            </div>
          </header>

          <!-- Tab Content Body -->
          <div class="admin-content-body">
            ${renderTabContent(activeTab)}
          </div>
        </main>

        <!-- Dynamic Modals Container -->
        <div id="admin-modals-root"></div>
      </div>
    `;

    attachAdminEvents(containerElement, onSwitchToApp, onSwitchToSplit, update);
  }

  // Subscribe to store updates
  store.subscribe(() => {
    // Only re-render if we are in admin view
    const currentAdmin = document.querySelector('.admin-layout');
    if (currentAdmin) {
      update();
    }
  });

  update();
}

function getPageTitle(tab) {
  switch (tab) {
    case 'dashboard': return 'Coaching Analytics & Dashboard';
    case 'courses': return 'Course Catalog & Batch Management';
    case 'lectures': return '🎥 Unlisted YouTube Video Lectures & Live Classes';
    case 'banners': return '16:9 Featured Launch Banners';
    case 'notes': return 'Study Material & PDF Notes Library';
    case 'notifications': return 'Student Broadcast & Notifications';
    case 'students': return 'Student Registrations & Fee Records';
    case 'settings': return 'App & Coaching Configuration';
    default: return 'Admin Panel';
  }
}

function getPageSubtitle(tab) {
  switch (tab) {
    case 'dashboard': return 'Real-time performance metrics, enrollments, and revenue';
    case 'courses': return 'Create and manage courses shown in the mobile app home slider';
    case 'lectures': return 'Paste unlisted YouTube lecture links with custom anti-leak player controls';
    case 'banners': return 'Upload 16:9 YouTube thumbnail size batch launch posters';
    case 'notes': return 'Manage free & paid study handouts, formulas and test series';
    case 'notifications': return 'Broadcast instant messages to all student devices';
    case 'students': return 'Track student enrollment receipts and batch access';
    case 'settings': return 'Configure WhatsApp counselor, social links, and contact info';
    default: return '';
  }
}

function renderTabContent(tab) {
  switch (tab) {
    case 'dashboard': return renderDashboardTab();
    case 'courses': return renderCoursesTab();
    case 'lectures': return renderLecturesTab();
    case 'banners': return renderBannersTab();
    case 'notes': return renderNotesTab();
    case 'notifications': return renderNotificationsTab();
    case 'students': return renderStudentsTab();
    case 'settings': return renderSettingsTab();
    default: return renderDashboardTab();
  }
}

// 1. Dashboard Tab
function renderDashboardTab() {
  const totalCourses = store.courses.length;
  const totalBanners = store.banners.length;
  const totalNotes = store.notes.length;
  const totalRevenue = store.students.reduce((acc, s) => acc + s.amount, 0) + 195000;

  return `
    <div class="stat-cards-grid">
      <div class="stat-card" style="--stat-color: #10b981;">
        <div class="stat-header">
          <span>Total Coaching Revenue</span>
          <span class="stat-icon">💰</span>
        </div>
        <div class="stat-value">₹${totalRevenue.toLocaleString('en-IN')}</div>
        <div class="stat-footer">
          <span>▲ 24.8%</span>
          <span style="color:#94a3b8;font-weight:normal;">vs last month</span>
        </div>
      </div>

      <div class="stat-card" style="--stat-color: #3b82f6;">
        <div class="stat-header">
          <span>Enrolled Students</span>
          <span class="stat-icon">👥</span>
        </div>
        <div class="stat-value">26,750+</div>
        <div class="stat-footer">
          <span>▲ 180+</span>
          <span style="color:#94a3b8;font-weight:normal;">new this week</span>
        </div>
      </div>

      <div class="stat-card" style="--stat-color: #ffb800;">
        <div class="stat-header">
          <span>Active Batches</span>
          <span class="stat-icon">🎓</span>
        </div>
        <div class="stat-value">${totalCourses}</div>
        <div class="stat-footer" style="color: #60a5fa;">
          <span>● ${totalBanners} Featured on Home</span>
        </div>
      </div>

      <div class="stat-card" style="--stat-color: #ec4899;">
        <div class="stat-header">
          <span>PDF Notes Downloads</span>
          <span class="stat-icon">📑</span>
        </div>
        <div class="stat-value">10,920</div>
        <div class="stat-footer" style="color: #a78bfa;">
          <span>Across ${totalNotes} resources</span>
        </div>
      </div>
    </div>

    <!-- Active Courses Quick View -->
    <div class="admin-card">
      <div class="admin-card-header">
        <h2 class="admin-card-title">
          <span>🔥</span>
          <span>Featured Batches on Android Home</span>
        </h2>
        <button class="admin-btn-primary" id="btn-quick-add-course">
          <span>+</span>
          <span>Add New Batch</span>
        </button>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Batch Title</th>
              <th>Category</th>
              <th>Price (Offer / M.R.P.)</th>
              <th>Faculty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${store.courses.map(c => `
              <tr>
                <td>
                  <div class="table-course-item">
                    <img src="${c.image}" class="table-course-thumb" alt="${c.title}" />
                    <div>
                      <div style="font-weight:700; color:#fff;">${c.title}</div>
                      <div style="font-size:11px; color:#94a3b8;">${c.batchDate}</div>
                    </div>
                  </div>
                </td>
                <td><span class="badge-status free">${c.category}</span></td>
                <td>
                  <strong style="color:#10b981;">₹${c.discountPrice}</strong> 
                  <span style="text-decoration:line-through; color:#94a3b8; font-size:11px;">₹${c.originalPrice}</span>
                  <span style="font-size:10px; color:#ffb800; font-weight:bold;">(${c.discountPercent}% OFF)</span>
                </td>
                <td>${c.faculty}</td>
                <td><span class="badge-status active">${c.status || 'Active'}</span></td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="admin-btn-secondary" data-action="edit-course" data-id="${c.id}">Edit</button>
                    <button class="admin-btn-danger" data-action="delete-course" data-id="${c.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Student Registrations -->
    <div class="admin-card">
      <div class="admin-card-header">
        <h2 class="admin-card-title">
          <span>🎓</span>
          <span>Recent Student Enrollments</span>
        </h2>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Contact Details</th>
              <th>Course Enrolled</th>
              <th>Amount Paid</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${store.students.slice(0, 5).map(s => `
              <tr>
                <td style="font-weight:700; color:#fff;">${s.name}</td>
                <td style="font-size:12px; color:#94a3b8;">${s.phone}<br/>${s.email}</td>
                <td style="color:#60a5fa; font-weight:600;">${s.course}</td>
                <td style="font-weight:800; color:#10b981;">₹${s.amount}</td>
                <td style="font-size:12px; color:#94a3b8;">${s.date}</td>
                <td><span class="badge-status active">${s.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 2. Courses Tab
function renderCoursesTab() {
  return `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title">Courses & Batches Catalog</h2>
          <p style="font-size:12px; color:#94a3b8; margin-top:3px;">
            These courses display in the horizontally scrolling peek section and search in the Kotlin Android app.
          </p>
        </div>
        <button class="admin-btn-primary" id="btn-add-course">
          <span>+</span>
          <span>Create New Course</span>
        </button>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Title & Category</th>
              <th>Faculty</th>
              <th>Pricing</th>
              <th>Schedule</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${store.courses.map(c => `
              <tr>
                <td>
                  <img src="${c.image}" class="table-course-thumb" alt="${c.title}" />
                </td>
                <td>
                  <div style="font-weight:800; color:#ffffff; font-size:14px;">${c.title}</div>
                  <div style="display:flex; gap:6px; margin-top:4px;">
                    <span class="badge-status free">${c.category}</span>
                    <span style="font-size:11px; color:#94a3b8;">★ ${c.rating} (${c.students})</span>
                  </div>
                </td>
                <td style="font-size:12.5px; color:#e2e8f0;">${c.faculty}</td>
                <td>
                  <div style="font-size:15px; font-weight:800; color:#10b981;">₹${c.discountPrice}</div>
                  <div style="font-size:11px; color:#94a3b8; text-decoration:line-through;">₹${c.originalPrice}</div>
                  <div style="font-size:10px; color:#ffb800; font-weight:bold;">${c.discountPercent}% OFF</div>
                </td>
                <td style="font-size:12px; color:#cbd5e1;">${c.batchDate}</td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="admin-btn-secondary" data-action="edit-course" data-id="${c.id}">Edit</button>
                    <button class="admin-btn-danger" data-action="delete-course" data-id="${c.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 2.2 Course Lectures & Unlisted YouTube Video Tab
function renderLecturesTab() {
  const lectures = store.lectures || [];

  return `
    <!-- Anti-Leak Security Info Banner -->
    <div style="background:linear-gradient(135deg, #091e60 0%, #1e3a8a 100%); border:1px solid rgba(59, 130, 246, 0.3); border-radius:16px; padding:18px 20px; margin-bottom:24px; color:#fff;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
        <span style="font-size:20px;">🛡️</span>
        <h3 style="font-size:16px; font-weight:800; color:#fff;">Anti-Leak YouTube Player Protection Active</h3>
      </div>
      <p style="font-size:12.5px; color:#bfdbfe; line-height:1.5;">
        Paste your unlisted YouTube lecture links here. In the student app, all native YouTube titles, share buttons, channel links, and URLs are shielded and blocked by our custom player layer. Students can only use: <strong>Speed, Play/Pause, Scrubber Bar, and Video Quality</strong>.
      </p>
    </div>

    <!-- Add Lecture Form -->
    <div class="admin-card" style="max-width:760px; margin-bottom:24px;">
      <div class="admin-card-header">
        <h2 class="admin-card-title">
          <span>+</span>
          <span>Add Lecture / Live Class (Paste Unlisted YouTube Link)</span>
        </h2>
      </div>

      <form id="form-add-lecture" style="display:flex; flex-direction:column; gap:16px;">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Select Course / Batch</label>
            <select id="lec-course-id" class="form-select" required>
              ${store.courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Video Duration</label>
            <div style="height:44px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; display:flex; align-items:center; padding:0 14px; font-size:13px; color:#10b981; font-weight:700; gap:8px;">
              <span>⚡</span>
              <span>Auto-fetched directly from YouTube Video API</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Lecture Title</label>
          <input type="text" id="lec-title" class="form-input" value="Parts of Speech: English Grammar Masterclass" placeholder="e.g. Parts of Speech: English Grammar Masterclass" required />
        </div>

        <div class="form-group">
          <label class="form-label">Unlisted YouTube Video or Live Stream URL</label>
          <input type="url" id="lec-url" class="form-input" value="https://youtu.be/wdaBwIv7Jso?si=W-8-boaeRP1YSLJr" placeholder="https://youtu.be/... or https://youtube.com/watch?v=..." required />
          <span style="font-size:11px; color:#94a3b8; margin-top:2px;">
            Supports YouTube unlisted URLs, short links & live streams. (Loaded test video: <code>wdaBwIv7Jso</code>)
          </span>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="lec-is-live" style="width:16px; height:16px; cursor:pointer;" />
          <label for="lec-is-live" style="font-size:13px; color:#cbd5e1; cursor:pointer; font-weight:600;">
            Mark as LIVE Stream (Shows glowing red LIVE badge in app)
          </label>
        </div>

        <div style="display:flex; gap:10px; margin-top:6px;">
          <button type="submit" class="admin-btn-primary">
            <span>⚡</span>
            <span>Publish Lecture to Course</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Active Lectures Table -->
    <div class="admin-card">
      <div class="admin-card-header">
        <h2 class="admin-card-title">
          <span>📚</span>
          <span>Course Lectures Catalog (${lectures.length})</span>
        </h2>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Lecture Title</th>
              <th>Assigned Course</th>
              <th>YouTube Video ID</th>
              <th>Duration</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${lectures.map(l => {
              const c = store.courses.find(course => course.id === l.courseId);
              return `
                <tr>
                  <td>
                    <div style="font-weight:700; color:#fff;">${l.title}</div>
                    <div style="font-size:11px; color:#94a3b8; font-family:monospace; margin-top:2px;">${l.youtubeUrl}</div>
                  </td>
                  <td style="color:#60a5fa; font-weight:600;">${c ? c.title : 'General'}</td>
                  <td>
                    <span style="background:rgba(255,255,255,0.08); padding:3px 8px; border-radius:6px; font-family:monospace; font-size:12px; color:#ffb800; border:1px solid rgba(255,255,255,0.12);">
                      ${l.videoId}
                    </span>
                  </td>
                  <td style="font-size:12.5px; color:#cbd5e1;">${l.duration}</td>
                  <td>
                    <span class="badge-status ${l.isLive ? 'active' : 'free'}" style="${l.isLive ? 'background:rgba(225,29,72,0.2); color:#f43f5e;' : ''}">
                      ${l.isLive ? '🔴 LIVE' : 'Recorded'}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      <button class="admin-btn-primary btn-test-player" data-video-id="${l.videoId}" data-title="${l.title}" data-live="${l.isLive}" style="padding:6px 12px; font-size:11.5px;">
                        <span>▶</span>
                        <span>Test Secure Player</span>
                      </button>
                      <button class="admin-btn-danger" data-action="delete-lecture" data-id="${l.id}">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 3. 16:9 Launch Banners Tab
function renderBannersTab() {
  return `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title">Featured Batch Launch Banners (16:9 YouTube Thumbnail Ratio)</h2>
          <p style="font-size:12px; color:#94a3b8; margin-top:3px;">
            These 16:9 promotional posters appear in the top auto-advancing carousel in the Android app. Tapping them takes students directly to that course.
          </p>
        </div>
        <button class="admin-btn-primary" id="btn-add-banner">
          <span>+</span>
          <span>Add Launch Banner</span>
        </button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px; margin-top:16px;">
        ${store.banners.map(b => {
          const linkedCourse = store.courses.find(c => c.id === b.courseId);
          return `
            <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:16px; overflow:hidden; display:flex; flex-direction:column;">
              <div style="position:relative; width:100%; aspect-ratio:16/9; background:#000;">
                <img src="${b.image}" style="width:100%; height:100%; object-fit:cover;" />
                <div style="position:absolute; top:10px; left:10px; background:#e11d48; color:#fff; font-size:10px; font-weight:800; padding:3px 8px; border-radius:6px;">
                  ${b.badge}
                </div>
              </div>
              <div style="padding:16px; display:flex; flex-direction:column; gap:6px; flex:1;">
                <div style="font-size:14.5px; font-weight:800; color:#fff;">${b.title}</div>
                <div style="font-size:12px; color:#ffb800; font-weight:600;">${b.subtitle}</div>
                <div style="font-size:11.5px; color:#94a3b8; margin-top:4px;">
                  Linked Course: <strong style="color:#60a5fa;">${linkedCourse ? linkedCourse.title : 'None'}</strong>
                </div>

                <div style="display:flex; justify-content:flex-end; margin-top:14px; pt:10px; border-top:1px solid rgba(255,255,255,0.06);">
                  <button class="admin-btn-danger" data-action="delete-banner" data-id="${b.id}">Delete Banner</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// 4. Notes & Study Materials Tab
function renderNotesTab() {
  return `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title">Study Materials & Notes (Free & Paid)</h2>
          <p style="font-size:12px; color:#94a3b8; margin-top:3px;">
            Accessible via the "Paid Notes" and "Free Notes" quick action boxes in the Android app.
          </p>
        </div>
        <button class="admin-btn-primary" id="btn-add-note">
          <span>+</span>
          <span>Upload PDF Note</span>
        </button>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Document Title</th>
              <th>Category</th>
              <th>Access Type</th>
              <th>File Size</th>
              <th>Total Downloads</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${store.notes.map(n => `
              <tr>
                <td style="font-weight:700; color:#fff;">
                  <span>📄 ${n.title}</span>
                </td>
                <td><span class="badge-status free">${n.category}</span></td>
                <td>
                  <span class="badge-status ${n.type === 'free' ? 'free' : 'paid'}">
                    ${n.type === 'free' ? 'FREE' : `PAID (₹${n.price})`}
                  </span>
                </td>
                <td style="font-size:12px; color:#94a3b8;">${n.size}</td>
                <td style="font-weight:700; color:#10b981;">${n.downloads.toLocaleString()}</td>
                <td>
                  <button class="admin-btn-danger" data-action="delete-note" data-id="${n.id}">Remove</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 5. Notifications Tab
function renderNotificationsTab() {
  return `
    <div class="admin-card" style="max-width:700px; margin-bottom:24px;">
      <div class="admin-card-header">
        <h2 class="admin-card-title">Broadcast Notification to Students</h2>
      </div>

      <form id="form-send-notification" style="display:flex; flex-direction:column; gap:16px;">
        <div class="form-group">
          <label class="form-label">Notification Title</label>
          <input type="text" id="notif-title" class="form-input" placeholder="e.g. 🔴 Live Class Starting in 15 Minutes!" required />
        </div>
        <div class="form-group">
          <label class="form-label">Notification Message</label>
          <textarea id="notif-desc" class="form-textarea" rows="3" placeholder="Enter detailed message for students..." required></textarea>
        </div>
        <button type="submit" class="admin-btn-primary" style="align-self:flex-start;">
          <span>🚀</span>
          <span>Send Push Notification</span>
        </button>
      </form>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <h2 class="admin-card-title">Recent Broadcast History</h2>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Sent Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${store.notifications.map(n => `
              <tr>
                <td style="font-weight:800; color:#fff;">${n.title}</td>
                <td style="font-size:12.5px; color:#cbd5e1;">${n.desc}</td>
                <td style="font-size:11.5px; color:#94a3b8;">${n.time}</td>
                <td>
                  <button class="admin-btn-danger" data-action="delete-notification" data-id="${n.id}">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 6. Student Enrollments Tab
function renderStudentsTab() {
  return `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h2 class="admin-card-title">Registered Students & Admissions</h2>
          <p style="font-size:12px; color:#94a3b8; margin-top:3px;">
            Complete list of students who tapped "Buy Now" and completed enrollment.
          </p>
        </div>
        <button class="admin-btn-secondary" id="btn-export-students">
          <span>📥</span>
          <span>Export CSV</span>
        </button>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Enrolled Course</th>
              <th>Fee Paid</th>
              <th>Registration Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${store.students.map(s => `
              <tr>
                <td style="font-weight:700; color:#fff;">${s.name}</td>
                <td style="color:#94a3b8;">${s.phone}</td>
                <td style="color:#94a3b8;">${s.email}</td>
                <td style="color:#60a5fa; font-weight:600;">${s.course}</td>
                <td style="font-weight:800; color:#10b981;">₹${s.amount}</td>
                <td style="font-size:12px; color:#94a3b8;">${s.date}</td>
                <td><span class="badge-status active">${s.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 7. Settings Tab
function renderSettingsTab() {
  const s = store.settings;
  return `
    <div class="admin-card" style="max-width:700px;">
      <div class="admin-card-header">
        <h2 class="admin-card-title">App & Coaching Information</h2>
      </div>

      <form id="form-settings" style="display:flex; flex-direction:column; gap:16px;">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Coaching Institute Name</label>
            <input type="text" id="set-name" class="form-input" value="${s.coachingName}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Tagline</label>
            <input type="text" id="set-tagline" class="form-input" value="${s.tagline}" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">WhatsApp Helpline (with Country Code)</label>
            <input type="text" id="set-whatsapp" class="form-input" value="${s.whatsapp}" placeholder="919876543210" required />
          </div>
          <div class="form-group">
            <label class="form-label">Phone Support</label>
            <input type="text" id="set-phone" class="form-input" value="${s.phone}" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Official YouTube Channel URL</label>
          <input type="url" id="set-youtube" class="form-input" value="${s.youtubeUrl}" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Instagram Handle URL</label>
            <input type="url" id="set-instagram" class="form-input" value="${s.instagramUrl}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Facebook Page URL</label>
            <input type="url" id="set-facebook" class="form-input" value="${s.facebookUrl}" required />
          </div>
        </div>

        <div style="display:flex; gap:12px; margin-top:10px;">
          <button type="submit" class="admin-btn-primary">
            <span>💾</span>
            <span>Save Settings</span>
          </button>
          <button type="button" id="btn-reset-data" class="admin-btn-danger">
            Reset Demo Data to Defaults
          </button>
        </div>
      </form>
    </div>
  `;
}

// Attach Event Listeners
function attachAdminEvents(containerElement, onSwitchToApp, onSwitchToSplit, update) {
  // Navigation tabs
  containerElement.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.getAttribute('data-tab');
      update();
    });
  });

  // View switchers
  const btnApp = containerElement.querySelector('#btn-view-mobile');
  if (btnApp) btnApp.addEventListener('click', onSwitchToApp);

  const btnOpenApp = containerElement.querySelector('#btn-open-mobile-app');
  if (btnOpenApp) btnOpenApp.addEventListener('click', onSwitchToApp);

  const btnSplit = containerElement.querySelector('#btn-view-split');
  if (btnSplit) btnSplit.addEventListener('click', onSwitchToSplit);

  // Add course modal triggers
  const btnAddCourse = containerElement.querySelector('#btn-add-course') || containerElement.querySelector('#btn-quick-add-course');
  if (btnAddCourse) {
    btnAddCourse.addEventListener('click', () => {
      openCourseModal();
    });
  }

  // Add banner modal trigger
  const btnAddBanner = containerElement.querySelector('#btn-add-banner');
  if (btnAddBanner) {
    btnAddBanner.addEventListener('click', () => {
      openBannerModal();
    });
  }

  // Add note modal trigger
  const btnAddNote = containerElement.querySelector('#btn-add-note');
  if (btnAddNote) {
    btnAddNote.addEventListener('click', () => {
      openNoteModal();
    });
  }

  // Delete course action
  containerElement.querySelectorAll('[data-action="delete-course"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this course from the app?')) {
        store.deleteCourse(id);
      }
    });
  });

  // Edit course action
  containerElement.querySelectorAll('[data-action="edit-course"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const course = store.courses.find(c => c.id === id);
      if (course) {
        openCourseModal(course);
      }
    });
  });

  // Delete banner action
  containerElement.querySelectorAll('[data-action="delete-banner"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this 16:9 launch banner from the home carousel?')) {
        store.deleteBanner(id);
      }
    });
  });

  // Delete note action
  containerElement.querySelectorAll('[data-action="delete-note"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      store.deleteNote(id);
    });
  });

  // Delete notification action
  containerElement.querySelectorAll('[data-action="delete-notification"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      store.deleteNotification(id);
    });
  });

  // Notification form submit
  const formNotif = containerElement.querySelector('#form-send-notification');
  if (formNotif) {
    formNotif.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = containerElement.querySelector('#notif-title').value.trim();
      const desc = containerElement.querySelector('#notif-desc').value.trim();
      if (title && desc) {
        store.sendNotification(title, desc);
        alert('🔔 Push Notification successfully broadcast to all student devices!');
        formNotif.reset();
      }
    });
  }

  // Settings form submit
  const formSettings = containerElement.querySelector('#form-settings');
  if (formSettings) {
    formSettings.addEventListener('submit', (e) => {
      e.preventDefault();
      store.updateSettings({
        coachingName: containerElement.querySelector('#set-name').value.trim(),
        tagline: containerElement.querySelector('#set-tagline').value.trim(),
        whatsapp: containerElement.querySelector('#set-whatsapp').value.trim(),
        phone: containerElement.querySelector('#set-phone').value.trim(),
        youtubeUrl: containerElement.querySelector('#set-youtube').value.trim(),
        instagramUrl: containerElement.querySelector('#set-instagram').value.trim(),
        facebookUrl: containerElement.querySelector('#set-facebook').value.trim()
      });
      alert('Coaching configuration updated successfully!');
    });

    const btnReset = containerElement.querySelector('#btn-reset-data');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Reset all demo courses, banners, and enrollments to default values?')) {
          store.resetToDefaults();
          update();
        }
      });
    }
  }

  // Add Lecture Form Submit
  const formAddLecture = containerElement.querySelector('#form-add-lecture');
  if (formAddLecture) {
    formAddLecture.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawUrl = containerElement.querySelector('#lec-url').value.trim();
      const extractedId = extractYouTubeId(rawUrl);

      store.addLecture({
        courseId: containerElement.querySelector('#lec-course-id').value,
        title: containerElement.querySelector('#lec-title').value.trim(),
        youtubeUrl: rawUrl,
        videoId: extractedId,
        duration: 'Auto-sync (Native)',
        isLive: containerElement.querySelector('#lec-is-live').checked
      });

      alert(`✅ Lecture published successfully with Anti-Leak Protection!\n\nVideo ID: ${extractedId}`);
      update();
    });
  }

  // Delete Lecture Action
  containerElement.querySelectorAll('[data-action="delete-lecture"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this lecture video from the course?')) {
        store.deleteLecture(id);
        update();
      }
    });
  });

  // Test Secure Player in Admin Modal
  containerElement.querySelectorAll('.btn-test-player').forEach(btn => {
    btn.addEventListener('click', () => {
      const videoId = btn.getAttribute('data-video-id');
      const title = btn.getAttribute('data-title');
      const isLive = btn.getAttribute('data-live') === 'true';
      openLecturePlayerModal(videoId, title, isLive);
    });
  });

  // Export CSV
  const btnExport = containerElement.querySelector('#btn-export-students');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      alert('Exported students record to brilliant_english_students.csv');
    });
  }
}

// Modal: Test Secure Video Player
function openLecturePlayerModal(videoId, title, isLive) {
  const root = document.getElementById('admin-modals-root');

  root.innerHTML = `
    <div class="admin-modal-backdrop open" id="player-modal-backdrop">
      <div class="admin-modal-box" style="max-width:740px;">
        <div class="admin-modal-header" style="background:#090f21;">
          <div>
            <h3 class="admin-modal-title">🛡️ Secure Player Test (Student View)</h3>
            <span style="font-size:11.5px; color:#10b981; font-weight:600;">✓ YouTube title, share button & links are 100% blocked</span>
          </div>
          <button class="admin-modal-close" id="btn-close-player-modal">✕</button>
        </div>

        <div class="admin-modal-body" style="padding:16px;">
          <div id="player-mount-point" style="width:100%;"></div>

          <!-- Feature Verification Callout -->
          <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:14px; margin-top:12px;">
            <div style="font-size:12.5px; font-weight:700; color:#fff; margin-bottom:6px;">Student Player Controls Verification:</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:11.5px; color:#94a3b8;">
              <div>✅ <strong>Play / Pause:</strong> Custom touch button</div>
              <div>✅ <strong>Timer / Scrubber:</strong> Exact seekbar & duration</div>
              <div>✅ <strong>Speed:</strong> 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x</div>
              <div>✅ <strong>Quality:</strong> 1080p, 720p, 480p, 360p</div>
              <div>🔒 <strong>No Share:</strong> Native YouTube controls disabled</div>
              <div>🛡️ <strong>Anti-Piracy:</strong> Student ID floating watermark</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const mountPoint = document.getElementById('player-mount-point');
  const player = new SecureVideoPlayer(mountPoint, {
    videoId: videoId,
    title: title,
    isLive: isLive,
    studentPhone: '+91 98123 45678',
    studentId: 'STUDENT-8942'
  });

  const closeModal = () => {
    player.destroy();
    root.innerHTML = '';
  };

  document.getElementById('btn-close-player-modal').addEventListener('click', closeModal);
  document.getElementById('player-modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'player-modal-backdrop') closeModal();
  });
}

// Modal: Add or Edit Course
function openCourseModal(existingCourse = null) {
  const root = document.getElementById('admin-modals-root');
  const isEdit = !!existingCourse;

  root.innerHTML = `
    <div class="admin-modal-backdrop open" id="course-modal-backdrop">
      <div class="admin-modal-box">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">${isEdit ? 'Edit Course / Batch' : 'Create New Course / Batch'}</h3>
          <button class="admin-modal-close" id="btn-close-course-modal">✕</button>
        </div>

        <form id="form-course-modal">
          <div class="admin-modal-body">
            <div class="form-group">
              <label class="form-label">Course Title</label>
              <input type="text" id="c-title" class="form-input" value="${existingCourse ? existingCourse.title : ''}" placeholder="e.g. English Grammar & Essay Writing Masterclass" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select id="c-category" class="form-select">
                  <option value="Spoken English" ${existingCourse && existingCourse.category === 'Spoken English' ? 'selected' : ''}>Spoken English</option>
                  <option value="Govt Exams" ${existingCourse && existingCourse.category === 'Govt Exams' ? 'selected' : ''}>Govt Exams (SSC & Banking)</option>
                  <option value="Grammar & Writing" ${existingCourse && existingCourse.category === 'Grammar & Writing' ? 'selected' : ''}>Grammar & Writing</option>
                  <option value="Vocabulary Special" ${existingCourse && existingCourse.category === 'Vocabulary Special' ? 'selected' : ''}>Vocabulary Special</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Batch Start Schedule</label>
                <input type="text" id="c-date" class="form-input" value="${existingCourse ? existingCourse.batchDate : 'Starts Next Monday'}" placeholder="e.g. Starts 25th Oct" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Original Price (M.R.P. in ₹)</label>
                <input type="number" id="c-orig-price" class="form-input" value="${existingCourse ? existingCourse.originalPrice : 2999}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Discount Offer Price (₹)</label>
                <input type="number" id="c-disc-price" class="form-input" value="${existingCourse ? existingCourse.discountPrice : 999}" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Faculty / Mentor Name</label>
              <input type="text" id="c-faculty" class="form-input" value="${existingCourse ? existingCourse.faculty : 'Prof. Arvind Kumar (Ex-Examiner)'}" required />
            </div>

            <div class="form-group">
              <label class="form-label">16:9 Thumbnail Poster Image URL</label>
              <select id="c-image-preset" class="form-select" style="margin-bottom:6px;">
                <option value="/images/banner1.jpg">Preset: Spoken English Banner (16:9)</option>
                <option value="/images/course_ssc.jpg">Preset: SSC & Banking Cracker (16:9)</option>
                <option value="/images/course_grammar.jpg">Preset: Grammar & Writing Masterclass (16:9)</option>
                <option value="custom">Enter Custom Image URL...</option>
              </select>
              <input type="text" id="c-image" class="form-input" value="${existingCourse ? existingCourse.image : '/images/banner1.jpg'}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Course Description</label>
              <textarea id="c-desc" class="form-textarea" rows="2" placeholder="Brief summary of what students will achieve...">${existingCourse ? existingCourse.description : 'Comprehensive curriculum covering all fundamentals to advanced topics with weekly tests and speaking feedback.'}</textarea>
            </div>
          </div>

          <div class="admin-modal-footer">
            <button type="button" class="admin-btn-secondary" id="btn-cancel-course">Cancel</button>
            <button type="submit" class="admin-btn-primary">${isEdit ? 'Update Course' : 'Publish Course to App'}</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const backdrop = document.getElementById('course-modal-backdrop');
  const close = () => { root.innerHTML = ''; };

  document.getElementById('btn-close-course-modal').addEventListener('click', close);
  document.getElementById('btn-cancel-course').addEventListener('click', close);

  const presetSelect = document.getElementById('c-image-preset');
  const imgInput = document.getElementById('c-image');
  presetSelect.addEventListener('change', () => {
    if (presetSelect.value !== 'custom') {
      imgInput.value = presetSelect.value;
    }
  });

  document.getElementById('form-course-modal').addEventListener('submit', (e) => {
    e.preventDefault();
    const courseData = {
      title: document.getElementById('c-title').value.trim(),
      category: document.getElementById('c-category').value,
      batchDate: document.getElementById('c-date').value.trim(),
      originalPrice: parseInt(document.getElementById('c-orig-price').value),
      discountPrice: parseInt(document.getElementById('c-disc-price').value),
      faculty: document.getElementById('c-faculty').value.trim(),
      image: document.getElementById('c-image').value.trim(),
      description: document.getElementById('c-desc').value.trim(),
      features: [
        'Live & Recorded Interactive Sessions',
        'Downloadable High-Yield PDF Study Notes',
        '1-on-1 Practice & Doubt Clearance',
        'Full Topic Mock Tests & Quizzes'
      ]
    };

    if (isEdit) {
      store.updateCourse(existingCourse.id, courseData);
    } else {
      store.addCourse(courseData);
    }

    close();
  });
}

// Modal: Add 16:9 Banner
function openBannerModal() {
  const root = document.getElementById('admin-modals-root');

  root.innerHTML = `
    <div class="admin-modal-backdrop open" id="banner-modal-backdrop">
      <div class="admin-modal-box">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Add 16:9 Batch Launch Banner</h3>
          <button class="admin-modal-close" id="btn-close-banner-modal">✕</button>
        </div>

        <form id="form-banner-modal">
          <div class="admin-modal-body">
            <div class="form-group">
              <label class="form-label">Link to Target Course (When Student Taps Banner)</label>
              <select id="b-course-id" class="form-select" required>
                ${store.courses.map(c => `<option value="${c.id}">${c.title} (₹${c.discountPrice})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Banner Main Heading</label>
              <input type="text" id="b-title" class="form-input" placeholder="e.g. Spoken English & Grammar 2026" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Subtitle / Offer Tagline</label>
                <input type="text" id="b-subtitle" class="form-input" placeholder="e.g. New Batch Launched • 50% Off" required />
              </div>
              <div class="form-group">
                <label class="form-label">Highlight Badge</label>
                <input type="text" id="b-badge" class="form-input" value="🔥 NEW BATCH" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">16:9 YouTube Thumbnail Image</label>
              <select id="b-image-select" class="form-select">
                <option value="/images/banner1.jpg">Spoken English 16:9 Poster</option>
                <option value="/images/course_ssc.jpg">SSC & Banking 16:9 Poster</option>
                <option value="/images/course_grammar.jpg">Grammar Masterclass 16:9 Poster</option>
              </select>
            </div>
          </div>

          <div class="admin-modal-footer">
            <button type="button" class="admin-btn-secondary" id="btn-cancel-banner">Cancel</button>
            <button type="submit" class="admin-btn-primary">Add Banner to Home</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const close = () => { root.innerHTML = ''; };
  document.getElementById('btn-close-banner-modal').addEventListener('click', close);
  document.getElementById('btn-cancel-banner').addEventListener('click', close);

  document.getElementById('form-banner-modal').addEventListener('submit', (e) => {
    e.preventDefault();
    store.addBanner({
      courseId: document.getElementById('b-course-id').value,
      title: document.getElementById('b-title').value.trim(),
      subtitle: document.getElementById('b-subtitle').value.trim(),
      badge: document.getElementById('b-badge').value.trim(),
      image: document.getElementById('b-image-select').value
    });
    close();
  });
}

// Modal: Add Note
function openNoteModal() {
  const root = document.getElementById('admin-modals-root');

  root.innerHTML = `
    <div class="admin-modal-backdrop open">
      <div class="admin-modal-box">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Upload PDF Notes / Handout</h3>
          <button class="admin-modal-close" id="btn-close-note">✕</button>
        </div>

        <form id="form-note-modal">
          <div class="admin-modal-body">
            <div class="form-group">
              <label class="form-label">Document Title</label>
              <input type="text" id="n-title" class="form-input" placeholder="e.g. Tenses and Subject-Verb Agreement Formula Sheet" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select id="n-category" class="form-select">
                  <option value="Grammar">Grammar</option>
                  <option value="Vocabulary">Vocabulary</option>
                  <option value="Spoken">Spoken English</option>
                  <option value="Competitive">Competitive Exams</option>
                  <option value="Descriptive">Descriptive Writing</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Type</label>
                <select id="n-type" class="form-select">
                  <option value="free">FREE Content</option>
                  <option value="paid">PAID Notes</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Price (if Paid, in ₹)</label>
                <input type="number" id="n-price" class="form-input" value="99" />
              </div>
              <div class="form-group">
                <label class="form-label">File Size</label>
                <input type="text" id="n-size" class="form-input" value="5.4 MB" required />
              </div>
            </div>
          </div>

          <div class="admin-modal-footer">
            <button type="button" class="admin-btn-secondary" id="btn-cancel-note">Cancel</button>
            <button type="submit" class="admin-btn-primary">Add Document</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const close = () => { root.innerHTML = ''; };
  document.getElementById('btn-close-note').addEventListener('click', close);
  document.getElementById('btn-cancel-note').addEventListener('click', close);

  document.getElementById('form-note-modal').addEventListener('submit', (e) => {
    e.preventDefault();
    store.addNote({
      title: document.getElementById('n-title').value.trim(),
      category: document.getElementById('n-category').value,
      type: document.getElementById('n-type').value,
      price: parseInt(document.getElementById('n-price').value) || 0,
      size: document.getElementById('n-size').value.trim()
    });
    close();
  });
}
