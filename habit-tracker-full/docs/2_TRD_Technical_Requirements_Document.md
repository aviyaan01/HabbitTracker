# HabbitTracker — Technical Requirements Document (TRD)
**Version:** 1.0  
**Date:** July 30, 2026  
**Author:** Engineering Team  
**Status:** Approved  

---

## 1. Overview

This document describes the complete technical architecture, stack decisions, system design, API specifications, performance benchmarks, and engineering constraints for the HabbitTracker application. It serves as the engineering reference for all developers building or maintaining the system.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  ┌─────────────────┐    ┌──────────────────────────────┐    │
│  │  Android Native │    │   PWA (Chrome / Safari)      │    │
│  │  (WebView Wrap) │    │   Progressive Web App        │    │
│  └────────┬────────┘    └──────────────┬───────────────┘    │
│           └────────────────────────────┘                     │
│                         ↓ HTTPS                              │
├─────────────────────────────────────────────────────────────┤
│                      BACKEND LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Node.js Express REST API Server               │   │
│  │         (server.js — Port 3000)                       │   │
│  │                                                        │   │
│  │  /api/auth/register   /api/auth/login                 │   │
│  │  /api/sync (GET/POST) /api/upgrade                    │   │
│  │  /api/challenges      /api/plan                       │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                          ↓                                   │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                              │
│  ┌────────────────┐    ┌────────────────────────────────┐   │
│  │  db.json       │    │   localStorage (Client-side)   │   │
│  │  (Server FS)   │    │   habits, completions, meta    │   │
│  └────────────────┘    └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Architecture (Frontend)

```
index.html (Single-Page Application)
│
├── CSS Layer
│   ├── CSS Variables (Theme tokens)
│   ├── Component Styles (cards, tabs, modals)
│   └── Responsive Breakpoints (600px, 380px)
│
├── JavaScript Modules (Inline, Vanilla JS)
│   ├── STATE MANAGEMENT
│   │   ├── habits[]
│   │   ├── completions{}
│   │   ├── dailyTasks{}
│   │   ├── weeklyMeta{}
│   │   ├── habitHistory{}
│   │   ├── currentUser (string)
│   │   ├── currentPlan (free|pro|team)
│   │   └── activeChallenges[]
│   │
│   ├── STORAGE LAYER
│   │   ├── loadState() — localStorage + server sync
│   │   ├── triggerSaveAndSync() — local + cloud
│   │   ├── loadFromServer() — GET /api/sync
│   │   └── syncWithServer() — POST /api/sync
│   │
│   ├── BUSINESS LOGIC
│   │   ├── toggle() — habit completion
│   │   ├── getStreak() — streak calculation
│   │   ├── getHabitStatus() — upcoming/available/missed
│   │   ├── isHabitLocked() — freemium check
│   │   └── activatePro() — plan upgrade
│   │
│   ├── RENDER ENGINE
│   │   ├── render() — main orchestrator
│   │   ├── renderDaily()
│   │   ├── renderWeekly()
│   │   ├── renderMonthly()
│   │   ├── renderHistory()
│   │   ├── renderAICoach()
│   │   ├── renderChallenges()
│   │   ├── renderAnalytics()
│   │   └── renderProPage()
│   │
│   └── UTILITIES
│       ├── donutSVG() — SVG chart generator
│       ├── fireConfetti() — canvas animation
│       ├── checkAlarms() — 15s interval timer
│       └── showToast() — notification UI
│
└── PWA Layer
    ├── manifest.json — PWA metadata
    └── sw.js — Service Worker (offline cache)
```

---

## 3. Technology Stack

