import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect, Suspense, lazy } from 'react';
import { useStore } from './store/useStore';

// Layouts
import FrontendLayout from './components/layouts/FrontendLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Fallback loader
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
  </div>
);

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const StoryList = lazy(() => import('./pages/StoryList'));
const StoryDetail = lazy(() => import('./pages/StoryDetail'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const Disclaimer = lazy(() => import('./pages/legal/Disclaimer'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageStories = lazy(() => import('./pages/admin/ManageStories'));
const StoryEditor = lazy(() => import('./pages/admin/StoryEditor'));
const ManageCategories = lazy(() => import('./pages/admin/ManageCategories'));
const SiteSettings = lazy(() => import('./pages/admin/SiteSettings'));
const ManageFeedback = lazy(() => import('./pages/admin/ManageFeedback'));
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'));

function App() {
  const { theme } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
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
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/stories" element={<ManageStories />} />
              <Route path="/admin/story/new" element={<StoryEditor />} />
              <Route path="/admin/story/edit/:id" element={<StoryEditor />} />
              <Route path="/admin/categories" element={<ManageCategories />} />
              <Route path="/admin/settings" element={<SiteSettings />} />
              <Route path="/admin/feedbacks" element={<ManageFeedback />} />
              <Route path="/admin/logs" element={<AdminLogs />} />
            </Route>

            <Route element={<FrontendLayout />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
