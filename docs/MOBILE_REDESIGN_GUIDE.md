# Mobile-First Redesign Guide
## Into the Wild - Golden Hour Theme

---

## Table of Contents
1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Component Patterns](#component-patterns)
7. [Animation Guidelines](#animation-guidelines)
8. [Accessibility](#accessibility)
9. [Asset Integration](#asset-integration)
10. [Best Practices](#best-practices)

---

## Overview

This guide documents the complete mobile-first redesign of the Into the Wild trekking application. The redesign focuses on creating a native app-like experience with a beautiful Golden Hour color theme that evokes the warm, natural beauty of outdoor adventures.

### Key Goals
- **Native App Feel**: Smooth animations, touch-optimized interactions, and mobile-first design
- **Golden Hour Theme**: Warm, nature-inspired colors that reflect the magic of golden hour
- **Performance**: Fast load times, optimized images, and efficient animations
- **Accessibility**: WCAG AA compliance, readable contrast ratios, and screen reader support

---

## Design Philosophy

### Golden Hour Inspiration

The Golden Hour is that magical time just after sunrise or before sunset when the light is soft, warm, and makes everything look beautiful. Our design captures this essence:

- **Warm Golden Tones**: Primary colors inspired by sunlight and warm sand
- **Deep Natural Teals**: Secondary colors from mountain shadows and water
- **Sunset Corals**: Accent colors from the warm glow of dusk
- **Earth Tones**: Supporting colors from nature (forest green, sky blue, earth brown)

### Mobile-First Approach

Every component is designed for mobile first, then enhanced for larger screens:

1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **One-Handed Use**: Primary actions within thumb reach (bottom third of screen)
3. **Safe Areas**: Respect iOS/Android notches and system UI
4. **Gesture Support**: Swipe, pull-to-refresh, and long-press interactions

---

## Color System

### Light Mode (Golden Hour)

#### Primary - Golden Sunlight
```css
--primary: 35 85% 65%;              /* #F4A460 - Main golden */
--primary-hover: 35 85% 55%;        /* Darker on interaction */
--primary-light: 35 85% 95%;        /* Light backgrounds */
--primary-foreground: 220 20% 20%; /* Dark text on golden */
```

**Usage:**
- Primary CTAs (buttons, links)
- Focus states and highlights
- Active navigation indicators
- Important badges and labels

#### Secondary - Deep Teal
```css
--secondary: 180 100% 27%;          /* #008B8B - Deep teal */
--secondary-hover: 180 100% 20%;
--secondary-light: 180 100% 95%;
--secondary-foreground: 0 0% 100%; /* White text on teal */
```

**Usage:**
- Secondary actions
- Information cards
- Navigation elements
- Supporting content

#### Accent - Sunset Coral
```css
--accent: 14 82% 62%;               /* #E97451 - Sunset coral */
--accent-hover: 14 82% 52%;
--accent-light: 14 82% 95%;
--accent-foreground: 0 0% 100%;
```

**Usage:**
- Call-to-action buttons
- Featured content
- Urgency indicators
- Special offers

### Dark Mode (Twilight)

Colors are muted and desaturated for comfortable night viewing:

- **Primary**: `35 75% 45%` (Dimmed golden)
- **Secondary**: `180 60% 35%` (Night teal)
- **Accent**: `14 70% 48%` (Muted coral)
- **Background**: `220 20% 12%` (Deep navy)

### Tailwind Classes

```tsx
// Light mode
<Button className="bg-primary hover:bg-primary-hover text-primary-foreground">

// Dark mode (automatically applied)
<Card className="bg-card dark:bg-card border dark:border">

// Golden hour colors
<div className="bg-golden-500 text-teal-700 border-coral-400">
```

---

## Typography

### Font Families

```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1, h2, h3, h4, h5, h6, .heading {
  font-family: 'Poppins', sans-serif;
}
```

### Type Scale (Mobile-Optimized)

```css
/* Fluid typography - scales with viewport */
--text-hero: clamp(2rem, 8vw, 4rem);         /* 32-64px */
--text-h1: clamp(1.5rem, 5vw, 2.25rem);      /* 24-36px */
--text-h2: clamp(1.25rem, 4vw, 1.875rem);    /* 20-30px */
--text-body: clamp(0.875rem, 2.5vw, 1rem);   /* 14-16px */
--text-small: clamp(0.75rem, 2vw, 0.875rem); /* 12-14px */
```

### Usage

```tsx
<h1 className="text-h1 font-bold text-foreground">
  Trek Adventures
</h1>

<p className="text-body text-muted-foreground leading-relaxed">
  Description text with comfortable reading line height
</p>
```

---

## Spacing & Layout

### Spacing System

```typescript
const spacing = {
  touch: '44px',      // Minimum touch target
  gap: '16px',        // Between interactive elements
  section: '24px',    // Between sections
  card: '16px',       // Card padding
  safe: '8px',        // Additional safe padding
};
```

### Safe Areas

```tsx
// iOS/Android notch support
<div className="pt-safe-top pb-safe-bottom px-safe-left">
  Content respects device safe areas
</div>

// Calculated safe padding
<nav className="pb-[calc(env(safe-area-inset-bottom)+64px)]">
  Content above bottom navigation
</nav>
```

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Desktops
  xl: '1280px',  // Large desktops
  '2xl': '1400px' // Extra large
};
```

---

## Component Patterns

### Cards

```tsx
// Interactive Trek Card
<Card className="card-interactive group">
  <div className="aspect-[16/9] relative overflow-hidden">
    <img 
      src={trek.image}
      className="transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
  </div>
  <CardContent className="p-4">
    {/* Content */}
  </CardContent>
</Card>
```

### Buttons

```tsx
// Primary golden button
<Button variant="default" size="lg" className="touch-ripple">
  Explore Treks
</Button>

// Accent coral gradient button
<Button variant="accent" size="lg">
  Register Now
</Button>

// Glass morphism button
<Button className="glass-card">
  Transparent Action
</Button>
```

### Navigation

```tsx
// Bottom Tab Bar (Mobile)
<nav className="fixed bottom-0 left-0 right-0 glass border-t">
  <ul className="flex justify-around h-16 pb-safe-bottom">
    <li><NavLink to="/home">Home</NavLink></li>
    <li><NavLink to="/events">Treks</NavLink></li>
  </ul>
</nav>
```

---

## Animation Guidelines

### Performance

**Use only transform and opacity for 60fps animations:**

```css
/* Good - GPU accelerated */
.card {
  transition: transform 0.3s, opacity 0.3s;
}

/* Bad - causes repaints */
.card {
  transition: width 0.3s, height 0.3s, margin 0.3s;
}
```

### Duration & Easing

```typescript
const animation = {
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',    // ease-in-out
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // bounce
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',     // ease-in
  },
};
```

### Common Animations

```tsx
// Fade in with scale
<div className="fade-in-scale">Content</div>

// Slide in from right (mobile navigation)
<div className="slide-in-right">Panel</div>

// Golden shimmer (loading)
<div className="skeleton-golden h-20 w-full rounded-lg" />

// Touch ripple effect
<button className="touch-ripple">Tap Me</button>
```

---

## Accessibility

### Contrast Ratios

All color combinations meet WCAG AA standards:

- **Normal text**: Minimum 4.5:1 contrast
- **Large text**: Minimum 3:1 contrast
- **UI components**: Minimum 3:1 contrast

### Screen Reader Support

```tsx
// Descriptive labels
<Button aria-label="Register for Mountain Trek">
  Register
</Button>

// Hidden text for screen readers
<span className="sr-only">Loading trek details</span>

// ARIA states
<nav aria-label="Main navigation">
  <NavLink aria-current="page">Home</NavLink>
</nav>
```

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Visible focus indicators on all focusable elements
- Skip links for main content
- Logical tab order

---

## Asset Integration

### Background Images

```tsx
// Hero section with itw_new_BG.jpg
<section className="relative h-screen">
  <img 
    src="/itw_new_BG.jpg"
    alt="Mountain landscape"
    className="absolute inset-0 w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-gradient-to-b from-golden-500/20 to-teal-900/40" />
</section>
```

### Triangle Button

```tsx
// Custom triangle button with asset
<button className="relative group h-20 w-full">
  <img 
    src="/Icon Trek Button Main trnsp.png"
    alt=""
    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
  />
  <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
    Explore Treks
  </span>
</button>
```

### Image Optimization

```tsx
// Lazy loading with blur placeholder
<img 
  src={trek.image}
  loading="lazy"
  className="blur-sm data-[loaded=true]:blur-0 transition-all duration-500"
  onLoad={(e) => e.currentTarget.dataset.loaded = 'true'}
/>
```

---

## Best Practices

### Performance

1. **Code Splitting**: Use React.lazy() for route-based splitting
2. **Image Optimization**: WebP format, lazy loading, responsive sizes
3. **Bundle Size**: Keep main bundle < 500KB gzipped
4. **Caching**: Leverage service workers for offline support

### Mobile UX

1. **Touch Targets**: Never smaller than 44x44px
2. **Spacing**: Minimum 8px between interactive elements
3. **Feedback**: Provide haptic/visual feedback for all interactions
4. **Loading States**: Show skeleton screens, not spinners

### Dark Mode

1. **Automatic Detection**: Respect system preference
2. **Manual Toggle**: Allow user override
3. **Persistence**: Save preference in localStorage
4. **Smooth Transitions**: Animate theme changes

### Testing

1. **Cross-Device**: Test on iOS Safari, Chrome Android
2. **Screen Sizes**: Test all breakpoints (320px to 2560px)
3. **Performance**: Lighthouse score 90+ for all metrics
4. **Accessibility**: Automated and manual a11y testing

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Aria](https://react-spectrum.adobe.com/react-aria/) - Accessible components
- [Framer Motion](https://www.framer.com/motion/) - Advanced animations
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Maintainer**: Into the Wild Development Team

