import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { Activity, ShieldAlert, FileText, Settings, Tags } from 'lucide-react';

interface AdminLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  userId: string;
  userEmail: string;
  createdAt: number;
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'admin_logs'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminLog[];
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'admin_logs');
    });

    return () => unsub();
  }, []);

  if (loading) return <div>Loading...</div>;

  const getIcon = (entityType: string) => {
    switch (entityType) {
      case 'Story': return <FileText size={18} className="text-blue-500" />;
      case 'Category': return <Tags size={18} className="text-pink-500" />;
      case 'Settings': return <Settings size={18} className="text-gray-500" />;
      default: return <Activity size={18} className="text-purple-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <ShieldAlert size={32} className="text-pink-500" /> Administrative Logs
          </h1>
          <p className="text-gray-500 mt-1">Audit trail of significant actions performed by administrators.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="p-4 font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Timestamp</th>
                <th className="p-4 font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Administrator</th>
                <th className="p-4 font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Action</th>
                <th className="p-4 font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">No admin logs found.</td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{log.userEmail}</div>
                    <div className="text-xs text-gray-500 font-mono">{log.userId}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {getIcon(log.entityType)} {log.entityType}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900 dark:text-gray-200">{log.details}</div>
                    {log.entityId && <div className="text-xs text-gray-500 font-mono mt-1">ID: {log.entityId}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
