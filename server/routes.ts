import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertCommentSchema, insertCategorySchema, searchSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Articles routes
  app.get("/api/articles", async (req, res) => {
    try {
      // Handle empty query or malformed parameters gracefully
      const queryParams = req.query || {};
      const safeParams = {
        query: queryParams.query ? String(queryParams.query) : undefined,
        category: queryParams.category ? String(queryParams.category) : undefined,
        published: queryParams.published !== undefined ? queryParams.published === 'true' : undefined,
        featured: queryParams.featured !== undefined ? queryParams.featured === 'true' : undefined,
      };
      
      const articles = await storage.getArticles(safeParams);
      res.json(articles);
    } catch (error) {
      console.error("Articles API error:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      // Increment views
      await storage.incrementViews(req.params.id);
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  app.post("/api/articles", async (req, res) => {
    try {
      const articleData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid article data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create article" });
    }
  });

  app.put("/api/articles/:id", async (req, res) => {
    try {
      const articleData = insertArticleSchema.partial().parse(req.body);
      const article = await storage.updateArticle(req.params.id, articleData);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid article data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update article" });
    }
  });

  app.delete("/api/articles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteArticle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete article" });
    }
  });

  app.post("/api/articles/:id/like", async (req, res) => {
    try {
      const article = await storage.toggleLike(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json({ likes: article.likes });
    } catch (error) {
      res.status(500).json({ error: "Failed to like article" });
    }
  });

  app.post("/api/articles/:id/views", async (req, res) => {
    try {
      await storage.incrementViews(req.params.id);
      res.status(200).json({ message: "View counted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to increment views" });
    }
  });

  // Comments routes
  app.get("/api/articles/:articleId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByArticleId(req.params.articleId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/articles/:articleId/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        articleId: req.params.articleId,
      });
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid comment data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteComment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid category data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Search route
  app.get("/api/search", async (req, res) => {
    try {
      const queryParams = req.query || {};
      const safeParams = {
        query: queryParams.query ? String(queryParams.query) : undefined,
        category: queryParams.category ? String(queryParams.category) : undefined,
        published: queryParams.published !== undefined ? queryParams.published === 'true' : undefined,
        featured: queryParams.featured !== undefined ? queryParams.featured === 'true' : undefined,
      };
      
      const articles = await storage.getArticles(safeParams);
      res.json(articles);
    } catch (error) {
      console.error("Search API error:", error);
      res.status(500).json({ error: "Failed to search articles" });
    }
  });

  // Sitemap route
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      const categories = await storage.getCategories();
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://newshub.replit.app' 
        : `http://localhost:${process.env.PORT || 5000}`;
      
      const currentDate = new Date().toISOString().split('T')[0];
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Search Page -->
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Admin Panel -->
  <url>
    <loc>${baseUrl}/admin</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.4</priority>
  </url>
`;

      // Add category pages
      categories.forEach(category => {
        sitemap += `  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
      });

      // Add individual articles
      articles.forEach(article => {
        const articleDate = new Date(article.updatedAt).toISOString().split('T')[0];
        sitemap += `  <url>
    <loc>${baseUrl}/article/${article.id}</loc>
    <lastmod>${articleDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      });

      sitemap += `</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).json({ error: "Failed to generate sitemap" });
    }
  });

  // Robots.txt route
  app.get("/robots.txt", (req, res) => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://newshub.replit.app' 
      : `http://localhost:${process.env.PORT || 5000}`;
    
    const robotsTxt = `User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Block admin panel from search engines
User-agent: *
Disallow: /admin

# Allow important pages
Allow: /
Allow: /category/
Allow: /article/
Allow: /search

# Crawl delay (optional - 1 second between requests)
Crawl-delay: 1`;

    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  const httpServer = createServer(app);
  return httpServer;
}