### 3.1 Frontend Stack

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| HTML5 | Latest | Structure | Semantic, accessible markup |
| CSS3 (Vanilla) | Latest | Styling | No framework overhead, full control |
| JavaScript (ES6+) | Latest | Logic | No build step, maximum compatibility |
| Google Fonts | — | Typography | Plus Jakarta Sans, JetBrains Mono |
| Canvas API | Native | Confetti animation | No library needed |
| Web Notifications API | Native | Habit reminders | Native browser notifications |
| Web Audio API | Native | Alarm sound | Synthesized beep tones |
| Service Worker | Native | Offline PWA | Cache first strategy |
| localStorage | Native | Client data | Persistent offline storage |
| CSS Custom Properties | Native | Theme system | Runtime theme switching |

### 3.2 Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x LTS | Runtime environment |
| Express.js | 4.x | HTTP server framework |
| cors | 2.x | Cross-origin headers |
| fs (Node stdlib) | — | JSON file database |
| JSON file (db.json) | — | Persistent data store (MVP) |

### 3.3 Android Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Kotlin | 1.9.x | Native Android language |
| Android SDK | API 24+ | Android platform |
| WebView | Built-in | PWA wrapper |
| ComponentActivity | Jetpack | Activity base class |

### 3.4 DevOps / Build

| Tool | Purpose |
|------|---------|
| npm | Package management |
| nodemon (optional) | Development hot-reload |
| Android Studio | Android build & deployment |
| Gradle | Android build system |

---

## 4. API Specification

### 4.1 Base URL
```
Development: http://localhost:3000
Production:  https://api.HabbitTracker.app (future)
```

### 4.2 Authentication Endpoints

#### POST /api/auth/register
**Description:** Create a new user account  
**Request Body:**
```json
{
  "username": "rafi123",
  "password": "secret123"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Registration successful!"
}
```
**Response (400 Bad Request):**
```json
{
  "error": "This username is already taken!"
}
```
**Validation Rules:**
- `username`: 3–15 characters, `^[a-zA-Z0-9_]{3,15}$`
- `password`: minimum 4 characters

---

#### POST /api/auth/login
**Description:** Authenticate user and start session  
**Request Body:**
```json
{
  "username": "rafi123",
  "password": "secret123"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "username": "rafi123"
}
```
**Response (401 Unauthorized):**
```json
{
  "error": "Incorrect username or password!"
}
```

---

### 4.3 Sync Endpoints

#### GET /api/sync?username={username}
**Description:** Retrieve all user data from server  
**Response (200 OK):**
```json
{
  "habits": [
    {
      "id": "h1",
      "name": "Morning Run",
      "reminderTime": "07:00",
      "days": ["Mon", "Wed", "Fri"]
    }
  ],
  "completions": {
    "2026-07-30": { "h1": true }
  },
  "dailyTasks": {
    "2026-07-30": [
      { "id": "t1001", "name": "Review notes", "done": false }
    ]
  },
  "weeklyMeta": {
    "focus": "Health",
    "reward": "Cinema",
    "affirmation": "I show up every day",
    "profileName": "Rafi",
    "goalPercent": 90
  },
  "habitHistory": {
    "h1": [
      { "date": "2026-07-30", "time": "2026-07-30T07:15:00.000Z", "status": "completed" }
    ]
  },
  "plan": "pro",
  "activeChallenges": [
    { "id": "fitness-21", "startedAt": 1753784400000 }
  ]
}
```

---

#### POST /api/sync
**Description:** Save all user data to server  
**Request Body:**
```json
{
  "username": "rafi123",
  "data": {
    "habits": [...],
    "completions": {...},
    "dailyTasks": {...},
    "weeklyMeta": {...},
    "habitHistory": {...},
    "plan": "pro",
    "activeChallenges": [...]
  }
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data sync successful!"
}
```

---

### 4.4 Pro / Upgrade Endpoints

#### POST /api/upgrade
**Description:** Upgrade user plan (demo — no real payment)  
**Request Body:**
```json
{
  "username": "rafi123",
  "plan": "pro"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "plan": "pro",
  "message": "Successfully upgraded to pro plan!"
}
```

---

#### GET /api/plan?username={username}
**Description:** Get current user plan  
**Response (200 OK):**
```json
{
  "plan": "pro"
}
```

