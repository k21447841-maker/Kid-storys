import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategories } from '../../lib/useData';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import slugify from 'slugify';

export default function StoryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, loading: catLoading } = useCategories();
  const [loading, setLoading] = useState(!!id);
  
  const [form, setForm] = useState({
    title: '',
    categoryId: '',
    language: 'EN',
    bannerUrl: '',
    thumbnailUrl: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    readTime: 5,
    isPublished: false
  });

  useEffect(() => {
    if (id) {
      getDoc(doc(db, 'stories', id)).then(d => {
        if (d.exists()) {
          setForm(d.data() as any);
        }
        setLoading(false);
      }).catch(e => {
        handleFirestoreError(e, OperationType.GET, 'stories');
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) {
      alert("Please select a category");
      return;
    }
    const cat = categories.find(c => c.id === form.categoryId);
    const slug = slugify(form.title, { lower: true });
    
    try {
      const data = {
        ...form,
        slug,
        theme: cat?.theme || 'Default',
        readTime: Number(form.readTime),
        updatedAt: Date.now()
      };

      if (id) {
        await updateDoc(doc(db, 'stories', id), data);
      } else {
        await addDoc(collection(db, 'stories'), {
          ...data,
          views: 0,
          createdAt: Date.now()
        });
      }
      navigate('/admin/stories');
    } catch (err) {
      handleFirestoreError(err, id ? OperationType.UPDATE : OperationType.CREATE, 'stories');
    }
  };

  if (loading || catLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
      <h1 className="text-3xl font-bold mb-6 dark:text-gray-100">{id ? 'Edit Story' : 'New Story'}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input required type="text" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full" />
          <select required value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full">
            <option value="" disabled>Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={form.language} onChange={e => setForm({...form, language: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full">
            <option value="EN">English</option>
            <option value="HI">Hindi</option>
          </select>
          <input type="number" placeholder="Read Time (mins)" value={form.readTime} onChange={e => setForm({...form, readTime: Number(e.target.value)})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full" />
          <input type="url" placeholder="Banner Image URL" value={form.bannerUrl} onChange={e => setForm({...form, bannerUrl: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full" />
          <input type="url" placeholder="Thumbnail Image URL" value={form.thumbnailUrl} onChange={e => setForm({...form, thumbnailUrl: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full" />
        </div>

        <textarea required placeholder="Story Content (Markdown supported)" value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="border p-4 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full h-96"></textarea>

        <h3 className="text-xl font-bold dark:text-white -mb-2 mt-4">SEO Tags</h3>
        <div className="grid grid-cols-1 gap-4">
          <input type="text" placeholder="Meta Title" value={form.metaTitle} onChange={e => setForm({...form, metaTitle: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full" />
          <textarea placeholder="Meta Description" value={form.metaDescription} onChange={e => setForm({...form, metaDescription: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full"></textarea>
          <input type="text" placeholder="Keywords (comma separated)" value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full" />
        </div>

        <label className="flex items-center gap-2 dark:text-white text-lg mt-4 cursor-pointer">
          <input type="checkbox" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} className="w-5 h-5" />
          Publish Story
        </label>

        <div className="flex gap-4 border-t dark:border-gray-700 pt-6 mt-4">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded font-bold text-lg">{id ? 'Update Story' : 'Save Story'}</button>
          <button type="button" onClick={() => navigate('/admin/stories')} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-8 py-3 rounded font-bold text-lg">Cancel</button>
        </div>
      </form>
    </div>
  );
}
