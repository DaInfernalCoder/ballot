# Security Policy

## Overview

This document outlines the security measures implemented in the Ballot app to protect user data and prevent common vulnerabilities.

## Security Measures

### 1. API Key Management

**Status: ✅ Secure**

- API keys (OpenRouter, Unsplash, Supabase) are stored in `.env.local` (gitignored)
- Keys are loaded via `expo-constants` at build time
- No API keys are hardcoded in source code
- `.env.local` is explicitly excluded from version control via `.gitignore`

### 2. URL Validation

**Status: ✅ Secure**

- All external URLs are validated before opening (`utils/url-validator.ts`)
- Validation checks:
  - Protocol must be `http:` or `https:`
  - No `javascript:`, `data:`, `vbscript:`, or `file:` protocols
  - No localhost or private IP addresses
  - No suspicious patterns (e.g., URLs with `@` for phishing)
- Invalid URLs are rejected and logged
- Implementation in `components/ExternalLink.tsx`

### 3. Input Sanitization

**Status: ✅ Secure**

- Location inputs are sanitized to prevent prompt injection (`utils/event-generation.ts`)
- Control characters and HTML-like tags are removed
- Input length is limited to prevent abuse (200 characters)
- All user inputs are validated before processing

### 4. JSON Parsing Validation

**Status: ✅ Secure**

- All JSON parsing includes validation and error handling
- Cache entries are validated for:
  - Correct data types
  - Required fields
  - Timestamp validity (not in future, not too old)
  - Individual event structure
- Invalid cache entries are cleared automatically
- Implementation in `utils/event-cache.ts` and `utils/storage.ts`

### 5. Storage Security

**Status: ✅ Secure**

- AsyncStorage is used for local data persistence
- Stored data is validated on load
- No sensitive data (API keys, credentials) is stored locally
- Only event data and user preferences are cached

### 6. Web Security Headers

**Status: ✅ Secure**

- Security headers added to web version (`app/+html.tsx`):
  - `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
  - `X-Frame-Options: DENY` - Prevents clickjacking
  - `X-XSS-Protection: 1; mode=block` - Enables XSS filter
  - `Referrer-Policy: strict-origin-when-cross-origin` - Limits referrer information

### 7. Content Security

**Status: ✅ Secure**

- No `dangerouslySetInnerHTML` usage except for static CSS (safe)
- No `eval()` or `Function()` constructor usage
- No SQL injection vectors (no direct SQL queries)
- All external images loaded via Expo Image with proper error handling

### 8. Network Security

**Status: ✅ Secure**

- API requests include timeout protection (5-60 seconds)
- Retry logic with exponential backoff
- Rate limiting respected (`Retry-After` header)
- TLS/HTTPS enforced for all API calls

### 9. Dependencies

**Status: ✅ Secure**

- npm audit: **0 vulnerabilities** (as of last check)
- Dependencies are regularly updated
- Only necessary dependencies are included

## Threat Model

### Protected Against

1. **XSS (Cross-Site Scripting)**: URL validation, no unsafe HTML rendering
2. **Prompt Injection**: Input sanitization for AI prompts
3. **Phishing**: URL pattern detection, localhost/private IP blocking
4. **JSON Injection**: Strict validation of all parsed JSON
5. **Clickjacking**: X-Frame-Options header
6. **MIME Sniffing**: X-Content-Type-Options header
7. **API Key Exposure**: Environment variables, gitignored secrets

### Known Limitations

1. **No Authentication**: App currently does not have user authentication
2. **Local Storage**: Data stored in AsyncStorage is not encrypted (acceptable for non-sensitive event data)
3. **No Server-Side Validation**: Validation happens client-side only (acceptable for mobile app architecture)

## Reporting Vulnerabilities

If you discover a security vulnerability, please:

1. **DO NOT** open a public GitHub issue
2. Email the security team directly
3. Provide detailed information about the vulnerability
4. Allow reasonable time for a fix before public disclosure

## Security Checklist for Contributors

When contributing code, ensure:

- [ ] No API keys or secrets in code
- [ ] All external URLs are validated
- [ ] User inputs are sanitized
- [ ] JSON parsing includes validation
- [ ] No use of `eval()` or `Function()`
- [ ] No SQL queries with string concatenation
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies are up to date

## Regular Security Tasks

- [ ] Run `npm audit` monthly
- [ ] Review dependencies quarterly
- [ ] Update security headers as needed
- [ ] Audit URL validation logic
- [ ] Review API key rotation policy

## Security Updates

### 2025-10-30

- ✅ Added URL validation utility (`utils/url-validator.ts`)
- ✅ Updated ExternalLink component with URL validation
- ✅ Added JSON parsing validation to cache and storage
- ✅ Added input sanitization for location inputs
- ✅ Added security headers to web version
- ✅ Documented safe use of `dangerouslySetInnerHTML`
- ✅ Verified npm audit (0 vulnerabilities)

---

Last Updated: 2025-10-30
