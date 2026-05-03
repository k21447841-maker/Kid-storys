import { useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useStories, useCategories } from '../lib/useData';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, X, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function StoryList() {
  const { slug } = useParams();
  const { stories, loading: sLoading } = useStories(true);
  const { categories, loading: cLoading } = useCategories();
  const { language } = useStore();
  
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(slug || '');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  if (sLoading || cLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>;
  }

  const category = categories.find(c => c.slug === selectedCat);
  const categoryId = category?.id;

  const filtered = stories.filter(s => {
    if (language !== 'ALL' && s.language !== language) return false;
    if (categoryId && s.categoryId !== categoryId) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.metaDescription.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getShareUrl = () => {
    const origin = window.location.origin;
    if (selectedCat) return `${origin}/category/${selectedCat}`;
    return `${origin}/stories`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: category?.name || 'Stories', url: getShareUrl() });
    } else {
      navigator.clipboard.writeText(getShareUrl());
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
        <input 
          type="text" 
          placeholder="Search stories..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="w-full md:w-96 border p-2 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-pink-500"
        />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={selectedCat} 
            onChange={e => setSelectedCat(e.target.value)}
            className="w-full md:w-auto border p-2 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">All Categories</option>
            {categories.filter(c => c.isEnabled).map(c => (
               <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <button onClick={() => setIsQRModalOpen(true)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors" title="Show QR Code">
            <QrCode size={20} />
          </button>
          <button onClick={handleShare} className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors" title="Share via Link">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((story, i) => {
          const cat = categories.find(c => c.id === story.categoryId);
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={story.id}>
              <Link to={`/story/${story.slug}`} className="block group">
                <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none dark:border border-gray-700 transition-all duration-300">
                  <div className="relative h-48 w-full">
                    <img src={story.thumbnailUrl || `https://picsum.photos/600/400?random=${story.id}`} alt={story.title} loading="lazy" className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-pink-500 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">{cat?.name || 'Story'}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold dark:text-white mb-2 group-hover:text-pink-500 transition-colors line-clamp-2">{story.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{story.metaDescription}</p>
                    <div className="flex items-center text-sm text-gray-400 dark:text-gray-500 gap-4">
                      <span>{story.readTime || 5} min read</span>
                      <span>•</span>
                      <span>{story.views || 0} views</span>
                      <span>•</span>
                      <span>{story.language === 'HI' ? 'Hindi' : 'English'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          No stories found matching your criteria.
        </div>
      )}

      {/* QR Code Modal for Sharing Category/List */}
      <AnimatePresence>
        {isQRModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQRModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden w-full max-w-sm p-8 text-center"
            >
              <button 
                onClick={() => setIsQRModalOpen(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full p-2 transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="mb-6">
                <QrCode size={40} className="mx-auto text-pink-500 mb-4" />
                <h3 className="text-xl font-bold dark:text-white">Share {category ? category.name : 'Stories'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Scan this code with another device to open this link.</p>
              </div>

              <div className="bg-white p-4 rounded-2xl w-fit mx-auto border-2 border-gray-100 shadow-sm">
                 <QRCodeSVG value={getShareUrl()} size={200} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
