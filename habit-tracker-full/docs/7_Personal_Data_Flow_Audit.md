# Personal Data Flow & Privacy Architecture Audit

**Document:** HabitTracker Privacy & Data Movement Specification  
**Architecture Model:** Local-First, Privacy-First, Zero-Knowledge Habit Tracking  
**Status:** Implemented & Verified  

---

## 1. Executive Summary

HabitTracker operates under a strict **Local-First and Privacy-First Architecture**:
- **Core User Data** (Habits, daily completions, historical streaks, notes, and weekly meta) is stored **exclusively on the user's client device** (`localStorage` in Web browser or Android WebView storage).
- **Backend Role** (`server.js` + `db.json`) is strictly minimized to:
  1. Authenticating credentials and issuing cryptographically random session tokens.
  2. Maintaining a lightweight user registry (`username`, optional `email`, basic habit names, and summary activity metrics).
  3. Relaying mutual friend connections and motivation nudges under strict privacy rules.
- **Personal Cloud Backup** (Google Drive API) communicates directly from the user's browser to their personal Google Drive `appDataFolder`. The backend server never sees, intercepts, or stores the backup file.

---

## 2. Personal Data Flow Map

The following map details every sensitive data entry point, its transit pathway, and its final storage destination:

| Data Category | Data Elements Collected | Entry Point | In-Transit Protocol | Primary Storage Destination | Secondary / Backup Storage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication (Native)** | `username`, `password`, optional `email` | Registration & Login Forms (`index.html`, `login.html`) | HTTPS / TLS 1.3 encrypted JSON body | `db.json` (`db.users[username]`) — Password never exposed in responses | Session token in browser `localStorage` |
| **Authentication (Google OAuth)** | `email`, `name`, `sub` (Google user ID), profile photo | Google Identity Services (GIS) One-Tap / Popup | Google OAuth 2.0 / HTTPS POST `/api/auth/google` | `db.json` (`db.users[username]`) — Token returned to client | Browser `localStorage` |
| **Profile & Health Info** | `fullName`, `bloodGroup`, `photo` (Base64/URL), password update | Edit Profile Modal (`#edit-profile-modal`) | HTTPS PUT `/api/user/profile` with Bearer Auth | `db.json` (`db.users[username]`) & Client `localStorage` | Exclusively shared with confirmed mutual friends |
| **Habit Tracking (Core)** | Habit names, frequencies, daily completions, streak counts, notes, weekly meta | Daily, Weekly, Monthly, and History tabs | **None (Local-First)** | Browser `localStorage` (`habittracker_habits_v2`, etc.) | User's personal Google Drive `appDataFolder` (User-controlled) |
| **Lightweight Sync** | `basic_habit_names`, `highestStreak`, `todayCompleted`, `todayTotal` | Client background sync loop (`POST /api/sync`) | HTTPS POST `/api/sync` with Bearer Auth | `db.json` (`db.users[username].activity`) | None (Minimal summary only) |
| **Friends & Social** | Friend requests, mutual friend IDs, emoji reaction nudges (`🔥`, `👏`, `💪`) | Profile Friends Section (`#profile-friends-section`) | HTTPS POST `/api/friends/*` with Bearer Auth | `db.json` (`db.users[username].friends`) | Real-time delivery confirmation |
| **Personal Cloud Backup** | Complete JSON export of all habits, completions, streaks, and settings | Profile Backup & Restore Buttons | Direct HTTPS to `https://www.googleapis.com/upload/drive/v3/` | User's private Google Drive `appDataFolder` | **Never touches application backend!** |

---

## 3. Server Logging & Error Sanitization

A strict logging and error policy is enforced across `server.js`:
1. **Zero Payload Logging**: Neither `req.body`, `req.headers`, nor request parameters are ever logged in plaintext.
2. **Sanitized Error Outputs**: All `console.error` calls output only `err.message` (e.g. `console.error('Database write error:', err.message)`), preventing error objects from inadvertently serializing request payloads or credential variables into server logs.
3. **Global Error Masking Middleware**: Unhandled server exceptions are intercepted by a centralized Express error handler that logs diagnostics server-side and responds to clients with sanitized JSON (`{ error: "An internal server error occurred. Please try again later.", code: "INTERNAL_ERROR" }`), completely suppressing Express default HTML stack traces, file paths, and environment variable leaks.
4. **Technology Stack Fingerprint Suppression**: Express's `X-Powered-By` header is disabled (`app.disable('x-powered-by')`) to prevent server framework fingerprinting.

