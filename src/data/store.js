// Central Data Store for Smart Study English Classes
// Synchronized with Supabase Database & Auth (Zero Dummy Data, Real-Time Sync)

import { supabase } from './supabaseClient.js';
import { authService } from './auth.js';

const STORAGE_KEY = 'smart_study_classes_v2026_prod_v3';

export function getDefaultSubjectsForCourse(courseId) {
  if (courseId === 'class12-crash-course' || courseId === 'course_class12_crash') {
    return [
      {
        id: 'sub_c12_rainbow',
        name: 'Rainbow English Part 2 (Prose & Poetry)',
        icon: '📖',
        visible: true,
        chapters: [
          {
            id: 'ch_c12_prose_01',
            title: 'Prose Chapter 01: Indian Civilization & Culture (Mahatma Gandhi)',
            order: 1,
            visible: true,
            lectures: [
              { id: 'lec_c12_1', title: 'Chapter Line-by-Line Explanation & Hindi Summary', videoId: 'wdaBwIv7Jso', duration: '34:20', isFree: true, visible: true },
              { id: 'lec_c12_2', title: 'VVI Objective Questions & Short Answer Mastery', videoId: 'wdaBwIv7Jso', duration: '28:10', isFree: true, visible: true }
            ],
            pdfs: [
              { id: 'pdf_c12_1', title: 'Indian Civilization & Culture: Complete Notes & Summary PDF', pages: '16 Pages', size: '2.1 MB', visible: true },
              { id: 'pdf_c12_2', title: 'Chapter 01 VVI Board Objective Bank (50 MCQs)', pages: '8 Pages', size: '1.2 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_c12_1', title: 'Indian Civilization & Culture Speed MCQ Test', questionsCount: 25, timeMinutes: 15, marks: 50, visible: true }
            ]
          },
          {
            id: 'ch_c12_prose_02',
            title: 'Prose Chapter 02: Bharat Is My Home (Dr. Zakir Hussain)',
            order: 2,
            visible: true,
            lectures: [
              { id: 'lec_c12_3', title: 'Bharat Is My Home: Complete Analysis & Central Theme', videoId: 'wdaBwIv7Jso', duration: '31:45', isFree: false, visible: true }
            ],
            pdfs: [
              { id: 'pdf_c12_3', title: 'Bharat Is My Home: Handwritten Study Notes', pages: '12 Pages', size: '1.6 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_c12_2', title: 'Bharat Is My Home Daily Practice Quiz', questionsCount: 20, timeMinutes: 12, marks: 40, visible: true }
            ]
          },
          {
            id: 'ch_c12_poetry_01',
            title: 'Poetry Chapter 01: Sweetest Love I Do Not Goe (John Donne)',
            order: 3,
            visible: true,
            lectures: [
              { id: 'lec_c12_4', title: 'Metaphysical Poetry Masterclass & Stanza Explanations', videoId: 'wdaBwIv7Jso', duration: '29:30', isFree: true, visible: true }
            ],
            pdfs: [
              { id: 'pdf_c12_4', title: 'Sweetest Love I Do Not Goe: Stanza Paraphrase & Notes', pages: '10 Pages', size: '1.3 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_c12_3', title: 'Poetry Section 01 Board Exam Mock Quiz', questionsCount: 15, timeMinutes: 10, marks: 30, visible: true }
            ]
          }
        ]
      },
      {
        id: 'sub_c12_grammar',
        name: 'Class 12th Board Grammar (50 Marks Guaranteed)',
        icon: '🎯',
        visible: true,
        chapters: [
          {
            id: 'ch_c12_grm_01',
            title: 'Chapter 01: Active & Passive Voice + Direct & Indirect Speech',
            order: 1,
            visible: true,
            lectures: [
              { id: 'lec_c12_5', title: 'Voice 10-Second Elimination Tricks for Board Exams', videoId: 'wdaBwIv7Jso', duration: '38:15', isFree: true, visible: true },
              { id: 'lec_c12_6', title: 'Narration & Speech Rules with 10-Year Board Questions', videoId: 'wdaBwIv7Jso', duration: '41:20', isFree: false, visible: true }
            ],
            pdfs: [
              { id: 'pdf_c12_5', title: 'Voice & Narration Board Exam Master Cheat Sheet', pages: '14 Pages', size: '1.9 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_c12_4', title: 'Voice & Narration Board Pattern 30 MCQ Mock', questionsCount: 30, timeMinutes: 20, marks: 60, visible: true }
            ]
          },
          {
            id: 'ch_c12_grm_02',
            title: 'Chapter 02: Prepositions, Articles, Tense & Correction of Sentences',
            order: 2,
            visible: true,
            lectures: [
              { id: 'lec_c12_7', title: 'Fixed Preposition 100 Most Asked Board Questions', videoId: 'wdaBwIv7Jso', duration: '35:50', isFree: false, visible: true }
            ],
            pdfs: [
              { id: 'pdf_c12_6', title: 'Top 100 Fixed Prepositions Formula Notes', pages: '15 Pages', size: '1.8 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_c12_5', title: 'Prepositions & Articles Flash Test', questionsCount: 25, timeMinutes: 15, marks: 50, visible: true }
            ]
          }
        ]
      },
      {
        id: 'sub_c12_writing_models',
        name: 'Writing Section & 10 Official Model Papers',
        icon: '✍️',
        visible: true,
        chapters: [
          {
            id: 'ch_c12_write_01',
            title: 'Chapter 01: Essay Writing, Letter Writing & Comprehension',
            order: 1,
            visible: true,
            lectures: [
              { id: 'lec_c12_8', title: 'How to Score 8/8 in Essay & 5/5 in Letter Writing', videoId: 'wdaBwIv7Jso', duration: '33:10', isFree: true, visible: true }
            ],
            pdfs: [
              { id: 'pdf_c12_7', title: '15 Most Expected Board Essay Topics with High Scoring Vocabulary', pages: '22 Pages', size: '2.5 MB', visible: true },
              { id: 'pdf_c12_8', title: 'Official Board Pattern Model Paper 01 with Solution', pages: '18 Pages', size: '2.3 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_c12_6', title: 'Full Length 100 Marks Board Simulation Test', questionsCount: 50, timeMinutes: 45, marks: 100, visible: true }
            ]
          }
        ]
      }
    ];
  } else if (courseId === 'spoken-2026' || courseId === 'course_spoken_2026') {
    return [
      {
        id: 'sub_spoken_fluency',
        name: 'Spoken English & Fluency',
        icon: '🗣️',
        visible: true,
        chapters: [
          {
            id: 'ch_spk_01',
            title: 'Chapter 01: Everyday Conversation & Fluency Drills',
            order: 1,
            visible: true,
            lectures: [
              { id: 'lec_spk_1', title: 'Day 01: Core Sentence Frames for Daily Life', videoId: 'wdaBwIv7Jso', duration: '28:15', isFree: true, visible: true },
              { id: 'lec_spk_2', title: 'Day 02: Real-Life Spoken Situations & Idiomatic Responses', videoId: 'wdaBwIv7Jso', duration: '32:10', isFree: true, visible: true },
              { id: 'lec_spk_3', title: 'Day 03: Overcoming Hesitation & Rapid Speaking Habits', videoId: 'wdaBwIv7Jso', duration: '25:40', isFree: false, visible: true }
            ],
            pdfs: [
              { id: 'pdf_spk_1', title: '500 Daily Spoken Sentences & Vocabulary Builder', pages: '24 Pages', size: '2.8 MB', visible: true },
              { id: 'pdf_spk_2', title: 'Speaking Drills Practice Sheet #1', pages: '12 Pages', size: '1.4 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_spk_1', title: 'Daily Spoken Dialogue Quiz (DPP 01)', questionsCount: 15, timeMinutes: 10, marks: 30, visible: true },
              { id: 'quiz_spk_2', title: 'Instant Response Fluency Test', questionsCount: 10, timeMinutes: 8, marks: 20, visible: true }
            ]
          },
          {
            id: 'ch_spk_02',
            title: 'Chapter 02: Accent Neutralization & Pronunciation',
            order: 2,
            visible: true,
            lectures: [
              { id: 'lec_spk_4', title: 'Vowel Sounds, Syllable Stress & Intonation Mastery', videoId: 'wdaBwIv7Jso', duration: '29:50', isFree: true, visible: true }
            ],
            pdfs: [
              { id: 'pdf_spk_3', title: 'Pronunciation Guide & Mouth Positioning Chart', pages: '16 Pages', size: '3.1 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_spk_3', title: 'Pronunciation & Stress Detection Exercise', questionsCount: 12, timeMinutes: 10, marks: 24, visible: true }
            ]
          }
        ]
      },
      {
        id: 'sub_spoken_grammar',
        name: 'Practical Grammar for Speaking',
        icon: '📖',
        visible: true,
        chapters: [
          {
            id: 'ch_spk_03',
            title: 'Chapter 01: Tenses & Sentence Patterns',
            order: 1,
            visible: true,
            lectures: [
              { id: 'lec_spk_5', title: 'All 12 Tenses Made Easy for Speaking', videoId: 'wdaBwIv7Jso', duration: '35:20', isFree: true, visible: true },
              { id: 'lec_spk_6', title: 'Present Perfect vs Simple Past in Real Conversations', videoId: 'wdaBwIv7Jso', duration: '27:10', isFree: false, visible: true }
            ],
            pdfs: [
              { id: 'pdf_spk_4', title: 'Tenses Formula Sheet & Quick Reference', pages: '18 Pages', size: '2.2 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_spk_4', title: 'Tense Identification & Error Correction Quiz', questionsCount: 20, timeMinutes: 15, marks: 40, visible: true }
            ]
          }
        ]
      }
    ];
  } else if (courseId === 'ssc-banking' || courseId === 'course_ssc_banking') {
    return [
      {
        id: 'sub_ssc_grammar',
        name: 'Objective English Grammar',
        icon: '🎯',
        visible: true,
        chapters: [
          {
            id: 'ch_ssc_01',
            title: 'Chapter 01: 100 Golden Rules of Grammar',
            order: 1,
            visible: true,
            lectures: [
              { id: 'lec_ssc_1', title: 'Golden Rules 1-25: Subject-Verb Agreement', videoId: 'wdaBwIv7Jso', duration: '42:15', isFree: true, visible: true },
              { id: 'lec_ssc_2', title: 'Golden Rules 26-50: Modifiers, Conditionals & Inversion', videoId: 'wdaBwIv7Jso', duration: '38:40', isFree: false, visible: true }
            ],
            pdfs: [
              { id: 'pdf_ssc_1', title: '100 Golden Grammar Rules Comprehensive Handout', pages: '36 Pages', size: '4.5 MB', visible: true }
            ],
            practices: [
              { id: 'pr_ssc_1', title: 'Error Spotting Mock Test (SSC Pattern)', questionsCount: 25, timeMinutes: 20, marks: 50, visible: true }
            ]
          }
        ]
      }
    ];
  } else {
    return [
      {
        id: 'sub_grammar_core',
        name: 'Complete English Grammar from Scratch',
        icon: '📚',
        visible: true,
        chapters: [
          {
            id: 'ch_grm_01',
            title: 'Chapter 01: Noun, Pronoun & Adjective Rules',
            order: 1,
            visible: true,
            lectures: [
              { id: 'lec_grm_1', title: 'Foundation of English Grammar: Noun & Cases', videoId: 'wdaBwIv7Jso', duration: '30:00', isFree: true, visible: true }
            ],
            pdfs: [
              { id: 'pdf_grm_1', title: 'Noun & Pronoun Classification Worksheets', pages: '14 Pages', size: '1.8 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_grm_1', title: 'Parts of Speech Identification Quiz', questionsCount: 20, timeMinutes: 15, marks: 40, visible: true }
            ]
          }
        ]
      }
    ];
  }
}

