import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  author: text("author").notNull(),
  authorTitle: text("author_title").notNull(),
  authorImage: text("author_image"),
  category: text("category").notNull(),
  tags: text("tags").array().default([]),
  imageUrl: text("image_url"),
  published: boolean("published").default(false),
  featured: boolean("featured").default(false),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").references(() => articles.id).notNull(),
  author: text("author").notNull(),
  email: text("email").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").notNull(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  views: true,
  likes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Search and filter types
export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.union([z.boolean(), z.string()]).optional().transform(val => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }),
  featured: z.union([z.boolean(), z.string()]).optional().transform(val => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }),
});

export type SearchParams = z.infer<typeof searchSchema>;