---

## 4. Third-Party Integrations Audit

| Integration / Service | Provider | Purpose | Data Transferred | Privacy & Security Controls |
| :--- | :--- | :--- | :--- | :--- |
| **Google Identity Services** | Google LLC | Single Sign-On (SSO) | OpenID email, display name, profile avatar | Scopes restricted to `openid`, `email`, `profile`. No contact or calendar access. |
| **Google Drive API** | Google LLC | Personal Cloud Backup | Compressed/serialized habit tracker JSON backup | Least-privilege scope: `https://www.googleapis.com/auth/drive.appdata`. App can ONLY access its own isolated sandbox folder; cannot access user's other files or photos. |
| **Canvas Confetti** | Open Source CDN | UI streak celebrations | None | Static client-side JavaScript file. Zero telemetry. |
| **jspdf / html-to-docx** | Open Source CDN | Client-side export of habit charts | None | Runs 100% inside client browser runtime. No external network requests. |
| **Google Fonts** | Google LLC | Typography | Font requests | Static CSS/WOFF2 font loading. |
| **Telemetry / Ad Trackers** | None | N/A | **ZERO** | **No tracking SDKs, no Google Analytics, no Facebook Pixels, no advertising trackers.** |

---

## 5. API Response Filtering Matrix

Every backend endpoint is strictly filtered to prevent over-fetching and accidental credential exposure:

| Endpoint | Method | Auth Required | Safe Returned Fields | Filtered / Suppressed Fields |
| :--- | :--- | :--- | :--- | :--- |
| `/api/config` | `GET` | No | `googleClientId`, `hasGoogleAuth` | `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `GEMINI_API_KEY`, `DB_PATH` |
| `/api/auth/register` | `POST` | No | `success`, `username`, `email`, `token`, `plan` | `password` (Never returned) |
| `/api/auth/login` | `POST` | No | `success`, `username`, `token`, `plan`, `email`, `fullName`, `photo` | `password`, `sessions` |
| `/api/user/profile` | `GET` | Yes | `username`, `email`, `fullName`, `bloodGroup`, `photo`, `plan` | `password`, `googleSub`, session tokens |
| `/api/friends/search` | `GET` | Yes | `username`, `fullName`, `photo`, `isFriend` | **Passwords, emails, blood groups, habits, and streaks are completely hidden from non-friends.** |
| `/api/friends` | `GET` | Yes | `username`, `fullName`, `photo`, `bloodGroup`, `highestStreak`, `todayCompleted`, `todayTotal` | Passwords, emails, raw habit text, private notes |
| `/api/friends/:username` | `GET` | Yes | Same as above (Only if confirmed mutual friend) | If not friends: `403 Forbidden` with zero data leakage. |
| `/api/user/account` | `DELETE` | Yes | `success: true`, confirmation message | **All user records, credentials, and sessions are permanently purged.** |

---

## 6. Secure Data Deletion & Right to be Forgotten

HabitTracker provides a complete, double-confirmed **Right to be Forgotten** mechanism:

### 1. Client-Side Trigger
- Located in the **Profile (`👤 Profile`)** page under **Danger Zone: Right to be Forgotten**.
- Requires two confirmations:
  1. Browser confirmation dialog explaining permanent erasure of habits, streaks, profile data, and cloud sync.
  2. Prompt demanding the user type their exact username to prevent accidental deletion.

### 2. Atomic Server-Side Cascade (`DELETE /api/user/account`)
When invoked with the user's valid session token:
1. Deletes `db.users[username]` from `data/db.json`.
2. Deletes any legacy records in `db.data[username]`.
3. Traverses all remaining registered users in `db.users` and removes the deleted user from their `friends` arrays.
4. Purges all active session tokens associated with the user from `db.sessions`, immediately revoking authentication.
5. Writes changes atomically to `data/db.json`.

### 3. Client Storage Wipe
Upon receiving a successful deletion response:
1. Completely removes all HabitTracker keys from browser `localStorage`:
   - `habittracker_session_token`, `habittracker_user_profile`, `habittracker_habits_v2`, `habittracker_daily_completions`, `habittracker_weekly_meta`, `habittracker_history_v2`, `habittracker_active_challenges`, `gdrive_access_token`, etc.
2. In-memory state is completely reset to empty guest defaults.
3. User is navigated to the onboarding guest view with a confirmation toast: *"🗑️ Account & all personal data permanently erased."*
