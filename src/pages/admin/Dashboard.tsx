import { Link } from 'react-router-dom';
import { useStories, useCategories } from '../../lib/useData';
import { FileText, Grid, Eye, Plus } from 'lucide-react';

export default function Dashboard() {
  const { stories } = useStories(false);
  const { categories } = useCategories();

  const totalViews = stories.reduce((sum, s) => sum + (s.views || 0), 0);
  const publishedStories = stories.filter(s => s.isPublished).length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back. Here's what's happening with your stories today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400"><FileText size={28} /></div>
            <div className="text-gray-600 dark:text-gray-400 font-semibold">Total Stories</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold dark:text-white mb-2">{stories.length}</div>
            <div className="text-sm rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 inline-flex items-center font-medium">{publishedStories} Published</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-pink-50 dark:bg-pink-900/30 rounded-xl text-pink-600 dark:text-pink-400"><Grid size={28} /></div>
            <div className="text-gray-600 dark:text-gray-400 font-semibold">Categories</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold dark:text-white mb-2">{categories.length}</div>
            <div className="text-sm rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 px-3 py-1 inline-flex items-center font-medium">Active Collections</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400"><Eye size={28} /></div>
            <div className="text-gray-600 dark:text-gray-400 font-semibold">Total Views</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold dark:text-white mb-2">{totalViews.toLocaleString()}</div>
            <div className="text-sm rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-3 py-1 inline-flex items-center font-medium">All time</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 dark:text-gray-100">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/story/new" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2">
            <Plus size={20} /> Create New Story
          </Link>
          <Link to="/admin/categories" className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold transition-colors">
            Manage Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
