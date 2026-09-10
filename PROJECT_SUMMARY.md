# 📱 HabbitTracker (Habit Tracker Complete Project) - কাজের সম্পূর্ণ বিবরণী

এই ডকুমেন্টে **HabbitTracker** প্রজেক্টের সমস্ত বৈশিষ্ট্য, ব্যবহৃত প্রযুক্তি, ফাইল স্ট্রাকচার এবং কী কী কাজ বাস্তবায়ন করা হয়েছে তার বিস্তারিত বিবরণ দেয়া হলো।

---

## 📌 ১. প্রজেক্টের সংক্ষিপ্ত বিবরণ (Project Overview)

**HabbitTracker** হলো একটি আধুনিক, ফিচার-সমৃদ্ধ হেবিট ট্র্যাকিং ও ডেইলি টাস্ক ম্যানেজমেন্ট প্ল্যাটফর্ম। এটি তিনটি প্রধান মাধ্যমে ব্যবহার উপযোগী করে তৈরি করা হয়েছে:
1. **Web App / Progressive Web App (PWA):** ব্রাউজার ও মোবাইলে অফলাইনে চালানোর উপযোগী।
2. **Android Application (`habit-tracker-android`):** অ্যান্ড্রয়েড ডিভাইসের জন্য Kotlin ও WebView দিয়ে তৈরি নেটিভ অ্যাপ।
3. **Node.js Express Backend (`server.js`):** ইউজার অথেনটিকেশন ও ক্রস-ডিভাইস ডেটা সিঙ্কিংয়ের জন্য REST API সার্ভার।

---

## 🏗️ ২. এই প্রজেক্টে কী কী তৈরি ও বাস্তবায়ন করা হয়েছে (What Has Been Done)

### 🔹 ক. Frontend & Progressive Web App (PWA) (`habit-tracker-full/`)
১. **Ember & Tide Nocturnal Luxury Design System & Typography:**
   - **Surface & Canvas (`#171210` / `#110D0B` / `#1F1B18`):** প্রিমিয়াম উষ্ণ ও প্রশান্তিময় ডার্ক ক্যানভাস (Organic roasted charcoal umber undertone)।
   - **M3 Container Cards (`rgba(35, 31, 28, 0.78)` / `#231F1C` / `#2E2927`):** ২৪ পিক্সেল ব্লার সহ আধুনিক গ্লাস মরফিজম সারফেস ও হেয়ারলাইন বর্ডার।
   - **Cream Primary Ink (`#EBE0DC`) & Warm Muted (`#E3BEB6`) & Outline (`#AA8982`):** চোখের জন্য আরামদায়ক উচ্চ কনট্রাস্ট টেক্সট।
   - **Ember Primary Accent (`#FF5A36`):** স্ট্রিক ফায়ার আইকন, হ্যাবিট কমপ্লিট টগল, প্রাইমারি অ্যাকশন বাটন, স্পার্কলাইন ফিল ও অ্যাম্বিয়েন্ট গ্লো (`--glow-ember`)।
   - **Tide Teal Accent (`#49DCC9` / `#02BAA8`):** এআই কোচিং ইনসাইটস, ইন্টেলিজেন্ট সিডিউলিং, প্রো আইডেন্টিটি ও ফোকাস বর্ডার।
   - **Marigold Reward Gold (`#FABC41` / `#BF8900`):** স্ট্রিক মাইলস্টোন, রিওয়ার্ড ব্যাজ, চ্যালেঞ্জ রিওয়ার্ড কার্ডস ও গোল হিট টিক।
   - **Crimson Red (`#FFB4AB` / `#93000A`):** মিসড হ্যাবিট স্টেট, এরর মেসেজ, ডিলিট ও ডেস্ট্রাক্টিভ অ্যাকশন কনফার্মেশন।
   - **Pro Gradient (`linear-gradient(135deg, #49DCC9 0%, #02BAA8 52%, #FF5A36 100%)`):** প্রো আপগ্রেড সিটিএ ও প্রাইসিং হেডার।
   - **Atmospheric Glows & Radii:** ৩০ পিক্সেল পর্যন্ত রেডিয়েশন গ্লো ইফেক্টস এবং ফ্লুইড ২৪ পিক্সেল রাউন্ডেড কর্নার্স (`--radius-3xl`)।
   - **Typography:** গুগল ফন্টসের *Plus Jakarta Sans* (UI টেক্সট/হেডিংস) ও *JetBrains Mono* (স্ট্যাটস/টাইমস্ট্যাম্প)।

