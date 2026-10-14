// Central Data Store for Smart Study English Classes (Synchronized between Admin Panel & Mobile App)

const STORAGE_KEY = 'smart_study_classes_v2026';

export function getDefaultSubjectsForCourse(courseId) {
  if (courseId === 'spoken-2026' || courseId === 'course_spoken_2026') {
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
      },
      {
        id: 'sub_spoken_vocab',
        name: 'Vocabulary & Phrasal Verbs',
        icon: '💡',
        visible: true,
        chapters: [
          {
            id: 'ch_spk_04',
            title: 'Chapter 01: 500 High-Frequency Spoken Idioms',
            order: 1,
            visible: true,
            lectures: [
              { id: 'lec_spk_7', title: 'Top 50 Phrasal Verbs Used in Daily Office & Social English', videoId: 'wdaBwIv7Jso', duration: '26:45', isFree: true, visible: true }
            ],
            pdfs: [
              { id: 'pdf_spk_5', title: '50 Phrasal Verbs Flashcard Notes', pages: '14 Pages', size: '1.9 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_spk_5', title: 'Idioms & Phrasal Verbs Speed Test', questionsCount: 15, timeMinutes: 12, marks: 30, visible: true }
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
              { id: 'lec_ssc_1', title: 'Golden Rules 1-25: Subject-Verb Agreement & Inversion', videoId: 'wdaBwIv7Jso', duration: '42:15', isFree: true, visible: true },
              { id: 'lec_ssc_2', title: 'Golden Rules 26-50: Pronoun & Modifier Placement Errors', videoId: 'wdaBwIv7Jso', duration: '38:50', isFree: false, visible: true }
            ],
            pdfs: [
              { id: 'pdf_ssc_1', title: '100 Golden Grammar Rules Comprehensive Handout', pages: '36 Pages', size: '4.5 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_ssc_1', title: 'Error Spotting Mock Test (SSC CGL Tier-1 Pattern)', questionsCount: 25, timeMinutes: 20, marks: 50, visible: true }
            ]
          },
          {
            id: 'ch_ssc_02',
            title: 'Chapter 02: Active & Passive Voice + Narration',
            order: 2,
            visible: true,
            lectures: [
              { id: 'lec_ssc_3', title: 'Voice Transformation Formulas & PYQ Analysis', videoId: 'wdaBwIv7Jso', duration: '34:20', isFree: true, visible: true }
            ],
            pdfs: [
              { id: 'pdf_ssc_2', title: 'Direct-Indirect Speech Rules Sheet', pages: '20 Pages', size: '2.5 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_ssc_2', title: 'Voice & Narration Speed Practice (DPP 02)', questionsCount: 20, timeMinutes: 15, marks: 40, visible: true }
            ]
          }
        ]
      },
      {
        id: 'sub_ssc_vocab',
        name: 'Mnemonic Vocabulary & Root Words',
        icon: '🧠',
        visible: true,
        chapters: [
          {
            id: 'ch_ssc_03',
            title: 'Chapter 01: Root Words & Repeated PYQs',
            order: 1,
            visible: true,
            lectures: [
              { id: 'lec_ssc_4', title: 'Etymology & 300 Root Words with Memory Mnemonics', videoId: 'wdaBwIv7Jso', duration: '31:40', isFree: true, visible: true }
            ],
            pdfs: [
              { id: 'pdf_ssc_3', title: 'SSC 10-Year Repeated Synonyms & Antonyms Master List', pages: '48 Pages', size: '5.2 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_ssc_3', title: 'Vocabulary Booster Quiz (30 Questions)', questionsCount: 30, timeMinutes: 15, marks: 60, visible: true }
            ]
          }
        ]
      },
      {
        id: 'sub_ssc_cloze',
        name: 'Reading Comprehension & Cloze Test',
        icon: '📰',
        visible: true,
        chapters: [
          {
            id: 'ch_ssc_04',
            title: 'Chapter 01: Cloze Test Elimination Tricks',
            order: 1,
            visible: true,
            lectures: [
              { id: 'lec_ssc_5', title: 'How to Score 10/10 in Cloze Test & Para Jumbles', videoId: 'wdaBwIv7Jso', duration: '33:15', isFree: true, visible: true }
            ],
            pdfs: [
              { id: 'pdf_ssc_4', title: '20 Standard Cloze Tests with Detailed Explanations', pages: '28 Pages', size: '3.4 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_ssc_4', title: 'Cloze Test Speed Test (Bank PO & SSC Pattern)', questionsCount: 15, timeMinutes: 12, marks: 30, visible: true }
            ]
          }
        ]
      }
    ];
  } else {
    // grammar-mastery or default
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
      },
      {
        id: 'sub_writing_core',
        name: 'Descriptive Writing & Letter Drafting',
        icon: '✍️',
        visible: true,
        chapters: [
          {
            id: 'ch_grm_02',
            title: 'Chapter 01: Formal Letter & Essay Writing',
            order: 1,
            visible: true,
            lectures: [
              { id: 'lec_grm_2', title: 'Step-by-Step Formal Letter & Editorial Article Writing', videoId: 'wdaBwIv7Jso', duration: '36:10', isFree: true, visible: true }
            ],
            pdfs: [
              { id: 'pdf_grm_2', title: 'Top 25 Model Essays & Formal Letter Formats', pages: '32 Pages', size: '3.9 MB', visible: true }
            ],
            practices: [
              { id: 'quiz_grm_2', title: 'Descriptive Structure & Grammar Check Quiz', questionsCount: 10, timeMinutes: 15, marks: 25, visible: true }
            ]
          }
        ]
      }
    ];
  }
}

