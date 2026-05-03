import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: 'EN' | 'HI' | 'ALL';
  setLanguage: (lang: 'EN' | 'HI' | 'ALL') => void;
  bookmarks: string[];
  toggleBookmark: (storyId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      language: 'ALL',
      setLanguage: (lang) => set({ language: lang }),
      bookmarks: [],
      toggleBookmark: (storyId) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(storyId)
            ? state.bookmarks.filter((id) => id !== storyId)
            : [...state.bookmarks, storyId],
        })),
    }),
    {
      name: 'story-blog-storage',
    }
  )
);
