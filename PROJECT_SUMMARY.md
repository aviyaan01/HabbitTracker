# 📱 HabbitTracker (Habit Tracker Complete Project) — Complete Project Overview

This document provides a detailed description of all the features, technologies used, file structure, and implementations in the **HabbitTracker** project.

---

## 📌 1. Project Overview

**HabbitTracker** is a modern, feature-rich habit tracking and daily task management platform, built to be accessible through three primary platforms:
1. **Web App / Progressive Web App (PWA):** Usable offline on browser and mobile.
2. **Android Application (`habit-tracker-android`):** A native app built with Kotlin and WebView for Android devices.
3. **Node.js Express Backend (`server.js`):** A REST API server for user authentication and cross-device data syncing.

---

## 🏗️ 2. What Has Been Built & Implemented

### 🔹 A. Frontend & Progressive Web App (PWA) (`habit-tracker-full/`)
1. **Ember & Tide Nocturnal Luxury Design System & Typography:**
   - **Surface & Canvas (`#171210` / `#110D0B` / `#1F1B18`):** Premium warm and calming dark canvas (Organic roasted charcoal umber undertone).
   - **M3 Container Cards (`rgba(35, 31, 28, 0.78)` / `#231F1C` / `#2E2927`):** Modern glassmorphism surface with 24px blur and hairline border.
   - **Cream Primary Ink (`#EBE0DC`) & Warm Muted (`#E3BEB6`) & Outline (`#AA8982`):** Eye-comfortable, high-contrast text.
   - **Ember Primary Accent (`#FF5A36`):** Used for streak fire icon, habit complete toggle, primary action buttons, sparkline fill, and ambient glow (`--glow-ember`).
   - **Tide Teal Accent (`#49DCC9` / `#02BAA8`):** Used for AI coaching insights, intelligent scheduling, Pro identity, and focus borders.
   - **Marigold Reward Gold (`#FABC41` / `#BF8900`):** Used for streak milestones, reward badges, challenge reward cards, and goal completion ticks.
   - **Crimson Red (`#FFB4AB` / `#93000A`):** Used for missed habit states, error messages, delete, and destructive action confirmations.
   - **Pro Gradient (`linear-gradient(135deg, #49DCC9 0%, #02BAA8 52%, #FF5A36 100%)`):** Used for Pro upgrade CTAs and pricing headers.
   - **Atmospheric Glows & Radii:** Radiation glow effects up to 30px and fluid 24px rounded corners (`--radius-3xl`).
   - **Typography:** *Plus Jakarta Sans* (UI text/headings) and *JetBrains Mono* (stats/timestamps) from Google Fonts.

2. **Habit & Task Management Engine:**
   - **Daily Habit Tracking:** Adding daily habits, setting categories, and streak tracking.
   - **Streaks Counter & Best Streak:** Current streak and all-time best streak counter to maintain habit consistency.
   - **Reminder & Time Windows:** Setting reminder times with a ±30-minute time window (Upcoming, Available, Missed states).
   - **Custom Day Scheduling:** Interactive day chips for selecting specific days of the week.

3. **Weekly Goals & Gamification:**
   - **Weekly Focus & Target:** Setting a weekly completion percentage target (e.g., 80%) with a graphical progress donut chart.
   - **Celebration Animations:** Confetti animation when daily or weekly goals are achieved.

4. **Advanced Analytics & History:**
   - **History Tab:** All-time completion percentage breakdown and time-based activity log for each habit (with timestamps).
   - **Monthly Tab:** Monthly top habits ranking and a "Clear All Data" option.

5. **Offline Storage & Data Portability:**
   - **LocalStorage Persistence:** All data stored securely in the browser without requiring an internet connection.
   - **JSON Import/Export:** Option to export data as a backup and import/restore on any device at any time.
   - **PWA Capabilities:** `manifest.json` and `sw.js` (Service Worker) included, allowing the app to be installed on mobile or PC home screens.

---

### 🔹 B. Backend Sync Server & End-to-End API Integration (`server.js`)
- High-performance backend server built with Node.js and Express.js.
- **Crypto Session Tokens:** Secure 64-character session tokens generated via `crypto.randomBytes(32)`, protected on each request via the `Authorization: Bearer <token>` header.
- **User Authentication & Session Management:**
  - `POST /api/auth/register`: New account creation with automatic session issuance.
  - `POST /api/auth/login`: Login verification and session token issuance.
  - `POST /api/auth/logout`: Server-side token invalidation.
  - `401 Unauthorized` handling: Automatic redirect and login modal display for expired sessions.
