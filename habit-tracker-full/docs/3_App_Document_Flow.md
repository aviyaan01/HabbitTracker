# HabbitTracker — App Document Flow
**Version:** 1.0  
**Date:** July 30, 2026  
**Author:** Product & Engineering Team  
**Status:** Approved  

---

## 1. Overview

This document defines the complete user journey, screen flows, navigation architecture, and interaction states for the HabbitTracker application. It covers every user flow from first-time onboarding to advanced Pro features.

---

## 2. App Navigation Architecture

```
HabbitTracker (index.html — SPA)
│
├── TOP BAR
│   ├── Brand (Logo + Name + Pro Badge)
│   └── Profile Section
│       ├── [IF LOGGED IN] Sync Badge + Username + Logout Button
│       └── [IF GUEST] Login Button
│
├── TAB BAR (8 tabs)
│   ├── [1] Daily
│   ├── [2] Weekly
│   ├── [3] Monthly
│   ├── [4] History
│   ├── [5] 🤖 AI Coach  ← PRO ONLY (gold dot if free)
│   ├── [6] 🏆 Challenges
│   ├── [7] 📊 Analytics  ← PRO ONLY (gold dot if free)
│   └── [8] 💎 Pro / Settings
│
└── MAIN CONTENT AREA
    └── (Renders based on active tab)

OVERLAYS (z-index: 99999)
├── Auth Modal (Login/Register)
├── Pricing Modal
└── Success Overlay (Pro activation animation)
```

---

## 3. User Flows

### Flow 1: First-Time User Onboarding

```
[App Opens for the First Time]
          ↓
[loadState() called]
          ↓
[No localStorage data found]
          ↓
[defaultHabits() loaded]
 • Cold shower
 • Gym
 • Read 10 pages
 • Budget tracking
 • Studying
          ↓
[render() called → Daily Tab shown]
          ↓
[User sees:]
 • Stats Bar (0% completion)
 • Freemium upgrade banner (৳199/mo)
 • 5 default habits (unlocked)
 • Notification permission banner
          ↓
[User can immediately:]
 → Check off habits
 → Add tasks
 → Explore tabs
```

---

### Flow 2: Habit Completion Flow

```
[User views Daily Tab]
          ↓
[Sees habit row with status badge]
          ↓
      ┌───────────────────────────────┐
      │ What is the habit's status?   │
      └───────────────────────────────┘
           ↙          ↓         ↘
    [available]  [upcoming]  [missed]
        ↓             ↓           ↓
  [Checkbox      [Greyed out,  [Lock icon 🔒
   clickable]    shown as       shown,
                 upcoming]      not clickable]
        ↓
  [User clicks checkbox]
        ↓
  [toggle() called]
        ↓
  [completions[date][habitId] = true]
        ↓
  [saveCompletions() → localStorage + server sync]
        ↓
  [logHistory() → habitHistory updated]
        ↓
  [getCombinedPct() recalculated]
        ↓
  [Did completion % hit goal target?]
      ↙       ↘
   [YES]      [NO]
     ↓          ↓
[fireConfetti()] [render() only]
     ↓
[render() — donut chart updates]
```

---

### Flow 3: Adding a New Habit

```
[User is on Daily or Weekly Tab]
          ↓
[User types in "new-habit-input" field]
          ↓
[User presses Enter or clicks "+ Add" button]
          ↓
[addHabit() called]
          ↓
[Check: isPro() OR habits.length < 5?]
          ↙                 ↘
       [YES]               [NO]
         ↓                   ↓
[Habit pushed to       [showToast() error]
 habits[] array]       [showPricingModal()]
         ↓
[saveHabits() → sync]
         ↓
[input.value = '']
         ↓
[render() — new habit appears]
```

---

### Flow 4: Authentication Flow (Login)

```
[User clicks "Login" button in top bar]
          ↓
[showLoginModal() called]
          ↓
[Auth Modal opens (blur overlay)]
          ↓
[User enters username + password]
          ↓
[User clicks "Login" button in modal]
          ↓
[submitAuth() called]
          ↓
[Validation: username and password not empty]
          ↙                ↘
       [PASS]           [FAIL]
          ↓                ↓
[POST /api/auth/login]  [alert("fill both")]
          ↓
    ┌─────────────────────┐
    │   Server Response   │
    └─────────────────────┘
        ↙          ↘
     [200]        [401/400]
       ↓               ↓
[currentUser =     [alert(data.error)]
 data.username]
       ↓
[localStorage.setItem(STORAGE_USER_KEY)]
       ↓
[showToast("Logged in!")]
       ↓
[hideLoginModal()]
       ↓
[loadFromServer() → data synced from cloud]
       ↓
[render() — profile badge shows username]
```

---

### Flow 5: Authentication Flow (Register)

