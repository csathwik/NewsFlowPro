import { Share2, MessageCircle, Send } from "lucide-react";
import { Button } from "./button";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Share:</span>
      
      {/* Native share button for mobile */}
      {navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="flex items-center gap-1"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      )}

      {/* Twitter */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Twitter
      </Button>

      {/* WhatsApp */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('whatsapp')}
        className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>

      {/* Telegram */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('telegram')}
        className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-500 border-blue-200"
      >
        <Send className="h-4 w-4" />
        Telegram
      </Button>
    </div>
  );
}