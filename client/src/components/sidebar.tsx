import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Flame, Eye, Cloud, Sun, Wind, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Sidebar() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles", { published: true }],
    queryFn: () => api.getArticles({ published: true }),
  });

  const trendingArticles = Array.isArray(articles) 
    ? articles
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
    : [];

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    }
  };

  return (
    <aside className="space-y-8">
      {/* Trending Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold text-news-gray-900">
            <Flame className="text-red-500 mr-2 w-5 h-5" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trendingArticles.map((article, index) => (
            <div key={article.id} className="flex items-start space-x-3 group cursor-pointer">
              <span className="text-2xl font-bold text-news-gray-300 group-hover:text-news-blue transition-colors">
                {index + 1}
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-news-gray-900 group-hover:text-news-blue transition-colors line-clamp-3">
                  {article.title}
                </h4>
                <div className="flex items-center mt-2 text-xs text-news-gray-500">
                  <span>{article.category}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {(article.views || 0).toLocaleString()} views
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Articles with Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-news-gray-900">
            Recent Stories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {articles.slice(0, 4).map((article) => (
            <div key={article.id} className="group cursor-pointer">
              <a href={`/article/${article.id}`} className="block">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-20 h-16 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <div className="w-20 h-16 bg-gradient-to-br from-news-blue to-blue-600 rounded-lg flex items-center justify-center group-hover:opacity-90 transition-opacity">
                        <span className="text-white text-lg font-bold">
                          {article.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                        {article.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-news-gray-900 group-hover:text-news-blue transition-colors line-clamp-2 leading-tight mb-2">
                      {article.title}
                    </h4>
                    <p className="text-xs text-news-gray-600 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-news-gray-500">
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{(article.views || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Newsletter Widget */}
      <Card className="bg-news-blue text-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Stay Updated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-100 mb-6">
            Get the latest news delivered to your inbox every morning.
          </p>
          <form onSubmit={handleNewsletterSignup} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white text-news-gray-900 border-0 focus:ring-2 focus:ring-blue-300"
              required
            />
            <Button
              type="submit"
              className="w-full bg-white text-news-blue hover:bg-gray-100"
            >
              Subscribe Now
            </Button>
          </form>
          <p className="text-xs text-blue-200 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </CardContent>
      </Card>

      {/* Weather Widget */}
      <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">New York City</h3>
              <p className="text-blue-100 text-sm">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold flex items-center">
                22°C
                <Sun className="ml-2 w-8 h-8" />
              </div>
              <p className="text-blue-100 text-sm">Partly Cloudy</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>10 km</span>
            </div>
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4" />
              <span>65%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4" />
              <span>15 km/h</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-news-gray-900">Follow Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <a
            href="#"
            className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow group border"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                T
              </div>
              <div>
                <p className="font-medium text-news-gray-900">Twitter</p>
                <p className="text-sm text-news-gray-500">125K followers</p>
              </div>
            </div>
          </a>

          <a
            href="#"
            className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow group border"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                F
              </div>
              <div>
                <p className="font-medium text-news-gray-900">Facebook</p>
                <p className="text-sm text-news-gray-500">89K followers</p>
              </div>
            </div>
          </a>

          <a
            href="#"
            className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow group border"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                L
              </div>
              <div>
                <p className="font-medium text-news-gray-900">LinkedIn</p>
                <p className="text-sm text-news-gray-500">67K followers</p>
              </div>
            </div>
          </a>
        </CardContent>
      </Card>
    </aside>
  );
}
