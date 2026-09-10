# HabbitTracker — Product Requirements Document (PRD)
**Version:** 1.0  
**Date:** July 30, 2026  
**Author:** Product Team  
**Status:** Approved  

---

## 1. Executive Summary

HabbitTracker is a freemium Progressive Web Application (PWA) and Android native app designed to help individuals build and sustain positive daily habits through AI-powered coaching, gamification, structured challenge programs, and advanced analytics. The product targets productivity-conscious individuals aged 18–35 in Bangladesh and South Asia, with a Freemium monetization model generating revenue through monthly subscriptions, challenge pack purchases, and team/corporate licenses.

---

## 2. Problem Statement

### 2.1 Core Problem
Over 80% of people who attempt to build new habits fail within the first 30 days. The primary reasons are:
- Lack of accountability and structured tracking
- No personalized guidance or coaching
- No measurable progress metrics
- No community or social reinforcement

### 2.2 Market Gap
Existing habit-tracking apps (Habitica, Streaks, Fabulous) are:
- Primarily English-only, not localized for South Asia
- Expensive or not accessible in Bangladeshi BDT pricing
- Missing AI-driven personalized coaching
- Not available as installable PWA with offline support

---

## 3. Product Vision & Goals

### 3.1 Vision Statement
> "To become the #1 habit-building companion for South Asian individuals, empowering 1 million users to transform their daily routines within 3 years."

### 3.2 Product Goals
| Goal | Metric | Target (Year 1) |
|------|--------|-----------------|
| User Acquisition | Monthly Active Users | 50,000 |
| Monetization | Paying Users (Pro/Team) | 2,500 (5% conversion) |
| Retention | Day-30 Retention Rate | 40% |
| Revenue | Monthly Recurring Revenue | ৳500,000/month |
| Engagement | Avg. Habits Completed/Day | 4+ per active user |

---

## 4. Target Users & Personas

### 4.1 Persona 1 — "The Ambitious Student"
- **Name:** Rafi, 21, Dhaka
- **Occupation:** University student
- **Goals:** Study consistently, exercise, avoid social media addiction
- **Pain Points:** Lacks accountability, forgets routines, gets demotivated
- **Device:** Android (primary), Chrome desktop (secondary)
- **Plan:** Free (upgrades to Pro for AI coaching)

### 4.2 Persona 2 — "The Professional Optimizer"
- **Name:** Nadia, 28, Chittagong
- **Occupation:** Software Engineer
- **Goals:** Exercise daily, read books, manage work-life balance
- **Pain Points:** Busy schedule, needs data-driven insights to optimize
- **Device:** Android + Desktop
- **Plan:** Pro (pays for analytics and AI coach)

### 4.3 Persona 3 — "The Corporate Wellness Manager"
- **Name:** Karim, 35, Dhaka
- **Occupation:** HR Manager at a 200-person tech company
- **Goals:** Build a wellness culture across his team
- **Pain Points:** No affordable tool for team-level habit tracking
- **Device:** Desktop (primary)
- **Plan:** Team Plan (pays ৳999/month for up to 10 members)

---

## 5. Feature Requirements

### 5.1 Core Features (Free Plan)

#### F1: Daily Habit Tracking
- **Description:** Users can add up to 5 habits and check them off daily
- **Priority:** P0 — Must Have
- **Acceptance Criteria:**
  - User can add a habit with a name
  - User can check/uncheck a habit for today
  - Progress percentage updates in real-time
  - Habits persist across sessions (localStorage)

#### F2: Streak Tracking
- **Description:** Consecutive completion days are counted and displayed
- **Priority:** P0 — Must Have
- **Acceptance Criteria:**
  - Streak increments when habit is completed on consecutive days
  - Streak resets if a day is missed
  - "Best Streak" is tracked globally across all habits
  - Streak badge (🔥) shown inline next to habit name for streak ≥ 2

#### F3: Reminder / Alarm System
- **Description:** Time-based reminders for individual habits
- **Priority:** P0 — Must Have
- **Acceptance Criteria:**
  - User can set a reminder time per habit
  - Alarm fires via browser notification + audio tone at set time
  - 30-minute window: Upcoming → Available → Missed states
  - Missed habits are locked from completion

