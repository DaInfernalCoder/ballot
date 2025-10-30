import { DiscoveredEvent, PerplexityEventData } from '@/types/event';
import { callOpenRouterAPI, extractContent, OpenRouterError } from './perplexity-api';
import { fetchMultipleUnsplashImages } from './unsplash-api';

/**
 * Generate a unique ID for an event
 */
function generateEventId(title: string, date: string, location: string): string {
  const combined = `${title}-${date}-${location}`;
  // Simple hash function for ID generation
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `event-${Math.abs(hash)}-${Date.now()}`;
}

/**
 * Format date and time for display (e.g., "Dec 12, 2024 • 7:30 PM")
 */
function formatDisplayDate(isoDate: string, time: string): string {
  try {
    const date = new Date(isoDate);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year} • ${time}`;
  } catch (error) {
    console.error('[EventGeneration] Date formatting error:', error);
    return `${isoDate} • ${time}`;
  }
}

/**
 * Get a random fallback image for events
 */
function getRandomEventImage(): { image: any; imageKey: string } {
  const eventImages = [
    { key: 'event1', image: require('@/assets/images/event1.png') },
    { key: 'event2', image: require('@/assets/images/event2.png') },
    { key: 'event3', image: require('@/assets/images/event3.png') },
  ];

  const randomIndex = Math.floor(Math.random() * eventImages.length);
  return {
    image: eventImages[randomIndex].image,
    imageKey: eventImages[randomIndex].key,
  };
}

/**
 * Validate event data from API
 */
function validateEventData(data: any): data is PerplexityEventData {
  return (
    typeof data === 'object' &&
    typeof data.name === 'string' &&
    typeof data.date === 'string' &&
    typeof data.time === 'object' &&
    typeof data.time.start === 'string' &&
    typeof data.address === 'object' &&
    typeof data.address.venue === 'string' &&
    typeof data.address.street === 'string' &&
    typeof data.address.city === 'string' &&
    typeof data.address.state === 'string' &&
    typeof data.ai_overview === 'string' &&
    Array.isArray(data.source_urls)
  );
}

/**
 * Extract time string from ISO datetime (e.g., "2025-10-23T19:30:00-07:00" -> "7:30 PM")
 */
function extractTimeFromISO(isoDateTime: string): string {
  try {
    const date = new Date(isoDateTime);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('[EventGeneration] Time extraction error:', error);
    return 'Time TBD';
  }
}

/**
 * Transform Perplexity event data to DiscoveredEvent
 */
function transformToDiscoveredEvent(data: PerplexityEventData, imageUrl?: string | null): DiscoveredEvent {
  const { image, imageKey } = getRandomEventImage();

  // Construct location string
  const location = `${data.address.city}, ${data.address.state}`;

  // Construct full address
  const address = `${data.address.venue}, ${data.address.street}, ${data.address.city}, ${data.address.state}${data.address.postal_code ? ' ' + data.address.postal_code : ''}`;

  // Extract time from ISO datetime
  const timeStr = extractTimeFromISO(data.time.start);

  return {
    id: generateEventId(data.name, data.date, location),
    title: data.name.trim(),
    location: location.trim(),
    address: address.trim(),
    date: formatDisplayDate(data.date, timeStr),
    time: timeStr,
    aiOverview: data.ai_overview.trim(),
    image,
    imageKey,
    imageUrl: imageUrl || undefined, // Use Unsplash URL if available
    venue: data.address.venue?.trim(),
    link: data.link,
    sourceUrls: data.source_urls,
    tags: data.tags,
    organizer: data.organizer?.trim(),
    websiteLink: data.website_link,
    impactStatement: data.impact_statement?.trim(),
    qaPairs: data.qa_pairs,
  };
}

/**
 * Sanitize location input to prevent prompt injection
 */
function sanitizeLocationInput(location: string): string {
  // Remove control characters, quotes, backticks, and other prompt injection markers
  const sanitized = location
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[<>]/g, '') // Remove HTML-like tags
    .replace(/[`'"]/g, '') // Remove quotes and backticks (prompt injection markers)
    .replace(/[\{\}\[\]]/g, '') // Remove JSON/code delimiters
    .replace(/\\/g, '') // Remove backslashes (escape sequences)
    .trim()
    .substring(0, 200); // Limit length to prevent abuse

  return sanitized;
}

/**
 * Create the prompt for event generation
 */
