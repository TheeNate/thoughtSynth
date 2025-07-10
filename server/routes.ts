import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { processContent, detectContentType } from "./services/contentProcessor";
import { generateChatResponse } from "./services/claude";
import { searchSimilarContent, deleteContentVectors } from "./services/pinecone";
import { insertContentItemSchema, insertTakeawaySchema, insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Content routes
  app.post('/api/content/detect-type', isAuthenticated, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      
      const contentType = detectContentType(url);
      res.json({ contentType });
    } catch (error) {
      console.error("Error detecting content type:", error);
      res.status(500).json({ message: "Failed to detect content type" });
    }
  });

  app.post('/api/content/process', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { url, userTakeaways } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      
      const result = await processContent({
        url,
        userTakeaways,
        userId
      });
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error("Error processing content:", error);
      res.status(500).json({ message: "Failed to process content" });
    }
  });

  app.get('/api/content', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const contentItems = await storage.getContentItems(userId, limit);
      res.json(contentItems);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.get('/api/content/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contentId = parseInt(req.params.id);
      
      const contentItem = await storage.getContentItem(contentId);
      if (!contentItem) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // Check if user owns this content
      if (contentItem.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get takeaways and tags
      const takeaways = await storage.getTakeawaysByContent(contentId);
      const tags = await storage.getContentTags(contentId);
      
      res.json({
        ...contentItem,
        takeaways,
        tags
      });
    } catch (error) {
      console.error("Error fetching content item:", error);
      res.status(500).json({ message: "Failed to fetch content item" });
    }
  });

  app.delete('/api/content/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contentId = parseInt(req.params.id);
      
      const contentItem = await storage.getContentItem(contentId);
      if (!contentItem) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // Check if user owns this content
      if (contentItem.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Delete from vector database first (if it exists)
      try {
        await deleteContentVectors(contentId);
      } catch (error) {
        console.warn("Failed to delete from vector database, continuing:", error);
      }
      
      // Delete from regular database
      await storage.deleteContentItem(contentId);
      
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ message: "Failed to delete content" });
    }
  });

  app.get('/api/content/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await storage.searchContentItems(userId, query);
      res.json(results);
    } catch (error) {
      console.error("Error searching content:", error);
      res.status(500).json({ message: "Failed to search content" });
    }
  });

  // Semantic search endpoint using Pinecone vector search
  app.get('/api/search/semantic', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await searchSimilarContent(query, userId, limit);
      res.json(results);
    } catch (error) {
      console.error("Error performing semantic search:", error);
      res.status(500).json({ message: "Failed to perform semantic search" });
    }
  });

  // Takeaway routes
  app.post('/api/takeaways', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTakeawaySchema.parse({
        ...req.body,
        userId
      });
      
      const takeaway = await storage.createTakeaway(validatedData);
      res.json(takeaway);
    } catch (error) {
      console.error("Error creating takeaway:", error);
      res.status(500).json({ message: "Failed to create takeaway" });
    }
  });

  app.put('/api/takeaways/:id', isAuthenticated, async (req: any, res) => {
    try {
      const takeawayId = parseInt(req.params.id);
      const { takeawayText } = req.body;
      
      const takeaway = await storage.updateTakeaway(takeawayId, takeawayText);
      res.json(takeaway);
    } catch (error) {
      console.error("Error updating takeaway:", error);
      res.status(500).json({ message: "Failed to update takeaway" });
    }
  });

  // Chat routes
  app.get('/api/chat/:contentId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const contentId = parseInt(req.params.contentId);
      
      // Get or create chat thread
      let thread = await storage.getChatThread(contentId);
      if (!thread) {
        thread = await storage.createChatThread(contentId);
      }
      
      const messages = await storage.getChatMessages(thread.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/:contentId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const contentId = parseInt(req.params.contentId);
      const { messageText } = req.body;
      
      // Get or create chat thread
      let thread = await storage.getChatThread(contentId);
      if (!thread) {
        thread = await storage.createChatThread(contentId);
      }
      
      const messageData = {
        threadId: thread.id,
        senderType: 'user' as const,
        senderId: userId,
        senderName: user?.firstName || 'Anonymous',
        messageText
      };
      
      const message = await storage.createChatMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  app.post('/api/chat/:contentId/ai-response', isAuthenticated, async (req: any, res) => {
    try {
      const contentId = parseInt(req.params.contentId);
      const { message } = req.body;
      
      // Get content item for context
      const contentItem = await storage.getContentItem(contentId);
      if (!contentItem) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // Get chat history for context
      let thread = await storage.getChatThread(contentId);
      if (!thread) {
        thread = await storage.createChatThread(contentId);
      }
      const chatHistory = await storage.getChatMessages(thread.id);
      
      // Generate AI response
      const contentSummary = contentItem.aiAnalysis?.summary || contentItem.title;
      const aiResponse = await generateChatResponse(
        contentItem.title,
        contentSummary,
        chatHistory,
        message
      );
      
      // Save AI response as message
      const messageData = {
        threadId: thread.id,
        senderType: 'ai' as const,
        senderId: null,
        senderName: 'AI Assistant',
        messageText: aiResponse
      };
      
      const aiMessage = await storage.createChatMessage(messageData);
      res.json(aiMessage);
    } catch (error) {
      console.error("Error generating AI response:", error);
      res.status(500).json({ message: "Failed to generate AI response" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Broadcast message to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
