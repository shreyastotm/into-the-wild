/**
 * Haptic Feedback Hook
 * 
 * Provides haptic (vibration) feedback for touch interactions
 * Falls back gracefully on browsers/devices that don't support vibration
 * 
 * @example
 * ```tsx
 * const haptic = useHaptic();
 * 
 * <Button onClick={() => {
 *   haptic.light();
 *   // ... handle click
 * }}>
 *   Tap Me
 * </Button>
 * ```
 */

export interface HapticFeedback {
  /** Light tap (10ms) - for subtle interactions */
  light: () => void;
  /** Medium tap (20ms) - for standard interactions */
  medium: () => void;
  /** Heavy tap (30ms) - for important interactions */
  heavy: () => void;
  /** Success pattern (10ms, 50ms, 10ms) - for successful actions */
  success: () => void;
  /** Error pattern (30ms, 100ms, 30ms) - for errors */
  error: () => void;
  /** Simple tap (5ms) - for very subtle feedback */
  tap: () => void;
  /** Warning pattern (20ms, 30ms, 20ms) - for warnings */
  warning: () => void;
  /** Check if haptics are supported */
  isSupported: boolean;
}

/**
 * Hook for haptic feedback
 */
export const useHaptic = (): HapticFeedback => {
  // Check if vibration API is available
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = (pattern: number | number[]) => {
    if (isSupported) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        // Silently fail if vibration is not available
        console.debug('Haptic feedback not available:', error);
      }
    }
  };

  return {
    light: () => vibrate(10),
    medium: () => vibrate(20),
    heavy: () => vibrate(30),
    success: () => vibrate([10, 50, 10]),
    error: () => vibrate([30, 100, 30]),
    tap: () => vibrate(5),
    warning: () => vibrate([20, 30, 20]),
    isSupported,
  };
};

/**
 * Haptic feedback for buttons
 * Automatically applies appropriate feedback based on button type
 */
export const useButtonHaptic = (
  variant: 'default' | 'destructive' | 'success' = 'default'
) => {
  const haptic = useHaptic();

  const handleClick = () => {
    switch (variant) {
      case 'destructive':
        haptic.warning();
        break;
      case 'success':
        haptic.success();
        break;
      default:
        haptic.light();
    }
  };

  return handleClick;
};

