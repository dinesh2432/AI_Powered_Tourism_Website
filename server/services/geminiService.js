const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateTripItinerary = async (tripDetails) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const { source, destination, startDate, endDate, budget, members, accommodationType, currency = 'USD' } = tripDetails;

  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

  const prompt = `
You are an expert travel planner AI. Generate a comprehensive, detailed travel itinerary in valid JSON format only.

Trip Details:
- From: ${source}
- To: ${destination}
- Start Date: ${new Date(startDate).toDateString()}
- End Date: ${new Date(endDate).toDateString()}
- Duration: ${days} days
- Total Budget: ${budget} ${currency}
- Number of Travelers: ${members}
- Accommodation Type: ${accommodationType}

Return ONLY a valid JSON object with this exact structure:
{
  "overview": "A compelling 3-4 sentence overview of this trip",
  "daily_itinerary": [
    {
      "day": 1,
      "date": "Day 1 date",
      "title": "Day title",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Activity name",
          "description": "Detailed description",
          "location": "Location name",
          "cost": 20,
          "tips": "Helpful tip"
        }
      ]
    }
  ],
  "transportation": {
    "arrival": "How to get from source to destination",
    "local": "Local transportation options",
    "departure": "Return journey details",
    "estimated_cost": 150
  },
  "hotels": [
    {
      "name": "Hotel name",
      "type": "${accommodationType}",
      "location": "Hotel location in ${destination}",
      "price_per_night": 80,
      "rating": 4.2,
      "amenities": ["WiFi", "Pool", "Breakfast"],
      "booking_url": "https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}",
      "description": "Brief description"
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
    "per_person": ${Math.round(budget / members)},
    "currency": "${currency}"
  },
  "packing_checklist": [
    "Passport/ID",
    "Travel insurance",
    "Comfortable walking shoes",
    "Weather-appropriate clothing",
    "Sunscreen",
    "Power adapter",
    "Medications",
    "Camera",
    "Travel pillow",
    "Snacks for journey"
  ],
  "travel_warnings": [
    "Check visa requirements before departure",
    "Keep copies of important documents",
    "Stay hydrated",
    "Respect local customs and dress codes"
  ],
  "best_time_to_visit": "Information about optimal visit timing",
  "local_cuisine": ["Must-try dish 1", "Must-try dish 2", "Must-try dish 3"],
  "emergency_contacts": {
    "police": "Local police number",
    "ambulance": "Local ambulance number",
    "tourist_helpline": "Tourist assistance number"
  }
}

Make it realistic, specific to ${destination}, and within the ${budget} ${currency} budget for ${members} person(s).
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response as JSON');
  }

  return JSON.parse(jsonMatch[0]);
};

const translateMessage = async (text, fromLang, toLang) => {
  if (fromLang === toLang) return text;

  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  const prompt = `Translate the following text from ${fromLang} to ${toLang}. Return ONLY the translated text, nothing else:\n\n"${text}"`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim().replace(/^"|"$/g, '');
};

const answerTravelQuestion = async (question, context = '') => {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  const prompt = `You are a knowledgeable and friendly AI travel assistant for the AI Tourism Platform. 
${context ? `Context: ${context}` : ''}

User question: ${question}

Provide a helpful, accurate, and engaging response about travel. Be concise (2-4 paragraphs max). Include specific tips, recommendations, or facts where relevant.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = { generateTripItinerary, translateMessage, answerTravelQuestion };
