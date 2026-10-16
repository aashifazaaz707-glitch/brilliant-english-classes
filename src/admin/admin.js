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
            <div class="admin-logo-circle">${(store.settings.coachingName || 'S').charAt(0)}</div>
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
            <button class="admin-nav-item ${activeTab === 'curriculum' ? 'active' : ''}" data-tab="curriculum">
              <span class="admin-nav-icon">📚</span>
              <span>Batch Curriculum</span>
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
              <div class="admin-cloud-status-pill">
                <span class="admin-cloud-dot"></span>
                <span>Supabase Live</span>
                <button class="btn-admin-sync" id="btn-admin-cloud-sync" title="Sync live database with Supabase">🔄 Refresh</button>
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
    case 'curriculum': return '📚 Batch Curriculum (Subject ➔ Chapter ➔ Content)';
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
    case 'curriculum': return 'Customize subjects, chapters, lectures, pdfs, and practice tests with live visibility toggles';
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
    case 'curriculum': return renderCurriculumTab();
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
  const totalRevenue = store.students.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

  return `
    <div class="stat-cards-grid">
      <div class="stat-card" style="--stat-color: #10b981;">
        <div class="stat-header">
          <span>Total Coaching Revenue</span>
          <span class="stat-icon">💰</span>
        </div>
        <div class="stat-value">₹${totalRevenue.toLocaleString('en-IN')}</div>
        <div class="stat-footer">
          <span>Verified Ledger</span>
          <span style="color:#94a3b8;font-weight:normal;">from admissions</span>
        </div>
      </div>

      <div class="stat-card" style="--stat-color: #3b82f6;">
        <div class="stat-header">
          <span>Enrolled Students</span>
          <span class="stat-icon">👥</span>
        </div>
        <div class="stat-value">${store.students.length}</div>
        <div class="stat-footer">
          <span>${store.students.length} Total</span>
          <span style="color:#94a3b8;font-weight:normal;">active admissions</span>
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
          <span>Study Notes & Handouts</span>
          <span class="stat-icon">📑</span>
        </div>
        <div class="stat-value">${totalNotes}</div>
        <div class="stat-footer" style="color: #a78bfa;">
          <span>Syllabus & Grammar Handouts</span>
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
            ${store.students.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align:center; padding:32px 16px; color:#94a3b8;">
                  <div style="font-size:22px; margin-bottom:6px;">👥</div>
                  <div style="font-size:13px; font-weight:600; color:#cbd5e1;">No Student Admissions Yet</div>
                  <div style="font-size:11px; color:#64748b; margin-top:2px;">Real student enrollments will appear here automatically when students enroll.</div>
                </td>
              </tr>
            ` : store.students.slice(0, 5).map(s => `
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

// 2.1 Batch Curriculum (Subjects -> Chapters -> Content) Tab
let selectedCurriculumCourseId = null;

function renderCurriculumTab() {
  if (!selectedCurriculumCourseId && store.courses.length > 0) {
    selectedCurriculumCourseId = store.courses[0].id;
  }
  const course = store.courses.find(c => c.id === selectedCurriculumCourseId) || store.courses[0];
  const subjects = course?.subjects || [];

  return `
    <div class="admin-card" style="margin-bottom: 20px;">
      <div class="admin-card-header" style="flex-wrap: wrap; gap: 12px;">
        <div style="flex: 1; min-width: 260px;">
          <h2 class="admin-card-title">📚 Batch Curriculum Manager</h2>
          <p style="font-size:12px; color:#94a3b8; margin-top:3px;">
            Configure Subjects, Chapters, and Resources (Lectures, PDFs, Practice). Use the green toggle switches to show or hide any item from students in real-time.
          </p>
        </div>

        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <label style="font-size:12.5px; font-weight:700; color:#cbd5e1;">Select Batch:</label>
          <select id="curriculum-course-select" class="form-select" style="width: auto; min-width: 240px; background:#0f172a; color:#fff; border-color:#334155;">
            ${store.courses.map(c => `
              <option value="${c.id}" ${course && c.id === course.id ? 'selected' : ''}>${c.title}</option>
            `).join('')}
          </select>
          ${course ? `
            <button class="admin-btn-primary" id="btn-add-subject-modal" data-course-id="${course.id}">
              <span>+</span>
              <span>Add Subject</span>
            </button>
          ` : ''}
        </div>
      </div>

      <div style="padding: 16px 20px 20px;">
        ${!course ? `
          <div style="text-align:center; padding: 40px; color:#94a3b8;">
            No batches created yet. Please create a course first in Courses & Batches tab.
          </div>
        ` : subjects.length === 0 ? `
          <div style="text-align:center; padding: 40px; background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.1); border-radius:12px; color:#94a3b8;">
            <div style="font-size:32px; margin-bottom:8px;">📚</div>
            <div style="font-size:14px; font-weight:700; color:#fff; margin-bottom:4px;">No Subjects Added to this Batch Yet</div>
            <div style="font-size:12px; margin-bottom:14px;">Add a subject (e.g. Spoken English, Grammar, Vocabulary) to begin structuring chapters.</div>
            <button class="admin-btn-primary" id="btn-add-subject-empty" data-course-id="${course.id}">+ Add First Subject</button>
          </div>
        ` : `
          <div class="curriculum-tree-wrap">
            ${subjects.map((sub, sIdx) => `
              <div class="curriculum-subject-card">
                <div class="curriculum-subject-header">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:22px;">${sub.icon || '📖'}</span>
                    <div>
                      <div style="font-size:15px; font-weight:800; color:#fff;">
                        ${sub.name}
                        ${sub.visible === false ? '<span style="font-size:10px; color:#f87171; background:rgba(239,68,68,0.2); padding:2px 6px; border-radius:4px; margin-left:6px;">HIDDEN FROM STUDENTS</span>' : ''}
                      </div>
                      <div style="font-size:11.5px; color:#94a3b8; margin-top:2px;">
                        ${(sub.chapters || []).length} Chapters inside this Subject
                      </div>
                    </div>
                  </div>

                  <div style="display:flex; align-items:center; gap:12px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                      <span style="font-size:11px; color:#cbd5e1; font-weight:600;">Show in App:</span>
                      <label class="admin-switch" title="Toggle subject visibility in student app">
                        <input type="checkbox" class="curriculum-toggle-subject" data-course-id="${course.id}" data-subject-id="${sub.id}" ${sub.visible !== false ? 'checked' : ''} />
                        <span class="admin-slider"></span>
                      </label>
                    </div>

                    <button class="admin-btn-secondary" data-action="add-chapter-modal" data-course-id="${course.id}" data-subject-id="${sub.id}" style="padding:5px 10px; font-size:11.5px;">
                      + Add Chapter
                    </button>
                    <button class="admin-btn-danger" data-action="delete-subject" data-course-id="${course.id}" data-subject-id="${sub.id}" style="padding:5px 9px; font-size:11.5px;" title="Delete Subject">
                      🗑️
                    </button>
                  </div>
                </div>

                <div class="curriculum-chapters-list">
                  ${(sub.chapters || []).length === 0 ? `
                    <div style="padding:14px; text-align:center; color:#64748b; font-size:12px; background:rgba(255,255,255,0.01); border-radius:8px;">
                      No chapters in this subject yet. Click "+ Add Chapter" above.
                    </div>
                  ` : (sub.chapters || []).map((ch, cIdx) => `
                    <div class="curriculum-chapter-box">
                      <div class="curriculum-chapter-header">
                        <div style="display:flex; align-items:center; gap:8px;">
                          <span style="color:#60a5fa; font-weight:800; font-size:13px;">#${cIdx + 1}</span>
                          <div>
                            <span style="font-size:13.5px; font-weight:700; color:#f1f5f9;">${ch.title}</span>
                            ${ch.visible === false ? '<span style="font-size:9.5px; color:#f87171; background:rgba(239,68,68,0.2); padding:1px 5px; border-radius:4px; margin-left:6px;">HIDDEN</span>' : ''}
                          </div>
                        </div>

                        <div style="display:flex; align-items:center; gap:10px;">
                          <div style="display:flex; align-items:center; gap:5px;">
                            <span style="font-size:10.5px; color:#94a3b8;">Visible:</span>
                            <label class="admin-switch" title="Toggle chapter visibility in student app">
                              <input type="checkbox" class="curriculum-toggle-chapter" data-course-id="${course.id}" data-subject-id="${sub.id}" data-chapter-id="${ch.id}" ${ch.visible !== false ? 'checked' : ''} />
                              <span class="admin-slider"></span>
                            </label>
                          </div>
                          <button class="admin-btn-danger" data-action="delete-chapter" data-course-id="${course.id}" data-subject-id="${sub.id}" data-chapter-id="${ch.id}" style="padding:4px 8px; font-size:11px;" title="Delete Chapter">
                            ✕
                          </button>
                        </div>
                      </div>

                      <div class="curriculum-chapter-body">
                        <!-- 1. Lectures Section -->
                        <div class="curriculum-resource-group">
                          <div class="curriculum-resource-header">
                            <span style="color:#60a5fa;">🎥 Video Lectures (${(ch.lectures || []).length})</span>
                            <button class="admin-btn-secondary" data-action="add-lecture-res-modal" data-course-id="${course.id}" data-subject-id="${sub.id}" data-chapter-id="${ch.id}" style="padding:3px 8px; font-size:10.5px;">
                              + Add Lecture
                            </button>
                          </div>
                          ${(ch.lectures || []).length === 0 ? `
                            <div style="font-size:11px; color:#64748b; padding:4px 0;">No lectures added yet.</div>
                          ` : (ch.lectures || []).map(lec => `
                            <div class="curriculum-item-admin-row">
                              <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                <span style="color:#ef4444; font-size:13px;">▶</span>
                                <div style="font-size:12px; color:#e2e8f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                  ${lec.title}
                                  <span style="font-size:10.5px; color:#94a3b8; margin-left:4px;">(${lec.duration || '25:00'})</span>
                                </div>
                              </div>
                              <div style="display:flex; align-items:center; gap:8px;">
                                <label class="admin-switch" title="Toggle visibility in student app">
                                  <input type="checkbox" class="curriculum-toggle-resource" data-course-id="${course.id}" data-subject-id="${sub.id}" data-chapter-id="${ch.id}" data-type="lectures" data-res-id="${lec.id}" ${lec.visible !== false ? 'checked' : ''} />
                                  <span class="admin-slider"></span>
                                </label>
                                <button class="admin-btn-danger" data-action="delete-resource" data-course-id="${course.id}" data-subject-id="${sub.id}" data-chapter-id="${ch.id}" data-type="lectures" data-res-id="${lec.id}" style="padding:2px 6px; font-size:10px;">✕</button>
                              </div>
                            </div>
                          `).join('')}
                        </div>

                        <!-- 2. PDF Notes Section -->
                        <div class="curriculum-resource-group">
                          <div class="curriculum-resource-header">
                            <span style="color:#f59e0b;">📑 PDF Notes & Handouts (${(ch.pdfs || []).length})</span>
                            <button class="admin-btn-secondary" data-action="add-pdf-res-modal" data-course-id="${course.id}" data-subject-id="${sub.id}" data-chapter-id="${ch.id}" style="padding:3px 8px; font-size:10.5px;">
                              + Add PDF
                            </button>
                          </div>
                          ${(ch.pdfs || []).length === 0 ? `
                            <div style="font-size:11px; color:#64748b; padding:4px 0;">No PDFs added yet.</div>
                          ` : (ch.pdfs || []).map(pdf => `
                            <div class="curriculum-item-admin-row">
                              <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                <span style="color:#f59e0b; font-size:13px;">📄</span>
                                <div style="font-size:12px; color:#e2e8f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                  ${pdf.title}
                                  <span style="font-size:10.5px; color:#94a3b8; margin-left:4px;">(${pdf.pages || '12 Pages'} • ${pdf.size || '2 MB'})</span>
                                </div>
                              </div>
                              <div style="display:flex; align-items:center; gap:8px;">
                                <label class="admin-switch" title="Toggle visibility in student app">
                                  <input type="checkbox" class="curriculum-toggle-resource" data-course-id="${course.id}" data-subject-id="${sub.id}" data-chapter-id="${ch.id}" data-type="pdfs" data-res-id="${pdf.id}" ${pdf.visible !== false ? 'checked' : ''} />
                                  <span class="admin-slider"></span>
                                </label>
                                <button class="admin-btn-danger" data-action="delete-resource" data-course-id="${course.id}" data-subject-id="${sub.id}" data-chapter-id="${ch.id}" data-type="pdfs" data-res-id="${pdf.id}" style="padding:2px 6px; font-size:10px;">✕</button>
                              </div>
                            </div>
                          `).join('')}
                        </div>

                        <!-- 3. Practice Tests Section -->
                        <div class="curriculum-resource-group">
                          <div class="curriculum-resource-header">
                            <span style="color:#10b981;">📝 Practice Tests & Quizzes (${(ch.practices || []).length})</span>
                            <button class="admin-btn-secondary" data-action="add-practice-res-modal" data-course-id="${course.id}" data-subject-id="${sub.id}" data-chapter-id="${ch.id}" style="padding:3px 8px; font-size:10.5px;">
                              + Add Practice
                            </button>
                          </div>
                          ${(ch.practices || []).length === 0 ? `
                            <div style="font-size:11px; color:#64748b; padding:4px 0;">No practice tests added yet.</div>
                          ` : (ch.practices || []).map(pr => `
                            <div class="curriculum-item-admin-row">
                              <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                <span style="color:#10b981; font-size:13px;">✍️</span>
                                <div style="font-size:12px; color:#e2e8f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                  ${pr.title}
                                  <span style="font-size:10.5px; color:#94a3b8; margin-left:4px;">(${pr.questionsCount || 20} Qs • ${pr.timeMinutes || 15} min • ${pr.marks || 40} Marks)</span>
                                </div>
                              </div>
                              <div style="display:flex; align-items:center; gap:8px;">
                                <label class="admin-switch" title="Toggle visibility in student app">
                                  <input type="checkbox" class="curriculum-toggle-resource" data-course-id="${course.id}" data-subject-id="${sub.id}" data-chapter-id="${ch.id}" data-type="practices" data-res-id="${pr.id}" ${pr.visible !== false ? 'checked' : ''} />
                                  <span class="admin-slider"></span>
                                </label>
                                <button class="admin-btn-danger" data-action="delete-resource" data-course-id="${course.id}" data-subject-id="${sub.id}" data-chapter-id="${ch.id}" data-type="practices" data-res-id="${pr.id}" style="padding:2px 6px; font-size:10px;">✕</button>
                              </div>
                            </div>
                          `).join('')}
                        </div>

                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        `}
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
            Verified admissions recorded from online student enrollments & offline coaching admissions.
          </p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="admin-btn-primary" id="btn-add-student-modal">
            <span>+</span>
            <span>Register Offline Student</span>
          </button>
          <button class="admin-btn-secondary" id="btn-export-students">
            <span>📥</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Student Name</th>
              <th>Contact Details</th>
              <th>Enrolled Batch</th>
              <th>Fee Paid</th>
              <th>Admission Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${store.students.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align:center; padding:48px 16px; color:#94a3b8;">
                  <div style="font-size:32px; margin-bottom:8px;">👥</div>
                  <div style="font-size:15px; font-weight:700; color:#e2e8f0;">No Registered Students Yet</div>
                  <div style="font-size:12px; color:#64748b; margin-top:4px;">When students sign in with Google and complete batch enrollment, their verified records and digital fee receipts will appear here automatically.</div>
                  <div style="margin-top:16px;">
                    <button class="admin-btn-primary" id="btn-add-first-student" style="display:inline-flex;">
                      <span>+ Record Offline Admission</span>
                    </button>
                  </div>
                </td>
              </tr>
            ` : store.students.map(s => `
              <tr>
                <td style="font-family:monospace; font-weight:700; color:#ffb800; font-size:12px;">${s.receiptNo || 'SSE-REC-AUTO'}</td>
                <td style="font-weight:700; color:#fff;">${s.name}</td>
                <td style="font-size:12px; color:#94a3b8;">
                  ${s.phone ? `<div>📞 ${s.phone}</div>` : ''}
                  <div>✉️ ${s.email}</div>
                </td>
                <td style="color:#60a5fa; font-weight:600;">${s.course}</td>
                <td style="font-weight:800; color:#10b981;">₹${Number(s.amount).toLocaleString('en-IN')}</td>
                <td style="font-size:12px; color:#94a3b8;">${s.date}</td>
                <td><span class="badge-status active">${s.status || 'Verified'}</span></td>
                <td>
                  <button class="admin-btn-secondary" data-action="view-student-receipt" data-id="${s.id || s.receiptNo}" style="font-size:11.5px; padding:4px 10px;">
                    📄 Receipt
                  </button>
                </td>
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
            <label class="form-label">Lead Teacher / Legal Name</label>
            <input type="text" id="set-teacher" class="form-input" value="${s.teacherName || s.legalName || 'Krishna Kumar'}" placeholder="Krishna Kumar" required />
          </div>
          <div class="form-group">
            <label class="form-label">Official Support Email</label>
            <input type="email" id="set-email" class="form-input" value="${s.email || 'support@smartstudyenglishclasses.com'}" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Institute Registered Address / Legal Location</label>
          <textarea id="set-address" class="form-textarea" rows="2" placeholder="Institute physical address" required>${s.address || 'NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR'}</textarea>
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
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this course from the app?')) {
        btn.textContent = '⏳ Deleting...';
        await store.deleteCourse(id);
        update();
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
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this 16:9 launch banner from the home carousel?')) {
        btn.textContent = '⏳ Deleting...';
        await store.deleteBanner(id);
        update();
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
        teacherName: containerElement.querySelector('#set-teacher').value.trim(),
        legalName: containerElement.querySelector('#set-teacher').value.trim(),
        address: containerElement.querySelector('#set-address').value.trim(),
        email: containerElement.querySelector('#set-email').value.trim(),
        whatsapp: containerElement.querySelector('#set-whatsapp').value.trim(),
        phone: containerElement.querySelector('#set-phone').value.trim(),
        youtubeUrl: containerElement.querySelector('#set-youtube').value.trim(),
        instagramUrl: containerElement.querySelector('#set-instagram').value.trim(),
        facebookUrl: containerElement.querySelector('#set-facebook').value.trim()
      });
      alert('Smart Study English Classes configuration updated successfully!');
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

  // Cloud Sync live database
  const btnCloudSync = containerElement.querySelector('#btn-admin-cloud-sync');
  if (btnCloudSync) {
    btnCloudSync.addEventListener('click', async () => {
      btnCloudSync.textContent = '⏳ Syncing...';
      await store.init();
      await store.fetchRealStudents();
      update();
      alert('Cloud Database refreshed successfully from Supabase!');
    });
  }

  // Register Offline Student Admission Triggers
  const btnAddStudent = containerElement.querySelector('#btn-add-student-modal');
  if (btnAddStudent) {
    btnAddStudent.addEventListener('click', () => {
      openAddStudentAdmissionModal();
    });
  }

  const btnAddFirstStudent = containerElement.querySelector('#btn-add-first-student');
  if (btnAddFirstStudent) {
    btnAddFirstStudent.addEventListener('click', () => {
      openAddStudentAdmissionModal();
    });
  }

  // View Official Fee Receipt
  containerElement.querySelectorAll('[data-action="view-student-receipt"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const studentId = btn.getAttribute('data-id');
      openStudentReceiptModal(studentId);
    });
  });

  // Export Genuine CSV
  const btnExport = containerElement.querySelector('#btn-export-students');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (!store.students.length) {
        alert('No registered student records to export yet.');
        return;
      }
      const headers = ['Receipt No', 'Student Name', 'Phone', 'Email', 'Batch', 'Amount (INR)', 'Date', 'Status'];
      const rows = store.students.map(s => [
        `"${s.receiptNo || ''}"`,
        `"${s.name || ''}"`,
        `"${s.phone || ''}"`,
        `"${s.email || ''}"`,
        `"${s.course || ''}"`,
        s.amount || 0,
        `"${s.date || ''}"`,
        `"${s.status || ''}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `smart_study_admissions_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // ==========================================
  // BATCH CURRICULUM EVENT HANDLERS
  // ==========================================
  const courseSelect = containerElement.querySelector('#curriculum-course-select');
  if (courseSelect) {
    courseSelect.addEventListener('change', (e) => {
      selectedCurriculumCourseId = e.target.value;
      update();
    });
  }

  // Add Subject button
  const btnAddSub = containerElement.querySelector('#btn-add-subject-modal') || containerElement.querySelector('#btn-add-subject-empty');
  if (btnAddSub) {
    btnAddSub.addEventListener('click', () => {
      const courseId = btnAddSub.getAttribute('data-course-id');
      openAddSubjectModal(courseId);
    });
  }

  // Subject visibility toggle
  containerElement.querySelectorAll('.curriculum-toggle-subject').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const courseId = toggle.getAttribute('data-course-id');
      const subjectId = toggle.getAttribute('data-subject-id');
      store.toggleSubjectVisibility(courseId, subjectId);
    });
  });

  // Delete subject
  containerElement.querySelectorAll('[data-action="delete-subject"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseId = btn.getAttribute('data-course-id');
      const subjectId = btn.getAttribute('data-subject-id');
      if (confirm('Delete this Subject and all its Chapters & Content?')) {
        store.deleteSubject(courseId, subjectId);
        update();
      }
    });
  });

  // Add chapter button
  containerElement.querySelectorAll('[data-action="add-chapter-modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseId = btn.getAttribute('data-course-id');
      const subjectId = btn.getAttribute('data-subject-id');
      openAddChapterModal(courseId, subjectId);
    });
  });

  // Chapter visibility toggle
  containerElement.querySelectorAll('.curriculum-toggle-chapter').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const courseId = toggle.getAttribute('data-course-id');
      const subjectId = toggle.getAttribute('data-subject-id');
      const chapterId = toggle.getAttribute('data-chapter-id');
      store.toggleChapterVisibility(courseId, subjectId, chapterId);
    });
  });

  // Delete chapter
  containerElement.querySelectorAll('[data-action="delete-chapter"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseId = btn.getAttribute('data-course-id');
      const subjectId = btn.getAttribute('data-subject-id');
      const chapterId = btn.getAttribute('data-chapter-id');
      if (confirm('Delete this Chapter and all its resources?')) {
        store.deleteChapter(courseId, subjectId, chapterId);
        update();
      }
    });
  });

  // Add resource modals (lectures, pdfs, practices)
  containerElement.querySelectorAll('[data-action="add-lecture-res-modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseId = btn.getAttribute('data-course-id');
      const subjectId = btn.getAttribute('data-subject-id');
      const chapterId = btn.getAttribute('data-chapter-id');
      openAddResourceModal(courseId, subjectId, chapterId, 'lectures');
    });
  });

  containerElement.querySelectorAll('[data-action="add-pdf-res-modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseId = btn.getAttribute('data-course-id');
      const subjectId = btn.getAttribute('data-subject-id');
      const chapterId = btn.getAttribute('data-chapter-id');
      openAddResourceModal(courseId, subjectId, chapterId, 'pdfs');
    });
  });

  containerElement.querySelectorAll('[data-action="add-practice-res-modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseId = btn.getAttribute('data-course-id');
      const subjectId = btn.getAttribute('data-subject-id');
      const chapterId = btn.getAttribute('data-chapter-id');
      openAddResourceModal(courseId, subjectId, chapterId, 'practices');
    });
  });

  // Resource visibility toggle
  containerElement.querySelectorAll('.curriculum-toggle-resource').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const courseId = toggle.getAttribute('data-course-id');
      const subjectId = toggle.getAttribute('data-subject-id');
      const chapterId = toggle.getAttribute('data-chapter-id');
      const type = toggle.getAttribute('data-type');
      const resId = toggle.getAttribute('data-res-id');
      store.toggleResourceVisibility(courseId, subjectId, chapterId, type, resId);
    });
  });

  // Delete resource
  containerElement.querySelectorAll('[data-action="delete-resource"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseId = btn.getAttribute('data-course-id');
      const subjectId = btn.getAttribute('data-subject-id');
      const chapterId = btn.getAttribute('data-chapter-id');
      const type = btn.getAttribute('data-type');
      const resId = btn.getAttribute('data-res-id');
      if (confirm('Delete this item from the chapter?')) {
        store.deleteResource(courseId, subjectId, chapterId, type, resId);
        update();
      }
    });
  });
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
                  <option value="Class 12th Board" ${existingCourse && existingCourse.category === 'Class 12th Board' ? 'selected' : ''}>Class 12th Board</option>
                  <option value="Spoken English" ${existingCourse && existingCourse.category === 'Spoken English' ? 'selected' : ''}>Spoken English</option>
                  <option value="Govt Exams" ${existingCourse && existingCourse.category === 'Govt Exams' ? 'selected' : ''}>Govt Exams (SSC & Banking)</option>
                  <option value="Grammar & Writing" ${existingCourse && existingCourse.category === 'Grammar & Writing' ? 'selected' : ''}>Grammar & Writing</option>
                  <option value="Vocabulary Special" ${existingCourse && existingCourse.category === 'Vocabulary Special' ? 'selected' : ''}>Vocabulary Special</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Batch Start Schedule</label>
                <input type="text" id="c-date" class="form-input" value="${existingCourse ? (existingCourse.batchDate || existingCourse.batch_date || 'Starts 28th Oct 2026') : 'Starts 28th Oct 2026'}" placeholder="e.g. Starts 28th Oct 2026" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Validity Till</label>
                <input type="text" id="c-validity" class="form-input" value="${existingCourse ? (existingCourse.validity || 'Till Board Exam / 1 Year') : 'Till Board Exam / 1 Year'}" placeholder="e.g. Till Board Exam / 1 Year" required />
              </div>
              <div class="form-group">
                <label class="form-label">Intro YouTube Video URL or ID</label>
                <input type="text" id="c-intro-video" class="form-input" value="${existingCourse ? (existingCourse.intro_video_url || existingCourse.introVideoId || 'wdaBwIv7Jso') : 'wdaBwIv7Jso'}" placeholder="e.g. https://youtu.be/wdaBwIv7Jso or wdaBwIv7Jso" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Original Price (M.R.P. in ₹)</label>
                <input type="number" id="c-orig-price" class="form-input" value="${existingCourse ? (existingCourse.originalPrice || existingCourse.original_price || 1999) : 1999}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Discount Offer Price (₹)</label>
                <input type="number" id="c-disc-price" class="form-input" value="${existingCourse ? (existingCourse.discountPrice || existingCourse.discount_price || 499) : 499}" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Faculty / Teacher Name</label>
                <input type="text" id="c-faculty" class="form-input" value="${existingCourse ? existingCourse.faculty : 'Krishna Kumar Sir'}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Teaching Experience</label>
                <input type="text" id="c-experience" class="form-input" value="${existingCourse ? (existingCourse.faculty_experience || existingCourse.facultyExperience || '12+ Years Teaching Experience') : '12+ Years Teaching Experience'}" placeholder="e.g. 12+ Years Teaching Experience" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">16:9 Thumbnail Poster Image URL</label>
              <select id="c-image-preset" class="form-select" style="margin-bottom:6px;">
                <option value="/images/course_class12_crash.jpg">Preset: Class 12th Crash Course Banner (16:9)</option>
                <option value="/images/banner1.jpg">Preset: Spoken English Banner (16:9)</option>
                <option value="/images/course_ssc.jpg">Preset: SSC & Banking Cracker (16:9)</option>
                <option value="/images/course_grammar.jpg">Preset: Grammar & Writing Masterclass (16:9)</option>
                <option value="custom">Enter Custom Image URL...</option>
              </select>
              <input type="text" id="c-image" class="form-input" value="${existingCourse ? (existingCourse.image || '/images/course_class12_crash.jpg') : '/images/course_class12_crash.jpg'}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Batch Description & Highlights (Bullet Points - 1 per line)</label>
              <textarea id="c-desc" class="form-textarea" rows="3" placeholder="Enter bullet points (one per line)...">${existingCourse ? (existingCourse.description || '') : 'Line-by-Line Hindi Summary of All Prose & Poetry Chapters\n50 Marks Objective Board Grammar Crash Rules & Tricks\n10 Full-Length Board Pattern Model Papers with Solutions\nVVI Short & Long Questions with Handwritten Answers'}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">What You Will Get In This Batch (1 item per line)</label>
              <textarea id="c-features" class="form-textarea" rows="3" placeholder="Enter deliverables (one per line)...">${existingCourse && existingCourse.features ? (Array.isArray(existingCourse.features) ? existingCourse.features.join('\n') : existingCourse.features) : '120+ Hours Live & Recorded Interactive Sessions\nComprehensive Chapter-wise PDF Notes & Formula Sheets\nWeekly Dedicated WhatsApp Doubt Clearing Support\n50+ Topic-wise Practice Mock Tests & Solutions'}</textarea>
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
    const rawFeatures = document.getElementById('c-features').value.trim();
    const features = rawFeatures ? rawFeatures.split('\n').map(s => s.trim().replace(/^[-•*]\s*/, '')).filter(Boolean) : [];
    
    const courseData = {
      title: document.getElementById('c-title').value.trim(),
      category: document.getElementById('c-category').value,
      batchDate: document.getElementById('c-date').value.trim(),
      validity: document.getElementById('c-validity').value.trim(),
      introVideoUrl: document.getElementById('c-intro-video').value.trim(),
      originalPrice: parseInt(document.getElementById('c-orig-price').value),
      discountPrice: parseInt(document.getElementById('c-disc-price').value),
      faculty: document.getElementById('c-faculty').value.trim(),
      facultyExperience: document.getElementById('c-experience').value.trim(),
      image: document.getElementById('c-image').value.trim(),
      description: document.getElementById('c-desc').value.trim(),
      features
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

// Modal: Add Subject to Batch
function openAddSubjectModal(courseId) {
  const root = document.getElementById('admin-modals-root');
  root.innerHTML = `
    <div class="admin-modal-backdrop open">
      <div class="admin-modal-box">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Add Subject to Batch</h3>
          <button class="admin-modal-close" id="btn-close-sub">✕</button>
        </div>
        <form id="form-add-subject">
          <div class="admin-modal-body">
            <div class="form-group">
              <label class="form-label">Subject Name</label>
              <input type="text" id="sub-name" class="form-input" placeholder="e.g. Spoken English & Fluency" required />
            </div>
            <div class="form-group">
              <label class="form-label">Subject Icon / Emoji</label>
              <select id="sub-icon" class="form-select">
                <option value="🗣️">🗣️ Spoken English</option>
                <option value="📖">📖 Grammar Rules</option>
                <option value="💡">💡 Vocabulary</option>
                <option value="🎯">🎯 Competitive Exams</option>
                <option value="✍️">✍️ Essay & Letter Writing</option>
                <option value="🧠">🧠 Memory Techniques</option>
                <option value="🏆">🏆 Mock Test Series</option>
              </select>
            </div>
          </div>
          <div class="admin-modal-footer">
            <button type="button" class="admin-btn-secondary" id="btn-cancel-sub">Cancel</button>
            <button type="submit" class="admin-btn-primary">Add Subject</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const close = () => { root.innerHTML = ''; };
  document.getElementById('btn-close-sub').addEventListener('click', close);
  document.getElementById('btn-cancel-sub').addEventListener('click', close);

  document.getElementById('form-add-subject').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('sub-name').value.trim();
    const icon = document.getElementById('sub-icon').value;
    if (name) {
      store.addSubject(courseId, name, icon);
      close();
    }
  });
}

// Modal: Add Chapter to Subject
function openAddChapterModal(courseId, subjectId) {
  const root = document.getElementById('admin-modals-root');
  root.innerHTML = `
    <div class="admin-modal-backdrop open">
      <div class="admin-modal-box">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Add Chapter</h3>
          <button class="admin-modal-close" id="btn-close-ch">✕</button>
        </div>
        <form id="form-add-chapter">
          <div class="admin-modal-body">
            <div class="form-group">
              <label class="form-label">Chapter Title</label>
              <input type="text" id="ch-title" class="form-input" placeholder="e.g. Chapter 03: Tenses & Time Mapping" required />
            </div>
          </div>
          <div class="admin-modal-footer">
            <button type="button" class="admin-btn-secondary" id="btn-cancel-ch">Cancel</button>
            <button type="submit" class="admin-btn-primary">Create Chapter</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const close = () => { root.innerHTML = ''; };
  document.getElementById('btn-close-ch').addEventListener('click', close);
  document.getElementById('btn-cancel-ch').addEventListener('click', close);

  document.getElementById('form-add-chapter').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('ch-title').value.trim();
    if (title) {
      store.addChapter(courseId, subjectId, title);
      close();
    }
  });
}

