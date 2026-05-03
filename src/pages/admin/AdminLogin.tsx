import { useState } from 'react';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Admin Login</h2>
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        <input className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="w-full mb-6 p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700" type="submit">Login</button>
      </form>
    </div>
  );
}
