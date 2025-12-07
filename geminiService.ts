import { GoogleGenAI, Chat, GroundingChunk, GenerateContentResponse, Content } from "@google/genai";
import { UserProfile, InvestmentPlan, GroundingSource, AllocationItem } from '../types';

const getClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API_KEY is missing. Please provide a valid key.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * FINAL ATTEMPT - A definitive, robust, and simple function to verify an API key.
 * This version uses the `generateContent` endpoint, which is a lightweight and direct
 * way to test authentication. The validation logic is extremely strict, checking not
 * just for errors but for a definitive, valid response structure. This approach is
 * designed to be the most reliable and to finally resolve the persistent validation failures.
 *
 * @param apiKey The user-provided API key.
 * @returns A boolean indicating if the key is valid.
 */
export async function verifyApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return false;
  }
  try {
    const ai = getClient(apiKey);
    // FIX: Use generateContent instead of the deprecated countTokens method for validation.
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // A fast and standard model for this check
      contents: 'validation test', // A non-empty prompt
    });

    // **DEFINITIVE CHECK:** A successful response MUST have a `text` property
    // that is a non-empty string. Any other response, even if it doesn't
    // throw an error, is considered a failure. This prevents "false positives".
    if (result && typeof result.text === 'string' && result.text.length > 0) {
      return true; // The key is undeniably valid.
    } else {
      // This case handles silent failures where the API returns an empty or
      // malformed response without throwing an error.
      console.error("API Key validation failed: The response was malformed or empty.", result);
      return false;
    }
  } catch (error) {
    // This catches catastrophic failures like network errors or explicit
    // authentication errors (e.g., 401, 403) from the API.
    console.error("API Key validation failed with a network/authentication error:", error);
    return false;
  }
}


/**
 * Validates and sanitizes the AI's JSON output to prevent UI crashes.
 * Ensures all required fields exist and are of the correct type.
 */
