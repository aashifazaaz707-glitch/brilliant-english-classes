package com.brilliant.englishclasses.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import com.brilliant.englishclasses.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object SupabaseRepository {
    private const val TAG = "SupabaseRepository"
    private const val SUPABASE_URL = "https://sybtavlkdhhqxnkvdbcq.supabase.co"
    private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5YnRhdmxrZGhocXhua3ZkYmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMTk2NjEsImV4cCI6MjEwNzY5NTY2MX0.1ZCuLtUy6CzL5trbHvryfBtnmsjd6lnlig1XKylfh6Q"

    private const val PREFS_NAME = "smart_study_supabase_cache"
    private const val KEY_COURSES_CACHE = "key_courses_cache"
    private const val KEY_BANNERS_CACHE = "key_banners_cache"
    private const val KEY_NOTIFICATIONS_CACHE = "key_notifications_cache"
    private const val KEY_ENROLLED_IDS = "key_enrolled_ids"

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val _courses = mutableStateOf<List<Course>>(emptyList())
    val courses: State<List<Course>> = _courses

    private val _banners = mutableStateOf<List<BannerItem>>(emptyList())
    val banners: State<List<BannerItem>> = _banners

    private val _notifications = mutableStateOf<List<AppNotification>>(emptyList())
    val notifications: State<List<AppNotification>> = _notifications

    private val _enrolledCourseIds = mutableStateOf<Set<String>>(emptySet())
    val enrolledCourseIds: State<Set<String>> = _enrolledCourseIds

    private val _isLoading = mutableStateOf(false)
    val isLoading: State<Boolean> = _isLoading

    private val _syncError = mutableStateOf<String?>(null)
    val syncError: State<String?> = _syncError

    private var appContext: Context? = null

    fun init(context: Context) {
        appContext = context.applicationContext
        loadLocalCache(context)
        syncFromSupabase()
        
        // If user already logged in, refresh enrollments
        AndroidAuthManager.currentUser.value?.let { user ->
            refreshEnrollments(user.id)
        }
    }

    fun resolveImageUrl(url: String): String {
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url
        }
        val clean = url.removePrefix("/images/").removePrefix("/")
        return "file:///android_asset/$clean"
    }

    private fun loadLocalCache(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val enrolledRaw = prefs.getStringSet(KEY_ENROLLED_IDS, emptySet()) ?: emptySet()
        _enrolledCourseIds.value = enrolledRaw

        val coursesJson = prefs.getString(KEY_COURSES_CACHE, null)
        if (!coursesJson.isNullOrEmpty()) {
            try {
                _courses.value = parseCoursesJson(JSONArray(coursesJson))
            } catch (e: Exception) {
                Log.w(TAG, "Failed to parse cached courses", e)
            }
        }
        if (_courses.value.isEmpty()) {
            _courses.value = getDefaultCourses()
        }

        val bannersJson = prefs.getString(KEY_BANNERS_CACHE, null)
        if (!bannersJson.isNullOrEmpty()) {
            try {
                _banners.value = parseBannersJson(JSONArray(bannersJson))
            } catch (e: Exception) {
                Log.w(TAG, "Failed to parse cached banners", e)
            }
        }
        if (_banners.value.isEmpty()) {
            _banners.value = getDefaultBanners()
        }

        val notifsJson = prefs.getString(KEY_NOTIFICATIONS_CACHE, null)
        if (!notifsJson.isNullOrEmpty()) {
            try {
                _notifications.value = parseNotificationsJson(JSONArray(notifsJson))
            } catch (e: Exception) {
                Log.w(TAG, "Failed to parse cached notifications", e)
            }
        }
        if (_notifications.value.isEmpty()) {
            _notifications.value = getDefaultNotifications()
        }
    }

    fun syncFromSupabase() {
        _isLoading.value = true
        _syncError.value = null

        CoroutineScope(Dispatchers.IO).launch {
            try {
                // 1. Fetch live courses from Supabase
                val coursesReq = Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/courses?select=*&order=order_num.asc")
                    .addHeader("apikey", SUPABASE_ANON_KEY)
                    .addHeader("Authorization", "Bearer $SUPABASE_ANON_KEY")
                    .get()
                    .build()

                httpClient.newCall(coursesReq).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body?.string() ?: "[]"
                        val jsonArr = JSONArray(body)
                        val fetchedCourses = parseCoursesJson(jsonArr)
                        if (fetchedCourses.isNotEmpty()) {
                            withContext(Dispatchers.Main) {
                                _courses.value = fetchedCourses
                            }
                            appContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)?.edit()
                                ?.putString(KEY_COURSES_CACHE, body)
                                ?.apply()
                        }
                    } else {
                        Log.w(TAG, "Courses sync failed code: ${response.code}")
                    }
                    Unit
                }

                // 2. Fetch live banners from Supabase
                val bannersReq = Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/banners?select=*&order=order_num.asc")
                    .addHeader("apikey", SUPABASE_ANON_KEY)
                    .addHeader("Authorization", "Bearer $SUPABASE_ANON_KEY")
                    .get()
                    .build()

                httpClient.newCall(bannersReq).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body?.string() ?: "[]"
                        val jsonArr = JSONArray(body)
                        val fetchedBanners = parseBannersJson(jsonArr)
                        if (fetchedBanners.isNotEmpty()) {
                            withContext(Dispatchers.Main) {
                                _banners.value = fetchedBanners
                            }
                            appContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)?.edit()
                                ?.putString(KEY_BANNERS_CACHE, body)
                                ?.apply()
                        }
                    }
                    Unit
                }

                // 3. Fetch live notifications from Supabase
                val notifsReq = Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/notifications?select=*&order=created_at.desc")
                    .addHeader("apikey", SUPABASE_ANON_KEY)
                    .addHeader("Authorization", "Bearer $SUPABASE_ANON_KEY")
                    .get()
                    .build()

                httpClient.newCall(notifsReq).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body?.string() ?: "[]"
                        val jsonArr = JSONArray(body)
                        val fetchedNotifs = parseNotificationsJson(jsonArr)
                        if (fetchedNotifs.isNotEmpty()) {
                            withContext(Dispatchers.Main) {
                                _notifications.value = fetchedNotifs
                            }
                            appContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)?.edit()
                                ?.putString(KEY_NOTIFICATIONS_CACHE, body)
                                ?.apply()
                        }
                    } else {
                        Log.w(TAG, "Notifications sync code: ${response.code}")
                    }
                    Unit
                }

                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error syncing data from Supabase", e)
                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    _syncError.value = e.localizedMessage
                }
            }
        }
    }

    fun refreshEnrollments(userId: String?) {
        if (userId.isNullOrEmpty()) {
            _enrolledCourseIds.value = emptySet()
            appContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)?.edit()
                ?.remove(KEY_ENROLLED_IDS)
                ?.apply()
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val req = Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/enrollments?user_id=eq.$userId&select=*")
                    .addHeader("apikey", SUPABASE_ANON_KEY)
                    .addHeader("Authorization", "Bearer $SUPABASE_ANON_KEY")
                    .get()
                    .build()

                httpClient.newCall(req).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body?.string() ?: "[]"
                        val jsonArr = JSONArray(body)
                        val enrolledSet = mutableSetOf<String>()
                        for (i in 0 until jsonArr.length()) {
                            val obj = jsonArr.getJSONObject(i)
                            val courseId = obj.optString("course_id", "")
                            if (courseId.isNotEmpty()) {
                                enrolledSet.add(courseId)
                            }
                        }
                        withContext(Dispatchers.Main) {
                            _enrolledCourseIds.value = enrolledSet
                        }
                        appContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)?.edit()
                            ?.putStringSet(KEY_ENROLLED_IDS, enrolledSet)
                            ?.apply()
                        Log.d(TAG, "Fetched ${enrolledSet.size} enrolled courses for $userId from Supabase")
                    } else {
                        Log.w(TAG, "Enrollments sync failed code: ${response.code}")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error refreshing enrollments from Supabase", e)
            }
        }
    }

    fun enrollUser(userId: String, courseId: String, amount: Int, onComplete: (Boolean, String?) -> Unit) {
        val receiptNo = "SSE-REC-" + (System.currentTimeMillis() % 1000000)
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val json = JSONObject().apply {
                    put("user_id", userId)
                    put("course_id", courseId)
                    put("amount", amount)
                    put("receipt_no", receiptNo)
                    put("status", "Completed")
                }

                val mediaType = "application/json".toMediaType()
                val body = json.toString().toRequestBody(mediaType)

                val req = Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/enrollments?on_conflict=user_id,course_id")
                    .addHeader("apikey", SUPABASE_ANON_KEY)
                    .addHeader("Authorization", "Bearer $SUPABASE_ANON_KEY")
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Prefer", "resolution=merge-duplicates")
                    .post(body)
                    .build()

                httpClient.newCall(req).execute().use { response ->
                    val bodyStr = response.body?.string() ?: ""
                    val isAlreadyEnrolled = response.code == 409 ||
                            bodyStr.contains("duplicate", ignoreCase = true) ||
                            bodyStr.contains("already exists", ignoreCase = true)

                    if (response.isSuccessful || response.code in listOf(200, 201, 204) || isAlreadyEnrolled) {
                        withContext(Dispatchers.Main) {
                            val updated = _enrolledCourseIds.value.toMutableSet()
                            updated.add(courseId)
                            _enrolledCourseIds.value = updated
                            appContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)?.edit()
                                ?.putStringSet(KEY_ENROLLED_IDS, updated)
                                ?.apply()
                            onComplete(true, receiptNo)
                        }
                    } else {
                        val errStr = if (bodyStr.isNotEmpty()) bodyStr else "Enrollment failed (${response.code})"
                        withContext(Dispatchers.Main) {
                            onComplete(false, errStr)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Enrollment error", e)
                withContext(Dispatchers.Main) {
                    onComplete(false, e.localizedMessage)
                }
            }
        }
    }

    fun isCourseEnrolled(courseId: String): Boolean {
        return _enrolledCourseIds.value.contains(courseId)
    }

    fun getEnrolledCourses(): List<Course> {
        val enrolledIds = _enrolledCourseIds.value
        return _courses.value.filter { enrolledIds.contains(it.id) }
    }

    fun getCourseById(courseId: String): Course? {
        return _courses.value.find { it.id == courseId } ?: getDefaultCourses().find { it.id == courseId }
    }

    private fun parseSubjectsJson(subArr: JSONArray): List<Subject> {
        val subjects = mutableListOf<Subject>()
        for (i in 0 until subArr.length()) {
            val subObj = subArr.getJSONObject(i)
            val subId = subObj.optString("id", "sub_$i")
            val subName = subObj.optString("name", "Subject")
            val icon = subObj.optString("icon", "📖")
            val visible = subObj.optBoolean("visible", true)

            val chapters = mutableListOf<Chapter>()
            val chArr = subObj.optJSONArray("chapters")
            if (chArr != null) {
                for (j in 0 until chArr.length()) {
                    val chObj = chArr.getJSONObject(j)
                    val chId = chObj.optString("id", "ch_$j")
                    val chTitle = chObj.optString("title", "Chapter")
                    val order = chObj.optInt("order", j + 1)
                    val chVisible = chObj.optBoolean("visible", true)

                    val lectures = mutableListOf<LectureItem>()
                    val lecArr = chObj.optJSONArray("lectures")
                    if (lecArr != null) {
                        for (k in 0 until lecArr.length()) {
                            val lObj = lecArr.getJSONObject(k)
                            lectures.add(LectureItem(
                                id = lObj.optString("id", "lec_$k"),
                                title = lObj.optString("title", "Lecture"),
                                videoId = lObj.optString("videoId", ""),
                                duration = lObj.optString("duration", "25:00"),
                                isFree = lObj.optBoolean("isFree", true),
                                visible = lObj.optBoolean("visible", true)
                            ))
                        }
                    }

                    val pdfs = mutableListOf<PdfItem>()
                    val pdfArr = chObj.optJSONArray("pdfs")
                    if (pdfArr != null) {
                        for (k in 0 until pdfArr.length()) {
                            val pObj = pdfArr.getJSONObject(k)
                            pdfs.add(PdfItem(
                                id = pObj.optString("id", "pdf_$k"),
                                title = pObj.optString("title", "PDF Note"),
                                pages = pObj.optString("pages", "10 Pages"),
                                size = pObj.optString("size", "2.0 MB"),
                                url = pObj.optString("url", ""),
                                visible = pObj.optBoolean("visible", true)
                            ))
                        }
                    }

                    val practices = mutableListOf<PracticeItem>()
                    val prArr = chObj.optJSONArray("practices")
                    if (prArr != null) {
                        for (k in 0 until prArr.length()) {
                            val prObj = prArr.getJSONObject(k)
                            practices.add(PracticeItem(
                                id = prObj.optString("id", "pr_$k"),
                                title = prObj.optString("title", "Practice Test"),
                                questionsCount = prObj.optInt("questionsCount", 20),
                                timeMinutes = prObj.optInt("timeMinutes", 15),
                                marks = prObj.optInt("marks", 40),
                                visible = prObj.optBoolean("visible", true)
                            ))
                        }
                    }

                    chapters.add(Chapter(
                        id = chId,
                        title = chTitle,
                        order = order,
                        visible = chVisible,
                        lectures = lectures,
                        pdfs = pdfs,
                        practices = practices
                    ))
                }
            }

            subjects.add(Subject(
                id = subId,
                name = subName,
                icon = icon,
                visible = visible,
                chapters = chapters
            ))
        }
        return subjects
    }

    private fun extractYoutubeId(urlOrId: String): String {
        if (urlOrId.length == 11 && !urlOrId.contains("/") && !urlOrId.contains("?")) {
            return urlOrId
        }
        val pattern = "(?<=watch\\?v=|/videos/|embed/|youtu.be/|/v/|/e/|watch\\?v%3D|watch\\?feature=player_embedded&v=)[^#&?\\n]*"
        val compiledPattern = java.util.regex.Pattern.compile(pattern)
        val matcher = compiledPattern.matcher(urlOrId)
        return if (matcher.find()) matcher.group() else urlOrId.ifEmpty { "wdaBwIv7Jso" }
    }

    private fun parseCoursesJson(arr: JSONArray): List<Course> {
        val list = mutableListOf<Course>()
        for (i in 0 until arr.length()) {
            val obj = arr.getJSONObject(i)
            val id = obj.optString("id", "")
            if (id.isEmpty()) continue

            val title = obj.optString("title", "Course")
            val category = obj.optString("category", "General English")
            val batchDate = obj.optString("batch_date", "New Launch 2026")
            val rating = obj.optDouble("rating", 4.90)
            val studentCount = obj.optString("students", "New Batch")
            val faculty = obj.optString("faculty", "Krishna Kumar Sir")
            val facultyExp = obj.optString("faculty_experience", "12+ Years Teaching Experience")
            val validity = obj.optString("validity", "Till Board Exam / 1 Year")
            val introVideoRaw = obj.optString("intro_video_url", "wdaBwIv7Jso")
            val introVideoId = extractYoutubeId(introVideoRaw)
            val originalPrice = obj.optInt("original_price", 1999)
            val discountPrice = obj.optInt("discount_price", 499)
            val image = obj.optString("image", "course_class12_crash.jpg")
            val description = obj.optString("description", "")
            
            val descPoints = if (description.contains("\n")) {
                description.split("\n").map { it.trim().removePrefix("•").removePrefix("-").trim() }.filter { it.isNotEmpty() }
            } else if (description.contains(".")) {
                description.split(".").map { it.trim() }.filter { it.length > 5 }
            } else {
                listOf(description).filter { it.isNotEmpty() }
            }

            val featuresList = mutableListOf<String>()
            val featArr = obj.optJSONArray("features")
            if (featArr != null) {
                for (j in 0 until featArr.length()) {
                    featuresList.add(featArr.optString(j))
                }
            }
            if (featuresList.isEmpty()) {
                featuresList.addAll(listOf(
                    "Comprehensive Video Lectures & Concept Clearing",
                    "Printable PDF Notes & Formula Handouts",
                    "Dedicated WhatsApp Doubt Resolution",
                    "Topic-wise Mock Quizzes & Practice Sets"
                ))
            }

            val rawSubjects = obj.optJSONArray("subjects")
            val subjects = if (rawSubjects != null && rawSubjects.length() > 0) {
                parseSubjectsJson(rawSubjects)
            } else {
                getSubjectsForCourse(id)
            }

            list.add(Course(
                id = id,
                title = title,
                subtitle = description.ifEmpty { "$category • Guided by $faculty" },
                thumbnail = image,
                originalPrice = originalPrice,
                discountPrice = discountPrice,
                rating = rating,
                studentCount = studentCount,
                batchDate = batchDate,
                faculty = faculty,
                facultyExperience = facultyExp,
                validity = validity,
                category = category,
                introVideoId = introVideoId,
                description = description,
                descriptionPoints = descPoints,
                features = featuresList,
                subjects = subjects
            ))
        }
        return list
    }

    private fun parseBannersJson(arr: JSONArray): List<BannerItem> {
        val list = mutableListOf<BannerItem>()
        for (i in 0 until arr.length()) {
            val obj = arr.getJSONObject(i)
            val id = obj.optString("id", "")
            val title = obj.optString("title", "")
            val subtitle = obj.optString("subtitle", "")
            val image = obj.optString("image", "")
            val courseId = obj.optString("course_id", "")
            val badge = obj.optString("badge", "NEW")
            val active = obj.optBoolean("active", true)

            if (active && title.isNotEmpty()) {
                list.add(BannerItem(
                    id = id,
                    title = title,
                    subtitle = subtitle,
                    imageUrl = image,
                    targetCourseId = courseId,
                    badge = badge
                ))
            }
        }
        return list
    }

    fun getSubjectsForCourse(courseId: String): List<Subject> {
        return when (courseId) {
            "class12-crash-course" -> listOf(
                Subject(
                    id = "sub_c12_rainbow",
                    name = "Rainbow English Part 2 (Prose & Poetry)",
                    icon = "📖",
                    chapters = listOf(
                        Chapter(
                            id = "ch_c12_prose_01",
                            title = "Prose Chapter 01: Indian Civilization & Culture (Mahatma Gandhi)",
                            order = 1,
                            lectures = listOf(
                                LectureItem(id = "lec_c12_1", title = "Chapter Line-by-Line Explanation & Hindi Summary", videoId = "wdaBwIv7Jso", duration = "34:20", isFree = true),
                                LectureItem(id = "lec_c12_2", title = "VVI Objective Questions & Short Answer Mastery", videoId = "wdaBwIv7Jso", duration = "28:10", isFree = true)
                            ),
                            pdfs = listOf(
                                PdfItem(id = "pdf_c12_1", title = "Indian Civilization & Culture: Complete Notes & Summary PDF", pages = "16 Pages", size = "2.1 MB"),
                                PdfItem(id = "pdf_c12_2", title = "Chapter 01 VVI Board Objective Bank (50 MCQs)", pages = "8 Pages", size = "1.2 MB")
                            ),
                            practices = listOf(
                                PracticeItem(id = "quiz_c12_1", title = "Indian Civilization & Culture Speed MCQ Test", questionsCount = 25, timeMinutes = 15, marks = 50)
                            )
                        ),
                        Chapter(
                            id = "ch_c12_prose_02",
                            title = "Prose Chapter 02: Bharat Is My Home (Dr. Zakir Hussain)",
                            order = 2,
                            lectures = listOf(
                                LectureItem(id = "lec_c12_3", title = "Bharat Is My Home: Complete Analysis & Central Theme", videoId = "wdaBwIv7Jso", duration = "31:45", isFree = false)
                            ),
                            pdfs = listOf(
                                PdfItem(id = "pdf_c12_3", title = "Bharat Is My Home: Handwritten Study Notes", pages = "12 Pages", size = "1.6 MB")
                            ),
                            practices = listOf(
                                PracticeItem(id = "quiz_c12_2", title = "Bharat Is My Home Daily Practice Quiz", questionsCount = 20, timeMinutes = 12, marks = 40)
                            )
                        ),
                        Chapter(
                            id = "ch_c12_poetry_01",
                            title = "Poetry Chapter 01: Sweetest Love I Do Not Goe (John Donne)",
                            order = 3,
                            lectures = listOf(
                                LectureItem(id = "lec_c12_4", title = "Metaphysical Poetry Masterclass & Stanza Explanations", videoId = "wdaBwIv7Jso", duration = "29:30", isFree = true)
                            ),
                            pdfs = listOf(
                                PdfItem(id = "pdf_c12_4", title = "Sweetest Love I Do Not Goe: Stanza Paraphrase & Notes", pages = "10 Pages", size = "1.3 MB")
                            ),
                            practices = listOf(
                                PracticeItem(id = "quiz_c12_3", title = "Poetry Section 01 Board Exam Mock Quiz", questionsCount = 15, timeMinutes = 10, marks = 30)
                            )
                        )
                    )
                ),
                Subject(
                    id = "sub_c12_grammar",
                    name = "Class 12th Board Grammar (50 Marks Guaranteed)",
                    icon = "🎯",
                    chapters = listOf(
                        Chapter(
                            id = "ch_c12_grm_01",
                            title = "Chapter 01: Active & Passive Voice + Direct & Indirect Speech",
                            order = 1,
                            lectures = listOf(
                                LectureItem(id = "lec_c12_5", title = "Voice 10-Second Elimination Tricks for Board Exams", videoId = "wdaBwIv7Jso", duration = "38:15", isFree = true),
                                LectureItem(id = "lec_c12_6", title = "Narration & Speech Rules with 10-Year Board Questions", videoId = "wdaBwIv7Jso", duration = "41:20", isFree = false)
                            ),
                            pdfs = listOf(
                                PdfItem(id = "pdf_c12_5", title = "Voice & Narration Board Exam Master Cheat Sheet", pages = "14 Pages", size = "1.9 MB")
                            ),
                            practices = listOf(
                                PracticeItem(id = "quiz_c12_4", title = "Voice & Narration Board Pattern 30 MCQ Mock", questionsCount = 30, timeMinutes = 20, marks = 60)
                            )
                        )
                    )
                ),
                Subject(
                    id = "sub_c12_writing",
                    name = "Writing Section & 10 Official Model Papers",
                    icon = "✍️",
                    chapters = listOf(
                        Chapter(
                            id = "ch_c12_write_01",
                            title = "Chapter 01: Essay Writing, Letter Writing & Comprehension",
                            order = 1,
                            lectures = listOf(
                                LectureItem(id = "lec_c12_8", title = "How to Score 8/8 in Essay & 5/5 in Letter Writing", videoId = "wdaBwIv7Jso", duration = "33:10", isFree = true)
                            ),
                            pdfs = listOf(
                                PdfItem(id = "pdf_c12_7", title = "15 Most Expected Board Essay Topics with High Scoring Vocabulary", pages = "22 Pages", size = "2.5 MB")
                            ),
                            practices = listOf(
                                PracticeItem(id = "quiz_c12_6", title = "Full Length 100 Marks Board Simulation Test", questionsCount = 50, timeMinutes = 45, marks = 100)
                            )
                        )
                    )
                )
            )
            "course_spoken_2026" -> listOf(
                Subject(
                    id = "sub_spk_1",
                    name = "Spoken English & Fluency Drills",
                    icon = "🗣️",
                    chapters = listOf(
                        Chapter(
                            id = "ch_spk_1",
                            title = "Chapter 01: 500 Daily Spoken Sentences & Real Life Scenarios",
                            order = 1,
                            lectures = listOf(
                                LectureItem(id = "lec_spk_1", title = "Day 01: Greeting & Self Introduction Mastery", videoId = "wdaBwIv7Jso", duration = "28:15", isFree = true),
                                LectureItem(id = "lec_spk_2", title = "Day 02: Real-Life Spoken Situations & Rapid Responses", videoId = "wdaBwIv7Jso", duration = "32:10", isFree = true)
                            ),
                            pdfs = listOf(
                                PdfItem(id = "pdf_spk_1", title = "500 Daily Spoken English Printable Handout", pages = "18 Pages", size = "2.4 MB")
                            ),
                            practices = listOf(
                                PracticeItem(id = "quiz_spk_1", title = "Daily Spoken English Quiz 01", questionsCount = 15, timeMinutes = 10, marks = 30)
                            )
                        )
                    )
                )
            )
            "course_ssc_banking" -> listOf(
                Subject(
                    id = "sub_ssc_1",
                    name = "Objective English Grammar & PYQs",
                    icon = "🎯",
                    chapters = listOf(
                        Chapter(
                            id = "ch_ssc_1",
                            title = "Chapter 01: 100 Golden Rules of Grammar (SSC CGL & Bank PO)",
                            order = 1,
                            lectures = listOf(
                                LectureItem(id = "lec_ssc_1", title = "Golden Rules 1-25: Subject-Verb Agreement", videoId = "wdaBwIv7Jso", duration = "42:15", isFree = true)
                            ),
                            pdfs = listOf(
                                PdfItem(id = "pdf_ssc_1", title = "100 Golden Rules Complete Study Handout", pages = "36 Pages", size = "4.5 MB")
                            ),
                            practices = listOf(
                                PracticeItem(id = "quiz_ssc_1", title = "Error Spotting Mock Test (SSC Pattern)", questionsCount = 25, timeMinutes = 20, marks = 50)
                            )
                        )
                    )
                )
            )
            else -> listOf(
                Subject(
                    id = "sub_gen_1",
                    name = "Foundation Chapters",
                    icon = "📚",
                    chapters = listOf(
                        Chapter(
                            id = "ch_gen_1",
                            title = "Chapter 01: Core Fundamentals & Concept Map",
                            order = 1,
                            lectures = listOf(
                                LectureItem(id = "lec_gen_1", title = "Concept Lecture 01", videoId = "wdaBwIv7Jso", duration = "30:00", isFree = true)
                            ),
                            pdfs = listOf(
                                PdfItem(id = "pdf_gen_1", title = "Concept Revision PDF", pages = "12 Pages", size = "1.5 MB")
                            ),
                            practices = listOf(
                                PracticeItem(id = "quiz_gen_1", title = "Practice Assessment 01", questionsCount = 20, timeMinutes = 15, marks = 40)
                            )
                        )
                    )
                )
            )
        }
    }

    private fun getDefaultCourses(): List<Course> {
        return listOf(
            Course(
                id = "class12-crash-course",
                title = "Class 12th English Crash Course (Target 95+ Marks)",
                subtitle = "Complete Rainbow English (Prose & Poetry), 50 Marks Grammar & 10 Model Papers",
                thumbnail = "/images/course_class12_crash.jpg",
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
                subjects = getSubjectsForCourse("class12-crash-course")
            ),
            Course(
                id = "course_spoken_2026",
                title = "Spoken English Mastery Batch 2026",
                subtitle = "Master Fluent English Speaking with Daily Speaking Practice & Accent Training",
                thumbnail = "/images/banner1.jpg",
                originalPrice = 2999,
                discountPrice = 999,
                rating = 4.90,
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
                subjects = getSubjectsForCourse("course_spoken_2026")
            ),
            Course(
                id = "course_ssc_banking",
                title = "SSC & Banking English Special 2026",
                subtitle = "Complete Syllabus Coverage for SSC CGL, CHSL, CPO & Bank PO/Clerk Exams",
                thumbnail = "/images/course_ssc.jpg",
                originalPrice = 3499,
                discountPrice = 1299,
                rating = 4.95,
                studentCount = "12,200+ Enrolled",
                batchDate = "Starts 20th Oct 2026",
                faculty = "Krishna Kumar (Lead Instructor)",
                category = "Competitive Exams",
                features = listOf(
                    "3000+ Previous Year Questions (PYQs) Solved",
                    "Speed Reading & Comprehension Hacks",
                    "Advanced Grammar Rules with Tricks",
                    "50 Full-Length Exam Mock Tests",
                    "Special Vocab Booster with Mnemonics"
                ),
                subjects = getSubjectsForCourse("course_ssc_banking")
            ),
            Course(
                id = "course_grammar_mastery",
                title = "Complete English Grammar & Writing",
                subtitle = "Zero to Advanced Level for School, College & Competitive Examinations",
                thumbnail = "/images/course_grammar.jpg",
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
                ),
                subjects = getSubjectsForCourse("course_grammar_mastery")
            )
        )
    }

    private fun getDefaultBanners(): List<BannerItem> {
        return listOf(
            BannerItem(
                id = "b_c12",
                title = "Class 12th English Crash Course",
                subtitle = "Target 95+ Marks | BSEB & CBSE Board Exam",
                imageUrl = "/images/course_class12_crash.jpg",
                targetCourseId = "class12-crash-course",
                badge = "⚡ NEW LAUNCH 2026"
            ),
            BannerItem(
                id = "b_spoken",
                title = "Spoken English & Grammar 2026",
                subtitle = "New Foundation Batch Launched • 50% Off",
                imageUrl = "/images/banner1.jpg",
                targetCourseId = "course_spoken_2026",
                badge = "🔥 NEW BATCH"
            ),
            BannerItem(
                id = "b_ssc",
                title = "SSC & Banking English Cracker Batch",
                subtitle = "Target 100% Score in Tier 1 & Tier 2",
                imageUrl = "/images/course_ssc.jpg",
                targetCourseId = "course_ssc_banking",
                badge = "⭐ TOP RATED"
            ),
            BannerItem(
                id = "b_grammar",
                title = "Grammar & Essay Writing Masterclass",
                subtitle = "Zero to Hero • Descriptive & Objective",
                imageUrl = "/images/course_grammar.jpg",
                targetCourseId = "course_grammar_mastery",
                badge = "🎯 SPECIAL"
            )
        )
    }

    private fun parseNotificationsJson(arr: JSONArray): List<AppNotification> {
        val list = mutableListOf<AppNotification>()
        for (i in 0 until arr.length()) {
            val obj = arr.getJSONObject(i)
            val id = obj.optString("id", "notif_$i")
            val title = obj.optString("title", "")
            val desc = obj.optString("description", obj.optString("desc", ""))
            val createdAt = obj.optString("created_at", "Official")
            val time = formatNotificationTime(createdAt)
            if (title.isNotEmpty()) {
                list.add(AppNotification(
                    id = id,
                    title = title,
                    description = desc,
                    time = time,
                    isUnread = true
                ))
            }
        }
        return list
    }

    private fun formatNotificationTime(raw: String): String {
        return if (raw.contains("T")) {
            raw.substringBefore("T")
        } else {
            raw.ifEmpty { "Recently" }
        }
    }

    fun markAllNotificationsAsRead() {
        _notifications.value = _notifications.value.map { it.copy(isUnread = false) }
    }

    private fun getDefaultNotifications(): List<AppNotification> {
        return listOf(
            AppNotification(
                id = "notif_c12_launch",
                title = "⚡ Class 12th English Crash Course Launched!",
                description = "Krishna Kumar Sir has launched the targeted Class 12th English Board Exam 2026 Crash Course. Enroll today at 75% OFF!",
                time = "Today",
                isUnread = true
            ),
            AppNotification(
                id = "notif_welcome",
                title = "Welcome to Smart Study English Classes",
                description = "Download study notes, watch free demo lectures, and connect with Krishna Kumar Sir.",
                time = "Official",
                isUnread = true
            )
        )
    }
}
