import { Link, useNavigate } from 'react-router-dom';
import { useStories, useCategories } from '../../lib/useData';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { doc, deleteDoc } from 'firebase/firestore';
import { logAdminAction } from '../../lib/auditLogger';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function ManageStories() {
  const { stories, loading } = useStories(false);
  const { categories } = useCategories();
  const navigate = useNavigate();

  const handleDelete = async (id: string, title?: string) => {
    if (confirm('Delete this story? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'stories', id));
        await logAdminAction('DELETE', 'Story', id, `Deleted story: ${title}`);
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, 'stories');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Manage Stories</h1>
          <p className="text-gray-500 mt-1">View, edit, and organize all your stories here.</p>
        </div>
        <Link to="/admin/story/new" className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-colors flex items-center gap-2">
          <Plus size={20} /> Add New Story
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="p-4 font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Story Title</th>
                <th className="p-4 font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Category</th>
                <th className="p-4 font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Views</th>
                <th className="p-4 font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Status</th>
                <th className="p-4 font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {stories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">No stories found. Create one to get started!</td>
                </tr>
              ) : stories.map(s => {
                const cat = categories.find(c => c.id === s.categoryId);
                return (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{s.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{s.language === 'HI' ? 'Hindi' : 'English'} • {s.readTime || 5} min read</div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                         {cat?.name || 'Unknown'}
                       </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{s.views || 0}</td>
                    <td className="p-4">
                      {s.isPublished ? 
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Published</span> : 
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Draft</span>
                      }
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => navigate(`/admin/story/edit/${s.id}`)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit Story">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(s.id, s.title)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Story">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
