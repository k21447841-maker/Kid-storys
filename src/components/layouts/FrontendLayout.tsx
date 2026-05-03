import { Outlet } from 'react-router-dom';
import Header from '../frontend/Header';
import Footer from '../frontend/Footer';
import { useSettings } from '../../lib/useData';

export default function FrontendLayout() {
  const { settings } = useSettings();

  return (
    <div className="flex flex-col min-h-screen bg-pink-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      {settings?.adsenseHeader && (
        <div className="w-full bg-gray-100 dark:bg-gray-800 text-center py-4 my-4" dangerouslySetInnerHTML={{ __html: settings.adsenseHeader }} />
      )}

      <main className="flex-grow">
        <Outlet />
      </main>

      {settings?.adsenseFooter && (
        <div className="w-full bg-gray-100 dark:bg-gray-800 text-center py-4 my-4" dangerouslySetInnerHTML={{ __html: settings.adsenseFooter }} />
      )}
      
      <Footer />
    </div>
  );
}
