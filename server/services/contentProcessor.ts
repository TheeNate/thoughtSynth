import { analyzeContent } from "./openai";
import { storage } from "../storage";
import { InsertContentItem, InsertContentTag } from "@shared/schema";

export interface ProcessContentRequest {
  url: string;
  userTakeaways?: string;
  userId: string;
}

export interface ProcessContentResponse {
  contentItem: any;
  success: boolean;
  message: string;
}

export function detectContentType(url: string): string {
  const domain = new URL(url).hostname.toLowerCase();
  
  if (domain.includes('youtube.com') || domain.includes('youtu.be') || domain.includes('vimeo.com')) {
    return 'video';
  } else if (domain.includes('spotify.com') || domain.includes('soundcloud.com') || domain.includes('podcast')) {
    return 'podcast';
  } else {
    return 'article';
  }
}

export async function extractContentFromUrl(url: string, contentType: string): Promise<{ title: string; content: string }> {
  try {
    // Basic web scraping - in production, you'd use a more robust solution
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
    
    // Clean up title
    title = title.replace(/\s+/g, ' ').trim();
    
    // Extract content based on type
    let content = '';
    
    if (contentType === 'article') {
      // Basic content extraction - remove HTML tags and get main content
      content = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Take first 5000 characters for analysis
      content = content.substring(0, 5000);
    } else if (contentType === 'video') {
      // For videos, we'd typically extract description or transcript
      // For now, use meta description
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
      content = descMatch ? descMatch[1] : `Video content from ${url}`;
    } else if (contentType === 'podcast') {
      // For podcasts, extract show notes or description
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
      content = descMatch ? descMatch[1] : `Podcast content from ${url}`;
    }
    
    return { title, content };
  } catch (error) {
    console.error("Error extracting content from URL:", error);
    throw new Error("Failed to extract content from URL");
  }
}

export async function processContent(request: ProcessContentRequest): Promise<ProcessContentResponse> {
  try {
    const { url, userTakeaways, userId } = request;
    
    // Detect content type
    const contentType = detectContentType(url);
    
    // Extract content from URL
    const { title, content } = await extractContentFromUrl(url, contentType);
    
    // Analyze content with AI
    const analysis = await analyzeContent(content, contentType, userTakeaways);
    
    // Create content item
    const contentItemData: InsertContentItem = {
      url,
      title,
      contentType,
      rawContent: content,
      aiAnalysis: analysis,
      userId,
    };
    
    const contentItem = await storage.createContentItem(contentItemData);
    
    // Create tags
    const tagPromises = analysis.tags.map(tag => 
      storage.createContentTag({
        contentItemId: contentItem.id,
        tagName: tag,
        tagType: 'auto'
      })
    );
    
    await Promise.all(tagPromises);
    
    // Create takeaway if provided
    if (userTakeaways) {
      await storage.createTakeaway({
        contentItemId: contentItem.id,
        userId,
        takeawayText: userTakeaways
      });
    }
    
    // Create chat thread
    await storage.createChatThread(contentItem.id);
    
    return {
      contentItem,
      success: true,
      message: "Content processed successfully"
    };
    
  } catch (error) {
    console.error("Error processing content:", error);
    return {
      contentItem: null,
      success: false,
      message: "Failed to process content: " + (error as Error).message
    };
  }
}
