# HabbitTracker — UI/UX Design Brief
**Version:** 1.0  
**Date:** July 30, 2026  
**Author:** Design Team  
**Status:** Approved  

---

## 1. Design Philosophy

HabbitTracker's design is built on three core principles:

1. **Premium Dark-First** — A rich, dark interface that feels sophisticated and reduces eye strain during evening use
2. **Clarity Under Complexity** — Complex data (streaks, analytics, challenges) is presented in simple, scannable formats
3. **Motion as Feedback** — Every user action has a micro-animation that confirms the action and delights the user

### Design Inspiration
- **GitHub's** contribution heatmap for the analytics visualization
- **Linear's** minimal dark UI for the card layouts
- **Duolingo's** gamification approach for streaks and challenges
- **Stripe's** pricing page for the upgrade modal layout

---

## 2. Design System

### 2.1 Color Palette — Default (Dark) Theme

| Token | Hex | Usage |
|-------|-----|-------|
| `--ink` | `#F8FAFC` | Primary text, labels |
| `--paper` | `#0B0F19` | Background |
| `--card` | `rgba(22,29,48,0.7)` | Card backgrounds |
| `--line` | `rgba(255,255,255,0.06)` | Borders, dividers |
| `--muted` | `#64748B` | Secondary text, hints |
| `--track` | `#1E293B` | Progress bar tracks |
| `--accent` | `#10B981` | Primary action (Emerald Green) |
| `--danger` | `#EF4444` | Errors, missed states |
| `--violet` | `#6366F1` | Pro features, auth actions |
| `--gold` | `#F59E0B` | Streaks, achievement badges |

### 2.2 Color Palette — Premium Themes

#### Sakura 🌸
| Token | Value |
|-------|-------|
| `--paper` | `#1a0a1a` |
| `--card` | `rgba(45,15,45,0.75)` |
| `--accent` | `#f472b6` |
| `--violet` | `#e879f9` |
| Background Gradient | `radial-gradient(ellipse at top, #2d1535, #1a0a1a)` |

#### Ocean 🌊
| Token | Value |
|-------|-------|
| `--paper` | `#030d1a` |
| `--card` | `rgba(5,30,60,0.75)` |
| `--accent` | `#38bdf8` |
| `--violet` | `#818cf8` |
| Background Gradient | `radial-gradient(ellipse at top, #0c2340, #030d1a)` |

#### Sunset 🌅
| Token | Value |
|-------|-------|
| `--paper` | `#1c0a00` |
| `--card` | `rgba(50,20,5,0.75)` |
| `--accent` | `#fb923c` |
| `--violet` | `#f43f5e` |
| Background Gradient | `radial-gradient(ellipse at top, #3d1a05, #1c0a00)` |

#### Matrix 💻
| Token | Value |
|-------|-------|
| `--paper` | `#000d00` |
| `--card` | `rgba(0,25,0,0.75)` |
| `--accent` | `#22c55e` |
| `--violet` | `#16a34a` |
| Background Gradient | `radial-gradient(ellipse at top, #001500, #000d00)` |

### 2.3 Pro Gradient
```css
--pro-grad: linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)
```
Used for: Pro badges, pricing CTA buttons, success overlay, premium indicators.

---

## 3. Typography

### 3.1 Font Families

| Font | Source | Usage |
|------|--------|-------|
| Plus Jakarta Sans | Google Fonts | Body text, labels, buttons, headings |
| JetBrains Mono | Google Fonts | Timestamps, percentages, codes, stat values |
| System Fallback | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | Fallback when fonts fail |

### 3.2 Type Scale

