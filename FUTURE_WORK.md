# 🚀 HabbitTracker — Future Work & Product Roadmap

> **Document Version:** 1.0.0
> **Last Updated:** September 2026
> **Target Release:** V2.0 & V3.0
> **Status:** Active Roadmap for Premium & Advanced Features

---

## 📋 Executive Summary

The core engine of **HabbitTracker** — including Daily Habit Tracking, Custom Scheduling, Streak Calculation, Weekly Goals, PWA Offline Support, Google Authentication, User Profiles, and REST API Sync — is fully operational and functional.

This document provides a complete technical and business plan for all **Premium (Pro)** and **advanced features** to be added in future releases.

---

## 🗺️ Future Roadmap by Phases

```
┌─────────────────────────────────────────────────────────────┐
│                       CURRENT (v1.0)                        │
│  Daily Habits • Streaks • Google Auth • Profiles • Cloud DB │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      PHASE 2 (Upcoming)                     │
│  🤖 Gemini AI Coach • 📊 52-Week Heatmaps • 🏆 Challenges    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      PHASE 3 (Future)                       │
│  💳 Payment Gateways • 🔔 FCM Push • 📱 Native Android & iOS│
└─────────────────────────────────────────────────────────────┘
```

---

## 💎 1. Pro Subscriptions & Payment Gateway Integration

### Goal
Establish a transparent and reliable monetization model between the Free and Pro tiers for users.

### Proposed Tiers & Pricing:
1. **Free / Standard Tier (৳0):**
   - Daily habit and task tracking.
   - Basic streak counter and weekly view.
   - Google Sign-In and cloud backup.
2. **Pro Monthly (৳199 / $1.99 per month):**
   - Unlimited habit creation.
   - Full AI Habit Coach (Gemini AI Powered).
   - 52-week GitHub-style activity heatmap.
   - All challenge packs unlocked.
   - Exclusive visual themes and soundscapes.
3. **Pro Annual (৳1,499 / $14.99 per year — 37% savings):**
   - Annual discount and priority cloud backup.
4. **Team / Family Pack (৳999 per month):**
   - Group dashboard and team challenges for up to 10 members.

### Technical Implementation:
- **Local Payments (Bangladesh):**
  - **SSLCommerz / Shurjopay / bKash PGW:** Payments via bKash, Nagad, Rocket, and local debit/credit cards.
  - Instant Pro plan activation on the server via IPN (Instant Payment Notification) webhook.
- **International Payments:**
  - **Stripe Checkout & Billing:** Credit card, Apple Pay, and Google Pay for global users.
  - **Google Play In-App Billing (IAP):** Digital product library (`BillingClient`) for the Android app.

---

## 🤖 2. Gemini AI Habit Coach (Upcoming Flagship Feature — Phase 2)

### Status & Target Release
- **Status:** 🚀 **Active Phase 2 Roadmap / Upcoming Feature (আসন্ন ফিচার)**
- **Target Release:** V2.0 Major Engine Update
- **Beta Access:** In-app VIP Early Access Waitlist actively collecting user registrations

### Goal
Transform HabbitTracker from a passive checkbox tracker into an intelligent, proactive behavioral psychologist and daily routine architect powered by Google DeepMind's **Gemini 2.5 Flash** model.

### Key Capabilities & Architecture:
1. **Context-Aware Routine Friction Diagnostics:**
   - Automatically ingest user habit completion trends, timestamp metadata, peak performance windows, and streak drop patterns.
   - Detect friction triggers (e.g. *"Evening habit scheduled at 10:30 PM has an 82% failure rate due to decision fatigue"*).
   - Proactively recommend friction reduction adjustments (James Clear's *Atomic Habits* & BJ Fogg's *Tiny Habits* methodologies).

2. **Automated Habit Stacking Architect:**
   - Intelligently pair challenging new routines with established everyday anchor habits (e.g. *"After I brew morning coffee [Anchor], I will review top 3 priorities [New Habit]"*).
   - Calculate habit synergy scores to maximize routine stickiness.

3. **Conversational & Natural Voice Check-ins:**
   - Multi-turn conversational habit logging using natural language.
   - Voice and text prompt parsing (e.g. *"Ran 3 kilometers in 18 minutes and drank 2 liters of water"* automatically updates both habit records with appropriate checkmarks).
   - Powered by Gemini Interactions API (`@google/genai`) with low-latency streaming responses.

4. **Never Miss Twice Streak Recovery Protocol:**
   - When a streak breaks, behavioral research shows users often succumb to the "what-the-hell effect" and abandon the habit entirely.
   - The AI Coach initiates an automated cognitive reset protocol within 12 hours: providing motivational reframing, micro-step scaling (reducing habit to 2-minute version), and adjusting reminders to guarantee day-2 recovery.

