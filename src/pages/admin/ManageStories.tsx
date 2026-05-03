import { Link, useNavigate } from 'react-router-dom';
import { useStories, useCategories } from '../../lib/useData';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { doc, deleteDoc } from 'firebase/firestore';

export default function ManageStories() {
  const { stories, loading } = useStories(false);
  const { categories } = useCategories();
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (confirm('Delete this story?')) {
      try {
        await deleteDoc(doc(db, 'stories', id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, 'stories');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-gray-100">Manage Stories</h1>
        <Link to="/admin/story/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Story</Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-4 dark:text-gray-200 border-b dark:border-gray-700">Title</th>
              <th className="p-4 dark:text-gray-200 border-b dark:border-gray-700">Category</th>
              <th className="p-4 dark:text-gray-200 border-b dark:border-gray-700">Language</th>
              <th className="p-4 dark:text-gray-200 border-b dark:border-gray-700">Status</th>
              <th className="p-4 dark:text-gray-200 border-b dark:border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stories.map(s => {
              const cat = categories.find(c => c.id === s.categoryId);
              return (
                <tr key={s.id} className="border-b dark:border-gray-700">
                  <td className="p-4 dark:text-gray-300 font-medium">{s.title}</td>
                  <td className="p-4 dark:text-gray-300">{cat?.name || 'Unknown'}</td>
                  <td className="p-4 dark:text-gray-300">{s.language}</td>
                  <td className="p-4 dark:text-gray-300">{s.isPublished ? <span className="text-green-500">Published</span> : <span className="text-orange-500">Draft</span>}</td>
                  <td className="p-4 flex gap-4">
                    <button onClick={() => navigate(`/admin/story/edit/${s.id}`)} className="text-blue-500 hover:text-blue-600">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