| Style | Font | Size | Weight | Use Case |
|-------|------|------|--------|----------|
| App Title | Plus Jakarta Sans | 20px | 800 | "HabbitTracker" in brand |
| Section Heading | Plus Jakarta Sans | 18px | 800 | Modal titles |
| Card Title | Plus Jakarta Sans | 15px | 800 | Pricing card names |
| Body | Plus Jakarta Sans | 14.5px | 600 | Habit names |
| Body Secondary | Plus Jakarta Sans | 13px | 400 | Descriptions |
| Label | JetBrains Mono | 11.5px | 600 | Section headings (uppercase) |
| Badge | JetBrains Mono | 10.5px | 700 | Reminder badges, streak badges |
| Micro | JetBrains Mono | 9px | 600 | Heatmap legend, hints |
| Stat Value | JetBrains Mono | 22px | 700 | Stats dashboard numbers |
| Share Number | Plus Jakarta Sans | 56px | 800 | Share streak count |

---

## 4. Spacing & Layout

### 4.1 Container
- **Max Width:** 700px (centered)
- **Padding:** 24px (top/sides), 100px (bottom for tab clearance)
- **Mobile Padding:** 16px (sides), 100px (bottom)

### 4.2 Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, badge padding |
| sm | 8px | Button padding, row gaps |
| md | 12px | Card gaps, section margins |
| lg | 16px | Card padding, modal padding |
| xl | 20px | Card margin, section margin |
| 2xl | 24px | Top bar margin, large gaps |

### 4.3 Border Radius Scale
| Token | Value | Usage |
|-------|-------|-------|
| sm | 6px | Small badges |
| md | 8px | Input fields, small buttons |
| lg | 10px | Buttons, modal actions |
| xl | 12px | Small cards |
| 2xl | 14px | Day cards, nav buttons |
| 3xl | 16px | Challenge cards, modals |
| 4xl | 18px | Main cards, pricing cards |

---

## 5. Component Specifications

### 5.1 Card Component
```
Background: rgba(22, 29, 48, 0.70)       ← Glassmorphism
Border: 1px solid rgba(255,255,255,0.06)
Border Radius: 18px
Padding: 20px
Shadow: 0 12px 32px rgba(0,0,0,0.25)
Backdrop Filter: blur(16px)
Margin Bottom: 20px
```

### 5.2 Tab Bar
```
Background: rgba(15, 23, 42, 0.60)
Border: 1px solid rgba(255,255,255,0.06)
Border Radius: 14px
Padding: 4px (inner)
Gap between tabs: 4px

Active Tab:
  Background: rgba(255,255,255,0.08)
  Border: 1.5px solid rgba(255,255,255,0.05)
  Shadow: 0 4px 12px rgba(0,0,0,0.15)
  Backdrop Filter: blur(5px)

Inactive Tab:
  Color: #64748B (muted)
  Hover: color = #F8FAFC, bg = rgba(255,255,255,0.03)
```

### 5.3 Checkbox Component
```
Default State:
  Size: 22x22px
  Border: 2px solid #64748B
  Border Radius: 7px
  Background: transparent
  
Hover State:
  Border: 2px solid #F8FAFC
  Transform: scale(1.05)

Completed State:
  Background: linear-gradient(135deg, #10B981, #059669)
  Border: transparent
  Shadow: 0 0 10px rgba(16,185,129,0.45)
  Icon: white checkmark (13x13px)
  
Missed State:
  Border: rgba(255,255,255,0.05)
  Background: rgba(255,255,255,0.02)
  Cursor: not-allowed
  Opacity: 0.30
  
Freemium Lock State:
  Shows 🔒 icon in red-tinted box
```

### 5.4 Donut Chart (SVG)
```
Sizes:
  - Daily progress: 110px, stroke 12px
  - Weekly progress: 90px, stroke 10px
  - Monthly progress: 100px, stroke 11px
  - Day card: 64px, stroke 7px
  - History: 100px, stroke 11px

Colors:
  Track: var(--track) = #1E293B
  Fill: var(--accent) = #10B981
  Label: var(--ink) = #F8FAFC (bold, size = donut*0.22)
  Goal tick: var(--ink) line indicating goal %

Animation:
  stroke-dashoffset transition: 0.3s ease
```

### 5.5 Buttons

