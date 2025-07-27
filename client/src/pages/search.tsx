import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ArticleCard from "@/components/article-card";
import Sidebar from "@/components/sidebar";
import { api } from "@/lib/api";

export default function Search() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Parse search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const q = params.get('q') || '';
    const category = params.get('category') || '';
    setSearchQuery(q);
    setSelectedCategory(category);
  }, [location]);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["/api/search", { query: searchQuery, category: selectedCategory, published: true }],
    queryFn: () => api.search({ 
      query: searchQuery || undefined, 
      category: selectedCategory || undefined, 
      published: true 
    }),
    enabled: !!(searchQuery || selectedCategory),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    setLocation(`/search?${params.toString()}`);
  };

  const handleCategoryFilter = (category: string) => {
    const newCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newCategory);
    
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (newCategory) params.set('category', newCategory);
    setLocation(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setLocation("/search");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-news-gray-900 mb-6">
              Search News
            </h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative mb-6">
              <Input
                type="text"
                placeholder="Search articles, authors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-lg border border-news-gray-300 rounded-lg focus:ring-2 focus:ring-news-blue focus:border-transparent"
              />
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-news-gray-400 w-5 h-5" />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-news-blue hover:bg-blue-700"
              >
                Search
              </Button>
            </form>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm font-medium text-news-gray-700 mr-2">Filter by category:</span>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.name ? "default" : "secondary"}
                  className={`cursor-pointer hover:bg-news-blue hover:text-white ${
                    selectedCategory === category.name ? "bg-news-blue text-white" : ""
                  }`}
                  onClick={() => handleCategoryFilter(category.name)}
                >
                  {category.name}
                </Badge>
              ))}
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Search Results Info */}
            {(searchQuery || selectedCategory) && (
              <div className="mb-6">
                <p className="text-news-gray-600">
                  {isLoading ? (
                    "Searching..."
                  ) : (
                    <>
                      Found {articles.length} result{articles.length !== 1 ? 's' : ''}
                      {searchQuery && (
                        <> for "<span className="font-medium">{searchQuery}</span>"</>
                      )}
                      {selectedCategory && (
                        <> in <span className="font-medium">{selectedCategory}</span></>
                      )}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Search Results */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="h-48 bg-gray-200 rounded-lg" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : (searchQuery || selectedCategory) && articles.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-news-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-news-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-news-gray-600 mb-6">
                Try adjusting your search terms or filters.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (searchQuery || selectedCategory) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-news-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-news-gray-900 mb-2">
                Start Your Search
              </h3>
              <p className="text-news-gray-600">
                Enter keywords or select a category to find relevant news articles.
              </p>
            </div>
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
