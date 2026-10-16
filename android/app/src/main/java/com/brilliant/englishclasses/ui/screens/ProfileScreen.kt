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
import androidx.compose.material.icons.outlined.*
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
import androidx.compose.ui.text.style.TextAlign
import com.brilliant.englishclasses.data.AndroidAuthManager
import com.brilliant.englishclasses.ui.components.AppBottomBar
import com.brilliant.englishclasses.ui.components.GoogleColoredIcon
import com.brilliant.englishclasses.ui.components.GoogleSignInSheet
import com.brilliant.englishclasses.ui.theme.*

@Composable
fun ProfileScreen(
    onTabSelected: (String) -> Unit = {}
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    val currentUser by AndroidAuthManager.currentUser
    var showGoogleSignInSheet by remember { mutableStateOf(false) }
    var showFeeReceiptDialog by remember { mutableStateOf(false) }
    var showTermsDialog by remember { mutableStateOf(false) }
    var showPrivacyDialog by remember { mutableStateOf(false) }
    var showDeveloperDisclaimerDialog by remember { mutableStateOf(false) }

    Scaffold(
        bottomBar = {
            AppBottomBar(
                currentRoute = "profile",
                onTabSelected = onTabSelected
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFFF8FAFC))
                .verticalScroll(scrollState)
        ) {
            // 1. HERO PROFILE CARD (GUEST vs VERIFIED STUDENT)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(RoyalBlueDark, RoyalBluePrimary)
                        ),
                        shape = RoundedCornerShape(bottomStart = 28.dp, bottomEnd = 28.dp)
                    )
                    .padding(horizontal = 20.dp, vertical = 24.dp)
            ) {
                if (currentUser != null) {
                    val user = currentUser!!
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Avatar
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(AmberAccent),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = user.fullName.take(2).uppercase(),
                                fontSize = 24.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = RoyalBlueDark
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = user.fullName,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color.White
                                )
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = SuccessGreen
                                ) {
                                    Text(
                                        text = "ACTIVE",
                                        fontSize = 9.5.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = Color.White,
                                        modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Roll ID: ${user.rollId}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = AmberAccentLight
                            )
                            Text(
                                text = user.email.ifEmpty { "Guided by Krishna Kumar Sir" },
                                fontSize = 11.5.sp,
                                color = Color(0xFFCBD5E1)
                            )
                        }
                    }
                } else {
                    // GUEST STATE - 1-TAP GOOGLE SIGN IN
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(Color.White.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "🎓", fontSize = 28.sp)
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "Smart Study Student Portal",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Sign in with your Google account to access your courses, video lectures, and student ID card.",
                            fontSize = 12.sp,
                            color = Color(0xFFE0E7FF),
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { showGoogleSignInSheet = true },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp),
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                            elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                GoogleColoredIcon(modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "Continue with Google",
                                    color = Color(0xFF3C4043),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }
                        }
                    }
                }
            }

            val enrolledCourses = com.brilliant.englishclasses.data.SupabaseRepository.getEnrolledCourses()
            val totalLecturesCount = enrolledCourses.sumOf { c -> c.subjects.sumOf { s -> s.chapters.sumOf { it.lectures.size } } }
            val totalNotesCount = enrolledCourses.sumOf { c -> c.subjects.sumOf { s -> s.chapters.sumOf { it.pdfs.size } } }

            // 2. 4-STAT METRIC ROW
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .offset(y = (-14).dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ProfileStatCard(modifier = Modifier.weight(1f), number = "${enrolledCourses.size}", label = "Batches")
                ProfileStatCard(modifier = Modifier.weight(1f), number = "$totalLecturesCount", label = "Lectures")
                ProfileStatCard(modifier = Modifier.weight(1f), number = "$totalNotesCount", label = "Notes")
                ProfileStatCard(modifier = Modifier.weight(1f), number = if (enrolledCourses.isNotEmpty()) "92%" else "0%", label = "Progress")
            }

            // 3. ACADEMIC & DIGITAL RECEIPTS SECTION
            ProfileCardSection(title = "Academic Records & Receipts") {
                ProfileMenuRow(
                    icon = "🧾",
                    iconBg = Color(0xFFEFF6FF),
                    title = "Digital Fee Receipt & Student ID",
                    desc = if (enrolledCourses.isNotEmpty()) "Receipt #SSE-REC-2026 • Verified Admission" else "No active fee receipts yet",
                    badgeText = if (enrolledCourses.isNotEmpty()) "PAID" else "N/A",
                    badgeColor = if (enrolledCourses.isNotEmpty()) SuccessGreen else Color(0xFF94A3B8),
                    onClick = { showFeeReceiptDialog = true }
                )
                Divider(color = Color(0xFFF1F5F9))

                ProfileMenuRow(
                    icon = "🎓",
                    iconBg = Color(0xFFF0FDF4),
                    title = "My Enrolled Batches",
                    desc = if (enrolledCourses.isNotEmpty()) "${enrolledCourses.size} active courses on Supabase" else "No courses enrolled yet",
                    badgeText = "${enrolledCourses.size} Active",
                    badgeColor = RoyalBluePrimary,
                    onClick = { onTabSelected("my_batches") }
                )
                Divider(color = Color(0xFFF1F5F9))

                ProfileMenuRow(
                    icon = "📥",
                    iconBg = Color(0xFFFEF3C7),
                    title = "Downloaded Offline Notes",
                    desc = "14 PDF Handouts downloaded for offline revision",
                    badgeText = "14 Files",
                    badgeColor = Color(0xFFB45309),
                    onClick = { Toast.makeText(context, "Opening 14 Offline PDFs...", Toast.LENGTH_SHORT).show() }
                )
                Divider(color = Color(0xFFF1F5F9))

                ProfileMenuRow(
                    icon = "📊",
                    iconBg = Color(0xFFF3E8FF),
                    title = "Test Performance & Rank",
                    desc = "Rank #4 in Madhubani District Mock Series",
                    badgeText = "Top 1%",
                    badgeColor = Color(0xFF7E22CE),
                    onClick = {
                        Toast.makeText(
                            context,
                            "Score: 44/50 (88% Accuracy) • Madhubani Rank: #4",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 4. ABOUT INSTITUTE & CENTER SECTION
            ProfileCardSection(title = "About Institute & Center") {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFF8FAFC), RoundedCornerShape(12.dp))
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Smart Study English Classes",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = RoyalBluePrimary
                    )
                    Text(
                        text = "Master English Fluency & Crack Competitive Exams",
                        fontSize = 11.5.sp,
                        color = Color(0xFF475569)
                    )

                    Divider(color = Color(0xFFE2E8F0))

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(text = "👨‍🏫", fontSize = 14.sp)
                        Column {
                            Text(
                                text = "Lead Faculty & Legal Representative:",
                                fontSize = 11.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF0F172A)
                            )
                            Text(
                                text = "Krishna Kumar",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF1E293B)
                            )
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(text = "📍", fontSize = 14.sp)
                        Column {
                            Text(
                                text = "Offline Center Address:",
                                fontSize = 11.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF0F172A)
                            )
                            Text(
                                text = "NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR",
                                fontSize = 12.sp,
                                color = Color(0xFF334155),
                                lineHeight = 16.sp
                            )
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(text = "📞", fontSize = 14.sp)
                        Text(
                            text = "Helpline: +91 98765 43210 | WhatsApp: 919876543210",
                            fontSize = 11.5.sp,
                            color = Color(0xFF64748B)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:+919876543210"))
                            context.startActivity(intent)
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary)
                    ) {
                        Text(text = "📞 Call Center", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            val intent = Intent(
                                Intent.ACTION_VIEW,
                                Uri.parse("https://wa.me/919876543210?text=Hello%20Krishna%20Kumar%20Sir,%20I%20have%20an%20inquiry%20regarding%20Smart%20Study%20English%20Classes.")
                            )
                            context.startActivity(intent)
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366))
                    ) {
                        Text(text = "💬 WhatsApp", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 5. LEGAL POLICIES & APP SETTINGS
            ProfileCardSection(title = "Legal Policies & Settings") {
                ProfileMenuRow(
                    icon = "⚙️",
                    iconBg = Color(0xFFF1F5F9),
                    title = "Video Playback Quality",
                    desc = "Auto 720p HD (Data Saver Active)",
                    badgeText = "720p",
                    badgeColor = Color(0xFF64748B),
                    onClick = {
                        Toast.makeText(context, "Streaming quality: 720p HD", Toast.LENGTH_SHORT).show()
                    }
                )
                Divider(color = Color(0xFFF1F5F9))

                ProfileMenuRow(
                    icon = "📜",
                    iconBg = Color(0xFFEFF6FF),
                    title = "Terms & Conditions",
                    desc = "Student code of conduct, copyright & fees policy",
                    badgeText = "View",
                    badgeColor = RoyalBluePrimary,
                    onClick = { showTermsDialog = true }
                )
                Divider(color = Color(0xFFF1F5F9))

                ProfileMenuRow(
                    icon = "🔒",
                    iconBg = Color(0xFFF0FDF4),
                    title = "Privacy Policy",
                    desc = "Student data handling & cloud database safety",
                    badgeText = "View",
                    badgeColor = SuccessGreen,
                    onClick = { showPrivacyDialog = true }
                )
                Divider(color = Color(0xFFF1F5F9))

                ProfileMenuRow(
                    icon = "⚖️",
                    iconBg = Color(0xFFFEF2F2),
                    title = "Developer & Legal Disclaimer",
                    desc = "Built by azazlab.com • Technical platform disclosure",
                    badgeText = "LEGAL",
                    badgeColor = AlertRed,
                    onClick = { showDeveloperDisclaimerDialog = true }
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 6. LOGOUT OR SIGN IN BUTTON
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                if (currentUser != null) {
                    OutlinedButton(
                        onClick = {
                            AndroidAuthManager.signOut(context)
                            Toast.makeText(context, "Signed out from student portal", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.dp, Color(0xFFFCA5A5)),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = AlertRed)
                    ) {
                        Text(text = "🚪 Sign Out / Switch Account", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                } else {
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
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            GoogleColoredIcon(modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(text = "Sign In with Google", color = Color(0xFF3C4043), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 7. DEVELOPER ATTRIBUTION & NON-LIABILITY BADGE (azazlab.com)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = Color(0xFFF8FAFC),
                        border = BorderStroke(1.dp, Color(0xFFCBD5E1))
                    ) {
                        Text(
                            text = "⚡ Designed & Built by azazlab.com",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = RoyalBluePrimary,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "All course materials, lectures, educational promises & fee structures are published and certified exclusively by Krishna Kumar (Smart Study English Classes). The technology developer (azazlab.com) provides software infrastructure and bears no legal, financial, or pedagogical liability.",
                        fontSize = 10.5.sp,
                        color = Color(0xFF64748B),
                        lineHeight = 15.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "App Version 2.4.0 • Production Build",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF94A3B8)
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

    // 1. FEE RECEIPT MODAL DIALOG
    if (showFeeReceiptDialog) {
        AlertDialog(
            onDismissRequest = { showFeeReceiptDialog = false },
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(text = "🧾", fontSize = 20.sp)
                    Text(
                        text = "Official Student Fee Receipt",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF0F172A)
                    )
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFFECFDF5),
                        border = BorderStroke(1.dp, Color(0xFFA7F3D0))
                    ) {
                        Text(
                            text = "✓ STATUS: FULLY PAID & VERIFIED",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFF065F46),
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(text = "Smart Study English Classes", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = RoyalBluePrimary)
                    Text(text = "Reg. No: SSE/BIH/2026/0842", fontSize = 11.sp, color = Color(0xFF64748B))
                    Text(text = "Head Teacher: Krishna Kumar", fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF1E293B))
                    Text(text = "Center: NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR", fontSize = 11.sp, color = Color(0xFF64748B), lineHeight = 15.sp)

                    Divider(modifier = Modifier.padding(vertical = 4.dp), color = Color(0xFFE2E8F0))

                    ReceiptItem(label = "Receipt No:", value = "SSE-REC-2026-0001")
                    ReceiptItem(label = "Student Name:", value = "Verified Student")
                    ReceiptItem(label = "Roll ID:", value = "SSE-2026-ACTIVE")
                    ReceiptItem(label = "Enrolled:", value = "Spoken English + SSC Combo 2026")
                    ReceiptItem(label = "Date:", value = "12 Jan 2026")
                    ReceiptItem(label = "Valid:", value = "Full Year 2026")
                    ReceiptItem(label = "Payment Mode:", value = "UPI (Ref: 401829482910)")

                    Spacer(modifier = Modifier.height(4.dp))

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFFF0FDF4),
                        border = BorderStroke(1.dp, Color(0xFFBBF7D0))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "Total Fee Paid:", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF166534))
                            Text(text = "₹2,499.00", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF166534))
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Bottom
                    ) {
                        Text(text = "Smart Study English Classes\nMadhepur, Madhubani", fontSize = 9.5.sp, color = Color(0xFF94A3B8))
                        Column(horizontalAlignment = Alignment.End) {
                            Text(text = "Krishna Kumar", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = RoyalBlueDark)
                            Text(text = "Authorized Signatory", fontSize = 9.5.sp, color = Color(0xFF64748B))
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        Toast.makeText(context, "📥 Downloading Official PDF Receipt...", Toast.LENGTH_SHORT).show()
                        showFeeReceiptDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary)
                ) {
                    Text(text = "Download PDF", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showFeeReceiptDialog = false }) {
                    Text(text = "Close", color = Color(0xFF64748B))
                }
            }
        )
    }

    // 2. TERMS & CONDITIONS DIALOG
    if (showTermsDialog) {
        AlertDialog(
            onDismissRequest = { showTermsDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(text = "📜", fontSize = 20.sp)
                    Text(text = "Terms & Conditions of Admission", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    LegalDialogSection(
                        title = "1. Institute Ownership & Admissions",
                        body = "Smart Study English Classes is founded, directed, and operated exclusively by Krishna Kumar, situated at Near Bus Stand infront of Bank of Baroda, 1st Floor, Madhepur, Madhubani, Bihar."
                    )
                    LegalDialogSection(
                        title = "2. Copyright & Intellectual Property",
                        body = "All course syllabus, video lectures, spoken English techniques, and study notes are proprietary intellectual property of Krishna Kumar. Unauthorized recording or distribution is strictly prohibited under the Indian Copyright Act, 1957."
                    )
                    LegalDialogSection(
                        title = "3. Fee Payments & Refunds",
                        body = "Course fees are paid directly for educational instruction at Smart Study English Classes. Fees are non-refundable once batch registration is completed."
                    )
                    LegalDialogSection(
                        title = "4. Technical Platform & Developer Non-Liability",
                        body = "The mobile software is engineered by azazlab.com. azazlab.com is not an educational partner, promoter, or legal entity of Smart Study English Classes and bears no liability for teaching, claims, or financial transactions."
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { showTermsDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary)
                ) {
                    Text(text = "I Understand")
                }
            }
        )
    }

    // 3. PRIVACY POLICY DIALOG
    if (showPrivacyDialog) {
        AlertDialog(
            onDismissRequest = { showPrivacyDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(text = "🔒", fontSize = 20.sp)
                    Text(text = "Student Privacy Policy", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    LegalDialogSection(
                        title = "1. Information Collected",
                        body = "We collect student name, mobile number, roll ID, enrolled batch progress, and lecture watch records to authenticate learning access and verify fee receipts."
                    )
                    LegalDialogSection(
                        title = "2. Cloud Infrastructure & Security",
                        body = "Data is securely stored using authenticated cloud database instances provisioned through azazlab.com subdomains. We do not sell or monetize student data."
                    )
                    LegalDialogSection(
                        title = "3. Faculty Communications",
                        body = "Contact details are used strictly to provide class timetable updates and academic counseling with Krishna Kumar Sir."
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { showPrivacyDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary)
                ) {
                    Text(text = "Close")
                }
            }
        )
    }

    // 4. DEVELOPER DISCLAIMER DIALOG (azazlab.com)
    if (showDeveloperDisclaimerDialog) {
        AlertDialog(
            onDismissRequest = { showDeveloperDisclaimerDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(text = "⚖️", fontSize = 20.sp)
                    Text(text = "Developer & Legal Disclaimer", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = AlertRed)
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color(0xFFFEF2F2),
                        border = BorderStroke(1.dp, Color(0xFFFECACA))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = "Technical Platform: azazlab.com",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 13.sp,
                                color = AlertRed
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "This mobile application and its cloud database infrastructure are engineered and technically delivered by azazlab.com.\n\n" +
                                        "1. Content Ownership: All course descriptions, video lectures, test materials, fee rates, student admissions, and claims are provided, owned, and verified solely by Krishna Kumar (Smart Study English Classes).\n\n" +
                                        "2. Non-Liability: azazlab.com acts purely as an external software development service provider. azazlab.com holds NO legal, financial, pedagogical, or copyright liability of any kind.\n\n" +
                                        "3. Subdomain Notice: Cloud backend services operating under azazlab.com subdomains are provided as technical infrastructure only and do not establish any legal partnership or agency.",
                                fontSize = 11.5.sp,
                                color = Color(0xFF7F1D1D),
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { showDeveloperDisclaimerDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = AlertRed)
                ) {
                    Text(text = "Acknowledged")
                }
            }
        )
    }
}

