package com.brilliant.englishclasses.data

import com.brilliant.englishclasses.model.BannerItem
import com.brilliant.englishclasses.model.Course
import com.brilliant.englishclasses.model.QuickActionItem
import com.brilliant.englishclasses.model.QuickActionType

object MockData {
    val banners = listOf(
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
        QuickActionItem("qa_9", "YouTube", QuickActionType.YOUTUBE, externalUrl = "https://youtube.com/@brilliantenglishclasses"),
        QuickActionItem("qa_10", "Instagram", QuickActionType.INSTAGRAM, externalUrl = "https://instagram.com/brilliantenglishclasses"),
        QuickActionItem("qa_11", "Facebook", QuickActionType.FACEBOOK, externalUrl = "https://facebook.com/brilliantenglishclasses"),
        QuickActionItem("qa_12", "WhatsApp", QuickActionType.WHATSAPP, externalUrl = "https://wa.me/919876543210"),
        QuickActionItem("qa_13", "Share App", QuickActionType.SHARE_APP)
    )

    val featuredCourses = listOf(
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
            faculty = "Prof. Arvind Kumar & Team",
            category = "Spoken English",
            features = listOf(
                "Daily 1-on-1 Practice Groups",
                "Phonics, Pronunciation & Accent",
                "Corporate & Interview English",
                "Lifetime PDF Study Materials",
                "Weekly Speaking Assessments"
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
            faculty = "Prof. R. K. Sharma (Ex-Examiner)",
            category = "Competitive Exams",
            features = listOf(
                "3000+ Previous Year Question (PYQs) Solved",
                "Speed Reading & Comprehension Hacks",
                "Advanced Grammar Rules with Tricks",
                "50 Full-Length Exam Mock Tests",
                "Special Vocab Booster with Mnemonics"
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
            faculty = "Dr. Neha Verma (Ph.D. English)",
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
