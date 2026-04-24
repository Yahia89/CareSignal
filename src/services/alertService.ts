import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Alert } from '../types';

const HOUSEHOLD_ID = 'household-1';

export const alertService = {
  async getAlerts(householdId: string): Promise<Alert[]> {
    const snap = await getDocs(collection(db, 'households', householdId, 'alerts'));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Alert))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async createAlert(householdId: string, alertData: Omit<Alert, 'id'>): Promise<string> {
    const docRef = await addDoc(
      collection(db, 'households', householdId, 'alerts'),
      alertData,
    );
    return docRef.id;
  },

  listenToAlerts(householdId: string, callback: (alerts: Alert[]) => void): () => void {
    return onSnapshot(
      collection(db, 'households', householdId, 'alerts'),
      (snap) => {
        const alerts = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Alert))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        callback(alerts);
      },
      console.error,
    );
  },

  async markAlertRead(alertId: string): Promise<void> {
    await updateDoc(doc(db, 'households', HOUSEHOLD_ID, 'alerts', alertId), { read: true });
  },

  async markAllRead(householdId: string): Promise<void> {
    const snap = await getDocs(collection(db, 'households', householdId, 'alerts'));
    await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
  },
};
