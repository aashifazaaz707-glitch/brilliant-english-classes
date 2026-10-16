package com.brilliant.englishclasses.ui.components

import android.app.Activity
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.brilliant.englishclasses.data.AndroidAuthManager
import com.brilliant.englishclasses.model.StudentUser
import com.brilliant.englishclasses.ui.theme.RoyalBlueDark
import com.brilliant.englishclasses.ui.theme.RoyalBluePrimary
import com.brilliant.englishclasses.ui.theme.SuccessGreen
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.common.api.ApiException

@Composable
fun GoogleSignInSheet(
    onDismiss: () -> Unit,
    onSuccess: (StudentUser) -> Unit = {}
) {
    val context = LocalContext.current
    val activity = context as? Activity
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var showWebOAuthFallback by remember { mutableStateOf(false) }

    val googleSignInLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        isLoading = false
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            if (account != null) {
                val user = AndroidAuthManager.handleGoogleSignInSuccess(account, context)
                Toast.makeText(context, "Welcome ${user.fullName}!", Toast.LENGTH_SHORT).show()
                onSuccess(user)
                onDismiss()
            } else {
                errorMessage = "Google sign-in was cancelled."
            }
        } catch (e: ApiException) {
            // Common code: 10 = DEVELOPER_ERROR (misconfigured SHA-1/package name), 12500 = SIGN_IN_FAILED
            errorMessage = "Play Services (${e.statusCode}): Use Web Sign-In below for instant login."
            showWebOAuthFallback = true
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = Color.White,
            tonalElevation = 8.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 4.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(22.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header Row with Close Button
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(RoyalBluePrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "🎓", fontSize = 18.sp)
                        }
                        Column {
                            Text(
                                text = "Smart Study English",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF0F172A)
                            )
                            Text(
                                text = "Official Student Portal",
                                fontSize = 11.sp,
                                color = Color(0xFF64748B)
                            )
                        }
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color(0xFF64748B)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Google Icon Circle
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFEFF6FF)),
                    contentAlignment = Alignment.Center
                ) {
                    GoogleColoredIcon(modifier = Modifier.size(26.dp))
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "Sign In with Google",
                    fontSize = 19.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF0F172A)
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "Instant verified access to your courses, video lectures, and student roll ID.",
                    fontSize = 12.sp,
                    color = Color(0xFF64748B),
                    textAlign = TextAlign.Center,
                    lineHeight = 16.sp
                )

                if (errorMessage != null) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color(0xFFFEF2F2),
                        border = BorderStroke(1.dp, Color(0xFFFECACA)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = errorMessage ?: "",
                            fontSize = 11.sp,
                            color = Color(0xFFB91C1C),
                            modifier = Modifier.padding(8.dp),
                            textAlign = TextAlign.Center
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // 1. PRIMARY NATIVE 1-TAP GOOGLE SIGN-IN BUTTON
                Button(
                    onClick = {
                        if (activity != null) {
                            isLoading = true
                            errorMessage = null
                            try {
                                val client = AndroidAuthManager.getGoogleSignInClient(activity)
                                googleSignInLauncher.launch(client.signInIntent)
                            } catch (e: Exception) {
                                isLoading = false
                                errorMessage = "Google Sign-In: ${e.localizedMessage}"
                            }
                        } else {
                            errorMessage = "Activity context unavailable"
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFDADCE0)),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        GoogleColoredIcon(modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = if (isLoading) "Connecting to Google..." else "Continue with Google",
                            color = Color(0xFF1E293B),
                            fontWeight = FontWeight.Bold,
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // 3. INSTANT DEMO / TEST STUDENT LOGIN
                TextButton(
                    onClick = {
                        val user = AndroidAuthManager.signInDemoGoogleUser(context)
                        Toast.makeText(context, "Logged in as ${user.fullName}", Toast.LENGTH_SHORT).show()
                        onSuccess(user)
                        onDismiss()
                    }
                ) {
                    Text(
                        text = "⚡ Instant Student Login (One-Tap Test)",
                        fontSize = 12.sp,
                        color = RoyalBluePrimary,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Trust Badges
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFF8FAFC),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(10.dp),
                        verticalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        TrustBadgeItem(text = "1-Tap Instant Sign-In — No passwords to remember")
                        TrustBadgeItem(text = "Automatic verified Student ID & Enrollment sync")
                        TrustBadgeItem(text = "Secured by Google OAuth & Supabase Cloud")
                    }
                }
            }
        }
    }
}

@Composable
private fun TrustBadgeItem(text: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text(text = "✓", color = SuccessGreen, fontWeight = FontWeight.ExtraBold, fontSize = 12.sp)
        Text(text = text, color = Color(0xFF475569), fontSize = 11.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun GoogleColoredIcon(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height

        drawCircle(
            color = Color(0xFF4285F4),
            radius = w * 0.45f,
            center = Offset(w * 0.5f, h * 0.5f)
        )
        drawCircle(
            color = Color.White,
            radius = w * 0.28f,
            center = Offset(w * 0.5f, h * 0.5f)
        )
        drawRect(
            color = Color(0xFF4285F4),
            topLeft = Offset(w * 0.5f, h * 0.42f),
            size = androidx.compose.ui.geometry.Size(w * 0.45f, h * 0.16f)
        )
    }
}
