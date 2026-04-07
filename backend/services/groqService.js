const OpenAI = require('openai');
require('dotenv').config();

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
];

const VISION_MODELS = [
  'meta-llama/llama-4-scout-17b-16e-instruct',
];

let client;
try {
  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY is missing in .env. AI features will use fallback mock data.');
  } else {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error.message);
}

async function createChatCompletionWithFallback(buildPayload) {
  let lastError;

  for (const model of MODELS) {
    try {
      return await client.chat.completions.create(buildPayload(model));
    } catch (error) {
      lastError = error;
      console.warn(`Model ${model} failed, trying next model: ${error.message}`);
    }
  }

  throw lastError || new Error('All configured Groq models failed.');
}

async function createVisionCompletionWithFallback(buildPayload) {
  let lastError;

  for (const model of VISION_MODELS) {
    try {
      return await client.chat.completions.create(buildPayload(model));
    } catch (error) {
      lastError = error;
      console.warn(`Vision model ${model} failed, trying next vision model: ${error.message}`);
    }
  }

  throw lastError || new Error('All configured Groq vision models failed.');
}

/**
 * Parses unstructured text into a structured JSON object.
 * @param {string} text - The input text from WhatsApp/Voice/OCR.
 * @returns {Promise<Object>} - Structured object: { location, issueType, urgency, description }
 */
async function parseUnstructuredText(text) {
  if (!client) {
    return {
      issueType: 'Other',
      urgency: 5,
      description: text,
      location: { coordinates: [77.1025, 28.7041], address: 'Unknown' }, // Default to New Delhi
      aiAnalysis: { reasoning: 'AI client not initialized, used fallback defaults.' }
    };
  }

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
    const response = await createChatCompletionWithFallback((model) => ({
      messages: [
        { role: 'system', content: 'You are a helpful assistant that extracts structured data from reports in JSON format.' },
        { role: 'user', content: prompt }
      ],
      model,
      response_format: { type: 'json_object' }
    }));

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

async function chatWithAssistant(messages = [], role = 'citizen', language = 'en', contextStr = '') {
  if (!client) {
    return 'I could not generate a response right now as the AI service is not configured.';
  }

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

  try {
    const response = await createChatCompletionWithFallback((model) => ({
      model,
      messages: [
        {
          role: 'system',
          content: `${roleInstructions[role] || roleInstructions.citizen} ${selectedLanguageInstruction} Understand mixed-language input (English + local language) and keep replies concise, practical, and friendly. IMPORTANT: DO NOT hallucinate or make up events, tasks, or names. If asked about events or tasks, ONLY reference the following LIVE SYSTEM CONTEXT. If the context is empty, inform the user there are no current items.\n\n### LIVE SYSTEM CONTEXT ###\n${contextStr}\n###########################`,
        },
        ...messages,
      ],
      temperature: 0.4,
    }));

    return response.choices?.[0]?.message?.content?.trim() || 'I could not generate a response right now.';
  } catch (error) {
    console.error('Error in chatWithAssistant:', error);
    return 'I am sorry, I am having trouble connecting to my brain right now.';
  }
}

async function generateCompletion(prompt) {
  if (!client) {
    return { predictedUrgency: 5, crisisType: 'Unknown', reasoning: 'AI client not initialized.' };
  }

  try {
    const response = await createChatCompletionWithFallback((model) => ({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    }));

    return response.choices?.[0]?.message?.content || '{}';
  } catch (error) {
    console.error('Error in generateCompletion:', error);
    return '{}';
  }
}

async function analyzeReportImage(imageBase64) {
  if (!client) {
    return {
      description: 'AI client not initialized.',
      issueType: 'Other',
      urgency: 5,
      aiSummary: 'Vision model unavailable.',
      isRelevant: true,
      relevanceScore: 50,
      relevanceReason: 'AI not configured; allow manual review.'
    };
  }

  try {
    const response = await createVisionCompletionWithFallback((model) => ({
      model,
      messages: [
        {
          role: 'system',
          content: 'You analyze images for a civic reporting app used by citizens, volunteers, and NGOs. Your job is to turn an image into a report-ready summary that explains the community need or problem shown in the image. Do not write a generic scene caption. Write the description as a citizen report that fits a complaint, request, or assistance submission.'
        },
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: 'Return ONLY valid JSON with keys: "description", "issueType", "urgency", "aiSummary", "isRelevant", "relevanceScore", "relevanceReason".\n\nWrite the output for a citizen report workflow. The description must be issue-oriented and actionable, not a literal object listing.\n\nRules:\n- issueType must be one of: Food, Health, Education, Infrastructure, Safety, Environment, Other\n- urgency must be an integer from 1 to 10\n- relevanceScore must be 0 to 100\n- isRelevant should be true for direct evidence OR closely related evidence of community issues (for example: classroom problems, school crowding, damaged desks, poor sanitation in schools, road damage, waterlogging, garbage, unsafe area, crowding near incident, relief line, medical camp context, etc.)\n- isRelevant should be false only when image is clearly unrelated (selfies, pets, product photos, random objects with no civic context, abstract graphics)\n- Be tolerant: if uncertain but possibly related, keep isRelevant true with medium relevanceScore\n- description: a report-style summary of the community need or issue shown; if the image suggests education, write it like a citizen request for a better education session / learning environment / school support, not just a scene description\n- aiSummary: short visual notes useful for volunteers\n- relevanceReason: one line explaining why accepted/rejected\n\nExamples of the style we want:\n- Instead of: "A group of children wearing masks standing in a classroom."\n- Prefer: "Children in a classroom appear to need a proper, well-supported education session and learning environment."\n- Instead of: "People standing near a building."\n- Prefer: "Community members are gathered at a site that may need civic attention or support."' 
            },
            { 
              type: 'image_url', 
              image_url: { url: imageBase64 } 
            }
          ]
        }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 512
    }));

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error in analyzeReportImage:', error);
    return {
      description: '',
      issueType: 'Other',
      urgency: 5,
      aiSummary: 'Vision AI unavailable. Using OCR/manual input.',
      isRelevant: true,
      relevanceScore: 45,
      relevanceReason: 'Vision service unavailable; allow manual category review.'
    };
  }
}

