import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query } from 'firebase/firestore';
import { MasterResume, TailoredResume } from '../types/resume';

export const saveMasterResumeToFirestore = async (email: string, resume: MasterResume) => {
  const docRef = doc(db, 'users', email, 'data', 'masterResume');
  await setDoc(docRef, resume);
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
  await setDoc(docRef, resume);
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
