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
    val faculty: String = "Prof. R. K. Sharma (Ex-Examiner)",
    val validity: String = "12 Months Validity",
    val category: String = "Spoken & Grammar",
    val isLive: Boolean = true,
    val features: List<String> = listOf(
        "120+ Hours Live & Recorded Classes",
        "Bilingual Hindi & English Explanations",
        "Downloadable Class PDF Notes & E-Books",
        "Weekly Live Doubt Clearing Sessions",
        "50+ Topic-wise Practice Mock Tests",
        "Certificate of Completion"
    )
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
