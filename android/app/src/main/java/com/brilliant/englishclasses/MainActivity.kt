package com.brilliant.englishclasses

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.brilliant.englishclasses.ui.screens.CourseDetailScreen
import com.brilliant.englishclasses.ui.screens.HomeScreen
import com.brilliant.englishclasses.ui.screens.MyBatchesScreen
import com.brilliant.englishclasses.ui.screens.ProfileScreen
import com.brilliant.englishclasses.ui.theme.BrilliantEnglishClassesTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            BrilliantEnglishClassesTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation()
                }
            }
        }
    }
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") {
            HomeScreen(
                onCourseClick = { courseId ->
                    navController.navigate("course_detail/$courseId")
                },
                onNotificationClick = {
                    // Navigate or trigger notifications
                },
                onSearchClick = {
                    // Search action
                },
                onTabSelected = { route ->
                    if (route != "home") {
                        navController.navigate(route) {
                            popUpTo("home") { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                }
            )
        }

        composable("my_batches") {
            MyBatchesScreen(
                onCourseClick = { courseId ->
                    navController.navigate("course_detail/$courseId")
                },
                onTabSelected = { route ->
                    if (route == "home") {
                        navController.popBackStack("home", inclusive = false)
                    } else if (route != "my_batches") {
                        navController.navigate(route) {
                            popUpTo("home") { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                }
            )
        }

        composable("profile") {
            ProfileScreen(
                onTabSelected = { route ->
                    if (route == "home") {
                        navController.popBackStack("home", inclusive = false)
                    } else if (route != "profile") {
                        navController.navigate(route) {
                            popUpTo("home") { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                }
            )
        }

        composable(
            route = "course_detail/{courseId}",
            arguments = listOf(navArgument("courseId") { type = NavType.StringType })
        ) { backStackEntry ->
            val courseId = backStackEntry.arguments?.getString("courseId") ?: ""
            CourseDetailScreen(
                courseId = courseId,
                onBackClick = { navController.popBackStack() }
            )
        }
    }
}