function createEventGenerationPrompt(location: string): string {
  // Sanitize location input to prevent prompt injection
  const sanitizedLocation = sanitizeLocationInput(location);
  
  // Calculate date range (next 30 days)
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 30);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const startDateStr = formatDate(today);
  const endDateStr = formatDate(endDate);

  return `You search the live web and return ONLY valid JSON that matches the provided JSON Schema. No markdown, no commentary. Cite sources for each card in source_urls. Prefer official and reputable sources. Do not invent data. If unsure, omit the field. Keep ai_overview under 60 words and factual. Find as many political events as possible that fall within parameters.

JSON SCHEMA:
{
  "name": "EventCards",
  "schema": {
    "type": "object",
    "required": ["cards"],
    "properties": {
      "cards": {
        "type": "array",
        "maxItems": 50,
        "items": {
          "type": "object",
          "required": [
            "name",
            "date",
            "time",
            "address",
            "ai_overview",
            "link",
            "source_urls",
            "unsplash_image_keyword"
          ],
          "properties": {
            "name": { "type": "string" },
            "date": { "type": "string", "description": "ISO 8601 date, e.g., 2025-10-23" },
            "time": {
              "type": "object",
              "required": ["start"],
              "properties": {
                "start": { "type": "string", "description": "ISO 8601 datetime with offset" },
                "end": { "type": "string" }
              }
            },
            "address": {
              "type": "object",
              "required": ["venue", "street", "city", "state"],
              "properties": {
                "venue": { "type": "string" },
                "street": { "type": "string" },
                "city": { "type": "string" },
                "state": { "type": "string" },
                "postal_code": { "type": "string" },
                "country": { "type": "string" }
              }
            },
            "location": {
              "type": "object",
              "properties": {
                "lat": { "type": "number" },
                "lon": { "type": "number" }
              }
            },
            "ai_overview": { "type": "string", "description": "<= 60 words. Neutral, factual." },
            "link": { "type": "string" },
            "source_urls": { "type": "array", "items": { "type": "string" } },
            "tags": { "type": "array", "items": { "type": "string" } },
            "organizer": { "type": "string", "description": "Name of organizing body or person" },
            "website_link": { "type": "string", "description": "Official event website URL if available" },
            "impact_statement": { "type": "string", "description": "1-2 sentences explaining why this event matters to the community" },
            "qa_pairs": {
              "type": "array",
              "maxItems": 3,
              "items": {
                "type": "object",
                "required": ["question", "answer"],
                "properties": {
                  "question": { "type": "string" },
                  "answer": { "type": "string", "description": "Concise 1-2 sentence answer" }
                }
              },
              "description": "Exactly 3 Q&A pairs: 'Who is this for?', 'Why does it matter?', 'What should I expect?'"
            },
            "unsplash_image_keyword": {
              "type": "string",
              "description": "Single descriptive keyword for Unsplash image search. Use hyphenated terms like 'town-hall', 'political-rally', 'civic-meeting', 'community-gathering', 'protest-march', 'voter-registration', 'city-council', 'school-board'. Choose keywords that best represent the event type and will return relevant civic/political imagery."
            }
          }
        }
      }
    }
  }
}

USER PROMPT:
Find political events near the user and return JSON ONLY per the schema.

Location:
- City, State: ${sanitizedLocation}

Time window:
- Start: ${startDateStr}
- End: ${endDateStr}

Inclusion rules:
- Include rallies, canvasses, town halls, school board or city meetings, voter registration drives.
- Require concrete date, start time, venue, and address.
- Prefer official orgs, Mobilize, Eventbrite, Meetup, universities, and city government sites.
- Max 10 items.

Output:
- cards[] with name, date, time.start, time.end if known, address{venue,street,city,state,postal_code,country}, location{lat,lon} if present, ai_overview, link, source_urls[], organizer, website_link, impact_statement (1-2 sentences), qa_pairs[] with exactly 3 items answering: 'Who is this for?', 'Why does it matter?', 'What should I expect?', and unsplash_image_keyword (single keyword like 'town-hall' or 'political-rally').
- For unsplash_image_keyword: Choose descriptive, hyphenated keywords that will fetch relevant civic/political images from Unsplash. Examples: 'town-hall', 'city-council', 'political-rally', 'community-meeting', 'protest-march', 'voter-registration', 'school-board', 'civic-engagement'.
- Do not include any text outside the JSON.`;
}

