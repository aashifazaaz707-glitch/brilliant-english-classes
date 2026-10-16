package com.brilliant.englishclasses.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.brilliant.englishclasses.data.AndroidAuthManager
import com.brilliant.englishclasses.data.SupabaseRepository
import com.brilliant.englishclasses.model.Course
import com.brilliant.englishclasses.ui.components.AppBottomBar
import com.brilliant.englishclasses.ui.components.GoogleColoredIcon
import com.brilliant.englishclasses.ui.components.GoogleSignInSheet
import com.brilliant.englishclasses.ui.theme.*

@Composable
fun MyBatchesScreen(
    onCourseClick: (String) -> Unit = {},
    onTabSelected: (String) -> Unit = {}
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    val currentUser by AndroidAuthManager.currentUser
    val enrolledCourses = SupabaseRepository.getEnrolledCourses()
    val enrolledCourseIds by SupabaseRepository.enrolledCourseIds
    val isLoading by SupabaseRepository.isLoading
    var showGoogleSignInSheet by remember { mutableStateOf(false) }
    var selectedFilter by remember { mutableStateOf("all") }

    Scaffold(
        bottomBar = {
            AppBottomBar(
                currentRoute = "my_batches",
                onTabSelected = onTabSelected
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    val intent = Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("https://wa.me/919876543210?text=Hello%20Krishna%20Kumar%20Sir,%20I%20have%20a%20doubt%20in%20today's%20batch.")
                    )
                    context.startActivity(intent)
                },
                containerColor = Color(0xFF25D366),
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Chat,
                    contentDescription = "Batch Helpdesk",
                    modifier = Modifier.size(28.dp)
                )
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
            // 1. SUBPAGE HEADER
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(RoyalBlueDark, RoyalBluePrimary)
                        ),
                        shape = RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp)
                    )
                    .padding(horizontal = 20.dp, vertical = 20.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "My Batches & Learning 📚",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = Color.White.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = if (currentUser != null) "${enrolledCourses.size} ENROLLED" else "GUEST",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (currentUser != null)
                            "Student: ${currentUser!!.fullName} (${currentUser!!.rollId})"
                        else
                            "Sign in with Google to view your enrolled courses & video classes",
                        fontSize = 12.sp,
                        color = Color(0xFFE0E7FF)
                    )
                }
            }

            if (currentUser == null) {
                // GUEST STATE - PROMINENT LOGIN CARD
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(26.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFEFF6FF)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "🔐", fontSize = 26.sp)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Student Login Required",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFF0F172A)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Please sign in with your Google account to access your enrolled batches, video lectures, and study notes.",
                            fontSize = 12.5.sp,
                            color = Color(0xFF64748B),
                            textAlign = TextAlign.Center,
                            lineHeight = 18.sp
                        )
                        Spacer(modifier = Modifier.height(18.dp))
                        Button(
                            onClick = { showGoogleSignInSheet = true },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                            border = BorderStroke(1.dp, Color(0xFFDADCE0)),
                            elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                GoogleColoredIcon(modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "Sign In with Google",
                                    color = Color(0xFF3C4043),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 2. FILTER PILLS
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(
                    "all" to "All Enrolled (${enrolledCourses.size})",
                    "c12" to "Class 12th Board",
                    "spoken" to "Spoken English",
                    "routine" to "Timetable"
                ).forEach { (key, label) ->
                    val isSelected = selectedFilter == key
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (isSelected) RoyalBluePrimary else Color.White,
                        border = if (isSelected) null else BorderStroke(1.dp, Color(0xFFE2E8F0)),
                        modifier = Modifier.clickable { selectedFilter = key }
                    ) {
                        Text(
                            text = label,
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) Color.White else Color(0xFF475569),
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 3. FACULTY ANNOUNCEMENT CARD
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF6FF)),
                border = BorderStroke(1.dp, Color(0xFFBFDBFE))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(text = "📢", fontSize = 18.sp)
                    Column {
                        Text(
                            text = "Teacher's Announcement:",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1E3A8A)
                        )
                        Text(
                            text = "Live speaking practice & Rainbow English chapter quiz every Sunday at 10:00 AM. Study materials are updated in the batch section.",
                            fontSize = 11.5.sp,
                            color = Color(0xFF1E40AF),
                            lineHeight = 16.sp
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "— Krishna Kumar Sir",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = RoyalBluePrimary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 4. REAL DYNAMIC ENROLLED BATCHES (FROM SUPABASE)
            if (currentUser != null) {
                val filteredCourses = enrolledCourses.filter { course ->
                    when (selectedFilter) {
                        "c12" -> course.category.contains("12", ignoreCase = true) || course.id.contains("c12", ignoreCase = true) || course.id.contains("crash", ignoreCase = true)
                        "spoken" -> course.category.contains("spoken", ignoreCase = true) || course.id.contains("spoken", ignoreCase = true)
                        else -> true
                    }
                }

                if (enrolledCourses.isEmpty()) {
                    // EMPTY ENROLLMENTS STATE (MATCHING THE BROWSER APP)
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 6.dp),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(28.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(56.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFF0FDF4)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "🎓", fontSize = 26.sp)
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No Active Batches Enrolled",
                                fontSize = 17.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF0F172A)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "You haven't enrolled in any course yet. Explore our Class 12th Board Crash Course and Spoken English batches to start learning!",
                                fontSize = 12.5.sp,
                                color = Color(0xFF64748B),
                                textAlign = TextAlign.Center,
                                lineHeight = 18.sp
                            )
                            Spacer(modifier = Modifier.height(18.dp))
                            Button(
                                onClick = { onTabSelected("home") },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(46.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary)
                            ) {
                                Text(text = "⚡ Browse All Courses", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                        }
                    }
                } else {
                    // RENDER REAL ENROLLED BATCHES DYNAMICALLY
                    filteredCourses.forEach { course ->
                        EnrolledBatchCard(
                            course = course,
                            onCourseClick = onCourseClick
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // 5. CLASS ROUTINE & TIMETABLE
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "📅 Daily Class Routine & Timetable",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A)
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    TimetableRow(
                        num = "1",
                        title = "Morning Spoken English & GD",
                        time = "07:00 AM - 08:30 AM",
                        desc = "Hall 1, Madhepur Center • Speaking practice with Krishna Kumar Sir"
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    TimetableRow(
                        num = "2",
                        title = "Class 12th Board Crash Course (Live)",
                        time = "05:00 PM - 06:30 PM",
                        desc = "Hall 2 + Live Video Stream in App • Rainbow Prose, Poetry & Grammar"
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    TimetableRow(
                        num = "3",
                        title = "Sunday Mega Mock & Debate",
                        time = "10:00 AM - 01:00 PM",
                        desc = "Weekly District Rank Test & Live Doubt Clearing"
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 6. OFFLINE CLASSROOM CENTER CARD
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(text = "🏛️", fontSize = 16.sp)
                        Text(
                            text = "Smart Study English Classes Center",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0F172A)
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Lead Faculty: Krishna Kumar",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = RoyalBluePrimary
                    )
                    Text(
                        text = "Address: NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR",
                        fontSize = 11.5.sp,
                        color = Color(0xFF475569),
                        lineHeight = 16.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "✓ Please carry your Student ID / Digital Fee Receipt for offline attendance.",
                        fontSize = 11.sp,
                        color = SuccessGreen,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))
        }
    }

    if (showGoogleSignInSheet) {
        GoogleSignInSheet(
            onDismiss = { showGoogleSignInSheet = false },
            onSuccess = { showGoogleSignInSheet = false }
        )
    }
}

