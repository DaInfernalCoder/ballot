import AsyncStorage from '@react-native-async-storage/async-storage';

const VIEW_MODE_KEY = '@ballot:view_mode';

export type ViewMode = 'list' | 'deck';

/**
 * Save the user's preferred view mode to AsyncStorage
 */
export async function saveViewMode(mode: ViewMode): Promise<void> {
  try {
    await AsyncStorage.setItem(VIEW_MODE_KEY, mode);
    console.log(`[ViewMode] Saved preference: ${mode}`);
  } catch (error) {
    console.error('[ViewMode] Failed to save preference:', error);
  }
}

/**
 * Load the user's preferred view mode from AsyncStorage
 * Defaults to 'list' if no preference is saved
 */
export async function loadViewMode(): Promise<ViewMode> {
  try {
    const mode = await AsyncStorage.getItem(VIEW_MODE_KEY);
    if (mode === 'list' || mode === 'deck') {
      console.log(`[ViewMode] Loaded preference: ${mode}`);
      return mode;
    }
    return 'list'; // Default
  } catch (error) {
    console.error('[ViewMode] Failed to load preference:', error);
    return 'list'; // Default on error
  }
}

