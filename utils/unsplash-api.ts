import { ENV } from '@/config/env';

/**
 * Unsplash API Error class
 */
export class UnsplashError extends Error {
  constructor(message: string, public statusCode?: number, public response?: any) {
    super(message);
    this.name = 'UnsplashError';
  }
}

/**
 * Unsplash image data structure
 */
export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
}

/**
 * Fetch a random image from Unsplash based on a keyword
 *
 * @param keyword - Search keyword (e.g., "town-hall", "political-rally")
 * @param orientation - Image orientation (landscape, portrait, squarish)
 * @returns Image URL or null if failed
 */
export async function fetchUnsplashImage(
  keyword: string,
  orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
): Promise<string | null> {
  const apiKey = ENV.UNSPLASH_ACCESS_KEY;

  if (!apiKey) {
    console.warn('[UnsplashAPI] No API key found, skipping image fetch');
    return null;
  }

  if (!keyword || !keyword.trim()) {
    console.warn('[UnsplashAPI] No keyword provided, skipping image fetch');
    return null;
  }

  const normalizedKeyword = keyword.trim().toLowerCase();

  try {
    console.log(`[UnsplashAPI] Fetching image for keyword: ${normalizedKeyword}`);

    // Unsplash API endpoint for random photo
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(normalizedKeyword)}&orientation=${orientation}&content_filter=high`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Client-ID ${apiKey}`,
        'Accept-Version': 'v1',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle rate limiting (403)
      if (response.status === 403) {
        console.error('[UnsplashAPI] Rate limit exceeded or invalid API key');
        throw new UnsplashError('Rate limit exceeded', 403);
      }

      // Handle not found (404)
      if (response.status === 404) {
        console.warn(`[UnsplashAPI] No images found for keyword: ${normalizedKeyword}`);
        return null;
      }

      throw new UnsplashError(
        `Unsplash API error: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: UnsplashImage = await response.json();

    // Return the regular size URL (suitable for mobile)
    const imageUrl = data.urls.regular;

    console.log(`[UnsplashAPI] Successfully fetched image: ${imageUrl}`);

    return imageUrl;

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[UnsplashAPI] Request timeout after 5 seconds');
      return null;
    }

    if (error instanceof UnsplashError) {
      console.error(`[UnsplashAPI] Error: ${error.message}`);
      return null;
    }

    console.error('[UnsplashAPI] Unexpected error:', error);
    return null;
  }
}

/**
 * Fetch multiple images in parallel with fallback handling
 *
 * @param keywords - Array of keywords
 * @returns Array of image URLs (null for failed fetches)
 */
export async function fetchMultipleUnsplashImages(
  keywords: string[]
): Promise<(string | null)[]> {
  console.log(`[UnsplashAPI] Fetching ${keywords.length} images in parallel...`);

  const promises = keywords.map((keyword) => fetchUnsplashImage(keyword));
  const results = await Promise.allSettled(promises);

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`[UnsplashAPI] Failed to fetch image for keyword: ${keywords[index]}`);
      return null;
    }
  });
}

/**
 * Validate if a URL is a valid Unsplash image URL
 */
export function isValidUnsplashUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('unsplash.com');
  } catch {
    return false;
  }
}
