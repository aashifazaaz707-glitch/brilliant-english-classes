# 🌟 Smart Study English Classes - Android App & Prototype

An official, modern Kotlin Android application built for **Smart Study English Classes** (Lead Teacher & Legal Entity: **Krishna Kumar**). It features a Material 3 design system, Clean Architecture, and an interactive live web prototype with administrative console.

* **Registered Physical Address / Center**: `NEAR BUS STAND INFRONT OF BANK OF BRODA, 1ST FLOOR, MADHEPUR, MADHUBANI , BIHAR`
* **Lead Faculty & Legal Representative**: `Krishna Kumar`

---

## 📱 App Highlights & Architecture

### 1. Unified Top Header Box
* **Top Row**: 
  * **Top Left**: Official circular logo badge + Coaching title **"Smart Study English Classes"** and tagline *"Learn • Practice • Master"*.
  * **Top Right**: Interactive Notification Bell with unread badge counter.
* **Greeting**: **"Hello, User 👋"** with a motivational student subtitle, positioned directly under the logo.
* **Search Course Bar**: Full-length wide search button with icon and voice mic trigger.
* **Unified Enclosure**: Wrapped in a **single royal blue gradient container** (`UnifiedHeaderCard.kt`) with smooth curved bottom corners (`28.dp`), seamlessly unifying the header, notification bell, greeting, and search bar.

---

### 2. ⚡ Featured Banners Carousel (16:9 Aspect Ratio)
* **YouTube Thumbnail Aspect Ratio (16:9)**: Designed specifically for new batch launch posters and announcement banners.
* **Interactive Slider**: Smooth page snapping, animated dot indicators, and touch gestures.
* **Direct Navigation**: Tapping any banner navigates directly to that batch's detail page (`CourseDetailScreen.kt`).

---

### 3. 🎯 3-Boxes-Per-Line Quick Action Grid
Organized in a balanced **3 columns per row** layout with clean iconography, rounded cards, and category styling:
1. **All Courses** 🎓
2. **My Courses** 📚
3. **Free Content** 🎁 *(with 'FREE' pill badge)*
4. **Live Classes** 📡 *(with real-time pulsing red LIVE indicator)*
5. **Test Series** 📝
6. **Paid Notes** 📑
7. **Free Notes** 📄
8. **Free Videos** 🎬
9. **YouTube** ▶️ *(Direct link/intent to official coaching YouTube channel)*
10. **Instagram** 📸 *(Direct link to official Instagram handle)*
11. **Facebook** 👥 *(Direct link to official Facebook community)*
12. **WhatsApp** 💬 *(Direct chat with admissions counselor)*
13. **Share App** 🚀 *(System share sheet to invite classmates)*

---

### 4. 🔄 Horizontally Scrolling Course Cards (1 Complete Box + 30% Next Box Peek)
* **Smart Horizontal Pager**: Sized at `76%` width so that students see **1 complete course card and ~30% of the next card**, visually signaling horizontal scrollability.
* **Card Anatomy**:
  * **16:9 HD Thumbnail** with Category and Discount Pill (`67% OFF`).
  * **Batch Info**: Star rating (`★ 4.9`), student enrollments, and start dates.
  * **Pricing**: Offer Price (`₹999`), Original Price (`₹2,999` with strikethrough), and savings badge.
  * **Dual Action Buttons**:
    * **"View More" / "View Details"** *(Outlined button)*: Opens course curriculum, syllabus, and video demo.
    * **"⚡ Buy Now"** *(Vibrant solid button)*: Direct enrollment flow.

---

### 5. 🛠 Extra Features Built-In
* **WhatsApp Counselor FAB**: Instant 1-tap support via floating action button.
* **Bottom Navigation Bar**: Home, My Batches, Live, Notes, and Profile.
* **Course Detail Screen**: Complete batch breakdown, mentor credentials, and sticky bottom enrollment bar.
* **Notification Drawer**: Instant access to alerts and updates.
* **Live Search Filter**: Search through available courses in real-time.

---

## 📂 Project Structure

