const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Parses unstructured text into a structured JSON object.
 * @param {string} text - The input text from WhatsApp/Voice/OCR.
 * @returns {Promise<Object>} - Structured object: { location, issueType, urgency, description }
 */
async function parseUnstructuredText(text) {
  const prompt = `
    Analyze the following community need report and extract structured information into JSON format.
    Fields needed:
    - location: { coordinates: [longitude, latitude], address: string } (Estimate coordinates if address is provided, e.g., for Indian context)
    - issueType: One of [Food, Health, Education, Infrastructure, Safety, Environment, Other]
    - urgency: An integer between 1-10
    - description: A clear, concise summary of the issue
    - aiAnalysis: { reasoning: string }

    Input Text: "${text}"

    Respond ONLY with a valid JSON object.
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant that extracts structured data from reports in JSON format.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error calling Groq API:', error);
    // Return a basic structure on failure
    return {
      issueType: 'Other',
      urgency: 5,
      description: text,
      location: { coordinates: [77.1025, 28.7041], address: 'Unknown' }, // Default to New Delhi
      aiAnalysis: { reasoning: 'Failed to parse with AI, used fallback defaults.' }
    };
  }
}

async function chatWithAssistant(messages = [], role = 'citizen', language = 'en') {
  const roleInstructions = {
    admin: 'You are the Saathi admin assistant. Focus on reports, volunteer management, statistics, and operational coordination.',
    volunteer: 'You are the Saathi volunteer assistant. Focus on assigned tasks, matching, communication, availability, and clear action steps.',
    citizen: 'You are the Saathi citizen assistant. Focus on reporting community needs, using the chatbot, and explaining what to do next in simple language.',
  };

  const languageInstructions = {
    en: 'Respond in English.',
    hi: 'Respond in Hindi (Devanagari script).',
    ta: 'Respond in Tamil.',
    mr: 'Respond in Marathi.',
    bn: 'Respond in Bengali.',
    te: 'Respond in Telugu.',
    kn: 'Respond in Kannada.',
    ml: 'Respond in Malayalam.',
    gu: 'Respond in Gujarati.',
    pa: 'Respond in Punjabi.',
  };

  const selectedLanguageInstruction = languageInstructions[language] || 'Respond in the same language as the user when possible.';

  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `${roleInstructions[role] || roleInstructions.citizen} ${selectedLanguageInstruction} Understand mixed-language input (English + local language) and keep replies concise, practical, and friendly.`,
      },
      ...messages,
    ],
    temperature: 0.4,
  });

  return response.choices?.[0]?.message?.content?.trim() || 'I could not generate a response right now.';
}

module.exports = {
  parseUnstructuredText,
  chatWithAssistant,
};
