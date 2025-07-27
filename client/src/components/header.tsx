import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <header className="bg-white border-b border-news-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-2 text-sm border-b border-news-gray-100">
          <div className="flex items-center space-x-4 text-news-gray-600">
            <span>{getCurrentDate()}</span>
            <span>•</span>
            <span>{getCurrentTime()}</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button size="sm" className="bg-news-blue hover:bg-blue-700">
              Subscribe
            </Button>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl lg:text-3xl font-bold text-news-gray-900 cursor-pointer">
                <span className="text-news-blue">News</span>Hub
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-news-gray-700 hover:text-news-blue font-medium transition-colors border-b-2 border-news-blue">
              Home
            </Link>
            {categories.slice(0, 6).map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="text-news-gray-700 hover:text-news-blue font-medium transition-colors">
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <Input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-news-gray-300 rounded-lg focus:ring-2 focus:ring-news-blue focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-news-gray-400 w-4 h-4" />
            </form>
            <button
              className="lg:hidden text-news-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-news-gray-200">
          <div className="px-4 py-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-news-gray-300 rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-news-gray-400 w-4 h-4" />
            </form>
            <nav className="flex flex-col space-y-3">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-news-gray-700 hover:text-news-blue font-medium py-2 border-b border-news-gray-100">
                Home
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-news-gray-700 hover:text-news-blue font-medium py-2 border-b border-news-gray-100"
                >
                  {category.name}
                </Link>
              ))}
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-news-gray-700 hover:text-news-blue font-medium py-2">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Breaking News Banner */}
      <div className="bg-red-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <span className="bg-white text-red-600 px-2 py-1 rounded text-xs font-bold mr-3">
              BREAKING
            </span>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm animate-pulse">
                Major economic summit concludes with landmark trade agreement between global partners
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
