package com.brilliant.englishclasses.ui.screens

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.brilliant.englishclasses.data.AndroidAuthManager
import com.brilliant.englishclasses.data.MockData
import com.brilliant.englishclasses.data.SupabaseRepository
import com.brilliant.englishclasses.model.Chapter
import com.brilliant.englishclasses.model.LectureItem
import com.brilliant.englishclasses.model.PdfItem
import com.brilliant.englishclasses.model.PracticeItem
import com.brilliant.englishclasses.model.Subject
import com.brilliant.englishclasses.ui.components.GoogleSignInSheet
import com.brilliant.englishclasses.ui.components.SecureYouTubePlayer
import com.brilliant.englishclasses.ui.theme.AmberAccent
import com.brilliant.englishclasses.ui.theme.RoyalBlueDark
import com.brilliant.englishclasses.ui.theme.RoyalBluePrimary
import com.brilliant.englishclasses.ui.theme.SuccessGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CourseDetailScreen(
    courseId: String,
    onBackClick: () -> Unit = {}
) {
    val context = LocalContext.current
    val course = SupabaseRepository.getCourseById(courseId)
        ?: SupabaseRepository.courses.value.firstOrNull()
        ?: MockData.featuredCourses.first()

    val currentUser by AndroidAuthManager.currentUser
    val enrolledIds by SupabaseRepository.enrolledCourseIds
    val isEnrolled = enrolledIds.contains(course.id)

    // Two main sections: "description" and "study"
    // Non-enrolled opens in "description", enrolled opens in "study"
    var activeMainSection by remember(isEnrolled) {
        mutableStateOf(if (isEnrolled) "study" else "description")
    }

    // Inside Study section: selected Subject (null = list of subjects)
    var selectedSubject by remember { mutableStateOf<Subject?>(null) }
    // Inside Subject view: switchable sub-tabs ("lectures" or "notes" or "practice")
    var activeSubjectSubTab by remember { mutableStateOf("lectures") }

    val scrollState = rememberScrollState()
    var isVideoPlayerActive by remember { mutableStateOf(false) }
    var activeVideoId by remember { mutableStateOf(course.introVideoId) }
    var activeLectureTitle by remember { mutableStateOf("${course.title} (Intro Video)") }
    var showGoogleSignInSheet by remember { mutableStateOf(false) }
    var isEnrolling by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = course.title,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            maxLines = 1
                        )
                        Text(
                            text = if (isEnrolled) "Enrolled • Active Access" else "Official Batch Portal",
                            fontSize = 11.sp,
                            color = if (isEnrolled) AmberAccent else Color(0xFFCBD5E1)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = {
                        if (selectedSubject != null) {
                            selectedSubject = null
                        } else {
                            onBackClick()
                        }
                    }) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                actions = {
                    if (isEnrolled) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = SuccessGreen,
                            modifier = Modifier.padding(end = 12.dp)
                        ) {
                            Text(
                                text = "ENROLLED",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = RoyalBlueDark
                )
            )
        },
        bottomBar = {
            // Sticky Purchase / Access Bottom Bar
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(elevation = 16.dp),
                color = Color.White
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "₹${course.discountPrice}",
                                fontSize = 22.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF0F172A)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "₹${course.originalPrice}",
                                fontSize = 14.sp,
                                color = Color(0xFF94A3B8),
                                textDecoration = TextDecoration.LineThrough
                            )
                        }
                        Text(
                            text = "${course.discountPercentage}% Special Discount",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF16A34A)
                        )
                    }

                    if (isEnrolled) {
                        Button(
                            onClick = {
                                activeMainSection = "study"
                                Toast.makeText(context, "Opening Study section...", Toast.LENGTH_SHORT).show()
                            },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
                        ) {
                            Icon(
                                imageVector = Icons.Default.MenuBook,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Study Batch →",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    } else {
                        Button(
                            onClick = {
                                val user = currentUser
                                if (user == null) {
                                    Toast.makeText(context, "Please sign in to enroll", Toast.LENGTH_SHORT).show()
                                    showGoogleSignInSheet = true
                                } else {
                                    isEnrolling = true
                                    SupabaseRepository.enrollUser(user.id, course.id, course.discountPrice) { success, recNo ->
                                        isEnrolling = false
                                        if (success) {
                                            Toast.makeText(context, "🎉 Enrolled in ${course.title}! (Receipt #$recNo)", Toast.LENGTH_LONG).show()
                                            activeMainSection = "study"
                                        } else {
                                            Toast.makeText(context, "Enrollment: $recNo", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                }
                            },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary),
                            enabled = !isEnrolling
                        ) {
                            Icon(
                                imageVector = Icons.Default.Bolt,
                                contentDescription = null,
                                tint = AmberAccent,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isEnrolling) "Enrolling..." else "Enroll Now • ₹${course.discountPrice}",
                                fontSize = 14.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFFF8FAFC))
                .verticalScroll(scrollState)
        ) {
            // 1. VIDEO PLAYER OR 16:9 INTRO BANNER
            if (isVideoPlayerActive) {
                SecureYouTubePlayer(
                    videoId = activeVideoId,
                    lectureTitle = activeLectureTitle,
                    isLive = false
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(16f / 9f)
                        .clickable {
                            activeVideoId = course.introVideoId
                            activeLectureTitle = "${course.title} (Intro Video)"
                            isVideoPlayerActive = true
                        }
                ) {
                    AsyncImage(
                        model = ImageRequest.Builder(LocalContext.current)
                            .data(SupabaseRepository.resolveImageUrl(course.thumbnail))
                            .crossfade(true)
                            .build(),
                        contentDescription = course.title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )

                    // Frosted Play Intro Overlay
                    Box(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.65f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Watch Intro Video",
                            tint = Color.White,
                            modifier = Modifier.size(36.dp)
                        )
                    }

                    Surface(
                        color = Color.Black.copy(alpha = 0.8f),
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(10.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(text = "▶", fontSize = 10.sp, color = AmberAccent)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Watch Intro Video",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            // 2. MAIN SECTION SWITCHER: "Description" vs "Study"
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                shape = RoundedCornerShape(14.dp),
                color = Color(0xFFE2E8F0).copy(alpha = 0.6f)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(4.dp)
                ) {
                    // Description Tab Button
                    val isDescActive = activeMainSection == "description"
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(42.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isDescActive) Color.White else Color.Transparent)
                            .clickable {
                                activeMainSection = "description"
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(text = "📋", fontSize = 14.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Description",
                                fontSize = 13.5.sp,
                                fontWeight = if (isDescActive) FontWeight.Bold else FontWeight.Medium,
                                color = if (isDescActive) RoyalBluePrimary else Color(0xFF64748B)
                            )
                        }
                    }

                    // Study Tab Button
                    val isStudyActive = activeMainSection == "study"
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(42.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isStudyActive) Color.White else Color.Transparent)
                            .clickable {
                                activeMainSection = "study"
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(text = if (isEnrolled) "📚" else "🔒", fontSize = 14.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Study Section",
                                fontSize = 13.5.sp,
                                fontWeight = if (isStudyActive) FontWeight.Bold else FontWeight.Medium,
                                color = if (isStudyActive) RoyalBluePrimary else Color(0xFF64748B)
                            )
                            if (isEnrolled) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Box(
                                    modifier = Modifier
                                        .size(7.dp)
                                        .clip(CircleShape)
                                        .background(SuccessGreen)
                                )
                            }
                        }
                    }
                }
            }

            // 3. SECTION 1: DESCRIPTION CONTENT
            if (activeMainSection == "description") {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp)
                ) {
                    // Meta Pill Badges: Start Date & Validity
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.White)
                            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                            .padding(horizontal = 14.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "📅 START DATE",
                                fontSize = 9.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF94A3B8)
                            )
                            Text(
                                text = course.batchDate,
                                fontSize = 12.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF0F172A)
                            )
                        }

                        Divider(
                            modifier = Modifier
                                .height(26.dp)
                                .width(1.dp),
                            color = Color(0xFFE2E8F0)
                        )

                        Column {
                            Text(
                                text = "⏳ VALIDITY TILL",
                                fontSize = 9.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF94A3B8)
                            )
                            Text(
                                text = course.validity,
                                fontSize = 12.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = RoyalBluePrimary
                            )
                        }

                        Divider(
                            modifier = Modifier
                                .height(26.dp)
                                .width(1.dp),
                            color = Color(0xFFE2E8F0)
                        )

                        Column {
                            Text(
                                text = "⭐ RATING",
                                fontSize = 9.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF94A3B8)
                            )
                            Text(
                                text = "${course.rating} / 5",
                                fontSize = 12.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFD97706)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Course Title
                    Text(
                        text = course.title,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF0F172A),
                        lineHeight = 26.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = course.subtitle,
                        fontSize = 13.sp,
                        color = Color(0xFF64748B),
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Description in Bullet Points
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(text = "📌", fontSize = 16.sp)
                                Text(
                                    text = "Batch Overview & Syllabus",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0F172A)
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            val bulletPoints = if (course.descriptionPoints.isNotEmpty()) {
                                course.descriptionPoints
                            } else listOf(
                                "Complete syllabus coverage aligned with latest board and exam patterns",
                                "Special focus on high scoring questions, vocabulary & grammar rules",
                                "Concept building from ground level with bilingual Hindi-English explanation",
                                "Regular practice sheets and model papers with step-by-step solutions"
                            )

                            bulletPoints.forEach { point ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp),
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .padding(top = 6.dp)
                                            .size(6.dp)
                                            .clip(CircleShape)
                                            .background(RoyalBluePrimary)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = point,
                                        fontSize = 12.5.sp,
                                        color = Color(0xFF334155),
                                        lineHeight = 18.sp
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Teacher Profile & Experience Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .clip(CircleShape)
                                    .background(
                                        Brush.linearGradient(
                                            listOf(RoyalBlueDark, RoyalBluePrimary)
                                        )
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "👨‍🏫", fontSize = 24.sp)
                            }

                            Spacer(modifier = Modifier.width(14.dp))

                            Column {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = Color(0xFFEFF6FF)
                                ) {
                                    Text(
                                        text = "FACULTY & MENTOR",
                                        fontSize = 9.5.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = RoyalBluePrimary,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = course.faculty,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color(0xFF0F172A)
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Experience: ${course.facultyExperience}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFF16A34A)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // "What You Will Get" Section
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(text = "🎁", fontSize = 16.sp)
                                Text(
                                    text = "What You Will Get In This Batch",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0F172A)
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            course.features.forEach { feature ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.5.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Surface(
                                        shape = CircleShape,
                                        color = Color(0xFFDCFCE7),
                                        modifier = Modifier.size(20.dp)
                                    ) {
                                        Box(contentAlignment = Alignment.Center) {
                                            Text(text = "✓", color = Color(0xFF16A34A), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = feature,
                                        fontSize = 12.5.sp,
                                        color = Color(0xFF334155),
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(28.dp))
                }
            }

            // 4. SECTION 2: STUDY CONTENT (SUBJECTS -> LECTURES & NOTES)
            if (activeMainSection == "study") {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp)
                ) {
                    if (!isEnrolled) {
                        // Locked State Card for non-enrolled user
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = BorderStroke(1.dp, Color(0xFFCBD5E1))
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(60.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFFFEF3C7)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(text = "🔒", fontSize = 28.sp)
                                }

                                Spacer(modifier = Modifier.height(14.dp))

                                Text(
                                    text = "Study Material is Locked",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0F172A)
                                )

                                Spacer(modifier = Modifier.height(6.dp))

                                Text(
                                    text = "Enroll in ${course.title} to unlock all live lectures, chapter videos, and downloadable PDF notes.",
                                    fontSize = 12.5.sp,
                                    color = Color(0xFF64748B),
                                    textAlign = TextAlign.Center,
                                    lineHeight = 18.sp
                                )

                                Spacer(modifier = Modifier.height(18.dp))

                                Button(
                                    onClick = {
                                        val user = currentUser
                                        if (user == null) {
                                            showGoogleSignInSheet = true
                                        } else {
                                            isEnrolling = true
                                            SupabaseRepository.enrollUser(user.id, course.id, course.discountPrice) { success, recNo ->
                                                isEnrolling = false
                                                if (success) {
                                                    Toast.makeText(context, "🎉 Enrolled in ${course.title}!", Toast.LENGTH_SHORT).show()
                                                    activeMainSection = "study"
                                                }
                                            }
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Text(
                                        text = "Unlock Study Content • ₹${course.discountPrice}",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp
                                    )
                                }
                            }
                        }
                    } else if (selectedSubject == null) {
                        // ALL SUBJECTS LIST
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "📚 Batch Subjects",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF0F172A)
                            )
                            Text(
                                text = "${course.subjects.size} Subjects Available",
                                fontSize = 11.5.sp,
                                color = Color(0xFF64748B)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        if (course.subjects.isEmpty()) {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = Color.White)
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(24.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(text = "📖", fontSize = 28.sp)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "Curriculum syncing from cloud...",
                                        fontSize = 13.sp,
                                        color = Color(0xFF64748B)
                                    )
                                }
                            }
                        } else {
                            course.subjects.forEach { subject ->
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 6.dp)
                                        .clickable {
                                            selectedSubject = subject
                                            activeSubjectSubTab = "lectures"
                                        },
                                    shape = RoundedCornerShape(14.dp),
                                    colors = CardDefaults.cardColors(containerColor = Color.White),
                                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                                ) {
                                    Row(
                                        modifier = Modifier.padding(16.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(46.dp)
                                                .clip(CircleShape)
                                                .background(Color(0xFFEFF6FF)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(text = subject.icon, fontSize = 22.sp)
                                        }

                                        Spacer(modifier = Modifier.width(14.dp))

                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = subject.name,
                                                fontSize = 14.5.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFF0F172A)
                                            )
                                            Spacer(modifier = Modifier.height(4.dp))
                                            val totalLecs = subject.chapters.sumOf { it.lectures.size }
                                            val totalPdfs = subject.chapters.sumOf { it.pdfs.size }
                                            Text(
                                                text = "$totalLecs Lectures • $totalPdfs PDF Notes",
                                                fontSize = 11.5.sp,
                                                color = Color(0xFF64748B)
                                            )
                                        }

                                        Icon(
                                            imageVector = Icons.Default.ChevronRight,
                                            contentDescription = "Open",
                                            tint = RoyalBluePrimary
                                        )
                                    }
                                }
                            }
                        }
                    } else {
                        // SINGLE SUBJECT DETAIL: LECTURES & NOTES TABS
                        val subject = selectedSubject!!

                        // Header with Back to Subjects
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { selectedSubject = null }
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.ArrowBack,
                                contentDescription = "Back",
                                tint = RoyalBluePrimary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "All Subjects",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = RoyalBluePrimary
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "${subject.icon} ${subject.name}",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFF0F172A)
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // Switchable Sub-Tabs: Lectures vs Notes (Only one active at a time!)
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFFE2E8F0)
                        ) {
                            Row(modifier = Modifier.padding(3.dp)) {
                                val isLecTab = activeSubjectSubTab == "lectures"
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(36.dp)
                                        .clip(RoundedCornerShape(9.dp))
                                        .background(if (isLecTab) Color.White else Color.Transparent)
                                        .clickable { activeSubjectSubTab = "lectures" },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "🎥 Lectures",
                                        fontSize = 12.5.sp,
                                        fontWeight = if (isLecTab) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isLecTab) RoyalBluePrimary else Color(0xFF64748B)
                                    )
                                }

                                val isNotesTab = activeSubjectSubTab == "notes"
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(36.dp)
                                        .clip(RoundedCornerShape(9.dp))
                                        .background(if (isNotesTab) Color.White else Color.Transparent)
                                        .clickable { activeSubjectSubTab = "notes" },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "📑 Notes & PDFs",
                                        fontSize = 12.5.sp,
                                        fontWeight = if (isNotesTab) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isNotesTab) RoyalBluePrimary else Color(0xFF64748B)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // SUB-TAB 1: LECTURES
                        if (activeSubjectSubTab == "lectures") {
                            val allLectures = subject.chapters.flatMap { ch ->
                                ch.lectures.map { lec -> Pair(ch.title, lec) }
                            }

                            if (allLectures.isEmpty()) {
                                Text(
                                    text = "No video lectures uploaded yet for this subject.",
                                    fontSize = 12.sp,
                                    color = Color(0xFF94A3B8),
                                    modifier = Modifier.padding(vertical = 16.dp)
                                )
                            } else {
                                allLectures.forEach { (chapterTitle, lec) ->
                                    Card(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 4.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        colors = CardDefaults.cardColors(containerColor = Color.White),
                                        border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(12.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(40.dp)
                                                    .clip(CircleShape)
                                                    .background(Color(0xFFEFF6FF)),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.PlayArrow,
                                                    contentDescription = "Play",
                                                    tint = RoyalBluePrimary,
                                                    modifier = Modifier.size(22.dp)
                                                )
                                            }

                                            Spacer(modifier = Modifier.width(12.dp))

                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(
                                                    text = lec.title,
                                                    fontSize = 13.5.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color(0xFF0F172A)
                                                )
                                                Spacer(modifier = Modifier.height(2.dp))
                                                Text(
                                                    text = "$chapterTitle • ⏱ ${lec.duration}",
                                                    fontSize = 11.sp,
                                                    color = Color(0xFF64748B)
                                                )
                                            }

                                            Button(
                                                onClick = {
                                                    activeVideoId = lec.videoId
                                                    activeLectureTitle = lec.title
                                                    isVideoPlayerActive = true
                                                    Toast.makeText(context, "Playing: ${lec.title}", Toast.LENGTH_SHORT).show()
                                                },
                                                shape = RoundedCornerShape(8.dp),
                                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                                                colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary)
                                            ) {
                                                Text(text = "Play", fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // SUB-TAB 2: NOTES & PDFS
                        if (activeSubjectSubTab == "notes") {
                            val allPdfs = subject.chapters.flatMap { ch ->
                                ch.pdfs.map { pdf -> Pair(ch.title, pdf) }
                            }

                            if (allPdfs.isEmpty()) {
                                Text(
                                    text = "No PDF notes or materials uploaded yet for this subject.",
                                    fontSize = 12.sp,
                                    color = Color(0xFF94A3B8),
                                    modifier = Modifier.padding(vertical = 16.dp)
                                )
                            } else {
                                allPdfs.forEach { (chapterTitle, pdf) ->
                                    Card(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 4.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        colors = CardDefaults.cardColors(containerColor = Color.White),
                                        border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(12.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(40.dp)
                                                    .clip(CircleShape)
                                                    .background(Color(0xFFFEF2F2)),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.PictureAsPdf,
                                                    contentDescription = "PDF",
                                                    tint = Color(0xFFDC2626),
                                                    modifier = Modifier.size(20.dp)
                                                )
                                            }

                                            Spacer(modifier = Modifier.width(12.dp))

                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(
                                                    text = pdf.title,
                                                    fontSize = 13.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color(0xFF0F172A)
                                                )
                                                Spacer(modifier = Modifier.height(2.dp))
                                                Text(
                                                    text = "$chapterTitle • ${pdf.pages} • ${pdf.size}",
                                                    fontSize = 11.sp,
                                                    color = Color(0xFF64748B)
                                                )
                                            }

                                            OutlinedButton(
                                                onClick = {
                                                    if (pdf.url.isNotEmpty()) {
                                                        try {
                                                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(pdf.url))
                                                            context.startActivity(intent)
                                                        } catch (e: Exception) {
                                                            Toast.makeText(context, "Cannot open PDF: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                                                        }
                                                    } else {
                                                        Toast.makeText(context, "Opening notes: ${pdf.title}", Toast.LENGTH_SHORT).show()
                                                    }
                                                },
                                                shape = RoundedCornerShape(8.dp),
                                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                                            ) {
                                                Text(text = "View PDF", fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }

    if (showGoogleSignInSheet) {
        GoogleSignInSheet(
            onDismiss = { showGoogleSignInSheet = false },
            onSuccess = { user ->
                showGoogleSignInSheet = false
            }
        )
    }
}