// Modal: Add Resource (Lecture, PDF, Practice)
function openAddResourceModal(courseId, subjectId, chapterId, resourceType) {
  const root = document.getElementById('admin-modals-root');
  let typeTitle = 'Lecture Video';
  if (resourceType === 'pdfs') typeTitle = 'PDF Note';
  if (resourceType === 'practices') typeTitle = 'Practice Test';

  root.innerHTML = `
    <div class="admin-modal-backdrop open">
      <div class="admin-modal-box">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Add ${typeTitle} to Chapter</h3>
          <button class="admin-modal-close" id="btn-close-res">✕</button>
        </div>
        <form id="form-add-resource">
          <div class="admin-modal-body">
            <div class="form-group">
              <label class="form-label">Item Title</label>
              <input type="text" id="res-title" class="form-input" placeholder="e.g. ${resourceType === 'lectures' ? 'Daily Spoken English Routine Practice' : resourceType === 'pdfs' ? 'Tenses Master Formula Chart' : 'Speed Quiz 01 - Tenses Error Spotting'}" required />
            </div>

            ${resourceType === 'lectures' ? `
              <div class="form-group">
                <label class="form-label">YouTube Video URL or Video ID</label>
                <input type="text" id="res-video-url" class="form-input" placeholder="e.g. https://youtu.be/wdaBwIv7Jso or wdaBwIv7Jso" value="wdaBwIv7Jso" required />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Duration</label>
                  <input type="text" id="res-duration" class="form-input" value="32:45" required />
                </div>
                <div class="form-group" style="display:flex; align-items:center; gap:8px; padding-top:28px;">
                  <input type="checkbox" id="res-is-free" checked />
                  <label for="res-is-free" style="font-size:12px; color:#cbd5e1; cursor:pointer;">Free Preview</label>
                </div>
              </div>
            ` : resourceType === 'pdfs' ? `
              <div class="form-group">
                <label class="form-label">Direct Upload to Supabase Storage Bucket</label>
                <input type="file" id="res-pdf-file" class="form-input" accept=".pdf,application/pdf" style="padding: 6px;" />
                <div id="pdf-upload-status" style="font-size:11px; color:#10b981; margin-top:4px;"></div>
              </div>
              <div class="form-group">
                <label class="form-label">Or Direct Document / Storage URL</label>
                <input type="text" id="res-pdf-url" class="form-input" placeholder="e.g. https://... or auto-filled on upload" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Page Count</label>
                  <input type="text" id="res-pages" class="form-input" value="18 Pages" required />
                </div>
                <div class="form-group">
                  <label class="form-label">File Size</label>
                  <input type="text" id="res-size" class="form-input" value="2.8 MB" required />
                </div>
              </div>
            ` : `
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Question Count</label>
                  <input type="number" id="res-questions" class="form-input" value="20" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Time Limit (Minutes)</label>
                  <input type="number" id="res-time" class="form-input" value="15" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Total Marks</label>
                  <input type="number" id="res-marks" class="form-input" value="40" required />
                </div>
              </div>
            `}
          </div>
          <div class="admin-modal-footer">
            <button type="button" class="admin-btn-secondary" id="btn-cancel-res">Cancel</button>
            <button type="submit" class="admin-btn-primary">Add ${typeTitle}</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const backdrop = document.getElementById('res-modal-backdrop');
  const close = () => { root.innerHTML = ''; };
  document.getElementById('btn-close-res').addEventListener('click', close);
  document.getElementById('btn-cancel-res').addEventListener('click', close);

  const fileInput = document.getElementById('res-pdf-file');
  if (fileInput) {
    fileInput.addEventListener('change', async (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (file) {
        const statusEl = document.getElementById('pdf-upload-status');
        const urlInput = document.getElementById('res-pdf-url');
        const sizeInput = document.getElementById('res-size');
        if (statusEl) {
          statusEl.style.color = '#38bdf8';
          statusEl.textContent = '⏳ Uploading to Supabase Storage bucket...';
        }
        try {
          const publicUrl = await store.uploadFileToStorage(file, 'materials');
          if (urlInput) urlInput.value = publicUrl;
          if (sizeInput) sizeInput.value = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
          if (statusEl) {
            statusEl.style.color = '#10b981';
            statusEl.textContent = '✓ Successfully uploaded to Supabase Storage!';
          }
        } catch (err) {
          if (statusEl) {
            statusEl.style.color = '#ef4444';
            statusEl.textContent = 'Upload failed: ' + (err.message || 'Check connection');
          }
        }
      }
    });
  }

  document.getElementById('form-add-resource').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('res-title').value.trim();
    if (!title) return;

    let resData = { title };
    if (resourceType === 'lectures') {
      const rawUrl = document.getElementById('res-video-url').value.trim();
      resData.videoId = extractYouTubeId(rawUrl) || 'wdaBwIv7Jso';
      resData.duration = document.getElementById('res-duration').value.trim() || '25:00';
      resData.isFree = document.getElementById('res-is-free').checked;
    } else if (resourceType === 'pdfs') {
      resData.pages = document.getElementById('res-pages').value.trim() || '10 Pages';
      resData.size = document.getElementById('res-size').value.trim() || '2.0 MB';
      resData.url = (document.getElementById('res-pdf-url')?.value || '').trim();
    } else if (resourceType === 'practices') {
      resData.questionsCount = parseInt(document.getElementById('res-questions').value) || 20;
      resData.timeMinutes = parseInt(document.getElementById('res-time').value) || 15;
      resData.marks = parseInt(document.getElementById('res-marks').value) || 40;
    }

    store.addResource(courseId, subjectId, chapterId, resourceType, resData);
    close();
  });
}

// 8. Register Offline Student Admission Modal
function openAddStudentAdmissionModal() {
  const root = document.getElementById('admin-modals-root');
  if (!root) return;

  root.innerHTML = `
    <div class="admin-modal-backdrop open">
      <div class="admin-modal-box" style="max-width:520px;">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Register Offline / Cash Student Admission</h3>
          <button class="admin-modal-close" id="btn-close-adm">✕</button>
        </div>
        <form id="form-add-student-admission">
          <div class="admin-modal-body">
            <div class="form-group">
              <label class="form-label">Student Full Name</label>
              <input type="text" id="adm-name" class="form-input" placeholder="e.g. Ramesh Kumar" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" id="adm-phone" class="form-input" placeholder="+91 98765 43210" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="adm-email" class="form-input" placeholder="student@gmail.com" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Enroll In Batch / Course</label>
              <select id="adm-course" class="form-select" required>
                ${store.courses.map(c => `
                  <option value="${c.id}" data-title="${c.title}" data-price="${c.discountPrice || c.originalPrice}">
                    ${c.title} (₹${c.discountPrice || c.originalPrice})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Fee Paid / Collected (₹)</label>
              <input type="number" id="adm-amount" class="form-input" value="${store.courses[0] ? (store.courses[0].discountPrice || 999) : 999}" required />
            </div>
          </div>
          <div class="admin-modal-footer">
            <button type="button" class="admin-btn-secondary" id="btn-cancel-adm">Cancel</button>
            <button type="submit" class="admin-btn-primary">Generate Admission & Receipt</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const close = () => { root.innerHTML = ''; };
  document.getElementById('btn-close-adm')?.addEventListener('click', close);
  document.getElementById('btn-cancel-adm')?.addEventListener('click', close);

  // Update amount when course changes
  document.getElementById('adm-course')?.addEventListener('change', (e) => {
    const opt = e.target.selectedOptions[0];
    const price = opt?.getAttribute('data-price');
    if (price) {
      document.getElementById('adm-amount').value = price;
    }
  });

  document.getElementById('form-add-student-admission')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('adm-name').value.trim();
    const phone = document.getElementById('adm-phone').value.trim();
    const email = document.getElementById('adm-email').value.trim();
    const courseSelect = document.getElementById('adm-course');
    const courseId = courseSelect.value;
    const courseTitle = courseSelect.selectedOptions[0]?.getAttribute('data-title') || 'Enrolled Course';
    const amount = Number(document.getElementById('adm-amount').value) || 0;

    if (!name || !email) return;

    const newAdmission = await store.addStudentAdmission({
      name,
      phone,
      email,
      courseId,
      courseTitle,
      amount
    });

    close();
    openStudentReceiptModal(newAdmission.receiptNo);
  });
}

// 9. Official Printable Student Fee Receipt Modal
function openStudentReceiptModal(idOrReceiptNo) {
  const root = document.getElementById('admin-modals-root');
  if (!root) return;

  const s = store.students.find(st => st.id === idOrReceiptNo || st.receiptNo === idOrReceiptNo) || store.students[0];
  if (!s) {
    alert('Student admission record not found.');
    return;
  }

  const settings = store.settings;

  root.innerHTML = `
    <div class="admin-modal-backdrop open">
      <div class="admin-modal-box" style="max-width:540px; background:#ffffff; color:#0f172a; padding:0; overflow:hidden;">
        <div style="background:#1340b5; color:#ffffff; padding:18px 22px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:50%; background:#ffb800; color:#1340b5; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:18px;">🎓</div>
            <div>
              <div style="font-size:16px; font-weight:900; letter-spacing:-0.2px;">${settings.coachingName}</div>
              <div style="font-size:11px; opacity:0.9;">Official Admission & Fee Receipt</div>
            </div>
          </div>
          <button class="admin-modal-close" id="btn-close-receipt-modal" style="color:#ffffff; font-size:18px; border:none; background:none; cursor:pointer;">✕</button>
        </div>

        <div style="padding:22px;">
          <!-- Top Receipt Meta -->
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:14px; margin-bottom:14px; font-size:12px;">
            <div>
              <div style="color:#64748b;">Receipt Number:</div>
              <div style="font-family:monospace; font-weight:800; color:#1340b5; font-size:14px;">${s.receiptNo || 'SSE-REC-AUTO'}</div>
            </div>
            <div style="text-align:right;">
              <div style="color:#64748b;">Date of Admission:</div>
              <div style="font-weight:700; color:#0f172a;">${s.date}</div>
            </div>
          </div>

          <!-- Student & Course Details -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; margin-bottom:16px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:12.5px;">
              <div>
                <span style="color:#64748b;">Student Name:</span>
                <div style="font-weight:800; color:#0f172a;">${s.name}</div>
              </div>
              <div>
                <span style="color:#64748b;">Contact:</span>
                <div style="font-weight:700; color:#0f172a;">${s.phone || 'N/A'}</div>
              </div>
              <div>
                <span style="color:#64748b;">Email:</span>
                <div style="font-weight:600; color:#0f172a; word-break:break-all;">${s.email}</div>
              </div>
              <div>
                <span style="color:#64748b;">Status:</span>
                <div style="font-weight:800; color:#10b981;">✓ ${s.status || 'Verified Admission'}</div>
              </div>
            </div>
          </div>

          <!-- Course & Payment Breakdown -->
          <div style="border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; margin-bottom:16px;">
            <div style="background:#f1f5f9; padding:8px 12px; font-size:12px; font-weight:700; color:#475569; display:flex; justify-content:space-between;">
              <span>Enrolled Batch</span>
              <span>Amount</span>
            </div>
            <div style="padding:12px; display:flex; justify-content:space-between; align-items:center; font-size:13px; border-bottom:1px solid #f1f5f9;">
              <div>
                <strong style="color:#1340b5;">${s.course}</strong>
                <div style="font-size:11px; color:#64748b;">Complete Syllabus + Live Classes + Notes</div>
              </div>
              <strong style="font-size:15px; color:#0f172a;">₹${Number(s.amount).toLocaleString('en-IN')}</strong>
            </div>
            <div style="background:#f8fafc; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; font-size:13px;">
              <span style="font-weight:700; color:#0f172a;">Total Fee Paid:</span>
              <span style="font-size:16px; font-weight:900; color:#10b981;">₹${Number(s.amount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <!-- Institute Footer Stamp -->
          <div style="display:flex; justify-content:space-between; align-items:flex-end; font-size:11px; color:#64748b; border-top:1px dashed #cbd5e1; padding-top:12px;">
            <div>
              <strong>${settings.coachingName}</strong><br/>
              ${settings.address}<br/>
              Lead Faculty: <strong>Krishna Kumar</strong>
            </div>
            <div style="text-align:right;">
              <div style="display:inline-block; border:1px solid #10b981; color:#10b981; font-weight:800; padding:2px 8px; border-radius:4px; margin-bottom:4px;">
                SEAL OF ADMISSION
              </div>
              <div>Digitally Generated</div>
            </div>
          </div>
        </div>

        <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:12px 20px; display:flex; justify-content:space-between; align-items:center;">
          <button type="button" class="admin-btn-secondary" id="btn-close-receipt-bottom" style="background:#e2e8f0; color:#0f172a; border:none; cursor:pointer;">Close</button>
          <button type="button" class="admin-btn-primary" id="btn-print-student-receipt" style="background:#1340b5; cursor:pointer;">
            <span>🖨️</span>
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const close = () => { root.innerHTML = ''; };
  document.getElementById('btn-close-receipt-modal')?.addEventListener('click', close);
  document.getElementById('btn-close-receipt-bottom')?.addEventListener('click', close);
  document.getElementById('btn-print-student-receipt')?.addEventListener('click', () => {
    window.print();
  });
}
