import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/article-card";
import Sidebar from "@/components/sidebar";
import { api } from "@/lib/api";
import type { Article } from "@shared/schema";

export default function Home() {

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["/api/articles", { published: true }],
    queryFn: () => api.getArticles({ published: true }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });

  const featuredArticles = Array.isArray(articles) ? articles.filter(article => article.featured) : [];
  const featuredArticle = featuredArticles[0];
  const secondaryArticles = featuredArticles.slice(1, 4);
  const regularArticles = Array.isArray(articles) ? articles.filter(article => !article.featured) : [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-48 bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Hero Section */}
          <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Featured Article */}
              {featuredArticle && (
                <div className="lg:col-span-1">
                  <ArticleCard article={featuredArticle} variant="featured" />
                </div>
              )}

              {/* Secondary Articles */}
              <div className="space-y-6">
                {secondaryArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
            </div>
          </section>

          {/* Latest Articles Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-news-gray-900 mb-2">
                  Latest News
                </h2>
                <p className="text-news-gray-600">
                  Stay updated with the most recent stories and breaking news
                </p>
              </div>
            </div>

            {regularArticles.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left 50% - Featured Article */}
                <div className="relative">
                  <a href={`/article/${regularArticles[0].id}`} className="block group">
                    <div className="relative overflow-hidden rounded-lg">
                      {regularArticles[0].imageUrl ? (
                        <img
                          src={regularArticles[0].imageUrl}
                          alt={regularArticles[0].title}
                          className="w-full h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-news-blue to-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <span className="text-white text-4xl font-bold">
                            {regularArticles[0].title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <span className="inline-block px-3 py-1 bg-news-blue text-white text-sm font-medium rounded mb-3">
                          {regularArticles[0].category}
                        </span>
                        <h3 className="text-xl lg:text-2xl font-bold mb-2 group-hover:text-news-blue transition-colors">
                          {regularArticles[0].title}
                        </h3>
                        <p className="text-gray-200 text-sm mb-2 line-clamp-2">
                          {regularArticles[0].excerpt}
                        </p>
                        <div className="flex items-center text-xs text-gray-300">
                          <span>By {regularArticles[0].author}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(regularArticles[0].createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>

                {/* Right 50% - 4 Articles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {regularArticles.slice(1, 5).map((article) => (
                    <div key={article.id} className="group">
                      <a href={`/article/${article.id}`} className="block">
                        <div className="relative overflow-hidden rounded-lg mb-3">
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                              <span className="text-gray-400 text-2xl font-bold">
                                {article.title.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-news-gray-900 group-hover:text-news-blue transition-colors line-clamp-2 text-sm mb-2">
                          {article.title}
                        </h4>
                        <p className="text-news-gray-600 text-xs line-clamp-2 mb-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-news-gray-500">
                          <span>{article.author}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Load More Button */}
            {regularArticles.length > 5 && (
              <div className="text-center mt-12">
                <Button className="bg-news-blue hover:bg-blue-700 px-8 py-3">
                  Load More Articles
                </Button>
              </div>
            )}
          </section>

          {/* Category Sections */}
          {categories.slice(0, 4).map((category) => {
            const categoryArticles = Array.isArray(articles) 
              ? articles.filter(article => 
                  article.category.toLowerCase() === category.name.toLowerCase() && !article.featured
                ).slice(0, 5)
              : [];

            if (categoryArticles.length === 0) return null;

            const featuredArticle = categoryArticles[0];
            const sideArticles = categoryArticles.slice(1, 5);

            return (
              <section key={category.id} className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-news-gray-900 mb-2">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-news-gray-600">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <a 
                    href={`/category/${category.slug}`} 
                    className="text-news-blue hover:text-blue-700 font-medium transition-colors"
                  >
                    View All →
                  </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left 50% - Featured Article */}
                  {featuredArticle && (
                    <div className="relative">
                      <a href={`/article/${featuredArticle.id}`} className="block group">
                        <div className="relative overflow-hidden rounded-lg">
                          {featuredArticle.imageUrl ? (
                            <img
                              src={featuredArticle.imageUrl}
                              alt={featuredArticle.title}
                              className="w-full h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-news-blue to-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                              <span className="text-white text-4xl font-bold">
                                {featuredArticle.title.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <span className="inline-block px-3 py-1 bg-news-blue text-white text-sm font-medium rounded mb-3">
                              {category.name}
                            </span>
                            <h3 className="text-xl lg:text-2xl font-bold mb-2 group-hover:text-news-blue transition-colors">
                              {featuredArticle.title}
                            </h3>
                            <p className="text-gray-200 text-sm mb-2 line-clamp-2">
                              {featuredArticle.excerpt}
                            </p>
                            <div className="flex items-center text-xs text-gray-300">
                              <span>By {featuredArticle.author}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(featuredArticle.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  )}

                  {/* Right 50% - 4 Articles Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sideArticles.map((article) => (
                      <div key={article.id} className="group">
                        <a href={`/article/${article.id}`} className="block">
                          <div className="relative overflow-hidden rounded-lg mb-3">
                            {article.imageUrl ? (
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                <span className="text-gray-400 text-2xl font-bold">
                                  {article.title.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <h4 className="font-bold text-news-gray-900 group-hover:text-news-blue transition-colors line-clamp-2 text-sm mb-2">
                            {article.title}
                          </h4>
                          <p className="text-news-gray-600 text-xs line-clamp-2 mb-2">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center text-xs text-news-gray-500">
                            <span>{article.author}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
