import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import Markdown from 'react-markdown';
import { useCategories } from '../lib/useData';
import { useStore } from '../store/useStore';
import { Bookmark, Type, Share2, ArrowLeft, ArrowRight, Facebook, Twitter, Linkedin } from 'lucide-react';
import { motion, useScroll } from 'motion/react';

export default function StoryDetail() {
  const { slug } = useParams();
  const [story, setStory] = useState<any>(null);
  const [navStories, setNavStories] = useState<{prev: any, next: any}>({prev: null, next: null});
  const [loading, setLoading] = useState(true);
  const { categories } = useCategories();
  const { scrollYProgress } = useScroll();
  const [fontSize, setFontSize] = useState<number>(18);
  const { bookmarks, toggleBookmark } = useStore();

  useEffect(() => {
    async function fetchStory() {
      try {
        const q = query(collection(db, 'stories'), where('slug', '==', slug), where('isPublished', '==', true));
        const qs = await getDocs(q);
        if (!qs.empty) {
          const docData = qs.docs[0];
          const data = { id: docData.id, ...docData.data() };
          setStory(data);
          
          // Increment View (no await needed for UI)
          updateDoc(doc(db, 'stories', docData.id), { views: increment(1) }).catch(console.error);

          // Just fetch a random prev/next for simplicity if we can't do complex cursors easily
          const allQ = query(collection(db, 'stories'), where('isPublished', '==', true));
          const allQs = await getDocs(allQ);
          const all = allQs.docs.map(d => ({id: d.id, ...d.data()}));
          const idx = all.findIndex(a => a.id === docData.id);
          setNavStories({
            prev: idx > 0 ? all[idx - 1] : null,
            next: idx < all.length - 1 ? all[idx + 1] : null
          });
        }
        setLoading(false);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, 'stories');
        setLoading(false);
      }
    }
    setLoading(true);
    fetchStory();
  }, [slug]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>;
  if (!story) return <div className="text-center py-20 text-2xl font-bold dark:text-white">Story not found.</div>;

  const category = categories.find(c => c.id === story.categoryId);
  const isBookmarked = bookmarks.includes(story.id);

  const getThemeClass = (themeName: string) => {
    switch (themeName) {
      case 'Kids': return 'bg-yellow-50 dark:bg-yellow-950 font-poppins';
      case 'Horror': return 'bg-gray-900 text-gray-100 font-sans';
      case 'Moral': return 'bg-green-50 dark:bg-green-950 font-sans';
      case 'Royal': return 'bg-amber-50 dark:bg-amber-950 font-serif';
      default: return 'bg-white dark:bg-gray-950';
    }
  };

  const themeClass = getThemeClass(story.theme || category?.theme || 'Default');

  const shareTitle = story.title ? encodeURIComponent(story.title) : '';
  const shareUrl = encodeURIComponent(window.location.href);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: story.title, text: story.metaDescription, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank', 'noopener,noreferrer');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`, '_blank', 'noopener,noreferrer');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className={`pb-20 min-h-screen transition-colors duration-500 ${themeClass}`}>
      <Helmet>
        <title>{story.metaTitle || story.title} - StoryBlogger</title>

        <meta name="description" content={story.metaDescription} />
        <meta name="keywords" content={story.keywords} />
        <meta property="og:title" content={story.title} />
        <meta property="og:image" content={story.bannerUrl || story.thumbnailUrl} />
      </Helmet>

      {/* Reading Progress */}
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-pink-500 origin-left z-50 pointer-events-none" style={{ scaleX: scrollYProgress }} />

      {/* Banner */}
      <div className="relative h-64 md:h-96 w-full bg-gray-200 dark:bg-gray-800">
        <img src={story.bannerUrl || `https://picsum.photos/1200/600?random=${story.id}`} alt={story.title} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
          <Link to={`/category/${category?.slug}`} className="inline-block bg-pink-500 text-white text-sm px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-4 hover:bg-pink-600 transition-colors">{category?.name}</Link>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">{story.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span>{story.readTime || 5} min read</span>
            <span>•</span>
            <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{(story.views || 0) + 1} views</span>
            <span>•</span>
            <span>{story.language === 'HI' ? 'Hindi' : 'English'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Controls */}
        <div className="flex flex-wrap justify-end gap-3 mb-8">
          <button onClick={() => setFontSize(s => Math.min(s + 2, 28))} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200" title="Increase Font Size"><Type size={20} /></button>
          <button onClick={() => setFontSize(s => Math.max(s - 2, 14))} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200" title="Decrease Font Size"><Type size={14} /></button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 my-auto mx-1"></div>
          <button onClick={() => toggleBookmark(story.id)} className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'} hover:bg-gray-200 dark:hover:bg-gray-700`} title="Bookmark">
             <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 my-auto mx-1"></div>
          <button onClick={shareFacebook} className="p-2 bg-[#1877F2]/10 dark:bg-[#1877F2]/20 text-[#1877F2] rounded-full hover:bg-[#1877F2]/20 dark:hover:bg-[#1877F2]/30 transition-colors" title="Share on Facebook"><Facebook size={20} /></button>
          <button onClick={shareTwitter} className="p-2 bg-sky-100 dark:bg-sky-900/30 text-sky-500 rounded-full hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors" title="Share on Twitter"><Twitter size={20} /></button>
          <button onClick={shareLinkedIn} className="p-2 bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 text-[#0A66C2] rounded-full hover:bg-[#0A66C2]/20 dark:hover:bg-[#0A66C2]/30 transition-colors" title="Share on LinkedIn"><Linkedin size={20} /></button>
          <button onClick={handleShare} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors" title="Share"><Share2 size={20} /></button>
        </div>

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none transition-all" style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}>
          <div className="markdown-body">
            <Markdown>{story.content}</Markdown>
          </div>
        </div>

        {/* Next / Prev */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 pt-8 border-t dark:border-gray-800">
          {navStories.prev ? (
            <Link to={`/story/${navStories.prev.slug}`} className="flex items-center gap-4 p-4 border dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
              <ArrowLeft className="text-gray-400 group-hover:text-pink-500" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Previous Story</div>
                <div className="font-bold dark:text-white line-clamp-1 group-hover:text-pink-500">{navStories.prev.title}</div>
              </div>
            </Link>
          ) : <div></div>}
          
          {navStories.next ? (
            <Link to={`/story/${navStories.next.slug}`} className="flex items-center justify-end text-right gap-4 p-4 border dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Next Story</div>
                <div className="font-bold dark:text-white line-clamp-1 group-hover:text-pink-500">{navStories.next.title}</div>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-pink-500" />
            </Link>
          ) : <div></div>}
        </div>
      </div>
    </article>
  );
}
