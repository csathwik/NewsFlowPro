import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { insertArticleSchema } from "@shared/schema";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Article } from "@shared/schema";

const articleFormSchema = insertArticleSchema.extend({
  tags: z.array(z.string()).default([]),
});

type ArticleFormData = z.infer<typeof articleFormSchema>;

interface ArticleFormProps {
  article?: Article | null;
  onClose: () => void;
}

export default function ArticleForm({ article, onClose }: ArticleFormProps) {
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article?.title || "",
      content: article?.content || "",
      excerpt: article?.excerpt || "",
      author: article?.author || "",
      authorTitle: article?.authorTitle || "",
      authorImage: article?.authorImage || "",
      category: article?.category || "",
      tags: article?.tags || [],
      imageUrl: article?.imageUrl || "",
      published: article?.published === true,
      featured: article?.featured === true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ArticleFormData) => api.createArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Article created",
        description: "Your article has been successfully created.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ArticleFormData) => api.updateArticle(article!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Article updated",
        description: "Your article has been successfully updated.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    if (article) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-news-gray-900">Basic Information</h3>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter article title"
                    {...field}
                    className="text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief summary of the article"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your article content here..."
                    rows={12}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Author Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-news-gray-900">Author Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Author's full name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Senior Reporter, Technology Editor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="authorImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author Image URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/author-photo.jpg"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Categorization */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-news-gray-900">Categorization</h3>
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </div>
            {form.watch("tags").length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("tags").map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Media */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-news-gray-900">Media</h3>
          
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/featured-image.jpg"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Publishing Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-news-gray-900">Publishing Options</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Published</Label>
              <p className="text-sm text-news-gray-600">
                Make this article visible to readers
              </p>
            </div>
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Featured Article</Label>
              <p className="text-sm text-news-gray-600">
                Display this article prominently on the homepage
              </p>
            </div>
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-news-blue hover:bg-blue-700"
          >
            {isLoading
              ? article
                ? "Updating..."
                : "Creating..."
              : article
              ? "Update Article"
              : "Create Article"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