const validateAndSanitizePlan = (data: any, summary: string): InvestmentPlan => {
  const allocations = Array.isArray(data.allocations) ? data.allocations
    .filter((a: any) => typeof a === 'object' && a.ticker)
    .map((a: any): AllocationItem => ({
      ticker: a.ticker || 'N/A',
      name: a.name || 'N/A',
      sector: a.sector || 'N/A',
      percentage: a.percentage || 0,
      type: a.type || 'ETF',
      rationale: a.rationale || 'No rationale provided.',
      accountType: a.accountType || 'Brokerage',
      dividendYield: a.dividendYield,
      technicalAnalysis: (typeof a.technicalAnalysis === 'object' && a.technicalAnalysis) 
          ? a.technicalAnalysis 
          : { summary: 'No technical analysis provided.', support: '-', resistance: '-', indicatorSignal: '-' },
      marketSentiment: (typeof a.marketSentiment === 'object' && a.marketSentiment)
          ? a.marketSentiment
          : { score: 'Neutral', summary: 'No sentiment analysis provided.', analystRating: '-' }
  })) : [];

  return {
    summary: summary || "No summary provided.",
    riskAnalysis: data.riskAnalysis || "",
    actionableSteps: Array.isArray(data.actionableSteps) ? data.actionableSteps : [],
    swot: (typeof data.swot === 'object' && data.swot) || { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    allocations: allocations,
    projections: Array.isArray(data.projections) ? data.projections.filter(p => typeof p === 'object' && p.year) : [],
    sources: [], // Will be populated from grounding metadata
    marketAnalysis: (typeof data.marketAnalysis === 'object' && data.marketAnalysis) || { macroOutlook: '', inflationForecast: '', interestRateView: '' },
    secEvents: Array.isArray(data.secEvents) ? data.secEvents.filter(e => typeof e === 'object') : [],
    sectorTrends: Array.isArray(data.sectorTrends) ? data.sectorTrends.filter(t => typeof t === 'object') : [],
    portfolioAnalysis: typeof data.portfolioAnalysis === 'object' ? data.portfolioAnalysis : undefined,
  };
};

export async function generateInvestmentStrategy(profile: UserProfile, apiKey: string): Promise<InvestmentPlan> {
  const ai = getClient(apiKey);

  const cash = Number(profile.cash) || 0;
  const brokerage = Number(profile.brokerageBalance) || 0;
  const roth = Number(profile.rothBalance) || 0;
  const income = Number(profile.annualIncome) || 0;
  const monthly = Number(profile.monthlyContribution) || 0;
  const age = Number(profile.age) || 30;
  const retirementAge = Number(profile.retirementAge) || 65;

  const totalCurrentAssets = cash + brokerage + roth;

  const prompt = `
    Act as a "Certified Financial Planner (CFP) and Financial Wellness Coach".
    Your philosophy is centered on empowering individuals to build a healthy relationship with money and achieve long-term financial well-being. Your tone is encouraging, educational, empathetic, and clear. You demystify complex topics and focus on actionable, habit-forming advice.

    Client's Financial Snapshot:
    - Age: ${age} (Target Retirement: ${retirementAge})
    - Annual Income: $${income}
    - FINANCIAL HEALTH PROFILE:
       - Cash / Emergency Fund: $${cash}
       - Taxable Investments: $${brokerage}
       - Retirement Accounts (Roth/401k): $${roth}
    - Total Net Worth Snapshot: $${totalCurrentAssets}
    - Monthly Savings Rate: $${monthly}
    - Stated Risk Tolerance: ${profile.riskTolerance}
    - Tax Status: ${profile.taxFilingStatus}
    - Financial Goals: ${profile.goals.join(', ')}
    - Geographic Focus: ${profile.geographicFocus.join(', ') || 'Global Diversification'}

    CLIENT'S CURRENT INVESTMENTS (Raw Import):
    "${profile.currentPortfolio || "No existing portfolio data provided."}"

    CORE TASKS (Utilize Google Search for current data):
    
    1. **Financial Health Summary**: Write an encouraging and clear executive summary titled "Your Financial Wellness Plan". Structure this summary using clear Markdown with the following H3 headings for maximum readability:
        - ### Your Financial Snapshot & Key Strengths
        - ### Opportunities for Growth & Improvement
        - ### A Clear Path Forward
        Use bullet points or numbered lists. Your goal is to build confidence and provide clarity. This summary MUST be the first part of your response.

    2. **Mindful Macro-Economic View**: Explain the current economic environment in simple terms. Focus on what it means for a long-term investor and how to remain disciplined, avoiding fear or greed.

    3. **Building Your Wealth Engine**: Recommend a core investment strategy based on the client's profile. Emphasize the principles of low-cost, diversified investing as the most reliable path to wealth creation.

    4. **Understanding Your Investments**: For each recommended holding, explain its purpose in simple terms.
       - **Why this investment?** What role does it play in your plan (e.g., "This is your engine for growth," or "This helps protect against inflation").
       - **Staying the Course:** Briefly mention current market sentiment or technicals not as a reason to trade, but as an educational point on market volatility. For example: "Markets are currently optimistic on tech, but our goal with this ETF is to hold it for decades, capturing long-term innovation regardless of short-term noise."

    5. **Financial Health Check-Up (CRITICAL)**:
       - Analyze the client's "Current Investments".
       - **If no portfolio is provided**: State this clearly. The first "actionableStep" must be "Let's get a full picture! Please import your current portfolio so we can do a complete financial health check-up." The "portfolioAnalysis" field in the final JSON MUST be \`null\`.
       - **If portfolio data IS provided**:
         - Assign a "Financial Health Score" (0-100) based on diversification, cost-efficiency, and alignment with their goals.
         - Provide specific "Rebalancing & Habit Recommendations": e.g., "Your portfolio is healthy but a bit too focused on one area. Let's improve diversification by..." or "A great next step would be to automate your monthly savings."

    6. **Financial Wellness SWOT & Actionable Steps**:
       - Perform a SWOT analysis on the client's financial health.
       - Provide 3-5 clear, encouraging, and actionable steps. The first step should always be the most important habit to build (e.g., "Build your emergency fund to 6 months of expenses.").

    7. **Financial Growth Projection**: Calculate a 30-year wealth projection (Conservative 4%, Expected 7%, Aggressive 10%), adjusting for 2.5% long-term average inflation. Frame this as a demonstration of the power of consistent saving and compounding.

    OUTPUT FORMAT:
    - Start with the formatted Financial Health Summary.
    - END with a strict JSON block wrapped in \`\`\`json ... \`\`\`. Do not add any text after the JSON block.
    
    JSON SCHEMA:
    {
      "actionableSteps": ["..."],
      "swot": { "strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."] },
      "allocations": [{ 
          "ticker": "...", "name": "...", "sector": "...", "percentage": 0, "type": "...", "rationale": "...", "accountType": "...", "dividendYield": 0, "technicalAnalysis": {"summary": "...", "support": "...", "resistance": "...", "indicatorSignal": "..."}, "marketSentiment": {"score": "...", "summary": "...", "analystRating": "..."} 
      }],
      "projections": [{"year": 0, "conservative": 0, "expected": 0, "aggressive": 0, "inflationAdjusted": 0, "totalContributions": 0}],
      "marketAnalysis": {"macroOutlook": "...", "inflationForecast": "...", "interestRateView": "..."},
      "secEvents": [{"ticker": "...", "type": "...", "date": "...", "summary": "...", "sentiment": "..."}],
      "sectorTrends": [{"sector": "...", "trend": "...", "performance": 0, "reasoning": "..."}],
      "portfolioAnalysis": {"currentScore": 0, "analysis": "...", "rebalancingOrders": [{"ticker": "...", "action": "...", "amount": "...", "reason": "..."}]}
    }
  `;
    // FIX: Implement the function to call the Gemini API and parse the response.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const responseText = response.text;
    if (!responseText) {
        throw new Error(
            'Received an empty response from the AI. The model may be overloaded or the prompt was blocked.'
        );
    }

    const summary = responseText.substring(0, responseText.indexOf('```json')).trim();
    const jsonBlockMatch = responseText.match(/```json([\s\S]*)```/);

    if (!jsonBlockMatch || !jsonBlockMatch[1]) {
        console.error('Malformed AI Response:', responseText);
        throw new Error(
            'Failed to find a valid JSON block in the AI response. Please try regenerating.'
        );
    }

    const jsonString = jsonBlockMatch[1].trim();
    let parsedJson;
    try {
        parsedJson = JSON.parse(jsonString);
    } catch (e) {
        console.error('JSON Parsing Error:', e);
        console.error('Invalid JSON string:', jsonString);
        throw new Error(
            'The AI returned a malformed data structure. Please try regenerating.'
        );
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] = [];
    if (groundingChunks) {
        groundingChunks.forEach((chunk: GroundingChunk) => {
            if (chunk.web?.uri && chunk.web?.title) {
                sources.push({ url: chunk.web.uri, title: chunk.web.title });
            }
        });
    }

    const sanitizedPlan = validateAndSanitizePlan(parsedJson, summary);
    sanitizedPlan.sources = sources;

    return sanitizedPlan;
}

// FIX: Add the missing 'createAdvisorChat' function.
export function createAdvisorChat(plan: InvestmentPlan, apiKey: string, history: Content[]): Chat {
  const ai = getClient(apiKey);

  const systemInstruction = `
    You are "The Steward," an expert AI Financial Advisor.
    Your role is to provide clarifying, data-driven, and educational answers about the user's generated investment plan.
    You are helpful, encouraging, and an expert in financial markets, portfolio management, and economic principles.
    Your personality is that of a wise, patient, and timeless advisor. Avoid hype and focus on long-term, evidence-based principles.
    You MUST ground your answers in the context of the user's provided plan. Refer to their allocations, goals, and risk profile.
    You have access to Google Search to provide up-to-the-minute data to support your answers.
    NEVER provide direct financial advice or tell the user to buy/sell a specific security. Instead, educate them on the principles so they can make their own informed decisions.

    Here is the user's investment plan for context:
    ---
    SUMMARY: ${plan.summary}
    RISK ANALYSIS: ${plan.riskAnalysis}
    ALLOCATIONS: ${plan.allocations.map(a => `${a.ticker}: ${a.percentage}%`).join(', ')}
    ACTIONABLE STEPS: ${plan.actionableSteps.join('; ')}
    ---
  `;

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
    },
    history,
  });

  return chat;
}
