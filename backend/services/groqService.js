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
      model: 'llama3-8b-8192',
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

module.exports = {
  parseUnstructuredText
};
