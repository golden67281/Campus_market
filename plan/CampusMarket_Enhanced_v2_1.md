# 🎓 Campus Market — Complete Product Specification v2.0

> A hyperlocal peer-to-peer marketplace built exclusively for college and university students.
> Think OLX meets Facebook Marketplace, but smarter, safer, and campus-focused.

---

## 📋 Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Audience & User Personas](#2-target-audience--user-personas)
3. [Competitive Analysis](#3-competitive-analysis)
4. [User Types & Permissions](#4-user-types--permissions)
5. [Authentication System](#5-authentication-system)
6. [Navigation & Global UI](#6-navigation--global-ui)
7. [Landing Page (Guest View)](#7-landing-page-guest-view)
8. [Home Feed (Logged-In)](#8-home-feed-logged-in)
9. [Product Detail Page](#9-product-detail-page)
10. [Express Interest / Purchase Flow](#10-express-interest--purchase-flow)
11. [Create & Manage Listings](#11-create--manage-listings)
12. [My Profile & Dashboard](#12-my-profile--dashboard)
13. [Search & Discovery](#13-search--discovery)
14. [Notifications System](#14-notifications-system)
15. [Safety & Trust System](#15-safety--trust-system)
16. [Error States & Edge Cases](#16-error-states--edge-cases)
17. [API Design (REST Endpoints)](#17-api-design-rest-endpoints)
18. [Data Models (JSON Schemas)](#18-data-models-json-schemas)
19. [Tech Stack](#19-tech-stack)
20. [Folder & File Structure](#20-folder--file-structure)
21. [UI/UX Design Guidelines](#21-uiux-design-guidelines)
22. [Business Logic & Rules](#22-business-logic--rules)
23. [Monetization Strategy](#23-monetization-strategy)
24. [Future Scope (V2+)](#24-future-scope-v2)
25. [Development Milestones](#25-development-milestones)

---

## 1. Product Overview

**Campus Market** is a student-only online peer-to-peer marketplace where verified college and university students can list, discover, buy, and sell second-hand or new products within their campus community.

### The Problem It Solves

Students constantly need affordable textbooks, lab equipment, electronics, and furniture — items that other students on the same campus already own and no longer need. General platforms like OLX or Facebook Marketplace are noisy, unsafe, and not student-focused. Campus Market bridges this gap with:

- **Verified community** — only real students, no unknown strangers
- **Hyperlocal discovery** — see your campus first, then nearby
- **No delivery hassle** — meet in the college canteen or library
- **Student-budget pricing** — everyone understands the student struggle

### Core Value Propositions

| For Buyers | For Sellers |
|------------|-------------|
| Trust — buy from verified students | Reach your exact target audience |
| Find campus-specific items (textbooks, lab coats) | Sell fast — buyer is nearby |
| Save money on everything | Zero listing fees (V1) |
| No shipping cost or waiting | Simple 4-step listing form |

### Product Principles

1. **Safety first** — every decision prioritizes student safety
2. **Simplicity** — a first-year student should understand it in 60 seconds
3. **Local by default** — your campus is always shown first
4. **No dark patterns** — no fake urgency, no spam, no hidden fees

---

## 2. Target Audience & User Personas

### Primary Audience

Indian college and university students aged 17–26, studying in cities like Ahmedabad, Pune, Bangalore, Delhi, Mumbai, Hyderabad, Chennai.

---

### Persona 1 — The Budget Buyer

**Name:** Priya, 19, B.Tech 1st year, Ahmedabad  
**Goal:** Find affordable engineering textbooks and a second-hand calculator  
**Pain point:** New books cost ₹800–1500 each. She needs 6 books.  
**Behavior:** Browses in the evening, filters by college and category, wants to meet the seller in college.  
**Expectation:** Quick contact, trustworthy seller, product as described.

---

### Persona 2 — The Graduating Seller

**Name:** Arjun, 22, final year MBA, Pune  
**Goal:** Sell his entire hostel room setup before going home — furniture, books, appliances  
**Pain point:** He's leaving in 3 weeks. No time for shipping. OLX buyers never show up.  
**Behavior:** Lists multiple products at once, wants serious buyers from his college only.  
**Expectation:** Fast response, buyer meets on campus, no negotiation drama.

---

### Persona 3 — The Side-Hustle Seller

**Name:** Rahul, 20, BCA 2nd year, Bangalore  
**Goal:** Buys discounted products online and resells on campus at a small profit  
**Pain point:** Needs a platform where his college community will actually see and trust his listings.  
**Behavior:** Lists frequently, responds fast, maintains good ratings.  
**Expectation:** Easy listing management, visibility, buyer trust signals.

---

## 3. Competitive Analysis

| Feature | Campus Market | OLX | Facebook Marketplace | NoBroker |
|---------|--------------|-----|----------------------|----------|
| Student verification | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Campus-first discovery | ✅ Yes | ❌ No | ❌ No | ❌ No |
| No delivery needed | ✅ Yes | Partial | Partial | N/A |
| Free to list | ✅ Yes | ✅ Yes | ✅ Yes | Partial |
| In-app safety tips | ✅ Yes | ❌ No | Partial | ❌ No |
| College-specific search | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Targeted student categories | ✅ Yes | ❌ No | ❌ No | ❌ No |

**Our edge:** No other platform targets college students specifically with trust, verification, and hyperlocal campus discovery together.

---

## 4. User Types & Permissions

| Permission | Guest | Registered User | Admin |
|-----------|-------|-----------------|-------|
| Browse landing page | ✅ | ✅ | ✅ |
| View product cards | ✅ | ✅ | ✅ |
| View product detail | ❌ (prompt to login) | ✅ | ✅ |
| Search products | ✅ (limited) | ✅ | ✅ |
| Contact seller | ❌ | ✅ | ✅ |
| Save to wishlist | ❌ | ✅ | ✅ |
| Create listing | ❌ | ✅ | ✅ |
| Edit own listing | ❌ | ✅ (own only) | ✅ |
| Delete own listing | ❌ | ✅ (own only) | ✅ |
| Report listing | ❌ | ✅ | ✅ |
| View notifications | ❌ | ✅ | ✅ |
| Ban users | ❌ | ❌ | ✅ |
| Remove any listing | ❌ | ❌ | ✅ |
| View reports | ❌ | ❌ | ✅ |

---

## 5. Authentication System

### 5.1 Sign Up Flow

**Step 1 — Mobile Verification**
- User enters 10-digit mobile number
- OTP sent via SMS (6-digit, expires in 5 minutes)
- On verify → proceed to Step 2

**Step 2 — Personal Details**

| Field | Type | Validation |
|-------|------|------------|
| Full Name | Text | 2–60 chars, no numbers |
| Username | Text | 4–20 chars, alphanumeric + underscore, unique |
| Profile Photo | Image upload | Optional; JPEG/PNG, max 2MB |

**Step 3 — College Details**

| Field | Type | Notes |
|-------|------|-------|
| College/University Name | Searchable dropdown | Seeded with top 500 Indian colleges |
| College City | Auto-filled from selection | Editable |
| College Email | Email input | Optional; ".edu", ".ac.in" domains → grants Verified badge |
| Current Year / Semester | Dropdown | 1st year to Final year + Alumni |
| Stream / Department | Text | E.g. "Computer Engineering", "MBA Finance" |

**Step 4 — Address & Password**

| Field | Type | Notes |
|-------|------|-------|
| Area / Locality | Text + GPS auto-detect | E.g. "Navrangpura, Ahmedabad" |
| Password | Password field | Min 8 chars, 1 uppercase, 1 number |
| Confirm Password | Password field | Must match |

**Post-Signup Actions:**
- Welcome notification sent
- Profile badge = "Unverified" (gray) until college email confirmed
- If college email confirmed → badge = "Verified Student" (blue tick)
- User is redirected to Home Feed, location auto-set

---

### 5.2 Login Flow

**Options:**
- Mobile Number + Password
- Email + Password

**Forgot Password:**
1. Enter registered mobile number
2. Receive OTP
3. Enter OTP → set new password
4. Redirect to login

**Session Management:**
- JWT token issued on successful login
- Token stored in `localStorage`
- Token expiry: 7 days
- On expiry → auto-logout + redirect to login with message "Session expired. Please login again."

**Security Rules:**
- Max 5 failed login attempts → account locked for 15 minutes
- Lock message shown with countdown timer
- Password is bcrypt-hashed before storage (never stored as plain text)

---

### 5.3 College Email Verification (Optional but Recommended)

1. User goes to Profile → "Verify College Email"
2. Enters college email address
3. System checks domain against allowed list (.edu, .ac.in, and manually approved domains)
4. Verification email sent with a unique link (expires in 24 hours)
5. On click → badge updated to "Verified Student" in blue

---

## 6. Navigation & Global UI

### 6.1 Navbar (Desktop)

```
[ 🎓 Campus Market ]   [ 📍 Ahmedabad ▼ ]   [ 🔍 Search products...        ]   [ 🔔 ] [ ❤️ ] [ + Sell ] [ Avatar ▼ ]
```

| Element | Logged-Out State | Logged-In State |
|---------|-----------------|-----------------|
| Logo | Visible | Visible |
| Location | City shown, clickable to change | Same |
| Search | Active | Active |
| Bell 🔔 | Hidden | Visible with badge count |
| Heart ❤️ | Hidden | Visible |
| Sell button | "Login to Sell" → redirect | "+ Sell" → Create Listing |
| Right end | "Login / Sign Up" buttons | Avatar with dropdown |

**Avatar Dropdown (Logged-In):**
- 👤 My Profile
- 📦 My Listings
- 🛒 My Interests
- ❤️ Wishlist
- ⚙️ Settings
- 🚪 Logout

---

### 6.2 Navbar (Mobile)

- Logo left, hamburger menu right
- Bottom tab bar (fixed):
  - 🏠 Home | 🔍 Search | ➕ Sell | 🔔 Alerts | 👤 Profile

---

### 6.3 Location Selector (Modal)

When user clicks location:
- Shows current detected location
- "Use my current location" button (GPS)
- Manual search: type city or college name
- Recently used locations (stored in localStorage)

---

### 6.4 Toast Notifications (In-App)

Short feedback messages shown at the top or bottom of the screen:

| Action | Toast Message |
|--------|--------------|
| Listing posted | "✅ Your listing is live!" |
| Saved to wishlist | "❤️ Added to wishlist" |
| Interest sent to seller | "📩 Seller has been notified" |
| Listing deleted | "🗑️ Listing removed" |
| Profile updated | "✅ Profile saved" |
| Error | "❌ Something went wrong. Try again." |

---

## 7. Landing Page (Guest View)

The public-facing marketing page that convinces a guest to sign up.

### 7.1 Hero Section

- Large headline: **"Your Campus. Your Marketplace."**
- Subheadline: "Buy and sell anything with verified students at your college."
- Two CTA buttons: **"Start Selling"** (primary) and **"Browse Products"** (secondary)
- Animated background showing product cards floating in
- Location bar: "📍 Detecting your city..." → auto-detect on load

### 7.2 Live Stats Bar

A thin bar showing real-time (or seeded) numbers to build social proof:

```
🎓 120+ Colleges  |  📦 3,400+ Listings  |  👥 8,200+ Students  |  🏙️ 15+ Cities
```

### 7.3 Category Strip

Horizontal scrollable row of category icons:

```
📚 Books   💻 Electronics   🪑 Furniture   👗 Clothing   🎸 Instruments
🏋️ Sports  🍳 Kitchen       🧪 Lab Items   📐 Stationery  📦 Other
```

Each category card is clickable → goes to search results filtered by that category (prompts login if not authenticated).

### 7.4 Featured Products Section

A grid of 6–8 product cards (auto-selected: most viewed or most recently listed).
Cards are blurred or partially hidden with a "Login to view" overlay to drive sign-up.

### 7.5 How It Works Section

Three steps with icons:

```
1. 🎓 Sign Up Free         2. 📸 List or Browse         3. 🤝 Meet & Deal
   Verify your college        Post in 2 minutes or          Contact the seller,
   email and join your        browse 1000+ listings          meet on campus, done.
   campus community.          near your college.
```

### 7.6 Trust Section

```
✅ Verified Students Only       🛡️ Safe Campus Meetings
📍 Hyperlocal Discovery         💸 Student-Friendly Prices
```

### 7.7 Testimonials (Seeded)

3 student testimonials with photo, name, college, quote.

### 7.8 Footer

```
About Us | How It Works | Safety Tips | Contact Us | Report a Problem
Terms & Conditions | Privacy Policy
© 2025 Campus Market. Made with ❤️ for Indian students.
Social: Instagram | Twitter | LinkedIn
```

---

## 8. Home Feed (Logged-In)

The core experience — a personalized, location-sorted product discovery page.

### 8.1 Location-Based Discovery Algorithm

Products are ranked and displayed using this priority order:

```
PRIORITY 1 (shown first):
  → Products from user's exact college

PRIORITY 2:
  → Products from other colleges in the same city

PRIORITY 3:
  → Products from colleges within 25 km radius
    (using Haversine distance formula on lat/lng)

PRIORITY 4 (shown last):
  → All other products, sorted by newest first
```

**Haversine formula** (used in backend/utils/distance.js):
```javascript
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

### 8.2 Feed Layout

- Desktop: 4-column product card grid
- Tablet: 2-column grid
- Mobile: 2-column grid (compact cards)

**Section Headers in Feed:**
```
── From IIT Gandhinagar (your college) ──────────
[ card ] [ card ] [ card ] [ card ]

── From Ahmedabad ───────────────────────────────
[ card ] [ card ] [ card ] [ card ]

── More listings ────────────────────────────────
[ card ] [ card ] [ card ] [ card ]
```

### 8.3 Product Card (Mini View)

```
┌────────────────────────┐
│  [ Product Image ]     │     ← 4:3 ratio, object-fit: cover
│                    ❤️  │     ← Wishlist toggle (top-right)
├────────────────────────┤
│ Engineering Drawing Set│     ← Title, truncated at 2 lines
│ ₹ 250  [Negotiable]   │     ← Price + negotiable badge
│ 📍 IIT Gandhinagar     │     ← College/location
│ [Like New]   2 hrs ago │     ← Condition badge + time
└────────────────────────┘
```

**Card Interaction States:**
- Default: normal shadow
- Hover: slight elevation + border highlight
- Wishlist heart: gray (not saved) → red (saved), animated
- Click anywhere → navigates to Product Detail Page

### 8.4 Filters & Sorting Panel

A sidebar (desktop) or bottom sheet (mobile):

**Filter Options:**

| Filter | Options |
|--------|---------|
| Category | All / Books / Electronics / Furniture / Clothing / Instruments / Sports / Kitchen / Lab Items / Other |
| Condition | Any / New / Like New / Good / Fair |
| Price Range | Slider: ₹0 – ₹50,000 |
| Distance | Same campus / Same city / Within 50 km / All India |
| Posted Within | Any time / Today / This week / This month |

**Sort Options:**
- Newest first (default)
- Price: Low to High
- Price: High to Low
- Most Viewed
- Closest to me

**Active Filters UI:**
Shown as removable chips below the search bar:
`[Electronics ×]  [₹0–₹5,000 ×]  [Like New ×]  [Clear All]`

---

## 9. Product Detail Page

The full product view, inspired by Amazon and Flipkart.

### 9.1 Page Layout (Desktop)

```
[ ← Back ]

LEFT COLUMN (55%)              RIGHT COLUMN (45%)
┌─────────────────────┐        ┌──────────────────────────┐
│  [ Main Image ]     │        │  Engineering Drawing Set │  ← Title
│                     │        │  ₹ 250   [Negotiable]    │  ← Price
├─────────────────────┤        │  ⭐ Condition: Like New   │
│ [img][img][img][img]│        │  📁 Category: Stationery │
└─────────────────────┘        │  📍 IIT Gandhinagar      │
                                │  🕐 Posted 2 hours ago   │
                                │  👁 34 views             │
                                │─────────────────────────│
                                │  SELLER CARD             │
                                │  [Avatar] Aarav Shah ✅  │
                                │  IIT Gandhinagar         │
                                │  Member since Jan 2025   │
                                │  [View other listings]   │
                                │─────────────────────────│
                                │  [💛 Save to Wishlist]  │
                                │  [💬 Contact Seller] ←CTA│
                                │  [🚩 Report Listing]    │
                                └──────────────────────────┘

FULL WIDTH BELOW:
┌───────────────────────────────────────────────────────┐
│  📝 Description                                       │
│  Barely used, all instruments intact. Purchased in    │
│  August 2024, used for only one semester. Includes:   │
│  compass set, drafter, scale, mini drafter.           │
├───────────────────────────────────────────────────────┤
│  🏷️ Tags: drawing, engineering, first year, compass  │
├───────────────────────────────────────────────────────┤
│  ⚠️ Safety Tip: Always meet in a public campus space. │
│  Never share bank details or pay in advance.          │
└───────────────────────────────────────────────────────┘

BELOW THAT:
┌───────────────────────────────────────────────────────┐
│  More from Aarav Shah (seller's other listings)       │
│  [ card ] [ card ] [ card ]                           │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│  Similar products near you                            │
│  [ card ] [ card ] [ card ] [ card ]                  │
└───────────────────────────────────────────────────────┘
```

### 9.2 Image Gallery Behavior

- Primary image: large, clickable to open full-screen lightbox
- Thumbnail strip: up to 6 images, click to swap primary
- If only 1 image: no thumbnail strip shown
- If no image uploaded: placeholder with category icon shown
- On mobile: horizontal swipe carousel

### 9.3 Seller Card States

| Seller Status | Badge Shown |
|--------------|-------------|
| Unverified | No badge |
| College email verified | ✅ "Verified Student" (blue) |
| High activity (5+ completed deals) | ⭐ "Trusted Seller" (gold) — future |
| Flagged by admin | ⚠️ "Under Review" (orange) |

### 9.4 Listing Status Banner

Shown at top of card when applicable:

| Status | Banner |
|--------|--------|
| Sold | 🔴 "This item has been sold" (full-page overlay, greyed out) |
| Deleted | Redirect to 404 page |
| Under review | 🟡 "This listing is under review by our team" |

### 9.5 Report Listing Flow

Clicking "🚩 Report Listing" opens a modal:

**Report Reasons (radio buttons):**
- Inappropriate content
- Item is already sold but listing is active
- Spam or misleading listing
- Fake or counterfeit item
- Wrong category
- Other (with text field)

After submitting: "Thank you. Our team will review this within 24 hours."

---

## 10. Express Interest / Purchase Flow

> Campus Market is a P2P platform — there is no payment gateway in V1. "Buying" means expressing interest and coordinating directly with the seller.

### 10.1 Flow Steps

```
Product Detail Page
      ↓
[💬 Contact Seller] button clicked
      ↓
  ┌─ User logged in? ─┐
  │ No → redirect to login │
  │ Yes → continue         │
  └────────────────────────┘
      ↓
Interest Confirmation Page (Step 1)
      ↓
Safety Checklist (Step 2)
      ↓
Seller Contact Revealed (Step 3)
      ↓
Seller receives notification
```

### 10.2 Step 1 — Interest Confirmation Page

**Layout:**
```
┌──────────────────────────────────────────┐
│  You're about to contact the seller of:  │
│  [ Product Image ]  Engineering Drawing  │
│                     ₹ 250               │
│                                          │
│  Your contact info (shared with seller): │
│  Name:  [ Priya Sharma          ]        │
│  Phone: [ 9876543210            ]        │
│  Area:  [ Navrangpura, Ahmedabad]        │
│                                          │
│  Message to seller (optional):           │
│  [ Is this still available?       ]      │
│                                          │
│         [ Send Interest → ]              │
└──────────────────────────────────────────┘
```

Fields are pre-filled from user profile and editable.

### 10.3 Step 2 — Safety Checklist (Modal)

Before revealing seller contact, user must check all boxes:

```
☐  I will meet the seller in a public place on campus
☐  I will not share my bank account details
☐  I will inspect the product before paying
☐  I understand Campus Market doesn't guarantee transactions
☐  I will report suspicious behavior

[ Agree & See Contact Details ]
```

### 10.4 Step 3 — Seller Contact Revealed

```
┌──────────────────────────────────────────┐
│  ✅ Seller has been notified!             │
│                                          │
│  SELLER CONTACT                          │
│  [Avatar]  Aarav Shah  ✅               │
│  IIT Gandhinagar                         │
│                                          │
│  📞 Phone: 98765 43210                   │
│  💬 WhatsApp: [Open in WhatsApp →]       │
│  📍 Preferred meeting: College Canteen   │
│                                          │
│  ⚠️ Never pay before inspecting the item │
└──────────────────────────────────────────┘
```

**Backend action when interest is sent:**
- New record created in `interests.json`
- Seller receives in-app notification
- Interest count on product is incremented
- Seller's contact is now accessible to this buyer (stored per pair)

### 10.5 Business Rules for Contact Reveal

- A buyer can only reveal contact for the same listing once
- If the buyer already revealed contact, Step 1–2 are skipped and contact is shown directly
- Seller can see a list of all buyers who expressed interest in "My Listings → Interested Buyers"
- A buyer cannot express interest in their own listing

---

## 11. Create & Manage Listings

### 11.1 Create Listing — 4-Step Form

**Progress indicator at top:** `Step 1 of 4 → Step 2 of 4 → ...`
Data is saved as a draft after each step (saved to `drafts.json`).

---

**Step 1 — Basic Info**

| Field | Type | Validation |
|-------|------|------------|
| Product Name | Text | 5–80 chars, required |
| Category | Dropdown | Required |
| Sub-category | Dropdown (context-aware) | Optional |
| Condition | Radio buttons: New / Like New / Good / Fair | Required |
| Price (₹) | Number input | 1–99,999; required |
| Mark as Negotiable | Toggle switch | Optional |
| Mark as Free | Toggle (sets price to 0) | Optional |

**Sub-category examples by Category:**
- Books → Textbooks / Notes / Novels / Exam Guides
- Electronics → Laptop / Phone / Tablet / Headphones / Camera / Other
- Furniture → Chair / Table / Bed / Wardrobe / Other

---

**Step 2 — Photos & Description**

| Field | Type | Notes |
|-------|------|-------|
| Photos | Image upload | Up to 6 images; JPEG/PNG; max 5MB each; first = thumbnail |
| Description | Textarea | 20–1000 chars; required |
| Tags | Tag input (chips) | Up to 10 tags; e.g. "Dell", "i5", "4GB RAM" |

Photo upload UX:
- Drag-and-drop zone + "Browse" button
- Thumbnail previews with reorder (drag) and delete (×) options
- First image marked with "Cover" badge
- Progress bar per image during upload

---

**Step 3 — Location & Contact**

| Field | Type | Notes |
|-------|------|-------|
| Location | Text + GPS | Auto-filled from profile; editable |
| Preferred Meeting Spot | Text | Optional; e.g. "College canteen, near main gate" |
| Show WhatsApp | Toggle | Shows WhatsApp button on contact reveal page |
| WhatsApp Number | Number | Pre-filled from profile; editable; only shown if toggle ON |

---

**Step 4 — Review & Post**

- Full preview of the listing as it will appear to buyers
- All details shown: images, title, price, condition, description, tags, location
- "Edit" links back to each step
- "Post Listing" button → submits to backend
- After posting → redirect to the live product detail page with confetti animation + toast "✅ Your listing is live!"

---

### 11.2 Listing Status States

| Status | Description | User Action Available |
|--------|------------|----------------------|
| `draft` | Saved but not posted | Continue editing, discard |
| `active` | Live and visible to all | Edit, mark as sold, delete |
| `sold` | Marked sold by seller | Reactivate (unmark), delete |
| `deleted` | Removed by seller | None (soft delete, not shown) |
| `flagged` | Reported; under admin review | Cannot edit until reviewed |
| `removed` | Removed by admin | Cannot reactivate |

---

### 11.3 My Listings Page

**Tabs:**
- Active (n)
- Sold (n)
- Drafts (n)

**Each listing card shows:**
- Thumbnail, title, price, status badge
- Views count, wishlist saves count, interest count ("3 buyers contacted you")
- Action buttons: Edit | Mark as Sold | Delete

**Interested Buyers (per listing):**
- Expandable section per listing
- List of buyers with name, college, time of interest, message
- Buyer phone shown (they already have seller's contact)

---

### 11.4 Edit Listing Rules

- Only the listing owner can edit
- Sold listings cannot be edited, only reactivated or deleted
- Flagged listings cannot be edited until admin clears the flag
- Price changes: allowed, no restriction
- Photo changes: can add or remove (must always have at least 1 photo)

---

## 12. My Profile & Dashboard

### 12.1 Profile Page Layout

```
┌──────────────────────────────────────────────────────┐
│  [Avatar]  Aarav Shah                     [Edit ✏️] │
│            @aaravshah                               │
│            ✅ Verified Student                       │
│            🎓 IIT Gandhinagar · Final Year          │
│            📍 Ahmedabad                             │
│            📅 Member since January 2025              │
├──────────────────────────────────────────────────────┤
│  📦 12 listings   👁 340 views   🤝 8 deals done   │
└──────────────────────────────────────────────────────┘
```

### 12.2 Profile Tabs

**Overview Tab:**
- Recent activity
- Active listings preview (3 cards)
- Recent interests expressed

**My Listings Tab:**
- Full listing management (see Section 11.3)

**My Interests Tab (Purchases):**
- Products the user expressed interest in
- Status: "Pending" / "Connected" / "Completed"
- Seller contact accessible here even after navigating away

**Wishlist Tab:**
- Saved products grid
- Remove button per card
- If product is sold → greyed out with "Sold" badge, still removable

**Notifications Tab:**
- Full notification history (see Section 14)
- Mark all as read option

### 12.3 Edit Profile

Editable fields:
- Profile photo
- Full name
- Username
- College (with note: "Changing college resets your Verified badge")
- Year/Semester
- Department/Stream
- Area/Locality
- WhatsApp number
- Password (separate "Change Password" section)

**College Email Verification section:**
- "Your email: not verified" → button "Verify Now"
- "Your email: verified ✅" → shows verified email

### 12.4 Settings Page

| Setting | Options |
|---------|---------|
| Notification preferences | All on / Only important / Off |
| WhatsApp number visibility | Show to interested buyers / Hide |
| Profile visibility | All users / Same college only |
| Account actions | Deactivate account, Delete account |

---

## 13. Search & Discovery

### 13.1 Search Bar Behavior

- Available on all pages via navbar
- As user types → autocomplete dropdown appears with:
  - Product name suggestions
  - Category matches
  - College name matches
  - Recent searches (stored in localStorage)
- Press Enter or click suggestion → goes to Search Results page

### 13.2 Search Results Page

**Layout:**
- Search query shown: `Results for "laptop"`
- Active filter chips below
- Filter sidebar (desktop) / Filter button (mobile)
- Results count: "Showing 24 results near Ahmedabad"
- Product grid (same card format as Home Feed)
- Pagination or infinite scroll

**Empty State:**
```
🔍 No results for "quantum physics textbook" near you.

Showing results from other locations ↓
[ products from other cities ]

Or try:
  • Broader search terms
  • Different category
  • Expand distance filter
```

### 13.3 Search Algorithm (Backend)

```
1. Text match: search in title, description, tags (case-insensitive, partial match)
2. Category filter applied
3. Condition filter applied
4. Price range filter applied
5. Distance filter applied (Haversine)
6. Sort by selected option
7. Paginate: 20 results per page
```

### 13.4 Category Browse Page

Clicking a category from the strip → category page:
- Header with category name and icon
- Sub-category filter chips
- All products in that category, location-sorted

---

## 14. Notifications System

### 14.1 Notification Types

| Event | Notification (for whom) | Priority |
|-------|------------------------|----------|
| Someone contacts seller | "Priya is interested in your Engineering Drawing Set" | 🔴 High |
| Listing gets 10 views | "Your listing got 10 views today!" | 🟡 Medium |
| Listing saved by 5 users | "5 students wishlisted your Drawing Set" | 🟡 Medium |
| Welcome on signup | "Welcome to Campus Market, Aarav! 🎉" | 🟢 Low |
| Listing posted successfully | "Your listing 'Drawing Set' is now live!" | 🟢 Low |
| Listing approaching 30 days (auto-expire reminder) | "Your listing expires in 3 days. Renew it?" | 🟡 Medium |
| Reported listing status | "Your report on [listing] has been reviewed." | 🟡 Medium |
| College email verified | "Your student status is now verified! ✅" | 🟢 Low |

### 14.2 Notification Center UI

```
🔔 Notifications                    [ Mark all read ]

● TODAY
  [Avatar] Priya is interested in your Drawing Set      2m ago
           "Is this still available?"

  [Icon]   Your listing got 10 views!                   1h ago
           Engineering Drawing Set is trending on your campus

○ YESTERDAY
  [Icon]   Welcome to Campus Market, Aarav! 🎉          Yesterday
           Start exploring or post your first listing.
```

Unread = filled dot ●, Read = hollow dot ○

### 14.3 Notification Data Model

```json
{
  "id": "n001",
  "userId": "u001",
  "type": "buyer_interest",
  "title": "Priya is interested in your Drawing Set",
  "body": "Is this still available?",
  "relatedProductId": "p001",
  "relatedUserId": "u002",
  "read": false,
  "createdAt": "2025-06-10T14:32:00Z"
}
```

---

## 15. Safety & Trust System

### 15.1 Verification Tiers

| Tier | Requirements | Badge |
|------|-------------|-------|
| Basic | Mobile OTP verified | None shown |
| Verified Student | College email confirmed | ✅ Blue badge |
| Trusted Seller *(V2)* | 5+ deals, no reports | ⭐ Gold badge |

### 15.2 Report System

**Who can report:** Any logged-in user
**What can be reported:** A listing, or a user profile

**Report a Listing — Reasons:**
1. Inappropriate/offensive content
2. Already sold, listing is inactive
3. Spam or misleading description
4. Fake or counterfeit item
5. Wrong category
6. Suspected scam
7. Other

**Report a User — Reasons:**
1. Abusive behavior
2. Suspected fake profile
3. Scam or fraud attempt
4. No-show (didn't turn up for meeting)
5. Other

**After submitting report:**
- "Thank you. Our team will review this within 24 hours."
- Report record stored in `reports.json`
- Auto-flag if listing receives 3+ reports in 24 hours

### 15.3 Safety Tips (Shown Contextually)

**On Product Detail Page:**
> ⚠️ Safety tip: Always meet in a public, well-lit place on or near campus. Never pay anyone before inspecting the item in person. Campus Market does not handle payments or guarantee transactions.

**On Contact Reveal Page:**
> 🛡️ Reminder: Inspect the item before paying. Preferred meeting spots on campus: canteen, library, main gate. If you feel unsafe, do not proceed with the meeting.

**In Footer (Always):**
> Campus Market Safety Guide → [link]

### 15.4 Listing Expiry

- Listings auto-expire after **30 days** of being active
- Seller receives a reminder notification 3 days before expiry
- Expired listings are hidden from feed but not deleted
- Seller can renew with one click from "My Listings"

### 15.5 Spam Prevention

- Max 10 active listings per user at once (V1 limit)
- A user cannot express interest in the same listing more than once per 24 hours
- Contact reveal limited to 20 per day per user
- Duplicate listing detection: if title + college matches an existing active listing by same user → warning shown

---

## 16. Error States & Edge Cases

### 16.1 Page-Level Error States

| Scenario | What User Sees |
|----------|---------------|
| Product not found (wrong URL) | "Oops! This listing doesn't exist." + Home button |
| Product sold | "This item has been sold." + Similar products section |
| Product deleted | "This listing is no longer available." + Home button |
| Network error | "Unable to load. Check your connection." + Retry button |
| Server error (500) | "Something went wrong on our end. We're fixing it." |
| Unauthorized access | Redirect to login + "Please login to continue" |

### 16.2 Form Validation Messages

| Field | Error Message |
|-------|--------------|
| Name left blank | "Please enter your name." |
| Mobile < 10 digits | "Enter a valid 10-digit mobile number." |
| OTP wrong | "Incorrect OTP. Please try again." (3 attempts, then resend) |
| Password too short | "Password must be at least 8 characters." |
| Passwords don't match | "Passwords do not match." |
| College not selected | "Please select your college." |
| Product title missing | "Please add a product title." |
| Price = 0 (not marked free) | "Enter a valid price or mark as Free." |
| No photos uploaded | "Please upload at least one photo." |
| Description too short | "Description must be at least 20 characters." |

### 16.3 Edge Cases to Handle

- **User tries to buy their own listing:** "You can't contact yourself on your own listing."
- **Seller deletes listing while buyer is on it:** Show "sold/removed" banner, contact button disabled.
- **No products near user's location:** Show empty state with option to expand radius.
- **User changes their college:** All listings remain, but location metadata updates.
- **Same product listed by two sellers at similar price:** Both shown; no de-duplication.
- **Image upload fails:** Error per file, rest continue uploading.
- **Session expired mid-form:** Save form data to sessionStorage, redirect to login, restore form on return.

---

## 17. API Design (REST Endpoints)

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <jwt_token>` header.

### 17.1 Auth Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/send-otp` | ❌ | Send OTP to mobile number |
| POST | `/auth/verify-otp` | ❌ | Verify OTP, return token |
| POST | `/auth/signup` | ❌ | Complete registration |
| POST | `/auth/login` | ❌ | Login, return JWT |
| POST | `/auth/logout` | ✅ | Invalidate token |
| POST | `/auth/forgot-password` | ❌ | Send OTP for reset |
| PUT | `/auth/reset-password` | ❌ | Update password after OTP |
| POST | `/auth/verify-college-email` | ✅ | Trigger college email verification |

### 17.2 User Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | ✅ | Get current user's profile |
| PUT | `/users/me` | ✅ | Update profile |
| GET | `/users/:id` | ✅ | Get public profile of any user |
| GET | `/users/:id/listings` | ✅ | Get listings by user |
| DELETE | `/users/me` | ✅ | Deactivate account |

### 17.3 Product Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | ❌ | Get all products (paginated, location-sorted) |
| GET | `/products/:id` | ❌ | Get single product detail |
| POST | `/products` | ✅ | Create new listing |
| PUT | `/products/:id` | ✅ | Edit listing (owner only) |
| DELETE | `/products/:id` | ✅ | Soft-delete listing (owner only) |
| PUT | `/products/:id/mark-sold` | ✅ | Mark as sold (owner only) |
| PUT | `/products/:id/renew` | ✅ | Renew a listing for 30 more days |
| GET | `/products/search` | ❌ | Search with query params |
| GET | `/products/category/:cat` | ❌ | Get by category |
| POST | `/products/:id/view` | ❌ | Increment view count |

**Query params for `/products`:**
```
?category=Electronics
&condition=Like+New
&minPrice=500
&maxPrice=5000
&lat=23.2156
&lng=72.6369
&radius=25
&sort=newest
&page=1
&limit=20
```

### 17.4 Interest Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/interests` | ✅ | Express interest in a product |
| GET | `/interests/mine` | ✅ | Get buyer's expressed interests |
| GET | `/interests/product/:productId` | ✅ | Get all interests for a product (seller only) |
| GET | `/interests/contact/:productId` | ✅ | Get seller contact (post-checklist) |

### 17.5 Wishlist Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wishlist` | ✅ | Get user's wishlist |
| POST | `/wishlist/:productId` | ✅ | Add to wishlist |
| DELETE | `/wishlist/:productId` | ✅ | Remove from wishlist |

### 17.6 Notification Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | ✅ | Get all notifications for user |
| PUT | `/notifications/read-all` | ✅ | Mark all as read |
| PUT | `/notifications/:id/read` | ✅ | Mark one as read |

### 17.7 Upload Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload/image` | ✅ | Upload image, return URL |

### 17.8 Report Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reports/listing/:id` | ✅ | Report a listing |
| POST | `/reports/user/:id` | ✅ | Report a user |

---

## 18. Data Models (JSON Schemas)

### 18.1 users.json

```json
[
  {
    "id": "u001",
    "name": "Aarav Shah",
    "username": "aaravshah",
    "mobile": "9876543210",
    "email": null,
    "collegeEmail": "aarav@iitgn.ac.in",
    "collegeEmailVerified": true,
    "college": "IIT Gandhinagar",
    "collegeCity": "Gandhinagar",
    "year": "Final Year",
    "department": "Computer Science and Engineering",
    "area": "IIT Campus, Palaj, Gandhinagar",
    "lat": 23.2156,
    "lng": 72.6369,
    "avatar": "/uploads/avatars/u001.jpg",
    "whatsapp": "9876543210",
    "showWhatsapp": true,
    "passwordHash": "$2b$10$...",
    "role": "user",
    "status": "active",
    "createdAt": "2025-01-10T10:00:00Z",
    "lastLogin": "2025-06-10T08:22:00Z"
  }
]
```

### 18.2 products.json

```json
[
  {
    "id": "p001",
    "sellerId": "u001",
    "title": "Engineering Drawing Set",
    "slug": "engineering-drawing-set-p001",
    "category": "Books & Stationery",
    "subCategory": "Lab Items",
    "condition": "Like New",
    "price": 250,
    "negotiable": true,
    "isFree": false,
    "description": "Barely used, all instruments intact. Purchased August 2024.",
    "images": [
      "/uploads/products/p001_1.jpg",
      "/uploads/products/p001_2.jpg"
    ],
    "tags": ["drawing", "engineering", "first year", "compass"],
    "meetingSpot": "College canteen, near main gate",
    "lat": 23.2156,
    "lng": 72.6369,
    "college": "IIT Gandhinagar",
    "city": "Gandhinagar",
    "status": "active",
    "views": 34,
    "wishlistCount": 5,
    "interestCount": 3,
    "postedAt": "2025-06-01T09:00:00Z",
    "expiresAt": "2025-07-01T09:00:00Z",
    "updatedAt": "2025-06-01T09:00:00Z"
  }
]
```

### 18.3 interests.json

```json
[
  {
    "id": "i001",
    "productId": "p001",
    "buyerId": "u002",
    "buyerName": "Priya Sharma",
    "buyerPhone": "9123456789",
    "buyerArea": "Navrangpura, Ahmedabad",
    "message": "Is this still available? I need it urgently.",
    "contactRevealed": true,
    "createdAt": "2025-06-05T11:30:00Z"
  }
]
```

### 18.4 wishlist.json

```json
[
  {
    "id": "w001",
    "userId": "u002",
    "productId": "p001",
    "savedAt": "2025-06-04T18:00:00Z"
  }
]
```

### 18.5 notifications.json

```json
[
  {
    "id": "n001",
    "userId": "u001",
    "type": "buyer_interest",
    "title": "Priya is interested in your Drawing Set",
    "body": "\"Is this still available? I need it urgently.\"",
    "relatedProductId": "p001",
    "relatedUserId": "u002",
    "read": false,
    "createdAt": "2025-06-05T11:30:00Z"
  }
]
```

### 18.6 reports.json

```json
[
  {
    "id": "r001",
    "reporterId": "u003",
    "targetType": "product",
    "targetId": "p002",
    "reason": "spam_misleading",
    "detail": "Price is wrong, this is a scam.",
    "status": "pending",
    "createdAt": "2025-06-06T09:00:00Z"
  }
]
```

### 18.7 drafts.json

```json
[
  {
    "id": "d001",
    "userId": "u001",
    "step": 2,
    "data": {
      "title": "Old Physics Book",
      "category": "Books & Stationery",
      "condition": "Good",
      "price": 150,
      "negotiable": false
    },
    "savedAt": "2025-06-09T20:00:00Z"
  }
]
```

---

## 19. Tech Stack

### 19.1 Frontend

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| Framework | React.js | 18.x | Component-based, massive ecosystem |
| Build Tool | Vite | 5.x | Fast HMR, fast builds, zero config |
| Styling | Tailwind CSS | 3.x | Utility-first, responsive, fast to write |
| Routing | React Router | 6.x | File-based routing, protected routes |
| State Management | Zustand | 4.x | Lightweight, simple, no boilerplate |
| Icons | Lucide React | latest | Clean, consistent icon set |
| Image Upload | react-dropzone | 14.x | Drag-and-drop upload with preview |
| Form Handling | React Hook Form | 7.x | Performant, minimal re-renders |
| Validation | Zod | 3.x | Schema-based validation |
| HTTP Requests | Axios | 1.x | Interceptors for JWT injection |
| Toast Notifications | react-hot-toast | 2.x | Lightweight, beautiful toasts |
| Date Formatting | date-fns | 3.x | "2 hours ago" formatting |
| Image Lightbox | yet-another-react-lightbox | latest | Full-screen image gallery |

### 19.2 Backend

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| Runtime | Node.js | 20.x LTS | Stable, widely supported |
| Framework | Express.js | 4.x | Minimal, fast REST API |
| Data Storage | lowdb (JSON) | 7.x | File-based DB, zero setup |
| Auth | jsonwebtoken (JWT) | 9.x | Stateless token auth |
| Password Hashing | bcrypt | 5.x | Industry-standard password security |
| File Uploads | multer | 1.x | Multipart form handling |
| OTP (mock) | Custom / console.log | — | In V1: log OTP to console; V2: Twilio |
| CORS | cors | 2.x | Allow frontend-backend communication |
| Environment | dotenv | 16.x | Secret management |
| Request Validation | express-validator | 7.x | Server-side input validation |

### 19.3 Development Tools

| Tool | Purpose |
|------|---------|
| Postman | API testing |
| ESLint + Prettier | Code quality and formatting |
| Git + GitHub | Version control |
| Nodemon | Auto-restart server on file changes |
| VS Code | Recommended editor |

### 19.4 Deployment (When Ready)

| Service | For |
|---------|-----|
| Vercel | Frontend (React) — free tier |
| Railway or Render | Backend (Node.js) — free tier |
| Cloudinary | Image storage (when moving off local files) |

---

## 20. Folder & File Structure

```
campus-market/
│
├── client/                              # React Frontend (Vite)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                      # Static images, SVGs
│   │   │   └── logo.svg
│   │   │
│   │   ├── components/                  # Reusable UI components
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── BottomTabBar.jsx     # Mobile nav
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   ├── ProductImageGallery.jsx
│   │   │   │   └── ConditionBadge.jsx
│   │   │   ├── seller/
│   │   │   │   └── SellerCard.jsx
│   │   │   ├── forms/
│   │   │   │   ├── OTPInput.jsx
│   │   │   │   ├── ImageUploader.jsx
│   │   │   │   └── TagInput.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   └── EmptyState.jsx
│   │   │   └── common/
│   │   │       ├── CategoryBar.jsx
│   │   │       ├── FilterPanel.jsx
│   │   │       ├── LocationSelector.jsx
│   │   │       └── SafetyBanner.jsx
│   │   │
│   │   ├── pages/                       # Route-level page components
│   │   │   ├── Landing.jsx              # Guest home page
│   │   │   ├── Home.jsx                 # Logged-in feed
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── CreateListing.jsx        # 4-step form
│   │   │   ├── ExpressInterest.jsx      # Contact + checklist
│   │   │   ├── Profile.jsx
│   │   │   ├── EditProfile.jsx
│   │   │   ├── MyListings.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   ├── CategoryPage.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── NotFound.jsx             # 404 page
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # User auth state
│   │   │   └── LocationContext.jsx      # Current user location
│   │   │
│   │   ├── store/                       # Zustand stores
│   │   │   ├── authStore.js
│   │   │   ├── productStore.js
│   │   │   └── notificationStore.js
│   │   │
│   │   ├── hooks/                       # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useProducts.js
│   │   │   ├── useWishlist.js
│   │   │   └── useLocation.js
│   │   │
│   │   ├── utils/
│   │   │   ├── distance.js              # Haversine formula
│   │   │   ├── formatters.js            # Price, date, name formatters
│   │   │   ├── validators.js            # Client-side validation helpers
│   │   │   └── constants.js             # Categories, conditions, cities
│   │   │
│   │   ├── api/                         # Axios API call functions
│   │   │   ├── axiosInstance.js         # Base config with JWT interceptor
│   │   │   ├── authApi.js
│   │   │   ├── productApi.js
│   │   │   ├── userApi.js
│   │   │   ├── interestApi.js
│   │   │   ├── wishlistApi.js
│   │   │   └── notificationApi.js
│   │   │
│   │   ├── App.jsx                      # Routes defined here
│   │   ├── main.jsx                     # React entry point
│   │   └── index.css                    # Tailwind imports
│   │
│   ├── .env                             # VITE_API_URL=http://localhost:5000/api
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                              # Node.js + Express Backend
│   ├── data/                            # JSON "database" files
│   │   ├── users.json
│   │   ├── products.json
│   │   ├── interests.json
│   │   ├── wishlist.json
│   │   ├── notifications.json
│   │   ├── reports.json
│   │   └── drafts.json
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── interests.js
│   │   ├── wishlist.js
│   │   ├── notifications.js
│   │   ├── upload.js
│   │   └── reports.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js            # JWT verification
│   │   ├── uploadMiddleware.js          # multer config
│   │   └── errorHandler.js             # Central error handler
│   │
│   ├── utils/
│   │   ├── db.js                        # lowdb setup & helpers
│   │   ├── distance.js                  # Haversine
│   │   ├── generateId.js               # UUID or nanoid
│   │   ├── notifications.js            # Create notification helper
│   │   └── validators.js               # Server-side validation helpers
│   │
│   ├── uploads/                         # Stored images (gitignored)
│   │   ├── avatars/
│   │   └── products/
│   │
│   ├── .env                             # PORT, JWT_SECRET
│   ├── index.js                         # Express app entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 21. UI/UX Design Guidelines

### 21.1 Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary (CTA buttons, links) | Indigo | `#4F46E5` |
| Primary Hover | Dark Indigo | `#4338CA` |
| Secondary | Slate | `#64748B` |
| Success / Verified | Green | `#16A34A` |
| Warning | Amber | `#D97706` |
| Danger / Report | Red | `#DC2626` |
| Background | Off-White | `#F8FAFC` |
| Card Background | White | `#FFFFFF` |
| Text Primary | Dark Gray | `#111827` |
| Text Secondary | Gray | `#6B7280` |
| Border | Light Gray | `#E5E7EB` |

### 21.2 Typography

| Element | Size | Weight |
|---------|------|--------|
| Page heading (H1) | 28–32px | 700 Bold |
| Section heading (H2) | 20–24px | 600 SemiBold |
| Card title | 15–16px | 500 Medium |
| Body text | 14–15px | 400 Regular |
| Small / Labels | 12–13px | 400 Regular |
| Price | 18–20px | 700 Bold |

Font: **Inter** (Google Fonts) — clean, modern, highly readable on screen.

### 21.3 Spacing System (Tailwind)

Use Tailwind's default 4px scale:
- `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px
- Card padding: `p-4`
- Section gap: `gap-6` or `gap-8`
- Page max-width: `max-w-7xl mx-auto px-4`

### 21.4 Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 640px | 1 column, bottom tab bar |
| Tablet | 640–1024px | 2 columns, top navbar |
| Desktop | > 1024px | 4 columns, sidebar filters |

### 21.5 Component Design Rules

- All cards: `rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition`
- All primary buttons: `bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700`
- All secondary buttons: `border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50`
- Condition badges:
  - New → Green background
  - Like New → Blue background
  - Good → Yellow background
  - Fair → Gray background
- Verified badge: ✅ blue, next to user name, tooltip "Verified Student"

### 21.6 Loading States

- Product grid: skeleton loader (pulsing gray cards)
- Images: blur-up progressive loading
- Buttons: spinner icon while API call is in flight, button disabled during loading
- Full page: centered spinner for initial data load

---

## 22. Business Logic & Rules

### 22.1 Product Rules

- A product must have at least 1 image to be posted
- Maximum 10 active listings per user (V1 cap)
- Listings auto-expire after 30 days; can be renewed for another 30
- A sold listing can be reactivated within 14 days of being marked sold
- A user cannot buy their own listing
- Price cannot be negative; 0 is only allowed if "Mark as Free" is toggled on

### 22.2 Interest Rules

- Buyer can only express interest in a product once
- Seller's contact is revealed immediately upon completing the checklist
- Once contact is revealed, it remains accessible to that buyer from "My Interests" page
- Expressing interest sends one notification to the seller (no repeat notifications for same buyer-product pair)
- Daily limit: 20 contact reveals per buyer per day (anti-spam)

### 22.3 Wishlist Rules

- No limit on wishlist size
- Wishlist is private — only the user can see their wishlist
- If a wishlisted product is sold → show "Sold" badge on wishlist card, allow removal

### 22.4 User Rules

- Username must be unique across the platform
- College change is allowed but resets verified badge
- Account deletion soft-deletes (status = "deleted"), anonymizes personal data
- Deactivated accounts: listings hidden, profile not accessible, can re-activate

### 22.5 Notification Rules

- Notifications are never deleted (kept for 90 days then purged)
- Max 1 "10 views" milestone notification per listing per day
- Welcome notification sent only once per user

---

## 23. Monetization Strategy

> V1 is completely free. Monetization begins in V2 once user base is established.

### Phase 1 (V1) — Free for All

- No listing fees
- No transaction fees
- No premium accounts
- Goal: grow user base, build trust

### Phase 2 (V2) — Soft Monetization

| Feature | Model | Price |
|---------|-------|-------|
| **Boost Listing** | Pay ₹20–50 to feature listing at top of feed for 7 days | Per listing |
| **Verified Seller Badge** (premium) | ₹99/month for a "Pro Seller" badge with priority placement | Subscription |
| **Campus Ads** | Local businesses (coaching centers, hostels, food services) can buy banner ad slots targeted to specific colleges | CPM |

### Phase 3 (V3) — Platform Fee

| Feature | Model |
|---------|-------|
| UPI escrow payment | 2–3% platform fee on transactions done through Campus Market Pay |
| Premium campus club pages | Colleges/clubs can get verified pages for ₹499/year |

---

## 24. Future Scope (V2+)

### Technical Upgrades

| Feature | Tech | Notes |
|---------|------|-------|
| Database migration | MongoDB or PostgreSQL | Move from JSON when users > 500 |
| Real-time chat | Socket.io | In-app messaging between buyer and seller |
| Push notifications | Firebase Cloud Messaging | Browser + mobile push |
| Image CDN | Cloudinary | Replace local file storage |
| Search engine | Elasticsearch or MeiliSearch | Faster, fuzzier search |
| Mobile app | React Native | Share codebase with web |

### Feature Additions

| Feature | Description |
|---------|-------------|
| **In-App Chat** | Real-time buyer-seller messaging within the app |
| **Ratings & Reviews** | Post-deal ratings: 1–5 stars + text review |
| **Google OAuth** | "Login with Google" using .edu Gmail |
| **Price Alerts** | Notify user when a wishlisted product drops in price |
| **College Communities** | College-specific feeds, bulletin boards |
| **Free Giveaway Section** | Dedicated section for free items |
| **Bulk Listing** | Import multiple products from CSV (for graduating students) |
| **Admin Panel** | Web dashboard: manage users, listings, reports, categories |
| **AI-Powered Recommendations** | "You might also like..." based on browsing |
| **Barcode Scanner** | Scan book barcode → auto-fill title, author, edition |

---

## 25. Development Milestones

### Milestone 1 — Foundation (Week 1–2)
- [ ] Project setup: React + Vite frontend, Node.js + Express backend
- [ ] JSON DB setup with lowdb
- [ ] Auth: Signup, Login, JWT, OTP (console log)
- [ ] Basic Navbar with routing
- [ ] Landing page (static)

### Milestone 2 — Core Listings (Week 3–4)
- [ ] Create Listing (4-step form with image upload)
- [ ] Home Feed with product cards
- [ ] Product Detail page
- [ ] Location detection and distance sorting
- [ ] Search (basic keyword match)

### Milestone 3 — Buyer Flow (Week 5)
- [ ] Express Interest flow with safety checklist
- [ ] Contact reveal page
- [ ] Wishlist (add, remove, view)
- [ ] Notifications system (basic)

### Milestone 4 — Profile & Management (Week 6)
- [ ] My Profile page
- [ ] My Listings (edit, mark sold, delete, renew)
- [ ] My Interests tab
- [ ] Edit Profile

### Milestone 5 — Polish & Safety (Week 7)
- [ ] Report listing / user
- [ ] Listing expiry logic
- [ ] All error states and empty states
- [ ] Toast notifications
- [ ] Mobile responsive design

### Milestone 6 — Testing & Launch (Week 8)
- [ ] Test all API endpoints
- [ ] Fix bugs found in testing
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render/Railway
- [ ] Seed with sample data for demo

---

*Document Version: 2.0 | Fully expanded product specification | Campus Market | June 2025*
*Built for Indian college students — keep it simple, safe, and student-first.*
