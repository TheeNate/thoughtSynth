import {
  users,
  contentItems,
  takeaways,
  chatThreads,
  chatMessages,
  contentTags,
  type User,
  type UpsertUser,
  type ContentItem,
  type InsertContentItem,
  type Takeaway,
  type InsertTakeaway,
  type ChatMessage,
  type InsertChatMessage,
  type ContentTag,
  type InsertContentTag,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Content operations
  createContentItem(item: InsertContentItem): Promise<ContentItem>;
  getContentItem(id: number): Promise<ContentItem | undefined>;
  getContentItems(userId: string, limit?: number): Promise<ContentItem[]>;
  updateContentItem(id: number, updates: Partial<ContentItem>): Promise<ContentItem>;
  deleteContentItem(id: number): Promise<void>;
  searchContentItems(userId: string, query: string): Promise<ContentItem[]>;

  // Takeaway operations
  createTakeaway(takeaway: InsertTakeaway): Promise<Takeaway>;
  updateTakeaway(id: number, text: string): Promise<Takeaway>;
  getTakeawaysByContent(contentItemId: number): Promise<Takeaway[]>;

  // Chat operations
  createChatThread(contentItemId: number): Promise<{ id: number }>;
  getChatThread(contentItemId: number): Promise<{ id: number } | undefined>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(threadId: number): Promise<ChatMessage[]>;

  // Tag operations
  createContentTag(tag: InsertContentTag): Promise<ContentTag>;
  getContentTags(contentItemId: number): Promise<ContentTag[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Content operations
  async createContentItem(item: InsertContentItem): Promise<ContentItem> {
    const [contentItem] = await db
      .insert(contentItems)
      .values(item)
      .returning();
    return contentItem;
  }

  async getContentItem(id: number): Promise<ContentItem | undefined> {
    const [contentItem] = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, id));
    return contentItem;
  }

  async getContentItems(userId: string, limit = 50): Promise<ContentItem[]> {
    return await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.userId, userId))
      .orderBy(desc(contentItems.createdAt))
      .limit(limit);
  }

  async updateContentItem(id: number, updates: Partial<ContentItem>): Promise<ContentItem> {
    const [contentItem] = await db
      .update(contentItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contentItems.id, id))
      .returning();
    return contentItem;
  }

  async deleteContentItem(id: number): Promise<void> {
    await db.delete(contentItems).where(eq(contentItems.id, id));
  }

  async searchContentItems(userId: string, query: string): Promise<ContentItem[]> {
    return await db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.userId, userId),
          or(
            like(contentItems.title, `%${query}%`),
            like(contentItems.rawContent, `%${query}%`)
          )
        )
      )
      .orderBy(desc(contentItems.createdAt));
  }

  // Takeaway operations
  async createTakeaway(takeaway: InsertTakeaway): Promise<Takeaway> {
    const [newTakeaway] = await db
      .insert(takeaways)
      .values(takeaway)
      .returning();
    return newTakeaway;
  }

  async updateTakeaway(id: number, text: string): Promise<Takeaway> {
    const [takeaway] = await db
      .update(takeaways)
      .set({ takeawayText: text, updatedAt: new Date() })
      .where(eq(takeaways.id, id))
      .returning();
    return takeaway;
  }

  async getTakeawaysByContent(contentItemId: number): Promise<Takeaway[]> {
    return await db
      .select()
      .from(takeaways)
      .where(eq(takeaways.contentItemId, contentItemId));
  }

  // Chat operations
  async createChatThread(contentItemId: number): Promise<{ id: number }> {
    const [thread] = await db
      .insert(chatThreads)
      .values({ contentItemId })
      .returning({ id: chatThreads.id });
    return thread;
  }

  async getChatThread(contentItemId: number): Promise<{ id: number } | undefined> {
    const [thread] = await db
      .select({ id: chatThreads.id })
      .from(chatThreads)
      .where(eq(chatThreads.contentItemId, contentItemId));
    return thread;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return chatMessage;
  }

  async getChatMessages(threadId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.threadId, threadId))
      .orderBy(chatMessages.createdAt);
  }

  // Tag operations
  async createContentTag(tag: InsertContentTag): Promise<ContentTag> {
    const [contentTag] = await db
      .insert(contentTags)
      .values(tag)
      .returning();
    return contentTag;
  }

  async getContentTags(contentItemId: number): Promise<ContentTag[]> {
    return await db
      .select()
      .from(contentTags)
      .where(eq(contentTags.contentItemId, contentItemId));
  }
}

export const storage = new DatabaseStorage();
