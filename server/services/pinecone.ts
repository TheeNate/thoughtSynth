import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY environment variable is required');
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required for embeddings');
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  controllerHostUrl: 'https://thought-synth-rb95c6e.svc.aped-4627-b74a.pinecone.io'
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use environment variable for index name or default
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'thoughtsynth-rb95c6e';
const index = pinecone.index(INDEX_NAME);

export interface ContentVector {
  id: string;
  contentId: number;
  type: 'content' | 'takeaway';
  title: string;
  url?: string;
  userId: string;
  text: string;
  metadata: {
    contentType: string;
    tags: string[];
    createdAt: string;
  };
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

export async function storeContentVector(
  contentId: number,
  title: string,
  content: string,
  analysis: any,
  userId: string,
  url: string,
  contentType: string
): Promise<string> {
  try {
    // Combine title, content, and analysis for embedding
    const textToEmbed = `${title}\n\n${content}\n\nSummary: ${analysis.summary}\n\nKey Insights: ${analysis.keyInsights.join(', ')}`;
    
    const embedding = await generateEmbedding(textToEmbed);
    
    const vectorId = `content-${contentId}`;
    
    await index.upsert([
      {
        id: vectorId,
        values: embedding,
        metadata: {
          contentId,
          type: 'content',
          title,
          url,
          userId,
          contentType,
          tags: analysis.tags || [],
          summary: analysis.summary,
          keyInsights: analysis.keyInsights || [],
          createdAt: new Date().toISOString(),
        }
      }
    ]);

    return vectorId;
  } catch (error) {
    console.error('Error storing content vector:', error);
    // Don't throw error, just warn and continue - vector storage is optional
    console.warn('Vector storage failed, continuing without it');
    return `content-${contentId}`;
  }
}

export async function storeUserTakeawayVector(
  contentId: number,
  takeawayId: number,
  takeawayText: string,
  contentTitle: string,
  userId: string
): Promise<string> {
  try {
    const textToEmbed = `${contentTitle}\n\nUser Takeaway: ${takeawayText}`;
    const embedding = await generateEmbedding(textToEmbed);
    
    const vectorId = `takeaway-${takeawayId}`;
    
    await index.upsert([
      {
        id: vectorId,
        values: embedding,
        metadata: {
          contentId,
          takeawayId,
          type: 'takeaway',
          title: contentTitle,
          userId,
          takeawayText,
          createdAt: new Date().toISOString(),
        }
      }
    ]);

    return vectorId;
  } catch (error) {
    console.error('Error storing takeaway vector:', error);
    // Don't throw error, just warn and continue - vector storage is optional
    console.warn('Vector storage failed, continuing without it');
    return `takeaway-${takeawayId}`;
  }
}

export async function searchSimilarContent(
  query: string,
  userId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    const searchResult = await index.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      filter: {
        userId: { $eq: userId }
      }
    });

    return searchResult.matches?.map(match => ({
      contentId: match.metadata?.contentId,
      type: match.metadata?.type,
      title: match.metadata?.title,
      url: match.metadata?.url,
      summary: match.metadata?.summary,
      score: match.score,
      metadata: match.metadata
    })) || [];
  } catch (error) {
    console.error('Error searching similar content:', error);
    throw new Error(`Failed to search similar content: ${error.message}`);
  }
}

export async function deleteContentVectors(contentId: number): Promise<void> {
  try {
    // Delete both content and related takeaway vectors
    const contentVectorId = `content-${contentId}`;
    
    // Query for takeaway vectors related to this content
    const takeawayResults = await index.query({
      vector: new Array(1536).fill(0), // Dummy vector for metadata-only search
      topK: 100,
      includeMetadata: true,
      filter: {
        contentId: { $eq: contentId },
        type: { $eq: 'takeaway' }
      }
    });

    const vectorIdsToDelete = [contentVectorId];
    if (takeawayResults.matches) {
      vectorIdsToDelete.push(...takeawayResults.matches.map(match => match.id));
    }

    if (vectorIdsToDelete.length > 0) {
      await index.deleteMany(vectorIdsToDelete);
    }
  } catch (error) {
    console.error('Error deleting content vectors:', error);
    // Don't throw error, just warn and continue - vector deletion is optional
    console.warn('Vector deletion failed, continuing without it');
  }
}