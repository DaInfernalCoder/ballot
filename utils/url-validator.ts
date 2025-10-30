/**
 * URL Validation and Sanitization Utilities
 * 
 * Security measures to prevent XSS, phishing, and other URL-based attacks
 */

/**
 * Allowed URL protocols for external links
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:'] as const;

/**
 * Suspicious URL patterns that might indicate phishing or malicious content
 */
const SUSPICIOUS_PATTERNS = [
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
  /file:/i,
  /about:/i,
  /@/,  // URLs with @ can be used for phishing (e.g., https://trusted.com@attacker.com)
];

/**
 * Validate if a URL is safe to open
 * 
 * @param url - URL string to validate
 * @returns true if URL is safe, false otherwise
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Trim whitespace
  const trimmedUrl = url.trim();

  // Check for empty string
  if (trimmedUrl.length === 0) {
    return false;
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmedUrl)) {
      console.warn('[URLValidator] Suspicious URL pattern detected:', trimmedUrl);
      return false;
    }
  }

  try {
    // Parse URL
    const urlObj = new URL(trimmedUrl);

    // Validate protocol
    if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol as any)) {
      console.warn('[URLValidator] Invalid protocol:', urlObj.protocol);
      return false;
    }

    // Validate hostname exists
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      console.warn('[URLValidator] Missing hostname');
      return false;
    }

    // Check for localhost/internal IPs (should not be allowed in production)
    if (isLocalOrPrivateUrl(urlObj.hostname)) {
      console.warn('[URLValidator] Local or private URL detected:', urlObj.hostname);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('[URLValidator] Invalid URL format:', trimmedUrl);
    return false;
  }
}

/**
 * Check if hostname points to localhost or private IP ranges
 * 
 * @param hostname - hostname to check
 * @returns true if hostname is local or private
 */
function isLocalOrPrivateUrl(hostname: string): boolean {
  // Check for localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return true;
  }

  // Check for private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
  const privateIpPatterns = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./, // Link-local
    /^fc00:/, // IPv6 private
    /^fe80:/, // IPv6 link-local
  ];

  return privateIpPatterns.some((pattern) => pattern.test(hostname));
}

/**
 * Sanitize URL by removing dangerous components
 * 
 * @param url - URL to sanitize
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!isValidUrl(url)) {
    return null;
  }

  try {
    const urlObj = new URL(url!.trim());
    
    // Reconstruct URL with only safe components (removes fragments that could contain scripts)
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.port ? ':' + urlObj.port : ''}${urlObj.pathname}${urlObj.search}`;
  } catch {
    return null;
  }
}

/**
 * Validate and sanitize URL for display
 * Returns a safe URL string or null
 * 
 * @param url - URL to validate
 * @returns Safe URL or null
 */
export function validateAndSanitizeUrl(url: string | null | undefined): string | null {
  return sanitizeUrl(url);
}

/**
 * Get display-friendly URL (truncate long URLs)
 * 
 * @param url - URL to format
 * @param maxLength - Maximum length (default: 50)
 * @returns Formatted URL
 */
export function getDisplayUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) {
    return url;
  }

  return url.substring(0, maxLength - 3) + '...';
}
