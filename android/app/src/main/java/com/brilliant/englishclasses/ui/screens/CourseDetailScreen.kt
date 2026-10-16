package com.brilliant.englishclasses.ui.screens

import android.widget.Toast
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.brilliant.englishclasses.data.AndroidAuthManager
import com.brilliant.englishclasses.data.MockData
import com.brilliant.englishclasses.data.SupabaseRepository
import com.brilliant.englishclasses.model.Chapter
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

    val scrollState = rememberScrollState()
    var isVideoPlayerActive by remember { mutableStateOf(false) }
    var activeVideoId by remember { mutableStateOf("wdaBwIv7Jso") }
    var activeLectureTitle by remember { mutableStateOf(course.title) }
    var showGoogleSignInSheet by remember { mutableStateOf(false) }
    var isEnrolling by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Course Details",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = RoyalBlueDark
                )
            )
        },
        bottomBar = {
            // Sticky Purchase / Access Footer
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
                                isVideoPlayerActive = true
                                Toast.makeText(context, "Resuming course lectures...", Toast.LENGTH_SHORT).show()
                            },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Enrolled • Watch",
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
                                        } else {
                                            Toast.makeText(context, "Enrollment error: $recNo", Toast.LENGTH_SHORT).show()
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
                                text = if (isEnrolling) "Processing..." else "Enroll Now",
                                fontSize = 15.sp,
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
            // 16:9 Thumbnail Header or Anti-Leak YouTube Video Player
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
                        .clickable { isVideoPlayerActive = true }
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

                    // Play Preview Button Overlay
                    Box(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.6f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Watch Free Demo",
                            tint = Color.White,
                            modifier = Modifier.size(34.dp)
                        )
                    }

                    Surface(
                        color = Color.Black.copy(alpha = 0.75f),
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(8.dp)
                    ) {
                        Text(
                            text = "Tap to Play Demo",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp)
            ) {
                if (!isVideoPlayerActive) {
                    OutlinedButton(
                        onClick = { isVideoPlayerActive = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = RoyalBluePrimary)
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayCircle,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Watch Free Demo Lecture",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Text(
                    text = course.title,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A)
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = course.subtitle,
                    fontSize = 13.5.sp,
                    color = Color(0xFF475569),
                    lineHeight = 19.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Stats row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.White)
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "⭐ ${course.rating}", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(text = course.studentCount, fontSize = 11.sp, color = Color(0xFF64748B))
                    }
                    Divider(modifier = Modifier.height(30.dp).width(1.dp))
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "📅 Batch", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(text = course.batchDate, fontSize = 11.sp, color = Color(0xFF64748B))
                    }
                    Divider(modifier = Modifier.height(30.dp).width(1.dp))
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "⏳ Validity", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(text = course.validity, fontSize = 11.sp, color = Color(0xFF64748B))
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Faculty Info Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(RoyalBluePrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = null,
                                tint = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Lead Faculty & Mentor",
                                fontSize = 11.sp,
                                color = Color(0xFF64748B)
                            )
                            Text(
                                text = course.faculty,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF0F172A)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // COURSE SYLLABUS & CHAPTERS (MATCHING THE BROWSER APP)
                if (course.subjects.isNotEmpty()) {
                    Text(
                        text = "📖 Course Syllabus & Study Materials",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A)
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    course.subjects.forEach { subject ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(text = subject.icon, fontSize = 18.sp)
                                    Text(
                                        text = subject.name,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF1E293B)
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))

                                subject.chapters.forEach { chapter ->
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = Color(0xFFF8FAFC),
                                        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 3.dp)
                                    ) {
                                        Column(modifier = Modifier.padding(10.dp)) {
                                            Text(
                                                text = chapter.title,
                                                fontSize = 12.5.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = Color(0xFF0F172A)
                                            )
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Row(
                                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                                            ) {
                                                Text(
                                                    text = "🎥 ${chapter.lectures.size} Lectures",
                                                    fontSize = 11.sp,
                                                    color = RoyalBluePrimary
                                                )
                                                Text(
                                                    text = "📑 ${chapter.pdfs.size} PDFs",
                                                    fontSize = 11.sp,
                                                    color = Color(0xFF059669)
                                                )
                                                Text(
                                                    text = "📝 ${chapter.practices.size} Tests",
                                                    fontSize = 11.sp,
                                                    color = Color(0xFF7C3AED)
                                                )
                                            }

                                            // Lecture play click
                                            chapter.lectures.firstOrNull()?.let { lec ->
                                                Spacer(modifier = Modifier.height(6.dp))
                                                TextButton(
                                                    onClick = {
                                                        activeVideoId = lec.videoId
                                                        activeLectureTitle = lec.title
                                                        isVideoPlayerActive = true
                                                    },
                                                    contentPadding = PaddingValues(0.dp)
                                                ) {
                                                    Text(
                                                        text = "▶ Play Lecture: ${lec.title}",
                                                        fontSize = 11.5.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        color = RoyalBluePrimary
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // What You Will Get / Features
                Text(
                    text = "What's Included in this Course:",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A)
                )

                Spacer(modifier = Modifier.height(10.dp))

                course.features.forEach { feature ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = feature,
                            fontSize = 13.sp,
                            color = Color(0xFF334155),
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Spacer(modifier = Modifier.height(30.dp))
            }
        }
    }

    if (showGoogleSignInSheet) {
        GoogleSignInSheet(
            onDismiss = { showGoogleSignInSheet = false },
            onSuccess = { showGoogleSignInSheet = false }
        )
    }
}
