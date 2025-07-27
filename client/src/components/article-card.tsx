import { Link } from "wouter";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact";
}

export default function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: (id: string) => api.likeArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    likeMutation.mutate(article.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: `/article/${article.id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/article/${article.id}`);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-blue-100 text-blue-700",
      Business: "bg-green-100 text-green-700",
      Health: "bg-purple-100 text-purple-700",
      Sports: "bg-orange-100 text-orange-700",
      Politics: "bg-red-100 text-red-700",
      Science: "bg-indigo-100 text-indigo-700",
      Entertainment: "bg-pink-100 text-pink-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (variant === "featured") {
    return (
      <Link href={`/article/${article.id}`}>
        <article className="cursor-pointer group">
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
            />
          )}
          <div className="mt-4">
            <div className="flex items-center mb-3">
              <Badge className={getCategoryColor(article.category)}>
                {article.category}
              </Badge>
              <span className="text-news-gray-500 text-sm ml-3">
                {formatTimeAgo(article.createdAt)}
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-news-gray-900 mb-3 group-hover:text-news-blue transition-colors">
              {article.title}
            </h2>
            <p className="text-news-gray-600 text-lg leading-relaxed mb-4">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {article.authorImage && (
                  <img
                    src={article.authorImage}
                    alt={article.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-news-gray-900">{article.author}</p>
                  <p className="text-xs text-news-gray-500">{article.authorTitle}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-news-gray-500">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className="hover:text-news-blue"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  {article.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="hover:text-news-blue"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/article/${article.id}`}>
        <article className="flex space-x-4 pb-6 border-b border-news-gray-200 last:border-b-0 cursor-pointer group">
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-24 h-16 object-cover rounded flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
              <Badge className={getCategoryColor(article.category)} variant="secondary">
                {article.category}
              </Badge>
              <span className="text-news-gray-500 text-xs ml-2">
                {formatTimeAgo(article.createdAt)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-news-gray-900 group-hover:text-news-blue transition-colors line-clamp-2">
              {article.title}
            </h3>
            <p className="text-sm text-news-gray-600 mt-2">By {article.author}</p>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.id}`}>
      <article className="group cursor-pointer">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-48 object-cover rounded-lg group-hover:shadow-lg transition-shadow"
          />
        )}
        <div className="mt-4">
          <div className="flex items-center mb-3">
            <Badge className={getCategoryColor(article.category)}>
              {article.category}
            </Badge>
            <span className="text-news-gray-500 text-sm ml-3">
              {formatTimeAgo(article.createdAt)}
            </span>
          </div>
          <h3 className="text-xl font-bold text-news-gray-900 group-hover:text-news-blue transition-colors mb-3">
            {article.title}
          </h3>
          <p className="text-news-gray-600 mb-4">{article.excerpt}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-news-gray-600">By {article.author}</p>
            <div className="flex items-center space-x-3 text-news-gray-500 text-sm">
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {article.likes}
              </span>
              <span className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {article.views}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
