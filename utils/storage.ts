import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  SAVED_EVENTS: '@ballot:saved_events',
  DATA_VERSION: '@ballot:data_version',
  LOCATION: '@ballot:location',
  LOCATION_PERMISSION_ASKED: '@ballot:location_permission_asked',
} as const;

// Current data version for migration support
export const CURRENT_DATA_VERSION = 1;

// Serializable event structure for AsyncStorage
export interface SerializedEvent {
  id: string;
  title: string;
  location: string;
  date: string;
  imageKey: string; // e.g., "event1", "event2"
}

export interface StorageData {
  version: number;
  events: SerializedEvent[];
}

/**
 * Save saved events to AsyncStorage
 */
export async function saveSavedEvents(events: SerializedEvent[]): Promise<void> {
  try {
    const data: StorageData = {
      version: CURRENT_DATA_VERSION,
      events,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_EVENTS, JSON.stringify(data));
  } catch (error) {
    console.error('[Storage] Failed to save events:', error);
    throw error;
  }
}

/**
 * Load saved events from AsyncStorage
 */
export async function loadSavedEvents(): Promise<SerializedEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_EVENTS);
    if (!raw) return [];

    const data: StorageData = JSON.parse(raw);

    // Handle data migration if needed
    if (data.version !== CURRENT_DATA_VERSION) {
      console.log('[Storage] Migrating data from version', data.version, 'to', CURRENT_DATA_VERSION);
      // Future: Add migration logic here
      // For now, return events as-is
    }

    return data.events || [];
  } catch (error) {
    console.error('[Storage] Failed to load events:', error);
    return [];
  }
}

/**
 * Clear all saved events from AsyncStorage
 */
export async function clearSavedEvents(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_EVENTS);
  } catch (error) {
    console.error('[Storage] Failed to clear events:', error);
    throw error;
  }
}

/**
 * Check if storage is available and working
 */
export async function isStorageAvailable(): Promise<boolean> {
  try {
    const testKey = '@ballot:storage_test';
    await AsyncStorage.setItem(testKey, 'test');
    await AsyncStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Save user's location (e.g., "Phoenix, Arizona")
 */
export async function saveLocation(location: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, location);
  } catch (error) {
    console.error('[Storage] Failed to save location:', error);
    throw error;
  }
}

/**
 * Load saved location
 */
export async function loadLocation(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
  } catch (error) {
    console.error('[Storage] Failed to load location:', error);
    return null;
  }
}

/**
 * Clear saved location
 */
export async function clearLocation(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.LOCATION);
  } catch (error) {
    console.error('[Storage] Failed to clear location:', error);
    throw error;
  }
}

/**
 * Save that location permission was asked
 */
export async function saveLocationPermissionAsked(asked: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_PERMISSION_ASKED, asked ? 'true' : 'false');
  } catch (error) {
    console.error('[Storage] Failed to save location permission flag:', error);
    throw error;
  }
}

/**
 * Check if location permission was previously asked
 */
export async function wasLocationPermissionAsked(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_PERMISSION_ASKED);
    return value === 'true';
  } catch (error) {
    console.error('[Storage] Failed to check location permission flag:', error);
    return false;
  }
}
