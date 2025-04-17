// src/App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import AdminPanel from "./AdminPanel";
import LoginPage from "./LoginPage";
import AccountCreationPage from "./components/AccountCreationPage";
import ResetConfirmation from "./components/ResetConfirmation";

const App = () => {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        setHasAccount(userDoc.exists() && userDoc.data().accountId);
      } else {
        setUser(null);
        setHasAccount(false);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) return <div>Loading...</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            hasAccount ? (
              <AdminPanel />
            ) : (
              <Navigate to="/create-account" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/login"
        element={<LoginPage onLogin={() => setUser(auth.currentUser)} />}
      />
      <Route path="/create-account" element={<AccountCreationPage />} />
      <Route path="/reset-confirmation" element={<ResetConfirmation />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