const initialCourses = [
  {
    id: 'spoken-2026',
    title: 'Spoken English Mastery Batch 2026',
    category: 'Spoken English',
    batchDate: 'Starts 25th Oct',
    rating: '4.9',
    students: '8,400+',
    faculty: 'Krishna Kumar & Expert Panel',
    originalPrice: 2999,
    discountPrice: 0,
    discountPercent: 100,
    isFree: true,
    enrolled: true,
    image: '/images/banner1.jpg',
    status: 'Active',
    description: 'Master effortless spoken English with daily 1-on-1 speaking practice, pronunciation & accent training, interview preparation, and corporate communication skills.',
    features: [
      'Daily 1-on-1 Practice Speaking Rooms',
      'Neutral Accent & Pronunciation Hacks',
      'Overcome Hesitation & Public Speaking Fear',
      'Downloadable PDF Workbooks & Sentence Frames',
      'Certificate of Fluency on Completion'
    ],
    subjects: getDefaultSubjectsForCourse('spoken-2026')
  },
  {
    id: 'ssc-banking',
    title: 'SSC & Banking English Cracker Batch',
    category: 'Govt Exams',
    batchDate: 'Starts 20th Oct',
    rating: '4.95',
    students: '12,200+',
    faculty: 'Krishna Kumar (Lead Instructor)',
    originalPrice: 3499,
    discountPrice: 0,
    discountPercent: 100,
    isFree: true,
    enrolled: true,
    image: '/images/course_ssc.jpg',
    status: 'Active',
    description: 'All-in-one preparation for SSC CGL, CHSL, CPO, MTS, and Bank PO/Clerk examinations with 100% target score strategy and mnemonic vocabulary.',
    features: [
      '3,500+ Previous Year Questions (PYQs) Solved',
      'Speed Reading & Comprehension Tricks',
      'Rules of Grammar with 100 Golden Rules',
      '50 Full-Length Exam Standard Mock Tests',
      'High-Yield Root Words & Idiom Mnemonics'
    ],
    subjects: getDefaultSubjectsForCourse('ssc-banking')
  },
  {
    id: 'grammar-mastery',
    title: 'Complete English Grammar & Essay Writing',
    category: 'Grammar & Writing',
    batchDate: 'Self Paced + Live Doubt',
    rating: '4.88',
    students: '6,150+',
    faculty: 'Krishna Kumar & Team',
    originalPrice: 1999,
    discountPrice: 0,
    discountPercent: 100,
    isFree: true,
    enrolled: true,
    image: '/images/course_grammar.jpg',
    status: 'Active',
    description: 'From Zero to Hero grammar rules, tenses, narration, active-passive voice, formal letter drafting, and descriptive essays for school, college, and competitive exams.',
    features: [
      'All 8 Parts of Speech Simplified with Examples',
      'Tenses & Subject-Verb Agreement Secrets',
      'Descriptive Essay, Letter, and Notice Formats',
      'Printable Chapter Summary Flashcards',
      'Dedicated Doubt Support via Student Community'
    ],
    subjects: getDefaultSubjectsForCourse('grammar-mastery')
  }
];

const initialBanners = [
  {
    id: 'b1',
    courseId: 'spoken-2026',
    title: 'Spoken English & Grammar 2026',
    subtitle: 'New Foundation Batch Launched • 50% Off',
    badge: '🔥 NEW BATCH',
    image: '/images/banner1.jpg',
    active: true
  },
  {
    id: 'b2',
    courseId: 'ssc-banking',
    title: 'SSC & Banking Cracker Batch 2026',
    subtitle: 'Target 100% Score in Tier 1 & 2',
    badge: '⭐ TOP RATED',
    image: '/images/course_ssc.jpg',
    active: true
  },
  {
    id: 'b3',
    courseId: 'grammar-mastery',
    title: 'Grammar & Essay Writing Masterclass',
    subtitle: 'Zero to Hero Foundation',
    badge: '🎯 SPECIAL BATCH',
    image: '/images/course_grammar.jpg',
    active: true
  }
];

