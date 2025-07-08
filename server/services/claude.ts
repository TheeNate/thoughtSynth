import Anthropic from '@anthropic-ai/sdk';

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

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
  title: string,
  content: string,
  userTakeaways?: string
): Promise<ContentAnalysis> {
  // Fallback for missing API key
  if (!anthropic) {
    console.warn('ANTHROPIC_API_KEY not provided, using fallback analysis');
    return {
      summary: `Analysis of "${title}": This content requires AI analysis. Please provide an ANTHROPIC_API_KEY to enable full content analysis.`,
      coreConcepts: ['Content Analysis', 'AI Integration', 'Knowledge Synthesis'],
      keyInsights: ['AI-powered analysis not available', 'Manual review recommended'],
      notableQuotes: ['API key required for quote extraction'],
      relatedTopics: ['AI Services', 'Content Processing', 'Knowledge Management'],
      actionableTakeaways: ['Provide ANTHROPIC_API_KEY to enable analysis'],
      tags: ['unprocessed', 'manual-review', 'ai-pending'],
    };
  }

  try {
    const prompt = `
Analyze the following content and provide a comprehensive breakdown. Focus on extracting meaningful insights and knowledge synthesis opportunities.

Title: ${title}

Content: ${content}

${userTakeaways ? `User's Takeaways/Notes: ${userTakeaways}` : ''}

Please provide your analysis in JSON format with the following structure:
{
  "summary": "A concise 2-3 sentence summary of the main points",
  "coreConcepts": ["List of 3-5 core concepts or themes"],
  "keyInsights": ["List of 3-5 key insights or learnings"],
  "notableQuotes": ["List of 2-3 most impactful quotes or statements"],
  "relatedTopics": ["List of 3-5 related topics for further exploration"],
  "actionableTakeaways": ["List of 3-5 specific actions or applications"],
  "tags": ["List of 5-8 relevant tags for categorization"]
}

Guidelines:
- Focus on educational and learning value
- Extract insights that help with knowledge synthesis
- Identify connections to broader topics
- Suggest practical applications
- Keep responses objective and analytical
- Avoid any product endorsements or promotional language
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const analysisText = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    // Extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Claude response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate and ensure all required fields exist
    return {
      summary: analysis.summary || '',
      coreConcepts: Array.isArray(analysis.coreConcepts) ? analysis.coreConcepts : [],
      keyInsights: Array.isArray(analysis.keyInsights) ? analysis.keyInsights : [],
      notableQuotes: Array.isArray(analysis.notableQuotes) ? analysis.notableQuotes : [],
      relatedTopics: Array.isArray(analysis.relatedTopics) ? analysis.relatedTopics : [],
      actionableTakeaways: Array.isArray(analysis.actionableTakeaways) ? analysis.actionableTakeaways : [],
      tags: Array.isArray(analysis.tags) ? analysis.tags : [],
    };

  } catch (error) {
    console.error('Error analyzing content with Claude:', error);
    throw new Error(`Failed to analyze content: ${error.message}`);
  }
}

export async function generateChatResponse(
  contentTitle: string,
  contentSummary: string,
  chatHistory: Array<{ senderType: string; messageText: string }>,
  userMessage: string
): Promise<string> {
  // Fallback for missing API key
  if (!anthropic) {
    return `I'm sorry, but I need an ANTHROPIC_API_KEY to provide intelligent chat responses. Currently, I can only acknowledge your message about "${contentTitle}". Please provide the API key to enable full AI chat functionality.`;
  }

  try {
    const historyText = chatHistory
      .map(msg => `${msg.senderType === 'user' ? 'User' : 'AI'}: ${msg.messageText}`)
      .join('\n');

    const prompt = `
You are an AI assistant helping users discuss and understand content. The user is discussing the following content:

Title: ${contentTitle}
Summary: ${contentSummary}

Previous conversation:
${historyText}

User's new message: ${userMessage}

Please provide a helpful, insightful response that:
- Relates to the content being discussed
- Builds on the conversation history
- Encourages deeper thinking and learning
- Provides additional context or perspectives when relevant
- Asks thoughtful follow-up questions when appropriate

Keep your response conversational, educational, and focused on knowledge synthesis.
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0]?.type === 'text' ? response.content[0].text : 'I apologize, but I encountered an issue generating a response.';

  } catch (error) {
    console.error('Error generating chat response with Claude:', error);
    throw new Error(`Failed to generate chat response: ${error.message}`);
  }
}