- **Server-Side Plan Limit Gating (Anti-Spoofing):**
  - Free plan maximum 5-habit limit enforced at the server level (sending 6 or more via `POST /api/sync` returns `HTTP 403 Forbidden` / `PLAN_LIMIT_EXCEEDED`).
  - `POST /api/upgrade`: Real endpoint for upgrading to Pro or Team plan.
  - `POST /api/challenges/start`: Pro plan validation for paid challenges.
- **Optimistic UI with Instant Rollback:**
  - Habit ticking and adding feels instant to the user.
  - If a network error or server rejection occurs, the state is automatically rolled back and a toast notification is displayed.
- **Debounced Weekly Goals:** 500-millisecond debounce timer added to prevent server overload while typing.
- **Offline-First Sync Queue:** Data is stored in localStorage while offline and automatically syncs with the server when internet connection is restored (`window.addEventListener('online')`).

- **Production Readiness & Zero-Seed Architecture (Clean Real User Engine):**
   - **Zero Mock Data:** Database (`db.json`) starts with a completely empty seed (`{ "users": {}, "data": {}, "sessions": {} }`). No dummy accounts or hardcoded habits.
   - **Cohesive Empty States:** Attractive Ember & Tide empty state cards created for all tabs (Daily, Weekly, Monthly, AI Coach, Analytics, History) for new users.
   - **Strict Validation & Anti-XSS:** Strict filtering on habit and task input (2–60 characters, duplicate checking, control character filtering, and complete HTML escaping).
   - **Real API Persistence:** UI is 100% dynamic and directly synced with the backend API.

---

### 🔹 C. Native Android Application (`habit-tracker-android/`)
- Android app built using Kotlin and Android SDK.
- **WebView Integration:** `file:///android_asset/index.html` is loaded directly via `MainActivity.kt`.
- Native experience ensured by enabling DOM Storage, Local Database, and JavaScript support.

---

### 🔹 D. Complete Project Documentation (`docs/`)
6 professional technical documentation files have been created for the project in **Markdown (`.md`)** and **Microsoft Word (`.docx`)** formats:

1. **`1_PRD_Product_Requirements_Document`:** Project goals, user personas, and core features.
2. **`2_TRD_Technical_Requirements_Document`:** Technical architecture, stack, and data models.
3. **`3_App_Document_Flow`:** Screen navigation, user journey, and operational flowcharts.
4. **`4_UIUX_Design_Brief`:** Color palette, typography, theme guide, and design components.
5. **`5_Backend_Schema_Document`:** REST API endpoints, JSON payloads, and server data models.
6. **`6_Implementation_Plan`:** Development roadmap, testing, and deployment guide.
7. **`convert_docs.js`:** A Node.js script to automatically convert all documents into styled HTML/DOCX format.

---

## 📁 3. Project File & Folder Structure

```
habit-tracker-complete (3)/
├── README.md                       # Main English project documentation
├── PROJECT_SUMMARY.md              # Detailed project completion summary
│
├── habit-tracker-full/             # PWA Web App, Server & Documentation
│   ├── index.html                  # Main single-page PWA app (HTML/CSS/JS)
│   ├── habit_tracker_preview.html  # Quick preview file for the browser
│   ├── manifest.json               # Web App Manifest
│   ├── sw.js                       # Service Worker (offline caching)
│   ├── server.js                   # Express.js backend server
│   ├── package.json                # Backend dependency list
│   ├── convert_docs.js             # Document conversion script
│   ├── icon-192.png / icon-512.png # App branding icons
│   ├── README.txt / details.txt    # Feature & deployment guidelines
│   └── docs/                       # 6 complete technical documents (.md & .docx)
│
└── habit-tracker-android/          # Android project
    ├── app/src/main/
    │   ├── java/com/example/habittracker/MainActivity.kt  # WebView Kotlin app
    │   └── assets/                                         # All web assets
    └── build.gradle.kts            # Android build file
```

---

## 🚀 4. How to Run the App

### 1. Web App / PWA:
- **To run directly in the browser:** Double-click the `habit-tracker-full/index.html` file.
- **To host for free on Netlify:** Upload these 5 files to [netlify.com/drop](https://app.netlify.com/drop): `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`.
- **To run a local backend server:**
  ```bash
  cd habit-tracker-full
  npm install
  npm start
  ```

### 2. Android App:
1. Open the `habit-tracker-android` folder with **Android Studio**.
2. **Run** the app on an emulator or a connected Android phone.
