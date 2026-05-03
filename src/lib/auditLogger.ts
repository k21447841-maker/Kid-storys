import { collection, doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';

export const logAdminAction = async (action: string, entityType: string, entityId: string = '', details: string = '') => {
  try {
    const user = auth.currentUser;
    if (!user) return;
    
    const logId = 'log_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const docRef = doc(db, 'admin_logs', logId);
    
    await setDoc(docRef, {
      action,
      entityType,
      entityId,
      details,
      userId: user.uid,
      userEmail: user.email || '',
      createdAt: Date.now()
    });
  } catch (err) {
    console.error("Failed to log admin action", err);
    // We intentionally do not throw here to avoid breaking the main operation if logging fails
  }
};
