/**
 * Tests for URL Validator
 * 
 * These tests verify that the URL validation logic properly identifies
 * and blocks malicious URLs while allowing legitimate ones.
 */

import { isValidUrl, sanitizeUrl } from '../url-validator';

describe('URL Validator', () => {
  describe('isValidUrl', () => {
    // Valid URLs
    test('accepts valid HTTPS URL', () => {
      expect(isValidUrl('https://www.example.com')).toBe(true);
    });

    test('accepts valid HTTP URL', () => {
      expect(isValidUrl('http://www.example.com')).toBe(true);
    });

    test('accepts URL with path', () => {
      expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
    });

    test('accepts URL with query parameters', () => {
      expect(isValidUrl('https://example.com?param=value')).toBe(true);
    });

    test('accepts URL with port', () => {
      expect(isValidUrl('https://example.com:8080')).toBe(true);
    });

    // Invalid URLs - null/undefined/empty
    test('rejects null', () => {
      expect(isValidUrl(null)).toBe(false);
    });

    test('rejects undefined', () => {
      expect(isValidUrl(undefined)).toBe(false);
    });

    test('rejects empty string', () => {
      expect(isValidUrl('')).toBe(false);
    });

    test('rejects whitespace-only string', () => {
      expect(isValidUrl('   ')).toBe(false);
    });

    // Invalid URLs - malicious protocols
    test('rejects javascript: protocol', () => {
      expect(isValidUrl('javascript:alert("XSS")')).toBe(false);
    });

    test('rejects data: protocol', () => {
      expect(isValidUrl('data:text/html,<script>alert("XSS")</script>')).toBe(false);
    });

    test('rejects vbscript: protocol', () => {
      expect(isValidUrl('vbscript:msgbox("XSS")')).toBe(false);
    });

    test('rejects file: protocol', () => {
      expect(isValidUrl('file:///etc/passwd')).toBe(false);
    });

    test('rejects about: protocol', () => {
      expect(isValidUrl('about:blank')).toBe(false);
    });

    // Invalid URLs - localhost and private IPs
    test('rejects localhost', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(false);
    });

    test('rejects 127.0.0.1', () => {
      expect(isValidUrl('http://127.0.0.1')).toBe(false);
    });

    test('rejects private IP 192.168.x.x', () => {
      expect(isValidUrl('http://192.168.1.1')).toBe(false);
    });

    test('rejects private IP 10.x.x.x', () => {
      expect(isValidUrl('http://10.0.0.1')).toBe(false);
    });

    test('rejects private IP 172.16-31.x.x', () => {
      expect(isValidUrl('http://172.16.0.1')).toBe(false);
      expect(isValidUrl('http://172.31.255.255')).toBe(false);
    });

    // Invalid URLs - phishing attempts
    test('rejects URL with @ in hostname (phishing)', () => {
      expect(isValidUrl('https://trusted.com@attacker.com')).toBe(false);
    });

    test('rejects malformed URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('htp://invalid')).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    test('returns sanitized valid URL', () => {
      const result = sanitizeUrl('https://example.com/path?query=value');
      expect(result).toBeTruthy();
      expect(result).toContain('https://example.com');
    });

    test('removes fragments from URL', () => {
      const result = sanitizeUrl('https://example.com/path#fragment');
      expect(result).toBeTruthy();
      expect(result).not.toContain('#fragment');
    });

    test('returns null for invalid URL', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe(null);
    });

    test('returns null for null input', () => {
      expect(sanitizeUrl(null)).toBe(null);
    });

    test('returns null for undefined input', () => {
      expect(sanitizeUrl(undefined)).toBe(null);
    });

    test('preserves query parameters', () => {
      const result = sanitizeUrl('https://example.com?param=value');
      expect(result).toBeTruthy();
      expect(result).toContain('?param=value');
    });

    test('preserves port', () => {
      const result = sanitizeUrl('https://example.com:8080/path');
      expect(result).toBeTruthy();
      expect(result).toContain(':8080');
    });
  });
});
