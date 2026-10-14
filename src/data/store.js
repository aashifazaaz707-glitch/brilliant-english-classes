// Central Data Store for Brilliant English Classes (Synchronized between Admin Panel & Mobile App)

const STORAGE_KEY = 'brilliant_english_store_v1';

const initialCourses = [
  {
    id: 'spoken-2026',
    title: 'Spoken English Mastery Batch 2026',
    category: 'Spoken English',
    batchDate: 'Starts 25th Oct',
    rating: '4.9',
    students: '8,400+',
    faculty: 'Prof. Arvind Kumar & Expert Panel',
    originalPrice: 2999,
    discountPrice: 999,
    discountPercent: 67,
    image: '/images/banner1.jpg',
    status: 'Active',
    description: 'Master effortless spoken English with daily 1-on-1 speaking practice, pronunciation & accent training, interview preparation, and corporate communication skills.',
    features: [
      'Daily 1-on-1 Practice Speaking Rooms',
      'Neutral Accent & Pronunciation Hacks',
      'Overcome Hesitation & Public Speaking Fear',
      'Downloadable PDF Workbooks & Sentence Frames',
      'Certificate of Fluency on Completion'
    ]
  },
  {
    id: 'ssc-banking',
    title: 'SSC & Banking English Cracker Batch',
    category: 'Govt Exams',
    batchDate: 'Starts 20th Oct',
    rating: '4.95',
    students: '12,200+',
    faculty: 'Prof. R. K. Sharma (Ex-Examiner)',
    originalPrice: 3499,
    discountPrice: 1299,
    discountPercent: 63,
    image: '/images/course_ssc.jpg',
    status: 'Active',
    description: 'All-in-one preparation for SSC CGL, CHSL, CPO, MTS, and Bank PO/Clerk examinations with 100% target score strategy and mnemonic vocabulary.',
    features: [
      '3,500+ Previous Year Questions (PYQs) Solved',
      'Speed Reading & Comprehension Tricks',
      'Rules of Grammar with 100 Golden Rules',
      '50 Full-Length Exam Standard Mock Tests',
      'High-Yield Root Words & Idiom Mnemonics'
    ]
  },
  {
    id: 'grammar-mastery',
    title: 'Complete English Grammar & Essay Writing',
    category: 'Grammar & Writing',
    batchDate: 'Self Paced + Live Doubt',
    rating: '4.88',
    students: '6,150+',
    faculty: 'Dr. Neha Verma (Ph.D. English)',
    originalPrice: 1999,
    discountPrice: 799,
    discountPercent: 60,
    image: '/images/course_grammar.jpg',
    status: 'Active',
    description: 'From Zero to Hero grammar rules, tenses, narration, active-passive voice, formal letter drafting, and descriptive essays for school, college, and competitive exams.',
    features: [
      'All 8 Parts of Speech Simplified with Examples',
      'Tenses & Subject-Verb Agreement Secrets',
      'Descriptive Essay, Letter, and Notice Formats',
      'Printable Chapter Summary Flashcards',
      'Dedicated Doubt Support via Student Community'
    ]
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
  { id: 'n1', title: '🔴 Live Grammar Doubt Session', time: '10 Mins Ago', desc: 'Prof. Arvind Kumar is live discussing 100 Golden Rules of English.' },
  { id: 'n2', title: '📑 New PDF Notes Uploaded', time: '1 Hour Ago', desc: 'SSC CGL 2026 Tier-1 Vocabulary Booster PDF is now available in Free Notes.' },
  { id: 'n3', title: '🎉 50% Off Early Bird Discount', time: 'Yesterday', desc: 'Use code BRILLIANT50 to get an additional ₹500 off on Spoken English Batch.' }
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
  coachingName: 'Brilliant English Classes',
  tagline: 'Learn • Practice • Master',
  category: 'Spoken English & Grammar',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'support@brilliantenglishclasses.com',
  youtubeUrl: 'https://youtube.com/@brilliantenglishclasses',
  instagramUrl: 'https://instagram.com/brilliantenglishclasses',
  facebookUrl: 'https://facebook.com/brilliantenglishclasses'
};

class Store {
  constructor() {
    this.listeners = [];
    this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.courses = parsed.courses || initialCourses;
        this.banners = parsed.banners || initialBanners;
        this.notifications = parsed.notifications || initialNotifications;
        this.notes = parsed.notes || initialNotes;
        this.lectures = parsed.lectures || initialLectures;
        if (this.lectures && this.lectures.length > 0 && this.lectures[0].videoId === 'UzXc_gJOC1Y') {
          this.lectures[0].videoId = 'wdaBwIv7Jso';
          this.lectures[0].youtubeUrl = 'https://youtu.be/wdaBwIv7Jso?si=W-8-boaeRP1YSLJr';
          this.lectures[0].title = 'Parts of Speech: English Grammar Masterclass';
          this.lectures[0].duration = 'Auto-sync';
        }
        this.students = parsed.students || initialStudents;
        this.settings = parsed.settings || initialSettings;
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
    this.listeners.forEach(fn => fn(this));
  }

  // Course actions
  addCourse(course) {
    const id = 'course_' + Date.now();
    const discountPercent = Math.round(((course.originalPrice - course.discountPrice) / course.originalPrice) * 100);
    const newCourse = {
      ...course,
      id,
      discountPercent: discountPercent > 0 ? discountPercent : 0,
      rating: '5.0',
      students: '1+',
      status: 'Active'
    };
    this.courses.unshift(newCourse);
    this.save();
    return newCourse;
  }

  updateCourse(id, updated) {
    const idx = this.courses.findIndex(c => c.id === id);
    if (idx !== -1) {
      const discountPercent = Math.round(((updated.originalPrice - updated.discountPrice) / updated.originalPrice) * 100);
      this.courses[idx] = {
        ...this.courses[idx],
        ...updated,
        discountPercent: discountPercent > 0 ? discountPercent : 0
      };
      this.save();
    }
  }

  deleteCourse(id) {
    this.courses = this.courses.filter(c => c.id !== id);
    this.banners = this.banners.filter(b => b.courseId !== id);
    this.save();
  }

  // Banner actions
  addBanner(banner) {
    const id = 'banner_' + Date.now();
    const newBanner = {
      ...banner,
      id,
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

  // Lecture Video Actions (Unlisted YouTube Lectures)
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
