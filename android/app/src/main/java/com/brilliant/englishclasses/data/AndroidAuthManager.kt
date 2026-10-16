package com.brilliant.englishclasses.data

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.util.Log
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import com.brilliant.englishclasses.model.StudentUser
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.net.URLDecoder

object AndroidAuthManager {
    private const val TAG = "AndroidAuthManager"
    private const val PREFS_NAME = "smart_study_auth_prefs"
    private const val KEY_IS_LOGGED_IN = "key_is_logged_in"
    private const val KEY_USER_ID = "key_user_id"
    private const val KEY_USER_NAME = "key_user_name"
    private const val KEY_USER_EMAIL = "key_user_email"
    private const val KEY_USER_AVATAR = "key_user_avatar"
    private const val KEY_USER_ROLL = "key_user_roll"
    private const val KEY_ID_TOKEN = "key_id_token"

    const val SUPABASE_URL = "https://sybtavlkdhhqxnkvdbcq.supabase.co"
    const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5YnRhdmxrZGhocXhua3ZkYmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMTk2NjEsImV4cCI6MjEwNzY5NTY2MX0.1ZCuLtUy6CzL5trbHvryfBtnmsjd6lnlig1XKylfh6Q"
    const val GOOGLE_WEB_CLIENT_ID = "211812649483-50rn2d0j757fk1f32ifc3emg76grj7kp.apps.googleusercontent.com"
    const val OAUTH_REDIRECT_SCHEME = "smartstudy://auth-callback"

    private val httpClient = OkHttpClient()
    private val _currentUser = mutableStateOf<StudentUser?>(null)
    val currentUser: State<StudentUser?> = _currentUser

    val isLoggedIn: Boolean
        get() = _currentUser.value != null

    fun init(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val isLoggedIn = prefs.getBoolean(KEY_IS_LOGGED_IN, false)
        if (isLoggedIn) {
            val id = prefs.getString(KEY_USER_ID, "usr_student") ?: "usr_student"
            val name = prefs.getString(KEY_USER_NAME, "Student") ?: "Student"
            val email = prefs.getString(KEY_USER_EMAIL, "") ?: ""
            val avatar = prefs.getString(KEY_USER_AVATAR, "") ?: ""
            val roll = prefs.getString(KEY_USER_ROLL, "SSE-26-0001") ?: "SSE-26-0001"
            val token = prefs.getString(KEY_ID_TOKEN, null)

            val user = StudentUser(
                id = id,
                fullName = name,
                email = email,
                avatarUrl = avatar,
                rollId = roll,
                isVerified = true,
                idToken = token
            )
            _currentUser.value = user
        }
    }

    /**
     * Native Google Sign-In with Play Services.
     * Passing GOOGLE_WEB_CLIENT_ID requests an idToken verified against Supabase.
     */
    fun getGoogleSignInClient(activity: Activity): GoogleSignInClient {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(GOOGLE_WEB_CLIENT_ID)
            .requestEmail()
            .requestProfile()
            .build()
        return GoogleSignIn.getClient(activity, gso)
    }

    /**
     * Web / Browser-based Google OAuth using Supabase authorize URL.
     * Guaranteed to work on ANY device (emulators, real phones) without needing SHA-1 registered!
     */
    fun launchGoogleOAuthBrowser(context: Context) {
        val oauthUrl = "$SUPABASE_URL/auth/v1/authorize?provider=google&redirect_to=${Uri.encode(OAUTH_REDIRECT_SCHEME)}"
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(oauthUrl)).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    /**
     * Handles the deep link redirected back from Supabase Google OAuth:
     * smartstudy://auth-callback#access_token=...&refresh_token=...
     */
    fun handleOAuthRedirectUri(uri: Uri, context: Context, onComplete: (Boolean, StudentUser?) -> Unit) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Fragment or Query parameters
                var accessToken: String? = null
                val fragment = uri.fragment
                if (!fragment.isNullOrEmpty()) {
                    val params = fragment.split("&")
                    for (param in params) {
                        val pair = param.split("=")
                        if (pair.size == 2 && pair[0] == "access_token") {
                            accessToken = URLDecoder.decode(pair[1], "UTF-8")
                            break
                        }
                    }
                }
                if (accessToken.isNullOrEmpty()) {
                    accessToken = uri.getQueryParameter("access_token")
                }

                if (accessToken.isNullOrEmpty()) {
                    Log.w(TAG, "No access_token found in deep link URI: $uri")
                    withContext(Dispatchers.Main) {
                        onComplete(false, null)
                    }
                    return@launch
                }

                // Query Supabase /auth/v1/user using accessToken
                val userReq = Request.Builder()
                    .url("$SUPABASE_URL/auth/v1/user")
                    .addHeader("apikey", SUPABASE_ANON_KEY)
                    .addHeader("Authorization", "Bearer $accessToken")
                    .get()
                    .build()

