package com.brilliant.englishclasses.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.brilliant.englishclasses.model.QuickActionItem
import com.brilliant.englishclasses.model.QuickActionType

data class QuickActionVisual(
    val icon: ImageVector,
    val bgColors: List<Color>,
    val iconColor: Color
)

fun getVisualForAction(type: QuickActionType): QuickActionVisual {
    return when (type) {
        QuickActionType.ALL_COURSES -> QuickActionVisual(
            icon = Icons.Default.School,
            bgColors = listOf(Color(0xFFEEF2FF), Color(0xFFE0E7FF)),
            iconColor = Color(0xFF4338CA)
        )
        QuickActionType.MY_COURSES -> QuickActionVisual(
            icon = Icons.Default.MenuBook,
            bgColors = listOf(Color(0xFFEFF6FF), Color(0xFFDBEAFE)),
            iconColor = Color(0xFF1D4ED8)
        )
        QuickActionType.FREE_CONTENT -> QuickActionVisual(
            icon = Icons.Default.CardGiftcard,
            bgColors = listOf(Color(0xFFFEF3C7), Color(0xFFFDE68A)),
            iconColor = Color(0xFFB45309)
        )
        QuickActionType.LIVE_CLASSES -> QuickActionVisual(
            icon = Icons.Default.Sensors,
            bgColors = listOf(Color(0xFFFFE4E6), Color(0xFFFECDD3)),
            iconColor = Color(0xFFE11D48)
        )
        QuickActionType.TEST_SERIES -> QuickActionVisual(
            icon = Icons.Default.Quiz,
            bgColors = listOf(Color(0xFFF3E8FF), Color(0xFFE9D5FF)),
            iconColor = Color(0xFF7E22CE)
        )
        QuickActionType.PAID_NOTES -> QuickActionVisual(
            icon = Icons.Default.AutoStories,
            bgColors = listOf(Color(0xFFECFDF5), Color(0xFFD1FAE5)),
            iconColor = Color(0xFF047857)
        )
        QuickActionType.FREE_NOTES -> QuickActionVisual(
            icon = Icons.Default.Description,
            bgColors = listOf(Color(0xFFF0FDF4), Color(0xFFDCFCE7)),
            iconColor = Color(0xFF15803D)
        )
        QuickActionType.FREE_VIDEOS -> QuickActionVisual(
            icon = Icons.Default.PlayCircle,
            bgColors = listOf(Color(0xFFFFF1F2), Color(0xFFFFE4E6)),
            iconColor = Color(0xFFBE123C)
        )
        QuickActionType.YOUTUBE -> QuickActionVisual(
            icon = Icons.Default.SmartDisplay,
            bgColors = listOf(Color(0xFFFF0000).copy(alpha = 0.12f), Color(0xFFFF0000).copy(alpha = 0.22f)),
            iconColor = Color(0xFFFF0000)
        )
        QuickActionType.INSTAGRAM -> QuickActionVisual(
            icon = Icons.Default.CameraAlt,
            bgColors = listOf(Color(0xFFFDF2F8), Color(0xFFFCE7F3)),
            iconColor = Color(0xFFC13584)
        )
        QuickActionType.FACEBOOK -> QuickActionVisual(
            icon = Icons.Default.ThumbUp,
            bgColors = listOf(Color(0xFFEFF6FF), Color(0xFFDBEAFE)),
            iconColor = Color(0xFF1877F2)
        )
        QuickActionType.WHATSAPP -> QuickActionVisual(
            icon = Icons.Default.Chat,
            bgColors = listOf(Color(0xFFF0FDF4), Color(0xFFDCFCE7)),
            iconColor = Color(0xFF25D366)
        )
        QuickActionType.SHARE_APP -> QuickActionVisual(
            icon = Icons.Default.Share,
            bgColors = listOf(Color(0xFFF8FAFC), Color(0xFFE2E8F0)),
            iconColor = Color(0xFF334155)
        )
    }
}

@Composable
fun QuickActionGrid(
    items: List<QuickActionItem>,
    onActionClick: (QuickActionItem) -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp)
    ) {
        // Section title
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 2.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Explore Categories & Resources",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A)
            )
        }

        Spacer(modifier = Modifier.height(6.dp))

        // 3 boxes in single line and again 3 boxes and so on
        // Using chunked(3) so each row contains precisely 3 items
        val rows = items.chunked(3)
        rows.forEach { rowItems ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 5.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                rowItems.forEach { item ->
                    Box(modifier = Modifier.weight(1f)) {
                        QuickActionBox(item = item, onClick = { onActionClick(item) })
                    }
                }
                // Fill blank spaces if the last row has fewer than 3 items
                if (rowItems.size < 3) {
                    repeat(3 - rowItems.size) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
fun QuickActionBox(
    item: QuickActionItem,
    onClick: () -> Unit
) {
    val visual = getVisualForAction(item.type)

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(96.dp)
            .shadow(elevation = 2.dp, shape = RoundedCornerShape(14.dp))
            .clip(RoundedCornerShape(14.dp))
            .border(width = 1.dp, color = Color(0xFFF1F5F9), shape = RoundedCornerShape(14.dp))
            .clickable { onClick() },
        color = Color.White
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp)
        ) {
            // Live pulsing indicator or badge if available
            if (item.isLive) {
                Row(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFFE11D48))
                        .padding(horizontal = 5.dp, vertical = 2.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(5.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "LIVE",
                        color = Color.White,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            } else if (item.badge != null) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF10B981))
                        .padding(horizontal = 5.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = item.badge,
                        color = Color.White,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Main Content: Icon and Text centered
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(visual.bgColors)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = visual.icon,
                        contentDescription = item.title,
                        tint = visual.iconColor,
                        modifier = Modifier.size(22.dp)
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = item.title,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF1E293B),
                    textAlign = TextAlign.Center,
                    maxLines = 2,
                    lineHeight = 13.sp
                )
            }
        }
    }
}
