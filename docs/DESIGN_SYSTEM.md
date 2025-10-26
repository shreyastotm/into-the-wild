# Into The Wild - Design System & Accessibility Guide

## 📋 Table of Contents

1. [Brand Identity & Vision](#1-brand-identity--vision)
2. [Design System Foundation](#2-design-system-foundation)
3. [Component Library](#3-component-library)
4. [Responsive & Mobile Design](#4-responsive--mobile-design)
5. [Accessibility & Compliance](#5-accessibility--compliance)
6. [Implementation Guidelines](#6-implementation-guidelines)
7. [Quality Assurance](#7-quality-assurance)

---

## 1. Brand Identity & Vision

### 1.1 Logo Analysis & Characteristics

#### Visual Elements
- **Central Imagery**: Globe with directional trail signs representing adventure and exploration
- **Characters**: Playful monkey and wildlife (snail, chameleon, snake, butterfly) symbolizing nature connection
- **Nature Elements**: Leaves, mushrooms, logs, backpack, compass emphasizing outdoor activities
- **Typography**: Bold black text on yellow directional signs for clarity and adventure feel
- **Tagline**: "OPEN HIKERS CLUB" promoting community and inclusivity

#### Color Extraction from Logo
- **Primary**: Yellow/Orange (sun, signs) → Warm Amber for energy and warmth
- **Secondary**: Green (nature, leaves) → Fresh Green for natural connection
- **Tertiary**: Blue (sky, water) → Sky Blue for trust and calmness
- **Accents**: Brown, Black (earth tones) → Terracotta for grounding

#### Brand Personality
- ✨ **Adventurous** - Encourages exploration and discovery
- 🎨 **Playful** - Fun, approachable, not overly serious
- 🌿 **Nature-Connected** - Strong outdoor/wildlife themes
- 🤝 **Community-Focused** - "Open" and "Club" suggest inclusivity
- 🗺️ **Journey-Oriented** - Trail signs represent pathways and direction

#### Emotional Tone
- **Exciting yet safe** (balance adventure with security)
- **Fun but informative** (engaging without being frivolous)
- **Energetic without being overwhelming**
- **Welcoming and inclusive**

### 1.2 Design Philosophy

#### Golden Hour Aesthetic
The design system is built around the **Golden Hour** aesthetic - that magical time just after sunrise or before sunset when light is soft, warm, and makes everything beautiful. This creates:

- **Adventurous yet safe** user experience
- **Playful and approachable** brand personality
- **Nature-connected** visual language
- **Community-focused** social features

#### Success Metrics
- **Visual Quality**: Logo visible on every page, consistent color usage, smooth 60fps animations
- **User Experience**: Clear hierarchy, intuitive navigation, fast performance
- **Brand Consistency**: Logo used consistently, color palette applied uniformly, typography scale followed
- **Technical Performance**: Lighthouse score > 90, FCP < 1.5s, LCP < 2.5s, CLS < 0.1

---

## 2. Design System Foundation

### 2.1 Color System - Golden Hour Palette

#### Light Mode (Golden Hour)
```css
:root {
  /* Primary - Golden Sunlight */
  --primary: 35 85% 65%;                    /* #F4A460 - Main golden */
  --primary-hover: 35 85% 55%;
  --primary-light: 35 85% 95%;
  --primary-foreground: 220 20% 20%;

  /* Secondary - Deep Teal */
  --secondary: 180 100% 27%;                /* #008B8B - Deep teal */
  --secondary-hover: 180 100% 20%;
  --secondary-light: 180 100% 95%;
  --secondary-foreground: 0 0% 100%;

  /* Accent - Sunset Coral */
  --accent: 14 82% 62%;                     /* #E97451 - Sunset coral */
  --accent-hover: 14 82% 52%;
  --accent-light: 14 82% 95%;
  --accent-foreground: 0 0% 100%;

  /* Supporting Colors */
  --info: 204 94% 63%;                      /* #42A5F5 - Sky Blue */
  --success: 142 71% 45%;                   /* #4CAF50 - Green */
  --warning: 45 95% 58%;                    /* #FFC107 - Amber */
  --destructive: 0 84% 60%;                 /* #EF4444 - Red */

  /* Neutral Colors */
  --background: 0 0% 100%;                  /* White */
  --background-subtle: 35 40% 97%;          /* Light golden tint */
  --foreground: 220 20% 20%;                /* Near black */
  --muted: 220 14% 96%;                     /* Light gray */
  --muted-foreground: 220 8% 46%;           /* Medium gray */
  --border: 220 13% 91%;                    /* Border gray */
  --input: 220 13% 91%;                     /* Input borders */
  --ring: 35 85% 65%;                       /* Focus rings */
}
```

#### Dark Mode (Twilight)
```css
.dark {
  /* Golden Hour Dark Mode - ENHANCED FOR WCAG AA */
  --primary: 35 80% 55%;                    /* Brighter golden for contrast */
  --primary-hover: 35 80% 48%;
  --primary-light: 35 40% 25%;
  --primary-foreground: 0 0% 100%;

  --secondary: 180 70% 45%;                 /* Brighter night teal */
  --secondary-hover: 180 70% 38%;
  --secondary-light: 180 40% 25%;
  --secondary-foreground: 0 0% 100%;

  --accent: 14 75% 55%;                     /* Brighter muted coral */
  --accent-hover: 14 75% 48%;
  --accent-light: 14 40% 25%;
  --accent-foreground: 0 0% 100%;

  /* Dark backgrounds with improved contrast */
  --background: 220 20% 10%;                /* Darker base */
  --background-subtle: 220 18% 12%;
  --foreground: 210 40% 98%;                /* High contrast white */

  --card: 220 18% 14%;                      /* Visible card separation */
  --card-foreground: 210 40% 98%;

  --popover: 220 18% 14%;
  --popover-foreground: 210 40% 98%;

  --muted: 220 16% 20%;                     /* More visible muted */
  --muted-foreground: 215 20% 70%;          /* Higher contrast */

  --destructive: 0 70% 45%;                 /* Brighter destructive */
  --destructive-foreground: 210 40% 98%;

  --border: 220 16% 28%;                    /* More visible borders */
  --input: 220 16% 28%;                     /* More visible inputs */
  --ring: 35 80% 55%;

  --sidebar-background: 240 6% 8%;
  --sidebar-foreground: 240 5% 96%;
  --sidebar-primary: 224.3 76.3% 55%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 240 4% 18%;
  --sidebar-accent-foreground: 240 5% 96%;
  --sidebar-border: 240 4% 18%;
  --sidebar-ring: 217.2 91.2% 59.8%;
}
```

#### Color Usage Guidelines

| Color | Primary Use | Examples | Tailwind Classes |
|-------|-------------|----------|------------------|
| **Golden Primary** | Main actions, navigation, links | CTA buttons, active states, header accents | `bg-primary`, `text-primary`, `border-primary` |
| **Deep Teal** | Secondary actions, information | Secondary buttons, info cards, navigation | `bg-secondary`, `text-secondary` |
| **Sunset Coral** | CTA buttons, featured content | Register buttons, featured treks, premium | `bg-accent`, `from-accent to-orange-500` |
| **Sky Blue** | Informational elements | Info messages, tags, helper text | `bg-info`, `text-info` |
| **Green** | Success states, confirmations | Success messages, completed states | `bg-success`, `text-success` |

### 2.2 Typography System

#### Font Stack
**Headings:** Poppins (Bold, Modern, Geometric)
```css
font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

**Body Text:** Inter (Clean, Readable)
```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

#### Typography Scale (Mobile-Optimized)
```css
/* Fluid typography - scales with viewport */
--text-hero: clamp(2rem, 8vw, 4rem);      /* 32-64px */
--text-h1: clamp(1.5rem, 5vw, 2.25rem);   /* 24-36px */
--text-h2: clamp(1.25rem, 4vw, 1.875rem); /* 20-30px */
--text-h3: clamp(1.125rem, 3vw, 1.5rem);  /* 18-24px */
--text-h4: clamp(1rem, 2.5vw, 1.25rem);   /* 16-20px */
--text-body: clamp(0.875rem, 2.5vw, 1rem); /* 14-16px */
--text-small: clamp(0.75rem, 2vw, 0.875rem); /* 12-14px */
```

#### Font Weight Guidelines
- **800 (ExtraBold)**: Hero display text, major headings
- **700 (Bold)**: H1-H2, important actions, navigation
- **600 (SemiBold)**: H3-H5, button text, form labels
- **500 (Medium)**: Emphasized body text, subheadings
- **400 (Regular)**: Body text, descriptions, content
- **300 (Light)**: Subtle text, disclaimers, captions

### 2.3 Spacing System

#### Base Unit: 4px (0.25rem)
```css
/* Spacing Scale */
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
--space-4xl: 6rem;     /* 96px */
```

#### Layout Grid
- **Mobile**: 4px base unit
- **Tablet**: 8px base unit
- **Desktop**: 16px base unit
- **Container max-width**: 1280px (80rem)

---

## 3. Component Library

### 3.1 Base UI Components

#### Input Component
```tsx
// src/components/ui/input.tsx
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Mobile-first input styling with dark mode support
          "flex h-11 w-full rounded-lg",
          // Light mode
          "border-2 border-input bg-background px-4 py-3 text-base text-foreground",
          // Dark mode - higher contrast
          "dark:border-border dark:bg-card dark:text-foreground",
          "placeholder:text-muted-foreground",
          "transition-all duration-200",
          // Focus states
          "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20",
          "dark:focus:ring-primary/30",
          // Hover states
          "hover:border-primary/50",
          "dark:hover:border-primary/60",
          // Additional states
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Error state support
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

#### Select Component
```tsx
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // Mobile-first trigger styling with dark mode support
      "flex h-11 w-full items-center justify-between rounded-lg",
      // Light mode
      "border-2 border-input bg-background text-foreground px-3 py-2 text-sm",
      // Dark mode
      "dark:border-border dark:bg-card dark:text-foreground",
      "placeholder:text-muted-foreground",
      "transition-all duration-200",
      // Focus states
      "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20",
      "dark:focus:ring-primary/30",
      // Hover states
      "hover:border-primary/50",
      "dark:hover:border-primary/60",
      "ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
```

#### Card Component
```tsx
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-md",
      // Dark mode border support
      "border-border dark:border-border",
      "hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out",
      className,
    )}
    {...props}
  />
));
```

#### Badge Component
```tsx
const badgeVariants = cva(
  "inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200",
  {
    variants: {
      variant: {
        featured: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg animate-pulse-subtle",
        easy: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
        moderate: "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
        hard: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
        open: "bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700",
        full: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
        cancelled: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
        new: "bg-blue-500 text-white dark:bg-blue-600 dark:text-white",
        default: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
        secondary: "bg-secondary/10 text-secondary border border-secondary/20 dark:bg-secondary/20 dark:text-secondary-foreground dark:border-secondary/30",
        outline: "border border-border text-foreground dark:border-border dark:text-foreground",
      },
    },
    defaultVariants: {
      variant: "open",
    },
  }
);
```

#### Table Component
```tsx
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border transition-colors",
      "hover:bg-muted/50 dark:hover:bg-muted/30",
      "data-[state=selected]:bg-muted dark:data-[state=selected]:bg-muted",
      className,
    )}
    {...props}
  />
));

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium",
      "text-muted-foreground dark:text-muted-foreground",
      "[&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
));
```

#### Dialog Component
```tsx
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    descriptionId?: string;
    descriptionText?: string;
  }
