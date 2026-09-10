# HabbitTracker — Backend Schema Document
**Version:** 1.0  
**Date:** July 30, 2026  
**Author:** Engineering Team  
**Status:** Approved  

---

## 1. Overview

This document defines the complete data schema for HabbitTracker's backend layer. The MVP uses a JSON file (`db.json`) as the data store, hosted on a Node.js Express server. This document also defines the production-ready schema for the planned migration to a relational database (PostgreSQL) in v2.0.

---

## 2. MVP Data Store: db.json

### 2.1 Top-Level Structure
```json
{
  "users": {
    "[username_normalized]": {
      "password": "string"
    }
  },
  "data": {
    "[username_normalized]": {
      "habits": [],
      "completions": {},
      "dailyTasks": {},
      "weeklyMeta": {},
      "habitHistory": {},
      "plan": "string",
      "activeChallenges": []
    }
  }
}
```

**Key conventions:**
- All usernames are stored in **lowercase** (`username.trim().toLowerCase()`)
- `users` and `data` keys always match (normalized username)
- `db.json` is read synchronously on every request (MVP simplicity)
- `db.json` is written atomically via `JSON.stringify` + `fs.writeFileSync`

---

### 2.2 User Authentication Schema

```json
{
  "users": {
    "rafi123": {
      "password": "secret123"
    },
    "nadia_dev": {
      "password": "nadia2026"
    }
  }
}
```

**Fields:**

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `users` | Object | — | Top-level map |
| `[username]` | String (key) | 3–15 chars, `^[a-zA-Z0-9_]+$`, stored lowercase | Unique identifier |
| `password` | String | Min 4 chars | Plaintext in MVP; bcrypt in production |

---

### 2.3 User Data Schema

```json
{
  "data": {
    "rafi123": {
      "habits": [
        {
          "id": "h1753784400000",
          "name": "Morning Run",
          "reminderTime": "07:00",
          "days": ["Mon", "Wed", "Fri"]
        },
        {
          "id": "h1753784410000",
          "name": "Read 10 pages",
          "reminderTime": null,
          "days": null
        }
      ],
      "completions": {
        "2026-07-30": {
          "h1753784400000": true,
          "h1753784410000": true
        },
        "2026-07-29": {
          "h1753784400000": true,
          "h1753784410000": false
        }
      },
      "dailyTasks": {
        "2026-07-30": [
          {
            "id": "t1753784500001",
            "name": "Review lecture notes",
            "done": false
          },
          {
            "id": "t1753784500002",
            "name": "Buy groceries",
            "done": true
          }
        ]
      },
      "weeklyMeta": {
        "focus": "Health and fitness",
        "reward": "Cinema date",
        "affirmation": "I show up every single day",
        "profileName": "Rafi",
        "goalPercent": 90
      },
      "habitHistory": {
        "h1753784400000": [
          {
            "date": "2026-07-30",
            "time": "2026-07-30T07:15:00.000Z",
            "status": "completed"
          },
          {
            "date": "2026-07-29",
            "time": "2026-07-29T07:22:00.000Z",
            "status": "completed"
          }
        ]
      },
      "plan": "pro",
      "activeChallenges": [
        {
          "id": "fitness-21",
          "startedAt": 1753784400000
        }
      ]
    }
  }
}
```

---

## 3. Entity Schemas

### 3.1 Habit Entity

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | String | ✅ | `"h" + Date.now()` | Unique identifier |
| `name` | String | ✅ | 1–100 chars, HTML-escaped | Display name |
| `reminderTime` | String \| null | ❌ | Format: `"HH:MM"` (24hr) | Alarm trigger time |
| `days` | String[] \| null | ❌ | Values: `["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]` | Active days; null = all days |

**Example:**
```json
{
  "id": "h1753784400000",
  "name": "Cold shower",
  "reminderTime": "06:30",
  "days": ["Mon", "Tue", "Wed", "Thu", "Fri"]
}
```

**Business Rules:**
- Free users: Maximum 5 habits in the `habits[]` array
- Pro users: No maximum limit
- Habits with `days: null` appear every day of the week
- Habit `id` must be globally unique per user; `"h" + timestamp` is sufficient at MVP scale

---

### 3.2 Completions Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `completions` | Object | ✅ | Top-level map |
| `[dateStr]` | String (key) | — | Date in `"YYYY-MM-DD"` format (local timezone) |
| `[habitId]` | Boolean (value) | — | `true` = completed, `false` = explicitly unchecked, missing = not tracked |

