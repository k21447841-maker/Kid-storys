import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';

// Global cache for subscriptions
const globalCache: Record<string, { data: any, subscribers: Set<any>, unsubscribe?: () => void }> = {};

function useCachedSubscription(key: string, setupSubscription: (callback: (data: any) => void, errCallback: (err: any) => void) => () => void) {
  const [data, setData] = useState<any>(globalCache[key]?.data || null);
  const [loading, setLoading] = useState(!globalCache[key]?.data);

  useEffect(() => {
    if (!globalCache[key]) {
      globalCache[key] = { data: null, subscribers: new Set() };
    }
    
    globalCache[key].subscribers.add(setData);

    if (globalCache[key].data) {
      setData(globalCache[key].data);
      setLoading(false);
    }
    
    if (globalCache[key].subscribers.size === 1) {
      // First subscriber, start listening
      globalCache[key].unsubscribe = setupSubscription((newData) => {
        globalCache[key].data = newData;
        globalCache[key].subscribers.forEach(sub => sub(newData));
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }

    return () => {
      globalCache[key].subscribers.delete(setData);
      if (globalCache[key].subscribers.size === 0 && globalCache[key].unsubscribe) {
        // Unsubscribe from Firestore when last subscriber unmounts after a short delay
        // Delay prevents flashing during rapid navigation
        setTimeout(() => {
          if (globalCache[key] && globalCache[key].subscribers.size === 0 && globalCache[key].unsubscribe) {
             globalCache[key].unsubscribe!();
             delete globalCache[key];
          }
        }, 5000); 
      }
    };
  }, [key]);

  return { data, loading };
}

export function useStories(publishedOnly = true) {
  const cacheKey = `stories_${publishedOnly}`;
  const { data: stories, loading } = useCachedSubscription(cacheKey, (onData, onError) => {
    let q = collection(db, 'stories');
    if (publishedOnly) {
      q = query(q, where('isPublished', '==', true), orderBy('createdAt', 'desc')) as any;
    } else {
      q = query(q, orderBy('createdAt', 'desc')) as any;
    }

    return onSnapshot(q, (snapshot) => {
      onData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'stories');
      onError(error);
    });
  });

  return { stories: stories || [], loading };
}

export function useCategories() {
  const { data: categories, loading } = useCachedSubscription('categories', (onData, onError) => {
    const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      onData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
      onError(error);
    });
  });

  return { categories: categories || [], loading };
}

export function useSettings() {
  const { data: settings, loading } = useCachedSubscription('settings', (onData, onError) => {
    return onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      onData(docSnap.exists() ? docSnap.data() : null);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
      onError(error);
    });
  });

  return { settings, loading };
}

