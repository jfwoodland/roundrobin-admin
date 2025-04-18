// src/components/AccountCreationPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
} from "@mui/material";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AccountCreationPage = ({ onAccountCreated }) => {
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!accountName.trim()) {
      setError("Account name is required.");
      setSubmitting(false);
      return;
    }

    try {
      // 1. Create account document
      const accountRef = await addDoc(collection(db, "accounts"), {
        name: accountName.trim(),
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
      });

      // 2. Set user profile with accountId
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        accountId: accountRef.id,
        role: "admin",
        email: auth.currentUser.email,
      });

      // 3. Callback to App.js
      onAccountCreated?.();

      // 4. Navigate to main dashboard
      window.location.href = "/";
    } catch (err) {
      console.error("Error creating account:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Create Your Account
        </Typography>
        <Typography variant="body2" gutterBottom>
          You don’t belong to an account yet. Please create one to get started.
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box
          component="form"
          onSubmit={handleCreateAccount}
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
        >
          <TextField
            label="Account Name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Account"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AccountCreationPage;
