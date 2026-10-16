package com.brilliant.englishclasses.data

import com.brilliant.englishclasses.model.BannerItem
import com.brilliant.englishclasses.model.Course
import com.brilliant.englishclasses.model.QuickActionItem
import com.brilliant.englishclasses.model.QuickActionType

object MockData {
    val banners = listOf(
        BannerItem(
            id = "banner_c12",
            title = "Class 12th English Crash Course",
            subtitle = "Target 95+ Marks | BSEB & CBSE Board Exam",
            imageUrl = "course_class12_crash.jpg",
            targetCourseId = "class12-crash-course",
            badge = "⚡ NEW LAUNCH 2026"
        ),
        BannerItem(
            id = "banner_1",
            title = "Spoken English & Grammar 2026",
            subtitle = "New Foundation Batch Launched • 50% Off",
            imageUrl = "banner1.jpg",
            targetCourseId = "course_spoken_2026",
            badge = "🔥 NEW BATCH"
        ),
        BannerItem(
            id = "banner_2",
            title = "SSC & Banking English Cracker Batch",
            subtitle = "Target 100% Score in Tier 1 & Tier 2",
            imageUrl = "course_ssc.jpg",
            targetCourseId = "course_ssc_banking",
            badge = "⭐ TOP RATED"
        ),
        BannerItem(
            id = "banner_3",
            title = "Grammar & Essay Writing Masterclass",
            subtitle = "Zero to Hero • Descriptive & Objective",
            imageUrl = "course_grammar.jpg",
            targetCourseId = "course_grammar_mastery",
            badge = "🎯 SPECIAL"
        )
    )

    val quickActions = listOf(
        QuickActionItem("qa_1", "All Courses", QuickActionType.ALL_COURSES),
        QuickActionItem("qa_2", "My Courses", QuickActionType.MY_COURSES),
        QuickActionItem("qa_3", "Free Content", QuickActionType.FREE_CONTENT, badge = "FREE"),
        QuickActionItem("qa_4", "Live Classes", QuickActionType.LIVE_CLASSES, isLive = true),
        QuickActionItem("qa_5", "Test Series", QuickActionType.TEST_SERIES),
        QuickActionItem("qa_6", "Paid Notes", QuickActionType.PAID_NOTES),
        QuickActionItem("qa_7", "Free Notes", QuickActionType.FREE_NOTES),
        QuickActionItem("qa_8", "Free Videos", QuickActionType.FREE_VIDEOS),
        QuickActionItem("qa_9", "YouTube", QuickActionType.YOUTUBE, externalUrl = "https://youtube.com/@smartstudyenglishclasses"),
        QuickActionItem("qa_10", "Instagram", QuickActionType.INSTAGRAM, externalUrl = "https://instagram.com/smartstudyenglishclasses"),
        QuickActionItem("qa_11", "Facebook", QuickActionType.FACEBOOK, externalUrl = "https://facebook.com/smartstudyenglishclasses"),
        QuickActionItem("qa_12", "WhatsApp", QuickActionType.WHATSAPP, externalUrl = "https://wa.me/919876543210"),
        QuickActionItem("qa_13", "Share App", QuickActionType.SHARE_APP)
    )

