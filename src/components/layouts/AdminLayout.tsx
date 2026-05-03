import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, BookText, Tags, Settings, MessageSquareHeart, LogOut, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '../../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function AdminLayout() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      // Very strict check: User must be signed in to firebase AND have the ultra-secure local storage flag set
      const isUltraSecure = localStorage.getItem('adminSecureAuth') === 'true';
      if (user && isUltraSecure) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('adminSecureAuth');
    await signOut(auth);
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Stories', path: '/admin/stories', icon: <BookText size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <Tags size={20} /> },
    { name: 'Feedbacks', path: '/admin/feedbacks', icon: <MessageSquareHeart size={20} /> },
    { name: 'Audit Logs', path: '/admin/logs', icon: <ShieldAlert size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Decrypting session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <Link to="/" title="Go to website"><h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 font-poppins">StoryBlogger</h2></Link>
        </div>
        <div className="px-6 py-4">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">Management</div>
          <nav className="flex flex-col gap-2">
            {navItems.map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium ${isActive ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleLogout} className="flex flex-row items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
}
