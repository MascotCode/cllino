/**
 * Haptics wrapper with graceful fallback if expo-haptics is not available
 */

let Haptics: any;

try {
  Haptics = require('expo-haptics');
} catch (error) {
  // Haptics not available, use no-op fallbacks
  Haptics = null;
}

/**
 * Trigger a selection haptic feedback
 */
export function impact(): void {
  try {
    if (Haptics?.selectionAsync) {
      Haptics.selectionAsync();
    }
  } catch (error) {
    // Silently fail if haptics aren't available
  }
}