#### Primary Action Button
```css
background: linear-gradient(135deg, #10B981, #059669)
color: #fff
border: none
border-radius: 10px
padding: 0 18px
font-weight: 700
font-size: 14px
shadow: 0 4px 12px rgba(16,185,129,0.20)
hover: translateY(-1px), shadow: 0 6px 16px rgba(16,185,129,0.30)
active: translateY(0)
```

#### Pro Upgrade Button
```css
background: linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)
color: #fff
border-radius: 10px
padding: 9px 18px
font-weight: 800
shadow: 0 4px 14px rgba(99,102,241,0.40)
hover: translateY(-1px), shadow larger
```

#### Icon Button (Edit/Delete/Bell)
```css
size: 28x28px
border-radius: 8px
background: transparent
color: #64748B (muted)
hover: bg rgba(255,255,255,0.05), color var(--ink), scale(1.05)
active: scale(0.95)
transition: all 0.15s ease
```

### 5.6 Badge Types

| Badge | Style | Color |
|-------|-------|-------|
| Streak 🔥 | Mono 10.5px, amber bg | #F59E0B |
| Reminder ⏰ | Mono 10.5px, violet bg | #6366F1 |
| Missed | Mono 10px, red bg | #EF4444 |
| Sync: synced | Mono 8px, green bg | #10B981 |
| Sync: pending | Mono 8px, amber bg, pulsing | #F59E0B |
| Sync: offline | Mono 8px, red bg | #EF4444 |
| Pro | Gradient bg | #6366F1 → #EC4899 |
| Days | Mono 10px, muted | #64748B |

### 5.7 Input Fields
```css
border: 1px solid rgba(255,255,255,0.06)
border-radius: 10px
padding: 10px 12px
font-size: 14px
background: rgba(15, 23, 42, 0.40)
color: #F8FAFC
placeholder: #64748B

focus:
  border-color: var(--accent)
  box-shadow: 0 0 0 2px rgba(16,185,129,0.20)
  background: rgba(15, 23, 42, 0.60)
```

### 5.8 Toast Notification
```css
position: fixed
top: 20px
left: 50% (centered)
max-width: 88vw
background: rgba(15, 23, 42, 0.92)
backdrop-filter: blur(10px)
border: 1px solid rgba(255,255,255,0.10)
border-radius: 14px
padding: 14px 24px
font-size: 14px
font-weight: 700
shadow: 0 12px 40px rgba(0,0,0,0.50)
animation: toastIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)
duration: 6 seconds (default)
exit: opacity fade 0.3s
```

---

## 6. Animations & Motion

### 6.1 Animation Inventory

| Animation | Element | Type | Duration | Easing |
|-----------|---------|------|----------|--------|
| Confetti | Canvas particles | Gravity simulation | ~3-5s | Physics |
| Toast entrance | Toast div | Slide up + fade | 0.35s | Spring (0.175, 0.885, 0.32, 1.275) |
| Modal open | Overlay + card | Fade + slide up | 0.25s | ease |
| Pro badge pop | Success circle | Scale from 0 | 0.5s | Spring |
| Success overlay | Div | Fade in | 0.3s | ease |
| Donut progress | SVG circle | dash offset | 0.3s | ease |
| Habit toggle | Checkbox | Scale 1→1.05 | 0.15s | ease |
| Card hover | Card | translateY(-2px) | 0.2s | ease |
| Tab active | Tab | background change | 0.2s | cubic-bezier(0.4,0,0.2,1) |
| Sync badge pulse | Badge | opacity 0.6→1 | 1.2s | infinite alternate |

### 6.2 Confetti Specification
```
Particle count: 150
Origin: bottom center (canvas.width/2, canvas.height+20)
Velocity X: random ±7.5 (horizontal spread)
Velocity Y: random -10 to -30 (upward burst)
Gravity: +0.5 per frame
Air resistance: ×0.98 per frame on X
Rotation: random, increments by rotSpeed per frame
Colors: #10B981, #6366F1, #3B82F6, #EF4444, #F59E0B, #EC4899
Shape: Rectangle (r×r*2, r×r*1.5)
```

