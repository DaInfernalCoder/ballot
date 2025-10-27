import { ENV } from '@/config/env';

/**
 * Error types for OpenRouter API
 */
export class OpenRouterError extends Error {
  constructor(message: string, public statusCode?: number, public retryable: boolean = false) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export class NetworkError extends OpenRouterError {
  constructor(message: string = 'Network request failed') {
    super(message, undefined, true);
    this.name = 'NetworkError';
  }
}

export class RateLimitError extends OpenRouterError {
  constructor(message: string = 'Rate limit exceeded', public retryAfter?: number) {
    super(message, 429, true);
    this.name = 'RateLimitError';
  }
}

export class APIError extends OpenRouterError {
  constructor(message: string, statusCode: number, retryable: boolean = false) {
    super(message, statusCode, retryable);
    this.name = 'APIError';
  }
}

/**
 * OpenRouter API configuration
 */
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_TIMEOUT = 60000; // 60 seconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Get API key from environment
 */
function getApiKey(): string {
  const apiKey = ENV.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY not found in environment variables. ' +
      'Please add it to .env.local file and restart the dev server.'
    );
  }

  return apiKey;
}

/**
 * OpenRouter API request options
 */
export interface OpenRouterRequestOptions {
  model?: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  timeout?: number;
}

/**
 * OpenRouter API response structure
 */
export interface OpenRouterResponse {
  id: string;
  model: string;
  created: number;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make API request with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new NetworkError('Request timeout');
    }
    throw error;
  }
}

/**
 * Call OpenRouter API with retry logic
 */
export async function callOpenRouterAPI(
  options: OpenRouterRequestOptions,
  retryCount = 0
): Promise<OpenRouterResponse> {
  const apiKey = getApiKey();
  const timeout = options.timeout || DEFAULT_TIMEOUT;

  const requestBody = {
    model: options.model || 'perplexity/sonar-pro',
    messages: options.messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.max_tokens,
  };

  try {
    const response = await fetchWithTimeout(
      OPENROUTER_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://ballot.app',
          'X-Title': 'Ballot',
        },
        body: JSON.stringify(requestBody),
      },
      timeout
    );

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);

      if (retryCount < MAX_RETRIES) {
        console.log(`[OpenRouter] Rate limited. Retrying after ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        return callOpenRouterAPI(options, retryCount + 1);
      }

      throw new RateLimitError('Rate limit exceeded. Please try again later.', retryAfter);
    }

    // Handle server errors (5xx) - retryable
    if (response.status >= 500 && response.status < 600) {
      if (retryCount < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`[OpenRouter] Server error (${response.status}). Retrying in ${delay}ms...`);
        await sleep(delay);
        return callOpenRouterAPI(options, retryCount + 1);
      }

      throw new APIError(
        `Server error: ${response.status} ${response.statusText}`,
        response.status,
        true
      );
    }

    // Handle client errors (4xx) - not retryable
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new APIError(
        `API error: ${response.status} - ${errorText}`,
        response.status,
        false
      );
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new APIError('No response from API', 500, true);
    }

    return data;

  } catch (error) {
    // If it's already an OpenRouterError, rethrow
    if (error instanceof OpenRouterError) {
      throw error;
    }

    // Network errors - retryable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (retryCount < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`[OpenRouter] Network error. Retrying in ${delay}ms...`);
        await sleep(delay);
        return callOpenRouterAPI(options, retryCount + 1);
      }

      throw new NetworkError('Network request failed. Please check your connection.');
    }

    // Unknown errors
    throw new OpenRouterError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      undefined,
      false
    );
  }
}

/**
 * Extract content from OpenRouter response
 */
export function extractContent(response: OpenRouterResponse): string {
  const choice = response.choices[0];
  if (!choice || !choice.message || !choice.message.content) {
    throw new APIError('Invalid response structure', 500, false);
  }

  return choice.message.content;
}
