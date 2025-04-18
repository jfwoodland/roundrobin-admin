// src/utils/getAccountId.js
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export const getAccountIdForCurrentUser = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  if (userDoc.exists()) {
    return userDoc.data().accountId;
  }

  return null;
};
