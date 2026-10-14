import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Support environment variables with default fallback
const firebaseConfig = {
  apiKey: "AIzaSyBfIhnU22zg5SK1AMF1GyS9pTK4nPk1wqs",
  authDomain: "test-1997c.firebaseapp.com",
  projectId: "test-1997c",
  storageBucket: "test-1997c.firebasestorage.app",
  messagingSenderId: "117869401406",
  appId: "1:117869401406:web:ff6343784577a4fe3fc86f",
  measurementId: "G-HRGDQS3LP0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Use the project's default Firestore database unless a named database is explicitly configured.
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID?.trim();
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error("Firestore Error:", errInfo.operationType, errInfo.path);
  throw new Error(errInfo.error);
}


