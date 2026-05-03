import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquareHeart, X, Star, Send } from 'lucide-react';
import { setDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const feedbackId = 'fb_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      await setDoc(doc(db, 'feedbacks', feedbackId), {
        rating,
        message: message.trim(),
        createdAt: Date.now()
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => {
          setIsSuccess(false);
          setRating(0);
          setMessage('');
        }, 500);
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'feedbacks');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center group"
          title="Rate our site"
        >
          <MessageSquareHeart size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-6 left-6 z-[101] w-[calc(100vw-3rem)] sm:w-[400px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              {isSuccess ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquareHeart size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Thank you!</h3>
                  <p className="text-gray-500 dark:text-gray-400">Your feedback helps us make StoryBlogger even more magical.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 font-poppins">Rate StoryBlogger</h3>
                    <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full p-2 transition-colors">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 text-center mb-4">How much do you love the stories?</label>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star 
                              size={36} 
                              className={`transition-colors ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-800'}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Tell us more (Optional)</label>
                      <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What do you like? What can we improve?"
                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-pink-500 resize-none h-24 dark:text-white transition-all outline-none"
                        maxLength={2000}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting || rating === 0}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Sending...' : (
                        <>
                          Send Feedback <Send size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