---

### 4.5 Challenge Endpoints

#### GET /api/challenges
**Description:** List all available challenge packs  
**Response (200 OK):**
```json
{
  "challenges": [
    {
      "id": "fitness-21",
      "title": "21-Day Fitness Reset",
      "days": 21,
      "price": 0,
      "habits": ["Morning stretching (10 min)", "Push-ups (20 reps)", "Evening walk (30 min)"]
    },
    {
      "id": "mindful-30",
      "title": "30-Day Mindfulness",
      "days": 30,
      "price": 49,
      "habits": ["Meditation (10 min)", "Gratitude journal", "Digital detox (1hr/day)"]
    }
  ]
}
```

---

#### POST /api/challenges/start
**Description:** Start a challenge for a user  
**Request Body:**
```json
{
  "username": "rafi123",
  "challengeId": "fitness-21"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Challenge \"21-Day Fitness Reset\" started!",
  "pack": { "id": "fitness-21", "title": "...", "days": 21, "price": 0 }
}
```

---

## 5. Data Models

### 5.1 Habit Object
```typescript
interface Habit {
  id: string;           // "h" + timestamp (e.g., "h1753784400000")
  name: string;         // Max 100 chars
  reminderTime: string | null;  // "HH:MM" format or null
  days: string[] | null;        // ["Mon","Tue"] or null (all days)
}
```

### 5.2 Completions Object
```typescript
interface Completions {
  [dateStr: string]: {          // "YYYY-MM-DD"
    [habitId: string]: boolean;
  }
}
```

### 5.3 Daily Tasks Object
```typescript
interface DailyTasks {
  [dateStr: string]: Task[];
}

interface Task {
  id: string;    // "t" + timestamp + random
  name: string;  // Max 200 chars
  done: boolean;
}
```

### 5.4 Weekly Meta Object
```typescript
interface WeeklyMeta {
  focus: string;         // Max 100 chars
  reward: string;        // Max 100 chars
  affirmation: string;   // Max 200 chars
  profileName: string;   // Max 50 chars
  goalPercent: number;   // 0–100, default 90
}
```

### 5.5 Habit History Object
```typescript
interface HabitHistory {
  [habitId: string]: HistoryEntry[];
}

interface HistoryEntry {
  date: string;    // "YYYY-MM-DD"
  time: string;    // ISO 8601 string
  status: "completed" | "missed";
}
```

### 5.6 User Object (Server)
```typescript
interface User {
  password: string;   // Plaintext (MVP), bcrypt hash (production)
}

interface UserData {
  habits: Habit[];
  completions: Completions;
  dailyTasks: DailyTasks;
  weeklyMeta: WeeklyMeta;
  habitHistory: HabitHistory;
  plan: "free" | "pro" | "team";
  activeChallenges: ActiveChallenge[];
}

interface ActiveChallenge {
  id: string;           // Challenge pack ID
  startedAt: number;    // Unix timestamp (ms)
}
```

---

## 6. localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `habits` | JSON string | Array of Habit objects |
| `completions` | JSON string | Completions map |
| `dailyTasks` | JSON string | Daily tasks map |
| `weeklyMeta` | JSON string | Weekly planning data |
| `habitHistory` | JSON string | Historical logs |
| `currentUser` | string | Logged-in username |
| `HabbitTracker_plan` | string | Current plan (free/pro/team) |
| `HabbitTracker_theme` | string | Selected theme ID |
| `HabbitTracker_active_challenges` | JSON string | Active challenge array |
| `HabbitTracker_referral` | string | User's referral code |

---

## 7. PWA Specifications

### 7.1 Service Worker Strategy
- **Cache Strategy:** Cache First with Network Fallback
- **Cached Resources:** index.html, manifest.json, icon-192.png, icon-512.png, Google Fonts
- **Dynamic Content:** API calls bypass cache (network only)