**Example:**
```json
{
  "2026-07-30": {
    "h1753784400000": true,
    "h1753784410000": false
  }
}
```

**Business Rules:**
- Missing key = habit not yet actioned (not the same as `false`)
- `false` explicitly means the user unchecked a previously checked habit
- Completion is only allowed if `getHabitStatus(habit, date)` returns `"available"` or `"completed"`
- Date keys use the user's local timezone (client-side `fmtDate()`)

---

### 3.3 Daily Tasks Entity

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | String | ✅ | `"t" + timestamp + Math.random()` | Unique identifier |
| `name` | String | ✅ | 1–200 chars | Task description |
| `done` | Boolean | ✅ | `true` \| `false` | Completion state |

**Example:**
```json
{
  "2026-07-30": [
    {
      "id": "t17537844000010.8234",
      "name": "Review lecture notes",
      "done": false
    }
  ]
}
```

**Business Rules:**
- No limit on number of daily tasks
- Tasks are date-scoped (not carried over to next day)
- Deletion removes the item from the array by ID

---

### 3.4 Weekly Meta Entity

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `focus` | String | ❌ | `""` | 0–100 chars, HTML-escaped |
| `reward` | String | ❌ | `""` | 0–100 chars, HTML-escaped |
| `affirmation` | String | ❌ | `""` | 0–200 chars, HTML-escaped |
| `profileName` | String | ❌ | `""` | 0–50 chars, HTML-escaped |
| `goalPercent` | Number | ❌ | `90` | 0–100, integer |

**Example:**
```json
{
  "focus": "Health and fitness",
  "reward": "Cinema date on Saturday",
  "affirmation": "I show up every single day",
  "profileName": "Rafi",
  "goalPercent": 90
}
```

**Business Rules:**
- `goalPercent` is used to render the goal tick mark on the donut chart
- `profileName` is shown in the top bar (max 12 chars rendered, truncated with `…`)
- `weeklyMeta` is a single object (not date-keyed); it represents the "current" week plan

---

### 3.5 Habit History Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | String | ✅ | `"YYYY-MM-DD"` — completion date in local TZ |
| `time` | String | ✅ | ISO 8601 UTC string (`new Date().toISOString()`) |
| `status` | Enum String | ✅ | `"completed"` \| `"missed"` |

**Example:**
```json
{
  "h1753784400000": [
    {
      "date": "2026-07-30",
      "time": "2026-07-30T01:15:00.000Z",
      "status": "completed"
    },
    {
      "date": "2026-07-28",
      "time": "2026-07-28T02:45:00.000Z",
      "status": "missed"
    }
  ]
}
```

**Business Rules:**
- `logHistory()` is called on every `toggle()` call
- History entries are never deleted (append-only log)
- `status: "missed"` is recorded when a toggled-on habit is toggled back off
- Used by Monthly statistics and Analytics heatmap for historical percentages

---

### 3.6 Plan Entity

| Value | Description | Features |
|-------|-------------|----------|
| `"free"` | Default plan | 5 habit limit, basic features |
| `"pro"` | Monthly Pro at ৳199/mo | All features |
| `"team"` | Team plan at ৳999/team/mo | All Pro + team features |

**Storage:**
- Client: `localStorage.getItem("HabbitTracker_plan")`
- Server: `db.data[username].plan`

**Business Rules:**
- `isPro()` returns `true` if plan is `"pro"` or `"team"`
- Plan is set by `activatePro()` on the client or `POST /api/upgrade` on the server
- Both must be set for cross-device persistence

---

### 3.7 Active Challenges Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | ✅ | Challenge pack ID (e.g., `"fitness-21"`) |
| `startedAt` | Number | ✅ | Unix timestamp in milliseconds |

**Example:**
```json
[
  {
    "id": "fitness-21",
    "startedAt": 1753784400000
  },
  {
    "id": "mindful-30",
    "startedAt": 1753870800000
  }
]
```

**Business Rules:**
- Duplicate challenges (same `id`) are not allowed (`Array.some()` guard)
- `daysLeft` is computed as: `pack.days - Math.floor((Date.now() - startedAt) / 86400000)`
- Challenge is auto-completed (removed) when `daysLeft <= 0` (Phase 2)

---

## 4. Server-Side Challenge Pack Catalog

These are static records defined in `server.js`:

