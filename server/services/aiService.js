const OpenAI = require('openai');

let openai = null;

// Initialize OpenAI only if API key is present and not a placeholder
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const AI_MODE = openai ? 'live' : 'mock';
const MODEL_NAME = process.env.AI_MODEL || 'gpt-5.5';

console.log(`AI Service: ${AI_MODE === 'live' ? `LIVE (model: ${MODEL_NAME})` : 'MOCK (no API key)'}`);

/**
 * Analyze a device issue and classify it
 */
const analyzeIssue = async ({ deviceCategory, deviceBrand, deviceModel, issueCategory, issueDescription }) => {
  if (AI_MODE === 'mock') {
    return getMockAnalysis({ deviceCategory, issueCategory, issueDescription });
  }

  try {
    const prompt = `You are a professional device repair technician AI assistant for FixFirst, a repair marketplace.

Analyze the following device issue and provide a structured assessment:

Device: ${deviceBrand} ${deviceModel} (${deviceCategory})
Issue Category: ${issueCategory}
Issue Description: ${issueDescription}

Respond with a JSON object containing:
{
  "classification": "software" | "hardware" | "both" | "inspection_required",
  "confidence": number (0-100),
  "summary": "brief 1-2 sentence summary",
  "possibleCauses": ["cause1", "cause2", "cause3"],
  "troubleshootingSteps": ["step1", "step2", "step3"],
  "professionalRepairRecommended": boolean,
  "safetyWarnings": ["warning if any"],
  "canResolveRemotely": boolean,
  "estimatedSeverity": "low" | "medium" | "high"
}

IMPORTANT RULES:
- Never claim physical damage is confirmed from a description alone
- For physical/hardware issues, always recommend professional inspection
- Keep troubleshooting steps beginner-friendly
- Be clear about uncertainty`;

    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return { ...result, analyzedAt: new Date(), source: 'openai', model: MODEL_NAME };
  } catch (error) {
    console.error(`AI analysis error [${error.status || error.code}]: ${error.message}`);
    // Surface billing/quota errors to the client clearly
    if (error.status === 429) throw error;
    return getMockAnalysis({ deviceCategory, issueCategory, issueDescription });
  }
};

/**
 * AI Chatbot for troubleshooting conversation
 */
const getTroubleshootingResponse = async (messages, deviceContext) => {
  if (AI_MODE === 'mock') {
    return getMockChatResponse(messages, deviceContext);
  }

  try {
    const systemPrompt = `You are a friendly, expert device repair technician for FixFirst. 
    
Device being discussed: ${deviceContext.brand} ${deviceContext.model} (${deviceContext.category})
Reported issue: ${deviceContext.issueDescription}
Issue type: ${deviceContext.issueCategory}

Your role:
- Help customers troubleshoot software-related issues step by step
- Ask clarifying questions when needed
- Explain solutions in simple, beginner-friendly language
- If the issue seems hardware-related or you cannot help remotely, clearly state that and recommend professional repair
- Never make up solutions or invent diagnoses
- Be honest about uncertainty
- Keep responses concise and actionable
- Do NOT use markdown formatting like ** or ## - use plain conversational text`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: chatMessages,
      temperature: 0.5,
      max_tokens: 500,
    });

    return {
      message: response.choices[0].message.content,
      source: 'openai',
      model: MODEL_NAME,
    };
  } catch (error) {
    console.error(`AI chat error [${error.status || error.code}]: ${error.message}`);
    if (error.status === 429) throw error;
    return getMockChatResponse(messages, deviceContext);
  }
};

// ─────────────────────────────────────────────
// MOCK RESPONSES (used when no API key is set)
// ─────────────────────────────────────────────

