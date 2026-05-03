import { useState } from 'react';
import { useCategories } from '../../lib/useData';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { logAdminAction } from '../../lib/auditLogger';
import slugify from 'slugify';

export default function ManageCategories() {
  const { categories, loading } = useCategories();
  const [form, setForm] = useState({ id: '', name: '', theme: 'Default', imageUrl: '', isEnabled: true });
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(form.name, { lower: true });
    
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'categories', form.id), {
          name: form.name,
          slug,
          theme: form.theme,
          imageUrl: form.imageUrl,
          isEnabled: form.isEnabled,
          updatedAt: Date.now()
        });
        await logAdminAction('UPDATE', 'Category', form.id, `Updated category: ${form.name}`);
      } else {
        const newDoc = await addDoc(collection(db, 'categories'), {
          name: form.name,
          slug,
          theme: form.theme,
          imageUrl: form.imageUrl,
          isEnabled: form.isEnabled,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        await logAdminAction('CREATE', 'Category', newDoc.id, `Created category: ${form.name}`);
      }
      setForm({ id: '', name: '', theme: 'Default', imageUrl: '', isEnabled: true });
      setIsEditing(false);
    } catch (e) {
      handleFirestoreError(e, isEditing ? OperationType.UPDATE : OperationType.CREATE, 'categories');
    }
  };

  const handleEdit = (c: any) => {
    setForm(c);
    setIsEditing(true);
  };

  const handleDelete = async (id: string, name?: string) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        await logAdminAction('DELETE', 'Category', id, `Deleted category: ${name}`);
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, 'categories');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 dark:text-gray-100">Manage Categories</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 border dark:border-gray-700 p-6 rounded-xl bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4 dark:text-white">{isEditing ? 'Edit Category' : 'Add Category'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input required type="text" placeholder="Category Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <select value={form.theme} onChange={e => setForm({...form, theme: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <option value="Default">Default</option>
              <option value="Kids">Kids</option>
              <option value="Horror">Horror</option>
              <option value="Moral">Moral</option>
              <option value="Royal">Royal</option>
            </select>
            <input type="url" placeholder="Image URL (optional)" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <label className="flex items-center gap-2 dark:text-white text-sm">
              <input type="checkbox" checked={form.isEnabled} onChange={e => setForm({...form, isEnabled: e.target.checked})} />
              Enabled
            </label>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-medium">{isEditing ? 'Update' : 'Add'}</button>
              {isEditing && <button type="button" onClick={() => { setIsEditing(false); setForm({ id: '', name: '', theme: 'Default', imageUrl: '', isEnabled: true }); }} className="bg-gray-400 text-white px-4 py-2 rounded font-medium">Cancel</button>}
            </div>
          </form>
        </div>

        <div className="md:col-span-2">
          <table className="w-full text-left border-collapse bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-4 dark:text-gray-200 border-b dark:border-gray-700">Name</th>
                <th className="p-4 dark:text-gray-200 border-b dark:border-gray-700">Theme</th>
                <th className="p-4 dark:text-gray-200 border-b dark:border-gray-700">Status</th>
                <th className="p-4 dark:text-gray-200 border-b dark:border-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-b dark:border-gray-700">
                  <td className="p-4 dark:text-gray-300">{c.name}</td>
                  <td className="p-4 dark:text-gray-300">{c.theme}</td>
                  <td className="p-4 dark:text-gray-300">{c.isEnabled ? <span className="text-green-500">Enabled</span> : <span className="text-red-500">Disabled</span>}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(c)} className="text-blue-500">Edit</button>
                    <button onClick={() => handleDelete(c.id, c.name)} className="text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