### 7.2 Web App Manifest
```json
{
  "name": "HabbitTracker",
  "short_name": "HabbitTracker",
  "display": "standalone",
  "background_color": "#0B0F19",
  "theme_color": "#0B0F19",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 8. Android WebView Configuration

```kotlin
settings.apply {
  javaScriptEnabled = true       // Required for app logic
  domStorageEnabled = true        // Required for localStorage
  allowFileAccess = true          // Required for asset loading
  allowContentAccess = true       // Required for local content
  databaseEnabled = true          // Required for IndexedDB
  mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW  // HTTP + HTTPS
}
loadUrl("file:///android_asset/index.html")
```

---

## 9. Performance Requirements

| Metric | Requirement | Measurement Method |
|--------|-------------|-------------------|
| First Contentful Paint | < 1.5s (WiFi) | Chrome DevTools Lighthouse |
| Time to Interactive | < 2.5s (WiFi) | Chrome DevTools Lighthouse |
| Habit Toggle Response | < 100ms | Manual timing |
| Heatmap Render (52 weeks) | < 500ms | Performance.now() |
| localStorage Read | < 50ms | Performance.now() |
| Server API Response | < 300ms | curl timing |
| Bundle Size (HTML) | < 200KB | File system |

---

## 10. Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| XSS Prevention | esc() function for all user-generated content |
| SQL Injection | N/A — JSON file store, no SQL |
| CORS | Configured via cors() middleware |
| Password Storage | Plaintext (MVP), bcrypt in production |
| Sensitive Data | Never stored in URL parameters |
| Input Validation | Username regex, password length on server |

---

## 11. Error Handling

### 11.1 Client-Side Errors
| Error | Handling |
|-------|---------|
| localStorage unavailable | Try/catch on all storage ops |
| Server offline | Falls back to localStorage, shows offline badge |
| Import invalid JSON | Try/catch with user toast notification |
| Notification denied | Graceful degradation, in-app toast fallback |
| Audio context blocked | Silent catch, no crash |

### 11.2 Server-Side Errors
| HTTP Code | Meaning | When |
|-----------|---------|------|
| 400 | Bad Request | Missing/invalid parameters |
| 401 | Unauthorized | Wrong password |
| 404 | Not Found | User/data not found |
| 500 | Server Error | Unexpected exception |

---

## 12. Testing Requirements

### 12.1 Manual Test Cases
| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| TC-01 | Add 5th habit as free user | Habit added successfully |
| TC-02 | Add 6th habit as free user | Lock message + pricing modal |
| TC-03 | Click "Start Free Trial" | Pro activated, confetti fires |
| TC-04 | Toggle habit completion | Checkbox checked, percentage updates |
| TC-05 | Start Fitness Challenge | 3 habits auto-added |
| TC-06 | Switch to Sakura theme | UI color changes immediately |
| TC-07 | Export data as JSON | File downloads |
| TC-08 | Import valid JSON file | Data restored correctly |
| TC-09 | Register new user | Account created, redirect to login |
| TC-10 | Login with correct credentials | Logged in, data synced |
| TC-11 | Login with wrong password | Error message shown |
| TC-12 | Open app while offline | Works with localStorage data |
| TC-13 | View 52-week heatmap | Renders within 500ms |
| TC-14 | AI Coach refresh suggestions | New 3 suggestions shown |

---

## 13. Deployment Architecture (Future — Production)

```
User (Browser/Android)
    ↓ HTTPS
Cloudflare CDN
    ↓
Nginx (Reverse Proxy)
    ↓
Node.js + Express (PM2 cluster)
    ↓
PostgreSQL (replace db.json)
    ↓
Redis (session cache)
```

---

## 14. Versioning & Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-07-01 | Initial habit tracker (daily/weekly/monthly) |
| 0.2.0 | 2026-07-15 | Added auth + cloud sync |
| 1.0.0 | 2026-07-30 | HabbitTracker — full freemium MVP |
| 1.1.0 | TBD | Payment gateway integration |
| 2.0.0 | TBD | Team dashboard, real AI API |
