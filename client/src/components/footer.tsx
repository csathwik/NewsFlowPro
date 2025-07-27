import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Footer() {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });

  return (
    <footer className="bg-news-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold mb-4">
              <span className="text-news-blue">News</span>Hub
            </h2>
            <p className="text-news-gray-300 mb-6">
              Your trusted source for breaking news, in-depth analysis, and compelling stories from around the world.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-3 text-news-gray-300">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link href={`/category/${category.slug}`} className="hover:text-white transition-colors">{category.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-news-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Team</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Advertise</a></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-news-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-news-gray-800 pt-8 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-news-gray-400 text-sm">
              © 2023 NewsHub. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-news-gray-400 hover:text-white text-sm transition-colors">Privacy</a>
              <a href="#" className="text-news-gray-400 hover:text-white text-sm transition-colors">Terms</a>
              <a href="#" className="text-news-gray-400 hover:text-white text-sm transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
