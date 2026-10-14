package com.brilliant.englishclasses.ui.components

import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.brilliant.englishclasses.ui.theme.RoyalBluePrimary

data class NavigationTab(
    val route: String,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
)

val NavigationTabs = listOf(
    NavigationTab("home", "Home", Icons.Filled.Home, Icons.Outlined.Home),
    NavigationTab("my_batches", "My Batches", Icons.Filled.VideoLibrary, Icons.Outlined.VideoLibrary),
    NavigationTab("live", "Live", Icons.Filled.Sensors, Icons.Outlined.Sensors),
    NavigationTab("downloads", "Notes", Icons.Filled.Description, Icons.Outlined.Description),
    NavigationTab("profile", "Profile", Icons.Filled.Person, Icons.Outlined.Person)
)

@Composable
fun AppBottomBar(
    currentRoute: String = "home",
    onTabSelected: (String) -> Unit = {}
) {
    NavigationBar(
        containerColor = Color.White,
        tonalElevation = 8.dp
    ) {
        NavigationTabs.forEach { tab ->
            val isSelected = currentRoute == tab.route
            NavigationBarItem(
                selected = isSelected,
                onClick = { onTabSelected(tab.route) },
                icon = {
                    Icon(
                        imageVector = if (isSelected) tab.selectedIcon else tab.unselectedIcon,
                        contentDescription = tab.label,
                        modifier = Modifier.size(24.dp)
                    )
                },
                label = {
                    Text(
                        text = tab.label,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = RoyalBluePrimary,
                    selectedTextColor = RoyalBluePrimary,
                    indicatorColor = RoyalBluePrimary.copy(alpha = 0.12f),
                    unselectedIconColor = Color(0xFF64748B),
                    unselectedTextColor = Color(0xFF64748B)
                )
            )
        }
    }
}
