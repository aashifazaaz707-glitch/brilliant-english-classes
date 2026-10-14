package com.brilliant.englishclasses.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.brilliant.englishclasses.ui.components.AppBottomBar
import com.brilliant.englishclasses.ui.theme.*

@Composable
fun MyBatchesScreen(
    onCourseClick: (String) -> Unit = {},
    onTabSelected: (String) -> Unit = {}
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
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
                                text = "2 ACTIVE",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Enrolled Student: Aman Sharma (SSE-2026-8492)",
                        fontSize = 12.sp,
                        color = Color(0xFFE0E7FF)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 2. FILTER PILLS
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(
                    "all" to "All Batches (2)",
                    "spoken" to "Spoken English",
                    "ssc" to "SSC & Banking",
                    "routine" to "Timetable"
                ).forEach { (key, label) ->
                    val isSelected = selectedFilter == key
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (isSelected) RoyalBluePrimary else Color.White,
                        border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E8F0)),
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
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBFDBFE))
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
                            text = "Weekly live speaking practice & spoken debate test scheduled for Sunday 10:00 AM (Classroom + App Live). Please review Vocabulary Handout #4.",
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

            // 4. BATCH 1: SPOKEN ENGLISH MASTERY 2026
            if (selectedFilter == "all" || selectedFilter == "spoken") {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
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
                                    text = "SPOKEN ENGLISH 2026",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = RoyalBluePrimary,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                            Text(
                                text = "64% COMPLETED",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = SuccessGreen
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "Spoken English Mastery Batch 2026",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0F172A)
                        )
                        Text(
                            text = "Lead Faculty: Krishna Kumar (Madhepur Center)",
                            fontSize = 12.sp,
                            color = Color(0xFF64748B)
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Progress Bar
                        LinearProgressIndicator(
                            progress = 0.64f,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = RoyalBluePrimary,
                            trackColor = Color(0xFFE2E8F0)
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "18 of 28 Lectures Watched",
                                fontSize = 11.sp,
                                color = Color(0xFF64748B)
                            )
                            Text(
                                text = "Next: Day 19 Accent Drill",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = RoyalBluePrimary
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Action Buttons
                        Button(
                            onClick = {
                                Toast.makeText(context, "Resuming Lecture 19...", Toast.LENGTH_SHORT).show()
                                onCourseClick("course_spoken_2026")
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary)
                        ) {
                            Text(text = "▶ Resume Lecture 19", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = { onCourseClick("course_spoken_2026") },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(text = "📖 28 Lectures", fontSize = 11.sp, color = Color(0xFF334155))
                            }
                            OutlinedButton(
                                onClick = { Toast.makeText(context, "Opening 14 PDF Handouts...", Toast.LENGTH_SHORT).show() },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(text = "📑 14 PDF Notes", fontSize = 11.sp, color = Color(0xFF334155))
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // 5. BATCH 2: SSC & BANKING ENGLISH 2026
            if (selectedFilter == "all" || selectedFilter == "ssc") {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = AlertRed.copy(alpha = 0.12f)
                            ) {
                                Text(
                                    text = "🔴 LIVE TODAY 5 PM",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = AlertRed,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                            Text(
                                text = "38% COMPLETED",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = RoyalBluePrimary
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "Complete SSC & Banking English 2026",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0F172A)
                        )
                        Text(
                            text = "Mentor: Krishna Kumar Sir",
                            fontSize = 12.sp,
                            color = Color(0xFF64748B)
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        LinearProgressIndicator(
                            progress = 0.38f,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = Color(0xFF2563EB),
                            trackColor = Color(0xFFE2E8F0)
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "12 of 32 Lectures Completed",
                                fontSize = 11.sp,
                                color = Color(0xFF64748B)
                            )
                            Text(
                                text = "Topic: Direct & Indirect Rules",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = AlertRed
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Button(
                            onClick = {
                                Toast.makeText(context, "Connecting to 5:00 PM Live Classroom...", Toast.LENGTH_SHORT).show()
                                onCourseClick("course_ssc_banking")
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48))
                        ) {
                            Text(text = "🔴 Join Live Session at 05:00 PM", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = { onCourseClick("course_ssc_banking") },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(text = "📖 32 Lectures", fontSize = 11.sp, color = Color(0xFF334155))
                            }
                            OutlinedButton(
                                onClick = { Toast.makeText(context, "Opening SSC PYQ Handouts...", Toast.LENGTH_SHORT).show() },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(text = "📑 18 Handouts", fontSize = 11.sp, color = Color(0xFF334155))
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 6. CLASS ROUTINE & TIMETABLE
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
                        title = "SSC & Bank PO Grammar (Live)",
                        time = "05:00 PM - 06:30 PM",
                        desc = "Hall 2 + Live Video Stream in App • Rules & PYQ"
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    TimetableRow(
                        num = "3",
                        title = "Sunday Mega Mock & Debate",
                        time = "10:00 AM - 01:00 PM",
                        desc = "Weekly District Rank Test & Doubt Clearing"
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 7. OFFLINE CLASSROOM CENTER CARD
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
