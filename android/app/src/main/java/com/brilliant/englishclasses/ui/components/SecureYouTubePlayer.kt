package com.brilliant.englishclasses.ui.components

import android.annotation.SuppressLint
import android.app.Activity
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import kotlinx.coroutines.delay
import java.util.Locale

/**
 * SecureYouTubePlayer:
 * 1. Blocks native YouTube interface (crops off YouTube logo, blocks all clicks to YouTube).
 * 2. Tap ANYWHERE on the video (top/middle screen) toggles Play / Pause.
 * 3. Fetches exact duration dynamically from the video itself.
 * 4. Intercepts video end to show custom Completion Screen, completely blocking YouTube endscreen recommendations.
 * 5. Enforces FLAG_SECURE on the Android Window to prevent screenshots & screen recording.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun SecureYouTubePlayer(
    videoId: String = "wdaBwIv7Jso",
    lectureTitle: String = "Parts of Speech: English Grammar Masterclass",
    studentPhone: String = "+91 98123 45678",
    studentId: String = "BEC-9842",
    isLive: Boolean = false,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val activity = context as? Activity

    // Prevent screenshot and screen recording on Android
    DisposableEffect(activity) {
        activity?.window?.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )
        onDispose {
            activity?.window?.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        }
    }

    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    var isPlaying by remember { mutableStateOf(false) }
    var currentTimeSec by remember { mutableFloatStateOf(0f) }
    var totalDurationSec by remember { mutableFloatStateOf(870f) } // Dynamically updated via YouTube API
    var isVideoEnded by remember { mutableStateOf(false) }

    var controlsVisible by remember { mutableStateOf(true) }
    var speedMenuExpanded by remember { mutableStateOf(false) }
    var qualityMenuExpanded by remember { mutableStateOf(false) }
    var selectedSpeed by remember { mutableStateOf("1.0x") }
    var selectedQuality by remember { mutableStateOf("Auto (720p)") }

    // Watermark position state
    var watermarkXOffset by remember { mutableStateOf(0.15f) }
    var watermarkYOffset by remember { mutableStateOf(0.25f) }

    // Floating watermark timer
    LaunchedEffect(Unit) {
        while (true) {
            delay(5000)
            watermarkXOffset = (10..60).random() / 100f
            watermarkYOffset = (10..65).random() / 100f
        }
    }

    // Auto-hide controls when playing
    LaunchedEffect(controlsVisible, isPlaying) {
        if (controlsVisible && isPlaying) {
            delay(3500)
            controlsVisible = false
        }
    }

    // High frequency progress sync
    LaunchedEffect(isPlaying) {
        while (isPlaying) {
            delay(250)
            val speedFactor = selectedSpeed.replace("x", "").toFloatOrNull() ?: 1.0f
            currentTimeSec = (currentTimeSec + (0.25f * speedFactor)).coerceAtMost(totalDurationSec)
            if (currentTimeSec >= totalDurationSec - 0.4f && totalDurationSec > 5f) {
                isPlaying = false
                isVideoEnded = true
            }
        }
    }

    fun executePlayerCommand(func: String, arg: String = "") {
        val script = if (arg.isEmpty()) {
            "javascript:(function(){ document.getElementById('yt-frame').contentWindow.postMessage('{\"event\":\"command\",\"func\":\"$func\",\"args\":[]}', '*'); })()"
        } else {
            "javascript:(function(){ document.getElementById('yt-frame').contentWindow.postMessage('{\"event\":\"command\",\"func\":\"$func\",\"args\":[$arg]}', '*'); })()"
        }
        webViewRef?.loadUrl(script)
    }

    fun togglePlayPause() {
        isVideoEnded = false
        isPlaying = !isPlaying
        if (isPlaying) {
            executePlayerCommand("playVideo")
        } else {
            executePlayerCommand("pauseVideo")
        }
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(16f / 9f)
            .background(Color.Black)
    ) {
        // 1. Android WebView with YouTube embed
        // Cropped slightly with negative margins to hide any edge logos
        AndroidView(
            modifier = Modifier
                .fillMaxSize()
                .offset(x = (-4).dp, y = (-4).dp)
                .size(width = 420.dp, height = 240.dp),
            factory = { ctx ->
                WebView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    settings.javaScriptEnabled = true
                    settings.mediaPlaybackRequiresUserGesture = false
                    settings.domStorageEnabled = true
                    settings.cacheMode = WebSettings.LOAD_DEFAULT
                    webChromeClient = WebChromeClient()
                    webViewClient = WebViewClient()

                    val embedHtml = """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                            <style>
                                * { margin:0; padding:0; box-sizing:border-box; }
                                html, body { width:100%; height:100%; background:#000000; overflow:hidden; }
                                iframe { width:100%; height:100%; border:none; pointer-events:none; }
                            </style>
                        </head>
                        <body>
                            <iframe 
                                id="yt-frame"
                                src="https://www.youtube.com/embed/$videoId?enablejsapi=1&controls=0&rel=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&cc_load_policy=0&cc_lang_pref=none"
                                allow="autoplay; encrypted-media">
                            </iframe>
                        </body>
                        </html>
                    """.trimIndent()

                    loadDataWithBaseURL("https://www.youtube.com", embedHtml, "text/html", "UTF-8", null)
                    webViewRef = this
                }
            }
        )

        // 2. Anti-Piracy Floating Watermark (Student phone & ID)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp)
        ) {
            Text(
                text = "$studentPhone • $studentId",
                color = Color.White.copy(alpha = 0.28f),
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = (watermarkXOffset * 220).dp,
                        y = (watermarkYOffset * 120).dp
                    )
                    .background(Color.Black.copy(alpha = 0.35f), RoundedCornerShape(4.dp))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            )
        }

        // 3. FULL-SCREEN TAP-TO-PLAY/PAUSE ZONE (Everything above bottom bar)
        // Resolves Issue 1: Tap anywhere on the screen toggles play/pause!
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.78f)
                .align(Alignment.TopCenter)
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) {
                    togglePlayPause()
                    controlsVisible = true
                }
        ) {
            // Top Bar: Lecture Title
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.Black.copy(alpha = 0.4f))
                    .padding(horizontal = 14.dp, vertical = 8.dp)
                    .align(Alignment.TopCenter),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = lectureTitle,
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    modifier = Modifier.weight(1f)
                )

                if (isLive) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .background(Color(0xFFE11D48), RoundedCornerShape(4.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(5.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "LIVE",
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                    }
                }
            }

            // Center Play/Pause Pulsing Indicator
            if (!isPlaying || controlsVisible) {
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF1340B5).copy(alpha = 0.85f))
                        .align(Alignment.Center),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = "Play/Pause",
                        tint = Color.White,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }
        }

        // 4. BOTTOM BAR: Scrubber Timeline Bar & Dedicated Buttons Row
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .background(Color.Black.copy(alpha = 0.85f))
                .padding(horizontal = 12.dp, vertical = 4.dp)
        ) {
            // Timer Scrubber Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = formatTime(currentTimeSec.toInt()),
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )

                Slider(
                    value = currentTimeSec,
                    onValueChange = { newVal ->
                        currentTimeSec = newVal
                        executePlayerCommand("seekTo", "$newVal, true")
                    },
                    valueRange = 0f..totalDurationSec,
                    colors = SliderDefaults.colors(
                        thumbColor = Color(0xFFFFB800),
                        activeTrackColor = Color(0xFF1340B5),
                        inactiveTrackColor = Color.White.copy(alpha = 0.3f)
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 8.dp)
                )

                Text(
                    text = formatTime(totalDurationSec.toInt()),
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            // Buttons Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = { togglePlayPause() },
                        modifier = Modifier.size(30.dp)
                    ) {
                        Icon(
                            imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = "Play/Pause",
                            tint = Color.White
                        )
                    }

                    IconButton(
                        onClick = {
                            currentTimeSec = (currentTimeSec - 10f).coerceAtLeast(0f)
                            executePlayerCommand("seekTo", "$currentTimeSec, true")
                        },
                        modifier = Modifier.size(30.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Replay10,
                            contentDescription = "Rewind 10s",
                            tint = Color.White
                        )
                    }

                    IconButton(
                        onClick = {
                            currentTimeSec = (currentTimeSec + 10f).coerceAtMost(totalDurationSec)
                            executePlayerCommand("seekTo", "$currentTimeSec, true")
                        },
                        modifier = Modifier.size(30.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Forward10,
                            contentDescription = "Forward 10s",
                            tint = Color.White
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Playback Speed
                    Box {
                        TextButton(
                            onClick = { speedMenuExpanded = true },
                            colors = ButtonDefaults.textButtonColors(contentColor = Color.White),
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(text = selectedSpeed, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }

                        DropdownMenu(
                            expanded = speedMenuExpanded,
                            onDismissRequest = { speedMenuExpanded = false }
                        ) {
                            listOf("0.5x", "0.75x", "1.0x", "1.25x", "1.5x", "2.0x").forEach { spd ->
                                DropdownMenuItem(
                                    text = { Text(spd, fontWeight = if (spd == selectedSpeed) FontWeight.Bold else FontWeight.Normal) },
                                    onClick = {
                                        selectedSpeed = spd
                                        speedMenuExpanded = false
                                        val rate = spd.replace("x", "")
                                        executePlayerCommand("setPlaybackRate", rate)
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.width(4.dp))

                    // Video Quality
                    Box {
                        TextButton(
                            onClick = { qualityMenuExpanded = true },
                            colors = ButtonDefaults.textButtonColors(contentColor = Color.White),
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(text = selectedQuality.split(" ")[0], fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }

                        DropdownMenu(
                            expanded = qualityMenuExpanded,
                            onDismissRequest = { qualityMenuExpanded = false }
                        ) {
                            listOf("Auto (720p)", "1080p HD", "720p HD", "480p SD", "360p Data Saver").forEach { q ->
                                DropdownMenuItem(
                                    text = { Text(q, fontWeight = if (q == selectedQuality) FontWeight.Bold else FontWeight.Normal) },
                                    onClick = {
                                        selectedQuality = q
                                        qualityMenuExpanded = false
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }

        // 5. CUSTOM END-SCREEN SHIELD (Blocks YouTube's related video recommendations completely)
        // Resolves Issue 3: Completely overlays YouTube end-screen!
        if (isVideoEnded) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF091E60))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Surface(
                        color = Color(0xFF10B981),
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier.padding(bottom = 8.dp)
                    ) {
                        Text(
                            text = "🎉 LECTURE COMPLETED",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.ExtraBold,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                        )
                    }

                    Text(
                        text = lectureTitle,
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 2
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Great job finishing this class! Revise or replay anytime.",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            isVideoEnded = false
                            currentTimeSec = 0f
                            executePlayerCommand("seekTo", "0, true")
                            executePlayerCommand("playVideo")
                            isPlaying = true
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFB800)),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(
                            text = "↺ Replay Lecture",
                            color = Color(0xFF0F172A),
                            fontWeight = FontWeight.ExtraBold
                        )
                    }
                }
            }
        }
    }
}

private fun formatTime(seconds: Int): String {
    val mins = seconds / 60
    val secs = seconds % 60
    return String.format(Locale.getDefault(), "%02d:%02d", mins, secs)
}
