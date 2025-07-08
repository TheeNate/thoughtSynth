import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

// OpenAI is now only used for embeddings generation
// Content analysis and chat responses are handled by Claude
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

// Only embeddings generation - content analysis and chat moved to Claude
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding with OpenAI:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}