@Composable
fun EnrolledBatchCard(
    course: Course,
    onCourseClick: (String) -> Unit
) {
    val context = LocalContext.current
    val totalLectures = course.subjects.sumOf { s -> s.chapters.sumOf { c -> c.lectures.size } }
    val totalPdfs = course.subjects.sumOf { s -> s.chapters.sumOf { c -> c.pdfs.size } }
    val totalTests = course.subjects.sumOf { s -> s.chapters.sumOf { c -> c.practices.size } }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header: Category Pill & Active Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = RoyalBluePrimary.copy(alpha = 0.12f)
                ) {
                    Text(
                        text = course.category.uppercase(),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = RoyalBluePrimary,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = Color(0xFFECFDF5)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "● ", color = SuccessGreen, fontSize = 9.sp)
                        Text(
                            text = "ENROLLED & ACTIVE",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = SuccessGreen
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Course Title & Faculty
            Text(
                text = course.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A),
                lineHeight = 20.sp
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "Mentor: ${course.faculty}",
                fontSize = 12.sp,
                color = Color(0xFF64748B)
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Progress Bar
            LinearProgressIndicator(
                progress = 0.50f,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = SuccessGreen,
                trackColor = Color(0xFFE2E8F0)
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "📚 ${course.subjects.size} Subjects • 🎥 $totalLectures Lectures",
                    fontSize = 11.sp,
                    color = Color(0xFF64748B)
                )
                Text(
                    text = "📑 $totalPdfs Notes • 📝 $totalTests Tests",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = RoyalBluePrimary
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action Buttons
            Button(
                onClick = {
                    onCourseClick(course.id)
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
            ) {
                Text(text = "⚡ Continue Learning →", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = { onCourseClick(course.id) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(text = "📖 Chapters (${course.subjects.size})", fontSize = 11.sp, color = Color(0xFF334155))
                }
                OutlinedButton(
                    onClick = {
                        Toast.makeText(context, "Opening study notes for ${course.title}...", Toast.LENGTH_SHORT).show()
                        onCourseClick(course.id)
                    },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(text = "📑 $totalPdfs PDF Notes", fontSize = 11.sp, color = Color(0xFF334155))
                }
            }
        }
    }
}

@Composable
fun TimetableRow(num: String, title: String, time: String, desc: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Surface(
            shape = CircleShape,
            color = RoyalBluePrimary.copy(alpha = 0.12f),
            modifier = Modifier.size(26.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text(text = num, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = RoyalBluePrimary)
            }
        }
        Column(modifier = Modifier.weight(1f)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = title, fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                Text(text = time, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = RoyalBluePrimary)
            }
            Text(text = desc, fontSize = 11.sp, color = Color(0xFF64748B))
        }
    }
}