| ID | Title | Days | Price (৳) | Free? | Habits Count |
|----|-------|------|------------|-------|--------------|
| `fitness-21` | 21-Day Fitness Reset | 21 | 0 | ✅ | 3 |
| `mindful-30` | 30-Day Mindfulness | 30 | 49 | ❌ | 3 |
| `reading-30` | 30-Day Reader | 30 | 49 | ❌ | 3 |
| `nutrition-21` | 21-Day Clean Eating | 21 | 99 | ❌ | 4 |
| `productivity-14` | 14-Day Deep Work | 14 | 149 | ❌ | 3 |
| `sleep-21` | 21-Day Sleep Mastery | 21 | 0 | ✅ | 3 |

**Full Pack Schema:**
```typescript
interface ChallengePack {
  id: string;        // Unique identifier
  title: string;     // Display name
  days: number;      // Duration
  price: number;     // 0 = free
  habits: string[];  // Habit names to auto-add on start
}
```

---

## 5. API Endpoint to Schema Mapping

| Endpoint | Method | Request Schema | Response Schema |
|----------|--------|---------------|-----------------|
| `/api/auth/register` | POST | `{ username, password }` | `{ success, message }` or `{ error }` |
| `/api/auth/login` | POST | `{ username, password }` | `{ success, username }` or `{ error }` |
| `/api/sync` | GET | `?username=string` | Full `UserData` object |
| `/api/sync` | POST | `{ username, data: UserData }` | `{ success, message }` |
| `/api/upgrade` | POST | `{ username, plan }` | `{ success, plan, message }` or `{ error }` |
| `/api/plan` | GET | `?username=string` | `{ plan }` or `{ error }` |
| `/api/challenges` | GET | — | `{ challenges: ChallengePack[] }` |
| `/api/challenges/start` | POST | `{ username, challengeId }` | `{ success, message, pack }` or `{ error }` |

---

## 6. Data Validation Rules

### 6.1 Server-Side Validation

| Field | Rule | Error Response |
|-------|------|----------------|
| `username` (register) | Regex `^[a-zA-Z0-9_]{3,15}$` | `"Username must be 3-15 characters..."` |
| `password` (register) | `.length >= 4` | `"Password must be at least 4 characters!"` |
| `username` (login) | Must exist in `db.users` | `"Incorrect username or password!"` |
| `password` (login) | Must match stored password | `"Incorrect username or password!"` |
| `plan` (upgrade) | Must be `"free"`, `"pro"`, or `"team"` | `"Username and plan required!"` |
| `challengeId` (start) | Must exist in `CHALLENGE_PACKS[]` | `"Challenge not found!"` |

### 6.2 Client-Side Validation (Before Submission)

| Field | Rule | UI Feedback |
|-------|------|-------------|
| `habit.name` | Not empty after trim | Focus input |
| `task.name` | Not empty after trim | Focus input |
| `habits.length` | ≤ 5 for free users | Toast + pricing modal |
| `habit.reminderTime` | Valid `HH:MM` format | Set to null if invalid |
| `weeklyMeta.goalPercent` | 1–100 | Default to 90 |
| Import file | Valid JSON | Toast error message |
| Username input | Not empty | `alert()` |
| Password input | Not empty | `alert()` |

---

## 7. Data Lifecycle

### 7.1 Habit Lifecycle
```
CREATE (addHabit)
  → habits.push({id, name, reminderTime, days})
  → saveHabits()
  → syncWithServer()

READ (renderDaily, getStreak, etc.)
  → habits[] from state

UPDATE (editHabit — Phase 2)
  → habits[i] = {...}
  → saveHabits()

DELETE (deleteHabit)
  → habits.splice(i, 1)
  → delete completions[*][id]
  → delete habitHistory[id]
  → saveHabits()
  → triggerSaveAndSync()
```

### 7.2 Completion Lifecycle
```
TOGGLE ON
  → completions[date][id] = true
  → logHistory(id, date, "completed")
  → triggerSaveAndSync()
  → render()

TOGGLE OFF
  → completions[date][id] = false
  → logHistory(id, date, "missed")
  → triggerSaveAndSync()
  → render()

READ (getCombinedPct, dayPercent)
  → completions[date] map
```

### 7.3 Sync Lifecycle
```
ON APP LOAD (loadState)
  → Load all from localStorage
  → IF currentUser AND online:
      loadFromServer() → overwrite localStorage
  → render()

ON STATE CHANGE (triggerSaveAndSync)
  → Save to localStorage (sync)
  → IF currentUser AND online:
      syncWithServer() → POST /api/sync (async)
  → updateSyncBadge()

OFFLINE MODE
  → localStorage only
  → Sync badge shows "offline"
  → Retry on next user action
```