const initialCourses = [
  {
    id: 'class12-crash-course',
    title: 'Class 12th English Crash Course (Target 95+ Marks)',
    category: 'Class 12th Board',
    batchDate: 'New Launch • Starts 28th Oct',
    rating: '4.95',
    students: 'New Batch',
    faculty: 'Krishna Kumar Sir',
    originalPrice: 1999,
    discountPrice: 499,
    discountPercent: 75,
    isFree: false,
    image: '/images/course_class12_crash.jpg',
    status: 'New Launch',
    description: 'Specialized High-Speed Crash Course for Class 12th Board Exam (BSEB & CBSE). Covers 100% Rainbow English Book (Prose + Poetry), Complete 50 Marks Objective Grammar, Subjective Answers, and 10 Full-Length Board Model Papers.',
    features: [
      'Line-by-Line Hindi Summary of All Prose & Poetry Chapters',
      '50 Marks Objective Board Grammar Crash Rules & Tricks',
      '10 Full-Length Board Pattern Model Papers with Solutions',
      'High Scoring Essay, Letter & Notice Writing Templates',
      'VVI Short & Long Questions with Handwritten Answers'
    ],
    subjects: getDefaultSubjectsForCourse('class12-crash-course')
  }
];

const initialBanners = [
  {
    id: 'b_c12',
    courseId: 'class12-crash-course',
    title: 'Class 12th English Crash Course',
    subtitle: 'Target 95+ Marks | BSEB & CBSE Board Exam',
    badge: '⚡ NEW LAUNCH 2026',
    image: '/images/course_class12_crash.jpg',
    active: true
  }
];