async function generateCivicTweet(report) {
  // Authority Twitter handle mapping — extend this as needed
  const AUTHORITY_HANDLES = {
    Infrastructure: '@MoRTH_India @cpwdIndia',
    Safety:         '@PMOIndia @HMOIndia',
    Environment:    '@moefcc @NMCGIndia',
    Food:           '@fooddeptIndia @fssaiindia',
    Health:         '@MoHFW_INDIA @AyushmanNHA',
    Education:      '@EduMinOfIndia @ugc_india',
    Other:          '@PMOIndia'
  };

  // City/state authority handles (attempt to extract from address)
  const cityHandles = extractCityHandles(report.address || report.location?.address || '');

  const authorityHandle = AUTHORITY_HANDLES[report.issueType] || '@PMOIndia';
  const combinedHandles = [authorityHandle, cityHandles].filter(Boolean).join(' ');

  const daysOpen = Math.floor(
    (Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (!client) {
    // Fallback: generate without AI
    return buildFallbackTweet(report, combinedHandles, daysOpen);
  }

  const prompt = `You are a civic activist helping an Indian citizen raise awareness about an unresolved community issue. 

Issue details:
- Type: ${report.issueType}
- Description: ${report.description}
- Location: ${report.address || report.location?.address || 'Not specified'}
- Urgency: ${report.urgency}/10
- Days unresolved: ${daysOpen} days
- Category: ${report.category || report.issueType}

Write a compelling tweet (MUST be under 250 characters to leave room for handles and hashtags) that:
1. Clearly states the issue and location
2. Conveys urgency and the number of days it has been unresolved  
3. Appeals to authorities to act
4. Uses 2-3 relevant hashtags (e.g. #SwachhBharat #FixMyRoad #JanSuraksha)
5. Is in a tone that is firm but respectful — not aggressive
6. In Hinglish (mix of Hindi words and English is fine and preferred for Indian Twitter)

Return ONLY the tweet text — no quotes, no explanation, nothing else. It will be posted directly.`;

  const finalizeTweet = (coreTweet, suffix) => {
    const safeCore = (coreTweet || '').trim().replace(/\s+/g, ' ');
    const safeSuffix = suffix.trim();
    const maxCoreLength = Math.max(0, 280 - safeSuffix.length - 1);
    const trimmedCore = safeCore.length > maxCoreLength
      ? `${safeCore.slice(0, Math.max(0, maxCoreLength - 1)).trimEnd()}…`
      : safeCore;

    return `${trimmedCore}\n${safeSuffix}`.slice(0, 280);
  };

  try {
    const response = await createChatCompletionWithFallback((model) => ({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 120,
      temperature: 0.7
    }));
    const aiTweet = response.choices[0]?.message?.content?.trim() || '';
    return finalizeTweet(aiTweet, `${combinedHandles} #Saathi`);
  } catch (err) {
    console.error('Groq tweet generation failed:', err.message);
    return buildFallbackTweet(report, combinedHandles, daysOpen);
  }
}

function buildFallbackTweet(report, handles, daysOpen) {
  const finalizeTweet = (coreTweet, suffix) => {
    const safeCore = (coreTweet || '').trim().replace(/\s+/g, ' ');
    const safeSuffix = suffix.trim();
    const maxCoreLength = Math.max(0, 280 - safeSuffix.length - 1);
    const trimmedCore = safeCore.length > maxCoreLength
      ? `${safeCore.slice(0, Math.max(0, maxCoreLength - 1)).trimEnd()}…`
      : safeCore;

    return `${trimmedCore}\n${safeSuffix}`.slice(0, 280);
  };

  const templates = {
    Infrastructure: `🚧 URGENT: ${report.description?.slice(0, 60) || 'Infrastructure issue'} at ${report.address?.split(',')[0] || report.location?.address?.split(',')[0] || 'our area'} is UNRESOLVED for ${daysOpen} days. This is a safety hazard! Immediate action needed. #FixMyRoad #JanSuraksha #Saathi`,
    Safety:         `⚠️ SAFETY ALERT: ${report.description?.slice(0, 60) || 'Safety issue'} near ${report.address?.split(',')[0] || report.location?.address?.split(',')[0] || 'residential area'} — ${daysOpen} days & no action. Citizens at risk! #JanSuraksha #Saathi`,
    Environment:    `🌿 ${report.description?.slice(0, 60) || 'Environmental issue'} at ${report.address?.split(',')[0] || report.location?.address?.split(',')[0] || 'our locality'} unattended for ${daysOpen} days. Environmental hazard growing! #SwachhBharat #Saathi`,
    Other:          `📢 Issue reported ${daysOpen} days ago: ${report.description?.slice(0, 80) || 'Community problem'} at ${report.address?.split(',')[0] || report.location?.address?.split(',')[0] || 'our area'}. Still waiting for resolution! #Saathi`
  };
  const tweet = templates[report.issueType] || templates['Other'];
  return finalizeTweet(tweet, handles);
}

function extractCityHandles(address) {
  const city = (address || '').toLowerCase();
  if (city.includes('delhi') || city.includes('new delhi')) return '@DelhiPolice @DMRC';
  if (city.includes('mumbai') || city.includes('bombay')) return '@mybmc @MumbaiPolice';
  if (city.includes('bangalore') || city.includes('bengaluru')) return '@BBMPCOMM @cpblr';
  if (city.includes('hyderabad')) return '@GHMCOnline @cyberabadpolice';
  if (city.includes('chennai')) return '@chennaicorp @chennaipolice';
  if (city.includes('kolkata')) return '@kmc_kolkata @KolkataPolice';
  if (city.includes('pune')) return '@PMCPune @punepolice';
  if (city.includes('dehradun')) return '@DehradunMC @uttarakhandcops';
  if (city.includes('lucknow')) return '@lucknow_nagar @UPPolice';
  if (city.includes('jaipur')) return '@JMCJaipur @jaipur_police';
  return '';
}

module.exports = {
  parseUnstructuredText,
  chatWithAssistant,
  generateCompletion,
  analyzeReportImage,
  generateCivicTweet
};
