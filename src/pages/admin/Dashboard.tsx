import { Link } from 'react-router-dom';
import { useStories, useCategories } from '../../lib/useData';
import { FileText, Grid, Eye } from 'lucide-react';

export default function Dashboard() {
  const { stories } = useStories(false);
  const { categories } = useCategories();

  const totalViews = stories.reduce((sum, s) => sum + (s.views || 0), 0);
  const publishedStories = stories.filter(s => s.isPublished).length;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 dark:text-gray-100">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300"><FileText size={32} /></div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Total Stories</div>
            <div className="text-3xl font-bold dark:text-white">{stories.length}</div>
            <div className="text-sm text-green-500">{publishedStories} Published</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-4 bg-pink-100 dark:bg-pink-900 rounded-full text-pink-600 dark:text-pink-300"><Grid size={32} /></div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Categories</div>
            <div className="text-3xl font-bold dark:text-white">{categories.length}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-600 dark:text-purple-300"><Eye size={32} /></div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Total Views</div>
            <div className="text-3xl font-bold dark:text-white">{totalViews}</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Quick Actions</h2>
      <div className="flex gap-4">
        <Link to="/admin/story/new" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors">Create New Story</Link>
        <Link to="/admin/categories" className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors">Manage Categories</Link>
      </div>
    </div>
  );
}
