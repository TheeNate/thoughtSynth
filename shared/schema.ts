import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content items table
export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // 'article', 'podcast', 'video'
  rawContent: text("raw_content"),
  aiAnalysis: jsonb("ai_analysis"), // Store AI analysis as JSON
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User takeaways table
export const takeaways = pgTable("takeaways", {
  id: serial("id").primaryKey(),
  contentItemId: integer("content_item_id").notNull(),
  userId: varchar("user_id").notNull(),
  takeawayText: text("takeaway_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat threads table (one per content item)
export const chatThreads = pgTable("chat_threads", {
  id: serial("id").primaryKey(),
  contentItemId: integer("content_item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull(),
  senderType: varchar("sender_type", { length: 20 }).notNull(), // 'user', 'ai'
  senderId: varchar("sender_id"),
  senderName: varchar("sender_name").notNull(),
  messageText: text("message_text").notNull(),
  parentMessageId: integer("parent_message_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content tags table
export const contentTags = pgTable("content_tags", {
  id: serial("id").primaryKey(),
  contentItemId: integer("content_item_id").notNull(),
  tagName: varchar("tag_name", { length: 100 }).notNull(),
  tagType: varchar("tag_type", { length: 20 }).notNull(), // 'auto', 'manual'
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  contentItems: many(contentItems),
  takeaways: many(takeaways),
}));

export const contentItemsRelations = relations(contentItems, ({ one, many }) => ({
  user: one(users, {
    fields: [contentItems.userId],
    references: [users.id],
  }),
  takeaways: many(takeaways),
  chatThread: one(chatThreads, {
    fields: [contentItems.id],
    references: [chatThreads.contentItemId],
  }),
  tags: many(contentTags),
}));

export const takeawaysRelations = relations(takeaways, ({ one }) => ({
  contentItem: one(contentItems, {
    fields: [takeaways.contentItemId],
    references: [contentItems.id],
  }),
  user: one(users, {
    fields: [takeaways.userId],
    references: [users.id],
  }),
}));

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  contentItem: one(contentItems, {
    fields: [chatThreads.contentItemId],
    references: [contentItems.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [chatMessages.threadId],
    references: [chatThreads.id],
  }),
}));

export const contentTagsRelations = relations(contentTags, ({ one }) => ({
  contentItem: one(contentItems, {
    fields: [contentTags.contentItemId],
    references: [contentItems.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertContentItemSchema = createInsertSchema(contentItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type ContentItem = typeof contentItems.$inferSelect;

export const insertTakeawaySchema = createInsertSchema(takeaways).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTakeaway = z.infer<typeof insertTakeawaySchema>;
export type Takeaway = typeof takeaways.$inferSelect;

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export const insertContentTagSchema = createInsertSchema(contentTags).omit({
  id: true,
  createdAt: true,
});
export type InsertContentTag = z.infer<typeof insertContentTagSchema>;
export type ContentTag = typeof contentTags.$inferSelect;