---

## 7. Screen Layouts

### 7.1 Daily Tab Layout
```
┌──────────────────────────────────────────┐
│  TOPBAR                                  │
│  [🔥 HabbitTracker ⭐PRO]    [synced] [rafi] │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│  TAB BAR                                 │
│  [Daily] [Weekly] [Monthly] [History]    │
│  [🤖] [🏆] [📊] [💎]                   │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│  STATS BAR (today only)                  │
│  🔥 5   |   14   |   87                 │
│  Best   | Week   | All Time             │
│  ████░░░░ (7-day sparkline)              │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐  ← Only for free users
│  💎 UPGRADE BANNER                       │
│  "Upgrade to Pro — ৳199/mo"             │
│  [Upgrade Now →]                         │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│  CARD: TODAY (nav ← Jul 30 →)           │
│         ┌───────┐                        │
│         │  72%  │ ← Donut chart          │
│         └───────┘                        │
│  Completed 13  |  Total 18               │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│  CARD: HABITS                            │
│  ☐ Cold shower  ⏰07:00  🔥5            │
│  ✓ Gym          ⏰08:00  (done)          │
│  ☐ Read 10 pages                         │
│  ☐ Budget tracking                       │
│  ☐ Studying                              │
│  🔒 Morning run  [Unlock Pro]  ← free   │
│                                          │
│  [__________ Add new habit __] [+ Add]   │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│  CARD: TODAY'S TASKS                     │
│  ☐ Review notes                          │
│  ✓ Buy groceries                         │
│  [__________ Add new task ____] [+ Add]  │
└──────────────────────────────────────────┘
```

### 7.2 Pricing Modal Layout
```
┌───────────────────────────────────────────────────────┐
│                        [✕]                            │
│           💎                                           │
│    Upgrade to HabbitTracker                                 │
│   Unlock AI coaching, unlimited habits...              │
│                                                        │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Free   │  │⭐ Pro POPULAR│  │      Team       │  │
│  │   ৳0   │  │ ৳199/month  │  │ ৳999/team/mo   │  │
│  │        │  │              │  │                 │  │
│  │✓ 5 hab │  │✓ Unlimited   │  │✓ Everything Pro│  │
│  │✓ Basic │  │✓ AI Coach    │  │✓ 10 members    │  │
│  │✗ AI    │  │✓ Challenges  │  │✓ Team dashboard│  │
│  │✗ Chall │  │✓ Heatmap     │  │✓ Custom chall  │  │
│  │✗ Heatm │  │✓ Themes      │  │✓ API access    │  │
│  │        │  │✓ Share/Refer │  │                 │  │
│  │[Current│  │[Start Trial] │  │[Contact Sales]  │  │
│  └─────────┘  └──────────────┘  └─────────────────┘  │
│              7 days free, cancel anytime               │
└───────────────────────────────────────────────────────┘
```

### 7.3 Analytics Heatmap Layout
```
┌──────────────────────────────────────────────────────┐
│  CARD: Habit Heatmap — Last 52 Weeks                 │
│                                                       │
│  Jan  Feb  Mar  Apr  May  Jun  Jul                   │
│  ░░░░ ░░▒▒ ░▒▒▒ ▒▒▓▓ ▒▓▓▓ ▓▓▓▓ ▓▓▓▓                │
│  ░░░░ ░░▒▒ ░▒▒▒ ▒▒▓▓ ▒▓▓▓ ▓▓▓▓ ▓▓▓▓                │
│  (52 columns × 7 rows of colored cells)              │
│                                                       │
│  Less ░▒▓█ More                                      │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│  CARD: Performance Insights                           │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │ Best Day     │  │ Needs Work   │                  │
│  │ 🏆 Sunday    │  │ ⚠️ Friday    │                  │
│  │ Avg 84%      │  │ Avg 42%      │                  │
│  └──────────────┘  └──────────────┘                  │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │ Trend        │  │ Total Done   │                  │
│  │ 📈 Improving │  │ 247          │                  │
│  │ 78% vs 65%   │  │ All-time     │                  │
│  └──────────────┘  └──────────────┘                  │
│                                                       │
│  [Mon][Tue][Wed][Thu][Fri][Sat][Sun]  ← Day bars     │
└──────────────────────────────────────────────────────┘
```