#### F4: Weekly Planning
- **Description:** Users set weekly focus, reward, and affirmation
- **Priority:** P1 — Should Have
- **Acceptance Criteria:**
  - Focus, Reward, Affirmation fields are editable
  - Goal percentage can be set (default 90%)
  - Visual donut chart shows weekly progress vs goal

#### F5: Monthly Statistics
- **Description:** Bar chart view of all month's daily completion rates
- **Priority:** P1 — Should Have
- **Acceptance Criteria:**
  - Bar chart renders for each day of selected month
  - Top habits ranked by monthly completion %
  - Navigation between months possible

#### F6: Data Export/Import
- **Description:** JSON backup and restore
- **Priority:** P1 — Should Have
- **Acceptance Criteria:**
  - Export produces valid JSON file
  - Import overwrites existing data with confirmation dialog
  - Data persists across import/export cycles without loss

#### F7: User Authentication + Cloud Sync
- **Description:** Account creation, login, and cross-device sync
- **Priority:** P1 — Should Have
- **Acceptance Criteria:**
  - Username (3-15 chars, alphanumeric) + password (4+ chars)
  - JWT or session-based auth on Node.js Express backend
  - Data syncs automatically when online
  - Offline mode works via localStorage fallback

### 5.2 Pro Features (৳199/month)

#### F8: Unlimited Habits
- **Description:** Remove the 5-habit limit for Pro users
- **Priority:** P0 — Critical for monetization
- **Acceptance Criteria:**
  - Free users see lock icon on habit #6+
  - Pro users have no limit
  - Upgrade prompt shown when free limit reached

#### F9: AI Habit Coach
- **Description:** Personalized habit suggestions based on user data
- **Priority:** P0 — Key differentiator
- **Acceptance Criteria:**
  - Minimum 10 evidence-based habit suggestions
  - Suggestions categorized (Wellness, Fitness, Productivity, etc.)
  - AI Insights generated from user's actual data (streak, consistency)
  - One-tap "Add Habit" from suggestion
  - "Refresh Suggestions" rotates through suggestion library

#### F10: Challenge Pack Store
- **Description:** Structured multi-week challenges with bundled habits
- **Priority:** P1 — Revenue driver
- **Acceptance Criteria:**
  - Minimum 6 challenge packs available
  - 2 free packs, 4 paid (৳49–৳149)
  - Starting a challenge auto-adds all its habits
  - Progress tracked with days-remaining counter
  - Active challenges shown in dashboard

#### F11: Advanced Analytics + Heatmap
- **Description:** 52-week habit heatmap and performance insights
- **Priority:** P1 — Pro differentiator
- **Acceptance Criteria:**
  - GitHub-style contribution heatmap for 52 weeks
  - 4 intensity levels (0–4) based on daily completion %
  - Best day / Worst day analysis
  - 7-day vs 30-day trend comparison
  - Day-of-week consistency bar chart

#### F12: Premium Themes
- **Description:** 5 color themes for the UI
- **Priority:** P2 — Nice to Have
- **Acceptance Criteria:**
  - Default (Dark), Sakura, Ocean, Sunset, Matrix themes
  - Theme persists via localStorage
  - Instant switch without page reload
  - All UI elements correctly themed

#### F13: Share Streak Card
- **Description:** Shareable streak card for social media
- **Priority:** P2 — Viral growth
- **Acceptance Criteria:**
  - Preview card shows streak count, habit names, all-time completions
  - "Copy Text" copies formatted text to clipboard
  - "Share" opens WhatsApp share intent

#### F14: Referral Program
- **Description:** Unique referral code for free month rewards
- **Priority:** P2 — Acquisition
- **Acceptance Criteria:**
  - Each Pro user gets a unique referral code
  - Code is copyable with one tap
  - 3-step referral flow is displayed visually

### 5.3 Team Plan Features (৳999/month)

#### F15: Team Dashboard (Future)
- **Description:** Admin view for managing team members' habit progress
- **Priority:** P3 — Phase 2
- **Status:** Planned for v2.0

#### F16: Custom Challenge Creation (Future)
- **Priority:** P3 — Phase 2

---

