# Into The Wild - UI/UX Design System & Implementation Plan

> **Version:** 1.0  
> **Date:** October 5, 2025  
> **Status:** Ready for Implementation

---

## 📋 Table of Contents

1. [Brand Identity Analysis](#1-brand-identity-analysis)
2. [Visual Design Foundation](#2-visual-design-foundation)
3. [Logo Integration Specifications](#3-logo-integration-specifications)
4. [Component Design System](#4-component-design-system)
5. [Animation & Interaction Patterns](#5-animation--interaction-patterns)
6. [Responsive Design Strategy](#6-responsive-design-strategy)
7. [Implementation Roadmap](#7-implementation-roadmap)

---

## 1. Brand Identity Analysis

### Logo Characteristics

**Visual Elements:**
- **Central Imagery:** Globe with directional trail signs
- **Characters:** Playful monkey, wildlife (snail, chameleon, snake, butterfly)
- **Nature Elements:** Leaves, mushrooms, logs, backpack, compass
- **Typography:** Bold black text on yellow directional signs
- **Tagline:** "OPEN HIKERS CLUB"

**Brand Personality:**
- ✨ **Adventurous** - Encourages exploration
- 🎨 **Playful** - Fun, approachable, not overly serious
- 🌿 **Nature-Connected** - Strong outdoor/wildlife themes
- 🤝 **Community-Focused** - "Open" and "Club" suggest inclusivity
- 🗺️ **Journey-Oriented** - Trail signs represent pathways and direction

**Emotional Tone:**
- Exciting yet safe
- Fun but informative
- Energetic without being overwhelming
- Welcoming and inclusive

---

## 2. Visual Design Foundation

### 2.1 Color Palette - Bold Adventure Theme

#### Primary Colors

```css
:root {
  /* Primary - Deep Teal/Turquoise (from logo's natural elements) */
  --primary: 174 64% 40%;                    /* #26A69A - Teal */
  --primary-hover: 174 64% 32%;              /* Darker on hover */
  --primary-light: 174 64% 92%;              /* Light backgrounds */
  --primary-foreground: 0 0% 100%;           /* White text */
  
  /* Secondary - Warm Amber/Yellow (from logo's sun & signs) */
  --secondary: 45 95% 58%;                   /* #FFC107 - Amber */
  --secondary-hover: 45 95% 48%;             
  --secondary-light: 45 95% 95%;
  --secondary-foreground: 220 20% 20%;       /* Dark text */
  
  /* Accent - Warm Terracotta (from logo's earth tones) */
  --accent: 14 91% 58%;                      /* #F2705D - Terracotta */
  --accent-hover: 14 91% 48%;
  --accent-light: 14 91% 95%;
  --accent-foreground: 0 0% 100%;
  
  /* Supporting - Sky Blue (from logo's sky/water) */
  --info: 204 94% 63%;                       /* #42A5F5 - Sky Blue */
  --info-light: 204 94% 95%;
  
  /* Success - Fresh Green (from logo's nature) */
  --success: 142 71% 45%;                    /* #4CAF50 - Green */
  --success-light: 142 71% 95%;
  
  /* Neutral - Balanced grays */
  --background: 0 0% 100%;                   /* White */
  --background-subtle: 174 20% 97%;          /* Light teal tint */
  --foreground: 220 20% 20%;                 /* Near black */
  
  --muted: 220 14% 96%;                      /* Light gray */
  --muted-foreground: 220 8% 46%;            /* Medium gray */
  
  --border: 220 13% 91%;                     /* Border gray */
  --input: 220 13% 91%;                      /* Input borders */
  --ring: 174 64% 40%;                       /* Focus rings (teal) */
}
```

#### Color Usage Guidelines

| Color | Primary Use | Examples |
|-------|-------------|----------|
| **Teal** | Primary actions, navigation, links | CTA buttons, active states, header accents |
| **Amber** | Secondary actions, highlights | Secondary buttons, badges, notifications |
| **Terracotta** | Urgent actions, special features | Register buttons, featured treks, premium |
| **Sky Blue** | Informational elements | Info messages, tags, helper text |
| **Green** | Success states, confirmations | Success messages, completed states |

### 2.2 Typography System

#### Font Stack

**Headings:** Poppins (Bold, Modern, Geometric)
```css
font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Body Text:** Inter (Clean, Readable)
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Special/Display:** Poppins ExtraBold (for hero sections)

#### Typography Scale

```css
/* Headings */
.text-display-xl    { font-size: 4.5rem; line-height: 1.1; font-weight: 800; }  /* 72px - Hero only */
.text-display-lg    { font-size: 3.75rem; line-height: 1.1; font-weight: 800; } /* 60px */
.text-display       { font-size: 3rem; line-height: 1.2; font-weight: 700; }    /* 48px */

.text-h1            { font-size: 2.25rem; line-height: 1.2; font-weight: 700; } /* 36px */
.text-h2            { font-size: 1.875rem; line-height: 1.3; font-weight: 700; }/* 30px */
.text-h3            { font-size: 1.5rem; line-height: 1.3; font-weight: 600; }  /* 24px */
.text-h4            { font-size: 1.25rem; line-height: 1.4; font-weight: 600; } /* 20px */
.text-h5            { font-size: 1.125rem; line-height: 1.4; font-weight: 600; }/* 18px */

/* Body Text */
.text-body-xl       { font-size: 1.25rem; line-height: 1.6; }                   /* 20px */
.text-body-lg       { font-size: 1.125rem; line-height: 1.6; }                  /* 18px */
.text-body          { font-size: 1rem; line-height: 1.6; }                      /* 16px - Base */
.text-body-sm       { font-size: 0.875rem; line-height: 1.5; }                  /* 14px */
.text-body-xs       { font-size: 0.75rem; line-height: 1.4; }                   /* 12px */
```

#### Font Weight Guidelines

- **800 (ExtraBold):** Display text, major headings
- **700 (Bold):** H1-H2, important actions
- **600 (SemiBold):** H3-H5, button text, navigation
- **500 (Medium):** Emphasized body text
- **400 (Regular):** Body text, descriptions
- **300 (Light):** Subtle text, disclaimers

### 2.3 Spacing System

```css
/* Base: 4px unit (0.25rem) */
--spacing-0: 0;           /* 0px */
--spacing-1: 0.25rem;     /* 4px */
--spacing-2: 0.5rem;      /* 8px */
--spacing-3: 0.75rem;     /* 12px */
--spacing-4: 1rem;        /* 16px - Base */
--spacing-5: 1.25rem;     /* 20px */
--spacing-6: 1.5rem;      /* 24px */
--spacing-8: 2rem;        /* 32px */
--spacing-10: 2.5rem;     /* 40px */
--spacing-12: 3rem;       /* 48px */
--spacing-16: 4rem;       /* 64px */
--spacing-20: 5rem;       /* 80px */
--spacing-24: 6rem;       /* 96px */
```

### 2.4 Border Radius & Shape Language

**Philosophy:** Rounded, friendly shapes inspired by the organic logo

```css
--radius-xs: 0.25rem;     /* 4px - Subtle rounded */
--radius-sm: 0.375rem;    /* 6px - Small elements */
--radius-md: 0.5rem;      /* 8px - Default cards */
--radius-lg: 0.75rem;     /* 12px - Large cards */
--radius-xl: 1rem;        /* 16px - Featured elements */
--radius-2xl: 1.5rem;     /* 24px - Hero sections */
--radius-full: 9999px;    /* Pills, avatars */
```

**Component Radius Map:**
- **Buttons:** `radius-md` (8px) - approachable but not too round
- **Cards:** `radius-lg` (12px) - friendly and modern
- **Inputs:** `radius-md` (8px) - matches buttons
- **Modals:** `radius-xl` (16px) - distinctive popups
- **Badges/Tags:** `radius-full` - pill shape
- **Images:** `radius-lg` to `radius-xl` - depends on size

### 2.5 Shadow System

```css
/* Elevation system */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Special shadow with color tint */
--shadow-primary: 0 10px 25px -5px rgb(38 166 154 / 0.3);   /* Teal glow */
--shadow-accent: 0 10px 25px -5px rgb(242 112 93 / 0.3);    /* Terracotta glow */
```

---

## 3. Logo Integration Specifications

### 3.1 Logo File Setup

**Location:** `public/itw_logo.jpg`

**Variants Needed:**
```
public/
├── itw_logo.jpg           (Original - 800x800px)
├── itw_logo_sm.jpg        (Small - 200x200px for mobile)
├── favicon.ico            (Favicon - extracted from logo)
└── og-image.jpg           (1200x630px for social sharing)
```

### 3.2 Header Logo Integration

**Target Component:** `src/components/Header.tsx`

**Specifications:**
```tsx
// Desktop
<Link to="/" className="flex items-center gap-3 group">
  <img 
    src="/itw_logo.jpg" 
    alt="Into the Wild" 
    className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
  />
  <span className="text-xl font-bold text-gray-800 hidden lg:inline">
    Into the Wild
  </span>
</Link>

// Mobile
<img 
  src="/itw_logo.jpg" 
  alt="Into the Wild" 
  className="h-10 w-auto"
/>
```

**Dimensions:**
- Desktop: 48px height (h-12)
- Mobile: 40px height (h-10)
- Maintain aspect ratio (w-auto)

**Hover Effect:**
- Scale: 1.05
- Duration: 300ms
- Easing: ease-in-out

### 3.3 Hero Section Backdrop (Option 1 - Subtle Watermark)

**Target:** `src/pages/Index.tsx` - Hero section

**Implementation:**
```tsx
<section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50">
  {/* Logo Watermark */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <img 
      src="/itw_logo.jpg" 
      alt="" 
      aria-hidden="true"
      className="w-[600px] md:w-[800px] h-auto object-contain opacity-[0.03] blur-[0.5px]"
    />
  </div>
  
  {/* Content Layer */}
  <div className="relative z-10 container mx-auto px-4">
    {/* Existing hero content */}
  </div>
</section>
```

**Specifications:**
- **Opacity:** 0.03 (barely visible, subtle texture)
- **Size:** 600px mobile, 800px desktop
- **Blur:** 0.5px (softens edges)
- **Positioning:** Centered
- **Pointer Events:** None (doesn't interfere with clicks)
- **Background Gradient:** Teal-50 to Amber-50 (logo colors)

### 3.4 Loading States

**Target:** Create new component `src/components/LoadingScreen.tsx`

**Specifications:**
```tsx
export const LoadingScreen = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center z-50">
    <div className="text-center">
      <img 
        src="/itw_logo.jpg" 
        alt="Into the Wild" 
        className="h-32 md:h-40 w-auto mx-auto animate-pulse-scale mb-6"
      />
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-terracotta-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  </div>
);

// Custom animation
@keyframes pulse-scale {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.animate-pulse-scale {
  animation: pulse-scale 2s ease-in-out infinite;
}
```

### 3.5 Trek Event Cards with Logo Watermark

**Target:** `src/components/trek/TrekEventsList.tsx` (Card components)

**Implementation:**
```tsx
<div className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all duration-300">
  {/* Logo Watermark - appears on hover */}
  <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
    <img 
      src="/itw_logo.jpg" 
      alt="" 
      className="h-48 w-auto transform translate-x-8 translate-y-8 rotate-12"
    />
  </div>
  
  {/* Card Content */}
  <div className="relative z-10">
    {/* Trek image, title, details, etc. */}
  </div>
</div>
```

**Specifications:**
- **Initial State:** opacity-0 (invisible)
- **Hover State:** opacity-0.08 (subtle appearance)
- **Position:** Bottom-right corner
- **Transform:** Translate (8px, 8px), rotate 12°
- **Transition:** 500ms ease-in-out
- **Size:** 192px height (h-48)

### 3.6 Auth Pages - Split Screen Design

**Target:** `src/pages/Auth.tsx`

**Implementation:**
```tsx
<div className="min-h-screen grid md:grid-cols-2">
  {/* Left Side - Branding */}
  <div className="hidden md:flex relative bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-600 overflow-hidden">
    {/* Logo Pattern Background */}
    <div className="absolute inset-0">
      <img 
        src="/itw_logo.jpg" 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay scale-110 blur-sm"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-teal-600/60 via-transparent to-teal-900/60"></div>
    </div>
    
    {/* Content */}
    <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
      <img 
        src="/itw_logo.jpg" 
        alt="Into the Wild" 
        className="h-40 w-auto mb-8 drop-shadow-2xl"
      />
      <h1 className="text-5xl font-bold mb-4 text-center">Into the Wild</h1>
      <p className="text-2xl text-teal-50 text-center max-w-md">
        Your next adventure awaits
      </p>
      <div className="mt-12 flex gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold">500+</div>
          <div className="text-teal-200 text-sm">Treks</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold">10K+</div>
          <div className="text-teal-200 text-sm">Hikers</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold">50+</div>
          <div className="text-teal-200 text-sm">Locations</div>
        </div>
      </div>
    </div>
  </div>
  
  {/* Right Side - Form */}
  <div className="flex items-center justify-center p-8 bg-white">
    <div className="w-full max-w-md">
      {/* Mobile Logo */}
      <img 
        src="/itw_logo.jpg" 
        alt="Into the Wild" 
        className="h-20 w-auto mx-auto mb-8 md:hidden"
      />
      <AuthForm />
    </div>
  </div>
</div>
```

### 3.7 Empty States

**Implementation:**
```tsx
const EmptyState = ({ title, description, action }) => (
  <div className="text-center py-16 px-4">
    <div className="inline-block relative mb-6">
      <img 
        src="/itw_logo.jpg" 
        alt="" 
        className="h-32 w-auto opacity-15 grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent"></div>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
    {action}
  </div>
);
```

**Specifications:**
- **Logo Size:** 128px height (h-32)
- **Opacity:** 0.15 (very subtle)
- **Filter:** grayscale (removes color)
- **Gradient Overlay:** White fade from bottom

---

## 4. Component Design System

### 4.1 Button System

#### Button Variants

**1. Primary Button (CTA)**
```tsx
<button className="btn-primary">
  Explore Treks
  <ArrowRight className="ml-2" />
</button>
```

**Styles:**
```css
.btn-primary {
  @apply inline-flex items-center justify-center gap-2;
  @apply px-6 py-3 rounded-lg;
  @apply bg-teal-600 text-white font-semibold;
  @apply shadow-md hover:shadow-xl;
  @apply transition-all duration-300 ease-out;
  @apply hover:bg-teal-700 hover:scale-[1.02];
  @apply active:scale-[0.98];
  @apply focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100;
}
```

**2. Secondary Button**
```css
.btn-secondary {
  @apply inline-flex items-center justify-center gap-2;
  @apply px-6 py-3 rounded-lg;
  @apply bg-amber-400 text-gray-900 font-semibold;
  @apply shadow-md hover:shadow-xl;
  @apply transition-all duration-300 ease-out;
  @apply hover:bg-amber-500 hover:scale-[1.02];
  @apply active:scale-[0.98];
}
```

**3. Accent Button (Register/Featured)**
```css
.btn-accent {
  @apply inline-flex items-center justify-center gap-2;
  @apply px-8 py-4 rounded-xl;
  @apply bg-gradient-to-r from-terracotta-500 to-orange-500;
  @apply text-white font-bold text-lg;
  @apply shadow-lg hover:shadow-accent;
  @apply transition-all duration-300 ease-out;
  @apply hover:scale-105 hover:shadow-2xl;
  @apply active:scale-[0.97];
  @apply relative overflow-hidden;
}

/* Animated shine effect */
.btn-accent::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s ease;
}

.btn-accent:hover::before {
  left: 100%;
}
```

**4. Outline Button**
```css
.btn-outline {
  @apply inline-flex items-center justify-center gap-2;
  @apply px-6 py-3 rounded-lg;
  @apply border-2 border-teal-600 text-teal-600 font-semibold;
  @apply bg-white hover:bg-teal-50;
  @apply transition-all duration-300 ease-out;
  @apply hover:border-teal-700 hover:text-teal-700;
  @apply hover:scale-[1.02];
  @apply active:scale-[0.98];
}
```

**5. Ghost Button**
```css
.btn-ghost {
  @apply inline-flex items-center justify-center gap-2;
  @apply px-4 py-2 rounded-lg;
  @apply text-gray-700 font-medium;
  @apply hover:bg-gray-100;
  @apply transition-all duration-200 ease-out;
  @apply active:bg-gray-200;
}
```

**6. Icon Button**
```css
.btn-icon {
  @apply inline-flex items-center justify-center;
  @apply w-10 h-10 rounded-full;
  @apply text-gray-600 hover:text-teal-600;
  @apply hover:bg-teal-50;
  @apply transition-all duration-200 ease-out;
  @apply hover:scale-110;
  @apply active:scale-95;
}
```

#### Button Sizes

```css
.btn-xs { @apply px-3 py-1.5 text-xs rounded-md; }
.btn-sm { @apply px-4 py-2 text-sm rounded-lg; }
.btn-md { @apply px-6 py-3 text-base rounded-lg; }  /* Default */
.btn-lg { @apply px-8 py-4 text-lg rounded-xl; }
.btn-xl { @apply px-10 py-5 text-xl rounded-xl; }
```

#### Button States & Animations

**Loading State:**
```tsx
<button className="btn-primary" disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</button>
```

**With Badge:**
```tsx
<button className="btn-primary relative">
  Notifications
  <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
    3
  </span>
</button>
```

**Ripple Effect (Advanced):**
```css
.btn-ripple {
  @apply relative overflow-hidden;
}

.btn-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-ripple:active::after {
  width: 300px;
  height: 300px;
}
```

### 4.2 Card Components

#### Trek Card

**Design Specifications:**
```tsx
<div className="trek-card group">
  {/* Image Container */}
  <div className="relative h-56 overflow-hidden rounded-t-xl">
    <img 
      src={trek.image} 
      alt={trek.title}
      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
    />
    
    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
    
    {/* Badge */}
    <div className="absolute top-4 right-4">
      <span className="badge-featured">Featured</span>
    </div>
    
    {/* Difficulty Badge */}
    <div className="absolute bottom-4 left-4">
      <span className="badge-difficulty-{difficulty}">{difficulty}</span>
    </div>
    
    {/* Logo Watermark (on hover) */}
    <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
      <img src="/itw_logo.jpg" alt="" className="h-32 w-auto translate-x-4 translate-y-4 rotate-12" />
    </div>
  </div>
  
  {/* Content */}
  <div className="p-6">
    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
      {trek.title}
    </h3>
    
    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
      {trek.description}
    </p>
    
    {/* Meta Info */}
    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
      <span className="flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        {trek.location}
      </span>
      <span className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        {trek.date}
      </span>
    </div>
    
    {/* Footer */}
    <div className="flex items-center justify-between">
      <div className="text-2xl font-bold text-teal-600">
        ₹{trek.price}
      </div>
      <button className="btn-primary btn-sm">
        View Details
      </button>
    </div>
  </div>
</div>
```

**Styles:**
```css
.trek-card {
  @apply bg-white rounded-xl border border-gray-200;
  @apply shadow-md hover:shadow-2xl;
  @apply transition-all duration-300 ease-out;
  @apply hover:-translate-y-1;
  @apply cursor-pointer;
  @apply overflow-hidden;
}
```

#### Dashboard Welcome Card

```tsx
<div className="dashboard-welcome-card">
  {/* Logo Backdrop */}
  <div className="absolute right-0 top-0 opacity-[0.06] -mr-12 -mt-12 pointer-events-none">
    <img src="/itw_logo.jpg" alt="" className="h-80 w-auto rotate-12" />
  </div>
  
  {/* Content */}
  <div className="relative z-10">
    <h1 className="text-4xl font-bold text-gray-900 mb-2">
      Welcome back, {userName}! 👋
    </h1>
    <p className="text-lg text-gray-600 mb-6">
      Ready for your next adventure?
    </p>
    
    {/* Quick Stats */}
    <div className="grid grid-cols-3 gap-4">
      <div className="stat-card">
        <div className="text-3xl font-bold text-teal-600">12</div>
        <div className="text-sm text-gray-600">Treks Joined</div>
      </div>
      <div className="stat-card">
        <div className="text-3xl font-bold text-amber-500">2.5K</div>
        <div className="text-sm text-gray-600">KM Traveled</div>
      </div>
      <div className="stat-card">
        <div className="text-3xl font-bold text-green-600">8</div>
        <div className="text-sm text-gray-600">Peaks Conquered</div>
      </div>
    </div>
  </div>
</div>
```

**Styles:**
```css
.dashboard-welcome-card {
  @apply relative overflow-hidden rounded-2xl;
  @apply bg-gradient-to-br from-teal-50 via-white to-amber-50;
  @apply border border-gray-200;
  @apply p-8 md:p-12;
  @apply shadow-lg;
}

.stat-card {
  @apply bg-white rounded-xl p-4 text-center;
  @apply border border-gray-100 shadow-sm;
  @apply hover:shadow-md transition-shadow duration-200;
}
```

### 4.3 Badge System

```css
/* Base Badge */
.badge {
  @apply inline-flex items-center gap-1 px-3 py-1;
  @apply text-xs font-semibold rounded-full;
  @apply transition-all duration-200;
}

/* Variants */
.badge-featured {
  @apply badge bg-gradient-to-r from-amber-400 to-orange-500;
  @apply text-white shadow-lg;
  @apply animate-pulse-subtle;
}

.badge-difficulty-easy {
  @apply badge bg-green-100 text-green-800 border border-green-200;
}

.badge-difficulty-moderate {
  @apply badge bg-amber-100 text-amber-800 border border-amber-200;
}

.badge-difficulty-hard {
  @apply badge bg-red-100 text-red-800 border border-red-200;
}

.badge-new {
  @apply badge bg-blue-500 text-white;
}

.badge-status-open {
  @apply badge bg-teal-100 text-teal-800 border border-teal-200;
}

.badge-status-full {
  @apply badge bg-gray-200 text-gray-700;
}
```

### 4.4 Input Components

```css
.input {
  @apply w-full px-4 py-3 rounded-lg;
  @apply border-2 border-gray-300;
  @apply bg-white text-gray-900;
  @apply placeholder:text-gray-400;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100;
  @apply hover:border-gray-400;
}

.input-error {
  @apply border-red-500 focus:border-red-500 focus:ring-red-100;
}

.input-success {
  @apply border-green-500 focus:border-green-500 focus:ring-green-100;
}

/* With Icon */
.input-wrapper {
  @apply relative;
}

.input-with-icon {
  @apply pl-12;
}

.input-icon {
  @apply absolute left-4 top-1/2 -translate-y-1/2;
  @apply text-gray-400;
}
```

---

## 5. Animation & Interaction Patterns

### 5.1 Micro-interactions

**Hover Lift:**
```css
.hover-lift {
  @apply transition-all duration-300 ease-out;
  @apply hover:-translate-y-1 hover:shadow-xl;
}
```

**Hover Grow:**
```css
.hover-grow {
  @apply transition-transform duration-300 ease-out;
  @apply hover:scale-105;
}
```

**Pulse Attention:**
```css
@keyframes pulse-subtle {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.animate-pulse-subtle {
  animation: pulse-subtle 3s ease-in-out infinite;
}
```

**Shimmer Loading:**
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  @apply bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200;
  @apply bg-[length:1000px_100%];
  animation: shimmer 2s infinite linear;
}
```

**Fade In Up (on scroll):**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}
```

**Bounce In (CTA attention):**
```css
@keyframes bounceIn {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.bounce-in {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### 5.2 Page Transitions

```tsx
// Framer Motion Example
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  duration: 0.3,
  ease: "easeInOut"
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={pageTransition}
>
  {/* Page content */}
</motion.div>
```

### 5.3 Scroll Animations

**Recommended Library:** Intersection Observer API or Framer Motion

```tsx
// Fade in elements on scroll
const FadeInSection = ({ children }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      });
    });
    
    observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {children}
    </div>
  );
};
```

### 5.4 Loading States

**Spinner:**
```tsx
<div className="spinner">
  <div className="spinner-circle"></div>
</div>

// CSS
.spinner {
  @apply relative w-16 h-16;
}

.spinner-circle {
  @apply absolute w-full h-full rounded-full;
  @apply border-4 border-gray-200 border-t-teal-600;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Progress Bar:**
```tsx
<div className="progress-bar">
  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
</div>

// CSS
.progress-bar {
  @apply w-full h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-teal-500 to-emerald-500;
  @apply transition-all duration-300 ease-out;
  @apply relative overflow-hidden;
}

.progress-fill::after {
  content: '';
  @apply absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent;
  animation: shimmer 2s infinite;
}
```

---

## 6. Responsive Design Strategy

### 6.1 Breakpoints

```css
/* Mobile First Approach */
/* xs: 0-639px (default) */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### 6.2 Typography Scaling

```css
/* Mobile */
h1 { @apply text-2xl; }    /* 24px */
h2 { @apply text-xl; }     /* 20px */
body { @apply text-base; } /* 16px */

/* Tablet (md:) */
h1 { @apply md:text-3xl; } /* 30px */
h2 { @apply md:text-2xl; } /* 24px */

/* Desktop (lg:) */
h1 { @apply lg:text-4xl; } /* 36px */
h2 { @apply lg:text-3xl; } /* 30px */
```

### 6.3 Layout Patterns

**Hero Section:**
```tsx
<section className="py-12 md:py-24 lg:py-32">
  <div className="container px-4 md:px-6 lg:px-8">
    <h1 className="text-3xl md:text-5xl lg:text-6xl">
      Into the Wild
    </h1>
  </div>
</section>
```

**Grid Layouts:**
```css
/* Trek Cards Grid */
.trek-grid {
  @apply grid gap-6;
  @apply grid-cols-1;           /* Mobile: 1 column */
  @apply md:grid-cols-2;        /* Tablet: 2 columns */
  @apply lg:grid-cols-3;        /* Desktop: 3 columns */
  @apply xl:grid-cols-4;        /* Large: 4 columns */
}
```

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Priority: High**

- [ ] **1.1 Asset Setup**
  - Copy `prereq/itw_logo.jpg` to `public/itw_logo.jpg`
  - Create logo variants (small, favicon, og-image)
  - Update `index.html` favicon and meta tags

- [ ] **1.2 Color System**
  - Update `src/index.css` with Bold Adventure color tokens
  - Test light/dark mode compatibility
  - Document color usage in component stories

- [ ] **1.3 Typography**
  - Add Google Fonts link to `index.html`
  - Update CSS with Poppins + Inter font stack
  - Apply font weights across typography scale

- [ ] **1.4 Design Tokens**
  - Update `tailwind.config.ts` with new radius values
  - Add shadow system
  - Configure spacing system

### Phase 2: Core Components (Week 2)

**Priority: High**

- [ ] **2.1 Button System**
  - Refactor `src/components/ui/button.tsx`
  - Add all button variants (primary, secondary, accent, outline, ghost, icon)
  - Implement hover/active/disabled states
  - Add loading state support
  - Add ripple effect animation

- [ ] **2.2 Card Components**
  - Update base `Card` component with new styles
  - Create `TrekCard` component with hover effects
  - Add logo watermark integration
  - Implement image hover zoom

- [ ] **2.3 Input System**
  - Refactor input components with new styles
  - Add focus states with teal ring
  - Implement error/success states
  - Add icon support

- [ ] **2.4 Badge System**
  - Create badge component with variants
  - Add difficulty badges
  - Add status badges
  - Add featured badge with pulse animation

### Phase 3: Logo Integration (Week 2-3)

**Priority: High**

- [ ] **3.1 Header Logo** ✅ Selected
  - Replace MapPin icon with actual logo
  - Add hover scale effect
  - Implement responsive sizing
  - Test mobile/desktop views

- [ ] **3.2 Hero Section Backdrop** ✅ Selected (Option 1)
  - Add watermark logo to hero
  - Implement gradient background
  - Test opacity levels
  - Ensure accessibility (aria-hidden)

- [ ] **3.3 Loading Screen** ✅ Selected
  - Create LoadingScreen component
  - Add logo with pulse animation
  - Add bouncing dots
  - Integrate across app

- [ ] **3.4 Trek Cards Watermark** ✅ Selected
  - Add hover logo effect to cards
  - Test transition smoothness
  - Ensure no performance issues

- [ ] **3.5 Auth Pages Split Screen** ✅ Selected
  - Redesign Auth.tsx with split layout
  - Add logo branding side
  - Add stats display
  - Test responsive collapse to mobile

- [ ] **3.6 Empty States** ✅ Selected
  - Create EmptyState component
  - Add grayscale logo
  - Implement across app (no treks, no results, etc.)

### Phase 4: Advanced Features (Week 3-4)

**Priority: Medium**

- [ ] **4.1 Animations**
  - Add scroll-triggered animations
  - Implement page transitions
  - Add micro-interactions to buttons
  - Test performance on mobile

- [ ] **4.2 Enhanced Cards**
  - Add dashboard welcome card
  - Implement stat cards
  - Add profile cards
  - Create notification cards

- [ ] **4.3 Advanced Buttons**
  - Add shimmer effect to accent buttons
  - Implement button groups
  - Add floating action buttons
  - Create icon button variants

- [ ] **4.4 Loading States**
  - Create skeleton screens for cards
  - Add progress indicators
  - Implement shimmer loading
  - Add spinners

### Phase 5: Polish & Optimization (Week 4)

**Priority: Medium**

- [ ] **5.1 Responsive Testing**
  - Test on mobile devices (iPhone, Android)
  - Test on tablets (iPad)
  - Test on desktop (various resolutions)
  - Fix any layout issues

- [ ] **5.2 Accessibility**
  - Add aria labels
  - Test keyboard navigation
  - Ensure color contrast ratios
  - Add focus indicators

- [ ] **5.3 Performance**
  - Optimize logo images (WebP format)
  - Lazy load images
  - Minimize animation jank
  - Test Core Web Vitals

- [ ] **5.4 Documentation**
  - Create component library/Storybook
  - Document usage guidelines
  - Add code examples
  - Create design handoff docs

### Phase 6: Advanced Polish (Optional)

**Priority: Low**

- [ ] **6.1 Dark Mode**
  - Implement dark mode toggle
  - Update color tokens for dark theme
  - Test all components in dark mode

- [ ] **6.2 Advanced Animations**
  - Add parallax effects
  - Implement scroll-linked animations
  - Add cursor trail effects
  - Create hover 3D effects

- [ ] **6.3 Special Effects**
  - Add confetti on trek registration
  - Implement success animations
  - Add notification toasts with animations

---

## 📊 Component Inventory & Update Priority

### High Priority (Immediate Visual Impact)

| Component | File Path | Changes Required | Estimated Time |
|-----------|-----------|------------------|----------------|
| Header | `src/components/Header.tsx` | Logo replacement, styling | 1 hour |
| Hero Section | `src/pages/Index.tsx` | Backdrop, gradient, content | 2 hours |
| Button | `src/components/ui/button.tsx` | New variants, animations | 3 hours |
| Auth Page | `src/pages/Auth.tsx` | Split screen redesign | 3 hours |
| Loading Screen | New component | Create from scratch | 1.5 hours |

### Medium Priority (Enhanced Experience)

| Component | File Path | Changes Required | Estimated Time |
|-----------|-----------|------------------|----------------|
| Trek Cards | `src/components/trek/*` | Hover effects, watermark | 2 hours |
| Dashboard | `src/pages/Dashboard.tsx` | Welcome card, stats | 2.5 hours |
| Card | `src/components/ui/card.tsx` | New styles, shadows | 1 hour |
| Badge | New component | Create badge system | 1.5 hours |
| Empty States | Multiple files | Add across app | 2 hours |

### Low Priority (Nice to Have)

| Component | File Path | Changes Required | Estimated Time |
|-----------|-----------|------------------|----------------|
| Footer | `src/components/Footer.tsx` | Logo integration | 0.5 hour |
| Profile | `src/pages/Profile.tsx` | Enhanced UI | 1.5 hours |
| Notifications | Various | Toast animations | 2 hours |

---

## 🎯 Success Metrics

### Visual Quality
- [ ] Logo visible and recognizable across all pages
- [ ] Consistent color usage (teal primary, amber secondary, terracotta accent)
- [ ] Smooth animations (60fps, no jank)
- [ ] Professional polish (shadows, spacing, typography)

### User Experience
- [ ] Clear visual hierarchy
- [ ] Intuitive button placement
- [ ] Fast perceived performance (skeleton screens, optimistic UI)
- [ ] Accessible to all users (WCAG AA compliance)

### Brand Consistency
- [ ] Logo used consistently
- [ ] Color palette applied uniformly
- [ ] Typography scale followed
- [ ] Voice/tone matches playful yet professional brand

### Technical Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

---

## 📝 Notes & Recommendations

### Design Philosophy
The ITW logo is **playful, vibrant, and nature-focused**. Our UI should balance this fun spirit with modern professionalism:
- **Use bright colors** (teal, amber, terracotta) but not overwhelmingly
- **Round corners** (organic shapes) instead of sharp edges
- **Friendly animations** (bounce, scale, fade) instead of harsh transitions
- **Nature imagery** where appropriate (mountains, trees, trails)

### Accessibility Considerations
- Ensure 4.5:1 contrast ratio for body text
- Provide focus indicators for keyboard navigation
- Add alt text for all logos/images
- Test with screen readers
- Support reduced motion preferences

### Performance Tips
- Use WebP format for logo variants
- Lazy load images below the fold
- Minimize animation complexity on mobile
- Use CSS transforms for animations (GPU-accelerated)
- Debounce scroll event handlers

### Future Enhancements
- **Seasonal themes** (winter, monsoon, summer)
- **Gamification** (badges for completing treks)
- **Social proof** (user testimonials with photos)
- **Interactive maps** (trail previews)
- **Video backgrounds** (hero section with trek footage)

---

## ✅ Pre-Implementation Checklist

Before starting implementation, ensure:

- [x] Design system approved by stakeholders
- [ ] Logo files prepared and optimized
- [ ] Google Fonts account set up (or self-hosted fonts)
- [ ] Color tokens tested for accessibility
- [ ] Component inventory completed
- [ ] Development environment ready
- [ ] Git branch created for design system work
- [ ] Timeline confirmed with team

---

**Document Version:** 1.0  
**Last Updated:** October 5, 2025  
**Approved By:** Pending  
**Next Review:** After Phase 1 completion

