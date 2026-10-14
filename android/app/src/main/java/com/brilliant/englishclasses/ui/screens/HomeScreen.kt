package com.brilliant.englishclasses.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.brilliant.englishclasses.data.MockData
import com.brilliant.englishclasses.model.Course
import com.brilliant.englishclasses.model.QuickActionItem
import com.brilliant.englishclasses.model.QuickActionType
import com.brilliant.englishclasses.ui.components.*
import com.brilliant.englishclasses.ui.theme.AmberAccent
import com.brilliant.englishclasses.ui.theme.RoyalBlueDark
import com.brilliant.englishclasses.ui.theme.RoyalBluePrimary

@Composable
fun HomeScreen(
    onCourseClick: (String) -> Unit = {},
    onNotificationClick: () -> Unit = {},
    onSearchClick: () -> Unit = {},
    onTabSelected: (String) -> Unit = {}
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    fun handleQuickAction(item: QuickActionItem) {
        when (item.type) {
            QuickActionType.MY_COURSES -> {
                onTabSelected("my_batches")
            }
            QuickActionType.YOUTUBE -> {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(item.externalUrl ?: "https://youtube.com"))
                context.startActivity(intent)
            }
            QuickActionType.INSTAGRAM -> {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(item.externalUrl ?: "https://instagram.com"))
                context.startActivity(intent)
            }
            QuickActionType.FACEBOOK -> {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(item.externalUrl ?: "https://facebook.com"))
                context.startActivity(intent)
            }
            QuickActionType.WHATSAPP -> {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/919876543210?text=Hello%20Smart%20Study%20English%20Classes,%20I%20want%20to%20inquire%20about%20your%20courses."))
                context.startActivity(intent)
            }
            QuickActionType.SHARE_APP -> {
                val sendIntent = Intent().apply {
                    action = Intent.ACTION_SEND
                    putExtra(Intent.EXTRA_TEXT, "Learn English with Smart Study English Classes! Download the official app: https://smartstudyenglishclasses.com/app")
                    type = "text/plain"
                }
                context.startActivity(Intent.createChooser(sendIntent, "Share Smart Study English Classes"))
            }
            QuickActionType.ALL_COURSES -> {
                onCourseClick("course_spoken_2026")
            }
            else -> {
                Toast.makeText(context, "Opening ${item.title}...", Toast.LENGTH_SHORT).show()
            }
        }
    }

    Scaffold(
        bottomBar = {
            AppBottomBar(
                currentRoute = "home",
                onTabSelected = onTabSelected
            )
        },
        floatingActionButton = {
            // Quick WhatsApp Counselor Connect FAB
            FloatingActionButton(
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/919876543210?text=Hello%20Sir,%20I%20need%20help%20choosing%20the%20right%20course."))
                    context.startActivity(intent)
                },
                containerColor = Color(0xFF25D366),
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Chat,
                    contentDescription = "WhatsApp Helpdesk",
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
            // 1. UNIFIED HEADER BOX (Logo + Name + Notification Bell + Greeting + Full Search)
            UnifiedHeaderCard(
                userName = "Student",
                unreadNotifications = 3,
                onNotificationClick = onNotificationClick,
                onSearchClick = onSearchClick
            )

            // 2. FEATURED COURSES / NEW BATCH LAUNCHES CAROUSEL (16:9 YouTube thumbnail size)
            FeaturedBannerCarousel(
                banners = MockData.banners,
                onBannerClick = { courseId -> onCourseClick(courseId) }
            )

            // 3. QUICK ACTION 3-COLUMN GRID (All courses, My courses, Live classes, WhatsApp, YouTube, etc.)
            QuickActionGrid(
                items = MockData.quickActions,
                onActionClick = { item -> handleQuickAction(item) }
            )

            // 4. HORIZONTALLY SCROLLING BOXES (1 COMPLETE BOX + 30% NEXT BOX PEEK)
            CourseHorizontalScrollSection(
                title = "🔥 Popular Batches & Courses",
                courses = MockData.featuredCourses,
                onCourseClick = { course -> onCourseClick(course.id) },
                onBuyNowClick = { course ->
                    Toast.makeText(context, "Proceeding to checkout: ${course.title} (₹${course.discountPrice})", Toast.LENGTH_LONG).show()
                }
            )

            // 5. WHY CHOOSE SMART STUDY ENGLISH CLASSES SECTION
            WhyChooseUsCard()

            // 6. OFFICIAL INSTITUTE & CENTER ADDRESS CARD
            InstituteInfoCard()

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun WhyChooseUsCard() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp)
        ) {
            Text(
                text = "Why Smart Study English Classes?",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A)
            )
            Spacer(modifier = Modifier.height(12.dp))

            val points = listOf(
                "Personalized 1-on-1 Speaking Feedback",
                "Proven Track Record in SSC & Bank Exams",
                "Mentored by Krishna Kumar with 15+ Years Experience",
                "Concise & Printable Smart PDF Formula Sheets",
                "24/7 Dedicated Doubt Support Group"
            )

            points.forEach { point ->
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
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = point,
                        fontSize = 13.sp,
                        color = Color(0xFF334155),
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
fun InstituteInfoCard() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp)
        ) {
            Text(
                text = "🏛️ Institute & Learning Center Details",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A)
            )
            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Smart Study English Classes",
                fontSize = 14.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF1340B5)
            )
            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Lead Faculty & Legal Head: Krishna Kumar",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF1E293B)
            )
            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "📍 Address: NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR",
                fontSize = 12.5.sp,
                color = Color(0xFF475569),
                lineHeight = 18.sp
            )
            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "📞 Helpline: +91 98765 43210 | WhatsApp: 919876543210",
                fontSize = 12.sp,
                color = Color(0xFF64748B)
            )
        }
    }
}