    val featuredCourses = listOf(
        Course(
            id = "class12-crash-course",
            title = "Class 12th English Crash Course (Target 95+ Marks)",
            subtitle = "Complete Rainbow English (Prose & Poetry), 50 Marks Grammar & 10 Model Papers",
            thumbnail = "course_class12_crash.jpg",
            originalPrice = 1999,
            discountPrice = 499,
            rating = 4.95,
            studentCount = "New Batch",
            batchDate = "Starts 28th Oct 2026",
            faculty = "Krishna Kumar Sir",
            category = "Class 12th Board",
            features = listOf(
                "Line-by-Line Hindi Summary of All Chapters",
                "50 Marks Objective Board Grammar Crash Rules",
                "10 Full-Length Board Pattern Model Papers",
                "High Scoring Essay & Letter Writing Formats",
                "VVI Short & Long Questions with Handwritten Answers"
            ),
            subjects = emptyList()
        ),
        Course(
            id = "course_spoken_2026",
            title = "Spoken English Mastery Batch 2026",
            subtitle = "Master Fluent English Speaking with Daily Speaking Practice & Accent Training",
            thumbnail = "banner1.jpg",
            originalPrice = 2999,
            discountPrice = 999,
            rating = 4.9,
            studentCount = "8,400+ Enrolled",
            batchDate = "Starts 25th Oct 2026",
            faculty = "Krishna Kumar & Expert Team",
            category = "Spoken English",
            features = listOf(
                "Daily 1-on-1 Practice Groups",
                "Phonics, Pronunciation & Accent",
                "Corporate & Interview English",
                "Lifetime PDF Study Materials",
                "Weekly Speaking Assessments"
            ),
            subjects = listOf(
                com.brilliant.englishclasses.model.Subject(
                    id = "sub_spk_1",
                    name = "Spoken English & Fluency",
                    icon = "🗣️",
                    chapters = listOf(
                        com.brilliant.englishclasses.model.Chapter(
                            id = "ch_spk_1",
                            title = "Chapter 01: 500 Daily Spoken English Sentences",
                            lectures = listOf(
                                com.brilliant.englishclasses.model.LectureItem(id = "lec_1", title = "Day 01: Greeting & Self Introduction", videoId = "wdaBwIv7Jso", duration = "28:15")
                            ),
                            pdfs = listOf(
                                com.brilliant.englishclasses.model.PdfItem(id = "pdf_1", title = "500 Daily Sentences Printable PDF", pages = "18 Pages", size = "2.4 MB")
                            ),
                            practices = listOf(
                                com.brilliant.englishclasses.model.PracticeItem(id = "pr_1", title = "Daily Spoken English Quiz 01", questionsCount = 15, timeMinutes = 10, marks = 30)
                            )
                        )
                    )
                ),
                com.brilliant.englishclasses.model.Subject(
                    id = "sub_spk_2",
                    name = "Grammar Fundamentals",
                    icon = "📖",
                    chapters = listOf(
                        com.brilliant.englishclasses.model.Chapter(
                            id = "ch_spk_2",
                            title = "Chapter 01: Tenses & Time Mapping",
                            lectures = listOf(
                                com.brilliant.englishclasses.model.LectureItem(id = "lec_2", title = "Mastering Present & Past Tenses", videoId = "wdaBwIv7Jso", duration = "35:10")
                            ),
                            pdfs = listOf(
                                com.brilliant.englishclasses.model.PdfItem(id = "pdf_2", title = "Tenses Formula Sheet PDF", pages = "12 Pages", size = "1.8 MB")
                            ),
                            practices = listOf(
                                com.brilliant.englishclasses.model.PracticeItem(id = "pr_2", title = "Tenses Speed Test (20 Qs)", questionsCount = 20, timeMinutes = 15, marks = 40)
                            )
                        )
                    )
                )
            )
        ),
        Course(
            id = "course_ssc_banking",
            title = "SSC & Banking English Special 2026",
            subtitle = "Complete Syllabus Coverage for SSC CGL, CHSL, CPO & Bank PO/Clerk Exams",
            thumbnail = "course_ssc.jpg",
            originalPrice = 3499,
            discountPrice = 1299,
            rating = 4.95,
            studentCount = "12,200+ Enrolled",
            batchDate = "Starts 20th Oct 2026",
            faculty = "Krishna Kumar (Lead Instructor)",
            category = "Competitive Exams",
            features = listOf(
                "3000+ Previous Year Question (PYQs) Solved",
                "Speed Reading & Comprehension Hacks",
                "Advanced Grammar Rules with Tricks",
                "50 Full-Length Exam Mock Tests",
                "Special Vocab Booster with Mnemonics"
            ),
            subjects = listOf(
                com.brilliant.englishclasses.model.Subject(
                    id = "sub_ssc_1",
                    name = "Objective English Grammar",
                    icon = "🎯",
                    chapters = listOf(
                        com.brilliant.englishclasses.model.Chapter(
                            id = "ch_ssc_1",
                            title = "Chapter 01: 100 Golden Rules of Grammar",
                            lectures = listOf(
                                com.brilliant.englishclasses.model.LectureItem(id = "lec_ssc_1", title = "Golden Rules 1-25: Subject-Verb Agreement", videoId = "wdaBwIv7Jso", duration = "42:15")
                            ),
                            pdfs = listOf(
                                com.brilliant.englishclasses.model.PdfItem(id = "pdf_ssc_1", title = "100 Golden Grammar Rules Comprehensive Handout", pages = "36 Pages", size = "4.5 MB")
                            ),
                            practices = listOf(
                                com.brilliant.englishclasses.model.PracticeItem(id = "pr_ssc_1", title = "Error Spotting Mock Test (SSC Pattern)", questionsCount = 25, timeMinutes = 20, marks = 50)
                            )
                        )
                    )
                )
            )
        ),
        Course(
            id = "course_grammar_mastery",
            title = "Complete English Grammar & Writing",
            subtitle = "Zero to Advanced Level for School, College & Competitive Examinations",
            thumbnail = "course_grammar.jpg",
            originalPrice = 1999,
            discountPrice = 799,
            rating = 4.88,
            studentCount = "6,150+ Enrolled",
            batchDate = "Instant Access / Self-Paced",
            faculty = "Krishna Kumar & Team",
            category = "Grammar & Writing",
            features = listOf(
                "All 8 Parts of Speech in Detail",
                "Tenses, Voice, Narration Simplified",
                "Formal Essay & Letter Writing",
                "Chapter-wise Practice Worksheets",
                "Doubt Support via Telegram Group"
            )
        )
    )
}