২. **Habit & Task Management Engine:**
   - **Daily Habit Tracking:** প্রতিদিনের অভ্যাস যোগ করা, ক্যাটাগরি নির্ধারণ এবং স্ট্রিক (Streak) ট্র্যাকিং।
   - **Streaks Counter & Best Streak:** অভ্যাসের ধারাবাহিকতা বজায় রাখতে কারেন্ট স্ট্রিক ও অল-টাইম সর্বোচ্চ স্ট্রিক কাউন্টার।
   - **Reminder & Time Windows:** রিমাইন্ডার টাইম সেট করা এবং ±৩০ মিনিটের টাইম উইন্ডো (Upcoming, Available, Missed অবস্থা)।
   - **Custom Day Scheduling:** সপ্তাহের নির্দিষ্ট দিন নির্বাচন করার জন্য ইন্টারঅ্যাক্টিভ ডে চিপস (Day Chips)।

৩. **Weekly Goals & Gamification:**
   - **Weekly Focus & Target:** পুরো সপ্তাহের জন্য কমপ্লিশন পার্সেন্টেজ টার্গেট (যেমন: ৮০%) সেট করা এবং গ্রাফিক্যাল প্রোগ্রেস ডোনাট চার্ট।
   - **Celebration Animations:** দৈনিক বা সাপ্তাহিক লক্ষ্য পূরণ হলে কনফেটি অ্যানিমেশন (Confetti Celebration)।

৪. **Advanced Analytics & History:**
   - **History Tab:** অল-টাইম কমপ্লিশন পার্সেন্টেজ ব্রেকডাউন এবং প্রতিটি অভ্যাসের সময়ভিত্তিক অ্যাক্টিভিটি লগ (Activity Log with Timestamps)।
   - **Monthly Tab:** মাসভিত্তিক শীর্ষ অভ্যাস র‍্যাংকিং (Top Habits Ranking) এবং ডেটা রিসেট করার সুবিধা ("Clear All Data")।

৫. **Offline Storage & Data Portability:**
   - **LocalStorage Persistence:** ইন্টারনেট সংযোগ ছাড়াই সমস্ত ডেটা ব্রাউজারে সুরক্ষিত রাখা।
   - **JSON Import/Export:** ডেটা ব্যাকআপ নেওয়া (Export) এবং যেকোনো সময় অন্য ডিভাইসে রিস্টোর (Import) করার অপশন।
   - **PWA Capabilities:** `manifest.json` এবং `sw.js` (Service Worker) যুক্ত করা হয়েছে, যার ফলে অ্যাপটি মোবাইল বা পিসির হোমস্ক্রিনে ইনস্টল করা যায়।

---

### 🔹 খ. Backend Sync Server & End-to-End API Integration (`server.js`)
- Node.js এবং Express.js দিয়ে তৈরি হাই-পারফরম্যান্স ব্যাকএন্ড সার্ভার।
- **Crypto Session Tokens:** `crypto.randomBytes(32)` দিয়ে তৈরি নিরাপদ 64-character সেশন টোকেন যা `Authorization: Bearer <token>` হেডার দ্বারা প্রতিটি রিকোয়েস্টে সুরক্ষিত থাকে।
- **User Authentication & Session Management:**
  - `POST /api/auth/register`: নতুন অ্যাকাউন্ট তৈরি ও স্বয়ংক্রিয় সেশন প্রদান।
  - `POST /api/auth/login`: লগইন ভেরিফিকেশন ও সেশন টোকেন ইস্যু।
  - `POST /api/auth/logout`: সার্ভার-সাইড টোকেন ইনভ্যালিডেশন।
  - `401 Unauthorized` হ্যান্ডলিং: মেয়াদোত্তীর্ণ সেশনে স্বয়ংক্রিয় রিডাইরেকশন ও লগইন মডাল ডিসপ্লে।
