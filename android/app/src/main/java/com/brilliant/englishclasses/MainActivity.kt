package com.brilliant.englishclasses

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
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
import com.brilliant.englishclasses.data.AndroidAuthManager
import com.brilliant.englishclasses.data.SupabaseRepository
import com.brilliant.englishclasses.ui.screens.CourseDetailScreen
import com.brilliant.englishclasses.ui.screens.HomeScreen
import com.brilliant.englishclasses.ui.screens.MyBatchesScreen
import com.brilliant.englishclasses.ui.screens.ProfileScreen
import com.brilliant.englishclasses.ui.theme.BrilliantEnglishClassesTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AndroidAuthManager.init(this)
        SupabaseRepository.init(this)

        handleIncomingDeepLink(intent)

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

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingDeepLink(intent)
    }

    private fun handleIncomingDeepLink(intent: Intent?) {
        val uri: Uri? = intent?.data
        if (uri != null && uri.scheme == "smartstudy" && uri.host == "auth-callback") {
            Toast.makeText(this, "Completing Google Sign-In...", Toast.LENGTH_SHORT).show()
            AndroidAuthManager.handleOAuthRedirectUri(uri, this) { success, user ->
                if (success && user != null) {
                    Toast.makeText(this, "Welcome ${user.fullName}!", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this, "Google Sign-In was cancelled or expired.", Toast.LENGTH_SHORT).show()
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
                    // Notification click
                },
                onSearchClick = {
                    // Search click
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
