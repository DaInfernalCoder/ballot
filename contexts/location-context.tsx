import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { loadLocation, saveLocation, clearLocation as clearStoredLocation, wasLocationPermissionAsked } from '@/utils/storage';
import { requestAndGetLocation, checkLocationPermission } from '@/utils/location-service';

interface LocationState {
  currentLocation: string | null; // e.g., "Phoenix, Arizona"
  isLoading: boolean;
  permissionGranted: boolean;
  permissionAsked: boolean;
  error: string | null;
}

type LocationAction =
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'CLEAR_LOCATION' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PERMISSION'; payload: { granted: boolean; asked: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'HYDRATE'; payload: { location: string | null; permissionAsked: boolean } };

interface LocationContextValue extends LocationState {
  requestLocation: () => Promise<void>;
  setManualLocation: (location: string) => Promise<void>;
  clearLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'SET_LOCATION':
      return {
        ...state,
        currentLocation: action.payload,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_LOCATION':
      return {
        ...state,
        currentLocation: null,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_PERMISSION':
      return {
        ...state,
        permissionGranted: action.payload.granted,
        permissionAsked: action.payload.asked,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'HYDRATE':
      return {
        ...state,
        currentLocation: action.payload.location,
        permissionAsked: action.payload.permissionAsked,
        isLoading: false,
      };
    default:
      return state;
  }
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(locationReducer, {
    currentLocation: null,
    isLoading: true,
    permissionGranted: false,
    permissionAsked: false,
    error: null,
  });

  // Load saved location and permission status on mount
  useEffect(() => {
    async function hydrateLocation() {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const [savedLocation, permissionAsked] = await Promise.all([
          loadLocation(),
          wasLocationPermissionAsked(),
        ]);

        // Check current permission status
        if (permissionAsked) {
          const permission = await checkLocationPermission();
          dispatch({
            type: 'SET_PERMISSION',
            payload: { granted: permission.granted, asked: true },
          });
        }

        dispatch({
          type: 'HYDRATE',
          payload: { location: savedLocation, permissionAsked },
        });
      } catch (error) {
        console.error('[LocationContext] Failed to hydrate location:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    hydrateLocation();
  }, []);

  const value = useMemo<LocationContextValue>(
    () => ({
      currentLocation: state.currentLocation,
      isLoading: state.isLoading,
      permissionGranted: state.permissionGranted,
      permissionAsked: state.permissionAsked,
      error: state.error,

      /**
       * Request GPS location permission and get current location
       */
      requestLocation: async () => {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          dispatch({ type: 'SET_ERROR', payload: null });

          const result = await requestAndGetLocation();

          if (result.location) {
            dispatch({ type: 'SET_LOCATION', payload: result.location });
            dispatch({ type: 'SET_PERMISSION', payload: { granted: true, asked: true } });
          } else {
            dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to get location' });
            dispatch({ type: 'SET_PERMISSION', payload: { granted: false, asked: true } });
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } catch (error) {
          console.error('[LocationContext] Failed to request location:', error);
          dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to get location',
          });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      },

      /**
       * Manually set location from user input (e.g., "Phoenix, Arizona")
       */
      setManualLocation: async (location: string) => {
        try {
          const trimmedLocation = location.trim();
          if (!trimmedLocation) {
            dispatch({ type: 'CLEAR_LOCATION' });
            await clearStoredLocation();
            return;
          }

          await saveLocation(trimmedLocation);
          dispatch({ type: 'SET_LOCATION', payload: trimmedLocation });
        } catch (error) {
          console.error('[LocationContext] Failed to set manual location:', error);
          dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to save location',
          });
        }
      },

      /**
       * Clear current location
       */
      clearLocation: async () => {
        try {
          await clearStoredLocation();
          dispatch({ type: 'CLEAR_LOCATION' });
        } catch (error) {
          console.error('[LocationContext] Failed to clear location:', error);
          dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to clear location',
          });
        }
      },
    }),
    [state]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
