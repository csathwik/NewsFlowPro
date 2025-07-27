import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Card, CardContent, CardHeader } from "./card";
import { Avatar, AvatarFallback } from "./avatar";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Comment, InsertComment } from "@shared/schema";

interface CommentSystemProps {
  articleId: string;
}

export function CommentSystem({ articleId }: CommentSystemProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState({ author: "", email: "", content: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["/api/comments", articleId],
    queryFn: () => fetch(`/api/articles/${articleId}/comments`).then(res => res.json()),
  });

  const createCommentMutation = useMutation({
    mutationFn: (newComment: InsertComment) => 
      apiRequest(`/api/articles/${articleId}/comments`, {
        method: "POST",
        body: JSON.stringify(newComment),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", articleId] });
      setComment({ author: "", email: "", content: "" });
      setIsCommenting(false);
      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully.",
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

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => 
      apiRequest(`/api/comments/${commentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", articleId] });
      toast({
        title: "Comment deleted",
        description: "The comment has been removed.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.author.trim() || !comment.email.trim() || !comment.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate({
      articleId,
      author: comment.author.trim(),
      email: comment.email.trim(),
      content: comment.content.trim(),
    });
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

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6 text-blue-600" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <Card className="mb-8">
        <CardHeader>
          <h4 className="font-semibold text-gray-900 dark:text-white">Leave a Comment</h4>
        </CardHeader>
        <CardContent>
          {!isCommenting ? (
            <Button 
              onClick={() => setIsCommenting(true)}
              className="w-full"
              variant="outline"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Write a comment...
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Your name"
                  value={comment.author}
                  onChange={(e) => setComment(prev => ({ ...prev, author: e.target.value }))}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your email (not published)"
                  value={comment.email}
                  onChange={(e) => setComment(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <Textarea
                placeholder="Write your comment here..."
                value={comment.content}
                onChange={(e) => setComment(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                required
              />
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createCommentMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsCommenting(false);
                    setComment({ author: "", email: "", content: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No comments yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Be the first to share your thoughts on this article.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {comment.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {comment.author}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}