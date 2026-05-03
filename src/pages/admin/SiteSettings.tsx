import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { logAdminAction } from '../../lib/auditLogger';

export default function SiteSettings() {
  const [form, setForm] = useState({
    heroImageUrl: '',
    adProvider: 'none',
    adsenseHeader: '',
    adsenseInContent: '',
    adsenseSidebar: '',
    adsenseFooter: '',
    adsterraHeader: '',
    adsterraInContent: '',
    adsterraSidebar: '',
    adsterraFooter: '',
    socialYoutube: '',
    socialInstagram: '',
    socialTelegram: '',
    socialFacebook: '',
    socialYoutubeEnabled: false,
    socialInstagramEnabled: false,
    socialTelegramEnabled: false,
    socialFacebookEnabled: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'settings', 'global')).then(d => {
      if (d.exists()) {
        setForm(d.data() as any);
      }
      setLoading(false);
    }).catch(e => {
      handleFirestoreError(e, OperationType.GET, 'settings/global');
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        ...form,
        updatedAt: Date.now(),
        createdAt: form['createdAt' as keyof typeof form] || Date.now()
      }, { merge: true });
      await logAdminAction('UPDATE', 'Settings', 'global', 'Updated global site settings');
      alert('Settings saved successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/global');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl max-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
      <h1 className="text-3xl font-bold mb-6 dark:text-gray-100">Site Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <section>
          <h2 className="text-xl font-bold dark:text-white border-b dark:border-gray-700 pb-2 mb-4">Homepage Settings</h2>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium dark:text-gray-300">Hero Image URL</label>
            <input type="url" placeholder="https://..." value={form.heroImageUrl} onChange={e => setForm({...form, heroImageUrl: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full" />
            <p className="text-xs text-gray-500">Recommended size: 1200x500. Format: JPG/PNG.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold dark:text-white border-b dark:border-gray-700 pb-2 mb-4">Social Media Links</h2>
          <div className="grid grid-cols-1 gap-4">
            
            <div className="flex items-center gap-4">
              <input type="checkbox" checked={form.socialYoutubeEnabled} onChange={e => setForm({...form, socialYoutubeEnabled: e.target.checked})} className="w-5 h-5" />
              <input type="url" placeholder="YouTube URL" value={form.socialYoutube} onChange={e => setForm({...form, socialYoutube: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 flex-1" />
            </div>

            <div className="flex items-center gap-4">
              <input type="checkbox" checked={form.socialInstagramEnabled} onChange={e => setForm({...form, socialInstagramEnabled: e.target.checked})} className="w-5 h-5" />
              <input type="url" placeholder="Instagram URL" value={form.socialInstagram} onChange={e => setForm({...form, socialInstagram: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 flex-1" />
            </div>

            <div className="flex items-center gap-4">
              <input type="checkbox" checked={form.socialTelegramEnabled} onChange={e => setForm({...form, socialTelegramEnabled: e.target.checked})} className="w-5 h-5" />
              <input type="url" placeholder="Telegram URL" value={form.socialTelegram} onChange={e => setForm({...form, socialTelegram: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 flex-1" />
            </div>

            <div className="flex items-center gap-4">
              <input type="checkbox" checked={form.socialFacebookEnabled} onChange={e => setForm({...form, socialFacebookEnabled: e.target.checked})} className="w-5 h-5" />
              <input type="url" placeholder="Facebook URL" value={form.socialFacebook} onChange={e => setForm({...form, socialFacebook: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 flex-1" />
            </div>
            
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold dark:text-white border-b dark:border-gray-700 pb-2 mb-4">Monetization Configuration</h2>
          
          <div className="mb-6">
            <label className="text-sm font-medium dark:text-gray-300 block mb-2">Primary Ad Network</label>
            <select 
              value={form.adProvider} 
              onChange={e => setForm({...form, adProvider: e.target.value as any})}
              className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full md:w-1/2"
            >
              <option value="none">None (Ads Disabled)</option>
              <option value="adsense">Google AdSense</option>
              <option value="adsterra">Adsterra</option>
            </select>
          </div>

          {form.adProvider === 'adsense' && (
            <div className="grid grid-cols-1 gap-4 text-sm font-mono mt-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 font-sans">Google AdSense Codes</h3>
              <div>
                <label className="text-sm font-medium dark:text-gray-300 font-sans mb-1 block">Header Ad Code</label>
                <textarea placeholder="<script>...</script>" value={form.adsenseHeader} onChange={e => setForm({...form, adsenseHeader: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full h-24"></textarea>
              </div>
              <div>
                <label className="text-sm font-medium dark:text-gray-300 font-sans mb-1 block">In-Content Ad Code</label>
                <textarea placeholder="<script>...</script>" value={form.adsenseInContent} onChange={e => setForm({...form, adsenseInContent: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full h-24"></textarea>
              </div>
              <div>
                <label className="text-sm font-medium dark:text-gray-300 font-sans mb-1 block">Sidebar Ad Code</label>
                <textarea placeholder="<script>...</script>" value={form.adsenseSidebar} onChange={e => setForm({...form, adsenseSidebar: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full h-24"></textarea>
              </div>
              <div>
                <label className="text-sm font-medium dark:text-gray-300 font-sans mb-1 block">Footer Ad Code</label>
                <textarea placeholder="<script>...</script>" value={form.adsenseFooter} onChange={e => setForm({...form, adsenseFooter: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full h-24"></textarea>
              </div>
            </div>
          )}

          {form.adProvider === 'adsterra' && (
            <div className="grid grid-cols-1 gap-4 text-sm font-mono mt-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 font-sans">Adsterra Script Snippets</h3>
              <div>
                <label className="text-sm font-medium dark:text-gray-300 font-sans mb-1 block">Header Native/Banner Ad</label>
                <textarea placeholder="<script>...</script>" value={form.adsterraHeader} onChange={e => setForm({...form, adsterraHeader: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full h-24"></textarea>
              </div>
              <div>
                <label className="text-sm font-medium dark:text-gray-300 font-sans mb-1 block">In-Content Ad (e.g. Social Bar or Banner)</label>
                <textarea placeholder="<script>...</script>" value={form.adsterraInContent} onChange={e => setForm({...form, adsterraInContent: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full h-24"></textarea>
              </div>
              <div>
                <label className="text-sm font-medium dark:text-gray-300 font-sans mb-1 block">Sidebar Ad</label>
                <textarea placeholder="<script>...</script>" value={form.adsterraSidebar} onChange={e => setForm({...form, adsterraSidebar: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full h-24"></textarea>
              </div>
              <div>
                <label className="text-sm font-medium dark:text-gray-300 font-sans mb-1 block">Footer Ad</label>
                <textarea placeholder="<script>...</script>" value={form.adsterraFooter} onChange={e => setForm({...form, adsterraFooter: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full h-24"></textarea>
              </div>
            </div>
          )}
        </section>

        <div className="pt-4 border-t dark:border-gray-700">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded font-bold text-lg">Save Settings</button>
        </div>

      </form>
    </div>
  );
}
