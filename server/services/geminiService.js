const { GoogleGenerativeAI } = require('@google/generative-ai');

// Model fallback order – first confirmed working model is used
const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite',
];

let _cachedModelName = null; // Cache the first working model for this process

/**
 * Returns a working Gemini model, trying each in PREFERRED_MODELS order.
 * Caches the first successful model name for subsequent calls.
 */
const getWorkingModel = async () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set in environment variables.');

  const genAI = new GoogleGenerativeAI(key);

  // Use cached model if available
  if (_cachedModelName) {
    return genAI.getGenerativeModel({ model: _cachedModelName });
  }

  // Try each model with a lightweight test call
  for (const modelName of PREFERRED_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      await model.generateContent('hi'); // lightweight probe
      _cachedModelName = modelName;
      console.log(`[Gemini] Using model: ${modelName}`);
      return model;
    } catch (e) {
      const isQuota = e.message?.includes('429') || e.message?.includes('quota');
      const isNotFound = e.message?.includes('404') || e.message?.includes('not found');
      console.warn(`[Gemini] Model ${modelName} unavailable (${isQuota ? 'quota' : isNotFound ? 'not found' : e.message?.slice(0, 40)}), trying next...`);
    }
  }

  throw new Error(
    'All Gemini models are currently unavailable. Your free tier quota may be exhausted. ' +
    'Please try again later or check https://ai.google.dev/'
  );
};

// Safely extract JSON from a possibly markdown-wrapped Gemini response
const extractJSON = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty response from AI. Please try again.');
  }

  // Strip markdown code fences
  let cleaned = text
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/```\s*$/im, '')
    .trim();

  // Slice from first { to last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try { return JSON.parse(cleaned); } catch (_) {}

  // Fix trailing commas
  try {
    const fixed = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    return JSON.parse(fixed);
  } catch (_) {}

  // Regex fallback
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (_) {}
  }

  throw new Error('AI response could not be parsed. Please try again.');
};

/**
 * Generate a full trip itinerary using Gemini AI.
 */
const generateTripItinerary = async (tripDetails) => {
  const {
    source,
    destination,
    startDate,
    endDate,
    budget,
    members,
    accommodationType,
    currency = 'USD',
  } = tripDetails;

  const days = Math.max(
    1,
    Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
  );

  console.log(`[Gemini] Generating trip: ${source} → ${destination}, ${days} days, ${budget} ${currency}`);

  const prompt = `
You are an expert travel planner AI. Generate a comprehensive travel itinerary as valid JSON only.
CRITICAL: Output ONLY a raw JSON object. No markdown, no code fences, no text before or after the JSON.

Trip Details:
- From: ${source}
- To: ${destination}
- Start Date: ${new Date(startDate).toDateString()}
- End Date: ${new Date(endDate).toDateString()}
- Duration: ${days} days
- Total Budget: ${budget} ${currency}
- Number of Travelers: ${members}
- Accommodation Type: ${accommodationType}

Return this exact JSON structure:
{
  "overview": "3-4 sentence overview of this trip",
  "daily_itinerary": [
    {
      "day": 1,
      "date": "Day 1 date string",
      "title": "Day theme title",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Activity name",
          "description": "Detailed description",
          "location": "Location name",
          "cost": 20,
          "tips": "Helpful travel tip"
        }
      ]
    }
  ],
  "transportation": {
    "arrival": "How to get from ${source} to ${destination}",
    "local": "Local transportation options in ${destination}",
    "departure": "Return journey details",
    "estimated_cost": 150
  },
  "hotels": [
    {
      "name": "Hotel name",
      "type": "${accommodationType}",
      "location": "Neighborhood in ${destination}",
      "price_per_night": 80,
      "rating": 4.2,
      "amenities": ["WiFi", "Pool", "Breakfast"],
      "booking_url": "https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}",
      "description": "Brief description of this hotel"
    }
  ],
  "budget_breakdown": {
    "accommodation": 400,
    "food": 200,
    "transportation": 150,
    "activities": 100,
    "shopping": 50,
    "emergency": 100,
    "total": ${budget},
    "per_person": ${Math.round(budget / Math.max(members, 1))},
    "currency": "${currency}"
  },
  "packing_checklist": [
    "Passport/ID", "Travel insurance", "Comfortable walking shoes",
    "Weather-appropriate clothing", "Sunscreen", "Power adapter",
    "Medications", "Camera", "Travel pillow", "Snacks for journey"
  ],
  "travel_warnings": [
    "Check visa requirements before departure",
    "Keep copies of important documents",
    "Stay hydrated and carry water",
    "Respect local customs and dress codes"
  ],
  "best_time_to_visit": "Information about optimal visit timing for ${destination}",
  "local_cuisine": ["Must-try dish 1", "Must-try dish 2", "Must-try dish 3"],
  "emergency_contacts": {
    "police": "Local police number",
    "ambulance": "Local ambulance number",
    "tourist_helpline": "Tourist assistance number"
  }
}

