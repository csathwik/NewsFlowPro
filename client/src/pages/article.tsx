import React from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Clock, User, Tag, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShareButtons } from "@/components/ui/share-buttons";
import { RelatedArticles } from "@/components/ui/related-articles";
import { CommentSystem } from "@/components/ui/comment-system";
import { apiRequest } from "@/lib/queryClient";
import type { Article } from "@shared/schema";

export default function Article() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ["/api/articles", id],
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: (articleId: string) => 
      apiRequest(`/api/articles/${articleId}/like`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles", id] });
    },
  });

  // Increment view count when article loads
  const incrementViewMutation = useMutation({
    mutationFn: (articleId: string) => 
      apiRequest(`/api/articles/${articleId}/views`, { method: "POST" }),
  });

  // Increment view on load
  React.useEffect(() => {
    if (article?.id) {
      incrementViewMutation.mutate(article.id);
    }
  }, [article?.id]);

  const handleLike = () => {
    if (article?.id) {
      likeMutation.mutate(article.id);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      Business: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      Health: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      Sports: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      Politics: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      Science: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
      Entertainment: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    };
    return colors[category] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min read`;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">The article you're looking for doesn't exist.</p>
        <Button onClick={() => history.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const currentUrl = window.location.href;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Article Content */}
        <article className="lg:col-span-2">
          {/* Article Header */}
          <header className="mb-8">
            {/* Category and Meta */}
            <div className="flex items-center gap-4 mb-6">
              <Badge className={getCategoryColor(article.category)}>
                {article.category}
              </Badge>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatReadingTime(article.content)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.views || 0} views
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              {article.excerpt}
            </p>
            
            {/* Author Info */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={article.authorImage} alt={article.author} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    {article.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{article.author}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{article.authorTitle}</p>
                </div>
              </div>
              
              {/* Engagement Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  {article.likes || 0}
                </Button>
              </div>
            </div>

            {/* Share Buttons */}
            <ShareButtons 
              url={currentUrl}
              title={article.title}
              description={article.excerpt}
            />

            <Separator className="my-8" />
          </header>

          {/* Featured Image */}
          {article.imageUrl && (
            <div className="mb-8">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-8 dark:prose-invert">
            {article.content.split('\n\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {paragraph}
                </p>
              )
            ))}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-12" />

          {/* Comments Section */}
          <CommentSystem articleId={article.id} />
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Article Stats */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Article Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Views</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(article.views || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Likes</span>
                  <span className="font-medium text-gray-900 dark:text-white">{article.likes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Published</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reading Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatReadingTime(article.content)}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            <RelatedArticles currentArticle={article} maxResults={4} />
          </div>
        </aside>
      </div>
    </div>
  );
}
