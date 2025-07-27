import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ArticleCard from "@/components/article-card";
import Sidebar from "@/components/sidebar";
import { api } from "@/lib/api";

export default function Category() {
  const { slug } = useParams();

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["/api/categories", slug],
    queryFn: () => api.getCategory(slug!),
    enabled: !!slug,
  });

  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ["/api/articles", { category: category?.name, published: true }],
    queryFn: () => api.getArticles({ category: category?.name, published: true }),
    enabled: !!category?.name,
  });

  if (categoryLoading || articlesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
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

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
        <p className="text-gray-600">The category you're looking for doesn't exist.</p>
      </div>
    );
  }

  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-blue-100 text-blue-700",
      Business: "bg-green-100 text-green-700",
      Health: "bg-purple-100 text-purple-700",
      Sports: "bg-orange-100 text-orange-700",
      Politics: "bg-red-100 text-red-700",
      Science: "bg-indigo-100 text-indigo-700",
      Entertainment: "bg-pink-100 text-pink-700",
    };
    return colors[categoryName] || "bg-gray-100 text-gray-700";
  };

  const featuredArticle = articles.find(article => article.featured) || articles[0];
  const regularArticles = articles.filter(article => article.id !== featuredArticle?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Category Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(category.name)}`}>
                {category.name}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-news-gray-900 mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-news-gray-600 mb-8">
                {category.description}
              </p>
            )}
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-news-gray-900 mb-2">
                No articles found
              </h3>
              <p className="text-news-gray-600">
                There are no published articles in this category yet.
              </p>
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {featuredArticle && (
                <div className="mb-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="relative">
                      {featuredArticle.imageUrl ? (
                        <img
                          src={featuredArticle.imageUrl}
                          alt={featuredArticle.title}
                          className="w-full h-64 lg:h-80 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-news-blue to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-6xl font-bold">
                            {featuredArticle.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category.name)}`}>
                          {category.name}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-2xl lg:text-3xl font-bold text-news-gray-900 leading-tight">
                        <a href={`/article/${featuredArticle.id}`} className="hover:text-news-blue transition-colors">
                          {featuredArticle.title}
                        </a>
                      </h2>
                      <p className="text-news-gray-600 text-lg leading-relaxed">
                        {featuredArticle.excerpt}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-news-gray-500">
                        <span>By {featuredArticle.author}</span>
                        <span>•</span>
                        <span>{new Date(featuredArticle.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{(featuredArticle.views || 0).toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Regular Articles Grid */}
              {regularArticles.length > 0 && (
                <>
                  <div className="border-t border-news-gray-200 pt-8 mb-6">
                    <h3 className="text-xl font-bold text-news-gray-900">More {category.name} News</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {regularArticles.map((article) => (
                      <div key={article.id} className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="relative">
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-3xl font-bold">
                                {article.title.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-news-gray-900 mb-2 line-clamp-2 leading-tight">
                            <a href={`/article/${article.id}`} className="hover:text-news-blue transition-colors">
                              {article.title}
                            </a>
                          </h4>
                          <p className="text-news-gray-600 text-sm mb-3 line-clamp-2">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-news-gray-500">
                            <span>{article.author}</span>
                            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
