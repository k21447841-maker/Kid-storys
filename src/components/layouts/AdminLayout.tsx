import { Outlet, Link } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

export default function AdminLayout() {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
      <aside className="w-64 bg-white dark:bg-gray-900 shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Admin Panel</h2>
        </div>
        <nav className="mt-6 flex flex-col px-4 gap-2">
          <Link to="/admin" className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">Dashboard</Link>
          <Link to="/admin/stories" className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">Stories</Link>
          <Link to="/admin/categories" className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">Categories</Link>
          <Link to="/admin/settings" className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">Settings</Link>
          <button onClick={handleLogout} className="text-left mt-10 p-2 rounded hover:bg-red-200 dark:hover:bg-red-900 text-red-600 dark:text-red-400">Logout</button>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