- **Server-Side Plan Limit Gating (Anti-Spoofing):**
  - ফ্রি প্ল্যানে সর্বোচ্চ ৫টি হ্যাবিট সীমাবদ্ধতা সার্ভার লেভেলে সংরক্ষিত (`POST /api/sync` এ ৬ বা ততোধিক পাঠালে `HTTP 403 Forbidden` / `PLAN_LIMIT_EXCEEDED`)।
  - `POST /api/upgrade`: প্রো বা টিম প্ল্যানে আপগ্রেড করার রিয়েল এন্ডপয়েন্ট।
  - `POST /api/challenges/start`: পেইড চ্যালেঞ্জের জন্য প্রো প্ল্যান ভ্যালিডেশন।
- **Optimistic UI with Instant Rollback:**
  - হ্যাবিট টিক দেওয়া ও যোগ করা ব্যবহারকারীর কাছে তাত্ক্ষণিক অনুভূত হয়।
  - কোনো নেটওয়ার্ক ত্রুটি বা সার্ভার প্রত্যাখ্যান ঘটলে স্টেট স্বয়ংক্রিয়ভাবে আগের অবস্থায় ফিরিয়ে নেওয়া হয় (Rollback) এবং টোস্ট নোটিফিকেশন প্রদর্শন করে।
- **Debounced Weekly Goals:** টাইপিংয়ের সময় সার্ভার ওভারলোড রোধ করতে ৫০০ মিলিসেকেন্ড ডিবউন্স টাইমার সংযুক্ত।
- **Offline-First Sync Queue:** অফলাইন থাকা অবস্থায় ডেটা লোকালস্টোরেজে জমা থাকে এবং ইন্টারনেট সংযোগ ফিরলে (`window.addEventListener('online')`) স্বয়ংক্রিয়ভাবে সার্ভারের সাথে সিঙ্ক সম্পন্ন করে।

- **Production Readiness & Zero-Seed Architecture (Clean Real User Engine):**
   - **Zero Mock Data:** ডেটাবেস (`db.json`) সম্পূর্ণ শূন্য সিড দিয়ে শুরু হয় (`{ "users": {}, "data": {}, "sessions": {} }`)। কোনো ডামি অ্যাকাউন্ট বা হার্ডকোডেড হ্যাবিট নেই।
   - **Cohesive Empty States:** নতুন ইউজারের জন্য সবকটি ট্যাবে (Daily, Weekly, Monthly, AI Coach, Analytics, History) আকর্ষণীয় Ember & Tide এম্পটি স্টেট কার্ড তৈরি করা হয়েছে।
   - **Strict Validation & Anti-XSS:** হ্যাবিট ও টাস্ক ইনপুটে কড়া ফিল্টারিং (২-৬০ অক্ষর, ডুপ্লিকেট চেকিং, কন্ট্রোল ক্যারেক্টার ফিল্টারিং এবং সম্পূর্ণ এইচটিএমএল এসকেপিং)।
   - **Real API Persistence:** UI ১০০% ডায়নামিক এবং ব্যাকএন্ড এপিআই-এর সাথে সরাসরি সিঙ্ক করা।

---

### 🔹 গ. Native Android Application (`habit-tracker-android/`)
- Kotlin ও Android SDK ব্যবহার করে তৈরি অ্যান্ড্রয়েড অ্যাপ।
- **WebView Integration:** `MainActivity.kt`-এর মাধ্যমে `file:///android_asset/index.html` সরাসরি লোড করা হয়েছে।
- DOM Storage, Local Database, JavaScript সাপোর্ট এনাবল করে নেটিভ অভিজ্ঞতা নিশ্চিত করা হয়েছে।

---

### 🔹 ঘ. পূর্ণাঙ্গ প্রজেক্ট ডকুমেন্টেশন (`docs/`)
প্রজেক্ট সংক্রান্ত ৬টি পেশাদার টেকনিক্যাল ডকুমেন্টেশন **Markdown (`.md`)** এবং **Microsoft Word (`.docx`)** ফরম্যাটে তৈরি করা হয়েছে:

