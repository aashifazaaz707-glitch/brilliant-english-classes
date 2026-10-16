package com.brilliant.englishclasses.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.brilliant.englishclasses.model.Course
import com.brilliant.englishclasses.ui.theme.AmberAccent
import com.brilliant.englishclasses.ui.theme.RoyalBlueDark
import com.brilliant.englishclasses.ui.theme.RoyalBluePrimary

@Composable
fun CourseHorizontalScrollSection(
    title: String = "Popular & Recommended Batches",
    courses: List<Course>,
    onCourseClick: (Course) -> Unit = {},
    onBuyNowClick: (Course) -> Unit = {}
) {
    val configuration = LocalConfiguration.current
    // Setting card width to 74% of screen width so 1 complete card + ~30% of next card is peeked
    val cardWidth = (configuration.screenWidthDp * 0.76f).dp

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp)
    ) {
        // Section Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 18.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = title,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A)
                )
                Text(
                    text = "Swipe horizontally to explore more →",
                    fontSize = 12.sp,
                    color = Color(0xFF64748B)
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Horizontally scrolling list showing 1 complete box + 30% of next box
        LazyRow(
            contentPadding = PaddingValues(horizontal = 18.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(courses, key = { it.id }) { course ->
                CourseCardItem(
                    course = course,
                    cardWidth = cardWidth,
                    onViewMore = { onCourseClick(course) },
                    onBuyNow = { onBuyNowClick(course) }
                )
            }
        }
    }
}

@Composable
fun CourseCardItem(
    course: Course,
    cardWidth: androidx.compose.ui.unit.Dp,
    onViewMore: () -> Unit,
    onBuyNow: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(cardWidth)
            .shadow(elevation = 5.dp, shape = RoundedCornerShape(18.dp))
            .clip(RoundedCornerShape(18.dp))
            .border(width = 1.dp, color = Color(0xFFE2E8F0), shape = RoundedCornerShape(18.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            // COURSE THUMBNAIL (16:9 YouTube thumbnail ratio)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(com.brilliant.englishclasses.data.SupabaseRepository.resolveImageUrl(course.thumbnail))
                        .crossfade(true)
                        .build(),
                    contentDescription = course.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )

                // Category badge top left
                Box(
                    modifier = Modifier
                        .padding(8.dp)
                        .align(Alignment.TopStart)
                        .clip(RoundedCornerShape(6.dp))
                        .background(RoyalBlueDark.copy(alpha = 0.88f))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = course.category,
                        color = Color.White,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Discount percentage pill top right
                Box(
                    modifier = Modifier
                        .padding(8.dp)
                        .align(Alignment.TopEnd)
                        .clip(RoundedCornerShape(6.dp))
                        .background(Color(0xFFE11D48))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "${course.discountPercentage}% OFF",
                        color = Color.White,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            }

            // COURSE DETAILS
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp)
            ) {
                // Rating and Batch Info
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "Rating",
                            tint = AmberAccent,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = course.rating.toString(),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1E293B)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "(${course.studentCount})",
                            fontSize = 11.sp,
                            color = Color(0xFF64748B)
                        )
                    }

                    Text(
                        text = course.batchDate,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = RoyalBluePrimary
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                // COURSE TITLE
                Text(
                    text = course.title,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 19.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "By ${course.faculty}",
                    fontSize = 12.sp,
                    color = Color(0xFF64748B),
                    maxLines = 1
                )

                Spacer(modifier = Modifier.height(10.dp))

                // PRICING SECTION (Discount Price + Original Price)
                Row(
                    verticalAlignment = Alignment.Bottom,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "₹${course.discountPrice}",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF0F172A)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "₹${course.originalPrice}",
                        fontSize = 14.sp,
                        color = Color(0xFF94A3B8),
                        textDecoration = TextDecoration.LineThrough,
                        modifier = Modifier.padding(bottom = 2.dp)
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    Text(
                        text = "Save ₹${course.originalPrice - course.discountPrice}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF16A34A),
                        modifier = Modifier.padding(bottom = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // ACTION BUTTONS: "View More" AND "Buy Now" inside single box
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // View More Button
                    OutlinedButton(
                        onClick = onViewMore,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(40.dp),
                        contentPadding = PaddingValues(horizontal = 4.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = RoyalBluePrimary
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, RoyalBluePrimary)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "View More",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Buy Now Button
                    Button(
                        onClick = onBuyNow,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(40.dp),
                        contentPadding = PaddingValues(horizontal = 4.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = RoyalBluePrimary
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.Bolt,
                            contentDescription = null,
                            tint = AmberAccent,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Buy Now",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}
