import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';

export function useStories(publishedOnly = true) {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = collection(db, 'stories');
    if (publishedOnly) {
      q = query(q, where('isPublished', '==', true), orderBy('createdAt', 'desc')) as any;
    } else {
      q = query(q, orderBy('createdAt', 'desc')) as any;
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStories(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'stories');
      setLoading(false);
    });

    return () => unsub();
  }, [publishedOnly]);

  return { stories, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { categories, loading };
}

export function useSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { settings, loading };
}
