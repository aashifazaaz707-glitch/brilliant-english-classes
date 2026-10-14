package com.brilliant.englishclasses.config

import android.content.Context
import androidx.compose.ui.graphics.Color
import org.json.JSONObject
import java.io.InputStreamReader

data class BrandingColors(
    val primary: Color,
    val primaryDark: Color,
    val primaryLight: Color,
    val accent: Color,
    val surface: Color,
    val background: Color
)

data class ContactConfig(
    val teacherName: String = "Krishna Kumar",
    val legalName: String = "Krishna Kumar",
    val address: String = "NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR",
    val phone: String,
    val whatsapp: String,
    val email: String,
    val youtubeUrl: String,
    val instagramUrl: String,
    val facebookUrl: String
)

data class FeatureFlags(
    val enableLiveClasses: Boolean = true,
    val enableTestSeries: Boolean = true,
    val enablePaidNotes: Boolean = true,
    val enableFreeNotes: Boolean = true,
    val enableFreeVideos: Boolean = true,
    val enableWhatsAppSupport: Boolean = true
)

data class TenantConfig(
    val clientId: String,
    val clientName: String,
    val shortName: String,
    val tagline: String,
    val category: String,
    val colors: BrandingColors,
    val contact: ContactConfig,
    val features: FeatureFlags,
    val currencySymbol: String = "₹"
)

object TenantManager {
    private var activeConfig: TenantConfig = defaultBrilliantConfig()

    fun get(): TenantConfig = activeConfig

    fun set(config: TenantConfig) {
        activeConfig = config
    }

    /**
     * Loads the white-label config dynamically from assets/tenant_config.json
     * This enables selling this app to different coaching institutes with 0 code changes!
     */
    fun loadFromAssets(context: Context): TenantConfig {
        return try {
            val inputStream = context.assets.open("tenant_config.json")
            val reader = InputStreamReader(inputStream)
            val jsonStr = reader.readText()
            reader.close()

            val json = JSONObject(jsonStr)
            val branding = json.getJSONObject("branding")
            val contact = json.getJSONObject("contact")
            val features = json.optJSONObject("features")

            val colors = BrandingColors(
                primary = parseHexColor(branding.optString("primaryColor", "#1340B5")),
                primaryDark = parseHexColor(branding.optString("primaryDarkColor", "#081D58")),
                primaryLight = parseHexColor(branding.optString("primaryLightColor", "#3366EE")),
                accent = parseHexColor(branding.optString("accentColor", "#FFB800")),
                surface = parseHexColor(branding.optString("surfaceColor", "#FFFFFF")),
                background = parseHexColor(branding.optString("backgroundColor", "#F8FAFC"))
            )

            val contactConfig = ContactConfig(
                teacherName = contact.optString("teacherName", "Krishna Kumar"),
                legalName = contact.optString("legalName", "Krishna Kumar"),
                address = contact.optString("address", "NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR"),
                phone = contact.optString("phone", "+91 98765 43210"),
                whatsapp = contact.optString("whatsapp", "919876543210"),
                email = contact.optString("email", "support@smartstudyenglishclasses.com"),
                youtubeUrl = contact.optString("youtubeUrl", "https://youtube.com/@smartstudyenglishclasses"),
                instagramUrl = contact.optString("instagramUrl", "https://instagram.com/smartstudyenglishclasses"),
                facebookUrl = contact.optString("facebookUrl", "https://facebook.com/smartstudyenglishclasses")
            )

            val featureFlags = FeatureFlags(
                enableLiveClasses = features?.optBoolean("enableLiveClasses", true) ?: true,
                enableTestSeries = features?.optBoolean("enableTestSeries", true) ?: true,
                enablePaidNotes = features?.optBoolean("enablePaidNotes", true) ?: true,
                enableFreeNotes = features?.optBoolean("enableFreeNotes", true) ?: true,
                enableFreeVideos = features?.optBoolean("enableFreeVideos", true) ?: true,
                enableWhatsAppSupport = features?.optBoolean("enableWhatsAppSupport", true) ?: true
            )

            val config = TenantConfig(
                clientId = json.optString("clientId", "smart_study_english"),
                clientName = json.optString("clientName", "Smart Study English Classes"),
                shortName = json.optString("shortName", "Smart Study"),
                tagline = json.optString("tagline", "Learn • Practice • Master"),
                category = json.optString("category", "English & Spoken Mastery"),
                colors = colors,
                contact = contactConfig,
                features = featureFlags,
                currencySymbol = json.optJSONObject("payment")?.optString("currencySymbol", "₹") ?: "₹"
            )

            activeConfig = config
            config
        } catch (e: Exception) {
            e.printStackTrace()
            defaultBrilliantConfig()
        }
    }

    private fun parseHexColor(hex: String): Color {
        return try {
            Color(android.graphics.Color.parseColor(hex))
        } catch (e: Exception) {
            Color(0xFF1340B5)
        }
    }

    private fun defaultBrilliantConfig(): TenantConfig {
        return TenantConfig(
            clientId = "smart_study_english",
            clientName = "Smart Study English Classes",
            shortName = "Smart Study",
            tagline = "Learn • Practice • Master",
            category = "English & Spoken Mastery",
            colors = BrandingColors(
                primary = Color(0xFF1340B5),
                primaryDark = Color(0xFF081D58),
                primaryLight = Color(0xFF3366EE),
                accent = Color(0xFFFFB800),
                surface = Color(0xFFFFFFFF),
                background = Color(0xFFF8FAFC)
            ),
            contact = ContactConfig(
                teacherName = "Krishna Kumar",
                legalName = "Krishna Kumar",
                address = "NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR",
                phone = "+91 98765 43210",
                whatsapp = "919876543210",
                email = "support@smartstudyenglishclasses.com",
                youtubeUrl = "https://youtube.com/@smartstudyenglishclasses",
                instagramUrl = "https://instagram.com/smartstudyenglishclasses",
                facebookUrl = "https://facebook.com/smartstudyenglishclasses"
            ),
            features = FeatureFlags()
        )
    }
}
