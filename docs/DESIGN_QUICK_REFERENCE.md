# Into The Wild - Design Quick Reference

> **Quick lookup guide for developers implementing the design system**

---

## 🎨 Color Palette Quick Reference

### Primary Colors (Copy-Paste Ready)

```css
/* Teal - Primary Actions */
bg-teal-600    #26A69A
hover:bg-teal-700
text-teal-600

/* Amber - Secondary/Highlights */
bg-amber-400   #FFC107
hover:bg-amber-500
text-amber-500

/* Terracotta - Accent/CTA */
bg-[#F2705D]
from-[#F2705D] to-orange-500
text-[#F2705D]

/* Sky Blue - Info */
bg-[#42A5F5]
text-[#42A5F5]

/* Green - Success */
bg-green-500   #4CAF50
```

### Gradients

```tsx
// Hero Background
className="bg-gradient-to-br from-teal-50 via-white to-amber-50"

// Premium Button
className="bg-gradient-to-r from-[#F2705D] to-orange-500"

// Auth Screen
className="bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-600"

// Card Overlay
className="bg-gradient-to-t from-black/60 via-transparent to-transparent"
```

---

## 📐 Spacing Quick Reference

```tsx
// Common Patterns
className="p-4"       // 16px - small padding
className="p-6"       // 24px - default card padding
className="p-8"       // 32px - large padding
className="py-12"     // 48px - section vertical
className="py-24"     // 96px - large section

// Gaps
className="gap-4"     // Between elements
className="gap-6"     // Between cards
className="gap-8"     // Between sections
```

---

## 🔘 Button Classes

```tsx
// Primary CTA
<button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
  Explore Treks
</button>

// Secondary
<button className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
  Learn More
</button>

// Accent (Register)
<button className="px-8 py-4 bg-gradient-to-r from-[#F2705D] to-orange-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
  Register Now
</button>

// Outline
<button className="px-6 py-3 border-2 border-teal-600 text-teal-600 font-semibold rounded-lg bg-white hover:bg-teal-50 hover:scale-[1.02] transition-all duration-300">
  View Details
</button>

// Ghost
<button className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-all duration-200">
  Cancel
</button>
```

---

## 🃏 Card Classes

```tsx
// Trek Card
<div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group">
  {/* Content */}
</div>

// Dashboard Card
<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
  {/* Content */}
</div>

// Featured Card
<div className="bg-gradient-to-br from-teal-50 via-white to-amber-50 rounded-2xl border border-gray-200 p-8 shadow-lg">
  {/* Content */}
</div>
```

---

## 🏷️ Badge Classes

```tsx
// Featured
<span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
  Featured
</span>

// Difficulty - Easy
<span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 border border-green-200 text-xs font-semibold rounded-full">
  Easy
</span>

// Difficulty - Moderate
<span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-full">
  Moderate
</span>

// Difficulty - Hard
<span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 border border-red-200 text-xs font-semibold rounded-full">
  Hard
</span>

// Status
<span className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold rounded-full">
  Open
</span>
```

---

## 📝 Input Classes

```tsx
// Standard Input
<input 
  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 hover:border-gray-400"
  placeholder="Enter your name"
/>

// Error State
<input 
  className="w-full px-4 py-3 rounded-lg border-2 border-red-500 bg-white text-gray-900 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
/>

// Success State
<input 
  className="w-full px-4 py-3 rounded-lg border-2 border-green-500 bg-white text-gray-900 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
/>
```

---

## 🖼️ Logo Usage

```tsx
// Header Logo
<img 
  src="/itw_logo.jpg" 
  alt="Into the Wild" 
  className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
/>

// Hero Backdrop
<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
  <img 
    src="/itw_logo.jpg" 
    alt="" 
    aria-hidden="true"
    className="w-[800px] h-auto object-contain opacity-[0.03] blur-[0.5px]"
  />
</div>

// Card Watermark (on hover)
<div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
  <img 
    src="/itw_logo.jpg" 
    alt="" 
    className="h-48 w-auto translate-x-8 translate-y-8 rotate-12"
  />
</div>

// Loading Screen
<img 
  src="/itw_logo.jpg" 
  alt="Into the Wild" 
  className="h-32 md:h-40 w-auto mx-auto animate-pulse"
/>

// Empty State
<img 
  src="/itw_logo.jpg" 
  alt="" 
  className="h-32 w-auto opacity-15 grayscale"
/>
```

