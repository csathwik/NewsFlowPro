import { type Article, type InsertArticle, type Comment, type InsertComment, type Category, type InsertCategory, type SearchParams, articles, comments, categories } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, like, and, desc, ilike } from "drizzle-orm";

export interface IStorage {
  // Articles
  getArticles(params?: SearchParams): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<boolean>;
  incrementViews(id: string): Promise<void>;
  toggleLike(id: string): Promise<Article | undefined>;
  
  // Comments
  getCommentsByArticleId(articleId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<boolean>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getArticles(params?: SearchParams): Promise<Article[]> {
    let query = db.select().from(articles);
    
    const conditions = [];
    
    if (params?.category) {
      conditions.push(ilike(articles.category, `%${params.category}%`));
    }
    
    if (params?.query) {
      conditions.push(
        ilike(articles.title, `%${params.query}%`)
      );
    }
    
    if (params?.featured !== undefined) {
      conditions.push(eq(articles.featured, params.featured));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const result = await query.orderBy(desc(articles.createdAt));
    return result;
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, slug));
    return article || undefined;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values({
      ...article,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return newArticle;
  }

  async updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updatedArticle] = await db
      .update(articles)
      .set({ ...article, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return updatedArticle || undefined;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementViews(id: string): Promise<void> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    if (article) {
      await db
        .update(articles)
        .set({ 
          views: (article.views ?? 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(articles.id, id));
    }
  }

  async toggleLike(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    if (!article) return undefined;
    
    const [updatedArticle] = await db
      .update(articles)
      .set({ 
        likes: (article.likes ?? 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(articles.id, id))
      .returning();
    return updatedArticle || undefined;
  }

  async getCommentsByArticleId(articleId: string): Promise<Comment[]> {
    const result = await db.select().from(comments).where(eq(comments.articleId, articleId));
    return result;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values({
      ...comment,
      id: randomUUID(),
      createdAt: new Date()
    }).returning();
    return newComment;
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getCategories(): Promise<Category[]> {
    const result = await db.select().from(categories);
    return result;
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values({
      ...category,
      id: randomUUID()
    }).returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }
}

export class MemStorage implements IStorage {
  private articles: Map<string, Article>;
  private comments: Map<string, Comment>;
  private categories: Map<string, Category>;

  constructor() {
    this.articles = new Map();
    this.comments = new Map();
    this.categories = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categories = [
      { name: "Technology", slug: "technology", description: "Latest tech news and innovations", color: "bg-blue-100 text-blue-700" },
      { name: "Business", slug: "business", description: "Business and finance news", color: "bg-green-100 text-green-700" },
      { name: "Health", slug: "health", description: "Health and medical news", color: "bg-purple-100 text-purple-700" },
      { name: "Sports", slug: "sports", description: "Sports news and updates", color: "bg-orange-100 text-orange-700" },
      { name: "Politics", slug: "politics", description: "Political news and analysis", color: "bg-red-100 text-red-700" },
      { name: "Science", slug: "science", description: "Scientific discoveries and research", color: "bg-indigo-100 text-indigo-700" },
      { name: "Entertainment", slug: "entertainment", description: "Entertainment and celebrity news", color: "bg-pink-100 text-pink-700" },
    ];

    categories.forEach(cat => {
      const id = randomUUID();
      this.categories.set(id, { ...cat, id });
    });

    // Seed articles
    const sampleArticles = [
      {
        title: "Revolutionary AI Technology Transforms Urban Planning and City Development",
        content: "Cities worldwide are adopting advanced artificial intelligence systems to optimize traffic flow, reduce energy consumption, and improve quality of life for millions of residents. This breakthrough technology represents a significant leap forward in urban planning methodologies.\n\nThe AI systems analyze vast amounts of data from traffic sensors, weather stations, and citizen feedback to create dynamic city management solutions. Early implementations have shown remarkable results, with traffic congestion reduced by up to 30% and energy consumption decreased by 25%.\n\nUrban planners are now able to simulate various scenarios and predict the impact of infrastructure changes before implementation. This predictive capability has saved cities millions in potential costs and improved the overall planning process.\n\nThe technology is being implemented in major cities across North America, Europe, and Asia, with plans for global expansion in the coming years.",
        excerpt: "Cities worldwide are adopting advanced artificial intelligence systems to optimize traffic flow, reduce energy consumption, and improve quality of life for millions of residents.",
        author: "Sarah Chen",
        authorTitle: "Technology Reporter",
        authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=100&h=100&fit=crop",
        category: "Technology",
        tags: ["AI", "Urban Planning", "Smart Cities"],
        imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&w=800&h=500&fit=crop",
        published: true,
        featured: true,
        views: 1250,
        likes: 234,
      },
      {
        title: "Remote Work Trends Show Significant Impact on Corporate Real Estate Markets",
        content: "The shift to remote work has fundamentally changed how companies view office space, leading to a major transformation in the corporate real estate market. Industry experts report a 40% decrease in traditional office leasing over the past year.\n\nCompanies are downsizing their physical footprints while investing more in technology infrastructure to support distributed teams. This trend has created new opportunities in co-working spaces and flexible office solutions.\n\nReal estate developers are adapting by converting traditional office buildings into mixed-use spaces that combine work, residential, and retail components. The change represents one of the most significant shifts in urban development patterns in decades.\n\nExperts predict this trend will continue, with hybrid work models becoming the new standard for knowledge workers across industries.",
        excerpt: "The shift to remote work has fundamentally changed how companies view office space, leading to major changes in corporate real estate markets.",
        author: "Michael Torres",
        authorTitle: "Business Analyst",
        authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=100&h=100&fit=crop",
        category: "Business",
        tags: ["Remote Work", "Real Estate", "Corporate Trends"],
        imageUrl: "https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&w=600&h=300&fit=crop",
        published: true,
        featured: false,
        views: 890,
        likes: 156,
      },
      {
        title: "Global Supply Chain Disruptions Drive Innovation in Logistics Technology",
        content: "Recent supply chain challenges have accelerated the adoption of advanced logistics technologies, with companies investing heavily in AI-powered tracking systems and automated warehouses. The logistics industry is experiencing its most significant transformation in decades.\n\nMajor retailers are implementing blockchain-based tracking systems to provide real-time visibility into their supply chains. These systems help identify potential bottlenecks before they become critical issues.\n\nInvestment in robotics and automation has increased by 200% year-over-year, as companies seek to reduce dependence on manual labor and improve efficiency. The technology is proving essential for maintaining operations during disruptions.",
        excerpt: "Supply chain challenges drive massive investment in AI-powered logistics and automated warehouse technologies.",
        author: "Jennifer Park",
        authorTitle: "Supply Chain Reporter",
        authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?ixlib=rb-4.0.3&w=100&h=100&fit=crop",
        category: "Business",
        tags: ["Supply Chain", "Logistics", "Automation"],
        imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&w=600&h=300&fit=crop",
        published: true,
        featured: false,
        views: 654,
        likes: 89,
      },
      {
        title: "Cryptocurrency Market Volatility Sparks New Regulatory Framework Discussions",
        content: "Financial regulators worldwide are developing comprehensive frameworks to address cryptocurrency market volatility and protect investors. The discussions come as digital assets continue to gain mainstream adoption among institutional investors.\n\nCentral banks are exploring digital currency alternatives while maintaining oversight of private cryptocurrency markets. The regulatory clarity is expected to provide stability for long-term institutional investment.\n\nMajor financial institutions are adjusting their cryptocurrency strategies based on emerging regulatory guidelines, with many increasing their compliance teams and risk management protocols.",
        excerpt: "Global regulators develop new frameworks as cryptocurrency gains institutional adoption amid market volatility.",
        author: "Robert Kim",
        authorTitle: "Financial Markets Reporter",
        authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=100&h=100&fit=crop",
        category: "Business",
        tags: ["Cryptocurrency", "Financial Regulation", "Markets"],
        imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3&w=600&h=300&fit=crop",
        published: true,
        featured: false,
        views: 1120,
        likes: 203,
      },
      {
        title: "Sustainable Energy Investments Reach Record High as Companies Prioritize ESG Goals",
        content: "Corporate investment in renewable energy projects has reached unprecedented levels, with companies allocating over $500 billion globally to sustainable energy initiatives. Environmental, Social, and Governance (ESG) considerations are driving fundamental changes in business strategy.\n\nMajor corporations are setting ambitious carbon neutrality targets, with many committing to net-zero emissions by 2030. The transition requires significant infrastructure investment and operational changes across industries.\n\nInvestors are increasingly prioritizing companies with strong ESG credentials, creating competitive advantages for early adopters of sustainable business practices.",
        excerpt: "Record $500 billion in corporate renewable energy investment as ESG priorities reshape business strategies.",
        author: "Lisa Martinez",
        authorTitle: "Sustainability Reporter",
        authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=100&h=100&fit=crop",
        category: "Business",
        tags: ["Sustainable Energy", "ESG", "Corporate Investment"],
        imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&w=600&h=300&fit=crop",
        published: true,
        featured: false,
        views: 845,
        likes: 167,
      },
      {
        title: "E-commerce Growth Drives Major Retail Infrastructure Investments",
        content: "The continued expansion of e-commerce is prompting retailers to invest billions in warehouse automation, last-mile delivery solutions, and customer experience technologies. The retail landscape is undergoing a fundamental transformation.\n\nOnline sales now represent over 35% of total retail transactions, driving demand for sophisticated fulfillment centers and delivery networks. Companies are racing to reduce delivery times while maintaining cost efficiency.\n\nRetail technology investments focus on personalization engines, inventory management systems, and seamless omnichannel experiences that integrate online and offline shopping.",
        excerpt: "E-commerce expansion drives billions in retail infrastructure investment as online sales reach 35% of total transactions.",
        author: "David Chen",
        authorTitle: "Retail Industry Analyst",
        authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=100&h=100&fit=crop",
        category: "Business",
        tags: ["E-commerce", "Retail Technology", "Logistics"],
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&w=600&h=300&fit=crop",
        published: true,
        featured: false,
        views: 932,
        likes: 124,
      },
      {
        title: "Breakthrough Medical Device Approved for Early Cancer Detection",
        content: "A revolutionary medical device that can detect cancer cells up to two years before traditional methods has received regulatory approval. The device uses advanced biomarker analysis to identify cellular changes at the earliest stages.\n\nClinical trials involving over 10,000 patients showed a 95% accuracy rate in detecting various types of cancer, including lung, breast, and colorectal cancers. The non-invasive test requires only a simple blood sample.\n\nMedical professionals are calling this breakthrough a game-changer for cancer treatment, as early detection significantly improves survival rates and treatment outcomes. The device will be available in major medical centers within the next six months.\n\nThe technology represents years of research and development, with potential applications extending beyond cancer detection to other serious medical conditions.",
        excerpt: "A revolutionary medical device that can detect cancer cells up to two years before traditional methods has received regulatory approval.",
        author: "Dr. Amanda Foster",
        authorTitle: "Medical Correspondent",
        authorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&w=100&h=100&fit=crop",
        category: "Health",
        tags: ["Medical Technology", "Cancer Detection", "Healthcare Innovation"],
        imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&w=600&h=300&fit=crop",
        published: true,
        featured: false,
        views: 2100,
        likes: 445,
      },
      {
        title: "Olympic Training Methods Revolutionize Amateur Athletics Programs",
        content: "Training techniques developed for Olympic athletes are being adapted for community sports programs, showing remarkable improvements in performance and injury prevention among amateur athletes.\n\nSports scientists have created scaled-down versions of professional training protocols that can be implemented in local gyms and community centers. The programs focus on movement quality, injury prevention, and sustainable performance improvement.\n\nEarly results from pilot programs show a 60% reduction in sports-related injuries and significant improvements in athletic performance across all age groups. The approach emphasizes proper form and gradual progression over high-intensity training.\n\nCoaches across the country are being trained in these new methodologies, with plans to expand the program to schools and recreational leagues nationwide.",
        excerpt: "Professional coaching techniques are being adapted for community sports programs, showing remarkable improvements in performance and injury prevention.",
        author: "Coach Martinez",
        authorTitle: "Sports Performance Specialist",
        authorImage: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?ixlib=rb-4.0.3&w=100&h=100&fit=crop",
        category: "Sports",
        tags: ["Olympic Training", "Amateur Athletics", "Sports Science"],
        imageUrl: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&w=600&h=300&fit=crop",
        published: true,
        featured: false,
        views: 756,
        likes: 89,
      },
      {
        title: "Renewable Energy Storage Breakthrough Promises Grid Stability",
        content: "Scientists have developed a new battery technology that could solve the intermittency problem of solar and wind power, making renewable energy more reliable than ever before.\n\nThe breakthrough involves a novel approach to energy storage that can maintain charge for weeks without significant loss. The technology uses abundant materials and has shown promising results in large-scale testing.\n\nEnergy companies are already planning pilot installations, with the first commercial deployments expected within two years. The technology could accelerate the transition to renewable energy by addressing one of its biggest challenges.\n\nExperts believe this development could be the key to achieving carbon neutrality goals while maintaining reliable power grids. The implications for climate change mitigation are substantial.",
        excerpt: "New battery technology could solve the intermittency problem of solar and wind power, making renewable energy more reliable than ever before.",
        author: "Dr. Lisa Park",
        authorTitle: "Energy Research Scientist",
        authorImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=100&h=100&fit=crop",
        category: "Science",
        tags: ["Renewable Energy", "Battery Technology", "Climate Change"],
        imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&w=600&h=300&fit=crop",
        published: true,
        featured: false,
        views: 1340,
        likes: 267,
      },
    ];

    sampleArticles.forEach(article => {
      const id = randomUUID();
      const now = new Date();
      this.articles.set(id, {
        ...article,
        id,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  // Articles
  async getArticles(params?: SearchParams): Promise<Article[]> {
    let articles = Array.from(this.articles.values());
    
    if (params?.query) {
      const query = params.query.toLowerCase();
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query)
      );
    }
    
    if (params?.category) {
      articles = articles.filter(article => 
        article.category.toLowerCase() === params.category?.toLowerCase()
      );
    }
    
    if (params?.published !== undefined) {
      articles = articles.filter(article => article.published === params.published);
    }
    
    if (params?.featured !== undefined) {
      articles = articles.filter(article => article.featured === params.featured);
    }
    
    return articles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getArticle(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(article => 
      article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
    );
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const now = new Date();
    const article: Article = {
      ...insertArticle,
      id,
      authorImage: insertArticle.authorImage || null,
      tags: insertArticle.tags || [],
      imageUrl: insertArticle.imageUrl || null,
      views: 0,
      likes: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticle(id: string, updates: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updated: Article = {
      ...article,
      ...updates,
      updatedAt: new Date(),
    };
    this.articles.set(id, updated);
    return updated;
  }

  async deleteArticle(id: string): Promise<boolean> {
    return this.articles.delete(id);
  }

  async incrementViews(id: string): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.views = (article.views || 0) + 1;
      this.articles.set(id, article);
    }
  }

  async toggleLike(id: string): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (article) {
      article.likes = (article.likes || 0) + 1;
      this.articles.set(id, article);
      return article;
    }
    return undefined;
  }

  // Comments
  async getCommentsByArticleId(articleId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.articleId === articleId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      description: insertCategory.description || null,
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updated: Category = { ...category, ...updates };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }
}

export const storage = new MemStorage();
