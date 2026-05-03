import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { Star, Trash2 } from 'lucide-react';

interface FeedbackData {
  id: string;
  rating: number;
  message: string;
  createdAt: number;
}

export default function ManageFeedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const fbData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeedbackData[];
      setFeedbacks(fbData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'feedbacks');
    });

    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this feedback? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'feedbacks', id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `feedbacks/${id}`);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">User Feedback</h1>
          <p className="text-gray-500 mt-1">Review ratings and messages from your readers.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="flex -space-x-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={20} className={star <= Number(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"} />
            ))}
          </div>
          <div className="text-xl font-bold dark:text-white">{averageRating}</div>
          <div className="text-sm text-gray-500">({feedbacks.length} total)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbacks.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Star size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No feedback yet</h3>
            <p className="text-gray-500 mt-2">When users rate your site, you'll see their feedback here.</p>
          </div>
        ) : (
          feedbacks.map(fb => (
            <div key={fb.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col relative group">
              <button 
                onClick={() => handleDelete(fb.id)} 
                className="absolute top-4 right-4 p-2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Delete Feedback"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                   <Star key={star} size={16} className={star <= fb.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 dark:text-gray-700"} />
                ))}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 flex-1 leading-relaxed whitespace-pre-wrap text-sm">
                {fb.message ? `"${fb.message}"` : <span className="text-gray-400 italic">No message provided</span>}
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                {new Date(fb.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