```
[Auth Modal is open]
          ↓
[User clicks "Create new account" link]
          ↓
[toggleAuthMode() → mode = "register"]
          ↓
[Modal title: "Create new account"]
[Button text: "Register"]
          ↓
[User fills username + password]
          ↓
[submitAuth() called]
          ↓
[POST /api/auth/register]
          ↓
    ┌──────────────────────────────────────┐
    │ Server Validation:                   │
    │ - username: 3-15 chars, a-z0-9_      │
    │ - password: min 4 chars              │
    │ - username not already taken         │
    └──────────────────────────────────────┘
          ↙                    ↘
       [PASS]               [FAIL]
         ↓                     ↓
[showToast("Account       [alert(error)]
 created! Login now")]
         ↓
[toggleAuthMode() → back to login mode]
```

---

### Flow 6: Pro Upgrade Flow

```
[User clicks any "Upgrade" CTA]
(Banner / Lock row / Tab / Feature prompt)
          ↓
[showPricingModal() called]
          ↓
[Pricing Modal opens]
 ┌─────────────────────────────────────────────────┐
 │  💎 Upgrade to HabbitTracker                          │
 │                                                   │
 │  [Free]      [Pro ⭐ POPULAR]     [Team]          │
 │  ৳0          ৳199/mo              ৳999/team       │
 │  5 habits    Unlimited            Everything      │
 │              AI Coach             +10 members     │
 │              Challenges           +custom         │
 │              Heatmap                              │
 │              Themes                               │
 │              Referral                             │
 │                                                   │
 │  [Current]   [Start Free Trial]  [Contact Sales] │
 └─────────────────────────────────────────────────┘
          ↓
[User clicks "Start Free Trial"]
          ↓
[activatePro("monthly") called]
          ↓
[hidePricingModal()]
          ↓
[currentPlan = "pro"]
[localStorage.setItem("HabbitTracker_plan", "pro")]
          ↓
[showSuccessOverlay() — full screen animation]
 ┌────────────────────────────┐
 │        🎉                  │
 │  💎 Pro Unlocked!           │
 │  All features available    │
 │                            │
 │  [Start Exploring!]        │
 └────────────────────────────┘
          ↓
[fireConfetti()]
          ↓
[User clicks "Start Exploring!"]
          ↓
[render() — Pro badge shows in top bar]
[All Pro tabs unlocked]
[Freemium banners removed]
```

---

### Flow 7: AI Coach Flow

```
[User clicks 🤖 tab]
          ↓
[renderAICoach() called]
          ↓
  [isPro()?]
  ↙         ↘
[YES]       [NO]
  ↓           ↓
[Show       [Show upsell screen]
 AI panel]  [Upgrade button]
  ↓
[Calculate insights from user data:]
 - bestStreak → streak motivation insight
 - consistency (7-day avg) → adherence tip
 - total habits count → optimization insight
 - allDone count → milestone celebration
  ↓
[Show 3 AI Insight cards]
  ↓
[Show 3 Habit Suggestions from AI_SUGGESTIONS[]
 starting at aiSuggestionIndex]
  ↓
[User clicks "+ Add Habit" on a suggestion]
  ↓
[addHabitFromAI(habitName)]
  ↓
[habits.push() + saveHabits()]
  ↓
[showToast("Habit added from AI suggestion!")]
  ↓
[User clicks "🔄 Get New Suggestions"]
  ↓
[aiSuggestionIndex = (aiSuggestionIndex + 3) % 10]
  ↓
[render() — 3 new suggestions appear]
```

---

### Flow 8: Challenge Pack Flow

```
[User clicks 🏆 tab]
          ↓
[renderChallenges() called]
          ↓
[Active challenges bar shown (if any)]
  ↓
[6 challenge cards shown]
  ↓
[For each card:]
 ┌─────────────────────────────────────────┐
 │ Is this challenge active?               │
 │   YES → Show "🔥 X days left" button    │
 │                                         │
 │ Is it Pro-only (price > 0) AND user is  │
 │ free?                                   │
 │   YES → Show "🔒 Unlock Pro" button     │
 │                                         │
 │ Otherwise:                              │
 │   Show "▶ Start Challenge" button       │
 └─────────────────────────────────────────┘
  ↓
[User clicks "▶ Start Challenge" on free pack]
  ↓
[startChallenge("fitness-21")]
  ↓
[Check: already active?]
  ↙             ↘
[YES]           [NO]
  ↓               ↓
[Toast: already  [activeChallenges.push({id, startedAt})]
 active]          ↓
               [Auto-add all pack habits:]
               "Morning stretching (10 min)"
               "Push-ups (20 reps)"
               "Evening walk (30 min)"
                  ↓
               [saveHabits()]
                  ↓
               [localStorage.setItem(STORAGE_ACTIVE_CHALL_KEY)]
                  ↓
               [showToast("Challenge started! Habits added.")]
                  ↓
               [render() — active bar shows progress]
```

---

### Flow 9: Analytics Flow

