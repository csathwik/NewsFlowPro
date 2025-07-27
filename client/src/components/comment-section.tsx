import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Comment } from "@shared/schema";

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["/api/articles", articleId, "comments"],
    queryFn: () => api.getComments(articleId),
  });

  const createCommentMutation = useMutation({
    mutationFn: (comment: { author: string; email: string; content: string }) =>
      api.createComment(articleId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles", articleId, "comments"] });
      setAuthor("");
      setEmail("");
      setContent("");
      toast({
        title: "Comment posted!",
        description: "Your comment has been added to the discussion.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !email.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    createCommentMutation.mutate({ author, email, content });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <MessageCircle className="w-6 h-6 mr-2 text-news-blue" />
        <h2 className="text-2xl font-bold text-news-gray-900">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Leave a Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author">Name *</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="content">Comment *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={createCommentMutation.isPending}
              className="bg-news-blue hover:bg-blue-700"
            >
              {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-news-gray-600 text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-news-gray-900">{comment.author}</h4>
                    <p className="text-sm text-news-gray-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-news-gray-700 leading-relaxed">{comment.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
