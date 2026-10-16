package com.brilliant.englishclasses.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.brilliant.englishclasses.ui.theme.AmberAccent
import com.brilliant.englishclasses.ui.theme.RoyalBlueDark
import com.brilliant.englishclasses.ui.theme.RoyalBluePrimary

import com.brilliant.englishclasses.model.StudentUser

@Composable
fun UnifiedHeaderCard(
    studentUser: StudentUser? = null,
    userName: String = studentUser?.fullName?.split(" ")?.firstOrNull() ?: "Student",
    unreadNotifications: Int = 3,
    onNotificationClick: () -> Unit = {},
    onSearchClick: () -> Unit = {},
    onSignInClick: () -> Unit = {},
    onProfileClick: () -> Unit = {}
) {
    // Unified box wrapping Logo, Coaching Name, Notification Bell, Greeting, and Full-Width Search
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(elevation = 10.dp, shape = RoundedCornerShape(bottomStart = 28.dp, bottomEnd = 28.dp))
            .clip(RoundedCornerShape(bottomStart = 28.dp, bottomEnd = 28.dp))
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        RoyalBlueDark,
                        RoyalBluePrimary
                    )
                )
            )
            .padding(horizontal = 18.dp, vertical = 20.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            // TOP ROW: Logo & Name on Left | Sign In / Avatar + Bell on Right
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Top Left: Logo + Coaching Name
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    // Logo Box (circular gradient badge with graduation/star motif)
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .padding(2.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .clip(CircleShape)
                                .background(
                                    Brush.linearGradient(
                                        listOf(RoyalBluePrimary, RoyalBlueDark)
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "S",
                                color = AmberAccent,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Text(
                            text = "Smart Study English Classes",
                            color = Color.White,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.3.sp
                        )
                        Text(
                            text = "Learn • Practice • Master",
                            color = AmberAccent,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                // Top Right: Google Sign In / Profile Avatar + Notification Bell
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (studentUser != null) {
                        // User Avatar
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(AmberAccent)
                                .clickable { onProfileClick() },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = studentUser.fullName.take(2).uppercase(),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = RoyalBlueDark
                            )
                        }
                    } else {
                        // Google Sign-In Pill Button
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = Color.White,
                            modifier = Modifier.clickable { onSignInClick() }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(5.dp)
                            ) {
                                GoogleColoredIcon(modifier = Modifier.size(13.dp))
                                Text(
                                    text = "Sign In",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1E293B)
                                )
                            }
                        }
                    }

                    // Bell
                    Box(
                        contentAlignment = Alignment.TopEnd
                    ) {
                        IconButton(
                            onClick = onNotificationClick,
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Color.White.copy(alpha = 0.16f))
                        ) {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = "Notifications",
                                tint = Color.White,
                                modifier = Modifier.size(22.dp)
                            )
                        }

                        if (unreadNotifications > 0) {
                            Box(
                                modifier = Modifier
                                    .offset(x = 2.dp, y = (-2).dp)
                                    .size(16.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFEF4444)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = unreadNotifications.toString(),
                                    color = Color.White,
                                    fontSize = 9.5.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // GREETING
            Text(
                text = if (studentUser != null) "Hello, ${studentUser.fullName.split(" ").firstOrNull() ?: "Student"} 👋" else "Hello, Student 👋",
                color = Color.White,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(3.dp))
            Text(
                text = if (studentUser != null) "Roll ID: ${studentUser.rollId} • Guided by Krishna Kumar Sir" else "Join Krishna Kumar Sir • Learn • Practice • Master",
                color = Color.White.copy(alpha = 0.85f),
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal
            )

            Spacer(modifier = Modifier.height(18.dp))

            // WIDE FULL-LENGTH SEARCH COURSE BUTTON
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .clickable { onSearchClick() },
                color = Color.White,
                shadowElevation = 4.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search Icon",
                        tint = RoyalBluePrimary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "Search courses, notes, test series...",
                        color = Color(0xFF64748B),
                        fontSize = 14.sp,
                        modifier = Modifier.weight(1f)
                    )
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = "Voice Search",
                        tint = Color(0xFF94A3B8),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}
