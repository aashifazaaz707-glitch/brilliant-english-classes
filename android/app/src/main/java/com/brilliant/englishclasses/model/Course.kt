package com.brilliant.englishclasses.model

data class Course(
    val id: String,
    val title: String,
    val subtitle: String,
    val thumbnail: String,
    val originalPrice: Int,
    val discountPrice: Int,
    val discountPercentage: Int = (((originalPrice - discountPrice).toFloat() / originalPrice) * 100).toInt(),
    val rating: Double = 4.9,
    val studentCount: String = "4.5k+ Students",
    val batchDate: String = "Starts Oct 20, 2026",
    val faculty: String = "Krishna Kumar Sir",
    val facultyExperience: String = "12+ Years Teaching Experience",
    val validity: String = "Till Board Exam / 1 Year",
    val category: String = "Spoken & Grammar",
    val isLive: Boolean = true,
    val introVideoId: String = "wdaBwIv7Jso",
    val description: String = "",
    val descriptionPoints: List<String> = emptyList(),
    val features: List<String> = listOf(
        "120+ Hours Live & Recorded Classes",
        "Bilingual Hindi & English Explanations",
        "Downloadable Class PDF Notes & E-Books",
        "Weekly Live Doubt Clearing Sessions",
        "50+ Topic-wise Practice Mock Tests",
        "Certificate of Completion"
    ),
    val subjects: List<Subject> = emptyList()
)

data class Subject(
    val id: String,
    val name: String,
    val icon: String = "📖",
    val visible: Boolean = true,
    val chapters: List<Chapter> = emptyList()
)

data class Chapter(
    val id: String,
    val title: String,
    val order: Int = 1,
    val visible: Boolean = true,
    val lectures: List<LectureItem> = emptyList(),
    val pdfs: List<PdfItem> = emptyList(),
    val practices: List<PracticeItem> = emptyList()
)

data class LectureItem(
    val id: String,
    val title: String,
    val videoId: String,
    val duration: String = "25:00",
    val isFree: Boolean = true,
    val visible: Boolean = true
)

data class PdfItem(
    val id: String,
    val title: String,
    val pages: String = "14 Pages",
    val size: String = "2.0 MB",
    val url: String = "",
    val visible: Boolean = true
)

data class PracticeItem(
    val id: String,
    val title: String,
    val questionsCount: Int = 20,
    val timeMinutes: Int = 15,
    val marks: Int = 40,
    val visible: Boolean = true
)

data class BannerItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val imageUrl: String,
    val targetCourseId: String,
    val badge: String = "NEW BATCH"
)

enum class QuickActionType {
    ALL_COURSES,
    MY_COURSES,
    FREE_CONTENT,
    LIVE_CLASSES,
    TEST_SERIES,
    PAID_NOTES,
    FREE_NOTES,
    FREE_VIDEOS,
    YOUTUBE,
    INSTAGRAM,
    FACEBOOK,
    WHATSAPP,
    SHARE_APP
}

data class QuickActionItem(
    val id: String,
    val title: String,
    val type: QuickActionType,
    val badge: String? = null,
    val isLive: Boolean = false,
    val externalUrl: String? = null
)

data class AppNotification(
    val id: String,
    val title: String,
    val description: String,
    val time: String,
    val isUnread: Boolean = true
)
