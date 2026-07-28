import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = process.env.GEMINI_API_KEY || '';

// Initialize Google Generative AI SDK if API Key exists
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

/**
 * Invokes Gemini 1.5 Flash model to compile monthly summaries and insights.
 */
export async function generateGeminiSummaryReport(contextPrompt: string): Promise<string> {
  try {
    if (!genAI) {
      console.warn('GEMINI_API_KEY missing. Returning simulated monthly insights report.');
      return ''; // returning empty allows the calling action to compile local markdown
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await model.generateContent(contextPrompt);
    return response.response.text() || '';
  } catch (error) {
    console.error('Gemini report generation error:', error);
    return ''; // fallback to local mockups
  }
}

/**
 * Handles multi-turn chat interactions with the assistant, referencing user financial logs.
 */
export async function generateGeminiChatResponse(
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userMessage: string,
  contextData: string,
): Promise<string> {
  try {
    if (!genAI) {
      console.warn('GEMINI_API_KEY missing. Returning local context-aware response.');
      return ''; // returning empty lets caller run mock pattern-matcher
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Prefix context details to guide the assistant
    const systemPrompt = `You are AstraBank's AI Financial Assistant. Here is the user's real-time financial context (accounts, budgets, transactions):
${contextData}

Answer questions accurately based on this context. Keep replies concise, helpful, and formatted in markdown.`;

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I will help the user manage their finances using their account ledger context.' }] },
        ...history,
      ],
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text() || '';
  } catch (error) {
    console.error('Gemini chat error:', error);
    return '';
  }
}
