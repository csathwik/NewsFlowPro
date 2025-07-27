import { apiRequest } from "./queryClient";
import type { Article, InsertArticle, Comment, InsertComment, Category, SearchParams } from "@shared/schema";

export const api = {
  // Articles
  getArticles: (params?: SearchParams): Promise<Article[]> =>
    fetch(`/api/articles?${new URLSearchParams(params as any)}`).then(res => res.json()),
  
  getArticle: (id: string): Promise<Article> =>
    fetch(`/api/articles/${id}`).then(res => res.json()),
  
  createArticle: (article: InsertArticle): Promise<Article> =>
    apiRequest("POST", "/api/articles", article).then(res => res.json()),
  
  updateArticle: (id: string, article: Partial<InsertArticle>): Promise<Article> =>
    apiRequest("PUT", `/api/articles/${id}`, article).then(res => res.json()),
  
  deleteArticle: (id: string): Promise<void> =>
    apiRequest("DELETE", `/api/articles/${id}`).then(() => {}),
  
  likeArticle: (id: string): Promise<{ likes: number }> =>
    apiRequest("POST", `/api/articles/${id}/like`).then(res => res.json()),

  // Comments
  getComments: (articleId: string): Promise<Comment[]> =>
    fetch(`/api/articles/${articleId}/comments`).then(res => res.json()),
  
  createComment: (articleId: string, comment: Omit<InsertComment, 'articleId'>): Promise<Comment> =>
    apiRequest("POST", `/api/articles/${articleId}/comments`, comment).then(res => res.json()),
  
  deleteComment: (id: string): Promise<void> =>
    apiRequest("DELETE", `/api/comments/${id}`).then(() => {}),

  // Categories
  getCategories: (): Promise<Category[]> =>
    fetch("/api/categories").then(res => res.json()),
  
  getCategory: (slug: string): Promise<Category> =>
    fetch(`/api/categories/${slug}`).then(res => res.json()),
  
  // Search
  search: (params: SearchParams): Promise<Article[]> =>
    fetch(`/api/search?${new URLSearchParams(params as any)}`).then(res => res.json()),
};
