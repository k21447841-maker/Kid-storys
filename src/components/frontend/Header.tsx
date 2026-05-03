import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Moon, Sun, QrCode } from 'lucide-react';
import { useState, lazy, Suspense } from 'react';

const QRScannerModal = lazy(() => import('./QRScannerModal'));

export default function Header() {
  const { theme, toggleTheme, language, setLanguage } = useStore();
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md dark:bg-gray-900/80 sticky top-0 z-50 border-b border-pink-100 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 tracking-tight font-poppins">StoryBlogger</Link>
          <nav className="flex gap-4 items-center">
            <button onClick={() => setIsQRScannerOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors" aria-label="Scan QR Code" title="Scan QR Code">
              <QrCode size={20} />
            </button>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-gray-200 outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="ALL">All Languages</option>
              <option value="EN">English</option>
              <option value="HI">Hindi</option>
            </select>
            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-pink-400 font-medium transition-colors">Home</Link>
            <Link to="/stories" className="text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-pink-400 font-medium transition-colors">Stories</Link>
            <Link to="/admin" className="text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-pink-400 font-medium transition-colors">Admin</Link>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors" aria-label="Toggle dark mode">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>
        </div>
      </div>
      {isQRScannerOpen && (
        <Suspense fallback={<div className="hidden">Loading Scanner...</div>}>
          <QRScannerModal isOpen={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} />
        </Suspense>
      )}
    </header>
  );
}