```
├── android/                                 # Native Kotlin Android Project
│   ├── settings.gradle.kts
│   ├── build.gradle.kts
│   ├── gradle.properties
│   └── app/
│       ├── build.gradle.kts                # Jetpack Compose & Material 3 setup
│       └── src/main/
│           ├── AndroidManifest.xml
│           ├── res/values/                 # strings.xml, colors.xml, themes.xml
│           ├── assets/                     # 16:9 thumbnails and coaching logo
│           └── java/com/brilliant/englishclasses/
│               ├── MainActivity.kt         # Navigation Host & Activity
│               ├── data/MockData.kt        # Realistic sample courses & banners
│               ├── model/Course.kt         # Course, Banner, and Action models
│               ├── ui/theme/               # Material 3 Theme, Color, Typography
│               ├── ui/screens/
│               │   ├── HomeScreen.kt       # Complete home screen
│               │   └── CourseDetailScreen.kt
│               └── ui/components/
│                   ├── UnifiedHeaderCard.kt             # Unified header box
│                   ├── FeaturedBannerCarousel.kt        # 16:9 banner slider
│                   ├── QuickActionGrid.kt               # 3-boxes per row grid
│                   ├── CourseHorizontalScrollSection.kt # 1 full + 30% peek cards
│                   └── AppBottomBar.kt                  # Material 3 bottom nav
│
├── public/images/                           # High-res 16:9 thumbnails & logo
├── src/                                     # Interactive Live Web Prototype
│   ├── main.js                             # Interactive app simulation
│   └── style.css                            # Modern styling & mobile frame
├── index.html
└── package.json
```

---

## 🛠️ Admin Panel Overview

A comprehensive administrative control console designed specifically for coaching owners and instructors to manage all aspects of the **Smart Study English Classes** mobile app:

### 1. 📊 Coaching Analytics & Revenue
* Track real-time gross revenue, active student count, and batch enrollment metrics.
* Performance indicators comparing monthly and weekly admissions.

### 2. 🎓 Course Catalog & Batch Manager
* **Create New Course**: Define course title, category (Spoken English, Govt Exams, Grammar, Vocabulary), faculty name, schedule, original price, and discounted offer price.
* **Auto-Discount Calculation**: Calculates and displays discount badges (e.g. `67% OFF`) automatically.
* **Instant App Sync**: Newly published courses immediately appear in the mobile app's horizontal peek carousel and live search filter.

### 3. 🖼️ 16:9 Batch Launch Banners Manager
* Manage the top auto-advancing promotional banners in the app.
* Set custom badges (e.g., `🔥 NEW BATCH`, `⭐ TOP RATED`), promotional headlines, and link banners directly to course detail pages.

### 4. 📑 Study Materials & PDF Notes
* Upload and organize **Free Notes** and **Paid Notes** (with pricing).
* Track student download volume across handouts and formula sheets.

### 5. 🔔 Push Notifications Broadcaster
* Send instant announcement alerts directly to students.
* Updates the notification bell badge count (`3+`) and opens directly in the mobile drawer.

### 6. 👥 Student Enrollments & Fee Receipts
* Complete ledger of registered students, contact numbers, enrolled courses, payment timestamps, and admission status.

### 7. ⚙️ Coaching Information & Helplines
* Configure WhatsApp counselor numbers, phone helplines, and social media handles (YouTube, Instagram, Facebook).

---

## ⚡ 3 Interactive View Modes

On the top right of the dashboard, you can switch between three display modes:
1. **🛠️ Admin Only**: Full-screen administration console for the coaching team.
2. **📱 App Only**: Standalone Kotlin Android smartphone simulator with full touch navigation.
3. **⚡ Split Screen**: **Desktop Admin Panel on the left, Live Android Phone on the right**. When you add a new course or banner in the admin panel, you see it appear live on the phone screen instantly!

---

## 🚀 How to Run

### 1. View Interactive Web Prototype & Admin Panel Locally
```bash
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 2. Open in Android Studio
1. Open **Android Studio**.
2. Select **Open an Existing Project** and navigate to:
   `/home/azazlab/Desktop/brilliant english classes/android`
3. Allow Gradle to sync.
4. Run on an Android emulator or physical device.

