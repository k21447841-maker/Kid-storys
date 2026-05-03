import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      // Slight delay to ensure the DOM element is rendered
      const timer = setTimeout(() => {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            if (scannerRef.current?.isScanning) {
              scannerRef.current.stop().then(() => {
                onClose();
                try {
                  const url = new URL(decodedText);
                  if (url.origin === window.location.origin) {
                    navigate(url.pathname + url.search + url.hash);
                  } else {
                    window.location.href = decodedText;
                  }
                } catch (e) {
                  if (decodedText.startsWith('/')) {
                    navigate(decodedText);
                  } else {
                    window.open(decodedText, '_blank', 'noopener,noreferrer');
                  }
                }
              }).catch(console.error);
            }
          },
          (errorMessage) => {
            // ignore scan errors (they happen every frame a QR code is not found)
          }
        ).catch((err) => {
          setError('Could not start camera. Please allow camera permissions.');
          console.error(err);
        });
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current?.isScanning) {
          scannerRef.current.stop().catch(console.error);
        }
      };
    }
  }, [isOpen, navigate, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden w-full max-w-md"
          >
            <div className="p-6 text-center">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 flex items-center gap-2">
                  <QrCode size={24} className="text-pink-500" />
                  Scan QR Code
                </h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full p-2 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-4">
                  {error}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Point your camera at a StoryBlogger QR code to instantly navigate to it.
                </p>
              )}

              <div className="rounded-2xl overflow-hidden bg-black aspect-square max-w-[300px] mx-auto flex items-center justify-center relative">
                <div id="qr-reader" className="w-full" style={{ border: 'none' }}></div>
                {!error && (
                  <div className="absolute inset-0 border-2 border-pink-500/50 rounded-2xl pointer-events-none z-10 m-4"></div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