5. **Privacy & Offline Resilient Fallback:**
   - **Privacy-First Design:** Habit data is sanitized before API inference; no personal identifying information (PII) is transmitted.
   - **Offline Heuristics Engine:** If the device is offline or API access is unconfigured, the app seamlessly falls back to a deterministic rule-based behavioral coach engine (`generateBehavioralCoachResponse`) without service interruption.

6. **VIP Early Access Waitlist:**
   - Users can opt-in directly via the 🤖 Coach tab (`Join VIP Waitlist` button).
   - User enrollment is persisted in `localStorage` and synchronized with user account profile for priority roll-out.

---

## 📊 3. Advanced Analytics & Heatmaps

### Goal
Provide visual proof of the user's long-term progress and improvement.

### Features:
1. **GitHub-Style 52-Week Activity Heatmap:**
   - Display each day's completion intensity (0% to 100%) for all 365 days of the year in four neon shades.
2. **Habit Correlation Matrix (Correlation Insights):**
   - Determine the mutual impact of multiple habits (e.g., *"On days you meditated in the morning, your productivity was 42% higher"*).
3. **Predictive Streak Score (Predictive Consistency):**
   - Analyze machine learning and historical data to identify streak-breaking risks in advance and issue warnings.
4. **PDF / CSV Export (Report Export):**
   - Option to download a monthly or yearly progress summary as a nicely formatted PDF certificate.

---

## 🏆 4. Community Challenges & Cohorts

### Goal
Multiply the motivation to maintain habits through social accountability and gamification.

### Features:
1. **Curated Challenge Packs:**
   - 21-day Fitness Boot Camp (`21-Day Fitness Reset`).
   - 30-day Digital Detox and Mindfulness (`30-Day Mindfulness`).
   - 7-day Morning Hydration Boost.
2. **Friends Leaderboard & Cohorts:**
   - Start joint challenges with friends and a real-time leaderboard.
3. **Social Streak Card Generator:**
   - Custom background and photo streak sharing card for Instagram, Facebook Stories, or WhatsApp.

---

## 🎁 5. Referral & Rewards Engine

### Features:
1. **Referral Code Generation:** Automatic unique code for each user (e.g., `HT-X89B2`).
2. **Reward Logic:**
   - When a friend signs up using a referral code, both users receive 1 month of Pro features for free.
3. **Achievement Trophy & Medal System:**
   - Exclusive digital medals for 7-day, 30-day, 100-day, and 365-day streaks.

---

## 🔔 6. Push Notifications via FCM

### Goal
Ensure users can remember their habits on time, even when the app is closed.

### Features:
1. **Firebase Cloud Messaging (FCM) Integration:**
   - Background push notifications that work even when the screen is off.
2. **Intelligent Nudge:**
   - A gentle reminder of incomplete habits for the day before the user goes to sleep at night.
3. **Audio Chimes & Haptic Feedback:**
   - Subtle vibration (haptic) and a satisfying sound effect when the complete button is tapped on a mobile device.

---

## 📱 7. Native Android & iOS Store Releases

### Features:
1. **Google Play Store Release:**
   - Sign the `habit-tracker-android` project with a production keystore and create an `.aab` (Android App Bundle) build.
   - Submit and publish on the Google Play Console.
2. **Home Screen Widgets:**
   - Display today's habit checklist and streak directly on the phone's home screen using Android Glance / RemoteViews.
3. **iOS App Store Release:**
   - Release on the App Store for iPhone via Capacitor or a Swift Wrapper.

---

## 💬 Phase X: Direct Messaging & Chat System (Real-Time Communication)

### Goal
Build a secure and private messaging platform for users to communicate, encourage each other, and share experiences with their habit accountability partners / friends in real time.

### Technical Architecture:
1. **Duplex Transport Layer (WebSocket / SSE):**
   - **Socket.io / ws:** Low-latency bidirectional socket connection. User online/offline presence detection and typing indicator.
   - Secure socket authentication by verifying JWT authentication tokens at the connection handshake.
2. **End-to-End Privacy & Encryption (E2E Encryption Concept):**
   - **Web Cryptography API (SubtleCrypto):** Create public/private key pairs (ECDH / AES-GCM-256) in the client browser for end-to-end message encryption between friends.
   - The server will only relay ciphertext; no plaintext messages will be stored in the server's database.
3. **Ephemeral & Local Storage Caching (Storage Model):**
   - Local chat history caching using the browser's **IndexedDB**.
   - Users can clear or back up chat history at any time.
4. **Habit Sharing Snapshot & Integration:**
   - Easily send today's completion card (Habit Progress Bubble) as a message with a single click from within the chat.
   - Automatic celebration card for a friend's streak milestone (`"🎉 Shashwoto just hit a 14-day streak on Read Book!"`).

---

## 🏆 Phase Y: Friends Leaderboard (Weekly Ranking & Consistency League)

### Goal
Create motivation among friends to maintain daily consistency through gamification and healthy friendly competition.

