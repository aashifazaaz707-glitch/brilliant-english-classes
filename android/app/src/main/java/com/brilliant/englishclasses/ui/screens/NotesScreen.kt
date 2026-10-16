package com.brilliant.englishclasses.ui.screens

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.brilliant.englishclasses.ui.components.AppBottomBar

data class StudyNoteItem(
    val id: String,
    val title: String,
    val category: String,
    val pages: String,
    val fileSize: String,
    val isFree: Boolean,
    val pdfUrl: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotesScreen(
    onTabSelected: (String) -> Unit = {},
    onBackClick: () -> Unit = {}
) {
    val context = LocalContext.current
    var selectedCategory by remember { mutableStateOf("All") }

    val categories = listOf("All", "Class 12th", "Class 11th", "Grammar", "Question Bank", "Formulas")

    val allNotes = remember {
        listOf(
            StudyNoteItem(
                id = "note_1",
                title = "Class 12th Rainbow Prose: Full Chapter Summaries & Key Questions",
                category = "Class 12th",
                pages = "48 Pages",
                fileSize = "4.2 MB",
                isFree = true,
                pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            ),
            StudyNoteItem(
                id = "note_2",
                title = "Class 12th Rainbow Poetry: Line-by-Line Explanation & Poetic Devices",
                category = "Class 12th",
                pages = "36 Pages",
                fileSize = "3.1 MB",
                isFree = true,
                pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            ),
            StudyNoteItem(
                id = "note_3",
                title = "Complete English Grammar Master Rules & Tenses Formula Sheet",
                category = "Grammar",
                pages = "64 Pages",
                fileSize = "5.6 MB",
                isFree = false,
                pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            ),
            StudyNoteItem(
                id = "note_4",
                title = "Last 5 Years Bihar Board 100 Marks English Solved Papers",
                category = "Question Bank",
                pages = "92 Pages",
                fileSize = "8.4 MB",
                isFree = true,
                pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            ),
            StudyNoteItem(
                id = "note_5",
                title = "Active-Passive & Direct-Indirect Voice Quick Revision Notes",
                category = "Grammar",
                pages = "28 Pages",
                fileSize = "2.3 MB",
                isFree = true,
                pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            ),
            StudyNoteItem(
                id = "note_6",
                title = "Class 11th English Core Prose & Poetry Comprehensive Notes",
                category = "Class 11th",
                pages = "42 Pages",
                fileSize = "3.8 MB",
                isFree = true,
                pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            )
        )
    }

    val filteredNotes = if (selectedCategory == "All") {
        allNotes
    } else {
        allNotes.filter { it.category == selectedCategory }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Study Notes & PDF Booklets",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0F172A)
                        )
                        Text(
                            text = "Download & read offline anytime",
                            fontSize = 12.sp,
                            color = Color(0xFF64748B)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color(0xFF0F172A)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        },
        bottomBar = {
            AppBottomBar(
                currentRoute = "downloads",
                onTabSelected = onTabSelected
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFFF8FAFC)),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Category Filter Row
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(categories) { cat ->
                        val isSelected = cat == selectedCategory
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .clickable { selectedCategory = cat },
                            color = if (isSelected) Color(0xFF4F46E5) else Color.White,
                            shape = RoundedCornerShape(20.dp),
                            border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E8F0))
                        ) {
                            Text(
                                text = cat,
                                color = if (isSelected) Color.White else Color(0xFF475569),
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
            }

            // Notes List
            items(filteredNotes) { note ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // PDF Icon Container
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFFFEF2F2)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Description,
                                contentDescription = "PDF Note",
                                tint = Color(0xFFDC2626),
                                modifier = Modifier.size(26.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(
                            modifier = Modifier.weight(1f)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = if (note.isFree) Color(0xFFDCFCE7) else Color(0xFFFEF3C7)
                                ) {
                                    Text(
                                        text = if (note.isFree) "FREE" else "PREMIUM",
                                        color = if (note.isFree) Color(0xFF166534) else Color(0xFF92400E),
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = note.category,
                                    fontSize = 11.sp,
                                    color = Color(0xFF64748B),
                                    fontWeight = FontWeight.Medium
                                )
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = note.title,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF0F172A),
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis,
                                lineHeight = 18.sp
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = "${note.pages} • ${note.fileSize}",
                                fontSize = 11.sp,
                                color = Color(0xFF94A3B8)
                            )
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        // Download / View Button
                        IconButton(
                            onClick = {
                                Toast.makeText(context, "Opening PDF: ${note.title}", Toast.LENGTH_SHORT).show()
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(note.pdfUrl))
                                context.startActivity(intent)
                            },
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFEEF2FF))
                        ) {
                            Icon(
                                imageVector = Icons.Default.Download,
                                contentDescription = "Download Note",
                                tint = Color(0xFF4F46E5),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
