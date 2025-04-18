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
import SignupPage from "./SignUpPage";

const App = () => {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setCheckingAccount(true);

        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const hasAccountId = userDoc.exists() && !!userDoc.data().accountId;
        setHasAccount(hasAccountId);
        setCheckingAccount(false);
      } else {
        setUser(null);
        setHasAccount(false);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth || (user && checkingAccount)) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            hasAccount ? (
              <AdminPanel />
            ) : (
              <Navigate to="/create-account" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/create-account"
        element={
          user && !hasAccount ? (
            <AccountCreationPage onAccountCreated={() => setHasAccount(true)} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="/reset-confirmation" element={<ResetConfirmation />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
