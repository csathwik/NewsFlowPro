import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ArticleForm from "@/components/article-form";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Article } from "@shared/schema";

export default function Admin() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["/api/articles"],
    queryFn: () => api.getArticles(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: string) => api.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Article deleted",
        description: "The article has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedArticle(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArticleMutation.mutate(id);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const publishedArticles = articles.filter(article => article.published);
  const draftArticles = articles.filter(article => !article.published);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-news-gray-900">Content Management</h1>
          <p className="text-news-gray-600 mt-2">Manage your articles and content</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="bg-news-blue hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedArticle ? "Edit Article" : "Create New Article"}
              </DialogTitle>
            </DialogHeader>
            <ArticleForm
              article={selectedArticle}
              onClose={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-news-gray-600">
              Total Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-news-gray-900">{articles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-news-gray-600">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedArticles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-news-gray-600">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{draftArticles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-news-gray-600">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-news-blue">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Articles Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Articles ({articles.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedArticles.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftArticles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ArticlesList
            articles={articles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            formatDate={formatDate}
            getCategoryColor={getCategoryColor}
          />
        </TabsContent>

        <TabsContent value="published">
          <ArticlesList
            articles={publishedArticles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            formatDate={formatDate}
            getCategoryColor={getCategoryColor}
          />
        </TabsContent>

        <TabsContent value="drafts">
          <ArticlesList
            articles={draftArticles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            formatDate={formatDate}
            getCategoryColor={getCategoryColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ArticlesListProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
  formatDate: (date: Date) => string;
  getCategoryColor: (category: string) => string;
}

function ArticlesList({ articles, onEdit, onDelete, formatDate, getCategoryColor }: ArticlesListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-news-gray-900 mb-2">No articles found</h3>
        <p className="text-news-gray-600">Create your first article to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {articles.map((article) => (
        <Card key={article.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={getCategoryColor(article.category)}>
                    {article.category}
                  </Badge>
                  <div className="flex items-center text-sm text-news-gray-500">
                    {article.published ? (
                      <Eye className="w-4 h-4 mr-1" />
                    ) : (
                      <EyeOff className="w-4 h-4 mr-1" />
                    )}
                    {article.published ? "Published" : "Draft"}
                  </div>
                  {article.featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-news-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-news-gray-600 mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center text-sm text-news-gray-500">
                  <span>By {article.author}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(article.createdAt)}</span>
                  <span className="mx-2">•</span>
                  <span>{article.views} views</span>
                  <span className="mx-2">•</span>
                  <span>{article.likes} likes</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(article)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(article.id)}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