```
[User clicks 📊 tab]
          ↓
[renderAnalytics() called]
          ↓
  [isPro()?]
  ↙         ↘
[YES]       [NO]
  ↓           ↓
[Build      [Show upsell screen]
 heatmap]
  ↓
[Loop 364 days backwards from today]
[For each day:]
  - fmtDate(d) → dateStr
  - dayPercent(dateStr) → 0-100
  - Map to level: 0 | 1 | 2 | 3 | 4
  ↓
[Group into 52 weekly columns of 7 cells]
  ↓
[Render heatmap-grid with colored cells]
  ↓
[Calculate insights:]
  - dayAverages[] → best day / worst day
  - last7Avg vs last30Avg → trend
  - getAllTimeDone() → total count
  ↓
[Render insight-grid (4 cards)]
  ↓
[Render day-of-week bar chart]
  ↓
[User hovers over cell → tooltip shows date + %]
```

---

### Flow 10: Theme Switching Flow

```
[User clicks 💎 tab → Pro page]
          ↓
[Theme section renders with 5 theme buttons]
  ↓
[User clicks a theme (e.g., Sakura 🌸)]
  ↓
  [isPro()?]
  ↙         ↘
[YES]       [NO]
  ↓           ↓
[setTheme   [showPricingModal()]
 ("sakura")]
  ↓
[currentTheme = "sakura"]
[localStorage.setItem("HabbitTracker_theme", "sakura")]
  ↓
[document.documentElement.setAttribute("data-theme", "sakura")]
  ↓
[CSS variables update instantly:]
  --accent: #f472b6
  --violet: #e879f9
  --paper: #1a0a1a
  ↓
[render() — active theme button highlighted]
```

---

### Flow 11: Share Streak Flow

```
[User clicks 💎 tab → Pro page]
          ↓
[Share card preview shown with:]
  - Best streak number
  - Top 3 habit names as pills
  - All-time completion count
  ↓
[Option A: Click "📋 Copy Text"]
  ↓
[copyStreakText()]
  ↓
[navigator.clipboard.writeText(text)]
  ↓
[showToast("Copied to clipboard!")]

[Option B: Click "💬 Share"]
  ↓
[shareWhatsApp()]
  ↓
[window.open("https://wa.me/?text=" + encoded)]
  ↓
[WhatsApp opens in new tab]
```

---

### Flow 12: Logout Flow

```
[User clicks Logout icon button in top bar]
          ↓
[handleLogout() called]
          ↓
[confirm("Are you sure?")]
  ↙              ↘
[Cancel]        [OK]
  ↓               ↓
[Nothing]  [currentUser = null]
              ↓
           [localStorage.removeItem(STORAGE_USER_KEY)]
           [localStorage.removeItem(STORAGE_HABITS_KEY)]
           [localStorage.removeItem(all other keys)]
              ↓
           [State reset to defaults:]
            habits = defaultHabits()
            completions = {}
            dailyTasks = {}
            weeklyMeta = {}
            habitHistory = {}
              ↓
           [showToast("Logged out!")]
              ↓
           [render() — guest state shown]
```

---

## 4. State Machine: Habit Status

```
                 ┌─────────────────┐
                 │  NOT SCHEDULED  │
                 │  (day not in    │
                 │   habit.days)   │
                 └─────────────────┘

                 ┌─────────────────┐
                 │    UPCOMING     │
                 │  (now < time)   │
                 └────────┬────────┘
                          │ time passes
                          ↓
                 ┌─────────────────┐
                 │    AVAILABLE    │◄──── (no reminder set = always available)
                 │  (can complete) │
                 └────────┬────────┘
          user toggles ↙  │ 30 min passes
                      ↓   ↓
           ┌────────────┐ ┌─────────────┐
           │ COMPLETED  │ │   MISSED    │
           │ (✓ checked)│ │ (🔒 locked) │
           └────────────┘ └─────────────┘
                   (next day → resets)
```

---

## 5. Screen State Reference

| Screen | Trigger | Free User Shows | Pro User Shows |
|--------|---------|----------------|----------------|
| Daily | App open / tab click | Stats bar, freemium banner, 5 habits unlocked, 6+ locked | Stats bar, no banner, all habits unlocked |
| Weekly | Tab click | Tracker grid with lock icons for habit 6+ | Full tracker |
| Monthly | Tab click | Full view (no lock) | Full view |
| History | Tab click | Full view | Full view |
| AI Coach | Tab click | Upsell screen | Full AI panel |
| Challenges | Tab click | 2 free packs, 4 locked | All 6 packs |
| Analytics | Tab click | Upsell screen | Full heatmap |
| Pro Page | Tab click | Plan status, locked themes/referral, share card | Full pro page |

---

## 6. Error States & Empty States

| Situation | UI Shown |
|-----------|---------|
| No habits added | "No habits added yet." empty state |
| No history data | "No records yet. Add a reminder..." |
| Offline | Orange "offline" sync badge in top bar |
| Sync in progress | Yellow "pending" sync badge (pulsing animation) |
| Synced | Green "synced" badge |
| Import fails | Toast: "❌ Invalid file. Please select a JSON file." |
| Login wrong password | alert("Incorrect username or password!") |
| Register taken username | alert("This username is already taken!") |
| Free limit reached | Toast + pricing modal auto-opens |
| Pro activated | Full-screen success overlay + confetti |
| Challenge already active | Toast: "⚠️ Challenge already active!" |