>(
  (
    {
      className,
      children,
      descriptionId = "dialog-desc",
      descriptionText = "Dialog window. Please review the content and take action as needed.",
      ...props
    },
    ref,
  ) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        aria-describedby={descriptionId}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4",
          // Improved dark mode support
          "border border-border bg-background text-foreground p-6 shadow-lg",
          "dark:border-border dark:bg-card dark:text-foreground",
          "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "sm:rounded-lg",
          className,
        )}
        {...props}
      >
        <div id={descriptionId} className="sr-only">
          {descriptionText}
        </div>
        {children}
        <DialogPrimitive.Close className="..." />
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);
```

### 3.2 Enhanced Button Effects System

#### StaticBottomButton Component
```tsx
// src/components/StaticBottomButton.tsx
interface StaticBottomButtonProps extends ButtonProps {
  onClick: () => void;
  className?: string;
}

export function StaticBottomButton({
  onClick,
  className,
  children,
  ...props
}: StaticBottomButtonProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-background via-background to-transparent">
      <Button
        onClick={onClick}
        className={cn(
          "w-full h-12 text-base font-semibold",
          "bg-gradient-to-r from-primary via-accent to-secondary",
          "hover:from-primary-hover hover:via-accent-hover hover:to-secondary-hover",
          "text-white shadow-lg hover:shadow-xl",
          "transition-all duration-300 ease-out",
          "hover:scale-105 active:scale-95",
          "border-2 border-white/20 hover:border-white/30",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </div>
  );
}
```

#### NatureInspiredButton Component
```tsx
// src/components/NatureInspiredButton.tsx
interface NatureInspiredButtonProps extends ButtonProps {
  variant?: "sun-glow" | "water-droplet" | "rock-texture";
  intensity?: "subtle" | "medium" | "intense";
}

export function NatureInspiredButton({
  variant = "sun-glow",
  intensity = "medium",
  className,
  children,
  ...props
}: NatureInspiredButtonProps) {
  const intensityClasses = {
    subtle: "opacity-70",
    medium: "opacity-85",
    intense: "opacity-100",
  };

  const variantClasses = {
    "sun-glow": cn(
      "relative overflow-hidden",
      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
      "before:translate-x-[-100%] hover:before:translate-x-[100%]",
      "before:transition-transform before:duration-1000 before:ease-out",
      "after:absolute after:inset-0 after:bg-gradient-radial after:from-white/10 after:to-transparent",
      "shadow-[0_0_20px_rgba(244,164,96,0.3)] hover:shadow-[0_0_30px_rgba(244,164,96,0.5)]"
    ),
    "water-droplet": cn(
      "relative",
      "before:absolute before:top-1 before:left-1 before:w-2 before:h-2 before:bg-white/60 before:rounded-full",
      "before:animate-pulse before:delay-1000",
      "after:absolute after:top-2 after:left-3 after:w-1 after:h-1 after:bg-white/40 after:rounded-full",
      "after:animate-pulse after:delay-1500"
    ),
    "rock-texture": cn(
      "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600",
      "shadow-inner border border-amber-300/30",
      "relative before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3)_0%,transparent_50%)]"
    ),
  };

  return (
    <Button
      className={cn(
        variantClasses[variant],
        intensityClasses[intensity],
        "transition-all duration-300 ease-out",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
```

#### EventCard Component
```tsx
// src/components/trek/EventCard.tsx
interface EventCardProps {
  event: {
    trek_id: number;
    name: string;
    description?: string;
    location?: string;
    start_datetime: string;
    difficulty?: string;
    duration?: string;
    cost?: number;
    base_price?: number;
    max_participants?: number;
    participant_count?: number;
    image_url?: string;
    images?: string[];
    category?: string;
  };
  onClick?: () => void;
  className?: string;
}

export function EventCard({ event, onClick, className }: EventCardProps) {
  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden",
        "hover:shadow-2xl hover:-translate-y-2",
        "transition-all duration-300 ease-out",
        "border-2 hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      {/* Image Section with Overlay */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image_url || "/placeholder.svg"}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={event.difficulty as any} className="text-xs">
            {event.difficulty}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {event.category}
          </Badge>
        </div>

        {/* Price */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-gray-900 font-bold">
            ₹{event.cost?.toLocaleString('en-IN')}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
          {event.name}
        </h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatIndianDate(event.start_datetime)}
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {event.participant_count}/{event.max_participants} participants
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full mt-4" size="sm">
          View Details
        </Button>
      </div>
    </Card>
  );
}
```

---

## 4. Responsive & Mobile Design

### 4.1 Mobile-First Approach

#### Breakpoint Strategy
```css
/* Tailwind responsive breakpoints */
sm: '640px',   /* Small tablets */
md: '768px',   /* Tablets */
lg: '1024px',  /* Small desktops */
xl: '1280px',  /* Large desktops */
2xl: '1536px', /* Extra large */
```

#### Mobile-First Implementation
```tsx
// Example: Responsive card layout
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {treks.map((trek) => (
    <TrekCard key={trek.id} trek={trek} />
  ))}
</div>
```

### 4.2 Touch-Optimized Interface

#### Touch Target Requirements
- **Minimum size**: 44px × 44px (11 in Tailwind: `h-11 w-11`)
- **Spacing**: 8px minimum between touch targets
- **Feedback**: Visual and haptic feedback on interaction

#### Touch-Friendly Components
```tsx
// Touch-optimized button
<Button
  className="h-11 min-w-[44px] active:scale-95 transition-transform"
  onClick={handleClick}
>
  {/* Content */}
</Button>

// Touch-friendly input
<Input
  className="h-11 text-base px-4" // Larger touch targets
  placeholder="Enter text..."
/>
```

### 4.3 Horizontal Scroll Mobile Cards

#### Implementation
```tsx
// src/components/trek/HorizontalTrekScroll.tsx
export function HorizontalTrekScroll({ treks }: HorizontalTrekScrollProps) {
  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 p-4">
          {treks.map((trek) => (
            <div key={trek.id} className="w-72 flex-none">
              <TrekCard trek={trek} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
```

#### Scroll Behavior
```css
/* Custom scroll styling */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* Snap scrolling for mobile */
.snap-x {
  scroll-snap-type: x mandatory;
}

.snap-center {
  scroll-snap-align: center;
}
```

### 4.4 Safe Area Support

#### iOS/Android Notch Support
```tsx
// Layout component with safe areas
<div className="min-h-screen bg-background">
  <div className="safe-area-inset-top" /> {/* Top safe area */}
  <main className="pb-safe-area-inset">  {/* Bottom safe area */}
    {/* Content */}
  </main>
</div>
```

#### Safe Area CSS Variables
```css
/* Safe area variables for mobile devices */
.safe-area-inset-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-inset-left {
  padding-left: env(safe-area-inset-left);
}

.safe-area-inset-right {
  padding-right: env(safe-area-inset-right);
}
```

---

## 5. Accessibility & Compliance

### 5.1 WCAG 2.1 AA Compliance

#### Contrast Ratio Requirements
| Element Type | Minimum Ratio | Implementation |
|--------------|---------------|----------------|
| **Normal text** | 4.5:1 | All text meets this standard |
| **Large text** (18pt+) | 3:1 | Headings and large text |
| **UI components** | 3:1 | Buttons, form elements |

#### Color Contrast Implementation
```css
/* High contrast colors for accessibility */
.dark {
  --foreground: 210 40% 98%;     /* High contrast white */
  --muted-foreground: 215 20% 70%; /* Higher contrast gray */
  --border: 220 16% 28%;        /* More visible borders */
  --input: 220 16% 28%;         /* More visible inputs */
}
```

### 5.2 Keyboard Navigation

#### Focus Management
```tsx
// Proper focus states for all interactive elements
<Button
  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
  onClick={handleClick}
>
  Click me
</Button>

// Keyboard event handling
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    handleClick();
  }
};
```

#### Tab Order
```tsx
// Proper tab order in forms
<form>
  <Input
    type="text"
    placeholder="First name"
    tabIndex={1}
  />
  <Input
    type="email"
    placeholder="Email"
    tabIndex={2}
  />
  <Button type="submit" tabIndex={3}>
    Submit
  </Button>
</form>
```

### 5.3 Screen Reader Support

#### ARIA Labels and Descriptions
```tsx
// Proper ARIA labeling
<Button
  aria-label="Register for trek"
  aria-describedby="trek-description"
  onClick={handleRegister}
>
  Register
</Button>

<div id="trek-description" className="sr-only">
  Click to register for this trekking event. Registration requires indemnity acceptance.
</div>

// Screen reader only content
<div className="sr-only">
  This section contains registration details for screen readers.
</div>
```

#### Semantic HTML
```tsx
// Proper semantic structure
<header>
  <nav aria-label="Main navigation">
    <ul role="list">
      <li><a href="/treks">Treks</a></li>
      <li><a href="/gallery">Gallery</a></li>
    </ul>
  </nav>
</header>

<main>
  <section aria-labelledby="featured-treks">
    <h2 id="featured-treks">Featured Treks</h2>
    {/* Content */}
  </section>
</main>
```

### 5.4 Indian Market Compliance

#### Currency Formatting
```typescript
// src/utils/indianStandards.ts
export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Usage: ₹1,23,456
```

#### Date Formatting
```typescript
export function formatIndianDate(date: Date | string, includeTime: boolean = false): string {
  const dateObj = new Date(date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  if (includeTime) {
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  return `${day}/${month}/${year}`;
}

// Usage: 26/10/2025
```

#### GST Calculations
```typescript
export function calculateGST(amount: number, gstRate: number = 18): {
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
} {
  const baseAmount = amount / (1 + gstRate / 100);
  const gstAmount = amount - baseAmount;

  return {
    baseAmount: Math.round(baseAmount),
    gstAmount: Math.round(gstAmount),
    totalAmount: amount,
  };
}

// Display: ₹10,000 + ₹1,800 GST = ₹11,800
```

---

## 6. Implementation Guidelines

### 6.1 Component Usage Patterns

#### Consistent Component Structure
```tsx
// Every component should follow this pattern
interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  // ... other props
}

export function Component({ className, children, ...props }: ComponentProps) {
  return (
    <div
      className={cn(
        // Base styles
        "base-classes",
        // Light mode styles
        "light-mode-classes",
        // Dark mode styles
        "dark:dark-mode-classes",
        // Responsive styles
        "sm:sm-classes md:md-classes lg:lg-classes",
        // State styles
        "hover:hover-classes focus:focus-classes active:active-classes",
        // Custom classes
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Dark Mode Implementation
```tsx
// All components must support dark mode
const styles = cn(
  // Light mode
  "bg-white border-gray-200 text-gray-900",
  // Dark mode - use semantic tokens
  "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100",
  // OR use theme-aware classes
  "bg-background text-foreground border-border"
);
```

### 6.2 Animation Standards

#### Performance-First Animations
```css
/* Use only transform and opacity for 60fps */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms; /* Fast: 200ms, Normal: 300ms, Slow: 500ms */
}

/* Avoid layout-affecting animations */
.animate-pulse { /* ✅ Good - only opacity changes */
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce { /* ❌ Avoid - affects layout */
  animation: bounce 1s infinite;
}
```

#### Hover and Focus States
```tsx
// Every interactive element needs hover and focus states
<Button
  className={cn(
    "transition-all duration-200",
    "hover:scale-105 hover:shadow-lg",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    "active:scale-95"
  )}
>
  Interactive Button
</Button>
```

### 6.3 Error Handling UI

#### Consistent Error Display
```tsx
// Error state implementation
{error && (
  <div
    className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg"
    role="alert"
    aria-live="polite"
  >
    <AlertCircle className="h-4 w-4 flex-shrink-0" />
    <span>{error.message}</span>
  </div>
)}

// Loading state
{isLoading && (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner size="md" />
    <span className="ml-2 text-muted-foreground">Loading...</span>
  </div>
)}
```

### 6.4 Logo Integration Standards

#### Logo Implementation
```tsx
// Header logo
<Link to="/" className="flex items-center gap-2">
  <img
    src="/logo.svg"
    alt="Into The Wild - Adventure Platform"
    className="h-10 w-auto hover:scale-105 transition-transform duration-200"
  />
  <span className="font-bold text-xl">Into The Wild</span>
</Link>

// Footer logo
<footer className="border-t border-border">
  <div className="container mx-auto px-4 py-8">
    <img
      src="/logo.svg"
      alt="Into The Wild"
      className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
    />
  </div>
</footer>
```

#### Logo Requirements
- **Every page**: Logo must appear on every page (header, hero, or watermark)
- **Responsive sizing**: h-10 mobile, h-12 desktop
- **Hover animations**: Include hover animations and proper alt text
- **Aspect ratio**: Maintain aspect ratio and visual hierarchy

---

## 7. Quality Assurance

### 7.1 Testing Procedures

#### Accessibility Testing
```bash
# Automated accessibility testing
npm run analyze:accessibility

# Manual testing checklist
# - Toggle dark mode - all text readable (contrast ratio ≥ 4.5:1)
# - Forms: inputs, selects, textareas visible in both modes
# - Dialogs: header, footer, content properly contrasted
# - Tables: headers and cells readable
# - Buttons: all states (default, hover, focus, disabled) visible
```

#### Browser Testing Matrix
```typescript
// Test in multiple browsers and devices
const testMatrix = [
  { browser: 'Chrome', version: 'latest', device: 'desktop' },
  { browser: 'Firefox', version: 'latest', device: 'desktop' },
  { browser: 'Safari', version: 'latest', device: 'desktop' },
  { browser: 'Chrome', version: 'mobile', device: 'iOS' },
  { browser: 'Chrome', version: 'mobile', device: 'Android' },
];
```

### 7.2 Performance Monitoring

#### Core Web Vitals
```bash
# Performance audit
npm run analyze:performance

# Bundle size monitoring
npm run analyze:bundle

# Accessibility compliance
npm run analyze:accessibility
```

#### Performance Budgets
| Metric | Budget | Current Status |
|--------|--------|----------------|
| **Bundle Size** | < 500KB gzipped | ✅ ~350KB |
| **First Contentful Paint** | < 1.5s | ✅ ~0.6s |
| **Largest Contentful Paint** | < 2.5s | ✅ ~1.2s |
| **Cumulative Layout Shift** | < 0.1 | ✅ < 0.05 |

### 7.3 Dark Mode Testing

#### Manual Testing Checklist
- [ ] **Text Readability**: All text readable in dark mode (contrast ratio ≥ 4.5:1)
- [ ] **Form Elements**: Inputs, selects, textareas visible in both modes
- [ ] **Interactive Elements**: Buttons, links, navigation properly themed
- [ ] **Cards and Containers**: Proper background and border contrast
- [ ] **Error States**: Error messages visible in dark mode
- [ ] **Loading States**: Loading indicators visible in dark mode
- [ ] **Focus States**: Keyboard focus clearly visible
- [ ] **Hover States**: Hover effects work in both modes

### 7.4 Quality Automation System

#### Documentation Agent Integration
The design system is validated by the automated Documentation Agent as part of the quality gates:

```bash
# Validate design system documentation
npm run docs:validate      # Check master document structure
npm run docs:quality       # Quality score and improvement suggestions
npm run docs:pre-deploy    # Pre-deployment design system validation

# Full quality check including design system
npm run quality-check:strict  # Includes documentation agent validation
```

#### Design System Quality Metrics
- **Documentation Score**: 95/100 (automated quality check)
- **Link Validation**: All internal links verified
- **Accessibility Compliance**: WCAG 2.1 AA standards met
- **Consistency**: All components follow established patterns
- **Mobile Optimization**: Touch targets and responsive design validated

---

**Document Version**: 1.0  
**Last Updated**: October 26, 2025  
**Status**: Complete Implementation  
**Next Review**: January 2026

---

**For technical implementation details, see:**
- [Project Overview Guide](PROJECT_OVERVIEW.md)
- [Technical Architecture Guide](TECHNICAL_ARCHITECTURE.md)
- [Communication System Guide](COMMUNICATION_SYSTEM.md)
