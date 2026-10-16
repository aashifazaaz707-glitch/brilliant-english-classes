package com.brilliant.englishclasses.ui.components

import android.app.Activity
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.brilliant.englishclasses.data.AndroidAuthManager
import com.brilliant.englishclasses.model.StudentUser
import com.brilliant.englishclasses.ui.theme.RoyalBlueDark
import com.brilliant.englishclasses.ui.theme.RoyalBluePrimary
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
            errorMessage = "Sign-in error (${e.statusCode}): Please retry."
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(28.dp),
            color = Color.White,
            tonalElevation = 6.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp)
        ) {
            Box(modifier = Modifier.fillMaxWidth()) {
                // Top Right Close Icon
                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(12.dp)
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFF1F5F9))
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = Color(0xFF64748B),
                        modifier = Modifier.size(16.dp)
                    )
                }

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Modern Branding Icon
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(RoyalBlueDark, RoyalBluePrimary)
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "🎓", fontSize = 28.sp)
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Brilliant English Classes",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF0F172A),
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Sign in to access your batches, notes & live classes",
                        fontSize = 13.sp,
                        color = Color(0xFF64748B),
                        textAlign = TextAlign.Center,
                        lineHeight = 18.sp
                    )

                    if (errorMessage != null) {
                        Spacer(modifier = Modifier.height(14.dp))
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFFFEF2F2),
                            border = BorderStroke(1.dp, Color(0xFFFECACA)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = errorMessage ?: "",
                                fontSize = 12.sp,
                                color = Color(0xFFB91C1C),
                                modifier = Modifier.padding(10.dp),
                                textAlign = TextAlign.Center
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // PRIMARY GOOGLE SIGN-IN BUTTON
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
                                errorMessage = "Context unavailable"
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                        border = BorderStroke(1.2.dp, Color(0xFFE2E8F0)),
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp, pressedElevation = 0.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            if (isLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    strokeWidth = 2.5.dp,
                                    color = RoyalBluePrimary
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "Connecting to Google...",
                                    color = Color(0xFF1E293B),
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 15.sp
                                )
                            } else {
                                GoogleColoredIcon(modifier = Modifier.size(22.dp))
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "Continue with Google",
                                    color = Color(0xFF1E293B),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Clean Terms & Conditions Disclaimer
                    Text(
                        text = buildAnnotatedString {
                            append("By continuing to log in, you agree to our\n")
                            withStyle(
                                style = SpanStyle(
                                    color = RoyalBluePrimary,
                                    fontWeight = FontWeight.SemiBold
                                )
                            ) {
                                append("Terms & Conditions")
                            }
                            append(" and ")
                            withStyle(
                                style = SpanStyle(
                                    color = RoyalBluePrimary,
                                    fontWeight = FontWeight.SemiBold
                                )
                            ) {
                                append("Privacy Policy")
                            }
                            append(".")
                        },
                        fontSize = 11.5.sp,
                        color = Color(0xFF94A3B8),
                        textAlign = TextAlign.Center,
                        lineHeight = 16.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Subtle Divider & Quick Demo Access
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        HorizontalDivider(
                            modifier = Modifier.weight(1f),
                            color = Color(0xFFF1F5F9),
                            thickness = 1.dp
                        )
                        Text(
                            text = "or",
                            fontSize = 11.sp,
                            color = Color(0xFF94A3B8),
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                        HorizontalDivider(
                            modifier = Modifier.weight(1f),
                            color = Color(0xFFF1F5F9),
                            thickness = 1.dp
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    TextButton(
                        onClick = {
                            val user = AndroidAuthManager.signInDemoGoogleUser(context)
                            Toast.makeText(context, "Logged in as ${user.fullName}", Toast.LENGTH_SHORT).show()
                            onSuccess(user)
                            onDismiss()
                        },
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "⚡ Instant Demo Student Access",
                            fontSize = 12.sp,
                            color = Color(0xFF64748B),
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun GoogleColoredIcon(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        val stroke = w * 0.20f
        val radius = (w - stroke) / 2f
        val center = Offset(w / 2f, h / 2f)
        val rect = Rect(
            center.x - radius,
            center.y - radius,
            center.x + radius,
            center.y + radius
        )
        val style = Stroke(width = stroke)

        // Red (top arc)
        drawArc(
            color = Color(0xFFEA4335),
            startAngle = 195f,
            sweepAngle = 100f,
            useCenter = false,
            topLeft = rect.topLeft,
            size = rect.size,
            style = style
        )
        // Yellow (left arc)
        drawArc(
            color = Color(0xFFFBBC05),
            startAngle = 125f,
            sweepAngle = 75f,
            useCenter = false,
            topLeft = rect.topLeft,
            size = rect.size,
            style = style
        )
        // Green (bottom arc)
        drawArc(
            color = Color(0xFF34A853),
            startAngle = 45f,
            sweepAngle = 85f,
            useCenter = false,
            topLeft = rect.topLeft,
            size = rect.size,
            style = style
        )
        // Blue (right arc)
        drawArc(
            color = Color(0xFF4285F4),
            startAngle = -25f,
            sweepAngle = 75f,
            useCenter = false,
            topLeft = rect.topLeft,
            size = rect.size,
            style = style
        )
        // Blue horizontal bar
        drawRect(
            color = Color(0xFF4285F4),
            topLeft = Offset(center.x - stroke * 0.1f, center.y - stroke / 2f),
            size = Size(radius + stroke * 0.1f, stroke)
        )
    }
}