## 6. User Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-01 | Free user | Add up to 5 habits | I can track my daily routine | P0 |
| US-02 | Free user | See my streak for each habit | I feel motivated to continue | P0 |
| US-03 | Free user | Set a reminder for a habit | I don't forget to complete it | P0 |
| US-04 | Free user | See "Upgrade" when I hit the limit | I understand the value of Pro | P0 |
| US-05 | Pro user | Get AI habit suggestions | I know what habits to add next | P0 |
| US-06 | Pro user | Start a 21-day challenge | I have structure in my habit journey | P1 |
| US-07 | Pro user | View my habit heatmap | I can see my long-term consistency | P1 |
| US-08 | Pro user | Switch to Sakura theme | My app feels personalized | P2 |
| US-09 | Pro user | Share my streak card | My friends see my progress | P2 |
| US-10 | Any user | Export my data as JSON | I have a backup of my progress | P1 |
| US-11 | Any user | Login and sync to cloud | My data works on all my devices | P1 |
| US-12 | Team manager | Manage team habits | I build wellness culture at work | P3 |

---

## 7. Non-Functional Requirements

### 7.1 Performance
- App shell loads within **2 seconds** on 3G connection
- Habit toggle responds within **100ms**
- Heatmap renders within **500ms** for 52 weeks of data

### 7.2 Offline Capability
- All core features (Daily, Weekly, Monthly, History) must work offline
- Data syncs automatically when connection restores
- PWA installable on Android home screen

### 7.3 Compatibility
- **Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Samsung Internet 14+
- **Android:** API Level 24+ (Android 7.0 Nougat)
- **Screen Sizes:** 320px – 1440px responsive

### 7.4 Accessibility
- All interactive elements must have `aria-label` attributes
- Color contrast ratio minimum 4.5:1 (WCAG AA)
- Keyboard navigable tab interface

### 7.5 Security
- Passwords stored as hashed values (bcrypt) in production
- No sensitive data stored in URL parameters
- CORS configured for production domain only

---

## 8. Revenue Model

| Plan | Price | Billing | Features |
|------|-------|---------|----------|
| Free | ৳0 | Forever | 5 habits, basic streaks, weekly/monthly view |
| Pro Monthly | ৳199 | Per month | Unlimited habits + all Pro features |
| Pro Yearly | ৳1,499 | Per year | All Pro features (37% discount) |
| Team | ৳999 | Per team/month | Up to 10 members, all Pro features |

### 8.1 Revenue Projections (Year 1)
| Month | MAU | Pro Users (5%) | MRR |
|-------|-----|----------------|-----|
| Month 3 | 5,000 | 250 | ৳49,750 |
| Month 6 | 20,000 | 1,000 | ৳199,000 |
| Month 9 | 35,000 | 1,750 | ৳348,250 |
| Month 12 | 50,000 | 2,500 | ৳497,500 |

---

## 9. Success Metrics & KPIs

| KPI | Definition | Target |
|-----|------------|--------|
| DAU/MAU Ratio | Daily actives / Monthly actives | >35% |
| Habit Completion Rate | Habits completed / habits scheduled | >70% |
| Free → Pro Conversion | Pro signups / Total signups | >5% |
| Churn Rate | Monthly Pro cancellations | <8% |
| NPS Score | Net Promoter Score | >50 |
| Day-7 Retention | Users active on day 7 | >50% |
| Day-30 Retention | Users active on day 30 | >30% |

---

## 10. Out of Scope (v1.0)

- Payment gateway integration (demo only in v1)
- Real AI/ML backend (simulated suggestions in v1)
- Team dashboard UI
- Social feed / community features
- Wearable device integration (Fitbit, Garmin)
- iOS native app (Android + PWA only in v1)

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low Pro conversion | Medium | High | Improve onboarding, add free trial |
| Data loss on import | Low | High | Validate JSON schema before import |
| Notification permission denied | High | Medium | Graceful fallback, in-app toast reminders |
| Android WebView compatibility | Low | High | Test on API 24+ devices |
| Competition from established apps | Medium | Medium | Focus on Bangla/South Asia localization |

---

## 12. Approval & Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | — | ________ | July 30, 2026 |
| Tech Lead | — | ________ | July 30, 2026 |
| Design Lead | — | ________ | July 30, 2026 |
| Instructor | — | ________ | July 30, 2026 |
