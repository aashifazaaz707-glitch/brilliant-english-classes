package com.brilliant.englishclasses.ui.components

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.net.Uri
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import kotlinx.coroutines.delay
import java.util.Locale

/**
 * SecureYouTubePlayer:
 * 1. Uses youtube-nocookie.com with strict-origin-when-cross-origin to bypass Error 150/152/152-4.
 * 2. Strips the '; wv' WebView identifier from User-Agent to prevent bot-blocking.
 * 3. Bridges YouTube JS API onError so if a video has owner-restricted embedding, it provides a clean 1-tap fallback.
 * 4. Tap ANYWHERE on the video toggles Play / Pause.
 * 5. Floating anti-piracy student watermark.
 * 6. Enforces FLAG_SECURE on the Android Window to prevent screenshots & screen recording.
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
    var totalDurationSec by remember { mutableFloatStateOf(870f) }
    var isVideoEnded by remember { mutableStateOf(false) }
    var hasPlaybackError by remember { mutableStateOf(false) }
    var playbackErrorCode by remember { mutableIntStateOf(0) }

    var controlsVisible by remember { mutableStateOf(true) }
    var speedMenuExpanded by remember { mutableStateOf(false) }
    var selectedSpeed by remember { mutableStateOf("1.0x") }

    // Floating watermark state
    var watermarkXOffset by remember { mutableStateOf(0.15f) }
    var watermarkYOffset by remember { mutableStateOf(0.25f) }

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

    // Reset error when videoId changes
    LaunchedEffect(videoId) {
        hasPlaybackError = false
        playbackErrorCode = 0
        isVideoEnded = false
        currentTimeSec = 0f
    }

    fun executePlayerCommand(func: String, arg: String = "") {
        val script = if (arg.isEmpty()) {
            "javascript:(function(){ if(window.player && window.player.$func){ window.player.$func(); } else { document.getElementById('yt-frame')?.contentWindow?.postMessage('{\"event\":\"command\",\"func\":\"$func\",\"args\":[]}', '*'); } })()"
        } else {
            "javascript:(function(){ if(window.player && window.player.$func){ window.player.$func($arg); } else { document.getElementById('yt-frame')?.contentWindow?.postMessage('{\"event\":\"command\",\"func\":\"$func\",\"args\":[$arg]}', '*'); } })()"
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

    fun openInYouTubeApp() {
        try {
            val appIntent = Intent(Intent.ACTION_VIEW, Uri.parse("vnd.youtube:$videoId"))
            context.startActivity(appIntent)
        } catch (e: Exception) {
            val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/watch?v=$videoId"))
            context.startActivity(webIntent)
        }
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(16f / 9f)
            .background(Color.Black)
    ) {
        // 1. Android WebView with YouTube embed
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                WebView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    settings.javaScriptEnabled = true
                    settings.mediaPlaybackRequiresUserGesture = false
                    settings.domStorageEnabled = true
                    settings.databaseEnabled = true
                    settings.cacheMode = WebSettings.LOAD_DEFAULT
                    settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                    
                    // Crucial: remove WebView identifier from User-Agent to prevent YouTube 152-4 bot-blocking
                    val originalUa = settings.userAgentString
                    settings.userAgentString = originalUa
                        .replace("; wv", "")
                        .replace("Version/4.0 ", "")

                    webChromeClient = WebChromeClient()
                    webViewClient = WebViewClient()

                    class AndroidBridge {
                        @JavascriptInterface
                        fun onVideoError(code: Int) {
                            activity?.runOnUiThread {
                                hasPlaybackError = true
                                playbackErrorCode = code
                            }
                        }

                        @JavascriptInterface
                        fun onDurationReady(duration: Float) {
                            activity?.runOnUiThread {
                                if (duration > 0) {
                                    totalDurationSec = duration
                                }
                            }
                        }

                        @JavascriptInterface
                        fun onStateChange(state: Int) {
                            activity?.runOnUiThread {
                                if (state == 1) { // PLAYING
                                    isPlaying = true
                                    hasPlaybackError = false
                                } else if (state == 2) { // PAUSED
                                    isPlaying = false
                                } else if (state == 0) { // ENDED
                                    isPlaying = false
                                    isVideoEnded = true
                                }
                            }
                        }
                    }

                    addJavascriptInterface(AndroidBridge(), "AndroidBridge")

                    val originDomain = "https://brilliantenglishclasses.com"
                    val embedHtml = """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                            <style>
                                * { margin:0; padding:0; box-sizing:border-box; }
                                html, body { width:100%; height:100%; background:#000000; overflow:hidden; }
                                #yt-frame { width:100%; height:100%; border:none; pointer-events:none; }
                            </style>
                        </head>
                        <body>
                            <iframe 
                                id="yt-frame"
                                src="https://www.youtube-nocookie.com/embed/$videoId?enablejsapi=1&origin=$originDomain&widget_referrer=$originDomain&playsinline=1&rel=0&modestbranding=1&controls=0&disablekb=1&fs=0&iv_load_policy=3"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowfullscreen>
                            </iframe>
                            <script>
                                var tag = document.createElement('script');
                                tag.src = "https://www.youtube.com/iframe_api";
                                var firstScriptTag = document.getElementsByTagName('script')[0];
                                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                                var player;
                                function onYouTubeIframeAPIReady() {
                                    player = new YT.Player('yt-frame', {
                                        events: {
                                            'onReady': onPlayerReady,
                                            'onStateChange': onPlayerStateChange,
                                            'onError': onPlayerError
                                        }
                                    });
                                }
                                function onPlayerReady(event) {
                                    try {
                                        var dur = player.getDuration();
                                        if (dur && window.AndroidBridge) {
                                            window.AndroidBridge.onDurationReady(dur);
                                        }
                                    } catch(e) {}
                                }
                                function onPlayerStateChange(event) {
                                    if (window.AndroidBridge) {
                                        window.AndroidBridge.onStateChange(event.data);
                                    }
                                }
                                function onPlayerError(event) {
                                    if (window.AndroidBridge) {
                                        window.AndroidBridge.onVideoError(event.data);
                                    }
                                }
                            </script>
                        </body>
                        </html>
                    """.trimIndent()

                    loadDataWithBaseURL(originDomain, embedHtml, "text/html", "UTF-8", null)
                    webViewRef = this
                }
            }
        )

        // 2. Anti-Piracy Floating Watermark (Student phone & ID)
        if (!hasPlaybackError) {
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
        }

        // 3. FULL-SCREEN TAP-TO-PLAY/PAUSE ZONE (Everything above bottom bar)
        if (!hasPlaybackError) {
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
                        .background(Color.Black.copy(alpha = 0.45f))
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

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        if (isLive) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .background(Color(0xFFE11D48), RoundedCornerShape(4.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
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
                            Spacer(modifier = Modifier.width(8.dp))
                        }

                        // Open in YouTube app button
                        IconButton(
                            onClick = { openInYouTubeApp() },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.OpenInNew,
                                contentDescription = "Watch on YouTube",
                                tint = Color.White.copy(alpha = 0.85f),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }

                // Center Play/Pause Indicator
                AnimatedVisibility(
                    visible = !isPlaying && !isVideoEnded,
                    enter = fadeIn(),
                    exit = fadeOut(),
                    modifier = Modifier.align(Alignment.Center)
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.65f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Play",
                            tint = Color.White,
                            modifier = Modifier.size(34.dp)
                        )
                    }
                }
            }
        }

        // 4. BOTTOM CUSTOM CONTROL BAR
        if (!hasPlaybackError) {
            AnimatedVisibility(
                visible = controlsVisible || !isPlaying,
                enter = fadeIn(),
                exit = fadeOut(),
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.Black.copy(alpha = 0.8f))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    // Custom Scrubber Slider
                    Slider(
                        value = currentTimeSec,
                        onValueChange = { newTime ->
                            currentTimeSec = newTime
                        },
                        onValueChangeFinished = {
                            executePlayerCommand("seekTo", "$currentTimeSec, true")
                        },
                        valueRange = 0f..totalDurationSec.coerceAtLeast(1f),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(20.dp),
                        colors = SliderDefaults.colors(
                            thumbColor = Color(0xFFFFB800),
                            activeTrackColor = Color(0xFFFFB800),
                            inactiveTrackColor = Color.White.copy(alpha = 0.25f)
                        )
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Left: Play/Pause button and Time
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = { togglePlayPause() },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(
                                    imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                    contentDescription = if (isPlaying) "Pause" else "Play",
                                    tint = Color.White,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(4.dp))

                            Text(
                                text = "${formatTime(currentTimeSec.toInt())} / ${formatTime(totalDurationSec.toInt())}",
                                color = Color.White,
                                fontSize = 11.5.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        // Right: Speed selector
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box {
                                TextButton(
                                    onClick = { speedMenuExpanded = true },
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = selectedSpeed,
                                        color = Color(0xFFFFB800),
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }

                                DropdownMenu(
                                    expanded = speedMenuExpanded,
                                    onDismissRequest = { speedMenuExpanded = false }
                                ) {
                                    listOf("0.75x", "1.0x", "1.25x", "1.5x", "2.0x").forEach { speed ->
                                        DropdownMenuItem(
                                            text = { Text(speed, fontWeight = FontWeight.Bold) },
                                            onClick = {
                                                selectedSpeed = speed
                                                val rate = speed.replace("x", "")
                                                executePlayerCommand("setPlaybackRate", rate)
                                                speedMenuExpanded = false
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 5. EMBEDDING RESTRICTION / ERROR FALLBACK CARD
        if (hasPlaybackError) {
            Surface(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0F172A)),
                color = Color(0xFF0F172A)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFEF4444).copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "▶", fontSize = 20.sp, color = Color(0xFFEF4444))
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Watch Video Lecture",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = if (playbackErrorCode == 101 || playbackErrorCode == 150 || playbackErrorCode == 152) {
                            "This unlisted video has embedding restricted in YouTube Studio. Tap below to watch directly in YouTube:"
                        } else {
                            "Playback code ($playbackErrorCode). Tap below to open directly in YouTube:"
                        },
                        color = Color(0xFF94A3B8),
                        fontSize = 11.5.sp,
                        textAlign = TextAlign.Center,
                        lineHeight = 16.sp,
                        modifier = Modifier.padding(horizontal = 14.dp)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = { openInYouTubeApp() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626)),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "▶", fontSize = 12.sp, color = Color.White)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Open on YouTube App",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.5.sp
                            )
                        }
                    }
                }
            }
        }

        // 6. LECTURE COMPLETION SCREEN
        if (isVideoEnded && !hasPlaybackError) {
            Surface(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0B1329)),
                color = Color(0xFF0B1329)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
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
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 2,
                        textAlign = TextAlign.Center
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
