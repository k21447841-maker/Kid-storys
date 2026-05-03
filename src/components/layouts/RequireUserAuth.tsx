import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import UserLogin from '../../pages/UserLogin';

export default function RequireUserAuth() {
  const [user, setUser] = useState<any>(undefined); // undefined means loading

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pink-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return <UserLogin onLogin={() => {}} />;
  }

  return <Outlet />;
}