const initialNotifications = [
  { id: 'n1', title: '🔴 Live Grammar Doubt Session', time: '10 Mins Ago', desc: 'Krishna Kumar is live discussing 100 Golden Rules of English.' },
  { id: 'n2', title: '📑 New PDF Notes Uploaded', time: '1 Hour Ago', desc: 'SSC CGL 2026 Tier-1 Vocabulary Booster PDF is now available in Free Notes.' },
  { id: 'n3', title: '🎉 50% Off Early Bird Discount', time: 'Yesterday', desc: 'Use code SMART50 to get an additional ₹500 off on Spoken English Batch.' }
];

const initialNotes = [
  { id: 'nt1', title: '100 Golden Rules of English Grammar', category: 'Grammar', type: 'free', downloads: 1420, size: '4.2 MB' },
  { id: 'nt2', title: 'Root Words & Vocabulary Mnemonics Handout', category: 'Vocabulary', type: 'free', downloads: 2850, size: '8.1 MB' },
  { id: 'nt3', title: 'SSC CGL Tier-1 5-Year Solved Papers PDF', category: 'Competitive', type: 'paid', price: 99, downloads: 890, size: '18.5 MB' },
  { id: 'nt4', title: 'Daily Spoken English 500 Daily Sentences', category: 'Spoken', type: 'free', downloads: 5120, size: '3.6 MB' },
  { id: 'nt5', title: 'Bank PO Descriptive Essay & Letter Formats', category: 'Descriptive', type: 'paid', price: 149, downloads: 640, size: '12.0 MB' }
];

const initialStudents = [
  { id: 'st1', name: 'Rahul Sharma', email: 'rahul.s@gmail.com', phone: '+91 98123 45678', course: 'Spoken English Mastery Batch 2026', amount: 999, date: 'Today, 08:30 AM', status: 'Completed' },
  { id: 'st2', name: 'Pooja Verma', email: 'pooja.v@outlook.com', phone: '+91 98234 56789', course: 'SSC & Banking English Cracker Batch', amount: 1299, date: 'Today, 07:15 AM', status: 'Completed' },
  { id: 'st3', name: 'Aman Deep', email: 'aman.d@yahoo.com', phone: '+91 98345 67890', course: 'Complete English Grammar & Essay', amount: 799, date: 'Yesterday', status: 'Completed' },
  { id: 'st4', name: 'Sneha Patel', email: 'sneha.p@gmail.com', phone: '+91 98456 78901', course: 'Spoken English Mastery Batch 2026', amount: 999, date: 'Yesterday', status: 'Completed' },
  { id: 'st5', name: 'Vikas Kumar', email: 'vikas.k@gmail.com', phone: '+91 98567 89012', course: 'SSC & Banking English Cracker Batch', amount: 1299, date: '12 Oct 2026', status: 'Completed' }
];