1. **`1_PRD_Product_Requirements_Document`:** প্রজেক্টের উদ্দেশ্য, ইউজার পারসোনা ও মূল ফিচারসমূহ।
2. **`2_TRD_Technical_Requirements_Document`:** টেকনিক্যাল আর্কিটেকচার, স্ট্যাক এবং ডেটা মডেল।
3. **`3_App_Document_Flow`:** স্ক্রিন নেভিগেশন, ইউজার জার্নি এবং অপারেশনাল ফ্লোচক্র।
4. **`4_UIUX_Design_Brief`:** কালার প্যালেট, টাইপোগ্রাফি, থিম গাইড ও ডিজাইন কম্পোনেন্ট।
5. **`5_Backend_Schema_Document`:** REST API এন্ডপয়েন্ট, JSON পে-লোড ও সার্ভার ডেটা মডেল।
6. **`6_Implementation_Plan`:** ডেভলপমেন্ট রোডম্যাপ, টেস্টিং এবং ডিপ্লয়মেন্ট গাইড।
7. **`convert_docs.js`:** সবকটি ডকুমেন্টকে স্টাইলিশ HTML/DOCX-এ অটোমেটিক কনভার্ট করার Node.js স্ক্রিপ্ট।

---

## 📁 ৩. প্রজেক্ট ফাইল ও ফোল্ডার স্ট্রাকচার (Project Structure)

```
habit-tracker-complete (3)/
├── README.md                       # মূল ইংরেজি প্রজেক্ট ডকুমেন্টেশন
├── PROJECT_SUMMARY.md              # প্রজেক্টের বিস্তারিত সমাপনী ফাইল (বাংলা)
│
├── habit-tracker-full/             # PWA Web App, Server & Documentation
│   ├── index.html                  # মূল সিঙ্গেল-পেজ PWA অ্যাপ (HTML/CSS/JS)
│   ├── habit_tracker_preview.html  # ব্রাউজারে দ্রুত প্রিভিউ দেখার ফাইল
│   ├── manifest.json               # Web App Manifest
│   ├── sw.js                       # সার্ভিস ওয়ার্কার (Offline Service Worker)
│   ├── server.js                   # Express.js ব্যাকএন্ড সার্ভার
│   ├── package.json                # ব্যাকএন্ডের ডিপেন্ডেন্সি তালিকা
│   ├── convert_docs.js             # ডকুমেন্ট কনভার্সন স্ক্রিপ্ট
│   ├── icon-192.png / icon-512.png # অ্যাপের ব্র্যান্ডিং আইকনসমূহ
│   ├── README.txt / details.txt    # ফিচার ও ডিপ্লয়মেন্ট গাইডলাইন
│   └── docs/                       # ৬টি সম্পূর্ণ টেকনিক্যাল ডকুমেন্ট (.md & .docx)
│
└── habit-tracker-android/          # অ্যান্ড্রয়েড প্রজেক্ট
    ├── app/src/main/
    │   ├── java/com/example/habittracker/MainActivity.kt  # WebView Kotlin অ্যাপ
    │   └── assets/                                         # ওয়েবের সমস্ত এসেট
    └── build.gradle.kts            # অ্যান্ড্রয়েড বিল্ড ফাইল
```

---

## 🚀 ৪. অ্যাপ কিভাবে রান করবেন (How to Run)

### ১. Web App / PWA:
- **সরাসরি ব্রাউজারে রান করতে:** [`habit-tracker-full/index.html`](file:///c:/Users/ASUS/Downloads/habit-tracker-complete%20%283%29/habit-tracker-full/index.html) ফাইলে ডাবল ক্লিক করুন।
- **Netlify-তে বিনামূল্যে হোস্ট করতে:** `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — এই ৫টি ফাইল [netlify.com/drop](https://app.netlify.com/drop) এ আপলোড করুন।
- **Local Backend Server চালাতে:**
  ```bash
  cd habit-tracker-full
  npm install
  npm start
  ```

### ২. Android App:
1. **Android Studio** দিয়ে `habit-tracker-android` ফোল্ডারটি ওপেন করুন।
2. Emulator বা সংযুক্ত অ্যান্ড্রয়েড ফোনে অ্যাপটি **Run** করুন।