/**
 * Parse API response and extract events
 */
function parseEventsFromResponse(content: string): PerplexityEventData[] {
  try {
    let cleanedContent = content.trim();

    // Remove <think>...</think> tags and their content
    cleanedContent = cleanedContent.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Remove markdown code fences (```json or ```)
    cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Extract JSON array or object - find first [ or {
    const jsonStart = Math.max(
      cleanedContent.indexOf('['),
      cleanedContent.indexOf('{')
    );

    if (jsonStart === -1) {
      throw new Error('No JSON array or object found in response');
    }

    // Find the matching closing bracket
    let bracketCount = 0;
    let jsonEnd = -1;
    const startChar = cleanedContent[jsonStart];
    const endChar = startChar === '[' ? ']' : '}';

    for (let i = jsonStart; i < cleanedContent.length; i++) {
      if (cleanedContent[i] === startChar) bracketCount++;
      if (cleanedContent[i] === endChar) {
        bracketCount--;
        if (bracketCount === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
    }

    if (jsonEnd === -1) {
      throw new Error('Malformed JSON - no matching closing bracket');
    }

    cleanedContent = cleanedContent.substring(jsonStart, jsonEnd).trim();

    // Parse JSON
    const parsed = JSON.parse(cleanedContent);

    // Handle the schema structure - extract cards array if present
    let events: any[];
    if (parsed.cards && Array.isArray(parsed.cards)) {
      // Response matches schema with cards wrapper
      events = parsed.cards;
    } else if (Array.isArray(parsed)) {
      // Response is a direct array
      events = parsed;
    } else {
      // Response is a single object
      events = [parsed];
    }

    // Validate and filter events
    const validEvents = events.filter((event) => {
      const isValid = validateEventData(event);
      if (!isValid) {
        console.warn('[EventGeneration] Invalid event data:', event);
      }
      return isValid;
    });

    return validEvents;
  } catch (error) {
    console.error('[EventGeneration] Failed to parse events:', error);
    console.error('[EventGeneration] Raw content:', content);
    throw new Error('Failed to parse event data from API response');
  }
}

/**
 * Generate events using Perplexity Sonar Reasoning Pro
 */
export async function generateEventsForLocation(
  location: string
): Promise<DiscoveredEvent[]> {
  if (!location || !location.trim()) {
    throw new Error('Location is required for event generation');
  }

  const normalizedLocation = location.trim();

  console.log(`[EventGeneration] Generating events for: ${normalizedLocation}`);

  try {
    // Generate the prompt
    const userPrompt = createEventGenerationPrompt(normalizedLocation);
    const systemPrompt = 'You search the live web and return ONLY valid JSON that matches the provided JSON Schema. No markdown, no commentary. Cite sources for each card in source_urls. Prefer official and reputable sources. Do not invent data. If unsure, omit the field. Keep ai_overview under 60 words and factual. Find as many political events as possible that fall within parameters.';

    // Log the full prompts
    console.log('[EventGeneration] System prompt:', systemPrompt);
    console.log('[EventGeneration] User prompt:', userPrompt);

    // Call OpenRouter API with Perplexity Sonar Pro model
    const response = await callOpenRouterAPI({
      model: 'perplexity/sonar-pro',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 5000,
    });

    // Log full API response for debugging
    console.log('[EventGeneration] Raw API response:', JSON.stringify(response, null, 2));

    // Extract content
    const content = extractContent(response);
    console.log('[EventGeneration] Extracted content:', content);

    // Parse events
    const perplexityEvents = parseEventsFromResponse(content);
    console.log('[EventGeneration] Parsed events count:', perplexityEvents.length);
    console.log('[EventGeneration] Parsed events:', JSON.stringify(perplexityEvents, null, 2));

    if (perplexityEvents.length === 0) {
      console.warn('[EventGeneration] No events returned from API');
      return [];
    }

    // Fetch Unsplash images for all events in parallel
    console.log('[EventGeneration] Fetching Unsplash images...');
    const keywords = perplexityEvents.map(event => event.unsplash_image_keyword || 'civic-event');
    const imageUrls = await fetchMultipleUnsplashImages(keywords);
    console.log('[EventGeneration] Fetched Unsplash images:', imageUrls);

    // Transform to DiscoveredEvent format with Unsplash URLs
    const discoveredEvents = perplexityEvents.map((event, index) => {
      const imageUrl = imageUrls[index];
      return transformToDiscoveredEvent(event, imageUrl);
    });

    console.log(`[EventGeneration] Successfully generated ${discoveredEvents.length} events with images`);

    return discoveredEvents;

  } catch (error) {
    console.error('[EventGeneration] Failed to generate events:', error);

    if (error instanceof OpenRouterError) {
      throw error;
    }

    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate events'
    );
  }
}

/**
 * Get fallback events when API fails
 */
export function getFallbackEvents(): DiscoveredEvent[] {
  return [
    {
      id: 'fallback-1',
      title: 'Community Meeting - Discuss Development Plans',
      location: 'Phoenix, Arizona',
      address: '200 W Washington St, Phoenix, AZ 85003',
      venue: 'Phoenix City Hall',
      date: 'Dec 12, 2024 • 7:30 PM',
      time: '7:30 PM',
      aiOverview: 'Join us for a community meeting to discuss upcoming development plans in downtown Phoenix. Local officials and residents will gather to review proposed projects and provide feedback.',
      image: require('@/assets/images/event1.png'),
      imageKey: 'event1',
      organizer: 'Phoenix City Council',
      websiteLink: 'https://www.phoenix.gov',
      impactStatement: 'This meeting provides a crucial opportunity for residents to voice concerns and shape the future development of downtown Phoenix, ensuring community needs are prioritized.',
      qaPairs: [
        {
          question: 'Who is this for?',
          answer: 'Local residents, business owners, and anyone interested in downtown Phoenix development.',
        },
        {
          question: 'Why does it matter?',
          answer: 'Community input directly influences city planning decisions and ensures development aligns with resident needs.',
        },
        {
          question: 'What should I expect?',
          answer: 'Presentations on proposed projects, Q&A with city officials, and opportunities to provide written feedback.',
        },
      ],
    },
    {
      id: 'fallback-2',
      title: 'Town Hall - Education Reform Debate',
      location: 'Austin, Texas',
      address: '301 W 2nd St, Austin, TX 78701',
      venue: 'Austin City Hall',
      date: 'Jan 08, 2025 • 6:00 PM',
      time: '6:00 PM',
      aiOverview: 'An open town hall forum to debate education reform proposals. School board members and community leaders will present plans and answer questions from concerned parents and educators.',
      image: require('@/assets/images/event2.png'),
      imageKey: 'event2',
      organizer: 'Austin Independent School District',
      websiteLink: 'https://www.austinisd.org',
      impactStatement: 'The proposed education reforms will affect curriculum, funding, and resources across all Austin public schools, making this a critical event for families and educators.',
      qaPairs: [
        {
          question: 'Who is this for?',
          answer: 'Parents, teachers, students, and anyone concerned about education policy in Austin.',
        },
        {
          question: 'Why does it matter?',
          answer: 'These reforms will shape education quality and resources for thousands of students across the district.',
        },
        {
          question: 'What should I expect?',
          answer: 'Policy presentations, moderated debate, and open forum for public questions and comments.',
        },
      ],
    },
    {
      id: 'fallback-3',
      title: 'Policy Forum - Climate Action Strategy',
      location: 'Seattle, Washington',
      address: '600 4th Ave, Seattle, WA 98104',
      venue: 'Seattle Municipal Tower',
      date: 'Feb 02, 2025 • 5:30 PM',
      time: '5:30 PM',
      aiOverview: 'A policy forum focused on Seattle\'s climate action strategy for the next decade. Environmental experts and city planners will discuss sustainability initiatives and carbon reduction goals.',
      image: require('@/assets/images/event3.png'),
      imageKey: 'event3',
      organizer: 'Seattle Office of Sustainability & Environment',
      websiteLink: 'https://www.seattle.gov/environment',
      impactStatement: 'Seattle\'s climate strategy will set binding targets for emissions reduction and green infrastructure, directly affecting city policies and residents\' daily lives.',
      qaPairs: [
        {
          question: 'Who is this for?',
          answer: 'Environmental advocates, city residents, businesses, and anyone interested in climate action.',
        },
        {
          question: 'Why does it matter?',
          answer: 'The strategy establishes concrete goals and timelines for Seattle to achieve carbon neutrality and climate resilience.',
        },
        {
          question: 'What should I expect?',
          answer: 'Expert presentations on climate data, proposed initiatives, and interactive discussion on implementation strategies.',
        },
      ],
    },
  ];
}