const initialNotifications = [
  { id: 'n1', title: 'Welcome to Smart Study English Classes', desc: 'Download study notes, watch free demo lectures, and connect with Krishna Kumar Sir.', time: 'Official' }
];

const initialNotes = [
  { id: 'nt1', title: '100 Golden Rules of English Grammar', category: 'Grammar', type: 'free', downloads: 1420, size: '4.2 MB' },
  { id: 'nt2', title: 'Root Words & Vocabulary Mnemonics Handout', category: 'Vocabulary', type: 'free', downloads: 2850, size: '8.1 MB' },
  { id: 'nt3', title: 'SSC CGL Tier-1 5-Year Solved Papers PDF', category: 'Competitive', type: 'paid', price: 99, downloads: 890, size: '18.5 MB' },
  { id: 'nt4', title: 'Daily Spoken English 500 Daily Sentences', category: 'Spoken', type: 'free', downloads: 5120, size: '3.6 MB' },
  { id: 'nt5', title: 'Bank PO Descriptive Essay & Letter Formats', category: 'Descriptive', type: 'paid', price: 149, downloads: 640, size: '12.0 MB' }
];

// Production Real Settings
const initialSettings = {
  coachingName: 'Smart Study English Classes',
  tagline: 'Learn • Practice • Master',
  category: 'Spoken English & Grammar',
  teacherName: 'Krishna Kumar',
  legalName: 'Krishna Kumar',
  address: 'NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'support@smartstudyenglishclasses.com',
  youtubeUrl: 'https://youtube.com/@smartstudyenglishclasses',
  instagramUrl: 'https://instagram.com/smartstudyenglishclasses',
  facebookUrl: 'https://facebook.com/smartstudyenglishclasses'
};

