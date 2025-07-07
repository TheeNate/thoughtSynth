import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ContentAnalysis {
  coreConcepts: string[];
  keyInsights: string[];
  notableQuotes: string[];
  relatedTopics: string[];
  actionableTakeaways: string[];
  tags: string[];
  summary: string;
}

export async function analyzeContent(
  content: string,
  contentType: string,
  userTakeaways?: string
): Promise<ContentAnalysis> {
  try {
    const prompt = `
    Analyze the following ${contentType} content and provide a comprehensive analysis.
    
    Content: ${content}
    
    ${userTakeaways ? `User's takeaways: ${userTakeaways}` : ''}
    
    Please provide a detailed analysis in the following JSON format:
    {
      "coreConcepts": ["concept1", "concept2", ...],
      "keyInsights": ["insight1", "insight2", ...],
      "notableQuotes": ["quote1", "quote2", ...],
      "relatedTopics": ["topic1", "topic2", ...],
      "actionableTakeaways": ["takeaway1", "takeaway2", ...],
      "tags": ["tag1", "tag2", ...],
      "summary": "A concise summary of the content"
    }
    
    Focus on extracting the most valuable insights and make the analysis actionable.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert content analyst. Provide thorough, insightful analysis of educational and professional content. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      coreConcepts: analysis.coreConcepts || [],
      keyInsights: analysis.keyInsights || [],
      notableQuotes: analysis.notableQuotes || [],
      relatedTopics: analysis.relatedTopics || [],
      actionableTakeaways: analysis.actionableTakeaways || [],
      tags: analysis.tags || [],
      summary: analysis.summary || "",
    };
  } catch (error) {
    console.error("Error analyzing content:", error);
    throw new Error("Failed to analyze content: " + (error as Error).message);
  }
}

export async function generateChatResponse(
  message: string,
  context: string,
  contentSummary: string
): Promise<string> {
  try {
    const prompt = `
    You are an AI assistant helping with knowledge synthesis and learning. 
    
    Content context: ${contentSummary}
    
    Previous conversation context: ${context}
    
    User message: ${message}
    
    Provide a helpful, insightful response that adds value to the discussion. 
    Be concise but thoughtful, and try to connect ideas or suggest related concepts when appropriate.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable AI assistant focused on helping users learn and synthesize information. Be helpful, insightful, and encourage deeper thinking."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate chat response: " + (error as Error).message);
  }
}
