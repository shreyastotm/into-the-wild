/**
 * Golden Hour Color System for Into the Wild
 *
 * Inspired by the warm glow of golden hour - the magical time when
 * nature's colors are most vibrant and beautiful.
 */

export const goldenHourTheme = {
  light: {
    // Primary - Golden Sunlight
    golden: {
      50: "bg-primary", // Lightest dawn
      100: "bg-primary", // Morning glow
      200: "bg-primary", // Soft golden
      300: "bg-primary", // Bright gold
      400: "bg-primary", // Rich golden
      500: "bg-primary", // Main golden (sandy brown)
      600: "bg-primary", // Deep golden
      700: "bg-primary", // Sunset gold
      800: "bg-primary", // Amber
      900: "bg-primary", // Deep amber
    },

    // Secondary - Twilight Teal
    teal: {
      50: "bg-primary", // Misty morning
      100: "bg-primary", // Light aqua
      200: "bg-primary", // Soft teal
      300: "bg-primary", // Medium teal
      400: "bg-primary", // Current primary
      500: "bg-primary", // Deep teal (main)
      600: "bg-primary", // Forest teal
      700: "bg-primary", // Dark teal
      800: "bg-primary", // Deep forest
      900: "bg-primary", // Night teal
    },

    // Accent - Sunset Coral
    coral: {
      50: "bg-primary", // Peach dawn
      100: "bg-primary", // Light peach
      200: "bg-primary", // Soft coral
      300: "bg-primary", // Warm coral
      400: "bg-primary", // Bright coral
      500: "bg-primary", // Main coral/terracotta
      600: "bg-primary", // Deep coral
      700: "bg-primary", // Burnt orange
      800: "bg-primary", // Terra cotta
      900: "bg-primary", // Deep earth
    },

    // Nature Accents
    forest: "bg-primary", // Deep green for success
    sky: "bg-primary", // Clear blue for info
    earth: "bg-primary", // Brown for grounded elements
    sand: "bg-primary", // Neutral light background
    mist: "bg-primary", // Very light neutral
  },

  dark: {
    // Twilight/Night versions (20-30% darker, desaturated)
    golden: {
      500: "bg-primary", // Dark goldenrod
      600: "bg-primary", // Deeper gold
      700: "bg-primary", // Night gold
    },
    teal: {
      500: "bg-primary", // Night teal
      600: "bg-primary", // Deep night
      700: "bg-primary", // Midnight teal
    },
    coral: {
      500: "bg-primary", // Muted terracotta
      600: "bg-primary", // Deep earth
      700: "bg-primary", // Night earth
    },

    // Dark backgrounds
    background: "bg-primary", // Slate 900
    card: "bg-primary", // Slate 800
    surface: "bg-primary", // Slate 700
    sky: "bg-primary", // Deep night blue
  },
};

/**
 * Gradient definitions for golden hour theme
 */
export const goldenHourGradients = {
  // Dawn - warm morning colors
  dawn: "linear-gradient(135deg, bg-primary 0%, bg-primary 100%)",

  // Dusk - sunset colors
  dusk: "linear-gradient(135deg, bg-primary 0%, bg-primary 100%)",

  // Nature - teal to green
  nature: "linear-gradient(135deg, bg-primary 0%, bg-primary 100%)",

  // Hero - subtle overlay for landing page
  heroLight: `linear-gradient(180deg, 
    rgba(244, 164, 96, 0.1) 0%, 
    rgba(255, 255, 255, 0.95) 50%,
    rgba(0, 139, 139, 0.08) 100%)`,

  heroDark: `linear-gradient(180deg, 
    rgba(233, 116, 81, 0.12) 0%, 
    rgba(15, 23, 42, 0.95) 50%,
    rgba(0, 139, 139, 0.08) 100%)`,

  // Card overlays
  cardOverlay:
    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",

  // Shimmer effect for loading
  shimmer: `linear-gradient(
    90deg,
    transparent 0%,
    rgba(244, 164, 96, 0.3) 50%,
    transparent 100%
  )`,
};

/**
 * Color utility functions
 */
export const colorUtils = {
  /**
   * Convert hex to RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  /**
   * Convert hex to HSL
   */
  hexToHsl(hex: string): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return "";

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  },

  /**
   * Get contrast color (black or white) based on background
   */
  getContrastColor(hex: string): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return "bg-primary";

    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    return luminance > 0.5 ? "bg-primary" : "bg-primary";
  },
};

/**
 * Export color tokens for Tailwind config
 */
export const colorTokens = {
  golden: goldenHourTheme.light.golden,
  teal: goldenHourTheme.light.teal,
  coral: goldenHourTheme.light.coral,
};