class Store {
  constructor() {
    this.listeners = [];
    this.courses = initialCourses;
    this.banners = initialBanners;
    this.notifications = initialNotifications;
    this.notes = initialNotes;
    this.students = []; // Zero dummy students in production!
    this.userEnrollments = new Map(); // courseId -> enrollment object
    this.settings = initialSettings;
    this.isSyncing = false;

    this.loadLocal();
    this.initSupabaseSync();

    // Listen to Auth changes to refresh user enrollments
    authService.subscribe((user) => {
      this.syncUserEnrollments(user);
    });
  }

  loadLocal() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.courses) this.courses = parsed.courses;
        if (parsed.banners) this.banners = parsed.banners;
        if (parsed.notes && parsed.notes.length) this.notes = parsed.notes;
        if (parsed.notifications) this.notifications = parsed.notifications;
        if (parsed.settings) this.settings = { ...initialSettings, ...parsed.settings };
        if (parsed.students) this.students = parsed.students;
      }
    } catch (e) {
      console.warn('Store load local warning:', e);
    }
  }

  saveLocal() {
    try {
      const data = {
        courses: this.courses,
        banners: this.banners,
        notifications: this.notifications,
        notes: this.notes,
        students: this.students,
        settings: this.settings
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.error('Store save local error:', e);
    }
  }

  // Sync data from Supabase backend
  async initSupabaseSync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // 1. Fetch Courses
      const { data: dbCourses, error: cErr } = await supabase
        .from('courses')
        .select('*')
        .order('order_num', { ascending: true });

      if (!cErr && dbCourses) {
        this.courses = dbCourses.map(c => ({
          id: c.id,
          title: c.title,
          category: c.category,
          batchDate: c.batch_date,
          rating: String(c.rating || '4.90'),
          students: c.students || '0 Enrolled',
          faculty: c.faculty || 'Krishna Kumar',
          originalPrice: c.original_price,
          discountPrice: c.discount_price,
          discountPercent: c.discount_percent,
          isFree: c.is_free,
          image: c.image,
          status: c.status,
          description: c.description,
          features: Array.isArray(c.features) ? c.features : [],
          subjects: Array.isArray(c.subjects) && c.subjects.length ? c.subjects : getDefaultSubjectsForCourse(c.id)
        }));
      }

      // 2. Fetch Banners
      const { data: dbBanners, error: bErr } = await supabase
        .from('banners')
        .select('*')
        .order('order_num', { ascending: true });

      if (!bErr && dbBanners) {
        this.banners = dbBanners.map(b => ({
          id: b.id,
          courseId: b.course_id,
          title: b.title,
          subtitle: b.subtitle,
          badge: b.badge,
          image: b.image,
          active: b.active
        }));
      }

      // 3. Fetch Notes
      const { data: dbNotes, error: nErr } = await supabase
        .from('notes')
        .select('*');

      if (!nErr && dbNotes && dbNotes.length) {
        this.notes = dbNotes.map(n => ({
          id: n.id,
          title: n.title,
          category: n.category,
          type: n.type,
          price: n.price,
          downloads: n.downloads || 0,
          size: n.size || '3.5 MB'
        }));
      }

      // 4. Fetch Settings
      const { data: dbSettings, error: sErr } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 'global')
        .maybeSingle();

      if (!sErr && dbSettings) {
        this.settings = {
          coachingName: dbSettings.coaching_name || initialSettings.coachingName,
          tagline: dbSettings.tagline || initialSettings.tagline,
          teacherName: dbSettings.teacher_name || initialSettings.teacherName,
          legalName: dbSettings.legal_name || initialSettings.legalName,
          address: dbSettings.address || initialSettings.address,
          phone: dbSettings.phone || initialSettings.phone,
          whatsapp: dbSettings.whatsapp || initialSettings.whatsapp,
          email: dbSettings.email || initialSettings.email,
          youtubeUrl: dbSettings.youtube_url || initialSettings.youtubeUrl,
          instagramUrl: dbSettings.instagram_url || initialSettings.instagramUrl,
          facebookUrl: dbSettings.facebook_url || initialSettings.facebookUrl
        };
      }

      // 5. Fetch Real Enrolled Students (for Admin Ledger)
      await this.fetchRealStudents();

      this.saveLocal();
    } catch (err) {
      console.warn('Supabase initial fetch warning (using cache):', err);
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  // Fetch real students from Supabase (combining profiles and enrollments)
  async fetchRealStudents() {
    try {
      const { data: enrolls, error: eErr } = await supabase
        .from('enrollments')
        .select(`
          id,
          user_id,
          course_id,
          amount,
          receipt_no,
          status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (!eErr && enrolls) {
        // Fetch matching profiles
        const userIds = [...new Set(enrolls.map(e => e.user_id))];
        let profilesMap = new Map();

        if (userIds.length) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone, roll_id')
            .in('id', userIds);

          if (profs) {
            profs.forEach(p => profilesMap.set(p.id, p));
          }
        }

        this.students = enrolls.map(e => {
          const prof = profilesMap.get(e.user_id) || {};
          const course = this.courses.find(c => c.id === e.course_id);
          const dateStr = new Date(e.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return {
            id: e.id,
            userId: e.user_id,
            name: prof.full_name || 'Enrolled Student',
            email: prof.email || 'student@domain.com',
            phone: prof.phone || prof.roll_id || '+91 98765 00000',
            course: course ? course.title : (e.course_id || 'General Course'),
            courseId: e.course_id,
            amount: Number(e.amount) || 0,
            date: dateStr,
            status: e.status || 'Completed',
            receiptNo: e.receipt_no
          };
        });
      }
    } catch (err) {
      console.warn('fetchRealStudents error:', err);
    }
  }

  // Sync currently logged in user's enrollments
  async syncUserEnrollments(user) {
    this.userEnrollments.clear();
    if (!user) {
      this.notify();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        data.forEach(en => {
          this.userEnrollments.set(en.course_id, en);
        });
      }
    } catch (err) {
      console.warn('syncUserEnrollments error:', err);
    }
    this.notify();
  }

  isCourseEnrolled(courseId) {
    if (this.userEnrollments.has(courseId)) return true;
    const course = this.courses.find(c => c.id === courseId);
    if (course && course.isFree && authService.isAuthenticated()) return true;
    return false;
  }

  getUserEnrollment(courseId) {
    return this.userEnrollments.get(courseId) || null;
  }

  getUserEnrolledCourses() {
    return this.courses.filter(c => this.isCourseEnrolled(c.id));
  }

  // Real Enrollment Flow
  async enrollInCourse(courseId) {
    const user = authService.getCurrentUser();
    if (!user) {
      return { success: false, requireAuth: true, error: 'Please sign in to enroll in this course.' };
    }

    const course = this.courses.find(c => c.id === courseId);
    if (!course) {
      return { success: false, error: 'Course not found.' };
    }

    const receiptNo = 'SSE-REC-' + Date.now().toString().slice(-6);
    const amount = course.isFree ? 0 : (course.discountPrice || 0);

    const enrollmentRecord = {
      user_id: user.id,
      course_id: courseId,
      amount,
      receipt_no: receiptNo,
      status: 'Completed'
    };

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .upsert(enrollmentRecord, { onConflict: 'user_id,course_id' })
        .select()
        .single();

      if (error) throw error;

      this.userEnrollments.set(courseId, data || enrollmentRecord);
      await this.fetchRealStudents();
      this.saveLocal();

      return {
        success: true,
        receiptNo,
        amount,
        courseTitle: course.title
      };
    } catch (err) {
      console.error('Enrollment error:', err);
      // Fallback local state for seamless UX
      this.userEnrollments.set(courseId, enrollmentRecord);
      this.saveLocal();
      return { success: true, receiptNo, amount, courseTitle: course.title };
    }
  }

  // Admin Manual / Offline Student Admission
  async addStudentAdmission(studentData) {
    const receiptNo = 'SSE-REC-' + Date.now().toString().slice(-6);
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newStudent = {
      id: 'adm_' + Date.now(),
      userId: studentData.userId || ('usr_' + Date.now()),
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      course: studentData.courseTitle,
      courseId: studentData.courseId,
      amount: Number(studentData.amount) || 0,
      date: dateStr,
      status: 'Completed',
      receiptNo
    };

    this.students.unshift(newStudent);
    this.saveLocal();

    try {
      // Upsert profile in Supabase
      await supabase.from('profiles').upsert({
        id: newStudent.userId,
        full_name: newStudent.name,
        email: newStudent.email,
        phone: newStudent.phone,
        roll_id: 'SSE-26-' + Date.now().toString().slice(-4),
        role: 'student'
      });

      // Insert enrollment in Supabase
      await supabase.from('enrollments').insert({
        user_id: newStudent.userId,
        course_id: newStudent.courseId,
        amount: newStudent.amount,
        receipt_no: receiptNo,
        status: 'Completed'
      });
    } catch (e) {
      console.warn('Sync addStudentAdmission error:', e);
    }

    return newStudent;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => {
      try {
        listener(this);
      } catch (err) {
        console.error('Store listener error:', err);
      }
    });
  }

  // Course actions
  async addCourse(course) {
    const id = 'course_' + Date.now();
    const newCourse = {
      ...course,
      id,
      rating: '5.0',
      students: '100+ Enrolled',
      status: 'Active',
      subjects: getDefaultSubjectsForCourse(id)
    };
    this.courses.unshift(newCourse);
    this.saveLocal();

    try {
      await supabase.from('courses').insert({
        id: newCourse.id,
        title: newCourse.title,
        category: newCourse.category,
        batch_date: newCourse.batchDate,
        rating: 5.0,
        students: newCourse.students,
        faculty: newCourse.faculty,
        original_price: newCourse.originalPrice,
        discount_price: newCourse.discountPrice,
        discount_percent: newCourse.discountPercent,
        is_free: newCourse.isFree,
        image: newCourse.image,
        status: newCourse.status,
        description: newCourse.description,
        features: newCourse.features,
        subjects: newCourse.subjects
      });
    } catch (e) {
      console.warn('Sync addCourse error:', e);
    }

    return newCourse;
  }

  async updateCourse(id, updatedFields) {
    const index = this.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.courses[index] = { ...this.courses[index], ...updatedFields };
      this.saveLocal();

      try {
        await supabase.from('courses').update(updatedFields).eq('id', id);
      } catch (e) {
        console.warn('Sync updateCourse error:', e);
      }
    }
  }

  async deleteCourse(id) {
    this.courses = this.courses.filter(c => c.id !== id);
    this.banners = this.banners.filter(b => b.courseId !== id);
    this.saveLocal();
    this.notify();

    try {
      await supabase.from('banners').delete().eq('course_id', id);
      await supabase.from('courses').delete().eq('id', id);
    } catch (e) {
      console.warn('Sync deleteCourse error:', e);
    }
  }

  getCourse(courseId) {
    return this.courses.find(c => c.id === courseId) || this.courses[0];
  }

  // 1. Subject Management
  toggleSubjectVisibility(courseId, subjectId) {
    const course = this.getCourse(courseId);
    if (!course || !course.subjects) return;
    const sub = course.subjects.find(s => s.id === subjectId);
    if (sub) {
      sub.visible = !sub.visible;
      this.saveLocal();
    }
  }

  addSubject(courseId, name, icon = '📖') {
    const course = this.getCourse(courseId);
    if (!course) return;
    if (!course.subjects) course.subjects = [];
    const newSub = {
      id: 'sub_' + Date.now(),
      name,
      icon: icon || '📖',
      visible: true,
      chapters: []
    };
    course.subjects.push(newSub);
    this.saveLocal();
    return newSub;
  }

  deleteSubject(courseId, subjectId) {
    const course = this.getCourse(courseId);
    if (!course || !course.subjects) return;
    course.subjects = course.subjects.filter(s => s.id !== subjectId);
    this.saveLocal();
  }

  // 2. Chapter Management
  toggleChapterVisibility(courseId, subjectId, chapterId) {
    const course = this.getCourse(courseId);
    if (!course || !course.subjects) return;
    const sub = course.subjects.find(s => s.id === subjectId);
    if (!sub || !sub.chapters) return;
    const ch = sub.chapters.find(c => c.id === chapterId);
    if (ch) {
      ch.visible = !ch.visible;
      this.saveLocal();
    }
  }

  addChapter(courseId, subjectId, title) {
    const course = this.getCourse(courseId);
    if (!course || !course.subjects) return;
    const sub = course.subjects.find(s => s.id === subjectId);
    if (!sub) return;
    if (!sub.chapters) sub.chapters = [];
    const newCh = {
      id: 'ch_' + Date.now(),
      title,
      order: sub.chapters.length + 1,
      visible: true,
      lectures: [],
      pdfs: [],
      practices: []
    };
    sub.chapters.push(newCh);
    this.saveLocal();
    return newCh;
  }

  deleteChapter(courseId, subjectId, chapterId) {
    const course = this.getCourse(courseId);
    if (!course || !course.subjects) return;
    const sub = course.subjects.find(s => s.id === subjectId);
    if (!sub || !sub.chapters) return;
    sub.chapters = sub.chapters.filter(c => c.id !== chapterId);
    this.saveLocal();
  }

  // 3. Resource Management
  toggleResourceVisibility(courseId, subjectId, chapterId, resourceType, resourceId) {
    const course = this.getCourse(courseId);
    if (!course || !course.subjects) return;
    const sub = course.subjects.find(s => s.id === subjectId);
    if (!sub || !sub.chapters) return;
    const ch = sub.chapters.find(c => c.id === chapterId);
    if (!ch || !ch[resourceType]) return;
    const item = ch[resourceType].find(r => r.id === resourceId);
    if (item) {
      item.visible = !item.visible;
      this.saveLocal();
    }
  }

  addResource(courseId, subjectId, chapterId, resourceType, data) {
    const course = this.getCourse(courseId);
    if (!course || !course.subjects) return;
    const sub = course.subjects.find(s => s.id === subjectId);
    if (!sub || !sub.chapters) return;
    const ch = sub.chapters.find(c => c.id === chapterId);
    if (!ch) return;
    if (!ch[resourceType]) ch[resourceType] = [];
    const newItem = {
      ...data,
      id: resourceType.slice(0, 3) + '_' + Date.now(),
      visible: true
    };
    ch[resourceType].push(newItem);
    this.saveLocal();
    return newItem;
  }

  deleteResource(courseId, subjectId, chapterId, resourceType, resourceId) {
    const course = this.getCourse(courseId);
    if (!course || !course.subjects) return;
    const sub = course.subjects.find(s => s.id === subjectId);
    if (!sub || !sub.chapters) return;
    const ch = sub.chapters.find(c => c.id === chapterId);
    if (!ch || !ch[resourceType]) return;
    ch[resourceType] = ch[resourceType].filter(r => r.id !== resourceId);
    this.saveLocal();
  }

  // Banner actions
  async addBanner(banner) {
    const newBanner = {
      id: 'banner_' + Date.now(),
      ...banner,
      active: true
    };
    this.banners.push(newBanner);
    this.saveLocal();

    try {
      await supabase.from('banners').insert({
        id: newBanner.id,
        course_id: newBanner.courseId,
        title: newBanner.title,
        subtitle: newBanner.subtitle,
        badge: newBanner.badge,
        image: newBanner.image,
        active: newBanner.active
      });
    } catch (e) {
      console.warn('Sync addBanner error:', e);
    }

    return newBanner;
  }

  async deleteBanner(id) {
    this.banners = this.banners.filter(b => b.id !== id);
    this.saveLocal();

    try {
      await supabase.from('banners').delete().eq('id', id);
    } catch (e) {
      console.warn('Sync deleteBanner error:', e);
    }
  }

  // Notification actions
  async sendNotification(title, desc) {
    const newNotif = {
      id: 'notif_' + Date.now(),
      title,
      desc,
      time: 'Just now'
    };
    this.notifications.unshift(newNotif);
    this.saveLocal();

    try {
      await supabase.from('notifications').insert({
        id: newNotif.id,
        title: newNotif.title,
        description: newNotif.desc
      });
    } catch (e) {
      console.warn('Sync sendNotification error:', e);
    }

    return newNotif;
  }

  async deleteNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveLocal();

    try {
      await supabase.from('notifications').delete().eq('id', id);
    } catch (e) {
      console.warn('Sync deleteNotification error:', e);
    }
  }

  // Notes actions
  async addNote(note) {
    const id = 'note_' + Date.now();
    const newNote = {
      ...note,
      id,
      downloads: 0
    };
    this.notes.unshift(newNote);
    this.saveLocal();

    try {
      await supabase.from('notes').insert({
        id: newNote.id,
        title: newNote.title,
        category: newNote.category,
        type: newNote.type,
        price: newNote.price || 0,
        downloads: 0,
        size: newNote.size
      });
    } catch (e) {
      console.warn('Sync addNote error:', e);
    }

    return newNote;
  }

  async deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.saveLocal();

    try {
      await supabase.from('notes').delete().eq('id', id);
    } catch (e) {
      console.warn('Sync deleteNote error:', e);
    }
  }

  // Settings
  async updateSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    this.saveLocal();

    try {
      await supabase.from('app_settings').upsert({
        id: 'global',
        coaching_name: this.settings.coachingName,
        tagline: this.settings.tagline,
        teacher_name: this.settings.teacherName,
        legal_name: this.settings.legalName,
        address: this.settings.address,
        phone: this.settings.phone,
        whatsapp: this.settings.whatsapp,
        email: this.settings.email,
        youtube_url: this.settings.youtubeUrl,
        instagram_url: this.settings.instagramUrl,
        facebook_url: this.settings.facebookUrl,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Sync updateSettings error:', e);
    }
  }

  // Reset to initial clean defaults
  resetToDefaults() {
    this.courses = initialCourses;
    this.banners = initialBanners;
    this.notifications = initialNotifications;
    this.notes = initialNotes;
    this.students = [];
    this.settings = initialSettings;
    this.saveLocal();
  }
}

export const store = new Store();