---

## 8. Production Database Migration (v2.0 Plan)

### 8.1 Target: PostgreSQL Schema

```sql
-- Users table
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(15) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,           -- bcrypt hash
  email       VARCHAR(255),
  plan        VARCHAR(10) DEFAULT 'free',       -- free|pro|team
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Habits table
CREATE TABLE habits (
  id              VARCHAR(30) PRIMARY KEY,      -- "h" + timestamp
  user_id         UUID REFERENCES users(id),
  name            VARCHAR(100) NOT NULL,
  reminder_time   VARCHAR(5),                   -- "HH:MM"
  days            TEXT[],                        -- {Mon,Wed,Fri}
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Completions table
CREATE TABLE completions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  habit_id    VARCHAR(30) REFERENCES habits(id),
  date        DATE NOT NULL,
  completed   BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_id, date)
);

-- Habit history table (immutable log)
CREATE TABLE habit_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  habit_id    VARCHAR(30),
  date        DATE NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  status      VARCHAR(10) NOT NULL,             -- completed|missed
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Daily tasks table
CREATE TABLE daily_tasks (
  id          VARCHAR(40) PRIMARY KEY,
  user_id     UUID REFERENCES users(id),
  date        DATE NOT NULL,
  name        VARCHAR(200) NOT NULL,
  done        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly meta table
CREATE TABLE weekly_meta (
  user_id       UUID PRIMARY KEY REFERENCES users(id),
  focus         VARCHAR(100),
  reward        VARCHAR(100),
  affirmation   VARCHAR(200),
  profile_name  VARCHAR(50),
  goal_percent  INTEGER DEFAULT 90,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Active challenges table
CREATE TABLE active_challenges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  challenge_id  VARCHAR(30) NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, challenge_id)
);

-- Subscriptions table (Phase 2)
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  plan            VARCHAR(10) NOT NULL,
  stripe_sub_id   VARCHAR(100),
  status          VARCHAR(20),                   -- active|cancelled|past_due
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.2 Indexes
```sql
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_completions_user_date ON completions(user_id, date);
CREATE INDEX idx_history_user_habit ON habit_history(user_id, habit_id);
CREATE INDEX idx_daily_tasks_user_date ON daily_tasks(user_id, date);
CREATE INDEX idx_active_challenges_user ON active_challenges(user_id);
```

---

## 9. Data Security

| Risk | Mitigation (MVP) | Mitigation (Production) |
|------|-----------------|------------------------|
| Plain-text passwords | Acceptable for demo | bcrypt with salt rounds=12 |
| No input sanitization on server | esc() on client | Parameterized queries in PostgreSQL |
| No rate limiting | Acceptable for local demo | Express-rate-limit middleware |
| No HTTPS | Localhost only | Nginx + Let's Encrypt SSL |
| No token auth | Username as trust | JWT (HS256), refresh tokens |
| CORS wildcard | Localhost only | Restrict to production domain |

---

## 10. db.json Sample File

```json
{
  "users": {
    "demo": {
      "password": "demo"
    }
  },
  "data": {
    "demo": {
      "habits": [
        { "id": "h1", "name": "Cold shower", "reminderTime": "06:30", "days": null },
        { "id": "h2", "name": "Gym", "reminderTime": "08:00", "days": ["Mon","Wed","Fri"] },
        { "id": "h3", "name": "Read 10 pages", "reminderTime": null, "days": null },
        { "id": "h4", "name": "Budget tracking", "reminderTime": null, "days": null },
        { "id": "h5", "name": "Studying", "reminderTime": "20:00", "days": null }
      ],
      "completions": {
        "2026-07-30": { "h1": true, "h2": true, "h3": false }
      },
      "dailyTasks": {
        "2026-07-30": [
          { "id": "t1001", "name": "Review lecture notes", "done": false }
        ]
      },
      "weeklyMeta": {
        "focus": "Academic performance",
        "reward": "Cinema on Saturday",
        "affirmation": "I am consistent and disciplined",
        "profileName": "Demo",
        "goalPercent": 90
      },
      "habitHistory": {
        "h1": [
          { "date": "2026-07-30", "time": "2026-07-30T00:35:00.000Z", "status": "completed" }
        ]
      },
      "plan": "pro",
      "activeChallenges": [
        { "id": "fitness-21", "startedAt": 1753784400000 }
      ]
    }
  }
}
```
