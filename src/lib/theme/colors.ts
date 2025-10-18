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
      50: '#FFF8E1',   // Lightest dawn
      100: '#FFECB3',  // Morning glow
      200: '#FFE082',  // Soft golden
      300: '#FFD54F',  // Bright gold
      400: '#FFCA28',  // Rich golden
      500: '#F4A460',  // Main golden (sandy brown)
      600: '#FFB300',  // Deep golden
      700: '#FFA000',  // Sunset gold
      800: '#FF8F00',  // Amber
      900: '#FF6F00',  // Deep amber
    },
    
    // Secondary - Twilight Teal
    teal: {
      50: '#E0F2F1',   // Misty morning
      100: '#B2DFDB',  // Light aqua
      200: '#80CBC4',  // Soft teal
      300: '#4DB6AC',  // Medium teal
      400: '#26A69A',  // Current primary
      500: '#008B8B',  // Deep teal (main)
      600: '#00897B',  // Forest teal
      700: '#00796B',  // Dark teal
      800: '#00695C',  // Deep forest
      900: '#004D40',  // Night teal
    },
    
    // Accent - Sunset Coral
    coral: {
      50: '#FFF3E0',   // Peach dawn
      100: '#FFE0B2',  // Light peach
      200: '#FFCC80',  // Soft coral
      300: '#FFB74D',  // Warm coral
      400: '#FFA726',  // Bright coral
      500: '#E97451',  // Main coral/terracotta
      600: '#F57C00',  // Deep coral
      700: '#E65100',  // Burnt orange
      800: '#D84315',  // Terra cotta
      900: '#BF360C',  // Deep earth
    },
    
    // Nature Accents
    forest: '#2E7D32',     // Deep green for success
    sky: '#42A5F5',        // Clear blue for info
    earth: '#5D4037',      // Brown for grounded elements
    sand: '#EFEBE9',       // Neutral light background
    mist: '#F5F5F5',       // Very light neutral
  },
  
  dark: {
    // Twilight/Night versions (20-30% darker, desaturated)
    golden: {
      500: '#B8860B',      // Dark goldenrod
      600: '#9A7B0A',      // Deeper gold
      700: '#7D6408',      // Night gold
    },
    teal: {
      500: '#006666',      // Night teal
      600: '#004D4D',      // Deep night
      700: '#003333',      // Midnight teal
    },
    coral: {
      500: '#B8573D',      // Muted terracotta
      600: '#9A4830',      // Deep earth
      700: '#7D3925',      // Night earth
    },
    
    // Dark backgrounds
    background: '#0F172A',  // Slate 900
    card: '#1E293B',        // Slate 800
    surface: '#334155',     // Slate 700
    sky: '#1E40AF',         // Deep night blue
  }
};

/**
 * Gradient definitions for golden hour theme
 */
export const goldenHourGradients = {
  // Dawn - warm morning colors
  dawn: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)',
  
  // Dusk - sunset colors
  dusk: 'linear-gradient(135deg, #E97451 0%, #C94B3C 100%)',
  
  // Nature - teal to green
  nature: 'linear-gradient(135deg, #008B8B 0%, #26A69A 100%)',
  
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
  cardOverlay: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
  
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
    if (!rgb) return '';

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
    if (!rgb) return '#000000';

    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    return luminance > 0.5 ? '#000000' : '#FFFFFF';
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

