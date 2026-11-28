import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query } from 'firebase/firestore';
import { MasterResume, TailoredResume } from '../types/resume';

// Recursively strip undefined fields so Firestore setDoc() never throws Unsupported field value: undefined
function sanitizeForFirestore<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (data !== null && typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }
  return data;
}

export const saveMasterResumeToFirestore = async (email: string, resume: MasterResume) => {
  const docRef = doc(db, 'users', email, 'data', 'masterResume');
  await setDoc(docRef, sanitizeForFirestore(resume));
};

export const loadMasterResumeFromFirestore = async (email: string): Promise<MasterResume | null> => {
  const docRef = doc(db, 'users', email, 'data', 'masterResume');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data() as MasterResume;
    console.log('Loaded resume from Firestore:', data);
    return data;
  }
  return null;
};

export const saveTailoredResumeToFirestore = async (email: string, resume: TailoredResume) => {
  const docRef = doc(db, 'users', email, 'history', resume.id);
  await setDoc(docRef, sanitizeForFirestore(resume));
};

export const loadTailoredHistoryFromFirestore = async (email: string): Promise<TailoredResume[]> => {
  const colRef = collection(db, 'users', email, 'history');
  const snap = await getDocs(query(colRef));
  return snap.docs.map(doc => doc.data() as TailoredResume);
};

export const deleteTailoredResumeFromFirestore = async (email: string, id: string) => {
  const docRef = doc(db, 'users', email, 'history', id);
  await deleteDoc(docRef);
};

export const saveMasterSnapshotToFirestore = async (email: string, snapshot: import('../types/resume').MasterSnapshot) => {
  try {
    const docRef = doc(db, 'users', email.toLowerCase(), 'masterSnapshots', snapshot.id);
    await setDoc(docRef, sanitizeForFirestore(snapshot));
  } catch (err) {
    console.warn('Failed to save snapshot to Firestore, storing in localStorage fallback:', err);
  }
  // Always update localStorage as immediate resilient fallback
  try {
    const localKey = `omnibase_snapshots_${email.toLowerCase()}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    const filtered = existing.filter((s: any) => s.id !== snapshot.id);
    localStorage.setItem(localKey, JSON.stringify([snapshot, ...filtered]));
  } catch (localErr) {
    console.warn('LocalStorage snapshot write failed:', localErr);
  }
};

export const loadMasterSnapshotsFromFirestore = async (email: string): Promise<import('../types/resume').MasterSnapshot[]> => {
  const snapshotsMap = new Map<string, import('../types/resume').MasterSnapshot>();

  // 1. Load from localStorage
  try {
    const localKey = `omnibase_snapshots_${email.toLowerCase()}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    if (Array.isArray(localData)) {
      localData.forEach(s => snapshotsMap.set(s.id, s));
    }
  } catch (e) {
    console.warn('LocalStorage snapshot read error:', e);
  }

  // 2. Load from Firestore
  try {
    const colRef = collection(db, 'users', email.toLowerCase(), 'masterSnapshots');
    const snap = await getDocs(query(colRef));
    snap.docs.forEach(d => {
      const s = d.data() as import('../types/resume').MasterSnapshot;
      snapshotsMap.set(s.id, s);
    });
  } catch (err) {
    console.warn('Firestore snapshot load failed, using local snapshots:', err);
  }

  return Array.from(snapshotsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const deleteMasterSnapshotFromFirestore = async (email: string, snapshotId: string) => {
  try {
    const docRef = doc(db, 'users', email.toLowerCase(), 'masterSnapshots', snapshotId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete snapshot error:', err);
  }
  try {
    const localKey = `omnibase_snapshots_${email.toLowerCase()}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    const filtered = existing.filter((s: any) => s.id !== snapshotId);
    localStorage.setItem(localKey, JSON.stringify(filtered));
  } catch (e) {
    console.warn('LocalStorage delete snapshot error:', e);
  }
};