const initialLectures = [
  {
    id: 'lec_1',
    courseId: 'spoken-2026',
    title: 'Parts of Speech: English Grammar Foundation & Rules',
    youtubeUrl: 'https://youtu.be/wdaBwIv7Jso?si=W-8-boaeRP1YSLJr',
    videoId: 'wdaBwIv7Jso',
    duration: 'Auto-sync (14:30)',
    isLive: false,
    order: 1
  },
  {
    id: 'lec_2',
    courseId: 'spoken-2026',
    title: 'Lecture 02: Daily Conversation Sentences & Accent Secrets',
    youtubeUrl: 'https://youtu.be/wdaBwIv7Jso?si=W-8-boaeRP1YSLJr',
    videoId: 'wdaBwIv7Jso',
    duration: 'Auto-sync (14:30)',
    isLive: false,
    order: 2
  },
  {
    id: 'lec_3',
    courseId: 'ssc-banking',
    title: 'Live Class: 100 Golden Rules of Grammar for SSC CGL',
    youtubeUrl: 'https://youtu.be/wdaBwIv7Jso?si=W-8-boaeRP1YSLJr',
    videoId: 'wdaBwIv7Jso',
    duration: 'Auto-sync (14:30)',
    isLive: true,
    order: 1
  }
];

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
    this.load();
  }

  load() {
    try {
      ['brilliant_english_store_v1', 'smart_study_store_v1', 'chanakya_store_v1'].forEach(k => {
        try { localStorage.removeItem(k); } catch (_) {}
      });

      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.courses = parsed.courses || initialCourses;
        this.banners = parsed.banners || initialBanners;
        this.notifications = parsed.notifications || initialNotifications;
        this.notes = parsed.notes || initialNotes;
        this.lectures = parsed.lectures || initialLectures;
        this.students = parsed.students || initialStudents;
        this.settings = { ...initialSettings, ...(parsed.settings || {}) };

        // Ensure courses have subjects and are free for full UI/UX testing
        this.courses = this.courses.map(c => {
          c.discountPrice = 0;
          c.isFree = true;
          c.enrolled = true;
          if (!c.subjects || !c.subjects.length) {
            c.subjects = getDefaultSubjectsForCourse(c.id);
          }
          return c;
        });

        // Always force correct identity and address
        const currentName = (this.settings.coachingName || '').toLowerCase();
        if (currentName.includes('chanakya') || currentName.includes('brilliant') || currentName.includes('apex') || currentName !== 'smart study english classes') {
          this.settings.coachingName = 'Smart Study English Classes';
          this.settings.teacherName = 'Krishna Kumar';
          this.settings.legalName = 'Krishna Kumar';
          this.settings.address = 'NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR';
        }
        this.save();
        return;
      }
    } catch (e) {
      console.error('Failed to load store from localStorage', e);
    }

    this.courses = initialCourses;
    this.banners = initialBanners;
    this.notifications = initialNotifications;
    this.notes = initialNotes;
    this.lectures = initialLectures;
    this.students = initialStudents;
    this.settings = initialSettings;
  }

  save() {
    try {
      const data = {
        courses: this.courses,
        banners: this.banners,
        notifications: this.notifications,
        notes: this.notes,
        lectures: this.lectures,
        students: this.students,
        settings: this.settings
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.error('Failed to save store to localStorage', e);
    }
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
  addCourse(course) {
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
    this.save();
    return newCourse;
  }

  updateCourse(id, updatedFields) {
    const index = this.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.courses[index] = { ...this.courses[index], ...updatedFields };
      this.save();
    }
  }

  deleteCourse(id) {
    this.courses = this.courses.filter(c => c.id !== id);
    this.save();
  }

  // ========================================================
  // HIERARCHICAL CURRICULUM MANAGEMENT
  // (Batch -> Subjects -> Chapters -> Lectures, PDFs, Practices)
  // ========================================================

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
      this.save();
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
    this.save();
    return newSub;
  }

  deleteSubject(courseId, subjectId) {
    const course = this.getCourse(courseId);
    if (!course || !course.subjects) return;
    course.subjects = course.subjects.filter(s => s.id !== subjectId);
    this.save();
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
      this.save();
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
    this.save();
    return newCh;
  }

  deleteChapter(courseId, subjectId, chapterId) {
    const course = this.getCourse(courseId);
    if (!course || !course.subjects) return;
    const sub = course.subjects.find(s => s.id === subjectId);
    if (!sub || !sub.chapters) return;
    sub.chapters = sub.chapters.filter(c => c.id !== chapterId);
    this.save();
  }

  // 3. Resource Management (lectures, pdfs, practices)
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
      this.save();
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
    this.save();
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
    this.save();
  }

  // Banner actions
  addBanner(banner) {
    const newBanner = {
      id: 'banner_' + Date.now(),
      ...banner,
      active: true
    };
    this.banners.push(newBanner);
    this.save();
    return newBanner;
  }

  deleteBanner(id) {
    this.banners = this.banners.filter(b => b.id !== id);
    this.save();
  }

  // Notification actions
  sendNotification(title, desc) {
    const newNotif = {
      id: 'notif_' + Date.now(),
      title,
      desc,
      time: 'Just now'
    };
    this.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  deleteNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.save();
  }

  // Notes actions
  addNote(note) {
    const id = 'note_' + Date.now();
    const newNote = {
      ...note,
      id,
      downloads: 0
    };
    this.notes.unshift(newNote);
    this.save();
    return newNote;
  }

  deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.save();
  }

  // Lecture Video Actions
  addLecture(lecture) {
    const id = 'lec_' + Date.now();
    const newLecture = {
      ...lecture,
      id
    };
    this.lectures.push(newLecture);
    this.save();
    return newLecture;
  }

  deleteLecture(id) {
    this.lectures = this.lectures.filter(l => l.id !== id);
    this.save();
  }

  updateLecture(id, data) {
    const idx = this.lectures.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.lectures[idx] = { ...this.lectures[idx], ...data };
      this.save();
    }
  }

  // Settings
  updateSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    this.save();
  }

  // Reset to initial defaults
  resetToDefaults() {
    this.courses = initialCourses;
    this.banners = initialBanners;
    this.notifications = initialNotifications;
    this.notes = initialNotes;
    this.students = initialStudents;
    this.settings = initialSettings;
    this.save();
  }
}

export const store = new Store();
