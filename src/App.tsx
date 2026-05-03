import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase/config';
import { useStore } from './store/useStore';

// Layouts
import FrontendLayout from './components/layouts/FrontendLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Frontend Pages
import Home from './pages/Home';
import StoryList from './pages/StoryList';
import StoryDetail from './pages/StoryDetail';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Disclaimer from './pages/legal/Disclaimer';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManageStories from './pages/admin/ManageStories';
import StoryEditor from './pages/admin/StoryEditor';
import ManageCategories from './pages/admin/ManageCategories';
import SiteSettings from './pages/admin/SiteSettings';

function App() {
  const { theme } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-pink-50 dark:bg-gray-900">Loading...</div>;
  }

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Frontend Routes */}
          <Route element={<FrontendLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/stories" element={<StoryList />} />
            <Route path="/category/:slug" element={<StoryList />} />
            <Route path="/story/:slug" element={<StoryDetail />} />
            <Route path="/privacy-policy" element={<Privacy />} />
            <Route path="/terms-and-conditions" element={<Terms />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
          </Route>

          {/* Admin Auth */}
          <Route path="/admin/login" element={!user ? <AdminLogin /> : <Navigate to="/admin" />} />

          {/* Admin Routes */}
          <Route element={user ? <AdminLayout /> : <Navigate to="/admin/login" />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/stories" element={<ManageStories />} />
            <Route path="/admin/story/new" element={<StoryEditor />} />
            <Route path="/admin/story/edit/:id" element={<StoryEditor />} />
            <Route path="/admin/categories" element={<ManageCategories />} />
            <Route path="/admin/settings" element={<SiteSettings />} />
          </Route>

          <Route element={<FrontendLayout />}>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
