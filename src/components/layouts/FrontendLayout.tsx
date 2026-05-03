import { Outlet } from 'react-router-dom';
import Header from '../frontend/Header';
import Footer from '../frontend/Footer';
import FeedbackWidget from '../frontend/FeedbackWidget';
import AdSlot from '../frontend/AdSlot';
import { useSettings } from '../../lib/useData';

export default function FrontendLayout() {
  const { settings } = useSettings();

  const headerAd = settings?.adProvider === 'adsterra' ? settings.adsterraHeader : 
                   settings?.adProvider === 'adsense' ? settings.adsenseHeader : null;
  const footerAd = settings?.adProvider === 'adsterra' ? settings.adsterraFooter : 
                   settings?.adProvider === 'adsense' ? settings.adsenseFooter : null;

  return (
    <div className="flex flex-col min-h-screen bg-pink-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      {headerAd && (
        <div className="w-full bg-gray-100 dark:bg-gray-800 text-center py-2 border-b dark:border-gray-800">
          <AdSlot html={headerAd} />
        </div>
      )}

      <main className="flex-grow">
        <Outlet />
      </main>

      {footerAd && (
        <div className="w-full bg-gray-100 dark:bg-gray-800 text-center py-2 border-t dark:border-gray-800">
          <AdSlot html={footerAd} />
        </div>
      )}
      
      <Footer />
      <FeedbackWidget />
    </div>
  );
}