                httpClient.newCall(userReq).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body?.string() ?: "{}"
                        val userObj = JSONObject(body)
                        val id = userObj.optString("id", "usr_" + System.currentTimeMillis())
                        val email = userObj.optString("email", "student@smartstudy.com")
                        val meta = userObj.optJSONObject("user_metadata")

                        val name = meta?.optString("full_name")
                            ?: meta?.optString("name")
                            ?: (if (email.contains("@")) email.substringBefore("@") else "Verified Student")
                        val avatar = meta?.optString("avatar_url")
                            ?: meta?.optString("picture")
                            ?: ""

                        val rollSuffix = if (email.contains("@")) {
                            email.substringBefore("@").takeLast(4).uppercase()
                        } else {
                            id.takeLast(4).uppercase()
                        }
                        val rollId = "SSE-26-$rollSuffix"

                        val user = StudentUser(
                            id = id,
                            fullName = name,
                            email = email,
                            avatarUrl = avatar,
                            rollId = rollId,
                            isVerified = true,
                            idToken = accessToken
                        )

                        saveUser(context, user)
                        withContext(Dispatchers.Main) {
                            _currentUser.value = user
                            SupabaseRepository.refreshEnrollments(user.id)
                            onComplete(true, user)
                        }
                        syncProfileToSupabase(user)
                    } else {
                        Log.e(TAG, "Failed to get user profile from Supabase with token. Code: ${response.code}")
                        withContext(Dispatchers.Main) {
                            onComplete(false, null)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error handling OAuth deep link", e)
                withContext(Dispatchers.Main) {
                    onComplete(false, null)
                }
            }
        }
    }

    fun handleGoogleSignInSuccess(account: GoogleSignInAccount, context: Context): StudentUser {
        val id = account.id ?: ("usr_g_" + System.currentTimeMillis())
        val name = account.displayName ?: "Verified Student"
        val email = account.email ?: "student@gmail.com"
        val avatar = account.photoUrl?.toString() ?: ""
        val rollSuffix = if (email.contains("@")) {
            email.substringBefore("@").takeLast(4).uppercase()
        } else {
            id.takeLast(4).uppercase()
        }
        val rollId = "SSE-26-$rollSuffix"
        val idToken = account.idToken

        val user = StudentUser(
            id = id,
            fullName = name,
            email = email,
            avatarUrl = avatar,
            rollId = rollId,
            isVerified = true,
            idToken = idToken
        )

        saveUser(context, user)
        _currentUser.value = user
        SupabaseRepository.refreshEnrollments(user.id)
        syncProfileToSupabase(user)

        return user
    }

    fun signInDemoGoogleUser(context: Context): StudentUser {
        val user = StudentUser(
            id = "usr_g_demo_2026",
            fullName = "Aman Kumar (Verified Google Student)",
            email = "student.kumar@gmail.com",
            avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
            rollId = "SSE-26-G849",
            isVerified = true
        )
        saveUser(context, user)
        _currentUser.value = user
        SupabaseRepository.refreshEnrollments(user.id)
        syncProfileToSupabase(user)
        return user
    }

    fun signOut(context: Context, activity: Activity? = null) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().clear().apply()
        _currentUser.value = null
        SupabaseRepository.refreshEnrollments(null)

        activity?.let {
            try {
                val client = getGoogleSignInClient(it)
                client.signOut()
            } catch (e: Exception) {
                Log.e(TAG, "Error signing out of Google client", e)
            }
        }
    }

    private fun saveUser(context: Context, user: StudentUser) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putBoolean(KEY_IS_LOGGED_IN, true)
            .putString(KEY_USER_ID, user.id)
            .putString(KEY_USER_NAME, user.fullName)
            .putString(KEY_USER_EMAIL, user.email)
            .putString(KEY_USER_AVATAR, user.avatarUrl)
            .putString(KEY_USER_ROLL, user.rollId)
            .putString(KEY_ID_TOKEN, user.idToken)
            .apply()
    }

    private fun syncProfileToSupabase(user: StudentUser) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val json = JSONObject().apply {
                    put("id", user.id)
                    put("full_name", user.fullName)
                    put("email", user.email)
                    put("avatar_url", user.avatarUrl)
                    put("roll_id", user.rollId)
                    put("role", "student")
                }

                val mediaType = "application/json".toMediaType()
                val body = json.toString().toRequestBody(mediaType)

                val request = Request.Builder()
                    .url("$SUPABASE_URL/rest/v1/profiles?on_conflict=id")
                    .addHeader("apikey", SUPABASE_ANON_KEY)
                    .addHeader("Authorization", "Bearer $SUPABASE_ANON_KEY")
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Prefer", "resolution=merge-duplicates")
                    .post(body)
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    Log.d(TAG, "Synced profile to Supabase. Code: ${response.code}")
                }
            } catch (e: Exception) {
                Log.w(TAG, "Could not sync profile to remote Supabase: ${e.message}")
            }
        }
    }
}