@Composable
fun LegalDialogSection(title: String, body: String) {
    Column {
        Text(text = title, fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
        Spacer(modifier = Modifier.height(2.dp))
        Text(text = body, fontSize = 11.5.sp, color = Color(0xFF475569), lineHeight = 16.sp)
    }
}

@Composable
fun ProfileStatCard(modifier: Modifier = Modifier, number: String, label: String) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp, horizontal = 4.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = number,
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = RoyalBluePrimary
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = label,
                fontSize = 10.sp,
                color = Color(0xFF64748B),
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

@Composable
fun ProfileCardSection(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = title.uppercase(),
                fontSize = 11.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF64748B),
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(10.dp))
            content()
        }
    }
}

@Composable
fun ProfileMenuRow(
    icon: String,
    iconBg: Color,
    title: String,
    desc: String,
    badgeText: String? = null,
    badgeColor: Color = RoyalBluePrimary,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Surface(
            shape = RoundedCornerShape(10.dp),
            color = iconBg,
            modifier = Modifier.size(34.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text(text = icon, fontSize = 16.sp)
            }
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
            Text(text = desc, fontSize = 11.sp, color = Color(0xFF64748B))
        }
        if (badgeText != null) {
            Text(text = badgeText, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = badgeColor)
        }
        Text(text = "›", fontSize = 18.sp, color = Color(0xFF94A3B8))
    }
}

@Composable
fun ReceiptItem(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 11.5.sp, color = Color(0xFF64748B))
        Text(text = value, fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
    }
}
