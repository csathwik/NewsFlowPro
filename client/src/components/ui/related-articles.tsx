import { useQuery } from "@tanstack/react-query";
import type { Article } from "@shared/schema";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";

interface RelatedArticlesProps {
  currentArticle: Article;
  maxResults?: number;
}

export function RelatedArticles({ currentArticle, maxResults = 4 }: RelatedArticlesProps) {
  const { data: allArticles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  // Find related articles based on category and tags
  const relatedArticles = allArticles
    .filter(article => {
      // Exclude current article
      if (article.id === currentArticle.id) return false;
      
      // Same category gets priority
      if (article.category === currentArticle.category) return true;
      
      // Articles with matching tags
      const currentTags = currentArticle.tags || [];
      const articleTags = article.tags || [];
      const hasMatchingTags = currentTags.some(tag => articleTags.includes(tag));
      
      return hasMatchingTags;
    })
    .sort((a, b) => {
      // Prioritize by category match first, then by creation date
      const aIsCategory = a.category === currentArticle.category ? 1 : 0;
      const bIsCategory = b.category === currentArticle.category ? 1 : 0;
      
      if (aIsCategory !== bIsCategory) {
        return bIsCategory - aIsCategory;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, maxResults);

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedArticles.map((article) => (
          <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <a href={`/article/${article.id}`} className="block">
              <div className="relative">
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 text-3xl font-bold">
                      {article.title.charAt(0)}
                    </span>
                  </div>
                )}
                <Badge 
                  variant="secondary" 
                  className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90"
                >
                  {article.category}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {article.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>By {article.author}</span>
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}