import { Link } from 'react-router-dom';
import { useSettings } from '../../lib/useData';
import { Youtube, Instagram, Facebook, Send } from 'lucide-react';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-pink-100 dark:border-gray-900 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="md:col-span-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 font-poppins">StoryBlogger</span>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto md:mx-0">A magical place for kids to read inspiring, fun, and moral stories in Hindi and English.</p>
            
            {/* Social Links */}
            <div className="flex gap-4 items-center justify-center md:justify-start mt-6">
              {settings?.socialYoutubeEnabled && settings?.socialYoutube && (
                <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500"><Youtube size={24} /></a>
              )}
              {settings?.socialInstagramEnabled && settings?.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500"><Instagram size={24} /></a>
              )}
              {settings?.socialFacebookEnabled && settings?.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500"><Facebook size={24} /></a>
              )}
              {settings?.socialTelegramEnabled && settings?.socialTelegram && (
                <a href={settings.socialTelegram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500"><Send size={24} /></a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quick Links</h3>
            <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Home</Link>
            <Link to="/stories" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">All Stories</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Legal</h3>
            <Link to="/privacy-policy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Terms of Service</Link>
            <Link to="/disclaimer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Disclaimer</Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} StoryBlogger. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
