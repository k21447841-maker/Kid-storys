import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStories, useCategories, useSettings } from '../lib/useData';
import { useStore } from '../store/useStore';

export default function Home() {
  const { stories, loading: storiesLoading } = useStories(true);
  const { categories, loading: categoriesLoading } = useCategories();
  const { settings } = useSettings();
  const { language } = useStore();

  const filteredStories = stories.filter(s => language === 'ALL' || s.language === language);
  const featured = filteredStories.slice(0, 3);
  const recent = filteredStories.slice(0, 6);
  const trending = [...filteredStories].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);
  const enabledCategories = categories.filter(c => c.isEnabled);

  if (storiesLoading || categoriesLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-400 to-violet-500 shadow-xl shadow-pink-500/20">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        {settings?.heroImageUrl && (
          <img src={settings.heroImageUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        )}
        <div className="relative z-10 px-6 py-20 md:py-32 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 font-poppins"
          >
            Welcome to StoryBlogger
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto"
          >
            A magical journey into the world of stories.
          </motion.p>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold dark:text-white">Explore Categories</h2>
          <Link to="/stories" className="text-pink-500 hover:text-pink-600 font-medium">View All &rarr;</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {enabledCategories.map((cat, i) => (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={cat.id}>
              <Link to={`/category/${cat.slug}`} className="block relative h-32 rounded-2xl overflow-hidden group">
                <img src={cat.imageUrl || `https://picsum.photos/400/300?random=${cat.id}`} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute inset-0 flex items-end p-4">
                  <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Stories */}
      <section>
        <h2 className="text-3xl font-bold dark:text-white mb-8">Recent Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recent.map((story) => (
            <StoryCard key={story.id} story={story} categories={categories} />
          ))}
        </div>
      </section>

      {/* Trending Stories */}
      <section>
        <h2 className="text-3xl font-bold dark:text-white mb-8">Trending Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trending.map((story) => (
            <StoryCard key={story.id} story={story} categories={categories} />
          ))}
        </div>
      </section>

    </div>
  );
}

function StoryCard({ story, categories }: { story: any, categories: any[] }) {
  const category = categories.find(c => c.id === story.categoryId);
  return (
    <Link to={`/story/${story.slug}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none dark:border border-gray-700 transition-all duration-300 transform group-hover:-translate-y-1">
        <div className="relative h-48 w-full">
          <img src={story.thumbnailUrl || `https://picsum.photos/600/400?random=${story.id}`} alt={story.title} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
          <div className="absolute top-4 left-4">
            <span className="bg-pink-500 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">{category?.name || 'Story'}</span>
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
  );
}
