import * as Location from 'expo-location';
import { saveLocation, saveLocationPermissionAsked } from './storage';

export interface LocationResult {
  location: string | null; // e.g., "Phoenix, Arizona"
  error?: string;
}

export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Request location permission from user
 */
export async function requestLocationPermission(): Promise<PermissionResult> {
  try {
    // Mark that we asked for permission
    await saveLocationPermissionAsked(true);

    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('[LocationService] Failed to request permission:', error);
    return {
      granted: false,
      canAskAgain: false,
    };
  }
}

/**
 * Check current location permission status without requesting
 */
export async function checkLocationPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('[LocationService] Failed to check permission:', error);
    return {
      granted: false,
      canAskAgain: false,
    };
  }
}

/**
 * Get current location and format as "City, State"
 */
export async function getCurrentLocation(): Promise<LocationResult> {
  try {
    // Check permission first
    const permission = await checkLocationPermission();
    if (!permission.granted) {
      return {
        location: null,
        error: 'Location permission not granted',
      };
    }

    // Get current position
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Reverse geocode to get address
    const [address] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    if (!address) {
      return {
        location: null,
        error: 'Could not determine location address',
      };
    }

    // Format as "City, State" or "City, Country" if state not available
    let locationString = '';
    if (address.city && address.region) {
      locationString = `${address.city}, ${address.region}`;
    } else if (address.city && address.country) {
      locationString = `${address.city}, ${address.country}`;
    } else if (address.region && address.country) {
      locationString = `${address.region}, ${address.country}`;
    } else if (address.country) {
      locationString = address.country;
    } else {
      return {
        location: null,
        error: 'Could not format location address',
      };
    }

    // Save to storage
    await saveLocation(locationString);

    return {
      location: locationString,
    };
  } catch (error) {
    console.error('[LocationService] Failed to get current location:', error);
    return {
      location: null,
      error: error instanceof Error ? error.message : 'Failed to get location',
    };
  }
}

/**
 * Request permission and get location in one call
 */
export async function requestAndGetLocation(): Promise<LocationResult> {
  try {
    const permission = await requestLocationPermission();

    if (!permission.granted) {
      return {
        location: null,
        error: permission.canAskAgain
          ? 'Location permission denied'
          : 'Location permission permanently denied',
      };
    }

    return await getCurrentLocation();
  } catch (error) {
    console.error('[LocationService] Failed to request and get location:', error);
    return {
      location: null,
      error: error instanceof Error ? error.message : 'Failed to get location',
    };
  }
}