---

## ✨ Common Animations

```css
/* Hover Lift */
.hover-lift {
  @apply transition-all duration-300 ease-out;
  @apply hover:-translate-y-1 hover:shadow-xl;
}

/* Hover Grow */
.hover-grow {
  @apply transition-transform duration-300 ease-out;
  @apply hover:scale-105;
}

/* Fade In */
.fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Fade In Up */
.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

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

/* Scale In */
.scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

---

## 📱 Responsive Patterns

```tsx
// Typography Scaling
<h1 className="text-3xl md:text-5xl lg:text-6xl font-bold">
  Into the Wild
</h1>

// Padding Scaling
<section className="py-12 md:py-24 lg:py-32">
  {/* Content */}
</section>

// Grid Layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Cards */}
</div>

// Show/Hide
<div className="hidden md:block">Desktop Only</div>
<div className="md:hidden">Mobile Only</div>

// Flex Direction
<div className="flex flex-col md:flex-row gap-4">
  {/* Items */}
</div>
```

---

## 🎭 Common Patterns

### Hero Section
```tsx
<section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50">
  {/* Logo Backdrop */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <img 
      src="/itw_logo.jpg" 
      alt="" 
      aria-hidden="true"
      className="w-[600px] md:w-[800px] h-auto object-contain opacity-[0.03] blur-[0.5px]"
    />
  </div>
  
  {/* Content */}
  <div className="relative z-10 container mx-auto px-4">
    <div className="flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
        Into the Wild
      </h1>
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
        Discover breathtaking treks and connect with a community of adventurers.
      </p>
      <button className="px-8 py-4 bg-gradient-to-r from-[#F2705D] to-orange-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
        Explore Treks
      </button>
    </div>
  </div>
</section>
```

### Trek Card
```tsx
<div className="group bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
  {/* Image */}
  <div className="relative h-56 overflow-hidden">
    <img 
      src={trek.image} 
      alt={trek.title}
      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
    
    {/* Logo Watermark */}
    <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
      <img src="/itw_logo.jpg" alt="" className="h-32 w-auto translate-x-4 translate-y-4 rotate-12" />
    </div>
    
    {/* Badges */}
    <div className="absolute top-4 right-4">
      <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold rounded-full">
        Featured
      </span>
    </div>
  </div>
  
  {/* Content */}
  <div className="p-6">
    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
      {trek.title}
    </h3>
    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
      {trek.description}
    </p>
    
    {/* Footer */}
    <div className="flex items-center justify-between">
      <div className="text-2xl font-bold text-teal-600">
        ₹{trek.price}
      </div>
      <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors">
        View Details
      </button>
    </div>
  </div>
</div>
```

### Loading Skeleton
```tsx
<div className="animate-pulse">
  <div className="h-56 bg-gray-200 rounded-t-xl mb-4"></div>
  <div className="px-6">
    <div className="h-6 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="flex justify-between">
      <div className="h-8 w-20 bg-gray-200 rounded"></div>
      <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
</div>
```

---

## 🔍 Component Finder

Need to update a specific element? Here's where to find it:

| Element | File Path |
|---------|-----------|
| Header Logo | `src/components/Header.tsx` line 37 |
| Hero Section | `src/pages/Index.tsx` line 18 |
| Main Button | `src/components/ui/button.tsx` |
| Trek Cards | `src/components/trek/TrekEventsList.tsx` |
| Auth Page | `src/pages/Auth.tsx` |
| Dashboard | `src/pages/Dashboard.tsx` |
| Footer | `src/components/Footer.tsx` |
| Loading | Create `src/components/LoadingScreen.tsx` |
| Empty State | Create `src/components/EmptyState.tsx` |

---

## 📦 New Files to Create

1. **LoadingScreen.tsx** - Full-screen loading with logo animation
2. **EmptyState.tsx** - Reusable empty state component
3. **Badge.tsx** - Badge component with variants
4. **TrekCard.tsx** - Standardized trek card component

---

## ⚡ Performance Tips

- Use `loading="lazy"` for images below the fold
- Add `will-change: transform` for frequently animated elements
- Use CSS transforms instead of position changes
- Debounce scroll events
- Use Intersection Observer for scroll animations

---

**Quick Tip:** Keep this file open while implementing for easy copy-paste of classes!
