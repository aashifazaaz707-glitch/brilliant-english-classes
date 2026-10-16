package com.brilliant.englishclasses.model

data class StudentUser(
    val id: String,
    val fullName: String,
    val email: String,
    val avatarUrl: String = "",
    val rollId: String = "SSE-26-0001",
    val isVerified: Boolean = true,
    val idToken: String? = null
)
