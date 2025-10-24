import { ImageSourcePropType } from 'react-native';

// Image key to require() mapping
const IMAGE_MAP: Record<string, ImageSourcePropType> = {
  event1: require('@/assets/images/event1.png'),
  event2: require('@/assets/images/event2.png'),
  event3: require('@/assets/images/event3.png'),
  event4: require('@/assets/images/event4.png'),
  event5: require('@/assets/images/event5.png'),
  'event-image': require('@/assets/images/event-image.png'),
};

// Default fallback image
const DEFAULT_IMAGE_KEY = 'event-image';

/**
 * Get image source from image key
 */
export function getImageFromKey(key: string): ImageSourcePropType {
  return IMAGE_MAP[key] || IMAGE_MAP[DEFAULT_IMAGE_KEY];
}

/**
 * Extract image key from image source
 * This is used when saving events to AsyncStorage
 */
export function getKeyFromImage(image: ImageSourcePropType): string {
  // If image is a URI object, we can't map it to a key
  if (typeof image === 'object' && 'uri' in image) {
    return DEFAULT_IMAGE_KEY;
  }

  // Search for the image in our map
  for (const [key, mappedImage] of Object.entries(IMAGE_MAP)) {
    if (mappedImage === image) {
      return key;
    }
  }

  // Fallback to default if not found
  return DEFAULT_IMAGE_KEY;
}

/**
 * Validate if an image key exists in our mapping
 */
export function isValidImageKey(key: string): boolean {
  return key in IMAGE_MAP;
}

/**
 * Get all available image keys
 */
export function getAvailableImageKeys(): string[] {
  return Object.keys(IMAGE_MAP);
}
