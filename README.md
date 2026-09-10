# 📱 HabbitTracker — Complete Habit Tracking Project

HabbitTracker is a modern, feature-packed habit tracking and daily management platform built for Web, PWA (Progressive Web App), and Native Android. It provides full offline functionality using `localStorage`, optional Express backend API sync, streak tracking, time-window reminders, multi-theme customization, detailed analytics, and complete project documentation.

---

## 📌 Project Overview

This repository contains the full codebase, documentation, backend, and Android wrapper for the HabbitTracker ecosystem.

### 🌟 Main Highlights
- **Cross-Platform:** Runs seamlessly on desktop browsers, mobile browsers (PWA), and Android devices.
- **Offline First:** Works 100% offline using `localStorage` and Service Worker caching.
- **Comprehensive Analytics:** Track streaks, completion percentages, activity logs, and top monthly habits.
- **Time-Window Reminders:** Set custom reminder times with an active status window (Upcoming, Available, Missed).
- **Gamification & Rewards:** Best streak counters, weekly completion target goals, and confetti animations.
- **Enterprise-Grade Documentation:** Includes 6 technical specification documents provided in both Markdown (`.md`) and Microsoft Word (`.docx`) formats.

---

## 🗂️ Workspace Architecture

```
habit-tracker-complete (3)/
│
├── habit-tracker-full/             # Web App, PWA, Backend, & Documentation
│   ├── index.html                  # Core single-page PWA application (HTML5/CSS3/Vanilla JS)
│   ├── habit_tracker_preview.html  # Standalone browser preview file
│   ├── manifest.json               # Web App Manifest for mobile installation
│   ├── sw.js                       # Service Worker for offline asset caching
│   ├── server.js                   # Lightweight Express.js backend server for Auth & Data Sync
│   ├── package.json                # Dependencies for backend server & tools
│   ├── convert_docs.js             # Automation script to convert Markdown docs to HTML/Word format
│   ├── icon-192.png / icon-512.png # Application branding assets
│   ├── README.txt                  # Quick deployment guide
│   ├── details.txt                 # Technical features breakdown
│   └── docs/                       # Complete specification document suite
│       ├── 1_PRD_Product_Requirements_Document.md (.docx)
│       ├── 2_TRD_Technical_Requirements_Document.md (.docx)
│       ├── 3_App_Document_Flow.md (.docx)
│       ├── 4_UIUX_Design_Brief.md (.docx)
│       ├── 5_Backend_Schema_Document.md (.docx)
│       └── 6_Implementation_Plan.md (.docx)
│
├── habit-tracker-android/          # Native Android Wrapper Project
│   ├── app/src/main/
│   │   ├── java/com/example/habittracker/MainActivity.kt  # WebView Kotlin container
│   │   └── assets/                                         # Bundled web assets (index.html, sw.js, etc.)
│   └── build.gradle.kts            # Android build configuration
│
├── README.md                       # Project overview (This document)
├── PROJECT_SUMMARY.md              # Detailed implementation summary (Bangla)
└── FUTURE_WORK.md                  # Comprehensive Future Roadmap & Upcoming Features Document
```

---

## 🛠️ Key Components & What Has Been Implemented

### 1. Web & PWA App (`habit-tracker-full/index.html`)
- **Ember & Tide Nocturnal Luxury Design System:** Roasted charcoal canvas (`#120E0C`), Smoked quartz glass cards (`rgba(30, 24, 20, 0.72)` with 24px blur), Cream text (`#FBF3EA`), Warm muted labels (`#A8988A`), Ember streak flame & primary actions (`#FF5A36`), Tide teal AI & Pro accents (`#1FC2B0`), Marigold rewards/milestones (`#FFC145`), Crimson red alerts (`#E63960`), and Pro gradient (`linear-gradient(135deg, #1FC2B0 0%, #0EA5E9 52%, #7C3AED 100%)`).
- **Typography:** Google Fonts *Plus Jakarta Sans* (UI headings/body) and *JetBrains Mono* (metrics/timestamps).
- **Habit Tracking Core:**
  - Create, edit, and delete daily habits and single tasks.
  - Interactive day chips (Sun, Mon, Tue, etc.) for custom weekly schedules.
  - Reminder notification times with ±30-minute status windows.
- **Weekly Goal Focus:** Set target weekly percentage goals (e.g. 80%) with visual progress badges and chart progress markers.
- **Analytics & History:**
  - Timestamped activity logs.
  - Monthly habit ranking and completion percentage metrics.
  - Data reset ("Clear All Data") option.
- **Import/Export:** Export habit state to JSON file and import anytime for backup or device migration.

### 2. Express Backend Server (`habit-tracker-full/server.js`)
- Express.js REST API providing endpoints for user registration, authentication, and cross-device habit data persistence.

### 3. Native Android App (`habit-tracker-android/`)
- Built in Kotlin with Android SDK using `WebView`.
- Loads bundled web assets directly from `file:///android_asset/index.html`.
- Configured with DOM Storage, Database API, and JavaScript capabilities enabled for native mobile execution.

### 4. Technical Documentation Suite (`habit-tracker-full/docs/`)
1. **Product Requirements Document (PRD):** Scope, target user personas, functional specifications.
2. **Technical Requirements Document (TRD):** System architecture, data schemas, tech stack specifications.
3. **App Document Flow:** User journeys, screen transitions, operational flow diagrams.
4. **UI/UX Design Brief:** Color tokens, typography standards, component layouts.
5. **Backend Schema Document:** REST API endpoint definitions, request/response models.
6. **Implementation Plan:** Strategic roadmap, development milestones, verification plans.
7. **`convert_docs.js`:** Node.js converter script that turns Markdown documentation into styled HTML documents compatible with Microsoft Word (`.docx`).

---

## 🚀 Running the Project

### Web Application / PWA
- **Instant Browser Launch:** Open [`index.html`](file:///c:/Users/ASUS/Downloads/habit-tracker-complete%20%283%29/habit-tracker-full/index.html) or [`habit_tracker_preview.html`](file:///c:/Users/ASUS/Downloads/habit-tracker-complete%20%283%29/habit-tracker-full/habit_tracker_preview.html) directly in any browser.
- **Deploy to Netlify:** Drag & drop the following 5 files to [netlify.com/drop](https://app.netlify.com/drop):
  `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`.
- **Run Local Backend Server:**
  ```bash
  cd habit-tracker-full
  npm install
  npm start
  ```

### Android Application
1. Open the `habit-tracker-android` directory in **Android Studio**.
2. Sync Gradle and press **Run** (Shift + F10) to deploy to an emulator or physical device.

---

## 📝 Detailed Summary in Bangla

For a complete breakdown of all implemented features written in Bengali, refer to [PROJECT_SUMMARY.md](file:///c:/Users/ASUS/Downloads/habit-tracker-complete%20%283%29/PROJECT_SUMMARY.md).