const getMockAnalysis = ({ deviceCategory, issueCategory, issueDescription }) => {
  const isHardware = [
    'Screen damage', 'Battery', 'Charging', 'Camera', 'Buttons', 'Water damage', 'Speaker', 'Microphone',
  ].includes(issueCategory);

  const isSoftware = ['Software', 'Performance'].includes(issueCategory);

  const classification = isHardware ? 'hardware' : isSoftware ? 'software' : 'both';

  const mockData = {
    software: {
      classification: 'software',
      confidence: 75,
      summary: 'This appears to be a software-related issue that may be resolvable without professional repair.',
      possibleCauses: [
        'Corrupted system cache or temporary files',
        'Software conflict from recent app installation',
        'Insufficient storage space affecting performance',
        'Outdated operating system or application',
      ],
      troubleshootingSteps: [
        'Restart your device completely (hold power button, select Restart)',
        'Check for and install any pending system or app updates',
        'Clear the cache of affected applications (Settings > Apps > [App] > Clear Cache)',
        'Free up storage space by removing unused apps and files',
        'If the issue persists, consider a factory reset after backing up your data',
      ],
      professionalRepairRecommended: false,
      safetyWarnings: [],
      canResolveRemotely: true,
      estimatedSeverity: 'low',
    },
    hardware: {
      classification: 'hardware',
      confidence: 70,
      summary: 'This issue appears to involve a physical hardware component. Professional inspection is recommended.',
      possibleCauses: [
        'Physical damage to the component',
        'Normal wear and tear over time',
        'Manufacturing defect',
        'Damage from accidental drop or impact',
      ],
      troubleshootingSteps: [
        'Do not attempt to open or repair the device yourself as this may void warranty',
        'Avoid using the device further if it may cause additional damage',
        'Document the issue with photographs for the repair vendor',
        'Note when the issue first appeared and any events that may have caused it',
      ],
      professionalRepairRecommended: true,
      safetyWarnings: [
        'Do not attempt DIY repair without proper tools and expertise',
        'For battery issues, do not charge a swollen battery',
        'For water damage, keep the device powered off',
      ],
      canResolveRemotely: false,
      estimatedSeverity: 'high',
    },
    both: {
      classification: 'both',
      confidence: 60,
      summary: 'This issue could be related to software, hardware, or a combination of both. Some basic troubleshooting steps are recommended before seeking professional repair.',
      possibleCauses: [
        'Software issue exacerbating hardware problem',
        'Driver or firmware issue',
        'Component failure causing software errors',
        'Configuration issue',
      ],
      troubleshootingSteps: [
        'Restart the device to rule out temporary software glitches',
        'Check for software updates that may address known issues',
        'Test the affected feature in safe mode or minimal state',
        'If the issue persists after basic troubleshooting, seek professional inspection',
      ],
      professionalRepairRecommended: true,
      safetyWarnings: [],
      canResolveRemotely: false,
      estimatedSeverity: 'medium',
    },
  };

  const result = mockData[classification] || mockData.both;
  return {
    ...result,
    analyzedAt: new Date(),
    source: 'mock',
    mockMode: true,
  };
};

const getMockChatResponse = (messages, deviceContext) => {
  const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  let response;

  if (lastUserMessage.includes('restart') || lastUserMessage.includes('reboot')) {
    response = 'Good thinking! Restarting your device is one of the most effective first steps. Hold the power button for a few seconds, select Restart (not just power off), and wait for it to fully boot up. Did restarting the device help resolve the issue?';
  } else if (lastUserMessage.includes('update') || lastUserMessage.includes('software')) {
    response = 'Keeping your software updated is important. Go to your device Settings, find Software Update or System Update, and check if there are any pending updates. Install them and see if that resolves the issue. Let me know what you find.';
  } else if (lastUserMessage.includes('yes') || lastUserMessage.includes('worked') || lastUserMessage.includes('fixed')) {
    response = 'That is great to hear! I am glad we could resolve the issue. If the problem comes back or you experience any other issues, do not hesitate to reach out. Would you like to close this support request?';
  } else if (lastUserMessage.includes('no') || lastUserMessage.includes('still') || lastUserMessage.includes('not working')) {
    response = 'I understand, let us try a different approach. Based on the issue you described, I would recommend clearing the app cache. Go to Settings, then Apps or Application Manager, find the affected app, and tap Clear Cache. Does that help?';
  } else if (messages.length <= 2) {
    response = `I can see you are having an issue with your ${deviceContext.brand} ${deviceContext.model}. Let me help you troubleshoot this step by step. First, have you tried restarting your device recently? Sometimes a simple restart can resolve many common issues.`;
  } else {
    response = 'Based on the troubleshooting steps we have tried, it appears this issue may require professional attention. I recommend connecting with a qualified repair vendor who can physically inspect your device and provide an accurate diagnosis. Would you like to view available repair vendors near you?';
  }

  return {
    message: response,
    source: 'mock',
    mockMode: true,
  };
};

module.exports = {
  analyzeIssue,
  getTroubleshootingResponse,
  AI_MODE,
};
