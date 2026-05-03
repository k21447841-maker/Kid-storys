import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategories } from '../../lib/useData';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { logAdminAction } from '../../lib/auditLogger';
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
        await logAdminAction('UPDATE', 'Story', id, `Updated story: ${form.title}`);
      } else {
        const newDoc = await addDoc(collection(db, 'stories'), {
          ...data,
          views: 0,
          createdAt: Date.now()
        });
        await logAdminAction('CREATE', 'Story', newDoc.id, `Created story: ${form.title}`);
      }
      navigate('/admin/stories');
    } catch (err) {
      handleFirestoreError(err, id ? OperationType.UPDATE : OperationType.CREATE, 'stories');
    }
  };

  if (loading || catLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{id ? 'Edit Story' : 'New Story'}</h1>
        <div className="flex gap-4 border-gray-200 dark:border-gray-700">
          <button type="button" onClick={() => navigate('/admin/stories')} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg shadow-sm font-semibold transition-colors">Cancel</button>
          <button type="button" onClick={handleSubmit} className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-colors">{id ? 'Update Story' : 'Publish Story'}</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold dark:text-white mb-6">Basic Content</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Story Title</label>
                <input required type="text" placeholder="Enter a magical title..." value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Story Content (Markdown)</label>
                <textarea required placeholder="Once upon a time..." value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg dark:text-white h-[500px] focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all font-mono text-sm leading-relaxed"></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold dark:text-white mb-6">Advanced SEO Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Meta Title</label>
                <input type="text" placeholder="SEO optimized title..." value={form.metaTitle} onChange={e => setForm({...form, metaTitle: e.target.value})} className="w-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg dark:text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Meta Description</label>
                <textarea placeholder="Brief summary for search engines..." value={form.metaDescription} onChange={e => setForm({...form, metaDescription: e.target.value})} className="w-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg dark:text-white h-24 focus:ring-2 focus:ring-pink-500 outline-none transition-all"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Keywords</label>
                <input type="text" placeholder="kids, moral, animals..." value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} className="w-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg dark:text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold dark:text-white mb-4">Publishing</h2>
            <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500" />
              <div>
                <div className="font-semibold dark:text-white text-gray-900">Publish immediately</div>
                <div className="text-xs text-gray-500">Make story visible to everyone</div>
              </div>
            </label>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold dark:text-white mb-4">Story Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select required value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="w-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition-all">
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Language</label>
                <select value={form.language} onChange={e => setForm({...form, language: e.target.value})} className="w-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition-all">
                  <option value="EN">English</option>
                  <option value="HI">Hindi (हिंदी)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Read Time (minutes)</label>
                <input type="number" min="1" value={form.readTime} onChange={e => setForm({...form, readTime: Number(e.target.value)})} className="w-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition-all" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold dark:text-white mb-4">Media files</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Thumbnail URL (Grid View)</label>
                <input type="url" placeholder="https://..." value={form.thumbnailUrl} onChange={e => setForm({...form, thumbnailUrl: e.target.value})} className="w-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition-all" />
                {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="Thumbnail preview" className="mt-3 rounded-lg h-24 w-full object-cover shadow-sm bg-gray-100" referrerPolicy="no-referrer" />}
              </div>
              <div className="pt-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Banner URL (Story Header)</label>
                <input type="url" placeholder="https://..." value={form.bannerUrl} onChange={e => setForm({...form, bannerUrl: e.target.value})} className="w-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg dark:text-white outline-none focus:ring-2 focus:ring-pink-500 transition-all" />
                {form.bannerUrl && <img src={form.bannerUrl} alt="Banner preview" className="mt-3 rounded-lg h-24 w-full object-cover shadow-sm bg-gray-100" referrerPolicy="no-referrer" />}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