IMPORTANT: Include exactly 12 to 15 DIFFERENT hotels in the "hotels" array. Hotels must be realistic and specific to ${destination}, covering budget (under $60/night), mid-range ($60-$150/night), and luxury ($150+/night) options. Each hotel must have a unique name, specific neighborhood/location, accurate rating (3.0 to 5.0), and realistic price.
Make all content specific to ${destination} and realistic for a ${budget} ${currency} budget for ${members} traveler(s).
`;

  try {
    const model = await getWorkingModel();
    console.log('[Gemini] Sending request...');
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log('[Gemini] Raw response length:', text?.length ?? 0);

    if (!text) throw new Error('No response received from AI. Please try again.');

    const parsed = extractJSON(text);

    if (!parsed.overview || !parsed.daily_itinerary) {
      throw new Error('AI returned incomplete data. Please try again.');
    }

    if (!Array.isArray(parsed.hotels)) parsed.hotels = [];

    if (!parsed.budget_breakdown) {
      parsed.budget_breakdown = {
        accommodation: Math.round(budget * 0.35),
        food: Math.round(budget * 0.25),
        transportation: Math.round(budget * 0.2),
        activities: Math.round(budget * 0.1),
        shopping: Math.round(budget * 0.05),
        emergency: Math.round(budget * 0.05),
        total: budget,
        per_person: Math.round(budget / Math.max(members, 1)),
        currency,
      };
    }

    console.log('[Gemini] Trip itinerary generated successfully.');
    return parsed;
  } catch (err) {
    // Reset cached model if it started failing (e.g. quota hit mid-session)
    if (err.message?.includes('429') || err.message?.includes('quota')) {
      _cachedModelName = null;
    }
    throw err;
  }
};

/**
 * Translate text between languages.
 */
const translateMessage = async (text, fromLang, toLang) => {
  if (fromLang === toLang) return text;
  try {
    const model = await getWorkingModel();
    const prompt = `Translate the following text from ${fromLang} to ${toLang}. Return ONLY the translated text, nothing else:\n\n"${text}"`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/^\"|\"$/g, '');
  } catch (err) {
    console.error('[Gemini] Translation error:', err.message);
    return text; // Graceful fallback — return original
  }
};

/**
 * Answer a travel-related question using Gemini AI.
 */
const answerTravelQuestion = async (question, context = '') => {
  console.log('[Gemini] Chatbot question:', question?.slice(0, 100));
  try {
    const model = await getWorkingModel();
    const prompt = `You are a friendly and knowledgeable AI travel assistant for a tourism platform called AI Tourism.
${context ? `Conversation context:\n${context}\n` : ''}
User question: ${question}

Provide a helpful, accurate, and conversational response. Be warm and friendly. Aim for 2-4 short paragraphs. Include specific tips, recommendations, or facts where relevant.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    if (!answer) throw new Error('AI returned an empty response.');

    console.log('[Gemini] Chatbot answer ready, length:', answer.length);
    return answer;
  } catch (err) {
    // Reset cache if quota hit
    if (err.message?.includes('429') || err.message?.includes('quota')) {
      _cachedModelName = null;
    }
    throw err;
  }
};

module.exports = { generateTripItinerary, translateMessage, answerTravelQuestion };