### Concept & Ranking Mechanics:
1. **Consistency Score Formula (Consistency Index Score):**
   - Scoring based not just on total numbers, but on consistency:
     $$\text{Score} = (\text{Weekly Completion \%} \times 10) + (\text{Active Streak} \times 5) + (\text{On-Time Bonus})$$
2. **Friends-Only Cohort (Privacy-First Cohort):**
   - Instead of a global public leaderboard, a weekly ranking board strictly among mutual friends, respecting privacy.
   - Opt-out privacy settings: users can hide their profile from the friends leaderboard (Stealth Mode) with a single click.
3. **Weekly Reset & Podium Trophy (Weekly Podium & Seasons):**
   - Leaderboard resets every Monday at 12:00 AM to start a new week.
   - The top 3 friends receive Gold 🥇, Silver 🥈, and Bronze 🥉 badges, displayed on their profile and friend card throughout the week.
4. **Friend Comparison View (Head-to-Head Habit Stats):**
   - A graphical comparison of habit completion between two friends so they can push each other.

---

## 📱 8. Universal Mobile Responsive Auto-Fit Architecture

### Status & Implementation
- **Status:** ✅ **Fully Implemented & Active (v1.1)**
- **Target Coverage:** 100% of modern iOS & Android smartphones (320px ultra-compact to 768px+ phablets & foldables)

### Goal
Ensure HabbitTracker delivers a seamless, pixel-perfect, native-app feel on any phone screen size without awkward text clipping, cramped buttons ("hiji biji"), or uncontrolled horizontal overflows.

### Core Architectural Features:
1. **Touch-Scrollable Pill Ribbon Navigation (`.tabs`):**
   - Replaces rigid single-line compression with a fluid horizontal scroll ribbon.
   - Smooth inertia touch scrolling (`-webkit-overflow-scrolling: touch`), scroll snap (`scroll-snap-type: x proximity`), and hidden scrollbars.
   - Preserves readable typography and minimum 40px touch hit targets on every navigation tab.

2. **Adaptive Habit Rows & Actions (`.habit-row`):**
   - Flexible auto-wrapping ensures habit titles, streak badges, alarm time pickers, and action buttons arrange cleanly without colliding.
   - Enforces minimum 32px–40px tap zones for checkboxes and action icons.

3. **Isolated Table Matrix Scrolling (`.table-responsive`):**
   - Dedicated scroll container wraps the 9-column weekly habit matrix.
   - Prevents wide multi-column tables from expanding the parent card or triggering accidental horizontal viewport panning.

4. **Dynamic Monthly Bar Spacing:**
   - Bar chart flex gaps dynamically scale (4px on desktop $\rightarrow$ 2px on mobile $\rightarrow$ 1.5px on compact phones) ensuring all 28–31 monthly bars render cleanly.

5. **Safe-Area Inset Handling:**
   - Full support for device notches, punch-holes, and gesture navigation bars via CSS `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.

6. **Input Zoom Prevention:**
   - Mobile form controls enforce `font-size: 16px` to suppress unwanted automatic zoom behavior in iOS Safari.

---

## 📝 Quick Summary Table

| Feature | Category | Current Status in Project | Target Release |
| :--- | :--- | :--- | :--- |
| **Universal Mobile Auto-Fit UI** | Responsive Design | ✅ Fully Implemented | v1.1 |
| **Google Auth & Profiles** | Core Identity | ✅ Fully Implemented | v1.0 |
| **Streak Engine & Daily/Weekly** | Core Function | ✅ Fully Implemented | v1.0 |
| **PWA & Offline Sync** | Storage & Portability | ✅ Fully Implemented | v1.0 |
| **Friends System (Search & Nudge)** | Social & Privacy | ✅ In Progress | v1.5 |
| **Direct Messaging & Chat (Phase X)** | Real-Time Social | 📋 Architecture Documented | v2.0 |
| **Friends Leaderboard (Phase Y)** | Gamification League | 📋 Concept Documented | v2.0 |
| **Gemini AI Habit Coach** | Intelligence | 🚀 Flagship Upcoming Feature (VIP Waitlist Live) | v2.0 |
| **52-Week Activity Heatmap** | Analytics | 🚀 Upcoming (In Development) | v2.0 |
| **Curated Challenge Packs** | Gamification | 🚀 Upcoming (Roadmap) | v2.0 |
| **Payment Gateway (bKash/Stripe)** | Monetization | 📋 Future Work | v2.5 |
| **Push Notifications (FCM)** | Retention | 📋 Future Work | v2.5 |
| **Play Store App Bundle (.aab)** | Mobile Deployment | 📋 Future Work | v3.0 |
| **Home Screen Widgets** | Mobile Experience | 📋 Future Work | v3.0 |

---

*HabbitTracker — Building consistent routines, one day at a time.*