---

## 8. Responsive Design

### 8.1 Breakpoints
| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Desktop | > 600px | Full layout, max-width 700px centered |
| Mobile | ≤ 600px | Reduced padding, stacked pricing cards |
| Small Mobile | ≤ 380px | 2-column stats, 3-column theme grid |

### 8.2 Mobile-Specific Adjustments
```css
@media (max-width: 600px) {
  .app { padding: 16px 12px 100px; }
  .brand h1 { font-size: 16px; }
  .tabs .tab { font-size: 11px; padding: 8px 3px; }
  .card { padding: 16px 14px; border-radius: 14px; }
  .pricing-cards { grid-template-columns: 1fr; }
  .challenge-grid { grid-template-columns: 1fr 1fr; }
  .share-actions { flex-direction: column; }
}

@media (max-width: 380px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .theme-grid { grid-template-columns: repeat(3, 1fr); }
  .challenge-grid { grid-template-columns: 1fr; }
}
```

---

## 9. Accessibility Guidelines

### 9.1 ARIA Roles
| Element | ARIA Role/Attribute |
|---------|-------------------|
| Habit checkbox | `role="checkbox"`, `aria-checked` |
| Tab bar | `role="tablist"`, `aria-label="Navigation"` |
| Each tab | `role="tab"`, `aria-selected` |
| Main content | `role="main"`, `id="main-content"` |
| Toast | `role="alert"`, `aria-live="assertive"` |
| Auth modal | `role="dialog"`, `aria-hidden` |
| Donut chart | `role="img"`, `aria-label="{pct}% completed"` |
| Habit row | `role="listitem"` |
| History card | `role="button"`, `aria-pressed` |

### 9.2 Color Contrast
| Foreground | Background | Ratio | Pass |
|------------|------------|-------|------|
| `#F8FAFC` (ink) | `#0B0F19` (paper) | 15.2:1 | ✅ AAA |
| `#10B981` (accent) | `#0B0F19` | 5.8:1 | ✅ AA |
| `#64748B` (muted) | `#0B0F19` | 4.6:1 | ✅ AA |
| `#F59E0B` (gold) | `#0B0F19` | 7.2:1 | ✅ AAA |

### 9.3 Keyboard Navigation
- All buttons and interactive elements are focusable
- Day navigation supports `Enter` and `Space` keys
- Form inputs support `Enter` key to submit
- Tab order follows visual layout

---

## 10. Design Deliverables Checklist

| Deliverable | Status |
|-------------|--------|
| ✅ Color token system (CSS variables) | Complete |
| ✅ Typography scale defined | Complete |
| ✅ 5 premium themes designed | Complete |
| ✅ All card component styles | Complete |
| ✅ Pricing modal layout | Complete |
| ✅ AI Coach panel | Complete |
| ✅ Challenge store cards | Complete |
| ✅ Heatmap visualization | Complete |
| ✅ Share streak card | Complete |
| ✅ Theme switcher UI | Complete |
| ✅ Referral program UI | Complete |
| ✅ Toast notification system | Complete |
| ✅ Success/Pro upgrade overlay | Complete |
| ✅ Confetti animation | Complete |
| ✅ Responsive layouts (mobile) | Complete |
| ✅ Accessibility attributes | Complete |
| ⬜ Figma design file | Pending |
| ⬜ Icon library specification | Pending |
| ⬜ Dark/light mode toggle | Phase 2 |
